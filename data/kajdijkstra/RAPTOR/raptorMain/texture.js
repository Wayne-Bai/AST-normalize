/*
 * Copyright 2013, Raptorcode Studios Inc, 
 * Author, Kaj Dijkstra.
 * All rights reserved.
 *
 */
 

/**
 * texture
**/
raptorjs.texture = function() {
	this.glTexture =  gl.createTexture();
	
	this.data;
	this.dataType;
	
	this.width;
	this.height;
	
	this.name; 
	this.address;
}


/**
 * Texture from array
 * @param {(array)} array
 * @param {(float)} width
 * @param {(float)} height
 * @param {(boolean)} is_float
**/
raptorjs.textureFromArray = function( array, width, height, is_float ) {
	texture = raptorjs.createObject('texture');
	
	if( is_float ) {
		texture.data = new Float32Array( array );
		texture.dataType = 'float';
	} else {
		texture.data = new Int32Array( array );
		texture.dataType = 'int';
	}
	
	texture.width = width;
	texture.height = height;
	
	return texture;
}


/**
 * Texture from typed array
 * @param {(typedArray)} typedArray
 * @param {(float)} width
 * @param {(float)} height
 * @param {(boolean)} is_float
**/
raptorjs.textureFromTypedArray = function( typedArray, width, height, is_float ) {
	texture = raptorjs.createObject('texture');

	texture.data = typedArray;
	texture.dataType = 'int';	
	texture.width = width;
	texture.height = height;
	
	return texture;
}


/**
 * Texture from typed array 32 bit
 * @param {(array)} Array
 * @param {(float)} width
 * @param {(float)} height
**/
raptorjs.textureFromFloat32Array = function(array, width, height) {
	texture = raptorjs.createObject('texture');
	texture.data = array;
	texture.dataType = 'float';
	texture.width = width;
	texture.height = height;
	
	return texture;
}


/**
 * Texture from typed int array 32 bit
 * @param {(array)} Array
 * @param {(float)} width
 * @param {(float)} height
**/
raptorjs.textureFromInt32Array = function(array, width, height) {
	texture = raptorjs.createObject('texture');
	texture.data = 'int';
	texture.dataType = array;
	texture.width = width;
	texture.height = height;
	
	return texture;
}


/**
 * Texture from dom image
 * @param {(dom object image)} image
**/
raptorjs.textureFromImage = function( image ) {
	texture = raptorjs.createObject('texture');
	texture.data = image;
	texture.dataType = 'image';
	
	texture.width = image.width;
	texture.height = image.height;
	
	return texture;
}


/**
 * Texture from DDS
 * @param {(array)} image
**/
raptorjs.textureFromDDS = function( data ) {
	texture = raptorjs.createObject('texture');
	
	texture.data = data;
	texture.dataType = 'COMPRESSED_RGBA';
	
	texture.width = data.width;
	texture.height = data.height;
	
	console.log(texture);

	return texture;
}