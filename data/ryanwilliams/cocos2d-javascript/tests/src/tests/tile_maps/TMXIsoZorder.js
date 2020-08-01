'use strict'

//{{{ Imports
var util      = require('util')
  , path      = require('path')
  , cocos     = require('cocos2d')
  , geo       = require('geometry')
  , nodes     = cocos.nodes
  , actions   = cocos.actions

var TestCase    = require('./TMXTestCase')
  , Director    = cocos.Director
  , Texture2D   = cocos.Texture2D
  , TMXTiledMap = nodes.TMXTiledMap
  , Point       = geo.Point
//}}} Imports

var kTagTileMap = 1

/**
 * @class
 * Test Isographic TMX Map
 *
 * @extends TMXTestCase
 */
function TMXIsoZorder () {
    TMXIsoZorder.superclass.constructor.call(this)

    this.isMouseEnabled = true

    var  map = new TMXTiledMap({ file: path.join(__dirname, '../resources/TileMaps/iso-test-vertexz.tmx') })
      , s = map.contentSize

    map.position = new Point(-s.width / 2, 0)

    this.addChild({ child: map
                  , tag: kTagTileMap
                  , z: 0
                  })

    var layer = map.getLayer({name: 'Trees'})
      , tamara = layer.tileAt(new Point(29, 29))

    var move = new actions.MoveBy({ duration: 10, position: new Point(300, 250) })
      , back = move.reverse()
      , seq = new actions.Sequence({ actions: [move, back] })

    tamara.runAction(new actions.RepeatForever(seq))

    this.tamara = tamara
    this.schedule('repositionSprite')
}

TMXIsoZorder.inherit(TestCase, /** @lends TMXIsoZorder# */ {
    title: 'TMX Iso Zorder'
  , subtitle: 'Sprite should hide behind the trees'

  , repositionSprite: function () {
        var p = this.tamara.position
        this.tamara.parent.reorderChild({child: this.tamara, z: Math.floor(-((p.y + 32) / 16)) })
    }
})

module.exports = TMXIsoZorder

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
