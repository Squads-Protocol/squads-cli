import inquirer from "inquirer";
import {web3, utils} from "@coral-xyz/anchor";
import base58 from "bs58";

const inputProgramIdInq = async () => {
    const questions = [
        {
            default: "",
            name: 'programId',
            type: 'input',
            message: 'Enter the base58 program ID that this instruction will invoke:',
            validate: function( value ) {
                if (value.length > 0 ) {
                    try {
                        new web3.PublicKey(value);
                        return true;
                    } catch (e){
                        return 'Please enter a valid publicKey (base58)';
                    }
                }else{
                    return true;
                }
            }
        },
    ];
    return inquirer.prompt(questions);
};

const inputAccountInq = async (ind) => {
    console.log(`Adding account [${ind}] to the instruction:`);
    const questions = [
        {
            default: "",
            name: 'key',
            type: 'input',
            validate: function( value ) {
                if (value.length > 0 ) {
                try {
                    new web3.PublicKey(value);
                    return true;
                } catch (e){
                    return 'Please enter a valid publicKey (base58)';
                }
                }else{
                return true;
                }
            },
            message: 'Enter the base58 account public key for this instruction:',
        },
        {
            default: 'no',
            name: 'isWritable',
            choices: ['yes', 'no'],
            type: 'list',
            message: 'Is writable?:',
        },
        {
            default: 'no',
            name: 'isSigner',
            choices: ['yes', 'no'],
            type: 'list',
            message: 'Is signer?:',
        },
    ];
    return inquirer.prompt(questions);
};

const inputDataInq = async () => {
    const questions = [
        {
            default: "",
            name: 'data',
            type: 'input',
            message: 'Enter the data buffer serialized in base58:',
        },
    ];
    return inquirer.prompt(questions);
};

const moreAccountsInq = async () => {
    const questions = [
        {
            default: "yes",
            name: 'yes',
            type: 'confirm',
            message: 'Add another account to the instruction?',
        },
    ];
    return inquirer.prompt(questions);
};

export default  async () => {

    const {programId} = await inputProgramIdInq();
    if (programId.length === 0) {
        return false;
    }
    const accounts = [];
    let moreAccounts = true;
    while(moreAccounts) {
        const account = await inputAccountInq(accounts.length);
        accounts.push(account);
        const more = await moreAccountsInq();
        moreAccounts = more.yes;
    }
    const {data} = await inputDataInq();

    return {
        programId: new web3.PublicKey(programId),
        keys: accounts.map((a) => {
            return {
                pubkey: new web3.PublicKey(a.key),
                isWritable: a.isWritable === 'yes',
                isSigner: a.isSigner === 'yes',
            };
        }),
        data: utils.bytes.bs58.decode(data),
    };

};