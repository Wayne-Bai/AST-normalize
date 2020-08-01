var crypto = require('crypto');
var irc = require('../node-irc/lib/irc');
var config = require('../config');

// Maps a user id key to a map of a network name (eg: irc.freenode.net) to the client connected to that network
var sessions = {};

// Maps a user identification key to an inbound message queue
var queues = {};

// Maps a user identification key to a bool that is true when the user is signed in
var inactive = {};

// Maps times of last access to user ID keys.
// Used to periodically check for sessions to destroy as a consequence of the owner of the session
// failing to reestablish their session for `sessionTimeout` hours.
var accessTimes = {};

// Server notification types.
const SN_ERROR = 'error';
const SN_WARN = 'warning';
const SN_INFO = 'info';
const SN_SUCCESS = 'success';

// Check every `sessionTimeout` / 2 milliseconds for sessions that have timed out.
setInterval(
  function () {
    var times = Object.keys(accessTimes);
    var now = (new Date()).getTime();
    for (var i = 0, len = times.length; i < len; i++) {
      var time = times[i];
      var key = accessTimes[time];
      if (now - time > config.sessionTimeout && inactive[key]) {
        disconnectClients(key);
        delete sessions[key];
        delete queues[key];
        delete inactive[key];
        delete accessTimes[time];
      }
    }
  },
  config.sessionTimeout / 2 
);

var userHasSession = function (skey) {
  return typeof sessions[skey] !== 'undefined'
      && typeof queues[skey]   !== 'undefined'
      && typeof inactive[skey] !== 'udnefined';
};

// A queue for storing inbound messages while the user isn't connected.
function MessageQueue() {
  this.messages = {};
}

MessageQueue.prototype.addQueue = function (serv, chan) {
  if (typeof this.messages[serv] === 'undefined') {
    this.messages[serv] = {};
  }
  this.messages[serv][chan] = new Array();
};

MessageQueue.prototype.getMessages = function (serv, chan) {
  if ( typeof this.messages[serv] === 'undefined' 
    || typeof this.messages[serv][chan] === 'undefined' ) {
    return null;
  }
  var msgs = this.messages[serv][chan].slice(0);
  delete this.messages[serv][chan];
  if (Object.keys(this.messages[serv]).length === 0) {
    delete this.messages[serv];
  }
  return msgs;
};

MessageQueue.prototype.pushMessage = function (msg) {
  this.messages[msg.server][msg.channel].push(msg);
};

// Array remove - By John Resig (MIT LICENSED)
Array.prototype.remove = function (start, end) {
  var tail = this.slice((end || start) + 1 || this.length);
  this.length = start < 0 ? this.length + start : start;
  return this.push.apply(this, tail);
};

String.prototype.replaceAll = function (sub, newstr) {
  var index = this.indexOf(sub);
  var tmp = this;
  while (index >= 0) {
    tmp = tmp.replace(sub, newstr);
    index = tmp.indexOf(sub);
  }
  return tmp;
};

var sanitize = function (string) {
  return string.replaceAll('"', '&#34;').replaceAll("'", '&#39;')
               .replaceAll('>', '&gt;').replaceAll('<', '&lt;')
               .replaceAll('/', '&#47;').replaceAll('\\', '&#92;');
};

var createIRCClient = function (socket, params) {
  var newClient = new irc.Client(params.server, params.nick, {
    channels   : params.channels,
    userName   : 'aIRChat_' + params.nick,
    realName   : 'Airchat User',
    port       : params.portNum,
    secure     : params.useSSL,
    selfSigned : params.useSSL,
    autoRejoin : false
  });

  var messageHandler = function (from, to, priority, msg) {
    var data = {
      channel  : to,
      from     : from,
      message  : sanitize(msg),
      server   : params.server,
      priority : priority
    };
    if (inactive[socket.userIDKey]) {
      queues[socket.userIDKey].pushMessage(data);
    } else {
      socket.emit('gotMessage', data);
    }
  };

  newClient.addListener('message', function (from, to, msg) {
    if (to === params.nick) {
      return; // Let private messages be handled by the pm handler.
    }
    messageHandler(from, to, 'low', msg);
  });

  newClient.addListener('pm', function (from, msg) {
    messageHandler(from, from, 'high', msg);
  });

  newClient.addListener('action', function (from, to, parts, msg) {
    socket.emit('action', {
      nick    : from,
      server  : params.server,
      channel : to,
      message : parts
    });
  });

  newClient.addListener('registered', function (msg) {
    socket.emit('serverConnected', {server : params.server, nick : msg.args[0]});
    if ( typeof params.password !== 'undefined'
      && params.password !== null 
      && params.password.length > 0 ) {
      newClient.say('NickServ', 'identify ' + params.password);
    }
  });

  newClient.addListener('topic', function (chan, topic, nick, msg) {
    socket.emit('topic', {
      channel : chan,
      server  : params.server,
      topic   : topic
    });
  });

  newClient.addListener('ctcp', function (from, to, text, type, msg) {
    if (type === 'privmsg') return;
    socket.emit('ctcp', {
      server  : params.server,
      channel : 'System',
      info    : 'Type ' + type + ': ' + text
    });
  });

  newClient.addListener('+mode', function (channel, by, mode, argument, msg) {
    if (typeof by === 'undefined') {
      by = 'ChanServ';
    }
    socket.emit('setMode', {
      channel : channel,
      server  : params.server,
      mode    : '+' + mode,
      by      : by,
      on      : argument
    });
  });

  newClient.addListener('-mode', function (channel, by, mode, argument, msg) {
    if (typeof by === 'undefined') {
      by = 'ChanServ';
    }
    socket.emit('setMode', {
      channel : channel,
      server  : params.server,
      mode    : '-' + mode,
      by      : by,
      on      : argument
    });
  });

  newClient.addListener('whois', function (info) {
    var infoMsg = info.nick + '@' + info.host + ', user ' + info.user + ', realname: ' + info.realname;
    infoMsg += ' is on the channels ' + info.channels.join(', ') + '. ';
    socket.emit('gotWhois', {
      channel : 'System',
      server  : params.server,
      info    : infoMsg
    });
  });

  newClient.addListener('names', function (channel, nicks) {
    var nicknames = Object.keys(nicks);
    socket.emit('nickList', {
      channel : channel,
      server  : params.server,
      nicks   : nicknames
    });
  });

  newClient.addListener('join', function (channel, nick, msg) {
    socket.emit('joined', {
      channel : channel,
      nick    : nick,
      server  : params.server
    });
    if (nick === newClient.nick) {
      var messages = queues[socket.userIDKey].getMessages(params.server, channel);
      if (messages) {
        socket.emit('backlog', messages);
      } else {
        queues[socket.userIDKey].addQueue(params.server, channel);
      }
    }
  });

  newClient.addListener('kick', function (channel, nick, by, reason, msg) {
    socket.emit('kicked', {
      server  : params.server, 
      channel : channel, 
      nick    : nick,
      by      : by, 
      reason  : reason
    });
  });

  newClient.addListener('nick', function (oldnick, newnick, channels, msg) {
    for (var i = channels.length - 1; i >= 0; i--) {
      socket.emit('newNick', {
        old     : oldnick, 
        new     : newnick, 
        server  : params.server, 
        channel : channels[i]
      });
    }
  });

  newClient.addListener('invite', function (channel, from) {
    socket.emit('invited', {
      server : params.server, 
      to     : channel, 
      by     : from
    });
  });

  newClient.addListener('part', function (channel, nick, reason, msg) {
    socket.emit('userLeft', {
      server : params.server, 
      from   : channel, 
      nick   : nick, 
      reason : reason
    });
  });

  // TODO
  // Change this to send one message with the array of channels instead of multiple
  // messages. Involves changing chatmain as well.
  newClient.addListener('quit', function (nick, reason, channels, msg) {
    for (var i = channels.length - 1; i >= 0; i--) {
      socket.emit('userLeft', {
        server : params.server,
        from   : channels[i], 
        nick   : nick, 
        reason : reason
      });
    }
  });

  newClient.addListener('error', function (error) {
    socket.emit('serverNotification', {
      message: error.args.join(' '),
      type   : SN_ERROR
    });
  });

  return newClient;
};

var disconnectClients = function (key) {
  var servers = Object.keys(sessions[key]);
  for (var i = servers.length - 1; i >= 0; i--) {
    sessions[key][servers[i]].disconnect('Connection to server closed.');
  }
};

exports.newClient = function (socket) {
  socket.emit('authReq');

  socket.on('authenticate', function (data) {
    if (userHasSession(data.key) && inactive[data.key]) {
      socket.emit('serverNotification', {
        message : 'Recreating your last session. It may take a few seconds.',
        type    : SN_INFO
      });
      var servers = Object.keys(sessions[data.key]);
      for (var i = 0; i < servers.length; i++) {
        var server = servers[i];
        var channels = new Array();
        var chanNames = Object.keys(sessions[data.key][server].chans);
        for (var j = 0; j < chanNames.length; j++) {
          // Destructure the IRC Client data to get the original channel name,
          // which has been stored in lowercase in chanNames.
          var channel = sessions[data.key][server].chans[chanNames[j]].serverName;
          channels.push(channel);
        }
        var nick = sessions[data.key][server].nick;
        var portNum = sessions[data.key][server].opt.port;
        var secure = sessions[data.key][server].opt.secure;
        var password = sessions[data.key][server].opt.password;
        sessions[data.key][server].disconnect('User session is being recreated.');
        delete sessions[data.key][server];
        sessions[data.key][server] = createIRCClient(socket, {
          server   : server,
          channels : channels,
          nick     : nick,
          portNum  : portNum,
          useSSL   : secure
        });
        if (typeof password !== 'undefined' && password !== null) {
          sessions[data.key][server].say('NickServ', 'identify ' + password);
        }
      }
      socket.userIDKey = data.key;
      inactive[data.key] = false;
    } else {
      socket.emit('badAuth'); 
    }
  });

  socket.on('createSession', function (data) {
    (function sendKey() {
      crypto.randomBytes(32, function (ex, buf) {
        if (ex) {
          sendKey();
        } else {
          var key = buf.toString('base64');
          if (typeof sessions[key] !== 'undefined') {
            sendKey();
          } else {
            var time = new Date();
            sessions[key] = {};
            queues[key] = new MessageQueue();
            inactive[key] = false;
            accessTimes[time.getTime()] = key;
            socket.emit('newID', {key: key});
            socket.userIDKey = key;
          }
        }
      });
    })();
  });
  
  socket.on('rawCommand', function (data) {
    if (!userHasSession(socket.userIDKey)) {
      socket.emit('badAuth');
      return;
    }
    var client = sessions[socket.userIDKey][data.server];
    client.send.apply(client, data.command.split(' '));
  });

  socket.on('part', function (data) {
    var key = socket.userIDKey;
    if (!userHasSession(key)) {
      socket.emit('badAuth');
      return;
    }
    sessions[key][data.server].part(data.channel, data.message);
    // If the channel being parted from is the last one connected to by the
    // client, disconnect from the network so it can be reconnected to later.
    if (sessions[key][data.server].chans.length === 1) { 
      sessions[key][data.server].disconnect('aIRChat user disconnected.');
      delete sessions[key][data.server];
    }
  });
  
  socket.on('serverJoin', function (data) {
    var key = socket.userIDKey;
    if (!userHasSession(key)) {
      socket.emit('badAuth');
      return;
    }
    if (!sessions[key][data.server]) {
      sessions[key][data.server] = createIRCClient(socket, data);
    } else {
      socket.emit('serverNotification', {
        message : 'You are already connected to ' + data.server + '.',
        type    : SN_ERROR
      });
    }
  });

  socket.on('joinChannel', function (data) {
    var key = socket.userIDKey;
    if (!userHasSession(key)) {
      socket.emit('badAuth');
      return;
    }
    if (sessions[key][data.server].opt.channels.indexOf(data.channel) === -1) {
      sessions[key][data.server].join(data.channel);
    } else {
      socket.emit('serverNotification', {
        message : 'You have already joined ' + data.channel + '.',
        type    : SN_ERROR
      });
    }
  });

  socket.on('writeChat', function (data) {
    var key = socket.userIDKey;
    if (!userHasSession(key)) {
      socket.emit('badAuth');
      return;
    }
    sessions[key][data.server].say(data.destination, data.message);
  });

  socket.on('changeNick', function (data) {
    var key = socket.userIDKey;
    if (!userHasSession(key)) {
      socket.emit('badAuth');
      return;
    }
    if (typeof sessions[key][data.server] === 'undefined') {
      socket.emit('serverNotification', {
        message : 'Not connected to ' + data.server + '.',
        type    : SN_ERROR
      });
    } else {
      sessions[key][data.server].send('nick', data.nick);
    }
  });

  socket.on('disconnect', function () {
    inactive[socket.userIDKey] = true;
  });
};

exports.main = function (req, res) {
  res.render('chat', {
    host           : config.host,
    sessionTimeout : config.sessionTimeout,
    title          : 'aIRChat'
  });
};
