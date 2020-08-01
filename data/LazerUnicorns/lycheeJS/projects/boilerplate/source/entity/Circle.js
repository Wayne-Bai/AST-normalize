
lychee.define('game.entity.Circle').requires([
	'lychee.effect.Color',
	'lychee.effect.Radius'
]).includes([
	'lychee.ui.Entity'
]).exports(function(lychee, game, global, attachments) {

	var _sound = attachments["snd"];



	/*
	 * HELPERS
	 */

	var _random_color = function() {

		var strr = (16 + Math.random() * 239 | 0).toString(16);
		var strg = (16 + Math.random() * 239 | 0).toString(16);
		var strb = (16 + Math.random() * 239 | 0).toString(16);

		return '#' + strr + strg + strb;
	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data, main) {

		var settings = lychee.extend({}, data);


		this.main = main || null;

		this.color = '#888888';


		this.setColor(settings.color);

		delete settings.color;


		if (typeof settings.radius !== 'number') {
			settings.radius = 48;
		}

		settings.shape = lychee.ui.Entity.SHAPE.circle;


		lychee.ui.Entity.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {

			var effects = this.effects;
			if (effects.length === 0) {

				this.main.jukebox.play(_sound);

				this.addEffect(new lychee.effect.Color({
					type:     lychee.effect.Color.TYPE.bounceeaseout,
					duration: 500,
					color:    _random_color()
				}));

				this.addEffect(new lychee.effect.Radius({
					type:     lychee.effect.Radius.TYPE.bounceeaseout,
					duration: 500,
					radius:   24 + ((Math.random() * 48) | 0)
				}));

			}

		}, this);

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor']  = 'game.entity.Circle';
			data['arguments'][1] = '#MAIN';


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			var alpha    = this.alpha;
			var position = this.position;
			var radius   = this.radius;
			var color    = this.color;


			if (alpha !== 1) {
				renderer.setAlpha(alpha);
			}


			renderer.drawCircle(
				offsetX + position.x,
				offsetY + position.y,
				radius,
				color,
				true
			);


			if (alpha !== 1) {
				renderer.setAlpha(1);
			}

		},

		update: function(clock, delta) {

			lychee.ui.Entity.prototype.update.call(this, clock, delta);

		},



		/*
		 * CUSTOM API
		 */

		setColor: function(color) {

			color = typeof color === 'string' ? color : null;


			if (color !== null) {

				this.color = color;

				return true;

			}


			return false;

		}

	};


	return Class;

});

