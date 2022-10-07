import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import inquirer from 'inquirer';
import * as anchor from "@project-serum/anchor";
import CLI from "clui";
import "console.table";
import {
    mainMenu,
    viewMultisigsMenu,
    multisigMainMenu,
    vaultMenu,
    multisigSettingsMenu,
    transactionsMenu,
    createMultisigCreateKeyInq,
    createMultisigMemberInq,
    createMultisigThresholdInq,
    createMultisigConfirmInq,
    promptProgramId,
    transactionPrompt,
} from "./inquirer.js";
import { loadCliWallet } from './wallet.js';
import {
    createMultisig,
    getTransactions,
    getSquads,
    getProgramDataAuthority,
    createSafeAuthorityTx,
    executeTransaction,
    approveTransaction,
    addKeyTransaction,
    removeKeyTransaction,
    changeThresholdTransaction,
} from './api.js';
import { DEFAULT_MULTISIG_PROGRAM_ID, getAuthorityPDA } from '@sqds/sdk';
import { BN } from 'bn.js';
import { PublicKey } from '@solana/web3.js';

const wallet = loadCliWallet();
const Spinner = CLI.Spinner;

class Menu{
    multisigs;
    wallet;
    constructor(wallet, multisigs) {
        this.multisigs = multisigs;
        this.wallet = wallet;
        this.top();
    }

    header = async () => {
        clear();
        console.log(
            chalk.yellow(
                figlet.textSync('SQUADS', { font: "Slant", horizontalLayout: 'full' })
            )
        );
        console.log( chalk.blue("Connected wallet: ") + chalk.white(wallet.publicKey.toBase58()));
        console.log("");
    }

    multisigList = async () => {
        this.header();
        const testList = this.multisigs.map((m, i) => {
            return m.publicKey.toBase58();
        });
        testList.push("<- Go back");
        const {action} = await viewMultisigsMenu(testList);
        if (action === "<- Go back") {
            this.top();
        }else{
            const chosenMultisig = this.multisigs.find(m => m.publicKey.toBase58() === action);
            this.multisig(chosenMultisig);
        }
    };

    multisig = async (ms) => {
        this.header();
        const {action} = await multisigMainMenu(ms);
        if (action === "<- Go back") {
            this.multisigList();
        }
        if (action === "Vault(s)") {
            this.vault(ms);
        }
        if  (action === "Settings") {
            this.settings(ms);
        }
        if (action === "Transactions") {
            const txs = await getTransactions(ms);
            this.transactions(txs, ms);
        }
        if (action === "Program Authority Transfer") {
            this.program(ms);
        }
    };

    transactions = async (txs, ms) => {
        this.header();
        const {action} = await transactionsMenu(txs);
        if(action === "<- Go back") {
            this.multisig(ms);
        }else{
            const txKey = action.split(" ")[0];
            const tx = txs.find(t => t.publicKey.toBase58() === txKey);
            this.transaction(tx, ms, txs);
        }
    };

    transaction = async (tx, ms, txs) => {
        this.header();
        const txData = [{status: Object.keys(tx.status)[0], approved: tx.approved.length, rejected: tx.rejected.length}];
        console.table(txData);
        console.log("View on the web:");
        console.log(chalk.yellow("https://v3.squads.so/transactions/" + ms.publicKey.toBase58() + "/tx/" + tx.publicKey.toBase58()));
        console.log("");
        const {action} = await transactionPrompt(tx);
        if(action === "<- Go back") {
            this.transactions(txs, ms);
        }else if (action === "Approve") {
            const {yes} = await inquirer.prompt({default: false, name: 'yes', type: 'confirm', message: `Approve this transaction?`});
            if (yes) {
                const status = new Spinner("Approving transaction...");
                status.start();
                const updatedTx = await approveTransaction(tx.publicKey);
                status.stop();
                const newInd = txs.findIndex(t => t.publicKey.toBase58() === updatedTx.publicKey.toBase58());
                txs.splice(newInd, 1, updatedTx);
                this.transaction(updatedTx, ms, txs);
            }else{
                this.transaction(tx, ms, txs);
            }        
        }else if (action === "Execute") {
            const {yes} = await inquirer.prompt({default: false, name: 'yes', type: 'confirm', message: `Execute this transaction?`});
            if (yes) {
                const status = new Spinner("Executing transaction...");
                status.start();
                const updatedTx = await executeTransaction(tx.publicKey);
                status.stop();
                const newInd = txs.findIndex(t => t.publicKey.toBase58() === updatedTx.publicKey.toBase58());
                txs.splice(newInd, 1, updatedTx);
                this.transaction(updatedTx, ms, txs);
            }else{
                this.transaction(tx, ms, txs);
            }
        }else{
            this.transaction(tx, ms, txs);
        }
    };

    vault = async (ms) => {
        this.header();
        const {action} = await vaultMenu();
        if (action === "<- Go back") {
            this.multisig(ms);
        }
    }

    settings = async (ms) => {
        this.header();
        const [vault] = await getAuthorityPDA(ms.publicKey, new BN(1,10), DEFAULT_MULTISIG_PROGRAM_ID);
        console.table([{
            "Threshold": ms.threshold,
            "Members": ms.keys.length,
            "Vault (Default Authority 1)": vault
        }]);
        const {action} = await multisigSettingsMenu();
        if (action === "Add a key") {
            this.addKey(ms);
        }else if (action === "Remove a key") {
            this.removeKey(ms);
        }else if (action === "Change threshold") {
            this.changeThreshold(ms);
        }else{
            this.multisig(ms);
        }
    }

    addKey = async (ms) => {
        const {memberKey} = await inquirer.prompt({default: "", name: 'memberKey', type: 'input', message: `Enter the public key of the member you want to add (base58):`});
        if (memberKey === "") {
            this.settings(ms);
        }else {
            const {yes} = await inquirer.prompt({default: false, name: 'yes', type: 'confirm', message: `Create transaction to add ${memberKey}?`});
            const newKey = new PublicKey(memberKey);
            if (yes) {
                try{
                    const status = new Spinner("Creating New Member Transaction...");
                    status.start();
                    await addKeyTransaction(ms.publicKey, newKey);
                    status.stop();
                    const newMs = await getMultisig(ms.publicKey);
                    this.multisig(newMs);
                }catch(e) {
                    console.log(e);
                    this.settings(ms);
                }
            }else {
                this.addKey(ms);
            }
        }
    };

    removeKey = async (ms) => {
        this.header();
        const choices = ms.keys.map(k => k.toBase58());
        choices.push("<- Go back");
        const {memberKey} = await inquirer.prompt({choices, name: 'memberKey', type: 'list', message: `Which key do you want to remove?`});
        if (memberKey === "<- Go back") {
            this.settings(ms);
        }else {            
            const {yes} = await inquirer.prompt({default: false, name: 'yes', type: 'confirm', message: `Create transaction to remove ${memberKey}?`});
            if (yes) {
                try {
                    const exKey = new PublicKey(memberKey);
                    const status = new Spinner("Creating Remove Member Transaction...");
                    status.start();
                    await removeKeyTransaction(ms.publicKey, exKey);
                    status.stop();
                    const newMs = await getMultisig(ms.publicKey);
                    this.multisig(newMs);
                }catch(e) {
                    console.log(e);
                    this.settings(ms);
                }
            }else {
                this.removeKey(ms);
            }
        }
    };

    changeThreshold = async (ms) => {
        this.header();
        const choices = ms.keys.map(k => k.toBase58());
        choices.push("<- Go back");
        const {threshold} = await inquirer.prompt({default: "", name: 'threshold', type: 'input', message: `Enter the new proposed threshold`});
        if (threshold === "") {
            this.settings(ms);
        }else {            
            const {yes} = await inquirer.prompt({default: false, name: 'yes', type: 'confirm', message: `Create transaction to change threshold to ${threshold}?`});
            if (yes) {
                try {
                    const status = new Spinner("Creating Change Threshold Transaction...");
                    status.start();
                    await changeThresholdTransaction(ms.publicKey, threshold);
                    status.stop();
                    const newMs = await getMultisig(ms.publicKey);
                    this.multisig(newMs);
                }catch(e) {
                    console.log(e);
                    this.settings(ms);
                }
            }else {
                this.settings(ms);
            }
        }
    };

    top = async () => {
        this.header();
        const {action} = await mainMenu();
        if(action === 'View my Multisigs') {
            this.multisigList();
        } else if (action === 'Create a new Multisig') {
            this.create();
        } else {
            chalk.blue("Goodbye!");
        }
    }

    program = async (ms) => {
        this.header();
        const {programId} = await promptProgramId();
        if (programId.length < 1) {
            this.multisig(ms);
        }else{
            const status = new Spinner('Fetching program data...');
            status.start();
            try {
                const programAuthority = await getProgramDataAuthority(new anchor.web3.PublicKey(programId));
                chalk.blue("Current program data authority: " + programAuthority);
                status.stop();
                if (programAuthority !== this.wallet.publicKey.toBase58()) {
                    await inquirer.prompt({default: false, name: 'action', type: 'input', message: `Connected wallet does not have authority over this program - Enter to continue`});
                    this.program(ms);
                }else{
                    this.programAuthority(ms, programAuthority, programId);
                }
            }catch(e){
                console.log(e);
                status.stop();
                await inquirer.prompt({default: false, name: 'action', type: 'input', message: `Program data authority not found - Enter to continue`});
                this.program(ms);
            }
        }
    }

    programAuthority = async (ms, currentAuthority, programId) => {
        this.header();
        const [vault] = await getAuthorityPDA(ms.publicKey, new BN(1), DEFAULT_MULTISIG_PROGRAM_ID);
        console.log(`This will create a safe upgrade authority transfer transaction of ${programId} to the Squad vault`);
        console.log("Program Address: " + chalk.blue(`${programId}`));
        console.log(`Multisig Address: ` + chalk.white(`${ms.publicKey.toBase58()}`));
        console.log(`Current Program Authority: ` + chalk.white(`${currentAuthority}`));
        console.log(`New Program Upgrade Authority: ` + chalk.green(vault.toBase58()) + chalk.white(` (Vault - authority index 1)`));
        const {action} = await inquirer.prompt({default: false, name: 'action', type: 'confirm', message: `Continue?`});
        if (action) {
            const status = new Spinner('Creating transaction...');
            status.start();
            try {
                const tx = await createSafeAuthorityTx(ms.publicKey, new PublicKey(programId), new PublicKey(currentAuthority), vault);
                status.stop();
                console.log(chalk.green("Transaction created!"));
                console.log(chalk.blue("Transaction ID: ") + chalk.white(tx));
                await inquirer.prompt({default: false, name: 'action', type: 'input', message: `Enter to continue`});
                this.multisig(ms);
            }catch(e){
                console.log(e);
                status.stop();
                await inquirer.prompt({default: false, name: 'action', type: 'input', message: `Transaction creation failed - Enter to continue`});
                this.program(ms);
            }
        }else{
            this.program(ms);
        }
    }

    create = async () => {
        this.header();
        let initKey = anchor.web3.Keypair.generate().publicKey.toBase58();
        const {createKey} = await createMultisigCreateKeyInq();
        if (createKey.length > 0) {
            initKey = createKey;
        }
        let members = [];
        const {member} = await createMultisigMemberInq();
        let newMember = member;
        while (newMember !== "") {
            if (members.indexOf("newMember") < 0) {
                members.push(newMember);
            }
            const {member} = await createMultisigMemberInq();
            newMember = member;
        }
        const {threshold} = await createMultisigThresholdInq();
        const {action} = await createMultisigConfirmInq(initKey, members, threshold);
        if (action) {
            const createMembers = members.map(m => new anchor.web3.PublicKey(m));
            createMembers.push(wallet.publicKey);
            const status = new Spinner("Creating multisig...");
            status.start();
            try {
                const ms = await createMultisig(
                    threshold,
                    new anchor.web3.PublicKey(initKey),
                    createMembers
                );
                status.stop();
                await inquirer.prompt({default: false, name: 'action', type: 'input', message: `Created new multisig! (${ms.publicKey.toBase58()}) Press enter to continue...`});
                const squads = await getSquads(wallet.publicKey);
                this.multisigs = squads;
            }catch(e) {
                await inquirer.prompt({default: false, name: 'action', type: 'input', message: `Error! (${e}) - Enter to continue`});
            }
            this.top();
        }else{
            this.top();
        }
    }
};

export default Menu;