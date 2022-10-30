import inquirer from "inquirer";

export default (multisig) => {
    const questions = [
        {
            type: 'list',
            name: 'action',
            message: `Multisig: ${multisig.publicKey.toBase58()}`,
            choices: [
                "Transactions",
                // "Vault(s)",
                "Settings",
                "Program Authority Transfer",
                "<- Go back"
            ],
        }
    ];
    return inquirer.prompt(questions);
};