var _debug = function() {
  if (nodetron.debug) {
    if (typeof arguments[0] === 'function' && typeof arguments[1] === 'undefined') {
      arguments[0].call(this);
    }
    console.log.apply(console, arguments);
  }
};