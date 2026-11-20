# Running from VS Code

The repo includes VS Code config in `.vscode/` that starts the dev server and opens the sandbox in a browser for you:

- [.vscode/tasks.json](../.vscode/tasks.json) defines a task named **serve:proxy**. It runs `npm run start:proxy`.
- [.vscode/launch.json](../.vscode/launch.json) defines a debug config named **NDE sandbox (Chrome)**. It runs the `serve:proxy` task first, waits for the build to finish, then opens Chrome at the sandbox URL with the VS Code debugger attached.

## Ways to use them

- **Server + browser + debugger:** press **F5**, or open the Run and Debug panel and pick **NDE sandbox (Chrome)**. Breakpoints you set in VS Code's `.ts` files will be hit in the browser. Stopping the debugger closes the browser, but the server keeps running in the terminal panel.
- **Server only:** Cmd+Shift+P → **Tasks: Run Task** → **serve:proxy**. Then open the URL in any browser yourself.
- **Quick preview inside VS Code:** with the server running, Cmd+Shift+P → **Simple Browser: Show**, then paste the URL. It has no dev tools, so it's only good for a quick look.
- **Stop the server:** Cmd+Shift+P → **Tasks: Terminate Task**.

## Notes

- To use Edge instead of Chrome, change `"type": "chrome"` to `"type": "msedge"` in `launch.json`.
- The task's `problemMatcher` builds on VS Code's built-in `$tsc-watch` matcher, which tells VS Code that the task is a watch task. Its `background` patterns tell VS Code when a build has started and finished.
- Only one copy of the server can use port 4201. If a `serve:proxy` task is already running, VS Code reuses it instead of starting another.
- The VS Code-launched Chrome pauses whenever the debugger hits a breakpoint. If **Caught Exceptions** is checked under Breakpoints in the Run and Debug panel, it also pauses on errors that Primo handles itself.

For problems such as F5 never opening the browser, see [Troubleshooting](troubleshooting.md#vs-code).
