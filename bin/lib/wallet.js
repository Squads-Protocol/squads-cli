"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var os_1 = tslib_1.__importDefault(require("os"));
var fs_1 = tslib_1.__importDefault(require("fs"));
var anchor = tslib_1.__importStar(require("@coral-xyz/anchor"));
// const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');
var homedir = os_1.default.homedir();
var defaultWalletPath = "".concat(homedir, "/.config/solana/id.json");
var CliWallet = /** @class */ (function () {
    function CliWallet(walletInitPath) {
        this.walletPath = defaultWalletPath;
        if (walletInitPath && walletInitPath.length > 0) {
            this.walletPath = walletInitPath;
        }
        this.wallet = this.loadCliWallet();
    }
    CliWallet.prototype.loadCliWallet = function () {
        var walletJSON;
        try {
            walletJSON = JSON.parse(fs_1.default.readFileSync(this.walletPath, "utf-8"));
        }
        catch (e) {
            console.log("Failed to read ", this.walletPath);
            console.log("Error reading wallet file: ", e);
            throw e;
        }
        var walletKeypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(walletJSON));
        this.wallet = new anchor.Wallet(walletKeypair);
        return this.wallet;
    };
    return CliWallet;
}());
exports.default = CliWallet;
//# sourceMappingURL=wallet.js.map