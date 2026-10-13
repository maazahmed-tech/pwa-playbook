# Security — [APP]

> Template for the repo's `SECURITY.md`. Lead with the reviewer's own checklist **in their wording** (Assemble's first draft mapped an internal working contract instead and had to be restructured; delete this note before committing), then for each item: what the app does, and where the proof lives (a test name or a file). Keep a one-page plain-words `SECURITY-SUMMARY.md` next to it for the client, including any known carried issue. Update both in every round that touches a control. Full method in `20-security.md`.

## The checklist and where each item is proven

| # | Item (reviewer's wording) | What the app does | Proof |
|---|---|---|---|
| 1 | Hide API keys | Keys only in hosting env settings; only `NEXT_PUBLIC_*` reach the browser. | `npm run security:secrets` (tree, in CI) and `--history` (clean on [date]) |
| 2 | Enable RLS | Not applicable by design: no browser reaches the database, one server role, every query filters by the signed-in account. Turn it on only if a direct data path is ever added. | Isolation proven by 3, 6, 19 |
| 3 | Test IDOR attacks | One account tries to read/change/delete another's rows by guessing ids across [items, looks, links, tickets, …]; all 401/403/404 and rows unchanged. | `tools/e2e/security.spec.ts` (accounts `prober`/`victim`) |
| 4 | Scan git secrets | Dependency-free scanner on every push; history scan on demand; any leaked key rotated the same day and recorded. | `tools/security/scan-secrets.mjs`; `.github/workflows/ci.yml` |
| 5 | Lock admin routes | Every `api/admin` route checks the admin session; pages gated in `apps/admin/middleware.ts`; the route inventory test fails the build if a route lacks the check. | `apps/web/tests/routeInventory.test.ts`; attack suite calls every admin route with every method and no cookie |
| 6 | Test user isolation | Other accounts' storage files 401; shares not addressed to you unanswerable; no other account's email in any social response. | `security.spec.ts`, `storage.spec.ts` |
| 7 | Rate limit APIs | Fixed-window counters in the database (`rate_limits`) per account and per IP on sign-in, sign-up, codes, reset, AI calls, uploads, public votes/comments, admin sign-in and 2FA; 429 with a plain message; over-limit sign-in answers like a wrong password. | `apps/web/lib/rateLimit.ts`; `tests/rateLimit.test.ts`; throttle cases in `security.spec.ts` |
| 8 | Lock storage buckets | Private bucket; every read through `/api/storage/[...key]` after a session check against the owner prefix `u<id>/`; `public/` prefix for catalogue images only. | `storage.spec.ts` (four cases) |
| 9 | Validate all inputs | One strict zod schema per writing route: unknown fields dropped, types/lengths/enums/array sizes enforced, plain-sentence 400. | `apps/web/lib/validate.ts`, `apps/admin/lib/validate.ts`; `tests/validate.test.ts` |
| 10 | Block unauthenticated routes | Short public allow-list with a "why" per entry; everything else checks a session. | `routeInventory.test.ts` → `tools/security/routes.json`; signed-out sweep in `security.spec.ts` |
| 11 | Test SQL injection | Parameterised tagged templates only; the SQL scan test fails on `sql.raw` or string-built SQL outside a documented allow-list; classic payloads through every text field are stored as text. | `tests/sqlScan.test.ts`; injection cases in `security.spec.ts` |
| 12 | Remove sensitive logs | Scrubber masks emails, bearer tokens, provider keys, secret-shaped runs; credential-named fields blanked; `logError` logs route + message only; Sentry PII off with the same scrubber. | `apps/web/lib/log.ts`; `tests/log.test.ts` |
| 13 | Block field tampering | Plan, credits, verified, suspended, ownership ids, share tokens never settable from a request. | field-tampering cases in `security.spec.ts` |
| 14 | Restrict file uploads | Bytes decoded with sharp (jpeg/png/webp/heif only), re-encoded (orientation baked, EXIF/GPS/XMP/ICC dropped); a text file renamed `.jpg` is refused. [Size cap: decision.] | `uploads.test.ts`; upload sniffing + GPS-stripping cases in `security.spec.ts` |
| 15 | Secure server logic | Prices, credit costs, allowances and ownership computed on the server; the browser sends intent, never amounts; price changes need the owner's emailed code and are audited. | `admin-money.spec.ts`; `tests/configLock.test.ts` |
| 16 | Trim API responses | Names/usernames only for other people; no hashes, codes, tokens, storage keys, raw AI output, stack traces or DB errors. | response-shape cases in `security.spec.ts` |
| 17 | Secure auth sessions | Admin sessions server-side (7 days, revocable, "Log out everywhere"); 2FA code burned after five wrong guesses; user password change / delete bumps `session_version`; cookies server-only, same-site. | `admin.spec.ts`; `account.spec.ts`; `tests/suspended.test.ts` |
| 18 | Scan dependencies | `npm audit` gate in CI (high/critical fail unless a dated, documented exception); Dependabot alerts + weekly grouped updates. | `tools/security/audit.mjs`; `.github/dependabot.yml` |
| 19 | Test record access | Covered by 3, 6 and 10. | as above |
| 20 | Attack your own app | The attack suite runs on every push; an external penetration test is a post-launch item. | `security.spec.ts` in CI |

## Additional controls
- **Origin check** on every state-changing API call (403 "Blocked cross-site request.") — `apps/web/middleware.ts`, `apps/admin/middleware.ts`; spoofed-Origin case in `security.spec.ts`.
- **Scheduler secret** compared in constant time; wrong/missing → 401 — `app/api/cron/cronAuth.ts`; `routeInventory.test.ts` asserts every cron route uses it.
- **Browser headers** on every response: `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(self), microphone=(), geolocation=()` — `next.config.mjs`; headers case in `security.spec.ts`.
- **Save lock** on everything that changes what users pay or get: six-digit code emailed only to the owner, 10-minute validity, 15-minute unlock, five wrong guesses = one-hour lockout, every change audited — `apps/admin/lib/adminOtp.ts`, `configLock.ts`; `admin-money.spec.ts`.
- **One sign-in method per email**; **server-enforced suspension** (403 `{ code: "suspended" }` everywhere, sessions ended at once) — `lib/authMethod.ts`, `lib/serverUser.ts`; `signin.spec.ts`, `tests/signInRules.test.ts`.
- **Consents** stamped with timestamps; AI features refuse with 403 `{ consent }` without them.
- **Demo entry** compiled in only where `NEXT_PUBLIC_DEMO_LOGIN=1`; production never sets it — `launch.spec.ts`.

## Deliberately later
- Content-Security-Policy (after an audit of inline styles and third-party scripts).
- External penetration test (post-launch).
- Hosting firewall rules (country/bot filtering, edge rate limits) at cutover.
- [Carried dependency advisory: package, why unreachable, review date — from `tools/security/audit.mjs`.]

## If a key leaks
1. Rotate at the provider first. 2. Update the hosting env and redeploy. 3. Remove it from the tree. 4. Rewrite history only for a private repo where every collaborator re-clones. 5. Run `node tools/security/scan-secrets.mjs --history`. 6. Record it in `SECURITY-SUMMARY.md`.
