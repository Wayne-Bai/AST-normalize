var distance = require('turf-distance');
var point = require('turf-point');

module.exports = dedupe;

function dedupe(features) {
    var deduped = [];
    var by_address = {};
    var by_place_name = {};

    for (var i = 0; i < features.length; i++) {
        var feature = features[i];

        var place_name = feature.place_name;
        if (by_place_name[place_name]) {
            continue;
        } else {
            by_place_name[place_name] = place_name;
        }

        if (feature.address) {
            var address = feature.address + ' ' + feature.text;
            if (by_address[address] && distance(by_address[address], point(feature.center), 'kilometers') < 10) {
                continue;
            } else {
                by_address[address] = point(feature.center);
            }
        }

        deduped.push(feature);
    }

    return deduped;
}
