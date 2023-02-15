#!/usr/bin/env node
import clear from 'clear';
import chalk from 'chalk';

import Menu from "./lib/menu.js";
import CliWallet from './lib/wallet.js';
import CliConnection from "./lib/connection.js";
import SetupWallet from "./lib/inq/walletPath.js";
import SetupCluster from "./lib/inq/cluster.js";
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers'

const VERSION = "1.3.0";

const argv = yargs(hideBin(process.argv)).options({
    cluster: { type: 'string'},
    programId: { type: 'string'},
    programManagerId: { type: 'string'},
  }).parseSync();

// console.log(pjson.version);
const load = async (initCluster = null, programId = null, programManagerId = null) => {
    clear();
    console.log(chalk.yellow('Starting Squads CLI...') + " Follow the prompts to get started")
    const {walletPath} = await SetupWallet();
    const cliWallet = new CliWallet(walletPath);
    let cliConnection;
    if(!initCluster){
        const {cluster} = await SetupCluster();
        cliConnection = new CliConnection(cluster);
    }else{
        cliConnection = new CliConnection(initCluster);
    }

    // start the menu
    new Menu(cliWallet, cliConnection, programId, programManagerId);
};

const help = async () => {
    clear();
    console.log("Squads CLI is in alpha, more commands and options are in progress.")
    console.log("For more information, visit https://github.com/squads-protocol/squads-cli");
};

let cluster = null;
let programId = null;
let programManagerId = null;
if (argv.cluster && argv.cluster.length > 0){
    cluster = argv.cluster;
}
if (argv.programId && argv.programId.length > 0){
    programId = argv.programId;
}
if (argv.programManagerId && argv.programManagerId.length > 0){
    programManagerId = argv.programManagerId;
}

if (argv.help){
    help();
}else if (argv.version || argv.v){
    console.log(VERSION);
}else {
    clear();
    load(cluster, programId, programManagerId);
}