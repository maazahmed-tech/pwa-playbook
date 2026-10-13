// Upserts environment variables on a hosting project, reading the VALUES from a local env file
// so they never pass through chat. Token from VERCEL_TOKEN. Redeploy afterwards (trigger-deploy.mjs).
// Usage: VERCEL_TOKEN=… VERCEL_TEAM_ID=… VERCEL_PROJECT_ID=… node set-env.mjs
import { readFileSync } from "node:fs";

const token = process.env.VERCEL_TOKEN;
const team = process.env.VERCEL_TEAM_ID;
const project = process.env.VERCEL_PROJECT_ID;
if (!token || !team || !project) throw new Error("VERCEL_TOKEN, VERCEL_TEAM_ID and VERCEL_PROJECT_ID are required");

const envFile = readFileSync("[ABSOLUTE PATH]/apps/web/.env.local", "utf8");
const get = (k) => (envFile.match(new RegExp(`^${k}=(.*)$`, "m")) ?? [])[1]?.replace(/^["']|["']$/g, "");

// [key, value, type] — type "encrypted" for secrets, "plain" for public values
const envs = [
  ["AWS_ACCESS_KEY_ID", get("AWS_ACCESS_KEY_ID"), "encrypted"],
  ["AWS_SECRET_ACCESS_KEY", get("AWS_SECRET_ACCESS_KEY"), "encrypted"],
  ["AWS_ENDPOINT_URL_S3", get("AWS_ENDPOINT_URL_S3"), "plain"],
  ["AWS_REGION", get("AWS_REGION"), "plain"],
  ["NEXT_PUBLIC_APP_URL", "https://[staging-app].vercel.app", "plain"],
];

for (const [key, value, type] of envs) {
  if (!value) { console.log(key, "skipped (no value)"); continue; }
  const r = await fetch(`https://api.vercel.com/v10/projects/${project}/env?teamId=${team}&upsert=true`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ key, value, type, target: ["production", "preview"] }),
  });
  console.log(key, r.status); // values are never printed
}
console.log("done — redeploy the project for the change to take effect");
