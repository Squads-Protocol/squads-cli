"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
exports.default = (function (multisig) {
    var questions = [
        {
            type: 'list',
            name: 'action',
            message: "What would you like to do?",
            choices: [
                "Transactions",
                "Create new Transaction",
                "Vault",
                "Settings",
                "Create new ATA",
                "Program Authority Transfer",
                "Bulk NFT Operations",
                "<- Go back"
            ],
        }
    ];
    return inquirer_1.default.prompt(questions);
});
//# sourceMappingURL=multisigTop.js.map