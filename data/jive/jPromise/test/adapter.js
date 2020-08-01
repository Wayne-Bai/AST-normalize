var p = require('../jpromise.min.js');

module.exports = function () {

	return {
		resolved: function(value) {
			var dfd = new p();
			dfd.resolve(value);
			return dfd.promise();
		},
		rejected: function(reason) {
			var dfd = new p();
			dfd.reject(reason);
			return dfd.promise();
		},
		deferred: function() {
			var dfd = new p();
			var ret = {
				promise: dfd.promise(),
				resolve: dfd.resolve.bind(dfd),
				reject: dfd.reject.bind(dfd)
			}
			return ret;
		}
	}

}();
