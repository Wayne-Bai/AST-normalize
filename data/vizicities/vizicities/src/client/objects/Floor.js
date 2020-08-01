/* globals window, _, VIZI, THREE */
(function() {
	"use strict";

	VIZI.Floor = function() {
		VIZI.Log("Inititialising floor object");

		VIZI.Object.call(this);

		this.object = this.createObject();
	};

	VIZI.Floor.prototype = Object.create( VIZI.Object.prototype );

	VIZI.Floor.prototype.createObject = function() {
		var floorContainer = new THREE.Object3D();

		// var floorWireGeom = new THREE.PlaneGeometry(5000, 5000, 200, 200);
		// var floorWireMat = new THREE.MeshBasicMaterial({color: 0xeeeeee, wireframe: true});
		// var floorWire = new THREE.Mesh(floorWireGeom, floorWireMat);
		// floorWire.position.y = -0.3;
		// floorWire.rotation.x = - 90 * Math.PI / 180;

		// floorContainer.add(floorWire);

		// var floorGeom = new THREE.PlaneGeometry(40000, 40000, 4, 4);
		var floorGeom = new THREE.CircleGeometry(20000, 32);
		var floorMat = new THREE.MeshBasicMaterial({color: 0xf8f8f8});
		var floor = new THREE.Mesh(floorGeom, floorMat);
		floor.position.y = -0.4;
		floor.rotation.x = - 90 * Math.PI / 180;

		floorContainer.add(floor);

		this.publish("addToScene", floorContainer);

		return floorContainer;
	};
}());