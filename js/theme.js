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
    if (preference === 'dark') return 'dark';
    return 'light'; // default to light
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
    let preference = 'light';
    try {
      preference = localStorage.getItem(STORAGE_KEY) || 'light';
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
      try { return localStorage.getItem(STORAGE_KEY) || 'light'; } catch (_) { return 'light'; }
    },
    setPreference(pref) {
      const resolved = pref === 'dark' ? 'dark' : 'light';
      try { localStorage.setItem(STORAGE_KEY, resolved); } catch (_) { /* blocked */ }
      applyTheme(resolved);
    }
  };
}());
