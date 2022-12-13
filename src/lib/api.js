import axios from "axios";
import SquadsSdk, { getAuthorityPDA } from "@sqds/sdk";
import * as anchor from "@project-serum/anchor";
import BN from "bn.js";
import { getProgramData, upgradeSetAuthorityIx } from "./program.js";
import { getAssets } from "./assets.js";
import { getOrCreateAssociatedTokenAccount, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress} from "@solana/spl-token";
import {idl} from "../info.cjs";

const Squads = SquadsSdk.default;
const getTxPDA = SquadsSdk.getTxPDA;

class API{
    squads;
    wallet;
    connection;
    cluster;
    programId;
    program;
    provider;
    constructor(wallet, connection, programId = null, programManagerId = null){
        this.programId = programId;
        this.programManagerId = programManagerId;
        this.squads = Squads.endpoint(connection.cluster, wallet, {commitmentOrConfig: "confirmed", multisigProgramId: this.programId, programManagerProgramId: this.programManagerId});
        this.wallet = wallet;
        this.cluster = connection.cluster;
        this.connection = connection.connection;
        this.provider = new anchor.AnchorProvider(this.connection, this.wallet, {preflightCommitment: "confirmed", commitment: "confirmed"});
        this.program = new anchor.Program(idl, this.programId, this.provider);
    }

    getSquadExtended = async (ms) => {
        return this.squads.getMultisig(ms);
    };
    
    getSquads = async (pubkey) => {
        const allSquads = await this.program.account.ms.all();
        const mySquads = allSquads.filter(s => {
            const mappedKeys = s.account.keys.map(k => k.toBase58());
            if (mappedKeys.indexOf(this.wallet.publicKey.toBase58()) >= 0){
                return true;
            }
            return false;
        }).map(s => s.publicKey);
        return Promise.all(mySquads.map(k => this.getSquadExtended(k)));
    };
    
    getChainSquads = async (pubkey) => {
        
    }

    getTransactions = async (ms) => {
        const txIndex = ms.transactionIndex;
        const transactions = await Promise.all([...new Array(txIndex)].map(async (_, i) => {
            const [txPDA] = await getTxPDA(ms.publicKey, new BN(i+1), this.programId);
            return this.squads.getTransaction(txPDA);
        }));
        return transactions;
    }
    
    createMultisig = async (threshold, createKey,members) => {
        const tx = await this.squads.createMultisig(threshold,createKey,members);
        // try to fund the PDA
        try {
            const msPDA = tx.publicKey;
            const [vault] = await getAuthorityPDA(msPDA, new BN(1), this.programId);
            const fundIx = anchor.web3.SystemProgram.transfer({
                fromPubkey: this.wallet.publicKey,
                toPubkey: vault,
                lamports: anchor.web3.LAMPORTS_PER_SOL / 1000,
            });
            const {blockhash, lastValidBlockHeight} = await this.connection.getLatestBlockhash();
            const fundTx = new anchor.web3.Transaction({
                blockhash,
                feePayer: this.wallet.publicKey,
                lastValidBlockHeight,
            });
            fundTx.add(fundIx);
            const signedTx = await this.wallet.signTransaction(fundTx);
            const sig =await this.connection.sendRawTransaction(signedTx.serialize(), {preflightCommitment: "confirmed",skipPreflight: true, commitment: "confirmed"});
            await this.connection.confirmTransaction(sig, "confirmed");
        }catch (e){
            console.log("Error funding vault", e);
            throw new Error(e);
            // couldn't fund
        }
        return tx;
    };
    
    getProgramDataAuthority = async (programId) => {
        const program = await getProgramData(this.connection, programId);
        return program.info.authority;
    };
    
    createSafeAuthorityTx = async (msPDA, programId, currentAuthority, newAuthority) => {
        const nextTxIndex = await this.squads.getNextTransactionIndex(msPDA);
        const [txPDA] = await getTxPDA(msPDA, new BN(nextTxIndex), this.programId);
        const createTxIx = await this.squads.buildCreateTransaction(msPDA, 1, nextTxIndex);
        const ix = await upgradeSetAuthorityIx(programId, currentAuthority, newAuthority);
    
        const addIx = await this.squads.buildAddInstruction(msPDA, txPDA, ix, 1);
        const activateIx = await this.squads.buildActivateTransaction(msPDA, txPDA);
        const approveIx = await this.squads.buildApproveTransaction(msPDA, txPDA);
    
        const {blockhash, lastValidBlockHeight} = await this.connection.getLatestBlockhash();
        let tx = new anchor.web3.Transaction({blockhash, lastValidBlockHeight, feePayer: this.wallet.publicKey});
        tx.add(createTxIx);
        tx.add(addIx);
        tx.add(activateIx);
        tx.add(approveIx);
        console.log("Transaction composed")
        tx = await wallet.signTransaction(tx);
        console.log("Transaction signed")
        console.log("Sending");
        const sig = await this.connection.sendRawTransaction(tx.serialize(), {skipPreflight: true});
        await this.connection.confirmTransaction(sig, {commitment: "confirmed"});
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
        const txIx = new anchor.web3.TransactionInstruction({
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

    async createATA(mint, owner){
        const ataPubkey = await getAssociatedTokenAddress(mint,owner,true)
        const createATAIx = await createAssociatedTokenAccountInstruction(
            this.wallet.publicKey,
            ataPubkey,
            owner,
            mint
        );

        const {blockhash, lastValidBlockHeight} = await this.connection.getLatestBlockhash();
        let tx = new anchor.web3.Transaction({blockhash, lastValidBlockHeight, feePayer: this.wallet.publicKey});
        tx.add(createATAIx);
        tx = await this.wallet.signTransaction(tx);
        const sig = await this.connection.sendRawTransaction(tx.serialize(), {skipPreflight: true});
        return ataPubkey;
    }
}

export default API;