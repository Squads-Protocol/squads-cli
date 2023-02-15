"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
exports.default = (function (txs, userKey) {
    // console.log(txs);
    var choices = txs.filter(function (tx) {
        return ((tx.creator.toBase58() === userKey.toBase58() && tx.status.draft) || tx.status.active || tx.status.executeReady || tx.status.executed);
    }).map(function (tx) {
        return "".concat(tx.publicKey.toBase58(), " (").concat(Object.keys(tx.status)[0], ")");
    });
    if (choices.length < 1) {
        console.log("No transactions found");
    }
    choices.push("<- Go back");
    var txList = [
        {
            type: 'list',
            name: 'action',
            message: 'Choose a transaction',
            choices: choices,
        }
    ];
    return inquirer_1.default.prompt(txList);
});
//# sourceMappingURL=transactions.js.map