"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
var anchor_1 = require("@coral-xyz/anchor");
exports.default = (function () {
    var questions = [
        {
            name: 'walletPath',
            type: 'input',
            message: 'Enter the path of your wallet file (or enter for default ~/.config/solana/id.json):',
        },
    ];
    return inquirer_1.default.prompt(questions);
});
//# sourceMappingURL=walletPath.js.map