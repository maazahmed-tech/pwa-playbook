import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// apps/web/vitest.config.ts — unit + component tests in jsdom.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      // subpath aliases first — a bare "@app/db" alias would otherwise swallow them
      "@app/db/schema": path.resolve(__dirname, "../../packages/db/src/schema.ts"),
      "@app/db/server": path.resolve(__dirname, "../../packages/db/src/client.ts"),
      "@app/db": path.resolve(__dirname, "../../packages/db/src/index.ts"),
    },
  },
});
