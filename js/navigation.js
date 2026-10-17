/**
 * Next Gen Academy — Navigation
 * Handles: mobile menu, sticky header, active links,
 * dropdown menus, keyboard navigation, announcement bar.
 */

const Navigation = (() => {
  'use strict';

  // ── DOM References ────────────────────────────────────────────────────────

  let header, hamburger, mobileMenu, mobileOverlay,
      dropdownTriggers, announcementBar, announcementClose,
      backToTop;

  // ── State ────────────────────────────────────────────────────────────────

  let mobileMenuOpen = false;
  let lastScrollY = 0;
  let ticking = false;

  // ── Mobile Menu ──────────────────────────────────────────────────────────

  function openMobileMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenuOpen = true;
    mobileMenu.hidden = false;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');

    if (mobileOverlay) {
      mobileOverlay.hidden = false;
      mobileOverlay.removeAttribute('hidden');
      mobileOverlay.classList.add('open');
    }

    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Focus first focusable element in menu
    const firstFocusable = mobileMenu.querySelector('a, button');
    firstFocusable?.focus();
  }

  function closeMobileMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenuOpen = false;
    mobileMenu.hidden = true;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');

    if (mobileOverlay) {
      mobileOverlay.hidden = true;
      mobileOverlay.setAttribute('hidden', '');
      mobileOverlay.classList.remove('open');
    }

    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  function toggleMobileMenu() {
    if (mobileMenuOpen) closeMobileMenu();
    else openMobileMenu();
  }

  // Trap focus inside mobile menu
  function trapFocus(e) {
    if (!mobileMenuOpen) return;
    const focusable = mobileMenu.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  }

  // ── Dropdowns ─────────────────────────────────────────────────────────────

  function openDropdown(trigger) {
    const menu = trigger.nextElementSibling;
    if (!menu) return;
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;

    // Flip if near right edge
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth - 16) {
      menu.classList.add('dropdown__menu--end');
    }
  }

  function closeDropdown(trigger) {
    const menu = trigger.nextElementSibling;
    if (!menu) return;
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }

  function closeAllDropdowns(except = null) {
    dropdownTriggers?.forEach(trigger => {
      if (trigger !== except) closeDropdown(trigger);
    });
  }

  // ── Sticky / Scroll ───────────────────────────────────────────────────────

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (header) {
          // Add scrolled class after 10px
          header.classList.toggle('scrolled', currentScrollY > 10);

          // Auto-hide on scroll down (only on small screens)
          if (window.innerWidth < 768) {
            header.classList.toggle(
              'header--hidden',
              currentScrollY > lastScrollY && currentScrollY > 80
            );
          }
        }

        // Back to top visibility
        if (backToTop) {
          backToTop.classList.toggle('visible', currentScrollY > 400);
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  }

  // ── Active Page Link ──────────────────────────────────────────────────────

  function setActiveNavLink() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkFile = href.split('/').pop();
      const isActive =
        linkFile === filename ||
        (filename === '' && linkFile === 'index.html') ||
        (filename === 'index.html' && (linkFile === '' || linkFile === 'index.html'));
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  // ── Announcement Bar ──────────────────────────────────────────────────────

  function initAnnouncement() {
    announcementBar = document.querySelector('.announcement-bar');
    announcementClose = document.querySelector('.announcement-bar__close');

    if (!announcementBar) return;

    // Check if user dismissed it this session
    try {
      if (sessionStorage.getItem('nga-announcement-dismissed')) {
        announcementBar.setAttribute('hidden', '');
        return;
      }
    } catch (_) {}

    announcementClose?.addEventListener('click', () => {
      announcementBar.setAttribute('hidden', '');
      try { sessionStorage.setItem('nga-announcement-dismissed', '1'); } catch (_) {}
    });
  }

  // ── Back to Top ───────────────────────────────────────────────────────────

  function initBackToTop() {
    backToTop = document.querySelector('.back-to-top');
    if (!backToTop) return;

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Theme Toggle UI ───────────────────────────────────────────────────────

  function initThemeToggles() {
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.themeBtn;
        window.__NGA_THEME__?.setPreference(theme);
        updateThemeToggleUI(theme);
        applyThemeTransition();
      });
    });

    // Toggle button strictly between light and dark
    document.querySelectorAll('[data-theme-cycle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pref = window.__NGA_THEME__?.getPreference() || 'light';
        const next = pref === 'dark' ? 'light' : 'dark';
        window.__NGA_THEME__?.setPreference(next);
        updateThemeToggleUI(next);
        applyThemeTransition();
      });
    });

    // Initialize button state
    const pref = window.__NGA_THEME__?.getPreference() || 'light';
    updateThemeToggleUI(pref);
  }

  function updateThemeToggleUI(pref) {
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      const isActive = btn.dataset.themeBtn === pref;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.classList.toggle('active', isActive);
    });

    // Update icon on cycle buttons with crisp SVGs (Sun for dark mode trigger, Moon for light mode trigger)
    document.querySelectorAll('[data-theme-cycle]').forEach(btn => {
      const icon = btn.querySelector('.theme-icon');
      if (!icon) return;
      if (pref === 'dark') {
        // In dark mode: show Sun icon to switch to light
        icon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
      } else {
        // In light mode: show Moon icon to switch to dark
        icon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      }

      const label = btn.querySelector('.theme-label');
      if (label) {
        label.textContent = pref === 'dark' ? 'Light' : 'Dark';
      }
    });
  }

  function applyThemeTransition() {
    document.documentElement.classList.add('theme-transitioning');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 400);
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    header = document.querySelector('.site-header');
    hamburger = document.querySelector('.nav__hamburger');
    mobileMenu = document.querySelector('.nav__mobile-menu');
    mobileOverlay = document.querySelector('.nav__mobile-overlay');
    dropdownTriggers = document.querySelectorAll('.dropdown__trigger');

    // Mobile menu
    hamburger?.addEventListener('click', toggleMobileMenu);
    mobileOverlay?.addEventListener('click', closeMobileMenu);
    document.addEventListener('keydown', trapFocus);

    // Close mobile menu links
    mobileMenu?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMobileMenu);
    });

    // Dropdowns
    dropdownTriggers?.forEach(trigger => {
      trigger.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        closeAllDropdowns(trigger);
        if (isOpen) closeDropdown(trigger);
        else openDropdown(trigger);
      });

      trigger.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          closeDropdown(trigger);
          trigger.focus();
        }
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('.dropdown')) {
        closeAllDropdowns();
      }
    });

    // Scroll handling
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initial call

    // Active links
    setActiveNavLink();

    // Sub-modules
    initAnnouncement();
    initBackToTop();
    initThemeToggles();
  }

  return { init, closeMobileMenu, openMobileMenu };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', Navigation.init);
} else {
  Navigation.init();
}

window.Navigation = Navigation;
