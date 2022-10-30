import inquirer from "inquirer";

export default  (assets) => {
    const questions = [
        {
            type: 'list',
            name: 'action',
            message: 'Choose an asset',
            choices: [
                "SOL",
                "USDC",
                "<- Go back"
            ],
        }
    ];
    return inquirer.prompt(questions);
};