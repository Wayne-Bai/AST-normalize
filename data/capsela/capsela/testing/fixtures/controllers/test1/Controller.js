/*!
 * Copyright (C) 2011 by the Capsela contributors
 * All rights reserved.
 *
 * Author: Seth Purcell
 * Date: 12/9/11
 */

"use strict";

var Class = require('capsela-util').Class;

var Controller = Class.extend({

},
{
    defaultAction: function() {
        return 'test1 default action called';
    },

    viewAction: function() {
        return 'called view!';
    },

    editAction: function() {
        return 'called edit!';
    },

    utility: function() {
        return 'oh no!';
    }
});

exports.Controller = Controller;
