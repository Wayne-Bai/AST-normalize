/**
 * Meteor Rider
 * ===================
 *
 * This script is to facilitate an easy means of "taking over" or "hijacking"
 * a HTML page, with a Meteor app.
 *
 * Use Case
 * ----------------
 * The Use Case for this, is for a PhoneGap application.  On the device, you
 * load a basic HTML file, and it initializes the phone and device specific JS.
 * Then you use Meteor Rider to connect to your Meteor backend and "take over"
 * the HTML.
 *
 * Requirements
 * ----------------
 * jQuery or Zepto are required, because I'm lazy and want to use their API for
 * AJAX+DOM
 *
 * Gotchas
 * ----------------
 * Cross Origin Request Security doesn't allow this in a browser,
 *   but PhoneGap does, and if we can inject CORS headers into Meteor it might
 *   work in a browser sometime
 * Meteor Rider can not remove CSS... so anything loaded on the root page, remains.
 *
 *
 *
 */

var attempts = 0;
var MeteorRider = {
  init: function(targetPath) {
    var meteorUrl = __MeteorRiderConfig__.meteorUrl;

    window.appVersion = __MeteorRiderConfig__.appVersion;

    console.log("Riding " + meteorUrl);

    // trigger request
    $.ajax({
      url: meteorUrl,
      cache: false,
      // TODO: split to method on MeteorRider
      error: function( jqXHR, textStatus, errorThrown ) {
        console.error("MeteorRider failure");
        console.error(jqXHR, textStatus, errorThrown);
        MeteorRider.showNoServer();
      },
      // TODO: split to method on MeteorRider
      success: function( data, textStatus, jqXHR ) {
        MeteorRider.hideNoServer()
        console.log("MeteorRider success");
        data = data.replace(/(href|src|manifest)\=\"\//gm, '$1="' + meteorUrl + '/');

        // get the original file location, not including any params
        phonegapLocation = window.location.href.split('.html')[0] + '.html';

        // it's stored in a param "page"
        currentMeteorPath = window.location.search.replace("?", "")
        if(currentMeteorPath.length > 0) {
          meteorUrl += currentMeteorPath.split('page=')[1]
        }
        console.log("replacing state with "+meteorUrl+targetPath)
        window.history.replaceState({}, "", meteorUrl+targetPath);

        // replace the document with the new document/data
        document.open();
        document.write(data);
        document.close();

        // trigger the "loaded" events (it'd be nice to do this AFTER JS has loaded
        $(document).trigger('DOMContentLoaded');
        $(document).trigger('load');
        $(document).trigger('complete');

        MeteorRider.watchForContentLoad();
      }
    });
  },
  showNoServer: function() {
    navigator.splashscreen.hide();
    $('.app--no-server').show();
  },
  hideNoServer: function() {
    $('.app--no-server').hide();
  },
  watchForContentLoad: function() {
    if (attempts < 30) {
      attempts++;
      console.log("attempt #"+attempts);
      setTimeout(function() {
        var container = $('#container');
        if(container.length) {
          navigator.splashscreen.hide();
        } else {
          MeteorRider.watchForContentLoad();
        }
      }, 500);
    } else {
      MeteorRider.showNoServer();
      navigator.splashscreen.hide();
    }
  }
}
