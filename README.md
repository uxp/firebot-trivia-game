# Firebot Trivia Game


## Usage

### Install
1. Download the latest release from GitHub [here](https://github.com/uxp/firebot-trivia-game/releases)
2. Install to your local Firebot installation:
   1. Windows: `%APPDATA%\Firebot\v5\profiles\{yourProfile}\scripts`
   2. Mac: `~/Library/Application Support/Firebot/v5/profiles/{yourProfile}/scripts`
   3. Linux: `~/.config/Firebot/v5/profiles/{yourProfile}/scripts`
3. In Firebot, configure `triviaGame.js` as a Startup Script.
4. Enable the new Game under `Games` in Firebot.
   1. Ensure the `currency` is set correctly.
   2. `Game Settings` allows you to change the default behavior.
   3. `Message Formatting` allows you to configure the default messages.
   4. `Chat Settings` allows you to configure the messaging to come from your Bot account, or Main account.
   5. Finally, `General Messages` are largely error messages if the script fails to run or work correctly. These may be removed in the future. If you don't want it to be very verbose, simply erase these messages, and it won't print anything.


## Development

### Setup
1. `npm install`

### Building
Dev:
1. `npm run build:dev`
- Automatically copies the compiled .js to Firebot's scripts folder.

Release:
1. `npm run build`
- Copy .js from `/dist`

### Note
- Keep the script definition object (that contains the `run`, `getScriptManifest`, and `getDefaultParameters` funcs) in the `main.ts` file as it's important those function names don't get minimized.
- Edit the `"scriptOutputName"` property in `package.json` to change the filename of the compiled script.