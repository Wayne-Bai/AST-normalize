'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions

var TestCase  = require('./ActionTestCase')
  , Director  = cocos.Director
  , Scheduler = cocos.Scheduler
  , Point     = geo.Point
  , RotateBy  = actions.RotateBy
  , JumpBy    = actions.JumpBy
  , Spawn     = actions.Spawn
  , Speed     = actions.Speed
  , Sequence  = actions.Sequence
  , RepeatForever = actions.RepeatForever
//}}} Imports

var kTagAction1 = 1

/**
 * @class
 */
function SpeedTest () {
    SpeedTest.superclass.constructor.call(this)
}

SpeedTest.inherit(TestCase, /** @lends SpeedTest# */ {
    title: 'Speed'

  , onEnter: function () {
        SpeedTest.superclass.onEnter.call(this)

        var s = cocos.Director.sharedDirector.winSize

        this.alignSpritesLeft(3)
        // rotate and jump
        var jump1   = new JumpBy({ duration: 4, delta: new Point(-s.width + 80, 0), height: 100, jumps: 4 })
          , jump2   = jump1.reverse()
          , rot1    = new RotateBy({ duration: 4, angle: 720 })
          , rot2    = rot1.reverse()
          , seq3_1  = new Sequence({ actions: [jump2, jump1] })
          , seq3_2  = new Sequence({ actions: [rot1, rot2] })
          , spawn   = new Spawn({ one: seq3_1, two: seq3_2 })
          , action  = new Speed({ action: new RepeatForever(spawn), speed: 1.0 })
        action.tag = kTagAction1

        var action2 = action.copy()
        var action3 = action.copy()
        action2.tag = kTagAction1
        action3.tag = kTagAction1

        this.grossini.runAction(action2)
        this.tamara.runAction(action3)
        this.kathia.runAction(action)

        Scheduler.sharedScheduler.schedule({ target: this
                                           , method: 'update'
                                           , interval: 1.0
                                           , paused: !this.isRunning
                                           })
    }

  , update: function (t) {
        var action1 = this.grossini.getAction({ tag: kTagAction1 })
          , action2 = this.tamara.getAction({ tag: kTagAction1 })
          , action3 = this.kathia.getAction({ tag: kTagAction1 })

        action1.speed = Math.random() * 2
        action2.speed = Math.random() * 2
        action3.speed = Math.random() * 2
    }
})

module.exports = SpeedTest

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
