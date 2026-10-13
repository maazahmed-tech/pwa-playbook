# Source notes r5-backend-a: backend Step 2 finish, Samsung fixes, share links, zero-gap round, photo checks

Scope: `Project History/chats/2026-09-01-ui-and-backend-2.md`, lines 1 to 5221. Dates run from 2026-09-01 to 2026-09-12 (UTC).

Words used in these notes:

- **"you"** is the developer running the project (the agency side). **"the client"** is the person the app is built for.
- **Front-end repo** is the first, frozen full-stack repo that serves the live domain (assemble.ink, app., admin.). It was the Step 1 build.
- **Backend repo** is the copy of that codebase where Step 2 (real AI, and later everything else) was built. It deploys only to two **staging** Vercel projects (a staging app and a staging admin). It had not been switched to the live domain by the end of this scope.
- **Pyramid** means the three test layers you asked for on every change: unit tests (vitest), production builds (plus typecheck), and Playwright end-to-end tests (e2e). A live check on staging and GitHub Actions CI came after that.
- **Demo profile** is a shared, seeded presentation account. It is reset every night and after test runs.

No secret values appear in these notes. Where the archive shows a token, a key, a password, a database URL or a project/branch id, it appears here as a placeholder such as `<GITHUB_PAT>`.

---

## 1. Timeline

### 2026-09-01: Part B of Step 2 finished (session resumed after compaction)

- The session opened with an automatic "continued from a previous conversation" summary. The build picked up in the middle of Part B (the 2D "worn look" render engine) without asking anything new.
- Delivered on the backend repo, commit `c050c86`:
  - **Render engine** at `/api/ai/render`. Opening a generated outfit renders it once (with a shimmer while it works) and caches the result on the look. Every render gets a unique storage key. The base person is the user's full-body photo if they have one, otherwise a model matched to their gender. Up to 5 garment reference photos are sent, on a navy studio background at a 3:4 ratio. The first render of a look is free. A swap re-render costs a credit.
  - **From-outfit 3D avatars.** The look's 2D render is fed to the 3D engine as the front photo. If there is no render yet, the route returns a clean 409.
  - **AI packing lists** at `/api/ai/pack`. They cost 10 credits, are built from the real closet and saved as drafts, and have save and delete.
  - **Surprise me** makes a real randomized generation. **Compare** uses the generated looks. **Shop matches** ranks products by closet gaps and the categories and brands the user wears most.
  - **Admin**: a render-model selector (default `gemini-3.1-flash-image`). The daily AI cap and the 7-day stats now include renders and packing.
- Verification: unit 42/42. Web and admin builds clean. e2e 56 passed with 26 expected skips (skips are scoped by project). Live on staging with real Gemini, matching took 9.8s and packing 5.9s ("Sightseeing Day / Lisbon Dinner / Beach Day / Casual City Walk").
- **Blocker found:** Google gives image models **zero free-tier quota**, so every render returned "quota exceeded". The raw Google error was replaced with friendly copy ("engine at capacity, you weren't charged"). The admin deploy was cancelled by turbo-ignore because only the web app changed, which is expected.

### 2026-09-01 11:29: CI failure email

- You forwarded a GitHub Actions failure email ("whats this i got?").
- Cause: the new backend repo had **none of the Actions secrets** the copied workflow needs, so CI had failed on every commit since the repo was created.
- Fix:
  - Created a dedicated Neon branch **`ci-backend`**, forked from staging, with its own `assemble` storage bucket.
  - Set **8 Actions secrets** (database, auth, admin, storage).
  - Re-ran the workflow: green in 7m25s. One test was flaky because the packing spec bought a credit pack at the same time as the pack-purchase test. That assertion was hardened (commit `d8f5cf4`), and CI went green in 4m57s with no retries.
- Recorded in memory that `neon env pull` must **never** be re-run for that branch, because it rotates the storage credentials behind the GitHub secrets.

### 2026-09-01 16:23 to 16:51: admin 2FA code sent to a second inbox (front-end repo only)

- You asked what the admin password was. The assistant printed it in chat. **Lesson for the guide:** keep passwords in a password manager and never ask for them in chat.
- You asked that the admin sign-in code also go to a coordinator mailbox, in the front-end repo only.
- The assistant added an `ADMIN_EMAIL_CC` env var (comma-separated) next to `ADMIN_EMAIL`. It applies only to the 2FA sign-in code, not to other admin alerts. The var was set on the production admin Vercel project and in local env, then deployed.
- Live check: the login endpoint returned `{"ok":true,"sentTo":"ma…@…, as…@…"}` (masked in the response itself). Front-end CI went green in 5m9s.

### 2026-09-01 17:17 to 20:05: Samsung Internet fixes (two rounds)

- **Report:** the PWA would not install from Samsung Internet (Chrome worked). The white logo "A" and wordmark looked grey in Samsung Internet. You had screenshots.
- **Round 1** (5-question round):
  - Answers: both install flows failed; fix both repos; "harden manifest + guide to Chrome"; a subtle note; pyramid plus your phone retest.
  - On shipping, you chose: "lets do frontend first - i ll test it manually and then if it works we can implement on backend as well."
  - Delivered in front-end commit `255fe8d`:
    - Manifest gained `id`, `scope`, `display_override`, portrait orientation and maskable icons.
    - Samsung Internet is detected and the banner shows the tip "installs most reliably from Chrome".
    - `<meta name="color-scheme" content="dark">` added to app, admin and coming-soon page.
    - 53 e2e passed, including 3 new PWA specs. A synthetic `beforeinstallprompt` exercises the real banner UI.
    - All three production deploys READY, and the live manifest and meta were checked on all three domains. The production demo was reset after the local run.
  - A phone test guide was sent: clear site data, retry the install, check the whites.
- **Round 2** (18:32). Play Protect still blocked the install ("marking it as unsafe is very bad for business"). Whites were still grey in dark mode but fine in light mode ("always white regardless of phone dark/light mode").
  - The assistant explained the real cause. Samsung's own WebAPK packaging service is what Play Protect flags, and no manifest change can fix that.
  - Decisions: you answered "i want the fix it", then "nopes i dont want a play store app".
    - Replace the install flow on Samsung Internet with a branded **"Install Assemble with Chrome"** sheet (Copy link plus 3 steps).
    - Fix the whites with both image/CSS fallbacks and CSS opt-outs, on all three surfaces including admin.
    - "Ship both repos now".
  - Real root cause of the grey whites: the logo and wordmark were **gradient backgrounds clipped to text**, and Samsung's forced dark mode darkens light backgrounds.
  - Fix:
    - A `.sbrowser` class is added on Samsung Internet and turns those elements flat pure white.
    - Every surface declares `color-scheme: only light` as the forced-dark opt-out (form controls kept dark).
    - The fallback was simulated in a browser before shipping.
  - Shipped: front-end `4a0fccb` (53 e2e, CI 5m49s) and backend mirror `588aca1` covering both rounds (56 e2e, CI green). Demo profiles were reset on both databases.
  - At 19:40 you typed "Try again" after the assistant stopped mid-run (an interrupted turn). The work resumed.

### 2026-09-02 22:01 to 22:59: profile pictures and demo email

- **Report:** the demo and your own account showed the same profile photo. Google sign-in should show the Google photo, and a user with no photo should see initials. The demo seemed to show your real email.
- **10-question round.** Decisions:
  - Order: Google photo, then uploaded photo, then initials.
  - Store Google's photo URL on the user record.
  - Initials on a brand-gradient circle, 1 or 2 letters.
  - The demo keeps its seeded portrait.
  - Photo upload for email/password users deferred ("initials now, upload later").
  - Apply everywhere the user's own picture shows, including real friends. Seeded demo friends keep their placeholder photos.
  - Both repos, full pyramid, your retest.
- **Your correction mid-plan:** "i think you are wrong its not the avatar but just the profile picture". "Avatar" meant the 3D models in this app. The component was renamed `ProfilePic`, and the 3D and 2D avatar features were explicitly left alone.
- **The audit changed the diagnosis.** A read-only query on the production database showed the demo row had a fake seeded email. The real bug: the profile screen **fell back to the browser's Google session** whenever the server profile hadn't loaded, so a lingering Google login leaked your email onto the demo view. Profile identity now comes only from the server.
- Delivered:
  - Migration `004-profile-picture` (a `users.image` column), applied to **all four** Neon branches (production, ci, staging, ci-backend) before deploying.
  - Front-end `bfb41cb`: 29 unit, 57 e2e (4 new), CI green in 5m2s, production verified.
  - Backend `101774c`: 63 e2e, CI green, staging verified.
- The Vercel API token had expired again (SAML "re-authenticate to this scope"). Verification fell back to live URLs.
- A de-flake push changed exact credit balances to event-based checks. Backend CI went green in 5m22s.

### 2026-09-04: plain-English status and the Gemini billing how-to

- "list down in a proper manne what can we do in frontend and what will completed in next phase. dont user very technical words". This produced a plain-English "Step 1 live / Step 2 built on test site / Step 3" feature list.
- "remind me what was the api needed". Answer: the Gemini API key already given. Only image renders were blocked, because billing was not on.
- "how to enable billing". A 5-step AI Studio walkthrough: API keys page, then "Set up billing" next to the project, then Google Cloud billing account, add a card, then the project shows "Paid". No new key is needed. Recommended that the billing account belong to the client.

### 2026-09-07 to 2026-09-08: marketing documents (no code)

- **Marketer overview** (5-question round). Reader: a marketer joining. You chose "Describe the finished product as one vision" against the recommendation to label phases. The assistant added a private note to check against the "live now" list before any ad. Delivered as plain text in chat, per your choice.
- **Social launch proposal** (15-question round).
  - You interrupted the first attempt and re-sent it asking for 15 questions instead of the implied default.
  - Decisions: 3 months (1 pre-launch plus 2 installs), organic only with US micro-influencers; TikTok, Instagram and YouTube Shorts; founder on camera; product plus a small fee for creators; full research; premium look with a conversational voice; email waitlist; 4 to 5 videos a week; **directional targets, no numbers**; US nationwide; free credits only (no Pro promise); agency runs it; 12-week calendar plus 5 scripts; plain text in chat.
  - **Four research agents ran in parallel**: audience, platforms, competitors, creators.
- **Commercial completeness review.** You asked: "is this a complete proposal … doesnt mention our/agency cost … would the client feel like moving forward?"
  - The assistant's candid take: the strategy was complete, but it was not a commercial proposal because it had no price, no terms and no options.
  - A 7-question round added: monthly retainer with a 3-month minimum; three packages with the middle one recommended; retainer covers agency work while creator fees pass through at cost; show both "quarter upfront at 10% off" and "monthly in advance"; an executive summary, "why now", "what month 3 looks like" and "why us".
  - Delivered as `Assemble-Social-Launch-Proposal.md`, because you would finish the design in Claude Design.
- **AI host revision** (7-question round). The founder would not record, so you suggested an AI avatar.
  - The assistant first raised platform and FTC disclosure rules for synthetic people.
  - Decisions: two openly-AI stylist hosts (one woman, one man) with disclosure as the hook; a fully generated wardrobe (against the recommendation); a professional AI-video stack inside the retainer; creators raised to 6 to 8 posts a month as the real-human proof; monthly prices kept, setup fee raised, **plus a transparent cost breakdown**.

### 2026-09-09 22:48 to 23:41: Step 2 close-out, billing on, profile photo upload, tokens replaced

- "whats left now in step 2, we are not implementing the marketing tracker ones". The assistant listed: one client-blocked item (billing), two small items of ours, and the cutover items that wait for your instruction.
- **Billing enabled.** You said: "billing enabled, it says paid now. i want to understand again that backend is currently on a sepertae link and not on the main link." A 6-question round followed:
  - "client doesnt know staging exists so we will test it internally first and only switch to main when client give us his own paid api".
  - Key handover: decide later.
  - Testing: "for testing we should use the playwrite e2e three pyramid verification system we have. remember?"
  - Do the profile-photo upload now. Mirror the 2FA CC change only after production cutover.
  - Uploaded photo wins over Google.
  - Tap the picture on the Profile screen to get a sheet: Take photo / Choose from gallery / Remove.
- Built: a `google_image` column (migration 005, **backend branches only**, because on production it would move Google photo URLs while the old build is still live), an upload kind "profile", a protected PATCH, and the sheet. Three new e2e checks.
- **GitHub token expired** (401 on push). The other GitHub login on the machine had no repo access. The work was committed locally as `9cdac51`. The assistant gave fine-grained PAT steps. You pasted a new PAT, then also a new Vercel token, which was checked for team access.
- Pushed. Staging showed the demo picture with source `seed`. CI green in 4m28s.
- **Renders live for the first time:** a real render on staging took 9.8s; the cached call took under a second; the swap re-render charged 1 credit.

### 2026-09-10 00:22 to 01:39: required item in "match around an item", Preferences photo button

- **Report:** "Match around a closet item" returned outfits without that item. "Change profile photo" in Preferences opened the item camera.
- **6-question round:**
  - A hard rule enforced by the server: retry once, then fix deterministically by swapping the chosen item into the same-category slot, or adding it.
  - The Preferences button opens the profile-picture sheet.
  - The same enforcement applies to the "snap a new item" path.
  - Relabel the two sections "Full-body photos for outfit renders" and "Profile picture".
- On the last question (ship and test loop) you pasted the "ask me questions" instruction as the answer. The assistant took that as the default recommendation (pyramid, push, staging, your retest) and went ahead.
- Delivered in `7286a37`: 46 unit (4 new), 70 e2e (3 new). Live with the real model, both outfits around "Green sneakers" included them (11.0s), a snapped "White tee" was included (9.5s), and "no item chosen" was refused before any charge. A de-race test commit followed, with CI green in 5m39s.

### 2026-09-10 01:42 to 03:09: public share links, real 3D in shares, light avatar copies

- You asked a no-code question: "dont write any code but tell me … do we have a shop in the backend with a demo inventory? and how does the share outfit and 3d avatar work when someone copies link and share?"
- Honest answer:
  - There was a real catalog of 11 seeded products, but no real buying.
  - There was **no public share link** at all. Sharing was in-app to friends only.
  - A 3D share showed the bundled placeholder model instead of the sharer's avatar.
- "lets make both real … ask me at least 15 questions". You then asked for **15 more** ("15 questions didnt do justice"), for **30 in total**. Also reported: the closet item page's "Match an outfit with this" ended with "pick the item first".
- Key decisions:
  - Anyone with the link can open it, no login. They can view, vote and comment with just a first name, and there is a sign-up nudge.
  - The page shows the render, piece names, "why it works", and the sharer's first name and picture.
  - The real interactive 3D avatar is shown, with a 2D fallback. The sharer picks the avatar (finished avatars only).
  - Links are created explicitly with "Copy link" and can be revoked from Shared looks. The phone's native share sheet is used alongside Copy link.
  - The WhatsApp preview card shows the render.
  - Responses are tagged "via link". Light guards: one vote per device, rate limits, the sharer can delete.
  - Views and votes are shown to the sharer. The closet button locks the item and goes to the occasion screen.
  - URL is `app/s/<code>`. A **lighter share copy of each avatar** is made, and the page shows the picture first with a "View in 3D" button.
  - Dark branded page. Optional viewer name remembered on the device. Grouped notifications. The tally is shown after voting. A message is allowed and the look stays live. One link per look; turning it off and on issues a new code.
  - The light copy is made in the background when the link is created, and friends also get the light copy. "Joined via a shared look" is recorded on sign-up. Demo links are cleared by the nightly reset. Dead links get a branded page. Reports go to the admin Reports page.
  - Q30: "demo isn't for actual user and only for dev testing and presentation purposes so no need to do any thing keep it as is".
- Delivered (final commit `e7fdcc7`): token links, a public page, a public API, report and asset routes, a share sheet with avatar picker, "via link" responses, admin reports, the welcome `?via=share` cookie, a demo-reset cleanup, a nightly sweep, and admin stats.
- Light avatar copy: a **41 MB GLB became 3.9 MB in 3.9 seconds** (geometry-only compression, see Pitfalls).
- Verification: unit 55/55 (9 new), e2e 72 passed. The live share flow passed twice on staging. Migration 006 was applied to the two backend branches only. A de-race test commit followed, with CI green in 6m10s.

### 2026-09-10 03:12 to 06:41: the "zero gaps" launch-readiness round (50 questions)

- **Report:**
  - A shared link opened blank on another phone.
  - The AI render "changes the clothes a little".
  - Compare showed piece mosaics instead of renders.
  - A "you'll lose the generated outfit" prompt appeared when leaving.
  - And: "i want the backend to have zero gaps and every thing should be function in app and admin both. i want it to be perfectly ready for the users and only thing to leave behind in the payment. … ask me at least 50 questions".
- The assistant grounded the questions in the code while asking. An Explore-agent audit found:
  - 31 controls that only showed a toast
  - 22 toggles that lived only on the client
  - 17 fixture leaks
  - 13 placeholder modals
  - 20 unwired admin controls
  - 11 copy lines that promised things the app didn't do
  - 9 roadmap strings shown to users
- 50 decisions (headline ones):
  - Strict garment fidelity on a higher-fidelity image model. Render both looks before results show. Remove the warning and say "looks are kept" instead.
  - **"Every control either works for real or is removed — no fakes"**. Demo fixtures only behind the demo check.
  - Real store links per product. Real filters and sort. Settings toggles persisted and made real, or removed.
  - Real replies in threads and on public pages (you revised Q11). Real reports. Test-mode checkout label plus admin grants of credits and plans. House-managed ads with view and click counts.
  - Account deletion only: **no data export and no consent withdrawal**.
  - Real password reset by emailed code. Real change-password. Item fields saved and real wear stats. Real archive. Real shop catalog. Save for later.
  - Subscription screens stripped to what is true. You added a guard rail: **"Couldn't buy it?"** reasons that flag a product to admin.
  - Onboarding saves each step. Consents recorded with timestamps and checked by the features. Preferences fully saved, and "remove avatar data" really deletes. Angle photos real. Swaps persisted on the server.
  - Real Block. Real ticket numbers and ticket emails. Legal drafts editable in admin. **Demo hidden on the public login and reachable at `/demo`**. Progress saved to the account.
  - Packing lists realistic: one outfit per day, plus an Essentials section with quantities and a "Don't forget" section.
  - Dead admin pages deleted. Safety filter and auto-flag made real. Real admin settings with a hashed password and editable 2FA recipients. Plans editable in config. Product photo upload, store URL and brand picker. Real brand detail page. All roadmap copy removed.
  - Emails: "nothing else just sigin codes and tickets nothing else". Two notification switches.
  - A written gap checklist tied to tests. **One big push** (against the recommendation of three). Piece names only on the public page. **Rehearse migrations on a fork of production at cutover.** The checklist lives in the repo.
  - Your constraint: "nothing gets changed in frontend repo and the assemble.ink urls remain for frontend and everything backend related stays on stagging for now".
- **Context compaction** happened at 04:15, straight after the 50th answer. Work resumed from the summary.
- Execution: **five parallel build agents** (A to E; D = social/sharing/reports/support, C = closet/items/outfit/progress, B = shop/products/ads/brands, E = packing/admin ops, and one for account/auth). The main session integrated their work, extended account deletion to cascade to new tables, and ran the pyramid several times (a mangled regex from an edit script broke one spec run; a brand-detail spec hang was debugged with a single-test run).
- Shipped as one commit, `9ee4234`. CI green. Both staging deploys live.
  - Unit: 16 files, 148 tests, including a **copy audit over both apps** (a test that fails if banned roadmap or placeholder strings appear).
  - 18 Playwright spec files passing.
  - A live staging pass of 30 checks on the app and admin APIs, the public page in a real browser, and a real render.
- Found along the way:
  - Test accounts' password failed the new strength rules.
  - The staging config row still pinned the older image model, so it was switched through the admin config API.
  - The GitHub token lacked the `workflow` scope, so the CI demo flag moved into `next.config.mjs`.
  - The leave-warning did not exist in either repo. It was a browser-level dialog.
- A 9-step phone retest guide was sent.

### 2026-09-10 20:51 to 22:39: APK/IPA question and a test TWA

- "can we make an apk and ipa file for this?" Answer:
  - A TWA (Trusted Web Activity) or Capacitor works for Android. iOS needs a Mac, Xcode and a paid developer account.
  - Store billing rules for digital goods block both stores until payments are real.
  - Recommendation: not now.
- "can you give me a TWA … for the assemble backend? just for testing". A signed TWA test APK was generated through **PWABuilder's cloud packaging service** (no local Android toolchain), with package `ink.assemble.staging`, pointing at the staging app.
  - `/.well-known/assetlinks.json` was added to the web app (commit `207d142`) so the shell opens full screen.
  - The APK, AAB, signing keystore, key info and assetlinks copy were kept **outside both repos** in `Clients/<client-folder>/twa-staging/`.
  - Install instructions covered unknown sources and the Play Protect warning, which is expected for a sideloaded build.
- "whre is it in local so i can copy and share?" The path was given. Share only the `.apk` (about 1.4 MB). Keep the keystore private.
- "realistically … can be used to publish this app and they will have no issue?" Android: yes, after the payment step and a rebuild against production. iOS: a separate project; Apple is stricter about apps that are just a website in a shell. Both stores need their own billing for credits and subscriptions.
- "ok lets leave it for now, i tested apk. it working that great."

### 2026-09-10 22:39 to 2026-09-11 00:08: render fidelity (hoodie), better swaps, piece removal

- **Report:** a pullover hoodie was rendered as an open-front jacket, and the swap feature "should be made better". 10-question round plus one scope addition:
  - Detect, describe and verify: detection records how each garment is built.
  - AI detects the facts and the user can correct them. Old items get their facts filled in lazily just before a render.
  - All angle photos plus the facts go into the render.
  - AI-ranked swaps with instant preview. Reasons refreshed when the swap is rendered. Swap render **always 1 credit**.
  - Keep the person exactly as in the photo; garments come only from closet photos. Build fidelity first.
  - Your addition: "i aslo want to enable a removal feature so items can be removed if not need like watch or sunglasses". Removal is pending like a swap, and core pieces are guarded.
  - Final confirmation "all 3" meant: **rank swaps by rules only** (no AI call), **no silent retry** (a free "Render again" link instead), and 1 credit per swap render.
- Built by **two sequential agents** (fidelity, then swap/removal). Migration 008 was applied to staging and CI after a **network outage** kept it in a retry loop.
- Commits `f94a535`, `e3af142`, a mock-fix commit and `b34662b`. 182 unit tests.
- Live on staging, the hoodie was worn closed under an open denim jacket and the verifier agreed.
- Found: the local test suite had written mock "hoodie" facts onto shared staging rows ("poisoning"). The mock now answers by category.
- Back-to-back pushes collided on the shared CI database. The assistant recommended a `concurrency` block in `ci.yml` but couldn't edit it without the `workflow` scope.

### 2026-09-10 23:30: deleting four real users from production data

- You asked to delete four named accounts from the front-end (production) data.
- The assistant found exact matches first and showed them. The deletion was **blocked by the desktop app's safety check** (a destructive action on live data). It asked, and you answered "Run it now (Recommended)".
- The script was made schema-aware (production lacked a newer column). It deleted the four accounts, their rows and one bucket object, then listed the remaining accounts.
- (Names, emails and ids are left out here on purpose.)

### 2026-09-11 00:15 to 01:01: refuse multi-item photos

- "what happens if someone adds a picture that has multiple clothing items in 1 image. should we just reject it…?" 5-question round:
  - Reject with a message (against the recommendation to split into several items).
  - Pairs and sets count as one item.
  - The check runs inside the detection call, and **a refusal is free**.
  - Worn full outfits are refused with a tailored message.
  - An inline note with Retake and Gallery, and the form hidden until a photo passes.
  - Final question: "Build it as summarized". Refuse only when the model is confident.
- Commit `ab4fa4c`. Live on staging, a worn-outfit photo was refused in 5 seconds at no cost.
- Test fixes bundled in: the password round-trip got its own throwaway account, and **CI runs spec files one at a time** (`workers: CI ? 1 : 2`). CI green.

### 2026-09-11 01:24 to 06:11: the second 50-question round (categories, shop, admin, audit, cutover rehearsal)

- **Request:** the demo closet lacks occasion tags and garment facts; the "how it's made" section may overwhelm users; "do a clean audit"; more prebuilt categories; check that shop data is shown, added and deleted from admin; "admin to be able to provide users with a shop items"; and anything else left. "ask me at least 50 questions".
- Decisions:
  - Demo facts come from **one AI describe pass, frozen into the seed** (occasions reviewed; colour and season yes; size and notes left blank). You first said regenerate the looks, then "no need to change look they are alright".
  - Facts folded into one summary line with an Edit link, showing only known facts, all seven kept and ordered by impact.
  - The **full everyday category set** in grouped chips. **Bulk re-categorize by name** (against the recommendation), leaving unmatched items for review.
  - Products hidden rather than deleted. End-to-end shop audit on staging with a real product. One main photo plus up to 3 extra. Product facts described automatically on save. **Structured price** with one shop currency.
  - "Picked for you": after four questions you said **"admin doesnt pick anything for the users."** It was re-asked twice and settled on: admin manages the catalog, with a single global Featured row.
  - The audit covers every screen and admin page, clicked through, fixing as it goes. Checks: loading, empty and error states; 360px layout in dark and light; speed; a copy tone pass.
  - A real admin user detail page showing names and counts only, **never photos**. Fixed groups; admin edits categories. Retiring a category requires a replacement. Roles live in the taxonomy, with one-piece and not-styled flags. 12 help articles seeded.
  - Closet filters for "never worn" and "unworn 90+ days" plus colour swatches. Home unchanged. Broadcast targeting by plan and inactivity, with a preview count. AI spend view.
  - Monthly AI spend ceiling. You redirected this into: **show third-party AI balances on the admin panel, soft warnings, and "cost minus revenue" with a disclaimer that cost is AI only**. Then the Gemini budget is entered by admin, and spend is tracked from the app's own call log. Margin card with two disclaimers.
  - Your addition: **track giveaways** (extra credits, free plan upgrades) on the dashboard, valued at list price.
  - Warnings as a dashboard banner plus an admin notification, warning only. Cutover rehearsal on a production fork plus a runbook. Keep 28 demo items (you asked "why are they in the repo and not in database?").
  - **Three staged pushes**, one migration per push, the full test bar plus a phone guide each time. Sign-in "keep exactly as is".
- You **re-asked earlier questions** several times ("re ask question 37", "ask q 40 again", "re ask q 48 and q49"). The assistant repeated each with sharper options.
- Push 1, commit `b170a5a`:
  - 24 categories in 6 fixed groups, with one-piece and not-styled flags. Admin taxonomy table with retire-with-replacement.
  - Migration 009 and 009b re-filed 9 items; none needed review.
  - Folded facts line. Demo closet facts frozen.
  - 214 unit tests. Live pass.
  - You asked "whyy is it taking so much time?" Answer: about 210 e2e tests drive real Chrome against production builds and the live staging DB with 2 workers, 15 to 20 minutes per clean run, and this was the third attempt.
- **Context compaction** at 04:13, during push 2.
- Push 2, commit `4f24757`:
  - Shop model (structured price, extra photos, product facts, hide not delete).
  - Admin operations (user detail page, AI accounts with budgets and warnings, margin and giveaways cards, AI spend strip, broadcast targeting).
  - A real bug caught by local e2e: a price edited in admin was scaled twice (120 became 1,200,000 in minor units).
- Push 3, commits `a99cad3` and spec-only `857ea9c`:
  - Audit fix set, help centre (migration 011), colour swatch row and never-worn filters, cutover tooling.
  - **Cutover rehearsal:** migrations 004 to 011 ran cleanly on a Neon fork of production, the config and verify scripts passed, and the fork was deleted. `CUTOVER-RUNBOOK.md` added to the repo.
  - 263 unit tests. CI green.
  - The 3D consent UI-flow test became local-only because it kept failing only on CI; the API-driven 3D test still runs in CI.
- Left open: admin 2FA attempt limit and server-side session revocation; real timestamps for share, ticket and packing labels; emoji icons.

### 2026-09-11 19:53 to 21:23: share-as-3D toggle and Style profile photo

- **Report:** the 3D toggle in the share sheet was greyed out, and the full-body photo didn't show when you came back to Style profile, although renders used it. 5 questions narrowed it to: from an outfit, on the demo profile after building a new avatar; photo saves but isn't shown later.
- Root causes:
  1. The profile PATCH merged `styleProfile` **only one level deep**, so adding a side photo replaced the whole photo set.
  2. The demo's example avatars were a bundled list, not database rows, so any feature that read rows saw none. Your own new avatar row had been cleared by a reset.
- Fix in `ea4477e`: per-slot photo merge (null clears one slot). The demo reset inserts the example avatars as real rows with a ready share copy. Full bar, live pass, CI green. The staging demo was reset.

### 2026-09-11 21:38 to 23:41: photo quality checks, duplicate warning, avatar-only sharing

- **Report:**
  - A black image was accepted as a garment ("every photo uploaded for the closet must be checked, right?").
  - Google login on staging failed with `redirect_uri_mismatch`.
  - Sharing the "Everyday" avatar opened "Clean and sharp".
- 10-question round. You asked to "think of other such senarios too so that adding clothes to closets are very accurate and bugfree". Result:
  - **Ten free refusal kinds** in one detection call: no clothing, face or selfie, shop display, several pieces, full outfit (allowed when one piece dominates), blurry, too dark, too small, fabric swatch, cut off.
  - A **duplicate warning** (same category and colour plus a similar name) with Keep both and Open existing.
  - Google fix on your side: add the staging callback to the OAuth client.
  - **Avatar-only sharing** (you chose this over a look picker): rotating avatar plus vote and comments, for both friends and public links.
- Two agents: P (photo checks) and S (avatar sharing, migration 012).
- A session break happened mid-bar. You typed "contınue". The new session fixed four spec-side failures and re-ran the affected specs, then the full suite.
- Commit `e7a26b0`: 279 unit tests. Live, a real black photo was refused at no cost. The avatar-only link resolved, a stranger's vote was tallied, and a turned-off link showed the dead page. CI green.
- The assistant noted that the repo's no-AI-attribution rule governs its commits even though the session's attribution reminder said otherwise.

### 2026-09-12 21:34 to 23:06: Google OAuth steps, onboarding for returning users, delete account, avatar photo checks

- You asked for detailed steps with links for adding the staging redirect URI. You got 9 steps, plus a "still fails" section (compare the error details character by character; Testing mode means adding test users on the consent screen; wrong project) and the production callback for cutover.
- **Report:** a returning Google user was sent through the new-user set-up screens again.
- **Report:** "i tryied deleting account that also didnt work?"
- A new request: check 2D avatar photos too, free, accept only appropriate photos. 5-question round:
  - Full body head to feet, standing.
  - Refuse: no person or several people; cut off, sitting or lying; blurry, dark, small or filtered; wrong side for the slot; bulky outerwear or a bag; busy background; covered face; photo of a screen.
  - Check right after capture, before saving, free.
  - The same rules per slot for the four 3D photos, before the build.
- Round 6, commit `01e4077` (committed locally first as `745b11c` so the agent's edits stayed separate):
  - A Google landing page decides returning or new: set-up finished or skipped, style profile saved, or account older than 15 minutes means returning.
  - Delete-account sheet hardened: the confirm word works in any case, no double tap, a demo message, the server's reason shown.
  - The server delete path was proven by running the full sequence **inside a rolled-back transaction** on your account.
- Round 7, commit `588d6f9`: the avatar photo check with 13 refusal kinds; the gallery picker runs the same check; a 3D build starts only when every view passes. 289 unit tests. Live: a black frame offered as the front photo was refused, nothing saved, no cost. CI green on both.
- Test-infrastructure fixes: local servers keep sockets alive for a minute (connection-reset flakes); demo-balance assertions read the ledger.
- An open question was left for you: what the phone showed when delete failed.

---

## 2. Decisions and why

### Process decisions

- **Backend repo stays staging-only until an explicit cutover instruction.** Why: real users and the client never see a half-checked release. You also said the client doesn't know staging exists, and cutover waits until the client supplies **their own paid Gemini key** (the agency funded a small amount for testing).
- **No AI attribution in the client-facing repo.** Why: "we need to present it to client". Commits are authored under your GitHub identity with no co-author trailer. A later session was reminded that this rule beats the tool's default attribution. The front-end repo had used a trailer earlier; the guide should use no trailer anywhere.
- **Neon, never Supabase.** An earlier, standing preference.
- **Every change goes through the pyramid plus a live staging check plus CI, then a phone retest guide.** When the assistant proposed "a structured manual test script", you answered: "for testing we should use the playwrite e2e three pyramid verification system we have. remember?"
- **Front-end first, then mirror to backend (Samsung round 1).** Why: you wanted to test on your phone before copying the change. Round 2 switched to "ship both repos now" because the fix targeted the exact mechanism.
- **Migrations that change live behaviour are applied only to backend branches until cutover.** Migration 005 moves Google photo URLs, so running it on production while the old build is live would break profile pictures. Migration 004 was additive and safe, so it went to all four branches first.
- **Rehearse cutover migrations on a Neon fork of production.** Why: it proves every migration on real data before production is touched, and a restore point exists. Rehearsed on 2026-09-11, then the fork was deleted.
- **One big push vs staged pushes.** The zero-gap round used one big push (your choice: less deploy noise, one review). The later 50-question round used three staged pushes (your choice: foundations first, earlier retest).
- **A written gap checklist tied to tests (`LAUNCH-READINESS.md`)** in the repo. Why: an auditable trail ("not just trust me"). Nothing is done without a test. Sections grew A to H.
- **Fix-as-you-go audits; only product decisions come back as questions.** Why: one consolidated list at the end instead of a stream of reports.
- **Delete live user data only after showing exact matches and getting a fresh yes.** The desktop safety classifier blocked the first attempt. Your explicit choice unblocked it.
- **Deliver plain text in chat** when you want to take it into another tool (the marketing brief), and **a `.md` file** when you'll finish the design in Claude Design (the proposal).

### Product and design decisions (with reasons)

- **Worn-look renders:**
  - On demand per look, cached, first render free. Why: cost control and an instant second view.
  - Later: **render both generated looks before showing results**. Why: Compare, Saved and Shared then show real pictures from the start. The first render was already free.
  - Base photo: the user's own if set, otherwise a gender-matched model.
  - Strict fidelity on `gemini-3-pro-image`. Why: the flash model drifted on garment details. The admin can switch back.
  - Garment construction facts detected, correctable, lazily filled, and sent with all angle photos. A verifier with a free "Render again" link instead of a silent retry (your final call; cheaper, no hidden double spend).
  - Clothes worn in the base photo must never leak into the render.
- **Required item enforcement:** the server resolves the chosen piece before charging, tells the model it is mandatory, retries once, then swaps it in deterministically. Why: "a guarantee, not a request". No dead ends, no wasted credit.
- **Samsung Internet:**
  - No Play Store app (your call).
  - The install buttons open a Chrome guide sheet. Why: websites can't stop Play Protect flagging Samsung's own packaging, so users are kept out of that flow.
  - Whites fixed with `.sbrowser` flat white plus `color-scheme: only light`. Why: gradient-clipped text is exactly what forced dark mode darkens.
- **Profile pictures:**
  - Google photo URL stored on the user. Why: simple and always fresh, with an initials fallback.
  - Later: an uploaded photo wins over Google. Why: an explicit user choice.
  - The component was named `ProfilePic` to avoid confusion with "avatar", which means 3D models in this app.
  - Identity comes only from the server, never from the browser's session.
- **Public share links:**
  - Anyone with the link, no login, unguessable 22-character token, explicit creation, revocable, one link per look (re-enabling issues a fresh code so a leaked link stays dead).
  - Piece names only, no closet photos. Why: closet photos are private.
  - First name plus picture only. Why: a username would let strangers look the person up.
  - Tally shown after the vote. Why: keeps the first vote unbiased.
  - Branded dead-link page, the same for wrong and revoked codes. Why: nobody can tell a revoked link from a code that never existed.
- **Light share copy of avatars** (about 5 MB) made when a link is created, and used for friends too. Why: a 40 MB file on mobile data takes too long and costs the viewer's data. Copies are made only for avatars that are shared.
- **"No fakes" rule:** every control works for real or is removed. The one labelled exception is payments ("Test mode — you won't be charged").
- **Emails limited to sign-in codes and support tickets** (your explicit "nothing else"). The password-change notice email was later dropped. Why: sender reputation and simplicity.
- **Deletion only**, no data export or consent withdrawal controls (your choice, against the recommendation).
- **Demo hidden on the public login, reachable at `/demo`**. Why: the demo is for development and presentations only, and strangers shouldn't share one closet.
- **Packing lists:** one outfit per day, plus Essentials with quantities, plus a "Don't forget" checklist. Why: you pointed out a real list needs underwear, sleepwear and toiletries.
- **"Couldn't buy it?" product flags.** Your guard rail: the user can report size, stock, delivery or link problems to the admin without the item going into the closet.
- **Categories:**
  - 6 fixed groups (tops, bottoms, outerwear, shoes, accessories, other), with categories editable in admin. Why: the matcher's top/bottom/shoes rule can't be broken by a rename.
  - A one-piece flag for dresses and traditional wear. A not-styled flag for underwear, socks and sleepwear (shown in the closet and packing only).
  - Retiring a category requires a replacement. Why: no orphaned items.
- **Photo checks:**
  - Refuse inside the same detection call, free to the user, and only when the model is confident. Why: no extra AI calls, no paying for a refusal, fewer false refusals.
  - The avatar photo check runs before saving. Why: a refused photo is never stored, and a 3D build (10 credits) never starts on a bad set.
- **Avatar-only sharing** instead of picking a look (your choice). Why: an avatar not tied to a look shouldn't silently fall back to another look.
- **Admin cannot see user photos**, only names and counts. Why: it matches the privacy policy wording.
- **AI budget:**
  - Warning only, never a hard stop (your choice).
  - Gemini has no balance endpoint, so the budget is entered by admin and spend is estimated from the call log at per-call rates. The 3D engine wallet is read live.
  - The margin card carries two disclaimers: revenue is simulated, and costs are AI only.
  - Giveaways valued at list price per month.
- **Returning Google users skip onboarding.** Rule: set-up finished or skipped, a style profile exists, or the account is older than 15 minutes.
- **Mobile store builds:** not now. The TWA is only for internal testing. Why: store billing rules for digital goods, and Apple's review risk for thin wrappers.
- **Marketing proposal:** openly-AI hosts with disclosure as the hook (platform and FTC rules); three packages with the middle one recommended; a transparent cost breakdown (your addition).

---

## 3. Reusable user prompts

Each item gives the original message (lightly cleaned; client name replaced), the date, a one-line note, and a template.

### 3.1 The question-round suffix (used on almost every request)

> "Before we proceed, ask me at least 5 questions so you can fully understand what I'm trying to achieve. Ask the questions one at a time, and for each question, give me multiple-choice options to choose from. Clearly highlight the option you recommend and briefly explain why. Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf." (2026-09-01 17:17 and throughout; the count varied: 5, 10, 15, 30, 50)

- What it achieved: every round began with grounded multiple-choice questions. Each question named the trade-off and had a recommended option. Scope, cost rules, test bar and shipping order were locked before any code. The assistant often read the code first, so the options described the real current behaviour.
- Template: `[describe the problem or feature]. Before we proceed, ask me at least [N] questions so you can fully understand what I'm trying to achieve. Ask the questions one at a time, and for each question, give me multiple-choice options to choose from. Clearly highlight the option you recommend and briefly explain why. Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf.`
- Sizing seen in practice: 5 for a bug pair, 10 for a feature, 15 to 30 for a new subsystem (public links), 50 for "make everything real" audits.

> **For Claude — paste this:**
> ```
> Before writing any code, read the relevant files so your questions describe current behaviour.
> Then ask me at least [N] questions, one at a time, each multiple choice.
> Mark one option "(Recommended)" and give a one-line reason for every option.
> Include questions on: scope edges, what costs the user credits, privacy, what the demo account does,
> how we test (unit + build + Playwright e2e + live staging check + CI), and how it ships (one push or staged).
> After the last answer, summarise the decisions and ask "Build it as summarised?" before starting.
> ```

### 3.2 "Ask more questions" and "re-ask"

> "1 . and also i want to change my answer for q 14 and also i feel like 15 questions didnt do justice and Before we proceed, ask me at least 15 more questions…" (2026-09-10 02:07)

- What it achieved: the revised Q14 (light avatar copy AND picture-first) and 15 extra questions on privacy, notifications, dead links and attribution. These produced a far more complete public-link design.
- Template: `[answer]. Also I want to change my answer for Q[n], and [N] questions didn't do justice — ask me at least [M] more questions…`

> "2. keep exactly as is and also re ask question 37" / "1 your recomended choice and that ask q 40 again" / "re ask q 48 and q49" (2026-09-11)

- What it achieved: the assistant re-asked with sharper options, and your free-text answers redirected the scope (AI balances plus margin, giveaways, no per-user picks).
- Template: `[answer], and re-ask question [n]`.

### 3.3 Continue-without-stopping build instruction (quoted in the resumed summary)

> "proceed to part B and all part, keep testing your self and complete the whole app without stopping." (before 2026-09-01, carried through compaction)

- What it achieved: the assistant completed Part B end to end (render, 3D from outfit, packing, surprise, compare, shop, admin), ran the pyramid, pushed, and did a live check without pausing.
- Template: `Proceed to [part] and all remaining parts. Keep testing yourself and complete [scope] without stopping. Never touch production.`

### 3.4 "Zero gaps" launch-readiness request

> "i tried and the staging look didnt work. I also feel like the ai render changes the clothes a little bit. also when it shows to compare to looks after outfit matching is used it shows the images of clothes in the box for both outfits instead it should show the actual rendering, and also if user exists before saving he is prompted that he will lose the generated outfit. i want the backend to have zero gaps and every thing should be function in app and admin both. i want it to be perfectly ready for the users and only thing to leave behind in the payment. Before we proceed, ask me at least 50 questions…" (2026-09-10 03:12)

- What it achieved: a code audit of every fake control, the "no fakes" rule, 50 decisions, a `LAUNCH-READINESS.md` checklist, five parallel build agents, one verified push.
- Template: `[list of bugs seen]. I want the [app/admin] to have zero gaps: every control must work for real in both [app] and [admin], ready for real users; the only thing left behind is [payments]. Before we proceed, ask me at least 50 questions…`

### 3.5 Audit plus features grab-bag

> "i feel like the demo closet data doesnt have the details of occasion tags and how its made. also I feel like if we give option to user for how its made section he might get over whelmed, how can we fix that. also can you do a clean audit and see if anything is still left to be done or if something is not functional in the app or admin. also I want to add more prebuild categories to the closet. also does the shop data is correctly shown and added and deleted from admin and also I want admin to be able to provide users with a shop items. furthermore if you think there is anything left to complete in the admin or user app, lets do it now? Before we proceed, ask me at least 50 questions…" (2026-09-11 01:24)

- What it achieved: three staged pushes (categories and demo; shop and admin ops; audit, help and cutover rehearsal).
- Template: `[observations]. Also do a clean audit of anything left or non-functional in the app or admin. [feature asks]. If anything else is left to complete, let's do it now. Ask me at least 50 questions…`

### 3.6 Scope guard ("nothing changes in production")

> "i will go with your recomendation only think i want to highlight that nothing gets changed in frontend repo and the assemble.ink urls remain for frontend and everything backend related stays on stagging for now" (2026-09-10 04:06)

> "never switch. switch wont be done like that so that something i ll tell you later" (carried in the summary)

- What it achieved: a hard boundary kept through compaction. Every later round said "staging only, production untouched".
- Template: `Nothing changes in [the live repo]; [live domains] stay on [live build]; everything new stays on staging until I say so.`

### 3.7 No-code explanation request

> "dont write any code but tell me: tell me one thing do we have a shop in the backend with a demo inventory? and how does the share outfit and 3d avatar work when someone copies link and share?" (2026-09-10 01:42)

- What it achieved: an honest description of what was real and what wasn't (no public links; placeholder 3D in shares). That led straight to the next feature round.
- Template: `Don't write any code, just tell me: how does [feature] actually work today when [user action]? Be honest about what is fake or missing.`

### 3.8 Plain-English status for non-technical readers

> "oka one thing i want from you, the frontend part we made step 1. can you list down in a proper manne what can we do in frontend and what will completed in next phase. dont user very technical words, simple english is best" (2026-09-04 19:26)

- Template: `List in simple English (no technical words) what the app can do today and what comes in the next phase.`

> "whats left now in step 2, we are not implementing the marketing tracker ones." (2026-09-09 22:48)

- Template: `What's left in [phase]? We are not doing [excluded items].`

### 3.9 Service how-to with links

> "how to enable : billing is enabled on that Google AI Studio project." (2026-09-04)

> "please explain in detail step by step with links on how to do Google sign-in on staging: your side…" (2026-09-12 21:34)

- What it achieved: numbered click paths with URLs, an exact value to paste, and a "if it still fails" section.
- Template: `Explain step by step with links how I do [the console change you asked me to do]. Include what to paste exactly and what to check if it still fails.`

### 3.10 Bug reports with a testing instruction

> "i tried match a closet item, what i got didnt include the closet item at all. also when i tried changing profile photo from the style and preference screen in profile. it took me to match outfit camera. Before we proceed, ask me at least 5 questions…" (2026-09-10 00:22)

> "i added a black image in closet and the ai detected it as plain black surface and is trying to style and match for it. this is a bug. every photo uploaded for the closet must be checked, right? i was using the demo account. also getting this error attached in pic when tried login with google. also i shared everyday look and copies link and pasted in browser and it showed clean and sharp instead. Before we proceed, ask me at least 10 questions…" (2026-09-11 21:38)

> answer: "1 your recomended choice and think of other such senarios too so that adding clothes to closets are very accurate and bugfree." (2026-09-11 21:40)

- What it achieved: the model proposed a family of related failure cases (ten refusal kinds) instead of patching one.
- Template: `I did [steps] on [account] and got [wrong result]; expected [right result]. [Screenshot attached]. Think of other similar scenarios too so [flow] is accurate and bug-free. Ask me at least [N] questions…`

### 3.11 Feature request that applies an existing rule elsewhere

> "uploading photos for the 2d avatar should also be checked if its correct image or not. free of charge as user uploads picture it should only accept only the appropriate photo. ? Before we proceed, ask me at least 5 questions…" (2026-09-12 21:58)

- Template: `[Other upload] should also be checked like [existing check], free of charge, accepting only appropriate photos. Ask me at least 5 questions…`

### 3.12 Returning-user onboarding bug (reasoned report)

> "I logged in with google and used my [work email] and it recognised me as the returning client then why did it ask me your style screen then Sizes and budgets screens then your 2d avatar and then new your 3d avatar - because i think these screen should be shown if i login for the first time but second time and onwards it should not show these because it for new user to set up the app kind a like onboarding." (2026-09-12 21:45)

- Template: `When I [log in again], it showed [new-user screens]. These should only show the first time. Fix so returning users go straight to [Home].`

### 3.13 Production data clean-up

> "from the frontend data can you remove/delete the users [name], [name], [name], [handle]" (2026-09-10 23:30)

- What it achieved: the assistant looked first, listed exact matches, asked with options (run now / I'll run it / skip), and only then deleted.
- Template: `From [environment] data, remove these users: [list]. Show me the exact matches first and ask before deleting anything.`

### 3.14 Credential hand-offs

> "[GitHub PAT pasted, masked here]" and "[Vercel token pasted, masked here]" (2026-09-09 23:36 and 23:38)

- What it achieved: the push resumed, and the Vercel token was verified for team scope before use.
- Better practice for the guide: put tokens in env files or a secret store instead of pasting them into chat, and tell Claude where they are.

### 3.15 Mobile packaging questions

> "just a question can we make an apk and ipa file for this?" / "can you give me a TWA (Trusted Web Activity) … for the assemble backend? just for testing" / "whre is it in local so i can copy and share?" / "so realistically if we have these ipa and apk can be used to publish this app and they will have no issue with it?" (2026-09-10)

- Template: `Can we package [app] as APK/IPA? Give me a TWA test build pointing at [staging] only. Where is the file, and what would store publishing still need?`

### 3.16 Commercial review of a document

> "is this a complete proposal do you think doesnt mention our/agency cost for doing all this. what do you think is this something the client would feel like moving forward? Before we proceed, ask me at least 5 questions…" (2026-09-08 02:47)

- What it achieved: a candid critique first (no price, no terms, no options), then a pricing and terms round.
- Template: `Is this [document] complete? It doesn't mention [missing part]. Would [reader] feel like moving forward? Give me your honest take, then ask me at least 5 questions…`

> "he doesnt want to record himself and since its 2026 i would suggest keeping him out of the marketing cuz we can create realistic ai avatar to replace him. Before we proceed…" (2026-09-08 03:29)

- What it achieved: the assistant raised disclosure rules before offering options, and the plan was rebuilt around openly-AI hosts.

> answer: "i would take the recomended option but include a breakdown so client can understand transparently about what we are charging for," (2026-09-08 03:36)

### 3.17 Interrupt and resume

> "Try again" (2026-09-01 19:40), "conitue" (2026-09-10 22:47), "continue" (2026-09-11 03:16), "contınue" (2026-09-11 22:53)

- What it achieved: the assistant resumed the interrupted run from its recorded state (in one case after a full session break, re-running only the affected specs, then the full suite).

### 3.18 Asking why it's slow

> "whyy is it taking so much time?" (2026-09-11 03:29)

- What it achieved: a breakdown of the e2e cost (about 210 tests, 2 workers, 15 to 20 minutes), why this was the third attempt, and an ETA for each remaining step.

---

## 4. Working method

### 4.1 The standard round

1. **Report or request** from you, often with screenshots and always with the "ask me at least N questions" suffix.
2. **Grounding:** the assistant reads the code, or runs an Explore/audit agent, while it starts asking. Some questions say "I'm reproducing this on staging right now".
3. **Question round** through the multiple-choice question tool, one question at a time, "(Recommended)" on one option, trade-offs spelled out. Free-text answers are respected, including ones against the recommendation. The last question is usually "Build it as summarised?" or the delivery shape.
4. **Plan summary** in chat, including trade-offs ("the one-off describe pass costs about 28 small AI calls").
5. **Build.** Small rounds are built by the main session. Big rounds use **parallel build agents**, each with a written brief, then the main session integrates shared files.
6. **Pyramid:** typecheck both apps, vitest, production builds of web and admin, full Playwright e2e locally against the staging database.
7. **Commit** under your identity with no AI attribution. A commit message file is written first, then a sweep for attribution words.
8. **Push**, then watch the staging deployments (Vercel API poll) and GitHub Actions CI in the background.
9. **Live staging check:** a node script against the deployed staging app and admin with real Gemini (demo cookie plus admin session cookie).
10. **Reset the staging demo** and clean test files from the bucket, unless the demo is in use ("The demo profile is in use right now … I left it alone").
11. **Report:** what changed, what was wrong, verification table, a **phone retest guide** (numbered steps) and loose ends.
12. **De-flake follow-up:** if CI showed a flaky retry, a test-only commit follows and its CI is watched to green.

### 4.2 Multi-agent workflows

- **Launch readiness (2026-09-10):** five agents (account/auth; shop/products/ads/brands; closet/items/outfit/progress; social/sharing/reports/support; packing/admin ops). Each agent ran its own typecheck and unit gates and reported "done and green". The main session integrated and ran the full suite.
- **Render fidelity (2026-09-10):** agents run in sequence (fidelity, then swap/removal), because they touch the same render route.
- **Categories/shop/admin (2026-09-11):** push 1 had two agents (category model; "I" = folded facts and demo seed). Push 2 had J (shop model) and K (admin operations). Push 3 had fix agents W1, W2 and A1, which **parked on a marker file** until the e2e run finished so they didn't fight the build for CPU.
- **Photo checks (2026-09-11):** P (photo checks and duplicates) and S (avatar-only sharing plus migration).
- **Research (2026-09-08):** four parallel research agents for the proposal.
- Briefs and a shared agent brief lived in the session scratchpad (`AGENT-COMMON.md`, `AGENT-H/I/J/K` briefs, `AUDIT-PLAN.md`, `CUTOVER-RUNBOOK-draft.md`).

### 4.3 Verification pyramid rules learned

- Never run tests while a build is running (a `.next` prerender manifest went missing mid-run).
- Heavy work (full e2e) runs alone. Agents wait on a marker.
- Local e2e runs against the **staging database**, so a mock can poison shared rows. Mocks must be data-neutral (category-aware).
- **Event-based assertions** on the credit ledger instead of exact balances whenever specs run in parallel.
- CI uses `workers: 1` on a shared CI database. Local uses 2.
- Playwright must not reuse an existing server. Two runs had tested a stale server left from a killed run.
- A test that is flaky only on CI and depends on UI timing can move to local-only if an API-level test still covers the pipeline in CI.

### 4.4 Phone retest guides

Every push ends with 3 to 9 numbered steps on staging using the demo profile or a real account. Each step names the screen path, the action and the expected result, and sometimes says "do this on a throwaway account, not your main one". Examples: "paste the link into WhatsApp to yourself"; "photograph a black surface … expect the refusal card"; "type 'delete' in lower case".

### 4.5 Commit and push rules

- Backend repo: author is your GitHub identity (noreply address), with no co-author line and no mention of AI in commits, docs, comments or tests.
- The commit message is written to a file first. A sweep checks the tree for attribution before committing.
- Staging-only repos deploy on push. Empty commits get cancelled by the ignored-build step, so use the Vercel redeploy API instead.
- One push per round where possible, because overlapping CI runs share the CI database. If they collide, re-run failed jobs when idle.

### 4.6 Handling interruptions and compaction

- **Compaction** happened at 2026-09-01 06:12 (start), 2026-09-10 04:15 and 2026-09-11 04:13. Each summary listed standing rules, key technical concepts, files, errors and fixes, all user messages, pending tasks, current work and the next step. Work resumed "without asking any further questions".
- A new session at 2026-09-11 22:53 ("contınue") picked up an interrupted bar. It re-ran only the specs affected by fixes, then the full suite.
- After a tool-use interruption, the same question was re-asked.
- **Watchers:** background polls for deploy READY, CI conclusion and e2e summary lines. The assistant kept replying "waiting on …, nothing independent to request" while they ran.

### 4.7 Memory

- Memory files updated during this scope: `gemini-image-billing.md`, `backend-ci-branch.md`, `vercel-token-expired.md`, `github-token-expired.md`, `share-links-and-light-avatars.md`, `launch-readiness-round.md`, plus the `MEMORY.md` index.
- Notes included "curl-check tokens before relying on them", "never re-pull env for ci-backend", "overlapping CI runs share the DB", "staging config row pinned an old model" and "Playwright must not reuse servers".

---

## 5. Services and access

| Service | What it was used for | Access given and when | Where stored | How verified | What broke |
|---|---|---|---|---|---|
| **GitHub** (two repos: front-end, backend) | code, Actions CI | Classic PAT earlier; **fine-grained PAT** issued 2026-09-09 23:36 after the old one returned 401. Steps: Settings → Developer settings → Personal access tokens → Fine-grained → only the two repos → Contents read/write, Actions read, 90+ day expiry. | Used for push only, never written into a repo | `curl` check of the token before pushing; memory note | Old PAT expired (401). A second GitHub login on the machine had no repo access. The token had **no `workflow` scope**, so `.github/workflows/ci.yml` couldn't be edited (the CI demo flag moved to `next.config.mjs`; the `concurrency` block was left for you to add). |
| **GitHub Actions secrets** (backend repo) | CI env | Set 2026-09-01: 8 secrets (database URL for the ci-backend branch, auth secret, admin secrets, storage keys) | repo secrets | re-run workflow → green | Missing at repo creation, so every CI run failed |
| **Neon** (Postgres plus per-branch object storage bucket) | databases for production, `ci` (front-end CI), `staging` (backend env files), `ci-backend` (backend CI, created 2026-09-01, forked from staging with its own `assemble` bucket) | Neon CLI and connection strings | `apps/web/.env.local` (staging), `backend/.env.ci-backend` (ci-backend, git-ignored; Neon CLI registered it in `.gitignore`), front-end `.env.local` (production) | migrations applied per branch; read-only production queries before changes | `neon env pull` for a branch **rotates the storage credentials**, which would silently invalidate GitHub secrets. A **fork of production** was made for the cutover rehearsal on 2026-09-11 and then deleted. |
| **Vercel** (team; staging app, staging admin; production app, admin, site) | hosting and deploys on push | Vercel API token; new token 2026-09-09 23:38 | used from env in the session | one API call checking team scope before polling | Token expired on 2026-09-02 (SAML "re-authenticate to this scope", 403 on team writes). Fallback: verify against live URLs. Env vars set during scope: `ADMIN_EMAIL_CC` (production admin only), `NEXT_PUBLIC_DEMO_LOGIN=1` (staging app), `AWS_*` + `NEXT_PUBLIC_WEB_ORIGIN` + `NEXT_PUBLIC_APP_URL` (staging admin), `GEMINI_API_KEY` (staging admin, for the product describer). Env changes need a redeploy. |
| **Google Gemini API** (AI Studio) | matching, detection, packing, renders, verification, describing | Key from AI Studio (agency project), **local and staging only, never production** | `apps/web/.env.local`, staging Vercel env | live calls on staging | Free tier has **zero image-model quota**, so renders failed until billing was enabled on 2026-09-09 ("Paid"). Billing lives under AI Studio → Manage → API keys → "Set up billing", not the "Upgrade" box. Cutover waits for the client's own paid key. |
| **Google Cloud OAuth client** | "Continue with Google" | Your Google account (Claude can't change it) | client id/secret already in staging env | log in on staging | `redirect_uri_mismatch` on staging until `https://<staging-app>/api/auth/callback/google` was added under Authorised redirect URIs. Production callback `https://app.<domain>/api/auth/callback/google`. If the consent screen is in Testing mode, add test users. |
| **Tripo** (3D engine) | 3D avatars | Key rotated before this scope | local and Vercel env | wallet balance read live (admin low-wallet alert) | not in this scope |
| **Email provider** (sign-in codes, ticket emails) | 2FA codes, sign-up codes, reset codes, ticket receipts and replies | existing | env | live 2FA login call returned `sentTo` both recipients | Emails were limited to codes and tickets by your rule |
| **PWABuilder** cloud packaging API | test TWA APK/AAB | no account needed | outputs in `Clients/<client-folder>/twa-staging/` (apk, aab, `signing.keystore`, key info, `assetlinks.json`), outside both repos | installed on your phone; assetlinks served at `/.well-known/assetlinks.json` | Keep the keystore: every future build of the package must use it |
| **Google Play / Apple** | discussed only | none | none | none | Play needs a developer account plus Play Billing for digital goods; Apple needs a Mac, Xcode and a paid account |

Standing secret rules seen in this scope:

- Secrets live only in env. Output is redacted.
- The ci-backend credentials are saved once and never re-pulled.
- A GitHub token is curl-checked before any push. A Vercel token is checked with one API call before polling.
- The assistant printed the admin password when asked (2026-09-01 16:23). **For the guide:** keep admin credentials in a password manager instead.

---

## 6. Commands and CLI

Tool calls are not in the archive, so the forms below come from the session summaries and replies. Where a command's exact form is inferred, it says so.

### Database and demo

```bash
# Reset the demo profile on a branch (after e2e runs and before phone retests)
DATABASE_URL=<STAGING_DATABASE_URL> npm run db:reset-demo --workspace @assemble/db

# Run a numbered migration (plain .mjs scripts in packages/db/migrations)
DATABASE_URL=<BRANCH_DATABASE_URL> node packages/db/migrations/007-launch-readiness.mjs
# (applied to staging and ci-backend; production only at cutover, after a fork rehearsal)
```

Migrations in this scope: `004-profile-picture`, `005` (google_image), `006` (share links), `007-launch-readiness`, `008-render-fidelity`, `009-category-model`, `009b-refile-items`, `010-shop-model`, `011` (help articles), `012` (avatar-only shares).

### Tests and builds

```bash
# Typecheck both apps (inferred form)
npx tsc --noEmit -p apps/web && npx tsc --noEmit -p apps/admin

# Unit tests: run from the web app folder (running from the root found no tests once)
cd apps/web && npx vitest run

# Production builds with the demo login compiled in
NEXT_PUBLIC_DEMO_LOGIN=1 npx turbo run build

# Full e2e against the staging database
E2E_DB=1 npx playwright test

# One spec file, or one test for debugging
E2E_DB=1 npx playwright test tools/e2e/storage.spec.ts
E2E_DB=1 npx playwright test tools/e2e/share.spec.ts -g "<test name>"
```

Playwright config facts:

- `webServer.env` sets `TRIPO_MOCK=1` and `GEMINI_MOCK=1`.
- `workers: process.env.CI ? 1 : 2`.
- `channel: "chromium"` with fake camera flags.
- No server reuse.
- Servers keep sockets alive for 60s.

### Deploy watching and redeploys (Vercel REST API)

```bash
# Verify a token has team scope before relying on it (inferred form)
curl -s -H "Authorization: Bearer <VERCEL_TOKEN>" "https://api.vercel.com/v2/user"
curl -s -H "Authorization: Bearer <VERCEL_TOKEN>" "https://api.vercel.com/v6/deployments?teamId=<TEAM_ID>&projectId=<PROJECT_ID>&limit=1"

# Force a redeploy (empty commits are cancelled by the ignored-build step)
curl -s -X POST -H "Authorization: Bearer <VERCEL_TOKEN>" -H "Content-Type: application/json" \
  "https://api.vercel.com/v13/deployments?teamId=<TEAM_ID>&forceNew=1" \
  -d '{"name":"<project-name>","deploymentId":"<LAST_DEPLOYMENT_ID>","target":"production"}'
# or with "gitSource":{"type":"github","repoId":"<REPO_ID>","ref":"main"}
```

A `poll-deploys.mjs` / `poll-staging.mjs` node script polled until READY. It once got a response with no `deployments` array, which pointed to an expired token or a rate limit.

### GitHub

```bash
# Check the PAT before pushing (inferred form)
curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer <GITHUB_PAT>" https://api.github.com/repos/<OWNER>/<REPO>

# Commit with a message file, no attribution trailer
git -c user.name="<GITHUB_USER>" -c user.email="<GITHUB_USER>@users.noreply.github.com" commit -F commit-msg.txt
git push https://<GITHUB_PAT>@github.com/<OWNER>/<REPO>.git main   # token never stored in the remote URL permanently

# Watch CI, read failing logs, download a trace artifact (inferred forms)
gh run list --repo <OWNER>/<REPO> --limit 3
gh run watch <RUN_ID> --repo <OWNER>/<REPO>
gh run view <RUN_ID> --log-failed --repo <OWNER>/<REPO>
gh run download <RUN_ID> -n <artifact-name> -D scratchpad/ci-traces
gh run rerun <RUN_ID> --failed --repo <OWNER>/<REPO>
```

Suggested CI concurrency block (you add it, or grant the `workflow` scope):

```yaml
concurrency:
  group: ci-backend-db
  cancel-in-progress: false
```

### Live verification scripts (node, in the scratchpad)

- `verify-render.mjs`, `verify-share.mjs`, `verify-item-paths.mjs`, `live-pass.mjs`, `live-hoodie.mjs`, `live-refusal.mjs`, `live-push1.mjs`. They call the deployed staging APIs with `fetch`, a demo cookie (`assemble-demo=1`) and an admin session cookie (signed with the admin session secret from `apps/admin/.env.local`).
- The black-photo check used a real black JPEG.
- Link creation answers **201**, not 200.
- Public votes need the device id the page sends.
- The public share page is client-rendered, so curl on `/s/<token>` proves nothing. Use a real browser.

### Other one-offs

- **Bucket cleanup:** S3 List/Delete with the env from `apps/web/.env.local`.
- **GLB compression benchmark:** a script copied into `apps/web` to resolve modules. gltf-transform `dedup`, `weld`, `simplify` (ratio 0.06, error 0.005), `prune` with meshoptimizer.
- **Edit scripts:** `apply-*.cjs` files written with the Write tool and run with `node`. Inline `node -e '…'` and heredocs broke on apostrophes and em dashes.
- **Production deletion script:** run from the repo root for ESM resolution, made schema-aware, required your explicit approval.
- **Deleting an account safely as a test:** run the full delete sequence inside a transaction and roll it back.

---

## 7. Testing and verification

### Counts over time (backend unless noted)

| Date | Round | Unit | e2e | Notes |
|---|---|---|---|---|
| 09-01 | Part B | 42 | 56 passed, 26 skips | live Gemini match 9.8s, pack 5.9s |
| 09-01 | Samsung r1 (front-end) | n/a | 53 | 3 new PWA specs |
| 09-01 | Samsung mirror | n/a | 56 | |
| 09-02 | Profile pictures | FE 29 | FE 57, BE 63 | 4 new profile specs |
| 09-09 | Profile upload | 42 | 67 | 3 new |
| 09-10 | Required item | 46 | 70 | 4 unit + 3 e2e new |
| 09-10 | Share links | 55 | 72 | 9 unit new; 3D case self-skips without avatars |
| 09-10 | Zero gaps | 148 (16 files) | 18 spec files green | copy audit test; 30-check live pass |
| 09-10 | Fidelity + swaps | 182 | render/swap/closet/flow/share/storage subset | live hoodie render |
| 09-11 | Push 1 | 214 | about 210 tests / 20 files | 4 spec-side fixes |
| 09-11 | Push 2/3 | 249 → 263 (21 files) | full suite | price double-scale bug caught |
| 09-11 | Photo checks + avatar share | 279 | full suite | one connection-reset flake re-run |
| 09-12 | Onboarding/delete + avatar photo checks | 289 | full suite | |

CI durations: 7m25s, 4m57s, 5m9s (FE), 5m49s (FE), 5m2s (FE), 5m22s, 4m28s, 5m39s, 6m10s. Later runs used a single worker and took about 10 minutes.

### How things were tested

- **Mocks:** `GEMINI_MOCK=1` and `TRIPO_MOCK=1` in the Playwright webServer env.
  - The mock detect returns a fixture.
  - The mock match builds outfits from the user's real closet by category.
  - The mock render sets a seed image.
  - The mock describer later became **category-aware** so it wouldn't write hoodie facts onto every item.
  - The mock scene is driven by the request body so refusal paths can be tested.
- **Test DBs:** local e2e hits the **staging** Neon branch (`E2E_DB=1`). CI hits `ci-backend`. Front-end CI used `ci`. Global setup resets the demo and creates throwaway accounts (buddy, storer, and later a dedicated `changer` account for the password-change test) with a password that meets the strength rules. Global teardown deletes them, their bucket files and new-table rows (blocks, saved products, product feedback, content reports).
- **Targeted vs full runs:**
  - After fixing spec failures, only the affected spec files are re-run on fresh servers, then the full suite before the push.
  - One fix round ("One small fix push, full test bar") chose the full bar over targeted tests.
  - The e2e subset was used for render/swap rounds.
- **PWA specs:** manifest fields, color-scheme meta, the Samsung banner copy, a synthetic `beforeinstallprompt` exercising the real banner.
- **Share specs:** create link, open logged-out, vote, revoke/re-enable, 3D share, item button; spec cleans links and responses first for CI retries.
- **Live checks on staging with real models:** match (both item paths), detect, pack, render (cached second call, paid swap re-render), hoodie fidelity, refusal of a worn outfit and a black frame, public link in a real browser, stranger vote tally, dead link after turning off, admin describer with a live key, hide and restore, help centre, avatar-photo refusal, someone else's upload key refused, returning-account landing.
- **Emulation:** Samsung Internet user agent; `.sbrowser` fallback visually simulated in a browser; 360px layouts and dark/light schemes in the audit.
- **Visual checks:** the hoodie render was inspected ("worn closed with the hood up under the open denim jacket"). A contact sheet was proposed for demo looks (not needed).
- **Copy audit:** a unit test scans both apps for banned phrases (roadmap names, "prototype", "(demo)", "placeholder").
- **Proving a destructive path without doing it:** delete sequence inside a rolled-back transaction.
- **Cutover rehearsal:** migrations 004 to 011 plus config and verify scripts on a production fork.

---

## 8. Security

- **Staging isolation:** separate Neon branches and separate Vercel projects. The Gemini key is kept off production. Production is untouched without an explicit instruction.
- **CI isolation:** a dedicated `ci-backend` branch with its own bucket, so tests never touch staging or production data.
- **Secrets:**
  - Env files only (`.env.local`, `.env.ci-backend` git-ignored), GitHub secrets, Vercel env.
  - Output redacted. Tokens used for the push only, never stored in the repo.
  - Never re-pull env for a branch whose credentials feed GitHub secrets.
  - Fine-grained PAT with only the two repos, Contents read/write and Actions read.
- **Admin 2FA:**
  - Always on, with emailed codes.
  - Extra recipients through `ADMIN_EMAIL_CC` (only the sign-in code, not other alerts). Later editable in admin settings.
  - Admin password moved to a hashed value in an `admin_settings` row, with a real change-password.
  - Signed admin session token.
  - Left open: 2FA attempt limit and server-side session revocation.
- **User auth:**
  - Password reset by a 6-digit emailed code (`auth_codes.purpose`).
  - Real change-password that verifies the current one, plus strength rules (8+ characters with a number).
  - Google-only accounts see "You sign in with Google".
  - Onboarding decision on a landing page for Google sign-ins.
- **Identity leaks fixed:** the profile read the browser's Google session when the server profile hadn't loaded. Identity now comes from the server only.
- **Public share links:**
  - Unguessable 22-character tokens. Explicit creation. Revocable. Re-enabling issues a new code.
  - The dead page is the same for revoked and nonexistent codes (no enumeration).
  - Only first name and profile picture shown. No closet photos, email, username or prices.
  - One vote per device. Per-device comment rate limit. Links and over-long text refused.
  - Report flow to the admin Reports page. The sharer can delete responses.
- **Storage:**
  - A private bucket per branch behind an auth proxy `/api/storage/[...key]` that only serves the caller's own `u{id}/` prefix.
  - Immutable cache, with unique keys for every new file.
  - The live check confirmed **someone else's upload key is refused**.
  - Light share copies are served separately; full-quality avatars stay private to the owner.
- **Consents:** AI photo analysis and photo ownership recorded with timestamps. Detection, renders and 3D builds refuse to run without them.
- **Blocking:** blocked users can't share with you, find you or see your links; unblock in Settings.
- **Privacy by design:** admin user detail shows names and counts, never wardrobe photos or renders. Account deletion cascades to all new tables and removes storage files. "Remove avatar data" really deletes photos, renders and avatars.
- **Photo checks (safety and quality):** closet photos with faces or mirror selfies are refused (faces are kept out of closet AI calls); 2D and 3D base photos must show exactly one person. Refused photos are never stored.
- **AI safety:** an admin safety-filter switch sets the provider's safety level for renders and detection. Auto-flag marks users over a daily credit threshold. A daily AI cap per user. AI budget warnings at 80% and 100%.
- **Dead code removal:** all placeholder admin dialogs and the fake brand partner page deleted, so no fake data paths remain reachable.
- **Demo hardening:** the demo login is hidden on the public login (compiled in only with `NEXT_PUBLIC_DEMO_LOGIN=1`) and reachable at `/demo`. The demo can't be deleted (403 in admin; its own message in the app). Nightly reset clears demo links and data.
- **Production data changes:** read-only inspection first, exact matches shown, explicit approval. The desktop safety classifier blocked the destructive run until you approved it.
- **Migrations:** additive, rehearsed on a production fork, and applied to production only at cutover (never ahead, because the live build would see side effects).
- **Samsung "unsafe app" warning:** avoided by routing Samsung Internet users to Chrome instead of a flow Play Protect flags.
- **Mobile packaging:** keystore kept outside repos and private. Asset links file ties the domain to the signing key.
- **Legal:** plain-English Privacy and Terms drafts that match real behaviour, editable in admin for counsel review. Prototype wording removed. The FTC and platform synthetic-media disclosure rules were checked for the AI-host marketing plan.

---

## 9. Pitfalls

**1. CI red on every commit of a new repo**
- Symptom: GitHub Actions failure emails on every push.
- Cause: the workflow was copied with the codebase, but the new repo had no Actions secrets.
- Fix: a dedicated Neon CI branch plus 8 secrets, then re-run.
- Prevent: when you clone a repo into a new one, set the CI secrets and a CI database branch before the first push.

**2. `neon env pull` rotates credentials**
- Symptom: GitHub secrets stop working after pulling env.
- Cause: pulling env for a branch rotates its storage credentials.
- Fix: save the branch credentials once in `.env.ci-backend`.
- Prevent: never re-pull env for a branch that feeds CI secrets; write it in memory.

**3. Image model zero free quota**
- Symptom: "quota exceeded" on every render while text models work.
- Cause: Google gives image models no free tier.
- Fix: enable billing on the AI Studio project (the same key becomes paid). Meanwhile show a friendly message and don't charge.
- Prevent: enable billing before building image features, or plan a mock-only phase.

**4. Samsung Internet grey whites**
- Symptom: the white logo and wordmark look grey in dark mode only.
- Cause: gradient backgrounds clipped to text are darkened by Samsung's forced dark mode. A `color-scheme: dark` meta isn't enough.
- Fix: detect Samsung (`.sbrowser`), render flat white, and declare `color-scheme: only light`.
- Prevent: avoid `background-clip:text` gradients on key brand text, or ship a flat-colour fallback from day one; test in Samsung Internet with dark mode on.

**5. Samsung Internet install blocked by Play Protect**
- Symptom: "Couldn't install web app" / unsafe app warning.
- Cause: Samsung's WebAPK packaging service, not your manifest.
- Fix: harden the manifest (id, scope, display_override, maskable icons) and replace the install button on Samsung with a "use Chrome" guide sheet.
- Prevent: plan install guidance per browser; only a store listing removes the warning.

**6. Profile showed the wrong identity**
- Symptom: the demo profile showed your email.
- Cause: the UI fell back to the browser's Google session while the server profile was loading.
- Fix: read identity only from the server.
- Prevent: never mix client auth-session data into profile UI; verify in the database before "fixing" seed data.

**7. "Avatar" means two things**
- Symptom: the plan targeted the wrong feature.
- Cause: in this app "avatar" meant the 3D model, while you meant the profile picture.
- Fix: rename the component to `ProfilePic` and restate the scope.
- Prevent: keep a glossary of overloaded words in the project brief.

**8. Vercel token expired (SAML team)**
- Symptom: 403 "re-authenticate to this scope", or an API response with no `deployments`.
- Cause: team tokens expire periodically.
- Fix: issue a new token; verify against live URLs meanwhile.
- Prevent: one API call to check the token before polling; issue long-lived tokens before cutover day.

**9. GitHub PAT expired / no workflow scope**
- Symptom: push 401. Can't edit `.github/workflows`.
- Cause: expiry; a fine-grained token without the workflow permission.
- Fix: new fine-grained PAT; move CI-only env into `next.config.mjs` (`CI && !VERCEL`).
- Prevent: curl-check before pushing; grant the workflow scope if CI files will change; set a 90+ day expiry.

**10. Empty commits cancelled on Vercel**
- Symptom: a redeploy for env changes never builds.
- Cause: the ignored-build step (turbo-ignore) cancels commits with no relevant changes. The admin deploy was also cancelled when only web changed, which is expected.
- Fix: `POST /v13/deployments?forceNew=1` with `deploymentId` or `gitSource`.
- Prevent: use the redeploy API after env changes.

**11. Exact balance assertions flake**
- Symptom: credit-balance tests fail randomly.
- Cause: parallel spec files spend and buy demo credits at the same time.
- Fix: assert ledger events (pack count +1, balance in a range).
- Prevent: never assert exact shared counters in e2e.

**12. CI runs overlap on a shared DB**
- Symptom: the password-swap race; an "(e2e)" legal row seen by another run.
- Cause: back-to-back pushes run CI at the same time against one database.
- Fix: `workers: 1` on CI; a dedicated account for the password-change test; re-run failed jobs when idle.
- Prevent: add a `concurrency` group to the workflow; push once per round.

**13. Test run during a build**
- Symptom: spec "failures" with a missing prerender manifest.
- Cause: `.next` was being regenerated while Playwright started a server.
- Fix: wait for the build, then re-run.
- Prevent: never run tests and builds in parallel; agents wait on a marker.

**14. Stale server reused**
- Symptom: two e2e runs passed against old code.
- Cause: Playwright reused a server left from a killed run.
- Fix: disable server reuse.
- Prevent: `reuseExistingServer: false`; kill leftover ports after aborting.

**15. Mock poisoned staging data**
- Symptom: the verifier flagged a correct render; items had hoodie facts.
- Cause: local e2e against staging used a mock describer that wrote the same facts onto every item.
- Fix: a category-aware mock plus a demo reset.
- Prevent: mocks that write to a shared database must produce plausible, input-dependent data, or tests should use an isolated branch.

**16. Public share page blank on phones**
- Symptom: a dark empty page.
- Cause: the page lived outside the app shell, so its content rendered behind the fixed background layer.
- Fix: `app/s/layout.tsx` wrapping the page in the shell structure.
- Prevent: open every public route in a real logged-out browser as part of the live check (curl can't see client-rendered pages).

**17. sharp failed on avatar textures**
- Symptom: "colourspace: parameter space not set" in any version.
- Cause: texture compression through sharp on these GLBs.
- Fix: geometry-only compression (dedup, weld, simplify, prune); drop sharp. 41 MB became 3.9 MB in 3.9s.
- Prevent: benchmark compression on a real asset before committing to a pipeline.

**18. Shell-quoted scripts broke**
- Symptom: `node -e` and heredoc scripts failed ("unexpected EOF", a mangled regex that broke a spec).
- Cause: apostrophes and em dashes in single-quoted bash; Python was unavailable.
- Fix: write edit scripts as `.cjs` files with the Write tool, or use Edit.
- Prevent: never inline multi-line JS in shell quotes.

**19. Scratch scripts committed / can't resolve modules**
- Symptom: `ERR_MODULE_NOT_FOUND`; scratch files swept into commits by `git add -A`; top-level await failing in `.ts` (CJS).
- Cause: scripts outside the workspace; broad git add; tsx treats `.ts` as CJS.
- Fix: run scripts from inside `apps/web` and delete them afterwards; use `.mts`; keep scratch files in the scratchpad.
- Prevent: stage explicit paths; keep scratch out of the repo.

**20. Toasts block clicks in admin specs**
- Symptom: clicks intercepted.
- Cause: admin toasts were blocking dialogs.
- Fix: specs click OK. Later, success messages became a bottom bar and errors stayed dialogs.
- Prevent: use non-blocking success feedback.

**21. Service worker blocks route mocks**
- Symptom: `page.route` mocks ignored.
- Cause: the PWA service worker intercepts fetches.
- Fix: `browser.newContext({ serviceWorkers: "block" })`.
- Prevent: block service workers in e2e contexts that mock network calls.

**22. Seed queries didn't refetch**
- Symptom: seed catalog data showed for 60s.
- Cause: `initialData` counted as fresh.
- Fix: `initialDataUpdatedAt: 0`.
- Prevent: when seeding React Query with placeholders, mark them stale.

**23. Config row overrides code defaults**
- Symptom: staging kept using the old image model after the default changed.
- Cause: the saved config row in the database pinned the previous value.
- Fix: PUT through the admin config API.
- Prevent: at cutover, update production's config row too (it's in the runbook).

**24. One-level-deep merge wiped photo slots**
- Symptom: the Style profile photo disappeared after adding a second photo, although renders still used it.
- Cause: the PATCH shallow-merged `styleProfile`, so the photos object was replaced.
- Fix: per-slot merge; null clears one slot.
- Prevent: deep-merge nested JSON profile fields and test "add second value, first survives".

**25. Bundled demo data vs database rows**
- Symptom: share-as-3D was greyed out on the demo.
- Cause: the demo avatars were a code list, while share features read database rows.
- Fix: the demo reset inserts them as real rows.
- Prevent: demo content must use the same storage path as real data.

**26. Avatar share fell back to a different look**
- Symptom: sharing "Everyday" opened "Clean and sharp".
- Cause: a silent fallback when an avatar wasn't tied to a look.
- Fix: avatar-only shares.
- Prevent: never silently substitute data; fail or ask.

**27. Google `redirect_uri_mismatch` on staging**
- Symptom: Google sign-in fails on the staging URL.
- Cause: the OAuth client lists only the production callback.
- Fix: add `https://<staging>/api/auth/callback/google` in Google Cloud Console → Credentials → OAuth client → Authorised redirect URIs.
- Prevent: register staging callbacks when creating staging projects.

**28. Returning Google users re-onboarded**
- Symptom: set-up screens shown on every Google sign-in.
- Cause: no "set-up done" state was checked after the OAuth callback.
- Fix: a landing page that decides by set-up flag, style profile, or account age over 15 minutes; finishing or skipping sets the flag.
- Prevent: store onboarding completion on the account.

**29. Delete account "didn't work"**
- Symptom: nothing happened.
- Cause (likely): the confirm word had to be typed in capitals. It could also be the demo guard.
- Fix: case-insensitive word, "Deleting…" state, no double tap, server reason shown, full reload on success. The server path was proven in a rolled-back transaction.
- Prevent: e2e the delete flow on a throwaway account; show server errors.

**30. Test order in serial files**
- Symptom: the landing test saw a "returning" user.
- Cause: it ran after the onboarding test in the same serial file.
- Fix: run it first while the account is seconds old.
- Prevent: keep state-dependent tests independent or ordered deliberately.

**31. Local connection resets**
- Symptom: random "connection reset" on the first request.
- Cause: the local server closed idle sockets after 5s.
- Fix: keep-alive of 60s on local servers.
- Prevent: set the keep-alive timeout in the test server config.

**32. Test password vs new strength rules**
- Symptom: nine login failures in a cascade.
- Cause: the test accounts' password failed the new rules.
- Fix: a strong test password and a dedicated account for password changes.
- Prevent: update fixtures whenever validation rules change.

**33. Price scaled twice**
- Symptom: an admin price of 120 became 1,200,000 (minor units).
- Cause: conversion applied in both the form and the API.
- Fix: convert once; caught by local e2e before the push.
- Prevent: e2e the admin edit-and-reload round trip for money fields.

**34. CI-only UI flake (3D consent flow)**
- Symptom: passed locally, failed on CI with early 401s and the consent PATCH never fired.
- Cause: not determined.
- Fix: moved that UI test to local-only; the API-level 3D test stays in CI.
- Prevent: download CI traces (`gh run download`) to inspect them; prefer API-level tests for pipelines.

**35. Question answered with an instruction**
- Symptom: a question's answer was the "ask me questions" text.
- Cause: a paste slip.
- Fix: the assistant used the recommended option.
- Prevent: re-read answers before submitting; the assistant can re-ask when an answer is ambiguous.

**36. Network outage mid-migration**
- Symptom: the migration couldn't reach Neon.
- Fix: a retry loop until the network returned.
- Prevent: migrations must be idempotent so a retry is safe.

**37. A working-tree edit silently reverted**
- Symptom: a spec change disappeared.
- Cause: unknown (possibly an agent or tool overwrite).
- Fix: re-applied with Edit and pushed alone.
- Prevent: commit small fixes immediately; `git diff` before each push.

**38. Password printed in chat**
- Symptom: the admin password appeared in the transcript.
- Cause: you asked, and it was answered from memory.
- Prevent: keep credentials in a password manager; never put them in memory files or chat.

---

## 10. Code and templates worth reusing

Paths are relative to the backend repo root unless marked. File contents weren't in the archive; the descriptions come from the summaries.

### Docs and runbooks

- `LAUNCH-READINESS.md`: the zero-gap checklist. Sections A (trust fixes), B (customer features), C (admin), D (verification and cutover), E (render fidelity), F (category model), G (shop and admin ops), H (audit fixes and leftovers). Every row is ticked with the test that proves it. **Template for any "make it production-ready" round.**
- `CUTOVER-RUNBOOK.md`: rehearsed cutover sequence covering migrations in order, env vars, config PUTs (for example the image model), the Google callbacks, the 2FA CC mirror and a verify script. Domains untouched until the switch.
- `README.md`: a clean, client-presentable description (no AI mentions).
- `UI/Assemble-Social-Launch-Proposal.md` (outside the backend repo): an agency proposal template. Executive summary, why now, research, strategy, 12-week calendar, scripts, creator program, packages with a transparent breakdown, terms, what the client provides.
- `UI/AI-COST-REPORT.md/.html` (out of scope here; mentioned in git status).

### Database

- `packages/db/migrations/NNN-*.mjs`: plain node migration scripts run with `DATABASE_URL`, additive and idempotent. `009b-refile-items` is a name-rule bulk re-categorisation that prints leftovers for review.
- `packages/db/src/schema.ts`: Drizzle schema. `AppConfigData` holds admin-editable config: costs, AI models, `aiDailyCap`, `safetyFilter`, `autoFlagDaily`, `plans` (PlanConfig), `shopCurrency`, `aiBudget` (AiRates/AiBudget); `CONFIG_STRING_KEYS`; `CATEGORY_GROUPS`; `GarmentConstruction`.
- `packages/db/src/data.ts`: seed closet (with colour, season, occasions and construction facts frozen from one AI pass) and seed products.
- `packages/db/src/helpArticles.ts`: 12 seeded help articles.
- `packages/db/src/aiSpend.ts`: spend estimator (per-call rates, threshold state, month-end projection, warnings, giveaway valuation).
- `npm run db:reset-demo --workspace @assemble/db`: demo reset used after tests and nightly (now inserts demo avatars as real rows and clears demo share links).

### Web app (apps/web)

- `lib/gemini.ts`: `generateJson<T>({model, system, user, images, schema})` with responseSchema, and `generateImage({model, prompt, images})` with `responseModalities:["IMAGE"]`, a safety option, and a `geminiMocked()` switch.
- `lib/aiPrompts.ts`: pure prompt builders and validators with unit tests:
  - detect schema with scene fields (`single|multiple|worn`, confidence) and `detectRefusal` / `REFUSAL_MESSAGES`
  - match prompt with `mustIncludeNote` and `enforceRequiredItem`
  - pack prompt (per-day outfits)
  - `buildRenderPrompt(pieces)` with a strict-fidelity block and construction facts
  - `buildVerifyPrompt` with layering rules
  - reasons refresh
  - **Pattern to reuse: keep prompts and validators pure, and unit-test them.**
- `lib/aiGuards.ts`: live config, per-user daily AI cap, `charge()` / `refund()` (charge before the call, refund on failure).
- `app/api/ai/{match,detect,render,pack}/route.ts`: charge, then call, then persist, then refund on failure. Render has `maxDuration 120`, lazy describe, verification, `again` retry, and server-side swaps and removals.
- `lib/shareLinks.ts`: `newShareToken`, `isShareToken`, `firstNameOf`, `validatePublicResponse`, `tallyOf`, notification grouping.
- `lib/shareModel.ts`: `ensureShareModel` / `compressGlb` (geometry-only gltf-transform) and `sweepShareModels`.
- `lib/publicShare.ts`, `app/s/layout.tsx`, `app/s/[token]/page.tsx` (`generateMetadata` for the OG preview), `components/PublicLook.tsx`, `app/api/s/[token]/{route,asset,report}`: the public page stack.
- `components/ProfilePic.tsx`: photo-or-initials on a brand gradient.
- `components/ConstructionChips.tsx` + `lib/constructionSummary.ts`: the folded "how it's made" line with Edit.
- `lib/itemFields.ts` (`buildCategoryIndex`, `roleOf`, `isOnePiece`, `isStyled`, `groupOf`), `lib/swapRank.ts`, `lib/closetFilters.ts`, `lib/packingEssentials.ts`, `lib/shopFilters.ts`, `lib/plans.ts` (`formatMoney`), `lib/aiSpendCheck.ts`.
- `components/LookThumb.tsx`: render-or-mosaic thumbnail with `wornImg` helper.
- `app/(auth)/demo/page.tsx`: hidden demo entry. `middleware.ts` open routes (`/demo`, `/s/`).
- `public/.well-known/assetlinks.json` (or a route): TWA domain verification.
- `next.config.mjs`: sets `NEXT_PUBLIC_DEMO_LOGIN` when `CI && !VERCEL`.

### Admin app (apps/admin)

- `app/api/admin/config/route.ts`: validated PUT for numeric, string (model ids by regex), boolean and plans config.
- `(panel)/ai/page.tsx`: model selectors, daily cap, AI accounts card (3D wallet live, Gemini budget entered).
- `(panel)/users/[id]/page.tsx` + API: user detail with names only, cascade delete, demo 403.
- `(panel)/taxonomy/page.tsx` + API: groups, flags, retire with a required `moveTo`, restore; DELETE returns 409 when items exist.
- Products page and API: hide/restore/describe, `deletable`, photo upload to storage. `lib/describe.ts` (product facts on save). `lib/notify.ts` `notifyAdmin`. `api/admin/ai-spend`. Reports page. Broadcast targeting with a preview count.

### Tests

- `playwright.config.ts`: mocks env, `workers: CI ? 1 : 2`, chromium channel with fake media, no server reuse.
- `tools/e2e/global-setup.ts` / `global-teardown.ts`: demo reset and throwaway accounts with cleanup.
- `tools/e2e/*.spec.ts`: `ai.spec.ts` (with an `ensureCredits` helper), `share.spec.ts`, `flows.spec.ts` (event-based purchase checks), `storage.spec.ts` (self-correcting `expect(...).toPass()` loop pattern), `admin-ops.spec.ts`, `social.spec.ts`.
- `apps/web/tests/*.test.ts`: `aiPrompts.test.ts`, `shareLinks.test.ts`, `aiSpend.test.ts`, and a **copy audit** test.

### Scratchpad templates (session-local, worth recreating)

- `AGENT-COMMON.md` plus per-agent briefs: shared rules for build agents (no attribution, file ownership, run typecheck and unit on your files, don't run e2e, park on a marker file while the main e2e runs, report "done and green").
- `AUDIT-PLAN.md`: every screen and admin page; loading, empty and error states; 360px; dark/light; >2s pages; copy tone.
- `CUTOVER-RUNBOOK-draft.md`.
- `live-*.mjs`, `verify-*.mjs`, `poll-deploys.mjs` / `poll-staging.mjs`: live pass and deploy poll scripts.
- `commit-msg-*.txt`: message files.
- `seed-facts.json`: the reviewed one-off AI describe output frozen into the seed.

### Paste-ready blocks

> **For Claude — paste this (build-agent brief skeleton):**
> ```
> You are build agent [X] for [round]. Own only these files: [list]. Do not edit shared files [list]; note needed changes in your report.
> Rules: no AI attribution anywhere; follow existing patterns in [paths]; every behaviour change gets a unit test in apps/web/tests or an e2e case in tools/e2e.
> Gates before reporting: typecheck the app(s) you touched; run vitest for your test files. Do NOT run builds or Playwright.
> If the file [scratchpad]/E2E-RUNNING exists, wait until it is gone before typechecking.
> Report: files changed, tests added, checklist rows (LAUNCH-READINESS.md section [S]) you completed, and anything left for integration.
> ```

> **For Claude — paste this (end-of-round verification):**
> ```
> 1. Typecheck web and admin. 2. cd apps/web && npx vitest run. 3. NEXT_PUBLIC_DEMO_LOGIN=1 npx turbo run build.
> 4. E2E_DB=1 npx playwright test (never while a build is running). Fix failures, re-run the affected specs, then the full suite.
> 5. Write the commit message to a file; sweep for AI attribution; commit as <GITHUB_USER> <noreply>; push.
> 6. Watch both staging deployments to READY and GitHub Actions to success in the background.
> 7. Run the live staging script against real models; open public pages in a real browser.
> 8. Reset the staging demo (unless in use) and clean test files from the bucket.
> 9. Report: what changed, root causes, a verification table, a numbered phone retest guide, loose ends. Production untouched.
> ```

---

## 11. Session running

- **Model:** the archive doesn't name the model used for this conversation. The assistant ran long autonomous stretches with parallel sub-agents, and one reply mentions an interrupted tool use.
- **Session length:** the source JSONL is 52.9 MB for 2026-09-01 to 2026-09-17: 606 user messages and 931 replies and questions across the whole file (this scope covers roughly the first half). **Context compaction** happened at least three times in scope (start of 09-01, 09-10 04:15, 09-11 04:13). One more break happened when a new session resumed with "contınue" (09-11 22:53).
- **Durations seen:**
  - Full e2e: 15 to 20 minutes per clean run (about 210 tests, 2 workers). The first backend runs took about 5 to 12 minutes with 56 to 72 tests.
  - CI: 4.5 to 7.5 minutes early on, about 10 minutes later with 1 worker.
  - Vercel deploy: 4 to 5 minutes.
  - Commit and push: 1 minute. Live pass: 1 minute.
  - Real Gemini latencies: match 9.5 to 11s, detect 14s, pack 5.9s, render 9.8s (cached under 1s), refusal 5s.
  - GLB compression: 3.9s.
  - The zero-gap round ran from 03:12 (questions) to 06:41 (CI green). The 50-question category/shop/audit round ran from 01:24 to 06:11 for three pushes.
- **Background tasks:** e2e runs, deploy polls and CI watches ran in the background with notifications. "Summary-line watchers" tailed the Playwright output. The assistant explicitly avoided running anything CPU-heavy in parallel with builds and e2e.
- **Parallel agents:** up to five build agents at once (launch readiness), agent pairs for later pushes, and fix agents parked on a marker file until e2e finished. Four research agents for the proposal.
- **Parallel repos:** front-end and backend pyramids were staggered so they didn't fight for CPU ("the heavy build/e2e waits until the front-end run finishes").
- **Resuming work:**
  - After compaction, the summary's "Current Work" and "Optional Next Step" drove the resume without new questions.
  - After a killed run, a leftover in-flight request broke global setup once. Re-run clean.
  - Local commits (for example `745b11c`) kept one round separate while an agent edited the next.
- **Machine constraints:** Windows; Python unavailable (use node or Edit); a network outage once (retry loop); full Chrome in Playwright is heavy, so 2 workers.
- **Limits hit:** Google image quota (billing); expired Vercel and GitHub tokens; missing token `workflow` scope; the desktop app's safety check on destructive production actions (needed your explicit choice).
- **Worktrees:** none used in this scope. Two separate local folders served as the two repos (`UI/front end` frozen, `UI/backend` active).
