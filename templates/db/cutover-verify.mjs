/**
 * tools/cutover/verify.mjs — PASS/FAIL checklist for a target database.
 *
 * Every migration's columns and tables are present, the config row is current, seeds exist,
 * invariants hold, and nothing was lost (row counts printed). Exits 1 on any FAIL, so the
 * cutover runbook can say "stop on the first FAIL". Extend it in every batch that adds a
 * migration; run it on staging and the CI branch after each batch, on the production fork at
 * rehearsal, and on production at cutover.
 *
 * Run: DATABASE_URL=<target> node tools/cutover/verify.mjs   (from the repo root)
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL?.replace(/^["']|["']$/g, "");
if (!url) { console.error("DATABASE_URL is required"); process.exit(1); }
const sql = neon(url);
let failed = 0;
const check = (label, ok, extra = "") => { console.log(`${ok ? "PASS" : "FAIL"} ${label}${extra ? " · " + extra : ""}`); if (!ok) failed++; };

// one entry per column a migration added
const COLUMNS = [
  ["users", "[column]"],
  ["looks", "[column]"],
];
// one entry per table a migration created
const TABLES = ["rate_limits", "admin_sessions", "admin_otp", "config_audit", "admin_notifications"];
// keep in step with tools/cutover/config.mjs and packages/db DEFAULT_CONFIG
const CURRENT_MODEL = "[current-image-model-id]";
const PRICES = { genCost: 0, secondLookCost: 0, refineCost: 0, detectCost: 0, freeDetections: 0, starterCredits: 0 };
const REMOVED_KEYS = ["[retiredKey]"];
const PROVIDER_PRICE_KEYS = ["[key1]", "[key2]"];

// --- schema
const cols = await sql`select table_name, column_name, column_default from information_schema.columns where table_schema = 'public'`;
const have = new Set(cols.map((c) => `${c.table_name}.${c.column_name}`));
for (const [t, c] of COLUMNS) check(`column ${t}.${c}`, have.has(`${t}.${c}`));
const creditsDefault = cols.find((c) => c.table_name === "users" && c.column_name === "credits")?.column_default;
check(`users.credits defaults to the starter balance (${PRICES.starterCredits})`, creditsDefault === String(PRICES.starterCredits), String(creditsDefault));
const tables = new Set((await sql`select table_name from information_schema.tables where table_schema = 'public'`).map((t) => t.table_name));
for (const t of TABLES) check(`table ${t}`, tables.has(t));

// --- config row
const [cfg] = await sql`select data from app_config where id = 1`;
check("config row exists", !!cfg);
check("config renderModel is the current image model", cfg?.data?.renderModel === CURRENT_MODEL, String(cfg?.data?.renderModel));
const offPrice = Object.entries(PRICES).filter(([k, v]) => cfg?.data?.[k] !== v).map(([k, v]) => `${k}=${cfg?.data?.[k]} (want ${v})`);
check("config carries the current price list", offPrice.length === 0, offPrice.join(", "));
const leftover = REMOVED_KEYS.filter((k) => cfg?.data && k in cfg.data);
check("retired keys are gone from the config", leftover.length === 0, leftover.join(", "));
const missingPrices = PROVIDER_PRICE_KEYS.filter((k) => typeof cfg?.data?.providerPrices?.[k] !== "number");
check("config carries every provider price", missingPrices.length === 0, missingPrices.join(", "));
check("config carries plans with yearly allowances", !!cfg?.data?.plans?.plus?.creditsYr && !!cfg?.data?.plans?.pro?.creditsYr);

// --- invariants (one per rule the app relies on; each one was a real bug once)
const [auth] = await sql`select count(*) filter (where auth_method not in ('google', 'password'))::int as odd,
  count(*) filter (where auth_method = 'google' and password_hash is not null)::int as google_pw from users`;
check("every account has exactly one sign-in method", auth.odd === 0 && auth.google_pw === 0, `${auth.odd} unknown, ${auth.google_pw} Google account(s) with a password`);
const [unfiled] = await sql`select count(*)::int as n from items i where not exists (select 1 from taxonomy t where t.kind = 'category' and t.slug = i.category)`;
check("every item is filed under a live category", unfiled.n === 0, `${unfiled.n} unfiled`);
const [help] = await sql`select count(*)::int as n from help_articles where kind = 'help' and published`;
check("help centre has articles", help.n >= 1, `${help.n} published`);
const [demo] = await sql`select count(*)::int as n from users where id = 1`;
check("demo profile row exists", demo.n === 1);

// --- nothing lost
const counts = (await sql`select (select count(*)::int from users) as users, (select count(*)::int from items) as items, (select count(*)::int from looks) as looks, (select count(*)::int from products) as products`)[0];
console.log(`counts · users ${counts.users} · items ${counts.items} · looks ${counts.looks} · products ${counts.products}`);

if (failed) { console.log(`${failed} check(s) failed`); process.exit(1); }
console.log("all checks passed");
