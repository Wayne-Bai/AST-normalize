/**
 * Main.js Entry point of the whole game
 */

// Entry point of the game
$(document).ready(
		function() {
			// Creating account a singleton
			(new BasicAccount()).init();

			var DESCRIPTIONS_FILE = 'resources/descriptions.json';
			Account.instance.preloadJson(DESCRIPTIONS_FILE);
			Account.instance.preload.call(Account.instance);
			Device.init();
			Resources.init();

			// disable console
			// console.log = function(){};

			// IMAGES
			// in images/low we can put low-resolution images for the slower
			// devices
			Resources.addResolution("low", "images/low/");
			Resources.addResolution("normal", "images/", true);

			// Switch resolution if running on slow device
			if (false && Device.isSlow()) {
				// In Basic Demo there's no low resolution
				Resources.setResolution("low");
			}

			// preloading fonts
			Resources.preloadFonts([ "pusab-white" ]);

			// Init sound-sprites audio
			Sound.init("sounds/total", true, "js/");
			Sound.add("click", "", 0, 0.3);
			Sound.add("monkey", "", 1.0, 1.0);
			Sound.add("final", "", 4.0, 2.0);

			Screen.init(Account.instance);

			/*
			 * Preloading art, changing loader progress
			 */
			var preloadComplete = function() {

				Account.instance.backgroundState.fadeIn(LEVEL_FADE_TIME,
						"white", function() {
							Account.instance.backgroundState
									.fadeOut(LEVEL_FADE_TIME);
							Loader['hideLoadingMessage']();

							// VERY IMPORTANT!
							// Initial state of the game - is an active
							// MenuState
							var data = {
								"Account01" : {
									"class" : "Account",
									"state" : "MenuState01"
								},
								"MenuState01" : {
									"class" : "MenuState",
									"parent" : "Account01"
								}

							};
							Account.instance.readGlobalUpdate(data);
							$(window)['trigger']("resize");
						});
			};
			

			Loader['updateLoadingState'](Loader['currentLoadingState']() + 10);
			var currentPecent = Loader['currentLoadingState']();
			var remainPecent = 100 - currentPecent;
			var preloadProgress = function(data) {
				Loader['updateLoadingState']
						(currentPecent
								+ Math.round(remainPecent
										* (data.loaded / data.total)));
			};

			var mediaArray = [ "background.png", "button.png", "tile.png",
					"monkey.png" ];
			Resources.loadMedia(mediaArray, preloadComplete, preloadProgress);

		});
