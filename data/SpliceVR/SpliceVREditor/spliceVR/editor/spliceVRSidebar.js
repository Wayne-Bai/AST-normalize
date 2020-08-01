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

(function(global) {
	SpliceVRSidebar = function() {
		this.img = new Image();
		this.img.src = './spliceVR/editor/img/sidebar.png';
		this.ver = [0.0, -4.0, -1.0,1.0, 1.0, -0.5, -4.0, -1.0,0.0, 1.0, -0.5, 0.0, -1.0,0.0, 0.0, 0, 0.0, -1.0,1.0, 0.0];
		this.ind =[0,1,3,3,1,2];
		this.pressed = false;
		this.show = false;

		this.textCanvas = document.createElement('canvas');
		this.textCanvas.width = renderFrame.hudScaleX*globalCanvas.width/4;
		this.textCanvas.height = globalCanvas.height*2;
		this.textCanvas.style.width = renderFrame.hudScaleX*globalCanvas.width/4 + 'px';
		this.textCanvas.style.height = globalCanvas.height*2 + 'px';
		this.ctx = this.textCanvas.getContext('2d');
		
		this.x = 1.0;
		this.y = 0.0;
		this.transX = 1.0;
		this.transY = -0.0;
		this.hudScaleYStart = renderFrame.hudScaleY;
		this.videoScrollY = 0;
		
		this.buffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();
		renderUtil.createTexBuffer(this.buffer, 'sidebarVertexBuffer', this.ver, this.indexBuffer, 'sidebarIndexBuffer', this.ind);
		this.tex = gl.createTexture();
		this.update();
	};
	SpliceVRSidebar.prototype.update = function() {
		this.ctx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
		this.ctx.fillStyle = '#E0E0E0';
		this.ctx.fillRect(0,0,this.textCanvas.width, this.textCanvas.height);
		this.ctx.fillStyle = '#000000';
		this.ctx.font = '16px helvetica lighter';
		this.ctx.fillStyle = '#000000';
		this.ctx.font = '24px helvetica lighter';
		var select = -1;

		for(var i = 0; i < renderNodes.length; i++){
			if(renderNodes[i].select)
				select = i;
		}
		if(select >= 0){
			this.ctx.fillText('Node '+select, 24, 32+this.videoScrollY);
		}
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		renderUtil.texUpdate(this.textCanvas);
	};
	SpliceVRSidebar.prototype.render = function(rotation) {
		if(!this.show)
			return;

		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		var modelViewMatrix = mat4.create();
		this.x = this.transX/renderFrame.hudScaleX;
		this.y = this.transY/renderFrame.hudScaleY+this.hudScaleYStart/renderFrame.hudScaleY;
		
		mat4.identity(modelViewMatrix);
		mat4.scale(modelViewMatrix,modelViewMatrix,[renderFrame.hudScaleX, renderFrame.hudScaleY/this.hudScaleYStart,1.0]);
		mat4.multiply(modelViewMatrix, modelViewMatrix, rotation);
		mat4.translate(modelViewMatrix,modelViewMatrix,[this.x,this.y,0.0]);
		renderUtil.drawRectTex(modelViewMatrix, this.buffer, this.indexBuffer, this.tex);
	};
	SpliceVRSidebar.prototype.pointEvent = function(){
		if(this.show && (this.pressed || this.contains(renderFrame.hudX, renderFrame.hudY))){
			if(renderFrame.type == EVENT_MOUSE)
				document.body.style.cursor = 'pointer';
			if(renderFrame.mode == EVENT_DOWN)
				this.pressed = true;
			else if(renderFrame.mode == EVENT_UP)
				this.pressed = false;
			return true;
		}
		return false;
	};
	SpliceVRSidebar.prototype.contains = function(x1, y1) {
		if(x1 > this.ver[5]+this.x && x1 < this.ver[0]+this.x && y1 > this.ver[1]+this.y && y1 < this.ver[11]+this.y){
			return true;
		}
		return false;
	};
})(window);