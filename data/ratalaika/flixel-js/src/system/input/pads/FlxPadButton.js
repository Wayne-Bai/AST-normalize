/**
 * A Digital Pad button.<br>
 * <br>
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	ratalaika / ratalaikaGames
 */
/**
 * Creates a new <code>FlxPadButton</code> object with a gray background and a
 * callback function on the UI thread.
 * 
 * @param X
 *            The X position of the button.
 * @param Y
 *            The Y position of the button.
 * @param Label
 *            The text that you want to appear on the button.
 * @param OnClick
 *            The function to call whenever the button is clicked.
 */
Flixel.system.input.pads.FlxPadButton = function(X, Y)
{
	Flixel.system.input.pads.FlxPadButton.parent.constructor.apply(this, [ X, Y ]);
	this.loadGraphic(Flixel.data.FlxSystemAsset.ImgDefaultButton, false, false, 80, 20);

	this.status = Flixel.system.input.pads.FlxPadButton.STATUS_NORMAL;
};
extend(Flixel.system.input.pads.FlxPadButton, Flixel.FlxSprite);

/**
 * This means the button has no finger on it.
 */
Flixel.system.input.pads.FlxPadButton.STATUS_NORMAL = 0;
/**
 * This means the finger has just touched the button.
 */
Flixel.system.input.pads.FlxPadButton.STATUS_JUST_PRESSED = 1;
/**
 * This means the finger is still pressing the button.
 */
Flixel.system.input.pads.FlxPadButton.STATUS_PRESSED = 2;
/**
 * This means the finger has just removed from the button.
 */
Flixel.system.input.pads.FlxPadButton.STATUS_JUST_RELEASED = 3;
/**
 * This means that the mouse is over the button but not pressing it (ONLY FOR
 * DESKTOP).
 */
Flixel.system.input.pads.FlxPadButton.STATUS_OVER = 4;
/**
 * Shows the current state of the button.
 */
Flixel.system.input.pads.FlxPadButton.prototype.status = 0;
/**
 * The last detected pointer id.
 */
Flixel.system.input.pads.FlxPadButton.prototype._pointerId = 0;

/**
 * Basic button update logic
 */
Flixel.system.input.pads.FlxPadButton.prototype.update = function()
{
	// Figure out if the button is highlighted or pressed or what
	if (this.cameras === null)
		this.cameras = Flixel.FlxG.cameras;

	var camera;
	var i = 0;
	var l = this.cameras.length;
	var pointerId = 0;
	var totalPointers = Flixel.FlxG.mouse.activePointers + 1;
	var offAll = true;

	while (i < l) {
		camera = this.cameras[i++];
		while (pointerId < totalPointers) {
			Flixel.FlxG.mouse.getWorldPosition(camera, this._point, pointerId);
			if (this.overlapsPoint(this._point, true, camera)) {
				offAll = false;

				if (Flixel.FlxG.mouse.pressed(pointerId)) {
					this.status = Flixel.system.input.pads.FlxPadButton.STATUS_PRESSED;
					if (Flixel.FlxG.mouse.justPressed(pointerId)) {
						this.status = Flixel.system.input.pads.FlxPadButton.STATUS_JUST_PRESSED;
					}
					this._pointerId = pointerId;
				}
			}
			++pointerId;
		}
	}

	// Terminate the just released stuff
	if(this.status == Flixel.system.input.pads.FlxPadButton.STATUS_JUST_RELEASED) {
		this.status = Flixel.system.input.pads.FlxPadButton.STATUS_NORMAL;
	}

	// Check if we need to set the button as just released
	// We can have the mouse over the button and not being touching it
	if (offAll || (!offAll && !Flixel.FlxG.mouse.pressed(this._pointerId))) {
		if (this.status == Flixel.system.input.pads.FlxPadButton.STATUS_PRESSED) {
			if (Flixel.FlxG.mouse.justReleased(this._pointerId))
				this.status = Flixel.system.input.pads.FlxPadButton.STATUS_JUST_RELEASED;
			else
				this.status = Flixel.system.input.pads.FlxPadButton.STATUS_NORMAL;
		}
	}

	// Then pick the appropriate frame of animation
	if (this.status == Flixel.system.input.pads.FlxPadButton.STATUS_JUST_PRESSED || this.status == Flixel.system.input.pads.FlxPadButton.STATUS_JUST_RELEASED)
		this.setFrame(Flixel.system.input.pads.FlxPadButton.STATUS_NORMAL);
	else
		this.setFrame(this.status);
};