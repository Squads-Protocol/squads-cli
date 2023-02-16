import inquirer from "inquirer";
import {web3} from "@coral-xyz/anchor";

export default () => {
    const questions = [
        {
        type: 'input',
        name: 'programId',
        default: '',
        message: 'Enter the programId/publicKey (base58)',
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