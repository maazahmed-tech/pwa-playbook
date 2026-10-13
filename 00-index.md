# PWA Playbook — build a new app the Assemble way

This folder is a step-by-step guide for building a **new app** with the same tools, the same milestones and the same working method that produced Assemble (an AI outfit-matching PWA built by Deep Learn HQ between July and September 2026). It is written for two readers at once:

- **You**, the person who runs the project and talks to Claude Code. You may have little technical knowledge. Every chapter gives numbered steps, tick-box checklists and a one-line "why" for each decision, and explains a technical word the first time it appears.
- **A Claude Code session**, which does the technical work. Every chapter has blocks marked **"For Claude — paste this"**. You copy the block into the chat exactly as written (after filling in the `[placeholders]`), and Claude follows it.

The guide is **playbook first, Assemble second**: each chapter tells you what to do for any app, then shows in an "Assemble example" box what we actually did, with dates, and in a "Pitfalls" box what went wrong and how it was fixed.

> **Never put a real secret in this guide, in a chat, in a memory file or in a git repository.** Tokens, API keys, passwords, database URLs and OAuth client secrets appear here only as placeholders like `<GITHUB_PAT>`. Chapter [03-services-setup.md](03-services-setup.md) explains where secrets live and how you hand them to Claude safely.

---

## 1. How to read this guide

| You see | It means |
|---|---|
| `☐` or `- [ ]` | A tick box. Do the step, then tick it (copy the checklist into your own notes if you like). |
| **Why:** | The one-line reason behind a step. Skip it if you trust us; read it if you want to change the step. |
| > **For Claude — paste this:** followed by a fenced block | Copy the whole fenced block into the Claude Code chat. Replace every `[PLACEHOLDER]` first. Do not paraphrase; the wording carries rules Claude needs. |
| **Assemble example** box | What we really did on Assemble, with dates, so you can judge how long things take and what "done" looked like. |
| **Pitfalls** box | Symptom → cause → fix → how to prevent it next time. Read these *before* the step, not after. |
| `code in backticks` | A file name, folder, command or exact value. |

Words used throughout, explained once:

- **Session**: one conversation with Claude Code. A project can span several sessions; long ones get "compacted" (summarised) when they run out of memory. See [01-running-the-sessions.md](01-running-the-sessions.md).
- **Repo (repository)**: a folder whose history is tracked by git and stored on GitHub. **Push** = send your commits to GitHub. **Branch** = a parallel line of work. **main** = the branch that deploys automatically.
- **Deploy**: publish the code so it runs on the internet. We use Vercel, which deploys automatically whenever `main` changes.
- **Staging** vs **production**: staging is the private copy of the app where new work is tested; production is the address real users open.
- **PWA (progressive web app)**: a website that installs on a phone like an app, without an app store.
- **Env var / `.env.local`**: a named setting (often a secret) that the app reads at runtime instead of having it in the code. Kept in a gitignored file locally and in the hosting dashboard online.
- **Migration**: a script that changes the database structure (adds a table or column) in a repeatable way.
- **The pyramid / the test bar**: typecheck → unit tests → production build → Playwright end-to-end tests (e2e) → CI on GitHub → live check on staging → your phone retest. See [21-testing.md](21-testing.md).
- **Question round**: the way every piece of work starts. You ask Claude to ask you N questions, one at a time, multiple choice, with a recommended option. See [02-how-we-work.md](02-how-we-work.md).

---

## 2. The milestone map

Each milestone has its own chapter with a goal, prerequisites, numbered steps, paste-ready blocks, the Assemble example and pitfalls. Do them in order; each one is the input to the next.

| # | Milestone | What you have at the end | Chapter | Assemble dates |
|---|---|---|---|---|
| 0 | **Pre-build**: brand, logo, coming-soon page, optional 3D assets | A live coming-soon page on your domain; brand tokens (colours, fonts, logo) written down; any 3D or photo assets compressed and stored | [10-prebuild.md](10-prebuild.md) | 9–10 Jul, 22 Jul, 25 Jul 2026 |
| 1 | **Wireframes**: one standalone greyscale HTML prototype of the whole product (customer app + admin) | A clickable prototype the client signs off and developers build from, plus a coverage matrix, walkthrough and presenter script, all on Vercel | [11-wireframes.md](11-wireframes.md) | 14 Jul – 5 Aug 2026 |
| 2 | **UI**: the same prototype restyled with the real brand, real imagery, icons and motion | A branded single-file prototype that looks like the finished app; asset briefs; a UI playbook | [12-ui.md](12-ui.md) | 5–6 Aug 2026 (+ playbook 19–21 Aug) |
| 3 | **Full-stack frontend**: a real codebase (monorepo) with database, auth, CRUD, admin, storage, first external API, tests and CI, deployed to your domain | A production PWA at `app.<domain>`, admin at `admin.<domain>`, coming-soon at the root; every screen backed by a real database | [13-fullstack-frontend.md](13-fullstack-frontend.md) | 21 Aug (local), 28 Aug – 3 Sep 2026 |
| 4 | **Backend**: real AI features, every control real, security round, staging environment, cutover runbook | A staging app that is launch-ready except payments; `LAUNCH-READINESS.md`, `SECURITY.md`, `CUTOVER-RUNBOOK.md`, `CLIENT-HANDOVER-CHECKLIST.md` | [14-backend.md](14-backend.md) | 1–17 Sep 2026 |
| 5 | **Payments and cutover**: Stripe, the client's own keys, the switch of the domain to the new build | Real charges; production running from the new repo; rollback one click away | [15-payments-and-cutover.md](15-payments-and-cutover.md) | Planned (not finished on Assemble as of 17 Sep 2026) |
| 6 | **Growth**: launch landing page, AI cost ledger and credit pricing, marketing proposal | A launch page ready for client approval; a pricing model that keeps the app in profit; a marketing plan | [16-growth.md](16-growth.md) | 7–8 Sep, 13–16 Sep 2026 |

Cross-cutting chapters that apply to every milestone:

- [01-running-the-sessions.md](01-running-the-sessions.md) — models, limits, durations, compaction, resuming, background work, multi-agent workflows.
- [02-how-we-work.md](02-how-we-work.md) — the loop, the question-round contract, the standing rules, how you talk to Claude, what Claude reports back.
- [03-services-setup.md](03-services-setup.md) — every third-party service: where to create it, what to give Claude, where it is stored, how to verify, what expires.
- [04-tech-stack.md](04-tech-stack.md) — exact versions and why; the decision framework; what to check before reusing a version.
- [20-security.md](20-security.md) — the 20-point security review, the attack suite, secrets hygiene.
- [21-testing.md](21-testing.md) — the full test method with real commands, mocks, test databases and the phone retest guide.
- [30-prompt-library.md](30-prompt-library.md) — every reusable prompt as a template plus the original message that inspired it.
- [40-pitfalls-master-list.md](40-pitfalls-master-list.md) — every pitfall from every chapter in one list.
- [templates/](templates/) — generic, reusable files (standing-rules file for Claude, CI workflow, Playwright config with mocked AI, secrets scanner, chat exporter, `.env.example` files, workflow script skeleton, agent brief skeleton). Its own index is [templates/README.md](templates/README.md).
- [CHANGELOG.md](CHANGELOG.md) — what changed in this guide and when; add an entry after every batch until the project is finalised.

---

## 3. How to use the guide for a new app

### Before you start (about one evening)

1. **Read [02-how-we-work.md](02-how-we-work.md) once, fully.** It is the shortest way to understand why the rest works. **Why:** the method matters more than any single command.
2. **Set up the accounts in [03-services-setup.md](03-services-setup.md), section 2 ("When each service is first needed", the milestone 0 row).** You need GitHub, Vercel and the domain on day 1; the rest arrive per milestone. **Why:** Claude cannot create accounts or accept terms for you.
3. **Create the project folder** on your machine using the layout in section 5 below, and copy the `templates/` files you will need into it.
4. **Decide the app's name, the client's role and the rules** (British or American English, money format, who may be named). Write them into the standing-rules file (`templates/CLAUDE.md`) before the first session. **Why:** rules that exist from day 1 never have to be retro-fitted.

### Per milestone (the loop you will repeat six times)

1. Open the milestone chapter. Tick its **prerequisites** checklist; do not start until every box is ticked.
2. Start a Claude Code session in the milestone's folder. Paste the chapter's **kickoff block** ("For Claude — paste this").
3. Run the **question round** (Claude asks, you answer one by one). Answer honestly; use the free-text "Other" option to correct Claude's assumptions.
4. Say **"go"** (or "Build it as summarised"). Let Claude build, verify and report.
5. **Test it yourself** on a real phone and desktop with the phone-retest guide Claude sends. Report bugs in the format in [02-how-we-work.md](02-how-we-work.md).
6. Repeat 3–5 in rounds until the milestone's **definition of done** (in the chapter) is met.
7. **Close the milestone**: update memory, refresh the chat archive, commit the living documents, revoke any temporary token, stop local servers. See the end-of-session block in [01-running-the-sessions.md](01-running-the-sessions.md).

### Keep three things alive across the whole project

- **Memory notes** (Claude's auto-memory) — project state, decisions, one note per service failure mode. Never a secret.
- **Living documents in the repo** — `LAUNCH-READINESS.md`, `CUTOVER-RUNBOOK.md`, `SECURITY.md`, `README.md`, the scope doc of each round.
- **The chat archive** — every session exported to readable, secret-masked Markdown outside git (`templates/archive/export-history.mjs`). Refresh after each batch. It is what made this guide possible.

---

## 4. Day 1 checklist

Tick every box before the first "go".

**Accounts and access**

- ☐ GitHub account for the project owner (the account that will own every client repo and be linked to Vercel).
- ☐ A GitHub **fine-grained personal access token** for Claude: only the project repos, `Contents: read/write`, `Actions: read`, `Workflows: read/write`, 90-day expiry. Written down where? In your password manager, not in a document. ([03-services-setup.md](03-services-setup.md) §GitHub)
- ☐ Vercel account (or team) connected to that GitHub account.
- ☐ Domain registered; you know where its DNS is managed.
- ☐ Password manager set up (for every key and password you will be given).
- ☐ Bitwarden Send (or equivalent) chosen as the way the client sends you keys later.

**Machine**

- ☐ Claude Code desktop installed and signed in; browser pane works.
- ☐ Node 22 and npm 11 installed (`node --version`, `npm --version`).
- ☐ git installed; `gh` installed. Know which GitHub account `gh` is logged into (`gh auth status`) — on Assemble it was the wrong one for weeks.
- ☐ Python 3 via `py` (Windows) for image slicing in the wireframe/UI phases, with Pillow (`py -m pip install pillow pypdfium2`).
- ☐ Microsoft Edge or Chrome present (headless screenshots).

**Project folder**

- ☐ Folder created with the layout in section 5.
- ☐ `templates/CLAUDE.md` copied to the project root and filled in (app name, client rules, language, money format, repo owner identity, "no AI attribution" rule).
- ☐ `templates/archive/export-history.mjs` copied to `Project History/` so the chat archive can be produced from the first session.
- ☐ A `.gitignore` in every folder that will become a repo: `node_modules/`, `.next/`, `.env*`, `.claude/`, `*.keystore`, screenshots and test output.

**Inputs for milestone 0/1**

- ☐ The written proposal or spec (PDF is fine; Claude renders image-only PDFs to pictures and reads them).
- ☐ Brand assets if they exist (logo files, colours, fonts) — or the decision to run the brand question round first.
- ☐ Any exported design files (Claude will rebuild them as standalone HTML; proprietary exports rarely run outside their tool).

**Rules agreed with the client**

- ☐ Whether the client may be named in public pages (on Assemble: no, the agency credited subtly as "Development partner").
- ☐ Whether the client's likeness may be used anywhere (on Assemble: no — fictional AI-generated people were used in marketing).
- ☐ Which accounts will be in the client's name at launch (AI billing, email sending, OAuth, domain, payments) and which stay with you (code, CI, hosting, database, monitoring).

---

## 5. Recommended folder layout for a new client project

This mirrors what grew organically on Assemble, cleaned up. One folder per milestone; each folder that deploys is its own git repo; the history folder is never in git.

```
<Clients>/<Client or App>/
├── CLAUDE.md                     ← standing rules for every Claude session in this tree (templates/CLAUDE.md)
├── coming soon page/             ← milestone 0: one index.html + favicon; repo "<app>-coming-soon-page"
├── 3D assets/                    ← milestone 0 (optional): source GLBs and a viewer; PRIVATE repo
├── Wireframes/Version 1/         ← milestone 1: "<App> - Prototype.html" + Coverage/Walkthrough/Presenter; repo "<App>_Wireframes_Version_1"
├── UI/                           ← milestone 2: branded prototype, img/, icons/, assets/, asset briefs; repo "<App>_UI_Version_1"
│   ├── front end/                ← milestone 3: the monorepo; repo "<App>_Frontend_v1" (frozen as production backup later)
│   └── backend/                  ← milestone 4: fresh copy with clean history; repo "<App>_Backend_v1" (staging, then production at cutover)
├── Marketing/                    ← proposals, growth plan, cost report (never in a client repo)
├── twa-staging/                  ← Android test package and its keystore (never in a repo)
└── Project History/
    ├── export-history.mjs        ← chat exporter (templates/archive/export-history.mjs)
    ├── chats/                    ← secret-masked Markdown archive of every session
    └── pwa-playbook/             ← this playbook (or the next app's copy of it)
```

**Why separate repos per milestone:** the wireframe and UI prototypes are client deliverables that must stay exactly as approved; the frontend repo becomes a frozen backup of production; the backend repo starts with a single clean commit so its history carries no experiments and no AI attribution.

---

## 6. Chapter index

| File | One line |
|---|---|
| [00-index.md](00-index.md) | This page: how to use the guide, the milestone map, the day-1 checklist. |
| [01-running-the-sessions.md](01-running-the-sessions.md) | Models and limits, session lengths, compaction, resuming after interruptions, background tasks, worktrees and multi-agent workflows. |
| [02-how-we-work.md](02-how-we-work.md) | The loop, the question-round contract, standing rules, how to write requests and bug reports, what Claude must report. |
| [03-services-setup.md](03-services-setup.md) | Setup checklists for GitHub, Vercel, DNS, Neon, Google Gemini, Google OAuth, Resend, Tripo, Sentry, PostHog, web push, Stripe, app stores; secrets handling and expiry. |
| [04-tech-stack.md](04-tech-stack.md) | The stack with exact versions and reasons, the decision framework, architecture patterns, what to check for newer versions. |
| [10-prebuild.md](10-prebuild.md) | Brand and logo handoff, the coming-soon page, favicon, 3D asset preparation. |
| [11-wireframes.md](11-wireframes.md) | Proposal critique, the greyscale single-file prototype, coverage matrix, presenter script, client revision rounds. |
| [12-ui.md](12-ui.md) | Brand restyle, asset briefs and the "you generate, Claude wires" pipeline, icons, motion, data-driven screens. |
| [13-fullstack-frontend.md](13-fullstack-frontend.md) | Monorepo scaffold, design system port, database and seeds, auth, CRUD, admin, storage, first paid engine, PWA, tests and CI, deploy to domain. |
| [14-backend.md](14-backend.md) | Staging environment, real AI features, "no fakes" launch-readiness rounds, security round, admin operations, cutover rehearsal. |
| [15-payments-and-cutover.md](15-payments-and-cutover.md) | Stripe plan and what exists today; client key handover; the cutover runbook; rollback. |
| [16-growth.md](16-growth.md) | Launch landing page, AI cost ledger method and the always-in-profit credit pricing formula, marketing proposal. |
| [20-security.md](20-security.md) | The 20-point review, attack suite, rate limits, secrets scanning, dependency gate, privacy by design. |
| [21-testing.md](21-testing.md) | The pyramid with real commands, mocks, test databases, throwaway accounts, CI, live checks, phone retest template. |
| [30-prompt-library.md](30-prompt-library.md) | Copy-paste prompt templates with placeholders and the original messages (dated) they came from. |
| [40-pitfalls-master-list.md](40-pitfalls-master-list.md) | Every pitfall, one list, symptom/cause/fix/prevent. |
| [templates/README.md](templates/README.md) | Index of the reusable files: standing rules (`CLAUDE.md`), briefs, workflow scripts, CI workflow, repo scaffold and `.env.example` files, testing files (Playwright config, guard tests, live pass), security tooling, deploy-by-API scripts, database scripts, documents (cutover runbook, launch-readiness table, phone-retest guide, handover checklist, handoff, status report, memory note), chat exporter, static redirect. |
| [CHANGELOG.md](CHANGELOG.md) | What changed in the guide, by date. |

---

## 7. Bootstrap block for a brand-new app

Paste this at the very start of the first session for a new app, after the folder and `CLAUDE.md` exist. It points Claude at this guide and stops it from building before the plan is agreed.

> **For Claude — paste this:**
```
We are starting a NEW app called [APP NAME] for [the client / our own product], built by Deep Learn HQ.
Read these files fully before doing anything else, in this order:
1. [ABSOLUTE PATH]\CLAUDE.md  (standing rules for this project — they override your defaults)
2. [ABSOLUTE PATH TO GUIDE]\00-index.md
3. [ABSOLUTE PATH TO GUIDE]\02-how-we-work.md
4. [ABSOLUTE PATH TO GUIDE]\01-running-the-sessions.md
5. The chapter for the milestone we are on: [ABSOLUTE PATH TO GUIDE]\[1X-chapter].md
Then save a memory note "[APP NAME] project" with: app name, client rules (never name the client; no client likeness), language ([American/British] English), money in dollars only, commit identity [GITHUB_OWNER] <[GITHUB_OWNER]@users.noreply.github.com>, no AI attribution anywhere in client repos, secrets never written to files you commit or to memory.
Do not write any code yet. Summarise in ten lines what we are about to do and what you need from me, then start the milestone chapter's question round.
```

---

## 8. Where Assemble stands (so you know what "finished" looks like)

As of 17 September 2026: milestones 0–4 are complete; milestone 6 (landing page, cost ledger, pricing, marketing proposal) is built and waiting for client approval; milestone 5 (Stripe and the production cutover) is planned and rehearsed but not executed. The production domain still serves the frozen frontend repo; all new work is on staging. The guide is meant to be updated when milestone 5 ships — see the note at the top of [15-payments-and-cutover.md](15-payments-and-cutover.md).
