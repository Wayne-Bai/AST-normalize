'use strict';

var Publico = require('meatspace-publico');
var webremix = require('webremix');

var dashboard = new Publico('none', {
  db: './db/db-public-dashboard',
  limit: 25
});

var dual = {};

var TTL = 1000 * 60 * 60; // 1 hour

var setDatabase = function (keyName, next) {
  if (!keyName) {
    next(new Error('Invalid keyname'));
    return;
  }

  keyName = keyName.replace(/^w+/, '');

  if (keyName.length < 3) {
    next(new Error('Invalid keyname length, exiting'));
    return;
  }

  if (!dual[keyName]) {
    dual[keyName] = new Publico('none', {
      db: './db/db-' + keyName,
      limit: 25
    });
  }

  next(null, keyName);
};

exports.recent = function (socket) {
  dashboard.getChats(true, '\xff', function (err, c) {
    if (err) {
      console.log(err);
      return;
    }

    c.chats.reverse();

    c.chats.forEach(function (chat) {
      socket.emit('feed', chat.value.message);
    });
  });
};

exports.recentByKey = function (start, key, socket) {
  setDatabase(key, function (err, k) {
    if (!err) {
      dual[k].getChats(false, start, function (err, c) {
        if (err) {
          console.log(err);
          return;
        }

        c.chats.forEach(function (chat) {
          socket.emit('message', chat.value.message);
        });
      });
    }
  });
};

exports.addMessage = function (payload, next) {
  var keyName = [payload.sender, payload.receiver].sort().join('-');
  setDatabase(keyName, function (err, k) {
    if (err) {
      next(err);
      return;
    }

    var feedMessage = payload;
    feedMessage.text = feedMessage.text.toString('utf8');

    var addToDualMessage = function (msg) {
      dual[k].addChat(msg, {
        ttl: TTL
      }, function (err) {
        if (err) {
          next(err);
          return;
        }

        next(null, feedMessage);
      });
    };

    if (payload.public) {
      webremix.generate(feedMessage.text, function (err, fmsg) {
        if (err) {
          next(err);
          return;
        }

        feedMessage.html = fmsg;
        dashboard.addChat(feedMessage, {
          ttl: TTL
        }, function (err) {
          if (err) {
            next(err);
            return;
          }

          addToDualMessage(feedMessage);
        });
      });
    } else {
      addToDualMessage(feedMessage);
    }
  });
};
