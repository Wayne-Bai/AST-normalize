'use strict'

var util = require('util'),
    evt = require('events'),
    Node = require('./Node').Node,
    geo = require('geometry'),
    Sprite = require('./Sprite').Sprite,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    ccp = geo.ccp

/**
 * @class
 * An in-memory canvas which can be drawn to in the background before drawing on screen
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.Node
 *
 * @opt {Integer} width The width of the canvas
 * @opt {Integer} height The height of the canvas
 */
function RenderTexture (opts) {
    RenderTexture.superclass.constructor.call(this, opts)

    var width = opts.width,
        height = opts.height

    evt.addPropertyListener(this, 'contentSize', 'change', this._resizeCanvas.bind(this))

    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')

    var atlas = new TextureAtlas({canvas: this.canvas})
    this.sprite = new Sprite({textureAtlas: atlas, rect: {origin: ccp(0, 0), size: {width: width, height: height}}})

    this.contentSize = geo.sizeMake(width, height)
    this.addChild(this.sprite)
    this.anchorPoint = ccp(0, 0)
    this.sprite.anchorPoint = ccp(0, 0)

}

RenderTexture.inherit(Node, /** @lends cocos.nodes.RenderTexture# */ {
    canvas: null,
    context: null,
    sprite: null,

    /**
     * @private
     */
    _resizeCanvas: function () {
        var size = this.contentSize,
            canvas = this.canvas

        canvas.width  = size.width
        canvas.height = size.height
        if (cc.FLIP_Y_AXIS) {
            this.context.scale(1, -1)
            this.context.translate(0, -canvas.height)
        }

        var s = this.sprite
        if (s) {
            s.textureRect = {rect: geo.rectMake(0, 0, size.width, size.height)}
        }
    },

    /**
     * Clear the canvas
     */
    clear: function (rect) {
        if (rect) {
            this.context.clearRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height)
        } else {
            this.canvas.width = this.canvas.width
            if (cc.FLIP_Y_AXIS) {
                this.context.scale(1, -1)
                this.context.translate(0, -this.canvas.height)
            }
        }
    }
})

module.exports.RenderTexture = RenderTexture

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
