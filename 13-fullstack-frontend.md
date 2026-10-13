# 13 — Full-stack frontend: the real app on the real domain

**Where this sits:** after [12-ui.md](12-ui.md) (branded prototype = the spec) and [04-tech-stack.md](04-tech-stack.md) (the stack is decided). Next is [14-backend.md](14-backend.md), which copies this codebase into a second repo and replaces the simulated AI with real engines. Service setup steps live in [03-services-setup.md](03-services-setup.md); the test method in [21-testing.md](21-testing.md); security rules in [20-security.md](20-security.md).

## Goal

Assemble called this "Step 1" and "Step 1.5". At the end you have:

1. A **Turborepo monorepo** — `apps/web` (customer PWA), `apps/admin` (admin panel), `apps/site` (the coming-soon page, byte-for-byte), `packages/ui` (the prototype's CSS verbatim), `packages/db` (Drizzle schema, typed seeds, migrations) — every prototype screen ported 1:1, verified by screenshots of every screen.
2. **Deployed on the real domain** as three Vercel projects from one repo: root = site, `app.` = PWA, `admin.` = admin.
3. **Real infrastructure**: Neon Postgres with a branch per environment, Auth.js sign-in (Google + email/password with emailed codes), Resend on your own domain, Sentry and PostHog, GitHub Actions CI running the full test pyramid on its own database branch.
4. **Real CRUD for everything a user or admin can touch**: fresh accounts start empty, the admin panel writes live config the app reads, social features work across real accounts, web push, nightly demo reset, private file storage, and any expensive engine (3D generation) wired for real with credits, caps and refunds.
5. **Simulated only where agreed**: AI matching/detection (real in [14-backend.md](14-backend.md)) and payments (real in [15-payments-and-cutover.md](15-payments-and-cutover.md)).

Every change from here on goes through the **full pyramid** (typecheck → unit → build → Playwright e2e → CI → live check) — the rule you set on day one of this milestone and never relaxed.

## Prerequisites checklist

- [ ] The branded prototype and its docs (the spec). `BRAND.md`. The tech-stack doc.
- [ ] An **empty private GitHub repo** for the frontend (e.g. `<App>_Frontend_v1`). A fine-grained PAT with Contents **and Workflow** read/write on that repo (without `workflow` scope the CI file cannot be pushed).
- [ ] Vercel: a **short-lived API token** (1-day expiry) so Claude can create projects, set env vars and domains by API instead of you clicking. On a SAML team these tokens stop working after a while — expect to issue new ones.
- [ ] Domain DNS access at the registrar (you add two CNAMEs for `app` and `admin`).
- [ ] Neon account, one project with Postgres only (`us-east-2` if you want the object-storage beta), Neon CLI installed (`npm i -g neonctl`, then `neon auth` opens a browser for OAuth — you approve it).
- [ ] Google Cloud project for OAuth (consent screen + web client), Resend account, PostHog project, Sentry org — created by you following Claude's click-by-click guides; you paste back IDs/keys **once**, into env files, not chat (see [20-security.md](20-security.md) on why pasting into chat is a compromise).
- [ ] If the app has a paid engine now (Assemble: Tripo for 3D): an API key and a topped-up wallet. Advertised free credits may show as 0.
- [ ] Node 22, npm 11 (pin it in `package.json` as `packageManager`), Playwright's Chromium (`npx playwright install chromium`).
- [ ] Windows note: Python may not be available for Claude here; all scripts are Node `.mjs`/`.cjs` files. Never `node -e` with quotes.
- [ ] Time: Step 1 build ≈ 72 minutes; deploy + services ≈ one long night; Step 1.5 stages A/B/C ≈ one day; round 4 ≈ 2 hours. Assemble did all of it 21 Aug → 2 Sep 2026.

## Step 1 — Scaffold the monorepo locally, port every screen, screenshot everything

Plain English: Claude builds the whole frontend in a new local folder, does **not** push, then photographs every screen and fixes even tiny mistakes until a full re-crawl is clean.

1. Create `<CLIENT_FOLDER>\UI\front end\` (or a sibling folder). Open the session in the UI folder so Claude can read the prototype as the spec.
2. Paste the Step 1 block. Claude scaffolds, ports the CSS 1:1 into `packages/ui`, writes the Drizzle schema (including an async **job table** for every AI action — the one Step 2 prerequisite locked early), types the seed data, builds both apps, runs `next build`, screenshots every screen at mobile and desktop, inspects each image, fixes, re-crawls.
3. Run both apps yourself (`npm run dev`) and click through on your phone. Report what you see in plain words.

> **For Claude — paste this:**
> ```
> Start Step 1. First re-read the prototype "[App] - Prototype.html", PROJECT-HANDOFF.md and "[App] - Tech Stack.md" for full context.
> Build everything in one go inside a NEW local folder "front end" — do NOT commit or push anything yet:
> - Turborepo + npm workspaces: apps/web (Next.js App Router customer PWA, port 3000), apps/admin (Next.js admin, port 3001), packages/ui (the prototype's design-system CSS ported 1:1 as one stylesheet), packages/db (Drizzle schema + typed seed data + seed script; every AI action is an async job row: generations {id, user_id, kind, status queued|running|ready|failed, input jsonb, result jsonb, credits_spent}). Root package.json with "packageManager": "npm@[version]" (Turbo 2 refuses workspaces without it).
> - Port EVERY screen and modal from the prototype: same tokens, same copy, same flows, same gates. Server data via TanStack Query hooks with the seeds as initialData; UI state in a small Zustand store mirroring the prototype's st (session-persisted with SSR-safe hydration, skipHydration). The apps must run from seed data when DATABASE_URL is missing.
> - Back buttons use real history (router.back() when in-app history exists; explicit target only as a deep-link fallback) — no ping-pong loops.
> - 3D: port the prototype's Three.js matte viewer (studio rig, ACES exposure ~1.8, roughness 1 / metalness 0 keeping normal and AO maps, Draco decoder, per-URL cache, one WebGL context); camera auto-frames the model (no manual field-of-view).
> - Shared media in EVERY app's public/ that needs it (each Next app serves its own public folder).
> - A .gitignore so nothing is committed by accident; README with run commands and the exact swap points for Step 2.
> When done: next build both apps clean; run both; install Playwright chromium; screenshot EVERY screen (mobile 390×844 and desktop 1280×800) with console errors captured per page; inspect every image for even the slightest mistake; fix; re-shoot; then run an automated suite tools/verify.mjs: console errors, page errors, horizontal overflow at 375px on every route, and the money/gating flows (generate spends a credit, gates fire, purchase adds credits). Repeat until zero problems. Report what you found and fixed, and how to run it.
> ```

> **Assemble example.** 21 Aug 2026, 11:52–13:04: monorepo in about 72 minutes — 43 routes and ~40 modals in `apps/web`, login + 2FA + 14 sections in `apps/admin`, 12-table schema with the `generations` job table. 73 screenshots found three real flaws: the 3D viewer zoomed past the model (a `field-of-view` override → auto-framing), admin product images missing (admin `public/` only had icons), credits reset on reload (in-memory store → session persistence). The verify suite's one failure was its own selector matching a paragraph containing "Swap". Final crawl: 0 console errors, 0 page errors. First local run on 28 Aug found a hydration mismatch that only your machine showed: Windows "Reduced Motion" was on, and the transition templates rendered differently on the server; fixed by rendering static on first paint.

## Step 2 — Add the site app, push, and let Claude create the Vercel projects by API

Plain English: one repo, imported three times into Vercel with different root directories. Claude does this with a short-lived token you paste; the only thing you do by hand is DNS.

1. Question round (4 questions in Assemble): do you own the domain; where does the coming-soon page live (answer: copied **static** into `apps/site` — "static" means no build step; its animations are CSS/JS inside the file); subdomain plan (root = coming soon, `app.` = PWA, `admin.` = admin — at launch the apex is simply reassigned to the app project, no code change); is the admin open for now (yes while it only reads seed data).
2. `git init` in the folder with the owner identity; initial commit; push to the empty repo with the inline-token rule.
3. Create a 1-day Vercel token (Account → Settings → Tokens; scope the team). Paste it once. Claude: verifies the token with one API call, creates three projects with root directories and build settings, links them to the repo, triggers the first deployments, watches them, fixes build errors, moves the apex + `www` from the old coming-soon project to `assemble-site` (zero downtime), attaches `app.` and `admin.`.
4. You add two CNAME records at the registrar (`app` and `admin` → `cname.vercel-dns.com`). Claude polls DNS and HTTPS until all three return 200 with certificates (about 4 minutes).
5. Delete the Vercel token when done. Register the two dev servers in `.claude/launch.json` (`assemble-web`, `assemble-admin`) so future sessions start them with one command.

> **For Claude — paste this:**
> ```
> Repo: [empty GitHub repo URL]. Domain: [domain] (DNS at [registrar]). Add apps/site = a byte-for-byte copy of the coming-soon index.html + favicon with a minimal package.json and a vercel.json {"cleanUrls": true}; README deployment map. git init here as [OWNER <noreply>], initial commit, push main (token inline only, never stored).
> Then, with this 1-day Vercel token [TOKEN] (verify it with one API call first, then use it from an env variable in any script, never hard-code it): create three git-linked projects — [app]-site (root apps/site, framework Other, install/build "echo", output "."), [app]-app (root apps/web, Next.js), [app]-admin (root apps/admin, Next.js); install command "cd ../.. && npm install", build "npm run build"; Ignored Build Step "npx turbo-ignore". Trigger first production deployments, watch them to READY, fix build errors and push fixes. Move [domain] and www from the old coming-soon project to [app]-site; attach app.[domain] and admin.[domain]. Tell me the exact CNAME records to add at the registrar, then poll DNS/HTTPS until all three return 200 with valid certificates and screenshot each (use local Playwright — the browser pane blocks external URLs). Remind me to delete the token afterwards.
> ```

> **Assemble example.** 28 Aug 2026, 01:43–02:23. First deployments all errored: Turbo 2 needs `"packageManager"` in the root `package.json`, and the default `npm install --prefix=../..` under-installed the workspace — fixed with the install/build commands above (commit `46629c2`). The domain moved from the standalone coming-soon project to the monorepo's site project with no downtime; `app.` and `admin.` resolved four minutes after the CNAMEs were added. A Vercel MCP connector was considered but its OAuth cannot run in a non-interactive session, so the REST API with a short-lived token was used instead.

## Step 3 — PWA behaviour, exact brand parity, the 3D viewer on a real phone

Do these as small rounds straight after deploy, each verified on your phone:

- **Exact logo parity** with the coming-soon page (same clamp sizing, ring geometry; count the elements programmatically — the first port missed the second word on the ring).
- **Install prompts**: a passthrough service worker (needed for Chrome installability; no offline cache yet), a slide-down banner on `beforeinstallprompt`, an iOS "Add to Home Screen" sheet, an install card on Home and Profile; hide all of it when installed (`related_applications` + `getInstalledRelatedApps()`; the user must reinstall from the same origin once after this ships).
- **Admin as a PWA too**, with its own manifest and start URL.
- **Update toast**: `/api/version` returns the deployed commit SHA; the client checks every 3 minutes and on foreground; a bottom bar "A new version is ready — Refresh". Installed PWAs always load the latest build; only long-open sessions need the nudge.
- **3D on the live app**: if it looks shiny and stutters, that is `<model-viewer>`'s PBR + image-based lighting; port the prototype's Three.js viewer instead (matte, studio rig, pixel-ratio cap 2, damped controls, loading bar). If AI-built models arrive **side-on**, set the engine's orientation option and rotate existing files with glTF-Transform — into **new** storage keys, because the storage proxy sends immutable cache headers.
- **Back-button sweep** with an e2e test that pushes back repeatedly and asserts no two-screen bounce.

> **For Claude — paste this (bug pair with steps):**
> ```
> Bug 1: when [state], doing [action] shows "[wrong text]"; it should [expected]. Bug 2: pressing back on [route A] goes to [route B], and back again returns to [route A] — a loop. Find the causes, fix both, add e2e cases for each (mobile project), run the full pyramid, push, and tell me what to retest on my phone (numbered steps, including "clear site data" where a cached manifest could hide the fix).
> ```

## Step 4 — Data layer, test pyramid and CI (nothing needed from you)

Plain English: while you set up services, Claude wires the parts that need no keys. Order that worked on Assemble: data-access pattern and the test pyramid + CI first (nothing needed from you) → database (Step 5) → real auth, email and monitoring (Step 6). Claude had proposed database before tests; doing the tests first meant every later step landed on a green CI.

1. Typed TanStack Query hooks per entity with seeds as `initialData` (later, user-owned data drops the seeds so fresh accounts are truly empty). Pitfall: `initialData` + a long `staleTime` suppresses the first fetch — set `initialDataUpdatedAt: 0` for server-truth lists.
2. **Vitest** unit + component tests (credit rules, gating, seed integrity, small components) and **Playwright** e2e (mobile project = iPhone 13 device profile forced to Chromium, desktop project; `webServer` starts both production servers with engine mocks; `retries: 1` on CI). Full detail and the config file: [21-testing.md](21-testing.md) and `templates/testing/playwright.config.ts`.
3. **GitHub Actions CI** (`.github/workflows/ci.yml`): `npm ci` → unit → build both apps → install Chromium → Playwright, traces uploaded on failure. Needs the `workflow` scope on the PAT to push. Template: `templates/ci/ci.yml`.
4. Live-URL screenshots and checks are scripted with local Playwright (the browser pane cannot open external URLs).

> **For Claude — paste this:**
> ```
> Start on the items that need nothing from me: (1) typed data-access hooks (TanStack Query per entity, seeds as initialData with initialDataUpdatedAt: 0, a transparent switch to the live DB later); (2) the full test pyramid — Vitest unit + Testing Library component tests, and a Playwright suite with mobile (iPhone 13 profile on chromium) and desktop projects whose webServer starts both production builds; (3) a GitHub Actions workflow running unit → build → e2e on every push with traces on failure. Meanwhile tell me step by step how to set up [Neon / Google OAuth / Resend / PostHog / Sentry] and exactly what to paste back — into which .env file, not into chat.
> ```

> **Assemble example.** 28 Aug 03:52–04:14: hooks + `/api/friends`, 24 unit tests and 27 e2e checks, CI file written — but the push was rejected: the PAT lacked the `workflow` scope. You added the scope at 04:33 and the first CI run (`81a0ff8`) went green. All mobile e2e failed at first because the device profile defaults to WebKit, which was not installed → `browserName: "chromium"`. The install banner overlaid the top bar and intercepted clicks → an `addInitScript` sets the "dismissed" flag before each test.

## Step 5 — Neon Postgres: skills, CLI, schema, seed, mutation proof

Plain English: install Neon's own agent skills so Claude knows the CLI, log in once in the browser, and let Claude push the schema, seed it and prove the live app reads the database.

1. Paste the Neon block. Claude installs the skills, you approve the browser OAuth, Claude links the project, pulls env into `apps/web/.env.local` (gitignored automatically), pushes the schema, seeds, switches the API routes to Drizzle (with seed fallback), sets `DATABASE_URL` on Vercel, redeploys and runs a **mutation proof** (update one row directly → the live API shows it → revert).
2. Decide the environment ladder now: `production` (live), a `ci` branch (CI only), later `staging` and `ci-backend` for the backend repo. **Never share a database between CI and anything live** — Assemble's CI reset the production demo profile in the middle of a live 3D test.
3. Write the two Neon rules into memory and `templates/CLAUDE.md`: **never run `neon env pull` for a branch whose credentials feed GitHub secrets** (it mints new storage credentials and silently invalidates the secrets — save them once in a gitignored file), and **every migration runs on every branch the same day** (`production` only at cutover).
4. After the first schema push, stop using `drizzle-kit push` (it chokes on existing keys) and write additive, re-runnable `.mjs` migration scripts (`IF NOT EXISTS`, count-guarded seeds, one result line), run from the repo root with `DATABASE_URL` pointing at the target branch; DDL uses the unpooled URL.

> **For Claude — paste this:**
> ```
> Install the Neon agent skills with `npx skills add neondatabase/agent-skills -s neon -s neon-postgres -y` and follow their instructions to configure the Neon CLI (browser OAuth — I will approve it), the MCP server and the skills. Then connect this app to Neon project [name] (id [id]) in org [org] (id [id]): declare Postgres only in neon.ts, pull env to apps/web/.env.local (confirm it is gitignored), push the Drizzle schema with the UNPOOLED url, seed it, switch the /api routes to Drizzle with seed fallback, set DATABASE_URL on the Vercel app project (production + preview) and redeploy. Prove it: update one product's price directly in the DB → the live /api/products shows it → revert. Then create a `ci` branch for GitHub Actions and set its DATABASE_URL as a repo secret. Record in memory: never `neon env pull` for a CI branch; migrations go to every branch the same day.
> ```

> **Assemble example.** 28 Aug 04:16–04:30: skills installed, CLI OAuth approved, schema of 12 tables pushed, seed (1 demo user, 28 items, 13 looks, 11 products…), four routes on Drizzle, mutation proof on production (`b412985`). The `auth_codes` table was created with direct SQL because `drizzle-kit push` wanted to rebuild an existing primary key. The `ci` branch was created on 28 Aug 17:50 after the shared-DB collision.

## Step 6 — Real sign-in, email, monitoring

1. Claude writes click-by-click guides for Google OAuth (consent screen External, published with basic scopes only; web client with JS origins and redirect URIs `https://app.<domain>/api/auth/callback/google` and `http://localhost:3000/...`), Resend (API key with sending access; later domain verification), PostHog (project key), Sentry (one project per app). You follow them and put the values into `apps/web/.env.local` / `apps/admin/.env.local`; Claude sets the same on Vercel by API.
2. **Auth.js v5**: Google + Credentials (bcrypt), JWT sessions; sign-up sends a 6-digit code by email (sha256-hashed, 10-minute expiry, attempts counted); real sign-out; starter credits granted on first sign-in. Keep a **demo path** (a cookie) so presentations and e2e keep working.
3. **Sentry** on both apps (server/edge instrumentation, a branded crash screen, `sendDefaultPii: false`, a scrubber). **PostHog** page views on the customer app.
4. **Resend domain verification**: until the domain is verified, the sandbox delivers only to the account owner's address. Add the domain in Resend, copy the DNS records to the registrar — two gotchas: the registrar auto-appends the domain (enter `send`, not `send.<domain>`), and the DKIM value must be pasted on one line. Flip `EMAIL_FROM` to `<App> <verify@<domain>>`, redeploy, and prove it with a real sign-up to a non-owner address.

> **For Claude — paste this:**
> ```
> The keys are now in apps/web/.env.local and apps/admin/.env.local ([list of variable names]). Wire real auth: Auth.js v5 with Google + email/password (bcrypt), JWT sessions, OTP by email through Resend (6-digit, sha256-hashed, 10-minute expiry, resend + wrong/expired handling), branded email template, session-aware Home/Profile, real sign-out, starter credits from config on first sign-in; keep the demo cookie path for presentations and e2e. Sentry on both apps (PII off, scrubber) and PostHog page views on the customer app. Set the same env vars on both Vercel projects by API and redeploy. Prove live: the providers endpoint lists google + credentials; a real sign-up code arrives; Sentry receives a test event. Full pyramid before the push.
> ```

> **Assemble example.** 28 Aug 05:53–06:26: real auth, Sentry, PostHog (`2caac76`) — "Step 1 is complete". Resend stayed sandboxed until the domain was verified at 10:13 (Tokyo region records); the proof was a production sign-up to a throwaway address returning `{"ok":true}`; the test row was deleted. Google sign-in later failed on the staging URL with `redirect_uri_mismatch` until the staging callback was added to the OAuth client (your action, 12 Sep) — register staging callbacks when you create staging projects.

## Step 7 — "Step 1.5": make every screen real without complex backend logic

Plain English: one question round (24 questions in Assemble) decides how far "real" goes, then three staged deploys, each tested live before the next. The scope doc is committed to the repo.

Decisions the round must settle (with Assemble's answers): demo profile editable but **auto-reset nightly** (Vercel Cron, secret-protected); new accounts **truly empty + starter credits from admin config**; user CRUD for everything (closet, outfits, collections, profile, credits/plan/ledger…); **basic real cross-account social**; uploads to a **private bucket** with a per-user prefix behind an authenticated proxy; the paid engine **real** (Tripo 3D from user photos); long jobs by **client polling of a status route** that updates the job row (no queue) plus a nightly orphan sweep; **in-app credits + per-user daily cap**; engine results **downloaded into your bucket** (vendor URLs expire); admin panels that **write** live config; **admin security** = hashed env password + emailed 2FA code + short session cookie; customer app **gated by session or explicit demo cookie**; non-real AI **simulated but persistent**; plans **simulated checkout with real effects**; broadcasts as in-app notifications **plus web push** (VAPID; on iPhone push only works from the installed PWA on iOS 16.4 or newer); **hard delete** of accounts; delivery in **three staged deploys** (A foundations, B social/notifications/push/demo reset, C storage + engine); tests extended per stage with the engine **mocked** in CI and exercised live once per deploy.

> **For Claude — paste this:**
> ```
> How much of the database is built? I want all CRUD in this step so the app remembers each user's data and reacts to admin configuration, with no complex backend logic yet (that is the next step). Can we connect [paid engine API] now? When a new account is created it must feel like the app started from scratch. Before we proceed, ask me at least 20 questions so you can fully understand what I'm trying to achieve. Ask the questions one at a time, and for each question, give me multiple-choice options to choose from. Clearly highlight the option you recommend and briefly explain why. Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf.
> After the round: write STEP-1.5-SCOPE.md into the repo with every decision, then deliver in staged deploys (A foundations, B social + notifications + push + demo reset, C storage + engine). For each stage: build → full pyramid → commit → push → watch Vercel + CI → live production checks with a script → report with "things for you to try" → wait for my fixes before the next stage.
> ```

What each stage produced in Assemble (28 Aug 2026):

- **A (11:16–12:25, `f03d9c8`)**: migration 001 (config, packages, taxonomy, help, brands, campaigns, wear history, push subs, suspended flag), server user context (`getCurrentUser()`: session → row, else demo cookie → demo user, else null), middleware gating with an open-page allow-list, CRUD routes, client rewiring, admin auth, four writable admin panels, `db:reset-demo`, e2e for gated routes. 13/13 live checks + an admin write round-trip (change a cost → user app reflects → revert). A context compaction happened mid-edit and the resume fixed a non-compiling file.
- **Your fixes before B (16:25)**: prefill the demo login, gate the Saved tab for free users, delete all test users except the demo, change the admin 2FA recipient.
- **B (16:27–17:05, `6249d9d`)**: usernames, web push (VAPID keys generated with `npx web-push generate-vapid-keys`, subscriptions table, service-worker handlers), notify helper, social APIs (friends, shares, responses, search), two-way tickets, remaining admin panels (suspend, credit adjust, brands, articles, campaigns, replies, broadcasts), nightly demo reset via `vercel.json` cron. CI failed until `AUTH_SECRET` was added as a repo secret.
- **C (17:08–17:57, `2b04ea2`)**: Neon Object Storage bucket declared in `neon.ts` and provisioned with `neon deploy`; per-user prefix `u<id>/`; authenticated storage proxy `/api/storage/[...key]` (own prefix only, immutable cache); real item photo uploads; the 3D pipeline (upload → charge → engine task → client polling → GLB downloaded into the bucket → matte viewer; refund on failure; daily cap). The first live run failed because CI reset the production demo mid-test → dedicated Neon `ci` branch (`f98f3b8`). Live proof: upload 201 → 8 credits charged → progress 19 → 38 → 55 → 73% → ready in ~50 s → 6.4 MB GLB via the proxy → rename/delete cleaned it.

## Step 8 — Round 4 and the engine settings: what a real phone test finds

After Step 1.5, test on your phone for an evening and send everything as one message with the question-round suffix (Assemble: 6 bugs → 32 questions → one combined deploy). Typical outcomes worth planning for:

- **One context-aware camera** (remembers where it was opened from, returns the photo to the right slot, back returns to origin) with real `getUserMedia`, flip, gallery, grid, freeze-frame confirm and an inline fallback card when the camera is unavailable.
- Photo fit: **contain + blurred backdrop** everywhere.
- Eye toggle on all password fields; uniform PLUS/PRO chips on every gated entry point.
- Backgrounded engine builds stay visible (a "building… 42%" card in the gallery; job-completion logic shared by the status route and the nightly sweep); notification + toast when ready; unrecoverable builds → refund + free retry.
- **Real admin stats from the database** (signups by day, ledger events tagged SIMULATED, per-user usage), demo excluded — the prototype's fixtures showed "312 signups".
- A monochrome transparent badge PNG for Android push status bars (thin brand strokes vanish at 24 px).
- Engine settings: send the vendor's maximum quality (Assemble: model v3.1, detailed geometry and texture, PBR, 1.5 M faces = the API ceiling, `orientation: align_image`); keep the matte look **viewer-side** so the stored file keeps its full data; show the engine wallet in admin and alert when it is low.
- If the result still looks flat: **A/B render the actual file before blaming the engine** — Assemble's matte material was discarding the normal and AO maps.

## Step 9 — Housekeeping rounds you will also need

- **Clean the database** before showing it around: delete test signups and their bucket objects, reset the demo, reset admin content to defaults; make e2e global teardown delete its own accounts and files after every run.
- **Profile pictures**: store the Google photo URL on the user, initials fallback on a brand gradient, later an uploaded photo that wins; identity comes **only from the server**, never from the browser's Google session (that leaked your email onto the demo profile). Name the component `ProfilePic`, not "avatar", if "avatar" means something else in your app.
- **Samsung Internet**: Play Protect flags Samsung's own WebAPK packaging — no manifest change fixes it; harden the manifest anyway (`id`, `scope`, `display_override`, portrait, maskable icons), then on Samsung Internet replace the install button with a branded "Install with Chrome" guide sheet. Whites turning grey in Samsung's forced dark mode come from gradient text (`background-clip: text`); add a `.sbrowser` flat-white fallback and `<meta name="color-scheme" content="only light">`.
- **Admin 2FA to more than one inbox**: `ADMIN_EMAIL_CC` (comma-separated), used only for the sign-in code.
- **Key rotation**: when an engine key changes, verify the new key with the vendor's balance endpoint, swap local env, update both Vercel projects by API, redeploy through the redeploy API (empty commits get cancelled by the ignored-build step), run one live verification build, clean up.

## Step 10 — Close the milestone

- [ ] All three domains serve the latest commit; CI green; Vercel Cron registered (Project → Cron Jobs).
- [ ] Every env var documented by **name** in a `.env.example` per app (`templates/repo/env/*.env.example`); values only in gitignored `.env.local` files, Vercel env and GitHub secrets.
- [ ] Neon branches listed with their purpose; the CI branch credentials saved once and the "never re-pull" rule in memory.
- [ ] Every token pasted this milestone revoked; PAT scopes noted (Contents + Workflow).
- [ ] `STEP-1.5-SCOPE.md`, README (deployment map, run commands, pyramid), memory notes updated.
- [ ] A plain-English "what the app can do today / what comes next" list for the client.

## Pitfalls (full-stack frontend)

| Symptom | Cause | Fix / prevention |
|---|---|---|
| React hydration error only on your machine | Windows Reduced Motion + transition templates rendering differently server/client | Static first paint, animate only on client navigations; test with reduced-motion emulation |
| Production server loses its chunks | `next dev` and `next start` run in the same app directory (both write `.next`) | Never run both; kill stale servers before builds and tests |
| All three first Vercel deployments ERROR | Missing `packageManager`; default install under-installs workspaces | `"packageManager": "npm@x"`; install `cd ../.. && npm install`; build `npm run build`; site: echo commands, output `.` |
| Subdomains verified in Vercel but not resolving | No DNS records yet at the registrar | Add the CNAMEs; ~4 min propagation |
| Browser pane refuses external URLs | Sandbox | Local Playwright for production screenshots and checks |
| Logo port missed the second word on the ring | Extraction sampled only ring ends | Compare element counts/text programmatically |
| 3D shiny, stuttering; later "low quality" | `<model-viewer>` PBR + IBL; then a matte material that discarded normal/AO maps | Port the Three.js viewer; `MeshStandardMaterial` roughness 1, metalness 0, keep maps |
| Back-button ping-pong | Back buttons pushed new entries | `router.back()` when in-app history exists; e2e guard |
| "Install isn't available" when already installed | No installed-app detection | `related_applications` + `getInstalledRelatedApps()`; reinstall once |
| CI file push rejected | PAT lacks `workflow` scope | Add the scope (the token value stays the same) |
| Mobile e2e all fail | Device profile wants WebKit | Force `browserName: "chromium"` |
| E2E clicks intercepted | Install banner overlay; ambiguous selectors | Dismiss flag via `addInitScript`; role/test-id selectors, `.first()` where duplicates are legitimate |
| `drizzle-kit push` wants to rebuild an existing key | Introspection quirk | Additive `.mjs` migrations after the first push |
| PowerShell breaks `node -e` and quoted commit messages | Quoting | Script files; `git commit -F message.txt` |
| OTP emails only reach you | Resend sandbox | Verify the domain (name field auto-append; DKIM on one line) |
| Engine wallet 0 despite "free credits" | API credits separate from the studio subscription | Top up before live tests; check with the balance endpoint first |
| Context ran out mid-edit; file did not compile | Long stage | Keep edits compiling; the summary flags "INCOMPLETE STATE"; resume fixes first |
| Packages list empty in the buy sheet | `initialData` + `staleTime` suppressed the fetch | `initialDataUpdatedAt: 0` |
| Credits double-spent by retry clicks | Blind retries; balance read from a stale store | Idempotent retries guarded on state; server is the source of truth |
| Stage B CI red | Cross-account login specs needed `AUTH_SECRET` | Add the repo secret and wire it in the workflow |
| Test accounts reappear in production data | Global setup creates them; no teardown | Teardown deletes `%@test.local` accounts and their files; CI on its own branch |
| Live engine test fails mid-poll ("Generation not found") | CI reset the demo on the same database | Dedicated CI branch (DB + bucket) |
| Stateful spec files race | Parallel specs share one demo balance | Dedicated accounts per spec file; ledger-event assertions; later `workers: 1` |
| Login `waitForURL` timeouts | Waiting for full load | `waitUntil: "commit"`; `test.slow()` for polling specs |
| Headless shell has no camera; then the laptop overloads | Playwright headless shell; full Chromium is heavy | `channel: "chromium"` + fake-device flags + `permissions: ["camera"]`; `workers: 2` (later 1) |
| CI branch missing a new column | Migration applied to production/staging only | Migrations to every branch the same day |
| Background 3D build never completes | Polling lived on the progress screen only | Gallery takes over polling; nightly orphan sweep; shared completion lib |
| Push status-bar icon is a white square | Android needs a monochrome transparent badge | Bold geometric silhouette PNG |
| Admin dashboard shows fake numbers | Prototype fixtures | Stats endpoint from the database, demo excluded |
| Helper script committed | `git add -A` swept the scratchpad script | Scratch outside the repo; stage explicit paths |
| Avatars sideways; still sideways after rotating | Engine default orientation; then immutable cache on overwritten keys | `orientation: align_image`; rotate with glTF-Transform into **new** keys; never overwrite a bucket key |
| Rename not saving on phones | Saved on Enter only | Save on blur |
| Stale package id after a DB reset | Serial ids continue | Fetch live ids from `/api/config` |
| `.ts` script fails on top-level await | tsx CJS mode | `.mts` |
| Vercel token 403 "must re-authenticate to this scope" | SAML team tokens age out | One cheap API call before relying on it; issue a new token; fall back to live-URL checks |
| Empty commit deploys CANCELED | Ignored-build step skips no-change commits | Redeploy API (`forceNew=1` + `deploymentId` or `gitSource`) |
| Env var change not live | Needs a redeploy | Redeploy after env changes |
| `neon env pull --branch` breaks CI | It rotates storage credentials behind the GitHub secrets | Save branch creds once; never re-pull |
| Google sign-in fails on staging | Staging URL not in the OAuth redirect list | Add staging callbacks when creating staging projects |
| Samsung Internet install blocked; whites grey | Samsung WebAPK packaging; forced dark mode darkens gradient text | Chrome guide sheet on Samsung; `.sbrowser` flat white + `color-scheme: only light` |
| Tester still sees the old manifest | Cached on the device | "Clear site data" in the retest guide |
| Demo profile shows your email | Profile fell back to the browser's Google session while loading | Identity from the server only |
| Secrets pasted in chat end up in archives and compaction summaries | Chat is stored | Paste into env files; rotate everything that touched chat; mask archives ([20-security.md](20-security.md)) |

## What to carry forward

- The whole repo → copied into the backend repo with a fresh history in [14-backend.md](14-backend.md); this repo stays **frozen as the production build** until cutover ([15-payments-and-cutover.md](15-payments-and-cutover.md)).
- The environment ladder (production / ci / staging / ci-backend) and the migration rules → [14-backend.md](14-backend.md) and the cutover runbook.
- The pyramid, mocks, global setup/teardown and CI → [21-testing.md](21-testing.md) and the templates folder.
- The phone-retest-guide habit → every later push.
