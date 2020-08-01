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
 * Date: 11/1/11
 */

"use strict";

var fs = require('fs');
var path = require('path');
var parseUrl = require('url').parse;
var resolveUrl = require('url').resolve;
var Q = require('q');

var Class = require('capsela-util').Class;
var Pipe = require('capsela-util').Pipe;

var HttpClient = require('./HttpClient').HttpClient;
var Request = require('./Request').Request;
var Cookie = require('./Cookie').Cookie;
var Log = require('capsela-util').Log;
var Logger = require('capsela-util').Logger;

var jsdom = require('jsdom');
var jquery = fs.readFileSync(__dirname + "/../deps/jquery-1.7.1.min.js", 'utf8');

var Browser = Class.extend(
/** @lends Browser */ {

    mixin: Logger,

    REDIRECT_LIMIT: 10
},
/** @lends Browser# */ {
    ///////////////////////////////////////////////////////////////////////////////
    /**
     * @constructs
     * @param timeout   the request timeout, in seconds
     */
    init: function(timeout) {
        this.cookiesByHost = {};
        this.followRedirects = true;
        this.jQueryify = true;
        this.timeout = timeout || 3000; // default timeout of 3s
        this.LOG = new Log();
        this.LOG.watch(this);
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     *
     */
    enableRedirects: function() {
        this.followRedirects = true;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     *
     */
    disableRedirects: function() {
        this.followRedirects = false;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Loads the given HTML document into the browser window.
     * 
     * @param html
     * @param mediaType
     *
     * @return promise  completion promise
     */
    loadDocument: function(html, mediaType) {

        var t = this;
        var d = Q.defer();

        jsdom.env({
            html: html,
            src: t.jQueryify && [jquery],
            done: function(err, window) {
                if (err) {
                    d.reject(err);
                }
                else {
                    t.window = window;
                    t.window.data = html;
                    d.resolve(window);
                }
            }
        });

        return d.promise;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Returns a promise for a JSDOM window with JQuery installed.
     *
     * @param url
     * @param redirect  an optional redirecting response object
     *
     * @return promise
     */
    get: function(url, redirect) {
        
        if (redirect) {
            this.redirects.push(redirect);
            if (this.redirects.length >= this.Class.REDIRECT_LIMIT) {
                return Q.reject(new Error("redirect limit reached"));
            }
        }
        else {
            this.redirects = [];
        }

        // create the request
        var t = this;
        var parts = parseUrl(url);
        var request = new Request('GET', parts.pathname + (parts.search ? parts.search : ''));

        var result = this.dispatch(parts.hostname, request)
            .then(function(response) {
                
                // set the location info
                t.window.location.href = url;
                t.window.location.pathname = parts.pathname;
                
                return response;
            });

        request.bodyStream.end();

        return result;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Posts the given body data to the given URL.
     * 
     * @param url
     * @param body          the data to send as the body
     * @param contentType   the value of the content-type header
     */
    post: function(url, body, contentType) {

        // create the request
        var t = this;
        var parts = parseUrl(url);
        var request = new Request('POST', parts.pathname, {
            'content-type': contentType
        });
        
        var result = this.dispatch(parts.hostname, request)
            .then(function(response) {

                // set the location info
                t.window.location.href = url;
                t.window.location.pathname = parts.pathname;

                return response;
            });

        request.bodyStream.end(body);

        return result;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Posts the given form.
     * 
     * @param url
     * @param form
     */
    postForm: function(url, form) {

        // create the request
        var t = this;
        var parts = parseUrl(url);
        var boundary = 'simple boundary';
        var request = new Request('POST', parts.pathname, {
            'content-type': 'multipart/form-data; boundary="' + boundary + '"'
        });

        var result = this.dispatch(parts.hostname, request)
            .then(function(response) {

                // set the location info
                t.window.location.href = url;
                t.window.location.pathname = parts.pathname;

                return response;
            });

        form.serialize(request.bodyStream, boundary);
        request.bodyStream.end();

        return result;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Returns true if the last page fetch was due to a redirect.
     *
     * @return boolean
     */
    redirected: function() {
        return this.redirects.length > 0;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Clicks the link identified by the given selector.
     * 
     * @param selector
     *
     * @return promise
     */
    followLink: function(selector) {

        var link = this.getElement(selector);

        if (link.length !== 1) {
            throw new Error("couldn't find the specified link to click on");
        }

        return this.get(link.attr('href'));
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Returns a promise for a response to the given request.
     *
     * @param hostname
     * @param request
     *
     * @return promise
     */
    dispatch: function(hostname, request) {

        var t = this;

        request.headers['user-agent'] = 'Capsela Browser';

        // add any cookies
        // todo replace with a proper cookie jar
        if (t.cookiesByHost[hostname]) {

            var cookies = t.cookiesByHost[hostname];
            var pairs = [];

            cookies.forEach(function(cookie) {
                pairs.push(cookie.name + '=' + cookie.value);
            });

            request.headers['cookie'] = pairs.join(';');
        }

        // don't emit - just log directly - to avoid confusing tests that watch the log
        t.LOG.log(Log.DEBUG, 'browser requesting ' + request.method.toUpperCase() + ' ' +
            (request.secure ? 'https://' : 'http://') + hostname + request.path);

        return this.clientDispatch(hostname, request).then(
            function(response) {

                var cookies = response.getHeader('set-cookie');
                var mediaType = response.getHeader('content-type');

                // save any cookies
                // todo replace with a proper cookie jar
                if (cookies) {
                    cookies.forEach(function(setCookie) {
                        var cookie = Cookie.fromString(setCookie);

                        if (t.cookiesByHost[hostname] == undefined) {
                            t.cookiesByHost[hostname] = [cookie];
                        }
                        else {
                            t.cookiesByHost[hostname].push(cookie);
                        }
                    });
                }

                // follow redirects

                if (t.followRedirects &&
                    [301, 302, 303].indexOf(response.statusCode) >= 0) {
                    
                    return t.get(response.getHeader('location'), response);
                }
                else {

                    // todo only buffer if the result is text/html or JSON?
                    var result = Pipe.buffer(response.getBodyStream())
                    .then(
                        function(data) {

                            // put the data on the response
                            response.data = data;

                            // update the window if we got an HTML page back
                            if (data && mediaType && mediaType.indexOf('text/html') >= 0) {

                                // create a DOM window from the response
                                return t.loadDocument(data.toString(), mediaType).then(
                                    function() {
                                        return response;
                                    },
                                    function(err) {

                                        t.log(Log.WARNING,
                                            "text/html response not a valid HTML document");

                                        t.window = {
                                            location: {},
                                            data: data.toString()
                                        };

                                        return response;
                                    }
                                );
                            }
                            else {
                                t.window = {
                                    location: {},
                                    data: data
                                };

                                return response;
                            }
                        },
                        function(err) {

                            if (err.message == 'no data received') {
                                t.window = {
                                    location: {}
                                };
                                return response;
                            }
                            else {
                                return err;
                            }
                        }
                    );

                    response.getBodyStream().resume();

                    return result;
                }
        });
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Dispatches the given request to the HTTP client.
     *
     * @param hostname
     * @param request
     *
     * @return promise  for a clientresponse
     */
    clientDispatch: function(hostname, request) {
        return new HttpClient(hostname).dispatch(request, this.timeout);
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Fills in the specified input field with the given value.
     * 
     * @param selector  name or CSS selector
     * @param value
     */
    fill: function(selector, value) {

        // get the form
        var input = this.getElement(selector);

        input.val(value);
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Checks the specified checkbox.
     *
     * @param selector
     */
    check: function(selector) {

        var input = this.getElement(selector);

        if (input.attr('type') == 'checkbox') {
            input.attr('checked', 'checked');
        }
        else {
            throw new Error(selector + " is not a checkbox");
        }
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Unchecks the specified checkbox.
     *
     * @param selector
     */
    uncheck: function(selector) {

        var input = this.getElement(selector);

        if (input.attr('type') == 'checkbox') {
            input.removeAttr('checked');
        }
        else {
            throw new Error(selector + " is not a checkbox");
        }
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Clicks the specified button.
     *
     * @param selector
     */
    pressButton: function(selector) {

        // todo this method has too much in common with get() / post() -
        // reimplement in terms of those

        var t = this;
        
        var button = this.getElement(selector);
        var form = button.parents('form');
        var method = form.attr('method') || 'GET'
        var action = resolveUrl(this.window.location.href, form.attr('action'));
        var parts = parseUrl(action);
        var multiPart = form.attr('enctype') == 'multipart/form-data';

        var headers = {
            'content-type': multiPart ? 'multipart/form-data' : 'application/x-www-form-urlencoded'
        };

        var formData;

        if (multiPart) {
            throw new Error("time to implement multipart forms");
        }
        else {
            // don't forget the button value
            formData = form.serialize() + '&' + button.attr('name') + '=' + button.val();
        }

        var request = new Request(method, parts.pathname, headers);
        var result = this.dispatch(parts.hostname, request).then(
            function(response) {

                // set the location info
                t.window.location.href = action;
                t.window.location.pathname = parts.pathname;

                return response;
            });

        // N.B. dispatch replaced the request body stream with its own
        request.getBodyStream().end(formData);

        return result;
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Returns the form element having the given name or matching the specified CSS
     * selector, or null if not found.
     * 
     * @param name  an element name or CSS selector
     */
    getElement: function(name) {

        // try matching the name
        var el = this.window.$('[name="' + name + '"]');

        if (el.length > 0) {
            return el;
        }

        // try matching button inner text
        el = this.window.$('button:contains(' + name + ')');
        
        if (el.length > 0) {
            return el;
        }

        // try matching link inner text
        el = this.window.$('a:contains(' + name + ')');

        if (el.length > 0) {
            return el;
        }

        // try matching value
        el = this.window.$('[value="' + name + '"]');

        if (el.length > 0) {
            return el;
        }

        return this.window.$(name);
    },

    ///////////////////////////////////////////////////////////////////////////////
    /**
     * Reloads the page.
     *
     * @return promise
     */
    reload: function() {
        return this.get(this.window.location.href);
    }
});

exports.Browser = Browser;