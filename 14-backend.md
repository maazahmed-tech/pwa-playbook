# 14 — Backend: real AI, "no fakes", security, admin money — all on staging

**Where this sits:** after [13-fullstack-frontend.md](13-fullstack-frontend.md). Assemble called this "Step 2". It ends with an app that is production-ready except for payments, which is [15-payments-and-cutover.md](15-payments-and-cutover.md). Testing method: [21-testing.md](21-testing.md). Security detail: [20-security.md](20-security.md). Session mechanics for the long multi-agent runs: [01-running-the-sessions.md](01-running-the-sessions.md).

## Goal

1. A **second repo** ("backend") that is a clean copy of the frontend repo with a fresh, single-commit history, deploying only to **staging** Vercel projects and a **staging** database branch. The frontend repo keeps serving production untouched until cutover.
2. **Real AI** behind every simulated feature: detection, matching, rendering, packing, verification — with prompts written as pure functions, JSON-schema outputs, server-side validators that refuse invented data, charge-before-call and refund-on-failure, daily caps, mocks in tests.
3. **"Every control either works for real or is removed."** Fixtures only behind the demo check. A written gap checklist tied to tests.
4. **Security** answered item by item against a checklist, with an attack suite that runs on every push.
5. **Admin money**: real cost per AI call, locked settings that need an emailed code, audit trail, profitability page, alerts that never reach customers.
6. Photo quality checks, share links, category model, shop model, sign-in rules, suspension — whatever your product's equivalents are.
7. A rehearsed **cutover runbook** and a client **handover checklist** (both used in [15-payments-and-cutover.md](15-payments-and-cutover.md)).

The rhythm of this milestone is the same every time: **your phone test → one message with a question-round suffix → decisions → briefs → build (often parallel agents) → full pyramid → one push → CI → staging deploy → live pass → phone retest guide → stop and wait for the next batch.**

## Prerequisites checklist

- [ ] The frontend repo green, deployed on the domain, with its Neon `production` and `ci` branches.
- [ ] An **empty private GitHub repo** for the backend (e.g. `<App>_Backend_v1`). PAT scopes: Contents + Workflow on both repos, 90-day expiry. Test it with one `curl` before any push.
- [ ] A fresh short-lived Vercel token (for creating the two staging projects and setting ~30 env vars by API).
- [ ] Neon: a `staging` branch (own DB + bucket) and a `ci-backend` branch forked from staging. Rule reminders in memory: never `neon env pull` for a branch feeding GitHub secrets; migrations to staging + ci-backend the same day; production only at cutover.
- [ ] AI keys, from an **agency** account for now: a Gemini key from Google AI Studio (free tier gives image models **zero** quota — enable billing before building image features), the 3D engine key. Both go into `apps/web/.env.local`, `apps/admin/.env.local` and the **staging** Vercel projects only. Never production.
- [ ] The standing rules written into `templates/CLAUDE.md` for the repo: no AI attribution anywhere; staging/CI databases only; never production; never `neon env pull`; never call real engines in tests (`GEMINI_MOCK=1 TRIPO_MOCK=1`); money in dollars; every change through the full pyramid; one push per round.
- [ ] A model/limit plan for long batches: check your weekly usage before launching parallel agents; agents inherit the session model at launch (switch first). See [01-running-the-sessions.md](01-running-the-sessions.md).
- [ ] Time: Assemble ran this milestone 1–17 Sep 2026; a big batch is 3–6 hours of session time, most of it the e2e suite (36 min → "2.5 hours" as it grew).

## Step 1 — Create the backend workspace (fresh history, staging only)

Plain English: copy the frontend folder to a new folder, remove every trace of AI authorship, start a new git history with one commit, push it to the new repo, and give it its own staging database branch and staging websites. Production keeps running from the old repo.

> **For Claude — paste this:**
> ```
> Before starting Step 2, make a new local folder "backend", copy everything from "front end" into it (exclude node_modules, .next, .git, test artifacts, .claude, .agents), and we do Step 2 there; keep "front end" and its repo as the production backup. I'll give you a new repo. Build locally first. No mention of AI authorship anywhere — commits, comments, docs, tests — this is presented to the client: sweep every file, rewrite the README as a client-presentable document, remove internal scope docs. Keep Neon (never Supabase). Every change goes through the full test pyramid and Playwright e2e.
> Before we proceed, ask me at least 5 questions so you can fully understand what I'm trying to achieve. Ask the questions one at a time, and for each question, give me multiple-choice options to choose from. Clearly highlight the option you recommend and briefly explain why. Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf.
> Then: git init with a single clean commit as [OWNER <noreply>]; push to [new repo] main (curl-check the PAT first; inline token only); create Neon branch `staging` (own DB + bucket) and point apps/web/.env.local at it; create Vercel projects [app]-staging-app (root apps/web) and [app]-staging-admin (root apps/admin) linked to the new repo with all env vars copied except production-only ones; force the first builds via the deployments API if the empty commit is cancelled; run the full pyramid against staging; report the two staging URLs.
> ```

Then, **immediately**, the CI of the new repo: fork `ci-backend` from staging, save its credentials once in a gitignored `.env.ci-backend`, set the Actions secrets (`DATABASE_URL`, `AUTH_SECRET`, admin secrets, the `AWS_*` storage set), re-run the workflow. Assemble's backend CI failed on every commit for a day because a copied workflow has no secrets.

> **Assemble example.** 1 Sep 2026, 04:19–04:52: `robocopy`, attribution sweep, single commit `8db0952`, staging branch, staging projects created by API, pyramid green (29 unit + 50 e2e). 11:29: "whats this i got?" — a CI failure email → `ci-backend` branch + 8 secrets → green in 7m25s. Decisions in the 7-question round: fresh history; old repo serves production until cutover; Step 2 = A (matching + detection) then B (2D render engine); payments stay simulated → Step 3; staging projects + staging DB branch; config caps + wallet-style alerts + token logging for the AI; **"never switch — I'll tell you later."**

## Step 2 — Real AI, part A: detection and matching

Plain English: the AI is a library call with a prompt and a schema. Keep the prompts as **pure functions** (testable without the network), validate every answer against real data, charge before the call, refund on failure, and mock it all in tests.

> **For Claude — paste this:**
> ```
> Step 2 part A on the backend repo (staging only, never production). Key is in apps/web/.env.local as GEMINI_API_KEY (verify it by listing models and one smoke generation; set it on the staging Vercel projects only).
> Build:
> - lib/gemini.ts: a REST client with generateJson<T>({model, system, user, images, schema}) using responseMimeType application/json + responseSchema, safety settings from an admin switch, usage (token counts) returned, friendly errors for quota/overload ("at capacity — you weren't charged"), and a geminiMocked() switch (GEMINI_MOCK=1 or no key) that returns deterministic results built from the caller's real data (never a fixed fixture that writes the same facts onto every row).
> - lib/aiPrompts.ts: PURE prompt builders + JSON schemas + validators, unit-tested: detect (clamp to the taxonomy; refuse when the model is confident the photo is unusable), match (must-include item enforced: retry once then swap it in deterministically; validateOutfit resolves references to REAL owned items and drops invented ones; closet-only mode strips shop items).
> - lib/aiGuards.ts: liveConfig (config row over defaults), per-user daily AI cap, charge() (balance + ledger row) before the call, refund() on failure.
> - Routes /api/ai/detect and /api/ai/match (and in-place refine): charge → call → validate → persist to the generations job row → refund on failure. The loading screen is the orchestrator; results/detail/detect screens read persisted data.
> - Admin: model selectors (validated ids) and 7-day usage stats.
> Tests: unit tests for every prompt builder and validator; e2e with GEMINI_MOCK=1 on EVERY test server (web and admin). Full pyramid, push, CI, then one live run on staging with the real model and report latencies.
> ```

> **Assemble example.** 1 Sep 04:58–05:36 (`591d5ac`): 38 unit + 54 e2e; live on staging, matching took 10.8 s (two valid looks, all items owned) and detection 14 s. The mock later had to become **category-aware** because the local suite (which runs against staging) wrote "hoodie" facts onto every shared row and confused the render verifier.

## Step 3 — Real AI, part B: renders, packing, everything else except payments

> **For Claude — paste this:**
> ```
> Proceed to part B and all remaining parts: keep testing yourself and complete the whole app without stopping — everything except payments. Never switch production. Before we proceed, ask me at least 3 questions [standard suffix].
> Include: /api/ai/render (a look renders once on open with a shimmer, cached on the look with a unique storage key; the base person is the user's full-body photo if set else a gender-matched generic model; up to 5 garment references; first render free, re-render after a swap paid), from-outfit 3D (the 2D render feeds the 3D engine; clean 409 if no render yet), AI packing lists (real closet, saved as drafts), Surprise me, Compare from generated looks, closet-aware shop ranking, admin render-model selector, daily cap and stats covering renders and packing. 
> ```

> **Assemble example.** 1 Sep 06:00–06:41 (`c050c86`), with a context compaction at 06:12 mid-build: 42 unit + 56 e2e; live match 9.8 s, packing 5.9 s; **image renders returned "quota exceeded"** because the free tier has no image quota. Billing was enabled on 9 Sep (AI Studio → API keys → "Set up billing", no new key needed); the first real render took 9.8 s, the cached call under a second, the swap re-render charged 1 credit. Until then the app showed a friendly "engine at capacity, you weren't charged" instead of Google's raw error.

## Step 4 — Feature rounds (the shape of every one)

Each of these started with your phone findings + the question-round suffix, sized 5 (bug pair), 10 (feature), 15–30 (a subsystem), 50 ("make everything real"). Claude often reads the code **before** asking so the options describe current behaviour. What Assemble built, in order, as examples of the shapes you will meet:

| Date | Round | What it taught |
|---|---|---|
| 9 Sep | Profile photo upload (6 q) | A migration that changes live behaviour (moving Google photo URLs) is applied to **backend branches only** until cutover |
| 10 Sep 00:22 | "Match around an item didn't include the item" (6 q) | A **hard rule enforced server-side**: retry once, then fix deterministically; refuse before charging when nothing is chosen |
| 10 Sep 01:42 | "Don't write code — how does sharing actually work today?" | Honest answer: no public links existed. Led to a 30-question round: token links, public page, votes/comments with a first name, revocable, one link per look, a **lighter share copy of each 3D model** (41 MB → 3.9 MB in 3.9 s, geometry-only) |
| 10 Sep 22:39 | Render fidelity (10 q) | Detection records how a garment is **constructed**; all angle photos + facts go into the render; a verifier pass with a free "Render again" instead of a silent retry; rank swaps by rules, not another AI call |
| 11 Sep 00:15 | Refuse multi-item photos (5 q) | The check runs **inside** the detection call, a refusal is free, refuse only when confident |
| 11 Sep 21:38 | "A black image was accepted" + "think of other such scenarios" (10 q) | **Ten refusal kinds** in one call; duplicate warning; avatar-only sharing |
| 12 Sep 21:58 | Avatar photo checks (5 q) | Same rules per slot before saving; a 3D build never starts on a bad set |

> **For Claude — paste this (bug report that scales to a family of fixes):**
> ```
> I did [steps] on [account] and got [wrong result]; expected [right result]. [Screenshot attached.] Think of other similar scenarios too so [flow] is accurate and bug-free. Before we proceed, ask me at least [N] questions [standard suffix].
> ```

## Step 5 — The "zero gaps" launch-readiness round

Plain English: ask for **no fakes**. Claude audits every control that only shows a toast, every toggle that lives only in the browser, every placeholder modal, every roadmap string, and turns the findings into 50 decisions and one big push with a written checklist where every row names the test that proves it.

> **For Claude — paste this:**
> ```
> [bugs seen on staging]. I want the backend to have zero gaps: everything must work for real in both the app and the admin, ready for real users; the only thing left behind is payments (test-mode checkout, clearly labelled). Before we proceed, ask me at least 50 questions [standard suffix].
> While asking, audit the code: list every control that only shows a toast, every client-only toggle, every fixture leak, every placeholder modal, every unwired admin control, every copy line promising something the app doesn't do, every roadmap string shown to users. Rule: every control either works for real or is removed — demo fixtures only behind the demo check.
> After the round: write LAUNCH-READINESS.md in the repo (one row per gap: decision / status / the unit or e2e test that proves it) and build it with parallel agents on disjoint file sets, then the full pyramid, one push, CI, staging live pass, phone retest guide.
> ```

> **Assemble example.** 10 Sep 03:12–06:41 (`9ee4234`): the audit found 31 toast-only controls, 22 client-only toggles, 17 fixture leaks, 13 placeholder modals, 20 unwired admin controls, 11 false promises in copy, 9 roadmap strings. Decisions included real store links, real filters, real replies/reports, password reset by emailed code, account deletion only (no export), demo hidden at `/demo`, realistic packing lists (one outfit per day + essentials + "don't forget"), dead admin pages deleted, legal drafts editable in admin, emails limited to sign-in codes and tickets ("nothing else"), a **copy-audit unit test** that fails the build on banned strings, one big push. Five parallel build agents (account/auth; shop/products/ads/brands; closet/items/outfits; social/sharing/reports/support; packing/admin ops); the main session integrated, extended account deletion to cascade into the new tables, and ran the suite: 148 unit tests, 18 spec files, a 30-check live pass. Context compacted right after the 50th answer and work resumed from the summary.

## Step 6 — The second big audit: categories, shop, admin operations, cutover rehearsal

Ask for "a clean audit of anything left or non-functional in the app or admin" together with the feature asks you have accumulated. Assemble's 50-question round (11 Sep) produced three staged pushes, one migration each:

1. **Category model** (fixed groups, editable categories, one-piece and not-styled flags, retire-with-replacement, bulk re-file by name with leftovers for review) and demo facts frozen into the seed from one AI describe pass.
2. **Shop model** (structured price in minor units with one shop currency, extra photos, product facts described on save, hide not delete) and **admin operations** (a user detail page with names and counts only — never photos; AI accounts with budgets and warnings; broadcast targeting with a preview count). A real bug caught by local e2e: a price edited in admin was scaled twice (120 → 1,200,000 minor units).
3. **Audit fix set**, help centre, closet filters, and **cutover tooling**: `tools/cutover/config.mjs` (idempotent config-row upgrade) and `tools/cutover/verify.mjs` (PASS/FAIL list), rehearsed on a **Neon fork of production** — every migration applied cleanly, then the fork deleted — and `CUTOVER-RUNBOOK.md` committed.

> **For Claude — paste this (cutover rehearsal):**
> ```
> Rehearse the production cutover without touching production: create a Neon branch forked from production, run every pending migration in order against it, then tools/cutover/config.mjs and tools/cutover/verify.mjs; stop on the first FAIL; report every result line; delete the fork. Write CUTOVER-RUNBOOK.md: preconditions from the client, the rehearsal commands, the production sequence (restore-point branch, migrations, config, verify, env var lists per project by NAME, connect the production projects to this repo, smoke tests), rollback (instant Vercel rollback; additive DB keeps the old build working), after-cutover admin tasks, known items. No secret values in it.
> ```

## Step 7 — Security round: answer a checklist with evidence, then attack your own app

Plain English: take a standard 20-point list (hide keys, RLS, IDOR, git secrets, admin routes, user isolation, rate limits, storage, input validation, unauthenticated routes, SQL injection, sensitive logs, field tampering, uploads, server logic, trimmed responses, sessions, dependencies, record access, attack yourself) and ask, per item, "do we have it, does it apply, what's missing". Then fix and re-run until clean. Full detail in [20-security.md](20-security.md).

> **For Claude — paste this:**
> ```
> Here is a security checklist a developer gave me: [20 items]. Tell me for each whether we already have it, whether it applies to our stack, and what's missing — with evidence (test or code path). Before we proceed, ask me at least 25 questions [standard suffix].
> Then one push: fixes, an attack suite kept as e2e (IDOR, user isolation, record access, field tampering, SQL injection payloads through every text field, unauthenticated route sweep, spoofed Origin, cron secrets, upload sniffing), a git-history secret scan plus a scanner on every push, an npm audit gate with dated exceptions, Dependabot, SECURITY.md mapping each of the 20 items in the developer's own wording to the proof, and a one-page plain-words SECURITY-SUMMARY.md. If the scans or attacks find any problem, fix it, verify again, and repeat until everything is clean. Don't push until then.
> ```

> **Assemble example.** 12–13 Sep (`6677cba`): 16 of 20 in place or added, RLS deliberately not applicable (no browser ever reaches the database; one server role; isolation proven by tests), three left for after launch (CSP, external pen test, hosting firewall rules). Added: DB-backed rate limits, server-side revocable admin sessions with a 5-guess 2FA limit, per-user session version (password change signs out other devices), zod schema per writing route, upload content-sniff + EXIF/GPS strip, log scrubber with Sentry PII off, Origin check on state-changing calls, three security headers. Found by the signed-out route sweep: three routes accepting anonymous calls (ad tracking, friends list, product feedback). Dependency fixes: a critical Next.js advisory, drizzle-orm, sharp; one nested PostCSS advisory kept as a **documented exception with an expiry date** after which the build fails. The model usage limit was hit mid-build; after "model changed continue" Claude assessed what survived rather than restarting. Full suite 200/0 after four spec-side fixes.

## Step 8 — Pricing and admin money (config-driven, locked, audited)

Prices live in **app config** (a database row over code defaults), never in code paths, so the landing page, app and admin all read one source. When the pricing model from [16-growth.md](16-growth.md) is decided:

- one migration (flags, defaults) + a **reprice step** in `tools/cutover/config.mjs` so any environment lands on the same prices whichever runs first — and **run it again after the deploy**, because an old build still running can write its own defaults back;
- admin **save lock**: every setting that changes what users pay or get needs a six-digit code emailed only to the owner address, valid 10 minutes, five wrong guesses = one-hour lockout, a correct code unlocks for 15 minutes; every change audited (who, when, old, new) and alerted;
- **real cost per AI call** stored on the job row at call time from token counts × provider prices in config (as a whole number in a unit fine enough that a call costing under $0.01 is not rounded to zero — the column is `generations.cost_cents`; display is always in dollars), replacing typed per-call estimates;
- a **profitability page** (month selector, revenue labelled "simulated until payments go live", real AI cost by feature, editable fixed-cost list, margin, top-cost users, a plain-language "how this is calculated" panel);
- **admin notifications** in the admin panel only — never in a customer account (you received AI budget alerts in the app because your admin email was also a user);
- broadcasts with history and delivered/failed counts, audiences resolved on the server.

> **Assemble example.** 15–16 Sep: pricing implemented (`c177626`, migration 014) after "now implement the 70% pricing everywhere in app, admin and landing page"; push A admin money (`d1e209d`, migration 015) and push B product rules (`0c1b0b4`, migration 016) as consecutive workflow runs; the adversarial reviewer found 13 defects in push A (profit counted giveaways twice, concurrent wrong OTP guesses bypassing the limit, fabricated delivery counts…) and 6 in push B — **tests passing ≠ numbers correct**, always review adversarially.

## Step 9 — The batch workflow (data → parallel build → tests → adversarial review → fix loop)

From push A onward, every batch ran as a scripted workflow (see `templates/workflows/` for the script skeletons and `templates/briefs/` for the briefs; [01-running-the-sessions.md](01-running-the-sessions.md) §8 explains running it):

1. **Question round** → decisions saved to memory and written into a brief.
2. **Briefs** in the scratchpad: a common brief (repo map, hard rules, database rules, migration style, verification ladder, "where things already are (verified)", the exact API contract both sides code to, test conventions, report format under N lines) and one brief per agent with "files you own".
3. **Data agent** (schema, migration on staging + ci-backend, defaults, seeds, cutover script, docs).
4. **Parallel build agents** on disjoint file sets against the fixed API contract. Agents never commit. Agents run their own typecheck and unit tests, never builds or Playwright, and **wait on a marker file** while the main e2e runs (a parallel run alongside other CPU work failed 30 tests on timeouts).
5. **Tests agent**: full ladder; transient DB drops → re-run only those spec files and report both; real failures → fix and re-run the full suite; "do not end your turn while it runs".
6. **Adversarial reviewer** with a JSON schema `{refuted, defects[], notes}` trying to refute the build against the brief; then a bounded fix loop (fixer → tests → re-reviewer, max two rounds).
7. The **main session** commits (message written to a file first, attribution grep, secrets scan on the staged tree, explicit paths — never `git add -A`), pushes, watches CI and the staging deployments, runs the live pass script, resets the staging demo, writes the phone retest guide, and **stops**.

> **For Claude — paste this (build-agent brief skeleton):**
> ```
> You are build agent [X] for [round]. Own only these files: [list]. Do not edit shared files [list]; note needed changes in your report. Rules: no AI attribution anywhere; follow existing patterns in [paths]; every behaviour change gets a unit test in apps/web/tests or an e2e case in tools/e2e; staging and ci-backend databases only, never production, never `neon env pull`; never call real engines (GEMINI_MOCK=1 TRIPO_MOCK=1); do not commit, push, stash or change git state. Gates before reporting: typecheck the app(s) you touched; run vitest for your test files. Do NOT run builds or Playwright. If [scratchpad]/E2E-RUNNING exists, wait until it is gone. Report under 60 lines: files changed, tests added, checklist rows (LAUNCH-READINESS.md section [S]) completed, anything left for integration.
> ```

> **For Claude — paste this (end-of-round verification):**
> ```
> 1. Typecheck web and admin. 2. cd apps/web && npx vitest run. 3. NEXT_PUBLIC_DEMO_LOGIN=1 npx turbo run build. 4. Free ports 3000/3001; E2E_DB=1 npx playwright test (never while a build is running; one worker). Fix failures, re-run the affected specs, then the full suite. 5. npm run security:secrets && npm run security:audit. 6. Write the commit message to a file; grep the staged tree for AI attribution; commit as [OWNER <noreply>]; push (curl-check the PAT first). 7. Watch both staging deployments to READY (trigger via the deployments API if main is not picked up) and GitHub Actions to success. 8. Run the live staging script against real models; open public pages in a real browser. 9. Reset the staging demo (unless in use) and clean test files from the bucket. 10. Report: result, what changed, root causes, verification table, numbered phone retest guide (App / Admin), loose ends, waiting on me. Production untouched. Then stop and wait for the next batch.
> ```

## Step 10 — Smaller batches near the end (what they look like)

- **Batch 3 (16–17 Sep, `ddc5496`, migration 017)**: admin-editable lists drive every chip in the app (a consumer test per admin list — hard-coded chips had ignored them); one sign-in method per email in both directions; receivers of shared looks never see shop pieces; "Copy link" creates the link when the sheet opens and copies **inside the tap** (phones block clipboard after an awaited request); suspended accounts get a 403 `{code:"suspended"}` everywhere, an app-wide sign-out modal with the support address, sessions ended at once; dashboard charts month-to-date.
- **Render layering fix (17 Sep, `db4225c`)**: a rulebook (no two base tops; layer order stated; the avatar photo used only for face, hair, body and pose — accessories worn in the photo removed unless in the outfit) with server-side removal, a post-render check and a free redraw. Built **directly by Claude without a workflow**, with **targeted tests only** ("don't play the whole 2.5-hour suite"): typecheck, the relevant unit tests, the match/render/swap spec files, one real paid render on staging (about $0.17), full suite left to CI.
- **Demo profile hygiene (13 Sep)**: renamed to a neutral identity with a reserved-domain email; the nightly reset writes the identity itself (otherwise it restores the old name); credentials no longer prefilled on login; the demo entry hidden at `/demo` and compiled in only where `NEXT_PUBLIC_DEMO_LOGIN=1`.

## Step 11 — Documents this milestone must leave behind

- `LAUNCH-READINESS.md` — every gap, decision, status, proving test; sections added per round.
- `CUTOVER-RUNBOOK.md` — rehearsed; env var names per project; rollback.
- `SECURITY.md` + `SECURITY-SUMMARY.md`.
- `CLIENT-HANDOVER-CHECKLIST.md` — who owns what (code, CI, hosting, DB, monitoring stay with the agency; domain, AI billing, 3D engine, email, Google sign-in, admin login, app stores and payments in the client's name), a checklist table with "when needed", **safe key handover** (an expiring secret link or by phone — never chat, email or a shared document), step-by-step per service with links, what happens after.
- `README.md` — client-presentable, no AI mentions.
- Memory notes per service failure mode with a verification step; the chat archive refreshed after each batch ([01-running-the-sessions.md](01-running-the-sessions.md)).

## Pitfalls (backend)

| Symptom | Cause | Fix / prevention |
|---|---|---|
| CI red on every commit of the new repo | Copied workflow, no Actions secrets | CI database branch + secrets before the first push |
| `robocopy` "failed" with exit code 1 when copying the folder | Exit code 1 means "files copied" on robocopy; only 8 and above are errors | Read the exit code table; exclude `node_modules`, `.next`, `.git`, `.claude`, `.agents`, test output |
| Renders "quota exceeded" while text works | Image models have zero free quota | Enable billing on the AI Studio project before building image features; friendly copy meanwhile |
| All staging AI suddenly 429 | Prepaid AI credit ran out (13–14 Sep) | Budget alerts; check key health before big generation jobs; keep a generation ledger so reruns don't pay twice |
| Local test run "poisoned" staging rows | Mock wrote identical facts onto shared rows | Input-dependent mocks; or run local e2e on an isolated branch |
| Exact balance assertions flake | Parallel specs spend the same demo credits | Assert ledger events; dedicated account per spec family; `workers: 1` |
| Overlapping CI runs collide | Back-to-back pushes share one CI database | `concurrency: group` in the workflow (needs the `workflow` scope); one push per round |
| Tests fail with a missing prerender manifest | A build regenerated `.next` while Playwright started a server | Never run tests during a build; agents park on a marker |
| Two e2e runs "passed" on old code | Playwright reused a server left from a killed run | `reuseExistingServer: false`; free the ports after aborting |
| 12 failures in under a second | DNS/network outage, not code | Check connectivity first; resumable workflows |
| Public share page blank on phones | Page outside the app shell rendered behind the fixed background | A layout for public routes; open every public route logged-out in a real browser (curl can't see client-rendered pages) |
| `sharp` fails on model textures | libvips issue on the machine | Geometry-only GLB compression |
| Inline shell scripts break on apostrophes and em dashes | Quoting | Write `.cjs`/`.mjs` files; use Edit |
| Scratch scripts can't resolve modules / get committed | Outside the workspace; `git add -A` | Run from inside the app folder then delete; stage explicit paths |
| Admin toasts block clicks in specs | Blocking dialogs for success | Non-blocking success bar; errors stay dialogs |
| `page.route` mocks ignored | The PWA service worker intercepts fetches | `serviceWorkers: "block"` in e2e contexts that mock |
| Seed data shows for a minute after load | `initialData` counted as fresh | `initialDataUpdatedAt: 0` |
| Staging keeps an old AI model after the default changed | The stored config row wins over code defaults | PUT through admin or `config.mjs`; a cutover config step for production |
| Adding a second photo wiped the first | Shallow merge of a nested profile object | Per-slot merge; test "add second value, first survives" |
| A feature greyed out on the demo | Demo content was a bundled list, not database rows | Demo content uses the same storage path as real data (the reset inserts rows) |
| Sharing one thing opened another | Silent fallback | Never substitute data silently; fail or ask |
| Returning Google users re-onboarded | No "set-up done" state checked after OAuth | Store completion on the account; a landing page decides by flag, profile or account age |
| Delete account "did nothing" | Confirm word case-sensitive; feedback only a small toast | Case-insensitive; "Deleting…" state; server reason shown; prove the server path in a rolled-back transaction |
| Price edited in admin became 10,000× | Conversion applied in the form and the API | Convert once; e2e the admin edit-and-reload round trip for money fields |
| CI-only UI flake (a consent tap never registered) | Runner timing | Keep the API-level test in CI; move the UI-timing test local-only; download CI traces |
| Question answered with an instruction (paste slip) | Human error | Claude uses the recommended option and says so; re-read answers |
| Model usage limit hit mid-build | Weekly allowance | Estimate batch size first; switch model before launching agents; on resume, assess surviving work |
| Nested dependency advisory cannot be overridden | Framework pins its own copy | Documented, dated, self-expiring exception; never disable the gate |
| SECURITY.md mapped the wrong list | Followed Claude's internal contract | Lead with the requester's list verbatim |
| Attack suite raced other specs | Shared throwaway accounts | Dedicated `prober`/`victim` accounts; update teardown lists |
| Test assumed staging was empty | Real sign-ups on staging | Assert the specific record, never global emptiness |
| Dependabot run mistaken for CI failure | Same commit, different workflow | Watch the CI workflow by name; consider ignoring Dependabot branches in Vercel |
| Vercel didn't build `main` | Queue busy with Dependabot branches | Trigger deployments by API with `gitSource` + sha; poll by sha |
| Removed config keys came back on staging | Old build wrote its defaults before the new deploy | Reprice/config script after deploy, not only before |
| A silent auto-render became a hidden charge | Pricing changed under an automatic paid call | Audit every automatic paid call when pricing changes; make paid actions explicit buttons |
| Closet photos refused as "no person in the photo" | Camera context persisted from the avatar flow | Every entry sets its context; never persist transient flow context |
| Admin alerts appeared in a customer account | Alerts were in-app notifications to the admin's user | Admin notifications table + panel section |
| Clipboard/share failed on phones | Awaited a server call before the clipboard | Prepare the link when the sheet opens; act inside the tap; selectable fallback |
| `sql.raw` slipped into a new admin route | Convenience | The SQL-scan unit gate caught it; keep the gate |
| Half-deployed state if a round is abandoned | Migration/config applied before the code shipped | Finish the round; apply config close to the deploy |
| Background agent ended its turn while its build ran | Nothing to wake it | Brief: wait in the foreground; report only when done |
| Two sessions building the same app | Shared output folder | Check for running builds; confirm fresh output; one owner per output |
| Vercel token stopped working again | SAML re-sign-in | Verify with one call; rely on auto-deploy meanwhile |
| Claude Code's own login expired mid-message | OAuth token expiry | Re-send the message |
| Stale `.git/index.lock` | Old crashed process | Remove the lock file when no git process exists |

## What to carry forward

- `CUTOVER-RUNBOOK.md`, `CLIENT-HANDOVER-CHECKLIST.md`, the migration list and `tools/cutover/*` → [15-payments-and-cutover.md](15-payments-and-cutover.md).
- App config as the single source of prices → the pricing formula in [16-growth.md](16-growth.md) writes into it.
- The workflow shape, briefs and agent rules → `templates/` and [01-running-the-sessions.md](01-running-the-sessions.md).
- The attack suite, gates and scanners → [20-security.md](20-security.md) and [21-testing.md](21-testing.md).
