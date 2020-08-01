
var should  = require('should');
var Lactate = require('../lib/lactate');
var http    = require('./utils/http_utils');
var files   = require('./utils/get_files');

describe('Minify', function() {

  var DIR = __dirname + '/files/';

  afterEach(http.stopServer);

  const dir = Lactate.dir(DIR, { minify:true });
  const size = files['script.min.js'];
  const url = '/script.js';

  describe('#serve(script.js)', function() {
    it('Should not err', function(done) {
      http.server(dir.serve.bind(dir));
      http.client(url, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        done();
      })
    })
    it('Should have status 200', function(done) {
      http.server(dir.serve.bind(dir));
      http.client(url, function(err, res, data) {
        res.should.have.status(200)
        done();
      })
    })
    it('Should have content-type header', function(done) {
      http.server(dir.serve.bind(dir));
      http.client(url, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('content-type', 'text/javascript; charset=UTF-8');
        done();
      })
    })
    it('Should have content-encoding header', function(done) {
      http.server(dir.serve.bind(dir));
      http.client(url, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('content-encoding', 'gzip')
        done();
      })
    })
    it('Should have content-length header', function(done) {
      http.server(dir.serve.bind(dir));
      http.client(url, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('content-length', String(size));
        done();
      })
    })
    it('Should have date header', function(done) {
      http.server(dir.serve.bind(dir));
      http.client(url, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('date')
        done();
      })
    })
    it('Should have last-modified header', function(done) {
      http.server(dir.serve.bind(dir));
      http.client(url, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('last-modified')
        done();
      })
    })
    it('Should have cache-control header', function(done) {
      http.server(dir.serve.bind(dir));
      http.client(url, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('cache-control');
        done();
      })
    })
    it('Should serve complete data', function(done) {
      http.server(dir.serve.bind(dir));
      http.client(url, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        data.should.have.property('length', size);
        done();
      })
    })
  })
})

