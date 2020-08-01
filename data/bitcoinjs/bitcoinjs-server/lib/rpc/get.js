/**
 * This RPC module provides block chain data as JSON.
 *
 * It's mostly used by the node-bitcoin-explorer project, but it's useful for any
 * situation where you need to query data from the block chain.
 */

var Util = require('../util');
var Connection = require('../connection').Connection;

/**
 * Get a block in the active chain by its height.
 *
 * Example Request:
 *
 * 17493
 *
 * Response:
 *
 * See getblockbyhash for an example of the response format.
 */
exports.getblockbycount = function getblockbycount(args, opt, callback) {
  var height = +args[0];
  this.node.blockChain.getBlockByHeight(height, function (err, block) {
    if (err) {
      callback(err);
      return;
    }

    if (block) {
      this.node.storage.getTransactionsByHashes(block.txs, function (err, txs) {
        if (err) {
          callback(err);
          return;
        }

        callback(null, block.getStandardizedObject(txs));
      });
    } else {
      callback(null, false);
    }
  }.bind(this));
};


/**
 * Retrieve a block by its hash
 *
 * Example Request:
 *
 * "00000000002d1a4380793affbc610885aa2e0b224eeedd64ffe108044ec7d434"
 *
 * Submit the hash as a hex encoded string.
 *
 * Example Response:
 *
 * {
 *     "hash" :
 *       "00000000002d1a4380793affbc610885aa2e0b224eeedd64ffe108044ec7d434",
 *     "ver" : 1,
 *     "prev_block" :
 *       "000000000103fcffbd8020ff7459f3635eb41102ee3b22fa466a7fdfc05bad58",
 *     "mrkl_root" :
 *       "9d436c694968454ea0d17f4aece3b829930027c3cb918e5107a1605aa2eeae33",
 *     "time" : 1280823515,
 *     "bits" : 469830746,
 *     "nonce" : 2918845955,
 *     "n_tx" : 4,
 *     "tx" : [
 *         ... transactions (for format, see gettxbyhash) ...
 *     ],
 *     "mrkl_tree" : [
 *         "f85e77e4379694c8d2c1232d6fddfc7792073fb8484bdac37a9ba5ed1d245c57",
 *         ...
 *     ]
 * }
 *
 * The format is the same as jgarzik's getblockbyhash patch:
 * http://forum.bitcoin.org/index.php?topic=724.0
 */
exports.getblockbyhash = function getblockbyhash(args, opt, callback) {
  var hash = Util.decodeHex(args[0].toString()).reverse();
  this.node.blockChain.getBlockByHash(hash, function (err, block) {
    if (err) {
      callback(err);
      return;
    }

    if (block) {
      this.node.storage.getTransactionsByHashes(block.txs, function (err, txs) {
        if (err) {
          callback(err);
          return;
        }

        callback(null, block.getStandardizedObject(txs));
      });
    } else {
      callback(null, false);
    }
  }.bind(this));
};

/**
 * Retrieve all memory pool transactions.
 *
 * Returns all memory pool transactions in the getblock standardized format.
 */
exports.listmemtransactions = function listmemtransactions(args, opt, callback) {
  var txs = this.node.txStore.getAll().map(function (tx) {
    return tx.getStandardizedObject();
  });
  callback(null, txs);
};

/**
 * Retrieve a transaction as hex.
 *
 * Example Request:
 *
 * "a17b21f52859ed326d1395d8a56d5c7389f5fc83c17b9140a71d7cb86fdf0f5f"
 *
 * Submit the hash as a hex encoded string.
 *
 * Example Response:
 *
 * '0100000001845ad165bdc0f9b5829cf5a594c4148dfd89e24756303f3a8dabeb597afa589b0100
 *  00008b483045022063c233df8efa3d1885e069e375a8eabf16b23475ef21bdc9628a513ee4cace
 *  b7022100...'
 * 
 */
exports.gettransactionhex = function gettransactionhex(args, opt, callback) {
  var hash = Util.decodeHex(args[0].toString()).reverse();
  this.node.blockChain.getTransactionByHash(hash, function (err, tx) {
    if (err) {
      callback(err);
      return;
    }

    if (tx) {
      callback(null, Util.encodeHex(tx.serialize()));
    } else {
      callback(null, false);
    }
  }.bind(this));
};
