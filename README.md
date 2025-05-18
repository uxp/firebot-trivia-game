# Firebot Trivia Game


## What?

Firebot Trivia is a custom startup script created to be used in Firebot. [Firebot][firebot] is a Twitch bot created
by Team Crowbar. This script is not made for use outside Firebot, including other bots or independently. It is heavily
inspired by the [Heist][heist] game that is included in Firebot itself.

[firebot]: https://github.com/crowbartools/firebot
[heist]: https://github.com/crowbartools/Firebot/tree/cff99715692feac80f9bfbb5cdd8b816a92fa371/src/backend/games/builtin/heist

### Usage

#### Download

Download the latest release from GitHub [here][latest-release]

[latest-release]: https://github.com/uxp/firebot-trivia-game/releases/latest

#### Install 

Install to your local Firebot installation:
1. Windows: `%APPDATA%\Firebot\v5\profiles\{yourProfile}\scripts`
2. Mac: `~/Library/Application Support/Firebot/v5/profiles/{yourProfile}/scripts`
3. Linux: `~/.config/Firebot/v5/profiles/{yourProfile}/scripts`

#### Configure
In Firebot, configure `triviaGame.js` as a Startup Script.

Enable the new Game under `Games` in Firebot:
* Ensure the `currency` is set correctly.*`Game Settings` allows you to change the default behavior.
* `Message Formatting` allows you to configure the default messages.
* `Chat Settings` allows you to configure the messaging to come from your Bot account, or Main account.
* Finally, `General Messages` are largely error messages if the script fails to run or work correctly. These may be 
removed in the future. If you don't want it to be very verbose, simply erase these messages, and it won't print anything.


## Development

#### Setup
1. `npm install`

#### Building
Dev:
1. `npm run build:dev`
- Automatically copies the compiled .js to Firebot's scripts folder.

Release:
1. `npm run build`
- Copy .js from `/dist`

#### Note
- Keep the script definition object (that contains the `run`, `getScriptManifest`, and `getDefaultParameters` funcs) in the `main.ts` file as it's important those function names don't get minimized.
- Edit the `"scriptOutputName"` property in `package.json` to change the filename of the compiled script.