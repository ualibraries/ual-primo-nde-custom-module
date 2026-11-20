import { test as base, expect, Page } from '@playwright/test';

/** Primo view to test. Override with NDE_VID in .env. */
export const VID = process.env['NDE_VID'] ?? '01UA_INST:ndeDev';

/**
 * Builds a sandbox URL for an NDE page, e.g. ndeUrl('search', { query: 'water' }).
 * Loads our local custom module unless `localModule` is false.
 */
export function ndeUrl(
  page: string,
  params: Record<string, string> = {},
  { localModule = true } = {},
): string {
  const q = new URLSearchParams({ vid: VID, ...params });
  if (localModule) q.set('useLocalCustomPackage', 'true');
  return `/nde/${page}?${q.toString()}`;
}

/**
 * Waits until the NDE app has started. Primo keeps <body> at
 * visibility: hidden until startup finishes, so a page stuck at hidden is the
 * "white screen" failure.
 */
export async function waitForNdeApp(page: Page): Promise<void> {
  await expect(page.locator('body'), 'NDE app never finished starting (white screen)').not.toHaveCSS(
    'visibility',
    'hidden',
  );
  await expect(page.getByText('Failed to load view configuration')).toHaveCount(0);
}

/**
 * Console errors that come from Ex Libris's code or the dev server, not from
 * us. Add to this list sparingly, with a note saying why.
 */
export const KNOWN_CONSOLE_NOISE: RegExp[] = [
  /NG0951/, // Ex Libris search bar reads a required viewChild too early; harmless
  /\[webpack-dev-server\]/, // dev-server reconnect chatter
  // Ex Libris search bar focuses its input before the Material autocomplete
  // panel exists (same code path as NG0951); harmless
  /reading 'template'\)[\s\S]*_attachOverlay/,
  /Failed to load resource: the server responded with a status of 404/, // missing optional assets
];

type Fixtures = {
  /** Every console message logged on the page, in order. */
  consoleMessages: string[];
  /** Console errors and uncaught page errors, minus KNOWN_CONSOLE_NOISE. */
  consoleErrors: string[];
};

/** `test` with console capture. Import this instead of @playwright/test's `test`. */
export const test = base.extend<Fixtures>({
  consoleMessages: async ({ page }, use) => {
    const messages: string[] = [];
    page.on('console', msg => messages.push(msg.text()));
    await use(messages);
  },
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    const keep = (text: string) => !KNOWN_CONSOLE_NOISE.some(re => re.test(text));
    page.on('console', msg => {
      if (msg.type() === 'error' && keep(msg.text())) errors.push(msg.text());
    });
    page.on('pageerror', err => {
      const text = err.stack ?? `${err.name}: ${err.message}`;
      if (keep(text)) errors.push(text);
    });
    await use(errors);
  },
});

export { expect };
