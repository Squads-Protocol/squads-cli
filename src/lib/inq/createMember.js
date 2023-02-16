import inquirer from "inquirer";
import {web3} from "@coral-xyz/anchor";

export default  () => {
const questions = [
    {
        name: 'member',
        type: 'input',
        message: 'Add an additional member key (base58) or enter to skip:',
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