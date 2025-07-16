Build
Install and build all of the dependencies using npm:

cd vscode
npm install
Then you have two options:

If you want to build from inside VS Code, you can open the vscode folder and start the build task with Ctrl+Shift+B (CMD+Shift+B on macOS). The build task will stay running in the background even if you close VS Code. If you happen to close VS Code and open it again, just resume the build by pressing Ctrl+Shift+B (CMD+Shift+B) again. You can kill it by running the Kill Build VS Code task or pressing Ctrl+D in the task terminal.
If you want to build from a terminal, run npm run watch. This will run both the core watch task and watch-extension tasks in a single terminal.
The incremental builder will do an initial full build and will display a message that includes the phrase "Finished compilation" once the initial build is complete. The builder will watch for file changes and compile those changes incrementally, giving you a fast, iterative coding experience.

Troubleshooting:

Windows: If you have installed Visual Studio 2017 as your build tool, you need to open x64 Native Tools Command Prompt for VS 2017. Do not confuse it with VS2015 x64 Native Tools Command Prompt, if installed.
Linux: You may hit a ENOSPC error when running the build. To get around this follow instructions in the Common Questions.
If the build step fails, or if the built version fails to run (see next section), run git clean -xfd in your vscode folder, then re-run npm install.

Errors and Warnings
Errors and warnings will show in the console while developing VS Code. If you use VS Code to develop VS Code, errors and warnings are shown in the status bar at the bottom left of the editor. You can view the error list using View | Errors and Warnings or pressing Ctrl+P and then ! (CMD+P and ! on macOS).

Tip

You don't need to stop and restart the development version of VS Code after each change. You can just execute Reload Window from the command palette. We like to assign the keyboard shortcut Ctrl+R (CMD+R on macOS) to this command.

Run
To test the changes, you launch a development version of VS Code on the workspace vscode, which you are currently editing.

To test changes with a remote, use the "TestResolver" in your Code - OSS window which creates a fake remote window. Search Command Palette for TestResolver. More information is at https://github.com/microsoft/vscode/issues/162874#issuecomment-1271774905.

Desktop
Running on Electron with extensions run in NodeJS:

macOS and Linux
`./scripts/code.sh`
./scripts/code-cli.sh # for running CLI commands (eg --version)
Windows
.\scripts\code.bat
.\scripts\code-cli.bat
Tip

If you receive an error stating that the app is not a valid Electron app, it probably means you didn't run `npm run watch` first.

VS Code for the Web
Extensions and UI run in the browser.

Tip

Besides npm run watch also run npm run watch-web to build the web bits for the built-in extensions.

macOS and Linux
./scripts/code-web.sh
Windows
.\scripts\code-web.bat
Code Server Web
UI in the browser, extensions run in code server (NodeJS):

macOS and Linux
./scripts/code-server.sh --launch
Windows
.\scripts\code-server.bat --launch
You can identify the development version of VS Code ("Code - OSS") by the following icon in the Dock or Taskbar:

VS Code default icon

Debugging
VS Code has a multi-process architecture and your code is executed in different processes.

The render process runs the UI code inside the Shell window. To debug code running in the render you can either use VS Code or the Chrome Developer Tools.

Using VS Code
Open the vscode repository folder
Choose the VS Code launch configuration from the launch dropdown in the Debug viewlet and press F5.
