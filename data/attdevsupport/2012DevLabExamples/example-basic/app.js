// !USAGE: node app.js --key=<clientId> --secret=<clientSecret> --port=<examplePort>

// !SETUP: Dependencies
/*
 * Express: 	Minimal web application framework
 * FS:			Node.js File System module
 * Optimist: 	Lightweight option parsing
 * HBS: 		Express View Engine wrapper for Handlebars
 * Watson.js:	Simple API Wrapper for the AT&T Speech API
 */
var express = require('express')
  , argv = require("optimist").argv
  , fs = require("fs")
  , hbs = require("hbs")
  , WatsonClient = require("watson-js");

// !SETUP: Process argv and set Defaults as needed
var clientId 		= argv.key || '5b1cb9a9c097e1100eeeebaf66117265'
  , clientSecret 	= argv.secret || '01b8417ac6872450'
  , appPort 		= argv.port || '3000';

// !SETUP: File Copying Convenience Function
function cp(source, destination, callback) {

	// Read a buffer from `source`
	fs.readFile(source, function(err, buf) {
		if (err) { return callback(err); }
		
		// Write that buffer to the new file `destination`
		fs.writeFile(destination, buf, callback);
	})
}

// !AT&T API: Instantiate an instance of the Watson Node.js API Wrapper
var Watson = new WatsonClient.Watson({ client_id: clientId, client_secret: clientSecret });

// !EXPRESS: Create the Express app server
var app = express();

// !EXPRESS: Configure the Express app server
app.configure(function() {
	
	// Set the location of views and type of view engine
	app.set('views', __dirname + '/app/views');
	app.set('view engine', 'html');
	app.engine('html', require('hbs').__express);
	
	// Set up a standard Express configuration
	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({
		secret: "This is an example."
	}));
	app.use(app.router);
	
	// Set the location of static assets
	app.use(express.static(__dirname + '/public'));
});

// !GET '/': Render the start template
app.get('/', function(req, res) {
	res.render('layout');
});

// !POST '/upload': Endpoint for saving the audio file to disk
app.post('/upload', function(req, res) {

	// Copy the temp file to the placeholder destination
	cp(req.files.upload_file.filename.path, __dirname + req.files.upload_file.filename.name, function() {
	
		// Send a message to the front-end to acknowledge the save action
		res.send({ saved: 'saved' });
	});
});

// !POST '/speechToText': Endpoint for sending the SpeechToText API Call
app.post('/speechToText', function(req, res) {

	// Traditionally, you would store this access token somewhere safe like a database. For the purposes of this example, we're going to generate a new one on the first request and store it in the session so we don't have to deal with a database or tracking expiry and refreshing access tokens.
	if(!req.session.accessToken) {

		// !AT&T API: Get Access Token
		Watson.getAccessToken(function(err, accessToken) {
			if(err) {
				// Handle an error getting an access token
				res.send(err);
				return;
			} else {
				// AT&T API: Save the Access Token to the Session
				req.session.accessToken = accessToken;
				
				// !AT&T API: Speech to Text, after getting an access token.
				Watson.speechToText(__dirname + '/public/audio/audio.wav', req.session.accessToken, function(err, reply) {
					if(err) {
						// Handle errors from the Speech to Text API
						res.send(err);
						return;
					}
					// Return the AT&T Speech API's reply to the $.ajax request
					res.send(reply);
					return;
				});
			}
		});
	} else {
		// !AT&T API: Speech to Text, with a previously established access token.
		Watson.speechToText(__dirname + '/public/audio/audio.wav', req.session.accessToken, function(err, reply) {
			if(err) {
				// Handle errors from the Speech to Text API
				res.send(err);
				return;
			}
			// !AT&T API: This is where you would 
			// Return the AT&T Speech API's reply to the $.ajax request
			res.send(reply);
			return;
		});
	}
});

// !EXPRESS: Start the app listening on the requested port
app.listen(appPort);
console.log('AT&T Speech API Basic Walkthrough App started on Port ' + appPort + '.');
