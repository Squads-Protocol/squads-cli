import inquirer from "inquirer";

const PRESETS = [
    { name: "mainnet-beta", value: "mainnet-beta" },
    { name: "devnet", value: "devnet" },
    { name: "localnet (http://127.0.0.1:8899)", value: "localnet" },
    { name: "Custom RPC URL...", value: "__custom__" },
];

const validateRpcUrl = (value) => {
    if (!value || value.length === 0) return 'Please enter an RPC URL';
    try {
        const u = new URL(value);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
            return 'URL must use http:// or https://';
        }
        return true;
    } catch {
        return 'Please enter a valid URL';
    }
};

export default async () => {
    const { choice } = await inquirer.prompt([
        {
            name: 'choice',
            type: 'list',
            message: 'Choose a Solana cluster:',
            choices: PRESETS,
            default: 'mainnet-beta',
        },
    ]);
    if (choice !== "__custom__") {
        return { cluster: choice };
    }
    const { cluster } = await inquirer.prompt([
        {
            name: 'cluster',
            type: 'input',
            message: 'Enter the RPC URL:',
            validate: validateRpcUrl,
        },
    ]);
    return { cluster };
};
