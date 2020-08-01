'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions
  , ccp       = geo.ccp

var TestCase = require('../TestCase')
  , Director = cocos.Director
  , SpriteFrameCache = cocos.SpriteFrameCache
  , Rect     = geo.Rect
  , Sprite   = nodes.Sprite
  , Node     = nodes.Node
//}}} Imports

/**
 * @class
 *
 * Example Sprite Anchor Point
 */
function SpriteChildrenAnchorPoint () {
    SpriteChildrenAnchorPoint.superclass.constructor.call(this)

    var s = Director.sharedDirector.winSize

    var frameCache = SpriteFrameCache.sharedSpriteFrameCache

    frameCache.addSpriteFrames({ file: path.join(__dirname, '../resources/animations/grossini.plist') })

    var parent = new Node
    this.addChild({ child: parent, z: 0 })

    var point, sprite1, sprite2, sprite3, sprite4

    this.sprites = []
    this.points = []

    // anchor (0,0)
    this.sprites[0] = sprite1 = new Sprite({ frameName: 'grossini_dance_08.png' })
    sprite1.position = ccp(s.width / 4, s.height / 2)
    sprite1.anchorPoint = ccp(0,0);

    sprite2 = new Sprite({ frameName: 'grossini_dance_02.png' })
    sprite2.position = ccp(20, 30)

    sprite3 = new Sprite({ frameName: 'grossini_dance_03.png' })
    sprite3.position = ccp(-20, 30)

    sprite4 = new Sprite({ frameName: 'grossini_dance_04.png' })
    sprite4.position = ccp(0, 0)
    sprite4.scale = 0.5

    parent.addChild(sprite1)
    sprite1.addChild({ child: sprite2, z: -2 })
    sprite1.addChild({ child: sprite3, z: -2 })
    sprite1.addChild({ child: sprite4, z: 3  })

    this.points[0] = point = new Sprite({ file: path.join(__dirname, '../resources/r1.png') })
    point.scale = 0.25
    point.position = sprite1.position
    this.addChild({ child: point, z: 10 })


    // anchor (0.5, 0.5)
    this.sprites[1] = sprite1 = new Sprite({ frameName: 'grossini_dance_08.png' })
    sprite1.position = ccp(s.width / 2, s.height / 2)
    sprite1.anchorPoint = ccp(0.5, 0.5);

    sprite2 = new Sprite({ frameName: 'grossini_dance_02.png' })
    sprite2.position = ccp(20, 30)

    sprite3 = new Sprite({ frameName: 'grossini_dance_03.png' })
    sprite3.position = ccp(-20, 30)

    sprite4 = new Sprite({ frameName: 'grossini_dance_04.png' })
    sprite4.position = ccp(0, 0)
    sprite4.scale = 0.5

    parent.addChild(sprite1)
    sprite1.addChild({ child: sprite2, z: -2 })
    sprite1.addChild({ child: sprite3, z: -2 })
    sprite1.addChild({ child: sprite4, z: 3  })

    this.points[1] = point = new Sprite({ file: path.join(__dirname, '../resources/r1.png') })
    point.scale = 0.25
    point.position = sprite1.position
    this.addChild({ child: point, z: 10 })


    // anchor (1, 1)
    this.sprites[2] = sprite1 = new Sprite({ frameName: 'grossini_dance_08.png' })
    sprite1.position = ccp(s.width / 2 + s.width / 4, s.height / 2)
    sprite1.anchorPoint = ccp(1, 1);

    sprite2 = new Sprite({ frameName: 'grossini_dance_02.png' })
    sprite2.position = ccp(20, 30)

    sprite3 = new Sprite({ frameName: 'grossini_dance_03.png' })
    sprite3.position = ccp(-20, 30)

    sprite4 = new Sprite({ frameName: 'grossini_dance_04.png' })
    sprite4.position = ccp(0, 0)
    sprite4.scale = 0.5

    parent.addChild(sprite1)
    sprite1.addChild({ child: sprite2, z: -2 })
    sprite1.addChild({ child: sprite3, z: -2 })
    sprite1.addChild({ child: sprite4, z: 3  })

    this.points[2] = point = new Sprite({ file: path.join(__dirname, '../resources/r1.png') })
    point.scale = 0.25
    point.position = sprite1.position
    this.addChild({ child: point, z: 10 })
}

SpriteChildrenAnchorPoint.inherit(TestCase, /** @lends SpriteChildrenAnchorPoint# */ {
    title: 'Sprite: children + anchor'

  , adjustPositions: function () {
        SpriteChildrenAnchorPoint.superclass.adjustPositions.call(this)
        var s = Director.sharedDirector.winSize

        this.points[0].position = this.sprites[0].position = ccp(s.width / 4, s.height / 2)
        this.points[1].position = this.sprites[1].position = ccp(s.width / 2, s.height / 2)
        this.points[2].position = this.sprites[2].position = ccp(s.width / 2 + s.width / 4, s.height / 2)
  }
})

module.exports = SpriteChildrenAnchorPoint

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
