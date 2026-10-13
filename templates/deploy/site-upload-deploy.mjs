// Deploys a static folder (e.g. apps/site/out after `next build` with output: "export") to a hosting
// project that is NOT git-linked, by uploading each file keyed by its SHA-1 digest, with a
// `noindex, nofollow` header so search engines never see the preview. Used on Assemble for the
// landing-page previews the client reviewed before the domain moved (2026-09-13 onward).
//
// Usage: VERCEL_TOKEN=… VERCEL_TEAM_ID=… OUT="<abs path>/apps/site/out" NAME=<project-name> node site-upload-deploy.mjs
// Before running: make sure no other session is running a build that rewrites OUT, and that
// OUT/index.html is fresh.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const token = process.env.VERCEL_TOKEN;
const team = process.env.VERCEL_TEAM_ID;
const OUT = process.env.OUT;
const NAME = process.env.NAME;
if (!token || !team || !OUT || !NAME) throw new Error("VERCEL_TOKEN, VERCEL_TEAM_ID, OUT and NAME are required");

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

const files = [];
const upload = async (file, body) => {
  const sha = createHash("sha1").update(body).digest("hex");
  const r = await fetch("https://api.vercel.com/v2/files?teamId=" + team, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "x-vercel-digest": sha, "Content-Type": "application/octet-stream" },
    body,
  });
  if (![200, 409].includes(r.status)) throw new Error(`upload ${file} → ${r.status}`); // 409 = already stored
  files.push({ file, sha, size: body.length });
};

for (const full of walk(OUT)) {
  await upload(relative(OUT, full).split(sep).join("/"), readFileSync(full));
}
// hosting config for the static deployment: clean URLs, never indexed
await upload("vercel.json", Buffer.from(JSON.stringify({
  cleanUrls: true,
  headers: [{ source: "/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }],
})));

const r = await fetch(`https://api.vercel.com/v13/deployments?teamId=${team}&skipAutoDetectionConfirmation=1`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    name: NAME,
    target: "production",
    files,
    projectSettings: { framework: null, buildCommand: null, outputDirectory: null, installCommand: null },
  }),
});
const j = await r.json();
console.log(r.status, j.id, j.url ? `https://${j.url}` : JSON.stringify(j).slice(0, 300));

for (let i = 0; i < 30 && j.id; i++) {
  await new Promise((res) => setTimeout(res, 10_000));
  const s = await (await fetch(`https://api.vercel.com/v13/deployments/${j.id}?teamId=${team}`, { headers: { Authorization: `Bearer ${token}` } })).json();
  console.log(s.readyState);
  if (["READY", "ERROR", "CANCELED"].includes(s.readyState)) break;
}
