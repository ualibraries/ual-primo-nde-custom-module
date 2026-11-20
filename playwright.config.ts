import { defineConfig, devices } from '@playwright/test';
import { AUTH_FILE } from './e2e/support/patron';

/**
 * Integration tests: load the real Primo NDE sandbox through the local proxy
 * with our custom module, in headless Chromium.
 * Docs: docs/testing.md
 */

// Optional local settings (test patron credentials, a different view).
// Copy .env.example to .env. .env is gitignored.
try {
  process.loadEnvFile('.env');
} catch {
  // no .env: run the public tests only
}

const BASE_URL = 'http://localhost:4201';

const desktop = { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } };

export default defineConfig({
  testDir: './e2e',
  // The sandbox is a live Ex Libris server: give pages time to load.
  timeout: 90_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  workers: process.env['CI'] ? 1 : 2,
  retries: process.env['CI'] ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Pages anyone can see, no login.
    {
      name: 'public',
      testIgnore: [/account\//, /\.setup\.ts$/],
      use: desktop,
    },
    // Logs the test patron in once and saves the session to AUTH_FILE.
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts$/,
      use: desktop,
    },
    // My Account pages, reusing the saved session.
    {
      name: 'account',
      testMatch: /account\/.*\.spec\.ts$/,
      dependencies: ['auth-setup'],
      use: { ...desktop, storageState: AUTH_FILE },
    },
  ],

  // Starts the dev server (or reuses one already running, e.g. from F5)
  // and waits until our module's remoteEntry.js is being served.
  webServer: {
    command: 'npm run start:proxy',
    url: `${BASE_URL}/remoteEntry.js`,
    reuseExistingServer: !process.env['CI'],
    timeout: 240_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
