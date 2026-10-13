/**
 * tools/cutover/config.mjs — bring the app_config row up to date on ANY environment without
 * touching values the admin has set. Idempotent: run it after every migration batch on
 * staging and the CI branch, after production migrations at cutover, and AGAIN after the new
 * code is deployed (an old build still running can write its own defaults back into the row
 * between the migration and the deploy — it happened on 2026-09-16).
 *
 * What it does:
 *  - retires old model ids (only the ones listed, never the admin's own choice)
 *  - adds missing keys with defaults (currency, budget bands, plans, provider prices)
 *  - "reprice": writes the current price list from the code's DEFAULT_CONFIG on every run and
 *    drops retired keys; plan prices, features and any budget the admin set stay
 *  - strips profile fields the app no longer collects
 * Prints one line per change and "no changes" otherwise.
 *
 * Run: DATABASE_URL=<target> node tools/cutover/config.mjs   (from the repo root)
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL?.replace(/^["']|["']$/g, "");
if (!url) { console.error("DATABASE_URL is required"); process.exit(1); }
const sql = neon(url);

// keep these in step with packages/db DEFAULT_CONFIG — the verify script asserts the same values
const CURRENT_MODEL = "[current-image-model-id]";
const RETIRED_MODELS = new Set(["[old-model-1]", "[old-model-2]"]);
const PRICES = { genCost: 0, secondLookCost: 0, refineCost: 0, detectCost: 0, freeDetections: 0, starterCredits: 0 }; // fill from DEFAULT_CONFIG
const REMOVED_KEYS = ["[retiredKey]"];
const DEFAULT_PLANS = {
  plus: { priceMo: 0, priceYr: 0, credits: 0, creditsYr: 0, features: ["[…]"] },
  pro: { priceMo: 0, priceYr: 0, credits: 0, creditsYr: 0, features: ["[…]"] },
};
const PROVIDER_PRICES = { /* per-1M-token rates and per-build engine credits, in cents, from the providers' published pages */ };
const BUDGET_BANDS = { midFromCents: 5000, highFromCents: 15000 };
const REMOVED_PROFILE_KEYS = ["sizes", "measurements"]; // fields the app stopped collecting

const [row] = await sql`select data from app_config where id = 1`;
const data = { ...(row?.data ?? {}) };
const changes = [];

if (!data.renderModel || RETIRED_MODELS.has(data.renderModel)) { data.renderModel = CURRENT_MODEL; changes.push(`renderModel → ${CURRENT_MODEL}`); }
if (!data.shopCurrency) { data.shopCurrency = "USD"; changes.push("shopCurrency → USD"); }
if (!data.plans) { data.plans = DEFAULT_PLANS; changes.push("plans → defaults"); }
if (!data.budgetBands) { data.budgetBands = BUDGET_BANDS; changes.push("budgetBands → defaults"); }
const missingPrices = Object.entries(PROVIDER_PRICES).filter(([k]) => typeof data.providerPrices?.[k] !== "number");
if (missingPrices.length) {
  data.providerPrices = { ...PROVIDER_PRICES, ...(data.providerPrices ?? {}) };
  changes.push(`providerPrices → ${missingPrices.map(([k]) => k).join(", ")}`);
}

// reprice (idempotent): every price key; retired keys go; yearly allowances follow the defaults
for (const [k, v] of Object.entries(PRICES)) if (data[k] !== v) { data[k] = v; changes.push(`${k} → ${v}`); }
for (const k of REMOVED_KEYS) if (k in data) { delete data[k]; changes.push(`${k} dropped`); }
for (const tier of Object.keys(DEFAULT_PLANS)) {
  const want = DEFAULT_PLANS[tier].creditsYr;
  if (data.plans?.[tier] && data.plans[tier].creditsYr !== want) { data.plans[tier].creditsYr = want; changes.push(`plans.${tier}.creditsYr → ${want}`); }
}

if (row) {
  if (changes.length) await sql`update app_config set data = ${JSON.stringify(data)}::jsonb, updated_at = now() where id = 1`;
} else {
  await sql`insert into app_config (id, data) values (1, ${JSON.stringify(data)}::jsonb)`;
  changes.push("config row created");
}

// profile trim: remove fields the app no longer collects (data minimisation)
const trimmed = await sql`update users set style_profile = style_profile - ${REMOVED_PROFILE_KEYS}::text[]
  where jsonb_typeof(style_profile) = 'object' and style_profile ?| ${REMOVED_PROFILE_KEYS}::text[] returning id`;
if (trimmed.length) changes.push(`${trimmed.length} profile(s) trimmed`);

console.log(changes.length ? changes.map((c) => "· " + c).join("\n") : "no changes");
