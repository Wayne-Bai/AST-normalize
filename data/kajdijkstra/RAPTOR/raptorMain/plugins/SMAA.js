raptorjs.smaa = function () {

	this.colorSampler;

	this.quadView = raptorjs.matrix4.lookAt([0, 0, 0], [0, -1, 0], [0, 0, -1]);
	this.quadProjection = raptorjs.matrix4.orthographic(-1, 1, -1, 1, -1, 1);
	this.quadViewProjection = raptorjs.matrix4.composition(this.quadProjection, this.quadView);

	//Framebuffers
	this.edgesFramebuffer = raptorjs.system.createFrameBuffer( 1024, 1024, { filter : gl.LINEAR, type : gl.FLOAT} );
	
	this.edgesSampler = raptorjs.system.samplerFromFramebuffer(this.edgesFramebuffer);

	this.edgesSampler.MIN_FILTER = gl.NEAREST;
	this.edgesSampler.MAG_FILTER = gl.NEAREST;
	this.edgesSampler.WRAP_S = gl.CLAMP_TO_EDGE;
	this.edgesSampler.WRAP_T = gl.CLAMP_TO_EDGE;
	
	this.blendTex = raptorjs.system.createFrameBuffer(1024, 1024, { filter : gl.LINEAR, type : gl.FLOAT});

	this.blendTex.MIN_FILTER = gl.NEAREST;
	this.blendTex.MAG_FILTER = gl.NEAREST;
	this.blendTex.WRAP_S = gl.CLAMP_TO_EDGE;
	this.blendTex.WRAP_T = gl.CLAMP_TO_EDGE;
	//this.outputFramebuffer = raptorjs.system.createFrameBuffer(1024, 1024, {  });

	
	var blendTexSampler = raptorjs.system.samplerFromFramebuffer(this.blendTex);
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
	
	AreaSampler.MIN_FILTER = gl.NEAREST;
	AreaSampler.MAG_FILTER = gl.NEAREST;
	AreaSampler.WRAP_S = gl.CLAMP_TO_EDGE;
	AreaSampler.WRAP_T = gl.CLAMP_TO_EDGE;
	
	// Shaders
	var libShader = raptorjs.createObject("shader");
	libShader.createLibraryFomFile("shaders/SMAA/SMAA.shader");
	
	// 1
	this.lumaEdgeDetection = raptorjs.createObject("shader");
	this.lumaEdgeDetection.addLibrary(libShader, 1);
	this.lumaEdgeDetection.createFomFile("shaders/SMAA/lumaEdgeDetection.shader");
	this.lumaEdgeDetection.setUniform("viewProjection", raptorjs.system.quadViewProjection );
	this.lumaEdgeDetection.setUniform("colorTex", testSampler );
	
	// 2
	this.SMAABlendWeight = raptorjs.createObject("shader");
	this.SMAABlendWeight.addLibrary(libShader, 1);
	this.SMAABlendWeight.createFomFile("shaders/SMAA/SMAABlendingWeightCalculation.shader");
	this.SMAABlendWeight.setUniform("viewProjection", raptorjs.system.quadViewProjection );
	this.SMAABlendWeight.setUniform("edgesTex", this.edgesSampler );
	this.SMAABlendWeight.setUniform("areaTex", AreaSampler );
	this.SMAABlendWeight.setUniform("searchTex", SearchSampler );
	
	this.NeighborhoodBlending = raptorjs.createObject("shader");
	this.NeighborhoodBlending.addLibrary(libShader, 1);
	this.NeighborhoodBlending.createFomFile("shaders/SMAA/SMAANeighborhoodBlending.shader");
	this.NeighborhoodBlending.setUniform("viewProjection", raptorjs.system.quadViewProjection );
	this.NeighborhoodBlending.setUniform("blendTex", blendTexSampler );
	this.NeighborhoodBlending.setUniform("colorTex", testSampler );
}

raptorjs.smaa.prototype.setColorSampler = function( sampler ) {
	this.colorSampler = sampler;


	//this.lumaEdgeDetection.setUniform("colorTex", this.colorSampler );
	//this.NeighborhoodBlending.setUniform("colorTex", this.colorSampler );
}

raptorjs.smaa.prototype.update = function() {
	//gl.enable(gl.STENCIL_TEST);
	//gl.stencilOp(gl.REPLACE);
	

	var edgeDetectionShader = this.lumaEdgeDetection;
	var edgesFramebuffer 	= this.edgesFramebuffer;
	
	raptorjs.system.drawQuad( edgeDetectionShader, edgesFramebuffer );//edgesFramebuffer

	
	var blendWeightShader = this.SMAABlendWeight;
	var blendWeightFB = this.blendTex;
	
	raptorjs.system.drawQuad( blendWeightShader, null );
	
	//gl.disable(gl.STENCIL_TEST);
	
	var NeighborhoodBlendingShader = this.NeighborhoodBlending;
	var outputFramebuffer = this.outputFramebuffer;
	
	//raptorjs.system.drawQuad( NeighborhoodBlendingShader, null );
}