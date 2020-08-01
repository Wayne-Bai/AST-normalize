'use strict';

app.controller('AppCtrl', ['$rootScope', '$scope', 'Tasks', function ($rootScope, $scope, Tasks) {

	// $scope.projects = Tasks.getProjects();
	
	$scope.setStatus = function ( status ) {
		if ( $rootScope.page ) {
			$rootScope.page.syncStatus = status;
		} else {
			$rootScope.page = {
				syncStatus : status
			};
		}
	}

}]);