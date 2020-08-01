/**
 * @author clockworkgeek / https://github.com/clockworkgeek
 * @author timothypratley / https://github.com/timothypratley
 * @author WestLangley / http://github.com/WestLangley
*/
/*
///PolyhedronGeometry用来在三维空间内创建一个多面体对象,二十面体,八面体,四面体都会调用当前对象.
///
///	用法: 
///		  var vertices = [ 1,  1,  1,   - 1, - 1,  1,   - 1,  1, - 1,    1, - 1, - 1 ];
///		  var indices = [ 2,  1,  0,    0,  3,  2,    1,  3,  0,    2,  3,  1 ];
///		  var geometry = new THREE.PolyhedronGeometry(vertices,indices,70);	
/// 	  var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
/// 	  var icos = new THREE.Mesh(geometry,material);
/// 	  scene.add(icos);
*/
///<summary>PolyhedronGeometry</summary>
///<param name ="vertices" type="float">多面体顶点数组</param>
///<param name ="indices" type="float">多面体顶点索引顺序</param>
///<param name ="radius" type="float">多面体半径,默认初始化为1</param>
///<param name ="detail" type="float">细节因子,默认为0,当超过0将会有更多的顶点,当前的几何体就不会是多面体,当参数detail大于1,将会变成一个球体.</param>
THREE.PolyhedronGeometry = function ( vertices, indices, radius, detail ) {

	THREE.Geometry.call( this );	//调用Geometry对象的call方法,将原本属于Geometry的方法交给当前对象PolyhedronGeometry来使用.

	radius = radius || 1;	//多面体半径,默认初始化为1
	detail = detail || 0;	//细节因子,默认为0,当超过0将会有更多的顶点,当前的几何体就不会是多面体,当参数detail大于1,将会变成一个球体.

	var that = this;
	//计算顶点数据,压入vertices数组.
	for ( var i = 0, l = vertices.length; i < l; i += 3 ) {

		prepare( new THREE.Vector3( vertices[ i ], vertices[ i + 1 ], vertices[ i + 2 ] ) );

	}

	var midpoints = [], p = this.vertices;

	var faces = [];
	//计算三角面.
	for ( var i = 0, j = 0, l = indices.length; i < l; i += 3, j ++ ) {

		var v1 = p[ indices[ i     ] ];
		var v2 = p[ indices[ i + 1 ] ];
		var v3 = p[ indices[ i + 2 ] ];

		faces[ j ] = new THREE.Face3( v1.index, v2.index, v3.index, [ v1.clone(), v2.clone(), v3.clone() ] );

	}

	var centroid = new THREE.Vector3();

	for ( var i = 0, l = faces.length; i < l; i ++ ) {

		subdivide( faces[ i ], detail );

	}


	// Handle case when face straddles the seam
	// 处理当面横跨缝合线的特殊情况

	for ( var i = 0, l = this.faceVertexUvs[ 0 ].length; i < l; i ++ ) {

		var uvs = this.faceVertexUvs[ 0 ][ i ];

		var x0 = uvs[ 0 ].x;
		var x1 = uvs[ 1 ].x;
		var x2 = uvs[ 2 ].x;

		var max = Math.max( x0, Math.max( x1, x2 ) );
		var min = Math.min( x0, Math.min( x1, x2 ) );

		if ( max > 0.9 && min < 0.1 ) { // 0.9 is somewhat arbitrary

			if ( x0 < 0.2 ) uvs[ 0 ].x += 1;
			if ( x1 < 0.2 ) uvs[ 1 ].x += 1;
			if ( x2 < 0.2 ) uvs[ 2 ].x += 1;

		}

	}


	// Apply radius
	// 对顶点应用位置,乘以半径值.

	for ( var i = 0, l = this.vertices.length; i < l; i ++ ) {

		this.vertices[ i ].multiplyScalar( radius );

	}


	// Merge vertices 合并顶点

	this.mergeVertices();	//去除多余的顶点

	this.computeFaceNormals();	//计算面的法线

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );	//计算球体边界

	/*
	///prepare是计算顶点位置的具体实现,将传入的向量(参数Vector3)投影到球体的表面
	*/
	///<summary>prepare</summary>
	///<param name ="radius" type="Vector3"></param>
	///<return type="Vector3">球体体半径</param>
	// Project vector onto sphere's surface
	// 投影矢量到球体的表面.
	function prepare( vector ) {

		var vertex = vector.normalize().clone();
		vertex.index = that.vertices.push( vertex ) - 1;

		// Texture coords are equivalent to map coords, calculate angle and convert to fraction of a circle.
		// 纹理坐标等于贴图uv坐标,计算角度并转换为圆的一部分.

		var u = azimuth( vector ) / 2 / Math.PI + 0.5;
		var v = inclination( vector ) / Math.PI + 0.5;
		vertex.uv = new THREE.Vector2( u, 1 - v );

		return vertex;	//返回对应的顶点

	}

	/*
	///make是细分曲面的具体实现,递归计算曲面顶点,转换为细分的三角形
	*/
	///<summary>make</summary>
	///<param name ="v1" type="Vector3">三角形的第一个顶点</param>
	///<param name ="v2" type="Vector3">三角形的第二个顶点</param>
	///<param name ="v3" type="Vector3">三角形的第三个顶点</param>
	// Approximate a curved face with recursively sub-divided triangles.
	//递归计算曲面顶点,转换为细分的三角形.
	function make( v1, v2, v3 ) {

		var face = new THREE.Face3( v1.index, v2.index, v3.index, [ v1.clone(), v2.clone(), v3.clone() ] );
		that.faces.push( face );

		centroid.copy( v1 ).add( v2 ).add( v3 ).divideScalar( 3 );

		var azi = azimuth( centroid );

		that.faceVertexUvs[ 0 ].push( [
			correctUV( v1.uv, v1, azi ),
			correctUV( v2.uv, v2, azi ),
			correctUV( v3.uv, v3, azi )
		] );

	}

	/*
	///make是细分曲面的具体实现,递归计算曲面顶点,转换为细分的三角形
	*/
	///<summary>make</summary>
	///<param name ="face" type="Face3">三角面</param>
	///<param name ="detail" type="float">细节因子,默认为0,当超过0将会有更多的顶点,当前的几何体就不会是多面体,当参数detail大于1,将会变成一个球体</param>
	// Analytically subdivide a face to the required detail level.
	//按照要求的细节因子,细分三角面.
	function subdivide( face, detail ) {

		var cols = Math.pow(2, detail);
		var cells = Math.pow(4, detail);
		var a = prepare( that.vertices[ face.a ] );
		var b = prepare( that.vertices[ face.b ] );
		var c = prepare( that.vertices[ face.c ] );
		var v = [];

		// Construct all of the vertices for this subdivision.
		// 构建所有的细分三角形顶点.

		for ( var i = 0 ; i <= cols; i ++ ) {

			v[ i ] = [];

			var aj = prepare( a.clone().lerp( c, i / cols ) );
			var bj = prepare( b.clone().lerp( c, i / cols ) );
			var rows = cols - i;

			for ( var j = 0; j <= rows; j ++) {

				if ( j == 0 && i == cols ) {

					v[ i ][ j ] = aj;

				} else {

					v[ i ][ j ] = prepare( aj.clone().lerp( bj, j / rows ) );

				}

			}

		}

		// Construct all of the faces.
		// 构建所有的三角面

		for ( var i = 0; i < cols ; i ++ ) {

			for ( var j = 0; j < 2 * (cols - i) - 1; j ++ ) {

				var k = Math.floor( j / 2 );

				if ( j % 2 == 0 ) {

					make(
						v[ i ][ k + 1],
						v[ i + 1 ][ k ],
						v[ i ][ k ]
					);

				} else {

					make(
						v[ i ][ k + 1 ],
						v[ i + 1][ k + 1],
						v[ i + 1 ][ k ]
					);

				}

			}

		}

	}


	/*
	///azimuth方法获得一个点当从上面看时,绕y轴的角度.
	*/
	///<summary>azimuth</summary>
	///<param name ="vector" type="Vector3">三维向量</param>
	// Angle around the Y axis, counter-clockwise when looking from above.
	// 当从上面看时,绕y轴的角度.
	function azimuth( vector ) {

		return Math.atan2( vector.z, - vector.x );

	}

	/*
	///inclination方法获得一个点在xz平面上的角度.
	*/
	///<summary>inclination</summary>
	///<param name ="vector" type="Vector3">三维向量</param>
	// Angle above the XZ plane.
	// 获得一个点在xz平面上的角度.
	function inclination( vector ) {

		return Math.atan2( - vector.y, Math.sqrt( ( vector.x * vector.x ) + ( vector.z * vector.z ) ) );

	}


	/*
	///inclination方法获得一个点在xz平面上的角度.
	*/
	///<summary>inclination</summary>
	///<param name ="uv" type="Vector2">二维向量</param>
	///<param name ="vector" type="Vector3">三维向量</param>
	///<param name ="azimuth" type="Vector3">一个点当从上面看时,绕y轴的角度</param>
	// Texture fixing helper. Spheres have some odd behaviours.
	// 纹理替换辅助器,因为多面体表面和球体相比有一些奇怪的棱角,这里为了让纹理更好的适配多面体表面.
	function correctUV( uv, vector, azimuth ) {

		if ( ( azimuth < 0 ) && ( uv.x === 1 ) ) uv = new THREE.Vector2( uv.x - 1, uv.y );
		if ( ( vector.x === 0 ) && ( vector.z === 0 ) ) uv = new THREE.Vector2( azimuth / 2 / Math.PI + 0.5, uv.y );
		return uv.clone();

	}


};
/*************************************************
****下面是PolyhedronGeometry对象的方法属性定义,继承自Geometry对象.
**************************************************/
THREE.PolyhedronGeometry.prototype = Object.create( THREE.Geometry.prototype );
