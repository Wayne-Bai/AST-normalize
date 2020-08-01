/**
 * @fileoverview FadeBehavior - simple angular rotation
 * 
 * @author Tony Parisi
 */

goog.provide('Vizi.FadeBehavior');
goog.require('Vizi.Behavior');

Vizi.FadeBehavior = function(param) {
	param = param || {};
	this.duration = (param.duration !== undefined) ? param.duration : 1;
	this.opacity = (param.opacity !== undefined) ? param.opacity : 0.5;
	this.savedOpacities = [];
	this.savedTransparencies = [];
	this.tween = null;
    Vizi.Behavior.call(this, param);
}

goog.inherits(Vizi.FadeBehavior, Vizi.Behavior);

Vizi.FadeBehavior.prototype.start = function()
{
	if (this.running)
		return;

	if (this._realized && this._object.visuals) {
		var visuals = this._object.visuals;
		var i, len = visuals.length;
		for (i = 0; i < len; i++) {
			this.savedOpacities.push(visuals[i].material.opacity);
			this.savedTransparencies.push(visuals[i].material.transparent);
			visuals[i].material.transparent = this.opacity < 1 ? true : false;
		}	
	}
	
	this.value = { opacity : this.savedOpacities[0] };
	this.targetValue = { opacity : this.opacity };
	this.tween = new TWEEN.Tween(this.value).to(this.targetValue, this.duration * 1000)
	.easing(TWEEN.Easing.Quadratic.InOut)
	.repeat(0)
	.start();
	
	Vizi.Behavior.prototype.start.call(this);
}

Vizi.FadeBehavior.prototype.evaluate = function(t)
{
	if (t >= this.duration)
	{
		this.stop();
		if (this.loop)
			this.start();
	}
	
	if (this._object.visuals)
	{
		var visuals = this._object.visuals;
		var i, len = visuals.length;
		for (i = 0; i < len; i++) {
			visuals[i].material.opacity = this.value.opacity;
		}	
	}

}


Vizi.FadeBehavior.prototype.stop = function()
{
	if (this.tween)
		this.tween.stop();

	Vizi.Behavior.prototype.stop.call(this);
}
