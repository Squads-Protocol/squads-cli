# Changelog

## [3.0.0](https://github.com/Squads-Protocol/squads-cli/compare/v1.2.5...v3.0.0) (2026-06-12)


### Features

* **balance:** check low balance on sign and send ([f82adf2](https://github.com/Squads-Protocol/squads-cli/commit/f82adf20108d3e92ebd4b07b994a12781bba9190))
* **ledger:** Add ledger support ([feb7ff1](https://github.com/Squads-Protocol/squads-cli/commit/feb7ff1cb6f00d16c6aedc0a06722d85f5045f8a))
* **menu:** add direct open-by-address path for multisigs ([e1f5d6d](https://github.com/Squads-Protocol/squads-cli/commit/e1f5d6d5ebad1add2d42a5260ba673fb2c361519))
* **menu:** direct multisig open-by-address path (discovery spam mitigation) ([4e4b957](https://github.com/Squads-Protocol/squads-cli/commit/4e4b9575716e7091088d2e2594997858280e4d59))
* **nftWithdraw:** Permit mass withdraw for nfts ([2e7a205](https://github.com/Squads-Protocol/squads-cli/commit/2e7a205c8f570103882424a5dc08379bdcb73a1e))
* **overhaul:** better menu, state, and processing ([6c92ce7](https://github.com/Squads-Protocol/squads-cli/commit/6c92ce76e0bdb936032fc0b173e097c4576788ad))
* **overhaul:** better menu, state, and processing ([cb4f222](https://github.com/Squads-Protocol/squads-cli/commit/cb4f22295e5f313571777264706209a971dbb580))
* **programs:** Add support to get program out from Squad ([a872a5d](https://github.com/Squads-Protocol/squads-cli/commit/a872a5d0bae5523602b7207f5cb071c91b3af773))
* **README:** added extra information ([a3eb063](https://github.com/Squads-Protocol/squads-cli/commit/a3eb063b9e1dae8429bca8ca593581fdeac944c7))
* **README:** some extra info on the nft authority transfers ([4cb6768](https://github.com/Squads-Protocol/squads-cli/commit/4cb6768ae2d6bd58dc7c9a598556ecbca7f4398b))
* **tx:** Add `--computeUnitPrice` flag ([6311a09](https://github.com/Squads-Protocol/squads-cli/commit/6311a09f7d3a835ed37fbf4900df3480b3f9eb2e))
* **tx:** Add Flag to Set Priority Fee ([062369d](https://github.com/Squads-Protocol/squads-cli/commit/062369da9edbcdf0812e39c00a2ce5533e4a8a77))
* **tx:** Add missing actions ([2bca8fa](https://github.com/Squads-Protocol/squads-cli/commit/2bca8fa11b44572aa685b46841f06a2d86bc77f7))
* **updates:** final pass and cleanup ([b4914e9](https://github.com/Squads-Protocol/squads-cli/commit/b4914e9c76b20e949b9ae49a6eb9dfeda28d44a6))
* **updates:** general consolidation ([c525059](https://github.com/Squads-Protocol/squads-cli/commit/c52505979f619629637987573ab4c1fc72f3df44))
* **updates:** general consolidation ([8157d12](https://github.com/Squads-Protocol/squads-cli/commit/8157d1270bae3f5f66bec868b1f3fb0c068a9c1b))
* **validator:** Add validator withdraw auth function ([abaa713](https://github.com/Squads-Protocol/squads-cli/commit/abaa71369264dc017caf673ff391c5a089178da6))
* **vault/nft:** let operators pick the authority index ([4eec863](https://github.com/Squads-Protocol/squads-cli/commit/4eec863dc17cbd6024f44ef108ce02a13d5ce33a))
* **vault/nft:** selectable authority index for inventory and NFT flows ([1f98efd](https://github.com/Squads-Protocol/squads-cli/commit/1f98efdea09df11dfe7d22738f7a2a55b6d6b936))


### Bug Fixes

* **assets:** show token label provenance in vault inventory ([99abc32](https://github.com/Squads-Protocol/squads-cli/commit/99abc3202f271d8cfc3d98535e5672b1d34e172f))
* **assets:** show wrapped SOL token accounts in vault inventory ([5d71b8e](https://github.com/Squads-Protocol/squads-cli/commit/5d71b8e246d34eebb9d9beff094c0a577200a9b5))
* **assets:** stop dropping wrapped SOL from the vault asset table ([885027e](https://github.com/Squads-Protocol/squads-cli/commit/885027e19b519f5f2106b45a6ff8cd67346fc266))
* **assets:** tag token label provenance in vault inventory ([c96e5eb](https://github.com/Squads-Protocol/squads-cli/commit/c96e5ebb2de3e59ade6a62b62bd799c9d039b598))
* **authority-batches:** fix for index check ([53cc8b8](https://github.com/Squads-Protocol/squads-cli/commit/53cc8b85510f13afcf80545afb9d7996bfc6c782))
* **authority-batches:** fix for index check ([28ad182](https://github.com/Squads-Protocol/squads-cli/commit/28ad1824d8fb77293dc9a60cc5aa9e5f72e45332))
* **bin:** added bin path ([dec2347](https://github.com/Squads-Protocol/squads-cli/commit/dec23474b4b962c16cd15dad260898c7d51bb819))
* **bump:** bumped version ([b0f4a89](https://github.com/Squads-Protocol/squads-cli/commit/b0f4a89cd116f97ab46b40b125adb29b40711ebf))
* **cleanup:** fix post PR noise ([e562609](https://github.com/Squads-Protocol/squads-cli/commit/e5626094c34590d9a0b203024c3e540ddcfaa882))
* **cleanup:** further consolidation, types ([500feb4](https://github.com/Squads-Protocol/squads-cli/commit/500feb4de6f26b5e7dfc07c24180e84f4721b660))
* **confirmation:** adjusted to confirmed for state change ([bf23be8](https://github.com/Squads-Protocol/squads-cli/commit/bf23be802cd2af7615d4d85d30f2a5878ee354b9))
* **confirmation:** adjusted to confirmed for state change ([09f4e1b](https://github.com/Squads-Protocol/squads-cli/commit/09f4e1b5044320d5d0731c706afbac634855ee08))
* **confirm:** better logic for failed tx ([fd668ba](https://github.com/Squads-Protocol/squads-cli/commit/fd668ba2208bc17b9cdf404789b3337997e54058))
* **confirm:** better logic for failed tx ([56dfcda](https://github.com/Squads-Protocol/squads-cli/commit/56dfcdaae157c063fa2ba8ef9026080005d0c102))
* **consolidation:** more abstraction/helpers ([f654971](https://github.com/Squads-Protocol/squads-cli/commit/f6549716d0d60cbee98ec90e55b7ad8fc2889dea))
* **creator:** display the creator ([6772a17](https://github.com/Squads-Protocol/squads-cli/commit/6772a172524b09555944c640ee081a8cc593d365))
* **creator:** display the creator ([8707397](https://github.com/Squads-Protocol/squads-cli/commit/870739731541e76baab357c10f08b051aa470880))
* **deps:** dependency cleanup ([31b49cf](https://github.com/Squads-Protocol/squads-cli/commit/31b49cf583288ff62faef6e6b3cff2b6a8cd81b2))
* **deps:** Install missing dev deps ([9267eb8](https://github.com/Squads-Protocol/squads-cli/commit/9267eb8d6c27b13ce9edea66a8fcd9a6a9aa2202))
* **execute:** make per-instruction retry state-aware after confirm timeout ([71ea1a4](https://github.com/Squads-Protocol/squads-cli/commit/71ea1a4b30b3d2140c1ed9ba56fdf487f6479d80))
* **execute:** state-aware retry after confirmation timeout in per-instruction execute loop ([d9833b7](https://github.com/Squads-Protocol/squads-cli/commit/d9833b7ae4400044bc2b00451b363d2f71aeff00))
* **gitignore:** hide bin ([e189d13](https://github.com/Squads-Protocol/squads-cli/commit/e189d13f3d487c1db7504641e1c702c2c7093aaa))
* **gitignore:** update ([167bb79](https://github.com/Squads-Protocol/squads-cli/commit/167bb7979b38c78edce1e69ecafa3e29802383cb))
* **gitignore:** update ([e08c119](https://github.com/Squads-Protocol/squads-cli/commit/e08c119d5f973279cd27c8049ec40ed51e3d90ef))
* **gitignore:** updated for bin ([09cd646](https://github.com/Squads-Protocol/squads-cli/commit/09cd6467a360c4762e01e39e73fe9371a9d8e441))
* **import:** byte size and better builder handling ([5c45d33](https://github.com/Squads-Protocol/squads-cli/commit/5c45d33aa0867b15b6dd0762384e9a1d8d842450))
* **import:** explicit approval for imports ([8e95422](https://github.com/Squads-Protocol/squads-cli/commit/8e95422cf8b1314cabdd8ad8bed5452a273a3d8e))
* **import:** explicit approval for imports ([0ba4003](https://github.com/Squads-Protocol/squads-cli/commit/0ba40039e3c2ea56d019749652c1df893e528260))
* **import:** parse raw import as wire transaction, not bare message ([1b2589b](https://github.com/Squads-Protocol/squads-cli/commit/1b2589bfb03af5f02bd794c6d1e6a042c45c1ea8))
* **import:** parse raw import with Transaction.from instead of Message.from ([cd4447d](https://github.com/Squads-Protocol/squads-cli/commit/cd4447d65a366bd40a32f428d7196a75938b73c4))
* **improvements:** dedupes and consolidation ([c663b1b](https://github.com/Squads-Protocol/squads-cli/commit/c663b1bb390648d83ba7e391e6f512865095dbd7))
* **integers:** check integers for authority ([895c30a](https://github.com/Squads-Protocol/squads-cli/commit/895c30ab51caddab247bc25bae88a9a3ebc9ec0d))
* **integers:** check integers for authority ([cb9c3fb](https://github.com/Squads-Protocol/squads-cli/commit/cb9c3fbc25a8b59d34d7c28fd03b2f89a3939cc4))
* **logging:** removed tx state log ([e107fa4](https://github.com/Squads-Protocol/squads-cli/commit/e107fa4af580c16fbb55fff6dd5a23f819bb7a85))
* **logs:** added json log ([4b4957b](https://github.com/Squads-Protocol/squads-cli/commit/4b4957ba7132f114cd3b2c831bd814bbc537d477))
* **logs:** added output log functionality ([8e06508](https://github.com/Squads-Protocol/squads-cli/commit/8e0650815f61b8fd2b77a37e78dd28f4378d79ca))
* **logs:** output is for mint addresses ([ffebfc4](https://github.com/Squads-Protocol/squads-cli/commit/ffebfc4b9d308d334f46002c4aa2395910954aa5))
* **members:** better scan for multisig members and direct access ([34ebc78](https://github.com/Squads-Protocol/squads-cli/commit/34ebc78238e5f77884efc7d0ba89095cccc248d6))
* **members:** better scan for multisig members and direct access ([af2eeed](https://github.com/Squads-Protocol/squads-cli/commit/af2eeed84472e46d888b46e0b0ca86b22c84d00f))
* **merge:** resolve conflict ([2bb3405](https://github.com/Squads-Protocol/squads-cli/commit/2bb3405eaf33964f2230b9dc05cdac03b2cce4d7))
* **nft-transfer:** WIP for batch outgoing transfers ([b359f4a](https://github.com/Squads-Protocol/squads-cli/commit/b359f4a650defb0fbf65e66100e0b725c4c596b5))
* **nft-transfer:** WIP for batch outgoing transfers ([450971e](https://github.com/Squads-Protocol/squads-cli/commit/450971e4c1b3639137c93f094c17ccf1b5893c37))
* **nft-transfer:** WIP for batch outgoing transfers ([dbff1c4](https://github.com/Squads-Protocol/squads-cli/commit/dbff1c426aa81505b7b5ba364c440cf6497495a4))
* **nft-update-authority:** wip of batch updating nft update authorities ([54fa8f6](https://github.com/Squads-Protocol/squads-cli/commit/54fa8f6b2953203faa51642b7ef13043ac4e4980))
* **nft-validate:** added tool to check metadata accounts and their authorities ([3cb83a1](https://github.com/Squads-Protocol/squads-cli/commit/3cb83a1d2b856f488dec4ac43d0da4670f561f40))
* **nft:** derive metadata PDA in incoming authority retry pass ([6fde15c](https://github.com/Squads-Protocol/squads-cli/commit/6fde15c90267d90fd0230154678e4e5369333507))
* **nft:** incoming authority retry must derive the metadata PDA from the mint ([c0f0903](https://github.com/Squads-Protocol/squads-cli/commit/c0f0903825b5c80a2dc056a0105e643d0cfadf50))
* **nfts:** discerment via metaplex ([6a35604](https://github.com/Squads-Protocol/squads-cli/commit/6a35604118eafae7c7cee2e3180a63db150935e6))
* **nfts:** discerment via metaplex ([4ac7a71](https://github.com/Squads-Protocol/squads-cli/commit/4ac7a718622f2284e49cd04b6351cec6a056edbe))
* **nfts:** safesign passes through failed nft authority transfers ([04bf78d](https://github.com/Squads-Protocol/squads-cli/commit/04bf78d642ffeec3bb437f3a017e31182a5caffa))
* **nfts:** safesign passes through failed nft authority transfers ([2287c40](https://github.com/Squads-Protocol/squads-cli/commit/2287c40596625cb8299970e471bccb291aedb733))
* **nftWithdraw:** Fix amount send for metadata ([3524ea9](https://github.com/Squads-Protocol/squads-cli/commit/3524ea924381cc9c9fd9bca1ec6f5564437fc555))
* **nft:** write bulk authority logs to a temp dir, not cwd ([f863f4c](https://github.com/Squads-Protocol/squads-cli/commit/f863f4c070e68d306c1d001f8a3bcc599226e956))
* **nft:** write bulk authority-out logs to a temp directory ([0e4c31b](https://github.com/Squads-Protocol/squads-cli/commit/0e4c31bb731160845d5fa7720a1b8da86de1dee0))
* **packaging:** allowlist published files and rebuild bin/ on prepack ([80d3b61](https://github.com/Squads-Protocol/squads-cli/commit/80d3b61ea4cd5681a3e843cea7e155fcab981a0f))
* **packaging:** files allowlist + prepack rebuild of bin/ ([5eef7fd](https://github.com/Squads-Protocol/squads-cli/commit/5eef7fdb5693c9ccbfe7efea85a71631bb090c5b))
* **path:** output log path ([4971e78](https://github.com/Squads-Protocol/squads-cli/commit/4971e7834b1b137ec5a1df0bd3abd23985fb002e))
* **program:** verified on-chain state rather than a precomputed address ([1426e59](https://github.com/Squads-Protocol/squads-cli/commit/1426e59a42a979da60ddb18e328220214960d4ff))
* **program:** verified on-chain state rather than a precomputed address ([e2ceaec](https://github.com/Squads-Protocol/squads-cli/commit/e2ceaec280a7e6acf1bf475a656da5313be25dbc))
* **refactor:** updated sdk dependency ([d026be7](https://github.com/Squads-Protocol/squads-cli/commit/d026be7a6527a07ebc8f7bdb94cc65a72c6f0e8d))
* **refresh:** post-create refreshes stale state ([f7d6259](https://github.com/Squads-Protocol/squads-cli/commit/f7d62592adb12e46d12ad5519d74a3d6cb66f753))
* **refresh:** post-create refreshes stale state ([c9c7195](https://github.com/Squads-Protocol/squads-cli/commit/c9c71952c2fb93629eda9152f1ec1fd8e36c3168))
* **resume:** partially executed transactions ([67572fc](https://github.com/Squads-Protocol/squads-cli/commit/67572fc9890310dd0f81cc2c2fa91557a002defd))
* **resume:** partially executed transactions ([0c7c4db](https://github.com/Squads-Protocol/squads-cli/commit/0c7c4db2779cdd36654e0a7dcd6b2234d0d68c22))
* **sequential-execution:** updated execution flow ([51983e8](https://github.com/Squads-Protocol/squads-cli/commit/51983e88041ca9d2f258e11eb0366cd6835deb08))
* **settings:** atomic approval in submitBuilderTx (prevent auth-0 PDA redirect) ([88efe99](https://github.com/Squads-Protocol/squads-cli/commit/88efe99bc4f0fb61faccbfe5ceccc9fbb5df8cb2))
* **settings:** bundle approval atomically to prevent PDA redirect ([c0b9ac0](https://github.com/Squads-Protocol/squads-cli/commit/c0b9ac035793b4ef555e7822f16da5c89ac4c89b))
* **settings:** reject semantic no-op member/threshold proposals ([394d048](https://github.com/Squads-Protocol/squads-cli/commit/394d0486e2959d9c7b49068c4f248175d3c490be))
* **settings:** reject semantic no-op member/threshold proposals ([ad7c62e](https://github.com/Squads-Protocol/squads-cli/commit/ad7c62ec06f68d067a5429c889b3e65a93c64fd9))
* **simple-git:** dependabot notice ([b264ccd](https://github.com/Squads-Protocol/squads-cli/commit/b264ccd66d0cc090596faee46b8ece251258a6be))
* **threshold:** enforce integer threshold input in create and change flows ([c0b38da](https://github.com/Squads-Protocol/squads-cli/commit/c0b38da200cec84699f6eb5b41159767649f1fa6))
* **threshold:** reject non-integer threshold input (create + change flows) ([151957b](https://github.com/Squads-Protocol/squads-cli/commit/151957b0118593c6f3a05d764c09b534f5b8d25e))
* **token:** fixed token instruction ([a62343a](https://github.com/Squads-Protocol/squads-cli/commit/a62343a162d80dab067646b21a138fe17545740c))
* **ts-update:** migrate to ts ([d445766](https://github.com/Squads-Protocol/squads-cli/commit/d44576648245908b1bc6d2986399dc1eaab3db34))
* **tx-list:** refresh ms before fetch ([93c3187](https://github.com/Squads-Protocol/squads-cli/commit/93c31878ca4bea733b137f929ad2e0fe4cb48df9))
* **txmeta-programid:** added to constants ([2e0e88a](https://github.com/Squads-Protocol/squads-cli/commit/2e0e88acbe02845b989ffa9247d02da75d8d1e25))
* **txmeta:** added txmetaprogram id to yargs ([4cfe4db](https://github.com/Squads-Protocol/squads-cli/commit/4cfe4dbfa4107746323a587e9380d073b97da401))
* **updates:** added more types ([3365d53](https://github.com/Squads-Protocol/squads-cli/commit/3365d530d0185a4cc5dcd15d08adb4989086da11))
* **ux:** helper prompts now disclose activate + auto-approve side effects ([eb400f5](https://github.com/Squads-Protocol/squads-cli/commit/eb400f5d8d557dd90793d01e29a251880d4de428))
* **ux:** state activate+approve side effects in helper prompts ([6fc6dbe](https://github.com/Squads-Protocol/squads-cli/commit/6fc6dbebabc1c6a8b096cdee71400911af635612))
* **version:** bump ([c1aed54](https://github.com/Squads-Protocol/squads-cli/commit/c1aed54c89b8c73342e656eccdb650db14a067e8))
* **WIP:** added balance and cwd logs ([edb88c6](https://github.com/Squads-Protocol/squads-cli/commit/edb88c62d52e4e5ed856c312c15194257d3d3178))


### Miscellaneous Chores

* release 3.0.0 ([575259d](https://github.com/Squads-Protocol/squads-cli/commit/575259d1c1ac0c2dca22c75280411a3c8e7b7049))
* release 3.0.0 ([155f257](https://github.com/Squads-Protocol/squads-cli/commit/155f25743d737097f636dff543bc63731f955ef8))

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
