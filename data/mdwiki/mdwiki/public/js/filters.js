(function (filters) {
  'use strict';

  filters.filter('interpolate', function (version) {
    return function (text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  });
})(angular.module('mdwiki.filters'));

