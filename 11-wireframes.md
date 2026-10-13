# 11 — Wireframes: the greyscale clickable prototype (standalone HTML)

**Where this sits:** after [10-prebuild.md](10-prebuild.md) (brand kit, first repo and Vercel project exist). Next is [12-ui.md](12-ui.md), which restyles this same file with the brand. The working habits used here are described in [02-how-we-work.md](02-how-we-work.md); the prompts are collected in [30-prompt-library.md](30-prompt-library.md).

## Goal

Turn a written proposal (or a designer's static wireframes) into **one self-contained HTML file** that is:

- **Clickable and complete** — every screen, every modal, every button does something; every list item opens its own detail view.
- **Stateful** — a choice on one screen changes later screens (a plan upgrade removes ads, a credit purchase changes the balance, a filter filters).
- **Greyscale** — soft tonal greys, no brand colour yet, so the client judges flows, not colours. (One exception: a red border may mark ad zones.)
- **In scope** — nothing that is not in the proposal, nothing from the proposal missing, and no metric shown that the real app could not track.
- **The developers' spec** — later milestones read this file as the requirements. Dead markup is deleted, not hidden, so nobody builds it by mistake.

Plus three supporting pages on the same Vercel site: a **coverage matrix** (proposal item → built / design phase / out of scope), a **walkthrough** (a five-minute demo story) and a **presenter script** (one card per screen). And, at the end, a **handoff document** so a fresh Claude session can continue.

> **The lesson Assemble learned, stated up front:** the greyscale prototype was rebuilt in brand colours three weeks later (see [12-ui.md](12-ui.md)). Claude's own playbook afterwards says "build branded from day one with styled placeholders". You may still want a greyscale stage when the client has not settled the brand or when flows are contested — then keep this milestone, and know that milestone 12 restyles the same file in place rather than starting over. If the brand is final and the client trusts you on visuals, run milestones 11 and 12 as one.

## Prerequisites checklist

- [ ] The proposal or spec as a file (PDF is fine; if it is image-only, Claude renders pages to PNG and reads them).
- [ ] Any designer export of wireframes (zip). Check whether the export opens in a plain browser; proprietary exports often need a runtime file that is missing, and Claude will rebuild them anyway.
- [ ] `BRAND.md` from [10-prebuild.md](10-prebuild.md) (used only for typography and shape at this stage).
- [ ] An **empty** GitHub repo for the prototype (e.g. `<App>_Wireframes_Version_1`), connected to Vercel as a static site (framework Other, no build). Details in [03-services-setup.md](03-services-setup.md).
- [ ] The repo-local commit identity decided (owner noreply address), token rules read ([20-security.md](20-security.md)).
- [ ] Python 3 via `py` with Pillow; Node 22 (for an optional headless-Edge screenshot script).
- [ ] A working folder `<CLIENT_FOLDER>\Wireframes\Version 1\` with the inputs inside.
- [ ] An hour blocked for the first question round. The whole milestone took Assemble about a week of sessions (14–21 Jul 2026) with client revision rounds in between.

## Step 1 — Read the proposal critically, then plan (question round)

Plain English: before any screen is drawn, Claude reads everything and asks you the questions that change what gets built. The answers become the contract for the milestone.

1. Open a session in `<CLIENT_FOLDER>\Wireframes\Version 1\`.
2. Paste the kickoff block with the proposal attached. Claude will list gaps in the proposal (product/UX and scope/legal) and ask 3–5 scoping questions.
3. Answer with the deliverable you actually want. Assemble's turning point was the free-text answer "not a report — build the final greyscale high-fidelity prototype I can present to the client, responsive to all screen sizes".
4. Ask for a **style-direction proof page** first (a palette plus one screen at phone and desktop width). Approve it before all screens are converted; changing the tone later touches every screen.

> **For Claude — paste this:**
> ```
> @"[proposal.pdf]" [and @"[designer export.zip]" if any]
> App name is [APP]. Critically analyse this proposal for gaps and issues (product/UX and scope/legal). Let's plan first — ask me any questions before we proceed, one at a time, multiple choice, recommended option marked.
> The deliverable I want is NOT a report: it is the final high-fidelity GREYSCALE clickable prototype (tonal greys, not sketch black-and-white) that I can present to the client and that developers will build the frontend and backend from. Responsive to all screen sizes. Use the proposal for requirements only, not for pricing or timeline.
> Before converting all screens, build a one-page style-direction proof (palette + the Home screen at 375px and 1440px) and ask me to approve the tone.
> ```

> **Assemble example.** 14 Jul 2026, 02:30. The proposal PDF was image-only (26 pages, rendered with `pypdfium2`). Claude found the designer's `.dc.html` export needed a missing `support.js` runtime, so it could not be shown in a browser — that settled the "rebuild as standalone HTML" decision. Its gap list had 7 product/UX and 3 scope/legal items (biometric data consent, app-store fees if ever wrapped, affiliate disclosure). The style page `assemble-style-direction.html` was approved with "a bit more contrast" for projector legibility.

## Step 2 — Build the prototype (architecture that makes verification possible)

Plain English: Claude writes one file. What matters is *how* it is wired, because the same wiring lets Claude prove completeness with scripts later.

1. Paste the build block. Claude produces `<App> - Prototype.html` (customer app and admin panel in one file with a launcher), plus a 10-line `index.html` redirect so Vercel serves it at `/`.
2. Ask Claude to run the **structural audit** and the **click crawl** (both described in Step 4) before it shows you anything.
3. Click through it yourself on a phone. Only your manual pass finds bugs like "the admin panel is blank" — automation checked that elements existed, not that they were inside the viewport.

> **For Claude — paste this:**
> ```
> Build the prototype as ONE self-contained file "[App] - Prototype.html" (no framework, no build, inline CSS + vanilla JS). Add index.html at the root that redirects to it (meta refresh + location.replace + fallback link) so Vercel serves it at /.
> Architecture (required, so we can audit it by script):
> - A launcher screen with one card per app ("Customer app" / "Admin panel"), entered via data-enter="user|admin". Back to the launcher only via logout.
> - One controller per app (e.g. U for customer, A for admin), each with a state object st {screen, modal, hist:[], credits, radio:{}, sel:{}...}, go(screen), back(), render() (idempotent: reads st, patches DOM by id), ONE delegated click(e) listener and an act(name) switch for verbs.
> - Screens are <section class="screen" data-screen="name">; modals are <div class="modal" data-modal="name">. All behaviour through data attributes only: data-nav, data-back, data-open, data-close, data-act, data-toast, data-chip, data-rg/data-rv (radio groups), data-home, data-enter, data-lock, plus entity identity (e.g. data-item="id") so ONE detail screen serves every card. Keep the closest() selector list of every data-* attribute next to the attribute vocabulary; every new attribute must be added to it.
> - Back buttons ALWAYS use history (data-back), never a hardcoded target. Loading/transient screens never enter history. Navigating to the screen already on top of history pops instead of pushes. Cap history at 25.
> - Real state: choices on one screen drive later screens (wizard picks appear on results; buying credits changes the balance; upgrading a plan removes ads and unlocks gated features; filters filter; "wear today" increments counts). Nothing is toast-only.
> - Data-driven screens: one small data object per entity (items, looks, products, friends); every card carries its id; detail/compare/share screens render from the data. Counts are derived from the data, never typed.
> - Greyscale design tokens in :root (canvas, surface, ink, line, mid-grey, three shadows, radii). Icons only for navigation, monochrome; no emoji. A red 1px border marks ad placements (the only colour).
> - Responsive: customer app bottom tab bar ↔ side rail at 900px; admin sidebar ↔ slide-in drawer at 880px; tables scroll inside their own container; pinned bottom nav; 16px inputs and 44px targets on touch; tablet content capped ~720px; desktop ≥1200px at 960px wide; no horizontal overflow at 375px anywhere.
> - No-cache meta tags on the prototype (reviewers must never see a stale build).
> - Consent wherever sensitive data is captured (separate AI-photo consent at sign-up, a permissions screen, a consent modal before biometric-like captures, data delete).
> - No prototype language visible ("wireframe", "screen 12"): the viewer sees only what an end user would see. Remove means delete from code.
> - Scope: nothing beyond the proposal unless necessary; add any screen the proposal implies but the export lacks; never show a metric the real app could not track.
> After building: run the structural audit and click crawl, fix everything, then give me the local URL with a cache-buster. Don't push until I say so.
> ```

> **Assemble example.** Built 14 Jul 2026 in three passes (03:13 two separate files → 03:34 combined single file with consent flows → 04:02 scope-discipline pass). The controllers `U` and `A` with `st`/`go`/`back`/`render`/`click`/`act` and the data-attribute vocabulary stayed the architecture through the branded UI and were the model for the real app's Zustand store. Three separate back-loop bugs (duplicate history push, hardcoded `data-nav` back targets, the timed loading screen entering history) are why the rules above are so specific.

## Step 3 — Revision rounds with the client (numbered batches, then audit)

Plain English: the client will send lists. You send them to Claude as numbered items, Claude echoes back everything it captured and asks only the genuinely open questions, builds, and returns a "task completed" table you can tick against the client's list.

1. Collect the client's feedback into one numbered message. Prefix it with the collaboration line: *"Give me suggestions to choose from for each decision and ask me any questions before writing code."*
2. For big or risky batches say **"use a branch; we merge after I verify"**. Vercel gives every branch a preview URL (it may sit behind Vercel's login — turn off preview protection in the project settings if the client must see it, or merge after your own check).
3. After each batch ask for the audit against the proposal: *"critically analyse against the proposal for anything extra or missing and bring me a list to discuss BEFORE adding."*
4. Every so often, run the two deeper prompts: the **gap hunt** ("where do I see the outfits my friends send me? how do I add friends? find other gaps like this") and the **long-term-user test** ("think through a person using this app for six months, week by week; keep within scope; split findings into in-scope gaps and out-of-scope ideas").
5. Merge with `git merge --ff-only`, delete merged branches, delete experiments you rejected (locally and on GitHub) so developers never find them.

> **For Claude — paste this (client revision batch):**
> ```
> Client revisions, batch [N]. Give me suggestions to choose from for each decision and ask me any questions before writing code — we need to collaborate so I can give you the right context.
> Work on branch [client-revisions-N]; we are not merging until I verify the preview.
> 1. [item] 2. [item] ... [N]. [item]
> First echo back "Everything I captured" as a numbered list, then "My proposals for the ambiguous bits", then ask the real decisions one at a time (multiple choice, recommended option marked). Then build, run the structural audit + click crawl + state tests, push the branch, and end with a task-completed table (# / change / purpose) so I can verify item by item. Then critically analyse against the proposal for anything extra or missing and list it for discussion before adding anything.
> ```

> **Assemble example.** 14 Jul 06:13: a 17-item batch ("remove Apple login everywhere", "no coloured icons", "pronouns in onboarding and editable later", "fixed bottom nav", "made by <agency> for the client" credit line) built and pushed in 45 minutes, then audited: 11 in-proposal gaps (A.1–A.11) were found and built the same evening. 14 Jul 20:17: the gap hunt found the social loop was one-directional (you could share but never receive), which produced friends, a shared-with-me inbox and notification deep links. 14 Jul 22:32: the six-month-user test added the wear log, delete collection and a payment-failed state, and parked three out-of-scope ideas. 21 Jul: two client batches on branch `client-revisions-1` (22 and 18 items), each with four questions and a task-completed table; a desktop-native experiment on 21–22 Jul was rejected ("I didn't like it") and the branch deleted on both ends. 4 Aug: a "mood board / style tile" experiment (a token-driven theme page with a component kit, built on a `mood-board` branch after a 12-question round) was dropped the same day ("I don't like the mood board idea, delete") — branch deleted, `main` untouched. Two rejected experiments, two deleted branches: the rule "delete what you reject, completely" comes from here.

## Step 4 — Verify completeness with evidence, not assertions

Plain English: "it works" is not evidence. Ask for numbers. Claude can script most of these because of the data-attribute architecture.

The verification pyramid for a single-file prototype:

1. **Structural audit** (`audit.py`): parse every `data-screen`, `data-modal`, `data-nav`, `data-open`, `data-act`; report broken targets, orphan screens, controls with an action class but no attribute, `act()` cases that are missing. Expect "0 broken links, 0 dead controls".
2. **Click crawl** (JavaScript in the browser pane): visit every screen, click every control, restore state, count console errors. Expect "N controls, 0 errors".
3. **State-mutation tests**: assert something changed (plan flips, ads disappear, history grows, filter hides items, compare table rebuilds). Every selectable control needs one.
4. **Responsive sweep**: every screen at 375 / 768 / 1440, both apps; flag any element whose right edge exceeds the viewport unless it sits in an `overflow-x: auto` parent; tap targets ≥ 44 px; pinned nav geometry; auth screens centred at desktop.
5. **Coherence check**: admin lists, prices, IDs and labels match what the customer app uses.
6. **Traceability matrix**: proposal item → Built / Design phase / Out of scope, with "where it lives". No percentages (a "98%" reads as unfinished to a client; unbuilt visual affordances are honestly labelled "design phase").
7. **Deploy parity**: fetch the live URL and grep for markers only present in the newest commit.
8. **Your manual pass** on a real phone and a laptop. It found every bug the scripts missed.

> **For Claude — paste this (acceptance sweep):**
> ```
> What tests prove this prototype is complete, in scope and missing no screen? List them, strongest first, then run every scriptable one as ONE acceptance sweep and give me a pass/fail table (# / test / what it proves / result with numbers). Include: structural audit, click crawl of every control in both apps, state-mutation tests for every credit gate and plan state, responsive sweep at 375/768/1440 with tap-target sizes, admin↔customer coherence, traceability against the proposal, deploy parity against [live URL]. Did every check cover the admin panel too? Show evidence per check. Verify elements are INSIDE the viewport (rect.top < innerHeight), not merely present. Keep audit.py and the crawl script in a tools/ folder in the repo, not only in your scratchpad.
> ```

> **Assemble example.** 14 Jul 20:55: audit 56 screens / 52 modals / 0 broken links; crawl 1,167 controls / 0 errors. 15 Jul 06:53: consolidated acceptance sweep 39/39 pass. Traceability matrix `Assemble - Coverage.html`: 230 proposal items → finally 209 built / 1 design phase / 20 out of scope (percentages removed at your request on 15 Jul). "Are you doing all these checks for admin as well?" (14 Jul 22:55) made Claude admit the state tests had been customer-heavy and run the admin ones. The verification scripts lived in the temporary scratchpad and were lost when it was cleared — hence "keep them in tools/".

## Step 5 — Placeholder imagery, presentation pages and docs

1. **Placeholder images**: ask Claude to inventory every grey placeholder box and write **one image-generation prompt** for a sliceable grid of greyscale icons (5×4, filenames baked under each tile). Generate it in your image tool, save to `assets/`, and Claude slices it with Pillow and wires each placeholder by context — on a branch first, merged after you check the preview.
2. **Walkthrough page**: a five-minute demo story with click paths and "what this proves" callouts.
3. **Presenter script**: one card per screen (What it is / Point out / Say / Get here), generated from the prototype's `data-screen` list so it can prove no screen is missed; filter box; print button.
4. **README** in the repo: how to open it, what each file is, "Built by <agency>".
5. Keep all of these **in sync every round** — Claude greps them for retired terms after any pricing or model change.

> **For Claude — paste this (presenter script):**
> ```
> Make a standalone HTML presenter script that explains every screen of both apps step by step (What it is / Point out / Say / Get here). Generate it from the prototype's data-screen set with a script so you can prove no screen is missed (assert the two sets are equal). Add a filter box and a print/PDF button. Put it on the same Vercel site and link it from the README.
> ```

## Step 6 — Optional: the "Additional Modules" document

When the client asks for features beyond the proposal, write them up as a **client-facing modules document** rather than building them. Claude produced the structure per feature: *What it is · Why it matters · Where you'll see it · How it works · How it can earn (options; client picks one) · Our suggestion*; prices revealed only in a table at the end; plain tone; no emoji; no screen IDs. Keep an **internal build guide** alongside, uncommitted, explaining how each module would be folded into the prototype if chosen.

> **Assemble example.** 26–27 Jul 2026: nine modules written from a client-call transcript plus Claude's own suggestions (after "rethink carefully what the app is, then rewrite your list"); exact prices by a fixed rule; a discount table; a per-generation 3D-avatar definition. On 4 Aug the client accepted only the Personal 3D Avatar. It was built on branch `feature-3d-avatar` after a 13-question one-by-one round, with a key constraint discovered *before* design: the 3D vendor reconstructs the person as photographed (clothes included), so "dress a body in app outfits" needed a different path (AI-generate the four views first). The vendor's name never appears in the UI.

## Step 7 — Handoff: write it down, then move to a new repo

Before the milestone ends, ask for `PROJECT-HANDOFF.md`: product summary, repos and branches, how to run and verify (local server, launcher entry, DOM testing, overflow check), architecture and attribute vocabulary, change log, conventions, known limitations, pending items, a quick-start checklist. **No secrets in it.** Push the code and the handoff to a fresh repo that the next milestone will import (Assemble: `Assemble_UI_Version_1`, 5 Aug 2026, tip `049fcb4`).

> **For Claude — paste this:**
> ```
> Before pushing to the new repo [URL], write PROJECT-HANDOFF.md so a fresh Claude session or a developer understands the project in full detail: what it is, repos/branches, how to run and verify (exact commands, the launcher gate, DOM-driven testing, the 375px overflow check), the controller and data-attribute architecture, the full change log with dates, conventions (back navigation, remove = delete, no meta language, coherence rule), known limitations, pending items, a quick-start checklist. No tokens or secrets anywhere in it. Then push code + doc to the new repo's main with the usual inline-token push rules.
> ```

## Pitfalls (wireframes)

| Symptom | Cause | Fix / prevention |
|---|---|---|
| Admin panel blank after clicking it on the launcher, even after hard refresh | The empty `.app` container still filled the viewport and pushed the login panel below the fold; automation only checked presence and horizontal centring | Hide the app shell while unauthenticated; verify `rect.top < innerHeight`; treat a repeated bug report as real, not "cache" |
| Admin content sits at the bottom / does not scroll on 12 of 13 screens | A stray `</div>` left by a regex block removal closed the scroll container early | Balance-check div structure after any regex removal; count screens inside the scroll container |
| Blank admin again right after fixing the above | Two fixes collided: one hid `.app` in auth mode, the other moved the login back inside `.app` | After a structural fix, re-test every state that fix touches (logged-out *and* logged-in) |
| Admin login stuck to the left | Auth panel was a flex child with no grow | `flex: 1 1 100%`; test auth screens at desktop and mobile |
| Back button bounces between two screens | Duplicate history push / hardcoded back target / loading screen in history | The three history rules in Step 2; a crawl that presses back repeatedly from deep screens |
| Tabs and chips highlight but the list does not change | Radio state stored, nothing filtered | Data attributes + filter functions in `render()`; a state-mutation test per control |
| Every item opens the same detail ("Green sneakers") | Static detail screen | Capture the tapped id, render from the data object |
| Demo account looks used ("2 of 3 generations left") | Seed state set mid-way | Review seed data as a first-time viewer; start at 3/3 |
| Coverage "98%" upsets the client | Percentages read as "unfinished" | Built / Design phase / Out of scope statuses, no numbers |
| Removed a settings row and broke another screen | The shared modal was deleted too | Run the link audit after every deletion (it caught this) |
| Client sees stale build | Cache | No-cache meta tags, `?v=N`, marker check on the live URL |
| Colour emoji in a greyscale design | 🔒 used as a lock | Monochrome text badges ("PRO"); no emoji in client docs either |
| Two stale copies of the deliverable in the repo | Early split files never deleted | One source-of-truth file; delete superseded copies |
| Plan/pricing change leaves old wording somewhere | Docs and admin help mirrored the old model | Grep both apps and all docs for old terms after any model change |
| Edit anchors fail on the 250 KB file | Non-unique strings, shifting line numbers | Python edit scripts with an assert-on-count `rep(old, new, count)` helper; re-read anchors before each script; audit after each script |
| Question wall of 12 items is hard to answer | Batched questions | One question at a time, multiple choice, recommended option marked (the standard from 4 Aug on) |
| `git push -u` stored the token in `.git/config` | `-u` writes the URL as upstream | Never `-u` with a token URL; `grep ghp_ .git/config` after every push; scrub |
| Vercel preview URL asks for a login | Deployment Protection on previews | Turn off Vercel Authentication for previews in project settings, or merge after your own check |

## What to carry forward

- `<App> - Prototype.html`, `Coverage.html`, `Walkthrough.html`, `Presenter Script.html`, `README.md`, `PROJECT-HANDOFF.md`, `tools/audit.py` and the crawl script → [12-ui.md](12-ui.md) restyles the prototype in place and keeps the docs in sync.
- The data-attribute vocabulary and the history rules → the React app's navigation rules in [13-fullstack-frontend.md](13-fullstack-frontend.md) (the "back button ping-pong" bug reappeared there until `router.back()` was used).
- The verification pyramid idea (evidence with numbers, admin included, manual phone pass) → grows into the test pyramid in [21-testing.md](21-testing.md).
- Every prompt above → [30-prompt-library.md](30-prompt-library.md); every pitfall → [40-pitfalls-master-list.md](40-pitfalls-master-list.md).
