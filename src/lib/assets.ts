import {Connection, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {TokenListProvider} from "@solana/spl-token-registry";
import {lamports, toMetadata, toMetadataAccount, UnparsedMaybeAccount} from "@metaplex-foundation/js";
import {getMultipleAccountsBatch, shortenTextEnd} from "./utils.js";
import {getEditionAccount, getMetadataAccount} from "./nfts.js";
import type {AssetBundle, TokenAsset} from "../types.js";

const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

// Returns SOL + SPL token holdings for `userKey`. NFTs (detected by Edition
// account existence or decimals=0) are excluded from the displayed list.
//
// Previously this fetched metadata + edition + off-chain JSON per token
// sequentially (3N round-trips). Now it derives all PDAs up front and batches
// the on-chain lookups, dropping it to O(1) RPC batches regardless of token
// count. The off-chain JSON fetch (axios.get) was removed entirely — the
// result was never read.
export const getAssets = async (connection: Connection, userKey: PublicKey): Promise<AssetBundle> => {
    console.log("Getting accounts for:", userKey.toBase58());

    const [solLamports, parsedAccount, tokenList] = await Promise.all([
        connection.getBalance(userKey, "confirmed"),
        connection.getParsedTokenAccountsByOwner(userKey, { programId: TOKEN_PROGRAM_ID }),
        new TokenListProvider().resolve().then(k => k.filterByClusterSlug("mainnet-beta").getList()),
    ]);

    const usableTokens: TokenAsset[] = [{
        amount: solLamports / LAMPORTS_PER_SOL,
        source: userKey.toBase58(),
        mint: WRAPPED_SOL_MINT,
        symbol: 'SOL',
        decimals: 9,
        name: "Solana",
    }];

    // Exclude wrapped-SOL token accounts (the native SOL row already covers it).
    const splAccounts = parsedAccount.value.filter(
        a => a.account.data.parsed.info.mint !== WRAPPED_SOL_MINT
    );

    if (splAccounts.length > 0) {
        const mints = splAccounts.map(a => new PublicKey(a.account.data.parsed.info.mint));
        const metadataPDAs = mints.map(getMetadataAccount);
        const editionPDAs = mints.map(getEditionAccount);
        const [metadataAccounts, editionAccounts] = await Promise.all([
            getMultipleAccountsBatch(connection, metadataPDAs, "confirmed"),
            getMultipleAccountsBatch(connection, editionPDAs, "confirmed"),
        ]);

        const tokenListMap = new Map(tokenList.map(t => [t.address, t]));

        splAccounts.forEach((acc, i) => {
            const mintStr: string = acc.account.data.parsed.info.mint;
            const decimals: number = acc.account.data.parsed.info.tokenAmount.decimals;
            const amount: number = acc.account.data.parsed.info.tokenAmount.uiAmount;
            const source = acc.pubkey.toBase58();

            // NFT heuristic: has an Edition account OR decimals === 0.
            const isNFT = editionAccounts[i] !== null || decimals === 0;
            if (isNFT) return;

            // Prefer on-chain metadata for symbol/name when available.
            const metaEntry = metadataAccounts[i];
            if (metaEntry) {
                try {
                    const unparsed = {
                        ...metaEntry.account,
                        publicKey: metadataPDAs[i],
                        exists: true,
                        lamports: lamports(metaEntry.account.lamports),
                    } as UnparsedMaybeAccount;
                    const md = toMetadata(toMetadataAccount(unparsed));
                    usableTokens.push({
                        amount, source, mint: mintStr,
                        symbol: md.symbol,
                        decimals,
                        name: md.name,
                    });
                    return;
                } catch {
                    // fall through to token list / unknown
                }
            }

            // Fall back to the public SPL token registry.
            const listEntry = tokenListMap.get(mintStr);
            if (listEntry) {
                usableTokens.push({
                    amount, source, mint: listEntry.address,
                    symbol: listEntry.symbol, decimals,
                    name: listEntry.name,
                });
                return;
            }

            // Unknown token — show a truncated mint as the symbol.
            usableTokens.push({
                amount, source, mint: mintStr,
                symbol: shortenTextEnd(mintStr, 4),
                decimals, name: "UNKNOWN",
            });
        });
    }

    const displayTokens = usableTokens.map(a => ({
        Amount: a.amount,
        Account: a.source,
        Mint: a.mint,
        Symbol: a.symbol,
        Name: a.name,
    }));
    return { usableTokens, displayTokens };
};
