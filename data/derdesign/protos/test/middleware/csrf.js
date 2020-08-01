
var app = require('../fixtures/bootstrap.js'),
    vows = require('vows'),
    assert = require('assert'),
    util = require('util'),
    Multi = require('multi'),
    EventEmitter = require('events').EventEmitter;
    
var multi = new Multi(app);

var sessionBackup, sessionSupport, sess, token;

vows.describe('CSRF (middleware)').addBatch({
  
  '': {
    
    topic: function() {
      
      var promise = new EventEmitter();
      
      console.log("    Note: using HTTP/403 as the response for testing purposes (default is HTTP/400).");
      console.log("    This prevents any confusion between the regular HTTP/400 errors and the CSRF ones.\n")
      console.log("    These tests cover req.getQueryData() and req.getPostData() with CSRF tokens.\n");
      
      sessionBackup = app.session;
      sessionSupport = app.supports.session;
      
      app.use('cookie_parser');
      app.use('body_parser');
      app.use('session', {storage: 'redis', guestSessions: true, salt: 'abc1234'});
      app.use('csrf', {
        onFailure: 403
      });

      app.curl('-i /csrf', function(err, buf) {
        if (err) throw err;
        else {
          sess = buf.match(/_sess=(.*?);/)[1];
      
          app.curl(util.format('-i --cookie "_sess=%s" /csrf/test', sess), function(err, buf) {
            if (err) throw err;
            else {
              token = buf.match(/[a-f0-9]{32}/)[0];
              
              /* GET TESTS */
              
              // GET Token absence (400)
              multi.curl(util.format('-i --cookie "_sess=%s" /csrf/check/get', sess));

              // GET Csrf check + invalid token (400)
              multi.curl(util.format('-i --cookie "_sess=%s" -G -d "protect_key=INVALID" /csrf/check/get', sess));
              
              // GET Csrf check + valid token (200)
              multi.curl(util.format('-i --cookie "_sess=%s" -G -d "protect_key=%s" -d "name=ernie" -d "age=29" /csrf/check/get', sess, token));
              
              /* POST TESTS */
              
              // POST Token absence (400)
              multi.curl(util.format('-i -X POST --cookie "_sess=%s" /csrf/check/post', sess));
              
              // POST Csrf check + invalid token (400)
              multi.curl(util.format('-i -X POST --cookie "_sess=%s" -d "protect_key=INVALID" /csrf/check/post', sess));
              
              // POST Csrf check + valid token (200)
              multi.curl(util.format('-i -X POST --cookie "_sess=%s" -d "protect_key=%s" -d "name=ernie" -d "age=29" /csrf/check/post', sess, token));
              
              /* PUT TESTS */
              
              // PUT Token absence (400)
              multi.curl(util.format('-i -X PUT --cookie "_sess=%s" /csrf/check/post', sess));
              
              // POST Csrf check + invalid token (400)
              multi.curl(util.format('-i -X PUT --cookie "_sess=%s" -d "protect_key=INVALID" /csrf/check/post', sess));
              
              // POST Csrf check + valid token (200)
              multi.curl(util.format('-i -X PUT --cookie "_sess=%s" -d "protect_key=%s" -d "name=ernie" -d "age=29" /csrf/check/post', sess, token));
              
              multi.exec(function(err, results) {
                delete app.supports.session;
                promise.emit('success', err || results);
              });
            }
          });
          
        }
      });
      
      return promise;
    },
    
    //////////////// GET
    
    "Responds with HTTP/400 on token absence (GET)": function(results) {
      var r = results[0];
      assert.isTrue(r.indexOf('HTTP/1.1 400 Bad Request') >= 0);
    },
    
    "Responds with HTTP/400 on invalid token (GET)": function(results) {
      var r = results[1];
      assert.isTrue(r.indexOf('HTTP/1.1 400 Bad Request') >= 0);
    },
    
    "Responds with HTTP/200 on valid token (GET)": function(results) {
      var r = results[2];
      var expected = util.format('{"protect_key":"%s","name":"ernie","age":"29"}', token);
      assert.isTrue(r.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r.indexOf(expected) >= 0);
    },
    
    //////////////// POST
    
    "Responds with HTTP/400 on token absence (POST)": function(results) {
      var r = results[3];
      assert.isTrue(r.indexOf('HTTP/1.1 400 Bad Request') >= 0);
    },
    
    "Responds with HTTP/400 on invalid token (POST)": function(results) {
      var r = results[4];
      assert.isTrue(r.indexOf('HTTP/1.1 400 Bad Request') >= 0);
    },
    
    "Responds with HTTP/200 on valid token (POST)": function(results) {
      var r = results[5];
      var expected = util.format('{"protect_key":"%s","name":"ernie","age":"29"}', token);
      assert.isTrue(r.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r.indexOf(expected) >= 0);
    },
    
    //////////////// PUT
    
    "Responds with HTTP/400 on token absence (PUT)": function(results) {
      var r = results[6];
      assert.isTrue(r.indexOf('HTTP/1.1 400 Bad Request') >= 0);
    },
    
    "Responds with HTTP/400 on invalid token (PUT)": function(results) {
      var r = results[7];
      assert.isTrue(r.indexOf('HTTP/1.1 400 Bad Request') >= 0);
    },
    
    "Responds with HTTP/200 on valid token (PUT)": function(results) {
      var r = results[8];
      var expected = util.format('{"protect_key":"%s","name":"ernie","age":"29"}', token);
      assert.isTrue(r.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r.indexOf(expected) >= 0);
    },

  }
  
}).export(module);