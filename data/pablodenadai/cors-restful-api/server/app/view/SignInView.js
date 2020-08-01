// Local
exports.init = function (req, res) {

	var passport = req._passport.instance;

	var username = req.body.username,
		password = req.body.password;

	var validate = function() {
		if (!username) return res.send(400, 'Username required');
		if (!password) return res.send(400, 'Password required');

		attemptLogin();
	};
	
	attemptLogin = function() {
		passport.authenticate('local', function(err, user, info) {
			if (err) return res.send(500, err);
			
			if (!user) {
				return res.send(400, 'Username and password combination not found.');
			} else {
				req.login(user, function(err) {
					if (err) return res.send(500, err);
					
					user.password = undefined;
					res.send(200, { user: user });
				});
			}
		})(req, res);
	};
	
	validate();
};


// Social
exports.facebookSignIn = function(req, res, next){
	var passport = req._passport.instance,
		origin = req.headers.origin,
		clientFacebookSigninPath = req.app.get('client-facebook-signin-path');
	
	passport.authenticate('facebook', { callbackURL: origin + clientFacebookSigninPath })(req, res, next);
};

exports.facebookSignInCallback = function(req, res, next){
	var User = req.app.db.models.User,
		passport = req._passport.instance,
		origin = req.headers.origin,
		clientFacebookSigninPath = req.app.get('client-facebook-signin-path');
	
	passport.authenticate('facebook', { callbackURL: origin + clientFacebookSigninPath }, function(err, user, info) {
		if (!info || !info.profile) return res.send(400, 'Profile not available.');
		
		var profile = info.profile;

		User.findOne({ 'profile.id': profile.id }, function(err, user) {
			if (err) return next(err);
			if (!user) return res.send(400, 'No users found linked to your Facebook account. You may need to create an account first.');

			req.login(user, function(err) {
				if (err) return res.send(500, err);
				
				user.password = undefined;
				res.send(200, { user: user });
			});
		});
	})(req, res, next);
};