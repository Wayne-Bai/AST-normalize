/*
	Twitscript is a port of Twython (http://github.com/ryanmcgrath/twython)
	to server-side Javascript.

	TODO: OAuth, Streaming API?

	Questions, comments? ryan@venodesigns.net
*/

var sys = require("sys"),
    http = require("http"),
	base64 = require("./vendor/base64"),
	streaming = require("./streaming");

exports.init = function(setupObj) {
	/*	new twitscript.init({username: "example", password: "example", headers: "example", version: 1})

		Instantiates an instance of Twitscript. Takes optional parameters for authentication and such (see below).

		Parameters:
			username - Your Twitter username, if you want Basic (HTTP) Authentication.
			password - Password for your twitter account, if you want Basic (HTTP) Authentication.
			headers - (Optional) User agent header.
			version (number) - (Optional, defaults to 1) Twitter supports a "versioned" API - this defaults to 1.

			** Note: versioning is not currently used by search.twitter functions; when Twitter moves their junk, it'll be supported.
	*/

  if (setupObj == null) setupObj = {};

	/* Store any usernames, etc that were passed in */
	this.username = setupObj.username;
	this.password = setupObj.password;
	this.headers = setupObj.headers;
	this.version = typeof setupObj.version === "undefined" ? 1 : setupObj.version;
	this.authenticated = false;
	this.opener = http.createClient(80, "api.twitter.com");
	this.search_opener = http.createClient(80, "search.twitter.com");
	
	this.headers = {
	  'Accept': '*/*',
		'Host': 'api.twitter.com',
		'User-Agent': 'Twitscript Node.js Client'
	};
	
	/* Store any params that were passed in. */
	if(setupObj) {
		this.headers = setupObj.headers ? setupObj.headers : null;
		this.version = setupObj.version ? setupObj.version : 1;
	
		/*	Quick patch to get around process.mixin() deprecation. This doesn't do a deep copy by any means,
			but for a simple headers object it should be enough. At some point, this should be looked at again though... */
		if(setupObj.headers) {
			for(var i in setupObj.headers) {
				this.headers[i] = setupObj.headers[i];
			}
		}
	}
	
	this.authenticated = false;
	this.opener = http.createClient(80, "api.twitter.com");
	this.search_opener = http.createClient(80, "search.twitter.com");
}

exports.init.prototype = {	
	streamer: null,
	
	makeRequest: function(reqObj) {
		var request = null,
			searchOpener = null,
			fullURL = "/" + this.version + reqObj.url;

		// Check for GET, assume POST (DELETE methods just append _method=DELETE for now)
		if(reqObj.type === "SEARCH") {
			fullURL = reqObj.url;
			request = this.search_opener.request('GET', fullURL, {"host": "search.twitter.com", "User-Agent": this.headers});
		} else {
			request = this.opener.request(reqObj.type, fullURL, this.headers);
		}

		request.addListener('response', function (resp) {
			var statusCode = resp.statusCode,
				finalResp = "";

			resp.setEncoding("utf8");
			
			if(statusCode !== 200) return sys.puts("Request to " + fullURL + " failed with a " + statusCode + " error code.\nHeaders: " + sys.inspect(resp.headers));

			resp.addListener("data", function(chunk) {
				finalResp += chunk;
			});

			resp.addListener("end", function() {
				if(typeof reqObj.callback !== "undefined" && typeof reqObj.callback === "function") reqObj.callback(JSON.parse(finalResp));
			});
		});

		return request.end();
	},
	
	constructApiURL: function(base_url, params) {
		var returnURL = base_url + "?lol=1"; // Cheap hack, because it's 1:41 AM. Refactor if you care.

		for(var i in params) {
		  if (params[i])
			  returnURL += "&" + i.toString() + "=" + params[i];
		}
		
		return returnURL;
	},

	stream: function(params) {
		this.streamer = new streaming.Streamer({
			auth: this.headers['Authorization'],
			headers: params.headers || {
				'Accept': '*/*',
				'Host': params.api || 'stream.twitter.com',
				'User-Agent': 'Twitscript Node.js Client',
			},
			port: params.port || 80,
			type: params.type || 'filter',
			api: params.api || 'stream.twitter.com',
			follow: params.follow || [],
			keywords: params.keywords || [],
			locations: params.locations || [],
		});
		return this.streamer;
	},

	verifyCredentials: function(callbackfn) {
		return this.makeRequest({
			type: "GET",
			url: "/account/verify_credentials.json",
			callback: callbackfn
		});
	},

	getPublicTimeline: function(callbackfn) {
		/*	getPublicTimeline()

			Returns the 20 most recent statuses from non-protected users who have set a custom user icon.
			The public timeline is cached for 60 seconds, so requesting it more often than that is a waste of resources.

			Params:
				callbackfn(data) - A callback function to handle the data returned from the call.
		*/
		return this.makeRequest({
			type: "GET",
			url: "/statuses/public_timeline.json",
			callback: callbackfn
		});
	},

	getRateLimitStatus: function(callbackfn) {
		/*	getRateLimitStatus()

			Returns the remaining number of API requests available to the requesting user before the
			API limit is reached for the current hour. Calls to rate_limit_status do not count against
			the rate limit.  If authentication credentials are provided, the rate limit status for the
			authenticating user is returned.  Otherwise, the rate limit status for the requesting
			IP address is returned.
		*/	
		return this.makeRequest({
			type: "GET",
			url: "/account/rate_limit_status.json",
			callback: callbackfn
		});
	},

	getHomeTimeline: function(paramsObj, callbackfn) {
		/*	getHomeTimeline(paramsObj, callbackfn)

			Returns the 20 most recent statuses, including retweets, posted by the authenticating user
			and that user's friends. This is the equivalent of /timeline/home on the Web.

			Usage note: This home_timeline is identical to statuses/friends_timeline, except it also
			contains retweets, which statuses/friends_timeline does not (for backwards compatibility
			reasons). In a future version of the API, statuses/friends_timeline will go away and
			be replaced by home_timeline.

			Parameters:
				since_id - Optional.  Returns only statuses with an ID greater than (that is, more recent than) the specified ID.
				max_id - Optional.  Returns only statuses with an ID less than (that is, older than) or equal to the specified ID. 
				count - Optional.  Specifies the number of statuses to retrieve. May not be greater than 200.  
				page - Optional. Specifies the page of results to retrieve. Note: there are pagination limits.
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: this.constructApiURL("/statuses/home_timeline.json", paramsObj),
				callback: callbackfn
			});
		} else {
			return sys.puts("You need to be authenticated to grab a Home Timeline.");
		}
	},
	
	getFriendsTimeline: function(paramsObj, callbackfn) {
		/*	getFriendsTimeline(paramsObj, callbackfn)

			Returns the 20 most recent statuses posted by the authenticating user, as well as that users friends. 
			This is the equivalent of /timeline/home on the Web.

			Parameters:
				since_id - Optional.  Returns only statuses with an ID greater than (that is, more recent than) the specified ID.
				max_id - Optional.  Returns only statuses with an ID less than (that is, older than) or equal to the specified ID. 
				count - Optional.  Specifies the number of statuses to retrieve. May not be greater than 200.  
				page - Optional. Specifies the page of results to retrieve. Note: there are pagination limits.
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: this.constructApiURL("/statuses/friends_timeline.json", paramsObj),
				callback: callbackfn
			});
		} else {
			return sys.puts("You need to be authenticated to grab a Home Timeline.");
		}
	},

	getUserTimeline: function(paramsObj, callbackfn) { 
		/*	getUserTimeline(paramsObj, callbackfn)

			Returns the 20 most recent statuses posted from the authenticating user. It's also
			possible to request another user's timeline via the id parameter. This is the
			equivalent of the Web /<user> page for your own user, or the profile page for a third party.

			Parameters:
				id - Optional. Specifies the ID or screen name of the user for whom to return the user_timeline.
				user_id - Optional. Specfies the ID of the user for whom to return the user_timeline. Helpful for disambiguating.
				screen_name - Optional. Specfies the screen name of the user for whom to return the user_timeline. (Helpful for disambiguating when a valid screen name is also a user ID)
				since_id -  Optional.  Returns only statuses with an ID greater than (that is, more recent than) the specified ID.
				max_id - Returns only statuses with an ID less than (that is, older than) or equal to the specified ID.
				count - Optional.  Specifies the number of statuses to retrieve. May not be greater than 200.
				page - Optional. Specifies the page of results to retrieve. Note: there are pagination limits. 
		*/
		var userTimelineURL = "";

		if(paramsObj.id) {
			userTimelineURL = this.constructApiURL("/statuses/user_timeline/" + paramsObj.id + ".json", paramsObj);
		} else if(paramsObj.user_id || paramsObj.screen_name) {
			userTimelineURL = this.constructApiURL("/statuses/user_timeline.json", paramsObj);
		} else if(this.username) {
			userTimelineURL = this.constructApiURL("/statuses/user_timeline/" + this.username + ".json", paramsObj);
		} else {
			return sys.puts("You need to pass an id, user_id, or screen_name to getUserTimeline()");
		}
	
		return this.makeRequest({
			type: "GET",
			url: userTimelineURL,
			callback: callbackfn
		});
	},
		
	getUserMentions: function(paramsObj, callbackfn) {
		/*	getUserMentions(paramsObj, callbackfn)

			Returns the 20 most recent mentions (status containing @username) for the authenticating user.

			Parameters:
				since_id - Optional.  Returns only statuses with an ID greater than (that is, more recent than) the specified ID.
				max_id - Optional.  Returns only statuses with an ID less than (that is, older than) or equal to the specified ID. 
				count - Optional.  Specifies the number of statuses to retrieve. May not be greater than 200.  
				page - Optional. Specifies the page of results to retrieve. Note: there are pagination limits.
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: this.constructApiURL("/statuses/mentions.json", paramsObj),
				callback: callbackfn
			});
		} else {
			return sys.puts("You need to be authenticated to use getUserMentions()");
		}
	},

	reportSpam: function(callbackfn) {
		/*	reportSpam(paramsObj, callbackfn) {

			Report a user account to Twitter as a spam account. *One* of the following parameters is required, and
			this requires that you be authenticated with a user account.

			Parameters:
				id - Optional. The ID or screen_name of the user you want to report as a spammer.
				user_id - Optional.  The ID of the user you want to report as a spammer. Helpful for disambiguating when a valid user ID is also a valid screen name.
				screen_name - Optional.  The ID or screen_name of the user you want to report as a spammer. Helpful for disambiguating when a valid screen name is also a user ID.
		*/
		if(this.authenticated === true) {
			if(paramsObj.id || paramsObj.user_id || paramsObj.screen_name) {
				return this.makeRequest({
					type: "POST",
					url: "/report_spam.json?" + (paramsObj.id ? paramsObj.id : (paramsObj.user_id ? paramsObj.user_id : paramsObj.screen_name)),
					callback: callbackfn
				});
			} else {
				return sys.puts("reportSpam requires an id, user_id, or screen_name to be passed.");
			}
		} else {
			return sys.puts("reportSpam() requires you to be authenticated with Twitter.");
		}
	},

	reTweet: function(paramsObj, callbackfn) {
		/*	reTweet(paramsObj, callbackfn)

			Retweets a tweet. Requires the id parameter of the tweet you are retweeting.

			Parameters:
				id - Required. The numerical ID of the tweet you are retweeting.
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/statuses/retweet/" + paramsObj.id + ".json",
				callback: callbackfn
			});
		} else {
			return sys.puts("reTweet() requires you to be authenticated!");
		}
	},

	getRetweets: function(paramsObj, callbackfn) {
		/*	getRetweets: function(paramsObj, callbackfn) {
			
			Returns up to 100 of the first retweets of a given tweet.
		
			Parameters:
				id - Required.  The numerical ID of the tweet you want the retweets of.
				count - Optional.  Specifies the number of retweets to retrieve. May not be greater than 100.
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: "/statuses/retweets/" + paramsObj.id + ".json" + (paramsObj.count ? ("?count=" + paramsObj.count) : ""),
				callback: callbackfn
			});
		} else {
			return sys.puts("getRetweets() requires you to be authenticated.");
		}
	},

	retweetedOfMe: function(paramsObj, callbackfn) {
		/*	retweetedOfMe(paramsObj, callbackfn)

			Returns the 20 most recent tweets of the authenticated user that have been retweeted by others.

			Parameters:
				since_id - Optional.  Returns only statuses with an ID greater than (that is, more recent than) the specified ID.
				max_id - Optional.  Returns only statuses with an ID less than (that is, older than) or equal to the specified ID. 
				count - Optional.  Specifies the number of statuses to retrieve. May not be greater than 200.  
				page - Optional. Specifies the page of results to retrieve. Note: there are pagination limits.
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: this.constructApiURL("/statuses/retweets_of_me.json", paramsObj),
				callback: callbackfn
			});
		} else {
			return sys.puts("retweetedOfMe() requires you to be authenticated.");
		}
	},
	
	retweetedByMe: function(paramsObj, callbackfn) {
		/*	retweetedByMe(paramsObj)

			Returns the 20 most recent retweets posted by the authenticating user.

			Parameters:
				since_id - Optional.  Returns only statuses with an ID greater than (that is, more recent than) the specified ID.
				max_id - Optional.  Returns only statuses with an ID less than (that is, older than) or equal to the specified ID. 
				count - Optional.  Specifies the number of statuses to retrieve. May not be greater than 200.  
				page - Optional. Specifies the page of results to retrieve. Note: there are pagination limits.
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: this.constructApiURL("/statuses/retweeted_by_me.json", paramsObj),
				callback: callbackfn
			});
		} else {
			return sys.puts("retweetedByMe() requires you to be authenticated.");
		}
	},

	retweetedToMe: function(paramsObj, callbackfn) {
		/*	retweetedToMe(paramsObj)

			Returns the 20 most recent retweets posted by the authenticating user's friends.

			Parameters:
				since_id - Optional.  Returns only statuses with an ID greater than (that is, more recent than) the specified ID.
				max_id - Optional.  Returns only statuses with an ID less than (that is, older than) or equal to the specified ID. 
				count - Optional.  Specifies the number of statuses to retrieve. May not be greater than 200.  
				page - Optional. Specifies the page of results to retrieve. Note: there are pagination limits.
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: this.constructApiURL("/statuses/retweeted_to_me.json", paramsObj),
				callback: callbackfn
			});
		} else {
			return sys.puts("retweetedToMe() requires you to be authenticated.")
		}
	},

	searchUsers: function(paramsObj, callbackfn) {
		/*	searchUsers(q, per_page = None, page = None) {

			Query Twitter to find a set of users who match the criteria we have. (Note: This, oddly, requires authentication - go figure)

			Parameters:
				q (string) - Required. The query you wanna search against; self explanatory. ;)
				per_page (number) - Optional, defaults to 20. Specify the number of users Twitter should return per page (no more than 20, just fyi)
				page (number) - Optional, defaults to 1. The page of users you want to pull down.
		*/
		if(!paramsObj.per_page) paramsObj.per_page = 20;
		if(!paramsObj.page) paramsObj.page = 1;

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/users/search.json?q=" + paramsObj.q + "&per_page=" + paramsObj.per_page + "&page=" + paramsObj.page,
				callback: callbackfn
			});
		} else {
			return sys.puts("searchUsers(), oddly, requires you to be authenticated.")
		}
	},

	showUser: function(paramsObj, callbackfn) {
		/*	showUser(id = None, user_id = None, screen_name = None)

			Returns extended information of a given user.  The author's most recent status will be returned inline.

			Parameters:
				** Note: One of the following must always be specified.
				id - The ID or screen name of a user.
				user_id - Specfies the ID of the user to return. Helpful for disambiguating when a valid user ID is also a valid screen name.
				screen_name - Specfies the screen name of the user to return. Helpful for disambiguating when a valid screen name is also a user ID.

			Usage Notes:
			Requests for protected users without credentials from 
				1) the user requested or
				2) a user that is following the protected user will omit the nested status element.

			...will result in only publicly available data being returned.
		*/
		var apiURL = "";
		if(paramsObj.id) apiURL = "/users/show/" + paramsObj.id + ".json";
		else if(paramsObj.user_id) apiURL = "/users/show.json?user_id=" + paramsObj.user_id;
		else if(paramsObj.screen_name) apiURL = "/users/show.json?screen_name=" + paramsObj.screen_name;
		else return sys.puts("You need to specify an id, user_id, or screen_name for showUser()");

		return this.makeRequest({
			type: "GET",
			url: apiURL,
			callback: callbackfn
		});
	},

	bulkUserLookup: function(paramsObj, callbackfn) {
		var apiURL = "/users/lookup.json?lol=1"; /* Cheese */
		
		if(typeof paramsObj.user_ids === "undefined" && typeof paramsObj.screen_names === "undefined")
			return sys.puts("You need to pass in an Array of user_ids or screen_names to bulkUserLookup().");

		if(paramsObj.user_ids && paramsObj.user_ids instanceof Array) {
			apiURL += "&user_id=";

			for(var i = 0; i < paramsObj.user_ids.length; i++)
				apiURL += paramsObj.user_ids[i] + ",";
		}

		if(paramsObj.screen_names && paramsObj.screen_names instanceof Array) {
			apiURL += "&screen_name=";

			for(var i = 0; i < paramsObj.screen_names.length; i++)
				apiURL += paramsObj.screen_names[i] + ",";
		}

		return this.makeRequest({
			type: "GET",
			url: apiURL,
			callback: callbackfn
		});
	},

	getFriendsStatus: function(paramsObj, callbackfn) {
		/*	getFriendsStatus(paramsObj, callbackfn)

			Returns a user's friends, each with current status inline. They are ordered by the order in which they were added as friends, 100 at a time. 
			(Please note that the result set isn't guaranteed to be 100 every time, as suspended users will be filtered out.) Use the page option to access 
			older friends. With no user specified, the request defaults to the authenticated users friends. 
			
			It's also possible to request another user's friends list via the id, screen_name or user_id parameter.

			Note: The previously documented page-based pagination mechanism is still in production, but please migrate to cursor-based pagination for increase reliability and performance.
			
			Parameters:
				** Note: One of the following is required. (id, user_id, or screen_name)
				id - Optional. The ID or screen name of the user for whom to request a list of friends. 
				user_id - Optional. Specfies the ID of the user for whom to return the list of friends. Helpful for disambiguating when a valid user ID is also a valid screen name.
				screen_name - Optional. Specfies the screen name of the user for whom to return the list of friends. Helpful for disambiguating when a valid screen name is also a user ID.
				page - (BEING DEPRECATED) Optional. Specifies the page of friends to receive.
				cursor - Optional. Breaks the results into pages. A single page contains 100 users. This is recommended for users who are following many users. Provide a value of  -1 to begin paging. Provide values as returned to in the response body's next_cursor and previous_cursor attributes to page back and forth in the list.
		*/
		if(this.authenticated === true) {
			var apiURL = "";
			if(paramsObj.id) apiURL = "/statuses/friends/" + paramsObj.id + ".json";
			if(paramsObj.user_id) apiURL = "/statuses/friends.json?user_id=" + paramsObj.user_id;
			if(paramsObj.screen_name) apiURL = "/statuses/friends.json?screen_name=" + paramsObj.screen_name;
			else return sys.puts("You need to specify an id, user_id, or screen_name for getFriendsStatus()");
			
			return this.makeRequest({
				type: "GET",
				url: apiURL + (paramsObj.page ? "&page=" + paramsObj.page : "&cursor=" + paramsObj.cursor),
				callback: callbackfn
			});
		} else {
			return sys.puts("getFriendsStatus() requires you to be authenticated.");
		}
	},

	getFollowersStatus: function(paramsObj, callbackfn) {
		/*	getFollowersStatus(paramsObj, callbackfn)

			Returns the authenticating user's followers, each with current status inline.
			They are ordered by the order in which they joined Twitter, 100 at a time.
			(Note that the result set isn't guaranteed to be 100 every time, as suspended users will be filtered out.) 
			
			Use the page option to access earlier followers.

			Note: The previously documented page-based pagination mechanism is still in production, but please migrate to cursor-based pagination for increase reliability and performance.
			
			Parameters:
				** Note: One of the following is required. (id, user_id, screen_name)
				id - Optional. The ID or screen name of the user for whom to request a list of followers. 
				user_id - Optional. Specfies the ID of the user for whom to return the list of followers. Helpful for disambiguating when a valid user ID is also a valid screen name.
				screen_name - Optional. Specfies the screen name of the user for whom to return the list of followers. Helpful for disambiguating when a valid screen name is also a user ID.
				page - (BEING DEPRECATED) Optional. Specifies the page to retrieve.		
				cursor - Optional. Breaks the results into pages. A single page contains 100 users. This is recommended for users who are following many users. Provide a value of  -1 to begin paging. Provide values as returned to in the response body's next_cursor and previous_cursor attributes to page back and forth in the list.
		*/
		if(this.authenticated === true) {
			var apiURL = "";
			if(paramsObj.id) apiURL = "/statuses/followers/" + paramsObj.id + ".json";
			if(paramsObj.user_id) apiURL = "/statuses/followers.json?user_id=" + paramsObj.user_id;
			if(paramsObj.screen_name) apiURL = "/statuses/followers.json?screen_name=" + paramsObj.screen_name;
			else return sys.puts("You need to specify an id, user_id, or screen_name for getFollowersStatus()");
			
			return this.makeRequest({
				type: "GET",
				url: apiURL + (paramsObj.page ? "&page=" + paramsObj.page : "&cursor=" + paramsObj.cursor),
				callback: callbackfn
			});
		} else {
			return sys.puts("getFollowersStatus() requires you to be authenticated.");
		}
	},

	showStatus: function(paramsObj, callbackfn) {
		/*	showStatus(paramsObj, callbackfn)

			Returns a single status, specified by the id parameter below.
			The status's author will be returned inline.

			Parameters:
				id - Required. The numerical ID of the status to retrieve.
		*/
		return this.makeRequest({
			type: "GET",
			url: "/statuses/show/" + paramsObj.id + ".json",
			callback: callbackfn
		});
	},

	updateStatus: function(paramsObj, callbackfn) {
		/*	updateStatus(paramsObj, callbackfn)

			Updates the authenticating user's status.  Requires the status parameter specified below.
			A status update with text identical to the authenticating users current status will be ignored to prevent duplicates.

			Parameters:
				status - Required. The text of your status update. URL encode as necessary. Statuses over 140 characters will be forceably truncated.
				in_reply_to_status_id - Optional. The ID of an existing status that the update is in reply to.
				latitude - Optional. The location's latitude that this tweet refers to.
				longitude - Optional. The location's longitude that this tweet refers to.

				** Note: in_reply_to_status_id will be ignored unless the author of the tweet this parameter references
				is mentioned within the status text. Therefore, you must include @username, where username is 
				the author of the referenced tweet, within the update.
 
				** Note: valid ranges for latitude/longitude are, for example, -180.0 to +180.0 (East is positive) inclusive.  
				This parameter will be ignored if outside that range, not a number, if geo_enabled is disabled, or if there not a corresponding latitude parameter with this tweet.
		*/
		if(!paramsObj.status) return sys.puts("You didn't provide a status message to update with. Wtf?");

		if(this.authenticated === true) {
			var update = "/statuses/update.json?status=" + encodeURIComponent(paramsObj.status);
			if(paramsObj.in_reply_to_status_id) update += "&in_reply_to_status_id=" + paramsObj.in_reply_to_status_id;
			if(paramsObj.latitude && paramsObj.longitude) update += "&lat=" + paramsObj.latitude + "&long=" + longitude;
			
			return this.makeRequest({
				type: "POST",
				url: update,
				callback: callbackfn
			});
		} else {
			return sys.puts("You need to be authenticated to update a status.");
		}
	},

	destroyStatus: function(paramsObj, callbackfn) {
		/*	destroyStatus(paramsObj, callbackfn)

			Destroys the status specified by the required ID parameter. 
			The authenticating user must be the author of the specified status.

			Parameters:
				id - Required. The ID of the status to destroy.
		*/
		if(!paramsObj.id) return sys.puts("You didn't specify an ID to delete.");

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/status/destroy/" + paramsObj.id + ".json",
				callback: callbackfn
			});
		} else {
			return sys.puts("destroyStatus() requires you to be authenticated.")
		}
	},

	endSession: function() {
		/*	endSession()

			Ends the session of the authenticating user, returning a null cookie. 
			Use this method to sign users out of client-facing applications (widgets, etc).

			NOTE: Returns nothing

			Parameters:
				None
		*/
		if(this.authenticated === true) {
			var that = this;
			return this.makeRequest({
				type: "POST",
				url: "/account/end_session.json",
				callback: function() { that.authenticated = false; }
			});
		} else {
			return sys.puts("You can't end a session when you're not authenticated to begin with.")
		}
	},

	getDirectMessages: function(paramsObj, callbackfn) {
		/*	getDirectMessages(paramsObj, callbackfn)

			Returns a list of the 20 most recent direct messages sent to the authenticating user. 

			Parameters:
				since_id - Optional.  Returns only statuses with an ID greater than (that is, more recent than) the specified ID.
				max_id - Optional.  Returns only statuses with an ID less than (that is, older than) or equal to the specified ID. 
				count - Optional.  Specifies the number of statuses to retrieve. May not be greater than 200.  
				page - Optional. Specifies the page of results to retrieve. Note: there are pagination limits.
		*/
		if(this.authenticated === true) {
			var apiURL = "/direct_messages.json?page=" + (paramsObj.page ? paramsObj.page : 1);
			if(paramsObj.since_id) apiURL += "&since_id=" + paramsObj.since_id;
			if(paramsObj.max_id) apiURL += "&max_id=" + paramsObj.max_id;
			if(paramsObj.count) apiURL += "&count=" + paramsObj.count;

			return this.makeRequest({
				type: "GET",
				url: apiURL,
				callback: callbackfn
			});
		} else {
			return sys.puts("getDirectMessages() requires you to be authenticated.")
		}
	},

	getSentMessages: function(paramsObj, callbackfn) {
		/*	getSentMessages(paramsObj, callbackfn)

			Returns a list of the 20 most recent direct messages sent by the authenticating user.

			Parameters:
				since_id - Optional.  Returns only statuses with an ID greater than (that is, more recent than) the specified ID.
				max_id - Optional.  Returns only statuses with an ID less than (that is, older than) or equal to the specified ID. 
				count - Optional.  Specifies the number of statuses to retrieve. May not be greater than 200.  
				page - Optional. Specifies the page of results to retrieve. Note: there are pagination limits.
		*/
		if(this.authenticated === true) {
			var apiURL = "/direct_messages/sent.json?page=" + (paramsObj.page ? paramsObj.page : 1);
			if(paramsObj.since_id) apiURL += "&since_id=" + paramsObj.since_id;
			if(paramsObj.max_id) apiURL += "&max_id=" + paramsObj.max_id;
			if(paramsObj.count)	apiURL += "&count=" + paramsObj.count;

			return this.makeRequest({
				type: "GET",
				url: apiURL,
				callback: callbackfn
			});
		} else {
			return sys.puts("getSentMessages() requires you to be authenticated.")
		}
	},

	sendDirectMessage: function(paramsObj, callbackfn) {
		/*	sendDirectMessage(user, text)

			Sends a new direct message to the specified user from the authenticating user. Requires both the user and text parameters. 
			Returns the sent message in the requested format when successful.

			Parameters:
				user - Required. The ID or screen name of the recipient user.
				text - Required. The text of your direct message. Be sure to keep it under 140 characters.
		*/
		if(!paramsObj.user || !paramsObj.text) return sys.puts("You need to specify both a user (ID or screen name) and the text you want to send in the direct message.");

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/direct_messages/new.json?user=" + paramsObj.user + "&text=" + encodeURIComponent(paramsObj.text),
				callback: callbackfn
			});
		} else {
			return sys.puts("You must be authenticated to send a new direct message.")
		}
	},

	destroyDirectMessage: function(paramsObj, callbackfn) {
		/*	destroyDirectMessage(id)

			Destroys the direct message specified in the required ID parameter.
			The authenticating user must be the recipient of the specified direct message.

			Parameters:
				id - Required. The ID of the direct message to destroy.
		*/
		if(!paramsObj.id) return sys.puts("You need to specify an id of a direct message to destroy.");

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/direct_messages/destroy/" + paramsObj.id + ".json",
				callback: callbackfn
			});
		} else {
			return sys.puts("You must be authenticated to destroy a direct message.")
		}
	},

	createFriendship: function(paramsObj, callbackfn) {
		/*	createFriendship(paramsObj, callbackfn)

			Allows the authenticating users to follow the user specified in the ID parameter.
			Returns the befriended user in the requested format when successful. Returns a
			string describing the failure condition when unsuccessful. If you are already
			friends with the user an HTTP 403 will be returned.

			Parameters:
				** Note: One of the following is required. (id, user_id, screen_name)
				id - Required. The ID or screen name of the user to befriend.
				user_id - Required. Specfies the ID of the user to befriend. Helpful for disambiguating when a valid user ID is also a valid screen name. 
				screen_name - Required. Specfies the screen name of the user to befriend. Helpful for disambiguating when a valid screen name is also a user ID. 
				follow - Optional. Enable notifications for the target user in addition to becoming friends. 
		*/
		if(this.authenticated === true) {
			var apiURL = "";
			if(paramsObj.id) apiURL = "/friendships/create/" + paramsObj.id + ".json?follow=" + paramsObj.follow;
			else if(paramsObj.user_id) apiURL = "/friendships/create.json?user_id=" + paramsObj.user_id + "&follow=" + paramsObj.follow;
			else if(paramsObj.screen_name) apiURL = "/friendships/create.json?screen_name=" + paramsObj.screen_name + "&follow=" + paramsObj.follow;
			else return sys.puts("You need to pass an id, user_id, or screen_name to createFriendship()");

			return this.makeRequest({
				type: "POST",
				url: apiURL,
				callback: callbackfn
			});
		} else {
			return sys.puts("createFriendship() requires you to be authenticated.")
		}
	},

	destroyFriendship: function(paramsObj, callbackfn) {
		/*	destroyFriendship(paramsObj, callbackfn)

			Allows the authenticating users to unfollow the user specified in the ID parameter.  
			Returns the unfollowed user in the requested format when successful.  Returns a string describing the failure condition when unsuccessful.

			Parameters:
				** Note: One of the following is required. (id, user_id, screen_name)
				id - Required. The ID or screen name of the user to unfollow. 
				user_id - Required. Specfies the ID of the user to unfollow. Helpful for disambiguating when a valid user ID is also a valid screen name. 
				screen_name - Required. Specfies the screen name of the user to unfollow. Helpful for disambiguating when a valid screen name is also a user ID.
				version (number) - Optional. API version to request. Entire Twython class defaults to 1, but you can override on a function-by-function or class basis - (version=2), etc.
		*/
		if(this.authenticated === true) {
			var apiURL = "";
			if(paramsObj.id) apiURL = "/friendships/destroy/" + paramsObj.id + ".json?follow=" + paramsObj.follow;
			else if(paramsObj.user_id) apiURL = "/friendships/destroy.json?user_id=" + paramsObj.user_id + "&follow=" + paramsObj.follow;
			else if(paramsObj.screen_name) apiURL = "/friendships/destroy.json?screen_name=" + paramsObj.screen_name + "&follow=" + paramsObj.follow;
			else return sys.puts("You need to pass an id, user_id, or screen_name to destroyFriendship()");

			return this.makeRequest({
				type: "POST",
				url: apiURL,
				callback: callbackfn
			});
		} else {
			return sys.puts("destroyFriendship() requires you to be authenticated.")
		}
	},
	
	checkIfFriendshipExists: function(paramsObj, callbackfn) {
		/*	checkIfFriendshipExists(user_a, user_b)

			Tests for the existence of friendship between two users.
			Will return true if user_a follows user_b; otherwise, it'll return false.

			Parameters:
				user_a - Required. The ID or screen_name of the subject user.
				user_b - Required. The ID or screen_name of the user to test for following.
		*/
		if(this.authenticated === true) {
			if(paramsObj.user_a && paramsObj.user_b) {
				return this.makeRequest({
					type: "GET",
					url: "/friendships/exists.json?user_a=" + paramsObj.user_a + "&user_b=" + paramsObj.user_b,
					callback: callbackfn
				});
			} else {
				return sys.puts("You need to pass both user_a and user_b to checkIfFriendshipExists()");
			}
		} else {
			return sys.puts("checkIfFriendshipExists(), oddly, requires that you be authenticated.")
		}
	},

	showFriendship: function(paramsObj, callbackfn) {
		/*	showFriendship(paramsObj, callbackfn)

			Returns detailed information about the relationship between two users. 

			Parameters:
				** Note: One of the following is required if the request is unauthenticated
				source_id - The user_id of the subject user.
				source_screen_name - The screen_name of the subject user.

				** Note: One of the following is required at all times
				target_id - The user_id of the target user.
				target_screen_name - The screen_name of the target user.

				version (number) - Optional. API version to request. Entire Twython class defaults to 1, but you can override on a function-by-function or class basis - (version=2), etc.
		*/
		var apiURL = "/friendships/show.json?lol=1"; // # A quick hack, look away if you want. ;D
		if(paramsObj.source_id)	apiURL += "&source_id=" + paramsObj.source_id;
		if(paramsObj.source_screen_name) apiURL += "&source_screen_name=" + paramsObj.source_screen_name;
		if(paramsObj.target_id) apiURL += "&target_id=" + paramsObj.target_id;
		if(paramsObj.target_screen_name) apiURL += "&target_screen_name=" + paramsObj.target_screen_name;
	
		return this.makeRequest({
			type: "GET",
			url: apiURL,
			callback: callbackfn
		});
	},

	updateDeliveryDevice: function(paramsObj, callbackfn) {
		/*	updateDeliveryDevice(device_name = "none")

			Sets which device Twitter delivers updates to for the authenticating user.
			Sending "none" as the device parameter will disable IM or SMS updates. (Simply calling .updateDeliveryService() also accomplishes this)

			Parameters:
				device - Required. Must be one of: sms, im, none.
		*/
		if(!paramsObj.device) return sys.puts("You need to specify a device (\"sms\", \"im\", \"none\") for updateDeliveryService");
		
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/account/update_delivery_device.json?device=" + paramsObj.device,
				callback: callbackfn
			});
		} else {
			return sys.puts("updateDeliveryDevice() requires you to be authenticated.")
		}
	},

	updateProfileColors: function(paramsObj, callbackfn) {
		/*	updateProfileColors(paramsObj)

			Sets one or more hex values that control the color scheme of the authenticating user's profile page on api.twitter.com.

			Parameters:
				** Note: One or more of the following parameters must be present. Each parameter's value must
				be a valid hexidecimal value, and may be either three or six characters (ex: #fff or #ffffff).

				profile_background_color - Optional.
				profile_text_color - Optional.
				profile_link_color - Optional.
				profile_sidebar_fill_color - Optional.
				profile_sidebar_border_color - Optional.
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: this.constructApiURL("/account/update_profile_colors.json", paramsObj),
				callback: callbackfn
			});
		} else {
			return sys.puts("updateProfileColors() requires you to be authenticated.")
		}
	},

	updateProfile: function(paramsObj, callbackfn) {
		/*	updateProfile(paramsObj, callbackfn)

			Sets values that users are able to set under the "Account" tab of their settings page. 
			Only the parameters specified will be updated.

			Parameters:
				One or more of the following parameters must be present.  Each parameter's value
				should be a string.  See the individual parameter descriptions below for further constraints.

				name - Optional. Maximum of 20 characters.
				email - Optional. Maximum of 40 characters. Must be a valid email address.
				url - Optional. Maximum of 100 characters. Will be prepended with "http://" if not present.
				location - Optional. Maximum of 30 characters. The contents are not normalized or geocoded in any way.
				description - Optional. Maximum of 160 characters.
		*/
		var useAmpersands = false,
			updateProfileQueryString = "";
		
		if(this.authenticated === true) {
			
			if(paramsObj.name) {
				if(paramsObj.name.split("").length < 20) {
					updateProfileQueryString += "name=" + paramsObj.name;
					useAmpersands = true;
				} else {
					return sys.puts("Twitter has a character limit of 20 for all usernames. Try again.");
				}
			}
			
			if(paramsObj.email && paramsObj.email.indexOf("@") > 0) {
				if(paramsObj.email.split("").length < 40) {
					if(useAmpersands) {
						updateProfileQueryString += "&email=" + paramsObj.email;
					} else {
						updateProfileQueryString += "email=" + paramsObj.email;
						useAmpersands = true;
					}
				} else {
					return sys.puts("Twitter has a character limit of 40 for all email addresses, and the email address must be valid. Try again.");
				}
			}
			
			if(paramsObj.url) {
				if(paramsObj.url.split("").length < 100) {
					if(useAmpersands) {
						updateProfileQueryString += "&url=" + encodeURIComponent(paramsObj.url);
					} else {
						updateProfileQueryString += "?url=" + encodeURIComponent(paramsObj.url);
						useAmpersands = true;
					}
				} else {
					return sys.puts("Twitter has a character limit of 100 for all urls. Try again.");
				}
			}

			if(paramsObj.location) {
				if(paramsObj.location.split("").length < 30) {
					if(useAmpersands) {
						updateProfileQueryString += "&location=" + encodeURIComponent(paramsObj.location);
					} else {
						updateProfileQueryString += "?location=" + encodeURIComponent(paramsObj.location);
						useAmpersands = true;
					}
				} else {
					return sys.puts("Twitter has a character limit of 30 for all locations. Try again.");
				}
			}

			if(paramsObj.description) {
				if(paramsObj.description.split("").length < 160) {
					if(useAmpersands) {
						updateProfileQueryString += "&description=" + encodeURIComponent(paramsObj.description);
					} else {
						updateProfileQueryString += "?description=" + encodeURIComponent(paramsObj.description);
					}
				} else {
					return sys.puts("Twitter has a character limit of 160 for all descriptions. Try again.");
				}
			}

			if(updateProfileQueryString !== "") {
				return this.makeRequest({
					type: "POST",
					url: "/account/update_profile.json" + updateProfileQueryString,
					callback: callbackfn
				});
			} else {
				return sys.puts("You need to pass some arguments to updateProfile()");
			} 
		} else {
			return sys.puts("updateProfile() requires you to be authenticated.");
		}
	},

	getFavorites: function(paramsObj, callbackfn) {
		/*	getFavorites(paramsObj, callbackfn)

			Returns the 20 most recent favorite statuses for the authenticating user or user specified by the ID parameter in the requested format.

			Parameters:
				page - Optional. Specifies the page of favorites to retrieve.
		*/
		if(!paramsObj.page) paramsObj.page = 1;

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: "/favorites.json?page=" + paramsObj.page,
				callback: callbackfn
			});
		} else {
			return sys.puts("getFavorites() requires you to be authenticated.")
		}
	},

	createFavorite: function(paramsObj, callbackfn) {
		/*	createFavorite(paramsObj, callbackfn)

			Favorites the status specified in the ID parameter as the authenticating user. Returns the favorite status when successful.

			Parameters:
				id - Required. The ID of the status to favorite.
		*/
		if(!paramsObj.id) return sys.puts("You didn't pass an ID to createFavorite()");

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/favorites/create/" + paramsObj.id + ".json",
				callback: callbackfn
			});
		} else {
			return sys.puts("createFavorite() requires you to be authenticated.")
		}
	},

	destroyFavorite: function(paramsObj, callbackfn) {
		/*	destroyFavorite(paramsObj, callbackfn)

			Un-favorites the status specified in the ID parameter as the authenticating user. Returns the un-favorited status in the requested format when successful.

			Parameters:
				id - Required. The ID of the status to un-favorite.
		*/
		if(!paramsObj.id) return sys.puts("You didn't pass an ID to destroyFavorite()");

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/favorites/destroy/" + paramsObj.id + ".json",
				callback: callbackfn
			});
		} else {
			return sys.puts("destroyFavorite() requires you to be authenticated.")
		}
	},

	notificationFollow: function(paramsObj, callbackfn) {
		/*	notificationFollow(paramsObj, callbackfn)

			Enables device notifications for updates from the specified user. Returns the specified user when successful.

			Parameters:
				** Note: One of the following is required. (id, user_id, screen_name)
				id - Required. The ID or screen name of the user to follow with device updates.
				user_id - Required. Specfies the ID of the user to follow with device updates. Helpful for disambiguating when a valid user ID is also a valid screen name. 
				screen_name - Required. Specfies the screen name of the user to follow with device updates. Helpful for disambiguating when a valid screen name is also a user ID. 
		*/
		if(this.authenticated === true) {
			var apiURL = ""
			if(paramsObj.id) apiURL = "/notifications/follow/" + paramsObj.id + ".json";
			else if(paramsObj.user_id) apiURL = "/notifications/follow/follow.json?user_id=" + paramsObj.user_id;
			else if(paramsObj.screen_name) apiURL = "/notifications/follow/follow.json?screen_name=" + paramsObj.screen_name
			else return sys.puts("You need to pass an id, user_id, or screen_name to notificationFollow()");

			return this.makeRequest({
				type: "POST",
				url: apiURL,
				callback: callbackfn
			});
		} else {
			return sys.puts("notificationFollow() requires you to be authenticated.")
		}
	},

	notificationLeave: function(paramsObj, callbackfn) {
		/*	notificationLeave(paramsObj, callbackfn)

			Disables notifications for updates from the specified user to the authenticating user.  Returns the specified user when successful.

			Parameters:
				** Note: One of the following is required. (id, user_id, screen_name)
				id - Required. The ID or screen name of the user to follow with device updates.
				user_id - Required. Specfies the ID of the user to follow with device updates. Helpful for disambiguating when a valid user ID is also a valid screen name. 
				screen_name - Required. Specfies the screen name of the user to follow with device updates. Helpful for disambiguating when a valid screen name is also a user ID. 
		*/
		if(this.authenticated === true) {
			var apiURL = "";
			if(paramsObj.id) apiURL = "/notifications/leave/" + paramsObj.id + ".json";
			else if(paramsObj.user_id) apiURL = "/notifications/leave/leave.json?user_id=" + paramsObj.user_id;
			else if(paramsObj.screen_name) apiURL = "/notifications/leave/leave.json?screen_name=" + paramsObj.screen_name;
			else return sys.puts("You need to pass an id, user_id, or screen_name to notificationLeave()");

			return this.makeRequest({
				type: "POST",
				url: apiURL,
				callback: callbackfn
			});
		} else {
			return sys.puts("notificationLeave() requires you to be authenticated.")
		}
	},

	getFriendsIDs: function(paramsObj, callbackfn) {
		/*	getFriendsIDs(paramsObj, callbackfn)

			Returns an array of numeric IDs for every user the specified user is following.

			Note: The previously documented page-based pagination mechanism is still in production, but please migrate to cursor-based pagination for increase reliability and performance.

			Parameters:
				** Note: One of the following is required. (id, user_id, screen_name)
				id - Required. The ID or screen name of the user to follow with device updates.
				user_id - Required. Specfies the ID of the user to follow with device updates. Helpful for disambiguating when a valid user ID is also a valid screen name. 
				screen_name - Required. Specfies the screen name of the user to follow with device updates. Helpful for disambiguating when a valid screen name is also a user ID. 
				page - (BEING DEPRECATED) Optional. Specifies the page number of the results beginning at 1. A single page contains up to 5000 ids. This is recommended for users with large ID lists. If not provided all ids are returned. (Please note that the result set isn't guaranteed to be 5000 every time as suspended users will be filtered out.)
				cursor - Optional. Breaks the results into pages. A single page contains 5000 ids. This is recommended for users with large ID lists. Provide a value of -1 to begin paging. Provide values as returned to in the response body's "next_cursor" and "previous_cursor" attributes to page back and forth in the list.
		*/
		var apiURL = "",
			breakResults = "cursor=" + (paramsObj.cursor ? paramsObj.cursor : "-1");
		
		if(paramsObj.page) breakResults = "page=" + paramsObj.page;
		
		if(paramsObj.id) apiURL = "/friends/ids/" + paramsObj.id + ".json?lol=1";
		else if(paramsObj.user_id) apiURL = "/friends/ids.json?user_id=" + paramsObj.user_id;
		else if(paramsObj.screen_name) apiURL = "/friends/ids.json?screen_name=" + paramsObj.screen_name;
		else return sys.puts("You need to pass an id, user_id, or screen_name to getFriendsIDs()");

		return this.makeRequest({
			type: "GET",
			url: apiURL + "&" + breakResults,
			callback: callbackfn
		});
	},

	getFollowersIDs: function(paramsObj, callbackfn) {
		/*	getFollowersIDs(paramsObj, callbackfn)

			Returns an array of numeric IDs for every user following the specified user.

			Note: The previously documented page-based pagination mechanism is still in production, but please migrate to cursor-based pagination for increase reliability and performance.
			
			Parameters:
				** Note: One of the following is required. (id, user_id, screen_name)
				id - Required. The ID or screen name of the user to follow with device updates.
				user_id - Required. Specfies the ID of the user to follow with device updates. Helpful for disambiguating when a valid user ID is also a valid screen name. 
				screen_name - Required. Specfies the screen name of the user to follow with device updates. Helpful for disambiguating when a valid screen name is also a user ID. 
				page - (BEING DEPRECATED) Optional. Specifies the page number of the results beginning at 1. A single page contains 5000 ids. This is recommended for users with large ID lists. If not provided all ids are returned. (Please note that the result set isn't guaranteed to be 5000 every time as suspended users will be filtered out.)
				cursor - Optional. Breaks the results into pages. A single page contains 5000 ids. This is recommended for users with large ID lists. Provide a value of -1 to begin paging. Provide values as returned to in the response body's "next_cursor" and "previous_cursor" attributes to page back and forth in the list.
		*/
		var apiURL = "",
			breakResults = "cursor=" (paramsObj.cursor ? paramsObj.cursor : "-1");
			
		if(paramsObj.page) breakResults = "page=" + paramsObj.page;
		
		if(paramsObj.id) apiURL = "/followers/ids/" + paramsObj.id + ".json?lol=1";
		else if(paramsObj.user_id) apiURL = "/followers/ids.json?user_id=" + paramsObj.user_id;
		else if(paramsObj.screen_name) apiURL = "/followers/ids.json?screen_name=" + paramsObj.screen_name;
		else return sys.puts("You need to pass an id, user_id, or screen_name to getFollowersIDs()");

		return this.makeRequest({
			type: "GET",
			url: apiURL + "&" + breakResults,
			callback: callbackfn
		});
	},
	
	createBlock: function(paramsObj, callbackfn) {
		/*	createBlock(paramsObj, callbackfn)

			Blocks the user specified in the ID parameter as the authenticating user. Destroys a friendship to the blocked user if it exists. 
			Returns the blocked user in the requested format when successful.

			Parameters:
				id - The ID or screen name of a user to block.
		*/
		if(!paramsObj.id) return sys.puts("You didn't pass an id to createBlock()");

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/blocks/create/" + paramsObj.id + ".json",
				callback: callbackfn
			});
		} else {
			return sys.puts("createBlock() requires you to be authenticated.")
		}
	},

	destroyBlock: function(paramsObj, callbackfn) {
		/*	destroyBlock(paramsObj, callbackfn)

			Un-blocks the user specified in the ID parameter for the authenticating user.
			Returns the un-blocked user in the requested format when successful.

			Parameters:
				id - Required. The ID or screen_name of the user to un-block
		*/
		if(!paramsObj.id) return sys.puts("You didn't pass an id to destroyBlock()");

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/blocks/destroy/" + paramsObj.id + ".json",
				callback: callbackfn
			});
		} else {
			return sys.puts("destroyBlock() requires you to be authenticated.")
		}
	},

	checkIfBlockExists: function(paramsObj, callbackfn) {
		/*	checkIfBlockExists(paramsObj, callbackfn)

			Returns if the authenticating user is blocking a target user. Will return the blocked user's object if a block exists, and 
			error with an HTTP 404 response code otherwise.

			Parameters:
				** Note: One of the following is required. (id, user_id, screen_name)
				id - Optional. The ID or screen_name of the potentially blocked user.
				user_id - Optional. Specfies the ID of the potentially blocked user. Helpful for disambiguating when a valid user ID is also a valid screen name.
				screen_name - Optional. Specfies the screen name of the potentially blocked user. Helpful for disambiguating when a valid screen name is also a user ID.
		*/
		var apiURL = "";
		if(paramsObj.id) apiURL = "/blocks/exists/" + paramsObj.id + ".json";
		else if(paramsObj.user_id) apiURL = "/blocks/exists.json?user_id=" + paramsObj.user_id
		else if(paramsObj.screen_name) apiURL = "/blocks/exists.json?screen_name=" + paramsObj.screen_name;
		else return sys.puts("You need to pass an id, user_id, or screen_name to checkIfBlockExists()");
		
		return this.makeRequest({
			type: "GET",
			url: apiURL,
			callback: callbackfn
		});
	},

	getBlocking: function(paramsObj, callbackfn) {
		/*	getBlocking(paramsObj, callbackfn)

			Returns an array of user objects that the authenticating user is blocking.

			Parameters:
				page - Optional. Specifies the page number of the results beginning at 1. A single page contains 20 ids.
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: "/blocks/blocking.json?page=" + (paramsObj.page ? paramsObj.page : "1"),
				callback: callbackfn
			});
		} else {
			return sys.puts("getBlocking() requires you to be authenticated")
		}
	},

	getBlockedIDs: function(callbackfn) {
		/*	getBlockedIDs()

			Returns an array of numeric user ids the authenticating user is blocking.

			Parameters:
				None
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: "/blocks/blocking/ids.json",
				callback: callbackfn
			});
		} else {
			return sys.puts("getBlockedIDs() requires you to be authenticated.")
		}
	},

	searchTwitter: function(paramsObj, callbackfn) {
		/*	searchTwitter(search_query, paramsObj)

			Returns tweets that match a specified query.

			Parameters:
				callback - Optional. Only available for JSON format. If supplied, the response will use the JSONP format with a callback of the given name.
				lang - Optional. Restricts tweets to the given language, given by an ISO 639-1 code.
				locale - Optional. Language of the query you're sending (only ja is currently effective). Intended for language-specific clients; default should work in most cases.
				rpp - Optional. The number of tweets to return per page, up to a max of 100.
				page - Optional. The page number (starting at 1) to return, up to a max of roughly 1500 results (based on rpp * page. Note: there are pagination limits.)
				since_id - Optional. Returns tweets with status ids greater than the given id.
				geocode - Optional. Returns tweets by users located within a given radius of the given latitude/longitude, where the user's location is taken from their Twitter profile. The parameter value is specified by "latitide,longitude,radius", where radius units must be specified as either "mi" (miles) or "km" (kilometers). Note that you cannot use the near operator via the API to geocode arbitrary locations; however you can use this geocode parameter to search near geocodes directly.
				show_user - Optional. When true, prepends "<user>:" to the beginning of the tweet. This is useful for readers that do not display Atom's author field. The default is false. 

			Usage Notes:
				Queries are limited 140 URL encoded characters.
				Some users may be absent from search results.
				The since_id parameter will be removed from the next_page element as it is not supported for pagination. If since_id is removed a warning will be added to alert you.
				This method will return an HTTP 404 error if since_id is used and is too old to be in the search index.
				
			Applications must have a meaningful and unique User Agent when using this method. 
			An HTTP Referrer is expected but not required. Search traffic that does not include a User Agent will be rate limited to fewer API calls per hour than 
			applications including a User Agent string. You can set your custom UA headers by passing it as a respective argument to the setup() method.
		*/
		return this.makeRequest({
			type: "SEARCH",
			url: this.constructApiURL("/search.json", paramsObj),
			callback: callbackfn
		});
	},

	getCurrentTrends: function(paramsObj, callbackfn) {
		/*	getCurrentTrends(paramsObj, callbackfn)

			Returns the current top 10 trending topics on Twitter.  The response includes the time of the request, the name of each trending topic, and the query used 
			on Twitter Search results page for that topic.

			Parameters:
				exclude - Optional. Setting this equal to hashtags will remove all hashtags from the trends list.
		*/
		var apiURL = "/trends/current.json";
		if(paramsObj.exclude) apiURL += "?exclude=" + paramsObj.exclude;
		return this.makeRequest({
			type: "GET",
			url: apiURL,
			callback: callbackfn
		});
	},

	getDailyTrends: function(paramsObj, callbackfn) {
		/*	getDailyTrends(paramsObj, callbackfn)

			Returns the top 20 trending topics for each hour in a given day.

			Parameters:
				date - Optional. Permits specifying a start date for the report. The date should be formatted YYYY-MM-DD.
				exclude - Optional. Setting this equal to hashtags will remove all hashtags from the trends list.
		*/
		var apiURL = "/trends/daily.json?lol=1";
		if(paramsObj.date) apiURL += "&date=" + paramsObj.date;
		if(paramsObj.exclude) apiURL += "&exclude=" + paramsObj.exclude;
		
		return this.makeRequest({
			type: "GET",
			url: apiURL,
			callback: callbackfn
		});
	},

	getWeeklyTrends: function(paramsObj, callbackfn) {
		/*	getWeeklyTrends(paramsObj, callbackfn)

			Returns the top 30 trending topics for each day in a given week.

			Parameters:
				date - Optional. Permits specifying a start date for the report. The date should be formatted YYYY-MM-DD.
				exclude - Optional. Setting this equal to hashtags will remove all hashtags from the trends list.
		*/
		var apiURL = "/trends/daily.json"
		if(paramsObj.date) apiURL += "?date=" + paramsObj.date;
		if(paramsObj.exclude) apiURL += "&exclude=" + paramsObj.exclude;
		
		return this.makeRequest({
			type: "GET",
			url: apiURL,
			callback: callbackfn
		});
	},

	getSavedSearches: function(callbackfn) {
		/*	getSavedSearches(callbackfn)

			Returns the authenticated user's saved search queries.

			Parameters:
				None
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: "/saved_searches.json",
				callback: callbackfn
			});
		} else {
			return sys.puts("getSavedSearches() requires you to be authenticated.")
		}
	},
	
	showSavedSearch: function(paramsObj, callbackfn) {
		/*	showSavedSearch(id)

			Retrieve the data for a saved search owned by the authenticating user specified by the given id.

			Parameters:
				id - Required. The id of the saved search to be retrieved.
		*/
		if(!paramsObj.id) return sys.puts("You need to pass an id to showSavedSearch()");

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: "/saved_searches/show/" + paramsObj.id + ".json",
				callback: callbackfn
			});
		} else {
			return sys.puts("showSavedSearch() requires you to be authenticated.")
		}
	},

	createSavedSearch: function(paramsObj, callbackfn) {
		/*	createSavedSearch(paramsObj, callbackfn)

			Creates a saved search for the authenticated user.

			Parameters:
				query - Required. The query of the search the user would like to save.
		*/
		if(!paramsObj.query) return sys.puts("You need to pass a query to save, dude.");
		
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/saved_searches/create.json?query=" + paramsObj.query,
				callback: callbackfn
			});
		} else {
			return sys.puts("createSavedSearch() requires you to be authenticated.")
		}
	},

	destroySavedSearch: function(paramsObj, callbackfn) {
		/*	destroySavedSearch(paramsObj, callbackfn)

			Destroys a saved search for the authenticated user.
			The search specified by id must be owned by the authenticating user.

			Parameters:
				id - Required. The id of the saved search to be deleted.
		*/
		if(!paramsObj.id) return sys.puts("You need to pass an ID to destroySavedSearch()");
		
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/saved_searches/destroy/" + paramsObj.id + ".json",
				callback: callbackfn
			});
		} else {
			return sys.puts("destroySavedSearch() requires you to be authenticated.")
		}
	},

	createList: function(paramsObj, callbackfn) {
		/*	createList: function(name, mode, description, version)
			
			Creates a new list for the currently authenticated user. (Note: This may encounter issues if you authenticate with an email; try username (screen name) instead).

			Parameters:
				name - Required. The name for the new list.
				description - Optional, in the sense that you can leave it blank if you don't want one. ;)
				mode - Optional. This is a string indicating "public" or "private", defaults to "public".
		*/
		if(!paramsObj.name) return sys.puts("You must specify a name for the new List.");

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/" + this.username + "/lists.json?name=" + paramsObj.name + "&mode=" + (paramsObj.mode ? paramsObj.mode : "public") + 
					"&description=" + (paramsObj.description ? paramsObj.description : ""),
				callback: callbackfn
			});
		} else {
			return sys.puts("createList() requires you to be authenticated.")
		}
	},

	updateList: function(paramsObj, callbackfn) {
		/*	updateList: function(paramsObj, callbackfn)
			
			Updates an existing list for the authenticating user. (Note: This may encounter issues if you authenticate with an email; try username (screen name) instead).
			This method is a bit cumbersome for the time being; I'd personally avoid using it unless you're positive you know what you're doing. Twitter should really look
			at this...

			Parameters:
				list_id - Required. The name of the list (this gets turned into a slug - e.g, "Huck Hound" becomes "huck-hound").
				name - Required. The name of the list, possibly for renaming or such.
				description - Optional, in the sense that you can leave it blank if you don't want one. ;)
				mode - Optional. This is a string indicating "public" or "private", defaults to "public".
		*/
		if(!paramsObj.list_id || !paramsObj.name) return sys.puts("You need to specify both a name and a list_id for updateList()");
		
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/" + this.username + "/lists/" + paramsObj.list_id + ".json?name=" + paramsObj.name + "&mode=" + (paramsObj.mode ? paramsObj.mode : "public") +
					"&description=" + (paramsObj.description ? paramsObj.description : ""),
				callback: callbackfn
			});
		} else {
			return sys.puts("updateList() requires you to be authenticated.")
		}
	},

	showLists: function(callbackfn) {
		/*	showLists: function(callbackfn)

			Show all the lists for the currently authenticated user (i.e, they own these lists).
			(Note: This may encounter issues if you authenticate with an email; try username (screen name) instead).

			Parameters:
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: "/" + this.username + "/lists.json",
				callback: callbackfn
			});
		} else {
			return sys.puts("showLists() requires you to be authenticated.")
		}
	},

	getListMemberships: function(callbackfn) {
		/*	getListMemberships: function(callbackfn)

			Get all the lists for the currently authenticated user (i.e, they're on all the lists that are returned, the lists belong to other people)
			(Note: This may encounter issues if you authenticate with an email; try username (screen name) instead).

			Parameters:
				None
		*/
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "GET",
				url: "/" + this.username + "/lists/followers.json",
				callback: callbackfn
			});
		} else {
			return sys.puts("getLists() requires you to be authenticated.")
		}
	},

	deleteList: function(paramsObj, callbackfn) {
		/*	deleteList: function(paramsObj, callbackfn)

			Deletes a list for the authenticating user. 

			Parameters:
				list_id - Required. The name of the list to delete - this gets turned into a slug, so you can pass it as that, or hope the transformation works out alright.
		*/
		if(!paramsObj.list_id) return sys.puts("You need to provide a list_id to deleteList()");
		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/" + this.username + "/lists/" + paramsObj.list_id + ".json?_method=DELETE",
				callback: callbackfn
			});
		} else {
			return sys.puts("deleteList() requires you to be authenticated.")
		}
	},

	getListTimeline: function(paramsObj, callbackfn) {
		/*	getListTimeline: function(paramsObj, callbackfn)

			Retrieves a timeline representing everyone in the list specified.

			Parameters:
				list_id - Required. The name of the list to get a timeline for - this gets turned into a slug, so you can pass it as that, or hope the transformation works out alright.
				since_id - Optional.  Returns only statuses with an ID greater than (that is, more recent than) the specified ID.
				max_id - Optional.  Returns only statuses with an ID less than (that is, older than) or equal to the specified ID. 
				count - Optional.  Specifies the number of statuses to retrieve. May not be greater than 200.
				cursor - Optional. Breaks the results into pages. Provide a value of -1 to begin paging. 
					Provide values returned in the response's "next_cursor" and "previous_cursor" attributes to page back and forth in the list.
		*/
		if(!paramsObj.list_id) return sys.puts("You need to provide a list_id to getListTimeline()");
		if(!paramsObj.cursor) paramsObj.cursor = "-1";
		
		return makeRequest({
			type: "GET",
			url: this.constructApiURL("/" + this.username + "/lists/" + paramsObj.list_id + "/statuses.json", paramsObj),
			callback: callbackfn
		});
	},

	getSpecificList: function(paramsObj, callbackfn) {
		/*	getSpecificList: function(paramsObj, callbackfn)

			Retrieve a specific list - this only requires authentication if the list you're requesting is protected/private (if it is, you need to have access as well).

			Parameters:
				list_id - Required. The name of the list to get - this gets turned into a slug, so you can pass it as that, or hope the transformation works out alright.
		*/
		if(!paramsObj.list_id) sys.puts("You need to pass an explicity list_id to getSpecificList()");
		return this.makeRequest({
			type: "GET",
			url: "/" + this.username + "/lists/" + paramsObj.list_id + "/statuses.json",
			callback: callbackfn
		});
	},

	addListMember: function(paramsObj, callbackfn) {
		/* addListMember: function(paramsObj, callbackfn)

			Adds a new Member (the passed in id) to the specified list.

			Parameters:
				list_id - Required. The slug of the list to add the new member to.
				id - Required. The ID of the user that's being added to the list.
		*/
		if(!paramsObj.list_id || !paramsObj.id) return sys.puts("You need to pass an id and list_id to addListMember()");

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/" + this.username + "/" + paramsObj.list_id + "/members.json?id=" + paramsObj.id,
				callback: callbackfn
			});
		} else {
			return sys.puts("addListMember requires you to be authenticated.")
		}
	},

	getListMembers: function(paramsObj, callbackfn) {
		/* getListMembers: function(paramsObj, callbackfn)
	
			Show all members of a specified list. This method requires authentication if the list is private/protected.
	
			Parameters:
				list_id - Required. The slug of the list to retrieve members for.
		*/
		if(!paramsObj.list_id) return sys.puts("You need to pass a list_id to getListMembers()");
		return this.makeRequest({
			type: "GET",
			url: "/" + this.username + "/" + paramsObj.list_id + "/members.json",
			callback: callbackfn
		});
	},
	
	removeListMember: function(paramsObj, callbackfn) {
		/*	removeListMember: function(paramsObj, callbackfn)

			Remove the specified user (id) from the specified list (list_id). Requires you to be authenticated and in control of the list in question.

			Parameters:
				list_id - Required. The slug of the list to remove the specified user from.
				id - Required. The ID of the user that's being added to the list.
		*/
		if(!paramsObj.list_id || !paramsObj.id) return sys.puts("You need to pass both a list_id and an id of a user to removeListMember()");

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/" + this.username + "/" + paramsObj.list_id + "/members.json?id=" + paramsObj.id + "&_method=DELETE",
				callback: callbackfn
			});
		} else {
			return sys.puts("removeListMember() requires you to be authenticated.")
		}
	},

	isListMember: function(paramsObj, callbackfn) {
		/*	isListMember: function(paramsObj, callbackfn)

			Check if a specified user (id) is a member of the list in question (list_id).

			**Note: This method may not work for private/protected lists, unless you're authenticated and have access to those lists.

			Parameters:
				list_id - Required. The slug of the list to check against.
				id - Required. The ID of the user being checked in the list.
		*/
		if(!paramsObj.list_id || !paramsObj.id) return sys.puts("You must pass both a list_id and an id to isListMember()");
		return this.makeRequest({
			type: "GET",
			url: "/" + this.username + "/" + paramsObj.list_id + "/members/" + paramsObj.id + ".json",
			callback: callbackfn
		});
	},

	subscribeToList: function(paramsObj, callbackfn) {
		/*	subscribeToList: function(paramsObj, callbackfn)

			Subscribe the authenticated user to the list provided (must be public).

			Parameters:
				list_id - Required. The list to subscribe to.
		*/
		if(!paramsObj.list_id) return sys.puts("You must pass a list_id to subscribeToList()");

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/" + this.username + "/" + paramsObj.list_id + "/following.json",
				callback: callbackfn
			});
		} else {
			return sys.puts("subscribeToList() requires you to be authenticated.")
		}
	},

	unsubscribeFromList: function(paramsObj, callbackfn) {
		/*	unsubscribeFromList: function(paramsObj, callbackfn)

			Unsubscribe the authenticated user from the list in question (must be public).

			Parameters:
				list_id - Required. The list to unsubscribe from.
		*/
		if(!paramsObj.list_id) return sys.puts("You must pass a list_id to unsubscribeFromList()");

		if(this.authenticated === true) {
			return this.makeRequest({
				type: "POST",
				url: "/" + this.username + "/" + paramsObj.list_id + "/following.json?_method=DELETE",
				callback: callbackfn
			});
		} else {
			return sys.puts("unsubscribeFromList() requires you to be authenticated.")
		}
	},

	isListSubscriber: function(paramsObj, callbackfn) {
		/*	isListSubscriber: function(list_id, id, version)

			Check if a specified user (id) is a subscriber of the list in question (list_id).

			**Note: This method may not work for private/protected lists, unless you're authenticated and have access to those lists.

			Parameters:
				list_id - Required. The slug of the list to check against.
				id - Required. The ID of the user being checked in the list.
		*/
		if(!paramsObj.list_id || !paramsObj.id) return sys.puts("You need to pass both a list_id and an id to isListSubscriber()");
		return this.makeRequest({
			type: "GET",
			url: "/" + this.username + "/" + paramsObj.list_id + "/following/" + paramsObj.id + ".json",
			callback: callbackfn
		});
	},

	availableTrends: function(paramsObj, callbackfn) {
		/*	availableTrends(paramsObj, callbackfn)

			Gets all available trends, optionally filtering by geolocation based stuff.

			Note: If you choose to pass a latitude/longitude, keep in mind that you have to pass both - one won't work by itself. ;P

			Parameters:
				latitude (string) - Optional. A latitude to sort by.
				longitude (string) - Optional. A longitude to sort by.
		*/
		var apiURL = "/trends/available.json";
		if(!paramsObj.latitude || !paramsObj.longitude) apiURL = "/trends/available.json?latitude=" + paramsObj.latitude + "&longitude=" + paramsObj.longitude;

		return this.makeRequest({
			type: "GET",
			url: apiURL,
			callback: callbackfn
		});
	},

	trendsByLocation: function(paramsObj, callbackfn) {
		/* trendsByLocation(woeid, version)

			Gets all available trends, filtering by geolocation (woeid - see http://developer.yahoo.com/geo/geoplanet/guide/concepts.html).

			Note: If you choose to pass a latitude/longitude, keep in mind that you have to pass both - one won't work by itself. ;P

			Parameters:
				woeid (string) - Required. WoeID of the area you're searching in.
		*/
		if(!paramsObj.woeid) return sys.puts("You need to pass a woeid to trendsByLocation()");
		return this.makeRequest({
			type: "GET",
			url: "/trends/" + paramsObj.woeid + ".json",
			callback: callbackfn
		});
	},	
	
	/*
	
	################################################################
		UNPORTED PYTHON CODE AHOY
		It's 3AM, I'm not dealing with this right now. ;P
	
		- Ryan
	################################################################

	updateProfileBackgroundImage: function(filename, tile="true") {
		/* updateProfileBackgroundImage(filename, tile="true")

			Updates the authenticating user's profile background image.

			Parameters:
				image - Required. Must be a valid GIF, JPG, or PNG image of less than 800 kilobytes in size. Images with width larger than 2048 pixels will be forceably scaled down.
				tile - Optional (defaults to true). If set to true the background image will be displayed tiled. The image will not be tiled otherwise. 
				** Note: It's sad, but when using this method, pass the tile value as a string, e.g tile="false"
		
		if(this.authenticated === true) {
				files = [("image", filename, open(filename, 'rb').read())]
				fields = []
				content_type, body = self.encode_multipart_formdata(fields, files)
				headers = {'Content-Type': content_type, 'Content-Length': str(len(body))}
				r = urllib2.Request("http://api.twitter.com/%d/account/update_profile_background_image.json?tile=%s" % (version, tile), body, headers)
				return self.opener.open(r).read()
		} else {
			return sys.puts("You realize you need to be authenticated to change a background image, right?")
		}
	},

	updateProfileImage: function(paramsObj, callbackfn) {
		/* updateProfileImage(filename)

			Updates the authenticating user's profile image (avatar).

			Parameters:
				image - Required. Must be a valid GIF, JPG, or PNG image of less than 700 kilobytes in size. Images with width larger than 500 pixels will be scaled down.
				version (number) - Optional. API version to request. Entire Twython class defaults to 1, but you can override on a function-by-function or class basis - (version=2), etc.
		
		if(this.authenticated === true) {
				files = [("image", filename, open(filename, 'rb').read())]
				fields = []
				content_type, body = self.encode_multipart_formdata(fields, files)
				headers = {'Content-Type': content_type, 'Content-Length': str(len(body))}
				r = urllib2.Request("http://api.twitter.com/%d/account/update_profile_image.json" % version, body, headers)
				return self.opener.open(r).read()
		} else {
			return sys.puts("You realize you need to be authenticated to change a profile image, right?")
		}
	} */
}
