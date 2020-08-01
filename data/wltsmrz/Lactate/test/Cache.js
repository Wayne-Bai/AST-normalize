
var should  = require('should');
var Lactate = require('../lib/lactate');
var http    = require('./utils/http_utils');
var files   = require('./utils/get_files');

describe('Cache', function() {

  var DIR = __dirname + '/files/';

  afterEach(http.stopServer);

  describe('#cache:{}', function() {
    it('Should cache file', function(done) {
      var options = { cache:{} };
      var dir = Lactate.dir(DIR, options);
      var file = 'index.html';
      var size = files[file];
      var url = '/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 10, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.should.have.status(200)
        res.headers.should.have.property('content-type', 'text/html; charset=UTF-8');
        res.headers.should.have.property('content-encoding', 'gzip')
        res.headers.should.have.property('content-length', String(size));
        res.headers.should.have.property('date')
        res.headers.should.have.property('last-modified')
        res.headers.should.have.property('cache-control');
        data.should.have.property('length', size);
        done();
      })
    })
  })
  
  describe('#cache:{expire:0}', function() {
    it('Should cache file', function(done) {
      var options = { cache:{ expire:0 } };
      var dir = Lactate.dir(DIR, options);
      var file = 'index.html';
      var size = files[file];
      var url = '/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 10, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.should.have.status(200)
        res.headers.should.have.property('content-type', 'text/html; charset=UTF-8');
        res.headers.should.have.property('content-encoding', 'gzip')
        res.headers.should.have.property('content-length', String(size));
        res.headers.should.have.property('date')
        res.headers.should.have.property('last-modified')
        res.headers.should.have.property('cache-control');
        data.should.have.property('length', size);
        done();
      })
    })
  })

  describe('#cache:{max_keys:0}', function() {
    it('Should not cache file', function(done) {
      var options = { cache:{ max_keys:0 } };
      var dir = Lactate.dir(DIR, options);
      var file = 'index.html';
      var size = files[file];
      var url = '/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 10, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.should.have.status(200)
        res.headers.should.have.property('content-type', 'text/html; charset=UTF-8');
        res.headers.should.have.property('content-encoding', 'gzip')
        res.headers.should.have.property('date')
        res.headers.should.have.property('last-modified')
        res.headers.should.have.property('cache-control');
        data.should.have.property('length', size);
        done();
      })
    })
  })

  describe('#cache:{max_size:0}', function() {
    it('Should not cache file', function(done) {
      var options = { cache:{ max_size:0 } };
      var dir = Lactate.dir(DIR, options);
      var file = 'index.html';
      var size = files[file];
      var url = '/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 10, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.should.have.status(200)
        res.headers.should.have.property('content-type', 'text/html; charset=UTF-8');
        res.headers.should.have.property('content-encoding', 'gzip')
        res.headers.should.have.property('date')
        res.headers.should.have.property('last-modified')
        res.headers.should.have.property('cache-control');
        data.should.have.property('length', size);
        done();
      })
    })
  })

// Run redis-server and uncomment
  
//  describe('#cache:{redis:true}', function() {
//    it('Should cache file', function(done) {
//      var options = { cache:{ redis:true } };
//      var dir = Lactate.dir(DIR, options);
//      var file = 'index.html';
//      var size = files[file];
//      var url = '/' + file;
//      http.server(dir.serve.bind(dir));
//      http.client(url, 10, function(err, res, data) {
//        should.not.exist(err);
//        should.exist(res);
//        should.exist(data);
//        res.should.have.status(200)
//        res.headers.should.have.property('content-type', 'text/html; charset=UTF-8');
//        res.headers.should.have.property('content-encoding', 'gzip')
//        res.headers.should.have.property('content-length', String(size));
//        res.headers.should.have.property('date')
//        res.headers.should.have.property('last-modified')
//        res.headers.should.have.property('cache-control');
//        data.should.have.property('length', size);
//        done();
//      })
//    })
//  })

})

