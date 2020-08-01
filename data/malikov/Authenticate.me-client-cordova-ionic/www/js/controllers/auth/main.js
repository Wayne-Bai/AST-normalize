'use strict';

/*
 * controllers/auth/main.js
 * controller for the authentication page
 *
 * (c) 2014 Vincent Maliko http://frnchnrd.com
 * License: MIT
 */

angular.module('controllers.auth', [])

.controller('AuthCtrl', [
	'$ionicLoading',
	'$ionicPopup',
	'$timeout',
	'$scope',
	'$state',
	'$stateParams',
	'Constants',
	'AuthService',
function($ionicLoading,$ionicPopup, $timeout, $scope,$state, $stateParams, Constants, AuthService,$cordovaLocalStorage) {
	
	if(Constants.DEBUGMODE){
		console.log("AuthCtrl controller");
		console.log($stateParams);
	}

	// user data passed to the authentication service
	$scope.user = {};
	
	// function for loging the user
	$scope.authenticateUser = function(provider){
		var error = function(error){
			$ionicLoading.hide();

			if(Constants.DEBUGMODE){
				console.log("AuthenticateUser failed");
				console.log(error);
			}

			$scope.error = error;
			

			var errorPopup = $ionicPopup.show({
		    	templateUrl: 'templates/modal/error.html',
		    	title: 'Error',
		    	scope: $scope,
		    	buttons: [
		       		{ text: 'Ok' }
		    	]
		   	});

		   errorPopup.then(function(res) {
		   	 	if(Constants.DEBUGMODE){
		  	   		console.log('Popup close button Tapped!', res);
		 		}
		   });
		   
		   $timeout(function() {
		      errorPopup.close(); //close the popup after 3 seconds for some reason
		   }, 3000);
		}

		var success = function(response){
			// if the authentication is successful go to profile view
			if(Constants.DEBUGMODE){
				console.log("Authentication successful")
				console.log(response);
			}

			$ionicLoading.hide();
			$state.go('app.profile');
		}

		

		$ionicLoading.show({
      		template: 'Loading...'
   		 });
		
		if(provider === 'facebook' || provider === 'twitter' || provider === 'instagram'){
			if(Constants.DEBUGMODE){
				console.log('authenticating with '+provider);
			}	

			//remove after a few seconds
			$timeout(function() {
		      $ionicLoading.hide();
		   	}, 3000);
		}

		// use AuthService to login
		AuthService.login($scope.user,provider).then(success,error);
	}

	$scope.registerUser = function(){
		var success = function(response){
			if(Constants.DEBUGMODE){
				console.log("Registering user successful");
				console.log(response);
			}
			$ionicLoading.hide();
			$scope.authenticateUser();
		}

		var error = function(error){
			$ionicLoading.hide();
			console.log(error);
			$scope.error = error;
			
			var errorPopup = $ionicPopup.show({
		    	templateUrl: 'templates/modal/error.html',
		    	title: 'Error',
		    	scope: $scope,
		    	buttons: [
		       		{ text: 'Ok' }
		    	]
		   	});

		   errorPopup.then(function(res) {
		   		if(Constants.DEBUGMODE){
				     console.log('popup ok Tapped!', res);
				 }
		   });
		   
		   $timeout(function() {
		      errorPopup.close(); //close the popup after 3 seconds for some reason
		   }, 3000);
		}

		$ionicLoading.show({
      		template: 'Loading...'
   		 });

		AuthService.register($scope.user).then(success,error);
	}

	// display signup modal
	$scope.navigateTo = function(state){
		return $state.go(state);
	}

	$scope.authenticate = function(provider){
		$scope.authenticateUser(provider);
	}

	$scope.$on('event:app-networkRequired', function() {
	    //display the modal view with netowrk required
	    $ionicLoading.hide();
	});

}]);