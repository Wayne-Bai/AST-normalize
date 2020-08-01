'use strict'

//{{{ Imports
var util      = require('util')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions

var TestCase      = require('../TestCase')
  , Director      = cocos.Director
  , Sprite        = nodes.Sprite
//}}} Imports

/**
 * @class
 *
 * Example Sprite loading from remote URL
 */
function SpriteURL () {
    if (Director.sharedDirector.isTouchScreen) {
        this.subtitle = 'Tap screen'
    }

    SpriteURL.superclass.constructor.call(this)

    if (Director.sharedDirector.isTouchScreen) {
        this.isTouchEnabled = true
    } else {
        this.isMouseEnabled = true
    }

    var s = Director.sharedDirector.winSize
    this.addNewSprite(new geo.Point(s.width / 2, s.height / 2))
}

SpriteURL.inherit(TestCase, /** @lends SpriteURL# */ {
    title: 'Sprite URL'

  , addNewSprite: function (point) {
        var sprite = new Sprite({ url: '/public/grossini.png' })

        sprite.position = point

        this.addChild({ child: sprite, z: 0 })

    }

  , mouseUp: function (event) {
        var location = Director.sharedDirector.convertEventToCanvas(event)
        this.addNewSprite(location)

        return true
    }

  , touchesEnded: function (event) {
        var location = event.touches[0].locationInCanvas
        this.addNewSprite(location)

        return true
    }
})

module.exports = SpriteURL

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
