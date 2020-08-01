/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Session saves session information about the user. Data is automatically
// saved to sessionStorage and automatically loaded from sessionStorage on startup.

'use strict';

define([
  'underscore'
], function (_) {
  var NAMESPACE = '__fxa_session';

  // these keys will be persisted to localStorage so that they live between browser sessions
  var PERSIST_TO_LOCAL_STORAGE = ['oauth'];

  function Session() {
    this.load();
  }

  Session.prototype = {
    /**
     * Load info from sessionStorage
     * @method load
     */
    load: function () {
      var values = {};

      // Try parsing sessionStorage values
      try {
        values = _.extend(values, JSON.parse(sessionStorage.getItem(NAMESPACE)));
      } catch (e) {
        // ignore the parse error.
      }

      // Try parsing localStorage values
      try {
        values = _.extend(values, JSON.parse(localStorage.getItem(NAMESPACE)));
      } catch (e) {
        // ignore the parse error.
      }

      this.set(values);
    },

    /**
     * Set data.
     * @method set
     * can take either a key/value pair or a dictionary of key/value pairs.
     * Note: items with keys in Session.prototype cannot be overwritten.
     */
    set: function (key, value) {
      if (typeof value === 'undefined' && typeof key === 'object') {
        return _.each(key, function (value, key) {
          this.set(key, value);
        }, this);
      }

      // don't overwrite any items on the prototype.
      if (! Session.prototype.hasOwnProperty(key)) {
        this[key] = value;
        this.persist();
      }
    },

    /**
     * Persist data to sessionStorage or localStorage
     * @method persist
     */
    persist: function () {
      // items on the blacklist do not get saved to sessionStorage.
      var toSaveToSessionStorage = {};
      var toSaveToLocalStorage = {};
      _.each(this, function (value, key) {
        if (_.indexOf(PERSIST_TO_LOCAL_STORAGE, key) >= 0) {
          toSaveToLocalStorage[key] = value;
        } else {
          toSaveToSessionStorage[key] = value;
        }
      });

      // Wrap browser storage access in a try/catch block because some browsers
      // (Firefox, Chrome) except when trying to access browser storage and
      // cookies are disabled.
      try {
        localStorage.setItem(NAMESPACE, JSON.stringify(toSaveToLocalStorage));
        sessionStorage.setItem(NAMESPACE, JSON.stringify(toSaveToSessionStorage));

      } catch(e) {
        // some browsers disable access to browser storage
        // if cookies are disabled.
      }
    },

    /**
     * Get an item
     * @method get
     */
    get: function (key) {
      return this[key];
    },

    /**
     * Remove an item or all items
     * @method clear
     * If no key specified, all items are cleared.
     * Note: items in Session.prototype cannot be cleared
     */
    clear: function (key) {
      // no key specified, clear everything.
      if (typeof key === 'undefined') {
        for (key in this) {
          this.clear(key);
        }
        return;
      }

      if (this.hasOwnProperty(key)) {
        this[key] = null;
        delete this[key];
        this.persist();
      }
    },

    // BEGIN TEST API
    /**
     * Remove an item from memory but not sessionStorage. Used to test .load
     * @method testRemove
     * @private
     */
    testRemove: function (key) {
      if (this.hasOwnProperty(key)) {
        this[key] = null;
        delete this[key];
      }
    },

    /**
     * Clear everything, for testing.
     * @method testClear
     * @private
     */
    testClear: function () {
      for (var key in this) {
        if (this.hasOwnProperty(key)) {
          this[key] = null;
          delete this[key];
        }
      }

      sessionStorage.clear();
      localStorage.clear();
    }
    // END TEST API
  };


  // session is a singleton
  return new Session();
});
