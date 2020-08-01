/**
*/
exports.index = function(req, res, ctx){
	if(ctx.config.ccs.enable){
		sh.ccs.add(100, 200, function(err, r){
			console.log("CCS Add Result: " + r);
			res.render("/home", {appName: ctx.app.packageJson.name});
		});
	}else{
		res.render("/home", {appName: ctx.app.packageJson.name});
	}
}

