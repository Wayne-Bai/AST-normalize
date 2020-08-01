$('a').click(function(event) {
    event.preventDefault();
});

var camListObj = {};

var connect = function() {
    easyrtc.enableAudio(false);
    easyrtc.enableVideo(false);
    easyrtc.setUsername("monitor");
    easyrtc.setPeerListener(peerListener);
    easyrtc.setRoomOccupantListener(roomOccupantListener);
    easyrtc.connect("easysec", loginSuccess, loginFailure);
};

// Run at connection if there is a connection or authorization failure.
var loginFailure = function(errorCode, message) {
    easyrtc.showError(errorCode, message);
};

// Run at connection after successful authorization with EasyRTC server
var loginSuccess = function(easyrtcid) {
    $("#iam").html("I am " + easyrtc.cleanId(easyrtcid));

    easyrtc.setStreamAcceptor(streamAcceptor);
};

// When a stream arrives, this gets run.
var streamAcceptor = function(peerEasyrtcid, stream) {
    console.debug("Getting stream from " + peerEasyrtcid);
    var monitorVideo = document.getElementById("video_" + peerEasyrtcid);
    easyrtc.setVideoObjectSrc(monitorVideo, stream);
    $("#snapshot_" + peerEasyrtcid).hide();
    $("#video_" + peerEasyrtcid).show();
};

// This listener gets called whenever a message is received from a peer.
var peerListener = function(senderEasyrtcid, msgType, msgData, target) {
    switch(msgType) {
        case "snapshot":
            console.log("["+senderEasyrtcid+"] Receiving snapshot", msgData);
            $("#snapshot_" + senderEasyrtcid).attr("src", msgData);
            if( ! camListObj[senderEasyrtcid].isLive ) {
                $("#snapshot_" + senderEasyrtcid).show();
                $("#video_" + senderEasyrtcid).hide();
            }
            break;
        case "motionState":
            $("#monitor_" + senderEasyrtcid).css("border-color", msgData.motion ? "red" : "#5c5c5c");
            console.log("received motion state " + msgData.motion);
            setTimeout(function() {
                refreshSnapshot(senderEasyrtcid);
            }, 2000);

            break;
        default:
            console.warn("[" + senderEasyrtcid + "] Received unhandled msgType: " + msgType);
    }
    console.log("\nPeer Listener:\nARGUMENTS:", arguments);
};

// This listener gets called when ever there is a change to the details of who is in the room
var roomOccupantListener = function(roomName, peerListObj, myDetails) {
    console.debug("Running roomOccupantListener for room [" + roomName + "] with client list object:", peerListObj);
    console.debug("My details:", myDetails);

    // remove cameras?
    $.each(camListObj, function(peerEasyrtcid, clientObj) {
        if (!peerListObj[peerEasyrtcid]) {
            cameraRemove(peerEasyrtcid);
        }
    });

    // add cameras?
    $.each(peerListObj, function(peerEasyrtcid, clientObj) {
        if (clientObj.username == "cam" && !camListObj[peerEasyrtcid]) {
            // Adding camera after a short delay to ensure camera is done login
            setTimeout(function() {
                cameraAdd(peerEasyrtcid, clientObj);
            }, 500);
        }
    });
};

// Adds the element to hold a camera view, and initiates the call
cameraAdd = function(peerEasyrtcid, clientObj) {
    console.debug("Adding camera view for " + peerEasyrtcid);

    // Clone clientObj into camListObj
    camListObj[peerEasyrtcid] = JSON.parse(JSON.stringify(clientObj));

    // Create HTML element to hold cam video
    var newDiv = "<div class=\"monitor\" id=\"monitor_" + peerEasyrtcid + "\" state=\"pause\">";
    newDiv += "<video class=\"video hidden\" id=\"video_" + peerEasyrtcid + "\"></video>";
    newDiv += "<p>" + peerEasyrtcid + "</p>";
    newDiv += "<img class=\"snapshot\" id=\"snapshot_" + peerEasyrtcid + "\">";
    newDiv += "<div class=\"icon-play hidden\"></div>";
    newDiv += "<div class=\"icon-pause hidden\"></div>";
    newDiv += "</div>";

    // Append new Monitor to Monitors
    $(newDiv).appendTo("#monitors");

    // Initialize Controls for new Monitor
    initNewMonitorControls(peerEasyrtcid);

    refreshSnapshot(peerEasyrtcid);

};

// Removing the element to which holds the camera view. Ensures the connection is disconnected.
cameraRemove = function(peerEasyrtcid) {
    console.debug("Removing camera view for " + peerEasyrtcid);

    easyrtc.hangup(peerEasyrtcid);
    $("#monitor_" + peerEasyrtcid).remove();

    if (camListObj[peerEasyrtcid]) {
        delete camListObj[peerEasyrtcid];
    }
};

var showLive = function(peerEasyrtcid) {
    if (camListObj[peerEasyrtcid] && !camListObj[peerEasyrtcid].isLive) {
        camListObj[peerEasyrtcid].isLive = true;

        easyrtc.call(peerEasyrtcid, function(easyrtcid, mediaType) {
            console.log("Got mediatype " + mediaType + " from " + easyrtc.idToName(easyrtcid));
        }, function(errorCode, errMessage) {
            console.log("call to  " + easyrtc.idToName(peerEasyrtcid) + " failed:" + errMessage);
        }, function(wasAccepted, easyrtcid) {
            if (wasAccepted) {
                console.log("call accepted by " + easyrtc.idToName(easyrtcid));
            } else {
                console.log("call rejected" + easyrtc.idToName(easyrtcid));
            }
        });
    }
};

var refreshSnapshot = function(peerEasyrtcid) {
    easyrtc.sendData(peerEasyrtcid, "getSnapshot", true, function() {});
};

var showSnapshot = function(peerEasyrtcid) {
    // Request new snapshot
    refreshSnapshot(peerEasyrtcid);

    // In case connection is gone
    if (!camListObj[peerEasyrtcid]) {
        return;
    }

    // If camera is live, than disconnect.
    if (camListObj[peerEasyrtcid].isLive) {
        easyrtc.hangup(peerEasyrtcid);
    }

    camListObj[peerEasyrtcid].isLive = false;

    if (camListObj[peerEasyrtcid].snapshot) {
        $("#video_" + peerEasyrtcid).hide();
        $("#snapshot_" + peerEasyrtcid).show();
    }
};



