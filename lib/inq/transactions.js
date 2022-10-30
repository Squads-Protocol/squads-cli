import inquirer from "inquirer";

export default  (txs)  => {
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