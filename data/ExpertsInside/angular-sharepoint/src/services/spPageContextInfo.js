/**
 * @ngdoc object
 * @name ExpertsInside.SharePoint.Core.$spPageContextInfo
 *
 * @description
 * A reference to the documents `_spPageContextInfo` object. While `_spPageContextInfo`
 * is globally available in JavaScript, it causes testability problems, because
 * it is a global variable. When referring to it thorugh the `$spPageContextInfo` service,
 * it may be overridden, removed or mocked for testing.
 *
 * See {@link http://tjendarta.wordpress.com/2013/07/16/_sppagecontextinfo-properties-value/ _spPageContextInfo Properties}
 * for more information.
 *
 * @example
 * ```js
     function Ctrl($scope, $spPageContextInfo) {
        $scope.userName = $spPageContextInfo.userLoginName
      }
 * ```
 */
angular.module('ExpertsInside.SharePoint.Core')
  .factory('$spPageContextInfo', function($rootScope, $window) {
    'use strict';

    var $spPageContextInfo = { };
    angular.copy($window._spPageContextInfo, $spPageContextInfo);

    $rootScope.$watch(function() { return $window._spPageContextInfo; }, function(spPageContextInfo) {
      angular.copy(spPageContextInfo, $spPageContextInfo);
    }, true);

    return $spPageContextInfo;
  });
