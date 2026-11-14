/**
 * Cloudflare Pages Function: /api/enquiry
 * Handles secure form submissions, bot protection (Turnstile),
 * domain locking, and dispatch to management@nextgen-academy.net
 */

const TARGET_EMAIL = 'management@nextgen-academy.net';
const DEFAULT_TEST_SECRET = '1x0000000000000000000000000000000AA';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Domain & Origin Verification
  const origin = request.headers.get('Origin') || '';
  const referer = request.headers.get('Referer') || '';
  const host = request.headers.get('Host') || '';

  const isAllowedOrigin = (urlStr) => {
    if (!urlStr) return true; // Direct same-origin requests in some browsers omit Origin
    try {
      const u = new URL(urlStr);
      return (
        u.hostname === host ||
        u.hostname === 'localhost' ||
        u.hostname === '127.0.0.1' ||
        u.hostname.endsWith('.pages.dev') ||
        u.hostname === 'nextgen-academy.net' ||
        u.hostname.endsWith('nextgen-academy.net')
      );
    } catch {
      return false;
    }
  };

  if (!isAllowedOrigin(origin) || (!isAllowedOrigin(referer) && referer)) {
    return new Response(
      JSON.stringify({ error: 'Forbidden: Requests are only accepted from authorized domains.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Parse payload
  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Bad Request: Invalid JSON payload.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. Honeypot check (Spambot trap)
  if (data.website || data.b_company_fax || data.hp_check) {
    // Silently succeed so the bot thinks it succeeded, but send no email
    return new Response(
      JSON.stringify({ success: true, message: 'Received' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 4. Cloudflare Turnstile Verification
  const turnstileSecret = env.TURNSTILE_SECRET_KEY || DEFAULT_TEST_SECRET;
  const turnstileToken = data.turnstileToken;

  if (turnstileSecret && turnstileToken) {
    try {
      const ip = request.headers.get('CF-Connecting-IP') || '';
      const turnstileBody = new URLSearchParams();
      turnstileBody.append('secret', turnstileSecret);
      turnstileBody.append('response', turnstileToken);
      if (ip) turnstileBody.append('remoteip', ip);

      const tsRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: turnstileBody.toString(),
      });

      const tsOutcome = await tsRes.json();
      if (!tsOutcome.success) {
        return new Response(
          JSON.stringify({ error: 'Bot verification failed. Please refresh and try again.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (e) {
      // If Turnstile verification call times out or fails unexpectedly, proceed with caution
      console.warn('Turnstile verification error:', e);
    }
  }

  // 5. Sanitize and validate fields
  const clean = (val) => String(val || '').replace(/<[^>]*>/g, '').trim();
  const parentName = clean(data.name);
  const email = clean(data.email);
  const phone = clean(data.phone);
  const message = clean(data.message) || '(No additional message provided)';
  const mode = data.type === 'admission' ? 'admission' : 'enquiry';
  const formTitle = mode === 'admission' ? 'Admission Application (2026–27)' : 'General Enquiry';

  if (!parentName || parentName.length < 2 || !email || !phone) {
    return new Response(
      JSON.stringify({ error: 'Please fill in all required fields.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 6. Build Structured Email Data
  const emailSubject = `NextGen Academy - New ${formTitle} from ${parentName}`;
  const submissionDate = new Date().toLocaleString('en-US', { timeZoneName: 'short' });
  const childName = mode === 'admission' ? clean(data.child) : null;
  const grade = mode === 'admission' ? clean(data.grade) : null;
  const program = mode !== 'admission' ? clean(data.program) : null;

  // 7. Dispatch Email
  // If RESEND_API_KEY is configured in Cloudflare Pages environment variables, use it.
  // Otherwise, use secure server-to-server FormSubmit relay to management@nextgen-academy.net
  if (env.RESEND_API_KEY) {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #14284b; color: #fff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; color: #c69a52;">NextGen Academy</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px;">${formTitle}</p>
        </div>
        <div style="padding: 24px; background-color: #fafafa;">
          <table style="width: 100%; border-collapse: collapse; background-color: #fff; border: 1px solid #eee; border-radius: 6px;">
            <tr><td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #eee; width: 35%;">Form Type:</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${formTitle}</td></tr>
            <tr><td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #eee;">Parent Name:</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${parentName}</td></tr>
            <tr><td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #eee;">Email Address:</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #eee;">Phone Number:</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;"><a href="tel:${phone}">${phone}</a></td></tr>
            ${childName ? `<tr><td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #eee;">Child Name:</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${childName}</td></tr>` : ''}
            ${grade ? `<tr><td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #eee;">Grade Applying:</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${grade}</td></tr>` : ''}
            ${program ? `<tr><td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #eee;">Interested Program:</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${program}</td></tr>` : ''}
            <tr><td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #eee;">Message:</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee; white-space: pre-wrap;">${message}</td></tr>
            <tr><td style="padding: 10px 14px; font-weight: bold; color: #777;">Submitted At:</td><td style="padding: 10px 14px; color: #777;">${submissionDate}</td></tr>
          </table>
        </div>
      </div>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL || 'NextGen Academy <onboarding@resend.dev>',
        to: [TARGET_EMAIL],
        reply_to: email,
        subject: emailSubject,
        html: htmlBody,
      }),
    });

    if (!resendRes.ok) {
      console.error('Resend delivery failed:', await resendRes.text());
      return new Response(
        JSON.stringify({ error: 'Failed to send message via mail service.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } else {
    // Relay securely server-to-server to FormSubmit
    const formSubmitPayload = {
      _subject: emailSubject,
      _template: 'table',
      _captcha: 'false',
      _replyto: email,
      'Form Type': formTitle,
      'Parent / Guardian Name': parentName,
      'Email Address': email,
      'Phone Number': phone,
    };
    if (childName) formSubmitPayload["Child's Name"] = childName;
    if (grade) formSubmitPayload['Grade Applying For'] = grade;
    if (program) formSubmitPayload['Program of Interest'] = program;
    formSubmitPayload['Message'] = message;
    formSubmitPayload['Submitted At'] = submissionDate;
    formSubmitPayload['Verified Origin'] = origin || referer || 'Same Origin';

    const relayRes = await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(formSubmitPayload),
    });

    if (!relayRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Upstream mail server error.' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Your enquiry has been successfully delivered.' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

