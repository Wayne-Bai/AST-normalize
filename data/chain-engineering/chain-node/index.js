var bitcoin = require('bitcoinjs-lib');
var HttpUtility = require('./http-utility');
var Signer = require('./signer');
var util = require('util');

module.exports = Chain;

function Chain(c) {
  if(c.keyId == null) {
    c.keyId = "GUEST-TOKEN";
  };
  this.auth = {user: c.keyId, pass: c.keySecret};

  if(c.url == null) {
    c.url = 'https://api.chain.com';
  };
  if(c.apiVersion == null) {
    c.apiVersion = 'v2';
  };
  if(c.blockChain == null) {
    c.blockChain = 'bitcoin';
  };

  if(c.blockChain == 'bitcoin') {
    this.blockChainConfig = bitcoin.networks.bitcoin;
  } else {
    this.blockChainConfig = bitcoin.networks.testnet;
  }

  var baseurl = c.url + '/' + c.apiVersion;
  this.dataApi = new HttpUtility({
    url: baseurl + '/' + c.blockChain,
    auth: this.auth
  });
  this.notifApi = new HttpUtility({
    url: baseurl + '/notifications',
    auth: this.auth
  });
}

Chain.prototype.getAddress = function(address, cb) {
  this.dataApi.get('/addresses/' + address, cb);
};

Chain.prototype.getAddresses = function(addresses, cb) {
  this.getAddress(addresses.join(','), cb);
};

Chain.prototype.getAddressTransactions = function(address, options, cb) {
  this.dataApi.get('/addresses/' + address + '/transactions', options, cb);
};

Chain.prototype.getAddressesTransactions = function(addresses, options, cb) {
  this.getAddressTransactions(addresses.join(','), options, cb);
};

Chain.prototype.getAddressUnspents = function(address, cb) {
  this.dataApi.get('/addresses/' + address + '/unspents', cb);
};

Chain.prototype.getAddressesUnspents = function(addresses, cb) {
  this.getAddressUnspents(addresses.join(','), cb);
};

Chain.prototype.getAddressOpReturns = function(address, cb) {
  this.dataApi.get('/addresses/' + address + '/op-returns', cb);
};

Chain.prototype.getTransaction = function(hash, cb) {
  this.dataApi.get('/transactions/' + hash, cb);
};

Chain.prototype.getTransactionOpReturn = function(hash, cb) {
  this.dataApi.get('/transactions/' + hash + '/op-return', cb);
};

Chain.prototype.getTransactionConfidence = function(hash, cb) {
  this.dataApi.get('/transactions/' + hash + '/confidence', cb);
};

Chain.prototype.sendTransaction = function(hex, cb) {
  this.dataApi.post('/transactions', {hex: hex}, cb);
};

Chain.prototype.getBlock = function(hashOrHeight, cb) {
  this.dataApi.get('/blocks/' + hashOrHeight, cb);
};

Chain.prototype.getLatestBlock = function(cb) {
  this.getBlock('latest', cb);
};

Chain.prototype.getBlockOpReturns = function(hashOrHeight, cb) {
  this.dataApi.get('/blocks/' + hashOrHeight + '/op-returns', cb);
};

Chain.prototype.createNotification = function(args, cb) {
  this.notifApi.post('/', args, cb);
};

Chain.prototype.listNotifications = function(cb) {
  this.notifApi.get('/', cb);
};

Chain.prototype.deleteNotification = function(id, cb) {
  this.notifApi.delete('/' + id, cb);
};

Chain.prototype.signTemplate = function(template, keys) {
  var keys = Signer.keysFromStrings(keys);
  return Signer(this.blockChainConfig, template, keys);
};

Chain.prototype.sendTransaction = function(template, cb) {
  if (typeof template == 'string' || template instanceof String) {
    template = {signed_hex: template};
  }
  this.dataApi.post('/transactions/send', template, cb);
};

Chain.prototype.buildTransaction = function(args, cb) {
  var buildRequest = {
    inputs: args.inputs,
    outputs: args.outputs,
    miner_fee_rate: args.miner_fee_rate,
    change_address: args.change_address,
    min_confirmations: args.min_confirmations
  };
  this.dataApi.post('/transactions/build', buildRequest, cb);
};

Chain.prototype.transact = function(args, cb) {
  var that = this;
  var blockChainConfig = this.blockChainConfig;

  var keys = Signer.keysFromStrings(args.inputs.map(function(inp) {
    return inp.private_key
  }));

  args.inputs = args.inputs.map(function(input) {
    return {address: input.address};
  });

  this.buildTransaction(args, function(err, resp) {
    if(err == null) {
      var signedTemplate = Signer(blockChainConfig, resp, keys);
      that.sendTransaction(signedTemplate, cb);
    } else {
      cb(err, null);
    }
  });
};
