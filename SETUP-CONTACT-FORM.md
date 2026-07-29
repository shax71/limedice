# Contact form — setup and operations

How the contact form works and how to (re)deploy it.

## Architecture

- **Site**: static, hosted on statichost.eu, deploys on push to `main`. No server-side code runs there.
- **Handler**: Cloudflare Worker `limedice-contact` (`worker/` in this repo). The form on `www.limedice.com` POSTs cross-origin to the Worker's `workers.dev` URL.
- **Mail**: the Worker sends via Microsoft Graph `sendMail` as `scott@limedice.com`, using an Entra app registration with application-permission `Mail.Send`, scoped to that one mailbox by an Exchange Application Access Policy.
- **Anti-spam**: Cloudflare Turnstile (managed/invisible) + honeypot field + time-trap, all verified server-side in the Worker.

History: the handler was an Azure Functions app on Azure Static Web Apps until the Azure subscription was deleted (June 2026). The Entra app registration, the Exchange access policy and the Turnstile site all live outside the subscription and survived; only the hosting moved.

---

## One-time tenant setup (already done — kept for rebuild/rotation)

### Entra ID app (Graph `Mail.Send`)

Azure portal → **Microsoft Entra ID** → **App registrations** → `Lime Dice contact form`.

- **API permissions**: Microsoft Graph → Application permissions → `Mail.Send`, with admin consent granted (green ticks).
- **Certificates & secrets**: client secret, 24-month expiry. **Copy the Value immediately** — shown once. Store in the password manager. When it expires: create a new secret here, then re-run `wrangler secret put CLIENT_SECRET`.
- **Overview** page has the Application (client) ID and Directory (tenant) ID.

### Exchange Application Access Policy

Restricts the app to sending as `scott@limedice.com` only (without it, `Mail.Send` can send as anyone in the tenant):

```powershell
Connect-ExchangeOnline

New-ApplicationAccessPolicy `
  -AppId <CLIENT_ID> `
  -PolicyScopeGroupId scott@limedice.com `
  -AccessRight RestrictAccess `
  -Description "Lime Dice contact form can only send as scott@limedice.com"

Test-ApplicationAccessPolicy -AppId <CLIENT_ID> -Identity scott@limedice.com
# AccessCheckResult: Granted
```

### Cloudflare Turnstile

dash.cloudflare.com → **Turnstile** → site `limedice`.

- Hostnames: `limedice.com`, `www.limedice.com` (add `localhost` only while testing locally).
- Widget mode: Managed (invisible unless suspicious).
- **Site key** is public, lives in `site/index.html` on the `cf-turnstile` div.
- **Secret key** goes to the Worker via `wrangler secret put TURNSTILE_SECRET`.

---

## Deploying the Worker

From the repo root (Cloudflare account login required once):

```bash
cd worker
npx wrangler login
npx wrangler deploy
```

`deploy` prints the Worker URL: `https://limedice-contact.<your-subdomain>.workers.dev`. That URL goes in `site/main.js` as `CONTACT_ENDPOINT` (trailing slash fine).

### Secrets

Each command prompts for the value (paste from the password manager):

```bash
npx wrangler secret put TENANT_ID
npx wrangler secret put CLIENT_ID
npx wrangler secret put CLIENT_SECRET
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put MAILBOX_UPN          # scott@limedice.com
npx wrangler secret put DESTINATION_EMAIL    # scott@limedice.com
npx wrangler secret put ALLOWED_ORIGIN       # https://www.limedice.com
```

Secrets take effect immediately; no redeploy needed.

`ALLOWED_ORIGIN` must match the hostname the browser is actually on. It gates both the Worker's origin check and its `Access-Control-Allow-Origin` header, so a mismatch fails twice over — update it if the primary hostname ever changes.

### Logs

```bash
npx wrangler tail limedice-contact
```

Rejections log as `contact rejected: <reason>`; the full Turnstile siteverify response is logged so `error-codes` are visible. Logs also stream in the Cloudflare dashboard under the Worker's **Logs** tab.

---

## End-to-end verification

1. **Happy path.** On `https://www.limedice.com`, fill the form, submit. Expect the success banner and an email at `scott@limedice.com` with **Reply-To** set to the submitted address.
2. **Honeypot.** DevTools: `document.querySelector('input[name=website]').value = 'x'` → submit. Generic error, no email, log line `contact rejected: honeypot`.
3. **Time-trap.** DevTools: `document.getElementById('startedAt').value = Date.now()` → submit immediately. Generic error, log line `contact rejected: time-trap`.
4. **Turnstile bypass.**
   ```bash
   curl -X POST https://limedice-contact.<subdomain>.workers.dev/ \
     -H 'Content-Type: application/json' \
     -H 'Origin: https://www.limedice.com' \
     -d '{"name":"x","email":"a@b.co","brief":"x","turnstileToken":"fake","startedAt":1,"website":""}'
   ```
   Expect `{"ok":false,...}` (time-trap fires first with `startedAt:1` in the past — that's fine; use a recent `startedAt` to reach the Turnstile check). No email.
5. **Origin check.** Same `curl` with `-H 'Origin: https://example.com'`, or no Origin header at all. Generic failure, log line `contact rejected: origin ...`. (Unlike the Azure version, a missing Origin is rejected too.)
6. **Deliverability.** Confirm the mail lands in Inbox, not Junk/Other.

---

## Local development

The Worker runs locally with secrets from a git-ignored `.dev.vars` file in `worker/`:

```bash
cd worker
cat > .dev.vars <<'EOF'
TENANT_ID=...
CLIENT_ID=...
CLIENT_SECRET=...
TURNSTILE_SECRET=...
MAILBOX_UPN=scott@limedice.com
DESTINATION_EMAIL=scott@limedice.com
ALLOWED_ORIGIN=http://localhost:8080
EOF
npx wrangler dev
```

Serve the site from another terminal (`python -m http.server 8080` in `site/`), point `CONTACT_ENDPOINT` at `http://localhost:8787/` temporarily, and add `localhost` to the Turnstile hostname allowlist for the duration. Revert both afterwards.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `403 Forbidden` from Graph | Admin consent not granted, or the Application Access Policy blocks the mailbox | Check green ticks on the app's API permissions; re-run `Test-ApplicationAccessPolicy` |
| `401`/`invalid_client` in `token request failed` log | `CLIENT_SECRET` wrong, expired, or has stray whitespace | New secret on the app registration, `wrangler secret put CLIENT_SECRET` |
| Form shows "Couldn't verify" | Turnstile hasn't finished its silent challenge before the 5-second client poll times out, or site key wrong | Wait a few seconds before clicking Send; check the site key in `index.html` and the Turnstile hostname list |
| Form returns the generic error | A server-side check rejected: origin, Turnstile, honeypot, time-trap, or a Graph exception | `npx wrangler tail limedice-contact` and read the `contact rejected: <reason>` line |
| Turnstile `110200` in the siteverify `error-codes` | Hostname not in the Turnstile allowlist — observed during the Azure go-live against the SWA default hostname even when allowlisted (cause never established) | Test on `www.limedice.com`, not on a platform default hostname |
| Success banner but no email arrives | Access-policy scope mismatch; `MAILBOX_UPN` typo | Verify `MAILBOX_UPN` secret and the access policy |
| Browser console shows a CORS error | `ALLOWED_ORIGIN` doesn't match the page's hostname | `wrangler secret put ALLOWED_ORIGIN` with the exact origin |
