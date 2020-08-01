var assert        = require('assert')
  , fs            = require('fs')
  , path          = require('path')
  , net           = require('net')
  , child_process = require('child_process')
  , util          = require('util')
  , carrier       = require('carrier');
  
var DB_PATH = __dirname + '/../../tmp/db';

var USERS = {
    1: {name: 'Pedro', age: 35, sex: 'm'}
  , 2: {name: 'John', age: 32, sex: 'm'}
  , 3: {name: 'Bruno', age: 28, sex: 'm'}
  , 4: {name: 'Sandra', age: 35, sex: 'f'}
  , 5: {name: 'Patricia', age: 42, sex: 'f'}
  , 6: {name: 'Joana', age: 29, sex: 'f'}
  , 7: {name: 'Susana', age: 30, sex: 'f'}
};

var USER_COUNT = 7;

module.exports.setup = function(next) {
  (function removeFilesUnder(dir) {
    if (path.existsSync(dir)) {
      fs.readdirSync(dir).forEach(function(path) {
        var path = dir + '/' + path;
        var stat = fs.statSync(path);
        if (stat.isFile()) {
          fs.unlinkSync(path);
        } else {
          removeFilesUnder(path);
          fs.rmdirSync(path);
        }
      });
    }
  })(DB_PATH);
  next();
};

var child, master;

process.on('uncaughtException', function(excp) {
  if (excp.message || excp.name) {
    if (excp.name) process.stdout.write(excp.name);
    if (excp.message) process.stdout.write(excp.message);
    if (excp.backtrace) process.stdout.write(excp.backtrace);
    if (excp.stack) process.stdout.write(excp.stack);
  } else {
    var util = require('util');
    process.stdout.write(util.inspect(excp));    
  }
  process.stdout.write("\n");
});


module.exports.run = function(next) {
  
  if (!process.env._TEST_MASTER) {
    // spawn master and mock slave

    var timeout = setTimeout(function() {
      assert.ok(false, 'timeout');
    }, 20000);
    
    var args = process.argv;
    var command = args.splice(0, 1)[0];
    var env = process.env;
    var exiting = false;
    
    env._TEST_MASTER = 'master';
    master = child_process.spawn(command, args, {env: env})
    
    var data_outer = function(data) {
      console.log(data.toString('utf8'));
    };
    master.stdout.on('data', data_outer);
    master.stderr.on('data', data_outer);
    master.on('exit', function() {
      master = undefined;
      assert.ok(exiting, 'master died');
    });

    env._TEST_MASTER = 'slave';
    child = child_process.spawn(command, args, {env: env})
    child.stdout.on('data', data_outer);
    child.stderr.on('data', data_outer);
    
    child.on('exit', function() {
      exiting = true;
      master.kill();
      clearTimeout(timeout);
      child = undefined;
      next();
    });
    child.stderr.on('data', function(data) {
      console.log(data.toString('utf8'));
    });
    
  } else {

    if (process.env._TEST_MASTER == 'master') {
      var alfred = require('../../lib/alfred');

      var timeout = setTimeout(function() {
        next(new Error('timeout'));
      }, 10000);

      alfred.open(DB_PATH, {replication_master: true}, function(err, db) {
        if (err) { next(err); return; }
        setTimeout(function() {
          db.ensure_key_map_attached('users', null, function(err) {
            if (err) { next(err); return;}

            var age_transform_function = function(user) {
              return user.age;
            };

            var sex_transform_function = function(user) {
              return user.sex;
            };

            db.users.ensureIndex('sex', {ordered: true}, sex_transform_function, function(err) {
              if (err) { next(err); return; }
              db.users.ensureIndex('age', {ordered: true}, age_transform_function, function(err) {
                if (err) { next(err); return; }
                
                var users_in = 0;
                for (var id in USERS) {
                  if (USERS.hasOwnProperty(id)) {
                    (function(id) {
                      var user = USERS[id];
                      db.users.put(id, user, function(err) {
                        if (err) { next(err); return; }
                        users_in ++;
                        if (users_in == USER_COUNT) {
                          // all users done
                          
                          setTimeout(function() {
                            var more_users_count = 0;
                            for(var id in USERS) {
                              if (USERS.hasOwnProperty(id)) {
                                (function(id) {
                                  var user = USERS[id];
                                  user.rndm = id;
                                  db.users.put(id, user, function(err) {
                                    if (err) { next(err); return; }
                                    more_users_count ++;
                                    if (more_users_count == USER_COUNT) {
                                    }
                                  });
                                })(id);
                              }
                            }
                          }, 2000);
                        }
                      });
                    })(id);
                  }
                }
              });
            });
          })
          
        }, 1000);
      });
      
    } else {
      // mock-slave
      var expected_objects = [
        { m: 'meta',
        command: 'attach_key_map',
        arguments: [ 'users', { cache_slots: 1000 }, ],
        __log_pos: 1}

      , { m: 'meta',
        command: 'add_index',
        arguments: 
         [ 'users',
           'sex',
           { bplustree_order: 100, ordered: true },
           'function (user) {\n              return user.sex;\n            }' ],
        __log_pos: 2}

      , { m: 'meta',
        command: 'add_index',
        arguments: 
         [ 'users',
           'age',
           { bplustree_order: 100, ordered: true },
           'function (user) {\n              return user.age;\n            }' ],
        __log_pos: 3}

      ,{ m: 'users',
        k: '1',
        v: { name: 'Pedro', age: 35, sex: 'm' },
        __log_pos: 4}
      ,{ m: 'users',
        k: '2',
        v: { name: 'John', age: 32, sex: 'm' },
        __log_pos: 5}
      ,{ m: 'users',
        k: '3',
        v: { name: 'Bruno', age: 28, sex: 'm' },
        __log_pos: 6}
      ,{ m: 'users',
        k: '4',
        v: { name: 'Sandra', age: 35, sex: 'f' },
        __log_pos: 7}
      , { m: 'users',
        k: '5',
        v: { name: 'Patricia', age: 42, sex: 'f' },
        __log_pos: 8}
      , { m: 'users',
        k: '6',
        v: { name: 'Joana', age: 29, sex: 'f' },
        __log_pos: 9}
      , { m: 'users',
        k: '7',
        v: { name: 'Susana', age: 30, sex: 'f' },
        __log_pos: 10}
      , { m: 'users',
        k: '1',
        v: { name: 'Pedro', age: 35, sex: 'm', rndm: '1' },
        __log_pos: 11}
      , { m: 'users',
        k: '2',
        v: { name: 'John', age: 32, sex: 'm', rndm: '2' },
        __log_pos: 12}
      , { m: 'users',
        k: '3',
        v: { name: 'Bruno', age: 28, sex: 'm', rndm: '3' },
        __log_pos: 13}
      , { m: 'users',
        k: '4',
        v: { name: 'Sandra', age: 35, sex: 'f', rndm: '4' },
        __log_pos: 14}
      , { m: 'users',
        k: '5',
        v: { name: 'Patricia', age: 42, sex: 'f', rndm: '5' },
        __log_pos: 15}
      , { m: 'users',
        k: '6',
        v: { name: 'Joana', age: 29, sex: 'f', rndm: '6' },
        __log_pos: 16}
      , { m: 'users',
        k: '7',
        v: { name: 'Susana', age: 30, sex: 'f', rndm: '7' },
        __log_pos: 17}
      ];
      
      var records = [];
      
      var sendJSON = function(stream, data) {
        stream.write(JSON.stringify(data) + "\n");
      };
      
      var timeout = setTimeout(function() {
        next(new Error('timeout'));
        return;
      }, 10000);
      
      setTimeout(function() {
        var conn = net.createConnection(5293);
        
        conn.on('error', function(err) {
          next(err);
        });
        
        conn.on('connect', function() {
          sendJSON(conn, {command: 'sync'});
          
          var result_count = 0;
          
          carrier.carry(conn, function(line) {
            var obj = JSON.parse(line);
            if ('error' in obj) {
              next(new Error('Error from master: ' + obj.error));
              return;
            }
            delete obj['__logger_id'];
            assert.deepEqual(expected_objects[result_count], obj);
            result_count ++;
            if (result_count == expected_objects.length) {
              clearTimeout(timeout);
              next();
            }
          });

        });
        

      }, 2000);
    }

  }

};

module.exports.teardown = function() {
  if (master) {
    master.kill();
  }
  master = undefined;
  if (child) {
    child.kill();
  }
  child = undefined;
};