'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions

var TestCase = require('./ActionTestCase')
  , Director = cocos.Director
  , Point    = geo.Point
//}}} Imports

/**
 * @class
 *
 * Manual transformation of sprites
 */
function Manual () {
    Manual.superclass.constructor.call(this)
}

Manual.inherit(TestCase, /** @lends Manual# */ {
    title: 'Manual Transformation'

  , onEnter: function () {
        Manual.superclass.onEnter.call(this)

        var s = cocos.Director.sharedDirector.winSize

        this.tamara.scaleX   = 2.5
        this.tamara.scaleY   = -1.0
        this.tamara.position = new Point(100, 70)
        this.tamara.opacity  = 128

        this.grossini.rotation = 120
        this.grossini.position = new Point(s.width / 2, s.height / 2)

        this.kathia.position = new Point(s.width - 100, s.height / 2)
    }
})

module.exports = Manual

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
