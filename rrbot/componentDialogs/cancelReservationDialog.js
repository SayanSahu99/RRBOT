const {
    WaterfallDialog,
    ComponentDialog,
    DialogSet,
    DialogTurnStatus
} = require('botbuilder-dialogs');

const {
    ConfirmPrompt,
    TextPrompt,
    ChoicePrompt,
    DateTimePrompt,
    NumberPrompt
} = require('botbuilder-dialogs');

const { CardFactory } = require('botbuilder');

const RestaurantCard = require('../resources/adaptiveCards/restaurantCard.json');

const CARDS = [RestaurantCard];

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class cancelReservationDialog extends ComponentDialog {

    constructor(conversationState, userState) {
        super('cancelReservationDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            // Ask confirmation if user wants to make reservation
            this.firstStep.bind(this),
            // Show summary of values entered by user and ask confirmation to make reservation
            this.confirmStep.bind(this),
            this.summaryStep.bind(this)
        ]));



        this.initialDialogId = WATERFALL_DIALOG;
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(turnContext);

        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }

    }

    async firstStep(step) {
        endDialog = false;
        // Running a prompt here means that the next WaterfallStep will be run when the users response is received.
        await step.context.sendActivity({
            text: 'Enter reservation details to cancel reservation: ',
            attachments: [CardFactory.adaptiveCard(CARDS[0])]
        });
        
        return await step.prompt(TEXT_PROMPT, '');
    }

    async confirmStep(step) {
        step.values.reservationNo = step.result;
        var msg = ` You have entered following values: \n Reservation Number: ${step.values.reservationNo} `
        await step.context.sendActivity(msg);
        return await step.prompt(CONFIRM_PROMPT, 'Are you sure you want to cancel reservation?', ['Yes', 'NO']);

    }

    async summaryStep(step) {
        if (step.result == true) {
            // Business logic

            await step.context.sendActivity("Rservation cancelled successfull made. Your reservation id is: 123345678");
            endDialog = true;
            return await step.endDialog();
        }
    }

    async isDialogComplete() {
        return endDialog;
    }
}

module.exports = { cancelReservationDialog };

