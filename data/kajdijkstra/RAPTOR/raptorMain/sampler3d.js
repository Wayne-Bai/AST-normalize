/*
-----------------------------------------------------------------------------
This source file is part of Raptor Engine
For the latest info, see http://www.raptorEngine.com

Copyright (c) 2012-2013 Raptorcode

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
-----------------------------------------------------------------------------


Author: Kaj Dijksta

*/
raptorjs.cubeFace = function() {
	this.id = 0;
	this.texture;
	this.type;
}
 


raptorjs.sampler3D = function() {

	this.texture = gl.createTexture();
	this.faces = [];
	
	this.id = ++samplerId;
	
	this.FLIP_Y = true;
	
	
	this.MIN_FILTER = gl.LINEAR;
	this.MAG_FILTER = gl.LINEAR;
	
	this.WRAP_S = gl.REPEAT;
	this.WRAP_T = gl.REPEAT;
	
	this.datatype = gl.RGB;
	this.format = gl.RGB;
	this.internalFormat = gl.RGB;
	
	this.type;
	
	this.binded = false;
	this.anisotropic = false;
	this.useAlpha = false;
}

/**
 * bind sampler to shader
 * @param {(texture)} texture
 * @param {(type)} face type |	gl.TEXTURE_CUBE_MAP_POSITIVE_X
 *								gl.TEXTURE_CUBE_MAP_NEGATIVE_X
 *								gl.TEXTURE_CUBE_MAP_POSITIVE_Y
 *								gl.TEXTURE_CUBE_MAP_NEGATIVE_Y
 *								gl.TEXTURE_CUBE_MAP_POSITIVE_Z
 *								gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
**/
raptorjs.sampler3D.prototype.addFace = function(texture, type) {
	var face = raptorjs.createObject("cubeFace");
	face.texture = texture;
	face.type = type;
	
	this.faces.push(face);
}


raptorjs.environmentProbe = function() {
	this.position = [540.26,1288.559,394.0];
	this.size = raptorjs.vector3(100, 100, 100);
	this.far = 55400;
	
	this.projection;
	this.view;
	
	this.viewProjection;
	
	this.generateCubemap();
}

raptorjs.environmentProbe.prototype.generateCubemap = function() {
	
	var dir = raptorjs.vector3(0, -1, 0);
	var size = this.size;
	var eye = this.position;
	
	var target = raptorjs.vector3.add(this.position, dir);
	
	this.projection = raptorjs.matrix4.perspective(raptorjs.math.degToRad(60), raptorjs.width / raptorjs.height, .01, this.far);
	//this.projection = raptorjs.matrix4.orthographic(-1000, 1000, -1000, 1000, .1, 16000);
	this.view = raptorjs.matrix4.lookAt(this.position, target, [0,0,1]);
	

	//console.log(eye, target, [0, 0, 1]);

	this.viewProjection = raptorjs.matrix4.mul(this.view, this.projection);
	/*
	this.framebuffer = raptorjs.system.createFrameBuffer(raptorjs.width, raptorjs.height, { type : gl.FLOAT, format: gl.RGB, internalformat: gl.RGB });
	
	this.texture = raptorjs.createObject('texture');

	this.texture.data = this.framebuffer.texture;
	this.texture.dataType = 'framebuffer';
	this.texture.width = this.framebuffer.width;
	this.texture.height = this.framebuffer.height;

*/
}


/**
 * bind sampler to shader
 * @param {(shader)} shader
**/
raptorjs.sampler3D.prototype.bind = function(shader) {


		if (type  == "framebuffer" ) {
		
			texture.glTexture =  texture.data;
			type = texture.type;
			
		} else {
			
			if(!this.binded) 
				this.id = shader.samplerId++;
					
				gl.bindTexture(gl.TEXTURE_2D, null);
						
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, this.WRAP_S);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, this.WRAP_T);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
				gl.bindTexture(gl.TEXTURE_CUBE_MAP,  this.texture );

			
			var faces = this.faces;

			for(var c  = 0; c<faces.length; c++) {
			
				var face = faces[c];
				var texture = face.texture;
				var width = texture.width;
				var height = texture.height;
				var faceType = face.type;
				var data = texture.data;
				var type = texture.dataType;
				
				this.type = type;
					
				//serialize texture data type
				switch( type ) {
					case "float":
						gl.texImage2D(faceType, 0, this.format, width, height, 0, this.internalFormat, gl.FLOAT, data);
					break;
					case "int":
						gl.texImage2D(faceType, 0, this.format, width, height, 0, this.internalFormat, gl.UNSIGNED_BYTE, data);
					break;
					case "depth":
						gl.texImage2D(faceType, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
					break;
					case "image":
						gl.texImage2D(faceType, 0, this.format, this.internalFormat, gl.UNSIGNED_BYTE, data);
					break;
					case "canvas":
						gl.texImage2D(faceType, 0, this.format, width, height, 0, this.internalFormat, this.UNSIGNED_BYTE, data);
					break;
				}

			}

			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
			
			
			this.binded = true;
		}
	
}
