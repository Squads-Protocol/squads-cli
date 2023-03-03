import axios from "axios";
import Squads, { getTxPDA, getAuthorityPDA } from "@sqds/sdk";
import * as anchor from "@coral-xyz/anchor";
import BN from "bn.js";
import { getProgramData, upgradeSetAuthorityIx } from "./program.js";
import { getAssets } from "./assets.js";
import {getAssociatedTokenAddress,createAssociatedTokenAccountInstruction} from "@solana/spl-token";
import {idl} from "../info";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

class API{
    squads;
    wallet;
    connection: Connection;
    cluster;
    programId: PublicKey;
    program;
    provider;
    programManagerId: PublicKey;
    constructor(wallet: Wallet, connection: any, programId: PublicKey, programManagerId: PublicKey){
        this.programId = programId;
        this.programManagerId = programManagerId;
        this.squads = Squads.endpoint(connection.cluster, wallet, {commitmentOrConfig: "confirmed", multisigProgramId: this.programId, programManagerProgramId: this.programManagerId});
        this.wallet = wallet;
        this.cluster = connection.cluster;
        this.connection = connection.connection;
        this.provider = new anchor.AnchorProvider(this.connection, this.wallet, {preflightCommitment: "confirmed", commitment: "confirmed"});
        this.program = new anchor.Program(idl as anchor.Idl, this.programId, this.provider);
    }

    getSquadExtended = async (ms: PublicKey) => {
        return this.squads.getMultisig(ms);
    };
    
    getSquads = async (pubkey: PublicKey) => {
        const allSquads = await this.program.account.ms.all();
        const mySquads = allSquads.filter((s:any) => {
            const mappedKeys = s.account.keys.map((k: PublicKey) => k.toBase58());
            if (mappedKeys.indexOf(this.wallet.publicKey.toBase58()) >= 0){
                return true;
            }
            return false;
        }).map(s => s.publicKey);
        return Promise.all(mySquads.map(k => this.getSquadExtended(k)));
    };
    
    getChainSquads = async (pubkey: PublicKey) => {
        
    }

    getTransactions = async (ms: any) => {
        const txIndex = ms.transactionIndex;
        const transactions = await Promise.all([...new Array(txIndex)].map(async (_, i) => {
            const ind = new BN(i+1);
            const [txPDA] = await getTxPDA(ms.publicKey, ind, this.programId);
            return this.squads.getTransaction(txPDA);
        }));
        return transactions;
    }
    
    createMultisig = async (threshold: number, createKey: PublicKey,members: PublicKey[]) => {
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
            const sig =await this.connection.sendRawTransaction(signedTx.serialize(), {preflightCommitment: "confirmed",skipPreflight: true});
            await this.connection.confirmTransaction(sig, "confirmed");
        }catch (e){
            console.log("Error funding vault", e);
            throw e;
            // couldn't fund
        }
        return tx;
    };
    
    getProgramDataAuthority = async (programId: PublicKey) => {
        const program = await getProgramData(this.connection, programId);
        return program.info.authority;
    };
    
    createSafeAuthorityTx = async (msPDA: PublicKey, programId: PublicKey, currentAuthority: PublicKey, newAuthority: PublicKey) => {
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
        tx = await this.wallet.signTransaction(tx);
        console.log("Transaction signed")
        console.log("Sending");
        const sig = await this.connection.sendRawTransaction(tx.serialize(), {skipPreflight: true});
        await this.connection.confirmTransaction(sig, "confirmed");
        console.log("Transaction sent");
        return txPDA;
    };
    
    executeTransaction = async (tx: PublicKey) => {
        return this.squads.executeTransaction(tx);
    };
    
    approveTransaction = async (tx: PublicKey) => {
        return this.squads.approveTransaction(tx);
    }
    
    addKeyTransaction = async (msPDA: PublicKey, key: PublicKey) => {
        const txBuilder = await this.squads.getTransactionBuilder(msPDA, 0);
        const [txInstructions, txPDA] = await (
          await txBuilder.withAddMember(key)
        ).getInstructions();
        const activateIx = await this.squads.buildActivateTransaction(msPDA, txPDA);
        console.log("transaction instructions", JSON.stringify(txInstructions, null, 2));
        const {blockhash, lastValidBlockHeight} = await this.connection.getLatestBlockhash();
        let tx = new anchor.web3.Transaction({blockhash, lastValidBlockHeight, feePayer: this.wallet.publicKey});
        const topup = await this.squads.checkGetTopUpInstruction(msPDA);
        if(topup){
            tx.add(topup);
        }
        tx.add(...txInstructions);
        tx.add(activateIx);
    
        console.log("Transaction composed")
        tx = await this.wallet.signTransaction(tx);
        console.log("Transaction signed")
        console.log("Sending");
        const sig = await this.connection.sendRawTransaction(tx.serialize(), {skipPreflight: true});
        await this.connection.confirmTransaction(sig, "confirmed");
    
        await this.squads.approveTransaction(txPDA);
        return this.squads.getTransaction(txPDA);
    }
    
    removeKeyTransaction = async (msPDA: PublicKey, key: PublicKey) => {
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
        await this.connection.confirmTransaction(sig, "confirmed");
    
        await this.squads.approveTransaction(txPDA);
        return this.squads.getTransaction(txPDA);
    };
    
    changeThresholdTransaction = async (msPDA: PublicKey, threshold: number) => {
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
        await this.connection.confirmTransaction(sig, "confirmed");
    
        await this.squads.approveTransaction(txPDA);
        return this.squads.getTransaction(txPDA);
    };

    createTransaction(msPDA: PublicKey, authorityIndex: number){
        return this.squads.createTransaction(msPDA, authorityIndex);
    }

    addInstruction(txPDA: PublicKey, ix: anchor.web3.TransactionInstruction) {
        const txIx = new anchor.web3.TransactionInstruction({
            keys: ix.keys,
            programId: ix.programId,
            data: ix.data
        });
        return this.squads.addInstruction(txPDA, txIx);
    }

    activate(txPDA: PublicKey){
        return this.squads.activateTransaction(txPDA);
    }

    getVaultAssets(vaultPDA: PublicKey) {
        return getAssets(this.connection, vaultPDA);
    }

    async createATA(mint: PublicKey, owner: PublicKey){
        const ataPubkey = await getAssociatedTokenAddress(mint,owner,true,TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
        const createATAIx = await createAssociatedTokenAccountInstruction(
            this.wallet.publicKey,
            ataPubkey,
            owner,
            mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
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