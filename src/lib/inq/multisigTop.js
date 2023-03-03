import inquirer from "inquirer";

export default (multisig) => {
    const questions = [
        {
            type: 'list',
            name: 'action',
            message: `What would you like to do?`,
            choices: [
                "Transactions",
                "Create new Transaction",
                "Vault",
                "Settings",
                "Create new ATA",
                "Program Authority Transfer",
                "Bulk NFT Operations",
                "<- Go back"
            ],
        }
    ];
    return inquirer.prompt(questions);
};