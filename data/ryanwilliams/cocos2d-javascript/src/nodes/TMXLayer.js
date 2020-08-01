'use strict'

var util = require('util')
  , uri = require('uri')
  , events = require('events')
  , SpriteBatchNode = require('./BatchNode').SpriteBatchNode
  , Sprite = require('./Sprite').Sprite
  , TMXOrientationOrtho = require('../TMXOrientation').TMXOrientationOrtho
  , TMXOrientationHex   = require('../TMXOrientation').TMXOrientationHex
  , TMXOrientationIso   = require('../TMXOrientation').TMXOrientationIso
  , geo    = require('geometry')
  , ccp    = geo.ccp
  , Node = require('./Node').Node



var FLIPPED_HORIZONTALLY_FLAG = 0x80000000
  , FLIPPED_VERTICALLY_FLAG   = 0x40000000
  , FLIPPED_DIAGONALLY_FLAG   = 0x20000000

/**
 * @class
 * A tile map layer loaded from a TMX file. This will probably automatically be made by cocos.TMXTiledMap
 *
 * @memberOf cocos.nodes
 * @extends cocos.nodes.SpriteBatchNode
 *
 * @opt {cocos.TMXTilesetInfo} tilesetInfo
 * @opt {cocos.TMXLayerInfo} layerInfo
 * @opt {cocos.TMXMapInfo} mapInfo
 */
function TMXLayer (opts) {
    var tilesetInfo = opts.tilesetInfo,
        layerInfo = opts.layerInfo,
        mapInfo = opts.mapInfo

    var size = layerInfo.layerSize,
        totalNumberOfTiles = size.width * size.height

    var tex = null
    if (tilesetInfo) {
        tex = tilesetInfo.sourceImage
    }

    if (uri.isURL(tex)) {
        TMXLayer.superclass.constructor.call(this, {url: tex})
    } else {
        TMXLayer.superclass.constructor.call(this, {file: tex})
    }


    this.anchorPoint = ccp(0, 0)

    this.layerName = layerInfo.name
    this.layerSize = layerInfo.layerSize
    this.tiles = layerInfo.tiles
    this.minGID = layerInfo.minGID
    this.maxGID = layerInfo.maxGID
    this.opacity = layerInfo.opacity
    this.properties = util.copy(layerInfo.properties)

    this.tileset = tilesetInfo
    this.mapTileSize = mapInfo.tileSize
    this.layerOrientation = mapInfo.orientation

    var offset = this.calculateLayerOffset(layerInfo.offset)
    this.position = offset

    this.contentSize = new geo.Size(this.layerSize.width * this.mapTileSize.width, (this.layerSize.height * this.mapTileSize.height) + this.tileset.tileSize.height)
}

TMXLayer.inherit(SpriteBatchNode, /** @lends cocos.nodes.TMXLayer# */ {
    layerSize: null,
    layerName: '',
    tiles: null,
    tilset: null,
    layerOrientation: 0,
    mapTileSize: null,
    properties: null,

    calculateLayerOffset: function (pos) {
        var ret = ccp(0, 0)

        switch (this.layerOrientation) {
        case TMXOrientationOrtho:
            ret = ccp(pos.x * this.mapTileSize.width, pos.y * this.mapTileSize.height)
            break
        case TMXOrientationIso:
            // TODO
            break
        case TMXOrientationHex:
            // TODO
            break
        }

        return ret
    },

    setupTiles: function () {
        if (!this.ready) {
            events.addListenerOnce(this, 'ready', this.setupTiles.bind(this))
            return
        }

        this.tileset.imageSize = this.texture.contentSize

        this.parseInternalProperties()

        for (var y = 0; y < this.layerSize.height; y++) {
            for (var x = 0; x < this.layerSize.width; x++) {

                var pos = x + this.layerSize.width * y
                  , gid = this.tiles[pos]
                  , flipH = gid & FLIPPED_HORIZONTALLY_FLAG
                  , flipV = gid & FLIPPED_VERTICALLY_FLAG
                  , flipD = gid & FLIPPED_DIAGONALLY_FLAG

                // Remove flip flags
                gid &= ~( FLIPPED_HORIZONTALLY_FLAG
                        | FLIPPED_VERTICALLY_FLAG
                        | FLIPPED_DIAGONALLY_FLAG
                        )


                if (gid !== 0) {
                    this.appendTile({ gid: gid
                                    , position: new geo.Point(x, y)
                                    , flipH: flipH
                                    , flipV: flipV
                                    , flipD: flipD
                                    })

                    // Optimization: update min and max GID rendered by the layer
                    this.minGID = Math.min(gid, this.minGID)
                    this.maxGID = Math.max(gid, this.maxGID)
                }
            }
        }
    },

    propertyNamed: function (name) {
        return this.properties[name]
    },

    parseInternalProperties: function () {
        var vertexz = this.properties.cc_vertexz

        if (vertexz) {
            if (vertexz === 'automatic') {
                this._useAutomaticVertexZ = true
            } else {
                this._vertexZvalue = parseInt(vertexz, 10)
            }
        }
    },

    appendTile: function (opts) {
        var gid = opts.gid,
            pos = opts.position

        var z = pos.x + pos.y * this.layerSize.width

        var rect = this.tileset.rectForGID(gid)
        var tile = new Sprite({rect: rect, textureAtlas: this.textureAtlas})
        tile.position = this.positionAt(pos)
        tile.opacity = this.opacity

        var anchorX = 0
          , anchorY = 0
        if (opts.flipH) {
            tile.scaleX = -1
            anchorX = 1
        }
        if (opts.flipV) {
            tile.scaleY = -1
            anchorY = 1
        }
        if (opts.flipD) {
            console.warn("Diagonal flipped tiles are unsupported")
        }

        tile.anchorPoint = new geo.Point(anchorX, anchorY)

        this.addChild({ child: tile
                      , z: this.vertexZForPos(pos)
                      , tag: z
                      })

        return tile
    },
    positionAt: function (pos) {
        switch (this.layerOrientation) {
        case TMXOrientationOrtho:
            return this.positionForOrthoAt(pos)
        case TMXOrientationIso:
            return this.positionForIsoAt(pos)
        /*
        case TMXOrientationHex:
            // TODO
        */
        default:
            return ccp(0, 0)
        }
    },

    vertexZForPos: function (pos) {
        var maxVal = 0
        if (this._useAutomaticVertexZ) {
            switch (this.layerOrientation) {
            case TMXOrientationIso:
                maxVal = this.layerSize.width + this.layerSize.height
                return -(maxVal - (pos.x + pos.y))
            case TMXOrientationOrtho:
                return -(this.layerSize.height - pos.y)
            case CCTMXOrientationHex:
                throw new Error("TMX Hexa zOrder not supported")
            default:
                throw new Error("TMX invalid value")
            }
        } else {
            return this._vertexZvalue
        }
    },

    positionForOrthoAt: function (pos) {
        var overlap = this.mapTileSize.height - this.tileset.tileSize.height
        var x = Math.floor(pos.x * this.mapTileSize.width + 0.49)
        var y
        if (cc.FLIP_Y_AXIS) {
            y = Math.floor((this.layerSize.height - pos.y - 1) * this.mapTileSize.height + 0.49)
        } else {
            y = Math.floor(pos.y * this.mapTileSize.height + 0.49) + overlap
        }
        return ccp(x, y)
    },

    positionForIsoAt: function (pos) {
        var mapTileSize = this.mapTileSize,
            layerSize = this.layerSize

        if (cc.FLIP_Y_AXIS) {
            return ccp(
                mapTileSize.width  / 2 * (layerSize.width + pos.x - pos.y - 1),
                mapTileSize.height / 2 * ((layerSize.height * 2 - pos.x - pos.y) - 2)
            )
        } else {
            throw "Isometric tiles without cc.FLIP_Y_AXIS is currently unsupported"
        }
    },

    /**
     * Get the tile at a specifix tile coordinate
     *
     * @param {geometry.Point} pos Position of tile to get in tile coordinates (not pixels)
     * @returns {cocos.nodes.Sprite} The tile
     */
    tileAt: function (pos) {
        var layerSize = this.layerSize,
            tiles = this.tiles

        if (pos.x < 0 || pos.y < 0 || pos.x >= layerSize.width || pos.y >= layerSize.height) {
            throw "TMX Layer: Invalid position"
        }

        var tile,
            gid = this.tileGIDAt(pos)

        // if GID is 0 then no tile exists at that point
        if (gid) {
            var z = pos.x + pos.y * layerSize.width
            tile = this.getChild({tag: z})
        }

        return tile
    },


    tileGID: function (pos) {
        var tilesPerRow = this.layerSize.width,
            tilePos = pos.x + (pos.y * tilesPerRow)

        return this.tiles[tilePos]
    },
    tileGIDAt: function (pos) {
        return this.tileGID(pos)
    },

    removeTile: function (pos) {
        var gid = this.tileGID(pos)
        if (gid === 0) {
            // Tile is already blank
            return
        }

        var tiles = this.tiles,
            tilesPerRow = this.layerSize.width,
            tilePos = pos.x + (pos.y * tilesPerRow)


        tiles[tilePos] = 0

        var sprite = this.getChild({tag: tilePos})
        if (sprite) {
            this.removeChild({child: sprite})
        }
    }
})

exports.TMXLayer = TMXLayer

// vim:et:st=4:fdm=marker:fdl=0:fdc=1
