"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
exports.default = (function () {
    var questions = [
        {
            default: "",
            name: 'rawIx',
            type: 'input',
            message: 'Enter the serialized Transaction in base58:',
        }
    ];
    return inquirer_1.default.prompt(questions);
});
//# sourceMappingURL=addTransaction.js.map