# 01 — Running the sessions

**Goal of this chapter:** you can start, steer, pause, resume and close Claude Code sessions without losing work, and you know what to expect in time, model limits and machine load at each milestone.

Links: the working method itself is in [02-how-we-work.md](02-how-we-work.md); the test commands are in [21-testing.md](21-testing.md); prompts referenced here are in [30-prompt-library.md](30-prompt-library.md).

---

## 1. What a session is

A **session** is one conversation in Claude Code. It has:

- a **working folder** (the folder you opened it in). Claude's file tools, permissions file (`.claude/settings.local.json`) and auto-memory are tied to that folder, so **one folder per milestone** keeps memories relevant.
- a **context window**: everything said and every file read so far. When it fills up, Claude Code **compacts** it (writes a structured summary and continues from that). This is normal; section 5 shows how to make it painless.
- a **model** (section 2). Sub-agents launched by a session inherit its model at launch.

On Assemble the whole project ran in **five main sessions** (coming-soon page, wireframes, 3D modelling, UI-and-backend part 1, UI-and-backend part 2) plus four short side-task sessions in git worktrees. The two big sessions each ran for weeks with several compactions and were resumed dozens of times.

Prerequisites:

- ☐ Claude Code desktop installed, signed in, browser pane working.
- ☐ The project folder exists with `CLAUDE.md` (standing rules) at its root — copy `templates/CLAUDE.md`.
- ☐ You know today's plan limits (open the usage report in Claude Code before a big batch).

---

## 2. Models and limits

### Which model when

| Work | Model used on Assemble | Why |
|---|---|---|
| Question rounds, design decisions, code that must be right first time (auth, money, security), adversarial review, writing chapters/documents | The strongest available model ("Fable 5.1" in September 2026) | Fewer wrong assumptions; better at long context |
| Bulk build work inside a workflow, readers/extractors, repetitive edits, test fixing | The mid model ("Opus 5") | Much cheaper against the weekly allowance; quality was fine for well-briefed work |
| Not used | The small model ("Sonnet 5") | Never needed |

Rules learned:

1. **Switch the model before launching a workflow or sub-agents**, not during: agents inherit the model at launch. Use `/model <name>` in the chat. Claude cannot switch its own model; you must.
2. **Estimate before a big batch.** Paste your usage report into the chat and ask Claude to estimate the batch in tokens and in percentage of the remaining weekly allowance for each model. On Assemble a 50-decision batch was estimated at 8–12 million tokens; on the strongest model that was more than the week had left, so it ran on the mid model.
3. **Split by role** when a job has readers and writers: readers/extractors on the mid model, writers and the final checker on the strongest model (this guide was written that way).
4. When a usage limit stops a run mid-way ("You've reached your … limit"), do not relaunch from scratch. Switch model and paste the recovery block in section 6.

> **For Claude — paste this (before a big batch):**
```
Before we start: estimate this batch in tokens and as a share of my remaining weekly allowance on [MODEL A] and on [MODEL B]. Here is my usage report: [PASTE]. Tell me which model to run it on, whether a switch mid-way is safe (remember sub-agents inherit the model at launch), and what you would put on the stronger model regardless.
```

### Plan limits and usage

- The plan has a per-session window and weekly pools (all models, and a scoped pool for the premium model). Big cache reads on the premium model were the main consumer on Assemble.
- Ask "how much time left / total ETA in one line?" freely; Claude answers with phase-by-phase estimates and updates them honestly.
- Long autonomous runs are fine ("complete the whole app without stopping") but always after a short question round, and always ending with a report and a stop.

---

## 3. How long things take

Real durations from Assemble, so you can plan an evening or a night. Machine: a Windows laptop; times include Claude's own verification.

| Work | Typical duration |
|---|---|
| Question round, 5 questions | 3–5 min |
| Question round, 25–30 questions | 30–40 min |
| Question round, 50 questions | 60–75 min |
| Small copy/UI edit on a single-file prototype, verified and pushed | 1–3 min |
| Prototype batch of 15–20 items (single HTML file) | 15–20 min |
| Branded redesign of a 75-screen prototype (first delivery) | ~22 min |
| Asset intake (slice a generated sheet, wire images) | 5–10 min |
| Monorepo scaffold + whole frontend from the prototype (Step 1) | ~72 min |
| `npm ci` in a fresh worktree | 4 min (warm) to 30+ min (cold, Windows) |
| Production build of web + admin (`turbo run build`) | 4–8 min; ~11 min when the landing site's image step runs |
| Unit tests (vitest) | under 1 min |
| Full Playwright e2e suite | 10–20 min at 50–70 tests; 36–45 min at 200–240 tests with one worker; "the 2.5-hour suite" by mid-September when run alongside other work |
| GitHub Actions CI run | 4.5–7.5 min early; 10–25 min later (25-min job timeout) |
| Vercel deploy per app | 1–5 min; DNS propagation for a new subdomain ~4 min |
| Real AI calls on staging | match ~10 s, detection ~14 s, packing ~6 s, image render ~10 s (cached < 1 s), 3D build ~50 s (max quality: several minutes) |
| Security round (3 workstreams + fix loop) | ~4 h including a limit pause and a network outage |
| A 50-decision feature batch (workflow: data → 3 builders → tests → review → fixes) | 3–6 h wall clock |
| Landing page round | 1 h to first preview; ~3 h for the polished round |
| Cross-checked AI cost report (9 agents) | ~1.5 h |

Two rules that follow from the table:

- **Never run tests and builds in parallel, and keep the machine idle during e2e.** A run alongside typecheck/vitest/agents failed 30 tests on hydration timeouts that passed alone.
- **Use targeted tests for small pushes** (typecheck + relevant unit tests + only the affected spec files + one real check on staging) and let CI run the full suite. Say so explicitly: "don't run the whole suite".

---

## 4. Tools inside a session that we relied on

- **The multiple-choice question tool.** The backbone of every round. Claude asks one question at a time with 2–4 options and a "(Recommended)" tag. You can type free text in "Other".
- **Plan mode.** Used for taste-driven work (a "premium look" pass), document drafting and risky pushes: Claude writes a plan file, you approve, then it executes. Plan files live under your user profile, not the project; ask Claude to save the final text into the workspace.
- **The browser pane.** Claude opens local servers or live URLs, drives clicks, reads the DOM, measures elements, takes screenshots. Limits found: screenshots fail while the pane is hidden (Claude falls back to DOM measurements); external URLs were sometimes blocked (Claude used local Playwright instead); batches over 25 browser actions are rejected (split them); the pane cannot save files from the page (a tiny local dev server with a `POST /save` endpoint solved it).
- **Background tasks and watchers.** Builds, e2e runs, deploy polls and CI watches run in the background and wake the session when done. Claude keeps working on independent items meanwhile and says plainly when "nothing independent can be started".
- **Skills.** `frontend-design` (branded UI), `gsap-scrolltrigger`, `threejs-webgl`, `react-three-fiber`, `web3d-integration-patterns`, `dataviz`, plus the Neon agent skills installed with `npx skills add neondatabase/agent-skills -s neon -s neon-postgres -y`. Claude was asked whether to install community skills and recommended not to — overlapping skills add noise.
- **Sub-agents and workflows.** See section 8.
- **Auto-memory.** Claude saves project notes in its memory folder for the working directory. See section 9.
- **MCP connectors.** Many were listed (Neon, GitHub, Slack, …) and needed OAuth that a non-interactive session cannot do. None was required; the REST APIs with a token did everything. If you want one, authorise it in an interactive session first.

---

## 5. Context, compaction and what survives

When the context fills, Claude Code writes an automatic summary and continues. On Assemble this happened at least ten times across the project, including mid-edit, and work resumed **without re-asking** every time. The summary structure is worth knowing because it is also the template for a hand-written handoff:

1. Primary request and intent (including standing rules, e.g. the token-handling rules, verbatim)
2. Key technical concepts
3. Files and code sections touched (with exact snippets when mid-edit)
4. Errors and how they were fixed
5. Problem-solving notes
6. All user messages (so your corrections are not lost)
7. Pending tasks
8. Current work
9. The exact next step

**What makes compaction safe** (do all of these, all the time):

- Decisions are written into **files**, never only into the conversation: a scope doc after each question round (`STEP-1.5-SCOPE.md`, `LAUNCH-READINESS.md` rows), agent briefs in the scratchpad, memory notes (`batch2-decisions.md`, `batch3-decisions.md`).
- The repo carries a **handoff document** a new session reads first (`PROJECT-HANDOFF.md` in the prototype era; `README.md` + `LAUNCH-READINESS.md` + `CUTOVER-RUNBOOK.md` later).
- Memory is updated **after every round** ("saving Stage C state to memory").
- Workflows keep a **journal**, so a failed phase can be resumed by run id with finished agents replayed from cache.
- Edits are kept **compiling**: one compaction happened mid-edit and left a file non-compiling; the summary flagged it as "CRITICAL INCOMPLETE STATE" and the resume fixed it first.

If you worry: ask "what will we do if context is at 100%?" — the answer on Assemble was: nothing is lost; older context is summarised; agents keep their own memory; decisions live in files; worst case (app restart) the workflow is resumed by id.

> **For Claude — paste this (at the start of any resumed or compacted session):**
```
Before doing anything: read the memory index and the project memory note, the repo's README.md / LAUNCH-READINESS.md / CUTOVER-RUNBOOK.md if they exist, and `git status` + `git diff --stat` in the working folder. Tell me in ten lines: what was in flight, what is uncommitted, which servers or ports may still be running, and the exact next step you believe we were on. Do not start work until I confirm.
```

---

## 6. Interruptions and how to resume

Every interruption type we met, with the message that resumed it:

| What happened | What you type | What Claude does |
|---|---|---|
| You want to add or change something mid-turn | Interrupt, then re-send the full message with the addition (or "Sorry to interrupt — change my answer to Q[n]: [answer]. Continue.") | Continues from the newest message without losing state |
| A question was dismissed ("do not proceed") | (nothing, or the next instruction) | Stops, summarises decisions so far and what is still to ask, waits |
| You want a hard stop | `stop` | Halts and confirms nothing has been changed; later "leave it, let's continue where we stopped" |
| API error "Can't reach the API server … ENOTFOUND" | `Try again` | Resumes the interrupted turn |
| Claude Code's own login expired ("OAuth access token has expired") | Re-send the message after re-authenticating | — |
| Usage limit hit mid-run | `/model <other model>` then `model changed continue.` | Checks what the interrupted agents already finished (typecheck, migrations applied, unit tests), resumes only what is left |
| Your internet/DNS dropped during e2e or a migration | (wait) | Sets a connectivity watcher, then re-runs the failed phase; migrations are written to be re-runnable |
| Overnight gap while Claude was waiting on an answer | `continue` | Applies its stated default, reports clearly what it assumed and how to change it |
| A new session after a break | `continue` (plus the resume block in section 5) | Re-runs only the affected spec files, then the full suite |
| A workflow phase failed | ask to resume the workflow | `resumeFromRunId` replays finished agents from the journal and restarts the failed phase |
| A killed test run left servers alive | (Claude does this) | Frees ports 3000/3001, `git diff` to keep what is right, re-runs on fresh servers |

> **For Claude — paste this (after a limit stop or crash):**
```
Model changed / session resumed. Do NOT relaunch agents from scratch. First assess what survived: run the typecheck for every app, run the unit tests, check which migrations are applied on staging and the CI branch, and read `git status`. List what is finished, what is half-done (file by file), and what has not started. Then continue only with what is left.
```

---

## 7. Background work, parallel sessions and worktrees

### Background tasks in one session

- Long commands (`npm ci`, builds, e2e, deploy polls) run in the background and wake the session. Claude should **not end its turn** while its own build or test run is going unless something else can wake it — a background agent once stopped "expecting to be woken" and never reported. Brief agents to wait in the foreground for their own chains.
- Deploy and CI **watchers**: after each push Claude polls the Vercel deployments for the pushed commit sha and the GitHub Actions run *by workflow name* (a Dependabot job failing on the same commit was once mistaken for CI).
- Out-of-scope findings become **background task chips** you can start as separate sessions (on Assemble: leftover e2e fixtures on staging, 3D viewer facing sideways, account deletion leaving storage files, switching the app to American English).

### Several sessions at once

Used from September: side tasks ran in separate git **worktrees** (`.claude/worktrees/<name>`), each with its own branch, its own copy of the gitignored env files and its own `npm ci`. Rules that kept them from colliding:

- **One build owner per output folder.** Two sessions building the same app overwrite each other's `.next` or `out/`; check for running `next`/`turbo build` processes before building and confirm the output is fresh before testing.
- **Heavy e2e runs alone on the machine.** Agents wait on a sentinel file (`E2E-DONE` / `E2E-RUNNING` in the scratchpad) before running typecheck or vitest.
- **Parallel-safety clause in every brief:** "Another session is editing [paths]; do not touch them. Other background tasks may edit [paths]: pull and rebase before pushing and resolve conflicts carefully."
- Never run `next dev` in a directory another process serves with `next start` (it clobbers the build).
- CI runs share one database branch: push once per round, and add a `concurrency` group to the workflow.

---

## 8. Multi-agent workflows

From the launch-readiness round onward, big rounds ran as **workflow scripts** (a small JavaScript file Claude writes) instead of one long turn. The shape that worked, every time:

```
Data  →  Build (2–5 agents in parallel, each owning disjoint files, all coding to ONE written API contract)
      →  Tests (one agent runs the full ladder, fixes spec failures, never ends its turn while the suite runs)
      →  Adversarial review (a reviewer tries to REFUTE the work against the brief; returns { refuted, defects[], notes })
      →  Fix loop (fixer → tests → re-review, at most two rounds)
      →  The MAIN session commits and pushes. Agents never touch git.
```

What each agent gets:

- A **common brief** (`AGENT-<ROUND>-COMMON.md` in the scratchpad): repo map, hard rules, database rules, migration style, verification ladder, "where things already are (verified)", the API contract, test conventions, report format and length cap.
- A **per-agent brief** (`AGENT-<X>.md`): numbered items, "files you own", tests to add, what not to touch.
- The standing rule block (also in `templates/briefs/AGENT-COMMON.md` and `templates/briefs/AGENT-BATCH.md`): no AI attribution anywhere · do not commit, push, stash or change git state · staging and CI databases only, never production, never `neon env pull` · never call real paid engines in tests · money in dollars · keep every existing guard · wait in the foreground for builds and tests · shared-file protocol (small anchored edits, re-read before each edit, append-only for shared hook files) · no fakes: every control real or removed · report under N lines with files changed, decisions, blocked items, exact commands and results.

When **not** to use a workflow: a small, well-understood fix (the render layering fix was done directly by the main session in ~30 minutes with targeted tests).

Other agent shapes used: research agents in parallel (four for the marketing proposal); verification agents that independently recompute numbers (the cost report had four re-checkers; the dollar conversion had a separate checker that caught a mistyped rate in the instructions); readers + writers + completeness checker (this guide).

> **For Claude — paste this (to launch a build round as a workflow):**
```
Run this round as a workflow, not a single turn. Write the briefs first into the scratchpad: AGENT-COMMON.md (repo map, hard rules, DB rules, migration style, verification ladder, the exact API contract, test conventions, report cap 60 lines) and one AGENT-<X>.md per builder with "files you own". Phases: data → parallel build on disjoint file sets → tests (full ladder, fix spec failures, stay in the foreground) → adversarial review returning {refuted, defects[], notes} → fix loop (max 2) → you commit and push from the main session with a message file and an attribution sweep. Agents never commit. Switch to the model I set before launching. Record the run id in memory so it can be resumed.
```

---

## 9. Memory and the chat archive

**Auto-memory** (Claude's notes for this working folder) should hold:

- a running project note (what exists, live URLs by name, current step, next step);
- one note per **decision round** (the answers, in your words);
- one note per **service failure mode** with its verification step ("Vercel tokens on this team expire; verify with one API call before polling; fall back to live-URL checks"; "never re-pull env for the CI branch");
- style rules you gave ("money in dollars, never cents").

**Never in memory:** tokens, keys, passwords, database URLs. On Assemble some early notes did contain values; the template `CLAUDE.md` forbids it.

**The chat archive:** `Project History/export-history.mjs` (template: `templates/archive/export-history.mjs`) turns every session transcript into readable Markdown with questions, options and answers, and masks secrets (`ghp_`, `github_pat_`, `vcp_`, `AIza`, `AQ.`, `sk-`, `re_`, `tsk_`, Postgres URLs, `password|secret|token|api_key` assignments — the same shapes as the secrets scanner). Keep it outside git, refresh after each batch, and add every new session id to its `SESSIONS` list. It is the raw material for the next replication guide and for any dispute about what was decided.

---

## 10. Closing a session or a milestone

> **For Claude — paste this (end of session):**
```
We are stopping for now. Do the close-out:
1. `git status` in every repo folder we touched; list uncommitted changes and ask me: commit, stash or discard (never decide alone).
2. Stop every local server you started and free ports 3000/3001 (and any http.server ports).
3. If tests mutated the staging demo profile, reset it (unless I said the demo is in use).
4. Update memory: project note (current step, next step, run ids), any new failure-mode note, any new rule I gave.
5. Refresh the chat archive with export-history.mjs if this was the end of a batch.
6. List every temporary token I pasted this session and remind me to revoke or rotate it now.
7. Give me a five-line summary: shipped, verified, waiting on me, deliberately later, next step.
```

---

## Assemble example

- **Session lengths.** The wireframes session ran from 14 July to 5 August 2026 in one conversation (265 of your messages, ~1,070 replies), compacting on 14 July at 22:03, 21 July at 07:10 and 4 August at 04:41. The UI-and-backend session part 1 ran 5 August to 3 September (465 messages), part 2 from 1 September onward (600+ messages, compactions on 1 Sep, 10 Sep, 11 Sep, 14 Sep and 17 Sep). Every compaction resumed mid-task without re-asking.
- **Models.** Part 2 ran on the strongest model until its weekly limit hit at 00:46 on 13 September during the security round; you switched to the mid model ("model changed continue."), and Claude assessed the surviving partial work (both apps typechecked, migration 013 already on staging and CI, 338/339 unit tests passing) instead of relaunching. On 16 September you pasted your usage report; Claude estimated the batch at 8–12 M tokens and advised running it on the mid model, switching *before* launching agents.
- **Workflows.** Eight workflow scripts were used in September: the 70%-pricing round (data → 4 builders → tests → reviewer), admin round push A (with an explicit API contract), the product-round fix loop, batch 3 (data → 3 builders → tests → review with up to two fix rounds), a two-fix parallel run, the cost-report dollar conversion with a verifier, a three-verifier pricing check, and the replication guide (7 readers → 4 writers → checker).
- **Interruptions.** Three API "ENOTFOUND" errors resumed with "Try again"; DNS outages on 13, 14, 15 and 16 September killed e2e runs and were resumed from the failed phase; one session break on 11 September was resumed with "continue" and re-ran only the affected specs; a cut-off answer about the admin emergency key was handled by applying Claude's stated default and reporting it in every later report.
- **Parallel sessions.** On 13 September at 22:20 three side tasks launched in the same minute in separate worktrees (account file cleanup, 3D front-facing fix, e2e fixture cleanup), each with a self-contained brief; one of them could not push because the machine's saved GitHub login had no repo access, and one session on 14 September died instantly on an API outage and simply needed relaunching because the brief was self-contained.

## Pitfalls

| Symptom | Cause | Fix | Prevent |
|---|---|---|---|
| "You've reached your … limit" mid-build; agents stop | Weekly pool on the premium model exhausted | Switch model; assess surviving work; continue | Estimate the batch against the usage report first; switch before launching agents |
| 30 e2e failures that pass alone | e2e run alongside builds/typecheck/agents; or `.next` rebuilt while `next start` served it | Re-run alone | Machine idle during e2e; sentinel file for agents; never `next dev` next to `next start` |
| 12 failures each under a second; ENOTFOUND to the DB host | Network/DNS outage | Wait, re-run or resume the phase | Check connectivity before debugging code; make migrations idempotent |
| A background agent never reports | It ended its turn while its own build ran | Tell it to wait in the foreground | Put "do not end your turn while a build or test run is going" in every brief |
| CI "failed" right after a push | Dependabot's job on the same commit | Watch the CI workflow by name | Filter runs by workflow name |
| Work "lost" after compaction | Decisions only in the conversation | Re-derive from memory and files | Scope docs, briefs, memory after every round; keep edits compiling |
| Two sessions overwrite each other's build output | Shared `out/` or `.next` | Check for running builds; confirm fresh output | One build owner per output folder; worktrees per side task |
| Browser batch rejected | More than 25 actions | Split the batch | — |
| Screenshots time out | Browser pane hidden; heavy blur | DOM measurements; lighter blur; headless Edge via puppeteer/Playwright | Plan DOM assertions as primary evidence |
| A plan-mode document "disappeared" | Plan files live under the user profile | Ask Claude to save it into the workspace with the exact absolute folder | Give absolute paths |
| Uncommitted work left hanging at session end | Nobody asked | `git status` at close-out | Use the end-of-session block |
| Claude Code login expired on a message | OAuth token of the desktop app | Re-authenticate, re-send | — |
