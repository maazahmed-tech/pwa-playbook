// Creates a production deployment from a git SHA for each project, then polls to a final state.
// Use when the hosting queue skipped `main` (Dependabot branches) or after an env change
// (empty "redeploy" commits are cancelled by the ignored-build step, so this is the way).
// Usage: VERCEL_TOKEN=… VERCEL_TEAM_ID=… GITHUB_REPO_ID=… node trigger-deploy.mjs <commit sha>
const token = process.env.VERCEL_TOKEN;
const team = process.env.VERCEL_TEAM_ID;
const repoId = Number(process.env.GITHUB_REPO_ID); // GET https://api.github.com/repos/<owner>/<repo> → id
const sha = process.argv[2];
if (!token || !team || !repoId || !sha) { console.error("need VERCEL_TOKEN, VERCEL_TEAM_ID, GITHUB_REPO_ID and a commit sha"); process.exit(2); }

// project name → project id (the name is what the API expects in `name`)
const projects = { "[staging-app-project-name]": "[prj_staging_app]", "[staging-admin-project-name]": "[prj_staging_admin]" };
const ids = {};
for (const [name, id] of Object.entries(projects)) {
  const r = await fetch(`https://api.vercel.com/v13/deployments?teamId=${team}&forceNew=1`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, project: id, target: "production", gitSource: { type: "github", repoId, ref: "main", sha } }),
  });
  const j = await r.json();
  ids[name] = j.id;
  console.log(name, r.status, j.id || JSON.stringify(j).slice(0, 300));
}

// Alternative body to redeploy the latest READY production build after an env change (no git source):
//   { name, deploymentId: "<LATEST_READY_PROD_DEPLOYMENT_ID>", target: "production" }

for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 20_000));
  let done = true;
  const states = [];
  for (const [n, id] of Object.entries(ids)) {
    if (!id) { states.push(`${n}:NOT_CREATED`); continue; }
    const j = await (await fetch(`https://api.vercel.com/v13/deployments/${id}?teamId=${team}`, { headers: { Authorization: `Bearer ${token}` } })).json();
    states.push(`${n}:${j.readyState}`);
    if (!["READY", "ERROR", "CANCELED"].includes(j.readyState)) done = false;
  }
  console.log(states.join(" "));
  if (done) break;
}
