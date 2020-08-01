
var app = require('../fixtures/bootstrap'),
    vows = require('vows'),
    assert = require('assert'),
    Multi = require('multi'),
    EventEmitter = require('events').EventEmitter;
    
var multi = new Multi(app);

multi.on('pre_exec', app.backupFilters);
multi.on('post_exec', app.restoreFilters);

vows.describe('Cookie Parser (middleware)').addBatch({
  
  'Cookie Operations': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      app.use('cookie_parser');

      // OutgoingMessage::setCookie
      multi.curl('-i /setcookie/user/john');
      multi.curl('-i -G -d "domain=example.com" /setcookie/user/john');
      multi.curl('-i -G -d "domain=example.com&path=/test&expires=3600" /setcookie/user/john');
      multi.curl('-i -G -d "domain=example.com&path=/test&expires=3600&httpOnly=1" /setcookie/user/john');
      multi.curl('-i -G -d "domain=example.com&path=/test&expires=3600&httpOnly=1&secure=1" /setcookie/user/john');
      
      // OutgoingMessage::removeCookie
      multi.curl('-i /removecookie/user');
      
      // OutgoingMessage::removeCookies
      multi.curl('-i /removecookies/user-email-info');
      
      // OutgoingMessage::hasCookie
      multi.curl('--cookie "user=john" /hascookie/user');
      
      // OutgoingMessage::getCookie
      multi.curl('--cookie "id=24" /getcookie/id');
      
      // Get cookie with cookieDomain
      multi.curl('-i /getcookie-with-cookiedomain');
      
      multi.exec(function(err, results) {
        app.restoreFilters();
        promise.emit('success', err || results.map(function(r) {
          return r.trim().split(/\r\n/);
        }));
      });
  
      return promise;
    },
    
    'OutgoingMessage::setCookie works w/o options': function(results) {
      var r = results[0];
      assert.isTrue(r.indexOf('Set-Cookie: user=john; path=/') >= 0);
    },
    
    'OutgoingMessage::setCookie works w/domain': function(results) {
      var r = results[1];
      assert.isTrue(r.indexOf('Set-Cookie: user=john; domain=example.com; path=/') >= 0)
    },
    
    'OutgoingMessage::setCookie works w/domain + path': function(results) {
      var r = results[2];
      assert.isTrue(r.indexOf('Set-Cookie: user=john; domain=example.com; path=/test') >= 0)
    },
    
    'OutgoingMessage::setCookie works w/domain + path + httpOnly': function(results) {
      var r = results[3];
      assert.isTrue(r.indexOf('Set-Cookie: user=john; domain=example.com; path=/test; httpOnly') >= 0)
    },
    
    'OutgoingMessage::setCookie works w/domain + path + httpOnly + secure': function(results) {
      var r = results[4];
      assert.isTrue(r.indexOf('Set-Cookie: user=john; domain=example.com; path=/test; httpOnly; secure') >= 0)
    },
    
    'OutgoingMessage::removeCookie works properly': function(results) {
      var res = results[5];
      
      for (var r, i=0; i < res.length; i++) {
        r = res[i];
        if (r.indexOf('Set-Cookie: user=null; path=/; expires=') === 0) break;
      }
     
      var date = Date.parse(r.split('=').pop());
      var expired = date < Date.now();
      
      assert.isFalse(isNaN(date));
      assert.isTrue(expired);
    },
    
    'OutgoingMessage::removeCookies works properly': function(results) {
      var r = results[6],
          cookies = ['user', 'email', 'info'],
          cRegex = /^Set\-Cookie: (user|email|info)=null; path=\/; expires=/;
      
      r.map(function(h) {
        var match = h.match(cRegex);
        if (match) {
          assert.isTrue(cookies.indexOf(match[1]) >= 0);
          var date = Date.parse(h.split('=').pop());
          var expired = date < Date.now();
          assert.isFalse(isNaN(date));
          assert.isTrue(expired);
        }
      });
    },
    
    'OutgoingMessage::hasCookie detects cookie': function(results) {
      var r = results[7];
      assert.deepEqual(r, ['YES']);
    },
    
    'OutgoingMessage::getCookie retrieves cookie value': function(results) {
      var r = results[8];
      assert.deepEqual(r, ['24']);
    },
    
    'Overrides domain with app.cookieDomain when not null': function(results) {
      var r = results[9];
      assert.equal(r[1], "Set-Cookie: custom=hello; domain=example.com; path=/");
    }
    
  }
  
}).export(module);
