# Customizing the Primo NDE user interface

There are four layers of customization, from simplest to most involved.

## Static assets (no code): `src/assets/`

Drop replacement files in and they get picked up automatically:

- `images/library-logo.png`, `favicon.ico`: branding
- `css/custom.css`, `js/custom.js`: global CSS/JS overrides injected into the page
- `icons/custom_icons.svg`: custom SVG icon set
- `homepage/homepage_en.html.tmpl` + `homepage.css.tmpl`: per-language homepage HTML/CSS. These are templates. Rename to `.html` / `.css` before use, and re-enable the `homepage` block in the proxy overrides (see [Proxy server](proxy.md#2-customization-config-intercept)).
- `header-footer/`: header/footer overrides (see its own README)

## Custom Angular components: `src/app/custom1-module/`

For behavior or layout changes beyond CSS:

1. Scaffold a component: `ng generate component X`.
2. Register it in [customComponentMappings.ts](../src/app/custom1-module/customComponentMappings.ts) (`selectorComponentMap`) against one of the `nde-*` selector slots NDE exposes, such as `nde-recommendations-before` or `nde-recommendations-top`. Your component is injected at that slot.

**To find a selector to hook into, see [NDE component selectors](nde-selectors.md).** It explains the five slots (replace, `-before`, `-after`, `-top`, `-bottom`), gives a console snippet that outlines every NDE component on the page you're viewing, and lists every hookable selector found in the sandbox.

Inside a component you can:

- get the host component instance via `@Input() hostComponent`
- read app state from the NGRX store (`inject(Store)` + selectors)
- get the router via the `SHELL_ROUTER` injection token
- translate code-table values with ngx-translate

See the repo [README](../README.md#add-custom-components) for code examples.

## Theming: `src/app/styles/`

Either pick one of the prebuilt Material themes via view config, or generate your own with `ng generate @angular/material:m3-theme` (answer "yes" to system-level variables) and uncomment the corresponding block in `_customized-theme.scss`.

## Add-ons

For reusable, independently hosted functionality configured through Alma's Add-On Configuration (separate from a per-view customization package), using `MODULE_PARAMETERS` and `ASSET_BASE_URL` injection.
