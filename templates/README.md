# Templates — generic, placeholder-based versions of the files that made Assemble work

Every file here is a cleaned copy of something that ran for real between July and September 2026, with the app name, the client, the ids and every secret replaced by `[placeholders]` or `<PLACEHOLDERS>`. Copy a file, fill in the placeholders, delete what does not apply. Where a line carries a comment, that line was a real incident once; keep it.

Conventions: the npm scope is `@app/*` (rename it); cookies are `[app]-demo`, `[app]-admin`, `[app]-install-dismissed`; secrets are never values, only names. Money is written in dollars. No file here carries AI attribution — none of your client repos should either.

How the chapters use these files: `02-how-we-work.md` (CLAUDE.md, prompts, briefs, workflows), `03-services-setup.md` (env examples, deploy scripts), `13-fullstack-frontend.md` and `14-backend.md` (repo scaffold, CI, migrations), `15-payments-and-cutover.md` (cutover runbook, verify/config scripts, handover checklist), `20-security.md` (security folder), `21-testing.md` (testing folder), `30-prompt-library.md` (question round), `01-running-the-sessions.md` (memory note, archive exporter).

## Index

### Standing rules and prompts
| File | What it is | Give it to |
|---|---|---|
| `CLAUDE.md` | The standing rules for a client repo: question rounds, no AI attribution, staging-only, secrets, money in dollars, mocked AI in tests, the pyramid, phone retest after each push, memory. Copy to every repo root and the parent working folder. | Claude (reads it every session) |
| `prompts/question-round.md` | The question-round block (verbatim), the fuller version, follow-up lines, the bootstrap message for a new app, and the dated originals. | You (paste) |

### Briefs (session scratchpad, never the repo)
| File | What it is |
|---|---|
| `briefs/AGENT-COMMON.md` | Shared brief per batch: repo map, hard rules, migration style, verification ladder, "where things already are", coordination contracts, test conventions, report format. |
| `briefs/AGENT-BATCH.md` | Per-batch brief: ownership table, API contract, numbered items with `file:line` root causes, tests, report format. |
| `briefs/SIDE-TASK-BRIEF.md` | Self-contained one-message brief for a background session in its own worktree. |

### Multi-agent workflows
| File | What it is |
|---|---|
| `workflows/batch-workflow.js` | Data → parallel Build → Tests → adversarial Review → fix loop (max 2 rounds). |
| `workflows/fix-loop-workflow.js` | Fix confirmed defects → one clean full run → re-review. |
| `workflows/README.md` | The rules that made them work and the other shapes used. |

### CI and repo scaffold
| File | Goes to |
|---|---|
| `ci/ci.yml` | `.github/workflows/ci.yml` — secret scan → audit → vitest → build → Playwright on a Neon CI branch, concurrency group, traces on failure. |
| `ci/dependabot.yml` | `.github/dependabot.yml` — weekly grouped updates. |
| `repo/package.json`, `repo/turbo.json`, `repo/gitignore`, `repo/neon.ts`, `repo/next.config.mjs`, `repo/vitest.config.ts`, `repo/vercel.json` | Monorepo root and `apps/web` (see `repo/README-repo-scaffold.md` for where each goes and the hosting settings that pair with them). |
| `repo/env/root.env.example`, `repo/env/web.env.example`, `repo/env/admin.env.example` | `.env.example` files: every variable name, grouped by service, with where to get it. Never values. |

### Testing
| File | What it is |
|---|---|
| `testing/playwright.config.ts` | Single worker, CI retries, full chromium with fake camera, two production servers with the mock env on both, keep-alive fix, no server reuse. |
| `testing/global-setup.ts` / `global-teardown.ts` | Env resolution, demo reset, one throwaway account per spec family, rate-limit cleanup; teardown deletes every `@test.local` account, its rows and bucket files. |
| `testing/db.ts` | Direct DB helpers for what no route exposes (plant a save code, a priced call, a negative proof). |
| `testing/example.spec.ts` | The house conventions in one spec file. |
| `testing/sqlScan.test.ts` | Guard test: no SQL built from variables (fails the build). |
| `testing/routeInventory.test.ts` | Guard test: every route checks a session or is on the public allow-list; writes `routes.json` for the attack suite. |
| `testing/copy.test.ts` | Guard test: no roadmap/prototype/vendor wording in user-facing code. |
| `testing/verify-overflow.mjs` | Overflow + console-error crawl of every route at phone width, plus the money flows. |
| `testing/site-serve.mjs`, `testing/site-playwright.config.ts` | Static server with real compression and the smoke config for an exported marketing site. |
| `testing/live-pass.mjs` | PASS/FAIL live checks against the deployed staging app and admin after every deploy. |

### Security
| File | What it is |
|---|---|
| `security/scan-secrets.mjs` | Dependency-free secrets scanner (tree / history / strict), masked output. |
| `security/audit.mjs` | `npm audit` gate with dated, self-expiring exceptions. |
| `security/log.ts` | Scrubber for logs and Sentry `beforeSend`. |
| `security/cronAuth.ts` | Constant-time scheduler secret check. |
| `security/middleware.ts` | Origin check on writes + page gating by cookie presence. |
| `security/SECURITY.md` | The repo's security document: reviewer's checklist → what the app does → proof. |

### Deploy by API
| File | What it is |
|---|---|
| `deploy/check-token.mjs` | One cheap call before relying on a hosting token. |
| `deploy/poll-deploy.mjs` | Wait for a commit's deployments to READY. |
| `deploy/trigger-deploy.mjs` | Create a deployment from a SHA (queue skipped `main`, or redeploy after an env change). |
| `deploy/set-env.mjs` | Upsert env variables from a local env file (values never pass through chat). |
| `deploy/site-upload-deploy.mjs` | Deploy a static folder to a non-git-linked project with a noindex header. |
| `deploy/README.md` | When to use which, and the paste block for Claude. |

### Database
| File | What it is |
|---|---|
| `db/migration-template.mjs` | Additive, re-runnable `.mjs` migration with backfill, config merge and count-guarded seed. |
| `db/cutover-config.mjs` | Idempotent config-row upgrade for any environment (run again after the deploy). |
| `db/cutover-verify.mjs` | PASS/FAIL checklist for a target database; exit 1 on FAIL. |

### Documents
| File | What it is |
|---|---|
| `docs/CUTOVER-RUNBOOK.md` | Preconditions, fork rehearsal, production steps with env lists, smoke test, rollback, after-cutover tasks. |
| `docs/LAUNCH-READINESS.md` | Gap table per area, every row ticked only with its proving test. |
| `docs/PHONE-RETEST-GUIDE.md` | The format Claude ends every staging push with, and an example. |
| `docs/CLIENT-HANDOVER-CHECKLIST.md` | Client-facing: who owns what, the checklist, safe key handover, per-service steps. |
| `docs/PROJECT-HANDOFF.md` | "Read this first" for a new session or developer, at the end of every milestone. |
| `docs/STATUS-REPORT.md` | The end-of-round report format with an example. |
| `docs/memory-note.md` | The auto-memory note format (one note per failure mode; never a secret value). |

### Archive and static
| File | What it is |
|---|---|
| `archive/export-history.mjs` | Turns Claude Code transcripts into readable, secret-masked Markdown per session. |
| `static/index.html` | Root redirect for a static prototype repo (fixes the host's 404 when the main file has spaces). |

## Not templated on purpose
- Client photos, 3D files, brand assets, the prototype HTML itself (client material). The architecture of the prototype is described in `11-wireframes.md` and `12-ui.md`.
- Payments code: not built yet. `15-payments-and-cutover.md` holds the plan; the handover checklist row 9 holds the account steps.
- Running/service costs: out of scope everywhere in the guide.
