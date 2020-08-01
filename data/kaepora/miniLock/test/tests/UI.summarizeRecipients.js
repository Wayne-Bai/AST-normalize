// Test for summarizing the recipients of an encrypted file.
QUnit.test('UI.summarizeRecipients', function(assert) {
	'use strict';
	var recipientIDs
	var myMiniLockID = '7L11mb4hrRZoBC6TUKidzpmRrytxpPaR7Q2ks6JwaCQS'

	recipientIDs = ['7L11mb4hrRZoBC6TUKidzpmRrytxpPaR7Q2ks6JwaCQS']
	assert.propEqual(
		miniLock.UI.summarizeRecipients(recipientIDs, myMiniLockID),
		{
			senderCanDecryptFile: true,
			totalRecipients: 0
		},
		'Sender can decrypt, no other recipients'
	)

	recipientIDs = [
		'7L11mb4hrRZoBC6TUKidzpmRrytxpPaR7Q2ks6JwaCQS',
		'6msgdRKNGxSmqrxsbUxFwawhRzcAns9PCumStmUtJFHv'
	]
	assert.propEqual(
		miniLock.UI.summarizeRecipients(recipientIDs, myMiniLockID),
		{
			senderCanDecryptFile: true,
			totalRecipients: 1
		},
		'Sender can decrypt, 1 other recipient'
	)

	recipientIDs = [
		'7L11mb4hrRZoBC6TUKidzpmRrytxpPaR7Q2ks6JwaCQS',
		'6msgdRKNGxSmqrxsbUxFwawhRzcAns9PCumStmUtJFHv',
		'CEfTr4iKoh4C71EKXB3Fji6aFEhRvyBGqqpHRBzGsVCb'
	]
	assert.propEqual(
		miniLock.UI.summarizeRecipients(recipientIDs, myMiniLockID),
		{
			senderCanDecryptFile: true,
			totalRecipients: 2
		},
		'Sender can decrypt, two other recipients'
	)

	recipientIDs = ['6msgdRKNGxSmqrxsbUxFwawhRzcAns9PCumStmUtJFHv']
	assert.propEqual(
		miniLock.UI.summarizeRecipients(recipientIDs, myMiniLockID),
		{
			senderCanDecryptFile: false,
			totalRecipients: 1
		},
		'Sender cannot decrypt, one recipient'
	)

	recipientIDs = [
		'6msgdRKNGxSmqrxsbUxFwawhRzcAns9PCumStmUtJFHv',
		'CEfTr4iKoh4C71EKXB3Fji6aFEhRvyBGqqpHRBzGsVCb'
	]
	assert.propEqual(
		miniLock.UI.summarizeRecipients(recipientIDs, myMiniLockID),
		{
			senderCanDecryptFile: false,
			totalRecipients: 2
		},
		'Sender cannot decrypt, two recipients'
	)
})
