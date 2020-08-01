'use strict'

var cocos    = require('cocos2d')
  , path     = require('path')
  , nodes    = cocos.nodes
  , geo      = require('geometry')

var TestCase = require('../TestCase')
  , Sprite   = nodes.Sprite
  , Rect     = geo.Rect
  , Point    = geo.Point

var kTagTileMap = 1

var kTagSprite1 = 1
  , kTagSprite2 = 2
  , kTagSprite3 = 3

function ActionTestCase () {
    ActionTestCase.superclass.constructor.call(this)

    this.isMouseEnabled = true

    this.grossini = new Sprite({ file: path.join(__dirname, '../resources/grossini.png')
                               , rect: new Rect(0, 0, 85, 121)
                               })

    this.tamara = new Sprite({ file: path.join(__dirname, '../resources/grossinis_sister1.png')
                             , rect: new Rect(0, 0, 52, 139)
                             })

    this.kathia = new Sprite({ file: path.join(__dirname, '../resources/grossinis_sister2.png')
                             , rect: new Rect(0, 0, 56, 138)
                             })

    var s = cocos.Director.sharedDirector.winSize

    this.grossini.position = new Point(s.width / 2, s.height / 3)
    this.tamara.position   = new Point(s.width / 2, 2 * s.height / 3)
    this.kathia.position   = new Point(s.width / 2, s.height / 2)

    this.addChild({ child: this.grossini
                  , tag: kTagSprite1
                  , z: 1
                  })
    this.addChild({ child: this.tamara
                  , tag: kTagSprite2
                  , z: 2
                  })
    this.addChild({ child: this.kathia
                  , tag: kTagSprite3
                  , z: 3
                  })
}

ActionTestCase.inherit(TestCase, /** @lends ActionTestCase# */ {
    /**
     * @type cocos.nodes.Sprite
     */
    grossini: null

    /**
     * @type cocos.nodes.Sprite
     */
  , tamara: null

    /**
     * @type cocos.nodes.Sprite
     */
  , kathia: null

  , alignSpritesLeft: function (numSprites) {
        var s = cocos.Director.sharedDirector.winSize

        switch (numSprites) {
        case 1:
            this.tamara.visible    = false
            this.kathia.visible    = false
            this.grossini.position = new Point(60, s.height / 2)
            break

        case 2:
            this.kathia.position  = new Point(60, s.height / 3)
            this.tamara.position  = new Point(60, 2 * s.height / 3)
            this.grossini.visible = false
            break

        case 3:
            this.grossini.position = new Point(60, s.height / 2)
            this.tamara.position   = new Point(60, 2 * s.height / 3)
            this.kathia.position   = new Point(60, s.height / 3)
            break
        }
    }

  , centerSprites: function (numSprites) {
        var s = cocos.Director.sharedDirector.winSize

        switch (numSprites) {
        case 1:
            this.tamara.visible    = false
            this.kathia.visible    = false
            this.grossini.position = new Point(s.width / 2, s.height / 2)
            break

        case 2:

            this.kathia.position  = new Point(s.width / 3, s.height / 2)
            this.tamara.position  = new Point(2 * s.width / 3, s.height / 2)
            this.grossini.visible = false
            break

        case 3:
            this.grossini.position = new Point(s.width / 2, s.height / 2)
            this.tamara.position   = new Point(2 * s.width / 3, s.height / 2)
            this.kathia.position   = new Point(s.width / 3, s.height / 2)
            break
        }
    }

  , addNewSprite: function (point, tag) {
        var idx = Math.floor(Math.random() * 1400 / 100)
          , x = (idx % 5) * 85
          , y = (idx % 3) * 121

        var sprite = new Sprite({ file: path.join(__dirname, '../resources/grossini_dance_atlas.png')
                                , rect: new Rect(x, y, 85, 121)
                                })

        this.addChild({ child: sprite
                      , tag: tag
                      , z: 0
                      })

        sprite.position = new Point(point.x, point.y)

        return sprite
    }
})

module.exports = ActionTestCase

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
