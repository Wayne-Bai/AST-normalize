// !example-vocalocal.js
/*
 * In practice, most of the jQuery serves no purpose but to change visual indicators; there is no real state management here.
 * In a real app, you would want most of this to be handled by something like Backbone or Ember to manage state for real.
 */

// !GEO: Activate the HTML5 Geolocation API
function getLocation() {
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(geoPosition, geoError, {enableHighAccuracy:true, timeout:30000, maximumAge:60000 }
);
	} else {
		geoError();
	}
}

// !GEO: Interpret the Geolocation data from the HTML5 Geolocation API, set the hidden inputs (geoDataHTML), and set the Geolocation Status details (geoStatusHTML)
function geoPosition(position) {
	var geoDataHTML = '';
	var geoStatusHTML = 'waiting';
	if (!window.count) window.count = 0;

	if(position.coords.latitude!=null) {
		geoDataHTML += '<input type="hidden" id="latitude" name="latitude" value="' + position.coords.latitude + '" />';
		geoStatusHTML = '';
		geoStatusHTML += 'located: ('  + position.coords.latitude + ',';
	} else {
		geoDataHTML += '<input type="hidden" id="latitude" name="latitude" value="" />';
		geoStatusHTML = 'Unable to determine location';
		$('#status-geolocation').attr('class', 'alert alert-error');
	}
	if(position.coords.longitude!=null) {
		geoDataHTML += '<input type="hidden" id="longitude" name="longitude" value="' + position.coords.longitude + '" />';
		geoStatusHTML += ' ' + position.coords.longitude + ')';
		$('#status-geolocation').attr('class', 'alert alert-success');
	} else {
		geoDataHTML += '<input type="hidden" id="longitude" name="longitude" value="" />';
		geoStatusHTML = 'Unable to determine location';
		$('#status-geolocation').attr('class', 'alert alert-error');
	}
	if(position.coords.altitude!=null) {	
		geoDataHTML += '<input type="hidden" name="altitude" value="' + position.coords.altitude + '" />';
	} else {
		geoDataHTML += '<input type="hidden" name="altitude" value="" />';
	}
	if(position.coords.accuracy!=null) {	
		geoDataHTML += '<input type="hidden" name="accuracy" value="' + position.coords.accuracy + '" />';
	} else {
		geoDataHTML += '<input type="hidden" name="accuracy" value="" />';
	}
	if(position.coords.altitudeAccuracy!=null) {	
		geoDataHTML += '<input type="hidden" name="altitudeAccuracy" value="' + position.coords.altitudeAccuracy + '" />';
	} else {
		geoDataHTML += '<input type="hidden" name="altitudeAccuracy" value="" />';
	}
	if(position.coords.heading!=null && position.coords.heading!=NaN) {
		geoDataHTML += '<input type="hidden" name="heading" value="' + position.coords.heading + '" />';
	} else {
		geoDataHTML += '<input type="hidden" name="heading" value="" />';
	}
	if(position.coords.speed!=null) {	
		geoDataHTML += '<input type="hidden" name="speed" value="' + position.coords.speed + '" />';
	} else {
		geoDataHTML += '<input type="hidden" name="speed" value="" />';
	}
	$('#geoDataResults').html(geoDataHTML);
	$('#status-geolocation strong').html(geoStatusHTML);
}

// !GEO: Geolocation error handling function.
function geoError() {
    return false;
}

// !RECORDER: Event Handler
function microphone_recorder_events() {

  switch(arguments[0]) {
  
  // !RECORDER: ready -> Set up the Recorder
  case "ready":
  	// Define defaults for the Recorder.
    var width = parseInt(arguments[1]);
    var height = parseInt(arguments[2]);
    Recorder.uploadFormId = "#uploadForm";
    Recorder.uploadFieldName = "upload_file[filename]";
    Recorder.connect("recorderApp", 0);
    Recorder.recorderOriginalWidth = width;
    Recorder.recorderOriginalHeight = height;
    $('#save_button').css({'width': width, 'height': height});
  break;

  // !RECORDER: no_microphone_found -> No Microphone was found by Flash to even ask for permissions
  case "no_microphone_found":
  	// TODO: Some error handling should go here.
    break;

  // !RECORDER: microphone_user_request -> Flash is requesting permission to access the microphone
  case "microphone_user_request":
    Recorder.showPermissionWindow();
    break;

  // !RECORDER: microphone_connected -> Microphone was successfully accessed
  case "microphone_connected":
    var mic = arguments[1]; // The microphone object
    Recorder.defaultSize();
  	$('#button-recorder').attr('class', 'btn btn-large btn-success');
  	$('#button-recorder .icon-white').attr('class', 'icon-music icon-white');
  	$('#button-recorder .icon-off').attr('class', 'icon-music icon-white');
  	$('#button-recorder .action').text('Record');
    break;

  // !RECORDER: microphone_not_connected -> For some reason, the microphone couldn't connect
  case "microphone_not_connected":
    Recorder.defaultSize();
    break;

  // !RECORDER: microphone_activity -> Audio data is successfully being detected by the microphone
  case "microphone_activity":
    var activitylevel = arguments[1];
    break;

  // !RECORDER: recording -> Microphone is currently streaming audio data to the Flash app
  case "recording":
    var name = arguments[1];
    Recorder.hide();
  	$('#button-recorder').attr('class', 'btn btn-large btn-danger');
  	$('#button-recorder .icon-white').attr('class', 'icon-stop icon-white');
  	$('#button-recorder .action').text('Stop');
    break;

  // !RECORDER: recording_stopped -> Recording has stopped.
  case "recording_stopped":
    var name = arguments[1];
    var duration = arguments[2];
    Recorder.show();
  	$('#button-recorder').attr('class', 'btn btn-large btn-success');
  	$('#button-recorder .icon-white').attr('class', 'icon-music icon-white');
  	$('#button-recorder .icon-off').attr('class', 'icon-music icon-white');
  	$('#button-recorder .action').text('Record');
  	$('#button-save .btn').removeAttr('disabled');
  	$('#button-save .btn').attr('class', 'btn btn-large btn-success');
  	$('#button-save .btn .icon-search').attr('class', 'icon-search icon-white');
  	$('#button-save .btn .icon-white').attr('class', 'icon-search icon-white');
    break;

  // !RECORDER: save_pressed -> Detect the "Save" action in Flash
  case "save_pressed":
    Recorder.updateForm();
  	$('#button-save .btn').attr('class', 'btn btn-large btn-info');
  	$('#button-save .btn .icon-search').attr('class', 'icon-spinner icon-white');
  	$('#button-save .btn .icon-spinner').append('<img src="images/spinner.gif">');
  	$('#button-save .btn .action').text('Searching');
  	$('#button-save .btn').attr('disabled', 'disabled');
    break;

  // !RECORDER: saving -> Save action started
  case "saving":
    var name = arguments[1];
    break;

  // !RECORDER: saved -> Response to the file upload
  case "saved":
    // Parse the JSON returned by the POST to '/upload'
    var data = $.parseJSON(arguments[2]);
    
    // If it contains a "saved" parameter, then it was successful
    if(data.saved) {
	  	Recorder.hide();
	  	
		$.ajax({
			type: "POST",
			url: '/speechToText'
		}).done(function( data ) {
		  	var SearchTerm = data.Recognition.NBest[0].ResultText;
		  	$.ajax({
				type: "POST",
				url: '/search',
				data: {
					latitude: $("#latitude").val(),
					longitude: $("#longitude").val(),
					search: SearchTerm
				}
			}).done(function( data ) {
				var SearchResults = data;
				
				
				$('#searchResults').html('');
				$('#searchResults').append('<div class="active-search alert alert-info">You searched for "' + SearchTerm + '" near "' + $("#latitude").val() + ',' + $("#longitude").val() + '"</div>');
				
				$('#button-save .btn').attr('class', 'btn btn-large');
			  	$('#button-save .btn .icon-white').attr('class', 'icon-search');
			  	$('#button-save .btn .icon-search').html('');
			  	$('#button-save .btn .action').text('Search');
			  	$('#button-save .btn').attr('disabled', 'disabled');
			  	
				$.each(SearchResults.venues, function(index, venue) {
					var venueHTML = '<div class="venue"><span class="venue-details"><span class="venue-name">' + venue.name + '</span><span class="venue-address">';
					if(venue.location.address) {
						venueHTML += venue.location.address + ', ';
					}
					if(venue.location.city) {
						venueHTML += venue.location.city + ', ';
					}
					if(venue.location.state) {
						venueHTML += venue.location.state;
					}
					if(venue.location.postalCode) {
						venueHTML += ' ' + venue.location.postalCode;
					}
					if(venue.location.country) {
						venueHTML +=  ', ' + venue.location.country;
					}
						venueHTML += '</span></span><button id="checkin-' + venue.id + '" class="btn btn-large btn-info">Check In Here</button></div>';
					$('#searchResults').append(venueHTML);
				});
			});
		});
    } else {
  		// Error handling should happen here, but it doesn't yet.
    }
    break;

  // !RECORDER: save_failed -> Error indicators if Save fails
  case "save_failed":
    var name = arguments[1];
    var errorMessage = arguments[2];
    break;

  // !RECORDER: save_progress -> Saving starts
  case "save_progress":
    var name = arguments[1]; // Name of the file, if needed
    var bytesLoaded = arguments[2]; // Number of bytes uploaded
    var bytesTotal = arguments[3]; // Total size in bytes of the file
    break;
  }
}

// !RECORDER: Create Recorder Global to receive externalInterfaceCalls from Flash
Recorder = {
  recorder: null,
  recorderOriginalWidth: 0,
  recorderOriginalHeight: 0,
  uploadFormId: null,
  uploadFieldName: null,

  connect: function(name, attempts) {
    if(navigator.appName.indexOf("Microsoft") != -1) {
      Recorder.recorder = window[name];
    } else {
      Recorder.recorder = document[name];
    }

    // If it continues to fail connecting, just stop trying to connect.
    if(attempts >= 40) {
      return;
    }

    // The Flash app needs a little bit of time to load and initialize
    if(Recorder.recorder && Recorder.recorder.init) {
      Recorder.recorderOriginalWidth = Recorder.recorder.width;
      Recorder.recorderOriginalHeight = Recorder.recorder.height;
      
      // Make sure the hidden upload form and jQuery both exist
      if(Recorder.uploadFormId && $) {
        var frm = $(Recorder.uploadFormId); 
        Recorder.recorder.init(frm.attr('action').toString(), Recorder.uploadFieldName, frm.serializeArray());
      }
      return;
    }

    // Start trying to either access the microphone or activate the Flash permissions dialog
    setTimeout(function() {Recorder.connect(name, attempts+1);}, 100);
  },
  
  record: function(name, filename) {
    Recorder.recorder.record(name, filename);
  },

  resize: function(width, height) {
    Recorder.recorder.width = width + "px";
    Recorder.recorder.height = height + "px";
  },

  defaultSize: function(width, height) {
    Recorder.resize(Recorder.recorderOriginalWidth, Recorder.recorderOriginalHeight);
  },

  show: function() {
    Recorder.recorder.show();
  },

  hide: function() {
  	// Make the stage (in this case, a transparent PNG) unable to be clicked
    Recorder.recorder.hide();
  },

  updateForm: function() {
    var frm = $(Recorder.uploadFormId); 
    Recorder.recorder.update(frm.serializeArray());
  },

  showPermissionWindow: function() {
    Recorder.resize(240, 160);
    // Give the resize function time to resize the Flash app before showing the permissions dialog
    setTimeout(function(){Recorder.recorder.permit();}, 1);
  }
}

// !RECORDER: Set up and embed the Flash recorder
$(function() {
	var appWidth = 99;
	var appHeight = 40;
	var flashvars = {'event_handler': 'microphone_recorder_events', 'upload_image': '/images/transparent-big.png'};
	var params = {};
	var attributes = {'id': "recorderApp", 'name':  "recorderApp", 'wmode' : "transparent"};
	swfobject.embedSWF("/flash/recorder.swf", "flashcontent", appWidth, appHeight, "10.1.0", "", flashvars, params, attributes);
});

$(document).ready(function() {
	// !APP: Initialize the Geolocation API
	getLocation();
	
	// !APP: Set up button event handlers
	// Connect or start recording with the Microphone
	$(document).on('click','#button-recorder',function() {
		Recorder.record('audio', '/public/audio/audio.wav');
		return false;
	});
	
	// Redirect the web browser to the Foursquare login page
	$(document).on('click', '#button-connect', function() {
		window.location = 'http://' + window.location.host + '/login';
	});
	
	// Redirect the web browser to the restart URL
	$(document).on('click', '#button-restart', function() {
		window.location = 'http://' + window.location.host + '/restart';
	});
	
	// Check in at the selected venue
	$(document).on('click','.venue .btn',function() {
		var venueToCheckinAt = $(this).attr('id').substr(8);
		$.ajax({
			type: "POST",
			url: '/checkin',
			data: {
				latitude: $("#latitude").val(),
				longitude: $("#longitude").val(),
				checkin: venueToCheckinAt
			}
		}).done(function( data ) {
			alert('Great! You have checked in via VocaLocal!');
		});
	});
});