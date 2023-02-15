"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeSetAuthorityIx = exports.getProgramDataAddress = exports.getProgramData = exports.getProgramDataAccount = exports.getParsedProgramAccount = void 0;
var tslib_1 = require("tslib");
var anchor = tslib_1.__importStar(require("@coral-xyz/anchor"));
var bn_js_1 = tslib_1.__importDefault(require("bn.js"));
var BPFLOADER_ADDRESS = new anchor.web3.PublicKey("BPFLoaderUpgradeab1e11111111111111111111111");
var getParsed = function (account) {
    var value = account.value;
    if (value && value.data && 'parsed' in value.data) {
        var parsed = value.data.parsed;
        return parsed;
    }
    return null;
};
var getParsedProgramAccount = function (connection, programAddress) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var programAccountInfo;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, connection.getParsedAccountInfo(programAddress)];
            case 1:
                programAccountInfo = _a.sent();
                return [2 /*return*/, getParsed(programAccountInfo)];
        }
    });
}); };
exports.getParsedProgramAccount = getParsedProgramAccount;
var getProgramDataAccount = function (connection, programDataAddress) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2 /*return*/, connection.getParsedAccountInfo(programDataAddress)];
    });
}); };
exports.getProgramDataAccount = getProgramDataAccount;
var getProgramData = function (connection, programAddress) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var programDataAddress, programAccountInfo, parsed;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.getProgramDataAddress)(programAddress)];
            case 1:
                programDataAddress = _a.sent();
                return [4 /*yield*/, connection.getParsedAccountInfo(programDataAddress)];
            case 2:
                programAccountInfo = _a.sent();
                parsed = getParsed(programAccountInfo);
                return [2 /*return*/, parsed];
        }
    });
}); };
exports.getProgramData = getProgramData;
var getProgramDataAddress = function (programAddress) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var programDataAddress;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, anchor.web3.PublicKey.findProgramAddress([programAddress.toBytes()], BPFLOADER_ADDRESS)];
            case 1:
                programDataAddress = (_a.sent())[0];
                return [2 /*return*/, programDataAddress];
        }
    });
}); };
exports.getProgramDataAddress = getProgramDataAddress;
var upgradeSetAuthorityIx = function (programAddress, currentAuthorityAddress, newAuthorityAddress) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var upgradeProgramId, upgradeData, programDataAddress, keys;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                upgradeProgramId = BPFLOADER_ADDRESS;
                upgradeData = new bn_js_1.default(4, 10);
                return [4 /*yield*/, anchor.web3.PublicKey.findProgramAddress([programAddress.toBuffer()], upgradeProgramId)];
            case 1:
                programDataAddress = (_a.sent())[0];
                keys = [
                    { pubkey: programDataAddress, isWritable: true, isSigner: false },
                    { pubkey: currentAuthorityAddress, isWritable: false, isSigner: true },
                    { pubkey: newAuthorityAddress, isWritable: false, isSigner: true },
                ];
                return [2 /*return*/, new anchor.web3.TransactionInstruction({
                        programId: upgradeProgramId,
                        data: upgradeData.toArrayLike(Buffer, "le", 4),
                        keys: keys,
                    })];
        }
    });
}); };
exports.upgradeSetAuthorityIx = upgradeSetAuthorityIx;
//# sourceMappingURL=program.js.map