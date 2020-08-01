var restify = require('restify');
var config = require('../config');
var CalendarController = require('../controllers/calendarController');

var rateLimit = restify.throttle({
	burst: config.limiter.defaultBurstRate,
	rate: config.limiter.defaultRatePerSec,
	ip: true
});

function CalendarRoutes(api) {
	api.get('/api/calendar/weekday', rateLimit, function(req, res, next) {
		var calCtrl = new CalendarController(req, res, next);

		calCtrl.getCalendarDay();
	});

	api.post('/api/calendar/appointment', rateLimit, function(req, res, next) {
		var calCtrl = new CalendarController(req, res, next);

		calCtrl.postCalendarAppointment();
	});
}

module.exports.routes = CalendarRoutes;