/**
 * This is the basic game "state" object - e.g. in a simple game<br>
 * you might have a menu state and a play state.<br>
 * It is for all intents and purpose a fancy FlxGroup.<br>
 * And really, it's not even that fancy.<br>
 * <br>
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	Adam Atomic
 * @author	ratalaika / ratalaikaGames
 * @class Flixel.FlxState
 */

/**
 * Internal constructor, shoudn't be called.
 * @constructor
 */
Flixel.FlxState = function()
{
	Flixel.FlxState.parent.constructor.apply(this);
};
extend(Flixel.FlxState, Flixel.FlxGroup);

/**
 * If the state is saved or not in the stack.
 */
Flixel.FlxState.saveState = true;

/**
 * This function is called after the game engine successfully switches states. Override this function, NOT the constructor, to initialize or set up your game state. We do NOT recommend overriding the
 * constructor, unless you want some crazy unpredictable things to happen!
 */
Flixel.FlxState.prototype.create = function()
{
};

/**
 * Override this function to do special pre-processing FX like motion blur. You can use scaling or blending modes or whatever you want against <code>FlxState.screen</code> to achieve all sorts of
 * cool FX.
 */
Flixel.FlxState.prototype.preProcess = function()
{
	// Nothing to pre-process initially.
};

/**
 * This function collides <code>defaultGroup</code> against <code>defaultGroup</code> (basically everything you added to this state).
 */
Flixel.FlxState.prototype.collide = function()
{
	Flixel.FlxG.collide(this);
};

/**
 * Override this function to do special post-processing FX like light bloom. You can use scaling or blending modes or whatever you want against <code>FlxState.screen</code> to achieve all sorts of
 * cool FX.
 */
Flixel.FlxState.prototype.postProcess = function()
{
	// Nothing to post process initially
};

/**
 * Returns the class name.
 */
Flixel.FlxState.prototype.toString = function()
{
	return "FlxState";
};