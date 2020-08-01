// isWebCamGIFSupported.js
// =======================

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/error'
], function(error) {
  return function() {
    return error.isValid();
  };
});