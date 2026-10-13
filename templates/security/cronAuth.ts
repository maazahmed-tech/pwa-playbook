import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * apps/web/app/api/cron/cronAuth.ts — the scheduler's shared secret.
 *
 * Sent as `Authorization: Bearer <CRON_SECRET>` (what the hosting cron does) or `?secret=`;
 * compared in constant time on equal-length digests. Without a configured secret nothing is
 * authorised. Every cron route calls `cronAuthorized(req)` first — the route inventory test
 * fails the build if one does not.
 */
export function cronAuthorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const header = req.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const query = new URL(req.url).searchParams.get("secret") ?? "";
  return [bearer, query].some((given) => !!given && sameSecret(given, expected));
}

/** Equal-length digests so the comparison takes the same time whatever was sent. */
function sameSecret(given: string, expected: string): boolean {
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(given), digest(expected));
}

export const cronUnauthorized = () =>
  NextResponse.json({ error: "Scheduler secret missing or wrong." }, { status: 401 });

/*
 * Route shape:
 *
 *   export async function GET(req: Request) {
 *     if (!cronAuthorized(req)) return cronUnauthorized();
 *     // reset the demo profile, sweep orphaned jobs, prune old notifications, check the engine wallet
 *     return NextResponse.json({ ok: true });
 *   }
 */
