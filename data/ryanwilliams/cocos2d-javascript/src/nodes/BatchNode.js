'use strict'

var util = require('util'),
    events = require('events'),
    geo = require('geometry'),
    ccp = geo.ccp,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    RenderTexture = require('./RenderTexture').RenderTexture,
    Node = require('./Node').Node

/**
 * @class
 * Draws all children to an in-memory canvas and only redraws when something changes
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.Node
 *
 * @opt {geometry.Size} size The size of the in-memory canvas used for drawing to
 * @opt {Boolean} [partialDraw=false] Draw only the area visible on screen. Small maps may be slower in some browsers if this is true.
 */
function BatchNode (opts) {
    BatchNode.superclass.constructor.call(this, opts)

    var size = opts.size || geo.sizeMake(1, 1)
    this.partialDraw = opts.partialDraw

    events.addPropertyListener(this, 'contentSize', 'change', this._resizeCanvas.bind(this))

    this._dirtyRects = []
    this.contentRect = geo.rectMake(0, 0, size.width, size.height)
    this.renderTexture = new RenderTexture(size)
    this.renderTexture.sprite.isRelativeAnchorPoint = false
    BatchNode.superclass.addChild.call(this, this.renderTexture)
}

BatchNode.inherit(Node, /** @lends cocos.nodes.BatchNode# */ {
    partialDraw: false,
    contentRect: null,
    renderTexture: null,
    dirty: true,

    /**
     * Region to redraw
     * @type geometry.Rect
     */
    dirtyRegion: null,
    dynamicResize: false,

    /** @private
     * Areas that need redrawing
     *
     * Not implemented
     */
    _dirtyRects: null,

    addChild: function (opts) {
        BatchNode.superclass.addChild.call(this, opts)

        var child, z

        if (opts instanceof Node) {
            child = opts
        } else {
            child = opts.child
            z     = opts.z
        }

        // TODO handle texture resize

        // Watch for changes in child
        events.addListener(child, 'drawdirty', function (oldBox) {
            if (oldBox) {
                this.addDirtyRegion(oldBox)
            }
            this.addDirtyRegion(child.boundingBox)
        }.bind(this))

        this.addDirtyRegion(child.boundingBox)
    },

    removeChild: function (opts) {
        BatchNode.superclass.removeChild.call(this, opts)

        // TODO remove isTransformDirty and visible property listeners

        this.dirty = true
    },

    addDirtyRegion: function (rect) {
        // Increase rect slightly to compensate for subpixel artefacts
        rect = new geo.Rect(Math.floor(rect.origin.x) - 1, Math.floor(rect.origin.y) - 1,
                            Math.ceil(rect.size.width) + 2 ,Math.ceil(rect.size.height) + 2)

        var region = this.dirtyRegion
        if (!region) {
            region = rect
        } else {
            region = geo.rectUnion(region, rect)
        }

        this.dirtyRegion = region
        this.dirty = true
    },

    _resizeCanvas: function (oldSize) {
        var size = this.contentSize

        if (geo.sizeEqualToSize(size, oldSize)) {
            return; // No change
        }


        this.renderTexture.contentSize = size
        this.dirty = true
    },

    update: function () {

    },

    visit: function (context) {
        if (!this.visible) {
            return
        }

        context.save()

        this.transform(context)

        var rect = this.dirtyRegion
        // Only redraw if something changed
        if (this.dirty) {

            if (rect) {
                if (this.partialDraw) {
                    // Clip region to visible area
                    var s = require('../Director').Director.sharedDirector.winSize,
                        p = this.position
                    var r = new geo.Rect(
                        0, 0,
                        s.width, s.height
                    )
                    r = geo.rectApplyAffineTransform(r, this.worldToNodeTransform())
                    rect = geo.rectIntersection(r, rect)
                }

                this.renderTexture.clear(rect)

                this.renderTexture.context.save()
                this.renderTexture.context.beginPath()
                this.renderTexture.context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height)
                this.renderTexture.context.clip()
                this.renderTexture.context.closePath()
            } else {
                this.renderTexture.clear()
            }

            for (var i = 0, childLen = this.children.length; i < childLen; i++) {
                var c = this.children[i]
                if (c == this.renderTexture) {
                    continue
                }

                // Draw children inside rect
                if (!rect || geo.rectOverlapsRect(c.boundingBox, rect)) {
                    c.visit(this.renderTexture.context, rect)
                }
            }

            if (cc.SHOW_REDRAW_REGIONS) {
                if (rect) {
                    this.renderTexture.context.beginPath()
                    this.renderTexture.context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height)
                    this.renderTexture.context.fillStyle = "rgba(0, 0, 255, 0.5)"
                    this.renderTexture.context.fill()
                    this.renderTexture.context.closePath()
                }
            }

            if (rect) {
                this.renderTexture.context.restore()
            }

            this.dirty = false
            this.dirtyRegion = null
        }

        this.renderTexture.visit(context)

        context.restore()
    },

    draw: function (ctx) {
    },

    onEnter: function () {
        BatchNode.superclass.onEnter.call(this)

        if (this.partialDraw) {
            events.addPropertyListener(this.parent, 'isTransformDirty', 'change', function () {
                var box = this.visibleRect
                this.addDirtyRegion(box)
            }.bind(this))
        }
    }
})

/**
 * @class
 * A BatchNode that accepts only Sprite using the same texture
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.BatchNode
 *
 * @opt {String} file (Optional) Path to image to use as sprite atlas
 * @opt {Texture2D} texture (Optional) Texture to use as sprite atlas
 * @opt {cocos.TextureAtlas} textureAtlas (Optional) TextureAtlas to use as sprite atlas
 */
function SpriteBatchNode (opts) {
    SpriteBatchNode.superclass.constructor.call(this, opts)

    var file         = opts.file
      , url          = opts.url
      , textureAtlas = opts.textureAtlas
      , texture      = opts.texture

    if (url || file || texture) {
        this.ready = url ? false : true
        textureAtlas = new TextureAtlas({url: url, file: file, texture: texture})

        if (!this.ready) {
            events.addListenerOnce(textureAtlas, 'load', function () {
                this.ready = true
            }.bind(this))
        }
    }

    this.textureAtlas = textureAtlas

    // FIXME This listener needs to be added/remove onEnter/onExit to avoid memory leaks
    events.addPropertyListener(this, 'opacity', 'change', function () {
        for (var i = 0, len = this.children.length; i < len; i++) {
            var child = this.children[i]
            child.opacity = this.opacity
        }
    }.bind(this))

}
SpriteBatchNode.inherit(BatchNode, /** @lends cocos.nodes.SpriteBatchNode# */ {
    textureAtlas: null,

    /**
     * @type cocos.Texture2D
     */
    get texture () {
        return this.textureAtlas ? this.textureAtlas.texture : null
    }

})

exports.BatchNode = BatchNode
exports.SpriteBatchNode = SpriteBatchNode

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
