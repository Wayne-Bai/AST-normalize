/**
 * Keeps track of what keys are pressed and how with handy booleans or strings.
 * 
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	Adam Atomic
 * @author	ratalaika / ratalaikaGames
 * @class Flixel.system.input.Keyboard
 */

/**
 * Class constructor.
 */
Flixel.system.input.Keyboard = function()
{
	Flixel.system.input.Keyboard.parent.constructor.apply(this);
	
	var i;

	//LETTERS
	i = 65;
	while(i <= 90)
		this.addKey(String.fromCharCode(i), i++);
	
	//NUMBERS
	i = 48;
	this.addKey("ZERO",i++);
	this.addKey("ONE",i++);
	this.addKey("TWO",i++);
	this.addKey("THREE",i++);
	this.addKey("FOUR",i++);
	this.addKey("FIVE",i++);
	this.addKey("SIX",i++);
	this.addKey("SEVEN",i++);
	this.addKey("EIGHT",i++);
	this.addKey("NINE",i++);
	i = 96;
	this.addKey("NUMPADZERO",i++);
	this.addKey("NUMPADONE",i++);
	this.addKey("NUMPADTWO",i++);
	this.addKey("NUMPADTHREE",i++);
	this.addKey("NUMPADFOUR",i++);
	this.addKey("NUMPADFIVE",i++);
	this.addKey("NUMPADSIX",i++);
	this.addKey("NUMPADSEVEN",i++);
	this.addKey("NUMPADEIGHT",i++);
	this.addKey("NUMPADNINE",i++);
	this.addKey("PAGEUP", 33);
	this.addKey("PAGEDOWN", 34);
	this.addKey("HOME", 36);
	this.addKey("END", 35);
	this.addKey("INSERT", 45);
	
	//FUNCTION KEYS
	i = 1;
	while(i <= 12)
		this.addKey("F"+i, 111+(i++));
	
	//SPECIAL KEYS + PUNCTUATION
	this.addKey("ESCAPE",27);
	this.addKey("MINUS",189);
	this.addKey("NUMPADMINUS",109);
	this.addKey("PLUS",187);
	this.addKey("NUMPADPLUS",107);
	this.addKey("DELETE",46);
	this.addKey("BACKSPACE",8);
	this.addKey("LBRACKET",219);
	this.addKey("RBRACKET",221);
	this.addKey("BACKSLASH",220);
	this.addKey("CAPSLOCK",20);
	this.addKey("SEMICOLON",186);
	this.addKey("QUOTE",222);
	this.addKey("ENTER",13);
	this.addKey("SHIFT",16);
	this.addKey("COMMA",188);
	this.addKey("PERIOD",190);
	this.addKey("NUMPADPERIOD",110);
	this.addKey("SLASH",191);
	this.addKey("NUMPADSLASH",191);
	this.addKey("CONTROL",17);
	this.addKey("ALT",18);
	this.addKey("SPACE",32);
	this.addKey("UP",38);
	this.addKey("DOWN",40);
	this.addKey("LEFT",37);
	this.addKey("RIGHT",39);
	this.addKey("TAB",9);
};
extend(Flixel.system.input.Keyboard, Flixel.system.input.Input);

/**
 * All the keys
 */
Flixel.system.input.Keyboard.prototype.ESCAPE = false;
Flixel.system.input.Keyboard.prototype.F1 = false;
Flixel.system.input.Keyboard.prototype.F2 = false;
Flixel.system.input.Keyboard.prototype.F3 = false;
Flixel.system.input.Keyboard.prototype.F4 = false;
Flixel.system.input.Keyboard.prototype.F5 = false;
Flixel.system.input.Keyboard.prototype.F6 = false;
Flixel.system.input.Keyboard.prototype.F7 = false;
Flixel.system.input.Keyboard.prototype.F8 = false;
Flixel.system.input.Keyboard.prototype.F9 = false;
Flixel.system.input.Keyboard.prototype.F10 = false;
Flixel.system.input.Keyboard.prototype.F11 = false;
Flixel.system.input.Keyboard.prototype.F12 = false;
Flixel.system.input.Keyboard.prototype.ONE = false;
Flixel.system.input.Keyboard.prototype.TWO = false;
Flixel.system.input.Keyboard.prototype.THREE = false;
Flixel.system.input.Keyboard.prototype.FOUR = false;
Flixel.system.input.Keyboard.prototype.FIVE = false;
Flixel.system.input.Keyboard.prototype.SIX = false;
Flixel.system.input.Keyboard.prototype.SEVEN = false;
Flixel.system.input.Keyboard.prototype.EIGHT = false;
Flixel.system.input.Keyboard.prototype.NINE = false;
Flixel.system.input.Keyboard.prototype.ZERO = false;
Flixel.system.input.Keyboard.prototype.NUMPADONE = false;
Flixel.system.input.Keyboard.prototype.NUMPADTWO = false;
Flixel.system.input.Keyboard.prototype.NUMPADTHREE = false;
Flixel.system.input.Keyboard.prototype.NUMPADFOUR = false;
Flixel.system.input.Keyboard.prototype.NUMPADFIVE = false;
Flixel.system.input.Keyboard.prototype.NUMPADSIX = false;
Flixel.system.input.Keyboard.prototype.NUMPADSEVEN = false;
Flixel.system.input.Keyboard.prototype.NUMPADEIGHT = false;
Flixel.system.input.Keyboard.prototype.NUMPADNINE = false;
Flixel.system.input.Keyboard.prototype.NUMPADZERO = false;
Flixel.system.input.Keyboard.prototype.PAGEUP = false;
Flixel.system.input.Keyboard.prototype.PAGEDOWN = false;
Flixel.system.input.Keyboard.prototype.HOME = false;
Flixel.system.input.Keyboard.prototype.END = false;
Flixel.system.input.Keyboard.prototype.INSERT = false;
Flixel.system.input.Keyboard.prototype.MINUS = false;
Flixel.system.input.Keyboard.prototype.NUMPADMINUS = false;
Flixel.system.input.Keyboard.prototype.PLUS = false;
Flixel.system.input.Keyboard.prototype.NUMPADPLUS = false;
Flixel.system.input.Keyboard.prototype.DELETE = false;
Flixel.system.input.Keyboard.prototype.BACKSPACE = false;
Flixel.system.input.Keyboard.prototype.TAB = false;
Flixel.system.input.Keyboard.prototype.Q = false;
Flixel.system.input.Keyboard.prototype.W = false;
Flixel.system.input.Keyboard.prototype.E = false;
Flixel.system.input.Keyboard.prototype.R = false;
Flixel.system.input.Keyboard.prototype.T = false;
Flixel.system.input.Keyboard.prototype.Y = false;
Flixel.system.input.Keyboard.prototype.U = false;
Flixel.system.input.Keyboard.prototype.I = false;
Flixel.system.input.Keyboard.prototype.O = false;
Flixel.system.input.Keyboard.prototype.P = false;
Flixel.system.input.Keyboard.prototype.LBRACKET = false;
Flixel.system.input.Keyboard.prototype.RBRACKET = false;
Flixel.system.input.Keyboard.prototype.BACKSLASH = false;
Flixel.system.input.Keyboard.prototype.CAPSLOCK = false;
Flixel.system.input.Keyboard.prototype.A = false;
Flixel.system.input.Keyboard.prototype.S = false;
Flixel.system.input.Keyboard.prototype.D = false;
Flixel.system.input.Keyboard.prototype.F = false;
Flixel.system.input.Keyboard.prototype.G = false;
Flixel.system.input.Keyboard.prototype.H = false;
Flixel.system.input.Keyboard.prototype.J = false;
Flixel.system.input.Keyboard.prototype.K = false;
Flixel.system.input.Keyboard.prototype.L = false;
Flixel.system.input.Keyboard.prototype.SEMICOLON = false;
Flixel.system.input.Keyboard.prototype.QUOTE = false;
Flixel.system.input.Keyboard.prototype.ENTER = false;
Flixel.system.input.Keyboard.prototype.SHIFT = false;
Flixel.system.input.Keyboard.prototype.Z = false;
Flixel.system.input.Keyboard.prototype.X = false;
Flixel.system.input.Keyboard.prototype.C = false;
Flixel.system.input.Keyboard.prototype.V = false;
Flixel.system.input.Keyboard.prototype.B = false;
Flixel.system.input.Keyboard.prototype.N = false;
Flixel.system.input.Keyboard.prototype.M = false;
Flixel.system.input.Keyboard.prototype.COMMA = false;
Flixel.system.input.Keyboard.prototype.PERIOD = false;
Flixel.system.input.Keyboard.prototype.NUMPADPERIOD = false;
Flixel.system.input.Keyboard.prototype.SLASH = false;
Flixel.system.input.Keyboard.prototype.NUMPADSLASH = false;
Flixel.system.input.Keyboard.prototype.CONTROL = false;
Flixel.system.input.Keyboard.prototype.ALT = false;
Flixel.system.input.Keyboard.prototype.SPACE = false;
Flixel.system.input.Keyboard.prototype.UP = false;
Flixel.system.input.Keyboard.prototype.DOWN = false;
Flixel.system.input.Keyboard.prototype.LEFT = false;
Flixel.system.input.Keyboard.prototype.RIGHT = false;
		
/**
 * Event handler so FlxGame can toggle keys.
 * 
 * @param	FlashEvent	A <code>KeyboardEvent</code> object.
 */
Flixel.system.input.Keyboard.prototype.handleKeyDown = function(FlashEvent)
{
	var object = this._map[FlashEvent.keyCode];
	if(object === null || object === undefined) return;
	if(object.current > 0) object.current = 1;
	else object.current = 2;
	this[object.name] = true;
};
		
/**
 * Event handler so FlxGame can toggle keys.
 * 
 * @param	FlashEvent	A <code>KeyboardEvent</code> object.
 */
Flixel.system.input.Keyboard.prototype.handleKeyUp = function(FlashEvent)
{
	var object = this._map[FlashEvent.keyCode];
	if(object === null || object === undefined) return;
	if(object.current > 0) object.current = -1;
	else object.current = 0;
	this[object.name] = false;
};