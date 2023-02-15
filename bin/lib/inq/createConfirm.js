"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
var anchor = tslib_1.__importStar(require("@coral-xyz/anchor"));
exports.default = (function (createKey, members, threshold) {
    console.log("createKey: ", createKey);
    console.log("members:");
    members.forEach(function (m) {
        console.log("  ", m);
    });
    console.log("threshold: ", threshold);
    var questions = [
        {
            default: false,
            name: 'action',
            type: 'confirm',
            message: 'Create the new multisig?',
        }
    ];
    return inquirer_1.default.prompt(questions);
});
//# sourceMappingURL=createConfirm.js.map