
lychee.define('lychee.verlet.DistanceConstraint').requires([
	'lychee.verlet.Particle',
	'lychee.verlet.Vector2'
]).exports(function(lychee, global) {

	var _cache    = new lychee.verlet.Vector2();
	var _particle = lychee.verlet.Particle;


	var Class = function(a, b, rigidity) {

		this.a = a instanceof _particle ? a : null;
		this.b = b instanceof _particle ? b : null;

		this.distance = 0;
		this.rigidity = typeof rigidity === 'number' ? rigidity : 1;


		if (this.a !== null && this.b !== null) {

			this.a.position.copy(_cache);
			_cache.subtract(this.b.position);
			this.distance = _cache.squaredLength();

		}

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		update: function(clock, delta) {

			var u = delta / 1000;


			var a = this.a;
			var b = this.b;

			if (a !== null && b !== null) {

				a.position.copy(_cache);
				_cache.subtract(b.position);

				var dist  = _cache.length();
				var m     = _cache.squaredLength();
				var scale = ((this.distance - m) / m) * this.rigidity * u;

				_cache.scale(scale);

				a.position.add(_cache);
				b.position.subtract(_cache);

			}

		},

		render: function(renderer, offsetX, offsetY) {

			var a = this.a.position;
			var b = this.b.position;


			var x1 = a.x + offsetX;
			var y1 = a.y + offsetY;
			var x2 = b.x + offsetX;
			var y2 = b.y + offsetY;


			renderer.drawLine(
				x1,
				y1,
				x2,
				y2,
				'#ff0000',
				2
			);

		}

	};


	return Class;

});

