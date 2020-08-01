/**
 * contentscripts.js
 * Parses player page and transmit song information to background page
 * @author Alexey Savartsov <asavartsov@gmail.com>
 * @author Brad Lambeth <brad@lambeth.us>
 * @author Jared Sartin <jared@level2studios.com>
 * Licensed under the MIT license
 */

/**
 * Player class
 *
 * Google Music Beta page parser
 */
function Player(parser) {
    this.has_song = parser._get_has_song();
    this.is_playing = parser._get_is_playing();
    this.shuffle = parser._get_shuffle();
    this.repeat_mode = parser._get_repeat_mode();
    this.playlists = parser._get_playlists();
    this.ratingMode = parser._get_ratingMode();
    var position_string = parser._get_song_position_string();
    var time_string = parser._get_song_time_string();
    this.song = {
        position: getSeconds(position_string),
        position_string: position_string,
        time: getSeconds(time_string),
        time_string: time_string,
        title: parser._get_song_title(),
        artist: parser._get_song_artist(),
        album: parser._get_song_album(),
        cover: parser._get_song_cover(),
        thumbsup: parser._get_is_thumbs_up(),
        thumbsdown: parser._get_is_thumbs_down(),
        stars: parser._get_stars()
    };
}

/**
 * Calculates how many seconds a time string represents.
 */
function getSeconds(time) {
    if (time === "") return 0;
    time = time.split(':');
    var sec = 0;
    var factor = 1;
    for (i = time.length - 1; i >= 0; i--) {
        sec += parseInt(time[i], 10) * factor;
        factor *= 60;
    }
    return sec;
}

/**
 * Constructor for parser class
 * Executes scripts to fetch now playing info from cloudplayer
 * @returns {GoogleMusicParser}
 */
GoogleMusicParser = function() {

};

/**
 * Check whether a song loaded into player widget
 *
 * @return true if some song is loaded, otherwise false
 */
GoogleMusicParser.prototype._get_has_song = function() {
    return $("#playerSongInfo div").hasClass("now-playing-menu-wrapper");
};

/**
 * Checks whether song is playing or paused
 *
 * @return true if song is playing, false if song is paused
 */
GoogleMusicParser.prototype._get_is_playing = function() {
    return ($("#player button[data-id='play-pause']").attr('title') == "Pause");
};

/**
 * Checks whether random play is on or not
 *
 * @return true if shuffle, false if not shuffle
 */
GoogleMusicParser.prototype._get_shuffle = function() {
    return $("#player button[data-id='shuffle']").attr("value");
};

/**
 * Checks whether song is playing or paused
 *
 * @return true if song is playing, false if song is paused
 */
GoogleMusicParser.prototype._get_repeat_mode = function() {
    return $("#player button[data-id='repeat']").attr("value");
};

/**
 * Parses playlists
 *
 * @return array of playlists
 */
GoogleMusicParser.prototype._get_playlists = function() {
    var playlists = [];
    var playlist = [];
    // $('#auto-playlists li').each(function(){
    //     playlist = [$(this).attr("id"), $(this).text()];
    //     playlists.push(playlist);
    // });
    $('#playlists li').each(function(){
        playlist = [$(this).attr("id"), $(this).text()];
        playlists.push(playlist);
    });
    return playlists;
};

GoogleMusicParser.prototype._get_song_position_string = function() {
    return $.trim($("#time_container_current").text());
};

GoogleMusicParser.prototype._get_song_time_string = function() {
    return $.trim($("#time_container_duration").text());
};

/**
 * Get current song title
 *
 * @return Song title
 */
GoogleMusicParser.prototype._get_song_title = function() {
    // the text inside the div located inside element with id="playerSongTitle"
    return $("#playerSongTitle").text();
};

/**
 * Get current song artist
 *
 * @return Song artist
 */
GoogleMusicParser.prototype._get_song_artist = function() {
    return $(".player-artist").text();
};

/**
 * Get current song artwork
 *
 * @return Image URL or default artwork
 */
GoogleMusicParser.prototype._get_song_cover = function() {
    return ("https:" + $("#playingAlbumArt").attr("src"));
};

/**
 * Get current song album name
 *
 * @return Album name or null
 */
GoogleMusicParser.prototype._get_song_album = function() {
    return $(".player-album").text();
};

/**
 * Get current song thumbs up
 *
 * @return True if song has thumbs up, false if not
 */
GoogleMusicParser.prototype._get_is_thumbs_up = function() {
    return $("#player-right-wrapper .rating-container [data-rating='5']").hasClass('selected');
};

/**
 * Get current song thumbs down
 *
 * @return True if song has thumbs down, false if not
 */
GoogleMusicParser.prototype._get_is_thumbs_down = function() {
    return $("#player-right-wrapper .rating-container [data-rating='1']").hasClass('selected');
};

GoogleMusicParser.prototype._get_stars = function() {
    var star = $("#player-right-wrapper .rating-container [class='selected']");
    if (star) {
        return parseInt(star.attr('data-rating'),10);
    }
    return 0;
};

GoogleMusicParser.prototype._get_ratingMode = function() {
    var ratingMode;
    if ($("#player-right-wrapper .rating-container").hasClass('thumbs')) {
        ratingMode = "thumbs";
    } else if ($("#player-right-wrapper .rating-container").hasClass('stars')) {
        ratingMode = "5stars";
    }
    return ratingMode;
};

// Non-Parsing functions

var port = chrome.extension.connect({name: "musicbeta"});

//send information "immediately" - populate plugin information
setTimeout("SendMessage()", 200);

//Auto Send Message every .5 seconds
window.setInterval(function() {
    SendMessage();
}, 250);

//Forced send on update (new song starts, mode changes, etc.)
document.getElementById("playerSongInfo").addEventListener("DOMSubtreeModified", function() {
    setTimeout("SendMessage()", 75);
});

$("#player button[data-id='play-pause']").bind("DOMSubtreeModified", function() {
    setTimeout("SendMessage()", 75);
});

$("#player button[data-id='repeat']").bind("DOMSubtreeModified", function() {
    setTimeout("SendMessage()", 75);
});

$("#player button[data-id='repeat']").bind("DOMSubtreeModified", function() {
    setTimeout("SendMessage()", 75);
});

// Injection for ratings
injectScript("function triggerMouseEvent(element, eventname){ var event = document.createEvent('MouseEvents'); event.initMouseEvent(eventname, true, true, document.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, element); element.dispatchEvent(event); }");
$("#player-right-wrapper .rating-container").bind("DOMSubtreeModified", function() {
  setTimeout("SendMessage()", 75);
});
injectScript("function replicateClick(element){ triggerMouseEvent(element, 'click'); }");
injectScript("function rateStars(n){ replicateClick(document.body.querySelector('#player-right-wrapper .rating-container [data-rating=\"'+n+'\"]')); }");

// Function to send the message
function SendMessage(){
    this.player = new Player(new GoogleMusicParser());
    port.postMessage({song: this.player});
}

// Initialize the search bar for minimal CSS
//var obj = document.querySelector("#header .search");
//obj.parentNode.removeChild(obj);
//document.body.appendChild(obj);
