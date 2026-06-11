import inquirer from "inquirer";
import { TX_ACTION } from "../menuActions.js";

export default (tx) => {
    let choices = [];
    if (tx.status.active) {
        choices = [
            { name: "Approve", value: TX_ACTION.APPROVE },
            { name: "Reject", value: TX_ACTION.REJECT },
        ];
    }
    if (tx.status.executeReady) {
        choices = [
            { name: "Execute", value: TX_ACTION.EXECUTE },
            { name: "Submit to cancel", value: TX_ACTION.CANCEL },
        ];
    }
    if (tx.status.draft) {
        choices = [{ name: "Add Instruction", value: TX_ACTION.ADD_IX }];
        if (tx.instructionIndex > 0) {
            choices.push({ name: "Activate", value: TX_ACTION.ACTIVATE });
        }
    }

    choices.push({ name: "<- Go back", value: TX_ACTION.BACK });

    const questions = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices,
        },
    ];
    return inquirer.prompt(questions);
};
