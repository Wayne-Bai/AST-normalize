
lychee.define('game.state.Menu').requires([
	'lychee.effect.Alpha',
	'lychee.effect.Color',
	'lychee.effect.Position',
	'lychee.game.Background',
	'game.entity.lycheeJS',
	'game.ui.Button',
	'game.ui.Layer'
]).includes([
	'lychee.game.State'
]).exports(function(lychee, game, global, attachments) {

	var _blob = attachments["json"].buffer;



	/*
	 * HELPERS
	 */

	var _COLOR_CYCLE = [ '#3f7cb6', '#5ad2f0', '#434343' ];

	var _change_submenu = function(current, next) {

		var height    = this.renderer.height;
		var curr_menu = this.queryLayer('ui', current);
		var next_menu = this.queryLayer('ui', next);

		if (curr_menu !== null && next_menu !== null) {

			next_menu.setPosition({
				y: -1 * height
			});

			next_menu.addEffect(new lychee.effect.Position({
				type:     lychee.effect.Position.TYPE.easeout,
				duration: 500,
				position: {
					y: 0
				}
			}));

			curr_menu.addEffect(new lychee.effect.Position({
				type:     lychee.effect.Position.TYPE.easeout,
				duration: 500,
				position: {
					y: 1 * height
				}
			}));

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(main) {

		lychee.game.State.call(this, main);


		this.__index = 0;


		this.deserialize(_blob);



		/*
		 * INITIALIZATION
		 */

		var viewport = this.viewport;
		if (viewport !== null) {

			viewport.bind('reshape', function(orientation, rotation) {

				var renderer = this.renderer;
				if (renderer !== null) {

					var entity = null;
					var width  = renderer.width;
					var height = renderer.height;


					entity = this.queryLayer('background', 'background');
					entity.width  = width;
					entity.height = height;

					entity = this.queryLayer('background', 'lycheeJS');
					entity.position.y = 1/2 * height - 32;

				}

			}, this);

		}

	};


	Class.prototype = {

		/*
		 * STATE API
		 */

		serialize: function() {

			var data = lychee.game.State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Menu';


			return data;

		},

		deserialize: function(blob) {

			lychee.game.State.prototype.deserialize.call(this, blob);


			var entity = null;
			var height = this.renderer.height;



			/*
			 * WELCOME LAYER
			 */

			entity = this.queryLayer('ui', 'welcome > newgame');
			entity.bind('touch', function() {
				this.main.changeState('game');
			}, this);

			entity = this.queryLayer('ui', 'welcome > settings');
			entity.bind('touch', function() {
				_change_submenu.call(this, 'welcome', 'settings');
			}, this);



			/*
			 * SETTINGS LAYER
			 */

			entity = this.queryLayer('ui', 'settings');
			entity.position.y = -1 * height;

			entity = this.queryLayer('ui', 'settings > back');
			entity.bind('touch', function() {
				_change_submenu.call(this, 'settings', 'welcome');
			}, this);

			var isfullscreen = this.main.viewport.fullscreen === true;
			entity = this.queryLayer('ui', 'settings > fullscreen');
			entity.setLabel('Fullscreen ' + (isfullscreen ? 'On' : 'Off'));
			entity.setState((isfullscreen ? 'active' : 'default'));
			entity.bind('#touch', function(entity) {

				var viewport = this.main.viewport;
				var toggle   = !viewport.fullscreen;

				entity.setLabel('Fullscreen ' + (toggle ? 'On': 'Off'));
				entity.setState((toggle ? 'active' : 'default'));
				viewport.setFullscreen(toggle);

			}, this);

			var issound = this.main.jukebox.sound === true;
			entity = this.queryLayer('ui', 'settings > sound');
			entity.setLabel('Sound ' + (issound ? 'On' : 'Off'));
			entity.setState((issound ? 'active' : 'default'));
			entity.bind('#touch', function(entity) {

				var jukebox = this.main.jukebox;
				var toggle  = !jukebox.sound;

				entity.setLabel('Sound ' + (toggle ? 'On': 'Off'));
				entity.setState((toggle ? 'active' : 'default'));
				jukebox.setSound(toggle);

			}, this);

			var isdebug = lychee.debug === true;
			entity = this.queryLayer('ui', 'settings > debug');
			entity.setLabel('Debug ' + (isdebug ? 'On' : 'Off'));
			entity.setState((isdebug ? 'active' : 'default'));
			entity.bind('#touch', function(entity) {

				var toggle = !lychee.debug;

				entity.setLabel('Debug ' + (toggle ? 'On': 'Off'));
				entity.setState((toggle ? 'active' : 'default'));
				lychee.debug = toggle;

			}, this);

		},

		update: function(clock, delta) {

			var background = this.queryLayer('background', 'background');
			if (background !== null) {

				if (background.effects.length === 0) {

					var index = (this.__index++) % _COLOR_CYCLE.length;
					var color = _COLOR_CYCLE[index] || null;
					if (color !== null) {

						background.addEffect(new lychee.effect.Color({
							type:     lychee.effect.Color.TYPE.linear,
							duration: 5000,
							color:    color
						}));

					}

				}

			}


			lychee.game.State.prototype.update.call(this, clock, delta);

		},

		enter: function(data) {

			lychee.game.State.prototype.enter.call(this);

		}

	};


	return Class;

});
