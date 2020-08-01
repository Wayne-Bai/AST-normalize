/**
 * Detects device support capabilities.<br>
 * Using some elements from System.js by MrDoob and Modernizr<br>
 * Took from Phaser.<br>
 * 
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author ratalaika / ratalaikaGames
 * @author Richard Davey <rich@photonstorm.com>
 */

/**
 * Class constructor.<br>
 * Runs all the tests.
 */
var Device = function()
{
	// Run the checks
	this.checkOS();
	this.checkAudio();
	this.checkBrowser();
	this.checkCSS3D();
	this.checkDevice();
	this.checkFeatures();
};

/**
 * An optional 'fix' for the horrendous Android stock browser bug
 * https://code.google.com/p/android/issues/detail?id=39247
 * 
 * @property {boolean} patchAndroidClearRectBug - Description.
 * @default
 */
Device.prototype.patchAndroidClearRectBug = false;

// Operating System

/**
 * @property {boolean} desktop - Is running desktop?
 * @default
 */
Device.prototype.desktop = false;

/**
 * @property {boolean} iOS - Is running on iOS?
 * @default
 */
Device.prototype.iOS = false;

/**
 * @property {boolean} cocoonJS - Is the game running under CocoonJS?
 * @default
 */
Device.prototype.cocoonJS = false;

/**
 * @property {boolean} cocoonJSApp - Is the game running under CocoonJS.App?
 * @default
 */
Device.prototype.cocoonJSApp = false;

/**
 * @property {boolean} cordova - Is running under Apache Cordova?
 * @default
 */
Device.prototype.cordova = false;

/**
 * @property {boolean} node - Is running under Node.js?
 * @default
 */
Device.prototype.node = false;

/**
 * @property {boolean} node - Is running under Node-Webkit?
 * @default
 */
Device.prototype.nodeWebkit = false;

/**
 * @property {boolean} node - Is running under Ejecta?
 * @default
 */
Device.prototype.ejecta = false;

/**
 * @property {boolean} node - Is running under Intel Crosswalk XDK?
 * @default
 */
Device.prototype.crosswalk = false;

/**
 * @property {boolean} android - Is running on android?
 * @default
 */
Device.prototype.android = false;

/**
 * @property {boolean} chromeOS - Is running on chromeOS?
 * @default
 */
Device.prototype.chromeOS = false;

/**
 * @property {boolean} linux - Is running on linux?
 * @default
 */
Device.prototype.linux = false;

/**
 * @property {boolean} macOS - Is running on macOS?
 * @default
 */
Device.prototype.macOS = false;

/**
 * @property {boolean} windows - Is running on windows?
 * @default
 */
Device.prototype.windows = false;

/**
 * @property {boolean} firefoxOS - Is running on FirefoxOS phones?
 * @default
 */
Device.prototype.firefoxOS = false;

/**
 * @property {boolean} firefoxOS - Is running on a Kindle Fire?
 * @default
 */
Device.prototype.kindle = false;

/**
 * @property {boolean} firefoxOS - Is running on a Playstation Vita?
 * @default
 */
Device.prototype.vita = false;


// Features

/**
 * @property {boolean} canvas - Is canvas available?
 * @default
 */
Device.prototype.canvas = false;

/**
 * @property {boolean} file - Is file available?
 * @default
 */
Device.prototype.file = false;

/**
 * @property {boolean} fileSystem - Is fileSystem available?
 * @default
 */
Device.prototype.fileSystem = false;

/**
 * @property {boolean} localStorage - Is localStorage available?
 * @default
 */
Device.prototype.localStorage = false;

/**
 * @property {boolean} webGL - Is webGL available?
 * @default
 */
Device.prototype.webGL = false;

/**
 * @property {boolean} worker - Is worker available?
 * @default
 */
Device.prototype.worker = false;

/**
 * @property {boolean} touch - Is touch available?
 * @default
 */
Device.prototype.touch = false;

/**
 * @property {boolean} mspointer - Is mspointer available?
 * @default
 */
Device.prototype.mspointer = false;

/**
 * @property {boolean} css3D - Is css3D available?
 * @default
 */
Device.prototype.css3D = false;

/**
 * @property {boolean} pointerLock - Is Pointer Lock available?
 * @default
 */
Device.prototype.pointerLock = false;

/**
 * @property {boolean} typedArray - Does the browser support TypedArrays?
 * @default
 */
Device.prototype.typedArray = false;

/**
 * @property {boolean} vibration - Does the device support the Vibration API?
 * @default
 */
Device.prototype.vibration = false;

/**
 * @property {boolean} getUserMedia - Does the device support the getUserMedia API?
 * @default
 */
Device.prototype.getUserMedia = false;

/**
 * @property {boolean} quirksMode - Is the browser running in strict mode (false) or quirks mode? (true)
 * @default
 */
Device.prototype.quirksMode = false;

// Browser

/**
 * @property {boolean} arora - Is running in arora?
 * @default
 */
Device.prototype.arora = false;

/**
 * @property {boolean} chrome - Is running in chrome?
 * @default
 */
Device.prototype.chrome = false;

/**
 * @property {boolean} epiphany - Is running in epiphany?
 * @default
 */
Device.prototype.epiphany = false;

/**
 * @property {boolean} firefox - Is running in firefox?
 * @default
 */
Device.prototype.firefox = false;

/**
 * @property {boolean} ie - Is running in ie?
 * @default
 */
Device.prototype.ie = false;

/**
 * @property {number} ieVersion - Version of ie?
 * @default
 */
Device.prototype.ieVersion = 0;

/**
 * @property {boolean} trident - Set to true if running a Trident version of Internet Explorer (IE11+)
 * @default
 */
Device.prototype.trident = false;

/**
 * @property {number} tridentVersion - If running in Internet Explorer 11 this will contain the major version number. See http://msdn.microsoft.com/en-us/library/ie/ms537503(v=vs.85).aspx
 * @default
 */
Device.prototype.tridentVersion = 0;

/**
 * @property {boolean} mobileSafari - Is running in mobileSafari?
 * @default
 */
Device.prototype.mobileSafari = false;

/**
 * @property {boolean} midori - Is running in midori?
 * @default
 */
Device.prototype.midori = false;

/**
 * @property {boolean} opera - Is running in opera?
 * @default
 */
Device.prototype.opera = false;

/**
 * @property {boolean} safari - Is running in safari?
 * @default
 */
Device.prototype.safari = false;

/**
 * @property {boolean} webApp - Set to true if running as a WebApp, i.e. within a WebView
 * @default
 */
Device.prototype.webApp = false;

/**
 * @property {boolean} silk - Set to true if running in the Silk browser (as used on the Amazon Kindle)
 * @default
 */
Device.prototype.silk = false;

// Audio

/**
 * @property {boolean} audioData - Are Audio tags available?
 * @default
 */
Device.prototype.audioData = false;

/**
 * @property {boolean} webAudio - Is the WebAudio API available?
 * @default
 */
Device.prototype.webAudio = false;

/**
 * @property {boolean} ogg - Can this device play ogg files?
 * @default
 */
Device.prototype.ogg = false;

/**
 * @property {boolean} opus - Can this device play opus files?
 * @default
 */
Device.prototype.opus = false;

/**
 * @property {boolean} mp3 - Can this device play mp3 files?
 * @default
 */
Device.prototype.mp3 = false;

/**
 * @property {boolean} wav - Can this device play wav files?
 * @default
 */
Device.prototype.wav = false;
/**
 * Can this device play m4a files?
 * 
 * @property {boolean} m4a - True if this device can play m4a files.
 * @default
 */
Device.prototype.m4a = false;

/**
 * @property {boolean} webm - Can this device play webm files?
 * @default
 */
Device.prototype.webm = false;

// Device

/**
 * @property {boolean} iPhone - Is running on iPhone?
 * @default
 */
Device.prototype.iPhone = false;

/**
 * @property {boolean} iPhone4 - Is running on iPhone4?
 * @default
 */
Device.prototype.iPhone4 = false;

/**
 * @property {boolean} iPad - Is running on iPad?
 * @default
 */
Device.prototype.iPad = false;

/**
 * @property {boolean} windowsPhone - Is running on Windows Phone?
 * @default
 */
Device.prototype.windowsPhone = false;

/**
 * @property {number} pixelRatio - PixelRatio of the host device?
 * @default
 */
Device.prototype.pixelRatio = 0;

/**
 * @property {boolean} isMobile - Is running on phones?
 * @default
 */
Device.prototype.isMobile = false;

/**
 * @property {boolean} littleEndian - Is the device big or little endian? (only detected if the browser supports TypedArrays)
 * @default
 */
Device.prototype.littleEndian = false;

/**
 * @property {boolean} support32bit - Does the device context support 32bit pixel manipulation using array buffer views?
 * @default
 */
Device.prototype.support32bit = false;

/**
 * @property {boolean} fullscreen - Does the browser support the Full Screen API?
 * @default
 */
Device.prototype.fullscreen = false;

/**
 * @property {string} requestFullscreen - If the browser supports the Full Screen API this holds the call you need to use to activate it.
 * @default
 */
Device.prototype.requestFullscreen = '';

/**
 * @property {string} cancelFullscreen - If the browser supports the Full Screen API this holds the call you need to use to cancel it.
 * @default
 */
Device.prototype.cancelFullscreen = '';

/**
 * @property {boolean} fullscreenKeyboard - Does the browser support access to the Keyboard during Full Screen mode?
 * @default
 */
Device.prototype.fullscreenKeyboard = false;

Device.LITTLE_ENDIAN = false;

/**
 * Check which OS is game running on.
 * 
 * @method Device#checkOS
 * @private
 */
Device.prototype.checkOS = function()
{
	var ua = navigator.userAgent;

	if (/Playstation Vita/.test(ua)) {
		this.vita = true;
	} else if (/Kindle/.test(ua) || /\bKF[A-Z][A-Z]+/.test(ua) || /Silk.*Mobile Safari/.test(ua)) {
		this.kindle = true;
		// This will NOT detect early generations of Kindle Fire, I think there is no reliable way...
		// E.g. "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Silk/1.1.0-80) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=true"
	} else if (/Android/.test(ua)) {
		this.android = true;
	} else if (/CrOS/.test(ua)) {
		this.chromeOS = true;
	} else if (/iP[ao]d|iPhone/i.test(ua)) {
		this.iOS = true;
	} else if (/Linux/.test(ua)) {
		this.linux = true;
	} else if (/Mac OS/.test(ua)) {
		this.macOS = true;
	} else if (/Windows/.test(ua)) {
		this.windows = true;
	
		if(/Windows Phone/i.test(ua)) {
			this.windowsPhone = true;
		}
	} else if (/Mobile;.*Firefox\/(\d+)/.test(ua)) {
		this.firefoxOS = true;
	}

	if (this.windows || this.macOS || (this.linux && this.silk === false) || this.chromeOS) {
		this.desktop = true;
	}

	//  Windows Phone / Table reset
	if (this.windowsPhone || ((/Windows NT/i.test(ua)) && (/Touch/i.test(ua)))) {
		this.desktop = false;
	}

	if(this.desktop === false) {
		// navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|Windows
		// Phone|Mobi/i)
		this.isMobile = this.android || this.iOS || this.firefoxOS || this.windowsPhone || false;
	}
};

/**
 * Check HTML5 features of the host environment.
 * 
 * @method Device#checkFeatures
 * @private
 */
Device.prototype.checkFeatures = function()
{
	this.canvas = !!window.CanvasRenderingContext2D || this.cocoonJS;

	try {
		this.localStorage = !!localStorage.getItem;
	} catch (error) {
		this.localStorage = false;
	}

	this.file = !!window.File && !!window.FileReader && !!window.FileList && !!window.Blob;
	this.fileSystem = !!window.requestFileSystem;

	this.webGL = (function()
	{
		try {
			var canvas = document.createElement('canvas');
			return !!window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
		} catch (e) {
			return false;
		}
	})();

	if (this.webGL === null || this.webGL === false) {
		this.webGL = false;
	} else {
		this.webGL = true;
	}

	this.worker = !!window.Worker;

	if ('ontouchstart' in document.documentElement || (window.navigator.maxTouchPoints && window.navigator.maxTouchPoints > 1)) {
		this.touch = true;
	}

	if (window.navigator.msPointerEnabled || window.navigator.pointerEnabled) {
		this.mspointer = true;
	}

	this.pointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	this.quirksMode = (document.compatMode === 'CSS1Compat') ? false : true;

	this.getUserMedia = !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

};

/**
 * Check what browser is game running in.
 * 
 * @method Device#checkBrowser
 * @private
 */
Device.prototype.checkBrowser = function()
{
	var ua = navigator.userAgent;

	if (/Arora/.test(ua)) {
		this.arora = true;
	} else if (/Chrome/.test(ua)) {
		this.chrome = true;
	} else if (/Epiphany/.test(ua)) {
		this.epiphany = true;
	} else if (/Firefox/.test(ua)) {
		this.firefox = true;
	} else if (/AppleWebKit/.test(ua) && this.iOS) {
		this.mobileSafari = true;
	} else if (/MSIE (\d+\.\d+);/.test(ua)) {
		this.ie = true;
		this.ieVersion = parseInt(RegExp.$1, 10);
	} else if (/Midori/.test(ua)) {
		this.midori = true;
	} else if (/Opera/.test(ua)) {
		this.opera = true;
	} else if (/Safari/.test(ua)) {
		this.safari = true;
	} else if (/Trident\/(\d+\.\d+)(.*)rv:(\d+\.\d+)/.test(ua)) {
		this.ie = true;
		this.trident = true;
		this.tridentVersion = parseInt(RegExp.$1, 10);
		this.ieVersion = parseInt(RegExp.$3, 10);
	}

	//Silk gets its own if clause because its ua also contains 'Safari'
	if (/Silk/.test(ua)) {
		this.silk = true;
	}

	// WebApp mode in iOS
	if (navigator.standalone) {
		this.webApp = true;
	}

	if (typeof window.cordova !== "undefined") {
		this.cordova = true;
	}

	if (typeof process !== "undefined" && typeof require !== "undefined") {
		this.node = true;
	}

	if (this.node) {
		try {
			this.nodeWebkit = (typeof require('nw.gui') !== "undefined");
		} catch(error) {
			this.nodeWebkit = false;
		}
	}

	if (navigator.isCocoonJS) {
		this.cocoonJS = true;
	}

	if (this.cocoonJS) {
		try {
			this.cocoonJSApp = (typeof CocoonJS !== "undefined");
		} catch(error) {
			this.cocoonJSApp = false;
		}
	}

	if (typeof window.ejecta !== "undefined") {
		this.ejecta = true;
	}

	if (/Crosswalk/.test(ua)) {
		this.crosswalk = true;
	}
};

/**
 * Check audio support.
 * 
 * @method Device#checkAudio
 * @private
 */
Device.prototype.checkAudio = function()
{

	this.audioData = !!(window.Audio);
	this.webAudio = !!(window.webkitAudioContext || window.AudioContext);
	var audioElement = document.createElement('audio');
	var result = false;

	try {
		if (result = !!audioElement.canPlayType) {
			if (audioElement.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '')) {
				this.ogg = true;
			}

			if (audioElement.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '')) {
				this.opus = true;
			}

			if (audioElement.canPlayType('audio/mpeg;').replace(/^no$/, '')) {
				this.mp3 = true;
			}

			// Mimetypes accepted:
			// developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
			// bit.ly/iphoneoscodecs
			if (audioElement.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '')) {
				this.wav = true;
			}

			if (audioElement.canPlayType('audio/x-m4a;') || audioElement.canPlayType('audio/aac;').replace(/^no$/, '')) {
				this.m4a = true;
			}

			if (audioElement.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')) {
				this.webm = true;
			}
		}
	} catch (e) {
	}

};

/**
 * Check PixelRatio of devices.
 * 
 * @method Device#checkDevice
 * @private
 */
Device.prototype.checkDevice = function()
{
	this.pixelRatio = window.devicePixelRatio || 1;
	this.iPhone = navigator.userAgent.toLowerCase().indexOf('iphone') != -1;
	this.iPhone4 = (this.pixelRatio == 2 && this.iPhone);
	this.iPad = navigator.userAgent.toLowerCase().indexOf('ipad') != -1;
	
	if (typeof Int8Array !== 'undefined') {
		this.typedArray = true;
	} else {
		this.typedArray = false;
	}

	if (typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined' && typeof Uint32Array !== 'undefined') {
		this.littleEndian = this.checkIsLittleEndian();
		Device.LITTLE_ENDIAN = this.littleEndian;
	}

	this.support32bit = (typeof ArrayBuffer !== "undefined" && typeof Uint8ClampedArray !== "undefined" && typeof Int32Array !== "undefined" && this.littleEndian !== null && this.checkIsUint8ClampedImageData());

	navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

	if (navigator.vibrate) {
		this.vibration = true;
	}
};

/**
 * Check whether the host environment support 3D CSS.
 * 
 * @method Device#checkCSS3D
 * @private
 */
Device.prototype.checkCSS3D = function()
{
	var el = document.createElement('p');
	var has3d = false;
	var transforms = {
		'webkitTransform' : '-webkit-transform',
		'OTransform' : '-o-transform',
		'msTransform' : '-ms-transform',
		'MozTransform' : '-moz-transform',
		'transform' : 'transform'
	};

	// Add it to the body to get the computed style.
	if (document.body !== null)
		document.body.insertBefore(el, null);

	for ( var t in transforms) {
		if (el.style[t] !== undefined) {
			el.style[t] = "translate3d(1px,1px,1px)";
			has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
		}
	}

	if (document.body !== null)
		document.body.removeChild(el);
	this.css3D = (has3d !== undefined && has3d !== false && has3d.length > 0 && has3d !== "none");
};

/**
 * Check Little or Big Endian system.
 * @author Matt DesLauriers (@mattdesl)
 * @method Device#checkIsLittleEndian
 * @private
 */
Device.prototype.checkIsLittleEndian = function ()
{
	var a = new ArrayBuffer(4);
	var b = new Uint8Array(a);
	var c = new Uint32Array(a);

	b[0] = 0xa1;
	b[1] = 0xb2;
	b[2] = 0xc3;
	b[3] = 0xd4;

	if (c[0] == 0xd4c3b2a1) {
		return true;
	}

	if (c[0] == 0xa1b2c3d4) {
		return false;
	} else {
		//  Could not determine endianness
		return null;
	}

};

/**
 * Test to see if ImageData uses CanvasPixelArray or Uint8ClampedArray.
 * @author Matt DesLauriers (@mattdesl)
 * @method Device#checkIsUint8ClampedImageData
 * @private
 */
Device.prototype.checkIsUint8ClampedImageData = function ()
{
	if (typeof Uint8ClampedArray === "undefined") {
		return false;
	}

	var elem = document.createElement('canvas');
	var ctx = elem.getContext('2d');

	if (!ctx) {
		return false;
	}

	var image = ctx.createImageData(1, 1);

	return image.data instanceof Uint8ClampedArray;
};

/**
 * Check whether the host environment can play audio.
 * 
 * @method Device#canPlayAudio
 * @param {string}
 *            type - One of 'mp3, 'ogg', 'm4a', 'wav', 'webm'.
 * @return {boolean} True if the given file type is supported by the browser,
 *         otherwise false.
 */
Device.prototype.canPlayAudio = function(type)
{
	if (type == 'mp3' && this.mp3) {
		return false;
	} else if (type == 'ogg' && (this.ogg || this.opus)) {
		return false;
	} else if (type == 'm4a' && this.m4a) {
		return true;
	} else if (type == 'wav' && this.wav) {
		return true;
	} else if (type == 'webm' && this.webm) {
		return true;
	} else if (type == 'any') {
		return this.canPlayAudio("mp3") || this.canPlayAudio("ogg") || this.canPlayAudio("m4a") || this.canPlayAudio("wav") || this.canPlayAudio("webm");
	}

	return false;
};

/**
 * Check whether the console is open.
 * 
 * @method Device#isConsoleOpen
 * @return {boolean} True if the browser dev console is open.
 */
Device.prototype.isConsoleOpen = function()
{

	if (window.console && window.console.firebug) {
		return true;
	}

	if (window.console) {
		console.profile();
		console.profileEnd();

		if (console.clear) {
			console.clear();
		}

		return console.profiles.length > 0;
	}

	return false;

};

/**
 * Return the device storage
 * 
 * @param type
 *            The type of storage.
 */
Device.prototype.getStorage = function(type)
{
	type = type || "local";

	switch (type) {
		case "local":
			return;

		default:
			break;
	}
	Flixel.FlxG.log("Storage type " + type + " not supported.", "Device");
};

/**
 * Checks for support of the Full Screen API.
 *
 * @method Device#checkFullScreenSupport
 */
Device.prototype.checkFullScreenSupport = function (stage)
{
	var fs = [
		'requestFullscreen',
		'requestFullScreen',
		'webkitRequestFullscreen',
		'webkitRequestFullScreen',
		'msRequestFullscreen',
		'msRequestFullScreen',
		'mozRequestFullScreen',
		'mozRequestFullscreen'
	];

	for (var i = 0; i < fs.length; i++) {
		if (stage[fs[i]]) {
		// if (document[fs[i]])
			this.fullscreen = true;
			this.requestFullscreen = fs[i];
			break;
		}
	}

	var cfs = [
		'cancelFullScreen',
		'exitFullscreen',
		'webkitCancelFullScreen',
		'webkitExitFullscreen',
		'msCancelFullScreen',
		'msExitFullscreen',
		'mozCancelFullScreen',
		'mozExitFullscreen'
	];

	if (this.fullscreen)
	{
		for (var i = 0; i < cfs.length; i++) {
			if (document[cfs[i]]) {
				this.cancelFullscreen = cfs[i];
				break;
			}
		}
	}

	//  Keyboard Input?
	if (window.Element && Element.ALLOW_KEYBOARD_INPUT) {
		this.fullscreenKeyboard = true;
	}
};

/**
* A class-static function to check wether we’re running on an Android Stock browser.
* Autors might want to scale down on effects and switch to the CANVAS rendering method on those devices.
* Usage: var defaultRenderingMode = Device.isAndroidStockBrowser() ? Flixel.CANVAS : Flixel.AUTO;
* 
* @function Device#isAndroidStockBrowser
*/
Device.isAndroidStockBrowser = function()
{
    var matches = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
    return matches && matches[1] < 537;
};