# Integration tests

Integration tests load the real Primo NDE sandbox through the local proxy, with our custom module in it, in a headless Chromium browser. They use [Playwright](https://playwright.dev).

These are separate from the Karma/Jasmine unit tests in `src/**/*.spec.ts` (`npm test`), which test components on their own.

## Running them

``` bash
npm run test:e2e           # headless, all tests
npm run test:e2e:headed    # watch the browser
npm run test:e2e:ui        # Playwright's interactive UI: pick tests, step through, time-travel
npm run test:e2e:report    # open the HTML report from the last run
```

To run one file or one test: `npx playwright test e2e/external-search.spec.ts`, or add `-g "collapses"`.

You don't need to start the dev server first. Playwright runs `npm run start:proxy` itself, waits until `remoteEntry.js` is served, and stops the server when the tests finish. If a server is already running on port 4201 (for example from F5 in VS Code), it reuses that one.

A full run takes about a minute once the server is up. A first run that has to start the server takes a few minutes longer.

### First-time setup

`npm install` installs Playwright. The browser is a separate download (about 150 MB):

``` bash
npx playwright install chromium
```

## What's covered

| File | Checks |
|---|---|
| [e2e/smoke.spec.ts](../e2e/smoke.spec.ts) | The home page renders (no white screen). The view config loads through the proxy with our overrides merged in. Our module is served and bootstraps. No unexpected console errors on the home and search results pages. |
| [e2e/external-search.spec.ts](../e2e/external-search.spec.ts) | UA External Search appears in the filters panel, its links carry the search terms to Google Scholar and WorldCat, it collapses and expands, and it's absent when there's no search. |
| [e2e/account/account.spec.ts](../e2e/account/account.spec.ts) | **Placeholder.** My Account tests, which need a logged-in test patron. Skipped until login is set up (see below). |

## Layout

```
playwright.config.ts        browser, timeouts, dev server, projects
e2e/
  support/nde.ts            ndeUrl(), waitForNdeApp(), console capture, KNOWN_CONSOLE_NOISE
  support/patron.ts         test patron settings
  smoke.spec.ts
  external-search.spec.ts
  auth.setup.ts             logs the test patron in once (placeholder)
  account/account.spec.ts   My Account tests (placeholder)
.env.example                copy to .env for local settings (gitignored)
```

The config has three projects:

- **public:** everything outside `e2e/account/`. No login.
- **auth-setup:** runs `auth.setup.ts` to log in and save the session to `playwright/.auth/patron.json` (gitignored).
- **account:** runs `e2e/account/` with that saved session, so each test starts logged in.

## Writing tests

Import `test` and `expect` from `./support/nde`, not from `@playwright/test`. That version adds the `consoleErrors` and `consoleMessages` fixtures.

``` ts
import { test, expect, ndeUrl, waitForNdeApp } from './support/nde';

test('my thing shows up', async ({ page }) => {
  await page.goto(ndeUrl('search', { query: 'water' })); // adds vid + useLocalCustomPackage
  await waitForNdeApp(page);                             // waits out the white screen
  await expect(page.locator('section.my-thing')).toBeVisible();
});
```

Things we've learned about testing NDE:

- **Our components don't appear under their own tag.** Primo wraps each remote component in an element named after its slot, for example `<nde-search-filters-side-nav-top-from-remote-0>`, so `<ua-external-search>` never appears on the page. Locate components by a class on their own root element, or by role and text.
- **The filters panel starts closed** at desktop size. Click **Open all filters** before checking anything inside it.
- **Wait for the app, not the page load.** `<body>` stays `visibility: hidden` until NDE finishes starting. `waitForNdeApp()` handles that.
- **Prefer our own markup and stable `nde-*` tags** over Primo's internal classes, which can change in any release. See [NDE component selectors](nde-selectors.md).
- **Known Ex Libris console errors** are in `KNOWN_CONSOLE_NOISE` in [e2e/support/nde.ts](../e2e/support/nde.ts), each with a note saying why. Add to it sparingly: anything not on the list fails the console error tests.

To record steps instead of writing them by hand, start the dev server and run `npx playwright codegen "http://localhost:4201/nde/home?vid=01UA_INST:ndeDev&useLocalCustomPackage=true"`.

## Setting up My Account tests

The login is a placeholder. To finish it:

1. **Get a sandbox test patron** that logs in with a username and password, meaning an Alma internal/local account. A NetID login with Duo can't be automated.
2. **Add the credentials to `.env`:** copy `.env.example` to `.env` and fill in `NDE_PATRON_USER` and `NDE_PATRON_PASSWORD`. `.env` is gitignored. Never commit credentials.
3. **Record the login steps** with `codegen` (see above) and paste them into [e2e/auth.setup.ts](../e2e/auth.setup.ts) in place of the TODO. Then uncomment the `storageState` line that saves the session.
4. **Check the My Account URL** in [e2e/account/account.spec.ts](../e2e/account/account.spec.ts) against the sandbox, then add tests for our My Account changes.

Until `.env` has credentials, the login step and the account tests show as skipped.

## Things to know

- **The tests depend on the live Ex Libris sandbox.** They need network access, and an Ex Libris release can break them even when our code hasn't changed. If a test starts failing, check the sandbox directly before assuming our module is at fault (see [Troubleshooting](troubleshooting.md)).
- **When a test fails**, the run saves a screenshot and a trace in `test-results/`. `npx playwright show-trace <path>/trace.zip` replays the test step by step, with the DOM, console and network at each point.
- **Tests run two at a time** to go easy on the sandbox. In CI (`CI=true`) they run one at a time with one retry, and never reuse an existing server.
