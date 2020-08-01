/*global angular*/
'use strict';

angular
	.module('stack')
	.controller('menuCtrl', ['$rootScope', '$scope', '$http', '$location',
		function ($rootScope, $scope, $http, $location) {
			$scope.$on('$routeChangeSuccess', function () {
				$scope.url = $location.url();
			});
			$scope.user = $rootScope.user;
			$rootScope.$watch('user', function (newVal, oldVal) {
				$scope.user = newVal;
			}, true);

		}
	]);