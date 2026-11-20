# Setup and running the dev server

How to check your machine, install dependencies and run the local sandbox.

## Check your dev environment

Most dev machines will have some version of Node and npm installed already. To avoid getting tripped up by this environment, check your versions first:

``` bash
node --version 2>/dev/null; npm --version 2>/dev/null; ng version 2>/dev/null | head -5
```

The output should look something like this:

``` bash
v25.9.0 (node/npm)
11.12.1 (angular)
```

If your versions are fairly recent, you're set. If not, download the Node.js installer from nodejs.org, run it and follow the prompts. npm is included with Node.js. On Windows, you can also use nvm-windows to manage multiple Node.js versions.

## Start the dev server

To install dependencies and start the environment:

``` bash
npm install
npm run start:proxy
```

`npm run start:proxy` runs the same command as this:

``` bash
ng serve --proxy-config ./proxy/proxy.conf.mjs
```

Then open the sandbox through the local proxy:

**http://localhost:4201/nde/home?vid=01UA_INST:ndeDev&useLocalCustomPackage=true**

- `useLocalCustomPackage=true` loads your local custom module. Leave it off to see the sandbox without your changes.
- To view search results: `http://localhost:4201/nde/search?query=test&vid=01UA_INST:ndeDev&useLocalCustomPackage=true`

To start the server and open the browser from VS Code instead, see [VS Code](vscode.md). For how the proxy works, see [Proxy server](proxy.md). If the page is blank or broken, see [Troubleshooting](troubleshooting.md).
