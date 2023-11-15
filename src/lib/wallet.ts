import os from "os";
import fs from "fs";
import * as anchor from "@coral-xyz/anchor";

const homedir = os.homedir();
const defaultWalletPath = `${homedir}/.config/solana/id.json`;

class CliWallet {
    walletPath: string;
    wallet: anchor.Wallet;

    constructor(walletInitPath?: string, ledgerWallet?: any | null) {
        this.walletPath = defaultWalletPath;
        if (walletInitPath && walletInitPath.length > 0) {
            this.walletPath = walletInitPath;
        }
        if (ledgerWallet)
            this.wallet = ledgerWallet
        else
            this.wallet = this.loadCliWallet();
    }

    loadCliWallet(){
        let walletJSON;
        try {
            walletJSON = JSON.parse(fs.readFileSync(this.walletPath, "utf-8"));
        }catch(e){
            console.log("Failed to read ", this.walletPath);
            console.log("Error reading wallet file: ", e);
            throw e;
        }
        const walletKeypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(walletJSON));
        this.wallet = new anchor.Wallet(walletKeypair);
        return this.wallet;
    }
}

export default CliWallet;
