
var Model, jdb, _;

jdb = require('promised-jugglingdb');

_ = require('lodash');

module.exports = {
  'before': function(){
    return TestModule.loadClasses(['Model']).then(function(classes){
      Model = classes.Model;
    });
  },

  'model': {

    'beforeEach': function(done) {

      this.User = Model.factory('memory', 'User', function() {
        return {
          name: String,
          gender: String,
          married: Boolean,
          age: {
            type: Number,
            index: true
          },
          dob: Date,
          extra: this.Schema.Text,
          createdAt: {
            type: Number,
            "default": Date.now
          }
        };
      });

      Model.$.Utils.Promise.all([
        this.User.create({
          name: 'Shaltay',
          gender: 'female',
          married: false,
          age: 21
        }),
        this.User.create({
          name: 'Humpfey',
          gender: 'male',
          married: true,
          age: 25
        })
      ]).done(function(){
        done();
      });
    },

    'afterEach': function() {
      this.User = null;
    },

    'schema': function() {
      expect(jdb.Schema).to.equal(this.User.$.Schema.Schema);
      expect(jdb.Schema).to.equal(this.User.Schema);
    },

    'instance': function(done) {
      expect(this.User).to.be.ok;
      expect(this.User.db).to.be.ok;
      expect(this.User.findOne).to.be.ok;

      this.User.find(1, function(err, user) {
        user.updateAttributes({
          married: true
        }).done(function(){
          done();
        });
      });
    },

    'promises versions are working like the original ones': function(done) {
      var User;
      User = this.User;

      User.findOne({
        id: 1
      }, function(err, data) {
        User.findOne({
          id: 1
        }).then(function(_data) {
          expect(_data).to.eql(data);
          return User.find(1);
        }).then(function(__data) {
          expect(__data).to.eql(data);
          return data;
        }).then(function(found) {
          expect(found.id).to.equal(1);
          return User.create({
            name: 'Testing'
          });
        }).then(function(created) {
          expect(created.name).to.equal('Testing');
          return User.find(2);
        }).then(function(found) {
          expect(found.id).to.equal(2);
          return User.count();
        }).then(function(count) {
          expect(count).to.equal(3);
          return User.destroyAll();
        }).then(function() {
          return User.count();
        }).then(function(count) {
          expect(count).to.equal(0);
        }).done(done);
      });
    },

    'invalid relations raise exception': function() {
      var Test;
      Test = Model.$define('Test', {
        $relations: {
          belongsTo: ['invalid']
        }
      });

      expect(function() {
        new Test();
      }).to.throw();

      Test = Model.$define('Test', {
        $relations: {
          hasMany: ['invalid']
        }
      });

      expect(function() {
        new Test();
      }).to.throw();

      Test = Model.$define('Test', {
        $relations: {
          hasAndBelongsToMany: ['invalid']
        }
      });

      expect(function() {
        new Test();
      }).to.throw();
    },

    'can define the attrs when defined on itself and have promises and getters/setters': function(done) {
      var User;
      User = Model.$define('User', {
        $attrs: function() {
          return {
            name: {
              type: String,
              limit: 10
            },
            gender: String,
            married: Boolean,
            age: {
              type: Number,
              index: true
            },
            dob: Date,
            extra: this.Schema.Text,
            createdAt: {
              type: Number,
              "default": Date.now
            }
          };
        }
      });

      User = new User();

      User.validatesPresenceOf('name');

      User.create({
        name: 'Hello',
        married: true,
        id: 5
      }).done(function(user) {
        user.updateAttributes({
          extra: 'Super text'
        }).then(function() {
          expect(user.extra).to.equal('Super text');
          return user.updateAttribute('age', 41);
        }).then(function() {
          expect(user.age).to.equal(41);
          user.married = false;
          user.dob = Date.now();
        }).then(function() {
          expect(user.married).to.equal(false);
          expect(user.dob).to.not.be.an('undefined');
          return User.create({
            married: false,
            id: 1
          });
        }).then(function(u) {
          return u.save();
        }).catch(function(u) {
          return expect(u.name).to.equal('ValidationError');
        }).done(function() {
          return done();
        });
      });
    },

    'can use custom functions': function(done) {
      var User, _User;

      _User = Model.$define('User', {
        $attrs: function(deferred) {
          deferred(function(model) {
            expect(model.prototype.testFunction).to.be.ok;
            done();
          });

          return {
            name: String,
            active: Boolean
          };
        },

        $functions: {
          testFunction: function() {
            return this.name !== null;
          }
        }
      });
      User = new _User();

      User.create({
        name: 'asd',
        active: true
      }).done(function(user) {
        expect(user.testFunction()).to.equal(true);
      });
    },

    'works with simplified definition': function(done) {
      var Config, User, _Config, _User;
      _Config = Model.$define('Config', {
        $attrs: {
          alive: Boolean
        }
      });
      Config = new _Config();

      Config.create({
        alive: true,
        id: 1
      }).done(function(model) {
        model.save().done(function() {
          expect(model.alive).to.equal(true);
          expect(model.id).to.equal(1);
        });
      });

      _User = Model.$define('User', {
        $attrs: {
          name: String,
          active: Boolean,
          role: Number
        },
        $functions: {
          isActive: function() {
            if (this.role !== 1) {
              return this.active;
            }
            return false;
          }
        },
        $relations: {
          belongsTo: 'Config'
        },
        findByName: function(name) {
          return this.findOne({
            where: {
              name: name
            }
          });
        }
      });

      User = new _User();

      User.create({
        name: 'hoho',
        active: true,
        configId: 1,
        role: 2
      }).done(function(user) {
        user.save().then(function() {
          return User.findByName('hoho');
        }).then(function(model) {
          expect(model.isActive()).to.equal(true);
          return model;
        }).then(function(model) {
          return model.config();
        }).done(function(config) {
          expect(config.id).to.equal(1);
          done();
        });
      });
    },

    'applies defered actions to the model': function(done) {
      var User, _User;
      _User = Model.$define('User', {
        $attrs: function(deferred) {
          deferred(function(model) {
            model.validatesUniquenessOf('name');

            model.prototype.getStatus = function() {
              return "" + this.name + " / " + (this.active ? 'Active' : 'Inactive');
            };
          });

          return {
            name: String,
            active: {
              type: Boolean,
              "default": false
            }
          };
        }
      });
      User = new _User();

      User.create({
        name: 'Name',
        id: 1
      }).done(function(user) {
        expect(user.getStatus()).to.equal('Name / Inactive');
        done();
      });

      User.create({
        name: 'Name',
        id: 2
      });
    }

  }
};
