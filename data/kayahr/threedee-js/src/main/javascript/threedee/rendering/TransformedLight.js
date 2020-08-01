/**
 * Copyright (C) 2009-2012 Klaus Reimer <k@ailis.de>
 * See LICENSE.txt for licensing information
 * 
 * @require threedee.js
 * @use threedee/Vector.js
 */

/**
 * Constructs a new transformed light
 * 
 * @param {!threedee.Light} light
 *            The light
 * @param {!threedee.Matrix} transform
 *            The transformation matrix
 *            
 * @constructor
 * @class A transformed light
 */
threedee.TransformedLight = function(light, transform)
{
    this.light = light;
    this.position = new threedee.Vector().transform(transform);
};

/** 
 * The light. 
 * @private 
 * @type {!threedee.Light} 
 */
threedee.TransformedLight.prototype.light;

/** 
 * The light position. 
 * @private 
 * @type {!threedee.Vector} 
 */
threedee.TransformedLight.prototype.position;

/**
 * Returns the light.
 * 
 * @return {!threedee.Light} light
 *            The light
 */
threedee.TransformedLight.prototype.getLight = function()
{
    return this.light;
};

/**
 * Returns the position
 * 
 * @return {!threedee.Vector} 
 *            The light position
 */
threedee.TransformedLight.prototype.getPosition = function()
{
    return this.position;
};
