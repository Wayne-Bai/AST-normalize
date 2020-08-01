
lychee.define('lychee.ui.Textarea').includes([
	'lychee.ui.Entity'
]).exports(function(lychee, global) {

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.font  = null;
		this.value = '';

		this.__buffer  = null;
		this.__drag    = { x: 0, y: 0 };
		this.__lines   = [];
		this.__value   = '';
		this.__isDirty = false;


		this.setFont(settings.font);
		this.setValue(settings.value);

		delete settings.font;
		delete settings.value;


		settings.shape  = lychee.ui.Entity.SHAPE.rectangle;
		settings.width  = typeof settings.width  === 'number' ? settings.width  : 140;
		settings.height = typeof settings.height === 'number' ? settings.height : 140;


		lychee.ui.Entity.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('touch', function() {}, this);

		this.bind('focus', function() {
			this.setState('active');
		}, this);

		this.bind('blur', function() {

			if (this.value !== this.__value) {
				this.trigger('change', [ this.value ]);
				this.__value = this.value;
			}

			this.setState('default');

		}, this);

		this.bind('key', function(key, name, delta) {

			var line      = this.__lines[this.__lines.length - 1];
			var character = key;

			if (key === 'enter') {

				this.__lines.push('');
				this.__isDirty = true;

				return false;

			} else {

				if (key === 'space') {
					character = ' ';
				} else if (key === 'tab') {
					character = '\t';
				}


				var ll = this.__lines.length;

				if (character.length === 1) {

					line += character;
					this.__lines[ll - 1] = line;
					this.__isDirty = true;

				} else if (key === 'backspace') {

					if (line.length > 0) {
						line = line.substr(0, line.length - 1);
						this.__lines[ll - 1] = line;
						this.__isDirty = true;
					} else if (ll > 1) {
						this.__lines.splice(ll - 1, 1);
						this.__isDirty = true;
					}

				}


				this.value = this.__lines.join('\n');

			}

		}, this);


		settings = null;

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
			data['constructor'] = 'lyche.ui.Textarea';

			var settings = data['arguments'][0];
			var blob     = (data['blob'] || {});


			if (this.width !== 140)  settings.width  = this.width;
			if (this.height !== 140) settings.height = this.height;
			if (this.value !== '')   settings.value  = this.value;


			if (this.font !== null) blob.font = lychee.serialize(this.font);


			data['blob'] = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;


			var buffer = this.__buffer;
			if (buffer === null) {

				buffer = renderer.createBuffer(
					this.width  - 28,
					this.height - 28
				);

				this.__buffer = buffer;

			}


			if (this.__isDirty === true) {

				renderer.clearBuffer(buffer);
				renderer.setBuffer(buffer);


				var font = this.font;
				if (font !== null) {

					var l, ll, text;
					var kerning    = font.kerning;
					var linewidth  = 0;
					var lineheight = font.lineheight;
					var textwidth  = 0;
					var textheight = this.__lines.length * lineheight;


					text = this.__lines[this.__lines.length - 1];

					for (var t = 0, tl = text.length; t < tl; t++) {
						var chr = font.get(text[t]);
						if (chr === null) console.log(t, tl, text[t], text);
						linewidth += chr.real + kerning;
					}

					var drag  = font.get('_');
					textwidth = linewidth + drag.real;


					var offsetx = 0;
					var offsety = 0;
					var bwidth  = buffer.width;
					var bheight = buffer.height;

					if (textwidth  > bwidth)  offsetx = bwidth  - textwidth;
					if (textheight > bheight) offsety = bheight - textheight;


					for (l = 0, ll = this.__lines.length; l < ll; l++) {

						text = this.__lines[l];

						renderer.drawText(
							offsetx,
							offsety + lineheight * l,
							text,
							font,
							false
						);

					}


					if (this.state === 'active') {

						var dragx = offsetx + textwidth - drag.real;
						var dragy = offsety + lineheight * l - lineheight;

						renderer.drawBox(
							dragx,
							dragy,
							dragx + drag.real,
							dragy + lineheight,
							'#33b5e5',
							true
						);

					}

				}


				renderer.setBuffer(null);


				this.__isDirty = false;

			}


			var position = this.position;

			var x = position.x + offsetX;
			var y = position.y + offsetY;

			var color = this.state === 'active' ? '#0099cc' : '#575757';


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
				color,
				false,
				2
			);

			renderer.drawTriangle(
				x1,
				y1 + 14,
				x1,
				y1,
				x1 + 14,
				y1,
				color,
				true
			);

			renderer.drawTriangle(
				x2,
				y2 - 14,
				x2,
				y2,
				x2 - 14,
				y2,
				color,
				true
			);



			renderer.drawBuffer(
				x1 + 14,
				y1 + 14,
				this.__buffer
			);

		},



		/*
		 * CUSTOM ENTITY API
		 */

		setState: function(id) {

			var result = lychee.ui.Entity.prototype.setState.call(this, id);
			if (result === true) {
				this.__isDirty = true;
			}


			return result;

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

		setValue: function(value) {

			value = typeof value === 'string' ? value : null;


			if (value !== null) {

				this.value = value;

				this.__lines   = value.split('\n');
				this.__isDirty = true;

				return true;

			}


			return false;

		}

	};


	return Class;

});

