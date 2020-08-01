var VIDEO_INFO_LINK = "http://gdata.youtube.com/feeds/api/videos/"; 
var RELATED_LINK = "http://gdata.youtube.com/feeds/api/videos/";
var VERSION_FORMAT = "alt=json&format=5&v=2&key=AI39si4kMMM_MKoBruLHD17_U6_NqOf-qFOc5iqpzpH-G67oD3iCtuVv8F51GKJiD3I3bIuCy5Eo4-Pjf1rwMoNmfc6MUS4aOw";
var TOTAL_RELATED = 9;

//http://gdata.youtube.com/feeds/api/videos/rrbnbDDTh4Q?alt=json&v=2
//http://gdata.youtube.com/feeds/api/videos/rrbnbDDTh4Q/related?alt=json&max-results=3&v=2

function youtube_videos()
{
}

youtube_videos.prototype.get_related_videos = function(video_id, call_back)
{
	var url = RELATED_LINK + video_id + "/" + "related?max-results=9&" + VERSION_FORMAT;

	$.get(url, function(data) 
	{
		// convert output to actualy json
		var json_data;
		try{json_data = JSON.parse(data);}
		catch(err){ json_data = data;}
		
		call_back(json_data["feed"]["entry"]);
	});	
};

youtube_videos.prototype.set_related_videos = function(entries)
{
	var related_video, thumbnail, information;
	
	for (var i=0; i<entries.length; i++)
	{
		related_video = $("#related_video_block_" + (i+1));
		thumbnail = related_video.children(".thumbnail");
		information = related_video.children(".information");

		related_video.attr("video_data", JSON.stringify(entries[i]));
		
		thumbnail.children("img").attr("src",entries[i]["media$group"]["media$thumbnail"][0]["url"]);
		thumbnail.children(".video_time").html(secondsToHms(entries[i]["media$group"]["yt$duration"]["seconds"]));

		youtube_videos.prototype.set_rating(entries[i], information.children(".progress_bar"));
		information.children(".title").html(entries[i]["title"]["$t"]);
		information.children(".view_count").html(add_commas(entries[i]["yt$statistics"]["viewCount"]) + " views");
	}
};

youtube_videos.prototype.set_rating = function(entry, selector)
{
	var likes = 0;
	var dislikes = 0;
	
	try
	{
		rating = Math.round(parseFloat(entry["yt$rating"]["numLikes"]) * 100 / 
			(parseFloat(entry["yt$rating"]["numLikes"]) + parseFloat(entry["yt$rating"]["numDislikes"])) );

		likes = entry["yt$rating"]["numLikes"];
		dislikes = entry["yt$rating"]["numDislikes"];
		
		// rating info is avaiable, display it
		selector.css("background","red");
		selector.progressbar({value : rating});
	}
	catch (err)
	{
		// no rating info is available - set the bar to all white/blank
		selector.css("background","white");
		selector.progressbar({value : 0});
		
		console.log(entry);
	}	
	
	selector.siblings(".likes_text").html(add_commas(likes) + " likes, " + add_commas(dislikes) + " dislikes");
};

youtube_videos.prototype.play_video_by_id = function(video_id) 
{
	var url = VIDEO_INFO_LINK + video_id + "?" + VERSION_FORMAT;
	var self = this;
	
	$.get(url, function(data) 
	{
		// convert output to actualy json
		var json_data;
		try{json_data = JSON.parse(data);}
		catch(err){ json_data = data;}

		// get a single entry which is the info of the video
		var entry = json_data["entry"];
		self.play_video_by_entry(entry);
	});	
};

youtube_videos.prototype.play_video_by_entry = function(entry) 
{
	var self = this;
	
	swfobject.embedSWF(
			entry["media$group"]["media$content"][0]["url"]
			+ '&rel=1&border=0&fs=1&autoplay=1' 
			, 'player', '640', '390', '9.0.0', 
			false, false, {allowfullscreen: 'true',wmode:'transparent'});
	$(".play_video_title").html(entry["title"]["$t"]);
	$(".play_video_description").html(entry["media$group"]["media$description"]["$t"]);
	$(".play_video_views").html(add_commas(entry["yt$statistics"]["viewCount"]));
	self.set_rating(entry, $(".play_video_likes"));
};
