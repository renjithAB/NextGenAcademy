/**
 * Next Gen Academy — Utilities
 * Shared utility functions used across all modules.
 */

const Utils = (() => {
  'use strict';

  // ── DOM Helpers ───────────────────────────────────────────────────────────

  /** Safe querySelector — returns null if selector or container is invalid */
  function qs(selector, container = document) {
    try { return container?.querySelector(selector) ?? null; }
    catch (_) { return null; }
  }

  /** Safe querySelectorAll — always returns an array */
  function qsa(selector, container = document) {
    try { return Array.from(container?.querySelectorAll(selector) ?? []); }
    catch (_) { return []; }
  }

  /** Create an element with attributes and children */
  function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'class') el.className = value;
      else if (key === 'html') el.innerHTML = value;       // trusted HTML only
      else if (key === 'text') el.textContent = value;     // safe
      else el.setAttribute(key, value);
    });
    children.forEach(child => {
      if (typeof child === 'string') el.append(document.createTextNode(child));
      else if (child instanceof Node) el.append(child);
    });
    return el;
  }

  /** Show an element */
  function show(el) {
    if (!el) return;
    el.hidden = false;
    el.removeAttribute('aria-hidden');
  }

  /** Hide an element */
  function hide(el) {
    if (!el) return;
    el.hidden = true;
    el.setAttribute('aria-hidden', 'true');
  }

  // ── String Helpers ────────────────────────────────────────────────────────

  /** Escape HTML for safe text insertion */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Slugify a string */
  function slugify(str) {
    return String(str)
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/--+/g, '-');
  }

  /** Truncate text to maxLength with ellipsis */
  function truncate(str, maxLength = 100) {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength).trimEnd() + '…';
  }

  // ── Data Helpers ──────────────────────────────────────────────────────────

  /** Debounce a function */
  function debounce(fn, delay = 300) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /** Throttle a function */
  function throttle(fn, interval = 100) {
    let lastTime = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastTime >= interval) {
        lastTime = now;
        fn.apply(this, args);
      }
    };
  }

  /** Safe JSON parse with fallback */
  function safeJSON(str, fallback = null) {
    try { return JSON.parse(str); }
    catch (_) { return fallback; }
  }

  // ── Date Helpers ──────────────────────────────────────────────────────────

  /** Format a date string for display */
  function formatDate(dateStr, lang = 'en') {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (_) {
      return dateStr;
    }
  }

  /** Get day number from date string */
  function getDay(dateStr) {
    return new Date(dateStr).getDate();
  }

  /** Get month abbreviation */
  function getMonth(dateStr, lang = 'en') {
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' });
  }

  /** Check if a date is in the past */
  function isPast(dateStr) {
    return new Date(dateStr) < new Date();
  }

  // ── URL Helpers ───────────────────────────────────────────────────────────

  /** Get a URL search param */
  function getParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  /** Build a query string from an object */
  function buildQuery(params) {
    return new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString();
  }

  // ── Accessibility Helpers ─────────────────────────────────────────────────

  /** Announce a message to screen readers */
  function announce(message, priority = 'polite') {
    let live = document.querySelector(`[aria-live="${priority}"].nga-live`);
    if (!live) {
      live = createElement('div', {
        class: 'nga-live sr-only',
        'aria-live': priority,
        'aria-atomic': 'true'
      });
      document.body.append(live);
    }
    // Clear then set to trigger announcement
    live.textContent = '';
    setTimeout(() => { live.textContent = message; }, 50);
  }

  /** Move focus to an element safely */
  function focusEl(el) {
    if (!el) return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus();
  }

  /** Get all focusable elements within a container */
  function getFocusable(container) {
    return qsa(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container
    );
  }

  // ── Fetch Helpers ─────────────────────────────────────────────────────────

  /** Fetch JSON from a URL with error handling */
  async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
    return response.json();
  }

  /** Determine the root path (for subdirectory deployments) */
  function getRootPath() {
    return document.documentElement.dataset.root || '';
  }

  // ── Scroll Reveal ─────────────────────────────────────────────────────────

  let revealObserver = null;

  function initScrollReveal() {
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: make all reveal elements visible
      qsa('[data-reveal]').forEach(el => el.classList.add('revealed'));
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      qsa('[data-reveal]').forEach(el => el.classList.add('revealed'));
      return;
    }

    revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    qsa('[data-reveal]').forEach(el => revealObserver.observe(el));
  }

  // ── Image Error Fallback ──────────────────────────────────────────────────

  function initImageFallbacks() {
    qsa('img[data-fallback]').forEach(img => {
      img.addEventListener('error', function () {
        this.src = this.dataset.fallback;
        this.removeAttribute('data-fallback');
      });
    });

    // Generic fallback for images without explicit fallback
    qsa('img:not([data-fallback])').forEach(img => {
      img.addEventListener('error', function () {
        this.style.visibility = 'hidden';
        this.alt = '';
      });
    });
  }

  // ── Number Counter Animation ──────────────────────────────────────────────

  function animateCounter(el, target, duration = 1500) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = target;
      return;
    }

    const start = 0;
    const startTime = performance.now();
    const suffix = el.dataset.suffix || '';

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  function initCounters() {
    if (typeof IntersectionObserver === 'undefined') return;

    const counterObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            if (!isNaN(target)) animateCounter(el, target);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    qsa('[data-count]').forEach(el => counterObserver.observe(el));
  }

  // ── Dynamic Copyright Year ────────────────────────────────────────────────

  function initCopyrightYear() {
    qsa('[data-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    initScrollReveal();
    initImageFallbacks();
    initCounters();
    initCopyrightYear();
  }

  return {
    qs, qsa, createElement, show, hide,
    escapeHtml, slugify, truncate,
    debounce, throttle, safeJSON,
    formatDate, getDay, getMonth, isPast,
    getParam, buildQuery,
    announce, focusEl, getFocusable,
    fetchJSON, getRootPath,
    initScrollReveal, initCounters, initCopyrightYear,
    init
  };
})();

window.Utils = Utils;
