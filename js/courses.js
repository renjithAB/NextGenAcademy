/**
 * Next Gen Academy — Courses Module
 * Handles course catalog search, filtering, and rendering.
 * Loads course data from /data/courses.json
 */

const Courses = (() => {
  'use strict';

  let allCourses = [];
  let filteredCourses = [];
  let currentFilters = { category: '', level: '', format: '', q: '' };
  let currentSort = 'newest';
  let grid, resultCount, emptyState, loadingState;

  // ── Load Data ─────────────────────────────────────────────────────────────

  async function loadCourses() {
    const root = Utils.getRootPath();
    return Utils.fetchJSON(`${root}/data/courses.json`);
  }

  // ── Filtering & Sorting ───────────────────────────────────────────────────

  function applyFilters() {
    const { category, level, format, q } = currentFilters;
    const query = q.toLowerCase().trim();

    filteredCourses = allCourses.filter(course => {
      if (category && course.category !== category) return false;
      if (level && course.level !== level) return false;
      if (format && course.format !== format) return false;
      if (query) {
        const lang = window.i18n?.getLang() || 'en';
        const title = (lang === 'ar' ? course.titleAr : course.title || '').toLowerCase();
        const desc = (lang === 'ar' ? course.descriptionAr : course.description || '').toLowerCase();
        const tags = (course.tags || []).join(' ').toLowerCase();
        if (!title.includes(query) && !desc.includes(query) && !tags.includes(query)) return false;
      }
      return true;
    });

    // Sort
    switch (currentSort) {
      case 'az':
        filteredCourses.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'popular':
        filteredCourses.sort((a, b) => (b.enrolled || 0) - (a.enrolled || 0));
        break;
      case 'newest':
      default:
        // Keep original order (as loaded from JSON)
        break;
    }
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  function getLevelLabel(level) {
    const t = window.i18n?.t.bind(window.i18n) || (k => k);
    const map = {
      beginner: t('courses.level.beginner'),
      intermediate: t('courses.level.intermediate'),
      advanced: t('courses.level.advanced')
    };
    return map[level] || level;
  }

  function getFormatLabel(format) {
    const t = window.i18n?.t.bind(window.i18n) || (k => k);
    const map = {
      online: t('courses.format.online'),
      hybrid: t('courses.format.hybrid'),
      'in-person': t('courses.format.inPerson')
    };
    return map[format] || format;
  }

  function getCategoryLabel(category) {
    const t = window.i18n?.t.bind(window.i18n) || (k => k);
    const map = {
      technology: t('courses.category.technology'),
      mathematics: t('courses.category.mathematics'),
      sciences: t('courses.category.sciences'),
      languages: t('courses.category.languages'),
      arts: t('courses.category.arts'),
      business: t('courses.category.business')
    };
    return map[category] || category;
  }

  function renderCourseCard(course) {
    const lang = window.i18n?.getLang() || 'en';
    const title = lang === 'ar' ? (course.titleAr || course.title) : course.title;
    const desc = lang === 'ar' ? (course.descriptionAr || course.description) : course.description;
    const instructorName = lang === 'ar'
      ? (course.instructor?.nameAr || course.instructor?.name || '')
      : (course.instructor?.name || '');
    const root = Utils.getRootPath();

    return `
      <article class="course-card" data-reveal>
        <a href="${root}/course-details.html?id=${Utils.escapeHtml(course.id)}" class="course-card__image-wrapper" tabindex="-1" aria-hidden="true">
          <img
            class="course-card__image"
            src="${Utils.escapeHtml(course.image || `${root}/assets/images/course-placeholder.jpg`)}"
            alt=""
            loading="lazy"
            width="400" height="225"
            onerror="this.src='${root}/assets/images/course-placeholder.jpg'"
          >
          ${course.featured ? `<span class="course-card__badge badge badge--primary" aria-hidden="true" data-i18n="courses.featured">Featured</span>` : ''}
        </a>
        <div class="course-card__body">
          <div class="course-card__level">
            <span class="badge badge--outline badge--sm">${Utils.escapeHtml(getLevelLabel(course.level))}</span>
            <span class="badge badge--outline badge--sm">${Utils.escapeHtml(getFormatLabel(course.format))}</span>
          </div>
          <h3 class="course-card__title">
            <a href="${root}/course-details.html?id=${Utils.escapeHtml(course.id)}">${Utils.escapeHtml(title)}</a>
          </h3>
          <p class="course-card__description">${Utils.escapeHtml(Utils.truncate(desc, 120))}</p>
          <div class="course-card__meta">
            ${course.duration ? `<span>📅 ${Utils.escapeHtml(course.duration)}</span>` : ''}
            ${course.hoursPerWeek ? `<span>⏱ ${course.hoursPerWeek}h/week</span>` : ''}
          </div>
          ${instructorName ? `<p class="course-card__instructor">👤 ${Utils.escapeHtml(instructorName)}</p>` : ''}
        </div>
        <div class="course-card__footer">
          <a href="${root}/course-details.html?id=${Utils.escapeHtml(course.id)}" class="btn btn--primary btn--sm" data-i18n="courses.viewDetails">View Details</a>
          <span class="badge badge--sm">${Utils.escapeHtml(getCategoryLabel(course.category))}</span>
        </div>
      </article>
    `;
  }

  function renderSkeletons(count = 6) {
    return Array.from({ length: count }, () => `
      <div class="skeleton skeleton--card" aria-hidden="true">
        <div class="skeleton skeleton--image"></div>
        <div style="padding: 1rem;">
          <div class="skeleton skeleton--text" style="width: 60%"></div>
          <div class="skeleton skeleton--title"></div>
          <div class="skeleton skeleton--text"></div>
          <div class="skeleton skeleton--text" style="width: 40%"></div>
        </div>
      </div>
    `).join('');
  }

  function renderGrid() {
    if (!grid) return;

    if (filteredCourses.length === 0) {
      grid.innerHTML = '';
      if (emptyState) Utils.show(emptyState);
    } else {
      if (emptyState) Utils.hide(emptyState);
      grid.innerHTML = filteredCourses.map(renderCourseCard).join('');
      // Re-observe new elements for scroll reveal
      Utils.initScrollReveal();
    }

    // Update result count
    if (resultCount) {
      const t = window.i18n?.t.bind(window.i18n) || (k => k);
      resultCount.textContent = t('courses.results.count', { count: filteredCourses.length });
      Utils.announce(resultCount.textContent);
    }
  }

  // ── Filter Controls ───────────────────────────────────────────────────────

  function initFilters() {
    // Search input
    const searchInput = Utils.qs('[data-courses-search]');
    if (searchInput) {
      const debouncedSearch = Utils.debounce(value => {
        currentFilters.q = value;
        applyFilters();
        renderGrid();
      }, 300);
      searchInput.addEventListener('input', e => debouncedSearch(e.target.value));
    }

    // Category filter
    Utils.qsa('[data-filter="category"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.value || '';
        currentFilters.category = value;
        updateActiveFilter('category', value);
        applyFilters();
        renderGrid();
      });
    });

    // Level filter
    Utils.qsa('[data-filter="level"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.value || '';
        currentFilters.level = value;
        updateActiveFilter('level', value);
        applyFilters();
        renderGrid();
      });
    });

    // Format filter
    Utils.qsa('[data-filter="format"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.value || '';
        currentFilters.format = value;
        updateActiveFilter('format', value);
        applyFilters();
        renderGrid();
      });
    });

    // Sort select
    const sortSelect = Utils.qs('[data-courses-sort]');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        applyFilters();
        renderGrid();
      });
    }

    // Clear filters
    const clearBtn = Utils.qs('[data-courses-clear]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        currentFilters = { category: '', level: '', format: '', q: '' };
        currentSort = 'newest';
        const searchInput = Utils.qs('[data-courses-search]');
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'newest';
        updateActiveFilter('category', '');
        updateActiveFilter('level', '');
        updateActiveFilter('format', '');
        applyFilters();
        renderGrid();
      });
    }
  }

  function updateActiveFilter(type, value) {
    Utils.qsa(`[data-filter="${type}"]`).forEach(btn => {
      const isActive = (btn.dataset.value || '') === value;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  // ── Featured Courses (Homepage) ───────────────────────────────────────────

  async function renderFeaturedCourses(container, limit = 6) {
    if (!container) return;
    container.innerHTML = renderSkeletons(limit);

    try {
      const courses = await loadCourses();
      const featured = courses.filter(c => c.featured).slice(0, limit);
      if (!featured.length) {
        container.innerHTML = `<p class="text-muted" data-i18n="common.noResults">No courses available.</p>`;
        return;
      }
      container.innerHTML = featured.map(renderCourseCard).join('');
      Utils.initScrollReveal();
    } catch (err) {
      console.error('[Courses] Failed to load featured:', err);
      container.innerHTML = `<p class="text-muted">Courses could not be loaded.</p>`;
    }
  }

  // ── Course Details ─────────────────────────────────────────────────────────

  async function renderCourseDetails() {
    const id = Utils.getParam('id');
    const container = Utils.qs('[data-course-detail]');
    if (!container) return;

    container.innerHTML = renderSkeletons(1);

    try {
      const courses = await loadCourses();
      const course = courses.find(c => c.id === id);

      if (!course) {
        container.innerHTML = `
          <div class="empty-state">
            <p class="empty-state__title">Course not found</p>
            <a href="courses.html" class="btn btn--primary">Browse All Courses</a>
          </div>
        `;
        return;
      }

      const lang = window.i18n?.getLang() || 'en';
      const title = lang === 'ar' ? (course.titleAr || course.title) : course.title;
      const desc = lang === 'ar' ? (course.descriptionAr || course.description) : course.description;
      const root = Utils.getRootPath();

      // Update page title
      document.title = `${title} — Next Gen Academy`;

      // Update breadcrumb
      const breadcrumbCurrent = Utils.qs('[data-breadcrumb-current]');
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = title;

      container.innerHTML = `
        <div class="course-detail">
          <header class="course-detail__header">
            <div class="course-detail__badges">
              <span class="badge badge--primary">${Utils.escapeHtml(getLevelLabel(course.level))}</span>
              <span class="badge badge--outline">${Utils.escapeHtml(getCategoryLabel(course.category))}</span>
              <span class="badge badge--outline">${Utils.escapeHtml(getFormatLabel(course.format))}</span>
            </div>
            <h1 class="course-detail__title">${Utils.escapeHtml(title)}</h1>
            <p class="course-detail__description">${Utils.escapeHtml(desc)}</p>
            <div class="course-detail__meta">
              ${course.duration ? `<span>📅 ${Utils.escapeHtml(course.duration)}</span>` : ''}
              ${course.hoursPerWeek ? `<span>⏱ ${course.hoursPerWeek} hours/week</span>` : ''}
            </div>
          </header>

          ${(course.outcomes?.length) ? `
          <section class="course-detail__section">
            <h2 data-i18n="courses.outcomes">Learning Outcomes</h2>
            <ul class="course-detail__outcomes">
              ${course.outcomes.map(o => `<li>✓ ${Utils.escapeHtml(o)}</li>`).join('')}
            </ul>
          </section>` : ''}

          ${(course.prerequisites?.length) ? `
          <section class="course-detail__section">
            <h2 data-i18n="courses.prerequisites">Prerequisites</h2>
            <ul>
              ${course.prerequisites.map(p => `<li>${Utils.escapeHtml(p)}</li>`).join('')}
            </ul>
          </section>` : ''}

          ${(course.modules?.length) ? `
          <section class="course-detail__section">
            <h2 data-i18n="courses.modules">Course Curriculum</h2>
            <div class="accordion">
              ${course.modules.map((mod, i) => {
                const modTitle = lang === 'ar' ? (mod.titleAr || mod.title) : mod.title;
                return `
                  <div class="accordion__item">
                    <button class="accordion__trigger" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="module-${i}">
                      <span>${Utils.escapeHtml(modTitle)}</span>
                      <span class="accordion__icon" aria-hidden="true"></span>
                    </button>
                    <div class="accordion__panel" id="module-${i}" ${i === 0 ? '' : 'hidden'}>
                      <div class="accordion__content">
                        <ul>
                          ${(mod.lessons || []).map(l => `<li>${Utils.escapeHtml(l)}</li>`).join('')}
                        </ul>
                      </div>
                    </div>
                  </div>`;
              }).join('')}
            </div>
          </section>` : ''}

          ${course.instructor ? `
          <section class="course-detail__section">
            <h2 data-i18n="courses.instructor">Instructor</h2>
            <div class="faculty-card faculty-card--inline">
              <div class="faculty-card__avatar">
                <img src="${root}/assets/images/faculty-placeholder.jpg" alt="" width="64" height="64">
              </div>
              <div class="faculty-card__body">
                <p class="faculty-card__name">${Utils.escapeHtml(lang === 'ar' ? (course.instructor.nameAr || course.instructor.name) : course.instructor.name)}</p>
              </div>
            </div>
          </section>` : ''}

          <section class="course-detail__cta">
            <div class="cta-banner">
              <p class="cta-banner__title" data-i18n="courses.enroll">Ready to Enroll?</p>
              <p class="cta-banner__description" data-i18n="admissions.form.demoNotice">
                Contact our admissions team to begin your enrollment process.
              </p>
              <div class="cta-banner__actions">
                <a href="${root}/admissions.html" class="btn btn--primary btn--lg" data-i18n="nav.applyNow">Apply Now</a>
                <a href="${root}/contact.html" class="btn btn--outline-light btn--lg" data-i18n="nav.contact">Contact Us</a>
              </div>
            </div>
          </section>
        </div>
      `;

      // Re-initialize accordions
      Animations.initAccordions();

    } catch (err) {
      console.error('[Courses] Failed to load course details:', err);
      container.innerHTML = `<p class="text-muted">Course details could not be loaded.</p>`;
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    grid = Utils.qs('[data-courses-grid]');
    resultCount = Utils.qs('[data-courses-count]');
    emptyState = Utils.qs('[data-courses-empty]');
    loadingState = Utils.qs('[data-courses-loading]');

    // Course catalog page
    if (grid) {
      if (loadingState) Utils.show(loadingState);
      grid.innerHTML = renderSkeletons(6);

      try {
        allCourses = await loadCourses();
        filteredCourses = [...allCourses];
        initFilters();
        renderGrid();
      } catch (err) {
        console.error('[Courses] Failed to load:', err);
        grid.innerHTML = `<p class="empty-state__description">Could not load courses. Please try again.</p>`;
      } finally {
        if (loadingState) Utils.hide(loadingState);
      }
    }

    // Homepage featured courses
    const featuredContainer = Utils.qs('[data-featured-courses]');
    if (featuredContainer) {
      await renderFeaturedCourses(featuredContainer);
    }

    // Course details page
    const detailContainer = Utils.qs('[data-course-detail]');
    if (detailContainer) {
      await renderCourseDetails();
    }

    // Re-translate on language change
    document.addEventListener('langchange', () => {
      if (grid && allCourses.length) renderGrid();
    });
  }

  return { init, renderFeaturedCourses, loadCourses };
})();

window.Courses = Courses;
