# Source notes r4-fullstack-b — Full-stack frontend go-live → Step 1.5 (CRUD, admin, social, storage, 3D) → Step 2 backend workspace (real AI) → Samsung/PWA polish

Scope: chat archive `Project History/chats/2026-08-05-ui-and-backend-1.md`, lines 4483–8540 (28 Aug 2026 01:05 → 2 Sep 2026 22:01).

Conventions in these notes:
- "you" = the developer/user driving Claude Code. "the client" = the person Assemble is built for.
- All secrets are replaced by placeholders: `<GITHUB_PAT>`, `<VERCEL_TOKEN>`, `<NEON_DATABASE_URL>`, `<RESEND_API_KEY>`, `<GOOGLE_CLIENT_ID>`, `<GOOGLE_CLIENT_SECRET>`, `<POSTHOG_KEY>`, `<SENTRY_DSN_APP>`, `<SENTRY_DSN_ADMIN>`, `<TRIPO_API_KEY>`, `<GEMINI_API_KEY>`, `<ADMIN_PASSWORD>`, `<AUTH_SECRET>`, `<VAPID_PUBLIC_KEY>`/`<VAPID_PRIVATE_KEY>`, `<CRON_SECRET>`, `<ADMIN_SESSION_SECRET>`.
- Personal emails are `<ADMIN_EMAIL>` (agency work address), `<PERSONAL_EMAIL>` (your gmail), `<CC_EMAIL>` (second coordinator inbox), `<DEMO_EMAIL>` (the demo persona's login email). GitHub account = `<GITHUB_USER>`. Neon IDs = `<NEON_PROJECT_ID>`, `<NEON_ORG_ID>`, branch IDs `<BRANCH_ID>`. Vercel team = `<VERCEL_TEAM_ID>`, projects `<PROJECT_ID>`.
- The app name Assemble, the domain `assemble.ink`, and the repo names `Assemble_Frontend_v1` / `Assemble_Backend_v1` are kept because the guide needs concrete examples; a writer can generalise them to `[app]`, `[domain]`, `[Repo_Frontend]`, `[Repo_Backend]`.
- IMPORTANT for the writer: the raw archive in this range contains several UNMASKED secrets pasted by you in chat (Resend key, PostHog key, Sentry DSNs, Google client ID, Tripo keys, admin password) and also compaction summaries that repeat them. Do not copy anything from the archive verbatim without re-masking. A lesson in its own right: see Pitfalls → "Secrets pasted into chat end up in archives and compaction summaries".

---

## 1. Timeline

### 28 Aug 2026 (overnight run, 01:05 → 20:12) — "Step 1" finish, deploy to domain, Step 1.5 stages A/B/C, round 4

| Time | Milestone | Delivered / commit |
|---|---|---|
| 01:05 | "lets run it. locally" — first local run of the Turborepo frontend (`front end/` folder: apps/web customer PWA on :3000, apps/admin on :3001) | Both apps started via the Browser-pane preview system, registered in `.claude/launch.json` as `assemble-web` and `assemble-admin`. Found a React hydration error caused by Windows "Reduced Motion"; fixed route templates to render static on first paint. Self-inflicted: running `next dev` in same dir as `next start` overwrote `.next`. |
| 01:36–01:39 | Question round on monorepo + subdomains (4 questions) | Decisions: you own a domain; coming-soon site copied static into `apps/site`; root = coming soon, `app.` = PWA, `admin.` = admin; admin stays an open demo for now. |
| 01:43–01:47 | Step 1 of deployment | `apps/site` added (byte-for-byte copy of coming-soon `index.html` + favicon + minimal `package.json` + `vercel.json`); README deployment map; `git init` in `front end/` under your GitHub identity; initial commit `54c5985` (264 files). |
| 01:50–01:52 | You gave repo URL `github.com/<GITHUB_USER>/Assemble_Frontend_v1` and domain `assemble.ink` | Monorepo pushed (inline-token push, token not stored). Claude produced the manual Vercel dashboard steps (import 3×, root directories, DNS table). |
| 01:58–02:13 | "can i connect my vercel here so you do it for me automatically?" → you pasted a short-lived Vercel token | Claude used the Vercel REST API to: verify token, create three projects (`assemble-app` root `apps/web`, `assemble-admin` root `apps/admin`, `assemble-site` root `apps/site`), link them to the GitHub repo, trigger first production deployments, fix build errors (commit `46629c2`), move `assemble.ink` + `www` from the old standalone `assemble-coming-soon-page` project to `assemble-site` with zero downtime, attach `app.` and `admin.` subdomains. DNS for the apex already pointed at Vercel; `app`/`admin` CNAMEs needed adding at Hostinger (registrar). |
| 02:18–02:23 | You added the two CNAMEs at Hostinger | Claude polled DNS/HTTPS; live in ~4 minutes; all three URLs returned 200 with own certificates; screenshot via local Playwright (the pane blocked external navigation). |
| 02:38–02:47 | Logo on app login differed from coming-soon | Exact port of the coming-soon logo (clamp(250px→440px) sizing, ring geometry, A treatment) + numeric-scale fallback for older browsers. Commit `7f097b6`. |
| 02:51–02:58 | Ring had "assemble" once instead of twice; PWA install prompts requested | Ring fixed to `assemble` ×2 + 44 dashes = 60 orbs. Added service worker `/sw.js` (network passthrough), slide-down install banner capturing `beforeinstallprompt`, iOS "Add to Home Screen" instruction sheet, install card. Commit `744440b`. |
| 03:07–03:12 | Move install card from Settings to Home + Profile | Shared `InstallCard` component. Commit `9f6b14f`. |
| 03:16–03:23 | 3D avatars "too shiny", stuttering | Replaced `<model-viewer>` with a 1:1 React port of the prototype's Three.js viewer (Lambert material swap, hemisphere+key+fill+rim lights, ACES tone mapping 1.8, pixel ratio cap 2, damped OrbitControls, loading bar, auto-rotate/reset tools, per-model cache). Commit `32b3825`. |
| 03:23–03:31 | "Already installed" message wrong; back button ping-pong loop | Back buttons now use real history (`router.back()` when in-app history exists; explicit target only as deep-link fallback). Manifest `related_applications` + `navigator.getInstalledRelatedApps()` to hide install UI when installed. Commit `852b21c`. |
| 03:35–03:44 | "why doesnt the admin installs as user?" (after an API connection error and "Try again") | Admin became a full PWA: own manifest ("Assemble Admin", start_url `/dashboard`), service worker, banner, Settings install card, installed-detection. Commit `87c3e2e`. |
| 03:49 | "whats left?" — Claude listed 5 open Step 1 items | 1 Neon DB, 2 real auth (Auth.js + Google + Resend OTP), 3 data-access pattern, 4 test pyramid + CI, 5 PostHog + Sentry. Recommended order 3 → 1 → 2 → 4 → 5. |
| 03:52–04:14 | Items 3 and 4 while you set up Neon | Typed TanStack Query hooks (`useItems`, `useLooks`, `useProducts`, `useFriends`) with seeds as `initialData`; `/api/friends` added. Vitest 24 tests (unit + component), Playwright 27 e2e checks (mobile + desktop projects, config starts both production servers). GitHub Actions CI workflow written but push rejected — PAT lacked `workflow` scope. Commit `be05706`. |
| 04:16–04:30 | You asked Claude to install Neon agent skills and wire the project | `npx skills add neondatabase/agent-skills -s neon -s neon-postgres -y`; Neon CLI installed globally, browser OAuth sign-in; workspace linked to project `assemble`; `neon env pull` to `apps/web/.env.local`; `neon.ts` declares Postgres only; schema pushed (12 tables incl. `generations` job table); seeded (1 user, 28 items, 13 looks, 11 products, 8 friends, 4 collections, 10 ledger rows); four `/api` routes switched to Drizzle with seed fallback; `DATABASE_URL` set on Vercel; "mutation proof" (UPDATE product price → live API shows it → revert) run locally and on production. Commit `b412985`. |
| 04:33–04:38 | You added `workflow` scope → CI file pushed | First GitHub Actions run on `81a0ff8` green: Vitest 24 → both builds → full Playwright suite. Claude then wrote click-by-click setup guides for Google OAuth, Resend, PostHog, Sentry. |
| 05:53–06:26 | You pasted Google OAuth ID/secret, Resend key, PostHog key, two Sentry DSNs | Real auth: Auth.js v5 with Google + Credentials (bcrypt), JWT sessions; OTP table (`auth_codes`, sha256 hashed, 10-minute expiry) created by direct SQL (drizzle-kit push quirk); branded OTP email via Resend; session-aware Home greeting and Profile; real sign-out. Sentry on both apps (server/edge + branded crash screen); PostHog pageviews on customer app. Env vars locally and on Vercel. 24 unit + 27 e2e green. Commit `2caac76`. "Step 1 is complete." Resend still sandboxed (only delivers to the account owner's email). |
| 10:09–10:16 | Resend domain verification walkthrough; you verified `assemble.ink` in Resend (Tokyo region, CNAME-style records) | `EMAIL_FROM` flipped to `Assemble <verify@assemble.ink>` locally + Vercel; redeploy; proof: test email to your inbox and a live production signup to a random gmail returned `{"ok":true}`; test row deleted. |
| 10:18–10:41 | "will installed users get the latest version?" → update toast | Explanation: PWA loads from the server, no reinstall. Built `/api/version` (returns `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`), client checker every 3 min + on `visibilitychange`, bottom glass bar "A new version of Assemble is ready — Refresh"; mirrored in admin; unit tests. 29 unit + 27 e2e. Commit `1ee7508`. |
| 10:43–11:08 | "Step 1.5" question round — 24 questions | Scope doc `STEP-1.5-SCOPE.md` committed. Three staged deploys A/B/C. |
| 11:09–11:14 | Tripo key guide; you pasted key; wallet showed 0 | Key verified via Tripo balance endpoint (valid, 0 credits). |
| 11:16–11:34 | Stage A build (migration 001, server user context, middleware gating, CRUD routes, client rewiring) | Context ran out mid-edit → compaction at 11:34. |
| 11:35–12:25 | Stage A finished after compaction | Admin auth (env password + emailed 6-digit code), four writable admin panels (AI costs & limits, credit packages, taxonomy, products), `db:reset-demo` script, e2e updated for gated routes. 29 unit + 38 e2e. Commit `f03d9c8`. 13/13 live production checks + live admin write round-trip (gen cost 1→2 → user app reflects → revert). CI green with new repo secrets. |
| 16:25 | Your fixes before Stage B: prefill demo login, gate Saved tab for free users, delete all users except demo, admin OTP email change | Done, then Stage B. |
| 16:27–17:05 | Stage B | Usernames migration, web push (VAPID, `web-push` package), notify helper, social APIs (friends, shares, responses, user search), two-way tickets, remaining admin panels (users suspend/credit adjust, brands, help articles, campaigns, ticket replies, broadcasts in-app + push), nightly demo reset via Vercel Cron (06:00 UTC, secret-protected). 29 unit + 43 e2e. Commit `6249d9d`; CI failed (missing `AUTH_SECRET` secret) → fixed `81ad49a`, green. |
| 17:08–17:57 | "i topped up tripo credits - proceed to stage C" | Wallet 600 credits. Neon Object Storage bucket provisioned + smoke-tested; per-user prefix, authenticated storage proxy; real item photo uploads; Tripo pipeline (upload → charge → task → client polling → GLB downloaded into bucket → matte viewer; auto-refund on engine failure; daily cap). 46 e2e + 29 unit. Commit `2b04ea2`. First live Tripo run failed because CI reset the demo profile in the production DB mid-test → created a dedicated Neon `ci` branch (DB + bucket copy-on-write) → commit `f98f3b8` CI green. Live proof: upload 201 → 8 credits charged → progress 19%→38%→55%→73% → ready in ~50 s → 6.4 MB GLB served via proxy → renamed/deleted → cleaned. |
| 18:00–18:44 | Round 4: six bug reports + "Ask at least 25 questions" → 32 questions | Decisions on context-aware real camera, eye icon, photo fit with blurred backdrop everywhere, PLUS chips, monochrome push badge, real admin stats, background-build card, one-time 3D consent, stuck-avatar recovery with refund + free retry. |
| 18:45–20:12 | Round 4 build | Recovered your two stuck High-quality avatars (9.7 MB and 6.9 MB) from the engine. Bold geometric "A" badge PNG; shared `Ph` photo component with fit+blur; password input with eye toggle; PLUS/PRO chip; real `getUserMedia` camera screen (flip, gallery, rule-of-thirds grid, freeze-confirm, fallback card); per-angle item photos; job-completion logic extracted to shared lib used by status route + nightly orphan sweep; admin stats endpoint powering dashboard/monetize/AI usage/reports (demo excluded). Internet dropped at 19:32, watcher resumed at 19:41. Playwright needed full Chromium channel for fake camera; machine overloaded → workers capped at 2. 50 e2e + 29 unit. Commit round-4 (`9a451e5` per later summary). 10/10 live checks. CI failed: `ci` Neon branch lacked migration 003 column `angle_photos` → migration applied to branch, rerun green. |
| 20:18–20:54 | "proceed to step 2" + 3D engine settings from Tripo Studio screenshots + 5 questions | You paused Step 2 at Q3 ("let not do step 2 now"). Delivered: both tiers use max engine settings (v3.1, Ultra/detailed geometry, 4K/detailed texture, PBR, triangle topology, face limit 1.5M = API ceiling vs Studio's 2M); matte stays viewer-side; your two avatars rebuilt "on the house" as the live test (~60 engine credits each, 43 MB GLBs, wallet 600→300); admin AI panel shows live engine wallet; nightly low-wallet notification (<100). Commits `eeb2653`, cleanup `2501e3a` (helper script accidentally committed), CI fix `4be24f2` (duplicate demo rows on ci branch). |
| 22:09–22:41 | "i feel like the api is not making high quality 3d avatars" | Diagnosis via engine task records + A/B render of the actual GLB: the Lambert matte material discarded normal and AO maps. Fixed with `MeshStandardMaterial` roughness 1 metalness 0 keeping maps. Engine built models side-on → `orientation: "align_image"`; existing GLBs rotated in place with glTF-Transform. Rename saved only on Enter (mobile keyboards) → save on blur for avatars and outfits. Dates removed from avatar names. Login helper waits relaxed to `waitUntil: "commit"`. Commit `0514c3c`. |

### 29 Aug 2026
| 09:40–09:43 | Rotated avatars still showed sideways | Cause: storage proxy serves immutable long cache; rotated files overwritten onto same URLs. Moved rotated GLBs to fresh keys (`{id}-front.glb`), cleared thumbnails, renamed "My avatar 1–4", cleaned orphan files. Data fix, no deploy. Rule: never overwrite bucket keys. |

### 1 Sep 2026
| Time | Milestone | Delivered |
|---|---|---|
| 02:40–02:56 | "clean database so it has no users other than the demo one" + 6 questions (after an API error + "Try again") | Kept your own account; deleted test accounts + one stray signup; wiped their bucket objects (18 orphans); reset demo; reset ALL admin content to defaults (config, 3 packages, 68 taxonomy terms, 4 articles, 3 brands, 2 campaigns, 11 products); e2e `globalTeardown` now deletes test accounts + their files after every run. Commit `b468753` (a scratch file slipped in and was removed). |
| 02:56–02:57 | "how many credits left for the tripo api?" | 60 credits ≈ 1 max build. |
| 03:04–04:07 | New Tripo key (new engine account) + 5 questions | Key valid, wallet 0 → you topped up (600 usable + 5,000 reserved/frozen). Local env swapped; Vercel env write returned 403 ("must re-authenticate to this scope") → you issued a new Vercel token; env updated on both projects; empty-commit redeploys got canceled by ignored-build-step → used Vercel redeploy API; verification build through production (43.7 MB GLB) then cleanup. CI retry-tolerance fix `c9b78e8`. |
| 04:10–04:16 | Low-wallet alert threshold → 200 | Commit `7c62869`. |
| 04:19–04:52 | "make a new folder locally call backend … copy everything from front end … dont mention that this is written by claude … keep neon … every change goes through the pyramid" + 7 questions | `backend/` created by robocopy; attribution sweep (code, docs, configs; internal scope docs and `.claude/` removed; client-presentable README); fresh single-commit history under your identity; pushed to `Assemble_Backend_v1`; Neon `staging` branch (own DB + bucket); backend pyramid green (builds + 29 unit + 50 e2e against staging); staging Vercel projects `assemble-staging-app` / `assemble-staging-admin` created; first builds skipped (empty commit) → forced via deployments API; both live. |
| 04:58–05:36 | Gemini key (AI Studio) → Step 2 part A | Key verified by listing models + a smoke generation; stored in backend local + staging Vercel only. Built `lib/gemini.ts` (REST `generateContent` with JSON schema output + usage), `lib/aiPrompts.ts` (pure prompt builders/validators), `lib/aiGuards.ts` (daily cap, charge, refund), `/api/ai/detect`, `/api/ai/match` (incl. in-place refine), loading screen as orchestrator, results/detail/detect rewired, admin AI model selectors + 7-day stats, `GEMINI_MOCK=1` for e2e. 38 unit + 54 e2e. Live on staging with real Gemini: match 10.8 s (two valid looks, all items owned), detection 14 s on a denim jacket photo (all fields correct). |
| 06:00–06:41 | "proceed to part B and all part, keep testing your self and complete the whole app without stopping" + 5 questions | Compaction at 06:12 mid-build. Delivered: `/api/ai/render` (on-open auto-render cached with unique bucket key, swap re-render paid, user photo or gender-matched generic model, up to 5 garment references), `wornImg` helper across all thumbnails, real from-outfit 3D (look's 2D render as Tripo front view), real AI packing lists (`/api/ai/pack`), Surprise me, Compare, closet-aware shop ranking, admin render-model selector. 42 unit + 56 e2e. Commit `c050c86` + friendlier engine-error copy. Live staging: match 9.8 s, packing 5.9 s; image models blocked — Google gives image models zero free-tier quota → billing needed. |
| 11:29–11:46 | "whats this i got?" (CI failure email on backend repo) | Backend repo had no Actions secrets since creation. Created Neon branch `ci-backend` (from staging, own bucket), set 8 Actions secrets, reran → green (7m25s); hardened a flaky packing/pack-purchase balance assertion `d8f5cf4` → green 4m57s. Credentials saved to `backend/.env.ci-backend` (gitignored) because re-pulling env for that branch rotates storage credentials. |
| 16:23 | Asked for the admin password | Answered (placeholder here: `<ADMIN_PASSWORD>`). |
| 16:41–16:51 | "set it up in the frontend repo only that it sends the otp code to this email as well" | New env `ADMIN_EMAIL_CC` (comma-separated) used only for the 2FA code; set on production admin; live proof `{"ok":true,"sentTo":"ma…, as…"}`; CI green (5m9s). |
| 17:17–17:46 | Samsung Internet couldn't install the PWA (Play Protect block) + 6 questions | Front-end only first: manifest hardening (`id`, `scope`, `display_override`, portrait `orientation`, maskable icons), Samsung detection + tip in banner, `<meta name="color-scheme" content="dark">` on app/admin/site; 3 new PWA e2e specs; 53 e2e green; commit `255fe8d`; live manifest verified; phone retest steps handed over. |
| 18:32–20:05 | Retest: Play Protect still blocks; whites still dull in dark mode + 5 questions | You rejected a Play Store (TWA) app. Delivered: on Samsung Internet the Install buttons open a branded "Install Assemble with Chrome" sheet (copy link + 3 steps) instead of the native flow; `.sbrowser` class → logo "A" and wordmarks render flat pure white instead of gradient-clipped text; `color-scheme: only light` opt-out meta on all three surfaces. Front-end 53 e2e green → `4a0fccb`; backend mirror (files copied + hand-merged `Modals.tsx`) 56 e2e green → `588aca1`. Both CIs + all deploys green. An API "Can't reach server" error mid-run at 19:39, resumed on "Try again". |

### 2 Sep 2026
| 21:41–22:01 | Profile photo identical for demo and your account; demo showed your email; "ask at least 10 questions" | Root causes found before asking: avatar hardcoded to `/img/avatar-user.jpg`, no `image` column on users, no initials fallback. Decisions so far: store Google picture on user; initials from name in branded gradient circle; include manual upload now; neutral demo identity (e.g. a demo address on the app's domain); Claude to verify demo email from seed; reusable Avatar component everywhere "you" appear; tap-avatar on Profile opens photo options, synced with the existing photo option in Style profile & preferences. Scope ends as you interrupted the next question (precedence uploaded > Google > initials). |

---

## 2. Decisions and why

### Deployment & domains (28 Aug, 01:39)
- **Custom domain from the start** (you already owned `assemble.ink`). Why: subdomains can be wired immediately; no later migration.
- **Coming-soon page kept static in `apps/site`**, not wrapped in Next.js. Why: pixel-identical to what's live, nothing to break, zero build. (You first pushed back "what do u mean by coming soon being static. it has a moving ring" — Claude clarified "static" = no build step, animations are CSS/JS in the file.)
- **Root = coming soon, `app.` = PWA, `admin.` = admin.** Why: the root's job pre-launch is the teaser; at launch the apex is just reassigned to the app project — no code change.
- **Admin open demo for now** (no Vercel Deployment Protection). Why: seeded data only, protection is a paid plan feature; real auth arrives when admin writes real data (it did in Stage A).
- **One repo imported three times into Vercel with different Root Directories.** Why: monorepo with independent deploys; `npx turbo-ignore` as ignored build step so a commit touching one app doesn't rebuild others.
- **Let Claude drive Vercel via API with a short-lived token** instead of clicking the dashboard. Why: faster, repeatable, fewer mistakes; token expiry of 1 day recommended because pasting in chat = exposed.
- **Vercel MCP connector considered but not used** — its OAuth can't run inside a non-interactive session.

### PWA
- **Service worker as network passthrough** (no offline cache). Why: needed for Chrome installability; avoids stale-cache problems; offline caching deferred.
- **Install banner + install card on Home and Profile** (your correction: not in Settings).
- **`related_applications` + `getInstalledRelatedApps()`**: hide install UI when already installed (cleaner than a scolding message). Note: device must have installed from the same origin after this deploy (you reinstalled; it worked).
- **Admin also a PWA** with separate identity ("Assemble Admin"). Why: no technical reason not to; desktop install is a nice way to live in a dashboard.
- **Update toast instead of "reinstall" prompts.** Why: installed PWAs always load latest; the only edge case is a long-open session with old JS chunks. `/api/version` + 3-minute + foreground checks; dismissing silences only that version; dev builds never nag.
- **Samsung Internet install:** Play Protect flags Samsung's WebAPK packaging — not fixable from a website. Decisions: harden manifest anyway; then (after retest failed) **replace install with a Chrome guide sheet on Samsung Internet**; **no Play Store/TWA app** (your call); subtle note, not a loud banner.
- **Always-white branding on Samsung dark mode:** both image/flat-white fallback AND CSS opt-out (`color-scheme: only light`), on all three surfaces including admin (your call: "All three incl. admin"). Ship both repos at once (your call over the recommended "front-end first, retest, then backend").

### 3D viewer
- **Replace `<model-viewer>` with a port of the prototype's Three.js viewer.** Why: the shine came from glossy PBR materials + image-based lighting; the stutter from per-frame environment sampling; the prototype's Lambert + studio rig was the intended look and cheaper on mobile.
- Later (29 Aug): **matte via `MeshStandardMaterial` roughness 1, metalness 0 keeping normal/AO maps** instead of Lambert. Why: Lambert kept only colour and threw away the 4K detail you were paying for.
- **Matte stays viewer-side**, stored GLB keeps full 4K/PBR data. Why: nothing lost for future features; zero processing.
- **Both quality tiers use max engine settings** (your call over "High only"). Standard vs High price stays 8/15 credits.
- **Orientation `align_image`** so models face the camera.
- **Never overwrite storage keys** — always new unique keys (lesson from cached sideways avatars).

### Step 1 remaining items (28 Aug 03:49)
- **Order 3 → 1 → 2 → 4 → 5** (data layer, Neon, auth, tests/CI, observability). Why: items without external input first; Neon URL unblocks the most.
- **TanStack Query hooks with seeds as `initialData`.** Why: instant render today, transparent switch to live DB; later removed seeds from user-owned data so fresh accounts are truly empty.
- **Full test pyramid** (Vitest unit + Testing Library component + Playwright e2e) + GitHub Actions CI before Vercel deploys.
- **Neon: Postgres only, no Neon Auth/Data API** — auth, storage, AI go to their chosen providers. (Storage later moved to Neon Object Storage by your decision.)
- **`@neondatabase/serverless` over HTTP; pooled URL at runtime, unpooled/direct URL for DDL.**
- **Auth.js v5**: Google + email/password with Resend OTP, JWT sessions, bcrypt hashing; OTP codes sha256-hashed with 10-minute expiry. **Empty-fields login keeps the demo walkthrough** so presentations and e2e keep working.
- **Sentry separate projects for app and admin**; PostHog on customer app only.
- **Verify Resend domain** so OTP reaches anyone and comes from your own domain (better deliverability); optional DMARC record.

### Step 1.5 (24 questions, 28 Aug 10:44–11:07) — "all CRUD, admin-driven, no complex backend, Tripo, fresh accounts"
Recommended option in brackets when you chose differently.
1. Demo data: **demo becomes editable** [recommended read-only].
2. Keep demo presentable: **auto-reset nightly** via Vercel Cron [recommended admin reset button].
3. New account: **truly empty + 3 starter credits** (from admin config).
4. User CRUD: closet, outfits + collections, style profile, credits/plan/ledger **+ "everything else possible"**.
5. Social: **basic real cross-account social** (requests, shares to real inboxes, votes/comments).
6. Uploads: **Neon Object Storage** [recommended Vercel Blob] — it was public beta; your project was in the one supported region.
7. Tripo: **real 3D avatar from user photos**.
8. Long jobs without a queue: **client-driven polling** of a status route that asks Tripo and updates the `generations` row; resumes when user returns.
9. Spend guard: **in-app credits + per-user daily cap** (admin-configurable).
10. GLB storage: **download into your bucket** (Tripo URLs expire).
11. Photos: **front required, back/left/right optional** (single-image vs multiview mode).
12. Admin panels that write: AI costs & limits, credit packages, taxonomy, products **+ everything else possible**.
13. Admin security: **env-var password (hashed) + emailed 2FA-style code**, short session cookie. Full RBAC deferred.
14. Customer app gating: **require session or explicit demo cookie**; no session → welcome.
15. Non-Tripo AI: **simulated but persistent** (results save, credits deducted).
16. Empty closet generation: **always allow** [recommended gate at 4 items] — refined by you: closet-only paths show "you don't have enough clothes, add more" under 4 items (`minClosetItems`).
17. Plans: **simulated checkout, real effects** (plan, monthly credits, gates, ledger persist).
18. Broadcasts: **in-app notifications** + you asked for phone-tray push.
19. Web push: **include now** (VAPID, subscriptions table, service-worker handlers; iPhone only when installed, iOS 16.4+).
20. Push events: share received, feedback received, 3D avatar ready, friend request **+ everything else possible**.
21. Delete account: **hard delete immediately** (copy changed from "within 30 days").
22. 3D quality tiers: **texture quality tiers** (standard vs detailed + PBR).
23. Delivery: **three staged deploys** — A foundations, B social + notifications + push + demo reset, C storage + Tripo. Why: each ships and gets tested live before the next.
24. Tests: **extend the pyramid per stage**; Tripo mocked in CI; real API exercised manually once per deploy (costs money).

### After Stage A (28 Aug 16:25) — your fixes
- Demo login fields **prefilled** with demo credentials (one tap enters demo; typing own credentials logs in normally).
- Saved tab in bottom nav/desktop rail **gated for free users** (opens Plus unlock sheet).
- **Purge all users except the demo** before moving on.
- Admin OTP recipient changed to your agency work email.

### Stage C infrastructure
- **Dedicated Neon `ci` branch** (copy-on-write DB + bucket) after CI reset the production demo profile mid live-test. Rule: every migration runs on production AND ci branch.

### Round 4 (32 questions, 28 Aug 18:00–18:44)
- Q1 **one context-aware camera** (remembers origin; returns photo to the right slot; back returns to origin).
- Q2 avatar tile tap → **straight to camera** [recommended choice sheet].
- Q3 **real live camera** via getUserMedia with fallback.
- Q4 item snap **fully real** upload.
- Q5 eye toggle on **all password fields**; Q27 outline eye ↔ slashed eye; Q28 revealing the demo sentinel password is fine.
- Q6 photo fit **contain + blurred backdrop**; Q7 **everywhere** [recommended uploads only].
- Q8 **keep originals** [recommended client-side downscale].
- Q9 **small PLUS chip** on Saved tab; Q10 **uniform PLUS/PRO chips** on all gated entry points + your addition: backgrounded avatar builds must stay visible in My 3D avatars.
- Q11 building card with **live % + tap to reopen**; Q12 **notification + toast** when ready.
- Q13 **monochrome "A" badge** for Android status bar (asked twice — you asked for the question to be re-asked in plainer words).
- Q14 admin dashboard **full core set from DB**; Q15 **real daily signups, 14 days**; Q16 revenue = **real ledger events tagged SIMULATED**; Q17 **real per-user usage** with suspend; Q18 **small real reports set** (4 weeks); Q26 **exclude demo** from stats.
- Q19 **full back-button sweep + tests**.
- Q20 **real per-angle item uploads**.
- Q21 avatar thumbnails **auto-captured from the viewer**.
- Q22 filled tile tap → **options sheet (View · Retake · Remove)** [recommended tap = retake].
- Q23 camera unavailable → **inline fallback card** with gallery button.
- Q24 **flip + gallery + grid**; Q25 **freeze-frame "Use photo · Retake"** confirm.
- Q29 upload state **dimmed photo + progress ring**, retry chip on failure.
- Q30 **one combined deploy** [recommended two] + your report of a stuck background build and "consent + intro should be one-time".
- Q31 after first avatar → **straight to gallery**, consent saved to account (not device).
- Q32 unrecoverable build → **refund + free retry flag** [recommended plain refund].

### 3D engine settings round (28 Aug 20:18–20:34)
- Q1 **both tiers full settings**; Q2 **viewer-side matte**; Q3 (Step 2 order) → you **paused Step 2**; Q3' **rebuild both existing avatars now on the house**; Q4 **the rebuilds are the live test** (no extra spend); Q5 **low-wallet notification** + wallet shown in admin (threshold later raised 100 → 200 because a max build ≈ 60 engine credits).

### Database cleanup round (1 Sep 02:45–02:51)
- Keep your own account; wipe deleted accounts' files; reset demo; **reset admin config to defaults** [recommended keep]; e2e test accounts **auto-cleaned after runs** [recommended point local tests at ci branch]; full defaults including product catalog.

### Tripo key rotation round (1 Sep 03:04–03:53)
- New account will be topped up; remove old key everywhere; switch now; you had already topped up; **one verification build** on production then clean up.

### Backend workspace round (1 Sep 04:19–04:26)
- Q1 **fresh git history** (single clean commit; old history stays in frontend backup repo). Why: no AI attribution visible for client presentation.
- Q2 **old repo serves production until cutover**; backend repo gets its own staging.
- Q3 **Step 2 = A (Gemini matching + detection) then B (2D render engine); payments stay simulated → Step 3.**
- Q4 **AI Studio key** created by you (free tier to start).
- Q5 **staging Vercel projects + Neon staging branch**.
- Q6 **config caps + wallet-style alerts + token logging** for Gemini.
- Q7 **full attribution sweep** of every file.
- Standing: **keep Neon, never switch to Supabase**; **every change through the full pyramid + Playwright e2e**.

### Part B round (1 Sep 06:00–06:05)
- Q1 **everything except payments**.
- Q2 renders show **user's full-body photo when set, else a gender-matched generic model** (your refinement).
- Q3 **on-demand render per look, cached**; first render free, re-render after swap paid.
- Q4 default image model **`gemini-3.1-flash-image`** (you first picked the premium tier, then asked for the question to be re-asked and chose the recommended economical default; admin-switchable).
- Q5 production: **"never switch"** — cutover only when you say so later.

### Admin OTP CC (1 Sep 16:41)
- **`ADMIN_EMAIL_CC` env, comma-separated, only for the 2FA code**; front-end repo only. Why: recipients configurable, nothing hardcoded, other admin alerts unchanged.

### Samsung rounds (1 Sep 17:17 and 18:32) — see PWA above. Verification: **pyramid + your phone retest** because only a real Samsung device proves Play Protect behaviour.

### Profile photo round (2 Sep, partial)
- Store Google picture in a new `image` column; initials (two letters) on branded gradient circle; include manual upload; neutral demo identity; Claude verifies demo email from seed data rather than guessing; one reusable Avatar component everywhere "you" appear; tap-avatar on Profile + existing option in Style profile & preferences share one storage path.

---

## 3. Reusable user prompts

Each: original (lightly cleaned) → what it achieved → generalised template.

**P1 — Run locally (28 Aug 01:05)**
> "lets run it. locally"
- Achieved: Claude started both apps through the preview system, found and fixed a real hydration bug, and registered launch configs for future one-command starts.
- Template: `Run [app names] locally, open them in the browser pane, click through the main flows and fix anything that errors in the console.`

**P2 — Monorepo + subdomains discussion (28 Aug 01:36)**
> "yes windows has reduced motion so i will test it on different, on live vercel but before can you tell me if this folder frontend is a mono repo and can we add another like 3rd part of this repo - the coming soon website and them publish in a new repo link i will make on github and then how can we deploy this as sub domains lets discuss"
- Achieved: a 4-question decision round, then `apps/site` added and a full deployment map.
- Template: `Is [folder] a monorepo? Can we add [existing site] as another app, publish to a new repo I'll create, and deploy each app on its own subdomain of [domain]? Let's discuss before doing anything.`

**P3 — Hand over repo + domain (28 Aug 01:50)**
> "Repo: https://github.com/<GITHUB_USER>/Assemble_Frontend_v1 — domain: assemble.ink"
- Template: `Repo: [empty GitHub repo URL]. Domain: [domain]. Push and give me the exact deployment steps.`

**P4 — Let Claude drive the hosting dashboard (28 Aug 01:58)**
> "can i connect my vercel here so you do it for me automatically?"
- Achieved: Claude explained token vs MCP connector, asked for a 1-day token, then created projects, deployments, domains via API.
- Template: `Can I connect [hosting provider] here so you do the setup for me? Tell me the safest way (short-lived token, scope) and what you'll do with it.`

**P5 — Exact visual copy (28 Aug 02:38)**
> "the logo on assemble.ink and the logo on the app.assemble.ink login pages is different can you make the logo on app.assemble.ink login pages to be exact copy of the one used for assemble.ink coming soon"
- Template: `The [element] on [page A] differs from [page B]. Make [page B]'s an exact copy of [page A]'s — same size behaviour, geometry and animation. Verify side by side with screenshots, then ship.`

**P6 — Precise defect + new feature in one message (28 Aug 02:51)**
> "the logo ring on assemble.ink has assemble written twice inside and logo ring on the app login pages has just 1 assemble written. also since these are PWA. It should also prompt the user to install like a pop up that slides from top system generated and also somewhere in the app too custom made maybe in setting a button that allows user to start installing this."
- Template: `Bug: [exact observable difference]. Also add [feature]: [system-style behaviour] plus [custom in-app control] at [location].`

**P7 — Placement correction (28 Aug 03:07)**
> "ring matches. Regarding [the install card]: card looks and behaves perfectly but instead of Custom button in Settings place it in profile screen and home screen."
- Template: `[X] confirmed fixed. [Component] looks and behaves right, but move it from [A] to [B] and [C].`

**P8 — Live test feedback on 3D (28 Aug 03:16)**
> "lets test the 3d avatars on live app - i feel like they are too shiny and we didnt implement the matt texture like we had in UI instead of this shiny one. i also noticed that the movement is a bit buffering but i see that the avatar on the onboarding screen is fine."
- Achieved: port of the prototype's actual viewer (root cause, not a tweak).
- Template: `On the live app, [feature] looks [problem] compared with the prototype, and [performance issue] — but [place where it's fine]. Find why and match the prototype.`

**P9 — Two bugs with reproduction steps (28 Aug 03:23)**
> "if the app is already installed then the user opens it in browser and tried to click install - it says for android chrome 'install isnt available in this browser now…' but instead it should say already installed. I also feel like the app is more stucking in loops like if i press back on /shared/detail it goes to /shared and when i press back button again on /shared it goes to /shared/detail."
- Template: `Bug 1: when [state], doing [action] shows [wrong text]; it should [expected]. Bug 2: pressing back on [route A] goes to [route B], and back again returns to [route A] — a loop.`

**P10 — Parity question (28 Aug 03:35)**
> "reinstalled and it works - already installed detection is good now. why doesnt the admin installs as user? cant they behave similarly?"
- Template: `Confirmed [fix] works. Why doesn't [app 2] behave like [app 1] for [feature]? Make them consistent.`

**P11 — What's left (28 Aug 03:49)**
> "so coming back to completing the frontend phase. whats left?"
- Achieved: honest ledger of 5 open items with what each needs from you and a recommended order.
- Template: `Coming back to [phase]: what's left? List each item, what you need from me, and your recommended order.`

**P12 — Parallel work while you do setup (28 Aug 03:52)**
> "yes start with 3 and 4, i will set up neon meanwhile just tell me how?"
- Template: `Start on [items that need nothing from me]. Meanwhile tell me step by step how to set up [service] and what to paste back.`

**P13 — Install official agent skills + wire the service (28 Aug 04:16)** — very reusable
> "Install the neon agent-skill using the `npx skills add neondatabase/agent-skills -s neon -s neon-postgres -y` command and follow the instructions in it to configure the neon cli, and mcp server, and agent skills. Then connect the application to project assemble (ID: <NEON_PROJECT_ID>) in Organization <ORG> (ID: <NEON_ORG_ID>), write my env vars, and wire up each Neon service my app uses."
- Achieved: skills installed, CLI OAuth, project link, env pull, schema push, seed, routes on DB, Vercel env, mutation proof.
- Template: `Install the [provider] agent skill with [command] and follow its instructions to configure the CLI, MCP server and skills. Then connect this app to project [name] (ID [id]) in org [org] (ID [id]), write my env vars, and wire up each [provider] service the app uses.`

**P14 — Key setup guides + unblock (28 Aug 04:33)**
> "first tell me how to set up and get (Google OAuth Client ID/Secret + Resend key) · PostHog + Sentry keys. and workflow scope added to the PAT - push the CI file"
- Template: `First tell me exactly how to create and get [list of keys]. And [blocker] is now fixed — [do the blocked action].`

**P15 — Ask for elaboration on a dashboard step (28 Aug 10:09)**
> "Resend is in sandbox mode, so OTP emails currently deliver only to [owner email]. Fix: resend.com/domains → Add Domain → assemble.ink → elaborate on how to do this?"
- Achieved: click-by-click with the two gotchas (registrar auto-appends domain; DKIM value must paste in one line).
- Template: `You said "[quoted step]". Elaborate click by click, including the registrar side at [registrar], and the mistakes people usually make.`

**P16 — Screenshot check (28 Aug 10:13)**
> "its like this right now. should i still configure?" (with screenshot)
- Template: `[Screenshot] This is what I see now — is anything left to configure?`

**P17 — Product-behaviour question (28 Aug 10:18)**
> "tell me one thing so for those who have already installed the app and after this push will they get the latest version or not? do they have to reinstall? can we send prompt to reinstall?"
- Template: `Will users who already [installed/used] get the latest version after a push, or must they [reinstall]? Can we prompt them?`

**P18 — Accept optional polish (28 Aug 10:21)**
> "I want the update-toast as polish"

**P19 — Scope round for CRUD + admin + integration (28 Aug 10:43)** — the big one
> "How much of the database is built? can we add all CRUD based operation in step 1? so it remembers user wise data and user app is responsive to the admin setting or configurations and No complex backend logic implemented (leave complex backend logic for next step) or apis yet but just simple CRUD based operations to be done? also can we connect tripo api in step 1? I can provide api now. when a new account is created i want it to feel like the app has started from scratch. Ask at least 20 questions to understand discuss and take decisions together, got it? ask one by one and give multiple choice options to select from and highlight the recommended by you."
- Achieved: 24-question round → committed scope doc → three staged deploys.
- Template: `How much of [layer] is built? Can we add [scope] now so that [user outcome] and [admin outcome], without [excluded complexity] (that's for the next step)? Also can we connect [external API]? When a new account is created I want [feeling]. Ask at least [N] questions to understand, discuss and take decisions together — one by one, multiple choice, highlight your recommendation.`

**P20 — Get a key walkthrough (28 Aug 11:09)**
> "tell me first how to get key?"

**P21 — Key + observation (28 Aug 11:14)**
> "<TRIPO_API_KEY> — but i didnt get any free credit it says its 0"
- Achieved: Claude verified the key against the provider's balance endpoint before building.

**P22 — Fix list before next stage (28 Aug 16:25)**
> "for the demo path (empty login fields) still walks straight in via the demo cookie. I want the empty fields to be prefilled. I also noticed that for free subscriber the save in the bottom nav should be closed like the saved looks but its open for free users as well. before you move forward - except for the seed demo data delete all other users and their accounts/data. for admin: … change email to <ADMIN_EMAIL> for otp. after this proceed to stage B"
- Template: `Before stage [next]: 1) [UX fix] 2) [gating fix] 3) delete all users except the demo and their data 4) change [setting] to [value]. After this proceed to stage [next].`

**P23 — Unblock + go (28 Aug 17:08)**
> "i topped up tripo credits - proceed to stage C"

**P24 — Bug batch + big question round (28 Aug 18:00)**
> "the back function on the user app from snap a picture is not working properly as i clicked on front photo in creating 3d avatar add your photo screen and when i pressed the camera button to take photo it took me to match an item/add to closet screen - where it asks to detect item. also can we add the visibility icon in the passwords - the eye icon to view password written? when a picture is added it should fit to size of its container and shouldnt crop any part of it. Also the saved option in bottom nav should have the plus tag if user is not subscribed appropriately. The fav icon from push notification seem to be wrong - shows a white square but when the notification tray is pulled down it shows correct logo. the admin panel doesn't show accurate info like the dashboard shows 312 signups - what up with that? Ask at least 25 questions to understand discuss the UI and take decisions together, got it? ask one by one and give multiple choice options to select from and highlight the recommended by you."
- Achieved: 32 decisions; one combined deploy; 10/10 live checks.
- Template: `Issues from my phone test: 1) [flow bug with exact steps] 2) [small feature] 3) [visual rule] 4) [gating marker] 5) [icon problem with exact symptom] 6) [data accuracy problem with example]. Ask at least [N] questions…(same suffix).`

**P25 — Mid-round addition inside an answer (28 Aug 18:13, 18:41)**
> "Yes uniform chips and Also while the avatar is being made make it some way if user select continue in background he is still able to see the processing in my 3d avatars"
> "One combined deploy and I made a 3d avatar in my account and i pressed continue in background and then I never got to see the final 3d model and it shows empty on my end - also the 3d model consent and default avatar screen should be a one time thing"
- Note: answers in the multiple-choice "Other" field were used to add requirements; Claude turned them into follow-up questions.

**P26 — Re-ask in plain words (28 Aug 18:17, 1 Sep 06:04)**
> "Full core set and can you ask the last question again?"
> "no i meant regarding: Image model for renders (admin-switchable like the text models — this sets the default)"
- Template: `Can you ask the last question again (in simpler words)?`

**P27 — Start next step with screenshots of external settings (28 Aug 20:18)**
> "proceed to step 2 and we need the 3d avatar to be built in these settings attached in picture and also when its complete it should be in the matt texture that we usually have. Ask at least 5 questions…"
- Template: `Proceed to [step]. [Feature] must use these settings [screenshots of provider studio], and the result must keep [existing visual style]. Ask at least [N] questions…`

**P28 — Pause (28 Aug 20:27)**
> "let not do step 2 now. please stop step 2 for now."

**P29 — Quality doubt (28 Aug 22:09)**
> "i feel like the api is not making high quality 3d avatars."
- Achieved: Claude diagnosed before changing (engine task records → A/B render) and found the viewer was the cause.
- Template: `I feel [external API] isn't producing [quality]. Diagnose first — check what it actually received/returned before changing anything.`

**P30 — Fix didn't reach users (29 Aug 09:40)**
> "the avatars look good now. but two existing avatars were rotated in place i don't see them rotated please rotate them for all users. so on thumbnails in the my 3d avatar screen shows them in sideways."

**P31 — Clean database with a question round (1 Sep 02:40)**
> "can you clean database so it has no users other than the demo one? Ask at least 5 questions to understand discuss and we take decisions together, got it? ask one by one and give multiple choice options to select from and highlight the recommended by you."
- Template: `Clean [database] so only [what to keep] remains. Ask at least [N] questions first (files, related content, config, future test runs).`

**P32 — Balance check (1 Sep 02:56)**
> "how many credits left for the tripo api?"

**P33 — Swap an API key (1 Sep, message recorded in summary)**
> "can you integrate this api key instead? <TRIPO_API_KEY_NEW>"

**P34 — Small config change (1 Sep 04:10)**
> "yes set the low-wallet alert to 200"

**P35 — New clean workspace for next phase (1 Sep 04:19)** — key reusable prompt
> "before starting step 2 i would want you to make a new folder locally call backend and then in the folder copy everything from front end and then we will do step 2 there and keep the front end folder and repo as backup and so i will give you new repo for backend folder. first make everything locally and dont mention that this is written by claude we need to present it to client. i also wanna keep neon and not switch to supabase. every change goes through the full pyramid verification and playwright e2e etc to test. Before we proceed, ask me at least 5 questions so you can fully understand what I'm trying to achieve. Ask the questions one at a time, and for each question, give me multiple-choice options to choose from. Clearly highlight the option you recommend and briefly explain why. Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf."
- Achieved: backend copy, attribution sweep, fresh history, new repo, staging DB branch + staging Vercel projects, pyramid green.
- Template: `Before starting [next phase], make a new local folder [name], copy everything from [current folder] into it, and do [phase] there; keep [current folder] and its repo as backup. I'll give you a new repo. Build locally first. No mention of AI authorship anywhere — this is presented to the client. Keep [DB provider]. Every change goes through the full test pyramid and Playwright e2e. Before we proceed, ask me at least [N] questions… [standard question-round suffix].`

**P36 — Standard question-round suffix (from 1 Sep onward)** — use verbatim
> "Before we proceed, ask me at least [N] questions so you can fully understand what I'm trying to achieve. Ask the questions one at a time, and for each question, give me multiple-choice options to choose from. Clearly highlight the option you recommend and briefly explain why. Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf."

**P37 — Long autonomous run (1 Sep 06:00)**
> "proceed to part B and all part, keep testing yourself and complete the whole app without stopping. [standard suffix with at least 3 questions]"
- Template: `Proceed to [part] and all remaining parts. Keep testing yourself and complete the whole [app] without stopping. [suffix]`

**P38 — Never cutover without instruction (1 Sep 06:05)**
> "never switch. switch wont be done like that so that something i ll tell you later"

**P39 — "what's this email?" (1 Sep 11:29)**
> "i will enable billing later but whats this i got?" (CI failure email screenshot)
- Template: `[Screenshot of alert email] What is this? Investigate and fix if it's on our side.`

**P40 — Recall a setting (1 Sep 16:23)**
> "what was the password for assemble admin we set in frontend?"
- Note for guide: better practice is to keep such values in a password manager, not chat.

**P41 — Scoped repo-only change (1 Sep 16:41)**
> "can you set it up in the frontend repo only that it sends the otp code to this email as well: <CC_EMAIL>"
- Template: `In [repo] only, make [message type] also go to [recipient]. Keep it configurable.`

**P42 — Device-specific bug with screenshots + round (1 Sep 17:17)**
> "i faced an issue with the front end build we made the in-built browser wasn't able to install the app not sure why but when chrome was used it worked fine. i have screenshots as well. [suffix, at least 5 questions]"

**P43 — Retest result + stronger requirement (1 Sep 18:32)**
> "On samsung internet Play Protect still blocks it. screenshot added - it marking it as unsafe is very bad for business. the coming-soon page and app: the whites on the "A" and wordmark doesnt look properly white now but when i switch to light mode it was all good. i want you to configure it in a way that its always white regardless of phone dark/light mode settings. [suffix, at least 5 questions]"
- Template: `Retest on [device]: [fix 1] still fails [screenshot] — [business impact]. [Fix 2] still wrong in [mode] but fine in [other mode]. I want [absolute requirement] regardless of [setting]. [suffix]`

**P44 — Short override answers** — "i want the fix it", "nopes i dont want a play store app", "Ship both repos now", "lets do frontend first - i ll test it manually and then if it works we can implement on backend as well."

**P45 — Identity/avatar bug + round (2 Sep 21:41)**
> "for the front end part we made - can you check that profile photo isnt right like for the demo and my account i see the same profile pic. if i login with gmail it should get my picture too and if there is not profile picture added then it should be users initials written. also the email i see for demo profile is same as mine. [suffix, at least 10 questions]"
- Achieved: Claude inspected code first so questions were grounded in actual root causes.
- Template: `In [repo], [element] is wrong: [observed]. Expected: [rule 1], [fallback rule]. Also [related data leak]. [suffix]`

**P46 — Recovery after API errors**: "Try again" (28 Aug 03:39, 1 Sep 02:45, 1 Sep 19:40) — resumes the interrupted turn.

---

## 4. Working method

### Question rounds with recommended options
- Every significant step started with a round via the multiple-choice question tool: **one question at a time**, 2–4 options, the recommended one labelled "(Recommended)" with a one-line why. Counts requested: 20 (got 24), 25 (got 32), 5, 5, 6, 7, 3 (got 5), 5, 5, 10.
- You used the free-text "Other" answer to (a) override ("Demo becomes editable too", "Neon Object Storage", "Always allow"), (b) widen scope ("everything else possible"), (c) add new requirements mid-round (background build visibility, one-time consent, stuck avatar), (d) ask to re-ask a question in plainer words, (e) pause or change phase ("let not do step 2 now"), (f) answer with context ("i top it up already").
- Claude adapted follow-ups to answers (e.g., after "demo editable" asked how to keep it presentable; after "Always allow" + refinement recorded the exact message rule; after "no Play Store app" re-framed the remaining levers honestly).
- Claude sometimes **inspected the code before asking** so questions were grounded (profile photo round).
- After a round Claude **wrote the decisions into a committed scope doc** (`STEP-1.5-SCOPE.md`) and summarised them.
- Honesty pattern: Claude stated limits plainly ("we cannot stop Play Protect from flagging Samsung's own packaging", "the API caps polycount at 1.5M", "image models have zero free-tier quota").

### Staged delivery
- Step 1.5 shipped as three staged deploys (A/B/C), each: build → full local pyramid → commit → push (auto-deploy) → watch Vercel + CI in background → live verification on production domains → report with "things for you to try" → you test on phone → fixes folded into next stage.
- Round 4 you chose one combined deploy.

### Verification pyramid (every change)
1. Typecheck + production builds of both apps.
2. Vitest unit/component suite.
3. Playwright e2e (mobile + desktop projects) against production builds started by Playwright's `webServer`.
4. Commit/push → GitHub Actions CI runs the same.
5. Watch Vercel deployments to READY.
6. **Live verification scripts** against the real domain (node fetch with demo cookie / admin session cookie; Playwright screenshots).
7. **Mutation/round-trip proofs**: change a DB row or admin config → observe the live API/UI → revert.
8. **Phone retest guide** for things only a real device proves (install banners, Samsung dark mode, push badge, camera): numbered steps including clearing site data.
- Real paid APIs (Tripo, Gemini) mocked in CI/e2e (`TRIPO_MOCK=1`, `GEMINI_MOCK=1`); exercised once live per deploy, then data cleaned up.

### Background watchers
- After each push Claude started background poll loops for Vercel deployments and the CI run, kept working (memory updates, preparing verification scripts), and reported when they landed. Also a "connectivity watcher" when internet dropped.

### Commit/push rules
- Push via inline-token HTTPS URL, token never stored in git config, redacted in output.
- Front-end repo commits carried an AI co-author trailer (allowed there at that time); from 1 Sep the **backend repo must have no AI attribution** at all — commit messages, trailers, docs, comments. The current standing rule for the guide: **no AI attribution in client repos**.
- Avoid double quotes inside `git commit -m` on PowerShell (argument parsing broke).
- Check `git add -A` didn't sweep scratch scripts (happened twice: `rebuild.mjs`, `reseed-products.ts`, a leftover in the cleanup commit) → follow-up removal commit.
- Commit identity = your GitHub account.

### Staging / production separation
- Production (`assemble.ink`) keeps deploying from the frozen front-end repo; new work goes to the backend repo → staging projects + Neon `staging` branch. Production cutover only on your explicit instruction ("never switch … I'll tell you later").
- Fixes needed on production (Samsung, OTP CC) went to the front-end repo first, then were **mirrored** to the backend repo (copy unchanged files, hand-merge diverged ones like `Modals.tsx`) so they aren't lost at cutover.
- CI isolated on its own Neon branches (`ci` for front-end, `ci-backend` for backend).

### Memory and context
- Claude updated project memory files after each stage ("saving Stage C state to memory") and recorded gotchas (never run `next dev` + `next start` in same dir; migrations on both branches; `ci-backend` creds must not be re-pulled).
- Context ran out twice (28 Aug 11:34 during Stage A; 1 Sep 06:12 during Part B). The auto-summary listed intent, concepts, files, errors, all user messages, pending tasks and the exact next edit; Claude resumed mid-file without re-asking.

### Handling interruptions
- API connection errors ("Can't reach the API server … ENOTFOUND") three times → you typed "Try again".
- You interrupted a turn once to re-send a fuller message; and once for tool use at the end of scope.
- Machine internet loss during e2e → Claude set a watcher and resumed at reconnection.

### Hygiene reminders
- Claude repeatedly reminded: delete the Vercel token after use, rotate the GitHub PAT, treat pasted Google secret/Resend key as rotatable, top up Tripo wallet before live tests.

### Test data discipline
- Demo profile = user id 1, reset by `db:reset-demo` before e2e and nightly by cron.
- Test accounts (`buddy@test.local`, `storer@test.local`) recreated in global setup and deleted in global teardown (with their bucket files).
- After live tests Claude deleted test signups and reset demo; stats exclude demo.

---

## 5. Services and access

| Service | What was created | Access given to Claude / when | Stored where | Verified how | Problems |
|---|---|---|---|---|---|
| **GitHub** | Private repo `Assemble_Frontend_v1` (28 Aug, created by you, empty, no README); later `Assemble_Backend_v1` (1 Sep) | Classic PAT `<GITHUB_PAT>` pasted in chat earlier in the project; reused for pushes; **`workflow` scope added by you 28 Aug 04:33** so `.github/workflows/ci.yml` could be pushed | Never stored: used inline in push URL each time, redacted | Push success; CI runs appeared | Push of workflow file rejected without `workflow` scope. Claude recommended a fine-grained PAT limited to the repo (Contents + Workflows write). Rotation repeatedly recommended. |
| **GitHub Actions secrets** | Front-end repo: DB URL, auth, admin, storage, `AUTH_SECRET` (added after Stage B failure). Backend repo: 8 secrets (DB, auth, admin, storage) set 1 Sep 11:32 | Set by Claude (via API/CLI with the PAT) | Repo Actions secrets | Re-run workflow green | Backend repo CI failed on every commit until secrets set. `ci` branch secrets would be invalidated if env re-pulled for that branch (rotates storage creds). |
| **Vercel** | Projects `assemble-app` (root `apps/web`), `assemble-admin` (root `apps/admin`), `assemble-site` (root `apps/site`) 28 Aug; `assemble-staging-app`, `assemble-staging-admin` 1 Sep. Domains `assemble.ink`, `www` (308 → apex), `app.assemble.ink`, `admin.assemble.ink`. Cron job (daily 06:00 UTC demo reset / sweep / wallet check). | Token `<VERCEL_TOKEN>` pasted 28 Aug 02:02 (1-day expiry recommended). New token 1 Sep 03:59 after 403 | Not stored in repo; used inline | `GET` user/team; GitHub integration active; deployments READY; `curl` 200s | Old token started returning **403 "must re-authenticate to this scope"** for team writes (SAML team). Empty commits canceled by ignored-build-step. Env var changes need redeploy. |
| **Vercel env vars** | `DATABASE_URL` (app, production + preview), auth vars (`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`), `RESEND_API_KEY`, `EMAIL_FROM`, Sentry DSNs, `NEXT_PUBLIC_POSTHOG_KEY`, `TRIPO_API_KEY`, admin `ADMIN_PASSWORD` (hashed)/`ADMIN_EMAIL`/`ADMIN_EMAIL_CC`/`ADMIN_SESSION_SECRET`, VAPID keys on both projects, `CRON_SECRET`, storage `AWS_*`. Staging: staging-branch DB + `GEMINI_API_KEY` (staging only). | via API `POST /v10/projects/{id}/env`, `PATCH` by env id | Vercel | Live checks | — |
| **DNS (Hostinger)** | CNAME `app` → `cname.vercel-dns.com`, CNAME `admin` → same; apex/www already on Vercel. Resend records (Tokyo region CNAME-style + SPF/DKIM) | You added at hPanel → Domains → DNS | Registrar | Claude polled resolution + HTTPS; Resend "Verified" screenshot | Registrar auto-appends the domain to "Name" (enter `send`, not `send.assemble.ink`); DKIM must paste on one line. |
| **Neon (Postgres)** | Project `assemble` (`<NEON_PROJECT_ID>`), org `<NEON_ORG_ID>`, region us-east-2; branches `production`, `ci` (28 Aug 17:50), `staging` (1 Sep), `ci-backend` (1 Sep 11:32, forked from staging). You toggled "Postgres on, everything else off" when creating. | Neon agent skills + Neon CLI with **browser OAuth** you approved (28 Aug 04:19); Neon MCP server registered for Claude Code/Cursor/VS Code (OAuth on first interactive use) | `.neon` link file (gitignored); `apps/web/.env.local` via `neon env pull` (gitignored); `backend/.env.ci-backend` (gitignored) | Schema push, seed counts, mutation proof on production | drizzle-kit push wants to rebuild existing PK → use direct SQL migrations. `neon env pull --branch` rotates storage (AWS-style) creds → breaks GitHub secrets. ci branch drifted behind migrations. |
| **Neon Object Storage** (beta) | Private bucket `assemble` per branch (production, ci, staging, ci-backend) — provisioned via `neon.ts` preview buckets + `neon deploy`, env `AWS_*` pulled | Same CLI auth | `.env.local` | Smoke test put/get; live 201 upload + GLB served via proxy | Beta; only supported in some regions (project happened to be in one). |
| **Google OAuth** | Google Cloud project "Assemble", External consent screen, published; Web client "Assemble Web"; JS origins `https://app.assemble.ink`, `http://localhost:3000`; redirect URIs `…/api/auth/callback/google` for both | You pasted client ID + secret 28 Aug 05:53 | Env only | Live providers endpoint lists `google, credentials` | Google sign-in doesn't work on staging `.vercel.app` URLs (not in redirect list). |
| **Resend** | Account; API key "assemble-web" (sending access); domain `assemble.ink` verified 28 Aug ~10:13 | Key pasted 28 Aug 05:53 | Env | Test email "domain sending is live"; live signup to random gmail `{"ok":true}` | Sandbox until domain verified: delivers only to account owner's address. |
| **PostHog** | US Cloud project "Assemble" | Project API key (public client key) pasted 28 Aug | Env `NEXT_PUBLIC_…`, host us.i.posthog.com | Pageviews | — |
| **Sentry** | Org + projects `assemble-app` and `assemble-admin` (Next.js) | Two DSNs pasted 28 Aug | Env | Builds with instrumentation, crash screen | — |
| **Tripo 3D** (platform.tripo3d.ai, API separate from Studio) | API key "assemble-app" (28 Aug 11:14); wallet 0 → you topped up (600); new engine account + key 1 Sep (600 usable + 5,000 reserved/frozen) | Keys pasted in chat | `TRIPO_API_KEY` in `.env.local` + Vercel (app + admin) | `GET https://api.tripo3d.ai/v2/openapi/user/balance`; upload probe; live builds | Advertised free credits showed 0; API credits separate from Studio subscription; polycount API ceiling 1.5M; default orientation sideways; max build ≈ 55–60 engine credits. |
| **Google Gemini (AI Studio)** | API key in AI Studio (1 Sep 04:58) | Pasted in chat (masked in archive) | Backend `.env.local` + staging Vercel only (not production) | Model list call + smoke generation; live staging match/detect/pack | Image models: **zero free-tier quota** → "quota exceeded" until billing enabled (later enabled per memory 10 Sep). |
| **Web Push (VAPID)** | Keys generated locally with `web-push`; `push_subscriptions` table | — | Env on both Vercel projects | Tray notifications on phone | Android status bar needs monochrome transparent badge PNG. |
| **Neon agent skills** | `.agents/skills/neon`, `neon-postgres` symlinked for Claude Code, committed | — | Repo | — | — |
| **Claude Browser pane / launch.json** | `assemble-web`, `assemble-admin` configurations | — | `.claude/launch.json` (removed from backend copy in sweep) | — | Pane blocked external navigation → used local Playwright for production screenshots. |

Tokens-in-chat handling rule used: inline only, never saved, redacted in outputs; recommend short expiry and deletion/rotation after use.

---

## 6. Commands and CLI

Exact commands where the archive shows them; otherwise the pattern described. Secrets masked.

### Git
```bash
git init                                  # inside front end/
git add -A && git commit -m "Initial commit"   # 54c5985, 264 files
git remote add origin https://github.com/<GITHUB_USER>/Assemble_Frontend_v1.git
git push https://<GITHUB_USER>:<GITHUB_PAT>@github.com/<GITHUB_USER>/Assemble_Frontend_v1.git main   # inline token, not stored
```
- Backend: `robocopy "front end" backend /E /XD node_modules .next .git ...` (robocopy exit code 1 = files copied = success), attribution sweep, `git init`, single initial commit under your identity, push to `Assemble_Backend_v1`.
- Avoid embedded double quotes in `-m` on PowerShell.

### Vercel REST API (with `Authorization: Bearer <VERCEL_TOKEN>`, `?teamId=<VERCEL_TEAM_ID>`)
- `GET /v2/user`, team listing — verify token.
- `POST /v10/projects` — create project with `rootDirectory`, `framework`, `gitRepository {type:"github", repo}`, `installCommand`, `buildCommand`, `outputDirectory`.
- `POST /v13/deployments` — first deployment needs the repo's numeric GitHub ID: `{name, gitSource:{type:"github", repoId, ref:"main"}, target:"production"}`; redeploy: `POST /v13/deployments?teamId=…&forceNew=1 {name, deploymentId, target:"production"}`.
- `GET /v6/deployments?projectId=…` — poll for `READY`/`ERROR`; build logs via deployment events endpoint.
- `POST /v10/projects/{id}/domains` / domain move from old project (remove from `assemble-coming-soon-page`, add to `assemble-site`).
- `POST /v10/projects/{id}/env`, `PATCH /v9/projects/{id}/env/{envId}` — set/update env vars.
- Project build settings used after fixing failures: app/admin `installCommand: "cd ../.. && npm install"`, `buildCommand: "npm run build"`; site: echo commands, `outputDirectory: "."`.
- Ignored Build Step in dashboard: `npx turbo-ignore`.

### DNS/HTTPS checks
```bash
nslookup app.assemble.ink        # / dig — poll until CNAME resolves
curl -sI https://app.assemble.ink   # expect 200 + valid cert
curl -s https://app.assemble.ink/api/products    # mutation-proof check
curl -s https://app.assemble.ink/api/version     # build SHA
```

### Neon
```bash
npx skills add neondatabase/agent-skills -s neon -s neon-postgres -y
npm i -g neonctl
neon auth                              # browser OAuth
neon link --project-id <NEON_PROJECT_ID> --org-id <NEON_ORG_ID>   # writes .neon
neon env pull --file apps/web/.env.local
neon deploy                            # provisions preview buckets declared in neon.ts
neon branches create --name ci          # (and staging, ci-backend; bucket branches with DB)
```
- WARNING: `neon env pull --branch <ci-branch>` rotates the storage credentials and invalidates GitHub secrets — save branch creds once (`backend/.env.ci-backend`).

### Drizzle / DB scripts
```bash
npm run db:push --workspace @assemble/db        # schema push (works for fresh tables; fails on PK introspection quirk)
npm run db:seed --workspace @assemble/db
DATABASE_URL=<NEON_DATABASE_URL> npm run db:reset-demo --workspace @assemble/db
node packages/db/migrations/001-step15-foundations.mjs   # direct SQL migrations (001, 002 usernames/notifications, 003 angle_photos …)
```
- Scripts as `.mjs` files reading env parsed from `.env.local`; use `DATABASE_URL_UNPOOLED` for DDL.
- One-off TypeScript scripts need `.mts` (top-level await fails in CJS `.ts` under tsx).
- Scratchpad scripts can't resolve repo `node_modules` → copy into repo, run, delete (and don't commit).
- Mutation proof SQL: `UPDATE products SET price='$29 (LIVE-DB-PROOF)' WHERE …` → check live API → revert.

### Tests
```bash
npx vitest run                      # apps/web/tests (24 → 29 → 38 → 42)
npx playwright test                 # tools/e2e (27 → 32 → 38 → 43 → 46 → 50 → 53/54 → 56)
npx playwright install chromium
```
- Kill stale servers on :3000/:3001 before Playwright (PowerShell `Get-NetTCPConnection -LocalPort 3000 | Stop-Process`, or equivalent).
- Build both apps first: `npm run build` (turbo) — build takes several minutes (~6–8 min observed incl. both apps).

### GitHub Actions / gh
```bash
gh run list --repo <GITHUB_USER>/Assemble_Backend_v1
gh run view <run-id> --log-failed
gh run rerun <run-id> --failed
gh secret set DATABASE_URL --repo … --body "<NEON_DATABASE_URL>"
```
(or equivalent REST calls with the PAT; poll loops in bash).

### Tripo
- `GET https://api.tripo3d.ai/v2/openapi/user/balance` with `Authorization: Bearer <TRIPO_API_KEY>` — balance + frozen.
- Upload endpoint probe, task create (`multiview_to_model` / image-to-model with `model_version`, `geometry_quality`, `texture_quality`, `pbr`, `quad`, `face_limit`, `orientation`), task status poll.

### Gemini
- `GET https://generativelanguage.googleapis.com/v1beta/models?key=…` (sent as header in code) — list models.
- `POST …/models/{model}:generateContent` with `systemInstruction`, `generationConfig.responseMimeType: "application/json"`, `responseSchema`; images via `inlineData`; image output `responseModalities: ["IMAGE"]`.

### glTF rotation (data fix)
- Node script with `@gltf-transform/core` `NodeIO`: read GLB, premultiply root node rotation by quaternion `[0, -√½, 0, √½]` (−90° around Y), write to a NEW key, upload to bucket via S3 PutObject, update avatar row, clear thumbnail.

### Bucket cleanup
- S3-compatible `ListObjectsV2` + `DeleteObjects` using `AWS_*` from `.env.local`; keep `u1/` (demo) and your user prefix.

### Web push keys
```bash
npx web-push generate-vapid-keys
```

### PowerShell/Windows notes
- Inline `node -e` with quotes breaks → always write script files.
- Python unavailable (Permission denied) → use node or individual edits.

---

## 7. Testing and verification

### Suite growth
| Point | Unit (Vitest) | E2E (Playwright) | Notes |
|---|---|---|---|
| 28 Aug 04:11 | 24 | 27 passed (3 mobile-only skip on desktop) | first pyramid |
| 28 Aug 06:21 (auth) | 24 | 27 | real auth added, demo path kept for e2e |
| 28 Aug 10:38 (update toast) | 29 | 27 | decision-logic tests for update toast |
| Stage A 12:18 | 29 | 38 (32 then +admin↔user round-trip file) | |
| Stage B 16:53 | 29 | 43 | cross-account social with second real account |
| Stage C 17:42 | 29 | 46 | storage + 3D spec on dedicated account |
| Round 4 19:58 | 29 | 50 | real-camera specs with fake camera feed |
| Samsung round front-end | 29 | 53 | 3 PWA specs |
| Backend 04:46 | 29 | 50 | against staging branch |
| Step 2A 05:32 | 38 | 54 | 9 prompt/validation unit tests |
| Part B 06:32 | 42 | 56 passed, 26 expected skips | render + packing specs |

### What unit tests covered
Credit spending/gating/usage-log cap, chip toggles, toast wiring, seed-data integrity (every saved look exists, product ids match, 28-item closet, image-map coverage), component tests (radio/multi chips, OrbitMark ring asserting `assemble`×2 at 60 orbs, InstallCard hiding when installed), update-toast decision logic, AI prompt builders/validators (detect clamps to taxonomy, match prompt content, validateOutfit id/name resolution, closet-only stripping of shop items, to-buy counting), packing prompt/validation.

### What e2e covered
login → home; generation spends a credit; out-of-credit gates; purchase updates balance; Plus gating; swap → render bar; match path context line; back-history stack (anti ping-pong); horizontal-overflow sweeps; admin login → 2FA → dashboard; PWA endpoints/banner/dismissal memory; route gating; fresh account empty state; admin config change reflected in user app; cross-account request→accept, share→vote→notification, ticket→admin reply→notification, broadcast; uploads + 3D generation (mocked engine) + refund; real camera via fake device; back sweep of tricky flows; manifest fields, color-scheme meta, Samsung banner copy (UA emulation + synthetic `beforeinstallprompt`); AI match persists 2 looks; closet-only 422 for empty closet; generate→results→detail→why UI flow; detection free allowance; in-place refine; render caching; swap re-render charging; packing lifecycle.

### Playwright configuration lessons
- Mobile project: `{...devices["iPhone 13"], browserName: "chromium"}` (WebKit not installed).
- `webServer` starts both production servers; env `TRIPO_MOCK=1`, `GEMINI_MOCK=1`.
- `beforeEach` `addInitScript` sets localStorage `assemble-install-dismissed` so the banner doesn't intercept clicks.
- Demo access via cookie (`assemble-demo=1`) with `addCookies` once middleware gated routes.
- `globalSetup`: reset demo profile, recreate `buddy@test.local` and `storer@test.local` (throwaway password). `globalTeardown`: delete them + bucket files.
- Camera: headless shell lacks getUserMedia → `channel: "chromium"` + `--use-fake-device-for-media-stream --use-fake-ui-for-media-stream` + `permissions: ["camera"]`.
- `workers: 2` (full Chromium overloaded the laptop).
- `test.slow()` for login + polling specs; login `waitForURL(..., {waitUntil: "commit"})`.
- Idempotent retry loops for pre-hydration clicks (check state before re-clicking; retries once double-spent credits and once over-clicked back past history start).
- Cross-file races (spec files in parallel share the demo balance) → event-based assertions (ledger row count +1, balance within range), `ensureCredits(page, min)` helper buying a pack via live package id, dedicated accounts per stateful spec file.
- CI `retries: 1` re-runs stateful specs → tolerant assertions (`[201, 409]`, conditional 402 checks, dynamic skips), `.first()` locators tolerant of duplicates.

### Test databases
- Initially local e2e ran against the production DB (demo profile reset each run).
- `ci` Neon branch for front-end CI (after live-test collision); `staging` branch for backend local runs; `ci-backend` for backend CI.
- Local front-end e2e still used production DB with auto-cleanup (your choice), so demo reset after local runs ("Resetting the production demo (the local suite runs against it)").

### Live verification examples
- Stage A: 13/13 checks — gating redirect, demo path, seeded wardrobe, fresh account (3 starter credits, 0/5 checklist, empty states), admin locked (401s), admin write round-trip.
- Stage B: temp second account friend request + share delivered + search; cron endpoint 200 with secret / 401 without; help articles; screenshot of Saved gate.
- Stage C: full real Tripo trace (upload 201 → charge 8 → progress → ~50 s → 6.4 MB GLB via proxy → rename/delete removes file) and cleanup.
- Round 4: 10 live checks + dashboard screenshot.
- Tripo key rotation: production verification build (43.7 MB GLB) then cleanup.
- Step 2A on staging with real Gemini: match 10.8 s, detect 14 s; Part B: match 9.8 s, packing 5.9 s, save/delete; image model quota error surfaced.
- Admin OTP CC: real email sent, response listed both recipients (masked).
- Samsung: live manifest + meta tags + detection script present on all three domains; device retest by you.

### Targeted vs full runs
- Almost every change ran the full pyramid (per your rule). A rebuild "cached from the successful run" was accepted after a network interruption (typecheck + unit had passed just before).

---

## 8. Security

- **Tokens in chat:** inline use only, never persisted, redacted in output; recommended 1-day Vercel token expiry and deletion after use; repeated PAT rotation reminders; fine-grained PAT scoped to a single repo recommended.
- **Secrets only in env files** (`.env.local`, `.env.ci-backend` — gitignored) + Vercel env + GitHub Actions secrets; `.neon` link file gitignored; Neon CLI auto-added env file to `.gitignore` (checked before commit: "no secrets committed").
- **Neon kept Postgres-only**, other services disabled.
- **Auth:** Auth.js v5, JWT sessions, `trustHost`; bcrypt password hashing; OTP codes sha256-hashed, 10-minute expiry, resend supported, wrong/expired rejected; Google OAuth with restricted origins/redirects.
- **Resend domain verification** (SPF/DKIM; DMARC suggested) — sender on own domain.
- **Route gating middleware**: all pages except an explicit open list require an Auth.js session cookie (`authjs.session-token` / `__Secure-authjs.session-token`) or the explicit demo cookie; API routes use `getCurrentUser()` and return 401; suspended users rejected.
- **Ownership checks** on every user-scoped PATCH/DELETE; server is the source of truth for credits (spend validated against live config, 402 when insufficient).
- **Admin panel locked** once it wrote live config: password checked against hashed env secret, emailed 6-digit 2FA code, short session cookie signed with `ADMIN_SESSION_SECRET`; admin APIs 401 without session. 2FA recipients configurable (`ADMIN_EMAIL`, `ADMIN_EMAIL_CC`).
- **Admin config validation**: numeric fields validated; model-id strings accepted only matching `/^[a-z0-9.-]{3,64}$/i`.
- **Cron endpoint protected by secret** (200 with, 401 without).
- **Private storage bucket**: per-user key prefix `u{id}/`; all reads through authenticated proxy `/api/storage/[...key]` that only serves the caller's own prefix; hard account delete removes storage objects too.
- **Spend guardrails**: in-app credits + per-user daily caps (3D and AI), charge-upfront-refund-on-failure, token usage logging, engine wallet display + low-wallet alert (threshold 200).
- **Hard delete** of accounts on request (GDPR-friendly).
- **Test isolation**: CI on separate DB branches so tests can't mutate production; test accounts auto-deleted; stray signups purged.
- **Demo password** is a harmless sentinel (revealing it via the eye toggle is fine).
- **Admin stats exclude demo/test accounts**.
- **No AI attribution** in the client-facing backend repo (commits, docs, comments); internal docs and `.claude/` removed.
- **Dependency note:** Samsung "Play Protect" warning is a trust/security perception issue; mitigated by steering installs to Chrome rather than triggering Samsung's WebAPK flow.
- Weak spot to flag for the guide: secrets and the admin password were pasted in chat and repeated in compaction summaries/archives; a test password shared in chat; the admin password recalled from chat (use a password manager).

---

## 9. Pitfalls

1. **Hydration error only on your machine**
   - Symptom: React #418 hydration mismatch locally; Playwright checks passed.
   - Cause: Windows Reduced Motion on; route transition templates rendered differently server vs client; Playwright forces motion on.
   - Fix: first paint static (module-level `hydrated` flag), animate only on client-side navigation, still honouring reduced motion.
   - Prevent: test with `prefers-reduced-motion: reduce` emulation too.

2. **`next dev` clobbered running `next start`**
   - Symptom: running production server lost its chunks.
   - Cause: both write `.next` in the same app dir.
   - Fix: rebuild + restart. Prevent: never run dev and start from the same directory at once; kill stale servers before rebuilds/tests.

3. **Vercel monorepo builds failed**
   - Symptom: all three first deployments ERROR.
   - Cause: Turbo 2.x requires `"packageManager"` in root `package.json`; default monorepo install under-installed workspace (`npm install --prefix=../..`).
   - Fix: `"packageManager": "npm@11.14.1"`; install `cd ../.. && npm install`; build `npm run build`; static site with no install/build and output `.`.
   - Prevent: set these before first import.

4. **Subdomains verified but not resolving**
   - Cause: Vercel verifies ownership but DNS for `app`/`admin` didn't exist at registrar.
   - Fix: add CNAMEs at Hostinger; propagation ~4 min. Prevent: check where DNS is hosted first.

5. **Browser pane refused external URLs** → use local Playwright for production screenshots.

6. **Logo port missed the second word** — extraction sampled only ring ends. Fix: extract every element; prevent: compare element counts/text programmatically.

7. **3D looked shiny and stuttered** — `<model-viewer>` PBR + IBL. Fix: port prototype viewer. Later **detail missing** — Lambert discards normal/AO maps; fix `MeshStandardMaterial` roughness 1 keeping maps. Prevent: A/B render actual asset before blaming the generator.

8. **Back button ping-pong** — back buttons pushed new entries. Fix: `router.back()` when in-app history, explicit target only for deep links; e2e guard.

9. **"Install isn't available" when already installed** — needed `related_applications` + `getInstalledRelatedApps()`; needs reinstall from same origin after deploy.

10. **CI workflow push rejected** — PAT lacked `workflow` scope. Fix: add scope. Also the CI file got swept into later commits while blocked → excluded until scope added.

11. **Mobile e2e all failing** — device profile defaults to WebKit not installed → force chromium.

12. **E2E clicks intercepted** — install banner overlays the top bar → dismiss via localStorage init script. Also ambiguous selectors ("53" matched twice; hidden desktop-rail counter matched `.first()`).

13. **drizzle-kit push wants to rebuild existing PK** — introspection quirk. Fix: additive direct SQL migration scripts (`.mjs`). Prevent: use migrations, not push, after first deploy.

14. **PowerShell quoting** — `node -e` and `git commit -m` with embedded quotes break → script files, no quotes in messages.

15. **Resend sandbox** — OTP only to owner email until domain verified. Registrar name-field doubling and DKIM truncation are the common verification failures.

16. **Tripo wallet 0 despite "free credits"** — API credits separate from Studio; top up before live testing. Later: subscription credits appear as "frozen/reserved".

17. **Context ran out mid-edit** — file left non-compiling (match page referenced removed imports). The compaction summary flagged "CRITICAL INCOMPLETE STATE" and the resume fixed it. Prevent: keep edits compiling; rely on detailed summaries.

18. **`useAppConfig` never fetched** — `initialData` + `staleTime` suppressed fetch for 5 minutes → packages list empty. Fix: don't combine initialData with long staleTime for server-truth data (or set `initialDataUpdatedAt: 0`).

19. **Retry-clicks double-spent credits; balance read from stale store mirror** — make retries idempotent; read balance from server.

20. **Stage B CI failed** — cross-account login specs needed `AUTH_SECRET` in Actions. Fix: add secret + wire in workflow.

21. **Test account reappears in production DB** — e2e global setup creates `buddy@test.local`. Fix eventually: teardown deletes test accounts + files; CI on separate branch.

22. **Live Tripo test failed** — a CI run reset the production demo profile mid-test (shared DB). Fix: dedicated Neon `ci` branch (DB + bucket). Prevent: never share a DB between CI and live verification.

23. **Stateful spec files racing** — pack purchase in one file vs out-of-credits test in another. Fix: dedicated accounts per spec file, event-based assertions, `ensureCredits`.

24. **Cumulative timeouts** — login + polling exceed 60 s default → `test.slow()`.

25. **Headless shell has no camera** — `NotSupportedError` on getUserMedia → `channel: "chromium"` + fake device flags. Then **machine overload** → `workers: 2`.

26. **Internet dropped mid-e2e** — mass failures; watcher resumed. Prevent: rerun before diagnosing.

27. **CI branch missing new column** (`angle_photos`) — ci branch created before migration 003. Fix: apply migrations to every branch. Prevent: migration checklist lists all branches (production, ci, staging, ci-backend).

28. **Background 3D build never completed** — polling lived on the progress screen only. Fix: gallery takes over polling + nightly server-side orphan sweep + completion lib shared.

29. **Push status bar icon white square** — Android badge must be monochrome transparent; thin brand strokes vanish at 24 px → bold geometric "A" silhouette.

30. **Admin dashboard fake numbers (312 signups)** — prototype fixtures. Fix: stats endpoint from DB excluding demo.

31. **Helper script committed** (`rebuild.mjs`, `reseed-products.ts`, leftover in cleanup) — `git add -A` sweeps scratch files. Fix: removal commit. Prevent: scratch outside repo or review `git status` before commit.

32. **Duplicate demo rows on ci branch** from a half-crashed CI setup → reset branch + duplicate-tolerant locator.

33. **Avatars sideways** — engine default orientation. Fix: `orientation: "align_image"`; rotate existing GLBs with glTF-Transform.

34. **Rotated avatars still sideways for you** — immutable cache on proxy + overwrite to same URL; thumbnails re-captured from cached copy. Fix: new keys + clear thumbnails. Prevent: never overwrite bucket keys; unique key per version.

35. **Rename not saving on mobile** — saved only on Enter. Fix: save on blur.

36. **Login `waitForURL` timeouts under load** — waiting for full "load" event → `waitUntil: "commit"`.

37. **Stale package id after DB reset** — serial ids continue after reseed → always fetch live ids from `/api/config`.

38. **`.ts` script top-level await fails** — use `.mts`.

39. **Vercel token 403 "must re-authenticate to this scope"** — SAML team aged out the token's write authorization. Fix: new token. Prevent: verify with one API call before relying on it.

40. **Empty commit deploys CANCELED** — ignored build step skips no-change commits. Fix: redeploy API (`forceNew=1` with deploymentId or gitSource). Also turbo-ignore cancelled admin deploy when only web changed (expected).

41. **Env var change not live** — needs redeploy.

42. **Backend repo CI failing since creation** — no Actions secrets copied with the code. Fix: dedicated `ci-backend` branch + 8 secrets. Prevent: when cloning a repo into a new remote, list and re-create all Actions secrets on day one.

43. **`neon env pull --branch` rotates storage creds** — invalidates GitHub secrets. Fix/prevent: save branch creds once in a gitignored file; never re-pull for that branch.

44. **Gemini image models "quota exceeded"** — free tier has zero image quota. Fix: enable billing on the AI Studio project; meanwhile graceful fallback (item mosaic + "you weren't charged" copy instead of raw Google error).

45. **Google sign-in fails on staging** — staging URLs not in OAuth redirect URIs. Accept or add staging URIs.

46. **Samsung Internet install blocked by Play Protect** — Samsung's WebAPK packaging targets old Android; manifest hardening didn't help. Fix: detect Samsung Internet and replace install with Chrome guide sheet. Prevent: test installs on Samsung Internet early; decide on TWA if store presence acceptable.

47. **Whites look grey on Samsung dark mode** — "Dark mode on websites" darkens light gradient backgrounds used with `background-clip: text`; `color-scheme: dark` meta insufficient. Fix: `.sbrowser` class → flat white fill; `<meta name="color-scheme" content="only light">` opt-out (form controls kept dark). Prevent: avoid gradient-clipped text for key brand marks or provide flat fallbacks.

48. **Cached old manifest on device** — tell tester to clear site data before retesting.

49. **API server unreachable (ENOTFOUND)** — three times; "Try again" resumed.

50. **Profile photo same for everyone / demo showed your email** — hardcoded avatar path, no image column, seed/demo identity problems. Fix (in progress at scope end): image column, initials fallback, upload, neutral demo identity.

51. **Secrets pasted into chat end up in archives and compaction summaries** — symptom: raw keys visible in chat archive and summary blocks. Prevent: use short-lived tokens, paste into env files yourself or via a secure prompt; rotate everything used in chat; run a secret mask pass on archives.

---

## 10. Code and templates worth reusing

Paths are relative to the monorepo (`front end/` = frozen frontend repo; `backend/` = Step 2 repo at `D:\Documents\Deep Learn HQ\Clients\<client-folder>\UI\backend`). Do not modify them — reference only.

### Monorepo & deploy
- `package.json` (root) — `"packageManager": "npm@11.14.1"`, turbo scripts.
- `apps/site/index.html`, `apps/site/package.json`, `apps/site/vercel.json` — static site as a zero-build Vercel project inside a monorepo.
- `README.md` — three-project deployment map (rewritten client-presentable in backend).
- `.claude/launch.json` — preview server configs `assemble-web` (3000), `assemble-admin` (3001) (front end only).
- `neon.ts` — `defineConfig({})` declaring used Neon services; later `preview.buckets` for Object Storage.
- `.agents/skills/neon`, `.agents/skills/neon-postgres` — installed agent skills.
- `.neon` (gitignored) — CLI link to project/branch.
- `vercel.json` in apps/web — cron schedule (daily 06:00 UTC) for demo reset/sweep/wallet check.

### CI & tests
- `.github/workflows/ci.yml` — vitest → build both apps → Playwright e2e; uploads Playwright traces on failure; secrets from repo.
- `playwright.config.ts` — mobile (iPhone 13 forced chromium) + desktop projects; `webServer` starting both production servers with `TRIPO_MOCK=1`, `GEMINI_MOCK=1`; `channel: "chromium"`, fake camera flags, `permissions: ["camera"]`, `workers: 2`, `retries: 1` on CI; globalSetup/globalTeardown.
- `tools/e2e/*.spec.ts` — flows, PWA (manifest fields, color-scheme meta, Samsung banner copy via UA + synthetic `beforeinstallprompt`), admin↔user round trip, social cross-account, storage/3D, camera, `ai.spec.ts` (5+ specs, `ensureCredits` helper).
- `apps/web/tests/*.test.ts(x)` — Vitest unit/component incl. `aiPrompts.test.ts`.
- Global setup/teardown files — reset demo, create/delete test accounts and their bucket files.

### Database
- `packages/db/src/schema.ts` — Drizzle schema; `AppConfigData`, `DEFAULT_CONFIG`, `DEMO_USER_ID = 1`, `CONFIG_STRING_KEYS`.
- `packages/db/src/data.ts` — typed seeds.
- `packages/db/migrations/001-step15-foundations.mjs` — direct-SQL additive migration pattern: `users.suspended`; tables `app_config` (id=1 jsonb), `credit_packages`, `taxonomy`, `help_articles`, `brands`, `campaigns`, `wear_history`, `push_subscriptions`; seeded defaults (gen 1, detect 1, freeDetections 10, starter 3, pack list 10, refine 1, swap render 1, 3D 8/15 + 2, daily cap 25, minClosetItems 4; 3 packages; 68 taxonomy rows; 4 articles; 3 brands; 2 campaigns). Later migrations: 002 usernames + notification timestamps; 003 `angle_photos`; 3D consent/free-retry fields; (Step 2) AI config keys.
- `db:reset-demo` script — deterministic demo reset; core of nightly cron.

### Web app server layer
- `apps/web/auth.ts` — Auth.js v5 Google + Credentials, starter credits on first sign-in.
- `apps/web/app/api/auth/signup/route.ts`, OTP send/verify routes — hashed codes, Resend branded email.
- `apps/web/lib/serverUser.ts` — `getCurrentUser()` (session → user row, rejects suspended; else demo cookie → user 1; else null) + `unauthorized()`.
- `apps/web/middleware.ts` — page gating with open-page allowlist and matcher exclusions.
- `apps/web/app/api/demo/route.ts` — POST sets/DELETE clears demo cookie (30 days).
- CRUD routes: `api/items`, `api/items/[id]`, `api/me`, `api/config` (public config + packages + grouped taxonomy + campaigns), `api/credits` (spend/pack/subscribe with 402), `api/outfits` (+ `?all=1`), `api/outfits/[id]`, `api/collections`, `api/wear`, social (`friends`, `shares`, responses, user search), `notifications`, push subscribe, tickets, `api/version`.
- Storage: storage lib + `/api/storage/[...key]` auth proxy (own prefix, immutable cache), upload route.
- Tripo: client lib, generate route, status route, shared job-completion lib (used by status route + nightly sweep), avatars API.
- Notify + push lib (`web-push`, VAPID).
- Step 2 (backend): `apps/web/lib/gemini.ts` (`geminiMocked()`, `generateJson<T>()`, `generateImage()`), `apps/web/lib/aiPrompts.ts` (DETECT/MATCH/PACK schemas, prompt builders, validators that prevent invented items), `apps/web/lib/aiGuards.ts` (`liveConfig`, `underAiDailyCap`, `charge`, `refund`), `app/api/ai/detect/route.ts`, `app/api/ai/match/route.ts`, `app/api/ai/render/route.ts`, `app/api/ai/pack/route.ts`.

### Web app client layer
- `apps/web/lib/api.ts` — `fetchJson`, `apiSend`, hooks `useMe`, `useAppConfig`, `useItems`, `useMyOutfits`, `useAllLooks`, `useMyCollections`, `useLedger`, `useInvalidate`, catalog hooks.
- `apps/web/lib/credits.ts` — `useCredits()` spend/buyPack/subscribe with 402 → buy sheet.
- `apps/web/lib/looks.ts`, `apps/web/lib/store.ts` (zustand UI mirror; password excluded from persistence).
- `apps/web/components/Providers.tsx` — `ServerSync` mirroring server truth into store.
- `apps/web/components/Modals.tsx` — all modals wired to API.
- `apps/web/components/A3DView.tsx` — Three.js matte viewer (studio rig, ACES 1.8, OrbitControls, Draco decoder, loading bar, tools, cache; material keeping normal/AO maps).
- `InstallCard` component, install banner (`.pwabar`), iOS instructions sheet, Samsung Chrome-guide sheet, update toast (`.pwabar.bottom`).
- `public/sw.js` (push handlers, badge), `manifest` (id, scope, display_override, orientation, maskable icons, related_applications), monochrome badge PNG.
- Shared `Ph` photo component (contain + blurred backdrop), password input with eye toggle, PLUS/PRO chip, upload progress ring, context-aware camera screen, `LookThumb` (mosaic or render) + `wornImg()` helper.

### Admin app
- Admin auth helper + middleware, login route (password + emailed code, `ADMIN_EMAIL_CC`), `app/api/admin/config/route.ts` (numeric + validated string keys), panels (AI costs/limits + model selectors + wallet, packages, taxonomy, products, users, brands, articles, campaigns, tickets, broadcasts), `app/api/admin/stats/route.ts` (dashboard tiles, 14-day chart, simulated revenue, top spenders, 4-week reports, AI 7-day usage).

### Documents
- `STEP-1.5-SCOPE.md` (front end only; deleted from backend) — template for a committed decision record after a question round.
- Memory files under the Claude projects memory directory (assemble-project etc.) — running state + gotchas.
- `backend/.env.ci-backend` (gitignored) — saved CI branch credentials.

### Reusable patterns (to generalise in the guide)
- **Mutation proof**: change a row directly → hit live API → revert.
- **Admin round-trip proof**: change config via admin API → observe user app → revert.
- **Paid-engine pattern**: mock flag in tests; start route creates job row + external task; client polls status route; server downloads result into own storage with unique key; charge upfront, refund on failure; daily cap; wallet balance + low-wallet alert; nightly orphan sweep.
- **AI output validation**: JSON schema output + server validator that resolves references to real owned items and drops invented ones.
- **Environment ladder**: production DB branch / ci branch / staging branch / ci-backend branch, each with its own bucket.

---

## 11. Session running

- **Model**: Claude Code (Opus-class) in a single long session spanning 28 Aug → 2 Sep, with two automatic context compactions (28 Aug 11:34 during Stage A client wiring; 1 Sep 06:12 during Part B). Each summary preserved intent, file-level state, errors, all user messages, and a precise next step; resume instruction "continue without asking questions".
- **Durations observed**:
  - Vercel builds ~1–2 min per app; site near-instant; DNS propagation ~4 min; Resend verification minutes.
  - CI runs: first front-end runs a few minutes; later 5m09s, 5m49s; backend 7m25s (with a flaky retry), 4m57s.
  - Local production builds of both apps ~6–8 min (e.g., 11:45 → 11:53; 16:41 → 16:49; 19:02 → 19:10).
  - Local e2e suite: ~10–20 min with debugging; full Chromium channel runs heavy; round 4 e2e 19:10 → 19:58 including flake fixes and an internet outage.
  - Stage A ≈ 11:16 → 12:25 (with compaction); Stage B ≈ 16:27 → 17:05; Stage C ≈ 17:09 → 17:57; round 4 ≈ 18:45 → 20:12; backend workspace setup ≈ 04:26 → 04:52; Step 2A ≈ 04:59 → 05:36; Part B ≈ 06:05 → 06:41.
  - Tripo: standard build ~50 s; max-quality builds "several minutes", ~43 MB GLBs, ~55–60 engine credits.
  - Gemini: match ~10 s, detection ~14 s, packing ~6 s.
- **Background tasks**: Vercel deployment poll loops, CI run monitors, live Tripo generation watcher, connectivity watcher, e2e suite run in background while Claude swept code. Claude kept working (memory, verification scripts, backend mirroring) while watchers ran and reported on completion.
- **Parallel tracks**: front-end e2e + backend mirroring concurrently (1 Sep 19:44–19:59); backend e2e + production deploys concurrently.
- **Interruptions**: three API connectivity errors resolved by "Try again"; one user interrupt to re-send a fuller message; one interrupt at scope end.
- **Machine limits**: Windows laptop; no WebKit for Playwright; Python unavailable; full Chromium e2e overloaded CPU → workers 2; PowerShell quoting issues → script files.
- **Two workspaces/repos in parallel** from 1 Sep: `front end/` (production, frozen except urgent fixes) and `backend/` (staging, Step 2), with fixes mirrored.
- **Long autonomous runs** requested explicitly ("complete the whole app without stopping") — Claude still ran a short question round first, then built, tested, deployed to staging and reported with remaining blockers (Gemini billing).
