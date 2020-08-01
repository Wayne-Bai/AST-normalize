Peerio.UI.controller('messagesSection', function($scope, $element, $sce, $filter, hotkeys) {
	'use strict';
	(function() {
		if (/Sidebar/.test($element[0].className)) {
			return false
		}
		hotkeys.bindTo($scope).add({
			combo: 'command+enter',
			description: 'Send Message',
			allowIn: ['textarea'],
			callback: function() {
				if ($scope.messagesSection.conversation) {
					$scope.messagesSection.replyToConversation(
						$scope.messagesSection.conversation
					)
				}
			}
		})
		hotkeys.bindTo($scope).add({
			combo: 'ctrl+enter',
			description: 'Send Message',
			allowIn: ['textarea'],
			callback: function() {
				if ($scope.messagesSection.conversation) {
					$scope.messagesSection.replyToConversation(
						$scope.messagesSection.conversation
					)
				}
			}
		})
		hotkeys.bindTo($scope).add({
			combo: 'enter',
			description: 'Send Message (if quick sending is enabled)',
			allowIn: ['textarea'],
			callback: function(event) {
				if (
					$scope.messagesSection.pressEnterToSend &&
					$scope.messagesSection.conversation
				) {
					event.preventDefault()
					$scope.messagesSection.replyToConversation(
						$scope.messagesSection.conversation
					)
				}
			}
		})
	})()
	$scope.messagesSidebar = {}
	$scope.messagesSidebar.newMessage = function() {
		$('div.frontModalsWrapper').addClass('visible')
		$('div.newMessage').addClass('visible')
		setTimeout(function() {
			$('input.newMessageTo')[0].focus()
		}, 100)
	}
	$scope.messagesSection = {}
	$scope.messagesSection.replyBuffers = {}
	$scope.messagesSection.readOnUnfocusedBuffer = []
	$scope.messagesSection.attachFileIDs = []
	$scope.messagesSection.fetchedConversations = []
	$scope.messagesSection.searchFilter = ''
	$scope.messagesSection.typeFilter = 'all'
	$scope.messagesSection.checkedIDs = []
	$scope.messagesSection.checkedReceipts = {}
	$scope.messagesSection.messageNewCount = 0
	$scope.$on('messagesSectionPopulate', function(event, callback) {
		$scope.messagesSection.listIsLoading = true
		if (/Sidebar/.test($element[0].className)) {
			return false
		}
		Peerio.storage.db.get('conversations', function(err, conversations) {
			Peerio.message.getAllConversations(function() {
				$scope.messagesSection.conversations = Peerio.user.conversations
				$scope.messagesSection.listIsLoading = false
				$scope.$apply(Peerio.UI.applyDynamicElements)
				$scope.$root.$broadcast('messagesSectionUpdate', null)
				if (typeof(callback) === 'function') {
					callback()
				}
			})
			// @todo kaepora ^
		})
	})
	Peerio.UI.messagesSectionUpdate = function() {
		$scope.$root.$broadcast('messagesSectionUpdate', null)
	}
	$scope.$on('messagesSectionUpdate', function() {
		if (/Sidebar/.test($element[0].className)) {
			return false
		}
		Peerio.message.getModifiedMessages(function(modified) {	
			modified.forEach(function(message) {
				if (modified.length && (message.sender !== Peerio.user.username)) {
					if ( message.decrypted.message === ':::peerioAck:::') {
						if (Peerio.user.settings.useSounds) {
							Peerio.notification.playSound('ack')
						}
					}
					else {
						if (Peerio.user.settings.useSounds) {
							Peerio.notification.playSound('received')
						}
					}
				}		
				if (({}).hasOwnProperty.call(Peerio.user.conversations, message.conversationID)) {
					if (({}).hasOwnProperty.call(
						Peerio.user.conversations[message.conversationID].messages, message.id)
					) {
						Peerio.user.conversations[message.conversationID].messages[message.id].recipients = message.recipients
						$scope.$apply(Peerio.UI.applyDynamicElements)
					}
					else {
						Peerio.user.conversations[message.conversationID].messages[message.id] = message
						if (
							(message.sender !== Peerio.user.username) &&
							(
								!document.hasFocus() ||
								!$('div.mainTopSectionTab[data-sectionlink=messages]').hasClass('active') ||
								(
									$scope.messagesSection.conversation &&
									$scope.messagesSection.conversation.id !== message.conversationID
								)
							)
						) {
							var notificationText = message.decrypted.message
							if (notificationText === ':::peerioAck:::') {
								notificationText = document.l10n.getEntitySync('acknowledgedMessage').value
							}
							Peerio.notification.show(message.conversationID + '!' + Base58.encode(nacl.randomBytes(16)), {
								title: Peerio.util.getFullName(message.sender),
								message: notificationText,
								contextMessage: message.decrypted.subject
							}, function() {})
						}
					}
					if (
						(message.sender !== Peerio.user.username) &&
						(
							!$('div.mainTopSectionTab[data-sectionlink=messages]').hasClass('active') ||
							!$scope.messagesSection.conversation ||
							(
								$scope.messagesSection.conversation &&
								$scope.messagesSection.conversation.id !== message.conversationID
							)
						)
					) {
						Peerio.user.conversations[message.conversationID].original.isModified = true
						Peerio.user.conversations[message.conversationID].lastTimestamp = message.timestamp
						Peerio.storage.db.get('conversations', function(err, conversations) {
							if (({}).hasOwnProperty.call(conversations, message.conversationID)) {
								var original = conversations[message.conversationID].original
								conversations[message.conversationID].messages[original].isModified = true
								conversations[message.conversationID].lastTimestamp = message.timestamp
								Peerio.storage.db.put(conversations, function() {
								})
							}
						})
					}
					if (
						$scope.messagesSection.conversation &&
						($scope.messagesSection.conversation.id === message.conversationID)
					) {
						if (message.decrypted) {
							message.decrypted.fileIDs.forEach(function(fileID) {
								if (Peerio.user.conversations[message.conversationID].fileIDs.indexOf(fileID) < 0) {
									Peerio.user.conversations[message.conversationID].fileIDs.push(fileID)
								}
							})
							var read = [{
								id: message.id,
								receipt: message.decrypted.receipt,
								sender: message.sender
							}]
							if (document.hasFocus()) {
								Peerio.message.readMessages(read, function() {
									$scope.$root.$broadcast('messagesSectionRender', null)
								})
							}
							else {
								$scope.messagesSection.readOnUnfocusedBuffer.push(read[0])
							}
						}
					}
				}
				else {
					Peerio.message.getConversationPages([message.conversationID], true, function() {
						$scope.$root.$broadcast('messagesSectionRender', null)
					})
				}
			})
			$scope.$root.$broadcast('messagesSectionRender', null)
			if (modified.length) {
				$('input.mainTopSearchSubmit').trigger('click')
				Peerio.network.getSettings(function(data) {
					Peerio.user.quota = data.quota
				})
			}
		})
	})
	$scope.$on('messagesSectionRender', function() {
		if (/Sidebar/.test($element[0].className)) {
			return false
		}
		$scope.messagesSection.conversations = Peerio.user.conversations
		$scope.$apply(Peerio.UI.applyDynamicElements)
		$('input.mainTopSearchSubmit').trigger('click')
		$('div.messagesSectionMessageViewSingles').scrollTop(
			$('div.messagesSectionMessageViewSingles')[0].scrollHeight + 1000
		)
	})
	$scope.$on('messagesSectionAttachFileIDs', function(event, ids) {
		if (/Sidebar/.test($element[0].className)) {
			return false
		}
		$scope.messagesSection.attachFileIDs = ids
		$scope.$root.$broadcast('frontModalsClose', null)
	})
	$scope.$on('messagesSectionSetSearchFilter', function(event, input) {
		$scope.messagesSection.searchFilter = input.toLowerCase()
		$scope.$apply()
	})
	$scope.$on('messagesSectionSetTypeFilter', function(event, type) {
		$scope.messagesSection.typeFilter = type
	})
	$scope.messagesSection.checkSearchFilterConversation = function(conversation) {
		var match = false
		for (var message in conversation.messages) {
			if (({}).hasOwnProperty.call(conversation.messages, message)) {
				match = $scope.messagesSection.checkSearchFilter(conversation.messages[message])
				if (match) {
					break
				}
			}
		}
		return match
	}
	$scope.messagesSection.checkSearchFilter = function(message) {
		if (!$scope.messagesSection.searchFilter.length) {
			return true
		}
		if (
			({}).hasOwnProperty.call(message.decrypted, 'subject') &&
			message.decrypted.subject.toLowerCase().match($scope.messagesSection.searchFilter)
		) {
			return true
		}
		if (
			({}).hasOwnProperty.call(message.decrypted, 'message') &&
			message.decrypted.message.toLowerCase().match($scope.messagesSection.searchFilter)
		) {
			return true
		}
		if (message.sender.toLowerCase().match($scope.messagesSection.searchFilter)) {
			return true
		}
		var fullName = Peerio.util.getFullName(message.sender).toLowerCase()
		if (fullName.match($scope.messagesSection.searchFilter)) {
			return true
		}
		var recipientsMatch = false
		message.recipients.forEach(function(recipient) {
			if (
				({}).hasOwnProperty.call(recipient, 'username') &&
				(
					recipient.username.match($scope.messagesSection.searchFilter) ||
					Peerio.util.getFullName(recipient.username).match($scope.messagesSection.searchFilter)
				)
			) {
				recipientsMatch = true
			}
		})
		return recipientsMatch
	}
	$scope.messagesSection.setTypeFilter = function(type, event) {
		$('ul.messagesSidebarTypeFilters li').removeClass('active')
		$(event.target).addClass('active')
		$scope.$root.$broadcast('messagesSectionSetTypeFilter', type)
	}
	$scope.messagesSection.checkTypeFilter = function(conversation) {
		if ($scope.messagesSection.typeFilter === 'all') {
			if (!conversation.original.isDraft) {
				return true
			}
		}
		if ($scope.messagesSection.typeFilter === 'new') {
			if (
				$scope.messagesSection.conversation &&
				($scope.messagesSection.conversation.id === conversation.id) &&
				!conversation.original.isDraft
			) {
				return true
			}
			return conversation.original.isModified
		}
		if ($scope.messagesSection.typeFilter === 'drafts') {
			return conversation.original.isDraft
		}
	}
	$scope.messagesSection.onCheck = function(id, event) {
		event.stopPropagation()
		if (event.target.checked) {
			$scope.messagesSection.checkedIDs.push(id)
		}
		else {
			var index = $scope.messagesSection.checkedIDs.indexOf(id)
			if (index >= 0) {
				$scope.messagesSection.checkedIDs.splice(index, 1)
			}
		}
	}
	$scope.messagesSection.selectConversation = function(conversation, event) {
		if (event && (event.target.className === 'blueCheckboxLabel')) {
			return false
		}
		if (!/^\w{16,32}$/.test(conversation.id)) {
			return false
		}
		$('div.mainTopSectionTab[data-sectionlink=messages]').trigger('mousedown')
		$('div.messageListItem').removeClass('selected')
		$scope.$root.$broadcast('attachFileReset', null)
		if (conversation.original.isDraft) {
			$scope.$root.$broadcast('newMessagePopulate', {
				recipients: conversation.original.decrypted.participants,
				subject: conversation.original.decrypted.subject,
				body: conversation.original.decrypted.message,
				fileIDs: conversation.original.decrypted.fileIDs
			})
			setTimeout(function() {
				$('button.messagesSidebarNewMessage').trigger('mousedown')
			}, 250)
		}
		else {
			$('div.messageListItem[data-conversationid=c' + conversation.id + ']').addClass('selected')
			if (
				!$scope.messagesSection.conversation ||
					(
						$scope.messagesSection.conversation &&
						($scope.messagesSection.conversation.id !== conversation.id)
					)
			) {
				$scope.messagesSection.expandConversation(conversation, false)
				console.log(conversation.id)
			}
		}
	}
	Peerio.UI.selectConversation = function(conversationID) {
		$scope.messagesSection.selectConversation(Peerio.user.conversations[conversationID], null)
	}
	$scope.messagesSection.getDate = function(timestamp) {
		if (typeof(timestamp) === 'undefined') { return '' }
		return Peerio.util.getDateFromTimestamp(timestamp)
	}
	$scope.messagesSection.isExpandConversationVisible = function(id, conversation) {
		if (
			(id === conversation.original.id) &&
			(Object.keys(conversation.messages).length < conversation.messageCount)
		) {
			return true
		}
		return false
	}
	$scope.messagesSection.isValidParticipant = function(username, conversation) {
		if (
			({}).hasOwnProperty.call(conversation, 'original') &&
			(typeof(conversation.original) === 'object') &&
			({}).hasOwnProperty.call(conversation.original, 'decrypted') &&
			({}).hasOwnProperty.call(conversation.original.decrypted, 'participants') &&
			(conversation.original.decrypted.participants.indexOf(username) >= 0)
		) {
			return true
		}
		return false
	}
	$scope.messagesSection.getMessagesNewCount = function() {
		var count = $('div.messageStatusIndicatorUnread:not(.ng-hide)').length
		if (count !== $scope.messagesSection.messagesNewCount) {
			$scope.messagesSection.messagesNewCount = count
		}
		return $scope.messagesSection.messagesNewCount
	}
	$scope.messagesSection.getFullName = function(username) {
		return Peerio.util.getFullName(username)
	}
	$scope.messagesSection.getListingName = function(original) {
		if (
			(typeof(original) !== 'object') ||
			!({}).hasOwnProperty.call(original, 'sender')
		) {
			return Peerio.util.getFullName(Peerio.user.username)
		}
		if (original.sender === Peerio.user.username) {
			if (original.recipients.length === 1) {
				return Peerio.util.getFullName(original.recipients[0].username)
			}
			else {
				return (
					original.recipients.length + ' ' +
					document.l10n.getEntitySync('recipients').value
				)
			}
		}
		else {
			return Peerio.util.getFullName(original.sender)
		}
	}
	$scope.messagesSection.expandConversation = function(conversation, entireConversation) {
		if (({}).hasOwnProperty.call($scope.messagesSection, 'conversation')) {
			$scope.messagesSection.replyBuffers[
				$scope.messagesSection.conversation.id
			] = $scope.messagesSection.messageViewReply
			if ($scope.messagesSection.conversation.id !== conversation.id) {
				$scope.messagesSection.messageViewReply = ''
			}
		}
		$scope.messagesSection.attachFileIDs = []
		$scope.messagesSection.conversationIsLoading = true
		if (!entireConversation) {
			delete $scope.messagesSection.conversation
		}
		conversation.original.isModified = false
		Peerio.storage.db.get('conversations', function(err, conversations) {
			if (
				(typeof(conversations) === 'object') &&
				({}).hasOwnProperty.call(conversations, conversation.id)
			) {
				var original = conversations[conversation.id].original
				conversations[conversation.id].messages[original].isModified = false
				Peerio.storage.db.put(conversations, function() {
				})
			}
		})
		var afterMessagesAreReceived = function(conversation) {
			$scope.messagesSection.conversation = Peerio.user.conversations[conversation.id]
			$scope.messagesSection.conversationIsLoading = false
			var read = []
			for (var message in Peerio.user.conversations[conversation.id].messages) {
				if (({}).hasOwnProperty.call(Peerio.user.conversations[conversation.id].messages, message)) {
					var thisMessage = Peerio.user.conversations[conversation.id].messages[message]
					if (thisMessage.isModified && thisMessage.decrypted) {
						read.push({
							id: thisMessage.id,
							receipt: thisMessage.decrypted.receipt,
							sender: thisMessage.sender
						})
					}
					if (!({}).hasOwnProperty.call(Peerio.user.conversations[conversation.id], 'fileIDs')) {
						Peerio.user.conversations[conversation.id].fileIDs = []
					}
					if (thisMessage.decrypted && ({}).hasOwnProperty.call(thisMessage.decrypted, 'fileIDs')) {
						for (var fileID = 0; fileID < thisMessage.decrypted.fileIDs.length; fileID++) {
							if (Peerio.user.conversations[conversation.id].fileIDs.indexOf(thisMessage.decrypted.fileIDs[fileID]) < 0) {
								Peerio.user.conversations[conversation.id].fileIDs.push(thisMessage.decrypted.fileIDs[fileID])
							}
						}
					}
				}
			}
			if (read.length) {
				Peerio.message.readMessages(read, function() {
					$scope.$root.$broadcast('messagesSectionRender', null)
					$scope.$apply()
					Peerio.UI.applyDynamicElements()
				})
			}
			else {
				$scope.$root.$broadcast('messagesSectionRender', null)
				$scope.$apply()
				Peerio.UI.applyDynamicElements()
			}
		}
		if (({}).hasOwnProperty.call($scope.messagesSection.replyBuffers, conversation.id)) {
			$scope.messagesSection.messageViewReply = $scope.messagesSection.replyBuffers[
				conversation.id
			]
		}
		if (entireConversation) {
			Peerio.message.getConversationPages([conversation.id], false, function() {
				$scope.messagesSection.conversation = Peerio.user.conversations[conversation.id]
				afterMessagesAreReceived(conversation)
			})
		}
		else {
			$scope.messagesSection.messageViewReplyTabClick()
			if ($scope.messagesSection.fetchedConversations.indexOf(conversation.id) < 0) {
				Peerio.message.getConversationPages([conversation.id], true, function() {
					$scope.messagesSection.conversation = Peerio.user.conversations[conversation.id]
					$scope.messagesSection.conversationIsLoading = false
					$scope.messagesSection.fetchedConversations.push(conversation.id)
					afterMessagesAreReceived(conversation)
					$('div.messagesSectionMessageViewSingles').scrollTop(
						$('div.messagesSectionMessageViewSingles')[0].scrollHeight + 1000
					)
				})
			}
			else {
				afterMessagesAreReceived(conversation)
				$('div.messagesSectionMessageViewSingles').scrollTop(
					$('div.messagesSectionMessageViewSingles')[0].scrollHeight + 1000
				)
			}
		}
	}
	$scope.messagesSection.messageIsDecrypted = function(message) {
		return ({}).hasOwnProperty.call(message, 'decrypted')
	}
	$scope.messagesSection.messageIsAck = function(message) {
		if (message.decrypted.message === ':::peerioAck:::') {
			return true
		}
		return false
	}
	$scope.messagesSection.checkReceipt = function(receipt, recipient, sender) {
		if (
			(sender !== Peerio.user.username) ||
			(!({}).hasOwnProperty.call(recipient, 'receipt'))
		) {
			return false
		}
		if (!({}).hasOwnProperty.call($scope.messagesSection.checkedReceipts, receipt)) {
			$scope.messagesSection.checkedReceipts[receipt] = []
		}
		if ($scope.messagesSection.checkedReceipts[receipt].indexOf(recipient) >= 0) {
			return true
		}
		if (Peerio.message.checkReceipt(receipt, recipient)) {
			$scope.messagesSection.checkedReceipts[receipt].push(recipient)
			return true
		}
		return false
	}
	$scope.messagesSection.getReceiptTimestamp = function(message, username) {
		var timestamp = ''
		var parsedTimestamp = {}
		if (({}).hasOwnProperty.call(message, 'recipients')) {
			message.recipients.forEach(function(recipient) {
				if (
					({}).hasOwnProperty.call(recipient, 'username') &&
					(recipient.username === username) &&
					({}).hasOwnProperty.call(recipient, 'receipt') &&
					({}).hasOwnProperty.call(recipient.receipt, 'readTimestamp') &&
					(/^\d{13,14}$/).test(recipient.receipt.readTimestamp)
				) {
					timestamp = recipient.receipt.readTimestamp
					parsedTimestamp = Peerio.util.getDateFromTimestamp(timestamp)
				}
			})
		}
		if (
			({}).hasOwnProperty.call(parsedTimestamp, 'time') &&
			({}).hasOwnProperty.call(parsedTimestamp, 'date')
		) {
			if (timestamp > (Date.now() - 86400000)) {
				return parsedTimestamp.time
			}
			else {
				return parsedTimestamp.date
			}
		}
		return parsedTimestamp
	}
	$scope.messagesSection.acknowledgeMessage = function(conversation) {
		$scope.messagesSection.messageViewReply = ':::peerioAck:::'
		$scope.messagesSection.replyToConversation(conversation)
	}
	$scope.messagesSection.isOnlyParticipant = function(conversation) {
		if (
			(typeof(conversation) !== 'object') ||
			!({}).hasOwnProperty.call(conversation, 'events')
		) {
			return false
		}
		var removeCount = 0
		for (var i in conversation.events) {
			if (
				({}).hasOwnProperty.call(conversation.events, i) &&
				({}).hasOwnProperty.call(conversation.events[i], 'type') &&
				conversation.events[i].type === 'remove'
			) {
				removeCount++
			}
		}
		if (
			(removeCount > 0) &&
			(conversation.participants.length === 1)
		) {
			return true
		}
		return false
	}
	$scope.messagesSection.isAckButtonDisabled = function(conversation) {
		if (typeof(conversation) !== 'object') {
			return false
		}
		var message = $('div.messagesSectionMessageViewSingle')
			.last().attr('data-messageid')
		if (message) {
			message = message.substring(1)
		}
		if (
			!message ||
			!({}).hasOwnProperty.call(conversation.messages, message) ||
			(conversation.messages[message].sender === Peerio.user.username)
		) {
			return true
		}
		if ($scope.messagesSection.isOnlyParticipant(conversation)) {
			return true
		}
		return false
	}
	$scope.messagesSection.attachFile = function(conversation) {
		$scope.$root.$broadcast(
			'attachFilePopulate', {
				recipients: conversation.original.decrypted.participants,
				opener: 'messagesSection'
			}
		)
		$('div.frontModalsWrapper').addClass('visible')
		$('div.attachFile').addClass('visible')
		setTimeout(function() {
			$('input.attachFileSearch')[0].focus()
		}, 100)
	}
	$scope.messagesSection.replyToConversation = function(conversation) {
		var body = $scope.messagesSection.messageViewReply
		if (!body.length) {
			return false
		}
		$scope.messagesSection.messageViewReply = ''
		Peerio.message.new({
			isDraft: false,
			recipients: conversation.original.decrypted.participants,
			subject: conversation.original.decrypted.subject,
			body: body,
			fileIDs: $scope.messagesSection.attachFileIDs,
			conversationID: conversation.id,
			sequence: Object.keys(conversation.messages).length
		}, function(messageObject, failed) {
			if (body === ':::peerioAck:::') {
				if (Peerio.user.settings.useSounds) {
					Peerio.notification.playSound('ack')
				}
			}
			else {
				if (Peerio.user.settings.useSounds) {
					Peerio.notification.playSound('sending')
				}
			}
			var temporaryID = 'sending' + Base58.encode(nacl.randomBytes(8))
			messageObject.timestamp = Date.now() + 120000
			messageObject.id = temporaryID
			messageObject.isModified = false
			messageObject.sender = Peerio.user.username
			messageObject.decrypted = {
				fileIDs: $scope.messagesSection.attachFileIDs,
				message: body,
				receipt: '',
				sequence: Object.keys(conversation.messages).length,
				subject: conversation.original.decrypted.subject
			}
			conversation.messages[temporaryID] = messageObject
			$scope.$apply(Peerio.UI.applyDynamicElements)
			$('div.messagesSectionMessageViewSingles').scrollTop(
				$('div.messagesSectionMessageViewSingles')[0].scrollHeight + 1000
			)
			Peerio.network.createMessage(messageObject, function(result) {
				if (({}).hasOwnProperty.call(result, 'error')) {
					if (result.error === 413) {
						swal({
							title: document.l10n.getEntitySync('quotaError').value,
							text: document.l10n.getEntitySync('quotaErrorText').value,
							type: 'error',
							confirmButtonText: document.l10n.getEntitySync('OK').value
						})
					}
					else {
						swal({
							title: document.l10n.getEntitySync('error').value,
							text: document.l10n.getEntitySync('newMessageErrorText').value,
							type: 'error',
							confirmButtonText: document.l10n.getEntitySync('OK').value
						})
					}
					return false
				}
				Peerio.message.getMessages([result.id], function(data) {
					if (body !== ':::peerioAck:::') {
						if (Peerio.user.settings.useSounds) {
							Peerio.notification.playSound('sent')
						}
					}
					conversation.messages[result.id] = conversation.messages[temporaryID]
					delete conversation.messages[temporaryID]
					conversation.messages[result.id].timestamp = data.messages[result.id].timestamp
					conversation.messages[result.id].id = result.id
					conversation.messages[result.id].decrypted = data.messages[result.id].decrypted
					conversation.lastTimestamp = data.messages[result.id].timestamp
					Peerio.user.conversations[conversation.id].lastTimestamp = data.messages[result.id].timestamp
					Peerio.storage.db.get('conversations', function(err, conversations) {
						if (({}).hasOwnProperty.call(conversations, conversation.id)) {
							conversations[conversation.id].lastTimestamp = data.messages[result.id].timestamp
							Peerio.storage.db.put(conversations, function() {
							})
						}
					})
					$scope.messagesSection.attachFileIDs.forEach(function(fileID) {
						if (conversation.fileIDs.indexOf(fileID) < 0) {
							conversation.fileIDs.push(fileID)
						}
					})
					$scope.messagesSection.attachFileIDs = []
					$scope.$root.$broadcast('attachFileReset', null)
					$scope.$apply(Peerio.UI.applyDynamicElements)
				})
				$scope.$root.$broadcast('frontModalsClose', null)
			})
			if (failed.length) {
				var swalText = document.l10n.getEntitySync('messageCouldNotBeSentTo').value
				swalText += failed.join(', ')
				swal({
					title: document.l10n.getEntitySync('warning').value,
					text: swalText,
					type: 'warning',
					confirmButtonText: document.l10n.getEntitySync('OK').value
				})
			}
		})
	}
	$scope.messagesSection.removeConversations = function(ids) {
		if (!ids.length) {
			return false
		}
		var removeConversations = function(ids) {
			Peerio.storage.db.get('conversations', function(err, conversations) {
				Peerio.storage.db.remove(conversations, function() {
					ids.forEach(function(id) {
						if (({}).hasOwnProperty.call(conversations, id)) {
							delete conversations[id]
						}
					})
					Peerio.storage.db.put(conversations, function() {
					})
				})
			})
			Peerio.network.removeConversation(ids, function(data) {
				if (({}).hasOwnProperty.call(data, 'success')) {
					data.success.forEach(function(s) {
						if (ids.indexOf(s) >= 0) {
							delete Peerio.user.conversations[s]
						}
					})
					delete $scope.messagesSection.conversation
					$scope.messagesSection.conversationIsLoading = false
					$scope.messagesSection.checkedIDs = []
					$scope.$apply()
				}
			})
		}
		var isDraft = false
		ids.forEach(function(id) {
			if (Peerio.user.conversations[id].original.isDraft) {
				isDraft = true
			}
		})
		if (isDraft) {
			removeConversations(ids)
		}
		else {
			swal({
				title: document.l10n.getEntitySync('removeConversationsQuestion').value,
				text: document.l10n.getEntitySync('removeConversationsText').value,
				type: 'warning',
				showCancelButton: true,
				cancelButtonText: document.l10n.getEntitySync('cancel').value,
				confirmButtonColor: '#e07a66',
				confirmButtonText: document.l10n.getEntitySync('remove').value,
				closeOnConfirm: false
			}, function() {
				removeConversations(ids)
			})
		}
	}
	$scope.messagesSection.sentByMe = function(message) {
		if (
			(message.sender === Peerio.user.username) &&
			message.decrypted
		) {
			return true
		}
		return false
	}
	$scope.messagesSection.isFailed = function(message) {
		if (message.sender === Peerio.user.username) {
			return false
		}
		if (
			!(({}).hasOwnProperty.call(message, 'decrypted')) ||
			!message.decrypted
		) {
			message.decrypted = false
			return true
		}
		if (!/^\w{24,30}$/.test(message.id)) {
			message.decrypted = false
			return true
		}
		// Give a realistic leeway for out-of-order detection
		// @todo kaepora: Stress-test some more
		/*
		var displaySequence = $('div.messagesSectionMessageViewSingle')
			.index($('[data-messageid=m' + message.id + ']'))
		if (
			(message.decrypted.sequence < (parseInt(displaySequence) - 5)) ||
			(message.decrypted.sequence > (parseInt(displaySequence) + 5))
		) {
			message.decrypted = false
			return true
		}
		*/
		return false
	}
	$scope.messagesSection.truncateName = function(fileID) {
		if (({}).hasOwnProperty.call(Peerio.user.files, fileID)) {
			return Peerio.file.truncateFileName(
				Peerio.user.files[fileID].name
			)
		}
	}
	$scope.messagesSection.getIcon = function(fileID) {
		if (({}).hasOwnProperty.call(Peerio.user.files, fileID)) {
			return $sce.trustAsHtml(
				Peerio.user.files[fileID].icon
			)
		}
	}
	$scope.messagesSection.doesFileExist = function(fileID) {
		return ({}).hasOwnProperty.call(Peerio.user.files, fileID)
	}
	$scope.messagesSection.downloadFile = function(fileID) {
		Peerio.UI.downloadFile.downloadFile(fileID)
	}
	$scope.messagesSection.messageViewReplyTabClick = function() {
		$('span.messagesSectionMessageViewReplyTab').addClass('active')
		$('span.messagesSectionMessageViewFilesTab').removeClass('active')
		$('div.messagesSectionMessageViewReply').show()
		$('div.messagesSectionMessageViewFiles').hide()
		setTimeout(function() {
			$('div.messagesSectionMessageViewReply').find('textarea')[0].focus()
		}, 200)
	}
	$scope.messagesSection.messageViewFilesTabClick = function() {
		$('span.messagesSectionMessageViewFilesTab').addClass('active')
		$('span.messagesSectionMessageViewReplyTab').removeClass('active')
		$('div.messagesSectionMessageViewReply').hide()
		$('div.messagesSectionMessageViewFiles').show()
	}
	$(window).on('focus', function() {
		if ($scope.messagesSection.readOnUnfocusedBuffer.length) {
			Peerio.message.readMessages($scope.messagesSection.readOnUnfocusedBuffer, function() {
				$scope.messagesSection.readOnUnfocusedBuffer = []
				$scope.$root.$broadcast('messagesSectionRender', null)
			})
		}
	})
})