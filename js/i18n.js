/**
 * Next Gen Academy — Internationalization (i18n)
 * Manages English / Arabic language switching and translation.
 *
 * Usage:
 *   i18n.init()           — initialize on page load
 *   i18n.t('key')         — get translated string
 *   i18n.setLang('ar')    — switch language
 *   i18n.getLang()        — get current language ('en' | 'ar')
 *
 * Translations loaded from /locales/{lang}.json
 * Falls back to English if key is missing in target language.
 */

const i18n = (() => {
  'use strict';

  const STORAGE_KEY = 'nga-lang';
  const SUPPORTED_LANGS = ['en', 'ar'];
  const DEFAULT_LANG = 'en';

  let _lang = DEFAULT_LANG;
  let _translations = {};
  let _fallback = {};
  let _initialized = false;

  // ── Helpers ──────────────────────────────────────────────────────────────

  function getStoredLang() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
  }

  function storeLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) { /* blocked */ }
  }

  function detectBrowserLang() {
    const preferred = (navigator.language || '').toLowerCase();
    if (preferred.startsWith('ar')) return 'ar';
    return DEFAULT_LANG;
  }

  function resolveLang(requested) {
    if (SUPPORTED_LANGS.includes(requested)) return requested;
    return DEFAULT_LANG;
  }

  // ── Translation loading ──────────────────────────────────────────────────

  async function loadTranslations(lang) {
    // Determine path (handles subdirectory hosting)
    const base = document.querySelector('base')?.href || window.location.origin;
    const root = document.documentElement.dataset.root || '';
    const url = `${root}/locales/${lang}.json`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    return response.json();
  }

  // ── DOM update ───────────────────────────────────────────────────────────

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const text = t(key);

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.placeholder !== undefined) el.placeholder = text;
      } else if (el.tagName === 'META') {
        el.content = text;
      } else if (el.tagName === 'IMG') {
        el.alt = text;
      } else {
        el.textContent = text;
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      el.innerHTML = t(key);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = t(el.dataset.i18nTitle);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });

    // Update page title if defined
    const titleKey = document.documentElement.dataset.titleKey;
    if (titleKey && t(titleKey) !== titleKey) {
      document.title = `${t(titleKey)} — Next Gen Academy`;
    }
  }

  function applyDirection() {
    const isRtl = _lang === 'ar';
    document.documentElement.lang = _lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.body.dataset.lang = _lang;

    // Update HTML lang tags in <head>
    document.querySelectorAll('link[rel="alternate"]').forEach(link => {
      // no-op — static links stay as-is
    });
  }

  function updateLangToggle() {
    const toggles = document.querySelectorAll('[data-lang-toggle]');
    toggles.forEach(toggle => {
      const currentLang = toggle.querySelector('[data-lang-current]');
      if (currentLang) currentLang.textContent = _lang === 'ar' ? 'AR' : 'EN';

      const enBtn = toggle.querySelector('[data-lang-btn="en"]');
      const arBtn = toggle.querySelector('[data-lang-btn="ar"]');
      if (enBtn) {
        enBtn.setAttribute('aria-pressed', _lang === 'en' ? 'true' : 'false');
        enBtn.classList.toggle('active', _lang === 'en');
      }
      if (arBtn) {
        arBtn.setAttribute('aria-pressed', _lang === 'ar' ? 'true' : 'false');
        arBtn.classList.toggle('active', _lang === 'ar');
      }
    });
  }

  // ── Public API ───────────────────────────────────────────────────────────

  /**
   * Get a translated string by key.
   * Returns the English fallback if the key is missing in the current language.
   * Returns the key itself if not found in either.
   */
  function t(key, params = {}) {
    let text = _translations[key] ?? _fallback[key] ?? key;

    // Parameter substitution: {{name}}
    Object.entries(params).forEach(([k, v]) => {
      text = text.replaceAll(`{{${k}}}`, String(v));
    });

    return text;
  }

  /**
   * Switch to a new language.
   */
  async function setLang(lang) {
    const resolved = resolveLang(lang);
    if (resolved === _lang && _initialized) return;

    _lang = resolved;
    storeLang(_lang);

    try {
      _translations = await loadTranslations(_lang);
      // Always keep English as fallback
      if (_lang !== DEFAULT_LANG && !Object.keys(_fallback).length) {
        _fallback = await loadTranslations(DEFAULT_LANG);
      } else if (_lang === DEFAULT_LANG) {
        _fallback = {};
      }
    } catch (err) {
      console.warn('[i18n] Failed to load translations for:', _lang, err);
      _translations = _fallback;
    }

    applyDirection();
    applyTranslations();
    updateLangToggle();

    // Fire a custom event for other modules to react
    document.dispatchEvent(new CustomEvent('langchange', {
      bubbles: true,
      detail: { lang: _lang }
    }));
  }

  /**
   * Get the current language code.
   */
  function getLang() { return _lang; }

  /**
   * Initialize i18n. Call once on DOMContentLoaded.
   */
  async function init() {
    // Determine initial language
    const stored = getStoredLang();
    const initial = resolveLang(stored || detectBrowserLang());

    // Load English as fallback first
    try {
      _fallback = await loadTranslations(DEFAULT_LANG);
    } catch (err) {
      console.warn('[i18n] Failed to load fallback (en.json):', err);
    }

    await setLang(initial);
    _initialized = true;

    // Bind language toggle buttons
    document.addEventListener('click', e => {
      const langBtn = e.target.closest('[data-lang-btn]');
      if (langBtn) {
        e.preventDefault();
        setLang(langBtn.dataset.langBtn);
      }

      const langToggle = e.target.closest('[data-lang-toggle-btn]');
      if (langToggle) {
        e.preventDefault();
        setLang(_lang === 'ar' ? 'en' : 'ar');
      }
    });
  }

  return { init, t, setLang, getLang };
})();

// Export for use by other modules
window.i18n = i18n;
