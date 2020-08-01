var debug = require('debug');
var pkg = require('../package.json');

module.exports = logger;

/**
 * [a debugger class which inherits from a parent namespace]
 * @param  {String} globalName [the parent namespace]
 * @return {Object}            [debugger instance]
 */
function logger(globalName) {
  return function() {
    var args = Array.prototype.slice.call(arguments, 0);
    var global = globalName || pkg.name;

    return debug(
      args.length > 0 ?
      [global, args.join(':')].join(':') :
      global
    )
  }
}