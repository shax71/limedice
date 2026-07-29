// Contact form handler — Cloudflare Worker port of the former Azure Function.
// Pipeline order matches the original: method/content-type, origin, honeypot,
// field caps, time-trap, Turnstile siteverify, then Microsoft Graph sendMail
// via the client-credentials flow. No dependencies.
//
// Secrets (set with `wrangler secret put <NAME>`):
//   TENANT_ID, CLIENT_ID, CLIENT_SECRET  — Entra app "Lime Dice contact form"
//   TURNSTILE_SECRET                     — Cloudflare Turnstile secret key
//   MAILBOX_UPN                          — mailbox to send as
//   DESTINATION_EMAIL                    — where enquiries land
//   ALLOWED_ORIGIN                       — https://www.limedice.com

const GENERIC_FAILURE = { ok: false, error: 'Could not send. Please try again shortly.' };
const SUCCESS = { ok: true };

const MIN_DELAY_MS = 3000;
const CAPS = { name: 120, email: 200, organisation: 200, brief: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Graph tokens last ~an hour; cache per isolate to avoid a token round-trip
// on every submission.
let tokenCache = { value: null, expiresAt: 0 };

function allowedHost(env) {
  return (env.ALLOWED_ORIGIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': 'https://' + allowedHost(env),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(env, body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  });
}

function reject(env, reason) {
  console.warn(`contact rejected: ${reason}`);
  return json(env, GENERIC_FAILURE);
}

async function verifyTurnstile(token, remoteip, env) {
  const params = new URLSearchParams();
  params.append('secret', env.TURNSTILE_SECRET);
  params.append('response', token);
  if (remoteip) params.append('remoteip', remoteip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: params,
  });
  const data = await r.json().catch(() => ({}));
  console.log('turnstile siteverify', JSON.stringify({
    status: r.status,
    success: data.success,
    errorCodes: data['error-codes'],
    hostname: data.hostname,
    action: data.action,
    challengeTs: data.challenge_ts,
  }));
  return data && data.success === true;
}

async function getGraphToken(env) {
  const now = Date.now();
  if (tokenCache.value && now < tokenCache.expiresAt - 60000) return tokenCache.value;

  const params = new URLSearchParams({
    client_id: env.CLIENT_ID,
    client_secret: env.CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });
  const r = await fetch(`https://login.microsoftonline.com/${env.TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    body: params,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.access_token) {
    console.error('token request failed', r.status, data.error, data.error_description);
    throw new Error('token request failed');
  }
  tokenCache = { value: data.access_token, expiresAt: now + (Number(data.expires_in) || 0) * 1000 };
  return data.access_token;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    try {
      if (request.method !== 'POST') return reject(env, 'method');

      const contentType = (request.headers.get('content-type') || '').toLowerCase();
      if (!contentType.includes('application/json')) return reject(env, 'content-type');

      // Cross-origin now, so the browser always sends Origin — its absence is
      // rejected too (the Azure version let empty origins through).
      const originHost = (() => {
        const o = request.headers.get('origin') || '';
        try { return new URL(o).host; } catch (_) { return o.replace(/^https?:\/\//, ''); }
      })();
      const allowed = allowedHost(env);
      if (allowed && originHost !== allowed) return reject(env, `origin ${originHost || '(none)'}`);

      const body = await request.json().catch(() => ({}));
      const { name, email, organisation, brief, turnstileToken, startedAt, website } = body;

      if (typeof website === 'string' && website.length > 0) return reject(env, 'honeypot');

      if (!name || !email || !brief || !turnstileToken || !startedAt) return reject(env, 'missing fields');
      if (typeof name !== 'string' || typeof email !== 'string' || typeof brief !== 'string') return reject(env, 'field types');
      if (name.length > CAPS.name) return reject(env, 'name length');
      if (email.length > CAPS.email || !EMAIL_RE.test(email)) return reject(env, 'email');
      if (organisation && (typeof organisation !== 'string' || organisation.length > CAPS.organisation)) return reject(env, 'org length');
      if (brief.length > CAPS.brief) return reject(env, 'brief length');

      const startedAtNum = Number(startedAt);
      if (!Number.isFinite(startedAtNum)) return reject(env, 'startedAt not a number');
      if (Date.now() - startedAtNum < MIN_DELAY_MS) return reject(env, 'time-trap');

      const remoteip = request.headers.get('cf-connecting-ip') || undefined;

      const captchaOk = await verifyTurnstile(turnstileToken, remoteip, env);
      if (!captchaOk) return reject(env, 'turnstile');

      const submittedEmail = email.trim();
      const submittedName = name.trim();
      const submittedOrg = (organisation || '').trim();
      const submittedBrief = brief.trim();

      const bodyLines = [
        `Name: ${submittedName}`,
        `Email: ${submittedEmail}`,
        submittedOrg ? `Organisation: ${submittedOrg}` : null,
        remoteip ? `Client IP: ${remoteip}` : null,
        '',
        submittedBrief,
      ].filter((l) => l !== null);

      const message = {
        subject: `[limedice.com] Enquiry from ${submittedName}`,
        body: { contentType: 'Text', content: bodyLines.join('\n') },
        toRecipients: [{ emailAddress: { address: env.DESTINATION_EMAIL } }],
        replyTo: [{ emailAddress: { address: submittedEmail } }],
      };

      const token = await getGraphToken(env);
      const r = await fetch(
        `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(env.MAILBOX_UPN)}/sendMail`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, saveToSentItems: false }),
        }
      );
      if (r.status !== 202) {
        const text = await r.text().catch(() => '');
        console.error('graph sendMail failed', r.status, text.slice(0, 500));
        return reject(env, 'graph');
      }

      return json(env, SUCCESS);
    } catch (err) {
      console.error('contact handler error', err && err.stack ? err.stack : err);
      return reject(env, 'exception');
    }
  },
};
