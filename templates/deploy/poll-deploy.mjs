// Waits for the deployments of one commit on each listed project to reach a final state.
// Usage: VERCEL_TOKEN=… VERCEL_TEAM_ID=… node poll-deploy.mjs <commit sha>
// Polls every 20 s for up to 30 minutes; prints RESULT {"app":"READY","admin":"READY"} at the end.
const token = process.env.VERCEL_TOKEN;
const team = process.env.VERCEL_TEAM_ID;
const sha = process.argv[2];
if (!token || !team || !sha) { console.error("need VERCEL_TOKEN, VERCEL_TEAM_ID and a commit sha"); process.exit(2); }

// name → project id; add every git-linked project this repo deploys
const projects = { app: "[prj_staging_app]", admin: "[prj_staging_admin]" };
const done = {};
for (let i = 0; i < 90 && Object.keys(done).length < Object.keys(projects).length; i++) {
  for (const [name, id] of Object.entries(projects)) {
    if (done[name]) continue;
    try {
      const r = await fetch(`https://api.vercel.com/v6/deployments?projectId=${id}&teamId=${team}&limit=5`, { headers: { Authorization: `Bearer ${token}` } });
      const j = await r.json();
      if (!Array.isArray(j.deployments)) { console.log(`${name}: no deployments array — token expired or rate limited (HTTP ${r.status})`); continue; }
      const d = j.deployments.find((x) => x.meta?.githubCommitSha === sha);
      if (!d) { if (i % 6 === 0) console.log(`${name}: no deployment for ${sha.slice(0, 7)} yet (queue busy? trigger it through the API)`); continue; }
      if (["READY", "ERROR", "CANCELED"].includes(d.state)) { done[name] = d.state; console.log(`${name}: ${d.state} https://${d.url}`); }
      else if (i % 6 === 0) console.log(`${name}: ${d.state}`);
    } catch (e) { console.log(`${name}: poll error ${e.message}`); }
  }
  if (Object.keys(done).length < Object.keys(projects).length) await new Promise((res) => setTimeout(res, 20_000));
}
console.log("RESULT", JSON.stringify(done));
process.exit(Object.values(done).every((s) => s === "READY") && Object.keys(done).length === Object.keys(projects).length ? 0 : 1);
