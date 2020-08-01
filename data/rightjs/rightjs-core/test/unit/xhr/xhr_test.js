/**
 * the Xhr unit tests
 *
 * Copyright (C) 2008-2010 Nikolay V. Nemshilov
 */
var XhrTest = TestCase.create({
  name: 'XhrTest',

  tearDown: function() {
    this.undoAjaxMock();
  },

  testInstance: function() {
    var request = new Xhr('/some/url');

    this.assertEqual('/some/url', request.url);
    this.assertEqual({
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'text/javascript,text/html,application/xml,text/xml,*/*'
    }, request.headers);
    this.assertEqual('post',  request.method);
    this.assertEqual('utf-8', request.encoding);
    this.assertEqual(true,    request.async);
    this.assertEqual(false,   request.evalScripts);
    this.assertEqual(true,    request.urlEncoded);
    this.assertEqual(null,    request.spinner);
    this.assertEqual(null,    request.params);
  },

  testCallbacksWiring: function() {
    var on_cancel   = function() {};
    var on_create   = function() {};
    var on_request  = function() {};
    var on_failure  = function() {};
    var on_success  = function() {};
    var on_complete = function() {};

    var request = new Xhr('/some/url', {
      onSuccess:  on_success,
      onFailure:  on_failure,
      onCreate:   on_create,
      onComplete: on_complete,
      onCancel:   on_cancel,
      onRequest:  on_request
    });

    this.assert(request.observes('cancel',   on_cancel));
    this.assert(request.observes('create',   on_create));
    this.assert(request.observes('request',  on_request));
    this.assert(request.observes('success',  on_success));
    this.assert(request.observes('failure',  on_failure));
    this.assert(request.observes('complete', on_complete));
  },

  testOptionsMerging: function() {
    var request = new Xhr('/some/url', {
      method:      'get',
      encoding:    'koi8r',
      async:       false,
      evalScripts: false,
      urlEncoded:  false,
      spinner:     'spinner',
      params:      'bla=bla'
    });

    this.assertEqual('/some/url', request.url);
    this.assertEqual({
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'text/javascript,text/html,application/xml,text/xml,*/*'
    }, request.headers);
    this.assertEqual('get',     request.method);
    this.assertEqual('koi8r',   request.encoding);
    this.assertEqual(false,     request.async);
    this.assertEqual(false,     request.evalScripts);
    this.assertEqual(false,     request.urlEncoded);
    this.assertEqual('spinner', request.spinner);
    this.assertEqual('bla=bla', request.params);
  },

  testSetHeader: function() {
    var request = new Xhr('/bla/bla');
    this.assertSame(request, request.setHeader('foo', 'bar'));
    this.assertEqual('bar', request.headers['foo']);
  },

  testSend: function() {
    this.mockAjax({ text: 'response text' });
    var request = new Xhr('foo/bar');

    this.assertSame(request, request.send());
    this.assertEqual('response text', request.text);
    this.assertEqual('response text', request.responseText);
    this.assertEqual(200, request.status);
    this.assert(request.successful());

    this.assertNull(request.xml);
    this.assertNull(request.responseXml);
  },

  testReceiveXml: function() {
    this.mockAjax({
      xml: 'response xml',
      headers: { 'Content-type': 'text/xml' }
    });

    var request = new Xhr('foo/bar').send();

    this.assertEqual('response xml', request.xml);
    this.assertEqual('text/xml', request.getHeader('Content-type'));
  },

  testParamsHandling: function() {
    this.mockAjax();

    Xhr.Options.params = 'global=param';

    var request = new Xhr('foo/bar?foo=bar', {
      params: 'another=one'
    }).send('some=more');

    this.assertEqual('global=param&another=one&some=more', request.xhr.sentData);

    // trying the same with params as hashes
    var request = new Xhr('foo/bar?foo=bar', {
      params: {another: 'one'}
    }).send({some: 'more'});

    this.assertEqual('global=param&another=one&some=more', request.xhr.sentData);

    Xhr.Options.params = undefined;
  },

  testSendForm: function() {
    this.mockAjax();

    var form = new Form();
    var request = new Xhr('foo/bar');

    form.values = function() { return {"boo[hoo]" : "✓"}; };

    request.send(form);

    this.assertEqual('boo%5Bhoo%5D=%E2%9C%93', request.xhr.sentData);
  },

  testCallbacksInvolvement: function() {
    this.mockAjax();

    var create_index, request_index, complete_index, success_index, cancel_index, failure_index, index;
    var create_obj, create_xhr, request_obj, request_xhr,
        complete_obj, complete_xhr, success_obj, success_xhr;

    create_index = request_index = complete_index = success_index = cancel_index = failure_index = index = 0

    var request = new Xhr('foo/bar', {
      onCreate:   function(obj, xhr) { create_obj   = obj; create_xhr   = xhr; create_index   = ++index;},
      onRequest:  function(obj, xhr) { request_obj  = obj; request_xhr  = xhr; request_index  = ++index;},
      onComplete: function(obj, xhr) { complete_obj = obj; complete_xhr = xhr; complete_index = ++index;},
      onSuccess:  function(obj, xhr) { success_obj  = obj; success_xhr  = xhr; success_index  = ++index;},
      onFailure:  function(obj, xhr) { failure_obj  = obj; failure_xhr  = xhr; failure_index  = ++index;},
      onCancel:   function(obj, xhr) { cancel_obj   = obj; cancel_xhr   = xhr; cancel_index   = ++index;}
    }).send();

    this.assertEqual(1, create_index);
    this.assertEqual(4, request_index);   // fake ajax calls onstatchange on send
    this.assertEqual(2, complete_index);
    this.assertEqual(3, success_index);
    this.assertEqual(0, failure_index, 'failure should not be called');
    this.assertEqual(0, cancel_index,  'cancel should not be called');

    this.assertSame(request, create_obj);
    this.assertSame(request, request_obj);
    this.assertSame(request, complete_obj);
    this.assertSame(request, success_obj);

    this.assertSame(request.xhr, create_xhr);
    this.assertSame(request.xhr, request_xhr);
    this.assertSame(request.xhr, complete_xhr);
    this.assertSame(request.xhr, success_xhr);
  },

  testCallbacksInCaseOfFailure: function() {
    this.mockAjax({status: 404});

    var create_index, request_index, complete_index, success_index, cancel_index,
        failure_index, index, failure_obj, failure_xhr, request_obj, request_xhr,
        create_obj, create_xhr, complete_obj, complete_xhr, success_obj, success_xhr,
        cancel_obj, cancel_xhr;

    create_index = request_index = complete_index = success_index = cancel_index = failure_index = index = 0

    var request = new Xhr('foo/bar', {
      onCreate:   function(obj, xhr) { create_obj   = obj; create_xhr   = xhr; create_index   = ++index;},
      onRequest:  function(obj, xhr) { request_obj  = obj; request_xhr  = xhr; request_index  = ++index;},
      onComplete: function(obj, xhr) { complete_obj = obj; complete_xhr = xhr; complete_index = ++index;},
      onSuccess:  function(obj, xhr) { success_obj  = obj; success_xhr  = xhr; success_index  = ++index;},
      onFailure:  function(obj, xhr) { failure_obj  = obj; failure_xhr  = xhr; failure_index  = ++index;},
      onCancel:   function(obj, xhr) { cancel_obj   = obj; cancel_xhr   = xhr; cancel_index   = ++index;}
    }).send();

    this.assertEqual(1, create_index);
    this.assertEqual(4, request_index);    // fake ajax calls onstatchange on send
    this.assertEqual(2, complete_index);
    this.assertEqual(0, success_index, 'success should not be called');
    this.assertEqual(3, failure_index);
    this.assertEqual(0, cancel_index,  'cancel should not be called');

    this.assertSame(request,     failure_obj);
    this.assertSame(request.xhr, failure_xhr);

    this.assertFalse(request.successful());
  },

  testGlobalCallbacksInvolvement: function() {
    this.mockAjax();

    var create_index, request_index, complete_index, success_index, cancel_index, failure_index, index,
        create_obj, create_xhr, request_obj, request_xhr, complete_obj, complete_xhr, success_obj, success_xhr;

    create_index = request_index = complete_index = success_index = cancel_index = failure_index = index = 0

    Xhr.onCreate(  function(obj, xhr) { create_obj   = obj; create_xhr   = xhr; create_index   = ++index;});
    Xhr.onRequest( function(obj, xhr) { request_obj  = obj; request_xhr  = xhr; request_index  = ++index;});
    Xhr.onComplete(function(obj, xhr) { complete_obj = obj; complete_xhr = xhr; complete_index = ++index;});
    Xhr.onSuccess( function(obj, xhr) { success_obj  = obj; success_xhr  = xhr; success_index  = ++index;});
    Xhr.onFailure( function(obj, xhr) { failure_obj  = obj; failure_xhr  = xhr; failure_index  = ++index;});
    Xhr.onCancel(  function(obj, xhr) { cancel_obj   = obj; cancel_xhr   = xhr; cancel_index   = ++index;});

    var request = new Xhr('foo/bar').send();

    this.assertEqual(1, create_index);
    this.assertEqual(4, request_index);   // fake ajax calls onstatchange on send
    this.assertEqual(2, complete_index);
    this.assertEqual(3, success_index);
    this.assertEqual(0, failure_index, 'failure should not be called');
    this.assertEqual(0, cancel_index,  'cancel should not be called');

    this.assertSame(request, create_obj);
    this.assertSame(request, request_obj);
    this.assertSame(request, complete_obj);
    this.assertSame(request, success_obj);

    this.assertSame(request.xhr, create_xhr);
    this.assertSame(request.xhr, request_xhr);
    this.assertSame(request.xhr, complete_xhr);
    this.assertSame(request.xhr, success_xhr);
  },

  testSpinnerHandling: function() {
    this.mockAjax();

    var spinner = new Element('div');
    var request = new Xhr('foo.bar', {
      spinner: spinner
    });

    this.assertCalled([
      [spinner, 'show'],
      [spinner, 'hide']
    ], function() {
      request.send();
    });

    // trying the global spinner
    Xhr.Options.spinner = spinner;
    this.assertCalled([
      [spinner, 'show'],
      [spinner, 'hide']
    ], function() {
      Xhr.load('/boo');
    });
  },

  testScriptsAutoEvaluationOnCorrectContentType: function() {
    window.____1 = null;
    this.mockAjax({
      text: 'var ____1 = 1234;',
      headers: { 'Content-type': 'text/javascript' }
    });

    new Xhr('foo/bar').send();

    this.assertEqual(1234, window.____1);
  },

  testScriptsAutoEvaluationOnWrongContentType: function() {
    window.____1 = null;
    this.mockAjax({text: 'var ____1 = 1234;'});

    new Xhr('foo/bar').send();

    this.assertNull(window.____1);
  },

  testScriptsAutoEvaluationOnEvalJSFalse: function() {
    window.____1 = null;
    this.mockAjax({
      text: 'var ____1 = 1234;',
      headers: { 'Content-type': 'text/javascript' }
    });

    new Xhr('foo/bar', {
      evalJS: false
    }).send();

    this.assertNull(window.____1);
  },

  testScriptsForsedEvaluation: function() {
    window.____1 = null;
    this.mockAjax({text: 'var ____1 = 4321;'});

    new Xhr('foo/bar', {
      evalResponse: true
    }).send();

    this.assertEqual(4321, window.____1);
  },

  testInlinedScriptsEvaluation: function() {
    window.____1 = null;
    this.mockAjax({
      text: 'bla bla <script">var ____1 = 2222;</script>'
    });

    new Xhr('foo/bar').send();

    this.assertEqual(null, window.____1, "should not eval scripts by default");

    new Xhr('foo/bar', {
      evalScripts: true
    }).send();

    this.assertEqual(2222, window.____1, "should eval scripts if asked");
  },

  testJSONEvaluation: function() {
    this.mockAjax({
      text: '{"1":1, "2":2}',
      headers: {
        'Content-type': 'text/x-json'
      }
    });

    var request = new Xhr('foo/bar').send();

    this.assertEqual({1:1, 2:2}, request.json);
    this.assertEqual({1:1, 2:2}, request.responseJSON);

    var request = new Xhr('foo/bar', {
      evalJSON: false
    }).send();

    // should not process json if switched off
    this.assertNull(request.json);
    this.assertNull(request.responseJSON);
    this.assertEqual('{"1":1, "2":2}', request.text);
  },

  testJSONEvaluationWithConstructorLevelCallbacks: function() {
    this.mockAjax({
      text: '{"1":1, "2":2}',
      headers: {
        'Content-type': 'text/x-json'
      }
    });

    var result = null;
    new Xhr('/some.json', {
      onSuccess: function() {
        result = this.responseJSON;
      }
    }).send();

    this.assertEqual({1:1, 2:2}, result);
  },

  testJSONResponseValidation: function() {
    this.mockAjax({
      text: 'NOT JSON',
      headers: {
        'Content-type': 'text/x-json'
      }
    });

    this.assertThrows(function() {
      Xhr.load('/some.json');
    });
  },

  testXJSONData: function() {
    this.mockAjax({
      text: 'some text',
      headers: {
        'Content-type': 'text/plain',
        'X-JSON': '{"some":"data"}'
      }
    });

    var xhr = new Xhr('/some.url').send();

    this.assertEqual('some text', xhr.text);
    this.assertEqual('some text', xhr.responseText);
    this.assertEqual({some: 'data'}, xhr.json);
    this.assertEqual({some: 'data'}, xhr.responseJSON);
    this.assertEqual({some: 'data'}, xhr.headerJSON);
  },

  testLoadShortcut: function() {
    this.mockAjax({text: 'response text'});

    var request = Xhr.load('foo/bar', { method: 'get' });

    this.assertInstanceOf(Xhr, request);
    this.assertEqual('response text', request.text);
    this.assertEqual('get', request.method);
  },

  _html: function(el) {
    var element = el || this.el;
    element = '_' in element ? element._ : element;
    return element.innerHTML.toLowerCase()
      .replace(/\s+</mg, "<").replace(/\s+_rid[^=]+="\d+"/mg, '')
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/img, '');
  },

  testUpdateElement: function() {
    window.____1 = null;
    this.mockAjax({text: 'response text<script>var ____1 = 4444;</script>'});

    var div = new Element('div');
    var request = new Xhr('foo/bar');

    this.assertSame(request, request.update(div));
    this.assertEqual('response text', this._html(div));
    this.assertEqual(4444, window.____1);
  },

  testElementLoadHook: function() {
    window.____1 = null;
    this.mockAjax({text: 'response text<script>var ____1 = 4444;</script>'});

    var div = new Element('div');

    this.assertSame(div, div.load('foo/bar'));
    this.assertEqual('response text', this._html(div));
    this.assertEqual(4444, window.____1);
  },

  testRESTfulMethods: function() {
    var xhr = new Xhr('/url'), method, url, data;

    xhr.createXhr = function() {
      return {
        open: function(m, u, a) {
          method = m;
          url    = u
        },
        setRequestHeader: function() {},
        send: function(d) {
          data = d;
        }
      }
    };

    // testing the get request
    xhr.method = 'GET';
    xhr.send('some=data');

    this.assertEqual('get', method);
    this.assertEqual('/url?some=data', url);
    this.assertNull(data);

    // testing the post request
    xhr.method = 'POST';
    xhr.send('some=data');

    this.assertEqual('post', method);
    this.assertEqual('/url', url);
    this.assertEqual('some=data', data);

    xhr.method = 'PUT';
    xhr.send('some=data');

    this.assertEqual('post', method);
    this.assertEqual('/url', url);
    this.assertEqual('some=data&_method=put', data);

    xhr.method = 'DELETE';
    xhr.send('some=data');

    this.assertEqual('post', method);
    this.assertEqual('/url', url);
    this.assertEqual('some=data&_method=delete', data);
  }
});
