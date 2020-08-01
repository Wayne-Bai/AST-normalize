angular.module('demo.features.home')

	.controller('HomeCtrl', ['$scope', function ($scope) {

		$scope.demo = {};		
		$scope.testDate = new Date();
		$scope.today = new Date();
		$scope.addDay = function () {
			$scope.testDate.setDate($scope.testDate.getDate() + 1);
		};

	}]);