import inquirer from "inquirer";

export default () => {
    const questions = [
      {
        type: 'list',
        name: 'action',
        message: 'Welcome to SQUADS - what would you like to do?',
        choices: [
            "View my Multisigs",
            "Create a new Multisig",
            "Exit",
        ],
      }
    ];
    return inquirer.prompt(questions);
  };