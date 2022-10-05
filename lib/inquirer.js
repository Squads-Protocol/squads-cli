import inquirer from "inquirer";
import * as anchor from "@project-serum/anchor";

export const mainMenu = () => {
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

  export const createMultisigCreateKeyInq = () => {
    const questions = [
        {
          name: 'createKey',
          type: 'input',
          message: 'Enter a base58 seed to create a new multisig (or enter for random):',
          validate: function( value ) {
            if (value.length > 0 ) {
              try {
                new anchor.web3.PublicKey(value);
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

  export const createMultisigMemberInq = () => {
    const questions = [
        {
          name: 'member',
          type: 'input',
          message: 'Add an additional member key (base58) or enter to skip:',
          validate: function( value ) {
            if (value.length > 0 ) {
              try {
                new anchor.web3.PublicKey(value);
                return true;
              } catch (e){
                return 'Please enter a valid publicKey (base58)';
              }
            }else{
              return true;
            }
          }
        },
      ];
      return inquirer.prompt(questions);
  };

  export const createMultisigThresholdInq = (numMembers) => {
    const questions = [
        {
          name: 'threshold',
          type: 'number',
          default: 1,
          message: 'Enter the multisig threshold (or enter for default of 1):',
          validate: function( value, answers ) {
            if (value > 0 && value <= numMembers) {
              try {
                return true;
              } catch {
                return 'Invalid threshold - must be between 1 and number of members';
              }
            }else{
              return true;
            }
          }
        }
      ];
      return inquirer.prompt(questions);
  };

  export const createMultisigConfirmInq = (createKey, members, threshold) => {
    console.log("createKey: ", createKey);
    console.log("members:");
    members.forEach((m) => {
      console.log("  ", m);
    });
    console.log("threshold: ", threshold);
    const questions = [
        {
          default: false,
          name: 'action',
          type: 'confirm',
          message: 'Create the new multisig?',
        }
      ];
      return inquirer.prompt(questions);
  };

  export const viewMultisigsMenu = (multisigs) => {
    const questions = [
      {
        type: 'list',
        name: 'action',
        message: 'Choose a multisig to manage',
        choices: multisigs,
      }
    ];
    return inquirer.prompt(questions);
  };

  export const multisigMainMenu = (multisig) => {
    const questions = [
        {
          type: 'list',
          name: 'action',
          message: `Multisig: ${multisig.publicKey.toBase58()}`,
          choices: [
              "Transactions",
              "Vault(s)",
              "Settings",
              "Program Authority Transfer",
              "<- Go back"
          ],
        }
      ];
      return inquirer.prompt(questions);
  };


  export const vaultMenu = (assets) => {
    const questions = [
        {
          type: 'list',
          name: 'action',
          message: 'Choose an asset',
          choices: [
              "SOL",
              "USDC",
              "<- Go back"
          ],
        }
      ];
      return inquirer.prompt(questions);
  };

  export const transactionsMenu = (txs)  => {
    const choices = txs.map(tx => {
      return `${tx.publicKey.toBase58()} (${Object.keys(tx.status)[0]})`;
    });
    choices.push("<- Go back");
    const txList = [
      {
        type: 'list',
        name: 'action',
        message: 'Choose a transaction',
        choices,
      } 
    ];
    return inquirer.prompt(txList);
  };

  export const multisigSettingsMenu = () => {
    const questions = [
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
              "Add a key",
              "Remove a key",
              "Change threshold",
              "<- Go back"
          ],
        }
      ];
      return inquirer.prompt(questions);
  };

  export const promptProgramId = () => {
    const questions = [
      {
        type: 'input',
        name: 'programId',
        default: '',
        message: 'Enter the programId/publicKey (base58)',
        validate: function( value ) {
          if (value.length > 0 ) {
            try {
              new anchor.web3.PublicKey(value);
              return true;
            } catch (e){
              return 'Please enter a valid publicKey (base58)';
            }
          }else{
            return true;
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  };