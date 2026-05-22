import inquirer from "inquirer";
import { SETTINGS } from "../menuActions.js";

export default () => {
    const questions = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                { name: "Add a key", value: SETTINGS.ADD_KEY },
                { name: "Remove a key", value: SETTINGS.REMOVE_KEY },
                { name: "Change threshold", value: SETTINGS.CHANGE_THRESHOLD },
                { name: "<- Go back", value: SETTINGS.BACK },
            ],
        },
    ];
    return inquirer.prompt(questions);
};
