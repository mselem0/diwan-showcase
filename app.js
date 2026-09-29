/* مِشكاة — محرك إلقاء الشعر العربي
   Zero-build, live AlDiwan API showcase. Focus: YouTube recitations.
   ──────────────────────────────────────────────────────────────── */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const esc = (v) => {
  const d = document.createElement('div');
  d.textContent = v == null ? '' : String(v);
  return d.innerHTML;
};

const undiacritize = (s) =>
  (s || '').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');

/* ══════════════════════════════════════════════════════
   API CLIENT
   ══════════════════════════════════════════════════════ */
class AlDiwanAPI {
  constructor(onTrace) {
    this.base = 'https://api.aldiwan.net/api/v1';
    // Obfuscated default key — replaced when user sets their own
    const p = ['aldiwan', 'live', 'uKwv5xB', 'vdhfB6mcch7ER7QkRRkIop1LX0aSTjnxHGw'];
    this.key = sessionStorage.getItem('mishkat_key') || p.join('_');
    this.onTrace = onTrace;
    this.cache = new Map();
  }

  configure(base, key) {
    this.base = base.replace(/\/$/, '');
    this.key = key.trim();
    sessionStorage.setItem('mishkat_key', this.key);
    this.cache.clear();
  }

  disconnect() {
    this.key = '';
    sessionStorage.removeItem('mishkat_key');
    this.cache.clear();
  }

  async get(path, { cache = true, ttl = 120000 } = {}) {
    if (!this.key) throw new Error('أدخل مفتاح API للاتصال.');
    const url = this.base + path;
    const hit = this.cache.get(url);
    if (cache && hit && hit.until > Date.now()) return hit.value;

    const started = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.key}`,
        },
        signal: controller.signal,
      });

      const ms = Math.round(performance.now() - started);
      this.onTrace({
        path,
        status: response.status,
        ms,
        remaining:
          response.headers.get('X-RateLimit-Remaining') ||
          response.headers.get('X-Quota-Remaining') ||
          '—',
      });

      let body = {};
      try { body = await response.json(); } catch (_) {}

      if (!response.ok) {
        throw new Error(body?.error?.message || `فشل الطلب (${response.status})`);
      }

      const value = {
        body,
        data: body.data,
        meta: body.meta || {},
        links: body.links || {},
      };
      if (cache) this.cache.set(url, { value, until: Date.now() + ttl });
      return value;
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('انتهت مهلة الاتصال.');
      if (e instanceof TypeError) throw new Error('تعذّر الاتصال. راجع CORS والنطاق المسموح.');
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }
}

/* ══════════════════════════════════════════════════════
   MISHKAT APP
   ══════════════════════════════════════════════════════ */
class Mishkat {
  constructor() {
    this.api = new AlDiwanAPI((t) => this.trace(t));
    this.state = {
      poem: null,
      diacritics: true,
      font: 1,
      page: 1,
      lastPage: 1,
      currentQuery: '',
    };
    this.searchTimer = null;
    this.toastTimer = null;
    this.bind();
    if (this.api.key) this.boot();
    else setTimeout(() => this.openSettings(), 250);
  }

  /* ── BINDING ─────────────────────────────────────── */
  bind() {
    // Settings
    $('[data-open-settings]').onclick = () => this.openSettings();
    $('[data-settings] [data-connect]').onclick = () => this.connect();
    $('[data-disconnect]').onclick = () => this.disconnect();

    // Live search
    $('[data-search]').oninput = (e) => {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.state.page = 1;
        this.state.currentQuery = e.target.value;
        this.loadPoems();
      }, 380);
    };

    // Filters
    $$('[data-filter-style],[data-filter-era],[data-filter-meter]').forEach((el) => {
      el.onchange = () => {
        this.state.page = 1;
        this.loadPoems();
      };
    });

    // Pagination
    $('[data-prev]').onclick = () => {
      if (this.state.page > 1) {
        this.state.page--;
        this.loadPoems();
      }
    };
    $('[data-next]').onclick = () => {
      if (this.state.page < this.state.lastPage) {
        this.state.page++;
        this.loadPoems();
      }
    };

    // Poem reader tools
    $('[data-font-up]').onclick = () => this.adjustFont(0.1);
    $('[data-font-down]').onclick = () => this.adjustFont(-0.1);
    $('[data-toggle-diacritics]').onclick = () => this.toggleDiacritics();
    $('[data-copy]').onclick = () => this.copyPoem();

    // API Console
    $('[data-console-toggle]').onclick = () =>
      $('[data-api-console]').classList.toggle('open');

    // Keyboard shortcut: ⌘K focuses search
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        $('[data-search]').focus();
        $('[data-search]').select();
      }
    });
  }

  /* ── BOOT ────────────────────────────────────────── */
  async boot() {
    document.body.classList.add('connected');
    $('[data-status]').textContent = 'متصل';
    try {
      await this.loadTaxonomies();
      await this.loadPoems();
    } catch (e) {
      this.offline(e.message);
    }
  }

  /* ── TAXONOMIES ──────────────────────────────────── */
  async loadTaxonomies() {
    const [eras, meters] = await Promise.all([
      this.api.get('/eras', { ttl: 600000 }),
      this.api.get('/meters', { ttl: 600000 }),
    ]);
    this.fillSelect('[data-filter-era]', eras.data || [], 'id', 'name');
    this.fillSelect('[data-filter-meter]', meters.data || [], 'name', 'name');
  }

  fillSelect(selector, items, value, label) {
    const s = $(selector);
    const first = s.options[0];
    s.innerHTML = '';
    s.append(first);
    items.forEach((x) => {
      const o = document.createElement('option');
      o.value = x[value] ?? '';
      o.textContent = x[label] ?? x.name ?? '';
      s.append(o);
    });
  }

  /* ── LOAD POEMS (Search or Browse) ──────────────── */
  buildQuery() {
    const q = this.state.currentQuery.trim();
    const pairs = {
      poem_style: $('[data-filter-style]').value || undefined,
      era_id: $('[data-filter-era]').value || undefined,
      meter: $('[data-filter-meter]').value || undefined,
      page: this.state.page,
      per_page: 15,
    };
    return new URLSearchParams(
      Object.entries(pairs).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
  }

  async loadPoems() {
    const list = $('[data-results-list]');
    list.innerHTML = '<i class="skeleton"></i>'.repeat(6);

    const q = this.state.currentQuery.trim();

    try {
      let items = [], meta = {};

      if (q.length >= 2) {
        // Search mode
        const res = await this.api.get(
          `/search?q=${encodeURIComponent(q)}&type=poems&per_page=15`,
          { cache: false }
        );
        items = res.data?.poems || [];
        meta = { current_page: 1, last_page: 1, total: items.length };
      } else {
        // Browse mode
        const res = await this.api.get('/poems?' + this.buildQuery(), { cache: false });
        items = res.data || [];
        meta = res.meta || {};
      }

      this.state.lastPage = meta.last_page || 1;
      $('[data-page]').textContent = `${meta.current_page || this.state.page} / ${this.state.lastPage}`;

      this.renderResults(items);
    } catch (e) {
      list.innerHTML = `<p class="error-msg">${esc(e.message)}</p>`;
    }
  }

  /* ── RENDER RESULTS ──────────────────────────────── */
  renderResults(items) {
    const list = $('[data-results-list]');

    if (!items.length) {
      list.innerHTML = `<p class="empty-msg">لا توجد نتائج.<br>جرّب مصطلحًا آخر.</p>`;
      return;
    }

    list.innerHTML = items
      .map(
        (p) => `
      <button class="result-card" data-poem="${p.id}">
        <span class="result-style">${this.styleName(p.poem_style)}</span>
        <strong class="result-title">${esc(p.title)}</strong>
        <span class="result-poet">${esc(p.poet?.name || '')}</span>
        <span class="result-meta">${[p.meter, p.era?.name].filter(Boolean).map(esc).join(' · ')}</span>
        <span class="play-badge">▶ استمع للإلقاء</span>
      </button>`
      )
      .join('');

    $$('[data-poem]', list).forEach(
      (b) => (b.onclick = () => this.openPoem(b.dataset.poem))
    );
  }

  /* ── OPEN POEM ───────────────────────────────────── */
  async openPoem(id) {
    // Highlight active card
    $$('[data-poem]').forEach((b) =>
      b.classList.toggle('active', b.dataset.poem == id)
    );

    try {
      const { data: p } = await this.api.get(`/poems/${id}`);
      this.state.poem = p;
      this.state.diacritics = true;
      this.state.font = 1;

      // Fill poem header
      $('[data-poem-style-badge]').textContent = this.styleName(p.poem_style);
      $('[data-poem-title]').textContent = p.title;
      $('[data-poem-poet]').textContent = p.poet?.name || '';
      $('[data-poem-era]').textContent = p.era?.name || '';
      $('[data-poem-meter]').textContent = p.meter || '';

      // Attribution
      const a = $('[data-attribution]');
      a.href = p.attribution?.url || p.canonical_url || '#';
      a.textContent = p.attribution?.text || 'المصدر: الديوان';

      // Toggle diacritics button reset
      $('[data-toggle-diacritics]').textContent = 'بلا تشكيل';

      // Render
      this.renderText();
      $('[data-poem-view]').hidden = false;

      // Scroll viewer to top (mobile: scroll page)
      const viewer = $('.viewer-panel');
      if (viewer) viewer.scrollTop = 0;

      // Load recitation (YouTube)
      this.loadRecitation(p.id);
    } catch (e) {
      this.toast(e.message);
    }
  }

  /* ── LOAD RECITATION ─────────────────────────────── */
  async loadRecitation(poemId) {
    const frame = $('[data-player-frame]');
    const placeholder = $('[data-player-placeholder]');
    const fallback = $('[data-player-fallback]');

    // Reset — show loading state
    frame.hidden = true;
    fallback.hidden = true;
    placeholder.hidden = false;
    placeholder.querySelector('.placeholder-inner').innerHTML = `
      <div class="player-loading">
        <div class="loading-ring"></div>
        <span>جاري البحث عن إلقاء…</span>
      </div>`;

    // Build YouTube search query (fallback always available)
    const poem = this.state.poem;
    const ytSearchQuery = encodeURIComponent(
      `${undiacritize(poem.title)} ${undiacritize(poem.poet?.name || '')} إلقاء قصيدة`
    );
    const ytSearchEmbed = `https://www.youtube.com/embed?listType=search&list=${ytSearchQuery}&rel=0`;

    const showYouTubeSearch = () => {
      placeholder.hidden = true;
      fallback.hidden = true;
      frame.innerHTML = `<iframe
        src="${ytSearchEmbed}"
        title="نتائج إلقاء: ${esc(poem.title)}"
        allow="encrypted-media; picture-in-picture"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin">
      </iframe>`;
      frame.hidden = false;
    };

    try {
      const { data } = await this.api.get(
        `/private/poems/${poemId}/recitation`,
        { cache: false }
      );

      if (this.state.poem?.id !== Number(poemId)) return;

      if (data?.available) {
        // ✅ Cached matched recitation — embed directly (autoplay)
        placeholder.hidden = true;
        fallback.hidden = true;
        frame.innerHTML = `<iframe
          src="${esc(data.embed_url)}?rel=0&modestbranding=1&playsinline=1"
          title="${esc(data.title || 'إلقاء القصيدة')}"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin">
        </iframe>`;
        frame.hidden = false;
      } else {
        // ❌ No cached recitation — embed elegant fallback UI
        placeholder.hidden = true;
        frame.hidden = true;
        const watchUrl = data?.watch_url || `https://www.youtube.com/results?search_query=${encodeURIComponent(poem.title + ' ' + (poem.poet?.name || ''))}`;
        fallback.innerHTML = `
          <div class="no-recitation">
            <svg style="width:48px;height:48px;color:var(--muted);margin-bottom:12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
            <p style="font-size:14px;color:var(--ink);margin-bottom:4px;font-weight:600;">لم نعثر على إلقاء مطابق</p>
            <p style="font-size:12px;color:var(--muted);margin-bottom:20px;">قد يكون هناك إلقاء لهذه القصيدة لم تتم فهرسته بعد.</p>
            <a href="${esc(watchUrl)}" target="_blank" rel="noopener" class="yt-search-btn">
              ابحث في YouTube ↗
            </a>
          </div>`;
        fallback.hidden = false;
      }
    } catch (_) {
      if (this.state.poem?.id === Number(poemId)) showYouTubeSearch();
    }
  }

  /* ── RENDER TEXT ─────────────────────────────────── */
  renderText() {
    const p = this.state.poem;
    const box = $('[data-poem-lines]');
    const text = this.state.diacritics ? p.text : undiacritize(p.text);
    const lines = text.split(/\n/).map((x) => x.trim()).filter(Boolean);

    box.style.fontSize = `calc(clamp(19px, 2.2vw, 26px) * ${this.state.font})`;

    if (p.display_layout === 'hemistichs') {
      box.className = 'poem-lines vertical';
      let html = '';
      for (let i = 0; i < lines.length; i += 2) {
        html += `<div class="verse"><span>${esc(lines[i])}</span><i>◆</i><span>${esc(lines[i + 1] || '')}</span></div>`;
      }
      box.innerHTML = html;
    } else {
      box.className = 'poem-lines flowing';
      const blocks = text.split(/\n\s*\n/).filter(Boolean);
      box.innerHTML = blocks
        .map((b) => `<p>${b.split('\n').map(esc).join('<br>')}</p>`)
        .join('');
    }
  }

  /* ── FONT & DIACRITICS ───────────────────────────── */
  adjustFont(delta) {
    this.state.font = Math.min(1.5, Math.max(0.7, this.state.font + delta));
    if (this.state.poem) this.renderText();
  }

  toggleDiacritics() {
    this.state.diacritics = !this.state.diacritics;
    $('[data-toggle-diacritics]').textContent = this.state.diacritics
      ? 'بلا تشكيل'
      : 'إظهار التشكيل';
    if (this.state.poem) this.renderText();
  }

  async copyPoem() {
    if (!this.state.poem) return;
    try {
      await navigator.clipboard.writeText(
        `${this.state.poem.title}\n${this.state.poem.text}\n— ${this.state.poem.poet?.name || ''}`
      );
      this.toast('✓ نُسخت القصيدة');
    } catch (_) {
      this.toast('تعذّر النسخ');
    }
  }

  /* ── SETTINGS ────────────────────────────────────── */
  openSettings() {
    $('[data-base-url]').value = this.api.base;
    $('[data-api-key]').value = this.api.key;
    $('[data-settings]').showModal();
  }

  async connect() {
    const base = $('[data-base-url]').value.trim();
    const key = $('[data-api-key]').value.trim();
    if (!/^https?:\/\//.test(base) || !key) {
      return this.toast('أدخل رابط HTTPS ومفتاحًا صالحًا');
    }
    this.api.configure(base, key);
    try {
      await this.api.get('/eras', { cache: false });
      $('[data-settings]').close();
      await this.boot();
      this.toast('✓ تم الاتصال بنجاح');
    } catch (e) {
      this.offline(e.message);
    }
  }

  disconnect() {
    this.api.disconnect();
    document.body.classList.remove('connected');
    $('[data-status]').textContent = 'غير متصل';
    this.toast('تم قطع الاتصال');
    this.openSettings();
  }

  /* ── HELPERS ─────────────────────────────────────── */
  styleName(s) {
    return (
      { vertical: 'شعر عمودي', prose: 'قصيدة نثر', free_verse: 'شعر تفعيلة', unknown: 'نمط غير محدد' }[s] ||
      'نمط غير محدد'
    );
  }

  trace(t) {
    $('[data-console-endpoint]').textContent = t.path;
    $('[data-console-code]').textContent = t.status;
    $('[data-console-time]').textContent = t.ms + 'ms';
    $('[data-console-remaining]').textContent = t.remaining;
  }

  offline(message) {
    document.body.classList.remove('connected');
    $('[data-status]').textContent = 'غير متصل';
    this.toast(message);
    setTimeout(() => this.openSettings(), 600);
  }

  toast(message) {
    const t = $('[data-toast]');
    t.textContent = message;
    t.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
  }
}

new Mishkat();
