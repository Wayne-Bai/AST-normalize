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
  , RotateTo = actions.RotateTo
  , Sequence = actions.Sequence
  , Repeat   = actions.Repeat
  , RepeatForever = actions.RepeatForever
//}}} Imports

/**
 * @class
 */
function RotateJerkTest () {
    RotateJerkTest.superclass.constructor.call(this)
}

RotateJerkTest.inherit(TestCase, /** @lends RotateJerkTest# */ {
    title: 'RepeatForever / Repeat + RotateTo'
  , subtitle: 'You should see smooth movements'

  , onEnter: function () {
        RotateJerkTest.superclass.onEnter.call(this)

        this.centerSprites(2)

        var seq = new Sequence({ actions: [ new RotateTo({ duration: 0.5, angle :-20 })
                                          , new RotateTo({ duration: 0.5, angle: 20 })
                                          ] })
        var rep1 = new Repeat({ action: seq, times: 10 })
          , rep2 = new RepeatForever(seq)

        this.tamara.runAction(rep1)
        this.kathia.runAction(rep2)
    }
})

module.exports = RotateJerkTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
