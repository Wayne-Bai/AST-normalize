/*
SpliceVR Editor: A video editor for cinematic virtual reality
Copyright (C) 2015 Alex Meagher Grau

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
*/

"use strict";
	var vrHMD;
	var vrSensor;

	var renderFrame;
	var renderUtil;
	var renderer;
	var spliceVideos;
	var renderSidebar;
	var renderBottombar;
	var renderZoom;
	var renderMenu;
	var renderAssets;
	var renderAdd;
	var svrFile;
	var input;
	var gl;
	var glProgram;
	var globalCanvas;
	var renderNodes = [];
	var renderLinks = [];
	var linkStart = -1;
	var linkEnd = -1;
	var mono = true;
	var renderThread;

	var EVENT_DOWN = 1;
	var EVENT_MOVE = 2;
	var EVENT_UP = 3;

	var EVENT_MOUSE = 0;
	var EVENT_TOUCH = 1;


	document.addEventListener("DOMContentLoaded", function(event) {
		renderFrame = new SpliceVRFrame();
		renderUtil = new SpliceVRUtil();

		gl = renderUtil.createWebGL(globalCanvas);
		glProgram = new SpliceVRUtil.Program(gl, 'GLProgram',SpliceVRUtil.GL_PROGRAM_VER_,SpliceVRUtil.GL_PROGRAM_PIX_,['a_xyz', 'a_uv'], ['u_projectionMatrix', 'u_modelViewMatrix']);
		glProgram.beginLinking();
		glProgram.endLinking();
		spliceVideos = new SpliceVRVideos();
		renderSidebar = new SpliceVRSidebar();
		renderBottombar = new SpliceVRBottombar();
		renderZoom = new SpliceVRZoom();
		renderMenu = new SpliceVRMenu();
		renderAssets = new SpliceVRAssets();
		renderAdd = new SpliceVRAdd();
		input = new SpliceVRInput();

		svrFile = new SpliceVRFile();
		
		var updateThread = setInterval(function() {update();}, 100);
		renderThread = requestAnimationFrame(render);
	});
	
	function update() {
		glProgram.use();
		renderFrame.update();
		for (var i = 0; i < renderLinks.length; i++)
			renderLinks[i].update();
		for (var i = renderNodes.length-1; i >= 0; i--)
			renderNodes[i].update();
		renderSidebar.update();
		renderBottombar.update();
		renderZoom.update();
		renderMenu.update();
		renderAssets.update();
		renderAdd.update();
	};
	 function render() {
		gl.clearColor(0.25, 0.25, 0.25, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		glProgram.use();
		if(mono){
			gl.viewport(0, 0, globalCanvas.width, globalCanvas.height);
			renderEye();
		}
		else{
			gl.viewport(0, 0, globalCanvas.width/2, globalCanvas.height);
			renderEye();
			gl.viewport(globalCanvas.width/2, 0, globalCanvas.width/2, globalCanvas.height);
			renderEye();
		}
		requestAnimationFrame(render);
	};
	function renderEye() {
		var rotation = mat4.create();
		if(typeof vrSensor !== 'undefined') {
			var s = vrSensor.getState();
			var totalRotation = quat.create();
			if (s.orientation && typeof s.orientation !== 'undefined' && s.orientation.x != 0 && s.orientation.y != 0 && s.orientation.z != 0 && s.orientation.w != 0) {
				var sensorOrientation = new Float32Array([-s.orientation.x, -s.orientation.y, -s.orientation.z, s.orientation.w]);
				quat.multiply(totalRotation, totalRotation, sensorOrientation);
			} 
			mat4.fromQuat(rotation, totalRotation);
		}

		for (var i = 0; i < renderLinks.length; i++)
			renderLinks[i].render(rotation);
		for (var i = renderNodes.length-1; i >= 0; i--)
			renderNodes[i].render(rotation);
		
		renderSidebar.render(rotation);
		renderBottombar.render(rotation);
		renderZoom.render(rotation);
		renderMenu.render(rotation);
		renderAssets.render(rotation);
		renderAdd.render(rotation);
	};