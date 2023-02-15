export function shortenTextEnd(text, chars) {
    const cleanedText = text.replaceAll("\x00", "")
    if (cleanedText.length > chars)
        return `${cleanedText.substring(0, chars)}...`;
    return cleanedText
}

export async function getMultipleAccountsBatch(
    connection,
    publicKeys,
    commitment = "processed"
){
    const keys = []
    let tempKeys = []

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

    const accounts = [];

    const resArray = {};
    await Promise.all(
        keys.map(async (key, index) => {
            resArray[index] = await connection.getMultipleAccountsInfo(key, commitment)
        })
    )

    Object.keys(resArray)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        .forEach((itemIndex) => {
            const res = resArray[parseInt(itemIndex, 10)]
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