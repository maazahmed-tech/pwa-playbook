# 40 — Pitfalls master list

Part of the PWA Playbook. Index: [00-index.md](00-index.md). Each milestone chapter has its own short pitfalls box; this is the complete, de-duplicated list from every phase (9 Jul – 17 Sep 2026), grouped by area. Each entry: **Symptom → Cause → Fix → Prevention → chapter**.

Groups: A access and tokens · B git and GitHub · C Vercel, deploys and DNS · D email, OAuth and third-party consoles · E Neon, database and migrations · F tests and CI · G Windows, shell and tooling · H single-file prototypes · I design and asset pipeline · J PWA, phones and Samsung · K 3D · L AI engines · M product and data truth · N security · O sessions, process and working with Claude · P landing page and performance.

---

## A. Access and tokens

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| A1 | Push denied 403 "Permission … denied to <account>" | the local `gh` keyring account is not the repo owner or a collaborator; no pending invite existed | owner-account token used inline | run `gh auth status` and `gh api repos/<owner>/<repo> --jq .permissions` before starting; never assume `gh` is the identity that can push | [20](20-security.md) A4 |
| A2 | "Invalid username or token. Password authentication is not supported" | the token was revoked between sessions (as advised) | commit locally, ask for a fresh token | one-call token check (`GET /user`) before any push | [20](20-security.md) A4 |
| A3 | "Repository not found" (404) on push or clone | the token belongs to a different account than the URL, or the repo does not exist; GitHub hides "no access" as 404 | create the empty repo on the right account; use that account's token | check `/user` and `/repos/<owner>/<repo>` with the token first | [20](20-security.md) A4 |
| A4 | Fine-grained token cannot see the repo | it was not granted that repository | issue a token with "Only select repositories" including it | list visible repos with the token before cloning | [03](03-services-setup.md) |
| A5 | Bearer auth rejected by git over HTTPS | git expects basic auth | basic auth with the token as password, one-off, or the inline `https://x-access-token:<TOKEN>@` URL | use the inline URL form for single pushes | [20](20-security.md) A3 |
| A6 | Token found in `.git/config` | `git push -u` with a token URL persisted it | `git config branch.<b>.remote origin`; grep config | never `-u` with a token URL; grep config after every push | [20](20-security.md) A3 |
| A7 | Push touching `.github/workflows` rejected | PAT lacks the `workflow` scope | add the scope (value stays the same) | request Contents + Workflows up front if Claude will edit CI | [20](20-security.md) A4 |
| A8 | Push silently fails inside a chained command; CI never runs | expired PAT | curl-check the token; new PAT | always verify before push; put the expiry in your calendar | [20](20-security.md) A4 |
| A9 | Vercel API 403 "You must re-authenticate to this scope" while `/v2/user` returns 200; or a response with no `deployments` array | SAML team tokens expire team-scoped writes | new token; verify via live URLs meanwhile | one cheap `GET /v6/deployments?...&limit=1` before polling; never loop on 403 | [20](20-security.md) A6 |
| A10 | Secrets visible in chat archive / compaction summaries / memory notes / scratch scripts | values pasted in chat, written to memory or hard-coded | rotate; mask the archive; rewrite notes to hold locations only | short-lived tokens; env files; "never store values" rule in CLAUDE.md | [20](20-security.md) A1, A9 |
| A11 | Admin password printed in chat | you asked and Claude answered from memory | rotate it; move to a password manager | never ask for credentials in chat | [20](20-security.md) A1 |
| A12 | Token gave write access to all repos of another account | a classic PAT with broad `repo` scope on the wrong account | revoke; fine-grained token scoped to one repo | least privilege by default | [20](20-security.md) A2 |
| A13 | Claude Code's own login expired ("API Error: 401 OAuth access token has expired") | the tool's OAuth token lapsed | re-authenticate; re-send the message | — | [01](01-running-the-sessions.md) |

## B. Git and GitHub

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| B1 | `--force-with-lease` rejected; "ahead 16" confusion | pushes through an inline URL never update `origin/<branch>` | fetch the real remote tip; give an explicit `branch:sha` lease | `git fetch origin` after inline-URL pushes | [20](20-security.md) A5 |
| B2 | Scratch or helper scripts committed (`rebuild.mjs`, `reseed-products.ts`) | `git add -A` swept them | removal commit | keep scratch in the scratchpad; stage explicit paths; review `git status` | [02](02-how-we-work.md) |
| B3 | Stale `.git/index.lock` blocks git | leftover lock from a killed process (days old, no git running) | delete the lock | — | [02](02-how-we-work.md) |
| B4 | Two stale duplicate deliverables in the repo | early split files never deleted after the combined file replaced them | delete superseded copies | one source-of-truth file; check what `index.html` points at | [11](11-wireframes.md) |
| B5 | Uncommitted work left hanging at session end | "show locally first" work never committed | list uncommitted changes at session end and decide | end-of-session checklist: commit, stash or discard | [10](10-prebuild.md) |
| B6 | Dependabot "failure" mistaken for a CI failure on the same commit | Dependabot's own update job failed | watch the "CI" workflow by name | `gh run list --workflow CI` | [21](21-testing.md) 8 |
| B7 | `git commit -m` breaks on PowerShell | embedded double quotes | write the message to a file, `git commit -F` | always use a message file | [02](02-how-we-work.md) |
| B8 | A working-tree edit silently reverted | an agent or tool overwrote the file | re-apply and push alone | commit small fixes immediately; `git diff` before every push | [02](02-how-we-work.md) |
| B9 | Copied repo has no CI secrets; every run red | secrets do not travel with code | CI DB branch + eight secrets | day-one checklist for any new repo | [21](21-testing.md) 8 |
| B10 | `LAUNCH-READINESS.md` lost its title line | a concurrent small edit replaced line 1 | restore | shared-file protocol: re-read before editing; review doc diffs | [02](02-how-we-work.md) |

## C. Vercel, deploys and DNS

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| C1 | Deploy "blocked because the commit author did not have contributing access… Hobby Plan does not support collaboration for private repositories" | commit authored with the machine's global identity | repo-local `user.name/email` = Vercel-linked account's noreply; `--reset-author`; force-push with lease | set repo-local identity right after `git init` | [20](20-security.md) A5 |
| C2 | 404 NOT_FOUND on a static site | no `index.html` at the root (main file name had spaces) | root `index.html` redirect (meta refresh + `location.replace`) | every static repo has `index.html` at root | [11](11-wireframes.md) |
| C3 | "You forgot to change it" — fixes look missing | Vercel still building, or cached HTML (the in-app browser also cached) | check Deployments for the commit; hard refresh / private window; `?v=` cache-buster; no-cache meta; marker check on the live URL | verify deploy parity before asking for review | [11](11-wireframes.md) |
| C4 | All three first monorepo deploys ERROR | Turbo 2 needs `"packageManager"` in the root `package.json`; default `npm install --prefix=../..` under-installed workspaces | `"packageManager": "npm@11.14.1"`; install `cd ../.. && npm install`; build `npm run build`; static site: echo commands, output `.` | set these before the first import | [13](13-fullstack-frontend.md) |
| C5 | Subdomains "verified" but not resolving | Vercel verified ownership but no DNS records existed at the registrar | add `app`/`admin` CNAMEs to `cname.vercel-dns.com`; ~4 min | check where DNS is hosted first | [03](03-services-setup.md) |
| C6 | Env-var change not live | needs a redeploy | redeploy | redeploy after env changes | [03](03-services-setup.md) |
| C7 | Empty "redeploy" commit CANCELED | ignored-build step (`turbo-ignore`) skips no-change commits; also the admin deploy is skipped when only web changed (expected) | `POST /v13/deployments?forceNew=1` with `deploymentId` or `gitSource` | use the redeploy API script | [14](14-backend.md) |
| C8 | CI green but `main` never built on staging | Vercel queue busy with Dependabot branch builds (or the token issue) | trigger via API with `gitSource {repoId, ref, sha}`; poll by SHA | poll the deployment for every pushed SHA; consider ignoring Dependabot branches in Vercel | [14](14-backend.md) |
| C9 | Branch preview inaccessible ("protected… a team owner needs to approve") | Deployment Protection on previews | owner disables it for previews or shares a bypass link | decide preview protection up front | [11](11-wireframes.md) |
| C10 | Old backup project did not match what was live | backup taken from an older commit | copy the live page exactly to a fresh project before changes | back up from the live deployment, verify it | [16](16-growth.md) |
| C11 | Cron never runs | cron registers only on deploy | check project → Cron Jobs after deploy | include in the deploy checklist | [14](14-backend.md) |
| C12 | A page that needs the database returns a baked-in 404 in production (BehaveBridge `/setup`) | Next prerendered it at build time, when no database or key was reachable | `await connection()` from `next/server` at the top of the page | any page that reads env secrets or the DB at request time calls `connection()`; e2e hits it on the production build | [13](13-fullstack-frontend.md) |

## D. Email, OAuth and third-party consoles

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| D1 | OTP emails reach only your own inbox | Resend sandbox until the domain is verified | verify the domain (DKIM/SPF), set `EMAIL_FROM` to your domain | verify the domain before the first real sign-up | [03](03-services-setup.md) |
| D2 | Domain verification fails at the registrar | the registrar auto-appends the domain to the "Name" field (enter `send`, not `send.domain`); DKIM value truncated | enter host names only; paste DKIM on one line | say so in the setup guide | [03](03-services-setup.md) |
| D3 | Google sign-in `redirect_uri_mismatch` on staging | OAuth client lists only the production callback | add `https://<staging>/api/auth/callback/google` (no trailing slash); if the consent screen is in Testing mode, add test users | register staging callbacks when creating staging projects | [03](03-services-setup.md) |
| D4 | Gemini image models "quota exceeded" while text models work | the free tier has zero image quota | enable billing (AI Studio → API keys → "Set up billing", not "Upgrade"); friendly "at capacity, you weren't charged" copy meanwhile | enable billing before building image features | [14](14-backend.md) |
| D5 | All staging AI down (429 on every model); image production stopped | prepaid Gemini credit ran out | top up; verify with a live call to both models | budget alerts; check key health before a big generation job; keep a generation ledger | [16](16-growth.md) |
| D6 | Tripo wallet 0 despite "free credits"; credits show as "frozen/reserved" | API credits are separate from the Studio subscription; subscription credits appear reserved | top up before live tests | check balance via API before building | [03](03-services-setup.md) |
| D7 | Tripo docs disagree on credits per build (40 vs 60) | one page omits the geometry surcharge | cross-check model page, pricing page and wallet arithmetic; log `consumed_credit` per task | verify vendor pricing from several official pages | [16](16-growth.md) |
| D8 | Neon MCP connector, `ui-ux-pro-max` skill, other connectors "need auth" | OAuth cannot run in a non-interactive session | use CLI/API instead; install skills in an interactive terminal | expect it; not a blocker | [01](01-running-the-sessions.md) |

## E. Neon, database and migrations

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| E1 | Real 3D build failed "Generation not found" mid-poll | a CI run reset the demo profile on the same production database | dedicated CI branch (DB + bucket) | never share a database between CI and anything live | [21](21-testing.md) 7 |
| E2 | CI storage tests fail after `neon env pull` | pulling env for a branch mints new storage credentials, invalidating GitHub secrets | save the branch env once (`.env.ci-backend`); never re-pull | write it into CLAUDE.md; if re-pulled, update every secret at once | [20](20-security.md) A7 |
| E3 | CI fails on a missing column (`angle_photos`) | migration applied to production/staging only; the CI branch was created earlier | apply to every branch | migration checklist lists all branches | [14](14-backend.md) |
| E4 | `drizzle-kit push` wants to rebuild an existing primary key | introspection quirk on existing tables | additive direct-SQL `.mjs` migrations with `IF NOT EXISTS` | migrations, not push, after the first deploy | [13](13-fullstack-frontend.md) |
| E5 | Stored config overrides code defaults (old render model kept) | the `app_config` row wins over `DEFAULT_CONFIG` | update via admin PUT or `tools/cutover/config.mjs` | cutover config step; verify script | [15](15-payments-and-cutover.md) |
| E6 | Removed config keys reappear on staging | the previously deployed build wrote its defaults back before the new deploy | re-run `config.mjs reprice` after the deploy | reprice after deploy, not only before; idempotent config scripts | [15](15-payments-and-cutover.md) |
| E7 | CI branch `verify.mjs` FAIL on the render model | CI config row pinned a different model | reset it (tests never call the engine anyway) | document test-branch config drift | [15](15-payments-and-cutover.md) |
| E8 | Half-deployed state: new prices in config, old code serving | a round paused after applying the migration | finish and push the round | apply config/migrations close to the deploy; don't stop mid-round | [14](14-backend.md) |
| E9 | Account delete failed on foreign keys | most FKs lack `on delete cascade` | explicit per-table delete sequence, rehearsed in a rolled-back transaction | decide cascade rules in the schema early | [14](14-backend.md) |
| E10 | Drizzle heterogeneous table loops don't typecheck | typed table objects differ | explicit per-table deletes | same in teardown | [14](14-backend.md) |
| E11 | Ledger `at` was a display string ("just now") | label stored instead of a timestamp | never parse; store real timestamps later | store timestamps, format on read | [13](13-fullstack-frontend.md) |
| E12 | Migration hung during a network outage | DNS to the DB host lost | retry loop until connectivity returns | migrations must be idempotent so a retry is safe | [14](14-backend.md) |
| E13 | Duplicate demo rows on the CI branch | a half-crashed CI setup | reset the branch; duplicate-tolerant locator | idempotent setup | [21](21-testing.md) |
| E14 | Destructive migration would blank production data | 005 moved Google photo URLs between columns the live build still reads | run only at cutover | keep migrations additive; mark non-additive ones in the runbook | [15](15-payments-and-cutover.md) |
| E15 | Unknown data shapes in production | production data differs from staging | fork production, run every migration + config + verify, delete the fork | runbook step 1 | [15](15-payments-and-cutover.md) |
| E16 | Cost report undercounts | nightly demo reset, e2e runs and deletes wipe `generations` rows | report ranges; store `cost_cents` per call | store cost at call time | [16](16-growth.md) |
| E17 | Object Storage only in some regions | beta limitation | project happened to be in a supported region | check region support before choosing | [03](03-services-setup.md) |
| E18 | A generated migration fails: "constraint … does not exist" | drizzle-kit emitted `DROP TABLE … CASCADE` (which removes the foreign keys) before `DROP CONSTRAINT` on those same keys | reorder by hand: drop constraints and columns first, then the tables | run every new migration on a fresh in-memory database (the unit suite does) before any branch | [14](14-backend.md) |
| E19 | `drizzle-kit generate` stops to ask "created or renamed?" and cannot run unattended | a table or column was dropped and another added in the same change | two passes: generate a migration that only removes, then one that only adds | keep replacements as remove-then-add pairs | [14](14-backend.md) |
| E20 | A button that copies a record set times out on a local test run | the copy ran row by row inside a transaction — ~40 round trips to a database in another continent | bulk inserts: one statement per table, mapping old to new ids by a stable key | anything that copies a tree uses set-based SQL; watch for loops of awaits inside a transaction | [14](14-backend.md) |
| E21 | Object-storage keys rejected by Vercel, or the bucket never created | Vercel reserves `AWS_*` env names; Neon's `neon.ts` bucket option is `access`, not `accessLevel` | store them as `STORAGE_*`; declare `buckets: { documents: { access: "private" } }` and check the branch lists it | `tools/deploy/storage-keys.mts` fails loudly when a branch returns no storage credentials | [14](14-backend.md) |
| E22 | A presigned upload accepted any content type | the S3 presigner does not sign `Content-Type` unless told to | pass `signableHeaders: new Set(['content-type'])`, then HEAD the object and delete it if the type or size is wrong | a unit test asserts `X-Amz-SignedHeaders` contains `content-type` | [14](14-backend.md), [20](20-security.md) |
| E23 | A second staging portal needs its own Vercel verification record | Vercel verifies each project's domain with a TXT on `_vercel` | append the new value (Hostinger `overwrite: false`) beside the existing one; never replace; count records before and after | `tools/deploy/portal-staging.mts --dns` only adds, refuses to touch a differing CNAME | [03](03-services-setup.md) |
| E24 | A settings save that rewrites a table took ~20 seconds and looked broken | it updated one row per round trip — fine with a dozen seeded rows, not with sixty, and worse every week | one statement per batch (a `case id when … then …` over the ids), 200 rows at a time | any write that loops over a table needs a batch from the start; the growth that breaks it is normal growth, and an e2e timeout is how you find out | [14](14-backend.md) |

## F. Tests and CI

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| F1 | Mobile e2e project fails entirely | iPhone device profile defaults to WebKit (not installed) | `browserName: "chromium"` | template config | [21](21-testing.md) 5 |
| F2 | Camera specs throw `NotSupportedError` | Playwright's headless shell lacks `getUserMedia` | `channel: "chromium"` + fake media flags + `permissions: ["camera"]` | template config | [21](21-testing.md) 5 |
| F3 | Laptop overloaded; timeouts everywhere | full Chromium workers + agents + builds | idle machine; `workers: 1`; sentinel file for agents | never run heavy work alongside e2e | [21](21-testing.md) 3 |
| F4 | Credit-balance tests fail randomly; render results wrong intermittently | parallel spec files mutate the same demo/test accounts | one worker; a dedicated throwaway account per spec family; assert ledger events, not balances | start with one worker when specs share data | [21](21-testing.md) 12 |
| F5 | Two runs passed against old code | Playwright reused a stale server from a killed run | `reuseExistingServer: false`; free ports 3000/3001 first | keep both | [21](21-testing.md) 3 |
| F6 | Spec "failures" with a missing prerender manifest | tests started while `.next` was being rebuilt | wait for the build | never run tests and builds in parallel | [21](21-testing.md) 3 |
| F7 | Random `ECONNRESET` on first requests | Node idle-socket timeout shorter than Playwright's pool | `--keepAliveTimeout 60000` on `next start` | template config | [21](21-testing.md) 12 |
| F8 | Clicks intercepted | PWA install banner overlays the top bar | `addInitScript` sets the dismissed flag | test fixture | [21](21-testing.md) 5 |
| F9 | Ambiguous selectors ("53" matched twice; hidden rail counter matched first; "Swap" matched a paragraph) | loose text selectors | role/test-id selectors; `.first()` where duplicates are legitimate | select by role or test id | [21](21-testing.md) 5 |
| F10 | Credits double-spent; history walked to `about:blank` | blind retry loops on mutating clicks | idempotent retries guarded on state; wait for network idle; click once | `clickUntil` helpers | [21](21-testing.md) 5 |
| F11 | 409 on a friend request / no 402 gate on CI | `retries: 1` re-runs specs whose first attempt mutated data | retry-tolerant assertions (`[201, 409]`, conditional 402) | design specs idempotent | [21](21-testing.md) 5 |
| F12 | Stale package id after a reseed | serial ids continue | fetch live ids from `/api/config` | never hard-code ids | [21](21-testing.md) 5 |
| F13 | Login `waitForURL` timeouts under load | waiting for the full load event | `waitUntil: "commit"`; `test.slow()` | — | [21](21-testing.md) 5 |
| F14 | Admin e2e made a live AI call | `GEMINI_MOCK=1` set for the web server only | mock env on every test server | "no real provider calls in tests" guard | [21](21-testing.md) 6 |
| F15 | Mock "poisoned" staging rows (hoodie facts on every item) | local e2e against staging with a mock that wrote the same facts everywhere | category-aware mock; demo reset | mocks that write to shared data must be input-dependent, or use an isolated branch | [21](21-testing.md) 6 |
| F16 | Stage B CI failed | cross-account specs needed `AUTH_SECRET` in Actions | add the secret; wire it in the workflow | list every env the specs need | [21](21-testing.md) 8 |
| F17 | Test account reappears in production DB | global setup created it; no teardown | teardown deletes `%@test.local` + files; CI on its own branch | teardown from day one | [21](21-testing.md) 7 |
| F18 | Overlapping CI runs collide (password-swap race; "(e2e)" row seen by another run) | back-to-back pushes share one CI database | `workers: 1`; dedicated account; `concurrency: group` in the workflow | push once per round; concurrency from day one | [21](21-testing.md) 8 |
| F19 | 429 where a spec expects 401 | rate-limit counters persisted between runs | global setup clears test-pattern counters | clear in setup | [21](21-testing.md) 7 |
| F20 | `sqlScan.test.ts` fails on Windows only | allow-list fragment with `\n`, checkout uses CRLF | normalise line endings; `.gitattributes` | compare normalised text | [21](21-testing.md) 4 |
| F21 | Attack suite fails with 403s and credit races | it shared `buddy`/`storer` accounts; renames left stale share recipients; teardown list hard-coded | dedicated `prober`/`victim`; update teardown; grep old identifiers | each security spec owns its accounts | [20](20-security.md) B1 |
| F22 | Block test fails because a name search returns results | real staging sign-ups shared the demo's name | assert the specific username is absent | never assert global emptiness on a shared DB | [21](21-testing.md) 7 |
| F23 | Nine login failures in a cascade | test password no longer met new strength rules | strong fixture password; dedicated `changer` account | update fixtures when validation changes | [21](21-testing.md) 12 |
| F24 | Admin spec clicks blocked by toasts | success toasts were blocking dialogs | specs click OK; later a non-blocking bottom bar | non-blocking success feedback | [21](21-testing.md) 12 |
| F25 | `page.route` mocks ignored | the service worker intercepts fetches | `serviceWorkers: "block"` in that context | block SW where network is mocked | [21](21-testing.md) 5 |
| F26 | Landing test saw a "returning" user | ran after the onboarding test in a serial file | run it first while the account is seconds old | order state-dependent tests deliberately | [21](21-testing.md) 5 |
| F27 | 3D consent UI test flaky only on CI | undetermined runner timing | self-skip on CI; API-level test stays | download CI traces (`gh run download`) to inspect | [21](21-testing.md) 8 |
| F28 | Many failures in under a second, 500s, ENOTFOUND | the machine lost DNS/internet (13, 14, 15, 16 Sep) | check connectivity; re-run or resume from the failed phase | check the network before debugging code | [21](21-testing.md) 12 |
| F29 | Test helper false negative (all plans looked locked) | helper clicked a hidden modal's button instead of the visible one | click visible elements; assert navigation before results | — | [11](11-wireframes.md) |
| F30 | Verification passed but the bug was real (blank admin panel) | automation checked presence, not viewport position | assert `rect.top < innerHeight`; test at your real viewport | repeat reports are real bugs | [11](11-wireframes.md) |
| F31 | Tests pass but numbers are wrong (13 review defects after a green run) | tests check behaviour, not arithmetic against the method | adversarial review after tests; second review per defect | always run a refute-style review on money changes | [14](14-backend.md) |
| F32 | Price scaled twice (120 → 1,200,000) | conversion in both form and API | convert once; caught by local e2e | e2e the admin edit-and-reload round trip for money fields | [14](14-backend.md) |
| F33 | Full suite grew from 40 min to "2.5 hours" | 243 tests × two projects, one worker, real Chrome | targeted runs for small pushes; full suite in CI | keep specs API-first with one UI path each | [21](21-testing.md) 11 |
| F34 | CI typecheck fails on code whose unit tests pass | Vitest strips types without checking them | run `tsc --noEmit` per package in CI before the tests | typecheck is its own CI step; every package, including `packages/ui`, has a tsconfig | [21](21-testing.md) |
| F35 | `waitForLoadState('networkidle')` hangs forever on every signed-in page | sidebar links to screens not built yet; their prefetch never settles in the production build | only list a section once its screen exists; `prefetch={false}` on dynamic nav links | the layout/a11y sweep uses networkidle, so it catches this on the first run | [21](21-testing.md) |
| F36 | Selector by label fails although the label is on screen | the label contains a required `*`, so an exact match misses | `getByLabel(/^Name/)` | regex-anchored label selectors for required fields | [21](21-testing.md) |
| F37 | A test navigates away and the saved change is missing | it moved on before the server action finished | wait for the success notice (`role=status`) before navigating | every save step ends with an assertion on its feedback | [21](21-testing.md) |
| F38 | Layout "spills" ship although screenshots were checked | screenshots were eyeballed at one width | a layout spec: every screen × 375/768/1280/1440, failing on any element past the viewport or overflowing its own box, plus exactly one `aria-current` nav item per route and collapse/drawer behaviour | written with the design standard, before the screens are redone | [12](12-ui.md), [21](21-testing.md) |
| F39 | A notifications test can never reach the "allowed" state, even after `grantPermissions` | headless Chromium reports `Notification.permission` as `denied` regardless | test the blocked state as-is; for the "not decided" state, override `Notification.permission` with `addInitScript` | real push delivery is proven on a phone, not in CI | [21](21-testing.md) |
| F40 | Taps on a phone-emulated project hit the wrong button | an install banner (or any card) appeared after hydration at the top of the page and shifted every control down mid-click | put late-appearing content below the page, never above it | the layout sweep plus clicks in the mobile project catch it; a UI rule, not a test workaround | [12](12-ui.md), [21](21-testing.md) |
| F41 | `getByRole('alert')` finds two elements on every Next page | Next's route announcer is a `role=alert` region | filter by text (`.filter({ hasText })`) or scope to the form | review new specs for bare `alert` locators | [21](21-testing.md) |
| F42 | A button labelled "Mark done" plus screen-reader text isn't found by its full name | the accessible name gets a space at the element boundary ("Mark done : …") | select by a regex prefix inside the row it belongs to | — | [21](21-testing.md) |
| F43 | Submitting timed out in e2e only for records that alert people | the request sent every email and push before replying; each database hop from a local machine is slow | save, reply, then send alerts with Next `after()`; the reply still names who is told | core takes a `defer` hook; unit test proves alerts wait for it | [14](14-backend.md) |
| F44 | Two sends of one offline record crashed the second | the online event and a timer flushed the queue together; the idempotency check passed for both before either inserted | one flush at a time on the device, and treat a unique-key clash on the device key as "already filed" | unit test fires two identical submissions at once | [14](14-backend.md) |
| F45 | A test suite failed to resolve a new shared-package subpath, and one already-passing file started failing | the test runner resolves workspace subpaths through its own alias list, not the package's `exports` | add the alias next to the others whenever a subpath export is added, longest path first | the check that a new shared module is importable is "run the suite", not "typecheck" | [21](21-testing.md) |

## G. Windows, shell and tooling

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| G1 | `python` does nothing / "Permission denied" | Windows Store stub alias | `py` launcher or the full Python path; later Python unavailable → use Node or the Edit tool | scripts as files | [02](02-how-we-work.md) |
| G2 | Console crashes printing Unicode | Windows console encoding | read via file tools; avoid printing glyphs | — | [02](02-how-we-work.md) |
| G3 | Inline Python in PowerShell breaks | quotes and here-strings | write `.py` files to the scratchpad | never inline | [12](12-ui.md) |
| G4 | `node -e` / heredoc scripts fail ("unexpected EOF"; a mangled regex broke a spec) | apostrophes, em dashes, backslash regexes in shell quotes | write `.cjs`/`.mjs` files; `split(sep).join("/")` | never inline multi-line JS | [14](14-backend.md) |
| G5 | Scratch script cannot resolve repo modules (`ERR_MODULE_NOT_FOUND`) | runs outside the workspace | copy into `apps/web`, run, delete (don't commit) | — | [13](13-fullstack-frontend.md) |
| G6 | `.ts` script fails on top-level await | tsx treats `.ts` as CommonJS | use `.mts` | — | [13](13-fullstack-frontend.md) |
| G7 | `cd` "stuck" between parallel shell calls; false failures | working directory not persisted | absolute paths on every command | — | [02](02-how-we-work.md) |
| G8 | Local static server silently down; browser hits an error page | process died when the shell exited | check for HTTP 200 first; restart on a new port | project-specific ports | [11](11-wireframes.md) |
| G9 | Old greyscale UI shows after the redesign | an old Python server on another port served a stale copy | new server on a new port; kill the old process | check which process owns the port | [12](12-ui.md) |
| G10 | Browser pane cannot save renders or fetch cross-origin; screenshots time out; external URLs refused; batches over 25 actions rejected | sandbox limits | a same-origin Node dev server with `POST /save`; DOM measurements instead of screenshots; local Playwright for production screenshots; split batches | plan DOM assertions as primary evidence | [12](12-ui.md) |
| G11 | `next start` serves 404 for new assets | `public/` snapshot read at boot | restart the server | note in dev docs | [13](13-fullstack-frontend.md) |
| G12 | `next dev` clobbered a running `next start` | both write `.next` | rebuild and restart | never run both from the same directory | [13](13-fullstack-frontend.md) |
| G13 | Hydration error only on your machine | Windows Reduced Motion on; templates rendered differently server vs client | first paint static; animate only on client navigations | test with reduced-motion emulation | [13](13-fullstack-frontend.md) |
| G14 | Zustand SSR hydration mismatch | persist without `skipHydration` | `skipHydration` + rehydrate in Providers | template store | [13](13-fullstack-frontend.md) |
| G15 | React Query never refetched (empty package list; seed catalog shown 60 s) | `initialData` + `staleTime` counted as fresh | `initialDataUpdatedAt: 0` | note in data-layer conventions | [13](13-fullstack-frontend.md) |
| G16 | Skill install fails | needs an interactive terminal | install from an interactive shell | — | [01](01-running-the-sessions.md) |
| G17 | Two sessions building the same app overwrite `apps/site/out` | concurrent turbo builds | check for running `next`/`turbo build`; confirm a fresh `out/index.html` | one build owner per output folder, or separate worktrees | [16](16-growth.md) |
| G18 | Git Bash `/d/...` paths create `D:\d\...` folders | a Windows program (PGlite) received the MSYS path | pass `$(pwd -W)` or a Windows path | never hand `/d/...` to a native Windows tool | [21](21-testing.md) |
| G19 | `fork: Resource temporarily unavailable`, then Turbopack `0xc0000142` "node process exited before we could connect" | the Git Bash (MSYS) session degraded after hours of parallel builds and tests | run builds and Playwright from PowerShell; the same command succeeds there | in long sessions, heavy builds from PowerShell; never run turbo `test` (it rebuilds every app in parallel) on an 8 GB machine — run package suites one at a time, as CI does | [21](21-testing.md) |
| G20 | A push command with the token inline is blocked by the safety classifier | the secret is visible on the command line | a one-off credential helper reading the token from the gitignored `.env.local` | the helper is the standard push command for the repo | [20](20-security.md) |

## H. Single-file prototypes (wireframes and UI)

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| H1 | Design-tool `.dc.html` export does not render in a browser | proprietary runtime (`support.js`) missing | rebuild as standalone vanilla HTML/JS | check exports open in a plain browser before promising them | [11](11-wireframes.md) |
| H2 | Image-only PDF: Read fails, no text, wrong page count | poppler missing; scanned pages | render pages to PNG with pypdfium2; confirm the count with two libraries; extract text with pypdf where present | — | [11](11-wireframes.md) |
| H3 | Edit anchors fail on a minified JSON-escaped export | `</…>` and escaped quotes | anchor on unique escape-free substrings; hide with `display:none` rather than cut | for heavy changes rebuild the page cleanly | [10](10-prebuild.md) |
| H4 | Edit anchors not unique / whitespace mismatch in a 250 KB file | same string in both controllers; line shifts after inserts | Python/Node scripts with assert-on-count replace (`rep(old, new, count)`) | re-read exact anchors before each script; audit after each | [11](11-wireframes.md) |
| H5 | Over-deletion (a modal removed while another screen opened it) | a removal script deleted a shared block | audit flagged the broken `data-open`; restored | run the link audit after every deletion | [11](11-wireframes.md) |
| H6 | Stray `</div>` after a regex block removal: content stuck at the bottom, 12 of 13 admin screens outside the scroll container | regex removed a chart but left its closing tag | delete the stray tag; count screens inside the container | balance-check div structure after regex removals | [11](11-wireframes.md) |
| H7 | Blank admin panel (even after hard refresh) | during login the empty `.app` box filled the viewport and pushed the login panel below the fold; a later structural fix re-broke it (fix collision) | hide only side/columns in auth mode; login flexes to fill | re-test every state a structural fix touches, logged-out and logged-in; check viewport position | [11](11-wireframes.md) |
| H8 | Admin login stuck to the left | flex child with no grow | `flex: 1 1 100%` | test auth screens at desktop and mobile | [11](11-wireframes.md) |
| H9 | Back-navigation loops (three variants) | forward-navigating to the top-of-history screen pushed a duplicate; hard-coded `data-nav` back targets; a timed loading screen entered history | dedupe in `go()`; `data-back` uses history; exclude transient screens | a crawl that presses back repeatedly from deep screens | [11](11-wireframes.md) |
| H10 | Tabs/chips highlight but nothing filters | radio state stored, nothing read it | filter functions in `render()` combined with search | every selectable control gets a state-mutation test | [11](11-wireframes.md) |
| H11 | Every item opened the same detail ("Green sneakers") | static detail screen | capture the clicked item; render from data | data-driven detail screens from the start | [11](11-wireframes.md) |
| H12 | Demo looked used ("2 of 3 free generations") | initial state | start at 3/3 | review seed data as a first-time viewer | [11](11-wireframes.md) |
| H13 | Launcher clipped after adding a third card | centred flex with no scroll; JS forced inline `display:flex` | block layout + scroll container; let CSS govern display | never set layout via inline style from JS; test short viewports | [11](11-wireframes.md) |
| H14 | New legal screens showed the bottom nav | not added to the no-nav list | add to `U.AUTH` | checklist: "does this new screen belong in the no-nav list?" | [11](11-wireframes.md) |
| H15 | Colour emoji broke greyscale (lock, fireworks) | emoji in a greyscale design | monochrome text badges; no emoji in client docs | design rule | [11](11-wireframes.md) |
| H16 | Leftover values after a model change ("∞" credits, "Go unlimited", stale FAQ) | old terms in both apps and docs | grep the whole repo for retired terms | grep after every pricing/model change | [11](11-wireframes.md) |
| H17 | Manage-subscription showed a price for Free users | plan state not covered | test every plan state on every plan screen | plan-state matrix | [11](11-wireframes.md) |
| H18 | Clicks do nothing in DOM tests | the app starts on a launcher | click `[data-enter="user"]` first | record in the handoff doc | [11](11-wireframes.md) |
| H19 | Lazy-loaded icons look broken in DOM checks | `loading="lazy"` | scroll into view before checking `naturalWidth` | — | [11](11-wireframes.md) |
| H20 | Clicks fall through to navigation | new `data-*` attributes missing from the delegated `closest()` list | add every new attribute | keep the list next to the attribute vocabulary | [12](12-ui.md) |
| H21 | Detail title ignored the tapped look; renamed look lost its image; shutter toast vanished; swap highlight dead; "Move" moved the menu chip not the card; selection dot overlapped text | each: state not read first, fallback keyed by new title, `go()` cleared the toast, modal built after the toggle loop, chip shared the card's `data-look`, override CSS inserted before the base rule | read `st` first; keep a stable key; set toast after `go()`; set state inline when building; scope queries to grid cells; append overrides after base rules with matching specificity | data-driven screens; ordered CSS | [12](12-ui.md) |
| H22 | Icons vanished on dark; credits pill lost its spaces | light-theme colour assumptions; inline-flex collapsed text nodes | light tiles behind icons; `gap: 4px` | grep light-theme colours when switching to dark | [12](12-ui.md) |
| H23 | Invalid CSS silently drops a whole transform (`scale(calc(var(--size)/640))`) | dividing a length by a unitless number inside `scale()` | `/640px`, or an explicit unitless scale variable | read computed `transform`; `none` means the declaration was invalid | [10](10-prebuild.md) |
| H24 | Reduced-motion fallback froze the brand (ring not moving, page "still") | `prefers-reduced-motion` block switched off the ring and marquee; the device had reduce-motion on | keep essential brand motion, calm only ambient drift | test with reduced-motion on; decide which motion is essential | [10](10-prebuild.md) |
| H25 | Screenshot tool timeouts all session | flaky renderer; heavy `blur(100px)` | DOM/computed-style verification; lighter blur; headless Edge via puppeteer-core when images are needed | plan DOM assertions as primary evidence | [11](11-wireframes.md) |
| H26 | Wireframe simplification leaks (one shared detail screen → only two titles have distinct seeded share data) | prototype shortcut | state it as a known limitation | — | [11](11-wireframes.md) |

## I. Design and asset pipeline

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| I1 | Hand-transcribed base64 image truncated | Claude typed binary data | revert; save the real file to disk; resize with Pillow | never type binary data; images pasted in chat don't land on disk — save to an exact path | [10](10-prebuild.md) |
| I2 | Saved file has a double extension (`.png.png`, `.jpg.png`) | the generator's save dialog | rename/convert on intake | list the folder after "saved" instead of assuming | [12](12-ui.md) |
| I3 | Wrong crop offsets | assumed sheet width (2816 vs 2752) | read the real dimensions first | always read size before slicing | [12](12-ui.md) |
| I4 | Generated grid does not follow the prompt (5×3 instead of 3×3, duplicates, shuffled cells) | image generators drift | cherry-pick by position; map by baked filename labels | bake labels; ≤ 9 cells per sheet | [12](12-ui.md) |
| I5 | Some PNGs will not decode with GDI+/.NET | encoder quirk | use Pillow | — | [12](12-ui.md) |
| I6 | Icon bottoms clipped | label-trim crop zone too small (0.72 of the tile) | re-slice at 0.79; audit bounding boxes numerically | check glyph bounds against the crop window | [12](12-ui.md) |
| I7 | Ring text repeated like a pattern on generated icons | prompt didn't say "once" | "the word appears EXACTLY ONCE per ring; the rest is a plain line" | state such rules explicitly in prompts | [12](12-ui.md) |
| I8 | Faint frame around sliced icons | alpha threshold alone | crop inside each tile border | — | [11](11-wireframes.md) |
| I9 | Logo port missed the second word on the ring | extraction sampled only the ring ends | extract every element; compare counts programmatically | — | [13](13-fullstack-frontend.md) |
| I10 | WebP texture compression failed (sharp/vips) | native library issue | Draco/geometry-only compression (still ~90% smaller) | — | [12](12-ui.md) |
| I11 | Placeholder store names ("ShopY") in marketing screenshots | seed catalog | left as your decision | seed realistic but clearly fictional data before captures | [16](16-growth.md) |
| I12 | British spelling inside captured app screenshots on an American page | app UI and item names stored in British English | switch the app; recapture | decide the target locale before generating demo/marketing data | [16](16-growth.md) |
| I13 | Client says the UI "looks vibe coded" after a port | only the color tokens were ported, not the approved screens' structure and components | port the screens themselves (shell, list, form, detail patterns) and fix their faults | a written design standard + checklist per screen in `packages/ui`, the frontend-design skill loaded, layout tests (F38) | [12](12-ui.md) |
| I14 | The approved palette fails contrast | light brand blues under white text; status colors on their own tints (~3:1); white on a white-wash nav highlight (3.9:1) | measure every pairing with a script; dark brand blue for buttons and text, deeper `-text` shades on tints, the sidebar's white-pill tokens for the current item | the axe suite on every screen fails the build; record each change in the spec as a revision | [12](12-ui.md) |
| I15 | Tailwind classes in `packages/ui` do nothing in the app | Tailwind v4 does not scan workspace packages | `@source "../../../packages/ui/src";` in the app's `globals.css` | add it when the shared component package is created | [12](12-ui.md) |
| I16 | Logos of 1.6–1.8 MB slow every page | original artwork used directly | resize to display size ×2 (96 px mark, 400 px wordmark) with sharp | check `public/` sizes in the design checklist | [12](12-ui.md) |
| I17 | A constant (cookie name) is undefined on the server, so a saved preference is ignored | it was exported from a `'use client'` file; server components receive a client reference, not the value | move shared constants to a plain module | only components cross the client boundary; constants and helpers live in non-client files | [12](12-ui.md) |
| I18 | Action forms inside `<details>` are squeezed to ~90 px | a closed `<details>` in a flex row shrinks to its summary's width | a confirmation dialog holding the action and its reason | destructive actions always use the shared confirm dialog | [12](12-ui.md) |
| I19 | Long labels in a wrapping list of badges run off a phone screen | the badge truncates to its parent, but each list item grows to its text, so truncation never engages | give the list item `max-width: 100%` and let the badge wrap — official wording (a board's rubric) should not be cut off | the layout sweep with real long content | [12](12-ui.md) |
| I20 | A dropdown or long option widens a grid form past a phone screen | grid tracks default to `minmax(auto, …)`; a `<select>` sizes to its longest option | `minmax(0,1fr)` tracks and `min-width: 0` on grid children | the design standard's grid pattern includes it | [12](12-ui.md) |
| I21 | Every photo looked like it had a glow around it | each tile sat on a blurred, darkened copy of the same photo, which was fine for full-bleed shots and wrong for cut-outs | one plain card colour behind every photo, and no gradient wash over it | decide the backdrop once the photo pipeline is settled (cut-outs need a flat colour, not a self-blur) | [12](12-ui.md) |

## J. PWA, phones and Samsung

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| J1 | "Install isn't available in this browser" when already installed | no `related_applications` / `getInstalledRelatedApps()` | add both; device must reinstall from the same origin after the deploy | — | [13](13-fullstack-frontend.md) |
| J2 | Back-button ping-pong between two routes | back buttons pushed new entries | `router.back()` when in-app history exists; explicit target only for deep links; e2e guard | — | [13](13-fullstack-frontend.md) |
| J3 | Samsung Internet install blocked / Play Protect "unsafe app" | Samsung's WebAPK packaging service, not your manifest | harden the manifest anyway; on Samsung Internet replace Install with a "use Chrome" guide sheet | test installs on Samsung early; only a store listing removes the warning | [13](13-fullstack-frontend.md) |
| J4 | Whites look grey in Samsung dark mode | gradient backgrounds clipped to text are darkened by forced dark mode; `color-scheme: dark` meta insufficient | `.sbrowser` class → flat white; `<meta name="color-scheme" content="only light">` | avoid gradient-clipped brand text or ship a flat fallback | [13](13-fullstack-frontend.md) |
| J5 | Old manifest cached on the phone | site data | tell the tester to clear site data before retesting | in every phone retest guide | [21](21-testing.md) 10 |
| J6 | Push status-bar icon shows a white square | Android badge must be monochrome and transparent; thin strokes vanish at 24 px | bold geometric silhouette PNG | — | [13](13-fullstack-frontend.md) |
| J7 | Rename never saved on phones | saved only on Enter; mobile keyboards blur | save on blur | test on phones | [13](13-fullstack-frontend.md) |
| J8 | "Copy link" did not copy; share failed on iPhone | awaited a server call before the clipboard/share call; phones require it inside the tap gesture | create the link when the sheet opens; spinner until ready; act instantly; selectable fallback box | keep clipboard/share inside the gesture | [14](14-backend.md) |
| J9 | Background 3D build never completed for the user | polling lived on the progress screen only | gallery takes over polling; nightly server sweep; shared completion lib | polling must survive navigation | [13](13-fullstack-frontend.md) |
| J10 | Delete account "didn't work" | confirm word case-sensitive; feedback a small toast | case-insensitive; "Deleting…" state; server reason in the sheet | inline feedback on confirmations | [14](14-backend.md) |
| J11 | Camera context leaked from the avatar flow into "Add item" (garments refused as "no person") | persisted transient flow context | every entry sets context; exclude from persistence; reset on finish | never persist transient flow state | [14](14-backend.md) |
| J12 | Engine quota errors shown raw | provider text passed through | map quota/overload to "at capacity… You weren't charged" | wrap provider errors | [14](14-backend.md) |
| J13 | Install and push planned for one audience only; the client expects every portal on their phones | the spec said "push for parents who install" | every portal gets its own manifest, icon, start URL, install prompt, per-browser install guide and push | ask in the first UI round which portals install and which notify | [13](13-fullstack-frontend.md) Step 3 |
| J14 | A teacher in the gym loses signal mid-record | server-rendered forms need the network to open and to submit | the record page carries its data (students, rubric, lists, timetable); pure rules shared with the server run on the phone; unsent records queue per person with a device key; the service worker keeps only the pages that must open offline and clears on sign-out | e2e goes offline mid-flow, checks the queue, comes back and checks the database | [13](13-fullstack-frontend.md) |

## K. 3D

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| K1 | 54–58 MB GLBs; GitHub >50 MB warnings; slow on mobile | raw engine output | Draco/meshopt compress to ~5–6 MB | compress before publishing | [10](10-prebuild.md) |
| K2 | "Shiny" avatars; stutter | PBR + image-based lighting per frame | Lambert or `MeshStandardMaterial` roughness 1 / metalness 0 with a studio rig | match the maker tool's look | [13](13-fullstack-frontend.md) |
| K3 | "Low quality" 3D after switching to matte | Lambert discarded normal and AO maps | `MeshStandardMaterial` keeping `map`, `normalMap`, `aoMap` | A/B render the real asset before blaming the engine | [13](13-fullstack-frontend.md) |
| K4 | Models side-on | engine default orientation; share copies use +X forward | `orientation: "align_image"`; rotate existing GLBs −90° about Y with gltf-transform | set orientation in engine settings; normalise at export | [13](13-fullstack-frontend.md) |
| K5 | Rotated avatars still sideways for users | immutable cache + overwritten key; thumbnails captured from the cached copy | new keys; clear thumbnails | never overwrite an object key | [14](14-backend.md) |
| K6 | Empty 3D viewer in Step 1 | a `field-of-view` override zoomed past the model | let the camera auto-frame | screenshot every 3D screen | [13](13-fullstack-frontend.md) |
| K7 | sharp fails on avatar textures ("colourspace: parameter space not set") | libvips issue on these files | geometry-only compression (dedup, weld, simplify 0.06, prune + meshopt): 41 MB → 3.9 MB in 3.9 s | benchmark on a real asset before committing to a pipeline | [14](14-backend.md) |
| K8 | Vendor capability mismatch (planned "photos + pick an outfit", engine reconstructs as photographed) | assumed capability | Path B: generate the four views first | research API behaviour before designing | [11](11-wireframes.md) |
| K9 | Max builds cost more engine credits than expected | max settings ≈ 55–60 credits | wallet display + low-wallet alert (threshold 200) | log `consumed_credit` per task | [14](14-backend.md) |

## L. AI engines

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| L1 | Render changed the clothes | flash image model drifted on garment details | strict fidelity prompt; construction facts; all angle photos; post-render verifier with a free "Render again" | prompts as pure functions with unit tests | [14](14-backend.md) |
| L2 | Match ignored the required item | it was a request, not a guarantee | server resolves the piece before charging; tells the model it is mandatory; retries once; swaps it in deterministically | enforce on the server | [14](14-backend.md) |
| L3 | Black image accepted as a garment; multi-item photos; faces | no photo checks | ten refusal kinds in the same detection call, free, only when confident | check every upload | [14](14-backend.md) |
| L4 | Short-sleeve tee drawn over a long-sleeve top; a watch from the avatar photo copied into renders | no layering rules; base photo treated as a garment source | no two base tops (server removes one); explicit layer order; photo used only for face/hair/body/pose; post-render check | rulebook + verifier | [14](14-backend.md) |
| L5 | Silent auto-render would have become a hidden charge | outfit screen drew any picture-less look on open | explicit "See it on you · N credits" button | audit every automatic paid call when pricing changes | [16](16-growth.md) |
| L6 | Hard-coded chips ignored admin lists | chips typed into screens; the stylist used its own word list | lists live from `/api/config` | every admin-editable list needs a consumer test | [14](14-backend.md) |
| L7 | Items with no facts re-described (paid) on every match; shop products lacked waist/collar facts | lazy backfill not persisted; product facts missing | persist; describe products on save | — | [14](14-backend.md) |
| L8 | Real cost per call unknown | typed per-call rates in admin | store token counts and `cost_cents` per call; provider prices in config | store cost at call time | [16](16-growth.md) |
| L9 | The AI budget cap understated real spend | prices assumed instead of read; thinking tokens are billed as output but were not counted | take prices from the official pricing page, make them overridable by env, add `thoughtsTokenCount` to output | unit test on the cost formula | [14](14-backend.md) |

## M. Product and data truth

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| M1 | Admin dashboard showed fake numbers (312 signups) | prototype fixtures | stats endpoint from the DB excluding demo | no invented metrics | [13](13-fullstack-frontend.md) |
| M2 | Wrong demo numbers ("143 items" with 5 visible; owned items missing from the closet) | hard-coded counts | derive from data; seed consistency | counts from data | [12](12-ui.md) |
| M3 | Backend-speak shown to users ("type at least 2 characters") | implementation detail in copy | plain placeholder | copy review | [12](12-ui.md) |
| M4 | Copy promised things the app didn't do ("receipts emailed", "within 30 days", "credits a month") | copy not tied to behaviour | remove or tie to tests; `copy.test.ts` bans such phrases | promises tied to tests | [14](14-backend.md) |
| M5 | Wrong assumptions in recommendations (detection as a subscriber perk; four photos for the 2D avatar) | model unclear | your one-line corrections | state monetisation and data-model rules at the start of a round; save to memory | [12](12-ui.md) |
| M6 | "Avatar" meant two things | overloaded word (3D model vs profile picture) | rename the component `ProfilePic`; restate scope | keep a glossary of overloaded words | [14](14-backend.md) |
| M7 | Demo profile showed your email | UI fell back to the browser's Google session while loading | identity from the server only | never mix client session data into profile UI | [14](14-backend.md) |
| M8 | Share-as-3D greyed out on the demo; avatar share fell back to a different look | demo avatars were a code list, not rows; silent fallback | demo reset inserts real rows; avatar-only shares | demo content uses the same storage path as real data; never silently substitute | [14](14-backend.md) |
| M9 | Style-profile photo vanished after adding a second | one-level-deep merge replaced the photo object | per-slot merge; null clears one slot | deep-merge nested JSON; test "add second value, first survives" | [14](14-backend.md) |
| M10 | Returning Google users re-onboarded | no "set-up done" state after the OAuth callback | landing page decides by flag, style profile or account age > 15 min | store onboarding completion on the account | [14](14-backend.md) |
| M11 | Two sign-in methods on one email | no method stored | `auth_method`; refuse before sending codes | one method per email | [20](20-security.md) B2 |
| M12 | Suspended user saw demo wording | generic 401 copy | 403 suspended code; modal; periodic check | account-state messaging | [20](20-security.md) B2 |
| M13 | Persona wording drift ("stylist"); credit line read as ownership | positioning not encoded | build-failing test for forbidden words; "Development partner: …" | encode positioning as tests | [16](16-growth.md) |
| M14 | Pricing copy vs behaviour ("credits a month" granted once) | monthly grant belongs to payments | documented; yearly granted in full | keep promises tied to tests | [15](15-payments-and-cutover.md) |
| M15 | Account deletion left storage files | delete route removed rows only | delete `u<id>/` objects first; cleanup queue with admin retry | deletion tests check storage too | [20](20-security.md) B4 |
| M16 | Women's clothes offered to men and men's to women | the catalogue carried no audience at all, so every product was shown to everyone | a per-product audience (women / men / unisex, null = unknown) resolved from the feed's gender column, then the name, then the photo, with an admin override; the catalogue route filters by the user's "who do you dress for" answer | a shop for people has to know who each piece is for before it has two customers | [14](14-backend.md) |
| M17 | The audience filter read a women's product as men's | "women's" ends in "men's", so a men pattern matches both | test women first and return; anchor both on a word boundary, and unit-test the pair | any name-matching rule where one term contains another gets a test with both | [21](21-testing.md) |
| M18 | An answer list the filter matches by name was editable in the panel | the admin could rename "Women", which would silently stop the rule matching anyone — an earlier rename of one category had already happened | make that one list fixed: no add, rename or delete, refused in the API and greyed in the panel with a note saying why | when code matches a stored answer by name, lock the list or match by id | [14](14-backend.md) |
| M19 | Product descriptions in the shop were raw CSS (an `@media` block) | the bulk load stored the merchant feed's description verbatim | strip style and script blocks, CSS rules and tags on every write; where nothing readable survives, write one line from the facts on the row | never store third-party text unfiltered — clean it at the one write path every load goes through | [14](14-backend.md) |
| M20 | "I bought this" was forgotten: the shop kept selling a piece the user already owned | the closet piece did not record which product it came from | store the product id on the piece; the catalogue route marks those rows owned, the picks, the stylist and the swap sheets leave them out, and the grid says "In your closet" with no price; deleting the piece hands the product back | ownership is a per-user reading of a shared catalogue, never a change to the product | [14](14-backend.md) |
| M21 | The recommendation shelf felt generic and reshuffled on every visit | two lines of arithmetic re-ranked the catalogue client-side on each render | one stylist call per person per week, stored under that week's Monday with a reason per pick, and a deterministic picker standing in when the engine is unavailable | a recommendation the user is meant to trust is chosen once and kept, not recomputed per paint | [14](14-backend.md) |
| M22 | A packing list suggested pieces nobody sells | the model invented names and a helper guessed a category from the words | hand the stylist the catalogue and take only product ids back, so every suggestion carries a photo, a price and a working link | when a suggestion has to be buyable, the model picks from a list instead of writing prose | [14](14-backend.md) |
| M23 | A screen said "there is nothing for you" while the answer was still being fetched | the query carried an empty list as its initial data, so the data layer reported "not loading" before the first answer arrived | drop the initial data on any query the user waits on, and answer "is it really empty?" with `isFetched`, never `isLoading` | the tests were green — the end state was right. Open the screen on a slow first load and read what it says | [13](13-fullstack-frontend.md) |

## N. Security

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| N1 | Three routes answered signed-out (ad tracking, friends list, product feedback) | no session check | route inventory test + signed-out sweep | every route checks a session or is allow-listed with a "why" | [20](20-security.md) B1 |
| N2 | Nested dependency advisory cannot be overridden (PostCSS under Next.js) | the framework pins its own copy; only a major upgrade moves it | documented exception with an expiry date that fails the build afterwards | dated, self-expiring exceptions instead of disabling the gate | [20](20-security.md) B5 |
| N3 | `SECURITY.md` mapped the wrong list | document followed Claude's internal contract, not the requester's items | restructure around the requester's wording; add the carried vulnerability to the summary | deliverables answering someone's list lead with that list | [20](20-security.md) |
| N4 | Concurrent wrong OTP guesses bypassed the limit | non-atomic attempts counter | atomic counter | review found it; tests didn't | [20](20-security.md) B2 |
| N5 | Audit rows always named the owner; pack price changes not audited | audit wired to the wrong identity; a route missed | fix; second review per defect | adversarial review on admin money routes | [20](20-security.md) B2 |
| N6 | Admin alerts reached a customer account | in-app notifications to the admin's own user | separate admin notifications table | — | [20](20-security.md) B2 |
| N7 | `sql.raw` in a new admin route | convenience | caught by the scan gate before commit | keep the gate | [20](20-security.md) B1 |
| N8 | Emergency key decision left unanswered overnight | your answer cut off mid-question | Claude applied a stated default (allowed but audited and alerted) and reported it | state defaults up front when asking mid-workflow | [20](20-security.md) B2 |
| N9 | Marketing credentials or generated site output nearly staged | `tools/marketing/out/`, `apps/site/out` | gitignore; check before commit | explicit staging | [16](16-growth.md) |
| N10 | Uploaded school documents were one copied link away from public | a public bucket, or long-lived signed links | private bucket; upload by 10-minute signed PUT; open only through a signed-in route that redirects to a 60-second signed GET; the server trusts the bucket's HEAD, not the browser | the e2e spec checks an unsigned GET gets 403 and an anonymous route call gets 401 | [20](20-security.md) |

## O. Sessions, process and working with Claude

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| O1 | Misreading intent → over-building (HDRI panel for "brighter"; editing another project used as an example; WebGL aurora; redrawn favicon; deleted coverage row) | ambiguous request | you interrupt; Claude restates the goal | when a request references a tool feature or another project, restate the goal in one line and confirm before building anything large | [10](10-prebuild.md) |
| O2 | Blamed cache instead of finding the bug | first plausible explanation accepted | you repeated the report; real layout bug found | repeat reports are real bugs; verify in the viewport | [11](11-wireframes.md) |
| O3 | Question walls (12 in one message) hard to answer | batched questions | one-by-one multiple choice | the question-round suffix | [30](30-prompt-library.md) 0 |
| O4 | An answer was the "ask me questions" text (paste slip) | copy error | Claude used the recommended option | re-read answers; Claude re-asks when ambiguous | [30](30-prompt-library.md) |
| O5 | Context ran out mid-edit; a file left non-compiling | compaction at a bad moment | the summary flagged "CRITICAL INCOMPLETE STATE"; resume fixed it | keep edits compiling; keep memory and briefs updated so the summary is enough | [01](01-running-the-sessions.md) |
| O6 | Usage limit hit mid-build ("You've reached your … limit") | weekly plan limit on the expensive model | switch model; assess surviving partial work (typecheck, migrations, unit) instead of restarting | estimate batch size against the remaining allowance; switch **before** launching agents (they inherit the model) | [01](01-running-the-sessions.md) |
| O7 | API server unreachable (ENOTFOUND); session died instantly | connectivity | "Try again" / relaunch | self-contained briefs make restarts cheap | [01](01-running-the-sessions.md) |
| O8 | Background agent ended its turn while its own build ran; no report | it had nothing to wake it | brief agents to wait in the foreground and report only when done | in every agent brief | [02](02-how-we-work.md) |
| O9 | Scratchpad scripts vanished mid-session (`audit.py`) | temp cleared | re-created checks as live DOM queries | keep important verification scripts in a project folder | [11](11-wireframes.md) |
| O10 | Wrong save folder (plan file under the user profile; wrong workspace) | ambiguous location | you corrected | ask for the exact absolute folder | [11](11-wireframes.md) |
| O11 | Client's name / likeness in demo identity and marketing | seeded from real data | "Demo User" with a reserved-domain email; fictional AI personas | never use a real person's name or face without a separate decision | [16](16-growth.md) |
| O12 | Half-changed round abandoned for the next batch | temptation to merge batches | finish the green round first | smaller pushes are easier to retest and undo | [14](14-backend.md) |
| O13 | Review defects after green tests (13, then 6, then 4) | tests cover behaviour, not correctness of numbers or leftovers | adversarial review → fix → second review | always review money and admin rounds | [02](02-how-we-work.md) |
| O14 | Dismissed delivery question interpreted as "go" | — | Claude waited for the next instruction | a dismissed question means stop | [02](02-how-we-work.md) |
| O15 | Money written in cents confused you | ¢ notation | dollars with decimals everywhere; report converted | standing rule | [16](16-growth.md) |

## P. Landing page and performance

| # | Symptom | Cause | Fix | Prevention | Chapter |
|---|---|---|---|---|---|
| P1 | CLS 0.127 on mobile | font swap pushed hero images down | fixed-line hero text; reserve space | measure CLS on the live preview early | [16](16-growth.md) |
| P2 | Main thread busy ~470 ms after load on phones (local ~210 ms) | React hydration of a 194 KB HTML with a 111 KB second copy of the page | delay animations until load + idle; static HTML strings; full static rewrite deferred | mostly static HTML with small islands for marketing pages; trust live measurements | [16](16-growth.md) |
| P3 | "Invisible" section heading in screenshots | heavy blur glow repainting slowly after a long scroll | cheap gradient; pause off-screen animation; visibility smoke tests; verified by measurement (on top, opacity, brightness at 0/300/1000 ms) | avoid big blur filters; measure, don't eyeball | [16](16-growth.md) |
| P4 | Chart bars drawn with an invalid SVG path for tiny values | `h--` from a negative width | minimum bar width | open generated reports in a real browser before publishing | [16](16-growth.md) |
| P5 | Public share page blank on phones | the page lived outside the app shell; content rendered behind the fixed background | `app/s/layout.tsx` wrapping it in the shell | open every public route in a real logged-out browser | [14](14-backend.md) |
| P6 | 3D models on the site face sideways; ~4 MB each | +X forward; uncompressed | site-only compressed, rotated copies under ~1 MB | normalise at export | [16](16-growth.md) |
| P7 | AI personas presented as real people / provider marks | marketing wish | no tags on images, one footer line "…are AI-generated", never shown as customers, watermarks left | FTC and platform rules checked first | [16](16-growth.md) |

---

## The ten to memorise

1. Never share a database between CI and anything live (E1).
2. Never `neon env pull` for a branch whose credentials are GitHub secrets (E2).
3. Verify every token with one API call before relying on it; treat pasted tokens as compromised (A2, A8, A9, A10).
4. Set the repo-local git identity before the first commit (C1).
5. Mock every paid engine on every test server (F14).
6. One worker; never run tests during a build; never reuse a stale server (F3–F6).
7. Never overwrite a storage object key (K5).
8. Check the network before debugging a wall of instant failures (F28).
9. Restate the goal in one line before building anything large (O1).
10. Tests passing is not the same as numbers being right — review money changes adversarially (F31).
