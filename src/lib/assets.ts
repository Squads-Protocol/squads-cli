import {Connection, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {TokenListProvider} from "@solana/spl-token-registry";
import {lamports, toMetadata, toMetadataAccount, UnparsedMaybeAccount} from "@metaplex-foundation/js";
import {TokenStandard} from "@metaplex-foundation/mpl-token-metadata";
import {getMultipleAccountsBatch, shortenTextEnd} from "./utils.js";
import {getEditionAccount, getMetadataAccount} from "./nfts.js";
import type {AssetBundle, TokenAsset} from "../types.js";

const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

// Token standards that represent non-fungible assets. Anything else (Fungible,
// FungibleAsset, or metadata without a token standard) is treated as fungible.
const NON_FUNGIBLE_STANDARDS = new Set<TokenStandard>([
    TokenStandard.NonFungible,
    TokenStandard.NonFungibleEdition,
    TokenStandard.ProgrammableNonFungible,
    TokenStandard.ProgrammableNonFungibleEdition,
]);

// Returns SOL + SPL token holdings for `userKey`. NFTs (detected by Edition
// account existence, or by decoded non-fungible token-standard metadata) are
// excluded from the displayed list. Decimals are NOT used as an NFT signal:
// ordinary zero-decimal fungible/semi-fungible mints are real custody and must
// stay visible.
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
        provenance: 'registry',
    }];

    // Include wrapped-SOL token accounts — the native SOL row only reflects
    // lamports from getBalance, so WSOL held in SPL token accounts must be
    // listed separately or vault custody is understated.
    const splAccounts = parsedAccount.value;

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

            // Wrapped SOL: render explicitly so it is distinguishable from the
            // native SOL row (and never hits the NFT heuristic or metadata lookup).
            if (mintStr === WRAPPED_SOL_MINT) {
                usableTokens.push({
                    amount, source, mint: mintStr,
                    symbol: 'wSOL',
                    decimals,
                    name: "Wrapped SOL",
                    provenance: 'registry',
                });
                return;
            }

            // An Edition account is canonical proof of a non-fungible mint
            // (master editions for 1/1s, edition prints, and pNFTs all have one).
            // Decimals are NOT used as an NFT signal — ordinary zero-decimal
            // fungible/semi-fungible mints have no edition account and must stay
            // visible. Mints positively identified as non-fungible by token
            // standard are dropped below, after metadata decode.
            if (editionAccounts[i] !== null) return;

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
                    // Drop mints positively identified as non-fungible by their
                    // token standard, even without an edition account.
                    if (md.tokenStandard !== null && NON_FUNGIBLE_STANDARDS.has(md.tokenStandard)) {
                        return;
                    }
                    usableTokens.push({
                        amount, source, mint: mintStr,
                        symbol: md.symbol,
                        decimals,
                        name: md.name,
                        provenance: 'metadata',
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
                    provenance: 'registry',
                });
                return;
            }

            // Unknown token — show a truncated mint as the symbol.
            usableTokens.push({
                amount, source, mint: mintStr,
                symbol: shortenTextEnd(mintStr, 4),
                decimals, name: "UNKNOWN",
                provenance: 'unknown',
            });
        });
    }

    // Human-readable trust signal for the label source. Metadata labels are
    // attacker-controllable, so they are explicitly flagged as unverified.
    const provenanceLabel: Record<TokenAsset['provenance'], string> = {
        metadata: 'on-chain metadata (unverified)',
        registry: 'token registry',
        unknown: 'unknown',
    };

    const displayTokens = usableTokens.map(a => ({
        Amount: a.amount,
        Account: a.source,
        Mint: a.mint,
        Symbol: a.symbol,
        Name: a.name,
        Source: provenanceLabel[a.provenance],
    }));
    return { usableTokens, displayTokens };
};
