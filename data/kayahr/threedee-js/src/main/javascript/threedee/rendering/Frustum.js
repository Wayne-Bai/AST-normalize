/**
 * Copyright (C) 2009-2012 Klaus Reimer <k@ailis.de>
 * See LICENSE.txt for licensing information
 * 
 * @require threedee.js
 * @use threedee/Vector.js
 * @use threedee/rendering/Plane.js
 */

/**
 * Constructs a new view frustum for the specified screen size and scale
 * factor. Optionaly you can specify the near and far clipping distance.
 * 
 * @param {number} width
 *            The screen width in pixels
 * @param {number} height
 *            The screen height in pixels
 * @param {number} scale
 *            The scale factor. This is the factor you multiply the X and Y
 *            coordinates with before dividing them by the Z coordinate to
 *            project the 3D coordinates to 2D coordinates
 * @param {number=} far
 *            The optional far clipping distance. Defaults to null which
 *            means no far clipping is performed.
 * @param {number=} near
 *            The optional near clipping distance. Defaults to 10
 *
 * @constructor
 * @class
 * A frustum.
 */
threedee.Frustum = function(width, height, scale, far, near)
{
    var xAngle, yAngle, sh, sv, ch, cv;
    
    xAngle = Math.atan2(width / 2, scale) - 0.0001;
    yAngle = Math.atan2(height / 2, scale) - 0.0001;
    sh = Math.sin(xAngle);
    sv = Math.sin(yAngle);
    ch = Math.cos(xAngle);
    cv = Math.cos(yAngle);    

    // Create the clipping planes
    this.left = new threedee.Plane(new threedee.Vector(ch, 0, sh), 0);
    this.right = new threedee.Plane(new threedee.Vector(-ch, 0, sh), 0);
    this.top = new threedee.Plane(new threedee.Vector(0, -cv, sv), 0);
    this.bottom = new threedee.Plane(new threedee.Vector(0, cv, sv), 0);
    this.near = new threedee.Plane(new threedee.Vector(0, 0, 1), -(near ? near : 10));
    if (far) this.far = new threedee.Plane(new threedee.Vector(0, 0, -1), -far);
};

/** 
 * The left plane. 
 * @private 
 * @type {!threedee.Plane} 
 */
threedee.Frustum.prototype.left;

/** 
 * The right plane. 
 * @private 
 * @type {!threedee.Plane} 
 */
threedee.Frustum.prototype.right;

/** 
 * The top plane. 
 * @private 
 * @type {!threedee.Plane} 
 */
threedee.Frustum.prototype.top;

/** 
 * The bottom plane. 
 * @private 
 * @type {!threedee.Plane} 
 */
threedee.Frustum.prototype.bottom;

/** 
 * The near plane. 
 * @private 
 * @type {!threedee.Plane} 
 */
threedee.Frustum.prototype.near;

/** 
 * The far plane. 
 * @private 
 * @type {!threedee.Plane} 
 */
threedee.Frustum.prototype.far;

/**
 * Clips the specified polygon. Returns false if polygon was completely
 * clipped away and true if it is still visible.
 * 
 * @param {threedee.RenderPolygon} polygon
 *            The polygon to clip.
 * @return {boolean} 
 *            False if polygon is still visible, true if it was completely 
 *            clipped away.
 */
threedee.Frustum.prototype.clipPolygon = function(polygon)
{
    if (polygon.clip(this.near)) return true;
    if (this.far) if (polygon.clip(this.far)) return true;
    if (polygon.clip(this.left)) return true;
    if (polygon.clip(this.right)) return true;
    if (polygon.clip(this.top)) return true;
    if (polygon.clip(this.bottom)) return true;
    return false;
};
