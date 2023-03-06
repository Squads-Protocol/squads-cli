"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var chalk_1 = tslib_1.__importDefault(require("chalk"));
var clear_1 = tslib_1.__importDefault(require("clear"));
var figlet_1 = tslib_1.__importDefault(require("figlet"));
var inquirer_1 = tslib_1.__importDefault(require("inquirer"));
var anchor = tslib_1.__importStar(require("@coral-xyz/anchor"));
var clui_1 = tslib_1.__importDefault(require("clui"));
require("console.table");
var sdk_1 = require("@sqds/sdk");
var constants_js_1 = require("./constants.js");
var bn_js_1 = tslib_1.__importDefault(require("bn.js"));
var web3_js_1 = require("@solana/web3.js");
var index_js_1 = require("./inq/index.js");
var api_js_1 = tslib_1.__importDefault(require("./api.js"));
var utils_js_1 = require("./utils.js");
var nfts_js_1 = require("./nfts.js");
var metadataInstructions_js_1 = require("./metadataInstructions.js");
var Spinner = clui_1.default.Spinner;
var Progress = clui_1.default.Progress;
var Menu = /** @class */ (function () {
    function Menu(wallet, connection, programId, programManagerId, txMetaProgramId) {
        var _this = this;
        this.multisigs = [];
        this.header = function (vault) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                (0, clear_1.default)();
                console.log("ProgramId: ".concat(this.programId.toBase58()));
                console.log(chalk_1.default.yellow(figlet_1.default.textSync('SQUADS', { font: "Slant", horizontalLayout: 'full' })));
                console.log(chalk_1.default.blue("Connected wallet: ") + chalk_1.default.white(this.wallet.publicKey.toBase58()));
                if (vault) {
                    try {
                        console.log(chalk_1.default.blue("Vault address: ") + chalk_1.default.white(vault.toBase58()));
                    }
                    catch (e) {
                        // bad vault obj
                    }
                }
                console.log("");
                return [2 /*return*/];
            });
        }); };
        this.multisigList = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var loadAuthorities, spinner, _a, testList, dIndex, action, chosenMultisig, error_1;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        loadAuthorities = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return tslib_1.__generator(this, function (_a) {
                                return [2 /*return*/, Promise.all(ms.map(function (msObj, i) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                        var mAuth;
                                        return tslib_1.__generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(msObj.publicKey, new bn_js_1.default(1), this.api.programId)];
                                                case 1:
                                                    mAuth = (_a.sent())[0];
                                                    return [2 /*return*/, {
                                                            value: i,
                                                            name: "".concat(mAuth.toBase58(), " (").concat((0, utils_js_1.shortenTextEnd)(msObj.publicKey.toBase58(), 6), ")"),
                                                            short: (0, utils_js_1.shortenTextEnd)(mAuth.toBase58(), 6)
                                                        }];
                                            }
                                        });
                                    }); }))];
                            });
                        }); };
                        this.header();
                        spinner = new Spinner("Loading multisigs...");
                        spinner.start();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 7]);
                        _a = this;
                        return [4 /*yield*/, this.api.getSquads(this.wallet.publicKey)];
                    case 2:
                        _a.multisigs = _b.sent();
                        spinner.stop();
                        return [4 /*yield*/, loadAuthorities(this.multisigs)];
                    case 3:
                        testList = _b.sent();
                        dIndex = testList.length;
                        testList.push({ name: "<- Go back", value: dIndex, short: "Go back" });
                        return [4 /*yield*/, (0, index_js_1.viewMultisigsMenu)(testList, dIndex)];
                    case 4:
                        action = (_b.sent()).action;
                        if (action === dIndex) {
                            this.top();
                        }
                        else {
                            chosenMultisig = this.multisigs[action];
                            this.multisig(chosenMultisig);
                        }
                        return [3 /*break*/, 7];
                    case 5:
                        error_1 = _b.sent();
                        spinner.stop();
                        console.log(error_1);
                        console.log("Try restarting the cli using a different Solana cluster");
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 6:
                        _b.sent();
                        this.top();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        this.multisig = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var vault, action, status_1, vaultPDA, vault_1, status_2, txs;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, new bn_js_1.default(1), this.api.programId)];
                    case 1:
                        vault = (_a.sent())[0];
                        this.header(vault);
                        console.log("Info");
                        console.log("-----------------------------------------------------------");
                        console.log("(" + chalk_1.default.red("DO NOT") + " send assets to this address. Use ONLY vault address shown above)");
                        console.log("Multisig account: " + chalk_1.default.white(ms.publicKey.toBase58()));
                        console.log(" ");
                        return [4 /*yield*/, (0, index_js_1.multisigMainMenu)(ms)];
                    case 2:
                        action = (_a.sent()).action;
                        if (!(action === "Vault")) return [3 /*break*/, 5];
                        status_1 = new Spinner("Loading vault");
                        status_1.start();
                        return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, new bn_js_1.default(1), this.api.programId)];
                    case 3:
                        vaultPDA = (_a.sent())[0];
                        return [4 /*yield*/, this.api.getVaultAssets(vaultPDA)];
                    case 4:
                        vault_1 = _a.sent();
                        status_1.stop();
                        this.vault(ms, vaultPDA, vault_1);
                        return [3 /*break*/, 9];
                    case 5:
                        if (!(action === "Settings")) return [3 /*break*/, 6];
                        this.settings(ms);
                        return [3 /*break*/, 9];
                    case 6:
                        if (!(action === "Transactions")) return [3 /*break*/, 8];
                        status_2 = new Spinner("Loading transactions...");
                        status_2.start();
                        return [4 /*yield*/, this.api.getTransactions(ms)];
                    case 7:
                        txs = _a.sent();
                        status_2.stop();
                        this.transactions(txs, ms);
                        return [3 /*break*/, 9];
                    case 8:
                        if (action === "Create new Transaction") {
                            this.createTransaction(ms);
                        }
                        else if (action === "Program Authority Transfer") {
                            this.program(ms);
                        }
                        else if (action === "Create new ATA") {
                            this.ata(ms);
                        }
                        else if (action === "Bulk NFT Operations") {
                            this.nfts(ms);
                        }
                        else {
                            this.multisigList();
                        }
                        _a.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        this.transactions = function (txs, ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var vault, action, txKey_1, tx;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, new bn_js_1.default(1), this.api.programId)];
                    case 1:
                        vault = (_a.sent())[0];
                        this.header(vault);
                        return [4 /*yield*/, (0, index_js_1.transactionsMenu)(txs, this.wallet.publicKey)];
                    case 2:
                        action = (_a.sent()).action;
                        if (action === "<- Go back") {
                            this.multisig(ms);
                        }
                        else {
                            txKey_1 = action.split(" ")[0];
                            tx = txs.find(function (t) { return t.publicKey.toBase58() === txKey_1; });
                            this.transaction(tx, ms, txs);
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.createTransaction = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var assemble, authority, authorityBN, authorityPDA, status_3, yes, tx, txs, authority, authorityBN, authorityPDA, rawIx, status_4, status2, txBuffer, rawTxMessage, tx, ixes, yes, tx_1, i, ix, txs, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer_1.default.prompt({
                            default: "",
                            name: 'assemble',
                            type: 'list',
                            choices: ["Enter Transaction (base58 serialized message)", "Assemble Transaction (create draft)", "<- Go back"],
                            message: 'How do you want to create the transaction?',
                        })];
                    case 1:
                        assemble = (_a.sent()).assemble;
                        if (!(assemble.indexOf("Assemble") == 0)) return [3 /*break*/, 10];
                        return [4 /*yield*/, (0, index_js_1.createTransactionInq)()];
                    case 2:
                        authority = (_a.sent()).authority;
                        authorityBN = new bn_js_1.default(authority, 10);
                        return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, authorityBN, this.api.programId)];
                    case 3:
                        authorityPDA = (_a.sent())[0];
                        status_3 = new Spinner("Creating transaction...");
                        console.log("This will create a new transaction draft for authority " + chalk_1.default.blue(authorityPDA.toBase58()));
                        return [4 /*yield*/, (0, index_js_1.basicConfirm)("Continue?", false)];
                    case 4:
                        yes = (_a.sent()).yes;
                        if (!yes) return [3 /*break*/, 8];
                        status_3.start();
                        return [4 /*yield*/, this.api.createTransaction(ms.publicKey, parseInt(authority, 10))];
                    case 5:
                        tx = _a.sent();
                        status_3.stop();
                        console.log("Transaction created!");
                        console.log("Transaction key: " + chalk_1.default.blue(tx.publicKey.toBase58()));
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.api.getTransactions(ms)];
                    case 7:
                        txs = _a.sent();
                        this.transactions(txs, ms);
                        return [3 /*break*/, 9];
                    case 8:
                        this.multisig(ms);
                        _a.label = 9;
                    case 9: return [3 /*break*/, 31];
                    case 10:
                        if (!(assemble.indexOf("Enter") == 0)) return [3 /*break*/, 30];
                        return [4 /*yield*/, (0, index_js_1.createTransactionInq)()];
                    case 11:
                        authority = (_a.sent()).authority;
                        authorityBN = new bn_js_1.default(authority, 10);
                        return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, authorityBN, this.api.programId)];
                    case 12:
                        authorityPDA = (_a.sent())[0];
                        return [4 /*yield*/, (0, index_js_1.addTransactionInq)()];
                    case 13:
                        rawIx = (_a.sent()).rawIx;
                        if (!(rawIx.length > 1)) return [3 /*break*/, 28];
                        status_4 = new Spinner("Creating transaction...");
                        status2 = new Spinner("Adding instruction...");
                        _a.label = 14;
                    case 14:
                        _a.trys.push([14, 25, , 27]);
                        txBuffer = anchor.utils.bytes.bs58.decode(rawIx);
                        (0, clear_1.default)();
                        this.header();
                        rawTxMessage = anchor.web3.Message.from(txBuffer);
                        tx = anchor.web3.Transaction.populate(rawTxMessage);
                        ixes = tx.instructions;
                        console.log("This will create a new multisig transaction for authority/signer " + chalk_1.default.blue(authorityPDA.toBase58()));
                        return [4 /*yield*/, (0, index_js_1.basicConfirm)("Create a transaction with ".concat(ixes.length, " instructions?"), false)];
                    case 15:
                        yes = (_a.sent()).yes;
                        if (!yes) return [3 /*break*/, 23];
                        status_4.start();
                        return [4 /*yield*/, this.api.createTransaction(ms.publicKey, parseInt(authority, 10))];
                    case 16:
                        tx_1 = _a.sent();
                        status_4.stop();
                        console.log("Transaction ".concat(tx_1.publicKey.toBase58(), " created!"));
                        i = 0;
                        _a.label = 17;
                    case 17:
                        if (!(i < ixes.length)) return [3 /*break*/, 20];
                        console.log("attaching instruction ".concat(i + 1, "/").concat(ixes.length));
                        status2.start();
                        ix = ixes[i];
                        return [4 /*yield*/, this.api.addInstruction(tx_1.publicKey, ix)];
                    case 18:
                        _a.sent();
                        status2.stop();
                        _a.label = 19;
                    case 19:
                        i++;
                        return [3 /*break*/, 17];
                    case 20:
                        console.log("Transaction created!");
                        // console.log("Transaction key: " + chalk.blue(tx.publicKey.toBase58()));
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 21:
                        // console.log("Transaction key: " + chalk.blue(tx.publicKey.toBase58()));
                        _a.sent();
                        return [4 /*yield*/, this.api.getTransactions(ms)];
                    case 22:
                        txs = _a.sent();
                        this.transactions(txs, ms);
                        return [3 /*break*/, 24];
                    case 23:
                        this.multisig(ms);
                        _a.label = 24;
                    case 24: return [3 /*break*/, 27];
                    case 25:
                        e_1 = _a.sent();
                        console.log("Error", e_1);
                        status_4.stop();
                        status2.stop();
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 26:
                        _a.sent();
                        this.multisig(ms);
                        return [3 /*break*/, 27];
                    case 27: return [3 /*break*/, 29];
                    case 28:
                        this.multisig(ms);
                        _a.label = 29;
                    case 29: return [3 /*break*/, 31];
                    case 30:
                        this.multisig(ms);
                        _a.label = 31;
                    case 31: return [2 /*return*/];
                }
            });
        }); };
        this.transaction = function (tx, ms, txs) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var vault, authority, txData, action, yes, status_5, updatedTx_1, newInd, e_2, yes, status_6, updatedTx_2, newInd, updatedMs, e_3, ix, yes, newTx, status_7, e_4, yes, status_8, updatedTx_3, newInd, e_5;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, new bn_js_1.default(1), this.api.programId)];
                    case 1:
                        vault = (_a.sent())[0];
                        this.header(vault);
                        return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, new bn_js_1.default(tx.authorityIndex, 10), this.api.programId)];
                    case 2:
                        authority = (_a.sent())[0];
                        txData = [
                            {
                                status: Object.keys(tx.status)[0],
                                authority: authority.toBase58(),
                                approved: tx.approved.length,
                                rejected: tx.rejected.length,
                                instructions: tx.instructionIndex
                            }
                        ];
                        console.table(txData);
                        if (tx.status.active) {
                            console.log(chalk_1.default.red("Be sure to review all transaction instructions before approving or executing!"));
                        }
                        console.log("View on the web:");
                        console.log(chalk_1.default.yellow("https://explorer.solana.com/address/" + tx.publicKey.toBase58()));
                        console.log("");
                        return [4 /*yield*/, (0, index_js_1.transactionPrompt)(tx)];
                    case 3:
                        action = (_a.sent()).action;
                        if (!(action === "<- Go back")) return [3 /*break*/, 4];
                        this.transactions(txs, ms);
                        return [3 /*break*/, 49];
                    case 4:
                        if (!(action === "Approve")) return [3 /*break*/, 14];
                        return [4 /*yield*/, (0, index_js_1.basicConfirm)("Approve this transaction?", false)];
                    case 5:
                        yes = (_a.sent()).yes;
                        if (!yes) return [3 /*break*/, 12];
                        status_5 = new Spinner("Approving transaction...");
                        status_5.start();
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 9, , 11]);
                        return [4 /*yield*/, this.api.approveTransaction(tx.publicKey)];
                    case 7:
                        updatedTx_1 = _a.sent();
                        status_5.stop();
                        newInd = txs.findIndex(function (t) { return t.publicKey.toBase58() === updatedTx_1.publicKey.toBase58(); });
                        txs.splice(newInd, 1, updatedTx_1);
                        console.log("Transaction approved");
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 8:
                        _a.sent();
                        this.transaction(updatedTx_1, ms, txs);
                        return [3 /*break*/, 11];
                    case 9:
                        e_2 = _a.sent();
                        status_5.stop();
                        console.log("Error!", e_2);
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 10:
                        _a.sent();
                        this.transaction(tx, ms, txs);
                        return [3 /*break*/, 11];
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        this.transaction(tx, ms, txs);
                        _a.label = 13;
                    case 13: return [3 /*break*/, 49];
                    case 14:
                        if (!(action === "Execute")) return [3 /*break*/, 25];
                        return [4 /*yield*/, (0, index_js_1.basicConfirm)("Execute this transaction?", false)];
                    case 15:
                        yes = (_a.sent()).yes;
                        if (!yes) return [3 /*break*/, 23];
                        status_6 = new Spinner("Executing transaction...");
                        status_6.start();
                        _a.label = 16;
                    case 16:
                        _a.trys.push([16, 20, , 22]);
                        return [4 /*yield*/, this.api.executeTransaction(tx.publicKey)];
                    case 17:
                        updatedTx_2 = _a.sent();
                        status_6.stop();
                        newInd = txs.findIndex(function (t) { return t.publicKey.toBase58() === updatedTx_2.publicKey.toBase58(); });
                        txs.splice(newInd, 1, updatedTx_2);
                        console.log("Transaction executed");
                        return [4 /*yield*/, this.api.squads.getMultisig(ms.publicKey)];
                    case 18:
                        updatedMs = _a.sent();
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 19:
                        _a.sent();
                        this.transaction(updatedTx_2, updatedMs, txs);
                        return [3 /*break*/, 22];
                    case 20:
                        e_3 = _a.sent();
                        status_6.stop();
                        console.log(JSON.stringify(e_3));
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 21:
                        _a.sent();
                        this.transaction(tx, ms, txs);
                        return [3 /*break*/, 22];
                    case 22: return [3 /*break*/, 24];
                    case 23:
                        this.transaction(tx, ms, txs);
                        _a.label = 24;
                    case 24: return [3 /*break*/, 49];
                    case 25:
                        if (!(action === "Add Instruction")) return [3 /*break*/, 38];
                        return [4 /*yield*/, (0, index_js_1.addInstructionInq)()];
                    case 26:
                        ix = _a.sent();
                        if (!(ix && ix.programId)) return [3 /*break*/, 36];
                        (0, clear_1.default)();
                        this.header();
                        console.log("ProgramId: " + chalk_1.default.blue(ix.programId.toBase58()));
                        console.log("Data: ", ix.data);
                        console.table(ix.keys.map(function (a) {
                            return {
                                "Account": a.pubkey.toBase58(),
                                "Is signer": a.isSigner,
                                "Is writable": a.isWritable,
                            };
                        }));
                        return [4 /*yield*/, (0, index_js_1.basicConfirm)("Add this instruction?", false)];
                    case 27:
                        yes = (_a.sent()).yes;
                        if (!yes) return [3 /*break*/, 35];
                        newTx = tx;
                        status_7 = new Spinner("Adding instruction...");
                        status_7.start();
                        _a.label = 28;
                    case 28:
                        _a.trys.push([28, 32, , 34]);
                        return [4 /*yield*/, this.api.addInstruction(tx.publicKey, ix)];
                    case 29:
                        _a.sent();
                        return [4 /*yield*/, this.api.squads.getTransaction(tx.publicKey)];
                    case 30:
                        newTx = _a.sent();
                        status_7.stop();
                        console.log("Instruction added!");
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 31:
                        _a.sent();
                        return [3 /*break*/, 34];
                    case 32:
                        e_4 = _a.sent();
                        status_7.stop();
                        console.log(e_4);
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 33:
                        _a.sent();
                        this.transaction(tx, ms, txs);
                        return [3 /*break*/, 34];
                    case 34:
                        this.transaction(newTx, ms, txs);
                        _a.label = 35;
                    case 35: return [3 /*break*/, 37];
                    case 36:
                        this.transaction(tx, ms, txs);
                        _a.label = 37;
                    case 37: return [3 /*break*/, 49];
                    case 38:
                        if (!(action === "Activate")) return [3 /*break*/, 48];
                        return [4 /*yield*/, (0, index_js_1.basicConfirm)("Activate this transaction?", false)];
                    case 39:
                        yes = (_a.sent()).yes;
                        if (!yes) return [3 /*break*/, 46];
                        status_8 = new Spinner("Activating transaction...");
                        status_8.start();
                        _a.label = 40;
                    case 40:
                        _a.trys.push([40, 43, , 45]);
                        return [4 /*yield*/, this.api.activate(tx.publicKey)];
                    case 41:
                        updatedTx_3 = _a.sent();
                        status_8.stop();
                        newInd = txs.findIndex(function (t) { return t.publicKey.toBase58() === updatedTx_3.publicKey.toBase58(); });
                        txs.splice(newInd, 1, updatedTx_3);
                        console.log("Activated Transaction");
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 42:
                        _a.sent();
                        this.transaction(updatedTx_3, ms, txs);
                        return [3 /*break*/, 45];
                    case 43:
                        e_5 = _a.sent();
                        status_8.stop();
                        console.log("Error!", e_5);
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 44:
                        _a.sent();
                        this.transaction(tx, ms, txs);
                        return [3 /*break*/, 45];
                    case 45: return [3 /*break*/, 47];
                    case 46:
                        this.transaction(tx, ms, txs);
                        _a.label = 47;
                    case 47: return [3 /*break*/, 49];
                    case 48:
                        this.transaction(tx, ms, txs);
                        _a.label = 49;
                    case 49: return [2 /*return*/];
                }
            });
        }); };
        this.vault = function (ms, vaultPDA, vd) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.header();
                        console.log("Vault Address: " + chalk_1.default.blue(vaultPDA.toBase58()));
                        console.table(vd.displayTokens);
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 1:
                        _a.sent();
                        this.multisig(ms);
                        return [2 /*return*/];
                }
            });
        }); };
        this.useAsset = function (ms, asset) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                this.header();
                return [2 /*return*/];
            });
        }); };
        this.settings = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var vault, owners, action;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, new bn_js_1.default(1, 10), this.api.programId)];
                    case 1:
                        vault = (_a.sent())[0];
                        this.header(vault);
                        owners = ms.keys.map(function (m) {
                            return m.toBase58();
                        });
                        console.table([{ "Owners": owners }]);
                        console.table([{
                                "Threshold": ms.threshold,
                                "Members": ms.keys.length,
                                "Vault (Default Authority 1)": vault,
                            }]);
                        return [4 /*yield*/, (0, index_js_1.multisigSettingsMenu)()];
                    case 2:
                        action = (_a.sent()).action;
                        if (action === "Add a key") {
                            this.addKey(ms);
                        }
                        else if (action === "Remove a key") {
                            this.removeKey(ms);
                        }
                        else if (action === "Change threshold") {
                            this.changeThreshold(ms);
                        }
                        else {
                            this.multisig(ms);
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.addKey = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var memberKey, yes, newKey, status_9, newMs, e_6;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer_1.default.prompt({ default: "", name: 'memberKey', type: 'input', message: "Enter the public key of the member you want to add (base58):" })];
                    case 1:
                        memberKey = (_a.sent()).memberKey;
                        if (!(memberKey === "")) return [3 /*break*/, 2];
                        this.settings(ms);
                        return [3 /*break*/, 12];
                    case 2: return [4 /*yield*/, (0, index_js_1.basicConfirm)("Create transaction to add ".concat(memberKey, "?"), false)];
                    case 3:
                        yes = (_a.sent()).yes;
                        newKey = new web3_js_1.PublicKey(memberKey);
                        if (!yes) return [3 /*break*/, 11];
                        status_9 = new Spinner("Creating New Member Transaction...");
                        status_9.start();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 8, , 10]);
                        return [4 /*yield*/, this.api.addKeyTransaction(ms.publicKey, newKey)];
                    case 5:
                        _a.sent();
                        status_9.stop();
                        console.log("Transaction created!");
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.api.squads.getMultisig(ms.publicKey)];
                    case 7:
                        newMs = _a.sent();
                        this.multisig(newMs);
                        return [3 /*break*/, 10];
                    case 8:
                        e_6 = _a.sent();
                        status_9.stop();
                        console.log("Error!", e_6);
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 9:
                        _a.sent();
                        this.settings(ms);
                        return [3 /*break*/, 10];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        this.addKey(ms);
                        _a.label = 12;
                    case 12: return [2 /*return*/];
                }
            });
        }); };
        this.removeKey = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var choices, memberKey, yes, status_10, exKey, newMs, e_7;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.header();
                        choices = ms.keys.map(function (k) { return k.toBase58(); });
                        choices.push("<- Go back");
                        return [4 /*yield*/, inquirer_1.default.prompt({ choices: choices, name: 'memberKey', type: 'list', message: "Which key do you want to remove?" })];
                    case 1:
                        memberKey = (_a.sent()).memberKey;
                        if (!(memberKey === "<- Go back")) return [3 /*break*/, 2];
                        this.settings(ms);
                        return [3 /*break*/, 12];
                    case 2: return [4 /*yield*/, (0, index_js_1.basicConfirm)("Create transaction to remove ".concat(memberKey, "?"), false)];
                    case 3:
                        yes = (_a.sent()).yes;
                        if (!yes) return [3 /*break*/, 11];
                        status_10 = new Spinner("Creating Remove Member Transaction...");
                        status_10.start();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 8, , 10]);
                        exKey = new web3_js_1.PublicKey(memberKey);
                        return [4 /*yield*/, this.api.removeKeyTransaction(ms.publicKey, exKey)];
                    case 5:
                        _a.sent();
                        status_10.stop();
                        return [4 /*yield*/, this.api.squads.getMultisig(ms.publicKey)];
                    case 6:
                        newMs = _a.sent();
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 7:
                        _a.sent();
                        this.multisig(newMs);
                        return [3 /*break*/, 10];
                    case 8:
                        e_7 = _a.sent();
                        status_10.stop();
                        console.log("Error!", e_7);
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 9:
                        _a.sent();
                        this.settings(ms);
                        return [3 /*break*/, 10];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        this.removeKey(ms);
                        _a.label = 12;
                    case 12: return [2 /*return*/];
                }
            });
        }); };
        this.changeThreshold = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var choices, threshold, yes, status_11, newMs, e_8;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.header();
                        choices = ms.keys.map(function (k) { return k.toBase58(); });
                        choices.push("<- Go back");
                        return [4 /*yield*/, inquirer_1.default.prompt({
                                default: "",
                                name: 'threshold',
                                type: 'input',
                                message: "Enter the new proposed threshold",
                                validate: function (t) {
                                    if (parseInt(t, 10) > ms.keys.length) {
                                        return "Threshold cannot be greater than the number of members";
                                    }
                                    else {
                                        return true;
                                    }
                                }
                            })];
                    case 1:
                        threshold = (_a.sent()).threshold;
                        if (!(threshold === "")) return [3 /*break*/, 2];
                        this.settings(ms);
                        return [3 /*break*/, 12];
                    case 2: return [4 /*yield*/, (0, index_js_1.basicConfirm)("Create transaction to change threshold to ".concat(threshold, "?"), false)];
                    case 3:
                        yes = (_a.sent()).yes;
                        if (!yes) return [3 /*break*/, 11];
                        status_11 = new Spinner("Creating Change Threshold Transaction...");
                        status_11.start();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 8, , 10]);
                        return [4 /*yield*/, this.api.changeThresholdTransaction(ms.publicKey, threshold)];
                    case 5:
                        _a.sent();
                        status_11.stop();
                        return [4 /*yield*/, this.api.squads.getMultisig(ms.publicKey)];
                    case 6:
                        newMs = _a.sent();
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 7:
                        _a.sent();
                        this.multisig(newMs);
                        return [3 /*break*/, 10];
                    case 8:
                        e_8 = _a.sent();
                        status_11.stop();
                        console.log("Error!", e_8);
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 9:
                        _a.sent();
                        this.settings(ms);
                        return [3 /*break*/, 10];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        this.settings(ms);
                        _a.label = 12;
                    case 12: return [2 /*return*/];
                }
            });
        }); };
        this.top = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var action;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.header();
                        return [4 /*yield*/, (0, index_js_1.mainMenu)()];
                    case 1:
                        action = (_a.sent()).action;
                        if (action === 'View my Multisigs') {
                            this.multisigList();
                        }
                        else if (action === 'Create a new Multisig') {
                            this.create();
                        }
                        else {
                            (0, clear_1.default)();
                            chalk_1.default.blue("Goodbye!");
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.program = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var programId, status_12, programAuthority, e_9;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.header();
                        return [4 /*yield*/, (0, index_js_1.promptProgramId)()];
                    case 1:
                        programId = (_a.sent()).programId;
                        if (!(programId.length < 1)) return [3 /*break*/, 2];
                        this.multisig(ms);
                        return [3 /*break*/, 10];
                    case 2:
                        status_12 = new Spinner('Fetching program data...');
                        status_12.start();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 8, , 10]);
                        return [4 /*yield*/, this.api.getProgramDataAuthority(new anchor.web3.PublicKey(programId))];
                    case 4:
                        programAuthority = _a.sent();
                        chalk_1.default.blue("Current program data authority: " + programAuthority);
                        status_12.stop();
                        if (!(programAuthority !== this.wallet.publicKey.toBase58())) return [3 /*break*/, 6];
                        return [4 /*yield*/, inquirer_1.default.prompt({ default: false, name: 'action', type: 'input', message: "Connected wallet does not have authority over this program - Enter to continue" })];
                    case 5:
                        _a.sent();
                        this.program(ms);
                        return [3 /*break*/, 7];
                    case 6:
                        this.programAuthority(ms, programAuthority, programId);
                        _a.label = 7;
                    case 7: return [3 /*break*/, 10];
                    case 8:
                        e_9 = _a.sent();
                        console.log(e_9);
                        status_12.stop();
                        console.log('Program data authority not found');
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 9:
                        _a.sent();
                        this.program(ms);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); };
        this.programAuthority = function (ms, currentAuthority, programId) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var vault, action, status_13, tx, e_10;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, new bn_js_1.default(1), this.api.programId)];
                    case 1:
                        vault = (_a.sent())[0];
                        this.header(vault);
                        console.log("This will create a safe upgrade authority transfer transaction of ".concat(programId, " to the Squad vault"));
                        console.log("Program Address: " + chalk_1.default.blue("".concat(programId)));
                        console.log("Multisig Address: " + chalk_1.default.white("".concat(ms.publicKey.toBase58())));
                        console.log("Current Program Authority: " + chalk_1.default.white("".concat(currentAuthority)));
                        console.log("New Program Upgrade Authority: " + chalk_1.default.green(vault.toBase58()) + chalk_1.default.white(" (Vault - authority index 1)"));
                        return [4 /*yield*/, inquirer_1.default.prompt({ default: false, name: 'action', type: 'confirm', message: "Continue?" })];
                    case 2:
                        action = (_a.sent()).action;
                        if (!action) return [3 /*break*/, 9];
                        status_13 = new Spinner('Creating transaction...');
                        status_13.start();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 8]);
                        return [4 /*yield*/, this.api.createSafeAuthorityTx(ms.publicKey, new web3_js_1.PublicKey(programId), new web3_js_1.PublicKey(currentAuthority), vault)];
                    case 4:
                        tx = _a.sent();
                        status_13.stop();
                        console.log(chalk_1.default.green("Transaction created!"));
                        console.log(chalk_1.default.blue("Transaction ID: ") + chalk_1.default.white(tx));
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 5:
                        _a.sent();
                        this.multisig(ms);
                        return [3 /*break*/, 8];
                    case 6:
                        e_10 = _a.sent();
                        console.log(e_10);
                        status_13.stop();
                        console.log("Transaction creation failed - Enter to continue");
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 7:
                        _a.sent();
                        this.program(ms);
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        this.program(ms);
                        _a.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        }); };
        this.create = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var initKey, createKey, members, member, newMember, member_1, threshold, action, createMembers, status_14, ms, e_11;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.header();
                        initKey = anchor.web3.Keypair.generate().publicKey.toBase58();
                        return [4 /*yield*/, (0, index_js_1.createMultisigCreateKeyInq)()];
                    case 1:
                        createKey = (_a.sent()).createKey;
                        if (createKey.length > 0) {
                            initKey = createKey;
                        }
                        members = [];
                        return [4 /*yield*/, (0, index_js_1.createMultisigMemberInq)()];
                    case 2:
                        member = (_a.sent()).member;
                        newMember = member;
                        _a.label = 3;
                    case 3:
                        if (!(newMember !== "")) return [3 /*break*/, 5];
                        if (members.indexOf("newMember") < 0) {
                            members.push(newMember);
                        }
                        return [4 /*yield*/, (0, index_js_1.createMultisigMemberInq)()];
                    case 4:
                        member_1 = (_a.sent()).member;
                        newMember = member_1;
                        return [3 /*break*/, 3];
                    case 5: return [4 /*yield*/, (0, index_js_1.createMultisigThresholdInq)()];
                    case 6:
                        threshold = (_a.sent()).threshold;
                        return [4 /*yield*/, (0, index_js_1.createMultisigConfirmInq)(initKey, members, threshold)];
                    case 7:
                        action = (_a.sent()).action;
                        if (!action) return [3 /*break*/, 14];
                        createMembers = members.map(function (m) { return new anchor.web3.PublicKey(m); });
                        createMembers.push(this.wallet.publicKey);
                        status_14 = new Spinner("Creating multisig...");
                        status_14.start();
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 11, , 13]);
                        return [4 /*yield*/, this.api.createMultisig(threshold, new anchor.web3.PublicKey(initKey), createMembers)];
                    case 9:
                        ms = _a.sent();
                        status_14.stop();
                        console.log("Created new multisig! (".concat(ms.publicKey.toBase58(), ")"));
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 10:
                        _a.sent();
                        // const squads = await this.api.getSquads(this.wallet.publicKey);
                        // this.multisigs = squads;
                        this.multisigs.push(ms);
                        this.multisig(ms);
                        return [3 /*break*/, 13];
                    case 11:
                        e_11 = _a.sent();
                        status_14.stop();
                        console.log("Error! (".concat(e_11, ")"));
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 12:
                        _a.sent();
                        this.top();
                        return [3 /*break*/, 13];
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        this.top();
                        _a.label = 15;
                    case 15: return [2 /*return*/];
                }
            });
        }); };
        this.ata = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var vault, ataKeys, yes, status_15, newATA, e_12;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, clear_1.default)();
                        return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, new bn_js_1.default(1), this.api.programId)];
                    case 1:
                        vault = (_a.sent())[0];
                        this.header(vault);
                        return [4 /*yield*/, (0, index_js_1.createATAInq)(vault)];
                    case 2:
                        ataKeys = _a.sent();
                        if (!ataKeys) return [3 /*break*/, 9];
                        return [4 /*yield*/, (0, index_js_1.basicConfirm)("Create new ATA for mint ".concat(ataKeys.mint, " and owner ").concat(ataKeys.owner, " ?"))];
                    case 3:
                        yes = (_a.sent()).yes;
                        if (!yes) return [3 /*break*/, 9];
                        status_15 = new Spinner("Creating ATA...");
                        status_15.start();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 7, , 9]);
                        return [4 /*yield*/, this.api.createATA(new web3_js_1.PublicKey(ataKeys.mint), new web3_js_1.PublicKey(ataKeys.owner))];
                    case 5:
                        newATA = _a.sent();
                        status_15.stop();
                        console.log("Successfully created new ATA at: " + chalk_1.default.green(newATA.toBase58()));
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        e_12 = _a.sent();
                        status_15.stop();
                        console.log("Error! (".concat(e_12, ")"));
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 9:
                        this.multisig(ms);
                        return [2 /*return*/];
                }
            });
        }); };
        this.nfts = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var vault, action;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, clear_1.default)();
                        return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, new bn_js_1.default(1), this.api.programId)];
                    case 1:
                        vault = (_a.sent())[0];
                        this.header(vault);
                        return [4 /*yield*/, (0, index_js_1.nftMainInq)()];
                    case 2:
                        action = (_a.sent()).action;
                        if (action === 0) {
                            this.nftAuthorityChange(ms);
                        }
                        else if (action === 1) {
                            this.nftValidateMetaAuthorities(ms);
                        }
                        else {
                            this.multisig(ms);
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        this.nftAuthorityChange = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var vault, _a, type, publicKey, mintList, newAuthority, error, allMints, e_13, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        (0, clear_1.default)();
                        return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, new bn_js_1.default(1), this.api.programId)];
                    case 1:
                        vault = (_c.sent())[0];
                        this.header(vault);
                        return [4 /*yield*/, (0, index_js_1.nftUpdateAuthorityInq)()];
                    case 2:
                        _a = _c.sent(), type = _a.type, publicKey = _a.publicKey, mintList = _a.mintList;
                        newAuthority = vault;
                        error = false;
                        if (type === 1) {
                            if (publicKey && publicKey.length > 0) {
                                newAuthority = new web3_js_1.PublicKey(publicKey);
                            }
                            else {
                                error = true;
                            }
                        }
                        allMints = [];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, (0, nfts_js_1.loadNFTMints)(mintList)];
                    case 4:
                        allMints = _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_13 = _c.sent();
                        console.log("There was an error loading the mint list file: " + chalk_1.default.red(e_13));
                        error = true;
                        return [3 /*break*/, 6];
                    case 6:
                        if (!error) return [3 /*break*/, 8];
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 7:
                        _c.sent();
                        this.nfts(ms);
                        return [3 /*break*/, 13];
                    case 8:
                        _b = type;
                        switch (_b) {
                            case 0: return [3 /*break*/, 9];
                            case 1: return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 11];
                    case 9:
                        this.nftAuthorityChangeIncoming(ms, allMints, newAuthority);
                        return [3 /*break*/, 13];
                    case 10:
                        this.nftAuthorityChangeOutgoing(ms, allMints, newAuthority);
                        return [3 /*break*/, 13];
                    case 11: return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 12:
                        _c.sent();
                        this.nfts(ms);
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        }); };
        // this can simply be transferred to the vault directly with metaplex program
        this.nftAuthorityChangeIncoming = function (ms, mintList, newAuthority) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var vault, validate, error, status_16, validateResult, continueProcessing, confirm_1, status_17, successUpdates, failedUpdates, _i, mintList_1, mint, _a, blockhash, lastValidBlockHeight, updateTx, updateIx, signed, txid, e_14, showFail;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, clear_1.default)();
                        return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, new bn_js_1.default(1), this.api.programId)];
                    case 1:
                        vault = (_b.sent())[0];
                        this.header(vault);
                        return [4 /*yield*/, (0, index_js_1.nftValidateMetasInq)()];
                    case 2:
                        validate = (_b.sent()).validate;
                        error = false;
                        if (!validate) return [3 /*break*/, 7];
                        status_16 = new Spinner("Checking derived metadata accounts...");
                        status_16.start();
                        return [4 /*yield*/, (0, nfts_js_1.checkAllMetas)(this.api.connection, mintList.map(function (m) { return (0, nfts_js_1.getMetadataAccount)(m); }))];
                    case 3:
                        validateResult = _b.sent();
                        status_16.stop();
                        if (!(validateResult.failures.length > 0)) return [3 /*break*/, 5];
                        console.log(chalk_1.default.red("There were some errors validating ".concat(validateResult.failures.length, " metadata accounts:")));
                        console.log(JSON.stringify(validateResult.failures));
                        error = true;
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        // succesfully validated all the metadata accounts
                        console.log("Successfully validated ".concat(validateResult.success.length, " metadata accounts"));
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        console.log('');
                        continueProcessing = false;
                        if (!!error) return [3 /*break*/, 9];
                        return [4 /*yield*/, (0, index_js_1.nftUpdateAuthorityConfirmIncomingInq)(newAuthority.toBase58(), mintList.length)];
                    case 8:
                        confirm_1 = (_b.sent()).confirm;
                        if (confirm_1) {
                            continueProcessing = true;
                        }
                        _b.label = 9;
                    case 9:
                        if (!continueProcessing) return [3 /*break*/, 23];
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 10:
                        _b.sent();
                        console.log("Transfering metadata update authority to the vault, this may take some time depending on the number of mints and your internet connection speed.");
                        status_17 = new Spinner("Updating authority of the metadata accounts...");
                        status_17.start();
                        successUpdates = [];
                        failedUpdates = [];
                        _i = 0, mintList_1 = mintList;
                        _b.label = 11;
                    case 11:
                        if (!(_i < mintList_1.length)) return [3 /*break*/, 19];
                        mint = mintList_1[_i];
                        _b.label = 12;
                    case 12:
                        _b.trys.push([12, 17, , 18]);
                        return [4 /*yield*/, this.api.connection.getLatestBlockhash()];
                    case 13:
                        _a = _b.sent(), blockhash = _a.blockhash, lastValidBlockHeight = _a.lastValidBlockHeight;
                        updateTx = new web3_js_1.Transaction({ lastValidBlockHeight: lastValidBlockHeight, blockhash: blockhash, feePayer: this.api.wallet.publicKey });
                        updateIx = (0, metadataInstructions_js_1.updateMetadataAuthorityIx)(newAuthority, this.api.wallet.publicKey, (0, nfts_js_1.getMetadataAccount)(mint));
                        updateTx.add(updateIx);
                        return [4 /*yield*/, this.api.wallet.signTransaction(updateTx)];
                    case 14:
                        signed = _b.sent();
                        return [4 /*yield*/, this.api.connection.sendRawTransaction(signed.serialize())];
                    case 15:
                        txid = _b.sent();
                        return [4 /*yield*/, this.api.connection.confirmTransaction(txid, "processed")];
                    case 16:
                        _b.sent();
                        successUpdates.push(mint.toBase58());
                        return [3 /*break*/, 18];
                    case 17:
                        e_14 = _b.sent();
                        failedUpdates.push(mint.toBase58());
                        return [3 /*break*/, 18];
                    case 18:
                        _i++;
                        return [3 /*break*/, 11];
                    case 19:
                        status_17.stop();
                        console.log("Successfully transferred ".concat(successUpdates.length, " metadata accounts"));
                        console.log("Failed to transfer ".concat(failedUpdates.length, " metadata accounts."));
                        if (!(failedUpdates.length > 0)) return [3 /*break*/, 21];
                        return [4 /*yield*/, (0, index_js_1.nftUpdateShowFailedMintsInq)()];
                    case 20:
                        showFail = (_b.sent()).showFail;
                        if (showFail) {
                            console.log(JSON.stringify(failedUpdates));
                        }
                        _b.label = 21;
                    case 21: return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 22:
                        _b.sent();
                        _b.label = 23;
                    case 23:
                        this.nfts(ms);
                        return [2 /*return*/];
                }
            });
        }); };
        // to move the authority out, transaction will need to be created
        this.nftAuthorityChangeOutgoing = function (ms, mintList, newAuthority) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var vault, error, ownerValidate, status_18, validateAuthorityResult, showFail, continueProcessing, buckets, confirm_2, safeSign, successfullyStagedMetas, status_19, _i, buckets_1, batch, metasAdded, _a, blockhash, lastValidBlockHeight, txMetaTx, txMetaIx, signed, txid, e_15;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, clear_1.default)();
                        return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, new bn_js_1.default(1), this.api.programId)];
                    case 1:
                        vault = (_b.sent())[0];
                        this.header(vault);
                        error = false;
                        return [4 /*yield*/, (0, index_js_1.nftValidateOwnerInq)()];
                    case 2:
                        ownerValidate = (_b.sent()).ownerValidate;
                        if (!ownerValidate) return [3 /*break*/, 8];
                        status_18 = new Spinner("Checking that the metadata accounts are valid and currently owned by the multisig vault...");
                        status_18.start();
                        return [4 /*yield*/, (0, nfts_js_1.checkAllMetasAuthority)(this.api.connection, mintList.map(function (m) { return (0, nfts_js_1.getMetadataAccount)(m); }), vault)];
                    case 3:
                        validateAuthorityResult = _b.sent();
                        status_18.stop();
                        if (!(validateAuthorityResult.failures.length > 0)) return [3 /*break*/, 6];
                        console.log(chalk_1.default.red("There were some errors validating authority ".concat(validateAuthorityResult.failures.length, " metadata accounts:")));
                        error = true;
                        return [4 /*yield*/, (0, index_js_1.nftUpdateShowFailedMetasInq)()];
                    case 4:
                        showFail = (_b.sent()).showFail;
                        if (showFail) {
                            console.log(JSON.stringify(validateAuthorityResult.failures));
                        }
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        // succesfully validated all the metadata accounts
                        console.log("Successfully validated authority of ".concat(validateAuthorityResult.success.length, " metadata accounts"));
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8:
                        console.log('');
                        continueProcessing = false;
                        buckets = [];
                        if (!!error) return [3 /*break*/, 11];
                        return [4 /*yield*/, (0, nfts_js_1.prepareBulkUpdate)(mintList)];
                    case 9:
                        buckets = _b.sent();
                        return [4 /*yield*/, (0, index_js_1.nftUpdateAuthorityConfirmInq)(newAuthority.toBase58(), mintList.length, buckets.length)];
                    case 10:
                        confirm_2 = (_b.sent()).confirm;
                        if (confirm_2) {
                            continueProcessing = true;
                        }
                        _b.label = 11;
                    case 11:
                        if (!continueProcessing) return [3 /*break*/, 25];
                        return [4 /*yield*/, (0, index_js_1.nftSafeSigningInq)()];
                    case 12:
                        safeSign = (_b.sent()).safeSign;
                        successfullyStagedMetas = [];
                        console.log("Creating the multisig transactions, this may take some time depending on the number of mints and your internet connection speed.");
                        status_19 = new Spinner("Initializing metadata authority update multisig transactions...");
                        status_19.start();
                        _i = 0, buckets_1 = buckets;
                        _b.label = 13;
                    case 13:
                        if (!(_i < buckets_1.length)) return [3 /*break*/, 23];
                        batch = buckets_1[_i];
                        return [4 /*yield*/, (0, nfts_js_1.createAuthorityUpdateTx)(this.api.squads, ms.publicKey, vault, newAuthority, batch, this.api.connection)];
                    case 14:
                        metasAdded = _b.sent();
                        successfullyStagedMetas.push.apply(successfullyStagedMetas, metasAdded.attached);
                        _b.label = 15;
                    case 15:
                        _b.trys.push([15, 21, , 22]);
                        return [4 /*yield*/, this.api.connection.getLatestBlockhash()];
                    case 16:
                        _a = _b.sent(), blockhash = _a.blockhash, lastValidBlockHeight = _a.lastValidBlockHeight;
                        txMetaTx = new web3_js_1.Transaction({ lastValidBlockHeight: lastValidBlockHeight, blockhash: blockhash, feePayer: this.wallet.publicKey });
                        return [4 /*yield*/, (0, nfts_js_1.sendTxMetaIx)(ms.publicKey, metasAdded.txPDA, this.wallet.publicKey, { type: 'nftAuthorityUpdate' }, new web3_js_1.PublicKey(constants_js_1.TXMETA_PROGRAM_ID))];
                    case 17:
                        txMetaIx = _b.sent();
                        txMetaTx.add(txMetaIx);
                        return [4 /*yield*/, this.wallet.signTransaction(txMetaTx)];
                    case 18:
                        signed = _b.sent();
                        return [4 /*yield*/, this.api.connection.sendRawTransaction(signed.serialize())];
                    case 19:
                        txid = _b.sent();
                        return [4 /*yield*/, this.api.connection.confirmTransaction(txid, "processed")];
                    case 20:
                        _b.sent();
                        return [3 /*break*/, 22];
                    case 21:
                        e_15 = _b.sent();
                        console.log(e_15);
                        return [3 /*break*/, 22];
                    case 22:
                        _i++;
                        return [3 /*break*/, 13];
                    case 23:
                        status_19.stop();
                        console.log("Successfully initiated authority transfer txs for ".concat(successfullyStagedMetas.length, " metadata accounts"));
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 24:
                        _b.sent();
                        _b.label = 25;
                    case 25:
                        this.nfts(ms);
                        return [2 /*return*/];
                }
            });
        }); };
        this.nftValidateMetaAuthorities = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var vault, error, _a, mintList, type, publicKey, allMints, e_16, checkAuthority, status_20, validateAuthorityResult, showFail;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, clear_1.default)();
                        return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(ms.publicKey, new bn_js_1.default(1), this.api.programId)];
                    case 1:
                        vault = (_b.sent())[0];
                        this.header(vault);
                        error = false;
                        return [4 /*yield*/, (0, index_js_1.nftValidateCurrentAuthorityInq)(vault)];
                    case 2:
                        _a = _b.sent(), mintList = _a.mintList, type = _a.type, publicKey = _a.publicKey;
                        allMints = [];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, (0, nfts_js_1.loadNFTMints)(mintList)];
                    case 4:
                        allMints = _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_16 = _b.sent();
                        console.log("There was an error loading the mint list file: " + chalk_1.default.red(e_16));
                        error = true;
                        return [3 /*break*/, 6];
                    case 6:
                        checkAuthority = vault;
                        if (type === 1) {
                            if (publicKey && publicKey.length > 0) {
                                checkAuthority = new web3_js_1.PublicKey(publicKey);
                            }
                            else {
                                error = true;
                            }
                        }
                        if (!!error) return [3 /*break*/, 12];
                        status_20 = new Spinner("Checking that the metadata accounts are valid and currently owned by ".concat(checkAuthority, "..."));
                        status_20.start();
                        return [4 /*yield*/, (0, nfts_js_1.checkAllMetasAuthority)(this.api.connection, allMints.map(function (m) { return (0, nfts_js_1.getMetadataAccount)(m); }), checkAuthority)];
                    case 7:
                        validateAuthorityResult = _b.sent();
                        status_20.stop();
                        if (!(validateAuthorityResult.failures.length > 0)) return [3 /*break*/, 10];
                        console.log(chalk_1.default.red("There were some errors validating authority ".concat(validateAuthorityResult.failures.length, " metadata accounts:")));
                        error = true;
                        return [4 /*yield*/, (0, index_js_1.nftUpdateShowFailedMetasInq)()];
                    case 8:
                        showFail = (_b.sent()).showFail;
                        if (showFail) {
                            console.log(JSON.stringify(validateAuthorityResult.failures));
                        }
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 9:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 10:
                        // succesfully validated all the metadata accounts
                        console.log("Successfully validated authority of ".concat(validateAuthorityResult.success.length, " metadata accounts"));
                        return [4 /*yield*/, (0, index_js_1.continueInq)()];
                    case 11:
                        _b.sent();
                        _b.label = 12;
                    case 12:
                        this.nfts(ms);
                        return [2 /*return*/];
                }
            });
        }); };
        this.wallet = wallet.wallet;
        this.connection = connection;
        this.programId = programId ? new web3_js_1.PublicKey(programId) : sdk_1.DEFAULT_MULTISIG_PROGRAM_ID;
        this.programManagerId = programManagerId ? new web3_js_1.PublicKey(programManagerId) : sdk_1.DEFAULT_PROGRAM_MANAGER_PROGRAM_ID;
        this.txMetaProgramId = txMetaProgramId ? new web3_js_1.PublicKey(txMetaProgramId) : new web3_js_1.PublicKey(constants_js_1.TXMETA_PROGRAM_ID);
        this.api = new api_js_1.default(wallet.wallet, connection, this.programId, this.programManagerId);
        this.top();
    }
    Menu.prototype.changeWallet = function (wallet) {
        this.wallet = wallet;
        this.api = new api_js_1.default(wallet.wallet, this.connection, this.programId, this.programManagerId);
    };
    Menu.prototype.changeConnection = function (connection) {
        this.connection = connection;
        this.api = new api_js_1.default(this.wallet, connection, this.programId, this.programManagerId);
    };
    return Menu;
}());
;
exports.default = Menu;
//# sourceMappingURL=menu.js.map