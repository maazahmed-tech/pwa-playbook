#!/usr/bin/env node
/**
 * tools/security/scan-secrets.mjs — secret scan, no dependencies.
 *
 *   node tools/security/scan-secrets.mjs --tree               scan the working tree; exit 1 on a hit
 *   node tools/security/scan-secrets.mjs --history [--strict] scan every commit on every branch; --strict exits 1 on a hit
 *
 * The tree scan looks at the files git tracks plus untracked files that are not ignored,
 * so `.env.local` and friends (gitignored) are never read. It skips node_modules, .next,
 * .git, lockfiles and binaries. Matches are printed MASKED — the point is to say where a
 * key is, never what it is. CI runs `--tree` before the unit tests; run `--history` once
 * when adopting a repo and after any suspected paste.
 *
 * If a scan finds something real: rotate at the provider FIRST, update the hosting env and
 * redeploy, then remove it from the tree; rewrite history only for a private repo where
 * every collaborator re-clones.
 */
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const SELF = "tools/security/scan-secrets.mjs";

// Add a line for every provider your app uses. Key prefixes are public knowledge; the values are not.
const PATTERNS = [
  { name: "Google API key", re: /AIza[0-9A-Za-z_-]{30,}/g },
  { name: "Stripe key", re: /\bsk_(?:live|test)_[0-9A-Za-z]{16,}/g },
  { name: "Stripe restricted key", re: /\brk_(?:live|test)_[0-9A-Za-z]{16,}/g },
  { name: "Resend key", re: /\bre_[0-9A-Za-z]{20,}/g },
  { name: "GitHub token", re: /\b(?:ghp|gho|ghu|ghs)_[0-9A-Za-z]{30,}/g },
  { name: "GitHub fine-grained token", re: /\bgithub_pat_[0-9A-Za-z_]{40,}/g },
  { name: "Vercel token", re: /\bvcp_[0-9A-Za-z]{30,}/g },
  { name: "AWS access key id", re: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: "3D engine key", re: /\btsk_[0-9A-Za-z]{20,}/g },
  { name: "Database URL with password", re: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@/g },
  { name: "Private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { name: "JWT", re: /\beyJ[0-9A-Za-z_-]{20,}\.[0-9A-Za-z_-]{20,}\./g },
  { name: "Assigned secret", re: /(?:secret|token|password|api[_-]?key)\s*[:=]\s*["']([^"']{12,})["']?/gi, generic: true },
];

/** Values the generic "name = 'value'" pattern must ignore: placeholders, env lookups, the test password, the demo sentinel. */
const PLACEHOLDER = /changeme|your[-_ ]|<|>|example|placeholder|xxx|\.\.\.|…|\$\{|process\.env|^Password123!$|^\[app\]-demo$|^\s*$|^[a-z_]+$/i;

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", ".turbo", "dist", "out", "test-results", "playwright-report"]);
const LOCKFILES = new Set(["package-lock.json", "yarn.lock", "pnpm-lock.yaml"]);
const BINARY_EXT = /\.(png|jpe?g|gif|webp|avif|ico|glb|gltf|bin|zip|gz|woff2?|ttf|otf|eot|pdf|mp4|mp3|wasm|heic)$/i;
const MAX_BYTES = 5 * 1024 * 1024;

const mask = (s) => {
  if (s.length <= 8) return "****";
  const shown = s.startsWith("postgres") ? s.slice(0, s.indexOf("://") + 3) : s.slice(0, 4);
  return `${shown}${"*".repeat(Math.min(12, s.length - shown.length - 2))}${s.slice(-2)}`;
};

/** Test files carry fixture passwords by design; only the specific key shapes count there. */
const isTestFile = (file) => /\.(spec|test)\.[cm]?[jt]sx?$/.test(file);

function findInLine(line, file = "") {
  const out = [];
  for (const p of PATTERNS) {
    p.re.lastIndex = 0;
    let m;
    while ((m = p.re.exec(line)) !== null) {
      const value = p.generic ? m[1] : m[0];
      if (p.generic && (PLACEHOLDER.test(value) || isTestFile(file))) continue;
      out.push({ name: p.name, masked: mask(value) });
    }
  }
  return out;
}

/* ---------- working tree ---------- */

function listFiles() {
  try {
    const raw = execSync("git ls-files --cached --others --exclude-standard -z", { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
    return raw.toString("utf8").split("\0").filter(Boolean);
  } catch {
    // no git: plain walk (ignored files included, so .env.* WILL show up — that is the point of the fallback)
    const out = [];
    const walk = (dir) => {
      for (const name of readdirSync(dir)) {
        if (SKIP_DIRS.has(name)) continue;
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else out.push(relative(ROOT, full).split(sep).join("/"));
      }
    };
    walk(ROOT);
    return out;
  }
}

function scanTree() {
  const hits = [];
  let scanned = 0;
  for (const rel of listFiles()) {
    const parts = rel.split("/");
    if (parts.some((p) => SKIP_DIRS.has(p))) continue;
    if (LOCKFILES.has(parts.at(-1)) || BINARY_EXT.test(rel) || rel === SELF) continue;
    const full = join(ROOT, rel);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (!st.isFile() || st.size > MAX_BYTES) continue;
    const buf = readFileSync(full);
    if (buf.subarray(0, 8192).includes(0)) continue; // binary
    scanned++;
    buf.toString("utf8").split("\n").forEach((line, i) => {
      for (const h of findInLine(line, rel)) hits.push({ file: rel, line: i + 1, ...h });
    });
  }
  for (const h of hits) console.log(`${h.file}:${h.line}  ${h.name}  ${h.masked}`);
  console.log(`[secrets] tree: ${scanned} files scanned, ${hits.length} hit(s)`);
  return hits.length;
}

/* ---------- history ---------- */

function scanHistory() {
  const log = execSync('git log -p --all --no-color "--format=__commit__ %h %s"', { cwd: ROOT, maxBuffer: 256 * 1024 * 1024 }).toString("utf8");
  let commit = "";
  let file = "";
  const seen = new Set();
  const hits = [];
  for (const line of log.split("\n")) {
    if (line.startsWith("__commit__ ")) { commit = line.slice(11); file = ""; continue; }
    if (line.startsWith("+++ b/")) { file = line.slice(6); continue; }
    if (line.startsWith("+++ ")) { file = line.slice(4); continue; }
    if (!line.startsWith("+") || line.startsWith("+++")) continue;
    if (file === SELF || LOCKFILES.has(file.split("/").at(-1))) continue;
    for (const h of findInLine(line.slice(1), file)) {
      const key = `${commit}|${file}|${h.name}|${h.masked}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({ commit, file, ...h });
    }
  }
  for (const h of hits) console.log(`${h.commit}  ${h.file}  ${h.name}  ${h.masked}`);
  console.log(`[secrets] history: ${hits.length} hit(s) across all branches`);
  return hits.length;
}

/* ---------- main ---------- */

const mode = process.argv[2];
if (mode === "--tree") {
  process.exit(scanTree() > 0 ? 1 : 0);
} else if (mode === "--history") {
  const n = scanHistory();
  process.exit(process.argv.includes("--strict") && n > 0 ? 1 : 0);
} else {
  console.error("usage: node tools/security/scan-secrets.mjs --tree | --history [--strict]");
  process.exit(2);
}
