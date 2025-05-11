import globals from '../globals';


type TriviaUser = {
    username: string;
    userDisplayName: string;
    entryTime: number;
    successModifier: number;
    winnings: number;
}

/*
 * Singleton instance of a trivia game. Can have its state reset to default.
 */
class TriviaRunner {
    private GAME_ID: string = "cgjvdp-fbtrivia";
    private startDelayTimeoutId: any;
    private startDelaySeconds: number;
    
    public triviaEntriesAccepted: boolean = false;
    public payoutGiven: boolean = false;

    public users: TriviaUser[];


    public userHasEntered(username: string): boolean {
        return this.users.some(e => e.username === username);
    }

    public triggerCooldown() {
        const { logger, gameManager } = globals.modules
        logger.debug("Cooldown triggered")

        const triviaSettings = gameManager.getGameSettings(this.GAME_ID);
        const user = triviaSettings.settings.chatSettings.chatter;

    }

    public async runTrivia() {
        const { logger, gameManager, twitchChat } = globals.modules
        const triviaSettings = gameManager.getGameSettings(this.GAME_ID);
        const chatAs = triviaSettings.settings.chatSettings.chatter;

        const startMessage = triviaSettings.settings.gameMessages.roundStart;
        if (startMessage) {
            await twitchChat.sendChatMessage(startMessage, null, chatAs)
        } else {
            logger.warn("Skipping startup message");
        }

        // TODO: for user in users. filter where answer == correct.
    }

    public async triggerTriviaOpen(startDelaySeconds: number) {
        const { logger, gameManager, twitchChat } = globals.modules
        const triviaSettings = gameManager.getGameSettings(this.GAME_ID);
        const chatAs = triviaSettings.settings.chatSettings.chatter;

        if (this.triviaEntriesAccepted || !this.payoutGiven) {
            logger.debug("Trivia Open triggered while game is accepting entries or payout not given.");
            return;
        }
        this.triviaEntriesAccepted = true;
        this.payoutGiven = false;

        if (this.startDelayTimeoutId != null) {
            clearTimeout(this.startDelayTimeoutId);
        }

        // run a delay and then close entries to question.
        this.startDelayTimeoutId = setTimeout(async () => {
            this.triviaEntriesAccepted = false;
            this.payoutGiven = false;
            this.startDelayTimeoutId = null;

            const closeMessage = triviaSettings.settings.gameMessages.roundClose;
            if (closeMessage) {
                await twitchChat.sendChatMessage(closeMessage, null, chatAs)
            } else {
                logger.warn("Skipping close message");
            }

            // TODO: do the needful.
            // check to see if users have entered. if no, cleanup.
            // TODO: passively wait for the streamer to confirm the correct answer
        }, startDelaySeconds * 1000);
    }
}

export default new TriviaRunner()