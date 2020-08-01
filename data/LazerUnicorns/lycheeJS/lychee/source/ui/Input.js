
lychee.define('lychee.ui.Input').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.font  = null;
		this.max   = Infinity;
		this.min   = 0;
		this.type  = Class.TYPE.text;
		this.value = null;

		this.__buffer  = null;
		this.__drag    = null;
		this.__pulse   = {
			active:   false,
			duration: 250,
			start:    null,
			alpha:    0.0
		};
		this.__value   = '';
		this.__isDirty = false;


		this.setFont(settings.font);
		this.setMax(settings.max);
		this.setMin(settings.min);
		this.setType(settings.type);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.max;
		delete settings.min;
		delete settings.type;
		delete settings.value;


		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;
		settings.width  = typeof settings.width === 'number'  ? settings.width  : 128;
		settings.height = typeof settings.height === 'number' ? settings.height : 64;


		lychee.ui.Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {

			var oldvalue = this.value;
			var newvalue = null;


			var type = this.type;
			if (type === Class.TYPE.text) {

				newvalue = this.__value;

				if (newvalue !== oldvalue) {

					if (this.setValue(newvalue) === false) {
						this.setValue(newvalue.substr(0, this.max));
					}

				}

			} else if (type === Class.TYPE.number) {

				newvalue = parseInt(this.__value, 10);

				if (newvalue !== oldvalue && !isNaN(newvalue)) {

					if (this.setValue(newvalue) === false) {

						if (newvalue > this.max) {
							this.value     = this.max;
							this.__value   = this.max + '';
							this.__isDirty = true;
						} else if (newvalue < this.min) {
							this.value     = this.min;
 							this.__value   = this.min + '';
							this.__isDirty = true;
						}

					}

				}

			}


			if (oldvalue !== this.value) {
				this.trigger('change', [ this.value ]);
			}


			this.setState('default');

		}, this);

		this.bind('key', function(key, name, delta) {

			if (key === 'backspace') {

				var raw = this.__value.substr(0, this.__value.length - 1);

				if (type === Class.TYPE.text) {

					this.__value = raw;

				} else if (type === Class.TYPE.number) {

					var bsvalue = parseInt(raw, 10);
					if (!isNaN(bsvalue)) {
						this.__value = bsvalue + '';
					} else {
						this.__value = '';
					}

				}

				this.__isDirty = true;

				return;

			} else if (key === 'enter') {

				this.trigger('blur', []);

				return;

			} else if (key === 'space') {

				key = ' ';

			}



			if (key.length === 1) {

				var type = this.type;
				if (type === Class.TYPE.text && key.match(/([A-Za-z0-9\s-_]+)/)) {

					this.__value = this.__value + key;

				} else if (type === Class.TYPE.number && key.match(/[0-9-+]/)) {

					var value = parseInt('' + this.__value + key, 10);
					if (!isNaN(value)) {
						this.__value = value + '';
					} else {
						this.__value = '';
					}

				}

				this.__isDirty = true;

			}

		}, this);


		settings = null;

	};


	Class.TYPE = {
		text:   0,
		number: 1
	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var font = lychee.deserialize(blob.font);
			if (font !== null) {
				this.setFont(font);
			}

		},

		serialize: function() {

			var data = lychee.ui.Entity.prototype.serialize.call(this);
			data['constructor'] = 'lyche.ui.Input';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.max !== Infinity)         settings.max   = this.max;
			if (this.min !== 0)                settings.min   = this.min;
			if (this.type !== Class.TYPE.text) settings.type  = this.type;
			if (this.value !== null)           settings.value = this.value;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


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


			var buffer = this.__buffer;
			if (buffer === null) {

				buffer = renderer.createBuffer(
					this.width - 24,
					this.height
				);

				this.__buffer = buffer;

			}


			if (this.__isDirty === true) {

				renderer.clear(buffer);
				renderer.setBuffer(buffer);


				var font = this.font;
				if (font !== null) {

					var text = this.__value;
					var dim  = font.measure(text);

					if (dim.width > buffer.width) {

						renderer.drawText(
							buffer.width - dim.width,
							dim.height / 2,
							text,
							font,
							false
						);

					} else {

						renderer.drawText(
							0,
							dim.height / 2,
							text,
							font,
							false
						);

					}

				}


				renderer.setBuffer(null);


				this.__isDirty = false;

			}


			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;

			var color  = this.state === 'active' ? '#33b5e5' : '#0099cc';
			var color2 = this.state === 'active' ? '#0099cc' : '#575757';


			var hwidth  = this.width / 2;
			var hheight = this.height / 2;

			var x1 = x - hwidth;
			var y1 = y - hheight;
			var x2 = x + hwidth;
			var y2 = y + hheight;


			renderer.drawLine(
				x1,
				y2 - 7,
				x1,
				y2,
				color,
				2
			);

			renderer.drawLine(
				x1,
				y2,
				x2,
				y2,
				color,
				2
			);

			renderer.drawLine(
				x2,
				y2 - 7,
				x2,
				y2,
				color,
				2
			);



			renderer.drawBuffer(
				x1 + 14,
				y1,
				this.__buffer
			);

		},



		/*
		 * CUSTOM API
		 */

		setFont: function(font) {

			font = font instanceof Font ? font : null;


			if (font !== null) {

				this.font = font;

				return true;

			}


			return false;

		},

		setMax: function(max) {

			max = typeof max === 'number' ? max : null;


			if (max !== null) {

				this.max = max;

				return true;

			}


			return false;

		},

		setMin: function(min) {

			min = typeof min === 'number' ? min : null;


			if (min !== null) {

				this.min = min;

				return true;

			}


			return false;

		},

		setType: function(type) {

			if (lychee.enumof(Class.TYPE, type)) {

				this.type = type;

				return true;

			}


			return false;

		},

		setValue: function(value) {

			var type = this.type;


			// 0: Text
			if (type === Class.TYPE.text && typeof value === 'string') {

				if (this.value !== value && value.length >= this.min && value.length <= this.max) {

					this.value = value;

					this.__value   = value + '';
					this.__isDirty = true;

					return true;

				}


			// 1. Number
			} else if (type === Class.TYPE.number && typeof value === 'number' && !isNaN(value)) {

				if (this.value !== value && value >= this.min && value <= this.max) {

					this.value = value;

					this.__value   = value + '';
					this.__isDirty = true;

					return true;

				}

			}


			return false;

		}

	};


	return Class;

});

