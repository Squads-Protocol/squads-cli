import inquirer from "inquirer";
import { shortenTextEnd } from "../utils.js";

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
    const choices = visible.map((tx) => {
        const creator = tx.creator.toBase58();
        const isSelf = creator === userKey.toBase58();
        return {
            name: `${tx.publicKey.toBase58()} (${Object.keys(tx.status)[0]}) — by ${shortenTextEnd(creator, 8)}${isSelf ? " (you)" : ""}`,
            value: tx.publicKey.toBase58(),
        };
    });
    choices.push({ name: "<- Go back", value: null });

    return inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'Choose a transaction',
        choices,
    }]);
};
