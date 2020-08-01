Peerio.UI.controller('attachFile', function($scope, $sce) {
	'use strict';
	$scope.attachFile = {}
	$scope.attachFile.ids = []
	$scope.attachFile.recipients = []
	$scope.$on('attachFilePopulate', function(event, args) {
		$scope.attachFile.files = Peerio.user.files
		$scope.attachFile.recipients = args.recipients
		$scope.attachFile.opener = args.opener
		$scope.attachFile.searchFilter = ''
		$scope.$apply()
	})
	$scope.$on('attachFileReset', function() {
		$scope.attachFile.ids = []
		$scope.attachFile.recipients = []
		$('td.attachFileTableCheckboxCell input.blueCheckbox').prop('checked', false)
	})
	$scope.attachFile.getDate = function(timestamp) {
		if (typeof(timestamp) === 'undefined') { return '' }
		return Peerio.util.getDateFromTimestamp(timestamp)
	}
	$scope.attachFile.getSize = function(bytes) {
		return Peerio.file.getReadableFileSize(bytes)
	}
	$scope.attachFile.truncateName = function(fileName) {
		return Peerio.file.truncateFileName(fileName)
	}
	$scope.attachFile.getIcon = function(fileID) {
		if (({}).hasOwnProperty.call(Peerio.user.files, fileID)) {
			return $sce.trustAsHtml(
				Peerio.user.files[fileID].icon
			)
		}
	}
	$scope.attachFile.checkSearchFilter = function(file) {
		if (!$scope.attachFile.searchFilter.length) {
			return true
		}
		if (file.name.toLowerCase().match($scope.attachFile.searchFilter)) {
			return true
		}
		if (file.creator.toLowerCase().match($scope.attachFile.searchFilter)) {
			return true
		}
		var fullName = Peerio.util.getFullName(file.creator).toLowerCase()
		if (fullName.match($scope.attachFile.searchFilter)) {
			return true
		}
		return false
	}
	$scope.attachFile.onCheck = function(id, event) {
		if (event.target.checked) {
			$scope.attachFile.ids.push(id)
		}
		else {
			var index = $scope.attachFile.ids.indexOf(id)
			if (index >= 0) {
				$scope.attachFile.ids.splice(index, 1)
			}
		}
	}
	$scope.attachFile.attachSelected = function() {
		$scope.$root.$broadcast(
			$scope.attachFile.opener + 'AttachFileIDs',
			$scope.attachFile.ids
		)
		$('button.frontModalsClose').show()
	}
	$scope.attachFile.uploadNew = function() {
		$('input.fileSelectDialog').click()
		Peerio.file.autoCheck = true
	}
	$scope.attachFile.getFullName = function(username) {
		return Peerio.util.getFullName(username)
	}
})