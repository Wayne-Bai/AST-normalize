
var app = require('../fixtures/bootstrap'),
    vows = require('vows'),
    util = require('util'),
    assert = require('assert'),
    colorize = protos.util.colorize,
    ModelBatch = require('../fixtures/model-batch'),
    Multi = require('multi'),
    pg = require('pg'),
    Client = pg.Client,
    EventEmitter = require('events').EventEmitter;

var postgres, multi, model, storageMulti, modelBatch;

var config = app.config.drivers.postgres,
    client = new Client(config),
    pclient = new Multi(client);
    
client.connect();

var table = config.table;

// Test table
var createTable = util.format('CREATE TABLE %s (id serial PRIMARY KEY, username varchar(255), password VARCHAR(255));', table);

// Test Model
function TestModel() {

  this.driver = 'postgres';

  this.properties = app.locals.commonModelProps;

}

util.inherits(TestModel, protos.lib.model);

var modelBatch = new ModelBatch();
    
var batch = vows.describe('drivers/postgres.js').addBatch({
  
  'Integrity Checks': {
    
    topic: function() {
      postgres = app.getResource('drivers/postgres');
      multi = postgres.multi();
      multi.on('pre_exec', app.backupFilters);
      multi.on('post_exec', app.restoreFilters);
      return null;
    },
    
    'Sets db': function() {
      assert.isNotNull(postgres.db);
      assert.equal(postgres.db, config.database);
    },

    'Sets config': function() {
      assert.strictEqual(postgres.config.host, app.config.drivers.postgres.host);
    },
    
    'Sets client': function() {
      assert.strictEqual(Client, client.constructor);
    }

  }
  
}).addBatch({
  
  'Preliminaries': {
    
    topic: function() {
      var promise = new EventEmitter();
      pclient.query('DROP TABLE IF EXISTS ' + table);
      pclient.query(createTable);
      pclient.exec(function(err, results) {
        promise.emit('success', err);
      });
      return promise;
    },
    
    'Created temporary table': function(err) {
      assert.isNull(err);
    }
    
  }
  
}).addBatch({
  
  'PostgreSQL::exec': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      // sql
      multi.__exec({sql: util.format('SELECT COUNT(id) AS count FROM %s', table)});
      
      // sql + params
      multi.__exec({
        sql: util.format('INSERT INTO %s(username, password) VALUES ($1,$2) RETURNING id', table),
        params: ['username', 'password']
      });
      
      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });
      return promise;
    },
    
    'Performs simple queries': function(results) {
      assert.deepEqual(results[0].rows, [{count: 0}]);
    },
    
    'Performs queries with parameters': function(results) {
      assert.strictEqual(results[1].rows[0].id, 1);
    }
    
  }
  
}).addBatch({
  
  'PostgreSQL::insertInto': {
    
    topic: function() {
      var promise = new EventEmitter();
      postgres.insertInto({
        table: table,
        values: {
          username: 'user1',
          password: 'pass1'
        }
      }, function(err, id) {
        promise.emit('success', err || id);
      });
      return promise;
    },
    
    'Inserts records into the database': function(id) {
      assert.strictEqual(id, 2);
    }
    
  }
  
}).addBatch({
  
  'PostgreSQL::query': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      // sql
      multi.query({sql: util.format('SELECT * FROM %s', table)});
      
      // sql + params
      multi.query({
        sql: util.format('SELECT * FROM %s WHERE id=$1', table),
        params: [2]
      });
      
      // sql + params + appendSql
      multi.query({
        sql: util.format('SELECT id,username FROM %s WHERE id=$1 OR id=1', table),
        params: [2],
        appendSql: 'ORDER BY id DESC'
      });
      
      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Returns valid results': function(results) {
      var q1 = results[0][0],
          q2 = results[1][0],
          q3 = results[2][0];
      assert.strictEqual(q1.length, 2);
      assert.strictEqual(q1[0].id, 1);
      assert.strictEqual(q1[1].id, 2);
      assert.deepEqual(Object.keys(q1[0]), ['id', 'username', 'password']);
      assert.strictEqual(q2.length, 1);
      assert.strictEqual(q2[0].id, 2);
      assert.deepEqual(Object.keys(q2[0]), ['id', 'username', 'password']);
      assert.strictEqual(q3.length, 2);
      assert.strictEqual(q3[0].id, 2);
      assert.strictEqual(q3[1].id, 1);
      assert.deepEqual(Object.keys(q3[0]), ['id', 'username']);
    }
    
  }
  
}).addBatch({
  
  'PostgreSQL::queryWhere': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      // cond + params + table
      multi.queryWhere({
        condition: 'id=$1',
        params: [1],
        table: table
      });
      
      // cond + table
      multi.queryWhere({
        condition: 'id=1',
        table: table
      });
      
      // cond + table + columns
      multi.queryWhere({
        condition: 'id=1',
        table: table,
        columns: 'username'
      });
      
      // cond + table + columns + appendSql
      multi.queryWhere({
        condition: 'id in (1,2)',
        table: table,
        columns: 'username',
        appendSql: 'ORDER BY id ASC'
      });
      
      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Returns valid results': function(results) {
      var q1 = results[0][0],
          q2 = results[1][0],
          q3 = results[2][0],
          q4 = results[3][0];
      assert.strictEqual(q1.length, 1);
      assert.strictEqual(q1[0].id, 1);
      assert.deepEqual(Object.keys(q1[0]), ['id', 'username', 'password']);
      assert.strictEqual(q2.length, 1);
      assert.strictEqual(q2[0].id, 1);
      assert.deepEqual(Object.keys(q2[0]), ['id', 'username', 'password']);
      assert.strictEqual(q3.length, 1);
      assert.strictEqual(q3[0].username, 'username');
      assert.deepEqual(Object.keys(q3[0]), ['username']);
      assert.strictEqual(q4.length, 2);
      assert.deepEqual(q4, [{username: 'username'}, {username: 'user1'}]);
    }
    
  }
  
}).addBatch({
  
  'PostgreSQL::queryById': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      // id (array) + table
      multi.queryById({
        id: [1,2],
        table: table
      });
      
      // id + table
      multi.queryById({
        id: 1,
        table: table
      });
      
      // id + table + columns
      multi.queryById({
        id: 1,
        table: table,
        columns: 'id'
      });

      // id (array) + table + columns + appendSql
      multi.queryById({
        id: [1,2],
        table: table,
        columns: 'id, username',
        appendSql: 'ORDER BY username ASC'
      });      
      
      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Returns valid results': function(results) {
      var q1 = results[0][0],
          q2 = results[1][0],
          q3 = results[2][0],
          q4 = results[3][0];
      assert.strictEqual(q1.length, 2);
      assert.strictEqual(q1[0].id, 1);
      assert.strictEqual(q1[1].id, 2);
      assert.strictEqual(q2.length, 1);
      assert.strictEqual(q2[0].id, 1);
      assert.strictEqual(q3.length, 1);
      assert.deepEqual(Object.keys(q3[0]), ['id']);
      assert.strictEqual(q3[0].id, 1);
      assert.strictEqual(q4.length, 2);
      assert.strictEqual(q4[0].id, 2);
      assert.strictEqual(q4[1].id, 1);
      assert.deepEqual(Object.keys(q4[0]), ['id', 'username']);
    }
    
  }
  
}).addBatch({
  
  'PostgreSQL::updateWhere': {
    
    topic: function() {
      var promise = new EventEmitter();

      // condition + table + values
      multi.updateWhere({
        condition: 'id=$1 AND username=$2',
        params: [1, 'username'],
        table: table,
        values: {username: '__user'} // With one value to update and more than one param, confirm that param reordering works
      });

      // condition + params + table + values
      multi.updateWhere({
        condition: 'id=$1',
        params: [1],
        table: table,
        values: {username: '__user1', password: '__pass1'}
      });

      // condition + params + table + values + appendSql
      multi.updateWhere({
        condition: 'id=$1 OR id=$2',
        params: [1, 2],
        table: table,
        values: {username: 'user', password: 'pass'},
        appendSql: 'RETURNING id'
      });

      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });

      return promise;
    },

    'Updates values correctly': function(results) {
      var q1 = results[0],
          q2 = results[1],
          q3 = results[2];
          
      assert.isTrue(q1.command === 'UPDATE' && q1.rowCount === 1);
      assert.isTrue(q2.command === 'UPDATE' && q2.rowCount === 1);
      assert.isTrue(q3.command === 'UPDATE' && q3.rowCount === 2);
      assert.deepEqual(q3.rows, [ { id: 2 }, { id: 1 } ]);
    }
    
  }

}).addBatch({
  
  'PostgreSQL::updateById': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      // id + table + values
      multi.updateById({
        id: 1,
        table: table,
        values: {password: 'p1234'}
      });
      
      // id (array) + table + values + appendSql
      multi.updateById({
        id: [1,2],
        table: table,
        values: {password: 'p9999'},
        appendSql: 'RETURNING id'
      });
      
      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Updates values correctly': function(results) {
      var q1 = results[0],
          q2 = results[1];
      assert.isTrue(q1.command === 'UPDATE' && q1.rowCount === 1);
      assert.isTrue(q2.command === 'UPDATE' && q2.rowCount === 2);
      assert.deepEqual(q2.rows, [ { id: 2 }, { id: 1 } ]);
    }
    
  }
  
}).addBatch({
  
  'PostgreSQL::deleteWhere': {

    topic: function() {
      var promise = new EventEmitter();

      // Insert 2 more entries
      multi.insertInto({table: table, values: {username: 'user3', password: 'pass3'}});
      multi.insertInto({table: table, values: {username: 'user4', password: 'pass4'}});

      // condition + table
      multi.deleteWhere({
        condition: 'id=4',
        table: table
      });
      
      // condition + params + table
      multi.deleteWhere({
        condition: 'id=$1',
        params: [3],
        table: table
      });
      
      // condition + params + table + appendSql
      multi.deleteWhere({
        condition: 'id=$1 OR id=$2',
        params: [1, 2],
        table: table,
        appendSql: 'RETURNING id'
      });

      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Properly deletes values': function(results) {
      // Note: The first two insert the new entries
      var q1 = results[2],
          q2 = results[3],
          q3 = results[4];
      assert.isTrue(q1.command === 'DELETE' && q1.rowCount === 1);
      assert.isTrue(q2.command === 'DELETE' && q2.rowCount === 1);
      assert.isTrue(q3.command === 'DELETE' && q3.rowCount === 2);
      assert.deepEqual(q3.rows, [ { id: 2 }, { id: 1 } ]);
    }
    
  }
  
}).addBatch({
  
  'PostgreSQL::deleteById': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      // Insert 2 more entries
      multi.insertInto({table: table, values: {username: 'user5', password: 'pass5'}});
      multi.insertInto({table: table, values: {username: 'user6', password: 'pass6'}});
      
      // id + table
      multi.deleteById({
        id: 2, // Present from previous batches
        table: table
      });
      
      // id (array) + table + appendSql
      multi.deleteById({
        id: [5,6,99],
        table: table,
        appendSql: 'RETURNING id'
      });
      
      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Properly deletes values': function(results) {
      // Note: The first two insert the new entries
      var q1 = results[2],
          q2 = results[3];
          
      assert.isTrue(q1.command === 'DELETE' && q1.rowCount === 0);
      assert.isTrue(q2.command === 'DELETE' && q2.rowCount === 2); // We're returning on the appendSql option
      
    }
    
  }
  
}).addBatch({
  
  'MySQL::queryCached': {
    
    topic: function() {
      
      var promise = new EventEmitter();
      
      // ################### QUERY CACHING TESTS [DRIVER] #####################
      
      // Insert user1 + invalidate existing cache
      multi.queryCached({
        cacheInvalidate: 'test_user_query',
      }, 'insertInto', {
        table: table,
        values: { username: 'test_user1', password: 'pass_user1' }
      });
      
      // Retrieve user 1 + store 'test_user_query' cache with only user1
      multi.queryCached({
        cacheID: 'test_user_query'
      }, 'queryWhere', {
        condition: '1=1',
        table: table,
        appendSql: 'ORDER BY username'
      });
      
      // Insert user2
      multi.insertInto({
        table: table,
        values: { username: 'test_user2', password: 'pass_user2' }
      });
      
      // Retrieve 'test_user_query' cache => Should return only user1, since it's returning from cache
      multi.queryCached({
        cacheID: 'test_user_query'
      }, 'queryWhere', {
        condition: '1=1',
        table: table,
        appendSql: 'ORDER BY username'
      });
      
      // Insert user3 + invalidate 'test_user_query' cache
      multi.queryCached({
        cacheInvalidate: 'test_user_query',
      }, 'insertInto', {
        table: table,
        values: { username: 'test_user3', password: 'pass_user3' }
      });
      
      // Retrieve 'test_user_query' cache => cache has been invalidated
      // New query should return test_user1, test_user2 and test_user3
      // Also, the query should set the timeout for 'test_user_query' to 3600 seconds
      multi.queryCached({
        cacheID: 'test_user_query',
        cacheTimeout: 3600
      }, 'queryWhere', {
        condition: '1=1',
        table: table,
        appendSql: 'ORDER BY username'
      });
      
      // ################### QUERY CACHING TESTS [DRIVER] #####################
      
      multi.exec(function(err, results) {
        
        promise.emit('success', err || results);
        
      });
      
      return promise;
      
    },
    
    'Properly stores/retrieves/invalidates caches': function(results) {
      
      var r1 = results[0],
          r2 = results[1],
          r3 = results[2],
          r4 = results[3],
          r5 = results[4],
          r6 = results[5];
          
      // Insert user1 + invalidate existing cache
      assert.equal(r1[0], 7);
      assert.equal(r1[1].rowCount, 1);
      
      // Retrieve user 1 + store 'test_user_query' cache with only user1
      assert.instanceOf(r2, Array);
      assert.equal(r2.length, 2);
      assert.instanceOf(r2[0], Array);
      assert.equal(r2[0].length, 1);
      assert.isTrue(r2[0][0].username == 'test_user1' && r2[0][0].password == 'pass_user1');
      
      // Insert user2
      assert.equal(r3[0], 8);
      assert.equal(r3[1].rowCount, 1);
      
      // Retrieve 'test_user_query' cache => Should return only user1, since it's returning from cache
      assert.instanceOf(r4, Array);
      assert.equal(r4.length, 2);
      assert.instanceOf(r4[0], Array);
      assert.equal(r4[0].length, 1);
      assert.isTrue(r4[0][0].username == 'test_user1' && r4[0][0].password == 'pass_user1');

      // Insert user3 + invalidate 'test_user_query' cache
      assert.equal(r5[0], 9);
      assert.equal(r5[1].rowCount, 1);
      
      // Retrieve 'test_user_query' cache => cache has been invalidated
      // New query should return test_user1, test_user2 and test_user3
      assert.instanceOf(r6, Array);
      assert.equal(r6.length, 2);
      assert.instanceOf(r6[0], Array);
      assert.equal(r6[0].length, 3);
      assert.isTrue(r6[0][0].username == 'test_user1' && r6[0][0].password == 'pass_user1');
      assert.isTrue(r6[0][1].username == 'test_user2' && r6[0][1].password == 'pass_user2');
      assert.isTrue(r6[0][2].username == 'test_user3' && r6[0][2].password == 'pass_user3');
    }
    
  }
  
}).addBatch({
  
  'Model API Compliance + Caching': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      // Create model
      model = new TestModel();
      
      // Prepare model (initialize)
      model.prepare(app);
      
      // Override model context (not using className to detect context)
      model.context = config.table;
      
      // Set modelBatch's closure vars (setter)
      modelBatch.model = model;
      
      // Start with a clean table
      pclient.query('DROP TABLE ' + table);
      pclient.query(createTable);
      
      pclient.exec(function(err, results) {
        promise.emit('success', err || model);
      });
      
      return promise;
    },
    
    'Created testing model': function(model) {
      assert.instanceOf(model, TestModel);
    }
    
  }
  
});

// Model API Tests
modelBatch.forEach(function(test) {
  batch = batch.addBatch(test);
});

batch.export(module);
