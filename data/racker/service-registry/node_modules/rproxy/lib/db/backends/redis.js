/**
 *  Copyright 2012 Tomaz Muraus
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

var redis = require('redis');


/**
 * Redis client.
 * @constructor
 *
 * @param {Object} options Client options.
 */
var RedisClient = function(options) {
  options = options || {};

  this._options = options;
  this._client = this._getClient();
};


/**
 * Set up and return a redis client instance.
 *
 * @return {Object} Redis client instance.
 */
RedisClient.prototype._getClient = function() {
  var client = redis.createClient(this._options.port, this._options.host);

  if (this._options.password) {
    client.auth(this._options.password);
  }

  return client;
};


/**
 * Retrieve a value.
 *
 * @param {String} key Key.
 * @param {Function} callback Callback called with (err, result).
 */
RedisClient.prototype.get = function(key, callback) {
  this._client.get(key, callback);
};


/**
 * Retrieve multiple values.
 *
 * @param {String} key Key.
 * @param {Function} callback Callback called with (err, results).
 */
RedisClient.prototype.getMulti = function(keys, callback) {
  this._client.mget(keys, callback);
};


/**
 * Retrieve multiple counters.
 *
 * @param {String} key Key.
 * @param {Function} callback Callback called with (err, results).
 */
RedisClient.prototype.getCounters = function(keys, callback) {
  this._client.mget(keys, callback);
};


/**
 * Set a key.
 *
 * @param {String} key Key.
 * @param {String} value Value.
 * @param {?Object} Options with the following keys: ttl.
 * @param {Function} callback Callback called with (err, result).
 */
RedisClient.prototype.set = function(key, value, options, callback) {
  options = options || {};
  var multi = this._client.multi();

  multi.set(key, value);

  if (options.ttl) {
    multi.expire(key, options.ttl);
  }

  multi.exec(callback);
};


/**
 * Set multiple values.
 *
 * @param {Object} values Object with key / value pairs.
 * @param {?Object} Options with the following keys: ttl.
 * @param {Function} callback Callback called with (err, result).
 */
RedisClient.prototype.setMulti = function(values, options, callback) {
  options = options || {};
  var multi = this._client.multi(), keys = Object.keys(values), key, args = [];

  for (key in values) {
    args.push(key);
    args.push(values[key]);
  }

  multi.mset(args);

  if (options.ttl) {
    keys.forEach(function(key) {
      multi.expire(key, options.ttl);
    });
  }

  multi.exec(callback);
};


/**
 * Increment a counter.
 *
 * @param {String} key Key.
 * @param {?Object} Options with the following keys: ttl, step.
 * @param {Function} callback Callback called with (err, result).
 */
RedisClient.prototype.incr = function(key, options, callback) {
  options = options || {};
  var step = options.step || 1;

  var multi = this._client.multi();

  multi.incrby(key, step);

  if (options.ttl) {
    multi.expire(key, options.ttl);
  }

  multi.exec(callback);
};


/*
 * Remove a key.
 *
 * @param {String} key Key.
 * @param {Function} callback Callback called with (err, result).
 */
RedisClient.prototype.remove = function remove(key, callback) {
  this._client.del(key, callback);
};


exports.RedisClient = RedisClient;
