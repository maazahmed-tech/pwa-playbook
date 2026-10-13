# 03 — Services setup

**Goal of this chapter:** every third-party service the app needs is created by the right person, its key is handed to Claude safely, stored in the right place, verified before use, and you know what expires and how to recover. No values appear here — only placeholders like `<GITHUB_PAT>`.

Links: how the services are used in code is in [04-tech-stack.md](04-tech-stack.md) and the milestone chapters; the security rules around secrets are in [20-security.md](20-security.md); the cutover hand-over to the client is in [15-payments-and-cutover.md](15-payments-and-cutover.md).

---

## 1. Five principles

1. **You create accounts; Claude wires them.** Claude cannot create accounts, accept terms, add a card, complete a CAPTCHA or run an OAuth login inside a non-interactive session. It *can* drive a service through its REST API once you give it a token, and it can tell you click by click what to do.
2. **A secret is given once, verified once, stored in one place.** Local: a gitignored `.env.local` (or `.env.ci-backend`). Online: the Vercel project's environment variables and the GitHub Actions secrets. Nowhere else — not in code, docs, memory, briefs, chat archives or commit messages.
3. **Verify before you rely.** One cheap API call proves a token is alive and belongs to the right account with the right access. On Assemble, tokens for the wrong account, revoked tokens, expired tokens and tokens without a scope each cost time until this became a rule.
4. **Least privilege, short life.** Fine-grained GitHub tokens limited to the project repos; Vercel tokens with a short expiry; a Resend key with "sending access" only; a Stripe restricted key. Rotate anything that was ever pasted in chat.
5. **Ownership follows the bill.** Services that bill per use or represent the business (AI, 3D, email sending, Google sign-in, domain, payments, app stores) end up in the client's name at cutover. Code, CI, hosting, database and monitoring stay with the agency.

---

## 2. When each service is first needed

| Milestone | Services needed | Who creates |
|---|---|---|
| 0 Pre-build | GitHub, Vercel, domain + DNS | You |
| 1 Wireframes | GitHub, Vercel (static sites); an image generator you use manually for placeholder icons | You |
| 2 UI | Same, plus an image generator (Gemini app) and a 3D generator (Tripo Studio) used manually; Google Fonts and CDNs (no keys) | You |
| 3 Full-stack frontend | Neon (Postgres + object storage), Google OAuth client, Resend, Sentry, PostHog, VAPID keys, app-generated secrets, Tripo API key, Vercel API token | You create; Claude wires |
| 4 Backend | Google Gemini API key with billing, staging Vercel projects, CI database branches, Dependabot | You create; Claude wires |
| 5 Payments & cutover | Stripe (restricted key), the client's own Gemini/Tripo/Resend/OAuth accounts, Bitwarden Send | The client creates; you receive; Claude wires |
| 6 Growth | PWABuilder (no account) for a test Android package; Google Play / Apple later | You / the client |

---

## 3. How to hand a secret to Claude

Three ways, best first.

**A. You put it in the env file yourself, then tell Claude where it is.** Open `apps/web/.env.local` (gitignored), add `RESEND_API_KEY=<value>`, save, and tell Claude "the Resend key is in apps/web/.env.local under RESEND_API_KEY; verify it and set it on the staging Vercel project". Nothing secret enters the chat.

**B. Claude asks the provider's CLI to log in through your browser.** Neon works this way (`neon auth` opens a browser page you approve; the CLI then pulls env files itself). The token never appears in chat.

**C. You paste it in chat** (how most of Assemble was done). It works, but the value then sits in the transcript, the archive and every compaction summary. If you do this: use a fine-grained or short-lived token, tell Claude the rules below, and rotate it when the work is done.

> **For Claude — paste this (rules for any secret given in chat):**
```
Secret handling rules for this session:
- Use the value only where it belongs: inline in one command, or written into the gitignored env file [PATH] and the hosting/CI secret store. Never into code, docs, memory, briefs or commit messages.
- Verify it first with one API call and tell me which account it belongs to and what it can access. Stop and ask if access is missing.
- Redact it from every command output you show me.
- For git pushes: inline URL, never `-u`; afterwards `git config --get-regexp remote` must show no token.
- At the end of the work, remind me to revoke or rotate it.
```

---

## 4. Service checklists

Each block: where to create → what to set → when to hand to Claude → where it is stored → how to verify → expiry and recovery.

### 4.1 GitHub

**Where:** github.com. One owner account for all client repos (the account linked to Vercel).

- ☐ Create each repo **empty** (no README, no `.gitignore`, no licence) so Claude's first push lands cleanly. Private for anything with a real person's data or unreleased work; the coming-soon page can be public.
- ☐ **Fine-grained personal access token** for Claude: Settings → Developer settings → Personal access tokens → Fine-grained → repository access: *only* the project repos → permissions: `Contents: read and write`, `Actions: read`, `Workflows: read and write` (needed to push `.github/workflows/*`; missing on Assemble for weeks) → expiry 90 days or more. Store it in your password manager.
- ☐ Set the **repo-local git identity** in every repo right after `git init`: `git config user.name <GITHUB_OWNER>` and `git config user.email <ID>+<GITHUB_OWNER>@users.noreply.github.com` (Claude looks up the numeric ID with `gh api users/<GITHUB_OWNER> --jq .id`). **Why:** Vercel Hobby blocks deploys from private repos whose commit author is not the owner.
- ☐ Check which account the local `gh` CLI is logged into (`gh auth status`). If it is not the owner, do **not** use it for pushes; Claude will push with the token inline instead.
- ☐ When a repo needs CI: create **Actions secrets** (`DATABASE_URL`, `AUTH_SECRET`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `AWS_*` for the CI database branch) — Claude can set them with `gh secret set` using the token. Do this **the day the repo is created**, or every CI run fails.
- ☐ Enable **Dependabot** alerts and weekly grouped updates (`.github/dependabot.yml`, template `templates/ci/dependabot.yml`). Know that Dependabot branches can fill the Vercel build queue.

**Hand to Claude:** at the first push of each milestone. **Stored:** nowhere on disk; inline in push URLs; `GH_TOKEN` for `gh` calls. **Verify:** `curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer <GITHUB_PAT>" https://api.github.com/repos/<GITHUB_OWNER>/<REPO>` → `200`; `curl -sI -H "Authorization: token <GITHUB_PAT>" https://api.github.com/user | grep -i x-oauth-scopes` for classic tokens. **Expiry:** the classic PAT died on 10 Sep 2026 (401 on push) and was replaced by a fine-grained one the same day; pushes inside chained commands fail *silently*, so the curl check runs before every push.

### 4.2 Vercel

**Where:** vercel.com, linked to the GitHub owner account. A team (SAML on Assemble) or a personal Hobby account.

- ☐ Connect the GitHub account (Vercel → Add New → Project → Import).
- ☐ **Static sites** (coming-soon, wireframes, UI prototype): framework "Other", no build command, `index.html` at the repo root (Vercel returns 404 otherwise; a 10-line `index.html` redirect works if the main file has another name).
- ☐ **Monorepo**: import the same repo **once per app** with a different Root Directory (`apps/web`, `apps/admin`, `apps/site`). Install command `cd ../.. && npm install`; build `npm run build`; for the static site `echo` commands and output directory `.`. The root `package.json` must carry `"packageManager": "npm@<version>"` or Turbo refuses to resolve workspaces. Ignored Build Step: `npx turbo-ignore` so a commit touching one app does not rebuild the others (expect "CANCELED" deploys for untouched apps).
- ☐ **Domains**: apex → the coming-soon/site project; `app.` → customer app; `admin.` → admin. Add the CNAMEs at the registrar (section 4.3). Moving a domain between Vercel projects is instant and reversible with no DNS change — that is how the landing page will replace the coming-soon page at cutover.
- ☐ **Environment variables** per project (section 5). Changing one needs a redeploy; empty "redeploy" commits get cancelled by the ignored build step, so Claude uses the redeploy API.
- ☐ **Cron** in `apps/web/vercel.json` (`{"crons":[{"path":"/api/cron/reset-demo","schedule":"0 6 * * *"}]}`); Vercel sends `Authorization: Bearer <CRON_SECRET>`. Crons register on deploy; check the project's Cron Jobs tab.
- ☐ **Deployment Protection**: branch previews are behind Vercel login by default. Turn it off for previews if a reviewer without a Vercel account must see them, or share a bypass link.
- ☐ **API token for Claude**: Account → Settings → Tokens → create, scope the team, **short expiry (1 day)** when pasting in chat. Claude then creates projects, links the repo, sets root directories and env vars, moves domains, triggers deployments and polls their status through the REST API.

**Hand to Claude:** at milestone 3 (first monorepo deploy) and whenever a token expires. **Stored:** in the session only; scripts read it from `VERCEL_TOKEN` in the environment (never hard-code it in a script). **Verify:** `curl -s -H "Authorization: Bearer <VERCEL_TOKEN>" "https://api.vercel.com/v6/deployments?projectId=<PROJECT_ID>&teamId=<TEAM_ID>&limit=1"` must return a `deployments` array. `GET /v2/user` returning 200 is **not** enough on a SAML team. **Expiry:** team-scoped write access expired repeatedly (August, 2 Sep, 10 Sep, 17 Sep 2026) with 403 "must re-authenticate to this scope". Recovery: issue a new token; meanwhile rely on auto-deploy on push and verify against live URLs (`/api/version` returns the build sha).

### 4.3 Domain and DNS

**Where:** your registrar (Hostinger on Assemble; DNS managed in its hPanel).

- ☐ Apex `A` record → Vercel's IP (Vercel shows it); `www`, `app`, `admin` → `CNAME cname.vercel-dns.com`.
- ☐ Resend records (section 4.7): two TXT (SPF, DKIM) and an MX for bounces. **Gotchas:** the registrar auto-appends the domain to the "Name" field (enter `send`, not `send.<domain>`); the DKIM value must be pasted on one line.
- ☐ Optional DMARC TXT record.

**Verify:** `nslookup app.<domain>` resolves to the CNAME; `curl -sI https://app.<domain>` returns 200 with a valid certificate (Claude polls; ~4 minutes on Assemble). **Expiry:** domain renewal date in your calendar.

### 4.4 Neon (Postgres + Object Storage)

**Where:** neon.tech (agency org). One project per app; region must support Object Storage if you want it (`us-east-2` did).

- ☐ Create the project with **Postgres only** (auth/data-API features off — auth, storage and AI have their own providers).
- ☐ Install the agent skills and CLI: `npx skills add neondatabase/agent-skills -s neon -s neon-postgres -y`, `npm i -g neonctl` (the package installs two commands; use `neon` — on Assemble `neonctl` hung and was abandoned), then `neon auth` (browser OAuth you approve) and `neon link --project-id <NEON_PROJECT_ID> --org-id <NEON_ORG_ID>` (writes a gitignored `.neon` file). The Neon MCP connector needs an interactive OAuth login; the CLI and REST API did everything on Assemble without it.
- ☐ `neon.ts` declares the services (`preview.buckets.<name>.access = "private"`); `npx neon deploy` creates the bucket; `neon env pull --file apps/web/.env.local` writes `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (for DDL), `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `NEON_BRANCH`. The CLI adds the file to `.gitignore`.
- ☐ **Branches** (copy-on-write database + bucket): `production`, `staging`, `ci` (frontend CI), `ci-backend` (backend CI), temporary `cutover-rehearsal` and `pre-cutover-backup` forks. `neon branches create --name <branch> [--parent <branch>]`.
- ☐ **Rule:** `neon env pull --branch <ci-branch>` **rotates that branch's storage credentials**, invalidating the copies in GitHub secrets. Pull once, save to a gitignored `.env.ci-backend`, and never pull again for that branch; if you must, update every `AWS_*` and `DATABASE_URL` secret immediately.
- ☐ Migrations: plain `.mjs` scripts, additive and re-runnable, run with `DATABASE_URL=<branch url> node packages/db/migrations/<file>.mjs`; applied to staging **and** the CI branch the same day; production only at cutover.

**Hand to Claude:** at milestone 3 by letting the CLI log in (way B). **Stored:** `.neon`, `.env.local`, `.env.ci-backend` (all gitignored); Vercel env; GitHub secrets. **Verify:** schema push/seed counts; a "mutation proof" (update one row directly → the live API shows it → revert); `tools/cutover/verify.mjs` PASS lines. **Expiry:** none on the free tier, but the database suspends when idle and wakes in ~500 ms (that is why Neon was chosen over a free tier that pauses projects).

### 4.5 Google Gemini API (AI Studio)

**Where:** aistudio.google.com → API keys, on a Google Cloud project. Agency project for staging; the client's own project for production.

- ☐ Create the Cloud project, create the key ("Create API key" → choose the project; it starts with `AIza`).
- ☐ **Enable billing** on the project (AI Studio → API keys → "Set up billing" next to the project, then link a card in Google Cloud billing). The free tier gives **image models zero quota**; without billing every render fails with "quota exceeded". Text models work free but are rate-limited.
- ☐ Prepaid credit can **run out** (13–14 Sep 2026: both models returned 429 and every AI feature on staging broke, including the client's tests). Set budget alerts (Cloud billing → Budgets, 50/90/100%) and keep the admin panel's own budget and warnings.
- ☐ The key goes to **local and staging only** until cutover; production gets the client's key.

**Hand to Claude:** at milestone 4 (way A or C). **Stored:** `apps/web/.env.local`, `apps/admin/.env.local` (the admin describer), staging Vercel env as `GEMINI_API_KEY`. **Verify:** list models (`GET https://generativelanguage.googleapis.com/v1beta/models` with the key in the header) plus one smoke generation on a text model and one on the image model. **Expiry:** keys do not expire; credit does. If the key is ever pasted anywhere public, delete it in AI Studio and create another.

### 4.6 Google OAuth (Sign in with Google)

**Where:** console.cloud.google.com → APIs & Services → OAuth consent screen and Credentials, in the same Cloud project as the Gemini key (client's project for production).

- ☐ Consent screen: External; app name; support email; privacy and terms links (`https://app.<domain>/privacy`, `/terms`); authorised domain `<domain>`; **Publish** (basic email/profile scopes need no review). While it is in Testing mode only listed test users can sign in.
- ☐ Credentials → OAuth client ID → Web application. Authorised JavaScript origins: `https://app.<domain>`, `http://localhost:3000`. **Authorised redirect URIs, exactly, no trailing slash:** `https://app.<domain>/api/auth/callback/google`, `https://<staging-app>.vercel.app/api/auth/callback/google`, `http://localhost:3000/api/auth/callback/google`. Missing the staging one gives `redirect_uri_mismatch` on staging (it did).
- ☐ Copy the client ID (ends `.apps.googleusercontent.com`) and the client secret.

**Hand to Claude:** milestone 3. **Stored:** `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` in `.env.local` and Vercel env. **Verify:** `GET https://app.<domain>/api/auth/providers` lists `google` and `credentials`; a real sign-in on staging. **Expiry:** none; rotate the secret if exposed.

### 4.7 Resend (transactional email)

**Where:** resend.com.

- ☐ Create the account; add the domain (Domains → Add → `<domain>`, region near your users); add the DNS records at the registrar (section 4.3); click Verify (minutes to an hour).
- ☐ Until the domain is verified, Resend is **sandboxed**: it delivers only to the account owner's own address, from `onboarding@resend.dev`.
- ☐ API key: API keys → Create → permission **Sending access**, restricted to the domain. `EMAIL_FROM="<App> <verify@<domain>>"`.
- ☐ The app sends only sign-in/verification/reset codes, support-ticket emails and admin 2FA/save-lock codes — "nothing else". **Why:** sender reputation and simplicity.

**Hand to Claude:** milestone 3. **Stored:** `RESEND_API_KEY`, `EMAIL_FROM` in both apps' env and Vercel. **Verify:** a test email to your inbox; a real sign-up to a non-owner address returns `{"ok":true}`. **Expiry:** none; the client's own Resend account takes over at cutover (domain re-verified there).

### 4.8 Tripo (3D engine)

**Where:** platform.tripo3d.ai (the **API platform**, separate from Tripo Studio; Studio subscription credits do not apply to the API).

- ☐ Create the API account; create a key under API Keys; buy credits under Billing (prepaid; new API accounts got 300 free credits in September 2026; advertised free credits once showed 0).
- ☐ Know the cost per build at your settings (60 engine credits at Assemble's max settings; failed tasks are not charged; each task's status returns `consumed_credit`).
- ☐ The key lives on **both** the web app (builds) and the admin app (wallet display and low-wallet alert).
- ☐ The vendor is **never named** in the product.

**Hand to Claude:** milestone 3 stage C. **Stored:** `TRIPO_API_KEY` in both apps' env and Vercel. **Verify:** `GET https://api.tripo3d.ai/v2/openapi/user/balance` with `Authorization: Bearer <TRIPO_API_KEY>` shows the wallet; one real build on staging, then delete it. **Expiry:** wallet runs out (top up; the admin alert threshold was set to 200 engine credits ≈ 3 builds). The key was rotated once (1 Sep 2026) when a new engine account was created: update local env, both Vercel projects, redeploy via API.

### 4.9 Sentry (errors) and PostHog (analytics)

- ☐ Sentry: one organisation, **one project per app** (`<app>-web`, `<app>-admin`, platform Next.js). Copy each DSN. `sendDefaultPii` off; a scrubber strips emails, tokens and keys before sending.
- ☐ PostHog: one project (US or EU cloud); copy the **project API key** (a public client key) and host. Pageviews on the customer app; cookieless mode on the landing site (no consent banner), visit source carried into sign-up.

**Hand to Claude:** milestone 3. **Stored:** `NEXT_PUBLIC_SENTRY_DSN` per app; `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`. **Verify:** a build with instrumentation and a test error; pageviews arriving. **Expiry:** none.

### 4.10 Keys the app generates itself

Claude generates these locally; you never see or type them.

- ☐ `AUTH_SECRET` (Auth.js), `ADMIN_SESSION_SECRET`, `CRON_SECRET`: random 32+ byte strings.
- ☐ `ADMIN_PASSWORD`: the start-up admin password (later replaced by a hashed value the owner sets in the admin panel). Keep the start-up value in your password manager; read it to the client by phone at cutover; never ask Claude to repeat it in chat (it was once, and it landed in the transcript).
- ☐ `ADMIN_EMAIL` (owner inbox for 2FA and save-lock codes), `ADMIN_EMAIL_CC` (optional extra recipients of the sign-in code only).
- ☐ VAPID web-push keys: `npx web-push generate-vapid-keys` → `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (a `mailto:`), `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. Same keys on the web and admin projects.

**Stored:** env files, Vercel env (both apps where shared), GitHub Actions secrets for the ones tests need (`AUTH_SECRET`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`). **Verify:** cron endpoint returns 200 with the secret and 401 without; a push notification arrives on your phone.

### 4.11 Stripe (planned — not wired on Assemble yet)

- ☐ The **client** creates the Stripe account in the business name and completes business and bank details.
- ☐ Developers → API keys → **restricted key** with Checkout, Customers, Subscriptions and Webhooks permissions; send it via Bitwarden Send.
- ☐ Claude wires Checkout and a webhook endpoint, sets `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` on production only, runs a test purchase with the client on the phone, and removes the "Test mode — you won't be charged" label.
- ☐ Store billing (Google Play / Apple) is a separate decision; a PWA keeps 100% of credit revenue.

See [15-payments-and-cutover.md](15-payments-and-cutover.md) for the full plan.

### 4.12 Android test package (PWABuilder) and app stores (later)

- ☐ A signed **TWA** test APK can be generated through PWABuilder's cloud packaging without a local Android toolchain (package id like `<tld>.<app>.staging`, pointing at the staging app). Publish `/.well-known/assetlinks.json` in the web app so the shell opens full screen.
- ☐ Keep the `.apk`, `.aab`, keystore and key info **outside every repo** (`<Client>/twa-staging/`); every future build of that package id must use the same keystore.
- ☐ Sideloaded builds show a Play Protect warning — expected. Store publishing needs the client's Google Play developer account and Apple Developer Program (organisation accounts need a D-U-N-S number), and store billing for digital goods before either store accepts credits and subscriptions.

### 4.13 Bitwarden Send (receiving keys from the client)

- ☐ Ask the client to use a text Send that expires after one day and one opening, with an optional password told by phone. Never WhatsApp, SMS, email, chat or a shared document.
- ☐ Confirm receipt the same day; swap keys within the hour if the client rotates.

---

## 5. Environment variable inventory (names only)

Copy the `.env.example` files from `templates/repo/env/` (`root.env.example`, `web.env.example`, `admin.env.example`); this table says which name goes where.

| Name | Web app | Admin app | Site build | GitHub Actions (CI) | Notes |
|---|---|---|---|---|---|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH` | ✓ | `DATABASE_URL` ✓ | — | `DATABASE_URL` (CI branch) | Unpooled for DDL/migrations |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION` | ✓ | ✓ | — | ✓ (CI branch bucket) | Neon Object Storage; `forcePathStyle: true` |
| `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | ✓ | — | — | `AUTH_SECRET`, `AUTH_TRUST_HOST=true` | Auth.js |
| `RESEND_API_KEY`, `EMAIL_FROM` | ✓ | ✓ | — | — | Codes and ticket emails |
| `GEMINI_API_KEY` | ✓ | ✓ | — | never (mocked) | Staging only until cutover |
| `TRIPO_API_KEY` | ✓ | ✓ | — | never (mocked) | Wallet shown in admin |
| `NEXT_PUBLIC_SENTRY_DSN` | ✓ (own) | ✓ (own) | — | — | One project per app |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | ✓ | — | ✓ | — | Public client key |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ✓ | ✓ | — | — | Web push |
| `CRON_SECRET` | ✓ | — | — | — | Vercel cron auth |
| `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_EMAIL_CC` | — | ✓ | — | `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | Tests mint the admin cookie from the secret |
| `NEXT_PUBLIC_WEB_ORIGIN`, `NEXT_PUBLIC_APP_URL` | — | ✓ | — | — | Admin links back to the app |
| `NEXT_PUBLIC_DEMO_LOGIN=1` | staging only | — | — | set by `next.config.mjs` when `CI && !VERCEL` | **Never on production** |
| `SITE_APP_URL`, `SITE_CONFIG_URL` | — | — | ✓ | — | Landing site reads live plan config at build |
| `GEMINI_MOCK=1`, `TRIPO_MOCK=1`, `E2E_DB=1`, `E2E_STORAGE=1` | test servers only | test servers only | — | via Playwright config | Never on a deployed project |
| `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`, `VERCEL` | provided by Vercel | provided by Vercel | — | — | Update toast; demo gate |

**Environment ladder — where each secret goes:**

| Environment | Database branch | Vercel projects | AI keys | Who tests here |
|---|---|---|---|---|
| Production | `production` | `<app>-app`, `<app>-admin`, `<app>-site` | Client's keys at cutover (agency keys never) | Real users |
| Staging | `staging` | `<app>-staging-app`, `<app>-staging-admin` | Agency keys | You, the client (when invited), live checks, local e2e |
| CI | `ci-backend` (and `ci` for the frontend repo) | none | none (mocks) | GitHub Actions |
| Rehearsal | fork of `production`, deleted after | none | none | Cutover rehearsal only |

---

## 6. Verification commands Claude runs before relying on a credential

> **For Claude — paste this (verify every credential before use):**
```
Before relying on any credential this session, verify it and report the result (redacted):
- GitHub PAT: `curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer <GITHUB_PAT>" https://api.github.com/repos/<OWNER>/<REPO>` must be 200; also confirm the token's account with GET /user. If we need to push .github/workflows, confirm the token has the Workflows permission.
- Vercel token: `GET https://api.vercel.com/v6/deployments?projectId=<PROJECT_ID>&teamId=<TEAM_ID>&limit=1` must return a `deployments` array. A 200 on /v2/user is not enough. On 403 "re-authenticate to this scope" ask me for a new token and fall back to live-URL checks.
- Neon: `neon branches list` works and `.env.local` NEON_BRANCH matches the branch we intend. Never run `neon env pull` for the CI branch.
- Gemini: list models with the key, then one tiny text generation; for image features one tiny image generation (quota error = billing not enabled).
- Tripo: GET /v2/openapi/user/balance; report the wallet and whether it covers one build.
- Resend: send one test email to my address; confirm the domain shows Verified (sandbox otherwise).
- Google OAuth: GET https://<app>/api/auth/providers lists google; confirm the callback for this environment is in the client's redirect URIs.
Stop and ask if any check fails. Do not retry a 401/403 in a loop.
```

> **For Claude — paste this (set env vars on Vercel and redeploy):**
```
Set these env vars on the Vercel project <PROJECT_ID> (team <TEAM_ID>) for targets production and preview using POST /v10/projects/<PROJECT_ID>/env?teamId=<TEAM_ID>&upsert=true with type "encrypted": [LIST OF NAMES; values from apps/<app>/.env.local]. Then trigger a redeploy with POST /v13/deployments?teamId=<TEAM_ID>&forceNew=1 using the latest READY production deploymentId (an empty commit would be cancelled by the ignored build step). Poll until READY and confirm with a live call to <URL>/api/version. Read the token from the VERCEL_TOKEN environment variable; never write it into a script.
```

---

## 7. What expires and what to do

| Credential | What happened on Assemble | Check | Recovery |
|---|---|---|---|
| GitHub classic PAT | Revoked between sessions (22 Jul); wrong-account tokens (9, 25 Jul, 5 Aug); missing `workflow` scope (28 Aug, 10 Sep); expired 10 Sep | curl repo lookup → 200 before every push | New fine-grained PAT; commit locally meanwhile |
| Vercel API token | 403 "re-authenticate to this scope" on team writes (Aug, 2 Sep, 10 Sep, 17 Sep) | One deployments call | New short-lived token; verify via live URLs and auto-deploy meanwhile |
| Neon CI branch storage creds | Rotated by an `env pull` | — | Update all `AWS_*` + `DATABASE_URL` secrets; then never pull again |
| Gemini prepaid credit | Ran out 13–14 Sep; all staging AI down | Live call to both models | Top up in AI Studio → Billing; budget alerts |
| Tripo wallet | 0 despite advertised free credits (28 Aug); rotated to a new account (1 Sep) | Balance endpoint | Top up; admin low-wallet alert at 200 |
| Resend sandbox | Codes only reached the owner until the domain verified (28 Aug) | Test send to a non-owner address | Verify the domain; fix registrar name doubling / DKIM one line |
| Google OAuth redirect | `redirect_uri_mismatch` on staging | Real sign-in on each environment | Add the exact callback URI |
| Claude Code login | "OAuth access token has expired" (16 Sep) | — | Re-authenticate, re-send the message |

---

## 8. Cutover: what moves to the client

At cutover the client provides, in their own name: Google Cloud project with billing + Gemini key + budget alert; OAuth consent screen and client with the two exact redirect URIs; 3D engine account and key; Resend account with the domain verified and a sending-only key; admin email addresses; business details and approval of the legal text; first shop content. Later: Google Play and Apple accounts (invite the agency), Stripe restricted key. The agency keeps GitHub, CI, Vercel, the database and monitoring. The full step-by-step document to send the client is the template `templates/docs/CLIENT-HANDOVER-CHECKLIST.md`; the switch itself is in [15-payments-and-cutover.md](15-payments-and-cutover.md).

---

## Assemble example

- **GitHub (9 Jul 2026 onward).** The first push was denied because the machine's `gh` was logged into an account with no access; a collaborator invite never existed; a pasted owner PAT fixed it. Five PATs were pasted over July; each was used inline, never stored, and Claude reminded you to revoke it at the end of nearly every reply. On 5 Aug three tokens were tried before one could see the private repo (404 means "missing or no permission"). The `workflow` scope was added on 28 Aug so `.github/workflows/ci.yml` could be pushed, and again on 13 Sep for the fine-grained token. The backend repo's CI failed on every commit from 1 Sep until eight Actions secrets and a dedicated `ci-backend` branch were created at 11:32 that day.
- **Vercel (28 Aug 2026).** You asked "can I connect my Vercel here so you do it for me automatically?"; Claude explained token vs connector, asked for a 1-day token, then created `assemble-app`, `assemble-admin` and `assemble-site` with the right root directories, fixed the first three failed builds (`packageManager`, install command), moved `assemble.ink` and `www` from the old coming-soon project to the site project with zero downtime, attached `app.` and `admin.`, and polled DNS until all three URLs returned 200 with certificates (about four minutes after you added the CNAMEs at Hostinger). Staging projects `assemble-staging-app` and `assemble-staging-admin` were created the same way on 1 Sep; a noindex `assemble-site-preview` and a `assemble-coming-soon-backup` project on 13–14 Sep.
- **Neon (28 Aug 2026).** Installed via the agent skills, OAuth in the browser, linked, `env pull`, schema pushed (12 tables), seeded, four routes switched to the database, `DATABASE_URL` set on Vercel, a mutation proof run on production. The `ci` branch was created on 28 Aug after a CI run reset the production demo mid live-test; `staging` and `ci-backend` on 1 Sep; a production fork on 11 Sep for the cutover rehearsal (migrations 004–011, verify all PASS, fork deleted).
- **Google OAuth, Resend, PostHog, Sentry (28 Aug 2026, 05:53–06:26).** Claude wrote click-by-click setup guides; you pasted the keys; real auth, OTP emails, Sentry on both apps and PostHog pageviews were live in half an hour; the Resend domain was verified at ~10:13 after Claude explained the registrar name-field and DKIM gotchas.
- **Tripo (28 Aug, 1 Sep 2026).** Key verified via the balance endpoint (valid, wallet 0); you topped up; stage C ran a real build (upload 201 → 8 credits charged → progress → ~50 s → 6.4 MB GLB served through the storage proxy). A new engine account and key on 1 Sep: env swapped locally and on both Vercel projects, redeploy via API, one verification build, cleanup.
- **Gemini (1 Sep, 9–10 Sep, 13–14 Sep 2026).** Key from AI Studio, verified by listing models and a smoke generation, stored on backend local and staging only; renders failed on the free tier until billing was enabled on 9–10 Sep; prepaid credit ran out on 13 Sep and was topped up on 14 Sep.

## Pitfalls

| Symptom | Cause | Fix | Prevent |
|---|---|---|---|
| Push denied 403 | Local `gh` account is not the owner | Owner PAT inline | `gh auth status` on day 1 |
| "Repository not found" on push or clone | Token for another account, or fine-grained token not granted this repo | Check `/user` and the repo lookup; get the right token | Verify before pushing |
| Push rejected touching `.github/workflows` | PAT lacks the `workflow` permission | Add it (token value stays the same) | Grant it when creating the token |
| Vercel deploy "blocked — commit author has no access" | Global git identity is not the owner; Hobby plan, private repo | Repo-local identity + `--reset-author` + force-push with lease | Set identity right after `git init` |
| Vercel 404 on a static site | No `index.html` at the root | Add a redirect `index.html` | Always root `index.html` |
| All three monorepo builds fail on Vercel | Missing `packageManager`; default install under-installs workspaces | `"packageManager": "npm@…"`, install `cd ../.. && npm install` | Template root `package.json` |
| Env change not live | Needs a redeploy; empty commit cancelled | Redeploy API with `forceNew=1` | Always redeploy via API after env changes |
| Vercel API 403 while `/v2/user` is 200 | SAML team token aged out | New token | One deployments call before polling |
| CI red on every commit of a new repo | No Actions secrets | Create the CI branch + secrets | Day-one checklist for every new repo |
| GitHub secrets stop working | `neon env pull --branch ci` rotated storage creds | Update secrets | Never re-pull; save once |
| Renders fail with "quota exceeded" | Image models have no free quota | Enable billing | Enable billing before image features |
| Every AI feature returns 429 | Prepaid credit exhausted | Top up | Budget alerts; check before big jobs |
| OTP emails reach only you | Resend sandbox | Verify the domain | Do it in milestone 3, not at launch |
| DNS record "wrong" at the registrar | Name auto-appended; DKIM split across lines | Enter the short name; one line | Read the gotchas first |
| Google sign-in fails on staging | Callback not in redirect URIs | Add it exactly | Register staging callbacks when creating staging |
| Tripo wallet 0 | API credits separate from Studio | Top up on the API platform | Check balance before live tests |
| `neonctl` hangs | Two binaries ship in one package | Use `neon` | Note it in `CLAUDE.md` |
| Push prompts for a password / hangs | Plain `<token>@github.com` URL triggers git's credential prompt | `https://x-access-token:<GITHUB_PAT>@github.com/...` and `GIT_TERMINAL_PROMPT=0` | Use the `x-access-token` form in every push |
| Password or key in the transcript | Pasted or recalled in chat | Rotate | Way A (env file) + password manager |
| Keystore lost | Stored in a repo or deleted | — | Keep `twa-staging/` outside repos and backed up |
