/**
 * @ngdoc service
 * @name ExpertsInside.SharePoint.Core.$spRest
 *
 * @description
 * Utility functions when interacting with the SharePoint REST API
 *
 */
angular.module('ExpertsInside.SharePoint.Core')
  .factory('$spRest', function($log) {
    'use strict';

    // var $spRestMinErr = angular.$$minErr('$spRest');

    /**
     * @name unique
     * @private
     *
     * Copy the array without duplicates
     *
     * @param {array} arr input array
     *
     * @returns {array} input array without duplicates
     */
    var unique = function(arr) {
      return arr.reduce(function(r, x) {
        if (r.indexOf(x) < 0) { r.push(x); }
        return r;
      }, []);
    };

    /**
     * @name getKeysSorted
     * @private
     *
     * Get all keys from the object and sort them
     *
     * @param {Object} obj input object
     *
     * @returns {Array} Sorted object keys
     */
    function getKeysSorted(obj) {
      var keys = [];
      if (angular.isUndefined(obj) || obj === null) {
        return keys;
      }

      for(var key in obj) {
        if (obj.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
      return keys.sort();
    }

    var $spRest = {

      /**
       * @ngdoc function
       * @name ExpertsInside.SharePoint.Core.$spRest#transformResponse
       * @methodOf ExpertsInside.SharePoint.Core.$spRest
       *
       * @description Parse the JSON body and remove the `d` and `d.results` wrapper from the REST response
       *
       * @param {string} json JSON body of the response
       *
       * @returns {Object|Array} transformed response
       *
       * @example
       * ```js
           var json='{"d":{"results":[{"foo":"bar"}]}}';
           var response = $spRest.transformResponse(json);
           // response => [{ foo: "bar" }]
       * ```
       */
      transformResponse: function (json) {
        var response = {};
        if (angular.isDefined(json) && json !== null && json !== '') {
          response = angular.fromJson(json);
        }
        if (angular.isObject(response) && angular.isDefined(response.d)) {
          response = response.d;
        }
        if (angular.isObject(response) && angular.isDefined(response.results)) {
          response = response.results;
        }
        return response;
      },

      /**
       * @ngdoc function
       * @name ExpertsInside.SharePoint.Core.$spRest#buildQueryString
       * @methodOf ExpertsInside.SharePoint.Core.$spRest
       *
       * @description Create a query string from query parameters that
       *   SharePoint accepts
       *
       * @param {Object} params query parameters
       *
       * @returns {string} query string
       *
       * @example
       * ```js
           var params= {
             foo: [1,2,3]
             bar: "baz"
           };
           var qs = $spRest.buildQueryString(params);
           // qs => 'foo="1,2,3"&bar="baz"'
       * ```
       */
      buildQueryString: function(params) {
        var parts = [];
        var keys = getKeysSorted(params);

        angular.forEach(keys, function(key) {
          var value = params[key];
          if (value === null || angular.isUndefined(value)) { return; }
          if (angular.isArray(value)) { value = unique(value).join(','); }
          if (angular.isObject(value)) { value = angular.toJson(value); }

          parts.push(key + '=' + value);
        });
        var queryString = parts.join('&');

        return queryString;
      },

      /**
       * @ngdoc function
       * @name ExpertsInside.SharePoint.Core.$spRest#normalizeParams
       * @methodOf ExpertsInside.SharePoint.Core.$spRest
       *
       * @description Normalizes the query parameters by prefixing them with
       *   prefixing them with $ (when missing) and removing all invalid
       *   query parameters when a whitelist is given.
       *
       * @param {Object} params query parameters
       * @param {Array.<string>} whitelist allowed query parameters
       *
       * @returns {Object} normalized query parameters
       *
       * @example
       * ```js
           var params = {
             select: ['Id', 'Title']
             invalid: "foo"
           };
           var whitelist = ['$select']
           params = $spRest.normalizeParams(params);
           // params => { $select: ['Id', 'Title'] }
       * ```
       */
      normalizeParams: function(params, whitelist) {
        params = angular.extend({}, params); //make a copy

        if (angular.isDefined(params)) {
          angular.forEach(params, function(value, key) {
            if(key.indexOf('$') !== 0) {
              delete params[key];
              key = '$' + key;
              params[key] = value;
            }

            if (angular.isDefined(whitelist) && whitelist.indexOf(key) === -1) {
              $log.warn('Invalid param key detected: ' + key);
              delete params[key];
            }
          });
        }
        // cannot use angular.equals(params, {}) to check for empty object,
        // because angular.equals ignores properties prefixed with $
        if (params === null || JSON.stringify(params) === '{}') {
          params = undefined;
        }

        return params;
      },

      /**
       * @ngdoc function
       * @name ExpertsInside.SharePoint.Core.$spRest#appendQueryParameters
       * @methodOf ExpertsInside.SharePoint.Core.$spRest
       *
       * @description Builds a query string from the query parameters
       *   and appends it to the url
       *
       * @param {string} url url
       * @param {Object} params query parameters
       *
       * @returns {string} url with query string
       *
       * @example
       * ```js
           var params= {
             $select: ['Id', 'Title']
           };
           url = $spRest.appendQueryParameters('http://my.app', params);
           // url => "http://my.app?$select='Id,Title'"
       * ```
       */
      appendQueryParameters: function(url, params) {
        var queryString = $spRest.buildQueryString(params);

        if (queryString !== '') {
          url += ((url.indexOf('?') === -1) ? '?' : '&') + queryString;
        }

        return url;
      }
    };

    return $spRest;
  });
