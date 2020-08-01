/**
 * Copyright (C) 2009-2012 Klaus Reimer <k@ailis.de>
 * See LICENSE.txt for licensing information
 * 
 * @require threedee.js
 */

/**
 * Constructs new render options.
 *            
 * @constructor
 * @class The render options
 */
threedee.RenderOptions = function()
{
    // Empty
};

/** 
 * If normals should be displayed. 
 * @type {boolean} 
 */
threedee.RenderOptions.prototype.displayNormals = false;

/** 
 * If lighting is enabled. 
 * @type {boolean} 
 */
threedee.RenderOptions.prototype.lighting = true;

/** 
 * If polygons should be filled. 
 * @type {boolean} 
 */
threedee.RenderOptions.prototype.solid = true;

/** 
 * If backface culling should be performed. 
 * @type {boolean} 
 */
threedee.RenderOptions.prototype.backfaceCulling = true;

/** 
 * If Z-sorting should be performed. 
 * @type {boolean} 
 */
threedee.RenderOptions.prototype.sortZ = true;

/** 
 * If frames/s info should be gathered. 
 * @type {boolean} 
 */
threedee.RenderOptions.prototype.fpsInfo = false;

/** 
 * If debugging info should be gathered. 
 * @type {boolean} 
 */
threedee.RenderOptions.prototype.debugInfo = false;

/** 
 * If outline should be rendered when filling polygons. 
 * @type {boolean} 
 */
threedee.RenderOptions.prototype.outline = true;

/** 
 * The outline color (null=fill color). 
 * @type {?string} 
 */
threedee.RenderOptions.prototype.outlineColor = null;
