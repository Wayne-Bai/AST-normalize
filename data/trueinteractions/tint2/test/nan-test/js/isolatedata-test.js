const test     = require('tap').test
    , testRoot = require('path').resolve(__dirname, '..')
    , bindings = require('bindings')({ module_root: testRoot, bindings: 'isolatedata' });

test('isolatedata', function (t) {
  t.plan(2);

  var isolatedata = bindings;
  t.type(isolatedata.setAndGet, 'function');
  t.ok(isolatedata.setAndGet);
});
