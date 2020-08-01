var EventEmitter = require('events').EventEmitter;
var Client = require('./client');

module.exports =
function Pool(options) {
  var p = new EventEmitter();
  p.setMaxListeners(options.maxQueue || 1000);

  var maxPool = options.maxPool || 5;

  var pool = [];
  var waitingList = [];

  /// Get

  p.get =
  function get(callback) {
    var client = getFromPool();
    if (! client && pool.length < maxPool) client = create();

    if (client) callback(client);
    else {
      waitingList.push(callback);
    }
  }

  function getFromPool() {
    var client;
    for (var i = 0; i < pool.length; i ++) {
      client = pool[i];
      if (! client.busy && client.queue.length == 0) return client;
    }
  }

  /// Drain

  p.on('drain', function(client) {
    /// Once there is a client available, give it
    /// the next request in the waiting list
    if (waitingList.length) waitingList.shift()(client);
  });

  /// Create

  function create() {
    var client = Client(options);

    client.on('drain', function() {
      p.emit('drain', client);
    });

    client.on('warning', function(err) {
      p.emit('warning', err, client);
    });

    client.once('close', function() {
      p.emit('close', client);
    });

    client.once('end', function() {
      p.emit('end', client);
      remove(client);

      if (pool.length == 0) {
        process.nextTick(function() {
          p.emit('end');
        });
      }
    });

    client.on('error', function(err) {
      p.emit('error', err);
    });

    pool.push(client);
    return client;
  }

  function remove(client) {
    var index = pool.indexOf(client);
    if (~index) pool.splice(index, 1);
  };


  /// Disconnect

  p.disconnect =
  function disconnect() {
    if (! pool.length) {
      process.nextTick(function() { p.emit('end'); });
      return;
    }

    pool.forEach(function(client) {
      client.disconnect();
    });
  };

  return p;
};
