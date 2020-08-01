// Local
exports.init = function (req, res) {

	var User = req.app.db.models.User,
		passport = req._passport.instance;

	var username = req.body.username,
		password = req.body.password,
		name = req.body.name;

	var validate = function() {
		if (!username) return res.send(400, 'Username required');
		if (!password) return res.send(400, 'Password required');

		if (!/^[a-zA-Z0-9\-\_]+$/.test(username)) {
			return res.send(400, 'Username only use letters, numbers, \'-\', \'_\'');
		}

		duplicateUserCheck();
	};
	
	var duplicateUserCheck = function() {
		User.findOne({ username: username }, function (err, doc) {
			if (err) return res.send(500, err);
			if (doc) return res.send(400, 'Username already taken.');

			createUser();
		});
	};
	
	var createUser = function() {
		User.create({
			username: username,
			password: User.encryptPassword(password),
			name: name,
		}, function(err, doc) {
			if (err) return res.send(500, err);
			
			signIn();
		});
	};
	
	var signIn = function() {
		passport.authenticate('local', function(err, user, info) {
			if (err) return res.send(500, err);
			if (!user) return res.send(500, 'Sign in failed. That\'s strange.');

			req.login(user, function(err) {
				if (err) return res.send(500, err);
			
				user.password = undefined;
				res.send(200, { user: user });
			});
		})(req, res);
	};
	
	validate();
};

// Social
var signUpSocial = function (req, res, username, profile) {

	var User = req.app.db.models.User,
		passport = req._passport.instance;

	var validate = function() {
		if (!username) return res.send(400, 'Username required');
		
		if (!/^[a-zA-Z0-9\-\_]+$/.test(username)) {
			return res.send(400, 'Username only use letters, numbers, \'-\', \'_\'');
		}

		duplicateUserCheck();
	};
	
	var duplicateUserCheck = function() {
		User.findOne({ username: username }, function (err, doc) {
			if (err) return res.send(500, err);
			if (doc) return res.send(400, 'Username already taken.');

			createUser();
		});
	};
	
	var createUser = function() {
		User.create({
			username: username,
			profile: profile,
		}, function(err, doc) {
			if (err) return res.send(500, err);
			
			signIn(doc);
		});
	};
	
	var signIn = function(user) {
		req.login(user, function(err) {
			if (err) return res.send(500, err);

			res.send(200, { user: user });
		});
	};
	
	validate();
};

exports.facebookSignUp = function(req, res, next) {
	var passport = req._passport.instance,
		origin = req.headers.origin,
		clientFacebookSignupPath = req.app.get('client-facebook-signup-path');

	passport.authenticate('facebook', { callbackURL: origin + clientFacebookSignupPath })(req, res, next);
};

exports.facebookSignUpCallback = function(req, res, next) {
	var User = req.app.db.models.User,
		passport = req._passport.instance,
		origin = req.headers.origin,
		clientFacebookSignupPath = req.app.get('client-facebook-signup-path');

	passport.authenticate('facebook', { callbackURL: origin + clientFacebookSignupPath }, function(err, user, info) {
		if (!info || !info.profile) return res.send(400, 'Profile not available.');

		var profile = info.profile;

		User.findOne({ 'profile.id': profile.id }, function(err, user) {
			if (err) return next(err);
			if (user) return res.send(400, 'We found a user linked to your Facebook account. Please try signing in.');

			var username = profile.provider + profile.id;
			signUpSocial(req, res, username, profile);
		});
	})(req, res, next);
};