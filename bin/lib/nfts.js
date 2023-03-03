"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTxMetaIx = exports.loadNFTMints = exports.checkAllMetasAuthority = exports.checkMetadataAuthority = exports.validateMetadataAccount = exports.checkAllMetas = exports.getMetadataAccount = exports.prepareBulkUpdate = exports.createAuthorityUpdateTx = exports.getOldNFTAccounts = exports.getNFTAccounts = exports.checkIsNFT = void 0;
var tslib_1 = require("tslib");
var js_1 = require("@metaplex/js");
var spl_token_1 = require("@solana/spl-token");
var utils_js_1 = require("./utils.js");
var axios_1 = tslib_1.__importDefault(require("axios"));
var anchor_1 = require("@coral-xyz/anchor");
var clui_1 = tslib_1.__importDefault(require("clui"));
var anchor = tslib_1.__importStar(require("@coral-xyz/anchor"));
var web3_js_1 = require("@solana/web3.js");
var js_2 = require("@metaplex-foundation/js");
var fs = tslib_1.__importStar(require("fs"));
var metadataInstructions_js_1 = require("./metadataInstructions.js");
var Progress = clui_1.default.Progress;
var checkIsNFT = function (connection, acc) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var edition, e_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, js_1.programs.metadata.Metadata.getEdition(connection, acc.account.data.parsed.info.mint)];
            case 1:
                edition = _a.sent();
                if (edition)
                    return [2 /*return*/, true];
                return [3 /*break*/, 3];
            case 2:
                e_1 = _a.sent();
                return [2 /*return*/, acc.account.data.parsed.info.tokenAmount.decimals === 0];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.checkIsNFT = checkIsNFT;
var getNFTAccounts = function (connection, publicKey) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var value, tokenMap;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, connection.getParsedTokenAccountsByOwner(publicKey, { programId: spl_token_1.TOKEN_PROGRAM_ID })];
            case 1:
                value = (_a.sent()).value;
                tokenMap = value.map(function (_a) {
                    var account = _a.account, pubkey = _a.pubkey;
                    return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        var data, pda;
                        return tslib_1.__generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    data = account.data;
                                    return [4 /*yield*/, js_1.programs.metadata.Metadata.getPDA(data.parsed.info.mint)];
                                case 1:
                                    pda = _b.sent();
                                    return [2 /*return*/, {
                                            account: pubkey,
                                            mint: data.parsed.info.mint,
                                            amount: data.parsed.info.tokenAmount,
                                            metadataPda: pda,
                                            metadataPdaUi: pda.toBase58(),
                                        }];
                            }
                        });
                    });
                });
                return [2 /*return*/, Promise.all(tokenMap)
                        // filter for amount = 1
                        .then(function (result) {
                        return result.filter(function (ta) {
                            return ta.amount.uiAmount > 0;
                        });
                    })
                        // filter by metadata program key
                        .then(function (filtered) {
                        return (0, utils_js_1.getMultipleAccountsBatch)(connection, filtered.map(function (f) { return f.metadataPda; }))
                            .then(function (pdaRes) {
                            return pdaRes.map(function (mpr, i) {
                                // try to create the Metadata object
                                var md = null;
                                try {
                                    md = new js_1.programs.metadata.Metadata(filtered[i].mint, mpr.account);
                                }
                                catch (e) {
                                    // not a valid metadata
                                    md = null;
                                }
                                if (md && (md.data.data.creators || md.data.tokenStandard === 1 || filtered[i].amount.decimals === 0)) {
                                    return {
                                        account: filtered[i].account,
                                        metadata: md,
                                        jsonData: {},
                                        tokenModel: {
                                            amount: filtered[i].amount,
                                            source: filtered[i].account.toBase58(),
                                            mint: filtered[i].mint,
                                            symbol: (0, utils_js_1.shortenTextEnd)(md.data.data.symbol, 4),
                                            decimals: 0,
                                            name: md.data.data.name
                                        },
                                    };
                                }
                                return null;
                            });
                        })
                            .then(function (mac) { return mac.filter(function (pmd) { return pmd; }); });
                    })
                        .then(function (f) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        var _i, f_1, model, _a, e_2;
                        return tslib_1.__generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _i = 0, f_1 = f;
                                    _b.label = 1;
                                case 1:
                                    if (!(_i < f_1.length)) return [3 /*break*/, 6];
                                    model = f_1[_i];
                                    if (!model) return [3 /*break*/, 5];
                                    _b.label = 2;
                                case 2:
                                    _b.trys.push([2, 4, , 5]);
                                    _a = model;
                                    return [4 /*yield*/, axios_1.default.get(model.metadata.data.data.uri).then(function (response) { return response.data; })];
                                case 3:
                                    _a.jsonData = _b.sent();
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_2 = _b.sent();
                                    model.jsonData = model.metadata.data.data;
                                    model.jsonData.image = "";
                                    return [3 /*break*/, 5];
                                case 5:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 6: return [2 /*return*/, f];
                            }
                        });
                    }); })];
        }
    });
}); };
exports.getNFTAccounts = getNFTAccounts;
var getOldNFTAccounts = function (connection, publicKey) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var value, tokenMap;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, connection.getParsedTokenAccountsByOwner(publicKey, { programId: spl_token_1.TOKEN_PROGRAM_ID })];
            case 1:
                value = (_a.sent()).value;
                tokenMap = value.map(function (_a) {
                    var account = _a.account, pubkey = _a.pubkey;
                    return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        var data, pda;
                        return tslib_1.__generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    data = account.data;
                                    return [4 /*yield*/, js_1.programs.metadata.Metadata.getPDA(data.parsed.info.mint)];
                                case 1:
                                    pda = _b.sent();
                                    return [2 /*return*/, {
                                            account: pubkey,
                                            mint: data.parsed.info.mint,
                                            amount: data.parsed.info.tokenAmount,
                                            metadataPda: pda,
                                            metadataPdaUi: pda.toBase58(),
                                        }];
                            }
                        });
                    });
                });
                return [2 /*return*/, Promise.all(tokenMap)
                        .then(function (result) {
                        return result.filter(function (ta) {
                            return ta.mint !== null;
                        });
                    })
                        // filter by metadata program key
                        .then(function (filtered) {
                        return (0, utils_js_1.getMultipleAccountsBatch)(connection, filtered.map(function (f) { return f.metadataPda; }))
                            .then(function (pdaRes) {
                            return pdaRes.map(function (mpr, i) {
                                if (!mpr) {
                                    return null;
                                }
                                // try to create the Metadata object
                                var md = null;
                                try {
                                    md = new js_1.programs.metadata.Metadata(filtered[i].mint, mpr.account);
                                }
                                catch (e) {
                                    // not a valid metadata
                                    md = null;
                                }
                                if (md && (md.data.data.creators || md.data.tokenStandard === 1 || filtered[i].amount.decimals === 0)) {
                                    return {
                                        account: filtered[i].account,
                                        metadata: md,
                                        jsonData: {},
                                        tokenModel: {
                                            amount: filtered[i].amount,
                                            source: filtered[i].account.toBase58(),
                                            mint: filtered[i].mint,
                                            symbol: (0, utils_js_1.shortenTextEnd)(md.data.data.symbol, 4),
                                            decimals: 0,
                                            name: md.data.data.name
                                        },
                                    };
                                }
                                return null;
                            });
                        })
                            .then(function (mac) { return mac.filter(function (pmd) { return pmd; }); });
                    })
                        .then(function (f) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        var _i, f_2, model, _a, e_3;
                        return tslib_1.__generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _i = 0, f_2 = f;
                                    _b.label = 1;
                                case 1:
                                    if (!(_i < f_2.length)) return [3 /*break*/, 6];
                                    model = f_2[_i];
                                    if (!model) return [3 /*break*/, 5];
                                    _b.label = 2;
                                case 2:
                                    _b.trys.push([2, 4, , 5]);
                                    _a = model;
                                    return [4 /*yield*/, axios_1.default.get(model.metadata.data.data.uri).then(function (response) { return response.data; })];
                                case 3:
                                    _a.jsonData = _b.sent();
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_3 = _b.sent();
                                    model.jsonData = model.metadata.data.data;
                                    model.jsonData.image = "";
                                    return [3 /*break*/, 5];
                                case 5:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 6: return [2 /*return*/, f];
                            }
                        });
                    }); })];
        }
    });
}); };
exports.getOldNFTAccounts = getOldNFTAccounts;
// can fit 250 ixes
var createAuthorityUpdateTx = function (squadsSdk, multisig, currentAuthority, newAuthority, metadataAccounts, connection, safeSign) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var attached, attachFails, queue, txState, batchLength, hasError, failures, metadataAccount, ix, addedIx, e_4, metadataAccount, ix, addedIx, e_5;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                attached = [];
                attachFails = [];
                queue = metadataAccounts;
                return [4 /*yield*/, squadsSdk.createTransaction(multisig, 1)];
            case 1:
                txState = _a.sent();
                batchLength = metadataAccounts.length;
                hasError = false;
                failures = [];
                _a.label = 2;
            case 2:
                if (!(queue.length > 0)) return [3 /*break*/, 7];
                metadataAccount = queue.shift();
                if (!metadataAccount) {
                    return [3 /*break*/, 7];
                }
                ix = (0, metadataInstructions_js_1.updateMetadataAuthorityIx)(newAuthority, currentAuthority, metadataAccount);
                if (safeSign) {
                    ix.keys.push({
                        pubkey: newAuthority,
                        isSigner: true,
                        isWritable: false
                    });
                }
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, squadsSdk.addInstruction(txState.publicKey, ix)];
            case 4:
                addedIx = _a.sent();
                if (addedIx) {
                    attached.push(metadataAccount);
                }
                return [3 /*break*/, 6];
            case 5:
                e_4 = _a.sent();
                attachFails.push(metadataAccount);
                return [3 /*break*/, 6];
            case 6: return [3 /*break*/, 2];
            case 7: return [4 /*yield*/, squadsSdk.getTransaction(txState.publicKey)];
            case 8:
                // check the tx before activating
                txState = _a.sent();
                if (!(txState.instructionIndex !== batchLength && attachFails.length > 0)) return [3 /*break*/, 14];
                _a.label = 9;
            case 9:
                if (!(attachFails.length > 0)) return [3 /*break*/, 14];
                metadataAccount = attachFails.shift();
                if (!metadataAccount) {
                    return [3 /*break*/, 14];
                }
                ix = (0, metadataInstructions_js_1.updateMetadataAuthorityIx)(newAuthority, currentAuthority, metadataAccount);
                _a.label = 10;
            case 10:
                _a.trys.push([10, 12, , 13]);
                return [4 /*yield*/, squadsSdk.addInstruction(txState.publicKey, ix)];
            case 11:
                addedIx = _a.sent();
                if (addedIx) {
                    attached.push(metadataAccount);
                }
                return [3 /*break*/, 13];
            case 12:
                e_5 = _a.sent();
                hasError = true;
                failures.push(metadataAccount);
                return [3 /*break*/, 13];
            case 13: return [3 /*break*/, 9];
            case 14: 
            // activate the transaction
            return [4 /*yield*/, squadsSdk.activateTransaction(txState.publicKey)];
            case 15:
                // activate the transaction
                _a.sent();
                // approve the transaction 
                return [4 /*yield*/, squadsSdk.approveTransaction(txState.publicKey)];
            case 16:
                // approve the transaction 
                _a.sent();
                return [2 /*return*/, { attached: attached, failures: failures, txPDA: txState.publicKey }];
        }
    });
}); };
exports.createAuthorityUpdateTx = createAuthorityUpdateTx;
// this loads the json file which contains an array of mint addresses in base58,
// it then breaks it up into chunks of 250 maximum chunk size and then maps each to its
// derived metadata account derived from getMetadataAccount
var prepareBulkUpdate = function (mints) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var chunks, currentChunk, _i, mints_1, mint;
    return tslib_1.__generator(this, function (_a) {
        chunks = [];
        currentChunk = [];
        for (_i = 0, mints_1 = mints; _i < mints_1.length; _i++) {
            mint = mints_1[_i];
            if (currentChunk.length === 250) {
                chunks.push(currentChunk);
                currentChunk = [];
            }
            currentChunk.push((0, exports.getMetadataAccount)(mint));
        }
        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }
        return [2 /*return*/, chunks];
    });
}); };
exports.prepareBulkUpdate = prepareBulkUpdate;
var getMetadataAccount = function (mint) {
    // to do  - put in real derivation seeds
    return web3_js_1.PublicKey.findProgramAddressSync([anchor_1.utils.bytes.utf8.encode('metadata'), metadataInstructions_js_1.METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer()], metadataInstructions_js_1.METAPLEX_PROGRAM_ID)[0];
};
exports.getMetadataAccount = getMetadataAccount;
var checkAllMetas = function (connection, metadataAccounts) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var success, failures, _i, metadataAccounts_1, metaAccount, valid;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                success = [];
                failures = [];
                _i = 0, metadataAccounts_1 = metadataAccounts;
                _a.label = 1;
            case 1:
                if (!(_i < metadataAccounts_1.length)) return [3 /*break*/, 4];
                metaAccount = metadataAccounts_1[_i];
                return [4 /*yield*/, (0, exports.validateMetadataAccount)(connection, metaAccount)];
            case 2:
                valid = _a.sent();
                if (valid) {
                    success.push(metaAccount);
                }
                else {
                    failures.push(metaAccount);
                }
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, {
                    success: success,
                    failures: failures
                }];
        }
    });
}); };
exports.checkAllMetas = checkAllMetas;
// check that the metadata account exists and is owned by the metaplex program
var validateMetadataAccount = function (connection, metadataAccount) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var a;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, connection.getAccountInfo(metadataAccount)];
            case 1:
                a = _a.sent();
                // if account is null, or the account lamports is 0, or if the account owner is not the metaplex_program_id, return false
                if (!a || a.lamports === 0 || !a.owner.equals(metadataInstructions_js_1.METAPLEX_PROGRAM_ID)) {
                    return [2 /*return*/, false];
                }
                return [2 /*return*/, true];
        }
    });
}); };
exports.validateMetadataAccount = validateMetadataAccount;
// checks that the current update authority matches the given authority
var checkMetadataAuthority = function (connection, metadataAccount, authority) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var a, unparsedMaybeAccount, metadata_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, connection.getAccountInfo(metadataAccount)];
            case 1:
                a = _a.sent();
                if (!a || a.lamports === 0 || !a.owner.equals(metadataInstructions_js_1.METAPLEX_PROGRAM_ID)) {
                    return [2 /*return*/, false];
                }
                if (a) {
                    unparsedMaybeAccount = tslib_1.__assign(tslib_1.__assign({}, a), { publicKey: metadataAccount, exists: true, lamports: (0, js_2.lamports)(a.lamports) });
                    metadata_1 = (0, js_2.toMetadata)((0, js_2.toMetadataAccount)(unparsedMaybeAccount));
                    if (metadata_1.updateAuthorityAddress.equals(authority)) {
                        return [2 /*return*/, true];
                    }
                }
                return [2 /*return*/, false];
        }
    });
}); };
exports.checkMetadataAuthority = checkMetadataAuthority;
var checkAllMetasAuthority = function (connection, metadataAccounts, authority) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var success, failures, _i, metadataAccounts_2, metaAccount, valid, e_6;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                success = [];
                failures = [];
                _i = 0, metadataAccounts_2 = metadataAccounts;
                _a.label = 1;
            case 1:
                if (!(_i < metadataAccounts_2.length)) return [3 /*break*/, 6];
                metaAccount = metadataAccounts_2[_i];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, exports.checkMetadataAuthority)(connection, metaAccount, authority)];
            case 3:
                valid = _a.sent();
                if (valid) {
                    success.push(metaAccount);
                }
                else {
                    failures.push(metaAccount);
                }
                return [3 /*break*/, 5];
            case 4:
                e_6 = _a.sent();
                failures.push(metaAccount);
                return [3 /*break*/, 5];
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/, {
                    success: success,
                    failures: failures
                }];
        }
    });
}); };
exports.checkAllMetasAuthority = checkAllMetasAuthority;
// loads the mint json and maps the mints to publickey
var loadNFTMints = function (path) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var mintJSON, mints;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fs.readFileSync(path, "utf8")];
            case 1:
                mintJSON = _a.sent();
                mints = JSON.parse(mintJSON);
                return [2 /*return*/, mints.map(function (m) { return new web3_js_1.PublicKey(m); })];
        }
    });
}); };
exports.loadNFTMints = loadNFTMints;
// creates a squads tx meta instruction for the tx to be referred later by type
var sendTxMetaIx = function (msPDA, txPDA, member, dataObj, txMetaProgramId) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var trackMetaSig, ixDescrim, trackMetaData, meta, accountsList, metaLength, metaData;
    return tslib_1.__generator(this, function (_a) {
        trackMetaSig = anchor.utils.sha256.hash("global:track_meta");
        ixDescrim = Buffer.from(trackMetaSig, "hex");
        trackMetaData = Buffer.concat([
            ixDescrim.slice(0, 8),
        ]);
        meta = Buffer.from(JSON.stringify(dataObj));
        accountsList = [];
        accountsList.push({
            pubkey: member,
            isSigner: true,
            isWritable: true
        });
        accountsList.push({
            pubkey: msPDA,
            isSigner: false,
            isWritable: false
        });
        accountsList.push({
            pubkey: txPDA,
            isSigner: false,
            isWritable: false
        });
        metaLength = new anchor.BN(meta.length);
        metaData = Buffer.concat([trackMetaData, metaLength.toArrayLike(Buffer, "le", 4), meta]);
        return [2 /*return*/, new anchor.web3.TransactionInstruction({
                keys: accountsList,
                programId: txMetaProgramId,
                data: metaData,
            })];
    });
}); };
exports.sendTxMetaIx = sendTxMetaIx;
//# sourceMappingURL=nfts.js.map