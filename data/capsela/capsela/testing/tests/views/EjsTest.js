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
 * Date: 1/13/12
 */

"use strict";

var Ejs = require('../../../').views.Ejs;

module.exports["basics"] = {

    "test init": function(test) {

        var view = new Ejs('<div></div>');

        test.equal(view.render(), '<div></div>');

        view = new Ejs('<div>Alas, poor <%= name%></div>');
        test.equal(view.render({name: 'Yorick'}), '<div>Alas, poor Yorick</div>');

        test.equal(view.isComplete(), false);
        
        test.done();
    },

    "test bad template throws": function(test) {

        try {
            var view = new Ejs(template);
        }
        catch (err) {

            test.equal(err.message, "failed to create view: SyntaxError: Unexpected reserved word");

            test.done();
        }
    }
}

var template = '\
    <% if (classList) { %>\
<div class="classMenu">\
    <h4>Classes</h4>\
<ul class="classList">\
    <% for (var i in classList.classes) { var cls = classList.classes[i]; %>\
    <li><a href="ref:action_link:/doc/default/class=<%= cls.name %>"><%= cls.name %></a></li>\
    <% } %>\
</ul>\
</div>\
<% } %>\
\
<div class="classDetail">\
    <h2>Class <span class="className"><%= class.name %></span></h2>\
    <% if (class.extends) { var parent = class.extends; %>\
    <h3>Extends <a class="parentClass" href="ref:action_link:/doc/default/class=<%= parent %>"><%= parent %></a></h3>\
    <% } %>\
    <% if (class.desc) { var desc = class.desc; %>\
    <p>\
        <%= desc.full %>\
    </p>\
    <% } %>\
    <h3>Methods</h3>\
    <ul class="methodList">\
    {.repeated section methods}\
        <li>\
            <span class="name">{name}({.repeated section params}{name}, {.end})</span>\
            {.section static}<span class="modifier">static</span>{.end}\
            {.section isConstructor}<span class="modifier">constructor</span>{.end}\
            {.section ret}<span class="return">returns {type}</span>{.end}\
            {desc.summary}\
            {.repeated section params}\
            <p>{name}: {desc}</p>\
            {.end}\
        </li>\
    {.end}\
    </ul>\
</div>';