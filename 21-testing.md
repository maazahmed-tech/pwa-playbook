# 21 — Testing and verification

Part of the Assemble replication guide. Index: [00-index.md](00-index.md). Related: [20-security.md](20-security.md) (the attack suite and scan gates), [13-fullstack-frontend.md](13-fullstack-frontend.md) and [14-backend.md](14-backend.md) (where the suites are built), [01-running-the-sessions.md](01-running-the-sessions.md) (durations, background runs), [40-pitfalls-master-list.md](40-pitfalls-master-list.md) (section F).

The user's standing sentence for this chapter, said on 9 Sep 2026 when Claude proposed a manual test script instead: *"for testing we should use the Playwright e2e three-pyramid verification system we have. remember?"* Every change to the app, however small, goes through the same bar. This chapter explains that bar in plain words, gives the real configuration and commands, and covers the earlier prototype stage where the "tests" were browser scripts on a single HTML file.

Contents: 1 the idea, 2 prototype-stage verification, 3 the full-stack pyramid, 4 unit and guard tests, 5 Playwright end-to-end, 6 mocks, 7 test databases and accounts, 8 CI, 9 live checks and proofs, 10 the phone retest guide, 11 targeted vs full runs, 12 flakiness lessons, Assemble example, pitfalls.

---

## 1. The idea in one paragraph

A **test pyramid** is three layers of automatic checks: many fast **unit tests** (a function gets an input, we check its output), a **build** of every app (the compiler and the framework refuse broken code), and fewer slow **end-to-end (e2e) tests** that drive a real browser through the real app against a real database with the paid AI engines replaced by fakes. On every push a machine in the cloud (**CI**, "continuous integration") repeats the whole thing on a database of its own. After the deploy, a **live check** script talks to the deployed staging URLs, once with the real engines, and then you get a short **phone retest guide** because only a real device proves install banners, cameras and dark mode. Nothing merges, and nothing is called "done", without this.

> **Why so much?** The app charges money in credits, handles people's photos and calls paid engines. A wrong number or a leaked photo costs more than a 40-minute test run. The suite caught, before users did: a price scaled twice (120 became 1,200,000), a test server calling a real paid model, a route answering signed-out, a shallow merge that wiped a photo, and a stale username in a share.

---

## 2. Prototype stage: verifying a single HTML file

The wireframe and UI prototypes were one self-contained HTML file with two JavaScript controllers (`U` customer, `A` admin), screens as `<section data-screen="...">`, modals as `<div data-modal="...">`, and every interaction expressed as a data attribute (`data-nav`, `data-open`, `data-act`, `data-back`, ...). That structure is what made automated verification possible without a test framework.

The eight checks, strongest first:

1. **Structural audit** (a Python or Node script over the HTML): parse every `data-screen`, `data-modal`, `data-nav`, `data-open`, `data-act`; report broken targets, orphan screens, dead controls (a button with an action class but no attribute), and `act()` cases that are never handled. Run after **every** edit batch. It caught an over-deletion (a modal removed while another screen still opened it).
2. **Click crawl** in the browser: for each screen, navigate there, click every `[data-nav],[data-open],[data-act],[data-rg],[data-chip],button`, restore state, count `window.onerror` and console errors. Numbers seen: 1,167 controls / 0 errors; later 526 controls / 61 screens.
3. **State-mutation tests**: assert that something *changed* (buy 100 credits → balance 111; subscribe → ads gone and Saved unlocked; "Wear today" → history grows; a filter chip → fewer cards; compare dropdown → table rebuilt). A control that only toggles its own highlight is a bug.
4. **Responsive sweep**: at 375, 768 and 1440 px, visit every screen and flag any element whose right edge exceeds the viewport unless it sits inside an `overflow-x:auto` parent; measure tap targets (44 px chips, 16 px inputs on touch), pinned nav geometry, auth centring.
5. **Coherence check** between admin and customer data: occasions, style tags, weather values, plan and pack prices, ticket ids must match exactly, because the prototype becomes the backend's spec.
6. **Traceability matrix** against the proposal (`Assemble - Coverage.html`, 230 items → built / design phase / out of scope, no percentages).
7. **Deploy parity**: fetch the live URL and grep for markers that exist only in the latest commit; check the root redirect returns the app, not 404.
8. **Manual click-through on a real phone and desktop by you.** This is the only layer that caught the blank admin panel (login panel pushed below the fold), content stuck at the bottom (a stray `</div>` from a regex removal), tabs that did not filter, back-button loops and a detail screen that always showed the same item.

**Screenshots were unreliable** (the in-app screenshot tool timed out for most of July and on heavy-blur pages), so verification moved to DOM measurement: active screen, `getComputedStyle`, `getBoundingClientRect` (and *is the element inside the viewport*, `rect.top < innerHeight`, not just present), `document.elementFromPoint`, `document.getAnimations()` play state, `matchMedia('(prefers-reduced-motion: reduce)')`, `document.documentElement.scrollWidth > innerWidth`. When real images were needed, `puppeteer-core` drove headless Edge (no Chrome on the machine).

Drive the prototype through real clicks, never internal functions: the controllers are closure-scoped, and the app starts on a launcher, so click `[data-enter="user"]` first or nothing happens.

> **For Claude — paste this (prototype verification, before every push):**
```
Before pushing the prototype:
1. Run the structural audit script over the HTML (screens, modals, broken data-nav/data-open targets, orphans, dead controls, unhandled data-act cases). Zero broken links required.
2. In the browser pane, enter the app via [data-enter="user"] (and admin via its launcher card), then crawl: for every screen click every data-* control and button; count console errors (must be 0).
3. State-mutation tests via DOM clicks (not controller functions) for every flow changed this round and every credit gate and plan gate: assert the visible change (balance, labels, list lengths, unlocked screens).
4. Back-navigation test: from each deep screen press back repeatedly; no two-screen bounce; loading screens never appear in history.
5. Responsive sweep at 375, 768 and 1440: no horizontal overflow except intentional chip scrollers; auth screens centred; pinned nav at the bottom.
6. Coherence: admin lists, prices and ids equal the customer app's.
7. If screenshots time out, verify with DOM measurements and say so; check elements are inside the viewport, not merely present.
8. After push: fetch the live URL and grep for 3+ markers that exist only in this commit.
Report with numbers (screens, modals, controls, errors) and list anything you could not verify so I can click it myself.
```

---

## 3. The full-stack pyramid

From Step 1 (28 Aug 2026) every change runs this ladder locally, then CI repeats it:

| Step | Command (from the repo root unless noted) | What it proves | Time seen |
|---|---|---|---|
| 1 Typecheck | `npx tsc --noEmit -p apps/web/tsconfig.json` and `npx tsc --noEmit -p apps/admin/tsconfig.json` | no type errors | 1–2 min |
| 2 Unit + component | `cd apps/web && npx vitest run` (also `apps/site`) | pure logic, prompt builders, validators, guard tests | 1–2 min |
| 3 Build | `NEXT_PUBLIC_DEMO_LOGIN=1 npx turbo run build` (or `npm run build`) | every app compiles and prerenders | 4–8 min |
| 4 Free ports | `netstat -ano \| grep ":300[01]"` then `taskkill //F //PID <pid> //T` (Git Bash on Windows) | no stale server from a killed run | seconds |
| 5 E2E | `E2E_DB=1 npx playwright test` | real browser, real DB (staging), mocked engines, both device projects | 30–45 min at ~210 tests, one worker; "2.5 hours" by 243 tests |
| 6 Security gates | `npm run security:secrets` and `npm run security:audit` | no secrets in the tree; no unexcepted high/critical advisories | 1 min |
| 7 Commit and push | message from a file, no AI attribution, inline-token push | — | 1 min |
| 8 CI | GitHub Actions repeats 2–6 on the `ci-backend` branch | independent machine, Linux | 5–25 min |
| 9 Deploy watch | poll Vercel for the commit SHA until READY (or trigger via API if the queue skipped it) | the build that will serve users | 4–5 min per app |
| 10 Live check | `node <scratchpad>/live-pass.mjs` against the staging URLs, including one real paid call when the change touched an engine | the deployed thing works with real providers | 1–5 min |
| 11 Demo reset | `DATABASE_URL=<staging> npm run db:reset-demo --workspace @assemble/db` (skip if the demo is in use) | presentations start clean | seconds |
| 12 Phone retest guide | numbered steps in chat | what only a device proves | — |

Rules learned the hard way (each one was a real failure):

- **Never run tests while a build is running.** `.next` is regenerated under a running `next start`; specs fail on a missing prerender manifest.
- **Never run `next dev` in a directory currently served by `next start`**; both write `.next`.
- **The machine must be idle during e2e.** Running `tsc`/`vitest`/agents alongside caused 30 hydration-timeout failures that passed alone. Parallel agents wait on a sentinel file (`E2E-DONE`) before doing anything heavy.
- **One worker** locally and in CI, because spec files share the demo and test accounts. It costs ~10 minutes; it makes the bar trustworthy.
- **`reuseExistingServer: false`.** Two runs once passed against a stale server left by a killed run.
- **A push per round**, because overlapping CI runs share one database (later enforced by a `concurrency` group).

> **For Claude — paste this (end-of-round verification):**
```
Run the full bar, in this order, on an otherwise idle machine:
1. Typecheck apps/web and apps/admin. 2. cd apps/web && npx vitest run (and apps/site if touched).
3. NEXT_PUBLIC_DEMO_LOGIN=1 npx turbo run build. Never start tests while this runs.
4. Free ports 3000/3001. 5. E2E_DB=1 npx playwright test (one worker). Transient DB drops (ENOTFOUND, "connection terminated", many failures in under a second) → check the network, re-run only those spec files, report both results. Real failures → fix, re-run the affected specs, then the full suite again.
6. npm run security:secrets && npm run security:audit.
7. Write the commit message to a file; grep the staged tree and message for AI attribution (must be empty); check git status for scratch files; commit as [GITHUB_USER] <noreply>; push with the inline token URL.
8. Watch GitHub Actions ("CI" workflow, not Dependabot) and both staging deployments to READY in the background; trigger the deploy via API if the SHA is not picked up.
9. Run the live staging script; open every public page in a real logged-out browser (curl cannot see client-rendered pages); one real paid call if an engine changed, then delete the test data.
10. Reset the staging demo unless it is in use. Clean test files from the bucket.
11. Report: result line → what changed → root causes → verification table with counts → numbered phone retest guide → loose ends → what is waiting on me. Production untouched.
```

---

## 4. Unit and guard tests (Vitest)

Location `apps/web/tests/*.test.ts(x)` (42 files, 456 cases on 17 Sep 2026) and `apps/site/tests/unit`. Config `apps/web/vitest.config.ts`: `jsdom` environment, globals, `@vitejs/plugin-react`, aliases `@` → `apps/web` and the `@assemble/db/*` subpaths → package sources (subpath aliases listed **before** the bare alias, or the bare one swallows them). Run from the app folder (`cd apps/web && npx vitest run`); running from the root once found no tests.

The design principle that makes this layer valuable: **pure logic lives in `lib/` as functions, so it can be tested without a server.** In particular:

- **AI prompts are pure functions with JSON schemas and clamp validators**, all unit-tested (`aiPrompts.test.ts`, `matchPrompt`, `renderPrompt`): the detect prompt clamps to the taxonomy; `validateOutfit` resolves item references to the user's real closet and drops invented ones; `enforceRequiredItem` swaps the chosen piece in deterministically; refusal detection only when the model is confident; the render prompt states layer order and forbids copying accessories from the avatar photo.
- **Money and gating logic**: credit spend/charge/refund, plan gates, yearly grants, budget bands, cost per call, profitability maths, giveaway valuation.
- **Component tests** with Testing Library: radio/multi chips, the orbit logo ring (asserts the word appears exactly twice across 60 orbs), the install card hiding when installed, the update toast decision.

**Guard tests that fail the build on purpose** (copy these into any app):

| Test | What it refuses |
|---|---|
| `routeInventory.test.ts` | any `route.ts` in either app that exports a method without calling a session check and is not on the public allow-list (each allow-list entry has a "why"); also writes `tools/security/routes.json` for the attack suite; asserts cron routes use the shared constant-time check |
| `sqlScan.test.ts` | `sql.raw` or string-built SQL outside an exact-fragment allow-list (caught one in a new admin route on 17 Sep) |
| `copy.test.ts` | roadmap, prototype and fixture wording in user-facing code: "Step 2", "later phase", "(demo)", "coming soon", "prototype", "placeholder", "4242", "we'll email you", the dropped vendor's name |
| `legal.test.ts` | placeholder wording in privacy/terms drafts |
| `seeds.test.ts` | demo wardrobe integrity: every saved look's items exist, product ids match, image map covers every item |
| `log.test.ts` | the scrubber failing to blank emails, tokens, key shapes, password/code/token fields |
| `configLock.test.ts` | a price-affecting config key missing from the locked-key list |
| site `round2` and smoke | the forbidden word "stylist" and the client's name on the landing page |

Windows note: `sqlScan.test.ts` once failed locally because an allow-list fragment contained `\n` and the checkout used CRLF; CI on Linux was fine. Normalise line endings in text-matching tests or add a `.gitattributes`.

---

## 5. End-to-end tests (Playwright)

### 5.1 The configuration (real file, annotated)

`playwright.config.ts` at the repo root:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tools/e2e",
  globalSetup: "./tools/e2e/global-setup.ts",
  globalTeardown: "./tools/e2e/global-teardown.ts",
  timeout: 60_000,
  // one worker everywhere: spec files share the demo and test accounts (credits,
  // closet, shares); two at once race and report false failures
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  projects: [
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"], browserName: "chromium",
        channel: "chromium",          // full build — the headless shell has no getUserMedia (camera)
        permissions: ["camera"],
        launchOptions: { args: ["--use-fake-ui-for-media-devices", "--use-fake-device-for-media-stream"] },
      },
    },
    {
      name: "desktop",
      use: {
        browserName: "chromium", viewport: { width: 1280, height: 800 },
        channel: "chromium", permissions: ["camera"],
        launchOptions: { args: ["--use-fake-ui-for-media-devices", "--use-fake-device-for-media-stream"] },
      },
    },
  ],
  webServer: [
    {
      command: "npm run start --workspace=@assemble/web -- --keepAliveTimeout 60000",
      url: "http://localhost:3000/welcome",
      reuseExistingServer: false,   // a leftover server would test a stale build
      timeout: 60_000,
      env: { TRIPO_MOCK: "1", GEMINI_MOCK: "1" },   // never hit real AI engines from tests
    },
    {
      command: "npm run start --workspace=@assemble/admin -- --keepAliveTimeout 60000",
      url: "http://localhost:3001/login",
      reuseExistingServer: false,
      timeout: 60_000,
      env: { GEMINI_MOCK: "1" },    // the admin product describer too
    },
  ],
});
```

Why each unusual line exists: the iPhone profile defaults to WebKit (not installed) → force chromium; the headless shell has no camera → full chromium with fake media; `--keepAliveTimeout 60000` because Node's default idle-socket timeout produced random `ECONNRESET` on the first request; mock env on **both** servers because the admin server once called the real model.

### 5.2 Global setup and teardown

`tools/e2e/global-setup.ts` resolves `DATABASE_URL` from the environment (CI) or `apps/web/.env.local` (local), sets `E2E_STORAGE=1` when bucket credentials exist, loads `ADMIN_SESSION_SECRET` from `apps/admin/.env.local` (specs mint the admin cookie directly) and `CRON_SECRET`, and without a database logs "DB specs will self-skip" and returns. With a database it: resets the demo profile (user id 1), clears test-pattern rate-limit counters, and deletes then recreates **fourteen throwaway accounts on `@test.local`** with a bcrypt-hashed `<TEST_PASSWORD>` and the starter credits, **each dedicated to one spec family** so files never race:

`buddy` (social), `storer` (storage/3D), `changer` (password change), `prober` + `victim` (attack suite), `checker` (photo-check cap), `payer` (yearly subscription), `newbie` (set-up screens), `styler` (match budget/accessory rules), `lister` (admin lists), `googler` (a Google-method account with no password), `suspendee`, `giver` + `taker` (shared looks).

`global-teardown.ts` deletes every `%@test.local` account with explicit per-table deletes (Drizzle cannot loop over heterogeneous tables) and their bucket objects under `u<id>/`. Marketing accounts must therefore never use `@test.local`.

`tools/e2e/db.ts` gives specs a direct database line for what no route exposes: `plantPricedCall` (mocked engines report zero tokens, so money specs plant one priced call), `plantSaveCode` (hash a save-lock code the way the panel stores it, because tests cannot read email), `customerNotificationsMatching` (prove an admin alert never reached a customer).

### 5.3 House conventions for specs

```ts
const hasDb = !!process.env.E2E_DB;
test.skip(!hasDb, "needs DATABASE_URL");
test.describe.configure({ mode: "serial" });          // anything that mutates shared accounts
test.skip(({ isMobile }) => !isMobile, "mobile only"); // ...and runs on one project only
```

- Demo session: `context.addCookies([{ name: "assemble-demo", value: "1", url }])`; admin session: cookie `assemble-admin=<ADMIN_SESSION_SECRET>`.
- `addInitScript` sets `localStorage.assemble-install-dismissed=1`, because the PWA install banner overlays the top bar and intercepts clicks.
- Assert **ledger events, not exact balances** ("pack count +1", "balance within range"); shared counters flake.
- `.first()` for repeated text; select by role or test id, never by loose text (a selector once matched a paragraph containing "Swap").
- Mutating clicks: wait for network idle and click once; retries must be **idempotent** and guarded on current state (`clickUntil`); blind retry loops double-spent credits and walked history to `about:blank`.
- `test.slow()` for login plus polling specs; login waits with `waitUntil: "commit"`.
- API-first checks with `page.request` plus one UI path per feature; e2e never depends on email delivery.
- Retry-tolerant assertions in CI (`[201, 409]`, conditional 402 checks) because `retries: 1` re-runs specs whose first attempt already mutated data.
- Fetch live ids (packages, products) from `/api/config`; serial ids continue after a reseed.
- Block the service worker in contexts that mock network calls: `browser.newContext({ serviceWorkers: "block" })`.
- Public share pages are client-rendered: test them in the browser, not with curl.
- Keep state-dependent tests independent or deliberately ordered within a serial file (a "returning user" check must run while the account is seconds old).

### 5.3a Several apps in one suite (added from the next app)

One Playwright run covers every portal: a `webServer` entry per app on its own
port, and a project per app and device (`teacher-desktop`, `teacher-mobile`,
`expert-desktop`, …) with `testMatch: '**/teacher-*.spec.ts'` and its own
`baseURL`. A cross-portal spec opens a second context with the other portal's
`baseURL` — that is how "the expert writes feedback, the teacher sees it" is
proved in one test.

Because every project shares one test database:

- Fixtures carry a per-project tag (`D`/`M` plus a timestamp) so names never
  collide, and specs assert about **their own** rows — never "the list is
  empty", which the other project's data breaks.
- Signing in as a second person needs `context.clearCookies()` first: a
  signed-in visitor is redirected away from the sign-in page.
- Kill leftover dev servers before a run; a stale one keeps writing to the
  database and global setup's `delete from users` then fails on a foreign key.

### 5.4 What the 30 spec files cover

account, admin-catalog, admin-money, admin-ops, admin, ai, camera, categories, closet, demo-closet, flows, launch, lists, navigation, packing, polish, profile, pwa, render, security, share, shared-looks, shop, signin, social, social2, storage, style, swaps. Highlights: login → home; generation spends a credit and out-of-credit gates open the buy sheet; Plus/Pro gating; swap → paid render bar; back-history anti-ping-pong sweep; horizontal-overflow sweeps; admin login → 2FA → dashboard and an admin config change reflected in the user app; cross-account friend request → share → vote → notification; uploads and a mocked 3D build with refund on failure; the real camera via a fake device; manifest fields, colour-scheme meta and a synthetic `beforeinstallprompt`; AI match persists two looks; closet-only refused with an empty closet; render caching and paid re-render; packing lifecycle; public link create/open logged-out/vote/revoke/re-enable; the attack suite (18 tests).

### 5.5 Site smoke tests

`apps/site` (the landing page) has its own `playwright.config.ts` and `tests/serve.mjs` that serve the static export on port 3013: header and footer logo present and its animation running (paused off-screen, static under reduced motion), no overflow at 390 px, forbidden words absent, pricing table equals live config, QR only on laptops, sticky bar only on phones, 3D lazy-loads, no broken images. Lighthouse (`npx --yes lighthouse@12.8.2 <url>` with `CHROME_PATH` pointing at Playwright's chromium) gates LCP ≤ 2.5 s on a mid-range phone on 4G and CLS < 0.1; measure on the **live** preview, not just locally (local blocking time was ~210 ms, live ~470 ms).

---

## 6. Mocks (fake engines)

`GEMINI_MOCK=1` and `TRIPO_MOCK=1` (or simply a missing key) switch `lib/gemini.ts`, `lib/tripo.ts` and the admin `lib/describe.ts` to deterministic fakes, so CI and keyless machines exercise whole flows without spending anything:

- mock match builds outfits from the user's **real** closet by category;
- mock detection returns facts shaped by category group (an early version wrote "hoodie" facts onto every item on shared staging rows — a mock that writes to a shared database must produce plausible, input-dependent data);
- mock render sets a seed image; a "hoodie" look renders with a verification note to exercise the free "Render again" path;
- mock Tripo completes in ~15 s with a bundled GLB;
- the mock scene is driven by the request body so refusal paths can be tested.

Money specs plant a priced call through `db.ts` because the fakes report zero tokens. Every test server gets the flags (see 5.1). Real engines are exercised **once per deploy, manually or by the live script**, and the test data is deleted afterwards.

---

## 7. Test databases and accounts

| Runner | Database | Why |
|---|---|---|
| Local e2e (backend) | Neon `staging` branch (`E2E_DB=1`, URL in `apps/web/.env.local`) | same data the phone retest uses; demo reset after runs that mutate it |
| GitHub Actions (backend) | Neon `ci-backend` branch, own bucket, credentials in Actions secrets | never touches staging or production |
| GitHub Actions (frontend repo) | Neon `ci` branch | created after CI wiped a live 3D build on the shared production DB |
| Never | `production` | — |

Every migration is applied to staging **and** the CI branch the same day. Keep the CI branch's config row in step (it once pinned a different render model and `verify.mjs` failed). Test accounts live on `@test.local` and are recreated every run; don't assert global emptiness on a shared database (real staging sign-ups once matched the demo's name) — assert the specific row.

---

## 8. CI (GitHub Actions)

`.github/workflows/ci.yml`, the real one:

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
# one run at a time: the e2e suite resets and mutates the shared ci-backend database
concurrency:
  group: ci-backend
  cancel-in-progress: false
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 25
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - name: Secret scan (working tree)
        run: npm run security:secrets
      - name: Dependency audit (high and critical)
        run: npm run security:audit
      - name: Unit & component tests (Vitest)
        run: npm run test --workspace=@assemble/web
      - name: Build all apps
        run: npx turbo run build
      - run: npx playwright install chromium --with-deps
      - name: End-to-end tests (Playwright)
        run: npx playwright test
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
          ADMIN_SESSION_SECRET: ${{ secrets.ADMIN_SESSION_SECRET }}
          AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
          AUTH_TRUST_HOST: "true"
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_ENDPOINT_URL_S3: ${{ secrets.AWS_ENDPOINT_URL_S3 }}
          AWS_REGION: ${{ secrets.AWS_REGION }}
      - name: Upload e2e traces on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with: { name: playwright-traces, path: test-results/, retention-days: 7 }
```

The generic copy in `templates/ci/ci.yml` names the concurrency group `ci-database` and the workspace `@app/web`; rename both to your app's names — the group name only has to be the same on every run that shares the CI database.

Setting up CI on a new repo (do this on day one): create the CI database branch, set the eight secrets (`GH_TOKEN=<GITHUB_PAT> gh secret set DATABASE_URL --repo <owner>/<repo> < value-file`, etc.), push the workflow (the PAT needs the `workflow` scope), watch the first run by **workflow name** (`gh run list --workflow CI`, not the Dependabot job that runs on the same commit). Read failures with `gh run view <id> --log-failed`, download traces with `gh run download <id> -n playwright-traces -D <scratchpad>/ci-traces`, rerun with `gh run rerun <id> --failed` when idle. Dependabot is on (weekly grouped minor/patch PRs); its branch builds can fill Vercel's queue so `main` is not auto-deployed — poll for the pushed SHA and trigger by API if needed.

A test that is flaky **only on CI** and depends on UI timing (the 3D consent tap) may self-skip on CI if an API-level test still covers the pipeline there; write the reason in the skip message.

---

## 9. Live checks and proofs

After each deploy, a scratchpad Node script (`live-pass.mjs`, `live-<round>.mjs`) prints PASS/FAIL lines against the staging URLs using `fetch`, a demo cookie and an admin session cookie (signed with the admin session secret read from `apps/admin/.env.local`). Typical checks: `/api/config` values (plans, render model, safety flag), `/api/me` answers "Sign in to continue." without a session, `/api/storage/u1/...` → 401 and `/api/storage/public/...` → 404, cross-site write → 403, cron route → 401 without the secret, admin routes → 401 without the cookie, one real match/detect/render/pack/refusal with timings, the public share page **in a real browser**, a stranger's vote tallied, a turned-off link showing the dead page. Then delete the test look and reset the demo.

Two proof patterns worth naming:

- **Mutation proof**: change one row directly in the database (`UPDATE products SET price='$29 (LIVE-DB-PROOF)' ...`), read the live API, see it, revert. Proves the deployed app reads the database you think it does.
- **Admin round-trip proof**: change a config value through the admin API → observe the user app → revert. Proves admin settings actually reach users (batch 3 found style lists that never did).
- **Proving a destructive path without doing it**: run the whole account-delete sequence inside a transaction and roll it back.

### 9a. The verification habit — Claude proves it, the owner does not test (added from the next app)

The owner should never be handed "please test this". At every checkpoint Claude:

1. runs the gates on the **production build**: unit (100% coverage), the full e2e suite, the **accessibility sweep** (axe, WCAG 2.2 AA, every screen) and the **layout sweep** (every screen × 375/768/1280/1440: nothing past the viewport or overflowing its own box; exactly one highlighted nav item per route, sub-pages included; sidebar collapse remembered; phone drawer opens, highlights, navigates, closes on Escape);
2. deploys to staging and drives the changed screens there with real data, which is kept (staging is a test environment);
3. proves email by the provider's delivery status (Resend's API by message id, recorded in the audit entry) and by following the link — a known token is planted in the staging database, hashed as the app stores it;
4. publishes a private **proof page** (an Artifact): what changed, each gate's numbers, the design checklist per changed screen, screenshots at phone and desktop width, what failed and was fixed — and sends 2–3 key screenshots in chat;
5. does a full screenshot crawl of every screen before each release; the owner's own hands-on use happens at release milestones only.

When the gates first run they should find real faults — on the next app they found five in one pass (contrast on the nav highlight and on tinted badges, a detail page highlighting no section, a sidebar preference the server never read, dead menu links that hung every page). That is the point of writing them before redoing the screens.

---

## 10. The phone retest guide

Every push ends with 3–9 numbered steps you do on a real phone, because only a device proves install banners, Play Protect, Samsung dark mode, push badges, the camera, clipboard within a tap gesture and keyboard blur behaviour. Format (paste-ready template with an example: `templates/docs/PHONE-RETEST-GUIDE.md`):

```
Phone retest — [round name], staging, [demo profile | throwaway account — not your main one]
Before you start: Settings → site data for <staging URL> → clear (old manifests and cached pages hide fixes).
App
1. Open <screen path> → do <action> → you should see <expected>.
2. ...
Admin
1. ...
Not tested live (no suitable data on staging): <what and how to test it manually>.
If anything differs, send me the screen, what you tapped and what you saw.
```

Examples from Assemble: "photograph a black surface as a closet item → expect the refusal card, no credit charged"; "paste the share link into WhatsApp to yourself → the preview card shows the render"; "type 'delete' in lower case → the account is deleted and you land on Welcome".

---

## 11. Targeted vs full runs

The default is the full bar. Two sanctioned exceptions:

- **Small, isolated push right after a big one** (the render layering fix, 17 Sep 2026: *"don't play the whole 2.5-hour long suite"*): typecheck → the unit tests for the changed rules → full unit → only the affected spec files (`E2E_DB=1 npx playwright test tools/e2e/ai.spec.ts tools/e2e/render.spec.ts tools/e2e/swaps.spec.ts`) → push → one real paid check on staging (a layered render, about $0.17) → delete the test data; the full suite runs in CI.
- **After fixing spec failures**: re-run only those files on fresh servers, then the full suite once before pushing.

A rebuild "cached from the successful run" was accepted once after a network interruption because typecheck and unit had passed minutes earlier; say so in the report when you do this.

---

## 12. Flakiness lessons (the short list)

| Symptom | Cause | Fix |
|---|---|---|
| Many failures in under a second each, 500s, ENOTFOUND | the machine lost DNS/internet (happened 13, 14, 15, 16 Sep) | check connectivity first; re-run or resume from the failed phase |
| Credit-balance tests fail randomly | parallel spec files spend the same account | one worker; dedicated account per spec family; ledger-event assertions |
| Tests pass twice against old code | Playwright reused a stale server | `reuseExistingServer: false`; free ports before a run |
| Random `ECONNRESET` on first request | local server closed idle sockets after 5 s | `--keepAliveTimeout 60000` |
| Mobile project fails entirely | iPhone profile wants WebKit | `browserName: "chromium"` |
| Camera specs throw `NotSupportedError` | headless shell has no `getUserMedia` | `channel: "chromium"` + fake media flags |
| Laptop overloaded, timeouts everywhere | full Chromium workers + agents + builds | idle machine; one worker; sentinel file for agents |
| Clicks intercepted | install banner overlay | dismiss via `addInitScript` |
| 429 where a spec expects 401 | rate-limit counters persisted from the last run | clear test-pattern counters in global setup |
| Nine login failures in a cascade | test password no longer met new strength rules | update fixtures when validation changes |
| Spec change silently reverted | an agent or tool overwrote the file | commit small fixes immediately; `git diff` before every push |
| Admin spec clicks blocked | success toasts were blocking dialogs | non-blocking success bar; errors stay dialogs |
| Route mocks ignored | the service worker intercepted fetches | `serviceWorkers: "block"` |
| Seed data shown for 60 s | React Query `initialData` counted as fresh | `initialDataUpdatedAt: 0` |

---

## Assemble example (what actually happened, with dates)

- **14–15 Jul 2026 (wireframes)** — structural audit + click crawl (1,167 controls, 0 errors), state tests, responsive sweep at 375/768/1440, coherence check, traceability matrix (230 items), deploy parity (12 markers), then a 39/39 acceptance sweep on 15 Jul. Your manual phone test still found the blank admin panel on 21 Jul — automation had checked presence, not viewport position.
- **21 Aug (Step 1)** — 73 Playwright screenshots of every screen, image-by-image inspection (found an empty 3D viewer, missing admin images, credits resetting on reload), then `tools/verify.mjs` (overflow at 375 px on 31 routes plus interaction checks) → 0 console errors, 0 page errors.
- **28 Aug** — first pyramid: 24 unit + 27 e2e; GitHub Actions green on the first run once the PAT had the workflow scope. Same day CI reset the production demo during a live 3D build → dedicated `ci` branch.
- **1 Sep** — backend repo: CI red on every commit until `ci-backend` + 8 secrets; 38 unit + 54 e2e; live staging match 10.8 s, detect 14 s.
- **10 Sep (zero-gap round)** — five parallel build agents, one push: 148 unit tests in 16 files including the copy audit, 18 spec files green, a 30-check live pass, a real render.
- **11 Sep** — you asked "why is it taking so much time?": ~210 e2e tests driving real Chrome against production builds and the live staging DB, 15–20 minutes per clean run, third attempt. Local e2e caught a price scaled twice before the push.
- **13 Sep** — security round: 200 e2e green after moving local runs to one worker; the attack suite got its own accounts; 19 live checks.
- **16 Sep** — pricing round: 211 e2e (36 min), 392 unit; batch pushes A and B: 222 and 230 e2e, adversarial review found 13 and 6 defects that tests had not (tests passing is not the same as numbers being right).
- **17 Sep** — batch 3: 243 e2e / 448 unit; render fix: targeted 20 e2e + 456 unit + one real $0.17 render.

## Pitfalls (symptom → cause → fix)

See section 12 above and [40-pitfalls-master-list.md](40-pitfalls-master-list.md) section F. The three to remember: never share a database between CI and anything live; mock every engine on every test server; never run tests while a build is running or a stale server is alive.
