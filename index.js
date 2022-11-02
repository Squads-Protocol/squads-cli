#!/usr/bin/env node
import clear from 'clear';
import chalk from 'chalk';

import Menu from "./lib/menu.js";
import CliWallet from './lib/wallet.js';
import CliConnection from "./lib/connection.js";
import SetupWallet from "./lib/inq/walletPath.js";
import SetupCluster from "./lib/inq/cluster.js";
import pjson from './package.json' assert {type: 'json'};

// console.log(pjson.version);
const load = async (initCluster = null) => {
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
    new Menu(cliWallet, cliConnection);
};

const help = async () => {
    clear();
    console.log("Squads CLI is in alpha, more commands and options are in progress.")
    console.log("For more information, visit https://github.com/squads-protocol/squads-cli");
};

// console.log(process.argv[2]);

const option = process.argv[2];
switch(option){
    case "-v":
        clear();
        console.log("Squads CLI version: " + pjson.version);
        break;
    
    case "-h":
        help();
        break;
    
    case "--help":
        help();
        break;
    
    case "--cluster":
        const c = (process.argv[3] && process.argv[3].length > 0) ? process.argv[3] : null;
        load(c);
        break;
    default:
        clear();
        load();
        break;
}