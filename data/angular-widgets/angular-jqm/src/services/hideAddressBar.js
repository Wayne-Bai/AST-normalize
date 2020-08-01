/**
 * @ngdoc function
 * @name jqm.$hideAddressBar
 * @requires $window
 * @requires $rootElement
 * @requires $orientation
 *
 * @description
 * When called, this will hide the address bar on mobile devices that support it.
 */
jqmModule.factory('$hideAddressBar', ['$window', '$rootElement', '$orientation', function ($window, $rootElement, $orientation) {
  var MIN_SCREEN_HEIGHT_WIDTH_OPT_OUT = 500,
    MAX_SCREEN_HEIGHT = 800,
    scrollToHideAddressBar,
    cachedHeights = {
    };
  if (!$window.addEventListener || addressBarHidingOptOut()) {
    return noop;
  } else {
    return hideAddressBar;
  }

  function noop(done) {
    if (done) {
      done();
    }
  }

  // -----------------
  function hideAddressBar(done) {
    var orientation = $orientation(),
      docHeight = cachedHeights[orientation];
    if (!docHeight) {
      // if we don't know the exact height of the document without the address bar,
      // start with one that is always higher than the screen to be
      // sure the address bar can be hidden.
      docHeight = MAX_SCREEN_HEIGHT;
    }
    setDocumentHeight(docHeight);
    if (!angular.isDefined(scrollToHideAddressBar)) {
      // iOS needs a scrollTo(0,0) and android a scrollTo(0,1).
      // We always do a scrollTo(0,1) at first and check the scroll position
      // afterwards for future scrolls.
      $window.scrollTo(0, 1);
    } else {
      $window.scrollTo(0, scrollToHideAddressBar);
    }
    // Wait for a scroll event or a timeout, whichever is first.
    $window.addEventListener('scroll', afterScrollOrTimeout, false);
    var timeoutHandle = $window.setTimeout(afterScrollOrTimeout, 400);

    function afterScrollOrTimeout() {
      $window.removeEventListener('scroll', afterScrollOrTimeout, false);
      $window.clearTimeout(timeoutHandle);
      if (!cachedHeights[orientation]) {
        cachedHeights[orientation] = getViewportHeight();
        setDocumentHeight(cachedHeights[orientation]);
      }
      if (!angular.isDefined(scrollToHideAddressBar)) {
        if ($window.pageYOffset === 1) {
          // iOS
          scrollToHideAddressBar = 0;
          $window.scrollTo(0, 0);
        } else {
          // Android
          scrollToHideAddressBar = 1;
        }
      }
      if (done) {
        done();
      }
    }
  }

  function addressBarHidingOptOut() {
    return Math.max(getViewportHeight(), getViewportWidth()) > MIN_SCREEN_HEIGHT_WIDTH_OPT_OUT;
  }

  function getViewportWidth() {
    return $window.innerWidth;
  }

  function getViewportHeight() {
    return $window.innerHeight;
  }

  function setDocumentHeight(height) {
    $rootElement.css('height', height + 'px');
  }
}]);
