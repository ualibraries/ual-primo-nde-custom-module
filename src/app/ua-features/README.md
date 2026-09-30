# `ua-features/` — UA Libraries customizations

Each feature added to the NDE customization lives in its own folder
here. Adapted from Loyola's
[`luc-features/`](https://github.com/luc-libraries/ExLibris-customModule/tree/main/src/app/luc-features)
convention: features stay self-contained and structurally ready to be
lifted into a standalone NDE add-on later.

## Layout

```
ua-features/
├── _shared/
│   └── primo-query.ts             # Parses Primo's ?query=… URL param
├── chat/                          # Slide-out "Ask Us" chat drawer
├── try-my-search/                 # "Try My Search In…" external links
└── README.md (this file)
```

Each feature folder holds `<name>.component.ts` (config + helpers +
component in one file), `.html`, and `.scss`.

**Global styles and brand tokens** (`--ua-red`, `--ua-blue`, …, the
`--chat-*` geometry, `.sr-only`) live in `src/assets/css/custom.css`.
Components reference them with `var(--token, fallback)` so they still
render without it.

**Images** (e.g. third-party logos) go in `src/assets/images/` and are
referenced as `assets/images/...`, resolved at runtime through
`AssetBaseService`.

## Features

| Feature | Slot | Setup |
| --- | --- | --- |
| Try My Search In… | `nde-search-results-after` | Works as-is. Toggle targets in `CONFIG.enabled`. |
| Chat drawer | `nde-user-area-after` | Hidden until `CONFIG.chatUrl` is set. Then uncomment the `.side-bottom-buttons` rule in `custom.css`. |

## Code style

- Standalone Angular components, contemporary TypeScript.
- Function declarations for named definitions; arrow functions for
  callbacks and one-liners.
- Template literals for string composition.
- Comments only where the *why* isn't obvious.
- Named exports only.

## Configuration

Each feature keeps institution-specific values (URLs, IDs) in a `CONFIG`
block at the top of its component file. That block is the seam that
gets replaced by `MODULE_PARAMETERS` injection when extracting the
feature to an add-on.

## Registering a feature

Add one line to `src/app/custom1-module/customComponentMappings.ts`:

```ts
['<slot-selector>', MyFeatureComponent],
```

Slot selectors follow `nde-{component}-{position}`, where position is
`before`, `after`, `top`, `bottom`, or empty (replace). To confirm a
slot exists, run `npm run start:proxy` and inspect the DOM for the
empty `<nde-…>` placeholder element.
