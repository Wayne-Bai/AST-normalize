var Promise  = require('bluebird'),
    mongoose = require('mongoose'),
    Screen   = mongoose.model('Screen');

var helpers = {

  oppositeDirections: {
    left: 'right',
    right: 'left',
    up: 'down',
    down: 'up'
  },

  adjacentDirections: {
    'up': 'right',
    'right': 'down',
    'down': 'left',
    'left': 'up'
  },

  placementHelper: function(fromScreenId, toScreenId, doneDir, toGoDir) {
    // will have to circle two ways around toScreenId
    var toGoOppositeDirection = helpers.oppositeDirections[toGoDir];
    // boolean to decrease number of calls to database
    var backsideConnection = false

    return helpers.peripheralRefs(fromScreenId, toScreenId, doneDir, toGoDir) // should return (connectionScreenId, toScreenId)
    .then(function(peripheralScreenId) {
      return helpers.peripheralRefs(peripheralScreenId, toScreenId, toGoOppositeDirection, doneDir) // should return (endPeriph, toScreenId)
    })
    .catch(function() {
      // if first loop around failed, catch failure and continue it along then chain
      return new Promise(function(onResolved, onRejected) {
        onResolved(null); // make it clear that no endPeriph found on first go around
      })
    })
    .then(function(endPeripheralScreenId) {
      // if peripheralScreenId and backsideConnection already made,
    // no need to check all the way around when circling opposite way around.
      if (endPeripheralScreenId) {
        backsideConnection = true;
      }
      return helpers.peripheralRefs(fromScreenId, toScreenId, doneDir, toGoOppositeDirection);
    })
    .then(function(peripheralScreenId) {
      // no need to check backsideConnection if that has already been hooked up
      if (!backsideConnection) {
        return helpers.peripheralRefs(peripheralScreenId, fromScreenId, toGoDir, doneDir);
      } else {
        return new Promise(function(onResolved, onRejected) {
          onResolved(toScreenId);
        })
      }
    })
    // catch onRejected's from above, and return our toScreenId back to where we started.
    .catch(function() {
      return new Promise(function(onResolved, onRejected) {
        onResolved(toScreenId);
      })
    });
  },

  peripheralRefs: function(fromScreenId, toScreenId, doneDir, toGoDir) {
    return Screen.findByIdAsync(fromScreenId)
    .then(function(foundScreen) {
      if (foundScreen[toGoDir + 'Screen']) {
        return foundScreen.populateAsync(toGoDir + 'Screen');
      } else {
        return new Promise(function(onResolved, onRejected) {
          onRejected(toScreenId);
        });
      }
    })
    .then(function(foundScreen) {
      var connectionScreenId = foundScreen[toGoDir + 'Screen'][doneDir + 'Screen']
      if (connectionScreenId) {
        return helpers.addDirectionReference(toGoDir, toScreenId, connectionScreenId)
      } else {
        return new Promise(function(onResolved, onRejected) {
          onRejected(toScreenId);
        })
      }
    })
  },

  addDirectionReference: function(direction, fromScreenId, toScreenId) {
    // checkDirection(direction, fromScreenId)
    return Screen.findByIdAsync(fromScreenId)
    .then(function(foundScreen) {
      if (!foundScreen[direction + 'Screen']) {
        var update = {}
        update[direction + 'Screen'] = toScreenId;
        return Screen.findByIdAndUpdateAsync(fromScreenId, update)
      }
    })
    .then(function(screened) {
      direction = helpers.oppositeDirections[direction];
      return Screen.findByIdAsync(toScreenId)
    })
    .then(function(foundScreen) {
      if (!foundScreen[direction + 'Screen']) {
        // add reverse reference as well
        var property = direction + 'Screen';
        var update = {}
        update[direction + 'Screen'] = fromScreenId;
        return Screen.findByIdAndUpdateAsync(toScreenId, update);
      }
    })
    .then(function() {
      return new Promise(function(onResolved, onRejected) {
        onResolved(toScreenId, fromScreenId);
      });
    })
  },

  handleError: function(err, res) {
    console.log(err);
    res.send(500, err);
  }

};

module.exports = helpers;
