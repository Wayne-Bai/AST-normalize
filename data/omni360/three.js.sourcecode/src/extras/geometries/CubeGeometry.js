/**
 * @author mrdoob / http://mrdoob.com/
 */
/*
///CubeGeometry用来在三维空间内创建一个立方体盒子对象.被BoxGeometry对象替换.
///
///	用法: var geometry = new THREE.BoxGeometry(1,1,1);	
/// 	  var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
/// 	  var cube = new THREE.Mesh(geometry,material);
/// 	  scene.add(cube);
*/
///<summary>CubeGeometry</summary>
///<param name ="width" type="float">立方体宽度</param>
///<param name ="height" type="float">立方体高度</param>
///<param name ="depth" type="float">立方体深度</param>
///<param name ="widthSegments" type="int">立方体宽度细分线段数</param>
///<param name ="heightSegments" type="int">立方体高度细分线段数</param>
///<param name ="depthSegments" type="int">立方体深度细分线段数</param>
THREE.CubeGeometry = function ( width, height, depth, widthSegments, heightSegments, depthSegments ) {

	console.warn( 'THEE.CubeGeometry has been renamed to THREE.BoxGeometry.' );
	return new THREE.BoxGeometry( width, height, depth, widthSegments, heightSegments, depthSegments );

 };
