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
 * Date: 11/14/11
 */

"use strict";

var ViewResponse = require('./ViewResponse').ViewResponse;
var View = require('./View').View;

var LayoutResponse = ViewResponse.extend(
    /** @lends LayoutResponse */ {
},
/** @lends LayoutResponse# */{
    ///////////////////////////////////////////////////////////////////////////////
    /**
     * @constructs
     * @param view      a View object or a view name
     * @param model     the view model object
     * @param code      optional HTTP status code
     * @param layout    the name of the layout view; defaults to 'layout'
     */
    init: function(view, model, code, layout) {

        this._super(view, model, code);
        this.layout = layout || 'layout';
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Injects the ability to render the view for this response. Even if this.view
     * is already a renderable View, we need a ViewRenderer to resolve any
     * references.
     *
     * @param renderer  a ViewRenderer
     */
    setRenderer: function(renderer) {
        this.renderer = renderer;
        return this;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Writes the response body to the given stream.
     *
     * @param stream    writable stream
     */
    sendBody: function(stream) {

        // render the content view
        var content = this.renderer.render(this.view, this.model);

        // now render the layout
        var result = this.renderer.render(this.layout, {
            content: content,
            child: this.model
        });

        stream.end(result, 'utf8');
    }
});

exports.LayoutResponse = LayoutResponse;
