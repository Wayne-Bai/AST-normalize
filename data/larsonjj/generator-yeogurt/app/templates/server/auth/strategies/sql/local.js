'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Sign in using Email and Password.

var strategy = function(User) {
  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, function(username, password, done) {
    User.find({
      where: {
        email: username
      }
    }).success(function(user) {
      if (!user) {
        return done(null, false, {
          message: 'Invalid email or password.'
        });
      }
      user.comparePassword(password, function(err, isMatch) {
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: 'Invalid email or password.'
          });
        }
      });
    }).error(function(err) {
      if (err) {
        return done(err);
      }
    });
  }));
};

module.exports = strategy;
