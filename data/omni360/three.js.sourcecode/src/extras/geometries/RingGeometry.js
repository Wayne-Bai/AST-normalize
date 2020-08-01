/**
 * @author Kaleb Murphy
 */
/*
///RingGeometry用来在三维空间内创建一个二维圆环面对象.
///
///	用法: var geometry = new THREE.RingGeometry(1,5,32);	
/// 	  var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
/// 	  var Ring = new THREE.Mesh(geometry,material);
/// 	  scene.add(Ring);
*/
///<summary>TorusGeometry</summary>
///<param name ="innerRadius" type="float">圆环面内圆半径,默认初始化为0</param>
///<param name ="outerRadius" type="float">圆环面外圆半径,默认初始化为50</param>
///<param name ="thetaSegments" type="int">圆环面圆周上的细分线段数,代表了圆环的圆度,最低的是3。默认值是8</param>
///<param name ="phiSegments" type="int">圆环面内圆到外圆方向上的细分线段数,最低的是1。默认值是8</param>
///<param name ="thetaStart" type="float">圆环面的起始角度,默认初始化为0</param>
///<param name ="thetaLength" type="float">圆环面圆周弧长,默认初始化为Math.PI * 2</param>
THREE.RingGeometry = function ( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

	THREE.Geometry.call( this );	//调用Geometry对象的call方法,将原本属于Geometry的方法交给当前对象RingGeometry来使用.

	innerRadius = innerRadius || 0;	//圆环面内圆半径,默认初始化为0
	outerRadius = outerRadius || 50;	//圆环面外圆半径,默认初始化为50

	thetaStart = thetaStart !== undefined ? thetaStart : 0;	//圆环面的起始角度,默认初始化为0
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;	//圆环面圆周弧长,默认初始化为Math.PI * 2

	thetaSegments = thetaSegments !== undefined ? Math.max( 3, thetaSegments ) : 8;	//圆环面圆周上的细分线段数,代表了圆环的圆度,最低的是3。默认值是8
	phiSegments = phiSegments !== undefined ? Math.max( 1, phiSegments ) : 8;	//圆环面内圆到外圆方向上的细分线段数,最低的是1。默认值是8

	var i, o, uvs = [], radius = innerRadius, radiusStep = ( ( outerRadius - innerRadius ) / phiSegments );
	//计算顶点数据,压入vertices数组.
	for ( i = 0; i < phiSegments + 1; i ++ ) { // concentric circles inside ring

		for ( o = 0; o < thetaSegments + 1; o ++ ) { // number of segments per circle 圆周上的分段数

			var vertex = new THREE.Vector3();
			var segment = thetaStart + o / thetaSegments * thetaLength;
			vertex.x = radius * Math.cos( segment );
			vertex.y = radius * Math.sin( segment );

			this.vertices.push( vertex );
			uvs.push( new THREE.Vector2( ( vertex.x / outerRadius + 1 ) / 2, ( vertex.y / outerRadius + 1 ) / 2 ) );
		}

		radius += radiusStep;

	}

	var n = new THREE.Vector3( 0, 0, 1 );
	//计算三角面,以及贴图uv.
	for ( i = 0; i < phiSegments; i ++ ) { // concentric circles inside ring

		var thetaSegment = i * (thetaSegments + 1);

		for ( o = 0; o < thetaSegments ; o ++ ) { // number of segments per circle 圆周上的分段数

			var segment = o + thetaSegment;

			var v1 = segment;
			var v2 = segment + thetaSegments + 1;
			var v3 = segment + thetaSegments + 2;

			this.faces.push( new THREE.Face3( v1, v2, v3, [ n.clone(), n.clone(), n.clone() ] ) );
			this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ].clone(), uvs[ v2 ].clone(), uvs[ v3 ].clone() ]);

			v1 = segment;
			v2 = segment + thetaSegments + 2;
			v3 = segment + 1;

			this.faces.push( new THREE.Face3( v1, v2, v3, [ n.clone(), n.clone(), n.clone() ] ) );
			this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ].clone(), uvs[ v2 ].clone(), uvs[ v3 ].clone() ]);

		}
	}

	this.computeFaceNormals();	//计算面的法线

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );	//计算球体边界

};
/*************************************************
****下面是RingGeometry对象的方法属性定义,继承自Geometry对象.
**************************************************/
THREE.RingGeometry.prototype = Object.create( THREE.Geometry.prototype );

