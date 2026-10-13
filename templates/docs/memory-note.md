---
name: [kebab-case-name]
description: "[One line: the fact, the date, and the verification step — this is what the index shows]"
metadata:
  type: [project | reference | feedback]
---

# [Title]

> Template for a Claude Code auto-memory note (`~/.claude/projects/<project>/memory/<name>.md`, indexed in `MEMORY.md`). Assemble kept one note per service failure mode and one running project log; that is why compaction, model switches and cold starts never lost a decision. **Never store a secret value in a note** — several early Assemble notes did, which is the one thing to fix when copying the pattern.

[The fact, in two or three sentences: what is true now, since when, and what changed it. Link related notes as [[other-note]].]

**Why:** [the root cause or the reason the rule exists — one or two sentences].

**How to apply:** [the exact behaviour next time: the check to run first, the file to read instead of re-pulling, the fallback when it fails, who to ask].

**Log:**
- [YYYY-MM-DD] — [what happened, commit hash if any]

## Examples of notes worth keeping (from Assemble)
- `[service]-token-expired` — tokens on this team expire; verify with one call before polling; fall back to live-URL checks.
- `backend-ci-branch` — CI runs on branch `ci-backend`; creds saved once in `.env.ci-backend`; never re-pull.
- `money-in-dollars` (feedback) — write $0.17, never cents; the user finds cents confusing.
- `batchN-decisions` — the answers of a question round, so a new session can read them instead of re-asking.
- `[app]-project` — the running build log: what shipped, pending items, next phase.
- `replication-guide-task` — a pending task with its trigger ("after batch 3, ask 15 questions first").

## MEMORY.md index line
`- [Title]([kebab-case-name].md) — one-line description with the verification step`
