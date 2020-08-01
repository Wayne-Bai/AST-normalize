raptorjs.MSAA = function () {

	this.colorSampler;

	this.quadView = raptorjs.matrix4.lookAt([0, 0, 0], [0, -1, 0], [0, 0, -1]);
	this.quadProjection = raptorjs.matrix4.orthographic(-1, 1, -1, 1, -1, 1);
	this.quadViewProjection = raptorjs.matrix4.composition(this.quadProjection, this.quadView);

	//Framebuffers
	this.edgesFramebuffer = raptorjs.system.createFrameBuffer( 1280, 720 );
	
	this.edgesSampler = raptorjs.system.samplerFromFramebuffer(this.edgesFramebuffer);

	this.edgesSampler.MIN_FILTER = gl.NEAREST;
	this.edgesSampler.MAG_FILTER = gl.NEAREST;
	this.edgesSampler.WRAP_S = gl.CLAMP_TO_EDGE;
	this.edgesSampler.WRAP_T = gl.CLAMP_TO_EDGE;
	
	//this.blendTex = raptorjs.system.createFrameBuffer(1024, 1024, {   })
	//this.outputFramebuffer = raptorjs.system.createFrameBuffer(1024, 1024, {  });

	
	//var blendTexSampler = raptorjs.system.samplerFromFramebuffer(this.blendTex);
	//this.outputSampler =  raptorjs.system.samplerFromFramebuffer(this.outputFramebuffer);
	
	// Textures
	var AreaTexture = raptorjs.resources.getTexture("AreaTex");
	var AreaSampler = raptorjs.createObject("sampler2D");
	AreaSampler.texture = AreaTexture;

	var SearchTexture = raptorjs.resources.getTexture("SearchTex");
	var SearchSampler = raptorjs.createObject("sampler2D");
	SearchSampler.texture = SearchTexture;

	var testTexture = raptorjs.resources.getTexture("unigine");
	var testSampler = raptorjs.createObject("sampler2D");
	testSampler.texture = testTexture;
	
	SearchSampler.MIN_FILTER = gl.NEAREST;
	SearchSampler.MAG_FILTER = gl.NEAREST;
	SearchSampler.WRAP_S = gl.CLAMP_TO_EDGE;
	SearchSampler.WRAP_T = gl.CLAMP_TO_EDGE;
	
	// Shaders
	var libShader = raptorjs.createObject("shader");
	libShader.createLibraryFomFile("shaders/SMAA/SMAA.shader");
	
	// 1
	//this.lumaEdgeDetection = raptorjs.createObject("shader");
	//this.lumaEdgeDetection.addLibrary(libShader, 1);
	//this.lumaEdgeDetection.createFomFile("shaders/SMAA/lumaEdgeDetection.shader");
	//this.lumaEdgeDetection.setUniform("viewProjection", this.quadViewProjection );
	//this.lumaEdgeDetection.setUniform("colorTex", testSampler );
	
	// 2
	this.MSAAShader = raptorjs.createObject("shader");
	this.MSAAShader.createFomFile("shaders/msaa.shader");
	this.MSAAShader.setUniform("viewProjection", raptorjs.system.quadViewProjection );
	this.MSAAShader.setUniform("infoSampler", this.edgesSampler );
	this.MSAAShader.setUniform("previousDiffuseSampler", this.edgesSampler );
	this.MSAAShader.setUniform("currentDiffuseSampler", this.edgesSampler );
	this.MSAAShader.setUniform("screenWidth", raptorjs.width );
	this.MSAAShader.setUniform("screenHeight", raptorjs.height );
	this.MSAAShader.setUniform("far", raptorjs.mainCamera.far );
	this.MSAAShader.setUniform("near", raptorjs.mainCamera.near );

}	

raptorjs.MSAA.prototype.setMatrices = function( currentViewProj, prevViewProj ) {
	this.MSAAShader.setUniform("mViewProj", currentViewProj );
	this.MSAAShader.setUniform("mViewProjPrev", prevViewProj );
}

raptorjs.MSAA.prototype.setColorSampler = function( currentDiffuse, prevDiffuse ) {
	this.MSAAShader.setUniform("currentDiffuseSampler", currentDiffuse );
	this.MSAAShader.setUniform("previousDiffuseSampler", prevDiffuse );
}

raptorjs.MSAA.prototype.setDepthSampler = function( sampler ) {
	this.MSAAShader.setUniform("infoSampler", sampler );
}

raptorjs.MSAA.prototype.pipeline = function() {
	//gl.enable(gl.STENCIL_TEST);
	//gl.stencilOp(gl.REPLACE);
	
		
	var MSAAShader = this.MSAAShader;
	// var blendWeightFB = this.blendTex;
	raptorjs.system.drawQuad( MSAAShader, null );
	
/*
	var edgeDetectionShader = this.lumaEdgeDetection;
	var edgesFramebuffer 	= this.edgesFramebuffer;
	
	gl.viewport(0, 0, raptorjs.width, raptorjs.height);
	
	raptorjs.system.drawQuad( edgeDetectionShader, edgesFramebuffer );//edgesFramebuffer
	console.log('smaa');

		
	var MSAAShader = this.MSAAShader;
	// var blendWeightFB = this.blendTex;

	raptorjs.system.drawQuad( MSAAShader, null );

	//gl.disable(gl.STENCIL_TEST);
	
	var NeighborhoodBlendingShader = this.NeighborhoodBlending;
	var outputFramebuffer = this.outputFramebuffer;
	*/
	//raptorjs.system.drawQuad( NeighborhoodBlendingShader, null );
}