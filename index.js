#!/usr/bin/env node
import Menu from "./lib/menu.js";
import CliWallet from './lib/wallet.js';
import CliConnection from "./lib/connection.js";
import SetupWallet from "./lib/inq/walletPath.js";
import SetupCluster from "./lib/inq/cluster.js";

const load = async () => {
    const {walletPath} = await SetupWallet();
    const cliWallet = new CliWallet(walletPath);
    const {cluster} = await SetupCluster();
    const cliConnection = new CliConnection(cluster);

    // start the menu
    new Menu(cliWallet, cliConnection);
};
load();