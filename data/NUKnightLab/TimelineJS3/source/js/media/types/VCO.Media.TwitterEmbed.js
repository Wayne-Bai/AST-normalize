/*	VCO.Media.TwitterEmbed
	Produces Twitter Display
================================================== */

VCO.Media.TwitterEmbed = VCO.Media.extend({
	
	includes: [VCO.Events],
	
	/*	Load the media
	================================================== */
	_loadMedia: function() {
		var api_url,
			self = this;
			
		// Loading Message
		this.loadingMessage();
		
		// Create Dom element
		this._el.content_item = VCO.Dom.create("div", "vco-media-twitter", this._el.content);
		this._el.content_container.className = "vco-media-content-container vco-media-content-container-text";
		
		// Get Media ID
		if (this.data.url.match("status\/")) {
			this.media_id = this.data.url.split("status\/")[1];
		} else if (url.match("statuses\/")) {
			this.media_id = this.data.url.split("statuses\/")[1];
		} else {
			this.media_id = "";
		}

		if (this.media_id.match(/\"">(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Oct|Nov|Dec)/)){
			this.media_id = this.media_id.split(/\"">(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Oct|Nov|Dec)/)[0];
		}
		
		// API URL
		api_url = "https://api.twitter.com/1/statuses/oembed.json?id=" + this.media_id + "&omit_script=true&include_entities=true&callback=?";
		
		// API Call
		VCO.ajax({
			type: 'GET',
			url: api_url,
			dataType: 'json', //json data type
			success: function(d){
				self.createMedia(d);
			},
			error:function(xhr, type){
				var error_text = "";
				error_text += "Unable to load Tweet. <br/>" + self.media_id + "<br/>" + type;
				self.loadErrorDisplay(error_text);
			}
		});
		 
	},
	
	createMedia: function(d) {	
		trace("create_media")	
		var tweet				= "",
			tweet_text			= "",
			tweetuser			= "",
			tweet_status_temp 	= "",
			tweet_status_url 	= "",
			tweet_status_date 	= "";
			
		//	TWEET CONTENT
		tweet_text 			= d.html.split("<\/p>\&mdash;")[0] + "</p></blockquote>";
		tweetuser			= d.author_url.split("twitter.com\/")[1];
		tweet_status_temp 	= d.html.split("<\/p>\&mdash;")[1].split("<a href=\"")[1];
		tweet_status_url 	= tweet_status_temp.split("\"\>")[0];
		tweet_status_date 	= tweet_status_temp.split("\"\>")[1].split("<\/a>")[0];
		
		// Open links in new window
		tweet_text = tweet_text.replace(/<a href/ig, '<a target="_blank" href');

		// 	TWEET CONTENT
		tweet += tweet_text;
		
		//	TWEET AUTHOR
		tweet += "<div class='vcard'>";
		tweet += "<a href='" + tweet_status_url + "' class='twitter-date' target='_blank'>" + tweet_status_date + "</a>";
		tweet += "<div class='author'>";
		tweet += "<a class='screen-name url' href='" + d.author_url + "' target='_blank'>";
		tweet += "<span class='avatar'></span>";
		tweet += "<span class='fn'>" + d.author_name + " <span class='vco-icon-twitter'></span></span>";
		tweet += "<span class='nickname'>@" + tweetuser + "<span class='thumbnail-inline'></span></span>";
		tweet += "</a>";
		tweet += "</div>";
		tweet += "</div>";
		
		
		// Add to DOM
		this._el.content_item.innerHTML	= tweet;
		
		// After Loaded
		this.onLoaded();
			
	},
	
	updateMediaDisplay: function() {
		
	},
	
	_updateMediaDisplay: function() {
		
	}
	
	
	
});
