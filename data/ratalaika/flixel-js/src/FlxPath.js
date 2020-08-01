/**
 * This is a simple path data container.  Basically a list of points that<br>
 * a <code>FlxObject</code> can follow.  Also has code for drawing debug visuals.<br>
 * <code>FlxTilemap.findPath()</code> returns a path object, but you can<br>
 * also just make your own, using the <code>add()</code> functions below<br>
 * or by creating your own array of points.<br>
 * <br>
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	Adam Atomic
 * @author	ratalaika / ratalaikaGames
 * @class Flixel.FlxPath
 */

/**
 * Instantiate a new path object.
 * 
 * @param Nodes
 *            Optional, can specify all the points for the path up front if you want.
 * @constructor
 */
Flixel.FlxPath = function(Nodes)
{
	if (Nodes === null || Nodes === undefined)
		this.nodes = [];
	else
		this.nodes = Nodes;

	this._point = new Flixel.FlxPoint();
	this.debugScrollFactor = new Flixel.FlxPoint(1.0, 1.0);
	this.debugColor = Flixel.FlxG.WHITE;
	this.ignoreDrawDebug = false;

	var debugPathDisplay = Flixel.FlxPath.getManager();

	if (debugPathDisplay !== null)
		debugPathDisplay.add(this);
};

/**
 * The list of <code>FlxPoint</code>s that make up the path data.
 */
Flixel.FlxPath.prototype.nodes = null;
/**
 * Specify a debug display color for the path. Default is white.
 */
Flixel.FlxPath.prototype.debugColor = 0;
/**
 * Specify a debug display scroll factor for the path. Default is (1,1). NOTE: does not affect world movement! Object scroll factors take care of that.
 */
Flixel.FlxPath.prototype.debugScrollFactor = null;
/**
 * Setting this to true will prevent the object from appearing when the visual debug mode in the debugger overlay is toggled on.
 * 
 * @default false
 */
Flixel.FlxPath.prototype.ignoreDrawDebug = false;
/**
 * Internal helper for keeping new variable instantiations under control.
 */
Flixel.FlxPath.prototype._point = null;

/**
 * Clean up memory.
 */
Flixel.FlxPath.prototype.destroy = function()
{
	var debugPathDisplay = Flixel.FlxPath.getManager();
	if (debugPathDisplay !== null)
		debugPathDisplay.remove(this);

	this.debugScrollFactor = null;
	this._point = null;
	this.nodes = null;
};

/**
 * Add a new node to the end of the path at the specified location.
 * 
 * @param X
 *            X position of the new path point in world coordinates.
 * @param Y
 *            Y position of the new path point in world coordinates.
 */
Flixel.FlxPath.prototype.add = function(X, Y)
{
	this.nodes.push(new Flixel.FlxPoint(X, Y));
};

/**
 * Add a new node to the path at the specified location and index within the path.
 * 
 * @param XX
 *            position of the new path point in world coordinates.
 * @param YY
 *            position of the new path point in world coordinates.
 * @param Index
 *            Where within the list of path nodes to insert this new point.
 */
Flixel.FlxPath.prototype.addAt = function(X, Y, Index)
{
	if (Index > this.nodes.length)
		Index = this.nodes.length;
	this.nodes.splice(Index, 0, new Flixel.FlxPoint(X, Y));
};

/**
 * Sometimes its easier or faster to just pass a point object instead of separate X and Y coordinates. This also gives you the option of not creating a new node but actually adding that specific
 * <code>FlxPoint</code> object to the path. This allows you to do neat things, like dynamic paths.
 * 
 * @param Node
 *            The point in world coordinates you want to add to the path.
 * @param AsReferenceWhether
 *            to add the point as a reference, or to create a new point with the specified values.
 */
Flixel.FlxPath.prototype.addPoint = function(Node, AsReference)
{
	if (AsReference)
		this.nodes.push(Node);
	else
		this.nodes.push(new Flixel.FlxPoint(Node.x, Node.y));
};

/**
 * Sometimes its easier or faster to just pass a point object instead of separate X and Y coordinates. This also gives you the option of not creating a new node but actually adding that specific
 * <code>FlxPoint</code> object to the path. This allows you to do neat things, like dynamic paths.
 * 
 * @param Node
 *            The point in world coordinates you want to add to the path.
 * @param Index
 *            Where within the list of path nodes to insert this new point.
 * @param AsReferenceWhether
 *            to add the point as a reference, or to create a new point with the specified values.
 */
Flixel.FlxPath.prototype.addPointAt = function(Node, Index, AsReference)
{
	if (Index > this.nodes.length)
		Index = this.nodes.length;
	if (AsReference)
		this.nodes.splice(Index, 0, Node);
	else
		this.nodes.splice(Index, 0, new Flixel.FlxPoint(Node.x, Node.y));
};

/**
 * Remove a node from the path. NOTE: only works with points added by reference or with references from <code>nodes</code> itself!
 * 
 * @param Node
 *            The point object you want to remove from the path.
 * 
 * @return The node that was excised. Returns null if the node was not found.
 */
Flixel.FlxPath.prototype.remove = function(Node)
{
	var index = this.nodes.indexOf(Node);
	if (index >= 0)
		return this.nodes.splice(index, 1)[0];
	else
		return null;
};

/**
 * Remove a node from the path using the specified position in the list of path nodes.
 * 
 * @param Index
 *            Where within the list of path nodes you want to remove a node.
 * 
 * @return The node that was excised. Returns null if there were no nodes in the path.
 */
Flixel.FlxPath.prototype.removeAt = function(Index)
{
	if (this.nodes.length <= 0)
		return null;
	if (Index >= this.nodes.length)
		Index = this.nodes.length - 1;
	return this.nodes.splice(Index, 1)[0];
};

/**
 * Get the first node in the list.
 * 
 * @return The first node in the path.
 */
Flixel.FlxPath.prototype.head = function()
{
	if (this.nodes.length > 0)
		return this.nodes[0];
	return null;
};

/**
 * Get the last node in the list.
 * 
 * @return The last node in the path.
 */
Flixel.FlxPath.prototype.tail = function()
{
	if (this.nodes.length > 0)
		return this.nodes[this.nodes.length - 1];
	return null;
};

/**
 * While this doesn't override <code>FlxBasic.drawDebug()</code>, the behavior is very similar. Based on this path data, it draws a simple lines-and-boxes representation of the path if the visual
 * debug mode was toggled in the debugger overlay. You can use <code>debugColor</code> and <code>debugScrollFactor</code> to control the path's appearance.
 * 
 * @param CameraThe
 *            camera object the path will draw to.
 */
Flixel.FlxPath.prototype.drawDebug = function(Camera)
{
	if (this.nodes.length <= 0)
		return;
	if (Camera === null || Camera === undefined)
		Camera = Flixel.FlxG.camera;

	// Set up our global flash graphics object to draw out the path
	var gfx = Flixel.FlxG.flashGfx;
	gfx.clearRect(0, 0, Flixel.FlxG.flashGfxSprite.width, Flixel.FlxG.flashGfxSprite.height);

	// Then fill up the object with node and path graphics
	var node;
	var nextNode;
	var i = 0;
	var l = this.nodes.length;
	while (i < l) {
		gfx.beginPath();
		// get a reference to the current node
		node = this.nodes[i];

		// find the screen position of the node on this camera
		this._point.x = node.x - int(Camera.scroll.x * this.debugScrollFactor.x); // copied from getScreenXY()
		this._point.y = node.y - int(Camera.scroll.y * this.debugScrollFactor.y);
		this._point.x = int(this._point.x + ((this._point.x > 0) ? 0.0000001 : -0.0000001));
		this._point.y = int(this._point.y + ((this._point.y > 0) ? 0.0000001 : -0.0000001));

		// decide what color this node should be
		var nodeSize = 2;
		if ((i === 0) || (i == l - 1))
			nodeSize *= 2;
		var nodeColor = Flixel.FlxG.GREEN;
		if (l > 1) {
			if (i === 0)
				nodeColor = Flixel.FlxG.GREEN;
			else if (i == l - 1)
				nodeColor = Flixel.FlxG.RED;
		}

		// draw a box for the node
		gfx.fillStyle = BitmapData.makeRGBA(Flixel.FlxU.addAlphaToColor(nodeColor, 1));
		gfx.fillRect(this._point.x - nodeSize * 0.5, this._point.y - nodeSize * 0.5, nodeSize, nodeSize);

		// then find the next node in the path
		var linealpha = 1;
		if (i < l - 1)
			nextNode = this.nodes[i + 1];
		else {
			nextNode = this.nodes[0];
			linealpha = 0.35;
		}

		// then draw a line to the next node
		gfx.moveTo(this._point.x, this._point.y);

		gfx.lineWidth = 1;
		gfx.strokeStyle = BitmapData.makeRGBA(this.debugColor, linealpha);

		this._point.x = nextNode.x - int(Camera.scroll.x * this.debugScrollFactor.x); // copied from getScreenXY()
		this._point.y = nextNode.y - int(Camera.scroll.y * this.debugScrollFactor.y);
		this._point.x = int(this._point.x + ((this._point.x > 0) ? 0.0000001 : -0.0000001));
		this._point.y = int(this._point.y + ((this._point.y > 0) ? 0.0000001 : -0.0000001));
		gfx.lineTo(this._point.x, this._point.y);

		i++;
		
		gfx.stroke();
	}

	// Then stamp the path down onto the game buffer
	Camera.buffer.copyPixels(Flixel.FlxG.flashGfxSprite, new Flixel.FlxRect(0, 0, Flixel.FlxG.flashGfxSprite.width, Flixel.FlxG.flashGfxSprite.height), new Flixel.FlxPoint(0, 0));
};

/**
 * Returns the path debug display manager.
 */
Flixel.FlxPath.getManager = function()
{
	return Flixel.FlxG.getPlugin(Flixel.plugin.DebugPathDisplay);
};

/**
 * Returns the class name.
 */
Flixel.FlxPath.prototype.toString = function()
{
	return "FlxPath";
};