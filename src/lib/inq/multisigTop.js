import inquirer from "inquirer";
import { MULTISIG } from "../menuActions.js";

export default (multisig) => {
    const questions = [
        {
            type: 'list',
            name: 'action',
            message: `What would you like to do?`,
            choices: [
                { name: "Transactions", value: MULTISIG.TRANSACTIONS },
                { name: "Create new Transaction", value: MULTISIG.CREATE_TX },
                { name: "Vault", value: MULTISIG.VAULT },
                { name: "Settings", value: MULTISIG.SETTINGS },
                { name: "Create new ATA", value: MULTISIG.CREATE_ATA },
                { name: "Program Authority Transfer", value: MULTISIG.PROGRAM_AUTHORITY },
                { name: "Bulk NFT Operations", value: MULTISIG.BULK_NFT },
                { name: "Validator", value: MULTISIG.VALIDATOR },
                { name: "<- Go back", value: MULTISIG.BACK },
            ],
        },
    ];
    return inquirer.prompt(questions);
};
