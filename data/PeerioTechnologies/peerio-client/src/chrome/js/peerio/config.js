// ---------------------
// Peerio.config
// ---------------------
//
// Peerio's config object contains client configuration.

Peerio.config = {};

(function() {
	'use strict';

	Peerio.config = {
		version: '1.0.4.3',
		buildID: 9,
		updateJSON: 'https://peerio.com/update/info.json',
		updateWin: 'https://peerio.com/download/peerio-win.exe',
		updateMac: 'https://peerio.com/download/peerio-mac.zip',
		minPINEntropy: 24,
		fileUploadSizeLimit: 419430400
	}

})()