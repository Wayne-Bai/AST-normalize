Peerio.UI.controller('frontModals', function($scope) {
	'use strict';
	$scope.frontModals = {}
	$scope.$on('frontModalsClose', function() {
		$scope.frontModals.close()
	})
	$scope.frontModals.close = function() {
		$scope.$root.$broadcast('newMessageReset', null)
		$scope.$root.$broadcast('importContactsReset', null)
		$('div.frontModalsWrapper').removeClass('visible')
		$('div.frontModal').removeClass('visible')
		setTimeout(function() {
			$('div.frontModals').removeClass('small')
			$('div.frontModals').removeClass('tiny')
		}, 300)
		$('div.downloadFileProgressBar').width(0)
		$('p.downloadFileComplete').hide()
		$('input.twoFactorAuthCode').val('')
	}
})