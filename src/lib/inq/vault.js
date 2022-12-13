import inquirer from "inquirer";

export default  ({usableTokens, displayTokens}) => {
    const choices = displayTokens.map((token, index) => {
        return {
            name: `${token.name} (${token.symbol}) - ${token.amount}`,
            value: index
        }
    });
    choices.push("<- Go back")
    const questions = [
        {
            type: 'list',
            name: 'action',
            message: 'Choose an asset',
            choices,
        }
    ];
    return inquirer.prompt(questions);
};