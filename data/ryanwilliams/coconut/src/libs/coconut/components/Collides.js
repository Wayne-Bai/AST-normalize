/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Component = require('./Component').Component,
    events = require('events'),
    util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp;

var Collides = Component.extend(/** @scope coconut.components.Collides# */{
    collisionMap: null,

    /**
     * @memberOf coconut.components
     * @extends coconut.components.Component
     * @constructs
     */
    init: function (opts) {
        Collides.superclass.init.call(this, opts);

        events.addListener(this, 'entity_changed', util.callback(this, this.updateBindings));
    },

    updateBindings: function () {
        // If entity changed remove the previous listener
        if (this._entityWorldListener) {
            events.removeListener(this._entityWorldListener);
            delete this._entityWorldListener;
        }

        var e = this.get('entity');
        if (!e) {
            return;
        }

        // Listen for world changes on entity
        this._entityWorldListener = events.addListener(e, 'world_changed', util.callback(this, this.updateBindings));

        // Reference to the velocity of the entity
        this.bindTo('velocity', e);

        var w = e.get('world');

        if (!w) {
            return;
        }


        // FIXME - HACK! Assuming first entity is the map
        this.set('collisionMap', w.entities.getAt(0));
    },

    update: function (dt) {

        var ent = this.entity,
            pos = ent.get('position'),
            ap  = ent.get('anchorPointInPixels'),
            prevPos = ent.get('previousPosition'),
            distance = geo.ccpSub(pos, prevPos);

        var newPos = ccp(prevPos.x, prevPos.y);

        var tileSize = 16; // FIXME get from map

        var grounded = false;
        function checkCollisionStep(dist, newPos) {
            // Get velocity so we can reduce it on collision
            var velocity = this.get('velocity'),
                tileX, tileY, newX, newY;

            if (dist.x > 0) {
                // Walking right
                tileX = false;

                newX = newPos.x + dist.x;
                if ((tileX = this.collisionYEdge(ccp(newX + ent.contentSize.width + 1, newPos.y))) !== false) {
                    dist.x = 0;
                    newPos.x = (tileX * tileSize) - ent.contentSize.width + ap.x; // Move to the edge of the tile
                    velocity.x = 0;
                } else {
                    newPos.x = newX;
                }

            } else if (dist.x < 0) {
                // Walking left
                tileX = false;

                newX = newPos.x + dist.x;
                if ((tileX = this.collisionYEdge(ccp(newX, newPos.y))) !== false) {
                    dist.x = 0;
                    newPos.x = (tileX + 1) * tileSize + ap.x; // Move to the edge of the tile
                    velocity.x = 0;
                } else {
                    newPos.x = newX;
                }
            }


            if (dist.y > 0) {
                // Falling down
                tileY = false;

                newY = newPos.y + dist.y;
                if ((tileY = this.collisionXEdge(ccp(newPos.x, newY + ent.contentSize.height + 1))) !== false) {
                    grounded = true;
                    newPos.y = (tileY * tileSize) - ent.contentSize.height + ap.y; // Move to the edge of the tile
                    velocity.y = 0;
                } else {
                    newPos.y = newY;
                }
            } else if (dist.y < 0) {
                // Jumping up
                tileY = false;

                newY = newPos.y + dist.y;
                // Hit head?
                if ((tileY = this.collisionXEdge(ccp(newPos.x, newY))) !== false) {
                    newPos.y = (tileY + 1) * tileSize + ap.y; // Move to the edge of the tile
                    velocity.y = 0;
                } else {
                    newPos.y = newY;
                }
            }

            ent.set('grounded', grounded);

            // Update velocity which is bound to the entity
            this.set('velocity', velocity);
        }


        // Do mulitple collision checks if moving at a high speed
        var d = ccp(0, 0),
            step = tileSize / 1.5;
        while (distance.x !== 0 || distance.y !== 0) {

            if (distance.x > 0) {
                d.x = (distance.x > step) ? step : distance.x;
            } else if (distance.x < 0) {
                d.x = (distance.x < -step) ? -step : distance.x;
            } else {
                d.x = 0;
            }
            distance.x -= d.x;

            if (distance.y > 0) {
                d.y = (distance.y > step) ? step : distance.y;
            } else if (distance.y < 0) {
                d.y = (distance.y < -step) ? -step : distance.y;
            } else {
                d.y = 0;
            }
            distance.y -= d.y;

            checkCollisionStep.call(this, d, newPos);
            ent.set('position', newPos);
        }

    },

    collisionYEdge: function (point) {
        var ent = this.entity,
            ap  = ent.get('anchorPointInPixels'),
            w = ent.contentSize.width,
            h = ent.contentSize.height,
            x = point.x - ap.x,
            y = point.y - ap.y;

        var tileSize = 16; // TODO get from map

        var tilePixelsY = y - (y % tileSize);   // Find tile Y position in pixels
        var bottomEdge = y + h - 1;      // How far to measure to


        // Coordinates in map space
        var tileX = Math.floor(x / tileSize);
        var tileY = Math.floor(tilePixelsY / tileSize);

        while (tilePixelsY <= bottomEdge) {
            if (this.get('collisionMap').isSolidTile(ccp(tileX, tileY))) {
                return tileX;
            }

            tileY++;
            tilePixelsY += tileSize;
        }

        return false;
    },

    collisionXEdge: function (point) {
        var ent = this.entity,
            ap  = ent.get('anchorPointInPixels'),
            w = ent.contentSize.width,
            h = ent.contentSize.height,
            x = point.x - ap.x,
            y = point.y - ap.y;

        var tileSize = 16; // TODO get from map

        var tilePixelsX = x - (x % tileSize);   // Find tile X position in pixels
        var rightEdge = x + w - 1;      // How far to measure to

        // Coordinates in map space
        var tileX = Math.floor(tilePixelsX / tileSize);
        var tileY = Math.floor(y / tileSize);


        while (tilePixelsX <= rightEdge) {
            if (this.collisionMap.isSolidTile(ccp(tileX, tileY))) {
                return tileY;
            }

            tileX++;
            tilePixelsX += tileSize;
        }

        return false;
    }
});

exports.Collides = Collides;
