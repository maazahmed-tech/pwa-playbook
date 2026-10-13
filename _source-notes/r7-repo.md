# Source notes r7 — the repositories, documents, workflow scripts, briefs and memory

Scope: the code and documents (not the chats). Read for these notes:

- Backend monorepo `UI\backend` (the Step 2 repo, git remote `Assemble_Backend_v1`, 41 commits from 2026-09-01 to 2026-09-17, tip `db4225c`): `README.md`, `CUTOVER-RUNBOOK.md`, `LAUNCH-READINESS.md` (about 10,000 words), `SECURITY.md`, `SECURITY-SUMMARY.md`, `CLIENT-HANDOVER-CHECKLIST.md`, every `package.json`, `package-lock.json` (exact installed versions), `turbo.json`, `apps/site/turbo.json`, `playwright.config.ts`, `apps/site/playwright.config.ts`, `apps/web/vitest.config.ts`, `apps/site/vitest.config.ts`, `.github/workflows/ci.yml`, `.github/dependabot.yml`, `neon.ts`, `.neon` (link file, no secret), `.gitignore`, `tools/security/*`, `tools/cutover/*`, `tools/e2e/*` (global-setup, global-teardown, db helpers, spec list), `tools/marketing/*` headers, `tools/verify.mjs`, `tools/screenshots.mjs`, `packages/db` (schema tables, migrations 001–017, seed, reset-demo, rateLimit, aiSpend), `apps/web/lib` (gemini, tripo, aiGuards, aiPrompts exports, rateLimit, storage, log, otp, email, push, serverUser), `apps/web/auth.ts`, both `middleware.ts`, both `next.config.mjs`, `apps/*/vercel.json`, Sentry configs, `apps/web/app/api/cron/*`, `apps/web/tests/routeInventory.test.ts`, `sqlScan.test.ts`, `copy.test.ts`, `apps/admin/lib` (adminSession, adminOtp, configLock, describe), `apps/admin/app` tree, `apps/site` tree and its build scripts, env files (variable NAMES only).
- `UI` folder docs: `PROJECT-HANDOFF.md`, `UI-Build-Playbook.md`, `Assemble - Tech Stack.md`, `README.md`, `Assemble - Image Brief.md`, `Assemble - Icon Brief.md`, `Assemble - Worn Looks Brief.md` (structure), `AI-COST-REPORT.md` (method only), `Assemble-Social-Launch-Proposal.md` (structure only).
- Structure and git history of `UI\front end` (Step 1 repo `Assemble_Frontend_v1`, 34 commits 2026-08-28 → 2026-09-03), `Wireframes\Version 1` (repo `Assemble_Wireframes_Version_1`), `UI` itself (repo `Assemble_UI_Version_1`), `coming soon page` (repo `assemble-coming-soon-page`), `twa-staging`, `Marketing`.
- Workflow scripts in `C:\Users\<you>\.claude\projects\D--Documents-Deep-Learn-HQ-Clients-<client-folder>-UI\ec0c6e90-…\workflows\scripts\` (8 scripts).
- Brief files `AGENT-*.md` (28 briefs, about 24,000 words) and helper scripts in the session scratchpad `C:\Users\<you>\AppData\Local\Temp\claude\D--Documents-Deep-Learn-HQ-Clients-<client-folder>-UI\ec0c6e90-…\scratchpad\`.
- All 16 memory notes in `C:\Users\<you>\.claude\projects\D--Documents-Deep-Learn-HQ-Clients-<client-folder>-UI\memory\`.
- `Project History\export-history.mjs`.

Secret handling in these notes: every token, key, password, database URL and project/team identifier is replaced with a placeholder such as `<VERCEL_TOKEN>`, `<GITHUB_PAT>`, `<NEON_PROJECT_ID>`, `<VERCEL_TEAM_ID>`, `<STAGING_APP_PROJECT_ID>`. The memory notes and a few scratchpad scripts contain real values — none of them are copied here. The GitHub owner account is written `<GITHUB_OWNER>`.

---

## 1. Timeline — dated milestones and what was delivered

Dates come from git logs, commit subjects, memory notes and document stamps.

### Pre-build
- **2026-07-10** — coming-soon page repo `assemble-coming-soon-page`: 10 commits in one day ("Add Assemble coming soon page", keep wordmark on one line on mobile, remove orbit thread loops, GPU-composited marquee ticker, custom cursor added then removed, early-access sticker and email form removed, reskin to acid-lime then softened to silver, background set to black). This page's `:root` CSS tokens, blob/grain/vignette background and CSS-3D orbit logo became the canonical brand source later.
- **2026-07-25** — 3D modelling session (a Tripo-generated GLB of the client, ~53 MB; later Draco-compressed to ~6 MB for the prototype).
- Logo concepts: two PDFs `Assemble-Logo-Design-Concepts.pdf` / `-2.pdf` in the client folder; chosen concept "Double Take" (thin capital A with two elliptical rings of the lowercase wordmark "assemble" orbiting it), received 2026-08-05.

### Wireframes (greyscale single-file prototype)
- **2026-07-14** — `Assemble_Wireframes_Version_1`: "Add Assemble wireframes v1 — combined greyscale prototype and flow charts"; `index.html` redirect added to fix a Vercel 404; final polish commit same day.
- **2026-07-15** — proposal gap items; social loop; `Assemble - Coverage.html` traceability matrix (230 proposal items mapped: 200 built / 9 partial / 21 out-of-scope); back-navigation loop fix; walkthrough page; UX friendliness passes; demo-placeholders branch merged.
- **2026-07-21** — presenter script; client revisions batch 1 and 2; plan model changes (3 starter credits replace free generations; Pro = 100 credits not unlimited; Saved looks at Plus; Surprise me / Pack for a trip Pro-only; Pro annual plan).
- **2026-07-22 / 07-25** — context-aware filters; closet-only match mode hides budget.
- **2026-08-04 / 08-05** — Personal 3D Avatar feature (Tripo-backed, engine name hidden from UI), one-time consent, share-with-me/by-me support, back-navigation fix, `PROJECT-HANDOFF.md` written (commit `049fcb4`).

### UI (branded single-file prototype) — repo `Assemble_UI_Version_1`
- **2026-08-05** — 30-decision redesign round; "Redesign v1: dark editorial brand system + cinematic interactions" (`e5a4491`), orbit marks, matte Three.js avatar viewer, AI-generated photo library wired in (contact sheets sliced into `img/`).
- **2026-08-06** — portrait 3D viewers, 2D avatar pipeline, multi-angle closet uploads, worn-look imagery auto-switch, paid AI detection, custom icon set (mask-tinted), data truth round (LOOKDB/PRODDB), admin icons, move-to-collection, intro avatar model (`4b24e57`), ring-fixed icons, Match screen redesigned around three numbered paths (`f5cf4e6`), "Add production tech stack decisions doc (17-question round)" (`1da474d`).
- **2026-08-20** — `UI-Build-Playbook.md` written (reusable process for building a branded prototype from a proposal).

### Full-stack frontend (Step 1 and Step 1.5) — repo `Assemble_Frontend_v1`, folder `UI\front end`
- **2026-08-06** — Turborepo built locally (apps/web 43 routes, apps/admin 14 routes, packages/ui, packages/db typed seeds); deployed to Vercel via API (three git-linked projects: app, admin, site); domains app./admin./apex moved.
- **2026-08-21** — `Assemble - Tech Stack.md` last edited (decided 2026-08-06 in a 17-question round).
- **2026-08-28** (34 commits in the repo start this day; history was re-created as a fresh repo) — monorepo published (`54c5985`); `packageManager` field added for Vercel/Turbo; coming-soon orbit logo copied exactly; PWA install prompts; model-viewer replaced by a Three.js port; data-access layer + full test pyramid (`be05706`); Neon Postgres wired (`b412985`); CI added (`81a0ff8`); real auth — Auth.js + Google + Resend OTP + Sentry + PostHog (`2caac76`); update toast (`1ee7508`); `STEP-1.5-SCOPE.md` (24-decision round, `b7727b5`); Stage A per-user CRUD + admin auth + live config (`f03d9c8`); Stage B social + notifications + web push + nightly demo reset (`6249d9d`); Stage C Neon Object Storage uploads + real Tripo pipeline (`2b04ea2`); CI moved to a dedicated Neon `ci` branch (`f98f3b8`); Resend domain verified.
- **2026-08-29** — Round 4 (context-aware camera, photo fit, plan chips, live admin stats, background 3D builds); max-quality 3D engine settings + wallet guardrail (`eeb2653`); face-front orientation and matte finish that keeps detail maps (`0514c3c`).
- **2026-09-01** — e2e global teardown; CI retry-tolerant specs; 3D engine key rotated (env-only redeploy commits); low-wallet threshold 200; admin 2FA CC recipients.
- **2026-09-02 / 09-03** — Samsung Internet fixes; real profile pictures (`bfb41cb`, last commit on this repo; it stays the frozen production build on assemble.ink until cutover).

### Backend (Step 2) — repo `Assemble_Backend_v1`, folder `UI\backend`
- **2026-09-01** — fresh single-commit copy of the front end ("Assemble platform: customer PWA, admin panel, marketing site", `8db0952`); staging Vercel projects created and linked; real Gemini outfit matching and item detection (`591d5ac`); worn-look renders, from-outfit 3D, AI packing lists, closet-aware shop picks (`c050c86`); friendlier engine capacity messages; de-flaked pack purchase e2e.
- **2026-09-02 / 09-03** — Samsung Internet install guide; real profile pictures; render e2e de-flake.
- **2026-09-10** — profile photo upload; match around an item; public share links + real 3D in shares + lighter share avatars (41 MB → 3.9 MB); launch readiness "every control real, payments in test mode" (`9ee4234`); Gemini billing enabled on the agency key.
- **2026-09-11** — Digital Asset Links for the staging TWA; render fidelity + ranked swaps + piece removal; refusing multi-item/worn-outfit photos; category model; shop model and admin operations (push 2 of 3); audit fixes, help centre, closet filters, cutover tooling (push 3 of 3); cutover rehearsal on a production fork (migrations 004–011, verify all PASS).
- **2026-09-12** — both avatar photos kept; example 3D avatars become real rows; closet photo checks; duplicate warning; avatar-only sharing.
- **2026-09-13** — Google sign-in lands returning accounts on Home; sturdier account delete; avatar photo check; `CLIENT-HANDOVER-CHECKLIST.md` (`1d8679e`); security round (`6677cba`); demo profile renamed "Demo User".
- **2026-09-14** — landing page planning, round 1 and round 2 built (uncommitted until 09-16), preview deployed to a noindex Vercel project; exact backup of the live coming-soon page deployed to its own project; staging TWA test package built.
- **2026-09-15** — AI cost report (private artifact) with unit costs per feature.
- **2026-09-16** — launch site committed (`f275190`, 79 MB assets); pricing at the 70% rule (`c177626`, migration 014); batch 2 push A admin notifications / locked settings / broadcast history / profitability (`d1e209d`, migration 015); push B budget bands, wearable accessories, shorter onboarding, yearly plan wording (`0c1b0b4`, migration 016).
- **2026-09-17** — batch 3: one sign-in method per email, admin style lists drive the app, shared looks, suspension, dashboard AI charts (`ddc5496`, migration 017); render layering fix (`db4225c`); replication guide question round (16 questions) and this workflow.

### Pending
- Payments (Stripe) — not started; checkout is simulated and labelled "Test mode — you won't be charged". Monthly renewal credit grant belongs to the Stripe work.
- Production cutover — runbook written and rehearsed (004–011 on 2026-09-11); migrations 012–017 still pending on production; needs the client's own Gemini key, Tripo key, Resend domain on their account, Google OAuth redirect URIs, admin emails.
- Landing page domain move (assemble.ink from the old site project to the new one) — only after client approval AND live Stripe.

---

## 2. Decisions and why (as recorded in the documents)

### Architecture
- **Turborepo monorepo, one repo, three Vercel projects** (`apps/web` customer PWA :3000, `apps/admin` desktop admin :3001, `apps/site` marketing/landing) plus `packages/db` (Drizzle schema, seeds, maintenance scripts) and `packages/ui` (the prototype's design system CSS ported verbatim). Why (Tech Stack doc): clean separation and independent deploys — "the user's explicit choice".
- **Next.js + React + TypeScript**: biggest hiring pool, first-class on Vercel, server routes hold secrets, Capacitor-wrappable later.
- **One language end to end** (TypeScript across web, admin, schema, seeds, tests, jobs).
- **Neon Postgres, not Supabase.** The Tech Stack doc (08-06) planned "Neon free in Step 1, Supabase paid in Step 2" because Supabase's free tier pauses projects. Memory 2026-09-01: "Keep Neon (NO Supabase ever)". Neon Object Storage replaced the planned Supabase Storage (declared in `neon.ts`, S3-compatible, branch-scoped). `copy.test.ts` even bans the word "Supabase" from user-facing copy.
- **Drizzle ORM** — TypeScript-first, tiny, identical SQL on any Postgres ("the thing that makes Step 1 → Step 2 painless").
- **Every AI operation is an async job row from day one** (`generations` table: id, user_id, kind, status queued|running|ready|failed, input jsonb, result jsonb, credits_spent, cost_cents…). Screens never await a long call; client-driven polling. "Job queue deliberately undecided" and never needed: client polling + nightly cron sweep of orphaned builds.
- **Auth.js v5** (Google OAuth + email/password with 6-digit OTP via Resend), JWT sessions, no session table; `users.session_version` carried in the token so a password change / delete / suspension signs out every other device.
- **Admin auth separate from user auth**: env password (later scrypt hash in `admin_settings`) + 6-digit 2FA emailed code + server-side `admin_sessions` rows (7 days, revocable, "Log out everywhere").
- **TanStack Query + Zustand** — Query for server data with polling, Zustand for UI state (port of the prototype's `st` object).
- **3D viewer**: `<model-viewer>` was planned, then replaced (2026-08-28) by a Three.js port of the prototype viewer (matte material keeping normal/AO maps).
- **No RLS** — the database is never reached from a browser; one server role; every query filters by the signed-in user id; an attack suite proves isolation (SECURITY.md "Why there is no RLS").
- **No CSP this round** (needs an audit of inline styles and third-party scripts first); pentest and Vercel firewall rules left for cutover.
- **Rate limits in our own database** (`rate_limits` table, fixed window upsert) — "no new service".
- **Demo profile** (user id 1) is a shared, editable presentation profile, reset nightly by Vercel Cron; hidden from the public app (entered only by typing demo credentials where `NEXT_PUBLIC_DEMO_LOGIN=1`, or via `/demo`); renamed "Demo User" with `demo@example.com` (reserved domain never mailed).
- **Engines mocked everywhere in tests**: `GEMINI_MOCK=1`, `TRIPO_MOCK=1` (or a missing key) switch to deterministic simulated paths so CI and keyless environments exercise whole flows.
- **Branch-per-environment on Neon**: `production`, `staging` (backend dev + presentations), `ci-backend` (backend CI), `ci` (front-end CI), temporary forks for cutover rehearsal. Why: e2e resets demo data and creates/deletes accounts; a CI run once wiped a live production 3D build mid-poll when it shared the database.
- **Front-end repo frozen as production backup**; backend repo is a fresh single-commit copy so its history carries no AI attribution; production keeps deploying from the front-end repo until cutover.
- **Staging-only rule**: agency Gemini key on local + staging only; production waits for the client's own paid key.
- **PWA only at launch** (install from browser; Android TWA test package exists for staging); app stores later; PWA keeps 100% of credit revenue (no 30% store cut).
- **Landing site** = static Next.js export inside the backend monorepo (`apps/site`), its own Vercel project; prices read from the live `/api/config` at build time; cookieless PostHog; domain move only after client approval and live Stripe.

### Product and pricing (documented in LAUNCH-READINESS.md, runbook, handover checklist)
- "Every control either works end to end or is removed"; the only simulated area is payments, labelled "Test mode — you won't be charged".
- Pricing at the 70% margin rule (2026-09-16): a match 6 credits including the render of its first look (`looks.render_included`); second look on tap 5; render after swaps 5; refine 1; detection 1 after 10 free; packing list 3; 3D avatar 18 with one tier only; starter balance 18; avatar photo checks capped 10/day; auto-flag threshold 240; yearly plans grant 300 (Plus) / 1,000 (Pro) up front. Plan prices unchanged (Plus $6.99 / $59.90, Pro $14.99 / $149.90). Method in section 12 of AI-COST-REPORT (credits = ceil(cost × 1.25 allowance / ((1 − margin) × cheapest selling rate per credit))).
- **Save lock** on everything that changes what users pay or get: six-digit code emailed only to the owner (`ADMIN_EMAIL`), valid 10 minutes, a correct code unlocks locked saves for 15 minutes on that admin session, five wrong guesses lock saving for an hour; every change audited (`config_audit`) and alerted. Why: "nobody, including another admin or us, can change prices without you seeing a code arrive."
- **Admin alerts never reach a customer account** (own `admin_notifications` table, 90-day prune).
- **Broadcast audiences resolved on the server** from a description (everyone / plan / inactive N days / one account), never from ids the browser sends.
- **Profitability page** uses the real stored cost per AI call (`generations.cost_cents` in hundredths of a cent so sub-cent calls survive) × provider prices in config; revenue labelled "simulated until payments go live".
- **One sign-in method per email** (`users.auth_method`): closes the risk that Google sign-in verified someone else's unverified password account.
- **Suspension enforced on the server** (403 `{ code: "suspended" }` everywhere, session version bumped).
- **Hide, don't delete** shop products while referenced.
- **Receivers of shared looks see only the sharer's own pieces**; sharing an undrawn look draws it free.
- **Renders**: strict fidelity (every piece's closet photos attached, construction facts stated, verification pass after every render, one free "Render again" when the check fails); later: no two base tops, layer order stated, nothing copied from the avatar photo.
- **Key handover** from client via Bitwarden Send (expire after one day and one opening), never WhatsApp/SMS/email/chat.
- **Ownership split** (handover checklist): code, CI, hosting, database, monitoring stay with the agency; domain, Google Cloud/Gemini billing, 3D engine, email sending, Google sign-in, admin login, app-store and payment accounts in the client's name — "the AI, 3D and email services bill per use, so they should sit on your card and under your control".
- **Money written in dollars only**, never cents notation (user feedback 2026-09-16).
- **American English on the landing page** (US audience); the app was British then switched (task raised 2026-09-14).

### Process decisions
- **No AI attribution anywhere in the backend repo** (commits, comments, docs, tests) — client deliverable, explicit user rule. The earlier prototype repos used a Co-Authored-By trailer; the backend does not.
- **Every change passes the full pyramid before merge** (README): `npx vitest run` → `npm run build` → `npx playwright test`.
- Every LAUNCH-READINESS row is ticked only with the test that proves it.
- Migrations are additive and re-runnable, applied to staging + ci-backend on the day, production only at cutover after a fork rehearsal.
- The GitHub PAT initially lacked `workflow` scope, so CI changes were routed through `next.config.mjs` until the scope was added on 2026-09-13.

---

## 3. Reusable user prompts

The repository and documents contain few verbatim user messages; the chat readers cover these. What the documents preserve:

- **Bootstrap message for a new app session** (from `UI-Build-Playbook.md` §12, written 2026-08-20 as the user's reusable kickoff):
  > Read `UI-Build-Playbook.md` in this folder fully — it defines our process, architecture, design system, pipelines, and pitfalls. My proposal for the new app is `<path/file>`. The brand assets are `<paths, or "none — run the brand Q&A first">`. The GitHub repo is `<owner/repo>`; Vercel auto-deploys `main`. Start Phase 1: read the proposal and give me the screen inventory, roles, flows, and monetization map. Then run the Phase 2 decision round — ask at least 30 questions, one at a time, multiple choice, recommended option highlighted. Don't build until I say go.

  Achieved: a fresh session reproduces the prototype process. Template: `Read [PLAYBOOK].md fully… My proposal is [PATH]. Brand assets: [PATHS|none]. Repo [OWNER/REPO]; Vercel auto-deploys main. Start Phase 1 … ask at least [N] questions, one at a time, multiple choice, recommended option first. Don't build until I say go.`
- **Short form** at the top of the playbook: "Read UI-Build-Playbook.md fully, then read my proposal (attached / at <path>). Follow the playbook's process. Start with Phase 1."
- **Money style correction** (memory `money-in-dollars.md`, 2026-09-16): "dont write in [the cent sign] its confusing only in $". Template rule: "Write every amount in dollars ($0.164), never cents."
- **Guide question round request** (memory `replication-guide-task.md`, 2026-09-17, paraphrased in memory): before writing, "run a question round of at least 15 questions, one at a time, multiple choice with a highlighted recommendation and a short why, then discuss trade-offs and agree the plan with the user. Do not assume scope, format, audience or depth."
- **Targeted testing instruction** (memory `render-layering-fix.md`, 2026-09-17, paraphrased): "don't run the 2.5-hour suite" → typecheck + unit tests for the rule/prompts + only the match and render spec files + one real render on staging; full suite only in GitHub CI after push.
- **Step 2 hold** (memory 2026-08-29): "stop step 2 for now" mid-question-round — Claude recorded "do not start it unprompted".
- **Batch pacing** (memory 2026-09-16): "do not start anything new until told"; pushes A and B "consecutive, not a day apart".

The agent briefs encode the user's standing instructions as reusable rule blocks (quoted in section 10).

---

## 4. Working method (as visible in the code, briefs and scripts)

### Question rounds
- Every feature batch starts with a numbered question round: 17 questions (tech stack, 2026-08-06), 24 (Step 1.5 scope, 2026-08-28), 30 (redesign, 2026-08-05), 32 (round 4), 47 (round 5), 67 (round 6), 30 (share links), 25 (landing round 2), 16 (replication guide). Answers are stored in memory notes (`batch2-decisions.md`, `batch3-decisions.md`, `replication-guide-decisions.md`) and in scope docs (`STEP-1.5-SCOPE.md`).
- Format (Playbook §2): asked one at a time with the multiple-choice tool, 2–4 options, the recommended option first and marked "(Recommended)", a short why; answers often add scope, which becomes more questions; wait for "go".
- Decisions then become a "decisions (final, do not re-open)" section inside the agent brief.

### Briefs
- A shared brief per batch (`AGENT-COMMON.md`, `AGENT-BATCH2-COMMON.md`, `AGENT-SEC-COMMON.md`, `AGENT-FIX-COMMON.md`, `AGENT-PRICING-COMMON.md`, `AGENT-SITE-COMMON(-R2).md`) holds: repo map, hard rules, database rules, migration style, verification ladder, "where things already are (verified)", coordination contracts (exact API shapes), test conventions, report format.
- A per-push or per-agent brief (`AGENT-PUSH-A.md`, `AGENT-PUSH-B.md`, `AGENT-BATCH3.md`, `AGENT-A1.md`, `AGENT-G..K-BRIEF.md`, `AGENT-P/Q/R1/R2/R3/S/W1/W2.md`, `AGENT-SITE-BUILD/ASSETS(-R2).md`) holds numbered items, ownership set ("Files you own"), and the tests to add.
- Maps: `PRICING-MAP.md` (line-numbered map of every file reading or asserting old prices), `AUDIT-PLAN.md`, `AUDIT-WEB.md`, `AUDIT-ADMIN.md` (audit findings feeding fix agents).

### Multi-agent workflows (8 scripts)
Common shape: **Data → parallel Build on disjoint ownership sets against one API contract → Tests (full ladder) → adversarial Review with a JSON schema `{ refuted, defects[], notes }` → bounded fix loop (fixer → tests → re-review, max 2 rounds)**. Agents never commit; the main session commits and pushes. Reports are capped (under 50–80 lines). Previous agents' reports are passed forward truncated with `String(x).slice(0, N)`.

### Verification ladder (from briefs and README)
1. `npx tsc --noEmit -p apps/<app>/tsconfig.json` per app.
2. `npx vitest run` in apps/web (and apps/site).
3. `npx turbo run build` (all apps).
4. Free ports 3000/3001, then `E2E_DB=1 npx playwright test` (single worker, mocked engines; 30–45 minutes in September, described by the user as "the 2.5-hour suite" by 2026-09-17).
5. Push → GitHub Actions CI on `ci-backend`.
6. Vercel staging deploy (auto on push, or triggered by API) → live staging pass script (`live-*.mjs`) → phone retest guide sent in chat.
7. Targeted variant for small pushes: typecheck + relevant unit tests + only the affected spec files + one real paid call on staging.

### Commit and push rules
- Author identity set repo-locally to the GitHub owner account (Vercel blocks deploys from unknown commit authors).
- No AI attribution in the backend repo; commit message drafts kept in scratchpad files (`commit-msg-*.txt`) and used with `git commit -F`.
- One push per round (overlapping CI runs share `ci-backend` and collide; later a `concurrency: group: ci-backend` was added to the workflow).
- Push with an inline-token URL; never persist the token (`-u` avoided, no token in remotes, redact output, check `.git/config` afterwards) — Handoff §8.3.
- Verify the token before any push (curl GitHub API → 200).

### Staging-only and database rules (quoted rule blocks in briefs)
- "Databases: staging … and ci-backend … Never production. Never `neon env pull`."
- "Never call the real Gemini/Tripo APIs. Tests run with GEMINI_MOCK=1 TRIPO_MOCK=1."
- "Do not commit, push, stash, revert or change git state."
- "Don't end a turn while a build or test run is going: wait in the foreground."
- Machine-idle gate during e2e: other agents wait for a sentinel file `E2E-DONE` before running tsc/vitest (a run alongside other CPU work failed 30 tests on hydration timeouts).

### Parallel sessions
- Side tasks ran in separate git worktrees (`.claude/worktrees/affectionate-hodgkin`, `awesome-bohr`, `frosty-hopper`, `loving-merkle`) on branches such as `account-file-cleanup`, `fix/avatar-front-facing`, `e2e-fixture-cleanup`, raised as background task chips; "main tree is ours".

### Living documents
- `LAUNCH-READINESS.md` sections A–K grew per batch; `CUTOVER-RUNBOOK.md` gained each migration; `SECURITY.md` gained controls 21–26; prototype era: Coverage / Walkthrough / Presenter Script / in-app flowcharts synced every round.
- Memory notes updated at each milestone; the chat archive refreshed after each batch.

---

## 5. Services and access

For each: what was created, what Claude was given, where it is stored, how it was verified, what broke. No values.

### GitHub
- **Account**: `<GITHUB_OWNER>` (the developer's account). Repos (all private): `assemble-coming-soon-page`, `Assemble_Wireframes_Version_1` (+ `_Version_2` backup), `Assemble_UI_Version_1`, `Assemble_Frontend_v1` (Step 1, frozen production build), `Assemble_Backend_v1` (Step 2).
- **Access given to Claude**: a personal access token pasted in chat several times. Handoff §8.3 records the first one as "compromised — must be revoked/rotated" because it was pasted in plaintext. Later fine-grained token scopes recommended in memory: Contents read/write + Actions read on both repos; `workflow` scope needed to push `.github/workflows/*` (missing until 2026-09-13, so the CI file stayed unpushed in August and CI changes were routed through `next.config.mjs`).
- **Storage**: token never written to a file; used inline in the push URL (`https://<GITHUB_OWNER>:<GITHUB_PAT>@github.com/<GITHUB_OWNER>/<REPO>.git`) and as `GH_TOKEN` for `gh`. Local `gh` keyring was logged in as an unrelated account with no repo access — never usable.
- **Verification**: `curl -H "Authorization: Bearer <GITHUB_PAT>" https://api.github.com/repos/<GITHUB_OWNER>/Assemble_Backend_v1` → HTTP 200 before any push.
- **Expired/broke**: PAT died 2026-09-10 (401), replaced same day. Pushes failed silently inside chained commands.
- **GitHub Actions secrets** (set with `gh secret set` using `GH_TOKEN`): `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `AUTH_SECRET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION` — all pointing at the Neon CI branch.
- **Dependabot**: `.github/dependabot.yml` weekly (Monday 06:00 Europe/London) grouped minor+patch PRs, limit 5, prefix `deps`; Dependabot alerts and automated security fixes enabled on the repo via the API (2026-09-13). Side effect: Dependabot branches filled the Vercel build queue so `main` did not auto-deploy on 2026-09-16 (deploy triggered by API).

### Vercel
- **Team**: a SAML-backed team `<VERCEL_TEAM_ID>` (scope `<VERCEL_SCOPE>`).
- **Projects**:
  - Prototype era: the UI repo auto-deployed from `main`; the wireframes repo needed `index.html` at the root (Vercel 404 otherwise).
  - Step 1 (front-end repo, 2026-08-06): `assemble-site` (root `apps/site`, framework "Other", install/build `echo`, output `.`), `assemble-app` (root `apps/web`, Next.js), `assemble-admin` (root `apps/admin`, Next.js); install command `cd ../.. && npm install`, build `npm run build`. Domains: `assemble.ink` + `www` (308 to apex) → site; `app.assemble.ink` → app; `admin.assemble.ink` → admin. DNS at the registrar (Hostinger nameservers): apex A record to Vercel's IP, `www`/`app`/`admin` CNAME to `cname.vercel-dns.com`.
  - Step 2 (backend repo, 2026-09-01): `assemble-staging-app` (root `apps/web`, ~20 env vars) and `assemble-staging-admin` (root `apps/admin`, ~11 env vars) created via API and git-linked; URLs `assemble-staging-app.vercel.app`, `assemble-staging-admin.vercel.app`.
  - Landing: `assemble-site-preview` (not git-linked; direct file-upload deploys with an `X-Robots-Tag: noindex, nofollow` header); `assemble-coming-soon-backup` (exact copy of the live coming-soon page, 2026-09-14).
  - Production projects `assemble-app` / `assemble-admin` will be re-pointed to the backend repo at cutover (runbook step 5).
- **Access given to Claude**: a Vercel API token pasted in chat (four tokens over the project). Stored nowhere on disk except inline in throwaway scratchpad scripts (to be avoided — read from `VERCEL_TOKEN` env instead, as `poll-staging.mjs` and `push-admin-env.mjs` do).
- **Env vars**: set through `POST /v10/projects/<id>/env?teamId=…&upsert=true` with `{ key, value, type, target: ["production","preview"] }` (script `push-admin-env.mjs` copies bucket creds from `apps/web/.env.local` to the admin project). Env changes need a redeploy.
- **Cron**: `apps/web/vercel.json` `{"crons":[{"path":"/api/cron/reset-demo","schedule":"0 6 * * *"}]}`; Vercel sends `Authorization: Bearer <CRON_SECRET>`; cron only registers on deploy (check dashboard → project → Cron Jobs). `apps/site/vercel.json` `{"cleanUrls": true}`.
- **System env** used: `VERCEL_GIT_COMMIT_SHA` (baked as `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` for the update toast), `VERCEL` (to keep the demo login off hosted builds).
- **Verification**: one cheap call before relying on the token: `GET /v6/deployments?projectId=<id>&teamId=<team>&limit=1` must return a `deployments` array; fallback verification is live-URL checks (e.g. `/api/me` answering "Sign in to continue.").
- **Expired/broke**: team-scope writes return 403 "You must re-authenticate to this scope" (SAML) even while `/v2/user` still returns 200 — happened in August, 2026-09-02, 2026-09-10 and 2026-09-17. Empty "redeploy" commits get CANCELED by the ignored-build step → use the redeploy API. Default `npm install --prefix=../..` under-installed workspaces → custom install command. Turbo 2 refused workspace resolution without `"packageManager": "npm@11.14.1"`.

### Neon (Postgres + Object Storage)
- **Account/org**: agency Neon org `<NEON_ORG_ID>`, project `assemble` `<NEON_PROJECT_ID>`, region `us-east-2` (required for the Object Storage beta).
- **Branches**: `production` (serves assemble.ink via the front-end repo), `staging` (backend dev; `backend/.neon` link file checked out to it), `ci` (front-end CI, created 2026-08-28), `ci-backend` (backend CI, created 2026-09-01 from staging, own `assemble` bucket), `cutover-rehearsal` (fork of production 2026-09-11, deleted after).
- **CLI**: Neon CLI installed and OAuth-authorised (profile DEFAULT) — `neon` works for branches; `neonctl` hung and was abandoned. Neon agent skills installed in `front end/.agents/skills` and `.claude/skills` (`neon`, `neon-postgres`, `neon-object-storage`, from `neondatabase/agent-skills`, locked in `skills-lock.json`). Neon MCP server registered but needs OAuth in an interactive session.
- **Declaration**: `neon.ts` — `defineConfig({ preview: { buckets: { assemble: { access: "private" } } } })` from `@neon/config/v1`; `npx neon deploy` created the bucket and pulled `AWS_*` credentials; `neon env pull` validates the branch against the declaration.
- **Env**: `neon env pull --file apps/web/.env.local` (writes `NEON_BRANCH`, `DATABASE_URL` pooled, `DATABASE_URL_UNPOOLED`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, plus `NEON_AI_GATEWAY_TOKEN`/`NEON_AI_GATEWAY_BASE_URL` which the free plan does not serve). `.env.ci-backend` and `ci-branch.env` hold the CI branch values (gitignored; the CLI auto-gitignores pulled files).
- **Critical rule**: `neon env pull` for a branch **mints new AWS credentials**, invalidating the copies stored as GitHub secrets. So CI credentials are saved once in `backend/.env.ci-backend` and never re-pulled; if re-pulled, update every `AWS_*` + `DATABASE_URL` secret immediately.
- **Verification**: S3 smoke put/get/delete; live product price update reflected on `/api/products` then reverted; `tools/cutover/verify.mjs` PASS lines.
- **Storage use**: private bucket `assemble`, keys `u{userId}/{kind}/{uuid}.{ext}` (items, avatar photos, renders, `a3d/{genId}.glb`), public prefix `public/{product|ad}/…` for shop and advert images; served only through `/api/storage/[...key]` (owner prefix check, immutable cache headers).

### Google Cloud — Gemini API (AI Studio)
- **Created**: an AI Studio key on an agency-owned Google Cloud project (2026-09-01); billing enabled 2026-09-10 (free tier gave image models 0/day quota). Topped up again 2026-09-14 after running out (429 on all models; staging AI down; landing assets paused).
- **Given to Claude**: the key in chat. Stored in `apps/web/.env.local`, `apps/admin/.env.local` and staging Vercel projects only — never production.
- **Verified**: live renders on staging (match 10 s → render 9.8 s, 508 KB JPEG; cached re-request 0.7 s; paid swap re-render 6.5 s).
- **Cutover**: client creates their own project + billing + key + budget alerts at 50/90/100% (handover checklist item 1).
- Models in config (`packages/db/src/schema.ts` DEFAULT_CONFIG, switchable in admin, save-locked): `matchModel` and `detectModel` `gemini-3.5-flash`; `renderModel` `gemini-3-pro-image` ("higher-fidelity garment reproduction"); retired render models replaced by `tools/cutover/config.mjs`: `gemini-2.5-flash-image`, `gemini-2.5-flash-image-preview`, `gemini-3-flash-image`. (`ci-backend` briefly pinned `gemini-3.1-flash-image`, a known verify FAIL.)

### Google OAuth (Sign in with Google)
- OAuth consent screen External, app name, privacy/terms links, authorised domain; publish app (basic scopes only, no review); OAuth client "Web application" with redirect URIs `https://app.assemble.ink/api/auth/callback/google` and `https://assemble-staging-app.vercel.app/api/auth/callback/google` (no trailing slash). Env `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`. Staging Google login did not work until the staging callback was added (client action).

### Resend (email)
- Domain `assemble.ink` verified 2026-08-28 (region ap-northeast-1; DKIM + SPF records green). Before verification the sandbox sender `onboarding@resend.dev` only delivers to the Resend account owner.
- Env `RESEND_API_KEY`, `EMAIL_FROM="Assemble <verify@assemble.ink>"`. Senders: `sendOtpEmail` (sign-up/reset codes), `sendTicketEmail` (support created/replied, best-effort, skipped for `@test.local` and without a key), admin 2FA and save-lock codes (admin app `lib/email.ts`).
- Verified: production sign-up to a non-owner address returned ok.
- At cutover the client owns the Resend account (checklist item 4: add domain, DNS TXT + MX, create "Sending access" key restricted to the domain).

### Tripo (3D engine)
- Account + API key given in chat; wallet topped up (600 credits). Key rotated 2026-09-01 to a new account (env-only redeploy on both projects). Env `TRIPO_API_KEY` on web and admin (admin reads the wallet).
- Verified: real build on production 2026-08-28 (upload 201 → charge → engine ~50 s → 6.4 MB GLB in bucket → served as `model/gltf-binary`).
- Pricing facts verified from official pages (workflow `verify-pricing-model`): 60 credits per build at the app's settings, $0.01 per credit prepaid, failed tasks not charged, `consumed_credit` on `GET /task` reconciles spend.
- Never named in user-facing copy ("the 3D engine").

### Sentry and PostHog
- Sentry in both apps (`instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `global-error.tsx`), env `NEXT_PUBLIC_SENTRY_DSN` per app, `tracesSampleRate: 0.1`, `enabled` only with a DSN, `sendDefaultPii: false`, `beforeSend: scrubEvent`.
- PostHog web (`components/Analytics.tsx`, manual `$pageview`), env `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`; landing site uses cookieless PostHog in the same project (Turbo `env` list includes the keys) and carries utm/referrer into sign-up.

### Web Push (VAPID)
- Keys generated locally (`web-push`), env `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` on both projects; `CRON_SECRET` alongside. Service worker `public/sw.js` handles `push` and `notificationclick`; monochrome badge PNG generated with `pngjs`. iPhone push requires the installed PWA (iOS 16.4+).

### Android TWA (test)
- Built through PWABuilder's packaging service (`twa-build.mjs`: package id `ink.assemble.staging`, host the staging app, start `/home`, colours `#0F111F`, new signing key). Output in `D:\…\<client-folder>\twa-staging\`: `.apk`, `.aab`, `assetlinks.json`, signing key info and keystore (keep private). `apps/web/public/.well-known/assetlinks.json` published (commit `207d142`, 2026-09-11).

### Payments (Stripe) — not started
- Handover checklist item 9: client creates a Stripe account; restricted key with Checkout, Customers, Subscriptions and Webhooks permissions; test purchase with the client; remove the "Test mode" label. Monthly renewal grant to be built with a double-grant guard.

### Bitwarden Send (client key handover)
- Recommended in the handover checklist: text Send, expire in one day and after one opening, optional password shared by phone.

### Env variable inventory (names only)
- Root `.env.local` / `.env.ci-backend`: `NEON_BRANCH`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION`.
- `apps/web/.env.local`: the Neon set + `NEON_AI_GATEWAY_TOKEN`, `NEON_AI_GATEWAY_BASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_SENTRY_DSN`, `TRIPO_API_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`, `ADMIN_EMAIL`, `GEMINI_API_KEY`, `NEXT_PUBLIC_DEMO_LOGIN` (staging only).
- `apps/admin/.env.local`: `NEXT_PUBLIC_SENTRY_DSN`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ADMIN_EMAIL`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `TRIPO_API_KEY`, `DATABASE_URL`, the `AWS_*` set, `NEXT_PUBLIC_WEB_ORIGIN`, `NEXT_PUBLIC_APP_URL`, `GEMINI_API_KEY`; production also `ADMIN_EMAIL_CC`.
- Test-only runtime env: `GEMINI_MOCK=1`, `TRIPO_MOCK=1`, `E2E_DB=1`, `E2E_STORAGE=1` (set by global-setup), `CI`.
- Site build env: `SITE_APP_URL`, `SITE_CONFIG_URL`, PostHog keys.
- Production app list (runbook step 3) and admin list (step 4) are the authoritative cutover checklists; "Do not set `NEXT_PUBLIC_DEMO_LOGIN`" on production.

---

## 6. Commands and CLI

All secrets as placeholders. Paths relative to the backend repo root unless stated.

### Workspace and dev
```
npm install                                   # root; workspaces apps/* packages/*
npm run dev --workspace=@assemble/web          # customer app :3000
npm run dev --workspace=@assemble/admin        # admin :3001
npm run dev:web / npm run dev:admin            # root aliases
npx turbo run build                            # all apps (Turbo caches; site build cache off)
npx turbo run build --filter=@assemble/admin   # one app
npm run start --workspace=@assemble/web -- --keepAliveTimeout 60000   # production server (Playwright uses this)
npm run screenshots                            # node tools/screenshots.mjs (dev servers running)
node tools/verify.mjs                          # overflow @375 on 31 routes + interaction checks
```
Prototype era: `py -m http.server 8844 --bind 127.0.0.1` (Git-Bash `python` is a broken Windows Store stub), open with `?v=N` cache-buster; later a node dev server `.claude/dev-server.js` with `POST /save?name=x.jpg`, registered in `.claude/launch.json`.

### Tests
```
npx vitest run                                  # in apps/web (unit + component, jsdom)
npm run test --workspace=@assemble/web          # same, from root (CI)
npx tsc --noEmit -p apps/web/tsconfig.json      # typecheck per app
npx playwright install chromium --with-deps     # CI browser (full chromium, not headless shell)
E2E_DB=1 npx playwright test                    # full e2e, both projects, single worker
npx playwright test tools/e2e/security.spec.ts --project=mobile   # attack suite only
E2E_DB=1 npx playwright test tools/e2e/closet.spec.ts             # one spec
GEMINI_MOCK=1 npx playwright test tools/e2e/admin-catalog.spec.ts # before admin webServer got the mock env
cd apps/site && npm run build && npm run test:smoke   # static export + smoke (serves out/ on :3013)
cd apps/site && npx vitest run && npx tsc --noEmit
```
Before e2e on Windows, free leftover servers:
```
netstat -ano | grep ":300[01]"
taskkill //F //PID <pid> //T
```
Lighthouse (landing site): serve `out/` with `node tests/serve.mjs out 3013`, then `npx --yes lighthouse@12.8.2 <url>` with `CHROME_PATH` pointing at Playwright's chromium.

### Security
```
npm run security:secrets                          # node tools/security/scan-secrets.mjs --tree (exit 1 on hit)
node tools/security/scan-secrets.mjs --history    # every commit on every branch, masked
node tools/security/scan-secrets.mjs --history --strict
npm run security:audit                            # node tools/security/audit.mjs (npm audit --json gate)
npm audit fix
```

### Database (Neon + Drizzle + migrations)
```
npx neon branches create --name ci                       # front-end CI branch (2026-08-28)
neon env pull --branch ci --file ci-branch.env           # WARNING: rotates the branch's AWS creds
neon env pull --file apps/web/.env.local                 # linked branch env
npx neon deploy                                          # applies neon.ts (creates the bucket)
neon branches create --project-id <NEON_PROJECT_ID> --parent production --name cutover-rehearsal
neon connection-string cutover-rehearsal --project-id <NEON_PROJECT_ID>
neon branches delete cutover-rehearsal --project-id <NEON_PROJECT_ID>
neon branches create --parent production --name pre-cutover-backup      # restore point at cutover
cd packages/db && npm run db:push       # drizzle-kit push (used with the UNPOOLED url in Step 1)
cd packages/db && npm run db:seed       # tsx src/seed.ts
cd packages/db && npm run db:reset-demo # tsx src/reset-demo.ts
node packages/db/migrations/013-security.mjs              # from repo root; DATABASE_URL env or apps/web/.env.local
DATABASE_URL=<target> node tools/cutover/config.mjs       # idempotent config row update
DATABASE_URL=<target> node tools/cutover/verify.mjs       # PASS/FAIL lines, exit 1 on FAIL
```
Cutover migration order (runbook): 004, 005, 006, 007, 008, 009, 009b, 010, 011, then 012, 013, 014, 015 (and 016, 017 added after), then `config.mjs`, then `verify.mjs`; stop on the first FAIL.

One-off TypeScript scripts: run with `tsx` as `.mts` (plain `.ts` failed with top-level await under tsx's CJS mode).

### Git
```
git config user.name <GITHUB_OWNER>; git config user.email <OWNER_EMAIL>   # repo-local identity (Vercel author check)
git add <paths>; git commit -F <scratchpad>/commit-msg.txt                   # no AI trailer in backend repo
git push https://<GITHUB_OWNER>:<GITHUB_PAT>@github.com/<GITHUB_OWNER>/Assemble_Backend_v1.git main
curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer <GITHUB_PAT>" https://api.github.com/repos/<GITHUB_OWNER>/Assemble_Backend_v1
GH_TOKEN=<GITHUB_PAT> gh secret set DATABASE_URL --repo <GITHUB_OWNER>/Assemble_Backend_v1 < value-file
git log -p --all                                 # used by the history secret scan
```
Step 2 workspace creation (2026-09-01): `robocopy` of `front end` into `backend` excluding `node_modules`, `.next`, `.git`, test artifacts, `.agents`; then `git init` and one fresh commit.

### Vercel REST API (curl/fetch; token from env)
```
GET  https://api.vercel.com/v6/deployments?projectId=<PROJECT_ID>&teamId=<TEAM_ID>&limit=1      # token check / poll
GET  https://api.vercel.com/v13/deployments/<DEPLOYMENT_ID>?teamId=<TEAM_ID>                   # readyState
POST https://api.vercel.com/v13/deployments?teamId=<TEAM_ID>&forceNew=1
     { name, project: <PROJECT_ID>, target: "production", gitSource: { type: "github", repoId: <REPO_ID>, ref: "main", sha } }
POST https://api.vercel.com/v13/deployments?teamId=<TEAM_ID>&forceNew=1
     { name, deploymentId: <LATEST_READY_PROD_ID>, target: "production" }                     # redeploy after env change
POST https://api.vercel.com/v10/projects/<PROJECT_ID>/env?teamId=<TEAM_ID>&upsert=true
     { key, value, type: "plain"|"encrypted", target: ["production","preview"] }
POST https://api.vercel.com/v2/files   (x-vercel-digest: <sha1>)  then
POST https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1  { name, target, files:[{file,sha,size}], projectSettings:{framework:null,…} }   # static upload deploy (site preview)
```
Scripts: `poll-staging.mjs <sha>` (waits for app + admin deployments of one commit), `deploy-b3.mjs <sha>` (triggers both staging deployments from a git sha and polls), `site-deploy.mjs` (env `VT`, `TEAM`, `OUT`, `NAME`; uploads `apps/site/out` with a noindex `vercel.json`), `push-admin-env.mjs`.

### Live checks
```
curl https://assemble-staging-app.vercel.app/api/config        # plans, render model, safety flag, campaigns
curl https://assemble-staging-app.vercel.app/api/me            # "Sign in to continue." without a session
POST /api/demo → cookie assemble-demo=1 → /api/me, /api/outfits?all=1, /api/ai/match, /api/ai/render
GET  /api/storage/u1/item/x.jpg → 401 (private);  /api/storage/public/nothing.jpg → 404 (public prefix open)
```
Scripts: `live-pass.mjs`, `live-push1/2/3.mjs`, `live-security.mjs`, `live-round5/7.mjs`, `live-pricing.cjs`, `live-site-r2.cjs` (copy rules, broken images, QR laptop-only, sticky bar, lazy 3D canvas, overflow).

### Chat archive
```
node export-history.mjs      # Project History; writes chats/<date>-<name>.md, prints a summary table
```

### Marketing asset tools (staging only)
```
node tools/marketing/accounts.mjs
node tools/marketing/stylists.mjs candidates sasha | finish sasha=2 marcus=1 | redo sasha side
node tools/marketing/wardrobe.mjs generate|add|regen|favourites sasha
node tools/marketing/avatar.mjs sasha
node tools/marketing/looks.mjs match|curate|hero sasha [lookId]
node tools/marketing/social.mjs friends|share|link|avatar3d|shop|pack …
node tools/marketing/export.mjs reasons|hero|why|models …
node tools/marketing/capture.mjs [account] [screens…]
node tools/marketing/capture-long.mjs [account] [screens…] | check3d
node tools/marketing/rail.mjs plan|export
node tools/marketing/manifest.mjs
node tools/marketing/og.mjs
cd apps/site && npm run assets   # node scripts/build-images.mjs && node scripts/build-3d.mjs
```

---

## 7. Testing and verification

### The pyramid (README, Tech Stack doc)
- Vitest (unit) + Testing Library (component) + Playwright (e2e) "in CI on every push"; user's explicit choice of a full pyramid.
- Growth of the suite: Step 1 closeout 24 unit + 27 e2e (2026-08-06) → 29 unit + 38 e2e (Stage A) → 43 passed/13 skipped (Stage B) → 46/16 (Stage C) → 50 e2e (round 4) → 38 unit + 54 e2e (Step 2A, 2026-09-01) → 211 e2e passed before the pricing push (2026-09-16) → 222 (push A) → 230 (push B) → 243 e2e passed / 0 failed with vitest 448 (batch 3, 2026-09-17) → 456 unit (render fix).
- Current counts in the tree: 325 `test(` calls across 30 spec files (each runs in the `mobile` and `desktop` projects unless skipped); 456 `it`/`test` cases in 42 `apps/web/tests` files; 57 in `apps/site/tests/unit` (6 files) + a smoke spec.

### Unit and component (apps/web/tests, 42 files)
Pure logic lives in `lib/` so it is testable. Files: `adminSaves`, `ads`, `aiPrompts`, `aiSpend`, `budget`, `categories`, `components` (tsx), `configLock`, `constructionChips` (tsx), `constructionSummary`, `copy`, `duplicates`, `garmentFacts`, `legal`, `log`, `matchPrompt`, `matchRequest`, `onboarding`, `packingEssentials`, `password`, `plans`, `progress`, `rateLimit`, `relTime`, `renderPrompt`, `routeInventory`, `seeds`, `shareLinks`, `sharedLooks`, `shopFilters`, `signInRules`, `sqlScan`, `store`, `styleLists`, `suspended`, `swapRank`, `uploads`, `validate`, `version`, `wearStats`, `wearability`, `whyLine` (tsx).
- Config: `vitest.config.ts` jsdom, globals, `@vitejs/plugin-react`, aliases `@` → apps/web and `@assemble/db/schema`, `@assemble/db/server`, `@assemble/db` → package sources (subpath aliases listed first "or a bare alias swallows them").
- Guard-style unit tests that fail the build: `copy.test.ts` (bans roadmap/prototype/card-fixture wording: "Step 2", "later phase", "(demo)", "coming soon", "Supabase", "prototype", "4242", "Last payment failed", "we'll email you"… across both apps' app/components/lib), `routeInventory.test.ts`, `sqlScan.test.ts`, `legal.test.ts` (no placeholder wording), `seeds.test.ts` (demo wardrobe integrity).
- The Google side of sign-in cannot be driven in a browser test, so `signInRules.test.ts` unit-tests the callback decision.

### E2E (tools/e2e, Playwright 1.62.1)
- **Config** (`playwright.config.ts`): `testDir ./tools/e2e`; `globalSetup`/`globalTeardown`; timeout 60 s; `workers: 1` ("spec files share the demo and test accounts … running two at once makes them race and report false failures"); `retries: CI ? 1 : 0`; reporter `github` in CI else `list`; `trace: "retain-on-failure"`; projects `mobile` (iPhone 13 device, `browserName: chromium`, `channel: "chromium"` because the headless shell has no `getUserMedia`, `permissions: ["camera"]`, launch args `--use-fake-ui-for-media-devices --use-fake-device-for-media-stream`) and `desktop` (1280×800, same camera flags); two `webServer`s running `next start` for web (:3000, env `TRIPO_MOCK=1 GEMINI_MOCK=1`) and admin (:3001, env `GEMINI_MOCK=1` for the product describer), `--keepAliveTimeout 60000` (idle-socket ECONNRESETs were the recurring flake), `reuseExistingServer: false` ("a server left over from an earlier run would test a stale build").
- **Global setup** (`global-setup.ts`): resolves `DATABASE_URL` from env (CI) or `apps/web/.env.local`; sets `E2E_STORAGE=1` if bucket creds exist; loads `ADMIN_SESSION_SECRET` from `apps/admin/.env.local` (specs mint the admin cookie directly); loads `CRON_SECRET`; without a DB it logs "DB specs will self-skip" and returns; otherwise runs `resetDemo(url)`, clears test rate-limit counters, deletes and recreates 14 throwaway accounts on `@test.local` with a bcrypt hash and 18 credits, each dedicated to one spec family to avoid races: `buddy` (social), `storer` (storage/3D), `changer` (password change), `prober` + `victim` (attack suite), `checker` (photo-check cap), `payer` (yearly subscription), `newbie` (set-up screens), `styler` (match budget/accessory rules), `lister` (admin lists), `googler` (made a Google account: `auth_method='google'`, no password), `suspendee`, `giver` + `taker` (shared looks); sets `E2E_DB=1`.
- **Rate-limit hygiene**: `TEST_RATE_LIMIT_PATTERNS` (`%test.local%`, TEST-NET `%203.0.113.%`, device ids `%:d:d-ratelimit-%`, `%admin-save%`) plus `u<id>` keys are deleted so back-to-back runs never start locked out.
- **Global teardown**: deletes every `%@test.local` account with explicit per-table deletes (share_responses, content_reports, blocks, shares, wear_history, push_subscriptions, items, looks, collections, friends, credit_ledger, generations, avatars_3d, packing_lists, tickets, notifications, saved_products, product_feedback) and their bucket objects under `u<id>/` (S3 `ListObjectsV2` + `DeleteObject`, best-effort).
- **DB helpers** (`tools/e2e/db.ts`): `query(text, params)` via the Neon HTTP driver; `plantPricedCall(userId, kind, costUnits)` (mocked engines report zero tokens, so money specs plant one priced call); `removeGeneration`; `plantSaveCode(sessionId, code)` (hashes a save-lock code the way the panel stores it, since email can't be read); `clearSaveCodes`; `customerNotificationsMatching(userId, fragment)` (proves admin alerts never reach a customer); `DEMO_USER = 1`.
- **House conventions** (AGENT-COMMON): `const hasDb = !!process.env.E2E_DB; test.skip(!hasDb, "needs DATABASE_URL")`; `test.describe.configure({ mode: "serial" })` and mobile-only skip for anything mutating shared accounts; demo cookie `{ name: "assemble-demo", value: "1", url }`; admin cookie `assemble-admin=<ADMIN_SESSION_SECRET>`; `localStorage.setItem("assemble-install-dismissed","1")` via `addInitScript` (the install banner intercepts top-bar clicks); assert ledger events not exact balances; `.first()` for repeated text; idempotent click retries (`clickUntil`) guarded on current state; API-first checks with `page.request` plus one UI path per feature; `test.slow()` for login + polling specs; e2e never depends on email delivery.
- **Spec files (30)**: account, admin-catalog, admin-money, admin-ops, admin, ai, camera, categories, closet, demo-closet, flows, launch, lists, navigation, packing, polish, profile, pwa, render, security, share, shared-looks, shop, signin, social, social2, storage, style, swaps.
- **Mocks**: `lib/gemini.ts` `geminiMocked()` = `GEMINI_MOCK==="1"` or no key → routes call `mockOutfits`, simulated detection/construction facts by category group, fixed reasons, render verification notes (a "hoodie" look renders with a note to exercise the free retry); `lib/tripo.ts` `tripoMocked()` → simulated pipeline completing in ~15 s with a bundled GLB; admin `lib/describe.ts` `describeMocked()` → group-shaped facts.
- **Test databases**: local runs hit Neon `staging` (backend) — in Step 1 they hit production (caveat recorded, fixed by teardown and later by the separate backend repo); CI runs on `ci-backend` via secrets; DB specs self-skip without secrets.
- **CI** (`.github/workflows/ci.yml`): on push and PR to `main`; `concurrency: group ci-backend, cancel-in-progress: false` ("the e2e suite resets and mutates the shared ci-backend database"); ubuntu, 25-minute timeout; Node 22 with npm cache; `npm ci` → secret scan → dependency audit → vitest → `npx turbo run build` → `npx playwright install chromium --with-deps` → `npx playwright test` with the DB/admin/auth/bucket secrets and `AUTH_TRUST_HOST=true` → upload `test-results/` as `playwright-traces` artifact (7 days) on failure. The 3D consent UI-flow test self-skips on CI ("tap never registers on the runner").
- **Site tests**: `apps/site/vitest.config.ts` (node env, `oxc.jsx.runtime automatic` so components render with react-dom/server), unit files `assets`, `cta`, `orbitmark`, `plans`, `privacy`, `round2`; smoke `tests/smoke/site.spec.ts` against `node tests/serve.mjs out 3013`, fully parallel, desktop Chrome (header/footer `.lmark`, animation running/paused, reduced motion, no overflow at 390, forbidden words, pricing table from config).
- **Crawlers**: `tools/screenshots.mjs` (every screen of both apps at 390×844 mobile and 1280×800 admin desktop), `tools/verify.mjs` (overflow at 375 on 31 routes, console/page errors, interaction checks).
- **Cutover verification**: `tools/cutover/verify.mjs` checks columns, tables, users.credits default 18, config render model, shop currency, AI budget, price list, retired keys absent, yearly allowances, provider prices, fixed costs, budget bands, trimmed style profiles, wear facts, categories and help articles; exit 1 on any FAIL.
- **Live staging passes** after each push (scripted PASS/FAIL lists) and a real paid call where needed (e.g. one layered render, $0.17).
- **Lighthouse targets** for the landing page: LCP ≤ 2.5 s mobile, CLS < 0.1; measured LCP 2.1–2.5 s, CLS 0.001, desktop 99.
- **Prototype-era verification** (Handoff §4, Playbook §8): drive the single-file prototype via DOM clicks (`[data-enter="user"]` first; controllers are closure-scoped), assert `.screen.active`, console errors clean, overflow at 375×812, screenshots only when the browser pane is displayed.
- **Phone retest guide** delivered in chat after each staging push (LAUNCH-READINESS D).

---

## 8. Security

From `SECURITY.md` (client's twenty-point review plus 26 detailed controls), `SECURITY-SUMMARY.md` (plain-words version), `tools/security/README.md`, code and briefs.

### The twenty-point review (client's list) and the answer
1. **Hide API keys** — keys only in hosting env vars; only `NEXT_PUBLIC_*` reach the browser (analytics key, push public key, app URL); proven by `npm run security:secrets` on tree and history.
2. **Enable RLS** — not applicable by design (no browser reaches the DB; one server role; ownership filter on every query; attack suite proves it). Turn RLS on only if a direct data path is ever added: `enable row level security` per user table with `user_id = current_setting('app.user_id')`.
3. **Test IDOR** — `security.spec.ts`: one account tries to read/change/delete another's items, looks, public links, link responses, tickets, packing lists, 3D avatars, generation status by guessing ids; all 401/403/404 and rows re-read unchanged.
4. **Scan git secrets** — `scan-secrets.mjs --tree` in CI, `--history` on demand; one historical match was a demo presentation password that unlocks nothing.
5. **Lock admin routes** — every `api/admin` route checks the admin session; pages gated in `apps/admin/middleware.ts`; `routeInventory.test.ts` fails the build if a route lacks the check; attack suite calls every admin route with every method and no cookie (401).
6. **Test user isolation** — plus storage files of other accounts 401, shares not addressed to you unanswerable, no other account's email in any social response.
7. **Rate limit APIs** — DB counters (`rate_limits`, migration 013) on sign-in, sign-up, verification and reset codes, password reset, AI calls, uploads, public votes/comments, admin sign-in and 2FA; 429 "Too many attempts — try again in N minutes."
8. **Lock storage buckets** — private bucket, served through `api/storage` after a session check matching the owner prefix; shop and advert images public on purpose; four cases tested.
9. **Validate all inputs** — zod schema per writing route (`apps/web/lib/validate.ts`, `apps/admin/lib/validate.ts`): unknown fields dropped, types/lengths/enums/array sizes enforced, plain-sentence 400.
10. **Block unauthenticated routes** — short public allow-list; everything else checks a session; attack suite calls all routes signed out (84 at the time; `routes.json` now lists 94: 67 web, 27 admin).
11. **Test SQL injection** — parameterised tagged templates only; `sqlScan.test.ts` fails on `sql.raw` or string-built SQL outside a documented allow-list (two fixed-text spots in the admin ai-spend route); classic payloads pushed through names, notes, comments, search, tickets and admin fields are stored as text.
12. **Remove sensitive logs** — `apps/web/lib/log.ts` scrubs emails, bearer tokens, provider keys (`AIza…`, `sk_…`, `re_…`, `ghp_…`, `vcp_…`), 32+ char secret-shaped runs, and blanks fields named password/code/token/secret/authorization/cookie; `logError(route, err)` logs route + message only, never bodies; Sentry PII off with the same scrubber (`scrubEvent` drops user email/ip/username).
13. **Block field tampering** — plan, credits, emailVerified, suspended, freeDetectionsUsed, ownership ids, share tokens, `shareAvatarId` never settable from a request; attack suite sends each and re-reads the account.
14. **Restrict file uploads** — bytes decoded with sharp (`normaliseUpload`: jpeg/png/webp/heif only), re-encoded (orientation baked, EXIF/GPS/XMP/ICC dropped; HEIC → JPEG); text renamed `.jpg` refused; e2e proves GPS stripped; no size cap beyond the body limit (client decision).
15. **Secure server logic** — prices, credit costs, allowances, AI spend and ownership computed on the server; the browser sends intent, never amounts; price changes need the owner's emailed code and are audited.
16. **Trim API responses** — names and usernames only for other people; no hashes, codes, other people's tokens, storage keys, raw AI output or prompts, stack traces or DB errors.
17. **Secure auth sessions** — admin sessions server-side, 7-day expiry, "Log out everywhere", 2FA code burned after five wrong guesses; user password change / account delete bumps `session_version`; cookies server-only and same-site.
18. **Scan dependencies** — `npm run security:audit` in CI (high/critical fail unless a documented expiring exception); Dependabot alerts + automated security fixes + weekly grouped PRs; this round upgraded Next.js (critical remote code execution advisory), sharp, drizzle-orm 0.45.2 (SQL-injection advisory).
19. **Test record access** — covered by 3 and 6, plus route inventory and SQL scan in the build.
20. **Attack your own app** — `security.spec.ts` runs on every push.

### Detailed controls worth copying
- **Rate limit table** (`apps/web/lib/rateLimit.ts` LIMITS): `signin-email` 10/15 min, `signin-ip` 10/15 min, `signup` 5/60 min, `verify` 5/15, `resend` 5/15, `reset` 5/15, `forgot` 5/60, `ai` 200/day per account (demo 2,000/day so presentations never trip it), `upload` 300/day, `public-ip` 60/hour, `public-device` 20/hour. Sign-in over the limit returns the same answer as a wrong password so the throttle reveals nothing. Implementation: one upsert per hit (`insert … on conflict (key) do update set count = case when lapsed then 1 else count+1 end …returning count, minutes_left`), key `<kind>:<subject>` lowercased, client IP from first `x-forwarded-for` hop then `x-real-ip`.
- **Origin check** in both `middleware.ts`: any POST/PATCH/PUT/DELETE under `/api/*` whose `Origin` host differs from `x-forwarded-host`/`host` → 403 "Blocked cross-site request."; requests without Origin (scheduler, server-to-server, tests) pass.
- **Page gating**: web middleware lets `OPEN_PAGES` (welcome, login, demo, signup, verify, forgot, reset, permissions, style-1/2, avatar-setup, avatar3d-intro, terms, privacy) and `/s/*` through; other pages need the Auth.js cookie (`authjs.session-token` / `__Secure-authjs.session-token`) or the demo cookie, otherwise redirect to `/welcome`; identity is resolved per request in `lib/serverUser.ts`. Admin middleware: only `/login` open; `sessionValid(secret, cookie)` does one row lookup.
- **Cron secret**: `cronAuthorized(req)` accepts `Authorization: Bearer <CRON_SECRET>` or `?secret=`, compares SHA-256 digests with `timingSafeEqual`; no configured secret → nothing authorised.
- **Security headers** in both `next.config.mjs` `headers()` for `/:path*`: `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(self), microphone=(), geolocation=()`.
- **OTP codes**: `randomInt(100000, 1000000)`, SHA-256 hash stored, 10-minute expiry, one live code per email + purpose (`auth_codes`), `attempts` column (five wrong → dropped). Admin save-lock codes in `admin_otp` (hashed, 10 min, newest only, constant-time compare), unlock stored on `admin_sessions.unlocked_until` (never a client flag), 5 wrong → 1-hour lockout keyed by the session, 423 `{ needsOtp: true }` from config and credit-pack routes; break-glass: a request carrying the raw `ADMIN_SESSION_SECRET` has no session row, is not asked for a code, but is still audited ("environment key") and alerted.
- **Admin password**: scrypt hash in `admin_settings.password_hash`, env `ADMIN_PASSWORD` only as a fallback while no hash is stored; 2FA recipients editable (plus `ADMIN_EMAIL_CC`), emails masked in responses.
- **Passwords (users)**: bcryptjs hashes; strength rules (`lib/password.ts`, unit-tested); forgot flow never reveals whether an email exists.
- **Consents** stamped with timestamps; detection, renders and 3D builds refuse with 403 `{ consent }` when missing.
- **One sign-in method per email** and **server-enforced suspension** (controls 25, 26) — refusal email travels in a 5-minute cookie, never in the URL.
- **Demo login** only compiled in where `NEXT_PUBLIC_DEMO_LOGIN=1` or CI without VERCEL; production must not set it; public welcome screen has no demo wording (`launch.spec`).
- **Secret scanner** patterns: Google API key, Stripe `sk_live/test`, Resend `re_`, GitHub `ghp_`, Vercel `vcp_`, AWS `AKIA`, Tripo `tsk_`, Postgres URL with password, private key block, JWT, generic `secret|token|password|api_key = "…"` (placeholders, env lookups, test fixtures ignored); skips node_modules/.next/.git/.turbo/dist/test-results/lockfiles/binaries; tree mode uses `git ls-files --cached --others --exclude-standard` so gitignored `.env.local` files are never read; output always masked.
- **Audit gate** exception format: package, exact node paths, advisory ids, reason, `reviewBy` date (the gate fails once the date passes). One carried: `postcss` nested under `next` (four GHSAs), build-time only, fix needs Next 16, review 2026-12-01.
- **Key leak procedure**: rotate at the provider first, update Vercel env and redeploy, then remove from the tree; rewrite history only for a private repo where every collaborator re-clones; run the tree scan.
- **Chat archive masking** (`export-history.mjs`): `ghp_`, `vcp_`, `AIza`, `AQ.`, `sk-`, `re_` tokens, Postgres URLs and `password|secret|token|api_key` assignments masked; archive kept outside every git repo; grep confirmed 0 unmasked secrets.
- **Handover**: keys from the client via Bitwarden Send only.
- **Agent rules**: never write a secret into a tracked file; secrets read from `.env.local` at runtime; never `neon env pull`; never touch production.
- **Leftovers (agreed)**: Content-Security-Policy, external penetration test, Vercel firewall rules (country/bot filtering, edge rate limits) at cutover; RLS deliberately not used.
- **Known exposure lessons**: PATs pasted in chat must be treated as compromised and rotated (Handoff §8.3); some throwaway scratchpad scripts hard-coded tokens — prefer env variables.

---

## 9. Pitfalls (from runbook, readiness doc, memory and briefs)

Format: Symptom / Cause / Fix / Prevent.

1. **CI wiped live data** — A real 3D build on production failed "Generation not found" mid-poll. / The CI e2e global setup reset the demo profile on the same database. / Dedicated Neon `ci` branch (own DB and bucket), later `ci-backend`. / Never share a database between CI and any live environment.
2. **CI branch credentials invalidated** — CI storage specs failed after a re-pull. / `neon env pull --branch <ci>` mints new AWS creds; GitHub secrets held the old ones. / Save CI env once (`.env.ci-backend`), never re-pull; if you must, update all secrets. / Document it in CLAUDE.md-style rules.
3. **Migration missing on CI branch** — Round-4 CI failed on missing `angle_photos`. / Migration applied to production/staging only. / Every migration runs on staging AND the CI branch the same day. / Put it in the brief's migration rules.
4. **Overlapping CI runs collide** — storer logins failed in a second run. / Both runs share `ci-backend`; the account spec changes a password mid-run. / Push once per round; later `concurrency: group: ci-backend` in the workflow. / Add concurrency from day one.
5. **CI retries re-run stateful specs** — 409 on a friend request, no 402 gate. / `retries: 1` re-runs specs whose first attempt already mutated data. / Retry-tolerant assertions (accept 201 or 409; guard on live balance). / Design specs to be idempotent.
6. **Parallel spec races** — credit deltas and render images wrong intermittently. / Spec files ran in parallel against the same demo/storer accounts. / `workers: 1`; dedicated throwaway account per spec family; assert ledger events not balances. / Start with one worker when specs share data.
7. **Stale server tested** — admin route 404 in a run that should have it. / Killed Playwright runs leave `next start` alive on 3000/3001 and `reuseExistingServer` reused it. / `reuseExistingServer: false`; free ports with `netstat`/`taskkill` before a run. / Keep both.
8. **Mass click timeouts during e2e** — 30 failures that pass alone. / e2e run alongside tsc/vitest/agents on the same machine; also rebuilding `.next` while `next start` serves it. / Machine idle during e2e (sentinel `E2E-DONE` file for agents); never run `next dev` in a directory served by `next start`. / Gate agents on a sentinel.
9. **Idle socket resets** — recurring ECONNRESET flakes. / Node keep-alive default shorter than Playwright's pooled connections. / `--keepAliveTimeout 60000` on `next start`. / Keep in the config template.
10. **No camera in headless tests** — camera specs failed. / Playwright's headless shell lacks `getUserMedia`. / `channel: "chromium"` full build + fake media flags + `permissions: ["camera"]`. / Template config.
11. **Blind retry loops double-spend** — credits charged twice, history walked to about:blank. / Retrying mutating clicks without checking state. / Idempotent retries guarded on current state; mutating clicks wait for network idle and click once. / Write `clickUntil` helpers that check state.
12. **Install banner intercepts clicks** — top-bar clicks missed. / PWA install banner overlays. / `addInitScript` sets `assemble-install-dismissed`. / Include in test fixtures.
13. **Admin describer called real Gemini in tests** — admin-catalog spec failed locally. / Only the web server had `GEMINI_MOCK=1`. / Set the mock env on every webServer. / Mock every engine on every server.
14. **Rate limits lock re-runs** — 429 where a spec expects 401. / Counters persisted between runs for the runner's own IP. / Global setup clears test-pattern rate-limit keys. / Clear counters in setup.
15. **CRLF breaks a unit test locally** — `sqlScan.test.ts` fails on Windows. / Allow-list fragment contains `\n`, checkout uses CRLF. / CI on Linux is fine; normalise line endings. / `.gitattributes` or compare normalised text.
16. **Vercel token 403** — deploy triggers and env writes fail. / SAML team scope expires tokens even when `/v2/user` works. / One cheap check call first; ask for a new token on 403; fall back to live-URL checks. / Never loop on 403.
17. **Empty redeploy commits canceled** — env change not live. / Ignored-build step cancels commits with no changes. / Redeploy through the API with `deploymentId` + `forceNew=1`. / Use the API script.
18. **Main not auto-deployed** — staging stayed on the old build. / Build queue busy with Dependabot branches (and SAML token issues). / Trigger with `gitSource` API deploy; poll by commit sha. / Poll after every push.
19. **Old code re-added removed config keys** — `a3dStdCost` reappeared on staging. / The previously deployed build wrote its own defaults into the config row before the new deploy. / Re-run `tools/cutover/config.mjs` after the deploy; verify.mjs. / Make config scripts idempotent and run them post-deploy.
20. **Stored config overrides code defaults** — staging kept the old flash render model. / The `app_config` row wins over `DEFAULT_CONFIG`. / Update through admin PUT or `config.mjs`. / Cutover config step for production.
21. **Turbo refuses workspaces on Vercel** — build failed. / Missing `packageManager` field; default install under-installed. / `"packageManager": "npm@11.14.1"`; install `cd ../.. && npm install`. / Template root package.json.
22. **PAT without `workflow` scope** — push rejected when touching `.github/workflows`. / Token scope. / Ask for the scope, or keep CI knobs in app config meanwhile. / Request Contents + Workflow scopes up front.
23. **Silent push failures** — CI never ran. / Expired PAT inside a chained command. / curl-check the token first. / Always verify token before push.
24. **Destructive migration while old build is live** — would blank Google profile pictures. / 005 moves photo URLs between columns the front-end build still reads. / Run only at cutover. / Keep migrations additive; mark any non-additive one in the runbook.
25. **Rehearse before production** — unknown data shapes. / Production data differs from staging. / Fork production (`cutover-rehearsal`), run every migration + config + verify, delete the fork. / Runbook step 1.
26. **drizzle-kit push chokes** on an existing primary-key diff. / Push tries to reconcile existing tables. / Targeted additive SQL migrations (`.mjs` with `IF NOT EXISTS`). / Migration file per change.
27. **Heterogeneous table loops don't typecheck** in Drizzle. / Typed table objects differ. / Explicit per-table deletes. / Same in teardown.
28. **Most foreign keys lack cascade** — account delete failed. / Schema without `on delete cascade`. / Server delete sequence checked against live FKs, rehearsed in a rolled-back batch. / Decide cascade rules in the schema early.
29. **Bucket files survived account deletion** — orphaned photos. / Delete route removed rows only. / Delete every object under `u<id>/` first; queue failures in `storage_cleanups` with admin Retry (branch `account-file-cleanup`). / Include storage in delete design.
30. **Immutable cache served stale GLBs** — rotated avatars still side-on. / Storage proxy sends immutable max-age; files overwritten in place. / Always write new keys. / Never overwrite an object key.
31. **3D models side-on** — thumbnails and viewer faced sideways. / Engine default orientation. / `orientation: "align_image"`; rotated existing GLBs −90° about Y with gltf-transform. / Set orientation in engine settings.
32. **"Low quality" 3D** — flat look. / Viewer's Lambert matte clone discarded normal and AO maps. / `MeshStandardMaterial` roughness 1, metalness 0, keep map/normalMap/aoMap. / Compare renders A/B before blaming the engine.
33. **sharp fails on some textures** — "colourspace: parameter space not set". / Machine-specific libvips issue. / Geometry-only compression (dedup → weld → simplify 0.06 → prune + meshopt); 41.3 MB → 3.9 MB. / Don't route GLB textures through sharp here.
34. **Stale camera context** — closet photos sent to the avatar check ("No one in the frame") on a fresh account. / Zustand persisted `camCtx`/`photoCtx` across reloads/logout; item entry points didn't set a context. / Every entry sets its context; exclude from persistence; reset on finish. / Never persist transient flow context.
35. **Zustand hydration mismatch** — SSR warnings. / Persist without `skipHydration`. / `skipHydration` + rehydrate in Providers. / Template store.
36. **Query initialData suppressed fetch** — buy sheet listed no packages. / `initialData` + `staleTime` means no refetch. / `initialDataUpdatedAt: 0`. / Note in data-layer conventions.
37. **Ledger `at` is a string** ("just now") — date parsing broke. / Display label stored instead of timestamp. / Never parse; later real timestamps. / Store timestamps.
38. **Rename inputs never committed on phones** — mobile keyboards blur instead of Enter. / Commit only on keydown Enter. / Commit on blur. / Test on phones.
39. **Hydration flash with reduced motion** — layout jumps. / Dev machine has Windows Reduced Motion on. / Render static on first paint; animate only on client navigations. / Check reduced-motion.
40. **`next start` snapshots `public/`** — new assets 404. / Directory read at boot. / Restart after adding assets. / Note in dev docs.
41. **Engine quota messages shown raw** — confusing errors. / 429/503 text passed through. / `engineError` maps quota/overload to "at capacity… You weren't charged." / Wrap provider errors.
42. **Gemini key ran out of credit** — all AI 429 on staging; asset work paused. / Prepaid credit exhausted. / Top up; keep budget alerts. / Monitor spend in admin.
43. **Free tier 0 image quota** — renders impossible. / Image models have no free quota. / Enable billing. / Check quotas before planning.
44. **Survivor-sample cost data** — cost report underestimates counts. / Nightly demo reset, e2e runs and deletes wipe `generations` rows. / Report ranges; later store `cost_cents` per call. / Store cost at call time.
45. **Tripo docs disagree (40 vs 60 credits)** — unit cost uncertain. / API docs table omitted the geometry surcharge. / Cross-check model page, pricing page and wallet arithmetic. / Verify vendor pricing from multiple official pages.
46. **Landing page CLS 0.127** — font swap shift. / Web font swap on hero text. / Fixed-line hero text. / Measure with Lighthouse live.
47. **High TBT on phones** — 470–650 ms. / Off-screen reveal transitions at load + hero loop during hydration; 111 KiB inline page data. / Delay animations until load + idle; static HTML strings; islands suggested. / Budget hydration.
48. **Windows shell traps** — `python` stub, quoting. / Windows Store alias; PowerShell/Bash quoting. / `py` launcher; write scripts to files; here-string closers at column 0; don't use `node -e` with quoted JS. / Scripts in files.
49. **Scratch scripts swept into commits** — one-off rebuild/reseed scripts committed (removed in `2501e3a`, `b468753`). / `git add -A` in the repo. / Keep scratch files in the scratchpad; add explicit paths. / Never `git add -A` with scratch files around.
50. **LAUNCH-READINESS.md title line lost** — the file now starts with a stray table row instead of its heading. / A concurrent small edit replaced the first line. / Re-read shared files before editing; review docs diffs. / Shared-file protocol in briefs.
51. **Delete copy promised "within 30 days"** while deletion was immediate. / Copy not updated. / Copy audit + `copy.test.ts`. / Grep tests for promises.
52. **Plans say "credits a month" but grant once** — open item. / Monthly renewal grant belongs to Stripe. / Documented in H7 and cost report. / Keep promises tied to tests.
53. **ci-backend render model FAIL** in verify.mjs. / CI config pinned a newer flash image model; `config.mjs` only replaces retired models. / Accept that one FAIL there or set the model via a locked save. / Keep test-branch config drift documented.
54. **Pasted tokens** — compromised by definition. / Plaintext in chat. / Rotate after use; prefer credential managers / `gh auth login`. / Rule in the playbook.

---

## 10. Code and templates worth reusing

Paths are absolute from `D:\Documents\Deep Learn HQ\Clients\<client-folder>\` unless marked.

### Repo scaffolding and config (UI\backend)
- `package.json` (root) — npm workspaces `apps/*` `packages/*`; `packageManager` pin; scripts `dev`, `build` (turbo), `dev:web`, `dev:admin`, `screenshots`, `test`, `security:secrets`, `security:audit`; `overrides` forcing patched `postcss`, `sharp`, `drizzle-orm` (including the copy nested under `next`). Generalise: monorepo root with security scripts and override pins.
- `turbo.json` — `dev` (no cache, persistent), `build` (`dependsOn ^build`, outputs `.next/**` minus cache, `dist/**`), `test` depends on build. `apps/site/turbo.json` extends root, adds site outputs and the build-time `env` list, cache off.
- `apps/web/next.config.mjs` — `transpilePackages: ["@assemble/db"]`, eslint ignored in builds, security headers, demo-login flag compiled only for staging/CI (`process.env.CI && !process.env.VERCEL`).
- `apps/admin/next.config.mjs` — same headers.
- `apps/site/next.config.mjs` — `output: "export"`, `images.unoptimized`, `poweredByHeader: false`, `env.SITE_APP_URL` inlined with a staging default.
- `apps/web/vercel.json` — cron definition; `apps/site/vercel.json` — `cleanUrls`.
- `neon.ts` — Neon services declaration (private bucket).
- `.gitignore` — node_modules, .next, .turbo, dist, tsbuildinfo, `.env`, `.env.local`, screenshots, test-results, playwright-report, `.neon`, `ci-branch.env`, `.env.ci-backend`, `tools/marketing/out/`.
- `packages/db/package.json` — source-exported package (`main: src/index.ts`, `exports` for `./schema`, `./data`, `./server`, `./reset-demo`), scripts `db:push`, `db:seed`, `db:reset-demo`. `drizzle.config.ts` — schema path, postgres dialect, URL from env.
- `packages/ui/styles.css` — the whole design system as one CSS file exported as `@assemble/ui/styles.css`.
- `apps/*/instrumentation*.ts`, `sentry.*.config.ts` — Sentry wiring with scrubbing.

### CI and dependency hygiene
- `.github/workflows/ci.yml` — the full CI ladder on a Neon CI branch with concurrency group, security gates first, traces on failure. Template-ready.
- `.github/dependabot.yml` — weekly grouped minor/patch updates.

### Testing
- `playwright.config.ts` — single worker, CI retries, full chromium with fake camera, two production webServers with mocked AI env, keep-alive fix, no server reuse.
- `tools/e2e/global-setup.ts` — env resolution from `.env.local` files, demo reset, throwaway account factory with per-spec accounts, rate-limit cleanup, flags `E2E_DB`/`E2E_STORAGE`.
- `tools/e2e/global-teardown.ts` — account + bucket cleanup.
- `tools/e2e/db.ts` — direct DB helpers for things no route exposes (planting codes, priced calls, negative proofs).
- `tools/e2e/security.spec.ts` — the attack suite (18 tests: IDOR, storage, shares, field tampering ×4, injection ×2, unauthenticated routes, admin methods, foreign Origin, cron secret, headers, sign-in throttle, public vote throttle, upload sniffing, GPS stripping). It reads `tools/security/routes.json`.
- `apps/web/tests/routeInventory.test.ts` — walks every `route.ts`, records exported methods and whether it calls a session check; public allow-list with a "why" per entry; writes `tools/security/routes.json`; also asserts cron routes use the shared constant-time check.
- `apps/web/tests/sqlScan.test.ts` — fails on `sql.raw` / string-built SQL outside an exact-fragment allow-list.
- `apps/web/tests/copy.test.ts` — bans roadmap/prototype/fixture wording in user-facing code.
- `apps/web/vitest.config.ts`, `apps/site/vitest.config.ts` — jsdom + React plugin + package aliases; node env + oxc JSX.
- `apps/site/playwright.config.ts` + `tests/serve.mjs` — smoke test a static export on a local static server.
- `tools/verify.mjs` — overflow at 375 px + console-error crawl. `tools/screenshots.mjs` — screenshot every route at mobile/desktop.

### Security tooling
- `tools/security/scan-secrets.mjs` — dependency-free secret scanner (tree/history/strict), masked output.
- `tools/security/audit.mjs` — npm audit gate with expiring documented exceptions.
- `tools/security/README.md` — the command table.
- `apps/web/lib/log.ts` — scrub/scrubEvent/logError.
- `apps/web/lib/rateLimit.ts` + `packages/db/src/rateLimit.ts` — DB fixed-window limiter with pure mirror functions for unit tests.
- `apps/web/app/api/cron/cronAuth.ts` — constant-time scheduler secret check.
- `apps/web/middleware.ts`, `apps/admin/middleware.ts` — origin check + page gating.
- `apps/web/lib/storage.ts` — S3 client for Neon storage (`forcePathStyle: true` required), `normaliseUpload` (sniff + re-encode + metadata strip).
- `apps/web/lib/validate.ts`, `apps/admin/lib/validate.ts` — zod schemas per writing route.
- `apps/admin/lib/adminSession.ts` (server-side revocable sessions usable in edge middleware via Web Crypto + HTTP driver), `adminOtp.ts` (save-lock codes), `configLock.ts` (single locked-key list shared by panel and server; `changedLeaves` for audit rows), `auditTrail.ts`.

### Auth and users
- `apps/web/auth.ts` — Auth.js v5 config: Google + Credentials, JWT sessions, throttled credentials authorize, Google first-sign-in user creation with starter credits and consent stamp, session version in the token, refusal codes, refusal email in a short cookie.
- `apps/web/lib/serverUser.ts` — `getCurrentUser()` (session → row, suspended and version checks, demo cookie fallback), `unauthorized()` 401/403 distinction, lapsed yearly-plan settlement.
- `apps/web/lib/otp.ts` + `lib/email.ts` — hashed 6-digit codes and branded Resend emails (inline-styled HTML).
- `apps/web/lib/authMethod.ts` — one-method-per-email decisions.
- `apps/web/lib/push.ts` + `public/sw.js` — web push subscribe/unsubscribe/status.

### AI engines
- `apps/web/lib/gemini.ts` — REST `v1beta …:generateContent` client: `generateJson` (system instruction, response JSON schema, max output tokens, temperature 0.7, safety settings, usage incl. thought tokens) and `generateImage` (`responseModalities: ["IMAGE"]`); `safetySettings(strict)` maps the admin switch to `BLOCK_LOW_AND_ABOVE` / `BLOCK_ONLY_HIGH` over four harm categories; friendly quota/overload errors; `geminiMocked()`.
- `apps/web/lib/tripo.ts` — upload (`/upload/sts` → image token), task create (`image_to_model` or `multiview_to_model` with slots front/left/back/right and `{}` gaps), `TRIPO_SETTINGS` (`model_version v3.1-20260211`, detailed geometry and texture, PBR, triangles, `face_limit 1,500,000`, `orientation align_image`), wallet balance, task status; `tripoMocked()`.
- `apps/web/lib/aiGuards.ts` — `liveConfig` (config row over defaults), `underAiDailyCap`, `charge` (balance + ledger row), `refund`.
- `apps/web/lib/aiPrompts.ts` (1,081 lines, pure builders + validators, all unit-tested): construction facts schema per garment role and clamp (`validateConstruction`, `describeConstruction`, `buildDescribePrompt`); detection (`DETECT_SCHEMA`, `buildDetectPrompt`, `validateDetect`, `detectRefusal` refusing only when the model is confident, `REFUSAL_MESSAGES` for ten kinds); avatar photo check (`AVATAR_CHECK_SCHEMA`, `buildAvatarCheckPrompt`, per-slot facing, 13 refusal kinds); profile fields and render figure from pronoun text; match (`MATCH_SCHEMA`, `buildMatchPrompt`, `enforceRequiredItem`, `validateOutfit` clamping to real closet/shop refs); packing (`PACK_SCHEMA`, `buildPackPrompt`, `validatePack`); render (`layeringBlock`, `buildRenderPrompt` with base photo or model); verification (`VERIFY_SCHEMA`, `buildVerifyPrompt`, `validateVerify`, `renderNoteFrom`); reasons (`REASONS_SCHEMA`, `buildReasonsPrompt`, `validateReasons`, fallback reasons). Generalise: "prompts as pure functions + JSON schema + clamp validator + unit tests".
- `apps/web/lib/a3dJobs.ts` — step/fail generation shared by status route, gallery polling and the nightly sweep; refund + free retry on engine failure.
- `apps/web/lib/shareModel.ts` — lighter GLB share copy via gltf-transform + meshoptimizer.
- `apps/admin/lib/describe.ts` — best-effort product describer.
- `packages/db/src/aiSpend.ts` — real cost per call (`generationCostUnits`), per-kind aggregation, budget thresholds; `packages/db/src/profitability.ts` — month revenue/cost/margin maths.

### Data and migrations
- `packages/db/src/schema.ts` (591 lines) — tables: users, app_config, credit_packages, taxonomy, help_articles, brands, campaigns, wear_history, push_subscriptions, auth_codes, items, looks, products, collections, friends, shares, share_responses, credit_ledger, generations, avatars_3d, packing_lists, tickets, notifications, content_reports, blocks, saved_products, product_feedback, admin_sessions, rate_limits, admin_settings, admin_notifications, config_audit, broadcasts, admin_otp; `AppConfigData` type + `DEFAULT_CONFIG` + `CONFIG_STRING_KEYS`.
- `packages/db/src/client.ts` — `getDb()` lazily creates a Drizzle Neon-HTTP client, returns null without `DATABASE_URL` (apps fall back to typed seeds).
- `packages/db/src/seed.ts`, `reset-demo.ts` (demo identity rewritten on every reset, explicit per-table deletes, used by e2e and cron), `data.ts` (typed seeds), `helpArticles.json` (12 starter articles).
- `packages/db/migrations/001…017` — plain `.mjs`, re-runnable (`IF NOT EXISTS`, count-guarded seeds), strip quotes from a pasted `DATABASE_URL`, fall back to `apps/web/.env.local` (unpooled first), print one result line. List: 001 step-1.5 foundations (config, packages, taxonomy, help, brands, campaigns, wear history, push subs, suspended), 002 social (usernames, notification timestamps), 003 photos polish (angle photos), 004 profile picture, 005 profile upload (Google photo column), 006 public shares, 007 launch readiness, 008 render fidelity, 009 category model, 009b re-file items, 010 shop model (price cents, photos, hidden), 011 help articles, 012 avatar shares, 013 security, 014 pricing, 015 admin cost (4 tables + cost backfill), 016 budget bands (+ profile trim, wear facts), 017 sign-in and lists. Run: `node packages/db/migrations/<file>.mjs` from the repo root with `DATABASE_URL` set to the target branch.
- `tools/cutover/config.mjs` — idempotent config-row upgrade (render model, currency, AI budget, plans, reprice, provider prices, fixed costs, budget bands, profile trims, auth-method backfill).
- `tools/cutover/verify.mjs` — PASS/FAIL checklist for a target database.
- `CUTOVER-RUNBOOK.md` — preconditions, fork rehearsal, production steps with env lists, smoke tests, rollback (Vercel instant rollback; additive DB keeps the old build working), after-cutover admin tasks, known items.

### Documents as templates
- `UI\backend\LAUNCH-READINESS.md` — gap table per area: # / gap / decision / status with the proving test.
- `UI\backend\SECURITY.md` — client review table + detailed controls with evidence paths; `SECURITY-SUMMARY.md` — plain-words version for the client.
- `UI\backend\CLIENT-HANDOVER-CHECKLIST.md` — who owns what, safe key handover, step-by-step account setup for Google Cloud/Gemini, Google OAuth, 3D engine, Resend, admin emails, legal details, shop content, app stores, Stripe; what happens after.
- `UI\backend\README.md` — structure, platform, dev, testing pyramid, deployment table.
- `UI\front end\STEP-1.5-SCOPE.md` — scope doc from a question round (accounts, admin, notifications, uploads, delivery in staged deploys, tests per stage).
- `UI\Assemble - Tech Stack.md` — stack table with "why", plus the 8-point decision framework (team first, time-to-market, migration paths, free tiers that don't pause, workload shape, platform economics, one language, defer non-blocking decisions).
- `UI\PROJECT-HANDOFF.md` — new-session handoff (what, repos, run/verify, architecture, change-log, conventions, limitations, quick-start).
- `UI\UI-Build-Playbook.md` — proposal → branded single-file prototype process (inputs, phases, controller pattern, design system, asset pipeline, dev server, verification, skills, pitfalls, living docs, bootstrap message).
- `UI\Assemble - Image Brief.md`, `Assemble - Icon Brief.md`, `Assemble - Worn Looks Brief.md` — prompt briefs: a global style block appended to every prompt, file-name tables, contact-sheet grids with baked filename labels, empty tiles, one-occurrence ring rule; rounds appended as new sections.
- `UI\AI-COST-REPORT.md` — method: sources (the app's own call log, credit ledger, live config, marketing ledger), prices from published provider pages with dates, "logged usage × published price, no invoice reconciled, ranges where the log stores a sum"; sections: what was paid, what it bought, what each feature really costs, admin guesses vs reality, cost per user per month, cheaper model path, what the report cannot show, vendor credit check, pricing model with margin floors, the plan in plain words. Figures PNGs in `UI\ai-cost-report-assets\`.
- `UI\Assemble-Social-Launch-Proposal.md` — proposal structure: executive summary with the decision needed, why now, research, strategy, 12-week calendar, sample scripts, how AI presenters are made, creator programme, month-three picture, packages, how we run it, why us, what we need and assumptions, next steps.

### Landing site (apps/site)
- `scripts/build-images.mjs` — slot list + folder scan → AVIF/WebP/JPEG at several widths with content-hash names into `public/_img`, manifest in `.generated/images.json`, placeholder for missing sources, stand-in OG image.
- `scripts/build-3d.mjs` — site-only GLB copies (dedup, weld, 1024 px WebP textures, quantize, meshopt) with a version string to force rebuilds and computed forward yaw.
- `components/OrbitMark.tsx` — the rotating ring logo ported from the app (off-screen pause, hover fast mode, reduced-motion static).
- `lib/plans.ts` / `lib/questions.ts` — prices and FAQ answers read from live config at build.
- `tools/marketing/*.mjs` — end-to-end marketing asset factory through the real app API on staging (accounts, generated fictional people, wardrobes via 2×2 product sheets split into photos, avatar photos through the real check, matches/renders with a paid-call ledger and resumable progress JSON, social states, exports, long-form screen capture by growing the viewport, OG image, manifest).

### Scratchpad scripts worth generalising (session scratchpad; tokens must come from env)
- `poll-staging.mjs` — poll Vercel deployments for a commit sha until READY/ERROR/CANCELED.
- `deploy-b3.mjs` — trigger production deployments of staging projects from a git sha via API, then poll.
- `site-deploy.mjs` — digest-upload a static folder to a Vercel project with noindex headers.
- `push-admin-env.mjs` — copy env values from one app's `.env.local` to another Vercel project with upsert.
- `live-pass.mjs` (and `live-*.mjs`) — scripted PASS/FAIL live checks against staging (public endpoints, demo session, public share page, one real paid call, admin API with the session secret).
- `twa-build.mjs` — PWABuilder Android package request for a TWA.
- `commit-msg-*.txt` — commit message drafts used with `git commit -F`.

### Workflow scripts (C:\Users\<you>\.claude\projects\D--Documents-Deep-Learn-HQ-Clients-<client-folder>-UI\ec0c6e90-…\workflows\scripts\)
Common API: `export const meta = { name, description, phases:[{title, detail, model?}] }`; `phase(title)`; `await agent(prompt, { label, phase, schema?, model? })`; `await parallel([() => agent(...), ...])`; `log(msg)`; the script `return`s the collected reports. A shared `PRE` string points agents at the brief files and states "do not commit or change git state; run your checks in the foreground".
1. `assemble-pricing-70-wf_4083fb6e-861.js` — Data & config agent A (schema, migration 014, apply to staging + ci-backend, cutover scripts, docs) → four parallel agents on disjoint sets B web API, C web UI, D admin, E landing site → F tests (update specs, full ladder, fix failures, "do not end your turn while it runs") → reviewer with `{ refuted, defects, notes }` schema trying to REFUTE against the brief (grep checklist).
2. `assemble-admin-round-wf_a73a1e16-8be.js` — batch 2 push A: an explicit **API CONTRACT** string both build agents code to; data agent (tables, cost helper, migration 015, backfill) → parallel server agent + admin UI agent → tests agent (lists the e2e cases to add) → adversarial reviewer (security-oriented refute list).
3. `assemble-product-round-fixes-wf_3ff4ff6b-2af.js` — fix → tests → re-review for six confirmed review defects listed verbatim with file:line and the fix; re-reviewer returns `perDefect` + `regressions`.
4. `assemble-batch3-wf_fc67d522-6ca.js` — Data (migration 017) → Build (web server, web UI, admin in parallel) → Tests → Review & fix loop (`while (review.refuted && round < 2)`: fixer → tests → re-reviewer). Tests agent rule: transient DB drops → re-run only those spec files and report both; real failures → fix and re-run the full suite.
5. `assemble-camera-fix-and-ring-mark-wf_089e183a-7d0.js` — two unrelated fixes in parallel (bug with a pre-traced root cause and exact line numbers; site component port with Lighthouse gates) → verifier that must show the new test fails on old code.
6. `dollarise-cost-report-wf_7c71c5d5-a0b.js` — convert agent limited to two files with explicit conversion rules → read-only verifier (grep, sampled arithmetic, HTML structure integrity).
7. `verify-pricing-model-wf_056f9990-b90.js` — three parallel read-only verifiers: independent re-implementation of the pricing model, hand sanity check from the product side, vendor pricing check from official pages only.
8. `replication-guide-wf_ebe64d96-171.js` — 7 readers (6 chat slices + repo) on Opus → 4 writers on the Fable model (foundations, milestones, reference, templates) → completeness checker/fixer on Fable writing CHANGELOG.md.

### Briefs (session scratchpad)
- `AGENT-COMMON.md` (launch readiness), `AGENT-FIX-COMMON.md` (push-3 fixes, E2E-DONE gate), `AGENT-SEC-COMMON.md` (security contract), `AGENT-BATCH2-COMMON.md` (batch 2 hard rules, migration style, ladder, verified locations, provider prices), `AGENT-PRICING-COMMON.md` (decision table + mechanism), `AGENT-SITE-COMMON(-R2).md` (landing site contract, brand tokens, copy rules, no use of client likeness), per-agent briefs `AGENT-A1`, `G..K-BRIEF`, `P`, `Q` (avatar photo check), `R1..R3` (security), `S`, `W1..W2`, `PUSH-A`, `PUSH-B`, `BATCH3`, `SITE-BUILD(-R2)`, `SITE-ASSETS(-R2)`; maps `PRICING-MAP.md`; audits `AUDIT-PLAN.md`, `AUDIT-WEB.md`, `AUDIT-ADMIN.md`; `CUTOVER-RUNBOOK-draft.md`, `section-h-draft.md`.
- Reusable rule block (generalised from the briefs): *No AI attribution anywhere · do not commit/push/stash/change git state · staging and CI databases only, never production, never `neon env pull` · never call real paid engines in tests · money in dollars · keep every existing guard · wait in the foreground for builds/tests · shared-file protocol: small anchored edits, re-read before each edit, append-only for shared hook files · no fakes: every control real or removed; demo fixtures only behind `isDemo` · report under N lines: files changed, decisions, blocked items, exact commands and results.*

### Chat archive exporter
- `Project History\export-history.mjs` — streams Claude Code transcript JSONL files listed in `SESSIONS`, skips sidechain/meta lines, keeps user text (plus multiple-choice answers parsed from tool results as `[Answer]`) and assistant text (plus `AskUserQuestion` questions and options as `**Question:**`), strips system reminders/task notifications/command wrappers, masks secrets, writes one Markdown file per session named by first date, prints a summary (messages, replies, KB). Must add new sessions to `SESSIONS`.

### Memory notes (C:\Users\<you>\.claude\projects\D--Documents-Deep-Learn-HQ-Clients-<client-folder>-UI\memory\)
- `MEMORY.md` index + typed notes (`project`, `reference`, `feedback`) with frontmatter (`name`, `description`, `metadata.type`, `originSessionId`, `modified`) and Why / How to apply sections, cross-linked with `[[note]]`. Notes: assemble-project (running build log), backend-ci-branch, gemini-image-billing, vercel-token-expired, github-token-expired, share-links-and-light-avatars, launch-readiness-round, ai-cost-report, money-in-dollars, batch2-decisions, batch3-decisions, chat-archive, replication-guide-task, render-layering-fix, replication-guide-decisions. Pattern worth reusing: one note per service failure mode with a verification step. Caution: several notes contain real secrets — a template must forbid storing values in memory.

### Folder structures for reference
- `coming soon page\` — `index.html`, `favicon.png`, `.claude/settings.local.json`.
- `Wireframes\Version 1\` — `Assemble - Prototype.html`, `Coverage.html`, `Presenter Script.html`, `Walkthrough.html`, `assemble-style-direction.html`, `Additional Modules.md` + `Build Guide.md`, `assets/`, `extracted/`, original design export zip, `index.html`, `README.md`.
- `UI\` — the branded prototype `Assemble - Prototype.html` (~360 KB) plus docs, `img/`, `icons/`, `assets/` (GLBs), `manifest.json`, `index.html`, and the two child working folders `front end\` and `backend\` (both gitignored by the UI repo).
- `UI\front end\` — the Step 1 monorepo (same layout as backend minus later tools), `.agents/skills` and `.claude/skills` (Neon skills), `screenshots/` (install card, live checks, logo comparisons), `STEP-1.5-SCOPE.md`, `skills-lock.json`.
- `UI\backend\` — apps/web (app/(auth) 15 screens, app/(main) 33 screen folders, app/api 29 groups, lib 56 modules, tests 42), apps/admin (app/(panel) 15 sections incl. users/[id], brands/[id], profitability, notifications; app/api/admin 22 groups; lib 22 modules), apps/site (app, components 28, lib 18, scripts 2, tests unit + smoke), packages/db (src 11 files, migrations 18), packages/ui, tools (cutover, e2e 30 specs, marketing 15 scripts, security, screenshots.mjs, verify.mjs).
- `twa-staging\` — `assemble-staging.apk`, `.aab`, `assetlinks.json`, `signing-key-info.txt`, `signing.keystore` (private).
- `Marketing\` — marketing brief PDF, proposal PDFs (growth plan, comparisons, "How credit pricing works — Explained").
- `Project History\` — `chats\` (9 archive files), `export-history.mjs`, `replication-guide\`.

---

## 11. Session running (as recorded in memory, briefs and scripts)

- **Sessions**: separate Claude Code transcripts per phase — coming-soon page (from 2026-07-09), wireframes (07-14), 3D modelling (07-25), UI + backend part 1 (session `a63fa52e…`, 08-05 → 09-03), UI + backend part 2 (session `ec0c6e90…`, 09-01 → ongoing), and four worktree side-task sessions (09-13/14). Archive: about 1,419 user messages across 9 files, ~2.3 MB text.
- **Models**: the backend part-2 session ran on the "Fable" model until 2026-09-16, when the user switched batch 2 to **Opus 5** "to save weekly limit; Fable had used ~49% of the scoped weekly pool". The replication-guide workflow used Opus for 7 readers and Fable for 4 writers + checker, "the user chose this split to save the Fable weekly limit". Workflow phases can pin `model: 'fable'`.
- **Durations**:
  - Full local e2e: "~35–40 min" (batch 2 brief), "30–45 minutes" (pricing brief), "~40 min" (admin round); described as "the 2.5-hour suite" by 2026-09-17 when the user asked for targeted testing on a small push.
  - CI job timeout 25 minutes.
  - Landing site build ~11 minutes locally (image generation step).
  - Real Tripo build ~50 s; real match ~10 s; render ~10 s; cached render 0.7 s; swap re-render 6.5 s; share copy compression 3.9 s.
- **Waiting rules**: agents must not end a turn while builds/tests run; e2e needs an idle machine; other agents gate on `scratchpad\E2E-DONE`; background deploy polling via scripts; the user is told to wait for "go" and not to start new batches unprompted.
- **Interruptions and resumes**: a full e2e run was killed by a DNS outage mid-way (pricing round) — the tests agent brief says "ports 3000/3001 have been freed … check `git diff` first and keep what is right" (resuming an interrupted agent's work from the working tree). Transient staging DB drops (ENOTFOUND, connection terminated) → re-run only the affected specs and report both results. User answers cut off mid-question → defaults applied and recorded (break-glass decision 2026-09-16).
- **Background tasks and chips**: out-of-scope findings raised as task chips that spin off worktree sessions (account file cleanup, avatar front-facing fix, e2e fixture cleanup, American English switch). Workflows run as background tasks with ids (e.g. `wf_4083fb6e-861`, `wf_a73a1e16-8be`, `wf_0aefc2f0-ab4`, `wf_fc67d522-6ca`, `wf_ebe64d96-171`).
- **Parallel sessions/worktrees**: side sessions in `.claude/worktrees/<name>`; memory records "Other sessions work in separate git worktrees … main tree is ours".
- **Context continuity**: `PROJECT-HANDOFF.md` ("Read this first if you are a new Claude session"), `UI-Build-Playbook.md`, memory notes updated at every milestone, scope docs committed in the repo, `LAUNCH-READINESS.md` as the running checklist, chat archive regenerated after each batch; briefs keep decisions outside the conversation so they survive compaction.
- **Batch cadence** (September): question round → decisions saved to memory → briefs → workflow (data → build → tests → review → fix) → main session commits with a drafted message → push → CI → staging deploy check (API poll or live URL) → live pass script → phone retest guide → STOP and wait for the next batch.

---

## 12. Tech stack with exact versions and why

Versions below are the **installed** versions from `UI\backend\package-lock.json` on 2026-09-17 (declared ranges in brackets). Runtime on the dev machine: Node **22.15.0**, npm **11.14.1**; CI uses Node 22. Before reusing, check for newer versions first (the security round shows majors can carry critical advisories, and the carried postcss advisory only clears with Next 16).

| Layer | Package / service | Installed (declared) | Why it was chosen / notes |
|---|---|---|---|
| Monorepo | turbo | 2.10.11 (^2.0.9) | Turborepo: separate apps with independent Vercel deploys, shared packages, cached builds; user's explicit choice. Needs `packageManager` in root package.json. |
| Package manager | npm workspaces | npm 11.14.1 (pinned via `packageManager`) | Default toolchain, works on Vercel with `cd ../.. && npm install`. |
| Framework | next | 15.5.25 (^15.1.0) | App Router, server routes keep secrets, first-class on Vercel, Capacitor-wrappable later; upgraded in the security round for a critical RCE advisory. Next 16 deferred until after launch. |
| UI library | react / react-dom | 19.2.8 (^19.0.0) | Largest hiring pool; required by Next 15. |
| Language | typescript | 5.9.3 (^5.5.0) | One language end to end. |
| Styling | tailwindcss / @tailwindcss/postcss | 4.3.3 (^4.0.0) | Tailwind v4 with the prototype's design tokens; the shared `packages/ui/styles.css` carries the ported CSS verbatim. |
| CSS pin | postcss (override) | 8.5.26 | Override for advisories; the copy nested inside Next stays on the documented exception. |
| Auth | next-auth (Auth.js v5) | 5.0.0-beta.32 | Google OAuth + credentials with OTP, JWT sessions, no auth vendor lock-in; beta accepted for v5 App Router support. |
| Password hashing | bcryptjs | 3.0.3 | Pure JS (no native build on Vercel/Windows); admin password uses scrypt from node:crypto. |
| Database | Neon Postgres (+ Object Storage beta) | service; `@neondatabase/serverless` 0.10.4 | Real Postgres that suspends but never pauses/deletes on the free tier; branch-per-environment with copy-on-write DB and bucket; HTTP driver works in serverless and edge. |
| Neon config | @neon/config | 1.0.5 | `neon.ts` declares the private bucket; `neon env pull` validates the branch. |
| ORM | drizzle-orm | 0.45.2 (^0.45.2, override) | TypeScript-first, tiny, tagged SQL templates (parameterised), same on any Postgres; bumped to 0.45.2 for an SQL-injection advisory. |
| Schema tool | drizzle-kit | 0.28.1 (^0.28.0) | `db:push` for the first schema; later additive `.mjs` migrations because push choked on existing keys. |
| Scripts | tsx | 4.23.12 (^4.19.0) | Run TypeScript seed/reset scripts (`.mts` for top-level await). |
| Object storage client | @aws-sdk/client-s3 | 3.1120.0 | Neon Object Storage is S3-compatible (`forcePathStyle: true`). |
| Images | sharp | 0.35.4 (override) | Upload sniffing + re-encode (strips EXIF/GPS), site image pipeline; bumped in the security round. |
| 3D rendering | three | 0.160.1 (^0.160.0) | Port of the prototype's matte viewer; replaced `<model-viewer>` for control over materials and orientation. |
| 3D processing | @gltf-transform/core, /functions, /extensions | 4.5.0 | Share-copy compression (dedup, weld, simplify, prune), orientation fixes, site model build. |
| Mesh compression | meshoptimizer | 0.22.0 in apps (0.18.1 hoisted at root) | Geometry compression for share copies and site GLBs. |
| Server state | @tanstack/react-query | 5.101.4 (^5.51.0) | Caching + automatic polling for async AI jobs. |
| UI state | zustand | 5.0.15 (^5.0.0) | Tiny store mirroring the prototype's `st` object; persist with `skipHydration`. |
| Animation | motion | 11.18.2 (^11.11.0) | Motion for React (ex-Framer Motion) for transitions and sheets; signature logo stays pure CSS. |
| Validation | zod | 4.6.4 | One strict schema per writing route (security round). |
| Email | resend | 6.24.0 | Simple API, domain verification, sign-in codes and ticket emails. |
| Push | web-push | 3.6.7 | VAPID web push from both apps. |
| Errors | @sentry/nextjs | 10.71.0 | Error tracking from day one, PII off with a scrubber. |
| Analytics | posthog-js | 1.422.1 | Funnels and pageviews; cookieless on the landing site. |
| QR codes | qrcode | 1.5.4 | "Scan to open on your phone" on the landing site. |
| Unit tests | vitest | 4.1.11 | Fast TS-native unit/component tests. |
| Component tests | @testing-library/react | 16.3.3; jsdom 29.1.1; @vitejs/plugin-react 6.1.1 | Component rendering in jsdom. |
| PNG tooling | pngjs | 7.0.0 | Generated the monochrome push badge. |
| E2E | @playwright/test / playwright | 1.62.1 (^1.62.1) | Cross-browser e2e with full chromium camera fakes; also used for screenshots, marketing captures and live checks. |
| Performance | lighthouse (npx) | 12.8.2 | Landing page LCP/CLS/TBT gates. |
| AI — text/vision | Google Gemini API | models `gemini-3.5-flash` (match, detect, verify, describe, reasons, packing) | One vendor for matching, detection and images; structured JSON output with response schemas; admin-switchable models. |
| AI — images | Google Gemini image model | `gemini-3-pro-image` (renders) | Highest garment fidelity; cheaper `gemini-2.5-flash-image` kept as an upside option pending quality A/B. |
| AI — 3D | Tripo API v2 openapi | model `v3.1-20260211`, detailed geometry + texture, PBR, 1.5 M faces, align_image | Photo/multiview to rigged-quality GLB; hidden from users. |
| Hosting | Vercel | Pro team (SAML) | Deploy target for all apps; cron; env per project; instant rollback. |
| CI | GitHub Actions | ubuntu-latest, actions/checkout@v4, setup-node@v4 (Node 22), upload-artifact@v4 | Runs the whole pyramid on a Neon CI branch. |
| Dependency updates | Dependabot | weekly grouped | Security alerts + automated fixes. |
| Android wrapper | PWABuilder TWA | test package only | Store presence later without rebuilding the app. |
| Planned | Stripe | — | Payments (restricted key, webhooks, monthly renewal grants). |

Decision framework recorded with the stack (`Assemble - Tech Stack.md`, reusable for any project): (1) team first — mainstream tech you can hire for; (2) time-to-market — buy managed services, build only the product; (3) migration paths over vendors; (4) free tiers that don't pause or delete; (5) match architecture to workload shape (slow AI → async job rows + polling decided in the schema); (6) platform economics (PWA keeps revenue, stores later for distribution only); (7) one language end to end; (8) defer decisions that don't block, but lock their prerequisites (async schema, env-var secrets, storage-path indirection).

Changes from the original plan and why: Supabase dropped for Neon permanently (branches + object storage covered everything); `<model-viewer>` replaced by Three.js; job queue never needed (client polling + cron sweep); Stripe still pending; rate limiting built in-house on Postgres instead of a vendor.
