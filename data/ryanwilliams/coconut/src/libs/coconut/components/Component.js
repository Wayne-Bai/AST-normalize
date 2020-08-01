/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Component = BObject.extend(/** @scope coconut.components.Component# */{
    entity: null,

    /**
     * @memberOf coconut.components
     * @extends BObject
     * @constructs
     */
    init: function () {
        Component.superclass.init.call(this);
    },

    update: function (dt) {
    }
});

exports.Component = Component;
