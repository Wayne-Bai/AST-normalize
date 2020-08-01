/**
 *  Copyright 2013 Rackspace
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

// TODO: Move into shared module

var responses = require('../../api/responses');

/**
 * @param {Object} req The Request object.
 * @param {Object} res The Response object.
 * @param {String} type Response type (public|private).
 *
 * @return {Function} Closure.
 */
exports.swizResponseCallback = function(req, res, options) {
  options = options || {};

  return function(err, obj) {
    var re;
    if (err) {
      re = new responses.ErrorResponse(err);
    }
    else {
      re = new responses.SwizResponse(obj, null, options);
    }

    re.perform(req, res);
  };
};

/**
 * @param {Object} req The Request object.
 * @param {Object} res The Response object.
 * @param {Object} options Options object.
 * @return {Function} Closure.
 */
exports.swizListResponseCallback = function(req, res, options) {
  options = options || {};
  var type = options.type;

  return function(err, obj, data) {
    var re, resObj;
    if (err) {
      re = new responses.ErrorResponse(err);
    } else {
      re = new responses.SwizListResponse(obj, null, data, options);
    }

    re.perform(req, res);
  };
};

/**
 * @param {Object} req The Request object.
 * @param {Object} res The Response object.
 * @param {Object} options Options object.
 * @return {Function} Closure.
 */
exports.createResponseCallback = function(req, res, options) {
  options = options || {};

  return function(err, obj, payload) {
    var re, resObj;
    if (err) {
      re = new responses.ErrorResponse(err);
    } else {
      re = new responses.CreateResponse(obj, payload);
    }

    re.perform(req, res);
  };
};

/**
 * @param {Object} req The Request object.
 * @param {Object} res The Response object.
 * @param {Object} options Options object.
 * @return {Function} Closure.
 */
exports.updateResponseCallback = function(req, res, options) {
  options = options || {};

  return function(err, obj) {
    var re;
    if (err) {
      re = new responses.ErrorResponse(err);
    } else {
      re = new responses.UpdateResponse(obj);
    }

    re.perform(req, res);
  };
};

/**
 * @param {Object} req The Request object.
 * @param {Object} res The Response object.
 * @param {Object} options Options object.
 * @return {Function} Closure.
 */
exports.deleteResponseCallback = function(req, res, options) {
  options = options || {};
  return function(err, obj) {
    var re;
    if (err) {
      re = new responses.ErrorResponse(err);
    } else {
      re = new responses.DeleteResponse(obj);
    }

    re.perform(req, res);
  };
};
