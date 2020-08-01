/* global Ember */

import QueryString from 'torii/lib/query-string';

var obj,
    clientId = 'abcdef',
    responseType = 'code',
    redirectUri = 'http://localhost.dev:3000/xyz/pdq',
    optionalProperty = 'i-am-optional';

module('QueryString - Unit', {
  setup: function(){
    obj = Ember.Object.create({
      clientId:         clientId,
      responseType:     responseType,
      redirectUri:      redirectUri,
      additional_param: 'not-camelized',
      optionalProperty: optionalProperty,
      falseProp: false
    });
  },
  teardown: function(){
    Ember.run(obj, 'destroy');
  }
});

test('looks up properties by camelized name', function(){
  var qs = new QueryString(obj, ['client_id']);

  equal(qs.toString(), 'client_id='+clientId,
        'sets client_id from clientId property');
});

test('joins properties with "&"', function(){
  var qs = new QueryString(obj, ['client_id','response_type']);

  equal(qs.toString(),
        'client_id='+clientId+'&response_type='+responseType,
        'joins client_id and response_type');
});

test('url encodes values', function(){
  var qs = new QueryString(obj, ['redirect_uri']);

  equal(qs.toString(),
        'redirect_uri=http%3A%2F%2Flocalhost.dev%3A3000%2Fxyz%2Fpdq',
        'encodes uri components');
});

test('throws error if property exists as non-camelized form', function(){
  var qs = new QueryString(obj, ['additional_param']);

  throws(function(){
    qs.toString();
  }, /camelized versions of url params/,
     'throws error when the non-camelized property name exists');
});

test('throws error if property does not exist', function(){
  var qs = new QueryString(obj, ['nonexistent_property']);

  throws(function(){
    qs.toString();
  }, /Missing url param.*nonexistent_property/,
     'throws error when property does not exist');
});

test('no error thrown when specifying optional properties that do not exist', function(){
  var qs = new QueryString(obj, [], ['nonexistent_property']);

  equal(qs.toString(), '',
        'empty query string with nonexistent optional param');

});

test('optional properties is added if it does exist', function(){
  var qs = new QueryString(obj, [], ['optional_property']);

  equal(qs.toString(), 'optional_property='+optionalProperty,
        'optional_property is populated when the value is there');

});

test('value of false gets into url', function(){
  var qs = new QueryString(obj, ['false_prop']);

  equal(qs.toString(), 'false_prop=false',
        'false_prop is in url even when false');

});

test('uniq-ifies required params', function(){
  var qs = new QueryString(obj, ['client_id', 'client_id']);

  equal(qs.toString(), 'client_id='+clientId,
        'only includes client_id once');
});

test('uniq-ifies optional params', function(){
  var qs = new QueryString(obj, [], ['client_id', 'client_id']);

  equal(qs.toString(), 'client_id='+clientId,
        'only includes client_id once');
});

test('throws if optionalParams includes any requiredParams', function(){
  throws(function(){
    var qs = new QueryString(obj, ['client_id'], ['client_id']);
  }, /required parameters cannot also be optional/i);
});
