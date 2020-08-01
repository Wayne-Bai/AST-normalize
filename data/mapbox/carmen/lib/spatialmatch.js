var spatialMatch = require('carmen-cache').Cache.spatialMatch;

module.exports = spatialmatch;

// Given that we've geocoded potential results in multiple sources, given
// arrays of `feats` and `grids` of the same length, combine matches that
// are over the same point, factoring in the zoom levels on which they
// occur.
// Calls `callback` with `(err, contexts, relevd)` in which
//
// @param `contexts` is an array of bboxes which are assigned scores
// @param `relevd` which is an object mapping place ids to places
// @param {Object} geocoder the geocoder instance
// @param {Array} feats an array of feature objects
// @param {Array} grids an array of grid objects
// @param {Array} zooms an array of zoom numbers
// @param {Function} callback
function spatialmatch(query, stats, geocoder, feats, grids, zooms, options, callback) {
    spatialMatch(query.length, feats, grids, zooms, geocoder.names, spatialMatchAfter);

    function spatialMatchAfter(err, res) {
        if (err) return callback(err);
        return callback(null, res);
    }
}
