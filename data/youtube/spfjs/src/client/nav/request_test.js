// Copyright 2014 Google Inc. All rights reserved.
//
// Use of this source code is governed by The MIT License.
// See the LICENSE file for details.

/**
 * @fileoverview Tests for navigation-related request functions.
 */

goog.require('spf');
goog.require('spf.cache');
goog.require('spf.nav.request');
goog.require('spf.net.xhr');
goog.require('spf.string');
goog.require('spf.url');


describe('spf.nav.request', function() {

  var MOCK_DELAY = 10;
  var IGNORED_KEYS = ['cacheKey', 'timing'];
  var options;
  var createFakeRegularXHR = function(xhrText, isMultipart) {
    var fakeXHR = {
      responseText: xhrText,
      getResponseHeader: function(h) {
        return (h == 'X-SPF-Response-Type' && isMultipart) ? 'multipart' : '';
      }
    };
    var callOnHeaders = function(opts) {
      opts.onHeaders(fakeXHR);
    };
    var callOnDoneDelayed = function(opts) {
      setTimeout(function() {
        opts.onDone(fakeXHR);
      }, MOCK_DELAY);
    };
    return function(xhrUrl, xhrOptions) {
      callOnHeaders(xhrOptions);
      callOnDoneDelayed(xhrOptions);
    };
  };
  var createFakeChunkedXHR = function(xhrText, numChunks, isMultipart) {
    var fakeXHR = {
      responseText: xhrText,
      getResponseHeader: function(h) {
        return (h == 'X-SPF-Response-Type' && isMultipart) ? 'multipart' : '';
      }
    };
    var callOnHeaders = function(opts) {
      opts.onHeaders(fakeXHR);
    };
    var callOnChunkDelayed = function(opts, chunk, num) {
      setTimeout(function() {
        opts.onChunk(fakeXHR, chunk);
      }, MOCK_DELAY * num);
    };
    var callOnDoneDelayed = function(opts) {
      setTimeout(function() {
        opts.onDone(fakeXHR);
      }, MOCK_DELAY * (1 + numChunks));
    };
    return function(xhrUrl, xhrOptions) {
      callOnHeaders(xhrOptions);
      var l = Math.ceil(xhrText.length / numChunks);
      for (var i = 0; i < xhrText.length; i += l) {
        var chunk = xhrText.substring(i, (i + l));
        callOnChunkDelayed(xhrOptions, chunk, (1 + (i / l)));
      }
      callOnDoneDelayed(xhrOptions);
    };
  };


  beforeEach(function(argument) {
    jasmine.Clock.useMock();
    options = {
      onPart: jasmine.createSpy('onPart'),
      onError: jasmine.createSpy('onError'),
      onSuccess: jasmine.createSpy('onSuccess'),
      type: 'navigate'
    };
    this.addMatchers({
      toEqualObjectIgnoringKeys: function(expected, ignore) {
        var actualCopy = JSON.parse(JSON.stringify(this.actual));
        var expectedCopy = JSON.parse(JSON.stringify(expected));
        for (var i = 0; i < ignore.length; i++) {
          delete actualCopy[ignore[i]];
          delete expectedCopy[ignore[i]];
        }
        var thisCopy = {};
        for (var k in this) {
          thisCopy[k] = this[k];
        }
        thisCopy.actual = actualCopy;
        return jasmine.Matchers.prototype.toEqual.call(thisCopy, expectedCopy);
      }
    });
  });


  afterEach(function() {
    spf.cache.clear();
  });


  describe('send', function() {


    it('cached: single', function() {
      var url = '/page';
      var res = {'foo': 'FOO', 'bar': 'BAR'};

      var cacheKey = 'prefetch ' + spf.url.absolute(url);
      var cacheObject = {
        'response': res,
        'type': 'prefetch'
      };
      spf.cache.set(cacheKey, cacheObject);

      var requestUrl = spf.url.identify(url, options.type);
      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('cached: multipart', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };

      var cacheKey = 'prefetch ' + spf.url.absolute(url);
      var cacheObject = {
        'response': res,
        'type': 'prefetch'
      };
      spf.cache.set(cacheKey, cacheObject);

      var requestUrl = spf.url.identify(url, options.type);
      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(2);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('cached: single with path', function() {
      var url = '/page';
      var path = '/last';
      options.current = 'http://www.website.com/last';
      var res = {'foo': 'FOO', 'bar': 'BAR'};

      var cacheKey = 'prefetch ' + spf.url.absolute(url) + ' previous ' + path;
      var cacheObject = {
        'response': res,
        'type': 'prefetch'
      };
      spf.cache.set(cacheKey, cacheObject);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('cached: single with incorrect path', function() {
      var url = '/page';
      var path = '/other';
      options.current = 'http://www.website.com/last';
      var cacheRes = {'foo': 'FOO', 'bar': 'BAR'};
      var xhrRes = {'foo': 'FOO', 'baz': 'BAZ'};
      var xhrText = '{"foo": "FOO", "baz": "BAZ"}';

      var cacheKey = 'prefetch ' + spf.url.absolute(url) + ' previous ' + path;
      var cacheObject = {
        'response': cacheRes,
        'type': 'prefetch'
      };
      spf.cache.set(cacheKey, cacheObject);

      var fake = createFakeRegularXHR(xhrText);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(xhrRes, IGNORED_KEYS);
      expect(onSuccessArgs[1]).not.toEqualObjectIgnoringKeys(cacheRes,
                                                             IGNORED_KEYS);
    });


    it('regular: single', function() {
      var url = '/page';
      var res = {'foo': 'FOO', 'bar': 'BAR'};
      var text = '{"foo": "FOO", "bar": "BAR"}';
      var fake = createFakeRegularXHR(text);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('regular: single truncated (error)', function() {
      var url = '/page';
      var res = {'foo': 'FOO', 'bar': 'BAR'};
      var text = '{"foo": "FOO", "bar":';
      var fake = createFakeRegularXHR(text);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('regular: single sent as multipart', function() {
      var url = '/page';
      var res = {'foo': 'FOO', 'bar': 'BAR'};
      var text = '{"foo": "FOO", "bar": "BAR"}';
      var fake = createFakeRegularXHR(text, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('regular: single sent as multipart truncated (error)', function() {
      var url = '/page';
      var res = {'foo': 'FOO', 'bar': 'BAR'};
      var text = '{"foo": "FOO", "bar":';
      var fake = createFakeRegularXHR(text, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('regular: multipart', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[\r\n{"foo": "FOO"},\r\n{"bar": "BAR"}]\r\n';
      var fake = createFakeRegularXHR(text, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(2);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('regular: multipart truncated (error)', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[\r\n{"foo": "FOO"},\r\n{"bar":';
      var fake = createFakeRegularXHR(text, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('regular: multipart truncated at token (error)', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[\r\n{"foo": "FOO"},\r\n';
      var fake = createFakeRegularXHR(text, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('regular: multipart sent as single', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[\r\n{"foo": "FOO"},\r\n{"bar": "BAR"}]\r\n';
      var fake = createFakeRegularXHR(text);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(2);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('regular: multipart sent as single truncated (error)', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[\r\n{"foo": "FOO"},\r\n{"bar":';
      var fake = createFakeRegularXHR(text);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('regular: multipart sent as single truncated at token (error)',
       function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[\r\n{"foo": "FOO"},\r\n';
      var fake = createFakeRegularXHR(text);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('regular: multipart missing tokens', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[{"foo": "FOO"}, {"bar": "BAR"}]';
      var fake = createFakeRegularXHR(text, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(2);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('regular: multipart missing tokens truncated (error)', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[{"foo": "FOO"}, {"bar":';
      var fake = createFakeRegularXHR(text, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('regular: multipart missing tokens sent as single', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
     var text = '[{"foo": "FOO"}, {"bar": "BAR"}]';
      var fake = createFakeRegularXHR(text);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(2);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('regular: multipart missing tokens sent as single truncated (error)',
       function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
     var text = '[{"foo": "FOO"}, {"bar":';
      var fake = createFakeRegularXHR(text);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('chunked: single', function() {
      var url = '/page';
      var res = {'foo': 'FOO', 'bar': 'BAR'};
      var text = '{"foo": "FOO", "bar": "BAR"}';
      var fake = createFakeChunkedXHR(text, 3);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('chunked: single truncated (error)', function() {
      var url = '/page';
      var res = {'foo': 'FOO', 'bar': 'BAR'};
      var text = '{"foo": "FOO", "bar":';
      var fake = createFakeChunkedXHR(text, 3);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('chunked: single sent as multipart', function() {
      var url = '/page';
      var res = {'foo': 'FOO', 'bar': 'BAR'};
      var text = '{"foo": "FOO", "bar": "BAR"}';
      var fake = createFakeChunkedXHR(text, 3, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('chunked: single sent as multipart truncated (error)', function() {
      var url = '/page';
      var res = {'foo': 'FOO', 'bar': 'BAR'};
      var text = '{"foo": "FOO", "bar":';
      var fake = createFakeChunkedXHR(text, 3, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('chunked: multipart', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[\r\n{"foo": "FOO"},\r\n{"bar": "BAR"}]\r\n';
      var fake = createFakeChunkedXHR(text, 3, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(2);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('chunked: multipart truncated (error)', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[\r\n{"foo": "FOO"},\r\n{"bar":';
      var fake = createFakeChunkedXHR(text, 3, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(1);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('chunked: multipart truncated at token (error)', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[\r\n{"foo": "FOO"},\r\n';
      var fake = createFakeChunkedXHR(text, 3, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(1);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('chunked: multipart sent as single', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[\r\n{"foo": "FOO"},\r\n{"bar": "BAR"}]\r\n';
      var fake = createFakeChunkedXHR(text, 3);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(2);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('chunked: multipart sent as single truncated (error)', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[\r\n{"foo": "FOO"},\r\n{"bar":';
      var fake = createFakeChunkedXHR(text, 3);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('chunked: multipart sent as single truncated at token (error)',
       function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[\r\n{"foo": "FOO"},\r\n';
      var fake = createFakeChunkedXHR(text, 3);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('chunked: multipart missing begin token', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[{"foo": "FOO"},\r\n{"bar": "BAR"}]\r\n';
      var fake = createFakeChunkedXHR(text, 3, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(2);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('chunked: multipart missing end token', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[\r\n{"foo": "FOO"},\r\n{"bar": "BAR"}]';
      var fake = createFakeChunkedXHR(text, 3, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(2);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('chunked: multipart missing tokens', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[{"foo": "FOO"}, {"bar": "BAR"}]';
      var fake = createFakeChunkedXHR(text, 3, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(2);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('chunked: multipart missing tokens truncated (error)', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[{"foo": "FOO"}, {"bar":';
      var fake = createFakeChunkedXHR(text, 3, true);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('chunked: multipart missing tokens sent as single', function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[{"foo": "FOO"}, {"bar": "BAR"}]';
      var fake = createFakeChunkedXHR(text, 3);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(2);
      expect(options.onSuccess.calls.length).toEqual(1);
      expect(options.onError.calls.length).toEqual(0);
      var onSuccessArgs = options.onSuccess.mostRecentCall.args;
      expect(onSuccessArgs[0]).toEqual(url);
      expect(onSuccessArgs[1]).toEqualObjectIgnoringKeys(res, IGNORED_KEYS);
    });


    it('chunked: multipart missing tokens sent as single truncated (error)',
       function() {
      var url = '/page';
      var res = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var text = '[{"foo": "FOO"}, {"bar":';
      var fake = createFakeChunkedXHR(text, 3);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick((MOCK_DELAY * 4) + 1);

      expect(options.onPart.calls.length).toEqual(0);
      expect(options.onSuccess.calls.length).toEqual(0);
      expect(options.onError.calls.length).toEqual(1);
      var onErrorArgs = options.onError.mostRecentCall.args;
      expect(onErrorArgs[0]).toEqual(url);
    });


    it('regular: single, navigation timing', function() {
      var url = '/page';
      var text = '{}';
      var startTime = new Date().getTime() - 1;
      var fake = createFakeRegularXHR(text);
      spf.net.xhr.get = jasmine.createSpy('xhr.get').andCallFake(fake);

      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      var timing = options.onSuccess.mostRecentCall.args[1].timing;
      expect(timing.navigationStart).toBeGreaterThan(startTime);
      expect(timing.spfCached).toBe(false);
    });


    it('cached: single, navigation timing', function() {
      var url = '/page';
      var res = {'foo': 'FOO', 'bar': 'BAR'};
      var startTime = new Date().getTime() - 1;

      var cacheKey = 'prefetch ' + spf.url.absolute(url);
      var cacheObject = {
        'response': res,
        'type': 'prefetch'
      };
      spf.cache.set(cacheKey, cacheObject);

      var requestUrl = spf.url.identify(url, options.type);
      spf.nav.request.send(url, options);

      // Simulate waiting for the response.
      jasmine.Clock.tick(MOCK_DELAY + 1);

      var timing = options.onSuccess.mostRecentCall.args[1].timing;
      expect(timing.navigationStart).toBeGreaterThan(startTime);
      expect(timing.spfCached).toBe(true);
    });


  });

  describe('cache object', function() {

    it('preserves cache type', function() {
      var key = 'key';
      var response = {
        parts: [{'foo': 'FOO'}, {'bar': 'BAR'}],
        type: 'multipart'
      };
      var type = 'prefetch';
      spf.nav.request.setCacheObject_(key, response, type);
      var cached = spf.nav.request.getCacheObject_(key);
      expect(cached['response']).toBe(response);
      expect(cached['type']).toBe(type);
    });
  });

});
