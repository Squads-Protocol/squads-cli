import inquirer from "inquirer";

export default (multisigs, defaultIndex) => {
    if(!multisigs || multisigs.length < 1){
        console.log("No multisigs found for this wallet");
    }
    const questions = [
        {
        default: defaultIndex,
        type: 'list',
        name: 'action',
        message: 'Choose a multisig to manage',
        choices: multisigs,
        }
    ];
return inquirer.prompt(questions);
};