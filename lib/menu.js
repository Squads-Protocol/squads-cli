import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import inquirer from 'inquirer';
import * as anchor from "@project-serum/anchor";
import CLI from "clui";
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
} from "./inquirer.js";
import { loadCliWallet } from './wallet.js';
import {
    createMultisig,
    getTransactions,
    getSquads,
    getProgramDataAuthority
} from './api.js';

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
        console.log("Connected wallet: " + wallet.publicKey.toBase58());
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
        }
    };

    vault = async () => {
        this.header();
        const {action} = await vaultMenu();
        if (action === "<- Go back") {
            this.multisig(ms);
        }
    }

    settings = async () => {
        this.header();
        const {action} = await multisigSettingsMenu();
        if (action === "<- Go back") {
            this.multisig(ms);
        }
    }

    top = async () => {
        this.header();
        const {action} = await mainMenu();
        if(action === 'View my Multisigs') {
            this.multisigList();
        } else if (action === 'Create a new Multisig') {
            this.create();
        } else {
            console.log("Goodbye!");
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
                console.log("Current program data authority: " + programAuthority);
                status.stop();
                if (programAuthority !== this.wallet.publicKey.toBase58()) {
                    await inquirer.prompt({default: false, name: 'action', type: 'input', message: `Connected wallet does not have authority over this program - Enter to continue`});
                    this.program(ms);
                }else{
                    this.programAuthority(ms, programAuthority);
                }
            }catch(e){
                console.log(e);
                status.stop();
                await inquirer.prompt({default: false, name: 'action', type: 'input', message: `Program data authority not found - Enter to continue`});
                this.program(ms);
            }
        }
    }

    programAuthority = async (ms, currentAuthority) => {
        this.header();
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