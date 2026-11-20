# Troubleshooting

Problems we've run into with the local sandbox, and what fixed them.

## Page problems

### Blank home page, but search results work

Check the `homepage` block in [proxy/customization_config_override.mjs](../proxy/customization_config_override.mjs). It points Primo at `assets/homepage/homepage_en.html`. If that file doesn't exist (the repo only has `homepage_en.html.tmpl`), the dev server returns an empty page and the home page renders blank.

The block is commented out for now. Re-enable it once a real `homepage_en.html` exists.

### "Failed to load view configuration"

The dev server isn't running. The page shell was still in the browser, but its request for the view config had nowhere to go. A `[webpack-dev-server] Disconnected!` message in the console means the same thing.

Start the server again (`npm run start:proxy`, or **F5** in VS Code), wait for "Compiled successfully", then reload. If it keeps stopping, look at the end of its terminal output for a crash.

### Blank (white) page, other causes

The `<body>` stays hidden (`visibility: hidden`) until the app finishes starting, so a white page means startup failed or stalled. To narrow it down:

1. **Is the debugger paused?** If you launched Chrome with F5, look for a "Paused in debugger" banner or a highlighted line in VS Code. Press Continue.
2. **Is the server running?** See the section above.
3. **Compare URLs** in your normal Chrome:
   - The sandbox directly, without the proxy: `https://arizona-ua-psb.primo.exlibrisgroup.com/nde/home?vid=01UA_INST:ndeDev`. If this is broken too, the problem is on Ex Libris's side.
   - Through the proxy, without our module: `http://localhost:4201/nde/home?vid=01UA_INST:ndeDev`.
   - With our module: add `&useLocalCustomPackage=true`. If only this one fails, the problem is in our module.
4. **Read the Console** in DevTools (Cmd+Option+I) for the first red error, and check **Network** for failed requests.

### NG0951 error in `search-bar-presenter.component.ts`

This comes from Ex Libris's search bar code, not ours, and it's harmless. Primo logs it and keeps going. The file path looks like it's in this repo only because the debugger maps Primo's source maps onto our folder.

## VS Code

See [VS Code](vscode.md) for how the task and launch config work.

### "Make sure to define a problem matcher for watch tasks"

VS Code couldn't use the task's problem matcher. Check View → Output → **Tasks** for the error.

### F5 starts the server but never opens the browser

VS Code didn't recognize that the build finished. Find the line `ng serve` prints when the build is done and add its text to `endsPattern` in [.vscode/tasks.json](../.vscode/tasks.json).

### Task shows as running, but nothing is on port 4201

The server process exited, but VS Code keeps a background task's terminal open. Select the **serve:proxy** terminal and scroll to the error. Common causes:

- **`npm` or `node: command not found`:** VS Code's task shell can't find Node (common with nvm or Homebrew installs). Quit VS Code completely and reopen it from a terminal with `code .`.
- **Errors from `ng serve`:** check whether `npm run start:proxy` works in a normal terminal. If it fails there too, the problem is in the project, not VS Code.
