var dedupe = require('../lib/util/dedupe');
var tape = require('tape');

tape('dedupe', function(assert) {
    var features;

    features = [
        { place_name: 'main st springfield', text: 'main st', center:[0,0] },
        { place_name: 'wall st springfield', text: 'wall st', center:[10,0] },
        { place_name: 'main st springfield', text: 'main st', center:[20,0] },
    ];
    assert.deepEqual(dedupe(features), [
        features[0],
        features[1]
    ], 'dedupes by place_name');

    features = [
        { place_name: '100 main st springfield 00001', address:100, text: 'main st', center:[0,0] },
        { place_name: '100 main st springfield 00002', address:100, text: 'main st', center:[20,0] },
    ];
    assert.deepEqual(dedupe(features), [
        features[0],
        features[1],
    ], 'dupe identical addresses when dist >= 10km');

    features = [
        { place_name: '100 main st springfield 00001', address:100, text: 'main st', center:[0.000,0] },
        { place_name: '100 main st springfield 00002', address:100, text: 'main st', center:[0.001,0] },
    ];
    assert.deepEqual(dedupe(features), [
        features[0]
    ], 'dedupes identical addresses when dist < 10km');

    assert.end();
});

