import {
    SystemCommand,
    SystemCommandTriggerEvent,
} from '@crowbartools/firebot-custom-scripts-types/types/modules/command-manager';
import triviaRunner from "./runner";
import globals from '../globals';


export class TriviaCommand {
    private readonly _id: string;
    private readonly answersPerQuestion: number;

    constructor(cmdId: string, answersPerQuestion: number = 4) {
        this._id = cmdId;
        this.answersPerQuestion = answersPerQuestion;
    }

    public getTriviaCommand() {
        const commandRange: number[] = Array.from({length: this.answersPerQuestion}, (_, i) => i);

        const triviaCommand: SystemCommand = {
            definition: {
                id: this._id,
                name: "Trivia Admin Command",
                active: true,
                trigger: "!trivia",
                description: "Manages the custom Trivia games.",
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
                        restrictionData: {
                            mode: "any",
                            sendFailMessage: true,
                            failMessage: "Unable to execute command.",
                            restrictions: [
                                {
                                    id: 'sys-cmd-mods-only-perms',
                                    type: 'firebot:permissions',
                                    mode: "roles",
                                    roleIds: [
                                        "broadcaster"
                                    ]
                                },
                            ]
                        },
                        usage: "[modifier]",
                        description: "Starts the trivia game with the given score bonus.",
                    },
                    {
                        id: "answer",
                        name: "Trivia Answer",
                        active: true,
                        trigger: null,
                        arg: '[' + commandRange.map((el, idx, arr) => `${String.fromCharCode(idx + 65)}|${String.fromCharCode(idx + 97)}`).join('|') + ']',
                        regex: true,
                        restrictionData: {
                            mode: "any",
                            sendFailMessage: true,
                            failMessage: "Unable to execute command.",
                            restrictions: [
                                {
                                    id: 'sys-cmd-mods-only-perms',
                                    type: 'firebot:permissions',
                                    mode: "roles",
                                    roleIds: [
                                        "broadcaster"
                                    ]
                                },
                            ]
                        },
                        hidden: true,
                        usage: `[answer] (${commandRange.map((el, idx, arr) => String.fromCharCode(idx + 65)).join(',')})`,
                        description: "Confirms the trivia Answer and awards winners.",
                    }
                ]
            },
            onTriggerEvent: this.onTriggerTriviaEvent,
        };

        return triviaCommand;
    }

    public getEntryCommands(): SystemCommand {
        const debug: boolean = true;
        return {
            definition: {
                id: `${this._id}-entry`,
                name: `Trivia Entry Command`,
                description: `Trivia Entry Command`,
                active: debug,
                hidden: !debug,
                triggerIsRegex: true,
                trigger: `^[A-Za-z]$`,
                /*
                subCommands: commandRange.map((val, idx, arr): SubCommand => {
                    const upperChar = String.fromCharCode(idx + 65);
                    const lowerChar = String.fromCharCode(idx + 97);

                    return {
                        id: `user-guess-${upperChar}`,
                        name: `User Guess ${upperChar}`,
                        active: true,
                        hidden: true,
                        trigger: null,
                        arg: `^[${upperChar}|${lowerChar}]$`,
                        regex: true,
                        usage: `${upperChar} or ${lowerChar}`,
                        description: `Enters the user into the trivia contest with ${upperChar} as a guess.`,
                    };
                }),
                */
            },
            onTriggerEvent: this.onTriggerAnswerEvent
        };
    }

    private async onTriggerTriviaEvent(event: SystemCommandTriggerEvent): Promise<any> {
        // using the globals hack because `this` is not the class instance and
        // things get wonky if we rebind it.
        const {logger, gameManager, twitchApi, currencyDb, twitchChat} = globals.modules;
        logger.info("TRIVIA: Processing Trivia Admin Command.")

        const username = event.userCommand.commandSender;
        const user = await twitchApi.users.getUserByName(username);
        if (user === null) {
            logger.warn(`TRIVIA: Could not process trivia command for ${username}. User does not exist.`);
            return Promise.reject(`Could not process trivia command for ${username}. User does not exist.`);
        }

        const triviaSettings = gameManager.getGameSettings("cgjvdp-fbtrivia");
        if (!triviaSettings) {
            logger.warn("TRIVIA: Trivia Settings not found", triviaSettings)
            return Promise.reject("Trivia Settings not found");
        }
        const chatter = triviaSettings.settings.chatSettings.chatter;

        // TODO: check if this is a user or the streamer.
        if (event.userCommand.senderRoles.includes('broadcaster')) {
            logger.info("TRIVIA: Executing Streamer command");

            const currencyId = triviaSettings.settings.currencySettings.currencyId;
            const currency = currencyDb.getCurrencyById(currencyId);

            // make sure currency exists.
            if (currency == null) {
                logger.error(`TRIVIA: Unable to start Trivia. '${currencyId}' does not exist.`)

                if (triviaSettings.settings.generalMessages.currencyNotFound) {
                    const currencyNotFound = triviaSettings.settings.generalMessages.currencyNotFound
                        .replace('{currency}', currencyId);
                    await twitchChat.sendChatMessage(currencyNotFound, null, chatter);
                }

                return Promise.reject("Currency Not Found");
            }

            // TODO: process completion of the trivia question. Award points and reset runner
            if (event.userCommand.subcommandId === "answer") {
                logger.info("TRIVIA: Executing Answer Result Subcommand");
                // see if the trivia game is on cooldown or still running.
                if (triviaRunner.triviaEntriesAccepted) {
                    logger.error(`TRIVIA: Cannot end trivia round. Still accepting entries. 'entriesAccepted=${triviaRunner.triviaEntriesAccepted}'`);
                    return Promise.reject("Entries still being accepted.");
                }
                // see if the trivia game has pending payout
                if (triviaRunner.payoutGiven) {
                    logger.error(`TRIVIA: Payout has already been given. 'payoutGiven=${triviaRunner.payoutGiven}`);
                    return Promise.reject("No pending payout. Cannot award points.")
                }
                // See if we're no longer accepting entries and payout needs to be awarded.
                if (!triviaRunner.triviaEntriesAccepted && !triviaRunner.payoutGiven) {
                    logger.error("TRIVIA: TODO: award payout")

                    // TODO: award payout
                    // TODO: parse correct result
                    // TODO: await triviaRunner.awardWinners(correctAnswer);
                    // TODO: print winners message.
                    return Promise.resolve();
                }

                return Promise.reject("No Result");
            }


            // Process starting a new game. Subcommand can be undefined or include score modifier
            if (event.userCommand.subcommandId === "scoreModifier" || event.userCommand.subcommandId === undefined) {
                // see if the trivia game is on cooldown or still running.
                if (triviaRunner.triviaEntriesAccepted || !triviaRunner.payoutGiven) {
                    logger.error(`TRIVIA: Unable to start Trivia. 'entriesAccepted=${triviaRunner.triviaEntriesAccepted}' or 'payoutGiven=${triviaRunner.payoutGiven}`);

                    if (triviaSettings.settings.generalMessages.gameStillRunning) {
                        const gameStillRunning = triviaSettings.settings.generalMessages.gameStillRunning
                            .replace('{accepting}', triviaRunner.triviaEntriesAccepted)
                            .replace('{payout}', triviaRunner.payoutGiven);
                        await twitchChat.sendChatMessage(gameStillRunning, null, chatter);
                    }

                    return Promise.reject("Unable to start.");
                }

                // calculate multiplier
                let roundMultiplier: number;
                if (event.userCommand.args.length < 1) {
                    const defaultMultiplier = triviaSettings.settings.gameSettings.defaultMultiplier;
                    if (defaultMultiplier == null || defaultMultiplier <= 0) {
                        logger.error(`TRIVIA: Default multiplier is less than zero. This is probably not intended.`)
                        if (triviaSettings.settings.generalMessages.noDefaultMultiplier) {
                            const noDefaultMultiplier = triviaSettings.settings.generalMessages.noDefaultMultiplier
                                .replace('{multiplier}', defaultMultiplier);
                            await twitchChat.sendChatMessage(noDefaultMultiplier, null, chatter);
                        }
                        return Promise.reject("Multiplier less than zero");
                    }
                    roundMultiplier = parseFloat(parseFloat(defaultMultiplier).toPrecision(2));
                } else {
                    if (event.userCommand.args.length === 1) {
                        try {
                            const customMultiplier = event.userCommand.args[0];
                            roundMultiplier = parseFloat(parseFloat(customMultiplier).toPrecision(2));
                            if (isNaN(roundMultiplier)) {
                                throw "Error";
                            }
                        } catch {
                            logger.error(`TRIVIA: Multiplier was not able to be parsed. This is probably not intended.`)
                            if (triviaSettings.settings.entryMessages.invalidMultiplier) {
                                const invalidMultiplierMsg = triviaSettings.settings.entryMessages.invalidMultiplier;
                                await twitchChat.sendChatMessage(invalidMultiplierMsg, null, chatter);
                            }
                            return Promise.reject();
                        }
                    } else {
                        logger.error(`TRIVIA: Multiplier was not able to be parsed. This is probably not intended.`)
                        if (triviaSettings.settings.entryMessages.invalidMultiplier) {
                            const invalidMultiplierMsg = triviaSettings.settings.entryMessages.invalidMultiplier;

                            await twitchChat.sendChatMessage(invalidMultiplierMsg, null, chatter);
                        }
                        return Promise.reject("Unparsed multiplier");
                    }
                }
                logger.info(`TRIVIA: Parsed multiplier as ${roundMultiplier}`)

                // Ensure game is not running again, and potentially start new game if we're good.
                if (!triviaRunner.triviaEntriesAccepted && triviaRunner.payoutGiven) {
                    // TODO: activate entry commands?
                    // get entry run time
                    const startDelaySeconds = triviaSettings.settings.gameSettings.answerPeriod || 60;
                    // and start the game.
                    await triviaRunner.triggerTriviaOpen(startDelaySeconds, roundMultiplier);
                    if (triviaSettings.settings.gameMessages.roundStart) {
                        const roundStartMessage = triviaSettings.settings.gameMessages.roundStart
                            .replace('{timespan}', startDelaySeconds)
                            .replace('{options}', triviaSettings.settings.gameMessages.choices)
                            .replace('{multiplier}', roundMultiplier);
                        await twitchChat.sendChatMessage(roundStartMessage, null, chatter);
                    } else {
                        logger.warn(`TRIVIA: Unable to print roundStartMessage. Seems sus. Game started without notifying chat.`);
                    }
                }

            }

        } else {
            logger.error(`TRIVIA: User is not broadcaster. Setup permissions to prevent this from happening.`)
            if (triviaSettings.settings.generalMessages.userIsNotBroadcaster) {
                const userIsNotBroadcaster = triviaSettings.settings.generalMessages.invalidMultiplier;

                await twitchChat.sendChatMessage(userIsNotBroadcaster, null, chatter);
            }
            return Promise.reject("Command invoked by non-broadcaster.");
        }
    }

    private async onTriggerAnswerEvent(event: SystemCommandTriggerEvent): Promise<any> {
        const {logger, gameManager, twitchApi, twitchChat} = globals.modules;
        logger.info("event: ", event);

        if (!triviaRunner.triviaEntriesAccepted) {
            logger.debug("TRIVIA: There is not a running trivia game. Bailing early");
            return Promise.resolve();
        }
        logger.info("Processing User Entry Command.")

        const username = event.userCommand.commandSender;
        const user = await twitchApi.users.getUserByName(username);
        if (user === null) {
            logger.warn(`TRIVIA: Could not process trivia command for ${username}. User does not exist.`);
            return;
        }

        const triviaSettings = gameManager.getGameSettings("cgjvdp-fbtrivia");
        if (!triviaSettings) {
            logger.warn("TRIVIA: Trivia Settings not found", triviaSettings)
        }
        const chatter = triviaSettings.settings.chatSettings.chatter;

        if (!event.userCommand.senderRoles.includes('broadcaster')) {
            logger.info(`TRIVIA: Processing entry for ${username}.`);
            if (triviaRunner.triviaEntriesAccepted) {
                // See if the user has already submitted
                if (!triviaRunner.userHasEntered(username)) {
                    logger.info(`TRIVIA: Adding user '${username}' to trivia game.`);
                    // TODO: parse user guess
                    // TODO: add user
                    await triviaRunner.addUserGuess(username, user.displayName, 'A');

                } else {
                    logger.error(`TRIVIA: Unable to add user to Trivia game. ${username} has already joined`)

                    if (triviaSettings.settings.generalMessages.userAlreadyEntered) {
                        const userAlreadyEntered = triviaSettings.settings.generalMessages.userAlreadyEntered
                            .replace('{user}', username);
                        await twitchChat.sendChatMessage(userAlreadyEntered, null, chatter);
                    }

                    return Promise.reject("User already entered.");
                }
            }
        }
    }
}

