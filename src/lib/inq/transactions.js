import inquirer from "inquirer";

export default  (txs, userKey)  => {
    // console.log(txs);

    const choices = txs.filter((tx) => {
        return ((tx.creator.toBase58() === userKey.toBase58() && tx.status.draft ) || tx.status.active || tx.status.executeReady || tx.status.executed || tx.status.rejected || tx.status.cancelled);
    }).map(tx => {
        return `${tx.publicKey.toBase58()} (${Object.keys(tx.status)[0]})`;
    });
    if(choices.length < 1){
        console.log("No transactions found");
    }
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
