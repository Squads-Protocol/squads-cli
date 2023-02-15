"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
exports.default = (function (numMembers) {
    var questions = [
        {
            name: 'threshold',
            type: 'number',
            default: 1,
            message: 'Enter the multisig threshold (or enter for default of 1):',
            validate: function (value, answers) {
                if (value > 0 && value <= numMembers) {
                    try {
                        return true;
                    }
                    catch (_a) {
                        return 'Invalid threshold - must be between 1 and number of members';
                    }
                }
                else {
                    return true;
                }
            }
        }
    ];
    return inquirer_1.default.prompt(questions);
});
//# sourceMappingURL=createThreshold.js.map