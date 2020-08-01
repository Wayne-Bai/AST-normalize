var PushWoosh = {
	getToken : function() {
		return blackberry.identity.PIN;
	},
	
	register : function(lambda, lambdaerror) {
		var method = 'POST';
		var token = PushWoosh.getToken();
		var url = PushWoosh.baseurl + 'registerDevice';
		
		var language = window.navigator.language;
		var lang = 'en';
		if(language) {
			lang = language.substring(0,2); 
		}
		
		var dt = new Date();
		var timezoneOffset = dt.getTimezoneOffset() * 60;	//in seconds
		
		var params = {
				request : {
					application : PushWoosh.appCode,
					push_token : token,
					language : lang,
					hwid : blackberry.identity.IMEI,
					timezone : timezoneOffset,
					device_type : 2
				}
			};

		payload = (params) ? JSON.stringify(params) : '';
		
		PushWoosh.helper(url, method, payload, lambda, lambdaerror);
	},
	
	unregister : function(lambda, lambdaerror) {
		var method = 'POST';
		var url = PushWoosh.baseurl + 'unregisterDevice';
		
		var params = {
				request : {
					application : PushWoosh.appCode,
					hwid : blackberry.identity.IMEI
				}
			};

		payload = (params) ? JSON.stringify(params) : '';
		PushWoosh.helper(url, method, payload, lambda, lambdaerror);
	},
	
	sendBadge : function(badgeNumber, lambda, lambdaerror) {
		var method = 'POST';
		var token = PushWoosh.getToken();
		var url = PushWoosh.baseurl + 'setBadge';
		
		var params = {
				request : {
					application : PushWoosh.appCode,
					hwid : blackberry.identity.IMEI,
					badge: badgeNumber
				}
			};

		payload = (params) ? JSON.stringify(params) : '';
		PushWoosh.helper(url, method, payload, lambda, lambdaerror);
	},

	sendAppOpen : function(lambda, lambdaerror) {
		var method = 'POST';
		var token = PushWoosh.getToken();
		var url = PushWoosh.baseurl + 'applicationOpen';
		
		var params = {
				request : {
					application : PushWoosh.appCode,
					hwid : blackberry.identity.IMEI
				}
			};

		payload = (params) ? JSON.stringify(params) : '';
		PushWoosh.helper(url, method, payload, lambda, lambdaerror);
	},

	sendPushStat : function(hashValue, lambda, lambdaerror) {
		var method = 'POST';
		var token = PushWoosh.getToken();
		var url = PushWoosh.baseurl + 'pushStat';
		
		var params = {
				request : {
					application : PushWoosh.appCode,
					hwid : blackberry.identity.IMEI,
					hash: hashValue
				}
			};

		payload = (params) ? JSON.stringify(params) : '';
		PushWoosh.helper(url, method, payload, lambda, lambdaerror);
	},
		
	setTags : function(tagsJsonObject, lambda, lambdaerror) {
		var method = 'POST';
		var token = PushWoosh.getToken();
		var url = PushWoosh.baseurl + 'setTags';
		
		var params = {
				request : {
					application : PushWoosh.appCode,
					hwid : blackberry.identity.IMEI,
					tags: tagsJsonObject
				}
			};

		payload = (params) ? JSON.stringify(params) : '';
		PushWoosh.helper(url, method, payload, lambda, lambdaerror);
	},
	
	helper : function(url, method, params, lambda, lambdaerror) {
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

PushWoosh.baseurl = 'https://cp.pushwoosh.com/json/1.3/';
