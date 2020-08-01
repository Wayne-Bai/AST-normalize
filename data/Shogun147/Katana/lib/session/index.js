var conf = App.get('session');

var Store = null;

var utils  = App.utils;
var token  = utils.token;
var extend = utils.extend;

var Session = App.session = module.exports = function(id) {
  if (!(this.id = id)) {
    this.generate();
  }

  extend(this, conf.defaults);
}

Session.prototype = {
  load: function(callback) {
    var self = this;
    Store.read(this.id, function(error, data) {
      if (error) { return callback(error); }

      extend(self, data);
      callback(null);
    });
  },

  save: function(callback) {
    Store.save(this.id, this, callback);
  },

  clear: function() {
    var self = this;
    Object.keys(this).forEach(function(key) {
      if (key !== 'id') {
        delete self[key];
      }
    });
  },

  reset: function() {
    Store.delete(this.id);
    this.clear();
    this.generate();
  },

  generate: function() {
    this.id = token(conf.key.length);

    extend(this, conf.defaults);
  }
}

Session.stores = {};
Session.store = function(name, provider) {
  Session.stores[name] = provider;
}

Session.stores.memory   = require('./memory');
Session.stores.redis    = require('./redis');
Session.stores.mongoose = require('./mongoose');

App.on('start', function() {
  Store = new Session.stores[App.get(':stores '+ conf.store.name +' provider')](conf);
});

App.use(function(request, response, next) {
  request.pause();

  response.on('header', function() {
    response.cookies.set(conf.key.name, request.session.id, { expires: conf.expires });
  });

  var end = response.end;
  response.end = function(data, encoding) {
    response.end = end;
    response.session.save(function(error) {
      if (error) { App.log('error', error); }

      response.end(data, encoding);
    });
  }

  var sess = new Session(request.cookies.get(conf.key.name));
  sess.load(function(error) {
    if (error) { App.log('error', error); }

    request.session = response.session = sess;
    request.resume();

    next();
  });
});
