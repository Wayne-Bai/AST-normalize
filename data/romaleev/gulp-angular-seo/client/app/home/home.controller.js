'use strict';

angular.module('romaleev')
	.config(function($stateProvider) {
	    $stateProvider
	        .state('home', {
				title: 'Home',
	            url: '/',
				templateUrl: 'app/home/home.html',
				controller: 'HomeCtrl'
	        });
	})
	.controller('HomeCtrl', function($scope, homeConstant) {
		$scope.contacts = homeConstant.contacts;
	});