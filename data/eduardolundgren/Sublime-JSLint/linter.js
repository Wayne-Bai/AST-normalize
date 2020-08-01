var fs = require('fs');
var jslint = require("./lib/jslint");
var prefs = require("./jslint-prefs");
var report = require("./report");

process.argv.forEach(function (file, index) {
	if (index > 2) {
		fs.readFile(file, 'ascii', function (err, source) {
			if (!err) {
				var passed = jslint(source, prefs);
				var resultReport = report(file, jslint.data());

				console.log( JSON.stringify(resultReport) );
			}
			else {
				console.error("%s", err);
			}
		});
	}
});