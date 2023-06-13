import inquirer from "inquirer";
import {web3} from "@coral-xyz/anchor";

export const validatorMainInq = () => {
    const questions = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                {name: "Move Validator Withdraw Authority", value: 0},
                "Back",
            ],
        }
    ];
    return inquirer.prompt(questions);
};

export const validatorWithdrawAuthPrompt = () => {
    const questions = [
        {
            type: 'input',
            name: 'validatorId',
            default: '',
            message: 'Enter the validator ID key',
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
        }
    ];
    return inquirer.prompt(questions);
};

export const validatorWithdrawAuthDestPrompt = () => {
    const questions = [
        {
            type: 'input',
            name: 'destination',
            default: '',
            message: 'Enter the new authority for the withdraw auth',
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
        }
    ];
    return inquirer.prompt(questions);
};
