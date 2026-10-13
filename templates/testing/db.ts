import { createHash } from "node:crypto";

/**
 * tools/e2e/db.ts — direct database access for the few things no route exposes:
 * planting a code the panel would otherwise email, giving a mocked call a price,
 * and reading rows back to prove a negative ("this alert never reached a customer").
 * DATABASE_URL is resolved in global-setup; without one the specs that use this self-skip.
 *
 * Keep this file small. If a spec needs the database for something a user could do,
 * the spec should do it through the API instead.
 */
type Row = Record<string, unknown>;

/** The shared demo profile — the account every DB-backed spec is allowed to touch. */
export const DEMO_USER = 1;

export async function query(text: string, params: unknown[] = []): Promise<Row[]> {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  return (await sql(text, params)) as Row[];
}

/**
 * A completed AI call carrying a price (in the app's smallest cost unit). The mocked
 * engines report no usage, so every call an e2e run makes costs nothing — the money
 * pages need one real number to add up.
 */
export async function plantPricedCall(userId: number, kind: string, costUnits: number, status = "ready"): Promise<number> {
  const [row] = await query(
    `insert into generations (user_id, kind, status, input, result, credits_spent, cost_cents, updated_at)
     values ($1, $2, $4, '{}'::jsonb, '{"usage":{"prompt":0,"output":0,"total":0}}'::jsonb, 0, $3, now())
     returning id`,
    [userId, kind, costUnits, status],
  );
  return Number(row.id);
}

export const removeGeneration = (id: number) => query("delete from generations where id = $1", [id]);

/** A live save-lock code for one admin session, hashed the way the panel stores it (email cannot be read in a test). */
export async function plantSaveCode(sessionId: string, code: string): Promise<void> {
  await clearSaveCodes(sessionId);
  await query(
    `insert into admin_otp (session_id, code_hash, purpose, expires_at)
     values ($1, $2, 'config', now() + interval '10 minutes')`,
    [sessionId, createHash("sha256").update(code).digest("hex")],
  );
}

export const clearSaveCodes = (sessionId: string) => query("delete from admin_otp where session_id = $1", [sessionId]);

/** How many of an account's own notifications carry this text — must be 0 for anything raised for the admin panel. */
export async function customerNotificationsMatching(userId: number, fragment: string): Promise<number> {
  const [row] = await query(
    "select count(*)::int as n from notifications where user_id = $1 and body like $2",
    [userId, `%${fragment}%`],
  );
  return Number(row.n);
}
