/**
 * Copyright (C) 2009-2012 Klaus Reimer <k@ailis.de>
 * See LICENSE.txt for licensing information
 * 
 * @require threedee.js
 */

/**
 * Constructs a new polygon
 * 
 * @param {!Array.<number>} vertices
 *            The referenced vertices.
 * @param {?threedee.Material=} material
 *            Optional polygon-specific material. If not set then the polygon
 *            uses the material of the model.
 * @constructor
 * @class
 * A polygon.
 */

threedee.Polygon = function(vertices, material)
{
    this.vertices = vertices;
    if (material) this.material = material;
    threedee.Polygon.counter++;
};

/** 
 * Instance counter. 
 * @private 
 * @type {number} 
 */
threedee.Polygon.counter = 0;

/**
 * The referenced vertices.
 * @private
 * @type {!Array.<number>}
 */
threedee.Polygon.prototype.vertices;

/** 
 * The material used by this polygon. 
 * @private 
 * @type {?threedee.Material} 
 */
threedee.Polygon.prototype.material = null;

/**
 * Returns and resets the current instance counter.
 * 
 * @return {number} The number of created instances since the last call
 */
threedee.Polygon.count = function()
{
    var value = threedee.Polygon.counter;
    threedee.Polygon.counter = 0;
    return value;
};

/**
 * Returns the number of referenced vertices.
 * 
 * @return {number} The number of references vertices
 */
threedee.Polygon.prototype.countVertices = function()
{
    return this.vertices.length;
};

/**
 * Returns the vertex with the specified index.
 * 
 * @param {number} index
 *            The index
 * @return {number} The vertex
 */
threedee.Polygon.prototype.getVertex = function(index)
{
    return this.vertices[index];
};

/**
 * Returns the material. Returns null if this polygon is not a
 * polygon-specific material and uses the one of the model instead.
 * 
 * @return {threedee.Material} The material
 */
threedee.Polygon.prototype.getMaterial = function()
{
    return this.material;
};

/**
 * Sets the material. Set it to null to remove the polygon-specific
 * material. The model material is used then.
 * 
 * @param {threedee.Material} material
 *            The material to set
 */
threedee.Polygon.prototype.setMaterial = function(material)
{
    this.material = material;
};

/**
 * Converts the polygon into a JSON object with keys 'v' (Array with vertex
 * indices) and optionally 'm' (The polygon-specific material).
 * 
 * @return {Object} The polygon as a JSON object
 */
threedee.Polygon.prototype.toJSON = function()
{
    var data;
    
    data = { "v": this.vertices };
    if (this.material) data.m = this.material.toJSON();
    return data;
};

/**
 * Creates a new polygon instance with the data read from the
 * specified JSON object (with keys 'v' and 'm'). Returns null if data
 * was empty.
 * 
 * @param {Object} data
 *            The polygon as JSON object
 * @return {threedee.Polygon} 
 *            The polygon object or null if data was empty.
 */
threedee.Polygon.fromJSON = function(data)
{
    if (!data) return null;
    return new threedee.Polygon(
        (/** @type {!Array.<number>} */ data["v"]), 
        threedee.Material.fromJSON(data["m"]));
};
