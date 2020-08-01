/**
 * This is a global helper class full of useful methods for audio,<br>
 * input, basic info, and the camera system among other things.<br>
 * Utilities for maths and color and things can be found in <code>FlxU</code>.<br>
 * <code>FlxG</code> is specifically for Flixel-specific properties.<br>
 * <br>
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author ratalaika / ratalaikaGames
 * @author Adam Atomic
 * @class Flixel.FlxG
 */
 
/**
 * @constructor
 */
Flixel.FlxG = function()
{
};

/**
 * If you build and maintain your own version of flixel, you can give it your own name here.
 */
Flixel.FlxG.LIBRARY_NAME = "Flixel";
/**
 * Assign a major version to your library. Appears before the decimal in the console.
 */
Flixel.FlxG.LIBRARY_MAJOR_VERSION = 2;
/**
 * Assign a minor version to your library. Appears after the decimal in the console.
 */
Flixel.FlxG.LIBRARY_MINOR_VERSION = 3;
/**
 * Debugger overlay layout preset: Wide but low windows at the bottom of the screen.
 */
Flixel.FlxG.DEBUGGER_STANDARD = 0;
/**
 * Debugger overlay layout preset: Tiny windows in the screen corners.
 */
Flixel.FlxG.DEBUGGER_MICRO = 1;
/**
 * Debugger overlay layout preset: Large windows taking up bottom half of screen.
 */
Flixel.FlxG.DEBUGGER_BIG = 2;
/**
 * Debugger overlay layout preset: Wide but low windows at the top of the screen.
 */
Flixel.FlxG.DEBUGGER_TOP = 3;
/**
 * Debugger overlay layout preset: Large windows taking up left third of screen.
 */
Flixel.FlxG.DEBUGGER_LEFT = 4;
/**
 * Debugger overlay layout preset: Large windows taking up right third of screen.
 */
Flixel.FlxG.DEBUGGER_RIGHT = 5;
/**
 * Our editor ID for the Admob
 */
Flixel.FlxG.UID = 0;
/**
 * The Android ID.
 */
Flixel.FlxG.DEVICE_ID = 0;
/**
 * Some handy color presets. Less glaring than pure RGB full values. Primarily used in the visual debugger mode for bounding box displays. Red is used to indicate an active, movable, solid object.
 */
Flixel.FlxG.RED = 0xffff0012;
/**
 * Green is used to indicate solid but immovable objects.
 */
Flixel.FlxG.GREEN = 0xff00f225;
/**
 * Blue is used to indicate non-solid objects.
 */
Flixel.FlxG.BLUE = 0xff0090e9;
/**
 * Pink is used to indicate objects that are only partially solid, like one-way platforms.
 */
Flixel.FlxG.PINK = 0xfff01eff;
/**
 * White... for white stuff.
 */
Flixel.FlxG.WHITE = 0xffffffff;
/**
 * And black too.
 */
Flixel.FlxG.BLACK = 0xff000000;
/**
 * Internal tracker for game object.
 */
Flixel.FlxG._game = null;
/**
 * Handy shared variable for implementing your own pause behavior.
 */
Flixel.FlxG.paused = false;
/**
 * Whether you are running in Debug or Release mode. Set automatically by <code>FlxPreloader</code> during startup.
 */
Flixel.FlxG.debug = false;
/**
 * Handy shared variable to check if the pause is on or off.
 */
Flixel.FlxG._disablePause = false;
/**
 * WARNING: Changing this can lead to issues with physics<br>
 * and the recording system.<br>
 * Setting this to false might lead to smoother animations<br>
 * (even at lower fps) at the cost of physics accuracy.
 */
Flixel.FlxG.fixedTimestep = true;
/**
 * Useful when the timestep is NOT fixed (i.e. variable),<br>
 * to prevent jerky movement or erratic behavior at very low fps.<br>
 * Essentially locks the framerate to a minimum value - any slower and<br>
 * you'll get slowdown instead of frameskip; default is 1/10th of a second.
 */
Flixel.FlxG.maxElapsed = 0.1;
/**
 * Represents the amount of time in seconds that passed since last frame.
 */
Flixel.FlxG.elapsed = 0;
/**
 * How fast or slow time should pass in the game; default is 1.0.
 */
Flixel.FlxG.timeScale = 0;
/**
 * The width of the screen in game pixels.
 */
Flixel.FlxG.width = 0;
/**
 * The height of the screen in game pixels.
 */
Flixel.FlxG.height = 0;
/**
 * The dimensions of the game world, used by the quad tree for collisions and overlap checks.
 */
Flixel.FlxG.worldBounds = null;
/**
 * How many times the quad tree should divide the world on each axis.<br>
 * Generally, sparse collisions can have fewer divisons, while denser collision activity usually profits from more.<br>
 * Default value is 6.
 */
Flixel.FlxG.worldDivisions = 0;
/**
 * The width in pixels of the display surface.
 */
Flixel.FlxG.screenWidth = 0;
/**
 * The height in pixels of the display surface.
 */
Flixel.FlxG.screenHeight = 0;
/**
 * Whether to show visual debug displays or not. Default = false.
 */
Flixel.FlxG.visualDebug = false;
/**
 * Setting this to true will disable/skip stuff that isn't necessary for mobile platforms like Android. [BETA]
 */
Flixel.FlxG.mobile = false;
/**
 * The global random number generator seed (for deterministic behavior in recordings and saves).
 */
Flixel.FlxG.globalSeed = 0;
/**
 * All the levels you have completed.
 */
Flixel.FlxG.levels = null;
/**
 * The current level.
 */
Flixel.FlxG.level = 0;
/**
 * The scores accomplished each level.
 */
Flixel.FlxG.scores = null;
/**
 * The current score.
 */
Flixel.FlxG.score = 0;
/**
 * <code>saves</code> is a generic bucket for storing FlxSaves so you can access them whenever you want.
 */
Flixel.FlxG.saves = null;
/**
 * The current save.
 */
Flixel.FlxG.save = null;
/**
 * A reference to a <code>FlxMouse</code> object. Important for input!
 */
Flixel.FlxG.mouse = null;
Flixel.FlxG.touch = null;
/**
 * A reference to a <code>FlxKeyboard</code> object. Important for input!
 */
Flixel.FlxG.keys = null;
/**
 * A handy container for a background music object.
 */
Flixel.FlxG.music = null;
/**
 * A list of all the sounds being played in the game.
 */
Flixel.FlxG.sounds = null;
/**
 * Internal volume level, used for global sound control.
 */
Flixel.FlxG.volumeHandler = null;
/**
 * An array of <code>FlxCamera</code> objects that are used to draw stuff. By default flixel creates one camera the size of the screen.
 */
Flixel.FlxG.cameras = null;
/**
 * Internal, keeps track of all the cameras that would have been added to the stage in Flash.
 */
Flixel.FlxG.displayList = null;
/**
 * By default this just refers to the first entry in the cameras array declared above, but you can do what you like with it.
 */
Flixel.FlxG.camera = null;
/**
 * Allows you to possibly slightly optimize the rendering process IF you are not doing any pre-processing in your game state's <code>draw()</code> call.
 * 
 * @default false
 */
Flixel.FlxG.useBufferLocking = false;
/**
 * Internal helper variable for clearing the cameras each frame.
 */
Flixel.FlxG._cameraRect = null;
/**
 * An array container for plugins. By default flixel uses a couple of plugins: DebugPathDisplay, and TimerManager.
 */
Flixel.FlxG.plugins = null;
/**
 * Useful helper objects for doing Flash-specific rendering. Primarily used for "debug visuals" like drawing bounding boxes directly to the screen buffer.
 */
Flixel.FlxG.flashGfxSprite = null;
Flixel.FlxG.flashGfx = null;
/**
 * Internal storage system to prevent graphics from being used repeatedly in memory.
 */
Flixel.FlxG._cache = null;
/**
 * The camera currently being drawn.
 */
Flixel.FlxG.activeCamera = null;
/**
 * Internal storage system to prevent assets from being used repeatedly in memory.
 */
Flixel.FlxG._assetManager = null;
/**
 * Global tweener for tweening between multiple worlds
 */
Flixel.FlxG.tweener = new Flixel.FlxBasic();
/**
 * If there have been a state change request.
 */
Flixel.FlxG.stateChange = false;
/**
 * The FlxStateStack instance.
 */
Flixel.FlxG.stateStack = null;
/**
 * Helper to refer a (1, 1) FlxPoint.
 */
Flixel.FlxG.basicPoint = new Flixel.FlxPoint(1, 1);

//========================================================//
//INTERFACED PLUGINS//
//========================================================//
/**
* If we have to check the license or not (Use for general licensing).
*/
Flixel.FlxG.checkLicense = false;
/**
* If we have Admob or not (Use for Google Admob).
*/
Flixel.FlxG.withAdmob = false;
/**
* The Ad manager instance (Admob in mobile).
*/
//Flixel.FlxG.adManager:FlxAdManager;
/**
* The rotation manager. (ONLY WORKS ON ANDROID)
*/
//Flixel.FlxG.rotationManager:FlxRotation;
/**
* The Pocket Change manager. (ONLY WORKS ON ANDROID)
*/
//Flixel.FlxG.pocketChange:FlxPocketChange;
/**
* The machine model (Android Mode for example).
*/
Flixel.FlxG.model = "";
/**
* The OS system name.
*/
Flixel.FlxG.systemName = "";
/**
* Indicates if the Internet connection was active or not at the time the game was launched.
*/
Flixel.FlxG.isInternetActive = false;
/**
* USed to check if we are on a ouya or not.
*/
Flixel.FlxG.isOuya = false;

//========================================================//
// HTML5 STUFF //
//========================================================//
/**
 * The Device object with all the stuff about the machine.
 */
Flixel.FlxG.device = null;
/**
 * The sound manager object.
 */
Flixel.FlxG.soundManager = null;
/**
 * The HTML5 Loader cache.
 */
Flixel.FlxG.loaderCache = null;
/**
 * The HTML5 scale manager.
 */
Flixel.FlxG.scaleManager = null;

//========================================================//
// STATIC METHODS //
//========================================================//
/**
 * Returns the library name.
 */
Flixel.FlxG.getLibraryName = function()
{
	return Flixel.FlxG.LIBRARY_NAME + " v" + Flixel.FlxG.LIBRARY_MAJOR_VERSION + "." + Flixel.FlxG.LIBRARY_MINOR_VERSION;
};

/**
 * Log data to the debugger.
 * 
 * @param DataAnything
 *            you want to log to the console.
 */
Flixel.FlxG.log = function(Data, tag)
{
	tag = tag || "Flixel";

	// Check if we have a debuger
	if ((Flixel.FlxG._game !== null) && (Flixel.FlxG._game._debugger !== null)) {
		// Check if the data is not null
		if (Data !== null)
			Flixel.FlxG._game._debugger.log.add(tag + ": " + ((Data instanceof Array) ? Flixel.FlxU.formatArray(Data) : Data.toString()));
		// If the data is null print an stack trace
		else {
			Flixel.FlxG._game._debugger.log.add(tag + ": Data is empty -> stackTrace | " + Data);
		}
	} else {
		// Check if the data is not null
		if (Data !== null)
			console.log(tag + ": " + Data);
		// If the data is null print an stack trace
		else {
			console.log(tag + ": Data is empty -> stackTrace | " + Data);
		}
	}
};

/**
 * Print the current stack trace.
 */
Flixel.FlxG.printStackTrace = function()
{
	Flixel.FlxG.log("", "NOT IMPLEMENTED IN HTLM5");
};

/**
 * Disable the pause system.
 * 
 * @param PauseIf
 *            we disable the pause system or not.
 */
Flixel.FlxG.setDisablePause = function(Pause)
{
	Flixel.FlxG._disablePause = Pause;
};

/**
 * Return the true if we disabled the pause system.
 */
Flixel.FlxG.getDisablePause = function()
{
	return Flixel.FlxG._disablePause;
};

/**
 * Check if the game is paused or not.
 */
Flixel.FlxG.getPause = function()
{
	return Flixel.FlxG.paused;
};

/**
 * Return the game instance (DANGEROUS!!!)
 */
Flixel.FlxG.getGame = function()
{
	return Flixel.FlxG._game;
};

/**
 * This method pause/unpause the game. Only do something if the game was not in the pause/unpause state.
 */
Flixel.FlxG.setPause = function(pause)
{	
	var op;
	if (Flixel.FlxG._disablePause) {
		op = Flixel.FlxG.paused;
		Flixel.FlxG.paused = pause;
		if (Flixel.FlxG.paused != op) {
			if (Flixel.FlxG.paused)
				Flixel.FlxG.pauseAudio();
			else
				Flixel.FlxG.resumeAudio();
		}
		return;
	}

	op = Flixel.FlxG.paused;
	Flixel.FlxG.paused = pause;
	if (Flixel.FlxG.paused != op) {
		if (Flixel.FlxG.paused) {
			Flixel.FlxG.pauseAudio();

			// Dispatch pause event
			if (Flixel.FlxG.getStage() !== null)
				Flixel.FlxG.getStage().dispatchEvent(Flixel.plugin.PauseEvent.getEvent(Flixel.plugin.PauseEvent.PAUSE_IN));
			// stateStack.setBackKeyMode(FlxStateStack.DIRECT_BACK);
		} else {
			Flixel.FlxG.resumeAudio();

			// Dispatch pause event
			if (Flixel.FlxG.getStage() !== null)
				Flixel.FlxG.getStage().dispatchEvent(Flixel.plugin.PauseEvent.getEvent(Flixel.plugin.PauseEvent.PAUSE_OUT));
			// stateStack.setBackKeyMode(FlxStateStack.PAUSE_GAME);
		}
	}
};

/**
 * Add a variable to the watch list in the debugger. This lets you see the value of the variable all the time.
 * 
 * @param AnyObjectA
 *            reference to any object in your game, e.g. Player or Robot or this.
 * @param VariableName
 *            The name of the variable you want to watch, in quotes, as a string: e.g. "speed" or "health".
 * @param DisplayNameOptional,
 *            display your own string instead of the class name + variable name: e.g. "enemy count".
 */
Flixel.FlxG.watch = function(AnyObject, VariableName, DisplayName)
{
	if ((Flixel.FlxG._game !== null) && (Flixel.FlxG._game._debugger !== null))
		Flixel.FlxG._game._debugger.watch.add(AnyObject, VariableName, DisplayName);
};

/**
 * Remove a variable from the watch list in the debugger. Don't pass a Variable Name to remove all watched variables for the specified object.
 * 
 * @param AnyObjectA
 *            reference to any object in your game, e.g. Player or Robot or this.
 * @param VariableName
 *            The name of the variable you want to watch, in quotes, as a string: e.g. "speed" or "health".
 */
Flixel.FlxG.unwatch = function(AnyObject, VariableName)
{
	if ((Flixel.FlxG._game !== null) && (Flixel.FlxG._game._debugger !== null))
		Flixel.FlxG._game._debugger.watch.remove(AnyObject, VariableName);
};

/**
 * How many times you want your game to update each second. More updates usually means better collisions and smoother motion. NOTE: This is NOT the same thing as the Flash Player framerate!
 */
Flixel.FlxG.getFramerate = function()
{
	return Math.round(1000 / Flixel.FlxG._game._step);
};

/**
 * @private
 */
Flixel.FlxG.setFramerate = function(Framerate)
{
	Flixel.FlxG._game._step = 1000 / Framerate;
	if (Flixel.FlxG._game._maxAccumulation < Flixel.FlxG._game._step)
		Flixel.FlxG._game._maxAccumulation = Flixel.FlxG._game._step;
};

/**
 * How many times you want your game to update each second. More updates usually means better collisions and smoother motion. NOTE: This is NOT the same thing as the Flash Player framerate!
 */
Flixel.FlxG.getFlashFramerate = function()
{
	if (Flixel.FlxG._game._canvas !== null)
		return Flixel.FlxG._game._canvas.frameRate;
	else
		return 0;
};

/**
 * @private
 */
Flixel.FlxG.setFlashFramerate = function(Framerate)
{
	Flixel.FlxG._game._flashFramerate = Framerate;
	if (Flixel.FlxG._game._canvas !== null)
		Flixel.FlxG._game._canvas.frameRate = Flixel.FlxG._game._flashFramerate;
	Flixel.FlxG._game._maxAccumulation = 2000 / Flixel.FlxG._game._flashFramerate - 1;
	if (Flixel.FlxG._game._maxAccumulation < Flixel.FlxG._game._step)
		Flixel.FlxG._game._maxAccumulation = Flixel.FlxG._game._step;
};

/**
 * Switch to full-screen display.
 * 
 * @param {boolean}
 *            antialias - You can toggle the anti-alias feature of the canvas before jumping in to full screen (false = retain pixel art, true =
 *            smooth art)
 */
Flixel.FlxG.fullscreen = function(antialias)
{
//	Flixel.FlxG.getStage().displayState = "fullScreen";
//	var fsw = Flixel.FlxG.width * Flixel.FlxG.camera.getZoom();
//	var fsh = Flixel.FlxG.height * Flixel.FlxG.camera.getZoom();
//	Flixel.FlxG.camera.x = (Flixel.FlxG.getStage().fullScreenWidth - fsw) / 2;
//	Flixel.FlxG.camera.y = (Flixel.FlxG.getStage().fullScreenHeight - fsh) / 2;
	if(Flixel.FlxG.scaleManager.isFullScreen())
		Flixel.FlxG.scaleManager.stopFullScreen();
	else
		Flixel.FlxG.scaleManager.startFullScreen();
};

/**
 * Generates a random number. Deterministic, meaning safe to use if you want to record replays in random environments.
 * 
 * @return A <code>Number</code> between 0 and 1.
 */
Flixel.FlxG.random = function()
{
	Flixel.FlxG.globalSeed = Flixel.FlxU.srand(Flixel.FlxG.globalSeed);
	return Flixel.FlxG.globalSeed;
};

/**
 * Shuffles the entries in an array into a new random order. <code>shuffle()</code> is deterministic and safe for use with replays/recordings. HOWEVER, <code>FlxU.shuffle()</code> is NOT
 * deterministic and unsafe for use with replays/recordings.
 * 
 * @param AA
 *            Flash <code>Array</code> object containing...stuff.
 * @param HowManyTimes
 *            How many swaps to perform during the shuffle operation. Good rule of thumb is 2-4 times as many objects are in the list.
 * 
 * @return The same Flash <code>Array</code> object that you passed in in the first place.
 */
Flixel.FlxG.shuffle = function(Objects, HowManyTimes)
{
	var i = 0;
	var index1;
	var index2;
	var object;
	while (i < HowManyTimes) {
		index1 = Flixel.FlxG.random() * Objects.length;
		index2 = Flixel.FlxG.random() * Objects.length;
		object = Objects[index2];
		Objects[index2] = Objects[index1];
		Objects[index1] = object;
		i++;
	}
	return Objects;
};

/**
 * Fetch a random entry from the given array. Will return null if random selection is missing, or array has no entries. <code>getRandom()</code> is deterministic and safe for use with
 * replays/recordings. HOWEVER, <code>FlxU.getRandom()</code> is NOT deterministic and unsafe for use with replays/recordings.
 * 
 * @param ObjectsA
 *            Flash array of objects.
 * @param StartIndex
 *            Optional offset off the front of the array. Default value is 0, or the beginning of the array.
 * @param Length
 *            Optional restriction on the number of values you want to randomly select from.
 * 
 * @return The random object that was selected.
 */
Flixel.FlxG.getRandom = function(Objects, StartIndex, Length)
{
	if (Objects !== null) {
		var l = Length;
		if ((l === 0) || (l > Objects.length - StartIndex))
			l = Objects.length - StartIndex;
		if (l > 0)
			return Objects[StartIndex + uint(Flixel.FlxG.random() * l)];
	}
	return null;
};

/**
 * Load replay data from a string and play it back.
 * 
 * @param DataThe
 *            replay that you want to load.
 * @param StateOptional
 *            parameter: if you recorded a state-specific demo or cutscene, pass a new instance of that state here.
 * @param CancelKeys
 *            Optional parameter: an array of string names of keys (see FlxKeyboard) that can be pressed to cancel the playback, e.g. ["ESCAPE","ENTER"]. Also accepts 2 custom key names: "ANY" and
 *            "MOUSE" (fairly self-explanatory I hope!).
 * @param TimeoutOptional
 *            parameter: set a time limit for the replay. CancelKeys will override this if pressed.
 * @param Callback
 *            Optional parameter: if set, called when the replay finishes. Running to the end, CancelKeys, and Timeout will all trigger Callback(), but only once, and CancelKeys and Timeout will NOT
 *            call stopReplay() if Callback is set!
 */
Flixel.FlxG.loadReplay = function(Data, State, CancelKeys, Timeout, Callback)
{
	Flixel.FlxG._game._replay.load(Data);
	if (State === null)
		Flixel.FlxG.resetGame();
	else
		Flixel.FlxG.switchState(State);
	Flixel.FlxG._game._replayCancelKeys = CancelKeys;
	Flixel.FlxG._game._replayTimer = Timeout * 1000;
	Flixel.FlxG._game._replayCallback = Callback;
	Flixel.FlxG._game._replayRequested = true;
};

/**
 * Resets the game or state and replay requested flag.
 * 
 * @param StandardMode
 *            If true, reload entire game, else just reload current game state.
 */
Flixel.FlxG.reloadReplay = function(StandardMode)
{
	StandardMode = (StandardMode === undefined) ? true : StandardMode;

	if (StandardMode)
		Flixel.FlxG.resetGame();
	else
		Flixel.FlxG.resetState();
	if (Flixel.FlxG._game._replay.frameCount > 0)
		Flixel.FlxG._game._replayRequested = true;
};

/**
 * Stops the current replay.
 */
Flixel.FlxG.stopReplay = function()
{
	Flixel.FlxG._game._replaying = false;
	if (Flixel.FlxG._game._debugger !== null)
		Flixel.FlxG._game._debugger.vcr.stopped();
	Flixel.FlxG.resetInput();
};

/**
 * Resets the game or state and requests a new recording.
 * 
 * @param StandardMode
 *            If true, reset the entire game, else just reset the current state.
 */
Flixel.FlxG.recordReplay = function(StandardMode)
{
	StandardMode = (StandardMode === undefined) ? true : StandardMode;

	if (StandardMode)
		Flixel.FlxG.resetGame();
	else
		Flixel.FlxG.resetState();
	Flixel.FlxG._game._recordingRequested = true;
};

/**
 * Stop recording the current replay and return the replay data.
 * 
 * @return The replay data in simple ASCII format (see <code>FlxReplay.save()</code>).
 */
Flixel.FlxG.stopRecording = function()
{
	Flixel.FlxG._game._recording = false;
	if (Flixel.FlxG._game._debugger !== null)
		Flixel.FlxG._game._debugger.vcr.stopped();
	return Flixel.FlxG._game._replay.save();
};

/**
 * Request a reset of the current game state.
 */
Flixel.FlxG.resetState = function()
{
	Flixel.FlxG._game._requestedState = new (Flixel.FlxU.getClass(Flixel.FlxU.getClassName(Flixel.FlxG._game._state, false)))();
};

/**
 * Like hitting the reset button on a game console, this will re-launch the game as if it just started.
 */
Flixel.FlxG.resetGame = function()
{
	Flixel.FlxG._game._requestedReset = true;
};

/**
 * Reset the input helper objects (useful when changing screens or states)
 */
Flixel.FlxG.resetInput = function()
{
	Flixel.FlxG.keys.reset();
	Flixel.FlxG.mouse.reset();
};

/**
 * Set up and play a looping background soundtrack.
 * 
 * @param MusicThe
 *            sound file you want to loop in the background.
 * @param VolumeHow
 *            loud the sound should be, from 0 to 1.
 */
Flixel.FlxG.playMusic = function(Music, Volume)
{
	if(!Flixel.FlxG.device.canPlayAudio("any"))
		return;

	if (Flixel.FlxG.music === null)
		Flixel.FlxG.music = new Flixel.FlxSound();
	else if (Flixel.FlxG.music.active)
		Flixel.FlxG.music.stop();
	Flixel.FlxG.music.loadEmbedded(Music, true);
	Flixel.FlxG.music.setVolume(Volume);
	Flixel.FlxG.music.survive = true;
	Flixel.FlxG.music.play();
};

/**
 * Creates a new sound object.
 * 
 * @param EmbeddedSound
 *            The embedded sound resource you want to play. To stream, use the optional URL parameter instead.
 * @param Volume
 *            How loud to play it (0 to 1).
 * @param Looped
 *            Whether to loop this sound.
 * @param AutoDestroyWhether
 *            to destroy this sound when it finishes playing. Leave this value set to "false" if you want to re-use this <code>FlxSound</code> instance.
 * @param AutoPlayWhether
 *            to play the sound.
 * @param URLLoad
 *            a sound from an external web resource instead. Only used if EmbeddedSound = null.
 * 
 * @return A <code>FlxSound</code> object.
 */
Flixel.FlxG.loadSound = function(EmbeddedSound, Volume, Looped, AutoDestroy, AutoPlay, URL)
{
	Volume = (Volume === undefined) ? 1.0 : Volume;
	Looped = (Looped === undefined) ? false : Looped;
	AutoDestroy = (AutoDestroy === undefined) ? false : AutoDestroy;
	AutoPlay = (AutoPlay === undefined) ? false : AutoPlay;
	
	if(!Flixel.FlxG.device.canPlayAudio("any"))
		return;
	
	if((EmbeddedSound === null) && (URL === null)) {
		Flixel.FlxG.log("WARNING: loadSound() requires either\nan embedded sound or a URL to work.");
		return null;
	}

	var sound = Flixel.FlxG.sounds.recycle(Flixel.FlxSound);

	if(EmbeddedSound !== null)
		sound.loadEmbedded(EmbeddedSound, Looped, AutoDestroy);
	else
		sound.loadStream(URL, Looped, AutoDestroy);
		sound.setVolume(Volume);
	if(AutoPlay)
		sound.play();
	return sound;
};

/**
 * Creates a new sound object from an embedded <code>Class</code> object. NOTE: Just calls loadSound() with AutoPlay == true.
 * 
 * @param EmbeddedSound
 *            The sound you want to play.
 * @param Volume
 *            How loud to play it (0 to 1).
 * @param Looped
 *            Whether to loop this sound.
 * @param AutoDestroyWhether
 *            to destroy this sound when it finishes playing. Leave this value set to "false" if you want to re-use this <code>FlxSound</code> instance.
 * 
 * @return A <code>FlxSound</code> object.
 */
Flixel.FlxG.play = function(EmbeddedSound, Volume, Looped, AutoDestroy)
{
	return Flixel.FlxG.loadSound(EmbeddedSound, Volume, Looped, AutoDestroy, true);
};

/**
 * Creates a new sound object from a URL. NOTE: Just calls loadSound() with AutoPlay == true.
 * 
 * @param URLThe
 *            URL of the sound you want to play.
 * @param Volume
 *            How loud to play it (0 to 1).
 * @param Looped
 *            Whether or not to loop this sound.
 * @param AutoDestroyWhether
 *            to destroy this sound when it finishes playing. Leave this value set to "false" if you want to re-use this <code>FlxSound</code> instance.
 * 
 * @return A FlxSound object.
 */
Flixel.FlxG.stream = function(URL, Volume, Looped, AutoDestroy)
{
	return Flixel.FlxG.loadSound(null, Volume, Looped, AutoDestroy, true, URL);
};

/**
 * Get the music volume.
 */
Flixel.FlxG.getMusicVolume = function()
{
	return Flixel.FlxG.volumeHandler.musicVolume;
};

/**
 * Get the sound volume.
 */
Flixel.FlxG.getSoundVolume = function()
{
	return Flixel.FlxG.volumeHandler.soundVolume;
};
 
/**
 * Sets the music volume
 */
Flixel.FlxG.setMusicVolume = function(volume)
{
	if(volume < 0)
		volume = 0;
	else if(volume > 1)
		volume = 1;
	
	Flixel.FlxG.volumeHandler.musicVolume = volume;
	Flixel.FlxG.onChange(Flixel.FlxG.volumeHandler.mute ? 0 : volume, Flixel.FlxSound.TYPE_MUSIC);
};

/**
 * Sets the sound volume
 */
Flixel.FlxG.setSoundVolume = function(volume)
{
	if(volume < 0)
		volume = 0;
	else if(volume > 1)
		volume = 1;
	
	Flixel.FlxG.volumeHandler.soundVolume = volume;
	Flixel.FlxG.onChange(Flixel.FlxG.volumeHandler.mute ? 0 : volume, Flixel.FlxSound.TYPE_SFX);
};

/**
 * Get the mute state
 */
Flixel.FlxG.getMute = function()
{
	return Flixel.FlxG.volumeHandler.mute;
};

/**
 * Sets the mute state
 */
Flixel.FlxG.setMute = function(mute)
{
	Flixel.FlxG.volumeHandler.mute = mute;
	if(mute) {
		Flixel.FlxG.onChange(0, Flixel.FlxSound.ALL);
	} else {
		Flixel.FlxG.onChange(Flixel.FlxG.volumeHandler.musicVolume, Flixel.FlxSound.TYPE_MUSIC);
		Flixel.FlxG.onChange(Flixel.FlxG.volumeHandler.soundVolume, Flixel.FlxSound.TYPE_SFX);
	}
};

/**
 * Called by FlxGame on state changes to stop and destroy sounds.
 * 
 * @param ForceDestroyKill
 *            sounds even if they're flagged <code>survive</code>.
 */
Flixel.FlxG.destroySounds = function(ForceDestroy)
{
	ForceDestroy = (ForceDestroy === undefined) ? true : ForceDestroy;
	
	if((Flixel.FlxG.music !== null) && (ForceDestroy || !Flixel.FlxG.music.survive)) {
		Flixel.FlxG.music.destroy();
		Flixel.FlxG.music = null;
	}
	var i = 0;
	var sound;
	var l = Flixel.FlxG.sounds.members.length;

	while(i < l) {
		sound = Flixel.FlxG.sounds.members[i++];
		if((sound !== null && sound !== undefined) && (ForceDestroy || !sound.survive))
			sound.destroy();
	}
	Flixel.FlxG.sounds.clear();
};

/**
 * Called by the game loop to make sure the sounds get updated each frame.
 */
Flixel.FlxG.updateSounds = function()
{
	if((Flixel.FlxG.music !== null) && Flixel.FlxG.music.active)
		Flixel.FlxG.music.update();
	if((Flixel.FlxG.sounds !== null) && Flixel.FlxG.sounds.active)
		Flixel.FlxG.sounds.update();
};

/**
 * Pause all sounds currently playing.
 */
Flixel.FlxG.pauseAudio = function()
{
	if((Flixel.FlxG.music !== null) && Flixel.FlxG.music.exists && Flixel.FlxG.music.active)
		Flixel.FlxG.music.pause();

	var i = 0;
	var sound = null;
	var l = Flixel.FlxG.sounds.length;

	while(i < l) {
		sound = Flixel.FlxG.sounds.members[i++];

		if((sound !== null) && sound.exists && sound.active)
			sound.pause();
	}
};

/**
 * Resume playing existing sounds.
 */
Flixel.FlxG.resumeAudio = function()
{
	if((Flixel.FlxG.music !== null) && Flixel.FlxG.music.exists && Flixel.FlxG.music.isPaused())
		Flixel.FlxG.music.resume();
	var i = 0;
	var sound;
	var l = Flixel.FlxG.sounds.length;

	while(i < l) {
		sound = Flixel.FlxG.sounds.members[i++];
		
		if((sound !== null) && sound.exists)
			sound.resume();
	}
};

/**
 * Check the local bitmap cache to see if a bitmap with this key has been loaded already.
 * 
 * @param KeyThe
 *            string key identifying the bitmap.
 * 
 * @return Whether or not this file can be found in the cache.
 */
Flixel.FlxG.checkBitmapCache = function(Key)
{
	return (Flixel.FlxG._cache[Key] !== undefined) && (Flixel.FlxG._cache[Key] !== null);
};

/**
 * Generates a new <code>BitmapData</code> object (a colored square) and caches it.
 * 
 * @param Width
 *            How wide the square should be.
 * @param Height
 *            How high the square should be.
 * @param Color
 *            What color the square should be (0xAARRGGBB)
 * @param Unique
 *            Ensures that the bitmap data uses a new slot in the cache.
 * @param KeyForce
 *            the cache to use a specific Key to index the bitmap.
 * 
 * @return The <code>BitmapData</code> we just created.
 */
Flixel.FlxG.createBitmap = function(Width, Height, Color, Unique, Key)
{
	Unique = (Unique === undefined) ? false : Unique;
	Key = (Key === undefined) ? null : Key;

	if(Key === null) {
		Key = Width+"x"+Height+":"+Color;
		if(Unique && Flixel.FlxG.checkBitmapCache(Key)) {
			var inc = 0;
			var ukey;
			do {
				ukey = Key + inc++;
			} while(Flixel.FlxG.checkBitmapCache(ukey));
			Key = ukey;
		}
	}

	if(!Flixel.FlxG.checkBitmapCache(Key))
		Flixel.FlxG._cache[Key] = new BitmapData(Width, Height, true, Color);
	return Flixel.FlxG._cache[Key];
};

/**
 * Loads a bitmap from a file, caches it, and generates a horizontally flipped version if necessary.
 * 
 * @param GraphicThe
 *            image file that you want to load.
 * @param ReverseWhether
 *            to generate a flipped version.
 * @param UniqueEnsures
 *            that the bitmap data uses a new slot in the cache.
 * @param Key
 *            Force the cache to use a specific Key to index the bitmap.
 * 
 * @return The <code>BitmapData</code> we just created.
 */
Flixel.FlxG.addBitmap = function(Graphic, Reverse, Unique, Key)
{
	Reverse = (Unique === undefined) ? false : Reverse;
	Unique = (Unique === undefined) ? false : Unique;
	Key = (Key === undefined) ? null : Key;
	
	if(Key === null) {
		Key = String(Graphic)+(Reverse?"_REVERSE_":"");

		if(Unique && Flixel.FlxG.checkBitmapCache(Key)) {
			var inc = 0;
			var ukey;
			do {
				ukey = Key + inc++;
			} while(Flixel.FlxG.checkBitmapCache(ukey));
			Key = ukey;
		}
	}
		
	// If there is no data for this key, generate the requested graphic
	if(!Flixel.FlxG.checkBitmapCache(Key)) {	
		var pixels = null;

		// Manager for atlas images
		if(typeof Graphic === "string") { // Graphic instanceof String will not work for some reason D:!
			pixels = Flixel.FlxG._assetManager.getRegion(Graphic);
		} else {
			Flixel.FlxG.log("Graphic has a wrong format: " + Graphic + ". Only Image or String allowed", "FlxG.addBitmap");
		}
	
		// Check if pixels is null to prevent crazy erros
		if(pixels === null) {
			Flixel.FlxG.log("Graphic was not recogniced: " + Graphic + ". Only Image or String allowed", "FlxG.addBitmap");
			Graphic = Flixel.data.FlxSystemAsset.ImgDefault;
			pixels = Flixel.FlxG.addBitmap(Graphic, Reverse);
		}
	
		// Reverse image if needed
		if(Reverse)
		{
			var newPixels = new BitmapData(pixels.width << 1, pixels.height, true ,0x00000000);
			newPixels.draw(pixels);
			var mtx = new Matrix();
			mtx.scale(-1, 1);
			mtx.translate(newPixels.width, 0);
			newPixels.draw(pixels, mtx);
			//TODO: Make dispose method pixels.dispose();
			pixels = newPixels;	
		}
	
		Flixel.FlxG._cache[Key] = pixels;
	}
	return Flixel.FlxG._cache[Key];
};

/**
 * Dumps the cache's image references.
 */
Flixel.FlxG.clearBitmapCache = function()
{
	//Flixel.FlxG._cache = {};
};

/**
 * Read-only: retrieves the Flash stage object (required for event listeners) Will be null if it's not safe/useful yet.
 */
Flixel.FlxG.getStage = function()
{
	if(Flixel.FlxG._game._canvas !== null)
		return Flixel.FlxG._game._canvas;
	return null;
};

/**
 * Read-only: access the current game state from anywhere.
 */
Flixel.FlxG.getState = function()
{
	return Flixel.FlxG._game._state;
};

/**
 * Read-only: gets the current FlxCamera.
 */
Flixel.FlxG.getActiveCamera = function()
{
	return Flixel.FlxG.activeCamera;
};

/**
 * Switch from the current game state to the one specified here.
 */
Flixel.FlxG.switchState = function(State, saveInStack)
{
	Flixel.FlxG.setState(State, true);
};

/**
 * Switch from the current game state to the one specified here.
 * 
 * @param state
 *            The new state.
 * @param saveInStack
 *            If you want to save the new state in the stack or not.
 */
Flixel.FlxG.setState = function(state, saveInStack)
{
	saveInStack = (saveInStack === undefined) ? true : saveInStack;
	
	// Save the state in the stack if we have to
	//TODO: Make state stack in HTML5
//	if(saveInStack) {
		// Do not save the Splash Screen State
//		if(!state instanceof Flixel.plugin.FlxSplashScreen) {
//			Flixel.FlxG.stateStack.pushState(Flixel.FlxU.getClass(Flixel.FlxU.getClassName(state)));
//		}
	
	// Do not use the normal back mode if we have more than one state
	// if(stateStack.size() > 1)
	// stateStack.setBackKeyMode(FlxStateStack.DIRECT_BACK);
//	}
	
	Flixel.FlxG._game._requestedState = state;
};

/**
 * Change the way the debugger's windows are laid out.
 * 
 * @param LayoutSee
 *            the presets above (e.g. <code>DEBUGGER_MICRO</code>, etc).
 */
Flixel.FlxG.setDebuggerLayout = function(Layout)
{
	if(Flixel.FlxG._game._debugger !== null)
		Flixel.FlxG._game._debugger.setLayout(Layout);
};

/**
 * Just resets the debugger windows to whatever the last selected layout was (<code>DEBUGGER_STANDARD</code> by default).
 */
Flixel.FlxG.resetDebuggerLayout = function()
{
	if(Flixel.FlxG._game._debugger !== null)
		Flixel.FlxG._game._debugger.resetLayout();
};

/**
 * Add a new camera object to the game. Handy for PiP, split-screen, etc.
 * 
 * @param NewCamera
 *            The camera you want to add.
 * 
 * @return This <code>FlxCamera</code> instance.
 */
Flixel.FlxG.addCamera = function(NewCamera)
{
	Flixel.FlxG.cameras.push(NewCamera);
	Flixel.FlxG.displayList.push(NewCamera);
	return NewCamera;
};

/**
 * Remove a camera from the game.
 * 
 * @param Camera
 *            The camera you want to remove.
 * @param Destroy
 *            Whether to call destroy() on the camera, default value is true.
 */
Flixel.FlxG.removeCamera = function(Camera, Destroy)
{
	Destroy = (Destroy === undefined) ? true : Destroy;
	
	if(Camera && Flixel.FlxG._game.contains(Camera._flashSprite)) {
		Flixel.FlxG.displayList.splice(Flixel.FlxG.cameras.indexOf(Camera), 1);
		Flixel.FlxG._game.removeChild(Camera._flashSprite);
	}
	else
		Flixel.FlxG.log("Error removing camera, not part of game.");

	Flixel.FlxG.cameras.splice(Flixel.FlxG.cameras.indexOf(Camera), 1);

	if(Destroy)
		Camera.destroy();
};

/**
 * Dumps all the current cameras and resets to just one camera. Handy for doing split-screen especially.
 * 
 * @param NewCamera
 *            Optional; specify a specific camera object to be the new main camera.
 */
Flixel.FlxG.resetCameras = function(NewCamera)
{
	var cam;
	var i = 0;
	var l = Flixel.FlxG.cameras.length;

	while(i < l) {
		cam = Flixel.FlxG.cameras[i++];
		Flixel.FlxG.displayList.splice(Flixel.FlxG.displayList.indexOf(cam), 1);
		cam.destroy();
	}
	Flixel.FlxG.cameras.length = 0;
	
	if(NewCamera === undefined)
		NewCamera = new Flixel.FlxCamera(0, 0, Flixel.FlxG.width, Flixel.FlxG.height);
	Flixel.FlxG.camera = Flixel.FlxG.addCamera(NewCamera);
};

/**
 * All screens are filled with this color and gradually return to normal.
 * 
 * @param ColorThe
 *            color you want to use.
 * @param Duration
 *            How long it takes for the flash to fade.
 * @param OnComplete
 *            A function you want to run when the flash finishes.
 * @param ForceForce
 *            the effect to reset.
 */
Flixel.FlxG.flash = function(Color, Duration, OnComplete, Force)
{
	Color = Color || 0xffffffff;
	Duration = Duration || 1;
	Force = Force || false;
	
	var i = 0;
	var l = Flixel.FlxG.cameras.length;
	while(i < l)
		Flixel.FlxG.cameras[i++].flash(Color,Duration,OnComplete,Force);
};

/**
 * The screen is gradually filled with this color.
 * 
 * @param ColorThe
 *            color you want to use.
 * @param Duration
 *            How long it takes for the fade to finish.
 * @param OnComplete
 *            A function you want to run when the fade finishes.
 * @param ForceForce
 *            the effect to reset.
 */
Flixel.FlxG.fade = function(Color, Duration, OnComplete, Force)
{
	Color = Color || 0xff000000;
	Duration = Duration || 1;
	Force = Force || false;

	var i = 0;
	var l = Flixel.FlxG.cameras.length;
	while(i < l)
		Flixel.FlxG.cameras[i++].fade(Color, Duration, OnComplete, Force);
};

/**
 * A simple screen-shake effect.
 * 
 * @param Intensity
 *            Percentage of screen size representing the maximum distance that the screen can move while shaking.
 * @param Duration
 *            The length in seconds that the shaking effect should last.
 * @param OnComplete
 *            A function you want to run when the shake effect finishes.
 * @param ForceForce
 *            the effect to reset (default = true, unlike flash() and fade()!).
 * @param Direction
 *            Whether to shake on both axes, just up and down, or just side to side (use class constants SHAKE_BOTH_AXES, SHAKE_VERTICAL_ONLY, or SHAKE_HORIZONTAL_ONLY). Default value is
 *            SHAKE_BOTH_AXES (0).
 */
Flixel.FlxG.shake = function(Intensity, Duration, OnComplete, Force, Direction)
{
	Intensity = Intensity || 0.5;
	Duration = Duration || 0.5;
	Force = (Force === undefined) ? true : Force;
	Direction = Direction || 0;
	
	var i = 0;
	var l = Flixel.FlxG.cameras.length;
	while(i < l)
		Flixel.FlxG.cameras[i++].shake(Intensity, Duration, OnComplete, Force, Direction);
};

/**
 * Get and set the background color of the game. Get functionality is equivalent to camera.bgColor. Set functionality sets the background color of all the current cameras.
 */
Flixel.FlxG.getBgColor = function()
{
	if(Flixel.FlxG.camera === null)
		return 0xff000000;
	else
		return Flixel.FlxG.camera.bgColor;
};

/**
 * Set the background color of all the game cameras.
 */
Flixel.FlxG.setBgColor = function(Color)
{
	var i = 0;
	var l = Flixel.FlxG.cameras.length;
	while(i < l)
		Flixel.FlxG.cameras[i++].bgColor = Color;
};

/**
 * Call this function to see if one <code>FlxObject</code> overlaps another. Can be called with one object and one group, or two groups, or two objects, whatever floats your boat! For maximum
 * performance try bundling a lot of objects together using a <code>FlxGroup</code> (or even bundling groups together!).
 * 
 * <p>
 * NOTE: does NOT take objects' scrollfactor into account, all overlaps are checked in world space.
 * </p>
 * 
 * @param ObjectOrGroup1
 *            The first object or group you want to check.
 * @param ObjectOrGroup2
 *            The second object or group you want to check. If it is the same as the first, flixel knows to just do a comparison within that group.
 * @param NotifyCallback
 *            A function with two <code>FlxObject</code> parameters - e.g. <code>myOverlapFunction(Object1:FlxObject,Object2:FlxObject)</code> - that is called if those two objects overlap.
 * @param ProcessCallback
 *            A function with two <code>FlxObject</code> parameters - e.g. <code>myOverlapFunction(Object1:FlxObject,Object2:FlxObject)</code> - that is called if those two objects overlap. If a
 *            ProcessCallback is provided, then NotifyCallback will only be called if ProcessCallback returns true for those objects!
 * 
 * @return Whether any oevrlaps were detected.
 */
Flixel.FlxG.overlap = function(ObjectOrGroup1, ObjectOrGroup2, NotifyCallback, ProcessCallback)
{
	if(ObjectOrGroup1 === null || ObjectOrGroup1 === undefined)
		ObjectOrGroup1 = Flixel.FlxG.getState();
	if(ObjectOrGroup2 === ObjectOrGroup1)
		ObjectOrGroup2 = null;
	Flixel.system.FlxQuadTree.divisions = Flixel.FlxG.worldDivisions;
	var quadTree = Flixel.system.FlxQuadTree.getNew(Flixel.FlxG.worldBounds.x, Flixel.FlxG.worldBounds.y, Flixel.FlxG.worldBounds.width, Flixel.FlxG.worldBounds.height, null);
	quadTree.load(ObjectOrGroup1, ObjectOrGroup2, NotifyCallback, ProcessCallback);
	var result = quadTree.execute();
	quadTree.destroy();
	return result;
};

/**
 * Call this function to see if one <code>FlxObject</code> collides with another. Can be called with one object and one group, or two groups, or two objects, whatever floats your boat! For maximum
 * performance try bundling a lot of objects together using a <code>FlxGroup</code> (or even bundling groups together!).
 * 
 * <p>
 * This function just calls overlap and presets the ProcessCallback parameter to FlxObject.separate. To create your own collision logic, write your own ProcessCallback and use overlap to set it up.
 * </p>
 * 
 * <p>
 * NOTE: does NOT take objects' scrollfactor into account, all overlaps are checked in world space.
 * </p>
 * 
 * @param ObjectOrGroup1
 *            The first object or group you want to check.
 * @param ObjectOrGroup2
 *            The second object or group you want to check. If it is the same as the first, flixel knows to just do a comparison within that group.
 * @param NotifyCallback
 *            A function with two <code>FlxObject</code> parameters - e.g. <code>myOverlapFunction(Object1:FlxObject,Object2:FlxObject)</code> - that is called if those two objects overlap.
 * 
 * @return Whether any objects were successfully collided/separated.
 */
Flixel.FlxG.collide = function(ObjectOrGroup1, ObjectOrGroup2, NotifyCallback)
{
	return Flixel.FlxG.overlap(ObjectOrGroup1, ObjectOrGroup2, NotifyCallback, Flixel.FlxObject.separate);
};

/**
 * Adds a new plugin to the global plugin array.
 * 
 * @param Plugin
 *            Any object that extends FlxBasic. Useful for managers and other things. See com.ratalaika.Flixel.plugin for some examples!
 * 
 * @return The same <code>FlxBasic</code>-based plugin you passed in.
 */
Flixel.FlxG.addPlugin = function(Plugin)
{
	// Don't add repeats
	var pluginList = Flixel.FlxG.plugins;
	var i = 0;
	var l = pluginList.length;

	while(i < l) {
		if(pluginList[i++].toString() == Plugin.toString())
			return Plugin;
	}
	
	// no repeats! safe to add a new instance of this plugin
	pluginList.push(Plugin);
	return Plugin;
};

/**
 * Retrieves a plugin based on its class name from the global plugin array.
 * 
 * @param ClassType
 *            The class name of the plugin you want to retrieve. See the <code>FlxPath</code> or <code>FlxTimer</code> constructors for example usage.
 * 
 * @return The plugin object, or null if no matching plugin was found.
 */
Flixel.FlxG.getPlugin = function(ClassType)
{
	var pluginList = Flixel.FlxG.plugins;
	var i = 0;
	var l = pluginList.length;

	while(i < l) {
		if(pluginList[i] instanceof ClassType)
			return Flixel.FlxG.plugins[i];
		i++;
	}
	return null;
};

/**
 * Removes an instance of a plugin from the global plugin array.
 * 
 * @param Plugin
 *            The plugin instance you want to remove.
 * 
 * @return The same <code>FlxBasic</code>-based plugin you passed in.
 */
Flixel.FlxG.removePlugin = function(Plugin)
{
	// Don't add repeats
	var pluginList = Flixel.FlxG.plugins;
	var i = pluginList.length-1;

	while(i >= 0) {
		if(pluginList[i] == Plugin)
			pluginList.splice(i,1);
		i--;
	}
	return Plugin;
};

/**
 * Removes an instance of a plugin from the global plugin array.
 * 
 * @param ClassType
 *            The class name of the plugin type you want removed from the array.
 * 
 * @return Whether or not at least one instance of this plugin type was removed.
 */
Flixel.FlxG.removePluginType = function(ClassType)
{
	// Don't add repeats
	var results = false;
	var pluginList = Flixel.FlxG.plugins;
	var i = pluginList.length-1;

	while(i >= 0) {
		if(pluginList[i] instanceof ClassType) {
			pluginList.splice(i,1);
			results = true;
		}
		i--;
	}

	return results;
};

/**
 * Called by <code>FlxGame</code> to set up <code>FlxG</code> during <code>FlxGame</code>'s constructor.
 */
Flixel.FlxG.init = function(Game, Width, Height, Zoom, ScaleMode)
{
	// Set the game stuff
	Flixel.FlxG._game = Game;
	Flixel.FlxG.width = Width;
	Flixel.FlxG.height = Height;
	Flixel.FlxG.scaleManager = new ScaleManager(Width, Height);
	
	// Set the sound stuff
	Flixel.FlxG.sounds = new Flixel.FlxGroup();
	Flixel.FlxG.volumeHandler = new Flixel.system.FlxVolumeHandler();
	Flixel.FlxG.music = null;
	
	// Initialize all the FlxG general variables
	Flixel.FlxG.stateStack = new Flixel.plugin.FlxStateStack();
	Flixel.FlxG.stateChange = false;
	Flixel.FlxG._cache = {};
	Flixel.FlxG._assetManager = Flixel.system.atlas.FlxAssetManager.getInstance();

	//TODO: Flixel.system.atlas.FlxSystemAsset.init();
	
	// Set up cameras
	Flixel.FlxCamera.defaultZoom = Zoom;
	Flixel.FlxCamera.defaultScaleMode = ScaleMode;
	Flixel.FlxG.cameras = [];
	Flixel.FlxG.displayList = [];
	Flixel.FlxG.camera = null;
	Flixel.FlxG._cameraRect = new Flixel.FlxRect();
	Flixel.FlxG.useBufferLocking = false;

	// Set up flash gfx sprite
	if(Flixel.FlxG.flashGfxSprite === null) {
		Flixel.FlxG.flashGfxSprite = new BitmapData(Flixel.FlxG.width, Flixel.FlxG.height, true, 0x0);
		Flixel.FlxG.flashGfx = Flixel.FlxG.flashGfxSprite.context;
	}

	// Set the plugin stuff
	Flixel.FlxG.plugins = [];
	Flixel.FlxG.addPlugin(new Flixel.plugin.DebugPathDisplay());
	Flixel.FlxG.addPlugin(new Flixel.plugin.TimerManager());
	Flixel.FlxG.addPlugin(Flixel.FlxG.soundManager);

	// Set the input stuff
	Flixel.FlxG.mouse = new Flixel.system.input.Mouse(Flixel.FlxG._game._mouse);
	Flixel.FlxG.touch = Flixel.FlxG.mouse;
	Flixel.FlxG.keys = new Flixel.system.input.Keyboard();
	Flixel.FlxG.mobile = Flixel.FlxG.device.isMobile;

	Flixel.FlxG.levels = [];
	Flixel.FlxG.scores = [];
	Flixel.FlxG.visualDebug = false;
};

/**
 * Called whenever the game is reset, doesn't have to do quite as much work as the basic initialization stuff.
 */
Flixel.FlxG.reset = function()
{
	Flixel.FlxG.clearBitmapCache();
	Flixel.FlxG.resetInput();
	Flixel.FlxG.destroySounds(true);

	Flixel.FlxG.levels.length = 0;
	Flixel.FlxG.scores.length = 0;
	Flixel.FlxG.level = 0;
	Flixel.FlxG.score = 0;
	Flixel.FlxG.fixedTimestep = true;
	Flixel.FlxG.maxElapsed = 0.1;
	Flixel.FlxG.paused = false;
	Flixel.FlxG.timeScale = 1.0;
	Flixel.FlxG.elapsed = 0;
	Flixel.FlxG.globalSeed = Math.random();
	Flixel.FlxG.worldBounds = new Flixel.FlxRect(-10, -10, Flixel.FlxG.width + 20, Flixel.FlxG.height + 20);
	Flixel.FlxG.worldDivisions = 6;

	var debugPathDisplay = Flixel.FlxG.getPlugin(Flixel.plugin.DebugPathDisplay);
	if(debugPathDisplay !== null)
		debugPathDisplay.clear();
};

/**
 * Called by the game object to update the keyboard and mouse input tracking objects.
 */
Flixel.FlxG.updateInput = function()
{
	// Update the Keyboard inputs
	Flixel.FlxG.keys.update();

	if(!Flixel.FlxG._game._debuggerUp || !Flixel.FlxG._game._debugger.hasMouse)
		Flixel.FlxG.mouse.update();
};

/**
 * Called by the game object to lock all the camera buffers and clear them for the next draw pass.
 */
Flixel.FlxG.lockCameras = function()
{
	var cam = Flixel.FlxG.activeCamera;

	if(!cam.exists || !cam.visible)
		return;

	if(Flixel.FlxG.useBufferLocking)
		cam.buffer.lock();

	cam.fill(cam.bgColor);
	cam.screen.dirty = true;
};

/**
 * Called by the game object to draw the special FX and unlock all the camera buffers.
 */
Flixel.FlxG.unlockCameras = function()
{
	var cam = Flixel.FlxG.activeCamera;
	
	if(!cam.exists || !cam.visible)
		return;
	
	cam.drawFX();
	if(Flixel.FlxG.useBufferLocking)
		cam.buffer.unlock();
};

/**
 * Called by the game object to update the cameras and their tracking/special effects logic.
 */
Flixel.FlxG.updateCameras = function()
{
	var cam;
	var cams = Flixel.FlxG.cameras;
	var i = 0;
	var l = cams.length;
	while(i < l)
	{
		cam = cams[i++];
		if((cam !== undefined) && cam.exists && cam.active)
			cam.update();
	}
};

/**
 * Used by the game object to call <code>update()</code> on all the plugins.
 */
Flixel.FlxG.updatePlugins = function()
{
	var plugin;
	var pluginList = Flixel.FlxG.plugins;
	var i = 0;
	var l = pluginList.length;
	while(i < l)
	{
		plugin = pluginList[i++];
		if(plugin.exists && plugin.active)
			plugin.update();
	}
};

/**
 * Used by the game object to call <code>draw()</code> on all the plugins.
 */
Flixel.FlxG.drawPlugins = function()
{
	var plugin;
	var pluginList = Flixel.FlxG.plugins;
	var i = 0;
	var l = pluginList.length;
	while (i < l) {
		plugin = pluginList[i++];
		if (plugin.exists && plugin.visible)
			plugin.draw();
	}
};

/**
 * Vibrates for the given amount of time. Note that you'll need the permission <code> <uses-permission android:name="android.permission.VIBRATE" /></code> in your manifest file in order for this to
 * work.
 * 
 * @param Milliseconds
 *            The amount of time to vibrate for.
 */
Flixel.FlxG.vibrate = function(Milliseconds)
{
	if(navigator.vibrate)
		navigator.vibrate(Milliseconds);
};

/**
 * Vibrate with a given pattern. Pass in an array of ints that are the times at which to turn on or off the vibrator. The first one is how long to wait before turning it on, and then after that it
 * alternates. If you want to repeat, pass the index into the pattern at which to start the repeat.
 * 
 * @param Pattern
 *            An array of longs of times to turn the vibrator on or off.<br>
 *            The odd parameters in the list is vibration time, the even ones are pauses.
 * @param Repeat
 *            NOT WORKING ON HTML5
 */
Flixel.FlxG.vibratePattern = function(Pattern, Repeat)
{
	if(navigator.vibrate)
		navigator.vibrate(Pattern);
};

/**
 * Stops the vibrator.
 */
Flixel.FlxG.stopVibrate = function()
{
	if(navigator.vibrate)
		navigator.vibrate(0);
};

/**
 * Change the Pause Screen.
 */
Flixel.FlxG.getPauseGroup = function()
{
	return Flixel.FlxG._game._pause;
};

/**
 * Switch to a previous game state.
 */
Flixel.FlxG.previousGameState = function()
{
	var stateClass = null;

	// Check if we have previous game states
	if (Flixel.FlxG.stateStack.size() > 0)
		stateClass = Flixel.FlxG.stateStack.popState();
	// If we do not have previous game states just switch to normal back state
	if (Flixel.FlxG.stateStack.size() === 0)
		Flixel.FlxG.stateStack.setBackKeyMode(Flixel.plugin.FlxStateStack.NORMAL);

	Flixel.FlxG._game._requestedState = new stateClass();

	// If we had a previous game state just switch to it
	Flixel.FlxG.stateChange = true;
};

/**
 * This method clear the queue of states
 */
Flixel.FlxG.clearPreviousGameStates = function()
{
	Flixel.FlxG.stateStack.clear();
};

/**
 * Exits the application.
 */
Flixel.FlxG.exit = function()
{
	Flixel.FlxG.log("EXIT DO NOTHIG IN Flixel-HTML5!!!");
};

/**
 * A helper method. This method equals: FlxLanguagesManager.getInstance().getString(string)
 */
Flixel.FlxG.getString = function(s)
{
	return Flixel.FlxLanguagesManager.getInstance().getString(s);
};

/**
 * Returns the total time since the game started.
 */
Flixel.FlxG.getTotal = function()
{
	return getTimer();
};

/**
 * Return true if we are on a REAL OUYA device.
 */
Flixel.FlxG.inOUYA = function()
{
	return false;
};

/**
 * Return the FlxAssetManager instance.
 */
Flixel.FlxG.getAssetManager = function()
{
	return Flixel.FlxG._assetManager;
};

/**
 * Tweens numeric public properties of an Object. Shorthand for creating a MultiVarTween tween, starting it and adding it to a Tweener.
 * 
 * @param objectThe
 *            object containing the properties to tween.
 * @param valuesAn
 *            object containing key/value pairs of properties and target values.
 * @param duration
 *            Duration of the tween.
 * @param optionsAn
 *            object containing key/value pairs of the following optional parameters: typeTween type. complete Optional completion callback function. easeOptional easer function. tweenerThe Tweener to
 *            add this Tween to.
 * @return The added MultiVarTween object.
 */
// Flixel.FlxG.tween(FlxBasic object, HashMap<String, Float> values, float duration, options:*=null):MultiVarTween
// {
// int type = FlxTween.ONESHOT;
// IFlxTween complete = null;
// IFlxTweenEase ease = null;
// FlxBasic tweener = FlxG.tweener;
//	
// if (options !== null) {
// type = options.type;
// complete = options.complete;
// ease = options.ease;
// tweener = options.tweener;
// }
// MultiVarTween tween = new MultiVarTween(complete, type);
// tween.tween(object, values, duration, ease);
// tweener.addTween(tween);
// return tween;
// }
// ========================================================//
// CALLBACKS //
// ========================================================//
/**
 * Set this hook to get a callback whenever the volume changes. Function should take the form <code>myVolumeHandler(Volume:Number)</code>.
 */
Flixel.FlxG.onChange = function(volume, type)
{
	switch (type) {
		case Flixel.FlxSound.TYPE_MUSIC:
			if (Flixel.FlxG.music !== null)
				Flixel.FlxG.music.setVolume(volume);
			break;
		case Flixel.FlxSound.TYPE_SFX:
			// Update all the sounds
			for (var i = 0; i < Flixel.FlxG.sounds.members.length; i++) {
				Flixel.FlxG.sounds.members[i].setVolume(volume);
			}
			break;
		case Flixel.FlxSound.ALL:
			if (Flixel.FlxG.music !== null)
				Flixel.FlxG.music.setVolume(volume);
			// Update all the sounds
			for (var t = 0; t < Flixel.FlxG.sounds.members.length; t++) {
				Flixel.FlxG.sounds.members[t].setVolume(volume);
			}
			break;
	}
};

/**
 * Returns the class name.
 */
Flixel.FlxG.prototype.toString = function()
{
	return "FlxG";
};