# 02 — How we work

**Goal of this chapter:** you know the loop every piece of work follows, the exact words that start it (the question-round contract), the standing rules Claude must obey in a client project, how to write a request or a bug report so it gets fixed first time, and what a finished round must report back.

Everything else in the guide is an application of this chapter. Read it fully once.

Links: session mechanics are in [01-running-the-sessions.md](01-running-the-sessions.md); the prompts quoted here are collected with their originals in [30-prompt-library.md](30-prompt-library.md); the test bar is detailed in [21-testing.md](21-testing.md); the standing-rules file to copy is `templates/CLAUDE.md` in [templates/](templates/).

---

## 1. The loop

Every request, from a one-line copy change to a 50-decision feature batch, went through the same loop. Small requests skip steps 2 and 3 only when you say "no questions".

1. **You send a request or a report** — in plain words, often with screenshots, usually ending with the question-round contract (section 2).
2. **Claude grounds itself first** — reads the relevant code or screens, reproduces the bug, or runs an audit agent, so its questions describe the *current* behaviour, not a guess.
3. **Question round** — one question at a time, multiple choice, one option marked "(Recommended)" with a one-line why. Your free-text answers correct assumptions or add scope. The last question is always about shipping ("Build it as summarised?", "one push or staged?").
4. **Decision summary** — decisions, trade-offs, "one thing from you", and a final confirmation question. Claude writes the decisions into a file (scope doc, brief or memory).
5. **Build** — directly for small rounds; as a multi-agent workflow for big ones ([01-running-the-sessions.md](01-running-the-sessions.md) §8).
6. **Verify with evidence** — the pyramid: typecheck → unit → build → e2e → (security scans) → commit → push → CI → deploy watch → live check on staging → demo reset. In the prototype phases: structural audit → click crawl → state tests → overflow sweep → deploy parity. Never "it should work"; always numbers.
7. **Report** — result line first, then what changed, root causes, a verification table, a **numbered phone-retest guide**, loose ends, and what is waiting on you.
8. **You test on a real device** and send the next report. Only your hands on a phone found the blank admin panel, the sideways avatars, the Samsung install block and the case-sensitive delete word.
9. **Stop and wait.** Claude starts nothing new until you send the next batch ("for the next batch I want you to first wait" was honoured every time).

**Why the loop works:** decisions are made *before* code, with you; every claim of "done" is backed by a test; you always have a way to check it yourself.

---

## 2. The question-round contract

This is the most-used text in the whole project. From 1 September 2026 it was appended, verbatim, to nearly every request. Earlier variants said the same thing more briefly ("ask me at least 20 questions … one by one … multiple choice … highlight the recommended by you").

> **For Claude — paste this (append to any request):**
```
Before we proceed, ask me at least [N] questions so you can fully understand what I'm trying to achieve. Ask the questions one at a time, and for each question, give me multiple-choice options to choose from. Clearly highlight the option you recommend and briefly explain why. Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf.
```

### How many questions

| Size of the request | N | Examples from Assemble |
|---|---|---|
| A pair of bugs, a small fix, a config change | 5 | required item in match; render layering; multi-item photo refusal |
| One feature or a medium change | 10–15 | profile pictures; photo checks; batch 3 (six observed issues) |
| A new subsystem or a redesign | 20–30 | the branded redesign (30); Step 1.5 scope (24); public share links (15 + 15 more); tech stack (17); landing page (25 per round); security review (25) |
| "Make everything real" / audit-and-finish rounds | 50 | launch readiness; categories + shop + admin + audit |

Claude usually asks *more* than N when a topic needs follow-ups (asked for 20, got 30; asked for 50, got 67). That is fine.

### How to answer

- **Pick the recommended option** when you have no opinion; Claude's recommendation always carries a reason.
- **Type free text in "Other"** to correct a wrong assumption ("there are 2 types of avatar…"), to add scope ("everything else possible"), to override with a rule ("never show the vendor name in the app"), to pause ("let's not do step 2 now"), or to add a requirement that just occurred to you.
- **Change an earlier answer:** "I want to change my answer for Q14" — Claude re-asks it.
- **Ask for a re-ask:** "re-ask question 37", "could you re-ask in simpler words", "explain this like I'm 15", "what do you mean by …?" — Claude re-asks with sharper or plainer options.
- **Ask for more:** "15 questions didn't do justice — ask me at least 15 more."
- **Dismiss** a question if you need to stop: Claude summarises decisions so far and what is still to ask, and waits.
- If you paste the wrong thing as an answer (it happened), Claude uses the recommended option and says so; re-read answers before submitting.

### What Claude must do in a round

> **For Claude — paste this (question-round rules; put them in CLAUDE.md too):**
```
Question-round rules:
- Read the relevant code/screens first so options describe current behaviour. Say "I'm reproducing this on staging now" when you are.
- One question per turn via the multiple-choice tool; 2–4 options; exactly one marked "(Recommended)" with a one-line reason; name the trade-off of each option.
- Always include questions on: scope edges, what costs the user credits/money, privacy and consent, what the demo account does, how we test (unit + build + Playwright e2e + live staging check + CI), and how it ships (one push or staged, which repo, which database branches).
- If an answer carries legal, policy or money risk (presenting AI people as real, removing provider watermarks, a free path that leaks paid work), check the facts first, explain the risk plainly, quantify the money effect, and offer a compliant option that keeps what I want. Then respect my choice.
- If an answer does not map to the options, re-ask. If I ask, re-ask in simpler words.
- After the last answer: a summary with Decisions / Trade-offs / One thing from you, then "Build it as summarised?" with options Yes / Yes with a variant / Change something first.
- Write the decisions into a file (scope doc in the repo or a memory note) before building.
```

---

## 3. How you talk to Claude — request patterns that worked

Each pattern below is a template; the originals with dates are in [30-prompt-library.md](30-prompt-library.md).

**Bug report (the format that got one-shot fixes):**
```
In [app], after [precondition], go to [screen], open [item], tap [control], then [action].
Instead of [expected], it [actual]. It should [expected]. [Screenshot attached.]
```
Add "Think of other similar scenarios too so [flow] is accurate and bug-free" when you suspect a family of cases (that sentence produced ten photo-refusal kinds instead of one).

**A batch from phone testing:** number the items; give each its own question count if they differ; put one-line direct changes last without questions.
```
From phone testing: (1) [admin setting doesn't reach the app]; (2) [auth edge case + the rule I want]; (3) [privacy leak + broken button]; (4) [state messaging + desired modal]; (5) [chart change]; (6) [layout order]. [question-round contract, N=15]
```

**Understand before changing:** "Don't write any code — just tell me: how does [feature] actually work today when [user action]? Be honest about what is fake or missing." (This is how the missing public share links were discovered.)

**Status:** "What's left in [phase]? Split it into: still running, waiting on me, deliberately later." / "List in simple English, no technical words, what the app can do today and what comes next."

**Discuss before implementing:** "I think [feature] should [behaviour] so [benefit]. What do you think? Let's discuss before making any change." Asking for an opinion rather than giving an order produced better designs (just-in-time consent instead of onboarding consent).

**Scope guards:** "Nothing changes in the frontend repo; the live domains stay on the current build; everything new stays on staging until I say so." / "never switch — I'll tell you later." State them once; Claude carries them through compaction.

**Apply an existing rule elsewhere:** "Just like [existing pattern] works for [case], do the same for [new features]."

**Domain rule first, then the change:** "On [area]: understand one thing — [rule]. Therefore remove [X], delete [Y], add [Z] (example: '…')."

**Reference the tool's own look:** "I don't like how it looks; it looks better on [tool] with their dark background — check the screenshot."

**Restraint:** "What can we do to make this more premium? Nothing flashy!" / "Exactly the attachment, don't make any changes."

**Sequencing:** "First finish [pending] and push. Then create a separate branch and work on [problem]. Ask only the direction question, then decide the details yourself."

**Bonus fixes:** "And can you think of any more bonus fixes (inconsistencies, stale docs, unrealistic data)?"

**Targeted tests:** "Don't run the whole 2.5-hour suite: targeted tests plus one real check on staging; CI runs the full suite."

**Hard stop / hold:** `stop` · "for the next batch I want you to first wait" · "when it's complete don't run any task, I'll give you the next batch".

**Merge gate:** "Are we ready to merge [branch] to main?" → Claude runs the full sweep and lists what it could not verify → you say `merge`.

**Short confirmations that mean go:** "go", "push", "yes", "ready", "merge", "lets do it", "proceed to stage C".

---

## 4. The standing rules (what goes in `CLAUDE.md`)

These rules were given once each, sometimes painfully, and then held for the rest of the project. Put them in the project's `CLAUDE.md` on day 1 (`templates/CLAUDE.md` has them ready), so every session and every sub-agent starts with them.

**Identity and attribution**

1. **No AI attribution anywhere in a client repo** — not in commit messages, trailers, comments, docs or tests. Client deliverables are presented as the agency's work. A grep for attribution words runs before every commit. (Early prototype repos carried a co-author trailer; the backend repo was created as a fresh single commit to leave that behind. Do not copy the old practice.)
2. Commits are authored as the **repo owner's GitHub identity**, set **repo-locally** right after `git init`: `git config user.name <GITHUB_OWNER>` and `git config user.email <ID>+<GITHUB_OWNER>@users.noreply.github.com`. **Why:** Vercel on a Hobby plan blocks deploys from private repos whose commit author is not the project owner.
3. **Never name the client** in code, copy, marketing pages, demo data or docs; the demo profile is "Demo User" with an `@example.com` address. The agency is credited as "Development partner: Deep Learn HQ", never "designed and built by".
4. **Never show a vendor's name in the product** when the deal is not sponsored ("the 3D engine", not the vendor).

**Secrets**

5. Secrets live only in gitignored env files, the hosting dashboard and GitHub Actions secrets. **Never in code, docs, memory notes, briefs or commit messages.** Output is redacted (`sed -E 's/ghp_[A-Za-z0-9]+/ghp_***REDACTED***/g'` and friends). A token pasted in chat is treated as compromised and rotated after use. Tokens are used inline in a push URL and never with `-u`; `.git/config` is checked after every push.
6. A token is **verified with one API call before it is relied on** (GitHub: repo lookup → 200; Vercel: one deployments call → an array comes back). Never loop on a 403.
7. `neon env pull` is never run for a branch whose credentials feed CI secrets (it mints new storage credentials and silently breaks CI). Branch credentials are saved once in a gitignored file.

**Environments**

8. **Production is never touched without an explicit instruction.** New work goes to staging (its own Vercel projects and its own database branch). Migrations are applied to staging and the CI branch the same day; to production only at cutover, after a rehearsal on a fork of production.
9. Tests **never call real paid engines**: `GEMINI_MOCK=1` and `TRIPO_MOCK=1` on *every* server the tests start. One real paid call on staging per deploy is agreed explicitly and its data cleaned up.
10. CI has its own database branch. **Never share a database between CI and any live environment** (a CI run once wiped a live 3D build mid-poll).

**Git hygiene**

11. `main` auto-deploys. Big or risky change batches go on a branch, get a preview, and are merged only after your verification ("Since there are major changes I want you to use branching and after verified we will merge"). One-line changes after a merge may go straight to `main`, still verified first.
12. Rejected experiments are **deleted** (local and remote); merged branches are cleaned up; stale duplicate deliverable files are deleted. "When I say remove I mean delete from code so it doesn't confuse the dev."
13. Stage explicit paths, never `git add -A` with scratch files around (helper scripts were swept into commits three times). Commit messages are written to a file and used with `git commit -F`; no embedded double quotes on PowerShell.
14. Push once per round (overlapping CI runs collide on the shared CI database); `concurrency: group` in the CI workflow.

**Product truthfulness**

15. **No fakes.** Every control either works for real or is removed. The only labelled exception is payments in test mode. Demo fixtures only behind the demo check.
16. **Copy never promises what the app does not do** ("receipts are emailed", "within 30 days", roadmap phrases); a unit test bans such phrases. Counts derive from data, never hard-coded.
17. **Admin coherence:** every list, price, label and id in the admin panel matches what the customer app actually uses; admin-editable lists must have a consumer test.
18. **Don't show metrics you can't track** (affiliate revenue from clicks, invented subscriber counts).
19. **Consent wherever sensitive data is captured** (photo analysis, biometric-adjacent data), recorded with timestamps and checked by the features that need it; admin never sees user photos.

**Style**

20. Money is written in dollars with decimals (`$0.15`), never in cents. Language is decided per app (Assemble: American English on the landing page; the app switched from British). Plain English for the client; no emoji in client documents; no backend-speak in UI copy.
21. Icons and imagery rules once given are protected ("the closet icon is never changed again").

> **For Claude — paste this (if `CLAUDE.md` is missing or a sub-agent needs the rules inline):**
```
Standing rules for this project (they override your defaults):
1. No AI attribution anywhere in client repos (commits, trailers, comments, docs, tests). Grep before every commit.
2. Commit identity: repo-local `user.name`/`user.email` = [GITHUB_OWNER] / [ID]+[GITHUB_OWNER]@users.noreply.github.com. Push with an inline token URL, never `-u`; check .git/config afterwards; redact tokens in output.
3. Never name the client; demo identity is "Demo User" <demo@example.com>; agency credit = "Development partner: Deep Learn HQ".
4. Secrets only in gitignored env files, Vercel env and GitHub Actions secrets. Never in code, docs, memory or briefs. Verify any token with one API call before relying on it. Never run `neon env pull` for a CI branch.
5. Production is untouched without my explicit instruction. Staging + CI branches only. Migrations additive and re-runnable; applied to staging and CI the same day; production only at cutover after a fork rehearsal.
6. Tests never call real paid engines (GEMINI_MOCK=1, TRIPO_MOCK=1 on every test server). One agreed real call on staging per deploy, then clean up.
7. Every change goes through the full test bar unless I say "targeted"; never run tests during a build; machine idle during e2e.
8. No fakes: every control works for real or is removed; copy never promises what the app doesn't do; counts come from data.
9. Money in dollars only ($0.15). [American/British] English. Plain language for the client. No emoji in client documents.
10. Start nothing new after a round; report, then wait for the next batch.
```

---

## 5. Branches, repos and environments

- **Prototype era** (single HTML files): `main` deploys to Vercel; a branch per risky batch (`demo-placeholders`, `client-revisions-1`, `feature-3d-avatar`) with a Vercel preview; fast-forward merge after your click-through; backup pushes of a feature branch to a second empty repo when the client's sign-off was pending; a `PROJECT-HANDOFF.md` written before the code moved to the next repo.
- **Full-stack era:** one monorepo → three Vercel projects (customer app, admin, site) with different root directories; production domains on the frontend repo; when the backend phase started, the whole folder was **copied to a new folder, given a fresh single-commit history, pushed to a new repo, and wired to two staging Vercel projects and a staging database branch**. Urgent production fixes went to the frontend repo first and were **mirrored** to the backend repo so nothing is lost at cutover.
- **Environment ladder:** `production` (live), `staging` (backend dev and presentations), `ci` (frontend CI), `ci-backend` (backend CI), temporary forks for cutover rehearsal — each with its own database and storage bucket.

---

## 6. What a finished round must report

Claude's reports on Assemble converged on this shape; ask for it by name ("the usual report").

1. **Result line** with the commit hash and where it is live.
2. **What changed**, grouped by the numbered decisions.
3. **What was wrong** (root causes, not symptoms) — including things found along the way.
4. **Verification table**: typecheck ✓, unit N/N, builds ✓, e2e N passed / N skipped, CI run time, deploys READY, live checks N/N, demo reset.
5. **Phone retest guide**: 3–9 numbered steps, each "do X → you should see Y", separate App and Admin lists, a "not tested live" section with manual steps, "use a throwaway account" where deletion is real.
6. **Decisions for you** (anything Claude had to assume) and **loose ends**.
7. **Waiting on you / deliberately later.**
8. Honest caveats ("I can't produce screenshots while the pane is hidden; a 60-second click-through is the final peace of mind").

For prototype batches the equivalent was a **task-completed table** (# / change / purpose) and an **acceptance sweep table** (# / test / what it proves / result).

---

## 7. Living documents

Keep these in the repo and update them every round; a new session reads them first.

| Document | Purpose | Started |
|---|---|---|
| `README.md` | Structure, run commands, test pyramid, deployment table — client-presentable | Step 1 |
| `PROJECT-HANDOFF.md` | "Read this first if you are a new session": what, repos, run/verify, architecture, change log, conventions, limitations | End of the prototype phase |
| `STEP-<n>-SCOPE.md` | The decisions of a question round, committed | Step 1.5 |
| `LAUNCH-READINESS.md` | Gap table per area: # / gap / decision / status **with the test that proves it** | Launch-readiness round |
| `CUTOVER-RUNBOOK.md` | Rehearsed cutover sequence: migrations in order, env lists, config script, verify script, rollback | Backend |
| `SECURITY.md` + `SECURITY-SUMMARY.md` | Each review item → what the app does → where the proof lives; a one-page plain-words version | Security round |
| `CLIENT-HANDOVER-CHECKLIST.md` | Who owns what, safe key handover, per-service steps for the client, what happens after | Before cutover |
| `HANDOVER.md` | "Read this first": standing instructions, where things live, the project's own tools, services, current state, machine quirks — enough to continue in a **fresh session or a different account** | First checkpoint, updated at every one |
| `PLAN-NEXT.md` | The ordered plan for the phases still to build, with the decisions already made for each and the traps that cost time | When a limit or a break is in sight |
| Prototype era: `Coverage.html`, `Walkthrough.html`, `Presenter Script.html` | Proof of scope, a 5-minute demo story, a per-screen script — synced every round | Wireframes |

Outside the repo: memory notes, agent briefs (scratchpad), the chat archive, the cost report and marketing documents (margins and proposals never go into a client repo).

---

## 8. Working with the client

- **The prototype is the source of truth**, not a written critique: "a final prototype that dev will use to create frontend and backend, so everything needs to be complete." Scope is strict in both directions (nothing extra, nothing missing) and the coverage matrix proves it without percentages.
- **Client revisions arrive as numbered batches**; you re-send the whole batch when you add items; Claude echoes "everything I captured" before asking decisions.
- **Additional modules** are pitched in a client document (What it is · Why it matters · Where you'll see it · How it works · How it can earn (client picks one) · Our suggestion; pricing revealed at the end) with a separate internal build guide.
- **The client never sees staging** until you decide; the production cutover waits for the client's own paid AI key and their approval of the landing page.
- **The client's likeness and name stay out of marketing**; fictional AI-generated people run through the real app on separate marketing accounts, with a plain footer line saying they are AI-generated and no first-person testimonials.
- **Keys from the client** arrive via Bitwarden Send (expire after one day and one opening) or by phone — never chat, email or a shared document.

---

## Assemble example

- **The contract in numbers.** Rounds of 30 (5 Aug, the redesign), 7, 5, 30, 47, 67, 31, 15 (5–6 Aug), 17 (tech stack, 21 Aug), 24 (Step 1.5, 28 Aug), 32 (round 4), 5, 7, 5 (1 Sep), 10 (2 Sep), 6, 30, 50 (10 Sep), 10, 5, 50 (11 Sep), 10, 5, 5 (12 Sep), 25 (security), 25, 25 (landing), 15, 5, ~50 (batch 2), 15 (batch 3), 6 (render fix), 16 (this guide). The 67-question round took 73 minutes and its build 15.
- **A correction that saved a feature.** 5 Aug 2026, 19:42: "there are 2 types of avatar, one is a 2D image and one is the 3D avatar; the 4 pictures are only for the 3D avatar generation; during onboarding we are just introducing our 3D feature." One sentence, and every later round carried it.
- **A domain rule first.** 21 Jul 2026, 05:46: "understand one thing — a campaign is not for a product, it takes the user to the brand page; therefore remove the TYPE column…" Claude applied the rule to helper copy too.
- **Honesty that changed the plan.** 10 Sep 2026, 01:42: asked "don't write code, tell me how sharing works when someone copies a link", Claude answered that there was no public link at all and that a 3D share showed a placeholder model. The next 30-question round built public share links.
- **A pushed-back diagnosis.** 21 Jul 2026: "blank even after hard refresh" forced Claude to stop blaming the cache and find the real layout bug (the login panel was below the fold). Lesson logged: assert elements are *inside the viewport*, and treat repeat reports as real bugs.
- **The no-fakes round.** 10 Sep 2026, 03:12: "I want the backend to have zero gaps… the only thing to leave behind is the payment… ask me at least 50 questions." An audit found 31 toast-only controls, 22 client-only toggles, 17 fixture leaks, 13 placeholder modals, 20 unwired admin controls, 11 untrue copy lines and 9 roadmap strings. Five parallel agents, one commit, 148 unit tests, 18 spec files, a 30-check live pass, a 9-step phone guide.

## Pitfalls

| Symptom | Cause | Fix | Prevent |
|---|---|---|---|
| A wall of 12 questions in one message is hard to answer | Batched questions | One at a time, multiple choice | Use the contract text |
| Claude built the wrong thing well | A wrong product assumption in the recommended option | Correct it in one sentence in "Other" | State monetisation and data-model rules at the start of a round; save them to memory |
| "You forgot to change it" | Stale deploy or cached HTML | Check the Deployments tab, hard refresh, cache-buster, deploy-parity markers | Claude verifies deploy parity before asking you to review |
| Fix applied to the wrong feature | "Avatar" meant 3D model in the app, profile picture to you | Rename the component; restate scope | Keep a glossary of overloaded words in the brief |
| Over-building (an HDRI panel when you wanted "brighter") | Request referenced a tool's feature | "What I'm trying to say is…" | Claude restates the goal in one line before anything large |
| A pasted instruction landed as an answer | Paste slip | Claude used the recommended option | Re-read answers before submitting |
| Decisions lost across a compaction | Only in chat | Re-derive from files | Scope doc + memory after every round |
| Helper script committed | `git add -A` | Removal commit | Explicit paths; scratch files outside the repo |
| AI attribution slipped into a client repo | Tool default | Fresh single-commit history for the client repo | Attribution grep before every commit; rule in `CLAUDE.md` |
| Client name appeared in demo data/marketing | Seeds copied from the real person | Rename; nightly reset writes the neutral identity | Neutral demo identity from day 1 |
| A "remove" was implemented as "hide" | Ambiguity | Delete from code | "Remove means delete from code" in the rules |
| Password or key printed in chat | You asked from memory | Rotate | Password manager; never ask Claude for a value |
