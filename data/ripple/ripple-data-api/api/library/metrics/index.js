var async                  = require('async');
var cacheTradeVolume       = require('./tradeVolume');
var cacheTransactionVolume = require('./transactionVolume');
var cacheNetworkValue      = require('./networkValue');

module.exports.init = function () {

  //cache metrics now
  cacheMetrics();

  //reset every 4 minutes
  setInterval(cacheMetrics, 4 * 60 * 1000);
}

function cacheMetrics () {
  async.series([
    function (callback) {cacheTradeVolume(null, callback)},
    function (callback) {cacheTransactionVolume(null, callback)},
    function (callback) {cacheNetworkValue(null, callback)},
  ]);
}
