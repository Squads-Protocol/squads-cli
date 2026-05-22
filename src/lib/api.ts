import Squads, { getTxPDA, getAuthorityPDA } from "@sqds/sdk";
import * as anchor from "@coral-xyz/anchor";
import BN from "bn.js";
import chalk from "chalk";
import { getProgramData, upgradeSetAuthorityIx } from "./program.js";
import { getAssets } from "./assets.js";
import {getAssociatedTokenAddress,createAssociatedTokenAccountInstruction} from "@solana/spl-token";
import {idl} from "../info";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {Connection, LAMPORTS_PER_SOL, PublicKey, VoteProgram} from "@solana/web3.js";
import type CliConnection from "./connection.js";
import type { AnchorWallet, MultisigAccount, SquadsTxBuilder, TransactionAccount } from "../types.js";

// Below this balance, warn the user that the fee-paying wallet may not have
// enough SOL to cover the next tx's fees + rent. Heuristic, not a hard floor.
export const LOW_BALANCE_SOL = 0.1;

// Match the various ways Solana surfaces insufficient-funds errors:
//  - "Attempt to debit an account but found no record of a prior credit"
//  - "insufficient funds"
//  - InstructionError on the system program with Custom: 1
const looksLikeInsufficientFunds = (e: unknown): boolean => {
    const msg = e instanceof Error ? e.message : JSON.stringify(e);
    return /insufficient|debit an account but found no record/i.test(msg);
};

class API{
    squads;
    wallet;
    connection: Connection;
    cluster;
    programId: PublicKey;
    program;
    provider;
    programManagerId: PublicKey;
    constructor(wallet: AnchorWallet, connection: CliConnection, programId: PublicKey, programManagerId: PublicKey){
        this.programId = programId;
        this.programManagerId = programManagerId;
        this.squads = Squads.endpoint(connection.cluster, wallet, {commitmentOrConfig: "confirmed", multisigProgramId: this.programId, programManagerProgramId: this.programManagerId});
        this.wallet = wallet;
        this.cluster = connection.cluster;
        this.connection = connection.connection;
        this.provider = new anchor.AnchorProvider(this.connection, this.wallet, {preflightCommitment: "confirmed", commitment: "confirmed"});
        this.program = new anchor.Program(idl as anchor.Idl, this.programId, this.provider);
    }

    // Logs a yellow warning when the fee-paying wallet is below LOW_BALANCE_SOL.
    // Returns the current balance so callers can include it in their own messages.
    warnIfLowBalance = async (): Promise<number> => {
        const balance = await this.getWalletBalance();
        if (balance < LOW_BALANCE_SOL) {
            console.log(chalk.yellow(
                `\nWarning: fee-paying wallet ${this.wallet.publicKey.toBase58()} has ${balance.toFixed(4)} SOL (below ${LOW_BALANCE_SOL} SOL). Transaction may fail to cover fees/rent.`,
            ));
        }
        return balance;
    };

    private sendAndConfirm = async (
        ixes: anchor.web3.TransactionInstruction[],
        opts: { confirm?: boolean } = {},
    ): Promise<string> => {
        const { confirm = true } = opts;
        const balance = await this.warnIfLowBalance();
        const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
        const tx = new anchor.web3.Transaction({ blockhash, lastValidBlockHeight, feePayer: this.wallet.publicKey });
        tx.add(...ixes);
        const signed = await this.wallet.signTransaction(tx);
        try {
            const sig = await this.connection.sendRawTransaction(signed.serialize(), { skipPreflight: true });
            if (confirm) {
                await this.connection.confirmTransaction(sig, "confirmed");
            }
            return sig;
        } catch (e) {
            if (looksLikeInsufficientFunds(e)) {
                throw new Error(`Transaction failed: wallet ${this.wallet.publicKey.toBase58()} has insufficient SOL (current: ${balance.toFixed(4)} SOL).`);
            }
            throw e;
        }
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
        const [txPDA] = getTxPDA(msPDA, new BN(nextTxIndex), this.programId);
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
        const [pda] = getAuthorityPDA(msPDA, new BN(authorityIndex), this.programId);
        return pda;
    };

    getVault = (msPDA: PublicKey): Promise<PublicKey> => this.getAuthority(msPDA, 1);
    
    getSquads = async (_pubkey: PublicKey) => {
        // Find all Ms accounts where the connected wallet appears in the `keys`
        // Vec. Rather than fetching every Ms account on the program (tens of
        // thousands on mainnet) and filtering client-side, we run a memcmp
        // filter per possible member position. The keys Vec starts at offset
        // 58 (computed below from the IDL):
        //   8 discriminator + 2 threshold + 2 authorityIndex + 4 transactionIndex
        //   + 4 msChangeIndex + 1 bump + 32 createKey + 1 allowExternalExecute
        //   + 4 vec-length prefix = 58
        // We scan up to MS_SCAN_POSITIONS positions in parallel; multisigs that
        // place this wallet beyond that won't be discovered (rare in practice).
        const KEYS_OFFSET = 58;
        const MS_SCAN_POSITIONS = 10;
        const walletKey = this.wallet.publicKey.toBase58();
        const queries = Array.from({ length: MS_SCAN_POSITIONS }, (_, i) =>
            this.program.account.ms.all([
                { memcmp: { offset: KEYS_OFFSET + i * 32, bytes: walletKey } },
            ]),
        );
        const results = await Promise.all(queries);
        const seen = new Set<string>();
        const msPDAs: PublicKey[] = [];
        for (const batch of results) {
            for (const entry of batch) {
                const key = entry.publicKey.toBase58();
                if (seen.has(key)) continue;
                seen.add(key);
                msPDAs.push(entry.publicKey);
            }
        }
        return Promise.all(msPDAs.map(k => this.getSquadExtended(k)));
    };

    getTransactions = async (ms: MultisigAccount): Promise<TransactionAccount[]> => {
        const txIndex = ms.transactionIndex;
        const txsPDA = [...new Array(txIndex)].map((_, i) => {
            const ind = new BN(i + 1);
            const [txPDA] = getTxPDA(ms.publicKey, ind, this.programId);
            return txPDA;
        });
        const results = await this.squads.getTransactions(txsPDA);
        return results.filter((t): t is TransactionAccount => t !== null);
    }
    
    createMultisig = async (threshold: number, createKey: PublicKey, members: PublicKey[]) => {
        // The multisig is created on-chain by the SDK call below. After that succeeds the
        // CLI sends a small SOL transfer to seed the vault. If that funding step fails we
        // still return the created multisig — re-throwing would make the user think the
        // whole creation failed and leave an orphan multisig they don't know exists.
        const tx = await this.squads.createMultisig(threshold, createKey, members);
        try {
            const vault = await this.getVault(tx.publicKey);
            const fundIx = anchor.web3.SystemProgram.transfer({
                fromPubkey: this.wallet.publicKey,
                toPubkey: vault,
                lamports: anchor.web3.LAMPORTS_PER_SOL / 1000,
            });
            await this.sendAndConfirm([fundIx]);
        } catch (e) {
            console.log(`\nWarning: multisig was created at ${tx.publicKey.toBase58()}, but the initial vault funding (~0.001 SOL) failed.`);
            console.log(`You may want to manually send a small amount of SOL to the vault to cover rent for future transactions.`);
            console.log(`Funding error:`, e);
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
            const parsedAccount = await this.connection.getParsedAccountInfo(validatorAddress);
            const parsed = this.getParsed(parsedAccount);
            if (parsed && parsed.type === "vote") {
                return parsed.info.authorizedWithdrawer;
            }
        } catch (_e) {
            return null;
        }
        return null;
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

    private balanceErrorLogged = false;
    async getWalletBalance(cb?: (balance: number) => void) {
        try {
            const lamports = await this.connection.getBalance(this.wallet.publicKey, "processed");
            const SOL = lamports / LAMPORTS_PER_SOL;
            if(cb){
                cb(SOL);
            }
            return SOL;
        } catch (e) {
            if (!this.balanceErrorLogged) {
                this.balanceErrorLogged = true;
                console.log(`\nWarning: could not fetch wallet balance from RPC. Displayed balance may be inaccurate.`);
                console.log(`Error:`, e);
            }
            return 0;
        }
    }

    async createATA(mint: PublicKey, owner: PublicKey){
        const ataPubkey = await getAssociatedTokenAddress(mint,owner,true,TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
        const createATAIx = createAssociatedTokenAccountInstruction(
            this.wallet.publicKey,
            ataPubkey,
            owner,
            mint,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
        );

        await this.sendAndConfirm([createATAIx]);
        return ataPubkey;
    }
}

export default API;
