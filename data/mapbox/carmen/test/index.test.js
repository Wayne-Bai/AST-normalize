var fs = require('fs');
var util = require('util');
var Carmen = require('..');
var index = require('../lib/index');
var memFixture = require('./fixtures/mem.json');
var MBTiles = require('mbtiles');
var mem = require('../lib/api-mem');

var UPDATE = process.env.UPDATE;
var test = require('tape');
var termops = require('../lib/util/termops');
var token = require('../lib/util/token');

test('index.generateFrequency', function(assert) {
    var docs = [{_text:'main street'},{_text:'Main Road'}];
    var geocoder_tokens = token.createReplacer({'street':'st','road':'rd'});
    assert.deepEqual(index.generateFrequency(docs, {}), {
        0: [ 4 ],           // 4 total
        1025494160: [ 1 ],  // 1 road
        1986331696: [ 1 ],  // 1 street
        3935363584: [ 2 ]   // 2 main
    });
    // @TODO should 'main' in this case collapse down to 2?
    assert.deepEqual(index.generateFrequency(docs, geocoder_tokens), {
        0: [ 8 ],           // 8 total
        1025494160: [ 1 ],  // 1 road
        1263673920: [ 1 ],  // 1 rd
        1498707680: [ 1 ],  // 1 st
        1986331696: [ 1 ],  // 1 street
        3935363584: [ 4 ]   // 4 main
    });
    assert.end();
});

test('index.update -- error', function(t) {
    var docs = JSON.parse(fs.readFileSync(__dirname+'/fixtures/docs.json'));
    var to = new mem(docs, null, function() {});
    var carmen = new Carmen({ to: to });
    var zoom = 6;
    t.test('error no _id', function(q) {
        index.update(to, [{_text:'main st'}], zoom, function(err) {
            q.equal('Error: doc has no _id', err.toString());
            q.end();
        });
    });
    t.test('error no _center', function(q) {
        index.update(to, [{_text:'main st',_id:1,_zxy:['0/0/0']}], zoom, function(err) {
            q.equal('Error: doc has no _center or _geometry on _id:1', err.toString());
            q.end();
        });
    });
    t.test('indexes single doc', function(q) {
        index.update(to, [{_text:'main st',_id:1,_zxy:['0/0/0'],_center:[0,0]}], zoom, function(err) {
            q.ifError(err);
            q.end();
        });
    });
    t.test('indexes doc with _geometry and no _center or _zxy', function(q) {
        index.update(to, [{_text:'main st',_id:1,_geometry:{type:'Point', coordinates:[-75.598211,38.367333]}}], zoom, function(err) {
            q.ifError(err);
            q.end();
        });
    });
    t.test('indexes doc with _geometry and _center, but no _zxy', function(q) {
        index.update(to, [{_text:'main st',_id:1,_geometry:{type:'Point', coordinates:[-75.598211,38.367333]},_center:[-75.598211,38.367333]}], zoom, function(err) {
            q.ifError(err);
            q.end();
        });
    });
    t.end();
});

test('index', function(t) {
    var docs = JSON.parse(fs.readFileSync(__dirname+'/fixtures/docs.json'));
    var from = new mem(docs, {maxzoom:6}, function() {});
    var to = new mem(docs, null, function() {});
    var carmen = new Carmen({
        from: from,
        to: to
    });
    t.test('indexes a document', function(q) {
        carmen.index(from, to, {}, function(err) {
            q.ifError(err);
            // Updates the mem.json fixture on disk.
            if (UPDATE) fs.writeFileSync(__dirname + '/fixtures/mem.json', JSON.stringify(to.serialize(), null, 4));
            q.deepEqual(to.serialize(), memFixture);
            q.end();
        });
    });
    t.test('verifies index', function(q) {
        carmen.verify(to, function(err, stats) {
            q.ifError(err);
            q.deepEqual({ relation: [ 'term', 'phrase' ], count: [ 261, 265 ] }, stats[0]);
            q.deepEqual({ relation: [ 'term', 'grid' ], count: [ 261, 265 ] }, stats[1]);
            q.deepEqual({ relation: [ 'phrase', 'freq' ], count: [ 265, 410 ] }, stats[2]);
            q.end();
        });
    });
    t.test('analyzes index', function(q) {
        carmen.analyze(to, function(err, stats) {
            q.ifError(err);
            // Updates the mem-analyze.json fixture on disk.
            if (UPDATE) fs.writeFileSync(__dirname + '/fixtures/mem-analyze.json', JSON.stringify(stats, null, 4));
            q.deepEqual(require('./fixtures/mem-analyze.json'), stats);
            q.end();
        });
    });
    t.test('loadall index', function(q) {
        to._geocoder.unloadall('degen');
        to._geocoder.unloadall('term');
        to._geocoder.unloadall('phrase');
        to._geocoder.unloadall('grid');
        q.ok(!to._geocoder.has('degen', 0));
        q.ok(!to._geocoder.has('term', 0));
        q.ok(!to._geocoder.has('phrase', 0));
        q.ok(!to._geocoder.has('grid', 0));
        carmen.loadall(to, 1, function(err) {
            q.ifError(err);
            q.ok(to._geocoder.has('degen', 0));
            q.ok(to._geocoder.has('term', 0));
            q.ok(to._geocoder.has('phrase', 0));
            q.ok(to._geocoder.has('grid', 0));
            q.end();
        });
    });
    t.test('wipes index', function(q) {
        carmen.wipe(to, function(err) {
            q.ifError(err);
            carmen.verify(to, function(err, stats) {
                q.deepEqual({
                    freq: { '0': '' },
                    term: { '0': '' },
                    phrase: { '0': '' },
                    grid: { '0': '' },
                    degen: { '0': '' },
                    feature: { '0': '{}', '1':'{}', '2':'{}', '3':'{}' }
                }, to.serialize().shards);
                q.end();
            });
        });
    });
    t.end();
});

test('error -- zoom too high', function(t) {
    var docs = JSON.parse(fs.readFileSync(__dirname+'/fixtures/docs.json'));
    var from = new mem(docs, {maxzoom: 15}, function() {});
    var to = new mem(docs, null, function() {});
    var carmen = new Carmen({
        from: from,
        to: to
    });
    carmen.index(from, to, {}, function(err) {
        t.equal('Error: zoom must be less than 15 --- zoom was 15', err.toString());
        t.end();
    });
});

test('error -- zoom too low', function(t) {
    var docs = JSON.parse(fs.readFileSync(__dirname+'/fixtures/docs.json'));
    var from = new mem(docs, {maxzoom: -1}, function() {});
    var to = new mem(docs, {maxzoom:10}, function() {});
    var carmen = new Carmen({
        from: from,
        to: to
    });
    carmen.index(from, to, {}, function(err) {
        t.equal('Error: zoom must be greater than 0 --- zoom was -1', err.toString());
        t.end();
    });
});

test('index phrase collection', function(assert) {
    var memDocs = JSON.parse(fs.readFileSync(__dirname+'/fixtures/docs.json'));
    var conf = { test:new mem(memDocs, {maxzoom:6}, function() {}) };
    var c = new Carmen(conf);
    var docs = [{
        _id:1,
        _text:'fake street',
        _zxy:['6/32/32'],
        _center:[0,0]
    }, {
        _id:2,
        _text:'fake street',
        _zxy:['6/32/32'],
        _center:[0,0]
    }];
    index.update(conf.test, docs, 6, afterUpdate);
    function afterUpdate(err) {
        assert.ifError(err);
        assert.deepEqual(conf.test._geocoder.list('phrase',0), ['559741915'], '1 phrase');
        assert.deepEqual(conf.test._geocoder.get('phrase',559741915), [ 559417695, 1986331711 ], 'phrase has 2 terms');

        assert.deepEqual(conf.test._geocoder.list('grid',0), [ '559741915' ], '1 grid');
        assert.deepEqual(conf.test._geocoder.get('grid',559741915).sort(), [ 17593259786241, 17593259786242 ], 'grid has 2 zxy+feature ids');

        assert.deepEqual(conf.test._geocoder.list('term',0), ['559417680'], '1 term (significant)');
        assert.deepEqual(conf.test._geocoder.get('term',559417680), [ 559741915, 559741915 ], 'term => phrase is not deduped (yet)');

        assert.deepEqual(conf.test._geocoder.list('degen',0), [ '559417680', '1986331696', '2784490928', '3259748752', '3529213088', '4027714032' ], '6 degens');
        assert.deepEqual(conf.test._geocoder.get('degen',559417680), [ 559417680 ], 'degen => term is not deduped (yet)');
        assert.deepEqual(conf.test._geocoder.get('degen',2784490928), [ 559417681 ], 'degen => term is not deduped (yet)');

        assert.end();
    }
});

test('error -- _geometry too high resolution', function(t) {
    var docs = JSON.parse(fs.readFileSync(__dirname+'/fixtures/hugedoc.json'));
    var from = new mem(docs, {maxzoom: 6}, function() {});
    var to = new mem(docs, null, function() {});
    var carmen = new Carmen({
        from: from,
        to: to
    });
    carmen.index(from, to, {}, function(err) {
        t.equal('Error: Polygons may not have more than 50k vertices. Simplify your polygons, or split the polygon into multiple parts.', err.toString());
        t.end();
    });
});

test('error -- _zxy too large tile-cover', function(t) {
    var docs = [{
        _id:2,
        _text:'fake street',
        _zxy:['6/32/32'],
        _center:[0,0]
    }, {
        _id:1,
        _text:'fake street',
        _zxy:new Array(10001),
        _center:[0,0]
    }];
    var from = new mem(docs, {maxzoom: 6}, function() {});
    var to = new mem(docs, null, function() {});
    var carmen = new Carmen({
        from: from,
        to: to
    });
    carmen.index(from, to, {}, function(err) {
        t.equal('Error: doc._zxy exceeded 10000, doc id:1', err.toString());
        t.end();
    });
});

test('index.cleanDocs', function(assert) {
    var docs;
    var sourceWithAddress = {_geocoder:{geocoder_address:true}};
    var sourceWithoutAddress = {_geocoder:{geocoder_address:false}};

    assert.equal(typeof index.cleanDocs(sourceWithAddress, [{_geometry:{}}])[0]._geometry, 'object', 'with address: preserves geometry');
    assert.equal(typeof index.cleanDocs(sourceWithoutAddress, [{_geometry:{}}])[0]._geometry, 'undefined', 'without address: removes geometry');
    assert.equal(typeof index.cleanDocs(sourceWithAddress, [{_geometry:{},_cluster:{}}])[0]._geometry, 'undefined', 'with cluster: removes geometry');
    assert.end();
});

test('index.teardown', function(assert) {
    index.teardown();
    assert.end();
});

