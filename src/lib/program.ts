import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
const BPFLOADER_ADDRESS = new anchor.web3.PublicKey("BPFLoaderUpgradeab1e11111111111111111111111");

const getParsed = (account: any) => {
    const {value} = account;
    if (value && value.data && 'parsed' in value.data) {
        const { data: {parsed}} = value;
        return parsed;
    }
    return null;
};

export const getParsedProgramAccount = async (connection: Connection, programAddress: PublicKey) => {
    const programAccountInfo = await connection.getParsedAccountInfo(programAddress);
    return getParsed(programAccountInfo);
};

export const getProgramDataAccount =  async (connection: Connection, programDataAddress: PublicKey) => {
    return connection.getParsedAccountInfo(programDataAddress);
}

export const getProgramData = async (connection: Connection, programAddress: PublicKey) => {
    const programDataAddress = await getProgramDataAddress(programAddress);
    const programAccountInfo = await connection.getParsedAccountInfo(programDataAddress);
    const parsed = getParsed(programAccountInfo);
    return parsed;
};

export const getProgramDataAddress = async (programAddress: PublicKey) => {
    const [programDataAddress] = await anchor.web3.PublicKey.findProgramAddress([programAddress.toBytes()], BPFLOADER_ADDRESS);
    return programDataAddress;
};

export const upgradeSetAuthorityIx = async (
    programAddress: PublicKey,
    currentAuthorityAddress: PublicKey,
    newAuthorityAddress: PublicKey) => {
    const upgradeProgramId = BPFLOADER_ADDRESS;
    const upgradeData = new BN(4, 10);
    const [programDataAddress] = await anchor.web3.PublicKey.findProgramAddress(
        [programAddress.toBuffer()],
        upgradeProgramId
    );
    const keys = [
        {pubkey: programDataAddress, isWritable: true, isSigner: false},
        {pubkey: currentAuthorityAddress, isWritable: false, isSigner: true},
        {pubkey: newAuthorityAddress, isWritable: false, isSigner: true},
    ];
    return new anchor.web3.TransactionInstruction({
        programId: upgradeProgramId,
        data: upgradeData.toArrayLike(Buffer, "le",4),
        keys,
    });
}