raptorjs.seaShore = function(){
	this.width = 256;
	this.surfaceMesh64;
	
	this.createSurface();
}

raptorjs.seaShore.prototype.createSurface = function(){

	var texture = raptorjs.resources.getTexture("water_bump");
	var g_WaterBumpSampler =  raptorjs.createObject("sampler2D");
	g_WaterBumpSampler.texture = texture;

	var texture = raptorjs.resources.getTexture("black");
	var depthSampler = raptorjs.createObject("sampler2D");
	depthSampler.texture = texture;
	
	var texture = raptorjs.resources.getTexture("sky");
	var reflectionSampler = raptorjs.createObject("sampler2D");
	reflectionSampler.texture = texture;

	var texture = raptorjs.resources.getTexture("white");
	var whiteSampler = raptorjs.createObject("sampler2D");
	whiteSampler.texture = texture;
	
	var reflectionFrameBuffer = raptorjs.system.reflectionFrameBuffer;
	var texture = raptorjs.createObject('texture');
	
	texture.data = reflectionFrameBuffer.texture;
	texture.dataType = 'framebuffer';
	texture.width = reflectionFrameBuffer.width;
	texture.height = reflectionFrameBuffer.height;
	
	var reflectionTexture = texture;

	var reflectionSampler = raptorjs.createObject("sampler2D");
	reflectionSampler.texture = reflectionTexture;
	

	//create shader
	var shader = raptorjs.createObject("shader");
	
	shader.createFomFile("shaders/seaShore.shader");
	shader.setUniform("g_DepthTexture",  depthSampler );
	shader.setUniform("g_DepthMapTexture",  depthSampler );
	shader.setUniform("g_RefractionDepthTextureResolved", whiteSampler );
	shader.setUniform("g_ReflectionTexture",  reflectionSampler);
	shader.setUniform("g_WaterBumpTexture", g_WaterBumpSampler );

	shader.setUniform("g_HeightFieldSize", 32 );
	shader.setUniform("g_WaterHeightBumpScale", 1.4 );
	shader.setUniform("g_WaterMicroBumpTexcoordScale", [1,1] );
	//shader.setUniform("g_WaterBumpTexcoordScale", [1,1] );
	shader.setUniform('g_LightPosition', raptorjs.sunLight.position);
	shader.setUniform('g_WaterColorIntensity', [0.1,0.2]);
	shader.setUniform('g_WaterSpecularPower', 1000);
	shader.setUniform('g_ZFar', raptorjs.mainCamera.far);
	shader.setUniform('g_ZNear', raptorjs.mainCamera.near);
	shader.setUniform('g_WaterDeepColor', [0.1,0.4,0.7]);
	shader.setUniform('g_WaterSpecularIntensity', 350.0);
	shader.setUniform('g_WaterScatterColor', [0.3,0.7,0.6]);
	shader.setUniform('g_WaterSpecularColor', [1,1,1]);
	shader.setUniform('g_ScreenSizeInv', [ 1.0 / raptorjs.width, 1.0 / raptorjs.height]);
	shader.setUniform('g_FogDensity', 1.0 / 200.0);
	shader.setUniform('g_AtmosphereDarkColor', [0.6,0.6,0.7] );
	shader.setUniform('g_AtmosphereBrightColor', [1.0,1.1,1.4] );
	shader.setUniform("size", 512.0 );

	this.surfaceShader = shader;
	
	for(var c = 0; c<shader.uniforms.length; c++) {
		//console.log(shader.uniforms[c].name, shader.uniforms[c].value);
	}

	//create buffers
	if(gl.getExtension('OES_element_index_uint'))
		this.surfaceMesh64 = raptorjs.primitives.createPlane(100, 100, 512, 512, "triangleStrip", 'int');
	else
		this.surfaceMesh64 = raptorjs.primitives.createPlane(100, 100, 200, 200, "triangleStrip");
		
	this.surfaceMesh64.verticesBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, this.surfaceMesh64.verticesBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.surfaceMesh64.vertices, gl.STATIC_DRAW);
	this.surfaceMesh64.verticesBuffer.itemSize = 3;
	this.surfaceMesh64.verticesBuffer.numItems = this.surfaceMesh64.vertices.length / 3;

	this.surfaceMesh64.textcoordsBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.surfaceMesh64.textcoordsBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, this.surfaceMesh64.textcoords, gl.STATIC_DRAW);
	this.surfaceMesh64.textcoordsBuffer.itemSize = 2;
	this.surfaceMesh64.textcoordsBuffer.numItems = this.surfaceMesh64.textcoords.length / 2;

	this.surfaceMesh64.indicesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.surfaceMesh64.indicesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.surfaceMesh64.indices, gl.STATIC_DRAW);
	this.surfaceMesh64.indicesBuffer.itemSize = 1;
	this.surfaceMesh64.indicesBuffer.numItems = this.surfaceMesh64.indices.length;
}

var ggggggg = 0;

raptorjs.seaShore.prototype.render = function() {
	var shader = this.surfaceShader;
	var camera = raptorjs.mainCamera;
	var shaderProgram = shader.program;
	
	if(raptorjs.system.antiAlias) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, raptorjs.system.fxaaFrameBuffer);
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
	
	gl.useProgram(shaderProgram);
	
	
	ggggggg += raptorjs.elapsed;
	
	var  waterTexcoordShift = [ggggggg * 0.001 ,ggggggg * 0.0015];

	shader.setUniform("worldViewProjection", camera.worldViewProjection );

	shader.setUniform("g_CameraPosition", raptorjs.mainCamera.eye );
	shader.setUniform("g_WaterBumpTexcoordShift", waterTexcoordShift );
	//shader.setUniform('g_LightModelViewProjectionMatrix', raptorjs.sunLight.viewProjection);
	//shader.setUniform('g_ModelViewProjectionMatrix', raptorjs.mainCamera.worldViewProjection);
	//shader.setUniform('g_ModelViewMatrix', raptorjs.mainCamera.view);
	
	var primitive = this.surfaceMesh64;

	var buffer = primitive.textcoordsBuffer;
	var attribute = shader.getAttributeByName('uv');
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
	
	shader.update();
	
	var buffer = primitive.indicesBuffer;
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, buffer );
	
	if(gl.getExtension('OES_element_index_uint'))
		gl.drawElements( gl.LINE_STRIP, buffer.numItems, gl.UNSIGNED_INT, 0 );
	else
		gl.drawElements( gl.LINE_STRIP, buffer.numItems, gl.UNSIGNED_SHORT, 0 );
		
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}