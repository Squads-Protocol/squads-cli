"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
exports.default = (function () {
    var choices = ["Withdraw"];
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
//# sourceMappingURL=withdraw.js.map