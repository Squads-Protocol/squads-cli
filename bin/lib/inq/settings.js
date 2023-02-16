"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
exports.default = (function () {
    var questions = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                "Add a key",
                "Remove a key",
                "Change threshold",
                "<- Go back"
            ],
        }
    ];
    return inquirer_1.default.prompt(questions);
});
//# sourceMappingURL=settings.js.map