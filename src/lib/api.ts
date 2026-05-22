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
import {Connection, LAMPORTS_PER_SOL, PublicKey, VoteProgram} from "@solana/web3.js";

type SquadsTxBuilder = Awaited<ReturnType<Squads["getTransactionBuilder"]>>;

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

    private sendAndConfirm = async (
        ixes: anchor.web3.TransactionInstruction[],
        opts: { confirm?: boolean } = {},
    ): Promise<string> => {
        const { confirm = true } = opts;
        const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
        const tx = new anchor.web3.Transaction({ blockhash, lastValidBlockHeight, feePayer: this.wallet.publicKey });
        tx.add(...ixes);
        const signed = await this.wallet.signTransaction(tx);
        const sig = await this.connection.sendRawTransaction(signed.serialize(), { skipPreflight: true });
        if (confirm) {
            await this.connection.confirmTransaction(sig, "confirmed");
        }
        return sig;
    };

    // Builder-driven multisig config changes (auth index 0): add/remove member, change threshold.
    // Sends create+add+activate (+ optional topup) in one Solana tx, then casts the caller's approval.
    private submitBuilderTx = async (
        msPDA: PublicKey,
        mutate: (b: SquadsTxBuilder) => Promise<SquadsTxBuilder>,
        opts: { includeTopUp?: boolean } = {},
    ) => {
        const builder = await this.squads.getTransactionBuilder(msPDA, 0);
        const [txInstructions, txPDA] = await (await mutate(builder)).getInstructions();
        const activateIx = await this.squads.buildActivateTransaction(msPDA, txPDA);
        const ixes: anchor.web3.TransactionInstruction[] = [];
        if (opts.includeTopUp) {
            const topup = await this.squads.checkGetTopUpInstruction(msPDA);
            if (topup) ixes.push(topup);
        }
        ixes.push(...txInstructions, activateIx);
        await this.sendAndConfirm(ixes);
        await this.squads.approveTransaction(txPDA);
        return this.squads.getTransaction(txPDA);
    };

    // Wraps a single arbitrary instruction as a vault-authority (auth index 1) multisig tx.
    // Creates, adds, activates, and approves the multisig tx in one Solana tx.
    private submitAsMultisigTx = async (msPDA: PublicKey, innerIx: anchor.web3.TransactionInstruction): Promise<PublicKey> => {
        const nextTxIndex = await this.squads.getNextTransactionIndex(msPDA);
        const [txPDA] = await getTxPDA(msPDA, new BN(nextTxIndex), this.programId);
        const createTxIx = await this.squads.buildCreateTransaction(msPDA, 1, nextTxIndex);
        const addIx = await this.squads.buildAddInstruction(msPDA, txPDA, innerIx, 1);
        const activateIx = await this.squads.buildActivateTransaction(msPDA, txPDA);
        const approveIx = await this.squads.buildApproveTransaction(msPDA, txPDA);
        await this.sendAndConfirm([createTxIx, addIx, activateIx, approveIx]);
        return txPDA;
    };

    getSquadExtended = async (ms: PublicKey) => {
        return this.squads.getMultisig(ms);
    };

    getAuthority = async (msPDA: PublicKey, authorityIndex: number = 1): Promise<PublicKey> => {
        const [pda] = await getAuthorityPDA(msPDA, new BN(authorityIndex), this.programId);
        return pda;
    };

    getVault = (msPDA: PublicKey): Promise<PublicKey> => this.getAuthority(msPDA, 1);
    
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
        const txsPDA = [...new Array(txIndex)].map( (_, i) => {
            const ind = new BN(i+1);
            const [txPDA] =  getTxPDA(ms.publicKey, ind, this.programId);
            return txPDA;
        })
        return this.squads.getTransactions(txsPDA)
    }
    
    createMultisig = async (threshold: number, createKey: PublicKey,members: PublicKey[]) => {
        const tx = await this.squads.createMultisig(threshold,createKey,members);
        // try to fund the PDA
        try {
            const vault = await this.getVault(tx.publicKey);
            const fundIx = anchor.web3.SystemProgram.transfer({
                fromPubkey: this.wallet.publicKey,
                toPubkey: vault,
                lamports: anchor.web3.LAMPORTS_PER_SOL / 1000,
            });
            await this.sendAndConfirm([fundIx]);
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

    getParsed = (account: anchor.web3.RpcResponseAndContext<anchor.web3.AccountInfo<Buffer | anchor.web3.ParsedAccountData> | null>) => {
        const {value} = account;
        if (value && value.data && 'parsed' in value.data) {
            const { data: {parsed}} = value;
            return parsed;
        }
        return null;
    };
    getValidatorWithdrawAuth = async (validatorAddress: anchor.web3.PublicKey) => {
        try {
            const parsedAccount = await this.connection.getParsedAccountInfo(validatorAddress) as any
            const parsed = this.getParsed(parsedAccount)
            if (parsed && parsed.type === "vote") {
                return parsed.info.authorizedWithdrawer
            }
        } catch (e) {
            return null
        }
        return null
    }

    createTransferWithdrawAuthTx = (msPDA: PublicKey, validatorId: PublicKey, currentAuthority: PublicKey, newAuthorizedPubkey: PublicKey) => {
        const authorizeIx = VoteProgram.authorize({
            authorizedPubkey: currentAuthority,
            newAuthorizedPubkey,
            voteAuthorizationType: { index: 1 },
            votePubkey: validatorId,
        }).instructions[0];
        return this.submitAsMultisigTx(msPDA, authorizeIx);
    };

    createSafeAuthorityTx = async (msPDA: PublicKey, programId: PublicKey, currentAuthority: PublicKey, newAuthority: PublicKey) => {
        const ix = await upgradeSetAuthorityIx(programId, currentAuthority, newAuthority);
        return this.submitAsMultisigTx(msPDA, ix);
    };
    
    executeTransaction = async (tx: PublicKey) => {
        return this.squads.executeTransaction(tx);
    };
    
    executeInstruction = async (tx: PublicKey, ix: PublicKey) => {
        return this.squads.executeInstruction(tx, ix);
    };

    executeTransactionBuilder = async (tx: PublicKey) => {
        return this.squads.buildExecuteTransaction(tx);
    };

    executeInstructionBuilder = async (tx: PublicKey, ix: PublicKey) => {
        return this.squads.buildExecuteInstruction(tx, ix);
    };

    approveTransaction = async (tx: PublicKey) => {
        return this.squads.approveTransaction(tx);
    }

    rejectTransaction = async (tx: PublicKey) => {
        return this.squads.rejectTransaction(tx);
    }

    cancelTransaction = async (tx: PublicKey) => {
        return this.squads.cancelTransaction(tx);
    }
    
    addKeyTransaction = (msPDA: PublicKey, key: PublicKey) =>
        this.submitBuilderTx(msPDA, b => b.withAddMember(key), { includeTopUp: true });

    removeKeyTransaction = (msPDA: PublicKey, key: PublicKey) =>
        this.submitBuilderTx(msPDA, b => b.withRemoveMember(key));

    changeThresholdTransaction = (msPDA: PublicKey, threshold: number) =>
        this.submitBuilderTx(msPDA, b => b.withChangeThreshold(threshold));

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

    async getWalletBalance(cb?: (balance: number) => void) {
        try {
            const lamports = await this.connection.getBalance(this.wallet.publicKey, "processed");
            const SOL = lamports / LAMPORTS_PER_SOL;
            if(cb){
                cb(SOL);
            }
            return SOL;
        }catch(e){
            return 0;
        }
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

        await this.sendAndConfirm([createATAIx], { confirm: false });
        return ataPubkey;
    }
}

export default API;
