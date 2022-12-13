import inquirer from "inquirer";

export default async (message, defaultVal = false) => {
    return inquirer.prompt({default: defaultVal, name: 'yes', type: 'confirm', message});
}
