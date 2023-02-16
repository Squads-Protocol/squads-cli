import { AccountInfo, Commitment, Connection, PublicKey } from "@solana/web3.js";

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

    const accounts: Array<null | {
        executable: any
        owner: PublicKey
        lamports: any
        data: Buffer
    }> = []

    const resArray: { [key: number]: any } = {}
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
