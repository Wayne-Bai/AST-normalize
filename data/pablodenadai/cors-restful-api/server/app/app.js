// External includes
var express = require('express'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	mongoStore = require('connect-mongo')(express),
	http = require('http'),
	path = require('path');

// Instantiate app
var app = express();

// General app config stuff	
app.configure(function () {
	app.disable('x-powered-by');
  	
  	// TODO: Env variables?
	// app.set('client-url', 'http://corsnection-client.herokuapp.com');
	app.set('client-url', 'http://localhost:9000');
	app.set('client-facebook-signup-path', '/facebook?action=signup');
	app.set('client-facebook-signin-path', '/facebook?action=signin');

	// Password encryption
	app.set('crypto-key', 'k3yb0ardc4t');

	// Facebook settings
	app.set('facebook-oauth-key', '');
	app.set('facebook-oauth-secret', '');

	// Setup mongoose
	app.set('mongodb_uri', process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/corsnection');
	app.db = mongoose.connect(app.get('mongodb_uri'));

	app.set('port', process.env.PORT || 3000);

	// Middlewares
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: 'c0r$n3ct1on!',
		store: new mongoStore({ url: app.get('mongodb_uri') })

	}));
	app.use(passport.initialize());
	app.use(passport.session());
	
	// Development only
	if ('development' == app.get('env')) {
		app.use(express.errorHandler());
	}
});

// Internal includes
var schemas = require('./schema/index')(app, mongoose),
	middlewares = require('./middleware/index')(app),
	
	views = require('./view/index')(app),
	strategies = require('./passport/index')(app, passport);

// Start it all up
var server = http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
});