'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport'),
    Promise = require('bluebird'),
    Player = mongoose.model('Player'),
    jwt = require('jsonwebtoken'),
    Screen = mongoose.model('Screen');

module.exports = {
  /**
   * Create user
   */

  create: function (req, res, next) {
    var newUser = new User(req.body);
    newUser.provider = 'local';
    newUser.save(function(err, user) {
      if (err) {
        console.log('ERROR', err);
        return res.json(400, err);
      }

      /**
       * Create new player with random mapId
       */
      // update player with new mapId
      return Screen.findAsync()
      .then(function(screens) {
        var mapId = screens[0]._id;
        var newPlayer = new Player({
          user: user._id,
          username: req.body.name,
          mapId: mapId
        });

        newPlayer.save(function(err, result) {
          if (err) {
            return res.json(400, err);
          }

          var tokenSecret = process.env.SECRET_JWT || 'secret'
          var token = jwt.sign({ username: req.body.name }, tokenSecret, { expiresInMinutes: 60 * 24 * 365 });
          return res.json(201, {
            token: token,
            name: req.body.name
          });
        });
      });
      
    });
  },

  /**
   *  Get profile of specified user
   */

  show: function(req, res, next) {
    var userId = req.params.id;

    User.findById(userId, function(err, user) {
      if (err) return next(err);
      if (!user) return res.send(404);

      res.send({
        profile: user.profile
      });
    });
  },

  /**
   * Change password
   */

  changePassword: function(req, res, next) {
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);

    User.findById(userId, function (err, user) {
      if(user.authenticate(oldPass)) {
        user.password = newPass;
        user.save(function(err) {
          if (err) return res.send(400);

          res.send(200);
        });
      } else {
        res.send(403);
      }
    });
  },

  /**
   * Get current user
   */

  me: function(req, res, next) {
    res.json(req.param('name') || null);
  }
};
