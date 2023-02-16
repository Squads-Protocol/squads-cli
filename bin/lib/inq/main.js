"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
exports.default = (function () {
    var questions = [
        {
            type: 'list',
            name: 'action',
            message: 'Welcome to SQUADS - what would you like to do?',
            choices: [
                "View my Multisigs",
                "Create a new Multisig",
                "Exit",
            ],
        }
    ];
    return inquirer_1.default.prompt(questions);
});
//# sourceMappingURL=main.js.map