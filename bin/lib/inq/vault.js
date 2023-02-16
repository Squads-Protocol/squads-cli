"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
exports.default = (function (_a) {
    var usableTokens = _a.usableTokens, displayTokens = _a.displayTokens;
    var choices = displayTokens.map(function (token, index) {
        return {
            name: "".concat(token.name, " (").concat(token.symbol, ") - ").concat(token.amount),
            value: index
        };
    });
    choices.push("<- Go back");
    var questions = [
        {
            type: 'list',
            name: 'action',
            message: 'Choose an asset',
            choices: choices,
        }
    ];
    return inquirer_1.default.prompt(questions);
});
//# sourceMappingURL=vault.js.map