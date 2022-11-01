import inquirer from "inquirer";

export default (multisig) => {
    const questions = [
        {
            type: 'list',
            name: 'action',
            message: `Multisig: ${multisig.publicKey.toBase58()}`,
            choices: [
                "Transactions",
                "Create new Transaction",
                "Vault",
                "Settings",
                "Create new ATA",
                "Program Authority Transfer",
                "<- Go back"
            ],
        }
    ];
    return inquirer.prompt(questions);
};