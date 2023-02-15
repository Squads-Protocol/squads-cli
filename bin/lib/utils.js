"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMultipleAccountsBatch = exports.shortenTextEnd = void 0;
var tslib_1 = require("tslib");
function shortenTextEnd(text, chars) {
    var cleanedText = text.replaceAll("\x00", "");
    if (cleanedText.length > chars)
        return "".concat(cleanedText.substring(0, chars), "...");
    return cleanedText;
}
exports.shortenTextEnd = shortenTextEnd;
function getMultipleAccountsBatch(connection, publicKeys, commitment) {
    if (commitment === void 0) { commitment = "processed"; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var keys, tempKeys, accounts, resArray;
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    keys = [];
                    tempKeys = [];
                    publicKeys.forEach(function (k) {
                        if (tempKeys.length >= 100) {
                            keys.push(tempKeys);
                            tempKeys = [];
                        }
                        tempKeys.push(k);
                    });
                    if (tempKeys.length > 0) {
                        keys.push(tempKeys);
                    }
                    accounts = [];
                    resArray = {};
                    return [4 /*yield*/, Promise.all(keys.map(function (key, index) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var _a, _b;
                            return tslib_1.__generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _a = resArray;
                                        _b = index;
                                        return [4 /*yield*/, connection.getMultipleAccountsInfo(key, commitment)];
                                    case 1:
                                        _a[_b] = _c.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    _a.sent();
                    Object.keys(resArray)
                        .sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); })
                        .forEach(function (itemIndex) {
                        var res = resArray[parseInt(itemIndex, 10)];
                        for (var _i = 0, res_1 = res; _i < res_1.length; _i++) {
                            var account = res_1[_i];
                            accounts.push(account);
                        }
                    });
                    return [2 /*return*/, accounts.map(function (account, idx) {
                            if (account === null) {
                                return null;
                            }
                            return {
                                publicKey: publicKeys[idx],
                                account: account
                            };
                        })];
            }
        });
    });
}
exports.getMultipleAccountsBatch = getMultipleAccountsBatch;
//# sourceMappingURL=utils.js.map