/**
 * Class to handle a Digital Pad in the screen.
 * This Digital Pad will help the character to move and thing's like that.
 * 
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	ratalaika / ratalaikaGames
 */

/**
 * DPad class constructor.
 * 
 * @param X
 *            The x-pos on screen.
 * @param Y
 *            The y-pos on screen.
 */
Flixel.system.input.pads.FlxDigitalPad = function(X, Y)
{
	this.x = X;
	this.y = Y;
	this._terminated = false;
	this._map = {};

	// BASE
	var base = new Flixel.FlxSprite(X, Y);
	base.loadGraphic(Flixel.data.FlxSystemAsset.dpad[4]);
	base.setSolid(false);
	base.immovable = true;
	// _container.add(base);

	// Button UP
	var up = new Flixel.system.input.pads.FlxPadButton();
	up.loadGraphic(Flixel.data.FlxSystemAsset.dpad[0]);
	up.setSolid(false);
	up.immovable = true;
	up.x = X + (base.width / 2) - (up.width / 2);
	up.y = Y - up.height;
	up.setAlpha(0.75);
	this.add(up);
	this.addButton("UP", up);

	// Button RIGHT
	var right = new Flixel.system.input.pads.FlxPadButton();
	right.loadGraphic(Flixel.data.FlxSystemAsset.dpad[3]);
	right.setSolid(false);
	right.immovable = true;
	right.x = X + base.width - right.width;
	right.y = Y - (base.height / 2) + right.width - right.height;
	right.setAlpha(0.75);
	this.add(right);
	this.addButton("RIGHT", right);

	// Button DOWN
	var down = new Flixel.system.input.pads.FlxPadButton();
	down.loadGraphic(Flixel.data.FlxSystemAsset.dpad[1]);
	down.setSolid(false);
	down.immovable = true;
	down.x = X + (base.width / 2) - (down.width / 2);
	down.y = Y - base.height;
	down.setAlpha(0.75);
	this.add(down);
	this.addButton("DOWN", down);

	// Button LEFT
	var left = new Flixel.system.input.pads.FlxPadButton();
	left.loadGraphic(Flixel.data.FlxSystemAsset.dpad[2]);
	left.setSolid(false);
	left.immovable = true;
	left.x = X;
	left.y = Y - (base.height / 2) + left.width - left.height;
	left.setAlpha(0.75);
	this.add(left);
	this.addButton("LEFT", left);
};
extend(Flixel.system.input.pads.FlxDigitalPad, Flixel.system.input.pads.FlxGamePad);

/**
 * Overridden function of the DPad, this function will update all the DPad buttons.
 * This will only happen if the DPad is visible, not terminated and the game is not paused.
 */
Flixel.system.input.pads.FlxDigitalPad.prototype.update = function()
{		
	if(this.visible && !Flixel.FlxG.getPause() && !this._terminated) {
		Flixel.system.input.pads.FlxDigitalPad.parent.update.apply(this);
	}
};

/**
 * Check if any of the DPad keys has been pressed.
 * @param name	Key Name
 * @return 
 */
Flixel.system.input.pads.FlxDigitalPad.prototype.pressed = function(name)
{
	if (this._map[name]) {
		return this._map[name].status == Flixel.system.input.pads.FlxPadButton.STATUS_PRESSED;
	}
	return false;
};

/**
 * Check if any of the DPad keys has been just touched.
 * @param name	Key Name
 * @return 
 */
Flixel.system.input.pads.FlxDigitalPad.prototype.justTouching = function(name)
{
	if (this._map[name]) {
		return this._map[name].status == Flixel.system.input.pads.FlxPadButton.STATUS_JUST_PRESSED;
	}
	return false;
};

/**
 * Check if any of the DPad keys has been just removed.
 * @param name	Key Name
 * @return 
 */
Flixel.system.input.pads.FlxDigitalPad.prototype.justRemoved = function(name)
{
	if (this._map[name]) {
		return this._map[name].status == Flixel.system.input.pads.FlxPadButton.STATUS_JUST_RELEASED;
	}
	return false;
};

/**
 * Add the button to the FlxGroup container
 * 
 * @param ButtonName	String name of the key (e.g. "LEFT" or "A")
 * @param Button		The Button instance.
 */
Flixel.system.input.pads.FlxDigitalPad.prototype.addButton = function(ButtonName, Button)
{
	this._map[ButtonName] = Button;
};

/**
 * Show all the DPad buttons.
 */
Flixel.system.input.pads.FlxDigitalPad.prototype.show = function()
{
	this.visible = true;
	for (var i = 0; i < this.members.length; i++) {
		this.members[i].active = true;
	}
};

/**
 * Hide all the DPad buttons.
 */
Flixel.system.input.pads.FlxDigitalPad.prototype.hide = function()
{
	this.visible = false;
	for (var i = 0; i < this.members.length; i++) {
		this.members[i].active = false;
	}
};

/**
 * Terminate the whole DPad.
 */
Flixel.system.input.pads.FlxDigitalPad.prototype.terminate = function()
{
	this._terminated = true;
	for (var i = 0; i < this.members.length; i++) {
		this.members[i].destroy();
	}
	delete this._map;
};

/**
 * Tells the caller if the DPad should be instanced again.
 * @return If the DPad should be instanced again.
 */
Flixel.system.input.pads.FlxDigitalPad.prototype.isTerminated = function()
{
	return this._terminated;
};

/**
 * {@inheritDoc}
 */
Flixel.system.input.pads.FlxDigitalPad.prototype.setAlpha = function(alpha)
{
	for (var i = 0; i < this.members.length; i++) {
		this.members[i].setAlpha(alpha);
	}
};