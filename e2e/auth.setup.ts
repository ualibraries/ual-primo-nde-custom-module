import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { test as setup } from '@playwright/test';
import { AUTH_FILE, hasPatronCredentials } from './support/patron';

/**
 * Logs the sandbox test patron in once and saves the session to AUTH_FILE.
 * The `account` project reuses that session, so each test starts logged in.
 *
 * PLACEHOLDER: the login steps aren't written yet. To finish this:
 *  1. Get a sandbox test patron that can log in with a username and password
 *     (an Alma internal/local account). A NetID login with Duo can't be
 *     automated.
 *  2. Put its credentials in .env (see .env.example).
 *  3. Record the login steps: `npx playwright codegen "http://localhost:4201/nde/home?vid=01UA_INST:ndeDev"`,
 *     with the dev server running. Paste the generated steps below in place of
 *     the TODO.
 */
setup('log in test patron', async ({ page }) => {
  mkdirSync(dirname(AUTH_FILE), { recursive: true });

  if (!hasPatronCredentials()) {
    // Write an empty session so Playwright can start; account tests skip themselves.
    writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }));
    setup.skip(true, 'No NDE_PATRON_USER / NDE_PATRON_PASSWORD in .env');
  }

  // TODO: replace with the recorded login steps, for example:
  //   await page.goto(ndeUrl('home'));
  //   await page.getByRole('button', { name: 'Sign in' }).click();
  //   await page.getByLabel('Username').fill(process.env['NDE_PATRON_USER']!);
  //   await page.getByLabel('Password').fill(process.env['NDE_PATRON_PASSWORD']!);
  //   await page.getByRole('button', { name: 'Log in' }).click();
  //   await expect(page.locator('nde-user-area' /* or similar */)).toBeVisible();
  void page;
  throw new Error('Patron login is not implemented yet: see the steps at the top of e2e/auth.setup.ts');

  // When the steps above work, this saves the logged-in session:
  // await page.context().storageState({ path: AUTH_FILE });
});
