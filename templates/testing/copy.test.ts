/**
 * apps/web/tests/copy.test.ts — launch copy audit.
 *
 * Nothing the user can read, in either app, may promise future phases, label a control
 * as a demo/prototype, name an unsponsored vendor, or show card fixtures. The one
 * sanctioned simulated area is checkout, labelled "Test mode — you won't be charged".
 * Comments are stripped before matching (they describe history, not the product).
 *
 * Extend BANNED with every word your own rounds retire (old plan names, removed data
 * fields, a persona word the client rejected). On Assemble "stylist" and "Supabase"
 * were added this way; the marketing site has its own list.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = [
  join(__dirname, "../app"),
  join(__dirname, "../components"),
  join(__dirname, "../lib"),
  join(__dirname, "../auth.ts"),
  join(__dirname, "../../admin/app"),
  join(__dirname, "../../admin/components"),
  join(__dirname, "../../admin/lib"),
];

const BANNED: RegExp[] = [
  /\bStep 2\b/, /\bStep-2\b/, /\bStep 3\b/, /later phase/i, /next phase/i, /\(demo\)/, /placeholder copy/i,
  /coming soon/i, /in a later release/i, /not yet implemented/i, /demo fixture/i, /prototype/i,
  /Simulated checkout/, /Card ending/, /4242/, /Last payment failed/, /we'll email you/i,
  // vendors never named in user-facing copy, and words the client retired
  /\[3D vendor name\]/, /\[retired word\]/,
];

function walk(p: string, out: string[] = []) {
  if (statSync(p).isFile()) { if (/\.(tsx?|mdx?)$/.test(p)) out.push(p); return out; }
  for (const name of readdirSync(p)) {
    if (name === "node_modules" || name === ".next") continue;
    walk(join(p, name), out);
  }
  return out;
}

describe("launch copy", () => {
  const files = ROOTS.flatMap((r) => walk(r));
  it("scans both apps", () => {
    expect(files.length).toBeGreaterThan(40);
  });
  it("contains no roadmap, prototype, vendor or card-fixture wording", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
      for (const re of BANNED) {
        const m = text.match(re);
        if (m) offenders.push(`${file.replace(/\\/g, "/").split("/apps/")[1]} → "${m[0]}"`);
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});
