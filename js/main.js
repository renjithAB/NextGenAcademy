/**
 * Next Gen Academy — Main Application Bootstrap
 * Orchestrates modules, registers event listeners, and manages page lifecycle.
 */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  // 1. Initialize Internationalization (i18n)
  if (window.i18n) {
    try {
      await window.i18n.init();
    } catch (e) {
      console.error('[App] i18n initialization failed:', e);
    }
  }

  // 2. Initialize Navigation & Layout controls
  if (window.Navigation && typeof window.Navigation.init === 'function') {
    window.Navigation.init();
  }

  // 3. Initialize Shared Utilities (Scroll reveal, counters, image fallbacks, year)
  if (window.Utils && typeof window.Utils.init === 'function') {
    window.Utils.init();
  }

  // 4. Initialize Animations, Accordions, Tabs, and Modals
  if (window.Animations && typeof window.Animations.init === 'function') {
    window.Animations.init();
  }

  // 5. Initialize Forms
  if (window.Forms && typeof window.Forms.init === 'function') {
    window.Forms.init();
  }

  // 6. Initialize Courses / Dynamic catalog data
  if (window.Courses && typeof window.Courses.init === 'function') {
    try {
      await window.Courses.init();
    } catch (e) {
      console.warn('[App] Courses module initialization skipped or completed with warnings:', e);
    }
  }

  console.log('[Next Gen Academy] App ready and loaded.');
});
