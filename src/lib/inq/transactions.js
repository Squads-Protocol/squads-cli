import inquirer from "inquirer";

export default (txs, userKey) => {
    const visible = txs.filter((tx) => {
        return (
            (tx.creator.toBase58() === userKey.toBase58() && tx.status.draft) ||
            tx.status.active || tx.status.executeReady ||
            tx.status.executed || tx.status.rejected || tx.status.cancelled
        );
    });
    if (visible.length < 1) {
        console.log("No transactions found");
    }
    const choices = visible.map((tx) => ({
        name: `${tx.publicKey.toBase58()} (${Object.keys(tx.status)[0]})`,
        value: tx.publicKey.toBase58(),
    }));
    choices.push({ name: "<- Go back", value: null });

    return inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'Choose a transaction',
        choices,
    }]);
};
