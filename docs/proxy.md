# How the proxy server works

The proxy is a local Angular dev-server proxy used during development (`ng serve --proxy-config ./proxy/proxy.conf.mjs`). It's defined in [proxy/proxy.conf.mjs](../proxy/proxy.conf.mjs). It intercepts four kinds of requests and handles each differently.

In short, it lets you develop locally against a live Primo VE backend while testing your customization changes (assets, config) as if they were already deployed, without changing anything on the server.

## 1. Asset path aliasing

**Matches:** `/custom/*/assets/**` and `/nde/custom/*/assets/**`

Rewrites incoming asset URLs from their "published" form (for example `/nde/custom/MOCKINST-MOCKVID/assets/foo.png`) back to the local dev server's `/assets/foo.png`. This lets the dev server serve files from the local `src/assets/` folder while the app uses the same URL structure it would in production.

## 2. Customization config intercept

**Matches:** `/primaws/rest/pub/configuration/vid/`

When the Primo VE app fetches its configuration JSON from the real backend, this rule:

1. Forwards the request to the real server.
2. Intercepts the response before it reaches the browser.
3. Deep-merges the local overrides from [proxy/customization_config_override.mjs](../proxy/customization_config_override.mjs) into the real config's `customization` field.
4. Returns the merged result to the browser.

The effect: the app behaves as if the real Primo server already has your local customization deployed (logo, favicon, homepage HTML per language, custom SVG icons and so on), without deploying anything.

Every file the overrides point to must exist in `src/assets/`. If one is missing, that part of the page can break. The `homepage` override is commented out for this reason: see [Troubleshooting](troubleshooting.md#blank-home-page-but-search-results-work).

## 3. `/nde/custom/**` stripping

Strips the `/nde/custom/<vid>/` prefix and routes the request back to the local dev server. This is what makes the asset aliasing in rule 1 work end to end.

## 4. Catch-all passthrough

Everything else is forwarded as-is to `PROXY_TARGET`, the real Primo VE server.

## Choosing the backend

`PROXY_TARGET` is set in [proxy/proxy.const.mjs](../proxy/proxy.const.mjs). It points to the UA sandbox (`arizona-ua-psb`) by default. To test against production, change `environments['sandbox']` to `environments['production']`. The proxy reads its config only at startup, so restart the dev server after any change in `proxy/`.
