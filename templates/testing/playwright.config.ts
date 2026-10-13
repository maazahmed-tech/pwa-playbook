import { defineConfig, devices } from "@playwright/test";

/**
 * E2E suite — runs against PRODUCTION builds of both apps.
 * `npm run build` first (CI does), free ports 3000/3001, then `E2E_DB=1 npx playwright test`.
 *
 * Every line with a comment was a flake or a real incident on Assemble; keep them.
 */
export default defineConfig({
  testDir: "./tools/e2e",
  globalSetup: "./tools/e2e/global-setup.ts",
  globalTeardown: "./tools/e2e/global-teardown.ts",
  timeout: 60_000,
  // ONE worker everywhere: spec files share the demo profile and the throwaway accounts
  // (credits, closet, shares). Two workers made them race and report false failures;
  // matching CI's single worker locally costs ~10 minutes and gives a bar you can trust.
  workers: 1,
  // CI retries re-run stateful specs: write assertions that tolerate a second attempt
  // (accept 201 or 409, guard 402 checks on the live balance, ledger events not totals).
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium", // the device profile defaults to WebKit, which is not installed
        channel: "chromium",     // full build — the headless shell has no getUserMedia (camera specs)
        permissions: ["camera"],
        launchOptions: { args: ["--use-fake-ui-for-media-devices", "--use-fake-device-for-media-stream"] },
      },
    },
    {
      name: "desktop",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 800 },
        channel: "chromium",
        permissions: ["camera"],
        launchOptions: { args: ["--use-fake-ui-for-media-devices", "--use-fake-device-for-media-stream"] },
      },
    },
  ],
  webServer: [
    {
      // --keepAliveTimeout 60000: Node's default closes idle sockets before Playwright reuses them (ECONNRESET flakes)
      command: "npm run start --workspace=@app/web -- --keepAliveTimeout 60000",
      url: "http://localhost:3000/welcome",
      reuseExistingServer: false, // a server left over from an earlier run would test a stale build
      timeout: 60_000,
      // never hit real paid engines from tests — and set the mocks on EVERY server (the admin panel's
      // product describer once called the real model because only this block had the flag)
      env: { TRIPO_MOCK: "1", GEMINI_MOCK: "1" },
    },
    {
      command: "npm run start --workspace=@app/admin -- --keepAliveTimeout 60000",
      url: "http://localhost:3001/login",
      reuseExistingServer: false,
      timeout: 60_000,
      env: { GEMINI_MOCK: "1", TRIPO_MOCK: "1" },
    },
  ],
});
