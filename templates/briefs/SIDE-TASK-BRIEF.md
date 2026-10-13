# Self-contained side-task brief (background session in its own worktree)

> Template for a one-message task launched as a separate session (a "task chip" or a background session in a git worktree). It must stand alone: the session that runs it has none of the conversation. Modelled on the four 2026-09-13/14 side tasks (account file cleanup, avatar front-facing, e2e fixture cleanup, American English). One of those sessions died instantly on a network error and was relaunched at zero cost because the brief was complete.

> **For Claude — paste this:**
```text
In the [APP] repo at [ABSOLUTE PATH] ([stack summary: Turborepo; apps/web customer PWA on :3000; apps/admin on :3001; packages/db Drizzle + Neon; tools/e2e Playwright]), [exact problem in one sentence].

Where it is (verified):
- [path:line] — [what it does today and why that is wrong]
- The pattern that already does it right: [path] ([function]) — copy its approach.

Do this:
1. [Implementation step with guard rails: what must never be touched (demo user id [1], the `public/` storage prefix, production), error handling (never block the main action on a secondary failure; queue it), logging rules (route + message only, no emails, no keys).]
2. [User-facing copy change, exact wording or tone. Keep [British/American] English in the app.]
3. Tests: add `apps/web/tests/[name].test.ts` for [pure rule]; extend `tools/e2e/[spec].spec.ts` test "[test name]" to assert [X] from three viewpoints ([the account itself, a signed-out visitor, another account]); the demo profile must be refused ([403]).
4. Docs: add row [H15] to LAUNCH-READINESS.md with the proving test; add the new table to tools/cutover/verify.mjs; note in CUTOVER-RUNBOOK.md if the migration is not yet rehearsed.

Rules for this repo:
- No AI attribution anywhere (code, comments, docs, commit messages). Commit as `[GITHUB_OWNER] <[ID]+[GITHUB_OWNER]@users.noreply.github.com>`.
- Staging database only (`apps/web/.env.local`); never production; never `neon env pull`. Apply any migration to staging AND the CI branch (`.env.ci-backend`) and say so.
- Before pushing run: `npx tsc --noEmit` in apps/web and apps/admin; `npx vitest run --pool=threads` in apps/web; `NEXT_PUBLIC_DEMO_LOGIN=1 npx turbo run build`; free ports 3000/3001; `E2E_DB=1 npx playwright test` (one worker; run it alone on the machine). The build takes several minutes; the suite [40+] minutes — wait in the foreground.
- Copy the gitignored env files into the worktree first; run `npm ci` in the background and wait for it.
- Another session is editing [paths] — do not touch them. Other background tasks may edit [paths]: pull and rebase before pushing and resolve conflicts carefully rather than overwriting their changes.
- Push to branch `[branch]` only when everything is green; if the saved GitHub credential has no access, stop and ask for a scoped token (Contents read/write on this repo) rather than trying other accounts.

Finish: confirm on [staging URL] that [visible result]; report files changed, tests, the migration status per branch, and any decision you need from me (e.g. the 404-vs-401 trade-off). Update your memory note with the outcome.
```

## Why each part is there
- **"Where it is (verified)"** — the main session already found the root cause; the side session should not re-investigate.
- **"The pattern that already does it right"** — keeps the codebase consistent and shortens the task.
- **Three viewpoints in the e2e** — the Assemble deletion test proved a file was gone for the owner, a stranger and another account, not just "the row is deleted".
- **Rules block** — the same seven rules as CLAUDE.md, repeated because the side session may run in a worktree that has no CLAUDE.md yet.
- **Parallel-safety clause** — added on 2026-09-14 after two sessions could have collided on `apps/site`.
