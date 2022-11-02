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
const load = async () => {
    clear();
    console.log(chalk.yellow('Starting Squads CLI...') + " Follow the prompts to get started")
    const {walletPath} = await SetupWallet();
    const cliWallet = new CliWallet(walletPath);
    const {cluster} = await SetupCluster();
    const cliConnection = new CliConnection(cluster);

    // start the menu
    new Menu(cliWallet, cliConnection);
};
// console.log(process.argv[2]);
const option = process.argv[2];
switch(option){
    case "-v":
        clear();
        console.log("Squads CLI version: " + pjson.version);
        break;
    
    default:
        clear();
        load();
        break;
}