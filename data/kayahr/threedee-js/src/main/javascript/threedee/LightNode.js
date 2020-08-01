/**
 * Copyright (C) 2009-2012 Klaus Reimer <k@ailis.de>
 * See LICENSE.txt for licensing information
 * 
 * @require threedee.js
 * @require threedee/SceneNode.js
 */

/**
 * Constructs a new light node.
 * 
 * @param {!threedee.Light} light
 *            The light
 *            
 * @constructor
 * @extends {threedee.SceneNode}
 * @class 
 * A node which positions a light in the scene.
 */

threedee.LightNode = function(light)
{
    threedee.SceneNode.call(this);
    this.light = light;
};
threedee.inherit(threedee.LightNode, threedee.SceneNode);

/** 
 * The light. 
 * @private 
 * @type {!threedee.Light} 
 */
threedee.LightNode.prototype.light;

/**
 * @inheritDoc
 * 
 * @param {!threedee.PolygonBuffer} buffer
 * @param {!threedee.Matrix} transform
 */
threedee.LightNode.prototype.render = function(buffer, transform)
{
    buffer.addLight(this.light, transform);
};
