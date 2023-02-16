import inquirer from "inquirer";
import {web3} from "@coral-xyz/anchor";

export default  () => {
const questions = [
    {
        default: 1,
        name: 'authority',
        type: 'number',
        message: 'Enter the authority index to use (default 1):',
        validate: function( value ) {
            if (value < 1 ) {
                return 'Authorities must be greater than 0, if you need to change the multisig settings, use the settings menu';
            }else{
                return true;
            }
        },
    }];
    return inquirer.prompt(questions);
};