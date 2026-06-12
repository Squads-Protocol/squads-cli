> [!WARNING]
> **This package is deprecated and no longer actively maintained.** It remains functional for operating existing Squads **v3** multisigs, but no new features will be added. For current Squads tooling, see [squads.so](https://squads.so).

```
   _____   ____    __  __    ___     ____    _____
  / ___/  / __ \  / / / /   /   |   / __ \  / ___/
  \__ \  / / / / / / / /   / /| |  / / / /  \__ \ 
 ___/ / / /_/ / / /_/ /   / ___ | / /_/ /  ___/ / 
/____/  \___\_\ \____/   /_/  |_|/_____/  /____/  
                                                  
```

## Squads v3 CLI

An interactive, menu-driven CLI for operating [Squads Protocol v3](https://squads.so) multisigs from the terminal — create multisigs, review and vote on transactions, manage members and thresholds, transfer program upgrade authority, and run bulk NFT authority migrations.

> **Note:** This CLI targets the Squads **v3** program. It is a hands-on operator tool: every state-changing action is confirmed interactively before anything is signed or sent.

### Requirements

- Node.js **>= 16**
- npm **>= 8.19.2**
- A funded Solana wallet (keypair file or Ledger) to pay transaction fees and rent

### Installing

```sh
npm install -g @sqds/cli
```

Or run it without installing:

```sh
npx @sqds/cli
```

### Quick start

```sh
squads-cli
```

On launch the tool asks two setup questions:

1. **Wallet** — path to a Solana keypair file, or a Ledger device (see below). Press Enter to use the default `~/.config/solana/id.json`.
2. **Cluster** — choose `mainnet-beta`, `devnet`, `localnet`, or enter a custom RPC URL.

From there you navigate the menus with the arrow keys and Enter.

### Command-line flags

Any flag you pass skips the matching startup prompt. All are optional.

| Flag | Description |
| --- | --- |
| `--cluster <value>` | `mainnet-beta`, `devnet`, `localnet`, or a full `https://` RPC URL. Skips the cluster prompt. |
| `--computeUnitPrice <microLamports>` | Adds a priority fee (micro-lamports per compute unit) to every transaction this CLI signs. |
| `--programId <pubkey>` | Override the Squads v3 multisig program ID (advanced / non-default deployments). |
| `--programManagerId <pubkey>` | Override the program-manager program ID. |
| `--txMetaProgramId <pubkey>` | Override the transaction-metadata program ID used by bulk flows. |
| `--version`, `-v` | Print the installed CLI version. |
| `--help` | Print help. |

```sh
# Connect straight to mainnet with a priority fee
squads-cli --cluster https://api.mainnet-beta.solana.com --computeUnitPrice 5000
```

### Wallet options

- **Keypair file** — enter the path to a standard Solana keypair JSON (e.g. `~/.config/solana/id.json`). This wallet pays fees and rent and casts your approvals.
- **Ledger** — enter a `usb://ledger` URL. Plug in and unlock the device with the Solana app open first. The prefix is case-insensitive, and a derivation path may be appended to select a specific account.

### What you can do

- **Find your multisigs** — `View my Multisigs` lists multisigs that include your wallet. Because membership is permissionless, this discovered list can contain decoy/spam entries; use **Open multisig by address** to go straight to a specific multisig you trust.
- **Create a multisig** — set the create key, members, and approval threshold.
- **Vault & assets** — view SOL, wrapped SOL, and SPL token balances held by a vault. You can choose which **authority index** (vault) to inspect; index 1 is the default vault.
- **Transactions** — create a draft for a chosen authority, or **import** a base58-serialized transaction. The review screen shows the creator and decodes every attached instruction (program, accounts, data) so you can see exactly what you're approving. Actions: **Approve**, **Activate**, **Reject**, **Cancel**, **Add instruction**, and **Execute**.
- **Settings** — add a member, remove a member, or change the approval threshold. No-op proposals (adding an existing member, or re-setting the current threshold) are rejected up front because they would still advance the config and invalidate other pending settings proposals.
- **Program upgrade authority** — stage a safe transfer of a program's upgrade authority into or out of the vault.
- **Validator withdraw authority** — stage a transfer of a vote account's withdraw authority.
- **Bulk NFT authority migration** — move metadata update authority for many mints into or out of a vault, with an optional `safeSign` co-signer. Progress logs are written to a temporary directory (not your working directory).
- **Create ATA** — create an associated token account owned by a vault.

### NFT authority migration & the mint list file

The bulk NFT flows operate on a list of mints you supply as a `.json` file (the prompt asks for the file location). The format is a **plain JSON array of base58 mint address strings** — nothing more:

```json
[
  "5j8...firstMintAddress",
  "9Wg...secondMintAddress",
  "Fz3...thirdMintAddress"
]
```

Rules the loader enforces:

- It must be a JSON **array** (not an object, not a CSV, not newline-delimited).
- Each entry is a **non-empty string** that is a valid **base58 public key**. Any entry that isn't aborts the load and names the offending index.
- Use the **mint addresses** themselves — not metadata PDAs and not keypairs. The CLI derives each mint's Metaplex metadata PDA for you.
- Duplicate entries are de-duplicated automatically.

There are two directions, and they behave differently:

- **Into the vault (incoming)** — used when your *connected wallet* is the current update authority. The CLI first validates that every mint's metadata exists and that your wallet really is its current update authority, shows the exact metadata PDAs to be reassigned, then signs the updates directly with your wallet. Mints your wallet doesn't control are reported up front rather than failing mid-run.
- **Out of the vault (outgoing)** — used when the *vault* is the current authority. Because the vault can only act through governance, this stages multisig transactions (batched across the mint list) that members then approve and execute. An optional **`safeSign`** mode adds the new authority as a required co-signer, and that co-signer is preserved on retries.

Progress and results are written to a log file in a temporary directory (not your working directory), so a large run can be audited afterward.

### Executing transactions: what to expect

The CLI executes a transaction in the most efficient way that still fits Solana's transaction size limit:

- **Atomic** — if all the proposal's instructions fit in a single transaction, they execute together, all-or-nothing.
- **Sequential (packed)** — if they don't fit, the CLI asks you to confirm non-atomic execution, then runs the instructions across the fewest transactions that fit. In this mode an earlier batch can land on-chain even if a later one fails, leaving the proposal **partially executed**.

If execution stops partway, the review screen labels the proposal as partially executed and shows how many instructions remain. Re-running **Execute** resumes from the next un-executed instruction. Multisig settings/governance proposals (authority index 0) always execute atomically.

### Safety notes

- **Send assets only to the vault address** shown in the header — never to the multisig account address.
- **Review instructions before approving or executing.** The review screen decodes them for you; treat any imported transaction as untrusted until you've inspected it.
- The discovered multisig list is **permissionless** — anyone can create a multisig that names your wallet. Prefer **Open multisig by address** for anything sensitive.

### Development

```sh
npm install
npm run build       # compile TypeScript to bin/
npm run typecheck   # tsc --noEmit
npm run lint        # eslint over src/
```

The published entrypoint (`bin/`) is rebuilt from source on `prepack`, and `npm run verify-clean` fails packing/publishing if tracked source has uncommitted changes — so a published build always matches reviewed source.

### Links

- Squads Protocol: https://squads.so
- Source & issues: https://github.com/squads-protocol/squads-cli

### Disclaimer

This tool signs and submits real on-chain transactions that can move funds and change control of programs and accounts. Use at your own risk, double-check every prompt, and test on `devnet` first when in doubt.
