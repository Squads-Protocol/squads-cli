// Stub for @irys/sdk (see package.json for why). Metaplex's IrysStorageDriver
// instantiates `new (await import('@irys/sdk')).default(...)` only when an
// upload is attempted, so this throws a clear error instead of silently failing.
class IrysStub {
    constructor() {
        throw new Error(
            "@irys/sdk is stubbed out in @sqds/cli: Irys/Bundlr storage uploads are not supported. " +
            "This CLI only reads and transfers NFTs and never uploads metadata."
        );
    }
}

module.exports = IrysStub;
module.exports.default = IrysStub;
module.exports.WebIrys = IrysStub;
module.exports.NodeIrys = IrysStub;
