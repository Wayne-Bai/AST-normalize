var vows = require('vows'),
    assert = require('assert');

var Connection = require('../lib/connection').Connection;
var Script = require('../lib/script').Script;
var Transaction = require('../lib/schema/transaction').Transaction;
var Util = require('../lib/util');
var encodeHex = Util.encodeHex;
var decodeHex = Util.decodeHex;

vows.describe('Transaction').addBatch({
  'An example transaction': {
    topic: function () {
      // Tx f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16
      // from livenet, block 170
      var txData = decodeHex("0100000001c997a5e56e104102fa209c6a852dd90660a20b2d9c352423edce25857fcd3704000000004847304402204e45e16932b8af514961a1d3a1a25fdf3f4f7732e9d624c6c61548ab5fb8cd410220181522ec8eca07de4860a4acdd12909d831cc56cbbac4622082221a8768d1d0901ffffffff0200ca9a3b00000000434104ae1a62fe09c5f51b13905f07f06b99a2f7159b2225f374cd378d71302fa28414e7aab37397f554a7df5f142c21c1b7303b8a0626f1baded5c72a704f7e6cd84cac00286bee0000000043410411db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5cb2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a3ac00000000");
      var txInfo = Connection.parseTx(txData);
      var tx = new Transaction(txInfo);
      return tx;
    },

    'is a Transaction': function (topic) {
      assert.instanceOf(topic, Transaction);
    },

    'hashes for signature correctly': function (topic) {
      var scriptData = decodeHex("410411db93e1dcdb8a016b49840f8c53bc1eb68a382e97b1482ecad7b148a6909a5cb2e0eaddfb84ccf9744464f82e160bfa9b8b64f9d4c03f999b8643f656b412a3ac");
      var script = new Script(scriptData);
      var hash = topic.hashForSignature(script, 0, 1);
      assert.equal(
        encodeHex(hash),
        "7a05c6145f10101e9d6325494245adf1297d80f8f38d4d576d57cdba220bcb19");
    }
  }
}).export(module);

