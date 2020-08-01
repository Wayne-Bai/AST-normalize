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
  , Blink    = actions.Blink
//}}} Imports

/**
 * @class
 * Blink actions test
 *
 * @extends ActionTestCase
 */
function BlinkTest () {
    BlinkTest.superclass.constructor.call(this)
}

BlinkTest.inherit(TestCase, /** @lends BlinkTest# */ {
    title: 'Blink'

  , onEnter: function () {
        BlinkTest.superclass.onEnter.call(this)

        this.centerSprites(3)

        this.tamara.runAction(new Blink({ duration: 2, blinks: 10 }))
        this.kathia.runAction(new Blink({ duration: 2, blinks: 5 }))
        this.grossini.runAction(new Blink({ duration: 0.5, blinks: 5 }))
    }
})

module.exports = BlinkTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
