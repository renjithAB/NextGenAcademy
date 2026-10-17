/**
 * Next Gen Academy — Animations & Interactive UI Module
 * Handles accordions, tabs, modals, toasts, and micro-interactions.
 */

const Animations = (() => {
  'use strict';

  // ── Accordions ─────────────────────────────────────────────────────────────

  function initAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(acc => {
      acc.querySelectorAll('.accordion__trigger').forEach(trigger => {
        // Prevent multiple bindings
        if (trigger.dataset.accordionBound) return;
        trigger.dataset.accordionBound = 'true';

        trigger.addEventListener('click', () => {
          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
          const panelId = trigger.getAttribute('aria-controls');
          const panel = document.getElementById(panelId) || trigger.nextElementSibling;

          // If accordion is single-select, close other panels in this accordion
          if (!acc.hasAttribute('data-multiselect')) {
            acc.querySelectorAll('.accordion__trigger').forEach(otherTrigger => {
              if (otherTrigger !== trigger) {
                otherTrigger.setAttribute('aria-expanded', 'false');
                const otherPanel = document.getElementById(otherTrigger.getAttribute('aria-controls')) || otherTrigger.nextElementSibling;
                if (otherPanel) {
                  otherPanel.hidden = true;
                }
              }
            });
          }

          trigger.setAttribute('aria-expanded', !isExpanded);
          if (panel) {
            panel.hidden = isExpanded;
          }
        });
      });
    });
  }

  // ── Tabs ───────────────────────────────────────────────────────────────────

  function initTabs() {
    const tabContainers = document.querySelectorAll('.tabs');
    tabContainers.forEach(container => {
      const tabList = container.querySelector('[role="tablist"]');
      const tabs = container.querySelectorAll('[role="tab"]');
      const panels = container.querySelectorAll('[role="tabpanel"]');

      tabs.forEach((tab, index) => {
        if (tab.dataset.tabBound) return;
        tab.dataset.tabBound = 'true';

        tab.addEventListener('click', () => {
          switchTab(tab, tabs, panels);
        });

        tab.addEventListener('keydown', (e) => {
          let targetIndex = index;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            targetIndex = (index + 1) % tabs.length;
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            targetIndex = (index - 1 + tabs.length) % tabs.length;
          } else if (e.key === 'Home') {
            e.preventDefault();
            targetIndex = 0;
          } else if (e.key === 'End') {
            e.preventDefault();
            targetIndex = tabs.length - 1;
          }

          if (targetIndex !== index) {
            tabs[targetIndex].focus();
            switchTab(tabs[targetIndex], tabs, panels);
          }
        });
      });
    });
  }

  function switchTab(activeTab, tabs, panels) {
    tabs.forEach(t => {
      t.setAttribute('aria-selected', 'false');
      t.classList.remove('active');
      t.setAttribute('tabindex', '-1');
    });
    panels.forEach(p => {
      p.hidden = true;
      p.classList.remove('active');
    });

    activeTab.setAttribute('aria-selected', 'true');
    activeTab.classList.add('active');
    activeTab.removeAttribute('tabindex');

    const targetPanelId = activeTab.getAttribute('aria-controls');
    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) {
      targetPanel.hidden = false;
      targetPanel.classList.add('active');
    }
  }

  // ── Modals ─────────────────────────────────────────────────────────────────

  let activeModal = null;
  let previousActiveElement = null;

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    previousActiveElement = document.activeElement;
    activeModal = modal;
    modal.removeAttribute('hidden');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Focus first focusable inside modal
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) {
      focusable[0].focus();
    }

    modal.addEventListener('keydown', trapModalFocus);
  }

  function closeModal(modal) {
    const target = modal || activeModal;
    if (!target) return;

    target.classList.remove('is-open');
    target.setAttribute('hidden', '');
    document.body.style.overflow = '';
    target.removeEventListener('keydown', trapModalFocus);
    activeModal = null;

    if (previousActiveElement) {
      previousActiveElement.focus();
    }
  }

  function trapModalFocus(e) {
    if (!activeModal) return;
    if (e.key === 'Escape') {
      closeModal(activeModal);
      return;
    }

    if (e.key === 'Tab') {
      const focusable = activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function initModals() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal-target]');
      if (trigger) {
        e.preventDefault();
        openModal(trigger.dataset.modalTarget);
        return;
      }

      const closeBtn = e.target.closest('[data-modal-close]');
      if (closeBtn) {
        e.preventDefault();
        closeModal(closeBtn.closest('.modal-overlay'));
        return;
      }

      if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target);
      }
    });
  }

  // ── Toasts ─────────────────────────────────────────────────────────────────

  function showToast(message, type = 'info', duration = 4000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type} animate-slide-in-up`;
    toast.setAttribute('role', 'alert');

    const icons = {
      info: 'ℹ️',
      success: '✓',
      warning: '⚠️',
      error: '✕'
    };

    toast.innerHTML = `
      <span class="toast__icon" aria-hidden="true">${icons[type] || '•'}</span>
      <span class="toast__message">${Utils ? Utils.escapeHtml(message) : message}</span>
      <button class="toast__close" aria-label="Close notification">&times;</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast__close');
    const dismiss = () => {
      toast.classList.add('toast--dismiss');
      setTimeout(() => {
        toast.remove();
        if (container.children.length === 0) container.remove();
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);
    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  function init() {
    initAccordions();
    initTabs();
    initModals();
  }

  return {
    init,
    initAccordions,
    initTabs,
    openModal,
    closeModal,
    showToast
  };
})();

window.Animations = Animations;
