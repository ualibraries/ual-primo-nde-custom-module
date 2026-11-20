import { test, expect, ndeUrl, waitForNdeApp, VID } from './support/nde';

/**
 * Smoke tests: the sandbox loads through the proxy, and our module loads into it.
 */

test.describe('home page', () => {
  test('renders (no white screen)', async ({ page }) => {
    await page.goto(ndeUrl('home'));
    await waitForNdeApp(page);
    await expect(page.locator('nde-top-bar')).toBeVisible();
  });

  test('loads the view configuration through the proxy', async ({ page }) => {
    const configResponse = page.waitForResponse(r =>
      r.url().includes(`/primaws/rest/pub/configuration/vid/${VID}`),
    );
    await page.goto(ndeUrl('home'));
    const response = await configResponse;
    expect(response.status()).toBe(200);

    const config = await response.json();
    expect(config.customization, 'proxy should merge our overrides into customization').toBeTruthy();

    await waitForNdeApp(page);
  });
});

test.describe('custom module', () => {
  test('is served by the dev server and bootstraps', async ({ page, consoleMessages }) => {
    // The shell adds a cache-busting ?t=..., so match with or without a query.
    const remoteEntry = page.waitForResponse(r => /\/remoteEntry\.js(\?|$)/.test(r.url()));
    await page.goto(ndeUrl('home'));

    expect((await remoteEntry).status()).toBe(200);
    await waitForNdeApp(page);
    // Logged by Ex Libris's shell once it has started our module.
    await expect
      .poll(() => consoleMessages.some(m => m.includes('custom remote app bootstrap success')))
      .toBe(true);
  });
});

test.describe('console errors', () => {
  for (const [name, path, params] of [
    ['home', 'home', {}],
    ['search results', 'search', { query: 'water' }],
  ] as const) {
    test(`none on ${name}`, async ({ page, consoleErrors }) => {
      await page.goto(ndeUrl(path, params));
      await waitForNdeApp(page);
      // let late-starting components finish
      await page.waitForLoadState('networkidle');
      expect(consoleErrors).toEqual([]);
    });
  }
});
