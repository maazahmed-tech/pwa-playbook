/**
 * apps/web/tests/routeInventory.test.ts — route inventory guard test.
 *
 * Walks every API route file in both apps, records the HTTP methods it exports and
 * whether it checks for a session. Every route that is not on the public allow-list
 * must call `getCurrentUser(`, `isAdmin(` or `cronAuthorized(`. The inventory is written
 * to tools/security/routes.json so the e2e attack suite can knock on every door without
 * a session. It fails the build the moment someone adds an unguarded route — on Assemble
 * it found three real gaps in the security round (2026-09-13).
 *
 * Re-run the unit tests after adding a route and commit the regenerated routes.json.
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const REPO = join(__dirname, "../../..");
const APPS = [
  { app: "web", dir: join(REPO, "apps/web/app/api"), prefix: "/api" },
  { app: "admin", dir: join(REPO, "apps/admin/app/api"), prefix: "/api" },
] as const;

/**
 * Routes that answer without a session. A path matches when it equals the entry or starts
 * with the entry + "/"; the method list says which verbs are open there. Every entry has a
 * one-line "why" — if you cannot write one, the route should not be public.
 */
export const PUBLIC_ROUTES: { app: "web" | "admin"; path: string; methods: string[]; why: string }[] = [
  { app: "web", path: "/api/config", methods: ["GET"], why: "app configuration the sign-in screens need" },
  { app: "web", path: "/api/products", methods: ["GET"], why: "the shop catalogue is public" },
  { app: "web", path: "/api/help", methods: ["GET"], why: "help articles are public" },
  { app: "web", path: "/api/legal", methods: ["GET"], why: "privacy and terms are public" },
  { app: "web", path: "/api/s", methods: ["GET", "POST"], why: "public share pages: view, vote, comment, report" },
  { app: "web", path: "/api/demo", methods: ["POST", "DELETE"], why: "demo entry sets or clears its own cookie" },
  { app: "web", path: "/api/auth", methods: ["GET", "POST"], why: "sign-up, verify, forgot, reset, resend-code and the Auth.js handlers" },
  { app: "web", path: "/api/version", methods: ["GET"], why: "build identity for the update toast" },
  { app: "web", path: "/api/cron", methods: ["GET", "POST"], why: "scheduler routes: CRON_SECRET only, checked by cronAuthorized" },
  { app: "web", path: "/api/storage/public", methods: ["GET"], why: "product and advert images" },
  { app: "admin", path: "/api/version", methods: ["GET"], why: "build identity" },
  { app: "admin", path: "/api/admin/login", methods: ["POST"], why: "the sign-in step itself" },
  { app: "admin", path: "/api/admin/verify", methods: ["POST", "DELETE"], why: "the 2FA step and log-out clear their own cookie" },
];

const SESSION_CHECK = /getCurrentUser\(|isAdmin\(|cronAuthorized\(/;
const METHOD_EXPORT = /export\s+(?:async\s+)?(?:function\s+|const\s+)(GET|POST|PATCH|PUT|DELETE|HEAD|OPTIONS)\b/g;
const HANDLERS_EXPORT = /export\s+(?:const\s+)?\{([^}]+)\}(?:\s*=\s*handlers)?/;
const METHOD_NAMES = new Set(["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS"]);

export interface RouteEntry {
  app: "web" | "admin";
  file: string;
  path: string;
  methods: string[];
  sessionCheck: boolean;
  public: boolean;
  publicMethods: string[];
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name === "route.ts") out.push(full);
  }
  return out;
}

/** `apps/web/app/api/items/[id]/route.ts` → `/api/items/[id]` */
function routePath(file: string, base: string, prefix: string): string {
  const rel = relative(base, file).split("\\").join("/").replace(/\/route\.ts$/, "");
  return rel ? `${prefix}/${rel}` : prefix;
}

function publicEntry(app: "web" | "admin", path: string) {
  return PUBLIC_ROUTES.find((p) => p.app === app && (path === p.path || path.startsWith(`${p.path}/`)));
}

export function buildInventory(): RouteEntry[] {
  const out: RouteEntry[] = [];
  for (const { app, dir, prefix } of APPS) {
    for (const file of walk(dir).sort()) {
      const src = readFileSync(file, "utf8");
      const methods = new Set<string>();
      for (const m of src.matchAll(METHOD_EXPORT)) methods.add(m[1]);
      const handlers = src.match(HANDLERS_EXPORT);
      if (handlers) {
        for (const m of handlers[1].split(",").map((s) => s.trim().split(/\s+as\s+/).at(-1) ?? "")) if (METHOD_NAMES.has(m)) methods.add(m);
      }
      const path = routePath(file, dir, prefix);
      const pub = publicEntry(app, path);
      out.push({
        app, file: relative(REPO, file).split("\\").join("/"), path,
        methods: [...methods],
        sessionCheck: SESSION_CHECK.test(src),
        public: !!pub,
        publicMethods: pub?.methods ?? [],
      });
    }
  }
  return out;
}

describe("route inventory", () => {
  const routes = buildInventory();

  it("covers both apps", () => {
    expect(routes.filter((r) => r.app === "web").length).toBeGreaterThan(10);
    expect(routes.filter((r) => r.app === "admin").length).toBeGreaterThan(3);
    for (const r of routes) expect(r.methods.length, r.file).toBeGreaterThan(0);
  });

  it("writes tools/security/routes.json for the e2e suite", () => {
    const dir = join(REPO, "tools/security");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "routes.json"), `${JSON.stringify(routes, null, 2)}\n`);
    const back = JSON.parse(readFileSync(join(dir, "routes.json"), "utf8")) as RouteEntry[];
    expect(back.length).toBe(routes.length);
  });

  it("every route outside the public allow-list checks for a session", () => {
    const unguarded = routes.filter((r) => !r.public && !r.sessionCheck).map((r) => `${r.file} (${r.methods.join(", ")})`);
    expect(unguarded, `routes with no getCurrentUser( / isAdmin( / cronAuthorized( call:\n${unguarded.join("\n")}`).toEqual([]);
  });

  it("cron routes use the shared constant-time secret check", () => {
    for (const r of routes.filter((x) => x.path.startsWith("/api/cron"))) {
      expect(readFileSync(join(REPO, r.file), "utf8"), r.file).toMatch(/cronAuthorized\(/);
    }
  });

  it("the allow-list only names routes that exist", () => {
    const covers = (route: string, pub: string) => {
      const base = route.replace(/\/\[\.\.\.[^\]]+\]$/, "");
      return route === pub || route.startsWith(`${pub}/`) || (base !== route && pub.startsWith(`${base}/`));
    };
    for (const p of PUBLIC_ROUTES) {
      const hit = routes.some((r) => r.app === p.app && covers(r.path, p.path));
      expect(hit, `${p.app} ${p.path}`).toBe(true);
    }
  });
});
