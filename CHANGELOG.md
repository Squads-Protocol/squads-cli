# Changelog

## [1.3.0](https://github.com/Squads-Protocol/squads-cli/compare/v1.2.5...v1.3.0) (2024-06-12)


### Features

* **ledger:** Add ledger support ([feb7ff1](https://github.com/Squads-Protocol/squads-cli/commit/feb7ff1cb6f00d16c6aedc0a06722d85f5045f8a))
* **nftWithdraw:** Permit mass withdraw for nfts ([2e7a205](https://github.com/Squads-Protocol/squads-cli/commit/2e7a205c8f570103882424a5dc08379bdcb73a1e))
* **programs:** Add support to get program out from Squad ([a872a5d](https://github.com/Squads-Protocol/squads-cli/commit/a872a5d0bae5523602b7207f5cb071c91b3af773))
* **tx:** Add `--computeUnitPrice` flag ([6311a09](https://github.com/Squads-Protocol/squads-cli/commit/6311a09f7d3a835ed37fbf4900df3480b3f9eb2e))
* **tx:** Add missing actions ([2bca8fa](https://github.com/Squads-Protocol/squads-cli/commit/2bca8fa11b44572aa685b46841f06a2d86bc77f7))
* **validator:** Add validator withdraw auth function ([abaa713](https://github.com/Squads-Protocol/squads-cli/commit/abaa71369264dc017caf673ff391c5a089178da6))


### Bug Fixes

* **bin:** added bin path ([dec2347](https://github.com/Squads-Protocol/squads-cli/commit/dec23474b4b962c16cd15dad260898c7d51bb819))
* **bump:** bumped version ([b0f4a89](https://github.com/Squads-Protocol/squads-cli/commit/b0f4a89cd116f97ab46b40b125adb29b40711ebf))
* **deps:** Install missing dev deps ([9267eb8](https://github.com/Squads-Protocol/squads-cli/commit/9267eb8d6c27b13ce9edea66a8fcd9a6a9aa2202))
* **gitignore:** hide bin ([e189d13](https://github.com/Squads-Protocol/squads-cli/commit/e189d13f3d487c1db7504641e1c702c2c7093aaa))
* **gitignore:** update ([e08c119](https://github.com/Squads-Protocol/squads-cli/commit/e08c119d5f973279cd27c8049ec40ed51e3d90ef))
* **gitignore:** updated for bin ([09cd646](https://github.com/Squads-Protocol/squads-cli/commit/09cd6467a360c4762e01e39e73fe9371a9d8e441))
* **logging:** removed tx state log ([e107fa4](https://github.com/Squads-Protocol/squads-cli/commit/e107fa4af580c16fbb55fff6dd5a23f819bb7a85))
* **logs:** added json log ([4b4957b](https://github.com/Squads-Protocol/squads-cli/commit/4b4957ba7132f114cd3b2c831bd814bbc537d477))
* **logs:** added output log functionality ([8e06508](https://github.com/Squads-Protocol/squads-cli/commit/8e0650815f61b8fd2b77a37e78dd28f4378d79ca))
* **logs:** output is for mint addresses ([ffebfc4](https://github.com/Squads-Protocol/squads-cli/commit/ffebfc4b9d308d334f46002c4aa2395910954aa5))
* **nft-transfer:** WIP for batch outgoing transfers ([b359f4a](https://github.com/Squads-Protocol/squads-cli/commit/b359f4a650defb0fbf65e66100e0b725c4c596b5))
* **nft-transfer:** WIP for batch outgoing transfers ([450971e](https://github.com/Squads-Protocol/squads-cli/commit/450971e4c1b3639137c93f094c17ccf1b5893c37))
* **nft-transfer:** WIP for batch outgoing transfers ([dbff1c4](https://github.com/Squads-Protocol/squads-cli/commit/dbff1c426aa81505b7b5ba364c440cf6497495a4))
* **nft-update-authority:** wip of batch updating nft update authorities ([54fa8f6](https://github.com/Squads-Protocol/squads-cli/commit/54fa8f6b2953203faa51642b7ef13043ac4e4980))
* **nft-validate:** added tool to check metadata accounts and their authorities ([3cb83a1](https://github.com/Squads-Protocol/squads-cli/commit/3cb83a1d2b856f488dec4ac43d0da4670f561f40))
* **nftWithdraw:** Fix amount send for metadata ([3524ea9](https://github.com/Squads-Protocol/squads-cli/commit/3524ea924381cc9c9fd9bca1ec6f5564437fc555))
* **path:** output log path ([4971e78](https://github.com/Squads-Protocol/squads-cli/commit/4971e7834b1b137ec5a1df0bd3abd23985fb002e))
* **refactor:** updated sdk dependency ([d026be7](https://github.com/Squads-Protocol/squads-cli/commit/d026be7a6527a07ebc8f7bdb94cc65a72c6f0e8d))
* **sequential-execution:** updated execution flow ([51983e8](https://github.com/Squads-Protocol/squads-cli/commit/51983e88041ca9d2f258e11eb0366cd6835deb08))
* **token:** fixed token instruction ([a62343a](https://github.com/Squads-Protocol/squads-cli/commit/a62343a162d80dab067646b21a138fe17545740c))
* **ts-update:** migrate to ts ([d445766](https://github.com/Squads-Protocol/squads-cli/commit/d44576648245908b1bc6d2986399dc1eaab3db34))
* **tx-list:** refresh ms before fetch ([93c3187](https://github.com/Squads-Protocol/squads-cli/commit/93c31878ca4bea733b137f929ad2e0fe4cb48df9))
* **txmeta-programid:** added to constants ([2e0e88a](https://github.com/Squads-Protocol/squads-cli/commit/2e0e88acbe02845b989ffa9247d02da75d8d1e25))
* **txmeta:** added txmetaprogram id to yargs ([4cfe4db](https://github.com/Squads-Protocol/squads-cli/commit/4cfe4dbfa4107746323a587e9380d073b97da401))
* **updates:** added more types ([3365d53](https://github.com/Squads-Protocol/squads-cli/commit/3365d530d0185a4cc5dcd15d08adb4989086da11))
* **version:** bump ([c1aed54](https://github.com/Squads-Protocol/squads-cli/commit/c1aed54c89b8c73342e656eccdb650db14a067e8))
* **WIP:** added balance and cwd logs ([edb88c6](https://github.com/Squads-Protocol/squads-cli/commit/edb88c62d52e4e5ed856c312c15194257d3d3178))

## [1.2.5](https://github.com/Squads-Protocol/squads-cli/compare/v1.2.4...v1.2.5) (2022-12-13)


### Bug Fixes

* **lock:** removed package-lock.json ([60badce](https://github.com/Squads-Protocol/squads-cli/commit/60badce32916c3d57b41368f5f94afbd077df4e0))

## [1.2.4](https://github.com/Squads-Protocol/squads-cli/compare/v1.2.3...v1.2.4) (2022-12-13)


### Bug Fixes

* **info:** added info for idl and package.json loading ([de0e508](https://github.com/Squads-Protocol/squads-cli/commit/de0e5085a5ae35e9c845d0655939a1815932782b))
* **merge:** conflict resolved ([32267fe](https://github.com/Squads-Protocol/squads-cli/commit/32267fe791587d556ccd4af95c6e366ebc0dfbd4))

## [1.2.3](https://github.com/Squads-Protocol/squads-cli/compare/v1.2.2...v1.2.3) (2022-12-13)

### Bug Fixes

* **bin:** set new bin path ([48ef607](https://github.com/Squads-Protocol/squads-cli/commit/48ef60788019b54c6f5643a191c99067f392e754))
* **idl:** added new idl w/meta ([040875f](https://github.com/Squads-Protocol/squads-cli/commit/040875f70282297c99bbdda8eec0f1f7e0628351))

## [1.2.2](https://github.com/Squads-Protocol/squads-cli/compare/v1.2.1...v1.2.2) (2022-12-13)


### Bug Fixes

* **address:** updated address and sdk ([ef66764](https://github.com/Squads-Protocol/squads-cli/commit/ef667643b6df6e0018c1ffa718bb45b02af14a09))
* **cleanup:** remove old lib/ ([fe54b81](https://github.com/Squads-Protocol/squads-cli/commit/fe54b81c42c9575b8118517d0966477e132bdda6))
* **config:** update to config program id and program manager id ([1a25fd8](https://github.com/Squads-Protocol/squads-cli/commit/1a25fd87efd9c952e820fad01551188227deddcb))
* **logs:** removed from setup ([0cc8e31](https://github.com/Squads-Protocol/squads-cli/commit/0cc8e3156288189c077cca8b0d4144aa4705c990))

## [1.2.1](https://github.com/Squads-Protocol/squads-cli/compare/v1.2.0...v1.2.1) (2022-11-02)


### Bug Fixes

* **txix:** transactioninstruction ([9306866](https://github.com/Squads-Protocol/squads-cli/commit/93068668a08ed572db068e6a3d2537b5e9a079a2))

## [1.2.0](https://github.com/Squads-Protocol/squads-cli/compare/v1.1.0...v1.2.0) (2022-11-02)


### Features

* **config:** flag for cluster ([624c9b0](https://github.com/Squads-Protocol/squads-cli/commit/624c9b00455aadb5c00c27d8004232ce9e046727))

## [1.1.0](https://github.com/Squads-Protocol/squads-cli/compare/v1.0.0...v1.1.0) (2022-11-02)


### Features

* **flag:** help stub added ([148b4c3](https://github.com/Squads-Protocol/squads-cli/commit/148b4c331a3e6c22b20558382c30deccae97e2c2))

## 1.0.0 (2022-11-02)


### Features

* **ATA:** ata creation support ([71c5530](https://github.com/Squads-Protocol/squads-cli/commit/71c5530439e2b3bf36d302e0f28a2df65b5e446b))
* **flag:** version flag ([257ccd1](https://github.com/Squads-Protocol/squads-cli/commit/257ccd1e564035a5de03d4445fad86a14088aba9))


### Bug Fixes

* **getMS:** getms bug ([dae900f](https://github.com/Squads-Protocol/squads-cli/commit/dae900fcd519585cbd53eaa494f48d0f4941d0e6))
* **getMs:** proper getMultisig ([65352ca](https://github.com/Squads-Protocol/squads-cli/commit/65352cad3b9d4c340d57f3a0cb075c59dd3265d2))
* **instructions:** adding and activating ([3e752bb](https://github.com/Squads-Protocol/squads-cli/commit/3e752bb7f6a4fc2951022f43d555b6191b9f42f3))
* **loading:** setup text and clear ([5a99ac0](https://github.com/Squads-Protocol/squads-cli/commit/5a99ac0731d2f160e666a4bec5d801a6e8a4115a))
* **org:** new functions and organization ([38c8cf3](https://github.com/Squads-Protocol/squads-cli/commit/38c8cf353695c750e853bf4d8f843d1c25f60b27))
* **ownerkeys:** update ([25cc59e](https://github.com/Squads-Protocol/squads-cli/commit/25cc59e6416c1e13d861223d14d91968cc307d76))
* **readme:** added README.md stub ([b5ce970](https://github.com/Squads-Protocol/squads-cli/commit/b5ce9708903251bba829b28e3177d85097bc6a4a))
* **readme:** updated ([7678516](https://github.com/Squads-Protocol/squads-cli/commit/7678516219c6d7b8cc4537d7e7e131ed99701e4b))
* **semver:** for npm ([550bc37](https://github.com/Squads-Protocol/squads-cli/commit/550bc37ebadcfa38dddc14cc68bc3729a0d9f65c))
* **semver:** updated ([28b670f](https://github.com/Squads-Protocol/squads-cli/commit/28b670ffbf303c647275188182bbc78c8f10d853))
* **semver:** updated version ([165cb00](https://github.com/Squads-Protocol/squads-cli/commit/165cb003b88fd8f8f877653ac3fcdd47fa395883))
* **semver:** version bump ([662077e](https://github.com/Squads-Protocol/squads-cli/commit/662077e9ddc85dd23e069539dc1bd260fe0e1411))
* **structure:** update classes ([585b162](https://github.com/Squads-Protocol/squads-cli/commit/585b16277e7c34825699f2dcaa92da02084fbd22))
* **todo:** wrap network for api calls ([4715429](https://github.com/Squads-Protocol/squads-cli/commit/4715429b63ed4325cef9508da4fbdb0559d2caa4))
* **updates:** change settings ([3e5beeb](https://github.com/Squads-Protocol/squads-cli/commit/3e5beebbef516eb6fc0d122c37194bee02b14f3f))
* **wallet:** fixed wallet path ([6dff0a2](https://github.com/Squads-Protocol/squads-cli/commit/6dff0a236f476d03fad5d3a23f9af989fa6928bc))
