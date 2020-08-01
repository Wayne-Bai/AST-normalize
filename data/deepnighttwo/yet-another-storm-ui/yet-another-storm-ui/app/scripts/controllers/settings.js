'use strict';

/**
 * @ngdoc function
 * @name anotherStormUiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the anotherStormUiApp
 */
app.controller('SettingsCtrl', ['$scope', '$rootScope', '$cookies', '$timeout', "client",
  function ($scope, $rootScope, $cookies, $timeout, client) {
    $scope.stormURL = $cookies.stormURL;

    $scope.setStormURL = function () {

      $scope.tobeset = $scope.stormURL;

      client.checkStormURL($scope.stormURL, function (data, status) {

        $scope.showMessage = true;
        $scope.showFailMessage = !$scope.showMessage;


        $scope.stormURL = data.stormRestHost;
        $cookies.stormURL = data.stormRestHost;

        client.topos(function (topos, status) {
          updateTabs($rootScope, topos, status);
        }, function () {
          updateTabsOnFail($rootScope)
        });

        $timeout(function () {
          $scope.showMessage = false;
        }, 5000, true);
      }, function (data, status, headers, config) {
        $scope.showFailMessage = true;
        $scope.showMessage = !$scope.showFailMessage;
        $timeout(function () {
          $scope.showFailMessage = false;
        }, 10000, true);
      });
    };
  }]);
