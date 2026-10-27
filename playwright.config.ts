import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:4400' },
  webServer: {
    command: 'npm run build && npx astro preview --port 4400 --ignore-lock',
    url: 'http://localhost:4400',
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      PUBLIC_GA_ID: 'G-TEST000000',
      SITE_ENV: 'test',
      SITE_URL: 'http://localhost:4400',
    },
  },
  projects: [
    {
      name: 'chromium',
      // Playwright's bundled Chromium doesn't support macOS 13; use installed Chrome locally, bundled Chromium in CI.
      use: { ...devices['Desktop Chrome'], ...(process.env.CI ? {} : { channel: 'chrome' }) },
    },
    // Firefox and WebKit (Safari's engine) aren't supported by Playwright on macOS 13, so they run in CI only.
    ...(process.env.CI
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
          { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
        ]
      : []),
  ],
});
