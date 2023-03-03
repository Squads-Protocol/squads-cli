import inquirer from "inquirer";

export const nftMainInq = () => {
    const questions = [
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            "Update Authority Change",
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