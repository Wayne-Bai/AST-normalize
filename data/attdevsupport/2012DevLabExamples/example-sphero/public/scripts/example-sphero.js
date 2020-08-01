// !example-sphero.js
/*
 * Currently, the application uses a lot of random jQuery. This isn't ideal, but it gets the point across.
 * Ideally, we would be using something like Backbone or Ember to handle data and state management in a production ready application.
 */

// !RECORDER: Event Handler
function microphone_recorder_events() {

	console.log('MIC EVENT: ' + arguments[0]);

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
  	$('#button-recorder .btn').attr('class', 'btn btn-large btn-success');
  	$('#button-recorder .icon-white').attr('class', 'icon-music icon-white');
  	$('#button-recorder .icon-off').attr('class', 'icon-music icon-white');
  	$('#button-recorder .action').text('Say Command');
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
  	$('#button-recorder .btn').attr('class', 'btn btn-large btn-danger');
  	$('#button-recorder .icon-white').attr('class', 'icon-stop icon-white');
  	$('#button-recorder .action').text('Stop Recording');
    break;

  // !RECORDER: recording_stopped -> Recording has stopped.
  case "recording_stopped":
    var name = arguments[1];
    var duration = arguments[2];
    Recorder.show();
  	$('#button-recorder .btn').attr('class', 'btn btn-large btn-success');
  	$('#button-recorder .icon-white').attr('class', 'icon-music icon-white');
  	$('#button-recorder .icon-off').attr('class', 'icon-music icon-white');
  	$('#button-recorder .action').text('Send Command');
  	$('#button-recorder').attr('id','button-save');
  	$('#button-save .btn').attr('class', 'btn btn-large btn-info');
  	$('#button-save .icon-white').attr('class', 'icon-share-alt icon-white');
    break;

  // !RECORDER: save_pressed -> Detect the "Save" action in Flash
  case "save_pressed":
    Recorder.updateForm();
  	$('#button-save .btn').attr('class', 'btn btn-large btn-info');
  	$('#button-save .btn .icon-share-alt').attr('class', 'icon-spinner icon-white');
  	$('#button-save .btn .icon-spinner').append('<img src="images/spinner.gif">');
  	$('#button-save .btn .action').text('Sending...');
  	$('#button-save .btn').attr('disabled', 'disabled');
    break;

  // !RECORDER: saving -> Save action started
  case "saving":
    var name = arguments[1];
    console.log('SAVE STARTED: ' + name);
    break;

  // !RECORDER: saved -> Response to the file upload
  case "saved":
    console.log('SAVED! ' + JSON.stringify(arguments[2]));
    // Parse the JSON returned by the POST to '/upload'
    var data = $.parseJSON(arguments[2]);
    
    // If it contains a "saved" parameter, then it was successful
    if(data.saved) {
	  	Recorder.hide();
	  	
		$.ajax({
			type: "POST",
			url: '/speechToText'
		}).done(function( data ) {
		  	var catchPhrase = data.Recognition.NBest[0].ResultText;
		  		catchPhrase = catchPhrase.toLowerCase().replace(/[^a-z0-9 ]/gi,'');

		  	$.ajax({
				type: "POST",
				url: '/macro',
				data: {
					command: catchPhrase
				}
			}).done(function( data ) {
				console.log( JSON.stringify(data) );
				$('#button-save .btn .icon-spinner').html('');
				$('#button-save .btn .icon-spinner').attr('class', 'icon-music icon-white');
				$('#button-save .btn .action').text('Say Command');
  				$('#button-save .btn').removeAttr('disabled');
				$('#button-save').attr('id','button-recorder');
				$('#button-recorder .btn').attr('class', 'btn btn-large btn-success');
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
	var appWidth = 160;
	var appHeight = 40;
	var flashvars = {'event_handler': 'microphone_recorder_events', 'upload_image': '/images/transparent-big.png'};
	var params = {};
	var attributes = {'id': "recorderApp", 'name':  "recorderApp", 'wmode' : "transparent"};
	swfobject.embedSWF("/flash/recorder.swf", "flashcontent", appWidth, appHeight, "10.1.0", "", flashvars, params, attributes);
});

$(document).ready(function() {
	// !APP: Set up button event handlers
	// Connect or start recording with the Microphone
	$(document).on('click','#button-recorder',function() {
		Recorder.record('audio', '/public/audio/audio.wav');
		return false;
	});
	
	// !COLORPICKER: Initialize and setup color change event
	$("input[name='color']").colorpicker({ format: 'rgb' }).on('changeColor', function(ev){
		$("input[name='color']").val( 'rgb(' + ev.color.toRGB().r + ',' + ev.color.toRGB().g + ',' + ev.color.toRGB().b + ')' ).css({ color: ev.color.toHex() });
		$("input[name='color-red']").val( ev.color.toRGB().r );
		$("input[name='color-green']").val( ev.color.toRGB().g );
		$("input[name='color-blue']").val( ev.color.toRGB().b );
		$("#color-tile").css({ backgroundColor: ev.color.toHex() });
		$.ajax({
			type: "POST",
			url: '/sphero',
			data: {
				command: 'color',
				red: $('input[name=color-red]').val(),
				green: $('input[name=color-green]').val(),
				blue: $('input[name=color-blue]').val()
			}
		}).done(function(data) {
			console.log(JSON.stringify(data));
		});
	});
	
	// !COLORPICKER: 
	$(document).on('click', '#set-color', function() {
		$.ajax({
			type: "POST",
			url: '/sphero',
			data: {
				command: 'color',
				red: $('input[name=color-red]').val(),
				green: $('input[name=color-green]').val(),
				blue: $('input[name=color-blue]').val()
			}
		}).done(function(data) {
			console.log(JSON.stringify(data));
		});
	});
	$(document).on('click', '#set-luminosity', function() {
		$.ajax({
			type: "POST",
			url: '/sphero',
			data: {
				command: 'backled',
				luminosity: $('input[name=color-luminosity]').val()
			}
		}).done(function(data) {
			console.log(JSON.stringify(data));
		});
	});
	$(document).on('click', '#set-heading', function() {
		$.ajax({
			type: "POST",
			url: '/sphero',
			data: {
				command: 'turn',
				heading: $('input[name=nav-heading]').val()
			}
		}).done(function(data) {
			console.log(JSON.stringify(data));
		});
	});
	$(document).on('click', '#set-roll-start', function() {
		$.ajax({
			type: "POST",
			url: '/sphero',
			data: {
				command: 'roll',
				heading: $('input[name=nav-heading]').val(),
				speed: $('input[name=nav-speed]').val()
			}
		}).done(function(data) {
			console.log(JSON.stringify(data));
		});
	});
	$(document).on('click', '#set-roll-stop', function() {
		$.ajax({
			type: "POST",
			url: '/sphero',
			data: {
				command: 'stop'
			}
		}).done(function(data) {
			console.log(JSON.stringify(data));
		});
	});
	$(document).on('click','.macro-tester', function() {
		var vCommand = $(this).attr('id').substr(6);
		$.ajax({
			type: "POST",
			url: '/macro',
			data: {
				command: vCommand
			}
		}).done(function(data) {
			console.log(JSON.stringify(data));
		});
	});
	$(document).on('click','.macro-action-remove', function() {
		$(this).parents('.macro-action').remove();
	});
	$(document).on('click','.macro-remove', function() {
		$(this).parents('.macro').remove();
	});
	$(document).on('click','#macro-new-action', function() {
		var controlType = $('select[name=new-action]').val()
		var controlHTML = '<li class="control-group macro-action"';
		
		switch(controlType) {
			case 'Roll':
				controlHTML += ' data-action-type="roll"><label class="control-label">' + controlType + '</label><div class="controls controls-row"><input type="text" data-action-param="speed" placeholder="speed" class="span3"><input type="text" data-action-param="heading" placeholder="heading" class="span3">';
				break;
			case 'Stop':
				controlHTML += ' data-action-type="stop"><label class="control-label">' + controlType + '</label><div class="controls controls-row"><input type="text" class="span6" value="Sphero will stop rolling." disabled="disabled">';
				break;
			case 'Turn':
				controlHTML += ' data-action-type="turn"><label class="control-label">' + controlType + '</label><div class="controls controls-row"><input type="text" data-action-param="heading" placeholder="heading" class="span6">';
				break;
			case 'LED Color':
				controlHTML += ' data-action-type="color"><label class="control-label">' + controlType + '</label><div class="controls controls-row"><input type="text" data-action-param="red" placeholder="red" class="span2"><input type="text" data-action-param="green" placeholder="green" class="span2"><input type="text" data-action-param="blue" placeholder="blue" class="span2">';
				break;
			case 'Tail Light':
				controlHTML += ' data-action-type="backled"><label class="control-label">' + controlType + '</label><div class="controls controls-row"><input type="text" data-action-param="luminosity" placeholder="luminosity" class="span6">';
				break;
			default:
				return false;
				break;
		}
		
		controlHTML +=  '<input type="text" data-action-param="delay" placeholder="delay (ms)" class="span2"><button class="macro-action-remove btn btn-danger span1"><i class="icon-remove icon-white"></i></button></li>';
		$('#macro-builder').append(controlHTML);
	});
	$(document).on('click','#macro-save', function() {
		var macroHTML = 'case \'' + $('#macro-command').val() + '\':\n';
		var macroEndHTML = '\tbreak;';
		
		var actionsCount = $('#macro-builder .macro-action').length;
		var actionNum = 1;
		
		$('#macro-builder .macro-action').each(function() {
			var actionType = $(this).attr('data-action-type');
			var actionHTML = '\t';
			var timerstart = '';
			var timerend = '';
			
			switch(actionType) {
				case 'roll':
					actionHTML += 'bot.roll(';
					$(this).find('.controls input').each(function() {
						switch($(this).attr('data-action-param')) {
							case 'speed':
								actionHTML += $(this).val() + ', ';
								break;
							case 'heading':
								actionHTML += $(this).val();
								break;
							case 'delay':
								if($(this).val() > 0) {
									timerstart += '\tdelayer(' + $(this).val() + ', function() {\n';
									timerend += '\t});\n';
								}
								break;
						}
					});
					break;
				case 'stop':
					actionHTML += 'bot.roll(0, 0';
					$(this).find('.controls input').each(function() {
						switch($(this).attr('data-action-param')) {
							case 'delay':
								if($(this).val() > 0) {
									timerstart += '\tdelayer(' + $(this).val() + ', function() {\n';
									timerend += '\t});\n';
								}
								break;
						}
					});
					break;
				case 'turn':
					actionHTML += 'bot.setHeading(';
					$(this).find('.controls input').each(function() {
						switch($(this).attr('data-action-param')) {
							case 'heading':
								actionHTML += $(this).val();
								break;
							case 'delay':
								if($(this).val() > 0) {
									timerstart += '\tdelayer(' + $(this).val() + ', function() {\n';
									timerend += '\t});\n';
								}
								break;
						}
					});
					break;
				case 'color':
					actionHTML += 'bot.setRGBLED(';
					$(this).find('.controls input').each(function() {
						switch($(this).attr('data-action-param')) {
							case 'red':
								actionHTML += $(this).val() + ', ';
								break;
							case 'green':
								actionHTML += $(this).val() + ', ';
								break;
							case 'blue':
								actionHTML += $(this).val();
								break;
							case 'delay':
								if($(this).val() > 0) {
									timerstart += '\tdelayer(' + $(this).val() + ', function() {\n';
									timerend += '\t});\n';
								}
								break;
						}
					});
					break;
				case 'backled':
					actionHTML += 'bot.setBackLED(';
					$(this).find('.controls input').each(function() {
						switch($(this).attr('data-action-param')) {
							case 'luminosity':
								actionHTML += $(this).val();
								break;
							case 'delay':
								if($(this).val() > 0) {
									timerstart += '\tdelayer(' + $(this).val() + ', function() {\n';
									timerend += '\t});\n';
								}
								break;
						}
					});
					break;
			}
			if(timerstart) {
				actionHTML = timerstart + actionHTML;
			}
			if(actionNum==actionsCount) {
				actionHTML += ');';
				if(timerend) {
					macroEndHTML = timerend + macroEndHTML;
				}
			} else {
				actionHTML += ', function () {';
				if(timerend) {
					macroEndHTML = timerend + '\t});\n' + macroEndHTML;
				} else {
					macroEndHTML = '\t});\n' + macroEndHTML;
				}
			}
			timerstart = '';
			timerend = '';
			actionHTML += '\n';
			macroHTML += actionHTML;
			actionNum++;
		});
		
		macroHTML += macroEndHTML;
		
		var macroFullHTML = '<div id="macro-' + $('#macro-name').val() + '" class="macro control-group"><label class="control-label">' + $('#macro-name').val() + '</label><div class="controls"><pre class="span7">';
		macroFullHTML += macroHTML;
		macroFullHTML += '</pre><button class="btn btn-danger span1 macro-remove"><i class="icon-white icon-remove"></i></button></div>';
	
		$('#macro-list').append(macroFullHTML);
		$('#macro-name').val('');
		$('#macro-command').val('');
		$('#macro-builder .macro-action').remove();
	});
});