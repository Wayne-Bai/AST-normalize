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
 * Date: 12/22/11
 */

"use strict";

var Class = require('capsela-util').Class;

var Resolver = Class.extend(
    /** @lends Resolver */ {

},
/** @lends Resolver# */ {
    ////////////////////////////////////////////////////////////////////////////
    /**
     * A registry of reference-resolving callbacks.
     * 
     * @constructs
     */
    init: function() {
        this.resolvers = {};
    },

    ////////////////////////////////////////////////////////////////////////////
    /**
     * Registers the given resolver as a handler for the given ref type.
     *
     * @param type      a reference type (namespace ID)
     * @param resolver  a resolver object or a function
     */
    register: function(type, resolver) {
        this.resolvers[type] = typeof resolver == 'function' ?
            {resolve: resolver} : resolver;
    },
    
    ////////////////////////////////////////////////////////////////////////////
    /**
     * Resolves the given reference using the registered resolvers.
     * 
     * @param type
     * @param ref
     */
    resolve: function(type, ref) {

        var resolver = this.resolvers[type];

        if (!resolver) {
            return undefined;
        }

        return resolver.resolve(type, ref, this);
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Resolves URN-like textual references of the form ref:nid:nss
     *
     * @param str   the source text within which refs will be resolved
     *
     * @return string
     */
    resolveReferences: function(str) {

        var t = this;
        var re = /ref:([A-Za-z0-9][A-Za-z0-9_-]+):([^\\"&<>\[\]^`{|}~]+)/g;

        return str.replace(re,
            function(match, namespace, nss) {
                return t.resolve(namespace, nss);
            });
    }
});

exports.Resolver = Resolver;