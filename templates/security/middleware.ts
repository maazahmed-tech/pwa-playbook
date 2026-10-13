import { NextResponse, type NextRequest } from "next/server";

/**
 * apps/web/middleware.ts — two jobs, both cheap header checks:
 *  - API writes: a browser-originated POST/PATCH/PUT/DELETE whose Origin is another site is
 *    refused (403). Requests without an Origin (server-to-server, the scheduler, test clients)
 *    pass; the installed PWA sends our own origin. This closes the cross-site request gap
 *    without CSRF tokens.
 *  - Page gating: main app screens require a real session (Auth.js cookie) or the explicit demo
 *    flag. Auth screens, legal pages, public share pages and assets stay open. Cookie PRESENCE
 *    only — actual identity (suspended? session version?) is resolved per request in
 *    lib/serverUser.ts.
 *
 * Admin app: same origin check; the only open page is /login; the session cookie is validated
 * against the admin_sessions table (one row lookup, edge-compatible via the HTTP driver).
 */
const OPEN_PAGES = new Set([
  "/", "/welcome", "/login", "/demo", "/signup", "/verify", "/forgot", "/reset",
  "/terms", "/privacy",
  // onboarding screens a brand-new account reaches before it has a full profile
  "/permissions", "/style-1", "/style-2",
]);

const WRITES = new Set(["POST", "PATCH", "PUT", "DELETE"]);

/** A write whose Origin header names another host (or cannot be read at all). */
function crossSite(req: NextRequest): boolean {
  if (!WRITES.has(req.method)) return false;
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  try { return new URL(origin).host !== host; } catch { return true; }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/")) {
    if (crossSite(req)) return NextResponse.json({ error: "Blocked cross-site request." }, { status: 403 });
    return NextResponse.next();
  }
  if (OPEN_PAGES.has(pathname) || pathname.startsWith("/s/")) return NextResponse.next();

  const hasSession =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");
  const hasDemo = req.cookies.get("[app]-demo")?.value === "1";

  if (hasSession || hasDemo) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/welcome";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // every api route (origin check) ...
    "/api/:path*",
    // ... and every page except next internals and static files (session gating)
    "/((?!api|_next|img|assets|icons|manifest.json|sw.js|favicon|.*\\..*).*)",
  ],
};
