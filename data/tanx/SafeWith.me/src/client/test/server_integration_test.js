module("Integration - Server");

asyncTest("Upload, Download, Delete blob", 4, function() {
	var util = new Util(window);
	var server = new Server(util);
	
	// create blob for uploading
	var ctAB = util.binStr2ArrBuf(testImg1Base64);
	var blob = util.arrBuf2Blob(ctAB, 'application/octet-stream');
	var ctMd5 = md5(testImg1Base64);

	server.uploadBlob(blob, ctMd5, function(blobKey) {
		ok(blobKey);
		
		server.downloadBlob(blobKey, function(download) {
			ok(download);
			
			// read blob as binary string
			var reader = new FileReader();
			reader.onload = function(event) {
				var encrStr = event.target.result;
				equal(encrStr, testImg1Base64);

				server.deleteBlob(blobKey, function(resp) {
					equal(resp, "");

					start();
				});
			};
			reader.readAsBinaryString(download);
		});
	}, function(err) {
		// test failed
		start();
		return;
	});
});