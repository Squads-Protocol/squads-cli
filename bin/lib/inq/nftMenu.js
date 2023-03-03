"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nftSafeSigningInq = exports.nftValidateOwnerInq = exports.nftUpdateShowFailedMetasInq = exports.nftUpdateShowFailedMintsInq = exports.nftUpdateAuthorityConfirmIncomingInq = exports.nftUpdateAuthorityConfirmInq = exports.nftValidateMetasInq = exports.nftUpdateAuthorityInq = exports.nftMainInq = void 0;
var tslib_1 = require("tslib");
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
var nftMainInq = function () {
    var questions = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                "Update Authority Change",
                "Back",
            ],
        }
    ];
    return inquirer_1.default.prompt(questions);
};
exports.nftMainInq = nftMainInq;
var nftUpdateAuthorityInq = function () {
    var questions = [
        {
            type: 'list',
            name: 'type',
            message: 'What type of authority change?',
            choices: [
                { name: "Move Authority to this multisigs vault", value: 0 },
                { name: "Move authority out of this vault to a different address", value: 1 },
            ],
        },
        {
            when: function (answers) { return answers.type === 1; },
            validate: function (answers) {
                if (!answers.publicKey || answers.publicKey.length < 0) {
                    return true;
                }
                try {
                    new PublicKey(answers.publicKey);
                    return true;
                }
                catch (e) {
                    return false;
                }
            },
            type: 'input',
            name: 'publicKey',
            message: 'Enter the new authority address (base58)',
        },
        {
            type: 'input',
            name: 'mintList',
            message: 'Enter the location of the mint list file (.json)',
        }
    ];
    return inquirer_1.default.prompt(questions);
};
exports.nftUpdateAuthorityInq = nftUpdateAuthorityInq;
var nftValidateMetasInq = function () {
    var questions = [
        {
            type: 'confirm',
            name: 'validate',
            message: 'Do you want to validate the metadata accounts before creating the transactions? This may take a while depending on the number of mints',
        }
    ];
    return inquirer_1.default.prompt(questions);
};
exports.nftValidateMetasInq = nftValidateMetasInq;
var nftUpdateAuthorityConfirmInq = function (newAuthority, numMints, numTransactions) {
    var questions = [
        {
            type: 'confirm',
            name: 'confirm',
            message: "Are you sure you want to change the authority of ".concat(numMints, " mints to ").concat(newAuthority, "? This will create ").concat(numTransactions, " transactions in the multisig."),
        }
    ];
    return inquirer_1.default.prompt(questions);
};
exports.nftUpdateAuthorityConfirmInq = nftUpdateAuthorityConfirmInq;
var nftUpdateAuthorityConfirmIncomingInq = function (newAuthority, numMints) {
    var questions = [
        {
            type: 'confirm',
            name: 'confirm',
            message: "Are you sure you want to change the authority of ".concat(numMints, " mints to the vault at ").concat(newAuthority, "?"),
        }
    ];
    return inquirer_1.default.prompt(questions);
};
exports.nftUpdateAuthorityConfirmIncomingInq = nftUpdateAuthorityConfirmIncomingInq;
var nftUpdateShowFailedMintsInq = function () {
    var questions = [
        {
            type: 'confirm',
            name: 'showFail',
            message: "Show the mint addresses of the accounts we could not validate?",
        }
    ];
    return inquirer_1.default.prompt(questions);
};
exports.nftUpdateShowFailedMintsInq = nftUpdateShowFailedMintsInq;
var nftUpdateShowFailedMetasInq = function () {
    var questions = [
        {
            type: 'confirm',
            name: 'showFail',
            message: "Show the metadata addresses of the accounts we could not validate?",
        }
    ];
    return inquirer_1.default.prompt(questions);
};
exports.nftUpdateShowFailedMetasInq = nftUpdateShowFailedMetasInq;
var nftValidateOwnerInq = function () {
    var questions = [
        {
            type: 'confirm',
            name: 'ownerValidate',
            message: 'Do you want to validate the metadata accounts are valid and have their authorities currently set to the vault? (Recommended)',
        }
    ];
    return inquirer_1.default.prompt(questions);
};
exports.nftValidateOwnerInq = nftValidateOwnerInq;
var nftSafeSigningInq = function () {
    var questions = [
        {
            type: 'confirm',
            name: 'safeSign',
            message: 'Do you want to enforce that the new authority is also a signer? It will require the new authority to be the executor of the multisig transaction. (Recommended)',
        }
    ];
    return inquirer_1.default.prompt(questions);
};
exports.nftSafeSigningInq = nftSafeSigningInq;
//# sourceMappingURL=nftMenu.js.map