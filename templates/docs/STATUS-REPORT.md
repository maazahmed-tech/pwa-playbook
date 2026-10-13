# End-of-round report — format

> The shape every Assemble round report took from September 2026. It reads top-down: the result first, then evidence, then what the user must do, then what the user must decide. Paste the block below into a brief so agents and the main session report the same way.

> **For Claude — paste this:**
```text
Report in this order, nothing else first:
1. Result line — "[Round] is on main at [sha]; staging app + admin live; CI green." (or exactly what is not.)
2. What changed — grouped by decision number from the brief (C1, C2 …), one line each, root cause named where there was a bug.
3. Verification table — typecheck (apps) · vitest [n/n] · builds · Playwright [passed/failed/skipped, minutes] · security scans · CI run [duration] · live pass [n checks] · demo reset [yes/left because in use].
4. Phone retest — numbered steps (see PHONE-RETEST-GUIDE.md).
5. For your awareness — trade-offs applied, defaults I assumed when an answer was cut off, anything deliberately later.
6. Waiting on you — decisions with options, keys or dashboard steps only you can do.
Honest caveats always: what I could not verify and what you should click through yourself.
Money in dollars. No AI attribution anywhere. Under 60 lines for an agent report; the main session may go longer for a batch.
```

## Example (Assemble batch 3, 2026-09-17, shortened)

**Result.** Batch 3 is on `main` at `ddc5496`; staging app picked up the code automatically; CI passed. Vercel's API token has stopped working again (SAML re-sign-in) — nothing was blocked, but I will need a fresh token before the next env change.

**What changed.**
- C1 Style & Categories: onboarding, Preferences, match and item screens now read the admin lists; removed values stay on existing profiles; the stylist prompt uses the stored text. Root cause: chips were typed into three screens and the prompt kept its own word table.
- C2 One sign-in method per email: `users.auth_method` with backfill ([n] accounts moved to Google, passwords cleared); every email route refuses a Google address before sending a code; Google refuses password accounts.
- C3 Shared looks: receivers never get shop pieces; sharing an undrawn look draws it once, free; Copy link / Share to… act inside the tap.
- C4 Suspended accounts: 403 `{ code: "suspended" }` everywhere; app signs out with the support-email modal within minutes; admin suspend ends sessions at once.
- C5 Admin dashboard: month-to-date cost line chart and calls-by-type pie from real per-call cost.
- C6 Home: Recent generations last.

**Verification.** tsc web/admin/site ✓ · vitest 448/448 · three builds ✓ · Playwright 243 passed / 0 failed (one worker) · secrets scan 0 hits on the staged tree · attribution grep clean · review: 4 defects → fixed → second review clean · CI ✓ · staging demo reset.

**Phone retest.** [six app steps, four admin steps — see the guide]

**For your awareness.** Removing a taxonomy value hides it for new choices only (your choice). A different email can still sign up after a suspension (blocking that needs device tracking — a separate privacy decision).

**Waiting on you.** A fresh Vercel token before the next env change. The render layering fix ships next as its own small push with targeted tests, as agreed.
