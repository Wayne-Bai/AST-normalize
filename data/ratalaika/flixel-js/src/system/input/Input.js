/**
 * Basic input class that manages the fast-access Booleans and detailed key-state tracking.
 * Keyboard extends this with actual specific key data.
 * 
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	Adam Atomic
 * @author	ratalaika / ratalaikaGames
 * @class Flixel.system.input.Input
 */

/**
 * Constructor.
 */
Flixel.system.input.Input = function()
{
	this._lookup = {};
	this._map = new Array(this._total);
};

/**
 * @private
 */
Flixel.system.input.Input.prototype._lookup = null;
/**
 * @private
 */
Flixel.system.input.Input.prototype._map = null;
/**
 * @private
 */
Flixel.system.input.Input.prototype._total = 256;

/**
 * Updates the key states (for tracking just pressed, just released, etc).
 */
Flixel.system.input.Input.prototype.update = function()
{
	var i = 0;
	while(i < this._total)
	{
		var o = this._map[i++];
		if(o === undefined) continue;
		if((o.last == -1) && (o.current == -1)) o.current = 0;
		else if((o.last == 2) && (o.current == 2)) o.current = 1;
		o.last = o.current;
	}
};

/**
 * Resets all the keys.
 */
Flixel.system.input.Input.prototype.reset = function()
{
	var i = 0;
	while(i < this._total)
	{
		var o = this._map[i++];
		if(o === undefined) continue;
		this[o.name] = false;
		o.current = 0;
		o.last = 0;
	}
};

/**
 * Check to see if this key is pressed.
 * 
 * @param	Key		One of the key constants listed above (e.g. "LEFT" or "A").
 * 
 * @return	Whether the key is pressed
 */
Flixel.system.input.Input.prototype.pressed = function(Key) { return this[Key]; };

/**
 * Check to see if this key was just pressed.
 * 
 * @param	Key		One of the key constants listed above (e.g. "LEFT" or "A").
 * 
 * @return	Whether the key was just pressed
 */
Flixel.system.input.Input.prototype.justPressed = function(Key) { return this._map[this._lookup[Key]].current == 2; };

/**
 * Check to see if this key is just released.
 * 
 * @param	Key		One of the key constants listed above (e.g. "LEFT" or "A").
 * 
 * @return	Whether the key is just released.
 */
Flixel.system.input.Input.prototype.justReleased = function(Key) { return this._map[this._lookup[Key]].current == -1; };

/**
 * If any keys are not "released" (0),
 * this function will return an array indicating
 * which keys are pressed and what state they are in.
 * 
 * @return	An array of key state data.  Null if there is no data.
 */
Flixel.system.input.Input.prototype.record = function()
{
	var data = null;
	var i = 0;
	while(i < this._total)
	{
		var o = this._map[i++];
		if((o === undefined) || (o.current === 0))
			continue;
		if(data === undefined)
			data = [];
		data.push({code: i-1, value: o.current});
	}
	return data;
};

/**
 * Part of the keystroke recording system.
 * Takes data about key presses and sets it into array.
 * 
 * @param	Record	Array of data about key states.
 */
Flixel.system.input.Input.prototype.playback = function(Record)
{
	var i = 0;
	var l = Record.length;
	var o;
	var o2;
	while(i < l)
	{
		o = Record[i++];
		o2 = this._map[o.code];
		o2.current = o.value;
		if(o.value > 0)
			this[o2.name] = true;
	}
};

/**
 * Look up the key code for any given string name of the key or button.
 * 
 * @param	KeyName		The <code>String</code> name of the key.
 * 
 * @return	The key code for that key.
 */
Flixel.system.input.Input.prototype.getKeyCode = function(KeyName)
{
	return this._lookup[KeyName];
};

/**
 * Check to see if any keys are pressed right now.
 * 
 * @return	Whether any keys are currently pressed.
 */
Flixel.system.input.Input.prototype.any = function()
{
	var i = 0;
	while(i < this._total)
	{
		var o = this._map[i++];
		if((o !== null) && (o.current > 0))
			return true;
	}
	return false;
};

/**
 * An internal helper function used to build the key array.
 * 
 * @param	KeyName		String name of the key (e.g. "LEFT" or "A")
 * @param	KeyCode		The numeric Flash code for this key.
 */
Flixel.system.input.Input.prototype.addKey = function(KeyName, KeyCode)
{
	this._lookup[KeyName] = KeyCode;
	this._map[KeyCode] = { name: KeyName, current: 0, last: 0 };
};

/**
 * Clean up memory.
 */
Flixel.system.input.Input.prototype.destroy = function()
{
	this._lookup = null;
	this._map = null;
};