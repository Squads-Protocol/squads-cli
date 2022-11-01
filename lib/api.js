import axios from "axios";
import SquadsSdk from "@sqds/sdk";
import * as anchor from "@project-serum/anchor";
import BN from "bn.js";
import { DEFAULT_MULTISIG_PROGRAM_ID } from '@sqds/sdk';
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token.js";
import { getProgramData, upgradeSetAuthorityIx } from "./program.js";
import { getAssets } from "./assets.js";
import { TransactionInstruction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount} from "@solana/spl-token";

const API_ENDPOINT = "https://platoon-1.squads.so/api/";

const Squads = SquadsSdk.default;
const getTxPDA = SquadsSdk.getTxPDA;

class API{
    squads;
    wallet;
    connection;
    cluster;
    programId;
    constructor(wallet, connection){
        this.squads = Squads.endpoint(connection.cluster, wallet);
        this.wallet = wallet;
        this.cluster = connection.cluster;
        this.connection = connection.connection;
    }

    getSquadExtended = async (ms) => {
        return this.squads.getMultisig(new anchor.web3.PublicKey(ms));
    };
    
    getSquads = async (pubkey) => {
        // to do - wrap this in a network check
        const response = await axios.get(`${API_ENDPOINT}members/${pubkey.toBase58()}`);
        const squadKeys = response.data.resp;
        return Promise.all(squadKeys.map(k => this.getSquadExtended(k)));
    };
    
    getTransactions = async (ms) => {
        const txIndex = ms.transactionIndex;
        const transactions = await Promise.all([...new Array(txIndex)].map(async (_, i) => {
            const [txPDA] = await getTxPDA(ms.publicKey, new BN(i+1), SquadsSdk.DEFAULT_MULTISIG_PROGRAM_ID);
            return this.squads.getTransaction(txPDA);
        }));
        return transactions;
    }
    
    createMultisig = async (threshold, createKey,members) => {
        const tx = await this.squads.createMultisig(threshold,createKey,members);
        return tx;
    };
    
    getProgramDataAuthority = async (programId) => {
        const program = await getProgramData(connection, programId);
        return program.info.authority;
    };
    
    createSafeAuthorityTx = async (msPDA, programId, currentAuthority, newAuthority) => {
        const nextTxIndex = await this.squads.getNextTransactionIndex(msPDA);
        const [txPDA] = await getTxPDA(msPDA, new BN(nextTxIndex), SquadsSdk.DEFAULT_MULTISIG_PROGRAM_ID);
        const createTxIx = await this.squads.buildCreateTransaction(msPDA, 1, nextTxIndex);
        const ix = await upgradeSetAuthorityIx(programId, currentAuthority, newAuthority);
    
        const addIx = await this.squads.buildAddInstruction(msPDA, txPDA, ix, 1);
        const activateIx = await this.squads.buildActivateTransaction(msPDA, txPDA);
        const approveIx = await this.squads.buildApproveTransaction(msPDA, txPDA);
    
        const {blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash();
        let tx = new anchor.web3.Transaction({blockhash, lastValidBlockHeight, feePayer: this.wallet.publicKey});
        tx.add(createTxIx);
        tx.add(addIx);
        tx.add(activateIx);
        tx.add(approveIx);
        console.log("Transaction composed")
        tx = await wallet.signTransaction(tx);
        console.log("Transaction signed")
        console.log("Sending");
        const sig = await connection.sendRawTransaction(tx.serialize(), {skipPreflight: true});
        await connection.confirmTransaction(sig, {commitment: "confirmed"});
        console.log("Transaction sent");
        return txPDA;
    };
    
    executeTransaction = async (tx) => {
        return this.squads.executeTransaction(tx);
    };
    
    approveTransaction = async (tx) => {
        return this.squads.approveTransaction(tx);
    }
    
    addKeyTransaction = async (msPDA, key) => {
        const txBuilder = await this.squads.getTransactionBuilder(msPDA, 0);
        const [txInstructions, txPDA] = await (
          await txBuilder.withAddMember(key)
        ).getInstructions();
        const activateIx = await this.squads.buildActivateTransaction(msPDA, txPDA);
    
        const {blockhash, lastValidBlockHeight} = await this.connection.getLatestBlockhash();
        let tx = new anchor.web3.Transaction({blockhash, lastValidBlockHeight, feePayer: this.wallet.publicKey});
    
        tx.add(...txInstructions);
        tx.add(activateIx);
    
        console.log("Transaction composed")
        tx = await this.wallet.signTransaction(tx);
        console.log("Transaction signed")
        console.log("Sending");
        const sig = await this.connection.sendRawTransaction(tx.serialize(), {skipPreflight: true});
        await this.connection.confirmTransaction(sig, {commitment: "confirmed"});
    
        await this.squads.approveTransaction(txPDA);
        return this.squads.getTransaction(txPDA);
    }
    
    removeKeyTransaction = async (msPDA, key) => {
        const txBuilder = await this.squads.getTransactionBuilder(msPDA, 0);
        const [txInstructions, txPDA] = await (
          await txBuilder.withRemoveMember(key)
        ).getInstructions();
        const activateIx = await this.squads.buildActivateTransaction(msPDA, txPDA);
    
        const {blockhash, lastValidBlockHeight} = await this.connection.getLatestBlockhash();
        let tx = new anchor.web3.Transaction({blockhash, lastValidBlockHeight, feePayer: this.wallet.publicKey});
    
        tx.add(...txInstructions);
        tx.add(activateIx);
    
        console.log("Transaction composed")
        tx = await this.wallet.signTransaction(tx);
        console.log("Transaction signed")
        console.log("Sending");
        const sig = await this.connection.sendRawTransaction(tx.serialize(), {skipPreflight: true});
        await this.connection.confirmTransaction(sig, {commitment: "confirmed"});
    
        await this.squads.approveTransaction(txPDA);
        return this.squads.getTransaction(txPDA);
    };
    
    changeThresholdTransaction = async (msPDA, threshold) => {
        const txBuilder = await this.squads.getTransactionBuilder(msPDA, 0);
        const [txInstructions, txPDA] = await (
          await txBuilder.withChangeThreshold(threshold)
        ).getInstructions();
        const activateIx = await this.squads.buildActivateTransaction(msPDA, txPDA);
    
        const {blockhash, lastValidBlockHeight} = await this.connection.getLatestBlockhash();
        let tx = new anchor.web3.Transaction({blockhash, lastValidBlockHeight, feePayer: this.wallet.publicKey});
    
        tx.add(...txInstructions);
        tx.add(activateIx);
    
        console.log("Transaction composed")
        tx = await this.wallet.signTransaction(tx);
        console.log("Transaction signed")
        console.log("Sending");
        const sig = await this.connection.sendRawTransaction(tx.serialize(), {skipPreflight: true});
        await this.connection.confirmTransaction(sig, {commitment: "confirmed"});
    
        await this.squads.approveTransaction(txPDA);
        return this.squads.getTransaction(txPDA);
    };

    createTransaction(msPDA, authorityIndex){
        return this.squads.createTransaction(msPDA, authorityIndex);
    }

    addInstruction(txPDA, ix) {
        const txIx = new TransactionInstruction({
            keys: ix.keys,
            programId: ix.programId,
            data: ix.data
        });
        return this.squads.addInstruction(txPDA, txIx);
    }

    activate(txPDA){
        return this.squads.activateTransaction(txPDA);
    }

    getVaultAssets(vaultPDA) {
        return getAssets(this.connection, vaultPDA);
    }

    createATA(mint, owner){
        return getOrCreateAssociatedTokenAccount(this.connection, this.wallet, mint, owner, true);
    }
}

export default API;