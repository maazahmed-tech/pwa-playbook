import { expect, test, type Page } from "@playwright/test";

/**
 * tools/e2e/example.spec.ts — the house conventions in one file. Copy it for a new area.
 *
 * Conventions (each one closed a real flake or a real gap):
 *  - DB-backed specs self-skip without E2E_DB, so the suite still runs keyless.
 *  - Anything that mutates the demo profile or a shared account runs serially and on ONE project.
 *  - The demo profile is entered with its cookie, never by typing credentials.
 *  - The install banner is dismissed up front (it overlays the top bar and intercepts clicks).
 *  - Money is asserted as ledger EVENTS, never as an exact balance.
 *  - Mutating clicks are idempotent: check state, click once, wait for network idle, re-check.
 *  - API-first checks with page.request; one UI path per feature.
 *  - Nothing depends on email delivery.
 */

const hasDb = !!process.env.E2E_DB;
test.skip(!hasDb, "needs DATABASE_URL");
test.describe.configure({ mode: "serial" });

const DEMO_COOKIE = (baseURL: string) => ({ name: "[app]-demo", value: "1", url: baseURL });

test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mutates the demo profile — one project only");
  await context.addCookies([DEMO_COOKIE(baseURL!)]);
  await page.addInitScript(() => localStorage.setItem("[app]-install-dismissed", "1"));
});

/** Click until the page reaches the expected state; never re-click a mutating control blindly. */
async function clickUntil(page: Page, selector: string, reached: () => Promise<boolean>, tries = 3) {
  for (let i = 0; i < tries; i++) {
    if (await reached()) return;
    await page.locator(selector).first().click();
    await page.waitForLoadState("networkidle");
  }
  expect(await reached(), `${selector} never reached its target state`).toBe(true);
}

test("a paid action charges once and writes one ledger event", async ({ page, baseURL }) => {
  test.slow(); // login + polling specs exceed the 60 s default

  const before = await (await page.request.get(`${baseURL}/api/credits`)).json();
  const ledgerBefore = (before.ledger as unknown[]).length;

  // API-first: the action itself
  const r = await page.request.post(`${baseURL}/api/ai/[action]`, { data: { /* minimal valid body */ } });
  expect([200, 402]).toContain(r.status()); // 402 is legitimate on a retry when credits ran out

  if (r.status() === 200) {
    const after = await (await page.request.get(`${baseURL}/api/credits`)).json();
    expect((after.ledger as unknown[]).length).toBe(ledgerBefore + 1); // one event, not a balance
  }

  // one UI path
  await page.goto("/[screen]");
  await expect(page.getByText("[visible result]").first()).toBeVisible({ timeout: 15_000 });
});

test("another account cannot read this account's private file", async ({ browser, baseURL }) => {
  test.skip(!process.env.E2E_STORAGE, "needs bucket credentials");
  const stranger = await browser.newContext(); // signed out
  const res = await stranger.request.get(`${baseURL}/api/storage/u1/item/anything.jpg`);
  expect(res.status()).toBe(401);
  await stranger.close();
});

test("admin change reaches the app", async ({ page, baseURL }) => {
  test.skip(!process.env.ADMIN_SESSION_SECRET, "needs the admin session secret");
  const admin = await page.context().browser()!.newContext();
  await admin.addCookies([{ name: "[app]-admin", value: process.env.ADMIN_SESSION_SECRET!, url: "http://localhost:3001" }]);
  const put = await admin.request.put("http://localhost:3001/api/admin/config", { data: { [`[key]`]: 2 } });
  expect([200, 423]).toContain(put.status()); // 423 = locked setting needs a code; plant one with tools/e2e/db.ts if the spec needs it
  const cfg = await (await page.request.get(`${baseURL}/api/config`)).json();
  expect(cfg.config).toHaveProperty("[key]");
  await admin.close();
});
