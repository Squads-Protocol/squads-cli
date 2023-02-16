import inquirer from "inquirer";
import {web3} from "@coral-xyz/anchor";
import chalk from 'chalk';

const inputATAInq = async (v) => {
    console.log(chalk.blue(`Create an ATA`));
    const questions = [
        {
            default: "",
            name: 'mint',
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
            message: 'Enter the public key for the mint (base58) for the ATA, or press Enter to go back:',
        },
        {
            default: v.toBase58(),
            name: 'owner',
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
            message: 'Enter the public key (base58) for owner of the ATA - default is your vault/authority:',
        },
    ];
    return inquirer.prompt(questions);
};


export default  async (vault) => {
    const {mint, owner} = await inputATAInq(vault);
    if(mint.length < 1 || owner.length < 1){
        return false;
    }else{
        return {mint, owner};
    }
};