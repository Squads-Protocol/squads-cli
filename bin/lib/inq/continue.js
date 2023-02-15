"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
var inquirer_press_to_continue_1 = tslib_1.__importDefault(require("inquirer-press-to-continue"));
inquirer_1.default.registerPrompt('press-to-continue', inquirer_press_to_continue_1.default);
exports.default = (function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2 /*return*/, inquirer_1.default.prompt({
                name: "key",
                type: 'press-to-continue',
                anyKey: true,
                pressToContinueMessage: 'Press a key to continue...'
            })];
    });
}); });
//# sourceMappingURL=continue.js.map