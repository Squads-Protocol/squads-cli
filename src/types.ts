// SDK runtime shapes derived from method signatures. The @sqds/sdk public
// index does not re-export these named types, so we recover them via
// Awaited<ReturnType<...>> rather than reaching into internal paths.

import type Squads from "@sqds/sdk";
import type { AnchorProvider } from "@coral-xyz/anchor";

// The anchor Wallet *interface* (not the NodeWallet class). Derived from
// AnchorProvider's constructor so we avoid reaching into anchor internals.
// Required because parseLedgerWallet returns an interface-conforming object
// that lacks the class's `payer` property.
export type AnchorWallet = ConstructorParameters<typeof AnchorProvider>[1];

export type MultisigAccount = Awaited<ReturnType<Squads["getMultisig"]>>;
export type TransactionAccount = Awaited<ReturnType<Squads["getTransaction"]>>;
export type InstructionAccount = Awaited<ReturnType<Squads["getInstruction"]>>;
export type SquadsTxBuilder = Awaited<ReturnType<Squads["getTransactionBuilder"]>>;

// Asset bundles returned by getAssets (lib/assets.ts).
export interface TokenAsset {
    amount: number;
    source: string;
    mint: string;
    symbol: string;
    decimals: number;
    name: string;
}

export interface AssetBundle {
    usableTokens: TokenAsset[];
    displayTokens: Array<{
        Amount: number;
        Account: string;
        Mint: string;
        Symbol: string;
        Name: string;
    }>;
}

// Tagged shapes for the tx-meta memo payloads written by the bulk NFT flows.
export type TxMetaPayload =
    | { type: "nftAuthorityUpdate" }
    | { type: "nftMassWithdraw"; amount: number; destination: string };

// Strip readonly modifiers — used to mutate metaplex NFT objects in-place
// where the upstream type marks fields readonly but the SDK expects them
// patched (e.g. SFT tokenStandard).
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };
