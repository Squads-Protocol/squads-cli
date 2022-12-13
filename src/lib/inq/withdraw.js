import inquirer from "inquirer";

export default  () => {
    const choices = ["Withdraw"];
    choices.push("<- Go back")
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