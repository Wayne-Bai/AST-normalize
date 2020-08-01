var getSetRelevance = require('carmen-cache').Cache.setRelevance;
var applyAddress = require('./pure/applyaddress');
var addressCluster = require('./pure/addresscluster');
var sm = new(require('sphericalmercator'))();
var queue = require('queue-async');
var context = require('./context');
var termops = require('./util/termops');
var feature = require('./util/feature');
var Relev = require('./util/relev');

var mp2_14 = Math.pow(2, 14);
var mp2_28 = Math.pow(2, 28);

module.exports = verifymatch;
module.exports.sortFeature = sortFeature;
module.exports.sortContext = sortContext;

function verifymatch(query, stats, geocoder, matched, options, callback) {
    var sets = matched.sets;
    var results = matched.results;
    var coalesced = matched.coalesced;

    var addrMap = {};

    var contexts = [];
    var start = +new Date();
    var q = queue(10);

    options.limit_verify = options.limit_verify || 10;

    // Limit initial feature check to the best 40 max.
    if (results.length > 40) results = results.slice(0,40);

    results.forEach(function(num) { q.defer(loadFeature, num); });

    q.awaitAll(loadContexts);

    // For each result, load the feature from its Carmen index so that we can
    // then load all of the relevant contexts for that feature.
    function loadFeature(num, callback) {
        var term = new Relev(num);
        var source = geocoder.byidx[term.idx];
        feature.getFeature(source, term.id, function featureLoaded(err, features) {
            if (err) return callback(err);

            //Calculate to see if there is room for an address in the query based on bitmask
            address = termops.maskAddress(query, term.reason);

            var result = [];
            for (var id in features) {
                // To exclude false positives from feature hash collisions
                // check the feature center coord and ensure it is in the
                // coalesced result set.
                // @TODO for fully accurate results, iterate through
                // coalesced[coord] for a matching feature id.
                var feat = features[id];
                // filter out altnames, scored as -1
                if (typeof feat._score !== 'undefined' && feat._score < 0) continue;
                var bbox = sm.xyz([feat._center[0], feat._center[1], feat._center[0], feat._center[1]], source._geocoder.zoom);
                var coord = (source._geocoder.zoom * mp2_28) + (bbox.minX * mp2_14) + (bbox.minY);
                var checks = coalesced[coord];
                if (address && feat._rangetype && source._geocoder.geocoder_address) {
                    feat._address = address.addr;
                    feat._geometry = applyAddress(feat, address.addr) || applyAddress(feat, address.addr.replace(/\D/, ''));
                    feat._center = feat._geometry && feat._geometry.coordinates;
                    checks = checks && feat._geometry;
                }
                else if (address && feat._cluster && source._geocoder.geocoder_address) {
                    feat._address = address.addr;
                    feat._geometry = addressCluster(feat, address.addr) || addressCluster(feat, address.addr.replace(/\D/, ''));
                    feat._center = feat._geometry && feat._geometry.coordinates;
                    checks = checks && feat._geometry;
                }
                if (checks) {
                    feat._extid = source._geocoder.name + '.' + id;
                    addrMap[feat._extid] = address;
                    feat._tmpid = term.tmpid;
                    feat._dbidx = term.idx;
                    feat._relev = term.relev;
                    result.push(feat);
                }
            }
            return callback(null, result);
        });
    }

    function loadContexts(err, result) {
        if (err) return callback(err);

        // Flatten result array
        var features = [];
        features = features.concat.apply(features, result);
        features.sort(sortFeature);

        // Disallow more than options.limit_verify of the best results at this point.
        if (features.length > options.limit_verify) features = features.slice(0, options.limit_verify);

        var q = queue(5);
        for (var i = 0; i < features.length; i++) q.defer(function(f, done) {
            var name = geocoder.byidx[f._dbidx]._geocoder.name;
            var firstidx = geocoder.byname[name][0]._geocoder.idx;
            context(geocoder, f._center[0], f._center[1], firstidx, false, function(err, context) {
                if (err) return done(err);
                // Push feature onto the top level.
                context.unshift(f);
                return done(null, context);
            });
        }, features[i]);
        q.awaitAll(finalize);
    }

    function finalize(err, contexts) {
        if (err) return callback(err);
        var subsets;
        for (var j = 0, cl = contexts.length; j < cl; j++) {
            subsets = [];
            for (var i = 0, cjl = contexts[j].length; i < cjl; i++) {
                var a = contexts[j][i];
                if (!sets[a._tmpid]) continue;
                if (subsets.length === 0 && addrMap[a._extid]) {
                    var relev = new Relev(sets[a._tmpid]);
                    var addrMask = Math.pow(2, addrMap[a._extid].pos);

                    //Converts address position to bitmask and compares against reason
                    if ((relev.reason & addrMask) === 0 && geocoder.byidx[relev.idx]._geocoder.geocoder_address) {
                        relev.count += 1;
                        relev.reason += addrMask;
                        subsets.push(Relev.encode(relev));
                    } else {
                        subsets.push(sets[a._tmpid]);
                    }
                } else {
                    subsets.push(sets[a._tmpid]);
                }
            }
            contexts[j]._relevance = getSetRelevance(query.length, subsets, geocoder.names).relevance;
            contexts[j]._typeindex = geocoder.names[contexts[j][0]._dbidx];
        }

        contexts.sort(sortContext);

        stats.contextTime = +new Date() - start;
        stats.contextCount = contexts.length;

        return callback(null, contexts);
    }
}

function sortFeature(a, b) {
    return (b._relev - a._relev) ||
        ((b._address?1:0) - (a._address?1:0)) ||
        ((a._geometry&&a._geometry.omitted?1:0) - (b._geometry&&b._geometry.omitted?1:0)) ||
        ((b._score||0) - (a._score||0)) ||
        0;
}

function sortContext(a, b) {
    // First, compute the relevance of this query term against
    // each set.
    if (a._relevance > b._relevance) return -1;
    if (a._relevance < b._relevance) return 1;

    // for address results, prefer those from point clusters
    if (a[0]._address && b[0]._address) {
        if (a[0]._cluster && !b[0]._cluster) return -1;
        if (b[0]._cluster && !a[0]._cluster) return 1;
    }

    // omitted difference
    var omitted = ((a[0]._geometry&&a[0]._geometry.omitted?1:0) - (b[0]._geometry&&b[0]._geometry.omitted?1:0));
    if (omitted !== 0) return omitted;

    if (a[0]._distance && b[0]._distance) {
        if (a[0]._distance < b[0]._distance) return -1;
        if (a[0]._distance > b[0]._distance) return 1;
    }

    // secondary sort by score key.
    var as = a[0]._score || 0;
    var bs = b[0]._score || 0;
    if (as > bs) return -1;
    if (as < bs) return 1;

    // primary sort by result's index.
    if (a._typeindex < b._typeindex) return -1;
    if (a._typeindex > b._typeindex) return 1;

    // last sort by id.
    if (a[0]._id < b[0]._id) return -1;
    if (a[0]._id > b[0]._id) return 1;
    return 0;
}
