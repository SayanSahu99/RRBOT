// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

class RRBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            const replyText = `Echo: ${ context.activity.text }`;
            await context.sendActivity(MessageFactory.text(replyText, replyText));
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            await this.sendWelcomeMessage(context);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    async sendWelcomeMessage(turnContext) {
        const { activity } = turnContext;
        const membersAdded = activity.membersAdded;
        
        // Iterate over all new members added to the consersation
        for (let idx in membersAdded) {
            if (membersAdded[idx].id !== activity.recipient.id) {
                const welcomeText = `Welcome to Restaurant Reservation Bot ${ activity.membersAdded[idx].name }. `;
                await turnContext.sendActivity(welcomeText);
                await this.sendSuggestedActions(turnContext);
            }
        }
    }

    async sendSuggestedActions(turnContext) {
        var reply = MessageFactory.suggestedActions(['Make Reservation', 'Cancel Reservation', 'Restaurant Address'], 'What would you like to do today? ');
        await turnContext.sendActivity(reply);
    }
}

module.exports.RRBot = RRBot;
