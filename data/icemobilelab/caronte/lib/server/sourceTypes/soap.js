// Copyright (C) 2014 IceMobile Agency B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	 http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var _ = require('underscore');
var Q = require('q');
var soap = require('soap');
var Source = require('../source');

/**
* @class SoapSource
* @constructor
* @param {Object} sourceParams
* An object describing the source to be added.
*/
var SoapSource = Source.extend({
	request: function(requestParams) {
		return new Q(requestParams)
			.then(this._mergeRequestAndSourceParams)
			.then(this._sendRequestAndHandleResponse);
	},

	_sendRequestAndHandleResponse: function(requestParams) {
		var url = requestParams.url;
		var wsdlPath = requestParams.wsdlPath;
		var soapMethod = requestParams.soapMethod;
		var data = requestParams.data;
		var headers = requestParams.headers;
		var security = requestParams.security;
		var options = {
			endpoint: url
		};

		return Q.ninvoke(soap, 'createClient', wsdlPath, options)
		.then(function(client) {
			return Q.promise(function(resolve, reject) {
				if (security) {
					client.setSecurity(
						new soap.BasicAuthSecurity(
							security.username,
							security.password
						)
					);
				}
				client[soapMethod](data, function(err, response) {
					if (err) {
						return reject(err);
					}
					resolve(response);
				}, null, headers);
			});
		});

	}
});

module.exports = SoapSource;
