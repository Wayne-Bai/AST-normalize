
var should  = require('should');
var Lactate = require('../lib/lactate');
var http    = require('./utils/http_utils');
var files   = require('./utils/get_files');

describe('Directory', function() {

  const DIR = __dirname + '/files/';

  afterEach(http.stopServer);

  describe('#serve(index.html)', function() {
    it('Should not err', function(done) {
      const dir = Lactate.dir(DIR);
      const file = 'index.html';
      const size = files[file];
      const url = '/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        done();
      })
    })
    it('Should have status 200', function(done) {
      const dir = Lactate.dir(DIR);
      const file = 'index.html';
      const size = files[file];
      const url = '/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.should.have.status(200)
        done();
      })
    })
    it('Should have content-type header', function(done) {
      const dir = Lactate.dir(DIR);
      const file = 'index.html';
      const size = files[file];
      const url = '/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('content-type', 'text/html; charset=UTF-8');
        done();
      })
    })
    it('Should have content-encoding header', function(done) {
      const dir = Lactate.dir(DIR);
      const file = 'index.html';
      const size = files[file];
      const url = '/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('content-encoding', 'gzip')
        done();
      })
    })
    it('Should have content-length header', function(done) {
      const dir = Lactate.dir(DIR);
      const file = 'index.html';
      const size = files[file];
      const url = '/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('content-length', String(size));
        done();
      })
    })
    it('Should have date header', function(done) {
      const dir = Lactate.dir(DIR);
      const file = 'index.html';
      const size = files[file];
      const url = '/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('date')
        done();
      })
    })
    it('Should have last-modified header', function(done) {
      const dir = Lactate.dir(DIR);
      const file = 'index.html';
      const size = files[file];
      const url = '/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('last-modified')
        done();
      })
    })
    it('Should have cache-control header', function(done) {
      const dir = Lactate.dir(DIR);
      const file = 'index.html';
      const size = files[file];
      const url = '/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('cache-control');
        done();
      })
    })
    it('Should serve complete data', function(done) {
      const dir = Lactate.dir(DIR);
      const file = 'index.html';
      const size = files[file];
      const url = '/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        data.should.have.property('length', size);
        done();
      })
    })
  })
  
  describe('#serve(index.html) --with-public-dir', function() {
    it('Should not err', function(done) {
      const dir = Lactate.dir(DIR, { from:'files' });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        done();
      })
    })
    it('Should have status 200', function(done) {
      const dir = Lactate.dir(DIR, { from:'files' });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.should.have.status(200)
        done();
      })
    })
    it('Should have content-type header', function(done) {
      const dir = Lactate.dir(DIR, { from:'files' });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('content-type', 'text/html; charset=UTF-8');
        done();
      })
    })
    it('Should have content-encoding header', function(done) {
      const dir = Lactate.dir(DIR, { from:'files' });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('content-encoding', 'gzip')
        done();
      })
    })
    it('Should have content-length header', function(done) {
      const dir = Lactate.dir(DIR, { from:'files' });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('content-length', String(size));
        done();
      })
    })
    it('Should have date header', function(done) {
      const dir = Lactate.dir(DIR, { from:'files' });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('date')
        done();
      })
    })
    it('Should have last-modified header', function(done) {
      const dir = Lactate.dir(DIR, { from:'files' });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('last-modified')
        done();
      })
    })
    it('Should have cache-control header', function(done) {
      const dir = Lactate.dir(DIR, { from:'files' });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('cache-control');
        done();
      })
    })
    it('Should serve complete data', function(done) {
      const dir = Lactate.dir(DIR, { from:'files' });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        data.should.have.property('length', size);
        done();
      })
    })
  })

  describe('#serve(/files/index.html) --no-subdirs', function() {
    it('Should not err', function(done) {
      const dir = Lactate.dir(DIR, { subdirs:false });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        done();
      })
    })
    it('Should have status 403', function(done) {
      const dir = Lactate.dir(DIR, { subdirs:false });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.should.have.status(403);
        done();
      })
    })
    it('Should have content-type header', function(done) {
      const dir = Lactate.dir(DIR, { subdirs:false });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('content-type', 'text/html; charset=UTF-8');
        done();
      })
    })
    it('Should have content-encoding header', function(done) {
      const dir = Lactate.dir(DIR, { subdirs:false });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('content-encoding', 'gzip')
        done();
      })
    })
    it('Should have date header', function(done) {
      const dir = Lactate.dir(DIR, { subdirs:false });
      const file = 'index.html';
      const size = files[file];
      const url = '/files/' + file;
      http.server(dir.serve.bind(dir));
      http.client(url, 2, function(err, res, data) {
        should.not.exist(err);
        should.exist(res);
        should.exist(data);
        res.headers.should.have.property('date')
        done();
      })
    })
  })

})

