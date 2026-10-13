// One cheap call before relying on a Vercel token. Exit 0 = usable for team writes; exit 1 = ask for a new one.
// Env: VERCEL_TOKEN, VERCEL_TEAM_ID, VERCEL_PROJECT_ID (any project on the team).
const token = process.env.VERCEL_TOKEN;
const team = process.env.VERCEL_TEAM_ID;
const project = process.env.VERCEL_PROJECT_ID;
if (!token || !team || !project) { console.error("VERCEL_TOKEN, VERCEL_TEAM_ID and VERCEL_PROJECT_ID are required"); process.exit(2); }

const r = await fetch(`https://api.vercel.com/v6/deployments?projectId=${project}&teamId=${team}&limit=1`, {
  headers: { Authorization: `Bearer ${token}` },
});
const j = await r.json().catch(() => ({}));
if (r.status === 200 && Array.isArray(j.deployments)) {
  console.log(`OK token works for team scope (latest deployment: ${j.deployments[0]?.state ?? "none"})`);
  process.exit(0);
}
// 403 "You must re-authenticate to this scope" = SAML team token aged out; 401 = revoked/expired
console.error(`TOKEN NOT USABLE: HTTP ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
console.error("Ask for a new token; meanwhile verify deployments through the live URLs.");
process.exit(1);
