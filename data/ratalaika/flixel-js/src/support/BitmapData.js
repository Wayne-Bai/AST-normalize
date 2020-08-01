/**
 * The BitmapData class lets you work with the data (pixels) of a Bitmap object.<br>
 * You can use the methods of the BitmapData class to create arbitrarily sized transparent<br>
 * or opaque bitmap images and manipulate them in various ways at runtime.<br>
 * 
 * TODO: hitTest (needed by FlxSprite.overlapsPoint)
 *
 * v1.0 Initial version
 * 
 * @version 1.0 - 17/09/2014
 * @author ratalaika / ratalaikaGames
 * @author Richard Davey <rich@photonstorm.com>
 */

/**
 * Creates a BitmapData object with a specified width and height.
 * 
 * @param Width
 *            The width of the bitmap image in pixels.
 * @param Height
 *            The height of the bitmap image in pixels.
 * @param Transparent
 *            Specifies whether the bitmap image supports per-pixel transparency.
 * @param FillColor
 *            A 32-bit ARGB color value that you use to fill the bitmap image area. The default value is 0xFFFFFFFF (solid white).
 */
var BitmapData = function(Width, Height, Transparent, FillColor)
{
	Transparent = (Transparent === undefined) ? true : Transparent;
	FillColor = (FillColor === undefined) ? 0xFFFFFFFF : FillColor;

	// pre-process FillColor to ensure correct behavior
	// FIXME: For now we set the fill to fully transparent if Transparent is
	// true
	/*
	 * FillColor = FillColor.toString(16).pad(8, 0, "left"); if (Transparent) { FillColor = parseInt("00" + FillColor.substr(2, 6), 16); console.log("fixed color", FillColor); }
	 */

	this.transparent = Transparent;
	this.width = Width;
	this.height = Height;
	this._data = Array(); // pixel data array
	this._canvas = CanvasManager.create(this.width, this.height);
	this.context = this._canvas.getContext('2d');

	// FIXME: Temporarily disabled fill while researching alpha problems
	this.context.save();
	// var a;
	this.context.fillStyle = BitmapData.makeRGBA(FillColor);
	// console.log(a, this.context.fillStyle); //DEBUG
	this.context.fillRect(0, 0, this.width, this.height);
	// document.body.appendChild(this._canvas).setAttribute('title', a);
	// //DEBUG
	this.context.restore();
	
	BitmapData.ID++;
};
BitmapData.ID = 0;

/**
 * Returns an integer that represents an RGB pixel value from a BitmapData object at a specific point (x, y).<br>
 * FIXME: This returns "premultiplied" (affected by alpha) pixels, not "unmultiplied" a Flash specifies.
 * 
 * @param X
 *            The x position of the pixel.
 * @param Y
 *            The y position of the pixel.
 */
BitmapData.prototype.getPixel = function(X, Y)
{
	var d = this.context.getImageData(X, Y, 1, 1).data;
	return ((d[0] << 16) | (d[1] << 8) | (d[2]));
};

/**
 * Provides a fast routine to perform pixel manipulation between images with no stretching, rotation, or color effects.<br>
 * FIXME: alphaBitmapData, alphaPoint are ignored. mergeAlpha temporarily ignored
 * 
 * @param sourceBitmapData
 *            The input bitmap image from which to copy pixels.<br>
 *            The source image can be a different BitmapData instance, or it can refer to the current BitmapData instance.
 * @param sourceRect
 *            A rectangle that defines the area of the source image to use as input.
 * @param destPoint
 *            The destination point that represents the upper-left corner of the rectangular area where the new pixels are placed.
 * @param alphaBitmapData
 *            (default = null)<br>
 *            A secondary, alpha BitmapData object source.
 * @param alphaPoint
 *            (default = null)<br>
 *            The point in the alpha BitmapData object source that corresponds to the upper-left corner of the sourceRect parameter.
 * @param mergeAlpha
 *            (default = false)<br>
 *            To use the alpha channel, set the value to true. To copy pixels with no alpha channel, set the value to false.
 * @param clearRect
 *            (default = false)<br>
 *            If we have to clear the context rectangle.
 */
BitmapData.prototype.copyPixels = function(sourceBitmapData, sourceRect, destPoint, alphaBitmapData, alphaPoint, mergeAlpha, clearRect)
{

	/*
	 * var d = sourceBitmapData.context.getImageData( sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height );
	 * 
	 * this.context.putImageData(d, destPoint.x, destPoint.y);
	 */

	// NOTE: Alternate implementation to get alpha right. Copying pixels is not correct because we don't blend alpha with the new canvas
	if(clearRect)
		this.context.clearRect(destPoint.x, destPoint.y, sourceRect.width, sourceRect.height);

	// Round the position
	destPoint.x = Math.round(destPoint.x);
	destPoint.y = Math.round(destPoint.y);

	this.context.drawImage(sourceBitmapData._canvas, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, destPoint.x, destPoint.y, sourceRect.width, sourceRect.height);
};

/**
 * Sets a single pixel of a BitmapData object.
 * 
 * @param X
 *            The x position of the pixel.
 * @param Y
 *            The y position of the pixel.
 * @param Color
 *            The resulting RGB color for the pixel.
 */
BitmapData.prototype.setPixel = function(X, Y, Color)
{

	// is a 1x1 rect faster than manipulating the data? No idea
	this.context.fillStyle = BitmapData.makeRGBA(Color);
	this.context.fillRect(X, Y, 1, 1);
};

/**
 * Fills a rectangular area of pixels with a specified ARGB color.
 * 
 * @param rect
 *            The rectangular area to fill.
 * @param color
 *            The ARGB color value that fills the area.<br>
 *            ARGB colors are often specified in hexadecimal format; for example, 0xFF336699.
 */
BitmapData.prototype.fillRect = function(rect, color)
{
	this.context.save();
	this.context.clearRect(rect.x, rect.y, rect.width, rect.height);
	this.context.fillStyle = BitmapData.makeRGBA(color);
	this.context.fillRect(rect.x, rect.y, rect.width, rect.height);
	this.context.restore();
};

/**
 * Adjusts the color values in a specified area of a bitmap image by using a ColorTransform object.
 * 
 * @param rect
 *            A Rectangle object that defines the area of the image in which the ColorTransform object is applied.
 * @param colorTransform
 *            A ColorTransform object that describes the color transformation values to apply.
 */
BitmapData.prototype.colorTransform = function(rect, colorTransform)
{
	var ct = colorTransform;
	var d = this.context.getImageData(rect.x, rect.y, rect.width, rect.height);
	var r, g, b, a;

	for (var i = 0; i < d.data.length; i += 4) {
		// figure out new component values
		r = (d.data[i] * ct.redMultiplier) + ct.redOffset;
		g = (d.data[i + 1] * ct.greenMultiplier) + ct.greenOffset;
		b = (d.data[i + 2] * ct.blueMultiplier) + ct.blueOffset;
		a = (d.data[i + 3] * ct.alphaMultiplier) + ct.alphaOffset;

		// clamp values.
		r = (r > 255) ? 255 : r;
		r = (r < 0) ? 0 : r;
		g = (g > 255) ? 255 : g;
		g = (g < 0) ? 0 : g;
		b = (b > 255) ? 255 : b;
		b = (b < 0) ? 0 : b;
		a = (a > 255) ? 255 : a;
		a = (a < 0) ? 0 : a;

		// assign new values
		d.data[i] = r;
		d.data[i + 1] = g;
		d.data[i + 2] = b;
		d.data[i + 3] = a;
	}

	this.context.putImageData(d, rect.x, rect.y);

};

/**
 * Draws the source display object onto the bitmap image, using the Flash runtime vector renderer.<br>
 * FIXME: Only source and matrix are used
 * 
 * @param source
 *            The display object or BitmapData object to draw to the BitmapData object.
 * @param matrix
 *            (default = null)<br>
 *            A Matrix object used to scale, rotate, or translate the coordinates of the bitmap. If you do not want to apply a matrix transformation to the image, set this parameter to an identity
 *            matrix, created with the default new Matrix() constructor, or pass a null value.
 * @param colorTransform
 *            (default = null)<br>
 *            A ColorTransform object that you use to adjust the color values of the bitmap. If no object is supplied, the bitmap image's colors are not transformed. If you must pass this parameter
 *            but you do not want to transform the image, set this parameter to a ColorTransform object created with the default new ColorTransform() constructor.
 * @param blendMode
 *            (default = null)<br>
 *            A string value, from the flash.display.BlendMode class, specifying the blend mode to be applied to the resulting bitmap.
 * @param clipRect
 *            (default = null)<br>
 *            A Rectangle object that defines the area of the source object to draw. If you do not supply this value, no clipping occurs and the entire source object is drawn.
 * @param smoothing
 *            (default = false)<br>
 *            A Boolean value that determines whether a BitmapData object is smoothed when scaled or rotated, due to a scaling or rotation in the matrix parameter.
 */
BitmapData.prototype.draw = function(source, matrix, colorTransform, blendMode, clipRect, smoothing)
{

	this.context.save();

	// Perform a transform (scale, rotation, or translation) only if a matrix is passed
	if (matrix !== undefined && matrix !== null) {
		this.context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
	}

	// If a clip rect is specified then draw only a portion of the source image
	if (clipRect !== undefined && clipRect !== null) {
		this.context.drawImage(source._canvas, clipRect.x, clipRect.y, clipRect.width, clipRect.height, 0, 0, clipRect.width, clipRect.height);
	} else {
		this.context.drawImage(source._canvas, 0, 0);
	}

	this.context.restore();

};

/**
 * NOTE: This is not a Flash BitmapData function. This is a helper function.<br>
 * Makes a CSS color for Canvas fillStyles, e.g. rgb(128, 64, 64, 0.7);
 * 
 * @param Color
 *            The ARGB color.
 * @param Alpha
 *            The optional Alpha value in case the color will be just RGB. 
 */
BitmapData.makeRGBA = function(Color, Alpha)
{
	Color = (Color === undefined || Color === null) ? 0x0 : Color;

	var f = Color.toString(16).pad(8, "0", "left");
	var a = Flixel.FlxU.roundWithDec(parseInt(f.substr(0, 2), 16) / 255, 1);
	var r = parseInt(f.substr(2, 2), 16);
	var g = parseInt(f.substr(4, 2), 16);
	var b = parseInt(f.substr(6, 2), 16);
	
	a = (Alpha === undefined || Alpha === null) ? a :  Alpha;

	return ("rgba(" + r + "," + g + "," + b + "," + a + ")");
};

/**
 * Resize the canvas and clear it.
 */
BitmapData.prototype.resize = function(Width, Height)
{
	this.width = this._canvas.width = Width;
	this.height = this._canvas.height = Height;
	
	// Clear all
	this.context.clearRect(0, 0, this.width, this.height);
};

/**
 * Clear the canvas.
 */
BitmapData.prototype.clear = function()
{
	this.context.clearRect(0, 0, this.width, this.height);
};

/**
 * Returns a new BitmapData object that is a clone of the original instance with an exact copy of the contained bitmap.
 * 
 * @returns {BitmapData}
 */
BitmapData.prototype.clone = function()
{
	var bitmap = new BitmapData(this.width, this.height, this.transparent, 0x00000000);
	bitmap.draw(this);
	return bitmap;
};

/**
 * JS-specific static function to turn HTMLImageElemnt objects into BitmapData objects.
 */
BitmapData.fromImage = function(img)
{
	var bitmap = new BitmapData(img.width, img.height, true, 0x00000000);
	bitmap.context.drawImage(img, 0, 0);
	return bitmap;
};