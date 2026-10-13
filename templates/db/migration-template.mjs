/**
 * packages/db/migrations/NNN-[name].mjs — the migration pattern.
 *
 * Plain Node, no ORM, ADDITIVE and RE-RUNNABLE: every statement is `IF NOT EXISTS` /
 * count-guarded, so a network retry or a second run is safe, and the previous deployment
 * keeps working against the migrated database (that is what makes instant rollback possible).
 *
 *  - reads DATABASE_URL from the environment (quotes stripped: a value pasted from an env file
 *    may still carry them), else the unpooled URL from apps/web/.env.local
 *  - prints ONE result line with counts
 *  - applied to staging AND the CI branch the same day; production only at cutover after a
 *    rehearsal on a fork (see docs/CUTOVER-RUNBOOK.md)
 *  - a non-additive change (one that moves data the live build still reads) is marked
 *    "cutover only" at the top and in the runbook
 *
 * Run: node packages/db/migrations/NNN-[name].mjs   (from the repo root)
 *      DATABASE_URL=<branch url> node packages/db/migrations/NNN-[name].mjs
 *
 * Why not `drizzle-kit push` after the first deploy: it tries to reconcile existing primary
 * keys and chokes. Push the schema once for a fresh database, then migrate with files like this.
 * Keep `packages/db/src/schema.ts` in step (the types), and extend tools/cutover/config.mjs +
 * verify.mjs so a fresh environment reaches the same state.
 */
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const fromEnv = process.env.DATABASE_URL?.replace(/^["']|["']$/g, "");
const env = fromEnv ? "" : readFileSync("apps/web/.env.local", "utf8");
const url = fromEnv ?? (env.match(/^DATABASE_URL_UNPOOLED=(.+)$/m) ?? env.match(/^DATABASE_URL=(.+)$/m))[1].replace(/^["']|["']$/g, "");
const sql = neon(url);

// 1. columns and tables — always IF NOT EXISTS
await sql`alter table users add column if not exists [column] [type] [default … not null]`;
await sql`create table if not exists [new_table] (
  id serial primary key,
  user_id integer not null references users(id),
  [field] text not null,
  created_at timestamptz not null default now()
)`;
await sql`create index if not exists [new_table]_user_idx on [new_table](user_id)`;

// 2. backfill — only rows still at the default, so a second run changes nothing; report the count
const backfilled = await sql`update users set [column] = [expression] where [column] is null returning id`;

// 3. config row — merge new keys into app_config.data without touching values the admin set
const [row] = await sql`select data from app_config where id = 1`;
if (row) {
  const data = { ...row.data };
  const added = [];
  for (const [k, v] of Object.entries({ [`[newKey]`]: 0 })) {
    if (!(k in data)) { data[k] = v; added.push(k); }
  }
  if (added.length) await sql`update app_config set data = ${JSON.stringify(data)}::jsonb, updated_at = now() where id = 1`;
}

// 4. count-guarded seed — insert only when the table is empty
const [{ n }] = await sql`select count(*)::int as n from [seed_table]`;
if (n === 0) {
  // await sql`insert into [seed_table] (...) values (...)`;
}

console.log(`NNN [name] applied · ${backfilled.length} row(s) backfilled${row ? "" : " (no config row yet — tools/cutover/config.mjs creates it)"}`);
