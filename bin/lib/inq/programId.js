"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
var anchor_1 = require("@coral-xyz/anchor");
exports.default = (function () {
    var questions = [
        {
            type: 'input',
            name: 'programId',
            default: '',
            message: 'Enter the programId/publicKey (base58)',
            validate: function (value) {
                if (value.length > 0) {
                    try {
                        new anchor_1.web3.PublicKey(value);
                        return true;
                    }
                    catch (e) {
                        return 'Please enter a valid publicKey (base58)';
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
//# sourceMappingURL=programId.js.map