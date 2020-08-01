Peerio.UI.controller('preferences', function($scope) {
	'use strict';
	$scope.preferences = {}
	$scope.$on('preferencesOnLogin', function() {
		$scope.preferences.language = Peerio.user.settings.localeCode
		$scope.preferences.languageOptions = [{
			name: 'English',
			value: 'en'
		}, {
			name: 'Francais',
			value: 'fr'
		}]
		if ($scope.preferences.language === 'fr') {
			$scope.preferences.languageOptions.reverse()
		}
		$scope.preferences.receiveMessageNotifications = Peerio.user.settings.receiveMessageNotifications
		$scope.preferences.useSounds = Peerio.user.settings.useSounds
		$scope.$apply()
	})
	$scope.preferences.getLocaleCode = function() {
		return Peerio.user.settings.localeCode
	}
	$scope.preferences.updateLocaleCode = function() {
		Peerio.UI.twoFactorAuth(function() {
			Peerio.network.updateSettings({
				localeCode: $scope.preferences.language
			}, function(data) {
				if (({}).hasOwnProperty.call(data, 'error')) {
					swal({
						title: document.l10n.getEntitySync('error').value,
						text: document.l10n.getEntitySync('errorText').value,
						type: 'error',
						confirmButtonText: document.l10n.getEntitySync('OK').value
					})
					return false
				}
				else {
					Peerio.user.settings.localeCode = $scope.preferences.language
					var defaultPouch = new PouchDB('_default')
					defaultPouch.get('localeCode', function(err, data) {
						defaultPouch.remove(data, function() {
							defaultPouch.put({
								_id: 'localeCode',
								localeCode: Peerio.user.settings.localeCode
							}, function() {})
						})
					})
					Peerio.storage.db.get('localeCode', function(err, data) {
						Peerio.storage.db.remove(data, function() {
							Peerio.storage.db.put({
								_id: 'localeCode',
								localeCode: Peerio.user.settings.localeCode
							}, function() {
								swal({
									title: document.l10n.getEntitySync('confirmed').value,
									text: document.l10n.getEntitySync('confirmedLanguageText').value,
									type: 'success',
									confirmButtonText: document.l10n.getEntitySync('OK').value
								})
							})
						})
					})
				}
			})
		})
	}
	$scope.preferences.receiveMessageNotificationsOnCheck = function(event) {
		event.preventDefault()
		Peerio.UI.twoFactorAuth(function() {
			Peerio.network.updateSettings({
				receiveMessageNotifications: !Peerio.user.settings.receiveMessageNotifications
			}, function(data) {
				if (({}).hasOwnProperty.call(data, 'error')) {
					$scope.preferences.receiveMessageNotifications = Peerio.user.settings.receiveMessageNotifications
					$scope.$apply()
					swal({
						title: document.l10n.getEntitySync('error').value,
						text: document.l10n.getEntitySync('errorText').value,
						type: 'error',
						confirmButtonText: document.l10n.getEntitySync('OK').value
					})
				}
				else {
					Peerio.user.settings.receiveMessageNotifications = !Peerio.user.settings.receiveMessageNotifications
					$scope.preferences.receiveMessageNotifications = Peerio.user.settings.receiveMessageNotifications
					$scope.$apply()
					swal({
						title: document.l10n.getEntitySync('confirmed').value,
						text: document.l10n.getEntitySync('confirmedText').value,
						type: 'success',
						confirmButtonText: document.l10n.getEntitySync('OK').value
					})
				}
			})
		})
	}
	$scope.preferences.useSoundsOnCheck = function(event) {
		event.preventDefault()
		Peerio.UI.twoFactorAuth(function() {
			Peerio.network.updateSettings({
				useSounds: !Peerio.user.settings.useSounds
			}, function(data) {
				if (({}).hasOwnProperty.call(data, 'error')) {
					$scope.preferences.useSounds = Peerio.user.settings.useSounds
					$scope.$apply()
					swal({
						title: document.l10n.getEntitySync('error').value,
						text: document.l10n.getEntitySync('errorText').value,
						type: 'error',
						confirmButtonText: document.l10n.getEntitySync('OK').value
					})
				}
				else {
					Peerio.user.settings.useSounds = !Peerio.user.settings.useSounds
					$scope.preferences.useSounds = Peerio.user.settings.useSounds
					$scope.$apply()
					swal({
						title: document.l10n.getEntitySync('confirmed').value,
						text: document.l10n.getEntitySync('confirmedText').value,
						type: 'success',
						confirmButtonText: document.l10n.getEntitySync('OK').value
					})
				}
			})
		})
	}
	$scope.preferences.peerioPINStrength = function() {
		if (!$scope.preferences.peerioPIN) { return false }
		var entropy = zxcvbn($scope.preferences.peerioPIN).entropy
		if (entropy >= Peerio.config.minPINEntropy) {
			return true
		}
		return false
	}
	$scope.preferences.peerioPINSet = function() {
		$('button.preferencesPeerioPINEntryContinue').attr('disabled', true)
		Peerio.user.setPIN(
			$scope.preferences.peerioPIN,
			Peerio.user.username,
			function() {
				swal({
					title: document.l10n.getEntitySync('peerioPINUpdated').value,
					text: document.l10n.getEntitySync('peerioPINUpdatedText').value,
					type: 'success',
					confirmButtonText: document.l10n.getEntitySync('OK').value
				})
				$('button.preferencesPeerioPINEntryContinue').removeAttr('disabled')
			}
		)
	}
	$scope.preferences.peerioPINRemove = function() {
		Peerio.user.removePIN(Peerio.user.username, function() {
			swal({
				title: document.l10n.getEntitySync('peerioPINRemoved').value,
				text: document.l10n.getEntitySync('peerioPINRemovedText').value,
				type: 'success',
				confirmButtonText: document.l10n.getEntitySync('OK').value
			})
		})
	}
})