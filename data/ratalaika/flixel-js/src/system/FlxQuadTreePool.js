/**
 * The pool that returns an instance of the FlxQuadTree.
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	ratalaika / ratalaikaGames
 * @class Flixel.system.FlxQuadTreePool
 */

/**
 * Class constructor.
 */
Flixel.system.FlxQuadTreePool = function(StartSize)
{
	Flixel.system.FlxQuadTreePool.parent.constructor.apply(this, [StartSize]);
};
extend(Flixel.system.FlxQuadTreePool, Flixel.plugin.FlxObjectPool);

/**
 * Overridden create method.
 * 
 * @returns {Flixel.system.FlxQuadTree}
 */
Flixel.system.FlxQuadTreePool.prototype.create = function()
{
	return new Flixel.system.FlxQuadTree();
};