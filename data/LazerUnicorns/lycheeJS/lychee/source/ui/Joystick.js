
lychee.define('lychee.ui.Joystick').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _refresh_drag = function(x, y) {

		var indexx = x / (this.width / 2);
		var indexy = y / (this.height / 2);

		var value = this.value;

		value.x = indexx;
		value.y = indexy;


		var result = this.setValue(value);
		if (result === true) {
			this.trigger('change', [ value ]);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.value = { x: 0, y: 0 };

		this.__drag  = { x: 0, y: 0 };
		this.__pulse = {
			active:   false,
			duration: 250,
			start:    null,
			alpha:    0.0
		};


		this.setValue(settings.value);

		delete settings.value;


		settings.width  = typeof settings.width === 'number'  ? settings.width  : 128;
		settings.height = typeof settings.height === 'number' ? settings.height : 128;
		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;


		lychee.ui.Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function(id, position, delta) {
			_refresh_drag.call(this, position.x, position.y);
		}, this);

		this.bind('swipe', function(id, state, position, delta, swipe) {

			if (state === 'end') {
				_refresh_drag.call(this, 0, 0);
			} else {
				_refresh_drag.call(this, position.x, position.y);
			}

		}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {
			this.setState('default');
		}, this);


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lyche.ui.Joystick';

			var settings = data['arguments'][0];


			if (this.value !== 0) settings.value = this.value;


			return data;

		},

		update: function(clock, delta) {

			var pulse = this.__pulse;
			if (pulse.active === true) {

				if (pulse.start === null) {
					pulse.start = clock;
				}

				var t = (clock - pulse.start) / pulse.duration;
				if (t <= 1) {
					pulse.alpha = (1 - t) * 0.6;
				} else {
					pulse.alpha  = 0.0;
					pulse.active = false;
				}

			}


			lychee.ui.Entity.prototype.update.call(this, clock, delta);

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;


			var color  = this.state === 'active' ? '#33b5e5' : '#0099cc';
			var color2 = this.state === 'active' ? '#0099cc' : '#575757';
			var alpha  = this.state === 'active' ? 0.6       : 0.3;


			var drag    = this.__drag;
			var hwidth  = this.width / 2;
			var hheight = this.height / 2;

			var x1 = x - hwidth;
			var y1 = y - hheight;
			var x2 = x + hwidth;
			var y2 = y + hheight;


			renderer.drawBox(
				x1,
				y1,
				x2,
				y2,
				color2,
				false,
				2
			);

			renderer.drawLine(
				x,
				y1,
				x,
				y2,
				color2,
				4
			);


			renderer.drawLine(
				x1,
				y,
				x2,
				y,
				color2,
				4
			);


			renderer.drawTriangle(
				x1,
				y1 + 16,
				x1,
				y1,
				x1 + 16,
				y1,
				color2,
				true
			);


			renderer.drawTriangle(
				x2 - 16,
				y1,
				x2,
				y1,
				x2,
				y1 + 16,
				color2,
				true
			);

			renderer.drawTriangle(
				x2,
				y2 - 16,
				x2,
				y2,
				x2 - 16,
				y2,
				color2,
				true
			);


			renderer.drawTriangle(
				x1 + 16,
				y2,
				x1,
				y2,
				x1,
				y2 - 16,
				color2,
				true
			);


			var pulse = this.__pulse;
			if (pulse.active === true) {

				renderer.setAlpha(pulse.alpha);

				renderer.drawBox(
					x1,
					y1,
					x2,
					y2,
	   				color,
					true
				);

				renderer.setAlpha(1.0);

			}


			renderer.setAlpha(alpha);

			renderer.drawLine(
				x,
				y,
				x + drag.x,
				y + drag.y,
				color,
				4
			);

			renderer.drawCircle(
				x + drag.x,
				y + drag.y,
				14,
				color,
				true
			);

			renderer.setAlpha(1.0);


			renderer.drawCircle(
				x + drag.x,
				y + drag.y,
				4,
				color,
				true
			);

		},



		/*
		 * CUSTOM API
		 */

		setState: function(id) {

			var result = lychee.ui.Entity.prototype.setState.call(this, id);
			if (result === true) {

				var pulse = this.__pulse;


				if (id === 'active') {

					pulse.alpha  = 0.6;
					pulse.start  = null;
					pulse.active = true;

				}


				return true;

			}


			return false;

		},

		setValue: function(value) {

			if (value instanceof Object) {

				this.value.x = typeof value.x === 'number' ? value.x : this.value.x;
				this.value.y = typeof value.y === 'number' ? value.y : this.value.y;


				var val = 0;

				val = this.value.x;
				val = val >= -1.0 ? val : -1.0;
				val = val <=  1.0 ? val :  1.0;
				this.value.x = val;

				val = this.value.y;
				val = val >= -1.0 ? val : -1.0;
				val = val <=  1.0 ? val :  1.0;
				this.value.y = val;


				var hwidth  = this.width / 2;
				var hheight = this.height / 2;

				this.__drag.x = this.value.x * hwidth;
				this.__drag.y = this.value.y * hheight;


				return true;

			}


			return false;

		}

	};


	return Class;

});

