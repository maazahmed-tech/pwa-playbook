// Batch workflow: Data → parallel Build (disjoint ownership, one API contract) → Tests (full ladder)
// → adversarial Review → bounded fix loop (fixer → tests → re-review, max 2 rounds).
//
// This is a Claude Code Workflow script (the `workflow-authoring` skill documents the API:
// `meta`, `phase()`, `agent()`, `parallel()`, `log()`, and `return`). It was the shape of every
// September batch on Assemble (pricing round, push A, push B, batch 3). Agents never commit;
// the main session commits and pushes after the script returns.
//
// Before running: write the two briefs to the scratchpad (AGENT-COMMON.md and AGENT-BATCH.md),
// make sure the tree is clean at a known SHA, switch the session model if you want the agents on
// a cheaper model (they inherit it at launch), and estimate the batch against your weekly limit.

export const meta = {
  name: '[app]-batch-[N]',
  description: 'Batch [N]: [one-line list of items] — build, test, review, fix loop',
  phases: [
    { title: 'Data', detail: 'migration [NNN], schema, cutover scripts' },
    { title: 'Build', detail: 'web server, web UI, admin in parallel' },
    { title: 'Tests' },
    { title: 'Review & fix', detail: 'up to two fix rounds' },
  ],
}

// Absolute scratchpad path (Windows: double the backslashes). Briefs live here, never in the repo.
const S = '[C:\\\\Users\\\\<you>\\\\AppData\\\\Local\\\\Temp\\\\claude\\\\<project>\\\\<session>\\\\scratchpad\\\\]'

// Every agent starts with the same preamble: read the briefs, stay in your ownership set, never touch git,
// run your own checks in the foreground, keep the report short.
const PRE = `Read ${S}AGENT-COMMON.md (hard rules, migration style, test ladder) then ${S}AGENT-BATCH.md (this batch, decisions final). Work only inside your ownership set. Do not commit, push, stash or change git state. Run your own checks in the foreground before reporting (under 60 lines).`

// The reviewer must return this shape so the fix loop can read it.
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    refuted: { type: 'boolean' },
    defects: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['refuted', 'defects', 'notes'],
}

// Reports are passed forward truncated so later prompts stay small.
const cut = (x, n) => String(x ?? '').slice(0, n)

phase('Data')
const data = await agent(`${PRE}
You are the data agent (ownership: packages/db/**, tools/cutover/**, applying migrations).
Migration [NNN] in the style of the latest one: [tables/columns with IF NOT EXISTS; backfill rules; print counts]. Update packages/db/src/schema.ts. Apply to staging and the CI branch; extend tools/cutover/config.mjs + verify.mjs and run both on both branches. Run tsc for apps/web and apps/admin (shared types).`, { label: 'data', phase: 'Data' })
if (!data) throw new Error('data agent returned nothing')

phase('Build')
const [server, ui, admin] = await parallel([
  () => agent(`${PRE}
You are the web server agent (ownership: apps/web/app/api/**, apps/web/lib/**, apps/web/auth.ts, apps/web/middleware.ts). Data report: ${cut(data, 2000)}
Implement the server halves of [C1–C4] exactly to the API contract in AGENT-BATCH.md. Add unit tests in apps/web/tests. Run tsc apps/web and vitest apps/web.`, { label: 'web-server', phase: 'Build' }),

  () => agent(`${PRE}
You are the web UI agent (ownership: apps/web/app/(auth)/**, apps/web/app/(main)/**, apps/web/components/**). Data report: ${cut(data, 1500)}
The server agent is concurrently changing API routes and lib to the shapes in the API contract; code to those shapes and re-run tsc at the end.
Implement the UI halves of [C1–C4, C6]. Run tsc apps/web and vitest apps/web.`, { label: 'web-ui', phase: 'Build' }),

  () => agent(`${PRE}
You are the admin agent (ownership: apps/admin/**). Data report: ${cut(data, 1200)}
Implement [C1 admin side, C4 admin side, C5]. Run tsc apps/admin and its build.`, { label: 'admin', phase: 'Build' }),
])
if (!server || !ui || !admin) throw new Error('a build agent returned nothing')

phase('Tests')
let tests = await agent(`${PRE}
You are the tests agent. Reports — data ${cut(data, 1200)} | server ${cut(server, 2200)} | ui ${cut(ui, 2200)} | admin ${cut(admin, 1200)}
Write the tests listed in C7 (tools/e2e conventions, mocked engines; new throwaway accounts in global-setup if a spec mutates state; never the marketing/demo accounts) and update specs that asserted old behaviour.
Then run the full ladder in the foreground: tsc web/admin/site, vitest apps/web and apps/site, npx turbo run build, free :3000/:3001, E2E_DB=1 npx playwright test (single worker; do not end your turn while it runs).
Transient staging DB drops (ENOTFOUND, connection terminated, fetch failed): re-run only those spec files and report both results. Real failures: fix (say whether test or product) and re-run the full suite. Report counts and failure text.`, { label: 'tests', phase: 'Tests' })

phase('Review & fix')
let review = await agent(`${PRE}
You are the reviewer. Reports — data ${cut(data, 1000)} | server ${cut(server, 1500)} | ui ${cut(ui, 1500)} | admin ${cut(admin, 900)} | tests ${cut(tests, 1500)}
Read git diff and try to REFUTE the batch against AGENT-BATCH.md. Look for: [one clause per decision, phrased as the failure it would be — e.g. "any route that lets a Google-only email use a password path or sends a code first"; "a locked value writable without a code"; "receivers able to see shop pieces through any API"; "any 'demo' wording in user-facing auth messages"; "any AI attribution or cent sign"; "numbers that disagree with the method in the brief"].
List defects as file:line + the fix; refuted=true if anything would ship wrong. Tests passing is not evidence of correctness.`, { label: 'review', phase: 'Review & fix', schema: REVIEW_SCHEMA })

let round = 0
while (review && review.refuted && round < 2) {
  round++
  log(`Fix round ${round}: ${review.defects.length} defects`)
  const fix = await agent(`${PRE}
You are the fixer (any file this batch touched). Confirmed defects:
${review.defects.map((d, i) => `${i + 1}. ${d}`).join('\n')}
Fix all with tests. Run tsc web/admin/site and vitest apps/web; re-run any migration you change on staging + the CI branch with verify.mjs.`, { label: `fixer-${round}`, phase: 'Review & fix' })

  tests = await agent(`${PRE}
You are the tests agent (round ${round}). Fixer report: ${cut(fix, 2500)}
Run the full ladder in the foreground ending with ONE clean E2E_DB=1 npx playwright test run (single worker). Transient DB drops: re-run those spec files and report both. Real failures: fix and re-run the full suite. Report counts.`, { label: `tests-${round}`, phase: 'Review & fix' })

  review = await agent(`${PRE}
You are the re-reviewer (round ${round}). Previous defects:
${review.defects.map((d, i) => `${i + 1}. ${d}`).join('\n')}
Fixer: ${cut(fix, 2000)} | Tests: ${cut(tests, 1200)}
Confirm each defect fixed (file:line) or still broken, and spot-check the whole batch for regressions (same refute list as the first review). refuted=true if any defect remains or a regression exists; list only what is still wrong.`, { label: `re-review-${round}`, phase: 'Review & fix', schema: REVIEW_SCHEMA })
}

return { data, server, ui, admin, tests, review, fixRounds: round }
