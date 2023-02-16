import inquirer from "inquirer";
import * as anchor from "@coral-xyz/anchor";

export default (createKey, members, threshold) => {
console.log("createKey: ", createKey);
console.log("members:");
members.forEach((m) => {
    console.log("  ", m);
});
console.log("threshold: ", threshold);
const questions = [
    {
        default: false,
        name: 'action',
        type: 'confirm',
        message: 'Create the new multisig?',
    }
    ];
    return inquirer.prompt(questions);
};