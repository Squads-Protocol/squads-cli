#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var clear_1 = tslib_1.__importDefault(require("clear"));
var chalk_1 = tslib_1.__importDefault(require("chalk"));
var menu_js_1 = tslib_1.__importDefault(require("./lib/menu.js"));
var wallet_js_1 = tslib_1.__importDefault(require("./lib/wallet.js"));
var connection_js_1 = tslib_1.__importDefault(require("./lib/connection.js"));
var walletPath_js_1 = tslib_1.__importDefault(require("./lib/inq/walletPath.js"));
var cluster_js_1 = tslib_1.__importDefault(require("./lib/inq/cluster.js"));
var yargs_1 = tslib_1.__importDefault(require("yargs"));
var helpers_1 = require("yargs/helpers");
var VERSION = "1.2.5";
var argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).options({
    cluster: { type: 'string' },
    programId: { type: 'string' },
    programManagerId: { type: 'string' },
}).parseSync();
// console.log(pjson.version);
var load = function (initCluster, programId, programManagerId) {
    if (initCluster === void 0) { initCluster = null; }
    if (programId === void 0) { programId = null; }
    if (programManagerId === void 0) { programManagerId = null; }
    return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        var walletPath, cliWallet, cliConnection, cluster_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, clear_1.default)();
                    console.log(chalk_1.default.yellow('Starting Squads CLI...') + " Follow the prompts to get started");
                    return [4 /*yield*/, (0, walletPath_js_1.default)()];
                case 1:
                    walletPath = (_a.sent()).walletPath;
                    cliWallet = new wallet_js_1.default(walletPath);
                    if (!!initCluster) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, cluster_js_1.default)()];
                case 2:
                    cluster_1 = (_a.sent()).cluster;
                    cliConnection = new connection_js_1.default(cluster_1);
                    return [3 /*break*/, 4];
                case 3:
                    cliConnection = new connection_js_1.default(initCluster);
                    _a.label = 4;
                case 4:
                    // start the menu
                    new menu_js_1.default(cliWallet, cliConnection, programId, programManagerId);
                    return [2 /*return*/];
            }
        });
    });
};
var help = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        (0, clear_1.default)();
        console.log("Squads CLI is in alpha, more commands and options are in progress.");
        console.log("For more information, visit https://github.com/squads-protocol/squads-cli");
        return [2 /*return*/];
    });
}); };
var cluster = null;
var programId = null;
var programManagerId = null;
if (argv.cluster && argv.cluster.length > 0) {
    cluster = argv.cluster;
}
if (argv.programId && argv.programId.length > 0) {
    programId = argv.programId;
}
if (argv.programManagerId && argv.programManagerId.length > 0) {
    programManagerId = argv.programManagerId;
}
if (argv.help) {
    help();
}
else if (argv.version || argv.v) {
    console.log(VERSION);
}
else {
    (0, clear_1.default)();
    load(cluster, programId, programManagerId);
}
//# sourceMappingURL=index.js.map