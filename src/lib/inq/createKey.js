import inquirer from "inquirer";
import {web3} from "@coral-xyz/anchor";

export default () => {
    const questions = [
        {
          name: 'createKey',
          type: 'input',
          message: 'Enter a base58 seed to create a new multisig (or enter for random):',
          validate: function( value ) {
            if (value.length > 0 ) {
              try {
                new web3.PublicKey(value);
                return true;
              } catch {
                return 'Please enter a valid base58 seed';
              }
            }else{
              return true;
            }
          }
        }
      ];
      return inquirer.prompt(questions);
  };