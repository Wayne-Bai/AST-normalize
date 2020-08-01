var util             = require('util'),
    AbstractGeocoder = require('./abstractgeocoder');

/**
 * Constructor
 */
var OpenCageGeocoder = function OpenCageGeocoder(httpAdapter, apiKey, options) {
    this.options = ['language'];

    OpenCageGeocoder.super_.call(this, httpAdapter, options);

    if (!apiKey || apiKey == 'undefinded') {
        throw new Error(this.constructor.name + ' needs an apiKey');
    }

    this.apiKey = apiKey;
    this._endpoint = 'http://api.opencagedata.com/geocode/v1/json';
};

util.inherits(OpenCageGeocoder, AbstractGeocoder);

/**
* Geocode
* @param <string>   value    Value to geocode (Address)
* @param <function> callback Callback method
*/
OpenCageGeocoder.prototype._geocode = function(value, callback) {
    var _this = this;

    var params = this._getCommonParams();
    params.q = value;

    this.httpAdapter.get(this._endpoint, params, function(err, result) {

        if (err) {
            return callback(err);
        } else {

            var results = [];

			if (result && result.results instanceof Array) {
				for (var i = 0; i < result.results.length; i++) {
					results.push(_this._formatResult(result.results[i]));
				}
			}

            results.raw = result;
            callback(false, results);
        }

    });

};

OpenCageGeocoder.prototype._formatResult = function(result) {

    return {
        'latitude' : result.geometry.lat,
        'longitude' : result.geometry.lng,
        'country' : result.components.country,
        'city' : result.components.city,
        'state' : result.components.state,
        'zipcode' : result.components.postcode,
        'streetName': result.components.road,
        'streetNumber' : result.components.house_number,
        'countryCode' : result.components.country_code,
        'county': result.components.county
    };
};

/**
* Reverse geocoding
* @param {lat:<number>,lon:<number>}  lat: Latitude, lon: Longitude
* @param <function> callback Callback method
*/
OpenCageGeocoder.prototype._reverse = function(query, callback) {
    var lat = query.lat;
    var lng = query.lon;

    var _this = this;

    var params = this._getCommonParams();
    params.q = lat + ' ' + lng;

    this.httpAdapter.get(this._endpoint, params, function(err, result) {
        if (err) {
            throw err;
        } else {
            var results = [];

            if (result && result.results instanceof Array) {
                for (var i = 0; i < result.results.length; i++) {
                    results.push(_this._formatResult(result.results[i]));
                }
            }

            results.raw = result;
            callback(false, results);
        }
    });
};

/**
* Prepare common params
*
* @return <Object> common params
*/
OpenCageGeocoder.prototype._getCommonParams = function(){
    var params = {};
    params.key = this.apiKey;

    if (this.options.language) {
        params.language = this.options.language;
    }

    return params;
};

module.exports = OpenCageGeocoder;
