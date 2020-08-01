~function (window, document, location) {
  function inject (url) {
    var script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
  }

  function injector () {
    var search = location.search;
    var searchQuery = search ? '&' + search.substr(1) : '';
    var searchJson = '?json&callback=taunusReady' + searchQuery;
    inject(location.pathname + searchJson);
    inject('/js/all.js');
  }

  window.taunusReady = function (model) {
    window.taunusReady = model;
  };

  if (window.addEventListener) {
    window.addEventListener('load', injector, false);
  } else if (window.attachEvent) {
    window.attachEvent('onload', injector);
  } else {
    window.onload = injector;
  }
}(window, document, location);
