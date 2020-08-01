var zlib = require('zlib'),
    mapnik = require('mapnik'),
    termops = require('./util/termops'),
    feature = require('./util/feature'),
    ops = require('./util/ops'),
    sm = new (require('sphericalmercator'))(),
    queue = require('queue-async'),
    Locking = require('./util/locking'),
    addressCluster = require('./pure/addresscluster');
    applyaddress = require('./pure/applyaddress');

// Not only do we scan the exact point matched by a latitude, longitude
// pair, we also hit the 8 points that surround it as a rectangle.
var scanDirections = [
    [0, 0], [0,-1], [0, 1],
    [-1,1], [-1,0], [-1,-1],
    [1,-1], [1, 0], [1, 1]
];

// Returns a hierarchy of features ("context") for a given lon, lat pair.
//
// This is used for reverse geocoding: given a point, it returns possible
// regions that contain it.
//
// @param {Object} geocoder: geocoder instance
// @param {Float} lon: input longitude
// @param {Float} lat: input latitude
// @param {String} maxidx: optional type of the most detailed feature to return
// @param {String} full: boolean of whether to do a full load of all features
// @param {Function} callback
module.exports = function(geocoder, lon, lat, maxidx, full, callback) {
    var context = [];
    var indexes = geocoder.indexes;
    var types = Object.keys(indexes);
    types = types.slice(0, typeof maxidx === 'number' ? maxidx : types.length);

    // No-op context.
    if (!types.length) return callback(null, context);

    var q = queue();
    types.forEach(function(type) {
        var source = indexes[type];
        var bounds = source._geocoder.bounds;

        if (lat >= bounds[1] && lat <= bounds[3] && lon >= bounds[0] && lon <= bounds[2])
            q.defer(contextVector, source, lon, lat, full);
    });

    q.awaitAll(function(err, res) {
        if (err) return callback(err);
        var stack = [];
        var memo = {};

        res = res.reverse();
        for (var i = 0; i < res.length; i++) {
            if (!res[i]) continue;
            var name = res[i]._extid.split('.')[0];
            if (memo[name]) continue;
            memo[name] = true;
            stack.push(res[i]);
        }

        callback(null, stack);
    });
};

module.exports.contextVector = contextVector;

// For each context type, load a representative tile, look around the
// pixel we've identified, and if we find a feature, add it to the `context`
// array under an array index that represents the position of the context
// in imaginary z-space (country, town, place, etc). When there are no more
// to do, return that array, filtered of nulls and reversed.
function contextVector(source, lon, lat, full, callback) {
    var xyz = sm.xyz([lon, lat, lon, lat], source._geocoder.maxzoom);
    var z = source._geocoder.maxzoom;
    var x = xyz.minX;
    var y = xyz.minY;
    var id = source._geocoder.group || source._geocoder.id;
    var ckey = id + '/' + z + '/' + x + '/' + y;
    var lock = Locking(ckey, query);

    // Load the potential tile in which a match would occur.
    lock(function(unlock) {
        source.getTile(z, x, y, function(err, zpbf) {
            if (err && err.message !== 'Tile does not exist') return unlock(err);
            if (!zpbf) return unlock(null, false);

            var compression = false;
            if (zpbf[0] == 0x78 && zpbf[1] == 0x9C) {
                compression = 'inflate';
            } else if (zpbf[0] == 0x1F && zpbf[1] == 0x8B) {
                compression = 'gunzip';
            }
            if (!compression) return unlock(new Error('Could not detect compression of vector tile'));

            zlib[compression](zpbf, function(err, pbf) {
                if (err) return unlock(err);
                if (pbf.length === 0) return unlock(null, false);
                var vt = new mapnik.VectorTile(z, x, y);
                try {
                    vt.setData(pbf);
                } catch (err) {
                    return unlock(err);
                }
                vt.parse(function(err) {
                    if (err) return unlock(err);
                    return unlock(null, vt);
                });
            });
        });
    });

    // For a loaded vector tile, query for features at the lon,lat.
    function query(err, vt) {
        if (err) return callback(err);
        if (!vt) return callback(null, false);

        // Uses a 1000m (web mercator units) tolerance.
        vt.query(lon, lat, {
            tolerance: 1000,
            layer: source._geocoder.geocoder_layer
        }, function(err, results) {
            if (err) return callback(err);
            if (!results || !results.length) return callback(null, false);

            // Exclude features with a negative score.
            // Exclude features with a distance > tolerance (not yet
            // enforced upstream in mapnik).
            for (var i = 0; i < results.length; i++) {
                if (results[i].distance > 1000) continue;
                var attr = results[i].attributes();
                if (attr._score < 0) continue;

                //If geojson has an id in properties use that otherwise use VT id
                attr._id = attr.id || results[i].id();
                return loadFeature(source, attr, full, [lon,lat], callback);
            }

            // No matching features found.
            return callback(null, false);
        });
    }
}

// Load the full feature from geocoding data if needed, otherwise create
// a light reference with id + text.
function loadFeature(source, feat, full, query, callback) {
    var dbname = source._geocoder.name;
    var dbidx = source._geocoder.idx;
    if (!full) {
        var loaded = {};
        loaded._extid = dbname + '.' + feat._id;
        loaded._tmpid = dbidx * 1e8 + termops.feature(feat._id);
        loaded._dbidx = dbidx;
        loaded._text = feat._text || feat.name || feat.search;
        return callback(null, loaded._text ? loaded : false);
    }

    feature.getFeature(source, termops.feature(feat._id), function(err, data) {
        if (err) return callback(err);
        if (!data || !data[feat._id]) return callback();
        var loaded = data[feat._id];
        loaded._extid = dbname + '.' + feat._id;
        loaded._tmpid = dbidx * 1e8 + termops.feature(feat._id);
        loaded._dbidx = dbidx;
        if (source._geocoder.geocoder_address && loaded._cluster)
            loaded = addressCluster.reverse(loaded, query);
        else if (source._geocoder.geocoder_address && loaded._rangetype)
            loaded = applyaddress.reverse(loaded, query);

        return callback(null, loaded);
    });
}
