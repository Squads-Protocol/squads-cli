"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.METAPLEX_PROGRAM_ID = exports.updateMetadataAuthorityIx = void 0;
var mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
Object.defineProperty(exports, "METAPLEX_PROGRAM_ID", { enumerable: true, get: function () { return mpl_token_metadata_1.PROGRAM_ID; } });
var updateMetadataAuthorityIx = function (newAuthority, currentAuthority, metadataAccount) {
    var accounts = {
        metadata: metadataAccount,
        updateAuthority: currentAuthority,
    };
    var instructionArgs = {
        updateMetadataAccountArgs: {
            data: null,
            primarySaleHappened: null,
            updateAuthority: newAuthority,
        },
    };
    return (0, mpl_token_metadata_1.createUpdateMetadataAccountInstruction)(accounts, instructionArgs, mpl_token_metadata_1.PROGRAM_ID);
};
exports.updateMetadataAuthorityIx = updateMetadataAuthorityIx;
//# sourceMappingURL=metadataInstructions.js.map