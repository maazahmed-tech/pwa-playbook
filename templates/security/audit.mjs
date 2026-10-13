/**
 * tools/security/audit.mjs — dependency audit gate.
 *
 * Fails on any high or critical advisory except the ones listed in EXCEPTIONS, each of
 * which carries the reason it cannot be reached in this app and a review date. An
 * exception that is past its review date fails the gate on purpose, so the list cannot
 * quietly become permanent.
 *
 * Run: node tools/security/audit.mjs   (npm run security:audit; CI runs it before the tests)
 *
 * When to add an exception: the fix needs a major framework upgrade you will not take days
 * before a launch, the vulnerable code is build-time only, and no user input reaches it.
 * Write all three facts in `reason`. Anything else: `npm audit fix` or bump the package
 * (add an `overrides` entry in the root package.json when the vulnerable copy is nested).
 */
import { execFileSync } from "node:child_process";

/** Advisories we knowingly carry, with the reason and the date to look again. */
const EXCEPTIONS = [
  // {
  //   package: "[name]",
  //   paths: ["node_modules/[parent]/node_modules/[name]"],   // exact node paths the advisory lists
  //   advisories: ["GHSA-xxxx-xxxx-xxxx"],
  //   reason: "Build-time only: [who pins it and why]. No user input reaches it because [fact]. The only upstream fix is [major upgrade], not taken before launch.",
  //   reviewBy: "YYYY-MM-DD",
  // },
];

const audit = () => {
  try {
    return JSON.parse(execFileSync("npm", ["audit", "--json"], { encoding: "utf8", shell: process.platform === "win32" }));
  } catch (e) {
    // npm exits non-zero when it finds anything; the report is still on stdout
    if (e.stdout) return JSON.parse(e.stdout);
    throw e;
  }
};

const idsOf = (v) => (v.via ?? []).filter((x) => typeof x === "object").map((x) => String(x.url ?? "").split("/").pop()).filter(Boolean);

const covered = (name, nodes, ids) => EXCEPTIONS.find((ex) =>
  ex.package === name
  && nodes.every((n) => ex.paths.some((p) => n.replace(/\\/g, "/").endsWith(p)))
  && ids.every((id) => ex.advisories.includes(id)));

const report = audit();
const serious = Object.entries(report.vulnerabilities ?? {}).filter(([, v]) => v.severity === "high" || v.severity === "critical");

const today = new Date().toISOString().slice(0, 10);
const blocking = [];
const allowed = [];
for (const [name, v] of serious) {
  const ids = idsOf(v);
  const ex = covered(name, v.nodes ?? [], ids);
  if (!ex) { blocking.push(`${name} (${v.severity}) ${ids.join(", ")} — ${(v.nodes ?? []).join(", ")}`); continue; }
  if (ex.reviewBy < today) { blocking.push(`${name}: the documented exception was due for review on ${ex.reviewBy} — re-check it or fix the dependency`); continue; }
  allowed.push(`${name} (${v.severity}) — carried until ${ex.reviewBy}: ${ex.reason}`);
}

for (const line of allowed) console.log("carried: " + line);
if (blocking.length) {
  console.error("\nDependency audit failed:\n" + blocking.map((b) => "  - " + b).join("\n"));
  console.error("\nFix with `npm audit fix`, or add a documented exception in tools/security/audit.mjs if it truly cannot be reached.");
  process.exit(1);
}
const counts = report.metadata?.vulnerabilities ?? {};
console.log(`\nNo unaddressed high or critical advisories (moderate ${counts.moderate ?? 0}, low ${counts.low ?? 0} remain).`);
