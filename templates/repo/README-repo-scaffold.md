# Repo scaffold files — what each one is for

Copy these to the monorepo root (or the path in the second column). Rename the npm scope `@app/*` to your app's scope everywhere. Versions are the ones installed on Assemble on 2026-09-17; **check for newer versions first** (see `04-tech-stack.md`).

| Template file | Goes to | Why it exists |
|---|---|---|
| `package.json` | `/package.json` | npm workspaces `apps/*` + `packages/*`; the `packageManager` pin (Turbo 2 refuses to resolve workspaces on the hosting provider without it); the security scripts CI calls; `overrides` that pin patched copies of advisories (including the copy nested under `next`). |
| `turbo.json` | `/turbo.json` | `dev` uncached/persistent, `build` depends on package builds and caches `.next`, `test` depends on build. |
| `gitignore` | `/.gitignore` | Env files, Neon link file, CI env file, build outputs, screenshots, test results, generated marketing output. Every entry here was once nearly committed. |
| `neon.ts` | `/neon.ts` | Declares the Neon services the app uses (Postgres + a private bucket). `neon deploy` creates the bucket; `neon env pull` validates the branch against it. |
| `next.config.mjs` | `/apps/web/next.config.mjs` (and admin without the demo flag) | Security headers on every response; the demo login compiled in only for staging (`NEXT_PUBLIC_DEMO_LOGIN=1`) or CI-without-hosting builds — never production. |
| `vitest.config.ts` | `/apps/web/vitest.config.ts` | jsdom + React plugin; subpath aliases listed **before** the bare package alias (otherwise the bare alias swallows them). |
| `vercel.json` | `/apps/web/vercel.json` | The nightly cron (demo reset, orphan sweep, wallet check). The scheduler sends `Authorization: Bearer <CRON_SECRET>`; the cron only registers on deploy — check the hosting dashboard after the first deploy. |
| `env/root.env.example` | `/.env.example` | Names of the Neon branch variables `neon env pull` writes (never the values). |
| `env/web.env.example` | `/apps/web/.env.example` | Every variable the customer app reads, grouped by service, with where to get it. |
| `env/admin.env.example` | `/apps/admin/.env.example` | Same for the admin panel. |

## Hosting project settings that pair with these files (set once per project, in the dashboard or through the API)
- App and admin projects: root directory `apps/web` / `apps/admin`, framework Next.js, **install command `cd ../.. && npm install`** (the default monorepo install under-installs workspaces), build `npm run build`, ignored build step `npx turbo-ignore` (a commit touching only one app does not rebuild the others).
- Static site project (coming-soon or exported landing site): framework "Other", install/build `echo`, output directory `.` (or `out` for a Next static export), `vercel.json` `{ "cleanUrls": true }`.
- Environment variables are per project and need a **redeploy** to take effect; empty "redeploy" commits get cancelled by the ignored-build step, so use the redeploy API.

## Local dev servers (register in `.claude/launch.json` so the browser pane can start them)
```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "[app]-web", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev:web"], "port": 3000 },
    { "name": "[app]-admin", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev:admin"], "port": 3001 }
  ]
}
```
Never run `next dev` in a directory that a `next start` (Playwright's web server) is serving: both write `.next`.
