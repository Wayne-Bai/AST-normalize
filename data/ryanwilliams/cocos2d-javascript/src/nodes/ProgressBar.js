'use strict'

var Node   = require('./Node').Node,
    util   = require('util'),
    geo    = require('geometry'),
    events = require('events'),
    Sprite = require('./Sprite').Sprite

/**
 * @class
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.Node
 */
function ProgressBar (opts) {
    ProgressBar.superclass.constructor.call(this, opts)
    var size = new geo.Size(272, 32)
    this.contentSize = size
    this.anchorPoint = new geo.Point(0.5, 0.5)

    var s
    if (opts.emptyImage) {
        s = new Sprite({file: opts.emptyImage, rect: new geo.Rect(0, 0, size.width, size.height)})
        s.anchorPoint = new geo.Point(0, 0)
        this.emptySprite = s
        this.addChild({child: s})
    }
    if (opts.fullImage) {
        s = new Sprite({file: opts.fullImage, rect: new geo.Rect(0, 0, 0, size.height)})
        s.anchorPoint = new geo.Point(0, 0)
        this.fullSprite = s
        this.addChild({child: s})
    }

    events.addPropertyListener(this, 'maxValue', 'change', this.updateImages.bind(this))
    events.addPropertyListener(this, 'value',    'change', this.updateImages.bind(this))

    this.updateImages()
}

ProgressBar.inherit(Node, /** @lends cocos.nodes.ProgressBar# */ {
    emptySprite: null,
    fullSprite: null,
    maxValue: 100,
    value: 0,

    updateImages: function () {
        var empty = this.emptySprite,
            full  = this.fullSprite,
            value = this.value,
            size  = this.contentSize,
            maxValue = this.maxValue,
            ratio = (value / maxValue)

        var diff = Math.round(size.width * ratio)
        if (diff === 0) {
            full.visible = false
        } else {
            full.visible = true
            full.rect = new geo.Rect(0, 0, diff, size.height)
            full.contentSize = new geo.Size(diff, size.height)
        }

        if ((size.width - diff) === 0) {
            empty.visible = false
        } else {
            empty.visible = true
            empty.rect = new geo.Rect(diff, 0, size.width - diff, size.height)
            empty.position = new geo.Point(diff, 0)
            empty.contentSize = new geo.Size(size.width - diff, size.height)
        }
    }
})

exports.ProgressBar = ProgressBar

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
