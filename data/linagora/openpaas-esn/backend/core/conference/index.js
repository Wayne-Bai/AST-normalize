'use strict';

var mongoose = require('mongoose');
var Conference = mongoose.model('Conference');
var localpubsub = require('../pubsub').local;
var globalpubsub = require('../pubsub').global;
var logger = require('../logger');

module.exports.create = function(user, callback) {
  if (!user) {
    return callback(new Error('Creator can not be null'));
  }

  var user_id = user._id || user;
  var conf = new Conference({creator: user_id, attendees: [{user: user_id, status: 'creator'}], history: [{user: user_id, status: 'creation'}]});
  return conf.save(callback);
};

function addHistory(conference, user, status, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }

  if (!status) {
    return callback(new Error('Undefined status'));
  }

  var id = user._id || user;
  var conference_id = conference._id || conference;

  Conference.update({_id: conference_id}, {$push: {history: {user: id, status: status}}}, {upsert: true}, callback);
}
module.exports.addHistory = addHistory;

module.exports.invite = function(conference, attendees, callback) {
  if (!conference) {
    return callback(new Error('Can not invite to an undefined conference'));
  }

  if (!attendees) {
    return callback(new Error('Can not invite undefined attendees'));
  }

  if (!Array.isArray(attendees)) {
    attendees = [attendees];
  }

  attendees.forEach(function(element) {
    conference.attendees.push({
      user: element._id || element,
      status: 'invited'
    });
  });

  var localtopic = localpubsub.topic('conference:invite');

  conference.save(function(err, updated) {
    if (err) {
      return callback(err);
    }

    attendees.forEach(function(attendee) {
      var invitation = {
        conference_id: updated._id,
        user_id: attendee._id || attendee,
        creator_id: updated.creator
      };
      localtopic.forward(globalpubsub, invitation);
    });
    return callback(null, updated);
  });
};

module.exports.get = function(id, callback) {
  Conference.findById(id).exec(callback);
};

module.exports.loadWithAttendees = function(id, callback) {
  Conference.findById(id).sort('-timestamps.creation').populate('attendees.user', null, 'User').exec(callback);
};

module.exports.list = function(callback) {
  Conference.find().sort('-timestamps.creation').populate('creator', null, 'User').exec(callback);
};

module.exports.userIsConferenceCreator = function(conference, user, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }

  var id = user._id || user;
  return callback(null, conference.creator.equals(id));
};

module.exports.userIsConferenceAttendee = function(conference, user, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }

  var id = user._id || user;
  var conference_id = conference._id || conference;

  Conference.findOne({_id: conference_id}, {attendees: {$elemMatch: {user: id}}}).exec(function(err, conf) {
    if (err) {
      return callback(err);
    }
    return callback(null, (conf.attendees !== null && conf.attendees.length > 0));
  });
};

module.exports.userCanJoinConference = function(conference, user, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }

  var self = this;
  this.userIsConferenceCreator(conference, user, function(err, status) {
    if (err) {
      return callback(err);
    }

    if (status) {
      return callback(null, true);
    }

    return self.userIsConferenceAttendee(conference, user, callback);
  });
};

module.exports.join = function(conference, user, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }

  var conferenceId = conference._id || conference;
  var userId = user._id || user;

  Conference.findById(conferenceId, function(err, conf) {
    if (err) {
      return callback(err);
    }

    if (!conf) {
      return callback(new Error('No such conference'));
    }

    var found = false;
    conf.attendees.forEach(function(attendee) {
      if (attendee.user.toString() === userId + '') {
        found = true;
        attendee.status = 'online';
      }
    });

    if (!found) {
      conf.attendees.push({user: new mongoose.Types.ObjectId(userId + ''), status: 'online'});
    }

    conf.save(function(err, updated) {
      if (err) {
        return callback(err);
      }

      localpubsub.topic('conference:join')
        .forward(globalpubsub, {conference_id: conf._id, user_id: userId});

      addHistory(conf._id, userId, 'join', function(err, history) {
        if (err) {
          logger.warn('Error while pushing new history element ' + err.message);
        }
        return callback(null, conf);
      });
    });
  });
};

module.exports.leave = function(conference, user, callback) {
  if (!user) {
    return callback(new Error('Undefined user'));
  }

  if (!conference) {
    return callback(new Error('Undefined conference'));
  }

  var id = user._id || user;
  var conference_id = conference._id || conference;

  Conference.update({_id: conference_id, attendees: {$elemMatch: {user: id}}}, {$set: {'attendees.$': {user: id, status: 'offline'}}}, {upsert: true}, function(err, updated) {
    if (err) {
      return callback(err);
    }

    localpubsub.topic('conference:leave')
               .forward(globalpubsub, { conference_id: conference_id, user_id: id });

    addHistory(conference_id, id, 'leave', function(err, history) {
      if (err) {
        logger.warn('Error while pushing new history element ' + err.message);
      }
      return callback(null, updated);
    });
  });
};
