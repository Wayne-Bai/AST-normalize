/**
 * Copyright (C) 2009-2012 Klaus Reimer <k@ailis.de>
 * See LICENSE.txt for licensing information
 * 
 * @require threedee.js
 */

/**
 * Constructs a new plane.
 * 
 * @param {!threedee.Vector} normal
 *            The plane normal.
 * @param {number} distance
 *            The plane distance.
 * @constructor
 * @class
 * A plane is an infinite two-dimensional object in space. It is defined by
 * a normal vector and a distance. If is used to specify the clipping planes
 * in the view frustum.
 */
threedee.Plane = function(normal, distance)
{
    this.normal = normal;
    this.distance = distance;
};

/** 
 * The plane normal. 
 * @private 
 * @type {!threedee.Vector} 
 */
threedee.Plane.prototype.normal;

/** 
 * The plane distance. 
 * @private 
 * @type {number} 
 */
threedee.Plane.prototype.distance;

/**
 * Returns the plane normal.
 * 
 * @return {!threedee.Vector} 
 *            The plane normal
 */
threedee.Plane.prototype.getNormal = function()
{
    return this.normal;
};

/**
 * Returns the plane distance
 * 
 * @return {number} 
 *             The plane distance
 */
threedee.Plane.prototype.getDistance = function()
{
    return this.distance;
};
