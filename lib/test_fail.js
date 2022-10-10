import {Keypair, PublicKey, Connection, TransactionInstruction, Transaction} from "@solana/web3.js";
import {loadCliWallet} from "./wallet.js";
import BN from "bn.js";
const wallet = loadCliWallet();

const BPFLOADER_ADDRESS = new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111");
const TEST_PROGRAM_ID = new PublicKey("3NAo3fnZ3LE8e3tndWpfGHnfqATsXZj2k48UGpWhj9mv");


const upgradeSetAuthorityIx = async (
    programAddress,
    currentAuthorityAddress,
    newAuthorityAddress) => {
    const upgradeProgramId = BPFLOADER_ADDRESS;
    const upgradeData = new BN(4, 10);
    const [programDataAddress] = await PublicKey.findProgramAddress(
        [programAddress.toBuffer()],
        upgradeProgramId
    );
    const keys = [
        {pubkey: programDataAddress, isWritable: true, isSigner: false},
        {pubkey: currentAuthorityAddress, isWritable: false, isSigner: true},
        {pubkey: newAuthorityAddress, isWritable: false, isSigner: true},
    ];
    return new TransactionInstruction({
        programId: upgradeProgramId,
        data: upgradeData.toArrayLike(Buffer, "le",4),
        keys,
    });
}

const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");


const runTest = async () => {

    const {blockhash, lastValidBlockHeight} = await connection.getLatestBlockhash();
    const tx = new Transaction({recentBlockhash: blockhash, lastValidBlockHeight, feePayer: wallet.publicKey});
    const randomSigner = Keypair.generate().publicKey;
    const upgradeIX = await upgradeSetAuthorityIx(TEST_PROGRAM_ID, wallet.publicKey, randomSigner);
    console.log("upgradeIX", upgradeIX);
    // tx.add(upgradeIx);
    // tx.sign(wallet);
    // const txid = await connection.sendRawTransaction(tx.serialize());
    // const sig = await connection.confirmTransaction(txid,{commitment: "confirmed"});
    // console.log(sig);
};

runTest();
const randomSigner = Keypair.generate().publicKey;
console.log("random signer", randomSigner.toBase58());