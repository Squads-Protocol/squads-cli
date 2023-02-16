"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
exports.default = (function () {
    var questions = [
        {
            name: 'cluster',
            type: 'input',
            message: 'Enter the rpc cluster to use (or enter for mainnet-beta):',
        }
    ];
    return inquirer_1.default.prompt(questions);
});
//# sourceMappingURL=cluster.js.map