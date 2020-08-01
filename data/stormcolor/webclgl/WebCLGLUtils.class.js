/** 
* Utilities
* @class
* @constructor
*/
WebCLGLUtils = function(gl) { 
	this.gl = gl;
};

/**
* @private 
*/
WebCLGLUtils.prototype.loadQuad = function(node, length, height) {
	var l=(length==undefined)?0.5:length;
	var h=(height==undefined)?0.5:height;
	this.vertexArray = [-l, -h, 0.0,
	                     l, -h, 0.0,
	                     l,  h, 0.0,
	                    -l,  h, 0.0];
	
	this.textureArray = [0.0, 0.0, 0.0,
	                     1.0, 0.0, 0.0,
	                     1.0, 1.0, 0.0,
	                     0.0, 1.0, 0.0];
	
	this.indexArray = [0, 1, 2,      0, 2, 3];
	
	var meshObject = new Object;
	meshObject.vertexArray = this.vertexArray;
	meshObject.vertexItemSize = this.vertexItemSize;
	meshObject.vertexNumItems = this.vertexNumItems;
	
	meshObject.textureArray = this.textureArray;
	meshObject.textureItemSize = this.textureItemSize;
	meshObject.textureNumItems = this.textureNumItems;
	
	meshObject.indexArray = this.indexArray;
	meshObject.indexItemSize = this.indexItemSize;
	meshObject.indexNumItems = this.indexNumItems;
	
	return meshObject;
};
/**
 * @private 
 */
WebCLGLUtils.prototype.createShader = function(name, sourceVertex, sourceFragment, shaderProgram) {
	var _sv = false, _sf = false;
	
	var shaderVertex = this.gl.createShader(this.gl.VERTEX_SHADER);
	this.gl.shaderSource(shaderVertex, sourceVertex);
	this.gl.compileShader(shaderVertex);
	if (!this.gl.getShaderParameter(shaderVertex, this.gl.COMPILE_STATUS)) {
		alert('Error sourceVertex of shader '+name+'. See console.');
		console.log('Error vertex-shader '+name+':\n '+this.gl.getShaderInfoLog(shaderVertex));
		if(this.gl.getShaderInfoLog(shaderVertex) != undefined) {
			console.log(this.gl.getShaderInfoLog(shaderVertex));
		}
	} else  {
		this.gl.attachShader(shaderProgram, shaderVertex);
		_sv = true;
	}
	
	var shaderFragment = this.gl.createShader(this.gl.FRAGMENT_SHADER);
	this.gl.shaderSource(shaderFragment, sourceFragment);
	this.gl.compileShader(shaderFragment);
	if (!this.gl.getShaderParameter(shaderFragment, this.gl.COMPILE_STATUS)) {
		alert('Error sourceFragment of shader '+name+'. See console.');
		var infoLog = this.gl.getShaderInfoLog(shaderFragment);
		console.log('Error fragment-shader '+name+':\n '+infoLog);
		if(infoLog != undefined) {
			console.log(infoLog);
			var arrErrors = [];
			var errors = infoLog.split("\n");
			for(var n = 0, f = errors.length; n < f; n++) {
				if(errors[n].match(/^ERROR/gim) != null) {
					var expl = errors[n].split(':');
					var line = parseInt(expl[2]);
					arrErrors.push([line,errors[n]]);
				}
			}
			var sour = this.gl.getShaderSource(shaderFragment).split("\n");
			sour.unshift("");
			for(var n = 0, f = sour.length; n < f; n++) {
				var lineWithError = false;
				var errorStr = '';
				for(var e = 0, fe = arrErrors.length; e < fe; e++) {
					if(n == arrErrors[e][0]) {
						lineWithError = true;
						errorStr = arrErrors[e][1];
						break;
					}
				}
				if(lineWithError == false) {
					console.log(n+' '+sour[n]);
				} else {
					console.log('►►'+n+' '+sour[n]+'\n'+errorStr);
				}
			}
		}
	} else {
		this.gl.attachShader(shaderProgram, shaderFragment);	
		_sf = true;
	}
	
	if(_sv == true && _sf == true) {
		this.gl.linkProgram(shaderProgram);
		if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
			alert('Error in shader '+name);
			console.log('Error shader program '+name+':\n ');
			if(this.gl.getProgramInfoLog(shaderProgram) != undefined) {
				console.log(this.gl.getProgramInfoLog(shaderProgram));
			} 
		}
	}
};


/**
* Get Uint8Array from HTMLImageElement
* @returns {Uint8Array}
* @param {HTMLImageElement} imageElement
*/
WebCLGLUtils.prototype.getUint8ArrayFromHTMLImageElement = function(imageElement) {
	var e = document.createElement('canvas');
	e.width = imageElement.width;
	e.height = imageElement.height;
	var ctx2D_tex = e.getContext("2d");		
	ctx2D_tex.drawImage(imageElement, 0, 0);
	var arrayTex = ctx2D_tex.getImageData(0, 0, imageElement.width, imageElement.height);

    return arrayTex.data;
};
/**
* Dot product vector4float
* @private 
*/
WebCLGLUtils.prototype.dot4 = function(vector4A,vector4B) {
	return vector4A[0]*vector4B[0] + vector4A[1]*vector4B[1] + vector4A[2]*vector4B[2] + vector4A[3]*vector4B[3];
};
/**
* Compute the fractional part of the argument. fract(pi)=0.14159265...
* @private 
*/
WebCLGLUtils.prototype.fract = function(number) {
	return number - Math.floor(number);
};
/**
* Pack 1float (0.0-1.0) to 4float rgba (0.0-1.0, 0.0-1.0, 0.0-1.0, 0.0-1.0)
* @private 
*/
WebCLGLUtils.prototype.pack = function(v) {
	var bias = [1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0];

	var r = v;
	var g = this.fract(r * 255.0);
	var b = this.fract(g * 255.0);
	var a = this.fract(b * 255.0);
	var colour = [r, g, b, a];
	
	var dd = [colour[1]*bias[0],colour[2]*bias[1],colour[3]*bias[2],colour[3]*bias[3]];
	
	return [colour[0]-dd[0],colour[1]-dd[1],colour[2]-dd[2],colour[3]-dd[3] ];
};
/**
* Unpack 4float rgba (0.0-1.0, 0.0-1.0, 0.0-1.0, 0.0-1.0) to 1float (0.0-1.0)
* @private 
*/
WebCLGLUtils.prototype.unpack = function(colour) {
	var bitShifts = [1.0, 1.0/255.0, 1.0/(255.0*255.0), 1.0/(255.0*255.0*255.0)];
	return this.dot4(colour, bitShifts);
};
/**
* Get pack GLSL function string
* @returns {String}
*/
WebCLGLUtils.prototype.packGLSLFunctionString = function() {
	return 'vec4 pack (float depth) {'+
				'const vec4 bias = vec4(1.0 / 255.0,'+
							'1.0 / 255.0,'+
							'1.0 / 255.0,'+
							'0.0);'+

				'float r = depth;'+
				'float g = fract(r * 255.0);'+
				'float b = fract(g * 255.0);'+
				'float a = fract(b * 255.0);'+
				'vec4 colour = vec4(r, g, b, a);'+
				
				'return colour - (colour.yzww * bias);'+
			'}';
};
/**
* Get unpack GLSL function string
* @returns {String}
*/
WebCLGLUtils.prototype.unpackGLSLFunctionString = function() {
	return 'float unpack (vec4 colour) {'+
				'const vec4 bitShifts = vec4(1.0,'+
								'1.0 / 255.0,'+
								'1.0 / (255.0 * 255.0),'+
								'1.0 / (255.0 * 255.0 * 255.0));'+
				'return dot(colour, bitShifts);'+
			'}';
};