var lib = require('./lib.js');


exports.sync = function(pi, cb) {
	var since = pi.config.backgroundSince || '0000-00-00';
	lib.getData({query: "backgroundActivities",type:"BackgroundActivityFeed", since:since, token:pi.auth.token.access_token}, function(err, backgroundActs) {
		var data = {};
		data['activity:' + pi.auth.pid+'/background_activities'] = backgroundActs;
		pi.config.backgroundSince = (new Date()).toISOString().substr(0,10);
		cb(err, {data:data, config:pi.config});
	});
};
