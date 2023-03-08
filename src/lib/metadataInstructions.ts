import {createUpdateMetadataAccountInstruction, UpdateMetadataAccountInstructionArgs, PROGRAM_ID} from '@metaplex-foundation/mpl-token-metadata';
import {PublicKey} from "@solana/web3.js";

export const updateMetadataAuthorityIx = (newAuthority: PublicKey, currentAuthority: PublicKey, metadataAccount: PublicKey) => {
    const accounts = {
        metadata: metadataAccount,
        updateAuthority: currentAuthority,
    };
    const instructionArgs: UpdateMetadataAccountInstructionArgs = {
        updateMetadataAccountArgs: {
            data: null,
            primarySaleHappened: null,
            updateAuthority: newAuthority,
        },
    };
    return createUpdateMetadataAccountInstruction(accounts, instructionArgs, PROGRAM_ID);
};

export {PROGRAM_ID as METAPLEX_PROGRAM_ID};