
(function(exports) {
  'use strict';
  var debug = Config.debug;
  var controllerWindow;

  var ControllerCommunications = {
    init: function cc_init() {
      debug && console.log('ControllerCommunications INIT');
      // We are going to communicate with Controller through post messages
      window.addEventListener(
        'message',
        function(event) {
          // We need to ensure we are receiving from the same origin
          if (event.origin !== window.location.origin) {
            return;
          }
          // As OpenTok is using window.postMessage in the same
          // window object, we need to shield our code against this type of
          // issues
          try {
            var messageFromController = JSON.parse(event.data);
            if (messageFromController.id !== 'controller') {
              debug && console.log('CallScreen: PostMessage not from Controller');
              return;
            }

            var answer;
            controllerWindow = event.source;
            switch(messageFromController.message) {
              case 'ping':
                answer = {
                  id: 'call_screen',
                  message: 'pong'
                };
                break;
              case 'call':
                var files = [
                  '../js/config.js',
                  '../js/utils.js',
                  '../libs/tokbox/' + window.OTProperties.version + '/js/TB.js',
                  '../libs/opentok.js',
                  '../js/helpers/audio_competing_helper.js',
                  '../js/helpers/call_progress_helper.js',
                  '../js/helpers/tone_player_helper.js',
                  '../js/helpers/countdown.js',
                  'js/ringer.js',
                  'js/call_manager.js',
                  '../js/branding.js',
                  'js/call_screen_ui.js'
                ];

                if (Config.performanceLog.enabled) {
                  files.push('../js/helpers/performance_log_helper.js');
                }

                LazyLoader.load(
                  files,
                  function onCallScreen() {
                    CallManager.init(messageFromController.params);
                  }
                );
                break;
              case 'abort':
                LazyLoader.load(
                  [
                    '../js/helpers/tone_player_helper.js',
                    '../js/branding.js',
                    'js/call_screen_ui.js'
                  ],
                  function onCallScreen() {
                    CallScreenUI.abortCall(messageFromController.error);
                  }
                );
                break;
            }
            ControllerCommunications.send(answer);
          } catch(e) {}
        }.bind(this)
      );
    },
    send: function cc_send(params) {
      controllerWindow.postMessage(JSON.stringify(params), '*');
    }
  };

  exports.ControllerCommunications = ControllerCommunications;
}(this));

ControllerCommunications.init();
