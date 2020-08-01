'use strict';

var mockery = require('mockery');
var chai = require('chai');
var expect = chai.expect;
var ObjectId = require('bson').ObjectId;

describe('The conference module', function() {

  it('create should send back error when user is not set', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);
    var conference = this.helpers.requireBackend('core/conference/index');
    conference.create(null, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('create should create the conference when user is id', function(done) {
    var mongoose = {
      model: function() {
        return function() {
          return {
            save: function(callback) {
              return callback(null, {});
            }
          };
        };
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);
    var conference = this.helpers.requireBackend('core/conference/index');
    var id = 123;
    conference.create(id, function(err, saved) {
      expect(err).to.not.exist;
      expect(saved).to.exist;
      done();
    });
  });

  it('create should create the conference when user is object', function(done) {
    var mongoose = {
      model: function() {
        return function() {
          return {
            save: function(callback) {
              return callback(null, {});
            }
          };
        };
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);
    var conference = this.helpers.requireBackend('core/conference/index');
    var id = 123;
    conference.create({_id: id}, function(err, saved) {
      expect(err).to.not.exist;
      expect(saved).to.exist;
      done();
    });
  });

  it('invite should send back error when conference is not set', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);
    var conference = this.helpers.requireBackend('core/conference/index');
    conference.invite(null, {}, function(err, saved) {
      expect(err).to.exist;
      done();
    });
  });

  it('invite should send back error when attendees is not set', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);
    var conference = this.helpers.requireBackend('core/conference/index');
    conference.invite({}, null, function(err, saved) {
      expect(err).to.exist;
      done();
    });
  });

  it('invite should send back error when conference and attendees are not set', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);
    var conference = this.helpers.requireBackend('core/conference/index');
    conference.invite(null, null, function(err, saved) {
      expect(err).to.exist;
      done();
    });
  });

  it('invite should send back error when conference.save send back error', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var attendees = {
      _id: 123
    };

    var conf = {
      save: function(callback) {
        return callback(new Error());
      },
      attendees: []
    };

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.invite(conf, attendees, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('invite should send back updated conference when attendees is object', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var attendees = {
      _id: 123
    };

    var conf = {
      attendees: [],
      save: function(callback) {
        var self = this;
        return callback(null, {attendees: self.attendees});
      }
    };

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.invite(conf, attendees, function(err, updated) {
      expect(err).to.not.exist;
      expect(updated).to.exist;
      expect(updated.attendees).to.exist;
      expect(updated.attendees.length).to.equal(1);
      done();
    });
  });

  it('invite should send back updated conference when attendees is array', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var attendees = [
      {
        _id: 123
      },
      {
        _id: 456
      }
    ];

    var conf = {
      attendees: [],
      save: function(callback) {
        var self = this;
        return callback(null, {attendees: self.attendees});
      }
    };

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.invite(conf, attendees, function(err, updated) {
      expect(err).to.not.exist;
      expect(updated).to.exist;
      expect(updated.attendees).to.exist;
      expect(updated.attendees.length).to.equal(2);
      done();
    });
  });

  it('userCanJoinConference should send back error when user is not set', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userCanJoinConference({}, null, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('userCanJoinConference should send back error when conference is not set', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userCanJoinConference(null, {}, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('userCanJoinConference should send true when user is conference creator', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var user_id = new ObjectId();
    var conf = {
      creator: user_id,
      attendees: []
    };

    var user = {
      _id: user_id
    };

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userCanJoinConference(conf, user, function(err, status) {
      expect(err).to.not.exist;
      expect(status).to.be.true;
      done();
    });
  });

  it('userCanJoinConference should send true when user is attendee', function(done) {

    var user = {
      _id: new ObjectId()
    };

    var conf = {
      creator: new ObjectId(),
      attendees: [
        {user: user._id},
        {user: new ObjectId()}
      ]
    };

    var mongoose = {
      model: function() {
        return {
          findOne: function() {
            return {
              exec: function(callback) {
                return callback(null, conf);
              }
            };
          }
        };
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userCanJoinConference(conf, user, function(err, status) {
      expect(err).to.not.exist;
      expect(status).to.be.true;
      done();
    });
  });

  it('userIsConferenceAttendee should send back error when user is not set', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userIsConferenceAttendee({}, null, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('userIsConferenceAttendee should send back error when conference is not set', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userIsConferenceAttendee(null, {}, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('userIsConferenceAttendee should send true when user is in attendee list', function(done) {
    var user = {
      _id: new ObjectId()
    };

    var conf = {
      creator: 123,
      attendees: [
        {user: user._id},
        {user: 111}
      ]
    };

    var mongoose = {
      model: function() {
        return {
          findOne: function() {
            return {
              exec: function(callback) {
                return callback(null, conf);
              }
            };
          }
        };
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userIsConferenceAttendee(conf, user, function(err, status) {
      expect(err).to.not.exist;
      expect(status).to.be.true;
      done();
    });
  });

  it('userIsConferenceAttendee should send false when user is not in attendees list', function(done) {
    var user = {
      _id: new ObjectId()
    };

    var conf = {
      creator: 123,
      attendees: [
      ]
    };

    var mongoose = {
      model: function() {
        return {
          findOne: function() {
            return {
              exec: function(callback) {
                return callback(null, conf);
              }
            };
          }
        };
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userIsConferenceAttendee(conf, user, function(err, status) {
      expect(err).to.not.exist;
      expect(status).to.be.false;
      done();
    });
  });

  it('userIsConferenceCreator should send back error when user is not set', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userIsConferenceCreator({}, null, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('userIsConferenceCreator should send back error when conference is not set', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userIsConferenceCreator(null, {}, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('userIsConferenceCreator should send true when user is conference creator', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conf = {
      creator: new ObjectId()
    };

    var user = {
      _id: conf.creator
    };

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userIsConferenceCreator(conf, user, function(err, status) {
      expect(err).to.not.exist;
      expect(status).to.be.true;
      done();
    });
  });

  it('userIsConferenceCreator should send false when user is not conference creator', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conf = {
      creator: new ObjectId()
    };

    var user = {
      _id: new ObjectId()
    };

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userIsConferenceCreator(conf, user, function(err, status) {
      expect(err).to.not.exist;
      expect(status).to.be.false;
      done();
    });
  });

  it('userCanJoinConference should send true when user is in attendees list', function(done) {
    var user = {
      _id: new ObjectId()
    };

    var conf = {
      creator: new ObjectId(),
      attendees: [
        {user: user._id}
      ]
    };

    var mongoose = {
      model: function() {
        return {
          findOne: function() {
            return {
              exec: function(callback) {
                return callback(null, conf);
              }
            };
          }
        };
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userCanJoinConference(conf, user, function(err, status) {
      expect(err).to.not.exist;
      expect(status).to.be.true;
      done();
    });
  });

  it('userCanJoinConference should send false when user is not in attendees list', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conf = {
      creator: new ObjectId(),
      attendees: [
        {user: new ObjectId()}
      ]
    };

    var user = {
      _id: new ObjectId()
    };

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.userIsConferenceCreator(conf, user, function(err, status) {
      expect(err).to.not.exist;
      expect(status).to.be.false;
      done();
    });
  });

  it('join should send back error when conference is null', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.join(null, {}, function(err, status) {
      expect(err).to.exist;
      done();
    });
  });

  it('join should send back error when user is null', function(done) {
    var mongoose = {
      model: function() {
        return {};
      }
    };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.join({}, null, function(err, status) {
      expect(err).to.exist;
      done();
    });
  });

  it('join should load the conference and update the attendees', function(done) {

    var user = {
      _id: 123
    };

    var conf = {
      creator: 333,
      attendees: [],
      history: [],
      save: function(callback) {
        var self = this;
        expect(self.attendees.length === 1);
        return callback(null, {attendees: self.attendees});
      }
    };

    var mongoose = {
      model: function() {
        return {
          findById: function(id, callback) {
            return callback(null, conf);
          }
        };
      }
    };
    mongoose.Types = { ObjectId: function() {} };
    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var conference = this.helpers.requireBackend('core/conference/index');
    conference.join(conf, user, function(err, updated) {
      expect(err).to.not.exist;
      done();
    });
  });

  it('addHistory should send back error when user is undefined', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {};
      }
    });
    var conference = this.helpers.requireBackend('core/conference/index');
    conference.addHistory({}, null, 'hey', function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('addHistory should send back error when conference is undefined', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {};
      }
    });
    var conference = this.helpers.requireBackend('core/conference/index');
    conference.addHistory(null, {}, 'hey', function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('addHistory should send back error when status is undefined', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {};
      }
    });
    var conference = this.helpers.requireBackend('core/conference/index');
    conference.addHistory({}, {}, null, function(err) {
      expect(err).to.exist;
      done();
    });
  });

  it('addHistory should call Conference.update', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {
          update: function(query, options, upsert, callback) {
            return callback();
          }
        };
      }
    });
    var conference = this.helpers.requireBackend('core/conference/index');

    var conf = {
      attendees: [],
      history: []
    };

    conference.addHistory(conf, {user: 123}, 'hey', function(err) {
      done();
    });
  });

  it('invite should forward invitation into conference:invite', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {};
      }
    });

    var localstub = {}, globalstub = {};
    this.helpers.mock.pubsub('../pubsub', localstub, globalstub);

    var conference = this.helpers.requireBackend('core/conference/index');

    var conf = {
      attendees: [],
      history: [],
      save: function(callback) {
        callback(null, { _id: 12345, creator: 123456 });
      }
    };

    conference.invite(conf, { _id: 123 }, function() {
      expect(localstub.topics['conference:invite'].data[0]).to.deep.equal({
        conference_id: 12345,
        user_id: 123,
        creator_id: 123456
      });
      expect(globalstub.topics['conference:invite'].data[0]).to.deep.equal({
        conference_id: 12345,
        user_id: 123,
        creator_id: 123456
      });
      done();
    });
  });

  it('join should forward invitation into conference:join', function(done) {
    var mongoose = {
      model: function() {
        return {
          update: function(a, b, c, callback) {
            return callback();
          },
          findById: function(id, callback) {
            return callback(null, {
              _id: 12345,
              attendees: [],
              save: function(callback) {
                return callback(null, this);
              }
            });
          }
        };
      }
    };
    mongoose.Types = { ObjectId: function() {} };

    this.mongoose = mockery.registerMock('mongoose', mongoose);

    var localstub = {}, globalstub = {};
    this.helpers.mock.pubsub('../pubsub', localstub, globalstub);

    var conference = this.helpers.requireBackend('core/conference/index');

    var conf = {
      _id: 12345,
      attendees: [],
      history: [],
      save: function(callback) {
        callback(null, { _id: 12345 });
      }
    };

    conference.join(conf, { _id: 123 }, function() {
      expect(localstub.topics['conference:join'].data[0]).to.deep.equal({
        conference_id: 12345,
        user_id: 123
      });
      expect(globalstub.topics['conference:join'].data[0]).to.deep.equal({
        conference_id: 12345,
        user_id: 123
      });
      done();
    });
  });

  it('leave should forward invitation into conference:leave', function(done) {
    this.mongoose = mockery.registerMock('mongoose', {
      model: function() {
        return {
          update: function(value, options, upsert, callback) {
            return callback(null, { _id: 12345 });
          }
        };
      }
    });

    var localstub = {}, globalstub = {};
    this.helpers.mock.pubsub('../pubsub', localstub, globalstub);

    var conference = this.helpers.requireBackend('core/conference/index');

    var conf = {
      _id: 12345,
      attendees: [],
      history: [],
      save: function(callback) {
        callback(null, { _id: 12345 });
      }
    };

    conference.leave(conf, { _id: 123 }, function() {
      expect(localstub.topics['conference:leave'].data[0]).to.deep.equal({
        conference_id: 12345,
        user_id: 123
      });
      expect(globalstub.topics['conference:leave'].data[0]).to.deep.equal({
        conference_id: 12345,
        user_id: 123
      });
      done();
    });
  });
});
