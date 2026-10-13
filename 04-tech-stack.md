# 04 — Tech stack

**Goal of this chapter:** you know exactly which technologies the app is built from at each milestone, which version of each was used and why, the architecture patterns that came with them, and what Claude must check before reusing a version on a new app.

Links: how each service is created is in [03-services-setup.md](03-services-setup.md); the test tooling is in [21-testing.md](21-testing.md); the security controls the stack enables are in [20-security.md](20-security.md).

> **Check for newer versions first.** The versions below are the ones installed in Assemble's backend repo on 17 September 2026. Before scaffolding a new app, run the version-check block in section 6. A newer major can carry a critical security fix (Next.js did, in the security round) or a breaking change; the "why" column tells you what each choice must still deliver.

---

## 1. The stack at a glance

```
Milestones 0–2 (static)          Milestones 3–6 (full-stack)
──────────────────────           ────────────────────────────────────────────────────────
One self-contained HTML file     Turborepo monorepo (npm workspaces)
  vanilla JS controllers           apps/web    Next.js 15 customer PWA (App Router, server routes)
  CSS custom-property tokens       apps/admin  Next.js 15 admin panel (own auth)
  Google Fonts (CDN)               apps/site   Next.js static export: landing page
  GSAP (CDN) for motion            packages/ui the prototype's CSS, ported verbatim
  Three.js (CDN) for 3D            packages/db Drizzle schema, seeds, migrations, reset scripts
Deployed on Vercel as             Postgres + object storage on Neon (branch per environment)
  static files, index.html root   Auth.js v5 (Google + email/password + OTP via Resend)
                                  TanStack Query + Zustand · Motion · Three.js
                                  Google Gemini (text/vision + image) · Tripo (3D) — mocked in tests
                                  Vitest + Testing Library + Playwright · GitHub Actions · Vercel
                                  Sentry · PostHog · web-push · zod · sharp
```

Everything is **TypeScript** end to end (web, admin, schema, seeds, tests, scripts), and everything runs on **Vercel** from `main`.

---

## 2. How the stack was decided (the framework)

The stack came out of a 17-question round on 21 Aug 2026 ("suggest a good tech stack for the app and guide me how to decide"), written up as `<App> - Tech Stack.md` in the UI repo (commit `1da474d`). The eight rules are reusable for any project; run the same round for a new app and expect a similar answer unless the workload is very different.

1. **Team first.** The best stack is the one the builders know and the client can hire for later: mainstream TypeScript, React, Postgres.
2. **Time-to-market.** Buy managed services (auth, email, storage, monitoring); build only the product.
3. **Migration paths over vendors.** Pick things whose exit is cheap: Postgres + Drizzle means any Postgres host; Auth.js keeps the screens if the auth provider changes.
4. **Free tiers that don't sabotage you.** "Free" that pauses or deletes projects is not free; check suspend and retention behaviour, not just price. (This is why Neon was chosen over a free tier that pauses.)
5. **Match architecture to workload shape.** Slow AI jobs mean async job rows + a polling UI — a *schema* decision, made before any queue vendor.
6. **Platform economics.** A PWA at a URL keeps 100% of credit revenue; app stores take 30% and add review cycles. Wrap later for distribution only.
7. **One language end to end.**
8. **Defer decisions that don't block, but lock their prerequisites** (async job schema, env-var secrets, storage-path indirection).

Two-step plan that followed: **Step 1** frontend + real database schema with seeded data on a free tier; **Step 2** backend, integrations, launch; payments as **Step 3**. Distribution: PWA only; Capacitor/TWA kept open as a later wrap.

---

## 3. Per-milestone technology

### Milestones 0–2: single HTML files, no build step

| Piece | Choice | Why |
|---|---|---|
| Page | One `index.html` (coming-soon) or one `<App> - Prototype.html` (wireframes, UI) with inline CSS and JS | Opens by double-click, hosts as a static site, easy to share and audit; a proprietary design-tool export would not run outside its tool |
| Interaction model | Two closure-scoped controllers `U` (customer) and `A` (admin), each with `st` state, `go()`, `back()`, `render()`, one delegated `click()` that reads `data-*` attributes (`data-nav`, `data-back`, `data-open`, `data-close`, `data-act`, `data-chip`, `data-rg`, `data-lock`, …) | Every link is a parseable attribute, so a script can audit screens, modals, broken targets and dead controls; developers can read it |
| Screens and modals | `<section class="screen" data-screen="x">`, `<div class="modal" data-modal="x">`; history-based back, transient screens excluded from history | Three separate back-loop bugs came from hardcoded back targets |
| Tokens | CSS custom properties in `:root` (canvas, surface, ink, line, accent, radii, shadows) | Greyscale first, brand colours later on the same tokens |
| Data | In-file databases (`LOOKDB`, `PRODDB`, friends, item images) and an imagery engine that maps files to placeholders by name | "Custom screens per option" without cloning 70 screens; the real app works the same way |
| Fonts | Google Fonts (Plus Jakarta Sans display/body, Space Grotesk labels/data) | Client's brand fonts |
| Motion | GSAP 3 from a CDN (~70 KB) in the UI phase; pure CSS for the orbit logo | Best timelines/staggers; a dedicated skill exists |
| 3D | Three.js r160 from a CDN with GLTFLoader, DRACOLoader, OrbitControls; `<model-viewer>` tried and replaced | Matte material control and orientation; one viewer shared by all 3D screens |
| Assets | GLBs Draco-compressed with `@gltf-transform/cli` (56 MB → ~6 MB); images sliced with Python/Pillow from generated contact sheets; icons as white alpha masks tinted via CSS `mask` + `currentColor` | Mobile load; one icon file recoloured everywhere |
| PWA | `manifest.json` + icons, **no service worker** in the prototype | Cache invalidation makes a prototype painful to iterate |
| Local serving | `py -m http.server <port> --bind 127.0.0.1` with a `?v=` cache-buster; later a tiny Node dev server with `POST /save` | The in-app browser caches aggressively; the pane cannot save files from a page |
| Verification | Python audit script (`rep(old,new,count)` assert-on-count edits), in-page click crawl, DOM state tests, overflow sweep at 375/768/1440, deploy-parity markers, `puppeteer-core` + headless Edge when real screenshots are needed | Evidence, not assertion |

### Milestones 3–6: the monorepo

| Layer | Package / service | Installed (declared) | Why it was chosen / notes |
|---|---|---|---|
| Runtime | Node / npm | 22.15.0 / 11.14.1 | Node 22 on the machine and in CI. npm 11 pinned via `"packageManager"` |
| Monorepo | turbo | 2.10.11 (`^2.0.9`) | Separate apps with independent Vercel deploys, shared packages, cached builds. Needs `packageManager` in the root `package.json` |
| Package manager | npm workspaces | npm 11.14.1 | Default toolchain; works on Vercel with install `cd ../.. && npm install` |
| Framework | next | 15.5.25 (`^15.1.0`) | App Router; server routes hold secrets; first-class on Vercel; wrappable with Capacitor/TWA later. Upgraded in the security round for a critical advisory; Next 16 deferred until after launch |
| UI library | react / react-dom | 19.2.8 (`^19.0.0`) | Largest hiring pool; required by Next 15 |
| Language | typescript | 5.9.3 (`^5.5.0`) | One language end to end |
| Styling | tailwindcss / @tailwindcss/postcss | 4.3.3 (`^4.0.0`) | Tailwind v4 with the prototype's tokens as the theme; the shared `packages/ui/styles.css` carries the ported CSS verbatim for pixel fidelity |
| CSS pin | postcss (override) | 8.5.26 | Override for advisories; the copy nested inside Next stays on a documented, expiring exception |
| Auth | next-auth (Auth.js v5) | 5.0.0-beta.32 | Google OAuth + credentials with OTP; JWT sessions; no auth-vendor lock-in; beta accepted for App Router support |
| Password hashing | bcryptjs | 3.0.3 | Pure JS (no native build on Vercel/Windows); the admin password uses `scrypt` from `node:crypto` |
| Database | Neon Postgres + Object Storage (beta) via `@neondatabase/serverless` | 0.10.4 | Real Postgres that suspends but never pauses/deletes on the free tier; branch-per-environment with copy-on-write DB **and** bucket; HTTP driver works in serverless and edge |
| Neon config | @neon/config | 1.0.5 | `neon.ts` declares the private bucket; `neon env pull` validates the branch |
| ORM | drizzle-orm | 0.45.2 (`^0.45.2`, override) | TypeScript-first, tiny, tagged SQL templates (parameterised); same on any Postgres; bumped for an SQL-injection advisory |
| Schema tool | drizzle-kit | 0.28.1 (`^0.28.0`) | `db:push` for the first schema only; afterwards additive `.mjs` migrations because push choked on existing keys |
| Scripts | tsx | 4.23.12 (`^4.19.0`) | Runs TypeScript seed/reset scripts (`.mts` for top-level await) |
| Object storage client | @aws-sdk/client-s3 | 3.1120.0 | Neon Object Storage is S3-compatible (`forcePathStyle: true` required) |
| Images | sharp | 0.35.4 (override) | Upload sniffing + re-encode (strips EXIF/GPS); site image pipeline; bumped in the security round |
| 3D rendering | three | 0.160.1 (`^0.160.0`) | Port of the prototype's matte viewer; replaced `<model-viewer>` for control over materials and orientation |
| 3D processing | @gltf-transform/core, /functions, /extensions | 4.5.0 | Share-copy compression (dedup, weld, simplify, prune), orientation fixes, site model build |
| Mesh compression | meshoptimizer | 0.22.0 in apps | Geometry compression for share copies and site GLBs |
| Server state | @tanstack/react-query | 5.101.4 (`^5.51.0`) | Caching + automatic polling for async AI jobs |
| UI state | zustand | 5.0.15 (`^5.0.0`) | Tiny store mirroring the prototype's `st`; persist with `skipHydration` |
| Animation | motion | 11.18.2 (`^11.11.0`) | Motion for React (ex-Framer Motion) for transitions and sheets; GSAP fights React's render model; signature logo stays pure CSS |
| Validation | zod | 4.6.4 | One strict schema per writing route (security round) |
| Email | resend | 6.24.0 | Simple API, domain verification; sign-in codes and ticket emails only |
| Push | web-push | 3.6.7 | VAPID web push from both apps |
| Errors | @sentry/nextjs | 10.71.0 | Error tracking from day one; PII off with a scrubber |
| Analytics | posthog-js | 1.422.1 | Funnels and pageviews; cookieless on the landing site |
| QR codes | qrcode | 1.5.4 | "Scan to open on your phone" on the landing site |
| Unit tests | vitest | 4.1.11 | Fast TS-native unit/component tests |
| Component tests | @testing-library/react / jsdom / @vitejs/plugin-react | 16.3.3 / 29.1.1 / 6.1.1 | Component rendering in jsdom |
| PNG tooling | pngjs | 7.0.0 | Generated the monochrome push badge |
| E2E | @playwright/test | 1.62.1 (`^1.62.1`) | Full Chromium with fake camera; also used for screenshots, marketing captures and live checks |
| Performance | lighthouse (npx) | 12.8.2 | Landing page LCP/CLS/TBT gates |
| AI — text/vision | Google Gemini API, model `gemini-3.5-flash` | — | One vendor for matching, detection, verification, describing, packing; structured JSON output with response schemas; admin-switchable |
| AI — images | Gemini image model `gemini-3-pro-image` | — | Highest garment fidelity; a cheaper `gemini-2.5-flash-image` kept as an upside pending an A/B |
| AI — 3D | Tripo API v2 (`model_version v3.1-20260211`, detailed geometry + texture, PBR, triangles, `face_limit 1,500,000`, `orientation align_image`) | — | Photo/multiview to GLB; never named in the UI |
| Hosting | Vercel | Team plan (SAML) for the monorepo; the prototype repos started on a personal Hobby account | Deploy target for all apps; cron; env per project; instant rollback. Hobby + private repo = only the linked account may author commits |
| CI | GitHub Actions | ubuntu-latest, actions/checkout@v4, setup-node@v4 (Node 22), upload-artifact@v4 | Runs the whole pyramid on a Neon CI branch; 25-minute timeout |
| Dependency updates | Dependabot | weekly grouped | Security alerts + automated fixes |
| Android wrapper | PWABuilder TWA | test package only | Store presence later without rebuilding the app |
| Planned | Stripe | — | Payments (restricted key, Checkout, webhooks, monthly renewal grants) |

---

## 4. Architecture patterns that came with the stack

These are the decisions that made the code hold up; reuse them as written.

1. **Every AI operation is an async job row from day one.** A `generations` table (`id, user_id, kind, status queued|running|ready|failed, input jsonb, result jsonb, credits_spent, cost_cents, timestamps`). Screens never await a long call; they create a row and poll a status route with TanStack Query. A queue vendor was deliberately left undecided and never needed: client-driven polling plus a nightly cron sweep of orphaned jobs covered it.
2. **Paid-engine pattern.** Charge credits up front → call the engine → persist the result under a **new unique storage key** → refund on failure (with a free-retry flag for unrecoverable builds) → per-user daily cap → engine wallet shown in admin with a low-wallet alert → nightly orphan sweep. Mock flags (`GEMINI_MOCK=1`, `TRIPO_MOCK=1`, or a missing key) switch every engine to a deterministic simulated path so CI and keyless environments run whole flows.
3. **Prompts as pure functions.** Prompt builders, JSON response schemas and validators live in one module (`lib/aiPrompts.ts`), take plain data, and are unit-tested. Validators clamp model output to real owned items and drop invented ones. Refusals (bad photos) come back inside the same detection call and are free to the user.
4. **Config row over code defaults.** Admin-editable configuration (`app_config`, one JSON row) wins over `DEFAULT_CONFIG`; a cutover script (`tools/cutover/config.mjs`) upgrades the row idempotently and a verify script checks it. Consequence: after a deploy, re-run the config script (old code may have written its defaults back).
5. **Migrations are plain, additive, re-runnable scripts** (`packages/db/migrations/NNN-name.mjs` with `IF NOT EXISTS` and count-guarded seeds), run per database branch with `DATABASE_URL`. `drizzle-kit push` only for the very first schema.
6. **Apps run from typed seeds when `DATABASE_URL` is missing**, so the frontend was fully usable before the backend existed and static specs run without secrets.
7. **Private storage behind an auth proxy.** Keys `u{userId}/{kind}/{uuid}.{ext}`; `public/` for catalogue images; `/api/storage/[...key]` serves only the caller's own prefix with immutable cache headers — which is why files are never overwritten in place.
8. **Two auth systems.** Users: Auth.js v5, JWT sessions, `users.session_version` in the token so a password change, deletion or suspension signs out every device; one sign-in method per email. Admin: separate password (scrypt hash in the database) + emailed 6-digit 2FA + server-side revocable sessions + a save-lock code for anything that changes what users pay.
9. **Rate limits in your own database** (`rate_limits` table, fixed-window upsert) — no extra service; identical on staging, CI and production.
10. **No row-level security, by design.** No browser reaches the database; one server role; every query filters by the signed-in user; an attack suite proves isolation on every push. Turn RLS on only if a direct data path is ever added.
11. **Gate tests that fail the build:** route inventory (every API route needs a session or is on a public allow-list), SQL scan (no string-built SQL), copy audit (no roadmap/placeholder wording), log scrubber, locked-key list, seed integrity.
12. **PWA specifics.** Service worker as network passthrough (installability without stale caches), install banner + in-app install card, `related_applications` + `getInstalledRelatedApps()` to hide install UI once installed, an update toast driven by `/api/version` (build sha), Samsung Internet detection that swaps the install flow for a "use Chrome" guide, `color-scheme: only light` and flat-white fallbacks for brand marks under forced dark mode, a monochrome badge icon for Android notifications.
13. **3D viewer.** Three.js with `MeshStandardMaterial` (roughness 1, metalness 0, keeping normal/AO maps) — a Lambert clone looked matte but discarded the detail you paid for. Engine orientation `align_image`; lighter share copies (41 MB → 3.9 MB) via geometry-only compression because texture compression through sharp failed on those files.
14. **Environment ladder in the database provider**: `production`, `staging`, `ci-backend`, `ci`, temporary forks — each with its own bucket. Never share a database between CI and a live environment.
15. **Demo profile** (fixed user id) as a shared, editable presentation account reset nightly by cron and after test runs; hidden on production; neutral identity written by the reset script itself.

---

## 5. Deliberately not chosen (and when to revisit)

| Not chosen | Why | Revisit when |
|---|---|---|
| Supabase (DB/auth/storage) | Free tier pauses projects; Neon branches + object storage covered everything; "keep Neon, never Supabase" became a rule | Never, unless a feature needs its realtime layer |
| A job queue (Inngest, Trigger.dev, edge functions + cron) | Client polling + a nightly sweep was enough for ~1-minute jobs | Jobs longer than a serverless timeout, or fan-out work |
| `<model-viewer>` | Glossy PBR + image-based lighting looked wrong and stuttered; no material control | — |
| React Native / Capacitor / store apps at launch | 30% store cut on credits; review risk for a web app in a shell; iOS needs a Mac and a paid account | After payments are real and the client wants store presence (TWA for Android first) |
| Content-Security-Policy header | Needs an audit of inline styles and third-party scripts; could break the 3D viewer and camera | Post-launch |
| Row-level security | See pattern 10 | Only if the DB is ever exposed to browsers |
| External penetration test, Vercel firewall rules | Post-launch / cutover items | At cutover |
| GSAP inside React | Fights React's render model; Motion for React instead | — |
| Community UI skills | Installed skills already covered the work; overlap adds noise | — |
| An affiliate/referral service | Parked; an auto-affiliate service for shop links and a referral programme built on the existing sign-up source can be added with the Stripe work | With payments |

**Changes from the original plan:** Supabase dropped for Neon permanently; `<model-viewer>` replaced by Three.js; the job queue never needed; rate limiting built on Postgres; storage moved to Neon Object Storage (public beta, region-limited) instead of a separate blob store; the prototype's CSS ported verbatim into `packages/ui` rather than fully re-expressed in Tailwind.

---

## 6. Before you reuse a version

> **For Claude — paste this (version check before scaffolding a new app):**
```
Before scaffolding, check every pinned version in [GUIDE PATH]\04-tech-stack.md section 3 against the current registry:
1. For each npm package run `npm view <pkg> version` and `npm view <pkg> time --json | tail` and note the latest stable and its date.
2. Run `npm audit --json` after the first install and list any high/critical advisory; prefer the patched version. If a fix needs a major upgrade, tell me the breaking changes before choosing.
3. For Next.js, React, Auth.js, Drizzle, Tailwind and Playwright: read the release notes between our pinned version and the latest and list breaking changes that affect our patterns (App Router server routes, JWT sessions, tagged SQL templates, CSS tokens, webServer/e2e config).
4. For Gemini and Tripo: list the currently available model ids and prices from the official pages only; confirm image-model quota needs billing; confirm the 3D engine's per-build credit cost at our settings from at least two official pages.
5. Confirm Node LTS and pin `"packageManager": "npm@<installed>"` in the root package.json.
Then propose the version table for this app with a one-line reason per change from the guide's table, and wait for my go.
```

Rules of thumb: keep the "why" and change the number; never take a major upgrade days before a launch without an explicit decision; pin overrides for known advisories with a documented, dated exception when a nested copy cannot be moved.

---

## 7. The machine and the shell

- **Windows 11 laptop**, Claude Code desktop, Git Bash for the Bash tool, PowerShell 7 as the primary shell.
- `python` in Git Bash is a Windows Store stub; use `py` or the full path. In September Python was unavailable entirely; Node scripts or the Edit tool replaced it.
- Inline scripts break on quoting: never `node -e '…'` with quotes, heredocs or template literals; never inline Python in PowerShell; write `.mjs`/`.cjs`/`.py` files in the scratchpad and run them. PowerShell here-string closers at column 0; no embedded double quotes in `git commit -m` (use a message file).
- One-off TypeScript scripts run with `tsx` need `.mts` for top-level await; scratch scripts must live inside the workspace to resolve `node_modules` (copy in, run, delete, never commit).
- Full Chromium in Playwright overloads the laptop: one worker; keep the machine idle during e2e; free ports 3000/3001 first (`netstat -ano | grep ":300[01]"`, `taskkill //F //PID <pid> //T`).
- No WebKit installed; mobile Playwright project forces Chromium.
- Windows "Reduced motion" was on, which surfaced a real hydration bug and a frozen reduced-motion fallback — test with it on.
- CRLF checkouts broke one text-matching unit test locally (CI on Linux passed); normalise line endings.

---

## 8. Skills used per phase

| Phase | Skills |
|---|---|
| Pre-build, UI | `frontend-design` (branded UI quality), `gsap-scrolltrigger`, `threejs-webgl` |
| Full-stack | `react-three-fiber` and `web3d-integration-patterns` (considered; the Three.js port was hand-written), `dataviz` (admin charts, cost report), Neon agent skills (`neon`, `neon-postgres`, `neon-object-storage`) |
| Everything | The multiple-choice question tool, plan mode, the browser pane, background tasks, workflow scripts, auto-memory |

---

## 9. Scaffold block

> **For Claude — paste this (scaffold the monorepo for a new app):**
```
Scaffold the production codebase for [APP] in a NEW local folder [ABSOLUTE PATH]\front end — local only, nothing committed or pushed yet.
Layout: Turborepo with npm workspaces; apps/web (Next.js App Router customer PWA, port 3000), apps/admin (Next.js admin, port 3001), apps/site (Next.js static export of the coming-soon/landing page), packages/ui (the prototype's CSS ported verbatim + tokens), packages/db (Drizzle schema, typed seeds, reset-demo, migrations folder). Root package.json with "packageManager": "npm@[VERSION]" and scripts dev/build/test/security:secrets/security:audit.
Baked-in patterns: a `generations` async job table; apps run from seeds when DATABASE_URL is missing; a config row (`app_config`) with DEFAULT_CONFIG; per-user storage prefixes behind an auth proxy route; GEMINI_MOCK/TRIPO_MOCK switches in the engine clients; zustand persist with skipHydration; TanStack Query hooks per resource; security headers in next.config; a `.gitignore` that excludes node_modules, .next, .turbo, .env*, screenshots, test-results, .neon, tools/marketing/out.
Copy templates from [GUIDE PATH]\templates: CI workflow, Playwright config with mocked engines, secrets scanner, audit gate, .env.example files.
Use the versions we agreed in the version check. Then `next build` both apps clean, install Playwright chromium, screenshot every screen at 390x844 and 1280x800, inspect each image, fix defects, re-shoot, and run tools/verify.mjs (overflow at 375px, console errors, key money/gating flows). Report with numbers.
```

---

## Assemble example

- **The prototype stack held for three milestones.** The coming-soon page (9 Jul 2026), the 3D viewer (25 Jul), the greyscale prototype (14 Jul – 5 Aug, ~250 KB) and the branded prototype (5–6 Aug, ~360 KB) were all single HTML files on Vercel with no build step. The branded prototype added GSAP from a CDN, Three.js r160 with Draco, `manifest.json` and 49 sliced images plus 26 mask icons, and still deployed as static files.
- **The tech-stack round** (21 Aug 2026, 17 questions, ~32 minutes) produced the table in section 3 and the eight-rule framework; two of your follow-ups were "if we use Next.js + React + TypeScript can this be converted to IPA or APK easily?" (yes — Capacitor or a TWA, with the store-billing caveat) and "explain the state question as if I'm 15" (TanStack Query = the librarian for server data; Zustand = the small whiteboard for UI state).
- **Step 1** (21 Aug 2026, ~72 minutes): scaffold, design system ported 1:1 into `packages/ui`, Drizzle schema with the `generations` table and typed seeds, 43 customer routes and ~40 modals, admin with login + 2FA + 14 sections, 73 Playwright screenshots, three real defects found by looking at the images (an empty 3D viewer from a field-of-view override, admin images missing because each app has its own `public/`, credits resetting on reload from an in-memory store), a final crawl with 0 console errors.
- **Deploy** (28 Aug): three Vercel projects from one repo; the first builds failed until `packageManager` and the install command were fixed; Neon wired the same night; Auth.js + Google + Resend OTP + Sentry + PostHog the next morning; PWA install prompts and the Three.js viewer replacing `<model-viewer>` the same day.
- **Backend** (1 Sep onward): `lib/gemini.ts` (REST `generateContent` with response schemas and `responseModalities: ["IMAGE"]`), `lib/aiPrompts.ts` (1,081 lines of pure builders and validators, all unit-tested), `lib/aiGuards.ts` (charge/refund/daily cap), `lib/tripo.ts` with max engine settings, migrations 001–017, 30 e2e spec files, 456 unit tests by 17 Sep.
- **Security round** (13 Sep): Next.js upgraded for a critical advisory, `drizzle-orm` to 0.45.2, `sharp` to 0.35.4, `zod` schemas on every writing route, DB-backed rate limits, an attack suite, a secrets scanner and an audit gate with one dated exception (PostCSS nested under Next, review by 1 Dec 2026).

## Pitfalls

| Symptom | Cause | Fix | Prevent |
|---|---|---|---|
| Vercel monorepo builds fail | Turbo 2 needs `"packageManager"`; default install under-installs workspaces | Pin it; install `cd ../.. && npm install` | Template root `package.json` |
| `drizzle-kit push` wants to rebuild an existing primary key | Introspection quirk | Additive `.mjs` migrations | Migrations after the first deploy |
| `.ts` script fails on top-level await | tsx treats `.ts` as CommonJS | `.mts` | — |
| Scratch script `ERR_MODULE_NOT_FOUND` | Outside the workspace | Copy into `apps/web`, run, delete | Never commit it |
| Buy sheet lists no packages | `initialData` + `staleTime` suppressed the fetch | `initialDataUpdatedAt: 0` | Note in the data-layer conventions |
| Hydration mismatch only on your machine | Windows Reduced Motion vs animated templates | Static first paint; animate on client navigation | Test with reduced motion on |
| Zustand SSR warnings | Persist without `skipHydration` | `skipHydration` + rehydrate in Providers | Template store |
| New assets 404 under `next start` | `public/` snapshotted at boot | Restart | Note in dev docs |
| Admin images missing | Each app has its own `public/` | Copy or share static assets | Shared static package |
| 3D looks shiny / stutters / low detail | PBR + IBL in `<model-viewer>`; then a Lambert clone dropping maps | Three.js port with `MeshStandardMaterial` roughness 1 keeping maps | A/B render the real asset before blaming the engine |
| Avatars sideways | Engine default orientation | `orientation: "align_image"`; rotate old files to new keys | Set orientation in engine settings |
| Rotated files still sideways | Immutable cache + overwrite in place | New keys; clear thumbnails | Never overwrite a storage key |
| sharp fails on GLB textures | libvips colourspace issue | Geometry-only compression | Benchmark on a real asset first |
| Invalid CSS silently drops a transform | `scale(calc(var(--size)/640))` divides lengths | Unitless scale variable | Read computed `transform`; `none` means invalid |
| `python` does nothing in Git Bash | Windows Store stub | `py` or full path | — |
| Inline `node -e` / PowerShell Python breaks | Quoting | Script files | Rule in `CLAUDE.md` |
| CRLF breaks a text-matching test locally | Windows checkout | Normalise line endings / `.gitattributes` | — |
| Old build re-adds removed config keys | Stored config row rewritten by old code before the new deploy | Re-run the config script after deploy | Make config scripts idempotent and post-deploy |
| Camera context leaks between flows | Transient flow state persisted in the store | Reset on entry; exclude from persistence | Never persist transient context |
