import { defineConfig, devices } from "@playwright/test";

/**
 * apps/site/playwright.config.ts — smoke test for the exported marketing site.
 * Build first (`npm run build`), then `npm run test:smoke`.
 * Fully parallel is fine here: nothing mutates state.
 *
 * What the smoke spec should assert (Assemble's list): every section renders; header and
 * footer logo present; the hero animation runs and pauses off-screen; reduced-motion
 * respected; no horizontal overflow at 390 px; no broken images; forbidden words absent
 * (client's name, retired persona words, British spellings on an American page); pricing
 * table values equal the live config; the QR hand-off only on laptops; the sticky bar only
 * on phones; 3D viewers lazy-load; noindex header on the preview project.
 */
export default defineConfig({
  testDir: "./tests/smoke",
  outputDir: "./test-results",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:3013" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node tests/serve.mjs out 3013",
    url: "http://127.0.0.1:3013",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
