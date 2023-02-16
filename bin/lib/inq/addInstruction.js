"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
var anchor_1 = require("@coral-xyz/anchor");
var bs58_1 = tslib_1.__importDefault(require("bs58"));
var inputProgramIdInq = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var questions;
    return tslib_1.__generator(this, function (_a) {
        questions = [
            {
                default: "",
                name: 'programId',
                type: 'input',
                message: 'Enter the base58 program ID that this instruction will invoke:',
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
                }
            },
        ];
        return [2 /*return*/, inquirer_1.default.prompt(questions)];
    });
}); };
var inputAccountInq = function (ind) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var questions;
    return tslib_1.__generator(this, function (_a) {
        console.log("Adding account [".concat(ind, "] to the instruction:"));
        questions = [
            {
                default: "",
                name: 'key',
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
                message: 'Enter the base58 account public key for this instruction:',
            },
            {
                default: 'no',
                name: 'isWritable',
                choices: ['yes', 'no'],
                type: 'list',
                message: 'Is writable?:',
            },
            {
                default: 'no',
                name: 'isSigner',
                choices: ['yes', 'no'],
                type: 'list',
                message: 'Is signer?:',
            },
        ];
        return [2 /*return*/, inquirer_1.default.prompt(questions)];
    });
}); };
var inputDataInq = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var questions;
    return tslib_1.__generator(this, function (_a) {
        questions = [
            {
                default: "",
                name: 'data',
                type: 'input',
                message: 'Enter the data buffer serialized in base58:',
            },
        ];
        return [2 /*return*/, inquirer_1.default.prompt(questions)];
    });
}); };
var moreAccountsInq = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var questions;
    return tslib_1.__generator(this, function (_a) {
        questions = [
            {
                default: "yes",
                name: 'yes',
                type: 'confirm',
                message: 'Add another account to the instruction?',
            },
        ];
        return [2 /*return*/, inquirer_1.default.prompt(questions)];
    });
}); };
exports.default = (function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var programId, accounts, moreAccounts, account, more, data;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, inputProgramIdInq()];
            case 1:
                programId = (_a.sent()).programId;
                if (programId.length === 0) {
                    return [2 /*return*/, false];
                }
                accounts = [];
                moreAccounts = true;
                _a.label = 2;
            case 2:
                if (!moreAccounts) return [3 /*break*/, 5];
                return [4 /*yield*/, inputAccountInq(accounts.length)];
            case 3:
                account = _a.sent();
                accounts.push(account);
                return [4 /*yield*/, moreAccountsInq()];
            case 4:
                more = _a.sent();
                moreAccounts = more.yes;
                return [3 /*break*/, 2];
            case 5: return [4 /*yield*/, inputDataInq()];
            case 6:
                data = (_a.sent()).data;
                return [2 /*return*/, {
                        programId: new anchor_1.web3.PublicKey(programId),
                        keys: accounts.map(function (a) {
                            return {
                                pubkey: new anchor_1.web3.PublicKey(a.key),
                                isWritable: a.isWritable === 'yes',
                                isSigner: a.isSigner === 'yes',
                            };
                        }),
                        data: anchor_1.utils.bytes.bs58.decode(data),
                    }];
        }
    });
}); });
//# sourceMappingURL=addInstruction.js.map