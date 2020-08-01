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
 * Date: Mar 2, 2011
 */

"use strict";

var Response = require('./Response').Response;

var JsonResponse = Response.extend(
    /** @lends JsonResponse */ {

    WRAP_HTML   : 1,
    WRAP_JSONP  : 2
},
/** @lends JsonResponse# */ {
    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Creates a new JSON response for the given entity object.
     *
     * @constructs
     * @extends Response
     * @param entity
     * @param wrap      optional wrapping style
     */
    init: function(entity, wrap) {

        this._super();
        this.wrap = wrap;
        this.setEntity(entity);
        this.setContentType('application/json');
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Returns the source object for this response.
     *
     * @return object
     */
    getEntity: function() {
        return this.entity;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Sets the entity object for this response.
     *
     * @param entity
     */
    setEntity: function(entity) {
        
        this.entity = entity;

        // serialize now so any exceptions are thrown immediately
        this.json = JSON.stringify(entity);
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Returns the JSON-encoded entity.
     *
     * @return object
     */
    getJson: function() {
        return this.json;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Returns the request wrapping for this JSON response.
     *
     * @return int
     */
    getWrap: function() {
        return this.wrap;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Sets the wrapping style.
     *
     * @param style the wrapping style to use
     */
    setWrap: function(style) {
        this.wrap = style;

        if (style == JsonResponse.WRAP_HTML) {
            this.setContentType('text/html', 'utf8');
        }
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Renders into the given writable stream.
     *
     * // todo rename? sendBody? render? write sounds like you're mutating this object
     */
    sendBody: function(stream) {

        var prefix = '';
        var suffix = '';

        if (this.wrap == JsonResponse.WRAP_HTML) {
            prefix = '<textarea>';
            suffix = '</textarea>';
        }

        stream.end(prefix + this.json + suffix, 'utf8');
    }
});

exports.JsonResponse = JsonResponse;
