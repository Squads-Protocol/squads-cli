```
   _____   ____    __  __    ___     ____    _____
  / ___/  / __ \  / / / /   /   |   / __ \  / ___/
  \__ \  / / / / / / / /   / /| |  / / / /  \__ \ 
 ___/ / / /_/ / / /_/ /   / ___ | / /_/ /  ___/ / 
/____/  \___\_\ \____/   /_/  |_|/_____/  /____/  
                                                  
```

## Squads CLI
Interact with the Squads Multisig Program through a simple CLI.
### Requirements
Nodejs version >= 16
### Installing the CLI tool
`npm install -g @sqds/cli`

### Running the tool
Running the simple command will start the tool and ask a few setup questions for the wallet and the network cluster.\
`squads-cli`

### Cluster Option
Providing the cluster will bypass the question upon startup\
`squads-cli --cluster https://api.mainnet-beta.solana.com`