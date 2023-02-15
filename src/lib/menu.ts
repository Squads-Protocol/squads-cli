import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import inquirer from 'inquirer';
import * as anchor from "@coral-xyz/anchor";
import CLI from "clui";
import "console.table";

import { getAuthorityPDA, DEFAULT_MULTISIG_PROGRAM_ID, DEFAULT_PROGRAM_MANAGER_PROGRAM_ID } from '@sqds/sdk';
import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';
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
    createTransactionInq,
    addInstructionInq,
    addTransactionInq,
    promptProgramId,
    transactionPrompt,
    basicConfirm,
    continueInq,
    createATAInq,
} from "./inq/index.js";

import API from "./api.js";

import { shortenTextEnd } from './utils.js';

const Spinner = CLI.Spinner;
class Menu{
    programId;
    programManagerId;
    multisigs = [];
    wallet;
    api;
    connection;
    constructor(wallet, connection, programId: string, programManagerId?: string) {
        this.wallet = wallet.wallet;
        this.connection = connection;
        this.programId = programId ? new PublicKey(programId) : DEFAULT_MULTISIG_PROGRAM_ID;
        this.programManagerId = programManagerId ? new PublicKey(programManagerId) : DEFAULT_PROGRAM_MANAGER_PROGRAM_ID;
        this.api = new API(wallet.wallet, connection, this.programId, this.programManagerId);
        this.top();
    }

    changeWallet(wallet){
        this.wallet = wallet;
        this.api = new API(wallet.wallet, this.connection, this.programId, this.programManagerId);
    }

    changeConnection(connection){
        this.connection = connection;
        this.api = new API(this.wallet, connection, this.programId, this.programManagerId);
    }

    header = async (vault = null) => {
        clear();
        console.log(
            chalk.yellow(
                figlet.textSync('SQUADS', { font: "Slant", horizontalLayout: 'full' })
            )
        );
        console.log( chalk.blue("Connected wallet: ") + chalk.white(this.wallet.publicKey.toBase58()));
        if(vault){
            try {
                console.log( chalk.blue("Vault address: ") + chalk.white(vault.toBase58()));
            }catch(e){
                // bad vault obj
            }
        }
        console.log("");
    }

    multisigList = async () => {
        const loadAuthorities = async (ms) => {
            return Promise.all(ms.map(async (msObj,i) => {
                const [mAuth] = await getAuthorityPDA(msObj.publicKey, new BN(1), this.api.programId);
                return {
                    value: i,
                    name: `${mAuth.toBase58()} (${shortenTextEnd(msObj.publicKey.toBase58(),6)})`,
                    short: shortenTextEnd(mAuth.toBase58(),6)
                }
            }));
        }
        this.header();
        const spinner = new Spinner("Loading multisigs...");
        spinner.start();
        try {
            this.multisigs = await this.api.getSquads(this.wallet.publicKey);
            spinner.stop();
            const testList = await loadAuthorities(this.multisigs); 

            const dIndex = testList.length;
            testList.push({name:"<- Go back", value: dIndex, short: "Go back"});

            const {action} = await viewMultisigsMenu(testList, dIndex);
            if (action === dIndex) {
                this.top();
            }else{
                const chosenMultisig = this.multisigs[action];
                this.multisig(chosenMultisig);
            }
        } catch (error) {
            spinner.stop();
            console.log(error);
            console.log("Try restarting the cli using a different Solana cluster");
            await continueInq();
            this.top();
        }
    };

    multisig = async (ms) => {
        const [vault] = await getAuthorityPDA(ms.publicKey, new BN(1), this.api.programId);
        this.header(vault);
        console.log("Info");
        console.log("-----------------------------------------------------------");
        console.log("Multisig account: " + chalk.white(ms.publicKey.toBase58()));
        console.log("(" + chalk.red("DO NOT") + " send assets to this address. Use ONLY vault address shown above)");
        console.log(" ");
        const {action} = await multisigMainMenu(ms);
        if (action === "Vault") {
            // load vault assets
            let status = new Spinner("Loading vault");
            status.start();
            const [vaultPDA] = await getAuthorityPDA(ms.publicKey, new BN(1), this.api.programId);
            const vault = await this.api.getVaultAssets(vaultPDA);
            status.stop();
            this.vault(ms,vaultPDA, vault);
        }
        else if  (action === "Settings") {
            this.settings(ms);
        }
        else if (action === "Transactions") {
            const status = new Spinner("Loading transactions...");
            status.start();
            const txs = await this.api.getTransactions(ms);
            status.stop();
            this.transactions(txs, ms);
        }
        else if (action === "Create new Transaction") {
            this.createTransaction(ms);
        }
        else if (action === "Program Authority Transfer") {
            this.program(ms);
        }
        else if (action === "Create new ATA") {
            this.ata(ms);
        }else{
            this.multisigList();
        }
    };

    transactions = async (txs, ms) => {
        const [vault] = await getAuthorityPDA(ms.publicKey, new BN(1), this.api.programId);
        this.header(vault);
        const {action} = await transactionsMenu(txs, this.wallet.publicKey);
        if(action === "<- Go back") {
            this.multisig(ms);
        }else{
            const txKey = action.split(" ")[0];
            const tx = txs.find(t => t.publicKey.toBase58() === txKey);
            this.transaction(tx, ms, txs);
        }
    };

    createTransaction = async (ms) => {
        const {assemble} = await inquirer.prompt({
            default: "",
            name: 'assemble',
            type: 'list',
            choices: ["Enter Transaction (base58 serialized message)", "Assemble Transaction (create draft)", "<- Go back"],
            message: 'How do you want to create the transaction?',
        });

        if(assemble.indexOf("Assemble") == 0){
            const {authority} = await createTransactionInq();
            const authorityBN = new BN(authority, 10);
            const [authorityPDA] = await getAuthorityPDA(ms.publicKey, authorityBN, this.api.programId);

            const status = new Spinner("Creating transaction...");
            console.log("This will create a new transaction draft for authority " + chalk.blue(authorityPDA.toBase58()));
            const {yes} = await basicConfirm("Continue?", false);
            if (yes){
                status.start();
                const tx = await this.api.createTransaction(ms.publicKey, parseInt(authority,10));
                status.stop();
                console.log("Transaction created!");
                console.log("Transaction key: " + chalk.blue(tx.publicKey.toBase58()));
                await continueInq();
                const txs = await this.api.getTransactions(ms);
                this.transactions(txs, ms);
            }else {
                this.multisig(ms);
            }
        }else if(assemble.indexOf("Enter") == 0) {
            const {authority} = await createTransactionInq();
            const authorityBN = new BN(authority, 10);
            const [authorityPDA] = await getAuthorityPDA(ms.publicKey, authorityBN, this.api.programId);

            const {rawIx} = await addTransactionInq();
            if (rawIx.length > 1) {
                const status = new Spinner("Creating transaction...");
                const status2 = new Spinner(`Adding instruction...`);
                try {
                    const txBuffer = anchor.utils.bytes.bs58.decode(rawIx);
                    clear();
                    this.header();
                    const rawTxMessage = anchor.web3.Message.from(txBuffer);
                    const tx = anchor.web3.Transaction.populate(rawTxMessage);
                    const ixes = tx.instructions;
                    console.log("This will create a new multisig transaction for authority/signer " + chalk.blue(authorityPDA.toBase58()));
                    const {yes} = await basicConfirm(`Create a transaction with ${ixes.length} instructions?`, false);
                    if (yes) {
                        
                        status.start();
                        const tx = await this.api.createTransaction(ms.publicKey, parseInt(authority, 10));
                        status.stop();
                        console.log(`Transaction ${tx.publicKey.toBase58()} created!`);
                        // add instructions to transaction
                        for (let i = 0; i < ixes.length; i++) {
                            console.log(`attaching instruction ${i + 1}/${ixes.length}`);
                            status2.start();
                            const ix = ixes[i];
                            await this.api.addInstruction(tx.publicKey, ix);
                            status2.stop();
                        }
                        console.log("Transaction created!");
                        // console.log("Transaction key: " + chalk.blue(tx.publicKey.toBase58()));
                        await continueInq();
                        const txs = await this.api.getTransactions(ms);
                        this.transactions(txs, ms);
                    }else{
                        this.multisig(ms);
                    }
                }catch (e) {
                    console.log("Error", e);
                    status.stop();
                    status2.stop();
                    await continueInq();
                    this.multisig(ms);
                }
            }else{
                this.multisig(ms);
            }
        }else{
            this.multisig(ms);
        }
    };

    transaction = async (tx, ms, txs) => {
        const [vault] = await getAuthorityPDA(ms.publicKey, new BN(1), this.api.programId);
        this.header(vault);
        const [authority] = await getAuthorityPDA(ms.publicKey, new BN(tx.authorityIndex,10), this.api.programId);
        const txData = [
            {
                status: Object.keys(tx.status)[0],
                authority: authority.toBase58(),
                approved: tx.approved.length,
                rejected: tx.rejected.length,
                instructions: tx.instructionIndex
            }
        ];
        console.table(txData);
        if(tx.status.active){
            console.log(chalk.red("Be sure to review all transaction instructions before approving or executing!"));
        }
        console.log("View on the web:");
        console.log(chalk.yellow("https://explorer.solana.com/address/" + tx.publicKey.toBase58()));
        console.log("");
        
        const {action} = await transactionPrompt(tx);
        if(action === "<- Go back") {
            this.transactions(txs, ms);
        }else if (action === "Approve") {
            const {yes} = await basicConfirm(`Approve this transaction?`,false);
            if (yes) {
                const status = new Spinner("Approving transaction...");
                status.start();
                try {
                    const updatedTx = await this.api.approveTransaction(tx.publicKey);
                    status.stop();
                    const newInd = txs.findIndex(t => t.publicKey.toBase58() === updatedTx.publicKey.toBase58());
                    txs.splice(newInd, 1, updatedTx);
                    console.log("Transaction approved");
                    await continueInq();
                    this.transaction(updatedTx, ms, txs);
                }catch(e){
                    status.stop();
                    console.log("Error!", e);
                    await continueInq();
                    this.transaction(tx, ms, txs);
                }
            }else{
                this.transaction(tx, ms, txs);
            }        
        }else if (action === "Execute") {
            const {yes} = await basicConfirm(`Execute this transaction?`,false);
            if (yes) {
                const status = new Spinner("Executing transaction...");
                status.start();
                try {
                    const updatedTx = await this.api.executeTransaction(tx.publicKey);
                    status.stop();
                    const newInd = txs.findIndex(t => t.publicKey.toBase58() === updatedTx.publicKey.toBase58());
                    txs.splice(newInd, 1, updatedTx);
                    console.log("Transaction executed");
                    const updatedMs = await this.api.squads.getMultisig(ms.publicKey);
                    await continueInq();
                    this.transaction(updatedTx, updatedMs, txs);
                }catch(e){
                    status.stop();
                    console.log(e.message);
                    await continueInq();
                    this.transaction(tx, ms, txs);
                }                

            }else{
                this.transaction(tx, ms, txs);
            }
        }else if(action === "Add Instruction"){
            const ix = await addInstructionInq();
            if (ix && ix.programId){
                clear();
                this.header();
                console.log("ProgramId: " + chalk.blue(ix.programId.toBase58()));
                console.log("Data: ", ix.data);
                console.table(ix.keys.map(a => {
                    return {
                        "Account": a.pubkey.toBase58(),
                        "Is signer": a.isSigner,
                        "Is writable": a.isWritable,
                    }
                }));
                const {yes} = await basicConfirm(`Add this instruction?`,false);
                if (yes) {
                    let newTx = tx;
                    const status = new Spinner("Adding instruction...");
                    status.start();
                    try {
                        await this.api.addInstruction(tx.publicKey, ix);
                        newTx = await this.api.getTransaction(tx.publicKey);
                        status.stop();
                        console.log("Instruction added!");
                        await continueInq();
                    }catch(e){
                        status.stop();
                        console.log(e);
                        await continueInq();
                        this.transaction(tx, ms, txs);
                    }
                    this.transaction(newTx, ms, txs);
                }
            }else{
                this.transaction(tx, ms, txs);
            }
        }
        else if (action === "Activate") {
            const {yes} = await basicConfirm(`Activate this transaction?`,false);
            if (yes) {
                const status = new Spinner("Activating transaction...");
                status.start();
                try {
                    const updatedTx = await this.api.activate(tx.publicKey);
                    status.stop();
                    const newInd = txs.findIndex(t => t.publicKey.toBase58() === updatedTx.publicKey.toBase58());
                    txs.splice(newInd, 1, updatedTx);
                    console.log("Activated Transaction");
                    await continueInq();
                    this.transaction(updatedTx, ms, txs);
                }catch(e){
                    status.stop();
                    console.log("Error!", e);
                    await continueInq();
                    this.transaction(tx, ms, txs);
                }
            }else{
                this.transaction(tx, ms, txs);
            }
        }
        else{
            this.transaction(tx, ms, txs);
        }
    };

    vault = async (ms, vaultPDA, vd) => {
        this.header();
        console.log("Vault Address: " + chalk.blue(vaultPDA.toBase58()));
        console.table(vd.displayTokens);
        await continueInq();
        this.multisig(ms);
    }

    useAsset = async (ms, asset) => {
        this.header();
    }

    settings = async (ms) => {
        const [vault] = await getAuthorityPDA(ms.publicKey, new BN(1,10), this.api.programId);
        this.header(vault);
        const owners = ms.keys.map(m => {
            return  m.toBase58();
        })
        console.table([{"Owners": owners}]);
        console.table([{
            "Threshold": ms.threshold,
            "Members": ms.keys.length,
            "Vault (Default Authority 1)": vault,
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
            const {yes} = await basicConfirm(`Create transaction to add ${memberKey}?`, false);
            const newKey = new PublicKey(memberKey);
            if (yes) {
                const status = new Spinner("Creating New Member Transaction...");
                status.start();
                try{
                    await this.api.addKeyTransaction(ms.publicKey, newKey);
                    status.stop();
                    console.log("Transaction created!");
                    await continueInq();
                    const newMs = await this.api.squads.getMultisig(ms.publicKey);
                    this.multisig(newMs);
                }catch(e) {
                    status.stop();
                    console.log("Error!", e);
                    await continueInq();
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
            const {yes} = await basicConfirm(`Create transaction to remove ${memberKey}?`, false);
            if (yes) {
                const status = new Spinner("Creating Remove Member Transaction...");
                status.start();
                try {
                    const exKey = new PublicKey(memberKey);
                    await this.api.removeKeyTransaction(ms.publicKey, exKey);
                    status.stop();
                    const newMs = await this.api.squads.getMultisig(ms.publicKey);
                    await continueInq();
                    this.multisig(newMs);
                }catch(e) {
                    status.stop();
                    console.log("Error!", e);
                    await continueInq();
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
        const {threshold} = await inquirer.prompt({
            default: "",
            name: 'threshold',
            type: 'input',
            message: `Enter the new proposed threshold`,
            validate: (t) => {
                if (parseInt(t,10)>ms.keys.length){
                    return "Threshold cannot be greater than the number of members";
                }else{
                    return true;
                }
            }
        });
        if (threshold === "") {
            this.settings(ms);
        }else {
            const {yes} = await basicConfirm(`Create transaction to change threshold to ${threshold}?`, false);
            if (yes) {
                const status = new Spinner("Creating Change Threshold Transaction...");
                status.start();
                try {
                    await this.api.changeThresholdTransaction(ms.publicKey, threshold);
                    status.stop();
                    const newMs = await this.api.squads.getMultisig(ms.publicKey);
                    await continueInq();
                    this.multisig(newMs);
                }catch(e) {
                    status.stop();
                    console.log("Error!", e);
                    await continueInq();
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
            clear();
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
                const programAuthority = await this.api.getProgramDataAuthority(new anchor.web3.PublicKey(programId));
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
                console.log('Program data authority not found');
                await continueInq();
                this.program(ms);
            }
        }
    }

    programAuthority = async (ms, currentAuthority, programId) => {
        const [vault] = await getAuthorityPDA(ms.publicKey, new BN(1), this.api.programId);
        this.header(vault);
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
                const tx = await this.api.createSafeAuthorityTx(ms.publicKey, new PublicKey(programId), new PublicKey(currentAuthority), vault);
                status.stop();
                console.log(chalk.green("Transaction created!"));
                console.log(chalk.blue("Transaction ID: ") + chalk.white(tx));
                await continueInq();
                this.multisig(ms);
            }catch(e){
                console.log(e);
                status.stop();
                console.log(`Transaction creation failed - Enter to continue`);
                await continueInq();
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
            createMembers.push(this.wallet.publicKey);
            const status = new Spinner("Creating multisig...");
            status.start();
            try {
                const ms = await this.api.createMultisig(
                    threshold,
                    new anchor.web3.PublicKey(initKey),
                    createMembers
                );
                status.stop();
                console.log(`Created new multisig! (${ms.publicKey.toBase58()})`);
                await continueInq();
                // const squads = await this.api.getSquads(this.wallet.publicKey);
                // this.multisigs = squads;
                this.multisigs.push(ms);
                this.multisig(ms);
            }catch(e) {
                status.stop();
                console.log(`Error! (${e})`);
                await continueInq();
                this.top();
            }
            
        }else{
            this.top();
        }
    }

    ata = async (ms) => {
        clear();
        const [vault] = await getAuthorityPDA(ms.publicKey, new BN(1), this.api.programId);
        this.header(vault);
        const ataKeys = await createATAInq(vault);
        if(ataKeys){
            const {yes} = await basicConfirm(`Create new ATA for mint ${ataKeys.mint} and owner ${ataKeys.owner} ?`);
            if (yes) {
                const status = new Spinner("Creating ATA...");
                status.start();
                try {
                    const newATA = await this.api.createATA(new PublicKey(ataKeys.mint), new PublicKey(ataKeys.owner));
                    status.stop();
                    console.log("Successfully created new ATA at: " + chalk.green(newATA.toBase58()));
                    await continueInq();
                }catch(e) {
                    status.stop();
                    console.log(`Error! (${e})`);
                    await continueInq();
                }
            }
        }
        this.multisig(ms);
    }
};

export default Menu;