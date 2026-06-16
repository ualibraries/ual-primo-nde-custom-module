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