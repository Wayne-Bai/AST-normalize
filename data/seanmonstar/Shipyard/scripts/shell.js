var shipyard = require('../'),
	path = require('path'),
	repl = require('repl');

exports.shell = function shell(req) {
	repl.start();
};

if (require.main === module) {
	exports.shell();
}
