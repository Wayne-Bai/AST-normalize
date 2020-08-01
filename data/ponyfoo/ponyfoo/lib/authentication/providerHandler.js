'use strict';

var contra = require('contra');
var User = require('../../models/User');
var env = require('../env');
var registration = env('REGISTRATION_OPEN');

module.exports = function providerHandler (query, profile, done) {
  var email = profile.emails ? profile.emails[0].value : false;
  if (!email) {
    done(null, false, 'Unable to fetch email address'); return;
  }

  contra.waterfall([
    function findByProvider (next) {
      User.findOne(query, next);
    },
    function findByEmail (user, next) {
      if (user) {
        next(null, user); return;
      }
      User.findOne({ email: email }, next);
    },
    function updateUser (user, next) {
      if (!registration && !user) {
        next(new Error('Registration is closed to the public.')); return;
      }
      var model = attachTo(user);

      model.save(function saved (err, user){
        next(err, user ? user.toObject() : null);
      });
    }
  ], done);

  function attachTo (user) {
    var prop;

    if (!user) { // register user
      query.email = email;
      query.displayName = profile.displayName;
      return new User(query);
    }

    // add provider to user
    for (prop in query) {
      user[prop] = query[prop];
    }

    if (!user.displayName) {
      user.displayName = profile.displayName;
    }
    return user;
  }
};
