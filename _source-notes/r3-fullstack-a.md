# Source notes r3-fullstack-a — UI prototype rounds, tech-stack decision, Step 1 full-stack frontend

**Scope read:** `Project History\chats\2026-08-05-ui-and-backend-1.md`, lines 1–4482 (the whole first part of that archive).
**Period covered:** 2026-08-05 03:05 → 2026-08-21 13:04 (UTC as stored in the archive).
**Milestones covered:** importing the wireframe repo → branded dark "UI" prototype (standalone single HTML file) in about ten question-driven rounds → AI image / icon / 3D asset pipeline → a reusable UI playbook for other apps → the 15-plus-question tech-stack round → "Step 1": the Turborepo monorepo frontend (customer app + admin app + shared UI + Drizzle DB package with seeded data), verified with 73 Playwright screenshots.

**How to read these notes:** the archive leaves out tool calls and tool output, so exact shell commands are rarely shown. Where a command is written below as "(reconstructed)", it is rebuilt from what the assistant said it did. Commands shown without that label were quoted word for word in the chat.

**Naming rules used in these notes:** the person the app was built for is "the client". The developer (the user of Claude Code) is "you". GitHub account names are written as `<GITHUB_OWNER>` (the owner of the client repos) and `<OTHER_GITHUB_ACCOUNT>` (a second personal account that turned out to have no access). The fictional demo people inside the prototype (friends in the social feature) are called "demo friends". Secrets are never shown.

---

## 1. Timeline

### 2026-08-05 — importing the repo and reading the project

- **03:05–03:18 · Repo import.** You asked Claude to import the private repo `Assemble_UI_Version_1` and pasted a GitHub personal access token (PAT) plus the author name.
  - Token 1 was valid but belonged to `<OTHER_GITHUB_ACCOUNT>`, which could not see the repo (GitHub answers "Not Found" both for a missing repo and for a private repo you are not allowed to see).
  - Token 2 (a fine-grained `github_pat_…` token) belonged to `<GITHUB_OWNER>` but still could not see it. Claude listed the Assemble repos that token *could* see (`Assemble_Wireframes_Version_1`, `Assemble_Wireframes_Version_2`, `assemble-coming-soon-page`) and asked which one to import, as a multiple-choice question.
  - Token 3 (a classic `ghp_…` token) worked. The repo was fetched into `D:\Documents\Deep Learn HQ\Clients\<client-folder>\UI` on `main`. The latest commit was "Add PROJECT-HANDOFF.md — full context for a fresh session".
  - The remote `origin` was saved **without** the token. The token was used once per command and never written to `.git/config`.
  - Claude warned several times that three tokens had been pasted into chat as plain text, and advised revoking the unused ones and rotating the working one.
- **03:21–03:24 · Deep read.** You: "read v throughly and understand the project first…". Claude read `PROJECT-HANDOFF.md`, the README, git branches and the whole 1,775-line `Assemble - Prototype.html`: about 60 customer screens, 14 admin screens, about 75 modals, flowcharts and two JS controllers. It saved a project summary to memory. The summary covered:
  - the product: AI outfit matching; a closet built from photos; style profile; occasion- and weather-aware suggestions; collections; shop-the-gap through affiliate stores; sharing for votes and comments; travel packing lists; a 3D avatar built from four photos by Tripo AI, never named in the UI
  - the money model: credits, credit packs, Plus and Pro subscriptions, feature gating and ads for free users
  - the architecture: one self-contained HTML file with no framework and no build step; two controller objects `U` (customer) and `A` (admin), each with `st` state, `go()`/`back()`, `render()` and a delegated `click()` that reads declarative `data-*` attributes; design tokens as CSS variables in `:root`
- **03:25–03:27 · Brand assets.** You attached the logo concept PDF, the coming-soon page (`coming soon page\index.html`) and the client's 3D scan GLB. The PDF could not be rendered (poppler was not installed), so Claude pulled its text out with Python. The brand system it found:
  - **Logo:** the "Double Take" concept. A thin capital A with two rings of the lowercase wordmark "assemble" orbiting it. The coming-soon page already had it as a live CSS-3D animation.
  - **Colours:** navy `#0F111F` background, surface `#1E222A`, purple accent `#8F6EF2`, ice cyan `#C9F2FF` as the second accent, off-white ink `#F4F8FC`, muted grey `#8B93A5`.
  - **Fonts:** Plus Jakarta Sans (weights 200–800) for display and body text; Space Grotesk for UI data and letter-spaced labels.
  - **Voice:** energetic and social, yet premium. The tagline is "Where everything coordinates".
- **03:30 · Skills search.** You asked whether to search the internet for skills. Claude searched and recommended installing nothing new, because the local set already covered the work: `frontend-design`, `gsap-scrolltrigger`, `threejs-webgl`, `react-three-fiber`, `web3d-integration-patterns` and `dataviz`. Adding overlapping community skills would only add noise and token overhead. It also noted that `frontend-design` warns against Space Grotesk as a lazy default; the font was kept because it is the client's chosen brand font.
- **03:31–04:10 · Design question round 1 (30 questions).** You asked for "at least 20 questions … one by one … multiple choice … highlight the recommended". Claude asked 30 (Q1–Q30); all decisions are listed in §2. It then wrote **`Assemble - Image Brief.md`**: 43 AI image prompts with exact filenames and one shared style block (dark navy editorial with a violet rim light).
- **06:23–06:45 · Redesign build (about 22 min).** You: "start the build now with styled placeholders". What Claude did:
  - created branch `redesign-v1`
  - loaded the `frontend-design` skill
  - wrote the design system CSS and spliced it in place of the greyscale styles
  - updated `<head>` with Google Fonts, GSAP from a CDN, `<model-viewer>` and the PWA links
  - put a `<model-viewer>` on the avatar result screen
  - fixed inline colours that assumed a light theme (found by grep)
  - made the PWA icons
  - compressed the GLB with Draco from 56 MB to 5.9 MB (WebP texture compression failed)
  - verified in the browser: zero horizontal overflow on 26 screens at 375 px, zero console errors, core flows driven through the DOM, screenshots of welcome, home, the upsell modal, the generation sequence, the 3D avatar and desktop
  - committed and pushed the branch
- **06:48–06:50 · Vercel deploy blocked.** Vercel refused to build because the commits were authored by the machine's default git identity, which is not a collaborator on the Vercel project. On the Hobby plan, private repos cannot add collaborators. Claude set the repo-local git identity to `<GITHUB_OWNER> <<GITHUB_OWNER>@users.noreply.github.com>`, rewrote both redesign commits with that author and force-pushed with a lease. The token was used inline only, and `.git/config` was checked afterwards.
- **06:51 · Merge.** You: "merge in main". It was a fast-forward merge of `redesign-v1` into `main`, pushed, and Vercel built production. The greyscale version stays recoverable at its old commit.
- **06:58–07:08 · Round 2 (7 questions): moving logo on auth screens and a matte 3D avatar.**
  - The animated orbit-A was added to welcome (large) and to login and signup (a compact crest of about 110 px). All four instances come from one shared routine.
  - You chose to port your reference Three.js viewer instead of tuning `<model-viewer>`. That brought: a MeshLambert material swap (no specular highlights), hemisphere plus key, fill and rim lights, ACES tone mapping at exposure 1.8, a charcoal radial backdrop, orbit controls with damping, an auto-rotate toggle, a reset button and a "Drag to orbit · Scroll to zoom" hint.
  - Draco decoding was wired in. The model loads once and is shared by three screens, and only one WebGL context is alive at a time.
  - Commit pushed to `main`.
- **17:39–18:04 · Real imagery.** You had generated contact sheets from the brief (four sheets plus two Gemini originals).
  - Claude sliced them into 45 files, later 49, with the brief's filenames, and built an **imagery engine** that maps images onto placeholders by matching card text. 73 placeholders got real photos.
  - No source photos existed for the 3D-avatar "Add your photos" step, so Claude rendered front, back, left and right views from the GLB in the browser.
  - The browser pane blocks cross-origin fetches and downloads. Claude first moved the renders out as chunked base64 (slow), then wrote a small same-origin Node dev server `.claude/dev-server.js` (gitignored) with a `POST /save?name=` endpoint that writes into `img/`.
  - Commit pushed.
- **18:57–19:51 · Round 3 (5 questions).**
  - Login and signup are now centred vertically and use the welcome-size logo, which shrinks to about 60 % on screens shorter than 700 px.
  - The client's real four photos (front, back, left, right) replaced the rendered views in the 3D creation step only, with a light 3:4 crop, in a 2-up portrait grid.
  - The rendered views were deleted by being overwritten under the same filenames, so no wiring changed.
  - You corrected the product model: the 2D avatar image and the 3D avatar are two separate things; the four photos exist only for 3D generation; onboarding only *introduces* 3D.
- **20:06–21:19 · Round 4 (30 questions).**
  - The 3D viewer is portrait 3:4 everywhere, capped at 400 px wide and centred.
  - A 2D-avatar pipeline was added: onboarding step 3/3 became "Your 2D avatar" with a head-to-toe front photo, an optional side photo, an optional account photo and body type.
  - All look surfaces were wired to switch automatically to "worn" full-body images once they exist.
  - Closet items got multi-angle uploads: front required; back, left and right optional; plus a one-line explainer.
  - The admin panel got a 2D avatar config card.
  - The flowcharts, Coverage, Walkthrough and Presenter Script docs were all synced.
  - **`Assemble - Worn Looks Brief.md`** was written: 12 prompts, one generic AI model, navy studio.
  - The build itself took about 13 minutes. Pushed.
- **22:18–22:21 · Worn looks in.** You dropped 12 files saved as `.jpg.png`. Claude converted them to real JPEGs (1280 px, quality 86) and deleted the originals. The auto-switch flipped every look surface with **zero code changes**. Pushed.
- **22:32 → 08-06 00:05 · Round 5 (47 questions).**
  - AI item detection became paid: 10 free, then 1 credit **for everyone**. You corrected that subscribers pay too; it is not a subscription perk.
  - Chips and option rows got radio dots; forward buttons got trailing arrows and squarer secondary buttons.
  - Onboarding now shows the live 3D viewer (preloaded in the background), and the sharing intro screen was deleted.
  - Portrait grids everywhere.
  - Friend search: live filtering after 2 characters, with Add turning into Requested.
  - **Data-driven screens:** a look database (`LOOKDB`) with a per-look image, item list, owned/missing state, "why this works" text and share seeds, so every card opens *its own* data. This replaced your idea of "custom screens for each option".
  - An interactive Get Started checklist.
  - Docs synced. Build about 18 minutes. Pushed.

### 2026-08-06 — polish rounds, custom icons, compaction

- **00:53–01:10 · Grid prompts for 18 missing item photos (4 questions).** Two 3×3 sheets with filename labels baked in, in the item-library style. Sheet B came back as a 5×3 with duplicates, so Claude picked the right nine by position. The labels were trimmed off while slicing. Pushed.
- **01:38–03:08 · Round 6 (67 questions, including 11 one-by-one icon concept questions and 5 on motion and spacing).**
  - Refine became paid regeneration (1 credit).
  - Swap works for real, followed by a paid "Render updated look · 1 credit" bar.
  - Outfit naming on save plus inline rename.
  - SVG back chevrons (52 replaced).
  - A coloured Google "G" on the sign-in button.
  - Ice-cyan selection dots.
  - Navy and violet 3D backdrop, with the thumbnail still re-rendered.
  - Match screen shows all closet items in a horizontal strip.
  - The full animated logo with a fast 6-second ring as the one loader.
  - Consent moved to signup as a single checkbox.
  - Saved outfits: pills filter in place and the extra collection screen was removed.
  - Support screenshot attach flow.
  - Camera or gallery sheet everywhere a photo enters.
  - Closet count fixed.
  - A modal spacing pass.
  - Nav animation: a gliding dock pill, an icon pop, a breathing glow under the Match button and a gliding highlight on the desktop rail.
  - **`Assemble - Icon Brief.md`** written for a 4×3 grid of 11 icons with the bottom-right tile empty.
  - Pushed.
- **03:13–03:18 · Custom icons wired.** The grid was sliced into 11 icons, each auto-cropped, squared to 96 px and turned into a white alpha mask. CSS mask tinting through `currentColor` colours them in the dock, rail, credits pill, whole-closet tile, card menus, share buttons, camera sheet and profile. Pushed.
- **03:42–05:18 · Round 7 (31 questions, extended mid-round).**
  - Portrait heroes on item detail, confirm-item, product detail and all shop cards.
  - Closet expanded so that every item a look marks "Owned" really exists in the closet (28 items, 8 categories).
  - Detect fills a blank form.
  - Tapping the backdrop closes modals.
  - Recent outfits moved above the Match call-to-action.
  - Swap modal highlight plus thumbnails.
  - **`PRODDB` product database**, which fixed the shop opening the wrong product.
  - Match now generates two outfits, and Compare compares them automatically.
  - Packing list costs 10 credits.
  - Plan cards lost their dots.
  - A new 3D model per look ("Clean and sharp" compressed from 58 MB to 6 MB).
  - Pushed.
  - Note: you **dismissed** the final delivery question ("do not proceed, wait for next instruction"). Your next mid-turn messages (new assets plus "Yes – go") then restarted the build.
- **05:24–05:45 · Ring fix.** The generated icon rings repeated "assemble" like a pattern, so every prompt now says the word appears **exactly once** per ring. A new 4×4 grid (12 admin icons, a hanger-plus-spark Match icon, a kebab menu icon, two empty tiles) and an indigo-jeans photo were wired in. Pushed.
- **06:20–06:31 · Move to another collection (4 questions).** A picker sheet, a real move with live counts, a "+ New collection" row, and entry from both the card menu and outfit detail. Pushed.
- **06:34–06:56 · (6 questions).** New onboarding and create-screen 3D model (54 MB compressed to 5.4 MB); a camera icon on "Snap a new item"; a full docs pass; a 3×2 ring-fix icon prompt. Pushed.
- **07:05–07:10.** Ring-fixed profile, shop and share icons wired in (the closet icon was deliberately left alone at your request). The home Match call-to-action got the hanger icon. Pushed.
- **07:12–07:15.** Deleted the "Dinner look" 3D avatar and kept all related state consistent. Pushed.
- **07:26 · Context compaction.** The session ran out of context and continued from an automatic summary (details in §11).
- **07:28–07:58 · Round 8 (15 questions).**
  - Per-avatar "Edit photos" sets: Clean and sharp gets its own four photos at 672×900 with the title "Edit photos · Clean and sharp" and an "Update 3D avatar · 8 credits" button.
  - **Match screen redesign into three numbered paths:** Style me from my closet / Snap a new item / Start from one item. The item strip sits inside card 3; a "Build around this item →" button appears after selecting; the occasion step shows a context line.
  - Pushed as commit `f5cf4e6`.

### 2026-08-19 to 08-20 — making it reusable

- **08-19 21:43–21:46 · `UI-Build-Playbook.md`.** You asked for an .md file a new session could use to build a UI this good for another app that only has a proposal. The playbook covers:
  - a 5-phase process: proposal → screen and flow map → big decision Q&A → styled skeleton → asset and polish rounds, with the lesson "build branded from day one, not greyscale first"
  - the architecture and the design system
  - the asset pipeline
  - the skills to use in each phase
  - an index of the pitfalls
  - a bootstrap message (its §12)
- **08-20 00:04–00:05 · Framing advice.** You asked how experiences should be "framed on screen" (the question came from the new app's session). Claude described the framing principles. For the new app it recommended "2 phone frames + 2 desktop dashboards": one cinematic launcher, overflow checks at 375 px for the mobile apps and at 1280 px and 1024 px for the dashboards.

### 2026-08-21 — tech stack and Step 1 frontend

- **11:15–11:47 · Tech-stack round (about 18 questions).** The decisions are in §2. Claude wrote **`Assemble - Tech Stack.md`** and pushed it (commit `1da474d`). The doc ends with an 8-point decision framework:
  1. team first
  2. buy, don't build
  3. cheap exits over vendor promises
  4. free tiers that don't sabotage you
  5. architecture shaped by the workload
  6. platform economics (a PWA keeps 100 % of credit revenue)
  7. one language
  8. defer what doesn't block
- **11:52–13:04 · Step 1 build (about 72 min).** Your rules: set up the monorepo and the whole frontend in one go, local only in a new `front end` folder, do not push, then screenshot every screen, fix even the slightest mistake and verify again. What Claude did:
  - re-read the prototype as the spec
  - scaffolded the Turborepo
  - ported the design system CSS 1:1 into `packages/ui`
  - wrote `packages/db` with the Drizzle schema (including a `generations` async-job table) and typed seed data
  - built `apps/web`: 43 routes and about 40 modals
  - built `apps/admin`: login plus 2FA and 14 sections
  - `next build` of both apps: clean
  - installed the Playwright browser and ran both servers on ports 3000 and 3001
  - took 73 screenshots: 3 console errors (admin product images missing)
  - found the 3D viewer camera zoomed past the model; fixed it with auto-framing
  - found credits reset on reload; fixed it with a session-persisted store with SSR-safe hydration
  - re-crawled all screens
  - ran an automated interaction and overflow suite `tools/verify.mjs` over 31 routes at 375 px; a false alarm from the test's own selector was fixed
  - final crawl: **0 console errors, 0 page errors, 0 problems**
  - nothing was pushed

---

## 2. Decisions and why

### 2.1 Process decisions

| Decision | Why |
|---|---|
| Read the whole project before any work ("understand everything first"). | Claude built a full mental model (screens, controllers, `data-*` vocabulary, tokens) and saved it to memory, so later rounds did not break flows. |
| Do not install community skills; use `frontend-design`, `gsap-scrolltrigger`, the Three.js skills and `dataviz`. | The installed skills already covered design quality, motion and 3D. Overlapping skills add noise and token overhead. |
| Every change batch starts with a question round: N questions, **one at a time**, multiple choice, with Claude's recommended option marked. | Decisions get made *together*. Claude's recommendation always carries a reason; you can override or type a free-text answer that corrects the product model. |
| Round 1 Q27: **one full delivery** (not milestone checkpoints). | You wanted the whole redesign at once. Q28 added a safety net: all work on a `redesign-v1` branch while greyscale `main` stays deployable. |
| Build with **styled placeholders** first; real images arrive later with zero code changes (fixed filenames). | Nothing blocks on asset generation. The imagery engine maps files by name and swaps them in automatically. |
| "You generate, I brief" for images (Q11). | Claude could not generate images in the session. You ran Gemini with the prompt packs Claude wrote, and Claude sliced and wired the results. |
| Each round ends "build all → verify → push main" (Q40 of round 5, and others). | One rhythm: implement everything, drive the flows in the browser, one push so Vercel deploys. |
| Sync docs (flowcharts, Coverage, Walkthrough, Presenter Script) every round. | Keeps the client-facing docs true. You chose "Update everything now" or "Sync all" almost every time. |
| Hold (don't push) when the delivery question is dismissed. | When you dismissed Q31/31, Claude waited for your next instruction before building. |
| Step 1: local only, new `front end` folder, nothing pushed, screenshot-verify-fix until zero defects. | Your explicit instruction. It keeps the production frontend separate from the prototype repo until it has been reviewed. |
| Two-step plan for production: (1) frontend plus a real database schema with seeded data on a free DB; (2) backend, integrations, launch. Most phase-2 choices were deferred. | "As soon as possible". Phase-2 decisions (for example the job queue) wait until the frontend is complete, unless something is a prerequisite now. The one prerequisite locked early: **every AI action is an async job row** (`generations` table). |

### 2.2 Design-system decisions (round 1, 30 questions)

1. **Theme:** dark-first, navy `#0F111F`. It matches the logo and coming-soon page, giving the most brand cohesion.
2. **Personality:** premium editorial ("a next-gen styling app, not a shopping cart").
3. **Purple:** restrained; only on primary calls-to-action, active states and focus. Cyan is a rare second accent.
4. **Architecture:** keep the same single HTML file and restyle it in place. All 75 screens keep working, and it still deploys as one static file.
5. **Scope order:** customer app first, then admin.
6. **Motion:** rich and cinematic (you picked this over the recommended "polished micro-interactions").
7. **Animation engine:** GSAP from a CDN (about 70 KB). Best timelines and staggers, and a dedicated skill exists.
8. **3D avatar:** a real GLB model, first through `<model-viewer>`, Draco-compressed.
9. **Orbit logo:** only on the splash screen and loading moments ("the brand moment IS the wait moment").
10. **Imagery:** an AI-generated photo set.
11. **Who makes the images:** you generate, Claude writes the brief.
12. **Shapes:** soft-rounded corners: 16–20 px cards, 12–14 px buttons, pill chips.
13. **Cards:** glassmorphism (you picked this over the recommended layered-dark style).
14. **Background behind the glass:** ambient drifting blobs, film grain and a vignette (the coming-soon recipe).
15. **Primary button:** a purple gradient pill (`#A98EEF→#8F6EF2`) with navy text.
16. **Mobile nav:** a floating glass dock with a glowing centre Match button.
17. **AI generation moment:** a branded sequence: orbit-A plus cycling captions plus a shimmer, about 2–3 seconds.
18. **Screen transitions:** directional slide and fade, with content staggering in.
19. **Type:** more generous; base size 15 px, thin display headings.
20. **Space Grotesk:** only for labels, data and numbers.
21. **Modals:** glass bottom sheets with a spring on mobile, centred glass dialogs on desktop.
22. **Launcher:** a cinematic brand gate (orbit-A plus three glass cards: Customer / Admin / Flows).
23. **Onboarding:** full-bleed and immersive.
24. **PWA:** manifest and icons now; **no service worker**, because cache invalidation makes a prototype painful to iterate.
25. **Ads and upsell:** elegant and integrated; the upsell modal is a mini landing page.
26. **Desktop:** a glass side rail with a wider canvas; the same components as mobile.
27. **Review rhythm:** one full delivery.
28. **Safety net:** a git branch.
29. **Empty states and toasts:** branded and warm.
30. **Guardrails:** full. Respect `prefers-reduced-motion`, WCAG-AA contrast on glass, limited blur areas, 44 px touch targets.

### 2.3 Later UI and product decisions (rounds 2–8), with reasons

- **Animated logo on welcome, login and signup** (you rejected "welcome only"). On forms it is a compact 110 px crest, later centred at welcome size and shrinking on short screens, so the form stays visible without scrolling.
- **Matte avatar:** fully matte (metalness 0, roughness 1, the same effect as a Lambert material swap), a charcoal studio backdrop, rotate, reset and hint controls, one viewer shared by all 3D screens. You chose to **port the Three.js viewer** over tuning `<model-viewer>` because it matches the reference site exactly.
- **Real client photos:** a light crop that keeps them authentic, because real user photos *should* look like phone snapshots. They appear only in the 3D creation step. The rendered views were deleted.
- **Portrait 3:4 everywhere** for people, avatars, looks, items and products. Width is capped at 400 px and centred on desktop, framing is full body plus a small margin. Reason: the product is about full-body outfits, and landscape crops cut people off.
- **2D avatar:** step 3/3 was reworked into "Your 2D avatar" with front and side photos (you chose two slots over the recommended single dropzone). Body type and measurements are kept as supporting data. The account photo is optional on the same step. Consent: the existing modal wording was updated. The demo slots are empty and show silhouette guides (your choice, to show the empty-state UX).
- **Worn looks:** every look surface. The person is a **generic AI model**, not the client (you chose this; it avoids likeness questions). All 12 looks, same navy studio. The flat-lay survives only as the secondary "pieces in this look" image.
- **Closet angles:** front required; back, left and right optional, offered as a strip on the Confirm screen, with a one-line reason why side photos help, and **no** indicator on closet cards (your choice).
- **AI detection monetisation:** 10 free, then 1 credit, for **everyone**. When it is locked, the manual form stays usable. The spend is logged in usage history. At 0 credits it opens Buy Credits. Admin controls both numbers. It charges once per item, not per angle.
- **Choices vs actions** (the core UI grammar fix):
  - choices (chips and option rows) get a leading dot, the same dot for single and multi-select (your choice), later ice cyan everywhere
  - forward buttons are gradient pills with a trailing →
  - secondary buttons get squarer 10 px corners
  - applied app-wide as one system
  - reason: "the button Next: preference looks the same as selecting weather"
- **Data-driven screens instead of duplicated screens.** Every card carries its identity (title, image, meta) and a single detail screen renders that data. Reason: it behaves like "custom screens per option" without cloning 70 screens, and it is how the real app will work. Extended later to `PRODDB` for products, per-look share seeds, notifications, "why this works" text and swap alternatives.
- **Get Started checklist:** tap to check off (you chose this over automatic tracking); checkbox on the left while the row still navigates; a count plus a slim progress bar; celebrate at 5/5 and hide automatically; progress lasts for the session only; Dismiss always available.
- **Pricing rules (in credits):** generate = refine = render-after-swap = detection = 1 credit; packing list = 10 credits; 3D update = 8 credits in the demo. Rule: **AI pass = credits, manual edit = free**, but after a manual swap there is a paid "render updated look" action (your refinement of the rule).
- **Icons:** totally custom and generated by AI (your choice over thin-line stock icons). Two families:
  - thin white line glyphs with a small tilted ring where the word "assemble" appears **exactly once**
  - "3D things drawn 3D": wireframe heart, coin, cube and camera, with no ring
  - colour applied through CSS mask tinting of white icons
  - you picked each concept one by one (A-frame house for home; open wardrobe doors for closet; hanger plus spark for match, which replaced the spark you found "not relatable"; a vertical kebab replacing the orbit dots)
  - the closet icon is **never** to be changed again
- **Loader:** the full welcome logo with a fast ring (about 6 s per turn) as the single processing signature, including the 3D build.
- **Consent:** one "photos I upload are of me or I have consent" checkbox at signup (pre-checked in the demo) instead of per-flow checkboxes.
- **Saved outfits:** pills filter in place, a manage row per collection, the collection screen removed, a ⋮ menu on every card. Move to another collection moves the card for real and updates counts.
- **Closing modals:** tap the backdrop, with a grab-handle hint and no ✕ added (avoids clutter on about 75 modals).
- **Truthful demo data:** the closet count matches the visible items; every item a look marks "Owned" exists in the closet; "I bought this" really adds the product to the closet.
- **Wording:** no backend-speak ("type at least 2 characters" removed); "Continue with Google", not "Gmail", because it signs in with a Google account.
- **Match screen:** three numbered paths in the order Style me → Snap new → Pick an item; icons hanger, camera, wardrobe; benefit-led description lines; gradient number chips; the item strip inside card 3; a CTA that appears only after an item is selected (no global Next button); a context line on the occasion step. Reason: the screen must make it clear there are three distinct ways to start.
- **Per-avatar photo sets and per-look 3D models:** each avatar keeps its own photos and model, which is truthful to how the product would work.

### 2.4 Tech-stack decisions (2026-08-21)

| # | Question | Chosen | Reason given |
|---|---|---|---|
| 1 | Who builds and maintains it | Deep Learn HQ | Favour mainstream, hire-able tech so the client can staff it later. |
| 2 | Timeline | **Two steps:** (1) frontend plus DB structure with seeded data on a free DB; (2) backend, integrations, launch | "As soon as possible". Supabase free was rejected *for now* because free projects pause after inactivity. |
| 3 | Platforms | PWA only, at a URL, installable from the browser, no app stores | Stores would take 30 % of credit sales; web camera APIs are enough. |
| 4 | Frontend | Next.js + React + TypeScript | Biggest hiring pool, first-class on Vercel, server routes hold API secrets later, and it can be wrapped with Capacitor into APK/IPA files later if ever needed (your follow-up question). You also asked what Tripo uses: Nuxt/Vue, which does not constrain Assemble because it only calls Tripo's API. |
| 5 | Styling | Tailwind + ported design tokens | Consistent by construction and pixel-faithful to the prototype. (In the Step 1 build the prototype CSS was actually ported 1:1 into `packages/ui`.) |
| 6 | Free DB | **Neon Postgres** free tier | Real Postgres that never gets disabled (it sleeps and wakes in about 500 ms). Moving to Supabase later is a Postgres dump and restore. |
| 7 | DB access | **Drizzle ORM** | TypeScript-first, SQL-shaped, has migrations, portable between Neon and Supabase; typed seed scripts. |
| 8 | Auth | Auth.js (Google + email/password) + OTP codes sent through **Resend**, users stored in Neon → Supabase Auth later | Matches the designed flows (email plus Google login, OTP after email signup). Free. Google needs a free Cloud OAuth setup. |
| 9 | Core AI | **Google Gemini** image API | You already art-direct the whole visual language with Gemini; one vendor covers generation and vision/detection. |
| 10 | Long jobs (queue) | **Deferred** ("take phase 2 decisions once front end is complete") | Only the prerequisite was locked now: AI actions stored as async job rows. |
| 11 | State | TanStack Query + Zustand | TanStack Query holds server data (with polling for job status); Zustand is a tiny store like the prototype's `st` for UI state. You asked for an "explain like I'm 15" version first. |
| 12 | Media in phase 1 | Repo `/public` served by Vercel's CDN; the DB stores paths | Free, no extra service; uploads come later. |
| 13 | Motion | Motion for React; CSS for signature animations (the orbit logo) | The React-native way to do transitions and springs; GSAP fights React's render model. |
| 14 | 3D in React | `<model-viewer>` web component | Smallest integration surface; switch to react-three-fiber only if custom materials are needed. |
| 15 | Repo shape | **Turborepo monorepo:** `apps/web` + `apps/admin` + shared packages (your choice over the recommended single app with an `/admin` route) | Clean separation and independent deploys. |
| 16 | Testing | **Full pyramid:** Vitest unit + Testing Library component + Playwright end-to-end (your choice over smoke tests only) | The highest safety net. |
| 17 | Observability | PostHog + Sentry free tiers | Funnels and session replays, plus error stack traces. |

---

## 3. Reusable user prompts

Each entry has: the original message (lightly cleaned), its date, what it achieved, and a general template.

### 3.1 Import a private repo with a token
- **Original (2026-08-05 03:05):** "can you import repo: https://github.com/`<GITHUB_OWNER>`/Assemble_UI_Version_1 — also Personal Access Token: `<GITHUB_PAT>` — Author: `<GITHUB_OWNER>`"
- **Achieved:** Claude checked the token against the GitHub API, worked out which account it belonged to and which repos it could see, cloned using the token only once per command, and saved `origin` without the token.
- **Template:**
> **For Claude — paste this:**
```
Import the repo https://github.com/[OWNER]/[REPO] into this folder.
Use this token only inline for the fetch; never write it to .git/config or any file: [TOKEN]
Commit author for this repo: [NAME] <[NAME]@users.noreply.github.com>
First check the token with the GitHub API (which user it belongs to, whether it can see the repo) and tell me if access is missing.
```

### 3.2 Understand everything before touching anything
- **Original (2026-08-05 03:21):** "read v throughly and understand the project first - then we might ad skills and convert these highfeidelity grey scale wirfeames into a moderdern looking pwa. we have logo and color pallete and font selected but we need to make this super awseome, we ll talk about it later first you should understand eveything about the project."
- **Achieved:** a full read of the handoff doc and the prototype, a saved memory summary and a clear list of the assets still needed (logo, palette, font), plus the two architecture choices to settle.
- **Template:** "Read [HANDOFF/README/main files] thoroughly and understand the project first. Don't change anything. Summarise what it is, how it's built, and what you need from me before we [GOAL]. Save the key context to memory."

### 3.3 Hand over brand assets
- **Original (2026-08-05 03:26):** attached the logo PDF, the coming-soon page `index.html` and `.gitignore`, the coming-soon `.claude/settings.local.json` and the 3D scan GLB, with no other text.
- **Achieved:** the brand system was extracted (colours, fonts, voice, the logo animation) and saved to memory; the GLB was spotted as a chance to show a real 3D avatar.
- **Template:** "@[logo file] @[existing brand page] @[3D/other assets] — extract the full brand system (colours with hex, fonts with weights, logo usage, voice) and save it to memory."

### 3.4 Ask whether to add skills
- **Original (2026-08-05 03:30):** "would you search the internet for any skills we can use? or should we not"
- **Achieved:** a researched "don't install anything" answer, with the local skills mapped to the work.
- **Template:** "Search for Claude Code skills that would help with [TASK]. Compare with what's already installed and recommend whether to install anything (default: don't, if we're covered)."

### 3.5 The question-round contract (the most-used prompt)
- **Original (2026-08-05 03:33, sent three times after interrupting two drafts):** "Ask at least 20 questions to understand discuss the UI and take decisions together, got it? ask one by one and give multiple choice options to select from and highlight the recommended by you."
- **Achieved:** 30 decisions in about 37 minutes, then a single design brief. The same sentence, with N changed, opened every later round: 6 or 7 (logo and matte avatar), 5 (auth centring and photos), 30 (portrait, 2D avatar, angles), 40+ → 47, 4 (grid prompts), 50 → 67, 15 → 31, 3 → 4, 5–7 → 6, 5 → 15 (per-avatar photos and Match redesign), 15 → 18 (tech stack).
- **Why it works:** one question at a time keeps each decision small. Claude's recommended option includes a reason. You can pick "Other" and type a correction or add scope, and Claude folds it into the next question.
- **Template:**
> **For Claude — paste this:**
```
[DESCRIBE THE CHANGES OR GOAL]

Ask at least [N] questions to understand, discuss and take decisions together.
Ask them ONE BY ONE, each as multiple choice, and mark the option you recommend (with a one-line reason).
After the last answer, summarise all decisions, then build everything, verify in the browser, and [push to main / keep local].
```

### 3.6 Start building without waiting for assets
- **Original (2026-08-05 06:23):** "start the build now with styled placeholders"
- **Achieved:** the full redesign was built and verified while the AI images were still being generated.
- **Template:** "Start the build now with styled placeholders; use the final filenames from [BRIEF] so real assets drop in later with zero code changes."

### 3.7 Fix a blocked deploy by author
- **Original (2026-08-05 06:48):** a screenshot of the blocked Vercel deploy plus "use pat: `<GITHUB_PAT>` — author: `<GITHUB_OWNER>`"
- **Achieved:** repo-local git identity set, commits rewritten with the correct author, force-pushed with a lease; deploys unblocked for good.
- **Template:** "Vercel blocked the deploy (screenshot). Set this repo's git author to [NAME] <[noreply email]>, rewrite my unpushed/branch commits with that author, and force-push with a lease. Use the token inline only."

### 3.8 Merge
- **Original (2026-08-05 06:51):** "merge in main"
- **Template:** "Merge [BRANCH] into main (fast-forward if possible) and push. Tell me the commit to recover the old version from."

### 3.9 Change requests with reference files plus a question round
- **Original (2026-08-05 06:58):** "on the login pages cant we have the moving logo, also for the 3d avatar - its too shinny , can you make it have the same setting as the website it was on: i have attached files. Ask at least 6 questions…"
- **Achieved:** the reference Three.js viewer was ported for a matte avatar; the logo went onto the auth screens.
- **Template:** "[CHANGE 1]. [CHANGE 2] — make it match [REFERENCE] (files attached). Ask at least [N] questions… one by one…"

### 3.10 Wire in generated assets
- **Original (2026-08-05 17:39):** "i would like to add the placeholder images and images used to create the 3d avatar. is that possibl?"
- **Achieved:** Claude found your generated sheets on disk, sliced 45–49 files and built the imagery engine.
- **Later variant (2026-08-05 22:18):** you just pasted the 12 file paths of the worn looks and nothing else; Claude converted and wired them.
- **Template:** "I generated the images from [BRIEF] — they're in [FOLDER]. Slice/convert them to the brief's filenames, wire them in, verify every surface, and push."

### 3.11 Layout fixes plus assets plus push instruction
- **Original (2026-08-05 18:57):** "Login and signup each screen should be like center alligned and not sticking to the top, also the logo on these should be same size as the one we have on welcome — here are the images I wanna use for the 3d avatar creation fro front back left right. Ask at least 5 questions… in the end push to main."

### 3.12 A long product-thinking brief
- **Original (2026-08-05 20:06), shortened:** "When you open the user app and tap the 3D Avatar button … the avatar image there is displayed in a landscape-style frame. Can you please change it to a portrait layout so the full 3D avatar is visible from head to toe … Please apply this consistently across the app… During onboarding, we currently ask the user to upload a profile picture … I think we should ask them to upload a clear, full-body photo from head to toe instead… the generated result should show the user actually wearing those selected items… allow users to upload multiple angles of their closet items … Front image … Back image … Optional left-side image … Optional right-side image … This should remain optional and not make the upload process too heavy… Ask at least 30 questions…"
- **Achieved:** portrait viewers, the 2D-avatar pipeline, worn-look auto-switch, multi-angle closet uploads, docs sync, and a worn-looks prompt pack, in one round.
- **Why it works:** it explains the *purpose* ("does not properly communicate the purpose of the application"), states the principle ("apply consistently wherever…"), and lists the required vs optional parts.
- **Template:** "Change [SCREEN] from [CURRENT] to [DESIRED] and apply it consistently wherever [ELEMENT] appears, including [LIST]. The goal is [PURPOSE]. Required: [X]. Optional: [Y] — keep it light. Ask at least [N] questions…"

### 3.13 A punch list of many small issues from a real click-through
- **Original (2026-08-05 22:32):** "On user app when i add something to closet it says after first image … AI detected: Shoes · Green · Sneaker · Casual … I want this ai detection to be a paid feature. Also the button and selections look the same… during onboarding where it shows the 3D avatar … It should show the actual 3D avatar… the last onboarding screen for sharing. Delete that. … recent outfits … should be portrait… when trying to add friends, as you type the username, it would auto-populate… the detail page does not show the right image… a lot of things that we click on … do not show the right information. Would it be possible for us to maybe add custom screens for each options? Ask at least 40+ questions…"
- **Also (2026-08-06 01:38):** an 18-item punch list (refine monetisation, nav icons, wrong count "143", naming outfits, off-centre back arrow, Google button, dot colour, 3D background, whole-closet icon, only 3 closet items shown, loader logo, swap incomplete, consent placement, saved outfits flow, support attach, backend-speak text, old still image, live camera, white square on cards) "…Ask at least 50 questions…"
- **Also (2026-08-06 03:42):** a 13-item list: portrait item details, dot overlap, admin icons, owned items missing from closet, remove the 3D tag, clipped icons, Match button not relatable, reorder home, swap highlight, orbit-dots icon, portrait confirm screen plus detect populating the form, no way to close modals, shop opening the wrong product. "…Ask at least 15 questions…"
- **Achieved:** each became a round of 47, 67 or 31 decisions, built, verified and pushed in 15–20 minutes of build time.
- **Template:** "Here's what I noticed clicking through [APP]: 1) [ISSUE] 2) [ISSUE] … For each, propose the fix. Look for the same problem elsewhere in the app. Ask at least [N] questions… then build all, verify, push."

### 3.14 Extend a round from the last answer
- **Original (2026-08-05 23:40, typed as the answer to Q40):** "also Get started with assemble, can be made interactive? Ask at least 7 more questions … then build all verify and push main"
- **Original (2026-08-06 02:27, answer to Q50):** "i want you to go through each icon one by one with me, Ask questions… sometime in the modal the items/elements/buttons/containers are not spaced properly. also i want the nav menus side and bottom to be animated. Ask at least 5 questions…"
- **Original (2026-08-06 04:31, answer to Q16):** "yes do that and also match an outfit generate 3 outfit but it need to make only two. also dark indigo jeans has wrong image … plan for a trip cost 10 credits … Ask at least 15 questions…"
- **Why it works:** the "Other" box on the delivery question is a natural place to add scope without starting a new round.

### 3.15 Correct the product model inside an answer
- "there are 2 types of avatar one is 2d image and one is the 3d avatar, the 4 pictures are only for the 3d avatar generation … during onboarding we are just introducing our 3d avatar feature." (2026-08-05 19:42)
- "this is not a per every subscriber pays for detection." (2026-08-05 22:42)
- "swap is manual but after swaping there should be a way for user to generate the swapped look and thats 1 credit." (2026-08-06 02:07)
- "3d heart with no ring but please where ever there is a ring - the ring should say assemble like we have on the logo." (2026-08-06 02:31)
- **Lesson:** when a recommended option is based on a wrong assumption, say the correct rule in one sentence; Claude carries it into all later work (and into memory).

### 3.16 Ask for grid prompts for AI image generation
- **Original (2026-08-06 00:53):** "can you give me a (Optional round 2) prompts that would help me generate these pictures in a grid all together? Ask at least 4 questions…"
- **Original (2026-08-06 01:38, inside the punch list):** "give prompts to generate a grid of these icon and make it so that in the grid bottom right corner tile is empty."
- **Achieved:** 3×3, 4×3, 4×4 and 3×2 grid prompts with baked filename labels and a shared style paragraph.
- **Template:**
> **For Claude — paste this:**
```
Write one copy-paste prompt per sheet for [GENERATOR] to make a [ROWS]x[COLS] grid of [ITEMS].
Shared style paragraph first (backdrop hex, lighting, stroke/scale consistency, no logos/watermarks).
Then a numbered cell map. Print each cell's filename under it in small white text.
Leave the bottom-right tile(s) EMPTY. Save the prompts in [BRIEF FILE].
```

### 3.17 Correct a generated-asset rule
- **Original (2026-08-06 05:24):** "when i use this prompt it creates icons and the ring on those icons should say assemble just once, like our logo"
- **Achieved:** every ring definition in the brief rewritten ("EXACTLY ONCE … the rest of the ellipse stays a plain thin line … never repeated as a pattern").

### 3.18 Finish a dead button
- **Original (2026-08-06 06:20):** "complete the move to other collection feature/button. Ask at least 3 questions…"
- **Template:** "Complete the [FEATURE] button — it's dead right now. Make it truly change state (counts, lists) like everything else. Ask at least [N] questions…"

### 3.19 Protect a choice
- **Original (2026-08-06 07:05):** "I dont want to change the closet icon and here is the grid attached. also on home screen there is a match an outfit section with an icon, why is it not same as the hanger one we made? why? lets change that to the hanger one"
- **Achieved:** the closet icon was recorded as "never change"; a leftover glyph was fixed.

### 3.20 Clarify a screen's message
- **Original (2026-08-06 07:38, inside an answer):** "i want to rename 'Use my whole closet' to something else so give me options also the match an outfit screen need to be designed in a way that it feels like there are 3 options - Use my whole closet to generate an outfit based on my preferences, 2. snap a picture of something new and match it with existing clothes in the wardrobe or 3 pick an item from the closet to create an outfit out of it. basically is more like rearrange the item in the screen so our message is clear to the user using the app. Ask at least 10 questions…"
- **Achieved:** the three-numbered-path Match screen.

### 3.21 Make the method reusable
- **Original (2026-08-19 21:43):** "so now i want to make such a ui for another application that i have and i love how this ui looks and behaves. i want you to be able to give me an md file for a new session that help me build ui for another app, i dont have wireframes for it and just the proposal. mention all skills used and everything else require to be able to make this for the new app?"
- **Achieved:** `UI-Build-Playbook.md` with a bootstrap message.
- **Template:** "Write a self-contained .md playbook a fresh session can follow to build [SAME QUALITY THING] for a new app that only has [INPUTS]. Include process, architecture, design system, asset pipeline, skills per phase, pitfalls, verification checklist, and a paste-ready bootstrap message."

### 3.22 Tech-stack decision round
- **Original (2026-08-21 11:15):** "hey can you suggest what would be a good tech stack for assemble? and also guide me how should we decide the tech stack - what to consider - Ask at least 15 questions to understand discuss so we can take decisions together, got it? ask one by one and give multiple choice options to select from and highlight the recommended by you."
- **Useful follow-ups typed as answers:**
  - "what tech stack does trippo ai uses?"
  - "if we use next js plus react and typescript do you this stack can be converted to ipa or apk file easily?"
  - "we currently have login/signup with email and gmail in the app and then an otp is send if user adds email. so how will this be managed on frontend?"
  - "what would be required to connect google auth?"
  - "lets take phase 2 decisions once front end is complete but if there a pre req we can discuss that"
  - "can you explain this question as if i am 15 year old"
- **Achieved:** `Assemble - Tech Stack.md` plus a decision framework.
- **Template:** "Suggest a tech stack for [APP] and teach me how to decide (what to consider). Ask at least [N] questions one by one with recommended options, then write the decision doc into the repo."

### 3.23 Build a phase locally with screenshot verification
- **Original (2026-08-21 11:52):** "ok lets start step 1 - set up the monorepo and frontend complete everything in one go all rounds then verify everything by taking screenshots. i want you to not push anything but make a new folder locally called front end and store everything there as independent front end component. once you complete all round take screenshots of every screen and verify and look for even the slightest mistake and fix it and then verify again and complete to perfection the step 1. understood? read everything you already have first so you have proper context of everything before starting. remember to keep everything locally first."
- **Achieved:** the whole monorepo in about 72 min; 73 screenshots, 3 real flaws fixed, a re-crawl with 0 problems.
- **Template:**
> **For Claude — paste this:**
```
Start [PHASE]. First re-read [SPEC FILES / PROTOTYPE] for full context.
Build everything in one go inside a NEW local folder [FOLDER] — do NOT commit or push anything.
When done: build every app, take a screenshot of EVERY screen (mobile + desktop), inspect each image for even the slightest mistake, fix, then re-shoot and verify again until zero defects.
Also run an automated check: console errors, page errors, horizontal overflow at 375px, and the key money/gating flows.
Report what you found and fixed, and how to run it.
```

---

## 4. Working method

### 4.1 The round loop (used about 10 times on the prototype)
1. **You click through** the live app (Vercel or local) and write a free-form list of issues and ideas, often long, with the goal behind each one.
2. **You add the contract:** "Ask at least N questions… one by one… multiple choice… highlight the recommended."
3. **Claude inspects the code first** where needed ("Let me look at how the current edit photos flow works before asking my questions"; "Let me spot the new avatar file first").
4. **Question round.** Each question is numbered `Qk/N`, has 2–4 options with a one-line trade-off each, and one "(Recommended)" option. Claude often asks more than N when a topic needs follow-ups (asked 20 → got 30; 40+ → 47; 50 → 67; 15 → 31). Answers can be free text, which Claude treats as a correction or an extension.
5. **Last question = delivery confirmation** ("Build all → verify → push main?"). You often used that last answer to add scope.
6. **Build** with batch scripts (Python master scripts making count-checked replacements in the single HTML file; "17/17 applied", "Script A landed (36)").
7. **Verify in the browser** (see §7).
8. **Commit and push to `main`.** Vercel deploys automatically.
9. **Delivery report:** numbered sections matching the decisions, what was verified, the commit hash, and "your one to-do" (for example "generate the icon grid from the brief").
10. **Update memory** with the round state.

### 4.2 Briefs for assets (Claude writes, you generate)
- `Assemble - Image Brief.md` (43 prompts), `Assemble - Worn Looks Brief.md` (12 worn looks plus the round-2 item grids), `Assemble - Icon Brief.md` (icon style spec, a 4×3 grid, a 4×4 grid, a 3×2 ring-fix grid, the indigo-jeans single image).
- The pattern: one shared style paragraph, then a numbered cell map, filename labels baked under each cell, the bottom-right tile(s) left empty, flat vector / no gradients (icons) or navy studio with a violet rim light (photos).
- You generated with Gemini and dropped the files into `Downloads` or `img/`. Claude found them, sliced them with Pillow, mapped cells **by the baked labels** (generators shuffle positions), cropped, converted, compressed and wired them.
- 3D: you generated GLB models with Tripo (50–58 MB each). Claude compressed them with Draco to about 5–6 MB and wired them per look or per touchpoint.

### 4.3 Placeholders with fixed filenames, plus auto-detection
- Everything was built first with styled placeholders using the final filenames. Worn looks: on load the app probes for `worn-look-clean-sharp.jpg`; if it exists, every look surface switches to the worn images with no code change.

### 4.4 Branch → merge → main-only
- Round 1 used a safety branch (`redesign-v1`), then a fast-forward merge. After that, every round pushed straight to `main`, because Vercel deploys from `main` and each round was verified first.

### 4.5 Keeping docs in step
- Every round asked whether to sync the flowcharts and the three client docs (Coverage, Walkthrough, Presenter Script). You almost always said yes, keeping "client docs truthful".

### 4.6 Truthfulness as a principle
- Repeatedly: data shown must be real and consistent (closet counts, owned items exist, shop opens the right product, the credit spend is logged, a move really moves). Prototype shortcuts like toast-only actions were replaced with real state changes.

### 4.7 Handling interruptions and mid-turn messages
- You often interrupted ("[Request interrupted by user]") to fix the wording of a prompt and re-sent it.
- Mid-turn messages with new assets and corrections (a new worn photo, a new GLB, "compare screen should be portrait") were folded into the running build.
- A dismissed question ("[User dismissed — do not proceed, wait for next instruction]") meant stop and wait.

### 4.8 Making the method portable
- `UI-Build-Playbook.md` captured the process for another app. Its key lesson: **build branded from day one** instead of greyscale wireframes first.
- The framing advice for multi-portal apps: phone frames for resident/customer apps, desktop dashboards for staff portals, one cinematic launcher, a different verification width per frame.

### 4.9 Step 1 method (production frontend)
- Re-read the spec (the prototype) → scaffold → port the design system → data package (schema plus seeds) → customer app screens → modal system → auth and onboarding → main app → admin app → housekeeping (a `.gitignore` so nothing gets committed by accident, README, a screenshot crawler) → `next build` for both apps → Playwright screenshots → image-by-image inspection → fixes → re-crawl → automated interaction and overflow suite → final crawl → memory update → report.
- The apps run from seed data when no `DATABASE_URL` is set, so the frontend is fully usable before the backend exists. The README documents the exact swap points for Step 2.

---

## 5. Services and access

| Service | What was set up / used | Access given to Claude | Where stored | How verified | What broke |
|---|---|---|---|---|---|
| **GitHub** | Private repo `Assemble_UI_Version_1` under `<GITHUB_OWNER>` (the UI prototype). Earlier repos also existed: wireframes V1 and V2, the coming-soon page. | Three PATs pasted in chat on 2026-08-05: token 1 (`ghp_…`, wrong account `<OTHER_GITHUB_ACCOUNT>`, no repo access); token 2 (fine-grained `github_pat_…`, right account but no access to this repo); token 3 (classic `ghp_…`, worked). The same token 3 was pasted again for the force-push. | **Not stored.** Used inline per command (one-off auth header or inline URL). `origin` kept clean; `.git/config` checked clean after pushes. | GitHub REST API: `/user` (whose token), the list of accessible repos, then `/repos/<owner>/<repo>`. | Claude flagged all three as exposed in chat and advised rotation several times (still in use on 08-21). Later memory: the old PAT died on 2026-09-10 and was replaced; `<OTHER_GITHUB_ACCOUNT>` in the keyring has no repo access. |
| **Git identity** | Repo-local `user.name` / `user.email` = `<GITHUB_OWNER>` / `<GITHUB_OWNER>@users.noreply.github.com`. | — | `.git/config` of the UI repo (identity only, no secrets). | The next Vercel deploy was accepted. | The machine's global identity (an agency account) caused blocked Vercel deploys. |
| **Vercel** | Project connected to the GitHub repo; builds `main` (production) and branch previews (`assemble-ui-version-1-git-redesign-v1-…vercel.app`). Hobby plan. | No token in this scope. You looked at the dashboard and sent a screenshot of the block. | — | Push → auto deploy; you checked the dashboard or preview URL. | Deploy blocked for a commit author who is not a collaborator (Hobby plan cannot add collaborators to private repos). |
| **Google Gemini (image generation, used by you)** | Used by you in its app/UI to generate the contact sheets, worn looks, item grids and icon grids from Claude's briefs. | None (manual). | Generated files in `Downloads` / `UI\img\`. | Claude inspected each sheet visually and by size. | Sheets came back with different pixel sizes, duplicates (5×3 instead of 3×3), shuffled cell positions, repeated ring text, double extensions `.jpg.png`, and some PNGs that Windows GDI+ could not decode. |
| **Tripo AI (3D, used by you)** | Generated the client's avatar GLB models and later per-look models ("Clean and sharp", "Onboarding and welcome"). Never named in the UI. | None (manual). | `assets/avatar-3d.glb`, `assets/avatar-clean-sharp.glb`, `assets/avatar-intro.glb` (compressed copies). | Loaded in the in-app viewer. | Raw files 50–58 MB → must be compressed. |
| **Google CDNs** | Google Fonts (Plus Jakarta Sans, Space Grotesk); `<model-viewer>`; the Draco decoder from gstatic for Three.js. | — | `<head>` of the prototype. | Rendered in the browser. | — |
| **GSAP CDN** | Animation engine for the prototype. | — | `<head>`. | — | — |
| **Local dev servers** | `py -m http.server 8871` at first; then `.claude/dev-server.js` (Node, static files plus `POST /save?name=` into `img/`). | — | `.claude/` (gitignored). | Browser pane loads `http://127.0.0.1:<port>/`. | An old Python server on port 8844 served a stale copy. |
| **Claude Browser pane** | Used to drive and verify the prototype (DOM scripts, screenshots). | — | — | — | Screenshots fail when the pane is hidden; cross-origin fetch and native downloads are blocked. |
| **Planned (decided 08-21, not yet set up in this scope)** | Neon Postgres free tier; Drizzle; Auth.js with Google OAuth (needs a Google Cloud OAuth client); Resend (OTP email, free tier); Gemini image API; Tripo API; Supabase (phase 2: DB, Auth, Storage); PostHog; Sentry; Capacitor (optional later). | — | Planned: env variables (`DATABASE_URL`, etc.). In Step 1, apps run from seeds when `DATABASE_URL` is missing. | — | Supabase free was avoided for now because free projects pause. |
| **Playwright (local)** | Browser installed for the screenshot crawl in `front end/`. | — | `front end/` dev dependencies. | 73 screenshots captured. | — |

---

## 6. Commands and CLI

> The archive removes tool calls. "(Quoted)" means the exact command appears in the chat text. "(Reconstructed)" means rebuilt from the narration; check it before reuse.

### 6.1 GitHub access checks (reconstructed)
```bash
# Which account does this token belong to?
curl -s -H "Authorization: Bearer <GITHUB_PAT>" https://api.github.com/user
# Can it see the repo? (404 = missing OR no permission)
curl -s -H "Authorization: Bearer <GITHUB_PAT>" https://api.github.com/repos/<GITHUB_OWNER>/<REPO>
# List repos visible to the token
curl -s -H "Authorization: Bearer <GITHUB_PAT>" "https://api.github.com/user/repos?per_page=100"
```

### 6.2 Clone or fetch without saving the token (reconstructed)
```bash
git init
git remote add origin https://github.com/<GITHUB_OWNER>/<REPO>.git     # clean URL, no token
# one-off auth for a single command (basic auth with the token as password):
git -c http.extraHeader="Authorization: Basic <BASE64(x-access-token:<GITHUB_PAT>)>" fetch origin
git checkout main
```
Narration: "Bearer auth didn't work — let me try basic auth with the token as the password (one-off, not saved)".

### 6.3 Fix the author and force-push safely (reconstructed)
```bash
git config user.name "<GITHUB_OWNER>"
git config user.email "<GITHUB_OWNER>@users.noreply.github.com"
# rewrite the branch's commits with the new author
git rebase <base-commit> --exec "git commit --amend --no-edit --reset-author"
# a push through an inline URL leaves no remote-tracking ref, so refresh it first
git fetch https://<TOKEN>@github.com/<GITHUB_OWNER>/<REPO>.git redesign-v1:refs/remotes/origin/redesign-v1
git push --force-with-lease=redesign-v1:<old-remote-sha> https://<TOKEN>@github.com/<GITHUB_OWNER>/<REPO>.git redesign-v1
# then check .git/config holds no token
git config --get-regexp remote
```

### 6.4 Branch, merge, push (reconstructed)
```bash
git checkout -b redesign-v1
git add -A && git commit -m "Redesign: dark editorial brand system"
git checkout main && git merge --ff-only redesign-v1
git push https://<TOKEN>@github.com/<GITHUB_OWNER>/<REPO>.git main
```
Commit messages seen in this scope (examples of the style): "Redesign Match screen around three numbered paths; per-avatar Edit photos", "Remove the Dinner look 3D avatar", "Ring-fixed icons (profile, shop, share) + hanger icon on home Match CTA", "Intro avatar model, snap-camera icon, docs catch-up, ring-fix icon prompt", "Add production tech stack decisions doc (17-question round)". **Standing rule for client repos: no AI attribution lines in commits.**

### 6.5 Serving the prototype locally
```bash
py -m http.server 8871 --bind 127.0.0.1        # (quoted) then open http://127.0.0.1:8871/
node .claude/dev-server.js                     # (reconstructed) static + POST /save?name= → img/
```

### 6.6 PDF text when no renderer is installed (reconstructed)
```bash
python -c "import pypdf; r=pypdf.PdfReader('Logo_Concept.pdf'); print('\n'.join(p.extract_text() for p in r.pages))"
```

### 6.7 GLB compression (reconstructed; the tool is implied by "Draco" plus the WebP/sharp failure)
```bash
npx @gltf-transform/cli optimize in.glb out.glb --texture-compress webp   # failed (sharp/vips issue)
npx @gltf-transform/cli draco in.glb out.glb                               # worked: 56MB → 5.9MB
```
Later: 58 MB → 6 MB (Clean and sharp), 54 MB → 5.4 MB (intro model).

### 6.8 Image slicing and conversion (Python/Pillow; reconstructed)
- Read the **actual** sheet size (`Image.open(p).size`); never assume it (one sheet was 2752 px wide, not 2816).
- Crop the cells, trim the baked label strip, save with the brief's filename.
- Worn looks: `.jpg.png` → RGB JPEG, resized to 1280 px, `quality=86`; delete the originals.
- Real photos: a 3:4 crop around the figure, about 900 px tall (672×900 for the per-avatar sets).
- Icons: luminance → alpha mask, crop to the glyph's bounding box plus padding, square 96 px PNG; check alpha coverage with numbers (white on transparent is invisible in previews). The crop zone was changed from 0.72 to 0.79 of the tile height after glyph bottoms got clipped.
- Rule learned: write the Python scripts as `.py` files in the scratchpad; inline Python inside PowerShell breaks on quotes and here-strings.

### 6.9 Step 1 monorepo (reconstructed from narration plus the quoted run commands)
```bash
# inside "front end/"
npx create-turbo@latest       # or a hand-written turbo.json + npm workspaces
npm install
npx next build                # per app (apps/web, apps/admin) — "Web app builds clean — all routes"
npx playwright install chromium
npm run dev                   # (quoted) both apps: web :3000, admin :3001
npm run dev:web               # (quoted)
npm run dev:admin             # (quoted)
npm run screenshots           # (quoted) re-captures every screen into front end/screenshots/
node tools/verify.mjs         # (reconstructed) interaction + overflow suite
```

---

## 7. Testing and verification

### 7.1 Prototype verification (every round)
- **DOM-driven flow tests in the Claude browser pane:**
  - login → home → generate (credits go down) → results → outfit detail → 3D creation with consent and credit gating → subscribe to Pro annual (credits added, ads gone, Saved unlocked) → share with the re-share guard
  - later: detection gate, refine loop, swap → render bar, move to another collection (Work 3→2, Club 1→2), friend search, checklist, per-avatar edit mode ("Update 3D avatar · 8 credits" confirmed after topping up credits), fresh-create mode resets, regenerate keeps the avatar's identity
- **Overflow check:** "zero horizontal overflow across 26 screens at 375 px"; repeated each round at 375×812.
- **Console errors:** a zero-error check before every push.
- **Screenshots:** of the showpiece screens (welcome, home, upsell modal, generation, 3D avatar, desktop rail). When the pane was hidden, Claude switched to DOM measurements instead (for example "viewer is 343×458, correct 3:4 portrait"; "worn mode active").
- **WebGL:** "only one WebGL context alive at a time"; clean mount and unmount between screens.
- **Numeric checks of data states**, for example gallery = ["Clean and sharp","Everyday"] and the Dinner look ready row hidden.
- **Driving closure-scoped code:** `U` is not global, so tests click DOM elements instead of calling controller functions ("`U` is closure-scoped — driving via DOM clicks instead").

### 7.2 Step 1 verification (2026-08-21)
- **Compile gate:** `next build` for both apps must be clean before any screenshots.
- **Crawl 1:** 73 screenshots (mobile and desktop passes) with Playwright, capturing console errors per page → 3 console errors (admin product images missing because the admin `public` folder only had icons).
- **Visual inspection image by image** found:
  1. 3D viewer empty: the `field-of-view` override zoomed past the model → camera auto-framing
  2. admin product images missing → assets copied and the server restarted
  3. credits reset on page reload → a session-persisted store with SSR-safe hydration
- **Crawl 2** after the rebuild: both models render and auto-rotate; the admin products page was re-shot.
- **Automated interaction suite** `tools/verify.mjs`: the generate flow spends a credit; Plus/Pro gates fire; swap → render bar works; purchase adds 50 credits; no horizontal overflow on **31 routes at 375 px**. First run: one failure from the test itself (its selector matched a description paragraph, not the Swap link) → test fixed → **0 problems**.
- **Final full crawl** after the persistence change: **0 console errors, 0 page errors.**
- **Planned but not run in this scope:** the full test pyramid (Vitest unit tests, Testing Library component tests, Playwright end-to-end tests in CI).

---

## 8. Security

- **Tokens used inline only:** the PAT went into a one-off header or inline push URL; `origin` stayed clean; `.git/config` was checked after pushes; tokens were redacted from command output.
- **Exposure warnings:** Claude repeatedly flagged that tokens were pasted in plain text and advised revoking the unused ones and rotating the working PAT (on 08-05 03:09, 03:18, 06:50, 06:51, then 08-19 and 08-21). Treat any token pasted in chat as compromised.
- **Least-privilege observation:** token 1 gave write access to *all* repos of another account; Claude pointed this out as a risk.
- **Force-push with a lease** (`--force-with-lease=<branch>:<expected-sha>`) so nothing else could be overwritten.
- **Dev tooling kept out of the repo:** `.claude/` (dev server with a write endpoint) is gitignored. The `/save` endpoint only writes into `img/` and only runs locally.
- **Local-only Step 1:** the `front end/` folder is ignored by the prototype repo, with its own `.gitignore` "so nothing gets accidentally committed/pushed".
- **Privacy and consent in product design:**
  - full-body photo consent wording (biometric-adjacent data), revocable in Settings
  - later a single signup checkbox "Photos I upload are of me, or I have the person's consent" covering 2D, 3D and closet uploads
  - a generic AI model (not the client) for worn looks, to avoid likeness questions
  - the 3D vendor is never named in the UI
- **Secrets architecture decided for production:** secret API keys (Tripo, image generation, payments) must live in server routes, one reason for choosing Next.js over a pure SPA.
- **Admin:** the admin app has login plus 2FA screens (seeded in Step 1).
- **Reduced-motion and accessibility guardrails** (not security, but part of the "professional" baseline).

---

## 9. Pitfalls

Each entry: Symptom / Cause / Fix / Prevention.

1. **Private repo "Not Found".**
   - *Symptom:* clone fails; the API returns 404.
   - *Cause:* the token belongs to another account, or a fine-grained token was not granted this repo.
   - *Fix:* call `/user` to see the owner and list visible repos; get a token from the owning account with access.
   - *Prevention:* before any clone, check the token's owner and repo access with the API.
2. **Bearer auth rejected by git over HTTPS.**
   - *Cause:* git over HTTPS expects basic auth.
   - *Fix:* basic auth with the token as the password, one-off.
   - *Prevention:* use the basic-auth header form, or the inline `https://<token>@github.com/...` URL for a single push.
3. **Vercel "deployment blocked".**
   - *Symptom:* preview/production not built.
   - *Cause:* the commit author (the machine's global git identity) is not a collaborator; the Hobby plan cannot add collaborators on private repos.
   - *Fix:* set the repo-local identity to the owner's noreply email, rewrite commits with `--reset-author`, force-push with a lease.
   - *Prevention:* set `git config user.name/email` in each client repo **before the first commit**.
4. **`--force-with-lease` refused.**
   - *Cause:* earlier pushes went through an inline URL, so no `origin/<branch>` tracking ref existed.
   - *Fix:* fetch or update the tracking ref, then push with an explicit expected SHA.
   - *Prevention:* give the explicit `branch:sha` lease when pushing through URLs.
5. **Stale local server.**
   - *Symptom:* the old greyscale UI shows after the redesign.
   - *Cause:* an old Python server on port 8844 from an earlier session was serving a stale copy.
   - *Fix:* run a new server on a different port (8871).
   - *Prevention:* check which process owns the port; use a project-specific port.
6. **Orbit logo invisible.**
   - *Cause:* `transform: scale(calc(var(--size)/640px))` is invalid CSS (you cannot divide lengths inside `scale`).
   - *Fix:* an explicit unitless `--ls` scale variable.
   - *Prevention:* never compute a unitless scale from lengths in `calc`.
7. **Icons vanished on dark.**
   - *Cause:* transparent-stroke placeholder icons assumed a light background.
   - *Fix:* light product-card tiles (`#E9EDF6`) behind them.
   - *Prevention:* grep for colours assumed by the light theme when switching to dark.
8. **Whitespace eaten in the credits pill on mobile.**
   - *Cause:* an inline-flex container collapses text nodes.
   - *Fix:* `gap: 4px`.
9. **WebP texture compression failed in the GLB pipeline.**
   - *Cause:* a sharp/vips native issue.
   - *Fix:* Draco geometry compression only (still about 90 % smaller).
10. **PDF would not render.**
    - *Cause:* poppler not installed.
    - *Fix:* extract the text with Python.
11. **The browser pane cannot save renders.**
    - *Symptom:* cross-origin fetch blocked, native downloads blocked, base64 transfer heavy.
    - *Fix:* a same-origin Node dev server with a `POST /save?name=` endpoint.
    - *Prevention:* start with that dev server whenever the browser must write files.
12. **Browser screenshots fail.**
    - *Cause:* the pane is hidden or not displayed.
    - *Fix:* check with DOM measurements; take screenshots when the pane is visible.
13. **Edit tool fails on invisible mismatches in a huge HTML file.**
    - *Fix:* Python line-splicing or master scripts with counted replacements.
    - *Prevention:* for big single-file surgery, use scripts that assert how many replacements happened.
14. **Inline Python in PowerShell breaks.**
    - *Cause:* quote and here-string escaping.
    - *Fix and prevention:* always write `.py` files to the scratchpad and run them.
15. **Pillow vs GDI+.**
    - *Symptom:* some Gemini PNGs would not decode with .NET/GDI+.
    - *Fix:* use Pillow.
16. **Wrong crop offsets.**
    - *Cause:* assumed the sheet was 2816 px wide; it was 2752.
    - *Fix and prevention:* always read the real dimensions before slicing.
17. **Generated grids do not follow the prompt.**
    - *Symptom:* a 5×3 instead of 3×3, duplicate cells, shuffled order.
    - *Fix:* cherry-pick by position; map by the baked filename labels.
    - *Prevention:* always bake labels under cells; use at most 9 cells per sheet for fidelity.
18. **Double extension files** (`worn-look-x.jpg.png`).
    - *Cause:* the generator's save dialog.
    - *Fix:* convert to real JPEG under the expected name.
    - *Prevention:* auto-detection code expects exact filenames; normalise on intake.
19. **Clicks fall through to navigation.**
    - *Cause:* the delegated `U.click` uses `closest()` with a list of `data-*` selectors; new attributes (`data-gsx`, `data-frq`) were missing from it.
    - *Fix:* add every new data attribute to the `closest()` list.
    - *Prevention:* keep that list next to the attribute vocabulary.
20. **Detail title ignored the tapped look.**
    - *Fix:* read `st.look` first (`st.look || default`).
    - *Prevention:* every screen that shows an entity must read the identity from state.
21. **A renamed look lost its image.**
    - *Cause:* the fallback looked the image up by the new title.
    - *Fix:* `LOOKDB[title] ? LK(title).img : AIMG.file(title)`.
22. **Shutter toast disappeared.**
    - *Cause:* `go()` cleared the toast.
    - *Fix:* call `go()` first, then set the toast and `render()`.
23. **Selection dot overlapping text.**
    - *Cause:* the dot CSS was inserted *before* the base rule, so the later padding rule won; plan cards needed an opt-out with the same selector strength.
    - *Fix:* a later `#userApp .lrow{padding-left:36px}` and `#userApp .lrow[data-rg="plan"]` for the opt-out.
    - *Prevention:* append overrides after base rules; match specificity for opt-outs.
24. **Swap modal highlight dead.**
    - *Cause:* the modal body was built *after* the loop that toggles `[data-rg]`.
    - *Fix:* set `.on` inline when building.
    - *Prevention:* dynamic content must set its own state, or re-run the toggles afterwards.
25. **Shop opened the wrong product with the wrong photo.**
    - *Cause:* the imagery engine matched the first rule against the whole wrapper text.
    - *Fix:* a data-driven `PRODDB` with identity carried on each card.
26. **"Move" moved the menu chip, not the card.**
    - *Cause:* the ⋮ chip carries the same `data-look` as its card, so the query matched the chip.
    - *Fix:* scope queries to grid cells (`#uSavedGrid > div[...]`).
27. **Icon bottoms clipped.**
    - *Cause:* a label-trim crop zone of 0.72 of the tile.
    - *Fix:* re-slice at 0.79 and audit all icons with numbers.
    - *Prevention:* check glyph bounding boxes against the crop window.
28. **Ring text repeated like a pattern.**
    - *Cause:* the prompt did not say "once".
    - *Fix:* the prompt says the word appears EXACTLY ONCE per ring; the rest of the ellipse is a plain line.
29. **Wrong numbers in demo data** ("143 items" when 5 were visible; "All · 8" showing 4 cards; owned items missing from the closet).
    - *Fix:* seed data consistent with what is shown.
    - *Prevention:* derive counts from data instead of hard-coding them.
30. **Backend-speak shown to users** ("type at least 2 characters").
    - *Fix:* a plain placeholder "Search by name or username".
    - *Prevention:* review UI copy for implementation details.
31. **Wrong product assumptions in recommendations** (detection as a subscriber perk; the four photos used for the 2D avatar).
    - *Fix:* your one-line corrections.
    - *Prevention:* state the monetisation and data-model rules at the start of a round, and save them to memory.
32. **Step 1: empty 3D viewer.**
    - *Cause:* a `field-of-view` override on `<model-viewer>` zoomed in past the model.
    - *Fix:* let the camera auto-frame.
    - *Prevention:* avoid manual FOV; screenshot every 3D screen.
33. **Step 1: admin images missing.**
    - *Cause:* each Next.js app has its own `public/`; admin only had icons.
    - *Fix:* copy the assets and restart the server.
    - *Prevention:* shared media must be in every app's `public` (or a shared static package).
34. **Step 1: credits reset on reload.**
    - *Cause:* an in-memory Zustand store.
    - *Fix:* session persistence with SSR-safe hydration.
    - *Prevention:* decide persistence for demo money state from the start.
35. **Step 1: false test failure.**
    - *Cause:* the test selector matched a description paragraph containing "Swap".
    - *Fix:* a more specific selector.
    - *Prevention:* select by role or test id, not loose text.
36. **Context ran out mid-project** (08-06 07:26).
    - *Fix:* automatic compaction summary; the full transcript path stays available.
    - *Prevention:* keep the memory file up to date after each round so a new or compacted session can resume.

---

## 10. Code and templates worth reusing

All paths are relative to `D:\Documents\Deep Learn HQ\Clients\<client-folder>\UI\` unless stated otherwise.

| Path | What it is / why reuse |
|---|---|
| `PROJECT-HANDOFF.md` | A "full context for a fresh session" document committed in the repo. The pattern: every project keeps one handoff file a new session reads first. |
| `Assemble - Prototype.html` | The whole prototype in one file. Reusable architecture: closure-scoped controllers `U`/`A`; `st` state; `go()/back()/render()`; a delegated `click()` reading `data-nav`, `data-back`, `data-open`, `data-close`, `data-chip`, `data-rg`, `data-act`, `data-toast`, `data-lock`, `data-look`, `data-iimg`, `data-prod`, `data-a3dname`, `data-src`, …; data engines `LOOKDB` (13 looks: img, meta, items, why, share, responses), `PRODDB` (11 products), `SWAPS`, `FRIENDDIR`, `ITEMIMG`; the imagery engine `window.AIMG` (ordered text-matching rules, `data-iimg` override, worn auto-switch probe); the 3D module `window.A3D` (Three.js, Lambert matte swap, light rig, ACES 1.8, navy and violet backdrop, DRACOLoader, per-source model cache by URL); the orbit logo (`.lmark/.lring/.lglyph`, `--ls` scale); `.micon` mask-tinted icons; credit gating (a gate opens Buy Credits; usage rows prepend to the usage list). |
| `Assemble - Image Brief.md` | 43 prompts plus one shared style block plus exact filenames: a template for "you generate, Claude wires". |
| `Assemble - Worn Looks Brief.md` | 12 worn-look prompts using one generic model as character reference, a navy studio, portrait 3:4; also the round-2 item-grid prompts (two 3×3 sheets with baked labels). |
| `Assemble - Icon Brief.md` | Icon style spec (thin white line, the ring with the word exactly once, a 3D wireframe family), plus 4×3, 4×4 and 3×2 grid prompts with empty bottom-right tiles. Reusable almost word for word for any brand icon set. |
| `Assemble - Coverage.html`, `Assemble - Walkthrough.html`, `Assemble - Presenter Script.html` | Client-facing docs kept in step each round: feature coverage, a click-through walkthrough, a demo script. |
| `manifest.json`, `icons/icon-192.png`, `icons/icon-512.png`, `index.html` (dark redirect shim) | A minimal installable PWA without a service worker. |
| `img/`, `img/icons/` | 49+ images; 26 mask icons (white on transparent, 96 px). |
| `assets/avatar-3d.glb`, `assets/avatar-clean-sharp.glb`, `assets/avatar-intro.glb` | Draco-compressed GLBs (about 5–6 MB). |
| `.claude/dev-server.js` (gitignored) | A tiny Node static server with a same-origin `POST /save?name=` that writes into `img/`, so browser-side renders (for example GLB views drawn in the page) can be saved to disk. |
| `UI-Build-Playbook.md` | A self-contained playbook for building a UI of this quality for a new app from a proposal: the 5 phases, architecture, design system, asset pipeline, skills per phase, a pitfall index, a verification checklist, and a bootstrap message in §12. |
| `Assemble - Tech Stack.md` | The stack decision record plus the 8-point decision framework (team first; buy, don't build; cheap exits; safe free tiers; workload-shaped architecture; platform economics; one language; defer non-blockers) and the Step 1 / Step 2 swap plan. |
| `front end/` (local, not in git) | Turborepo: `apps/web` (Next.js customer PWA, 43 routes, about 40 modals, glass dock/rail, `<model-viewer>`, TanStack Query + Zustand with session persistence), `apps/admin` (Next.js admin: login + 2FA + 14 sections), `packages/ui` (prototype CSS ported 1:1), `packages/db` (Drizzle schema including a `generations` async-job table, typed seed data; seed script for Neon/Supabase; apps fall back to seeds when `DATABASE_URL` is missing), `tools/verify.mjs` (interaction and overflow suite), a screenshot crawler (`npm run screenshots` → `front end/screenshots/`), `README.md` (run commands and Step 2 swap points), `.gitignore`. |
| Memory file `C:\Users\<you>\.claude\projects\D--Documents-Deep-Learn-HQ-Clients-<client-folder>-UI\memory\assemble-project.md` | Round-by-round project state that makes compaction and new sessions safe. |

### 10.1 Paste-ready asset intake instruction (generalised from the pipeline)
> **For Claude — paste this:**
```
New generated assets are in [FOLDER]. For each sheet:
1. Read the real pixel size first; never assume it.
2. Find cells by the baked filename labels (generators shuffle positions); skip duplicates.
3. Crop each cell, trim the label strip, check nothing is clipped (compare the glyph/garment bounding box to the crop).
4. Photos: save as JPEG ~[WIDTH]px, quality ~86, 3:4 where the UI is portrait.
   Icons: luminance -> alpha mask, crop to bounds + padding, square 96px PNG, check alpha coverage numerically.
   3D: Draco-compress GLBs (target < 6MB).
5. Save under the exact filenames from [BRIEF]; normalise double extensions.
6. Verify every surface that uses them in the browser, check the console for errors, then commit and push.
Write any helper scripts as .py files in the scratchpad (not inline in PowerShell).
```

### 10.2 Paste-ready verification checklist (prototype stage)
> **For Claude — paste this:**
```
Before pushing:
- Drive the key flows via DOM clicks (not internal functions): [LIST FLOWS incl. every credit gate].
- Check horizontal overflow on every screen at 375px width.
- Zero console errors.
- Screenshots of the changed screens (if the pane is hidden, verify with DOM measurements instead).
- Data truth: counts match seeded items; every card opens its own data.
- One WebGL context at a time on 3D screens.
Report what you verified with numbers.
```

---

## 11. Session running

- **One long session:** archive `a63fa52e-…jsonl` (96.2 MB raw), 2026-08-05 03:05 → 2026-09-02 22:01, with 465 user messages and 978 replies overall; this scope covers the first part up to 08-21 13:04.
- **Model:** a Claude model. The compaction summary names the model as "Fable 5" (it appeared in the commit trailer used then; that trailer is **not** to be copied, because client repos carry no AI attribution).
- **Context compaction:** 2026-08-06 07:26, after about 28 hours of work. The session continued from an automatic nine-part summary: request and intent, key technical concepts, files, errors and fixes, problem solving, all user messages, pending tasks, current work, next step. It points at the full transcript file for details. Work resumed straight away with a new question round. Lesson: the memory file plus the summary made the resume seamless; keep memory updated after every round.
- **Build and run durations:**

  | Work | Time |
  |---|---|
  | Round 1 question round (30 questions) | ~37 min |
  | Redesign build plus verification | ~22 min |
  | Round 4 build (30 decisions) | ~13 min |
  | Round 5 build (47 decisions) | ~18 min |
  | Round 6 question round (67 questions) | ~73 min |
  | Round 6 build | ~15 min |
  | Round 7 build | ~16 min |
  | Icon slicing and wiring | ~5 min |
  | Move-to-collection | ~6 min |
  | Round 8 build plus docs plus verify | ~20 min |
  | Playbook writing | ~3 min |
  | Tech-stack round (18 questions plus doc) | ~32 min |
  | **Step 1 monorepo** (total) | **~72 min** |
  | ↳ dependency install | ~4 min |
  | ↳ customer app | ~30 min |
  | ↳ admin | ~5 min |
  | ↳ build of both apps | ~4 min |
  | ↳ first 73-screenshot crawl | ~6 min |
  | ↳ fix, rebuild, re-crawl | ~8 min |
  | ↳ interaction suite | ~7 min |
  | ↳ final crawl | ~7 min |

- **Background work:** the GLB compression ran in the background while the dev server was started and browser checks began. Dependencies installed while the design system CSS was being written (Step 1).
- **Parallel servers:** the prototype on port 8871 (later the Node dev server). In Step 1 the web app on 3000 and admin on 3001 kept running for you to review.
- **Interruptions:** several "[Request interrupted by user]" events while you refined prompts; one dismissed question stopped the build until the next instruction; mid-turn asset drops were merged into running builds.
- **Other projects from this session:** on 08-19/08-20 you used the playbook in a *separate* new session for another app and brought questions back here (the framing and phone-frame vs dashboard decision). Parallel sessions: one per app, sharing the playbook file.
- **No worktrees or multi-agent workflows** in this scope; all work ran in a single main session with the browser pane for verification. (Multi-agent workflows appear in later scopes.)
