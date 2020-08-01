var lib = require('./lib.js');



exports.sync = function(pi, cb) {
	var arg = {};
	arg.access_token = pi.auth.access_token;
	arg.path = '/2/checkins';
	arg.offset = 0;
	arg.results = [];
	arg.since = pi.config.checkinsSince || 0;
	arg.sinceName = 'time';
	arg.params = {order:'time', member_id:'self'};
	lib.getData(arg,function(err, checkins){
		if (err) return cb(err);
		var data = {};
		data['checkin:'+pi.auth.pid+'/checkins'] = checkins;
		if (checkins && checkins.length > 0) pi.config.checkinsSince = checkins[0].time;
		cb(err, {data:data, config:pi.config});
	});
};
