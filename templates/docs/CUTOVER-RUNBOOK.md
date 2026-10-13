# Production cutover runbook — [APP]

> Template. Lives in the backend repo root as `CUTOVER-RUNBOOK.md` and grows with every migration. Goal: point `app.[domain]` and `admin.[domain]` at the backend repo's deployments without touching the frozen front-end repo, after rehearsing every database step on a fork of production. Database changes are additive, so the previous deployment keeps working against the migrated database and remains the instant rollback. Plain-English version of the steps is in `15-payments-and-cutover.md`.

## 0. Preconditions (client-side — from `CLIENT-HANDOVER-CHECKLIST.md`)
- [ ] Client's own paid AI key (`GEMINI_API_KEY`) and 3D engine key (`TRIPO_API_KEY`), handed over through an expiring secret link
- [ ] Email: `[domain]` verified on the client's sending account; `EMAIL_FROM = "[App] <verify@[domain]>"`
- [ ] Google sign-in: `https://app.[domain]/api/auth/callback/google` added to the OAuth client (no trailing slash)
- [ ] Admin: `ADMIN_EMAIL` = the owner's address (every 2FA and save-lock code goes there)
- [ ] Payments live (or the "Test mode" label agreed to stay) — the marketing domain moves only after this
- [ ] A quiet window (the nightly demo-reset time is fine) and the client reachable by phone

## 1. Rehearsal on a fork (do this every time the migration list grows)
```bash
neon branches create --project-id <NEON_PROJECT_ID> --parent production --name cutover-rehearsal
neon connection-string cutover-rehearsal --project-id <NEON_PROJECT_ID>
```
With `DATABASE_URL` set to the fork, from the repo root, **in this order**:
```bash
node packages/db/migrations/[004-first-pending].mjs
node packages/db/migrations/[005-…].mjs
# … every migration not yet on production, in number order …
node tools/cutover/config.mjs
node tools/cutover/verify.mjs      # must print "all checks passed"
```
Record the result here (date, rows touched, anything re-filed or left for review), then delete the fork:
```bash
neon branches delete cutover-rehearsal --project-id <NEON_PROJECT_ID>
```
Rehearsal log:
- [YYYY-MM-DD] — migrations [NNN–NNN] applied cleanly to the production copy ([counts]); verify all PASS.

## 2. Migrations pending on production
| # | File | What it changes | Additive? | Rehearsed |
|---|---|---|---|---|
| [004] | `[004-…].mjs` | [one line] | yes | [date] |
| [005] | `[005-…].mjs` | [moves a column the live build still reads] | **cutover only** | [date] |
| … | | | | |

## 3. Production (the day)
1. **Restore point**: `neon branches create --parent production --name pre-cutover-backup` (keep until the client signs off).
2. Run the migration list in section 2, then `config.mjs`, then `verify.mjs`, against production (`DATABASE_URL` = production pooled URL). **Stop on the first FAIL.**
3. Hosting env on the production **app** project: `DATABASE_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION` (production bucket), `GEMINI_API_KEY` (client's), `TRIPO_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAIL`, `ADMIN_EMAIL_CC`, `VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_SENTRY_DSN`. **Do not set `NEXT_PUBLIC_DEMO_LOGIN`.**
4. Hosting env on the production **admin** project: `DATABASE_URL`, the `AWS_*` set, `GEMINI_API_KEY`, `TRIPO_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `VAPID_*`, `NEXT_PUBLIC_APP_URL=https://app.[domain]`, `NEXT_PUBLIC_WEB_ORIGIN=https://app.[domain]`, `NEXT_PUBLIC_SENTRY_DSN`.
5. Connect both production projects to the backend repo's `main` (Git integration, root directories `apps/web` and `apps/admin`, install `cd ../.. && npm install`) and deploy. The previous front-end deployment stays listed for instant rollback.
6. Domains already point at the projects; no DNS change.
7. Re-run `node tools/cutover/config.mjs` **after** the new build is live (an old build may have written its defaults back), then `verify.mjs` again.
8. Smoke test on the live domains: `/api/config` (categories, no demo wording), `/legal` text, `/shop` catalogue with prices, admin login page + 2FA code arrives, one real render on a real account, a public share page in a real browser, phone check (install prompt, camera, detection).
9. **Rollback**: instant rollback to the previous deployment on either project. The migrated database keeps serving the old build.

## 4. After cutover
- Admin: set the AI monthly budget; confirm the engine wallet reads; provider price table matches the client's billing.
- Admin: read the credit prices once (the cutover wrote them; the client may change them behind the save lock).
- Admin: change the default password; confirm 2FA recipients.
- Save lock: with the owner on the call, change one locked value, confirm the code arrives, check the audit row.
- Notifications: a support ticket from a test account raises a panel alert and nothing in that account's own notifications.
- Landing site: move `[domain]` + `www` from the coming-soon project to the site project (instant, reversible, no DNS) — only after client approval AND live payments.
- Delete `pre-cutover-backup` once the client signs off.

## Known items
- The CI branch's config row may pin a different model than staging; `verify.mjs` reports that one FAIL there as expected (tests never call the engine).
- The demo profile row on production renames itself on its first nightly reset after cutover.
- Staging stays the dev/presentation environment; the demo entry stays hidden in production.
