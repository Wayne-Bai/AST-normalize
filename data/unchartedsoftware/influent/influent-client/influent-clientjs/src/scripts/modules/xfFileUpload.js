/**
 * Copyright (c) 2013-2014 Oculus Info Inc.
 * http://www.oculusinfo.com/
 *
 * Released under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
define(
	['lib/module', 'lib/channels'],
	function(modules, chan) {

		var _fileUploadState = {
			subscriberTokens : null,
			iFrame : undefined
		};

		var _onFileUpload = function(eventChannel, data) {
			if(!data.action) return;

			var contentDocument = _fileUploadState.iFrame[0].contentDocument;

			if(data.preCallback) {
				contentDocument.preCallback = data.preCallback;
			}

			if(data.postCallback) {
				contentDocument.postCallback = data.postCallback;
			}
			contentDocument.multiform.action = aperture.io.restUrl(data.action);
			contentDocument.multiform.reset();

			contentDocument.multiform.file.accept = data.filter;
			contentDocument.multiform.file.click();
		};

		var _initializeModule = function() {
			_fileUploadState.iFrame = $('<iframe src="scripts/modules/upload.html" id="ifu" style="display:none">');
			_fileUploadState.iFrame.appendTo('body');
		};

		var fileUploadConstructor = function(){
			return {
				start : function(){
					var subTokens = {};

					// Subscribe to the appropriate calls.
					subTokens[chan.FILE_UPLOAD_REQUEST] = aperture.pubsub.subscribe(chan.FILE_UPLOAD_REQUEST, _onFileUpload);
					subTokens[chan.ALL_MODULES_STARTED] = aperture.pubsub.subscribe(chan.ALL_MODULES_STARTED, _initializeModule);
					_fileUploadState.subscriberTokens = subTokens;
				},
				end : function(){
					for (var token in _fileUploadState.subscriberTokens) {
						if (_fileUploadState.subscriberTokens.hasOwnProperty(token)) {
							aperture.pubsub.unsubscribe(_fileUploadState.subscriberTokens[token]);
						}
					}
				}
			};
		};

		// Register the module with the system
		modules.register('xfFileUpload', fileUploadConstructor);
		return {
		};
	}
);