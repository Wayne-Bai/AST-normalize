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
	SpliceVRNode = function() {
		this.img = new Image();
		this.img.src = './spliceVR/editor/img/node.png';
		this.ver = [0.24, -0.32, -1.0,1.0, 1.0, -0.24, -0.32, -1.0,0.0, 1.0, -0.24, 0.32, -1.0,0.0, 0.0, 0.24, 0.32, -1.0,1.0, 0.0];
		this.ind =[0,1,3,3,1,2];
		this.pressed = false;
		this.select = false;
		this.moved = false;
		this.show = true;
		this.close = false;
		this.thumbnail = null;
		this.videos = [];

		this.x = renderFrame.transX;
		this.y = renderFrame.transY;
		this.transX = 0.0;
		this.transY = 0.0;

		this.canvas = document.createElement('canvas');
		this.canvas.width = 480;
		this.canvas.height = 640;
		this.canvas.style.width = 480 + 'px';
		this.canvas.style.height = 640 + 'px';
		this.ctx = this.canvas.getContext('2d');

		this.buffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();
		renderUtil.createTexBuffer(this.buffer, 'nodeVertexBuffer', this.ver, this.indexBuffer, 'nodeIndexBuffer', this.ind);
		this.tex = gl.createTexture();
		this.update();
	};
	SpliceVRNode.prototype.update = function() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		if(this.select){
			this.ctx.fillStyle = '#000050';
			this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
		}
		this.ctx.drawImage(this.img,0,0);
		if(this.thumbnail)
			this.ctx.drawImage(this.thumbnail,40,72,400,200);
		for (var i = 0; i < this.videos.length; i++) {
			this.ctx.fillStyle = '#303030';
			this.ctx.fillRect(82*i+40,370,72, 32);
		}
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		renderUtil.texUpdate(this.canvas);
	};
	SpliceVRNode.prototype.render = function(rotation) {
		gl.bindTexture(gl.TEXTURE_2D, this.tex);
		var modelViewMatrix = mat4.create();
		mat4.identity(modelViewMatrix);
		var nodeX =((this.x-renderFrame.transX));
		var nodeY = ((this.y-renderFrame.transY));
		mat4.scale(modelViewMatrix,modelViewMatrix,[renderFrame.scaleX, renderFrame.scaleY,1.0]);
		mat4.multiply(modelViewMatrix, modelViewMatrix, rotation);
		mat4.translate(modelViewMatrix,modelViewMatrix,[nodeX,nodeY,renderFrame.zoom]);
		renderUtil.drawRectTex(modelViewMatrix, this.buffer, this.indexBuffer, this.tex);	
	};
	SpliceVRNode.prototype.pointEvent = function(){
		if(this.pressed || this.contains(renderFrame.adjX, renderFrame.adjY)){
			if(renderFrame.type == EVENT_MOUSE)
				document.body.style.cursor = 'pointer';
			if(renderFrame.mode == EVENT_DOWN){
				if(renderFrame.adjX > this.x+0.18 && renderFrame.adjY < this.y+0.04 && renderFrame.adjY > this.y-0.04)
					linkStart = this;
				else if(renderFrame.adjX < this.x-0.18 && renderFrame.adjY < this.y+0.04 && renderFrame.adjY > this.y-0.04)
					linkEnd = this;
				else if(renderFrame.adjX > this.x+0.18 && renderFrame.adjY > this.y+0.24)
					this.close = true;
				else
					this.pressed = true;
			}
			else if(renderFrame.mode == EVENT_MOVE && this.pressed){
				this.set(renderFrame.adjX, renderFrame.adjY);
				this.moved = true;
			}
			else if(renderFrame.mode == EVENT_UP){
				if(renderFrame.adjX < this.x-0.18 && renderFrame.adjY < this.y+0.04 && renderFrame.adjY > this.y-0.04 && linkStart != -1 && linkStart != this){
					linkEnd = this;
					renderLinks.push(new SpliceVRLink(linkStart,linkEnd));
				}
				else if(renderFrame.adjX > this.x+0.18 && renderFrame.adjY < this.y+0.04 && renderFrame.adjY > this.y-0.04 && linkEnd != -1 && linkEnd != this){
					linkStart = this;
					renderLinks.push(new SpliceVRLink( linkStart,linkEnd));
				}
				else if(this.close == true && renderFrame.adjX > this.x+0.18 && renderFrame.adjY > this.y+0.24){
					var thisNode = -1;
					for(var i = 0; i < renderNodes.length; i++){
						if(renderNodes[i] == this)
							thisNode = i;
					}
					for(var i = 0; i < renderLinks.length; i++){
						if(renderLinks[i].node1 == this || renderLinks[i].node2 == this){
							renderLinks.splice(i, 1);
							i--;
						}
					}
					renderNodes.splice(thisNode, 1);
				}
				if(this.pressed && (this.moved==0 || renderFrame.type ==EVENT_TOUCH)){
					for(var i = 0; i < renderNodes.length; i++){
						if(renderNodes[i] != this)
							renderNodes[i].select = false;
					}
					this.select = !this.select;
				}
				this.close = false;
				this.moved = false;
				this.pressed = false;
				linkStart = -1;
				linkEnd = -1;
			}
			return true;
		}
		return false;
	};
	SpliceVRNode.prototype.contains = function(x1, y1) {
		if(x1 > this.x+this.ver[5] && x1 < this.x+this.ver[0] && y1 > this.y+this.ver[1] && y1 < this.y+this.ver[11])
			return true;
		return false;
	};
	SpliceVRNode.prototype.set = function(x1, y1) {
		this.x = x1;
		this.y = y1;
	};
})(window);