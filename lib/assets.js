import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import {TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {checkIsNFT} from "./nfts.js";
import {TokenListProvider} from "@solana/spl-token-registry";
import {shortenTextEnd} from "./utils.js";
import {programs} from "@metaplex/js";
import axios from "axios";

export const getAssets = async (connection, userKey) => {
    console.log("Getting accounts for:", userKey.toBase58());
    const usableTokens = [];

    const parsedAccount = await connection.getParsedTokenAccountsByOwner(userKey, {
        programId: TOKEN_PROGRAM_ID,
    });

    const solInfo = await connection.getBalance(userKey);

    const solModel = {
        amount: solInfo / LAMPORTS_PER_SOL,
        source: userKey.toBase58(),
        mint: "So11111111111111111111111111111111111111112",
        symbol: 'SOL',
        decimals: 9,
        name: "Solana"
    }
    usableTokens.push(solModel)

    const tokenList = await new TokenListProvider().resolve().then((knownToken) => {
        return knownToken.filterByClusterSlug("mainnet-beta").getList();
    });

    for (const acc of parsedAccount.value) {
        if (acc.account.data.parsed.info.mint !== "So11111111111111111111111111111111111111112") {
            let isOnList = false;
            const isNFT = await checkIsNFT(connection, acc);
            if (acc.account.data.parsed.info.mint && !isNFT) {
                try {
                    const metadata = await programs.metadata.Metadata.findByMint(connection, acc.account.data.parsed.info.mint)
                    const resp = await axios.get(metadata.data.data.uri).then(response => response.data)

                    const tModel = {
                        amount: acc.account.data.parsed.info.tokenAmount.uiAmount,
                        source: acc.pubkey.toBase58(),
                        mint: acc.account.data.parsed.info.mint,
                        symbol: metadata.data.data.symbol,
                        decimals: acc.account.data.parsed.info.tokenAmount.decimals,
                        name: metadata.data.data.name
                    }
                    usableTokens.push(tModel)
                } catch (e) {
                    const hasTokenCheck = tokenList.filter((tkn) => {
                        return acc.account.data.parsed.info.mint === tkn.address;
                    });
                    if (hasTokenCheck.length > 0) {
                        isOnList = true;
                        const tModel = {
                            amount: acc.account.data.parsed.info.tokenAmount.uiAmount,
                            source: acc.pubkey.toBase58(),
                            mint: hasTokenCheck[0].address,
                            symbol: hasTokenCheck[0].symbol,
                            decimals: acc.account.data.parsed.info.tokenAmount.decimals,
                            name: hasTokenCheck[0].name
                        }
                        usableTokens.push(tModel)
                    }
                    if (!isOnList) {
                        const tModel = {
                            amount: acc.account.data.parsed.info.tokenAmount.uiAmount,
                            source: acc.pubkey.toBase58(),
                            mint: acc.account.data.parsed.info.mint,
                            symbol: shortenTextEnd(acc.account.data.parsed.info.mint, 4),
                            decimals: acc.account.data.parsed.info.tokenAmount.decimals,
                            name: "UNKNOWN"
                        }
                        usableTokens.push(tModel)
                    }
                }
            }
        }
    }
    // console.log(usableTokens)
    let displayTokens = usableTokens.map(a => {
        let out = a;
        out.source =  (a.source && a.source.length > 0) ? shortenTextEnd(a.source, 16) : a.source;
        out.mint =  (a.mint && a.mint.length > 0) ? shortenTextEnd(a.mint, 16) : a.mint;
        return out;
    });
    return {usableTokens, displayTokens};
}
