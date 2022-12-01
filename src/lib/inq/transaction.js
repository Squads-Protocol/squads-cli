import inquirer from "inquirer";

export default (tx) => {
    let choices = [];
    if(tx.status.active) {
        choices = ["Approve", "Reject"];
    }
    if(tx.status.executeReady){
        choices = ["Execute", "Submit to cancel"];
    }
    if (tx.status.draft){
        choices = ["Add Instruction"];
        if(tx.instructionIndex > 0){
            choices.push("Activate");
        }
    }

    choices.push("<- Go back");

    const questions = [
        {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices,
        }
    ];
    return inquirer.prompt(questions);
};