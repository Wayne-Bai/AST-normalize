(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.togglePrint = factory();
  }
}(this, function () {
  function toggle() {
    if (typeof window.__togglePrint !== 'object') {
      window.__togglePrint = {};
    }

    var store = window.__togglePrint;
    var dataNode = document.head.parentNode;
    var printMode = dataNode.getAttribute('data-printmode') === 'enabled';

    if (!printMode) {
      // query the dom each time print is toggled on. Detects possible dynamic loaded stylesheets
      var mediaNodes = Array.prototype.slice.call(document.getElementsByTagName('link')).filter(function (node) {
        return node.getAttribute('rel').toLowerCase() === 'stylesheet' && node.hasAttribute('media');
      });

      // When toggling, find media print and media screen files and track
      store.screens = mediaNodes.filter(function (node) {
        return node.getAttribute('media').toLowerCase() === 'screen';
      });
      store.prints = mediaNodes.filter(function (node) {
        return node.getAttribute('media').toLowerCase() === 'print';
      });
    }

    printMode = !printMode;

    store.screens.forEach(function (node) {
      // When toggling print on, set media screen styles to 'none' (is ths possible?)
      node.setAttribute('media', printMode ? 'none' : 'screen');
    });
    store.prints.forEach(function (node) {
      // When toggling print on, set media print styles to 'all'
      node.setAttribute('media', printMode ? 'all' : 'print');
    });

    dataNode.setAttribute('data-printmode', printMode ? 'enabled' : 'disabled');
  }

  function togglePrint(options) {
    options = options || {};

    options.key = options.key || 'p';

    document.addEventListener('keydown', function (e) {
      if (String.fromCharCode(e.keyCode).toLowerCase() === options.key.toLowerCase()) {
        toggle();
      }
    });
  }

  togglePrint.toggle = toggle;

  return togglePrint;
}));
