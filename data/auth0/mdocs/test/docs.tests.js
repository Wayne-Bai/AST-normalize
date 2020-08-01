var getDb = require('../lib/getDb');
var docs = require('../lib/docs');
var async = require('async');
var ObjectID = require('mongodb').ObjectID;

describe('docs', function () {
  var test = this;

  before(function (done) {
    getDb(function (db) {
      async.series([
        function (cb) {
          db.collection('users')
            .remove({}, cb);
        },
        function (cb) {
          db.collection('documents')
            .remove({}, cb);
        },
        function (cb) {
          db.collection('users')
            .insert({
              displayName: 'jose',
              emails: [
                { type: 'principal', value: 'jfromaniello@gmail.com' }
              ]
            }, function (err, res) {
              if (err) return cb(err);
              test.userId = res[0]._id;
              test.user1 = res[0];
              cb();
            });
        },
        function(cb){
          db.collection('documents')
            .insert({
              name: 'expenses',
              owner: test.userId,
              collaborators: [
                {
                  user_id: 'foxbar',
                  email: 'foo@bar.com',
                  type:  'can edit'
                },
                {
                  user_id: 'foooooobar',
                  email: 'baz@bar.com',
                  type:  'can view'
                }
              ],
              visibility: {
                companies: {
                  'kluglabs': 'can view',
                  'microsoft': 'can edit'
                }
              }
            }, function (err, res){
              if(err) return cb(err);
              test.docId = res[0]._id;
              test.doc1 = res[0];
              cb();
            });
        },
        function(cb){
          db.collection('documents')
            .insert({
              name: 'expenses 2',
              owner: test.userId,
              collaborators: [
                {
                  user_id: 'foooooobar',
                  email: 'foo@bar.com',
                  type:  'can view'
                },
                {
                  email: 'baz@bar.com',
                  type:  'can view'
                }
              ]
            }, function (err, res){
              if(err) return cb(err);
              test.doc2Id = res[0]._id;
              test.doc2 = res[0]; 
              cb();
            });
        }
      ], done);
    });
  });

  describe('getMaxPermission' , function () {

    it('should return "can edit" if user is collaborator and can edit', function () {
      var user = {
        _id: ObjectID.createPk(),
        emails: [{
          type: 'foo', value: 'foo@bar.com'
        }] 
      };
      docs.getMaxPermission(user, test.doc1)
          .should.eql('can edit');
    });

    it('should return "can edit" if user is owner', function () {
      docs.getMaxPermission(test.user1, test.doc1)
          .should.eql('can edit');
    });

    it('should return "can edit" if user is collaborator (user_id) and can only view', function () {
      var user = {
        id: 'foxbar',
        emails: [] 
      };
      docs.getMaxPermission(user, test.doc1)
          .should.eql('can edit');
    });

    it('should return "can view" if user is collaborator and can only view', function () {
      var user = {
        _id: ObjectID.createPk(),
        emails: [{
          value: 'baz@bar.com'
        }] 
      };
      docs.getMaxPermission(user, test.doc1)
          .should.eql('can view');
    });

    it('should return "can view" if user is collaborator (user_id) and can only view', function () {
      var user = {
        id: 'foooooobar',
        emails: [] 
      };
      docs.getMaxPermission(user, test.doc1)
          .should.eql('can view');
    });

    it('should return "none" if user is not collaborator nor owner', function () {
      var user = {
        _id: ObjectID.createPk(),
        emails: [{
          value: 'billgates@microsoft.com'
        }] 
      };
      docs.getMaxPermission(user, test.doc1)
          .should.eql('none');
    });

    it('should return "can edit" if user belongs to a company that can edit', function () {
      var user = {
        _id: ObjectID.createPk(),
        companyId: 'microsoft',
        emails: [{
          value: 'billgates@123.com'
        }],
        identities: [{
          isSocial: false,
          connection: 'microsoft'
        }]
      };
      docs.getMaxPermission(user, test.doc1)
          .should.eql('can edit');
    });

    it('should return "can view" if user belongs to a company that can only view', function () {
      var user = {
        _id: ObjectID.createPk(),
        companyId: 'kluglabs',
        emails: [{
          value: 'billgates@123.com'
        }],
        identities: [{
          isSocial: false,
          connection: 'kluglabs'
        }]
      };
      docs.getMaxPermission(user, test.doc1)
          .should.eql('can view');
    });

    it('should return "can view" if doc public visibility is can view', function () {
      
      docs.getMaxPermission(null, {
        _id: new ObjectID(),
        visibility: {
          'public': 'can view'
        }
      }).should.eql('can view');

    });
    
    it('should return "can edit" if doc public visibility is can edit', function () {
      
      docs.getMaxPermission(null, {
        _id: new ObjectID(),
        visibility: {
          'public': 'can edit'
        }
      }).should.eql('can edit');
    });

  });

  describe('get all' , function () {
    it('should return docs user can read or view', function (done) {
      docs.getAll({
        _id: ObjectID.createPk(),
        emails: [{
          type: 'foo', value: 'foo@bar.com'
        }] 
      }, function (err, docs) {
        if(err) return done(err);
        docs[0].name.should.eql('expenses');
        docs[1].name.should.eql('expenses 2');
        done();
      });
    });

    it('should return docs user can read or view (user_id)', function (done) {
      docs.getAll({
        id: 'foooooobar',
        emails: []
      }, function (err, docs) {
        if(err) return done(err);
        docs[0].name.should.eql('expenses');
        docs[1].name.should.eql('expenses 2');
        done();
      });
    });

    it('should return docs with company-wide visibility', function (done) {
      var user = {
        companyId: 'kluglabs',
        identities: [{
          connection: 'kluglabs'
        }],
        emails: [{
          value: 'bob@kluglabs'
        }]
      };

      docs.getAll(user, function (err, docs) {
        if (err) return done(err);
        docs[0].name.should.eql('expenses');
        done();
      });
    });

    it('should not return docs with company-wide visibility but user from other company', function (done) {
      var user = {
        companyId: 'qraftlabs',
        identities: [{
          connection: 'qraftlabs'
        }],
        emails: [{
          value: 'bob@kluglabs'
        }]
      };

      docs.getAll(user, function (err, docs) {
        if (err) return done(err);
        docs.length.should.eql(0);
        done();
      });
    });
  });
});