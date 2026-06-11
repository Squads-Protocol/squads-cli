import inquirer from "inquirer";

export default (numMembers) => {
    const questions = [
        {
            name: 'threshold',
            type: 'number',
            default: 1,
            message: `Enter the multisig threshold (must be between 1 and ${numMembers}, default 1):`,
            validate: function (value) {
                if (typeof value !== 'number' || Number.isNaN(value)) {
                    return 'Threshold must be a number';
                }
                if (!Number.isInteger(value)) {
                    return 'Threshold must be a whole number';
                }
                if (value < 1 || value > numMembers) {
                    return `Threshold must be between 1 and ${numMembers}`;
                }
                return true;
            },
        },
    ];
    return inquirer.prompt(questions);
};
