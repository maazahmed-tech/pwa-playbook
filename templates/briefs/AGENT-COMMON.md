# [APP] — shared agent brief (read first)

> Template. One shared brief per batch holds the repo map, hard rules, database rules, migration style, verification ladder, "where things already are (verified)", coordination contracts and the report format. Per-agent briefs (`AGENT-BATCH.md`) reference it. Keep it in the session scratchpad, never in the repo. Replace every `[placeholder]`; delete sections that do not apply.

Repo root: `[ABSOLUTE PATH]` (Turborepo). `apps/web` = customer PWA (:3000; Next [15], React [19], App Router, zustand store `lib/store.ts`, TanStack Query hooks `lib/api.ts`, one modal host `components/Modals.tsx`, primitives `components/ui.tsx`). `apps/admin` = admin panel (:3001; `lib/adminApi.ts`, `lib/adminAuth.ts` isAdmin/adminUnauthorized, `components/AdminModals.tsx`). `apps/site` = static marketing site. `packages/db` = Drizzle schema (`src/schema.ts`, Neon Postgres), typed seeds (`src/data.ts`), migrations (`migrations/NNN-*.mjs`). `tools/e2e` Playwright, `tools/security` scans, `tools/cutover` config/verify. Branch `main`, clean at `[SHA]` ([what is already shipped and live]). Checklist of decisions: `LAUNCH-READINESS.md` at the repo root — read it first; your rows are named in your task.

## Hard rules
- **Zero AI-assistant attribution anywhere**: never write "Claude", "Anthropic", "AI-generated", "Co-Authored-By", "generated with" in code, comments, tests, docs, checklists or commit messages. Code reads like the surrounding code (same comment density, naming, [British/American] wording in the app; `apps/site` is American English).
- **Do not commit, push, stash, revert or change git state.** The main session commits.
- Databases: **staging** (`DATABASE_URL` / `DATABASE_URL_UNPOOLED` in `apps/web/.env.local`) and **CI** (`.env.ci-backend`, quoted URL — strip quotes). **Never production. Never `neon env pull`.**
- Never call the real paid engines. Tests run with `GEMINI_MOCK=1 TRIPO_MOCK=1` (set by `playwright.config.ts` on every server).
- Money in dollars ($0.17), never the cent sign. Keep every existing guard (consents, rate limits, daily caps, refunds, session checks, origin check).
- **Schema is final for this batch** unless your task says otherwise. If you truly need a column, stop that item and report it.
- Never edit: `package.json` files (report needed dependencies), `playwright.config.ts`, `tools/e2e/global-setup.ts`, `global-teardown.ts`, `.github/**`, anything under `apps/site` [unless you own it].
- **Shared-file protocol**: files outside your ownership list may receive only small, targeted edits with a unique anchor. Re-read the file immediately before each such edit — other agents edit concurrently and stale edits are rejected; just re-read and retry. Never rewrite a shared file wholesale. `lib/api.ts`: append new hooks at the END only. `lib/store.ts`: add keys only if unavoidable.
- Windows + Git Bash. Prefer the Read/Edit/Write tools. Never `node -e` with quoted JS; write `.mjs`/`.cjs` files instead. Absolute paths in every command (`cd` does not persist between commands).
- **No fakes**: every control does something real (DB/API) or is removed. Real accounts see real data or honest empty states. Seeded demo fixtures only behind `me?.isDemo` / the demo user id.
- Remove roadmap/prototype copy in files you own: "Step 2", "later phase", "(demo)", "placeholder copy", "next phase", "coming soon", vendor names. The one allowed simulated area is checkout, labelled exactly "Test mode — you won't be charged".
- Emails: only sign-in codes and support-ticket emails exist. Do not add other emails.
- Keep the existing visual language (classes: [wrap, card, btn, btn-o, chip, lrow, menurow, togglerow, mut, sub, lbl, note, empty, tag, TopBar/BackBtn]). No new CSS files; inline tweaks only if needed.
- Keep the existing UX patterns: `s.toast(msg)`, `s.openModal("name")`, `apiSend(url, method, body)` (throws Error with `.status`), `useInvalidate()` to refresh query keys; optimistic UI only where the server call follows immediately.
- Don't end a turn while a build or test run is going: wait in the foreground.
- If `[SCRATCHPAD]/E2E-RUNNING` exists, wait until it is gone before running typecheck or vitest (the machine must be idle during e2e).

## Migrations
New migrations follow `packages/db/migrations/[NNN-latest].mjs` exactly (plain `.mjs`, re-runnable, `IF NOT EXISTS`, strips its own `DATABASE_URL` quotes, falls back to `apps/web/.env.local` unpooled URL, prints a one-line result). Apply to **staging and the CI branch only**, then re-run `node tools/cutover/verify.mjs` on both. Add new columns/tables to `packages/db/src/schema.ts` and extend `tools/cutover/config.mjs` + `verify.mjs` so a fresh environment (production at cutover) reaches the same state.

## Verification ladder
(The tests agent runs the whole thing; others run their own app's checks.)
`npx tsc --noEmit -p apps/<app>/tsconfig.json` → `npx vitest run` in each app with tests → `npx turbo run build` → kill anything on :3000/:3001 → `E2E_DB=1 npx playwright test` (single worker, ~[40] min). `apps/site` also: `npm run build` + `npm run test:smoke`.

## Where things already are (verified)
- [Feature/area]: `[path]` — `[function]`; called by `[callers]`.
- [Admin config PUT]: `apps/admin/app/api/admin/config/route.ts` (key loop; validated keys).
- [Every AI call row]: `generations` table (`kind`, `status`, `credits_spent`, `cost_cents`, `result.usage`). Written by `apps/web/app/api/ai/*/route.ts`.
- [Credit ledger]: `credit_ledger` (label, delta). Revenue labels: "[…]".
- [Notifications]: `apps/web/lib/notify.ts` (`notify`, `notifyAdmin`).
- (List every file an agent might otherwise have to search for. Every line here saves an agent ten minutes and one wrong guess.)

## Coordination contracts (other agents rely on these exact shapes)
- `GET /api/me` returns `{ …, consents: Record<key, ISO>, progress, hasPassword, createdAt }`; `PATCH /api/me` accepts `{ consents: {key: true|false}, progress: {...} (shallow-merged per key), styleProfile, name, pronouns, image }`.
- Denied-consent shape: HTTP 403 `{ error: string, consent: "<key>" }`; client helper `lib/consentGate.ts` maps a key to the modal to open.
- Suspended shape: HTTP 403 `{ code: "suspended", error: "Your account has been suspended." }` on every authenticated route.
- Locked admin save without a code: HTTP 423 `{ needsOtp: true }`.
- [Every new route this batch adds: method, path, body, response, status codes — written here BEFORE the build agents start.]
- Plans config: `pub.config.plans.plus|pro = { priceMo, priceYr, credits, creditsYr, features[] }` (whole-number minor units in storage, dollars in display). Hard-coded prices must not be used for display.

## Tests you must add
- Unit tests: `apps/web/tests/<area>.test.ts(x)` (vitest + jsdom; aliases `@` → apps/web, `@app/db` → packages/db/src/index.ts). Put pure logic in `lib/` files so it is unit-testable.
- E2E: `tools/e2e/<area>.spec.ts` following the house conventions: `const hasDb = !!process.env.E2E_DB; test.skip(!hasDb, "needs DATABASE_URL")`; `test.describe.configure({ mode: "serial" })` and a mobile-only skip in `beforeEach` for anything that mutates the demo profile or shared accounts; demo cookie `{ name: "[app]-demo", value: "1", url: baseURL! }`; throwaway accounts `[name]@test.local` (see global-setup for the list and the shared test password; add a new one there if your spec mutates state, never reuse another spec family's account); admin cookie `{ name: "[app]-admin", value: process.env.ADMIN_SESSION_SECRET!, url: "http://localhost:3001" }` and skip when the secret is missing; `localStorage.setItem("[app]-install-dismissed", "1")` via `addInitScript`; ledger-event assertions rather than exact balances; `.first()` for repeated text; idempotent clicking guarded on state (see `flows.spec.ts` `clickUntil`); `test.slow()` for login + polling specs. Prefer API-first checks (`page.request`) with one UI path per feature. Email sends are best-effort and specs never depend on delivery.
- You cannot run Playwright here [if that is the rule for this batch]; write specs precisely against the texts/roles you implemented and keep them robust (timeouts 10–20 s, no exact balances, clean up rows you create).

## Finish
- Update your rows in `LAUNCH-READINESS.md` (small anchored edits): status `☑ <spec or test file> · <test name>`.
- Final message (under 60 lines): files changed, tests added, decisions taken inside the brief, anything deferred (with reason), exact commands run and their results, and every edit you made outside your ownership list.
