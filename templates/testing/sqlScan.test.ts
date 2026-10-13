/**
 * apps/web/tests/sqlScan.test.ts — SQL scan guard test.
 *
 * No SQL text may be assembled from variables anywhere in either app or the database
 * package. Drizzle's tagged `sql\`…\`` template binds every `${}` as a parameter and is
 * fine; `sql.raw(...)`, `.execute("…")`/`.query("…")` with plain strings, and the Neon
 * driver called as a function with an interpolated or concatenated string are not —
 * except for the fixed-text spots listed in ALLOWED, which only ever splice constants.
 *
 * It fails the build, so a new route that builds SQL from a request value is caught on
 * the first `vitest run` (it caught one in Assemble's batch 3). Keep the allow-list short
 * and prune it when the code it names goes.
 *
 * Windows note: an allow-listed fragment containing `\n` matches LF only; keep line
 * endings LF (`.gitattributes`: `* text=auto eol=lf`) or compare normalised text.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const REPO = join(__dirname, "../../..");
const ROOTS = ["apps/web", "apps/admin", "packages/db/src"].map((r) => join(REPO, r));
const SKIP = new Set(["node_modules", ".next", ".turbo", "tests"]);

/** Known raw calls: file → the exact fragments allowed there (anything else in that file still fails). */
const ALLOWED: Record<string, string[]> = {
  // "apps/admin/app/api/admin/[report]/route.ts": [
  //   "sql.raw(countsSql(MONTH_WHERE))", // fixed text with a constant column list spliced in
  // ],
};

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|mjs|js)$/.test(name) && !name.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

interface Finding { file: string; line: number; text: string }

/** Every `sql.raw(` call in the file with the text of the call (up to its closing bracket or 300 chars). */
function rawCalls(src: string): { index: number; text: string }[] {
  const out: { index: number; text: string }[] = [];
  const re = /sql\.raw\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    let depth = 0;
    let end = m.index;
    for (let i = m.index + "sql.raw".length; i < src.length && i < m.index + 300; i++) {
      if (src[i] === "(") depth++;
      else if (src[i] === ")") { depth--; if (depth === 0) { end = i + 1; break; } }
      end = i + 1;
    }
    out.push({ index: m.index, text: src.slice(m.index, end) });
  }
  return out;
}

const lineOf = (src: string, index: number) => src.slice(0, index).split("\n").length;

function scan(): Finding[] {
  const findings: Finding[] = [];
  for (const root of ROOTS) {
    for (const file of walk(root)) {
      const rel = relative(REPO, file).split("\\").join("/");
      const src = readFileSync(file, "utf8");
      const allowed = ALLOWED[rel] ?? [];

      // 1. sql.raw(...) — a literal with no ${} is fine; anything else must be on the allow-list
      for (const call of rawCalls(src)) {
        const inner = call.text.slice("sql.raw(".length);
        const plainLiteral = /^\s*(`[^`$]*`|"[^"]*"|'[^']*')\s*\)?$/.test(inner);
        if (plainLiteral) continue;
        if (allowed.some((frag) => call.text.startsWith(frag))) continue;
        findings.push({ file: rel, line: lineOf(src, call.index), text: call.text.split("\n")[0] });
      }
      // 2. db.execute / query with a plain string or template (not the tagged sql`` helper)
      for (const m of src.matchAll(/\.(execute|query)\(\s*(`|"|')/g)) {
        findings.push({ file: rel, line: lineOf(src, m.index ?? 0), text: src.slice(m.index, (m.index ?? 0) + 80).split("\n")[0] });
      }
      // 3. the Neon driver called as a function with an interpolated or concatenated string
      for (const m of src.matchAll(/\bsql\(\s*(`[^`]*\$\{|["'][^"']*["']\s*\+)/g)) {
        findings.push({ file: rel, line: lineOf(src, m.index ?? 0), text: src.slice(m.index, (m.index ?? 0) + 80).split("\n")[0] });
      }
    }
  }
  return findings;
}

describe("sql scan", () => {
  it("scans enough files to mean something", () => {
    expect(ROOTS.flatMap((r) => walk(r)).length).toBeGreaterThan(50);
  });

  it("finds no SQL built from variables outside the allow-list", () => {
    const findings = scan();
    const report = findings.map((f) => `${f.file}:${f.line}  ${f.text}`).join("\n");
    expect(findings, `raw SQL with interpolation:\n${report}`).toEqual([]);
  });

  it("the allow-listed fragments still exist (prune the list when they go)", () => {
    for (const [rel, frags] of Object.entries(ALLOWED)) {
      const src = readFileSync(join(REPO, rel), "utf8");
      for (const frag of frags) expect(src.includes(frag), `${rel}: ${frag.split("\n")[0]}`).toBe(true);
    }
  });
});
