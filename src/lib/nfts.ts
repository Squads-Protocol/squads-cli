import {programs} from "@metaplex/js";
import {TOKEN_PROGRAM_ID} from '@solana/spl-token';
import {getMultipleAccountsBatch, shortenTextEnd} from "./utils.js";
import axios from "axios";
import {utils} from "@coral-xyz/anchor";
import CLI from "clui";
import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {Account, AccountInfo,lamports, Metaplex, parseMetadataAccount, toAccountInfo, toMetadata, toMetadataAccount, UnparsedAccount, UnparsedMaybeAccount} from "@metaplex-foundation/js";
import * as fs from "fs";
import { METAPLEX_PROGRAM_ID, updateMetadataAuthorityIx } from "./metadataInstructions.js";
import {} from '@metaplex-foundation/mpl-token-metadata';

import Squads from "@sqds/sdk";
import { metadata } from "figlet";

const {Progress} = CLI;
export const checkIsNFT = async (connection: Connection, acc: any) => {
    try {
        const edition = await programs.metadata.Metadata.getEdition(connection, acc.account.data.parsed.info.mint)
        if (edition)
            return true;
    } catch (e) {
        return acc.account.data.parsed.info.tokenAmount.decimals === 0;
    }
}

export const getNFTAccounts = async (connection: Connection, publicKey: PublicKey) => {
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

                    return pdaRes.map((mpr: any, i) => {
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
                                jsonData: {} as any,
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

export const getOldNFTAccounts = async (connection: Connection, publicKey: PublicKey) => {
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
                        if (!mpr) {
                            return null;
                        }
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
                                jsonData: {} as any,
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

type BatchTransactionCreationError = 'approval' | 'activation' | null;
// can fit 250 ixes
export const createAuthorityUpdateTx = async (squadsSdk: Squads, multisig: PublicKey, currentAuthority: PublicKey, newAuthority: PublicKey, metadataAccounts: PublicKey[], connection: Connection, ws: fs.WriteStream, safeSign?: boolean) => {
    // create the transaction to update the authority
    // attach the update authority ix to the transaction (up to 250)
    const attached = [];
    const attachFails = [];
    let txError: BatchTransactionCreationError = null;
    const queue = metadataAccounts;
    let txState = await squadsSdk.createTransaction(multisig, 1);
    ws.write(`Created Transaction at PDA: ${txState.publicKey.toBase58()}\n`);
    const batchLength = metadataAccounts.length;
    ws.write(`Attaching ${batchLength} instructions for each metadata account\n`);
    let hasError = false;
    const failures = [];
    while (queue.length > 0) {
        const metadataAccount = queue.shift();
        if (!metadataAccount) {
            break;
        }
        const ix = updateMetadataAuthorityIx(newAuthority, currentAuthority, metadataAccount);
        if (safeSign) {
            ix.keys.push({
                pubkey: newAuthority,
                isSigner: true,
                isWritable: false
            })
        }
        try {
            const addedIx = await squadsSdk.addInstruction(txState.publicKey, ix);
            if (addedIx) {
                ws.write(`${metadataAccount.toBase58()}\n`);
                attached.push(metadataAccount);
            }
        }catch (e) {
            attachFails.push(metadataAccount);
        }
    }
    // check the tx before activating
    txState = await squadsSdk.getTransaction(txState.publicKey);
    // if the transaction is not full and there are still items to attach, then add them
    if (txState.instructionIndex !== batchLength && attachFails.length > 0) {
        ws.write(`There were issues attaching some of the instructions, trying to attach them to tx ${txState.publicKey.toBase58()}\n`);
        while (attachFails.length > 0) {
            const metadataAccount = attachFails.shift();
            if (!metadataAccount) {
                break;
            }
            const ix = updateMetadataAuthorityIx(newAuthority, currentAuthority, metadataAccount);
            try {
                const addedIx = await squadsSdk.addInstruction(txState.publicKey, ix);
                if (addedIx) {
                    ws.write(`${metadataAccount.toBase58()}\n`);
                    attached.push(metadataAccount);
                }
            }catch (e) {
                hasError = true;
                ws.write(`Failed to attach ix for metadata account ${metadataAccount.toBase58()}\n`);
                failures.push(metadataAccount);
            }
        }
    }
    // activate the transaction
    try {
        await squadsSdk.activateTransaction(txState.publicKey);
        ws.write(`Successfully activated tx ${txState.publicKey.toBase58()}\n`);

        // approve the transaction 
        try {
            await squadsSdk.approveTransaction(txState.publicKey);
            ws.write(`Successfully voted to approved tx ${txState.publicKey.toBase58()}\n`);
        }catch(e){
            ws.write(`Failed to cast vote approval for tx ${txState.publicKey.toBase58()}\n`);
            txError = 'approval';
        }
    }catch(e){
        ws.write(`Failed to activate tx ${txState.publicKey.toBase58()}\n`);
        txError = 'activation';
    }

    return { attached, failures, txPDA: txState.publicKey, txError };
};

// this loads the json file which contains an array of mint addresses in base58,
// it then breaks it up into chunks of 250 maximum chunk size and then maps each to its
// derived metadata account derived from getMetadataAccount
export const prepareBulkUpdate = async (mints: PublicKey[]) => {
    // split the mints into an array of arrays of 250 maximum items
    // validate that the metadata accounts exist
    const chunks: PublicKey[][] = [];
    let currentChunk: PublicKey[] = [];
    for (const mint of mints) {
        if (currentChunk.length === 250) {
            chunks.push(currentChunk);
            currentChunk = [];
        }
        currentChunk.push(getMetadataAccount(mint));
    }
    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }
    return chunks;
};

export const getMetadataAccount = (mint: PublicKey) => {
    // to do  - put in real derivation seeds
    return PublicKey.findProgramAddressSync([utils.bytes.utf8.encode('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer()], METAPLEX_PROGRAM_ID)[0];
};

export const checkAllMetas = async (connection: Connection, metadataAccounts: PublicKey[]) => {
    const success = [];
    const failures = []
    for (const metaAccount of metadataAccounts) {
        const valid = await validateMetadataAccount(connection, metaAccount);
        if (valid) {
            success.push(metaAccount);
        }else{
            failures.push(metaAccount);
        }
    }
    return {
        success,
        failures
    }
};

// check that the metadata account exists and is owned by the metaplex program
export const validateMetadataAccount = async (connection: Connection, metadataAccount: PublicKey) => {
    const a = await connection.getAccountInfo(metadataAccount);
    // if account is null, or the account lamports is 0, or if the account owner is not the metaplex_program_id, return false
    if (!a || a.lamports === 0 || !a.owner.equals(METAPLEX_PROGRAM_ID)) {
        return false;
    }
    return true;
};

// checks that the current update authority matches the given authority
export const checkMetadataAuthority = async (connection: Connection, metadataAccount: PublicKey, authority: PublicKey) => {
    const a = await connection.getAccountInfo(metadataAccount);
    if (!a || a.lamports === 0 || !a.owner.equals(METAPLEX_PROGRAM_ID)) {
        return false;
    }
    if (a) {
        // parse the account data based on the Metadata struct
        const unparsedMaybeAccount =  {
            ...a,
            publicKey: metadataAccount,
            exists: true,
            lamports: lamports(a.lamports),
          } as UnparsedMaybeAccount;

        let metadata = toMetadata(toMetadataAccount(unparsedMaybeAccount));
        if (metadata.updateAuthorityAddress.equals(authority)) {
            return true;
        }
    }
    return false;
}

export const checkAllMetasAuthority = async (connection: Connection, metadataAccounts: PublicKey[], authority: PublicKey) => {
    const success = [];
    const failures = []
    for (const metaAccount of metadataAccounts) {
        try {
            const valid = await checkMetadataAuthority(connection, metaAccount, authority);
            if (valid) {
                success.push(metaAccount);
            }else{
                failures.push(metaAccount);
            }
        }catch(e) {
            failures.push(metaAccount);
        }
    }
    return {
        success,
        failures
    }
};

// loads the mint json and maps the mints to publickey
export const loadNFTMints = async (path: string) => {
    // load the json file
    const mintJSON = await fs.readFileSync(path, "utf8");
    const mints: PublicKey[] = JSON.parse(mintJSON);
    return mints.map(m => new PublicKey(m));
}

// creates a squads tx meta instruction for the tx to be referred later by type
export const sendTxMetaIx = async (msPDA: PublicKey, txPDA: PublicKey, member: PublicKey, dataObj: any, txMetaProgramId: PublicKey) => {
    const trackMetaSig = anchor.utils.sha256.hash(
        "global:track_meta"
      );
      const ixDescrim = Buffer.from(trackMetaSig, "hex");
      const trackMetaData = Buffer.concat([
        ixDescrim.slice(0, 8),
      ]);
    
      const meta = Buffer.from(JSON.stringify(dataObj));
      const accountsList = [];
    
      accountsList.push({
        pubkey: member,
        isSigner: true,
        isWritable: true
      });

    accountsList.push({
        pubkey: msPDA,
        isSigner: false,
        isWritable: false
    });
    
    accountsList.push({
        pubkey: txPDA,
        isSigner: false,
        isWritable: false
    });

      const metaLength =  new anchor.BN(meta.length);
      const metaData = Buffer.concat([trackMetaData, metaLength.toArrayLike(Buffer, "le", 4), meta]);
      return new anchor.web3.TransactionInstruction({
        keys: accountsList,
        programId: txMetaProgramId,
        data: metaData,
      });
};