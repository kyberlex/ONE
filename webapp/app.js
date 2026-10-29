/**
 * OPEN NETWORKED EARTH (O.N.E.) — CLIENT APPLICATION LOGIC
 * Pure Vanilla JavaScript (ES6+) • Zero External Dependencies
 */

(function () {
  'use strict';

  const SUPPORTED_LANGS = ['en', 'it', 'fr', 'de', 'es', 'pt', 'ru', 'zh', 'ja', 'ko', 'hi', 'ar', 'id', 'tr'];

  function detectInitialLanguage() {
    // 1. Check URL query param ?lang=xx
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = (urlParams.get('lang') || '').toLowerCase().trim();
      if (urlLang && SUPPORTED_LANGS.includes(urlLang)) {
        try { localStorage.setItem('one_preferred_lang', urlLang); } catch (e) {}
        return urlLang;
      }
    } catch (e) {}

    // 2. Check localStorage (user explicit previous choice)
    try {
      const saved = (localStorage.getItem('one_preferred_lang') || '').toLowerCase().trim();
      if (saved && SUPPORTED_LANGS.includes(saved)) {
        return saved;
      }
    } catch (e) {}

    // 3. Check browser locale (navigator.languages or navigator.language)
    try {
      const browserLangs = (navigator.languages && navigator.languages.length)
        ? navigator.languages
        : [navigator.language || navigator.userLanguage || ''];

      for (const raw of browserLangs) {
        if (!raw) continue;
        const normalized = raw.toLowerCase().trim();
        const primary = normalized.split(/[-_]/)[0];
        const resolved = primary === 'in' ? 'id' : primary;
        if (SUPPORTED_LANGS.includes(resolved)) {
          return resolved;
        }
      }
    } catch (e) {}

    // 4. Default fallback
    return 'en';
  }

  // Application State
  const state = {
    lang: detectInitialLanguage(),
    translations: null,
    qaPairs: [],
    constitution: [],
    constitutionFull: [],
    books: null,
    activeChapter: 'ALL', // Default to All Chapters in explorer
    openChapters: new Set(['I']), // Track which chapters are expanded in accordion (Chapter I open initially)
    searchTerm: '',
    allExpanded: false,
    activePrimerTab: 'postwork',
    selectedTheater: 'vol0',
    availableEbooks: null,

    // The Bootstrap Roadmap State
    roadmap: {
      activeArchetype: 'common_law',
      nodeScale: 5,
      activePhase: 0
    }
  };

  // DOM Elements Cache
  const elements = {
    // Navigation & i18n
    header: document.querySelector('.site-header'),
    brandLogo: document.getElementById('brandLogo'),
    navLinks: document.querySelectorAll('.nav-link'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    navMenu: document.getElementById('navMenu'),
    langSelectorBtn: document.getElementById('langSelectorBtn'),
    langDropdown: document.getElementById('langDropdown'),
    langCurrentCode: document.getElementById('langCurrentCode'),
    langOpts: document.querySelectorAll('.lang-opt'),
    
    // Primer Tabs
    primerTabs: document.getElementById('primerTabs'),
    primerContent: document.getElementById('primerContent'),
    
    // Books & Earth Map
    volumesList: document.getElementById('volumesList'),
    theaterDossierBar: document.getElementById('theaterDossierBar'),
    mapNodes: document.querySelectorAll('.map-node'),
    legendPills: document.querySelectorAll('.legend-pill'),
    earthPhaseStepper: document.getElementById('earthPhaseStepper'),
    
    // Video Briefing Modal
    briefingModal: document.getElementById('briefingModal'),
    briefingModalContainer: document.getElementById('briefingModalContainer'),
    briefingModalCloseBtn: document.getElementById('briefingModalCloseBtn'),
    briefingVideoPlayer: document.getElementById('briefingVideoPlayer'),
    briefingVideoSource: document.getElementById('briefingVideoSource'),
    briefingActBadge: document.getElementById('briefingActBadge'),
    briefingTitle: document.getElementById('briefingTitle'),
    briefingSubtitle: document.getElementById('briefingSubtitle'),
    briefingQuote: document.getElementById('briefingQuote'),
    briefingSynopsis: document.getElementById('briefingSynopsis'),
    briefingActions: document.getElementById('briefingActions'),
    
    // Constitution
    chapterTabs: document.getElementById('chapterTabs'),
    searchInput: document.getElementById('constitutionSearch'),
    articlesList: document.getElementById('articlesAccordion'),
    toggleAllArticlesBtn: document.getElementById('toggleAllArticlesBtn'),
    constEpubDlBtn: document.getElementById('constEpubDlBtn'),
    constPdfDlBtn: document.getElementById('constPdfDlBtn'),
    constStatusBadge: document.getElementById('constStatusBadge'),
    
    // Arena / Challenge
    scenarioChips: document.getElementById('scenarioChips'),
    quickQuestions: document.getElementById('quickQuestions'),
    chatHistory: document.getElementById('chatHistory'),
    chatInput: document.getElementById('chatInput'),
    chatSendBtn: document.getElementById('chatSendBtn'),

    // The Bootstrap Roadmap
    archetypeToggles: document.getElementById('archetypeToggles'),
    scaleToggles: document.getElementById('scaleToggles'),
    configOutputGrid: document.getElementById('configOutputGrid'),
    stepperNav: document.getElementById('stepperNav'),
    stepperContent: document.getElementById('stepperContent'),
    roadmapQaAccordion: document.getElementById('roadmapQaAccordion'),
    openQuickstartBtn: document.getElementById('openQuickstartBtn'),

    // Field Blueprint Modal
    blueprintModal: document.getElementById('blueprintModal'),
    blueprintModalContainer: document.getElementById('blueprintModalContainer'),
    blueprintModalTitle: document.getElementById('blueprintModalTitle'),
    blueprintModalBadge: document.getElementById('blueprintModalBadge'),
    blueprintDownloadBtn: document.getElementById('blueprintDownloadBtn'),
    blueprintModalCloseBtn: document.getElementById('blueprintModalCloseBtn'),
    blueprintArticleWrap: document.getElementById('blueprintArticleWrap'),
    blueprintScrollPane: document.getElementById('blueprintScrollPane'),
    blueprintProgressBar: document.getElementById('blueprintProgressBar')
  };

  // Initialize Application
  async function init() {
    setupEventListeners();
    await loadTranslations(state.lang);
    await loadData(state.lang);
    renderPrimerContent('postwork');
    renderEarthMap();
    renderVolumes();
    renderRoadmapConfigurator();
    renderRoadmapStepper();
    setupRoadmapEvents();
    renderConstitutionTabs();
    renderConstitutionArticles();
    renderScenarioChips();
    setupQuickQuestions();
    setupInitialChat();
    syncVideoSubtitles(state.lang);
    syncFooterNavigation();

    // Resilient deep-link anchor navigation after dynamic DOM population
    handleInitialHashNavigation();
  }

  // Internationalization (i18n) Engine
  async function loadTranslations(lang = 'en') {
    try {
      const cacheBust = `_v=${Date.now()}`;
      const res = await fetch(`i18n/${lang}.json?${cacheBust}`);
      if (res.ok) {
        state.translations = await res.json();
      } else if (lang !== 'en') {
        const fallbackRes = await fetch(`i18n/en.json?${cacheBust}`);
        state.translations = await fallbackRes.json();
      }
    } catch (e) {
      console.warn('Could not load translations for', lang, e);
    }
    applyTranslations();
  }

  function getNestedTranslation(obj, path) {
    if (!obj || !path) return null;
    return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj);
  }

  function applyTranslations() {
    if (!state.translations) return;

    // Set document language and text direction (RTL for Arabic)
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute('dir', state.lang === 'ar' ? 'rtl' : 'ltr');

    // Update active language UI
    if (elements.langCurrentCode) {
      elements.langCurrentCode.textContent = state.lang.toUpperCase();
    }
    if (elements.langOpts) {
      elements.langOpts.forEach(opt => {
        if (opt.getAttribute('data-lang') === state.lang) {
          opt.classList.add('active');
        } else {
          opt.classList.remove('active');
        }
      });
    }

    // Apply text / HTML node replacements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getNestedTranslation(state.translations, key);
      if (val !== undefined && val !== null) {
        if (typeof val === 'string' && (val.includes('<') || val.includes('&'))) {
          el.innerHTML = val;
        } else {
          el.textContent = val;
        }
      }
    });

    // Apply HTML node replacements
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = getNestedTranslation(state.translations, key);
      if (val) el.innerHTML = val;
    });

    // Apply input placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = getNestedTranslation(state.translations, key);
      if (val) el.setAttribute('placeholder', val);
    });

    // Update Quick Chip data-query and labels if localized
    if (elements.quickQuestions && state.translations?.challenge) {
      const c = state.translations.challenge;
      const chipData = [
        { query: c.chip_work_query, label: c.chip_work },
        { query: c.chip_money_query, label: c.chip_money },
        { query: c.chip_property_query, label: c.chip_property },
        { query: c.chip_prisons_query, label: c.chip_prisons },
        { query: c.chip_politics_query, label: c.chip_politics },
        { query: c.chip_patents_query, label: c.chip_patents },
        { query: c.chip_army_query, label: c.chip_army },
        { query: c.chip_ussr_query, label: c.chip_ussr },
        { query: c.chip_capitalism_query, label: c.chip_capitalism },
        { query: c.chip_education_query, label: c.chip_education },
        { query: c.chip_religion_query, label: c.chip_religion },
        { query: c.chip_discrimination_query, label: c.chip_discrimination }
      ];
      const chips = elements.quickQuestions.querySelectorAll('.quick-chip');
      chips.forEach((chip, i) => {
        if (chipData[i]) {
          if (chipData[i].query) chip.setAttribute('data-query', chipData[i].query);
          if (chipData[i].label) chip.textContent = chipData[i].label;
        }
      });
    }

    // Update Constitution download links and smart badge based on active language
    updateConstitutionDownloadUI();

    // Re-render dynamic components so translations take effect instantly
    renderRoadmapConfigurator();
    renderRoadmapStepper();
    syncFooterNavigation();
  }

  // Synchronize footer menu dynamically with header navMenu
  function syncFooterNavigation() {
    const navMenu = document.getElementById('navMenu');
    const footerLinks = document.getElementById('footerLinks');
    if (!navMenu || !footerLinks) return;

    const links = navMenu.querySelectorAll('a.nav-link');
    let html = '';
    links.forEach(link => {
      const href = link.getAttribute('href');
      const text = link.innerHTML;
      const isTargetBlank = link.getAttribute('target') === '_blank';
      const targetAttr = isTargetBlank ? 'target="_blank" rel="noopener noreferrer"' : '';
      const i18nAttr = link.getAttribute('data-i18n') ? `data-i18n="${link.getAttribute('data-i18n')}"` : '';
      const isSimulator = link.classList.contains('nav-link-simulator');
      const classAttr = isSimulator ? 'class="footer-nav-link footer-nav-simulator"' : 'class="footer-nav-link"';
      
      html += `<a href="${href}" ${targetAttr} ${i18nAttr} ${classAttr}>${text}</a>`;
    });
    footerLinks.innerHTML = html;
  }

  // ==========================================
  // Dynamic & Autonomous E-Book Detection Engine
  // ==========================================

  // In-memory cache for probed files to avoid redundant HTTP requests
  const probedEbooksCache = new Map();

  /**
   * Resolves the available EPUB file for a given item ('constitution' or 'vol0'..'vol5') and language.
   * Checks state.availableEbooks (from available_ebooks.json) using exact & pattern matches.
   * Returns { available: boolean, url: string, filename: string }
   */
  function resolveEbook(itemId, lang = state.lang) {
    // 1. Constitution
    if (itemId === 'constitution') {
      const safeFile = `O.N.E._Constitution_${lang}.epub`;
      const legacyFile = lang === 'en' ? 'ONE NETWORKED EARTH (O.N.E.).epub' : `ONE NETWORKED EARTH (O.N.E.)_${lang}.epub`;

      let targetFile = null;
      if (state.availableEbooks) {
        if (state.availableEbooks.has(safeFile)) {
          targetFile = safeFile;
        } else if (state.availableEbooks.has(legacyFile)) {
          targetFile = legacyFile;
        } else {
          // Pattern search in Set
          for (const file of state.availableEbooks) {
            const fl = file.toLowerCase();
            if (fl.endsWith(`_${lang}.epub`) && (fl.includes('constitution') || fl.includes('networked earth'))) {
              targetFile = file;
              break;
            }
          }
        }
      }

      if (targetFile) {
        return { available: true, url: `assets/ebooks/${encodeURI(targetFile)}`, filename: targetFile };
      }

      // Default fallback if manifest hasn't loaded yet
      if (lang === 'en' || ['es', 'it', 'de', 'zh', 'hi'].includes(lang)) {
        return { available: true, url: `assets/ebooks/${encodeURI(safeFile)}`, filename: safeFile };
      }

      return { available: false, url: `assets/ebooks/${encodeURI(safeFile)}`, filename: safeFile };
    }

    // 2. Volumes (vol0 .. vol5)
    const volNum = itemId.replace('vol', '');
    const standardFile = volNum === '0'
      ? (lang === 'en' ? 'O.N.E._Vol0_Genesis_en.epub' : `O.N.E._Vol0_Genesis_${lang}.epub`)
      : (lang === 'en' ? `O.N.E._Vol${volNum}_Open_Networked_Earth_en.epub` : `O.N.E._Vol${volNum}_Open_Networked_Earth_${lang}.epub`);

    if (state.availableEbooks && state.availableEbooks.has(standardFile)) {
      return { available: true, url: `assets/ebooks/${encodeURI(standardFile)}`, filename: standardFile };
    }

    // Pattern search: matches any title variant e.g. O.N.E._Vol1_Terra_Connessa_e_Aperta_it.epub or O.N.E._Vol{N}_*_{lang}.epub
    if (state.availableEbooks) {
      const pattern = new RegExp(`^O\\.N\\.E\\._Vol${volNum}_.*_${lang}\\.epub$`, 'i');
      for (const file of state.availableEbooks) {
        if (pattern.test(file)) {
          return { available: true, url: `assets/ebooks/${encodeURI(file)}`, filename: file };
        }
      }
    }

    // Default fallback for English: if manifest not loaded, vol0-5 in en are available
    if (lang === 'en' && !state.availableEbooks) {
      return { available: true, url: `assets/ebooks/${encodeURI(standardFile)}`, filename: standardFile };
    }

    return { available: false, url: `assets/ebooks/${encodeURI(standardFile)}`, filename: standardFile };
  }

  /**
   * Probes candidate URL opportunistically via HTTP HEAD if not currently listed in state.availableEbooks.
   * If 200 OK, adds to state.availableEbooks and triggers callback.
   */
  async function probeEbookAvailability(itemId, lang, onFound) {
    const res = resolveEbook(itemId, lang);
    if (res.available) return;

    const targetUrl = res.url;
    if (probedEbooksCache.has(targetUrl)) return;

    probedEbooksCache.set(targetUrl, 'pending');
    try {
      const resp = await fetch(targetUrl, { method: 'HEAD' });
      if (resp.ok) {
        if (!state.availableEbooks) state.availableEbooks = new Set();
        state.availableEbooks.add(res.filename);
        probedEbooksCache.set(targetUrl, 'found');
        if (typeof onFound === 'function') onFound(res.url, res.filename);
      } else {
        probedEbooksCache.set(targetUrl, 'not_found');
      }
    } catch (e) {
      probedEbooksCache.set(targetUrl, 'error');
    }
  }

  function updateConstitutionDownloadUI() {
    const res = resolveEbook('constitution', state.lang);
    const isConstAvailable = res.available;
    const constEpubUrl = res.url;

    const tBooks = state.translations?.books || {};
    const constStatusLabel = isConstAvailable
      ? (tBooks.status_complete || 'Complete & Available')
      : (tBooks.status_coming_soon || 'In Translation');

    if (elements.constStatusBadge) {
      elements.constStatusBadge.className = `volume-badge ${isConstAvailable ? 'badge-available' : 'badge-prod'}`;
      elements.constStatusBadge.textContent = constStatusLabel;
    }

    if (elements.constEpubDlBtn) {
      if (isConstAvailable) {
        elements.constEpubDlBtn.setAttribute('href', constEpubUrl);
        elements.constEpubDlBtn.setAttribute('download', res.filename);
        elements.constEpubDlBtn.setAttribute('target', '_blank');
        elements.constEpubDlBtn.setAttribute('rel', 'noopener noreferrer');
        elements.constEpubDlBtn.classList.remove('btn-disabled');
        elements.constEpubDlBtn.removeAttribute('aria-disabled');
        elements.constEpubDlBtn.innerHTML = `
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          ${state.translations?.const?.download_epub || 'Download EPUB'}
        `;
      } else {
        elements.constEpubDlBtn.removeAttribute('href');
        elements.constEpubDlBtn.removeAttribute('download');
        elements.constEpubDlBtn.removeAttribute('target');
        elements.constEpubDlBtn.removeAttribute('rel');
        elements.constEpubDlBtn.classList.add('btn-disabled');
        elements.constEpubDlBtn.setAttribute('aria-disabled', 'true');
        const comingSoonText = tBooks.btn_coming_soon || 'Coming Soon';
        elements.constEpubDlBtn.innerHTML = `
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          ${comingSoonText}
        `;
        // Opportunistic probe: in case newly added file is on server
        probeEbookAvailability('constitution', state.lang, () => {
          updateConstitutionDownloadUI();
        });
      }
    }

    if (elements.constPdfDlBtn) {
      const pdfSafe = 'O.N.E._Constitution_en.pdf';
      elements.constPdfDlBtn.setAttribute('href', `assets/ebooks/${pdfSafe}`);
      elements.constPdfDlBtn.setAttribute('download', pdfSafe);
      elements.constPdfDlBtn.setAttribute('target', '_blank');
      elements.constPdfDlBtn.setAttribute('rel', 'noopener noreferrer');
      elements.constPdfDlBtn.innerHTML = `
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
        ${state.translations?.const?.download_pdf || 'Download PDF'}
      `;
    }
  }

  async function setLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('one_preferred_lang', lang);
    await loadTranslations(lang);
    await loadData(lang);
    renderVolumes();
    renderPrimerContent(state.activePrimerTab);
    renderConstitutionTabs();
    renderConstitutionArticles();
    renderScenarioChips();
    setupInitialChat();
    renderRoadmapConfigurator();
    renderRoadmapStepper();
    applyTranslations();
    syncFooterNavigation();
    syncVideoSubtitles(lang);
  }

  function syncVideoSubtitles(lang) {
    const videoIds = ['explainerVideoPlayer', 'heroVideoPlayer'];
    const targetLang = (lang || 'en').toLowerCase().trim();

    videoIds.forEach(id => {
      const video = document.getElementById(id);
      if (!video) return;

      const applyTracks = () => {
        if (!video.textTracks || video.textTracks.length === 0) return;
        for (let i = 0; i < video.textTracks.length; i++) {
          const track = video.textTracks[i];
          if (track.language && track.language.toLowerCase() === targetLang) {
            track.mode = 'showing';
          } else {
            track.mode = 'disabled';
          }
        }
      };

      applyTracks();
      video.addEventListener('loadedmetadata', applyTracks, { once: true });
    });
  }

  // Fetch local datasets (lightweight, zero volume chapter bloat)
  async function loadData(lang = 'en') {
    try {
      const cacheBust = `_v=${Date.now()}`;
      let qaPath = `data/epistemic_qa.json?${cacheBust}`;
      let constPath = `data/constitution.json?${cacheBust}`;

      if (lang && lang !== 'en') {
        try {
          const checkConst = await fetch(`data/constitution_${lang}.json?${cacheBust}`, { method: 'HEAD' });
          if (checkConst.ok) constPath = `data/constitution_${lang}.json?${cacheBust}`;
        } catch (e) {}

        try {
          const checkQa = await fetch(`data/epistemic_qa_${lang}.json?${cacheBust}`, { method: 'HEAD' });
          if (checkQa.ok) qaPath = `data/epistemic_qa_${lang}.json?${cacheBust}`;
        } catch (e) {}
      }

      const [qaRes, constRes, booksRes, constFullRes, ebooksRes] = await Promise.all([
        fetch(qaPath),
        fetch(constPath),
        fetch(`data/books.json?${cacheBust}`),
        fetch(`data/constitution_full.json?${cacheBust}`),
        fetch(`assets/ebooks/available_ebooks.json?${cacheBust}`).catch(() => null)
      ]);

      if (qaRes && qaRes.ok) state.qaPairs = await qaRes.json();
      if (constRes && constRes.ok) state.constitution = await constRes.json();
      if (booksRes && booksRes.ok) state.books = await booksRes.json();
      if (constFullRes && constFullRes.ok) state.constitutionFull = await constFullRes.json();
      if (ebooksRes && ebooksRes.ok) {
        const ebData = await ebooksRes.json();
        state.availableEbooks = new Set(ebData.files || []);
        updateConstitutionDownloadUI();
      }
    } catch (err) {
      console.warn('Data loading error:', err);
    }
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Navigation link highlighting
    window.addEventListener('hashchange', handleRoute);
    handleRoute();

    // Brand Logo Click -> smooth scroll to top (Home)
    if (elements.brandLogo) {
      elements.brandLogo.addEventListener('click', (e) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (window.location.hash !== '#manifesto') {
          history.pushState(null, '', '#manifesto');
          handleRoute();
        }
      });
    }

    // ScrollSpy to highlight active section on scroll
    const observedSections = ['manifesto', 'co-stewards', 'gateways', 'synoptic', 'constitution', 'benchmark', 'roadmap', 'challenge', 'simulator-section', 'books'];
    const sectionElements = observedSections.map(id => document.getElementById(id)).filter(Boolean);

    if ('IntersectionObserver' in window && sectionElements.length > 0) {
      const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id === 'manifesto') {
              elements.navLinks.forEach(l => l.classList.remove('active'));
            } else {
              elements.navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${id}`) {
                  link.classList.add('active');
                } else {
                  link.classList.remove('active');
                }
              });
            }
          }
        });
      }, {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      });

      sectionElements.forEach(sec => scrollObserver.observe(sec));
    }

    // Mobile menu toggle & close helpers
    const closeMobileMenu = () => {
      if (elements.navMenu) elements.navMenu.classList.remove('active');
      if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.classList.remove('active');
        elements.mobileMenuBtn.textContent = '☰';
        elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    };

    const toggleMobileMenu = () => {
      if (!elements.navMenu || !elements.mobileMenuBtn) return;
      const willOpen = !elements.navMenu.classList.contains('active');
      elements.navMenu.classList.toggle('active', willOpen);
      elements.mobileMenuBtn.classList.toggle('active', willOpen);
      elements.mobileMenuBtn.textContent = willOpen ? '✕' : '☰';
      elements.mobileMenuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      if (willOpen && elements.langDropdown) {
        elements.langDropdown.classList.remove('active');
        elements.langSelectorBtn?.classList.remove('active');
      }
    };

    if (elements.mobileMenuBtn) {
      elements.mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
      });
    }

    if (elements.navLinks) {
      elements.navLinks.forEach(link => {
        link.addEventListener('click', () => {
          closeMobileMenu();
        });
      });
    }

    if (elements.brandLogo) {
      elements.brandLogo.addEventListener('click', () => {
        closeMobileMenu();
      });
    }

    // Primer Tabs Click
    if (elements.primerTabs) {
      elements.primerTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.primer-tab-btn');
        if (!btn) return;
        elements.primerTabs.querySelectorAll('.primer-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabKey = btn.getAttribute('data-tab');
        state.activePrimerTab = tabKey;
        renderPrimerContent(tabKey);
      });
    }

    // Constitution Search & Filters
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value.toLowerCase().trim();
        renderConstitutionArticles();
      });
    }

    // Toggle All Articles & Chapters
    if (elements.toggleAllArticlesBtn) {
      elements.toggleAllArticlesBtn.addEventListener('click', () => {
        state.allExpanded = !state.allExpanded;
        elements.toggleAllArticlesBtn.textContent = state.allExpanded ? 'Collapse All' : 'Expand All';

        if (state.allExpanded) {
          state.constitution.forEach(c => state.openChapters.add(c.number));
        } else {
          state.openChapters.clear();
        }

        const chapterBlocks = elements.articlesList.querySelectorAll('.chapter-block');
        chapterBlocks.forEach(block => {
          if (state.allExpanded) {
            block.classList.add('open');
            block.querySelector('.chapter-header')?.setAttribute('aria-expanded', 'true');
          } else {
            block.classList.remove('open');
            block.querySelector('.chapter-header')?.setAttribute('aria-expanded', 'false');
          }
        });

        const cards = elements.articlesList.querySelectorAll('.article-card');
        cards.forEach(card => {
          if (state.allExpanded) {
            card.classList.add('open');
          } else {
            card.classList.remove('open');
          }
        });
      });
    }

    // Arena Chat Input
    if (elements.chatSendBtn && elements.chatInput) {
      elements.chatSendBtn.addEventListener('click', handleUserChatMessage);
      elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleUserChatMessage();
        }
      });
    }

    // Share Modal Controls
    if (elements.shareCloseBtn) {
      elements.shareCloseBtn.addEventListener('click', () => {
        elements.shareModal.classList.remove('active');
      });
    }

    if (elements.downloadCardBtn) {
      elements.downloadCardBtn.addEventListener('click', downloadDebateCard);
    }

    if (elements.copyCardBtn) {
      elements.copyCardBtn.addEventListener('click', copyDebateCardToClipboard);
    }

    // Language Selector Toggle & Selection
    if (elements.langSelectorBtn && elements.langDropdown) {
      elements.langSelectorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileMenu();
        const willBeActive = !elements.langDropdown.classList.contains('active');
        elements.langDropdown.classList.toggle('active', willBeActive);
        elements.langSelectorBtn.classList.toggle('active', willBeActive);
        elements.langSelectorBtn.closest('.lang-selector-wrap')?.classList.toggle('open', willBeActive);
      });
    }

    if (elements.langOpts) {
      elements.langOpts.forEach(opt => {
        opt.addEventListener('click', (e) => {
          const lang = opt.getAttribute('data-lang');
          if (lang) {
            setLanguage(lang);
            elements.langDropdown?.classList.remove('active');
            elements.langSelectorBtn?.classList.remove('active');
            elements.langSelectorBtn?.closest('.lang-selector-wrap')?.classList.remove('open');
          }
        });
      });
    }

    // Close dropdown, mobile menu, and modals on backdrop click or escape key
    window.addEventListener('click', (e) => {
      if (e.target === elements.shareModal) elements.shareModal.classList.remove('active');
      if (e.target === elements.blueprintModal) closeBlueprintModal();
      if (e.target === elements.briefingModal) closeVideoBriefing();
      if (!e.target.closest('.lang-selector-wrap')) {
        elements.langDropdown?.classList.remove('active');
        elements.langSelectorBtn?.classList.remove('active');
        document.querySelectorAll('.lang-selector-wrap').forEach(w => w.classList.remove('open'));
      }
      if (!e.target.closest('#mobileMenuBtn') && !e.target.closest('#navMenu')) {
        closeMobileMenu();
      }
    });

    if (elements.briefingModalCloseBtn) {
      elements.briefingModalCloseBtn.addEventListener('click', closeVideoBriefing);
    }

    if (elements.briefingModal) {
      elements.briefingModal.addEventListener('click', (e) => {
        if (e.target === elements.briefingModal) {
          closeVideoBriefing();
        }
      });
    }

    if (elements.earthPhaseStepper) {
      const phaseBtns = elements.earthPhaseStepper.querySelectorAll('.phase-btn');
      phaseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          phaseBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const phase = btn.getAttribute('data-phase');
          applyEarthMapPhase(phase);
        });
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
        if (elements.langDropdown && elements.langDropdown.classList.contains('active')) {
          elements.langDropdown.classList.remove('active');
          elements.langSelectorBtn?.classList.remove('active');
          document.querySelectorAll('.lang-selector-wrap').forEach(w => w.classList.remove('open'));
        }
        if (elements.briefingModal && (elements.briefingModal.classList.contains('active') || elements.briefingModal.classList.contains('open'))) {
          closeVideoBriefing();
        }
        if (elements.shareModal && elements.shareModal.classList.contains('active')) {
          elements.shareModal.classList.remove('active');
        }
        if (elements.blueprintModal && elements.blueprintModal.classList.contains('active')) {
          closeBlueprintModal();
        }
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        closeMobileMenu();
      }
    });

    // Explainer Video Play Overlay Controls
    const explainerVid = document.getElementById('explainerVideoPlayer');
    const explainerWrap = document.getElementById('videoWrapper');
    const explainerPlayBtn = document.getElementById('videoPlayOverlayBtn');

    if (explainerVid && explainerPlayBtn && explainerWrap) {
      explainerPlayBtn.addEventListener('click', () => {
        explainerVid.play();
      });
      explainerVid.addEventListener('play', () => {
        explainerWrap.classList.add('is-playing');
      });
      explainerVid.addEventListener('pause', () => {
        explainerWrap.classList.remove('is-playing');
      });
      explainerVid.addEventListener('ended', () => {
        explainerWrap.classList.remove('is-playing');
      });
    }

    // Hero Prologue Video Controls (one-wars-remastered.mp4)
    const heroVid = document.getElementById('heroVideoPlayer');
    const heroWrap = document.getElementById('heroVideoWrapper');
    const heroPlayBtn = document.getElementById('heroVideoPlayOverlayBtn');

    if (heroVid && heroPlayBtn && heroWrap) {
      heroPlayBtn.addEventListener('click', () => {
        heroVid.play();
      });
      heroVid.addEventListener('play', () => {
        heroWrap.classList.add('is-playing');
      });
      heroVid.addEventListener('pause', () => {
        heroWrap.classList.remove('is-playing');
      });
      heroVid.addEventListener('ended', () => {
        heroWrap.classList.remove('is-playing');
      });
    }
  }

  // Handle active navigation state
  function handleRoute() {
    const hash = window.location.hash || '#manifesto';
    elements.navLinks.forEach(link => {
      if (link.getAttribute('href') === hash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Resilient Anchor Navigation Handler for Initial Page Load & External Deep Links
  function handleInitialHashNavigation() {
    const rawHash = window.location.hash;
    if (!rawHash || rawHash === '#' || rawHash === '#manifesto') return;

    let target = null;
    try {
      target = document.querySelector(rawHash);
    } catch (e) {
      target = document.getElementById(rawHash.replace(/^#/, ''));
    }
    if (!target) return;

    // Track user manual interaction so we never hijack if the user starts scrolling
    let userInteracted = false;
    const markInteracted = (e) => {
      if (e.isTrusted) userInteracted = true;
    };
    window.addEventListener('wheel', markInteracted, { passive: true, once: true });
    window.addEventListener('touchmove', markInteracted, { passive: true, once: true });
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space', 'Home', 'End'].includes(e.code)) {
        userInteracted = true;
      }
    }, { passive: true, once: true });

    const scrollToAnchor = (behavior = 'auto') => {
      if (userInteracted) return;
      const header = elements.header || document.querySelector('.site-header');
      const headerHeight = header ? header.offsetHeight : 80;
      const targetY = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: behavior
      });
      handleRoute();
    };

    // 1. Immediately after dynamic content injection and layout calculation
    requestAnimationFrame(() => scrollToAnchor('auto'));

    // 2. Scheduled passes to correct for late font rendering, SVG drawing, and image reflows
    setTimeout(() => scrollToAnchor('auto'), 150);
    setTimeout(() => scrollToAnchor('auto'), 500);
    setTimeout(() => scrollToAnchor('auto'), 1000);
  }

  // Render Interactive Synoptic Primer Content
  function renderPrimerContent(tabKey) {
    if (!elements.primerContent) return;

    if (state.translations && state.translations.primer_content && state.translations.primer_content[tabKey]) {
      elements.primerContent.innerHTML = state.translations.primer_content[tabKey];
      return;
    }

    if (tabKey === 'postwork') {
      elements.primerContent.innerHTML = `
        <div class="primer-tab-pane">
          <h3 class="primer-heading">
            1. The Imminent Post-Labor Reality: Why Automation Changes Everything
          </h3>
          <p class="primer-intro">
            For thousands of years, human civilization operated on the iron rule: <em>"He who does not work, neither shall he eat."</em> 
            Humanoid robotics, autonomous machinery, and generative AI are breaking that equation forever. When machines perform farming, 
            construction, transportation, energy generation, and healthcare at near-zero marginal cost, human survival must be decoupled from employment.
          </p>
          <div class="primer-grid">
            <div class="primer-feature-card">
              <h4>⚠️ The Dystopian Default: Techno-Feudalism</h4>
              <p>Under current market rules, tech monopolies own the automated labor force. Billions become "unemployable," stripped of wages, and forced into extreme precarity while wealth concentrates into a handful of corporate oligarchs.</p>
            </div>
            <div class="primer-feature-card highlight">
              <h4>🌱 The O.N.E. Blueprint: Machine Liberation</h4>
              <p>The productive power of automation is declared the common heritage of all humanity. Machine labor frees human beings from drudgery, poverty, and wage servitude—making food, shelter, and energy free birthrights.</p>
            </div>
          </div>
        </div>
      `;
    } else if (tabKey === 'failures') {
      elements.primerContent.innerHTML = `
        <div class="primer-tab-pane">
          <h3 class="primer-heading">
            2. Why Past Civilizational Models Failed
          </h3>
          <p class="primer-intro">
            Throughout history, humanity tried four major civilizational operating systems. Every single one failed to produce lasting peace, equity, or ecological balance:
          </p>
          <div class="model-comparison">
            <div class="model-box failed">
              <div class="model-name">1. Religion</div>
              <div class="model-status red">Failed</div>
              <div class="model-desc">Holy wars, dogmatic superstition, and clergy hierarchies policing human minds with guilt and supernatural fear.</div>
            </div>
            <div class="model-box failed">
              <div class="model-name">2. Feudalism</div>
              <div class="model-status red">Failed</div>
              <div class="model-desc">Hereditary monarchies owning land by "divine right," reducing ordinary people to serfs under the sword.</div>
            </div>
            <div class="model-box failed">
              <div class="model-name">3. State Communism</div>
              <div class="model-status red">Failed</div>
              <div class="model-desc">Private landlords replaced by party dictators, central planning paralysis, and carceral state terror.</div>
            </div>
            <div class="model-box failed">
              <div class="model-name">4. Capitalism</div>
              <div class="model-status red">Failed</div>
              <div class="model-desc">Compound debt, artificial scarcity, commodification of basic survival, and catastrophic planetary ecocide.</div>
            </div>
          </div>
          <div class="primer-feature-card highlight">
            <h4>✨ The 5th Path: Open Networked Earth (O.N.E.)</h4>
            <p>Neither corporate exploitation nor state tyranny: usufruct care without landlordism, citizen lotteries without politicians, and guaranteed survival without money.</p>
          </div>
        </div>
      `;
    } else if (tabKey === 'pillars') {
      elements.primerContent.innerHTML = `
        <div class="primer-tab-pane">
          <div class="stepper-header">
            <h3 class="primer-heading">
              3. The Four Core Principles of O.N.E.
            </h3>
            <a href="#constitution" class="btn btn-secondary btn-sm">
              <span>📜 Jump to Constitution</span>
              <span>→</span>
            </a>
          </div>
          <div class="primer-grid">
            <div class="primer-feature-card">
              <h4>⚡ 1. The Survival Baseline (Moneyless Society)</h4>
              <p>Every person born on Earth has an unconditional, lifelong birthright to pure water, nutritious food, modern housing, complete healthcare, and clean power. Survival is never a bargaining chip.</p>
            </div>
            <div class="primer-feature-card">
              <h4>🏡 2. Property as Care, Not Speculation</h4>
              <p>Personal belongings (clothing, tools, books) are permanently protected. Family homes are held under secure possessory usufruct for life. Land speculation, rental exploitation, and evictions are strictly abolished.</p>
            </div>
            <div class="primer-feature-card">
              <h4>🎲 3. True Democracy: Citizen Juries (Sortition)</h4>
              <p>No politicians, no parties, no corporate lobbyists. Public decisions are made by everyday citizens chosen by statistical lottery in odd-numbered councils (3, 15, 101, 301, 1001) under a 75% consensus rule.</p>
            </div>
            <div class="primer-feature-card">
              <h4>🌐 4. Open Technology & Analog Resilience</h4>
              <p>All software, medicine formulas, and machine blueprints are 100% open-source (Copyfarleft). Communities maintain 30-day off-grid solar/water storage and manual mechanical valves that work during blackouts.</p>
            </div>
          </div>
          <div class="primer-action-banner">
            <span>
              These principles are codified into 11 chapters of immutable statutory law in the <strong>Living Constitution</strong>.
            </span>
            <a href="#constitution" class="btn btn-primary btn-sm">
              <span>Read the Constitution</span>
              <span>↓</span>
            </a>
          </div>
        </div>
      `;
    } else if (tabKey === 'roadmap') {
      elements.primerContent.innerHTML = `
        <div class="primer-tab-pane">
          <div class="stepper-header">
            <h3 class="primer-heading">
              4. The Transition Roadmap: How We Get There
            </h3>
            <a href="#roadmap" class="btn btn-secondary btn-sm">
              <span>🌱 Jump to Roadmap</span>
              <span>→</span>
            </a>
          </div>
          <p class="primer-intro">
            We do not wait for global collapse or violent revolution. O.N.E. spreads through a <strong>dual-track handshake</strong>: building the resilient new commons today while the legacy system falters.
          </p>
          <div class="primer-grid">
            <div class="primer-feature-card">
              <h4>🇨🇭 1. The Legal Armor (Swiss Verein)</h4>
              <p>Starting as an autonomous Swiss Association (ZGB Art. 60 ff.) holding open IP and assets with zero capital minimums and full member privacy.</p>
            </div>
            <div class="primer-feature-card">
              <h4>🌱 2. Bioregional Seed Nodes</h4>
              <p>Three people can establish a local Community Land Trust (CLT), mutual-aid food forest, or microgrid using open-source O.N.E. governance covenants.</p>
            </div>
            <div class="primer-feature-card">
              <h4>🤝 3. Non-Violent Civil Conversion</h4>
              <p>Unarmed civic peace guilds replace militarized policing with restorative de-escalation; corporate debt is cleared through universal jubilee.</p>
            </div>
            <div class="primer-feature-card">
              <h4>🌍 4. Planetary Federation</h4>
              <p>Watershed councils federate into continental chambers, replacing nation-state rivalries with ecological and thermodynamic coordination.</p>
            </div>
          </div>
          <div class="primer-action-banner">
            <span>
              Ready to see the engineering sizing, legal armor templates, and 15-year decoupling stages?
            </span>
            <a href="#roadmap" class="btn btn-primary btn-sm">
              <span>Explore Operational Roadmap & Blueprints</span>
              <span>↓</span>
            </a>
          </div>
        </div>
      `;
    }
  }

  // Render Interactive Earth Map & Theater Spotlight
  function renderEarthMap() {
    const nodes = document.querySelectorAll('.map-node');
    const legendPills = document.querySelectorAll('.legend-pill');

    function selectTheater(volId, shouldScroll = false) {
      state.selectedTheater = volId;

      // Highlight volume card in the single catalog list
      let targetCard = null;
      document.querySelectorAll('.volume-card').forEach(card => {
        if (card.getAttribute('data-vol-id') === volId) {
          card.classList.add('spotlight');
          targetCard = card;
        } else {
          card.classList.remove('spotlight');
        }
      });

      if (shouldScroll && targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    nodes.forEach(node => {
      node.addEventListener('click', () => {
        const volId = node.getAttribute('data-vol');
        selectTheater(volId, true);
      });
    });

    // Default selection to Vol 0 (Genesis: Svalbard Conclave)
    selectTheater('vol0', false);
  }

  // ========================================================================
  // THE BOOTSTRAP ROADMAP (PRE-AUTOMATION TRANSITION)
  // ========================================================================
  const roadmapData = {
    archetypes: {
      common_law: {
        name: "Common Law (US / UK / Canada / Australia)",
        entity_a: "501(c)(3) Community Land Trust (CLT)",
        entity_b: "Worker-Owned Cooperative (LLC / ULCAA)",
        capital: "Pre-paid Patronage Vouchers ($500–$2,500) under Reves v. Ernst & Young consumer-usufruct exemption",
        zoning: "ANSI A119.5 Park Model RVs / Road-legal mobile chassis on quick-disconnects (Personalty, not fixtures)",
        escrow: "12-Month Municipal Indemnity & Code Defense Escrow",
        statutory_defense: "UCC § 9-604 demountable trade fixtures + 10-year Leasehold Amortization (REPV under 11 U.S.C. § 548)"
      },
      civil_law: {
        name: "Civil Law (Continental European / Swiss)",
        entity_a: "Gemeinnützige Stiftung (ZGB Art. 80 / BGB)",
        entity_b: "Betriebsgenossenschaft / Verein (Cooperative / Association)",
        capital: "Philanthropic non-refundable grants (Schenkungen) + pre-paid educational Gutscheine exempt from BaFin KWG § 1",
        zoning: "Grandfathered residential structures (Bestandsschutz / Wohnteil eines Aussiedlerhofs) + DIBt holding cisterns",
        escrow: "Municipal Police Compliance Escrow (Zustandsstörerhaftung shield)",
        statutory_defense: "Recorded ground lease rental offset (entgeltliche Leistung) defeating InsO § 134 Wertersatz cash clawbacks"
      },
      customary_commons: {
        name: "Customary & Agrarian Commons",
        entity_a: "Inalienable Ejido / TCO Communal Land (RAN registered)",
        entity_b: "Sociedad de Solidaridad Social (SSS) / Agrarian Production Co-op",
        capital: "Communal Revolving Mutual-Aid Fund (Fondo Rotatorio) + forward harvest contracts (Cosecha en Esperanza)",
        zoning: "Bifurcated Siting: Dwellings strictly in Solares Urbanos (RAN titles); Tierras de Uso Común strictly for farming sheds",
        escrow: "Traditional Assembly Solidarity Escrow",
        statutory_defense: "Constitutional inembargabilidad (Art. 27 VII Mexican Const.) + meter-verified CONAGUA water concessions"
      }
    },
    scales: {
      5: {
        title: "5 Founders (Phase 0 Core)",
        water: "15,000 Liters",
        water_desc: "60-day gravity supply (50L/person/day) + parallel 48V DC submersible pump bypass",
        battery: "15 kWh LFP",
        battery_desc: "Subgrade thermal vault, BMS <=0.15C cold-charge limit, 2.5 kW decoupled compute array",
        food: "1.8 Metric Tons",
        food_desc: "180-day dry-bulk cache (grains/legumes) with enzymatic sprouting protocols",
        land: "1.5 – 2 Hectares",
        land_desc: "Rural Unrestricted / Agricultural zoning with unencumbered borehole water rights"
      },
      15: {
        title: "15 Pioneers (Phase 1 Village)",
        water: "45,000 Liters",
        water_desc: "40,000L concrete cistern + 5,000L gravity head tank with dual-feed MTS switch",
        battery: "45 kWh LFP",
        battery_desc: "Multi-rack subgrade battery vault with generator direct-ducted waste-heat loop",
        food: "5.4 Metric Tons",
        food_desc: "180-day sealed bulk reserve + bio-intensive greenhouse producing 80% micronutrients",
        land: "3 – 5 Hectares",
        land_desc: "Ample footprint for silvopasture, Canadian earth-tubes, and 50 m² Thermal Core"
      },
      35: {
        title: "35 Residents (Full Micro-Node)",
        water: "105,000 Liters",
        water_desc: "100,000L dual-cistern array, ultrasonic low-level interlocks, closed-loop greywater reedbeds",
        battery: "100 kWh LFP",
        battery_desc: "Automated microgrid load-shedding contactors cutting fab-lab tools below 80% SOC",
        food: "12.6 Metric Tons",
        food_desc: "180-day bulk reserves + perennial agroforestry + staple root crop storage cellars",
        land: "8 – 12 Hectares",
        land_desc: "Full metabolic closure, watershed LoRa packet mesh, and fab-lab repair workshop"
      }
    },
    phases: [
      {
        badge: "Year 0 • 0% Decoupled",
        title: "Phase 0: Legal Inception & Land",
        stageName: "STAGE 0: LEGAL INCEPTION, LAND SCOUTING & GOVERNANCE",
        docUrl: "blueprints/STAGE_0_LEGAL_INCEPTION_BLUEPRINT.md",
        desc: "The embryonic seed period. 100% reliant on Track A markets, managed transparently via ETI consulting capital without debt.",
        milestones: [
          { label: "Legal Anchor", title: "Two-Tier Incorporation", text: "Entity A (Passive Land Trust) and Entity B (Operating Co-op) chartered with universal zero-debt covenants." },
          { label: "Land Acquisition", title: "2–5 Hectares Secured", text: "Fee title acquired debt-free via charitable gifts; water rights verified; initial mobile chassis placed." },
          { label: "First Governance", title: "Sortition Mediation", text: "3-person lottery mediation panel instituted with decoupled statutory directorships." }
        ]
      },
      {
        badge: "Years 1–3 • 40% Decoupled",
        title: "Phase 1: Survival Core & Food",
        stageName: "STAGE 1: THE 30-DAY SURVIVAL CORE & CALORIC BUFFER",
        docUrl: "blueprints/STAGE_1_SURVIVAL_CORE_BLUEPRINT.md",
        desc: "The node can endure a 30-to-60-day macro-grid collapse or supply chain interdiction without external food, water, or electricity.",
        milestones: [
          { label: "Water & Power", title: "40,000L Cistern + 48V LFP", text: "Deep-well solar pump with low-voltage 48V DC MTS bypass; BMS cold-throttled battery vault." },
          { label: "Caloric Security", title: "180-Day Bulk Food Cache", text: "Dry-bulk grains and legumes in root cellars; enzymatic sprouting; greenhouse construction." },
          { label: "Thermal Survival", title: "50 m² Thermal Core", text: "Super-insulated earth-bermed micro-zone with Canadian earth tubes surviving -25°F polar freezes." }
        ]
      },
      {
        badge: "Years 3–7 • 70% Decoupled",
        title: "Phase 2: Fab-Lab & Tooling",
        stageName: "STAGE 2: THE OPEN-SOURCE FAB-LAB & METABOLIC LEVERAGE",
        docUrl: "blueprints/STAGE_2_FABLAB_METABOLIC_BLUEPRINT.md",
        desc: "Tooling, machinery maintenance, and replacement costs collapse to zero via open-source self-replication and biological closure.",
        milestones: [
          { label: "The Fab-Lab", title: "Air-Gapped Workshop", text: "CNC plasma cutter, metal lathe, TIG welder running 100% offline LinuxCNC/FreeCAD toolchains." },
          { label: "Metabolic Closure", title: "Closed-Loop Sanitation", text: "Thermophilic compost sanitation, biological greywater reed-beds, and passive-solar hydronic heat." },
          { label: "Staple Crops", title: "Agroforestry & Silvopasture", text: "Perennial nut trees, staple root crops, and small ruminants providing caloric self-sufficiency." }
        ]
      },
      {
        badge: "Years 7–15 • 90% Decoupled",
        title: "Phase 3: Watershed Federation",
        stageName: "STAGE 3: WATERSHED FEDERATION & SOVEREIGN COMMONS",
        docUrl: "blueprints/STAGE_3_WATERSHED_FEDERATION_BLUEPRINT.md",
        desc: "Autonomous bioregional commons interconnected via high-bandwidth mesh and physical thermodynamic barter.",
        milestones: [
          { label: "Inter-Node Mesh", title: "Watershed Federation", text: "3 to 5 neighboring micro-nodes linked via LoRa packet radio and shared machinery cooperatives." },
          { label: "Thermodynamic Swaps", title: "Leontief-Kantorovich Trade", text: "Direct non-monetary physical swaps of exergy, tool-time, and seeds with zero fiat intermediary." },
          { label: "Legacy Severing", title: "Complete Decoupling", text: "External utility lines severed or maintained strictly as cold tertiary backup feeds." }
        ]
      }
    ]
  };

  // Embedded Italian Fallback to eliminate any chance of English leakage under Italian locale
  const itRoadmapFallback = {
    archetypes: {
      common_law: {
        name: "Common Law (USA / Regno Unito / Canada / Australia)",
        entity_a: "501(c)(3) Community Land Trust (CLT)",
        entity_b: "Cooperativa di Lavoratori (LLC / ULCAA)",
        capital: "Voucher di consumo prepagati ($500–$2.500) sotto esenzione d'usufrutto Reves v. Ernst & Young",
        zoning: "Case mobili omologate ANSI A119.5 Park Model RVs con allacci a sgancio rapido (beni mobili smontabili)",
        escrow: "Fondo di riserva di 12 mesi per indennità municipale e spese legali",
        statutory_defense: "Beni mobili industriali UCC § 9-604 + ammortamento locativo decennale (REPV ex 11 U.S.C. § 548)"
      },
      civil_law: {
        name: "Diritto Civile (Europa Continentale / Svizzera / Italia)",
        entity_a: "Gemeinnützige Stiftung (Fondazione di Pubblica Utilità - ZGB Art. 80 / Codice Civile)",
        entity_b: "Betriebsgenossenschaft / Cooperativa di Lavoro e Produzione",
        capital: "Donazioni filantropiche a fondo perduto + voucher formativi prepagati esenti da vigilanza bancaria",
        zoning: "Edifici agricoli preesistenti tutelati (Bestandsschutz / cascine) + cisterne a tenuta stagna DIBt",
        escrow: "Fondo di conformità edilizia municipale (scudo di responsabilità ex art. 677 CC)",
        statutory_defense: "Canone di locazione del suolo registrato a corrispettivo reale a prova di revocatoria fallimentare"
      },
      customary_commons: {
        name: "Usi Civici Tradizionali e Beni Comuni Agrari",
        entity_a: "Terreni Comunitari Inalienabili / Ejido / Vicinie registrate",
        entity_b: "Sociedad de Solidaridad Social (SSS) / Cooperativa di Mutuo Soccorso",
        capital: "Fondo Rotativo Comunitario di Mutuo Aiuto + contratti di anticipo sul raccolto",
        zoning: "Autocostruzione tradizionale in terra cruda e pietra a secco con diritti consuetudinari d'uso",
        escrow: "Assemblea degli anziani custodi e cauzione comunitaria per controversie d'acqua",
        statutory_defense: "Trattati internazionali sui diritti dei popoli indigeni (Convenzione OIL 169) e diritto agrario costituzionale"
      }
    },
    scales: {
      "5": {
        water: "Cisterna da 40.000 L + Pozzo",
        water_desc: "40.000L interrati antigelo con deviazione manuale a batteria 48V DC per il pozzo",
        battery: "Banco LFP da 15 kWh (48V)",
        battery_desc: "Bunker batterie isolato con riscaldamento BMS passivo antigelo",
        food: "180 Giorni di Scorte",
        food_desc: "Legumi, cereali sigillati e germogliatore quotidiano ad alto rendimento vitaminico",
        land: "0,8 ettari"
      },
      "15": {
        water: "Cisterna da 120.000 L + Doppio Pozzo",
        water_desc: "Doppio serbatoio a gravità con filtrazione a sabbia e raggi UV a 24V",
        battery: "Banco LFP da 45 kWh (48V)",
        battery_desc: "Accumulatori industriali LFP con ridondanza a triplo modulo e generatore a gasogeno",
        food: "180 Giorni per 15 Persone",
        food_desc: "Orticoltura bio-intensiva su terrazzamenti + cella interrata a temperatura costante",
        land: "2,5 ettari"
      },
      "35": {
        water: "Bacino Idrico da 300.000 L",
        water_desc: "Bacino montano a caduta naturale con pressione idrostatica costante senza pompe elettriche",
        battery: "Microrete da 120 kWh (48V / 400V)",
        battery_desc: "Inverter bidirezionali trifase in isola con accoppiamento AC e micro-idroelettrico",
        food: "Autonomia Biennale di Bacino",
        food_desc: "Agroforestazione diversificata, policolture perenni e stoccaggio sotterraneo ad atmosfera controllata",
        land: "6 ettari"
      }
    },
    phases: [
      {
        title: "Fase 0: Fondazione Legale e Inalienabilità della Terra",
        badge: "Anno 0 • Blindatura Legale",
        desc: "Blindare la terra prima che arrivi qualsiasi macchinario. Nessun alloggio viene costruito finché lo scudo giuridico a due livelli non è formalizzato e registrato.",
        milestones: [
          {
            label: "Scudo Legale",
            title: "Separazione a Due Livelli",
            text: "Costituzione del Land Trust passivo e della Cooperativa Operativa con conti bancari rigorosamente distinti."
          },
          {
            label: "Titolo d'Uso",
            title: "Patto d'Usufrutto a 99 Anni",
            text: "Contratto d'usufrutto con clausola anti-ipoteca registrato a protezione perenne contro gli speculatori."
          },
          {
            label: "Autonomia Idrica",
            title: "Pozzo a Gravità e Analisi",
            text: "Verifica chimica dell'acqua, perforazione del pozzo e prima riserva interrata da 40.000 litri."
          }
        ]
      },
      {
        title: "Fase 1: Nucleo Vitale e Sovranità Alimentare",
        badge: "Anni 1–3 • Autosufficienza Biologica",
        desc: "Raggiungere l'indipendenza nutrizionale ed energetica essenziale per il primo nucleo di abitanti stabili.",
        milestones: [
          {
            label: "Micro-Zona Termica",
            title: "Nucleo Protetto da 50 m²",
            text: "Costruzione del nucleo centrale iper-isolato e riscaldato a inerzia termica passiva contro il gelo estremo."
          },
          {
            label: "Microrete 48V",
            title: "Isola Solare con Batterie LFP",
            text: "Array fotovoltaico da 8 kW con accumulo al litio ferro-fosfato e logica di distacco carichi non prioritari."
          },
          {
            label: "Coltivazione Bio-Intensiva",
            title: "Orto perenne e Cella Frigo",
            text: "Primi 2.000 m² a policoltura ad alto rendimento e cantina interrata di conservazione calorica."
          }
        ]
      },
      {
        title: "Fase 2: Fab-Lab, Attrezzi e Sostegno Economico",
        badge: "Anni 3–7 • Officina Aperta",
        desc: "Dotare la comunità di macchinari per la lavorazione di metalli, legno e circuiti, attivando il ponte economico verso l'esterno.",
        milestones: [
          {
            label: "Officina Meccanica",
            title: "Fresatrici CNC e Saldatura",
            text: "Attivazione di macchinari a controllo numerico alimentati dalla microrete trifase per riparazioni autonome."
          },
          {
            label: "Ponte Economico",
            title: "Consulenze Cognitive ETI",
            text: "Consulenze specialistiche esterne a tempo calmierato (max 15h/sett) con fatturazione in valuta fiat."
          },
          {
            label: "Laboratorio Bio-Chimico",
            title: "Analisi e Fermentazione",
            text: "Controllo microbiologico di acque e sementi per garantire l'integrità del bacino ecologico."
          }
        ]
      },
      {
        title: "Fase 3: Federazione di Bacino Idrografico e Beni Comuni",
        badge: "Anni 7–15 • Rete Bioregionale",
        desc: "Connettere 3-5 nodi seme limitrofi in una federazione ecologica e produttiva, superando completamente le dipendenze esterne.",
        milestones: [
          {
            label: "Rete Radio Mesh",
            title: "Connessione Crittografica",
            text: "Collegamento wireless su frequenze libere e LoRa tra comunità per lo scambio istantaneo di telemetrie."
          },
          {
            label: "Baratto Termodinamico",
            title: "Scambi Senza Moneta",
            text: "Scambio diretto di chilowattora, sementi e ore-macchina calcolati in unità energetiche reali senza denaro."
          },
          {
            label: "Svincolo Totale",
            title: "Isola Infrastrutturale Completa",
            text: "Disconnessione permanente dalle forniture energetiche centralizzate con piena sovranità comunitaria."
          }
        ]
      }
    ]
  };

  function renderRoadmapConfigurator() {
    if (!elements.configOutputGrid) return;

    const archKey = state.roadmap.activeArchetype;
    const scaleKey = String(state.roadmap.nodeScale);
    const isIt = state.lang === 'it';
    const t = state.translations?.roadmap_config || {};
    const itFallback = itRoadmapFallback;

    const arch = (t.archetypes && t.archetypes[archKey])
      || (isIt && itFallback.archetypes[archKey])
      || roadmapData.archetypes[archKey]
      || roadmapData.archetypes.common_law;

    const scale = (t.scales && (t.scales[scaleKey] || t.scales[Number(scaleKey)]))
      || (isIt && itFallback.scales[scaleKey])
      || roadmapData.scales[scaleKey]
      || roadmapData.scales[5];

    const tag1 = t.tag_legal || (isIt ? "1. Struttura Legale dell'Entità" : '1. Legal Entity Skeleton');
    const descOperating = t.desc_operating || (isIt ? 'Operante tramite:' : 'Operating through:');
    const descDebt = t.desc_debt || (isIt ? 'La regola di Zero Debito Non Garantito impedisce ai debiti commerciali di toccare il Land Trust.' : 'Universal Zero Unsecured Debt invariant bars trade liabilities from touching Land Trust.');
    const tag2 = t.tag_zoning || (isIt ? '2. Difesa Urbanistica e del Suolo' : '2. Zoning & Siting Defense');
    const tag3 = t.tag_capital || (isIt ? '3. Formazione del Capitale' : '3. Capital Formation');
    const tag4 = t.tag_water || (isIt ? '4. Sovranità Idrica' : '4. Water Sovereignty');
    const tag5 = t.tag_battery || (isIt ? '5. Banco Batterie 48V LFP' : '5. 48V LFP Battery Bank');
    const tag6 = t.tag_food || (isIt ? '6. Riserva Calorica di 180 Giorni' : '6. 180-Day Caloric Cache');

    elements.configOutputGrid.innerHTML = `
      <div class="config-card">
        <span class="config-card-tag">${tag1}</span>
        <div class="config-card-value">${arch.entity_a}</div>
        <div class="config-card-desc">${descOperating} <strong>${arch.entity_b}</strong>. ${descDebt}</div>
      </div>

      <div class="config-card">
        <span class="config-card-tag">${tag2}</span>
        <div class="config-card-value">${arch.zoning}</div>
        <div class="config-card-desc">${arch.escrow}</div>
      </div>

      <div class="config-card">
        <span class="config-card-tag">${tag3}</span>
        <div class="config-card-value">${arch.capital}</div>
        <div class="config-card-desc">${arch.statutory_defense}</div>
      </div>

      <div class="config-card">
        <span class="config-card-tag">${tag4}</span>
        <div class="config-card-metric">${scale.water}</div>
        <div class="config-card-desc">${scale.water_desc}</div>
      </div>

      <div class="config-card">
        <span class="config-card-tag">${tag5}</span>
        <div class="config-card-metric">${scale.battery}</div>
        <div class="config-card-desc">${scale.battery_desc}</div>
      </div>

      <div class="config-card">
        <span class="config-card-tag">${tag6}</span>
        <div class="config-card-metric">${scale.food}</div>
        <div class="config-card-desc">${scale.food_desc} (${scale.land})</div>
      </div>
    `;
  }

  function renderRoadmapStepper() {
    if (!elements.stepperContent || !elements.stepperNav) return;

    const phaseIndex = state.roadmap.activePhase;
    const isIt = state.lang === 'it';
    const tPhases = state.translations?.roadmap_phases;
    const tStepper = state.translations?.roadmap_stepper || {};
    const defaultPhase = roadmapData.phases[phaseIndex] || roadmapData.phases[0];
    const itPhase = itRoadmapFallback.phases[phaseIndex];
    const phase = (tPhases && tPhases[phaseIndex]) || (isIt ? itPhase : null) || defaultPhase;
    const docUrl = defaultPhase.docUrl;

    const stepBtns = elements.stepperNav.querySelectorAll('.step-btn');
    stepBtns.forEach(btn => {
      const p = parseInt(btn.getAttribute('data-phase'), 10);
      if (p === phaseIndex) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const milestones = phase.milestones || (isIt && itPhase ? itPhase.milestones : defaultPhase.milestones);
    const milestonesHtml = milestones.map(m => `
      <div class="step-detail-card">
        <span class="step-detail-label">${m.label}</span>
        <div class="step-detail-title">${m.title}</div>
        <div class="step-detail-text">${m.text}</div>
      </div>
    `).join('');

    const defaultBtnView = isIt 
      ? `📐 Guarda il Progetto da Campo della Fase ${phaseIndex}`
      : `📐 View Stage ${phaseIndex} Field Blueprint & Handout`;
    const defaultBtnDownload = isIt 
      ? '⬇️ Scarica Progetto (.md)' 
      : '⬇️ Download Blueprint (.md)';

    const btnView = tStepper.btn_view_stage 
      ? tStepper.btn_view_stage.replace('{stage}', phaseIndex)
      : defaultBtnView;
    const btnDownload = tStepper.btn_download || defaultBtnDownload;

    elements.stepperContent.innerHTML = `
      <div class="stepper-header">
        <h4 class="stepper-title">
          ${phase.title}
        </h4>
        <span class="archetype-pill status-pill">
          ${phase.badge}
        </span>
      </div>
      <p class="stepper-desc">
        ${phase.desc}
      </p>
      <div class="step-detail-grid">
        ${milestonesHtml}
      </div>
      <div class="step-blueprint-actions">
        <button class="btn-blueprint-cta" id="viewStageBlueprintBtn" data-phase="${phaseIndex}">
          <span>${btnView}</span>
        </button>
        <a href="${docUrl}" download class="btn-blueprint-download" title="Download Markdown Blueprint">
          <span>${btnDownload}</span>
        </a>
      </div>
    `;

    const bpBtn = elements.stepperContent.querySelector('#viewStageBlueprintBtn');
    if (bpBtn) {
      bpBtn.addEventListener('click', () => {
        openBlueprintModal(phaseIndex);
      });
    }
  }

  function setupRoadmapEvents() {
    if (elements.archetypeToggles) {
      const archBtns = elements.archetypeToggles.querySelectorAll('.config-btn');
      archBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          archBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.roadmap.activeArchetype = btn.getAttribute('data-archetype');
          renderRoadmapConfigurator();
        });
      });
    }

    if (elements.scaleToggles) {
      const scaleBtns = elements.scaleToggles.querySelectorAll('.config-btn');
      scaleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          scaleBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.roadmap.nodeScale = parseInt(btn.getAttribute('data-scale'), 10);
          renderRoadmapConfigurator();
        });
      });
    }

    if (elements.stepperNav) {
      const stepBtns = elements.stepperNav.querySelectorAll('.step-btn');
      stepBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          state.roadmap.activePhase = parseInt(btn.getAttribute('data-phase'), 10);
          renderRoadmapStepper();
        });
      });
    }

    if (elements.openQuickstartBtn) {
      elements.openQuickstartBtn.addEventListener('click', () => {
        openBlueprintModal('quickstart');
      });
    }

    if (elements.blueprintModalCloseBtn) {
      elements.blueprintModalCloseBtn.addEventListener('click', closeBlueprintModal);
    }

    if (elements.blueprintScrollPane && elements.blueprintProgressBar) {
      elements.blueprintScrollPane.addEventListener('scroll', () => {
        const pane = elements.blueprintScrollPane;
        const maxScroll = pane.scrollHeight - pane.clientHeight;
        const progress = maxScroll > 0 ? (pane.scrollTop / maxScroll) * 100 : 0;
        elements.blueprintProgressBar.style.width = `${progress}%`;
      });
    }

    if (elements.roadmapQaAccordion) {
      const qaCards = elements.roadmapQaAccordion.querySelectorAll('.qa-card');
      qaCards.forEach(card => {
        const btn = card.querySelector('.qa-question-btn');
        if (btn) {
          btn.addEventListener('click', () => {
            const isOpen = card.classList.contains('open');
            qaCards.forEach(c => {
              c.classList.remove('open');
              const b = c.querySelector('.qa-question-btn');
              if (b) b.setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
              card.classList.add('open');
              btn.setAttribute('aria-expanded', 'true');
            }
          });
        }
      });
    }
  }

  async function openBlueprintModal(key) {
    if (!elements.blueprintModal) return;
    let title = '';
    let badge = '';
    let docUrl = '';
    const isIt = state.lang === 'it';
    if (key === 'quickstart') {
      title = isIt ? 'GUIDA RAPIDA NODI SEME E MANUALE DI SOPRAVVIVENZA FONDATORI' : 'SEED NODE QUICKSTART & FOUNDERS SURVIVAL GUIDE';
      badge = isIt ? 'Guida Rapida' : 'Quickstart Guide';
      docUrl = 'blueprints/SEED_NODE_QUICKSTART_HANDBOOK.md';
    } else {
      const idx = typeof key === 'number' ? key : parseInt(key, 10);
      const defaultP = roadmapData.phases[idx] || roadmapData.phases[0];
      const tPhases = state.translations?.roadmap_phases;
      const itPhase = itRoadmapFallback.phases[idx];
      const p = (tPhases && tPhases[idx]) || (isIt ? itPhase : null) || defaultP;
      title = p.title || p.stageName;
      badge = p.badge;
      docUrl = defaultP.docUrl;
    }

    if (elements.blueprintModalTitle) elements.blueprintModalTitle.textContent = title;
    if (elements.blueprintModalBadge) elements.blueprintModalBadge.textContent = badge;
    if (elements.blueprintDownloadBtn) {
      elements.blueprintDownloadBtn.href = docUrl;
      elements.blueprintDownloadBtn.setAttribute('download', docUrl.split('/').pop());
    }

    if (elements.blueprintScrollPane) {
      elements.blueprintScrollPane.scrollTop = 0;
    }
    if (elements.blueprintProgressBar) {
      elements.blueprintProgressBar.style.width = '0%';
    }

    if (elements.blueprintArticleWrap) {
      elements.blueprintArticleWrap.innerHTML = `
        <div class="blueprint-loading-box">
          <div class="spinner-icon">⚙️</div>
          <div>Loading Field Blueprint...</div>
        </div>
      `;
    }

    elements.blueprintModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
      const resp = await fetch(docUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const rawMd = await resp.text();
      if (elements.blueprintArticleWrap) {
        elements.blueprintArticleWrap.innerHTML = formatMarkdownToHtml(rawMd);
      }
    } catch (err) {
      if (elements.blueprintArticleWrap) {
        elements.blueprintArticleWrap.innerHTML = `
          <div class="blueprint-error-box">
            <h3>Unable to load blueprint text directly</h3>
            <p>You can download or view the markdown file directly:</p>
            <a href="${docUrl}" download class="btn btn-primary">⬇️ Download ${docUrl.split('/').pop()}</a>
          </div>
        `;
      }
    }
  }

  function closeBlueprintModal() {
    if (elements.blueprintModal) {
      elements.blueprintModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  const SAGA_VOL_META = {
    vol0: {
      act: "ACT I // SVALBARD (2026)",
      quote: "“The old world collapses in 18 months. If you don't design what comes next... who will?”",
      accent: "var(--accent-cyan)",
      video: "assets/videos/one_vol0_briefing.mp4"
    },
    vol1: {
      act: "ACT II // DETROIT (2027)",
      quote: "“When the factory locks its doors, the city wakes up.”",
      accent: "var(--accent-cyan)",
      video: "assets/videos/one_vol1_briefing.mp4"
    },
    vol2: {
      act: "ACT II // THE ALPS (2028)",
      quote: "“Water, energy, and transit belong to the living watershed.”",
      accent: "var(--accent-cyan)",
      video: "assets/videos/one_vol2_briefing.mp4"
    },
    vol3: {
      act: "ACT II // THE ANDES (2029)",
      quote: "“Defending 4,000-meter glacial water from speculative cartels.”",
      accent: "var(--accent-cyan)",
      video: "assets/videos/one_vol3_briefing.mp4"
    },
    vol4: {
      act: "ACT II // MALACCA (2030)",
      quote: "“A single laser beam through the monsoon to liberate the global fleet.”",
      accent: "var(--accent-cyan)",
      video: "assets/videos/one_vol4_briefing.mp4"
    },
    vol5: {
      act: "ACT III // GENEVA (2031)",
      quote: "“500 ordinary citizens chosen by lot to ratify humanity's survival.”",
      accent: "var(--accent-cyan)",
      video: "assets/videos/one_vol5_briefing.mp4"
    }
  };

  function openVideoBriefing(volId) {
    if (!elements.briefingModal || !state.books) return;
    const vol = state.books.volumes.find(v => v.id === volId);
    if (!vol) return;
    const meta = SAGA_VOL_META[volId] || {};

    const locVol = state.translations?.volume_details?.[vol.id] || {};
    const volTitle = locVol.title || vol.title;
    const volSubtitle = locVol.subtitle || vol.subtitle;
    const volBlurb = locVol.blurb || vol.blurb;

    if (elements.briefingActBadge) {
      elements.briefingActBadge.textContent = meta.act || "SAGA BRIEFING";
      elements.briefingActBadge.style.borderColor = meta.accent || "var(--accent-cyan)";
      elements.briefingActBadge.style.color = meta.accent || "var(--accent-cyan)";
    }
    if (elements.briefingTitle) elements.briefingTitle.textContent = volTitle;
    if (elements.briefingSubtitle) elements.briefingSubtitle.textContent = volSubtitle;
    if (elements.briefingQuote) elements.briefingQuote.textContent = meta.quote || "";
    if (elements.briefingSynopsis) elements.briefingSynopsis.textContent = volBlurb;

    // Resolve download links
    const res = resolveEbook(vol.id, state.lang);
    const volNum = vol.id.replace('vol', '');
    let pdfFilename = volNum === '0'
      ? (state.lang === 'it' ? 'O.N.E._Vol0_Genesis_it.pdf' : 'O.N.E._Vol0_Genesis_en.pdf')
      : (state.lang === 'it' && volNum === '1' ? 'O.N.E._Vol1_Terra_Connessa_e_Aperta_it.pdf' : `O.N.E._Vol${volNum}_Open_Networked_Earth_en.pdf`);
    if (state.availableEbooks && !state.availableEbooks.has(pdfFilename)) {
      pdfFilename = volNum === '0' ? 'O.N.E._Vol0_Genesis_en.pdf' : `O.N.E._Vol${volNum}_Open_Networked_Earth_en.pdf`;
    }

    if (elements.briefingActions) {
      elements.briefingActions.innerHTML = `
        <a href="${res.url}" class="btn btn-primary" download="${res.filename}" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Download EPUB
        </a>
        <a href="assets/ebooks/${pdfFilename}" class="btn btn-secondary" download="${pdfFilename}" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
          Download PDF
        </a>
      `;
    }

    if (elements.briefingVideoPlayer && elements.briefingVideoSource) {
      elements.briefingVideoSource.src = meta.video || `assets/videos/one_${volId}_briefing.mp4`;
      elements.briefingVideoPlayer.load();
      elements.briefingVideoPlayer.play().catch(() => {});
    }

    elements.briefingModal.classList.add('open');
    elements.briefingModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoBriefing() {
    if (!elements.briefingModal) return;
    if (elements.briefingVideoPlayer) {
      elements.briefingVideoPlayer.pause();
      elements.briefingVideoPlayer.currentTime = 0;
      if (elements.briefingVideoSource) elements.briefingVideoSource.src = '';
    }
    elements.briefingModal.classList.remove('open');
    elements.briefingModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  window.openVideoBriefing = openVideoBriefing;
  window.closeVideoBriefing = closeVideoBriefing;

  function applyEarthMapPhase(phase) {
    const nodes = document.querySelectorAll('.map-node');
    const arcsDispersal = document.querySelectorAll('.arc-dispersal');
    const arcsConvergence = document.querySelectorAll('.arc-convergence');
    const arcsParallel = document.querySelectorAll('.arc-parallel');

    if (phase === 'all') {
      nodes.forEach(n => { n.style.opacity = '1'; n.style.filter = ''; });
      arcsDispersal.forEach(a => { a.style.opacity = '0.9'; });
      arcsConvergence.forEach(a => { a.style.opacity = '0.9'; });
      arcsParallel.forEach(a => { a.style.opacity = '0.7'; });
    } else if (phase === 'act1') {
      nodes.forEach(n => {
        const isVol0 = n.dataset.vol === 'vol0';
        n.style.opacity = isVol0 ? '1' : '0.25';
        n.style.filter = isVol0 ? 'drop-shadow(0 0 16px var(--accent-cyan))' : 'grayscale(80%)';
      });
      arcsDispersal.forEach(a => { a.style.opacity = '0.9'; });
      arcsConvergence.forEach(a => { a.style.opacity = '0.1'; });
      arcsParallel.forEach(a => { a.style.opacity = '0.1'; });
    } else if (phase === 'act2') {
      nodes.forEach(n => {
        const v = n.dataset.vol;
        const isParallel = ['vol1', 'vol2', 'vol3', 'vol4'].includes(v);
        n.style.opacity = isParallel ? '1' : '0.25';
        n.style.filter = isParallel ? 'drop-shadow(0 0 14px var(--accent-cyan))' : 'grayscale(80%)';
      });
      arcsDispersal.forEach(a => { a.style.opacity = '0.9'; });
      arcsParallel.forEach(a => { a.style.opacity = '0.9'; });
      arcsConvergence.forEach(a => { a.style.opacity = '0.2'; });
    } else if (phase === 'act3') {
      nodes.forEach(n => {
        const isVol5 = n.dataset.vol === 'vol5';
        n.style.opacity = isVol5 ? '1' : '0.3';
        n.style.filter = isVol5 ? 'drop-shadow(0 0 20px var(--accent-cyan))' : 'grayscale(80%)';
      });
      arcsDispersal.forEach(a => { a.style.opacity = '0.15'; });
      arcsParallel.forEach(a => { a.style.opacity = '0.15'; });
      arcsConvergence.forEach(a => { a.style.opacity = '1'; });
    }
  }

  // Render Volumes Showcase (3-Act Architecture: Act I -> Act II Parallel -> Act III)
  function renderVolumes() {
    if (!elements.volumesList || !state.books) return;
    const { volumes } = state.books;
    if (!volumes || volumes.length < 6) return;
    const t = state.translations?.books || {};

    const vol0 = volumes[0];
    const vol1_4 = volumes.slice(1, 5);
    const vol5 = volumes[5];

    function createCard(vol, isHero = false, actTag = "") {
      const res = resolveEbook(vol.id, state.lang);
      const isEpubAvailable = res.available;
      const epubUrl = res.url;
      const epubLabel = t.btn_epub || 'Download EPUB';
      const pdfLabel = t.btn_pdf || 'Download PDF';
      const statusLabel = t.status_complete || 'Complete & Available';
      const comingSoonLabel = t.btn_coming_soon || 'Coming Soon';
      const statusComingSoon = t.status_coming_soon || 'In Translation';
      const badgeClass = isEpubAvailable ? 'badge-available' : 'badge-prod';
      const currentBadgeText = isEpubAvailable ? statusLabel : statusComingSoon;

      const volNum = vol.id.replace('vol', '');
      let pdfFilename = volNum === '0'
        ? (state.lang === 'it' ? 'O.N.E._Vol0_Genesis_it.pdf' : 'O.N.E._Vol0_Genesis_en.pdf')
        : (state.lang === 'it' && volNum === '1' ? 'O.N.E._Vol1_Terra_Connessa_e_Aperta_it.pdf' : `O.N.E._Vol${volNum}_Open_Networked_Earth_en.pdf`);
      
      if (state.availableEbooks && !state.availableEbooks.has(pdfFilename)) {
        pdfFilename = volNum === '0' ? 'O.N.E._Vol0_Genesis_en.pdf' : `O.N.E._Vol${volNum}_Open_Networked_Earth_en.pdf`;
      }
      const pdfUrl = `assets/ebooks/${pdfFilename}`;

      const locVol = state.translations?.volume_details?.[vol.id] || {};
      const volTheater = locVol.theater || vol.theater;
      const volTitle = locVol.title || vol.title;
      const volSubtitle = locVol.subtitle || vol.subtitle;
      const volTheme = locVol.core_theme || vol.core_theme;
      const volHook = locVol.hook || vol.hook;
      const meta = SAGA_VOL_META[vol.id] || {};

      const briefingBtnHtml = `
        <button class="btn-download btn-briefing" onclick="openVideoBriefing('${vol.id}')" title="Watch 60s Video Briefing">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          🎬 60s Briefing
        </button>
      `;

      const epubBtnHtml = isEpubAvailable ? `
        <a href="${epubUrl}" class="btn-download" download="${res.filename}" target="_blank" rel="noopener noreferrer" title="Download EPUB eBook">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          ${epubLabel}
        </a>
      ` : `
        <span class="btn-download btn-disabled" title="${comingSoonLabel}" aria-disabled="true">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          ${comingSoonLabel}
        </span>
      `;

      const pdfBtnHtml = `
        <a href="${pdfUrl}" class="btn-download btn-download-pdf" download="${pdfFilename}" target="_blank" rel="noopener noreferrer" title="Download PDF Document">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
          ${pdfLabel}
        </a>
      `;

      const cardClass = isHero ? 'volume-card hero-volume-card' : 'volume-card parallel-volume-card';
      const spotlightClass = vol.id === state.selectedTheater ? 'spotlight' : '';

      return `
        <div class="${cardClass} glass-panel ${spotlightClass}" data-vol-id="${vol.id}">
          <div class="volume-card-thumb-wrap" onclick="openVideoBriefing('${vol.id}')" title="Click to Watch Video Briefing">
            <img src="${vol.cover_image}" alt="${volTitle}" class="volume-card-thumb">
            <div class="thumb-play-overlay">
              <div class="play-circle">▶</div>
              <span>Watch Briefing</span>
            </div>
          </div>
          <div class="volume-card-body">
            <div class="volume-header">
              <div>
                ${actTag ? `<div class="card-act-tag">${actTag}</div>` : ''}
                <div class="volume-theater">${volTheater}</div>
                <h3 class="volume-title">${volTitle}</h3>
                <div class="volume-subtitle">${volSubtitle}</div>
              </div>
            </div>
            <p class="volume-theme">${volTheme}</p>
            ${volHook ? `<p class="volume-hook">${volHook}</p>` : ''}
            <div class="download-bar">
              ${briefingBtnHtml}
              ${epubBtnHtml}
              ${pdfBtnHtml}
            </div>
          </div>
        </div>
      `;
    }

    elements.volumesList.innerHTML = `
      <!-- ACT I: THE GENESIS -->
      <div class="saga-act-wrap act-1">
        <div class="act-header-banner">
          <span class="act-badge-pill">ACT I: THE CLANDESTINE GENESIS (2026)</span>
          <span class="act-header-desc">The Seed of the Commons • Svalbard Arctic Permafrost • Station 74-Nord</span>
        </div>
        ${createCard(vol0, true, "ACT I // SVALBARD 2026")}
      </div>

      <!-- SAGA CONDUIT DIVIDER: DISPERSAL -->
      <div class="saga-phase-divider">
        <div class="conduit-line"></div>
        <div class="conduit-badge">
          <div class="conduit-step-label">ACT II: THE FOUR CONTINENTAL FRONTLINES (2027–2030)</div>
          <div class="conduit-step-sub">⚡ Four simultaneous uprisings operating in parallel • Read in any order ⚡</div>
        </div>
        <div class="conduit-line"></div>
      </div>

      <!-- ACT II: 4 PARALLEL FRONTLINES -->
      <div class="saga-act-wrap act-2">
        <div class="parallel-volumes-grid">
          ${vol1_4.map((v, i) => createCard(v, false, `ACT II // FRONT ${i + 1}`)).join('')}
        </div>
      </div>

      <!-- SAGA CONDUIT DIVIDER: CONVERGENCE -->
      <div class="saga-phase-divider">
        <div class="conduit-line"></div>
        <div class="conduit-badge conduit-convergence">
          <div class="conduit-step-label">ACT III: THE GLOBAL CONVERGENCE (2031)</div>
          <div class="conduit-step-sub">🏛️ Palais des Nations, Geneva • Sortition Demarchy & Planetary Ratification 🏛️</div>
        </div>
        <div class="conduit-line"></div>
      </div>

      <!-- ACT III: CONVERGENCE -->
      <div class="saga-act-wrap act-3">
        <div class="act-header-banner">
          <span class="act-badge-pill">ACT III: THE UNIVERSAL JUBILEE (2031)</span>
          <span class="act-header-desc">The Four Delegations Converge • Ratification of the Living Constitution</span>
        </div>
        ${createCard(vol5, true, "ACT III // GENEVA 2031")}
      </div>
    `;
  }

  // Render Constitution Tabs
  function renderConstitutionTabs() {
    if (!elements.chapterTabs || state.constitution.length === 0) return;
    
    const t = state.translations?.const || {};
    const allLabel = t.tab_all || 'All Chapters';
    const chapPrefix = t.tab_chap || 'Chap';

    let html = `<button class="chapter-tab-btn ${state.activeChapter === 'ALL' ? 'active' : ''}" data-chapter="ALL">${allLabel}</button>`;
    state.constitution.forEach(chap => {
      const activeClass = chap.number === state.activeChapter ? 'active' : '';
      html += `<button class="chapter-tab-btn ${activeClass}" data-chapter="${chap.number}">${chapPrefix} ${chap.number}</button>`;
    });

    elements.chapterTabs.innerHTML = html;

    elements.chapterTabs.querySelectorAll('.chapter-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        elements.chapterTabs.querySelectorAll('.chapter-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.activeChapter = e.currentTarget.getAttribute('data-chapter');
        if (state.activeChapter !== 'ALL') {
          state.openChapters.add(state.activeChapter);
        }
        renderConstitutionArticles();
      });
    });
  }

  // Helper to format inline markdown (bold, italic, inline code)
  function formatInlineMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  // Parse structured article clauses with [art].[#] subitems on new lines
  function renderArticleClauses(art) {
    const artCode = (art.id || '').replace(/^Article\s*/i, '').trim();
    const lines = (art.text || '').split('\n');
    const blocks = [];
    let currentClause = null;

    function flushCurrentClause() {
      if (!currentClause) return;
      let clauseHtml = `
        <div class="clause-item">
          <div class="clause-head">
            <span class="clause-badge" title="Article ${artCode}, Clause ${currentClause.num}">${currentClause.key}</span>
            <div class="clause-body">
              <div class="clause-lead">${formatInlineMarkdown(currentClause.lead)}</div>
      `;
      if (currentClause.bullets.length > 0) {
        clauseHtml += `
          <ul class="clause-bullets">
            ${currentClause.bullets.map(b => `<li>${formatInlineMarkdown(b)}</li>`).join('')}
          </ul>
        `;
      }
      if (currentClause.followups.length > 0) {
        clauseHtml += currentClause.followups
          .map(f => `<p class="clause-followup">${formatInlineMarkdown(f)}</p>`)
          .join('');
      }
      clauseHtml += `
            </div>
          </div>
        </div>
      `;
      blocks.push(clauseHtml);
      currentClause = null;
    }

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
      const bulletMatch = trimmed.match(/^(\*|-)\s+(.*)/);

      if (numMatch) {
        flushCurrentClause();
        const num = numMatch[1];
        currentClause = {
          num: num,
          key: `${artCode}.${num}`,
          lead: numMatch[2],
          bullets: [],
          followups: []
        };
      } else if (bulletMatch) {
        if (currentClause) {
          currentClause.bullets.push(bulletMatch[2]);
        } else {
          blocks.push(`<div class="clause-intro-bullet">• ${formatInlineMarkdown(bulletMatch[2])}</div>`);
        }
      } else {
        if (currentClause) {
          currentClause.followups.push(trimmed);
        } else {
          blocks.push(`<p class="clause-intro-text">${formatInlineMarkdown(trimmed)}</p>`);
        }
      }
    }

    flushCurrentClause();
    return blocks.join('');
  }

  // Render Constitution Articles (Collapsed Accordion by Default)
  function renderConstitutionArticles() {
    if (!elements.articlesList || state.constitution.length === 0) return;

    let filteredChapters = state.constitution;
    if (state.activeChapter !== 'ALL') {
      filteredChapters = state.constitution.filter(c => c.number === state.activeChapter);
    }

    const html = filteredChapters.map(chap => {
      const matchingArticles = chap.articles.filter(art => {
        if (!state.searchTerm) return true;
        const q = state.searchTerm;
        return art.id.toLowerCase().includes(q) ||
               art.title.toLowerCase().includes(q) ||
               art.text.toLowerCase().includes(q);
      });

      if (matchingArticles.length === 0) return '';

      const articlesHtml = matchingArticles.map(art => {
        // Strip markdown hashes and numbers for clean preview snippet
        const cleanSnippet = art.text.replace(/^[#*-\s\d.]+/gm, '').slice(0, 115).trim() + '...';
        const isMatched = state.searchTerm.length > 0;
        const shouldBeOpen = state.allExpanded || isMatched;

        return `
          <div class="article-card glass-panel ${shouldBeOpen ? 'open' : ''} ${isMatched ? 'match' : ''}">
            <div class="article-header">
              <div class="article-title-wrap">
                <span class="article-id-badge">${art.id}</span>
                <div>
                  <span class="article-title">${art.title || art.full_title}</span>
                  <span class="article-preview-line">${cleanSnippet}</span>
                </div>
              </div>
              <svg class="article-chevron" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
            <div class="article-body">
              ${renderArticleClauses(art)}
            </div>
          </div>
        `;
      }).join('');

      const isChapterOpen = state.allExpanded || 
                            state.searchTerm.length > 0 || 
                            state.activeChapter !== 'ALL' || 
                            state.openChapters.has(chap.number);

      const t = state.translations?.const || {};
      const chapterPrefix = t.chapter_label || 'CHAPTER';
      const articleSingular = t.article_singular || 'Article';
      const articlePlural = t.article_plural || 'Articles';

      return `
        <div class="chapter-block glass-panel ${isChapterOpen ? 'open' : ''}" data-chapter="${chap.number}">
          <div class="chapter-header" role="button" tabindex="0" aria-expanded="${isChapterOpen}">
            <div class="chapter-header-left">
              <span class="chapter-num-badge">${chapterPrefix} ${chap.number}</span>
              <h3 class="chapter-title">${chap.title}</h3>
            </div>
            <div class="chapter-header-right">
              <span class="chapter-count-chip">${matchingArticles.length} ${matchingArticles.length === 1 ? articleSingular : articlePlural}</span>
              <svg class="chapter-chevron" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
          <div class="chapter-body">
            <div class="articles-accordion">
              ${articlesHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const tConst = state.translations?.const || {};
    const noArticlesMsg = tConst.no_results || 'No articles match your search criteria.';
    elements.articlesList.innerHTML = html || `<p class="articles-empty-msg">${noArticlesMsg}</p>`;

    // Attach click listener to toggle chapter expansion
    elements.articlesList.querySelectorAll('.chapter-header').forEach(header => {
      header.addEventListener('click', () => {
        const block = header.closest('.chapter-block');
        if (!block) return;
        const chapNum = block.getAttribute('data-chapter');
        const isOpen = block.classList.toggle('open');
        header.setAttribute('aria-expanded', isOpen);
        if (isOpen) {
          state.openChapters.add(chapNum);
        } else {
          state.openChapters.delete(chapNum);
        }
      });
      // Keyboard navigation (Enter / Space)
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });

    // Attach click listener to toggle article expansion
    elements.articlesList.querySelectorAll('.article-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        card.classList.toggle('open');
      });
    });
  }

  // Setup Quick Question Chips
  function setupQuickQuestions() {
    if (!elements.quickQuestions) return;
    elements.quickQuestions.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        if (elements.chatInput) {
          elements.chatInput.value = query;
          handleUserChatMessage();
        }
      });
    });
  }

  // Render Arena Scenario Chips (focused on core verified stress-test exploits)
  function renderScenarioChips() {
    if (!elements.scenarioChips || state.qaPairs.length === 0) return;

    const exploits = state.qaPairs.filter(qa => qa.adversary && qa.adversary !== 'SKEPTIC_DIALECTIC');
    const displayList = exploits.length > 0 ? exploits : state.qaPairs.slice(0, 15);

    elements.scenarioChips.innerHTML = displayList.map((qa, index) => `
      <div class="scenario-chip ${index === 0 ? 'active' : ''}" data-id="${qa.engagement_id}">
        <div class="scenario-chip-title">${qa.title}</div>
      </div>
    `).join('');

    elements.scenarioChips.querySelectorAll('.scenario-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        elements.scenarioChips.querySelectorAll('.scenario-chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const qId = e.currentTarget.getAttribute('data-id');
        const found = state.qaPairs.find(x => x.engagement_id === qId);
        if (found) triggerScenario(found);
      });
    });
  }

  // Initial Scenario Setup
  function setupInitialChat() {
    if (state.qaPairs.length > 0) {
      triggerScenario(state.qaPairs[0]);
    }
  }

  // Helper to render high-empathy accessible adjudicator response
  function renderAdjudicatorMessageHtml(data) {
    const t = state.translations?.challenge || {};
    const labelAdjudicator = t.label_adjudicator || 'O-ASIS NOMOTHETIC ADJUDICATOR';
    const techAuditDict = {
      it: 'Vedi perizia tecnica di simulazione O-ASIS',
      fr: "Voir l'audit technique de simulation O-ASIS",
      es: 'Ver peritaje técnico de simulación O-ASIS',
      de: 'O-ASIS technische Simulationsprüfung anzeigen',
      ru: 'Смотреть техническую экспертизу симуляции O-ASIS',
      en: 'View O-ASIS technical simulation audit'
    };
    const labelTechAudit = t.label_tech_audit || techAuditDict[state.lang] || techAuditDict.en;
    
    const defaultVerdictDict = {
      it: 'RISOLTO',
      fr: 'RÉSOLU',
      es: 'RESUELTO',
      de: 'GELÖST',
      ru: 'РЕШЕНО',
      en: 'RESOLVED'
    };
    const defaultVerdict = defaultVerdictDict[state.lang] || defaultVerdictDict.en;
    const verdictText = data.verdict_human || data.verdict || data.severity_tier || defaultVerdict;
    const tierText = data.severity_tier || data.tier || 'VERIFIED';
    const articles = data.canonical_articles || data.articles || [];
    const countermeasure = data.constitutional_countermeasure || data.countermeasure || data.answer || '';
    
    let humanHtml = '';
    if (data.ai_content) {
      humanHtml = `
        <div class="human-summary-box ai-adjudication-body">
          <div class="ai-response-content">${data.ai_content}</div>
        </div>
      `;
    } else if (data.human_summary && data.human_summary.lead) {
      const pointsHtml = (data.human_summary.points && data.human_summary.points.length > 0)
        ? `<ul class="human-summary-points">${data.human_summary.points.map(pt => `<li>${pt}</li>`).join('')}</ul>`
        : '';
      humanHtml = `
        <div class="human-summary-box">
          <div class="human-summary-lead"><i class="fas fa-check-circle"></i><span>${data.human_summary.lead}</span></div>
          ${pointsHtml}
        </div>
      `;
    } else if (data.answer) {
      humanHtml = `
        <div class="human-summary-box">
          <div class="human-summary-lead"><i class="fas fa-check-circle"></i><span>${data.answer}</span></div>
        </div>
      `;
    }

    const techAuditHtml = countermeasure ? `
      <details class="technical-audit-details">
        <summary>
          <span class="audit-summary-left">
            <i class="fas fa-microchip"></i>
            <span>${labelTechAudit}</span>
          </span>
          <span class="badge-tier">${tierText}</span>
        </summary>
        <div class="technical-audit-content">
          <p>${countermeasure}</p>
        </div>
      </details>
    ` : '';

    const articlesHtml = (articles && articles.length > 0) ? `
      <div class="msg-articles">
        ${articles.map(art => `<span class="article-tag">${art}</span>`).join('')}
      </div>
    ` : '';

    return `
      <div class="chat-msg system">
        <div class="msg-header">
          <span>${labelAdjudicator}</span>
          <span class="msg-verdict">${verdictText}</span>
        </div>
        <div class="msg-body">
          ${humanHtml}
          ${techAuditHtml}
        </div>
        ${articlesHtml}
      </div>
    `;
  }

  // Trigger Scenario in Chat
  function triggerScenario(qa) {
    if (!elements.chatHistory) return;

    const t = state.translations?.challenge || {};
    const labelProbe = t.label_probe || 'ADVERSARIAL ATTACK PROBE';

    const userMsgHtml = `
      <div class="chat-msg user">
        <div class="msg-header">
          <span>${labelProbe} [${qa.engagement_id}]</span>
          <span class="msg-adversary-tag">${qa.adversary}</span>
        </div>
        <div class="msg-body">
          <p><strong>${qa.title}</strong></p>
          <p class="msg-scenario">${qa.scenario}</p>
        </div>
      </div>
    `;

    const systemMsgHtml = renderAdjudicatorMessageHtml(qa);
    elements.chatHistory.innerHTML = userMsgHtml + systemMsgHtml;
  }

  // HTML escaping helper
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // HYBRID 2-TIER COGNITIVE ARCHITECTURE (DIALECTIC ARENA)
  // Tier 1: Local Multilingual Distilled Matrix (< 5ms instant match)
  // Tier 2: Cloudflare Worker + Groq LLaMA 3.3 70B (SSE streaming with offline fallback)
  // ==========================================================================

  // Constitutional Fallback Generator (Level 1 Emergency Guarantee)
  function getConstitutionalFallback() {
    const fallbackDict = {
      it: {
        verdict_human: 'FIREWALL COSTITUZIONALE: Sussistenza biologica garantita e demarchia civica',
        lead: "In base all'Articolo 1.7 (Invarianti Costituzionali), i diritti di sussistenza biologica umana (acqua pura, cibo sano, alloggio, cure mediche, energia pulita) non possono essere sospesi, condizionati o tassati per alcun motivo.",
        points: [
          "La sussistenza vitale è incondizionata e protetta da interblocchi costituzionali non modificabili.",
          "Il coordinamento pubblico è gestito da assemblee di cittadini estratti a sorte a rotazione con maggioranze qualificate del 75%.",
          "Nessun comitato, banchiere o presidente ha il potere di togliere il sostentamento a un essere umano."
        ],
        counter: "In base all'Articolo 1.7 (Invarianti Costituzionali), i diritti di sussistenza biologica umana (acqua pura, cibo, alloggio, cure sanitarie, energia pulita) non possono essere sospesi, condizionati o tassati per alcun motivo. Il coordinamento pubblico è gestito da assemblee di cittadini ordinari estratti a sorte con maggioranze qualificate del 75% e rotazione obbligatoria, impedendo la cattura oligarchica."
      },
      fr: {
        verdict_human: 'PARE-FEU CONSTITUTIONNEL : Subsistance biologique inconditionnelle et démarchie citoyenne',
        lead: "Selon l'Article 1.7 (Invariants Constitutionnels), les droits à la subsistance biologique humaine (eau potable, alimentation saine, logement, soins médicaux, énergie propre) ne peuvent être suspendus, conditionnés ou taxés sous aucun prétexte.",
        points: [
          "La subsistance vitale est inconditionnelle et protégée par des verrous constitutionnels intangibles.",
          "La coordination publique est administrée par des jurys de citoyens tirés au sort avec supermajorité de 75 %.",
          "Aucun banquier, comité ou chef exécutif n'a le pouvoir de priver un être humain de son droit de vivre."
        ],
        counter: "En vertu de l'Article 1.7 (Invariants Constitutionnels), la subsistance humaine de base ne peut être suspendue, conditionnée ou taxée. La délibération civique repose sur des assemblées démarchiques tournantes à seuil de 75 %, excluant toute capture oligarchique."
      },
      es: {
        verdict_human: 'CORTAFUEGOS CONSTITUCIONAL: Subsistencia biológica incondicional y demarquía cívica',
        lead: "Según el Artículo 1.7 (Invariantes Constitucionales), los derechos de subsistencia biológica humana (agua pura, nutrición, techo digno, sanidad, energía limpia) no pueden suspenderse, condicionarse ni gravarse por ningún motivo.",
        points: [
          "El sustento vital es incondicional y está blindado por enclavamientos constitucionales inmutables.",
          "La gobernanza pública se administra mediante jurados ciudadanos rotativos por sorteo con umbrales del 75 %.",
          "Ningún comité, banquero ni presidente tiene la potestad de privar a una persona de su supervivencia."
        ],
        counter: "En virtud del Artículo 1.7 (Invariantes Constitucionales), la subsistencia humana de base no puede suspenderse, condicionarse ni gravarse por ningún motivo. La coordinación pública se gestiona mediante asambleas por sorteo de ciudadanos comunes con umbrales del 75 %, impidiendo la captura oligárquica."
      },
      de: {
        verdict_human: 'VERFASSUNGS-FIREWALL: Bedingungslose Existenzsicherung und Bürger-Demarchie',
        lead: 'Gemäß Artikel 1.7 (Verfassungsinvarianten) können die menschlichen Überlebensrechte (Trinkwasser, gesunde Nahrung, Wohnraum, medizinische Versorgung, saubere Energie) unter keinen Umständen ausgesetzt, konditioniert oder besteuert werden.',
        points: [
          'Lebensnotwendige Grundversorgung ist bedingungslos und durch feste Verfassungsinvarianten geschützt.',
          'Öffentliche Koordination erfolgt über geloste, rotierende Bürgerjurys mit 75%-Konsensschwellen.',
          'Kein Ausschuss, Bankier oder Präsident hat die Macht, einem Menschen die Lebensgrundlage zu entziehen.'
        ],
        counter: 'Gemäß Artikel 1.7 (Verfassungsinvarianten) sind menschliche Überlebensrechte unantastbar. Öffentliche Beschlüsse liegen bei gelosten Bürgerversammlungen mit 75%-Quorum, wodurch oligarchische Übernahme verunmöglicht wird.'
      },
      en: {
        verdict_human: 'CONSTITUTIONAL FIREWALL: Unconditional survival baselines & citizen demarchy',
        lead: 'Under Article 1.7 (Constitutional Invariants), human biological survival baselines (clean water, nutrition, shelter, healthcare, clean energy) cannot be suspended, conditioned, or taxed for any reason.',
        points: [
          'Vital life-support is unconditional and safeguarded by immutable constitutional interlocks.',
          'Public governance is administered by statistically drawn rotational citizen juries requiring 75% consensus.',
          'No committee, banker, or executive holds the authority to deprive a human being of survival.'
        ],
        counter: 'Under Article 1.7 (Constitutional Invariants), human survival baselines (food, housing, healthcare, clean energy) cannot be suspended, conditioned, or taxed for any reason. Public coordination is managed through sortition assemblies of ordinary citizens with 75% consensus thresholds and mandatory rotation, preventing political capture.'
      }
    };

    const fb = fallbackDict[state.lang] || fallbackDict.en;
    return {
      verdict_human: fb.verdict_human,
      human_summary: {
        lead: fb.lead,
        points: fb.points
      },
      severity_tier: 'CONSTITUTIONAL_FIREWALL',
      constitutional_countermeasure: fb.counter,
      canonical_articles: ['Art. 1.1', 'Art. 1.7', 'Art. 3.1.2']
    };
  }

  // Fast Local Semantic Matcher (< 5ms across 300+ items)
  function findClosestSimulationMatch(query, allowFallback = true) {
    if (!query || !state.qaPairs || state.qaPairs.length === 0) {
      return allowFallback ? getConstitutionalFallback() : null;
    }

    // Clean and normalize query (strip accents/diacritics, lowercase)
    const cleanQ = query.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .trim();

    // Universal Stopwords across common languages
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'for', 'to', 'how', 'what', 'why', 'who', 'does', 'can', 'if', 'there',
      'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'e', 'ed', 'o', 'in', 'di', 'da', 'su', 'per', 'con', 'tra', 'fra', 'come', 'cosa', 'chi', 'perche', 'se', 'ci',
      'de', 'el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'en', 'por', 'para', 'con', 'como', 'que', 'quien', 'si',
      'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'dans', 'pour', 'avec', 'comment', 'qui', 'quoi', 'si',
      'der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'in', 'von', 'zu', 'mit', 'wie', 'was', 'wer', 'warum', 'wenn'
    ]);

    const queryTokens = cleanQ.split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length >= 2 && !stopWords.has(w));

    if (queryTokens.length === 0) {
      return allowFallback ? getConstitutionalFallback() : null;
    }

    let bestMatch = null;
    let bestScore = 0;

    for (let i = 0; i < state.qaPairs.length; i++) {
      const qa = state.qaPairs[i];
      let score = 0;

      // Extract metadata fields
      const itemKeywords = Array.isArray(qa.keywords) ? qa.keywords : [];
      const itemTitle = (qa.title || '').toLowerCase();
      const itemQuestion = (qa.question || '').toLowerCase();
      const itemCategory = (qa.category || '').toLowerCase();
      const itemLead = (qa.human_summary?.lead || qa.scenario || '').toLowerCase();

      let tokenMatches = 0;

      for (let t = 0; t < queryTokens.length; t++) {
        const token = queryTokens[t];
        let matched = false;

        // 1. Keyword match (highest priority: +15 exact, +8 partial)
        for (let k = 0; k < itemKeywords.length; k++) {
          const kw = itemKeywords[k].toLowerCase();
          if (kw === token) {
            score += 15;
            matched = true;
            break;
          } else if (kw.includes(token) || (token.length >= 4 && token.includes(kw))) {
            score += 8;
            matched = true;
            break;
          }
        }

        // 2. Question & Title match (+6)
        if (itemQuestion.includes(token) || itemTitle.includes(token)) {
          score += 6;
          matched = true;
        }

        // 3. Category match (+4)
        if (itemCategory && (itemCategory.includes(token) || token.includes(itemCategory))) {
          score += 4;
          matched = true;
        }

        // 4. Lead summary match (+2)
        if (itemLead.includes(token)) {
          score += 2;
          matched = true;
        }

        if (matched) tokenMatches++;
      }

      // Reward multi-token contextual coherence
      if (tokenMatches > 1) {
        score += tokenMatches * 5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = qa;
      }
    }

    // High confidence threshold for Tier 1 match
    if (bestScore >= 12 && bestMatch) {
      return bestMatch;
    }

    if (!allowFallback) return null;
    return getConstitutionalFallback();
  }

  // Handle Free-Form Chat (Hybrid Tier 1 Instant + Tier 2 Streaming Adjudication)
  async function handleUserChatMessage() {
    const input = elements.chatInput.value.trim();
    if (!input) return;

    elements.chatInput.value = '';
    const t = state.translations?.challenge || {};
    const labelInquiry = t.label_inquiry || 'VISITOR SKEPTIC INQUIRY';
    const labelAdjudicator = t.label_adjudicator || 'NOMOTHETIC ADJUDICATOR';

    // 1. Render Visitor Inquiry
    const userMsgHtml = `
      <div class="chat-msg user">
        <div class="msg-header">
          <span>${labelInquiry}</span>
        </div>
        <div class="msg-body">
          <p>${escapeHtml(input)}</p>
        </div>
      </div>
    `;
    elements.chatHistory.insertAdjacentHTML('beforeend', userMsgHtml);
    elements.chatHistory.scrollTop = elements.chatHistory.scrollHeight;

    // 2. TIER 1: Check Local Multilingual Semantic Matcher (< 5ms)
    const localMatch = findClosestSimulationMatch(input, false);

    if (localMatch) {
      // Instant Level 1 Resolution
      setTimeout(() => {
        const systemMsgHtml = renderAdjudicatorMessageHtml(localMatch);
        elements.chatHistory.insertAdjacentHTML('beforeend', systemMsgHtml);
        elements.chatHistory.scrollTop = elements.chatHistory.scrollHeight;
      }, 140);
      return;
    }

    // 3. TIER 2: Unprecedented Query -> Cloudflare Worker + Groq LLaMA 3.3 70B Streaming
    const streamId = 'stream_' + Date.now();
    const labelStreamingBadge = 'LLaMA 3.3 70B • STREAMING';
    const labelAdjudicating = t.label_analyzing || 'O.N.E. DEEP ADJUDICATING...';

    const streamingPlaceholderHtml = `
      <div class="chat-msg system" id="${streamId}">
        <div class="msg-header">
          <span>${labelAdjudicator}</span>
          <span class="badge-tier status-pill">
            ${labelStreamingBadge}
          </span>
        </div>
        <div class="msg-body">
          <div class="human-summary-box ai-adjudication-body">
            <div class="ai-response-content" id="${streamId}_content">
              <div class="typing-indicator">
                <span class="typing-dots"><span></span><span></span><span></span></span>
                <span class="typing-label">${labelAdjudicating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    elements.chatHistory.insertAdjacentHTML('beforeend', streamingPlaceholderHtml);
    elements.chatHistory.scrollTop = elements.chatHistory.scrollHeight;

    const contentEl = document.getElementById(`${streamId}_content`);
    const workerUrl = window.ONE_WORKER_URL || 'https://one-adjudicator.kyberlex.workers.dev/api/adjudicate';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 16000); // 16s timeout

      const res = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, lang: state.lang || 'en' }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok || !res.body) {
        throw new Error(`Worker returned status ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullStreamText = '';
      let clearedInitial = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          if (trimmed === 'data: [DONE]') break;

          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const tokenDelta = parsed.choices?.[0]?.delta?.content || '';
              if (tokenDelta) {
                if (!clearedInitial) {
                  contentEl.innerHTML = '';
                  clearedInitial = true;
                }
                fullStreamText += tokenDelta;
                contentEl.innerHTML = formatMarkdownToHtml(fullStreamText) + '<span class="streaming-cursor"></span>';
                elements.chatHistory.scrollTop = elements.chatHistory.scrollHeight;
              }
            } catch (jsonErr) {
              // Ignore partial or non-JSON chunk
            }
          }
        }
      }

      // Finalize rendering without cursor
      if (fullStreamText.trim()) {
        contentEl.innerHTML = formatMarkdownToHtml(fullStreamText);

        // Extract cited constitutional articles (e.g. Art. 1.2, Art. 4.1)
        const articleMatches = fullStreamText.match(/Art(?:icle|\.)\s*\d+(?:\.\d+)*/gi) || [];
        const uniqueArticles = Array.from(new Set(articleMatches.map(a => a.replace(/Article/i, 'Art.'))));

        if (uniqueArticles.length > 0) {
          const articlesHtml = `
            <div class="msg-articles">
              ${uniqueArticles.map(art => `<span class="article-tag">${art}</span>`).join('')}
            </div>
          `;
          document.getElementById(streamId).insertAdjacentHTML('beforeend', articlesHtml);
        }
      } else {
        throw new Error('Empty response payload from epistemic proxy.');
      }

    } catch (err) {
      console.warn('[Tier 2 Fallback] Epistemic proxy unavailable or timed out. Activating Constitutional Firewall.', err);
      // Seamless fallback to deterministic local firewall
      const fallbackData = getConstitutionalFallback();
      const fallbackHtml = renderAdjudicatorMessageHtml(fallbackData);
      const containerEl = document.getElementById(streamId);
      if (containerEl) {
        containerEl.outerHTML = fallbackHtml;
      } else {
        elements.chatHistory.insertAdjacentHTML('beforeend', fallbackHtml);
      }
    }

    elements.chatHistory.scrollTop = elements.chatHistory.scrollHeight;
  }

  // ==========================================================================
  // LIGHTWEIGHT MARKDOWN FORMATTER FOR BLUEPRINTS & HANDBOOKS
  // ==========================================================================
  function cleanInlineMarkdown(text) {
    if (!text) return '';
    let res = text;
    // Bold: **text**
    res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italics: *text* or _text_
    res = res.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    res = res.replace(/(^|[^_])_([^_]+)_(?!_)/g, '$1<em>$2</em>');
    // Code backticks: `code`
    res = res.replace(/`([^`]+)`/g, '<code class="reader-inline-code">$1</code>');
    // Smart quotes for dialogue
    res = res.replace(/"([^"]+)"/g, '“$1”');
    return res;
  }

  function formatMarkdownToHtml(rawMd) {
    if (!rawMd) return '';
    return rawMd
      .split(/\n\s*\n/)
      .map(block => {
        let text = block.trim();
        if (!text) return '';

        // Code blocks: ``` ... ```
        if (text.startsWith('```') && text.endsWith('```')) {
          const codeContent = text.replace(/^```[a-z]*\n?/, '').replace(/```$/, '');
          return `<pre class="reader-code"><code>${codeContent}</code></pre>`;
        }

        // Clean headers (remove bold markers within headers)
        if (text.startsWith('# ')) {
          const title = cleanInlineMarkdown(text.slice(2).replace(/\*\*([^*]+)\*\*/g, '$1'));
          return `<h1 class="reader-h1">${title}</h1>`;
        }
        if (text.startsWith('## ')) {
          const title = cleanInlineMarkdown(text.slice(3).replace(/\*\*([^*]+)\*\*/g, '$1'));
          return `<h2 class="reader-h2">${title}</h2>`;
        }
        if (text.startsWith('### ')) {
          const title = cleanInlineMarkdown(text.slice(4).replace(/\*\*([^*]+)\*\*/g, '$1'));
          return `<h3 class="reader-h3">${title}</h3>`;
        }
        if (text.startsWith('#### ')) {
          const title = cleanInlineMarkdown(text.slice(5).replace(/\*\*([^*]+)\*\*/g, '$1'));
          return `<h4 class="reader-h4">${title}</h4>`;
        }
        if (text.startsWith('> ')) {
          const cleanQuote = cleanInlineMarkdown(text.replace(/^>\s*/gm, '').trim());
          return `<blockquote class="reader-blockquote">${cleanQuote}</blockquote>`;
        }
        if (text === '---' || text === '***' || text === '___') {
          return `<hr class="reader-hr">`;
        }

        // Markdown Tables: lines starting and containing |
        if (text.startsWith('|') && text.includes('|')) {
          const tableLines = text.split('\n').filter(l => l.trim().startsWith('|'));
          if (tableLines.length >= 2) {
            const headerCells = tableLines[0].split('|').slice(1, -1).map(c => `<th>${cleanInlineMarkdown(c.trim())}</th>`).join('');
            const bodyRows = tableLines.slice(2).map(row => {
              const cells = row.split('|').slice(1, -1).map(c => `<td>${cleanInlineMarkdown(c.trim())}</td>`).join('');
              return `<tr>${cells}</tr>`;
            }).join('');
            return `<div class="reader-table-wrap"><table class="blueprint-table"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
          }
        }

        // Checklists: lines starting with - [ ] or - [x]
        const checkLines = text.split('\n');
        if (checkLines.length > 0 && checkLines.every(l => /^\s*-\s+\[[ xX]\]\s+/.test(l))) {
          const items = checkLines.map(l => {
            const isChecked = /^\s*-\s+\[[xX]\]\s+/.test(l);
            const content = cleanInlineMarkdown(l.replace(/^\s*-\s+\[[ xX]\]\s+/, ''));
            return `<li>${isChecked ? '☑️' : '◻️'} ${content}</li>`;
          }).join('');
          return `<ul class="blueprint-checklist">${items}</ul>`;
        }

        // Unordered lists: lines starting with * or -
        const lines = text.split('\n');
        if (lines.length > 1 && lines.every(l => /^\s*[*•-]\s+/.test(l))) {
          const items = lines.map(l => `<li>${cleanInlineMarkdown(l.replace(/^\s*[*•-]\s+/, ''))}</li>`).join('');
          return `<ul class="reader-ul">${items}</ul>`;
        }

        // Ordered lists: lines starting with 1., 2. etc
        if (lines.length > 1 && lines.every(l => /^\s*\d+\.\s+/.test(l))) {
          const items = lines.map(l => `<li>${cleanInlineMarkdown(l.replace(/^\s*\d+\.\s+/, ''))}</li>`).join('');
          return `<ol class="reader-ol">${items}</ol>`;
        }

        const formattedLines = cleanInlineMarkdown(text).split('\n').join('<br>');
        return `<p class="reader-p">${formattedLines}</p>`;
      })
      .join('');
  }

  // Run on DOM Content Loaded
  document.addEventListener('DOMContentLoaded', init);
})();
