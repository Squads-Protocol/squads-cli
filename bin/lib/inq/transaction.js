"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
exports.default = (function (tx) {
    var choices = [];
    if (tx.status.active) {
        choices = ["Approve", "Reject"];
    }
    if (tx.status.executeReady) {
        choices = ["Execute", "Submit to cancel"];
    }
    if (tx.status.draft) {
        choices = ["Add Instruction"];
        if (tx.instructionIndex > 0) {
            choices.push("Activate");
        }
    }
    choices.push("<- Go back");
    var questions = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: choices,
        }
    ];
    return inquirer_1.default.prompt(questions);
});
//# sourceMappingURL=transaction.js.map