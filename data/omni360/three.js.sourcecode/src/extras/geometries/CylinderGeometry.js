/**
 * @author mrdoob / http://mrdoob.com/
 */
/*
///CylinderGeometry用来在三维空间内创建一个圆柱,圆锥,圆桶对象.
/// NOTE: 和CircleGeometry对象一样,如果我们把参数radialSeagments的值设置成4,是不是就变成了棱台了,设置成3,并且radiusTop设置成0,是不是就是金字塔了????
///
///	用法: var geometry = new THREE.CircleGeometry(5,5,20,32);	
/// 	  var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
/// 	  var clinder = new THREE.Mesh(geometry,material);
/// 	  scene.add(clinder);
*/
///<summary>CylinderGeometry</summary>
///<param name ="radiusTop" type="float">对象的上表面半径</param>
///<param name ="radiusBottom" type="float">对象的下表面半径</param>
///<param name ="height" type="float">对象的高度</param>
///<param name ="radialSegments" type="int">对象的半径方向的细分线段数</param>
///<param name ="heightSegments" type="int">对象的高度细分线段数</param>
///<param name ="openEnded" type="boolean">是否开口,如果设置为true,并且radiusTop参数不为0,将会是一个没有上表面,下表面的几何对象.</param>
THREE.CylinderGeometry = function ( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded ) {

	THREE.Geometry.call( this );	//调用Geometry对象的call方法,将原本属于Geometry的方法交给当前对象CylinderGeometry来使用.

	this.parameters = {
		radiusTop: radiusTop,	//对象的上表面半径
		radiusBottom: radiusBottom,		//对象的下表面半径
		height: height,					//对象的高度
		radialSegments: radialSegments,	//对象的半径方向的细分线段数
		heightSegments: heightSegments,	//对象的高度细分线段数
		openEnded: openEnded			//是否开口,如果设置为true,并且radiusTop参数不为0,将会是一个没有上表面,下表面的几何对象.
	};

	radiusTop = radiusTop !== undefined ? radiusTop : 20;	//对象的上表面半径,如果未设置,默认为20
	radiusBottom = radiusBottom !== undefined ? radiusBottom : 20;	//对象的下表面半径,如果未设置,默认为20
	height = height !== undefined ? height : 100;	//对象的高度,如果未设置,默认为20

	radialSegments = radialSegments || 8;	//对象的半径方向的细分线段数,如果未设置,默认为20
	heightSegments = heightSegments || 1;	//对象的高度细分线段数,如果未设置,默认为20

	openEnded = openEnded !== undefined ? openEnded : false;	//是否开口,如果设置为true,并且radiusTop参数不为0,将会是一个没有上表面,下表面的几何对象.默认为false

	var heightHalf = height / 2;

	var x, y, vertices = [], uvs = [];

	for ( y = 0; y <= heightSegments; y ++ ) {	//根据高度细分线段数,遍历计算顶点坐标和排列uv.

		var verticesRow = [];
		var uvsRow = [];

		var v = y / heightSegments;
		var radius = v * ( radiusBottom - radiusTop ) + radiusTop;

		for ( x = 0; x <= radialSegments; x ++ ) {

			var u = x / radialSegments;
			//计算顶点的x,y,z坐标,记住下边的公式,这个公式很常用,极坐标转为直角坐标.就是他.
			var vertex = new THREE.Vector3();
			vertex.x = radius * Math.sin( u * Math.PI * 2 );	//
			vertex.y = - v * height + heightHalf;
			vertex.z = radius * Math.cos( u * Math.PI * 2 );

			this.vertices.push( vertex );

			verticesRow.push( this.vertices.length - 1 );
			uvsRow.push( new THREE.Vector2( u, 1 - v ) );

		}

		vertices.push( verticesRow );
		uvs.push( uvsRow );

	}
	//上面是圆柱的一列顶点数据,下边是将这一列顶点复制一圈.
	var tanTheta = ( radiusBottom - radiusTop ) / height;
	var na, nb;

	for ( x = 0; x < radialSegments; x ++ ) {

		if ( radiusTop !== 0 ) {

			na = this.vertices[ vertices[ 0 ][ x ] ].clone();
			nb = this.vertices[ vertices[ 0 ][ x + 1 ] ].clone();

		} else {

			na = this.vertices[ vertices[ 1 ][ x ] ].clone();
			nb = this.vertices[ vertices[ 1 ][ x + 1 ] ].clone();

		}

		na.setY( Math.sqrt( na.x * na.x + na.z * na.z ) * tanTheta ).normalize();
		nb.setY( Math.sqrt( nb.x * nb.x + nb.z * nb.z ) * tanTheta ).normalize();

		for ( y = 0; y < heightSegments; y ++ ) {

			var v1 = vertices[ y ][ x ];
			var v2 = vertices[ y + 1 ][ x ];
			var v3 = vertices[ y + 1 ][ x + 1 ];
			var v4 = vertices[ y ][ x + 1 ];

			var n1 = na.clone();
			var n2 = na.clone();
			var n3 = nb.clone();
			var n4 = nb.clone();

			var uv1 = uvs[ y ][ x ].clone();
			var uv2 = uvs[ y + 1 ][ x ].clone();
			var uv3 = uvs[ y + 1 ][ x + 1 ].clone();
			var uv4 = uvs[ y ][ x + 1 ].clone();

			this.faces.push( new THREE.Face3( v1, v2, v4, [ n1, n2, n4 ] ) );	//计算三角面索引
			this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv4 ] );					//计算uvs纹理贴图坐标索引.

			this.faces.push( new THREE.Face3( v2, v3, v4, [ n2.clone(), n3, n4.clone() ] ) );
			this.faceVertexUvs[ 0 ].push( [ uv2.clone(), uv3, uv4.clone() ] );

		}

	}

	// top cap
	//上表面
	if ( openEnded === false && radiusTop > 0 ) {

		this.vertices.push( new THREE.Vector3( 0, heightHalf, 0 ) );

		for ( x = 0; x < radialSegments; x ++ ) {

			var v1 = vertices[ 0 ][ x ];
			var v2 = vertices[ 0 ][ x + 1 ];
			var v3 = this.vertices.length - 1;

			var n1 = new THREE.Vector3( 0, 1, 0 );
			var n2 = new THREE.Vector3( 0, 1, 0 );
			var n3 = new THREE.Vector3( 0, 1, 0 );

			var uv1 = uvs[ 0 ][ x ].clone();
			var uv2 = uvs[ 0 ][ x + 1 ].clone();
			var uv3 = new THREE.Vector2( uv2.x, 0 );

			this.faces.push( new THREE.Face3( v1, v2, v3, [ n1, n2, n3 ] ) );
			this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );

		}

	}

	// bottom cap
	//下表面
	if ( openEnded === false && radiusBottom > 0 ) {

		this.vertices.push( new THREE.Vector3( 0, - heightHalf, 0 ) );

		for ( x = 0; x < radialSegments; x ++ ) {

			var v1 = vertices[ y ][ x + 1 ];
			var v2 = vertices[ y ][ x ];
			var v3 = this.vertices.length - 1;

			var n1 = new THREE.Vector3( 0, - 1, 0 );
			var n2 = new THREE.Vector3( 0, - 1, 0 );
			var n3 = new THREE.Vector3( 0, - 1, 0 );

			var uv1 = uvs[ y ][ x + 1 ].clone();
			var uv2 = uvs[ y ][ x ].clone();
			var uv3 = new THREE.Vector2( uv2.x, 1 );

			this.faces.push( new THREE.Face3( v1, v2, v3, [ n1, n2, n3 ] ) );
			this.faceVertexUvs[ 0 ].push( [ uv1, uv2, uv3 ] );

		}

	}

	this.computeFaceNormals();	//计算面的法线.

}
/*************************************************
****下面是CylinderGeometry对象的方法属性定义,继承自Geometry对象.
**************************************************/
THREE.CylinderGeometry.prototype = Object.create( THREE.Geometry.prototype );
