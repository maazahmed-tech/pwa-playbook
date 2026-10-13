# Deploy-by-API scripts (Vercel)

Four small Node scripts that let a Claude session drive the hosting provider without the dashboard. They read the token from the **environment** (`VERCEL_TOKEN`), never from a file or a hard-coded string (a few throwaway Assemble scripts hard-coded tokens — do not copy that). Keep them in the session scratchpad; they are not part of the repo.

| Script | What it does | When |
|---|---|---|
| `check-token.mjs` | One cheap call; prints OK or the exact error. | Before **anything** else. Team tokens on a SAML team expire and start answering 403 "re-authenticate to this scope" even while `/v2/user` still works. Never loop on 403 — ask for a new token. |
| `poll-deploy.mjs <sha>` | Waits for the deployments of one commit on the listed projects to reach READY / ERROR / CANCELED. | After every push. If no deployment appears for the SHA after a few minutes, the queue skipped it (Dependabot branches) — use `trigger-deploy.mjs`. |
| `trigger-deploy.mjs <sha>` | Creates a production deployment from a git SHA for each project and polls it. Also the way to "redeploy after an env change" (empty commits get cancelled by the ignored-build step). | Env change; queue skipped main. |
| `set-env.mjs` | Upserts env variables on a project from a local env file (values never pass through chat). | New variable; key rotation. Needs a redeploy afterwards. |
| `site-upload-deploy.mjs` | Deploys a static folder (an exported landing page) to a project that is **not** git-linked, with a `noindex, nofollow` header. | Internal previews the client reviews before the domain moves. |

Env you need: `VERCEL_TOKEN`, `VERCEL_TEAM_ID`, and the project ids (`prj_…`) from the dashboard URL or `GET /v9/projects`. The GitHub repo id (a number) comes from `GET https://api.github.com/repos/<owner>/<repo>` → `id`.

> **For Claude — paste this:**
```text
Deploy check for commit [SHA]:
1. node check-token.mjs — stop and ask me for a new token on 401/403.
2. node poll-deploy.mjs [SHA] — if a project shows no deployment for the SHA after 3 polls, run node trigger-deploy.mjs [SHA].
3. When both are READY, run the live pass script, reset the staging demo unless I said it is in use, and give me the phone retest guide.
Fallback if the token is dead: verify through the live URLs (/api/version returns the SHA; /api/me answers "Sign in to continue.").
```
