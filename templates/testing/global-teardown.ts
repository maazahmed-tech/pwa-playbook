import { readFileSync } from "node:fs";
import { join } from "node:path";
import { USER_TABLES, clearTestRateLimits } from "./global-setup";

/**
 * tools/e2e/global-teardown.ts
 *
 * After every e2e run, remove every `@test.local` account, its rows and its bucket files,
 * so the database only ever holds real accounts between runs. Same env resolution as
 * global-setup; a run without a DATABASE_URL has nothing to clean.
 *
 * Why the account list is not hard-coded here: a renamed or added account is then never
 * forgotten (everything on the throwaway domain goes). Never give a real or marketing
 * account an address on this domain.
 */
const BUCKET = process.env.STORAGE_BUCKET ?? "[bucket-name]";

export default async function globalTeardown() {
  const readEnv = (file: string) => {
    try { return readFileSync(join(__dirname, file), "utf8"); } catch { return ""; }
  };
  const webEnv = readEnv("../../apps/web/.env.local");
  let url = process.env.DATABASE_URL?.replace(/^["']|["']$/g, "");
  if (!url) url = webEnv.match(/^DATABASE_URL=(.+)$/m)?.[1]?.replace(/^["']|["']$/g, "");
  if (!url) return;

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);
  const doomed = await sql`select id, username from users where email like '%@test.local'`;
  await clearTestRateLimits(sql as never, doomed.map((u) => Number(u.id)));

  for (const u of doomed) {
    await sql`delete from share_responses where share_id in (select id from shares where user_id = ${u.id})`;
    await sql`delete from content_reports where reporter_user_id = ${u.id} or look_id in (select id from looks where user_id = ${u.id})`;
    await sql`delete from share_responses where look_id in (select id from looks where user_id = ${u.id})`;
    await sql`delete from blocks where user_id = ${u.id} or blocked_user_id = ${u.id}`;
    for (const t of USER_TABLES) await sql(`delete from ${t} where user_id = $1`, [u.id]);
    if (u.username) {
      await sql`delete from share_responses where share_id in (select id from shares where friend_username = ${u.username})`;
      await sql`delete from shares where friend_username = ${u.username}`;
      await sql`delete from friends where username = ${u.username}`;
    }
    await sql`delete from users where id = ${u.id}`;
  }

  // their uploaded files too, when bucket credentials are available (best-effort)
  if (doomed.length) {
    for (const k of ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_ENDPOINT_URL_S3", "AWS_REGION"]) {
      if (!process.env[k]) {
        const v = webEnv.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1];
        if (v) process.env[k] = v;
      }
    }
    if (process.env.AWS_ACCESS_KEY_ID) {
      try {
        const { S3Client, ListObjectsV2Command, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
        const s3 = new S3Client({ forcePathStyle: true }); // required for Neon Object Storage
        for (const u of doomed) {
          const list = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: `u${u.id}/` }));
          for (const o of list.Contents ?? []) await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: o.Key! }));
        }
      } catch { /* best-effort */ }
    }
  }
  console.log(`[e2e] teardown removed ${doomed.length} test account(s)`);
}
