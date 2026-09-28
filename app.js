/**
 * روائع الديوان | Diwan Showcase Web App Engine
 * 100% Dynamic API-driven SPA connected directly to Diwan API.
 * Zero mock data, robust error handling (CORS/403/Network), skeletons & loading states.
 */

const DEFAULT_BASE_URL = 'https://api.aldiwan.net/api/v1';

// ==========================================
// 1. ApiClient (100% Live API Communication)
// ==========================================
class ApiClient {
  constructor() {
    this.storageKey = 'diwan_api_config';
    this.config = this.loadConfig();
    this.isOnlineApi = false;
    // In-memory cache: { [cacheKey]: { data, expiresAt } }
    this._cache = {};
    this._cacheTTL = 120_000; // 2 minutes default
  }

  _getCached(key) {
    const entry = this._cache[key];
    if (entry && Date.now() < entry.expiresAt) return entry.data;
    delete this._cache[key];
    return null;
  }

  _setCache(key, data, ttl = this._cacheTTL) {
    this._cache[key] = { data, expiresAt: Date.now() + ttl };
  }

  clearCache() { this._cache = {}; }

  loadConfig() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          baseUrl: (parsed.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, ''),
          token: parsed.token ? parsed.token.trim() : ''
        };
      } catch (e) {
        console.error('Failed to parse stored API config', e);
      }
    }
    return {
      baseUrl: DEFAULT_BASE_URL,
      token: ''
    };
  }

  saveConfig(baseUrl, token) {
    this.config = {
      baseUrl: (baseUrl || DEFAULT_BASE_URL).trim().replace(/\/+$/, ''),
      token: token ? token.trim() : ''
    };
    localStorage.setItem(this.storageKey, JSON.stringify(this.config));
  }

  resetConfig() {
    localStorage.removeItem(this.storageKey);
    this.config = {
      baseUrl: DEFAULT_BASE_URL,
      token: ''
    };
  }

  getHeaders() {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    if (this.config.token) {
      headers['Authorization'] = `Bearer ${this.config.token}`;
    }
    return headers;
  }

  /**
   * Universal fetch wrapper with timeout, CORS & HTTP error management
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.config.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      
    const controller = new AbortController();
    const timeoutMs = options.timeout || 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: { ...this.getHeaders(), ...(options.headers || {}) },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          let retryAfter = 10;
          try {
            const body = await response.json();
            retryAfter = body?.error?.retry_after ?? 10;
          } catch (_) {}
          throw new Error(`تجاوزت الحد المسموح من الطلبات (Rate Limit). انتظر ${retryAfter} ثوانٍ ثم أعد المحاولة.`);
        }
        if (response.status === 403) {
          throw new Error('تم رفض الوصول (403 Forbidden). قد يتطلب الخادم رمز مصادقة (Bearer Token) في الإعدادات.');
        }
        if (response.status === 401) {
          throw new Error('غير مصرح (401 Unauthorized). رمز المصادقة غير صالح أو منتهي الصلاحية.');
        }
        if (response.status === 404) {
          throw new Error('المورد المطلوب غير موجود على الخادم (404 Not Found).');
        }
        throw new Error(`استجاب الخادم برمز خطأ (${response.status} ${response.statusText}).`);
      }

      const json = await response.json();
      return json?.data !== undefined ? json.data : json;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`انتهت مهلة الاتصال بالخادم (${timeoutMs / 1000} ثوانٍ). يرجى التأكد من استجابة الرابط: ${this.config.baseUrl}`);
      }
      if (err instanceof TypeError || (err.message && err.message.toLowerCase().includes('failed to fetch'))) {
        throw new Error(`تعذر الاتصال بالخادم (${this.config.baseUrl}). قد يرجع ذلك لقيود CORS في المتصفح أو انقطاع الاتصال.`);
      }
      throw err;
    }
  }

  /**
   * Probes GET /eras as standard live check endpoint
   */
  async ping() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${this.config.baseUrl}/eras`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.isOnlineApi = true;
        return { success: true, message: 'الاتصال بالخادم ناجح (200 OK)' };
      }

      this.isOnlineApi = false;
      if (res.status === 403) {
        return { 
          success: false, 
          status: 403, 
          message: 'الخادم يتطلب رمز مصادقة (403 Forbidden)' 
        };
      }
      return { 
        success: false, 
        status: res.status, 
        message: `استجاب الخادم برمز: ${res.status}` 
      };
    } catch (err) {
      this.isOnlineApi = false;
      return {
        success: false,
        message: 'تعذر الاتصال المباشر بالخادم (قد يكون بسبب قيود CORS للمتصفح أو عدم توفر النطاق)'
      };
    }
  }

  async getEras() {
    const cached = this._getCached('eras');
    if (cached) return cached;
    const data = await this.request('/eras');
    const result = Array.isArray(data) ? data : (data?.eras || []);
    this._setCache('eras', result, 300_000); // 5 min
    return result;
  }

  async getPoets(eraId = 'all') {
    const cacheKey = `poets:${eraId}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;
    const endpoint = (eraId && eraId !== 'all')
      ? `/poets?era=${encodeURIComponent(eraId)}`
      : '/poets';
    const data = await this.request(endpoint);
    const result = Array.isArray(data) ? data : (data?.poets || data?.items || []);
    this._setCache(cacheKey, result, 120_000); // 2 min
    return result;
  }

  async getPoetPoems(poetId) {
    const cacheKey = `poet_poems:${poetId}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;
    const data = await this.request(`/poets/${encodeURIComponent(poetId)}/poems`);
    const result = Array.isArray(data) ? data : (data?.poems || data?.items || []);
    this._setCache(cacheKey, result, 120_000);
    return result;
  }

  async getPoem(poemId) {
    const cacheKey = `poem:${poemId}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;
    const data = await this.request(`/poems/${encodeURIComponent(poemId)}`);
    const result = data?.poem || data;
    this._setCache(cacheKey, result, 300_000); // 5 min — poems don't change
    return result;
  }

  async getPoemsCount() {
    const cached = this._getCached('poems_count');
    if (cached !== null && cached !== undefined) return cached;
    try {
      const data = await this.request('/poems/count', { timeout: 4000 });
      const count = data?.count ?? (typeof data === 'number' ? data : null);
      if (count !== null && !isNaN(count)) {
        this._setCache('poems_count', Number(count), 600_000); // 10 min
        return Number(count);
      }
    } catch (e) { /* Non-fatal */ }
    return null;
  }

  async search(query) {
    if (!query || !query.trim()) return [];
    const q = query.trim();
    const data = await this.request(`/search?q=${encodeURIComponent(q)}`, { timeout: 6000 });

    // Handle varied search response formats
    let rawList = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.results)) {
        rawList = data.results;
      } else {
        const poets = Array.isArray(data.poets) ? data.poets.map(p => ({ ...p, type: 'poet' })) : [];
        const poems = Array.isArray(data.poems) ? data.poems.map(p => ({ ...p, type: 'poem' })) : [];
        const verses = Array.isArray(data.verses) ? data.verses.map(v => ({ ...v, type: 'verse' })) : [];
        rawList = [...poets, ...poems, ...verses];
      }
    }

    return rawList.map(item => {
      if (item.type === 'poet' || (!item.verses && item.bio)) {
        return {
          type: 'poet',
          title: item.name || item.title,
          subtitle: `${item.title || ''} ${item.era_name || item.eraName ? '• ' + (item.era_name || item.eraName) : ''}`.trim(),
          data: item
        };
      }
      if (item.type === 'verse' || item.sadr) {
        return {
          type: 'verse',
          title: `${item.sadr} ... ${item.ajuz || ''}`,
          subtitle: item.poem_title ? `من قصيدة: «${item.poem_title}»` : (item.poet_name || ''),
          data: item
        };
      }
      return {
        type: 'poem',
        title: item.title || item.name,
        subtitle: `${item.poet_name || item.poetName || ''} ${item.meter ? '• ' + item.meter : ''}`.trim(),
        data: item
      };
    }).slice(0, 10);
  }
}

// ==========================================
// 2. Helper Functions (Diacritics, Toast, Escaping)
// ==========================================

function removeDiacritics(text) {
  if (!text) return '';
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const typeClass = type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : 'toast-info';
  toast.className = `toast ${typeClass}`;
  toast.style.transform = 'translateY(8px)';
  toast.style.opacity = '0';
  toast.style.transition = 'all 0.25s cubic-bezier(0.4,0,0.2,1)';
  toast.style.pointerEvents = 'auto';

  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info';
  toast.innerHTML = `
    <i data-lucide="${icon}" style="width:15px;height:15px;flex-shrink:0"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateY(4px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}


// ==========================================
// 3. Main Application Controller (100% Dynamic)
// ==========================================
class DiwanApp {
  constructor() {
    this.api = new ApiClient();
    this.eras = [];
    this.currentEraId = 'all';
    this.currentPoet = null;
    this.currentPoem = null;
    this.showDiacritics = true;
    this.fontSizeScale = 1.0;
    this.currentSelectedVerse = null;
    this.searchDebounceTimer = null;

    this.initElements();
    this.initEventListeners();
    this.startApp();
  }

  initElements() {
    // Views
    this.catalogView = document.getElementById('catalogView');
    this.poemReaderView = document.getElementById('poemReaderView');
    this.heroSection = document.getElementById('heroSection');

    // Breadcrumbs
    this.crumbHome = document.getElementById('crumbHome');
    this.crumbEra = document.getElementById('crumbEra');
    this.crumbPoet = document.getElementById('crumbPoet');
    this.crumbPoetSep = document.getElementById('crumbPoetSep');
    this.crumbPoem = document.getElementById('crumbPoem');
    this.crumbPoemSep = document.getElementById('crumbPoemSep');

    // Catalog elements
    this.erasTabsContainer = document.getElementById('erasTabsContainer');
    this.poetsGrid = document.getElementById('poetsGrid');
    this.poetsCountLabel = document.getElementById('poetsCountLabel');
    this.poetPoemsSection = document.getElementById('poetPoemsSection');
    this.poetPoemsGrid = document.getElementById('poetPoemsGrid');
    this.selectedPoetNameTitle = document.getElementById('selectedPoetNameTitle');
    this.selectedPoetBio = document.getElementById('selectedPoetBio');
    this.closePoetPoemsBtn = document.getElementById('closePoetPoemsBtn');

    // Poem reader elements
    this.poemEraBadge = document.getElementById('poemEraBadge');
    this.poemMeterBadge = document.getElementById('poemMeterBadge');
    this.poemTitle = document.getElementById('poemTitle');
    this.poemPoetName = document.getElementById('poemPoetName');
    this.versesListContainer = document.getElementById('versesListContainer');
    this.backToCatalogBtn = document.getElementById('backToCatalogBtn');
    this.copyFullPoemBtn = document.getElementById('copyFullPoemBtn');
    this.toggleDiacriticsBtn = document.getElementById('toggleDiacriticsBtn');
    this.increaseFontBtn = document.getElementById('increaseFontBtn');
    this.decreaseFontBtn = document.getElementById('decreaseFontBtn');
    this.fontSizeDisplay = document.getElementById('fontSizeDisplay');

    // NEW: Zen Mode elements
    this.zenModeToggleBtn = document.getElementById('zenModeToggleBtn');
    this.exitZenModeBtn = document.getElementById('exitZenModeBtn');

    // Search elements (Updated for Full Screen Overlay)
    this.openSearchBtn = document.getElementById('openSearchBtn');
    this.closeSearchBtn = document.getElementById('closeSearchBtn');
    this.searchOverlay = document.getElementById('searchOverlay');
    this.overlaySearchInput = document.getElementById('overlaySearchInput');
    this.searchResultsList = document.getElementById('searchResultsList');

    // Modals
    this.quoteModal = document.getElementById('quoteModal');
    this.closeQuoteModalBtn = document.getElementById('closeQuoteModalBtn');
    this.quoteCardSadr = document.getElementById('quoteCardSadr');
    this.quoteCardAjuz = document.getElementById('quoteCardAjuz');
    this.quoteCardPoet = document.getElementById('quoteCardPoet');
    this.copyQuoteTextBtn = document.getElementById('copyQuoteTextBtn');
    this.downloadQuoteImgBtn = document.getElementById('downloadQuoteImgBtn');
    this.quoteCanvas = document.getElementById('quoteCanvas');

    this.settingsModal = document.getElementById('settingsModal');
    this.openSettingsBtn = document.getElementById('openSettingsBtn');
    this.closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
    this.apiBaseUrlInput = document.getElementById('apiBaseUrlInput');
    this.apiTokenInput = document.getElementById('apiTokenInput');
    this.saveApiSettingsBtn = document.getElementById('saveApiSettingsBtn');
    this.testApiPingBtn = document.getElementById('testApiPingBtn');
    this.pingStatusBox = document.getElementById('pingStatusBox');

    // Badges & brand
    this.apiStatusBadge = document.getElementById('apiStatusBadge');
    this.apiStatusDot = document.getElementById('apiStatusDot');
    this.apiStatusText = document.getElementById('apiStatusText');
    this.brandLogoBtn = document.getElementById('brandLogoBtn');

    // Header Platform Stats
    this.statErasCount = document.getElementById('statErasCount');
    this.statPoetsCount = document.getElementById('statPoetsCount');
    this.statPoemsCount = document.getElementById('statPoemsCount');
  }

  initEventListeners() {
    // Navigation & logo
    this.brandLogoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.resetToHome();
    });
    this.crumbHome.addEventListener('click', () => this.resetToHome());
    this.crumbEra.addEventListener('click', () => {
      this.switchView('catalog');
      this.poetPoemsSection.classList.add('hidden');
      this.updateBreadcrumbs();
    });
    this.crumbPoet.addEventListener('click', () => {
      if (this.currentPoet) {
        this.switchView('catalog');
        this.loadPoetPoems(this.currentPoet);
      }
    });

    this.backToCatalogBtn.addEventListener('click', () => {
      this.switchView('catalog');
    });

    this.closePoetPoemsBtn.addEventListener('click', () => {
      this.poetPoemsSection.classList.add('hidden');
      this.currentPoet = null;
      this.updateBreadcrumbs();
    });

    // Reader controls
    this.increaseFontBtn.addEventListener('click', () => {
      if (this.fontSizeScale < 1.6) {
        this.fontSizeScale += 0.1;
        this.applyFontSize();
      }
    });
    this.decreaseFontBtn.addEventListener('click', () => {
      if (this.fontSizeScale > 0.8) {
        this.fontSizeScale -= 0.1;
        this.applyFontSize();
      }
    });

    this.toggleDiacriticsBtn.addEventListener('click', () => {
      this.showDiacritics = !this.showDiacritics;
      this.diacriticsStatusLabel.textContent = this.showDiacritics ? 'التشكيل: مفعل' : 'التشكيل: معطل';
      this.renderVerses();
      showToast(this.showDiacritics ? 'تم تفعيل التشكيل' : 'تم إلغاء التشكيل لسهولة القراءة', 'info');
    });

    this.copyFullPoemBtn.addEventListener('click', () => {
      if (!this.currentPoem) return;
      let text = `«${this.currentPoem.title}»\nالشاعر: ${this.currentPoem.poetName}\n${this.currentPoem.meter || ''}\n\n`;
      (this.currentPoem.verses || []).forEach(v => {
        const sadr = this.showDiacritics ? v.sadr : removeDiacritics(v.sadr);
        const ajuz = this.showDiacritics ? v.ajuz : removeDiacritics(v.ajuz);
        text += `${sadr} ... ${ajuz}\n`;
      });
      text += `\n— نُسخ عبر تطبيق روائع الديوان`;
      navigator.clipboard.writeText(text).then(() => {
        showToast('تم نسخ كامل القصيدة إلى الحافظة!', 'success');
      });
    });

    // Zen Mode events
    this.zenModeToggleBtn.addEventListener('click', () => {
      document.body.classList.add('zen-mode');
      showToast('أنت الآن في وضع القراءة الصافي. للعودة اضغط على الزر العائم يسار الشاشة.', 'info');
    });
    this.exitZenModeBtn.addEventListener('click', () => {
      document.body.classList.remove('zen-mode');
    });

    // Search events (Overlay)
    this.openSearchBtn.addEventListener('click', () => {
      this.searchOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // prevent bg scrolling
      setTimeout(() => this.overlaySearchInput.focus(), 100);
    });

    this.closeSearchBtn.addEventListener('click', () => {
      this.searchOverlay.classList.remove('active');
      document.body.style.overflow = '';
      this.overlaySearchInput.value = '';
      this.searchResultsList.innerHTML = '';
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.searchOverlay.classList.contains('active')) {
          this.searchOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
        if (document.body.classList.contains('zen-mode')) {
          document.body.classList.remove('zen-mode');
        }
      }
    });

    this.overlaySearchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      clearTimeout(this.searchDebounceTimer);
      if (val.trim()) {
        this.searchDebounceTimer = setTimeout(() => {
          this.performLiveSearch(val);
        }, 350);
      } else {
        this.searchResultsList.innerHTML = '';
      }
    });

    // Settings modal events
    this.apiStatusBadge.addEventListener('click', () => this.openSettings());
    this.openSettingsBtn.addEventListener('click', () => this.openSettings());
    this.closeSettingsModalBtn.addEventListener('click', () => this.closeSettings());
    this.saveApiSettingsBtn.addEventListener('click', () => this.saveSettings());
    this.resetApiSettingsBtn.addEventListener('click', () => this.resetSettings());
    this.testApiPingBtn.addEventListener('click', () => this.testConnection());

    // Quote modal events
    this.closeQuoteModalBtn.addEventListener('click', () => this.quoteModal.classList.add('hidden'));
    this.copyQuoteTextBtn.addEventListener('click', () => this.copySelectedQuoteText());
    this.downloadQuoteImgBtn.addEventListener('click', () => this.exportQuoteImage());
  }

  async startApp() {
    // loadEras itself proves connectivity — no separate ping needed
    const erasOk = await this.loadEras();
    await this.loadPoets(this.currentEraId);
    // If eras loaded successfully, mark API online and fetch count
    if (erasOk) {
      this.updateApiStatusIndicator('online');
      this.fetchPoemCountQuietly();
    } else {
      // Only ping separately if eras failed (to distinguish offline vs CORS)
      this.checkApiStatusQuietly();
    }
  }

  resetToHome() {
    this.currentEraId = 'all';
    this.currentPoet = null;
    this.currentPoem = null;
    this.heroSection.classList.remove('hidden');
    this.poetPoemsSection.classList.add('hidden');
    this.switchView('catalog');
    this.renderErasTabs();
    this.loadPoets('all');
    this.updateBreadcrumbs();
  }

  switchView(viewName) {
    if (viewName === 'catalog') {
      this.catalogView.classList.remove('hidden');
      this.poemReaderView.classList.add('hidden');
      this.heroSection.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewName === 'reader') {
      this.catalogView.classList.add('hidden');
      this.poemReaderView.classList.remove('hidden');
      this.heroSection.classList.add('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updateBreadcrumbs() {
    if (this.currentEraId && this.currentEraId !== 'all') {
      const eraObj = this.eras.find(e => (e.id || e.slug) === this.currentEraId);
      this.crumbEra.textContent = eraObj ? eraObj.name : 'العصور الأدبية';
    } else {
      this.crumbEra.textContent = 'كافة العصور';
    }

    if (this.currentPoet) {
      this.crumbPoetSep.classList.remove('hidden');
      this.crumbPoet.classList.remove('hidden');
      this.crumbPoet.textContent = this.currentPoet.name;
    } else {
      this.crumbPoetSep.classList.add('hidden');
      this.crumbPoet.classList.add('hidden');
    }

    if (this.currentPoem) {
      this.crumbPoemSep.classList.remove('hidden');
      this.crumbPoem.classList.remove('hidden');
      this.crumbPoem.textContent = this.currentPoem.title;
    } else {
      this.crumbPoemSep.classList.add('hidden');
      this.crumbPoem.classList.add('hidden');
    }
  }

  // ==========================================
  // Skeletons & Error Cards
  // ==========================================

  renderErasSkeleton() {
    this.erasTabsContainer.innerHTML = Array(6).fill(0).map(() =>
      `<div class="skeleton" style="height:34px;width:90px;border-radius:100px;flex-shrink:0;display:inline-block"></div>`
    ).join('');
  }


  renderPoetsSkeleton() {
    this.poetsGrid.innerHTML = Array(8).fill(0).map(() => `
      <div class="p-5 rounded-2xl bg-[#18202c]/60 border border-[#2a374a] animate-pulse space-y-3">
        <div class="flex justify-between items-center">
          <div class="w-12 h-12 rounded-xl bg-slate-800"></div>
          <div class="w-16 h-5 rounded-full bg-slate-800"></div>
        </div>
        <div class="h-5 w-2/3 bg-slate-800 rounded"></div>
        <div class="h-3 w-1/2 bg-slate-800/70 rounded"></div>
        <div class="h-3 w-full bg-slate-800/50 rounded"></div>
        <div class="h-3 w-4/5 bg-slate-800/50 rounded"></div>
        <div class="pt-3 border-t border-[#2a374a]/60 flex justify-between">
          <div class="h-4 w-16 bg-slate-800 rounded"></div>
          <div class="h-4 w-20 bg-slate-800 rounded"></div>
        </div>
      </div>
    `).join('');
  }

  renderPoetPoemsSkeleton() {
    this.poetPoemsGrid.innerHTML = Array(6).fill(0).map(() => `
      <div class="p-5 rounded-xl bg-[#18202c]/60 border border-[#2a374a] animate-pulse space-y-3">
        <div class="flex justify-between">
          <div class="h-4 w-20 bg-slate-800 rounded"></div>
          <div class="h-4 w-12 bg-slate-800 rounded"></div>
        </div>
        <div class="h-5 w-3/4 bg-slate-800 rounded"></div>
        <div class="h-3 w-full bg-slate-800/60 rounded"></div>
        <div class="pt-3 border-t border-[#2a374a]/60 flex justify-between">
          <div class="h-4 w-24 bg-slate-800 rounded"></div>
        </div>
      </div>
    `).join('');
  }

  renderPoemReaderSkeleton() {
    this.versesListContainer.innerHTML = Array(8).fill(0).map((_, i) => `
      <div class="p-4 rounded-xl bg-[#18202c]/50 border border-[#2a374a] animate-pulse flex items-center justify-between gap-4">
        <div class="w-8 h-8 rounded-lg bg-slate-800 flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 w-5/6 bg-slate-800 rounded mx-auto"></div>
        </div>
        <div class="w-16 h-8 rounded-lg bg-slate-800 flex-shrink-0"></div>
      </div>
    `).join('');
  }

  renderErrorCard(container, message, retryCallback) {
    container.innerHTML = `
      <div class="col-span-full my-6 p-8 rounded-2xl bg-[#18202c]/90 border border-rose-900/60 text-center max-w-xl mx-auto shadow-2xl space-y-4">
        <div class="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center mx-auto text-rose-400">
          <i data-lucide="wifi-off" class="w-7 h-7"></i>
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-bold text-white font-kufi">تعذر الاتصال بخادم الديوان</h3>
          <p class="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            ${escapeHtml(message)}
          </p>
          <p class="text-[11px] text-slate-500">
            قد يرجع ذلك إلى قيود أمان المتصفح (CORS)، عدم توفر السيرفر، أو الحاجة إلى إدخال رمز مصادقة (Bearer Token).
          </p>
        </div>
        <div class="flex items-center justify-center gap-3 pt-2">
          <button class="retry-btn px-4 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#9b7a37] text-slate-950 text-xs font-bold hover:brightness-110 flex items-center gap-1.5 transition-all shadow-lg shadow-[#c5a059]/20">
            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
            <span>إعادة المحاولة</span>
          </button>
          <button class="settings-btn px-4 py-2 rounded-xl bg-[#121924] border border-[#2a374a] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <i data-lucide="settings" class="w-4 h-4 text-[#c5a059]"></i>
            <span>إعدادات الـ API</span>
          </button>
        </div>
      </div>
    `;

    const retryBtn = container.querySelector('.retry-btn');
    if (retryBtn && retryCallback) {
      retryBtn.addEventListener('click', () => retryCallback());
    }

    const settingsBtn = container.querySelector('.settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openSettings());
    }

    if (window.lucide) lucide.createIcons();
  }

  // ==========================================
  // Data Fetching & Rendering
  // ==========================================

  async loadEras() {
    this.renderErasSkeleton();
    try {
      const data = await this.api.getEras();
      this.eras = Array.isArray(data) ? data : [];

      if (this.eras.length === 0) {
        this.erasTabsContainer.innerHTML = `
          <div style="font-size:0.75rem;color:var(--ink-light);padding:0.5rem 0">لا توجد عصور متوفرة على الخادم حالياً.</div>
        `;
        return false;
      }

      this.statErasCount.textContent = `${this.eras.length}`;
      this.renderErasTabs();
      return true;
    } catch (err) {
      console.error('Error fetching eras:', err);
      this.statErasCount.textContent = '-';
      this.renderErrorCard(this.erasTabsContainer, err.message, () => this.loadEras());
      return false;
    }
  }

  renderErasTabs() {
    if (!this.eras || this.eras.length === 0) return;
    this.erasTabsContainer.innerHTML = '';

    // "All Eras" Tab
    const isAll = this.currentEraId === 'all';
    const allBtn = document.createElement('button');
    allBtn.className = `era-tab${isAll ? ' active' : ''}`;
    allBtn.innerHTML = `<span>كافة العصور</span>`;
    allBtn.addEventListener('click', () => {
      this.currentEraId = 'all';
      this.renderErasTabs();
      this.loadPoets('all');
      this.poetPoemsSection.classList.add('hidden');
      this.updateBreadcrumbs();
    });
    this.erasTabsContainer.appendChild(allBtn);

    // Dynamic Eras from Live API
    this.eras.forEach(era => {
      const eraId = String(era.id ?? era.slug);
      const isSelected = eraId === String(this.currentEraId);
      const btn = document.createElement('button');
      btn.className = `era-tab${isSelected ? ' active' : ''}`;

      const countBadge = (era.poets_count || era.count)
        ? `<span class="era-tab-count">${era.poets_count || era.count}</span>`
        : '';

      btn.innerHTML = `<span>${escapeHtml(era.name || era.title)}</span>${countBadge}`;

      btn.addEventListener('click', () => {
        this.currentEraId = eraId;
        this.renderErasTabs();
        this.loadPoets(eraId);
        this.poetPoemsSection.classList.add('hidden');
        this.updateBreadcrumbs();
      });

      this.erasTabsContainer.appendChild(btn);
    });
  }


  async loadPoets(eraId = 'all') {
    this.renderPoetsSkeleton();
    this.poetsCountLabel.textContent = '...';

    try {
      const poets = await this.api.getPoets(eraId);
      this.renderPoetsList(poets, eraId);
      
      // Update stats
      if (eraId === 'all' && poets && poets.length) {
        this.statPoetsCount.textContent = `+${poets.length.toLocaleString('en-US')}`;
      }
    } catch (err) {
      console.error('Error fetching poets:', err);
      this.poetsCountLabel.textContent = 'خطأ';
      this.renderErrorCard(this.poetsGrid, err.message, () => this.loadPoets(eraId));
    }
  }

  renderPoetsList(poets, eraId) {
    const eraObj = this.eras.find(e => String(e.id || e.slug) === String(eraId));
    this.poetsSectionTitle.textContent = eraObj ? `شعراء ${eraObj.name || eraObj.title}` : 'الشعراء';
    this.poetsCountLabel.textContent = `${poets.length} من الشعراء`;

    this.poetsGrid.innerHTML = '';

    if (!poets || poets.length === 0) {
      this.poetsGrid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400 border border-dashed border-[#2a374a] rounded-2xl">
          <p>لا يوجد شعراء مدرجون في هذا التصنيف على الخادم حالياً.</p>
        </div>
      `;
      return;
    }

    poets.forEach(poet => {
      const eraName = poet.era_name || poet.eraName || poet.era?.name || (eraObj ? eraObj.name : '');
      const poemsCount = poet.poems_count || poet.poemsCount || '';

      const card = document.createElement('div');
      card.className = 'poet-card animate-in';

      card.innerHTML = `
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="poet-avatar">${poet.avatar || '📜'}</div>
            ${eraName ? `<span class="poet-era-badge">${escapeHtml(eraName)}</span>` : ''}
          </div>
          <h4 class="poet-name">${escapeHtml(poet.name || poet.title)}</h4>
          ${poet.title && poet.title !== poet.name
            ? `<p class="text-xs font-medium mt-0.5" style="color:var(--gold)">${escapeHtml(poet.title)}</p>`
            : ''}
          <p class="poet-title line-clamp-2">${escapeHtml(poet.bio || poet.description || 'شاعر عربي أصيل')}</p>
        </div>
        <div class="poet-poems-count">
          <i data-lucide="book-open" class="w-3 h-3" style="color:var(--gold)"></i>
          <span>${poemsCount ? `${poemsCount} قصيدة` : 'استعراض القصائد'}</span>
          <span class="mr-auto text-xs font-semibold" style="color:var(--gold-light)">تصفح ←</span>
        </div>
      `;

      card.addEventListener('click', () => this.loadPoetPoems(poet));
      this.poetsGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  async loadPoetPoems(poet) {
    this.currentPoet = poet;
    this.selectedPoetNameTitle.textContent = `قصائد ${poet.name || poet.title}`;
    this.selectedPoetBio.textContent = poet.bio || poet.description || '';
    this.poetPoemsSection.classList.remove('hidden');
    this.updateBreadcrumbs();
    this.renderPoetPoemsSkeleton();

    // Scroll to poet poems view smoothly
    this.poetPoemsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      const poems = await this.api.getPoetPoems(poet.id || poet.slug);
      this.renderPoetPoemsList(poems, poet);
    } catch (err) {
      console.error('Error fetching poet poems:', err);
      this.renderErrorCard(this.poetPoemsGrid, err.message, () => this.loadPoetPoems(poet));
    }
  }

  renderPoetPoemsList(poems, poet) {
    this.poetPoemsGrid.innerHTML = '';

    if (!poems || poems.length === 0) {
      this.poetPoemsGrid.innerHTML = `
        <div class="col-span-full py-8 text-center text-slate-400 text-xs">
          لم يتم العثور على قصائد مسجلة لهذا الشاعر على الخادم حالياً.
        </div>
      `;
      return;
    }

    poems.forEach(poem => {
      const meter = poem.meter || poem.bahr || '';
      const versesCount = poem.verses_count || poem.versesCount || (Array.isArray(poem.verses) ? poem.verses.length : '');
      const firstVerseText = Array.isArray(poem.verses) && poem.verses[0]
        ? `${poem.verses[0].sadr || ''} ... ${poem.verses[0].ajuz || ''}`
        : (poem.snippet || poem.first_verse || '');

      const card = document.createElement('div');
      card.className = 'poem-card animate-in';
      card.innerHTML = `
        <div>
          <div class="flex items-center gap-2 mb-3 flex-wrap">
            ${meter ? `<span class="poem-meta-tag">${escapeHtml(meter)}</span>` : ''}
            ${versesCount ? `<span class="poem-meta-tag"><i data-lucide="align-left" class="w-3 h-3"></i> ${versesCount} بيتاً</span>` : ''}
          </div>
          <h4 class="poem-card-title">${escapeHtml(poem.title || poem.name)}</h4>
          ${firstVerseText ? `
            <p class="text-xs mt-2 leading-relaxed line-clamp-2" style="font-family:'Amiri',serif;color:var(--text-muted);font-style:italic">
              «${escapeHtml(firstVerseText)}»
            </p>
          ` : ''}
        </div>
        <div class="flex items-center justify-between mt-4 pt-3 text-xs font-semibold" style="border-top:1px solid var(--border-subtle);color:var(--gold)">
          <span>قراءة القصيدة</span>
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
        </div>
      `;

      card.addEventListener('click', () => this.openPoemReader(poem, poet));
      this.poetPoemsGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  async openPoemReader(poemSummary, poetSummary) {
    this.switchView('reader');
    this.renderPoemReaderSkeleton();

    // Populate tentative header data
    const poetName = poetSummary?.name || poemSummary?.poet_name || poemSummary?.poetName || (this.currentPoet ? this.currentPoet.name : '');
    const eraName = poetSummary?.era_name || poemSummary?.era_name || (this.currentPoet ? this.currentPoet.eraName : '');

    this.poemTitle.textContent = poemSummary.title || poemSummary.name || 'تحميل القصيدة...';
    this.poemPoetName.textContent = poetName;
    this.poemEraBadge.textContent = eraName || '-';
    this.poemMeterBadge.textContent = poemSummary.meter || poemSummary.bahr || '-';
    this.poemVersesCountBadge.textContent = '-';

    this.currentPoem = {
      id: poemSummary.id || poemSummary.slug,
      title: poemSummary.title || poemSummary.name,
      poetName: poetName,
      poetId: poetSummary?.id || poemSummary?.poet_id,
      eraName: eraName,
      meter: poemSummary.meter || poemSummary.bahr,
      verses: []
    };

    this.updateBreadcrumbs();

    try {
      let fullPoem = poemSummary;
      // Fetch full poem details if verses aren't embedded yet
      if (!Array.isArray(poemSummary.verses) || poemSummary.verses.length === 0) {
        fullPoem = await this.api.getPoem(poemSummary.id || poemSummary.slug);
      }

      this.currentPoem.title = fullPoem.title || fullPoem.name || this.currentPoem.title;
      this.currentPoem.poetName = fullPoem.poet?.name || fullPoem.poet_name || fullPoem.poetName || poetName;
      this.currentPoem.meter = fullPoem.meter || fullPoem.bahr || this.currentPoem.meter;
      this.currentPoem.eraName = fullPoem.era?.name || fullPoem.era_name || fullPoem.eraName || eraName;

      // Normalize verses — API may return:
      // 1. verses: [{sadr, ajuz}] array
      // 2. verses: ["string"] array
      // 3. text: "full poem as single string\nline2\nline3..."
      let rawVerses = fullPoem.verses || fullPoem.lines || [];

      // If no verses array but there's a text string, split it into lines
      if ((!rawVerses || rawVerses.length === 0) && typeof fullPoem.text === 'string' && fullPoem.text.trim()) {
        const lines = fullPoem.text
          .split(/\n|\r\n|\r/)
          .map(l => l.trim())
          .filter(l => l.length > 0);

        // Each two consecutive lines form one verse (sadr + ajuz)
        rawVerses = [];
        for (let i = 0; i < lines.length; i += 2) {
          rawVerses.push({
            sadr: lines[i] || '',
            ajuz: lines[i + 1] || ''
          });
        }
      }

      this.currentPoem.verses = rawVerses.map((v, idx) => {
        if (typeof v === 'string') {
          // Try splitting by common Arabic verse separator patterns
          const parts = v.split(/\s{3,}|\t+|\.{2,}|…/);
          return {
            num: idx + 1,
            sadr: (parts[0] || v).trim(),
            ajuz: (parts[1] || '').trim()
          };
        }
        return {
          num: v.num || v.index || (idx + 1),
          sadr: (v.sadr || v.first_hemistich || v.firstHemistich || '').trim(),
          ajuz: (v.ajuz || v.second_hemistich || v.secondHemistich || '').trim()
        };
      }).filter(v => v.sadr || v.ajuz); // Remove empty verses

      this.poemTitle.textContent = this.currentPoem.title;
      this.poemPoetName.textContent = this.currentPoem.poetName;
      this.poemEraBadge.textContent = this.currentPoem.eraName || 'أدب عربي';
      this.poemMeterBadge.textContent = this.currentPoem.meter || 'شعر عربي';
      this.poemVersesCountBadge.textContent = `${this.currentPoem.verses.length} بيتاً`;

      this.renderVerses();
      this.updateBreadcrumbs();
    } catch (err) {
      console.error('Error fetching poem details:', err);
      this.renderErrorCard(this.versesListContainer, err.message, () => this.openPoemReader(poemSummary, poetSummary));
    }
  }

  applyFontSize() {
    const percentage = Math.round(this.fontSizeScale * 100);
    this.fontSizeDisplay.textContent = `${percentage}%`;
    // Update all verse text elements inline since they use inline style
    document.querySelectorAll('.verse-sadr, .verse-ajuz').forEach(el => {
      el.style.fontSize = `${1.3 * this.fontSizeScale}rem`;
    });
  }

  renderVerses() {
    if (!this.currentPoem || !this.currentPoem.verses) return;
    this.versesListContainer.innerHTML = '';

    if (this.currentPoem.verses.length === 0) {
      this.versesListContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📜</div>
          <p class="text-sm">لا توجد أبيات مسجلة لهذه القصيدة على الخادم.</p>
        </div>
      `;
      return;
    }

    this.currentPoem.verses.forEach((v, idx) => {
      const sadrText = this.showDiacritics ? v.sadr : removeDiacritics(v.sadr);
      const ajuzText = this.showDiacritics ? v.ajuz : removeDiacritics(v.ajuz);
      const num = v.num || (idx + 1);

      const row = document.createElement('div');
      row.className = 'verse-row animate-in';
      row.style.animationDelay = `${idx * 20}ms`;

      row.innerHTML = `
        <span class="verse-num">${num}</span>
        <span class="verse-sadr" style="font-size:${1.3 * this.fontSizeScale}rem">${escapeHtml(sadrText)}</span>
        <span class="verse-separator">✦</span>
        <span class="verse-ajuz" style="font-size:${1.3 * this.fontSizeScale}rem">${escapeHtml(ajuzText)}</span>
        <button class="verse-quote-btn" title="بطاقة اقتباس">
          <i data-lucide="quote" class="w-3 h-3"></i>
        </button>
      `;

      // Copy on row click (anywhere in the row)
      row.addEventListener('click', () => {
        this.openQuoteModal(v, sadrText, ajuzText);
      });

      // Verse quote button
      const quoteBtn = row.querySelector('.verse-quote-btn');
      quoteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openQuoteModal(v, sadrText, ajuzText);
      });

      this.versesListContainer.appendChild(row);
    });

    if (window.lucide) lucide.createIcons();
  }

  openQuoteModal(verse, sadr, ajuz) {
    this.currentSelectedVerse = {
      verse,
      sadr,
      ajuz,
      poetName: this.currentPoem.poetName,
      poemTitle: this.currentPoem.title
    };

    this.quoteCardSadr.textContent = sadr;
    this.quoteCardAjuz.textContent = ajuz;
    this.quoteCardPoet.textContent = `الشاعر: ${this.currentPoem.poetName} (من «${this.currentPoem.title}»)`;

    this.quoteModal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }

  copySelectedQuoteText() {
    if (!this.currentSelectedVerse) return;
    const { sadr, ajuz, poetName, poemTitle } = this.currentSelectedVerse;
    const text = `«${sadr}\n${ajuz}»\n— ${poetName} (من «${poemTitle}»)\nعبر تطبيق روائع الديوان`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('تم نسخ نص الاقتباس بنجاح!', 'success');
    });
  }

  exportQuoteImage() {
    if (!this.currentSelectedVerse) return;
    const { sadr, ajuz, poetName, poemTitle } = this.currentSelectedVerse;

    const canvas = this.quoteCanvas;
    const ctx = canvas.getContext('2d');

    const width = 1200;
    const height = 750;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 1.5);
    grad.addColorStop(0, '#1c2635');
    grad.addColorStop(1, '#0b0f16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Outer border
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#c5a059';
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Inner dashed border
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.4)';
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(50, 50, width - 100, height - 100);
    ctx.setLineDash([]);

    // Header ornament / title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#dfc185';
    ctx.font = 'bold 28px Cairo, sans-serif';
    ctx.fillText('✦  رَوَائِعُ الشِّعْرِ العَرَبِيّ  ✦', width / 2, 120);

    // Sadr
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Amiri, serif';
    ctx.fillText(sadr, width / 2, 280);

    // Star separator
    ctx.fillStyle = '#c5a059';
    ctx.font = 'bold 36px serif';
    ctx.fillText('✦   ✦   ✦', width / 2, 370);

    // Ajuz
    ctx.fillStyle = '#f3e5ab';
    ctx.font = 'bold 44px Amiri, serif';
    ctx.fillText(ajuz, width / 2, 460);

    // Divider line
    ctx.strokeStyle = 'rgba(197, 160, 89, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(150, 570);
    ctx.lineTo(width - 150, 570);
    ctx.stroke();

    // Footer
    ctx.font = 'bold 26px Cairo, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'right';
    ctx.fillText(`الشاعر: ${poetName}`, width - 150, 630);

    ctx.font = '20px Cairo, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`من قصيدة: «${poemTitle}»`, width - 150, 665);

    ctx.textAlign = 'left';
    ctx.font = 'bold 26px "Reem Kufi", sans-serif';
    ctx.fillStyle = '#c5a059';
    ctx.fillText('مِنَصَّةُ الدِّيوَان', 150, 635);

    ctx.font = '18px Cairo, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('aldiwan.net', 150, 665);

    try {
      const link = document.createElement('a');
      link.download = `diwan-quote-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('تم تصدير وحفظ بطاقة الاقتباس كصورة بنجاح!', 'success');
    } catch (e) {
      console.error(e);
      showToast('تعذر تصدير الصورة على هذا المتصفح', 'error');
    }
  }

  // ==========================================
  // Live Dynamic Search (Server-driven)
  // ==========================================
  async performLiveSearch(query) {
    this.searchResultsList.innerHTML = `
      <div style="padding:2rem;text-align:center;color:var(--charcoal-light);font-size:0.9rem">
        <div style="display:inline-block;width:20px;height:20px;border:2px solid var(--sage-light);border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:10px"></div>
        <div>جاري البحث في الخادم...</div>
      </div>
    `;

    try {
      const results = await this.api.search(query);
      this.searchResultsList.innerHTML = '';

      if (!results || results.length === 0) {
        this.searchResultsList.innerHTML = `
          <div style="padding:2rem;text-align:center;color:var(--charcoal-light);font-size:1.1rem">
            لم يتم العثور على نتائج مطابقة لـ «${escapeHtml(query)}» في الخادم
          </div>
        `;
        return;
      }

      results.forEach(res => {
        const item = document.createElement('div');
        item.className = 'search-item';
        
        let icon = 'book-open';
        if (res.type === 'poet') icon = 'user';
        else if (res.type === 'verse') icon = 'feather';

        item.innerHTML = `
          <div class="search-item-icon">
            <i data-lucide="${icon}" style="width:16px;height:16px"></i>
          </div>
          <div class="search-item-content">
            <div class="search-item-title">${escapeHtml(res.title)}</div>
            <div class="search-item-sub">${escapeHtml(res.subtitle)}</div>
          </div>
        `;

        item.addEventListener('click', () => {
          this.searchOverlay.classList.remove('active');
          document.body.style.overflow = '';
          this.overlaySearchInput.value = '';
          
          if (res.type === 'poet') {
            this.switchView('catalog');
            this.loadPoetPoems(res.data);
          } else {
            this.openPoemReader(res.data, null);
          }
        });

        this.searchResultsList.appendChild(item);
      });

      if (window.lucide) lucide.createIcons();
    } catch (err) {
      console.error('Search error:', err);
      this.searchResultsList.innerHTML = `
        <div style="padding:2rem;text-align:center;color:var(--terracotta);">
          <p style="font-size:1.1rem;margin-bottom:5px">تعذر إتمام البحث عبر الخادم</p>
          <p style="font-size:0.8rem;opacity:0.8">${escapeHtml(err.message)}</p>
        </div>
      `;
    }
  }

  // ==========================================
  // API Settings Handlers & Ping
  // ==========================================
  openSettings() {
    this.apiBaseUrlInput.value = this.api.config.baseUrl;
    this.apiTokenInput.value = this.api.config.token || '';
    this.pingStatusBox.classList.add('hidden');
    this.settingsModal.classList.remove('hidden');
  }

  closeSettings() {
    this.settingsModal.classList.add('hidden');
  }

  saveSettings() {
    const url = this.apiBaseUrlInput.value.trim();
    const token = this.apiTokenInput.value.trim();

    if (!url) {
      showToast('يرجى إدخال رابط API صالح', 'error');
      return;
    }

    this.api.saveConfig(url, token);
    this.closeSettings();
    showToast('تم حفظ إعدادات الـ API بنجاح', 'success');
    this.startApp();
  }

  resetSettings() {
    this.api.resetConfig();
    this.apiBaseUrlInput.value = this.api.config.baseUrl;
    this.apiTokenInput.value = '';
    this.statErasCount.textContent = '-';
    this.statPoetsCount.textContent = '-';
    this.statPoemsCount.textContent = '-';
    showToast('تمت استعادة الإعدادات الافتراضية', 'info');
    this.startApp();
  }

  async testConnection() {
    this.testApiPingBtn.disabled = true;
    this.testApiPingBtn.innerHTML = `
      <div class="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
      جاري الفحص...
    `;

    const res = await this.api.ping();
    this.testApiPingBtn.disabled = false;
    this.testApiPingBtn.innerHTML = `
      <i data-lucide="activity" class="w-4 h-4 text-emerald-400"></i>
      فحص الاتصال (Ping)
    `;

    this.pingStatusBox.classList.remove('hidden');
    if (res.success) {
      this.pingStatusBox.style.cssText = 'background:rgba(5,46,22,0.7);color:#86efac;border:1px solid rgba(74,222,128,0.2);border-radius:8px;padding:10px 14px;font-size:0.78rem;font-weight:500';
      this.pingStatusBox.textContent = `✓ ${res.message}`;
      this.updateApiStatusIndicator('online');
      this.fetchPoemCountQuietly();
    } else {
      this.pingStatusBox.style.cssText = 'background:rgba(69,10,10,0.7);color:#fca5a5;border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:10px 14px;font-size:0.78rem;font-weight:500';
      this.pingStatusBox.textContent = `✕ ${res.message}`;
      this.updateApiStatusIndicator('offline');
    }

    if (window.lucide) lucide.createIcons();
  }

  async checkApiStatusQuietly() {
    const res = await this.api.ping();
    if (res.success) {
      this.updateApiStatusIndicator('online');
      this.fetchPoemCountQuietly();
    } else {
      this.updateApiStatusIndicator('offline');
    }
  }

  async fetchPoemCountQuietly() {
    const count = await this.api.getPoemsCount();
    if (count !== null && count !== undefined) {
      this.statPoemsCount.textContent = `+${Number(count).toLocaleString('en-US')}`;
    }
  }

  updateApiStatusIndicator(status) {
    const dot = this.apiStatusDot;
    const text = this.apiStatusText;
    const badge = this.apiStatusBadge;
    const corsNotice = document.getElementById('corsNotice');

    if (status === 'online') {
      dot.className = 'w-2 h-2 rounded-full status-dot-online';
      text.textContent = 'API متصل';
      badge.style.color = '#4ade80';
      badge.style.borderColor = 'rgba(74,222,128,0.2)';
      if (corsNotice) corsNotice.classList.add('hidden');
    } else {
      dot.className = 'w-2 h-2 rounded-full status-dot-offline';
      text.textContent = 'API غير متصل';
      badge.style.color = '#f87171';
      badge.style.borderColor = 'rgba(248,113,113,0.2)';
      if (corsNotice) corsNotice.classList.remove('hidden');
    }
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.diwanApp = new DiwanApp();
});
