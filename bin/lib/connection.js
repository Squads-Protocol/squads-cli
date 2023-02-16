"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var anchor_1 = require("@coral-xyz/anchor");
var CliConnection = /** @class */ (function () {
    function CliConnection(hostUrl) {
        var cluster;
        if (hostUrl === "localnet") {
            cluster = "http://127.0.0.1:8899";
        }
        else if (hostUrl === "devnet") {
            cluster = "https://api.devnet.solana.com";
        }
        else if (hostUrl === null || hostUrl === "mainnet" || hostUrl === "mainnet-beta") {
            cluster = "https://api.mainnet-beta.solana.com";
        }
        else if (hostUrl === "") {
            cluster = "https://api.mainnet-beta.solana.com";
        }
        else {
            cluster = hostUrl;
        }
        this.cluster = cluster;
        if (!cluster) {
            throw new Error("Invalid cluster provided");
        }
        this.connection = new anchor_1.web3.Connection(cluster);
    }
    return CliConnection;
}());
exports.default = CliConnection;
//# sourceMappingURL=connection.js.map