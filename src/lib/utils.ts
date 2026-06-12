import { AccountInfo, Commitment, Connection, PublicKey } from "@solana/web3.js";
import os from "os";
import path from "path";

// Expand a leading `~` to the home directory. Tilde expansion is shell
// behavior, so paths typed into interactive prompts (wallet file, mint list)
// reach fs.readFileSync unexpanded and fail without this. Also trims
// surrounding whitespace, since prompt input is often pasted with a trailing
// space or newline.
export function expandTilde(inputPath: string): string {
    const trimmed = inputPath.trim();
    if (trimmed === "~") return os.homedir();
    if (trimmed.startsWith("~/")) return path.join(os.homedir(), trimmed.slice(2));
    return trimmed;
}

export function shortenTextEnd(text: string, chars: number) {
    const cleanedText = text.replaceAll("\x00", "")
    if (cleanedText.length > chars)
        return `${cleanedText.substring(0, chars)}...`;
    return cleanedText
}

export async function getMultipleAccountsBatch(
    connection: Connection,
    publicKeys: PublicKey[],
    commitment: Commitment = "processed"
): Promise<Array<null | { publicKey: PublicKey; account: AccountInfo<Buffer> }>> {
    const keys: PublicKey[][] = []
    let tempKeys: PublicKey[] = []

    publicKeys.forEach((k) => {
        if (tempKeys.length >= 100) {
            keys.push(tempKeys)
            tempKeys = []
        }
        tempKeys.push(k)
    })
    if (tempKeys.length > 0) {
        keys.push(tempKeys)
    }

    const accounts: Array<AccountInfo<Buffer> | null> = []

    const resArray: { [key: number]: Array<AccountInfo<Buffer> | null> } = {}
    await Promise.all(
        keys.map(async (key, index) => {
            resArray[index] = await connection.getMultipleAccountsInfo(key, commitment)
        })
    )

    Object.keys(resArray)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        .forEach((itemIndex) => {
            const res = resArray[parseInt(itemIndex, 10)]
            // eslint-disable-next-line no-restricted-syntax
            for (const account of res) {
                accounts.push(account)
            }
        })

    return accounts.map((account, idx) => {
        if (account === null) {
            return null
        }
        return {
            publicKey: publicKeys[idx],
            account
        }
    })
}
