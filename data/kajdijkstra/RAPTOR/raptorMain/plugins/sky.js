raptorjs.sky = function(){
	this.shader;
	this.sphereMesh;
	this.entity;
	this.create();
}

raptorjs.sky.prototype.create = function() {
	var texture = raptorjs.resources.getTexture("sky");
	
	var skySampler =  raptorjs.createObject("sampler2D");
	skySampler.texture = texture;
	
	
	
	this.shader = raptorjs.createObject("shader");
	this.shader.createFomFile("shaders/sky.shader");
	
	this.shader.setUniform('textureSampler', skySampler);

	this.shader.setUniform('g_AtmosphereBrightColor', [1.0,1.1,1.4]);
	this.shader.setUniform('g_AtmosphereDarkColor', [0.6,0.6,0.7]);
	
	
	
	//var sphereMesh = raptorjs.primitives.createSphere(15, 64, 64);
	var sphereMesh = raptorjs.primitives.createSphere(570, 16, 16);
	
	
	var mesh = raptorjs.createObject('mesh');
	mesh.name = 'skySphere';
	mesh.addSubMesh(sphereMesh);
	
	this.entity = raptorjs.createObject("entity");
	this.entity.addMesh(mesh);
	//entity.transform.scale(50, 50, 50);	
	this.entity.transform.translate(0, 500, 0);
	//entity.transform.rotateX( -90 );	

	this.entity.shader = this.shader;

	raptorjs.scene.addEntity( this.entity );
}

raptorjs.sky.prototype.update = function(){
	this.entity.shader.setUniform('g_LightPosition', raptorjs.sunLight.position);
	this.entity.shader.setUniform('g_CameraPosition', raptorjs.mainCamera.eye);
	
}