var combine = require('stream-combiner2');
var BlobParser = require('./lib/blob_parser');
var BlobEncoder = require('./lib/blob_encoder');
var BlobDecompressor = require('./lib/decompress');
var PrimitivesParser = require('./lib/primitives');

/* Default function returns the full pipeline */
module.exports = function() {
    return combine.obj([
        new BlobParser(),
        new BlobDecompressor(),
        new PrimitivesParser()
    ]);
};

/* Individual exports */
module.exports.BlobParser = BlobParser;
module.exports.BlobEncoder = BlobEncoder;
module.exports.BlobDecompressor = BlobDecompressor;
module.exports.PrimitivesParser = PrimitivesParser;
