
lychee.define('game.entity.Background').includes([
	'lychee.game.Entity'
]).exports(function(lychee, game, global, attachments) {

	var _texture = attachments["png"];
	var _config  = {
		states: { 'default': 0 },
		map:    {
			'foreground': { x: 0, y: 0,   w: 1024, h: 512 },
			'background': { x: 0, y: 512, w: 1024, h: 512 }
		}
	};


	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.origin    = { bgx: 0, bgy: 0, fgx: 0, fgy: 0 };

		this.__buffer  = null;
		this.__isDirty = true;


		this.setOrigin(settings.origin);


		delete settings.origin;


		settings.states  = _config.states;
		settings.texture = _texture;

		settings.width   = settings.width  || 1024;
		settings.height  = settings.height || 512;


		lychee.game.Entity.call(this, settings);

		settings = null;

	};


	Class.prototype = {

		serialize: function() {

			var data = lychee.game.Entity.prototype.serialize.call(this);
			data['constructor'] = 'game.entity.Background';


			return data;

		},



		/*
		 * CUSTOM API
		 */

		render: function(renderer, offsetX, offsetY) {

			var texture = _texture;
			var fgmap   = _config.map.foreground;
			var bgmap   = _config.map.background;


			if (this.__buffer === null) {

				this.__buffer = renderer.createBuffer(
					this.width,
					this.height
				);

			}


			var buffer = this.__buffer;

			if (this.__isDirty === true) {

				renderer.setBuffer(buffer);


				var px1 = this.origin.bgx - (bgmap.w / 2) - bgmap.w;
				var py1 = this.origin.bgy - bgmap.h;


				renderer.drawBox(
					0,
					0,
					this.width,
					py1,
					'#92c9ef',
					true
				);


				while (px1 < this.width) {

					renderer.drawSprite(
						px1,
						py1,
						texture,
						bgmap
					);

					px1 += bgmap.w;

				}


				var px2 = this.origin.fgx - (fgmap.w / 2) - fgmap.w;
				var py2 = this.origin.fgy - fgmap.h;

				while (px2 < this.width) {

					renderer.drawSprite(
						px2,
						py2,
						texture,
						fgmap
					);

					px2 += fgmap.w;

				}


				renderer.setBuffer(null);

				this.__buffer  = buffer;
				this.__isDirty = false;

			}


			var position = this.position;

			var x1 = position.x + offsetX - this.width  / 2;
			var y1 = position.y + offsetY - this.height / 2;


			renderer.drawBuffer(
				x1,
				y1,
				buffer
			);


			if (lychee.debug === true) {

				renderer.drawBox(
					x1,
					y1,
					x1 + this.width,
					y1 + this.height,
					'#ffff00',
					false,
					1
				);

			}

		},

		setOrigin: function(origin) {

			this.origin.bgx = origin.bgx;
			this.origin.bgy = origin.bgy;
			this.origin.fgx = origin.fgx;
			this.origin.fgy = origin.fgy;

			this.origin.bgx %= 1024;
			this.origin.fgx %= 1024;

			this.__isDirty = true;

		}

	};


	return Class;

});

