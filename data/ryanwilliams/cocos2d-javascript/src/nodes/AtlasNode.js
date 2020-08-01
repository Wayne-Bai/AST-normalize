'use strict'

var SpriteBatchNode = require('./BatchNode').SpriteBatchNode,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    geo   = require('geometry')

/**
 * @class
 * It knows how to render a TextureAtlas object. If you are going to
 * render a TextureAtlas consider subclassing cocos.nodes.AtlasNode (or a
 * subclass of cocos.nodes.AtlasNode)
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.SpriteBatchNode
 *
 * @opt {String} file Path to Atals image
 * @opt {Integer} itemWidth Character width
 * @opt {Integer} itemHeight Character height
 * @opt {Integer} itemsToRender Quantity of items to render
 */
function AtlasNode (opts) {
    AtlasNode.superclass.constructor.call(this, opts)

    this.itemWidth = opts.itemWidth
    this.itemHeight = opts.itemHeight

    this.textureAtlas = new TextureAtlas({file: opts.file, capacity: opts.itemsToRender})


    this._calculateMaxItems()
}

AtlasNode.inherit(SpriteBatchNode, /** @lends cocos.nodes.AtlasNode# */ {
    /**
     * Characters per row
     * @type Integer
     */
    itemsPerRow: 0,

    /**
     * Characters per column
     * @type Integer
     */
    itemsPerColumn: 0,

    /**
     * Width of a character
     * @type Integer
     */
    itemWidth: 0,

    /**
     * Height of a character
     * @type Integer
     */
    itemHeight: 0,


    /**
     * @type cocos.TextureAtlas
     */
    textureAtlas: null,

    updateAtlasValues: function () {
        throw "cocos.nodes.AtlasNode:Abstract - updateAtlasValue not overriden"
    },

    _calculateMaxItems: function () {
        var s = this.textureAtlas.texture.contentSize
        this.itemsPerColumn = s.height / this.itemHeight
        this.itemsPerRow = s.width / this.itemWidth
    }
})

exports.AtlasNode = AtlasNode

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
