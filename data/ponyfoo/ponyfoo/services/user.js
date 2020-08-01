'use strict';

var User = require('../models/User');

function getModel (email, password, bypass) {
  return {
    email: email,
    password: password,
    bypassEncryption: bypass,
    displayName: email.split('@')[0]
  };
}

function create (bypass) {
  return function creation (email, password, done) {
    var model = getModel(email, password, bypass);
    var user = new User(model);

    user.save(function saved (err) {
      done(err, user);
    });
  };
}

module.exports = {
  findById: function (id, done) {
    User.findOne({ _id: id }, done);
  },
  findOne: function (query, done) {
    User.findOne(query, done);
  },
  create: create(false),
  createUsingEncryptedPassword: create(true),
  setPassword: function (userId, password, done) {
    User.findOne({ _id: userId }, function found (err, user) {
      if(err || !user){
        return done(err, false);
      }

      user.password = password;
      user.save(done);
    });
  }
};
