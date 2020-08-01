/**
 * A group of handy methods that are really usefull for all kind of stuff.<br>
 * <br>
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author	Adam Atomic
 * @author	ratalaika / ratalaikaGamestalaikaGames
 * @class Flixel.FlxU
 */

/**
 * @constructor
 */
Flixel.FlxU = function()
{
};

/**
 * The value PI as a float. (180 degrees)
 */
Flixel.FlxU.PI = 3.1415927;    
/**
 * The value 2PI as a float. (360 degrees)
 */
Flixel.FlxU.TWO_PI = 2.0 * Flixel.FlxU.PI;
/**
 * The value PI/2 as a float. (90 degrees)
 */
Flixel.FlxU.HALF_PI = 0.5 * Flixel.FlxU.PI;

/**
 * Opens a web page in a new tab or window.
 * MUST be called from the UI thread or else badness.
 * 
 * @param	URLThe address of the web page.
 */
Flixel.FlxU.openURL = function(url)
{
	var win = window.open(url, '_blank');
	win.focus();
};

/**
 * Get the country of the telephone, in a 3 letter format.
 */
Flixel.FlxU.getCountry = function()
{
	//if(Gdx.app.getType() == ApplicationType.Android)
	//	return  Lo;
	//else
	return "";
};

/**
 * Get the current hour time
 */
Flixel.FlxU.getHour = function()
{
	var date = new Date();
	return date.getHours() + ":" + date.getMinutes();
};

/**
 * Returns the number as a String in score format.
 * 
 * @param num	The score number.
 * @param dig	The number of digits.
 * @param withCommasAdd commas each 3 numbers.
 * TODO: UPDATE!!!!!
 */
Flixel.FlxU.getScoreFormat = function(num, dig, withCommas)
{
	dig = dig || 5;
	
	var result = num+"";
	for(var i = result.length; i < dig; i++) {
		result = "0"+result;
	}

	if(withCommas) {
		return Flixel.FlxU.formatMoney(int(result), false, true);
	} else {
		return result;
	}
};

/**
 * Calculate the absolute value of a number.
 * 
 * @param	Value	Any number.
 * 
 * @return	The absolute value of that number.
 */
Flixel.FlxU.abs = function(Value)
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Round down to the next whole number. E.g. floor(1.7) == 1, and floor(-2.7) == -2.
 * 
 * @param	Value	Any number.
 * 
 * @return	The rounded value of that number.
 */
Flixel.FlxU.floor = function(Value)
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Round up to the next whole number.  E.g. ceil(1.3) == 2, and ceil(-2.3) == -3.
 * 
 * @param	Value	Any number.
 * 
 * @return	The rounded value of that number.
 */
Flixel.FlxU.ceil = function(Value)
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Round to the closest whole number. E.g. round(1.7) == 2, and round(-2.3) == -2.
 * 
 * @param	Value	Any number.
 * 
 * @return	The rounded value of that number.
 */
Flixel.FlxU.round = function(Value)
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Round to the closes number with the number of decimals given. E.g round(2.954165, 2) == 2.95
 * 
 * @param num The number to round.
 * @param dec The number of decimals wanted.
 * @return The rounded value of that number.
 */
Flixel.FlxU.roundWithDec = function(num, dec)
{
	var p = Math.pow(10, dec);
	num = num * p;
	var tmp = Math.round(num);
	return tmp/p;
};

/**
 * Figure out which number is smaller.
 * 
 * @param	Number1Any number.
 * @param	Number2Any number.
 * 
 * @return	The smaller of the two numbers.
 */
Flixel.FlxU.min = function(Number1 ,Number2)
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Figure out which number is larger.
 * 
 * @param	Number1Any number.
 * @param	Number2Any number.
 * 
 * @return	The larger of the two numbers.
 */
Flixel.FlxU.max = function(Number1, Number2)
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Bound a number by a minimum and maximum.
 * Ensures that this number is no smaller than the minimum,
 * and no larger than the maximum.
 * 
 * @param	Value	Any number.
 * @param	MinAny number.
 * @param	MaxAny number.
 * 
 * @return	The bounded value of the number.
 */
Flixel.FlxU.bound = function(Value, Min, Max)
{
	var lowerBound = (Value < Min) ? Min : Value;
	return (lowerBound > Max) ? Max : lowerBound;
};

/**
 * Generates a random number based on the seed provided.
 * 
 * @param	Seed	A number between 0 and 1, used to generate a predictable random number (very optional).
 * 
 * @return	A <code>Number</code> between 0 and 1.
 */
Flixel.FlxU.srand = function(Seed)
{
	return ((69621 * int(Seed * 0x7FFFFFFF)) % 0x7FFFFFFF) / 0x7FFFFFFF;
};

/**
 * Generates a random number. NOTE: To create a series of predictable random
 * numbers, add the random number you generate each time to the
 * <code>Seed</code> value before calling <code>random()</code> again.
 * 
 * @param SeedA user-provided value used to calculate a predictable random number.
 * 
 * @return A <code>Number</code> between 0 and 1.
 */
Flixel.FlxU.random = function(Seed)
{
	// Make sure the seed value is OK
	if(Seed === undefined)
		Seed = Math.random();
	if(Seed === 0)
		Seed = Number.MAX_VALUE;
	if(Seed >= 1) {
		if((Seed % 1) === 0)
			Seed /= Math.PI;
		Seed %= 1;
	} else if(Seed < 0)
		Seed = (Seed % 1) + 1;
	
	// Then do an LCG thing and return a predictable random number
	return ((69621 * (Seed * 0x7FFFFFFF)) % 0x7FFFFFFF) / 0x7FFFFFFF;
};

/**
 * Shuffles the entries in an array into a new random order.
 * <code>FlxG.shuffle()</code> is deterministic and safe for use with replays/recordings.
 * HOWEVER, <code>FlxU.shuffle()</code> is NOT deterministic and unsafe for use with replays/recordings.
 * 
 * @param	AA Flash <code>Array</code> object containing...stuff.
 * @param	HowManyTimes	How many swaps to perform during the shuffle operation.  Good rule of thumb is 2-4 times as many objects are in the list.
 * 
 * @return	The same Flash <code>Array</code> object that you passed in in the first place.
 */
Flixel.FlxU.shuffle = function(Objects, HowManyTimes)
{
	var i = 0;
	var index1;
	var index2;
	var object;
	
	while(i < HowManyTimes)
	{
		index1 = Math.random() * Objects.length;
		index2 = Math.random() * Objects.length;
		object = Objects[index2];
		Objects[index2] = Objects[index1];
		Objects[index1] = object;
		i++;
	}
	return Objects;
};

/**
 * Fetch a random entry from the given array.
 * Will return null if random selection is missing, or array has no entries.
 * <code>FlxG.getRandom()</code> is deterministic and safe for use with replays/recordings.
 * HOWEVER, <code>FlxU.getRandom()</code> is NOT deterministic and unsafe for use with replays/recordings.
 * 
 * @param	ObjectsA Flash array of objects.
 * @param	StartIndex	Optional offset off the front of the array. Default value is 0, or the beginning of the array.
 * @param	LengthOptional restriction on the number of values you want to randomly select from.
 * 
 * @return	The random object that was selected.
 */
Flixel.FlxU.getRandom = function(Objects, StartIndex, Length)
{
	if(Objects !== null &&  Objects !== undefined)
	{
		var l = Length;
		if((l === 0) || (l > Objects.length - StartIndex))
			l = Objects.length - StartIndex;
		if(l > 0)
			return Objects[StartIndex + uint(Math.random()*l)];
	}
	return null;
};

/**
 * Just grabs the current "ticks" or time in milliseconds that has passed since Flash Player started up.
 * Useful for finding out how long it takes to execute specific blocks of code.
 * 
 * @return	A <code>uint</code> to be passed to <code>FlxU.endProfile()</code>.
 */
Flixel.FlxU.getTicks = function()
{
	return getTimer();
};

/**
 * Takes two "ticks" timestamps and formats them into the number of seconds that passed as a String.
 * Useful for logging, debugging, the watch window, or whatever else.
 * 
 * @param	StartTicks	The first timestamp from the system.
 * @param	EndTicks	The second timestamp from the system.
 * 
 * @return	A <code>String</code> containing the formatted time elapsed information.
 */
Flixel.FlxU.formatTicks = function(StartTicks, EndTicks)
{
	return ((EndTicks-StartTicks)/1000)+"s";
};

/**
 * Generate a Flash <code>uint</code> color from RGBA components.
 * 
 * @param   Red     The red component, between 0 and 255.
 * @param   Green   The green component, between 0 and 255.
 * @param   Blue    The blue component, between 0 and 255.
 * @param   Alpha   How opaque the color should be, either between 0 and 1 or 0 and 255.
 * 
 * @return  The color as a <code>uint</code>.
 */
Flixel.FlxU.makeColor = function(Red, Green, Blue, Alpha)
{
	return uint((((Alpha>1)?Alpha:((Alpha || 1) * 255)) & 0xFF) << 24 | (Red & 0xFF) << 16 | (Green & 0xFF) << 8 | (Blue & 0xFF));
};

/**
 * Generate a Flash <code>uint</code> color from RGBA components.
 * 
 * @param   Red     The red component, between 0 and 255.
 * @param   Green   The green component, between 0 and 255.
 * @param   Blue    The blue component, between 0 and 255.
 * @param   Alpha   How opaque the color should be, either between 0 and 1 or 0 and 255.
 * 
 * @return  The color as a <code>uint</code>.
 */
Flixel.FlxU.addAlphaToColor = function(color, Alpha)
{
	var colors = Flixel.FlxU.getRGBA(color);
	var Red = colors[0];
	var Green = colors[1];
	var Blue = colors[2];
	
	Alpha = (Alpha === undefined || Alpha === null) ? colors[3] : Alpha;
	
	if(Alpha <= 1) {
		Alpha = int(Alpha * 255);
	}

	return uint((Alpha & 0xFF) << 24 | (Red & 0xFF) << 16 | (Green & 0xFF) << 8 | (Blue & 0xFF));
};

/**
 * Generate a Flash <code>uint</code> color from HSB components.
 * 
 * @param	Hue			A number between 0 and 360, indicating position on a color strip or wheel.
 * @param	Saturation	A number between 0 and 1, indicating how colorful or gray the color should be.  0 is gray, 1 is vibrant.
 * @param	Brightness	A number between 0 and 1, indicating how bright the color should be.  0 is black, 1 is full bright.
 * @param   Alpha		How opaque the color should be, either between 0 and 1 or 0 and 255.
 * 
 * @return	The color as a <code>uint</code>.
 */
Flixel.FlxU.makeColorFromHSB = function(Hue, Saturation, Brightness, Alpha)
{
	var red;
	var green;
	var blue;

	if(Saturation === 0.0) {
		red   = Brightness;
		green = Brightness;        
		blue  = Brightness;
	} else {
		if(Hue == 360)
			Hue = 0;
		var slice = Hue/60;
		var hf = Hue/60 - slice;
		var aa = Brightness*(1 - Saturation);
		var bb = Brightness*(1 - Saturation*hf);
		var cc = Brightness*(1 - Saturation*(1.0 - hf));

		switch (slice) {
			case 0: red = Brightness; green = cc;   blue = aa;  break;
			case 1: red = bb;  green = Brightness;  blue = aa;  break;
			case 2: red = aa;  green = Brightness;  blue = cc;  break;
			case 3: red = aa;  green = bb;   blue = Brightness; break;
			case 4: red = cc;  green = aa;   blue = Brightness; break;
			case 5: red = Brightness; green = aa;   blue = bb;  break;
			default: red = 0;  green = 0;    blue = 0;   break;
		}
	}
	
	return (((Alpha>1)?Alpha:(Alpha * 255)) & 0xFF) << 24 | uint(red*255) << 16 | uint(green*255) << 8 | uint(blue*255);
};

/**
 * Loads an array with the RGBA values of a Flash <code>uint</code> color.
 * RGB values are stored 0-255.  Alpha is stored as a floating point number between 0 and 1.
 * 
 * @param	Color	The color you want to break into components.
 * @param	Results	An optional parameter, allows you to use an array that already exists in memory to store the result.
 * 
 * @return	An <code>Array</code> object containing the Red, Green, Blue and Alpha values of the given color.
 */
Flixel.FlxU.getRGBA = function(Color, Results)
{
	if(Results === undefined || Results === null)
		Results = [];
	Results[0] = (Color >> 16) & 0xFF;
	Results[1] = (Color >> 8) & 0xFF;
	Results[2] = Color & 0xFF;
	Results[3] = ((Color >> 24) & 0xFF) / 255;
	return Results;
};

/**
 * Loads an array with the HSB values of a Flash <code>uint</code> color.
 * Hue is a value between 0 and 360.  Saturation, Brightness and Alpha
 * are as floating point numbers between 0 and 1.
 * 
 * @param	Color	The color you want to break into components.
 * @param	Results	An optional parameter, allows you to use an array that already exists in memory to store the result.
 * 
 * @return	An <code>Array</code> object containing the Red, Green, Blue and Alpha values of the given color.
 */
Flixel.FlxU.getHSB = function(Color, Results)
{
	if(Results === null || Results === undefined)
		Results = [];
	
	var red = Number((Color >> 16) & 0xFF) / 255;
	var green = Number((Color >> 8) & 0xFF) / 255;
	var blue = Number((Color) & 0xFF) / 255;
	
	var m = (red>green)?red:green;
	var dmax = (m>blue)?m:blue;
	m = (red>green)?green:red;
	var dmin = (m>blue)?blue:m;
	var range = dmax - dmin;
	
	Results[2] = dmax;
	Results[1] = 0;
	Results[0] = 0;
	
	if(dmax !== 0)
		Results[1] = range / dmax;
	if(Results[1] !== 0) 
	{
		if (red == dmax)
			Results[0] = (green - blue) / range;
		else if (green == dmax)
			Results[0] = 2 + (blue - red) / range;
		else if (blue == dmax)
			Results[0] = 4 + (red - green) / range;
		Results[0] *= 60;
		if(Results[0] < 0)
			Results[0] += 360;
	}
	
	Results[3] = Number((Color >> 24) & 0xFF) / 255;
	return Results;
};

/**
 * Converts a Flash AARRGGBB format color to a libgdx/openGL rgba8888 format color.
 * 
 * @param	Color	The color to convert.
 * 
 * @return	The converted color.
 */
Flixel.FlxU.argbToRgba = function(Color)
{
	return (Color << 8) | (Color >>> 24);
};

/**
 * Multiplies two colors together. Colors should be in Flash AARRGGBB format.
 * 
 * @param	Color1	The first color to multiply.
 * @param	Color2	The second color to multiply.
 * 
 * @return	The multiplied colors.
 */
Flixel.FlxU.multiplyColors = function(Color1, Color2)
{
	var r = uint((((Color1 >> 16) & 0xFF) * ((Color2 >> 16) & 0xFF) * 0.00392));
	var g = uint((((Color1 >> 8) & 0xFF) * ((Color2 >> 8) & 0xFF) * 0.00392));
	var b = uint(((Color1 & 0xFF) * (Color2 & 0xFF) * 0.00392));
	var a = uint((((Color1 >> 24) & 0xFF) * ((Color2 >> 24) & 0xFF) * 0.00392));

	return Flixel.FlxU.makeColor(r, g, b, a);
};

/**
 * Format seconds as minutes with a colon, an optionally with milliseconds too.
 * 
 * @param	SecondsThe number of seconds (for example, time remaining, time spent, etc).
 * @param	ShowMSWhether to show milliseconds after a "." as well.  Default value is false.
 * 
 * @return	A nicely formatted <code>String</code>, like "1:03".
 */
Flixel.FlxU.formatTime = function(Seconds ,ShowMS)
{
	var timeString = int(Seconds/60) + ":";
	var timeStringHelper = int(Seconds)%60;
	
	if(timeStringHelper < 10)
		timeString += "0";
	timeString += timeStringHelper;

	if(ShowMS) {
		timeString += ".";
		timeStringHelper = (Seconds-int(Seconds))*100;
		if(timeStringHelper < 10)
			timeString += "0";
		timeString += timeStringHelper;
	}
	return timeString;
};

/**
 * Generate a comma-separated string from an array.
 * Especially useful for tracing or other debug output.
 * 
 * @param	AnyArray	Any <code>Array</code> object.
 * 
 * @return	A comma-separated <code>String</code> containing the <code>.toString()</code> output of each element in the array.
 */
Flixel.FlxU.formatArray = function(AnyArray)
{
	if((AnyArray === null || AnyArray === undefined) || (AnyArray.length <= 0))
		return "";
	var string = AnyArray[0].toString();
	var i = 1;
	var l = AnyArray.length;
	while(i < l)
		string += ", " + AnyArray[i++].toString();
	return string;
};

/**
 * Automatically commas and decimals in the right places for displaying money amounts.
 * Does not include a dollar sign or anything, so doesn't really do much
 * if you call say <code>var results:String = FlxU.formatMoney(10,false);</code>
 * However, very handy for displaying large sums or decimal money values.
 * 
 * @param	Amount	How much moneys (in dollars, or the equivalent "main" currency - i.e. not cents).
 * @param	ShowDecimalWhether to show the decimals/cents component. Default value is true.
 * @param	EnglishStyle	Major quantities (thousands, millions, etc) separated by commas, and decimal by a period.  Default value is true.
 * 
 * @return	A nicely formatted <code>String</code>.  Does not include a dollar sign or anything!
 */
Flixel.FlxU.formatMoney = function(Amount, ShowDecimal, EnglishStyle)
{
	var helper;
	var amount = Amount;
	var string = "";
	var comma = "";
	var zeroes = "";

	while(amount > 0) {
		if((string.length > 0) && comma.length <= 0) {
			if(EnglishStyle)
				comma = ",";
			else
				comma = ".";
		}

		zeroes = "";
		helper = amount - int(amount/1000)*1000;
		amount /= 1000;

		if(amount > 0) {
			if(helper < 100)
				zeroes += "0";
			if(helper < 10)
				zeroes += "0";
		}
		string = zeroes + helper + comma + string;
	}

	if(ShowDecimal) {
		amount = int(Amount*100)-(int(Amount)*100);
		string += (EnglishStyle?".":",") + amount;
		if(amount < 10)
			string += "0";
	}

	return string;
};

/**
 * Get the <code>String</code> name of any <code>Object</code>.
 * 
 * @param	ObjThe <code>Object</code> object in question.
 * @param	Simple	Returns only the class name, not the package or packages.
 * 
 * @return	The name of the <code>Class</code> as a <code>String</code> object.
 */
Flixel.FlxU.getClassName = function(Obj, Simple)
{
	return Obj.toString();
};

/**
 * Check to see if two objects have the same class name.
 * 
 * @param	Object1The first object you want to check.
 * @param	Object2The second object you want to check.
 * 
 * @return	Whether they have the same class name or not.
 */
Flixel.FlxU.compareClassNames = function(Object1, Object2)
{
	return Object1.toString() == Object2.toString();
};

/**
 * Look up a <code>Class</code> object by its string name.
 * 
 * @param	Name	The <code>String</code> name of the <code>Class</code> you are interested in.
 * 
 * @return	A <code>Class</code> object.
 */
Flixel.FlxU.getClass = function(Name)
{
	throw new Error("Not implemented in Flixel-JS due to HTML5!!");//return getDefinitionByName(Name);
};

/**
 * Look up a <code>Class</code> object by its string name.
 * 
 * @param	Name	The <code>String</code> name of the <code>Class</code> you are interested in.
 * 
 * @return	A <code>Class</code> object.
 */
Flixel.FlxU.getClassFromObject = function(object)
{
	throw new Error("Not implemented in Flixel-JS due to HTML5!!");//return getDefinitionByName(Flixel.FlxU.getClassName(object));
};

/**
 * A tween-like function that takes a starting velocity
 * and some other factors and returns an altered velocity.
 * 
 * @param	VelocityAny component of velocity (e.g. 20).
 * @param	Acceleration	Rate at which the velocity is changing.
 * @param	Drag	Really kind of a deceleration, this is how much the velocity changes if Acceleration is not set.
 * @param	MaxAn absolute value cap for the velocity.
 * 
 * @return	The altered Velocity value.
 */
Flixel.FlxU.computeVelocity = function(Velocity, Acceleration, Drag, Max, elapsed)
{
	Max = Max || 1000;
	elapsed = elapsed || Flixel.FlxG.elapsed;
	
	if(Acceleration !== 0)
		Velocity += Acceleration * elapsed;
	else if(Drag !== 0) {
		var drag = Drag * elapsed;
		if(Velocity - drag > 0)
			Velocity = Velocity - drag;
		else if(Velocity + drag < 0)
			Velocity += drag;
		else
			Velocity = 0;
	}

	if((Velocity !== 0) && (Max != 10000)) {
		if(Velocity > Max)
			Velocity = Max;
		else if(Velocity < -Max)
			Velocity = -Max;
	}
	return Velocity;
};

//*** NOTE: THESE LAST THREE FUNCTIONS REQUIRE FlxPOINT ***//

/**
 * Rotates a point in 2D space around another point by the given angle.
 * 
 * @param	XThe X coordinate of the point you want to rotate.
 * @param	YThe Y coordinate of the point you want to rotate.
 * @param	PivotX	The X coordinate of the point you want to rotate around.
 * @param	PivotY	The Y coordinate of the point you want to rotate around.
 * @param	Angle	Rotate the point by this many degrees.
 * @param	Point	Optional <code>FlxPoint</code> to store the results in.
 * 
 * @return	A <code>FlxPoint</code> containing the coordinates of the rotated point.
 */
Flixel.FlxU.rotatePoint = function(X, Y, PivotX, PivotY, Angle, Point)
{
	var sin = 0;
	var cos = 0;
	var radians = Angle * -0.017453293;
	
	while (radians < -3.14159265)
		radians += 6.28318531;
	
	while (radians >  3.14159265)
		radians = radians - 6.28318531;
	
	if (radians < 0) {
		sin = 1.27323954 * radians + 0.405284735 * radians * radians;
		if (sin < 0)
			sin = 0.225 * (sin *-sin - sin) + sin;
		else
			sin = 0.225 * (sin * sin - sin) + sin;
	} else {
		sin = 1.27323954 * radians - 0.405284735 * radians * radians;
		if (sin < 0)
			sin = 0.225 * (sin *-sin - sin) + sin;
		else
			sin = 0.225 * (sin * sin - sin) + sin;
	}
	
	radians += 1.57079632;

	if (radians >  3.14159265)
		radians = radians - 6.28318531;

	if (radians < 0) {
		cos = 1.27323954 * radians + 0.405284735 * radians * radians;
		if (cos < 0)
			cos = 0.225 * (cos *-cos - cos) + cos;
		else
			cos = 0.225 * (cos * cos - cos) + cos;
	} else {
		cos = 1.27323954 * radians - 0.405284735 * radians * radians;
		if (cos < 0)
			cos = 0.225 * (cos *-cos - cos) + cos;
		else
			cos = 0.225 * (cos * cos - cos) + cos;
	}
	
	var dx = X-PivotX;
	var dy = PivotY+Y; //Y axis is inverted in flash, normally this would be a subtract operation
	
	if(Point === null)
		Point = new Flixel.FlxPoint();
	
	Point.x = PivotX + cos*dx - sin*dy;
	Point.y = PivotY - sin*dx - cos*dy;
	return Point;
};

/**
 * Calculates the angle between two points.  0 degrees points straight up.
 * 
 * @param	Point1The X coordinate of the point.
 * @param	Point2The Y coordinate of the point.
 * 
 * @return	The angle in degrees, between -180 and 180.
 */
Flixel.FlxU.getAngle = function(Point1, Point2)
{
	var x = Point2.x - Point1.x;
	var y = Point2.y - Point1.y;

	if((x === 0) && (y === 0))
		return 0;
	var c1 = 3.14159265 * 0.25;
	var c2 = 3 * c1;
	var ay = (y < 0)?-y:y;
	var angle = 0;
	
	if (x >= 0)
		angle = c1 - c1 * ((x - ay) / (x + ay));
	else
		angle = c2 - c1 * ((x + ay) / (ay - x));
	angle = ((y < 0)?-angle:angle)*57.2957796;
	if(angle > 90)
		angle = angle - 270;
	else
		angle += 90;
	return angle;
};

/**
 * Calculate the distance between two points.
 * 
 * @param Point1	A <code>FlxPoint</code> object referring to the first location.
 * @param Point2	A <code>FlxPoint</code> object referring to the second location.
 * 
 * @return	The distance between the two points as a floating point <code>Number</code> object.
 */
Flixel.FlxU.getDistance = function(Point1, Point2)
{
	var dx = Point1.x - Point2.x;
	var dy = Point1.y - Point2.y;
	return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Returns the arc cosine of an angle given in radians. 
 * If value is smaller than -1, then the result is PI.
 * If the argument is greater than 1, then the result is 0.
 * 
 * @param value    The angle, in radians.
 * @return value's acos
 */
Flixel.FlxU.acos = function(value)
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Returns the arc sine of an angle given in radians.
 * If value is smaller than -1, then the result is -HALF_PI.
 * If the argument is greater than 1, then the result is HALF_PI.
 * 
 * @param value	The angle, in radians.
 * @return fValue's asin
 */
Flixel.FlxU.asin = function(value)
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};


/**
 * Computes and returns the sine of the specified angle in radians.
 * To calculate a radian. This method is only a fast sine approximation.
 * 
 * @param angleRadians	A number that represents an angle measured in radians.
 * @return A number from -1.0 to 1.0.
 */
Flixel.FlxU.sin = function(angleRadians)
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Computes and returns the cosine of the specified angle in radians. To
 * calculate a radian. This method is only a fast cosine approximation.
 * 
 * @param angleRadians	A number that represents an angle measured in radians.
 * @return A number from -1.0 to 1.0.
 */
Flixel.FlxU.cos = function(angleRadians)
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Returns the value squared. value ^ 2.
 * 
 * @param value	The value to square.
 * @return The square of the given value.
 */
Flixel.FlxU.sqr = function(value)
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Returns the value squared. value ^ 2.
 * 
 * @param value	The value to square.
 * @return The square of the given value.
 */
Flixel.FlxU.sqrt = function(value)
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Integer cast with respect to its sign.
 * 
 * @param value	A number.
 * @return The number casted to an integer with respect to its sign.
 */
Flixel.FlxU.rint = function(value)
{
	if(value > 0.0) {
		return int(value + 0.5);
	} else if(value < 0.0) {
		return -int(-value + 0.5);
	} else {
		return 0;
	}
};

/**
 * Returns Euler's number e raised to the power of a double value
 * @param value
 * @return
 */
Flixel.FlxU.exp = function(value) 
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Returns the value of the first argument raised to the power of the second argument.
 * Note: before you use this code you have to test it if the approximation is good 
 * enough for you!
 * 
 * @param aThe base.
 * @param bThe exponent.
 * @return
 */
Flixel.FlxU.pow = function(a, b) 
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Returns the natural logarithm (base e) of a double value.
 * 
 * @param value
 */
Flixel.FlxU.log = function(value) 
{
	throw new Error("Do not use FlxU math stuff, use Math. it's faster");
};

/**
 * Fills an array with numbers.
 * 
 * @return An array with numbers.
 */
Flixel.FlxU.fillArray = function(startAt, max)
{
	startAt = startAt || 0;
	max = max || 10;
	
	var a = [];
	for (var i = startAt; i < max; i++)  {
		a[i] = i;
	}
	return a;
};

/**
 * Round up to the next highest power of 2.
 * 
 * @param valueA value that needs to be power of 2.
 * @return	A value of power of 2.
 */
Flixel.FlxU.ceilPowerOfTwo = function(value)
{
	value--;
	value |= value >> 1;
	value |= value >> 2;
	value |= value >> 4;
	value |= value >> 8;
	value |= value >> 16;
	value++;
	return value;
};

/**
 * Round up to the next lowest power of 2.
 * 
 * @param valueA value that needs to be power of 2.
 * @return	A value of power of 2.
 */
Flixel.FlxU.floorPowerOfTwo = function(value)
{
	return Flixel.FlxU.ceilPowerOfTwo(value) >> 1;
};

/**
 * Generates and returns a 2D array.
 * 
 * @param	x	The array's first dimension.
 * @param	y	The array's second dimension.
 * @return	An array of the provided dimensions.
 */
Flixel.FlxU.create2DArray = function(x, y)
{
	var a = new Array(x);
	for (var i = 0; i < x; i++) {
		a[i] = new Array(y);
	}
	return a;
};

/**
 * Returns the class name.
 */
Flixel.FlxU.prototype.toString = function()
{
	return "FlxU";
};