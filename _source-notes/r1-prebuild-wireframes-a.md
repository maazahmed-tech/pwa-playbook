# Source notes r1 — Pre-build phase: coming-soon page, 3D modelling, wireframes (part A)

Scope read in full:
- `Project History/chats/2026-07-09-coming-soon-page.md` (whole; 1,539 lines; sessions 9–10 Jul and 22 Jul 2026)
- `Project History/chats/2026-07-25-3d-modelling.md` (whole; 25 Jul 2026, 20:10–22:47 UTC)
- `Project History/chats/2026-07-14-wireframes.md` lines 1–4192 (14 Jul → 21 Jul 2026 05:33 UTC; the rest of the file is someone else's scope)
- Folders glanced: `coming soon page/`, `3D Modelling of <client>/`, `Wireframes/Version 1/` (file names, READMEs, `.gitignore`, `.claude/settings.local.json`, git logs, the design-handoff README, and the two "Additional Modules" briefs, which were written after this scope).

Naming conventions used in these notes (hard rules):
- "the client" = the person the app is built for. "you" = the developer/user driving Claude Code.
- `<CLIENT_FOLDER>` = `D:\Documents\Deep Learn HQ\Clients\<client-folder>` (the real folder is named after a person, so it is masked).
- GitHub accounts: `<OWNER_GH_ACCOUNT>` = the account that owns the client repos and is linked to Vercel; `<CLI_GH_ACCOUNT>` = the account that the local `gh` CLI keyring was logged into (had no access to the client repos); `<PERSONAL_GIT_IDENTITY>` = the developer's personal git name/email that was the global git default.
- Agency commit author used on the coming-soon repo: `DeepLearnHQ-Dev <DeepLearnHQ-Dev@users.noreply.github.com>` (agency identity, allowed).
- All tokens are `<GITHUB_PAT>` / `<VERCEL_TOKEN>`. No values appear anywhere.
- The chat archive leaves out tool calls and tool output, so commands in section 6 are reconstructed from what the assistant said it did. Where a command is quoted in the chat verbatim, it says "quoted".

---

## 1. Timeline

### Phase 0 — Coming-soon page, first version (9–10 Jul 2026)

| Date/time (UTC) | What happened | Commit |
|---|---|---|
| 9 Jul 23:15 | Kickoff. You attached an exported design file `Assemble Coming Soon.html` (a design-tool export, a single minified line of HTML with JSON-escaped markup) and asked to push it to an existing, empty, public GitHub repo `assemble-coming-soon-page` already connected to Vercel, with the commit author `DeepLearnHQ-Dev`. Claude renamed the file to `index.html` at repo root (so Vercel serves it at `/` with no build step), added `.gitignore`, committed as DeepLearnHQ-Dev. | `7abcb2f` Add Assemble coming soon page |
| 9 Jul 23:16 | Push denied (403): the locally authenticated `gh` account `<CLI_GH_ACCOUNT>` had no write access. Claude offered 3 options (add collaborator / `gh auth login` as owner / push to a repo the CLI account owns). | — |
| 9 Jul 23:18 | You chose "option A" (collaborator). Still denied — no pending invite existed on the CLI account. | — |
| 9 Jul 23:23 | You pasted a classic PAT. Push succeeded using an inline-token URL; remote left clean. Claude warned to revoke the token. | — |
| 9 Jul 23:37 | You deployed on Vercel yourself. Mobile bug: the "ASSEMBLE" wordmark wrapped (the final "E" dropped to line 2 on a ~390px phone). Fix: `16.5vw → 13.5vw`, letter-spacing `.8vw → .4vw`, padding `.06em → .02em`, `white-space:nowrap`, applied to the wordmark and its mirrored reflection with a replace-all. | `ce415ff` |
| 9 Jul 23:41 | Removed the "3D infinity loose loops" (an animated figure-eight SVG orbit behind the wordmark) by `display:none` on its unique `z-index:4` container (editing a minified one-line export is error-prone, so hide rather than cut). | `acfafe3` |
| 9 Jul 23:46 | Bottom marquee ticker stuttered → `will-change:transform` + `backface-visibility:hidden` (GPU layer). | `df1acfc` |
| 9 Jul 23:53 | Custom cursor lagged → easing factors ring `.16 → .45`, dot `.34 → .75`. | `726fdb6` |
| 10 Jul 00:56 | "Remove the custom cursor entirely" → deleted `cursor:none`, hid ring + dot (JS left dormant). | `f26879e` |
| 10 Jul 00:58 | Removed "★ Early Access · 2026" sticker and the email sign-up form. | `6f1a7c9` |
| 10 Jul 01:26 | "Does this look bland?" → Claude explained why (all effects stripped, pure monochrome with no accent) and asked a multiple-choice question with 4 palettes (champagne gold recommended / electric violet / acid lime / stay monochrome). You picked acid lime `#C6F04E`. 24 edits in 2 batches. | `c2d06ac` |
| 10 Jul 02:12 | "Too much lime" → lime reduced to small accents (16 edits). | `79ec364` |
| 10 Jul 02:16 | Background to black (`#000`, faint `#0a0a0a→#050505→#000` gradient). | `746fd2c` |
| 10 Jul 02:18 | Question: glow colour → you chose cyan `#38E1FF` (13 edits). | `56011c6` |
| 10 Jul 02:21 | Hint of lime in halo + dots (cyan→lime duotone). | `c631053` |
| 10 Jul 02:24 | Halo lime → flame orange + red. | `4cf0538` |
| 10 Jul 02:25 | Drop cyan from halo → clean orange→red flame. | `0013ffe` |
| 10 Jul 02:28 | Remove wordmark halo altogether (kept two dark depth shadows). | `d5d4ceb` |
| 10 Jul 02:32 | "What can we do to make it more prominent?" → multi-select question (size up / backlight bloom / brighter chrome + shimmer / dim surroundings). You picked chrome + shimmer: higher-contrast gradient, gradient `220% → 300%`, sweep `6s → 3.8s`. | `c0b28d9` |

That produced 18 commits on 9–10 Jul; all were pushed and auto-deployed by Vercel.

### Phase 1 — Brand/logo revamp of the coming-soon page (22 Jul 2026)

| Date/time | What happened | Commit |
|---|---|---|
| 22 Jul 03:41 | You attached `Logo slide design (1).zip`, a high-fidelity logo handoff: the "Double Take" mark (a thin ExtraLight **A** with a 3D orbit ring carrying the word "assemble" twice + dashed arcs), fonts Plus Jakarta Sans (display) + Space Grotesk (UI), palette bg `#0F111F`, accent purple `#8F6EF2`, cyan `#C9F2FF`, ink `#F4F8FC`, muted `#8B93A5`, panel `#1E222A`, light base `#E2E8EE`. Asked: rebuild the coming-soon page with it, light and dark mode. Claude saved a brand memory note, then wrote a fresh `index.html` with a theme toggle. | local `471cd91` |
| 22 Jul 03:46–03:55 | Local preview through a local static server. Found a real CSS bug: `scale(calc(var(--size)/640))` is invalid (px ÷ unitless), so the whole transform was dropped → mark off-centre, overlapping the wordmark. Fix `/640px`. Verified dark, light, desktop, mobile. | — |
| 22 Jul 03:56 | Push failed: the earlier PAT was revoked ("Invalid username or token"). Commit kept locally. | — |
| 22 Jul 03:58 | You reported wordmark overlapping the bottom marquee and "ring not moving, everything still". Causes: 30s spin is too slow to notice; and the preview browser (and probably your device) had `prefers-reduced-motion: reduce` on, which Claude's own reduced-motion block used to switch the ring spin, marquee and blobs off completely. Fix: spin `30s → 14s`, marquee `30s → 22s`, keep core motion under reduced-motion (calm only ambient drift), size the mark by viewport height as well, reserve bottom clearance. | local `2b80ae5` |
| 22 Jul 04:07 | You: bigger logo mark, delete the dark version, one clean commit "from DeepLearnHQ dev team", no README, PAT to follow. Claude rebuilt light-only (mark 285px mobile / 414px desktop / 240px short-landscape) and squashed to one commit `ee79a67`. | — |
| 22 Jul 04:13 | You changed your mind in the same minute: "Delete the light version and only keep dark version" + a new PAT. Claude swapped to dark-only, squashed to one commit, pushed `c0b28d9..cf95c35`, checked the author and file list on GitHub. | `cf95c35` Revamp coming-soon page with new Double Take logo (dark mode) |
| 22 Jul 04:16–04:25 | "Remember the easter egg functionality?" Claude explained that the old page had a 2-stage dev-credit easter egg (hover the ◵ mark → "developed by DeepLearnHQ"; click → full-screen reveal overlay) and only stage 1 was carried over. You asked to restore the full overlay, remove the "Fashion · Tech" eyebrow and the dot before the tagline, make the tagline whiter (not white), and "cerease" the desktop text by 10%. Claude asked which way "cerease" meant → you picked decrease (wordmark 88→79px, tagline 19→17px, Coming Soon 13→12px, desktop only). | `2621e18` Add DeepLearnHQ reveal easter egg; refine lockup |
| 22 Jul 04:28–04:43 | "Remember the aura?" Claude added CSS organic aurora blobs ("go but dont push i'll verify first"). You then pointed at a different component (a WebGL Three.js "living aurora" from another agency project's sample-design folder). Claude integrated it (Three.js r128 from CDN + `aurora.js`, pointer-reactive), flagged it added a second file. You: "please delete this, lets keep what we have" → `git restore` to the deployed commit, `aurora.js` deleted, working tree clean. | none |
| 22 Jul 04:47–05:10 | "Make this the favicon" (attached image). Claude first drew a simplified SVG → you interrupted: "exactly the attachment, dont make any changes". Claude tried to rasterise the mark and inline base64 by hand, caught that the base64 was truncated/mangled, reverted it. You then saved the image to disk yourself (`coming soon page\favicon.png`, 3200×3200, 374 KB). Question: optimise a copy or use as-is → optimise. Resized with Pillow to 256×256 (16.8 KB), wired `<link rel="icon" type="image/png" href="favicon.png">`. | `215cff2` Use brand mark as favicon (256px) |
| 22 Jul 05:12–05:27 | "What can we do to give a more luxurious and premium look to this page. Nothing flashy!" Claude used plan mode, wrote a plan, asked 3 questions (atmosphere: quiet monochrome / toned-down glow / warm charcoal; ticker: static line / slower & fainter / remove; editorial hairline frame: add / keep borderless). You chose quiet monochrome + slower & fainter + inset frame. Implemented in 2 batches: one soft low-opacity purple pool (cyan removed, opacity `.28→.12`), ring `14s→20s`, longer entrance choreography, subtle tonal wordmark, more spacing, marquee `22s→42s` at opacity 0.5 inside the frame, 1px hairline frame inset 26px. The screenshot tool hung (heavy `blur(100px)`), so Claude reduced blur and verified with computed values. | not committed |
| 22 Jul 15:36 | "SHOW LOCALLY FIRST." Claude gave `http://localhost:8817/index.html` and kept the server running. Session ends with no reply; last assistant line on 5 Sep is "No response requested". The premium refinement was **never committed**; the repo tip stays `215cff2`. | — |

### Phase 2 — 3D modelling of the client's avatar (25 Jul 2026, about 2h37m)

| Time (UTC) | What happened | Commit |
|---|---|---|
| 20:10 | Kickoff: "make a website/web app to present 3D model categories… I have one asset added… be a product designer." (First version said 3 categories, corrected to 2 after an interrupt.) Asset: a 56 MB `.glb` generated in Tripo AI. | — |
| 20:11 | 3 questions: what the categories mean (outfits / distinct models / LOD-format), main job (showcase / client presentation / configurator), build (single HTML recommended / React / you decide). Answers: outfits, showcase, single HTML file. | — |
| 20:17 | Read-only GLB inspection (PowerShell BinaryReader parsed the GLB header + JSON chunk): 1 mesh, 1 material, 3 textures, no animation, generated by Tripo → one outfit per file. | — |
| 20:18–20:21 | Built `index.html`: Three.js via CDN, GLTFLoader, OrbitControls, auto-centre/fit, contact shadow, 3-point light + PBR environment, category switcher (Casual / Cultural), `CATEGORIES` config block at the top of the script, loading progress, triangle-count chip. Second slot probes for `…2.glb` with a HEAD-style check and shows "Coming soon" if missing (so dropping in the file needs no code change). Served via `py -m http.server 8123`. Verified 1.9M triangles, no errors. | — |
| 20:22 | You: "no shadows/light and only options for white and greenscreen backgrounds" → removed lights and shadow catcher, added White `#ffffff` / Green `#00b140` chroma-key switcher. | — |
| 20:30 | You: "I don't like how it looks… it looks better on Tripo with their dark bg, check screenshot". Claude studied `Screenshot tripo.png`, restored soft studio lighting with no cast shadows, made a dark charcoal radial gradient the default, kept White/Green, tightened framing, fixed a button collision at narrow width. | — |
| 20:49 | "Why is it shining? Try the other asset." → metalness 0, high roughness, env intensity 0.35. Found `…2.glb` has a different hash but is the same casual outfit. | — |
| 20:53 | Remove White/Green options (locked to dark). | — |
| 21:06 | "Still too shiny" → swapped PBR material for a purely diffuse Lambert material (no specular at all); noted any remaining highlight is baked into the Tripo texture. | — |
| 21:25 | Delete the Cultural option; switcher auto-hides when only one category. | — |
| 21:29–21:46 | Repo push. First token belonged to `<CLI_GH_ACCOUNT>` while the URL was under `<OWNER_GH_ACCOUNT>`, and the repo did not exist ("Repository not found"). Question: which account + public/private → keep owner account, Private (recommended, because it is a 3D likeness of a real person). You created the empty repo and pasted an owner-account token. Push of about 108 MB succeeded with GitHub's non-blocking >50 MB warnings. Added `README.md` and `.gitignore` (excludes `.claude/` and the Tripo screenshot). | `1b35f15` Add … 3D portrait viewer |
| 22:10–22:16 | "Add the secret egg", pointing at `DEV-CREDIT-EASTER-EGG.md` in another agency project. Claude started exploring that other project; you interrupted: add it to *this* site, the other one was only the example. Egg added in 4 parts (brand tokens, CSS, HTML, JS), themed to this site's gold `#e8c07d` + Inter, ◵ bottom-left. Verified hover, click open, click-outside/close/Esc close, a11y. | — |
| 22:18–22:22 | "Make environment settings like Tripo" → Claude began building an HDRI picker (tested CORS on Poly Haven). You interrupted: "what I am trying to say is to make it look brighter". Exposure `1.15 → 1.5 → 1.8`, stronger key/fill. | — |
| 22:22 | "push it to the repo" → pushed `be10f21`. | `be10f21` |
| 22:25–22:30 | Vercel blocked the deploy. First Claude misread it as needing a Vercel token (suggested `npx vercel deploy --prod --token <VERCEL_TOKEN> --yes`). You clarified with a screenshot: "commit author did not have contributing access… Hobby Plan does not support collaboration for private repositories". Cause: the commit author was `<PERSONAL_GIT_IDENTITY>` (global git default), not the Vercel-linked account. Question: which account is Vercel linked to → `<OWNER_GH_ACCOUNT>`. Claude looked up that account's numeric ID via the GitHub API, re-authored the commit with the `ID+username@users.noreply.github.com` address, set the repo-local git identity, `--force-with-lease` failed on a stale tracking ref, fetched, then force-pushed `be10f21...34e0ea4`. | `34e0ea4` Add DeepLearnHQ easter egg and brighten lighting |
| 22:41–22:47 | Removed the triangle-count chip and the word "Study" (title now "… — 3D Portrait"), blackish background, then slightly brighter; "push" → pushed with the correct author. | `653ea1b` Refine UI and backdrop |

### Phase 3 — Wireframes → full greyscale clickable prototype (14 Jul → 21 Jul 2026, this part)

| Date/time (UTC) | What happened | Commit / result |
|---|---|---|
| 14 Jul 02:30 | Kickoff: attached `proposal - assemble.pdf` ("wireframes for a proposal"); "critically analyse it to find gaps… lets plan first ask any questions before we proceed". PDF was image-only (poppler missing, text extraction empty) → rendered 26 pages to PNG with pypdfium2 and read them. Found: it is a written spec (§1 overview, §2 research, §3 interfaces, §4 23-step journey, §5 mobile features, §6 admin features, §7 11 use cases, §8 out of scope, §9 milestones cut off at Milestone 1). Asked 4 questions. | — |
| 14 Jul 02:56 | Answers changed the task: side = strengthen before sending; lenses = scope + product/UX; no need for milestones/pricing; deliverable = **not a report**, a final high-fidelity **greyscale** responsive prototype built from the attached zip (`PWA wireframes_ user and admin.zip`), "too black and white… a bit greyscaled, not sketch b/w". | — |
| 14 Jul 02:56–03:00 | Unzipped: two proprietary `.dc.html` design-component files (User App 32 screens + ~19 sheets; Admin 3 auth + 11 sections + 14 modals) + handoff README + proposal PDF. **`support.js` runtime missing** → files will not render in a normal browser. Claude produced a gap list (7 product/UX, 3 scope/legal) and a plan. | — |
| 14 Jul 03:01–03:07 | Built `assemble-style-direction.html` (palette + mobile/desktop Home proof). Screenshots timed out repeatedly; eventually captured. 3 questions: tone (this / softer / more contrast), sequencing (user first / both / user only), fixes (fold in / faithful first / critical only). Answers: more contrast, both together, fold fixes in. | — |
| 14 Jul 03:13–03:26 | Built standalone vanilla-JS `Assemble - User App.html` and `Assemble - Admin.html` (prototype bar with jump-to-screen menu). Verified welcome → home, desktop rail, admin login → 2FA → dashboard, user-detail modal. | files |
| 14 Jul 03:34–03:55 | "take consent where needed… combine into a single file… ask user what he wanna see user or admin… every single thing complete… final prototype that dev will use to create frontend and backend". Built **`Assemble - Prototype.html`** with launcher, consent flows (sign-up AI photo consent, Permissions screen, biometric-consent modal before avatar photos, settings consent toggles, data download/delete), every list item drills into a detail view (e.g. full brand detail page). Verified via DOM (screenshot tool flaky). | file |
| 14 Jul 04:02–04:22 | "responsive to all screen sizes… within scope… no extra feature or stats not in proposal… no references like user app/wireframes… header appropriate". Removed prototype bar/jump menu and all meta language; launcher = "Customer app" / "Admin panel"; removed demo-only empty/error/offline screens and extra admin user-detail stats; brand statuses to proposal values (Pending/Active/Paused/Rejected); added the missing §6 **Style & category management** section; wide tables scroll inside their container; floating ⊞ back button. | — |
| 14 Jul 04:24–04:37 | Back-to-selection only via logout; added Flow charts card; fixed tagline overlapping the logo (negative margin); tagline set to "Where Everything Coordinates". Fixed a launcher clipping bug (`setMode` forced inline `display:flex`). | — |
| 14 Jul 04:38–05:00 | "← Back" on customer Welcome and admin Login; white tagline on dark pill; **real state** (wizard picks show on results, pack drives payment total, plan drives profile label); in-app share to friends + "Shared looks & responses" screen + notification deep links; flow charts redrawn as real diagrams (52 boxes, 4 decision diamonds, 33 connectors). | — |
| 14 Jul 05:01–05:05 | Push to `Assemble_Wireframes_Version_1` with PAT, author `<OWNER_GH_ACCOUNT>`. Initialised repo, added README, 10 files, token scrubbed from config. | initial commit |
| 14 Jul 05:08–05:11 | Vercel 404 NOT_FOUND: no `index.html` at root (main file name has spaces). Added `index.html` meta-refresh + `location.replace` redirect to `Assemble%20-%20Prototype.html`. | `1141aa3` |
| 14 Jul 06:13–07:03 | 17-point batch (remove launcher icons, remove Apple login, no coloured icons, perfect logic, mobile responsiveness, extremely detailed flowcharts, ads visible in customer app, complete admin flows, remove micro-stats, editable onboarding/avatar/measurements, pronouns, closet-only logic, icons only for navigation, fixed bottom nav, "made by www.DeepLearnHQ.tech for the client" credit line, multiple shared looks, final logic) "do these and push… then we will critically analyse". | `8c82175` |
| 14 Jul 18:47–18:50 | "ready" → proposal audit: A (11 in-proposal gaps), B (minor), C (intentional divergences), D (extras from your requests). | — |
| 14 Jul 18:55–19:22 | "add A.1–A.11 + payment history, product availability, event reminder + renewal notifications… make every button or card clickable… create all sub screens". | `6f392ff` |
| 14 Jul 19:32–19:40 | Body type "A B C D E" placeholder → unisex Slim/Athletic/Average/Curvy/Broad + helper line. | `b7fce4e` |
| 14 Jul 20:05 | "u forgot to change it in onboarding" → Claude walked the real sign-up path and proved it was changed; cause = stale Vercel deploy / browser cache. | — |
| 14 Jul 20:17–20:40 | "where do I see outfits friends send me? How do I add friends? … analyse carefully for such gaps and create a list of actions". Claude found the social loop was one-directional + 5 other gaps; grouped into Groups 1–3; you: "lets do all 3 groups". Friends system, Shared-with-me inbox, social hub, incoming notifications, manage/cancel subscription, my support tickets, free-generations model, Home goals, live search; flow charts 8 sections / 132 boxes. | `1899cad` |
| 14 Jul 20:53–21:05 | "how else can we verify it is complete?" → 5 methods. Ran structural audit (56 screens, 52 modals, 0 broken links, 0 orphans, 0 dead controls) and click-crawl (1,167 controls, 0 errors). | none (read-only) |
| 14 Jul 21:11–21:21 | Traceability matrix built as `Assemble - Coverage.html` via a Python generator: 230 items, 200 built / 9 partial / 21 out-of-scope. | `b1a5aa9` |
| 14 Jul 21:33–21:50 | Batch: remove phone number + phone verification; style chips + Luxury/Simple/Bold/Travel; sizes + dress/jacket/accessories; closet full 11 categories; packing list for travel (uses a credit); Compare rebuilt; "Suggest a change" button removed (use comments); Add friend = username/email only; **back-loop bug** fixed (history dedupe); active tab bolder. Audit 58/51, crawl 1,212 controls, coverage 206/4/20 "98%". | `644b8ba` |
| 14 Jul 21:55–22:08 | "when tabs are clicked nothing changes in the container… and what does coverage 98% mean?" The conversation hit its context limit here and was **compacted** (auto summary at 22:03). After resuming: closet category chips filter grid (combined with search), saved-collection chips filter, admin ticket status filters, Compare dropdowns rebuild table/costs/buttons live. Explained 98% = (built+partial) ÷ in-scope, out-of-scope excluded. | `c80abac` |
| 14 Jul 22:32–22:39 | "critically think of use cases for a person using this app for months… keep within scope". 6-month journey table; 3 in-scope gaps (wear log, delete collection, payment-failed state) + 3 out-of-scope ideas. You picked all three in-scope ones. | `a8c08cc` |
| 14 Jul 22:46–22:52 | Polish pass + bugs + "features serve their purpose": 375px overflow sweep, pinned nav check (68px tap targets), 24 actions handled, state-mutation tests (upgrade removes ads), fixed "2 of 3 free generations" on a fresh account → start at 3/3. Crawl 518 controls across 61 screens. | `c3a32dd` |
| 14 Jul 22:55–22:59 | "are all these checks for admin as well?" → Claude admitted the deep state tests had been customer-heavy, ran admin ones (login→2FA→dashboard, remove brand, CSV toast, mobile drawer = `data-open="menu"` modal). No bugs. | none |
| 14 Jul 23:05–23:09 | Live deploy check against `https://assemble-wireframes-version-1.vercel.app/` (12 code markers present, root redirect OK); built `Assemble - Walkthrough.html` (7 scenes + admin + reference map + talking points). | `f6fa7cb` |
| 15 Jul 02:10–02:31 | "don't give percentage… delete the 2%" → Claude removed %, progress bar and partial items but wrongly deleted one real row; you corrected: keep it, mark items to be finished in design as such → new **Design phase** status: 209 built / 1 design phase / 20 out of scope. | `7128c22`, `49626e6` |
| 15 Jul 03:33–03:43 | "suggestions to increase user friendliness in every screen size?" → measured audit at 375/768/1440, 11 suggestions in 3 bundles; you chose quick wins (#1–5) + responsive layout (#6–8): inputs 16px on touch, 44px chips, focus-visible ring, safe-area inset, chip scroll-snap + edge fade, tablet 620–899px capped ~720px, desktop ≥1200px 960px wide (closet 7 columns), meta text 12px. | `029ffe5` |
| 15 Jul 06:06–06:41 | "perfect the user experience… analysis for both apps… discuss before implementing" → UX analysis → 2 questions (areas: all; depth: IA & interaction only) → change list A–I → you: "A–H + check admin is coherent with user app". Generate-now shortcut, Home social card, first-run Get-started checklist, "More ways to start" grouping, History from Profile, admin sidebar grouped Operations/Catalog/Growth/System, descriptive global search; coherence audit fixed admin occasions/style tags/weather to match the user app. | `5c2f6d9` |
| 15 Jul 06:41–06:44 | Admin login/OTP stuck left and not responsive → auth panel was a flex child with no grow → `flex:1 1 100%`; OTP input 16px + `inputmode="numeric"`. | `14afcc6` |
| 15 Jul 06:47–06:53 | "what tests can we do to see if this is complete?" → 8 tests listed → "yes" → consolidated acceptance sweep: 39/39 pass (20 code-level, crawl 526 controls, 8 flow tests, responsive at 3 widths, deploy parity 8 markers). | none |
| 15 Jul 06:56–07:23 | Placeholder images: inventory of 61 grey `.ph` boxes (0 `<img>`), a paste-ready image-generation prompt for a 5×4 greyscale icon grid, branch `demo-placeholders` created and pushed first. You generated and saved the grid (it landed as `placeholder-grid.png.png`). Sliced with Pillow into 20 transparent frameless icons, wired context-aware by a runtime script (58/61 boxes + 6 avatars). | `02effad`, `739f1ab` |
| 15 Jul 07:24 | Preview URL behind Vercel Authentication (Claude could not open it). | — |
| 15 Jul 07:33–07:37 | "I like it, lets merge to main" + admin must not edit/add subscription plans (hardcoded) + explain ads/featured/brands/sponsorship/campaigns. Merged; plan Edit → "Fixed" label; credit packs still editable; 4-lever monetisation explanation with admin→user mapping table. | `ae4d4b6` |
| 17 Jul 18:50–18:52 | Remove affiliate revenue from admin (a click is not a purchase; can't be tracked). Kept click counts, commission rate, honest "may earn a commission" disclosure. | `1203ee5` |
| 21 Jul 01:33 | Remove Flow charts from the selection page (screens left in file, unreachable). | `f2ab49d` |
| 21 Jul 01:37–01:41 | "make a script… separate standalone html… explain every feature step by step for both apps… dont miss any screen!" → Python generator cross-checked against the prototype's `data-screen` set: 0 missing; `Assemble - Presenter Script.html` (62 entries, 17 sections, filter box, print/PDF button). | `8c8a6bf` |
| 21 Jul 01:46–01:52 | Asked for annotated screenshots of each screen + admin mobile hamburger as a side panel. Side panel done (slide-in left drawer). Screenshot pipeline proven: `puppeteer-core` driving headless **Edge** (no Chrome on the machine, Node v22). Annotated screenshots **never built** (parked with 2 open questions). | `1bf25f6` |
| 21 Jul 01:53 | You interrupted to ask what Products & affiliates / Brand partners / Ads & featured are → explanation with an ASCII money diagram. | — |
| 21 Jul 02:09–02:48 | Big client-revision batch, re-sent 3 times (interrupted twice while you added items), prefixed with "Give suggestion to me to choose from for decisions and ask me any questions before writing code, we need to collaborate". Claude echoed 18 captured items, stated proposals for design bits, asked 4 questions (product form Full/Moderate/specify; prefs editor location; existing packages read-only/editable; shop Save/Hide). Answers: Full, in Style & categories, read-only, remove both. | — |
| 21 Jul 02:48–03:02 | Branch `client-revisions-1`; 3 scripts (user app, admin deletions, rebuilds); over-deleted `deleteAvatar` modal caught by the audit and restored; 22-row "task completed list with purpose". | `7d65006` |
| 21 Jul 03:49–04:08 | Batch 2 (12 user + 6 admin items, "Do these changes in the new branch, we are not merging yet"). 4 questions (packing history location, item-detail scope, clicks/commission removal scope, catalog order). Fixed 2 back-loops (hardcoded `data-nav` back buttons + `genLoading` pushed into history); dynamic item detail; packing history + name-on-save; payment modal without Apple/Google Pay; 10 usage rows; removed desktop rail Shop; Shop ad banner; admin clicks/commission removed everywhere; dashboard tiles; campaign New vs Edit; Title Case sidebar with "and". | `c6a135d` |
| 21 Jul 05:00–05:08 | "Major bug: admin panel shows a blank screen" + 3 items. Claude reproduced locally, saw nothing wrong, **blamed cache** (and did find the in-app browser serving stale HTML); added no-cache meta tags; Delete list on saved packing list; Manage cards. | `52ae4c2` |
| 21 Jul 05:12–05:19 | "blank even after hard refresh" → real bug: during login the empty `.app` box still filled the viewport and pushed `#aAuth` below the fold. Fix: hide `.app` during auth, `overflow:auto`. Also completed Add-a-card form. Claude apologised for the misdiagnosis and logged the lesson (check elements are in the viewport, not just present). | `c732e69` |
| 21 Jul 05:25–05:33 | Admin content stuck at bottom + not scrollable on most screens → a stray `</div>` after the dashboard section (left by the regex removal of the chart two batches earlier) closed `.main` early; 12 of 13 screens were outside the scroll container. Removed it; brand form logo upload. Lesson: balance-check div structure after regex block removal. | `1888eae` |

Later commits in the Wireframes repo (outside this scope, from the git log): `6920d4e` fix admin blank on login after layout fix, campaign simplifications, Terms/Privacy screens, 3-starter-credits model, Pro annual, 3D Avatar feature branch `feature-3d-avatar`, `049fcb4` Add PROJECT-HANDOFF.md. Branches present locally: `main`, `ui-version-1`, `feature-3d-avatar`.

---

## 2. Decisions and why

### Product / scope
- **Prototype is the source of truth for developers, not a report.** You rejected a written critique: "help me create the final version that I can present to client… a final prototype that dev will use to create frontend and backend so everything needs to be complete." Why: a clickable, complete prototype removes ambiguity for both the client sign-off and the build team.
- **Strict proposal scope, both directions.** "no extra feature or info or stats… not mentioned in proposal, but if it's necessary keep it, and add any missing screens". Claude removed its own additions (demo empty/error/offline screens, extra admin user-detail stats, "Promoted" brand status) and added the missing proposal section (Style & category management). Why: the client pays for the proposal; extras confuse developers and invite scope creep.
- **Remove means delete from code.** "when I say remove I mean delete from code so it doesn't confuse the dev." Why: dead markup in a handoff prototype gets built by mistake.
- **Don't show metrics you can't track.** Removed affiliate revenue ("people might click buy, not buy"), then clicks and commission everywhere, dashboard vanity tiles (outfits generated, MRR, AI cost, ad impressions, system health), "Needs attention" list, D30 retention label, notifications about untracked events (new matches, outfit reminders, renewal, announcements), activity log, session timeout. Why: the prototype becomes the backend spec; every number shown implies a tracking requirement.
- **Subscription plans and credit packs are hardcoded** → admin can't add/edit plans ("Fixed" label, later column removed) or packages (read-only, "Add package" deleted, `packForm` deleted). Why: pricing lives in code/payment provider, not an admin form.
- **No Apple login; later no Apple Pay / Google Pay in the payment modal; no phone number / phone verification.** Why: simplify auth and payments for MVP.
- **Unisex body types** Slim / Athletic / Average / Curvy / Broad with helper "Pick the silhouette closest to you — used only to preview outfits" (instead of placeholder A–E, and instead of gendered shapes like pear/hourglass). Why: less gendered and self-explanatory.
- **Pronouns** asked in onboarding and editable later; all onboarding answers become editable "Style profile and preferences". Why: everything asked once must be changeable (a long-term user's profile).
- **Consent wherever sensitive data is captured**: separate AI-photo-analysis consent at sign-up, a Permissions screen, a biometric-consent modal before avatar selfies (face/body/skin tone may be biometric data), private-photos note on add-item. Why: face/body/skin-tone data can count as biometric/special-category data (BIPA/GDPR).
- **Social loop must be two-directional**: friends list + add by username/email + requests + remove/block + Shared-with-me inbox + Shared-by-me responses + notifications. Invite links and contacts import were later removed; "Suggest a change" became a normal comment. Why: the proposal says "share with a friend inside the app" — only outgoing sharing was built at first.
- **Long-term-user test** added wear log ("Wear today" + Outfit History), delete collection, payment-failed state (banner + notification + update-card modal). Out-of-scope ideas (closet sort/bulk, taste-learning profile, mark-all-read) were deliberately *not* built, just noted.
- **Coverage page wording**: no percentages; statuses Built / Design phase / Out of scope. Why: a % below 100 reads as "incomplete" to a client; unbuilt visual affordances (zoom/rotate) are honestly labelled as design-phase work, not deleted.
- **Monetisation model** (as explained to you): brand partners → products → affiliate links (always-on baseline); display ads only for free users, gone when subscribed; paid campaigns (featured product badge / promoted brand). Later: results interstitial ad removed; placements reframed as promoted brand on Home and promoted product on Shop; campaign form takes its visual from the selected brand's logo or product's image (no separate upload); only the FEATURED tag kept (SPONSORED removed); ads get a red border (the only colour in the greyscale prototype) to flag ad zones.
- **Admin coherence rule**: admin taxonomy/prices/IDs must match what the customer app actually uses (occasions, style tags, weather "Mild", plans, pack prices, ticket IDs). Why: a mismatch becomes a data-model bug later.
- **Flow charts** first as a launcher view (real diagrams with decision diamonds), later removed from the selection page (kept as code at the time). Why: useful handoff artefact, but not part of the product the client sees.
- **Placeholder imagery**: greyscale icons generated from one image-model grid, mapped by context, tested on a branch before merge. Why: empty grey boxes looked awkward in demos.

### Design
- **Greyscale "tonal" system instead of stark black/white**: soft off-white canvas, white cards with subtle shadows, ink `#161619` (from `#1c1c1e`), a missing mid-grey added; then "a bit more contrast" for projector/screen share legibility. Brand colour to be applied later on the same tokens.
- **Icons only for navigation**, all monochrome; no emoji; favourite toggle became a black-and-white ★ star.
- **Responsive rules**: customer app tab bar ↔ side rail at 900px; admin sidebar ↔ hamburger at 880px (later a slide-in left side panel instead of a pop-up); wide tables scroll inside their own container; pinned bottom nav; touch sizing only ≤900px; tablet capped ~720px; desktop 960px.
- **Coming-soon page**: after lots of colour experiments you landed on the logo handoff palette, dark mode only, enlarged mark as the hero, text block reduced 10% on desktop, restraint for "premium" ("Nothing flashy!").
- **Reduced-motion**: keep the brand-defining motion (logo ring spin, marquee), calm only ambient drift. Why: the client's device had reduce-motion on and saw a frozen page.
- **3D viewer**: match the look of the tool that made the model (Tripo's dark studio) rather than inventing one; matte Lambert material (no shine); brighter exposure; single category.

### Architecture / technical
- **Single self-contained HTML files, no build step, no framework** for coming-soon, 3D viewer and prototype. Why: opens by double-click, easy to share and host on Vercel as a static site. The 3D viewer uses Three.js from a CDN; the aurora experiment that would add a second file + CDN was rejected.
- **Prototype architecture**: two IIFE controllers `U` (customer) and `A` (admin), each with `st` state, `go()`, `back()`, `render()`, one delegated `click()`, `act()` switch; screens `<section class="screen" data-screen="X">`, modals `<div class="modal" data-modal="X">`; behaviour only through data attributes (`data-nav`, `data-open`, `data-close`, `data-act`, `data-toast`, `data-chip`, `data-rg`/`data-rv`, `data-back`, `data-home`, `data-enter`, later `data-lock`). Why: makes automated audits possible (every link is a parseable attribute) and makes it easy for devs to read.
- **Back navigation must use history, never hardcoded `data-nav` targets; loading screens never enter history; navigating forward to the screen on top of history pops instead of pushes** (history capped at 25). Why: three separate back-loop bugs.
- **Vercel static deploy needs an `index.html` at the root**; used a redirect page rather than renaming the prototype.
- **No-cache meta tags** on the prototype so reviewers don't see stale builds.
- **Branch for big or risky changes, preview on Vercel, merge after your verification** (`demo-placeholders`, `client-revisions-1`). Why: production URL shown to the client stays safe.
- **Commit authorship matters for Vercel Hobby + private repos**: the commit author must be the Vercel-linked GitHub account; set the repo-local git identity to that account's noreply address.
- **Clean, squashed commits for the client-visible coming-soon repo**, author DeepLearnHQ-Dev, no README ("the commit has to be clean and it must say that it's from deeplearnhq dev team").
- **Private repo for the 3D likeness**; `.glb` files (~54 MB each) committed despite GitHub's 50 MB warning; Draco compression recommended but never done.
- **Favicon from your exact exported artwork**, resized with Pillow, not re-drawn. Why: brand fidelity; hand-transcribed base64 is unreliable.

### Process
- **Ask questions before building**, with recommended options (every phase started with a multiple-choice round).
- **Discuss before implementing** big UX batches; Claude echoes back "everything I captured" so nothing is missed.
- **End each batch with a "task completed list with purpose"** table so you can verify item by item.
- **Show locally first / don't push until I verify** for taste-driven changes.
- **Verification must be evidence, not assertion** (structural audit, click crawl, state-mutation tests, responsive sweep, coherence check, traceability matrix, deploy parity).

---

## 3. Reusable user prompts

Each: original (lightly cleaned; secrets masked; client name → "the client"), date, what it achieved, template.

### Kickoffs

1. **Deploy an exported design** — 9 Jul 2026 23:15
   > "@"C:\Users\...\Downloads\Assemble Coming Soon.html" i want to push and commit this in a repo so it can be deployed i will use repo: https://github.com/<OWNER_GH_ACCOUNT>/assemble-coming-soon-page that is connected to vercel. it public repo, when u push the author should be DeepLearnHQ-Dev"
   - Achieved: repo at root with `index.html`, correct author, Vercel auto-deploy.
   - Template: `@"[path to exported HTML]" Push and commit this to [repo URL], which is connected to Vercel ([public/private]). Commit author must be [AGENCY_AUTHOR]. Rename to index.html at the root so Vercel serves it.`

2. **Rebrand from a logo handoff** — 22 Jul 2026 03:41
   > "@"...\Logo slide design (1).zip" This is the new logo and selected colours and logo. I want the comingsoon website to be made using this and revamp it. create both light and dark mode"
   - Achieved: exact brand tokens/fonts extracted from the handoff; whole page rebuilt around the animated mark.
   - Template: `@"[brand handoff zip]" This is the new logo, colours and fonts. Rebuild [page] using exactly these tokens and geometry. Create [light/dark/both] mode. Verify on desktop, mobile and a short landscape viewport before committing.`

3. **Product-designer kickoff for a 3D showcase** — 25 Jul 2026 20:11
   > "i want to make a website/web app in which i want to present 2 3d model categories. I have one asset added, how can we make this. be a product designer."
   - Achieved: 3 scoping questions, read-only asset inspection, a single-file Three.js viewer with a config block.
   - Template: `I want a [website/web app] that presents [N] [thing] categories. I have [assets] in this folder. Be a product designer: inspect the assets read-only first, ask me the questions that change what you build, then propose and build.`

4. **Proposal critique that turned into the prototype** — 14 Jul 2026 02:30
   > "@"...\proposal - assemble.pdf" so these are wireframes for a proposal attached, I want you to critically analyse it to find any gaps or issue this might have. lets plan first ask any questions before we proceed? App name is assemble."
   - Achieved: full read of an image-only PDF, 4-question scoping round, which redirected the whole task.
   - Template: `@"[proposal.pdf]" Critically analyse this [proposal/spec] for gaps and issues. App name is [APP]. Let's plan first — ask me any questions before we proceed.`

5. **The answer that defined the deliverable** — 14 Jul 2026 02:56 (typed into the question round's free-text fields)
   > "not a report but help me create the final version that i can complete present to client, it called wireframes but its high fidelity but grey scale prototype, responsive to all screen size. see the zip folder attached. it's too black and white and i want it to be a bit greyscaled not sketch b/w color." / "you dont need the milestones or timeline or pricing, just the requirements to understand what the PWA is"
   - Template: `Not a report — build the final [greyscale high-fidelity prototype] I can present to the client, responsive to all screen sizes, from [attached export]. Use the proposal only for requirements, not pricing/timeline. Visual: [tone notes].`

### Completeness / scope demands

6. **Single file + consent + everything complete** — 14 Jul 03:34
   > "take consent where needed and also see if this is complete also combine this into a single file so that it asks user what he wanna see user or admin and whichever is clicked is shown, with options to go back to selection screen. Also it has to look final so for example if i click on brand and affiliate partner it doesn't show details but just add and remove so i want every single thing like this to be complete, think of this as a final prototype that dev will use to create frontend and backend so everything needs to be complete."
   - Achieved: launcher, consent flows, every list item drills into a detail page.
   - Template: `Combine [apps] into one file with a launcher to choose [A/B], and a way back. Take consent wherever sensitive data is captured. Treat this as the final prototype devs will build frontend and backend from: every list item must open a real detail view, every button must work. Example of what's not acceptable: [example].`

7. **Scope discipline + no meta language** — 14 Jul 04:02
   > "make sure everything should be responsive to all screen sizes and see if now its complete and within the scope defined in proposal, no extra feature or info or stats etc that is not mentioned in proposal, but if its necessary keep it and add any missing screens if any, also i dont want this to have references like user app, wireframes, etc. viewer should only see what the end user can see on app or admin. so the header should be appropriate."
   - Template: `Check against [proposal]: nothing extra (features, info, stats) unless necessary, nothing missing (add missing screens). Remove all prototype/wireframe language — viewers only see what real end users would see. Responsive at every size.`

8. **Logic + missing loop + real flowcharts** — 14 Jul 04:38
   > "...i notice that this app doesn't remember context for example if i choose a preference it doesn't remember the preference and just shows the same screen, i want it to have logic. Also for instance it has no screen that shows what i got as a response on the shared items, and also sharing is not via message and also complete the flow for when user shares it with in-app friends and clicks on notification. please analyse it thoroughly and fix all these missing all over the project and the flow charts should be like actual flow charts rather than just text - like an actual flow chart for process."
   - Template: `The prototype must remember state: choices on one screen must drive later screens. Find every place this is missing and fix it. Also complete the [feature] loop end to end, including [notification → destination]. Draw flow charts as real diagrams with decision points, not text lists.`

9. **Numbered mega-batch then audit** — 14 Jul 06:13 (17 items, abbreviated)
   > "Make the following changes: 1. …remove icons on each tile. 2. remove login with apple option from all over the project. 3. I dont want any colored icons… 4. perfect the logic. 5. improve the mobile responsiveness on all screens… 6. the flowchart seems arbitrary and unimportant, it has to be extremely detailed. 7. ad placements cant be seen on customer app. 8. complete flows on admin panel, like every button should be clickable and complete. 9. remove the small stats like 1.4% inc this week… not mentioned in proposal explicitly. 10. …every onboarding question could be edited later… 11. …pronouns… 12. …missing item flow is used even when user chooses to keep selection inside closet, fix that logic and any other such logical gaps… 13. use icons only when necessary… 14. the bottom nav on mobile is not fixed and scrolls… 15. …add… 'made by www.DeepLearnHQ.tech for [the client]'… 16. …see all multiple shared looks… 17. make all logic appropriate so this is final and ready. do these and push. then we will critically analyse and verify that the work is done according to the proposal and that we don't have anything extra or less. and if there is any screen / detail page / pop-up that needs to be added you should find it and we can discuss before adding."
   - Template: `Make the following changes: 1. … N. … Do these and push. Then critically analyse against [proposal] for anything extra or missing (screens, detail pages, pop-ups) and bring me a list to discuss BEFORE adding.`

10. **Gap hunt beyond the proposal** — 14 Jul 20:17
    > "Although not explicitly mentioned in the proposal I feel like these are missing: where do I see the outfits my friends are sending in app? How do I add these friends? what do u think? do we have any other such gaps? lets analyse carefully and thoroughly for such gaps and create a list of actions needed to be taken ok?"
    - Template: `Not explicitly in the proposal, but these feel missing: [questions a real user would ask]. What do you think? Analyse carefully for other gaps like this and give me a grouped action list (recommended vs optional) before building.`

11. **Long-term user stress test** — 14 Jul 22:32
    > "critically think of use cases for a person using this app for months and what he can do and stuff and check if the app allows, keep within scope of the app?"
    - Achieved: a week-1 → month-6 journey table, 3 in-scope gaps closed, 3 out-of-scope ideas parked.
    - Template: `Critically think through a person using this app for [months]: what would they do week by week? Check the app allows each step. Keep within scope; split findings into in-scope gaps and out-of-scope ideas.`

12. **Coherence check** — 15 Jul 06:30
    > "lets do A - H. Also check if the admin panel is coherent with the user app and all features align and content too?"
    - Template: `Also check the admin panel is coherent with the customer app: every feature has its admin counterpart, and lists/prices/labels/IDs match exactly.`

### Question-round and collaboration prompts

13. **Plan first** — "lets plan first ask any questions before we proceed?" (14 Jul 02:30). Template: `Let's plan first — ask me any questions before we proceed.`

14. **Collaborate with options before code** — 21 Jul 02:43 and 03:49 (used as a batch header)
    > "Give suggestion to me to choose from for decisions and ask me any questions before writing code, we need to collaborate so i can provide you correct context."
    - Achieved: Claude echoed every captured item, stated its own proposals for fuzzy items, and asked exactly 4 multiple-choice questions with a recommended option.
    - Template: `Give me suggestions to choose from for each decision and ask me any questions before writing code — we need to collaborate so I can give you the right context.`

15. **Discuss analysis before implementing** — 15 Jul 06:06
    > "I want to perfect the user experience so it's very easy to use the application and very user friendly, can you do an analysis for both user app and admin app? lets discuss before implementing anything"
    - Template: `Do a [UX/security/performance] analysis of [both apps], grounded in the actual flows. Let's discuss before implementing anything.`

16. **Advisory list first** — 15 Jul 03:33: "do you have any suggestions as to increase the user friendliness of this prototype in every screen size?" → measured audit at 375/768/1440, graded bundles to choose from. Template: `Suggestions to improve [quality] at every screen size? Measure first, then give ranked bundles I can pick from.`

17. **Style-direction question from Claude** (pattern worth copying): "Does this greyscale direction work? This is right / Go a touch softer / A bit more contrast" + "How should I sequence the build?" + "Fold fixes in now or faithful conversion first?" (14 Jul 03:07).

### Verification demands

18. **How else can we verify** — 14 Jul 20:53
    > "how else can we verify that it now complete and according to scope and not missing any screen?"
    - Achieved: 5 verification methods; structural audit + click crawl run; traceability matrix built later.
    - Template: `How else can we verify it is complete, in scope, and not missing any screen? List the methods, strongest first, and run the scriptable ones.`

19. **Tests for completeness** — 15 Jul 06:47: "what are a few tests we can do to see if this is completed, and everything is present?" → "yes" to "run the full sweep and give a one-page pass/fail summary". Template: `What tests prove this is complete and everything is present? Then run them all as one acceptance sweep and give me a pass/fail table.`

20. **Admin too?** — 14 Jul 22:55: "are you doing all these checks for admin interface as well right?" — Made Claude admit the state tests were customer-heavy and run them for admin. Template: `Did every check cover [the second app/role] too? Show evidence per check, and run whatever didn't.`

21. **Pre-ship QA** — 14 Jul 22:46
    > "1. Polish pass — final mobile/responsive sweep at phone width and tighten any visual rough edges before it goes out. 2. fix any bugs and see if every button is clickable and has complete flow, 3. also check if features are added appropriately and not just for looks but also serve their purpose efficiently keeping within scope."
    - Template: `Pre-ship QA: (1) responsive sweep at phone width, (2) every button clickable with a complete flow, fix bugs, (3) each feature actually changes state and serves its purpose, within scope.`

22. **Live deploy check** — 14 Jul 23:05: "https://assemble-wireframes-version-1.vercel.app/ lets do #1 then #2" (#1 = verify live deploy matches latest push). Template: `[live URL] — first confirm the live deploy serves the latest commit (check markers only in recent changes), then [next deliverable].`

23. **Done list with purpose** — 21 Jul: "at the end of this run give me clear task completed list so i can verify and also write the purpose of the task." Template: `At the end, give me a clear task-completed table (change + purpose) so I can verify each item.`

### Presentation / handoff

24. **Presenter script, no screen missed** — 21 Jul 01:37
    > "now help me i want to present this screen by screen so i want you to make a script for me a separate html file standalone that helps me explain every feature in detail, step by step way for both admin panel and customer app. can we do this? i meant dont miss any screen!"
    - Achieved: a generator that cross-checks its screen list against the file's `data-screen` attributes (0 missing).
    - Template: `Make a standalone HTML presenter script that explains every screen step by step for [apps]. Generate it from the source so you can prove no screen is missed.`

25. **Annotated screenshots** (not finished) — 21 Jul 01:47: "Include the pictures of each screen on the presenter script and circle items with arrows to explain their purpose as description. be creative. and ask questions if any."

26. **Placeholder images via an image prompt + branch** — 15 Jul 06:56
    > "can you analyse the whole project for placeholder images and then give me a prompt that has a grid of all needed placeholder icons in greyscale that we can use just for demonstration, currently it looks awkward to have empty placements. once i generate this grid image with your prompt, lets make a branch for this separately and test it live. okay?"
    - Template: `Inventory every placeholder image in [project], write me one image-generation prompt for a sliceable grid of all needed [style] icons. Create a branch for this now; once I give you the image, slice it, wire each placeholder by context, push the branch and we test the preview before merging.`

### Fixes and style corrections

27. **Precise visual bug with a screenshot** — 9 Jul 23:37: "can you fix this issue so assemble is always in one line and not in two lines as shown in picture the E goes to the next line."
28. **Name the thing you don't know the name of** — 9 Jul 23:46: "the bottom of the screen there is something moving whats it called its doesnt feel smooth" → Claude named it (marquee ticker) and fixed it.
29. **Honest taste question** — 10 Jul 01:26: "does this look and feel bland, please suggest, should we change colors?" → diagnosis + 4 options with preview palettes.
30. **Restraint** — 22 Jul 05:12: "what can we do to give a more luxurious and premium look to this page. Nothing flashy!"
31. **Hold the push** — 22 Jul 04:31: "go but dont push i'll verify first"; 22 Jul 15:36: "SHOW LOCALLY FIRST."
32. **Exact asset, no reinterpretation** — 22 Jul 04:50: "no i want it to be exactly the attachment, dont make any changes."
33. **Reset intent when Claude over-builds** — 25 Jul 22:21: "what i am trying to say is to make it look brighter" (stopped an HDRI settings panel). Also 25 Jul 22:11: "add the easter egg but on this site not the [other project] one, that was just an example of how i want it".
34. **Reference the tool's own look** — 25 Jul 20:30: "i dont like how it looks, i made this from tripo, and it looks better there with their dark bg. check screenshot i added".
35. **Repeat a bug report when the diagnosis is wrong** — 21 Jul 05:12: "Major bug. when i click on admin panel from selection it shows a blank even after (hard-refreshed preview)". Pushing back forced Claude to find the real layout bug instead of blaming cache.
36. **Branch rule** — 21 Jul 02:43: "Since there are major changes i want you to use branching and after verified we will merge okay!"; 21 Jul 03:49: "Do these changes in the new branch, we are not merging yet."
37. **Remove = delete** — 21 Jul: "when i say remove i mean delete from code so it doesnt confuse the dev."
38. **Tracking honesty** — 17 Jul 18:50: "in the admin we are showing revenue made using affiliate, but we cannot track it as people might click buy not buy so we need to remove this cus of inaccurate data. can we do this?"
39. **Explain before deciding** — 15 Jul 07:33: "explain me how the ads and featured and brand and sponsorship and campaign work? do they have complete flows in admin and appropriately placed on the user app?"; 21 Jul 01:53: "can you explain what is products and affiliates, brand partners, ads, featured sections of the admin panel?"
40. **Clarify a metric** — 14 Jul 21:55: "when u mention coverage 98% what do u mean by that?" and 15 Jul 02:10: "since 2 percent is not included then dont mention it and dont give percentage to the coverage…"; correction 02:28: "dont delete the genuinely-unbuilt rows, i meant only delete the ones that are not a part of current scope and things that will be completed in design mark them like that".

### Deploy / git instructions

41. **Push with PAT + author** — 14 Jul 05:01: "push to repo: https://github.com/<OWNER_GH_ACCOUNT>/Assemble_Wireframes_Version_1 use PAT: <GITHUB_PAT> Author: <OWNER_GH_ACCOUNT>". (Better practice: do not paste tokens in chat; see Security.)
42. **Clean commit rule** — 22 Jul 04:07: "the commit has to be clean and it must say that it's from deeplearnhq dev team just like we did before okay. No readme file."
43. **Vercel deploy failure with screenshot** — 14 Jul 05:08: "can you help me as i deployed it on vercel and its not working:" (404) and 25 Jul 22:27: "no i meant use pat for github, vercel blocked reason on ss".
44. **Short confirmations** — "push", "push it to the repo", "ready", "yes", "go", "lets do it", "saved".

---

## 4. Working method

### Question rounds with recommended options
- Claude's multiple-choice tool was used at the start of every phase and before every big batch: typically 2–4 questions, 2–4 options each, one marked "(Recommended)", sometimes with a small "preview" of the result (palette values, font sizes before/after). You often answered by picking plus typing free text into an option field, which is how the whole wireframe task was redirected.
- Examples: coming-soon palette (4 options), glow colour (4), prominence levers (multi-select), premium look (3 questions), 3D build (3 questions), repo owner + visibility (2), Vercel-linked account (3), wireframe scoping (4), greyscale tone/sequencing/fixes (3), traceability matrix (3), UX focus + depth (2), friendliness bundles (multi-select), placeholder mapping (3), client revisions (4 + 4).
- When a word was ambiguous ("cerease" = increase or decrease) Claude did the unambiguous edits first, then asked only about the ambiguous one.

### Echo-back before building
For long batches Claude first listed "Everything I captured (confirm nothing's missed)", then "My proposals for the ambiguous bits (tell me if you'd change any)", then the real decisions as questions. After building: a "Task-completed list with purpose" table. This became your required format.

### Plan mode for taste-driven work
The "premium look" request went through a written plan file, 3 questions, plan approval, then implementation in 2 batches, then "not pushed — look locally".

### Batches and branches
- Coming-soon and 3D: small change → commit → push (auto-deploy) after almost every message; later "don't push, I'll verify".
- Wireframes: first on `main` with a push per batch; from 15 Jul, branches for risky work (`demo-placeholders`, `client-revisions-1`) → Vercel preview (behind Vercel login) → your review → merge.

### Editing technique for large single files
- Minified design export (coming-soon v1): target unique escape-free anchors; prefer `display:none` over cutting blocks; watch JSON-escaped markup (`<\u002F…>`, escaped quotes).
- The ~250 KB prototype: Python scripts in the scratchpad with an assert-on-count replace helper `rep(old, new, count)` so a missing or duplicate anchor fails loudly; one script per area (user app, admin deletions, rebuilds); re-read exact anchors before each script because earlier scripts shift them; run the structural audit after every script.
- Never hand-transcribe binary data (base64 images) — write real files instead.

### Verification pyramid used on the prototype
1. Structural audit (`audit.py`): screens/modals parsed, broken `data-nav`/`data-open`, orphans, dead controls, every `data-act` handled.
2. Click crawl in the browser: every control fired, console errors counted.
3. State-mutation flow tests: assert that something actually changed (plan flips, ads disappear, history grows, filter hides items, compare table rebuilds).
4. Responsive sweep: horizontal overflow per screen at 375 / 768 / 1440 for both apps; tap-target sizes; pinned nav geometry; auth centring.
5. Coherence check between admin and customer data.
6. Traceability matrix against the proposal.
7. Deploy parity: fetch the live site and grep for markers that only exist in the latest commits.
8. Manual: you on a real phone/desktop (the only check that caught the blank-admin and stuck-content bugs).

### Screenshots unreliable → DOM verification
The in-app browser's screenshot tool timed out through most of the wireframe sessions and on the heavy-blur coming-soon page. Claude switched to JavaScript inspection (active screen, classes, `getComputedStyle`, `getBoundingClientRect`, `elementFromPoint`, Web Animations API `playState`) and console reads. Lesson learned the hard way: check elements are actually **inside the viewport**, not only present; `getBoundingClientRect` on 3D-transformed elements is unreliable.

### Local preview
`py -m http.server <port>` (8123 for 3D; 8817 for coming-soon; others for the prototype), `file://` blocked in the preview pane, cache-buster query `?v=…` because the in-app browser caches aggressively. Server stopped after each verification.

### Handling interruptions
You interrupted frequently (while Claude read the wrong file, over-built, or when you wanted to add more items). Claude restarted from the newest message; batch requests were re-sent in full with additions. When a request was superseded seconds later ("delete dark" → "delete light, keep dark") Claude followed the latest one.

### Context compaction
On 14 Jul at 22:03 the wireframe conversation ran out of context and was continued from an automatic summary (the summary lists intent, architecture, file paths, all user messages, pending tasks, and the exact next step). It resumed without re-asking. The summary itself is a good template for a hand-written handoff note (later formalised as `PROJECT-HANDOFF.md` in the repo, outside this scope).

### Memory
Claude saved project notes to its auto-memory at milestones (brand tokens on 22 Jul; 3D project context and repo on 25 Jul; prototype deliverables, live URL, repo on 14 Jul; "Deep Learn HQ is the agency" note).

### Admitting mistakes
Claude explicitly corrected itself three times in this scope: wrongly deleting a coverage row; blaming cache for the blank admin; and the stray `</div>` from its own regex. Each time it named the lesson.

### Presentation artefacts as part of the method
Prototype + Coverage matrix (proof of scope) + Walkthrough (5-minute story) + Presenter Script (every screen) — all on the same Vercel site.

---

## 5. Services and access

### GitHub
- **Repos** (all created by you on `<OWNER_GH_ACCOUNT>`):
  - `assemble-coming-soon-page` — public, empty at start, connected to Vercel by you before the chat.
  - `<client>-3D-Model` — private; you created it empty at Claude's request (no README/.gitignore/licence so the first push lands cleanly).
  - `Assemble_Wireframes_Version_1` — initialised locally by Claude and pushed.
- **Local CLI auth**: `gh` keyring was logged into `<CLI_GH_ACCOUNT>`, which had no write access (403) and no pending invite; adding it as a collaborator never went through. Claude checked the invitations queue via the API and offered to auto-accept.
- **Tokens given to Claude**: classic PATs with `repo` scope pasted in chat — 9 Jul (coming-soon; later revoked, push failed on 22 Jul), 22 Jul (coming-soon), 25 Jul two tokens (first belonged to the CLI account, second to the owner account), 14 Jul (wireframes; still valid on 21 Jul — Claude reminded you at the end of almost every reply to revoke it).
- **Where stored**: nowhere. Used only inline in the push URL for one command; `origin` kept as the clean `https://github.com/...` URL; `.git/config` checked afterwards; command output piped through a redaction `sed` for `ghp_` strings.
- **Verification of a token**: API call to `/user` to see which account it authenticates as and the `X-OAuth-Scopes` header, plus a repo lookup (404 means repo missing or no access).
- **What broke**: token revoked between sessions → "Invalid username or token. Password authentication is not supported"; token for the wrong account → "Repository not found"; `--force-with-lease` rejected because pushes via inline URL never update the local `origin/main` tracking ref ("ahead 16" artefact).
- **Commit identities**: coming-soon uses `DeepLearnHQ-Dev <DeepLearnHQ-Dev@users.noreply.github.com>` (a placeholder noreply address, so commits don't link to a real profile); 3D and wireframes use the owner account's `ID+username@users.noreply.github.com` (ID looked up via the API) set as the repo-local identity.

### Vercel
- **Projects**: connected by you through the Vercel dashboard to each GitHub repo (git integration, auto-deploy on push to `main`, preview deployments for branches). Framework "Other", no build command (static HTML).
- **Live URLs**: `assemble-coming-soon-page.vercel.app`; `https://assemble-wireframes-version-1.vercel.app/` (+ `/Assemble%20-%20Coverage.html`, `/Assemble%20-%20Walkthrough.html`, `/Assemble%20-%20Presenter%20Script.html`); the 3D site URL is not given in the chat.
- **Plan**: Hobby. Consequence: a deploy from a **private** repo is blocked unless the commit author is the Vercel account owner ("The deployment was blocked because the commit author did not have contributing access to the project on Vercel. The Hobby Plan does not support collaboration for private repositories.").
- **Preview protection**: branch preview URLs are behind Vercel Authentication by default; Claude could not open them; option = turn off Vercel Authentication for previews in Project → Settings → Deployment Protection, or merge to production.
- **No Vercel token was given in this scope.** Claude suggested `npx vercel deploy --prod --token <VERCEL_TOKEN> --yes` once, based on a misread; not used.
- **Verification**: fetch the live URL and grep for markers from the latest commit; check that the root redirect returns the app, not 404; ask you to check "Deployments → latest commit Ready".

### Tripo AI (3D generation)
- Used by you outside Claude to generate the avatar `.glb` files (~56 MB, ~1.9M triangles, 1 mesh, 3 textures). No API or key in this scope. Claude matched Tripo's viewer look from your screenshot.

### Image generation (placeholder icons)
- You ran Claude's grid prompt in an external image tool (the prompt was written to work in DALL·E / Midjourney / Ideogram / Firefly) and saved the 2304×1856 PNG to `Wireframes/Version 1/assets/`. No key involved.

### CDNs
- Three.js (r160 for the 3D viewer per README; r128 for the rejected aurora) and fonts (Google Fonts: Plus Jakarta Sans, Space Grotesk, Inter) loaded from public CDNs.
- Poly Haven HDRIs: CORS tested (HTTP 206) but never used.

### Local tools found on the machine
Python 3.13 via `py` (the `python` WindowsApps stub was blocked; full path used in scripts), Pillow, pdfplumber (no text in image PDF), pypdfium2, Node v22, npx, git, gh, Microsoft Edge (Chromium; no Chrome), `puppeteer-core` installed in the scratchpad.

---

## 6. Commands and CLI

(Reconstructed from what the assistant reported; secrets masked. Quoted ones are marked.)

### Git — first push of an exported page
```bash
git init -b main
git add index.html .gitignore
git -c user.name="DeepLearnHQ-Dev" -c user.email="DeepLearnHQ-Dev@users.noreply.github.com" commit -m "Add Assemble coming soon page"
git remote add origin https://github.com/<OWNER_GH_ACCOUNT>/assemble-coming-soon-page.git
# push with a token only inline, never saved:
git push https://x-access-token:<GITHUB_PAT>@github.com/<OWNER_GH_ACCOUNT>/assemble-coming-soon-page.git main 2>&1 | sed -E 's/ghp_[A-Za-z0-9]+/ghp_***REDACTED***/g'
git fetch origin && git branch -u origin/main   # re-link tracking after an inline-URL push
git config --get remote.origin.url              # verify no token stored
```
- `x-access-token:<token>@` form was needed after a plain `<token>@` URL triggered a credential prompt; `GIT_TERMINAL_PROMPT=0` used to stop interactive prompts.
- Redaction pattern quoted in the compaction summary: `sed 's/ghp_[A-Za-z0-9]+/ghp_***REDACTED***/g'`.

### Git — checking why a push is denied
```bash
gh auth status
gh api user                                   # which account the CLI/token is
gh api user/repository_invitations            # pending collaborator invites
gh api -X PATCH user/repository_invitations/<id>   # accept an invite (offered, not needed)
curl -s -H "Authorization: token <GITHUB_PAT>" https://api.github.com/user -I | grep -i x-oauth-scopes
curl -s -H "Authorization: token <GITHUB_PAT>" https://api.github.com/repos/<OWNER_GH_ACCOUNT>/<repo>   # 404 = missing/no access
```

### Git — clean single commit (squash local unpushed work)
```bash
git reset --soft c0b28d9          # last deployed commit
git -c user.name="DeepLearnHQ-Dev" -c user.email="DeepLearnHQ-Dev@users.noreply.github.com" commit -m "Revamp coming-soon page with new Double Take logo (dark mode)"
git push https://x-access-token:<GITHUB_PAT>@github.com/<OWNER_GH_ACCOUNT>/assemble-coming-soon-page.git main
git log -1 --format='%an <%ae>' && git ls-tree --name-only HEAD   # verify author + files (no README)
```

### Git — discard an experiment back to deployed state
```bash
git restore index.html && rm aurora.js && git status   # working tree clean = matches deployed 2621e18
```

### Git — re-author for Vercel Hobby private repo
```bash
gh api users/<OWNER_GH_ACCOUNT> --jq .id        # numeric ID for the noreply address
git config user.name "<OWNER_GH_ACCOUNT>"
git config user.email "<ID>+<OWNER_GH_ACCOUNT>@users.noreply.github.com"
git commit --amend --reset-author --no-edit
git fetch https://x-access-token:<GITHUB_PAT>@github.com/<OWNER_GH_ACCOUNT>/<repo>.git main   # confirm remote tip
git push --force https://x-access-token:<GITHUB_PAT>@github.com/<OWNER_GH_ACCOUNT>/<repo>.git main
# output quoted: "be10f21...34e0ea4  main -> main (forced update)"
```
- Large files: Claude raised the HTTP buffer before pushing ~108 MB (`git config http.postBuffer 524288000`).

### Git — branch, preview, merge
```bash
git checkout -b demo-placeholders && mkdir assets && git add assets && git commit -m "Scaffold demo-placeholders branch…" && git push <inline-url> demo-placeholders
git checkout main && git merge --ff-only demo-placeholders && git push <inline-url> main
git checkout -b client-revisions-1   # not merged within this scope
```

### Local servers and previews
```bash
py -m http.server 8123                      # quoted, 3D viewer
python -m http.server <PORT> --bind 127.0.0.1   # prototype (from the build guide)
npx serve                                   # README alternative
# open http://localhost:<PORT>/Assemble%20-%20Prototype.html?v=<cachebuster>
```

### Python utilities
```bash
py -m pip install pdfplumber pypdfium2 pillow
```
- PDF to images: pypdfium2 render each page to PNG (26 pages) because the PDF was image-only.
- Favicon: Pillow `Image.open(...).resize((256,256), Image.LANCZOS).save('favicon.png', optimize=True)` (3200×3200/374 KB → 256×256/16.8 KB).
- Icon slicing: detect tile boundaries in a 5×4 grid, crop *inside* each tile border (alpha threshold alone left a faint frame), make background transparent, save `assets/icon-<name>.png`; montage on the app's grey to preview.
- Edits: scratchpad scripts `fix1.py`, `fix2.py`, `icons.py`, `ads.py`, `logic.py`, `prefs.py`, `admin.py`, `g1.py`–`g3.py`, R1–R6 revision scripts; audit `audit.py`; generators `coverage.py`, presenter-script generator. Full Python path used: `/c/Users/<windows-user>/AppData/Local/Programs/Python/Python313/python.exe`. (These scratchpad files no longer exist on disk.)

### Node / headless browser
```bash
node --version          # v22
npm i puppeteer-core    # in scratchpad
# script: puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new' })
#         page.setViewport({width:390,height:844}); page.goto(url); page.screenshot(...); element boxes via page.$eval(...getBoundingClientRect())
```

### PowerShell GLB inspection (from `.claude/settings.local.json`, quoted in substance)
Open the `.glb` with `System.IO.BinaryReader`, read magic/version/length, read the JSON chunk length, decode it as UTF-8, `ConvertFrom-Json`, print counts of meshes/nodes/materials/images/animations and names. Read-only way to understand a 3D asset without loading it.

### Vercel (suggested, not used in scope)
```bash
npx vercel deploy --prod --token <VERCEL_TOKEN> --yes   # quoted suggestion
```

### Browser-console checks used for verification (examples)
- `getComputedStyle(el).animationName`, `document.getAnimations()` → `playState: running`
- `matchMedia('(prefers-reduced-motion: reduce)').matches`
- `document.documentElement.scrollWidth > innerWidth` per screen (overflow)
- `document.elementFromPoint(x,y)` (is the tab really on top?)
- `getComputedStyle(document.documentElement).getPropertyValue('--bg')` (theme token, avoids reading mid-transition colours)
- live-site marker check: `fetch(url).then(r=>r.text()).then(t=>['freeGens:3','payFailed',…].map(m=>t.includes(m)))`

---

## 7. Testing and verification

### Coming-soon page
- Before the logo revamp: no local render possible (the design-tool export resolves hashed assets only when served on Vercel), so CSS fixes were reasoned by maths (e.g. width at 390px) and checked live by you after deploy with a hard refresh / private tab.
- Revamp: local server + in-app browser at desktop, mobile portrait, short landscape 1000×600, 1440×900. Checks: bounding boxes (mark 352×352 centred; later "soon bottom 544 < marquee top 559"), computed `transform` (found `none` → invalid `calc`), CSS variables instead of transitioning background colour, `prefers-reduced-motion` state, animation `playState`, no horizontal overflow, easter egg open/close via DOM, desktop font sizes 79/17/12px.
- Favicon: verified file dimensions/bytes because the screenshot of a raw image URL timed out.

### 3D viewer
- Model loads, triangle count 1.9M, no console errors, "Coming soon" state for missing file, body colour switch `rgb(255,255,255)` → `rgb(0,177,64)`, file hashes of the two GLBs compared, easter egg hit-box measured precisely (13px target) and click-outside/Esc tested, no console errors after removing the chip.

### Prototype (wireframes)
- **Structural audit** (`audit.py`, regex over the HTML): counts over time — 56 screens/52 modals (14 Jul 20:55) → 58/51 → 59/53 → 60 screens (21 Jul). Always 0 broken links, 0 dead controls; known programmatic orphans `genLoading` and `packingList`. False positive once: `.menurow` container whose action is on an inner button → changed to plain divs.
- **Click crawl** (JS in the page): 1,167 controls (631 customer + 536 admin), later 1,212, then per-screen crawl 518 controls / 61 screens, 526 controls in the acceptance sweep; 0 exceptions, 0 console errors.
- **Flow / state tests**: wizard picks appear on results ("Club · Formal · Shopping only · $150+"); buying 100 credits → balance 111; subscribe Pro → profile label; upgrade to Plus → ads gone; closet-only hides missing-item row; wear today 4→5 entries; delete collection; payment-failed banner + modal; compare dropdown change → table/summary/button; closet/saved/support filters; cancel → Free; packing Build-from hides "Suggested to buy"; schedule reveals date/time; dynamic item detail (White tee → Shirts); back sequences (`plans → credits → home`; Results → Prefs → Occasion; payments → manageSub).
- **Responsive**: overflow scan every screen at 375px (only intentional chip scrollers flagged), 768 and 1440 for both apps; pinned tab bar (bottom = 812 = viewport height through scroll, 68px targets); measured tap targets before/after (chips 36→44, pills 31→40, text links 18→36, menu rows 52); input font 16px on touch vs 13px desktop; tablet cap 720px; desktop 960px with 7 closet columns; admin auth centred (centre X 640 at 1280px).
- **Coherence**: admin taxonomies vs customer chips, plan/pack prices, free-gens count, ticket IDs, brand names, campaign ↔ FEATURED/SPONSORED cards.
- **Traceability**: `coverage.py` → 230 items; 200/9/21 → 206/4/20 → 209/0/20 → 209 built / 1 design phase / 20 out of scope.
- **Acceptance sweep** (15 Jul 06:53): 39/39 pass — table with 8 tests.
- **Presenter script completeness**: generator compares its entries with the prototype's `data-screen` set → 0 missing (59 screens; 62 entries).
- **Deploy parity**: 12 markers present on live site (14 Jul 23:05), 8 markers (15 Jul 06:53).
- **Placeholder icons**: 20/20 icon files load (no 404s), `background-size: contain` computed, 58/61 boxes + 6 avatars wired.
- **Manual review by you** found what automation missed: blank admin panel (auth below the fold), admin content at bottom/no scroll (stray `</div>`), tabs not filtering, back loops, item detail always showing sneakers, stale deploy confusion.

No unit test framework, no mocks, no databases in this phase — everything was browser-level on static files.

---

## 8. Security

- **Tokens pasted in chat** (5 PATs across the scope): Claude's handling —
  - used only inline in one push command (`https://x-access-token:<token>@github.com/...`), never written to `.git/config`, remote URL kept clean and re-verified after every push;
  - output redacted with a `sed` pattern for `ghp_…`;
  - "rotate the token" warning after every push and at the end of nearly every reply, including when a later push proved the old token was still active;
  - a token that no longer worked was treated as a signal it had been revoked, and Claude asked for a fresh one rather than trying other routes;
  - suggested a fine-grained token scoped to one repo with Contents read/write, and short expiry for Vercel tokens.
  - Better practice to put in the guide: never paste tokens in chat; use `gh auth login` as the owner account, or add the CLI account as collaborator and accept the invite, or a credential manager; if a token must be used, fine-grained + one repo + short expiry, and revoke immediately.
- **Private repo for a real person's 3D likeness** (recommended option, chosen).
- **`.gitignore` hygiene**: exclude `.claude/` (local tool permissions) and working reference screenshots from the 3D repo; coming-soon repo only `index.html`, `favicon.png`, `.gitignore`.
- **No secrets in project folders** checked before `git init` of the wireframes repo (memory files live elsewhere).
- **Privacy/consent in the product design**: explicit AI photo-analysis consent separate from Terms; permissions priming screen; biometric-consent modal naming face/body/skin-tone data, encryption and deletion; "Delete avatar & face data" (later only kept on the avatar/preferences screen); "Download my data" (later removed from settings); private-closet note; admin user detail shows wardrobe *count only*.
- **Scope/legal flags for the proposal** (not the UI): biometric data likely special-category and out of MVP legal scope; app-store in-app-purchase exposure (30%) if the PWA is ever wrapped as a native app; keep FTC affiliate disclosure prominent ("Assemble may earn a commission").
- **Honest data**: removed inferred affiliate revenue, clicks, commission, untracked notifications — avoids misleading reports.
- **Admin auth design**: single secure admin login + 2FA/authenticator step + forgot password (role-based staff accounts deferred); admin link removed from the customer UI (it was visible in Profile in the original export); admin email fixed/uneditable; customer email fixed.
- **Vercel preview deployments protected by Vercel Authentication** (default) — noted as a feature, not disabled.
- **No-cache meta tags** on the prototype (freshness, not security).
- **Commit identity** set per repo rather than global, so personal identity doesn't leak into agency/client repos by default (the 3D incident showed the global personal identity being used).

---

## 9. Pitfalls

1. **Push denied (403) with the local `gh` account**
   - Symptom: `Permission to <owner>/<repo>.git denied to <CLI_GH_ACCOUNT>`.
   - Cause: the CLI keyring account isn't the repo owner or a collaborator; the collaborator invite never existed/was never accepted.
   - Fix: owner-account PAT used inline.
   - Prevent: before starting, run `gh auth status` and `gh api repos/<owner>/<repo> --jq .permissions`; log in as the owner or accept the invite first.

2. **Token revoked between sessions**
   - Symptom: "Invalid username or token. Password authentication is not supported for Git operations."
   - Cause: you rotated the token as advised.
   - Fix: commit locally, ask for a fresh token.
   - Prevent: one-call token check before a push (`gh api user` / curl `/user`).

3. **Token for the wrong account**
   - Symptom: "Repository not found" (404) on push.
   - Cause: token authenticated as a different account than the one in the URL; repo also didn't exist.
   - Fix: create the empty repo on the owner account, use an owner token.
   - Prevent: check the token's account and the repo URL match before pushing.

4. **Vercel Hobby blocks private-repo deploy**
   - Symptom: deployment "blocked because the commit author did not have contributing access… Hobby Plan does not support collaboration for private repositories".
   - Cause: commit authored with the global personal git identity, not the Vercel-linked account.
   - Fix: repo-local `user.name`/`user.email` = owner's `ID+username@users.noreply.github.com`, amend `--reset-author`, force-push; don't redeploy the old blocked entry.
   - Prevent: set repo-local identity right after `git init`; for private repos on Hobby, only the owner may author commits.

5. **`--force-with-lease` rejected / "ahead 16" confusion**
   - Cause: pushing via an inline token URL does not update `origin/main`.
   - Fix: `git fetch` the real remote tip and confirm before forcing; re-set upstream.
   - Prevent: after inline-URL pushes, `git fetch origin` to keep tracking refs honest.

6. **Vercel 404 NOT_FOUND on a static site**
   - Cause: no `index.html` at root; main file name had spaces.
   - Fix: root `index.html` redirect (meta refresh + `location.replace`).
   - Prevent: every static deploy repo has `index.html` at root.

7. **Stale deploy / browser cache makes fixes look missing**
   - Symptom: "you forgot to change it", "can't find the shop ad".
   - Cause: Vercel still building, or cached HTML (the in-app browser also served stale copies).
   - Fix: check the Deployments tab for the commit, hard refresh / private window, cache-buster query, no-cache meta tags, marker check on the live URL.
   - Prevent: after every push, verify deploy parity with markers before asking you to review.

8. **But don't blame cache too fast** (blank admin panel)
   - Symptom: admin panel blank even after hard refresh.
   - Cause: during login the empty `.app` container still filled the viewport, pushing the login panel below the fold. Automated checks clicked by selector and only checked horizontal centring.
   - Fix: hide `.app` while unauthenticated; `overflow:auto`.
   - Prevent: verification must assert elements are inside the viewport (`rect.top < innerHeight`), test at your actual viewport size, and take repeat reports as real bugs.

9. **Stray `</div>` from regex block removal**
   - Symptom: on most admin screens content sits at the bottom and doesn't scroll; buttons cut off.
   - Cause: removing the dashboard chart with a regex left an extra closing div, so `.main` wrapped only the dashboard.
   - Fix: delete the one stray `</div>`; `.main` wraps 13 screens again.
   - Prevent: after any regex-based removal, check div balance and container membership (count screens inside the scroll container).

10. **Admin login stuck to the left**
    - Cause: auth panel was a flex child with no grow, shrinking to 265px.
    - Fix: `flex:1 1 100%`.
    - Prevent: test auth screens at desktop and mobile widths, not only app screens.

11. **Back-navigation loops (3 variants)**
    - Causes: (a) navigating forward to the screen already on top of history pushed a duplicate; (b) back buttons hardcoded `data-nav="credits"` instead of history; (c) the timed `genLoading` screen entered history.
    - Fix: dedupe in `go()`; back buttons use `data-back`; exclude transient screens from history.
    - Prevent: a crawl that presses back repeatedly from deep screens and asserts no two-screen bounce.

12. **Tabs/chips toggled their own highlight but didn't change content**
    - Cause: radio state stored but nothing filtered the container.
    - Fix: `data-cat`/`data-col`/`data-status` attributes + filter functions in `render()` combined with search.
    - Prevent: every selectable control must have a state-mutation test.

13. **Every closet item opened the same "Green sneakers" detail**
    - Cause: static detail screen.
    - Fix: capture clicked item in the click handler, render name/category/brand/icon dynamically.
    - Prevent: data-driven detail screens from the start.

14. **Demo account looked used** ("2 of 3 free generations left")
    - Cause: initial state `freeGens:2`.
    - Fix: start at 3/3; align copy.
    - Prevent: review seed data as a first-time viewer would.

15. **Invalid CSS silently drops a whole transform**
    - Cause: `scale(calc(var(--size)/640))` divides px by a unitless number.
    - Fix: `/640px`.
    - Prevent: read computed `transform`; `none` means the declaration was invalid.

16. **Reduced-motion fallback froze the brand**
    - Cause: `prefers-reduced-motion` block set the ring/marquee animations to `none`; the device had reduce-motion on.
    - Fix: keep essential brand motion, calm ambient only.
    - Prevent: test with reduced-motion on; decide which motion is essential.

17. **Launcher clipped after adding a third card**
    - Cause: centred flex layout with no scroll; `setMode` forced inline `display:flex`.
    - Fix: block layout + scroll container; let CSS govern display.
    - Prevent: never set layout via inline style from JS; test short viewports.

18. **Screenshot tool timeouts**
    - Cause: flaky in-app renderer; heavy `blur(100px)`.
    - Fix: DOM/computed-style verification; lighter blur; headless Edge via puppeteer-core when real images are needed.
    - Prevent: plan DOM assertions as the primary evidence.

19. **Hand-transcribed base64 image got truncated**
    - Fix: revert; have the real file on disk; resize with Pillow.
    - Prevent: never type binary data; images pasted in chat don't land on disk — ask you to save the file to an exact path.

20. **Saved file had a double extension** (`placeholder-grid.png.png`)
    - Fix: search the folders, rename.
    - Prevent: after "saved", list the folder instead of assuming the path.

21. **Editing a minified JSON-escaped design export**
    - Symptom: Edit anchors fail (`<\u002F…>`, escaped quotes).
    - Fix: anchor on unique escape-free substrings; hide blocks with `display:none`.
    - Prevent: for heavy changes, rebuild the page cleanly instead of patching the export (which is what the logo revamp did).

22. **Proprietary design-tool export doesn't run outside the tool**
    - Symptom: `.dc.html` files need a missing `support.js`.
    - Fix: rebuild as standalone vanilla HTML/JS.
    - Prevent: check any exported prototype opens in a plain browser before promising it to a client.

23. **Image-only PDF**
    - Symptom: Read tool fails (poppler missing), pdfplumber returns no text, page count mis-reported (87 vs 26).
    - Fix: pypdfium2 render to PNG; confirm page count with two libraries.

24. **Python on Windows**: `python` resolves to the WindowsApps stub → use `py` or the full Python313 path; console encoding choked on a glyph → use Grep/UTF-8.

25. **Over-deletion caught by audit**: removing a settings row also deleted the `deleteAvatar` modal still used by another screen → audit flagged a broken `data-open` → restored modal. Prevent: run the link audit after every deletion.

26. **Misreading intent → over-building**: HDRI settings panel when you wanted "brighter"; editing another project's site when its spec was only an example; WebGL aurora vs CSS aurora; simplified favicon vs exact artwork; deleting a coverage row. Prevent: when a request references a tool's feature or another project, restate the goal in one line and confirm before building anything large.

27. **Heavy GLB assets**: 54–56 MB files, 1.9M triangles, GitHub >50 MB warnings, slow on mobile. Recommended Draco + texture compression (~5–10 MB) — not done. Prevent: compress before publishing.

28. **PBR "shine" on AI-generated models**: even high roughness shows specular; Lambert removes it; remaining highlights are baked in the texture.

29. **Uncommitted work left hanging**: the "premium" coming-soon refinement stayed local and unpushed when the session ended. Prevent: at session end, list uncommitted changes and ask to commit, stash or discard.

---

## 10. Code and templates worth reusing

(Paths relative to `<CLIENT_FOLDER>` unless absolute. Do not copy client photos or `.glb` files.)

### Coming-soon page — `coming soon page/`
- `index.html` (22 KB, dark-only): self-contained page — brand tokens as CSS variables, Google Fonts, animated "A" mark with 3D orbit ring (`spinY` 14s at commit), height- and width-capped responsive sizing with short-viewport rules, bottom marquee, reduced-motion that keeps core motion, desktop −10% text block, the **DeepLearnHQ dev-credit easter egg** (◵ hover reveal + full-screen overlay with Esc/backdrop close). Generalise as "coming-soon template + agency easter egg".
- `favicon.png` 256×256 from the original export.
- `.gitignore` (`.DS_Store`, `node_modules/`).
- `.claude/settings.local.json`: minimal allow-list (read Downloads, `git --version`, `gh --version`).
- Note: the uncommitted premium refinement (hairline frame, quiet monochrome) may still be in the working tree — check `git status` before reusing.

### 3D viewer — `3D Modelling of <client>/`
- `index.html` (22 KB): Three.js viewer — `CATEGORIES` config array (id, label, file), automatic "Coming soon" probe for missing files, auto-fit framing, OrbitControls, auto-rotate/reset/fullscreen, Lambert matte materials, exposure ~1.8, blackish radial studio background with CSS fallback to avoid a flash, switcher hidden when one category, gold-themed easter egg bottom-left.
- `README.md`: run instructions (`py -m http.server 8123` / `npx serve`), structure, how to add looks, Draco note — good README template for a static 3D site.
- `.gitignore`: `.claude/`, reference screenshot, OS junk.
- `.claude/settings.local.json`: contains the read-only PowerShell GLB-header inspector command (reusable snippet).

### Wireframes / prototype — `Wireframes/Version 1/`
- `Assemble - Prototype.html` (250 KB): the whole greyscale PWA prototype — launcher, customer app `U` controller, admin `A` controller, data-attribute interaction model, greyscale tokens, responsive breakpoints, consent modals, plan gating, ads, social loop, packing, compare, wear history, admin grouped nav, slide-in drawer, no-cache meta. The reference architecture for "clickable spec prototypes".
- `index.html`: 10-line root redirect for Vercel (meta refresh + `location.replace` + fallback link).
- `Assemble - Coverage.html` (51 KB): filterable traceability matrix (Built / Design phase / Out of scope, grouped by proposal section, "where it lives" column). Template for scope proof.
- `Assemble - Walkthrough.html` (13 KB): 5-minute demo story with click paths and "what this proves" callouts.
- `Assemble - Presenter Script.html` (47 KB): every screen as a card (What it is / Point out / Say / Get here), filter box, print button; generated and cross-checked against `data-screen`.
- `assemble-style-direction.html` (13 KB): palette + mobile/desktop proof page to approve a visual direction before converting all screens.
- `README.md`: repo landing doc template ("Open it", contents table, "Built by Deep Learn HQ").
- `assets/icon-*.png` (20 icons) + `assets/placeholder-grid.png` (source grid) + `assets/README.txt`.
- `extracted/design_handoff_assemble_pwa/README.md` (15 KB): the original design-handoff README — excellent model of a screen-by-screen spec (navigation model, every screen, every modal, breakpoints, fidelity notes). The `.dc.html` originals and proposal PDF are alongside (client material; don't copy).
- `PWA wireframes_ user and admin.zip`: original export archive.
- `Assemble - Additional Modules.md` and `Assemble - Additional Modules - Build Guide.md` (written after this scope): client-facing module pitch and **internal build guide** — §1 prototype architecture and every data attribute, §2 verification workflow (assert-on-count edits, cache-buster, audit.py, DOM assertions, both breakpoints, branch + ff-merge, inline-token push + redaction + rotation). Note: that guide's git step includes an AI co-author commit trailer; the standing rule for client repos is **no AI attribution**, so drop that line when generalising.
- Git history (`git log --oneline --all`): commit subjects are a good model of descriptive, feature-level commit messages.

### Prompts/snippets from the chat worth lifting verbatim (generalised)
- **Greyscale icon grid image prompt** (15 Jul 06:58): 5×4 grid, rounded-square tiles `#F2F2F4` with 1px border on `#ECEEF1`, charcoal `#161619` line icons, uniform stroke, no text/shadows/gradients, list of 20 icons by row, `--ar 5:4`, ~2000×1600px so it can be sliced.
- **Compaction summary structure** (14 Jul 22:03): Primary request & intent / Key technical concepts / Files and code sections / Errors and fixes / Problem solving / All user messages / Pending tasks / Current work / Optional next step — reuse as a manual handoff template.
- **Acceptance sweep table**: # / Test / What it proves / Result.
- **Task-completed table**: # / Change / Purpose.
- **Monetisation explainer table**: Lever / Admin (where set up) / User app (where it shows) / Complete?

### Scripts to recreate (lost from scratchpad)
- `audit.py`: parse `data-screen`, `data-modal`, `data-nav`, `data-open`, `data-act`; report broken targets, orphans, controls with an action class but no data attribute, `act()` cases missing.
- Click crawl (in-page JS): for each screen, `U.go(screen)`/`A.go`, click every `[data-nav],[data-open],[data-act],[data-rg],[data-chip],button`, restore state, collect `window.onerror` + console errors.
- Responsive sweep: set viewport, visit every screen, flag elements whose right edge > viewport width unless inside an `overflow-x:auto` parent.
- `coverage.py`: list of (section, proposal wording, status, where) → HTML with counts and filter chips (escape `%` as `%%` if using `%` formatting).
- Presenter-script generator: list of screen entries → HTML; assert the set equals the prototype's `data-screen` set.
- Grid slicer: Pillow tile detection, inset crop, transparency, montage preview.
- `rep(old, new, count)` assert-on-count edit helper.
- puppeteer-core + Edge capture script.

---

## 11. Session running

- **Sessions and durations** (from archive headers):
  - Coming-soon: one session file spanning 9 Jul 23:15 → 22 Jul 15:37 (plus an auto "No response requested" on 5 Sep); two working bursts: ~3h20m on 9–10 Jul (18 commits), ~1h35m on 22 Jul early hours + a one-line follow-up that afternoon. 51 user messages, 183 replies.
  - 3D modelling: one session 25 Jul 20:10 → 22:47 (~2h37m), 28 user messages, 95 replies, 3 commits.
  - Wireframes: one long session 14 Jul 02:30 → 5 Aug (265 user messages, 1,072 replies in total; this scope covers to 21 Jul 05:33). The 14 Jul day alone ran ~20 hours of wall-clock with gaps; context was exhausted and **auto-compacted at 22:03 on 14 Jul**, continuing from a structured summary; the session later continued on 15, 17 and 21 Jul in the same conversation.
- **Model**: not named in the archive for this scope; the later internal build guide's commit trailer suggests an Opus-class model was in use at the time.
- **Tools inside Claude Code**: multiple-choice question tool, plan mode (premium look), Browser pane preview (with `javascript_tool`, console reads, resize), Write/Edit, Bash/PowerShell, auto-memory, TODO tracking ("set up tracking" for Groups 1–3 and A.1–A.11).
- **Timing notes**: 3D push of ~108 MB "may take a bit" (under a minute of chat time); Vercel redeploys ~30–60 seconds; generation screen in prototype auto-advances after 1.8 seconds; builds of large batches took ~15–20 minutes of chat time (e.g. 17-point batch 06:18 → 07:03; client revisions batch 1 02:48 → 03:02; batch 2 03:55 → 04:08).
- **Background servers**: local `http.server` processes started per verification and explicitly stopped afterwards; one server killed unexpectedly when the shell exited (14 Jul 03:04) → restarted; coming-soon preview server left running on 8817 at your request.
- **Interruptions**: roughly a dozen `[Request interrupted by user]` events in scope — used to redirect (wrong target site, over-building, adding items to a batch, correcting tool use). Batches were re-sent whole.
- **No parallel sessions, worktrees or sub-agents** were used in this scope; all work was sequential in one conversation per project folder, each project folder with its own `.claude/settings.local.json` permission allow-list.
- **Resuming**: a compaction summary ends with "Continue the conversation from where it left off without asking the user any further questions" and the path to the full transcript `.jsonl` for exact details.
