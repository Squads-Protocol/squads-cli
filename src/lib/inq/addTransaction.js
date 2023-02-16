import inquirer from "inquirer";

export default  () => {
const questions = [
    {
        default: "",
        name: 'rawIx',
        type: 'input',
        message: 'Enter the serialized Transaction in base58:',
    }];
    return inquirer.prompt(questions);
};