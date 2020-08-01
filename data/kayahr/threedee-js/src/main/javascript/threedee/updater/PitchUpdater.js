/**
 * Copyright (C) 2009-2012 Klaus Reimer <k@ailis.de>
 * See LICENSE.txt for licensing information
 * 
 * @require threedee.js
 * @require threedee/updater/NodeUpdater.js
 */

/**
 * Constructs a new pitch updater.
 * 
 * @param {number} angle
 *            The angle the node should be rotated around the X axis per
 *            second. Measured in clock-wise RAD.
 *            
 * @constructor
 * @extends {threedee.NodeUpdater}
 * @class
 * The pitch updater rotates a node around the X axis.
 */
threedee.PitchUpdater = function(angle)
{
    threedee.NodeUpdater.call(this);
    this.angle = angle;
};
threedee.inherit(threedee.PitchUpdater, threedee.NodeUpdater);

/** 
 * The rotation speed in clock-wise RAD per second.
 * @private
 * @type {number}
 */
threedee.PitchUpdater.prototype.angle;

/**
 * Returns the current angle.
 * 
 * @return {number}
 *            The angle the node is rotated around the X axis per second.
 *            Measured in clock-wise RAD.
 */
threedee.PitchUpdater.prototype.getAngle = function()
{
    return this.angle;
};

/**
 * Sets the angle.
 * 
 * @param {number} angle
 *            The angle the node should be rotated around the X axis per
 *            second. Measured in clock-wise RAD.
 */
threedee.PitchUpdater.prototype.setAngle = function(angle)
{
    this.angle = angle;
};

/**
 * @inheritDoc
 * 
 * @param {!threedee.SceneNode} node
 * @param {number} delta
 */
threedee.PitchUpdater.prototype.update = function(node, delta)
{
    // Do nothing if angle is 0
    if (this.angle == 0) return;

    node.getTransform().rotateX(this.angle * delta / 1000);
};
