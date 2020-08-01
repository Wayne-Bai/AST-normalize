var fs = require('fs');
var util = require('util');
var Carmen = require('..');
var tilelive = require('tilelive');
var context = require('../lib/context');
var UPDATE = process.env.UPDATE;
var test = require('tape');
var zlib = require('zlib');
var path = require('path');
var mapnik = require('mapnik');

mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins,'ogr.input'));
mapnik.register_datasource(path.join(mapnik.settings.paths.input_plugins,'geojson.input'));

test('context vector', function(t) {
    var geocoder = new Carmen({
        country: Carmen.auto(__dirname + '/fixtures/01-ne.country.s3'),
        province: Carmen.auto(__dirname + '/fixtures/02-ne.province.s3')
    });

    geocoder._open(function() {
        t.test('context vt full', function(q) {
            context(geocoder, 0, 40, null, true, function(err, contexts) {
                q.ifError(err);
                q.equal(contexts.length, 2);
                if (UPDATE) fs.writeFileSync(__dirname + '/fixtures/context-vt-full.json', JSON.stringify(contexts, null, 4));
                q.deepEqual(contexts, require(__dirname + '/fixtures/context-vt-full.json'));
                q.end();
            });
        });
        t.test('context vt light', function(q) {
            context(geocoder, 0, 40, null, false, function(err, contexts) {
                q.ifError(err);
                q.equal(contexts.length, 2);
                if (UPDATE) fs.writeFileSync(__dirname + '/fixtures/context-vt-light.json', JSON.stringify(contexts, null, 4));
                q.deepEqual(contexts, require(__dirname + '/fixtures/context-vt-light.json'));
                q.end();
            });
        });
    });
});

test('contextVector deflate', function(t) {
    var source = {
        getTile: function(z,x,y,callback) {
            return callback(null, fs.readFileSync(__dirname + '/fixtures/0.0.0.vector.pbf'), {
                'content-type': 'application/x-protobuf',
                'content-encoding': 'deflate'
            });
        },
        _geocoder: {
            geocoder_layer: 'data',
            maxzoom: 0,
            minzoom: 0,
            name: 'test',
            id: 'testA',
            idx: 1
        }
    };
    context.contextVector(source, -97.4707, 39.4362, false, function(err, data) {
        t.ifError(err);
        t.deepEqual(data, {
            _extid: 'test.5',
            _dbidx: 1,
            _tmpid: 100000005,
            _text: 'United States of America, United States, America, USA, US'
        });
        t.end();
    });
});

test('contextVector gzip', function(t) {
    var source = {
        getTile: function(z,x,y,callback) {
            return callback(null, fs.readFileSync(__dirname + '/fixtures/0.0.0.vector.pbfz'), {
                'content-type': 'application/x-protobuf',
                'content-encoding': 'gzip'
            });
        },
        _geocoder: {
            geocoder_layer: 'data',
            maxzoom: 0,
            minzoom: 0,
            name: 'test',
            id: 'testA',
            idx: 1
        }
    };
    context.contextVector(source, -97.4707, 39.4362, false, function(err, data) {
        t.ifError(err);
        t.deepEqual(data, {
            _dbidx: 1,
            _extid: 'test.5',
            _tmpid: 100000005,
            _text: 'United States of America, United States, America, USA, US'
        });
        t.end();
    });
});

test('contextVector badbuffer', function(t) {
    var source = {
        getTile: function(z,x,y,callback) {
            return callback(null, new Buffer('lkzvjlkajsdf'));
        },
        _geocoder: {
            geocoder_layer: 'data',
            maxzoom: 0,
            minzoom: 0,
            name: 'test',
            id: 'testA'
        }
    };
    context.contextVector(source, -97.4707, 39.4362, false, function(err, data) {
        t.equal(err.toString(), 'Error: Could not detect compression of vector tile');
        t.end();
    });
});

//Carmen should gracefully ignore empty VT buffers
test('contextVector empty VT buffer', function(assert) {
    var vtile = new mapnik.VectorTile(0,0,0);
    vtile.addGeoJSON(JSON.stringify({
        "type": "FeatureCollection",
        "features": []
    }),"data");
    zlib.gzip(vtile.getData(), function(err, buffer) {
        assert.ifError(err);
        var source = {
            getTile: function(z,x,y,callback) {
                return callback(null, buffer);
            },
            _geocoder: {
                geocoder_layer: 'data',
                maxzoom: 0,
                minzoom: 0,
                name: 'test',
                id: 'testA'
            }
        };
        context.contextVector(source, 0, 0, false, function(err, data) {
            assert.ifError(err);
            assert.end();
        });
    });
});

test('contextVector ignores negative score', function(assert) {
    var vtile = new mapnik.VectorTile(0,0,0);
    vtile.addGeoJSON(JSON.stringify({
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [ 0,0 ] },
                "properties": { "_text": "A", "_score": -1 }
            },
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [ 0,0 ] },
                "properties": { "_text": "B" }
            }
        ]
    }),"data");
    zlib.gzip(vtile.getData(), function(err, buffer) {
        assert.ifError(err);
        var source = {
            getTile: function(z,x,y,callback) {
                return callback(null, buffer);
            },
            _geocoder: {
                geocoder_layer: 'data',
                maxzoom: 0,
                minzoom: 0,
                name: 'test',
                id: 'testA'
            }
        };
        context.contextVector(source, 0, 0, false, function(err, data) {
            assert.ifError(err);
            assert.equal(data._text, 'B');
            assert.end();
        });
    });
});

test('contextVector only negative score', function(assert) {
    var vtile = new mapnik.VectorTile(0,0,0);
    vtile.addGeoJSON(JSON.stringify({
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": { "type": "Point", "coordinates": [ 0,0 ] },
                "properties": { "_text": "A", "_score": -1 }
            }
        ]
    }),"data");
    zlib.gzip(vtile.getData(), function(err, buffer) {
        assert.ifError(err);
        var source = {
            getTile: function(z,x,y,callback) {
                return callback(null, buffer);
            },
            _geocoder: {
                geocoder_layer: 'data',
                maxzoom: 0,
                minzoom: 0,
                name: 'test',
                id: 'testA'
            }
        };
        context.contextVector(source, 0, 0, false, function(err, data) {
            assert.ifError(err);
            assert.equal(data, false);
            assert.end();
        });
    });
});

test('contextVector restricts distance', function(assert) {
    var vtile = new mapnik.VectorTile(0,0,0);
    // o-----x <-- query
    // |\    |     the distance in this case is millions of miles
    // | \   |     (24364904ish)
    // |  \  |
    // |   \ |
    // |    \|
    // +-----o
    vtile.addGeoJSON(JSON.stringify({
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": { "type": "LineString", "coordinates": [ [-180,85],[180,-85] ] },
                "properties": { "_text": "A" }
            }
        ]
    }),"data");
    zlib.gzip(vtile.getData(), function(err, buffer) {
        assert.ifError(err);
        var source = {
            getTile: function(z,x,y,callback) {
                return callback(null, buffer);
            },
            _geocoder: {
                geocoder_layer: 'data',
                maxzoom: 0,
                minzoom: 0,
                name: 'test',
                id: 'testA'
            }
        };
        context.contextVector(source, 170, 80, false, function(err, data) {
            assert.ifError(err);
            assert.equal(data, false);
            assert.end();
        });
    });
});
