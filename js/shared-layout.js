const siteLogoHtml = `
      <!-- Logo (Auto Swaps for Light and Dark Themes) -->
      <a href="index.html" class="nav__logo" aria-label="Next Gen Academy Home">
        <span class="nav__logo-mark" aria-hidden="true">
          <img src="assets/images/logo-white.png" alt="Next Gen Academy Logo" class="nav__logo-img nav__logo-img--light">
          <img src="assets/images/logo-cream.png" alt="Next Gen Academy Logo" class="nav__logo-img nav__logo-img--dark">
        </span>
      </a>`;

const siteNavHtml = `
      <!-- Desktop Navigation Menu (Only 5 Essential Pages) -->
      <nav class="nav__menu" aria-label="Primary Navigation">
        <a href="index.html" class="nav__link" data-nav-link="index.html" data-i18n="nav.home">Home</a>
        <a href="about.html" class="nav__link" data-nav-link="about.html" data-i18n="nav.about">About Us</a>
        <a href="admissions.html" class="nav__link" data-nav-link="admissions.html" data-i18n="nav.admissions">Admissions</a>
        <a href="student-life.html" class="nav__link" data-nav-link="student-life.html" data-i18n="nav.studentLife">Student Life</a>
        <a href="contact.html" class="nav__link" data-nav-link="contact.html" data-i18n="nav.contact">Contact</a>
      </nav>

      <!-- Action Controls (Language, Theme, CTA) -->
      <div class="nav__desktop-actions" data-lang-toggle>
        <!-- Language Switcher -->
        <button type="button" class="lang-toggle-btn" data-lang-toggle-btn aria-label="Toggle language (English / العربية)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span data-lang-current>EN</span>
        </button>

        <!-- Theme Selector (Light / Dark only, no system) -->
        <button type="button" class="theme-toggle-btn" data-theme-cycle aria-label="Toggle visual theme (Light / Dark)">
          <span class="theme-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          </span>
        </button>

        <!-- Apply CTA -->
        <a href="admissions.html" class="btn btn--primary nav-cta-btn" data-i18n="nav.applyNow">Apply Now</a>
      </div>

      <!-- Mobile Hamburger -->
      <button type="button" class="nav__hamburger" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobile-nav">
        <span></span>
        <span></span>
        <span></span>
      </button>`;

const mobileDrawerHtml = `
  <div class="nav__mobile-overlay" hidden></div>
  <div class="nav__mobile-menu" id="mobile-nav" hidden aria-hidden="true">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-block-end: var(--space-6);">
      <a href="index.html" class="nav__logo" style="display: inline-flex;" aria-label="Next Gen Academy Home">
        <span class="nav__logo-mark" aria-hidden="true">
          <img src="assets/images/logo-white.png" alt="Next Gen Academy Logo" class="nav__logo-img nav__logo-img--light" style="height: 42px;">
          <img src="assets/images/logo-cream.png" alt="Next Gen Academy Logo" class="nav__logo-img nav__logo-img--dark" style="height: 42px;">
        </span>
      </a>
      <button type="button" class="btn btn--ghost btn--icon" onclick="Navigation.closeMobileMenu()" aria-label="Close menu">&times;</button>
    </div>

    <nav class="flex-col gap-4" style="margin-block-end: var(--space-8);">
      <a href="index.html" class="nav__link" data-nav-link="index.html" data-i18n="nav.home">Home</a>
      <a href="about.html" class="nav__link" data-nav-link="about.html" data-i18n="nav.about">About Us</a>
      <a href="admissions.html" class="nav__link" data-nav-link="admissions.html" data-i18n="nav.admissions">Admissions</a>
      <a href="student-life.html" class="nav__link" data-nav-link="student-life.html" data-i18n="nav.studentLife">Student Life</a>
      <a href="contact.html" class="nav__link" data-nav-link="contact.html" data-i18n="nav.contact">Contact</a>
    </nav>

    <div class="flex-col gap-4" style="border-block-start: 1px solid var(--color-border); padding-block-start: var(--space-4);">
      <div class="flex gap-2">
        <button type="button" class="btn btn--outline btn--sm" data-lang-btn="en" style="flex: 1;">English (EN)</button>
        <button type="button" class="btn btn--outline btn--sm" data-lang-btn="ar" style="flex: 1;">العربية (AR)</button>
      </div>
      <div class="flex gap-2">
        <button type="button" class="btn btn--outline btn--sm" data-theme-btn="light" style="flex: 1;">Light</button>
        <button type="button" class="btn btn--outline btn--sm" data-theme-btn="dark" style="flex: 1;">Dark</button>
      </div>
      <a href="admissions.html" class="btn btn--primary" style="text-align: center; justify-content: center;" data-i18n="nav.applyNow">Apply Now</a>
    </div>
  </div>`;

const siteFooterHtml = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <a href="index.html" class="nav__logo" style="margin-block-end: var(--space-4); display: inline-flex;" aria-label="Next Gen Academy Home">
            <span class="nav__logo-mark" aria-hidden="true">
              <img src="assets/images/logo-white.png" alt="Next Gen Academy Logo" class="nav__logo-img nav__logo-img--light" style="height: 52px;">
              <img src="assets/images/logo-cream.png" alt="Next Gen Academy Logo" class="nav__logo-img nav__logo-img--dark" style="height: 52px;">
            </span>
          </a>
          <p class="footer__description" data-i18n="footer.brand.description">
            A modern educational institution committed to intellectual inquiry, rigorous STEM curricula, and inclusive community empowerment.
          </p>
        </div>

        <nav class="footer__nav-group" aria-label="Quick Links">
          <h4 class="footer__nav-title" data-i18n="footer.quickLinks">Quick Links</h4>
          <a href="index.html" class="footer__nav-link" data-i18n="nav.home">Home</a>
          <a href="about.html" class="footer__nav-link" data-i18n="nav.about">About Us</a>
          <a href="admissions.html" class="footer__nav-link" data-i18n="nav.admissions">Admissions</a>
          <a href="student-life.html" class="footer__nav-link" data-i18n="nav.studentLife">Student Life</a>
          <a href="contact.html" class="footer__nav-link" data-i18n="nav.contact">Contact</a>
        </nav>

        <nav class="footer__nav-group" aria-label="Admissions & Campus">
          <h4 class="footer__nav-title" data-i18n="nav.admissions">Admissions</h4>
          <a href="admissions.html#process" class="footer__nav-link">Application Process</a>
          <a href="student-life.html" class="footer__nav-link">Campus Life & Studios</a>
          <a href="contact.html" class="footer__nav-link" data-i18n="nav.contact">Connect With Advisors</a>
        </nav>

        <div class="footer__newsletter">
          <h4 class="footer__nav-title" data-i18n="footer.newsletter.title">Stay Connected</h4>
          <p style="font-size: var(--font-sm); color: var(--color-footer-text); margin-block-end: var(--space-4);" data-i18n="home.newsletter.description">
            Receive updates on academic programs, lecture series, and academy milestones.
          </p>
          <form class="footer__newsletter-form" onsubmit="event.preventDefault(); alert('Subscribed to academy updates.');" style="display: flex; gap: var(--space-2);">
            <label for="footer-email-input" class="sr-only">Your email</label>
            <input type="email" id="footer-email-input" class="form-control" style="font-size: var(--font-sm); padding-block: var(--space-2);" placeholder="name@domain.edu" required>
            <button type="submit" class="btn btn--primary btn--sm" data-i18n="footer.newsletter.subscribe">Subscribe</button>
          </form>
        </div>
      </div>

      <div class="footer__bottom">
        <p class="footer__legal" style="font-size: var(--font-xs); color: var(--color-footer-link);">
          &copy; <span data-year>2026</span> Next Gen Academy. All rights reserved.
        </p>
        <div style="display: flex; gap: var(--space-4); font-size: var(--font-xs);">
          <a href="about.html" style="color: var(--color-footer-link); text-decoration: none;">About Us</a>
          <a href="admissions.html" style="color: var(--color-footer-link); text-decoration: none;">Admissions</a>
          <a href="student-life.html" style="color: var(--color-footer-link); text-decoration: none;">Student Life</a>
          <a href="contact.html" style="color: var(--color-footer-link); text-decoration: none;">Contact</a>
        </div>
      </div>
    </div>
  </footer>`;

window.NextGenShared = {
  renderSharedLayout() {
    // 1. Inject or update Header Navigation & Logo
    const headerContainer = document.querySelector('.site-header .container, .site-header .container--header');
    if (headerContainer) {
      const existingLogo = headerContainer.querySelector('.nav__logo');
      if (existingLogo) existingLogo.remove();
      const existingMenu = headerContainer.querySelector('.nav__menu');
      if (existingMenu) existingMenu.remove();
      const existingActions = headerContainer.querySelector('.nav__desktop-actions');
      if (existingActions) existingActions.remove();
      const existingBurger = headerContainer.querySelector('.nav__hamburger');
      if (existingBurger) existingBurger.remove();

      headerContainer.insertAdjacentHTML('afterbegin', siteLogoHtml);
      headerContainer.insertAdjacentHTML('beforeend', siteNavHtml);
    }

    // 2. Inject or update Mobile Drawer
    let drawer = document.querySelector('.nav__mobile-menu');
    let overlay = document.querySelector('.nav__mobile-overlay');
    if (drawer) drawer.remove();
    if (overlay) overlay.remove();

    const header = document.querySelector('.site-header');
    if (header) {
      header.insertAdjacentHTML('afterend', mobileDrawerHtml);
    }

    // 3. Inject or update Footer
    let footer = document.querySelector('.site-footer');
    if (footer) {
      footer.outerHTML = siteFooterHtml;
    }

    // 4. Highlight active nav links
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-nav-link]').forEach(link => {
      const target = link.getAttribute('data-nav-link');
      if (target === currentPath || (currentPath === '' && target === 'index.html')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }
};
