# What we need from you to launch [APP]

> Template for the client-facing handover checklist (repo root, committed, no secrets). Written for the client to read; every step has a link and an exact value to paste. Ownership split first, then a table of what unlocks what, then the safe way to hand over keys, then per-service steps. Assemble's version was written 2026-09-12.

## Who owns what, and why
| Stays with Deep Learn HQ | In your name |
|---|---|
| The code on GitHub, the test pipeline, the hosting projects, the database and the error/analytics monitoring — the engineering pipeline we operate day to day. | The domain, the Google account that pays for AI, the 3D engine account, the email-sending account, Google sign-in, the admin login, and later the app-store and payment accounts — everything that bills per use or represents your business should sit on your card and under your control. |

## The checklist
| # | Item | What it unlocks | When needed |
|---|---|---|---|
| 1 | Google Cloud project with billing + AI key + budget alert | Every AI feature on the live app | Before launch |
| 2 | Google sign-in (OAuth consent screen + client with two redirect URIs) | "Continue with Google" | Before launch |
| 3 | 3D engine account + key + prepaid credits | 3D avatars | Before launch |
| 4 | Email sending account with your domain verified | Sign-in codes and support emails from `verify@[domain]` | Before launch |
| 5 | Admin email address(es) and your first admin password change | Admin sign-in codes go to you; nobody else can change prices | Before launch |
| 6 | Business details and approval of the Privacy and Terms text (live on staging, editable in the admin panel) | Legal pages | Before launch |
| 7 | First shop set (brands, products, store links) | The Shop tab is not empty on day one | Before launch |
| 8 | Google Play and Apple developer accounts (need a D-U-N-S number unless registering as an individual) | Store listings | Later — start the paperwork early |
| 9 | Payment provider account with a restricted key | Real checkout | Later — the app says "Test mode" until then |

## How to hand a key to us safely
Use an expiring secret link (for example Bitwarden Send: text send, expires after one day and after one opening, optional password told by phone) or read it out over a call. **Never** paste a key into chat, email or a shared document — those keep copies forever. We confirm receipt, and if you rotate a key we swap it on hosting within the hour.

## Step-by-step
### 1. Google Cloud project, billing, AI key, budget alert
1. [Console link] → New project → name it "[App]".
2. Billing → link a billing account with your card (image models have no free quota; text models run out fast).
3. [AI Studio link] → Get API key → create in the "[App]" project → hand it over safely.
4. Billing → Budgets & alerts → a monthly budget with alerts at 50%, 90% and 100% to your email.

### 2. Google sign-in
1. [Console link] → APIs & Services → OAuth consent screen → External → app name "[App]", support email, privacy and terms links (`https://app.[domain]/privacy`, `/terms`), authorised domain `[domain]` → Publish (basic scopes only, no review needed).
2. Credentials → Create → OAuth client → Web application → Authorised redirect URIs, exactly, no trailing slash: `https://app.[domain]/api/auth/callback/google` and `https://[staging-app].vercel.app/api/auth/callback/google`.
3. Hand over the Client ID and Client secret safely.
4. If sign-in still fails: compare the error's redirect URI character by character; a consent screen in "Testing" only allows listed test users; check you are in the right project.

### 3. 3D engine
1. [Platform link] → create an account → API keys → create → hand over safely.
2. Buy prepaid credits (a build uses about [N] credits; failed builds are not charged). The admin panel shows the wallet and warns when it is low.

### 4. Email sending
1. [Provider link] → Domains → Add `[domain]` → add the DNS records at your registrar exactly as shown (enter the name part only — the registrar appends the domain; paste the long DKIM value on one line).
2. Wait for "Verified" (minutes to an hour).
3. API keys → create a "Sending access" key restricted to `[domain]` → hand over safely. Until the domain is verified, codes are delivered only to the account owner's own address.

### 5. Admin emails and password
- Tell us the owner address for admin codes (and any extra addresses for the sign-in code only).
- On first sign-in: Settings → change the password. Every price or plan change afterwards needs a code sent to the owner address.

### 6–7. Legal text and shop content
- Read the Privacy and Terms pages on staging; edit them in the admin panel (Content) or send us changes. Confirm business name, address and support email.
- Add brands and products in the admin panel (name, category, price, store link, one main photo, up to three more).

### 8–9. Store accounts and payments
- Google Play Console (organisation account) and Apple Developer Program: both take days to weeks; invite `[agency address]` as a developer when approved.
- [Payment provider]: create the account, complete verification, then create a **restricted** key with Checkout, Customers, Subscriptions and Webhooks permissions → hand over safely. We run a test purchase with you and remove the "Test mode" label.

## What happens after items 1–7 arrive
1. We rehearse the database changes on a copy of the live data.
2. We put your keys on hosting (never in code) and switch the live domain to the new build, with one-click rollback.
3. We run the live checks and a walkthrough call with you.
4. Staging stays as it is for previews and presentations.
