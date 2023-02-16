import {web3} from "@coral-xyz/anchor";

class CliConnection {
    connection;
    cluster;
    constructor(hostUrl?: string | undefined){
        let cluster;
        if (hostUrl === "localnet"){
            cluster = "http://127.0.0.1:8899";
        }
        else if (hostUrl === "devnet"){
            cluster = "https://api.devnet.solana.com";
        }
        else if (hostUrl === null || hostUrl === "mainnet" || hostUrl === "mainnet-beta"){
            cluster = "https://api.mainnet-beta.solana.com";
        }
        else if (hostUrl === ""){
            cluster = "https://api.mainnet-beta.solana.com";
        }
        else {
            cluster = hostUrl;
        }
        this.cluster = cluster;
        if (!cluster){
            throw new Error("Invalid cluster provided");
        }
        this.connection = new web3.Connection(cluster);
    }

}

export default CliConnection;