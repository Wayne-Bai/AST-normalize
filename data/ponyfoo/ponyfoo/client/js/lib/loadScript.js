'use strict';

var tag = 'script';

function loadScript (url) {
  var first = document.getElementsByTagName(tag)[0];
  var script = document.createElement(tag);
  script.async = true;
  script.src = url;
  first.parentNode.insertBefore(script, first);
}

module.exports = loadScript;
