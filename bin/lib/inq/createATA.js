"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
var anchor_1 = require("@coral-xyz/anchor");
var chalk_1 = tslib_1.__importDefault(require("chalk"));
var inputATAInq = function (v) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var questions;
    return tslib_1.__generator(this, function (_a) {
        console.log(chalk_1.default.blue("Create an ATA"));
        questions = [
            {
                default: "",
                name: 'mint',
                type: 'input',
                validate: function (value) {
                    if (value.length > 0) {
                        try {
                            new anchor_1.web3.PublicKey(value);
                            return true;
                        }
                        catch (e) {
                            return 'Please enter a valid publicKey (base58)';
                        }
                    }
                    else {
                        return true;
                    }
                },
                message: 'Enter the public key for the mint (base58) for the ATA, or press Enter to go back:',
            },
            {
                default: v.toBase58(),
                name: 'owner',
                type: 'input',
                validate: function (value) {
                    if (value.length > 0) {
                        try {
                            new anchor_1.web3.PublicKey(value);
                            return true;
                        }
                        catch (e) {
                            return 'Please enter a valid publicKey (base58)';
                        }
                    }
                    else {
                        return true;
                    }
                },
                message: 'Enter the public key (base58) for owner of the ATA - default is your vault/authority:',
            },
        ];
        return [2 /*return*/, inquirer_1.default.prompt(questions)];
    });
}); };
exports.default = (function (vault) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var _a, mint, owner;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, inputATAInq(vault)];
            case 1:
                _a = _b.sent(), mint = _a.mint, owner = _a.owner;
                if (mint.length < 1 || owner.length < 1) {
                    return [2 /*return*/, false];
                }
                else {
                    return [2 /*return*/, { mint: mint, owner: owner }];
                }
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=createATA.js.map