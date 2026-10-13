# [APP] — project handoff (read this first if you are a new session or a new developer)

> Template. Assemble's `PROJECT-HANDOFF.md` was written on 2026-08-05 before the prototype repo was handed to the next phase, deliberately token-free, and it made every later cold start cheap. Write one at the end of every milestone and keep it committed (no secrets; values live in env files and the password manager). The automatic session summaries have the same structure — this is the hand-written version. Delete this note before committing.

## 1. What this is
- Product in three sentences: [what the app does, for whom, how it makes money].
- Phase: [prototype | full-stack front end | backend | live]. What is real and what is simulated: [payments simulated, everything else real].
- Live URLs: [production app/admin/site | staging app/admin | preview].

## 2. Repos, branches, environments
| Repo | Purpose | Deploys to | Database branch |
|---|---|---|---|
| `[owner]/[App]_Wireframes` | greyscale single-file prototype | [static host] | — |
| `[owner]/[App]_UI` | branded single-file prototype | [static host] | — |
| `[owner]/[App]_Frontend` | full-stack front end (frozen production build) | production | `production` |
| `[owner]/[App]_Backend` | current work | staging | `staging`; CI on `ci-backend` |

Rules: no AI attribution in client repos; production untouched until cutover; never `neon env pull` for the CI branch; agency AI keys on local + staging only.

## 3. Run and verify
```bash
npm install
npm run dev:web        # :3000   npm run dev:admin  # :3001
npx tsc --noEmit -p apps/web/tsconfig.json && npx tsc --noEmit -p apps/admin/tsconfig.json
cd apps/web && npx vitest run
npx turbo run build
E2E_DB=1 npx playwright test          # one worker, mocked engines, ~[N] min; free :3000/:3001 first
npm run security:secrets && npm run security:audit
```
Prototype era instead: `py -m http.server 8844 --bind 127.0.0.1`, open `http://127.0.0.1:8844/[file].html?v=1` (cache-buster), click the launcher card first, then drive the DOM (`.screen.active`, no console errors, no overflow at 375 px).

## 4. Architecture in one screen
- [Monorepo layout and what each package is.]
- [Auth: Auth.js v5, Google + email/password with emailed codes, JWT sessions with a session version; admin sessions server-side with 2FA.]
- [Data: Drizzle on Neon; every AI operation is an async `generations` row; client polling; nightly cron sweep.]
- [Storage: private bucket, `u<id>/` prefix, served through `/api/storage`.]
- [AI: prompts as pure functions + JSON schema + clamp validator, all unit-tested; mocked in tests.]
- [Design system: `packages/ui/styles.css` ported from the prototype; tokens in `:root`.]
- Prototype architecture (if handing off a prototype): two controllers `U`/`A`, `st` state, `go()/back()/render()`, delegated `click()` on `data-*` attributes; history-based back; loading screens never enter history.

## 5. Change log (newest first)
| Date | Commit | What |
|---|---|---|
| [YYYY-MM-DD] | `[sha]` | [one line] |

## 6. Conventions
- Question rounds before building; decisions recorded in briefs/memory; "remove" means delete.
- Money in dollars; American English on the site; no vendor names in copy; no roadmap wording (`copy.test.ts`).
- Tests: one throwaway account per spec family; ledger events not balances; every server Playwright starts gets the mock env.
- Commits: message from a file, attribution grep, secrets scan, explicit paths, one push per round.

## 7. Known limitations and open items
- [e.g. monthly credit renewal belongs to the payments work]
- [e.g. Content-Security-Policy deferred]

## 8. Pending decisions for the user
- [one line each, with the options]

## 9. Quick-start checklist for a new session
1. Read this file, `CLAUDE.md`, `README.md`, `LAUNCH-READINESS.md`, the memory notes.
2. Check the tree is clean and `main` is at the SHA in section 5.
3. Verify tokens with one call each before using them.
4. Ask the user what the next batch is; run the question round; do not start unprompted.
