# Source notes r2-wireframes-b — prototype revisions, Additional Modules, 3D avatar branch, handoff; plus four Sept side tasks

Scope read in full:
- `Project History/chats/2026-07-14-wireframes.md` lines 4193–10216 (dates 2026-07-21 → 2026-08-05). This is the late "UI prototype" phase: one self-contained greyscale HTML prototype (customer app + admin panel) deployed on Vercel from GitHub, revised in many small rounds with the client, then an "Additional Modules" sales document, then the first paid feature (Personal 3D Avatar, via Tripo) built on a review branch, and finally a handoff doc + new repo that became the seed for the full-stack build.
- `2026-09-13-side-task-account-file-cleanup.md`, `2026-09-13-side-task-avatar-front-facing.md`, `2026-09-13-side-task-e2e-fixture-cleanup.md`, `2026-09-14-side-task-awesome-bohr.md` — four one-message background tasks run against the real backend monorepo in September (full-stack era). They are the best examples in the archive of a **self-contained task brief** with repo rules baked in.

Conventions used here: "you" = the developer/user; "the client" = the person the app is built for. Demo people inside the prototype (friends, sample admin users) are called "demo friend A/B/C" or "a demo user". No secrets appear; where the chat showed a masked token it is written `<GITHUB_PAT>`. Your GitHub account handle is written `<your-github-user>`.

---

## 1. Timeline

### 2026-07-21 (early hours, continuing a long revision session on branch `client-revisions-1`)
- 05:34 — you report "blank screen" when opening Admin panel from the launcher. Cause: two back-to-back CSS/HTML fixes collided (see Pitfalls). Fixed and pushed `6920d4e`. Claude verified login visible, login → dashboard, all 13 admin screens inside the scroll container, 0 console errors.
- 05:46 — Admin "Ads & Featured": campaigns are brand promotions, not product promotions → removed TYPE column, removed "Product (uses its image)" dropdown, added a Description field (example "Up to 30% off belts and accessories."). Pushed `95a3d47`.
- 05:53 — removed the helper note from New/Edit campaign forms; split the Dates column into Start and End columns. `636b015`.
- 05:59–06:10 — you ask what "Wear today" does; discussion; you choose (via a question round) "Toggle with undo" + "live per-item wear counts on the outfit detail". Built: button toggles to "✓ Worn today", each owned item's "worn N×" count increments live, a "Logged to your outfit history" note appears, stays on the screen; tapping again undoes. `2f36ec8`.
- 06:14 — removed Export CSV from admin Reports & Analytics. `30a53e3`.
- 06:15 — "are we ready to merge?" → Claude ran a full final check (structural audit: 0 broken links/dead controls; admin login → dashboard; all 13 admin screens; customer crawl 49 screens / 422 controls / 0 broken modal links; no horizontal overflow at 1280px; 0 console errors; git clean, 10 commits ahead). Recommended a 60-second manual click-through because screenshots were failing all session.
- 06:18 — "merge" → fast-forward merge `client-revisions-1` → `main`, pushed; production (the Vercel site `assemble-wireframes-version-1.vercel.app`) at `30a53e3`.
- 06:22–06:43 — small edits committed straight to `main` (because the branch was merged and each change was tiny): removed Invoice buttons from Payment history (`6c77ff1`); removed global search from admin header (`fa07e1a`); removed help-article view counts, "· ToS · Privacy · cookie notice" subtitle and Cookie notice URL field (`11878b1`); removed "ends in 2 days" label (`0de33c9`); made "Terms" and "Privacy Policy" tappable with dedicated screens + back button (`b695da8`); fixed those new screens showing the bottom nav, and changed the welcome hero to "ASSEMBLE / Where Everything Coordinates" (`89cf8e7`).
- 06:45–06:50 — permission pills (Allowed / Ask later) made genuinely interactive: label flips with state, via generic `data-onlabel`/`data-offlabel` attributes. `b963629`.
- 06:56–07:04 — feature lock for free users (mirroring how ads show for free users): first version = Pro-only lock on Saved looks, Surprise me, Pack for a trip; "PRO" badge; upsell modal; gating by destination so no entry point leaks. Emoji lock replaced by a monochrome "PRO" mark to keep the greyscale look. `c7a134b`.
- 07:07 — you change the ladder: Saved looks unlocks at Plus; Surprise me and Pack stay Pro. Tier-specific PLUS/PRO badges + one dynamic upsell modal. (Context compaction happened at 07:10 mid-task; work resumed from summary.) Verified Free/Plus/Pro states. `15c4e10`.
- 07:22–07:36 — removed the "3 free generations/month" model: new accounts get **3 one-time starter credits**, every generation (outfit or packing list) costs 1 credit, running out opens Buy credits. Plans: Free = 3 starter credits (one-time), Plus = $6.99/mo 30 credits, Pro = $14.99/mo or $149.90/yr (2 months free) with an **interactive Monthly | Annual toggle**. Admin "Free generations / month" field became "Starter credits (new accounts)" = 3. `1197a50`.
- 07:41–07:48 — Pro = 100 credits (not "Unlimited") everywhere; removed subscriber counts and credit-pack "sold" counts from admin; subscribing sets the demo balance (Plus 30, Pro 100); upsell modal's badge replaced by a perks checklist. `7929404`.
- 07:48–07:50 — Claude discovered stale duplicate files `Assemble - Admin.html` and `Assemble - User App.html` (untouched since the first commit on 07-14, not deployed because `index.html` redirects to the combined prototype). You chose delete. `1722858`.
- 07:51–07:56 — removed "Restore purchases" (an App Store concept; PWA sign-in restores entitlements); removed Export CSV from admin Users; split Pro into "Pro · Monthly" and "Pro · Annual" rows; "Continue to payment" full width; bonus: fixed a demo admin user showing "∞" credits → 100. `b66ae71`.
- 07:57–08:04 — every single-button modal full width via one CSS rule (two-button Cancel/Confirm pairs stay side by side); bonus fixes: Manage subscription screen now reflects the real plan (Free = "No active subscription", no cancel button); a demo Plus user's credits lowered to a realistic number; docs `Coverage.html` and `Presenter Script.html` synced to the new credit model. `c129061` + `17c6df2`.
- 08:09–08:12 — more bonus fixes: Pro annual term persists on Manage subscription ("$149.90/yr · renews …"); free-user sample credit/payment history no longer shows a Plus subscription; Walkthrough doc checked (clean). `2b47911`.
- 08:12–08:35 — new branch `desktop-responsive`: desktop was "a stretched-out mobile version with side menu". You first picked "Desktop-native key screens", then interrupted: "Desktop-native all/each and every screens". Built as a CSS-only layer gated at `min-width:900px` plus a one-time JS tagging of screens into three archetypes (read 660px / gallery wide grids / mason 2-column dashboards). Verified at 1440/1024/390px; pushed to the branch only.

### 2026-07-22
- 02:15–02:20 — closet Filters showed a Price filter (shared modal with Shop). Made the Filters modal context-aware: closet = Colour, Favourites/Recently added, Sort Newest/Most worn/Name; Shop keeps Price/Colour/Best match. On `main`. `f354a43`.
- 02:20 — "lets delete the desktop responsive branch, i didn't like it!" → branch deleted locally and on GitHub; `main` never touched.
- 02:26 — deleted two old merged branches (`client-revisions-1`, `demo-placeholders`) for a clean repo; only `main` left.
- 02:27–02:35 — "Shop matches" home tile: you asked its purpose; Claude explained the coherence gap (it opened the outfit-context shop). You chose: keep the name, but a **separate** set of screens matched to the user's closet/style profile, not one outfit. New `shopHome` screen with "Fills a gap in your closet" and "Matches your style" sections; outfit-context Shop untouched. `1a1c62e`.
- 03:23 — "what now?" → status summary + options (review pass / point at a screen / revisit desktop / done).

### 2026-07-24
- 20:19 — "tell me match an outfit journey on user app" → full written journey (entry points, genPick → genOccasion → genPrefs → genLoading → genResults → outfitDetail, branches). Session was in plan mode.
- 20:22–20:35 — drilled down by multiple choice to the real tweak: hide "Budget for new items" on Preferences (3/3) when "Closet only" is selected, and drop budget from the results summary in that mode. Plan written, approved, implemented. `1417776`.
- 20:36–20:39 — "write a brief message for project manager about what's done" → email draft; then narrowed to just the budget fix.

### 2026-07-26 — Additional Modules document (no code)
- 19:35 — you set the process: discuss each feature one by one, Claude writes structured content, you hand it to Claude Design (which knows the theme) for the final copy; include pricing.
- 20:26 — decisions: pricing = agency build cost; one feature at a time, client list first. Working doc scaffolded (plan-mode file).
- 20:44 — you attach the client-call transcript CSV. Claude extracted two requested modules (AI outfit video of the user; manual "style it yourself" studio) + a free-trial note.
- 20:46–20:55 — scoped A1 "See It On Me" (5–10s video of the user's likeness, event settings) and A2 "Style It Yourself" (slot-based builder, closet + optional shop, free-form v1).
- 20:57 — "rethink carefully about what the app is and then rewrite your suggested list" → Claude grounded recommendations in the core loop and business goals; six ideas; you picked 1, 2, 3, 5 (Today's Look, Closet Insights, Will It Match?, Resell/Donate).
- 21:06–21:14 — you added Group Outfits (coordinated or identical per event; AI proposes + members vote; Pro to create) and Personal 3D Avatar (rotatable 3D, premium alongside the simple avatar).
- 21:14–21:29 — refinement: every module's monetisation turned into client-selectable options with a short agency suggestion.
- 21:32 — full doc output for handoff.
- 21:36–22:03 — pricing: ballpark ranges → exact price rule "(low end of range) + $1,000" → one price changed by you → a second table "4th of July offer, 40% off".
- 22:14–22:29 — clean client title; saved (after one wrong-folder attempt) as `Wireframes/Version 1/Assemble - Additional Modules.md`, uncommitted.
- 22:45–22:52 — rewritten as a client-facing pitch: no per-module price or complexity, pricing revealed only at the end, plain tone, "pick one" earning option per feature, no emoji.
- 22:55–22:58 — internal companion `Assemble - Additional Modules - Build Guide.md` (uncommitted): how to fold any chosen module into the prototype.
- 23:06–23:09 — richer "What it is / Why it matters"; feature 4 reframed as "Complete Your Closet — fill the gaps" (wear insights already exist); removed free-trial block and the total rows.

### 2026-07-27
- 01:50–01:55 — 3D Avatar corrected to **per-generation** (new 4 full-body photos + look each time; nothing reused); pricing model per generation.
- 01:59–02:01 — title "Additional Modules"; preamble removed; Build Guide aligned.
- 02:03–02:11 — Resell/Donate → peer-to-peer "Resell" marketplace (in-app chat, deal done outside app, seller marks sold); price bumped.
- 02:12 — Group Outfits gets a text group chat per event.
- 02:20–02:25 — ninth module "Manage for Others" (sub-profiles for kids/partner + connected users with consent), with monetisation options and a given price.

### 2026-08-04 — Client accepts only the Personal 3D Avatar
- 02:48 — "THE CLIENT JUST GOT THE Personal 3D Avatar feature and rest were rejected… separate branch… trippo ai api… dont write any code ask me atleast 10 questions". Claude flagged up front that Tripo's multiview image-to-3D rebuilds the person *as photographed* (including their clothes); it does not dress a body in app-chosen outfits.
- 02:51 — "ask me like one by one with multiple choice" → 13 single questions. Decisions: only this module; branch `feature-3d-avatar` off `main`; as-photographed; 4 photos + Standard/High quality toggle; guided camera or upload; guidance-only photo requirements; entry points onboarding/Preferences-Profile/Home tile/outfit screen; turntable + share-for-feedback + save/manage like outfits + regenerate; pay per generation Standard 8 / High 15 credits; extend existing avatar consent; admin AI & Cost Control only; progress % generating state.
- 03:09 — your key design answer: from an outfit, AI first generates the 4 views of the person wearing that outfit to feed the 3D model, with a nudge that real photos give the best model; saved avatars can be edited (swap images) and regenerated; **never show "Tripo" in the app (not sponsored) — backend only**.
- 03:11 — Path B (from outfit) costs +2 credits (10 / 17). Built in four batches; verified; committed `74c870c` on the branch (not pushed).
- 03:30–03:32 — "can we publish this branch on a subdomain?" → explained Vercel branch preview URL vs custom domain mapping (dashboard steps you do). Pushed branch; `-u` persisted the token in `.git/config` → scrubbed immediately.
- 03:41–03:46 — added photo-ownership checkbox, admin 3D engine card Save changes (+ Test engine, later removed), Get Started step 5 "Create your 3D avatar", onboarding now only *introduces* 3D over two screens. `766cd16`.
- 03:52–03:54 — Regenerate shows its price and charges; Test engine removed. `f8c739a`.
- 04:02–04:09 — you proposed moving processing consent to onboarding; Claude argued for just-in-time consent; chosen: one-time consent modal on first 3D use, revocable in Settings; ownership attestation stays per generation. `1a48932`. Also explained Vercel "Deployment Protection" message.
- 04:14–04:20 — backup: pushed `feature-3d-avatar` → `main` of a second, empty repo `Assemble_Wireframes_Version_2` (after explaining a branch already contains all prior history).
- 04:20–04:57 — `mood-board` branch: research (Style Tiles, design tokens), 12 one-by-one questions, built `Assemble - Mood Board.html` (token-driven theme + font switcher, full component kit, icons from `assets/`, 5×4 icon grid spec, click-to-copy). Then: split app icons vs placeholders, live theme editor drawer, three extra fashion palettes and two font stacks using data from a third-party UI skill repo as reference. Context compaction at 04:41. Committed locally, never pushed.
- 20:28 — "I DONT LIKE MOOD BOARD IDEA… delete" → switched to `main`, deleted branch, stopped preview server.
- 20:34–21:03 — 3D shares: "Shared with me" and "Shared by me" show a 3D badge + "Shared as a 3D avatar" label; feedback screen turntable with rotate hint and a one-line privacy note; dedicated notification; saved "Dinner look" shows "3D avatar ready" with View (free) + Regenerate (credits), linked to the "My 3D avatars" entry. Pushed to both repos (`f9817f5`).

### 2026-08-05
- 01:13–01:17 — bug you found by manual testing: back from the 3D result went to the gallery instead of the saved look. Fixed with history-based back and excluding the loading screen from history. `9570610`, both repos.
- 01:45–02:00 — Share flow shows "Already shared with A, B (2)", ✓ Shared badges in the friend picker, warn-but-allow re-share confirm ("You already shared this with A 2 days ago — send again?"). Seed data only. `5c8689c`, both repos.
- 02:11–02:23 — Profile top-right "Upgrade" pill now shows "Free plan →" / "Plus plan →" (→ plans) or "Pro plan" (no arrow → Manage subscription), live; Credits card plan-aware too. `7764dbb`.
- 02:26–02:30 — removed "Receipts are also emailed" and "receipts by email" claims (two places). `78b3639`.
- 02:55–03:02 — wrote `PROJECT-HANDOFF.md` (for a future Claude session or developer; no token) and pushed branch tip + handoff commit to the new repo `Assemble_UI_Version_1` → `main` (tip `049fcb4`) via a local branch `ui-version-1`; Version_1/Version_2 left unchanged.

### 2026-09-13 / 09-14 — four parallel side tasks in the backend monorepo (full-stack era)
- 2026-09-13 22:20 — three background sessions launched at the same minute, each with one self-contained brief:
  - **Account file cleanup** (22:20 → 09-14 00:01): `DELETE /api/me` now deletes all stored files under the account's `u<id>/` storage prefix; failure queue table `storage_cleanups` (migration 014, staging only); admin retry card + `/api/admin/storage-cleanups`; admin delete uses the same cleanup; storage proxy returns 404 for files of deleted accounts; sheet copy made truthful; new unit test `apps/web/tests/userFiles.test.ts`; e2e extended; `LAUNCH-READINESS.md` row H15; `verify.mjs` knows the new table; runbook notes migrations 012–014 never rehearsed. Committed `8092e9d` on branch `account-file-cleanup` in a worktree. **Not pushed** (GitHub credential problem).
  - **3D avatar front-facing** (22:20 → 22:36): investigation of why engine-built GLB avatars open side-on while bundled demo GLBs face front; downloaded models from staging and compared axes; ended at a question about how to push (saved credential had no repo access).
  - **E2E fixture cleanup** (22:20 → 23:06): list and delete leftover "E2E …" products/brands/campaigns on staging, harden specs with try/finally and a fixture sweep in global setup/teardown; archive ends while `npm ci` finished and type checks/vitest were starting.
- 2026-09-14 05:34 — **American English** task (brief only): session died immediately with "API Error: Can't reach the API server … (ENOTFOUND)". Nothing was done in that session.

---

## 2. Decisions and why

### Process decisions
- **Branch for big change batches, merge only after verification.** Carried from earlier in the session ("Since there are major changes i want you to use branching and after verified we will merge okay!"). Why: `main` auto-deploys to the live Vercel URL the client sees.
- **Tiny changes after a merge go straight to `main`.** Claude said so explicitly ("Since this was a one-line change and the branch is already merged, I applied it directly on main"). Why: less ceremony for one-liners; still verified before push.
- **"Remove" means delete from code**, not hide ("when i say remove i mean delete from code so it doesnt confuse the dev"). Why: the prototype is also the developer's spec.
- **Discuss before implementing** for any product-behaviour change: you repeatedly wrote "suggest best possible ways to do it, ask questions and lets discuss before implementing". Claude then mapped every occurrence in both apps, proposed a recommendation, and asked 2–3 multiple-choice questions with "(Recommended)" on its pick.
- **Later: "ask at least 10 questions… one by one… multiple choice… recommended highlighted".** Why: batched 12-question walls were hard to answer; one-at-a-time with options was faster and gave cleaner decisions. This became the standard for every new feature from 2026-08-04.
- **Free-text answers in the "Other" slot are fine** and often changed direction (e.g. "option 1 but one time starter with 3 credits instead of 12", "for the Closet only option. remove the 'Budget for new items'…", the Path B flow description).
- **Claude should say when it disagrees.** Consent placement: you proposed onboarding; Claude recommended just-in-time consent (legally stronger, specific, in context), you agreed.
- **Delete experiments you don't like completely.** Desktop-native branch and the mood-board branch were both deleted (local + remote where pushed); `main` was never touched. Why: keeps the repo unambiguous for developers.
- **Clean up merged branches** (`client-revisions-1`, `demo-placeholders`) — git confirmed fully merged before deletion.
- **Single source of truth file**: stale split files (`Assemble - Admin.html`, `Assemble - User App.html`) deleted because a developer might edit the wrong outdated file.
- **Supporting docs must match the prototype**: Coverage, Presenter Script, Walkthrough were grep-checked and synced whenever the pricing model changed.
- **Review branch for the paid feature; backup repo.** The 3D avatar lived on `feature-3d-avatar` in Version_1 (never merged in this scope) and was mirrored to Version_2 `main` on every push. Why: you wanted to review before `main`, and a separate backup.
- **Handoff doc before new repo.** "write everything in an md file so when someone reads it like claude in another session - it can understand everything in detail" → `PROJECT-HANDOFF.md`, deliberately token-free, pushed with the code to `Assemble_UI_Version_1`. Why: new sessions/developers start cold; the prototype phase was ending.
- **Uncommitted documents stay uncommitted** unless asked (Additional Modules doc + Build Guide were kept untracked on purpose; commits on the 3D branch staged only the prototype file).

### Product / pricing decisions (prototype)
- **Campaigns promote a brand**, link to the brand page; banner uses brand logo + description. So no product dropdown or type column.
- **Wear today = toggle with undo + live counts on the same screen.** Why: cause and effect were on two different screens; seeing numbers move makes the retention feature obvious in a demo.
- **Permission pills flip label with state.** Why: toggling highlight without changing the word read as broken.
- **Plan ladder: Free → Plus → Pro.** Saved looks unlock at Plus (everyday convenience); Surprise me + Pack for a trip at Pro (generation-heavy). Badges show the tier; one dynamic upsell modal names the right plan and shows that plan's perks checklist (badge removed from the modal later).
- **Gate by destination, not only badges.** Why: every path in (See all, collections, packing list, save modals) must be blocked, "no leaks".
- **Greyscale discipline**: a colour emoji lock was replaced with a monochrome "PRO" mark; later a 🎆 in the doc was removed ("keep it plain text").
- **Credits model**: 3 one-time starter credits, 1 credit per generation, Plus 30/mo, Pro 100/mo (not unlimited — cost control), Pro annual $149.90/yr = 2 months free; subscribing sets the demo balance. Why "one-time starter": matches "as starters", limits AI cost.
- **Admin lever kept but repurposed**: "Free generations / month" → "Starter credits (new accounts)".
- **No invented sales figures** in admin (subscriber and "sold" counts removed).
- **Remove "Restore purchases"**: App/Play Store IAP concept; account-based PWA billing restores on sign-in. (Kept note: needed only if distributing via app stores.)
- **Annual Pro gets its own admin row**, keeping a 3-column table that fits narrow screens.
- **Full-width single modal buttons; two-button pairs stay side by side** — one CSS rule, no per-modal edits.
- **Context-aware Filters**: closet has no price (you already own it); shop keeps price.
- **"Shop matches" from Home is a separate profile-based screen**, distinct from the outfit-context Shop. Why: the label must be true; do not mix the two flows.
- **Closet-only mode hides budget** (nothing is bought), mirroring existing closet-only logic that already hid "Shop missing".
- **Desktop-native layout rejected** — the app is mobile-first; Claude noted "that's defensible".
- **Email receipt claims removed** — copy must not promise something the business has not decided.

### Additional Modules document decisions
- **Pricing in the doc = agency build cost**, not in-app pricing. Complexity rating used to justify numbers internally; later removed for the client version.
- **Exact prices rule**: take the low end of each ballpark range + $1,000; then a "4th of July" table at 40% off. You adjusted two prices by hand; totals rows removed. (Figures are agency quotes, not running costs.)
- **Client-facing tone**: pricing revealed only at the end; per-feature fields "What it is · Why it matters · Where you'll see it · How it works · How it can earn (pick one)" + "Our suggestion"; no screen IDs, no API talk.
- **Monetisation as client-selectable options (pick exactly one per feature)**, with a short agency steer. Why: let the client choose; you asked for it on one module, Claude offered to apply everywhere for consistency.
- **Recommendations must strengthen the core loop** (photograph closet → AI outfits → wear/shop gaps/share) and drive retention, monetisation or growth, reusing existing pieces. Your push "rethink carefully about what the app is" produced a much better list.
- **Feature 4 reframed** to "Complete Your Closet" because wear-count insights already exist.
- **3D avatar is per generation**, not a build-once doll — each generation needs fresh front/back/left/right full-body photos in good light with no harsh shadows.
- **Resell is peer to peer** with in-app chat, payment off-app, manual "mark as sold" → commission model dropped (cannot collect on off-app sales), replaced by free/boost/Pro options; price raised for the chat build. Group chat for Group Outfits reuses that messaging.
- **Internal Build Guide kept separate** from the client pitch so the team can implement any chosen module fast.

### Personal 3D Avatar (prototype) decisions and reasons
- **As-photographed model** because Tripo multiview reconstructs what is in the photos; dressing a bare body needs a separate garment-fitting pipeline.
- **Path B (from an outfit)**: AI generates the 4 views of the person wearing the selected outfit to feed the 3D engine; UI nudges that real photos are best and offers "Take real photos instead"; costs +2 credits for the extra image step.
- **Vendor name hidden**: "Tripo" appears nowhere in customer or admin UI ("this is not sponsored so we keep it in the backend"); admin shows "3D avatar engine".
- **Quality toggle only** (Standard/High) exposed; all other engine parameters fixed in backend. Why: simple for users; quality drives cost.
- **Guidance only** for photo requirements in the wireframe; real validation is a backend concern.
- **Pay per generation**: Standard 8, High 15 credits; regeneration is priced and shows its price on the button.
- **Consent**: processing consent once, on first 3D use, remembered, revocable in Settings (re-prompts after revoke); ownership attestation ("The photos are of me, or I have the person's consent to use them") every generation because each uses new photos. Onboarding only introduces 3D (two screens, no create action).
- **Saved and managed like outfits**, shareable for friend feedback like outfits; a saved outfit that already has a 3D avatar offers View (no credit) + Regenerate (credits), linked to the gallery entry.
- **Share awareness**: show who a look was already shared with; warn but allow re-sharing; copy-link does not count as a person.
- **Profile plan pill**: shows current plan; Pro (nothing to upgrade) goes to Manage subscription and has no arrow.

### Mood board decisions (then dropped)
- Style Tile (between mood board and mockup), token-driven theme switcher (CSS custom properties, primitive → semantic), greyscale baseline + 2 colour samples, long scroll page not infinite canvas, full component kit extracted faithfully from the prototype, system-font stacks (self-contained, no external requests), icons rendered from `assets/` with a documented 5×4 grid spec, click-to-copy tokens, audience both client and internal. Dropped entirely on 08-04 because you did not like the idea.

### Side-task decisions (Sept, backend)
- **Storage cleanup never blocks account deletion**: if file deletion fails, still delete the account, log via `lib/log.ts` without emails/keys, record the prefix in `storage_cleanups` for admin retry.
- **Prefix guard**: only `u<id>/` prefixes accepted, never delete a listed key outside the prefix, never touch `public/` catalogue images; demo profile (user 1) refused in both route and helper.
- **404 for deleted accounts' files** (instead of 401/403) so "photo URL no longer serves for anyone" is true; trade-off: one DB lookup and account-id existence is observable (judged minor, ids are sequential) — surfaced to you as a decision.
- **Same gap fixed in admin delete** (found while working).
- **Migration applied on staging only**, not on the CI branch, because the brief said staging only — surfaced the consequence (admin retry card errors on ci until applied).
- **American English decision (09-14)**: US audience → switch all user-facing copy; do not rename identifiers, DB columns, slugs, enum values, stored keys, or rewrite migrations; add an instruction to AI prompts to write output in American English.

---

## 3. Reusable user prompts

Each: original (lightly cleaned) → what it achieved → template.

1. **2026-07-21 05:34** — "i see blank screen now when i click admin panel from selection screen"
   - Achieved: short, exact repro path → Claude found the regression caused by its own two fixes and re-verified the *login* state, not just the logged-in state.
   - Template: `I see [symptom] when I [exact steps from which screen].`

2. **2026-07-21 05:46** — "on admin panel: understand one thing campaign is not for a product but it takes user to brand page therefore remove the TYPE column in the Ads and Featured page… Also for new/edit campaigns pop up delete the dropdown for: Product (uses its image). also in New campaign / edit campaign add input for description: example ' Up to 30% off belts and accessories. '"
   - Achieved: states the domain rule first ("campaign = brand") so Claude could apply it consistently (it also updated helper copy).
   - Template: `On [area]: understand one thing — [domain rule]. Therefore remove [X] from [screen], delete [control] from [modal], and add [field] (example: "[sample text]").`

3. **2026-07-21 06:04** — "so i think in order to make this more user friendly I think wear today button should be interactive and that on an outfit's detail screen should show … per-item wear counts? what do you think? lets discuss before making any change?"
   - Achieved: Claude explained the cause/effect gap, proposed a design, asked two recommended-option questions, then built exactly that.
   - Template: `I think [feature] should be [behaviour] so [user benefit]. What do you think? Let's discuss before making any change.`

4. **2026-07-21 06:15** — "are we ready to merge?" then **06:18** "merge"
   - Achieved: triggered a full verification sweep (audit, admin login, all admin screens, customer crawl, overflow, console, git state) and an honest caveat before the fast-forward merge to production.
   - Template: `Are we ready to merge [branch] to main?` → after the report: `merge`.

5. **2026-07-21 06:36** — "in the following sentence ' By continuing you agree to the Terms and Privacy Policy ' can you make hyperlinks for Terms and Privacy Policy with a back button to come back to this screen."
   - Achieved: new legal screens with back navigation; Claude also linked the signup consent row for consistency.
   - Template: `In the sentence "[exact copy]", make [words] links to [destination] with a back button that returns here.`

6. **2026-07-21 06:42** (style/bug correction) — "YOU ADDED … two proper screens — Terms of Service and Privacy Policy — … BUT IT ALSO SHOWS BOTTOM NAV. IT SHOULD NOT SHOW BOTTOM NAV."
   - Achieved: quoted Claude's own summary back, so the fix was immediate (add screens to the nav-hiding list).
   - Template: `You said "[quote from your summary]" but [what is wrong]. It should [expected].`

7. **2026-07-21 06:56 / 07:07** — "for the free user just like ads appear and for the subscriber ads disappear similarly lock the features saved looks, pack for a trip, surprise me. suggest best possible ways to do it, ask questions and lets discuss before implementing."
   - Achieved: reuse of an existing pattern (ads keyed off plan) as the mental model; Claude proposed badge + upsell + destination gating and asked 3 questions.
   - Template: `Just like [existing pattern] works for [case], do the same for [new features]. Suggest the best possible ways to do it, ask questions and let's discuss before implementing.`

8. **2026-07-21 07:22** — "I want to remove the 3 free generations from the app as we are giving free 12 credits on free plan as starters. suggest best possible ways… also update the choose a plan screen on user app and, on Credits and plans screen on admin panel to reflect the update plans."
   - Achieved: Claude traced the full footprint across both apps (cards, FAQ, flows, banners, admin tables, admin AI field) before asking decisions.
   - Template: `I want to change [business rule] to [new rule]. Update every screen in the customer app and admin panel that reflects it. Suggest the best way, ask questions, discuss before implementing.`

9. **2026-07-21 07:41** — "…thoroughly check admin panel and user app related screen and make changes where needed. suggest best possible ways to do it, ask questions and lets discuss before implementing."
   - Achieved: the phrase "thoroughly check both apps" led to discovering stale duplicate HTML files.
   - Template: `[Change]. Thoroughly check [app A] and [app B] related screens and make changes wherever needed.`

10. **2026-07-21 07:57** — "buttons in all modal should sit Full-width button … and can you think of any more Bonus fix? suggest best possible ways…"
    - Achieved: "bonus fix" invitation produced a real in-app contradiction (Manage subscription for Free users), stale docs, unrealistic demo data.
    - Template: `[Change]. And can you think of any more bonus fixes (inconsistencies, stale docs, unrealistic data)?`

11. **2026-07-21 08:09** — "First complete the other bonus fixes too {…} and push, then, create a separate branch and in that branch i want you to work on the fact the currently desktop version looks like a stretched out mobile version with side menu. how can we fix this? take best possible way… ask questions and decide yourself before implementing."
    - Achieved: sequenced work (finish + push first, then experiment on a branch); "decide yourself" limited questions to one direction-setting choice.
    - Template: `First finish [pending items] and push. Then create a separate branch and work on [problem]. Ask only the direction question, then decide the details yourself.`

12. **2026-07-21 08:24** (mid-task correction) — "sorry to interrupt but one change for question, How far should the desktop fix go…? Desktop-native all/each and every screens. continue."
    - Achieved: changed an already-answered choice without losing the task.
    - Template: `Sorry to interrupt — change my answer to "[question]": [new answer]. Continue.`

13. **2026-07-22 02:20** — "lets delete the desktop responsive branch, i didn't like it!" → **02:26** "delete those too for a clean repo"
    - Template: `Delete the [branch] branch locally and on GitHub; I don't want it. Also delete any other fully-merged branches.`

14. **2026-07-22 02:32** — "Keep 'Shop matches' but have it show items matched to the user's closet/style profile generally (not one outfit), so the 'matches' label stays true. do not mix this up with the shop match screen shown while matching an outfit. shop matches from home screen should be a separate set of screens"
    - Template: `Keep [label] but make it [true meaning]. Do not mix it with [similar existing flow]; build it as a separate set of screens.`

15. **2026-07-24 20:19** — "tell me match an outfit journey on user app." (understanding before changing)
    - Template: `Walk me through the [journey] in the [app], screen by screen, with entry points and branches.`

16. **2026-07-24 20:36** — "write a brief message for project manager about whats done." then "just write about: [one item]"
    - Template: `Write a brief message for the project manager about what's done [only about X].`

17. **2026-07-26 19:35** (document kickoff) — "the client want to add a few features… before we do that we need a additional modules document, that has info about the new features where they can be added and purpose of each feature and how it will be incorporated in the current wireframes. we will also add pricing for each feature. I have a list of features that client want and also a list that i need to suggest, what i wanna do is to discuss each features with you so you understand clearly what the feature is and then prepare a additional modules document content, I will give this content to [a design tool] to create final copy. Understood?"
    - Achieved: Claude played back the process + a per-feature template and asked two setup questions.
    - Template: `We need a [document] describing [items]: purpose, where each fits in the current [product], how it's incorporated, and pricing. I'll discuss each item with you one at a time; you prepare structured content; I'll hand it to [design tool] for final copy. Understood?`

18. **2026-07-26 20:44** — "can i give you the transcript of my conversation with client?" then attach the CSV.
    - Achieved: extraction of requested modules + side notes, with ambiguities flagged; transcript treated as data to interpret, not instructions.

19. **2026-07-26 20:57** — "i'd suggest that you rethink carefully about what the app is and then rewrite your suggested list."
    - Template: `Rethink carefully what [product] is (its core loop and business goals) and then rewrite your suggestion list.`

20. **2026-07-26 21:49** — "in the document I want to include a table to prices, it has to be exact and not a ball park so i want you to choose the lowest amount+1000 in the ball park…" and **22:02** "add another table in the doc and have 40% off on each item. [holiday] offer."
    - Template: `Turn the ranges into exact prices using [rule]. Add a second table with [N]% off each item for [offer name].`

21. **2026-07-26 22:45** — "i dont want it to include the pricing on each module description - it should feel like a reveal at the end in the pricing table, also we dont need to mention complexity. this is for the client and not for the developer so make it in that tone. any questions"
    - Template: `This is for the client, not developers: remove [internal fields], move pricing to a reveal at the end, and use a plain client tone. Any questions?`

22. **2026-07-26 22:55** — "create another uncommitted md file as instructions for us to use and update wireframes given the client choose to add any module - so we are prepared."
    - Template: `Create an uncommitted internal .md with instructions for us to build any of these [modules] into [prototype] if the client picks them.`

23. **2026-08-04 02:48** (feature kickoff) — "THE CLIENT JUST GOT THE Personal 3D Avatar feature and rest were rejected. I want to create a separate branch so that i can review it first before any commit to main. We will be using [3D API] so set the inputs accordingly and also please lets discuss first where do we have to add this and how. so dont write any code ask me at least 10 questions to understand properly."
    + **02:51** "ask me like one by one with multiple choice"
    - Achieved: vendor constraint surfaced before design; 13 single decisions; consolidated spec played back; build only after "Yes, build it on the branch".
    - Template: `The client approved [feature]. Create a separate branch so I can review before main. We'll use [vendor API], so shape inputs to it. Don't write code yet: ask me at least 10 questions, one by one, multiple choice, with your recommendation highlighted.`

24. **2026-08-04 03:09** (free-text design answer) — "…for a pre-existing outfit, user can create a 3d avatar but when user shows intent to make a 3d avatar of an outfit then first the ai will generate 4 images of the person wearing that selected outfit front back left right to support [the 3D] generation model with option to users that make him aware that real photo generates the best 3d model… later in the saved avatar they can edit to change images and regenerate. … has to be friendly and easy for user. Also fyi don't show [vendor] in the app because this is not sponsored so we keep it in the backend."

25. **2026-08-04 03:30** — "can we publish this branch on a subdomain?"

26. **2026-08-04 04:03** — "i think this should be added in onboarding and not inside the app. ✓ I consent to Assemble processing my photos… what do u think?" (asking for an opinion, not an order → better outcome)

27. **2026-08-04 04:14** — "I want this branch to be pushed in this repo as a back up. https://github.com/<your-github-user>/Assemble_Wireframes_Version_2" + "if i push only this branch then will it not have previous code?"

28. **2026-08-04 04:20** (research + questions) — "…create another branch and in that just create a mood board … scrollable and has every button, every icon, everything from wireframes, in a modular version so that it can be used as a mood board or a theme file… very extensive… Make it in a way that when we are creating themes i can generate icons in grid and paste in folder to be used. do proper research online to see any authentic info we can have. Ask at least 10 questions…" + "ask one by one and give multiple choice options to select from with recommended highlighted"
    - Template: `Create a branch for [deliverable]. Do proper online research first. Ask at least 10 questions one by one, multiple choice, recommended highlighted.`

29. **2026-08-04 20:39 / 08-05 01:45 / 02:11** — the standard question-round suffix used on every new behaviour:
    > "Ask at least 10 questions to understand what i am saying and have better context of what i want, got it? ask one by one and give multiple choice options to select from with recommended highlighted"
    - Template (append to any request): `Ask at least 10 questions to understand what I mean. Ask one by one, multiple choice, with the recommended option highlighted.`

30. **2026-08-05 01:13** (manual test bug report, excellent format) — "In the customer app, after logging in, go to Saved Looks and open a look that includes a generated 3D avatar. Tap View 3D Generation, then press the back button. Instead of returning to the selected saved look, it redirects to the My 3D Avatars screen. The back button should take the user back to the saved look they opened."
    - Template: `In [app], after [precondition], go to [screen], open [item], tap [control], then [action]. Instead of [expected], it [actual]. It should [expected].`

31. **2026-08-05 02:26** — "It says we send receipts via email?" (copy audit question → remove unverified promises)

32. **2026-08-05 02:55** (handoff) — "can you also push this into a new repo called: … but before that write everything in an md file so when someone reads it like claude in another session - it can understand everything in detail?"
    - Template: `Before pushing to [new repo], write everything into an .md so a fresh Claude session or developer understands the project in detail (no secrets). Then push code + doc to [repo] main.`

33. **2026-09-13 22:20** (side-task brief, the gold standard) — structure: context (repo path, stack, which app) → exact bug with file paths → "Do this:" numbered steps (implementation, copy, tests with named spec files) → "Rules for this repo:" (no AI attribution anywhere; commit identity; the exact pre-push checks; staging DB only; never production; never `neon env pull`; build takes minutes). See Section 10 for the paste-ready template.

34. **2026-09-14 05:34** (parallel-safety clause worth reusing) — "Another session is editing apps/site and tools/marketing, so do not touch files there. Several other background tasks may be editing apps/web at the same time (…): pull and rebase before pushing, and resolve conflicts carefully rather than overwriting their changes."

---

## 4. Working method

### Revision loop on the single-file prototype
1. You send a change request (often several numbered items, sometimes with "suggest… ask questions… discuss before implementing").
2. Claude reads the exact code first ("Let me look at the exact code for each item before we discuss"), maps every occurrence in both apps, flags related inconsistencies it found ("coherence bug", "bonus fix").
3. Question round with 2–4 options per question, recommended option first and labelled. Previews of the result were sometimes attached to options (e.g. the plans table layout, modal text).
4. Implement in named batches (Batch 1 state/actions, Batch 2 render, Batch 3 HTML, Batch 4 admin) using Python edit scripts with asserted anchors.
5. Structural audit (`audit.py`: screens, modals, broken `data-nav`/`data-open`, dead controls).
6. Browser verification through DOM inspection (JavaScript run in the browser pane), not screenshots: drive clicks, read state, measure positions, test all plan states, check mobile overflow at ~390px.
7. Commit + push (branch or main), report with a short table of what changed, commit hash, and "0 console errors, audit clean".
8. Standing reminder about the exposed token at the end of every reply.

### Question rounds evolved
- Early: 2–3 grouped questions per turn with recommendations.
- From 2026-08-04: you asked for "one by one with multiple choice" → Claude asked 10–13 single questions, acknowledged each answer in one line ("Checkmark only. Next:"), then played back a **consolidated spec** and closed "one loose end" before building.
- The last question of each round was always shipping: "Commit local, hold for review / Commit + push to both repos / origin only".

### Plan mode
- 07-24 budget tweak: Claude wrote a plan file, you approved, then built.
- 07-26 document work ran in plan mode; the doc lived in a plan scratch file `C:\Users\<you>\.claude\plans\<random-name>.md` until you asked for it "in assemble's workspace" (Claude asked which folder; your first answer was wrong, you interrupted and corrected).
- 08-04 backup push: plan mode on, two questions, plan approved, then executed.

### Branching and repos
- `main` → Vercel production for the prototype. Review branches: `client-revisions-1` (merged), `desktop-responsive` (deleted), `feature-3d-avatar` (kept for review), `mood-board` (local, deleted), `ui-version-1` (local branch used only to push handoff to new repo).
- Backup: every `feature-3d-avatar` push went to two remotes: Version_1 branch `feature-3d-avatar` and Version_2 `main` (`feature-3d-avatar:main`).
- Branch previews on Vercel were blocked by Deployment Protection for viewers without access.

### Interruptions and corrections
- "[Request interrupted by user]" then a re-sent or corrected message; Claude continued without losing state (e.g. added "also remove…" to the earlier request; changed a question answer; corrected save folder).
- When you answered a question with a question ("what do u mean by todays simple avatar?"), Claude explained and re-asked just that question.
- When you said "ask again" after interrupting, Claude re-asked more clearly.

### Context compaction
- Two compactions in scope (2026-07-21 07:10 and 2026-08-04 04:41). Each summary recorded: primary requests, technical concepts, files and exact code, errors and fixes, all user messages, pending tasks, current work, next step, and the **security constraint verbatim** (token handling rules). Work resumed without re-asking. Lesson: security rules and in-flight verification state must be written into the summary.

### Parallel side tasks (September)
- Several background sessions launched at once, each with a complete standalone brief and repo rules, working in separate git worktrees (e.g. `UI\.claude\worktrees\<name>\backend`) because the main checkout had someone else's uncommitted work.
- Each copied the gitignored env files into its worktree, ran `npm ci` in the background, and waited for the install to wake it.
- Checks ran in parallel where independent (two `tsc` runs + vitest), sequential where heavy (build, then full Playwright alone on the machine).
- Blockers were reported clearly with a decision request (push credentials, merge strategy, migration on CI branch, 404 trade-off).
- Memory was updated at the end of the run.

### Reporting style that worked
- Lead with the outcome and hash, then "What changed", "Verified", "Decisions for you", "Still to do".
- Honest caveats: "I can't produce screenshots… a 60-second hard-refreshed click-through would be the final peace of mind"; "One honest limitation…".

---

## 5. Services and access

### GitHub
- Repos (all under `<your-github-user>`):
  - `Assemble_Wireframes_Version_1` — origin for the prototype; `main` deploys to Vercel.
  - `Assemble_Wireframes_Version_2` — created empty by you on 2026-08-04 as a backup; received `feature-3d-avatar` as `main`.
  - `Assemble_UI_Version_1` — created by you on 2026-08-05; received the full prototype codebase + `PROJECT-HANDOFF.md` on `main` (tip `049fcb4`).
  - Later (Sept side tasks): backend repo `Assemble_Backend_v1`.
- Access given to Claude: a classic personal access token `<GITHUB_PAT>` pasted in chat earlier in the session (before this scope). Rules kept throughout:
  - never persist in `.git/config`; push with an inline token URL and **without `-u`**;
  - redact any token in command output with `sed -E 's/ghp_[A-Za-z0-9]+/ghp_***REDACTED***/g'`;
  - remind you to revoke/rotate it (repeated in almost every reply);
  - never write it into docs (Build Guide and Handoff doc describe the push method generically).
- Breakage: 2026-08-04 03:31 `git push -u <token-URL>` wrote the token URL into the branch upstream config → scrubbed with `git config branch.feature-3d-avatar.remote origin` and re-checked.
- `gh` CLI on the machine was logged in as a different, secondary GitHub account with no access to the `<your-github-user>` repos → not used for pushes; you created the new repo yourself.
- September: pushes blocked — "GitHub refuses this machine's saved login ('Repository not found')" because the stored Windows credential signs in as the account without repo access. Claude asked for a token with Contents write on the backend repo (used only in push URL, never saved) or for you to push yourself.

### Vercel
- Project serving `Assemble - Prototype.html` via `index.html` redirect; production URL `assemble-wireframes-version-1.vercel.app`; auto-deploys on push to `main` (~1 minute).
- Branch previews: pushing a branch creates `…-git-<branch>-<scope>.vercel.app`; find it in Vercel → Deployments or GitHub commit checks.
- Custom subdomain for a branch (your action, not Claude's — no account access): Vercel → Project → Settings → Domains → Add; set Git Branch to the branch; add CNAME for custom domains.
- "This Vercel deployment is protected. A team owner needs to approve your request." → Deployment Protection on previews; owner disables preview protection (or "Only Production") or generates a shareable/bypass link.
- September side tasks: staging app `assemble-staging-app.vercel.app` used for visual verification after deploy.

### Tripo (3D generation)
- Chosen by the client for Personal 3D Avatar (2026-08-04). Only designed for in the prototype (simulated). Constraint captured: multiview image-to-3D (front/left/back/right) reconstructs the photographed person including clothing; async (submit → poll progress). Name must never appear in UI; admin shows "3D avatar engine".

### Claude Design (design tool)
- Used by you to turn structured content into final formatted documents ("it knows our theme"). Claude produced the content only.

### Third-party skill repo (reference only)
- `ui-ux-pro-max-skill` — Claude could not install it in a non-interactive session (needs `npm install -g ui-ux-pro-max-cli` → `uipro init --ai claude` or a marketplace install in an interactive terminal). Its palette/font data was read as reference for mood-board presets.

### Neon / database (September side tasks)
- Staging database = Neon branch "staging"; `DATABASE_URL` in `apps/web/.env.local`. CI database = branch `ci-backend`, URL in `backend/.env.ci-backend` (strip quotes before use). Production endpoint must never be touched.
- Standing rule: never run `neon env pull` (it rotates credentials and breaks other secrets).
- Migration 014 (`storage_cleanups`) applied to staging only; verified table columns and zero rows.

### Gemini (September)
- `GEMINI_MOCK=1` enables the fake AI engine. Playwright config set it for the web server but **not** the admin server, while `apps/admin/.env.local` held a real key → admin e2e made live AI calls (see Pitfalls).

### Storage
- Private bucket, per-user key prefix `u<userId>/`; `public/` holds catalogue images; storage proxy route serves private files with auth checks. Helpers in `apps/web/lib/storage.ts`; pattern example `apps/web/app/api/me/avatar-data/route.ts`.

---

## 6. Commands and CLI

(Secrets masked. Paths as used on Windows; Bash tool is Git Bash.)

### Local preview server and Python
```bash
python -m http.server 8821 --bind 127.0.0.1     # early: serve the prototype folder
py -m http.server 8843 --bind 127.0.0.1         # later: `python` was a broken WindowsApps stub; `py` launcher works
# Open with a cache-buster so the in-app browser does not serve a stale copy:
#   http://127.0.0.1:8843/Assemble%20-%20Prototype.html?v=r13
/c/Users/<you>/AppData/Local/Programs/Python/Python313/python.exe edit_script.py   # full Python path used for edit scripts
```
- Servers died silently at times (navigation hit a chrome-error page) → check with a request for HTTP 200 before navigating; restart on a new port (8823/8824/8825/8830…).

### Git — prototype phase
```bash
git checkout -b client-revisions-1            # batch branch
git checkout main && git merge --ff-only client-revisions-1
git push https://<your-github-user>:<GITHUB_PAT>@github.com/<your-github-user>/Assemble_Wireframes_Version_1.git main 2>&1 | sed -E 's/ghp_[A-Za-z0-9]+/ghp_***REDACTED***/g'

git branch -d desktop-responsive
git push <token-URL> --delete desktop-responsive        # remove remote branch
git branch -d client-revisions-1 demo-placeholders      # -d refuses unmerged branches = safety check

git checkout main && git checkout -b feature-3d-avatar
git push <token-URL-Version_1> feature-3d-avatar         # NO -u
git push <token-URL-Version_2> feature-3d-avatar:main    # backup repo main

# If -u was used by mistake:
git config branch.feature-3d-avatar.remote origin
grep -n "ghp_" .git/config || echo "config clean"

git checkout main && git branch -D mood-board           # discard local-only experiment

git checkout -b ui-version-1    # tip + handoff commit only
git push <token-URL-Assemble_UI_Version_1> ui-version-1:main
git checkout feature-3d-avatar
git checkout ui-version-1 -- PROJECT-HANDOFF.md          # bring the doc into another branch's worktree if needed
```
- Commit staging discipline: `git add "Assemble - Prototype.html"` only, leaving untracked docs untracked.

### Python edit pattern (scratchpad scripts `r1_user.py` … `r13_lock.py`, `cohere_ux.py`)
```python
src = open(path, encoding='utf-8').read()
def rep(old, new, count=1):
    global src
    n = src.count(old)
    assert n == count, f"anchor count {n} != {count}: {old[:60]}"
    src = src.replace(old, new)
# ... many rep() calls ...
open(path, 'w', encoding='utf-8').write(src)
```
- `audit.py` — structural audit (screens, modals, broken `data-nav`/`data-open`, dead `data-act`; flags programmatic states like `genLoading` as expected). `acceptance.py`, `slice.py` (Pillow icon slicing), `poc.js` (puppeteer-core headless screenshots via Edge) existed from earlier.

### Browser verification (DOM, via the browser pane JavaScript tool)
- Enter the customer app first: click `[data-enter="user"]` on the launcher (`#launcher`/`#stage`), otherwise clicks do nothing.
- Drive real elements (the controller object isn't global) and read results: active `data-screen`, modal name, `.locked` classes, credit balance text, element `getBoundingClientRect()` to confirm in-viewport, `document.documentElement.scrollWidth > innerWidth` for overflow.
- Resize to mobile (390px) for overflow checks, then reset to desktop.
- Lazy-loaded images (`loading="lazy"`) appear "broken" until scrolled into view — scroll them before judging.

### September backend checks (from the side-task briefs)
```bash
npx tsc --noEmit                         # in apps/web and in apps/admin
npx vitest run --pool=threads            # in apps/web
NEXT_PUBLIC_DEMO_LOGIN=1 npx turbo run build     # builds web + admin (+ site); several minutes (6m18s observed)
E2E_DB=1 npx playwright test             # full e2e, one worker; free ports 3000/3001 first
npm ci                                   # in a fresh worktree (run in background; long)
GEMINI_MOCK=1 E2E_DB=1 npx playwright test tools/e2e/admin-catalog.spec.ts   # isolated rerun with mocked AI (9/9 passed)
```
- Kill leftover dev servers on ports 3000/3001 before Playwright (PowerShell: find the owning process of the port and stop it).
- Use absolute paths per command; a `cd` "stuck" in one parallel command caused two false failures.

---

## 7. Testing and verification

### Prototype (single HTML file)
- **Structural audit** after every edit batch: counts (62 → 63 screens, 56 modals), 0 broken navs, 0 dead controls.
- **Behavioural DOM tests** per change, in all relevant states:
  - Plan locks: Free (all locked, correct PLUS/PRO badges and modal text), Plus (Saved opens; Surprise/Pack upsell), Pro (all unlocked; Surprise generates; Pack opens). A first run showed "all locked" — a **test-harness bug** (helper clicked the hidden modal's "See plans" instead of the visible credits button), not an app bug.
  - Credits: 3 → 2 → 1 → 0, then out-of-credits state on generate and packing; subscribe sets 30/100.
  - Annual toggle both directions + payment sheet amount; annual term persisted on Manage subscription.
  - Wear today toggle on/off with counts reverting and history entry removed.
  - Filters context: closet has no Price; shop keeps it; injected chips stay interactive through re-render.
  - Budget field shown/hidden across the three source modes, plus summary line.
  - 3D avatar: free user gating ("needs 8, you have 3"), top-up, credits 103 → 95, progress to 100% → result, Save note, Share sheet, Path B cost 10, "Take real photos instead" → 8, quality 8 ↔ 15, Regenerate charges (95 → 87), two-box consent gate, one-time consent modal → remembered → revoke re-prompts, onboarding intro screens have no create action.
  - Shares: incoming 3D vs flat share, outgoing 3D share detail, notification deep-link, saved look with/without 3D (View/Regenerate vs Create), View → result with no credit.
  - Back navigation: saved look → View → back → saved look; gallery → open → back → gallery.
  - Share awareness: summary names + count per look, ✓ badges, warn-but-allow path and direct send path, empty state for unshared.
  - Profile plan pill + Credits card for Free/Plus/Pro by actually subscribing through the flow.
  - Copy removal checked with grep across the file ("emailed", "receipts by email", "Unlimited", "free generations").
- **Viewport checks**: mobile 390px no horizontal overflow; desktop 1280/1440; for layout bugs, measure element positions ("aAuth below fold") not just presence.
- **Merge readiness sweep** (07-21 06:15): audit, admin login → dashboard, all admin screens in scroll container, customer crawl 49 screens / 422 controls, overflow at 1280, console errors, git status.
- **Docs**: grep Coverage / Presenter Script / Walkthrough for retired terms after model changes.
- Screenshots never used (tool timed out all session); an earlier headless pipeline (puppeteer-core + Edge) existed as fallback.

### September backend
- Account cleanup: new unit test `apps/web/tests/userFiles.test.ts` (prefix listing + deletion helper); e2e `tools/e2e/account.spec.ts` "Delete account through the sheet" extended to upload an item photo, delete the account, and expect 404 from the deleted account's browser, a signed-out visitor, and another account, plus a direct bucket check that the file is gone; new e2e that the demo profile delete gets 403.
- Results: both `tsc` pass; vitest 346/348 (2 failures in `sqlScan.test.ts` from Windows CRLF line endings, not the change; CI on Ubuntu uses LF); build pass (6m18s); Playwright 198 passed, 1 failed (admin catalog "facts are described on save" — live AI call because mock not set for admin server; with mock on for both apps, that spec passed 9/9). Staging `storage_cleanups` queue empty after the run = every test account's files were cleared.
- E2E fixture cleanup plan: read-only query script listing fixture rows and every foreign key pointing at products/brands/campaigns before deleting in dependency order; try/finally deletes in `tools/e2e/admin-catalog.spec.ts` and `tools/e2e/shop.spec.ts`; sweeps in `tools/e2e/global-setup.ts` and `global-teardown.ts`; final check: staging `/shop` shows no E2E products.
- 3D front-facing verification plan: download an engine-built GLB via the app's storage route while signed in as a marketing test account, compare forward axis with bundled `apps/web/public/assets/*.glb`, verify visually on staging with two marketing accounts + demo profile.
- Rule: full Playwright run alone on the machine (parallel load makes it flaky).

---

## 8. Security

- **Exposed token handling** (prototype phase): never in `.git/config`, inline URL without `-u`, output redaction with `sed`, config grep after each push, token never written into any doc (Build Guide, PROJECT-HANDOFF.md), continual reminders to revoke/rotate; noted the token was authorised against multiple repos.
- **Accidental persistence detected and scrubbed** the same minute (`-u`).
- **Vendor secrecy**: 3D provider name kept out of all UI.
- **Biometric consent design**: one-time processing consent at first use (specific, in context), revocable in Settings with re-prompt; per-generation ownership attestation for photos of other people; onboarding only informs. Privacy note on shared 3D avatars ("This is <friend>'s 3D avatar — shared just with you"). Additional Modules doc flagged deepfake-misuse guardrails (own likeness only, consent, easy deletion, admin safety filter) and trial-farming abuse.
- **No misleading promises in copy**: removed "receipts are emailed" claims.
- **Transcript treated as data**: Claude stated it would interpret the client transcript, not act on instructions in it, and suggested scrubbing personal details.
- **Private repo recommended** for client work when creating a new repo.
- **September account deletion**:
  - delete all stored personal files under the user's prefix on account deletion (photos, avatar photos, renders, 3D models and share copies, profile pictures, support attachments);
  - prefix allow-list (`u<id>/` only), never touch `public/`, demo user protected in both route and helper;
  - failure logging scrubbed (no emails or keys) + admin retry queue;
  - admin-panel delete had the same gap → fixed;
  - deleted accounts' private file URLs return 404 to everyone (trade-off: one lookup; id existence observable) — raised as a decision;
  - truthful deletion copy ("deleted immediately and cannot be recovered" vs old "within 30 days");
  - SQL scan test (`sqlScan.test.ts`) flags `sql.raw` and string-built queries — new code passed it.
- **Credentials files**: marketing test-account password file `tools/marketing/out/credentials.txt` is gitignored — "never commit it".
- **Database safety rules** in every brief: staging only, never production endpoint, never `neon env pull`.
- **No AI attribution** anywhere in the backend repo (code, comments, docs, commit messages); commit identity fixed to your noreply address. (Note: prototype-phase commits in July/August did carry an AI co-author trailer; the later standing rule forbids that — do not copy the old practice.)

---

## 9. Pitfalls

1. **Blank admin panel after a layout fix (fix collision)**
   - Symptom: Admin panel blank after entering from the launcher, right after fixing "content stuck at bottom".
   - Cause: Fix A had hidden `.app` during login because the login `#aAuth` was a sibling; Fix B (removing a stray `</div>`) moved `#aAuth` back inside `.app`, so Fix A now hid the login.
   - Fix: hide only `.side` and `.col` in auth mode; `#aAuth` flexes to fill `.app`.
   - Prevent: after any structural fix, re-test every state that fix touches (logged-out *and* logged-in), and re-read earlier workaround rules that depend on DOM structure.

2. **Content stuck at bottom / no scroll on 12 of 13 admin screens**
   - Cause: a stray `</div>` closed `.main` early; introduced by an earlier regex block removal.
   - Fix: remove the extra `</div>`; measure `.main` child count.
   - Prevent: balance-check div structure after regex-based removals; measure container children.

3. **Legal screens showed bottom nav**
   - Cause: new screens not added to the auth/full-page screen list (`U.AUTH`).
   - Prevent: checklist item "does this new screen belong in the no-nav list?".

4. **Colour emoji broke greyscale** (🔒, 🎆) → use monochrome text badges; no emoji in client docs.

5. **Stale duplicate deliverables** (`Assemble - Admin.html`, `Assemble - User App.html`) frozen at first commit.
   - Prevent: one source-of-truth file; check `index.html`/deployment target; delete superseded copies.

6. **Leftover values after a model change** ("∞" credits for a Pro demo user, "Go unlimited" copy, admin help article mirroring the FAQ, docs).
   - Prevent: grep the whole repo (both apps + docs) for old terms after any pricing/model change.

7. **Contradictory screen for a plan state** (Manage subscription showing a price for Free users).
   - Prevent: test every plan state on every plan-related screen.

8. **Test-harness false negative** (helper clicked a hidden modal button; all plans looked locked).
   - Prevent: click visible elements; assert navigation happened before asserting the result.

9. **Launcher gate** — clicks did nothing because the app starts on a launcher; must click `[data-enter="user"]` first. Recorded in handoff doc.

10. **In-app browser cache served stale HTML** → cache-buster `?v=…`, no-cache meta tags.

11. **Local server silently down** → check for HTTP 200; restart on a new port.

12. **`python` is a broken WindowsApps stub** in Git Bash → use `py` launcher or the full Python path.

13. **Windows console encoding** crashed Python `print()` of Unicode glyphs → read via file tools instead of printing.

14. **Edit anchors not unique / whitespace mismatches** (same string in customer and admin controllers; `.wrap wide` vs `.wrap`; line numbers shift after inserts).
    - Prevent: grep the exact current text before editing; anchor on unique neighbouring lines; assert counts.

15. **Scratchpad scripts vanished** (`audit.py` cleared mid-session) → re-created checks as live DOM queries.
    - Prevent: keep important verification scripts in a project folder, not only in temp.

16. **`git push -u` with a token URL persisted the token** → scrub config; always push without `-u`; grep config after push.

17. **Lazy-loaded icons looked broken** in DOM checks → scroll into view before checking `naturalWidth`.

18. **Screenshot tool timed out all session** → DOM measurement verification; ask for a quick human click-through before production merges.

19. **Vendor capability mismatch** (planned "photos + pick an outfit" but Tripo reconstructs as photographed) → research API behaviour before designing; Path B introduced.

20. **Hardcoded back target** (`data-nav="avatars3d"` on result screen) → use history back (`data-back`) and exclude transient loading screens from history.

21. **Wireframe simplification leaks** (one shared `outfitDetail` means only two titles have distinct seeded share data) → state it as a known limitation.

22. **Save location misunderstanding** (plan file under user profile vs workspace; then wrong workspace folder) → ask for the exact absolute folder.

23. **Branch preview inaccessible** (Vercel Deployment Protection) → owner changes protection or shares a bypass link.

24. **September: push blocked** — saved Windows credential belonged to an account without repo access ("Repository not found").
    - Prevent: check push access with a quick authenticated call before starting long work; ask for a scoped token early; or plan for you to push.

25. **September: CRLF breaks a text-matching test on Windows** (`sqlScan.test.ts` allowed fragment matched LF only).
    - Fix/prevent: normalise line endings in the test or set `.gitattributes`; know CI on Ubuntu passes.

26. **September: admin e2e used a real AI key** — `GEMINI_MOCK=1` set for the web server only in the Playwright config; admin `.env.local` had a live key → empty answer → failing assertion.
    - Fix: set the mock flag for every server the e2e config starts; rerun spec in isolation to prove.

27. **September: `cd` not persisting between parallel shell commands** → false failures; use absolute paths.

28. **September: migrations applied only to staging** leave CI database behind (admin card load error) → track which databases have each migration; decide per brief.

29. **September: leftover E2E fixtures visible on staging shop** → try/finally cleanup in specs + global setup/teardown sweeps by name/id pattern.

30. **September: API outage killed a session instantly** ("Can't reach the API server… ENOTFOUND") → re-launch the brief; briefs must be fully self-contained so a restart costs nothing.

31. **Question walls were hard to answer** (12 questions in one message) → one-by-one multiple-choice.

---

## 10. Code and templates worth reusing

### Files produced / referenced in scope
- `D:\Documents\Deep Learn HQ\Clients\<client-folder>\Wireframes\Version 1\Assemble - Prototype.html` — the whole prototype (customer app + admin), vanilla JS with two controllers (`U` customer, `A` admin), each with `st` state, `go`, `back`, `render`, `click`, `act`. Screens are `<section class="screen" data-screen="X">`; modals `<div class="modal" data-modal="X">`. Delegated data-attribute wiring: `data-nav`, `data-open`, `data-close`, `data-act`, `data-toast`, `data-chip`, `data-rg`/`data-rv` (radio groups), `data-back`, `data-home`, `data-enter`, `data-lock="plus|pro"`, `data-onlabel`/`data-offlabel`. Design tokens as CSS custom properties in `:root` (canvas/surface/ink/line/primary colours, three shadows, image gradients, radii). Reusable patterns:
  - **Plan lock**: `data-lock` on entry points + render toggles `.locked` + click gate by destination → dynamic upsell modal with perks checklist.
  - **Credit gate**: if balance < cost → Buy credits modal, else deduct and proceed.
  - **Async progress state**: `go()` starts an interval timer for a "building…" screen that advances to a result.
  - **Label-swapping toggle** via `data-onlabel`/`data-offlabel`.
  - **Full-width modal buttons**: `.modal .btn{width:100%}` + `.modal .frow .btn{width:auto}` + `.modal .small{width:auto}`.
  - **Context-aware modal body** rendered per opener (closet vs shop filters).
  - **Nav-hiding list** (`U.AUTH`) for full-page/onboarding/legal screens.
- `Assemble - Coverage.html`, `Assemble - Walkthrough.html`, `Assemble - Presenter Script.html` — supporting client docs that must stay in sync with the prototype.
- `index.html` — redirects to the prototype (what Vercel serves).
- `assets/icon-*.png` (20 sliced greyscale icons) + `assets/placeholder-grid.png` — generated as a 5×4 grid image and sliced with Pillow.
- `Wireframes/Version 1/Assemble - Additional Modules.md` — client-facing module pitch (per feature: What it is · Why it matters · Where you'll see it · How it works · How it can earn (pick one) · Our suggestion; pricing tables at the end). Untracked.
- `Wireframes/Version 1/Assemble - Additional Modules - Build Guide.md` — internal playbook: prototype orientation, verification workflow, reusable recipes (add screen/modal/home tile, credit-gate, plan-lock, async state, share/feedback, admin fields), per-module build notes, pricing/plan wiring, definition of done. Untracked.
- `PROJECT-HANDOFF.md` (only on branch `ui-version-1` / repo `Assemble_UI_Version_1`) — product summary, repo/branch layout, run-and-verify workflow (`py` server, launcher enter, DOM testing, overflow check), architecture, 3D avatar feature, full change log, conventions, known limitations, pending items, quick-start checklist; no secrets.
- Additional Modules source input: client-call transcript CSV in `Clients/<client-folder>/Additional Modules/Transcript/`.
- Scratchpad (temporary, not kept): `audit.py`, `acceptance.py`, `slice.py`, `poc.js`, `r1_user.py`…`r13_lock.py`, `cohere_ux.py`.
- Deleted deliverable (for reference of the idea only): `Assemble - Mood Board.html` Style Tile with theme/font switchers, live token editor drawer ("Copy theme CSS" exports a `:root{}` block), app icons vs placeholders sections, 5×4 icon-sheet spec.

### September backend paths
- `apps/web/app/api/me/route.ts` (`DELETE /api/me`), `apps/web/lib/storage.ts`, `apps/web/app/api/me/avatar-data/route.ts` (good deletion pattern), `apps/web/lib/log.ts` (scrubbed logging), `apps/web/components/Modals.tsx` (delete-account sheet copy), shared prefix-deletion helper in `packages/db`, new route `/api/admin/storage-cleanups`, migration 014 `storage_cleanups`, `apps/web/tests/userFiles.test.ts`, `apps/web/tests/sqlScan.test.ts`, `tools/e2e/account.spec.ts`, `tools/e2e/admin-catalog.spec.ts`, `tools/e2e/shop.spec.ts`, `tools/e2e/global-setup.ts`, `tools/e2e/global-teardown.ts`, `LAUNCH-READINESS.md` (row H15), `verify.mjs` (expected tables), the cutover runbook.
- 3D: `/avatar3d/result`, `/avatar3d/gallery`, shared detail and public share page viewers; bundled demo models `apps/web/public/assets/*.glb`.
- Copy: `apps/web/lib/legal.ts`, `apps/web/lib/aiPrompts.ts`, `packages/db/src/helpArticles.json`.
- Marketing: `tools/marketing/out/credentials.txt` (gitignored).

### Paste-ready templates

> **For Claude — paste this:** (question-round opener for any new feature)
```text
[Describe the feature or change in plain words.]
Don't write code yet. First read the current screens/code involved so your questions are concrete.
Ask me at least 10 questions, ONE AT A TIME, each as multiple choice with your recommended option first and marked "(Recommended)".
After the last answer, play back a consolidated spec and close any loose end with one more question.
The final question must be about shipping: commit locally and hold / commit + push to [remote(s)].
```

> **For Claude — paste this:** (self-contained background task brief, modelled on the 2026-09-13 briefs)
```text
In the [App] repo at [ABSOLUTE PATH] ([stack summary: monorepo layout, which app is which]), [exact problem, with file paths and the pattern file that already does it right].

Do this:
1. [Implementation step with guard rails: what must never be touched, error handling, logging rules.]
2. [User-facing copy change, exact wording or tone.]
3. Tests: [unit test to add, e2e spec + test name to extend, what it must assert, protected demo data].
4. Rules for this repo: no AI attribution anywhere (code, comments, docs, commit messages); commit as `[name] <[noreply email]>`; before pushing run `npx tsc --noEmit` in [app dirs], `npx vitest run --pool=threads` in [dir], `[ENV FLAGS] npx turbo run build`, and `E2E_DB=1 npx playwright test` (one worker; kill leftover servers on ports [ports] first). Staging database only ([env file]); never production; never `neon env pull`. The build takes several minutes.
[If parallel sessions exist:] Another session is editing [paths] — do not touch them. Other background tasks may edit [paths]: pull and rebase before pushing and resolve conflicts carefully.
[Finish:] Push to [branch] only when all are green, then confirm on [staging URL] that [visible result].
```

> **For Claude — paste this:** (safe push with a pasted token; use only if no credential manager/SSH)
```text
Push rules for this session:
- Never store the token: push with an inline URL and never use -u:
  git push https://<user>:<TOKEN>@github.com/<user>/<repo>.git <local-branch>:<remote-branch> 2>&1 | sed -E 's/ghp_[A-Za-z0-9]+/ghp_***REDACTED***/g'
- After every push: grep .git/config for the token and scrub if present.
- Never write the token into any file or doc.
- Remind me to revoke the token when the work is done.
```

> **For Claude — paste this:** (bug report format that got a one-shot fix)
```text
In [app], after [precondition], go to [screen], open [item], tap [control], then [action].
Instead of [expected], it [actual].
It should [expected]. Fix it, verify both the reported path and the other paths into the same screen, then commit and push to [remote(s)].
```

> **For Claude — paste this:** (merge-readiness check)
```text
Are we ready to merge [branch] into main? Before answering, verify end to end: structural audit, every screen in both apps, the flows changed on this branch in every plan/role state, no horizontal overflow at desktop and 390px, zero console errors, git clean. Tell me anything you could not verify and what I should click through myself. Don't merge until I say "merge".
```

> **For Claude — paste this:** (client-facing module document)
```text
Turn our feature discussion into a client-facing "Additional Modules" document:
- For each feature: What it is · Why it matters · Where you'll see it (plain words, no screen IDs) · How it works (one plain line) · How it can earn (options; client picks ONE) · Our suggestion.
- No complexity ratings, no prices inside feature sections.
- Pricing revealed only at the end in a table; add an offer table if asked.
- Plain text, no emoji, client tone. Save to [absolute folder] as .md, uncommitted.
Then create a separate internal build guide .md explaining how to build each module into [prototype/app] if chosen.
```

---

## 11. Session running

- **Models**: prototype-phase commit trailers named an Opus 4.x model; the September side tasks ran as background sessions (model not stated in the archive). Your auto-memory now forbids AI attribution in client repos.
- **Session length**: the wireframes chat is one very long conversation spanning 2026-07-14 → 2026-08-05 with multiple days of gaps; two compactions inside this scope (07-21 07:10, 08-04 04:41) — both resumed mid-task from the summary without re-asking.
- **Durations observed**: small copy/UI edits 1–3 minutes including verification and push; plan-model overhaul ~14 minutes; desktop-native pass ~25 minutes; 3D avatar first build ~13 minutes after questions (question round itself ~25 minutes); mood board build ~20 minutes; share-awareness ~5 minutes after questions. September: `npm ci` in a fresh worktree ~30+ minutes (22:36 → 23:09); turbo build 6m18s; full Playwright ~30 minutes (23:24 → ~23:56).
- **Plan mode** used for understanding-only questions (journey walkthrough), document drafting, and the backup push; plan file location was the user profile `.claude/plans/…` (not the project).
- **Background processes**: local preview servers left running between turns (and stopped when an experiment was dropped); in September, `npm ci`, build and Playwright ran in background and "woke" the session on completion.
- **Parallel sessions/worktrees (September)**: three tasks launched at the same minute (22:20) in separate worktrees under `UI\.claude\worktrees\<name>\backend`; branch per task (e.g. `account-file-cleanup`, `fix/avatar-front-facing`); env files copied into each worktree; heavy e2e kept alone on the machine; later briefs explicitly warned about concurrent edits and required pull/rebase before push.
- **Failure mode**: one side-task session ended immediately with an API connectivity error (ENOTFOUND) — relaunch is cheap when the brief is self-contained.
- **Tool limits**: screenshot tool unusable in the prototype phase; skills requiring interactive install could not be installed in a non-interactive session; Claude has no Vercel/DNS account access (dashboard steps are yours).
- **Memory**: at the end of the September account-cleanup task Claude updated memory with the outcome and the mock-flag finding.
