import inquirer from "inquirer";

export default (multisigs) => {
const questions = [
    {
    type: 'list',
    name: 'action',
    message: 'Choose a multisig to manage',
    choices: multisigs,
    }
];
return inquirer.prompt(questions);
};