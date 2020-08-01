var registered = false;
/**
 * Establish a connection with the server. Only can be run once.
 * @param  {Object} options Parameters. Possible keys: host, port, config, debug.
 */
nodetron.registerWithServer = function(options){
  if (typeof options === 'undefined' || typeof options.host === 'undefined') {
    throw new Error('Host not specified!');
  }
  if (options.host === 'localhost') {
    throw new Error('Localhost is not a valid option; use 127.0.0.1');
  }
  if (registered) {
    console.error('Already registered with server!');
    return;
  }

  nodetron.id = localStorage.getItem('_nodetron_uuid');
  // localStorage only returns strings
  // localStorage returns 'null' for both undefined and null values of items.
  if (nodetron.id === 'null') {
    nodetron.id = null;
  }

  var host = options.host;
  var port = options.port || 80; //development: 5000, production:80
  var config = options.config || {'iceServers': [{ 'url': 'stun:stun.l.google.com:19302' }]};
  var debug = nodetron.debug = options.debug || false;
  var socket = nodetron.debug = io.connect(host+':'+port);

  // data stored for the login function, should not be modified
  nodetron._options = {
    port: port,
    config: config,
    host: host,
    debug: debug
  };

  socket.on('users', function (data) {
    _debug(data);
    socket.emit('acknowledge', {received: true});
  });
  _debug(function(){
    socket.on('message', function(data){
      console.log('Nodetron: ',data);
    });
  });

  registered = true;
};

var token = null;
/**
 * Log user in with server. Creates peer object on nodetron.self.
 * @param  {Object} options Parameters. Possible keys: key, metadata, id.
 */
nodetron.login = function(options) {
  var id = options.id || nodetron.id;
  if (options.newId || !id) {
    id = nodetron.uuid.v4();
    token = nodetron.uuid.v4();
  }
  nodetron.id = id;
  localStorage.setItem('_nodetron_uuid', id);
  var key = options.key || 'default';
  var metadata = options.userData;

  // token must be unique per id AND per connection
  // on a new connection, you can generate a new token even if using the same id
  token = token || nodetron.uuid.v4(); // random token to auth this connection/session

  nodetron.socket.emit('login', {
    key:key,
    id:id,
    token:token,
    metadata:metadata
  });

  nodetron._options.key = options.key;
  var peer = nodetron.self = new Peer(id, nodetron._options, nodetron.socket);

  peer.on('error', function(err){
    _debug('Got an error:', err);
  });

  peer.on('close', function(err){
    _debug('Connection closed', err);
  });

  peer.on('open', function(id){
    _debug('Connection Opened, User ID is', id);
  });
};

/**
 * Send a discovery query to the server to find peers to connect to.
 * @param  {Object}   queryParam Query object.
 * @param  {Function} callback   Callback that responds to the server's reply.
 *                               Passed an array of matching peers.
 */
nodetron.findPeer = function(queryParam, callback){
  var queryId = nodetron.uuid.v4();

  nodetron.activeQueries = nodetron.activeQueries || {};
  nodetron.activeQueries[queryId] = callback;

  nodetron.socket.emit('query_for_user', {queryId:queryId,queryParam:queryParam});

  var dispatchResponse = function(queryResponse){
    console.log("Received queryResponse from Server");
    if(nodetron.activeQueries[queryResponse.queryId]){
      nodetron.activeQueries[queryResponse.queryId](queryResponse.users);
      delete nodetron.activeQueries[queryId];
    }
    else {
      throw new Error("Bad query response from server", queryResponse);
    }
  };
  nodetron.socket.on('query_response', dispatchResponse);
};
