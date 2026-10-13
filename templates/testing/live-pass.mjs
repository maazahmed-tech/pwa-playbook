// Live staging pass — run after every deploy, before the phone retest guide.
// Prints PASS/FAIL lines against the DEPLOYED staging app and admin: public endpoints, a demo
// session, a public share page, ONE real paid call (only when agreed — it costs money), and the
// admin API with the session secret read from apps/admin/.env.local. Keep it in the session
// scratchpad, adapt the checks per round, never commit it.
//
// Usage: node live-pass.mjs           (APP / ADMIN URLs below; nothing else needed)
// Real browser note: a client-rendered public page proves nothing through fetch — open it in a
// real browser (Playwright) for the visual check; this script only checks it serves.
import { readFileSync } from "node:fs";

const APP = "https://[staging-app].vercel.app";
const ADMIN = "https://[staging-admin].vercel.app";
const REPO = "[ABSOLUTE PATH TO REPO]";
const adminEnv = readFileSync(`${REPO}/apps/admin/.env.local`, "utf8");
const secret = (adminEnv.match(/^ADMIN_SESSION_SECRET=(.+)$/m) ?? [])[1]?.trim().replace(/^["']|["']$/g, "");
const REAL_PAID_CALL = process.argv.includes("--paid"); // one real engine call, only when agreed

const out = [];
const ok = (label, cond, extra = "") => out.push(`${cond ? "PASS" : "FAIL"} ${label}${extra ? " · " + extra : ""}`);
const j = async (r) => { try { return await r.json(); } catch { return null; } };

// ---- public / anonymous
let r = await fetch(`${APP}/api/config`); let b = await j(r);
ok("config serves plans + models", r.status === 200 && b?.config?.plans?.plus && typeof b?.config?.renderModel === "string", `render=${b?.config?.renderModel}`);
r = await fetch(`${APP}/api/legal?slug=privacy`); b = await j(r);
ok("legal privacy", r.status === 200 && (b?.body ?? "").length > 1000, `${b?.body?.length} chars`);
r = await fetch(`${APP}/welcome`); let html = await r.text();
ok("welcome has no demo wording", r.status === 200 && !/demo/i.test(html.replace(/<script[\s\S]*?<\/script>/g, "")));
r = await fetch(`${APP}/api/me`); b = await j(r);
ok("me refuses anonymous", r.status === 401);
r = await fetch(`${APP}/api/storage/public/nothing.jpg`);
ok("public storage prefix answers without a session", r.status === 404, `status ${r.status}`);
r = await fetch(`${APP}/api/storage/u1/item/x.jpg`);
ok("private storage prefix needs a session", r.status === 401, `status ${r.status}`);
r = await fetch(`${APP}/api/me`, { method: "PATCH", headers: { origin: "https://evil.example", "content-type": "application/json" }, body: "{}" });
ok("cross-site write refused", r.status === 403, `status ${r.status}`);
r = await fetch(`${APP}/api/cron/reset-demo`);
ok("cron refuses without the secret", r.status === 401, `status ${r.status}`);
r = await fetch(`${APP}/home`, { redirect: "manual" });
ok("gated page redirects signed-out", r.status === 307 || r.status === 308 || r.status === 302, `status ${r.status}`);
const h = (await fetch(`${APP}/welcome`)).headers;
ok("security headers present", h.get("x-frame-options") === "DENY" && !!h.get("referrer-policy") && !!h.get("permissions-policy"));

// ---- demo session (staging only; production never sets the demo route)
r = await fetch(`${APP}/api/demo`, { method: "POST" });
const cookie = (r.headers.get("set-cookie") ?? "").split(";")[0];
const demo = (path, init = {}) => fetch(`${APP}${path}`, { ...init, headers: { cookie, "content-type": "application/json", ...(init.headers ?? {}) } });
r = await demo("/api/me"); b = await j(r);
ok("demo profile loads", r.status === 200 && typeof b?.credits === "number", `credits=${b?.credits}`);
r = await demo("/api/me", { method: "PATCH", body: JSON.stringify({ credits: 999999, plan: "pro" }) });
const me = await j(await demo("/api/me"));
ok("plan and credits are not settable from a request", me?.plan !== "pro" || me?.credits !== 999999);
r = await demo("/api/outfits?all=1"); const looks = await j(r);
ok("outfits list", Array.isArray(looks), `${looks?.length} looks`);

// public link for a demo look → public page → API → revoke
if (Array.isArray(looks) && looks[0]) {
  const look = looks[0];
  r = await demo(`/api/outfits/${look.id}/link`, { method: "POST", body: JSON.stringify({}) }); b = await j(r);
  const token = b?.token;
  ok("public link created (201)", r.status === 201 && !!token, b?.url);
  if (token) {
    r = await fetch(`${APP}/s/${token}`); ok("public page serves", r.status === 200);
    r = await fetch(`${APP}/api/s/${token}`); b = await j(r);
    ok("public API hides shop pieces and private fields", r.status === 200 && !("email" in (b ?? {})) && (b?.items ?? []).every((i) => i.owned !== false));
    await demo(`/api/outfits/${look.id}/link`, { method: "DELETE" });
    r = await fetch(`${APP}/api/s/${token}`); ok("revoked link is dead", r.status === 404);
  }
}

// ---- one real paid call (only with --paid; clean up afterwards)
if (REAL_PAID_CALL) {
  const t0 = Date.now();
  r = await demo("/api/ai/[action]", { method: "POST", body: JSON.stringify({ /* minimal body */ }) }); b = await j(r);
  ok("live paid call", r.status === 200, `${r.status} ${b?.error ?? ""} in ${Math.round((Date.now() - t0) / 1000)}s`);
  // delete what it created, then reset the demo profile unless it is in use
}

// ---- admin
r = await fetch(`${ADMIN}/api/admin/config`); ok("admin API refuses anonymous", r.status === 401);
if (secret) {
  const adm = (path, init = {}) => fetch(`${ADMIN}${path}`, { ...init, headers: { cookie: `[app]-admin=${secret}`, "content-type": "application/json", ...(init.headers ?? {}) } });
  r = await adm("/api/admin/settings"); b = await j(r); ok("admin settings", r.status === 200, `hasPassword=${b?.hasPassword}`);
  r = await adm("/api/admin/users"); b = await j(r); ok("admin users", r.status === 200 && Array.isArray(b), `${b?.length} accounts`);
  r = await adm("/api/admin/config", { method: "PUT", body: JSON.stringify({ genCost: 6 }) });
  ok("locked setting asks for a code without one", r.status === 423, `status ${r.status}`);
} else out.push("SKIP admin (no ADMIN_SESSION_SECRET locally)");
r = await fetch(`${ADMIN}/login`); ok("admin login page", r.status === 200);

console.log(out.join("\n"));
const failed = out.filter((l) => l.startsWith("FAIL")).length;
console.log(`${out.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
