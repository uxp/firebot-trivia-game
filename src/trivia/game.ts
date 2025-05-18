import { FirebotGame } from '@crowbartools/firebot-custom-scripts-types/types/modules/game-manager';
import { TriviaCommand } from "./command";
import globals from '../globals';


export class TriviaGame {
    private readonly _ID: string = "cgjvdp-fbtrivia";
    private triviaCommandHandler: TriviaCommand;

    public getFirebotGame(): FirebotGame {
        return {
            id: this._ID,
            name: "Firebot Trivia",
            subtitle: "Chat based interactive trivia",
            description: "A Trivia game rewards system. When the streamer triggers the command, users may enter their answer to the question by typing A, B, C, or D in chat. The sooner they answer correctly, they win a larger payout.",
            icon: "fa-question-circle",
            settingCategories: {
                currencySettings: {
                    title: 'Currency Settings',
                    description: 'Currency settings for Trivia games.',
                    sortRank: 1,
                    settings: {
                        currencyId: {
                            type: 'currency-select',
                            title: 'Currency',
                            description: 'Which Firebot Currency to use for this game.',
                            tip: 'Select the currency players will use throughout the game.',
                            default: '',
                            sortRank: 1,
                            showBottomHr: false,
                            validation: {
                                required: true
                            }
                        }
                    }
                },
                gameSettings: {
                    title: 'Game Settings',
                    description: 'Settings for each game/question.',
                    sortRank: 2,
                    settings: {
                        baseMinScorePerQuestion: {
                            type: 'number',
                            title: 'Base Minimum score per question',
                            description: 'Minimum score awarded per question before any modifiers.',
                            tip: 'This is before any bonus modifiers are added!',
                            default: 50,
                            sortRank: 1,
                            showBottomHr: false,
                            validation: {
                                required: true,
                                min: 1,
                            }

                        },
                        baseMaxScorePerQuestion: {
                            type: 'number',
                            title: 'Base Max score per question',
                            description: 'Maximum score awarded per question before any modifiers.',
                            tip: 'This is before any bonus modifiers are added!',
                            default: 100,
                            sortRank: 2,
                            showBottomHr: false,
                            validation: {
                                required: true,
                                min: 1,
                            }
                        },
                        defaultMultiplier: {
                            type: 'number',
                            title: 'Default Multiplier',
                            description: 'Multiply the user score by this number.',
                            tip: '',
                            default: 1,
                            sortRank: 3,
                            showBottomHr: false,
                            validation: {
                                required: true,
                                min: 0.1,
                                max: 10.0,
                            }
                        },
                        answerPeriod: {
                            type: 'number',
                            title: 'Entry period',
                            description: 'Number of seconds the user has to enter their answer.',
                            tip: '',
                            default: 60,
                            sortRank: 4,
                            showBottomHr: false,
                            validation: {
                                required: true,
                                min: 20,
                                max: 600,
                            }
                        },
                    }
                },
                gameMessages: {
                    title: 'Message Formatting',
                    description: "",
                    sortRank: 3,
                    settings: {
                        roundStart: {
                            type: "string",
                            title: "When a round is started.",
                            description: "Sent once a round has started and entries are being accepted. (Leave empty for no message)",
                            //  @ts-ignore
                            useTextArea: true,
                            default: "Trivia has started! You have {timespan} seconds to answer. Type A, B, C, or D into chat to enter. This round's multiplier is {multiplier}.",
                            tip: "Available variables are: {timespan}, {options}, {multiplier}.",
                            sortRank: 1
                        },
                        roundClose: {
                            type: "string",
                            title: "When a round's entry period has ended.",
                            description: "Sent after the round's entry period has elapsed and we no longer accept new answers. (Leave empty for no message)",
                            //  @ts-ignore
                            useTextArea: true,
                            default: "Trivia has ended.",
                            tip: "",
                            sortRank: 2
                        },
                        onJoin: {
                            type: "string",
                            title: "On Join",
                            description: "Sent when a user enters the game (leave empty for no message).",
                            //  @ts-ignore
                            useTextArea: true,
                            default: "{user} guesses {choice} for {score}!",
                            tip: "Available variables: {user}, {choice}, {score}.",
                        },
                        roundEnd: {
                            type: "string",
                            title: "When a round ends.",
                            description: "Sent once a round has ended. Lists those who won and their winnings. (Leave empty for no message)",
                            //  @ts-ignore
                            useTextArea: true,
                            default: "The winners are: {winners}",
                            tip: "Available variables are: {winners}.",
                        },
                        noWinners: {
                            type: "string",
                            title: "If there are no winners.",
                            description: "Printed if there are no winners of the round. (Leave empty for no message)",
                            //  @ts-ignore
                            useTextArea: true,
                            default: 'No one guessed correctly!',
                            tip: "",
                        },
                        winnersFormat: {
                            type: "string",
                            title: "Format String for Winners.",
                            description: "A format string for each winner and their winnings. Mapped back into the RoundEnd message. (Leave empty for no message)",
                            //  @ts-ignore
                            useTextArea: true,
                            default: '{user} - ${winnings}; ',
                            tip: "Available variables are: {user}, {winnings}.",
                        },
                    }
                },
                generalMessages: {
                    title: 'General Messages',
                    description: "These are useful for development, but might be annoying on stream.",
                    sortRank: 4,
                    settings: {
                        currencyNotFound: {
                            type: "string",
                            title: "Currency is misconfigured.",
                            description: "If we cannot find trivia, this message is sent. (Leave empty for no message)",
                            //  @ts-ignore
                            useTextArea: true,
                            default: "Unable to start a Trivia game. The selected currency cannot be found.",
                            tip: "Available variables are: {currency}.",
                        },
                        gameStillRunning: {
                            type: "string",
                            title: "Prior game has not been finished.",
                            description: "Is sent if a game is still running. (Leave empty for no message)",
                            //  @ts-ignore
                            useTextArea: true,
                            default: "Unable to start a Trivia game. Game currently running or payout still pending.",
                            tip: "Available variables are: {accepting}, {payout}.",
                        },
                        userAlreadyEntered: {
                            type: "string",
                            title: "User has already entered",
                            description: "Sent if the user attempts to enter multiple times. (leave empty for no message).",
                            //  @ts-ignore
                            useTextArea: true,
                            default: "Unable to add user to Trivia game. @{user} has already joined.",
                            tip: "Available variables: {user}.",
                        },
                        noDefaultMultiplier: {
                            type: "string",
                            title: "When the default multiplier is misconfigured.",
                            description: "Sent if the multiplier is missing or less than zero. (Leave empty for no message)",
                            //  @ts-ignore
                            useTextArea: true,
                            default: "Default multiplier is less than zero: {multiplier}.",
                            tip: "Available variables are: {multiplier}.",
                        },
                        invalidMultiplier: {
                            type: "string",
                            title: "The multiplier is invalid.",
                            description: "Printed if we're unable to parse the score multiplier. (Leave empty for no message)",
                            //  @ts-ignore
                            useTextArea: true,
                            default: 'Multiplier unable to be applied correctly.',
                            tip: "",
                        },
                        userIsNotBroadcaster: {
                            type: "string",
                            title: "The User is not the broadcaster/streamer",
                            description: "The user that triggered an administrative command is not the broadcaster. (Leave empty for no message)",
                            //  @ts-ignore
                            useTextArea: true,
                            default: "You do not have permission to use this command.",
                            tip: "Available variables are: {username}.",
                        },
                        noUserEntries: {
                            type: "string",
                            title: "No users entered the game.",
                            description: "A game was run but no users entered. (Leave empty for no message)",
                            //  @ts-ignore
                            useTextArea: true,
                            default: "Anyone here? No users entered this game!",
                            tip: "",
                        },

                    }
                },
                chatSettings: {
                    title: "Chat Settings",
                    description: null,
                    sortRank: 9,
                    settings: {
                        chatter: {
                            type: "chatter-select",
                            title: "Chat As",
                            description: null,
                            default: null,
                            tip: null,
                            sortRank: null,
                            showBottomHr: null,
                            validation: {
                                required: true,
                            }
                        }
                    }
                }
            },
            onLoad: () => {
                this.registerCommands();
            },
            onUnload: () => {
                this.unregisterCommand();
            },
            onSettingsUpdate: () => {
                this.updateSettings();
            }
        }
    }

    private registerCommands() {
        const { logger, commandManager } = globals.modules;
        logger.info("TRIVIA: Registering Trivia Commands");

        if (!this.triviaCommandHandler) {
            this.triviaCommandHandler = new TriviaCommand(this._ID, 4);
        }

        if (!commandManager.hasSystemCommand(this._ID)) {
            commandManager.registerSystemCommand(this.triviaCommandHandler.getTriviaCommand());
            commandManager.registerSystemCommand(this.triviaCommandHandler.getEntryCommands());
        }
    };

    private unregisterCommand() {
        const { logger, commandManager } = globals.modules;
        logger.info("TRIVIA: Unregistering Trivia Commands");

        const adminCmd = this.triviaCommandHandler.getTriviaCommand()
        if (commandManager.hasSystemCommand(adminCmd.definition.id)) {
            commandManager.unregisterSystemCommand(adminCmd.definition.id);
        }
        const userCmd = this.triviaCommandHandler.getEntryCommands()
        if (commandManager.hasSystemCommand(userCmd.definition.id)) {
            commandManager.unregisterSystemCommand(userCmd.definition.id);
        }
    };

    private updateSettings() {
        const { logger, commandManager } = globals.modules;
        logger.info("TRIVIA: Settings updated. Resetting Trivia");

        this.unregisterCommand();

        if (this.triviaCommandHandler) {
            // TODO: update number of answers
            this.triviaCommandHandler = new TriviaCommand(this._ID, 4);
        }

        setTimeout(() => this.registerCommands(), 1000);
    }

}


