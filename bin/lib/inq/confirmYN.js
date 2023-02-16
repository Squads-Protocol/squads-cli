"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
exports.default = (function (message, defaultVal) {
    if (defaultVal === void 0) { defaultVal = false; }
    return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, inquirer_1.default.prompt({ default: defaultVal, name: 'yes', type: 'confirm', message: message })];
        });
    });
});
//# sourceMappingURL=confirmYN.js.map