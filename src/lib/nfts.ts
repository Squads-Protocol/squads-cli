import {NodeWallet, programs} from "@metaplex/js";
import {TOKEN_PROGRAM_ID} from '@solana/spl-token';
import * as anchor from "@coral-xyz/anchor";
import {AccountInfo, Connection, Keypair, ParsedAccountData, PublicKey} from "@solana/web3.js";
import {
    lamports,
    Metaplex,
    token,
    toMetadata,
    toMetadataAccount,
    UnparsedMaybeAccount, walletAdapterIdentity
} from "@metaplex-foundation/js";
import * as fs from "fs";
import { METAPLEX_PROGRAM_ID, updateMetadataAuthorityIx } from "./metadataInstructions.js";
import {TokenStandard} from '@metaplex-foundation/mpl-token-metadata';

import Squads from "@sqds/sdk";
import type { Mutable, TxMetaPayload } from "../types.js";

type ParsedTokenAccount = { pubkey: PublicKey; account: AccountInfo<ParsedAccountData> };

export const checkIsNFT = async (connection: Connection, acc: ParsedTokenAccount) => {
    try {
        const edition = await programs.metadata.Metadata.getEdition(connection, acc.account.data.parsed.info.mint)
        if (edition)
            return true;
    } catch (_e) {
        return acc.account.data.parsed.info.tokenAmount.decimals === 0;
    }
}

type BatchTransactionCreationError = 'approval' | 'activation' | 'none';
// can fit 250 ixes
export const createAuthorityUpdateTx = async (squadsSdk: Squads, multisig: PublicKey, currentAuthority: PublicKey, newAuthority: PublicKey, mints: PublicKey[], connection: Connection, ws: fs.WriteStream, safeSign?: boolean) => {
    // create the transaction to update the authority
    // attach the update authority ix to the transaction (up to 250)
    const attached = [];
    const attachFails = [];
    let txError: BatchTransactionCreationError = 'none';
    const queue = mints;
    let txState = await squadsSdk.createTransaction(multisig, 1);
    ws.write(`Created Transaction at PDA: ${txState.publicKey.toBase58()}\n`);
    await squadsSdk.getTransaction(txState.publicKey);
    const batchLength = mints.length;
    ws.write(`Attaching ${batchLength} instructions for each metadata account\n`);
    let hasError = false;
    const failures = [];
    while (queue.length > 0) {
        const mint = queue.shift();
        if (!mint) {
            break;
        }
        const ix = updateMetadataAuthorityIx(newAuthority, currentAuthority, getMetadataAccount(mint));
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
                ws.write(`${mint.toBase58()}\n`);
                attached.push(mint);
            }
            // flash tx state
            await squadsSdk.getTransaction(txState.publicKey);
        }catch (e) {
            ws.write(`Failed to attach ix: ${e}\n`);
            attachFails.push(mint);
        }
    }
    // check the tx before activating
    txState = await squadsSdk.getTransaction(txState.publicKey);
    // if the transaction is not full and there are still items to attach, then add them
    if (txState.instructionIndex !== batchLength && attachFails.length > 0) {
        ws.write(`There were issues attaching some of the instructions, trying to attach them to tx ${txState.publicKey.toBase58()}\n`);
        while (attachFails.length > 0) {
            const mint = attachFails.shift();
            if (!mint) {
                break;
            }
            const ix = updateMetadataAuthorityIx(newAuthority, currentAuthority, getMetadataAccount(mint));
            try {
                const addedIx = await squadsSdk.addInstruction(txState.publicKey, ix);
                if (addedIx) {
                    ws.write(`${mint.toBase58()}\n`);
                    attached.push(mint);
                }
            }catch (e) {
                hasError = true;
                ws.write(`Failed to attach ix for metadata account for mint: ${mint.toBase58()}\n`);
                failures.push(mint);
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
            txError = 'none';
        }catch(e){
            ws.write(`Failed to cast vote approval for tx ${txState.publicKey.toBase58()}\n`);
            txError = 'approval';
        }
    }catch(e){
        ws.write(`Failed to activate tx ${txState.publicKey.toBase58()}\n`);
        txError = 'activation';
        ws.write(`Retrying tx activation for ${txState.publicKey.toBase58()}\n`);

        // try one more time
        await squadsSdk.activateTransaction(txState.publicKey);
        ws.write(`Successfully activated tx ${txState.publicKey.toBase58()} on second attempt\n`);

        // approve the transaction 
        try {
            await squadsSdk.approveTransaction(txState.publicKey);
            ws.write(`Successfully voted to approved tx ${txState.publicKey.toBase58()}\n`);
            txError = 'none';
        }catch(e){
            ws.write(`Failed to cast vote approval for tx ${txState.publicKey.toBase58()}\n`);
            txError = 'approval';
        }
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
        currentChunk.push(mint);
    }
    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }
    return chunks;
};

export const getMetadataAccount = (mint: PublicKey) => {
    // to do  - put in real derivation seeds
    return PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer()], METAPLEX_PROGRAM_ID)[0];
};

export const checkAllMetas = async (connection: Connection, mints: PublicKey[]) => {
    const success = [];
    const failures = []
    for (const mint of mints) {
        const valid = await validateMetadataAccount(connection, getMetadataAccount(mint));
        if (valid) {
            success.push(mint);
        }else{
            failures.push(mint);
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

export const checkAllMetasAuthority = async (connection: Connection, mints: PublicKey[], authority: PublicKey) => {
    const success = [];
    const failures = []
    for (const mint of mints) {
        try {
            const valid = await checkMetadataAuthority(connection, getMetadataAccount(mint), authority);
            if (valid) {
                success.push(mint);
            }else{
                failures.push(mint);
            }
        }catch(e) {
            failures.push(mint);
        }
    }
    return {
        success,
        failures
    }
};

// loads the mint json and maps the mints to publickey. The file must contain
// a JSON array of base58 mint addresses. Duplicates are silently de-duplicated.
export const loadNFTMints = (path: string): PublicKey[] => {
    const mintJSON = fs.readFileSync(path, "utf8");
    const parsed: unknown = JSON.parse(mintJSON);
    if (!Array.isArray(parsed)) {
        throw new Error("Mint list file must contain a JSON array of base58 mint addresses");
    }
    const seen = new Set<string>();
    const mints: PublicKey[] = [];
    parsed.forEach((entry, i) => {
        if (typeof entry !== "string" || entry.length === 0) {
            throw new Error(`Mint list entry ${i} is not a non-empty string`);
        }
        if (seen.has(entry)) return;
        seen.add(entry);
        try {
            mints.push(new PublicKey(entry));
        } catch {
            throw new Error(`Mint list entry ${i} ("${entry}") is not a valid base58 public key`);
        }
    });
    return mints;
};

// creates a squads tx meta instruction for the tx to be referred later by type
export const sendTxMetaIx = (msPDA: PublicKey, txPDA: PublicKey, member: PublicKey, dataObj: TxMetaPayload, txMetaProgramId: PublicKey) => {
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

// rough calculation of how much SOL the process will take
export const estimateBulkUpdate = async (sdk: Squads, connection: Connection, buckets: PublicKey[][], testKey: PublicKey) => {
    // iterate through each bucket, and create a transaction, then create an instruction for each item in each bucket
    let ixBytes = 0;
    const metaIx = updateMetadataAuthorityIx(testKey, testKey, testKey);
    const testIx = await sdk.buildAddInstruction(testKey, testKey, metaIx, 0);
    ixBytes = testIx.data.length;
    // reduce the buckets to the total number of instructions
    const totalBytes = buckets.reduce((acc, cur) => acc + cur.length, 0) * ixBytes;
    const rent = await connection.getMinimumBalanceForRentExemption(totalBytes);
    return rent / anchor.web3.LAMPORTS_PER_SOL;
};

export const estimateBulkWithdrawNFT = async (sdk: Squads, connection: Connection, buckets: PublicKey[][], testKey: PublicKey) => {
    let totalBytes = buckets.reduce((acc, cur) => acc + cur.length, 0) * 740; // Metaplex transfer Ix
    totalBytes += buckets.length * 210 // MsTx rent
    const rent = await connection.getMinimumBalanceForRentExemption(totalBytes);
    return rent / anchor.web3.LAMPORTS_PER_SOL;
};

export const checkIfMintsAreValidAndOwnedByVault = async (connection: Connection, mints: PublicKey[], vault: PublicKey) => {
    const metaplex = new Metaplex(connection);

    const success = []
    const failures = []

    try {
        const loadedNFTs = await metaplex.nfts().findAllByMintList({
            mints: mints
        });
        const allTokens = await connection.getParsedTokenAccountsByOwner(vault, {programId: TOKEN_PROGRAM_ID});
        for (let index = 0; index < loadedNFTs.length; index++) {
            const nft = loadedNFTs[index];
            const mint = mints[index];
            if (!nft) {
                failures.push(mint.toBase58());
                continue;
            }
            const found = allTokens.value
                .filter((value) => value.account.data.parsed.info.tokenAmount.uiAmount > 0)
                .find((value) => value.account.data.parsed.info.mint === mint.toBase58());
            if (!found)
                failures.push(mint.toBase58());
            else
                success.push(mint);
        }
    } catch (e) {
        console.log(e)
    }
    return {success,failures}
}

export const createWithdrawNftTx = async (squadsSdk: Squads, multisig: PublicKey, vault: PublicKey, destination: PublicKey, mints: PublicKey[], connection: Connection) => {
    // create the transaction to update the authority
    // attach the update authority ix to the transaction (up to 250)
    const attached = [];
    const attachFails = [];
    let txError: BatchTransactionCreationError = 'none';
    const queue = mints;
    let txState = await squadsSdk.createTransaction(multisig, 1);
    const batchLength = mints.length;
    let hasError = false;
    const failures = [];

    const keypair = new Keypair({
        publicKey: vault.toBytes(),
        secretKey: new Keypair().secretKey,
    })
    const garbageWallet = new NodeWallet(keypair)

    const metaplex = Metaplex.make(connection).use(
        walletAdapterIdentity(garbageWallet)
    )

    while (queue.length > 0) {
        const mint = queue.shift();
        if (!mint) {
            break;
        }

        const nft = await metaplex
            .nfts()
            .findByMint({ mintAddress: new PublicKey(mint) })
        const authorizationDetails = nft?.programmableConfig?.ruleSet
            ? { rules: nft.programmableConfig.ruleSet }
            : undefined

        // EDGE Case fixing
        const mutableNFT = nft as Mutable<typeof nft>;
        if (mutableNFT.model === "sft" && !mutableNFT.tokenStandard)
            mutableNFT.tokenStandard = TokenStandard.FungibleAsset

        const transactionBuilder = metaplex
            .nfts()
            .builders()
            .transfer({
                nftOrSft: mutableNFT,
                fromOwner: vault,
                toOwner: destination,
                amount: token(1),
                authorizationDetails,
            })

        for (const ix of transactionBuilder.getInstructions()) {
            try {
                const addedIx = await squadsSdk.addInstruction(txState.publicKey, ix);
                if (addedIx) {
                    attached.push(mint);
                }
                // flash tx state
                await squadsSdk.getTransaction(txState.publicKey);
            }catch (e) {
                attachFails.push(mint);
            }
        }
    }
    // check the tx before activating
    txState = await squadsSdk.getTransaction(txState.publicKey);
    // if the transaction is not full and there are still items to attach, then add them
    if (txState.instructionIndex !== batchLength && attachFails.length > 0) {
        while (attachFails.length > 0) {
            const mint = attachFails.shift();
            if (!mint) {
                break;
            }

            const nft = await metaplex
                .nfts()
                .findByMint({ mintAddress: new PublicKey(mint) })
            const authorizationDetails = nft?.programmableConfig?.ruleSet
                ? { rules: nft.programmableConfig.ruleSet }
                : undefined

            // EDGE Case fixing
            const mutableNFT = nft as Mutable<typeof nft>;
            if (mutableNFT.model === "sft" && !mutableNFT.tokenStandard)
                mutableNFT.tokenStandard = TokenStandard.FungibleAsset

            const transactionBuilder = metaplex
                .nfts()
                .builders()
                .transfer({
                    nftOrSft: mutableNFT,
                    fromOwner: vault,
                    toOwner: destination,
                    amount: token(1),
                    authorizationDetails,
                })

            for (const ix of transactionBuilder.getInstructions()) {
                try {
                    const addedIx = await squadsSdk.addInstruction(txState.publicKey, ix);
                    if (addedIx) {
                        attached.push(mint);
                    }
                } catch (e) {
                    hasError = true;
                    failures.push(mint);
                }
            }
        }
    }
    // activate the transaction
    try {
        await squadsSdk.activateTransaction(txState.publicKey);

        // approve the transaction
        try {
            await squadsSdk.approveTransaction(txState.publicKey);
            txError = 'none';
        }catch(e){
            txError = 'approval';
        }
    }catch(e){
        txError = 'activation';

        // try one more time
        await squadsSdk.activateTransaction(txState.publicKey);

        // approve the transaction
        try {
            await squadsSdk.approveTransaction(txState.publicKey);
            txError = 'none';
        }catch(e){
            txError = 'approval';
        }
    }

    return { attached, failures, txPDA: txState.publicKey, txError };
};
