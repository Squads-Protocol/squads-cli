import * as anchor from "@project-serum/anchor";

const BPFLOADER_ADDRESS = new anchor.web3.PublicKey("BPFLoaderUpgradeab1e11111111111111111111111");

const getParsed = (account) => {
    const {value} = account;
    if (value && value.data && 'parsed' in value.data) {
        const { data: {parsed}} = value;
        return parsed;
    }
    return null;
};

export const getParsedProgramAccount = async (connection, programAddress) => {
    const programAccountInfo = await connection.getParsedAccountInfo(programAddress);
    return getParsed(programAccountInfo);
};

export const getProgramDataAccount =  async (connection, programDataAddress) => {
    return connection.getParsedAccountInfo(programDataAddress);
}

export const getProgramData = async (connection, programAddress) => {
    const programDataAddress = await getProgramDataAddress(programAddress);
    const programAccountInfo = await connection.getParsedAccountInfo(programDataAddress);
    const parsed = getParsed(programAccountInfo);
    return parsed;
};

export const getProgramDataAddress = async (programAddress) => {
    const [programDataAddress] = await anchor.web3.PublicKey.findProgramAddress([programAddress.toBytes()], BPFLOADER_ADDRESS);
    return programDataAddress;
};