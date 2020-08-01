
lychee.define('lychee.game.Layer').requires([
	'lychee.game.Entity'
]).exports(function(lychee, global) {

	/*
	 * HELPERS
	 */

	var _validate_entity = function(entity) {

		if (entity instanceof Object) {

			if (typeof entity.update === 'function' && typeof entity.render === 'function' && typeof entity.shape === 'number') {
				return true;
			}

		}


		return false;

	};



	/*
	 * IMPLEMENTATION
	 */

	var _SHAPE_rectangle = 2;

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.width  = typeof settings.width  === 'number' ? settings.width  : 0;
		this.height = typeof settings.height === 'number' ? settings.height : 0;
		this.depth  = 0;


		this.effects  = [];
		this.entities = [];
		this.offset   = { x: 0, y: 0 };
		this.position = { x: 0, y: 0 };
		this.shape    = _SHAPE_rectangle;
		this.visible  = true;

		this.__map     = {};
		this.__reshape = true;


		this.setEntities(settings.entities);
		this.setOffset(settings.offset);
		this.setPosition(settings.position);
		this.setReshape(settings.reshape);
		this.setVisible(settings.visible);


		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			var entities = [];
			for (var be = 0, bel = blob.entities.length; be < bel; be++) {
				entities.push(lychee.deserialize(blob.entities[be]));
			}

			var map = {};
			for (var bid in blob.map) {

				var index = blob.map[bid];
				if (typeof index === 'number') {
					map[bid] = index;
				}

			}


			for (var e = 0, el = entities.length; e < el; e++) {

				var id = null;
				for (var mid in map) {

					if (map[mid] === e) {
						id = mid;
					}

				}


				if (id !== null) {
					this.setEntity(id, entities[e]);
				} else {
					this.addEntity(entities[e]);
				}

			}

		},

		serialize: function() {

			var settings = {};
			var blob     = {};


			if (this.offset.x !== 0 || this.offset.y !== 0 || this.offset.z !== 0) {

				settings.offset = {};

				if (this.offset.x !== 0) settings.offset.x = this.offset.x;
				if (this.offset.y !== 0) settings.offset.y = this.offset.y;
				if (this.offset.z !== 0) settings.offset.z = this.offset.z;

			}

			if (this.__reshape !== true) settings.reshape = this.__reshape;
			if (this.visible !== true)   settings.visible = this.visible;


			var entities = [];

			if (this.entities.length > 0) {

				blob.entities = [];

				for (var e = 0, el = this.entities.length; e < el; e++) {

					var entity = this.entities[e];

					blob.entities.push(lychee.serialize(entity));
					entities.push(entity);

				}

			}


			if (Object.keys(this.__map).length > 0) {

				blob.map = {};

				for (var id in this.__map) {

					var index = entities.indexOf(this.__map[id]);
					if (index !== -1) {
						blob.map[id] = index;
					}

				}

			}


			return {
				'constructor': 'lychee.game.Layer',
				'arguments':   [ settings ],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},

		render: function(renderer, offsetX, offsetY) {

			if (this.visible === false) return;

			var position = this.position;
			var offset   = this.offset;


			var ox = position.x + offsetX + offset.x;
			var oy = position.y + offsetY + offset.y;


			var entities = this.entities;
			for (var en = 0, enl = entities.length; en < enl; en++) {

				entities[en].render(
					renderer,
					ox,
					oy
				);

			}


			var effects = this.effects;
			for (var ef = 0, efl = effects.length; ef < efl; ef++) {
				effects[ef].render(renderer, offsetX, offsetY);
			}


			if (lychee.debug === true) {

				ox = position.x + offsetX;
				oy = position.y + offsetY;


				var hwidth   = this.width  / 2;
				var hheight  = this.height / 2;


				renderer.drawBox(
					ox - hwidth,
					oy - hheight,
					ox + hwidth,
					oy + hheight,
					'#ffff00',
					false,
					1
				);

			}

		},

		update: function(clock, delta) {

			var entities = this.entities;
			for (var en = 0, enl = entities.length; en < enl; en++) {
				entities[en].update(clock, delta);
			}

			var effects = this.effects;
			for (var ef = 0, efl = this.effects.length; ef < efl; ef++) {

				var effect = this.effects[ef];
				if (effect.update(this, clock, delta) === false) {
					this.removeEffect(effect);
					efl--;
					ef--;
				}

			}

		},



		/*
		 * CUSTOM API
		 */

		reshape: function() {

			if (this.__reshape === true) {

				var hwidth  = this.width  / 2;
				var hheight = this.height / 2;

				for (var e = 0, el = this.entities.length; e < el; e++) {

					var entity = this.entities[e];
					var boundx = Math.abs(entity.position.x + this.offset.x);
					var boundy = Math.abs(entity.position.y + this.offset.y);

					if (entity.shape === lychee.game.Entity.SHAPE.circle) {
						boundx += entity.radius;
						boundy += entity.radius;
					} else if (entity.shape === lychee.game.Entity.SHAPE.rectangle) {
						boundx += entity.width  / 2;
						boundy += entity.height / 2;
					}

					hwidth  = Math.max(hwidth,  boundx);
					hheight = Math.max(hheight, boundy);

				}

				this.width  = hwidth  * 2;
				this.height = hheight * 2;

			}

		},

		addEffect: function(effect) {

			effect = effect instanceof Object && typeof effect.update === 'function' ? effect : null;


			if (effect !== null) {

				var index = this.effects.indexOf(effect);
				if (index === -1) {

					this.effects.push(effect);

					return true;

				}

			}


			return false;

		},

		removeEffect: function(effect) {

			effect = effect instanceof Object && typeof effect.update === 'function' ? effect : null;


			if (effect !== null) {

				var index = this.effects.indexOf(effect);
				if (index !== -1) {

					this.effects.splice(index, 1);

					return true;

				}

			}


			return false;

		},

		removeEffects: function() {

			var effects = this.effects;

			for (var e = 0, el = effects.length; e < el; e++) {

				effects[e].update(this, Infinity, 0);
				this.removeEffect(effects[e]);

				el--;
				e--;

			}


			return true;

		},

		addEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				var index = this.entities.indexOf(entity);
				if (index === -1) {

					this.entities.push(entity);
					this.reshape();

					return true;

				}

			}


			return false;

		},

		setEntity: function(id, entity) {

			id     = typeof id === 'string'            ? id     : null;
			entity = _validate_entity(entity) === true ? entity : null;


			if (id !== null && entity !== null && this.__map[id] === undefined) {

				this.__map[id] = entity;

				var result = this.addEntity(entity);
				if (result === true) {
					return true;
				} else {
					delete this.__map[id];
				}

			}


			return false;

		},

		getEntity: function(id, position) {

			id        = typeof id === 'string'    ? id       : null;
			position = position instanceof Object ? position : null;


			var found = null;


			if (id !== null) {

				if (this.__map[id] !== undefined) {
					found = this.__map[id];
				}

			} else if (position !== null) {

				if (typeof position.x === 'number' && typeof position.y === 'number') {

					for (var e = this.entities.length - 1; e >= 0; e--) {

						var entity = this.entities[e];
						if (entity.isAtPosition(position) === true) {
							found = entity;
							break;
						}

					}

				}

			}


			return found;

		},

		removeEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				var found = false;

				var index = this.entities.indexOf(entity);
				if (index !== -1) {

					this.entities.splice(index, 1);
					found = true;

				}


				for (var id in this.__map) {

					if (this.__map[id] === entity) {

						delete this.__map[id];
						found = true;

					}

				}


				if (found === true) {
					this.reshape();
				}


				return found;

			}


			return false;

		},

		setEntities: function(entities) {

			var all = true;

			if (entities instanceof Array) {

				for (var e = 0, el = entities.length; e < el; e++) {

					var result = this.addEntity(entities[e]);
					if (result === false) {
						all = false;
					}

				}

			}


			return all;

		},

		removeEntities: function() {

			var entities = this.entities;

			for (var e = 0, el = entities.length; e < el; e++) {

				this.removeEntity(entities[e]);

				el--;
				e--;

			}

			return true;

		},

		setOffset: function(offset) {

			if (offset instanceof Object) {

				this.offset.x = typeof offset.x === 'number' ? offset.x : this.offset.x;
				this.offset.y = typeof offset.y === 'number' ? offset.y : this.offset.y;

				return true;

			}


			return false;

		},

		setPosition: function(position) {

			if (position instanceof Object) {

				this.position.x = typeof position.x === 'number' ? position.x : this.position.x;
				this.position.y = typeof position.y === 'number' ? position.y : this.position.y;

				return true;

			}


			return false;

		},

		setReshape: function(reshape) {

			if (reshape === true || reshape === false) {

				this.__reshape = reshape;

				return true;

			}


			return false;

		},

		setVisible: function(visible) {

			if (visible === true || visible === false) {

				this.visible = visible;

				return true;

			}


			return false;

		}

	};


	return Class;

});

