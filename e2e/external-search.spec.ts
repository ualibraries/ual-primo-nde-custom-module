import { test, expect, ndeUrl, waitForNdeApp } from './support/nde';

/**
 * UA External Search (src/app/ua-external-search), hooked into
 * nde-search-filters-side-nav-top on the search results page.
 *
 * Primo wraps remote components in an element named after the slot
 * (<nde-search-filters-side-nav-top-from-remote-0>), so there's no
 * <ua-external-search> tag on the page. Target the component's own markup.
 */

const SECTION = 'section.ua-external-search';

const TERMS = 'climate change';

test.describe('UA external search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ndeUrl('search', { query: TERMS }));
    await waitForNdeApp(page);
    // The filters panel starts closed; our component lives inside it.
    await page.getByRole('button', { name: 'Open all filters' }).click();
  });

  test('appears at the top of the filters panel', async ({ page }) => {
    const panel = page.locator('nde-search-filters-side-nav');
    await expect(panel.locator(SECTION)).toBeVisible();
    await expect(panel.getByRole('button', { name: 'External search' })).toBeVisible();
  });

  test('links re-run the search in Google Scholar and WorldCat', async ({ page }) => {
    const section = page.locator(SECTION);
    const scholar = section.getByRole('link', { name: /Google Scholar/ });
    const worldcat = section.getByRole('link', { name: /WorldCat/ });

    await expect(scholar).toHaveAttribute('href', /scholar\.google\.com\/scholar\?.*q=climate(%20|\+)change/);
    await expect(worldcat).toHaveAttribute('href', /worldcat\.org\/search\?queryString=climate(%20|\+)change/);
    await expect(scholar).toHaveAttribute('target', '_blank');
  });

  test('collapses and expands', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'External search' });
    const list = page.locator('#ua-external-search-list');

    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(list).toBeHidden();
    await toggle.click();
    await expect(list).toBeVisible();
  });

  test('is absent when there is no search', async ({ page }) => {
    await page.goto(ndeUrl('home'));
    await waitForNdeApp(page);
    await expect(page.locator(SECTION)).toHaveCount(0);
  });
});
