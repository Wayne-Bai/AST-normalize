jqmModule.config(['$provide', function($provide) {
  var lastLocationChangeByProgram = false;
  $provide.decorator('$location', ['$delegate', '$browser', '$history', '$rootScope', function($location, $browser, $history, $rootScope) {
    instrumentBrowser();

    $rootScope.$on('$locationChangeSuccess', function () {
      if (!lastLocationChangeByProgram) {
        $history.onUrlChangeBrowser($location.url());
      }
    });

    $history.onUrlChangeProgrammatically($location.url() || '/', false);

    return $location;

    function instrumentBrowser() {
      var _url = $browser.url;
      $browser.url = function (url, replace) {
        if (url) {
          // setter
          $history.onUrlChangeProgrammatically($location.url(), replace);
          lastLocationChangeByProgram = true;
          $rootScope.$evalAsync(function () {
            lastLocationChangeByProgram = false;
          });
        }
        return _url.apply(this, arguments);
      };
    }
  }]);
}]);

jqmModule.factory('$history', ['$window', '$timeout', function $historyFactory($window, $timeout) {
  var $history = {
    go: go,
    urlStack: [],
    indexOf: indexOf,
    activeIndex: -1,
    previousIndex: -1,
    onUrlChangeBrowser: onUrlChangeBrowser,
    onUrlChangeProgrammatically: onUrlChangeProgrammatically
  };

  return $history;

  function go(relativeIndex) {
    // Always execute history.go asynchronously.
    // This is required as firefox and IE10 trigger the popstate event
    // in sync. By using a setTimeout we have the same behaviour everywhere.
    // Don't use $defer here as we don't want to trigger another digest cycle.
    // Note that we need at least 20ms to ensure that
    // the hashchange/popstate event for the current page
    // as been delivered (in IE this can take some time...).
    $timeout(function () {
      $window.history.go(relativeIndex);
    }, 20, false);
  }

  function indexOf(url) {
    var i,
      urlStack = $history.urlStack;
    for (i = 0; i < urlStack.length; i++) {
      if (urlStack[i].url === url) {
        return i;
      }
    }
    return -1;
  }

  function onUrlChangeBrowser(url) {
    var oldIndex = $history.activeIndex;
    $history.activeIndex = indexOf(url);
    if ($history.activeIndex === -1) {
      onUrlChangeProgrammatically(url, false);
    } else {
      $history.previousIndex = oldIndex;
    }
  }

  function onUrlChangeProgrammatically(url, replace) {
    var currentEntry = $history.urlStack[$history.activeIndex];
    if (!currentEntry || currentEntry.url !== url) {
      $history.previousIndex = $history.activeIndex;
      if (!replace) {
        $history.activeIndex++;
      }
      $history.urlStack.splice($history.activeIndex, $history.urlStack.length - $history.activeIndex);
      $history.urlStack.push({url: url});
    }
  }
}]);
