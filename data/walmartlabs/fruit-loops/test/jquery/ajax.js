/*global should */
var ajax = require('../../lib/jquery/ajax'),
    hapi = require('hapi'),
    Catbox = require('catbox'),
    CatboxMemory = require('catbox-memory'),
    Exec = require('../../lib/exec'),
    sinon = require('sinon');

describe('ajax', function() {
  var server,
      window,
      $,
      exec,
      inst,
      policy,
      getSpy;
  before(function(done) {
    getSpy = sinon.spy(function(req, reply) {
      reply({data: 'get!'});
    });

    server = new hapi.Server(0);
    server.route([
      {
        path: '/',
        method: 'GET',
        config: {
          jsonp: 'callback',
          cache: {
            expiresIn: 5*24*60*60*1000
          }
        },
        handler: getSpy
      },
      {
        path: '/foo/bar',
        method: 'GET',
        config: {
          jsonp: 'callback',
          cache: {
            expiresIn: 5*24*60*60*1000
          }
        },
        handler: getSpy
      },
      {
        path: '/',
        method: 'POST',
        handler: function(req, reply) {
          req.payload.data = 'post!';
          reply(req.payload);
        }
      },
      {
        path: '/parse',
        method: 'GET',
        handler: function(req, reply) {
          reply('utter crap');
        }
      },
      {
        path: '/error',
        method: 'GET',
        handler: function(req, reply) {
          reply(new Error('error'));
        }
      },
      {
        path: '/timeout',
        method: 'GET',
        handler: function(req, reply) {
        }
      },
      {
        path: '/ttl/{duration}',
        method: 'GET',
        config: {jsonp: 'callback'},
        handler: function(req, reply) {
          reply({data: 'ttl!'})
              .ttl(parseInt(req.params.duration, 10)*60*1000);
        }
      },
      {
        path: '/cache',
        method: '*',
        handler: function(req, reply) {
          var res = reply({data: 'ttl!'})
              .header('cache-control', req.query.control);
          if (req.query.status) {
            res.code(req.query.status);
          }
        }
      }
    ]);
    server.start(function() {
      var policyOptions = {
          expiresIn: 5000
      };

      var client = new Catbox.Client(CatboxMemory);
      client.start(function () {
          policy = new Catbox.Policy(policyOptions, client, 'example');
          done();
      });
    });
  });
  after(function() {
    server.stop();
  });
  beforeEach(function() {
    getSpy.reset();

    $ = {};
    window = {
      location: 'http://localhost:' + server.info.port + '/foo/index.html',
      $: $
    };
    exec = Exec.create(function(err) { throw err; });
    inst = ajax(window, exec, {timeout: 100});
  });
  afterEach(function() {
    inst.reset();
    Date.now.restore && Date.now.restore();
  });

  it('should extend $', function() {
    var window = {$: {}};
    ajax(window);
    should.exist(window.$.ajax);
  });

  describe('#ajax', function() {
    it('should make request', function(done) {
      var successCalled;
      var xhrReturn = $.ajax({
        url: 'http://localhost:' + server.info.port + '/',
        success: function(data, status, xhr) {
          data.should.eql({data: 'get!'});

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);
          successCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(successCalled);

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          inst.on('complete', function() {
            done();
          });
        }
      });
      xhrReturn.readyState.should.equal(2);
    });
    it('should allow short circuiting', function(done) {
      inst = ajax(window, exec, {
        shortCircuit: function(options, callback) {
          setImmediate(function() {
            callback(undefined, {
                statusCode: 200,
                data: {data: 'short!'}
              });
          });
          return true;
        }
      });
      var successCalled;
      var xhrReturn = $.ajax({
        url: 'http://localhost:' + server.info.port + '/',
        success: function(data, status, xhr) {
          data.should.eql({data: 'short!'});

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);
          successCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(successCalled);

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          inst.on('complete', function() {
            done();
          });
        }
      });
      xhrReturn.readyState.should.equal(2);
    });
    it('should handle POST requests', function(done) {
      var successCalled;
      var xhrReturn = $.ajax({
        type: 'POST',
        data: {
          foo: '1',
          bar: '2'
        },
        url: 'http://localhost:' + server.info.port + '/',
        success: function(data, status, xhr) {
          data.should.eql({data: 'post!', foo: '1', bar: '2'});

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);
          successCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(successCalled);

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          inst.on('complete', function() {
            done();
          });
        }
      });
      xhrReturn.readyState.should.equal(2);
    });
    it('should handle jsonp requests', function(done) {
      var successCalled;
      var xhrReturn = $.ajax({
        url: 'http://localhost:' + server.info.port + '/?callback=?',
        success: function(data, status, xhr) {
          data.should.eql({data: 'get!'});

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);
          successCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(successCalled);

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          inst.on('complete', function() {
            done();
          });
        }
      });
    });
    it('should handle errored connections', function(done) {
      var errorCalled;
      var xhrReturn = $.ajax({
        url: 'http://localhost:' + (server.info.port+1) + '/',
        error: function(xhr, status, error) {
          error.should.be.instanceOf(Error);

          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);
          errorCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(errorCalled);

          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          inst.on('complete', function() {
            done();
          });
        }
      });
      xhrReturn.readyState.should.equal(2);
    });
    it('should handle errored connections (with cache enabled)', function(done) {
      inst = ajax(window, exec, {cache: policy});
      var errorCalled;
      var xhrReturn = $.ajax({
        url: 'http://localhost:' + (server.info.port+1) + '/',
        error: function(xhr, status, error) {
          error.should.be.instanceOf(Error);

          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);
          errorCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(errorCalled);

          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          inst.on('complete', function() {
            done();
          });
        }
      });
      xhrReturn.readyState.should.equal(2);
    });
    it('should short circuit cached requests', function(done) {
      inst = ajax(window, exec, {cache: policy});

      var now = 0;
      sinon.stub(Date, 'now', function() {
        if (now) {
          return now;
        } else {
          return now++;
        }
      });

      $.ajax({
        url: 'http://localhost:' + server.info.port + '/',
        success: function(data, status, xhr) {
          data.modified = true;
        },
        complete: function(xhr, status) {
          setImmediate(function() {
            var xhrReturn = $.ajax({
              url: 'http://localhost:' + server.info.port + '/',
              success: function(data, status, xhr) {
                data.should.eql({data: 'get!'});

                status.should.equal('success');

                xhr.should.equal(xhrReturn);
                xhr.readyState.should.equal(4);

                inst.on('complete', function() {
                  setImmediate(function() {
                    exec.pending.log().should.eql([
                      {
                        type: 'ajax',
                        id: 0,
                        url: 'http://localhost:' + server.info.port + '/',
                        method: undefined,
                        status: 'success',
                        statusCode: 200,
                        start: 0,
                        duration: 1,
                        cacheLookup: 0,
                        cached: false
                      },
                      {
                        type: 'ajax',
                        id: 1,
                        url: 'http://localhost:' + server.info.port + '/',
                        method: undefined,
                        status: 'success',
                        statusCode: 200,
                        start: 1,
                        duration: 0,
                        cacheLookup: 0,
                        cached: true
                      }
                    ]);
                    getSpy.callCount.should.equal(1);
                    done();
                  });
                });
              }
            });
            getSpy.callCount.should.equal(1);
          });
        }
      });
    });
    it('should NOP pending cache responses on reset', function(done) {
      inst = ajax(window, exec, {cache: policy});

      $.ajax({
        url: 'http://localhost:' + server.info.port + '/',
        complete: function(xhr, status) {
          throw new Error('failure');
        }
      });
      inst.reset();
      process.nextTick(done, 100);
    });
    it('should handle proto relative requests', function(done) {
      var successCalled;
      var xhrReturn = $.ajax({
        url: '//localhost:' + server.info.port + '/',
        success: function(data, status, xhr) {
          data.should.eql({data: 'get!'});

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);
          successCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(successCalled);

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          inst.on('complete', function() {
            done();
          });
        }
      });
      xhrReturn.readyState.should.equal(2);
    });
    it('should handle server relative requests', function(done) {
      var successCalled;
      var xhrReturn = $.ajax({
        url: '/',
        success: function(data, status, xhr) {
          data.should.eql({data: 'get!'});

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);
          successCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(successCalled);

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          inst.on('complete', function() {
            done();
          });
        }
      });
      xhrReturn.readyState.should.equal(2);
    });
    it('should handle path relative requests', function(done) {
      var successCalled;
      var xhrReturn = $.ajax({
        url: 'bar',
        success: function(data, status, xhr) {
          data.should.eql({data: 'get!'});

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);
          successCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(successCalled);

          status.should.equal('success');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          inst.on('complete', function() {
            done();
          });
        }
      });
      xhrReturn.readyState.should.equal(2);
    });

    it('should handle http errors', function(done) {
      var errorCalled;
      var xhrReturn = $.ajax({
        url: 'http://localhost:' + server.info.port + '/error',
        success: function(data, status, xhr) {
          throw new Error('Should not have been called');
        },
        error: function(xhr, status, err) {
          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.responseText.should.match(/"statusCode":500,/);
          xhr.readyState.should.equal(4);
          errorCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(errorCalled);

          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          inst.on('complete', function() {
            done();
          });
        }
      });
      xhrReturn.readyState.should.equal(2);
    });
    it('should handle syntax errors', function(done) {
      var errorCalled;
      var xhrReturn = $.ajax({
        url: 'http://localhost:' + server.info.port + '/parse',
        success: function(data, status, xhr) {
          throw new Error('Should not have been called');
        },
        error: function(xhr, status, err) {
          status.should.equal('parsererror');

          xhr.should.equal(xhrReturn);
          xhr.responseText.should.equal('utter crap');
          xhr.readyState.should.equal(4);
          errorCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(errorCalled);

          status.should.equal('parsererror');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);
        }
      });
      inst.on('complete', function() {
        done();
      });
      xhrReturn.readyState.should.equal(2);
    });

    it('should allow specific requests to be cancelled', function(done) {
      var errorCalled = 0,
          spy = this.spy();

      var xhrReturn = $.ajax({
        url: 'http://localhost:' + server.info.port + '/',
        success: spy,
        error: function(xhr, status, err) {
          status.should.equal('abort');

          xhr.should.equal(xhrReturn);
          xhr.responseText.should.equal('');
          xhr.readyState.should.equal(4);
          errorCalled++;
        },
        complete: function(xhr, status) {
          errorCalled.should.equal(1);
          spy.callCount.should.equal(0);

          status.should.equal('abort');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          // Should do nothing
          xhrReturn.abort();
        }
      });
      inst.on('complete', function() {
        done();
      });
      xhrReturn.abort();
    });

    it('should handle http timeouts', function(done) {
      var start = Date.now();

      var errorCalled;
      var xhrReturn = $.ajax({
        timeout: 1000,
        url: 'http://localhost:' + server.info.port + '/timeout',
        success: function(data, status, xhr) {
          throw new Error('Should not have been called');
        },
        error: function(xhr, status, err) {
          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.responseText.should.equal('');
          xhr.readyState.should.equal(4);
          errorCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(errorCalled);

          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);
          (Date.now() - start).should.be.lessThan(500);

          inst.on('complete', function() {
            done();
          });
        }
      });
      xhrReturn.readyState.should.equal(2);
    });

    it('should handle client http timeouts', function(done) {
      inst = ajax(window, exec);

      var errorCalled;
      var xhrReturn = $.ajax({
        timeout: 100,
        url: 'http://localhost:' + server.info.port + '/timeout',
        success: function(data, status, xhr) {
          throw new Error('Should not have been called');
        },
        error: function(xhr, status, err) {
          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.responseText.should.equal('');
          xhr.readyState.should.equal(4);
          errorCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(errorCalled);

          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          inst.on('complete', function() {
            done();
          });
        }
      });
      xhrReturn.readyState.should.equal(2);
    });
    it('should allow short circuiting timeouts', function(done) {
      this.clock.restore();

      inst = ajax(window, exec, {
        timeout: 100,
        shortCircuit: function(options, callback) {
          return true;
        }
      });
      var errorCalled;
      var xhrReturn = $.ajax({
        url: 'http://localhost:' + server.info.port + '/',
        error: function(xhr, status, err) {
          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.responseText.should.equal('');
          xhr.readyState.should.equal(4);
          errorCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(errorCalled);

          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          inst.on('complete', function() {
            done();
          });
        }
      });
      xhrReturn.readyState.should.equal(2);
    });
  });

  it('should record all complete', function(done) {
    inst.once('complete', function() {
      inst.allComplete().should.be.true;
      done();
    });

    $.ajax({
      type: 'POST',
      url: 'http://localhost:' + server.info.port + '/',
      success: function(data, status, xhr) {
        inst.allComplete().should.be.false;
      },
      complete: function(xhr, status) {
        inst.allComplete().should.be.false;
      }
    });

    inst.allComplete().should.be.false;
  });
  it('should output returned values', function(done) {
    $.ajax({
      url: 'http://localhost:' + server.info.port + '/'
    });
    $.ajax({
      type: 'POST',
      url: 'http://localhost:' + server.info.port + '/?post',
      cacheUrl: '/bar'
    });
    $.ajax({
      url: 'http://localhost:' + server.info.port + '/error',
      cacheUrl: 'http://localhost:' + server.info.port + '/error'
    });
    $.ajax({
      url: 'http://localhost:' + server.info.port + '/parse'
    });

    inst.on('complete', function() {
      if (inst.allComplete()) {
        var cache = {};
        cache['http://localhost:' + server.info.port + '/'] = {data: 'get!'};
        cache['/bar'] = {data: 'post!'};
        JSON.parse(inst.toJSON()).should.eql(cache);
        done();
      }
    });
  });

  describe('#minimumCache', function() {
    var minimumCache;
    beforeEach(function() {
      minimumCache = {
        'no-cache': false,
        private: false,
        expires: Number.MAX_VALUE
      };
    });

    it('should track minimum max-age time', function(done) {
      $.ajax({
        url: 'http://localhost:' + server.info.port + '/ttl/5'
      });
      $.ajax({
        url: 'http://localhost:' + server.info.port + '/ttl/15'
      });

      inst.on('complete', function() {
        if (inst.allComplete()) {
          inst.minimumCache().should.eql({
            'no-cache': false,
            private: false,
            expires: Date.now() + 5*60*1000
          });

          done();
        }
      });
    });
    it('should handle private caching', function() {
      ajax.calcCache(minimumCache, ajax.cachingInfo({
        request: {method: 'GET'},
        statusCode: 200,
        headers: {
          'cache-control': 'max-age=' + (15 * 60) + ', private'
        }
      }));

      minimumCache.should.eql({
        'no-cache': false,
        private: true,
        expires: Date.now() + 15*60*1000
      });
    });
    it('should handle expires caching', function() {
      ajax.calcCache(minimumCache, ajax.cachingInfo({
        request: {method: 'GET'},
        statusCode: 200,
        headers: {
          expires: new Date(5*60*1000).toUTCString()
        }
      }));

      minimumCache.should.eql({
        'no-cache': false,
        private: false,
        expires: 5*60*1000
      });
    });
    it('should handle pragma no-cache', function() {
      ajax.calcCache(minimumCache, ajax.cachingInfo({
        request: {method: 'GET'},
        statusCode: 200,
        headers: {
          pragma: 'no-cache',
          expires: new Date(5*60*1000).toUTCString()
        }
      }));

      minimumCache.should.eql({
        'no-cache': true,
        private: false,
        expires: undefined
      });
    });
    it('should handle no-cache caching directives', function() {
      ajax.calcCache(minimumCache, ajax.cachingInfo({
        request: {method: 'GET'},
        statusCode: 200,
        headers: {
          'cache-control': 'no-cache'
        }
      }));

      minimumCache.should.eql({
        'no-cache': true,
        private: false,
        expires: undefined
      });
    });
    describe('non-cachable requests', function() {
      it('should handle status codes', function(done) {
        $.ajax({
          url: 'http://localhost:' + server.info.port + '/cache?control='
            + encodeURIComponent('max-age=' + (15 * 60))
            + '&status=400'
        });

        inst.on('complete', function() {
          if (inst.allComplete()) {
            inst.minimumCache().should.eql({
              'no-cache': true,
              private: false,
              expires: undefined
            });

            done();
          }
        });
      });
      it('should handle method', function(done) {
        $.ajax({
          type: 'POST',
          url: 'http://localhost:' + server.info.port + '/cache?control='
            + encodeURIComponent('max-age=' + (15 * 60))
        });

        inst.on('complete', function() {
          if (inst.allComplete()) {
            inst.minimumCache().should.eql({
              'no-cache': true,
              private: false,
              expires: undefined
            });

            done();
          }
        });
      });
      it('should handle public flag', function(done) {
        $.ajax({
          type: 'POST',
          url: 'http://localhost:' + server.info.port + '/cache?control='
            + encodeURIComponent('max-age=' + (15 * 60) + ',public')
        });

        inst.on('complete', function() {
          if (inst.allComplete()) {
            inst.minimumCache().should.eql({
              'no-cache': false,
              private: false,
              expires: Date.now() + 15*60*1000
            });

            done();
          }
        });
      });
    });

    it('should pull ttl from cached elements', function(done) {
      var cache = {};
      inst = ajax(window, exec, {cache: policy});

      $.ajax({
        url: 'http://localhost:' + server.info.port + '/ttl/5',
        complete: function(xhr, status) {
          setImmediate(function() {
            inst.minimumCache().should.eql({
              'no-cache': false,
              private: false,
              expires: Date.now() + 5*60*1000
            });

            // Clear out the minimum cache value
            inst.reset();
            inst.minimumCache().should.eql({
              'no-cache': false,
              private: false,
              expires: Number.MAX_VALUE
            });

            // Hit the same service again to ensure that it's populated
            var xhrReturn = $.ajax({
              url: 'http://localhost:' + server.info.port + '/ttl/5'
            });

            inst.on('complete', function() {
              inst.minimumCache().should.eql({
                'no-cache': false,
                private: false,
                expires: Date.now() + 5*60*1000
              });

              done();
            });
          });
        }
      });
    });

    it('should handle cached http timeouts', function(done) {
      var clock = this.clock;

      var start = Date.now();

      var errorCalled;
      inst.reset();
      inst = ajax(window, exec, {timeout: 100, cache: policy});

      // this.clock.restore();
      var xhrReturn = $.ajax({
        url: 'http://localhost:' + server.info.port + '/timeout',
        success: function(data, status, xhr) {
          throw new Error('Should not have been called');
        },
        error: function(xhr, status, err) {
          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.responseText.should.equal('');
          xhr.readyState.should.equal(4);
          errorCalled = true;
        },
        complete: function(xhr, status) {
          should.exist(errorCalled);

          status.should.equal('error');

          xhr.should.equal(xhrReturn);
          xhr.readyState.should.equal(4);

          inst.on('complete', function() {
            done();
          });
        }
      });
      xhrReturn.readyState.should.equal(2);
      this.clock.tick(100);
    });

    it('should report cache errors but succeed', function(done) {
      var client = new Catbox.Client(CatboxMemory),
          err = new Error('puke');
      client.get = function(key, callback) {
        callback(err);
      };

      client.start(function () {
        policy = new Catbox.Policy({expiresIn: 5000}, client, 'example');
        inst = ajax(window, exec, {cache: policy});

        $.ajax({
          url: 'http://localhost:' + server.info.port + '/ttl/5',
          success: function(data, status, xhr) {
            data.should.eql({data: 'ttl!'});
          },
          complete: function(xhr, status) {
            setImmediate(function() {
              xhr.readyState.should.equal(4);
              status.should.equal('success');

              exec.pending.log().should.eql([
                {
                  type: 'ajax',
                  id: 0,
                  url: 'http://localhost:' + server.info.port + '/ttl/5',
                  method: undefined,
                  status: 'success',
                  statusCode: 200,
                  start: 10,
                  duration: 0,
                  cacheLookup: err,
                  cached: false
                }
              ]);
              done();
            });
          }
        });
      });
    });
  });
  it('should allow all pending requests to be cancelled', function(done) {
    var xhr1 = $.ajax({
      url: 'http://localhost:' + server.info.port + '/'
    });
    this.spy(xhr1, 'abort');

    var xhr2 = $.ajax({
      type: 'POST',
      url: 'http://localhost:' + server.info.port + '/?post',
      cacheUrl: '/bar'
    });
    this.spy(xhr2, 'abort');

    inst.on('complete', function() {
      if (inst.allComplete()) {
        xhr1.abort.callCount.should.equal(1);
        xhr2.abort.callCount.should.equal(1);
        done();
      }
    });
    inst.reset();
  });
});
