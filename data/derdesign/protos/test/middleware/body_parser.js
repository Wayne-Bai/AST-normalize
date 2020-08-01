
var app = require('../fixtures/bootstrap'),
    vows = require('vows'),
    util = require('util'),
    assert = require('assert'),
    Multi = require('multi'),
    EventEmitter = require('events').EventEmitter;

var multi = new Multi(app);

multi.on('pre_exec', app.backupFilters);
multi.on('post_exec', app.restoreFilters);

function successfulUpload(r) {
  assert.isTrue(r.indexOf('HTTP/1.1 100 Continue') >= 0);
  assert.isTrue(r.indexOf('HTTP/1.1 200 OK') >= 0);
  assert.isTrue(r.indexOf(util.format("path: '%s/%s", app.path, app.paths.upload)) >= 0);
  assert.isTrue(r.indexOf("size: 65536") >= 0);
  assert.isTrue(r.indexOf("name: 'file-64.junk'") >= 0);
  assert.isTrue(r.indexOf("type: 'application/octet-stream'") >= 0);
}

function uploadExceedsLimit(r) {
  assert.isTrue(r.indexOf('HTTP/1.1 100 Continue') >= 0);
  assert.isTrue(r.indexOf('Connection: close') >= 0);
  assert.isTrue(r.indexOf('X-Upload-Limit-Exceeded', 'true') >= 0); // Set on 'upload_limit_exceeded' event
  assert.isTrue(r.indexOf('HTTP/1.1 413 Request Entity Too Large') >= 0);
  assert.isTrue(r.indexOf('\n<p>413 Request Entity Too Large</p>\n') >= 0);
}

vows.describe('Body Parser (middleware)').addBatch({
  
  'Request Data': {

    topic: function() {
      
      app.use('body_parser', {
        maxFieldSize: 64 * 1024,  // 64kb
        maxUploadSize: 128 * 1024 // 128kb
      });
      
      // protos.enableDebugger();

      var promise = new EventEmitter();

      multi.curl('-i -X POST -d "name=der" -d "age=29" /test/body-parser/request-data');
      multi.curl('-i -X PUT -d "name=der" -d "age=29" /test/body-parser/request-data');
      
      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });

      return promise;

    },

    'Properly handles POST/PUT Request Fields': function(results) {

      var expected = '{"fields":{"name":"der","age":"29"},"files":{"length":0,"fileKeys":[]}}';

      var r1 = results[0],
          r2 = results[1];
          
      // POST
      assert.isTrue(r1.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r1.indexOf(expected) >= 0);

      // PUT
      assert.isTrue(r2.indexOf('HTTP/1.1 200 OK') >= 0);
      assert.isTrue(r2.indexOf(expected) >= 0);

    }

  }

}).addBatch(app.environment === 'travis' ? {} : { // Disable upload tests on travis environment
  
  'File Uploads': {
    
    topic: function() {
      
      var promise = new EventEmitter();
      
      // Successful file upload (POST)
      multi.curl('-i -X POST -F "file=@test/fixtures/file-64.junk" /test/upload');
      
      // File upload exceeds upload limit (POST)
      multi.curl('-i -X POST -F "file=@test/fixtures/file-512.junk" /test/upload');    
        
      // Successful file upload (PUT)
      multi.curl('-i -X PUT -F "file=@test/fixtures/file-64.junk" /test/upload');
      
      // File upload exceeds upload limit (PUT)
      multi.curl('-i -X PUT -F "file=@test/fixtures/file-512.junk" /test/upload');
      
      multi.exec(function(err, results) {
        promise.emit('success', err || results);
      });
      
      return promise;
    },
    
    'Files are uploaded successfully (POST)': function(results) {
      successfulUpload(results[0]);
    },
    
    'Forbids uploads that exceed maxUploadSize (POST)': function(results) {
      uploadExceedsLimit(results[1]);
    },
    
    'Files are uploaded successfully (PUT)': function(results) {
      successfulUpload(results[2]);
    },
    
    'Forbids uploads that exceed maxUploadSize (PUT)': function(results) {
      uploadExceedsLimit(results[3]);
    }
    
  }
  
}).export(module);
