import {web3} from "@coral-xyz/anchor";

class CliConnection {
    connection: web3.Connection;
    cluster: string;
    constructor(hostUrl?: string){
        let cluster: string | undefined;
        if (hostUrl === "localnet"){
            cluster = "http://127.0.0.1:8899";
        }
        else if (hostUrl === "devnet"){
            cluster = "https://api.devnet.solana.com";
        }
        else if (hostUrl == null || hostUrl === "mainnet" || hostUrl === "mainnet-beta" || hostUrl === ""){
            cluster = "https://api.mainnet-beta.solana.com";
        }
        else {
            cluster = hostUrl;
        }
        if (!cluster){
            throw new Error("Invalid cluster provided");
        }
        this.cluster = cluster;
        this.connection = new web3.Connection(cluster);
    }
}

export default CliConnection;