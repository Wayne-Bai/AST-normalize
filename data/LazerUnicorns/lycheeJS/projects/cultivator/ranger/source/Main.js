
lychee.define('tool.Main').requires([
	'lychee.data.JSON',
	'tool.state.Profiles',
	'tool.state.Status'
]).includes([
	'lychee.game.Main'
]).tags({
	platform: 'html'
}).exports(function(lychee, tool, global, attachments) {

	var _JSON = lychee.data.JSON;

	/*
	 * HACKS
	 */

	(function(global) {

		if (typeof global.addEventListener !== 'undefined') {

			global.addEventListener('click', function(event) {

				var target = event.target;
				if (target.tagName === 'A' && target.href.match(/lycheejs:\/\//g)) {

					setTimeout(function() {

						var main = global.MAIN || null;
						if (main !== null) {
							main.loop.trigger('update', []);
						}

					}, 200);

				}

			}, true);

		}

	})(global);



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({

			client:   null,
			input:    null,
			jukebox:  null,
			renderer: null,
			server:   null,

			loop: {
				update: 1/10,
				render: 0
			},

			viewport: {
				fullscreen: false
			}

		}, data);


		lychee.game.Main.call(this, settings);



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function(oncomplete) {

			var bootup  = document.querySelector('#status-bootup');
			var connect = document.querySelector('#status-connect');

			if (bootup !== null && connect !== null) {
				bootup.className  = 'hidden';
				connect.className = '';
			}


			var config = new Config('http://localhost:4848/api/Project?timestamp=' + Date.now());

			config.onload = function(result) {

				if (result === true) {

					bootup.className  = 'hidden';
					connect.className = 'hidden';

					oncomplete(true);

				} else {

					connect.className = 'hidden';
					bootup.className  = '';

					oncomplete(true);

				}

			};

			config.load();

		}, this, true);

		this.bind('init', function() {

			this.setState('profiles', new tool.state.Profiles(this));
			this.setState('status',   new tool.state.Status(this));

			this.changeState('status');

		}, this, true);

	};


	Class.prototype = {

	};


	return Class;

});
