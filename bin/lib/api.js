"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var sdk_1 = tslib_1.__importStar(require("@sqds/sdk"));
var anchor = tslib_1.__importStar(require("@coral-xyz/anchor"));
var bn_js_1 = tslib_1.__importDefault(require("bn.js"));
var program_js_1 = require("./program.js");
var assets_js_1 = require("./assets.js");
var spl_token_1 = require("@solana/spl-token");
var info_1 = require("../info");
var spl_token_2 = require("@solana/spl-token");
var spl_token_3 = require("@solana/spl-token");
var API = /** @class */ (function () {
    function API(wallet, connection, programId, programManagerId) {
        var _this = this;
        this.getSquadExtended = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.squads.getMultisig(ms)];
            });
        }); };
        this.getSquads = function (pubkey) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var allSquads, mySquads;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.program.account.ms.all()];
                    case 1:
                        allSquads = _a.sent();
                        mySquads = allSquads.filter(function (s) {
                            var mappedKeys = s.account.keys.map(function (k) { return k.toBase58(); });
                            if (mappedKeys.indexOf(_this.wallet.publicKey.toBase58()) >= 0) {
                                return true;
                            }
                            return false;
                        }).map(function (s) { return s.publicKey; });
                        return [2 /*return*/, Promise.all(mySquads.map(function (k) { return _this.getSquadExtended(k); }))];
                }
            });
        }); };
        this.getChainSquads = function (pubkey) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/];
            });
        }); };
        this.getTransactions = function (ms) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var txIndex, transactions;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        txIndex = ms.transactionIndex;
                        return [4 /*yield*/, Promise.all(tslib_1.__spreadArray([], new Array(txIndex), true).map(function (_, i) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var ind, txPDA;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            ind = new bn_js_1.default(i + 1);
                                            return [4 /*yield*/, (0, sdk_1.getTxPDA)(ms.publicKey, ind, this.programId)];
                                        case 1:
                                            txPDA = (_a.sent())[0];
                                            return [2 /*return*/, this.squads.getTransaction(txPDA)];
                                    }
                                });
                            }); }))];
                    case 1:
                        transactions = _a.sent();
                        return [2 /*return*/, transactions];
                }
            });
        }); };
        this.createMultisig = function (threshold, createKey, members) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var tx, msPDA, vault, fundIx, _a, blockhash, lastValidBlockHeight, fundTx, signedTx, sig, e_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.squads.createMultisig(threshold, createKey, members)];
                    case 1:
                        tx = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        msPDA = tx.publicKey;
                        return [4 /*yield*/, (0, sdk_1.getAuthorityPDA)(msPDA, new bn_js_1.default(1), this.programId)];
                    case 3:
                        vault = (_b.sent())[0];
                        fundIx = anchor.web3.SystemProgram.transfer({
                            fromPubkey: this.wallet.publicKey,
                            toPubkey: vault,
                            lamports: anchor.web3.LAMPORTS_PER_SOL / 1000,
                        });
                        return [4 /*yield*/, this.connection.getLatestBlockhash()];
                    case 4:
                        _a = _b.sent(), blockhash = _a.blockhash, lastValidBlockHeight = _a.lastValidBlockHeight;
                        fundTx = new anchor.web3.Transaction({
                            blockhash: blockhash,
                            feePayer: this.wallet.publicKey,
                            lastValidBlockHeight: lastValidBlockHeight,
                        });
                        fundTx.add(fundIx);
                        return [4 /*yield*/, this.wallet.signTransaction(fundTx)];
                    case 5:
                        signedTx = _b.sent();
                        return [4 /*yield*/, this.connection.sendRawTransaction(signedTx.serialize(), { preflightCommitment: "confirmed", skipPreflight: true, commitment: "confirmed" })];
                    case 6:
                        sig = _b.sent();
                        return [4 /*yield*/, this.connection.confirmTransaction(sig, "confirmed")];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        e_1 = _b.sent();
                        console.log("Error funding vault", e_1);
                        throw e_1;
                    case 9: return [2 /*return*/, tx];
                }
            });
        }); };
        this.getProgramDataAuthority = function (programId) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var program;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, program_js_1.getProgramData)(this.connection, programId)];
                    case 1:
                        program = _a.sent();
                        return [2 /*return*/, program.info.authority];
                }
            });
        }); };
        this.createSafeAuthorityTx = function (msPDA, programId, currentAuthority, newAuthority) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var nextTxIndex, txPDA, createTxIx, ix, addIx, activateIx, approveIx, _a, blockhash, lastValidBlockHeight, tx, sig;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.squads.getNextTransactionIndex(msPDA)];
                    case 1:
                        nextTxIndex = _b.sent();
                        return [4 /*yield*/, (0, sdk_1.getTxPDA)(msPDA, new bn_js_1.default(nextTxIndex), this.programId)];
                    case 2:
                        txPDA = (_b.sent())[0];
                        return [4 /*yield*/, this.squads.buildCreateTransaction(msPDA, 1, nextTxIndex)];
                    case 3:
                        createTxIx = _b.sent();
                        return [4 /*yield*/, (0, program_js_1.upgradeSetAuthorityIx)(programId, currentAuthority, newAuthority)];
                    case 4:
                        ix = _b.sent();
                        return [4 /*yield*/, this.squads.buildAddInstruction(msPDA, txPDA, ix, 1)];
                    case 5:
                        addIx = _b.sent();
                        return [4 /*yield*/, this.squads.buildActivateTransaction(msPDA, txPDA)];
                    case 6:
                        activateIx = _b.sent();
                        return [4 /*yield*/, this.squads.buildApproveTransaction(msPDA, txPDA)];
                    case 7:
                        approveIx = _b.sent();
                        return [4 /*yield*/, this.connection.getLatestBlockhash()];
                    case 8:
                        _a = _b.sent(), blockhash = _a.blockhash, lastValidBlockHeight = _a.lastValidBlockHeight;
                        tx = new anchor.web3.Transaction({ blockhash: blockhash, lastValidBlockHeight: lastValidBlockHeight, feePayer: this.wallet.publicKey });
                        tx.add(createTxIx);
                        tx.add(addIx);
                        tx.add(activateIx);
                        tx.add(approveIx);
                        console.log("Transaction composed");
                        return [4 /*yield*/, this.wallet.signTransaction(tx)];
                    case 9:
                        tx = _b.sent();
                        console.log("Transaction signed");
                        console.log("Sending");
                        return [4 /*yield*/, this.connection.sendRawTransaction(tx.serialize(), { skipPreflight: true })];
                    case 10:
                        sig = _b.sent();
                        return [4 /*yield*/, this.connection.confirmTransaction(sig, { commitment: "confirmed" })];
                    case 11:
                        _b.sent();
                        console.log("Transaction sent");
                        return [2 /*return*/, txPDA];
                }
            });
        }); };
        this.executeTransaction = function (tx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.squads.executeTransaction(tx)];
            });
        }); };
        this.approveTransaction = function (tx) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, this.squads.approveTransaction(tx)];
            });
        }); };
        this.addKeyTransaction = function (msPDA, key) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var txBuilder, _a, txInstructions, txPDA, activateIx, _b, blockhash, lastValidBlockHeight, tx, topup, sig;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.squads.getTransactionBuilder(msPDA, 0)];
                    case 1:
                        txBuilder = _c.sent();
                        return [4 /*yield*/, txBuilder.withAddMember(key)];
                    case 2: return [4 /*yield*/, (_c.sent()).getInstructions()];
                    case 3:
                        _a = _c.sent(), txInstructions = _a[0], txPDA = _a[1];
                        return [4 /*yield*/, this.squads.buildActivateTransaction(msPDA, txPDA)];
                    case 4:
                        activateIx = _c.sent();
                        console.log("transaction instructions", JSON.stringify(txInstructions, null, 2));
                        return [4 /*yield*/, this.connection.getLatestBlockhash()];
                    case 5:
                        _b = _c.sent(), blockhash = _b.blockhash, lastValidBlockHeight = _b.lastValidBlockHeight;
                        tx = new anchor.web3.Transaction({ blockhash: blockhash, lastValidBlockHeight: lastValidBlockHeight, feePayer: this.wallet.publicKey });
                        return [4 /*yield*/, this.squads.checkGetTopUpInstruction(msPDA)];
                    case 6:
                        topup = _c.sent();
                        if (topup) {
                            tx.add(topup);
                        }
                        tx.add.apply(tx, txInstructions);
                        tx.add(activateIx);
                        console.log("Transaction composed");
                        return [4 /*yield*/, this.wallet.signTransaction(tx)];
                    case 7:
                        tx = _c.sent();
                        console.log("Transaction signed");
                        console.log("Sending");
                        return [4 /*yield*/, this.connection.sendRawTransaction(tx.serialize(), { skipPreflight: true })];
                    case 8:
                        sig = _c.sent();
                        return [4 /*yield*/, this.connection.confirmTransaction(sig, { commitment: "confirmed" })];
                    case 9:
                        _c.sent();
                        return [4 /*yield*/, this.squads.approveTransaction(txPDA)];
                    case 10:
                        _c.sent();
                        return [2 /*return*/, this.squads.getTransaction(txPDA)];
                }
            });
        }); };
        this.removeKeyTransaction = function (msPDA, key) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var txBuilder, _a, txInstructions, txPDA, activateIx, _b, blockhash, lastValidBlockHeight, tx, sig;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.squads.getTransactionBuilder(msPDA, 0)];
                    case 1:
                        txBuilder = _c.sent();
                        return [4 /*yield*/, txBuilder.withRemoveMember(key)];
                    case 2: return [4 /*yield*/, (_c.sent()).getInstructions()];
                    case 3:
                        _a = _c.sent(), txInstructions = _a[0], txPDA = _a[1];
                        return [4 /*yield*/, this.squads.buildActivateTransaction(msPDA, txPDA)];
                    case 4:
                        activateIx = _c.sent();
                        return [4 /*yield*/, this.connection.getLatestBlockhash()];
                    case 5:
                        _b = _c.sent(), blockhash = _b.blockhash, lastValidBlockHeight = _b.lastValidBlockHeight;
                        tx = new anchor.web3.Transaction({ blockhash: blockhash, lastValidBlockHeight: lastValidBlockHeight, feePayer: this.wallet.publicKey });
                        tx.add.apply(tx, txInstructions);
                        tx.add(activateIx);
                        console.log("Transaction composed");
                        return [4 /*yield*/, this.wallet.signTransaction(tx)];
                    case 6:
                        tx = _c.sent();
                        console.log("Transaction signed");
                        console.log("Sending");
                        return [4 /*yield*/, this.connection.sendRawTransaction(tx.serialize(), { skipPreflight: true })];
                    case 7:
                        sig = _c.sent();
                        return [4 /*yield*/, this.connection.confirmTransaction(sig, { commitment: "confirmed" })];
                    case 8:
                        _c.sent();
                        return [4 /*yield*/, this.squads.approveTransaction(txPDA)];
                    case 9:
                        _c.sent();
                        return [2 /*return*/, this.squads.getTransaction(txPDA)];
                }
            });
        }); };
        this.changeThresholdTransaction = function (msPDA, threshold) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var txBuilder, _a, txInstructions, txPDA, activateIx, _b, blockhash, lastValidBlockHeight, tx, sig;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.squads.getTransactionBuilder(msPDA, 0)];
                    case 1:
                        txBuilder = _c.sent();
                        return [4 /*yield*/, txBuilder.withChangeThreshold(threshold)];
                    case 2: return [4 /*yield*/, (_c.sent()).getInstructions()];
                    case 3:
                        _a = _c.sent(), txInstructions = _a[0], txPDA = _a[1];
                        return [4 /*yield*/, this.squads.buildActivateTransaction(msPDA, txPDA)];
                    case 4:
                        activateIx = _c.sent();
                        return [4 /*yield*/, this.connection.getLatestBlockhash()];
                    case 5:
                        _b = _c.sent(), blockhash = _b.blockhash, lastValidBlockHeight = _b.lastValidBlockHeight;
                        tx = new anchor.web3.Transaction({ blockhash: blockhash, lastValidBlockHeight: lastValidBlockHeight, feePayer: this.wallet.publicKey });
                        tx.add.apply(tx, txInstructions);
                        tx.add(activateIx);
                        console.log("Transaction composed");
                        return [4 /*yield*/, this.wallet.signTransaction(tx)];
                    case 6:
                        tx = _c.sent();
                        console.log("Transaction signed");
                        console.log("Sending");
                        return [4 /*yield*/, this.connection.sendRawTransaction(tx.serialize(), { skipPreflight: true })];
                    case 7:
                        sig = _c.sent();
                        return [4 /*yield*/, this.connection.confirmTransaction(sig, { commitment: "confirmed" })];
                    case 8:
                        _c.sent();
                        return [4 /*yield*/, this.squads.approveTransaction(txPDA)];
                    case 9:
                        _c.sent();
                        return [2 /*return*/, this.squads.getTransaction(txPDA)];
                }
            });
        }); };
        this.programId = programId;
        this.programManagerId = programManagerId;
        this.squads = sdk_1.default.endpoint(connection.cluster, wallet, { commitmentOrConfig: "confirmed", multisigProgramId: this.programId, programManagerProgramId: this.programManagerId });
        this.wallet = wallet;
        this.cluster = connection.cluster;
        this.connection = connection.connection;
        this.provider = new anchor.AnchorProvider(this.connection, this.wallet, { preflightCommitment: "confirmed", commitment: "confirmed" });
        this.program = new anchor.Program(info_1.idl, this.programId, this.provider);
    }
    API.prototype.createTransaction = function (msPDA, authorityIndex) {
        return this.squads.createTransaction(msPDA, authorityIndex);
    };
    API.prototype.addInstruction = function (txPDA, ix) {
        var txIx = new anchor.web3.TransactionInstruction({
            keys: ix.keys,
            programId: ix.programId,
            data: ix.data
        });
        return this.squads.addInstruction(txPDA, txIx);
    };
    API.prototype.activate = function (txPDA) {
        return this.squads.activateTransaction(txPDA);
    };
    API.prototype.getVaultAssets = function (vaultPDA) {
        return (0, assets_js_1.getAssets)(this.connection, vaultPDA);
    };
    API.prototype.createATA = function (mint, owner) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var ataPubkey, createATAIx, _a, blockhash, lastValidBlockHeight, tx, sig;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, spl_token_1.getAssociatedTokenAddress)(mint, owner, true, spl_token_3.TOKEN_PROGRAM_ID, spl_token_2.ASSOCIATED_TOKEN_PROGRAM_ID)];
                    case 1:
                        ataPubkey = _b.sent();
                        return [4 /*yield*/, (0, spl_token_1.createAssociatedTokenAccountInstruction)(this.wallet.publicKey, ataPubkey, owner, mint, spl_token_3.TOKEN_PROGRAM_ID, spl_token_2.ASSOCIATED_TOKEN_PROGRAM_ID)];
                    case 2:
                        createATAIx = _b.sent();
                        return [4 /*yield*/, this.connection.getLatestBlockhash()];
                    case 3:
                        _a = _b.sent(), blockhash = _a.blockhash, lastValidBlockHeight = _a.lastValidBlockHeight;
                        tx = new anchor.web3.Transaction({ blockhash: blockhash, lastValidBlockHeight: lastValidBlockHeight, feePayer: this.wallet.publicKey });
                        tx.add(createATAIx);
                        return [4 /*yield*/, this.wallet.signTransaction(tx)];
                    case 4:
                        tx = _b.sent();
                        return [4 /*yield*/, this.connection.sendRawTransaction(tx.serialize(), { skipPreflight: true })];
                    case 5:
                        sig = _b.sent();
                        return [2 /*return*/, ataPubkey];
                }
            });
        });
    };
    return API;
}());
exports.default = API;
//# sourceMappingURL=api.js.map