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
        return 'default default action called';
    },

    // collides with test1 controller default action - should be unreachable
    test1Action: function() {
        return 'default test1 action called';
    },

    // collides with test1 controller default action - should be unreachable
    hitMeAction: function() {
        return 'default hitMe action called';
    }
});

exports.Controller = Controller;
