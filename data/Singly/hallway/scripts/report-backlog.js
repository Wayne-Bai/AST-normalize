var instruments = require('instruments');
var taskman = require('taskman-ng');

var INTERVAL = 60000;

function printBacklog() {
	taskman.backlog(function(err, counts) {
		var stats = {};
		Object.keys(counts).forEach(function(name) {
			stats['backlog.' + name] = counts[name];
		});
		instruments.gauge(stats).send();
		console.log(new Date(), counts.total);
	});
}

printBacklog();
setInterval(printBacklog, INTERVAL);
