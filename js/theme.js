/**
 * Next Gen Academy — Theme Manager
 * Manages light/dark/system theme preferences.
 * Must be loaded early (before body paint) to prevent FOUC.
 *
 * Usage: Loaded via <script> in <head> with no defer.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'nga-theme';
  const ATTR = 'data-theme';

  /** Resolve which theme to actually apply */
  function resolveTheme(preference) {
    if (preference === 'light') return 'light';
    if (preference === 'dark') return 'dark';
    // 'system' or unknown → follow OS
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /** Apply a resolved theme (light/dark) to the document element */
  function applyTheme(theme) {
    document.documentElement.setAttribute(ATTR, theme);
    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = theme === 'dark' ? '#0d1117' : '#ffffff';
    }
  }

  /** Read stored preference and apply immediately */
  function initTheme() {
    let preference = 'system';
    try {
      preference = localStorage.getItem(STORAGE_KEY) || 'system';
    } catch (_) { /* storage blocked */ }
    applyTheme(resolveTheme(preference));
  }

  // Run immediately — before first paint
  initTheme();

  // Expose a small public API for theme.js to use
  window.__NGA_THEME__ = {
    STORAGE_KEY,
    resolveTheme,
    applyTheme,
    getPreference() {
      try { return localStorage.getItem(STORAGE_KEY) || 'system'; } catch (_) { return 'system'; }
    },
    setPreference(pref) {
      try { localStorage.setItem(STORAGE_KEY, pref); } catch (_) { /* blocked */ }
      applyTheme(resolveTheme(pref));
    }
  };
}());
