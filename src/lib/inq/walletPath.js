import inquirer from "inquirer";
import {web3} from "@project-serum/anchor";

export default () => {
    const questions = [
        {
          name: 'walletPath',
          type: 'input',
          message: 'Enter the path of your wallet file (or enter for default ~/.config/solana/id.json):',
        },
      ];
      return inquirer.prompt(questions);
  };