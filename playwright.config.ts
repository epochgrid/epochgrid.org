import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4321",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4321 --ignore-lock",
    env: { ASTRO_PREVIEW_BACKGROUND: "1" },
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
  },
});
