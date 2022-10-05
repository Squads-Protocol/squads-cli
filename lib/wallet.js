import os from "os";
import fs from "fs";
import * as anchor from "@project-serum/anchor";
import _ from "lodash";
// const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');

export const loadCliWallet = () => {
    const homedir = os.homedir();
    const walletPath = `${homedir}/.config/solana/id.json`;
    const walletJSON = JSON.parse(fs.readFileSync(walletPath, "utf-8"));

    const walletKeypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(walletJSON));

    const wallet = new anchor.Wallet(walletKeypair);
    return wallet;
};

