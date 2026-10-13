# Changelog — the PWA Playbook

Add an entry after every batch until the project is finalised (payments live, production cutover done, landing page on the domain). Newest entry first. Keep the same rules as the guide: no secrets, no client name, money in dollars, no running costs.

## 2026-10-13 — Renamed

- The guide is now the **PWA Playbook** (it was "the Assemble replication guide"), published on GitHub as `pwa-playbook`. Chapter text is unchanged; `_source-notes/` keep the old name because they quote the sessions as they happened.

## 2026-09-26 — Who a product is for, and what a person already owns

Two pushes on the shop, from a round of client complaints. What is worth copying:

- `14-backend.md` and `40-pitfalls-master-list.md` M16–M22: **a catalogue that serves people needs to know who each piece is for.** One column (women / men / unisex, null = unknown) resolved from the feed's own gender field, then the product name, then the photo, with the panel's picker overruling all three. The filter lives in the catalogue route, so every screen that reads the catalogue obeys it at once — grid, recommendations, swap sheets and the stylist's own list — and the write path that accepts an addition checks it too. Nothing is hidden from a user the app cannot place, and the user's own data is never filtered.
- **Never let a rule match a name the operator can rename.** "Women" and "Men" are matched by name in code, so that one answer list became fixed in the panel and in the API. The earlier rename of a category (by the client, silently) is the evidence: the same rename here would have quietly stopped the filter matching anyone.
- **Renaming an answer the code matches by name is a migration, not a copy change.** Rewording the question made its answers read as fragments, so they were reworded too — and that meant moving three things at once: the list the pickers offer, the answer stored on every account, and the reader, which now strips the possessive so the old and new spellings are one answer. Without that third part, the gap between a deploy and its migration silently un-narrows every user. Word the answers the same way the thing they filter is worded, and the two sides of the filter read alike.
- **"Women's" ends in "men's".** Test the longer term first and return. It is worth a unit test with both spellings, and an apostrophe variant, because the bug it causes is invisible in a small catalogue.
- **Clean third-party text at the write path, not at the screen.** A bulk load stored merchant descriptions verbatim and a stylesheet ended up in the shop. One helper strips style and script blocks, CSS rules, tags and entities on every write, and where nothing readable survives it writes a plain line from the facts the row holds. Because every bulk load goes through the panel's own API, cleaning it there fixed the past and the future in one place.
- **Ownership is a per-user reading of a shared catalogue.** "I bought this" records the product id on the closet piece; the catalogue route then marks those rows `owned` for that account only. Nothing is written to the product, so deleting the piece hands it back. A look made before the purchase re-reads as owned: no price, no buy button, counts towards "everything owned".
- **A recommendation the user is meant to trust is chosen once, not per paint.** The weekly shelf is one AI call per person per week, stored under that week's Monday with a reason for each pick, and a deterministic picker stands in when the engine is mocked or refuses (stored the same way, flagged as rules). Nothing is charged for a call the user did not ask for — but it still gets its own bucket in the spend report, or it is a cost nobody can see.
- **If a suggestion has to be buyable, give the model a list and take ids back.** The packing list used to invent names and guess a category from the words; it now picks from the catalogue the traveller can actually see, so each suggestion carries a photo, a price and a working link.
- `12-ui.md` and pitfall I21: **a blurred copy of a photo behind the photo reads as a glow.** It flattered full-bleed shots and ruined cut-outs. One plain card colour behind every photo, and no gradient wash over it.
- Pitfall F45: a new subpath export from a shared workspace package needs an alias in the test runner's config as well as in `exports`. Adding the export alone passes typecheck and fails the suite — and it silently broke one file that had been passing.
- `21-testing.md` habit confirmed again: after touching a shared package, run the whole unit suite rather than the new file. The failure was in a file nobody had edited.
- **Run the whole end-to-end suite after a round like this, and read every failure twice.** Of the three failures it found, two were specs that had not caught up with behaviour changed on purpose — and one was a real defect nothing else would have caught: a settings save that rewrote the catalogue one row per round trip, which only became slow once the catalogue grew (pitfall E24). A spec that fails because the product got better is worth the ones that fail because it got worse.
- **A seeded-empty query makes "loading" invisible** (pitfall M23): a list that starts as `[]` reports "not loading", so a screen waiting on a slow first answer can show its empty state as though it were the answer. It mattered here because one screen's first visit of a week waits on an AI call. Passing tests do not catch it; opening the screen does.
- **When the machine's own network is flaky, run the suite where the network is not.** A local end-to-end run failed thirty tests on DNS lookups that had nothing to do with the code; the same commit in CI failed exactly one test, and that one was a real mistake in a new spec. A flaky environment does not just waste the run — it hides the single failure worth reading.
- **Prove a text pipeline on the real rows, not on samples.** Cleaning the feed looked finished until it ran over sixty live products: shouted banners and runs of feature names came through, and the generated line was not stable when the same row was saved twice. Both were invisible in unit tests written from imagination, and both were obvious in the first ten rows of output.
## 2026-09-23 — Expert portal, and handing a build to another account

- `21-testing.md` §5.3a: several apps in one Playwright suite (a webServer and projects per portal, cross-portal specs) and what a shared test database forces — tagged fixtures, assertions about your own rows, `clearCookies()` before a second sign-in, and killing stale dev servers.
- `12-ui.md`: links inside a sentence are always underlined (WCAG 1.4.1).
- `02-how-we-work.md` §7: two more living documents — `HANDOVER.md` and `PLAN-NEXT.md` — so a build can continue in a fresh session or a different account. The repo, the env file and the memory notes belong to the machine, not the account; only the conversation is lost, so it has to be written down.
- Pattern worth copying: the queue screen for a shared work list — unclaimed first (most serious, then longest waiting), claiming is a conditional update that returns nothing when someone else won, and the item leaves every other queue.

## 2026-09-22 (night) — Assignments and the teacher portal

- `40-pitfalls-master-list.md`: E23 (appending a second Vercel verification TXT), F41–F44 (Next's route announcer as a second alert, accessible names with sr-only text, alerts moved to `after()`, concurrent offline replays), J14 (offline-first recording), L9 (AI prices and thinking tokens).
- Pattern worth copying: a shared `packages/core` for portal logic, with pure modules (`match`, `time`, `rubric-rules`) that both the server and the phone run, so offline screens give exactly the server's answers.

## 2026-09-22 (evening) — School settings, import, audit log, rollover, documents

- `40-pitfalls-master-list.md`: E21–E22 (object-storage env names and bucket config; presigned uploads must sign the content type), N10 (private document files: signed PUT in, signed-in route out, trust the bucket's HEAD).
- Pattern worth copying: browser → bucket uploads with an XHR progress bar, a two-step server check (details and size before any bytes move, then HEAD what arrived), and an e2e spec that runs against the ci branch's real bucket instead of a mock.

## 2026-09-22 (later) — Matrix editor and installable app

- `40-pitfalls-master-list.md`: E18–E20 (drizzle-kit drop order, unattended generate, row-by-row copies over a distant database), F39–F40 (headless notification permission, late content shifting taps), I19–I20 (wrapping badge lists, grid tracks and selects).
- New reusable tools in the next app's repo worth copying: `tools/make-icons.mjs` (home-screen, maskable and badge icons from one mark), `tools/deploy/push-keys.mts` (VAPID keys per environment, private key never printed), `tools/deploy/staging.mts` (API deploy when git deploys are blocked), and the proof set in `tools/proof/` (staging account, drive, invitation follow-through, crawl, page).

## 2026-09-22 — Lessons from the next app (UI rework and verification)

- `21-testing.md` §9a: the verification habit — Claude proves every checkpoint (production-build gates, accessibility and layout sweeps, staging drive, email delivery by provider status, a private proof page with screenshots); the owner uses the app only at release milestones.
- `40-pitfalls-master-list.md`: C12 (prerendered DB page → `connection()`), F34–F38 (vitest does not typecheck, networkidle hanging on dead nav links, asterisk labels, navigating before a save lands, the layout sweep), G18–G20 (MSYS paths, degraded Git Bash → build from PowerShell, token-free push helper), I13–I18 (porting screens not just tokens, measured contrast fixes, Tailwind `@source`, heavy logos, constants from `'use client'` files, `<details>` squeezing forms), J13 (every portal installable with push).

## 2026-09-17 — Guide created

Guide created from chats 9 Jul–17 Sep 2026 and repo at commit `db4225c`; update after every batch until the project is finalised.

Built as a workflow: seven readers (six chat slices plus the repositories and documents) wrote `_source-notes/r1`–`r7`; four writers produced the chapters and templates; one completeness pass checked and fixed them. What the completeness pass changed:

**Files and structure**
- Confirmed all 16 chapters (`00`–`40`) and `templates/README.md` exist; added this `CHANGELOG.md` and linked it from the index.
- `00-index.md`: the index now points at `templates/README.md` as the templates index; the legend accepts both `☐` and `- [ ]` tick boxes; the "Day 0 accounts" reference now names the real section in `03-services-setup.md` (§2).

**Broken or vague file references (fixed)**
- `templates/export-history.mjs` → `templates/archive/export-history.mjs` (index, three places; `01`; `20`).
- `templates/agent-brief.md` → `templates/briefs/AGENT-COMMON.md` / `AGENT-BATCH.md` (`01`).
- `templates/playwright.config.ts` → `templates/testing/playwright.config.ts`; `templates/ci.yml` → `templates/ci/ci.yml`; `templates/.env.example` → `templates/repo/env/*.env.example` (`13`).
- Generic "in `templates/`" pointers replaced by the exact file in `03` (Dependabot, env examples, handover checklist), `14` (workflow scripts and briefs), `20` (`CLAUDE.md` §4), `21` (phone-retest guide), `30` (`CLAUDE.md`).
- `20-security.md` A9 sent readers to `16-growth.md` for the chat exporter; it now points at `01-running-the-sessions.md` §9.
- `templates/docs/memory-note.md`: the example index line used a literal `name.md`; now `[kebab-case-name].md`.

**Contradictions (fixed)**
- Tech-stack round: `02` and `04` said 18 questions "in August"; `12` said about 17; the commit subject is "17-question round" and the chat shows 17 decisions on 21 Aug 2026. All chapters now say 17 questions, 21 Aug 2026, commit `1da474d`.
- `13-fullstack-frontend.md` Step 4 stated an order (data → database → auth → tests/CI → observability) that contradicted its own Steps 4–6 and the chat (tests/CI came before the database). The text now matches the steps and says why.
- Commit identity: `20-security.md` A3 and A5 used `<user>@users.noreply.github.com` while `02`, `03`, `10` and the templates use `<ID>+<user>@…`. A5 now shows the `<ID>+` form with the `gh api users/<user> --jq .id` lookup and notes that the short form works on older accounts.
- Hosting plan: `04` said "Pro team" while `10`/`20` describe Hobby-plan blocks. `04` now says the prototype repos started on a Hobby account and the monorepo runs on a team (SAML), and why the Hobby rule matters.
- CI concurrency group: `21` shows the real workflow (`ci-backend`, `@assemble/web`) and the template uses generic names; `21` now says so.

**Missing content added from the source notes**
- `03`: the Neon package installs two binaries and `neonctl` hung on Assemble (use `neon`); the Neon MCP connector needs an interactive OAuth login; pitfall rows for `neonctl` and for the git credential prompt (`x-access-token` URL form plus `GIT_TERMINAL_PROMPT=0`).
- `20` Part A4 and `30` §11.3: the `x-access-token:` push URL form and `GIT_TERMINAL_PROMPT=0`, with the reason (a plain token URL opened a credential prompt a non-interactive session cannot answer).
- `20` Part D rule 8: deleting live data is a three-step act (read-only query → exact matches shown → explicit "run it"), including the desktop app's safety block seen on 10 Sep 2026 and the requirement to delete storage objects too.
- `13` Step 7: iPhone web push only works from the installed PWA on iOS 16.4 or newer.
- `14` pitfalls: `robocopy` exit code 1 means "files copied", not failure; the exclusion list for the backend copy.
- `11` Assemble example: the rejected mood-board experiment (4 Aug 2026) alongside the rejected desktop-native branch, as the origin of "delete what you reject, completely".
- `16` pitfalls: how to switch an app's language safely (copy and stored display data only; never identifiers, columns, slugs, enum values, storage keys or migrations; tell the AI prompts the locale).
- `01` §9: the archive masks the same key shapes as the secrets scanner (added `github_pat_`, `AQ.`, `tsk_`).

**Rule violations (fixed)**
- No real secret found in any chapter, template or source note (scanned for `ghp_`, `github_pat_`, `vcp_`, `AIza`, `AQ.`, `sk-`, `sk_live/test`, `re_`, `tsk_`, `AKIA`, Postgres URLs, JWTs and long random strings; the only matches are the masking patterns inside `templates/archive/export-history.mjs` and `templates/security/scan-secrets.mjs`).
- The client's name does not appear anywhere in the guide or the source notes; no personal e-mail addresses appear (only `@example.com`, `@test.local`, GitHub noreply and placeholder forms).
- The source notes carried absolute paths containing the developer's own folder name and Windows user name; masked to `<client-folder>` and `<you>` for consistency with `r1`.
- Cents notation: `14-backend.md` explained the per-call cost column "in hundredths of a cent"; reworded to a whole-number unit with the dollar threshold. `templates/briefs/AGENT-COMMON.md` said "cents in storage"; now "whole-number minor units in storage, dollars in display". Column names such as `cost_cents` are code identifiers and stay.
- No running-cost sections exist; the only money figures are product decisions (credit pricing formula, one real test render at about $0.17).
- No AI attribution appears in any commit example; the two places that mention the early co-author trailer do so only to say it must not be copied.

**Readability check**
- Every milestone chapter (`10`–`16`) has a prerequisites checklist, numbered steps, "For Claude — paste this" blocks, at least one Assemble example box and a Pitfalls box. Cross-cutting chapters (`01`–`04`, `20`, `21`) have Assemble examples and pitfalls; `21`'s pitfalls box is short by design and points at its own section 12 and `40` section F.

**Not changed (for the next pass)**
- `21-testing.md` shows the real Assemble `playwright.config.ts` and `ci.yml` with the `@assemble/*` scope; the templates use `@app/*`. Kept as "real file, annotated" versus "template".
- `16-growth.md` Parts B–D are method chapters with example figures; they are product decisions, not running costs, and were left as written.
- The guide describes Assemble as of 17 Sep 2026: payments are planned (`15` Part A), production cutover is rehearsed but not executed, the landing page waits for client approval. Update `00-index.md` §8, `15` and this file when those ship.
