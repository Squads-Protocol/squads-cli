import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import inquirer from 'inquirer';
import * as anchor from "@coral-xyz/anchor";
import CLI from "clui";
import "console.table";
import * as fs from 'fs';
import os from 'os';
import path from 'path';

import { DEFAULT_MULTISIG_PROGRAM_ID, DEFAULT_PROGRAM_MANAGER_PROGRAM_ID, getIxPDA } from '@sqds/sdk';
import { TXMETA_PROGRAM_ID } from './constants.js';
import {ComputeBudgetProgram, PublicKey, Transaction} from '@solana/web3.js';
import {
    mainMenu,
    viewMultisigsMenu,
    multisigMainMenu,
    multisigSettingsMenu,
    transactionsMenu,
    createMultisigCreateKeyInq,
    createMultisigMemberInq,
    createMultisigThresholdInq,
    createMultisigConfirmInq,
    createTransactionInq,
    addInstructionInq,
    addTransactionInq,
    authorityIndexInq,
    promptProgramId,
    transactionPrompt,
    basicConfirm,
    continueInq,
    createATAInq,
    nftMainInq,
    nftUpdateAuthorityInq,
    nftValidateMetasInq,
    nftUpdateAuthorityConfirmInq,
    nftUpdateAuthorityConfirmIncomingInq,
    nftUpdateShowFailedMintsInq,
    nftValidateOwnerInq,
    nftUpdateShowFailedMetasInq,
    nftSafeSigningInq,
    nftValidateCurrentAuthorityInq,
    nftUpdateTryFailuresInq,
    nftMintListInq,
    nftTransferDestinationInq,
} from "./inq/index.js";

import API from "./api.js";
import type CliWallet from "./wallet.js";
import type CliConnection from "./connection.js";
import type { MultisigAccount, TransactionAccount, AssetBundle } from "../types.js";
import { MULTISIG, SETTINGS, TOP, TX_ACTION } from "./menuActions.js";

import { shortenTextEnd } from './utils.js';
import {
    checkAllMetas,
    checkAllMetasAuthority,
    checkIfMintsAreValidAndOwnedByVault,
    createAuthorityUpdateTx, createWithdrawNftTx,
    estimateBulkUpdate, estimateBulkWithdrawNFT,
    getMetadataAccount,
    loadNFTMints,
    prepareBulkUpdate,
    sendTxMetaIx
} from './nfts.js';
import { updateMetadataAuthorityIx } from './metadataInstructions.js';
import {nftWithdrawConfirmInq} from "./inq/nftMenu";
import {validatorMainInq, validatorWithdrawAuthDestPrompt, validatorWithdrawAuthPrompt} from "./inq/validatorMenu";

const Spinner = CLI.Spinner;

// Compute-unit limit attached to each execute-instruction tx. Set to the
// per-tx maximum because some multisig-wrapped instructions (program upgrade
// authority changes, large CPI calls) can hit the default 200k budget.
const EXECUTE_IX_COMPUTE_UNIT_LIMIT = 1_400_000;

// Each menu method returns a thunk for the next menu (or null to exit).
// The outer run() loop awaits each thunk in sequence, so the parent frame
// is freed before the next menu starts — no stack growth across transitions
// and any thrown error lands in one place we can recover from.
type NextAction = (() => Promise<NextAction>) | null;

class Menu{
    programId: PublicKey;
    programManagerId: PublicKey;
    txMetaProgramId: PublicKey;
    multisigs: MultisigAccount[] = [];
    wallet;
    api;
    connection;
    walletBalance: number = 0;
    private balanceFetched = false;
    constructor(wallet: CliWallet, connection: CliConnection, programId?: string, programManagerId?: string, txMetaProgramId?: string) {
        this.wallet = wallet.wallet;
        this.connection = connection;
        this.programId = programId ? new PublicKey(programId) : DEFAULT_MULTISIG_PROGRAM_ID;
        this.programManagerId = programManagerId ? new PublicKey(programManagerId) : DEFAULT_PROGRAM_MANAGER_PROGRAM_ID;
        this.txMetaProgramId = txMetaProgramId ? new PublicKey(txMetaProgramId) : new PublicKey(TXMETA_PROGRAM_ID);
        this.api = new API(wallet.wallet, connection, this.programId, this.programManagerId);
        // Balance is fetched on first top() so the initial render doesn't show 0.
    }

    // Entry point. Drives the menu state machine: each menu returns the next
    // thunk, errors are caught here and recover by going back to top.
    run = async (): Promise<void> => {
        let next: NextAction = () => this.top();
        while (next !== null) {
            try {
                next = await next();
            } catch (e) {
                console.error(chalk.red("\nMenu error:"), e);
                await continueInq();
                next = () => this.top();
            }
        }
    };

    header = async (vault?: PublicKey) => {
        // Refresh balance in the background for the next render.
        this.api.getWalletBalance((balance) => { this.walletBalance = balance; });
        clear();
        console.log(`ProgramId: ${this.programId.toBase58()}`);
        console.log(
            chalk.yellow(
                figlet.textSync('SQUADS', { font: "Slant", horizontalLayout: 'full' })
            )
        );
        console.log( chalk.blue("Connected wallet: ") + chalk.white(this.wallet.publicKey.toBase58()) + ( this.walletBalance > 0 ? ( chalk.blue(" (") + chalk.white(this.walletBalance) + chalk.blue(" SOL)") ) : "" ));
        if(vault){
            try {
                console.log( chalk.blue("Vault address: ") + chalk.white(vault.toBase58()));
            }catch(e){
                // bad vault obj
            }
        }
        console.log("");
    }

    multisigList = async (): Promise<NextAction> => {
        const loadAuthorities = async (ms: MultisigAccount[]) => {
            return Promise.all(ms.map(async (msObj, i) => {
                const mAuth = await this.api.getVault(msObj.publicKey);
                return {
                    value: i,
                    name: `${mAuth.toBase58()} (${shortenTextEnd(msObj.publicKey.toBase58(), 6)})`,
                    short: shortenTextEnd(mAuth.toBase58(), 6),
                };
            }));
        };
        this.header();
        const spinner = new Spinner("Loading multisigs...");
        spinner.start();
        try {
            this.multisigs = await this.api.getSquads(this.wallet.publicKey);
            spinner.stop();
            const testList = await loadAuthorities(this.multisigs);

            const byAddressIndex = testList.length;
            testList.push({ name: "Open a multisig by address", value: byAddressIndex, short: "By address" });
            const dIndex = testList.length;
            testList.push({ name: "<- Go back", value: dIndex, short: "Go back" });

            const {action} = await viewMultisigsMenu(testList, dIndex);
            if (action === dIndex) return () => this.top();
            if (action === byAddressIndex) return () => this.openMultisigByAddress();
            return () => this.multisig(this.multisigs[action]);
        } catch (error) {
            spinner.stop();
            console.log(error);
            console.log("Try restarting the cli using a different Solana cluster");
            await continueInq();
            return () => this.top();
        }
    };

    // Direct-address fallback for the discovery list. Membership discovery scans
    // member slots and, while it now grows well past the old 10-slot cap, cannot
    // prove completeness for arbitrarily large multisigs. This lets an operator
    // open any multisig by its account address regardless of where their wallet
    // sits in the members list.
    openMultisigByAddress = async (): Promise<NextAction> => {
        const {address} = await inquirer.prompt({
            default: "",
            name: 'address',
            type: 'input',
            message: 'Enter the multisig account address (base58):',
        });
        if (!address || address.trim().length < 1) return () => this.multisigList();
        let msPubkey: PublicKey;
        try {
            msPubkey = new PublicKey(address.trim());
        } catch (e) {
            console.log(chalk.red("Invalid public key."));
            await continueInq();
            return () => this.multisigList();
        }
        const status = new Spinner("Loading multisig...");
        status.start();
        try {
            const ms = await this.api.getSquadExtended(msPubkey);
            status.stop();
            return () => this.multisig(ms);
        } catch (e) {
            status.stop();
            console.log(chalk.red("Could not load a multisig at that address. Check the address and cluster."));
            await continueInq();
            return () => this.multisigList();
        }
    };

    multisig = async (ms: MultisigAccount): Promise<NextAction> => {
        const vault = await this.api.getVault(ms.publicKey);
        this.header(vault);
        console.log("Info");
        console.log("-----------------------------------------------------------");
        console.log("(" + chalk.red("DO NOT") + " send assets to this address. Use ONLY vault address shown above)");
        console.log("Multisig account: " + chalk.white(ms.publicKey.toBase58()));
        console.log(" ");
        const {action} = await multisigMainMenu(ms);
        if (action === MULTISIG.VAULT) {
            const {authorityIndex} = await authorityIndexInq();
            const status = new Spinner("Loading vault");
            status.start();
            const vaultPDA = await this.api.getAuthority(ms.publicKey, authorityIndex);
            const vaultAssets = await this.api.getVaultAssets(vaultPDA);
            status.stop();
            return () => this.vault(ms, vaultPDA, vaultAssets, authorityIndex);
        }
        else if (action === MULTISIG.SETTINGS) {
            return () => this.settings(ms);
        }
        else if (action === MULTISIG.TRANSACTIONS) {
            const status = new Spinner("Loading transactions...");
            status.start();
            // first get/flash the ms to see if the transactionIndex has changed
            const msState = await this.api.squads.getMultisig(ms.publicKey);
            const txs = await this.api.getTransactions(msState);
            status.stop();
            return () => this.transactions(txs, msState);
        }
        else if (action === MULTISIG.CREATE_TX) return () => this.createTransaction(ms);
        else if (action === MULTISIG.PROGRAM_AUTHORITY) return () => this.program(ms);
        else if (action === MULTISIG.CREATE_ATA) return () => this.ata(ms);
        else if (action === MULTISIG.BULK_NFT) return () => this.nfts(ms);
        else if (action === MULTISIG.VALIDATOR) return () => this.validator(ms);
        else return () => this.multisigList();
    };

    transactions = async (txs: TransactionAccount[], ms: MultisigAccount): Promise<NextAction> => {
        const vault = await this.api.getVault(ms.publicKey);
        this.header(vault);
        const {action} = await transactionsMenu(txs, this.wallet.publicKey);
        if (action === null) return () => this.multisig(ms);
        const tx = txs.find(t => t.publicKey.toBase58() === action);
        if (!tx) return () => this.multisig(ms);
        return () => this.transaction(tx, ms, txs);
    };

    createTransaction = async (ms: MultisigAccount): Promise<NextAction> => {
        const {assemble} = await inquirer.prompt({
            default: "",
            name: 'assemble',
            type: 'list',
            choices: ["Enter Transaction (base58 serialized message)", "Assemble Transaction (create draft)", "<- Go back"],
            message: 'How do you want to create the transaction?',
        });

        if (assemble.indexOf("Assemble") == 0) {
            const {authority} = await createTransactionInq();
            const authorityPDA = await this.api.getAuthority(ms.publicKey, authority);

            const status = new Spinner("Creating transaction...");
            console.log("This will create a new transaction draft for authority " + chalk.blue(authorityPDA.toBase58()));
            const {yes} = await basicConfirm("Continue?", false);
            if (!yes) return () => this.multisig(ms);
            status.start();
            const tx = await this.api.createTransaction(ms.publicKey, authority);
            status.stop();
            console.log("Transaction created!");
            console.log("Transaction key: " + chalk.blue(tx.publicKey.toBase58()));
            await continueInq();
            // Re-fetch the multisig: createTransaction bumped transactionIndex on-chain,
            // and getTransactions derives the list from that index. Using the pre-create
            // snapshot would omit the proposal just created.
            const freshMs = await this.api.getSquadExtended(ms.publicKey);
            const txs = await this.api.getTransactions(freshMs);
            return () => this.transactions(txs, freshMs);
        }
        if (assemble.indexOf("Enter") == 0) {
            const {authority} = await createTransactionInq();
            const authorityPDA = await this.api.getAuthority(ms.publicKey, authority);

            const {rawIx} = await addTransactionInq();
            if (rawIx.length <= 1) return () => this.multisig(ms);
            const status = new Spinner("Creating transaction...");
            const status2 = new Spinner(`Adding instruction...`);
            try {
                const txBuffer = anchor.utils.bytes.bs58.decode(rawIx);
                clear();
                this.header();
                // The pasted blob is a serialized wire transaction, which is prefixed
                // with a signature array. Transaction.from strips the signatures before
                // parsing the message; Message.from would reinterpret signature bytes as
                // message header/instruction data, yielding different instructions.
                const populatedTx = anchor.web3.Transaction.from(txBuffer);
                const ixes = populatedTx.instructions;
                console.log("This will create a new multisig transaction for authority/signer " + chalk.blue(authorityPDA.toBase58()));

                // Render every imported instruction (program, accounts, data) so the
                // operator performs a full semantic review before anything is signed.
                // An imported blob can carry control-changing instructions (upgrade
                // authority, validator withdraw authority, etc.); showing only the
                // instruction count would let those be approved blindly.
                console.log(chalk.yellow(`\nReview all ${ixes.length} imported instruction(s) before continuing:\n`));
                ixes.forEach((ix, index) => {
                    console.log(chalk.bold(`Instruction ${index + 1}/${ixes.length}`));
                    console.log("ProgramId: " + chalk.blue(ix.programId.toBase58()));
                    console.log("Data: ", ix.data);
                    console.table(ix.keys.map(a => ({
                        "Account": a.pubkey.toBase58(),
                        "Is signer": a.isSigner,
                        "Is writable": a.isWritable,
                    })));
                });

                // Split the previously-automatic create→activate→approve flow into an
                // explicit choice. Approving casts an on-chain vote that can make the
                // transaction immediately executable, so it must be opt-in and clearly
                // labelled rather than bundled silently into "create".
                const {importAction} = await inquirer.prompt({
                    default: "",
                    name: 'importAction',
                    type: 'list',
                    choices: [
                        "Create draft only (review/approve later)",
                        "Create, activate, and approve now (casts your on-chain approval)",
                        "<- Cancel",
                    ],
                    message: 'These instructions can change control over vault assets. How do you want to proceed?',
                });
                const draftOnly = importAction.indexOf("Create draft") === 0;
                const approveNow = importAction.indexOf("Create, activate") === 0;
                if (!draftOnly && !approveNow) return () => this.multisig(ms);

                status.start();
                const tx = await this.api.createTransaction(ms.publicKey, authority);
                status.stop();
                console.log(`Transaction ${tx.publicKey.toBase58()} created!`);
                for (let i = 0; i < ixes.length; i++) {
                    console.log(`attaching instruction ${i + 1}/${ixes.length}`);
                    status2.start();
                    await this.api.addInstruction(tx.publicKey, ixes[i]);
                    status2.stop();
                }
                if (approveNow) {
                    await this.api.activate(tx.publicKey);
                    await this.api.approveTransaction(tx.publicKey);
                    console.log("Transaction created, activated, and approved!");
                } else {
                    console.log("Draft transaction created. Activate and approve it from the transactions menu after review.");
                }
                await continueInq();
                // Re-fetch the multisig so the just-created proposal (which bumped
                // transactionIndex on-chain) is included in the list, then route the
                // operator straight into its detail screen so they can immediately
                // review or cancel the live, already-activated-and-approved proposal.
                const freshMs = await this.api.getSquadExtended(ms.publicKey);
                const txs = await this.api.getTransactions(freshMs);
                const createdTx = txs.find(t => t.publicKey.toBase58() === tx.publicKey.toBase58());
                if (createdTx) return () => this.transaction(createdTx, freshMs, txs);
                return () => this.transactions(txs, freshMs);
            } catch (e) {
                console.log("Error", e);
                status.stop();
                status2.stop();
                await continueInq();
                return () => this.multisig(ms);
            }
        }
        return () => this.multisig(ms);
    };

    // Run a confirm → spinner → api call → splice-and-return-next flow for tx status changes
    // (approve/activate/reject/cancel). Errors and the "no" path both return the user to the
    // transaction screen with the original tx.
    private runTxAction = async (
        tx: TransactionAccount, ms: MultisigAccount, txs: TransactionAccount[],
        apiFn: (txPubkey: PublicKey) => Promise<TransactionAccount>,
        msgs: { confirm: string; spinner: string; success: string },
    ): Promise<NextAction> => {
        const {yes} = await basicConfirm(msgs.confirm, false);
        if (!yes) return () => this.transaction(tx, ms, txs);
        const status = new Spinner(msgs.spinner);
        status.start();
        try {
            const updatedTx = await apiFn(tx.publicKey);
            status.stop();
            const newInd = txs.findIndex(t => t.publicKey.toBase58() === updatedTx.publicKey.toBase58());
            txs.splice(newInd, 1, updatedTx);
            console.log(msgs.success);
            await continueInq();
            return () => this.transaction(updatedTx, ms, txs);
        } catch (e) {
            status.stop();
            console.log("Error!", e);
            await continueInq();
            return () => this.transaction(tx, ms, txs);
        }
    };

    transaction = async (tx: TransactionAccount, ms: MultisigAccount, txs: TransactionAccount[]): Promise<NextAction> => {
        const vault = await this.api.getVault(ms.publicKey);
        this.header(vault);
        const authority = await this.api.getAuthority(ms.publicKey, tx.authorityIndex);
        const creatorIsSelf = tx.creator.toBase58() === this.wallet.publicKey.toBase58();
        const txData = [
            {
                status: Object.keys(tx.status)[0],
                creator: tx.creator.toBase58() + (creatorIsSelf ? " (you)" : ""),
                authority: authority.toBase58(),
                approved: tx.approved.length,
                rejected: tx.rejected.length,
                instructions: tx.instructionIndex,
                executed: tx.executedIndex,
                remaining: tx.instructionIndex - tx.executedIndex,
            }
        ];
        console.table(txData);
        if (tx.executedIndex > 0 && tx.executedIndex < tx.instructionIndex) {
            console.log(chalk.yellow(`Partially executed: ${tx.executedIndex}/${tx.instructionIndex} instructions done — Execute will resume from instruction ${tx.executedIndex + 1}.`));
        }
        if(tx.status.active){
            console.log(chalk.red("Be sure to review all transaction instructions before approving or executing!"));
        }
        console.log("View on the web:");
        console.log(chalk.yellow("https://explorer.solana.com/address/" + tx.publicKey.toBase58()));
        console.log("");

        const {action} = await transactionPrompt(tx);
        if (action === TX_ACTION.BACK) return () => this.transactions(txs, ms);
        if (action === TX_ACTION.APPROVE) {
            return this.runTxAction(tx, ms, txs, t => this.api.approveTransaction(t), {
                confirm: "Approve this transaction?",
                spinner: "Approving transaction...",
                success: "Transaction approved",
            });
        }
        if (action === TX_ACTION.ACTIVATE) {
            return this.runTxAction(tx, ms, txs, t => this.api.activate(t), {
                confirm: "Activate this transaction?",
                spinner: "Activating transaction...",
                success: "Activated Transaction",
            });
        }
        if (action === TX_ACTION.REJECT) {
            return this.runTxAction(tx, ms, txs, t => this.api.rejectTransaction(t), {
                confirm: "Reject this transaction?",
                spinner: "Rejecting transaction...",
                success: "Transaction rejected",
            });
        }
        if (action === TX_ACTION.CANCEL) {
            return this.runTxAction(tx, ms, txs, t => this.api.cancelTransaction(t), {
                confirm: "Cancel this transaction?",
                spinner: "Cancelling transaction...",
                success: "Transaction cancel submitted",
            });
        }
        if (action === TX_ACTION.EXECUTE) {
            const {yes} = await basicConfirm(`Execute this transaction?`, false);
            if (!yes) {
                const updatedTx = await this.api.squads.getTransaction(tx.publicKey);
                return () => this.transaction(updatedTx, ms, txs);
            }
            await this.api.warnIfLowBalance();
            const status = new Spinner("Executing transaction...");
            status.start();
            let successfullyExecuted = 0;
            const additionalComputeBudgetInstruction = ComputeBudgetProgram.setComputeUnitLimit({
                units: EXECUTE_IX_COMPUTE_UNIT_LIMIT,
            });
            try {
                // Drive the execute mode from transaction state, not just the raw
                // instruction count. Once sequential execution has started
                // (executedIndex > 0) the program rejects executeTransaction with
                // PartialExecution (constraint: transaction.executed_index < 1), so
                // a partially executed transaction of ANY size must continue via
                // executeInstruction for the next PDA. The loop already resumes
                // from executedIndex + 1.
                if (tx.instructionIndex > 3 || tx.executedIndex > 0) {
                    for (let ixIndex = tx.executedIndex + 1; ixIndex <= tx.instructionIndex; ixIndex++) {
                        const [ixPDA] = getIxPDA(tx.publicKey, new anchor.BN(ixIndex), this.api.programId);
                        console.log("invoking instruction ", ixIndex);
                        try {
                            const ix = await this.api.executeInstructionBuilder(tx.publicKey, ixPDA);
                            const {blockhash, lastValidBlockHeight} = await this.api.connection.getLatestBlockhash();
                            const executeIxTx = new Transaction({lastValidBlockHeight, blockhash, feePayer: this.wallet.publicKey});
                            executeIxTx.add(additionalComputeBudgetInstruction, ix);
                            const signed = await this.wallet.signTransaction(executeIxTx);
                            const txid = await this.api.connection.sendRawTransaction(signed.serialize(), {skipPreflight: true});
                            console.log(`ix ${ixIndex} signature: ${txid}`);
                            await this.api.connection.confirmTransaction({signature: txid, blockhash, lastValidBlockHeight}, "confirmed");
                            await this.api.squads.getTransaction(tx.publicKey);
                        } catch (_e) {
                            // The confirmation may have failed (e.g. timeout) even though the
                            // instruction landed on-chain, so check fresh state before retrying.
                            const refreshed = await this.api.squads.getTransaction(tx.publicKey);
                            if (refreshed.executedIndex >= ixIndex) {
                                console.log(`ix ${ixIndex} landed on-chain despite the confirmation error, continuing`);
                            } else {
                                console.log("Error executing instruction, trying it again");
                                const ix = await this.api.executeInstructionBuilder(tx.publicKey, ixPDA);
                                const {blockhash, lastValidBlockHeight} = await this.api.connection.getLatestBlockhash();
                                const executeIxTx = new Transaction({lastValidBlockHeight, blockhash, feePayer: this.wallet.publicKey});
                                executeIxTx.add(additionalComputeBudgetInstruction, ix);
                                const signed = await this.wallet.signTransaction(executeIxTx);
                                const txid = await this.api.connection.sendRawTransaction(signed.serialize(), {skipPreflight: true});
                                console.log(`ix ${ixIndex} retry signature: ${txid}`);
                                await this.api.connection.confirmTransaction({signature: txid, blockhash, lastValidBlockHeight}, "confirmed");
                            }
                        }
                        await this.api.squads.getTransaction(tx.publicKey);
                        successfullyExecuted++;
                    }
                } else {
                    const ix = await this.api.executeTransactionBuilder(tx.publicKey);
                    const {blockhash, lastValidBlockHeight} = await this.api.connection.getLatestBlockhash();
                    const executeTx = new Transaction({lastValidBlockHeight, blockhash, feePayer: this.wallet.publicKey});
                    executeTx.add(additionalComputeBudgetInstruction, ix);
                    const signed = await this.wallet.signTransaction(executeTx);
                    const txid = await this.api.connection.sendRawTransaction(signed.serialize());
                    // Wait for "confirmed" (not "processed") before reporting success:
                    // single-instruction control changes (membership/threshold/authority
                    // transfers) take this fast path, and processed state can disappear
                    // on fork churn, making a governance change look durably complete
                    // when it is not.
                    await this.api.connection.confirmTransaction(txid, "confirmed");
                }
                status.stop();
                // Re-read at "confirmed" so the success message and refreshed state
                // reflect durable finality rather than the SDK's "processed" default.
                const updatedTx = await this.api.squads.getTransaction(tx.publicKey, "confirmed");
                const newInd = txs.findIndex(t => t.publicKey.toBase58() === tx.publicKey.toBase58());
                txs.splice(newInd, 1, updatedTx);
                console.log("Transaction executed");
                const updatedMs = await this.api.squads.getMultisig(ms.publicKey, "confirmed");
                await continueInq();
                return () => this.transaction(updatedTx, updatedMs, txs);
            } catch (e) {
                status.stop();
                console.log(`Executed ${successfullyExecuted} instructions`);
                console.log(`Terminated remaining execution because of an error: ${JSON.stringify(e)}`);
                const updatedTx = await this.api.squads.getTransaction(tx.publicKey);
                console.log(`On-chain executedIndex: ${updatedTx.executedIndex} of ${updatedTx.instructionIndex} instructions`);
                await continueInq();
                return () => this.transaction(updatedTx, ms, txs);
            }
        }
        if (action === TX_ACTION.ADD_IX) {
            const ix = await addInstructionInq();
            if (!ix || !ix.programId) return () => this.transaction(tx, ms, txs);
            clear();
            this.header();
            console.log("ProgramId: " + chalk.blue(ix.programId.toBase58()));
            console.log("Data: ", ix.data);
            console.table(ix.keys.map(a => ({
                "Account": a.pubkey.toBase58(),
                "Is signer": a.isSigner,
                "Is writable": a.isWritable,
            })));
            const {yes} = await basicConfirm(`Add this instruction?`, false);
            if (!yes) return () => this.transaction(tx, ms, txs);
            const status = new Spinner("Adding instruction...");
            status.start();
            try {
                await this.api.addInstruction(tx.publicKey, ix);
                const newTx = await this.api.squads.getTransaction(tx.publicKey);
                status.stop();
                console.log("Instruction added!");
                await continueInq();
                return () => this.transaction(newTx, ms, txs);
            } catch (e) {
                status.stop();
                console.log(e);
                await continueInq();
                return () => this.transaction(tx, ms, txs);
            }
        }
        return () => this.transaction(tx, ms, txs);
    };

    vault = async (ms: MultisigAccount, vaultPDA: PublicKey, vd: AssetBundle, authorityIndex: number = 1): Promise<NextAction> => {
        this.header();
        const indexLabel = authorityIndex === 1 ? `${authorityIndex} (default)` : `${authorityIndex}`;
        console.log(`Vault Address (authority index ${indexLabel}): ` + chalk.blue(vaultPDA.toBase58()));
        console.table(vd.displayTokens);
        await continueInq();
        return () => this.multisig(ms);
    };

    settings = async (ms: MultisigAccount): Promise<NextAction> => {
        const vault = await this.api.getVault(ms.publicKey);
        this.header(vault);
        const owners = ms.keys.map((m: PublicKey) => m.toBase58());
        console.table([{ "Owners": owners }]);
        console.table([{
            "Threshold": ms.threshold,
            "Members": ms.keys.length,
            "Vault (Default Authority 1)": vault,
        }]);
        const {action} = await multisigSettingsMenu();
        if (action === SETTINGS.ADD_KEY) return () => this.addKey(ms);
        if (action === SETTINGS.REMOVE_KEY) return () => this.removeKey(ms);
        if (action === SETTINGS.CHANGE_THRESHOLD) return () => this.changeThreshold(ms);
        return () => this.multisig(ms);
    };

    addKey = async (ms: MultisigAccount): Promise<NextAction> => {
        const {memberKey} = await inquirer.prompt({default: "", name: 'memberKey', type: 'input', message: `Enter the public key of the member you want to add (base58):`});
        if (memberKey === "") return () => this.settings(ms);
        const {yes} = await basicConfirm(`Create, activate, and cast your approval on a transaction to add ${memberKey}?`, false);
        if (!yes) return () => this.addKey(ms);
        const newKey = new PublicKey(memberKey);
        if (ms.keys.some((k) => k.equals(newKey))) {
            console.log(chalk.red(`${newKey.toBase58()} is already a member of this multisig — this would be a no-op that can invalidate other active proposals.`));
            await continueInq();
            return () => this.settings(ms);
        }
        const status = new Spinner("Creating New Member Transaction...");
        status.start();
        try {
            await this.api.addKeyTransaction(ms.publicKey, newKey);
            status.stop();
            console.log("Transaction created and activated — your approval vote has been cast.");
            await continueInq();
            const newMs = await this.api.squads.getMultisig(ms.publicKey);
            return () => this.multisig(newMs);
        } catch (e) {
            status.stop();
            console.log("Error!", e);
            await continueInq();
            return () => this.settings(ms);
        }
    };

    removeKey = async (ms: MultisigAccount): Promise<NextAction> => {
        this.header();
        const choices = ms.keys.map((k: PublicKey) => k.toBase58());
        choices.push("<- Go back");
        const {memberKey} = await inquirer.prompt({choices, name: 'memberKey', type: 'list', message: `Which key do you want to remove?`});
        if (memberKey === "<- Go back") return () => this.settings(ms);
        const {yes} = await basicConfirm(`Create, activate, and cast your approval on a transaction to remove ${memberKey}?`, false);
        if (!yes) return () => this.removeKey(ms);
        const status = new Spinner("Creating Remove Member Transaction...");
        status.start();
        try {
            const exKey = new PublicKey(memberKey);
            await this.api.removeKeyTransaction(ms.publicKey, exKey);
            status.stop();
            console.log("Transaction created and activated — your approval vote has been cast.");
            const newMs = await this.api.squads.getMultisig(ms.publicKey);
            await continueInq();
            return () => this.multisig(newMs);
        } catch (e) {
            status.stop();
            console.log("Error!", e);
            await continueInq();
            return () => this.settings(ms);
        }
    };

    changeThreshold = async (ms: MultisigAccount): Promise<NextAction> => {
        this.header();
        const {threshold} = await inquirer.prompt({
            default: "",
            name: 'threshold',
            type: 'input',
            message: `Enter the new proposed threshold`,
            validate: (t) => {
                const n = Number(t);
                if (!Number.isInteger(n) || n < 1) return "Threshold must be a whole number of at least 1";
                if (n > ms.keys.length) return "Threshold cannot be greater than the number of members";
                return true;
            },
        });
        if (threshold === "") return () => this.settings(ms);
        const thresholdInt = Number(threshold);
        if (thresholdInt === ms.threshold) {
            console.log(chalk.red(`The threshold is already ${ms.threshold} — this would be a no-op that can invalidate other active proposals.`));
            await continueInq();
            return () => this.settings(ms);
        }
        const {yes} = await basicConfirm(`Create, activate, and cast your approval on a transaction to change threshold to ${threshold}?`, false);
        if (!yes) return () => this.settings(ms);
        const status = new Spinner("Creating Change Threshold Transaction...");
        status.start();
        try {
            await this.api.changeThresholdTransaction(ms.publicKey, thresholdInt);
            status.stop();
            console.log("Transaction created and activated — your approval vote has been cast.");
            const newMs = await this.api.squads.getMultisig(ms.publicKey);
            await continueInq();
            return () => this.multisig(newMs);
        } catch (e) {
            status.stop();
            console.log("Error!", e);
            await continueInq();
            return () => this.settings(ms);
        }
    };

    top = async (): Promise<NextAction> => {
        if (!this.balanceFetched) {
            this.balanceFetched = true;
            this.walletBalance = await this.api.getWalletBalance();
        }
        this.header();
        const {action} = await mainMenu();
        if (action === TOP.VIEW) return () => this.multisigList();
        if (action === TOP.CREATE) return () => this.create();
        clear();
        console.log(chalk.blue("Goodbye!"));
        return null;
    };

    program = async (ms: MultisigAccount): Promise<NextAction> => {
        this.header();
        const vault = await this.api.getVault(ms.publicKey);
        const {programId} = await promptProgramId();
        if (programId.length < 1) return () => this.multisig(ms);
        const status = new Spinner('Fetching program data...');
        status.start();
        try {
            const programAuthority = await this.api.getProgramDataAuthority(new anchor.web3.PublicKey(programId));
            console.log(chalk.blue("Current program data authority: " + programAuthority));
            status.stop();
            if (programAuthority === this.wallet.publicKey.toBase58()) {
                return () => this.programAuthorityChange(ms, programAuthority, programId, {
                    key: vault,
                    label: "Vault - authority index 1",
                    direction: "to",
                });
            }
            if (programAuthority === vault.toBase58()) {
                return () => this.programAuthorityChange(ms, programAuthority, programId, {
                    key: this.wallet.publicKey,
                    label: "Your connected wallet",
                    direction: "out of",
                });
            }
            await inquirer.prompt({default: false, name: 'action', type: 'input', message: `Neither the connected wallet nor this Squad have authority over this program - Enter to continue`});
            return () => this.program(ms);
        } catch (e) {
            console.log(e);
            status.stop();
            console.log('Program data authority not found');
            await continueInq();
            return () => this.program(ms);
        }
    };

    private programAuthorityChange = async (
        ms: MultisigAccount,
        currentAuthority: string,
        programId: string,
        destination: { key: PublicKey; label: string; direction: "to" | "out of" },
    ): Promise<NextAction> => {
        const vault = await this.api.getVault(ms.publicKey);
        this.header(vault);
        console.log(`This will create a safe upgrade authority transfer transaction of ${programId} ${destination.direction} the Squad vault`);
        console.log("The transaction will also be activated and your approval vote cast automatically.");
        console.log("Program Address: " + chalk.blue(`${programId}`));
        console.log(`Multisig Address: ` + chalk.white(`${ms.publicKey.toBase58()}`));
        console.log(`Current Program Authority: ` + chalk.white(`${currentAuthority}`));
        console.log(`New Program Upgrade Authority: ` + chalk.green(destination.key.toBase58()) + chalk.white(` (${destination.label})`));
        const {action} = await inquirer.prompt({default: false, name: 'action', type: 'confirm', message: `Continue?`});
        if (!action) return () => this.program(ms);
        const status = new Spinner('Creating transaction...');
        status.start();
        try {
            const tx = await this.api.createSafeAuthorityTx(ms.publicKey, new PublicKey(programId), new PublicKey(currentAuthority), destination.key);
            status.stop();
            console.log(chalk.green("Transaction created and activated — your approval vote has been cast."));
            console.log(chalk.blue("Transaction ID: ") + chalk.white(tx));
            await continueInq();
            return () => this.multisig(ms);
        } catch (e) {
            console.log(e);
            status.stop();
            console.log(`Transaction creation failed - Enter to continue`);
            await continueInq();
            return () => this.program(ms);
        }
    };

    create = async (): Promise<NextAction> => {
        this.header();
        let initKey = anchor.web3.Keypair.generate().publicKey.toBase58();
        const {createKey} = await createMultisigCreateKeyInq();
        if (createKey.length > 0) initKey = createKey;
        const members: string[] = [];
        const walletKey = this.wallet.publicKey.toBase58();
        const {member} = await createMultisigMemberInq();
        let newMember = member;
        while (newMember !== "") {
            if (newMember !== walletKey && members.indexOf(newMember) < 0) {
                members.push(newMember);
            }
            const next = await createMultisigMemberInq();
            newMember = next.member;
        }
        const {threshold} = await createMultisigThresholdInq(members.length + 1);
        const {action} = await createMultisigConfirmInq(initKey, members, threshold);
        if (!action) return () => this.top();
        const createMembers = members.map(m => new anchor.web3.PublicKey(m));
        createMembers.push(this.wallet.publicKey);
        const status = new Spinner("Creating multisig...");
        status.start();
        try {
            const ms = await this.api.createMultisig(
                threshold,
                new anchor.web3.PublicKey(initKey),
                createMembers,
            );
            status.stop();
            console.log(`Created new multisig! (${ms.publicKey.toBase58()})`);
            await continueInq();
            this.multisigs.push(ms);
            return () => this.multisig(ms);
        } catch (e) {
            status.stop();
            console.log(`Error! (${e})`);
            await continueInq();
            return () => this.top();
        }
    }

    ata = async (ms: MultisigAccount): Promise<NextAction> => {
        clear();
        const vault = await this.api.getVault(ms.publicKey);
        this.header(vault);
        const ataKeys = await createATAInq(vault);
        if (ataKeys) {
            const {yes} = await basicConfirm(`Create new ATA for mint ${ataKeys.mint} and owner ${ataKeys.owner} ?`);
            if (yes) {
                const status = new Spinner("Creating ATA...");
                status.start();
                try {
                    const newATA = await this.api.createATA(new PublicKey(ataKeys.mint), new PublicKey(ataKeys.owner));
                    status.stop();
                    console.log("Successfully created new ATA at: " + chalk.green(newATA.toBase58()));
                    await continueInq();
                } catch (e) {
                    status.stop();
                    console.log(`Error! (${e})`);
                    await continueInq();
                }
            }
        }
        return () => this.multisig(ms);
    };

    nfts = async (ms: MultisigAccount, authorityIndex?: number): Promise<NextAction> => {
        clear();
        // Prompt for the authority index once on entry into the NFT flows, then
        // thread the selected index/PDA through every sub-flow. When re-entered
        // (e.g. returning from a sub-flow) the previously selected index is kept.
        const index = authorityIndex ?? (await authorityIndexInq()).authorityIndex;
        const vault = await this.api.getAuthority(ms.publicKey, index);
        this.header(vault);
        const indexLabel = index === 1 ? `${index} (default)` : `${index}`;
        console.log(`Using authority index ${indexLabel} - vault: ` + chalk.blue(vault.toBase58()));
        const {action} = await nftMainInq();
        if (action === 0) return () => this.nftAuthorityChange(ms, vault, index);
        if (action === 1) return () => this.nftValidateMetaAuthorities(ms, vault, index);
        if (action === 2) return () => this.nftBatchTransfer(ms, vault, index);
        return () => this.multisig(ms);
    };

    validator = async (ms: MultisigAccount): Promise<NextAction> => {
        clear();
        const vault = await this.api.getVault(ms.publicKey);
        this.header(vault);
        const {action} = await validatorMainInq();
        if (action === 0) return () => this.validatorWithdrawAuthorityChange(ms);
        return () => this.multisig(ms);
    };

    // Note: this flow is intentionally one-way (vault -> external). Moving a
    // validator's withdraw authority *into* the vault requires the *current*
    // authority's signature, which the CLI can't broker if it isn't held by
    // the wallet or the vault. Users who want to delegate authority to a Squad
    // should run that transfer through a separate tool that holds the current
    // authority's key.
    validatorWithdrawAuthorityChange = async (ms: MultisigAccount): Promise<NextAction> => {
        clear();
        const vault = await this.api.getVault(ms.publicKey);
        this.header(vault);
        const {validatorId} = await validatorWithdrawAuthPrompt();
        if (validatorId.length < 1) return () => this.validator(ms);
        const status = new Spinner('Fetching validator data...');
        status.start();
        try {
            const withdrawAuthority = await this.api.getValidatorWithdrawAuth(new anchor.web3.PublicKey(validatorId));
            if (!withdrawAuthority) throw Error("Not a validator");
            console.log(chalk.blue("Current validator withdraw authority: ") + withdrawAuthority);
            status.stop();
            if (withdrawAuthority !== vault.toBase58()) {
                await inquirer.prompt({default: false, name: 'action', type: 'input', message: `The given validator withdraw auth is not in this squad - Enter to continue`});
                return () => this.validator(ms);
            }
            const {destination} = await validatorWithdrawAuthDestPrompt();
            if (destination.length < 1) return () => this.validator(ms);
            return () => this.transferWithdrawAuthorityOut(ms, withdrawAuthority, validatorId, destination);
        } catch (e) {
            console.log(e);
            status.stop();
            console.log('The key used is not a validator one');
            await continueInq();
            return () => this.validator(ms);
        }
    };

    transferWithdrawAuthorityOut = async (ms: MultisigAccount, withdrawAuthority: string, validatorId: string, destination: string): Promise<NextAction> => {
        const vault = await this.api.getVault(ms.publicKey);
        this.header(vault);
        console.log(`This will create a transaction for the transfer of the validator (${validatorId}) withdraw authority out of the Squad vault`);
        console.log("The transaction will also be activated and your approval vote cast automatically.");
        console.log("Validator Address: " + chalk.blue(`${validatorId}`));
        console.log(`Withdraw Authority: ` + chalk.white(`${withdrawAuthority}`));
        console.log(`New Withdraw Authority: ` + chalk.white(`${destination}`));
        const {action} = await inquirer.prompt({default: false, name: 'action', type: 'confirm', message: `Continue?`});
        if (!action) return () => this.validator(ms);
        const status = new Spinner('Creating transaction...');
        status.start();
        try {
            const tx = await this.api.createTransferWithdrawAuthTx(ms.publicKey, new PublicKey(validatorId), new PublicKey(withdrawAuthority), new PublicKey(destination));
            status.stop();
            console.log(chalk.green("Transaction created and activated — your approval vote has been cast."));
            console.log(chalk.blue("Transaction ID: ") + chalk.white(tx));
            await continueInq();
            return () => this.multisig(ms);
        } catch (e) {
            console.log(e);
            status.stop();
            console.log(`Transaction creation failed - Enter to continue`);
            await continueInq();
            return () => this.validator(ms);
        }
    };

    nftAuthorityChange = async (ms: MultisigAccount, vault: PublicKey, authorityIndex: number): Promise<NextAction> => {
        clear();
        this.header(vault);
        const {type, publicKey, mintList} = await nftUpdateAuthorityInq();
        let newAuthority = vault;
        let error = false;
        if (type === 1) {
            if (publicKey && publicKey.length > 0) {
                newAuthority = new PublicKey(publicKey);
            } else {
                error = true;
            }
        }

        let allMints: PublicKey[] = [];
        try {
            allMints = loadNFTMints(mintList);
        } catch (e) {
            console.log("There was an error loading the mint list file: " + chalk.red(e));
            error = true;
        }

        if (error) {
            await continueInq();
            return () => this.nfts(ms, authorityIndex);
        }
        if (type === 0) return () => this.nftAuthorityChangeIncoming(ms, allMints, newAuthority, vault, authorityIndex);
        if (type === 1) return () => this.nftAuthorityChangeOutgoing(ms, allMints, newAuthority, vault, authorityIndex);
        await continueInq();
        return () => this.nfts(ms, authorityIndex);
    };

    // this can simply be transferred to the vault directly with metaplex program
    nftAuthorityChangeIncoming = async (ms: MultisigAccount, mintList: PublicKey[], newAuthority: PublicKey, vault: PublicKey, authorityIndex: number): Promise<NextAction> => {
        clear();
        this.header(vault);
        const {validate} = await nftValidateMetasInq();
        let error = false;
        if (validate) {
            // run validation
            const status = new Spinner("Checking derived metadata accounts...");
            status.start();
            const validateResult = await checkAllMetas(this.api.connection, mintList);
            status.stop();
            if (validateResult.failures.length > 0) {
                console.log(chalk.red(`There were some errors validating ${validateResult.failures.length} metadata accounts for certain mints:`));
                console.log(JSON.stringify(validateResult.failures));
                error = true;
                await continueInq();
            } else {
                // succesfully validated all the metadata accounts
                console.log(`Successfully validated ${validateResult.success.length} metadata accounts`);
                await continueInq();
            }
        }
        console.log('');
        let continueProcessing = false;
        if (!error) {
            const {confirm} = await nftUpdateAuthorityConfirmIncomingInq(newAuthority.toBase58(), mintList.length);
            if (confirm) {
                continueProcessing = true;
            }
        }
        if (continueProcessing) {
            await this.api.warnIfLowBalance();
            await continueInq();
            console.log("Transfering metadata update authority to the vault, this may take some time depending on the number of mints and your internet connection speed.");
            const status = new Spinner("Updating authority of the metadata accounts...");
            status.start();
            const successUpdates = [];
            const failedUpdates = [];
            for (const mint of mintList) {
                try {
                    const {blockhash, lastValidBlockHeight} = await this.api.connection.getLatestBlockhash();
                    const updateTx = new Transaction({lastValidBlockHeight, blockhash, feePayer: this.api.wallet.publicKey});
                    const updateIx = updateMetadataAuthorityIx(newAuthority, this.api.wallet.publicKey, getMetadataAccount(mint));
                    updateTx.add(updateIx);
                    const signed = await this.api.wallet.signTransaction(updateTx);
                    const txid = await this.api.connection.sendRawTransaction(signed.serialize());
                    await this.api.connection.confirmTransaction(txid, "processed");
                    successUpdates.push(mint.toBase58());
                }catch(e){
                    failedUpdates.push(mint.toBase58());
                }
            }
            status.stop();
            console.log(`Successfully transferred ${successUpdates.length} metadata accounts`);
            console.log(`Failed to transfer ${failedUpdates.length} metadata accounts.`);
            if (failedUpdates.length > 0) {
                const {showFail} = await nftUpdateShowFailedMintsInq();
                if(showFail){
                    console.log(JSON.stringify(failedUpdates));
                }
                const {rerun} = await nftUpdateTryFailuresInq(failedUpdates.length);
                if (rerun) {
                    const secondPass = [];
                    const secondPassFails = [];
                    const status = new Spinner(`Updating authority of the ${failedUpdates.length} remaining metadata accounts...`);
                    status.start();
                    for (const mint of failedUpdates) {
                        const mAccount = new PublicKey(mint);
                        try {
                            const {blockhash, lastValidBlockHeight} = await this.api.connection.getLatestBlockhash();
                            const updateTx = new Transaction({lastValidBlockHeight, blockhash, feePayer: this.api.wallet.publicKey});
                            const updateIx = updateMetadataAuthorityIx(newAuthority, this.api.wallet.publicKey, mAccount);
                            updateTx.add(updateIx);
                            const signed = await this.api.wallet.signTransaction(updateTx);
                            const txid = await this.api.connection.sendRawTransaction(signed.serialize());
                            await this.api.connection.confirmTransaction(txid, "processed");
                            secondPass.push(mint);
                        }catch(e){
                            secondPassFails.push(mint);
                        }
                    }
                    status.stop();
                    console.log(`Successfully transferred ${secondPass.length} more metadata accounts to the vault authority`);
                }
            }

            await continueInq();
        }
        return () => this.nfts(ms, authorityIndex);
    };

    // to move the authority out, transaction will need to be created
    nftAuthorityChangeOutgoing = async (ms: MultisigAccount, mintList: PublicKey[], newAuthority: PublicKey, vault: PublicKey, authorityIndex: number): Promise<NextAction> => {
        clear();
        this.header(vault);
        let error = false;
        const {ownerValidate} = await nftValidateOwnerInq();
        if (ownerValidate) {
            const status = new Spinner("Checking that the metadata accounts are valid and currently owned by the multisig vault...");
            status.start();
            const validateAuthorityResult = await checkAllMetasAuthority(this.api.connection, mintList, vault);
            status.stop();
            if (validateAuthorityResult.failures.length > 0) {
                console.log(chalk.red(`There were some errors validating authority ${validateAuthorityResult.failures.length} metadata accounts for certaint mints:`));
                error = true;
                const {showFail} = await nftUpdateShowFailedMetasInq();
                if(showFail){
                    console.log(JSON.stringify(validateAuthorityResult.failures));
                }
                await continueInq();
            } else {
                // succesfully validated all the metadata accounts
                console.log(`Successfully validated authority of ${validateAuthorityResult.success.length} metadata accounts`);
                await continueInq();
            }
        }

        console.log('');
        let continueProcessing = false;
        let buckets: PublicKey[][] = [];
        if (!error) {
            buckets = await prepareBulkUpdate(mintList);
            try {
                const estimateSpinner = new Spinner("Calculating the cost of initiating the transactions...");
                estimateSpinner.start();
                const estimate = await estimateBulkUpdate(this.api.squads, this.api.connection, buckets, this.wallet.publicKey);
                estimateSpinner.stop();
                console.log(`NOTICE: The cost estimate for staging these transactions is roughly ${estimate}SOL (this is an estimate, the actual cost may vary).`);
                console.log(` Make sure that the CLI wallet has enough to cover the creation.`);
            }catch(e) {
                console.log(`(Unable to calculate the estimate cost of initiating the transactions)`);
            }
            const {confirm} = await nftUpdateAuthorityConfirmInq(newAuthority.toBase58(), mintList.length, buckets.length);
            if (confirm) {
                continueProcessing = true;
            }
        }
        if (continueProcessing) {
            const {safeSign} = await nftSafeSigningInq();
            await this.api.warnIfLowBalance();
            const successfullyStagedMetas: PublicKey[] = [];
            console.log("Creating the multisig transactions, this may take some time depending on the number of mints and your internet connection speed.");
            const status = new Spinner("Initializing metadata authority update multisig transactions...");
            status.start();
            // setup log file in a fresh temp directory (avoid writing sensitive logs into cwd)
            const logtime = Date.now();
            const logDir = fs.mkdtempSync(path.join(os.tmpdir(), 'squads-authority-out-'));
            const logFilename = path.join(logDir,`authority-out-${logtime}.txt`);
            const transferOutWriteStream = fs.createWriteStream(logFilename, "utf8");
            const fullResults = [];
            try {
                transferOutWriteStream.write("Initiating bulk outgoing authority change transactions\n");
                for(const batch of buckets){
                    const metasAdded = await createAuthorityUpdateTx(this.api.squads, ms.publicKey, vault, newAuthority, batch, this.api.connection, transferOutWriteStream, safeSign, authorityIndex);
                    successfullyStagedMetas.push(...metasAdded.attached);

                    // if we haven't had an activation error, activate it
                    if (metasAdded.txError === 'none' || metasAdded.txError === 'approval') {
                        // send the txmeta if we have a valid tx metadata program
                        try {
                            const {blockhash, lastValidBlockHeight} = await this.api.connection.getLatestBlockhash();
                            const txMetaTx = new Transaction({lastValidBlockHeight, blockhash, feePayer: this.wallet.publicKey});
                            const txMetaIx = sendTxMetaIx(ms.publicKey, metasAdded.txPDA, this.wallet.publicKey, {type: 'nftAuthorityUpdate'}, this.txMetaProgramId);
                            txMetaTx.add(txMetaIx);
                            const signed = await this.wallet.signTransaction(txMetaTx);
                            const txid = await this.api.connection.sendRawTransaction(signed.serialize());
                            await this.api.connection.confirmTransaction(txid, "processed");
                        } catch (_e) {
                            console.log("Skipped internal squads tx meta memo");
                        }
                    }
                    fullResults.push(metasAdded);
                }
            } finally {
                transferOutWriteStream.close();
            }
            // write the json log file
            const logFilenameJson = path.join(logDir,`authority-out-mints-${logtime}.json`);
            // write the successful fullResults to the logFilenameJson
            fs.writeFileSync(logFilenameJson, JSON.stringify(fullResults, null, 2));
            status.stop();
            console.log(`Finished staging authority transfer txs for ${successfullyStagedMetas.length} metadata accounts`);
            console.log(`Output logs written to: ${logFilename}`);
            console.log(`Mint results written to: ${logFilenameJson}`);
            await continueInq();
        }
        return () => this.nfts(ms, authorityIndex);
    };

    nftValidateMetaAuthorities = async (ms: MultisigAccount, vault: PublicKey, authorityIndex: number): Promise<NextAction> => {
        clear();
        this.header(vault);
        let error = false;
        console.log("This process will check that all the provided mints specified have the proper matching metadata account update authority, and also possess valid metadata accounts.");
        const {mintList, type, publicKey} = await nftValidateCurrentAuthorityInq(vault);
        let allMints: PublicKey[] = [];
        try {
            allMints = loadNFTMints(mintList);
        } catch (e) {
            console.log("There was an error loading the mint list file: " + chalk.red(e));
            error = true;
        }

        let checkAuthority: PublicKey = vault;
        if (type === 1) {
            if(publicKey && publicKey.length > 0) {
                checkAuthority = new PublicKey(publicKey);
            }else {
                error = true;
            }
        }

        if (!error) {
            const status = new Spinner(`Checking that the metadata accounts are valid and currently owned by ${checkAuthority}...`);
            status.start();
            const validateAuthorityResult = await checkAllMetasAuthority(this.api.connection, allMints, checkAuthority);
            status.stop();
            if (validateAuthorityResult.failures.length > 0) {
                console.log(chalk.red(`There were some errors validating authority ${validateAuthorityResult.failures.length} metadata accounts:`));
                error = true;
                const {showFail} = await nftUpdateShowFailedMetasInq();
                if(showFail){
                    console.log(JSON.stringify(validateAuthorityResult.failures));
                }
                await continueInq();
            } else {
                // succesfully validated all the metadata accounts
                console.log(`Successfully validated authority of ${validateAuthorityResult.success.length} metadata accounts`);
                await continueInq();
            }
        }
        return () => this.nfts(ms, authorityIndex);
    };

    nftBatchTransfer = async (ms: MultisigAccount, vault: PublicKey, authorityIndex: number): Promise<NextAction> => {
        clear();
        this.header(vault);
        const {mintList} = await nftMintListInq();
        if (mintList && mintList.length > 0) {
            const status = new Spinner("Loading the mint list...");
            status.start();
            const mints = loadNFTMints(mintList);
            status.stop();
            const {success, failures} = await checkIfMintsAreValidAndOwnedByVault(this.api.connection, mints, vault)
            failures.forEach((mint) => {
                console.log(chalk.red("This NFT ("+mint+") is not owned by this squad"))
            })
            const {destination} = await nftTransferDestinationInq();
            let error = true
            if (destination && destination.length > 0) {
                try {
                    new PublicKey(destination)
                    error = false
                } catch (e) {
                    error = true
                }
            }
            console.log('');
            let continueProcessing = false;
            let buckets: PublicKey[][] = [];
            if (!error) {
                buckets = await prepareBulkUpdate(success);
                try {
                    const estimateSpinner = new Spinner("Calculating the cost of initiating the transactions...");
                    estimateSpinner.start();
                    const estimate = await estimateBulkWithdrawNFT(this.api.squads, this.api.connection, buckets, this.wallet.publicKey);
                    estimateSpinner.stop();
                    console.log(`NOTICE: The cost estimate for staging these transactions is roughly ${estimate}SOL (this is an estimate, the actual cost may vary).`);
                    console.log(` Make sure that the CLI wallet has enough to cover the creation.`);
                }catch(e) {
                    console.log(`(Unable to calculate the estimate cost of initiating the transactions)`);
                }
                const {confirm} = await nftWithdrawConfirmInq(destination, success.length, buckets.length);
                if (confirm) {
                    continueProcessing = true;
                }
            }
            if (continueProcessing) {
                await this.api.warnIfLowBalance();
                const successfullyStagedMetas: PublicKey[] = [];
                console.log("Creating the multisig transactions, this may take some time depending on the number of mints and your internet connection speed.");
                const status = new Spinner("Initializing NFTs transfer multisig transactions...");
                status.start();
                // setup log file
                const fullResults = [];
                for(const batch of buckets){
                    const metasAdded = await createWithdrawNftTx(this.api.squads, ms.publicKey, vault, new PublicKey(destination), batch, this.api.connection, authorityIndex);
                    successfullyStagedMetas.push(...metasAdded.attached);

                    // if we haven't had an activation error, activate it
                    if (metasAdded.txError === 'none' || metasAdded.txError === 'approval') {
                        // send the txmeta if we have a valid tx metadata program
                        try {
                            const {blockhash, lastValidBlockHeight} = await this.api.connection.getLatestBlockhash();
                            const txMetaTx = new Transaction({lastValidBlockHeight, blockhash, feePayer: this.wallet.publicKey});
                            const txMetaIx = sendTxMetaIx(ms.publicKey, metasAdded.txPDA, this.wallet.publicKey, {type: 'nftMassWithdraw', amount: metasAdded.attached.length, destination}, this.txMetaProgramId);
                            txMetaTx.add(txMetaIx);
                            const signed = await this.wallet.signTransaction(txMetaTx);
                            const txid = await this.api.connection.sendRawTransaction(signed.serialize());
                            await this.api.connection.confirmTransaction(txid, "processed");
                        }catch(e){
                            console.log("Skipped internal squads tx meta memo");
                        }
                    }
                    fullResults.push(metasAdded);
                }
                status.stop();
                console.log(`Finished staging NFTs transfer txs for ${successfullyStagedMetas.length} mints`);
            }
        }
        // this goes back to main nft menu
        await continueInq();
        return () => this.nfts(ms, authorityIndex);
    };
}

export default Menu;
