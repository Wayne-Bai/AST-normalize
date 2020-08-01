/*Currently syncs only events for which the user has rsvp'ed yes. Easily
 extendable to include other rsvp statuses (including no, maybe, waitlist).
 Can also be extended to take in more specification for time-types (upcoming, past, proposed, suggested)
 In order to track any kind of since, upcoming/past need to be tracked separately from proposed/suggested

*/

var lib = require ('./lib.js');

exports.sync = function(pi, cb) {
	var arg = {};
	arg.access_token = pi.auth.access_token;
	arg.path = '/2/events';
	arg.offset = 0;
	arg.results = [];
	arg.since = pi.config.eventsSince || 0;
	arg.sinceName = 'updated';
	arg.params = {member_id:'self', status:'upcoming,past,proposed,suggested', rsvp:'yes'};
	lib.getData(arg,function(err, events){
		if (err) return cb(err);
		var data = {};
		data['event:'+pi.auth.pid+'/events'] = events;
		cb(err, {data:data, config:pi.config});
	});
};
