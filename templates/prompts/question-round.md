# Question-round prompt (the most-used message in the whole project)

Every feature, fix batch, document and design round on Assemble started with this block. It is the reason decisions were made *together* and the reason Claude never built on a wrong assumption for long. Paste it at the end of any request.

## The standard block (use verbatim, change only the number)

> **For Claude — paste this:**
```text
Before we proceed, ask me at least [N] questions so you can fully understand what I'm trying to achieve.
Ask the questions one at a time, and for each question, give me multiple-choice options to choose from.
Clearly highlight the option you recommend and briefly explain why.
Based on my answers, we'll discuss the trade-offs and make the decisions together rather than you making assumptions on my behalf.
```

How to pick N (what worked on Assemble):

| Size of the request | N | Assemble examples |
|---|---|---|
| A bug pair or one small change | 5 | required item in a match (2026-09-10), render layering (2026-09-17) |
| One feature | 10–15 | photo checks (2026-09-11), batch 3 (2026-09-16) |
| A new subsystem | 15–30 | public share links: 15, then "15 more" (2026-09-10) |
| A whole design or "make everything real" audit | 25–50 | UI redesign 30 (2026-08-05), zero-gap round 50 (2026-09-10), security 25 (2026-09-12) |

## The fuller version (for a new session or a big round)

> **For Claude — paste this:**
```text
[Describe the feature, problem or document in plain words. Include what you saw, on which account/device, and what you expected.]

Before writing any code, read the relevant files so your questions describe current behaviour, not guesses.
Then ask me at least [N] questions, ONE AT A TIME, each as multiple choice.
Mark one option "(Recommended)" and give a one-line reason for every option.
Cover: scope edges, what costs the user credits, privacy, what the demo account does, how we test
(typecheck + unit + build + Playwright e2e + live staging check + CI), and how it ships (one push or staged).
After the last answer, summarise Decisions / Trade-offs / One thing you need from me, then ask
"Build it as summarised?" and wait for my "go".
```

## Useful follow-up lines (all real, all worked)

| You say | Claude does |
|---|---|
| `Ask that question again in simpler words.` | Re-asks the same question with plainer options. |
| `Re-ask question 14 — I want to change my answer.` | Re-asks Q14, then continues. |
| `15 questions didn't do justice. Ask me at least 15 more.` | Extends the round without restarting it. |
| `Other: [free text]` (typed into the answer box) | Treats it as a correction or added scope and re-asks what it affects. |
| `[Dismiss the question]` | Pauses, summarises decisions so far, waits. |
| `stop` | Halts and confirms nothing was changed. |
| `Build it as summarised.` / `go` | Starts the build. |
| `For the next batch, first wait. When this is complete, start nothing new.` | Finishes only the agreed round. |

## Originals that inspired this (dates)

- 2026-07-14 02:30 — "lets plan first ask any questions before we proceed?"
- 2026-07-21 02:43 — "Give suggestion to me to choose from for decisions and ask me any questions before writing code, we need to collaborate so i can provide you correct context."
- 2026-08-04 02:51 — "ask me like one by one with multiple choice"
- 2026-08-05 03:33 — "Ask at least 20 questions to understand discuss the UI and take decisions together, got it? ask one by one and give multiple choice options to select from and highlight the recommended by you."
- 2026-09-01 04:19 onward — the standard block above, word for word, on nearly every request.

## Bootstrap message for a brand-new app session

> **For Claude — paste this:**
```text
Read CLAUDE.md in this folder fully — it holds our standing rules. Then read [PLAYBOOK or 00-index.md] fully — it defines the process, milestones, tech stack and pitfalls.
My proposal for the new app is [PATH]. Brand assets: [PATHS | none — run the brand question round first].
The GitHub repo is [OWNER/REPO]; Vercel auto-deploys main.
Start Phase 1: read the proposal and give me the screen inventory, roles, flows and monetisation map.
Then run the decision round — ask at least [30] questions, one at a time, multiple choice, recommended option first with a one-line why.
Don't build until I say go.
```
(Original: `UI-Build-Playbook.md` §12, written 2026-08-20.)
