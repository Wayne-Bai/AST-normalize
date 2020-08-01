/**
 * This class manages a stack of states used in order to allow<br>
 * a stack trace. This will be useful so the back key in Android<br>
 * devices act as a real back key.<br>
 * <br>
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	ratalaika / ratalaikaGames
 */

/**
 * Class constructor.
 */
Flixel.plugin.FlxStateStack = function()
{
	this._stateStack = [];
	this._currentMode = Flixel.plugin.FlxStateStack.NORMAL;
};

/**
 * The back key act as in the normal Android devices.
 */
Flixel.plugin.FlxStateStack.NORMAL = 0x0;
/**
 * The normal mode of the back key. Go to the previous state.
 */
// Flixel.plugin.FlxStateStack.DIRECT_BACK = 0x01;
/**
 * The back key pause the game first, and then go to the previous state.
 */
Flixel.plugin.FlxStateStack.PAUSE_GAME = 0x02;
/**
 * The back key is disabled.
 */
Flixel.plugin.FlxStateStack.DISABLED = 0x03;
/**
 * The back mode (Used for the Android Back Key).
 */
Flixel.plugin.FlxStateStack.prototype._currentMode = 0;
/**
 * The state stack.
 */
Flixel.plugin.FlxStateStack.prototype._stateStack = null;

/**
 * Get the current mode of the back key.
 */
Flixel.plugin.FlxStateStack.prototype.getBackKeyMode = function()
{
	return this._currentMode;
};

/**
 * Set the back key mode.
 */
Flixel.plugin.FlxStateStack.prototype.setBackKeyMode = function(mode)
{
	this._currentMode = mode;
};

/**
 * Push a new state in the stack.
 */
Flixel.plugin.FlxStateStack.prototype.pushState = function(state)
{
	var testState = new state.constructor();

	if (testState instanceof Flixel.FlxState) {
		this._stateStack.push(state);
	} else {
		Flixel.FlxG.log("ERROR: " + Flixel.FlxU.getClassName(testState, true) + " must extend Flxstate in order to be used in a FlxStateStack.");
	}
};

/**
 * Push a new state in the stack.
 */
Flixel.plugin.FlxStateStack.prototype.popState = function()
{
	return this._stateStack.pop();
};

/**
 * Returns the size of the stack.
 */
Flixel.plugin.FlxStateStack.prototype.size = function()
{
	return this._stateStack.length;
};

/**
 * Clear the state stack.
 */
Flixel.plugin.FlxStateStack.prototype.clear = function()
{
	this._stateStack.length = 0;
};