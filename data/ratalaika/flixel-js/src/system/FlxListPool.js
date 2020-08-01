/**
 * The pool that returns an instance of the FlxList.
 * 
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	ratalaika / ratalaikaGames
 * @class Flixel.system.FlxListPool
 */
 
/**
 * Class constructor.
 */
Flixel.system.FlxListPool = function(StartSize)
{
	Flixel.system.FlxListPool.parent.constructor.apply(this, [StartSize]);
};
extend(Flixel.system.FlxListPool, Flixel.plugin.FlxObjectPool);

/**
 * Overridden create method.
 * 
 * @returns {Flixel.system.FlxList}
 */
Flixel.system.FlxListPool.prototype.create = function()
{
	return new Flixel.system.FlxList();
};