var mongoose = require('mongoose');
var conn = mongoose.connection;

conn.on('error', function (err) {
  console.log('connection error:', err);
});

var Category = require('../../server/category/category_model.js');
var categoryMockData = require('./category_model_mockData.js');

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

describe('Category Model', function () {

  beforeEach(function (done) {
    checkState(done);
  });

  it('should be able to create new document', function (done) {
    Category.create(categoryMockData.valid, function (err, newCategory) {
      expect(err).toBeNull();
      expect(newCategory).toBeDefined();
      expect(newCategory.name).toEqual(categoryMockData.valid.name);
      expect(newCategory.type).toEqual(categoryMockData.valid.type);
      expect(newCategory.rank).toEqual(categoryMockData.valid.rank);
      done();
    });
  });

  it('should fail to create when name is not unique', function (done) {
    Category.create(categoryMockData.valid, function (err, firstCategory) {
      Category.create(categoryMockData.valid, function (err, newCategory) {
        expect(err).toBeDefined();
        expect(err.code).toEqual(11000); // duplicate key error code is 11000
        expect(newCategory).toBeUndefined();
        done();
      });
    });
  });

  it('should fail to create when missing name', function (done) {
    Category.create(categoryMockData.missing.name, function (err, newCategory) {
      expect(err).toBeDefined();
      expect(err.errors.name.type).toEqual('required');
      expect(newCategory).toBeUndefined();
      done();
    });
  });

  it('should fail when type is not in enumerated list', function (done) {
    Category.create(categoryMockData.invalid.type, function (err, newCategory) {
      expect(err).toBeDefined();
      expect(err.errors.type.type).toEqual('enum');
      expect(newCategory).toBeUndefined();
      done();
    });
  });

  it('should fail to create when rank is not castable to a number', function (done) {
    Category.create(categoryMockData.invalid.rank, function (err, newCategory) {
      expect(err).toBeDefined();
      expect(err.name).toEqual('CastError');
      expect(newCategory).toBeUndefined();
      done();
    });
  });

  it('should have new updatedAt property on update', function (done) {
    Category.create(categoryMockData.valid, function (err, newCategory) {
      expect(err).toBeNull();
      expect(newCategory).toBeDefined();
      newCategory.name = 'someName';
      var originalTime = newCategory.updatedAt;
      newCategory.save(function (err, savedCategory) {
        expect(err).toBeNull();
        expect(savedCategory).toBeDefined();
        expect(savedCategory.name).toEqual('someName');
        expect(savedCategory.updatedAt.getTime()).toBeGreaterThan(originalTime);
        done();
      });
    });
  });

});

