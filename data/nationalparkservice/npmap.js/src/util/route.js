/* globals L */
/* jshint camelcase: false */

'use strict';

var reqwest = require('reqwest');

module.exports = ({
  mapbox: (function() {
    return {
      route: function(latLngs, callback, mode) {
        var locations = '';

        mode = mode || 'driving';

        for (var i = 0; i < latLngs.length; i++) {
          var latLng = latLngs[i];

          if (i) {
            locations += ';';
          }

          locations += latLng.lng + ',' + latLng.lat;
        }

        reqwest({
          crossOrigin: true,
          error: function() {
            callback({
              message: 'The route failed. Please check your network connection.',
              success: false
            });
          },
          success: function(response) {
            //console.log(response);
            callback(response);
          },
          type: 'json',
          url: 'https://api.tiles.mapbox.com/v4/directions/mapbox.' + mode + '/' + locations + '.json?access_token=pk.eyJ1IjoibnBzIiwiYSI6IkdfeS1OY1UifQ.K8Qn5ojTw4RV1GwBlsci-Q&alternatives=false&instructions=html'
        });
      }
    };
  })()
});
