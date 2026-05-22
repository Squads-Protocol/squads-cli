import inquirer from "inquirer";
import { TOP } from "../menuActions.js";

export default () => {
    const questions = [
        {
            type: 'list',
            name: 'action',
            message: 'Welcome to SQUADS - what would you like to do?',
            choices: [
                { name: "View my Multisigs", value: TOP.VIEW },
                { name: "Create a new Multisig", value: TOP.CREATE },
                { name: "Exit", value: TOP.EXIT },
            ],
        },
    ];
    return inquirer.prompt(questions);
};
