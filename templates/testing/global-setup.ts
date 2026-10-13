import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * tools/e2e/global-setup.ts
 *
 * Runs once before the suite:
 *  1. resolves DATABASE_URL (CI secret) or reads apps/web/.env.local (local runs);
 *     without one, DB-backed specs self-skip and this is a no-op
 *  2. resets the shared demo profile so money/closet assertions are deterministic
 *  3. clears rate-limit counters the previous run filled
 *  4. deletes and recreates one throwaway account PER SPEC FAMILY on the `@test.local`
 *     domain — sharing an account between spec files was the root of most flakes
 *  5. sets E2E_DB=1 (and E2E_STORAGE=1 when bucket credentials exist)
 *
 * Nothing an e2e run creates costs money: the engines are mocked and report no usage.
 */

const readEnv = (rel: string) => {
  try { return readFileSync(join(__dirname, rel), "utf8"); } catch { return ""; }
};
const pick = (env: string, key: string) =>
  env.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");

/** Throwaway accounts. One per spec family; a spec must never touch another family's account. */
export const TEST_ACCOUNTS = [
  ["buddy@test.local", "buddy", "Buddy Tester"],       // cross-account social specs
  ["storer@test.local", "storer", "Storer Tester"],    // storage / 3D specs (its credit mutations never race the demo money checks)
  ["changer@test.local", "changer", "Changer Tester"], // only the password-change test signs in as this one
  ["prober@test.local", "prober", "Prober Tester"],    // the attack suite's attacker
  ["victim@test.local", "victim", "Victim Tester"],    // the attack suite's target
  ["newbie@test.local", "newbie", "Newbie Tester"],    // the set-up screens need an account that has never saved a profile
  // add one line per new stateful spec family; add it to global-teardown's table list if it owns new tables
] as const;

/** The password every throwaway account gets. Must satisfy the app's strength rules (update it when they change). */
export const TEST_PASSWORD = "Password123!";

/** Starter balance a real sign-up gets (mirror app_config.starterCredits). */
const STARTER_CREDITS = 18;

/** Tables that hang off a user row, in delete order (most foreign keys have no cascade — be explicit). */
export const USER_TABLES = [
  "shares", "wear_history", "push_subscriptions", "items", "looks", "collections", "friends",
  "credit_ledger", "notifications", "tickets", "generations", "avatars_3d", "packing_lists",
  "saved_products", "product_feedback",
];

/**
 * Rate-limit keys the suite may have filled (`<kind>:<subject>`): the test accounts' emails,
 * the TEST-NET address and device ids the security spec sends, the admin save-lock throttle
 * (the runner's own address is the same every run — it would answer 429 where a spec expects 401).
 */
export const TEST_RATE_LIMIT_PATTERNS = ["%test.local%", "%203.0.113.%", "%:d:d-ratelimit-%", "%admin-save%"];

type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown[]>;

export async function clearTestRateLimits(sql: Sql, accountIds: number[] = []) {
  try {
    for (const pattern of TEST_RATE_LIMIT_PATTERNS) await sql`delete from rate_limits where key like ${pattern}`;
    for (const id of accountIds) await sql`delete from rate_limits where key like ${`%:u${id}`}`;
  } catch { /* no rate_limits table yet */ }
}

export default async function globalSetup() {
  const webEnv = readEnv("../../apps/web/.env.local");
  const adminEnv = readEnv("../../apps/admin/.env.local");

  const url = process.env.DATABASE_URL?.replace(/^["']|["']$/g, "") ?? pick(webEnv, "DATABASE_URL");

  // storage specs need the bucket credentials (CI: env; local: .env.local)
  if (process.env.AWS_ACCESS_KEY_ID || /^AWS_ACCESS_KEY_ID=/m.test(webEnv)) process.env.E2E_STORAGE = "1";

  // admin specs mint the admin session cookie directly from the secret
  if (!process.env.ADMIN_SESSION_SECRET) {
    const s = pick(adminEnv, "ADMIN_SESSION_SECRET");
    if (s) process.env.ADMIN_SESSION_SECRET = s;
  }
  // the scheduler's own key, so specs that call a cron route can authorise
  if (!process.env.CRON_SECRET) {
    const c = pick(webEnv, "CRON_SECRET");
    if (c) process.env.CRON_SECRET = c;
  }

  if (!url) {
    console.log("[e2e] no DATABASE_URL — demo reset skipped, DB specs will self-skip");
    return;
  }
  process.env.DATABASE_URL = url;

  const { resetDemo } = await import("../../packages/db/src/reset-demo");
  const uid = await resetDemo(url);
  console.log(`[e2e] demo profile reset (user ${uid})`);

  const { neon } = await import("@neondatabase/serverless");
  const bcrypt = (await import("bcryptjs")).default;
  const sql = neon(url);

  const stale = await sql`select id from users where email like '%@test.local'`;
  await clearTestRateLimits(sql as unknown as Sql, stale.map((r) => Number(r.id)));

  const hash = bcrypt.hashSync(TEST_PASSWORD, 10);
  for (const [email, username, name] of TEST_ACCOUNTS) {
    const existing = await sql`select id from users where email = ${email}`;
    if (existing.length) {
      const bid = existing[0].id;
      // rows that reference the user indirectly first (responses to its shares, reports on its looks, blocks)
      await sql`delete from share_responses where share_id in (select id from shares where user_id = ${bid})`;
      await sql`delete from content_reports where reporter_user_id = ${bid} or look_id in (select id from looks where user_id = ${bid})`;
      await sql`delete from share_responses where look_id in (select id from looks where user_id = ${bid})`;
      await sql`delete from blocks where user_id = ${bid} or blocked_user_id = ${bid}`;
      for (const t of USER_TABLES) await sql(`delete from ${t} where user_id = $1`, [bid]);
      await sql`delete from users where id = ${bid}`;
    }
    // rows addressed to the username from other accounts (shares sent to it, friendships)
    await sql`delete from share_responses where share_id in (select id from shares where friend_username = ${username})`;
    await sql`delete from shares where friend_username = ${username}`;
    await sql`delete from friends where username = ${username}`;
    await sql`insert into users (name, email, username, password_hash, email_verified, credits)
              values (${name}, ${email}, ${username}, ${hash}, true, ${STARTER_CREDITS})`;
  }
  console.log(`[e2e] ${TEST_ACCOUNTS.length} throwaway account(s) recreated`);
  process.env.E2E_DB = "1";
}
