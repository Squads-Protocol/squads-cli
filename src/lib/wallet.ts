import os from "os";
import fs from "fs";
import { ComputeBudgetProgram, type Transaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

const homedir = os.homedir();
const defaultWalletPath = `${homedir}/.config/solana/id.json`;

class CliWallet {
    walletPath: string;
    wallet: anchor.Wallet;

    constructor(
        walletInitPath?: string,
        ledgerWallet?: any | null,
        computeUnitPrice?: number,
    ) {
        this.walletPath = defaultWalletPath;
        if (walletInitPath && walletInitPath.length > 0) {
            this.walletPath = walletInitPath;
        }
        let bareWallet;
        if (ledgerWallet)
            bareWallet = ledgerWallet;
        else
            bareWallet = this.loadCliWallet();

        this.wallet = new WalletWithFees(bareWallet, computeUnitPrice);
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

export class WalletWithFees implements anchor.Wallet {
    bareWallet: anchor.Wallet;
    computeUnitPrice?: number;

    constructor(bareWallet: anchor.Wallet, computeUnitPrice?: number) {
        this.bareWallet = bareWallet;
        this.computeUnitPrice = computeUnitPrice;
    }

    get payer() {
        return this.bareWallet.payer;
    }

    get publicKey() {
        return this.bareWallet.publicKey;
    }

    async signTransaction(tx: Transaction): Promise<Transaction> {
        return this.bareWallet.signTransaction(this.addComputeUnitPrice(tx));
    }

    async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
        return this.bareWallet.signAllTransactions(
            txs.map((tx) => this.addComputeUnitPrice(tx)),
        );
    }

    addComputeUnitPrice(tx: Transaction): Transaction {
        if (this.computeUnitPrice)
            tx.add(
                ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: this.computeUnitPrice,
                }),
            );
        return tx;
    }
}

export default CliWallet;
