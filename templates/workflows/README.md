# Workflow scripts

Two Claude Code Workflow scripts, generalised from the eight that ran on Assemble in September 2026.

| File | Shape | When |
|---|---|---|
| `batch-workflow.js` | Data → parallel Build → Tests → adversarial Review → fix loop (max 2 rounds) | Any feature batch after a question round (pricing round, push A, push B, batch 3 on Assemble) |
| `fix-loop-workflow.js` | Fix → one clean Tests run → Re-review | A review came back `refuted: true`, or you confirmed defects yourself |

## Rules that made them work
1. **Briefs first.** Write `AGENT-COMMON.md` and `AGENT-BATCH.md` to the scratchpad before launching. Every agent prompt starts by reading them. Decisions live in files, so they survive compaction and outages.
2. **Disjoint ownership.** Each build agent owns a set of folders; shared files get small anchored edits only. The API contract is in the brief before anyone starts, so server and UI agents can build in parallel.
3. **Agents never commit.** The main session commits with a drafted message, scans for attribution and secrets, pushes once.
4. **Foreground waits.** An agent that ends its turn while its own build runs never reports (2026-09-13 site agent). The prompts say "do not end your turn while it runs".
5. **Adversarial review with a schema.** The reviewer's job is to refute; `{ refuted, defects[], notes }` lets the loop read it. Push A's review found 13 real defects after every test had passed.
6. **Bounded loop.** Two fix rounds, then a human looks.
7. **Truncated hand-offs.** `String(x).slice(0, N)` keeps later prompts small.
8. **Transient vs real failures.** DNS outages happened on 13, 14, 15 and 16 September; the tests prompt tells the agent how to tell the difference and what to re-run.
9. **Resume, don't restart.** Workflows are resumable from a run id (`resumeFromRunId`); finished agents replay from the journal. Switch model **before** launching (agents inherit it).

## Other shapes used on Assemble (write on the same pattern)
- Two unrelated fixes in parallel, then a verifier that must show the new test fails on the old code (camera fix + ring mark, 2026-09-15).
- Convert agent limited to two files + read-only verifier (dollars conversion of the cost report, 2026-09-15).
- Three parallel read-only verifiers: independent re-implementation of a model, a product-side sanity check, a vendor-price check from official pages only (pricing model, 2026-09-15).
- Readers per source slice → writers per chapter → completeness checker (this guide, 2026-09-17).
