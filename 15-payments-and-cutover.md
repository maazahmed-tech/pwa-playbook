# 15 — Payments and production cutover

**Where this sits:** after [14-backend.md](14-backend.md). Assemble calls payments "Step 3". As of 17 Sep 2026 payments are **not built** — checkout is simulated and labelled "Test mode — you won't be charged" — and production still runs the frozen frontend repo. This chapter has two halves: what exists and the plan for Stripe (Part A), and the cutover procedure that is written and rehearsed (Part B). Growth work that happens in parallel (landing page, pricing model) is in [16-growth.md](16-growth.md).

## Goal

1. Real money: subscriptions (monthly and yearly) and one-off credit packs charged through a payment provider, with credits granted by **webhooks** (never by the browser), renewals handled, cancellations respected, refunds and failures reflected in the ledger, and the "Test mode" label gone.
2. The app moved from the agency's staging to the client's production: the client's own AI, 3D, email and sign-in accounts; the production database migrated after a rehearsal on a fork; the production websites re-pointed to the backend repo; one-click rollback kept.
3. The client handed the admin panel with a walk-through, the AI budget set, prices checked, and the launch page live on the domain.

## Prerequisites checklist

- [ ] Everything in [14-backend.md](14-backend.md) green on staging: `LAUNCH-READINESS.md` has no open rows except payments; `CUTOVER-RUNBOOK.md` rehearsed once; `CLIENT-HANDOVER-CHECKLIST.md` sent to the client.
- [ ] The **pricing decision** from [16-growth.md](16-growth.md) implemented in app config (plans, packs, credit costs, yearly allowances) — prices are read from config, so the payment provider's products must mirror them exactly.
- [ ] Client accounts, in the client's name, with keys delivered by an **expiring secret link or by phone** (never chat, email or a shared document): Google Cloud project with billing + Gemini key + a budget alert; Google OAuth client with the production callback `https://app.<domain>/api/auth/callback/google`; 3D engine account + key; email provider with the domain verified; admin email address(es); business details and approval of the privacy/terms text; first shop content.
- [ ] For payments: a **Stripe account in the business name** (business and bank details complete), and a **restricted key** with Checkout, Customers, Subscriptions and Webhooks permissions — plus a webhook signing secret once the endpoint exists. Use **test mode** keys first.
- [ ] A quiet window for the cutover (the nightly demo reset time is fine); the client available on a call for the admin walk-through.
- [ ] Vercel token that works (verify with one API call — SAML tokens age out), GitHub PAT verified with `curl`.

---

## Part A — Payments

### A.1 What exists today (Assemble, 17 Sep 2026)

Read this before planning, because most of the plumbing is already there and the payment work is mostly "replace the simulated step with a webhook":

- **Plans and packs live in app config** (`app_config` row over `DEFAULT_CONFIG`): Free / Plus / Pro with monthly and yearly prices, monthly credit allowances, yearly allowances granted up front (300 / 1,000), three credit packs. Changing any of them in admin requires the emailed save-lock code and is audited.
- **Simulated checkout with real effects**: `POST /api/credits` subscribe/pack routes set the plan, grant credits, write `credit_ledger` rows and gate features; the UI shows "Test mode — you won't be charged". Admin can grant credits and plans by hand (also audited). A yearly plan that lapses is settled server-side on the next request.
- **Server is the source of truth for money**: the browser sends intent, never amounts; 402 when credits are insufficient; every AI call is charged upfront and refunded on failure; per-user daily caps.
- **Profitability page** shows revenue labelled "simulated until payments go live", real AI cost per call, fixed costs, margin.
- **Open items recorded** in `LAUNCH-READINESS.md`: plan cards say "credits a month" but monthly credits are granted once at purchase — the **monthly renewal grant belongs to the Stripe work**, with a double-grant guard; "Manage subscription" copy for renewals and cancellations was written to match the intended rules (cancel keeps credits and features until the paid period ends; switching plans grants the new plan's full allowance and keeps the old balance).
- **Not built**: any Stripe code, webhook endpoint, customer portal, invoices/receipts (the copy promising emailed receipts was deliberately removed until it is true), app-store billing.

### A.2 The plan (paste-ready for the session that builds it)

Plain English: Stripe hosts the payment page (Checkout) so no card details ever touch your code; Stripe then tells your server what happened (webhooks); your server grants credits from those messages, once, even if Stripe sends the same message twice.

1. **Question round first** (at least 15 questions): which provider; Checkout vs embedded; monthly + yearly; packs as one-off payments; what a cancellation does to credits; proration when switching; failed payment behaviour (grace period, banner, restrict AI); refunds policy; tax collection; receipts (Stripe emails them — then the "receipts by email" copy can return); customer portal or in-app management; currency; whether the demo profile can "buy" (no — it stays test-mode forever); how to test (Stripe test mode + CLI-forwarded webhooks + mocked signatures in e2e); where prices live (Stripe Price ids stored in config next to your plan ids); rollout (behind a feature flag; staging first).
2. **Data**: a migration adding `stripe_customer_id` on users, a `payment_events` table keyed by Stripe event id (idempotency), `subscriptions` (status, current period end, cancel-at-period-end, price id), and ledger reasons for `purchase`, `renewal`, `refund`, `chargeback`.
3. **Routes**: `POST /api/billing/checkout` (creates a Checkout Session for a plan or pack, `client_reference_id` = user id, success/cancel URLs back into the app); `POST /api/billing/portal` (customer portal link); `POST /api/billing/webhook` (raw body, signature verified with the webhook secret, event id stored before processing, 200 only after the ledger write commits). Events to handle: `checkout.session.completed` (packs → grant credits; subscriptions → set plan), `invoice.paid` (**the monthly/yearly grant, guarded so one invoice grants once**), `invoice.payment_failed` (banner + notification + restrict paid AI after the grace period), `customer.subscription.updated` (plan switch, cancel-at-period-end), `customer.subscription.deleted` (drop to Free at period end, keep credits), `charge.refunded` (negative ledger row, plan effects per policy).
4. **UI**: the existing plan and pack sheets call checkout instead of the simulated route; "Test mode" label removed only when live keys are set; Manage subscription reads the subscription row (renews on, cancel, switch, update card via the portal); payment-failed banner and update-card path already designed in the prototype.
5. **Admin**: revenue on Profitability from real ledger rows; "simulated" label removed; refunds visible; the save lock still guards prices — and the Stripe Price ids must be updated **together** with the config prices (add a verify check that each plan/pack has a matching Price id in the same currency).
6. **Tests**: unit tests for the grant/idempotency logic and price mapping; e2e with a **mocked webhook** (signed with the test secret) proving: pack purchase grants once even when the event is posted twice; renewal grants monthly credits once per invoice; cancel keeps access until period end; failed payment shows the banner and blocks paid AI; the demo profile can never reach checkout. Live: Stripe test-mode card on staging, then one real purchase with the client on the phone after cutover, refunded.
7. **Security** ([20-security.md](20-security.md)): webhook signature verified on the raw body; restricted key only; never trust amounts from the browser; rate-limit the checkout route; log event ids, never card data (Stripe never gives you any); keep the key in Vercel env only.

> **For Claude — paste this:**
> ```
> Step 3: real payments with Stripe on the backend repo (staging only; production untouched until cutover). Read LAUNCH-READINESS.md, the credits routes, packages/db schema (plans, packs, credit_ledger, users.plan) and the Manage subscription screens first so your questions describe current behaviour. Then, before we proceed, ask me at least 15 questions [standard suffix] covering: Checkout vs embedded, monthly + yearly + packs, cancellation and switching rules, failed payments and grace, refunds, tax, receipts, portal, currency, demo profile, test strategy, where Price ids live, rollout flag.
> Build: migration (stripe_customer_id, payment_events keyed by event id, subscriptions); routes checkout / portal / webhook (raw body, signature verified, idempotent by event id, ledger write before 200); handle checkout.session.completed, invoice.paid (ONE grant per invoice, guarded), invoice.payment_failed, customer.subscription.updated/deleted, charge.refunded; UI sheets call checkout; Manage subscription from the subscription row; admin Profitability revenue from real ledger rows; verify.mjs checks every plan/pack has a Price id. Tests: unit for grant idempotency and price mapping; e2e with mocked signed webhooks (double delivery grants once; renewal once per invoice; cancel keeps access to period end; failed payment banner + paid AI blocked; demo can't reach checkout). Keys only in .env.local and the staging Vercel projects; test-mode keys. Full pyramid, one push, CI, staging live pass with a Stripe test card, phone retest guide. Keep the "Test mode" label until live keys exist.
> ```

### A.3 App stores (later, and only after payments)

A **Trusted Web Activity** test package for Android already exists for staging (built through PWABuilder's cloud service; the signing keystore is kept **outside** both repos and must be reused for every future build; `/.well-known/assetlinks.json` is served by the web app). Publishing needs a Google Play developer account (an organisation account needs a D-U-N-S number) and, for digital goods, **Play Billing** — the stores do not allow Stripe for credits and subscriptions inside a store-distributed app. iOS needs a Mac, Xcode and a paid developer account, and Apple is strict about thin web wrappers. Recommendation recorded on 10 Sep: not now; the PWA keeps 100% of credit revenue.

---

## Part B — Production cutover

Plain English: production today is the *old* repo on the *old* database schema. Cutover means: (1) migrate the production database in a way that keeps the old build working, (2) put the client's keys on the production websites, (3) point those websites at the new repo, (4) check, (5) keep the old build one click away.

### B.1 Preconditions (client side)

- [ ] Items 1–7 of the handover checklist delivered: Gemini key (client's paid project, with a budget alert the admin panel mirrors), OAuth client with the production callback, 3D engine key with a topped-up wallet, email domain verified on the client's account with `EMAIL_FROM` decided, admin email(s), legal text approved, first shop content.
- [ ] Keys received safely and stored only in Vercel env (production projects) — never in chat, repo or memory.
- [ ] The staging demo is not mid-presentation; nobody else is deploying.

### B.2 Rehearsal on a fork (repeat on the day)

> **For Claude — paste this:**
> ```
> Cutover rehearsal, production untouched: `neon branches create --project-id <NEON_PROJECT_ID> --parent production --name cutover-rehearsal`; get its connection string; with DATABASE_URL set to the fork run, from the repo root and in order, every migration not yet on production [list them, e.g. 004 … 017], then `node tools/cutover/config.mjs` and `node tools/cutover/verify.mjs`; stop on the first FAIL and report every result line (rows re-filed, legacy values parsed, config keys written). Then delete the fork. Update CUTOVER-RUNBOOK.md with today's result and any migration added since the last rehearsal.
> ```

> **Assemble example.** Rehearsed 11 Sep 2026: migrations 004–011 applied cleanly to a copy of production (36 items, 9 re-filed by name, 0 left for review; 11 legacy prices parsed; 4 placeholder help articles replaced by 12 starters; config row updated), `verify.mjs` all PASS, fork deleted. Since then 012–017 were added to the runbook (each re-runnable), including 014 (pricing: `looks.render_included`, starter credits default, the config row rewritten to the price list) and 015 (admin money tables and the `generations.cost_cents` backfill from stored token usage). Migration 005 is the reason production waits: it moves Google photo URLs between columns the old build still reads, so it must not run while the old build serves users.

### B.3 Production sequence (from the runbook)

1. **Restore point**: `neon branches create --parent production --name pre-cutover-backup` (keep until the client signs off).
2. **Migrate**: the same list, then `config.mjs`, then `verify.mjs`, with `DATABASE_URL` = production pooled URL (DDL steps use the unpooled URL); stop on the first FAIL. Additive migrations mean the old build keeps working on the migrated database.
3. **Env on the production app project** (names only; values from the client's keys and your existing production values): `DATABASE_URL`, the `AWS_*` storage set for the production bucket, `GEMINI_API_KEY` (client's), `TRIPO_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAIL`, `ADMIN_EMAIL_CC`, `VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_SENTRY_DSN`. **Do not set `NEXT_PUBLIC_DEMO_LOGIN`** on production.
4. **Env on the production admin project**: `DATABASE_URL`, the `AWS_*` set, `GEMINI_API_KEY`, `TRIPO_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `VAPID_*`, `NEXT_PUBLIC_APP_URL=https://app.<domain>`, `NEXT_PUBLIC_WEB_ORIGIN=https://app.<domain>`, `NEXT_PUBLIC_SENTRY_DSN`.
5. **Connect** both production Vercel projects to the backend repo's `main` (Git integration; root directories `apps/web` and `apps/admin`) and deploy. The previous frontend deployment stays listed for instant rollback. Domains already point at the projects — **no DNS change**.
6. **Smoke test on the live domains**: `/api/config` (categories, no demo), legal pages, shop with prices, admin login + 2FA code arrives at the owner address, one real render on a real account, a public share page in a browser, a phone check (install prompt, camera, detection).
7. **Rollback** if anything is wrong: Vercel instant rollback on either project; the migrated database keeps serving the old build.

> **For Claude — paste this (cutover day):**
> ```
> Cutover day. Verify the Vercel token and the PAT with one call each. Confirm with me that the client's keys are in the production Vercel env (list variable NAMES present/missing per project — never print values). Then: 1) create the pre-cutover-backup branch from production; 2) run the migration list, config.mjs and verify.mjs against production, stopping on the first FAIL and pausing for my go at each stage; 3) connect [app]-app and [app]-admin to this repo's main with root directories apps/web and apps/admin, deploy, watch to READY; 4) run the live smoke script against https://app.<domain> and https://admin.<domain> (config, legal, shop, admin 2FA send, one real render on my account, a public share page in a real browser); 5) tell me exactly how to roll back on Vercel if I say so. Staging stays untouched.
> ```

### B.4 After cutover (with the client on a call)

- Admin: change the default password; confirm the 2FA recipients; set the Gemini monthly budget under AI accounts; check the 3D wallet reads; check the provider price table matches the client's bills.
- Read the credit prices once with the client (they went live with the agreed values; the client may change them behind the save lock — with the owner on the call, change one locked value, confirm the code arrives, see the audit row).
- Profitability: fixed costs list matches the real bills; revenue reads "simulated" until Stripe is connected.
- Notifications: a new support ticket from a test account raises an admin alert and nothing in that account's own notifications.
- Mirror any fix that was applied to the old frontend repo after the copy (Assemble: the admin 2FA CC recipient) — the runbook lists them.
- The demo profile renames itself to the neutral identity on its first nightly reset after cutover.
- Delete `pre-cutover-backup` when the client signs off. Keep staging as the development and presentation environment; the demo stays hidden in production.
- Landing page: move the apex and `www` domains from the coming-soon project to the launch-site project **only after client approval AND live payments** (visitors must never meet test-mode checkout). It is an instant, reversible move in Vercel with no DNS change — see [16-growth.md](16-growth.md).

## Pitfalls (payments and cutover)

| Symptom | Cause | Fix / prevention |
|---|---|---|
| Credits granted twice | Webhook delivered twice; grant not idempotent | Store the event id before processing; one grant per invoice id |
| Credits granted from the browser | Success URL handler grants on redirect | Grant only from verified webhooks; the success page just refreshes state |
| Webhook signature fails | Body parsed as JSON before verification | Verify on the raw body; disable body parsing for that route |
| Prices differ between app and Stripe | Config changed behind the save lock, Price ids not updated | `verify.mjs` checks every plan/pack maps to a Price id in the right currency; change both in one audited save |
| "Credits a month" but granted once | Renewal grant not built | `invoice.paid` grants per period with a double-grant guard |
| Demo profile reaches checkout | No guard | 403 for the demo user id; e2e proves it |
| A migration blanks a live feature during cutover | Non-additive migration run while the old build serves | Keep migrations additive; mark any non-additive one in the runbook and run it only after the new build is live |
| Cutover discovers unknown data shapes | Production data differs from staging | Rehearse on a fork; keep the fork's result lines in the runbook |
| Old build rewrites config defaults after cutover | A deploy of the old code still running | Run `config.mjs` again after the new deploy; `verify.mjs` |
| Google sign-in fails on the new production | Callback URI missing on the client's OAuth client | Add `https://app.<domain>/api/auth/callback/google` before cutover; if the consent screen is in Testing mode, add test users |
| OTP emails not delivered | Client's email domain not verified / sandbox | Verify the domain on the client's account first; test sign-up to a non-owner address |
| Renders fail on production | Client's Gemini project without billing | Billing before cutover; a budget alert |
| Vercel token 403 on cutover day | SAML token expired | Verify with one call the day before; issue a fresh token |
| Key sent over chat/email | Habit | Expiring secret link or phone; rotate anything that touched chat |
| Store-distributed app sells credits through Stripe | Store billing rules | Play Billing / App Store IAP for store builds; PWA keeps Stripe |

## What to carry forward

- The launch page goes live on the domain after this milestone ([16-growth.md](16-growth.md)).
- After the first month of real usage, re-run the AI cost ledger and re-check the pricing floors ([16-growth.md](16-growth.md)).
- Add the payments rows to `LAUNCH-READINESS.md` with their proving tests, and the Stripe key to the client handover checklist (already item 9).
