## Stuff to know for development

### How the proxy server works

The proxy is a local Angular dev-server proxy used during development (ng serve --proxy-config ./proxy/proxy.conf.mjs). It intercepts four categories of requests and handles each differently:

1. Asset path aliasing (/custom/*/assets/** and /nde/custom/*/assets/**)

Rewrites incoming asset URLs from their "published" form (e.g. /nde/custom/MOCKINST-MOCKVID/assets/foo.png) back to the local dev server's /assets/foo.png. This lets the dev server serve files from the local src/assets/ folder while the app uses the same URL structure it would in production.

2. Customization config intercept (/primaws/rest/pub/configuration/vid/)

This is the most interesting rule. When the Primo VE app fetches its configuration JSON from the real backend (set in proxy/proxy.const.mjs), this rule:

Forwards the request to the real server
Intercepts the response before it reaches the browser
Deep-merges the local overrides from proxy/customization_config_override.mjs into the real config's customization field
Returns the merged result to the browser
The effect: the app behaves as if the real Primo server already has your local customization deployed (logo, favicon, homepage HTML per language, custom SVG icons, etc.) — without actually deploying anything.

3. /nde/custom/** stripping

Strips the /nde/custom/<vid>/ prefix and routes back to the local dev server. This is what makes the asset aliasing in rule #1 actually work end-to-end.

4. Catch-all passthrough

Everything else is forwarded as-is to PROXY_TARGET (the real Primo VE server configured in proxy/proxy.const.mjs).

In summary: the proxy lets you develop locally against a live Primo VE backend while testing your customization changes (assets, config) as if they were already deployed, without modifying anything on the server.

---

### How to check your current dev environment and install necessities

Most dev machines are gonna have some version of node and npm installed by default. But just to make sure you don't get tripped up over the complexities of this environment, do the following:

``` bash
node --version 2>/dev/null; npm --version 2>/dev/null; ng version 2>/dev/null | head -5
```

Which should look something like:

``` bash
v25.9.0 (node/npm)
11.12.1 (angular)
```

If all goes well, those versions are fairly recent. Otherwise see how to install Node.js and npm by downloading the installer from nodejs.org, then run it and follow the prompts; npm is included automatically with Node.js. For Windows, you can also use nvm-windows to manage multiple Node.js versions.

---

### How to begin development

To start up this environment, simply run the following:

``` bash
npm install
npm run start:proxy
```

To serve the sandbox environment:

``` bash
ng serve --proxy-config ./proxy/proxy.conf.mjs
```

Visit the local website serving the proxy:
**http://localhost:4201/nde/home?vid=01UA_INST:ndeDev&useLocalCustomPackage=true**

#### Running from VS Code

The repo includes VS Code config in `.vscode/` that starts the server and opens the sandbox in a browser for you:

- `.vscode/tasks.json` defines a task named **serve:proxy**. It runs `npm run start:proxy`.
- `.vscode/launch.json` defines a debug config named **NDE sandbox (Chrome)**. It runs the `serve:proxy` task first, waits for the build to finish, then opens Chrome at the sandbox URL above with the VS Code debugger attached.

Ways to use them:

- **Server + browser + debugger:** press **F5**, or open the Run and Debug panel and pick **NDE sandbox (Chrome)**. Breakpoints you set in VS Code's `.ts` files will be hit in the browser. Stopping the debugger closes the browser, but the server keeps running in the terminal panel.
- **Server only:** Cmd+Shift+P → **Tasks: Run Task** → **serve:proxy**. Then open the URL in any browser yourself.
- **Quick preview inside VS Code:** with the server running, Cmd+Shift+P → **Simple Browser: Show**, then paste the URL. It has no dev tools, so it's only good for a quick look.

Notes:

- To use Edge instead of Chrome, change `"type": "chrome"` to `"type": "msedge"` in `launch.json`.
- The task's `problemMatcher` builds on VS Code's built-in `$tsc-watch` matcher, which tells VS Code that the task is a watch task. Its `background` patterns tell VS Code when a build has started and finished. If you see "Make sure to define a problem matcher for watch tasks", VS Code couldn't use the matcher: check View → Output → **Tasks** for errors.
- If F5 starts the server but never opens the browser, VS Code didn't recognize that the build finished. Find the line `ng serve` prints when the build is done and add its text to `endsPattern` in `tasks.json`.
- **Blank home page, but search results work:** check the `homepage` block in `proxy/customization_config_override.mjs`. It points Primo at `assets/homepage/homepage_en.html`. If that file doesn't exist (the repo only has `homepage_en.html.tmpl`), the dev server returns an empty page and the home page renders blank. The block is commented out for now. Re-enable it once a real `homepage_en.html` exists.
- The NG0951 error in `search-bar-presenter.component.ts` that shows up in the console comes from Ex Libris's search bar code, not ours, and it's harmless. The file path looks like it's in this repo only because the debugger maps Primo's source maps onto our folder.
- Only one copy of the server can use port 4201. If a `serve:proxy` task is already running, VS Code reuses it instead of starting another.


---

### How to customize the Primo NDE user interface

There are basically four layers of customization here, from simplest to most involved.

#### Static assets (no code) — src/assets/

Drop replacement files in and they get picked up automatically:

   - images/library-logo.png, favicon.ico — branding
   - css/custom.css, js/custom.js — global CSS/JS overrides injected into the page
   - icons/custom_icons.svg — custom SVG icon set
   - homepage/homepage_en.html.tmpl + homepage.css.tmpl — per-language homepage HTML/CSS
   - header-footer/ — header/footer overrides (see its own README)

#### Custom Angular components — src/app/custom1-module/

For behavior/layout changes beyond CSS: scaffold a component (ng generate component X), then register it in customComponentMappings.ts (currently empty — selectorComponentMap) against the nde-* selector slots NDE exposes (e.g. nde-recommendations-before, nde-recommendations-top, etc.). Your component gets injected at that slot. Inside a component you can:

   - get the host component instance via `@Input() hostComponent`
   - read app state from the NGRX store (inject(Store) + selectors)
   - get the router via the `SHELL_ROUTER` injection token
   - translate code-table values with ngx-translate

#### Theming — src/app/styles/

Either pick one of the prebuilt Material themes via view config, or generate your own with `ng generate @angular/material:m3-theme` (answer "yes" to system-level variables) and uncomment the corresponding block in _customized-theme.scss.

#### Add-ons 

For reusable, independently-hosted functionality configured through Alma's Add-On Configuration (separate from a per-view customization package), using `MODULE_PARAMETERS` and `ASSET_BASE_URL` injection.