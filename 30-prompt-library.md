# 30 — Prompt library

Part of the Assemble replication guide. Index: [00-index.md](00-index.md). How the sessions were run: [01-running-the-sessions.md](01-running-the-sessions.md) and [02-how-we-work.md](02-how-we-work.md). Milestone chapters: [10-prebuild.md](10-prebuild.md), [11-wireframes.md](11-wireframes.md), [12-ui.md](12-ui.md), [13-fullstack-frontend.md](13-fullstack-frontend.md), [14-backend.md](14-backend.md), [15-payments-and-cutover.md](15-payments-and-cutover.md), [16-growth.md](16-growth.md). Security: [20-security.md](20-security.md). Testing: [21-testing.md](21-testing.md).

Every reusable prompt from the Assemble chats (9 Jul – 17 Sep 2026), grouped by milestone and activity. For each one you get:

- **Original** — what you actually typed, lightly cleaned (typos kept where harmless), with the date. Client name removed, secrets masked as `<GITHUB_PAT>` and similar.
- **What it achieved** — why it is in this library.
- **Template** — a copy-paste version with `[placeholders]`.

Blocks marked **For Claude — paste this** are written *to* Claude and can be pasted verbatim. The rest are written in your voice and are meant to be typed as your own message.

How to use this library: find the activity, copy the template, fill the brackets, and almost always finish with the **question-round suffix** (section 0). The suffix is the single most important prompt in the whole project.

Contents: 0 the question-round suffix · 1 session-level prompts · 2 access, tokens and services · 3 pre-build · 4 wireframes · 5 branded UI · 6 full-stack frontend · 7 backend · 8 security · 9 growth (landing, pricing, marketing) · 10 background task briefs · 11 Claude-side templates (paste-ready contracts).

---

## 0. The question-round suffix (use it on almost everything)

**Original, final form (from 1 Sep 2026 onward, used dozens of times):**

> "Before we proceed, ask me at least 5 questions so you can fully understand what I'm trying to achieve. Ask the questions one at a time, and for each question, give me multiple-choice options to choose from. Clearly highlight the option you recommend and briefly explain why. Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf."

**Earlier forms (same idea, evolving):**

- 14 Jul: "lets plan first ask any questions before we proceed?"
- 21 Jul: "Give suggestion to me to choose from for decisions and ask me any questions before writing code, we need to collaborate so i can provide you correct context."
- 4 Aug: "dont write any code ask me at least 10 questions to understand properly" → "ask me like one by one with multiple choice"
- 5 Aug (the UI contract, sent three times until the wording was right): "Ask at least 20 questions to understand discuss the UI and take decisions together, got it? ask one by one and give multiple choice options to select from and highlight the recommended by you."

**What it achieved:** every significant piece of work started with grounded multiple-choice questions, one at a time, each option carrying a one-line trade-off and one marked "(Recommended)". Scope, cost rules, privacy, the test bar and the shipping shape were locked before any code. Free-text answers in the "Other" slot changed direction often (that is a feature). Walls of 12 questions in one message were hard to answer; one-by-one was faster and gave cleaner decisions.

**How many questions:** 5 for a bug or a small fix; 10 for a feature; 15–30 for a new subsystem (public share links took 30); 25 for a page or a security review; 50 for "make everything real" audits. Ask for more mid-round if a round "didn't do justice" (section 1.6).

**Template (append to any request):**
```
Before we proceed, ask me at least [N] questions so you can fully understand what I'm trying to achieve. Ask the questions one at a time, and for each question, give me multiple-choice options to choose from. Clearly highlight the option you recommend and briefly explain why. Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf.
```

> **For Claude — paste this (how to run the round on your side):**
```
Before asking, read the relevant files or the live page so every question describes current behaviour, not a guess.
Ask ONE question per turn using the multiple-choice tool: 2–4 options, a one-line trade-off on each, exactly one marked "(Recommended)" with a one-line reason.
Treat a free-text answer as a correction or added scope; fold it into the next question. If an answer does not map to the options, re-ask in simpler words. If I say "re-ask Q[n]", re-ask it with sharper options.
Include questions on: scope edges, what costs the user credits, privacy, what the demo account does, how we test (unit + build + Playwright e2e + live staging check + CI), and how it ships (one push or staged).
After the last answer: summarise every decision and its trade-off, list "one thing I need from you", then ask "Build it as summarised? (Yes / Yes with a change / Change something first)". Do not start until I answer.
```

---

## 1. Session-level prompts

### 1.1 Read everything first
**Original (5 Aug 2026 03:21):** "read v throughly and understand the project first - then we might ad skills and convert these highfeidelity grey scale wirfeames into a moderdern looking pwa. we have logo and color pallete and font selected but we need to make this super awseome, we ll talk about it later first you should understand eveything about the project."
**Achieved:** a full read of the handoff doc and the 1,775-line prototype, a saved memory summary, and a clear list of what Claude still needed before any change.
**Template:**
```
Read [HANDOFF.md / README / main files] thoroughly and understand the project first. Don't change anything. Summarise what it is, how it's built, what conventions it follows, and what you need from me before we [goal]. Save the key context to memory.
```

### 1.2 Kick off a new app from the playbook (the bootstrap message)
**Original (written 20 Aug 2026 into `UI-Build-Playbook.md` §12, used in a separate session for another app):** "Read UI-Build-Playbook.md in this folder fully — it defines our process, architecture, design system, pipelines, and pitfalls. My proposal for the new app is <path/file>. The brand assets are <paths, or "none — run the brand Q&A first">. The GitHub repo is <owner/repo>; Vercel auto-deploys main. Start Phase 1: read the proposal and give me the screen inventory, roles, flows, and monetization map. Then run the Phase 2 decision round — ask at least 30 questions, one at a time, multiple choice, recommended option highlighted. Don't build until I say go."
**Template (for this guide):**
```
Read [00-index.md] and the chapter for [milestone] in this replication guide fully. My proposal for the new app is [path]. Brand assets: [paths | none — run the brand question round first]. Repo: [owner/repo]; Vercel auto-deploys main. Start with [phase 1 output], then run the decision round: ask at least [30] questions, one at a time, multiple choice, recommended option highlighted. Don't build until I say go.
```

### 1.3 Hand over a handoff document before a new repo or session
**Original (5 Aug 2026 02:55):** "can you also push this into a new repo called: … but before that write everything in an md file so when someone reads it like claude in another session - it can understand everything in detail?"
**Achieved:** `PROJECT-HANDOFF.md` (product, repos, run-and-verify, architecture, change log, conventions, limitations, quick start), deliberately token-free, pushed with the code.
**Template:**
```
Before pushing to [new repo], write everything into a PROJECT-HANDOFF.md so a fresh Claude session or a developer understands the project in detail: what it is, repos and branches, how to run and verify, architecture, conventions, known limitations, pending items, a quick-start checklist. No secrets. Then push code + doc to [repo] main.
```

### 1.4 "What's left?"
**Originals:** "so coming back to completing the frontend phase. whats left?" (28 Aug 03:49) · "whats left now in step 2, we are not implementing the marketing tracker ones." (9 Sep 22:48) · "all done? anything left now except for stripe?" (13 Sep 01:56)
**Achieved:** an honest ledger split into ours / waiting on you / deliberately later, with a recommended order and what each item needs from you.
**Template:**
```
Coming back to [phase]: what's left? We are not doing [excluded items]. Split it into: still running, ours to do, waiting on me (and what exactly you need), deliberately later. Recommend an order.
```

### 1.5 Plain-English status for a non-technical reader
**Original (4 Sep 2026 19:26):** "oka one thing i want from you, the frontend part we made step 1. can you list down in a proper manne what can we do in frontend and what will completed in next phase. dont user very technical words, simple english is best"
**Template:**
```
List in simple English (no technical words) what the app can do today and what comes in the next phase.
```

### 1.6 Ask more, or re-ask
**Originals:** "i feel like 15 questions didnt do justice and Before we proceed, ask me at least 15 more questions…" (10 Sep 02:07) · "re ask question 37" / "ask q 40 again" / "re ask q 48 and q49" (11 Sep) · "can you ask the last question again?" (28 Aug 18:17) · "could youre ask question in simpler words" (16 Sep) · "sorry to interrupt but one change for question, How far should the desktop fix go…? Desktop-native all/each and every screens. continue." (21 Jul 08:24)
**Templates:**
```
[answer]. Also I want to change my answer for Q[n], and [N] questions didn't do justice — ask me at least [M] more questions on [topic].
```
```
Re-ask the previous question first — I want to change my answer — then ask this one again in simpler words.
```
```
Sorry to interrupt — change my answer to "[question]": [new answer]. Continue.
```

### 1.7 Hold, wait, stop, continue
**Originals:** "go but dont push i'll verify first" (22 Jul) · "SHOW LOCALLY FIRST." (22 Jul) · "let not do step 2 now. please stop step 2 for now." (28 Aug) · "for next batch i want you to first wait" / "when its complete dont run and task i will give you new next batch" (16 Sep) · "stop" (15 Sep 20:47, Claude confirmed nothing had changed) · "leave it lets keep 70% and conmtiue where we stopped from." · "Try again" / "continue" / "model changed continue." (after outages, interrupts and a usage limit)
**Templates:**
```
Do it but don't push — I'll verify locally first.
```
```
Finish only what's already agreed. When it's done, report and start nothing new until I send the next batch.
```
```
stop
```
```
Model changed. Continue: first check what the interrupted work already finished (typecheck, tests, migrations applied), then resume only what's left.
```

### 1.8 Estimates, ETAs and model choice
**Originals:** "whyy is it taking so much time?" (11 Sep) · "whats the total eta in one line?" / "how much time left in total and any faild task will be done again?" (16 Sep) · "before you start anyhting … can you estimate? and also can we change mid way? is changing now better or mid way better?" + pasted usage report (16 Sep 02:44)
**Achieved:** phase-by-phase ETAs; confirmation that failed steps resume without redoing finished ones; an estimate of the batch against the weekly allowance and the advice to switch model **before** launching sub-agents (they inherit the model at launch).
**Templates:**
```
Total ETA in one line, broken into build / tests / review / deploy / live check? Will any failed step be retried automatically?
```
```
Before starting, estimate how much of my remaining [weekly limit] this batch will use on [model A] vs [model B]. Is switching better now or mid-way? Here's my usage report: [paste].
```

### 1.9 Save everything; refresh the archive
**Original (17 Sep 2026 00:16–00:17):** "it would be ideal if you to save every thing we have discussed ever in this chat regarding assemble. are we already doing that?" → "i dont mean just today i mean for ever since inception of this session."
**Achieved:** every chat since 9 Jul exported as readable, secret-masked Markdown outside git.
**Template:**
```
Save everything we've ever discussed about [project] since the very first session as readable files outside git, with secrets masked. Keep it refreshed after each batch.
```

### 1.10 Context worry
**Original (17 Sep 00:09):** "what will we do if context is at 100%, is that a problem?"
**Answer to reuse:** no; older context is summarised; decisions, briefs, progress log and workflow journal live in files; agents keep their own memory; worst case, resume the workflow by run id.

### 1.11 Write a message for someone else
**Original (24 Jul 20:36):** "write a brief message for project manager about whats done." → "just write about: [one item]"
**Template:**
```
Write a brief message for [the project manager / the client] about what's done — only about [X].
```

---

## 2. Access, tokens and services

Read [20-security.md](20-security.md) Part A before using any of these; the safe patterns are there.

### 2.1 Push with a token and an author (the original habit; do it better)
**Original (14 Jul 2026 05:01):** "push to repo: https://github.com/<OWNER>/Assemble_Wireframes_Version_1 use PAT: <GITHUB_PAT> Author: <OWNER>"
**Achieved:** the push, but the token now lives in the chat. Better practice below.
**Template:**
```
Push to [repo URL]. The token is in [gitignored file path] as GITHUB_PAT — use it inline only, never store it, redact it from output. Commit author for this repo: [NAME] <[NAME]@users.noreply.github.com>. Verify the token with one API call before pushing.
```

### 2.2 Import a private repo
**Original (5 Aug 2026 03:05):** "can you import repo: https://github.com/<OWNER>/Assemble_UI_Version_1 — also Personal Access Token: <GITHUB_PAT> — Author: <OWNER>"
**Achieved:** Claude checked which account the token belonged to, listed the repos it could see, and asked which to import; three tokens later the clone worked; `origin` saved without the token.
> **For Claude — paste this:**
```
Import https://github.com/[OWNER]/[REPO] into this folder. The token is in [path] as GITHUB_PAT: use it only inline for the fetch; never write it to .git/config or any file. Commit author for this repo: [NAME] <[NAME]@users.noreply.github.com>. First check the token with the GitHub API (which user it belongs to, whether it can see the repo) and tell me if access is missing before trying anything else.
```

### 2.3 Fix a deploy blocked by the commit author
**Original (5 Aug 06:48, with a screenshot of the Vercel block):** "use pat: <GITHUB_PAT> — author: <OWNER>" · earlier (25 Jul 22:27): "no i meant use pat for github, vercel blocked reason on ss"
**Template:**
```
Vercel blocked the deploy (screenshot attached). Set this repo's git author to [NAME] <[noreply email]>, rewrite my unpushed/branch commits with that author, and force-push with a lease. Token inline only.
```

### 2.4 Clean commit from the agency
**Original (22 Jul 04:07):** "the commit has to be clean and it must say that it's from deeplearnhq dev team just like we did before okay. No readme file."
**Template:**
```
Squash to one clean commit authored as [AGENCY_AUTHOR] <[agency noreply]>, message "[message]", no README, and push. Show me the author and file list on GitHub afterwards.
```

### 2.5 Let Claude drive the hosting dashboard
**Original (28 Aug 2026 01:58):** "can i connect my vercel here so you do it for me automatically?"
**Achieved:** Claude explained token vs connector, asked for a 1-day token, then created three projects, linked the repo, triggered deployments, fixed build settings and moved domains via the API.
**Template:**
```
Can I connect [hosting provider] here so you do the setup for me? Tell me the safest way (short-lived token, scope, expiry) and exactly what you'll do with it. I'll delete the token afterwards.
```

### 2.6 Hand over repo and domain
**Original (28 Aug 01:50):** "Repo: https://github.com/<USER>/Assemble_Frontend_v1 — domain: assemble.ink"
**Template:**
```
Repo: [empty GitHub repo URL]. Domain: [domain]. Push, then give me the exact deployment steps (or do them via the API with the token in [path]).
```

### 2.7 Install a provider's agent skill and wire the service
**Original (28 Aug 04:16):** "Install the neon agent-skill using the `npx skills add neondatabase/agent-skills -s neon -s neon-postgres -y` command and follow the instructions in it to configure the neon cli, and mcp server, and agent skills. Then connect the application to project assemble (ID: <NEON_PROJECT_ID>) in Organization <ORG> (ID: <NEON_ORG_ID>), write my env vars, and wire up each Neon service my app uses."
**Achieved:** skills installed, CLI OAuth in the browser (you approved), project linked, env pulled into a gitignored file, schema pushed, seeded, routes switched to the database, env set on Vercel, a mutation proof run locally and on production.
**Template:**
```
Install the [provider] agent skill with [command] and follow its instructions to configure the CLI, MCP server and skills. Then connect this app to project [name] (ID [id]) in org [org] (ID [id]), write my env vars into the gitignored env file, and wire up each [provider] service the app uses. Prove it with a mutation round-trip (change a row → read the live API → revert).
```

### 2.8 Ask for a key walkthrough, then paste the key
**Originals:** "first tell me how to set up and get (Google OAuth Client ID/Secret + Resend key) · PostHog + Sentry keys. and workflow scope added to the PAT - push the CI file" (28 Aug 04:33) · "tell me first how to get key?" (28 Aug 11:09) · "<TRIPO_API_KEY> — but i didnt get any free credit it says its 0" (28 Aug 11:14)
**Achieved:** click-by-click guides; Claude verified the key against the provider's balance endpoint before building anything.
**Templates:**
```
First tell me exactly how to create and get [list of keys] — click by click, with links, what to paste where, and the mistakes people usually make.
```
```
[key is now in [env file] as [VAR]] — but [observation, e.g. the wallet shows 0]. Verify the key against the provider's API before building.
```

### 2.9 Elaborate a dashboard step; confirm a screenshot
**Originals:** "Resend is in sandbox mode … elaborate on how to do this?" (28 Aug 10:09) · "its like this right now. should i still configure?" + screenshot (28 Aug 10:13) · "please explain in detail step by step with links on how to do Google sign-in on staging: your side…" (12 Sep 21:34)
**Templates:**
```
You said "[quoted step]". Elaborate click by click, including the registrar side at [registrar], the exact value to paste, and a "still fails" section.
```
```
[Screenshot] This is what I see now — is anything left to configure?
```

### 2.10 Swap a key; check a balance; top up and go
**Originals:** "can you integrate this api key instead? [in env file]" (1 Sep) · "how many credits left for the tripo api?" (1 Sep 02:56) · "i topped up tripo credits - proceed to stage C" (28 Aug 17:08) · "billing enabled, it says paid now. …" (9 Sep)
**Templates:**
```
Switch to the new [provider] key in [env file] everywhere (local + [hosting projects]), remove the old one, redeploy, and run one verification call on [staging], then clean up.
```
```
How much [credit/quota] is left on the [provider] account? Check live, not from memory.
```

### 2.11 "What is this email?"
**Original (1 Sep 11:29):** "i will enable billing later but whats this i got?" + a CI failure email
**Template:**
```
[Screenshot of an alert email] What is this? Investigate and fix if it's on our side.
```

### 2.12 Hosting overview
**Original (15 Sep 21:50):** "where is our bbackend and front end hosted?"
**Template:**
```
Where is everything hosted? List front end, backend, admin, previews, database branches, storage and every third-party service, with which repo deploys where.
```

### 2.13 Client handover checklist
**Original (12 Sep 23:44):** "can you create an md file that will step by step insturction on how to for the client to be able to provide us everything we need form him. given that the github stay ours."
**Template:**
```
Create a Markdown file with step-by-step instructions (with links) for [the client] to provide everything we need to launch [app]: accounts, keys, domain, legal text, store accounts, payments. [GitHub/hosting/CI/database/monitoring] stay ours. Include who owns what and why, a checklist table with when each item is needed, a safe way to hand over keys (expiring secret link or phone, never chat/email), and what happens after we receive them.
```

---

## 3. Pre-build (coming-soon page, logo, 3D)

### 3.1 Deploy an exported design
**Original (9 Jul 2026 23:15):** "@"…\Assemble Coming Soon.html" i want to push and commit this in a repo so it can be deployed i will use repo: https://github.com/<OWNER>/assemble-coming-soon-page that is connected to vercel. it public repo, when u push the author should be DeepLearnHQ-Dev"
**Achieved:** file renamed to `index.html` at the root (Vercel serves it at `/` with no build), `.gitignore`, agency author, auto-deploy.
**Template:**
```
@"[path to exported HTML]" Push and commit this to [repo URL], which is connected to Vercel ([public/private]). Commit author must be [AGENCY_AUTHOR]. Rename to index.html at the root so Vercel serves it with no build step.
```

### 3.2 Precise visual bug with a screenshot
**Originals:** "can you fix this issue so assemble is always in one line and not in two lines as shown in picture the E goes to the next line." (9 Jul 23:37) · "the bottom of the screen there is something moving whats it called its doesnt feel smooth" (9 Jul 23:46)
**Templates:**
```
[Screenshot] Fix this so [element] is always [expected] — right now [what is wrong], on [device/width].
```
```
At [position on screen] there is [description of a thing you can't name] — what's it called, and why does it [feel wrong]? Fix it.
```

### 3.3 Honest taste question; restraint
**Originals:** "does this look and feel bland, please suggest, should we change colors?" (10 Jul 01:26) · "what can we do to give a more luxurious and premium look to this page. Nothing flashy!" (22 Jul 05:12)
**Achieved:** diagnosis plus 3–4 options with preview values, then a plan file and plan approval before edits ("not pushed — look locally").
**Templates:**
```
Does this look bland? Diagnose why in two lines, then give me [3–4] options with preview values (hex, sizes) and your recommendation.
```
```
What can we do to make [page] feel more [premium/luxurious/calm]? Nothing flashy. Plan first, ask me [3] questions, and don't push until I've looked locally.
```

### 3.4 Rebrand from a logo handoff
**Original (22 Jul 03:41):** "@"…\Logo slide design (1).zip" This is the new logo and selected colours and logo. I want the comingsoon website to be made using this and revamp it. create both light and dark mode"
**Template:**
```
@"[brand handoff zip/pdf]" This is the new logo, colours and fonts. Extract the exact tokens (hex, font weights, logo geometry) and save them to memory. Rebuild [page] using exactly these. Create [light / dark / both] mode. Verify on desktop, mobile and a short landscape viewport before committing.
```

### 3.5 Exact asset, no reinterpretation
**Original (22 Jul 04:50):** "no i want it to be exactly the attachment, dont make any changes."
**Achieved:** stopped Claude redrawing a favicon; the real file was saved to disk and resized with Pillow.
**Template:**
```
Use exactly the attached artwork, no changes. I've saved it at [exact path]. Resize/optimise a copy only; never redraw or hand-transcribe image data.
```

### 3.6 Reset intent when Claude over-builds
**Originals:** "what i am trying to say is to make it look brighter" (25 Jul 22:21, stopped an HDRI settings panel) · "add the easter egg but on this site not the [other project] one, that was just an example of how i want it" (25 Jul 22:11) · "please delete this, lets keep what we have" (22 Jul, after a WebGL aurora experiment added a second file)
**Template:**
```
Stop — what I'm trying to say is [goal in one sentence]. [The other project/file] was only an example of the look, not the target. Restate the goal in one line and confirm before building anything large.
```

### 3.7 3D showcase kickoff (product-designer mode)
**Original (25 Jul 2026 20:11):** "i want to make a website/web app in which i want to present 2 3d model categories. I have one asset added, how can we make this. be a product designer."
**Achieved:** three scoping questions, a read-only inspection of the GLB (header + JSON chunk), and a single-file Three.js viewer with a config block at the top.
**Template:**
```
I want a [website/web app] that presents [N] [thing] categories. I have [assets] in this folder. Be a product designer: inspect the assets read-only first, ask me the questions that change what you build, then propose and build a single self-contained HTML file with a config block at the top.
```

### 3.8 Match the look of the tool that made the asset
**Original (25 Jul 20:30):** "i dont like how it looks, i made this from tripo, and it looks better there with their dark bg. check screenshot i added"
**Template:**
```
It looked better in [the tool that made it] — screenshot attached. Match that look (background, lighting, no shine) instead of inventing one.
```

---

## 4. Wireframes (greyscale clickable prototype)

### 4.1 Critique a proposal, then define the deliverable
**Original (14 Jul 2026 02:30):** "@"…\proposal - assemble.pdf" so these are wireframes for a proposal attached, I want you to critically analyse it to find any gaps or issue this might have. lets plan first ask any questions before we proceed? App name is assemble."
**Your answer that redirected everything (14 Jul 02:56):** "not a report but help me create the final version that i can complete present to client, it called wireframes but its high fidelity but grey scale prototype, responsive to all screen size. see the zip folder attached. it's too black and white and i want it to be a bit greyscaled not sketch b/w color." / "you dont need the milestones or timeline or pricing, just the requirements to understand what the PWA is"
**Templates:**
```
@"[proposal.pdf]" Critically analyse this [proposal/spec] for gaps and issues. App name is [APP]. Let's plan first — ask me any questions before we proceed.
```
```
Not a report — build the final [greyscale high-fidelity clickable prototype] I can present to the client, responsive to all screen sizes, from [attached export]. Use the proposal only for requirements, not pricing or timeline. Visual tone: [notes].
```

### 4.2 Single file, consent everywhere, everything complete
**Original (14 Jul 03:34):** "take consent where needed and also see if this is complete also combine this into a single file so that it asks user what he wanna see user or admin and whichever is clicked is shown, with options to go back to selection screen. Also it has to look final so for example if i click on brand and affiliate partner it doesn't show details but just add and remove so i want every single thing like this to be complete, think of this as a final prototype that dev will use to create frontend and backend so everything needs to be complete."
**Template:**
```
Combine [apps] into one file with a launcher to choose [A/B] and a way back. Take consent wherever sensitive data is captured. Treat this as the final prototype developers will build frontend and backend from: every list item opens a real detail view, every button works. Example of what's not acceptable: [example].
```

### 4.3 Scope discipline and no meta language
**Original (14 Jul 04:02):** "make sure everything should be responsive to all screen sizes and see if now its complete and within the scope defined in proposal, no extra feature or info or stats etc that is not mentioned in proposal, but if its necessary keep it and add any missing screens if any, also i dont want this to have references like user app, wireframes, etc. viewer should only see what the end user can see on app or admin. so the header should be appropriate."
**Template:**
```
Check against [proposal]: nothing extra (features, info, stats) unless necessary, nothing missing (add missing screens). Remove all prototype/wireframe language — viewers only see what real end users would see. Responsive at every size.
```

### 4.4 "Remove means delete"; "don't show what you can't track"
**Originals:** "when i say remove i mean delete from code so it doesnt confuse the dev." (21 Jul) · "in the admin we are showing revenue made using affiliate, but we cannot track it as people might click buy not buy so we need to remove this cus of inaccurate data. can we do this?" (17 Jul 18:50)
**Templates:**
```
When I say remove, delete it from the code — dead markup in a handoff prototype gets built by mistake.
```
```
[Metric] cannot actually be tracked because [reason]. Remove it and any other number that implies tracking we don't have.
```

### 4.5 Logic, loops and real flowcharts
**Original (14 Jul 04:38):** "…i notice that this app doesn't remember context for example if i choose a preference it doesn't remember the preference and just shows the same screen, i want it to have logic. Also for instance it has no screen that shows what i got as a response on the shared items, and also sharing is not via message and also complete the flow for when user shares it with in-app friends and clicks on notification. please analyse it thoroughly and fix all these missing all over the project and the flow charts should be like actual flow charts rather than just text…"
**Template:**
```
The prototype must remember state: choices on one screen must drive later screens. Find every place this is missing and fix it. Complete the [feature] loop end to end, including [notification → destination]. Draw flow charts as real diagrams with decision points, not text lists.
```

### 4.6 Numbered mega-batch, then audit before adding
**Original (14 Jul 06:13, 17 items, abbreviated):** "Make the following changes: 1. …remove icons on each tile. 2. remove login with apple option… 3. I dont want any colored icons… 4. perfect the logic. 5. improve the mobile responsiveness… 6. the flowchart… has to be extremely detailed. 7. ad placements cant be seen… 8. complete flows on admin panel… 9. remove the small stats like 1.4% inc this week… 10. …every onboarding question could be edited later… 11. …pronouns… 12. …fix that logic and any other such logical gaps… 13. use icons only when necessary… 14. the bottom nav on mobile is not fixed… 15. …add 'made by www.DeepLearnHQ.tech for [the client]'… 16. …see all multiple shared looks… 17. make all logic appropriate so this is final and ready. do these and push. then we will critically analyse and verify that the work is done according to the proposal and that we don't have anything extra or less. and if there is any screen / detail page / pop-up that needs to be added you should find it and we can discuss before adding."
**Template:**
```
Make the following changes: 1. … N. … Do these and push. Then critically analyse against [proposal] for anything extra or missing (screens, detail pages, pop-ups) and bring me a list to discuss BEFORE adding.
```

### 4.7 Gap hunt beyond the proposal
**Original (14 Jul 20:17):** "Although not explicitly mentioned in the proposal I feel like these are missing: where do I see the outfits my friends are sending in app? How do I add these friends? what do u think? do we have any other such gaps? lets analyse carefully and thoroughly for such gaps and create a list of actions needed to be taken ok?"
**Template:**
```
Not explicitly in the proposal, but these feel missing: [questions a real user would ask]. What do you think? Analyse carefully for other gaps like this and give me a grouped action list (recommended vs optional) before building.
```

### 4.8 Long-term-user stress test
**Original (14 Jul 22:32):** "critically think of use cases for a person using this app for months and what he can do and stuff and check if the app allows, keep within scope of the app?"
**Template:**
```
Critically think through a person using this app for [months]: what would they do week by week? Check the app allows each step. Keep within scope; split findings into in-scope gaps and out-of-scope ideas.
```

### 4.9 Coherence between admin and customer app
**Original (15 Jul 06:30):** "lets do A - H. Also check if the admin panel is coherent with the user app and all features align and content too?"
**Template:**
```
Also check the admin panel is coherent with the customer app: every feature has its admin counterpart, and lists, prices, labels and ids match exactly.
```

### 4.10 Verification demands
**Originals:** "how else can we verify that it now complete and according to scope and not missing any screen?" (14 Jul 20:53) · "what are a few tests we can do to see if this is completed, and everything is present?" → "yes" (15 Jul 06:47) · "are you doing all these checks for admin interface as well right?" (14 Jul 22:55) · "1. Polish pass — final mobile/responsive sweep… 2. fix any bugs and see if every button is clickable and has complete flow, 3. also check if features are added appropriately and not just for looks but also serve their purpose…" (14 Jul 22:46) · "https://assemble-wireframes-version-1.vercel.app/ lets do #1 then #2" (14 Jul 23:05, #1 = verify the live deploy matches the latest push)
**Templates:**
```
How else can we verify it is complete, in scope and not missing any screen? List the methods, strongest first, and run the scriptable ones.
```
```
What tests prove this is complete? Then run them all as one acceptance sweep and give me a pass/fail table.
```
```
Did every check cover [the second app/role] too? Show evidence per check, and run whatever didn't.
```
```
Pre-ship QA: (1) responsive sweep at phone width, (2) every button clickable with a complete flow, fix bugs, (3) each feature actually changes state and serves its purpose, within scope.
```
```
[live URL] — first confirm the live deploy serves the latest commit (check markers only in recent changes), then [next deliverable].
```

### 4.11 Done list with purpose
**Original (21 Jul):** "at the end of this run give me clear task completed list so i can verify and also write the purpose of the task."
**Template:**
```
At the end, give me a clear task-completed table (# / change / purpose) so I can verify each item.
```

### 4.12 Explain before deciding; clarify a metric
**Originals:** "explain me how the ads and featured and brand and sponsorship and campaign work? do they have complete flows in admin and appropriately placed on the user app?" (15 Jul 07:33) · "when u mention coverage 98% what do u mean by that?" (14 Jul 21:55) → "since 2 percent is not included then dont mention it and dont give percentage to the coverage…" → "dont delete the genuinely-unbuilt rows, i meant only delete the ones that are not a part of current scope and things that will be completed in design mark them like that" (15 Jul)
**Templates:**
```
Explain how [feature set] works end to end, with a table of where each lever is set up in admin and where it shows in the user app, and whether each flow is complete.
```
```
What does "[metric]" mean exactly? [If it can read as incomplete to the client:] Don't show a percentage; label rows built / [to finish in design] / out of scope instead.
```

### 4.13 Branch rules and bug reports
**Originals:** "Since there are major changes i want you to use branching and after verified we will merge okay!" (21 Jul 02:43) · "Do these changes in the new branch, we are not merging yet." (21 Jul 03:49) · "Major bug. when i click on admin panel from selection it shows a blank even after (hard-refreshed preview)" (21 Jul 05:12 — pushing back forced the real layout bug to be found instead of blaming cache) · "i see blank screen now when i click admin panel from selection screen" (21 Jul 05:34) · "are we ready to merge?" → "merge" (21 Jul 06:15) · "lets delete the desktop responsive branch, i didn't like it!" → "delete those too for a clean repo" (22 Jul)
**Templates:**
```
Since these are major changes, use a branch; after I've verified the preview we'll merge.
```
```
I see [symptom] when I [exact steps from which screen] — even after a hard refresh in a private window. Don't blame cache; find the real cause.
```
```
Are we ready to merge [branch] into main? (Verify end to end first; tell me what I should click myself.) → merge
```
```
Delete the [branch] branch locally and on GitHub; I don't want it. Also delete any other fully merged branches.
```

### 4.14 A domain rule first, then the change
**Original (21 Jul 05:46):** "on admin panel: understand one thing campaign is not for a product but it takes user to brand page therefore remove the TYPE column in the Ads and Featured page… Also for new/edit campaigns pop up delete the dropdown for: Product (uses its image). also in New campaign / edit campaign add input for description: example ' Up to 30% off belts and accessories. '"
**Template:**
```
On [area]: understand one thing — [domain rule]. Therefore remove [X] from [screen], delete [control] from [modal], and add [field] (example: "[sample text]").
```

### 4.15 Discuss a behaviour change; reuse an existing pattern
**Originals:** "so i think in order to make this more user friendly I think wear today button should be interactive… what do you think? lets discuss before making any change?" (21 Jul 06:04) · "for the free user just like ads appear and for the subscriber ads disappear similarly lock the features saved looks, pack for a trip, surprise me. suggest best possible ways to do it, ask questions and lets discuss before implementing." (21 Jul 06:56) · "I want to remove the 3 free generations from the app as we are giving free 12 credits… update the choose a plan screen on user app and, on Credits and plans screen on admin panel…" (21 Jul 07:22) · "buttons in all modal should sit Full-width button … and can you think of any more Bonus fix?" (21 Jul 07:57)
**Templates:**
```
I think [feature] should be [behaviour] so [user benefit]. What do you think? Let's discuss before making any change.
```
```
Just like [existing pattern] works for [case], do the same for [new features]. Suggest the best possible ways, ask questions, discuss before implementing.
```
```
I want to change [business rule] to [new rule]. Update every screen in the customer app and admin panel that reflects it. Suggest the best way, ask questions, discuss before implementing.
```
```
[Change]. And can you think of any more bonus fixes (inconsistencies, stale docs, unrealistic demo data)?
```

### 4.16 Quote Claude's own summary back
**Original (21 Jul 06:42):** "YOU ADDED … two proper screens — Terms of Service and Privacy Policy — … BUT IT ALSO SHOWS BOTTOM NAV. IT SHOULD NOT SHOW BOTTOM NAV."
**Template:**
```
You said "[quote from your summary]" but [what is wrong]. It should [expected].
```

### 4.17 Keep a label true; walk me through a journey
**Originals:** "Keep 'Shop matches' but have it show items matched to the user's closet/style profile generally (not one outfit), so the 'matches' label stays true. do not mix this up with the shop match screen shown while matching an outfit…" (22 Jul 02:32) · "tell me match an outfit journey on user app." (24 Jul 20:19)
**Templates:**
```
Keep [label] but make it [true meaning]. Do not mix it with [similar existing flow]; build it as a separate set of screens.
```
```
Walk me through the [journey] in [app], screen by screen, with entry points and branches. Don't change anything yet.
```

### 4.18 Presenter script and placeholder imagery
**Originals:** "now help me i want to present this screen by screen so i want you to make a script for me a separate html file standalone that helps me explain every feature in detail, step by step way for both admin panel and customer app. can we do this? i meant dont miss any screen!" (21 Jul 01:37) · "can you analyse the whole project for placeholder images and then give me a prompt that has a grid of all needed placeholder icons in greyscale that we can use just for demonstration, currently it looks awkward to have empty placements. once i generate this grid image with your prompt, lets make a branch for this separately and test it live. okay?" (15 Jul 06:56)
**Templates:**
```
Make a standalone HTML presenter script that explains every screen step by step for [apps]. Generate it from the source so you can prove no screen is missed.
```
```
Inventory every placeholder image in [project] and write me one image-generation prompt for a sliceable grid of all needed [style] icons. Create a branch now; once I give you the image, slice it, wire each placeholder by context, push the branch and we test the preview before merging.
```

### 4.19 Client-facing modules document
**Originals:** "the client want to add a few features… before we do that we need a additional modules document… I have a list of features that client want and also a list that i need to suggest… discuss each features with you… I will give this content to [design tool] to create final copy. Understood?" (26 Jul 19:35) · "i'd suggest that you rethink carefully about what the app is and then rewrite your suggested list." (26 Jul 20:57) · "in the document I want to include a table to prices, it has to be exact… choose the lowest amount+1000 in the ball park…" (26 Jul 21:49) · "i dont want it to include the pricing on each module description - it should feel like a reveal at the end… we dont need to mention complexity. this is for the client and not for the developer so make it in that tone." (26 Jul 22:45) · "create another uncommitted md file as instructions for us to use and update wireframes given the client choose to add any module" (26 Jul 22:55)
**Templates:**
```
We need a [document] describing [items]: purpose, where each fits in the current [product], how it's incorporated, and pricing. I'll discuss each item with you one at a time; you prepare structured content; I'll hand it to [design tool] for final copy. Understood?
```
```
Rethink carefully what [product] is (its core loop and business goals), then rewrite your suggestion list.
```
```
This is for the client, not developers: remove [internal fields], move pricing to a reveal at the end, plain client tone. Any questions?
```
```
Create an uncommitted internal .md with instructions for us to build any of these [modules] into [prototype/app] if the client picks them.
```

### 4.20 Feature kickoff on a review branch
**Original (4 Aug 2026 02:48):** "THE CLIENT JUST GOT THE Personal 3D Avatar feature and rest were rejected. I want to create a separate branch so that i can review it first before any commit to main. We will be using [3D API] so set the inputs accordingly and also please lets discuss first where do we have to add this and how. so dont write any code ask me at least 10 questions to understand properly." → "ask me like one by one with multiple choice"
**Achieved:** a vendor constraint surfaced before design (the engine rebuilds the person as photographed), 13 single decisions, a consolidated spec, then "Yes, build it on the branch".
**Template:**
```
The client approved [feature]. Create a separate branch so I can review before main. We'll use [vendor API], so shape inputs to it and tell me any vendor constraint before we design. Don't write code yet: ask me at least 10 questions, one by one, multiple choice, recommended highlighted.
```

### 4.21 Backup repo; publish a branch
**Originals:** "can we publish this branch on a subdomain?" (4 Aug 03:30) · "I want this branch to be pushed in this repo as a back up. https://github.com/<USER>/Assemble_Wireframes_Version_2" + "if i push only this branch then will it not have previous code?" (4 Aug 04:14)
**Template:**
```
Push [branch] to [backup repo] as its main (a branch carries all prior history, right?). Keep the original repo unchanged. Then tell me how to give the branch preview its own subdomain.
```

### 4.22 Manual-test bug report (the best format)
**Original (5 Aug 2026 01:13):** "In the customer app, after logging in, go to Saved Looks and open a look that includes a generated 3D avatar. Tap View 3D Generation, then press the back button. Instead of returning to the selected saved look, it redirects to the My 3D Avatars screen. The back button should take the user back to the saved look they opened."
**Template:**
```
In [app], after [precondition], go to [screen], open [item], tap [control], then [action]. Instead of [expected], it [actual]. It should [expected].
```

### 4.23 Copy audit question
**Original (5 Aug 02:26):** "It says we send receipts via email?"
**Template:**
```
Does the copy anywhere promise something we haven't decided or built ([example])? Remove or reword every such promise.
```

---

## 5. Branded UI (single-file prototype rounds)

### 5.1 Hand over brand assets
**Original (5 Aug 03:26):** attached the logo PDF, the coming-soon `index.html`, its `.gitignore` and settings, and the 3D scan — with no other text.
**Template:**
```
@[logo file] @[existing brand page] @[3D/other assets] — extract the full brand system (colours with hex, fonts with weights, logo usage, animation, voice) and save it to memory. Note any asset that opens a new possibility (e.g. a real 3D model).
```

### 5.2 Should we add skills?
**Original (5 Aug 03:30):** "would you search the internet for any skills we can use? or should we not"
**Achieved:** a researched "install nothing" answer with the local skills mapped to the work.
**Template:**
```
Search for Claude Code skills that would help with [task]. Compare with what's already installed and recommend whether to install anything (default: don't, if we're covered).
```

### 5.3 The 20-question UI round (the contract)
**Original (5 Aug 03:33, sent three times):** "Ask at least 20 questions to understand discuss the UI and take decisions together, got it? ask one by one and give multiple choice options to select from and highlight the recommended by you."
**Achieved:** 30 decisions in 37 minutes (theme, motion engine, glass, dock, generation moment, PWA, guardrails…), then a single design brief and image prompt pack.
**Template:**
```
[Describe the changes or goal.]
Ask at least [N] questions to understand, discuss and take decisions together. Ask them ONE BY ONE, multiple choice, and mark the option you recommend with a one-line reason. After the last answer, summarise all decisions, then build everything, verify in the browser, and [push to main / keep local].
```

### 5.4 Start with placeholders; wire assets later
**Originals:** "start the build now with styled placeholders" (5 Aug 06:23) · "i would like to add the placeholder images and images used to create the 3d avatar. is that possibl?" (5 Aug 17:39) · twelve file paths pasted with no other text (5 Aug 22:18)
**Templates:**
```
Start the build now with styled placeholders; use the final filenames from [brief] so real assets drop in later with zero code changes.
```
```
I generated the images from [brief] — they're in [folder]. Slice/convert them to the brief's filenames, wire them in, verify every surface, and push.
```

### 5.5 Change requests with a reference
**Original (5 Aug 06:58):** "on the login pages cant we have the moving logo, also for the 3d avatar - its too shinny , can you make it have the same setting as the website it was on: i have attached files. Ask at least 6 questions…"
**Template:**
```
[Change 1]. [Change 2] — make it match [reference] (files attached). Ask at least [N] questions, one by one…
```

### 5.6 The long product-thinking brief
**Original (5 Aug 20:06, shortened):** "When you open the user app and tap the 3D Avatar button … the avatar image there is displayed in a landscape-style frame. Can you please change it to a portrait layout so the full 3D avatar is visible from head to toe … Please apply this consistently across the app… During onboarding, we currently ask the user to upload a profile picture … I think we should ask them to upload a clear, full-body photo from head to toe instead… the generated result should show the user actually wearing those selected items… allow users to upload multiple angles of their closet items … Front image … Back image … Optional left-side image … Optional right-side image … This should remain optional and not make the upload process too heavy… Ask at least 30 questions…"
**Why it works:** it states the *purpose*, the *principle* ("apply consistently wherever…"), and required vs optional.
**Template:**
```
Change [screen] from [current] to [desired] and apply it consistently wherever [element] appears, including [list]. The goal is [purpose]. Required: [X]. Optional: [Y] — keep it light. Ask at least [N] questions…
```

### 5.7 The punch list from a real click-through
**Originals (5 Aug 22:32; 6 Aug 01:38 with 18 items; 6 Aug 03:42 with 13 items):** "On user app when i add something to closet it says after first image … AI detected: … I want this ai detection to be a paid feature. Also the button and selections look the same… during onboarding where it shows the 3D avatar … It should show the actual 3D avatar… the last onboarding screen for sharing. Delete that. … recent outfits … should be portrait… when trying to add friends, as you type the username, it would auto-populate… the detail page does not show the right image… a lot of things that we click on … do not show the right information. Would it be possible for us to maybe add custom screens for each options? Ask at least 40+ questions…"
**Achieved:** rounds of 47, 67 and 31 decisions; data-driven screens instead of cloned screens; each built and pushed in 15–20 minutes.
**Template:**
```
Here's what I noticed clicking through [app]: 1) [issue] 2) [issue] … For each, propose the fix and look for the same problem elsewhere in the app. Ask at least [N] questions, one by one… then build all, verify, push.
```

### 5.8 Extend the round from the last answer
**Originals (typed into the delivery question's "Other" box):** "also Get started with assemble, can be made interactive? Ask at least 7 more questions … then build all verify and push main" (5 Aug 23:40) · "i want you to go through each icon one by one with me… also i want the nav menus side and bottom to be animated. Ask at least 5 questions…" (6 Aug 02:27)
**Template:**
```
[Answer to the delivery question]. Also: [new scope]. Ask at least [N] more questions, then build all, verify and push main.
```

### 5.9 Correct the product model in one sentence
**Originals:** "there are 2 types of avatar one is 2d image and one is the 3d avatar, the 4 pictures are only for the 3d avatar generation … during onboarding we are just introducing our 3d avatar feature." (5 Aug 19:42) · "this is not a per every subscriber pays for detection." (5 Aug 22:42) · "swap is manual but after swaping there should be a way for user to generate the swapped look and thats 1 credit." (6 Aug 02:07) · "3d heart with no ring but please where ever there is a ring - the ring should say assemble like we have on the logo." (6 Aug 02:31)
**Template:**
```
Correction to the model: [one-sentence rule]. Carry it into all later work and save it to memory.
```

### 5.10 Grid prompts for AI image generation
**Originals:** "can you give me a (Optional round 2) prompts that would help me generate these pictures in a grid all together? Ask at least 4 questions…" (6 Aug 00:53) · "give prompts to generate a grid of these icon and make it so that in the grid bottom right corner tile is empty." (6 Aug 01:38) · "when i use this prompt it creates icons and the ring on those icons should say assemble just once, like our logo" (6 Aug 05:24)
> **For Claude — paste this:**
```
Write one copy-paste prompt per sheet for [generator] to make a [rows]x[cols] grid of [items]. Shared style paragraph first (backdrop hex, lighting, stroke/scale consistency, no logos/watermarks). Then a numbered cell map. Print each cell's filename under it in small white text. Leave the bottom-right tile(s) EMPTY. At most 9 cells per sheet for fidelity. Save the prompts in [brief file]. [Any rule that must be stated explicitly, e.g. "the word appears EXACTLY ONCE per ring; the rest of the ellipse is a plain line, never repeated as a pattern".]
```

### 5.11 Finish a dead button; protect a choice; clarify a screen's message
**Originals:** "complete the move to other collection feature/button. Ask at least 3 questions…" (6 Aug 06:20) · "I dont want to change the closet icon and here is the grid attached. also on home screen there is a match an outfit section with an icon, why is it not same as the hanger one we made? why? lets change that to the hanger one" (6 Aug 07:05) · "i want to rename 'Use my whole closet' to something else so give me options also the match an outfit screen need to be designed in a way that it feels like there are 3 options… basically is more like rearrange the item in the screen so our message is clear to the user using the app. Ask at least 10 questions…" (6 Aug 07:38)
**Templates:**
```
Complete the [feature] button — it's dead right now. Make it truly change state (counts, lists) like everything else. Ask at least [N] questions…
```
```
Never change [element] again — record that. And why is [other element] not using [the agreed asset]? Change it.
```
```
[Screen] must make it clear there are [N] distinct ways to [do the thing]: 1. … 2. … 3. … Rearrange the screen so the message is obvious; give me naming options for [label]. Ask at least [N] questions…
```

### 5.12 Make the method reusable
**Original (19 Aug 2026 21:43):** "so now i want to make such a ui for another application that i have and i love how this ui looks and behaves. i want you to be able to give me an md file for a new session that help me build ui for another app, i dont have wireframes for it and just the proposal. mention all skills used and everything else require to be able to make this for the new app?"
**Template:**
```
Write a self-contained .md playbook a fresh session can follow to build [the same quality thing] for a new app that only has [inputs]. Include process, architecture, design system, asset pipeline, skills per phase, pitfalls, verification checklist, and a paste-ready bootstrap message.
```

---

## 6. Full-stack frontend

### 6.1 Tech-stack decision round
**Original (21 Aug 2026 11:15):** "hey can you suggest what would be a good tech stack for assemble? and also guide me how should we decide the tech stack - what to consider - Ask at least 15 questions to understand discuss so we can take decisions together, got it? ask one by one and give multiple choice options to select from and highlight the recommended by you."
**Useful follow-ups typed as answers:** "what tech stack does trippo ai uses?" · "if we use next js plus react and typescript do you this stack can be converted to ipa or apk file easily?" · "we currently have login/signup with email and gmail in the app and then an otp is send if user adds email. so how will this be managed on frontend?" · "what would be required to connect google auth?" · "lets take phase 2 decisions once front end is complete but if there a pre req we can discuss that" · "can you explain this question as if i am 15 year old"
**Template:**
```
Suggest a tech stack for [app] and teach me how to decide (what to consider). Ask at least [N] questions one by one with recommended options. Defer decisions that don't block yet, but lock their prerequisites. Then write the decision doc into the repo with a "why" per choice and "check for newer versions first".
```

### 6.2 Build a phase locally with screenshot verification
**Original (21 Aug 11:52):** "ok lets start step 1 - set up the monorepo and frontend complete everything in one go all rounds then verify everything by taking screenshots. i want you to not push anything but make a new folder locally called front end and store everything there as independent front end component. once you complete all round take screenshots of every screen and verify and look for even the slightest mistake and fix it and then verify again and complete to perfection the step 1. understood? read everything you already have first so you have proper context of everything before starting. remember to keep everything locally first."
> **For Claude — paste this:**
```
Start [phase]. First re-read [spec files / prototype] for full context.
Build everything in one go inside a NEW local folder [folder] — do NOT commit or push anything.
When done: build every app, take a screenshot of EVERY screen (mobile + desktop), inspect each image for even the slightest mistake, fix, then re-shoot and verify again until zero defects.
Also run an automated check: console errors, page errors, horizontal overflow at 375px, and the key money/gating flows.
Report what you found and fixed, and how to run it.
```

### 6.3 Run it locally; discuss the monorepo and subdomains
**Originals:** "lets run it. locally" (28 Aug 01:05) · "yes windows has reduced motion so i will test it on different, on live vercel but before can you tell me if this folder frontend is a mono repo and can we add another like 3rd part of this repo - the coming soon website and them publish in a new repo link i will make on github and then how can we deploy this as sub domains lets discuss" (28 Aug 01:36)
**Templates:**
```
Run [apps] locally, open them in the browser pane, click through the main flows and fix anything that errors in the console.
```
```
Is [folder] a monorepo? Can we add [existing site] as another app, publish to a new repo I'll create, and deploy each app on its own subdomain of [domain]? Let's discuss before doing anything.
```

### 6.4 Exact visual copy; two bugs with steps; parity
**Originals:** "the logo on assemble.ink and the logo on the app.assemble.ink login pages is different can you make the logo on app.assemble.ink login pages to be exact copy…" (28 Aug 02:38) · "the logo ring on assemble.ink has assemble written twice inside and logo ring on the app login pages has just 1 assemble written. also since these are PWA. It should also prompt the user to install…" (02:51) · "if the app is already installed then the user opens it in browser and tried to click install - it says … 'install isnt available…' but instead it should say already installed. I also feel like the app is more stucking in loops like if i press back on /shared/detail it goes to /shared and when i press back button again on /shared it goes to /shared/detail." (03:23) · "reinstalled and it works… why doesnt the admin installs as user? cant they behave similarly?" (03:35) · "ring matches. Regarding [the install card]: card looks and behaves perfectly but instead of Custom button in Settings place it in profile screen and home screen." (03:07)
**Templates:**
```
The [element] on [page A] differs from [page B]. Make [page B]'s an exact copy — same size behaviour, geometry and animation. Verify side by side with screenshots, then ship.
```
```
Bug 1: when [state], doing [action] shows [wrong text]; it should [expected]. Bug 2: pressing back on [route A] goes to [route B], and back again returns to [route A] — a loop.
```
```
Confirmed [fix] works. Why doesn't [app 2] behave like [app 1] for [feature]? Make them consistent.
```
```
[X] confirmed fixed. [Component] looks and behaves right, but move it from [A] to [B] and [C].
```

### 6.5 Live test feedback on a feature
**Original (28 Aug 03:16):** "lets test the 3d avatars on live app - i feel like they are too shiny and we didnt implement the matt texture like we had in UI instead of this shiny one. i also noticed that the movement is a bit buffering but i see that the avatar on the onboarding screen is fine."
**Template:**
```
On the live app, [feature] looks [problem] compared with the prototype, and [performance issue] — but [place where it's fine]. Find why and match the prototype (port it if needed).
```

### 6.6 Parallel work while you set up a service
**Original (28 Aug 03:52):** "yes start with 3 and 4, i will set up neon meanwhile just tell me how?"
**Template:**
```
Start on [items that need nothing from me]. Meanwhile tell me step by step how to set up [service] and what to paste back.
```

### 6.7 Product-behaviour question; accept polish
**Originals:** "tell me one thing so for those who have already installed the app and after this push will they get the latest version or not? do they have to reinstall? can we send prompt to reinstall?" (28 Aug 10:18) · "I want the update-toast as polish" (10:21)
**Template:**
```
Will users who already [installed/used] get the latest version after a push, or must they [reinstall]? Can we prompt them? If a small polish would help, propose it.
```

### 6.8 Scope round for CRUD, admin and an external API
**Original (28 Aug 10:43):** "How much of the database is built? can we add all CRUD based operation in step 1? so it remembers user wise data and user app is responsive to the admin setting or configurations and No complex backend logic implemented (leave complex backend logic for next step) or apis yet but just simple CRUD based operations to be done? also can we connect tripo api in step 1? I can provide api now. when a new account is created i want it to feel like the app has started from scratch. Ask at least 20 questions…"
**Achieved:** a 24-question round → a committed scope doc → three staged deploys (A foundations, B social + push + demo reset, C storage + 3D).
**Template:**
```
How much of [layer] is built? Can we add [scope] now so that [user outcome] and [admin outcome], without [excluded complexity] (that's for the next step)? Also can we connect [external API]? When a new account is created I want [feeling]. Ask at least [N] questions, one by one… Then write the decisions into a committed scope doc and propose staged deploys.
```

### 6.9 Fix list before the next stage; unblock and go
**Originals:** "for the demo path (empty login fields) still walks straight in via the demo cookie. I want the empty fields to be prefilled. I also noticed that for free subscriber the save in the bottom nav should be closed… before you move forward - except for the seed demo data delete all other users and their accounts/data. for admin: … change email to <ADMIN_EMAIL> for otp. after this proceed to stage B" (28 Aug 16:25) · "i topped up tripo credits - proceed to stage C" (17:08)
**Template:**
```
Before stage [next]: 1) [UX fix] 2) [gating fix] 3) delete all users except the demo and their data 4) change [setting] to [value]. After this proceed to stage [next].
```

### 6.10 Bug batch from a phone test plus a big round
**Original (28 Aug 18:00):** "the back function on the user app from snap a picture is not working properly as i clicked on front photo in creating 3d avatar add your photo screen and when i pressed the camera button to take photo it took me to match an item/add to closet screen… also can we add the visibility icon in the passwords… when a picture is added it should fit to size of its container and shouldnt crop any part of it. Also the saved option in bottom nav should have the plus tag if user is not subscribed… The fav icon from push notification seem to be wrong - shows a white square… the admin panel doesn't show accurate info like the dashboard shows 312 signups - what up with that? Ask at least 25 questions…"
**Mid-round additions in "Other":** "Yes uniform chips and Also while the avatar is being made make it some way if user select continue in background he is still able to see the processing in my 3d avatars" · "One combined deploy and I made a 3d avatar in my account and i pressed continue in background and then I never got to see the final 3d model… also the 3d model consent and default avatar screen should be a one time thing"
**Template:**
```
Issues from my phone test: 1) [flow bug with exact steps] 2) [small feature] 3) [visual rule] 4) [gating marker] 5) [icon problem with exact symptom] 6) [data accuracy problem with example]. Ask at least [N] questions, one by one…
```

### 6.11 Proceed with external settings; pause; doubt the quality
**Originals:** "proceed to step 2 and we need the 3d avatar to be built in these settings attached in picture and also when its complete it should be in the matt texture that we usually have. Ask at least 5 questions…" (28 Aug 20:18) · "let not do step 2 now. please stop step 2 for now." (20:27) · "i feel like the api is not making high quality 3d avatars." (22:09 — Claude diagnosed via the engine's task records and an A/B render before changing anything; the viewer, not the engine, was at fault) · "the avatars look good now. but two existing avatars were rotated in place i don't see them rotated please rotate them for all users." (29 Aug 09:40)
**Templates:**
```
Proceed to [step]. [Feature] must use these settings [screenshots of the provider's studio], and the result must keep [existing visual style]. Ask at least [N] questions…
```
```
I feel [external API] isn't producing [quality]. Diagnose first — check what it actually received and returned, and A/B the real asset — before changing anything.
```

### 6.12 Clean the database (with a round)
**Original (1 Sep 02:40):** "can you clean database so it has no users other than the demo one? Ask at least 5 questions…"
**Template:**
```
Clean [database] so only [what to keep] remains. Ask at least [N] questions first (files in storage, related content, admin config, what future test runs do).
```

### 6.13 New clean workspace for the next phase (key prompt)
**Original (1 Sep 2026 04:19):** "before starting step 2 i would want you to make a new folder locally call backend and then in the folder copy everything from front end and then we will do step 2 there and keep the front end folder and repo as backup and so i will give you new repo for backend folder. first make everything locally and dont mention that this is written by claude we need to present it to client. i also wanna keep neon and not switch to supabase. every change goes through the full pyramid verification and playwright e2e etc to test. Before we proceed, ask me at least 5 questions…"
**Achieved:** the backend folder, a full attribution sweep, a fresh single-commit history, a new repo, a staging DB branch and staging hosting projects, pyramid green.
**Template:**
```
Before starting [next phase], make a new local folder [name], copy everything from [current folder] into it, and do [phase] there; keep [current folder] and its repo as backup. I'll give you a new repo. Build locally first. No mention of AI authorship anywhere — this is presented to the client. Keep [DB provider]. Every change goes through the full test pyramid and Playwright e2e. Before we proceed, ask me at least [N] questions…
```

### 6.14 Long autonomous run; never cut over
**Originals:** "proceed to part B and all part, keep testing your self and complete the whole app without stopping." (1 Sep 06:00) · "never switch. switch wont be done like that so that something i ll tell you later" (1 Sep 06:05)
**Templates:**
```
Proceed to [part] and all remaining parts. Keep testing yourself and complete the whole [app] without stopping. Never touch production.
```
```
Never switch [production] on your own. The switch will be done later, when I say so.
```

### 6.15 Scoped repo-only change; device-specific bug; retest result
**Originals:** "can you set it up in the frontend repo only that it sends the otp code to this email as well: <CC_EMAIL>" (1 Sep 16:41) · "i faced an issue with the front end build we made the in-built browser wasn't able to install the app not sure why but when chrome was used it worked fine. i have screenshots as well. [round, 5]" (1 Sep 17:17) · "On samsung internet Play Protect still blocks it. screenshot added - it marking it as unsafe is very bad for business. the coming-soon page and app: the whites on the "A" and wordmark doesnt look properly white now but when i switch to light mode it was all good. i want you to configure it in a way that its always white regardless of phone dark/light mode settings. [round, 5]" (1 Sep 18:32) · short overrides: "i want the fix it", "nopes i dont want a play store app", "Ship both repos now", "lets do frontend first - i ll test it manually and then if it works we can implement on backend as well."
**Templates:**
```
In [repo] only, make [message type] also go to [recipient]. Keep it configurable (env), nothing hardcoded.
```
```
Retest on [device/browser]: [fix 1] still fails [screenshot] — [business impact]. [Fix 2] still wrong in [mode] but fine in [other mode]. I want [absolute requirement] regardless of [setting]. Ask at least [N] questions…
```

### 6.16 Identity bug with a fallback rule
**Original (2 Sep 21:41):** "for the front end part we made - can you check that profile photo isnt right like for the demo and my account i see the same profile pic. if i login with gmail it should get my picture too and if there is not profile picture added then it should be users initials written. also the email i see for demo profile is same as mine. [round, 10]"
**Achieved:** Claude inspected the code first so the questions were grounded in real root causes; the real bug was a browser-session fallback, not seed data.
**Template:**
```
In [repo], [element] is wrong: [observed]. Expected: [rule 1], then [fallback rule]. Also [related data leak]. Inspect the code before asking. Ask at least [N] questions…
```

---

## 7. Backend

### 7.1 No-code explanation of how something really works
**Original (10 Sep 01:42):** "dont write any code but tell me: tell me one thing do we have a shop in the backend with a demo inventory? and how does the share outfit and 3d avatar work when someone copies link and share?"
**Achieved:** an honest "there is no public share link at all; the 3D share shows a placeholder model" that led directly to the next feature round.
**Template:**
```
Don't write any code, just tell me: how does [feature] actually work today when [user action]? Be honest about what is fake or missing.
```

### 7.2 Bug reports with a testing instruction
**Originals:** "i tried match a closet item, what i got didnt include the closet item at all. also when i tried changing profile photo from the style and preference screen in profile. it took me to match outfit camera. [round, 5]" (10 Sep 00:22) · "i added a black image in closet and the ai detected it as plain black surface and is trying to style and match for it. this is a bug. every photo uploaded for the closet must be checked, right? i was using the demo account. also getting this error attached in pic when tried login with google. also i shared everyday look and copies link and pasted in browser and it showed clean and sharp instead. [round, 10]" (11 Sep 21:38) · answer: "1 your recomended choice and think of other such senarios too so that adding clothes to closets are very accurate and bugfree."
**Achieved:** ten refusal kinds instead of one patch; a hard server rule for the required item; the Google callback fix on your side.
**Template:**
```
I did [steps] on [account] and got [wrong result]; expected [right result]. [Screenshot attached.] Think of other similar scenarios too so [flow] is accurate and bug-free. Ask at least [N] questions…
```

### 7.3 Apply an existing rule elsewhere
**Original (12 Sep 21:58):** "uploading photos for the 2d avatar should also be checked if its correct image or not. free of charge as user uploads picture it should only accept only the appropriate photo. ? [round, 5]"
**Template:**
```
[Other upload/flow] should also be checked like [existing check], free of charge, accepting only appropriate [photos]. Ask at least [N] questions…
```

### 7.4 Returning-user reasoning bug
**Original (12 Sep 21:45):** "I logged in with google and used my [work email] and it recognised me as the returning client then why did it ask me your style screen then Sizes and budgets screens then your 2d avatar and then new your 3d avatar - because i think these screen should be shown if i login for the first time but second time and onwards it should not show…"
**Template:**
```
When I [log in again], it showed [new-user screens]. These should only show the first time. Fix so returning users go straight to [Home], and tell me the rule you'll use to decide "returning".
```

### 7.5 Zero gaps (make everything real)
**Original (10 Sep 2026 03:12):** "i tried and the staging look didnt work. I also feel like the ai render changes the clothes a little bit. also when it shows to compare to looks after outfit matching is used it shows the images of clothes in the box for both outfits instead it should show the actual rendering, and also if user exists before saving he is prompted that he will lose the generated outfit. i want the backend to have zero gaps and every thing should be function in app and admin both. i want it to be perfectly ready for the users and only thing to leave behind in the payment. Before we proceed, ask me at least 50 questions…"
**Achieved:** a code audit of every fake control (31 toast-only controls, 22 client-only toggles, 17 fixture leaks, 13 placeholder modals, 20 unwired admin controls, 11 false promises, 9 roadmap strings), the "every control works for real or is removed" rule, 50 decisions, `LAUNCH-READINESS.md` with rows tied to tests, five parallel build agents, one verified push.
**Template:**
```
[List of bugs seen.] I want [app/admin] to have zero gaps: every control must work for real in both [app] and [admin], ready for real users; the only thing left behind is [payments]. Audit the code for fake controls first. Before we proceed, ask me at least 50 questions…
```

### 7.6 Audit plus features grab-bag
**Original (11 Sep 01:24):** "i feel like the demo closet data doesnt have the details of occasion tags and how its made. also I feel like if we give option to user for how its made section he might get over whelmed, how can we fix that. also can you do a clean audit and see if anything is still left to be done or if something is not functional in the app or admin. also I want to add more prebuild categories to the closet. also does the shop data is correctly shown and added and deleted from admin and also I want admin to be able to provide users with a shop items. furthermore if you think there is anything left to complete in the admin or user app, lets do it now? [round, 50]"
**Template:**
```
[Observations.] Also do a clean audit of anything left or non-functional in the app or admin (fix as you go; only product decisions come back as questions). [Feature asks.] If anything else is left to complete, let's do it now. Ask at least 50 questions…
```

### 7.7 Scope guard
**Originals:** "i will go with your recomendation only think i want to highlight that nothing gets changed in frontend repo and the assemble.ink urls remain for frontend and everything backend related stays on stagging for now" (10 Sep 04:06) · "demo isn't for actual user and only for dev testing and presentation purposes so no need to do any thing keep it as is" (10 Sep)
**Template:**
```
Nothing changes in [the live repo]; [live domains] stay on [live build]; everything new stays on staging until I say so. The demo account is for development and presentations only — leave it as is.
```

### 7.8 Production data clean-up
**Original (10 Sep 23:30):** "from the frontend data can you remove/delete the users [name], [name], [name], [handle]"
**Achieved:** exact matches shown first; the desktop safety check blocked the destructive run until you chose "Run it now"; the script was made schema-aware; remaining accounts listed afterwards.
**Template:**
```
From [environment] data, remove these users: [list]. Show me the exact matches first and ask before deleting anything. Delete their storage files too.
```

### 7.9 Small rename with side effects
**Original (13 Sep 11:27):** "can we change the demo profile name from [the client's name] to demo user ?"
**Achieved:** Claude searched every place the identity lived (database, reset script, login page, docs) because the nightly reset would otherwise restore the old name.
**Template:**
```
Change [demo/test identity] from [old] to [new] everywhere, including anything that recreates it (seeds, nightly resets, production cutover notes). Use a reserved domain (example.com) for its email.
```

### 7.10 Targeted fix without the long suite
**Original (17 Sep 01:59):** "i want to discuss a render that ai stylist made. it used an tshirt halfsleevs on top of a long sleeve one and both of them didnt render properly. how can we fix this? and dont play the whole 2.5 hour long suite . [round, 5]" · answer: "ye i will go with option 1 and also i noticed that i had a watch in my 2d avatar and now the rendered looks shows that watch without it being a part of the outfit. how can we fix that too?"
**Template:**
```
I want to discuss [AI output problem]. How can we fix it? Don't run the full [N]-hour suite: targeted tests plus one real check on staging; the full suite runs in CI. Ask at least 5 questions…
```

### 7.11 Batch messages with per-item question counts
**Original (16 Sep 01:47, one message, five sub-requests):** "[admin notifications / OTP lock / broadcast history / profitability — ≥20 questions] … i also tried to adding a pyjama/pants that cannot have a belt - meaning as no place for a belt to be used no notches - and when i saved and matched it showed me a belt worn on my pyjama/pants. [round, 5] … do we need so many onboarding questions like size waist etc etc are these used anywhere ? can we remove any? [round, 15] … remove margin this month from admin dashboard"
**Template:**
```
Batch: (1) [feature area] [round, 20]; (2) [bug as observed] [round, 5]; (3) [is this collected data used anywhere? can we remove it?] [round, 15]; (4) [one-line direct change, no questions]. Run the rounds in sequence, then propose consecutive pushes.
```

### 7.12 Batch 3 — multiple observed issues from phone testing
**Original (16 Sep 21:58, abridged):** "I tried changing the style and categories from the admin like i added style tag and i removed a pronoun but it didn't reflect/change on the app. also i logged in with gmail with my account and then i created a new account with the same email i recieved an otp code and it started the onboarding process but on dashboard i could see that this is not a new account… only one gateway should be allowed. when outfit 2d or 3d is share with friend or on the link - it shows pieces 4 to buy. I don't want receivers or sharer to see that. also when a link is made and i click on copy link - it doesnt copies to clipborad. I suspended an account and then… it said your loged out and login with account or demo account. it shouldnt mention demo accounts, it should say that account is suspended and logout user automatically… in the admin for ai call in dashboard there is a line graphg on top of a bar graph… on uers home page i want the recent generation section to go at the bottom… [round, 15]"
**Template:**
```
From phone testing: (1) [admin setting doesn't reach the app]; (2) [auth edge case + desired rule]; (3) [sharing privacy + broken button]; (4) [account state messaging + desired modal/contact]; (5) [chart change + date range]; (6) [layout order]. Ask at least 15 questions…
```

### 7.13 Mobile packaging questions
**Originals (10 Sep):** "just a question can we make an apk and ipa file for this?" · "can you give me a TWA (Trusted Web Activity) … for the assemble backend? just for testing" · "whre is it in local so i can copy and share?" · "so realistically if we have these ipa and apk can be used to publish this app and they will have no issue with it?"
**Template:**
```
Can we package [app] as APK/IPA? Give me a TWA test build pointing at [staging] only (keystore kept outside the repo). Where is the file, and what would store publishing still need (billing rules, accounts, review risk)?
```

### 7.14 Model switch and usage planning (backend rounds)
**Originals (16 Sep 02:44–02:47):** "not a day apart but consecutively and before you start can we do this in opus?" · "befor you start anyhting and it would perform perfectly becuase i dont think i have enough fable credits can you estimate? and also can we change mid way? is changing now better or mid way better?" · "go"
**Template:** see 1.8.

---

## 8. Security

### 8.1 Checklist review with a round
**Original (12 Sep 2026 23:49):** "i got to know a few thing and i am not sure what and why they are needed but the developer who suggested said these are very important, can you tell me if we have these in place or do we even need them? 1. Hide API keys 2. Enable RLS 3. Test IDOR attacks 4. Scan GIT secrets 5. Lock admin routes 6. Test user isolation 7. Rate limit APIs 8. Lock storage buckets 9. Validate all inputs 10. Block unauthenticated routes 11. Test SQL Injection 12. Remove sensitive logs 13. Block field tampering 14. Restrict file uploads 15. Secure server logic 16. Trim API responses 17. Secure auth sessions 18. Scan dependencies 19. Test record access 20. Attack your own app — Before we proceed, ask me at least 25 questions…"
**Template:**
```
Here is a security checklist: [list]. Tell me for each item whether we already have it, whether it applies to our stack, and what's missing. Before we proceed, ask me at least [25] questions…
```
(The full kickoff block for Claude is in [20-security.md](20-security.md) B5.)

### 8.2 Fix until clean
**Original (13 Sep 00:18):** "in the scan and attacks you find any problem then fix it and verify again and repeat until its perfect"
**Template:**
```
If the scans or attack tests find any problem, fix it, verify again, and repeat until everything is clean. Don't push until then.
```

### 8.3 Questions that improve the plan
**Originals (13 Sep):** "is there really a need for this?" / "but why do we need this?" (about extra headers) — led to "three one-line headers, no CSP now".
**Template:**
```
Is there really a need for [item] now? What breaks without it, and what could it break?
```

---

## 9. Growth: landing page, pricing, cost report, marketing

### 9.1 Landing page kickoff and concept
**Originals:** "lets dicsuss what can we do with the coming soon page so that its also approriate I mean we are like almost ready to lauch and maybe we can introduce the app there add some screenshot and etc and show app features and hel people visualise features? [round, 25]" (13 Sep 19:58) · "so basiclly make this design for like everything is launched up and ready for user to install. consider everything we have build so far in backend stage (step 2 of our plan), even consider that step 3 payments is done too. we need to show this to the client for approval before the app is ready… we will replace the coming soon page with this. also [the client] doesnt want his name on it. but he said its okay if we add our name as the development team [the client] hired to build his idea in a subtle way or like in a about page or something a small section with linkto our website deeplearnhq.tech." (20:07) · "designed and built by deeplearnhq feel like it our project and the client might not aprove so we have to word it in a way the client doesnt fell like us claiming ownership of assemble" (21:13 → "Development partner: Deep Learn HQ")
**Templates:**
```
Let's discuss turning our [coming-soon page] into a launch page that introduces [app], shows real screenshots and features, and helps visitors picture using it. Ask at least 25 questions…
```
```
Design it as if everything is launched, including [payments]. We'll show it to [the client] for approval before the app is ready, then replace the [current page]. Don't use [the client]'s name; credit [agency] subtly in an About section linking to [agency site], worded as a hired development partner, not an owner.
```

### 9.2 Backup before replacing; preview feedback; conversion upgrade
**Originals:** "option 1 i will go with your recomendation but for now using the staging link for the back and we will change this later when [the client] approves. and keep the coming soon page on a separate staging link so its backed up ." (13 Sep 20:12) · "afew images still cant be seen and 3d avatar should be facing front and marcus and sasha are not the stylist a an example of people using and promoting the app." (14 Sep 01:32) · "i topped up the gemini key, continue also i feel like you should take long form pictuires of pages do scrolling inside phone feels realistic and how can me make this even better , amazing with pizaz and fully make by a 10+ years experienced marketer who kows how to convert viewsers into users. [round, 25]" (14 Sep 05:05)
**Templates:**
```
Point the button at [staging URL] for now; we'll switch to [production URL] after approval. Back up the current [page] on a separate link first.
```
```
Preview feedback: [missing items], [orientation/visual fix], and [persona/positioning correction]. Apply everywhere, including the scripts that generate the assets, and add a test that fails the build if [forbidden word] comes back.
```
```
Continue. Make [page] better: long full-page screenshots scrolling inside the phone, more pizazz, written and structured like a marketer with 10+ years' experience converting visitors into users. Ask at least 25 questions…
```

### 9.3 AI cost report and the always-in-profit pricing model
**Originals:** "up to this point since we started makeing backend i want you to figure out our ai costing so make a report of it so that we can analyse how much ai will cost in this project like for detection and image genrateion and etc everything must be included and i am not taliking about ai cost to build this project but ai cost we paid to google and what it got us, similarily for the tripoo got it? generate a report to help us understand and set per user pricing for the packages" (15 Sep 15:15) · "can you give this report in md file and one change i would like to make is that check online about how much tripo credits costs and then in the report at the end mention a pricing model that will ensure that the app is always in profit - obviously except for the free teir? [round, 5]" (17:04) · "dont write in ¢ its confusing only in $" (19:38 — standing rule since) · "…can you also tell how much it costs assemble ? and explain like 1 credit uses by then he pays x $ and out which y$ is profit?" (20:00) · "at the end of the report explain that we have selected the 70% model and it will cost us and what it will cost user and etc but explain it as if you are explaining it to a 15 years old child with visual assets help. understood?" (20:10) · "can you make an html version of the report?" (20:33)
**Templates:**
```
Since we started the backend, work out what we've paid [AI providers] for the app's own AI usage (not the cost of building it) and what each call got us: [features]. Compute it from the app's own call log at published rates. Make a report that helps us set per-user pricing for [plans/packs].
```
```
Give me the report as a Markdown file too. Verify [provider]'s prices online from official pages, and add a pricing model at the end that keeps the app always in profit (free tier excepted), with several margin levels and one recommendation. Ask at least 5 questions…
```
```
Write all money in dollars with decimals ($0.15), never in cents.
```
```
For each [unit/credit/feature], show: what the user pays, what it costs us, and what we keep, in dollars.
```
```
At the end, explain the option we chose ([model]) — what it costs us and the user — as if to a 15-year-old, with visuals. Then make a self-contained HTML version and check it in a browser.
```

### 9.4 Implement pricing everywhere
**Original (15 Sep 20:42):** "now implement the 70% pricing in the app config and it is update everywhere in app . admin and landing page [round, 5]" (then "stop", a 40% what-if, then "leave it lets keep 70% and conmtiue where we stopped from.")
**Template:**
```
Implement [pricing model] in the app config so it's updated everywhere: app, admin and landing page; add a reprice step to the cutover script. Ask at least 5 questions…
```

### 9.5 Marketing proposal, commercial review, AI hosts
**Originals:** "is this a complete proposal do you think doesnt mention our/agency cost for doing all this. what do you think is this something the client would feel like moving forward? [round, 5]" (8 Sep 02:47) · "he doesnt want to record himself and since its 2026 i would suggest keeping him out of the marketing cuz we can create realistic ai avatar to replace him." (8 Sep 03:29 — Claude raised platform and FTC disclosure rules first) · "i would take the recomended option but include a breakdown so client can understand transparently about what we are charging for," (03:36) · "did we every talk about a marketing proposal?" (15 Sep 14:50)
**Templates:**
```
Is this [document] complete? It doesn't mention [missing part]. Would [reader] feel like moving forward? Give me your honest take first, then ask me at least 5 questions…
```
```
Take the recommended option, but include a transparent breakdown so the client understands what we are charging for.
```

### 9.6 Ring logo on the site
**Original (15 Sep 23:21):** the rotating 3D letter ring from the app ported to the landing page header and footer, 15 questions (pace, hover, reduced motion, must not move the speed score).
**Template:**
```
Port [the app's signature element] to [page] as a component (no images, no library), in [header/footer], matching the app's [pace/colours]; reduced motion = static; must not move the speed score (measure before/after). Ask at least 15 questions…
```

---

## 10. Background task briefs (self-contained, for parallel sessions)

### 10.1 The gold-standard side-task brief
**Structure of the 13 Sep 2026 22:20 briefs (three launched in the same minute in separate git worktrees):** context (repo path, stack, which app) → exact bug with file paths and the pattern file that already does it right → "Do this:" numbered steps (implementation, copy, tests with named spec files) → "Rules for this repo:" (no AI attribution; commit identity; the exact pre-push checks; staging DB only; never production; never `neon env pull`; the build takes minutes) → parallel-safety clause → finish condition.
> **For Claude — paste this:**
```
In the [App] repo at [ABSOLUTE PATH] ([stack summary: monorepo layout, which app is which]), [exact problem, with file paths and the pattern file that already does it right].

Do this:
1. [Implementation step with guard rails: what must never be touched, error handling, logging rules.]
2. [User-facing copy change, exact wording or tone.]
3. Tests: [unit test to add, e2e spec + test name to extend, what it must assert, protected demo data].
4. Rules for this repo: no AI attribution anywhere (code, comments, docs, commit messages); commit as `[name] <[noreply email]>`; before pushing run `npx tsc --noEmit` in [app dirs], `npx vitest run` in [dir], `[ENV FLAGS] npx turbo run build`, and `E2E_DB=1 npx playwright test` (one worker; kill leftover servers on ports [ports] first). Staging database only ([env file]); never production; never `neon env pull`. The build takes several minutes.
Another session is editing [paths] — do not touch them. Other background tasks may edit [paths]: pull and rebase before pushing and resolve conflicts carefully rather than overwriting their changes.
Push to [branch] only when all are green, then confirm on [staging URL] that [visible result]. If you cannot push (credentials), commit locally and report exactly what is blocked.
```

### 10.2 Build-agent brief (for multi-agent workflows)
> **For Claude — paste this:**
```
You are build agent [X] for [round]. Own only these files: [list]. Do not edit shared files [list]; note needed changes in your report.
Decisions (final, do not re-open): [paste the decision list from the question round].
API contract you code against (exact shapes): [paste].
Rules: no AI attribution anywhere; follow existing patterns in [paths]; every behaviour change gets a unit test in apps/web/tests or an e2e case in tools/e2e; no fakes — every control real or removed; demo fixtures only behind the demo check; money in dollars; keep every existing guard; never commit, push, stash or change git state; never call real paid engines; staging and CI databases only.
Gates before reporting: typecheck the app(s) you touched; run vitest for your test files. Do NOT run builds or Playwright. If the file [scratchpad]/E2E-RUNNING exists, wait until it is gone before typechecking. Run long commands in the foreground and do not end your turn before reporting.
Shared-file protocol: small anchored edits; re-read before each edit; append-only for shared hook files.
Report under [60] lines: files changed, tests added, checklist rows (LAUNCH-READINESS.md section [S]) completed, decisions you had to make, anything left for integration.
```

### 10.3 Adversarial reviewer brief
> **For Claude — paste this:**
```
You are the reviewer for [round]. Your job is to REFUTE, not to confirm. Read the brief's decisions and the diff. Look for: a locked setting writable without a code; a number that disagrees with the report's method; a paid call made silently; a control that only shows a toast; leftover old UI or copy; a route without a session check; a migration not applied to the CI branch; docs not updated; a test that passes on old code.
Return JSON { refuted: boolean, defects: [{ file, line, what, why it ships wrong, fix }], notes }. Tests passing is not evidence that numbers are right.
```

---

## 11. Claude-side templates (contracts to paste)

### 11.1 Question-round opener for a new feature (backend era)
> **For Claude — paste this:**
```
[Describe the feature or change in plain words.]
Don't write code yet. First read the current screens/code involved so your questions are concrete.
Ask me at least 10 questions, ONE AT A TIME, each as multiple choice with your recommended option first and marked "(Recommended)" with a one-line reason.
After the last answer, play back a consolidated spec and close any loose end with one more question.
The final question must be about shipping: commit locally and hold / commit + push to [remote(s)] / staged pushes.
```

### 11.2 Merge-readiness check
> **For Claude — paste this:**
```
Are we ready to merge [branch] into main? Before answering, verify end to end: structural audit or full test bar, every screen in both apps, the flows changed on this branch in every plan/role state, no horizontal overflow at desktop and 390px, zero console errors, git clean. Tell me anything you could not verify and what I should click through myself. Don't merge until I say "merge".
```

### 11.3 Safe push with a pasted token
> **For Claude — paste this:**
```
Push rules for this session:
- Never store the token: push with an inline URL (the x-access-token form, with GIT_TERMINAL_PROMPT=0 so git never opens a credential prompt) and never use -u:
  GIT_TERMINAL_PROMPT=0 git push https://x-access-token:<TOKEN>@github.com/<user>/<repo>.git <local-branch>:<remote-branch> 2>&1 | sed -E 's/(ghp|github_pat)_[A-Za-z0-9_]+/***REDACTED***/g'
- After every push: grep .git/config for the token and scrub if present.
- Never write the token into any file, doc, memory note or scratch script.
- Remind me to revoke the token when the work is done.
```

### 11.4 Asset intake (generated images, icons, 3D)
> **For Claude — paste this:**
```
New generated assets are in [folder]. For each sheet:
1. Read the real pixel size first; never assume it.
2. Find cells by the baked filename labels (generators shuffle positions); skip duplicates.
3. Crop each cell, trim the label strip, check nothing is clipped (compare the glyph/garment bounding box to the crop).
4. Photos: save as JPEG ~[width]px, quality ~86, 3:4 where the UI is portrait. Icons: luminance → alpha mask, crop to bounds + padding, square 96px PNG, check alpha coverage numerically. 3D: Draco/meshopt-compress GLBs (target < 6MB); normalise orientation to face the camera.
5. Save under the exact filenames from [brief]; normalise double extensions.
6. Verify every surface that uses them in the browser, check the console for errors, then commit and push.
Write any helper scripts as .py/.mjs files in the scratchpad (never inline in PowerShell or node -e).
```

### 11.5 Client-facing module document
> **For Claude — paste this:**
```
Turn our feature discussion into a client-facing "Additional Modules" document:
- For each feature: What it is · Why it matters · Where you'll see it (plain words, no screen ids) · How it works (one plain line) · How it can earn (options; client picks ONE) · Our suggestion.
- No complexity ratings, no prices inside feature sections.
- Pricing revealed only at the end in a table; add an offer table if asked.
- Plain text, no emoji, client tone. Save to [absolute folder] as .md, uncommitted.
Then create a separate internal build guide .md explaining how to build each module into [prototype/app] if chosen.
```

### 11.6 Report format after any round
> **For Claude — paste this:**
```
Report in this order, every time: result line (commit hash, deploy state, CI state) → what changed (numbered, matching my decisions) → root causes of any bug → verification table with counts (unit, e2e, live checks) → numbered phone retest guide (App / Admin; "do X → you should see Y"; "not tested live" section) → loose ends → waiting on me. Production untouched unless I said "cutover".
```

### 11.7 Standing rules block for a client repo (put in CLAUDE.md; full template in `templates/CLAUDE.md`)
> **For Claude — paste this:**
```
Standing rules for this repository:
- No AI attribution anywhere: commits, trailers, comments, docs, tests. Commit as [GITHUB_USER] <[noreply]>.
- Every change goes through the full test bar (typecheck, vitest, build, Playwright e2e one worker, security scans) before push; CI on the [ci] database branch; live check on staging after deploy; phone retest guide in the report.
- Databases: [staging] for development and local e2e; [ci-branch] for CI; production only at cutover on my explicit instruction. Never `neon env pull` for a branch whose credentials are GitHub secrets.
- Tests never call real paid engines: GEMINI_MOCK=1 and TRIPO_MOCK=1 on every test server.
- Secrets only in gitignored env files, Vercel env and Actions secrets. Never in tracked files, memory notes, docs or scratch scripts. Verify tokens with one API call before use.
- Money in dollars ($0.15), never cents. American English in user-facing copy. Vendor names never in the UI.
- No fakes: every control works for real or is removed; demo fixtures only behind the demo check. Copy must not promise what the app does not do.
- Never overwrite a storage object key; migrations additive and re-runnable, applied to staging and CI the same day.
- Ask before: deleting data, touching production, changing prices, rewriting history, installing new dependencies with native builds.
- When many tests fail instantly, check the network before debugging code. Never run tests while a build runs. Free ports 3000/3001 first.
- Finish only what was agreed; start nothing new until told.
```
