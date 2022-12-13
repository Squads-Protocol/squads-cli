import inquirer from "inquirer";

export default  (numMembers) => {
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