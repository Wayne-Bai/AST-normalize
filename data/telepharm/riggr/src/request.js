/*jshint newcap: false */
// request.js
// Provides centralized control for async/xhr requests
// ---
// Part of the Riggr SPA framework <https://github.com/Fluidbyte/Riggr> and released
// under the MIT license. This notice must remain intact.
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    root.request = factory(root.$);
  }
}(this, function ($) {

  // Class constructor
  var request = function () {
    // Storage for saved requests
    this.stored = {};
  };

  // Request method
  request.prototype.send = function (req, opts) {
    var reqObj = {};
    var checkType = function (obj) {
      return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };

    // Determine type of call (stored or direct)
    if (checkType(req) === 'string' && this.stored.hasOwnProperty(req)) {
      // Get from storage
      for (var storedItem in this.stored[req]) {
        reqObj[storedItem] = this.stored[req][storedItem];
      }
      // Overwrite any stored opts
      if (opts && checkType(opts) === 'object') {
        for (var opt in opts) {
          // Only includes standars opts, not proprietary url_params
          if (opt !== 'url_params') {
            reqObj[opt] = opts[opt];
          }
        }
      }
    } else if (checkType(req) === 'object') {
      // Set reqObj to the request
      reqObj = req;
    }

    // Process URL parameters
    if (opts && opts.hasOwnProperty('url_params')) {
      reqObj.url = this.processURLParams(reqObj.url, opts.url_params);
    }

    // Make (and return) AJAX request
    return $.ajax(reqObj);
  };

  // Process URL parameters
  request.prototype.processURLParams = function (url, params) {
    return url.replace(/\{([^}]+)\}/g, function (i, match) {
      return params[match];
    });
  };

  // Create stored request
  request.prototype.create = function (name, opts) {
    this.stored[name] = opts;
  };

  // Remove stored request
  request.prototype.remove = function (name) {
    delete this.stored[name];
  };

  return new request();

}));
