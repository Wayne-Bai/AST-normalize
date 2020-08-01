
raptorjs.particleSandbox = function( ){
	this.particleMesh = {};
	
	this.pingPositionFrameBuffer;
	this.pongPositionFrameBuffer;
	
	this.pingVelocityFrameBuffer;
	this.pongVelocityFrameBuffer;
	
	this.currentPositionFrameBuffer;
	this.currentVelociyFrameBuffer;
	
	this.gridPositionFramebuffer;
	
	this.pingPongPosition = 0;
	
	this.velocityFrameBuffer;
	
	this.positionShader;
	this.velocityShader;

	this.sphereShader;
	
	this.mode = 1;
	this.hasIntegerIndex = gl.getExtension('OES_element_index_uint');
	
	this.width = 512;
	
	this.quadProjection;
	this.quadView;
	this.quadViewProjection;
	
	this.sorter;
	this.create();
};

raptorjs.particleSandbox.prototype.create = function( ) {
	this.createSurface();

	this.quadView = raptorjs.matrix4.lookAt([0, 0, 0], [0, -1, 0], [0, 0, -1]);
	this.quadProjection = raptorjs.matrix4.orthographic(-1, 1, -1, 1, -1, 1);
	this.quadViewProjection = raptorjs.matrix4.mul(this.quadView, this.quadProjection);
	
	//this.positionShader.setUniform("worldViewProjection", this.quadViewProjection );
	//this.velocityShader.setUniform("worldViewProjection", this.quadViewProjection );
	//this.gridPositionShader.setUniform("worldViewProjection", this.quadViewProjection );
};



raptorjs.particleSandbox.prototype.switchPositionPingPongBuffer = function() {
	var currentBuffer = this.currentPositionFrameBuffer;
	if(currentBuffer && currentBuffer.name == "ping") {
		this.currentPositionFrameBuffer = this.pongPositionFrameBuffer;
	} else {
		this.currentPositionFrameBuffer = this.pingPositionFrameBuffer;
	}
}


raptorjs.particleSandbox.prototype.createRandomPointlights = function( ) {	
	var width = 512;
	var height = 512;
	var dataArray = [];
	
	for( var y = 0; y < width; y++ )
	{
		for( var x = 0; x <  height; x++ )
		{
			dataArray.push(Math.random());
			dataArray.push(Math.random());

			dataArray.push(Math.random());
			dataArray.push(Math.random()); 
		}
	}
	
	var randomPointlightTexture = raptorjs.textureFromArray(dataArray, width, height, true);
	var randomPointlightSampler = raptorjs.createObject("sampler2D");
	randomPointlightSampler.texture = randomPointlightTexture;
	
	return randomPointlightSampler;
}


raptorjs.particleSandbox.prototype.createSurface = function( ) {
	
	this.pingPositionFrameBuffer = raptorjs.system.createFrameBuffer(this.width, this.width,  {   });
	this.pongPositionFrameBuffer = raptorjs.system.createFrameBuffer(this.width, this.width,  { });

	this.pingPositionFrameBuffer.name = "ping";
	this.pongPositionFrameBuffer.name = "pong";
	
	this.pingPositionFrameBuffer.sampler = raptorjs.system.samplerFromFramebuffer(this.pingPositionFrameBuffer);
	this.pongPositionFrameBuffer.sampler = raptorjs.system.samplerFromFramebuffer(this.pongPositionFrameBuffer);
	
	this.currentPositionFrameBuffer = this.pongPositionFrameBuffer;
	
	this.shader = raptorjs.createObject("shader");
	this.shader.createFomFile("shaders/pointSpriteSphere.shader");
	this.shader.setUniform("positionSampler", this.createRandomPointlights() );
	
	this.positionShader = raptorjs.createObject("shader");
	this.positionShader.createFomFile("shaders/particle sandbox/position.shader");
	this.positionShader.setUniform("numCells", Math.ceil( Math.pow( (this.width * this.width) ,0.33333333) ) );
	this.positionShader.setUniform("width", this.width );
	this.positionShader.setUniform("mode", 1 );
	this.positionShader.setUniform("randomSampler",  this.createRandomPointlights()  );
	
	this.createParticleBuffer( this.width * this.width );
};


raptorjs.particleSandbox.prototype.createParticleBuffer = function( size ) {
	var indexArray = [];

	for(var c = 0; c < size; c++) {
		indexArray[c] = c;
	}

	var mesh = {};
	mesh.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mesh.indexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( indexArray ), gl.STATIC_DRAW);
	mesh.indexBuffer.itemSize = 1;
	mesh.indexBuffer.numItems = size;

	this.particleMesh = mesh;
};



raptorjs.particleSandbox.prototype.update = function( ) {
	//var currentSampler = this.currentPositionFrameBuffer.sampler;

	//this.renderGridPosition();

	//for(var c = 0; c<this.sorter.totalSteps/8; c++) {
	//	this.sorter.checksort();
	//}

	//this.renderVelocity();
	

	//this.positionShader.setUniform("positionSampler", this.currentPositionFrameBuffer.sampler );
	
	
	//this.switchPositionPingPongBuffer();
	
	//raptorjs.system.drawQuad(this.positionShader, this.currentPositionFrameBuffer);
	
	
	var shader = this.shader;
	var camera = raptorjs.mainCamera;
	var shaderProgram = shader.program;
	gl.bindFramebuffer( gl.FRAMEBUFFER, null );
	
	gl.useProgram(shaderProgram);
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
//	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.clear( gl.DEPTH_BUFFER_BIT );
	shader.setUniform("eye", camera.eye );
	shader.setUniform("worldViewProjection", camera.worldViewProjection );
	//shader.setUniform("positionSampler",  this.currentPositionFrameBuffer.sampler  );
	shader.setUniform("pointScale", raptorjs.height / Math.tan( camera.fov * 0.1 * Math.PI / 180.0) * .2 );	
	
	var buffer = this.particleMesh.indexBuffer;
	var attribute = shader.getAttributeByName('index');
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);	
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.drawArrays( gl.POINTS, 0, buffer.numItems );
	
	shader.update();

	//this.sorter.test();
}
