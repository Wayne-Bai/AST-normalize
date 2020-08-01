
var Passport 		= require( "passport"),
	LocalStrategy   = require( 'passport-local' ).Strategy,
	App 			= Core.app;

function login( req, res, next ){
	if( req.isAuthenticated() ){
//		User.update( { _id: req.user._id }, { $set: { lastVisited: new Date() }  }, function( err ){
//			if( err )
//				res.json( Utils.createResult( false, err, "dbError" ) );
//
//			else
//				res.json( { result: true, user: req.user } );
//		});
		res.json( res.success( "logedin" ) );
	}
}

function loadLoginRoutes(){
	var passportRoute = {
		successRedirect	: '/',
		failureRedirect	: '/'
	};

	App.post( Core.config.globals.loginPath, Passport.authenticate( 'local', passportRoute ), login );

	if( Core.config.globals.viewRoot )
		App.get( '/',  function( req, res, next ){
			if( req.isAuthenticated() )
				res.render( 'home/home', { title : "Test" } );
			else
				res.render( 'home/login', { title : "Test" } );
		});
}

module.exports.load = function(){
	loadLoginRoutes();

	Passport.serializeUser( function( user, done ) {
		done( null, user.id );
	});

	Passport.deserializeUser( function( id, done ) {
		done( null, { name : "Guy Klainer", id : 1, password : "123", role : 0 } );

//		User.findById( _id, function( err, user ) {
//			done( err, user );
//		});
	});
//
	Passport.use( new LocalStrategy(

		function( username, password, done ){

			if( password != "123" )
				return done( null, false, { message: 'Incorrect password.' } );

			return done( null, { name : "Guy Klainer", id : 1, password : "123", role : 0 } );
		}
//		function( username, password, done ){
//			User.findOne({ username: username }, function ( err, user ) {
//
//				if( err ) {
//					return done( err );
//				}
//				if( !user ) {
//					return done( null, false, { message: 'Incorrect username.' } );
//				}
//				if( !user.authenticate( password ) ) {
//					return done( null, false, { message: 'Incorrect password.' } );
//				}
//				return done( null, user );
//			});
//		}
	));
};

module.exports.ensureAuthenticated = function( req, privileges ){
	return true;
	var allow = req.isAuthenticated();

	// In View Router, so params received are ( req, res, next )
	if( arguments.length == 3 ){

		var res 	= arguments[1],
			next 	= arguments[2];

		if( allow )
			next();
		else
			res.send( "401", "Unauthorized" );

	} else {

		if( !isNaN( privileges ) && allow ){
			var userRole = req.user.role || 0;

			allow = !isNaN( userRole ) && userRole >= privileges;

		}

		return allow;
	}
};