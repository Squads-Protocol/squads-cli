import inquirer from "inquirer";
import {web3} from "@project-serum/anchor";

export default  () => {
const questions = [
    {
        default: "",
        name: 'rawIx',
        type: 'n',
        message: 'Enter the serialized Transaction in base58:',
    }];
    return inquirer.prompt(questions);
};