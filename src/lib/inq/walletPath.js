import inquirer from "inquirer";
import {web3} from "@coral-xyz/anchor";

export default () => {
    const questions = [
        {
          name: 'walletPath',
          type: 'input',
          message: 'Enter the path of your wallet file or ledger (usb://ledger) (or enter for default ~/.config/solana/id.json):',
        },
      ];
      return inquirer.prompt(questions);
  };
