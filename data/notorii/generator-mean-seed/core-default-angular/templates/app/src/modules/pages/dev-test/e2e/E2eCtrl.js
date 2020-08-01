/**
*/

'use strict';

angular.module('myApp').controller('E2eCtrl', ['$scope', '$cookieStore', 'UserModel', 'appConfig', '$rootScope', 
function($scope, $cookieStore, UserModel, appConfig, $rootScope) {
	//TESTING
	$rootScope.$broadcast('debugDataUpdate', {data: 'E2eCtrl: appConfig.state.loggedIn: '+appConfig.state.loggedIn});		//TESTING
	// alert(appConfig.state.loggedIn);
	//end: TESTING
	
	$scope.user =UserModel.load();
	
	$scope.cookies ={
	};
	var cookieSess =$cookieStore.get('sess_id');
	var cookieUser =$cookieStore.get('user_id');
	if(cookieUser) {
		$scope.cookies.user =cookieUser;
	}
	if(cookieSess) {
		$scope.cookies.sess =cookieSess;
	}
}]);