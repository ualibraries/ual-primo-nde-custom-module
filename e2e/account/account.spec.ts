import { test, expect, ndeUrl, waitForNdeApp } from '../support/nde';
import { hasPatronCredentials } from '../support/patron';

/**
 * My Account tests. These run logged in as the sandbox test patron, using the
 * session saved by e2e/auth.setup.ts. They skip until that login is set up.
 *
 * PLACEHOLDER: add assertions for our My Account customizations here.
 */

test.skip(!hasPatronCredentials(), 'No test patron in .env: see e2e/auth.setup.ts');

test.describe('My Account', () => {
  test('overview loads for the logged-in patron', async ({ page }) => {
    // Check this URL in the sandbox: it's the NDE My Account route as of 2026-11.
    await page.goto(ndeUrl('account', { section: 'overview' }));
    await waitForNdeApp(page);
    await expect(page.locator('nde-account-overview')).toBeVisible();
  });

  // TODO: tests for the My Account customizations on this branch, e.g.
  // test('shows our component in the loans section', async ({ page }) => { ... });
});
