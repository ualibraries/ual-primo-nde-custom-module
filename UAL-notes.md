# UAL development notes

University of Arizona Libraries notes for developing our Primo NDE custom module. The notes live in [docs/](docs/). The repo [README](README.md) is Ex Libris's general documentation for the custom module.

## Quick start

``` bash
npm install
npm run start:proxy
```

Then open **http://localhost:4201/nde/home?vid=01UA_INST:ndeDev&useLocalCustomPackage=true**, or press **F5** in VS Code to do both.

## Docs

| Doc | What's in it |
|---|---|
| [Setup and running the dev server](docs/setup.md) | Checking Node/npm/Angular versions, installing, starting the server, sandbox URLs |
| [Running from VS Code](docs/vscode.md) | The `serve:proxy` task and the F5 launch config that opens Chrome with the debugger |
| [How the proxy server works](docs/proxy.md) | The four proxy rules, config overrides, switching between sandbox and production |
| [Customizing the Primo NDE UI](docs/customization.md) | The four layers: static assets, custom Angular components, theming, add-ons |
| [NDE component selectors](docs/nde-selectors.md) | Every `nde-*` selector you can hook a component into, how the slots work, finding selectors on a page |
| [Troubleshooting](docs/troubleshooting.md) | Blank pages, "Failed to load view configuration", NG0951, VS Code task problems |

## Tools

- [docs/extract-nde-selectors.py](docs/extract-nde-selectors.py): regenerates the selector list from a Primo server after a release.
