(function() {
    'use strict';

    angular.module('app.services.api')
        .factory('HttpFactory', HttpFactory);

    /* @ngInject */
    function HttpFactory($http, $q, $rootScope) {
        return function(command, url) {
            var thisRequest = this;
            var params = {
                Command: command
            };
            var secret = null;

            this.authenticate = function(sessionKey, sessionSecret) {
                params.Session = sessionKey;
                secret = sessionSecret;

                return thisRequest;
            };

            this.bound = function(start, limit) {
                params.Start = start;
                params.Limit = limit;

                return thisRequest;
            };

            this.byId = function(id) {
                return this.addParam('ID', id);
            };

            this.byString = function(string) {
                return this.addParam('String', string);
            };

            this.addParam = function(key, value) {
                params[key] = value;

                return thisRequest;
            };

            this.submit = function() {
                return submitRequest(url, params, secret);
            };
        };

        function getSignature(object, sessionSecret) {
            var sigString = '';
            var keys = [];
            angular.forEach(object, function(value, key) {
                if (key !== 'Signature' && ['string', 'number'].indexOf(typeof value) !== -1) {
                    this.push(key);
                }
            }, keys);

            keys = keys.sort();
            for (var i = 0; i < keys.length; i++) {
                sigString += keys[i] + ':' + object[keys[i]] + ';';
            }

            if (sessionSecret) {
                sigString += sessionSecret + ';';
            }
            return md5(sigString);
        }

        function submitRequest(url, params, secret) {
            var deferred = $q.defer();
            params.Signature = getSignature(params, secret);

            $http.post(url, params)
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data, status) {
                    deferred.reject('Error ' + status + ' on HTTP request.' +
                        ' Command: "' + params.Command + '"');

                    if (status === 401) {
                        $rootScope.$emit('ResponseUnauthorised');
                    }
                });

            return deferred.promise;
        }
    }
})();
