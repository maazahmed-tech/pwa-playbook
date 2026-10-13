// Fix-loop workflow: a fixer takes a list of CONFIRMED review defects (file:line + the fix),
// the tests agent produces ONE clean full run, and a re-reviewer confirms each defect and
// spot-checks for regressions. Used on Assemble after push B's review found six defects
// (2026-09-16). Run it when a review came back `refuted: true` outside a batch workflow,
// or when you confirmed defects yourself.

export const meta = {
  name: '[app]-fixes-[round]',
  description: 'Fix confirmed review defects, one clean full test run, re-review',
  phases: [{ title: 'Fix' }, { title: 'Tests' }, { title: 'Re-review' }],
}

const S = '[ABSOLUTE SCRATCHPAD PATH WITH TRAILING SEPARATOR]'
const PRE = `Read ${S}AGENT-COMMON.md and ${S}AGENT-BATCH.md. The batch is implemented in the working tree (uncommitted). Do not commit or change git state. Run your own checks in the foreground before reporting.`

// One line per defect: where, what is wrong, exactly what to change, and how to prove it.
const DEFECTS = `Confirmed review defects:
1. [path:line] — [what is wrong]. Change to [exact fix]; extend [test file] to assert [X].
2. [path:line] — [what is wrong]. [Fix]; add a unit test.
3. [path] — delete [dead constants]; check index.ts re-exports.
4. [path:line] — [stale value sent]. Fix: [rule]; add a unit or e2e assertion.
5. [path:line] — [paid call repeated]. Fix: persist a marker so it runs once; unit test.
6. [data gap] — backfill in migration [NNN] and tools/cutover/config.mjs; re-run [NNN] + config.mjs + verify.mjs on staging and the CI branch; ask for the facts on save so new rows get them.`

const cut = (x, n) => String(x ?? '').slice(0, n)

phase('Fix')
const code = await agent(`${PRE}
You are the fixer. ${DEFECTS}
Fix all with tests. Run tsc for web/admin/site, vitest in apps/web, and any migration/verify steps on both branches.`, { label: 'fixer', phase: 'Fix' })
if (!code) throw new Error('fixer returned nothing')

phase('Tests')
const tests = await agent(`${PRE}
You are the tests agent. Fixer report: ${cut(code, 3000)}
Run the full ladder in the foreground: tsc web/admin/site, vitest apps/web and apps/site, npx turbo run build, apps/site npm run test:smoke, free :3000/:3001, then E2E_DB=1 npx playwright test (single worker; do not end your turn while it runs).
The goal is ONE clean full run. Transient staging database drops (ENOTFOUND, connection terminated, fetch failed): re-run only those spec files and report both results. Real failures: fix (test or product, say which) and re-run the full suite. Report counts and any failure text.`, { label: 'tests', phase: 'Tests' })

phase('Re-review')
const review = await agent(`${PRE}
You are the re-reviewer. ${DEFECTS}
Fixer: ${cut(code, 2500)} | Tests: ${cut(tests, 1800)}
For each defect read the current code and confirm fixed (file:line) or still broken. Then spot-check regressions: [three to six concrete things that must still hold]; any AI attribution or cent sign in the diff. refuted=true if anything remains.`, {
  label: 're-review',
  phase: 'Re-review',
  schema: {
    type: 'object',
    properties: {
      refuted: { type: 'boolean' },
      perDefect: { type: 'array', items: { type: 'string' } },
      regressions: { type: 'array', items: { type: 'string' } },
      notes: { type: 'string' },
    },
    required: ['refuted', 'perDefect', 'regressions', 'notes'],
  },
})

return { code, tests, review }
