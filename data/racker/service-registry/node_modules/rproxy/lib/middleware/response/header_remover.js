var config = require('../../util/config').config;


/**
 * Return true if key starts with a prefixed defined in prefixes.
 *
 * @param {String} key Key name.
 * @param {Array} prefixes Prefixes.
 * @return {Boolean} true if the key starts with a prefix, false otherwise.
 */
function startsWithPrefix(key, prefixes) {
  var i, prefix;

  for (i = 0; i < prefixes.length; i++) {
    prefix = prefixes[i];

    if (key.indexOf(prefix) === 0) {
      return true;
    }
  }

  return false;
}

exports.dependencies = [];

if (config.target.middleware_run_list.response.indexOf('tracing') !== -1) {
  exports.dependencies.push('tracing');
}

exports.processResponse = function(req, res, callback) {
  var settings = config.middleware.header_remover, prefixes = settings.prefixes || [], key;

  if (prefixes.length === 0) {
    callback();
    return;
  }

  for (key in res.headers) {
    if (res.headers.hasOwnProperty(key) && startsWithPrefix(key, prefixes)) {
      delete res.headers[key];
    }
  }

  callback();
};
