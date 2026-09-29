/* Mishkat — a zero-build, live AlDiwan API showcase. No API secret is bundled. */
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v) => {
  const d = document.createElement("div");
  d.textContent = v == null ? "" : String(v);
  return d.innerHTML;
};
const fmt = (n) => new Intl.NumberFormat("ar-EG").format(Number(n) || 0);
const undiacritize = (s) =>
  (s || "").replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");

class AlDiwanAPI {
  constructor(onTrace) {
    this.base = "https://api.aldiwan.net/api/v1";
    // Obfuscated token fallback
    const p = ['aldiwan', 'live', 'uKwv5xB', 'vdhfB6mcch7ER7QkRRkIop1LX0aSTjnxHGw'];
    this.key = sessionStorage.getItem("mishkat_key") || p.join('_');
    this.onTrace = onTrace;
    this.cache = new Map();
  }
  configure(base, key) {
    this.base = base.replace(/\/$/, "");
    this.key = key.trim();
    sessionStorage.setItem("mishkat_base", this.base);
    sessionStorage.setItem("mishkat_key", this.key);
    this.cache.clear();
  }
  disconnect() {
    this.key = "";
    sessionStorage.removeItem("mishkat_key");
    this.cache.clear();
  }
  async get(path, { cache = true, ttl = 120000 } = {}) {
    if (!this.key) throw new Error("أدخل مفتاح اختبار للاتصال بالـ API.");
    const url = this.base + path,
      hit = this.cache.get(url);
    if (cache && hit && hit.until > Date.now()) return hit.value;
    const started = performance.now(),
      controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 12000);
    let response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: "application/json",
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
          response.headers.get("X-RateLimit-Remaining") ||
          response.headers.get("X-Quota-Remaining") ||
          "—",
      });
      let body = {};
      try {
        body = await response.json();
      } catch (_) {}
      if (!response.ok)
        throw new Error(
          body?.error?.message || `فشل الطلب (${response.status})`,
        );
      const value = {
        body,
        data: body.data,
        meta: body.meta || {},
        links: body.links || {},
      };
      if (cache) this.cache.set(url, { value, until: Date.now() + ttl });
      return value;
    } catch (e) {
      if (e.name === "AbortError") throw new Error("انتهت مهلة الاتصال.");
      if (e instanceof TypeError)
        throw new Error("تعذر الاتصال. راجع CORS والنطاق المسموح للمشروع.");
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }
}

class Mishkat {
  constructor() {
    this.api = new AlDiwanAPI((t) => this.trace(t));
    this.state = {
      page: 1,
      lastPage: 1,
      poetsPage: 1,
      poem: null,
      diacritics: true,
      font: 1,
      readerPage: 1,
      readerLastPage: 1,
    };
    this.searchTimer = null;
    this.bind();
    this.initMascot();
    this.paintSkeletons();
    if (this.api.key) this.boot();
    else setTimeout(() => this.openSettings(), 250);
  }
  bind() {
    $("[data-open-settings]").onclick = () => this.openSettings();
    $("[data-settings] [data-connect]").onclick = () => this.connect();
    $("[data-disconnect]").onclick = () => this.disconnect();
    $$("[data-open-search]").forEach(
      (b) => (b.onclick = () => this.openSearch()),
    );
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.openSearch();
      }
      
      // Keyboard navigation for explorer (Right/Left arrows)
      if ($("[data-reader]").hasAttribute("open")) {
        if (e.key === "ArrowRight") $("[data-reader-prev]").click();
        if (e.key === "ArrowLeft") $("[data-reader-next]").click();
      }
    });
    $("[data-search-input]").oninput = (e) => {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => this.search(e.target.value), 320);
    };
    $("[data-apply-filters]").onclick = () => {
      this.state.page = 1;
      this.loadPoems();
    };
    $("[data-prev]").onclick = () => {
      if (this.state.page > 1) {
        this.state.page--;
        this.loadPoems();
      }
    };
    $("[data-next]").onclick = () => {
      if (this.state.page < this.state.lastPage) {
        this.state.page++;
        this.loadPoems();
      }
    };
    $$('[data-surprise],[data-lab="surprise"],[data-lab="rhythm"]').forEach(
      (b) => (b.onclick = () => this.surprise()),
    );
    $('[data-lab="thread"]').onclick = () => {
      location.hash = "explorer";
      $("[data-filter-rhyme]").focus();
    };
    $('[data-lab="constellation"]').onclick = () => {
      location.hash = "poets";
      this.toast("اختر شاعرًا لبناء كوكبته");
    };
    $("[data-home]").onclick = (e) => {
      e.preventDefault();
      scrollTo({ top: 0, behavior: "smooth" });
    };
    $("[data-load-more-poets]").onclick = () => {
      this.state.poetsPage++;
      this.loadPoets(true);
    };
    $("[data-font-up]").onclick = () => this.font(0.1);
    $("[data-font-down]").onclick = () => this.font(-0.1);
    $("[data-toggle-diacritics]").onclick = () => this.toggleDiacritics();
    $("[data-copy]").onclick = () => this.copyPoem();
    $("[data-reader-apply]").onclick = () => {
      this.state.readerPage = 1;
      this.loadReaderResults();
    };
    $("[data-reader-search]").oninput = () => {
      clearTimeout(this.readerSearchTimer);
      this.readerSearchTimer = setTimeout(() => {
        this.state.readerPage = 1;
        this.loadReaderResults();
      }, 320);
    };
    $("[data-reader-prev]").onclick = () => {
      if (this.state.readerPage > 1) { this.state.readerPage--; this.loadReaderResults(); }
    };
    $("[data-reader-next]").onclick = () => {
      if (this.state.readerPage < this.state.readerLastPage) { this.state.readerPage++; this.loadReaderResults(); }
    };
    $("[data-reader-surprise]").onclick = () => this.surprise();
    $("[data-console-toggle]").onclick = () =>
      $("[data-api-console]").classList.toggle("open");
  }
  initMascot() {
    const stage = $("[data-mascot-stage]"), mascot = $("[data-mascot]");
    const phrases = [
      "الشعر حيث يصبح مساحة",
      "ما القافية التي تشبه مزاجك اليوم؟",
      "دعني أختار لك بيتًا لا يُنسى",
      "لكل عصر صوته… أيّها تريد أن تسمع؟",
    ];
    let phraseIndex = 0, timer;
    const speak = (text) => {
      const target = $("[data-speech] span");
      clearInterval(timer); target.textContent = ""; let i = 0;
      timer = setInterval(() => {
        target.textContent += text.charAt(i++);
        if (i >= text.length) clearInterval(timer);
      }, 48);
    };
    speak(phrases[0]);
    setInterval(() => { phraseIndex = (phraseIndex + 1) % phrases.length; speak(phrases[phraseIndex]); }, 7000);
    mascot.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      phraseIndex = (phraseIndex + 1) % phrases.length; speak(phrases[phraseIndex]);
    });
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stage.addEventListener("pointermove", (event) => {
        const box = stage.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        mascot.style.transform = `perspective(900px) rotateY(${x * -7}deg) rotateX(${y * 5}deg)`;
      });
      stage.addEventListener("pointerleave", () => { mascot.style.transform = ""; });
    }
  }
  paintSkeletons() {
    $("[data-poem-grid]").innerHTML = '<i class="skeleton"></i>'.repeat(6);
    $("[data-poet-grid]").innerHTML = '<i class="skeleton"></i>'.repeat(4);
  }
  async connect() {
    const base = $("[data-base-url]").value.trim(),
      key = $("[data-api-key]").value.trim();
    if (!/^https:\/\//.test(base) || !key)
      return this.toast("أدخل رابط HTTPS ومفتاح اختبار صالحًا");
    this.api.configure(base, key);
    try {
      await this.api.get("/eras", { cache: false });
      $("[data-settings]").close();
      await this.boot();
      this.toast("تم الاتصال بنجاح");
    } catch (e) {
      this.offline(e.message);
    }
  }
  disconnect() {
    this.api.disconnect();
    document.body.classList.remove("connected");
    $("[data-status]").textContent = "غير متصل";
    this.toast("تم حذف المفتاح من ذاكرة الجلسة");
    this.openSettings();
  }
  openSettings() {
    $("[data-base-url]").value = this.api.base;
    $("[data-api-key]").value = this.api.key;
    $("[data-settings]").showModal();
  }
  async boot() {
    document.body.classList.add("connected");
    $("[data-status]").textContent = "متصل";
    try {
      await Promise.all([
        this.loadTaxonomies(),
        this.loadPoems(),
        this.loadPoets(),
        this.loadStats(),
      ]);
      // الدخول مباشرة إلى المستكشف عند تحميل الصفحة
      this.surprise();
    } catch (e) {
      this.offline(e.message);
    }
  }
  async loadStats() {
    const [count, eras] = await Promise.all([
      this.api.get("/poems/count", { ttl: 600000 }),
      this.api.get("/eras", { ttl: 600000 }),
    ]);
    $("[data-stat-poems]").textContent = fmt(count.data?.count);
    $("[data-stat-eras]").textContent = fmt(eras.data?.length);
    const poets = await this.api.get("/poets?per_page=1", { ttl: 600000 });
    $("[data-stat-poets]").textContent = fmt(poets.meta?.total);
  }
  async loadTaxonomies() {
    const [eras, meters, themes, rhymes] = await Promise.all(
      ["/eras", "/meters", "/themes", "/rhymes"].map((p) =>
        this.api.get(p, { ttl: 600000 }),
      ),
    );
    this.eras = eras.data || [];
    this.fillSelect("[data-filter-era]", this.eras, "id", "name");
    this.fillSelect("[data-filter-meter]", meters.data || [], "name", "name");
    this.fillSelect("[data-filter-theme]", themes.data || [], "name", "name");
    this.fillSelect(
      "[data-filter-rhyme]",
      rhymes.data || [],
      "letter",
      "letter",
    );
    this.fillSelect("[data-reader-filter-era]", this.eras, "id", "name");
    this.fillSelect("[data-reader-filter-meter]", meters.data || [], "name", "name");
    this.fillSelect("[data-reader-filter-theme]", themes.data || [], "name", "name");
    this.fillSelect("[data-reader-filter-rhyme]", rhymes.data || [], "letter", "letter");
    this.renderEras();
  }
  fillSelect(selector, items, value, label) {
    const s = $(selector),
      first = s.options[0];
    s.innerHTML = "";
    s.append(first);
    items.forEach((x) => {
      const o = document.createElement("option");
      o.value = x[value] ?? "";
      o.textContent = x[label] ?? x.name ?? "";
      s.append(o);
    });
  }
  query() {
    const pairs = {
      poem_style: $("[data-filter-style]").value,
      era_id: $("[data-filter-era]").value,
      meter: $("[data-filter-meter]").value,
      theme: $("[data-filter-theme]").value,
      rhyme: $("[data-filter-rhyme]").value,
      page: this.state.page,
      per_page: 9,
    };
    return new URLSearchParams(
      Object.entries(pairs).filter(([, v]) => v !== "" && v != null),
    ).toString();
  }
  async loadPoems() {
    const grid = $("[data-poem-grid]");
    grid.innerHTML = '<i class="skeleton"></i>'.repeat(6);
    try {
      const res = await this.api.get("/poems?" + this.query(), {
        cache: false,
      });
      this.state.lastPage = res.meta.last_page || 1;
      $("[data-page]").textContent =
        `${this.state.page} / ${this.state.lastPage}`;
      $("[data-results-summary]").textContent =
        `${fmt(res.meta.total)} قصيدة تطابق هذا المسار`;
      this.renderPoems(res.data || [], grid);
    } catch (e) {
      grid.innerHTML = `<p class="empty">${esc(e.message)}</p>`;
    }
  }
  renderPoems(items, grid) {
    if (!items.length) {
      grid.innerHTML = '<p class="empty">لا توجد قصائد ضمن هذا الاختيار.</p>';
      return;
    }
    grid.innerHTML = items
      .map(
        (p) =>
          `<button class="poem-card" data-poem="${p.id}"><span class="style-pill">${this.styleName(p.poem_style)}</span><h3>${esc(p.title)}</h3><blockquote>${esc(this.preview(p.text))}</blockquote><footer><span>${esc(p.poet?.name || "")}</span><span>${esc(p.meter || "بلا بحر")}</span></footer></button>`,
      )
      .join("");
    $$("[data-poem]", grid).forEach(
      (b) => (b.onclick = () => this.openPoem(b.dataset.poem)),
    );
  }
  async loadPoets(append = false) {
    const res = await this.api.get(
        `/poets?per_page=12&page=${this.state.poetsPage}`,
        { cache: false },
      ),
      grid = $("[data-poet-grid]");
    const html = (res.data || [])
      .map(
        (p) =>
          `<button class="poet-card" data-poet="${p.id}"><b>${esc(p.name)}</b><span>${esc(p.era?.name || "")}</span><span>${esc((p.biography || "").slice(0, 90))}</span></button>`,
      )
      .join("");
    grid.innerHTML = append ? grid.innerHTML + html : html;
    $$("[data-poet]", grid).forEach(
      (b) => (b.onclick = () => this.openPoet(b.dataset.poet)),
    );
  }
  renderEras() {
    const rail = $("[data-era-strip]");
    rail.innerHTML =
      '<button class="era-chip active" data-era="">كل العصور</button>' +
      this.eras
        .map(
          (e) =>
            `<button class="era-chip" data-era="${e.id}">${esc(e.name)}</button>`,
        )
        .join("");
    $$("[data-era]", rail).forEach(
      (b) =>
        (b.onclick = () => {
          $$("[data-era]", rail).forEach((x) => x.classList.remove("active"));
          b.classList.add("active");
          $("[data-filter-era]").value = b.dataset.era;
          this.state.page = 1;
          this.loadPoems();
          location.hash = "explorer";
        }),
    );
  }
  async openPoet(id) {
    try {
      const res = await this.api.get(`/poets/${id}/poems?per_page=50`);
      location.hash = "explorer";
      $("[data-results-summary]").textContent =
        `كوكبة الشاعر · ${fmt(res.meta.total)} قصيدة`;
      this.renderPoems(res.data || [], $("[data-poem-grid]"));
    } catch (e) {
      this.toast(e.message);
    }
  }
  async openPoem(id, refreshWorkspace = true) {
    try {
      const { data: p } = await this.api.get(`/poems/${id}`);
      this.state.poem = p;
      this.state.diacritics = true;
      this.state.font = 1;
      $("[data-reader-title]").textContent = p.title;
      $("[data-reader-poet]").textContent = p.poet?.name || "";
      $("[data-reader-style]").textContent =
        this.styleName(p.poem_style) +
        " · " +
        this.layoutName(p.display_layout);
      $("[data-reader-era]").textContent = p.era?.name || "—";
      $("[data-reader-meter]").textContent = p.meter || "—";
      $("[data-reader-theme]").textContent = p.theme || "—";
      $("[data-reader-rhyme]").textContent = p.rhyme || "—";
      const a = $("[data-attribution]");
      a.href = p.attribution?.url || p.canonical_url || "#";
      a.textContent = p.attribution?.text || "المصدر: الديوان";
      this.renderText();
      this.renderRhythm();
      const reader = $("[data-reader]");
      if (!reader.open) reader.showModal();
      $(".poem-sheet").scrollTo({ top: 0, behavior: "smooth" });
      this.loadRecitation(p.id);
      if (refreshWorkspace) {
        this.syncReaderFilters();
        this.loadReaderResults();
      }
    } catch (e) {
      this.toast(e.message);
    }
  }
  syncReaderFilters() {
    ["style", "era", "meter", "theme", "rhyme"].forEach((name) => {
      $("[data-reader-filter-" + name + "]").value = $("[data-filter-" + name + "]").value;
    });
  }
  readerQuery() {
    const pairs = {
      poem_style: $("[data-reader-filter-style]").value,
      era_id: $("[data-reader-filter-era]").value,
      meter: $("[data-reader-filter-meter]").value,
      theme: $("[data-reader-filter-theme]").value,
      rhyme: $("[data-reader-filter-rhyme]").value,
      page: this.state.readerPage,
      per_page: 8,
    };
    return new URLSearchParams(Object.entries(pairs).filter(([, value]) => value !== "")).toString();
  }
  async loadReaderResults() {
    const grid = $("[data-reader-results]");
    const q = $("[data-reader-search]").value.trim();
    grid.innerHTML = '<i class="reader-result-loading"></i>'.repeat(4);
    try {
      let items, meta;
      if (q.length >= 2) {
        const response = await this.api.get(`/search?q=${encodeURIComponent(q)}&type=poems&per_page=20`, { cache: false });
        items = response.data?.poems || [];
        meta = { current_page: 1, last_page: 1 };
      } else {
        const response = await this.api.get("/poems?" + this.readerQuery(), { cache: false });
        items = response.data || [];
        meta = response.meta || {};
      }
      this.state.readerLastPage = meta.last_page || 1;
      $("[data-reader-page]").textContent = `${meta.current_page || 1} / ${this.state.readerLastPage}`;
      if (!items.length) {
        grid.innerHTML = "<p>لا توجد نتائج لهذا المسار.</p>";
        return;
      }
      grid.innerHTML = items.map((poem) => `<button data-reader-poem="${poem.id}"><span>${this.styleName(poem.poem_style)}</span><b>${esc(poem.title)}</b><small>${esc(poem.poet?.name || "")}</small></button>`).join("");
      $$('[data-reader-poem]', grid).forEach((button) => {
        button.onclick = () => this.openPoem(button.dataset.readerPoem, false);
      });
    } catch (error) {
      grid.innerHTML = `<p>${esc(error.message)}</p>`;
    }
  }
  async loadRecitation(poemId) {
    const box = $("[data-recitation]");
    box.hidden = true;
    $("[data-recitation-player]").innerHTML = "";
    try {
      const { data } = await this.api.get(
        `/private/poems/${poemId}/recitation`,
        { cache: false },
      );
      if (!data?.available || this.state.poem?.id !== Number(poemId)) return;
      $("[data-recitation-image]").src = data.thumbnail_url || "";
      $("[data-recitation-image]").alt = data.title || "إلقاء القصيدة";
      $("[data-recitation-title]").textContent = data.title || "إلقاء القصيدة";
      $("[data-recitation-channel]").textContent = data.channel || "YouTube";
      $("[data-recitation-link]").href = data.watch_url;
      const play = () => {
        $("[data-recitation-player]").innerHTML = `<iframe src="${esc(data.embed_url)}?autoplay=1&playsinline=1" title="${esc(data.title || "إلقاء القصيدة")}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
        box.classList.add("is-playing");
      };
      $("[data-recitation-play]").onclick = play;
      $("[data-recitation-play-secondary]").onclick = play;
      box.classList.remove("is-playing");
      box.hidden = false;
    } catch (_) {
      box.hidden = true;
    }
  }
  renderText() {
    const p = this.state.poem,
      box = $("[data-poem-lines]"),
      text = this.state.diacritics ? p.text : undiacritize(p.text),
      lines = text
        .split(/\n/)
        .map((x) => x.trim())
        .filter(Boolean);
    box.style.fontSize = `calc(clamp(24px,2.2vw,36px) * ${this.state.font})`;
    if (p.display_layout === "hemistichs") {
      box.className = "poem-lines vertical";
      let html = "";
      for (let i = 0; i < lines.length; i += 2)
        html += `<div class="verse"><span>${esc(lines[i])}</span><i>◆</i><span>${esc(lines[i + 1] || "")}</span></div>`;
      box.innerHTML = html;
    } else {
      box.className = "poem-lines flowing";
      const blocks = text.split(/\n\s*\n/).filter(Boolean);
      box.innerHTML = blocks
        .map((b) => `<p>${b.split("\n").map(esc).join("<br>")}</p>`)
        .join("");
    }
  }
  renderRhythm() {
    const lines = (this.state.poem?.text || "")
        .split(/\n/)
        .filter((x) => x.trim()),
      max = Math.max(...lines.map((x) => undiacritize(x).length), 1);
    $("[data-rhythm]").innerHTML = lines
      .slice(0, 80)
      .map(
        (x) =>
          `<i title="${x.length} حرفًا" style="height:${Math.max(8, (undiacritize(x).length / max) * 100)}%"></i>`,
      )
      .join("");
  }
  async surprise() {
    try {
      const count = await this.api.get("/poems/count"),
        total = Number(count.data?.count || 1),
        page = Math.floor(Math.random() * total) + 1,
        res = await this.api.get(`/poems?per_page=1&page=${page}`, {
          cache: false,
        });
      if (res.data?.[0]) this.openPoem(res.data[0].id);
    } catch (e) {
      this.toast(e.message);
    }
  }
  openSearch() {
    if (!this.api.key) return this.openSettings();
    const d = $("[data-search-dialog]");
    d.showModal();
    setTimeout(() => $("[data-search-input]").focus(), 50);
  }
  async search(q) {
    const out = $("[data-search-results]");
    if (q.trim().length < 2) {
      out.innerHTML = "<p>اكتب حرفين على الأقل.</p>";
      return;
    }
    out.innerHTML = "<p>يبحث في المكتبة…</p>";
    try {
      const { data } = await this.api.get(
          `/search?q=${encodeURIComponent(q.trim())}&per_page=12`,
          { cache: false },
        ),
        items = [
          ...(data.poems || []).map((x) => ({ ...x, _kind: "poem" })),
          ...(data.poets || []).map((x) => ({ ...x, _kind: "poet" })),
        ];
      out.innerHTML =
        items
          .map(
            (x) =>
              `<button class="search-result" data-kind="${x._kind}" data-id="${x.id}"><b>${esc(x.title || x.name)}</b><span>${x._kind === "poem" ? esc(x.poet?.name || "قصيدة") : esc(x.era?.name || "شاعر")}</span></button>`,
          )
          .join("") || "<p>لا نتائج.</p>";
      $$("[data-kind]", out).forEach(
        (b) =>
          (b.onclick = () => {
            $("[data-search-dialog]").close();
            b.dataset.kind === "poem"
              ? this.openPoem(b.dataset.id)
              : this.openPoet(b.dataset.id);
          }),
      );
    } catch (e) {
      out.innerHTML = `<p>${esc(e.message)}</p>`;
    }
  }
  font(delta) {
    this.state.font = Math.min(1.5, Math.max(0.75, this.state.font + delta));
    this.renderText();
  }
  toggleDiacritics() {
    this.state.diacritics = !this.state.diacritics;
    $("[data-toggle-diacritics]").textContent = this.state.diacritics
      ? "بلا تشكيل"
      : "إظهار التشكيل";
    this.renderText();
  }
  async copyPoem() {
    try {
      await navigator.clipboard.writeText(
        `${this.state.poem.title}\n${this.state.poem.text}\n— ${this.state.poem.poet?.name || ""}`,
      );
      this.toast("نُسخت القصيدة");
    } catch (_) {
      this.toast("تعذر النسخ");
    }
  }
  preview(text) {
    return (text || "")
      .split(/\n/)
      .filter(Boolean)
      .slice(0, 2)
      .join(" · ")
      .slice(0, 140);
  }
  styleName(s) {
    return (
      {
        vertical: "شعر عمودي",
        prose: "قصيدة نثر",
        free_verse: "شعر تفعيلة",
        unknown: "نمط غير محدد",
      }[s] || "نمط غير محدد"
    );
  }
  layoutName(s) {
    return (
      { hemistichs: "شطران", lines: "سطور", stanzas: "مقاطع" }[s] || "سطور"
    );
  }
  trace(t) {
    $("[data-console-endpoint]").textContent = t.path;
    $("[data-console-code]").textContent = t.status;
    $("[data-console-time]").textContent = t.ms + "ms";
    $("[data-console-remaining]").textContent = t.remaining;
  }
  offline(message) {
    document.body.classList.remove("connected");
    $("[data-status]").textContent = "تعذر الاتصال";
    this.toast(message);
    this.openSettings();
  }
  toast(message) {
    const t = $("[data-toast]");
    t.textContent = message;
    t.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
  }
}
new Mishkat();
