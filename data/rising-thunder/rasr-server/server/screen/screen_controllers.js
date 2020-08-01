var Promise = require('bluebird');
var sampleScreens = require('../buildWorld/sampleScreens');
var enemyHandler = require('../enemy/enemy_controllers')
var sampleEnemies = require('../buildWorld/sampleEnemies')
var mongoose = require('mongoose');
var Screen = mongoose.model('Screen');
var helpers = require('./screen_helpers');

module.exports = {
  moveScreen: function(req, res) {
    var direction = req.param('direction');
    var currentObjectId = req.param('currentScreenId');
    Screen.findById(currentObjectId).populate(direction+'Screen')
    .exec(function(err, currentScreen) {
      if (err) {
        helpers.handleError(err, res);
      } else {
        var toSend = currentScreen[direction+'Screen'];
        if (toSend) {
          res.send(toSend)
        } else {
          res.send({error: 'no screen in that direction'});
        }
      }
    })
  },

  createPlacedScreen: function(req, res) {
    var direction = req.param('direction');
    var newScreen = sampleScreens.template;
    var currentObjectId = req.param('currentScreenId');
    // create new screen
    Screen.createAsync(newScreen)
    // populate with two enemies
    .then(function(createdScreen) {
      return enemyHandler.populateEnemy(sampleEnemies.enemyOnScreen1, createdScreen._id)
    })
    .then(function(createdScreenId) {
      return helpers.addDirectionReference(direction, currentObjectId, createdScreenId)
    })
    // go around the horn, adding all necessary references
    .then(function(createdScreenId) {
      return helpers.placementHelper(currentObjectId, createdScreenId, direction, helpers.adjacentDirections[direction]);
    })
    // when not creating world
    .then(function() {
      console.log('new world created');
      res.send({success: 'World Created'}, 200);
    })
    .catch(function(err) {
      console.log('world probably existed already');
      helpers.handleError(err, res);
    });
  },

  getScreen: function(req, res) {
    var screenId = req.param('screenId');
    Screen.findByIdAsync(screenId)
    .then(function(foundScreen) {
      res.send(foundScreen);
    })
    .catch(function(err) {
      helpers.handleError(err, res);
    });
  },

  deleteScreen: function(req, res) {
    var screenId = req.param('screenId');

    Screen.findByIdAndRemove(screenId)
    .then(function(deletedScreen) {
      res.send({success: true, deletedScreen: deletedScreen});
    })
    .catch(function(err) {
      helpers.handleError(err, res);
    })
  },

  saveScreen: function(req, res) {
    var map = JSON.parse(req.body.map);
    delete map._id;
    var screenId = req.param('screenId');

    Screen.findByIdAndUpdate(screenId, map, function(err, result) {
      if (err) {
        console.log('Error', err);
        res.send(500);
      } else {
        console.log('Map updated');
        res.send(200);
      }
    });
  },

  saveTileSet: function(req, res) {
    // var data = req.body.data;
    var filePath = path.join(__dirname, 'app/assets/tilemaps/tiles/');
    req.pipe(filePath);

    req.on('end', function() {
      console.log('uploaded?', filePath);
      res.send('uploaded!');
    });
  }
};
