'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions

var TestCase      = require('./ActionTestCase')
  , Director      = cocos.Director
  , Point         = geo.Point
  , BezierConfig  = geo.BezierConfig
  , BezierTo      = actions.BezierTo
  , BezierBy      = actions.BezierBy
  , Sequence      = actions.Sequence
  , RepeatForever = actions.RepeatForever
//}}} Imports

/**
 * @class
 *
 * BezierTo and BezierBy actions
 */
function Bezier () {
    Bezier.superclass.constructor.call(this)
}

Bezier.inherit(TestCase, /** @lends Bezier# */ {
    title: 'BezierTo / BezierBy'

  , onEnter: function () {
        Bezier.superclass.onEnter.call(this)

        var s = cocos.Director.sharedDirector.winSize

        var bezier = new BezierConfig()
        bezier.controlPoint1 = new Point(0,   s.height  / 2)
        bezier.controlPoint2 = new Point(300, -s.height / 2)
        bezier.endPosition   = new Point(300, 100)

        var bezierForward = new BezierBy({ duration: 3, bezier: bezier })
          , bezierBack = bezierForward.reverse()
          , seq = new Sequence({ actions: [bezierForward, bezierBack] })
          , rep = new RepeatForever(seq)

        this.tamara.position = new Point(80, 160)
        var bezier2 = new BezierConfig()
        bezier2.controlPoint1 = new Point(100, s.height  / 2)
        bezier2.controlPoint2 = new Point(200, -s.height / 2)
        bezier2.endPosition   = new Point(240, 160)

        var bezierTo1 = new BezierTo({ duration: 2, bezier: bezier2 })

        this.kathia.position = new Point(400, 160)
        var bezierTo2 = new BezierTo({ duration: 2, bezier: bezier2 })

        this.grossini.runAction(rep)
        this.tamara.runAction(bezierTo1)
        this.kathia.runAction(bezierTo2)

    }
})

module.exports = Bezier

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
