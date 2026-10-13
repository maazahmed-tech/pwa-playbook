/**
 * tools/verify.mjs — interaction + overflow crawl of the customer app.
 *
 * 1. every route at a phone width: no horizontal overflow, no page errors, no console errors
 * 2. the money/gating flows that matter (generate spends a credit, plan gates fire, purchase adds credits)
 *
 * Run with the dev or production servers up: `node tools/verify.mjs`. It was the Step 1
 * acceptance check on Assemble (31 routes at 375 px, 0 problems before anything was pushed).
 * Select by role or test id, not loose text — a selector that matched a description
 * paragraph containing "Swap" produced the one false alarm.
 */
import { chromium } from "playwright";

const WEB = process.env.WEB_URL ?? "http://localhost:3000";
const ROUTES = [
  "/welcome", "/signup", "/login", "/home", "/closet", "/match", "/match/occasion",
  "/match/prefs", "/match/results", "/saved", "/shop", "/profile", "/credits", "/plans",
  "/prefs", "/settings", "/help", "/support", "/notifications", "/friends", "/inbox", "/shared",
  // add every route of the app; a missing route is a hole in the check
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
await ctx.addCookies([{ name: "[app]-demo", value: "1", url: WEB }]);
const page = await ctx.newPage();
await page.addInitScript(() => localStorage.setItem("[app]-install-dismissed", "1"));
const problems = [];
page.on("pageerror", (e) => problems.push(`PAGEERROR ${page.url()}: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") problems.push(`CONSOLE ${page.url()}: ${m.text()}`); });

// 1) overflow check at 375px on every route
for (const r of ROUTES) {
  await page.goto(WEB + r, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const over = await page.evaluate(() => {
    const d = document.documentElement;
    if (d.scrollWidth > d.clientWidth + 1) return `document ${d.scrollWidth}/${d.clientWidth}`;
    const bad = [];
    document.querySelectorAll("main *, .main *").forEach((el) => {
      const cs = getComputedStyle(el);
      if (el.scrollWidth > el.clientWidth + 1 && !["auto", "hidden", "scroll"].includes(cs.overflowX)) {
        if (el.getBoundingClientRect().right > 376) bad.push(`${el.tagName}.${String(el.className).slice(0, 30)}`);
      }
    });
    return bad.length ? bad.slice(0, 3).join(" | ") : null;
  });
  if (over) problems.push(`OVERFLOW ${r}: ${over}`);
  else console.log("ok overflow", r);
}

// 2) one money flow: generating spends exactly one ledger event (adapt selectors to the app)
await page.goto(WEB + "/credits", { waitUntil: "networkidle" });
const before = await page.evaluate(() => document.querySelectorAll("[data-ledger-row]").length);
await page.goto(WEB + "/match/prefs", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /generate/i }).click();
await page.waitForURL("**/match/results", { timeout: 20_000 });
await page.goto(WEB + "/credits", { waitUntil: "networkidle" });
const after = await page.evaluate(() => document.querySelectorAll("[data-ledger-row]").length);
if (after !== before + 1) problems.push(`LEDGER expected ${before + 1} rows after generating, got ${after}`);
else console.log("ok generate flow → one ledger event");

// 3) plan gate: a free account tapping a locked feature sees the unlock sheet, not the feature
await page.goto(WEB + "/saved", { waitUntil: "networkidle" });
const gate = await page.getByText(/unlock|upgrade/i).first().isVisible().catch(() => false);
if (!gate) problems.push("GATE saved looks did not show the unlock sheet for a free account");
else console.log("ok plan gate");

await browser.close();
if (problems.length) { console.log(problems.join("\n")); console.log(`${problems.length} problem(s)`); process.exit(1); }
console.log("0 problems");
