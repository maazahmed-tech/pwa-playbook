# Batch [N] — [one push | push A of B] (read AGENT-COMMON.md first for the hard rules, migration style and test ladder)

> Template for the per-batch brief. It is written by the main session **after** the question round and **before** any agent starts. Every decision below is final. Each numbered item names the root cause with `file:line` (verified by reading the code, not guessed), the exact behaviour to build, and the test that proves it. Ownership sets are disjoint so agents never edit the same file.

Repo state: `main` at `[SHA]` ([what is live]). All decisions below are final; do not re-open them.

## Ownership (disjoint)
| Agent | Owns | Must not touch |
|---|---|---|
| data | `packages/db/**`, `tools/cutover/**`, applying migrations | anything else |
| web-server | `apps/web/app/api/**`, `apps/web/lib/**`, `apps/web/auth.ts`, `apps/web/middleware.ts` | `apps/web/app/(main)`, components |
| web-ui | `apps/web/app/(auth)/**`, `apps/web/app/(main)/**`, `apps/web/components/**` | `lib/**` except append-only hooks in `lib/api.ts` |
| admin | `apps/admin/**` | web, db |
| site | `apps/site/**` | everything else |
| tests | `tools/e2e/**`, `apps/*/tests/**`, `LAUNCH-READINESS.md` rows | product code (fix only what a failing test proves, and say which) |

## API contract (both halves code to this; written before anyone starts)
```text
[METHOD] [/api/path]  body { … }  → 200 { … } | 4xx { error, code? }
[…]
```

## C1. [Item title]
Root cause (verified): `[path:line]` does [X]; `[path:line]` hard-codes [Y]. The [config/list] already exists at `[path]`; admin edits it at `[path]`.
- [Exact behaviour 1, with the user-visible wording in quotes.]
- [Exact behaviour 2.]
- [Edge rule: removed values stay on existing profiles; refusals happen before any code is sent; etc.]
- Changes appear in the app within [a minute] (config is force-dynamic; lower `staleTime` if needed).

## C2. [Item title]
Verified today: `[path:line]` [does the wrong thing].
- [Table/column change]: `[table].[column]` with backfill rule [X]; report counts.
- [Refusal shape]: HTTP [409] `{ code: "[code]", error: "[message]" }` — the screens show that message with a "[button]" button.
- [Migration note: what existing rows get told once, and how.]

## C3. [Item title]
- [Server side]: never send/show [X] to [whom]; strip server-side in `[routes]`.
- [Client side]: [exact interaction rules, e.g. "start creating the link when the sheet opens; both buttons show a spinner until ready; then act synchronously inside the tap; 'Link copied' only on real success"].

## C4. [Item title — account state]
- API: [status + body on every authenticated route]; remove "[old wording]" from every user-facing message.
- Admin action bumps `users.session_version` so every session ends server-side.
- App: one global handler (`apiSend`/`apiGet` and the `/api/me` refresh) — on `[code]`: sign out, clear local state, show modal "[text]" with a `mailto:[SUPPORT_EMAIL]` link. The account refresh runs every few minutes while open and on foreground.
- Every sign-in route ([password, Google, code, reset, sign-up]) → no session, the same modal.

## C5. [Admin item — charts/pages]
Replace `[component at path:line]` with [what], for [date range], from `[route]` (extend if needed, real `cost_cents`). Hand-built SVG in the panel's style, no chart library.

## C6. [Small layout item]
`[path]`: move [section (lines)] to [position]. Nothing else moves.

## C7. Tests and docs
E2E for: [one line per behaviour above, phrased as the assertion]. Unit tests for the pure rules (prompt builders, validators, refusal decisions) when Google/paid engines cannot be driven in a browser. Update `LAUNCH-READINESS.md` (new rows with the tests that prove them) and `SECURITY.md` when a control changed.

## Report format (every agent, under 60 lines)
Files changed · tests added · decisions taken inside the brief · blocked items · exact commands run and results · edits outside your ownership set.
