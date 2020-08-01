/**
 * Helper class for the new replay system.  Represents all the game inputs for one "frame" or "step" of the game loop.
 * 
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	Adam Atomic
 * @author	ratalaika / ratalaikaGames
 * @class Flixel.system.replay.FrameRecord
 */
/**
 * Instantiate array new frame record.
 */
Flixel.system.replay.FrameRecord = function()
{
	this.frame = 0;
	this.keys = null;
	this.mouse = null;
};

/**
 * Which frame of the game loop this record is from or for.
 */
Flixel.system.replay.FrameRecord.prototype.frame = 0;
/**
 * An array of simple integer pairs referring to what key is pressed, and what state its in.
 */
Flixel.system.replay.FrameRecord.prototype.keys = null;
/**
 * A container for the 4 mouse state integers.
 */
Flixel.system.replay.FrameRecord.prototype.mouse = null;

/**
 * Load this frame record with input data from the input managers.
 * 
 * @param Frame
 *            What frame it is.
 * @param Keys
 *            Keyboard data from the keyboard manager.
 * @param Mouse
 *            Mouse data from the mouse manager.
 * 
 * @return A reference to this <code>FrameRecord</code> object.
 * 
 */
Flixel.system.replay.FrameRecord.prototype.create = function(Frame, Keys, Mouse)
{
	this.frame = Frame;
	this.keys = Keys;
	this.mouse = Mouse;
	return this;
};

/**
 * Clean up memory.
 */
Flixel.system.replay.FrameRecord.prototype.destroy = function()
{
	this.keys = null;
	this.mouse = null;
};

/**
 * Save the frame record data to array simple ASCII string.
 * 
 * @return A <code>String</code> object containing the relevant frame record data.
 */
Flixel.system.replay.FrameRecord.prototype.save = function()
{
	var output = this.frame + "k";

	if (this.keys !== null) {
		var object;
		var i = 0;
		var l = this.keys.length;
		while (i < l) {
			if (i > 0)
				output += ",";
			object = this.keys[i++];
			output += object.code + ":" + object.value;
		}
	}

	output += "m";
	if (this.mouse !== null)
		output += this.mouse.x + "," + this.mouse.y + "," + this.mouse.button + "," + this.mouse.wheel;

	return output;
};

/**
 * Load the frame record data from array simple ASCII string.
 * 
 * @param Data
 *            A <code>String</code> object containing the relevant frame record data.
 */
Flixel.system.replay.FrameRecord.prototype.load = function(Data)
{
	var i;
	var l;

	// get frame number
	var array = Data.split("k");
	this.frame = Number(array[0]);

	// split up keyboard and mouse data
	array = array[1].split("m");
	var keyData = array[0];
	var mouseData = array[1];

	// parse keyboard data
	if (keyData.length > 0) {
		// get keystroke data pairs
		array = keyData.split(",");

		// go through each data pair and enter it into this frame's key state
		var keyPair;
		i = 0;
		l = array.length;
		while (i < l) {
			keyPair = array[i++].split(":");
			if (keyPair.length == 2) {
				if (this.keys === null)
					this.keys = [];
				this.keys.push({ code : Number(keyPair[0]), value : Number(keyPair[1]) });
			}
		}
	}

	// mouse data is just 4 integers, easy peezy
	if (mouseData.length > 0) {
		array = mouseData.split(",");
		if (array.length >= 4)
			this.mouse = new Flixel.system.replay.MouseRecord(Number(array[0]), Number(array[1]), Number(array[2]), Number(array[3]));
	}

	return this;
};