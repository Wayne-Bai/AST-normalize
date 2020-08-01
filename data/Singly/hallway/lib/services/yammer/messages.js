var request = require("request");

exports.sync = function(pi, cb) {
  var arg = {};
  arg.userMessages = [];
  if (!pi.config.url) {
    pi.config.url = "https://www.yammer.com/api/v1/messages.json?access_token=" + pi.auth.token.access_token.token;
  }

  if (pi.config.paging === true) {
    arg.url = pi.config.url + "&older_than=" + pi.config.oldestMessage;
  }
  else {
    arg.url = pi.config.url;
  }

  page(arg, pi, function(err) {
    if (pi.config.paging) {
      // schedule run 30 seconds from now to conform to yammer's guidelines
      pi.config.nextRun = Date.now() + 30*1000;
    }
    var data = {};
    data['message:'+pi.auth.pid+'/messages'] = arg.userMessages;
    cb(err, {data : data, config : pi.config});
  });
};

function page(arg, pi, callback)
{
  request.get({uri: arg.url, json: true}, function(err, resp, body) {
    var messages = body.messages;
    if (err || !messages || !Array.isArray(messages) || messages.length === 0) {
      // Receiving 0 messages can happen when done paging back
      pi.config.paging = false;
      return callback(err);
    }

    body.messages.forEach(function(e) {
      if (pi.config.paging || pi.config.newestMessage === undefined || e.id > pi.config.newestMessage) {
        // Save message to be sent if:
        //    -we are paging back
        //    -there is no newest message id saved (first run)
        //    -the message id is greater than the newest saved message
        arg.userMessages.push(e);
      }
    });

    if (pi.config.newestMessage === undefined || body.messages[0].id > pi.config.newestMessage)
      pi.config.newestMessage = body.messages[0].id; //set from first message

    // we need to save the id of the oldest message for points to page back
    if (pi.config.oldestMessage === undefined || body.messages[body.messages.length-1].id < pi.config.oldestMessage)
      pi.config.oldestMessage = body.messages[body.messages.length-1].id; //set from last message

    if (arg.userMessages.length === 0) {
      // no messages met the criteria
      pi.config.paging = false;
      return callback();
    }

    // some messages were saved
    pi.config.paging = true;
    callback();
  });
}
