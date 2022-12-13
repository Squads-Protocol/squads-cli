import inquirer from "inquirer";

export default  () => {
    const questions = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                "Add a key",
                "Remove a key",
                "Change threshold",
                "<- Go back"
            ],
        }
    ];
    return inquirer.prompt(questions);
};