import {
    SystemCommand,
    SystemCommandTriggerEvent,
} from '@crowbartools/firebot-custom-scripts-types/types/modules/command-manager';
import triviaRunner from "./runner";
import globals from '../globals';


export class TriviaCommand {
    private TRIVIA_COMMAND_ID = "cgjvdp:fbtrivia";

    public getTriviaCommand() {
        const triviaCommand: SystemCommand = {
            definition: {
                id: this.TRIVIA_COMMAND_ID,
                name: "Custom Trivia",
                active: true,
                trigger: "!trivia",
                description: "Triggers a new game of Trivia",
                autoDeleteTrigger: false,
                scanWholeMessage: false,
                baseCommandDescription: "Start the trivia game with a default score modifier, if one is set.",
                subCommands: [
                    {
                        id: "scoreModifier",
                        name: "Score Modifier",
                        active: true,
                        trigger: null,
                        arg: "\\d+",
                        regex: true,
                        usage: "[modifier]",
                        description: "Starts the trivia game with the given score bonus.",
                    }
                ]
            },
            onTriggerEvent: this.onTriggerEvent,
        };
        return triviaCommand;
    }

    private async onTriggerEvent(event: SystemCommandTriggerEvent): Promise<any> {
        const { logger, gameManager, twitchApi, currencyDb, twitchChat } = globals.modules;
        logger.info("Trivia Triggered.")
        const { userCommand } = event;

        const username = userCommand.commandSender;
        const user = await twitchApi.users.getUserByName(username);
        if (user === null) {
            logger.warn(`Could not process trivia command for ${username}. User does not exist.`);
            return;
        }

        // TODO: ensure streamer is the only user

        const triviaSettings = gameManager.getGameSettings(this.TRIVIA_COMMAND_ID);
        const chatter = triviaSettings.settings.gameSettings.chatter;

        const currencyId = triviaSettings.settings.currencySettings.currencyId;
        const currency = currencyDb.getCurrencyById(currencyId);

        // make sure currency exists.
        if (currency == null) {
            logger.error(`Unable to start Trivia. '${currencyId}' does not exist.`)

            if (triviaSettings.settings.generalMessages.currencyNotFound) {
                const currencyNotFound = triviaSettings.settings.generalMessages.currencyNotFound
                    .replace('{currency}', currencyId);
                await twitchChat.sendChatMessage(currencyNotFound, null, chatter);
            }

            return;
        }

        // see if the trivia game is on cooldown or still running.
        if (triviaRunner.triviaEntriesAccepted || !triviaRunner.payoutGiven) {
            logger.error(`Unable to start Trivia. 'entriesAccepted=${triviaRunner.triviaEntriesAccepted}' or 'payoutGiven=${triviaRunner.payoutGiven}`);

            if (triviaSettings.settings.generalMessages.gameStillRunning) {
                const gameStillRunning = triviaSettings.settings.generalMessages.gameStillRunning
                    .replace('{accepting}', triviaRunner.triviaEntriesAccepted)
                    .replace('{payout}', triviaRunner.payoutGiven);
                await twitchChat.sendChatMessage(gameStillRunning, null, chatter);
            }

            return;
        }

        // TODO: calculate multiplier
        let roundMultiplier: number;
        if (event.userCommand.args.length < 1) {
            const defaultMultiplier = triviaSettings.settings.gameSettings.defaultMultiplier;
            if (defaultMultiplier == null || defaultMultiplier <= 0) {
                logger.error(`Default multiplier is less than zero. This is probably not intended.`)
                if (triviaSettings.settings.generalMessages.noDefaultMultiplier) {
                    const noDefaultMultiplier = triviaSettings.settings.generalMessages.noDefaultMultiplier
                        .replace('{multiplier}', defaultMultiplier);
                    await twitchChat.sendChatMessage(noDefaultMultiplier, null, chatter);
                }
                return;
            }
            roundMultiplier = parseFloat(parseFloat(defaultMultiplier).toPrecision(1));
        } else if (event.userCommand.subcommandId === "scoreModifier") {
            const customMultiplier = userCommand.args[0];
            roundMultiplier = parseFloat(parseFloat(customMultiplier).toPrecision(1));
        } else {
            logger.error(`Multiplier was not able to be parsed. This is probably not intended.`)
            if (triviaSettings.settings.entryMessages.invalidMultiplier) {
                const invalidMultiplierMsg = triviaSettings.settings.entryMessages.invalidMultiplier;

                await twitchChat.sendChatMessage(invalidMultiplierMsg, null, chatter);
            }
        }

        // Ensure game is not running again, and potentially start new game if we're good.
        if (!triviaRunner.triviaEntriesAccepted && !triviaRunner.payoutGiven) {
            // get entry run time
            const startDelaySeconds = triviaSettings.settings.gameSettings.answerPeriod || 60;
            // and start the game.
            await triviaRunner.triggerTriviaOpen(startDelaySeconds);
            if (triviaSettings.settings.gameMessages.roundStart) {
                const roundStartMessage = triviaSettings.settings.gameMessages.roundStart
                    .replace('{timespan}', startDelaySeconds)
                    .replace('{options}', null)
                    .replace('{multiplier}', roundMultiplier);
                await twitchChat.sendChatMessage(roundStartMessage, null, chatter);
            } else {
                logger.warn(`Unable to print roundStartMessage. Seems sus. Game started without notifying chat.`);
            }
        }
    }
}

export class TriviaEntryCommand {
    private TRIVIA_ENTRY_COMMAND_ID = "cgjvdp:fbtrivia:entry";

    private async onTriggerEvent(event: SystemCommandTriggerEvent): Promise<any> {
        const { logger, gameManager, twitchApi, currencyDb, twitchChat } = globals.modules;
        logger.info("Trivia Entry Triggered.")
        const { userCommand } = event;

        const username = userCommand.commandSender;
        const user = await twitchApi.users.getUserByName(username);
        if (user === null) {
            logger.warn(`Could not process trivia command for ${username}. User does not exist.`);
            return;
        }

        const triviaSettings = gameManager.getGameSettings(this.TRIVIA_ENTRY_COMMAND_ID);
        const chatter = triviaSettings.settings.gameSettings.chatter;

        // See if the user has already submitted
        if (triviaRunner.triviaEntriesAccepted && triviaRunner.userHasEntered(username)) {
            logger.error(`Unable to add user to Trivia game. ${username} has already joined`)

            if (triviaSettings.settings.generalMessages.userAlreadyEntered) {
                const userAlreadyEntered = triviaSettings.settings.generalMessages.userAlreadyEntered
                    .replace('{user}', username);
                await twitchChat.sendChatMessage(userAlreadyEntered, null, chatter);
            }

            return;
        }
    }
}


export default TriviaCommand;