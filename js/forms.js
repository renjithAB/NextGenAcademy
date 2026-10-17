/**
 * Next Gen Academy — Forms Module
 * Handles contact form, admissions inquiry form, and newsletter.
 *
 * NOTE: This is a static website. Forms do not submit to a real server.
 * To enable real submission, configure an integration in README.md.
 * Options: Formspree, Netlify Forms, Cloudflare Workers, EmailJS.
 */

const Forms = (() => {
  'use strict';

  // ── Validation Rules ──────────────────────────────────────────────────────

  const validators = {
    required: (value) => value.trim().length > 0,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    minLength: (value, min) => value.trim().length >= min,
    maxLength: (value, max) => value.trim().length <= max,
    phone: (value) => /^[+\d\s\-()]{7,}$/.test(value.trim())
  };

  // ── Error Messages ────────────────────────────────────────────────────────

  function getError(rule, params = {}) {
    const lang = window.i18n?.getLang() || 'en';
    const messages = {
      en: {
        required: 'This field is required.',
        email: 'Please enter a valid email address.',
        minLength: `Must be at least ${params.min} characters.`,
        maxLength: `Must be no more than ${params.max} characters.`,
        phone: 'Please enter a valid phone number.'
      },
      ar: {
        required: 'هذا الحقل مطلوب.',
        email: 'يرجى إدخال عنوان بريد إلكتروني صحيح.',
        minLength: `يجب أن يكون ${params.min} أحرف على الأقل.`,
        maxLength: `يجب ألا يتجاوز ${params.max} حرفاً.`,
        phone: 'يرجى إدخال رقم هاتف صحيح.'
      }
    };
    return (messages[lang] || messages.en)[rule] || 'Invalid value.';
  }

  // ── Field Validation ──────────────────────────────────────────────────────

  function validateField(field) {
    const value = field.value;
    const errors = [];

    if (field.required && !validators.required(value)) {
      errors.push(getError('required'));
    } else if (value.trim()) {
      if (field.type === 'email' && !validators.email(value)) {
        errors.push(getError('email'));
      }
      if (field.dataset.minlength) {
        const min = parseInt(field.dataset.minlength, 10);
        if (!validators.minLength(value, min)) errors.push(getError('minLength', { min }));
      }
      if (field.dataset.maxlength || field.maxLength > 0) {
        const max = parseInt(field.dataset.maxlength || field.maxLength, 10);
        if (max > 0 && !validators.maxLength(value, max)) errors.push(getError('maxLength', { max }));
      }
      if (field.type === 'tel' && !validators.phone(value)) {
        errors.push(getError('phone'));
      }
    }

    setFieldState(field, errors);
    return errors.length === 0;
  }

  function setFieldState(field, errors) {
    const group = field.closest('.form-group');
    if (!group) return;

    const errorEl = group.querySelector('.form-error');

    if (errors.length > 0) {
      field.setAttribute('aria-invalid', 'true');
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      if (errorEl) {
        errorEl.textContent = errors[0];
        errorEl.hidden = false;
      }
    } else if (field.value.trim()) {
      field.removeAttribute('aria-invalid');
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.hidden = true;
      }
    } else {
      field.removeAttribute('aria-invalid');
      field.classList.remove('is-invalid', 'is-valid');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.hidden = true;
      }
    }
  }

  function clearFieldState(field) {
    field.removeAttribute('aria-invalid');
    field.classList.remove('is-invalid', 'is-valid');
    const group = field.closest('.form-group');
    const errorEl = group?.querySelector('.form-error');
    if (errorEl) { errorEl.textContent = ''; errorEl.hidden = true; }
  }

  // ── Form Submission (Demo / Integration Point) ────────────────────────────

  async function submitForm(form, data) {
    const endpoint = form.dataset.endpoint;

    // If a real endpoint is configured, submit to it
    if (endpoint && endpoint !== 'demo') {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Submission failed: ${response.status}`);
      return response.json().catch(() => ({ success: true }));
    }

    // Demo mode: simulate a delay
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, demo: true }), 1200);
    });
  }

  // ── Form Setup ────────────────────────────────────────────────────────────

  function setupForm(form) {
    if (!form || form.dataset.ngaFormReady) return;
    form.dataset.ngaFormReady = '1';

    const fields = Array.from(form.querySelectorAll('input, textarea, select'));
    const submitBtn = form.querySelector('[type="submit"]');
    const successMsg = form.querySelector('.form-success-msg');
    const errorMsg = form.querySelector('.form-error-msg');

    let submitting = false;

    // Real-time validation on blur
    fields.forEach(field => {
      field.addEventListener('blur', () => {
        if (field.value.trim() || field.required) validateField(field);
      });

      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) validateField(field);
      });
    });

    // Form submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submitting) return;

      // Validate all fields
      let isValid = true;
      fields.forEach(field => {
        if (!validateField(field)) isValid = false;
      });

      if (!isValid) {
        // Focus first invalid field
        const firstInvalid = form.querySelector('.is-invalid');
        firstInvalid?.focus();
        return;
      }

      // Build data object
      const data = {};
      fields.forEach(field => {
        if (field.name) data[field.name] = field.value;
      });
      data.lang = window.i18n?.getLang() || 'en';
      data.timestamp = new Date().toISOString();
      data.page = window.location.pathname;

      // Loading state
      submitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('btn--loading');
        submitBtn.dataset.originalText = submitBtn.textContent;
      }
      if (successMsg) successMsg.hidden = true;
      if (errorMsg) errorMsg.hidden = true;

      try {
        const result = await submitForm(form, data);

        // Success
        form.reset();
        fields.forEach(clearFieldState);

        if (successMsg) {
          successMsg.hidden = false;
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          Utils.announce(successMsg.textContent, 'assertive');
        }

        // Dispatch event
        form.dispatchEvent(new CustomEvent('nga:formSuccess', {
          bubbles: true,
          detail: { data, result }
        }));

      } catch (err) {
        console.error('[Forms] Submission error:', err);
        if (errorMsg) {
          errorMsg.hidden = false;
          errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          Utils.announce(errorMsg.textContent, 'assertive');
        }

        form.dispatchEvent(new CustomEvent('nga:formError', {
          bubbles: true,
          detail: { error: err }
        }));

      } finally {
        submitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('btn--loading');
        }
      }
    });
  }

  // ── Newsletter ────────────────────────────────────────────────────────────

  function setupNewsletter(form) {
    if (!form || form.dataset.ngaNewsletterReady) return;
    form.dataset.ngaNewsletterReady = '1';

    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const feedback = form.querySelector('.newsletter-feedback');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!emailInput || !validators.email(emailInput.value)) {
        emailInput?.classList.add('is-invalid');
        emailInput?.focus();
        return;
      }

      emailInput.classList.remove('is-invalid');
      submitBtn.disabled = true;
      submitBtn.classList.add('btn--loading');

      // Demo submission
      await new Promise(r => setTimeout(r, 800));

      submitBtn.disabled = false;
      submitBtn.classList.remove('btn--loading');

      if (feedback) {
        const lang = window.i18n?.getLang() || 'en';
        feedback.textContent = lang === 'ar'
          ? 'شكراً لاشتراكك! سنبقيك على اطلاع.'
          : 'Thank you for subscribing! We\'ll keep you updated.';
        feedback.hidden = false;
        feedback.className = 'newsletter-feedback newsletter-feedback--success';
      }

      emailInput.value = '';
      Utils.announce(feedback?.textContent || 'Subscribed successfully', 'assertive');
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    // Setup all contact/admissions forms
    Utils.qsa('[data-nga-form]').forEach(setupForm);

    // Setup newsletter forms
    Utils.qsa('[data-nga-newsletter]').forEach(setupNewsletter);
  }

  return { init, setupForm, setupNewsletter, validateField };
})();

window.Forms = Forms;
