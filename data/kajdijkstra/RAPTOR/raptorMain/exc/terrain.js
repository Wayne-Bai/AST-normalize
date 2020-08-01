raptorjs.terrain = function(){
	this.width = 256;
	this.surfaceMesh64;
	
	this.createSurface();
}

raptorjs.terrain.prototype.createSurface = function(){
	//create samplers

	var texture = raptorjs.resources.getTexture("sand_diffuse");
	var sand_diffuse_sampler = raptorjs.createObject("sampler2D");
	sand_diffuse_sampler.texture = texture;
	
	var texture = raptorjs.resources.getTexture("sand_normal");
	var sand_normal_sampler = raptorjs.createObject("sampler2D");
	sand_normal_sampler.texture = texture;
	
	var texture = raptorjs.resources.getTexture("rock_diffuse");
	var rock_diffuse_sampler = raptorjs.createObject("sampler2D");
	rock_diffuse_sampler.texture = texture;
	
	var texture = raptorjs.resources.getTexture("rock_normal");
	var rock_normal_sampler = raptorjs.createObject("sampler2D");
	rock_normal_sampler.texture = texture;
	
	var depthTexture = raptorjs.resources.getTexture("depth");
	var depthSampler = raptorjs.createObject("sampler2D");
	depthSampler.texture = depthTexture;
	
	var heightmapTexture = raptorjs.resources.getTexture("islandHeightmap");
	var heightmapSampler = raptorjs.createObject("sampler2D");
	heightmapSampler.texture = heightmapTexture;

	
	//create shader
	var shader = raptorjs.createObject("shader");

	shader.createFomFile("shaders/terrain.shader");

	shader.setUniform("sand_diffuse", sand_diffuse_sampler );

	shader.setUniform("sand_normal", sand_normal_sampler );

	shader.setUniform("heightmapSampler", heightmapSampler );

	//shader.setUniform("rock_normal", rock_normal_sampler );

	//shader.setUniform("depthSampler", depthSampler );


	this.surfaceShader = shader;
	

	//create buffers
	var terrainPrimitive =  raptorjs.primitives.createPlane(100, 100, 100, 100, "triangleStrip");
	
	var mesh = raptorjs.createObject("mesh");
	mesh.addSubMesh(terrainPrimitive);

	var entity = raptorjs.createObject("entity");
	entity.addMesh(mesh);
	entity.transform.translate(0, 0, 0);	
	entity.shader = shader;
	entity.drawType = gl.TRIANGLE_STRIP;
	entity.name = 'terrain';
	
	raptorjs.scene.addEntity( entity );

}

