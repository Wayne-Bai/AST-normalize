var querystring = require('querystring');
var request = require('request');

exports.sync = function(pi, cb) {
  var arg = {};
  arg.oauth = {
    consumer_key    : pi.auth.consumerKey,
    consumer_secret : pi.auth.consumerSecret,
    token           : pi.auth.token,
    token_secret    : pi.auth.tokenSecret
  };
  arg.data = {};
  arg.files = arg.data['meta:' + pi.auth.pid + '/files'] = [];
  arg.folders = arg.data['meta:' + pi.auth.pid + '/folders'] = [];
  arg.url = 'https://api.dropbox.com/1/delta';
  arg.form = {};
  if(pi.config && pi.config.cursor) arg.form.cursor = pi.config.cursor;
  delta(arg, function(err, hasMore, cursor) {
    var config = {};
    if (cursor) config.cursor = cursor;
    if (hasMore) config.nextRun = -1;

    cb(err, {
      data: arg.data,
      config: config
    });
  });
};

// check the delta
function delta(arg, cbDone) {
  request.post(arg, function(err, res, deltas){
    if(err) return cbDone(err);
    if(!deltas) return cbDone("no data, " + res.statusCode);

    try {
      deltas = JSON.parse(deltas);
    } catch(E) {
      return cbDone(E+' '+deltas);
    }

    if(!Array.isArray(deltas.entries)) return cbDone("no entries?");

    deltas.entries.forEach(function(entry){
      if(!entry[1]) return;

      if (entry[1].is_dir === true) arg.folders.push(entry[1]);
      else arg.files.push(entry[1]);
    });

    cbDone(err, deltas.has_more, deltas.cursor);
  });
}
