// Action constants for inquirer prompts. The prompt (`inq/*.js`) sets these
// as the `value` of each choice; the handler (`menu.ts`) compares against
// them. This way renaming a user-visible choice label doesn't silently break
// the handler.

export const TOP = {
    VIEW: 'view',
    CREATE: 'create',
    EXIT: 'exit',
} as const;

export const MULTISIG = {
    TRANSACTIONS: 'transactions',
    CREATE_TX: 'create_tx',
    VAULT: 'vault',
    SETTINGS: 'settings',
    CREATE_ATA: 'create_ata',
    PROGRAM_AUTHORITY: 'program_authority',
    BULK_NFT: 'bulk_nft',
    VALIDATOR: 'validator',
    BACK: 'back',
} as const;

export const SETTINGS = {
    ADD_KEY: 'add_key',
    REMOVE_KEY: 'remove_key',
    CHANGE_THRESHOLD: 'change_threshold',
    BACK: 'back',
} as const;

export const TX_ACTION = {
    APPROVE: 'approve',
    REJECT: 'reject',
    EXECUTE: 'execute',
    CANCEL: 'cancel',
    ADD_IX: 'add_ix',
    ACTIVATE: 'activate',
    BACK: 'back',
} as const;
