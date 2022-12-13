import inquirer from 'inquirer';
import PressToContinuePrompt from 'inquirer-press-to-continue';
inquirer.registerPrompt('press-to-continue', PressToContinuePrompt);

export default async () => {
    return inquirer.prompt({
        name: "key",
        type: 'press-to-continue',
        anyKey: true,
        pressToContinueMessage: 'Press a key to continue...'
    });
};
