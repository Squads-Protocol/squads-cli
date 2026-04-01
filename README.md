```
   _____   ____    __  __    ___     ____    _____
  / ___/  / __ \  / / / /   /   |   / __ \  / ___/
  \__ \  / / / / / / / /   / /| |  / / / /  \__ \ 
 ___/ / / /_/ / / /_/ /   / ___ | / /_/ /  ___/ / 
/____/  \___\_\ \____/   /_/  |_|/_____/  /____/  
                                                  
```

## Squads v3 CLI
Interact with Squads Protocol v3 via simple CLI.
### Requirements
Nodejs version >= 16
### Installing the CLI tool
`npm install -g @sqds/cli`

### Running the tool
Run `squads-cli` to start the tool; it will prompt for wallet path and cluster (unless you pass flags below).

### Cluster option
Pass a cluster RPC URL to skip the cluster prompt:

`squads-cli --cluster https://api.mainnet-beta.solana.com`

### Optional flags
Run `squads-cli --help` for the exact names. Useful options include `--computeUnitPrice` (priority fee in micro-lamports) and `--programId` / `--programManagerId` / `--txMetaProgramId` when you need to override program IDs.