/**
 * This is a client for Block Explorer.
 *
 * What is it used for? Currently it is only used by the "bitcoinjs verify"
 * command line tool.
 */

// Dependencies
var http = require('http');
var logger = require('../logger');
var Util = require('../util');

var BlockExplorer = exports.BlockExplorer = function BlockExplorer() {
  // URL hardcoded because this service is currently closed source
  this.host = "blockexplorer.com";
};

/**
 * Asks the service about the hash for the block with a certain height.
 */
BlockExplorer.prototype.getHashByCount = function (height, callback) {
  var client = http.createClient(80, this.host);

  var req = client.request('HEAD', '/b/'+height, {host:this.host});
  req.end();
  req.on('response', function (res) {
    var location = res.headers.location;
    var hash = Util.decodeHex(location.substr(location.lastIndexOf('/')+1, 64));
    hash.reverse();
    callback(null, hash);
  });
};
