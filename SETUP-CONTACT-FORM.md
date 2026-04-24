# Contact form — deployment setup

One-time steps to take the new contact form live. Roughly 45–60 minutes wall-clock, most of it waiting on DNS/propagation.

Order matters: each step's output feeds the next.

---

## 1. Push the repo to GitHub

Static Web Apps deploys from a git remote, so this is first.

```bash
cd C:/Users/ScottWatson/source/repos/limedice
gh repo create shax71/limedice --public --source . --push
```

Check it's public and the default branch is `main`.

---

## 2. Register the Entra ID app (Graph `Mail.Send`)

In the Azure portal → **Microsoft Entra ID** → **App registrations** → **New registration**.

- **Name:** `Lime Dice contact form`
- **Supported account types:** Single tenant
- **Redirect URI:** leave blank

After creation, still inside that app:

### 2a. API permissions

- **API permissions** → **Add** → **Microsoft Graph** → **Application permissions**.
- Add `Mail.Send`.
- Click **Grant admin consent for <your tenant>**. Must show green ticks.

### 2b. Client secret

- **Certificates & secrets** → **New client secret**.
- Description: `limedice contact form`. Expiry: 24 months.
- **Copy the *Value* immediately** — it's only shown once. Paste it somewhere safe (password manager).

### 2c. Record IDs

From the app **Overview** page, copy:
- **Application (client) ID**
- **Directory (tenant) ID**

You now have three secrets: `TENANT_ID`, `CLIENT_ID`, `CLIENT_SECRET`.

---

## 3. Scope the app to one mailbox

Without this step, the app can send mail as **any** user in the tenant. You only want it sending as `scott@limedice.com`.

Install the Exchange Online module if you haven't already, then run in a PowerShell window (you'll be prompted to sign in as a Global Admin):

```powershell
Install-Module ExchangeOnlineManagement -Scope CurrentUser
Connect-ExchangeOnline

New-ApplicationAccessPolicy `
  -AppId <CLIENT_ID> `
  -PolicyScopeGroupId scott@limedice.com `
  -AccessRight RestrictAccess `
  -Description "Lime Dice contact form can only send as scott@limedice.com"

Test-ApplicationAccessPolicy -AppId <CLIENT_ID> -Identity scott@limedice.com
# AccessCheckResult should be: Granted

Test-ApplicationAccessPolicy -AppId <CLIENT_ID> -Identity <any-other-user@limedice.com>
# AccessCheckResult should be: Denied
```

Replace `<CLIENT_ID>` with the value from step 2c.

> The policy can take up to an hour to propagate. Move on; we'll verify later.

---

## 4. Create a Cloudflare Turnstile site

No DNS move required — Turnstile is DNS-independent.

- Sign in at [dash.cloudflare.com](https://dash.cloudflare.com/) (free account is fine).
- **Turnstile** → **Add site**.
- **Site name:** `limedice`.
- **Hostnames:** `limedice.com`, `www.limedice.com`. Add `localhost` while testing, remove it after go-live.
- **Widget mode:** *Managed* (invisible unless suspicious).
- Record two values:
  - **Site key** (public, goes in the HTML).
  - **Secret key** (private, goes in app settings).

---

## 5. Switch limedice.com to custom DNS in Microsoft 365

M365 won't let you add arbitrary records (the one for Azure validation) while in "managed" mode.

- **Microsoft 365 admin centre** → **Settings** → **Domains** → **limedice.com** → **DNS records** tab.
- Click **Manage DNS records yourself** (or equivalent wording). Confirm.
- Your existing Exchange / Teams / Autodiscover records stay. You now just have the freedom to add extras.

---

## 6. Create the Azure Static Web App

- Azure portal → **Static Web Apps** → **Create**.
- **Plan type:** Free.
- **Region:** pick one near the UK (West Europe or North Europe).
- **Deployment source:** GitHub. Authorise if prompted. Select the `shax71/limedice` repo, branch `main`.
- **Build preset:** *Custom*.
  - **App location:** `/`
  - **Api location:** `api`
  - **Output location:** leave blank
- Review + create.

Azure commits a workflow file to the repo at `.github/workflows/azure-static-web-apps-*.yml` and triggers the first deploy. Watch it finish on the **Actions** tab of the GitHub repo.

Once green, hit the generated hostname (something like `delightful-pebble-0123.azurestaticapps.net`) — you should see the site.

---

## 7. Bind limedice.com as a custom domain

Inside the Static Web App → **Custom domains** → **Add**.

- **Add custom domain on other DNS provider**.
- Enter `limedice.com` → click **Next**.
- Azure gives you a **TXT** record for validation. Copy the host and value.
- Go back to M365 DNS records for limedice.com → **Add record** → **TXT** with the values Azure gave you. Save.
- Back in Azure → click **Add** / **Validate**. Wait 1–5 minutes for the tick.

Once validated, Azure tells you which **A record** (or ALIAS, if available) to point at. Add it in M365 DNS.

Also add:
- **CNAME** `www` → `<your-swa-hostname>.azurestaticapps.net`.

Wait for propagation (5–30 min; check with `nslookup limedice.com`). Browse to `https://limedice.com` — certificate should auto-provision (can take a few more minutes).

---

## 8. Fill in the Turnstile site key in index.html

Open `index.html`, find this line:

```html
<div class="cf-turnstile" data-sitekey="TURNSTILE_SITEKEY_PLACEHOLDER" data-size="invisible" data-callback="onTurnstileToken"></div>
```

Replace `TURNSTILE_SITEKEY_PLACEHOLDER` with the **site key** from step 4. Commit + push; Azure redeploys automatically.

> The site key is public and safe in markup. The *secret* key is not — it goes in step 9.

---

## 9. Set application settings on the Static Web App

Static Web App → **Configuration** → **Application settings** → **Add** each of the following:

| Name | Value |
|------|-------|
| `TENANT_ID` | from step 2c |
| `CLIENT_ID` | from step 2c |
| `CLIENT_SECRET` | from step 2b |
| `MAILBOX_UPN` | `scott@limedice.com` |
| `DESTINATION_EMAIL` | `scott@limedice.com` |
| `TURNSTILE_SECRET` | from step 4 |
| `ALLOWED_ORIGIN` | `https://limedice.com` |

**Save**. Azure restarts the managed Function; changes are live within ~30 seconds.

---

## 10. End-to-end verification

1. **Happy path.** Open `https://limedice.com`, fill the form, submit. Expect a success banner and an email at `scott@limedice.com` with **Reply-To** set to the address you submitted.
2. **Honeypot.** DevTools → `document.querySelector('input[name=website]').value = 'x'` → submit. Should show the generic error; no email should arrive. Check Application Insights logs for `contact rejected: honeypot`.
3. **Time-trap.** DevTools → `document.getElementById('startedAt').value = Date.now()` → submit immediately. Generic error, no email. Logs should show `contact rejected: time-trap`.
4. **Turnstile bypass.** From a terminal:
   ```bash
   curl -X POST https://limedice.com/api/contact \
     -H 'Content-Type: application/json' \
     -H 'Origin: https://limedice.com' \
     -d '{"name":"x","email":"a@b.co","brief":"x","turnstileToken":"fake","startedAt":0,"website":""}'
   ```
   Expect `{"ok":false,...}`. No email.
5. **Origin check.** Same `curl` with `-H 'Origin: https://example.com'`. Generic failure. Logs show `contact rejected: origin https://example.com`.
6. **Scope enforcement (step 3 verification).** In the Static Web App configuration, change `MAILBOX_UPN` to a different tenant user for a moment. Submit the form. Expect `{"ok":false}` and a Graph 403 in logs (confirms the Application Access Policy is in force). **Revert to `scott@limedice.com` immediately.**
7. **Deliverability.** Inspect the received email's headers — it's internal Scott→Scott so SPF/DKIM aren't the gate; confirm it lands in Inbox, not Focused/Other or Junk.

---

## Local development

Install the SWA CLI once:

```bash
npm i -g @azure/static-web-apps-cli
cd api && npm i && cd ..
```

Copy the example secrets file (do **not** commit the real one — already in `.gitignore`):

```bash
cp api/local.settings.json.example api/local.settings.json
# edit api/local.settings.json with real secrets
```

Run the site + Function together:

```bash
swa start . --api-location api
```

Site serves at `http://localhost:4280` with `/api/contact` wired up to the local Function. Turnstile's `localhost` hostname from step 4 must still be in your Turnstile hostname list.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `403 Forbidden` from Graph | Admin consent not granted, or Application Access Policy blocks the mailbox | Re-check step 2a (green ticks), re-run `Test-ApplicationAccessPolicy` from step 3 |
| `401 Unauthorized` from Graph | `CLIENT_SECRET` wrong, expired, or has leading/trailing whitespace | Regenerate in step 2b, update app setting in step 9 |
| Form shows "Couldn't verify" | Turnstile hasn't finished its silent challenge before the 5-second client poll times out, or site key wrong | Wait a few seconds on the page before clicking Send; otherwise check step 8 and the hostnames in step 4 |
| Form returns `{ok:false}` from `/api/contact` (HTTP 200 with generic error) | One of the server-side checks rejected: origin mismatch, Turnstile siteverify failed, honeypot, time-trap, or Graph exception | Read App Insights `traces \| where message startswith "contact"` for the specific `contact rejected: <reason>` line; the handler logs the full siteverify response so Turnstile `error-codes` are visible |
| Turnstile fails with `110200` on the Azure default hostname (`*.N.azurestaticapps.net`) even when the hostname is in the allowlist | Observed during Lime Dice go-live — Turnstile's hostname validation appears unreliable against the Azure default hostname format. Cause not established; re-typing the hostname, waiting several hours, and using a fresh browser context did not clear it | Don't test on the Azure default hostname. Add the custom domain (`www.limedice.com`) first, point `ALLOWED_ORIGIN` at it, and test there |
| Form returns success but no email arrives | App Access Policy scope mismatch; mailbox UPN typo | Step 3 + `MAILBOX_UPN` in step 9 |
| Custom domain stuck on validation | TXT record not yet propagated | Give it 15 min; `nslookup -type=TXT limedice.com` to check |
| SWA build fails on `api/` | Function runtime mismatch | Confirm Node 20 in `api/package.json` engines; SWA picks that up automatically |
| `ALLOWED_ORIGIN` must match the hostname the browser is actually using | Easy to forget after DNS changes. A mismatch causes `/api/contact` to reject with `contact rejected: origin <host>` before Turnstile is even checked | Update the SWA Configuration app setting whenever the test hostname changes; Function restarts in ~30s. Value can omit the scheme (handler normalises both forms) |

---

## What already exists in the repo

You don't need to write any code — it's all in this commit:

- `api/contact/index.js` — the Function handler (Graph `sendMail`, Turnstile verify, honeypot, time-trap).
- `api/host.json`, `api/package.json`, `api/contact/function.json` — Function scaffolding.
- `staticwebapp.config.json` — routes + security headers + CSP including Turnstile.
- `index.html` — Turnstile widget + honeypot + hidden timestamp input (site key placeholder in step 8).
- `main.js` — client-side validation + Turnstile token + POST to `/api/contact`.
- `styles.css` — `.hp` honeypot styling.
