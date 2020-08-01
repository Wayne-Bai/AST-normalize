/**
 * The global tween class.
 * 
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	ratalaika / ratalaikaGames
 */

/**
 * Constructor. Specify basic information about the Tween.
 * 
 * @param duration
 *            Duration of the tween (in seconds or frames).
 * @param type
 *            Tween type, one of Tween.PERSIST (default), Tween.LOOPING, or
 *            Tween.ONESHOT.
 * @param complete
 *            Optional callback for when the Tween completes.
 * @param ease
 *            Optional easer method to apply to the Tweened value.
 */
Flixel.plugin.tweens.FlxTween = function(duration, type, complete, ease)
{
	type = (type === undefined) ? 0 : type;
	complete = (complete === undefined) ? null : complete;
	ease = (ease === undefined) ? null : ease;

	this._target = duration;
	if (type === 0) {
		type = Flixel.plugin.tweens.FlxTween.PERSIST;
	} else if (type == Flixel.plugin.tweens.FlxTween.BACKWARD) {
		type = Flixel.plugin.tweens.FlxTween.PERSIST | Flixel.plugin.tweens.FlxTween.BACKWARD;
	}
	this._type = type;
	this.complete = complete;
	this._ease = ease;
	this._t = 0;

	this._backward = (this._type & Flixel.plugin.tweens.FlxTween.BACKWARD) > 0;
};



/**
 * Persistent Tween type, will stop when it finishes.
 */
Flixel.plugin.tweens.FlxTween.PERSIST = 1;
/**
 * Looping Tween type, will restart immediately when it finishes.
 */
Flixel.plugin.tweens.FlxTween.LOOPING = 2;
/**
 * "To and from" Tween type, will play tween hither and thither
 */
Flixel.plugin.tweens.FlxTween.PINGPONG = 4;
/**
 * Oneshot Tween type, will stop and remove itself from its core
 * container when it finishes.
 */
Flixel.plugin.tweens.FlxTween.ONESHOT = 8;
/**
 * Backward Tween type, will play tween in reverse direction
 */
Flixel.plugin.tweens.FlxTween.BACKWARD = 16;
/**
 * True if the tweening is active.
 */
Flixel.plugin.tweens.FlxTween.prototype.active = false;
/**
 * This method will be called when the tween complete.
 */
Flixel.plugin.tweens.FlxTween.prototype.complete = null;
/**
 * The period of time that tween has completed.
 */
Flixel.plugin.tweens.FlxTween.prototype.percent = 0;
/**
 * The scale of time.
 */
Flixel.plugin.tweens.FlxTween.prototype.scale = 0;
/**
 * The type of tween.
 */
Flixel.plugin.tweens.FlxTween.prototype._type = 0;
/**
 * The easer method to apply to the Tweened value.
 */
Flixel.plugin.tweens.FlxTween.prototype._ease = null;
/**
 * The percent of completed tween.
 */
Flixel.plugin.tweens.FlxTween.prototype._t = 0;
/**
 * The time that has passed since the tween started.
 */
Flixel.plugin.tweens.FlxTween.prototype._time = 0;
/**
 * Duration of the tween (in seconds or frames).
 */
Flixel.plugin.tweens.FlxTween.prototype._target = 0;
/**
 * True if the tweening has finished.
 */
Flixel.plugin.tweens.FlxTween.prototype.finish = false;
/**
 * The parent object.
 */
Flixel.plugin.tweens.FlxTween.prototype.parent = null;
/**
 * The previous tween.
 */
Flixel.plugin.tweens.FlxTween.prototype.prev = null;
/**
 * The next tween.
 */
Flixel.plugin.tweens.FlxTween.prototype.next = null;
/**
 * If the tween has to be played in a reverse direction.
 */
Flixel.plugin.tweens.FlxTween.prototype._backward = false;

/**
 * Destroy method.
 */
Flixel.plugin.tweens.FlxTween.prototype.destroy = function()
{
	this.complete = null;
	this.parent = null;
	this._ease = null;
};

/**
 * Updates the Tween, called by World.
 */
Flixel.plugin.tweens.FlxTween.prototype.update = function()
{
	this._time += Flixel.FlxG.elapsed;
	this._t = this._time / this._target;
	if (this._ease !== null) {
		this._t = this._ease(this._t);
	}
	
	if (this._backward) {
		this._t = 1 - this._t;
	}
	
	if (this._time >= this._target) {
		if (!this._backward) {
			this._t = 1;
		} else {
			this._t = 0;
		}
		this.finish = true;
	}
};

/**
 * Starts the Tween, or restarts it if it's currently running.
 */
Flixel.plugin.tweens.FlxTween.prototype.start = function()
{
	this._time = 0;
	if (this._target === 0) {
		this.active = false;
		return;
	}
	this.active = true;
};

/**
 * Immediately stops the Tween and removes it from its Tweener without
 * calling the complete callback.
 */
Flixel.plugin.tweens.FlxTween.prototype.cancel = function()
{
	this.active = false;
	if (this.parent !== null) {
		this.parent.removeTween(this);
	}
};

/**
 * Called when the Tween completes.
 */
Flixel.plugin.tweens.FlxTween.prototype.finishTween = function()
{
	if (this.complete !== null)
		this.complete();
	
	switch ((this._type & ~Flixel.plugin.tweens.FlxTween.BACKWARD))
	{
		case Flixel.plugin.tweens.FlxTween.PERSIST:
			this._time = this._target;
			this.active = false;
			break;
		case Flixel.plugin.tweens.FlxTween.LOOPING:
			this._time %= this._target;
			this._t = this._time / this._target;
			if (this._ease !== null && this._t > 0 && this._t < 1) this._t = this._ease(this._t);
			this.start();
			break;
		case Flixel.plugin.tweens.FlxTween.PINGPONG:
			this._time %= this._target;
			this._t = this._time / this._target;
			if (this._ease !== null && this._t > 0 && this._t < 1) this._t = this._ease(this._t);
			if (this._backward) this._t = 1 - this._t;
			this._backward = !this._backward;
			this.start();
			break;
		case Flixel.plugin.tweens.FlxTween.ONESHOT:
			this._time = this._target;
			this.active = false;
			this.parent.removeTween(this, true);
			break;
	}
	this.finish = false;
};

/**
 * Get the percent of completed tween.
 * 
 * @return
 */
Flixel.plugin.tweens.FlxTween.prototype.getPercent = function()
{
	return this._time / this._target;
};

/**
 * Set the percent.
 * 
 * @param value
 *            The percent value.
 * @return
 */
Flixel.plugin.tweens.FlxTween.prototype.setPercent = function(value)
{
	this._time = this._target * value;
	return this._time;
};

/**
 * Return the time scale.
 */
Flixel.plugin.tweens.FlxTween.prototype.getScale = function()
{
	return this._t;
};