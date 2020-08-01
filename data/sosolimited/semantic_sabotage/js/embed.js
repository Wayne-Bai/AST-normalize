google.load("swfobject", "2.1");
/*
 * Chromeless player has no controls.
 */


// Object with official youTube states. 
var ytStates = {'unstarted':-1, 'ended':0, 'playing':1, 'paused':2, 'buffering':3, 'videocued':5};
var ytCurState = -2;
var startCall = false;

// Update a particular HTML element with a new value
function updateHTML(elmId, value) {
  document.getElementById(elmId).innerHTML = value;
}

// This function is called when an error is thrown by the player
function onPlayerError(errorCode) {
  console.log("An error occured of type: " + errorCode);
}

// This function is called when the player changes state
// We have to trigger our message playback based on these state changes,
// since there are always slight buffering delays when changing yT state.
function onPlayerStateChange(newState) {
  
  handleYtPlayerStateChange(newState);
  
}

    
// Display information about the current state of the player
function updatePlayerInfo() {
  // Also check that at least one function exists since when IE unloads the
  // page, it will destroy the SWF before clearing the interval.
  if(ytplayer && ytplayer.getDuration) {
    /*
    updateHTML("videoDuration", ytplayer.getDuration());
    updateHTML("videoCurrentTime", ytplayer.getCurrentTime());
    updateHTML("bytesTotal", ytplayer.getVideoBytesTotal());
    updateHTML("startBytes", ytplayer.getVideoStartBytes());
    updateHTML("bytesLoaded", ytplayer.getVideoBytesLoaded());
    */
  }
}

function playVideo() {
  if (ytplayer) {
    ytplayer.playVideo();
    $('#pauseButton').show();
    $('#playButton').hide();
  } else startCall = true;
}

function pauseVideo() {
  if (ytplayer) {
    ytplayer.pauseVideo();
    $('#playButton').show();
    $('#pauseButton').hide();
  }
}

function muteVideo() {
  if(ytplayer) {
    ytplayer.mute();
    $('#unmuteButton').show(); 
    $('#muteButton').hide(); 
  }
}

function unMuteVideo() {
  if(ytplayer) {
    ytplayer.unMute();
    $('#muteButton').show();
    $('#unmuteButton').hide(); 
  }
}


// This function is automatically called by the player once it loads
function onYouTubePlayerReady(playerId) {
  console.log("ytplayer READY");
  ytplayer = document.getElementById("ytplayer");
  // This causes the updatePlayerInfo function to be called every 250ms to
  // get fresh data from the player
  setInterval(updatePlayerInfo, 250);
  updatePlayerInfo();
  ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
  ytplayer.addEventListener("onError", "onPlayerError");
  ytplayer.height= 0;
  ytplayer.width= 0;
  ytPlayerLoaded = true;
  if (startCall) playVideo();
}

// The "main method" of this sample. Called when someone clicks "Run".
function loadPlayer() {
  //console.log("LOAD PLAYER");
  // Lets Flash from another domain call JavaScript
  var params = { allowScriptAccess: "always" };
  // The element id of the Flash embed
  var atts = { id: "ytplayer" };
  // All of the magic handled by SWFObject (http://code.google.com/p/swfobject/)
  
  swfobject.embedSWF("http://www.youtube.com/apiplayer?" +
                     "version=3&enablejsapi=1&playerapiid=ytplayer", 
                     "videoDiv", "480", "295", "9", null, null, params, atts);
                     //   "videoDiv", "0", "0", "9", null, null, params, atts);
}
function _run() {
  loadPlayer();
}
google.setOnLoadCallback(_run);