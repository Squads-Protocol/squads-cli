"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssets = void 0;
var tslib_1 = require("tslib");
var web3_js_1 = require("@solana/web3.js");
var spl_token_1 = require("@solana/spl-token");
var nfts_js_1 = require("./nfts.js");
var spl_token_registry_1 = require("@solana/spl-token-registry");
var utils_js_1 = require("./utils.js");
var js_1 = require("@metaplex/js");
var axios_1 = tslib_1.__importDefault(require("axios"));
var getAssets = function (connection, userKey) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var usableTokens, parsedAccount, solInfo, solModel, tokenList, _loop_1, _i, _a, acc, displayTokens;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log("Getting accounts for:", userKey.toBase58());
                usableTokens = [];
                return [4 /*yield*/, connection.getParsedTokenAccountsByOwner(userKey, {
                        programId: spl_token_1.TOKEN_PROGRAM_ID,
                    })];
            case 1:
                parsedAccount = _b.sent();
                return [4 /*yield*/, connection.getBalance(userKey, "confirmed")];
            case 2:
                solInfo = _b.sent();
                solModel = {
                    amount: solInfo / web3_js_1.LAMPORTS_PER_SOL,
                    source: userKey.toBase58(),
                    mint: "So11111111111111111111111111111111111111112",
                    symbol: 'SOL',
                    decimals: 9,
                    name: "Solana"
                };
                usableTokens.push(solModel);
                return [4 /*yield*/, new spl_token_registry_1.TokenListProvider().resolve().then(function (knownToken) {
                        return knownToken.filterByClusterSlug("mainnet-beta").getList();
                    })];
            case 3:
                tokenList = _b.sent();
                _loop_1 = function (acc) {
                    var isOnList, isNFT, metadata, resp, tModel, e_1, hasTokenCheck, tModel, tModel;
                    return tslib_1.__generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                if (!(acc.account.data.parsed.info.mint !== "So11111111111111111111111111111111111111112")) return [3 /*break*/, 6];
                                isOnList = false;
                                return [4 /*yield*/, (0, nfts_js_1.checkIsNFT)(connection, acc)];
                            case 1:
                                isNFT = _c.sent();
                                if (!(acc.account.data.parsed.info.mint && !isNFT)) return [3 /*break*/, 6];
                                _c.label = 2;
                            case 2:
                                _c.trys.push([2, 5, , 6]);
                                return [4 /*yield*/, js_1.programs.metadata.Metadata.findByMint(connection, acc.account.data.parsed.info.mint)];
                            case 3:
                                metadata = _c.sent();
                                return [4 /*yield*/, axios_1.default.get(metadata.data.data.uri).then(function (response) { return response.data; })];
                            case 4:
                                resp = _c.sent();
                                tModel = {
                                    amount: acc.account.data.parsed.info.tokenAmount.uiAmount,
                                    source: acc.pubkey.toBase58(),
                                    mint: acc.account.data.parsed.info.mint,
                                    symbol: metadata.data.data.symbol,
                                    decimals: acc.account.data.parsed.info.tokenAmount.decimals,
                                    name: metadata.data.data.name
                                };
                                usableTokens.push(tModel);
                                return [3 /*break*/, 6];
                            case 5:
                                e_1 = _c.sent();
                                hasTokenCheck = tokenList.filter(function (tkn) {
                                    return acc.account.data.parsed.info.mint === tkn.address;
                                });
                                if (hasTokenCheck.length > 0) {
                                    isOnList = true;
                                    tModel = {
                                        amount: acc.account.data.parsed.info.tokenAmount.uiAmount,
                                        source: acc.pubkey.toBase58(),
                                        mint: hasTokenCheck[0].address,
                                        symbol: hasTokenCheck[0].symbol,
                                        decimals: acc.account.data.parsed.info.tokenAmount.decimals,
                                        name: hasTokenCheck[0].name
                                    };
                                    usableTokens.push(tModel);
                                }
                                if (!isOnList) {
                                    tModel = {
                                        amount: acc.account.data.parsed.info.tokenAmount.uiAmount,
                                        source: acc.pubkey.toBase58(),
                                        mint: acc.account.data.parsed.info.mint,
                                        symbol: (0, utils_js_1.shortenTextEnd)(acc.account.data.parsed.info.mint, 4),
                                        decimals: acc.account.data.parsed.info.tokenAmount.decimals,
                                        name: "UNKNOWN"
                                    };
                                    usableTokens.push(tModel);
                                }
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, _a = parsedAccount.value;
                _b.label = 4;
            case 4:
                if (!(_i < _a.length)) return [3 /*break*/, 7];
                acc = _a[_i];
                return [5 /*yield**/, _loop_1(acc)];
            case 5:
                _b.sent();
                _b.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 4];
            case 7:
                displayTokens = usableTokens.map(function (a) {
                    // let out = a;
                    // out.account = a.source;
                    // out.mint =  (a.mint && a.mint.length > 0) ? shortenTextEnd(a.mint, 16) : a.mint;
                    return {
                        "Amount": a.amount,
                        "Account": a.source,
                        "Mint": a.mint,
                        "Symbol": a.symbol,
                        "Name": a.name,
                    };
                });
                return [2 /*return*/, { usableTokens: usableTokens, displayTokens: displayTokens }];
        }
    });
}); };
exports.getAssets = getAssets;
//# sourceMappingURL=assets.js.map