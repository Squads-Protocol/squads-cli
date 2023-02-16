"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
var anchor_1 = require("@coral-xyz/anchor");
exports.default = (function () {
    var questions = [
        {
            name: 'createKey',
            type: 'input',
            message: 'Enter a base58 seed to create a new multisig (or enter for random):',
            validate: function (value) {
                if (value.length > 0) {
                    try {
                        new anchor_1.web3.PublicKey(value);
                        return true;
                    }
                    catch (_a) {
                        return 'Please enter a valid base58 seed';
                    }
                }
                else {
                    return true;
                }
            }
        }
    ];
    return inquirer_1.default.prompt(questions);
});
//# sourceMappingURL=createKey.js.map