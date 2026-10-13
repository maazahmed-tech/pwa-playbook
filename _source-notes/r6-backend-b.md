# Source notes r6 — backend chat 2, part B (12 Sep 23:27 → 17 Sep 16:34, 2026)

Scope: `Project History\chats\2026-09-01-ui-and-backend-2.md`, lines 5222–11401.
Covers: delete-account retest follow-up, client handover checklist, the 20-point security round (commit 6677cba), demo profile rename (3ef8c33), the launch landing page rounds 1 and 2 (site app, marketing personas, preview deploys, ring logo), the AI cost ledger report and the 70% credit pricing model, the 70% pricing implementation (c177626) and launch-site commit (f275190), admin round push A (d1e209d), product round push B (0c1b0b4), batch 3 (ddc5496), the render layering fix (db4225c), the chat archive, and the replication-guide question round.

Naming rules used in these notes: the client is "the client"; the developer/user is "you"; tokens, keys, IDs of hosting projects and database endpoints are shown as placeholders. The two fictional marketing personas ("Sasha" and "Marcus") are AI-generated characters, not real people, so they are named. Service running costs are left out on purpose; credit pricing appears only where it is a product decision.

---

## 1. Timeline

### 12 Sep 2026 (late evening)
- **23:27 – Delete-account retest explained.** You typed "Delete" (not "DELETE") in the delete-account sheet and nothing happened. Cause: the old sheet only accepted the word in capitals and showed a small, easy-to-miss toast. The fix (already pushed earlier that day, commit 01e4077 per summary) accepts any case, asks the phone keyboard for capitals, shows "Deleting…" and blocks double taps, explains server refusals inside the sheet, and reloads to the Welcome screen on success. Claude told you to retest with a throwaway account because deletion is real and immediate.
- **23:44–23:46 – Client handover checklist.** You asked for a step-by-step Markdown file telling the client how to provide everything the project needs, "given that the github stay ours". Delivered `CLIENT-HANDOVER-CHECKLIST.md` in the backend repo (commit 1d8679e, pushed). Contents:
  - Ownership split: code on GitHub, CI pipeline, Vercel hosting, database and monitoring stay with Deep Learn HQ; domain, the Google account that pays for AI, the 3D engine account, email sending, Google sign-in, admin login, and later app-store and payment accounts are in the client's name. One-line reason for the split.
  - Checklist table of nine items (what each unlocks, when needed). Items 1–7 are the launch set; app stores and Stripe flagged as "later, start the paperwork early".
  - Safe key handover: Bitwarden Send with expiry, or reading a key out by phone; never chat, email or a shared document. Receipt confirmed; keys swapped within the hour if the client rotates.
  - Step-by-step sections with links: Google Cloud project with billing + Gemini key + budget alert; OAuth consent screen and client with the two exact redirect URIs; Tripo account and key; Resend with DNS records and domain verification (or inviting the agency for a day); admin code email addresses and first password change; business details and approval of privacy/terms text (both live on staging and editable in the admin panel); first shop set; Google Play and Apple accounts with the invite needed; Stripe with a restricted key.
  - "What happens after" items 1–7 arrive: rehearsed migration, keys on hosting, switch with one-click rollback, live checks, walkthrough call; staging stays untouched.
  - Two flags before sending: Play organisation account and Apple Developer Program need a D-U-N-S number (not if registering as an individual); the Stripe section assumes Stripe is the chosen provider.
- **23:49 – 20-point security list.** You pasted a list of 20 security items a developer had told you about ("Hide API keys, Enable RLS, Test IDOR attacks, …, Attack your own app") and asked whether they're in place or needed, with a question round (first asked for 5, interrupted, re-asked for 25).

### 13 Sep 2026
- **00:17 – Security plan agreed** after 25 questions (details in section 2). You then chose "Change something first" and wrote: "in the scan and attacks you find any problem then fix it and verify again and repeat until its perfect".
- **00:19 – Build started** with three parallel workstreams: R1 sessions and limits; R2 validation, tampering and uploads; R3 attack tests, scans and the documents. CI workflow prepared (concurrency group, secret scan, audit gate) and Dependabot switched on.
- **00:46 – R3 delivered** the attack suite, scans and documents. It surfaced: dependency audit failing (next, postcss, sharp), two routes without a session check (friends list, ad tracking). History secret scan found no real secrets, only the staging demo's public presentation password.
- **00:46–00:47 – Model usage limit hit** ("You've reached your Fable limit"). R1 and R2 stopped mid-work.
- **01:36 – "model changed continue."** Claude checked what partial work survived instead of restarting: both apps typechecked, migration 013 was on staging and CI branch, 338/339 unit tests passed; the only failure was the route inventory test (ad click tracking route open).
- **01:38–01:43 – Gaps and dependency fixes.** Ad tracking route closed (no UI called it; e2e called it with a demo session). Dependency flaws fixed: critical remote-code-execution in Next.js, SQL-injection advisory in the database library (drizzle-orm bumped to 0.45.2), image library (sharp 0.35.4). One high advisory remained in PostCSS nested inside Next.js (build-time only); an override couldn't reach the nested copy; a major Next.js upgrade was refused "days before launch" without your say-so → documented, expiring exception in the audit gate (expires 1 Dec 2026, build fails after that).
- **01:44–01:45 – Docs corrected.** SECURITY.md was restructured to lead with the developer's own 20 points in his wording (it had mapped Claude's internal contract instead). SECURITY-SUMMARY.md got an honesty addition: the one known carried vulnerability.
- **01:56 – You asked "all done? anything left now except for stripe?"** Claude: not done, nothing pushed; e2e 85 tests in with two failures. Listed remaining: real timestamps for share/ticket/packing labels (small migration), production cutover (runbook rehearsed, waiting for keys); waiting on you: staging Google redirect URI, handover items 1–7; deliberately later: Stripe, app store accounts, Content-Security-Policy header, external penetration test, Vercel firewall rules at cutover, the carried dependency issue (review by 1 Dec 2026).
- **02:08–02:34 – Test failures triaged.** Four failures, none app defects: attack suite shared accounts with other specs (credit top-ups raced), packing-list setup needed a stocked closet, a block test assumed a name search returns nothing (but two real staging sign-ups had the demo profile's name), stale username after the account rename (share addressed to old "buddy"). Third real gap found by the signed-out route sweep: product "couldn't buy it" feedback accepted anonymous submissions → now needs a session.
- **02:50–02:51 – 12 failures in under a second each** → network outage (DNS to the Neon host lost, 14 queries failed to connect), not code. Scans passed in that run: secret scan clean across 409 files, dependency gate clean apart from the exception.
- **03:12–03:20 – Last two failures** (a credits test and a render-results test) passed alone on a single worker → races between parallel spec files on shared demo/storer accounts. Local runs switched to one worker (like CI). Cost: about 10 extra minutes per run, "for a bar you can trust".
- **03:52 – Full suite green: 200 passed, 0 failed.** Pushed as **6677cba** at 03:53.
- **03:54 – False alarm**: the failing run was Dependabot's own attempt to update a build tool, not the CI test pipeline. Watched the right run by name.
- **03:56 – 19 live checks passed on staging**; staging demo reset (the test run had mutated it).
- **04:07 – CI green. Security round shipped.** Result: 16 of 20 items in place or added, 1 deliberately not applicable (RLS), 3 left for later by your decision.
- **11:27 – Demo profile rename requested** ("can we change the demo profile name from [the client's name] to demo user ?"). Claude first searched every place the name appeared, because the nightly reset would put the old name back if only the database changed.
- **12:30 – Rename shipped (commit 3ef8c33).** Name "Demo User" (greeting "Hi, Demo"), username @demo, email demo@example.com (old address was on a real public mail provider; example.com is reserved and cannot receive mail). Nightly reset now finds the demo by fixed id and writes the identity itself. Staging and test DB renamed; production renames itself on first reset after cutover (noted in runbook). 339 unit, both builds, 200 e2e passed; CI green; demo reset to seed (28 closet items, 13 looks). Phone retest guide given (4 steps).
- **19:58 – Landing page kickoff.** You asked to rework the coming-soon page to introduce the app with screenshots and features, with a 25-question round.
- **20:07 – Concept clarified by you**: design as if everything is launched (backend step 2 done, and even step 3 payments done), show to the client for approval before the app is ready, then replace the coming-soon page. The client does not want his name on it; the agency may be credited subtly (About section, link to deeplearnhq.tech).
- **20:12 – Backup requirement**: "keep the coming soon page on a separate staging link so its backed up". The exact live coming-soon page was copied to a separate Vercel project (`assemble-coming-soon-backup`). An older backup project turned out not to match what was live.
- **20:41 – You pasted the internal, confidential 90-day growth playbook** as context (AI personas, cohorts, message hypotheses). Used for context only; never published.
- **21:06 – Paused at Q18**, then resumed on AI disclosure (see section 2).
- **21:18 – Round 1 plan approved**: "Yes: build now, move the domain only after approval and live payments".
- **21:22 – Two workstreams launched**: SITE-BUILD (the site app) and SITE-ASSETS (drafting the two fictional personas and producing every image from their marketing accounts on staging).
- **21:54–22:01 – Agent kept ending its turn while a background build ran** (see pitfalls); Claude told it to wait in the foreground.
- **22:03 – Gemini key out of prepaid credit** (both models refusing; all staging AI broken). 20 of 33 page images existed. You had to top up in Google AI Studio.
- **22:12 – Site workstream finished**: typecheck, 25 unit tests, build, 12 smoke tests, visual check at laptop and phone widths. Its report surfaced two app-level truths: plan credits "a month" were actually granted once only; "Delete your account" left stored photos/renders/avatar files behind and the dialog said "within 30 days" when deletion is immediate (flagged as a separate task).
- **22:19 – Decision**: keep "a month" wording; monthly top-up belongs to the Stripe work.
- **22:26 – First internal preview** deployed by direct API upload, hidden from search engines (`X-Robots-Tag: noindex, nofollow`).
- **22:53–22:56 – "Invisible intro" investigated**: the heading didn't show in Claude's screenshots. The site agent couldn't reproduce it; replaced a heavy blur glow with a cheap gradient, paused an off-screen animation, added three visibility checks to smoke tests; Claude verified on the live preview with a measurement script (on top, opacity 1, brightness sampled at 0 ms/300 ms/1 s).

### 14 Sep 2026
- **01:32 – Your review feedback**: some images still missing; 3D avatar should face front; the personas are not stylists but "an example of people using and promoting the app".
- **01:52 – Repositioning live on preview**: no "stylist" wording anywhere (a test fails the build if it appears), captions "A look from her own closet"/"his own closet", no first-person quotes or reviews from the personas (would be fake testimonials), footer AI line kept; generator scripts cleaned so reruns don't bring "stylist" back.
- **05:05 – Gemini topped up; round 2 requested** ("take long form pictures of pages do scrolling inside phone feels realistic … amazing with pizaz … 10+ years experienced marketer"), 25 questions.
- **05:32 – Round 2 approved** with one override: "Yes, but keep the phone hero full length".
- **05:41 – Site workstream stopped on a network outage**; resumed with a warning to check for other sessions' builds before building and to confirm a fresh `out/index.html`.
- **06:14 – Image workstream delivered**: 18 full-length app screens (header/tab bar shown once), "nothing to wear" rail images, social preview image; American alt text. 3D app screens not captured (app viewer still side-on). British spelling visible inside app screenshots ("COLOUR", "Grey", "trousers") because item names are stored data that looks reference by name.
- **06:16 – Context compaction** (session continued from a summary).
- **06:21 – Speed baseline on round 1 preview**: mobile Lighthouse 91, LCP 2.2 s (target 2.5 s), but CLS 0.127 (limit 0.1) from font swap pushing hero images down.
- **07:17 – Round 2 on preview but link held back** until four review fixes (remove "A 3D you" phone step with side-on screen, hero looks 50% bigger on laptops, soft fade on the clothes rail, remove empty space on phones).
- **07:36 – Your machine's internet dropped** (DNS timeouts). Build agent continued an offline fix (hero text aligned with header logo).
- **08:04 – Round 2 preview sent to you.** Checks: no British spelling/"stylist"/client name; footer AI line and "Development partner: Deep Learn HQ" linked; no broken images or sideways scroll; mobile hero 2.2 s, no layout shift; laptop score 99. Open: ~470 ms main-thread busy after load on phones.
- **08:38 – Speed pass live.** Local blocking time ~210 ms, but live runs still showed ~470 ms in 2 of 3 runs. Remaining cost is React hydration of a 194 KB HTML (111 KB is Next.js's second copy of the page). Rewriting static sections as plain HTML was deferred unless real visitor data shows slow taps. Open decisions for you: placeholder shop store names in the shop screenshot; "credits a month" wording.

### 15 Sep 2026
- **14:50 – "did we every talk about a marketing proposal?"** Claude explained the two documents (client-facing social launch proposal in the UI folder; the internal playbook pasted in chat) and flagged a mismatch: the proposal promised openly-AI stylists, while the page shows personas without AI tags and only a footer line.
- **15:15 – AI cost report requested** (what was paid to Google and Tripo since backend work started, what it bought, and per-user pricing). 4 questions.
- **16:45 – Report published** as a private artifact page ("Assemble AI Cost Ledger"), computed from the app's own call log at published rates by a workflow of nine agents (four independently re-checking; every total reproduced exactly). Key finding for pricing: a 1-credit match auto-rendered two looks, making matches loss-making at Pro rates; renders were ~90% of every user profile's cost; Standard and High 3D builds cost the same engine credits; free avatar photo checks were uncapped by credits. Recommended package: consider a cheaper image model (A/B first), render one look automatically and the second on tap, re-price features in credits, cap free photo checks at 10/day.
- **17:04 – Follow-up**: Markdown file too, check Tripo's credit pricing online, and add an "always in profit" pricing model (free tier excepted). 8 questions.
- **19:06 – Parts 7 and 8 added.** Tripo verified verbatim against three official pages: 1 credit = $0.01, prepaid only; 60 credits per build at the app's settings; failed tasks not charged; each task returns `consumed_credit` (so the app can log real Tripo spend); new API accounts get 300 free credits. Pricing given at 50/60/70/80/90% floors; 70% suggested. Three verifiers re-checked 160 credit figures.
- **19:36–20:00 – Credit pricing explained in chat**, then you: "dont write in ¢ its confusing only in $" (standing rule since), and asked per-credit "user pays / Assemble spends / profit".
- **20:09 – Report converted to dollars** (file: 45 amounts; page: 71 amounts), checked by a second agent (no cent sign left, each figure = old value ÷ 100, no other number changed). The checker caught a mistyped rate in Claude's own instructions.
- **20:21 – Part 9 "The plan we picked, explained simply"** (15-year-old level with 5 figures exported as PNGs to `UI/ai-cost-report-assets/`), checked by a number-tie-back agent and a plain-language reviewer.
- **20:34 – HTML version** `UI/AI-COST-REPORT.html` (self-contained, 75 KB, light/dark, noindex). Browser check found a real bug also on the published page: tiny bars drawn with an invalid SVG path → fixed both.
- **20:42 – "now implement the 70% pricing … everywhere in app . admin and landing page"**, 5+ questions. Interrupted with "stop" at 20:47 (Claude confirmed nothing was changed); you asked about 40% instead (Claude computed it and the trade-off), then "leave it lets keep 70% and conmtiue where we stopped from."
- **21:03 – Pricing plan settled** (see section 2); migration 014 needed.
- **21:06 – Build workflow**: phase 1 data (schema, migration 014, defaults, seeds, cutover script, docs), then four parallel agents (app API, app screens, admin, landing site), then tests agent with full ladder, then reviewer.
- **21:50 – "where is our bbackend and front end hosted?"** answered (section 5).
- **21:57 – Demo credentials no longer prefilled** on the user app login (demo entered only by typing credentials on staging; hidden demo link still works for presentations; production never accepts either).
- **22:08–22:14 – First full e2e run killed by internet outage**; ports freed, test phase restarted (~45 min suite). Affiliate-links options discussed and parked (section 2).
- **22:40 – Two new requests**: closet "Add item" bug (new account's photos refused as "no person in the photo" — camera context from avatar flow persisted) and the rotating ring logo on the landing page (15 questions, 23:21–23:35).
- **23:40 – Admin batch requested**, interrupted twice; you said "for next batch i want you to first wait" and "when its complete dont run and task i will give you new next batch".

### 16 Sep 2026
- **00:09 – Pricing round green**: full e2e 211 passed / 0 failed (36 min), unit 392/392, three builds OK; reviewer found no product defects (three stale test-name references in LAUNCH-READINESS.md corrected). Migration 014 on staging + CI branch.
- **00:24 – "should we stop this and do all fixed together?"** Claude recommended finishing: staging config row already had new prices while old code was deployed (half-changed state); pricing work was green; next batch was large and touched other files; smaller pushes are easier to retest and undo.
- **00:57 – Two commits on main**: **f275190** (launch site round 2 + ring mark) and **c177626** (pricing + camera fix + login prefill removal). Checked that no generated site files or marketing credentials were included.
- **01:28 – CI green; Vercel had not built main** (queue busy with Dependabot branches) → both staging deployments triggered via API.
- **01:34 – Round live**, live check green (config values, empty login fields with no demo wording, typed demo login, no stored camera context); landing preview updated (ring mark, credits answer, "What credits buy" table, yearly toggle showing credits per year; live phone speed 2.3–2.5 s unchanged). Phone retest guide (6 steps).
- **01:47 – Batch 2 message** (admin notifications/OTP/broadcast/profitability ≥20 q; match budget chips ≥5 q; yearly credits ≥5 q; pyjama belt ≥5 q; onboarding questions ≥15 q; remove "Margin · this month"). Claude first explained how the admin money numbers worked, then ran ~50 questions (01:47–02:42).
- **02:44–02:47 – Model choice**: you asked to run in Opus and whether to switch now or mid-way; pasted your plan usage report. Claude estimated the batch at 8–12 M tokens; on the pricier model it could exceed the remaining weekly allowance; advised switching before launching agents (subagents inherit the model at launch).
- **02:48 – "go".** Tree clean at c177626; three briefs written; push A workflow launched (data → parallel server + admin UI against a fixed API contract → tests → adversarial review). State recorded to memory in case of context rollover.
- **05:39 – Tests agent hit a DNS outage; review never ran.** Workflow resumed from the tests phase (finished agents replayed from cache). One decision raised: the `ADMIN_SESSION_SECRET` bypass (see section 8).
- **11:15 – "contınue"** after an overnight gap.
- **12:08 – Push A review found 13 defects** (section 9). Fix pass: one agent fixed code, one wrote docs, full suite re-run, second review checked each defect.
- **13:23 – Push A on main (d1e209d)**: 222 e2e passed, 379 unit. Staging deployments triggered, CI watched, push B started immediately.
- **13:41 – Push A live**; staging settings include provider prices and four fixed-cost rows; old per-call rate fields gone.
- **15:06 – Push B review found 6 defects**; tests nearly green (1 bug in a new test, 2 DB connection drops). Also found in testing: admin-set budget bands weren't reaching the shop page, filter sheet or swap sheet.
- **16:57 – Push B clean**: 230 passed / 0 failed, second review confirmed. Found: the admin panel's test server wasn't using the fake AI engine (product tests had called real Gemini) → fixed. CI branch render model reset.
- **16:59 – Push B on main (0c1b0b4)**; 17:24 both pushes live, CI green, live checks, combined phone retest guide (app 5 steps, admin 6 steps).
- **21:48 / 21:58 – Batch 3 message** (admin Style & Categories not reflecting in app; one sign-in method per email; share views showing pieces to buy; copy link not copying; suspended-account messaging; admin AI charts; Home order), 15+ questions. First send failed with "OAuth access token has expired" (Claude Code's own login) and was re-sent.
- **23:15 – Batch 3 plan**; **23:16 "go"**; **23:18** batch 3 workflow started (data with migration 017 → three parallel build agents → tests → review with up to two fix rounds).

### 17 Sep 2026
- **00:09 – "what will we do if context is at 100%, is that a problem?"** Answer: no; older context gets summarised; agents run with their own memory; decisions, briefs, progress log and workflow journal live in files.
- **00:16–00:23 – Chat archive.** You asked to save everything discussed "ever since inception". Every Assemble chat since 9 Jul 2026 exported as readable Markdown into `Project History\chats\` (every message, every multiple-choice question with options and answer, secrets masked; ~2.3 MB; 9 session files; 0 unmasked secrets found) via `Project History\export-history.mjs`. You asked for the exhaustive replication guide after batch 3, preceded by a ≥15-question round; saved as a pending memory task.
- **01:59 – Render layering issue** (a short-sleeve tee drawn over a long-sleeve top, both badly rendered) + later the avatar-photo watch being copied into renders; 6 questions; ship as its own small push after batch 3, targeted tests only ("dont play the whole 2.5 hour long suite").
- **05:11 – Context compaction** again.
- **05:12–05:27 – Batch 3 shipped (ddc5496)**: attribution grep clean, secrets scan on staged tree 0 hits, pushed; staging app picked up the code automatically; CI passed. Full e2e 243 passed / 0 failed, unit 448/448, three builds; review found 4 defects → fixed → second review clean. Vercel token had stopped working (SAML re-sign-in required), but Vercel auto-deployed this time.
- **05:27–05:43 – Render fix built directly by Claude** (no workflow): rulebook, render prompt, server-side top removal and layer tagging; typecheck, 86 targeted unit tests, full unit 456/456 (8 new), e2e ai/render/swaps specs 20 passed (20 desktop copies skipped). Pushed **db4225c**.
- **05:54–05:55 – One real layered render on staging** (demo account, cost about $0.17): look with striped shirt, black tee, grey sweater, black jeans, white sneakers → app removed the black tee, kept the shirt, drew sweater over shirt with collar and cuffs showing; post-render check passed all 4 pieces, no redraw. Test look deleted afterwards. Watch removal not live-tested (demo photo has no watch); phone steps given.
- **16:10–16:34 – Replication guide question round** (16 questions; section 2). You chose to split models: readers on Opus, writers and checker on Fable. Claude started refreshing the chat archive.

---

## 2. Decisions and why

### 2.1 Client handover (12 Sep)
- **GitHub, CI, hosting, DB and monitoring stay with the agency; accounts that bill or represent the business belong to the client** (domain, Google Cloud billing for Gemini, Tripo, Resend, Google OAuth, admin login, app stores, Stripe). Why: the client pays for and legally owns business-facing accounts; the agency keeps the engineering pipeline it operates.
- **Keys are handed over via expiring secret links (Bitwarden Send) or by phone**, never chat/email/shared docs. Why: those channels keep copies forever.

### 2.2 Security round (25 questions, 12–13 Sep)
| # | Decision | Why |
|---|---|---|
| Q1 | Status per item with evidence, then fix real gaps in one push | Some items don't apply to this stack; blind fixing wastes work |
| Q2 | Automated attack tests kept as e2e (IDOR, user isolation, record access, SQL injection) | Runs on every push so regressions can't slip in; external pen test is post-launch |
| Q3 | No Postgres RLS; keep server-side checks, document why, add RLS only if the DB is ever opened to browsers | No browser queries the DB; one server role; RLS would need a per-request role switch for no real gain; isolation proven by tests |
| Q4 | In-app rate limits per account and per IP, stored in the database | No new service; works identically on staging, CI and production; firewall can't tell users apart |
| Q5 | Limits on sign-in/sign-up/codes/password reset; AI calls (match, detect, render, avatar checks); uploads and public votes/comments; admin sign-in and 2FA codes | Stops password guessing, code brute force, AI bill runaway, flooding; admin login is the most valuable target |
| Q6 | Full git-history secret scan now + scanner on every push in CI | GitHub's own secret scanning isn't free on private repos |
| Q7 | Any key found in history is rotated the same day and recorded | History can't be trusted as deleted; rotation is the only real fix |
| Q8 | `npm audit` gate in CI + Dependabot alerts | Both free; catches known vulns at push time and proposes updates |
| Q9 | You granted the GitHub token the `workflow` scope (instead of pasting the workflow yourself) | Lets Claude edit `.github/workflows` now and in later rounds |
| Q10 | Admin: server-side sessions table with "Log out everywhere" + 5-guess limit on 2FA codes (migration 013) | A leaked stateless admin cookie couldn't be revoked; codes had no guess limit |
| Q11 | Users: password change or account delete signs out every other device (per-user session version) | Covers the stolen-phone case without a device list UI |
| Q12 | Private user photos served only through the server after sign-in; catalogue/product images public; add a test | Matches the app; test proves strangers and other accounts get 401 |
| Q13 | Uploads: check real file bytes (content sniff) and strip EXIF/location/camera metadata by re-encoding. **No size cap** (you didn't tick it) | A renamed script is refused; shared photos never reveal location |
| Q14 | One strict zod schema per writing route (POST/PATCH/DELETE): unknown fields dropped, types/lengths enforced | Also covers field tampering; uniform for future routes |
| Q15 | Never settable from a request: plan, credits, verified, suspended; ownership ids (user/look/share id); public-link tokens and share avatar ids | Money/status only change through proper routes; owner always from session |
| Q16 | Trim responses: no other users' emails/internal ids in social features; no password hashes, codes, tokens, storage keys; no raw AI output/prompts; no stack traces/DB error text; plus "anything else that is necessary" | Least exposure |
| Q17 | Never log emails, tokens, keys, photo contents, full request bodies; scrub before Sentry, "send default PII" off, unit test for scrubber | Logs keep route/status/timing/account id only |
| Q18–19 | Demo entry **kept in production** behind the hidden address, **no guards**, **nightly resets kept**; demo id becomes a list so more marketing demo profiles can be added later by config | Your choice for presentations/marketing (Claude had recommended demo off in production) |
| Q20 | Cron routes: secret always required, constant-time compare, test that wrong/missing secret → 401 | Uniform across every scheduled job |
| Q21 | Origin check on every state-changing call (403 if Origin isn't ours/installed app) + test | Closes CSRF gap for older browsers; cheaper than CSRF tokens |
| Q22 | After asking "is there really a need for this?"/"but why do we need this?": **three one-line headers, no CSP** (X-Frame-Options, Referrer-Policy, Permissions-Policy). CSP deferred post-launch | No risk, no effort; CSP could break 3D viewer/camera |
| Q23 | Code check (unit test) that flags raw SQL built from strings + injection payloads through every text field in the attack suite | Protects future routes, not just today's |
| Q24 | `SECURITY.md` mapping each of the 20 items to the test/code that proves it + one-page plain-words `SECURITY-SUMMARY.md` | Kept current by future rounds; summary is forwardable |
| Q25 | One push: fixes, attack tests, scans, docs, full test bar | One migration, one review, one CI run, one phone retest |
| Extra | "in the scan and attacks you find any problem then fix it and verify again and repeat until its perfect" | Fix-and-rerun loop until clean |
| Deferred | Nested PostCSS advisory under Next.js kept as a **documented exception expiring 1 Dec 2026** (build fails after) | Fix needs a major Next.js upgrade; build-time only, unreachable by users; not taken days before launch without approval |
| Deferred | CSP, external pen test, Vercel firewall rules at cutover | Post-launch/cutover items |

### 2.3 Demo profile (13 Sep)
- Renamed to "Demo User", @demo, demo@example.com. Why: old identity used the client's name and a real public mail provider address; example.com can never receive mail.
- Nightly reset writes the identity itself (found by fixed id). Why: otherwise the reset restores the old name.
- **Later (15 Sep): demo credentials no longer prefilled on login**; you chose "Empty fields, demo only by typing the credentials" (not a "Try the demo" button). Why: cleanest login screen; client never sees credentials on screen.

### 2.4 Launch landing page, round 1 (25 questions, 13 Sep)
- **Full launch landing page right away**, designed as if everything (including payments) is live; shown to the client first; replaces the coming-soon page on approval.
- **Old page backed up** to a separate Vercel project/link before anything changed.
- **Real app screens captured automatically, framed in phone mockups** (not designed mockups). Why: honest, easy to refresh after app changes, recognisable to the client.
- **One scrolling page, About as a section near the end.**
- **Main button opens the web app (PWA installs to home screen)**, pointing at the staging app URL until approval. Why: no dependency on store approval.
- **Hero = see outfits on yourself.** Why: the thing no ordinary wardrobe app does, understood from one image.
- **Four features**: wardrobe from a photo; looks for any occasion with swaps/compare; 3D avatar and sharing; shop + packing (you ticked all four).
- **Pinned phone whose screen changes as you scroll** (you chose this over alternating sections); on phones, stacked sections (recommended).
- **Keep the dark brand** (navy, violet, ice-blue, same fonts and logo).
- **Do not use the demo profile's likeness** (it showed the client) → **fictional AI-generated models run through the real app on separate marketing accounts**. Why: consent for a real face on public marketing; client doesn't want name/face used.
- **Two models (a woman and a man)**, drafted now; page doubles as their approval. Named by the (internal) playbook's working names. Why: page for both audiences; one approval covers page and characters.
- **Headline**: "You already own the outfit." / "Assemble finds it, and shows it on you before you wear it."
- **Audience/message link variants**: parked ("keep this as a for later thing to do") until the client accepts the marketing proposal.
- **AI disclosure**: you first asked "dont tag them ai and let people think they are real … i dont want any Gemini's marks anywhere." Claude checked a real API render first (API renders carry no visible sparkle; only consumer-app seeded images did; invisible SynthID left intact), then explained that presenting them as real people carries FTC fake-endorsement risk and breaches the image provider's policy on the client's key. Final: **no tags on images, no claim they're real, one plain footer line "Sasha, Marcus and their looks are AI-generated."**, never shown as customers.
- **Pricing**: full section, Free/Plus/Pro cards with monthly/yearly switch.
- **Privacy**: short "Your wardrobe stays yours" section with four promises already true in the app.
- **FAQ**: a few new questions in marketing voice (you chose this over reusing help centre answers; Claude checks each answer against the app).
- **Credit line**: "designed and built by" rejected by you ("feel like it our project and the client might not aprove") → **"Development partner: Deep Learn HQ"** linking to deeplearnhq.tech. Why: names a hired-partner relationship, not ownership.
- **Tracking**: cookieless PostHog in the app's existing project, visit source carried into sign-up. Why: no consent banner; measurable funnel from launch day.
- **Code location**: new `apps/site` in the backend monorepo with its own Vercel project; on approval move `assemble.ink` + `www` between Vercel projects (no DNS change, reversible, no front-end repo change). Why: prices come from the live plan config; screenshots from the same tooling as tests.
- **Review**: staging link, feedback over call/chat (you chose this over an approval checklist).
- **Domain move only after client approval AND live Stripe payments.** Why: otherwise visitors meet test-mode checkout.
- **Credits wording**: keep "credits a month"; monthly top-up belongs to Stripe work.
- **Personas repositioned (14 Sep)**: not stylists; example people using their own closets; third person only; no first-person quotes/reviews (fake testimonial risk); build fails if "stylist" appears.

### 2.5 Landing page, round 2 (25 questions, 14 Sep)
- Single action: **start free and add first pieces**; button **"Build my first outfit"** + "Free, no card needed". Why: outcome-worded; aligned with activation metric (first outfit from own closet).
- **Phone screens are full-length screenshots that scroll inside the phone as the page scrolls.**
- **Hero**: pieces fly together into rendered looks; you chose **split screen, both personas at once**, and **full length on phones** (overriding the head-to-knee crop recommendation).
- **Proof**: product proving itself; **no "first 1,000 members" offer** ("no offer for first 1000"); no invented reviews or user counts.
- Short **"nothing to wear" problem beat** under hero.
- **On-page interaction**: interactive 3D avatars (both side by side, drag to rotate, lazy-loaded, front-facing idle turn) — you chose this over an occasion picker.
- **Sticky CTA**: slim bottom bar on phones, header button on laptops, after hero; hides near pricing/final band.
- **Motion**: rich but purposeful; reduced-motion respected.
- **Three steps**: Snap your pieces, Pick the occasion, Wear the look.
- **"Why it works" highlight** with the app's real reasons appearing one by one.
- **Voice**: confident, warm, a little witty, talks to "you".
- **Statistics**: you chose "use common industry figures without citing them"; Claude's guardrail: only genuinely widely published figures, never invented.
- **Laptops**: button works in browser + "Scan to open on your phone" QR code.
- **Install strip** "On your home screen in 10 seconds" with iPhone/Android tabs.
- **Pricing**: you chose **Pro highlighted as best value** (Claude kept Free first and complete).
- **American English on the page**; app switch raised as a separate task.
- **Section order**: hero, problem, 3 steps, feature phones, why it works, 3D avatars, install strip, privacy, pricing, questions, final CTA (both finished looks), about, footer.
- **FAQ answers four objections**: works with my clothes/style; setup time; really free/credits; photos/AI.
- **Speed**: hero usable ≤2.5 s on a mid-range phone on 4G; everything else lazy. CLS < 0.1.
- **3D files for the site**: compressed front-facing copies (under ~1 MB vs ~4 MB originals, which face +X instead of glTF +Z); app's own files unchanged.
- **Delivery**: build all, you review preview, then client.
- **Deferred**: HTML-only rewrite of static sections to cut hydration cost (only if real visitor data shows slow taps).
- **Open for you**: placeholder store names in shop screenshot.

### 2.6 Ring logo on landing page (15 questions, 15 Sep)
Exact app 3D letter ring ported as a site component (no images, no library); header (~30 px, word "assemble" beside it) and footer (~56 px with wordmark); always spinning at the app's ~8 s pace (you chose app pace over 12 s), paused off screen; hover speeds up, click scrolls to top; violet letters, white A (the app's A); reduced motion = still at tilted angle; favicon and share image unchanged; phones spin too; must not move the speed score (measured before/after); ship in this round after tests finish, inside the landing-site commit. Trade-off named: a constantly moving header element; 12 s is a one-number change.

### 2.7 AI cost report and pricing model (15 Sep)
- **Data source: app's own call log priced at published rates** (you: "compute for app log"), no invoice reconciliation (report states it).
- **Include everything in two groups**: A product usage (per-user pricing basis); B one-off spend (marketing image generations, failures).
- **Target margin 80%** at first; later the model gave floors 50–90% and you picked **70%**.
- **Report location**: first "shareable page only"; later also Markdown in the UI folder root (internal; margins must not go into the client-facing repo), then HTML.
- **"Always in profit" definition**: every credit, spent on anything, at the cheapest price a credit is ever sold for, must clear the floor — plus several margins written out and one suggested using fixed monthly costs estimated from published plan prices.
- **Price on the current (expensive) image model**, show the cheaper model as upside. Why: prices must hold whatever the quality A/B decides.
- **One look renders automatically; the second on tap** (paid). Why: halves image cost per match, keeps the reveal.
- **3D: one tier at true cost** (Standard and High sent identical engine settings).
- **Safety allowance 25%** (you chose over 15%) for free re-renders, failed billed calls, refused photos, unexplained engine credits.
- **Lever: keep plan and pack prices; re-price features in credits.** Why: no price-list change on the landing page.
- **Free tier: keep it, cap the leaks.**
- **Resulting 70% config**: match 6 credits (first look drawn), second look 5, swap re-render 5, refine 1, detection 1 after 10 free, packing 3, 3D avatar 18 (one tier), starter credits 18, photo checks 10/day, yearly Pro 1,000 credits/year and Plus 300/year (so no credit sells below Pro's per-credit price), admin render rate corrected.
- **Money shown only in dollars**, e.g. $0.15, never cents (you: "dont write in ¢ its confusing only in $").
- **Part 9 plain-language explanation "as if to a 15-year-old" with visuals.**
- 40% explored and rejected ("leave it lets keep 70%").

### 2.8 70% pricing implementation (5+ questions, 15 Sep)
- **Code defaults + staging config row** (one-off script), and a reprice step added to the cutover script. Why: production starts on the right prices at cutover; staging switches today.
- **Second look UI**: "as suggested in the report" → pieces collage + "See it on you · 5 credits". Also replaced a silent auto-render on the outfit screen that would have been a hidden charge.
- **Remove Standard 3D completely** from app, admin, config key and labels; one "3D avatar · 18 credits"; outfit surcharge gone.
- **Yearly credits granted all at once at purchase.**
- **Starter credits 18 for new accounts only; demo reset seeds 18**; existing accounts untouched.
- **Photo checks 10/day for everyone, editable in admin.**
- **Landing page**: rewrite credits FAQ from live config AND add a "What credits buy" table ("1 + 2").
- **Migration 014** (flag on looks for first/second look; users table default starter credits).
- Admin "flag users who spend more than N credits a day" threshold 40 → 240 (same meaning at new prices) — changed without a question, announced.
- **Two commits**: landing site first, pricing second, each reviewable on its own.

### 2.9 Affiliate links (15 Sep, parked)
- Outbound shop links: fastest path is an auto-affiliate service (Sovrn Commerce or Skimlinks): one account, links rewritten automatically; a few hours to wrap outbound links server-side and show clicks/estimated commission in admin. Every product already had an `affiliateUrl` field and outbound click tracking.
- Inbound referral links for creators: buy (Rewardful/Tolt/FirstPromoter once Stripe is live) or build an Affiliates admin section using the referral source already carried into sign-up.
- Recommendation: auto-affiliate for shop links (can go in before launch), referral programme built in-house with the Stripe work; no separate app needed. You liked it and parked it for later.

### 2.10 "Finish this round, then next batch" (16 Sep)
Claude recommended completing the in-flight round instead of merging with the next batch: staging was half-changed (migration applied, old code deployed), work was green, the next batch touched other files, smaller pushes are easier to retest/undo. You accepted by letting it run.

### 2.11 Admin round (push A) and product round (push B) — ~50 questions (16 Sep)
**Admin (push A):**
- Admin alerts go **only to an admin panel Notifications section** (never the user app). Why: you, as a user with an admin email, were receiving AI budget alerts.
- Events: AI budget 80%/100% + engine wallet low; new support ticket + user report; payments and plans. (Failures/abuse not selected.)
- Notifications UI: nav badge, newest first, mark read, "mark all read", pruned after 90 days.
- **OTP lock on everything that changes what users pay or get** (all credit prices/caps, plans, packs, AI models; later budget bands, provider prices, fixed costs). Reading stays open.
- Code emailed via the existing admin 2FA path (Resend), 6 digits, valid 10 min, 5 wrong guesses = 1-hour lockout; **15-minute unlock window**.
- **Only the owner address (ADMIN_EMAIL) can unlock** (you chose this over "any admin with own code"). Trade-off: nobody else can change prices when the owner is away.
- **Audit trail**: who, when, old, new; shown in Notifications and on each field.
- **Broadcast history**: text, audience, sender, time, devices targeted, delivered, failed, "send again"; audiences all / by plan / inactive N days / one account.
- **Real cost per AI call from stored token counts at provider prices** (typed per-call rates removed). Provider prices editable in config behind the lock, seeded with published prices.
- **Profitability page** off the dashboard: month selector, revenue (labelled "simulated" until Stripe), real AI cost by feature, editable fixed-cost list, profit/margin, per-feature cost vs credit price, top-cost users, plus a "How this is calculated" panel with plain-language visuals ("easy for even a 15 years old to understand").
- Alerts when a feature's real cost passes 30% of its credit price or a user's month exceeds what they paid.
- Monthly Gemini budget kept with 80/100% alerts on real cost.
- Dashboard: remove "Margin · this month"; keep AI-calls chart; move Giveaways to Profitability as a cost line valued at real AI cost.
- **One push with everything** (you chose over two pushes).
- **Emergency key** (`ADMIN_SESSION_SECRET` raw cookie used by tests): your answer got cut off; Claude applied its stated default: still allowed to save locked settings, but every such save is audited as "environment key" and raises an "Emergency key used" alert. Why: whoever holds that secret can already deploy code; alternatives (lock it with test-mode DB code read; make it read-only) offered and left open.

**Product (push B):**
- **Budget bands $ / $$ / $$$ / No limit**, one admin-editable set (Monetize, locked) shared by Preferences, match screen, swap ranking and shop; thresholds $ under $50, $$ $50–150, $$$ over $150 (unified two conflicting internal scales). Match screen defaults to saved preference, changeable per match. **Advisory to the AI** (you chose "tell the AI the money range, send all products" over filtering).
- **Yearly**: no top-up for past test purchases; Manage subscription says "1,000 credits for the year, added when you paid · renews on <date>"; unused credits carry over and a fresh allowance is added on renewal; cancel keeps credits and features until paid year ends; switching plans grants the new plan's full allowance and keeps old balance.
- **Accessory wearability**: detection records a waist fact (belt loops / elastic or drawstring / no visible waistband); matching AI sees construction facts + hard rule "belt only with belt loops"; lazy backfill of old items on first use in a match; server-side removal of impossible belts and exclusion from swaps. You chose "Option 1 plus option 3": also collar (ties), buttons/suspender compatibility and a jewelry rule.
- **Onboarding trim**: keep pronoun/who you dress for, styles and occasions, budget band, avatar photos (skippable). Remove sizes everywhere; remove body measurements and delete values; remove body type and skin tone; remove fit preference; keep colours liked/avoided in Preferences and pass them to the stylist as clear fields; favourite brands passed to the stylist ("so it understands user style preferences"). Two screens (Your style → Your photo) **plus a 3D intro screen showing the persona matching the pronoun** (Sasha for she, Marcus for he, otherwise alternate) replacing the placeholder; stored removed fields deleted from every profile and from data export; Preferences = onboarding fields + optional "More about your style"; packing lists also use the profile; skipped photo → **persistent Home card until a photo is added** (you chose over one gentle ask); privacy screen, consents, export and landing page privacy section all updated in the same push.
- **Two pushes consecutively, not a day apart**, and in Opus (to protect the weekly limit).

### 2.12 Batch 3 (15+ questions, 16 Sep)
- **Admin Style & Categories lists drive the app everywhere they appear** (colours, occasions, style tags, seasons & weather, pronouns, who you dress for) — onboarding, Preferences, match and item screens, stylist wording. Clarified by you: only these lists must take effect; whatever else the stylist uses can stay as is.
- **Removing an option hides it from new choices but keeps it on existing profiles.**
- **Any pronoun other than she/he draws a gender-neutral person** (you chose this over an admin "draw as" field).
- **Delete unused lists**: Budget levels (superseded by $ bands in Monetize), Fit types, AI matching labels (nothing read them; you asked "will I be wrong?" — Claude confirmed not).
- **One sign-in method per email, both directions**: Google-email trying email sign-up/login/forgot → stopped before any code is sent, "This email signs in with Google" + Continue with Google; password account tapping Google → back to email login "This email signs in with a password". Existing accounts with both keep the method they joined with; the other is disabled; told on next sign-in. Also closed a gap where Google sign-in could mark someone else's unconfirmed password account as verified.
- **Shared looks**: hide "pieces to buy" **only for receivers** (friends and public link; you changed your answer from "every share view").
- **Sharing an undrawn look 2 draws it free, for everyone including the sharer** (you chose this after Claude explained the loophole and that shared matches then earn ~61% instead of 70%).
- **Copy link / Share to…**: link starts creating when the share sheet opens; both buttons show a spinner until ready, then act instantly inside the tap; link shown in a press-and-hold box as fallback; "Link copied" only when copy truly succeeded. Why: phones only allow clipboard/share within a user gesture; waiting on the server first broke it.
- **Suspended accounts**: every request gets a clear "suspended" answer (403) — no demo wording; app signs out and shows "Your account has been suspended…" modal with the support email (tappable mail link); detected within a few minutes even when idle (the app's existing account refresh every few minutes and on foreground — you asked whether "only when they tap" is better for performance; Claude explained cost is negligible); suspending in admin ends server sessions at once; every way back in (password, Google, code, reset, sign-up with that email) shows the same modal. Known limit: a different email can still sign up (blocking needs device tracking — a separate privacy decision).
- **Admin dashboard charts**: line chart of AI cost per day since the 1st with month-to-date total; pie chart of calls by type this month.
- **Home**: Recent generations moved to the very bottom.
- **One push with full tests and review** (up to two fix rounds).

### 2.13 Render layering fix (6 questions, 17 Sep)
- **No two "base" tops together** (tees, long-sleeve tees, polos, tanks, shirts worn as main top); open layers over a base allowed (jacket, blazer, cardigan, open overshirt, sweater over shirt).
- **Server removes the extra top before save/draw** (keep the anchor piece, else an owned piece over a shop piece, else first listed). Why: guaranteed, costs nothing.
- **Allowed layers drawn with explicit layer order** (base/mid/outer) and what stays visible (collar, cuffs); short sleeve never over long sleeve; post-render check fails merged/wrong-order layers → free redraw.
- **Avatar photo used only for face, hair, body and pose**; watch, jewelry, bag, hat, glasses, belt worn in the photo removed unless in the outfit; post-render check flags stray accessories → free redraw. Trade-off: people who always wear glasses are drawn without them unless glasses are an outfit item.
- **Ship as its own small push straight after batch 3.** Why: batch 3 was mid-test and touched the same prompt files.
- **Targeted testing only**: typecheck + unit tests + only match/render (and swaps) e2e specs + one real render on staging; full suite left to CI.

### 2.14 Chat archive and replication guide (17 Sep)
- **Archive every chat since inception** as readable, secret-masked Markdown outside git; refresh after each batch.
- **Replication guide** after batch 3, preceded by ≥15 questions. Answers:
  1. Main reader: you, to build a new app with the same stack and milestones (wireframes standalone HTML → UI standalone HTML → full-stack frontend → backend → payments), handing all tokens/authorisations to a Claude session.
  2. Playbook first, Assemble as examples; include your prompts and the way you talked to Claude, all security measures, e2e testing, workflows, CLI, repeatable prompts.
  3. Prompts: combination of template library with [placeholders] and your original messages.
  4. Tokens: setup checklists, no real values.
  5. Milestones: pre-build (brand/logo/coming-soon/3D), wireframes → UI → full-stack → backend, payments and cutover, growth (landing, pricing, AI cost model, marketing).
  6. Format: folder of Markdown files.
  7. Templates folder plus general code; keep updating until step 3 is done and the project is finalised.
  8. Pitfalls box per milestone + master list.
  9. "Running the sessions" chapter (models, limits, durations, compaction, resuming).
  10. **Leave costs out.**
  11. Exact versions plus why each choice.
  12. Full testing method plus real commands and specs.
  13. Location: Project History folder, outside git.
  14. Name "Assemble", **don't name the client**, no personal assets.
  15. Build via workflow over the chat archive, then synthesis.
  16. Style: works for both a low-tech human (numbered steps, checklists, "why", terms explained) and Claude (clearly marked paste-ready blocks).
  - Models: "split it, readers on opus writers and checker on fable".
- Planned file list: `00-index.md`, `01-running-the-sessions.md`, `02-how-we-work.md`, `03-services-setup.md`, `04-tech-stack.md`, `10-prebuild.md` … `16-growth.md`, `20-security.md`, `21-testing.md`, `30-prompt-library.md`, `40-pitfalls-master-list.md`, `templates\` (CLAUDE.md with standing rules, workflow script, CI config, Playwright with mocked AI, secrets scanner, chat export script, `.env.example` files).

---

## 3. Reusable user prompts

Each entry: original message (lightly cleaned), date, what it achieved, and a generalised template.

### 3.1 Client handover checklist
> "can you create an md file that will step by step insturction on how to for the client to be able to provide us everything we need form him. given that the github stay ours."

12 Sep 23:44. Produced a committed checklist with ownership split, per-service steps with links, safe key handover and what happens after.
Template: `Create a Markdown file with step-by-step instructions (with links) for [the client] to provide everything we need to launch [app]: accounts, keys, domain, legal text, store accounts, payments. [GitHub/hosting/CI] stay ours. Include who owns what and why, a checklist table with when each item is needed, and a safe way to hand over keys.`

### 3.2 Security checklist review with question round
> "i got to know a few thing and i am not sure what and why they are needed but the developer who suggested said these are very important, can you tell me if we have these in place or do we even need them?
> 1. Hide API keys 2. Enable RLS 3. Test IDOR attacks 4. Scan GIT secrets 5. Lock admin routes 6. Test user isolation 7. Rate limit APIs 8. Lock storage buckets 9. Validate all inputs 10. Block unauthenticated routes 11. Test SQL Injection 12. Remove sensitive logs 13. Block field tampering 14. Restrict file uploads 15. Secure server logic 16. Trim API responses 17. Secure auth sessions 18. Scan dependencies 19. Test record access 20. Attack your own app
> Before we proceed, ask me at least 25 questions so you can fully understand what I'm trying to achieve. Ask the questions one at a time, and for each question, give me multiple-choice options to choose from. Clearly highlight the option you recommend and briefly explain why. Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf."

12 Sep 23:51. Drove a 25-question round, a plan with trade-offs, and one shipped security push with attack tests, scans and SECURITY.md.
Template: `Here is a security checklist: [list]. Tell me for each item whether we already have it, whether it applies to our stack, and what's missing. Before we proceed, ask me at least [N] questions … [standard question-round block]`

### 3.3 The standard question-round block (used in nearly every request)
> "Before we proceed, ask me at least 25 questions so you can fully understand what I'm trying to achieve. Ask the questions one at a time, and for each question, give me multiple-choice options to choose from. Clearly highlight the option you recommend and briefly explain why. Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf."

Used 12 Sep (security), 13 Sep (landing), 14 Sep (landing round 2), 15 Sep (report follow-up, pricing implementation, ring logo), 16 Sep (admin/budget/yearly/belt/onboarding batch, batch 3), 17 Sep (render fix, replication guide). The number scales with size: 5 for small fixes, 15 for medium, 20–25 for large rounds. Result: decisions captured before any code; each option has a recommendation and a reason; a final summary with trade-offs and a "Build it as summarised?" confirmation.
Template: `Before we proceed, ask me at least [5/15/25] questions so you can fully understand what I'm trying to achieve. Ask the questions one at a time, and for each question, give me multiple-choice options to choose from. Clearly highlight the option you recommend and briefly explain why. Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf.`

### 3.4 Fix-until-clean loop
> "in the scan and attacks you find any problem then fix it and verify again and repeat until its perfect"

13 Sep 00:18 (answer to "Change something first"). Turned the plan into a loop: run scans/attack suite → fix → re-run → until green. Found three real anonymous-access gaps.
Template: `If the scans or tests find any problem, fix it, verify again, and repeat until everything is clean. Don't push until then.`

### 3.5 Model switch continuation
> "model changed continue."

13 Sep 01:36. After a usage-limit stop, Claude assessed surviving partial work rather than restarting agents.
Template: `Model changed. Continue: first check what the interrupted agents already finished, then resume only what's left.`

### 3.6 Status check
> "all done? anything left now except for stripe?"

13 Sep 01:56. Got an honest "not yet" plus a full remaining list split into ours / waiting on you / deliberately later.
Template: `Are we done? What is left apart from [known later item]? Split it into: still running, waiting on me, deliberately later.`

### 3.7 Small rename with side-effects
> "can we change the demo profile name from [the client's name] to demo user ?" (client name masked)

13 Sep 11:27. Claude searched everywhere the name lives (DB, reset script, login page, docs) before changing it.
Template: `Change [demo/test identity] from [old] to [new] everywhere, including anything that recreates it (seeds, nightly resets, production cutover).`

### 3.8 Landing page kickoff
> "lets dicsuss what can we do with the coming soon page so that its also approriate I mean we are like almost ready to lauch and maybe we can introduce the app there add some screenshot and etc and show app features and hel people visualise features? [question-round block, 25]"

13 Sep 19:58. Started the 25-question landing page design.
Template: `Let's discuss turning our [coming-soon page] into a launch page that introduces [app], shows real screenshots and features, and helps visitors picture using it. [question-round block, 25]`

### 3.9 Clarifying the concept mid-round (free-text answer)
> "so basiclly make this design for like everything is launched up and ready for user to install. consider everything we have build so far in backend stage (step 2 of our plan), even consider that step 3 payments is done too. we need to show this to the client for approval before the app is ready so that he can approve it or ask for changes and we are pre ready for this page . we will replace the coming soon page with this. also [the client] doesnt want his name on it. but he said its okay if we add our name as the development team [the client] hired to build his idea in a subtle way or like in a about page or something a small section with linkto our website deeplearnhq.tech. so that the main concept behind this implementation. got it? does that answer your question?"

13 Sep 20:07. Reframed the whole landing project; set naming and credit rules.
Template: `Design it as if everything is launched, including [payments]. We'll show it to [the client] for approval before the app is ready, then replace the [current page]. Don't use [the client]'s name; credit [agency] subtly in an About section linking to [agency site].`

### 3.10 Backup before replacing
> "option 1 i will go with your recomendation but for now using the staging link for the back and we will change this later when [the client] approves. and keep the coming soon page on a separate staging link so its backed up ."

13 Sep 20:12. Old page copied exactly to a separate project/link before any change.
Template: `Point the button at [staging URL] for now; we'll switch to [production URL] after approval. Back up the current [page] on a separate link first.`

### 3.11 Review feedback on a preview
> "afew images still cant be seen and 3d avatar should be facing front and marcus and sasha are not the stylist a an example of people using and promoting the app."

14 Sep 01:32. Triggered a copy rewrite, a "no stylist" build guard, and image fixes.
Template: `Preview feedback: [missing items], [orientation/visual fix], and [persona/positioning correction]. Apply everywhere, including the scripts that generate the assets.`

### 3.12 Conversion-quality upgrade
> "i topped up the gemini key, continue also i feel like you should take long form pictuires of pages do scrolling inside phone feels realistic and how can me make this even better , amazing with pizaz and fully make by a 10+ years experienced marketer who kows how to convert viewsers into users. [question-round block, 25]"

14 Sep 05:05. Drove round 2 (split hero animation, scrolling phones, 3D, sticky CTA, QR, install strip, FAQ objections, speed budget).
Template: `Continue. Make [page] better: long full-page screenshots scrolling inside the phone, more pizazz, written and structured like a marketer with 10+ years' experience converting visitors into users. [question-round block, 25]`

### 3.13 AI cost report
> "up to this point since we started makeing backend i want you to figure out our ai costing so make a report of it so that we can analyse how much ai will cost in this project like for detection and image genrateion and etc everything must be included and i am not taliking about ai cost to build this project but ai cost we paid to google and what it got us, similarily for the tripoo got it? generate a report to help us understand and set per user pricing for the packages"

15 Sep 15:15. Produced the multi-agent, cross-checked cost ledger.
Template: `Since we started the backend, work out what we've paid [AI providers] for the app's own AI usage (not the cost of building it) and what each call got us: [features]. Make a report that helps us set per-user pricing for [plans/packs].`

### 3.14 Always-in-profit pricing model
> "can you give this report in md file and one change i would like to make is that check online about how much tripo credits costs and then in the report at the end mention a pricing model that will ensure that the app is always in profit - obviously except for the free teir? [question-round block, 5]"

15 Sep 17:04.
Template: `Give me the report as a Markdown file too. Verify [provider]'s prices online, and add a pricing model at the end that keeps the app always in profit (free tier excepted), with several margin levels and one recommendation. [question-round block, 5]`

### 3.15 Money format correction (standing style rule)
> "dont write in ¢ its confusing only in $"

15 Sep 19:38. Every amount since then is written like $0.15; report file and page converted.
Template: `Write all money in dollars with decimals ($0.15), never in cents.`

### 3.16 Unit economics in plain terms
> "yes but before explain that when you say: What a credit costs the user: $0.15 at the cheapest (Pro) - can you also tell how much it costs assemble ? and explain like 1 credit uses by then he pays x $ and out which y$ is profit? getting what i m trying to ask?"

15 Sep 20:00.
Template: `For each [unit/credit/feature], show: what the user pays, what it costs us, and what we keep, in dollars.`

### 3.17 Explain like to a 15-year-old with visuals
> "at the end of the report explain that we have selected the 70% model and it will cost us and what it will cost user and etc but explain it as if you are explaining it to a 15 years old child with visual assets help. understood?"

15 Sep 20:10. Part 9 with five figures, checked by a number agent and a plain-language agent.
Template: `At the end, explain the option we chose ([model]) — what it costs us and the user — as if to a 15-year-old, with visuals.`

### 3.18 HTML version
> "can you make an html version of the report?"

15 Sep 20:33. Self-contained HTML; browser check found a chart bug.
Template: `Make a self-contained HTML version of [report] (no server needed), and check it in a browser.`

### 3.19 Implement pricing everywhere
> "now implement the 70% pricing in the app config and it is update everywhere in app . admin and landing page [question-round block, 5]"

15 Sep 20:42.
Template: `Implement [pricing model] in the app config so it's updated everywhere: app, admin and landing page. [question-round block, 5]`

### 3.20 Hard stop
> "stop"

15 Sep 20:47. Claude halted and confirmed nothing had been changed.
Template: `stop` (then later: `leave it, let's continue where we stopped`).

### 3.21 Hosting overview question
> "where is our bbackend and front end hosted?"

15 Sep 21:50. Clear map of projects, branches and services (section 5).
Template: `Where is everything hosted? List front end, backend, admin, previews, database branches, storage and third-party services.`

### 3.22 Bundled bug + feature request with scoped question rounds
> "i also tried to adding a pyjama/pants that cannot have a belt - meaning as no place for a belt to be used no notches - and when i saved and matched it showed me a belt worn on my pyjama/pants. [question-round block, 5]"
> "do we need so many onboarding questions like size waist etc etc are these used anywhere ? can we remove any? [question-round block, 15]"
> "remove margin this month from admin dashboard"

16 Sep 01:47 (part of one long batch message with five sub-requests, each with its own question count). Result: ~50 questions answered in one sitting, two consecutive pushes.
Template: `Batch: (1) [bug as observed] [question-round block, 5]; (2) [question about whether collected data is used anywhere, can we remove it] [question-round block, 15]; (3) [one-line direct change, no questions].`

### 3.23 Hold until the next batch
> "for next batch i want you to first wait" / "and when its complete dont run and task i will give you new next batch"

16 Sep 00:09–00:10. Claude finished only the agreed round, then stopped.
Template: `Finish only what's already agreed. When it's done, report and start nothing new until I send the next batch.`

### 3.24 Model and limit planning
> "not a day apart but consecutively and before you start can we do this in opus?"
> "befor you start anyhting and it would perform perfectly becuase i dont think i have enough fable credits can you estimate? and also can we change mid way? is changing now better or mid way better?"
> (then pasted the Claude Code usage report: plan limits and session model usage)

16 Sep 02:44–02:47. Claude estimated batch size against the weekly limit and advised switching model before launching agents.
Template: `Before starting, estimate how much of my remaining [weekly limit] this batch will use on [model A] vs [model B]. Can we switch mid-way, or is it better now? Here's my usage report: [paste].`

### 3.25 ETA and failure handling
> "whats the total eta in one line?" / "how much time left in total and any faild task will be done again?"

16 Sep. One-line ETA; confirmation that failed steps resume from where they stopped without redoing finished ones.
Template: `Total ETA in one line? And will any failed step be retried automatically?`

### 3.26 Batch 3 — multiple observed issues from phone testing
> "I tried changing the style and categories from the admin like i added style tag and i removed a pronoun but it didn't reflect/change on the app.
> also i logged in with gmail with my account and then i created a new account with the same email i recieved an otp code and it started the onboarding process but on dashboard i could see that this is not a new account. how can we handle this so that users are informed that they have already google connected or connect google and if thats done that they cannot create sign in or sign up with email. only one gateway should be allowed.
> when outfit 2d or 3d is share with friend or on the link - it shows pieces 4 to buy. I don't want receivers or sharer to see that . also when a link is made and i click on copy link - it doesnt copies to clipborad.
> I suspended an account and then since it was already open I tried genrating a match and it said your loged out and login with account or demo account. it shouldnt mention demo accounts, it should say that account is suspended and logout user automatically and say that account is suspended also when user tried to login again he should see his account is suspended in pop up/modal and ask to email admin at [support email]
> in the admin for ai call in dashboard there is a line graphg on top of a bar graph. can we make it so the line graph is seperate and instead of bar grapgh that data is shown in a pie chart and both not for last 14 days but since 1st of the month (this month only)
> on uers home page i want the recent generation section to go at the bottom after all buttons like my closet and friends and shared looks. got it
> [question-round block, 15]"

16 Sep 21:58. Became batch 3 (ddc5496).
Template: `From phone testing: (1) [admin setting doesn't reach the app]; (2) [auth edge case + desired rule]; (3) [sharing privacy + broken button]; (4) [account state messaging + desired modal/contact]; (5) [chart change + date range]; (6) [layout order]. [question-round block, 15]`

### 3.27 Asking to re-ask / simplify a question
> "can you re ask this question but first re ask the last question again, i would like to change my answer"
> "could youre ask question in simpler words"
> "what do u mean by : When a shared look has no drawn picture yet,?"

16 Sep. Claude re-asked in order and in plainer words; decisions changed accordingly.
Template: `Re-ask the previous question first — I want to change my answer — then ask this one again in simpler words.`

### 3.28 Context worry
> "what will we do if context is at 100%, is that a problem?"

17 Sep 00:09. Explained compaction and file-based persistence.

### 3.29 Save everything
> "it would be ideal if you to save every thing we have discussed ever in this chat regarding assemble. are we already doing that?" → "i dont mean just today i mean for ever since inception of this session."

17 Sep 00:16–00:17. Produced the full readable, masked chat archive.
Template: `Save everything we've ever discussed about [project] since the very first session as readable files outside git, with secrets masked. Keep it refreshed after each batch.`

### 3.30 Replication guide request
> "yes i want to do this after step 3 and make this so detailed so that it also include all things like how we used resend , vercel , ai part, 3d etc etc and how we tested and our pyramind verification and tech stack and i mean everything so that with this document anyone can replicate evrything with a claude code seeion like we have done. dont start now keep this in back of you mind as a task to do? what do you say?"
> "how about Before we proceed after batch 3, ask me at least 15 questions …"

17 Sep 00:23–00:25. Saved as a pending memory task with a question round first.
Template: `After [milestone], write an exhaustive guide so anyone can rebuild [project] with a Claude Code session: services and how each was wired, AI, 3D, testing and verification pyramid, tech stack, everything. Don't start now; keep it as a pending task. Before starting, ask me at least 15 questions [block].`

### 3.31 Targeted fix without the long suite
> "i want to discuss a render that ai stylist made. it used an tshirt halfsleevs on top of a long sleeve one and both of them didnt render properly. how can we fix this? and dont play the whole 2.5 hour long suite . [question-round block, 5]"
> (answer to the testing question) "ye i will go with option 1 and also i noticed that i had a watch in my 2d avatar and now the rendered looks shows that watch without it being a part of the outfit. how can we fix that too?"

17 Sep 01:59–02:06. Small push db4225c with targeted tests + one real paid render check.
Template: `I want to discuss [AI output problem]. How can we fix it? Don't run the full [N]-hour suite: targeted tests plus one real check on staging. [question-round block, 5]`

### 3.32 Start the guide questions / model split
> "start the replication guide questions."
> "split it, readers on opus writers and checker on fable, go"

17 Sep 16:10 and 16:34.
Template: `Start the [guide] questions.` / `Split the models: readers/extractors on [cheaper model], writers and checker on [stronger model]. Go.`

### 3.33 Credit wording that feels like ownership (style correction)
> "designed and built by deeplearnhq feel like it our project and the client might not aprove so we have to word it in a way the client doesnt fell like us claiming ownership of assemble"

13 Sep 21:13. Led to "Development partner: Deep Learn HQ".
Template: `Reword our credit so it reads as a hired development partner, not an owner of [client's product].`

---

## 4. Working method

### 4.1 Question rounds
- Every non-trivial request ends with the question-round block; Claude asks one question at a time via a multiple-choice tool, each option with a one-line reason, one marked "(Recommended)".
- Question count scales with size (5 / 15 / 20–25). Several sub-requests in one message each get their own count; Claude ran them in sequence (admin 20 → budget 5 → yearly 5 → belt 5 → onboarding 15 ≈ 50 questions).
- Before asking, Claude sometimes investigates first so the questions fit reality (e.g. looked at the live coming-soon page; explained how admin money numbers worked; found that style chips were hard-coded).
- Free-text answers are common and often change the plan (e.g. the landing concept, "i want to change that so it renders that look too with no extra 5 credit charge"). Claude re-asks when an answer doesn't map ("1 and 4" when only three options existed), re-asks in simpler words on request, and re-asks earlier questions when you want to change an answer.
- "Dismissed" answers mean pause; Claude summarises decisions so far and what's still to ask, then waits.
- When a user choice carries legal/policy risk (presenting AI personas as real people, removing provider watermarks), Claude checks facts first (inspected a real API render for visible marks), explains the risk plainly, and offers a compliant option that keeps the desired look.
- When a choice has a money consequence (free look-2 render on share), Claude quantifies the margin impact and the loophole in plain words before accepting it.
- Every round ends with: decisions, trade-offs, and a final "Build it as summarised?" question (Yes / Yes with variant / Change something first).

### 4.2 Briefs and multi-agent workflows
- Claude writes briefs to the scratchpad before launching agents: common contract + per-workstream brief (e.g. `AGENT-SITE-COMMON.md`, `AGENT-SITE-BUILD.md`, `AGENT-SITE-ASSETS.md`, R2 versions; `AGENT-FIX-COMMON.md` for security; `AGENT-BATCH2-COMMON.md`, `AGENT-PUSH-A.md`, `AGENT-PUSH-B.md`, `AGENT-BATCH3.md`).
- Security round: three parallel workstreams (R1 sessions and limits, R2 validation/tampering/uploads, R3 attack tests/scans/docs), then Claude ran the fix loop and full bar.
- Landing page: two parallel workstreams (SITE-BUILD, SITE-ASSETS); Claude relays results between them (e.g. which long screens exist, which are one screen tall, stale slots).
- Pricing round: phase 1 data (schema, migration, defaults, seeds, cutover script, docs) → four parallel builders (app API, app screens, admin, landing site) → tests agent (full ladder) → reviewer.
- Push A / Push B / Batch 3: workflow script with phases **data → parallel build against a fixed API contract → tests → adversarial review → fix loop (up to two rounds) → second review**.
- AI cost report: workflow of three compute agents (cost model, charging rules from code, usage profiles) → verification → pricing → critique; nine agents in total with four independent re-checks; later three verifiers for the pricing arithmetic and Tripo pages; conversion agent + checker agent for the cents→dollars change; number tie-back + plain-language checkers for Part 9.
- Replication guide: readers per chat period + a repo reader (on Opus) → chapter writers + completeness checker (on the stronger model).
- Small fixes (render layering) are done directly by Claude without a workflow.
- Claude keeps a "private list of what I need next" and explicitly says when nothing independent can be started (everything waiting on running work), instead of polling.

### 4.3 Adversarial review and fix loops
- The reviewer's job is to find what would ship wrong (e.g. a locked key writable without a code; a code emailed anywhere but the owner; numbers disagreeing with the report's method; leftover old UI).
- Push A: 13 defects → fix pass (code agent + docs agent) → full suite → second review checking each defect individually.
- Push B: 6 defects → same loop.
- Batch 3: 4 defects → fixed → second review clean.

### 4.4 Verification pyramid (the "test bar")
1. Typecheck (all apps).
2. Unit tests (vitest), including gate tests: route inventory (every API route either needs a session or is on the public allow-list), SQL scan (no raw SQL built from strings), secrets scan, log scrubber, locked-key list, cost helper.
3. Builds (web, admin, site).
4. Full e2e (Playwright) against the real staging/CI Neon database with mocked AI engines, **one worker**.
5. Security scans: `security:secrets` and `security:audit`.
6. Commit (no AI attribution) → push.
7. CI on GitHub Actions against the Neon `ci-backend` branch (full suite again).
8. Staging deploy watched (and triggered manually via the Vercel API if it didn't start).
9. Live staging pass: a script of checks against the deployed URLs (e.g. 19 checks after the security push).
10. Demo reset if tests mutated it.
11. Phone retest guide for you (numbered steps with expected results).

Targeted variant (render fix): typecheck → targeted unit tests → full unit → only the relevant e2e specs → push → one real paid render on staging → clean up test data; full suite left to CI.

### 4.5 Commit and push rules
- Backend repo must contain zero AI/Claude attribution (commit messages, docs, comments, tests); commits authored as your GitHub identity. An attribution grep runs before commit.
- Secrets scan runs on the staged tree before commit.
- Before committing site work: check no generated site output (`out/`) or marketing credentials (`tools/marketing/out/credentials.txt`) are staged.
- Split commits for independent reviewability (launch site f275190, then pricing c177626).
- Push with the PAT in the URL form `https://x-access-token:<GITHUB_PAT>@github.com/<owner>/<repo>.git`.

### 4.6 Staging-only rules
- Nothing changes in the front-end repo; assemble.ink stays on the front-end project until explicit cutover.
- Backend work stays on staging; migrations applied to staging and `ci-backend` only; production branch untouched; cutover only on explicit instruction.
- Never run `neon env pull` (it rotated credentials and broke CI secrets before).
- Tests never call real Gemini/Tripo (`GEMINI_MOCK=1`, `TRIPO_MOCK=1`).
- Real paid calls on staging only when agreed (e.g. one render at about $0.17).
- Marketing accounts must never use the `@test.local` domain (teardown deletes `%@test.local`).
- Landing preview deployed to a separate noindex project, not git-linked; production domain moves only after client approval and live payments.

### 4.7 Handling interruptions
- "[Request interrupted by user]" → Claude holds, lists what it captured, starts nothing.
- "stop" → halt, confirm nothing changed.
- Usage limit hit mid-build → after model switch, assess what partial work survived (typecheck, unit tests, migrations applied) rather than relaunching from scratch.
- Network/DNS outages (several times) → diagnose as outage (ENOTFOUND, many failures in under a second), wait for connectivity, re-run or resume the workflow from the failed phase (finished agents replay from cache).
- Overnight gap / answer cut off → Claude applies its stated default and tells you clearly what it assumed and how to change it.
- Claude Code's own OAuth token expired mid-message → you re-sent the message.
- Context compaction twice in scope → session continued from a structured summary; memory files and briefs hold decisions; workflows resumable by run id.

### 4.8 Communication style
- Reports start with the result, then "what changed", "verification", "phone retest", "for your awareness".
- Plain English, no cents, dollars with decimals.
- ETAs broken into phases (build, e2e, review, commit/CI/deploy, live check).
- Claude recommends finishing a green, half-deployed round before starting the next batch.
- Separate out-of-scope issues are flagged as background task chips you can start or dismiss (E2E products visible in staging shop; 3D viewer side-on; account deletion leaving storage files + "within 30 days" copy; app American English switch).

### 4.9 Memory and persistence
- Memory notes per topic (project progress log, AI cost report, money in dollars, batch 2 decisions, batch 3 decisions, chat archive, replication guide task, render layering fix) indexed in MEMORY.md.
- Repo docs kept current: `LAUNCH-READINESS.md` (rows tied to tests; sections added per round), `CUTOVER-RUNBOOK.md`, `SECURITY.md`, `SECURITY-SUMMARY.md`, `CLIENT-HANDOVER-CHECKLIST.md`.
- Chat archive refreshed after each batch.

---

## 5. Services and access

(No secret values. Placeholders only.)

### GitHub
- Backend repo `<GITHUB_OWNER>/<BACKEND_REPO>` (private), branch `main`; every push deploys staging app and admin via Vercel's Git integration and runs CI on GitHub Actions.
- Access: a classic Personal Access Token given in chat. **13 Sep 00:17–00:58**: you added the `workflow` scope (GitHub → Settings → Developer settings → Tokens → tick `workflow` → Update token; the token value stays the same) so Claude could edit `.github/workflows/*`.
- Stored: only in chat/session use; pushes via `https://x-access-token:<GITHUB_PAT>@github.com/...`.
- CI changes in the security round: concurrency group (`ci-backend`), secret scan step, dependency audit gate.
- **Dependabot** enabled on the repo (alerts + update PRs). Side effects: Dependabot runs appear on the same commit (don't confuse with CI), and Dependabot branches filled Vercel's build queue so `main` didn't auto-deploy.
- GitHub's built-in secret scanning not used (paid on private repos).

### Vercel
- Team `<VERCEL_TEAM_ID>` (SAML-protected team).
- Projects:
  - `assemble-site` → assemble.ink + www, deployed from the front-end repo (must not change until cutover).
  - `assemble-coming-soon-backup` → exact copy of the live coming-soon page (created 13 Sep before landing work). An older backup project didn't match what was live.
  - `assemble-site-preview` → new landing page preview, **not git-linked**, deployed by direct API upload of `apps/site/out` with `X-Robots-Tag: noindex, nofollow`.
  - `staging-app` → https://assemble-staging-app.vercel.app.
  - `staging-admin` → https://assemble-staging-admin.vercel.app.
- Token: a Vercel access token given in chat. **17 Sep 05:26: token stopped working** (Vercel asked for SAML sign-in again); Vercel auto-deployed that day, so nothing blocked; Claude asked for a fresh token. Pattern: verify with one API call before relying on it.
- Manual deploy trigger when `main` isn't picked up: `POST /v13/deployments` with `gitSource {type:"github", repoId:<REPO_ID>, ref:"main", sha:<SHA>}` for each project (used 16 Sep 01:28 and 13:23).
- Planned cutover: move assemble.ink/www domains from `assemble-site` to the new site project in Vercel (instant, no DNS change, reversible) after client approval + live payments. Firewall rules planned at cutover.
- Environment variables hold keys (e.g. `ADMIN_SESSION_SECRET`, Gemini key, etc.).

### Neon (Postgres + Object Storage)
- Project `<NEON_PROJECT_ID>` with branches: `staging` (used by the app; connection strings in `apps/web/.env.local` as `DATABASE_URL`/`DATABASE_URL_UNPOOLED`), `ci-backend` (tests/CI; `.env.ci-backend` at repo root, URL quoted → strip quotes when reading), `production` (untouched until cutover).
- Object Storage bucket `assemble` for photos, renders and 3D files (private user files proxied through the server; catalogue images public).
- Migrations in scope: 013 (admin sessions, code attempts, rate limits, user session version), 014 (pricing: look first/second flag, starter credits default), 015 (admin notifications, config audit, broadcasts, OTP state, real cost per call column with backfill), 016 (budget bands; removes sizes/measurements/body/skin/fit from profiles), 017 (users.auth_method, auth notice, delete unused taxonomy kinds, profile shape mapped to admin list text). All applied to staging + ci-backend only; production pending at cutover (005–017).
- Rule: never `neon env pull`.
- Neon MCP connector in the desktop app needed authentication and wasn't used.
- Pitfall: CI branch's config row had a different render model than staging; reset.

### Google Gemini API (AI Studio)
- Staging key in `apps/web/.env.local` (agency key with billing). Models in use: a flash text model for matching/detection/checks; a pro image model for renders; (cheaper flash image model considered as an A/B upside).
- **13–14 Sep: key ran out of prepaid credit** (429s; both models refused; all staging AI features broken, including the client's retests). Fix: top up prepaid credits in Google AI Studio → Billing. Verified afterwards with a live call to both models (200).
- API renders carry no visible sparkle watermark (consumer Gemini app images do); invisible SynthID left intact.
- Provider prices stored in admin config (locked) for real per-call cost.
- Production: client's own Google Cloud project with billing, key and budget alert (handover checklist).

### Tripo (3D avatars)
- Prepaid credits; 1 credit = $0.01; 60 credits per build at the app's settings; failed tasks not charged; each task's GET returns `consumed_credit` (can log real spend). New API accounts get 300 free credits. Verified online 15 Sep against official pages.
- Tests mocked with `TRIPO_MOCK=1`.
- Share GLBs: forward axis +X (not glTF +Z), up +Y; ~4 MB uncompressed → site uses compressed front-facing copies.

### Resend (email)
- Sends sign-in codes and support-ticket emails only (plus admin 2FA and the new admin OTP codes to `ADMIN_EMAIL`).
- Production: client's Resend with DNS records/domain verification (checklist).

### Google OAuth (sign in with Google)
- Staging redirect URI still needed from you (13 Sep status); production OAuth client in the client's account with two exact redirect URIs (checklist). Batch 3 added one-method-per-email rules and a refusal cookie `assemble-signin-refused` (5 min).

### PostHog
- Existing app project; landing site uses cookieless analytics (no consent banner), visit source carried into sign-up.

### Sentry
- Error monitor; `sendDefaultPii` off; scrubber strips emails/tokens/keys before sending (security round).

### Push notifications
- Broadcasts to devices; push A added history with real delivered/failed counts.

### Google Play / Apple Developer / Stripe
- Later items in the handover checklist; Play organisation and Apple Developer need a D-U-N-S number unless registering as an individual; Stripe with a restricted key. Payments still simulated in this scope; monthly credit top-up and yearly renewal rules deferred to Stripe work.

### Claude Code environment
- Desktop app on Windows; Browser pane used for visual checks (batches over 25 actions rejected → split); artifacts used to publish the private AI cost report page; many MCP connectors (Neon, GitHub, Slack, …) listed as needing auth but not needed.
- Claude Code's own login OAuth token expired once (16 Sep 21:49) → re-send message.

---

## 6. Commands and CLI

(Exact where shown in the chat; otherwise marked "described".)

### Tests
```bash
# Full e2e (real Neon DB, mocked AI), from backend repo root
E2E_DB=1 npx playwright test
# playwright.config.ts: workers: 1 everywhere; both dev servers started with --keepAliveTimeout 60000
# Before a run: kill leftover servers on ports 3000 (web) and 3001 (admin)
# Admin webServer env must include GEMINI_MOCK=1 (bug found 16 Sep: it called real Gemini)

# Targeted e2e (render fix, 17 Sep) — described: only the ai, render and swaps spec files
E2E_DB=1 npx playwright test <ai spec> <render spec> <swaps spec>
# result: 20 passed, 20 desktop project copies skipped

# Unit tests — described: vitest across the monorepo (339 → 392 → 379 → 448 → 456 over the scope)
npx vitest run
# Typecheck — described: turbo/tsc typecheck across apps
```

### Security scripts (backend repo)
```bash
npm run security:secrets   # tools/security/scan-secrets.mjs — scans working tree/staged files (409 files clean on 13 Sep); PLACEHOLDER regex whitelists public demo sentinel
npm run security:audit     # tools/security/audit.mjs — npm audit gate failing on high/critical, with a documented PostCSS exception expiring 2026-12-01
```
Plus a history scan of every commit (gitleaks was the proposed tool; the result reported no real secrets).
Attribution check before commit — described: grep the staged diff/commit message for AI attribution strings; must be empty.

### Cutover and config tools
```bash
node tools/cutover/config.mjs reprice   # writes the current pricing defaults into a config row (re-run 16 Sep when an old deployment re-added removed 3D keys)
node tools/cutover/verify.mjs           # verifies config (e.g. render model) — failed on ci-backend until render model reset
```

### Landing site assets and preview
```bash
# Capture long app screens / 3D screens for the marketing personas (staging only; lib.mjs has a staging guard)
node tools/marketing/capture-long.mjs sasha avatar3d
node tools/marketing/capture-long.mjs marcus avatar3d
# Other scripts in tools/marketing: stylists.mjs, accounts.mjs, wardrobe.mjs, avatar.mjs, looks.mjs, social.mjs,
# capture.mjs, rail.mjs, export.mjs, og.mjs (+ og.html), manifest.mjs; ledger.json records AI generations spent

# Deploy the static export to the noindex preview project (from backend repo root)
VT=<VERCEL_TOKEN> TEAM=<VERCEL_TEAM_ID> OUT="$(pwd)/apps/site/out" NAME=assemble-site-preview \
  node "<scratchpad>/site-deploy.mjs"
# site-deploy.mjs: walks OUT, uploads each file to POST /v2/files keyed by sha1, adds vercel.json
# {cleanUrls:true, headers:[{source:"/(.*)", headers:[{key:"X-Robots-Tag", value:"noindex, nofollow"}]}]},
# POST /v13/deployments?skipAutoDetectionConfirmation=1 with {name, target:"production", files,
# projectSettings:{framework:null, buildCommand:null, outputDirectory:null, installCommand:null}}, polls readyState.
```
Site dev port 3002, smoke server 3013 (`apps/site/tests/serve.mjs`); smoke tests `apps/site/tests/smoke/site.spec.ts`; `turbo.json` for the site: `out/**` outputs, no cache.

Before building the site: check no other session is running `next build`/`turbo build` (full turbo builds also build `apps/site`) and confirm `apps/site/out/index.html` is fresh.

### Speed and visual checks
- Lighthouse mobile (4G, mid-range phone) against the live preview: LCP ≤ 2.5 s, CLS < 0.1, TBT watched; laptop score. Described, not a literal command.
- Intro visibility verification script (`verify-intro.cjs`): headless browser at laptop size jumps to section, reads whether heading is on top and fully opaque, samples heading-area brightness at 0 ms, 300 ms, 1 s. Chained after deploy in one command.
- Copy check script (`verify-copy.cjs`): no British spelling, no "stylist", no client name, footer AI line, credit line, button text, noindex.

### Vercel API (manual staging deploy)
```bash
curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=<VERCEL_TEAM_ID>" \
  -H "Authorization: Bearer <VERCEL_TOKEN>" -H "Content-Type: application/json" \
  -d '{"name":"<project-name>","project":"<PROJECT_ID>","target":"production",
       "gitSource":{"type":"github","repoId":"<REPO_ID>","ref":"main","sha":"<COMMIT_SHA>"}}'
```
(Shape from the summary; exact invocation described.)

### Git
```bash
git add <paths>          # stage explicitly; never out/ or tools/marketing/out/
git commit -m "<message without AI attribution>"
git push https://x-access-token:<GITHUB_PAT>@github.com/<owner>/<repo>.git main
# Stale .git/index.lock (very old, no git process) → removed manually
```
CI watching: watch the "CI" workflow run by name for the commit (not the Dependabot run).

### Claude Code
- `/model claude-opus-5` — switch session model before launching a big workflow.
- Workflow tool with `resumeFromRunId` to resume from a failed phase (finished agents replayed from the journal `...\subagents\workflows\wf_*\journal.jsonl`).

### Chat export
```bash
node "D:\Documents\Deep Learn HQ\Clients\<client-folder>\Project History\export-history.mjs"
# reads Claude Code session transcripts (.jsonl) and writes readable, secret-masked Markdown per session into Project History\chats\
```

### Scripting lesson
- `node -e` with heredocs/template literals broke on quoting → write `.cjs`/`.mjs` files instead.
- A regex `/\\/g` for path separators broke → `split(sep).join("/")`.
- Python not available on the machine → use the Edit tool for edits.

---

## 7. Testing and verification

### Counts over the scope
| Push | Unit | E2E | Notes |
|---|---|---|---|
| Security round 6677cba (13 Sep) | 339/339 | 200 passed, 0 failed | + 19 live checks on staging; CI green |
| Demo rename 3ef8c33 (13 Sep) | 339 | 200 | both builds; CI green |
| Pricing c177626 + site f275190 (16 Sep) | 392/392 | 211 passed (36 min) | three builds; live check green |
| Push A d1e209d (16 Sep) | 379 | 222 passed | 13 review defects fixed + second review |
| Push B 0c1b0b4 (16 Sep) | — | 230 passed | 6 review defects fixed |
| Batch 3 ddc5496 (17 Sep) | 448/448 | 243 passed | 4 review defects fixed; secrets 0 hits |
| Render fix db4225c (17 Sep) | 456/456 (8 new) | targeted 20 passed | 1 real render on staging |
| Landing site round 1 | 25 unit, 12 smoke | — | visual check laptop/phone |

Full suite duration grew from ~40–60 min to "2.5 hours" by 17 Sep (your wording).

### Security tests added (attack suite kept as e2e)
- Cross-account reads and writes on items, looks, shares, avatars, tickets and public links (IDOR/user isolation/record access), using dedicated `prober` and `victim` accounts.
- Field tampering: plan, credits, verified, suspended, owner ids, tokens cannot be set.
- SQL injection payloads through names, notes, search, comments and admin fields; stored as plain text, nothing else changes.
- Storage isolation: stranger and other account get 401 on user photos/renders/avatar files; public files reachable.
- Public route allow-list (signed-out sweep of every API route) — found three real gaps.
- Spoofed Origin on state-changing calls → 403.
- Rate limits (e.g. password reset throttling returns the right refusal).
- Disguised uploads (content sniff).
- Cron routes with wrong/missing secret → 401.
- Admin panel shut without its cookie.
- Unit gates: route inventory, raw SQL scan, log scrubber.

### Live checks on staging after security push (examples)
Cross-site writes refused; plan and credits untouchable from a request; no password hash or other users' emails in responses; three browser headers served; scheduled jobs refuse wrong secrets; admin panel shut without cookie; password-reset throttling.

### Test isolation lessons (13 Sep)
- Attack suite must have dedicated accounts (it raced other specs over shared `buddy`/`storer` accounts' credits).
- Setup must satisfy preconditions (packing list needs a stocked closet, 4 items).
- Don't assert global emptiness on shared staging data (real sign-ups existed with a matching name) → assert the specific blocked username is absent.
- Renaming test accounts leaves stale references (shares addressed to old username).
- Teardown has a hardcoded account list → add new accounts to it; teardown clears `%@test.local`.
- Races between spec files on shared demo account → `workers: 1` locally, same as CI.

### Test accounts and mocks
- Test accounts `buddy`, `storer`, `changer`, `prober`, `victim` @test.local with a shared test password `<TEST_PASSWORD>`.
- Mocks: `GEMINI_MOCK=1`, `TRIPO_MOCK=1` on both web and admin test servers.
- Test DB: Neon `ci-backend` branch for CI and (from the security round's Q20 discussion) intended for local runs; the staging demo is reset after local runs that mutate it.

### Specific new tests by round
- Pricing: login screen empty with no demo wording; new account's first "Add item" goes to item detection, not avatar check; second look charged once; yearly grant.
- Push A: alert never reaches a user; 423 without a code; five wrong codes lock out; correct code unlocks and writes audit row; profitability totals; broadcast history; unit tests for cost helper and locked-key list.
- Landing: build fails if "stylist" appears; three visibility checks for intro heading; smoke tests for sections, pricing toggle, links, QR only on laptops, sticky bar on phones, 3D lazy loading, no sideways scroll, no broken images.
- Render fix: unit tests for two-base-tops removal, layer wording, photo-accessory removal instruction.

### Landing page verification
- Live copy checks (noindex, spelling, forbidden words, credit/AI lines, button).
- Layout checks at phone and laptop widths.
- Lighthouse mobile/laptop on the live link (not only local): LCP 2.1–2.4 s, CLS fixed, laptop 99; TBT differences between local (~210 ms) and live (~470 ms) noted honestly.
- Visual review of every generated image for resemblance to real people, visible marks, artefacts.

### Real-call verification
- Gemini top-up verified with live calls to both models.
- One real layered render on staging ($0.17) with the post-render check result reported, test look deleted afterwards.
- Watch removal not live-tested (no suitable photo) → explicit phone steps given.

---

## 8. Security

### Security round (commit 6677cba, 13 Sep) — mapped to the 20 items
1. **Hide API keys**: keys only in hosting env settings, never in code or browser; history scan clean.
2. **Enable RLS**: deliberately not applied; reasoning documented (no browser DB access; one server role; every query filters by signed-in account; isolation proven by tests).
3. **Test IDOR attacks**: automated cross-account e2e suite.
4. **Scan git secrets**: full history scan + scanner on every push (CI) + pre-commit scan of staged tree; rule: any leaked key rotated the same day.
5. **Lock admin routes**: all admin routes check the admin session; admin sessions server-side (revocable, "Log out everywhere"); 2FA codes limited to 5 guesses.
6. **Test user isolation**: e2e.
7. **Rate limit APIs**: DB-backed limits (`rate_limits` table) per account and per IP on sign-in, sign-up, codes, password reset, AI calls, uploads, public votes/comments, admin sign-in and 2FA; 429 with plain message.
8. **Lock storage buckets**: private bucket for user files served through server after sign-in; public catalogue images; test.
9. **Validate all inputs**: zod schema per writing route; unknown fields dropped.
10. **Block unauthenticated routes**: route inventory unit test with a public allow-list; three real gaps closed (ad view/click tracking, friends list, product "couldn't buy it" feedback) — all fed admin/brand-partner reporting.
11. **Test SQL injection**: parameterised queries; unit scan for string-built SQL; payload e2e. (Batch 3 hit this gate: `sql.raw` in the admin ai-spend route had to be fixed.)
12. **Remove sensitive logs**: no emails/tokens/keys/photo contents/full bodies; Sentry scrubbed, default PII off; scrubber unit test.
13. **Block field tampering**: schemas + tests for plan, credits, verified, suspended, ownership ids, tokens.
14. **Restrict file uploads**: sign-in + image type + real content sniff + re-encode stripping EXIF/GPS/camera metadata; no size cap (your choice).
15. **Secure server logic**: credits and charges computed server-side; cron routes constant-time secret compare; Origin check on state-changing calls (CSRF).
16. **Trim API responses**: no other users' emails/ids in social features, no hashes/codes/tokens/storage keys, no raw AI output/prompts, no stack traces/DB error text.
17. **Secure auth sessions**: admin server sessions + guess limits; users' session version bumped on password change or account delete (sign out other devices).
18. **Scan dependencies**: `npm audit` gate in CI + Dependabot; fixed critical Next.js RCE, drizzle-orm SQL-injection advisory, sharp; PostCSS nested exception expiring 1 Dec 2026.
19. **Test record access**: e2e.
20. **Attack your own app**: the attack suite runs on every push; external pen test deferred post-launch.
- Browser headers: X-Frame-Options DENY, Referrer-Policy, Permissions-Policy (camera only for us). HSTS listed in the options; final choice "three one-line headers, no CSP". CSP deferred.
- Documents: `SECURITY.md` (each of the 20 items in the developer's own wording → what the app does → where the proof lives) and `SECURITY-SUMMARY.md` (one page, plain words, includes the carried vulnerability).
- Known accepted exposure: demo entry kept live in production behind a hidden address with no extra guards (your choice).

### Later security-relevant changes
- **Demo credentials no longer prefilled** on login; demo accepted only when typed on staging; production never accepts the demo entry routes (per the 15 Sep message). Secret scanner whitelist gained the public demo sentinel so it isn't reported as a leak.
- **Admin OTP lock (push A)** on every setting that changes what users pay or get: 6-digit code emailed only to `ADMIN_EMAIL`, valid 10 min, 5 wrong guesses → 1-hour lockout, atomic attempts counter (fixed a race where simultaneous wrong guesses could exceed the limit), 15-min unlock window, HTTP 423 when locked, audit trail with who/when/old/new (fixed: audit rows had always named the owner's email; credit pack changes weren't audited).
- **Emergency key**: `ADMIN_SESSION_SECRET` (a hosting env var, used by tests to act as admin) can still save locked settings; every such change audited as "environment key" and raises "Emergency key used — locked settings changed". Alternatives offered (lock with test-mode code read; read-only).
- **Admin alerts removed from the customer app** (moved to admin Notifications).
- **Suspended accounts (batch 3)**: 403 `{code:"suspended"}` on every request; app-wide event triggers sign-out + modal; periodic refresh (every 3 minutes and on foreground); admin suspension ends server sessions immediately; all sign-in routes (password, Google, code, reset, sign-up) refuse with the suspended modal.
- **One sign-in method per email (batch 3)**: `users.auth_method`; refusal before sending codes (409 `use_google`); Google on password account refused; closed a gap where a Google sign-in could verify someone else's unconfirmed password account (unverified email sign-up now taken over by Google instead).
- **Share privacy (batch 3)**: shop pieces stripped from receiver views (`/api/s/[token]`, `/api/social/shares`).
- **Privacy data minimisation (push B)**: sizes, measurements, body type, skin tone, fit removed from collection and deleted from stored profiles and data export (migration 016); privacy policy, consents and landing page privacy section updated together.
- **Marketing credentials** kept in gitignored `tools/marketing/out/credentials.txt`, checked not staged before commit.
- **Landing preview** served with `X-Robots-Tag: noindex, nofollow`.
- **Key handover** via expiring secret links or phone (handover checklist).
- **AI disclosure/compliance**: personas not presented as real people; footer AI-generated line; provider watermarks not removed; no fake testimonials.
- **Chat archive** secrets masked (0 unmasked found).

---

## 9. Pitfalls

1. **Delete-account word check was case-sensitive**
   - Symptom: typing "Delete" and confirming did nothing; app kept working.
   - Cause: sheet only accepted "DELETE"; only feedback was an easy-to-miss toast; nothing sent to server.
   - Fix: accept any case, capitals keyboard hint, "Deleting…" state, server refusal explained in the sheet, reload to Welcome on success.
   - Prevent: confirmation inputs should be case-insensitive and always show inline feedback.

2. **Usage limit hit mid-build**
   - Symptom: "You've reached your [model] limit" while two workstreams were building.
   - Cause: weekly/session plan limit on the more expensive model.
   - Fix: switched model; assessed surviving partial work (typecheck, migration status, unit tests) and continued instead of relaunching.
   - Prevent: estimate batch size against the remaining weekly allowance before launching; switch model before launching agents (they inherit the model at launch).

3. **Nested dependency advisory can't be overridden**
   - Symptom: audit gate failed on PostCSS inside Next.js even after an override.
   - Cause: the framework pins its own nested copy; only a major upgrade moves it.
   - Fix: documented exception with an expiry date that fails the build afterwards.
   - Prevent: make exceptions explicit, dated and self-expiring rather than disabling the gate.

4. **SECURITY.md mapped the wrong list**
   - Symptom: document followed Claude's internal contract, not the developer's 20 items.
   - Fix: restructured around the requester's own wording; added the carried vulnerability to the summary.
   - Prevent: deliverables that answer someone's list must lead with that list verbatim.

5. **Attack suite shared accounts with other specs**
   - Symptom: IDOR/injection tests failed with 403s and credit races.
   - Cause: shared `buddy`/`storer` accounts; renames left stale share recipients; teardown list hardcoded.
   - Fix: dedicated `prober`/`victim` accounts, updated teardown, fixed stale username.
   - Prevent: each security spec owns its accounts; grep for old identifiers after renames.

6. **Test assumed staging data was empty**
   - Symptom: block test failed because a name search returned results.
   - Cause: real sign-ups on staging had the same name as the demo profile.
   - Fix: assert the specific blocked username is absent.
   - Prevent: never assert global emptiness on a shared database.

7. **Network/DNS outage looks like mass test failure**
   - Symptom: 12 failures, several under a second; 500s; ENOTFOUND to the DB host. Happened repeatedly (13, 14, 15, 16 Sep).
   - Cause: the development machine lost DNS/internet.
   - Fix: check connectivity; re-run or resume the workflow from the failed phase.
   - Prevent: when many tests fail instantly, check the network before debugging code; workflows should be resumable.

8. **Parallel spec files race over shared accounts**
   - Symptom: credits and render-results tests failed in full runs but passed alone.
   - Cause: two local workers vs one in CI; specs mutated the shared demo/storer accounts.
   - Fix: `workers: 1` locally too (≈10 min slower, trustworthy).
   - Prevent: match local worker count to CI when tests share state.

9. **Dependabot run mistaken for CI failure**
   - Symptom: "failure" on the commit right after push.
   - Cause: Dependabot's own update job failed.
   - Fix: watch the CI workflow run by name.
   - Prevent: filter runs by workflow name when watching CI.

10. **Demo reset restores the old identity**
    - Symptom (anticipated): renaming only in the DB would be undone nightly.
    - Fix: reset writes identity by fixed id; production renames on first reset after cutover (runbook note).
    - Prevent: change seeds/reset scripts, not only data.

11. **Background agent ends its turn while its own build runs**
    - Symptom: site agent stopped "expecting to be woken" after a build; no report came.
    - Cause: agent had no live background work of its own to wake it.
    - Fix: told it to wait in the foreground for its own chain and not end its turn before reporting.
    - Prevent: brief agents to run long builds in the foreground and report only when done.

12. **Gemini prepaid credit ran out**
    - Symptom: 429s on both models; all staging AI (match, render, detection, avatar check) broken for everyone including the client; image production stopped at 20/33.
    - Fix: you topped up in Google AI Studio; Claude verified with live calls; image work resumed without paying twice (ledger of generations).
    - Prevent: budget alerts; check key health before a big AI-generation job; keep a generation ledger.

13. **Pricing copy didn't match app behaviour**
    - Symptom: cards said "credits a month" but credits were granted once.
    - Fix: kept wording; monthly top-up assigned to Stripe work (and yearly later granted in full).
    - Prevent: have the marketing-page builder cross-check every claim against the code.

14. **Account deletion left storage files and wrong copy**
    - Symptom: rows deleted but photos/renders/avatars stayed; dialog said "within 30 days".
    - Fix: flagged as separate task.
    - Prevent: deletion tests should check storage, not just DB rows.

15. **"Invisible" section heading in screenshots**
    - Symptom: features intro looked blank in pane screenshots on laptops.
    - Cause: heavy blur glow repainting slowly after a long scroll (not hidden content).
    - Fix: cheap gradient instead of blur, pause off-screen animation, visibility smoke tests; verified by measurement (on top, opacity, brightness at 0/300/1000 ms) on the live link.
    - Prevent: verify visibility with measurements, not eyeballed screenshots; avoid big blur filters.

16. **Persona wording drift ("stylist")**
    - Symptom: personas called stylists against your intent; generator scripts would reintroduce it.
    - Fix: rewrite copy and scripts; build-failing test for the forbidden word.
    - Prevent: encode positioning rules as tests.

17. **Font swap layout shift**
    - Symptom: CLS 0.127 (> 0.1) on mobile.
    - Cause: fonts swapping pushed hero images down.
    - Fix: fixed-line hero text; reserve space.
    - Prevent: measure CLS on the live preview early.

18. **Main-thread busy after load (hydration)**
    - Symptom: ~470 ms blocking on phones live even after a speed pass (local ~210 ms).
    - Cause: 194 KB HTML incl. 111 KB second copy of the page for React to start.
    - Fix: speed pass (off-screen transitions, hero loop after load + idle, static HTML strings); full static-HTML rewrite deferred.
    - Prevent: for marketing pages, consider mostly static HTML with small islands from the start; trust live measurements over local.

19. **3D model files face sideways**
    - Symptom: app 3D viewer and captures showed avatars side-on.
    - Cause: share GLBs use +X forward, not glTF's +Z.
    - Fix: site uses its own compressed, rotated copies; app viewer fixed in a separate session; 3D phone step hidden until recapture.
    - Prevent: normalise orientation at export.

20. **British spelling inside captured screenshots**
    - Symptom: "COLOUR", "Grey", "trousers" in app screenshots on an American page.
    - Cause: app UI in British English; item names stored as data referenced by looks.
    - Fix: page copy switched; app American English task raised; recapture after the switch.
    - Prevent: decide target locale before generating demo/marketing data.

21. **Placeholder store names in screenshots**
    - Symptom: shop screenshot showed "ShopY", "BrandCo", "StoreX".
    - Fix: left as a decision for you.
    - Prevent: seed realistic but clearly fictional catalog before marketing captures.

22. **Two concurrent sessions building the same app**
    - Symptom: risk of other sessions' turbo builds overwriting `apps/site/out`.
    - Fix: check for running `next`/`turbo build` processes before building; confirm fresh `out/index.html` before testing/deploying.
    - Prevent: one build owner per output folder, or separate worktrees.

23. **Browser tool batch limit**
    - Symptom: browser batch with more than 25 actions rejected.
    - Fix: split batches.

24. **Inline Node scripts break on quoting**
    - Symptom: syntax errors in `node -e` with heredocs/template literals; a backslash regex broke.
    - Fix: write `.cjs`/`.mjs` files; use `split(sep).join("/")`.

25. **Chart bug with tiny values**
    - Symptom: smallest bars drawn with an invalid SVG path (`h--`), on both HTML and published page.
    - Fix: minimum bar width 6.
    - Prevent: open generated reports in a real browser before publishing.

26. **Half-deployed state if a round is abandoned**
    - Symptom: migration 014 applied to staging config while old code still deployed → users pay new prices for old behaviour.
    - Fix: finish and push the round.
    - Prevent: apply config/migrations close to the deploy; don't stop mid-round without rolling config back.

27. **Vercel doesn't auto-deploy main**
    - Symptom: CI green but no staging build for the commit.
    - Cause: Vercel's queue busy with Dependabot branch builds.
    - Fix: trigger deployments via `POST /v13/deployments` with `gitSource`.
    - Prevent: always check the deployment for the pushed SHA; consider ignoring Dependabot branches in Vercel.

28. **Old deployment re-adds removed config keys**
    - Symptom: staging config regained `a3dStdCost`/outfit surcharge after the change.
    - Cause: old code still running wrote defaults back.
    - Fix: re-ran `tools/cutover/config.mjs reprice` after the new code deployed.
    - Prevent: reprice after deploy, not only before.

29. **Silent auto-render would become a hidden charge**
    - Symptom (found during pricing work): outfit screen drew any picture-less look on open.
    - Fix: replaced with the explicit "See it on you · 5 credits" button.
    - Prevent: audit every automatic paid AI call when pricing changes.

30. **Camera context leaked from avatar flow into closet "Add item"**
    - Symptom: new account's garment photos refused as "no person in the photo".
    - Cause: camera context persisted between sessions/flows.
    - Fix: reset context at every "Add item" entry and stop persisting it; test that first "Add item" goes to item detection.

31. **Admin alerts delivered to a user account**
    - Symptom: you saw AI-cost alerts in the customer app.
    - Cause: alerts were in-app notifications to the admin's own user account.
    - Fix: admin Notifications section only.

32. **Push A review defects (13)**: profit counted giveaways twice; the free first-look render costed as a paid second look; pack price changes locked but not audited; concurrent wrong OTP guesses bypassing the limit; margin alerts only ran on page open and only for top 5; audit rows always named owner; broadcast delivery counts fabricated; legacy broadcast route sent without history; typed rate fields still in settings; budget alert wording still about estimates; user detail valued giveaways at pack prices; swap bucket mis-categorised; docs not updated.
    - Prevent: always run an adversarial review after tests pass; tests passing ≠ correct numbers.

33. **Push B review defects (6) + test-server leak**: two stale privacy lines listing removed data; old budget constants; refine from saved look used a stale budget; items with no garment facts re-described (paid) on every match; shop products lacked waist/collar/buttons facts so the belt rule missed them; admin-set budget bands not reaching shop page/filter/swap sheets. Also **admin test server wasn't using the fake AI engine**, so product tests called real Gemini.
    - Prevent: grep legal/privacy copy when removing data; ensure every test server gets the mock env; add "no real provider calls in tests" guard.

34. **CI branch config drift**
    - Symptom: `verify` failed on ci-backend.
    - Cause: CI DB render model pinned to a different model than staging.
    - Fix: reset to the staging model (CI only; tests never call the engine).

35. **Hard-coded chips ignoring admin lists**
    - Symptom: admin Style & Categories edits didn't reach the app.
    - Cause: chips typed into screens; stylist used its own word list.
    - Fix: batch 3 made lists live (`/api/config` refresh ~60 s); unused lists deleted.
    - Prevent: every admin-editable list needs a consumer test.

36. **Two sign-in methods on one email**
    - Symptom: Google user could start an email sign-up with OTP and onboarding for an existing account.
    - Fix: one method per email, both directions, migration of mixed accounts.

37. **Clipboard/share blocked on phones**
    - Symptom: "Copy link" didn't copy; "Share to…" could fail on iPhone.
    - Cause: awaited a server call before calling clipboard/share; phones require it within the tap gesture.
    - Fix: create the link when the sheet opens, spinner until ready, then act instantly; selectable fallback box; "Link copied" only on real success.

38. **Suspended user saw demo wording**
    - Symptom: "you're logged out, log in or use demo account".
    - Fix: 403 suspended code, modal with support email, periodic check, all routes refuse.

39. **Two base tops and photo accessories in renders**
    - Symptom: tee drawn over long-sleeve top badly; watch from avatar photo copied into renders.
    - Fix: rulebook + server removal + layer order in render prompt + post-render check; photo used only for face/hair/body/pose.

40. **SQL scan gate caught `sql.raw` in a new admin route** (batch 3)
    - Fix before commit.
    - Prevent: keep the gate; it works.

41. **Stale `.git/index.lock`**
    - Symptom: git refused operations; lock file ~2 days old with no git process.
    - Fix: removed the lock.

42. **Vercel token expired (SAML team)**
    - Symptom: API asks for SAML sign-in again.
    - Fix: request a fresh token; meanwhile rely on auto-deploy.
    - Prevent: verify token with one API call before depending on it; fall back to checking live URLs.

43. **Claude Code login OAuth token expired**
    - Symptom: "API Error: 401 OAuth access token has expired" on a user message.
    - Fix: re-authenticate / re-send the message.

44. **Answer cut off / overnight gap during a question**
    - Symptom: pending decision (emergency key) unanswered while work continued.
    - Fix: Claude applied the stated default and reported it clearly in each subsequent report with alternatives.
    - Prevent: always state defaults up front when asking mid-workflow questions.

---

## 10. Code and templates worth reusing

### Backend repo (`D:\Documents\Deep Learn HQ\Clients\<client-folder>\UI\backend`, monorepo)
- `CLIENT-HANDOVER-CHECKLIST.md` — client-facing ownership split, 9-item checklist, safe key handover, per-service steps, after-handover steps. Generalise as a handover template.
- `SECURITY.md` — each item of an external security checklist → what the app does → proof (test/code). `SECURITY-SUMMARY.md` — one-page plain words.
- `LAUNCH-READINESS.md` — rows tied to test names; sections per round (H8–H14, I pricing, J admin); H7 open items.
- `CUTOVER-RUNBOOK.md` — rehearsed cutover incl. demo rename note, reprice step, CI config note.
- `playwright.config.ts` — `workers: 1`, `--keepAliveTimeout 60000` on web/admin servers, `GEMINI_MOCK=1`/`TRIPO_MOCK=1` in every webServer env, desktop project copies that skip for mobile-only specs.
- `tools/security/scan-secrets.mjs` — secrets scanner with PLACEHOLDER whitelist regex (public demo sentinel). `tools/security/audit.mjs` — npm audit gate with dated exception list that fails after expiry.
- `tools/cutover/config.mjs` (e.g. `reprice`) and `tools/cutover/verify.mjs` — write/verify config rows per environment.
- `tools/e2e/*` — Playwright specs incl. the attack/security spec (dedicated prober/victim accounts), teardown clearing `%@test.local`.
- Unit gate tests: route inventory test (every API route needs a session or is on public allow-list), `sqlScan.test.ts` (raw SQL built from strings), log scrubber test, locked-key list test, cost helper test.
- `packages/db/migrations/013-…` (admin sessions, attempts, rate limits, session version), `014-pricing.mjs`, `015-admin-cost.mjs`, `016-budget-bands.mjs`, `017-sign-in-and-lists.mjs` — migration pattern applied to staging and CI branch only.
- `packages/db/src/reset-demo.ts` — nightly demo reset writing a fixed identity by `DEMO_USER_ID`.
- `apps/web/lib/serverUser.ts` — `unauthorized()` returning 403 `{code:"suspended"}` vs 401 "Sign in to continue."; `apps/web/lib/api.ts` — dispatches a window event (`assemble:suspended`) for global sign-out modal; `apps/web/lib/authMethod.ts` — one-method-per-email logic and refusal cookie; `apps/web/components/SignInMethod` — refusal UI.
- `apps/web/app/(auth)/login/page.tsx` — empty login fields, demo accepted only when typed.
- `apps/web/app/api/me/route.ts`, `apps/web/lib/onboarding.ts`, `apps/web/app/(auth)/continue/page.tsx` — Google sign-in landing and onboarding flags.
- `apps/site/**` — Next 15 static-export marketing site: components (Header, Hero/HeroAssemble, Problem, Steps, Features/PhoneStage/PhoneFrame with long-scroll screens, WhyItWorks, Avatars3D, InstallStrip, Privacy, Pricing/PricingTerm, Questions, FinalCta, About, Footer, StickyCta, QrHandoff, SiteAnalytics, BrandMark/OrbitMark ring), `lib/plans.ts` (prices from live plan config), `money.ts`, `cta.ts` (staging vs production app URL + tracking), `analytics.ts` (cookieless PostHog), `assets.ts`, `image-slots.json`, `content.ts` (PEOPLE), `site.ts`; `scripts/build-images.mjs`, `scripts/build-3d.mjs` (compressed front-facing GLBs); tests: unit, `tests/smoke/site.spec.ts`, `tests/serve.mjs`; `turbo.json` (out/** outputs, no cache).
- `tools/marketing/*` — persona/marketing asset pipeline on staging: `lib.mjs` (staging guard), `stylists.mjs` (draft fictional personas), `accounts.mjs` (marketing accounts on `@example.com`, never `@test.local`), `wardrobe.mjs` (add garments via real detection), `avatar.mjs`, `looks.mjs`, `social.mjs` (shares, votes, comments, public link), `capture.mjs`, `capture-long.mjs` (full-length screen stitching, `check3d` mode), `rail.mjs`, `export.mjs`, `og.html`/`og.mjs` (1200×630 social image), `manifest.mjs` (alt text), `ledger.json` (AI generations spent), `out/` gitignored (credentials).

### UI folder (internal, outside backend repo)
- `D:\Documents\Deep Learn HQ\Clients\<client-folder>\UI\AI-COST-REPORT.md` (+ `ai-cost-report-assets/fig-*.png`) and `AI-COST-REPORT.html` — AI cost ledger method: price every logged call at published rates, split product vs one-off spend, per-feature unit cost, user profiles (light/typical/heavy), always-in-profit credit pricing at multiple floors with safety allowance, plain-language Part 9 with figures. Private artifact page "Assemble AI Cost Ledger".
- `Assemble-Social-Launch-Proposal.md` — client-facing marketing proposal (context only).

### Scratchpad (session-specific; worth copying into templates)
`C:\Users\<you>\AppData\Local\Temp\claude\D--Documents-Deep-Learn-HQ-Clients-<client-folder>-UI\ec0c6e90-b168-4f07-9145-ff7f7bb4c97b\scratchpad\`
- `AGENT-FIX-COMMON.md` + security briefs (R1/R2/R3) — contract for parallel security workstreams.
- `AGENT-SITE-COMMON.md`, `AGENT-SITE-BUILD.md`, `AGENT-SITE-ASSETS.md` and `-R2` versions — site build/assets briefs with shared contract.
- `AGENT-BATCH2-COMMON.md`, `AGENT-PUSH-A.md`, `AGENT-PUSH-B.md`, `AGENT-BATCH3.md` — briefs for data → build → tests → review workflows.
- `site-deploy.mjs` — direct-upload deploy of a static folder to a Vercel project with noindex header (details in section 6).
- `verify-intro.cjs`, `verify-copy.cjs`, `live-*.mjs`/`live-*.cjs` — live-link checks after deploys.
- `cs-backup/` (copy of live coming-soon + `deploy.mjs`) — backup deploy.
- `pricing-model.js`, `ai-cost-data/` — cost/pricing computation.
- Commit message drafts.

### Workflow scripts
- `C:\Users\<you>\.claude\projects\D--Documents-Deep-Learn-HQ-Clients-<client-folder>-UI\ec0c6e90-b168-4f07-9145-ff7f7bb4c97b\workflows\scripts\assemble-batch3-wf_*.js` — multi-phase workflow (data → 3 parallel builders → tests → review with up to two fix rounds). Journals under `...\subagents\workflows\wf_*\journal.jsonl` enable `resumeFromRunId`.

### Project History
- `D:\Documents\Deep Learn HQ\Clients\<client-folder>\Project History\export-history.mjs` — converts Claude Code `.jsonl` transcripts into readable Markdown with "### You · time" / "### Assistant · time", question/answer blocks, secret masking.
- `Project History\chats\` — 9 archived sessions.
- Memory: `C:\Users\<you>\.claude\projects\D--Documents-Deep-Learn-HQ-Clients-<client-folder>-UI\memory\` (assemble-project.md progress log, batch2-decisions.md, batch3-decisions.md, render-layering-fix.md, replication-guide-task.md, chat-archive.md, money-in-dollars.md, ai-cost-report.md; MEMORY.md index).

### Templates to generalise (from this scope)
- **Phone retest guide format**: numbered steps, each "do X → you should see Y", separate App/Admin lists, a "not tested live" section with manual steps.
- **Status report format**: result line → what changed → verification → phone retest → for your awareness → waiting on you.
- **Question round summary format**: Decisions / Trade-offs / "One thing from you" / final Build? question.
- **Launch page decision checklist** (25 questions above) reusable for any app's launch page.
- **Security 20-item checklist + 25 questions** reusable for any stack.
- **Pricing question set** (data source, groups, margin, location, always-in-profit definition, expensive model basis, auto vs on-tap renders, tier collapse, safety allowance, lever, free tier).

---

## 11. Session running

- **Models**: session ran on the more expensive model ("Fable 5.1") until its limit was hit at 00:46 on 13 Sep; you switched to **Opus 5** ("model changed continue."; later `/model claude-opus-5`). Claude noted it could not switch its own model; you must do it in the model menu or with `/model`. Subagents inherit the session model at launch, so switch **before** launching a workflow.
- **Relative token prices quoted** (API list, 16 Sep): Fable 5.1 $10 in / $50 out per M; Opus 5 $5 / $25; Sonnet 5 $2 / $10. (Used only to compare models; not a running cost of the app.)
- **Your usage report (16 Sep 02:47)**: session window 25% used; weekly all-models 27%; weekly scoped (the premium pool) 49%, reset 22 Sep. Session so far: ~6 h API time, ~5.8 h wall; large cache reads on Fable were the main consumer. Estimate: batch 2 at 8–12 M tokens would need ~40–55 points of the weekly scoped pool on Fable (more than left) vs ~20–30 on Opus → ran on Opus.
- **Replication guide model split (17 Sep)**: readers/extractors on Opus, chapter writers and completeness checker on Fable; estimated 20–35% of weekly allowance if all on Fable.
- **Durations observed**:
  - Security round build + fix loop: ~00:19 → 04:07 (≈4 h incl. a ~50 min limit pause and outage).
  - Full e2e: ~36–45 min (200–211 tests, one worker) mid-September; "2.5 hours" by 17 Sep (243 tests); CI full suite ~15–25 min.
  - Staging deploy per app: ~5 min; live check ~2–5 min.
  - Pricing round: build ~1 h + e2e 36 min + review; total ~3 h incl. an outage restart.
  - Push A: build ~2.5 h (plus outage and overnight pause), fix pass 1–1.5 h; Push B ~2–2.5 h + fix pass ~1.5 h; Claude's ETA "4–5 hours for both".
  - Batch 3: ~6 h from "go" (23:16) to push (05:12), incl. test run and review.
  - Render fix (direct, targeted): ~30 min to push, ~15 min more for deploy + real render.
  - Landing round 1: ~1 h to site ready (images blocked by Gemini credit); round 2: ~3 h to preview incl. outages.
  - AI cost report: ~1.5 h for first version (9 agents); follow-ups 20–30 min each.
- **Compaction**: twice in scope (14 Sep 06:16, 17 Sep 05:11). Summaries were structured (intent/rules, technical concepts, files, errors, problem solving, all user messages, pending tasks, current work, next step) and the session resumed without re-asking.
- **Context worry answer**: at 100% context the conversation summarises; agents keep their own memory; decisions live in files (question answers, briefs, progress log, workflow journal); worst case (app restart) resume the workflow.
- **Resuming workflows**: `resumeFromRunId` replays finished agents from the journal and restarts the failed phase (used after DNS outages on 16 Sep).
- **Background tasks / parallel sessions**: separate background task chips spawned for: E2E test products showing in staging shop; 3D viewer side-on (fix ran in another session you started); account delete leaving bucket files + "within 30 days" copy; app American English switch (an earlier British-spelling task was withdrawn and replaced). Parallel sessions meant builds could collide on `apps/site/out` → check for running builds first.
- **Watchers**: Claude set watchers for rebuild completion, deploy READY and CI runs instead of polling; explained when a notification was just an old watcher closing.
- **"Nothing to start this turn"**: Claude explicitly reported when every remaining item was running or waiting on something running.
- **Holding rules from you**: "for next batch i want you to first wait"; "dont run and task i will give you new next batch"; honoured.
- **Interruptions**: several "[Request interrupted by user]" and dismissed questions; Claude paused with a written state summary each time.
- **Timing questions**: you asked "how much time left?" often; Claude answered with phase-by-phase ETAs and updated them honestly when steps took longer.
- **Connectors**: many MCP connectors reported needing auth (Neon, GitHub, Slack, Notion, …); none were needed; Claude mentioned it once per status.
- **Tools unavailable**: Python not installed → Edit tool; browser batches capped at 25 actions.
