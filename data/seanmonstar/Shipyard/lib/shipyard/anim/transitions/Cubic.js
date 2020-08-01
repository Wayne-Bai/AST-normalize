var Transition = require('./Transition');

module.exports = new Transition(function(p) {
	return Math.pow(p, 3);
});
