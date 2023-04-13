import inquirer from "inquirer";

export const nftMainInq = () => {
    const questions = [
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            {name: "Update Authority Change", value: 0},
            {name: "Validate Metadata Accounts", value: 1},
            {name: "Batch NFT Transfer", value: 2},
            "Back",
        ],
      }
    ];
    return inquirer.prompt(questions);
  };

export const nftUpdateAuthorityInq = () => {
    const questions = [
        {
            type: 'list',
            name: 'type',
            message: 'What type of authority change?',
            choices: [
                {name: "Move Authority to this multisigs vault", value: 0},
                {name: "Move authority out of this vault to a different address", value: 1},
            ],
        },
        {
            when: (answers) => answers.type === 1,
            validate: (answers) => {
                if (!answers.publicKey || answers.publicKey.length < 0){
                    return true;
                }
                try {
                    new PublicKey(answers.publicKey);
                    return true;
                }catch (e) {
                    return false;
                }
            },
            type: 'input',
            name: 'publicKey',
            message: 'Enter the new authority address (base58)',
        },
        {
            type: 'input',
            name: 'mintList',
            message: 'Enter the location of the mint list file (.json)',

        }
    ];
    return inquirer.prompt(questions);
};

export const nftValidateMetasInq = () => {
    const questions = [
        {
            type: 'confirm',
            name: 'validate',
            message: 'Do you want to validate the metadata accounts before creating the transactions? This may take a while depending on the number of mints',
        }
    ];
    return inquirer.prompt(questions);
}

export const nftUpdateAuthorityConfirmInq = (newAuthority, numMints, numTransactions) => {
    const questions = [
        {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to change the authority of ${numMints} mints to ${newAuthority}? This will create ${numTransactions} transactions in the multisig.`,
        }
    ];
    return inquirer.prompt(questions);
};

export const nftUpdateAuthorityConfirmIncomingInq = (newAuthority, numMints) => {
    const questions = [
        {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to change the authority of ${numMints} mints to the vault at ${newAuthority}?`,
        }
    ];
    return inquirer.prompt(questions);
};

export const nftWithdrawConfirmInq = (destination, numMints, numTransactions) => {
    const questions = [
        {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to send ${numMints} NFTs to ${destination}? This will create ${numTransactions} transactions in the multisig.`,
        }
    ];
    return inquirer.prompt(questions);
};

export const nftUpdateShowFailedMintsInq = () => {
    const questions = [
        {
            type: 'confirm',
            name: 'showFail',
            message: `Show the mint addresses of the accounts we could not validate?`,
        }
    ];
    return inquirer.prompt(questions);
};

export const nftUpdateShowFailedMetasInq = () => {
    const questions = [
        {
            type: 'confirm',
            name: 'showFail',
            message: `Show the metadata addresses of the accounts we could not validate?`,
        }
    ];
    return inquirer.prompt(questions);
};

export const nftValidateOwnerInq = () => {
    const questions = [
        {
            type: 'confirm',
            name: 'ownerValidate',
            message: 'Do you want to validate the metadata accounts are valid and have their authorities currently set to the vault? (Recommended)',
        }
    ];
    return inquirer.prompt(questions);
};

export const nftSafeSigningInq = () => {
    const questions = [
        {
            type: 'confirm',
            name: 'safeSign',
            message: 'Do you want to enforce that the new authority is also a signer? It will require the new authority to be the executor of the multisig transaction. (Recommended)',
        }
    ];
    return inquirer.prompt(questions);
};

export const nftUpdateTryFailuresInq = (num) => {
    const questions = [
        {
            type: 'confirm',
            name: 'rerun',
            message: `Do you want to run the transfer for these previous ${num} failures?`,
        }
    ];
    return inquirer.prompt(questions);
};

export const nftValidateCurrentAuthorityInq = (vault) => {
    const questions = [
        {
            type: 'input',
            name: 'mintList',
            message: 'Enter the location of the mint list file (.json)',

        },
        {
            type: 'list',
            name: 'type',
            message: 'Who is the current authorities for the metadata accounts?',
            choices: [
                {name: `Squad Vault (${vault.toBase58()})`, value: 0},
                {name: "A different address", value: 1},
            ],
        },
        {
            when: (answers) => answers.type === 1,
            validate: (answers) => {
                if (!answers.publicKey || answers.publicKey.length < 0){
                    return true;
                }
                try {
                    new PublicKey(answers.publicKey);
                    return true;
                }catch (e) {
                    return false;
                }
            },
            type: 'input',
            name: 'publicKey',
            message: 'Enter the current authority address (base58)',
        },

    ];
    return inquirer.prompt(questions);
};

export const nftMintListInq = () => {
    const questions = [
        {
            type: 'input',
            name: 'mintList',
            message: 'Enter the location of the mint list file (.json) for the NFTs you want to transfer out. (Press enter to go back)',
        }
    ];
    return inquirer.prompt(questions);
}


export const nftTransferDestinationInq = () => {
    const questions = [
        {
            type: 'input',
            name: 'destination',
            message: 'Where do you want to transfer the NFTs to? (Press enter to go back)',
        }
    ];
    return inquirer.prompt(questions);
}
