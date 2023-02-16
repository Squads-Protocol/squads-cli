"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOldNFTAccounts = exports.getNFTAccounts = exports.checkIsNFT = void 0;
var tslib_1 = require("tslib");
var js_1 = require("@metaplex/js");
var spl_token_1 = require("@solana/spl-token");
var utils_js_1 = require("./utils.js");
var axios_1 = tslib_1.__importDefault(require("axios"));
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
//# sourceMappingURL=nfts.js.map