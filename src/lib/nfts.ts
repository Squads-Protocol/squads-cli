import {programs} from "@metaplex/js";
import {TOKEN_PROGRAM_ID} from '@solana/spl-token';
import {getMultipleAccountsBatch, shortenTextEnd} from "./utils.js";
import axios from "axios";

export const checkIsNFT = async (connection, acc) => {
    try {
        const edition = await programs.metadata.Metadata.getEdition(connection, acc.account.data.parsed.info.mint)
        if (edition)
            return true;
    } catch (e) {
        return acc.account.data.parsed.info.tokenAmount.decimals === 0;
    }
}

export const getNFTAccounts = async (connection, publicKey) => {
    const { value } = await connection.getParsedTokenAccountsByOwner(publicKey, {programId: TOKEN_PROGRAM_ID});
    const tokenMap = value.map(async ({ account, pubkey }) => {
        const { data } = account;
        const pda = await programs.metadata.Metadata.getPDA(data.parsed.info.mint);

        return {
            account: pubkey,
            mint: data.parsed.info.mint,
            amount: data.parsed.info.tokenAmount,
            metadataPda: pda,
            metadataPdaUi: pda.toBase58(),
        };
    });

    return Promise.all(tokenMap)
        // filter for amount = 1
        .then(result => {
            return result.filter(ta => {
                return ta.amount.uiAmount > 0;
            })
        })
        // filter by metadata program key
        .then(filtered => {
            return getMultipleAccountsBatch(connection, filtered.map(f => f.metadataPda))
                .then(pdaRes => {

                    return pdaRes.map((mpr, i) => {
                        // try to create the Metadata object
                        let md = null;
                        try {
                            md = new programs.metadata.Metadata(filtered[i].mint, mpr.account);
                        } catch (e) {
                            // not a valid metadata
                            md = null;
                        }

                        if (md && (md.data.data.creators || md.data.tokenStandard === 1 || filtered[i].amount.decimals === 0)) {
                            return {
                                account: filtered[i].account,
                                metadata: md,
                                jsonData: null,
                                tokenModel: {
                                    amount: filtered[i].amount,
                                    source: filtered[i].account.toBase58(),
                                    mint: filtered[i].mint,
                                    symbol: shortenTextEnd(md.data.data.symbol, 4),
                                    decimals: 0,
                                    name: md.data.data.name
                                },
                            };
                        }
                        return null;
                    });

                })
                .then(mac => mac.filter(pmd => pmd));
        })
        .then(async (f) => {
            for (const model of f) {
                if (model) {
                    try {
                        model.jsonData = await axios.get(model.metadata.data.data.uri).then(response => response.data)
                    } catch (e) {
                        model.jsonData = model.metadata.data.data
                        model.jsonData.image = ""
                    }
                }
            }
            return f;
        })
};

export const getOldNFTAccounts = async (connection, publicKey) => {
    const { value } = await connection.getParsedTokenAccountsByOwner(publicKey, {programId: TOKEN_PROGRAM_ID});
    const tokenMap = value.map(async ({ account, pubkey }) => {
        const { data } = account;
        const pda = await programs.metadata.Metadata.getPDA(data.parsed.info.mint);
        return {
            account: pubkey,
            mint: data.parsed.info.mint,
            amount: data.parsed.info.tokenAmount,
            metadataPda: pda,
            metadataPdaUi: pda.toBase58(),
        };
    });

    return Promise.all(tokenMap)
        .then(result => {
            return result.filter(ta => {
                return ta.mint !== null;
            })
        })
        // filter by metadata program key
        .then(filtered => {
            return getMultipleAccountsBatch(connection, filtered.map(f => f.metadataPda))
                .then(pdaRes => {

                    return pdaRes.map((mpr, i) => {
                        // try to create the Metadata object
                        let md = null;
                        try {
                            md = new programs.metadata.Metadata(filtered[i].mint, mpr.account);
                        }
                        catch(e) {
                            // not a valid metadata
                            md = null;
                        }

                        if (md && (md.data.data.creators || md.data.tokenStandard === 1 || filtered[i].amount.decimals === 0)) {
                            return {
                                account: filtered[i].account,
                                metadata: md,
                                jsonData: null,
                                tokenModel: {
                                    amount: filtered[i].amount,
                                    source: filtered[i].account.toBase58(),
                                    mint: filtered[i].mint,
                                    symbol: shortenTextEnd(md.data.data.symbol, 4),
                                    decimals: 0,
                                    name: md.data.data.name
                                },
                            };
                        }
                        return null;
                    });

                })
                .then(mac => mac.filter(pmd => pmd));
        })
        .then(async (f) => {
            for (const model of f) {
                if (model) {
                    try {
                        model.jsonData = await axios.get(model.metadata.data.data.uri).then(response => response.data)
                    } catch (e) {
                        model.jsonData = model.metadata.data.data
                        model.jsonData.image = ""
                    }
                }
            }
            return f;
        })
};
