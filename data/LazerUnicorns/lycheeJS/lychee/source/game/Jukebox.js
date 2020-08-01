
lychee.define('lychee.game.Jukebox').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	var _refresh_channels = function(amount) {

		var sounds = [];

		for (var a = 0; a < amount; a++) {
			sounds.push(null);
		}

		this.__sounds = sounds;

	};



	/*
	 * IMPLEMENTATION
	 */

	var Class = function(data) {

		var settings = lychee.extend({}, data);


		this.channels = 8;
		this.music    = true;
		this.sound    = true;

		this.__music  = null;
		this.__sounds = [
			null, null,
			null, null,
			null, null,
			null, null
		];


		this.setChannels(settings.channels);
		this.setMusic(settings.music);
		this.setSound(settings.sound);

		settings = null;

	};


	Class.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			var settings = {};


			if (this.channels !== 8) settings.channels = this.channels;
			if (this.music !== true) settings.music    = this.music;
			if (this.sound !== true) settings.sound    = this.sound;


			return {
				'constructor': 'lychee.game.Jukebox',
				'arguments':   [ settings ],
				'blob':        null
			};

		},



		/*
		 * CUSTOM API
		 */

		play: function(track) {

			if (track instanceof Music && this.music === true) {

				var music = this.__music;
				if (music !== null) {
					music.stop();
				}


				this.__music = track;
				this.__music.play();


				return true;

			} else if (track instanceof Sound && this.sound === true) {

				var sounds = this.__sounds;
				for (var s = 0, sl = sounds.length; s < sl; s++) {

					var sound = sounds[s];
					if (sound === null) {

						sounds[s] = track.clone();
						sounds[s].play();

						break;

					} else if (sound.isIdle === true) {

						if (sound.url === track.url) {
							sound.play();
						} else {
							sounds[s] = track.clone();
							sounds[s].play();
						}


						break;

					}

				}


				return true;

			}


			return false;

		},

		stop: function(track) {

			track = (track instanceof Music || track instanceof Sound) ? track : null;


			var found  = false;
			var music  = this.__music;
			var sounds = this.__sounds;


			var s, sl, sound = null;

			if (track instanceof Music) {

				if (music === track) {
					found = true;
					music.stop();
				}


				this.__music = null;

			} else if (track instanceof Sound) {

				for (s = 0, sl = sounds.length; s < sl; s++) {

					sound = sounds[s];

					if (sound !== null && sound.url === track.url && sound.isIdle === false) {
						found = true;
						sound.stop();
					}

				}

			} else if (track === null) {

				if (music !== null) {
					found = true;
					music.stop();
				}


				for (s = 0, sl = sounds.length; s < sl; s++) {

					sound = sounds[s];

					if (sound !== null && sound.isIdle === false) {
						found = true;
						sound.stop();
					}

				}

			}


			return found;

		},

		setChannels: function(channels) {

			channels = typeof channels === 'number' ? channels : null;


			if (channels !== null) {

				this.channels = channels;

				_refresh_channels.call(this, channels);

				return true;

			}


			return false;

		},

		setMusic: function(music) {

			if (music === true || music === false) {

				this.music = music;

				return true;

			}


			return false;

		},

		setSound: function(sound) {

			if (sound === true || sound === false) {

				this.sound = sound;

				return true;

			}


			return false;

		}

	};


	return Class;

});

