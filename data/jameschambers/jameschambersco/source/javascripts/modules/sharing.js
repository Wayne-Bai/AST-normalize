var Sharing = (function() {

  // -------------------------------------------------
  //
  // UI
  // 
  // -------------------------------------------------

  var UI = {
    tweet: '.js-tweet',
    share: '.js-share',
    fbWindowWidth: 626,
    fbWindowHeight: 436,
    twitterWindowWidth: 550,
    twitterWindowHeight: 450
  };

  // -------------------------------------------------
  //
  // Bind UI events
  // 
  // -------------------------------------------------

  function bindEvents() {

    $(UI.tweet).bind('click', onTweet);
    $(UI.share).bind('click', onShare);

  }

  // -------------------------------------------------
  //
  // Tweet
  // http://gpiot.s1.cotidia.com/twitter-share-demo/
  //
  // -------------------------------------------------

  function onTweet(event) {

    var self = this;

    event.preventDefault();

    var $elem = $(event.currentTarget);


    // Open the popup
    window.open($elem.attr('href'), 'twitterwindow', 'height=' + UI.twitterWindowHeight + ', width=' + UI.twitterWindowWidth + ', top=' + ($(window).height() / 2 - parseInt(UI.twitterWindowHeight / 2, 10)) + ', left=' + $(window).width() / 2 + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');


  }


  // -------------------------------------------------
  // 
  //  Share
  //  http://gpiot.s1.cotidia.com/twitter-share-demo/
  // 
  //  -------------------------------------------------

  function onShare(event) {

    var self = this;

    event.preventDefault();

    var $elem = $(event.currentTarget);

    // open the ppopup
    window.open($elem.attr('href'), 'facebookwindow', 'height=' + UI.fbWindowHeight + ', width=' + UI.fbWindowWidth + ', top=' + ($(window).height() / 2 - parseInt(UI.fbWindowHeight / 2, 10)) + ', left=' + $(window).width() / 2 + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');

  }


  return {
    init: function() {
      bindEvents();
    }
  };

})();

Sharing.init();