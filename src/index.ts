#!/usr/bin/env node
import clear from 'clear';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';

import Menu from "./lib/menu.js";
import CliWallet from './lib/wallet.js';
import CliConnection from "./lib/connection.js";
import SetupWallet from "./lib/inq/walletPath.js";
import SetupCluster from "./lib/inq/cluster.js";
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers'
import {parseLedgerWallet} from "@marinade.finance/ledger-utils";

// Read package.json at runtime so --version stays in sync with the published
// package. __dirname points at the compiled bin/ directory, so ../package.json
// resolves whether installed globally (node_modules/@sqds/cli) or run from src.
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf8")) as { version: string };
const VERSION = pkg.version;

const argv = yargs(hideBin(process.argv)).options({
    cluster: { type: 'string'},
    programId: { type: 'string'},
    programManagerId: { type: 'string'},
    txMetaProgramId: { type: 'string'},
  }).parseSync();

const load = async (
    initCluster?: string,
    programId?: string,
    programManagerId?: string,
    txMetaProgramId?: string,
    computeUnitPrice?: number,
) => {
    clear();
    console.log(chalk.yellow('Starting Squads CLI...') + " Follow the prompts to get started")
    const {walletPath} = await SetupWallet();
    // parseLedgerWallet matches only the literal "usb://ledger" prefix; normalize
    // case so "USB://Ledger" etc. is also detected as a ledger URL.
    const normalizedWalletPath = walletPath.toLowerCase().startsWith("usb://ledger")
        ? "usb://ledger" + walletPath.slice("usb://ledger".length)
        : walletPath;
    const ledgerWallet = await parseLedgerWallet(normalizedWalletPath);
    const cliWallet = new CliWallet(normalizedWalletPath, ledgerWallet, computeUnitPrice);
    let cliConnection;
    if(!initCluster){
        const {cluster} = await SetupCluster();
        cliConnection = new CliConnection(cluster);
    }else{
        cliConnection = new CliConnection(initCluster);
    }

    // start the menu
    const cli = new Menu(cliWallet, cliConnection, programId, programManagerId, txMetaProgramId);
    cli.top();
};

const help = async () => {
    clear();
    console.log("Squads CLI is in alpha, more commands and options are in progress.")
    console.log("For more information, visit https://github.com/squads-protocol/squads-cli");
};

let cluster;
let programId;
let programManagerId;
let txMetaProgramId;
let computeUnitPrice;
if (argv.cluster && argv.cluster.length > 0){
    cluster = argv.cluster;
}
if (argv.programId && argv.programId.length > 0){
    programId = argv.programId;
}
if (argv.programManagerId && argv.programManagerId.length > 0){
    programManagerId = argv.programManagerId;
}
if (argv.txMetaProgramId && argv.txMetaProgramId.length > 0) {
    txMetaProgramId = argv.txMetaProgramId;
}
if (typeof argv.computeUnitPrice == "number") {
    computeUnitPrice = argv.computeUnitPrice;
}

// Graceful exit on Ctrl+C — inquirer 8 throws ExitPromptError on SIGINT which
// otherwise surfaces as an ugly unhandled rejection.
process.on("SIGINT", () => {
    console.log(chalk.blue("\nGoodbye!"));
    process.exit(0);
});
process.on("unhandledRejection", (reason) => {
    const msg = reason instanceof Error ? reason.message : String(reason);
    if (/ExitPromptError|force closed the prompt/i.test(msg)) {
        process.exit(0);
    }
    console.error(chalk.red("\nUnexpected error:"), reason);
    process.exit(1);
});

if (argv.help){
    help();
}else if (argv.version || argv.v){
    console.log(VERSION);
}else {
    clear();
    load(cluster, programId, programManagerId, txMetaProgramId, computeUnitPrice);
}
