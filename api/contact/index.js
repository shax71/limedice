require('isomorphic-fetch');
const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

const GENERIC_FAILURE = { ok: false, error: 'Could not send. Please try again shortly.' };
const SUCCESS = { ok: true };

const MIN_DELAY_MS = 3000;
const CAPS = { name: 120, email: 200, organisation: 200, brief: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let graphClient;
function getGraphClient() {
  if (graphClient) return graphClient;
  const credential = new ClientSecretCredential(
    process.env.TENANT_ID,
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
  );
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default'],
  });
  graphClient = Client.initWithMiddleware({ authProvider });
  return graphClient;
}

async function verifyTurnstile(context, token, remoteip) {
  const params = new URLSearchParams();
  params.append('secret', process.env.TURNSTILE_SECRET);
  params.append('response', token);
  if (remoteip) params.append('remoteip', remoteip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: params,
  });
  const data = await r.json().catch(() => ({}));
  context.log.info('turnstile siteverify', {
    status: r.status,
    success: data.success,
    errorCodes: data['error-codes'],
    hostname: data.hostname,
    action: data.action,
    challengeTs: data.challenge_ts,
  });
  return data && data.success === true;
}

function reject(context, reason) {
  context.log.warn(`contact rejected: ${reason}`);
  context.res = { status: 200, headers: { 'Content-Type': 'application/json' }, body: GENERIC_FAILURE };
}

function ok(context) {
  context.res = { status: 200, headers: { 'Content-Type': 'application/json' }, body: SUCCESS };
}

module.exports = async function (context, req) {
  try {
    if (req.method !== 'POST') return reject(context, 'method');

    const contentType = (req.headers['content-type'] || '').toLowerCase();
    if (!contentType.includes('application/json')) return reject(context, 'content-type');

    const originHost = (() => {
      const o = req.headers['origin'] || '';
      try { return new URL(o).host; } catch (_) { return o.replace(/^https?:\/\//, ''); }
    })();
    const allowedHost = (process.env.ALLOWED_ORIGIN || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (allowedHost && originHost && originHost !== allowedHost) return reject(context, `origin ${originHost}`);

    const body = req.body || {};
    const { name, email, organisation, brief, turnstileToken, startedAt, website } = body;

    if (typeof website === 'string' && website.length > 0) return reject(context, 'honeypot');

    if (!name || !email || !brief || !turnstileToken || !startedAt) return reject(context, 'missing fields');
    if (typeof name !== 'string' || typeof email !== 'string' || typeof brief !== 'string') return reject(context, 'field types');
    if (name.length > CAPS.name) return reject(context, 'name length');
    if (email.length > CAPS.email || !EMAIL_RE.test(email)) return reject(context, 'email');
    if (organisation && (typeof organisation !== 'string' || organisation.length > CAPS.organisation)) return reject(context, 'org length');
    if (brief.length > CAPS.brief) return reject(context, 'brief length');

    const startedAtNum = Number(startedAt);
    if (!Number.isFinite(startedAtNum)) return reject(context, 'startedAt not a number');
    if (Date.now() - startedAtNum < MIN_DELAY_MS) return reject(context, 'time-trap');

    const remoteip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-azure-clientip'] ||
      undefined;

    const captchaOk = await verifyTurnstile(context, turnstileToken, remoteip);
    if (!captchaOk) return reject(context, 'turnstile');

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
      toRecipients: [{ emailAddress: { address: process.env.DESTINATION_EMAIL } }],
      replyTo: [{ emailAddress: { address: submittedEmail } }],
    };

    const client = getGraphClient();
    await client
      .api(`/users/${process.env.MAILBOX_UPN}/sendMail`)
      .post({ message, saveToSentItems: false });

    return ok(context);
  } catch (err) {
    context.log.error('contact handler error', err && err.stack ? err.stack : err);
    return reject(context, 'exception');
  }
};
