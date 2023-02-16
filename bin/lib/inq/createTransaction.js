"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
var anchor_1 = require("@coral-xyz/anchor");
exports.default = (function () {
    var questions = [
        {
            default: 1,
            name: 'authority',
            type: 'number',
            message: 'Enter the authority index to use (default 1):',
            validate: function (value) {
                if (value < 1) {
                    return 'Authorities must be greater than 0, if you need to change the multisig settings, use the settings menu';
                }
                else {
                    return true;
                }
            },
        }
    ];
    return inquirer_1.default.prompt(questions);
});
//# sourceMappingURL=createTransaction.js.map