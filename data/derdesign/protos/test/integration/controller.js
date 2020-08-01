
var app = require('../fixtures/bootstrap'),
    vows = require('vows'),
    assert = require('assert'),
    util = require('util'),
    Multi = require('multi'),
    http = require('http'),
    EventEmitter = require('events').EventEmitter;

var _ = require('underscore');
    
var multi = new Multi(app),
    controllerCtor = app.controller.constructor,
    httpMethods = app.controller.httpMethods;

var total = 0; // counter for controller tests

var CONTROLLER_TESTS = false;

multi.on('pre_exec', app.backupFilters);
multi.on('post_exec', app.restoreFilters);

var IncomingMessage = http.IncomingMessage;
var ServerResponse = http.ServerResponse;

var controllers = [], paramsData = [], totalControllerRequests = 0;

app.on('controller_request', function(req, res, params) {
  
  if (CONTROLLER_TESTS) {
    
    totalControllerRequests++;
    if (req.constructor !== IncomingMessage) throw new Error("Bad data passed by controller_request event");
    if (res.constructor !== ServerResponse) throw new Error("Bad data passed by controller_request event");
    if (Object.keys(params).length) paramsData.push(params);
    controllers.push(req.__controller.constructor.name);
    
    if (req.url === '/controller-request-event') {
      res.statusCode = 404;
      res.json({
        success: true,
        reason: "The controller_route event accepts req.stopRoute() calls"
      });
      req.stopRoute();
    }
    
  }
});

// Automatically add requets url in headers (for debugging purposes)
app.config.headers['X-Request-Url'] = function(req, res) {
  return req.url;
}

// Automatically add request method in headers (for debugging purposes)
app.config.headers['X-Request-Method'] = function(req, res) {
  return req.method;
}

function assert200(r, k, t) {
  assert.isTrue(r.indexOf('HTTP/1.1 200 OK') >= 0);
  assert.isTrue(r.indexOf(util.format('{%s}', k)) >= 0);
}

function assert404(r, k, t) {
  assert.isTrue(r.indexOf('HTTP/1.1 404 Not Found') >= 0);
  assert.isTrue(r.indexOf('<p>HTTP/404: Page not Found</p>') >= 0);
}

function assert405(r, k, t) {
  assert.isTrue(r.indexOf('HTTP/1.1 405 Method Not Allowed') >= 0);
  assert.isFalse(r.indexOf(util.format('{%s}', k)) >= 0);
}

function testRouteMethod(tmethod, rfunc) {
  for (var expRes, method, i=0; i < httpMethods.length; i++) {
    method = httpMethods[i];
    expRes = (method == tmethod) ? 200 : (tmethod != 'GET' && method == 'GET') ? 404 : 405;
    
    // console.log([tmethod, method, expRes]);
    
    multi.curl(util.format('-i -X %s /test/%s', method, rfunc));
    
    (function(k, t, cm, rm, er) { // k => key, t => total, cm => current method,   rm => route method, n => numeric response
      currentBatch[util.format('Controller::%s responds w/%d for %s requests', k, er, cm)] = function(results) {
        
        // console.log([k, er, cm]);
        
        var r = results[t];
        
        // console.log(r);
        
        switch(er) {
          case 200: assert200(r, k, t); break;
          case 404: assert404(r, k, t); break;
          case 405: assert405(r, k, t); break;
          default:
            throw new Error("Response not expected: " + er);
            // break;
        }
      }
    })(rfunc, total++, method, tmethod, expRes);
  }
}

// TEST AUTOMATION [START] --

function automateVowsBatches() {
  
  controllerCtor.prototype.routeMethods.forEach(function(m) {
    var method;
    if (m != 'super_' && controllerCtor.hasOwnProperty(m) && (method=controllerCtor[m]) instanceof Function ) {
      var hm = m.slice(m.lastIndexOf('_') + 1).toUpperCase();
      testRouteMethod(hm, m);
    }
  });
}

// TEST AUTOMATION [END] --

var batch = {};
var currentBatch = batch['Route Functions (sessions not enabled)'] = {
  
  topic: function() {
    
    var promise = new EventEmitter();
    
    // Disable sessions
    app.supports.session = false;
    delete app.session;
    
    multi.exec(function(err, results) {
      promise.emit('success', err || results);
    });
    
    return promise;
  }
  
}

automateVowsBatches(); // Creates the nifty automated tests

// console.exit(batch);

vows.describe('Application Controllers').addBatch(batch).addBatch({
  
  'Integrity Checks': {
    
    topic: function() {
      
      CONTROLLER_TESTS = true;
      
      var promise = new EventEmitter();

      multi.curl('/request-integrity');
      
      multi.exec(function(err, results) {
        promise.emit('success', err || results[0].trim());
      });
      
      return promise;
      
    },
    
    'Controller can be accessed via request and response': function(buf) {
      assert.strictEqual(buf, '1');
    }
    
  }
  
}).addBatch({
  
  'Controller Validation: GET': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      // Parameter validation: valid 
      multi.curl('-i /test/qstring/abcde');
      
      // Parameter validation: invalid
      multi.curl('-i /test/qstring/12346');
      
      // Query String values + no param validation
      multi.curl('-i -G -d "alpha=1&bravo=2&charlie=3" /test/qstring');
      
      // Query String values + param validation
      multi.curl('-i -G -d "alpha=4&bravo=5&charlie=6" /test/qstring/abc/123');
      
      // Query string values on all methods
      multi.curl('-i -G -d "test=true" /test/qstring');
      multi.curl('-X POST -i -G -d "test=true" /test/qstring');
      multi.curl('-X PUT -i -G -d "test=true" /test/qstring');
      multi.curl('-X DELETE -i -G -d "test=true" /test/qstring');
      multi.curl('-X OPTIONS -i -G -d "test=true" /test/qstring');
      multi.curl('-X TRACE -i -G -d "test=true" /test/qstring');
      
      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Responds w/200 on valid route parameters': function(results) {
      var r = results[0];
      assert.isTrue(r.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r.indexOf("{ rule1: 'abcde' }") >= 0);
    },
    
    'Responds w/404 on invalid route parameters': function(results) {
      var r = results[1];
      assert.isTrue(r.indexOf('HTTP/1.1 404 Not Found') >= 0);
    },
    
    'Detects query string values when not validating routes': function(results) {
      var r = results[2];
      assert.isTrue(r.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r.indexOf("{ alpha: '1', bravo: '2', charlie: '3' }") >= 0);
    },
    
    'Detects query string values when validating routes': function(results) {
      var r = results[3];
      assert.isTrue(r.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r.indexOf("{ rule1: 'abc', rule2: '123' } { alpha: '4', bravo: '5', charlie: '6' }") >= 0);
    },
    
    'Properly parses query string on all requests': function(results) {
      var get = results[4],
          post = results[5],
          put = results[6],
          del = results[7],
          opts = results[8],
          trace = results[9];
      
      var expected = "{ test: 'true' }";
      
      assert.isTrue(get.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(get.indexOf(expected) >= 0);
      
      assert.isTrue(post.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(post.indexOf(expected) >= 0);
      
      assert.isTrue(put.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(put.indexOf(expected) >= 0);
      
      assert.isTrue(del.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(del.indexOf(expected) >= 0);
      
      assert.isTrue(opts.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(opts.indexOf(expected) >= 0);
      
      assert.isTrue(trace.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(trace.indexOf(expected) >= 0);
      
    }

  }
  
}).addBatch({
  
  'Controller Filters': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      // Routes blocked by filters
      multi.curl('-i /filter/bad-route-1');
      multi.curl('-i /filter/bad-route-2');
      
      // Normal route with params (should not be blocked by filters)
      multi.curl('-i /filter/greeting/ernie');
      
      // Should not conflict with route resolution
      multi.curl('-i /filter/404');
      
      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Filters can block route callbacks': function(results) {
      var r1 = results[0],
          r2 = results[1];
      assert.isTrue(r1.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r1.indexOf('{BAD ROUTE 1}') >= 0);
      assert.isTrue(r2.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r2.indexOf('{BAD ROUTE 2}') >= 0);
    },
    
    'Filter chain works properly': function(results) {
      var r = results[2];
      assert.isTrue(r.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r.indexOf('{Hello ernie}') >= 0);
    },
    
    "Filters don't conflict with route resolution": function(results) {
      var r = results[3];
      assert.isTrue(r.indexOf('HTTP/1.1 404 Not Found') >= 0);
    }
    
  }
  
}).addBatch({
  
  'Multiple Route Functions Chain': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      // Should run functions in order
      multi.curl('-i /route-chain-a');
      multi.curl('-i /route-chain-b');
      multi.curl('-i -X POST /route-chain-b');
      multi.curl('-i -X PUT /route-chain-b');
      
      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Runs chained route functions': function(results) {
      var r1 = results[0];
      assert.isTrue(r1.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r1.indexOf('Counter: {-41}') >= 0);
    },
    
    "Runs chained route functions w/ multiple HTTP methods": function(results) {
      var r2 = results[1],
          r3 = results[2],
          r4 = results[3];
      assert.isTrue(r2.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r2.indexOf('Counter: {-41}') >= 0);
      assert.isTrue(r3.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r3.indexOf('Counter: {-41}') >= 0);
      assert.isTrue(r4.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r4.indexOf('Counter: {-41}') >= 0);
    }
    
  }
  
}).addBatch({
  
  'Static Views (directory structure)': {
    
    topic: function() {
      var promise = new EventEmitter();
      
      multi.curl('/category/archive');
      multi.curl('/category/uncategorized/post');
      
      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    "Renders custom paths for static views within directories": function(results) {
      var r1 = results[0];
      var r2 = results[1];
      
      assert.isTrue(r1.indexOf('CATEGORY ARCHIVE') >= 0);
      assert.isTrue(r2.indexOf('THIS IS A POST') >= 0);
    }
    
  }
  
}).addBatch({
  
  'Controller Request Event': {
    
    topic: function() {
      
      var promise = new EventEmitter();
      
      multi.curl('-i /controller-request-event');
      
      multi.exec(function(err, results) {
        CONTROLLER_TESTS = false;
        promise.emit('success', err || results);
      });
      
      return promise;
      
    },
    
    'Routes can be stopped with req.stopRoute()': function(results) {
      var r = results[0];
      assert.isTrue(r.indexOf('HTTP/1.1 404 Not Found') >= 0);
      assert.isTrue(r.indexOf('Content-Type: application/json;charset=utf-8') >= 0);
      assert.isTrue(r.indexOf('{"success":true,"reason":"The controller_route event accepts req.stopRoute() calls"}') >= 0);
      assert.isTrue(r.indexOf('THIS SHOULD NOT RENDER') === -1);
    },
    
    'Properly emits the controller_request event': function() {
      
      controllers = _.unique(controllers).sort();
      
      assert.equal(totalControllerRequests, 18);
      
      assert.deepEqual(_.unique(controllers).sort(), [
        'TestController',
        'MainController',
        'FilterController'
        ].sort());
        
      assert.deepEqual(paramsData, [
        { rule1: 'abcde' },
        { rule1: 'abc', rule2: '123' },
        { name: 'ernie' }
      ]);

    }
    
  }
  
}).export(module);
