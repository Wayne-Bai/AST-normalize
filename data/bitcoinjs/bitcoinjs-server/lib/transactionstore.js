var assert = require('assert');
var util = require('util');
var logger = require('./logger');
var Util = require('./util');
var error = require('./error');
var events = require('events');

var MissingSourceError = error.MissingSourceError;

var TransactionStore = exports.TransactionStore = function (node) {
  events.EventEmitter.call(this);

  this.node = node;
  this.blockChain = node.getBlockChain();
  this.txIndex = {};
  this.txIndexByKey = {};

  this.orphanTxIndex = {};
  this.orphanTxByPrev = {};
};

util.inherits(TransactionStore, events.EventEmitter);

/**
 * Add transaction to memory pool.
 *
 * Note that transaction verification is asynchronous, so for proper error
 * handling you need to provide a callback.
 *
 * @return Boolean Whether the transaction was new.
 */
TransactionStore.prototype.add = function (tx, callback) {
  var self = this;

  var txHash = tx.getHash().toString('base64');

  if (Array.isArray(this.txIndex[txHash])) {
    // Transaction is currently being verified, add callback to queue
    if ("function" === typeof callback) {
      this.txIndex[txHash].push(callback);
    }
    return false;
  } else if (this.txIndex[txHash]) {
    // Transaction is already known and verified, call callback immediately
    if ("function" === typeof callback) {
      callback(null, tx);
    }
    return false;
  } else if (callback) {
    if ("function" !== typeof callback) {
      throw new Error("Invalid callback");
    }

    // Create a new queue of callbacks to run after verification
    this.txIndex[txHash] = [callback];
  } else {
    // No callbacks to call after verification
    this.txIndex[txHash] = [];
  }

  function runCallbacks(err, tx) {
    var callbackQueue = self.txIndex[txHash];
    delete self.txIndex[txHash];
    if (!Array.isArray(callbackQueue)) {
      // This should never happen and if it does indicates an error in
      // this library.
      logger.error("Transaction store verification callback misfired");
      return;
    }
    if (!err) {
      // Transaction is valid, add to memory pool
      self.txIndex[txHash] = tx;
    } else {
      // Transaction is not valid, remove from memory pool
      // Note that the transaction may have been added to the orphan pool
      // instead by the verification routine.
      delete self.txIndex[txHash];
    }
    callbackQueue.forEach(function (cb) { cb(err, tx); });
  };

  // Write down when we first noticed this transaction
  tx.first_seen = new Date();

  try {
    if (tx.isCoinBase()) {
      throw new Error("Coinbase transactions are only allowed as part of a block");
    }
    if (!tx.isStandard()) {
      throw new Error("Non-standard transactions are currently not accepted");
    }
    tx.cacheInputs(this.blockChain, this, false, (function (err, txCache) {
      if (err) {
        runCallbacks(err);
        return;
      }

      tx.verify(txCache, self.blockChain, (function (err) {
        if (err) {
          if (err instanceof MissingSourceError) {
            // Verification couldn't proceed because of a missing source
            // transaction. We'll add this one to the orphans and try
            // again later.
            this.orphanTxIndex[txHash] = tx;

            // Note that we'll call the callback now instead of waiting for
            // the missing source transaction, because we might never get it.
            // If the caller needs to handle this case, they should check for
            // a MissingSourceError themselves.
            if (!this.orphanTxByPrev[err.missingTxHash]) {
              this.orphanTxByPrev[err.missingTxHash] = [tx];
            } else {
              this.orphanTxByPrev[err.missingTxHash].push(tx);
            }
          }

          runCallbacks(err, tx);
          return;
        }

        // TODO: Check conflicts with other in-memory transactions

        runCallbacks(err, tx);

        // Process any orphan transactions that are waiting for this one
        if (this.orphanTxByPrev[txHash]) {
          this.orphanTxByPrev[txHash].forEach(function (tx) {
            self.add(tx);
          });
          delete this.orphanTxByPrev[txHash];
        }

        var eventData = {
          store: this,
          tx: tx
        };

        this.emit("txNotify", eventData);

        logger.info("Added tx " + Util.formatHash(tx.getHash()));

        // Create separate events for each address affected by this tx
        if (this.node.cfg.feature.liveAccounting) {
          var affectedKeys = tx.getAffectedKeys(txCache);

          for (var i in affectedKeys) {
            if(affectedKeys.hasOwnProperty(i)) {
              if (!this.txIndexByKey[i]) {
                this.txIndexByKey[i] = [];
              }
              this.txIndexByKey[i].push(txHash);
              this.emit('txNotify:'+i, eventData);
            }
          }
        }
      }).bind(this));
    }).bind(this));
  } catch (e) {
    runCallbacks(e);
  }

  return true;
};

TransactionStore.prototype.get = function (hash, callback) {
  if (Buffer.isBuffer(hash)) {
    hash = hash.toString('base64');
  }

  assert.equal(typeof hash, 'string');

  // If the transaction is currently being verified, we'll return null.
  if (Array.isArray(this.txIndex[hash])) {
    // But if there is a callback we'll return the transaction as soon as
    // it's ready.
    if ("function" === typeof callback) {
      this.txIndex[hash].push(callback);
    }
    return null;
  } else {
    // Note that we will return undefined if the transaction is not known
    if ("function" === typeof callback) {
      callback(null, this.txIndex[hash]);
    }
    return this.txIndex[hash];
  }
};

TransactionStore.prototype.getAll = function getAll() {
  var self = this;
  return Object.keys(this.txIndex).map(function (key) {
    return self.txIndex[key];
  });
};

TransactionStore.prototype.remove = function (hash) {
  var self = this;
  if (Buffer.isBuffer(hash)) {
    hash = hash.toString('base64');
  }

  assert.equal(typeof hash, 'string');

  // If the transaction is currently being verified, we'll wait and
    // delete it later.
  if (Array.isArray(this.txIndex[hash])) {
    this.txIndex[hash].push(function (err, tx) {
      if (err) {
        // The transaction didn't make it anyway, we're done
        return;
      }

      self.remove(hash);
    });
  } else if (this.txIndex[hash]) {
    var tx = this.txIndex[hash];
    delete this.txIndex[hash];
    var eventData = {
      store: this,
      tx: tx,
      txHash: hash
    };
    this.emit('txCancel', eventData);

    // Create separate events for each address affected by this tx
    if (this.node.cfg.feature.liveAccounting) {
      var affectedKeys = tx.getAffectedKeys();

      for (var i in affectedKeys) {
        if (affectedKeys.hasOwnProperty(i)) {
          this.emit('txCancel:'+i, eventData);
        }
      }
    }
  }
};


TransactionStore.prototype.isKnown = function (hash) {
  if (Buffer.isBuffer(hash)) {
    hash = hash.toString('base64');
  }

  assert.equal(typeof hash, 'string');

  // Note that a transaction will return true here even is it is still
  // being verified.
  return !!(this.txIndex[hash] || this.orphanTxIndex[hash]);
};


TransactionStore.prototype.find = function (hashes, callback) {
  var self = this;
  var callbacks = hashes.length;
  var disable = false;

  if (!hashes.length) {
    callback(null, []);
  }

  var result = [];
  hashes.forEach(function (hash) {
    self.get(hash, function (err, tx) {
      if (disable) {
        return;
      }

      if (err) {
        callback(err);
        disable = true;
      }

      callbacks--;

      if (tx) {
        result.push(tx);
      }

      if (callbacks === 0) {
        callback(null, result);
      }
    });
  });
};

TransactionStore.prototype.getByKey = function (pubKeyHash) {
  if (Buffer.isBuffer(pubKeyHash)) {
    pubKeyHash = pubKeyHash.toString('base64');
  }

  var accIndex = this.txIndexByKey[pubKeyHash], newIndex = [], txList = [];

  if (!accIndex) {
    return [];
  } else {
    for (var i = 0, l = accIndex.length; i < l; i++) {
      var tx = this.txIndex[accIndex[i]];
      if (tx) {
        // We use this opportunity to create a new index where the
        // tx that no longer exist in the pool are removed
        // TODO: This cleanup should probably be done on blockAdd
        newIndex.push(accIndex[i]);

        // TODO: Create the asynchronous version of this function
        if ("function" !== typeof tx) {
          txList.push(tx);
        }
      }
    }

    if (newIndex.length) {
      this.txIndexByKey[pubKeyHash] = newIndex;
    } else {
      delete this.txIndexByKey[pubKeyHash];
    }

    return txList;
  }
};

TransactionStore.prototype.findByKey = function (pubKeyHashes, callback) {
  var self = this;

  var txList = [];
  pubKeyHashes.forEach(function (hash) {
    if (self.txIndexByKey[hash]) {
      txList = txList.concat(self.txIndexByKey[hash]);
    }
  });

  return this.find(txList, callback);
};

/**
 * Handles a spend entering the block chain.
 *
 * If a transaction spend enters the block chain, we have to remove it
 * and any conflicting transactions from the memory pool.
 */
TransactionStore.prototype.handleTxAdd = function (e) {
  // Remove transaction from memory pool
  var txHash = e.tx.getHash().toString('base64');
  this.remove(txHash);

  // Notify other components about spent inputs
  if (!e.tx.isCoinBase()) {
    for (var i = 0, l = e.tx.ins.length; i < l; i++) {
      // TODO: Implement removal of conflicting tx
      // 1. Find transaction depending on this output
      // If there is none, we're done, otherwise:
      // 2. Remove it from the pool
      // 3. Issue txCancel messages
    }
  }
};

TransactionStore.prototype.getCount = function () {
  return Object.keys(this.txIndex).length;
};
