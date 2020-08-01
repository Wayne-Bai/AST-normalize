/*!
 * Copyright (C) 2011 by the Capsela contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Author: Seth Purcell
 * Date: Feb 27, 2011
 */

"use strict";

var Class = require('capsela-util').Class;
var EventEmitter = require('events').EventEmitter;
var Q = require('q');
var Session = require('./Session').Session;

var SessionStore = Class.extend(
    /** @lends SessionStore */ {

    mixin: EventEmitter
},
/** @lends SessionStore# */ {
    ////////////////////////////////////////////////////////////////////////////
    /**
     * A basic in-memory session store
     * 
     * @constructs
     */
    init: function(config) {
        this.sessions = {};
    },

    ////////////////////////////////////////////////////////////////////////////
    /**
     * Returns a promise for the session having the given ID.
     *
     * @param id    the session id
     *
     * @return promise
     */
    load: function(id) {
        return Q.resolve(this.sessions[id]);
    },

    ////////////////////////////////////////////////////////////////////////////
    /**
     * Saves the given session and returns a completion promise.
     *
     * @param session
     *
     * @return promise
     */
    save: function(session) {
        session.touch();
        session.store = this;
        this.sessions[session.getId()] = session;
        return Q.resolve(session);
    },

    ////////////////////////////////////////////////////////////////////////////
    /**
     * Destroys the given session.
     *
     * @param session
     *
     * @return promise  completion promise
     */
    destroy: function(session) {
        delete this.sessions[session.getId()];
        return Q.resolve();
    },

    ////////////////////////////////////////////////////////////////////////////
    /**
     * Go through the sessions and clean up any that have timed out.
     *
     * @param timeout
     *
     * @return promise  completion promise
     */
    cleanup: function(timeout) {

        for (var id in this.sessions) {

            // see if the session is too old
            if (!this.sessions[id].stillValid()) {
                delete this.sessions[id];
            }
        }

        return Q.resolve();
    }
});

exports.SessionStore = SessionStore;

