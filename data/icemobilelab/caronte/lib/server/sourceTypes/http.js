// Copyright (C) 2014 IceMobile Agency B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var _ = require('underscore');
var Q = require('q');
var logger = require('log4js').getLogger('caronte');
var request = require('request');
var Source = require('../source');
var ParametrizedUrl = require('../parametrizedUrl');

	/**
	 * @class HttpSource
	 * @extends Source
	 * @constructor
	 * @param {Object} sourceParams
	 * An object describing the source to be added.
	 * @param {String} sourceParams.url The url of the request.
	 * @param {String} [sourceParams.method='GET'] Either 'GET', 'POST' or 'PUT'.
	 * @param {Function} [sourceParams.serializer] Serializer for the request.
	 * @param {Function} [sourceParams.deserializer] Deserializer for response.
	 * @param {Object} [sourceParams.headers] Headers for every request.
	 * @param {Object} [sourceParams.json] Request contents.
	 * @param {Object} [sourceParams.params] Parameters for every request.
	 * @param {Object} [sourceParams.query] Query parameters for every request.
	 * @param {Object} [sourceParams.auth] Optional http-auth infofmation.
	 * @param {Object} [sourceParams.auth.user]
	 * @param {Object} [sourceParams.auth.pass]
	 * @return {Mixed}
	 * An error object, if registration fails.
	 */
var HttpSource = Source.extend({

	_proccessSourceParams: function (sourceParams) {
		sourceParams = sourceParams || {};
		sourceParams.parametrizedUrl = new ParametrizedUrl(sourceParams.url);
		sourceParams.params = sourceParams.params || {};
		sourceParams.query = sourceParams.query || {};
		sourceParams.method = (sourceParams.method || 'get').toLowerCase();
		sourceParams.headers = sourceParams.headers || {};

		var serializer = sourceParams.serializer;
		if (serializer) { this._serialize = serializer; }

		var deserializer = sourceParams.deserializer;
		if (deserializer) { this._deserialize = deserializer; }

		return sourceParams;
	},

	_serialize: function (requestParams) {
		requestParams.url = requestParams.parametrizedUrl
					.getUrl(requestParams.params, requestParams.query);
		return _.pick(requestParams, 'url', 'method', 'headers', 'json',
					'auth');
	},

	_sendRequest: function (requestParams) {
		logger.trace('Caronte - http request: ' +
				JSON.stringify(requestParams, null, 3));
		return Q.nfcall(request, requestParams);
	},

	_deserialize: function (json) {
		//Don't deserialize empty responses.
		if (!json) {
			return json;
		}
		if (typeof json === 'object') {
			return json;
		}
		return JSON.parse(json);
	},

	_handleResponse: function (response) {

		logger.trace('Caronte - http response: ' + response[1]);
		/**
		 * response[0]: The complete response.
		 * response[1]: Only the body of the response.
		 */
		var deferred = Q.defer();
		//Check for error codes (every 2** code is fine)
		var statusCode = response[0].statusCode;
		var body = response[0].body;
		if (Math.floor(statusCode / 100) !== 2) {
			var error = new Error('Caronte - HttpSource - handleResponse - ' +
					'Server responded with an error code.');
			error.code = 'request.http.response.' + statusCode;
			error.body = body;
			error.statusCode = statusCode;
			deferred.reject(error);
		}
		else {
			deferred.resolve(response[1]);
		}
		return deferred.promise;
	},

	_handleError: function (error) {
		var body = error.body;
		return new Q(this._deserialize(body)).then(function (deserializedBody) {
			error.body = deserializedBody;
		}).fin(function () {
			return Q.reject(error);
		});
	}
});

module.exports = HttpSource;
