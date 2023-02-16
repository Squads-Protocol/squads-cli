import inquirer from "inquirer";

export default () => {
    const questions = [
        {
            name: 'cluster',
            type: 'input',
            message: 'Enter the rpc cluster to use (or enter for mainnet-beta):',
          }
      ];
      return inquirer.prompt(questions);
  };