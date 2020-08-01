var TIMEOUT = 100000;
var BASE = 'https://api.meetup.com';
var PAGESIZE = 2;

var request = require('request');
var util = require('util');
var querystring = require('querystring');


exports.getData = function(arg, cbDone){
  // We've been erroneously setting the offset to -1, which provokes an error
  // from Meetup's API. As synclets run, this will clean up the bad configs. We
  // can remove this line once all is well, because the `Math.max` below
  // prevents us from going below 0 again.
  if (arg.offset < 0) arg.offset = 0;

	var uri = BASE + arg.path +
            '?access_token=' + arg.access_token +
            '&page=' + PAGESIZE +
            '&offset=' + arg.offset +
            '&' + querystring.stringify(arg.params);
	request.get({
    uri     : uri,
    json    : true,
    timeout : TIMEOUT
  }, function(err, resp, json){
		if (err) return cbDone(err);
		if (resp.statusCode !== 200) {
      return cbDone(
        new Error("status code " + resp.statusCode + " " + util.inspect(json))
      );
    }
		if (!json || !json.results) return cbDone('response missing json');
		var results = json.results;
		arg.results = arg.results.concat(results);
		if (results.length === 0 ||
        (arg.sinceName && results[results.length - 1][arg.sinceName]<arg.since)) {
      cbDone(null, arg.results, Math.max(arg.offset - 1, 0));
    } else {
			arg.startPage++;
			arg.offset++;
			exports.getData(arg, cbDone);
		}
	});
};
