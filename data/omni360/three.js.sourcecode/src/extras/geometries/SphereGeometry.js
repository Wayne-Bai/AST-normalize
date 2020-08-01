/**
 * @author mrdoob / http://mrdoob.com/
 */
/*
///SphereGeometry用来在三维空间内创建一个球体对象.
///
///	用法: var geometry = new THREE.SphereGeometry(5,32,32);	
/// 	  var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
/// 	  var sphere = new THREE.Mesh(geometry,material);
/// 	  scene.add(sphere);
*/
///<summary>SphereGeometry</summary>
///<param name ="radius" type="float">球体体半径</param>
///<param name ="widthSegments" type="int">球体宽度细分线段数,应该是经线吧</param>
///<param name ="heightSegments" type="int">球体高度细分线段数,应该是纬线吧</param>
///<param name ="phiStart" type="float">球体赤道线的起始点弧度</param>
///<param name ="phiLength" type="float">球体赤道线的弧长</param>
///<param name ="thetaStart" type="float">球体经线起始点弧度</param>
///<param name ="thetaLength" type="float">球体经线弧长</param>
THREE.SphereGeometry = function ( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength ) {

	THREE.Geometry.call( this );	//调用Geometry对象的call方法,将原本属于Geometry的方法交给当前对象SphereGeometry来使用.

	this.parameters = {
		radius: radius,	//球体体半径
		widthSegments: widthSegments,	//球体宽度细分线段数,应该是经线吧
		heightSegments: heightSegments,	//球体高度细分线段数,应该是纬线吧
		phiStart: phiStart,	//球体赤道线的起始点弧度
		phiLength: phiLength,	//球体赤道线的弧长
		thetaStart: thetaStart,	 	//球体经线起始点弧度
		thetaLength: thetaLength 	//球体经线弧长
	};

	radius = radius || 50;	//球体体半径,默认初始化为50.

	widthSegments = Math.max( 3, Math.floor( widthSegments ) || 8 );	//球体宽度细分线段数,应该是经线吧,默认初始化为8
	heightSegments = Math.max( 2, Math.floor( heightSegments ) || 6 );	//球体高度细分线段数,应该是纬线吧,默认初始化为6

	phiStart = phiStart !== undefined ? phiStart : 0;	  	//球体赤道线的起始点弧度,默认初始化为0
	phiLength = phiLength !== undefined ? phiLength : Math.PI * 2;	//球体赤道线的弧长,默认初始化为2倍的PI,360度

	thetaStart = thetaStart !== undefined ? thetaStart : 0;	 	//球体经线起始点弧度,默认初始化为0
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI; 	//球体经线弧长,默认初始化为PI,180度.

	var x, y, vertices = [], uvs = [];
	//计算顶点数据,压入vertices数组.
	for ( y = 0; y <= heightSegments; y ++ ) {

		var verticesRow = [];
		var uvsRow = [];

		for ( x = 0; x <= widthSegments; x ++ ) {

			var u = x / widthSegments;
			var v = y / heightSegments;

			var vertex = new THREE.Vector3();
			vertex.x = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
			vertex.y = radius * Math.cos( thetaStart + v * thetaLength );
			vertex.z = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

			this.vertices.push( vertex );

			verticesRow.push( this.vertices.length - 1 );
			uvsRow.push( new THREE.Vector2( u, 1 - v ) );

		}

		vertices.push( verticesRow );
		uvs.push( uvsRow );

	}
	//计算三角面,以及贴图uv.
	for ( y = 0; y < heightSegments; y ++ ) {

		for ( x = 0; x < widthSegments; x ++ ) {

			var v1 = vertices[ y ][ x + 1 ];
			var v2 = vertices[ y ][ x ];
			var v3 = vertices[ y + 1 ][ x ];
			var v4 = vertices[ y + 1 ][ x + 1 ];

			var n1 = this.vertices[ v1 ].clone().normalize();
			var n2 = this.vertices[ v2 ].clone().normalize();
			var n3 = this.vertices[ v3 ].clone().normalize();
			var n4 = this.vertices[ v4 ].clone().normalize();

			var uv1 = uvs[ y ][ x + 1 ].clone();
			var uv2 = uvs[ y ][ x ].clone();
			var uv3 = uvs[ y + 1 ][ x ].clone();
			var uv4 = uvs[ y + 1 ][ x + 1 ].clone();

			if ( Math.abs( this.vertices[ v1 ].y ) === radius ) {

				uv1.x = ( uv1.x + uv2.x ) / 2;
				this.faces.push( new THREE.Face3( v1, v3, v4, [ n1, n3, n4 ] ) );
				this.faceVertexUvs[ 0 ].push( [ uv1, uv3, uv4 ] );

			} else if ( Math.abs( this.vertices[ v3 ].y ) === radius ) {

				uv3.x = ( uv3.x + uv4.x ) / 2;
				this.faces.push( new THREE.Face3( v1, v2, v3, [ n1, n2, n3 ] ) );
				this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );

			} else {

				this.faces.push( new THREE.Face3( v1, v2, v4, [ n1, n2, n4 ] ) );
				this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv4 ] );

				this.faces.push( new THREE.Face3( v2, v3, v4, [ n2.clone(), n3, n4.clone() ] ) );
				this.faceVertexUvs[ 0 ].push( [ uv2.clone(), uv3, uv4.clone() ] );

			}

		}

	}

	this.computeFaceNormals();	//计算面的法线.

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );	//计算球体边界.

};
/*************************************************
****下面是SphereGeometry对象的方法属性定义,继承自Geometry对象.
**************************************************/
THREE.SphereGeometry.prototype = Object.create( THREE.Geometry.prototype );
