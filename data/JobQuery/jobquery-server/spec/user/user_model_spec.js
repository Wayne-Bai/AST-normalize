var mongoose = require('mongoose');
var conn = mongoose.connection;

conn.on('error', function (err) {
  console.log('connection error:', err);
});

var User = require('../../server/user/user_model.js');
var Tag = require('../../server/tag/tag_model.js');
var userMockData = require('./user_model_MockData.js');
var tagMockData = require('../tag/tag_model_MockData.js');

var removeCollections = function (done) {
  var numCollections = Object.keys(conn.collections).length;
  var collectionsRemoved = 0;
  for (var i in conn.collections) {
    (function (i) {
      conn.collections[i].remove(function (err, results){
        collectionsRemoved += 1;
        if (numCollections === collectionsRemoved) {
          done();
        }
      });
    })(i);
  }
};

var reconnect = function (done) {
  mongoose.connect('mongodb://localhost/myApp', function (err) {
    if (err) {
      console.log('reconnect error');
      throw err;
    }
    return removeCollections(done);
  });
};

var checkState = function (done) {
  switch (conn.readyState) {
  case 0:
    reconnect(done);
    break;
  case 1:
    removeCollections(done);
    break;
  default:
    setTimeout(checkState.bind(this, done), 100);
  }
};

describe('User Model', function () {

  beforeEach(function (done) {
    checkState(done);
  });

  it('should be able to create new document', function (done) {
    User.create(userMockData.valid, function (err, newUser) {
      expect(err).toBeNull();
      expect(newUser).toBeDefined();
      expect(newUser.email).toEqual(userMockData.valid.email);
      expect(newUser.password).toEqual(userMockData.valid.password);
      expect(newUser.name).toEqual(userMockData.valid.name);
      expect(newUser.github).toEqual(userMockData.valid.github);
      expect(newUser.linkedin).toEqual(userMockData.valid.linkedin);
      expect(newUser.isAdmin).toEqual(userMockData.valid.isAdmin);
      expect(newUser.isRegistered).toEqual(userMockData.valid.isRegistered);
      expect(newUser.searchStage).toEqual(userMockData.valid.searchStage);
      expect(newUser.city).toEqual(userMockData.valid.city);
      expect(newUser.state).toEqual(userMockData.valid.state);
      expect(newUser.country).toEqual(userMockData.valid.country);
      done();
    });
  });

  it('should be able to create with minimum fields and use defaults', function (done) {
    User.create(userMockData.minimum, function (err, newUser) {
      expect(err).toBeNull();
      expect(newUser).toBeDefined();
      expect(newUser.searchStage).toEqual('Early');
      done();
    });
  });

  it('should fail to create when name is not unique', function (done) {
    User.create(userMockData.valid, function (err, firstUser) {
      User.create(userMockData.valid, function (err, newUser) {
        expect(err).toBeDefined();
        expect(err.code).toEqual(11000); // duplicate key error code is 11000
        expect(newUser).toBeUndefined();
        done();
      });
    });
  });

  it('should fail to create when missing email', function (done) {
    User.create(userMockData.missing.email, function (err, newUser) {
      expect(err).toBeDefined();
      expect(err.errors.email.type).toEqual('required');
      expect(newUser).toBeUndefined();
      done();
    });
  });

  it('should fail to create when missing password', function (done) {
    User.create(userMockData.missing.password, function (err, newUser) {
      expect(err).toBeDefined();
      expect(err.errors.password.type).toEqual('required');
      expect(newUser).toBeUndefined();
      done();
    });
  });

  it('should fail to create when missing isAdmin', function (done) {
    User.create(userMockData.missing.isAdmin, function (err, newUser) {
      expect(err).toBeDefined();
      expect(err.errors.isAdmin.type).toEqual('required');
      expect(newUser).toBeUndefined();
      done();
    });
  });

  it('should fail to create if searchStage is not in enumerated list', function (done) {
    User.create(userMockData.invalid.searchStage, function (err, newUser) {
      expect(err).toBeDefined();
      expect(err.errors.searchStage.type).toEqual('enum');
      expect(newUser).toBeUndefined();
      done();
    });
  });

  it('should be able to create user with a single tag', function (done) {
    Tag.create(tagMockData.valid, function (err, newTag) {
      var withTag = userMockData.minimum;
      withTag.tags = [{tag: newTag._id, score: 1}]; // in an array!
      User.create(userMockData.minimum, function (err, newUser) {
        expect(err).toBeNull();
        expect(newUser).toBeDefined();
        expect(newUser.tags.length).toEqual(1);
        delete userMockData.minimum.tags;
        done();
      });
    });
  });

  it('should be able to create user with multiple tags', function (done) {
    Tag.create([
      tagMockData.valid,
      tagMockData.valid2,
      tagMockData.valid3,
    ], function (err) {
      expect(err).toBeNull();
      expect(arguments).toBeDefined();
      var tags = Array.prototype.slice.call(arguments, 1);
      userMockData.minimum.tags = [];
      for (var i = 0; i < tags.length; i += 1) {
        userMockData.minimum.tags.push({
          tag: tags[i]._id,
          score: 3
        });
      }
      User.create(userMockData.minimum, function (err, newUser) {
        expect(err).toBeNull();
        expect(newUser).toBeDefined();
        expect(newUser.tags.length).toEqual(3);
        delete userMockData.minimum.tags;
        done();
      });
    });
  });

  it('should add be able to insert a tag after creation', function (done) {
    User.create(userMockData.minimum, function (err, newUser) {
      expect(err).toBeNull();
      expect(newUser).toBeDefined();
      expect(newUser.tags.length).toEqual(0);

      Tag.create([
        tagMockData.valid,
        tagMockData.valid2,
        tagMockData.valid3,
      ], function (err) {
        expect(err).toBeNull();
        expect(arguments).toBeDefined();
        expect(arguments.length).toEqual(4);

        var tags = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < tags.length; i += 1) {
          newUser.tags.push({
            tag: tags[i]._id,
            score: 2
          });
        }

        newUser.save(function (err, savedUser) {
          expect(err).toBeNull();
          expect(newUser).toBeDefined();
          expect(newUser.tags.length).toEqual(3);
          delete userMockData.minimum.tags;
          done();
        });
      });
    });
  });

  it('should fail when tag is not valid tag reference', function (done) {
    Tag.create(tagMockData.valid, function (err, newTag) {
      userMockData.minimum.tags = [{tag: mongoose.Schema.Types.ObjectId(123), score: 1}];
      User.create(userMockData.minimum, function (err, newUser) {
        expect(err).toBeDefined();
        expect(err.name).toEqual('ValidationError');
        expect(newUser).toBeUndefined();
        delete userMockData.minimum.tags;
        done();
      });
    });
  });

  it('should have new updatedAt property on update', function (done) {
    User.create(userMockData.valid, function (err, newUser) {
      expect(err).toBeNull();
      expect(newUser).toBeDefined();
      newUser.name = 'someName';
      var originalTime = newUser.updatedAt;
      newUser.save(function (err, savedUser) {
        expect(err).toBeNull();
        expect(savedUser).toBeDefined();
        expect(savedUser.name).toEqual('someName');
        expect(savedUser.updatedAt.getTime()).toBeGreaterThan(originalTime);
        done();
      });
    });
  });

});

