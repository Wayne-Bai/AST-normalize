var expect = require('chai').expect;

var mio = process.env.JSCOV
        ? require('../lib-cov/mio') : require('../lib/mio');

describe('Resource', function() {
  it('is instanceof exports.Resource', function() {
    var User = mio.Resource.extend();
    var user = new User();
    expect(user).to.be.an.instanceOf(User);
    expect(user).to.be.an.instanceOf(mio.Resource);
  });

  it('inherits from EventEmitter', function() {
    var Resource = mio.Resource.extend();
    expect(Resource).to.have.property('emit');
    expect(Resource).to.have.property('on');
  });

  it('emits "initializing" event', function(done) {
    var Resource = mio.Resource.extend()
      .on('initialize', function(model, attrs) {
        expect(model).to.have.property('constructor', Resource);
        expect(attrs).to.be.an('object');
        done();
      });
    new Resource();
  });

  it('emits "initialized" event', function(done) {
    var Resource = mio.Resource.extend()
      .on('create', function(model) {
        expect(model).to.be.an('object');
        expect(model).to.have.property('constructor', Resource);
        done();
      });
    new Resource();
  });

  it('emits "change" events', function(done) {
    var Resource = mio.Resource.extend()
      .attr('id', { primary: true })
      .attr('name')
      .on('change', function(model, name, value, prev) {
        expect(model).to.be.an('object');
        expect(model).to.have.property('constructor', Resource);
        expect(name).to.equal('name');
        expect(value).to.equal('alex');
        expect(prev).to.equal(null);
        done();
      });
    var model = new Resource();
    model.name = 'alex';
  });

  it('sets default values on initialization', function() {
    var Resource = mio.Resource.extend()
    .attr('id', {
      primary: true
    })
    .attr('active', {
      default: true
    })
    .attr('created_at', {
      default: function() {
        return new Date();
      }
    });
    var model = new Resource({ id: 1 });
    expect(model.active).to.equal(true);
    expect(model.created_at).to.be.an.instanceOf(Date);
  });

  it('sets attributes on initialization', function() {
    var model = mio.Resource.extend({
      attributes: {
        id: { primary: true }
      }
    }).create({ id: 1 });
    expect(model).to.have.property('id', 1);
  });

  it('provides mutable extras attribute', function() {
    var User = mio.Resource.extend().attr('id');
    var user = new User;

    // Exists
    expect(user.extras).to.eql({});

    // Is writable
    user.extras.stuff = "things";
    expect(user.extras.stuff).to.equal("things");

    // Is not enumerable
    expect(Object.keys(user).indexOf('extras')).to.equal(-1);
  });

  describe('.primary', function() {
    var Resource = mio.Resource.extend().attr('id');

    it('throws error on get if primary key is undefined', function() {
      expect(function() {
        var model = new Resource({ id: 1 });
        var id = model.primary;
      }).to.throw('Primary key has not been defined.');
    });

    it('throws error on set if primary key is undefined', function() {
      expect(function() {
        var model = new Resource({ id: 1 });
        model.primary = 1;
      }).to.throw('Primary key has not been defined.');
    });

    it('sets primary key attribute', function() {
      Resource = mio.Resource.extend().attr('id', { primary: true });
      var model = new Resource();
      model.primary = 3;
      expect(model.primary).to.equal(3);
    });
  });

  describe('.extend()', function () {
    it('extends model with static props', function() {
      var Base = mio.Resource.extend({
        attributes: {
          id: { primary: true }
        }
      }, {
        description: "test",
        use: [function(){}],
        browser: [function(){}],
        server: [function(){}]
      });
      var Extended = Base.extend();
      expect(Extended).to.have.property('description', 'test');
      var extended = new Extended();
      expect(extended).to.be.instanceOf(mio.Resource);
      expect(extended).to.be.instanceOf(Base);
      expect(extended.attributes).to.have.property('id');
    });

    it('extends attributes', function() {
      var Base = mio.Resource.extend({
        attributes: {
          id: { primary: true },
          createdAt: {
            default: function () {
              return new Date();
            }
          }
        }
      }, {
        description: "test",
        use: [function(){}],
        browser: [function(){}],
        server: [function(){}]
      });
      var Extended = Base.extend({
        attributes: {
          id: { required: true },
          updatedAt: {
            required: true,
            default: function () {
              return new Date();
            }
          }
        }
      });
      expect(Extended).to.have.property('description', 'test');
      var extended = new Extended();
      expect(extended).to.be.instanceOf(mio.Resource);
      expect(extended).to.be.instanceOf(Base);
      expect(extended.attributes).to.have.property('id');
      expect(Extended.attributes).to.have.property('id');
      expect(Extended.attributes.id).to.have.property('primary', true);
      expect(Extended.attributes.id).to.have.property('required', true);
      expect(Extended.attributes).to.have.property('createdAt');
      expect(Extended.attributes.createdAt).to.have.property('default');
      expect(Extended.attributes.createdAt.default).to.be.a('function');
      expect(Extended.attributes).to.have.property('updatedAt');
      expect(Extended.attributes.updatedAt).to.have.property('required', true);
      expect(Extended.attributes.updatedAt.default).to.be.a('function');
    });

    it('extends model prototype', function() {
      var Base = mio.Resource.extend({
        attributes: {
          id: { primary: true }
        },
        test: function() {
          return "test";
        }
      });
      var Extended = Base.extend();
      var extended = new Extended();
      expect(extended).to.be.instanceOf(mio.Resource);
      expect(extended).to.be.instanceOf(Base);
      expect(extended).to.have.property('test');
      expect(extended.test).to.be.a('function');
      expect(extended.test()).to.equal('test');
    });

    it('merges environment specific keys', function () {
      var Base = mio.Resource.extend({
        attributes: {
          id: {
            primary: true,
            browser: {
              alias: '_id'
            },
            server: {
              alias: '_id'
            }
          }
        },
        browser: {
          attributes: {
            id: {
              default: false
            },
            updatedAt: function () {
              return new Date();
            }
          }
        },
        server: {
          attributes: {
            id: {
              default: false
            },
            updatedAt: function () {
              return new Date();
            }
          }
        }
      }, {
        server: {
          baseUrl: '/base'
        },
        browser: {
          baseUrl: '/base'
        }
      });

      expect(Base.attributes.id).to.have.property('alias', '_id');
      expect(Base.attributes.id).to.have.property('default', false);
      expect(Base.attributes).to.have.property('updatedAt');
      expect(Base.attributes.updatedAt).to.have.property('default');
    });
  });

  describe('.hook()', function () {
    it('registers array of listeners', function () {
      var Resource = mio.Resource.extend();
      var hook1 = function () {};
      var hook2 = function () {};

      Resource.hook('test', [hook1, hook2]);

      expect(Resource.hooks.test[0]).to.equal(hook1);
      expect(Resource.hooks.test[1]).to.equal(hook2);
    });
  });

  describe('.on()', function () {
    it('registers array of listeners', function () {
      var Resource = mio.Resource.extend();
      var listener1 = function () {};
      var listener2 = function () {};

      Resource.on('test', [listener1, listener2]);

      expect(Resource.listeners.test[0]).to.equal(listener1);
      expect(Resource.listeners.test[1]).to.equal(listener2);
    });
  });

  describe('.once()', function() {
    it('calls handler only once', function() {
      called = 0;

      var Resource = mio.Resource.extend().once('foo', function() {
        called++;
      });

      Resource.emit('foo');
      Resource.emit('foo');

      expect(called).to.equal(1);
    });
  });

  describe('.trigger()', function () {
    it('runs hooks in series', function (done) {
      var Resource = mio.Resource.extend({
        attributes: {
          id: { primary: true }
        }
      });

      Resource
        .hook('test', function (next) {
          next(new Error('should stop hook execution'));
        })
        .hook('post', function (changed, next) {
          next(new Error('should stop hook execution'));
        })
        .hook('post', function (changed, next) {
          done(new Error("second hook should not be called"));
        });

      Resource.create().post(function (err) {
        expect(err).to.exist();
        expect(err.message).to.equal('should stop hook execution');

        Resource.trigger('test', function (err) {
          expect(err).to.exist();
          expect(err.message).to.equal('should stop hook execution');
          done();
        });
      });
    });
  });

  describe('.attr()', function() {
    it('throws error if defining two primary keys', function() {
      var Resource = mio.Resource.extend();
      Resource.attr('id', { primary: true });
      expect(function() {
        Resource.attr('_id', { primary: true });
      }).to.throw('Primary attribute already exists: id');
    });

    it('emits "attribute" event', function(done) {
      var Resource = mio.Resource.extend()
        .on('attribute', function(name, params) {
          expect(name).to.equal('id');
          expect(params).to.be.an('object');
          expect(params).to.have.property('primary', true);
          done();
        });
      Resource.attr('id', { primary: true });
    });
  });

  describe('.use()', function() {
    it('extends model', function() {
      var Resource = mio.Resource.extend();
      Resource.use(function() {
        this.test = 1;
      });
      expect(Resource).to.have.property('test', 1);
    });

    it('throws error if plugin is not a function', function() {
      expect(function() {
        mio.Resource.extend().use(1);
      }).to.throw(/must be a function/);
    });

    it('does not pollute other models', function(done) {
      var User = mio.Resource.extend();
      var Post = mio.Resource.extend();

      User.hook('get', function(query, callback) {
        callback(null, {foo: 'bar'});
      });

      Post.get({}, function(err, model) {
        expect(model).to.equal(undefined);

        User.get({}, function (err, model) {
          expect(model).to.have.property('foo', 'bar');
          done();
        });
      });
    });
  });

  describe('.browser()', function() {
    it('only runs methods in browser', function() {
      var Resource = mio.Resource.extend();
      global.window = {};
      Resource.browser(function() {
        this.test = 1;
      });
    });
  });

  describe('.server()', function() {
    it('only runs methods in node', function() {
      var Resource = mio.Resource.extend();
      Resource.server(function() {
        this.test = 1;
      });
    });
  });

  describe('.create()', function() {
    it('creates new models', function() {
      var Resource = mio.Resource.extend();
      var model = Resource.create();
      expect(model).to.be.an.instanceOf(Resource);
    });

    it('hydrates model from existing object', function() {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var model = Resource.create({ id: 1 });
      expect(model).to.have.property('id', 1);
    });

    it('hydrates model from existing resource', function() {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var model = Resource.create({ id: 1 });
      expect(Resource.create(model)).to.equal(model);
    });
  });

  describe('.hasOne()', function () {
    it('should define attribute for relation', function () {
      var Patient = mio.Resource.extend().hasOne('record', {
        target: mio.Resource.extend(),
        foreignKey: 'patient_id'
      });

      expect(Patient.attributes).to.have.property('record');
      expect(Patient.attributes.record).to.have.property('relation');

      var relation = Patient.attributes.record.relation;

      expect(relation).to.have.property('type', 'hasOne');
      expect(relation).to.have.property('foreignKey', 'patient_id');
    });
  });

  describe('.addRelation()', function () {
    it('should pass params to .attr()`', function () {
      var Patient = mio.Resource.extend().hasOne('record', {
        target: mio.Resource.extend(),
        foreignKey: 'patient_id',
        serializable: false
      });

      expect(Patient.attributes).to.have.property('record');
      expect(Patient.attributes.record).to.have.property('serializable', false);
    });

    it('throws error for missing target or foreignKey');
  });

  describe('.hasMany()', function () {
    it('should define attribute for relation', function () {
      var Author = mio.Resource.extend().hasMany('books', {
        target: mio.Resource.extend(),
        foreignKey: 'author_id'
      });

      expect(Author.attributes).to.have.property('books');
      expect(Author.attributes.books).to.have.property('relation');

      var relation = Author.attributes.books.relation;

      expect(relation).to.have.property('type', 'hasMany');
      expect(relation).to.have.property('foreignKey', 'author_id');
    });
  });

  describe('.belongsTo()', function () {
    it('should define attribute for relation', function () {
      var Book = mio.Resource.extend().belongsTo('author', {
        target: mio.Resource.extend(),
        foreignKey: 'author_id'
      });

      expect(Book.attributes).to.have.property('author');
      expect(Book.attributes.author).to.have.property('relation');

      var relation = Book.attributes.author.relation;

      expect(relation).to.have.property('type', 'belongsTo');
      expect(relation).to.have.property('foreignKey', 'author_id');
    });
  });

  describe('.get()', function() {
    it('finds models by id', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.get(1, function(err, model) {
        if (err) return done(err);
        done();
      });
    });

    it("triggers get hooks", function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('get', function(query, cb) {
          cb();
        })
        .hook('get', function(query, cb) {
          cb(null, new Resource({ id: 1 }));
        });

      Resource.get(1, function(err, model) {
        if (err) return done(err);
        expect(model).to.have.property('id', 1);
        done();
      });
    });

    it('emits "hook:get" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('get', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Resource.get(1, function(err, model) {
        if (err) return done(err);
      });
    });

    it('emits "get" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource.on('get', function(model) {
        expect(model).to.be.an.instanceOf(Resource);
        done();
      });

      Resource.hook('get', function(query, cb) {
        cb(null, new Resource({ id: 1 }));
      });

      Resource.get(1, function(err, model) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource.hook('get', function(query, cb) {
        cb(new Error('test'));
      });

      Resource.get(1, function(err, model) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.put()', function () {
    it("triggers put hooks", function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('put', function(query, resource, cb) {
          cb();
        })
        .hook('put', function(query, resource, cb) {
          cb(null, { id: 2 });
        });

      Resource.put({ id: 2 }).where({ id: 1 }).exec(function(err, model) {
        if (err) return done(err);
        expect(model).to.have.property('id', 2);
        done();
      });
    });

    it('emits "hook:put" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('put', function(query, resource) {
        expect(query).to.be.an('object');
        done();
      });
      Resource.put({ id: 1 }, { id: 2 }, function(err, model) {
        if (err) return done(err);
      });
    });

    it('emits "put" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource.on('put', function(model) {
        expect(model).to.be.an.instanceOf(Resource);
        done();
      });

      Resource.hook('put', function(query, resource, cb) {
        cb(null, new Resource({ id: 1 }));
      });

      Resource.put({ id: 1 }, { id : 2 }, function(err, model) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource.hook('put', function(query, resource, cb) {
        cb(new Error('test'));
      });

      Resource.put({ id: 1 }, { id: 2 }, function(err, model) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.patch()', function () {
    it("triggers patch hooks", function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('patch', function(query, resource, cb) {
          cb();
        })
        .hook('patch', function(query, resource, cb) {
          cb(null, new Resource({ id: 1 }));
        });

      Resource.patch({ id: 2 }).where({ id: 2 }).exec(function(err, model) {
        if (err) return done(err);
        expect(model).to.have.property('id', 1);
        done();
      });
    });

    it('emits "hook:patch" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('patch', function(query, resource) {
        expect(query).to.be.an('object');
        done();
      });
      Resource.patch({ id: 1 }, { id: 2 }, function(err, model) {
        if (err) return done(err);
      });
    });

    it('emits "patch" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource.on('patch', function(model) {
        expect(model).to.be.an.instanceOf(Resource);
        done();
      });

      Resource.hook('patch', function(query, resource, cb) {
        cb(null, new Resource({ id: 1 }));
      });

      Resource.patch({ id: 1 }, { id : 2 }, function(err, model) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource.hook('patch', function(query, resource, cb) {
        cb(new Error('test'));
      });

      Resource.patch({ id: 1 }, { id: 2 }, function(err, model) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.post()', function () {
    it("triggers post hooks", function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('post', function(resource, cb) {
          cb();
        })
        .hook('post', function(resource, cb) {
          cb(null, new Resource({ id: 1 }));
        });

      Resource.post({ id: 2 }, function(err, model) {
        if (err) return done(err);
        expect(model).to.have.property('id', 1);
        done();
      });
    });

    it('emits "hook:post" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('post', function(resource) {
        expect(resource).to.be.an('object');
        done();
      });
      Resource.post({ id: 2 }, function(err, model) {
        if (err) return done(err);
      });
    });

    it('emits "post" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource.on('post', function(model) {
        expect(model).to.be.an.instanceOf(Resource);
        done();
      });

      Resource.hook('post', function(resource, cb) {
        cb(null, new Resource({ id: 1 }));
      });

      Resource.post({ id : 2 }, function(err, model) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource.hook('post', function(resource, cb) {
        cb(new Error('test'));
      });

      Resource.post({ id: 2 }, function(err, model) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.delete()', function () {
    it("triggers delete hooks", function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('delete', function(query, cb) {
          cb();
        })
        .hook('delete', function(query, cb) {
          cb(null, new Resource({ id: 1 }));
        });

      Resource.delete({ id: 1 }, function(err, model) {
        if (err) return done(err);
        expect(model).to.have.property('id', 1);
        done();
      });
    });

    it('returns chainable query builder', function (done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource.hook('delete', function (query, next) {
        expect(query).to.be.an('object');
        expect(query).to.have.property('query');
        expect(query.query).to.have.property('where');
        expect(query.query.where).to.have.property('id', 1);
        next();
      });

      Resource.delete().where({ id: 1 }).exec(done);
    });

    it('emits "hook:delete" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('delete', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Resource.delete({ id: 1 }, function(err, model) {
        if (err) return done(err);
      });
    });

    it('emits "delete" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource.on('delete', function(model) {
        expect(model).to.be.an.instanceOf(Resource);
        done();
      });

      Resource.hook('delete', function(query, cb) {
        cb(null, new Resource({ id: 1 }));
      });

      Resource.delete({ id: 1 }, function(err, model) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource.hook('delete', function(query, cb) {
        cb(new Error('test'));
      });

      Resource.delete(function(err, model) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('#get()', function() {
    it('finds models by id', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var resource = new Resource({ id: 1 });
      resource.get(function(err, model) {
        if (err) return done(err);
        done();
      });
    });

    it("triggers get hooks", function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var resource = new Resource({ id: 1 });

      Resource
        .hook('get', function(query, cb) {
          cb();
        })
        .hook('get', function(query, cb) {
          cb(null, new Resource({ id: 1 }));
        });

      resource.get(function(err, model) {
        if (err) return done(err);
        expect(model).to.have.property('id', 1);
        done();
      });
    });

    it('emits "hook:get" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var resource = new Resource({ id: 1 });

      Resource.hook('get', function(query) {
        expect(query).to.be.an('object');
        done();
      });

      resource.get(function(err, model) {
        if (err) return done(err);
      });
    });

    it('emits "get" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var resource = new Resource({ id: 1 });

      Resource.on('get', function(model) {
        expect(model).to.be.an.instanceOf(Resource);
        done();
      });

      Resource.hook('get', function(query, cb) {
        cb(null, new Resource({ id: 1 }));
      });

      resource.get(function(err, model) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var resource = new Resource({ id: 1 });

      Resource.hook('get', function(query, cb) {
        cb(new Error('test'));
      });

      resource.get(function(err, model) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('#put()', function () {
    it("triggers put hooks", function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var resource = new Resource({ id: 1 });

      Resource
        .hook('put', function(query, resource, cb) {
          cb();
        })
        .hook('put', function(query, resource, cb) {
          cb(null, new Resource({ id: 1 }));
        });

      resource.put(function(err, model) {
        if (err) return done(err);
        expect(model).to.have.property('id', 1);
        done();
      });
    });

    it('emits "hook:put" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var resource = new Resource({ id: 1 });

      Resource.hook('put', function(query, resource) {
        expect(query).to.be.an('object');
        done();
      });

      resource.put(function(err, model) {
        if (err) return done(err);
      });
    });

    it('emits "put" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var resource = new Resource({ id: 1 });

      Resource.on('put', function(model) {
        expect(model).to.be.an.instanceOf(Resource);
        done();
      });

      Resource.hook('put', function(query, resource, cb) {
        cb(null, new Resource({ id: 1 }));
      });

      resource.put(function(err, model) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var resource = new Resource({ id: 1 });

      Resource.hook('put', function(query, resource, cb) {
        cb(new Error('test'));
      });

      resource.put(function(err, model) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('#patch()', function () {
    it("triggers patch hooks", function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var resource = new Resource({ id: 1 });

      Resource
        .hook('patch', function(query, resource, cb) {
          cb();
        })
        .hook('patch', function(query, resource, cb) {
          cb(null, new Resource({ id: 1 }));
        });

      resource.patch(function(err, model) {
        if (err) return done(err);
        expect(model).to.have.property('id', 1);
        done();
      });
    });

    it('emits "hook:patch" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var resource = new Resource({ id: 1 });

      Resource.hook('patch', function(query, resource) {
        expect(query).to.be.an('object');
        done();
      });

      resource.patch(function(err, model) {
        if (err) return done(err);
      });
    });

    it('emits "patch" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var resource = new Resource({ id: 1 });

      Resource.on('patch', function(model) {
        expect(model).to.be.an.instanceOf(Resource);
        done();
      });

      Resource.hook('patch', function(query, resource, cb) {
        cb(null, new Resource({ id: 1 }));
      });

      resource.patch(function(err, model) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var resource = new Resource({ id: 1 });

      Resource.hook('patch', function(query, resource, cb) {
        cb(new Error('test'));
      });

      resource.patch(function(err, model) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('#post()', function() {
    it('triggers "post" hooks', function(done) {
      var Resource = mio.Resource.extend()
        .attr('id', { primary: true, required: true })
        .hook('post', function(changed, cb, model) {
          expect(changed).to.have.property('id', 1);
          cb();
        })
        .hook('post', function(changed, cb, model) {
          expect(changed).to.have.property('id', 1);
          cb(null, model);
        });

      var model = Resource.create().set({ id: 1 });

      model.post(function(err) {
        expect(model.id).to.equal(1);
        done();
      });
    });

    it("passes error from adapter to callback", function(done) {
      var Resource = mio.Resource.extend()
        .attr('id', { primary: true })
        .hook('post', function(changed, cb) {
          cb(new Error("test"));
        });

      var model = Resource.create();

      model.post(function(err) {
        expect(err.message).to.equal('test');
        done();
      });
    });

    it('emits "hook:post" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var called = false;
      Resource.hook('post', function(changed, next, model) {
        called = true;
        expect(model).to.have.property('constructor', Resource);
        expect(changed).to.be.an('object');
        next();
      });
      Resource.create().set('id', 1).post(function(err) {
        expect(called).to.equal(true);
        done(err);
      });
    });

    it('emits "post" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var model = Resource.create().set('id', 1);
      model.on('post', function() {
        done();
      }).post(function(err) { });
    });
  });

  describe('#delete()', function() {
    it('triggers "delete" hooks', function(done) {
      var Resource = mio.Resource.extend()
        .attr('id', { primary: true, required: true })
        .hook('delete', function(model, cb) {
          cb();
        })
        .hook('delete', function(model, cb) {
          cb();
        });
      var model = Resource.create({ id: 1 });
      model.delete(function(err) {
        expect(err).to.eql(undefined);
        done();
      });
    });

    it("passes error from adapter to callback", function(done) {
      var Resource = mio.Resource.extend()
        .attr('id', { primary: true, required: true })
        .hook('delete', function(model, cb) {
          cb(new Error('test'));
        });
      var model = Resource.create({ id: 1 });
      model.delete(function(err) {
        expect(err).to.have.property('message', 'test');
        done();
      });
    });

    it('emits "hook:delete" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('delete', function(query, next, model) {
        expect(model).to.have.property('constructor', Resource);
        next();
      });
      var model = Resource.create({ id: 1 });
      model.hook('delete', function() {
        done();
      }).delete(function(err) { });
    });

    it('emits "delete" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.on('delete', function(query, model) {
        expect(model).to.be.an.instanceOf(Resource);
      });
      var model = Resource.create({ id: 1 });
      model.on('delete', function() {
        done();
      }).delete(function(err) { });
    });
  });

  describe('#url()', function () {
    it('returns map of URLs', function () {
      var urls = mio.Resource.extend({}, {
        baseUrl: '/users'
      }).create().url();

      expect(urls).to.be.an('object');
    });

    it('returns URL for method given', function () {
      var url = mio.Resource.extend({}, {
        baseUrl: '/users'
      }).create().url('put');

      expect(url).to.equal('/users/:primary');
    });
  });

  describe('#isNew()', function() {
    it('checks whether primary attribute is set', function() {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var m1 = Resource.create();
      expect(m1.isNew()).to.equal(true);
      var m2 = Resource.create({ id: 1 });
      expect(m2.isNew()).to.equal(false);
    });

    it('throws error if primary key has not been defined', function() {
      var Resource = mio.Resource.extend().attr('id');
      var model = Resource.create();
      expect(function() {
        model.isNew();
      }).to.throw("Primary key has not been defined.");
    });
  });

  describe('#has()', function() {
    it('checks for attribute definition', function() {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var model = Resource.create({ id: 1 });
      expect(model.has('name')).to.equal(false);
      expect(model.has('id')).to.equal(true);
    });
  });

  describe('#set()', function() {
    it('sets values for defined attributes', function() {
      var Resource = mio.Resource.extend()
        .attr('id', { primary: true })
        .attr('name');
      var model = Resource.create().set({ id: 1, name: 'alex', age: 26 });
      expect(model.id).to.equal(1);
      expect(model.name).to.equal('alex');
      expect(model).to.not.have.property('age');
    });

    it('emits "setting" event', function(done) {
      var Resource = mio.Resource.extend()
        .attr('id', { primary: true })
        .attr('name')
        .on('set', function (model, attrs) {})
        .on('set', function (model, attrs) {
          expect(model).to.have.property('constructor', Resource);
          expect(attrs).to.have.property('name', 'alex');
          done();
        });
      var model = new Resource();
      model.set({ name: 'alex' });
    });
  });

  describe('#reset()', function() {
    it('resets values for defined attributes', function() {
      var Resource = mio.Resource.extend()
        .attr('id', { primary: true })
        .attr('name');
      var model = Resource.create().reset({ id: 1, name: 'alex', age: 26 });
      expect(model.id).to.equal(1);
      expect(model.name).to.equal('alex');
      expect(model).to.not.have.property('age');
    });

    it('emits "setting" event', function(done) {
      var Resource = mio.Resource.extend()
        .attr('id', { primary: true })
        .attr('name')
        .on('reset', function(model, attrs) {
          expect(model).to.have.property('constructor', Resource);
          expect(attrs).to.have.property('name', 'alex');
          done();
        });
      var model = new Resource();
      model.reset({ name: 'alex' });
    });
  });

  describe('#isDirty()', function() {
    it('returns whether model is changed/dirty', function() {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var model = Resource.create();
      expect(model.isDirty()).to.equal(false);
      model.id = 1;
      expect(model.isDirty()).to.equal(true);
    });

    it('returns whether attribute is changed/dirty', function() {
      var Resource = mio.Resource.extend()
        .attr('id', { primary: true })
        .attr('name', { required: true });

      var model = new Resource();
      model.name = 'alex';
      expect(model.isDirty('name')).to.equal(true);
    });
  });

  describe('#changed()', function() {
    it('returns attributes changed since last save', function() {
      var Resource = mio.Resource.extend()
        .attr('id', { primary: true })
        .attr('name');
      var model = Resource.create({ id: 1 });
      model.name = 'alex';
      expect(model.changed()).to.have.property('name', 'alex');
    });
  });

  describe('#toJSON()', function () {
    it('only includes serializable attributes', function () {
      var resource = mio.Resource.extend({
        attributes: {
          name: {},
          active: {
            serializable: false
          }
        }
      })({ name: 'alex', active: true });

      var json = resource.toJSON();
      expect(json).to.have.property('name', 'alex');
      expect(json).not.to.have.property('active');
    });
  });
});

describe('Query', function() {
  it('is chainable', function(done) {
    var Resource = mio.Resource.extend().attr('id', { primary: true });
    Resource.get()
    .where({ name: 'alex' })
    .sort('asc')
    .size(10)
    .withRelated('related')
    .exec(function(err) {
      if (err) return done(err);

      Resource.Collection.get()
      .where({ name: 'alex' })
      .sort({ name: 'asc' })
      .size(10)
      .withRelated(['related'])
      .exec(function(err) {
        if (err) return done(err);

        Resource.Collection.delete()
        .where({ name: 'alex' })
        .size(5)
        .page(2)
        .exec(done);
      });
    });
  });

  it('modifies query', function(done) {
    var Resource = mio.Resource.extend().attr('id', { primary: true });
    Resource.hook('collection:get', function(query, next) {
      expect(query.query).to.have.keys([
        'from',
        'page',
        'size',
        'sort',
        'where'
      ]);
      done();
    });
    Resource.Collection.get()
      .where({ name: 'alex' })
      .sort('asc')
      .paginate({ page: 1 })
      .from(10)
      .size(10)
      .exec(function() {});
  });

  it('respects Resource.defaultPageSize', function (done) {
    var Resource = mio.Resource.extend({
      attributes: {
        id: { primary: true }
      }
    }, {
      defaultPageSize: 30
    });

    Resource.hook('collection:get', function (query, next) {
      expect(query.size()).to.equal(30);
      next();
    });

    expect(Resource).to.have.property('defaultPageSize', 30);

    Resource.Collection.get().exec(done);
  });

  it('respects Resource.maxPageSize', function (done) {
    var Resource = mio.Resource.extend({
      attributes: {
        id: { primary: true }
      }
    }, {
      maxPageSize: 101
    });

    Resource.hook('collection:get', function (query, next) {
      expect(query.size()).to.equal(101);
      next();
    });

    expect(Resource).to.have.property('maxPageSize', 101);

    Resource.Collection.get().size(200).exec(done);
  });

  describe('#exec()', function () {
    it('throws error if no handler is defined', function () {
      expect(function () {
        var Resource = mio.Resource.extend();
        (new mio.Query({
          context: Resource
        })).exec();
      }).to.throw(/no handler defined/);
    });
  });

  describe('#toJSON()', function () {
    it('returns query', function () {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      var json = Resource.get().where({ name: 'Alex' }).toJSON();
      expect(json).to.be.an('object');
      expect(json).to.have.property('where');
      expect(json.where).to.have.property('name', 'Alex');
    });
  });
});

describe('Collection', function () {
  it('requires Resource', function () {
    var User = mio.Resource.extend();

    expect(function () {
      mio.Collection.extend();
    }).to.throw(/Resource is required/);

    expect(function () {
      new mio.Collection();
    }).to.throw(/Resource is required/);
  });

  describe('.create()', function () {
    it('returns collection if already instantiated', function () {
      var Resource = mio.Resource.extend();
      var collection = Resource.Collection.create();
      expect(Resource.Collection.create(collection)).to.equal(collection);
    });
  });

  describe('.url()', function () {
    it('returns map of URLs', function () {
      var urls = mio.Resource.extend({}, {
        baseUrl: '/users'
      }).Collection.url();
      expect(urls).to.be.an('object');
    });

    it('returns URL for method given', function () {
      var url = mio.Resource.extend({}, {
        baseUrl: '/users'
      }).Collection.url('put');
      expect(url).to.equal('/users');
    });
  });

  describe('.get()', function() {
    it('finds collection of models using query', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('collection:get', function (query, next) {
        next(null, new Resource.Collection());
      });
      Resource.Collection.get(function(err, collection) {
        if (err) return done(err);
        expect(collection).to.be.an.instanceOf(Resource.Collection);
        Resource.get({ id: 1 }, function(err, collection) {
          done();
        });
      });
    });

    it('returns empty collection if none received', function (done) {
      var Resource = mio.Resource.extend({
        attributes: {
          id: {
            primary: true
          }
        }
      });

      Resource.Collection.get(function (err, collection) {
        expect(err).to.not.exist();
        expect(collection).to.be.an('object');
        expect(collection).to.be.an.instanceOf(Resource.Collection);
        expect(collection).to.have.property('length', 0);
        done();
      });
    });

    it("emits collection hooks", function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:get', function(query, cb) {
          cb();
        })
        .hook('collection:get', function(query, cb) {
          cb(null, [new Resource({ id: 1 })]);
        });

      Resource.Collection.get(function(err, collection) {
        if (err) return done(err);
        expect(collection).to.have.property('length', 1);
        expect(collection[0]).to.have.property('constructor', Resource);
        done();
      });
    });

    it('emits "hook:collection:get" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('collection:get', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Resource.Collection.get({ id: 1 }, function(err, collection) {
        if (err) return done(err);
      });
    });

    it('emits "collection:get" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.on('collection:get', function(collection, query) {
        done();
      });
      Resource.Collection.get({ id: 1 }, function(err, collection) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource.hook('collection:get', function(query, cb) {
        cb(new Error('test'));
      });

      Resource.Collection.get(function(err, collection) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.put()', function() {
    it('updates models using query', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.Collection.put({ id: 2 }).where({ id: 1 }).exec(function(err) {
        done();
      });
    });

    it('triggers "collection:put" hooks', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:put', function(query, changes, cb) {
          cb();
        })
        .hook('collection:put', function(query, changes, cb) {
          cb();
        });

      Resource.Collection.put({}, {}, function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('emits "hook:collection:put" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('collection:put', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Resource.Collection.put({ id: 1 }, { id: 2 }, function(err) {
        if (err) return done(err);
      });
    });

    it('emits "collection:put" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.on('collection:put', function() {
        done();
      });
      Resource.Collection.put({ id: 1 }, { id: 2 }, function(err) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:put', function(query, changes, cb) {
          cb();
        })
        .hook('collection:put', function(query, changes, cb) {
          cb(new Error('test'));
        });

      Resource.Collection.put({}, {}, function(err) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.patch()', function() {
    it('updates models using query', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.Collection.patch({ id: 2 }).where({ id: 2 }).exec(function(err) {
        done();
      });
    });

    it('triggers "collection:patch" hooks', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:patch', function(query, changes, cb) {
          cb();
        })
        .hook('collection:patch', function(query, changes, cb) {
          cb();
        });

      Resource.Collection.patch({}, {}, function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('emits "hook:collection:patch" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('collection:patch', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Resource.Collection.patch({ id: 1 }, { id: 2 }, function(err) {
        if (err) return done(err);
      });
    });

    it('emits "collection:patch" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.on('collection:patch', function() {
        done();
      });
      Resource.Collection.patch({ id: 1 }, { id: 2 }, function(err) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:patch', function(query, changes, cb) {
          cb();
        })
        .hook('collection:patch', function(query, changes, cb) {
          cb(new Error('test'));
        });

      Resource.Collection.patch({}, {}, function(err) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.post()', function() {
    it('updates models using query', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.Collection.post([{ id: 2 }], function(err) {
        done();
      });
    });

    it('triggers "collection:post" hooks', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:post', function(resources, cb) {
          cb();
        })
        .hook('collection:post', function(resources, cb) {
          cb();
        });

      Resource.Collection.post([], function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('emits "hook:collection:post" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('collection:post', function(resources) {
        expect(resources).to.be.an('array');
        done();
      });
      Resource.Collection.post([{ id: 1 }, { id: 2 }], function(err) {
        if (err) return done(err);
      });
    });

    it('emits "collection:post" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.on('collection:post', function() {
        done();
      });
      Resource.Collection.post([{ id: 1 }, { id: 2 }], function(err) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:post', function(resources, cb) {
          cb();
        })
        .hook('collection:post', function(resources, cb) {
          cb(new Error('test'));
        });

      Resource.Collection.post([], function(err) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('.delete()', function() {
    it('deletes models using query', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.Collection.delete({ id: 1 }, function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('triggers "collection:delete" hooks', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:delete', function(query, cb) {
          cb();
        })
        .hook('collection:delete', function(query, cb) {
          cb();
        });

      Resource.Collection.delete({}, function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('emits "hook:collection:delete" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('collection:delete', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Resource.Collection.delete({ id: 1 }, function(err) {
        if (err) return done(err);
      });
    });

    it('emits "collection:delete" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.on('collection:delete', function() {
        done();
      });
      Resource.Collection.delete({ id: 1 }, function(err) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:delete', function(query, cb) {
          cb();
        })
        .hook('collection:delete', function(query, cb) {
          cb(new Error('test'));
        });

      Resource.Collection.delete(function(err) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('#get()', function() {
    it('finds collection of models using query', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('collection:get', function (query, next) {
        next(null, new Resource.Collection());
      });
      Resource.Collection.create().get(function(err, collection) {
        if (err) return done(err);
        expect(collection).to.be.an.instanceOf(Resource.Collection);
        Resource.get({ id: 1 }, function(err, collection) {
          done();
        });
      });
    });

    it("emits collection hooks", function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:get', function(query, cb) {
          cb();
        })
        .hook('collection:get', function(query, cb) {
          cb(null, new Resource.Collection([new Resource({ id: 1 })]));
        });

      Resource.Collection.create().get(function(err, collection) {
        if (err) return done(err);
        expect(collection).to.have.property('length', 1);
        expect(collection.at(0)).to.have.property('constructor', Resource);
        done();
      });
    });

    it('emits "hook:collection:get" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('collection:get', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Resource.Collection.create().get({ id: 1 }, function(err, collection) {
        if (err) return done(err);
      });
    });

    it('emits "collection:get" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.on('collection:get', function(query) {
        done();
      });
      Resource.Collection.create().get(function(err, collection) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource.hook('collection:get', function(query, cb) {
        cb(new Error('test'));
      });

      Resource.Collection.create().get(function(err, collection) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('#put()', function() {
    it('updates models using query', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.Collection.create([{ id: 2 }]).put(function(err) {
        done();
      });
    });

    it('triggers "collection:put" hooks', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:put', function(query, changes, cb) {
          cb();
        })
        .hook('collection:put', function(query, changes, cb) {
          cb();
        });

      Resource.Collection.create().put(function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('emits "hook:collection:put" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('collection:put', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Resource.Collection.create().put(function(err) {
        if (err) return done(err);
      });
    });

    it('emits "collection:put" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.on('collection:put', function() {
        done();
      });
      Resource.Collection.create().put(function(err) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:put', function(query, changes, cb) {
          cb();
        })
        .hook('collection:put', function(query, changes, cb) {
          cb(new Error('test'));
        });

      Resource.Collection.create().put(function(err) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('#patch()', function() {
    it('updates models using query', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.Collection.create().patch(function(err) {
        done();
      });
    });

    it('triggers "collection:patch" hooks', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:patch', function(query, changes, cb) {
          cb();
        })
        .hook('collection:patch', function(query, changes, cb) {
          cb();
        });

      Resource.Collection.create().patch(function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('emits "hook:collection:patch" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('collection:patch', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Resource.Collection.create().patch(function(err) {
        if (err) return done(err);
      });
    });

    it('emits "collection:patch" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.on('collection:patch', function() {
        done();
      });
      Resource.Collection.create().patch(function(err) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:patch', function(query, changes, cb) {
          cb();
        })
        .hook('collection:patch', function(query, changes, cb) {
          cb(new Error('test'));
        });

      Resource.Collection.create().patch(function(err) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('#post()', function() {
    it('updates models using query', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.Collection.create([{ id: 2 }]).post(function(err) {
        done();
      });
    });

    it('triggers "collection:post" hooks', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:post', function(resources, cb) {
          cb();
        })
        .hook('collection:post', function(resources, cb) {
          cb();
        });

      Resource.Collection.create().post(function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('emits "hook:collection:post" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('collection:post', function(resources) {
        expect(resources).to.be.an.instanceOf(Resource.Collection);
        done();
      });
      Resource.Collection.create([{ id: 1 }, { id: 2 }]).post(function(err) {
        if (err) return done(err);
      });
    });

    it('emits "collection:post" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.on('collection:post', function() {
        done();
      });
      Resource.Collection.create([{ id: 1 }, { id: 2 }]).post(function(err) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:post', function(resources, cb) {
          cb();
        })
        .hook('collection:post', function(resources, cb) {
          cb(new Error('test'));
        });

      Resource.Collection.create().post(function(err) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('#delete()', function() {
    it('deletes models using query', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.Collection.create().delete(function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('triggers "collection:delete" hooks', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:delete', function(query, cb) {
          cb();
        })
        .hook('collection:delete', function(query, cb) {
          cb();
        });

      Resource.Collection.create().delete(function(err) {
        if (err) return done(err);
        done();
      });
    });

    it('emits "hook:collection:delete" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.hook('collection:delete', function(query) {
        expect(query).to.be.an('object');
        done();
      });
      Resource.Collection.create().delete(function(err) {
        if (err) return done(err);
      });
    });

    it('emits "collection:delete" event', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });
      Resource.on('collection:delete', function() {
        done();
      });
      Resource.Collection.create().delete(function(err) {
        if (err) return done(err);
      });
    });

    it('passes error from adapter to callback', function(done) {
      var Resource = mio.Resource.extend().attr('id', { primary: true });

      Resource
        .hook('collection:delete', function(query, cb) {
          cb();
        })
        .hook('collection:delete', function(query, cb) {
          cb(new Error('test'));
        });

      Resource.Collection.create().delete(function(err) {
        expect(err).to.have.property('message', 'test')
        done();
      });
    });
  });

  describe('#length', function () {
    it('keeps internal array length', function () {
      var Resource = mio.Resource.extend({
        id: { primary: true }
      }, {
        baseUrl: '/users'
      });

      var collection = new Resource.Collection();

      expect(collection).to.have.property('length', 0);
      collection.push(new Resource());
      expect(collection).to.have.property('length', 1);
      collection.pop();
      expect(collection).to.have.property('length', 0);
      collection.push(new Resource());
      collection.splice(1, 0, new Resource());
      expect(collection).to.have.property('length', 2);
    });
  });

  describe('#at()', function () {
    it('returns resource at given index', function () {
      var Resource = mio.Resource.extend();
      var r1 = Resource.create();
      var r2 = Resource.create();
      var r3 = Resource.create();
      var collection = new Resource.Collection([
        r1, r2, r3
      ]);
      expect(collection.at(0)).to.equal(r1);
      expect(collection.at(2)).to.equal(r3);
      expect(collection.at(3)).to.equal(undefined);
    });
  });

  describe('#url()', function () {
    it('returns map of URLs', function () {
      var urls = mio.Resource.extend({}, {
        baseUrl: '/users'
      }).Collection.create().url();
      expect(urls).to.be.an('object');
    });

    it('returns URL for method given', function () {
      var url = mio.Resource.extend({}, {
        baseUrl: '/users'
      }).Collection.create().url('put');
      expect(url).to.equal('/users');
    });
  });

  describe('#toJSON()', function () {
    it('returns array of resources', function () {
      var collection = new mio.Resource.extend().Collection();
      expect(collection.toJSON()).to.be.instanceOf(Array);
    });
  });
});
