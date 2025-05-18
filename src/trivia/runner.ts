import globals from '../globals';


type UserGuess = {
    username: string;
    userDisplayName: string;
    entryTime: number;
    successModifier: number;
    winnings: number;
    userGuess: string;
}

/*
 * Singleton instance of a trivia game. Can have its state reset to default.
 */
class TriviaRunner {
    private GAME_ID: string = "cgjvdp-fbtrivia";
    private startDelayTimeoutId: any;
    private gameStartTimestamp: number;
    private roundEntryPeriod: number;
    private roundMultiplier: number;

    public triviaEntriesAccepted: boolean = false;
    public payoutGiven: boolean = true;

    public users: UserGuess[];

    constructor() {
        this.users = [];
    }

    public userHasEntered(username: string): boolean {
        return this.users.some(e => e.username === username);
    }

    public async triggerTriviaOpen(entryTimespan: number, multiplier: number) {
        const { logger, gameManager, twitchChat } = globals.modules
        const triviaSettings = gameManager.getGameSettings(this.GAME_ID);
        const chatAs = triviaSettings.settings.chatSettings.chatter;

        if (this.triviaEntriesAccepted || !this.payoutGiven) {
            logger.debug("TRIVIA: Trivia Open triggered while game is accepting entries or payout not given.");
            return;
        }
        this.triviaEntriesAccepted = true;
        this.payoutGiven = false;

        if (this.startDelayTimeoutId != null) {
            clearTimeout(this.startDelayTimeoutId);
        }
        this.gameStartTimestamp = Date.now();
        this.roundEntryPeriod = entryTimespan;
        this.roundMultiplier = multiplier;

        // run a delay and then close entries to question.
        this.startDelayTimeoutId = setTimeout(async () => {
            this.triviaEntriesAccepted = false;
            this.payoutGiven = false;
            this.startDelayTimeoutId = null;

            const closeMessage = triviaSettings.settings.gameMessages.roundClose;
            if (closeMessage) {
                await twitchChat.sendChatMessage(closeMessage, null, chatAs)
            } else {
                logger.warn("TRIVIA: Skipping close message");
            }

            // TODO: do the needful?
            // check to see if users have entered. if no, cleanup.
            if (this.users.length === 0) {
                const noUserEntriesMessage = triviaSettings.settings.gameMessages.noUserEntries;
                if (noUserEntriesMessage) {
                    await twitchChat.sendChatMessage(noUserEntriesMessage)
                }
                this.reset();
            }
        }, entryTimespan * 1000);
    }

    public async addUserGuess(username: string, userDisplay: string, guess: string) {
        const { logger, gameManager, twitchChat } = globals.modules
        const triviaSettings = gameManager.getGameSettings(this.GAME_ID);
        const chatAs = triviaSettings.settings.chatSettings.chatter;

        const recordedTimestamp = Date.now();

        // Calculate score.
        // First find the percent reduction of the user's entry. Eg, immediately guessing is 0%, guessing at the
        // very end is 100%. This percentage is the users core reduction. Then, find where that percentage lays
        // between the min and max score. To do that, find the difference between the min and max scores, apply
        // the percent reduction to that range, and then reduce the maxScore by that amount. Finally, multiply that
        // by the round multiplier
        // tl;dr: solve for X
        //
        // $\frac{X - minScore} / {maxScore - minScore} × 100$
        const minScore = triviaSettings.settings.gameSettings.baseMinScorePerQuestion;
        const maxScore = triviaSettings.settings.gameSettings.baseMaxScorePerQuestion;

        const score = (maxScore - (parseFloat(((recordedTimestamp - this.gameStartTimestamp) / (this.roundEntryPeriod * 1000)).toPrecision(2)) * (maxScore - minScore)) * this.roundMultiplier);
        logger.debug(`TRIVIA: min: ${minScore}; max: ${maxScore}; userScore: ${score}`);

        const userGuess: UserGuess = {
            username: username,
            userDisplayName: userDisplay,
            userGuess: guess,
            winnings: score,
            entryTime: recordedTimestamp,
            successModifier: this.roundMultiplier,
        }
        this.users.push(userGuess);

        if (triviaSettings.settings.gameMessages.onJoin) {
            const onJoinMessage = triviaSettings.settings.gameMessages.onJoin
                .replace('{user}', userGuess.userDisplayName)
                .replace('{choice}', userGuess.userGuess)
                .replace('{score}', userGuess.winnings);
            await twitchChat.sendChatMessage(onJoinMessage, null, chatAs);
        }
        logger.info(`TRIVIA: ${userGuess.userDisplayName} guesses ${userGuess.userGuess} for ${userGuess.winnings} (${userGuess.successModifier}X)`)
    }

    private reset() {
        this.payoutGiven = true;
        this.triviaEntriesAccepted = false;
        this.gameStartTimestamp = null;
        this.roundEntryPeriod = null;
        this.roundMultiplier = null;
    }
}

export default new TriviaRunner()