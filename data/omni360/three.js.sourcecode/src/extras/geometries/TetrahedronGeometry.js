/**
 * @author timothypratley / https://github.com/timothypratley
 */
/*
///TetrahedronGeometry用来在三维空间内创建一个四面体对象.
///
///	用法: var geometry = new THREE.TetrahedronGeometry(70);	
/// 	  var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
/// 	  var icos = new THREE.Mesh(geometry,material);
/// 	  scene.add(icos);
*/
///<summary>TetrahedronGeometry</summary>
///<param name ="radius" type="float">四面体半径</param>
///<param name ="detail" type="int">细节因子,默认为0,当超过0将会有更多的顶点,当前的几何体就不会是四面体,当参数detail大于1,将会变成一个球体.</param>
THREE.TetrahedronGeometry = function ( radius, detail ) {
	//TODO: 四面体的参数呢????
	var vertices = [
		 1,  1,  1,   - 1, - 1,  1,   - 1,  1, - 1,    1, - 1, - 1
	];	//顶点数组

	var indices = [
		 2,  1,  0,    0,  3,  2,    1,  3,  0,    2,  3,  1
	];	//顶点索引

	THREE.PolyhedronGeometry.call( this, vertices, indices, radius, detail );

};
/*************************************************
****下面是TetrahedronGeometry对象的方法属性定义,继承自Geometry对象.
**************************************************/
THREE.TetrahedronGeometry.prototype = Object.create( THREE.Geometry.prototype );
