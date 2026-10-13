# 16 — Growth: launch landing page, AI cost method and pricing formula, marketing

**Where this sits:** in parallel with the end of [14-backend.md](14-backend.md) and before/after [15-payments-and-cutover.md](15-payments-and-cutover.md). The landing page replaces the coming-soon page from [10-prebuild.md](10-prebuild.md) once the client approves and payments are live. The pricing formula feeds the app config described in [14-backend.md](14-backend.md) Step 8. Running and service costs are deliberately **out of scope** here; this chapter is about the method, not the bills.

## Goal

1. A **launch landing page** built from real app screenshots, designed as if everything (including payments) is live, shown to the client for approval on a hidden preview, then swapped onto the domain in one click.
2. An **AI cost ledger**: what each AI feature really costs per call, computed from the app's own call log priced at published vendor rates, cross-checked by independent agents.
3. A **pricing formula** that keeps every paid plan in profit however users behave, implemented as credits per feature in app config — without changing the advertised plan prices.
4. **Marketing documents** the client can act on: a plain-English product overview for a marketer, a social launch proposal with packages and terms, and the disclosure rules for AI-generated people.

## Prerequisites checklist

- [ ] The backend app on staging with real AI, so screenshots and personas can be produced through the **real app** on marketing accounts (never `@test.local` — teardown deletes those).
- [ ] The AI key topped up; a **generation ledger** so a re-run does not pay twice for images already made.
- [ ] The brand kit and the coming-soon page (the launch page keeps the dark brand, fonts and logo; the ring logo is ported as a component).
- [ ] A separate **Vercel project for the preview** (not git-linked; deployed by direct upload; `X-Robots-Tag: noindex, nofollow`) and an exact **backup project** of the live coming-soon page before anything changes.
- [ ] The client's decisions: is the client's name/face allowed on the page (Assemble: no); how the agency is credited (subtle, "Development partner", not "designed and built by"); target locale (American English for a US audience — decide before generating demo data, or captured screenshots carry the wrong spelling).
- [ ] For the cost report: the `generations` table with token usage per call and a per-call cost column, the credit ledger, live config, and the vendors' published price pages (verify them on the day; note the date).
- [ ] The standing money rule in memory: **dollars with decimals ($0.15), never cents notation**.

---

## Part A — The launch landing page

### A.1 Round 1: concept and structure (25 questions)

Plain English: decide what the page is for and what is on it before a single pixel. Assemble's decisions are the recommended defaults for any consumer app of this shape.

> **For Claude — paste this:**
> ```
> Let's turn our coming-soon page into a launch page that introduces [APP], shows real screenshots and features, and helps visitors picture using it. Design it as if everything is launched, including payments; we'll show it to the client for approval before the app is ready, then replace the coming-soon page. Don't use the client's name; credit [AGENCY] subtly as the development partner with a link. First back up the live coming-soon page to a separate Vercel project. Before we proceed, ask me at least 25 questions [standard suffix].
> ```

Decisions to expect and Assemble's answers (13 Sep 2026): full launch page now; old page backed up first; **real app screens captured automatically and framed in phone mockups** (honest, refreshable, recognisable); one scrolling page with About near the end; the main button opens the web app (PWA install) pointing at staging until approval; the hero shows the one thing no competitor does; four features; a pinned phone whose screen changes as you scroll (stacked on phones); the dark brand kept; **fictional AI-generated people run through the real app on marketing accounts** instead of the client's likeness; two personas (a woman and a man) drafted now, the page doubling as their approval; a pricing section with monthly/yearly switch; a short privacy section with promises already true in the app; a few FAQ answers in marketing voice checked against the app; the credit line "Development partner: <Agency>" (the client might not approve "designed and built by"); cookieless analytics in the app's existing project with the visit source carried into sign-up; the code as `apps/site` in the backend monorepo (a static Next.js export; prices read from live config at build); review by staging link; **domain move only after client approval AND live payments**.

**AI disclosure** (the decision that needed a fact check): the instinct was "don't tag them as AI, let people think they're real". Claude first checked a real API render for visible watermarks (none; the invisible one stays), then explained that presenting them as real people is a fake-endorsement risk and breaches the image provider's policy on the client's key. Final: no tags on images, no claim they are real, **one plain footer line "<names> and their looks are AI-generated."**, never shown as customers, no first-person quotes or reviews from them (fake testimonials), and a build-failing test if the word "stylist" (or any forbidden positioning word) appears.

### A.2 Round 2: conversion quality (25 questions)

> **For Claude — paste this:**
> ```
> Continue. Make the page better: long full-page screenshots scrolling inside the phone, more pizazz, written and structured like a marketer with 10+ years' experience converting visitors into users. Before we proceed, ask me at least 25 questions [standard suffix].
> ```

Assemble's round-2 decisions (14 Sep): one action ("Build my first outfit" + "Free, no card needed"); full-length screenshots scrolling inside the phone as the page scrolls; a split hero with both personas, full length on phones; the product proving itself — **no invented reviews, user counts or "first 1,000 members" offer**; a short "problem" beat; interactive 3D avatars side by side (lazy-loaded, front-facing idle turn); a slim sticky CTA on phones after the hero; three steps; "why it works" reasons appearing one by one; confident, warm, a little witty; only genuinely widely published statistics, never invented ones; a QR "scan to open on your phone" for laptops; an install strip with iPhone/Android tabs; Pro highlighted as best value with Free first and complete; American English; section order hero → problem → steps → feature phones → why → 3D → install → privacy → pricing → questions → final CTA → about → footer; four objections answered in the FAQ; **speed budget**: hero usable ≤ 2.5 s on a mid-range phone on 4G, CLS < 0.1, everything else lazy; compressed front-facing 3D copies under ~1 MB for the site only.

### A.3 Build: two workstreams and a preview link

- **SITE-BUILD** (the `apps/site` app: static export, components, tests, smoke tests, Lighthouse) and **SITE-ASSETS** (persona drafting; marketing accounts on staging; wardrobes added through real detection; looks matched and rendered with a paid-call ledger; social states; long-form screen captures by growing the viewport; a 1200×630 social preview image; alt-text manifest) run in parallel; the main session relays which screens exist.
- The preview deploys by **direct file upload** to the noindex project; the site's copy check script asserts: noindex header present, no British spelling, no forbidden words, no client name, the AI footer line and the credit line present, the button text, no broken images, no sideways scroll, QR only on laptops, sticky bar only on phones, lazy 3D.
- **Speed**: measure on the **live** preview, not locally (local 210 ms of main-thread blocking became 470 ms live). Font swap caused CLS 0.127 → fixed-line hero text. Heavy blur glows made a heading look "invisible" in screenshots → cheap gradients, paused off-screen animations, visibility asserted by measurement (on top, opacity 1, brightness sampled at 0 / 300 / 1000 ms). Static sections as plain HTML islands is the deferred fix if real visitor data shows slow taps.
- The **ring logo** ported as a site component (no images, no library): header and footer, spinning at the app's pace, paused off screen, hover speeds up, click scrolls to top, reduced motion = still at the tilted angle, measured before/after so it does not move the speed score.

> **For Claude — paste this (preview deploy + checks):**
> ```
> Build apps/site (npm run assets; npm run build) after checking no other session is running a build, and confirm apps/site/out/index.html is fresh. Deploy out/ by direct upload to the Vercel project [app]-site-preview with vercel.json {cleanUrls:true, headers:[{source:"/(.*)", headers:[{key:"X-Robots-Tag", value:"noindex, nofollow"}]}]} (token from the VERCEL_TOKEN env variable only). Then run the live copy/visual checks and a mobile + laptop Lighthouse on the live link; report LCP, CLS, TBT and the scores; give me the link only when the review fixes are in.
> ```

> **Assemble example.** Round 1 preview 13 Sep 22:26; your review ("some images missing; 3D should face front; they are not stylists, they are examples of people using the app") → repositioning live by 01:52 on 14 Sep. Round 2 preview 08:04 on 14 Sep after two outages; committed 16 Sep as `f275190` (79 MB of assets) once the pricing round settled the credits FAQ and a "what credits buy" table. The AI key ran out of prepaid credit mid-asset-generation (20 of 33 images) — top up and keep the ledger. British spelling inside screenshots ("COLOUR", "Grey") came from stored item names, which raised the app's American-English switch as its own task. Placeholder store names in the shop screenshot were left as your decision.

---

## Part B — The AI cost ledger (method)

Plain English: you cannot price credits until you know what one match, one render or one 3D build really costs you. The honest source is your own call log, priced at the vendors' published rates.

**Sources**: the app's job table (every AI call with kind, token usage, outcome), the credit ledger, the live config (which models were in use when), and a marketing generation ledger for one-off spend. **Prices**: the vendors' published price pages, fetched and dated on the day; no invoice reconciliation (say so in the report).

**Method** (paste the block below; it ran as a workflow of nine agents, four of them independent re-checkers, and every total was reproduced exactly):

1. Group every call: **A — product usage** (the basis for per-user pricing) and **B — one-off spend** (marketing images, failures).
2. Price each call: tokens × published rate per model; images at the image rate; 3D at engine credits × the engine's credit price; failed calls per the vendor's rule (Assemble: failed 3D tasks are not charged; each task reports its consumed credits, so the app can log real spend).
3. Where the log stores a sum (e.g. the image call and its verification call as one token total), price at the dearer rate for a ceiling and the cheaper for a floor; report the range.
4. **Per-feature unit cost** (match, second look, swap re-render, refine, detection, packing list, 3D avatar), then **cost per user per month** for light / typical / heavy profiles and a worst case (the whole allowance spent on the most expensive feature).
5. Compare the admin panel's typed rate guesses with reality; list what the log cannot show (nightly resets and test runs delete rows — "survivor sample"; store cost on the row at call time from now on).
6. Verify vendor pricing from **several official pages** (the API docs table omitted a surcharge that the model page and the wallet arithmetic revealed — 40 vs 60 engine credits per build).
7. Write it three ways: a private page for the team, a Markdown file in the internal folder (margins never go into the client-facing repo), and a plain-language part "as if to a 15-year-old" with figures.

> **For Claude — paste this:**
> ```
> Since we started the backend, work out what we've paid [AI providers] for the app's OWN AI usage (not the cost of building it) and what each call got us, per feature: [list]. Source: the app's call log priced at published rates (fetch the vendors' price pages today and date them; no invoice reconciliation — say so). Split product usage from one-off spend. Give per-feature unit cost, cost per user per month for light/typical/heavy/worst-case profiles, the admin panel's guesses vs reality, and what the log cannot show. Have independent agents re-check every total. Money in dollars with decimals, never cents. Publish as a private page and save a Markdown copy in [internal folder] (never in the client repo). Before we proceed, ask me at least 4 questions [standard suffix].
> ```

> **Assemble example.** 15 Sep 2026: the ledger showed a 1-credit match had been **auto-rendering two looks**, making matches loss-making at Pro rates; renders were about 90% of every user profile's cost; Standard and High 3D builds cost the same engine credits; free avatar photo checks were uncapped. The recommendations became the pricing levers below.

---

## Part C — The always-in-profit pricing formula

**The rule.** Every credit, spent on anything, at the cheapest price a credit is ever sold for, must cost you less than it earns, by a margin floor. This is the only rule that holds however users behave.

**The formula**, per feature:

```
adjusted cost   = best-estimate AI cost of the feature × (1 + safety allowance)
credits charged = ceil( adjusted cost ÷ ((1 − margin floor) × cheapest price per credit) )
```

- **Safety allowance**: 25% (chosen over 15%) for free retries after a failed check, failures after a billed step, refused photos, and vendor credits the log cannot explain.
- **Cheapest price per credit**: the plan or pack with the lowest price per credit — usually the yearly plan. Either re-cut yearly allowances so no credit sells below the monthly rate, or use the yearly rate here (every feature then costs one or two credits more).
- **Margin floor**: compute the table at 50 / 60 / 70 / 80 / 90% and pick with the product in view. Assemble chose **70%** on 15 Sep 2026: 80% made the top plan buy too little ("a thin product"); below 70% a single vendor price move puts the worst month near zero; at 70% the realised worst-case margin was 77% because credits round up.
- **Price on the expensive model** you use today; show the cheaper model as upside so prices survive whatever a quality A/B decides.

**Worked example** (Assemble, match with its first look rendered): AI cost $0.190 → × 1.25 = $0.237 → ÷ ((1 − 0.70) × $0.1499) = 5.3 → **6 credits**. The same arithmetic gave: second look on tap 5, swap re-render 5, refine 1, detection 1 after 10 free, packing list 1 (set to 3 by choice), 3D avatar 18 with a single tier.

**Levers that keep the landing page unchanged**: plan and pack prices stay as advertised; features are **re-priced in credits** (all app config); the free tier stays with its leaks capped (starter credits, free detections, a daily cap on free photo checks); one look renders automatically and the second on tap (halves image cost per match, keeps the reveal); one 3D tier at true cost; yearly allowances granted up front, sized so no credit sells below the floor rate.

**Sensitivity**: state what changes if the vendor bills less than assumed, if unexplained engine credits recur, or if the image price doubles. Then re-run the ledger after the first month of real usage.

> **For Claude — paste this:**
> ```
> Verify [vendor]'s prices online from at least two official pages (note the date) and add a pricing model at the end of the report that keeps every paid plan in profit (free tier excepted): the rule "every credit, spent on anything, at the cheapest price a credit is ever sold for, must clear the margin floor"; credits = ceil(cost × (1 + allowance) ÷ ((1 − floor) × cheapest credit price)); tables at 50/60/70/80/90% floors with what each plan's allowance then buys and the worst month; a safety allowance of [25]%; price on the current model and show the cheaper model as upside; keep plan and pack prices, re-price features in credits; yearly allowances re-cut so no credit sells below the floor rate; one recommendation with the reasons; a sensitivity list; then Part 9 "the plan we picked, explained simply" as if to a 15-year-old with figures. For each feature show: what the user pays, what it costs us, what we keep. Dollars only. Have independent agents re-check the arithmetic. Before we proceed, ask me at least 8 questions [standard suffix].
> ```

**Implementing it**: see [14-backend.md](14-backend.md) Step 8 — code defaults + a reprice step in the cutover config script + the staging config row, a migration for any new flag (e.g. "first look included"), the second-look UI made an explicit paid button (a silent auto-render would have been a hidden charge), the landing page's credits FAQ and "what credits buy" table rewritten from live config, admin thresholds rescaled to the new prices. Two commits (landing site, then pricing) so each is reviewable alone.

> **Assemble example.** "Now implement the 70% pricing in the app config so it is updated everywhere — app, admin and landing page" (15 Sep 20:42). A "stop" at 20:47 while you considered 40% (Claude computed it and the trade-off, and confirmed nothing had changed), then "leave it, let's keep 70% and continue where we stopped". Shipped 16 Sep (`c177626`, migration 014), full e2e 211/0.

---

## Part D — Marketing documents and rules

### D.1 A plain-English overview for a marketer

> **For Claude — paste this:**
> ```
> Write an overview of [APP] for a marketer joining us: describe the finished product as one vision, in simple English, no technical words. Add a private note listing which features are live today vs coming, so no ad promises something that is not live yet. Plain text in chat.
> ```

### D.2 The social launch proposal (client-facing)

Run a 15-question round (Assemble's answers: three months — one pre-launch, two of installs; organic with micro-influencers in the target country; short-video platforms; on-camera host; product plus a small fee for creators; full research; premium look with a conversational voice; an email waitlist; 4–5 videos a week; **directional targets, no invented numbers**; free credits as the offer, never a paid-plan promise; the agency runs it; a 12-week calendar plus scripts). Let Claude run **parallel research agents** (audience, platforms, competitors, creators).

Then ask the commercial question: *"Is this a complete proposal? It doesn't mention our cost. Would the client feel like moving forward?"* — the honest answer was "the strategy is complete, but it is not a commercial proposal: no price, no terms, no options". A 7-question round added: a monthly retainer with a three-month minimum; three packages with the middle one recommended; creator fees passed through at cost; "quarter upfront at a discount" and "monthly in advance" shown side by side; an executive summary with the decision needed, "why now", "what month three looks like", "why us"; and, at your request, a **transparent cost breakdown** so the client sees what each charge is for. Delivered as a Markdown file for finishing in a design tool.

Document structure to reuse: executive summary with the decision needed → why now → research → strategy → 12-week calendar → sample scripts → how AI presenters are made (if used) → creator programme → the month-three picture → packages → how we run it → why us → what we need from the client and assumptions → next steps.

### D.3 AI presenters and disclosure

When the founder will not record, an **openly AI host** is the compliant alternative: Claude raised the platform and advertising-disclosure rules for synthetic people before offering options. The plan: two openly-AI hosts with disclosure as the hook; a professional AI-video stack inside the retainer; real human creators as the proof; never present synthetic people as customers or reviewers; never remove provider watermarks. Keep the landing page and the proposal consistent (Assemble found a mismatch: the proposal promised openly-AI hosts while the page showed personas with only a footer line — flag such mismatches to the client).

### D.4 Parked growth mechanics (decide when payments are live)

- **Outbound shop links**: an auto-affiliate service (one account; outbound links rewritten server-side; clicks and estimated commission shown in admin) — a few hours of work; every product already carries an affiliate URL field and click tracking.
- **Inbound referral links for creators**: buy a referral tool once payments exist, or build an Affiliates admin section on the referral source the app already carries into sign-up.
- **Audience/message link variants** on the landing page: only after the client accepts the marketing proposal.

## Pitfalls (growth)

| Symptom | Cause | Fix / prevention |
|---|---|---|
| Personas read as real stylists or customers | Positioning drift in copy and generator scripts | Third person only; a footer disclosure line; no first-person quotes; a build-failing forbidden-word test; clean the generator scripts too |
| "Designed and built by <agency>" upsets the client | Reads as ownership | "Development partner: <agency>" with a link |
| Page claims something the app does not do ("credits a month" granted once) | Copy written from intent | The site builder cross-checks every claim against code; unresolved claims become tasks (that one belongs to payments) |
| Wrong spelling inside screenshots | Stored demo data in another locale | Decide the locale before generating data; recapture after the switch. When switching the app's language, change user-facing copy and stored display data only — never rename identifiers, database columns, slugs, enum values or storage keys, and never rewrite migrations; add one line to the AI prompts so generated text uses the same locale |
| Placeholder store names visible | Seed catalogue | Seed realistic but clearly fictional names before captures |
| Section heading "invisible" in screenshots | Heavy blur repainting slowly | Cheap gradients; pause off-screen animation; visibility asserted by measurement |
| CLS above 0.1 on phones | Font swap shifted the hero | Fixed-line hero text; measure live early |
| Main thread busy after load on phones | Hydration of a large page; hero loop during hydration | Delay animations to load + idle; static HTML strings; islands if real data shows slow taps; trust live measurements over local |
| Site 3D faces sideways | Model files use a different forward axis | Compressed, rotated copies for the site; normalise at export |
| AI key out of credit mid-asset job | Prepaid credit exhausted | Budget alerts; check key health first; a generation ledger |
| Two sessions building the same site | Shared `out/` folder | Check for running builds; confirm a fresh `index.html` |
| Vercel preview picked up by search engines | No noindex | `X-Robots-Tag: noindex, nofollow` on the preview project |
| Cost report undercounts calls | Nightly resets and test runs delete job rows | Report ranges; store cost per call at call time |
| Vendor price pages disagree | Docs table omitted a surcharge | Cross-check the model page, price page and wallet arithmetic |
| Cents notation confuses the reader | Amounts written as cents | Dollars with decimals ($0.164), always; a checker agent verifies every converted figure |
| Tiny chart bars render as a broken path | Invalid SVG path for very small values | Minimum bar width; open every generated report in a real browser |
| Pricing changed a silent auto-render into a hidden charge | Automatic paid call under new prices | Audit every automatic paid action when repricing; explicit paid buttons |
| Half-changed staging (new prices, old code) | Config applied before the code deployed | Finish the round; reprice after deploy; never stop mid-round without rolling config back |
| Numbers "pass tests" but are wrong (giveaways counted twice) | Tests check flows, not economics | Adversarial review of every money page against the report's method |

## What to carry forward

- The landing page waits for **client approval + live payments** ([15-payments-and-cutover.md](15-payments-and-cutover.md)) before the domain moves; the coming-soon backup project stays.
- Re-run the cost ledger monthly after launch; adjust credits per feature behind the admin save lock; the formula and thresholds live in the report file and app config.
- Growth mechanics (affiliate links, referral programme, message variants) are parked with their estimates; revisit when the marketing proposal is accepted.
- Every prompt above → [30-prompt-library.md](30-prompt-library.md); every pitfall → [40-pitfalls-master-list.md](40-pitfalls-master-list.md).
