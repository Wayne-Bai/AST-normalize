/*
 * Geddy JavaScript Web development framework
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

(function() {
  'use strict';

  var fs = require('fs')
    , path = require('path')
    , utils = require('utilities');

  /*
  Config section should look like this:

  , sessions: {
      store: 'filesystem'
    , filename: '_session_data.json' // path to the file to use
    , key: 'sid'
    , expiry: 14 * 24 * 60 * 60

  'server' is your Redis server.
  */


  var Filesystem = function (callback) {
    this.filename = null;
    this.setup(callback);
  };

  Filesystem.prototype = new (function () {

    this.setup = function (callback) {
      this.filename = geddy.config.sessions.filename;
      callback();
    };

    this.read = function (session, callback) {
      var sid = session.id
        , _sessions;
      this._getDatastore(function (err, data) {
        if (err) {
          throw err;
        }
        _sessions = data;
        if (!_sessions[sid]) {
          _sessions[sid] = {};
        }
        callback(_sessions[sid]);
      });
    };

    this.write = function (session, callback) {
      var self = this
        , sid = session.id
        , _sessions;
      this._getDatastore(function (err, data) {
        if (err) {
          throw err;
        }
        _sessions = data;
        _sessions[sid] = session;
        self._writeDatastore(_sessions, callback);
      });
    };

    this._getDatastore = function (callback) {
      fs.readFile(this.filename, function (err, d) {
        var data;

        if (err) {
          return callback(null, {});
        }
        data = d.toString();
        try {
          data = JSON.parse(data);
          callback(null, data);
        }
        catch (e) {
          console.error('Could not parse session store, using empty session');
          callback(null, {});
        }
      });
    };

    this._writeDatastore = function (data, callback) {
      var p = this.filename;
      fs.writeFile(p, JSON.stringify(data), callback);
    };

  })();

  exports.Filesystem = Filesystem;
}());
