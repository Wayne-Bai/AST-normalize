
var development	= require("./development"),
	production 	= require("./production");

module.exports.load = function() {

	var env = Core.config.globals.environment;

	switch( env ){
		case "development":
			env = development;
			break;

		case "production":
			env = production;
			break;

		default :
			Core.error( "Missing environment variable", true );
			break;
	}

	env.load( Core.app );

	module.exports.error = env.error;
};