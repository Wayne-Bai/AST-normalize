var p = require("../../jpromise.min.js");
var Q = require("q");
var adapter = require("./qAdapter.js");

module.exports = function () {
	var dummy = {dummy:"dummy"};
	var i = 0;
	var resCounter = 1;
	var rejCounter = 1;
	var deferred = new p();
	var dfd1 = adapter.deferred();
	var dfd2 = adapter.deferred();
	var start, stop;

	var ret = {
		ops: 0,
		resolvedOps: 0,
		rejectedOps: 0
	}

	start = new Date().getTime();
	do {
		var pro = adapter.resolved(dummy).then(function() {
			resCounter++;
			if(resCounter === 10000) {
				stop = new Date().getTime();
				ret.resolvedOps = 10000 / (stop - start) * 1000;
				dfd1.resolve(true);
			}
		}, undefined);
		i++;
	} while ( i < 10000 );

	i = 0;
	start = new Date().getTime();
	do {
		var pro = adapter.rejected(dummy).then(undefined, function() {
			rejCounter++;
			if(rejCounter === 10000) {
				stop = new Date().getTime();
				ret.rejectedOps = 10000 / (stop - start) * 1000;
				dfd2.resolve(true);
			}
		});
		i++;
	} while ( i < 10000 );

	Q.all(dfd1.promise, dfd2.promise).then(function() {
		ret.ops = (ret.resolvedOps + ret.rejectedOps) / 2;
		deferred.resolve(ret);
	});
	
	return deferred.promise(); 
};
