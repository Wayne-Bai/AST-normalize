// ---------------------
// Peerio.crypto
// ---------------------
//
// Peerio's crypto object contains cryptographic functions.

Peerio.crypto = {};

(function() {
	'use strict';

	/**
	 * Encrypts a plaintext using `nacl.secretbox` and returns the ciphertext and a random nonce.
	 * @param {Uint8Array} plaintext
	 * @param {Uint8Array} key
	 * @return {object} ciphertext - Contains ciphertext and nonce in Uint8Array format.
	 */
	Peerio.crypto.secretBoxEncrypt = function(plaintext, key) {
		var nonce = nacl.randomBytes(24)
		var ciphertext = nacl.secretbox(
			plaintext,
			nonce,
			key
		)
		return {
			ciphertext: ciphertext,
			nonce: nonce
		}
	}

	/**
	 * Decrypts a ciphertext using `nacl.secretbox` and returns the plaintext.
	 * @param {Uint8Array} ciphertext
	 * @param {Uint8Array} nonce
	 * @param {Uint8Array} key
	 * @return {Uint8Array} plaintext
	 */
	Peerio.crypto.secretBoxDecrypt = function(ciphertext, nonce, key) {
		return nacl.secretbox.open(ciphertext, nonce, key)
	}

	/**
	 * Extracts a public key from a miniLock ID after verifying the ID.
	 * @param {string} miniLockID
	 * @return {Uint8Array} publicKey
	 */
	Peerio.crypto.getPublicKeyFromMiniLockID = function(miniLockID) {
		if (!miniLock.util.validateID(miniLockID)) {
			throw new Error('Peerio.util.getPublicKeyFromMiniLockID: Invalid ID.')
		}
		var bytes = Base58.decode(miniLockID)
		return bytes.subarray(0, 32)
	}

	/**
	 * Derive actual encryption key from a PIN using scrypt and BLAKE2s.
	 * Key is used to encrypt long-term passphrase locally.
	 * @param {string} PIN
	 * @param {string} username
	 * @param {function} callback
	 * @return Execute callback with object containing key (Uint8Array)
	 */
	Peerio.crypto.getKeyFromPIN = function(PIN, username, callback) {
		var hash = new BLAKE2s(32)
		hash.update(nacl.util.decodeUTF8(PIN))
		scrypt(
			hash.hexDigest(),
			nacl.util.decodeUTF8(username),
			14, 8, 32, 1000,
			function(keyBytes) {
				if (typeof(callback) === 'function') {
					keyBytes = nacl.util.decodeBase64(keyBytes)
					callback(keyBytes)
				}
			},
			'base64'
		)
	}

	/**
	 * Decrypts an account creation token.
	 * @param {object} data - account creation challenge JSON as received from server.
	 * @return {Uint8Array} decryptedToken
	 */
	Peerio.crypto.decryptAccountCreationToken = function(data) {
		if (
			!({}).hasOwnProperty.call(data, 'username') ||
			!({}).hasOwnProperty.call(data, 'accountCreationToken') ||
			!({}).hasOwnProperty.call(data.accountCreationToken, 'token') ||
			!({}).hasOwnProperty.call(data.accountCreationToken, 'nonce') ||
			!({}).hasOwnProperty.call(data, 'ephemeralServerID')
		) {
			throw new Error('Peerio.crypto.decryptAccountCreationToken: Invalid input.')
			return false
		}
		if (data.username !== Peerio.user.username) {
			throw new Error('Peerio.crypto.decryptAccountCreationToken: Usernames did not match.')
			return false
		}
		var decryptedToken = nacl.box.open(
			nacl.util.decodeBase64(data.accountCreationToken.token),
			nacl.util.decodeBase64(data.accountCreationToken.nonce),
			Peerio.crypto.getPublicKeyFromMiniLockID(data.ephemeralServerID),
			Peerio.user.keyPair.secretKey
		)
		if (
			!decryptedToken                  ||
			(decryptedToken.length !== 0x20) ||
			(decryptedToken[0]     !== 0x41) ||
			(decryptedToken[1]     !== 0x43)
		) {
			throw new Error('Peerio.crypto.decryptAccountCreationToken: Decryption failed.')
			return false
		}
		return nacl.util.encodeBase64(decryptedToken)
	}

	/**
	 * Decrypts a bunch of authTokens and adds them to the Peerio.user.authTokens
	 * array so that they may be used.
	 * @param {object} data - authToken data as received from server.
	 */
	Peerio.crypto.decryptAuthTokens = function(data) {
		if (({}).hasOwnProperty.call(data, 'error')) {
			return false
		}
		data.authTokens.forEach(function(token) {
			var decryptedToken = nacl.box.open(
				nacl.util.decodeBase64(token.token),
				nacl.util.decodeBase64(token.nonce),
				Peerio.crypto.getPublicKeyFromMiniLockID(data.ephemeralServerID),
				Peerio.user.keyPair.secretKey
			)
			if (decryptedToken) {
				if (
					(decryptedToken.length === 0x20) &&
					(decryptedToken[0]     === 0x41) &&
					(decryptedToken[1]     === 0x54)
				) {
					Peerio.user.authTokens.push(
						nacl.util.encodeBase64(decryptedToken)
					)
				}
			}
		})
	}

	/**
	 * Gets a user's avatar using their username and miniLock ID.
	 * The avatar consists of two 256-bit BLAKE2 hashes spread across 4 identicons:
	 * Identicon 1: First 128 bits of BLAKE2(username||miniLockID).
	 * Identicon 2:  Last 128 bits of BLAKE2(username||miniLockID).
	 * Identicon 3: First 128 bits of BLAKE2(miniLockID||username).
	 * Identicon 4:  Last 128 bits of BLAKE2(miniLockID||username).
	 * Note that the miniLock ID is hashed as its byte values, not as a string.
	 * @param {string} username
	 * @param {string} miniLockID
	 * @return {array} [hash1 (Hex string), hash2 (Hex string)]
	 */
	Peerio.crypto.getAvatar = function(username, miniLockID) {
		if (!username || !miniLockID) {
			return ''
		}
		var hash1 = new BLAKE2s(32)
		hash1.update(nacl.util.decodeUTF8(username))
		hash1.update(Base58.decode(miniLockID))
		var hash2 = new BLAKE2s(32)
		hash2.update(Base58.decode(miniLockID))
		hash2.update(nacl.util.decodeUTF8(username))
		return [hash1.hexDigest(), hash2.hexDigest()]
	}

	/**
	 * Encrypt a message to recipients, return header JSON and body.
	 * @param {object} message - Plaintext message object.
	 * @param {array} recipients - Array of usernames of recipients.
	 * @param {function} callback - With header, body parameters, and array of failed recipients.
	 */
	Peerio.crypto.encryptMessage = function(message, recipients, callback) {
		var miniLockIDs = [Peerio.user.miniLockID]
		var failed = []
		var sendMessage = function() {
			miniLock.crypto.encryptFile(
				new Blob([nacl.util.decodeUTF8(JSON.stringify(message))]),
				'message',
				miniLockIDs,
				Peerio.user.miniLockID,
				Peerio.user.keyPair.secretKey,
				null,
				function(encryptedChunks, header) {
					if (!encryptedChunks) {
						callback(false)
						return false
					}
					var encryptedBlob = new Blob(encryptedChunks)
					encryptedChunks = null
					var reader = new FileReader()
					reader.onload = function(readerEvent) {
						var encryptedBuffer = new Uint8Array(readerEvent.target.result)
						var headerLength = miniLock.util.byteArrayToNumber(
							encryptedBuffer.subarray(8, 12)
						)
						header = JSON.parse(header)
						var body = nacl.util.encodeBase64(
							encryptedBuffer.subarray(12 + headerLength)
						)
						if (typeof(callback) === 'function') {
							callback(header, body, failed)
						}
					}
					reader.readAsArrayBuffer(encryptedBlob)
				}
			)
		}
		recipients.forEach(function(recipient) {
			if (
				({}).hasOwnProperty.call(Peerio.user.contacts, recipient) &&
				({}).hasOwnProperty.call(Peerio.user.contacts[recipient], 'miniLockID') &&
				(miniLockIDs.indexOf(Peerio.user.contacts[recipient].miniLockID) < 0)
			) {
				miniLockIDs.push(Peerio.user.contacts[recipient].miniLockID)
			}
			else if (recipient !== Peerio.user.username) {
				failed.push(recipient)
			}
		})
		sendMessage()
	}

	/**
	 * Encrypt a file to recipients, return UTF8 Blob and header (separate).
	 * @param {object} file - File object to encrypt.
	 * @param {array} recipients - Array of usernames of recipients.
	 * @param {function} fileNameCallback - Callback with encrypted fileName.
	 * @param {function} callback - With header, body and failedRecipients parameters.
	 */
	Peerio.crypto.encryptFile = function(file, recipients, fileNameCallback, callback) {
		var miniLockIDs = [Peerio.user.miniLockID]
		var failed = []
		var sendFile = function() {
			var blob = file.slice()
			blob.name = file.name
			miniLock.crypto.encryptFile(
				blob,
				file.name,
				miniLockIDs,
				Peerio.user.miniLockID,
				Peerio.user.keyPair.secretKey,
				fileNameCallback,
				function(encryptedChunks, header) {
					if (!encryptedChunks) {
						if (typeof(callback) === 'function') {
							callback(false)
							return false
						}
					}
					encryptedChunks.splice(0, 4)
					if (typeof(callback) === 'function') {
						callback(
							JSON.parse(header),
							encryptedChunks,
							failed
						)
					}
				}
			)
		}
		recipients.forEach(function(recipient) {
			if (
				({}).hasOwnProperty.call(Peerio.user.contacts, recipient) &&
				({}).hasOwnProperty.call(Peerio.user.contacts[recipient], 'miniLockID') &&
				(miniLockIDs.indexOf(Peerio.user.contacts[recipient].miniLockID) < 0)
			) {
				miniLockIDs.push(Peerio.user.contacts[recipient].miniLockID)
			}
			else if (recipient !== Peerio.user.username) {
				failed.push(recipient)
			}
		})
		sendFile()
	}

	/**
	 * Decrypt a message.
	 * @param {object} messageObject - As received from server.
	 * @param {function} callback - with plaintext object.
	 */
	Peerio.crypto.decryptMessage = function(messageObject, callback) {
		if (!messageObject) {
			callback(false)
			return false
		}
		var header = JSON.stringify(messageObject.header)
		var messageBlob = new Blob([
			'miniLock',
			miniLock.util.numberToByteArray(header.length),
			header,
			nacl.util.decodeBase64(messageObject.body)
		])
		miniLock.crypto.decryptFile(
			messageBlob,
			Peerio.user.miniLockID,
			Peerio.user.keyPair.secretKey,
			function(decryptedBlob, saveName, senderID) {
				if (!decryptedBlob) {
					callback(false)
					return false
				}
				var claimedSender = messageObject.sender
				if (
					({}).hasOwnProperty.call(Peerio.user.contacts, claimedSender) &&
					Peerio.user.contacts[claimedSender].miniLockID !== senderID
				) {
					callback(false)
					return false
				}
				var decryptedBuffer
				var reader = new FileReader()
				reader.onload = function(readerEvent) {
					decryptedBuffer = nacl.util.encodeUTF8(
						new Uint8Array(readerEvent.target.result)
					)
					if (typeof(callback) === 'function') {
						var message = false
						try {
							message = JSON.parse(decryptedBuffer)
						}
						catch(e) {
							throw new Error('Peerio.crypto.decryptMessage: Invalid plaintext.')
							return false
						}
						if (
							({}).hasOwnProperty.call(message, 'subject')  &&
							({}).hasOwnProperty.call(message, 'message')  &&
							({}).hasOwnProperty.call(message, 'receipt')  &&
							({}).hasOwnProperty.call(message, 'sequence')
						) {
							if (
								(typeof(message.message) === 'string') &&
								(message.message.substring(0, 23) === 'data:image/jpeg;base64,') &&
								/^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/.test(
									message.message.substring(23)
								)
							) {
								message.isPhoto = true
							}
							callback(message)
						}
						else {
							callback(false)
						}
						
					}
				}
				reader.readAsArrayBuffer(decryptedBlob)
			}
		)
	}

	/**
	 * Decrypt a file.
	 * @param {string} id - File ID
	 * @param {object} blob - File ciphertext as blob
	 * @param {object} header
	 * @param {function} callback - with plaintext blob
	 */
	Peerio.crypto.decryptFile = function(id, blob, header, callback) {
		var headerString = JSON.stringify(header)
		var headerStringLength = nacl.util.decodeUTF8(headerString).length
		var miniLockBlob = new Blob([
			'miniLock',
			miniLock.util.numberToByteArray(headerStringLength),
			headerString,
			miniLock.util.numberToByteArray(256),
			nacl.util.decodeBase64(id),
			blob
		])
		miniLock.crypto.decryptFile(
			miniLockBlob,
			Peerio.user.miniLockID,
			Peerio.user.keyPair.secretKey,
			function(decryptedBlob, saveName, senderID) {
				if (!decryptedBlob) {
					callback(false)
					return false
				}
				var claimedSender = Peerio.user.files[id].creator
				if (({}).hasOwnProperty.call(Peerio.user.files[id], 'sender')) {
					claimedSender = Peerio.user.files[id].sender
				}
				if (
					({}).hasOwnProperty.call(Peerio.user.contacts, claimedSender) &&
					Peerio.user.contacts[claimedSender].miniLockID !== senderID
				) {
					callback(false)
					return false
				}
				else {
					callback(decryptedBlob)
				}
			}
		)
	}

	/**
	 * Decrypt a filename from a file's ID given by the Peerio server.
	 * @param {string} id - File ID (Base64)
	 * @param {object} header - miniLock header for file
	 * @return {string} fileName
	 */
	Peerio.crypto.decryptFileName = function(fileName, header) {
		var fileInfo = miniLock.crypto.decryptHeader(
			header,
			Peerio.user.keyPair.secretKey,
			Peerio.user.miniLockID
		).fileInfo
		fileInfo.fileNonce = nacl.util.decodeBase64(fileInfo.fileNonce)
		fileInfo.fileKey = nacl.util.decodeBase64(fileInfo.fileKey)
		var nonce = new Uint8Array(24)
		nonce.set(fileInfo.fileNonce)
		var decrypted = nacl.secretbox.open(
			nacl.util.decodeBase64(fileName),
			nonce,
			fileInfo.fileKey
		)
		decrypted = nacl.util.encodeUTF8(decrypted)
		while (
			decrypted[decrypted.length - 1] === String.fromCharCode(0x00)
		) {
			decrypted = decrypted.slice(0, -1)
		}
		return decrypted
	}

})()