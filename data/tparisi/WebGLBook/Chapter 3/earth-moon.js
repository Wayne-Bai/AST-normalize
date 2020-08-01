// Constructor
EarthApp = function()
{
	Sim.App.call(this);
}

// Subclass Sim.App
EarthApp.prototype = new Sim.App();

// Our custom initializer
EarthApp.prototype.init = function(param)
{
	// Call superclass init code to set up scene, renderer, default camera
	Sim.App.prototype.init.call(this, param);
	
    // Create the Earth and add it to our sim
    var earth = new Earth();
    earth.init();
    this.addObject(earth);
    
    // Let there be light!
    var sun = new Sun();
    sun.init();
    this.addObject(sun);

    // Move the camera back so we can see our Moon
    this.camera.position.z += 1.667;
}

// Custom Earth class
Earth = function()
{
	Sim.Object.call(this);
}

Earth.prototype = new Sim.Object();

Earth.prototype.init = function()
{
    // Create a group to contain Earth and Clouds
    var earthGroup = new THREE.Object3D();
    
    // Tell the framework about our object
    this.setObject3D(earthGroup);

    // Add the earth globe and clouds
    this.createGlobe();
    this.createClouds();

    // Add the moon
    this.createMoon();
}

Earth.prototype.createGlobe = function()
{
    // Create our Earth with nice texture - normal map for elevation, specular highlights
	var surfaceMap = THREE.ImageUtils.loadTexture( "../images/earth_surface_2048.jpg" );
	var normalMap = THREE.ImageUtils.loadTexture( "../images/earth_normal_2048.jpg" );
	var specularMap = THREE.ImageUtils.loadTexture( "../images/earth_specular_2048.jpg" );

	var shader = THREE.ShaderUtils.lib[ "normal" ],
	uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	uniforms[ "tNormal" ].texture = normalMap;
	uniforms[ "tDiffuse" ].texture = surfaceMap;
	uniforms[ "tSpecular" ].texture = specularMap;

	uniforms[ "enableDiffuse" ].value = true;
	uniforms[ "enableSpecular" ].value = true;

	var shaderMaterial = new THREE.ShaderMaterial({
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: uniforms,
		lights: true
	});

    var globeGeometry = new THREE.SphereGeometry(1, 32, 32);

    // We'll need these tangents for our shader
    globeGeometry.computeTangents();
    var globeMesh = new THREE.Mesh( globeGeometry, shaderMaterial ); 
    
    // Let's work in the tilt
    globeMesh.rotation.x = Earth.TILT;

    // Add it to our group
    this.object3D.add(globeMesh);
	
    // Save it away so we can rotate it
    this.globeMesh = globeMesh;
}

Earth.prototype.createClouds = function()
{
	// Create our clouds
	var cloudsMap = THREE.ImageUtils.loadTexture( "../images/earth_clouds_1024.png" );
	var cloudsMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, map: cloudsMap, transparent:true } );

    var cloudsGeometry = new THREE.SphereGeometry(Earth.CLOUDS_SCALE, 32, 32);
	cloudsMesh = new THREE.Mesh( cloudsGeometry, cloudsMaterial );
	cloudsMesh.rotation.x = Earth.TILT;

    // Add it to our group
    this.object3D.add(cloudsMesh);
	
    // Save it away so we can rotate it
    this.cloudsMesh = cloudsMesh;
}

Earth.prototype.createMoon = function()
{
	var moon = new Moon();
	moon.init();
	this.addChild(moon);
}

Earth.prototype.update = function()
{
	// "I feel the Earth move..."
	this.globeMesh.rotation.y += Earth.ROTATION_Y;

	// "Clouds, too..."
	this.cloudsMesh.rotation.y += Earth.CLOUDS_ROTATION_Y;
	
	Sim.Object.prototype.update.call(this);
}

Earth.ROTATION_Y = 0.003;
Earth.TILT = 0.41;
Earth.RADIUS = 6371;
Earth.CLOUDS_SCALE = 1.005;
Earth.CLOUDS_ROTATION_Y = Earth.ROTATION_Y * 0.95;
	
// Custom Sun class
Sun = function()
{
	Sim.Object.call(this);
}

Sun.prototype = new Sim.Object();

Sun.prototype.init = function()
{
    // Create a point light to show off the earth - set the light out back and to left a bit
	var light = new THREE.PointLight( 0xffffff, 2, 100);
	light.position.set(-10, 0, 20);
    
    // Tell the framework about our object
    this.setObject3D(light);    
}

// Custom Moon class
Moon = function()
{
	Sim.Object.call(this);
}

Moon.prototype = new Sim.Object();

Moon.prototype.init = function()
{
	var MOONMAP = "../images/moon_1024.jpg";
	
    var geometry = new THREE.SphereGeometry(Moon.SIZE_IN_EARTHS, 32, 32);
    var texture = THREE.ImageUtils.loadTexture(MOONMAP);
    var material = new THREE.MeshPhongMaterial( { map: texture, 
    	ambient:0x888888 } );
    var mesh = new THREE.Mesh( geometry, material );
    
    // Let's get this into earth-sized units (earth is a unit sphere)
    var distance = Moon.DISTANCE_FROM_EARTH / Earth.RADIUS;
    mesh.position.set(Math.sqrt(distance / 2), 0, -Math.sqrt(distance / 2));
    
    // Rotate the moon so it shows its moon-face toward earth
    mesh.rotation.y = Math.PI;
    
    // Create a group to contain Earth and Satellites
    var moonGroup = new THREE.Object3D();
    moonGroup.add(mesh);
    
    // Tilt to the ecliptic
    moonGroup.rotation.x = Moon.INCLINATION;

    // Tell the framework about our object
    this.setObject3D(moonGroup);

    // Save away our moon mesh so we can rotate it
    this.moonMesh = mesh;
}

Moon.prototype.update = function()
{
	// Moon orbit
	this.object3D.rotation.y += (Earth.ROTATION_Y / Moon.PERIOD);
	
	Sim.Object.prototype.update.call(this);
}

Moon.DISTANCE_FROM_EARTH = 356400;
Moon.PERIOD = 28;
Moon.EXAGGERATE_FACTOR = 1.2;
Moon.INCLINATION = 0.089;
Moon.SIZE_IN_EARTHS = 1 / 3.7 * Moon.EXAGGERATE_FACTOR;
