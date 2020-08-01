/*
* Pushwoosh plugin for BlackBerry 10 HTML5
* Copyright 2014 Pushwoosh Inc.
* Based on BlackBerry Limited code.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var config = {
	ops : {
		invokeTargetId : "GENERATE.invoke.push",
		appId : "XXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
		ppgUrl : "http://cpXXXX.pushapi.eval.blackberry.com"
	},
	pushwooshAppId : "XXXXX-XXXXX",
	invokeTargetIdOpen : "GENERATE.invoke.open"
};

var pushwoosh = {
	/**
	 *	lastActivity: Keeps track of the time of the last push activity.
	 *	pushService: Our PushService object for this session.
	 */
	lastActivity : 0,
	pushService : 0,
	db : 0,
	
	pushwooshMessageCallback : 0,
	pushwooshRegisterSuccessCallback : 0,
	pushwooshRegisterFailedCallback : 0,

	queue: [],
	waiting: false,
	hasBeenInForeground: false,

	/**
	 *	Responsible for creating the PushService object.
	 */
	register: function (pushwooshMessageCallback) {
		// Check if the application started up in the foreground
        // We are trying to determine if the application was launched in the background
        // and so we would be able to process a push and exit from the application
        if (blackberry.app.windowState == "fullscreen")
		{
			pushwoosh.hasBeenInForeground = true;
		}

        // We also use the resume event to help determine if the application has
        // ever been brought to the foreground (from the background - hence it's
        // being "resumed")
        blackberry.event.addEventListener("resume", pushwoosh.onResume);
		//blackberry.event.addEventListener("pause", pushwoosh.onPause);
	
		/* Retrieve the last time (in milliseconds) of Push activity. */
		pushwoosh.lastActivity = window.parseInt(window.localStorage.lastActivity || 0, 10);
		pushwoosh.pushwooshMessageCallback = pushwooshMessageCallback;

		try {
            pushwoosh.db = openDatabase("pushwoosh", "1.0", "Push storage", 5 * 1024 * 1024);
        } catch (err) {
            // Do nothing here since the db will be left uninitialized and the proper error will be
            // displayed when the user attempts to perform an operation that requires a db transaction
        }
		
		pushwooshUtils.sendAppOpen(function(successMessage){
			utils.log("Send app open success: " + JSON.stringify(successMessage))
		}, function(jqXHR, errorMessage){
			utils.log("Send app open failed: " + JSON.stringify(errorMessage))
		});
		
		if (pushwoosh.pushService === 0) {
			/* We only need a new object if we don't already have one; i.e. once per launch. */
			utils.log('Creating PushService object.');
			try {
				/* This is the core Push functionality to create the PushService object. */
				blackberry.push.PushService.create(
					config.ops,
					pushwoosh.createSuccess,
					pushwoosh.createFailure,
					pushwoosh.simChangeCallback,
					pushwoosh.pushTransportReadyCallback
				);
			} catch (err) {
				utils.log(err);
			}
		} else {
			/* Forcing Push Service registration. */
			utils.log('PushService object already exists.');
			pushwoosh.registerChannel();
		}
	},

	onResume: function() {
        pushwoosh.hasBeenInForeground = true;
    },
	
	onPause: function() {
        pushwoosh.hasBeenInForeground = false;
    },
	
	/**
	 *	If the PushService object is created / exists, proceed to registering the Push Channel.
	 */
	createSuccess: function (result) {
		/* On success, the PushService object is passed into this function. */
		utils.log('PushService created successfully.');
		pushwoosh.pushService = result;

		document.addEventListener('invoked', pushwoosh.onInvoke);
		
		/* Accept pushes if the application is not running. */
		pushwoosh.pushService.launchApplicationOnPush(true, pushwoosh.launchApplicationOnPushCallback);

		if (new Date().getTime() - pushwoosh.lastActivity > 2 * 24 * 60 * 60 * 1000) {
			/* If we've gone more than two days without any activity, recreate the Push Channel. This is subjective. */
			utils.log('Expired Push Channel registration.');
			pushwoosh.registerChannel();
		} else {
			/* We have seen activity within two days, so likely everything is okay, take no action. */
			utils.log('No need to recreate the Push Channel.');
		}
	},

	launchApplicationOnPushCallback: function (result) {
		/* Log whether we will be launching on Push invocations. */
		if (result === blackberry.push.PushService.SUCCESS) {
			utils.log('Application will be launched on push.');
		} else {
			utils.log('Application will not be launched on push: ' + result);
		}
	},
	
	/**
	 *	When required, we will register a new Push Channel with the Push Service. It is NOT
	 *	required to create a new Push Channel every time. Once created, a Push Channel will
	 *	tend to last the lifetime of an application unless the Push Channel is intentionally
	 *	destroyed. There are some rare cases that can lead to a Push Channel becoming invalid.
	 *	To counteract this, we have implemented a two-day expectation on Push activity in the
	 *	createSuccess function above. If we do not see any activity within two days, we will
	 *	force the Push Channel to be recreated. The two days are purely arbitrary/subjective,
	 *	you will need to decide on an appropriate timeline for your own applications.
	 */
	registerChannel: function () {
		try {
			/* Call the createChannel API to open communication with the Push services. */
			utils.log('Creating Push Channel.');
			pushwoosh.pushService.createChannel(
				function createChannelCallback(result, token) {
					if (result === blackberry.push.PushService.SUCCESS) {
						/* Channel was successfully created, update Push activity. */
						utils.log('Successfully created Push Channel.');
						window.localStorage.lastActivity = new Date().getTime().toString();
						
						pushwooshUtils.register(pushwooshRegisterSuccessCallback, pushwooshRegisterFailedCallback);
					} else {
						/* Channel failed to be created. */
						utils.log('Failed to create Push Channel: ' + result);
					}
				}
			);
		} catch (err) {
			utils.log(err);
		}
	},

	createFailure: function (result) {
		utils.log('PushService creation error: ' + result);
	},

	simChangeCallback: function () {
		utils.log('SIM Card has changed.');
	},

	pushTransportReadyCallback: function (lastFailedOperation) {
		utils.log('Last failed operation: ' + lastFailedOperation);
	},

	/**
	 *	If we need to intentionally destroy an existing Push Channel, we can do so
	 *	with this API.
	 */
	unregister: function () {
		try {
			/* Call the destroyChannel API to cease communication with Push services. */
			utils.log('Destroying Push Channel.');
			pushwoosh.pushService.destroyChannel(
				function destroyChannelCallback(result) {
					if (result === blackberry.push.PushService.SUCCESS) {
						/* Channel was successfully destroyed, reset Push activity. */
						utils.log('Successfully destroyed Push Channel.');
						window.localStorage.lastActivity = 0;
					} else {
						/* Channel could not be destroyed. */
						utils.log('Failed to destroy Push Channel: ' + result);
					}
				}
			);
		} catch (err) {
			utils.log(err);
		}
	},

	/**
	 *	Iterate recursively through the pushwoosh.queue array until we've processed all pushes.
	 */
	processQueue: function (invokeRequest) {
		var pushPayload, reader;

		/* Check if there is anything left to process. */
		if (!invokeRequest) {
			/* We've processed everything. */
			utils.log('Processing complete.');
			pushwoosh.waiting = false;

			/* If we were processing pushes in the background, exit the app. */
			if (autoExit === true) {
				utils.log('Exit application.');
				/* blackberry.app.exit(); */
			}
			return;
		}

		try {
			/* Extract the payload from the Push Invocation. */
			pushPayload = pushwoosh.pushService.extractPushPayload(invokeRequest);

			/* Process a text data payload. */
			reader = new FileReader();
			reader.onload = function (result) {
				var text = result.target.result;
				utils.log(text);
				
				var pushObject = JSON.parse(text);
				
				pushwooshUtils.sendPushStat(pushObject.p, function(successMessage){
					utils.log("Send push stat success: " + JSON.stringify(successMessage))
				}, function(jqXHR, errorMessage){
					utils.log("Send push stat failed: " + JSON.stringify(errorMessage))
				})
				
				pushwoosh.pushwooshMessageCallback(pushObject);

				utils.log('Processing next item.');
				pushwoosh.processQueue(pushwoosh.queue.shift());
			};
			reader.onerror = function (result) {
				utils.log('Error converting blob to text: ' + result.target.error);

				utils.log('Processing next item.');
				pushwoosh.processQueue(pushwoosh.queue.shift());
			};
			reader.readAsText(pushPayload.data, 'UTF-8');
		} catch (err) {
			utils.log(err);
		}
	},

	/**
	 *	Our application was invoked before the PushService object had a chance to be created.
	 *	We'll keep checking periodically until the object is ready and then process any
	 *	outstanding pushes that we've received in the meantime.
	 */
	waitForPushService: function () {
		if (pushwoosh.pushService === 0) {
			/* We still don't have a PushService object, wait a little longer. */
			utils.log('Waiting.');
			window.setTimeout(pushwoosh.waitForPushService, 100);
		} else {
			/* We have a PushService object, begin processing from the beginning of the queue. */
			utils.log('Processing push queue.');
			pushwoosh.processQueue(pushwoosh.queue.shift());
		}
	},

	/**
	 *	This function will be called when a Push Invocation is received. In this example,
	 *	we are assuming a text-based data payload (see pushInitiator.js) to be received.
	 *	This is the most common case for many applications.
	 */
	onInvoke: function (invokeRequest) {
		/* Ensure the invocation has an action associated with it. */
		if (invokeRequest.action) {
			/* Only process Push Invocations. */
			if (invokeRequest.action === 'bb.action.PUSH') {
				/* Update our Push Activity to track this received push. */
				utils.log('Push invocation received.');
				window.localStorage.lastActivity = new Date().getTime();
				
				var pushPayload = pushwoosh.pushService.extractPushPayload(invokeRequest);
				
				pushHandler.handle(pushPayload);
			} else if (invokeRequest.action === 'bb.action.OPEN') {
				utils.log('Invocation received from open notification');
				// The payload from the open invoke is the seqnum for the push in the database
				var payload = pushHandler.b64_to_utf8(invokeRequest.data);
				utils.log('payload: ' + payload);
				pushwoosh.openPushFromDb(payload);
			} else {
				utils.log('Invocation received: ' + invokeRequest.action);
			}
		} else {
			utils.log('Invocation received but no associated action.');
		}
	},
	
	openPushFromDb: function (seqnum) {
		pushwoosh.db.readTransaction(function(tx) {
			tx.executeSql("SELECT type, extension, content, unread FROM push WHERE seqnum = ?;",
				[ seqnum ], 
				function(tx, results) {
					if (results.rows.length == 0) {
						var errorMessage = "Error: Content for the selected push could not be found.";
						utils.log(errorMessage);
					} else {
						// The content is either plain text, HTML, or XML
						var content = JSON.parse(pushHandler.b64_to_utf8(results.rows.item(0).content));
						
						pushwoosh.pushwooshMessageCallback(content);
					}
				},
				function(tx, e) {
					errorMessage = "Error: Content for the selected push could not be found.";
					utils.log(errorMessage);
				}
			);
		});	
	}
};

var utils = {
	/* Logs events to the screen and console. */
	log: function (value) {
		/*var div;

		el = {
			'clear': document.getElementById('clear'),
			'content': document.getElementById('content'),
			'register': document.getElementById('register'),
			'unregister': document.getElementById('unregister')
		};*/
		
		console.log(value);
		/*value = '<span style="color: #111111;">[' + new Date().toTimeString().split(' ')[0] + ']</span> ' + value.toString();

		div = document.createElement('div');
		div.innerHTML = value;
		el.content.appendChild(div);
		el.content.scrollTop = el.content.scrollHeight;*/
	}
};

var pushwooshUtils = {
	baseUrl : "http://cp.pushwoosh.com/json/1.3/",

	getToken : function() {
		var token = blackberry.identity.uuid.toString();
		if (token.indexOf("0x") === 0) {
			token = token.substring(2).toUpperCase();
		}
		return token;
	},
	
	register : function(lambda, lambdaerror) {
		
		var method = 'POST';
		var token = pushwooshUtils.getToken();
		var url = 'registerDevice';
		
		var language = window.navigator.language;
		var lang = 'en';
		if(language) {
			lang = language.substring(0,2); 
		}
		
		var dt = new Date();
		var timezoneOffset = dt.getTimezoneOffset() * 60;	//in seconds
		
		var params = {
				request : {
					application : config.pushwooshAppId,
					push_token : token,
					language : lang,
					hwid : blackberry.identity.uuid,
					timezone : timezoneOffset,
					device_type : 2
				}
			};

		payload = (params) ? JSON.stringify(params) : '';
		
		pushwooshUtils.helper(url, method, payload, lambda, lambdaerror);
	},
	
	unregister : function(lambda, lambdaerror) {
		var method = 'POST';
		var url = 'unregisterDevice';
		
		var params = {
				request : {
					application : config.pushwooshAppId,
					hwid : blackberry.identity.uuid
				}
			};

		payload = (params) ? JSON.stringify(params) : '';
		pushwooshUtils.helper(url, method, payload, lambda, lambdaerror);
	},
	
	sendBadge : function(badgeNumber, lambda, lambdaerror) {
		var method = 'POST';
		var token = pushwooshUtils.getToken();
		var url = 'setBadge';
		
		var params = {
				request : {
					application : config.pushwooshAppId,
					hwid : blackberry.identity.uuid,
					badge: badgeNumber
				}
			};

		payload = (params) ? JSON.stringify(params) : '';
		pushwooshUtils.helper(url, method, payload, lambda, lambdaerror);
	},

	sendAppOpen : function(lambda, lambdaerror) {
		var method = 'POST';
		var token = pushwooshUtils.getToken();
		var url = 'applicationOpen';
		
		var params = {
			request : {
				application : config.pushwooshAppId,
				hwid : blackberry.identity.uuid
			}
		};

		payload = (params) ? JSON.stringify(params) : '';
		pushwooshUtils.helper(url, method, payload, lambda, lambdaerror);
	},

	sendPushStat : function(hashValue, lambda, lambdaerror) {
		var method = 'POST';
		var token = pushwooshUtils.getToken();
		var url = 'pushStat';
		
		var params = {
				request : {
					application : config.pushwooshAppId,
					hwid : blackberry.identity.uuid,
					hash: hashValue
				}
			};

		payload = (params) ? JSON.stringify(params) : '';
		pushwooshUtils.helper(url, method, payload, lambda, lambdaerror);
	},
		
	setTags : function(tagsJsonObject, lambda, lambdaerror) {
		var method = 'POST';
		var token = pushwooshUtils.getToken();
		var url = 'setTags';
		
		var params = {
				request : {
					application : config.pushwooshAppId,
					hwid : blackberry.identity.uuid,
					tags: tagsJsonObject
				}
			};

		payload = (params) ? JSON.stringify(params) : '';
		pushwooshUtils.helper(url, method, payload, lambda, lambdaerror);
	},
	
	helper : function(url, method, params, lambda, lambdaerror) {
		url = pushwooshUtils.baseUrl + url;
		$.support.cors=true;
		$.ajax({
			type: "POST",
			async: true,
			url: url,
			dataType: "json",
			data: params,
			contentType: "application/json; charset=utf-8",
			success: function (msg, sts, jqXHR) {
				var status_code = msg['status_code'];

				if(status_code == 200) {
					lambda(msg);
				} else {
					lambdaerror(msg);
				}
			},
			error: function (jqXHR, sts, err) {
				lambdaerror(jqXHR, err);
			}
		});
	}
};

/**
 * This object has functions related to the handling of an incoming push.
 */

var pushHandler = {

	/**
	 * This function is called when new push content comes in. It checks for duplicate pushes, stores the push in the database, and
	 * updates the push list.
	 * 
	 * @param {blackberry.push.PushPayload}
	 *            pushpayload the newly received push content
	 */
	handle: function(pushPayload) {
		var contentType = pushPayload.headers["Content-Type"];
		
		pushHandler.checkForDuplicateMessage(pushPayload.id, pushPayload.data, contentType);

		// If an acknowledgement of the push is required (that is, the push was sent as a confirmed push
		// - which is equivalent terminology to the push being sent with application level reliability),
		// then you must either accept the push or reject the push
		if (pushPayload.isAcknowledgeRequired) {
			// In our sample, we always accept the push, but situations might arise where an application
			// might want to reject the push (for example, after looking at the headers that came with the push
			// or the data of the push, we might decide that the push received did not match what we expected
			// and so we might want to reject it)
			pushPayload.acknowledge(true);
		}
	},

	/**
	 * Checks to see if the newly received push is a duplicate of an existing push being displayed.
	 * 
	 * @param {String}
	 *            messageId the value of the push ID
	 * @param {Blob}
	 *            content the content of the push
	 * @param {String}
	 *            contentType the content type (i.e. the value of the "Content-Type" header)
	 */
	checkForDuplicateMessage: function(messageId, content, contentType) {
		// If there was no value for the header, then skip this check
		if (messageId == null) {
			pushHandler.processPush(content, contentType);
		} else {
			pushwoosh.db.transaction(function(tx) {
				tx.executeSql("CREATE TABLE IF NOT EXISTS messageidhistory"
						+ "(rownum INTEGER PRIMARY KEY AUTOINCREMENT, messageid TEXT);", [], function(tx, results) {
					pushHandler.successMessageIdHistoryCreation(messageId, content, contentType);
				});
			});
		}
	},

	/**
	 * Called after successfully creating the message id history table in the database (if it does not exist).
	 * 
	 * @param {String}
	 *            messageId the value of the push ID
	 * @param {Blob}
	 *            content the content of the push
	 * @param {String}
	 *            contentType the content type (i.e. the value of the "Content-Type" header)
	 */
	successMessageIdHistoryCreation: function(messageId, content, contentType) {
		pushwoosh.db.readTransaction(function(tx) {
			tx.executeSql("SELECT messageid FROM messageidhistory WHERE messageid = ?;", [ messageId ], function(tx, results) {
				if (results.rows.length != 0) {
					// A duplicate was found
					pushHandler.duplicateFoundAction();
				} else {
					// No duplicate was found, insert a new entry into the history
					pushwoosh.db.transaction(function(tx) {
						tx.executeSql("INSERT INTO messageidhistory (rownum, messageid) VALUES(?, ?);", [ null, messageId ],
								function(tx, results) {
									pushHandler.successMessageIdInsert(content, contentType);
								});
					});
				}
			});
		});
	},

	/**
	 * Called after successfully inserting a new entry into the message id history table in the database.
	 * 
	 * @param {Blob}
	 *            content the content of the push
	 * @param {String}
	 *            contentType the content type (i.e. the value of the "Content-Type" header)
	 */
	successMessageIdInsert: function(content, contentType) {
		pushwoosh.db.readTransaction(function(tx) {
			tx.executeSql("SELECT COUNT(*) AS count FROM messageidhistory;", [], function(tx, results) {
				if (results.rows.item(0).count > 10) {
					pushwoosh.db.transaction(function(tx) {
						// Remove the oldest message Id in the history
						tx.executeSql("DELETE FROM messageidhistory WHERE rownum = (SELECT min(rownum) FROM messageidhistory);", [],
								function(tx, results) {
									pushHandler.processPush(content, contentType);
								});
					});
				} else {
					pushHandler.processPush(content, contentType);
				}
			});
		});
	},

	/**
	 * Action to be taken when a duplicate push is detected. Currently, this function does nothing. We just discard the duplicate and
	 * exit the application if it has not been brought to the foreground.
	 */
	duplicateFoundAction: function() {
		// Exit the application if it has not been brought to the foreground
		if (!pushwoosh.hasBeenInForeground) {
			blackberry.app.exit();
		}
	},

	/**
	 * Performs all the processing required of a newly received push (now that it has been determined that that push is not a
	 * duplicate).
	 * 
	 * @param {Blob}
	 *            content the content of the push
	 * @param {String}
	 *            contentType the content type (i.e. the value of the "Content-Type" header)
	 */
	processPush: function(content, contentType) {
		// Remove the push list from local storage since the push list
		// is going to be updated with this new push we are processing
		localStorage.removeItem(config.pushwooshAppId);

		var currentTime = new Date();

		// Get the push date (based on the current time)
		var pushdate = pushHandler.getPushDate(currentTime);

		// Get the push time (based on the current time)
		var pushtime = pushHandler.getPushTime(currentTime);

		// Remove notifications if multi notifications are disabled
		//pushHandler.clearNotificationsIfAny(content, contentType, pushdate, pushtime);
		
		// Add the new pushed content to storage
		pushHandler.storePush(content, contentType, pushdate, pushtime);
	},

	/**
	 * Converts a Blob to a text string with the given encoding.
	 * 
	 * @param {Blob}
	 *            blob the blob to be converted
	 * @param {String}
	 *            encoding the encoding of the Blob
	 * @param {function}
	 *            callback the callback to be called with the string result. If blob is undefined or is an empty string then
	 *            returns an empty string
	 */
	blobToTextString: function(blob, encoding, callback) {
		if (!blob) {
			callback('');
		}

		var reader = new FileReader();

		reader.onload = function(evt) {
			// No errors, get the result and call the callback
			callback(evt.target.result);
		};

		reader.onerror = function(evt) {
			console.log("Error converting Blob to string: " + evt.target.error);
		};
		
		reader.readAsText(blob, encoding);
	},

	/**
	 * Converts a Blob to a binary base64 encoded string.
	 * 
	 * @param {Blob}
	 *            blob the blob to be converted
	 * @param {function}
	 *            callback the callback to be called with the binary base64 encoded string. If blob is undefined or is an empty
	 *            string then returns an empty string
	 */
	blobToBinaryBase64String: function(blob, callback) {
		if (!blob) {
			callback('');
		}

		var reader = new FileReader();

		reader.onload = function(evt) {
			// No errors, base64 encode the result and call the callback
			callback(pushHandler.arrayBufferToBase64(evt.target.result));
		};

		reader.onerror = function(evt) {
			console.log("Error converting Blob to binary base64 string: " + evt.target.error);
		};

		reader.readAsArrayBuffer(blob);
	},

	/**
	 * Converts an ArrayBuffer to a base64 encoded string.
	 * 
	 * @param {ArrayBuffer}
	 *            arrayBuffer the ArrayBuffer to be converted
	 */
	arrayBufferToBase64: function(arrayBuffer) {
		var binary = "";
		var bytes = new Uint8Array(arrayBuffer);
		var len = bytes.byteLength;

		for ( var i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}

		return window.btoa(binary);
	},

	/**
	 * Converts a Unicode/UTF8 string to Base64.
	 * 
	 * This function is a workaround because the atob and btoa browser functions that should convert between a binary string and a
	 * Base64 encoded ASCII string blow up when faced with Unicode with a INVALID_CHARACTER_ERR: DOM Exception 5.
	 * 
	 * http://ecmanaut.blogspot.ca/2006/07/encoding-decoding-utf8-in-javascript.html
	 * http://monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
	 * 
	 * @param str
	 *            the Unicode string to base64 encode
	 * @returns the base64 encoded Unicode string
	 */
	utf8_to_b64: function(str) {
		return window.btoa(unescape(encodeURIComponent(str)));
	},

	/**
	 * Converts a Base64 string to Unicode/UTF8 string.
	 * 
	 * This function is a workaround because the atob and btoa browser functions that should convert between a binary string and a
	 * Base64 encoded ASCII string blow up when faced with Unicode with a INVALID_CHARACTER_ERR: DOM Exception 5.
	 * 
	 * http://ecmanaut.blogspot.ca/2006/07/encoding-decoding-utf8-in-javascript.html
	 * http://monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
	 * 
	 * @param str
	 *            the base64 Unicode encoded string
	 * @returns the Unicode string
	 */
	b64_to_utf8: function(str) {
		return decodeURIComponent(escape(window.atob(str)));
	},

	/**
	 * Returns the date of the push based on the current time that is passed in.
	 * 
	 * @param {Date}
	 *            currentDate the current date and time
	 * @returns {String} the push date
	 */
	getPushDate: function(currentDate) {
		var dayOfWeek = pushHandler.getDayOfWeekText(currentDate.getDay());
		var month = pushHandler.getMonthText(currentDate.getMonth());
		var dayOfMonth = currentDate.getDate();
		var year = currentDate.getFullYear();

		return dayOfWeek + ", " + month + " " + dayOfMonth + ", " + year;
	},

	/**
	 * Returns the English abbreviation for a month.
	 * 
	 * @param {Number}
	 *            month a month of the year (from 0-11)
	 * @returns {String} a month's English abbreviation
	 */
	getMonthText: function(month) {
		if (month == 0) {
			return "Jan";
		} else if (month == 1) {
			return "Feb";
		} else if (month == 2) {
			return "Mar";
		} else if (month == 3) {
			return "Apr";
		} else if (month == 4) {
			return "May";
		} else if (month == 5) {
			return "Jun";
		} else if (month == 6) {
			return "Jul";
		} else if (month == 7) {
			return "Aug";
		} else if (month == 8) {
			return "Sep";
		} else if (month == 9) {
			return "Oct";
		} else if (month == 10) {
			return "Nov";
		} else {
			return "Dec";
		}
	},

	/**
	 * Returns the English abbreviation for a day of the week.
	 * 
	 * @param {Number}
	 *            day a day of the week (from 0-6)
	 * @returns {String} a day of the week's English abbreviation
	 */
	getDayOfWeekText: function(day) {
		if (day == 0) {
			return "Sun";
		} else if (day == 1) {
			return "Mon";
		} else if (day == 2) {
			return "Tue";
		} else if (day == 3) {
			return "Wed";
		} else if (day == 4) {
			return "Thu";
		} else if (day == 5) {
			return "Fri";
		} else if (day == 6) {
			return "Sat";
		}
	},

	/**
	 * Returns the time of the push based on the current time that is passed in.
	 * 
	 * @param {Date}
	 *            currentDate the current date and time
	 * @returns {String} the push time
	 */
	getPushTime: function(currentDate) {
		var hours = currentDate.getHours();
		var minutes = currentDate.getMinutes();
		var timeOfDay = "a";

		// We want all minutes less than 10 to add a "0" in front since,
		// for example, 5:8 for a time is incorrect (it should be 5:08)
		if (minutes < 10) {
			minutes = "0" + minutes;
		}

		if (hours >= 12) {
			timeOfDay = "p";
		}

		if (hours >= 13) {
			hours -= 12;
		}

		if (hours == 0) {
			hours += 12;
		}

		return hours + ":" + minutes + timeOfDay;
	},

	/**
	 * Remove all push notifications from hub and drop pushes table
	 * if in config multi notifications are disabled
	 */
	/*clearNotificationsIfAny: function(content, contentType, pushdate, pushtime) {
		if (config.enableMultiNotifications) {
			// Add the new pushed content to storage
			pushHandler.storePush(content, contentType, pushdate, pushtime);
			return;
		}
	
		pushwoosh.db.transaction(function(tx) {
            tx.executeSql("SELECT seqnum FROM push;", [ ], 
                function(tx, results) {
                    for (var i = 0; i < results.rows.length; i++) {
                    	Notification.remove(results.rows.item(i).seqnum + config.pushwooshAppId);	
                    }
                    
                    // Now, drop the push table to delete all the pushes
                    pushwoosh.db.transaction(function(tx) {
						tx.executeSql("DROP TABLE push;", [], function(tx, results){
							// Add the new pushed content to storage
							pushHandler.storePush(content, contentType, pushdate, pushtime);
						});
					});
                }
            );
        });
	},*/
	
	/**
	 * Inserts the newly received push content into the database.
	 * 
	 * @param {Blob}
	 *            content the content of the push
	 * @param {String}
	 *            contentType the content type (i.e. the value of the "Content-Type" header)
	 * @param {String}
	 *            pushdate the date of the push
	 * @param {String}
	 *            pushtime the time of the push
	 */
	storePush: function(content, contentType, pushdate, pushtime) {
		pushwoosh.db.transaction(function(tx) {
			tx.executeSql("CREATE TABLE IF NOT EXISTS push (seqnum INTEGER PRIMARY KEY AUTOINCREMENT, "
					+ "pushdate TEXT, type TEXT, pushtime TEXT, extension TEXT, content TEXT, unread TEXT);", [], function(tx,
					results) {
				var type = pushHandler.getPushedContentType(contentType);
				var extension = pushHandler.getPushedContentFileExtension(contentType);

				if (type == "image") {
					pushHandler.blobToBinaryBase64String(content, function(binaryBase64Str) {
						pushHandler.insertPush(binaryBase64Str, type, extension, pushdate, pushtime);
					});
				} else {
					pushHandler.blobToTextString(content, "UTF-8", function(textStr) {
						pushHandler.insertPush(pushHandler.utf8_to_b64(textStr), type, extension, pushdate, pushtime);
					});
				}
			});
		});
	},

	/**
	 * Attempts to insert the push into the database.
	 * 
	 * @param {String}
	 *            content the content of the push as a base64 encoded string
	 * @param {String}
	 *            type the content type
	 * @param {String}
	 *            extension the file extension of the push content
	 * @param {String}
	 *            pushdate the date of the push
	 * @param {String}
	 *            pushtime the time of the push
	 */
	insertPush: function(content, type, extension, pushdate, pushtime) {
		pushwoosh.db.transaction(function(tx) {
			tx.executeSql("INSERT INTO push (seqnum, pushdate, type, pushtime, extension, content, unread) "
					+ "VALUES (?, ?, ?, ?, ?, ?, ?);", [ null, pushdate, type, pushtime, extension, content, "T" ], function(tx,
					results) {
				var seqnum = results.insertId;
				
				var pushContent = JSON.parse(pushHandler.b64_to_utf8(content));
				
				if (!pushwoosh.hasBeenInForeground) {
					// Add a notification to the BlackBerry Hub for this push
					// if app does not in foreground
					var title = blackberry.app.name;
					var options = {
						body : pushContent.m,
						tag : seqnum + config.pushwooshAppId,
						target : config.invokeTargetIdOpen,
						targetAction : "bb.action.OPEN",
						// We set the data of the invoke to be the seqnum of the
						// push so that we know which push needs to be opened
						payload : pushHandler.utf8_to_b64(seqnum.toString(10))
					};
					new Notification(title, options);
				} else {
					// Call message callback
					pushwoosh.pushwooshMessageCallback(pushContent);
				}

				// Exit the application after processing the push if the
				// application has not been brought to the foreground
				if (!pushwoosh.hasBeenInForeground) {
					//setTimeout(function() {
						// Check again that the application has not been 
						// brought to the foreground in the second before
						// we exit
					  //  if (!pushwoosh.hasBeenInForeground) {
							blackberry.app.exit();
					  //  }
					//}, 1000);
				}
			});
		});
	},

	/**
	 * Adds a new push item (and possibly date heading) to the push list.
	 * 
	 * @param {String}
	 *            content the content of the push as a base64 encoded string
	 * @param {String}
	 *            type the content type
	 * @param {String}
	 *            extension the file extension of the push content
	 * @param {String}
	 *            pushdate the date of the push
	 * @param {String}
	 *            pushtime the time of the push
	 * @param {Number}
	 *            seqnum the unique id identifying the push
	 */
	addPushItem: function(content, type, extension, pushdate, pushtime, seqnum) {
		// Check if we are on the push list screen
		// Otherwise, there is no need to add the push item to the list
		// It will instead be handled when loading the pushes for the push list screen
		if (document.getElementById("push-screen") != null) {
			// Create a push row
			var pushRow = document.createElement("tr");
			pushRow.id = seqnum.toString(10);
			pushRow.className = "unread-push";

			// First column
			var firstColumn = document.createElement("td");
			firstColumn.setAttribute("onclick", "sample.pushcapture.openPush('" + pushRow.id + "');");
			firstColumn.className = "column1";

			var firstColumnImage = document.createElement("img");
			firstColumnImage.src = sample.pushcapture.getIconForType(type);

			firstColumn.appendChild(firstColumnImage);

			// Second column
			var secondColumn = document.createElement("td");
			secondColumn.setAttribute("onclick", "sample.pushcapture.openPush('" + pushRow.id + "');");
			secondColumn.className = "column2";

			var secondColumnText = document.createTextNode(sample.pushcapture.getPushPreview(type, extension, content));

			secondColumn.appendChild(secondColumnText);

			// Third column
			var thirdColumn = document.createElement("td");
			thirdColumn.setAttribute("onclick", "sample.pushcapture.openPush('" + pushRow.id + "');");
			thirdColumn.className = "column3";

			var thirdColumnText = document.createTextNode(pushtime);

			thirdColumn.appendChild(thirdColumnText);

			// Fourth column
			var fourthColumn = document.createElement("td");
			fourthColumn.setAttribute("onclick", "sample.pushcapture.deletePush('" + pushRow.id + "');");
			fourthColumn.className = "column4";

			var fourthColumnImage = document.createElement("img");
			fourthColumnImage.id = "img" + pushRow.id;
			fourthColumnImage.src = "img/trash.png";

			fourthColumn.appendChild(fourthColumnImage);

			pushRow.appendChild(firstColumn);
			pushRow.appendChild(secondColumn);
			pushRow.appendChild(thirdColumn);
			pushRow.appendChild(fourthColumn);

			// Create a date row
			var dateRow = document.createElement("tr");
			var dateColumn = document.createElement("td");
			dateColumn.colSpan = 4;
			dateColumn.className = "heading";

			var dateColumnText = document.createTextNode(pushdate);

			dateColumn.appendChild(dateColumnText);
			dateRow.appendChild(dateColumn);

			if (document.getElementById("no-results").style.display == "block") {
				// Hide the "no pushes" message
				document.getElementById("no-results").style.display = "none";

				document.getElementById("push-table").appendChild(dateRow);

				document.getElementById("push-table").appendChild(pushRow);
			} else if (document.getElementById("push-table").firstChild.firstChild.firstChild.nodeValue == pushdate) {
				// Insert below the current date row (since the date matches)
				document.getElementById("push-table").insertBefore(pushRow,
						document.getElementById("push-table").firstChild.nextSibling);
			} else {
				// Insert a row for the date heading (since the date did not match) and the push
				document.getElementById("push-table").insertBefore(pushRow, document.getElementById("push-table").firstChild);

				document.getElementById("push-table").insertBefore(dateRow, document.getElementById("push-table").firstChild);
			}
		}
	},

	/**
	 * Based on the "Content-Type" header of the received push, returns the corresponding file extension of the content.
	 * 
	 * @param {String}
	 *            contentType the content type (i.e. the value of the "Content-Type" header)
	 * @returns {String} the pushed content's file extension
	 */
	getPushedContentFileExtension: function(contentType) {
		if (!contentType) {
			return ".txt";
		}

		if (contentType.startsWith("application/xml")) {
			return ".xml";
		} else if (contentType.startsWith("text/html")) {
			return ".html";
		} else if (contentType.startsWith("image/jpeg")) {
			return ".jpg";
		} else if (contentType.startsWith("image/gif")) {
			return ".gif";
		} else if (contentType.startsWith("image/png")) {
			return ".png";
		} else if (contentType.startsWith("text/plain")) {
			return ".txt";
		} else {
			return ".txt";
		}
	},

	/**
	 * Based on the "Content-Type" header of the received push, returns the corresponding type.
	 * 
	 * @param {String}
	 *            contentType the content type (i.e. the value of the "Content-Type" header)
	 * @returns {String} the pushed content's type (i.e. one of "image", "xml", or "text")
	 */
	getPushedContentType: function(contentType) {
		if (!contentType) {
			return "text";
		}

		String.prototype.startsWith = function(str) {
			return (this.match("^" + str) == str);
		};
		
		if (contentType.startsWith("image")) {
			return "image";
		} else if (contentType.startsWith("text/html") || contentType.startsWith("application/xml")) {
			return "xml";
		} else {
			return "text";
		}
	}
}

//pushwoosh.hasBeenInForeground = false;