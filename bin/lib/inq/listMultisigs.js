"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
exports.default = (function (multisigs, defaultIndex) {
    if (!multisigs || multisigs.length < 1) {
        console.log("No multisigs found for this wallet");
    }
    var questions = [
        {
            default: defaultIndex,
            type: 'list',
            name: 'action',
            message: 'Choose a multisig to manage',
            choices: multisigs,
        }
    ];
    return inquirer_1.default.prompt(questions);
});
//# sourceMappingURL=listMultisigs.js.map