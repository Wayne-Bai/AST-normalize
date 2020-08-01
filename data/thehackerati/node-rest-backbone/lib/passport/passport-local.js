/**
 * passport.js
 *
 * Passport setup.
 */

var LocalStrategy = require('passport-local').Strategy;

module.exports = function(config, app, db_conn, passport) {
	var User = db_conn.model('User');

	passport.use(new LocalStrategy({
			usernameField: 'email'
		},
		function(email, password, done) {
			console.log("Passport.authenticate(): email=" + email + " password=" + password);
			User.authenticate(email, password, function(err, user) {
				console.log("User.authenticate() callback: err=" + err + " user.id=" + user.id);
				return done(err, user);
			});
		}
	));

	/**
     * GET signup page.
     */
    app.get('/signup', function (req, res) {
        res.render('signup.ejs', { config: config, user: req.user });
    });

    /**
     * POST signup form.
     */
	app.post('/signup', function (req, res) {
		console.log("Signup:" +
					" email=" + req.param('email', null) +
					" password=" + req.param('password', null) +
					" fname=" + req.param('first', null) +
					" lname=" + req.param('last', null));

		var User = db_conn.model('User');

		// If a user with this email address already exists in the database, update their record. Otherwise create a new one.
		User.findOne({ 'email': req.param('email', null) }, function(err, olduser) {
			if (olduser) {
				console.log("Found existing user");

				// We have an existing user record with the same email address that probably came from an OAUTH provider.
				// Always over-write existing user properties with new user properties from the signup form.
				olduser.password = req.param('password');
				olduser.name.first = req.param('first');
				olduser.name.last = req.param('last');
				olduser.displayName = olduser.name.first + " " + olduser.name.last;
				olduser.save(function(err) {
					if(err) {
						console.log("User.save() error: " + err);
						throw err;
					}

					// Automatically log the user in
					req.logIn(olduser, function(err) {
						if(err) {
							console.log("req.logIn() error: " + err);
							throw err;
						}
						return res.redirect('/app');
					});
				});	
			} else {
				console.log("Creating new user");

				// We need to create a new user record
				var newuser = new User();
				newuser.email = req.param('email');
				newuser.password = req.param('password');
				newuser.name.first = req.param('first');
				newuser.name.last = req.param('last');
				newuser.displayName = newuser.name.first + " " + newuser.name.last;
				newuser.save(function(err) {
					console.log("user.save() callback");

					if(err) {
						console.log("User.save() callback error: " + err);
						throw err;
					}

					console.log("user.save() callback logging in");

					// Automatically log the user in
					req.logIn(newuser, function(err) {
						console.log("req.logIn() callback");
						if(err) {
							console.log("req.logIn() error: " + err);
							throw err;
						}
						console.log("req.logIn() redirecting to app");
						return res.redirect('/app');
					});
				});
			}
		});
	});

	/**
	* GET login page.
	*/
	app.get('/login', function (req, res) {
		console.log("GET /login");
		res.render('login.ejs', { config: config, user: req.user });
	});

	// POST /login
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  If authentication fails, the user will be redirected back to the
	//   login page.  Otherwise, the primary route function function will be called,
	//   which, in this example, will redirect the user to the home page.
	//
	//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
	app.post('/login',
		passport.authenticate('local', { failureRedirect: '/failed', failureFlash: true }),
		function(req, res) {
			console.log("POST /login callback");
			res.redirect('/app');
		});

	return passport;
};