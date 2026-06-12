import os from "os";
import fs from "fs";
import { ComputeBudgetProgram, type Transaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import type { AnchorWallet } from "../types.js";
import { expandTilde } from "./utils.js";

const homedir = os.homedir();
const defaultWalletPath = `${homedir}/.config/solana/id.json`;

class CliWallet {
    walletPath: string;
    wallet!: AnchorWallet;

    constructor(
        walletInitPath?: string,
        ledgerWallet?: AnchorWallet | null,
        computeUnitPrice?: number,
    ) {
        this.walletPath = defaultWalletPath;
        if (walletInitPath && walletInitPath.trim().length > 0) {
            this.walletPath = expandTilde(walletInitPath);
        }
        const bareWallet = ledgerWallet ?? this.loadCliWallet();
        this.wallet = new WalletWithFees(bareWallet, computeUnitPrice);
    }

    loadCliWallet(): AnchorWallet {
        let walletJSON;
        try {
            walletJSON = JSON.parse(fs.readFileSync(this.walletPath, "utf-8"));
        }catch(e){
            console.log("Failed to read ", this.walletPath);
            console.log("Error reading wallet file: ", e);
            throw e;
        }
        const walletKeypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(walletJSON));
        return new anchor.Wallet(walletKeypair);
    }
}

export class WalletWithFees implements AnchorWallet {
    bareWallet: AnchorWallet;
    computeUnitPrice?: number;

    constructor(bareWallet: AnchorWallet, computeUnitPrice?: number) {
        this.bareWallet = bareWallet;
        this.computeUnitPrice = computeUnitPrice;
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
