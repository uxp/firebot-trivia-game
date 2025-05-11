import {CustomScriptManifest, Firebot, RunRequest, ScriptModules} from "@crowbartools/firebot-custom-scripts-types";
import {TriviaGame} from "./trivia/game";
import globals from "./globals";

export interface ScriptParams extends Record<string, unknown> {}

export class TriviaScript implements Firebot.CustomScript<ScriptParams> {
    public getScriptManifest(): CustomScriptManifest {
        return {
            name: "Firebot Trivia Script",
            description: "Run a game of Trivia!",
            author: "cgjvdp",
            version: "0.1",
            firebotVersion: "5",
            startupOnly: true,
        };
    }

    public getDefaultParameters(){
        return {};
    }

    public run(runRequest: RunRequest<ScriptParams>): void {
        const { logger, twitchApi, twitchChat, gameManager } = runRequest.modules
        logger.info('Registering Trivia Game...');

        // register this as a global. Not sure of a better way beside passing it into every constructor.
        globals.modules = runRequest.modules
        const game = new TriviaGame();
        gameManager.registerGame(game.getFirebotGame());
    }
}

// Seems this needs to be an instance/singleton, or a TS module.
export default new TriviaScript();