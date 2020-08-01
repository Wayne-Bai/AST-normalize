var assert = require('assert');
var test = require('tap').test;
var async = require('async');
var Client = require('../');
var client = Client();

test('setClientId', function(t) {
  var cbCount = 0;
  client.setClientId('testrunner', function (err) {
    t.equal(++cbCount, 1);
    t.notOk(err, err && err.message);
    t.end();
  });
});

test('getClientId', function(t) {
  var cbCount = 0;
  client.getClientId(function(err, clientId) {
    t.equal(++cbCount, 1);
    t.notOk(err, err && err.message);
    t.equal(clientId, 'testrunner');
    t.end();
  });
});


test('ping', function(t) {
  var cbCount = 0;
  client.ping(function(err) {
    t.equal(++cbCount, 1);
    t.notOk(err, err && err.message);
    t.end();
  });
});

test('getServerInfo', function (t) {
  var cbCount = 0;
  client.getServerInfo(function (err, reply) {
    t.equal(++cbCount, 1);
    t.notOk(err, err && err.message);
    t.type(reply.node, 'string');
    t.type(reply.server_version, 'string');
    t.end();
  });
});

test('put', function (t) {
  var cbCount = 0;
  client.put({
    bucket: 'test',
    key: 'test',
    content: { value: '{"test":"data"}',
    content_type: 'application/json',
    indexes: [{ key: 'test_bin', value: 'test' }] },
    return_body: true },
    function (err, reply) {
      t.equal(++cbCount, 1);
      t.notOk(err, err && err.message);
      t.equal(reply.content[0].value, '{"test":"data"}');
      t.end();
    });
});

test('get', function (t) {
  var cbCount = 0;
  client.get({ bucket: 'test', key: 'test' }, function (err, reply) {
    t.equal(++cbCount, 1);
    t.notOk(err, err && err.message);
    t.ok(Array.isArray(reply.content));
    t.equal(reply.content[0].value, '{"test":"data"}');
    t.end();
  });
});


test('put with vector clock', function (t) {
  var cbCount = 0;
  var options = { bucket: 'test', key: 'test-vclock', content: { value: '{"test":"data"}', content_type: 'application/json' }, return_body: true };
  client.put(options, function (err, reply) {
    t.equal(++cbCount, 1);
    t.notOk(err, err && err.message);
    var options = { bucket: 'test', key: 'test-vclock', content: { value: '{"test":"data"}', content_type: 'application/json' }, return_body: true };
    options.vclock = reply.vclock;
    client.put(options, function(reply) {
      t.notOk(err, err && err.message);
      t.end();
    });
  });
});

test('put with index', function(t) {
  var cbCount = 0;
  var indexes = [{ key: 'key1_bin', value: 'value1' }, { key: 'key2_bin', value: 'value2' }];
  var options = { bucket: 'test', key: 'test-put-index', content: { value: '{"test":"data"}', content_type: 'application/json', indexes: indexes }, return_body: true };

  client.put(options, function(err, reply) {
    t.equal(++cbCount, 1);
    t.notOk(err, err && err.message);
    t.deepEqual(reply.content[0].indexes, indexes);
    t.end();
  });
});

test('put large object', function(t) {
  var cbCount = 0;
  var value = {};
  for (var i = 0; i < 5000; i++) {
    value['test_key_' + i] = 'test_value_' + i;
  }

  client.put({
    bucket: 'test',
    key: 'large_test',
    content: { value: JSON.stringify(value), content_type: 'application/json' }},
    function (err, reply) {
      t.equal(++cbCount, 1);
      t.notOk(err, err && err.message);
      t.end();
    });
});

test('get large', function(t) {
  var cbCount = 0;
  var value = {};
  for (var i = 0; i < 5000; i++) {
    value['test_key_' + i] = 'test_value_' + i;
  }
  client.get({
    bucket: 'test',
    key: 'large_test' },
    function (err, reply) {
      t.equal(++cbCount, 1);
      t.notOk(err, err && err.message);
      t.ok(Array.isArray(reply.content));
      t.equal(reply.content[0].value, JSON.stringify(value));
      t.end();
    });

});

test('getIndex', function(t) {
  var cbCount = 0;
  client.getIndex({
    bucket: 'test',
    index: 'test_bin',
    qtype: 0,
    key: 'test' },
    function (err, reply) {
      t.equal(++cbCount, 1);
      t.notOk(err, err && err.message);
      t.ok(Array.isArray(reply.keys));
      if (! reply.keys) return t.end();
      t.equal(reply.keys[0], 'test');
      t.end();
    });
});

test('getBuckets', function(t) {
  var cbCount = 0;
  client.getBuckets(function(err, buckets) {
    t.equal(++cbCount, 1);
    t.notOk(err, err && err.message);
    t.ok(Array.isArray(buckets));
    t.end();
  });
});

test('setBucket', function(t) {
  var cbCount = 0;
  client.setBucket('test',
    { allow_mult: true, n_val: 3 },
    function (err, reply) {
      t.equal(++cbCount, 1);
      t.notOk(err, err && err.message);
      t.end();
    });
});

test('getBucket', function(t) {
  var cbCount = 0;
  client.getBucket('test', function (err, bucket) {
    t.equal(++cbCount, 1);
    t.notOk(err, err && err.message);
    t.strictEqual(bucket.n_val, 3);
    t.strictEqual(bucket.allow_mult, true);
    t.end();
  });
});

test('resetBucket', function(t) {
  var cbCount = 0;
  client.setBucket('test', { allow_mult: false, n_val: 3 },
    function (err, reply) {
      t.equal(++cbCount, 1);
      t.notOk(err, err && err.message);
      t.end();
    });
});

test('getKeys', function (t) {
  var cbCount = 0;
  client.getKeys('test', function (err, keys) {
    t.equal(++cbCount, 1);
    t.notOk(err, err && err.message);
    t.ok(Array.isArray(keys));
    if (! keys) return t.end();
    var len = keys.length;
    t.ok(len > 0, 'keys length is should be > 0');
    keys = keys.filter(function (key) {
      return (key.toString() === 'test' || key.toString() === 'large_test' || key.toString() === 'test-vclock' || key.toString() === 'test-put-index')
    });
    t.equal(keys.length, len);
    t.end();
  });
});

test('getKeys streaming', function(t) {
  var cbCount = 0;
  var expectingKeys = ['test', 'large_test', 'test-vclock', 'test-put-index'];

  var s = client.getKeys('test' );
  var count = 0;
  s.on('readable', function () {
    var key;
    while(key = s.read()) {
      count ++;
      t.ok(~expectingKeys.indexOf(key), 'I know key ' + key);
    }
  });

  s.once('end', function() {
    t.equal(++cbCount, 1);
    t.ok(count > 0);
    t.end();
  });
});

test('search', function (t) {
  var cbCount = 0;
  client.search({ index: 'key1_bin', q: 'test' }, function (err, reply) {
    t.equal(++cbCount, 1);
    t.notOk(err, err && err.message);
    t.type(reply, 'object');
    t.end();
  });
});

test('mapred', function(t) {
  var cbCount = 0;
  var request = {
    inputs: 'test',
    query: [
      {
        map: {
          source: 'function (v) { return [[v.bucket, v.key]]; }',
          language: 'javascript',
          keep: true
        }
      }]};

  var params = { request: JSON.stringify(request), content_type: 'application/json' };

  client.mapred(params, function (err, responses) {
    t.equal(++cbCount, 1);
    t.notOk(err, err && err.message);
    if (!responses) return t.end();
    t.ok(responses.length > 0, 'got some responses');
    responses.forEach(function(response) {
      t.type(response.phase, 'number');
      t.type(response, 'object');
    });
    t.end();
  });

});

test('mapred streams', function(t) {
  var cbCount = 0;
  var request = {
    inputs: [['test', 'test']],
    query: [
      {
        map: {
          source: 'function (v) { return [[v.bucket, v.key]]; }',
          language: 'javascript',
          keep: true
        }},
      {
        map: {
          name: 'Riak.mapValuesJson',
          language: 'javascript',
          keep: true
      }}]};

  var params = { request: JSON.stringify(request), content_type: 'application/json' };

  var s = client.mapred(params);

  var count = 0;
  s.on('readable', function() {
    var response;
    while (response = s.read()) {
      count ++;
      t.type(response.phase, 'number');
      t.type(response, 'object');
    }
  });

  s.once('end', function() {
    t.equal(++cbCount, 1);
    t.ok(count > 0, 'response count > 0');
    t.end();
  })

});


test('del', function(t) {
  var cbCount = 0;
  var keys = ['test', 'large_test', 'test-vclock', 'test-put-index'];
  async.each(keys, del, function(err) {
    t.equal(++cbCount, 1);
    t.notOk(err, err && err.message);
    t.end();
  });

  function del(key, cb) {
    client.del('test', key, cb);
  }
});

test('disconnects', function(t) {
  client.disconnect();
  client.once('end', function() {
    t.end();
  })
});