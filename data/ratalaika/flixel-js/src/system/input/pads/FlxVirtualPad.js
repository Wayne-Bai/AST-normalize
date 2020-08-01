/**
 * A gamepad which contains 4 directional buttons and 4 action buttons.<br>
 * It's easy to set the callbacks and to customize the layout.<br>
 * <br>
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	ratalaika / ratalaikaGames
 */
/**
 * Create a gamepad which contains 4 directional buttons and 4 action buttons.
 * 
 * @param DPad
 *            The D-Pad mode. FlxVirtualPad.FULL for example.
 * @param Action
 *            The action buttons mode. FlxVirtualPad.A_B_C for example.
 */
Flixel.system.input.pads.FlxVirtualPad = function(DPad, Action)
{
	this.dPad = new Flixel.FlxGroup();
	this.actions = new Flixel.FlxGroup();

	switch (DPad) {
		case Flixel.system.input.pads.FlxVirtualPad.DPAD_FULL:
			this.dPad.add(this.add(this.buttonUp = this.createButton(35, Flixel.FlxG.height - 99, 29, 36, Flixel.data.FlxSystemAsset.ImgButtonUp)));
			this.dPad.add(this.add(this.buttonLeft = this.createButton(0, Flixel.FlxG.height - 64, 35, 29, Flixel.data.FlxSystemAsset.ImgButtonLeft)));
			this.dPad.add(this.add(this.buttonRight = this.createButton(64, Flixel.FlxG.height - 64, 35, 29, Flixel.data.FlxSystemAsset.ImgButtonRight)));
			this.dPad.add(this.add(this.buttonDown = this.createButton(35, Flixel.FlxG.height - 39, 29, 39, Flixel.data.FlxSystemAsset.ImgButtonDown)));
			this.dPad.add(this.add(this.createCenter(this.buttonLeft.x + this.buttonLeft.width, Flixel.FlxG.height - 65, 29, 27, Flixel.data.FlxSystemAsset.ImgCenter)));
			break;
		case Flixel.system.input.pads.FlxVirtualPad.UP_DOWN:
			this.dPad.add(this.add(this.buttonUp = this.createButton(35, Flixel.FlxG.height - 101, 29, 36, Flixel.data.FlxSystemAsset.ImgButtonUp)));
			this.dPad.add(this.add(this.buttonDown = this.createButton(35, Flixel.FlxG.height - 39, 29, 39, Flixel.data.FlxSystemAsset.ImgButtonDown)));
			this.dPad.add(this.add(this.createCenter(35, Flixel.FlxG.height - 66, 29, 27, Flixel.data.FlxSystemAsset.ImgCenter)));
			break;
		case Flixel.system.input.pads.FlxVirtualPad.LEFT_RIGHT:
			this.dPad.add(this.add(this.buttonLeft = this.createButton(0, Flixel.FlxG.height - 44, 35, 29, Flixel.data.FlxSystemAsset.ImgButtonLeft)));
			this.dPad.add(this.add(this.buttonRight = this.createButton(64, Flixel.FlxG.height - 44, 35, 29, Flixel.data.FlxSystemAsset.ImgButtonRight)));
			this.dPad.add(this.add(this.createCenter(this.buttonLeft.x + this.buttonLeft.width, Flixel.FlxG.height - 45, 29, 27, Flixel.data.FlxSystemAsset.ImgCenter)));
			break;
		case Flixel.system.input.pads.FlxVirtualPad.UP_LEFT_RIGHT:
			this.dPad.add(this.add(this.buttonUp = this.createButton(35, Flixel.FlxG.height - 79, 29, 36, Flixel.data.FlxSystemAsset.ImgButtonUp)));
			this.dPad.add(this.add(this.buttonLeft = this.createButton(0, Flixel.FlxG.height - 44, 35, 29, Flixel.data.FlxSystemAsset.ImgButtonLeft)));
			this.dPad.add(this.add(this.buttonRight = this.createButton(64, Flixel.FlxG.height - 44, 35, 29, Flixel.data.FlxSystemAsset.ImgButtonRight)));
			this.dPad.add(this.add(this.createCenter(this.buttonLeft.x + this.buttonLeft.width, Flixel.FlxG.height - 45, 29, 27, Flixel.data.FlxSystemAsset.ImgCenter)));
			break;
		default:
			break;
	}

	switch (Action) {
		case Flixel.system.input.pads.FlxVirtualPad.A:
			this.actions.add(this.add(this.buttonA = this.createButton(Flixel.FlxG.width - 50, Flixel.FlxG.height - 68, 37, 37, Flixel.data.FlxSystemAsset.ImgButtonA)));
			break;
		case Flixel.system.input.pads.FlxVirtualPad.A_B:
			this.actions.add(this.add(this.buttonB = this.createButton(Flixel.FlxG.width - 68, Flixel.FlxG.height - 41, 37, 37, Flixel.data.FlxSystemAsset.ImgButtonB)));
			this.actions.add(this.add(this.buttonA = this.createButton(Flixel.FlxG.width - 37, Flixel.FlxG.height - 72, 37, 37, Flixel.data.FlxSystemAsset.ImgButtonA)));
			break;
		case Flixel.system.input.pads.FlxVirtualPad.A_B_C:
			this.actions.add(this.add(this.buttonA = this.createButton(Flixel.FlxG.width - 99, Flixel.FlxG.height - 41, 37, 37, Flixel.data.FlxSystemAsset.ImgButtonA)));
			this.actions.add(this.add(this.buttonB = this.createButton(Flixel.FlxG.width - 68, Flixel.FlxG.height - 62, 37, 37, Flixel.data.FlxSystemAsset.ImgButtonB)));
			this.actions.add(this.add(this.buttonC = this.createButton(Flixel.FlxG.width - 37, Flixel.FlxG.height - 83, 37, 37, Flixel.data.FlxSystemAsset.ImgButtonC)));
			break;
		case Flixel.system.input.pads.FlxVirtualPad.A_B_X_Y:
			this.actions.add(this.add(this.buttonY = this.createButton(Flixel.FlxG.width - 99, Flixel.FlxG.height - 72, 37, 37, Flixel.data.FlxSystemAsset.ImgButtonY)));
			this.actions.add(this.add(this.buttonX = this.createButton(Flixel.FlxG.width - 68, Flixel.FlxG.height - 103, 37, 37, Flixel.data.FlxSystemAsset.ImgButtonX)));
			this.actions.add(this.add(this.buttonB = this.createButton(Flixel.FlxG.width - 68, Flixel.FlxG.height - 41, 37, 37, Flixel.data.FlxSystemAsset.ImgButtonB)));
			this.actions.add(this.add(this.buttonA = this.createButton(Flixel.FlxG.width - 37, Flixel.FlxG.height - 72, 37, 37, Flixel.data.FlxSystemAsset.ImgButtonA)));
			break;
		case Flixel.system.input.pads.FlxVirtualPad.B:
			this.actions.add(this.add(this.buttonB = this.createButton(Flixel.FlxG.width - 50, Flixel.FlxG.height - 68, 37, 37, Flixel.data.FlxSystemAsset.ImgButtonB)));
			break;
		default:
			break;
	}
};
extend(Flixel.system.input.pads.FlxVirtualPad, Flixel.FlxGroup);

/**
 * Don't use any directional button.
 */
Flixel.system.input.pads.FlxVirtualPad.DPAD_NONE = 0;
/**
 * Use the set of 4 directions or A, B, X, and Y.
 */
Flixel.system.input.pads.FlxVirtualPad.DPAD_FULL = 1;
/**
 * Use UP and DOWN direction buttons.
 */
Flixel.system.input.pads.FlxVirtualPad.UP_DOWN = 2;
/**
 * Use LEFT and RIGHT direction buttons.
 */
Flixel.system.input.pads.FlxVirtualPad.LEFT_RIGHT = 3;
/**
 * Use UP, LEFT and RIGHT direction buttons.
 */
Flixel.system.input.pads.FlxVirtualPad.UP_LEFT_RIGHT = 4;
/**
 * Don't use any action buttons.
 */
Flixel.system.input.pads.FlxVirtualPad.ACTION_NONE = 0;
/**
 * Use only A button.
 */
Flixel.system.input.pads.FlxVirtualPad.A = 1;
/**
 * Use A and B button.
 */
Flixel.system.input.pads.FlxVirtualPad.A_B = 2;
/**
 * Use A, B and C button.
 */
Flixel.system.input.pads.FlxVirtualPad.A_B_C = 3;
/**
 * Use A, B, X and Y button.
 */
Flixel.system.input.pads.FlxVirtualPad.A_B_X_Y = 4;
/**
 * Use only B button.
 */
Flixel.system.input.pads.FlxVirtualPad.B = 5;

/**
 * Button A
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.buttonA = null;
/**
 * Button B
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.buttonB = null;
/**
 * Button C
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.buttonC = null;
/**
 * Button Y
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.buttonY = null;
/**
 * Button X
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.buttonX = null;
/**
 * Button LEFT DIRECTION
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.buttonLeft = null;
/**
 * Button UP DIRECTION
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.buttonUp = null;
/**
 * Button RIGHT DIRECTION
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.buttonRight = null;
/**
 * BUTTON DOWN DIRECTION
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.buttonDown = null;
/**
 * Group of directions buttons.
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.dPad = null;
/**
 * Group of action buttons.
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.actions = null;

/**
 * Overridden destroy method.
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.destroy = function()
{
	Flixel.system.input.pads.FlxVirtualPad.parent.destroy.apply(this);
	if (this.dPad !== null)
		this.dPad.destroy();
	if (this.actions !== null)
		this.actions.destroy();
	this.dPad = this.actions = null;
	this.buttonA = this.buttonB = this.buttonC = this.buttonY = this.buttonX = null;
	this.buttonLeft = this.buttonUp = this.buttonDown = this.buttonRight = null;
};

/**
 * Creates a button
 * 
 * @param X
 *            The x-position of the button.
 * @param Y
 *            The y-position of the button.
 * @param Width
 *            The width of the button.
 * @param Height
 *            The height of the button.
 * @param Image
 *            The image of the button. It must contains 3 frames (NORMAL, HIGHLIGHT, PRESSED).
 * @param Callback
 *            The callback for the button.
 * @return The button.
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.createButton = function(X, Y, Width, Height, Image)
{
	var button = new Flixel.system.input.pads.FlxPadButton(X, Y);
	button.loadGraphic(Image, true, false, Width, Height);
	button.setSolid(false);
	button.immovable = true;
	button.ignoreDrawDebug = true;
	button.scrollFactor.x = button.scrollFactor.y = 0;
	return button;
};

Flixel.system.input.pads.FlxVirtualPad.prototype.createCenter = function(X, Y, Width, Height, Image)
{
	var center = new Flixel.FlxSprite(X, Y).loadGraphic(Image, false, false, Width, Height);
	center.setSolid(false);
	center.immovable = true;
	center.ignoreDrawDebug = true;
	center.scrollFactor.x = center.scrollFactor.y = 0;
	return center;
};

/**
 * Set <code>alpha</code> to a number between 0 and 1 to change the opacity of the gamepad.
 * 
 * @param Alpha
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.setAlpha = function(Alpha)
{
	for (var i = 0; i < this.members.length; i++) {
		this.members[i].setAlpha(Alpha);
	}
};

/**
 * Set the offset position of the D-PAD.
 * 
 * @param X
 *            The x-offset
 * @param Y
 *            The y-offset
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.setDPadPosition = function(X, Y)
{
	for (var i = 0; i < this.dPad.members.length; i++) {
		this.dPad.members[i].x += X;
		this.dPad.members[i].y += Y;
	}
};

/**
 * Set the x-offset position of the D-PAD.
 * 
 * @param X
 *            The x-offset
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.setDPadPositionX = function(X)
{
	for (var i = 0; i < this.dPad.members.length; i++)
		this.dPad.members[i].x += X;
};

/**
 * Set the y-offset position of the D-PAD.
 * 
 * @param Y
 *            The y-offset
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.setDPadPositionY = function(Y)
{
	for (var i = 0; i < this.dPad.members.length; i++)
		this.dPad.members[i].y += Y;
};

/**
 * Set the offset position of the action buttons.
 * 
 * @param X
 *            The x-offset
 * @param Y
 *            The y-offset
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.setActionPosition = function(X, Y)
{
	for (var i = 0; i < this.actions.members.length; i++) {
		this.actions.members[i].x += X;
		this.actions.members[i].y += Y;
	}
};

/**
 * Set the x-offset position of the action buttons.
 * 
 * @param X
 *            The x-offset
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.setActionPositionX = function(X)
{
	for (var i = 0; i < this.actions.members.length; i++)
		this.actions.members[i].x += X;
};

/**
 * Set the y-offset position of the action buttons.
 * 
 * @param Y
 *            The y-offset
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.setActionPositionY = function(Y)
{
	for (var i = 0; i < this.actions.members.length; i++)
		this.actions.members[i].y += Y;
};

/**
 * Show the DPAD.
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.show = function()
{
	for (var i = 0; i < this.members.length; i++) {
		this.members[i].visible = true;
	}
};

/**
 * Show the DPAD.
 */
Flixel.system.input.pads.FlxVirtualPad.prototype.hide = function()
{
	for (var i = 0; i < this.members.length; i++) {
		this.members[i].visible = false;
	}
};