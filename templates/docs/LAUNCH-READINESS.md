# Launch readiness — [APP]

> Template. Lives in the backend repo root. Every control in the customer app and the admin panel either works end to end or is removed. The only intentionally simulated area is **payments**, labelled "Test mode — you won't be charged" in the app. A row is ticked **only** with the test that proves it — "trust me" is not a status. Sections are added per round (A–K on Assemble between 2026-09-10 and 2026-09-17); never delete a row, mark it superseded.
>
> Legend: ☐ open · ☑ done (with the proving test) · ⏭ superseded by [row]. Tests live in `apps/web/tests` (unit) and `tools/e2e` (Playwright).

## A. Trust and honesty fixes
| # | Gap | Decision | Status / proof |
|---|-----|----------|----------------|
| A1 | [Public page rendered blank on phones] | [Public pages get the app shell's layering] | ☑ e2e `share.spec` · "create link → public page → vote" asserts the look name and buttons are visible |
| A2 | [Renders change the clothes] | [Strict fidelity: every piece's photo attached, verification pass, free redraw on failure] | ☑ `tests/renderPrompt.test.ts` · live check recorded in the release notes |
| A3 | [A warning promised something the app does not do] | [Removed; copy says what is true] | ☑ `tests/copy.test.ts` bans the wording |

## B. Customer features
| # | Gap | Decision | Status / proof |
|---|-----|----------|----------------|
| B1 | [31 controls only showed a toast] | [Each works for real or is removed] | ☑ e2e `[area].spec` · "[test name]" |
| B2 | [22 toggles lived only on the client] | [Persisted on the account] | ☑ e2e `profile.spec` · "settings survive a reload" |
| B3 | [Password reset did nothing] | [Six-digit emailed code, hashed, 10-minute expiry] | ☑ e2e `signin.spec` · "reset by code" |

## C. Admin panel
| # | Gap | Decision | Status / proof |
|---|-----|----------|----------------|
| C1 | [20 unwired admin controls] | [Wired or deleted] | ☑ e2e `admin-ops.spec` |
| C2 | [Placeholder dashboard numbers] | [Real stats from the database, demo excluded] | ☑ e2e `admin.spec` · "dashboard figures come from rows" |

## D. Verification and cutover
| # | Item | Decision | Status / proof |
|---|-----|----------|----------------|
| D1 | Full pyramid before every push | typecheck → vitest → build → Playwright (one worker, mocked engines) → CI → staging → live pass | ☑ `.github/workflows/ci.yml` |
| D2 | Phone retest guide after every push | numbered steps in chat | ☑ process |
| D3 | Cutover rehearsal on a production fork | `CUTOVER-RUNBOOK.md` §1 | ☐ [date] |

## E. Security (mirror of SECURITY.md rows that this round changed)
| # | Gap | Decision | Status / proof |
|---|-----|----------|----------------|
| E1 | [Two routes answered without a session] | [Closed; route inventory guards the rest] | ☑ `tests/routeInventory.test.ts` |

## H. Audit leftovers and open items
| # | Item | Decision | Status |
|---|-----|----------|--------|
| H1 | [Monthly credit renewal] | belongs to the payments work | ☐ |
| H2 | [Real timestamps for relative labels] | small migration | ☐ |
| H3 | [Content-Security-Policy] | post-launch after an audit | ☐ deliberately later |

## How to add a round
1. New section letter, one row per decision from the question round (copy the decision wording).
2. Build; the tests agent ticks rows with `☑ <spec or test file> · <test name>`.
3. The reviewer checks every ☑ names a test that exists and asserts the row's claim.
4. Never delete rows; supersede them (`⏭ see I1`).
