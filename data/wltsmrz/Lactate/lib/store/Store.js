// Generic Store interface

var CacheItem = require('./CacheItem');
var expire = require('expire');

function Store(options) {
  this._cache = Object.create(null);
  this.count = 0;
  this.size = 0;
  this.expire = 1000 * 900;
  this.max_keys = Infinity;
  this.max_size = (1 << 20) * 100;
  this.segment = (1 << 10) * 200;

  if (options) {
    this.setOptions(options);
  };
};

Store.prototype.newItem = function(headers, data, expire) {
  return new CacheItem(headers, data, expire);
};

Store.prototype.now = function() {
  return Date.now();
};

Store.prototype.setOptions = function(key, val) {
  if (typeof key === 'object') {
    for (var k in key) {
      this.setOptions(k, key[k]);
    };
  } else {
    key = key.replace(/\s/g, '_');

    if (!this.hasOwnProperty(key)) return;

    switch(key) {
      case 'expire':
        var type = typeof val;
        if (type === 'string')
          val = expire.getSeconds(val) * 1000;
        else if (type === 'number')
          val = val * 1000;
        else return;
        break;
      case 'max_size':
          val = (1 << 20) * val;
        break;
    };

    this[key] = val;
  };
};

module.exports = Store;
