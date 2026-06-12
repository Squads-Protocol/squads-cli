import inquirer from "inquirer";

export default () => {
    const questions = [
        {
            default: 1,
            name: 'authorityIndex',
            type: 'number',
            message: 'Enter the authority index to use (default 1):',
            validate: function( value ) {
                if (Number.isInteger(value) && value >= 1) {
                    return true;
                }
                return 'Authority index must be a whole number >= 1';
            },
        }];
    return inquirer.prompt(questions);
};
