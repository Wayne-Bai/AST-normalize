/**
 * @author WestLangley / https://github.com/WestLangley
 * @author zz85 / https://github.com/zz85
 * @author miningold / https://github.com/miningold
 *
 * Modified from the TorusKnotGeometry by @oosmoxiecode
 *
 * Creates a tube which extrudes along a 3d spline
 *
 * Uses parallel transport frames as described in
 * http://www.cs.indiana.edu/pub/techreports/TR425.pdf
 */
/*
///TubeGeometry用来在三维空间内创建一个弯管对象.
///
///	用法: 
///		var CustomSinCurve = THREE.Curve.create(
///		    function ( scale ) { //custom curve constructor
///		        this.scale = (scale === undefined) ? 1 : scale;
///		    },
///		    
///		    function ( t ) { //getPoint: t is between 0-1
///		        var tx = t * 3 - 1.5,
///		            ty = Math.sin( 2 * Math.PI * t ),
///		            tz = 0;
///		        
///		        return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
///		    }
///		);
///
///		var path = new CustomSinCurve( 10 );
///
///		var geometry = new THREE.TubeGeometry(
///		    path,  //path
///		    20,    //segments
///		    2,     //radius
///		    8,     //radiusSegments
///		    false  //closed
///		);
*/
///<summary>TubeGeometry</summary>
///<param name ="path" type="THREE.Path">弯管的路径</param>
///<param name ="segments" type="int">沿弯管路径上的细分线段数,默认为64</param>
///<param name ="radius" type="float">弯管的半径,默认为1</param>
///<param name ="radialSegments" type="int">弯管圆周方向上的细分线段数,默认为8</param>
///<param name ="closed" type="boolean">是否连接起始点,结束点,true为关闭.,默认为false</param>
THREE.TubeGeometry = function ( path, segments, radius, radialSegments, closed ) {

	THREE.Geometry.call( this );	//调用Geometry对象的call方法,将原本属于Geometry的方法交给当前对象TubeGeometry来使用.

	this.parameters = {
		path: path,	//弯管的路径
		segments: segments,	//沿弯管路径上的细分线段数,默认为64
		radius: radius,	//弯管的半径,默认为1
		radialSegments: radialSegments,	//弯管圆周方向上的细分线段数,默认为8
		closed: closed 	//是否开口,如果设置为true,弯管两端没有封头,默认为false
	};

	segments = segments || 64;	//沿弯管路径上的细分线段数,默认为64
	radius = radius || 1;	//弯管的半径,默认为1
	radialSegments = radialSegments || 8;	//弯管圆周方向上的细分线段数,默认为8
	closed = closed || false;	//是否连接起始点,结束点,true为关闭.,默认为false

	var grid = [];

	var scope = this,

		tangent,
		normal,
		binormal,

		numpoints = segments + 1,

		x, y, z,
		tx, ty, tz,
		u, v,

		cx, cy,
		pos, pos2 = new THREE.Vector3(),
		i, j,
		ip, jp,
		a, b, c, d,
		uva, uvb, uvc, uvd;

	var frames = new THREE.TubeGeometry.FrenetFrames( path, segments, closed ),	//调用THREE.TubeGeometry.FrenetFrames()方法,计算弗莱纳框架,得到路径的切线,法线,副法线
		tangents = frames.tangents,
		normals = frames.normals,
		binormals = frames.binormals;

	// proxy internals
	// 内部代理
	this.tangents = tangents;
	this.normals = normals;
	this.binormals = binormals;
	/*
	///vert方法将x,y,z三个分量压入圆管的顶点数组.
	*/
	///<summary>vert</summary>
	///<param name ="x" type="float">三维向量的x分量</param>
	///<param name ="y" type="float">三维向量的y分量</param>
	///<param name ="z" type="float">三维向量的z分量</param>
	function vert( x, y, z ) {

		return scope.vertices.push( new THREE.Vector3( x, y, z ) ) - 1;

	}

	// consruct the grid
	//构建网格

	for ( i = 0; i < numpoints; i ++ ) {

		grid[ i ] = [];

		u = i / ( numpoints - 1 );

		pos = path.getPointAt( u );

		tangent = tangents[ i ];
		normal = normals[ i ];
		binormal = binormals[ i ];

		for ( j = 0; j < radialSegments; j ++ ) {

			v = j / radialSegments * 2 * Math.PI;

			cx = - radius * Math.cos( v ); // TODO: Hack: Negating it so it faces outside.
			cy = radius * Math.sin( v );

			pos2.copy( pos );
			pos2.x += cx * normal.x + cy * binormal.x;
			pos2.y += cx * normal.y + cy * binormal.y;
			pos2.z += cx * normal.z + cy * binormal.z;

			grid[ i ][ j ] = vert( pos2.x, pos2.y, pos2.z );

		}
	}


	// construct the mesh
	// 构建曲面

	for ( i = 0; i < segments; i ++ ) {

		for ( j = 0; j < radialSegments; j ++ ) {

			ip = ( closed ) ? (i + 1) % segments : i + 1;
			jp = (j + 1) % radialSegments;

			a = grid[ i ][ j ];		// *** NOT NECESSARILY PLANAR ! ***
			b = grid[ ip ][ j ];
			c = grid[ ip ][ jp ];
			d = grid[ i ][ jp ];

			uva = new THREE.Vector2( i / segments, j / radialSegments );
			uvb = new THREE.Vector2( ( i + 1 ) / segments, j / radialSegments );
			uvc = new THREE.Vector2( ( i + 1 ) / segments, ( j + 1 ) / radialSegments );
			uvd = new THREE.Vector2( i / segments, ( j + 1 ) / radialSegments );

			this.faces.push( new THREE.Face3( a, b, d ) );
			this.faceVertexUvs[ 0 ].push( [ uva, uvb, uvd ] );

			this.faces.push( new THREE.Face3( b, c, d ) );
			this.faceVertexUvs[ 0 ].push( [ uvb.clone(), uvc, uvd.clone() ] );

		}
	}

	this.computeFaceNormals();	//计算面的法线
	this.computeVertexNormals();	//计算顶点的法线

};
/*************************************************
****下面是TubeGeometry对象的方法属性定义,继承自Geometry对象.
**************************************************/
THREE.TubeGeometry.prototype = Object.create( THREE.Geometry.prototype );

/*
///FrenetFrames方法计算弗莱纳框架,得到路径的切线,法线,副法线.
*/
///<summary>FrenetFrames</summary>
///<param name ="path" type="THREE.Path">弯管的路径</param>
///<param name ="segments" type="int">沿弯管路径上的细分线段数,默认为64</param>
///<param name ="closed" type="boolean">是否连接起始点,结束点,true为关闭.,默认为false</param>
// For computing of Frenet frames, exposing the tangents, normals and binormals the spline
// 计算弗莱纳框架,得到路径的切线,法线,副法线.
THREE.TubeGeometry.FrenetFrames = function ( path, segments, closed ) {

	var	tangent = new THREE.Vector3(),
		normal = new THREE.Vector3(),
		binormal = new THREE.Vector3(),

		tangents = [],
		normals = [],
		binormals = [],

		vec = new THREE.Vector3(),
		mat = new THREE.Matrix4(),

		numpoints = segments + 1,
		theta,
		epsilon = 0.0001,
		smallest,

		tx, ty, tz,
		i, u, v;


	// expose internals 
	this.tangents = tangents;
	this.normals = normals;
	this.binormals = binormals;

	// compute the tangent vectors for each segment on the path
	// 计算路径上的每条细分线段的切线向量

	for ( i = 0; i < numpoints; i ++ ) {

		u = i / ( numpoints - 1 );

		tangents[ i ] = path.getTangentAt( u );
		tangents[ i ].normalize();

	}

	initialNormal3();

	/*
	function initialNormal1(lastBinormal) {
		// fixed start binormal. Has dangers of 0 vectors
		normals[ 0 ] = new THREE.Vector3();
		binormals[ 0 ] = new THREE.Vector3();
		if (lastBinormal===undefined) lastBinormal = new THREE.Vector3( 0, 0, 1 );
		normals[ 0 ].crossVectors( lastBinormal, tangents[ 0 ] ).normalize();
		binormals[ 0 ].crossVectors( tangents[ 0 ], normals[ 0 ] ).normalize();
	}

	function initialNormal2() {

		// This uses the Frenet-Serret formula for deriving binormal
		var t2 = path.getTangentAt( epsilon );

		normals[ 0 ] = new THREE.Vector3().subVectors( t2, tangents[ 0 ] ).normalize();
		binormals[ 0 ] = new THREE.Vector3().crossVectors( tangents[ 0 ], normals[ 0 ] );

		normals[ 0 ].crossVectors( binormals[ 0 ], tangents[ 0 ] ).normalize(); // last binormal x tangent
		binormals[ 0 ].crossVectors( tangents[ 0 ], normals[ 0 ] ).normalize();

	}
	*/
	/*
	///initialNormal3方法选择初始化法线向量垂直于第一条切线向量和最小切线方向的xyz分量.
	*/
	function initialNormal3() {
		// select an initial normal vector perpenicular to the first tangent vector,
		// and in the direction of the smallest tangent xyz component
		// 选择初始化法线向量垂直于第一条切线向量和最小切线方向的xyz分量

		normals[ 0 ] = new THREE.Vector3();
		binormals[ 0 ] = new THREE.Vector3();
		smallest = Number.MAX_VALUE;
		tx = Math.abs( tangents[ 0 ].x );
		ty = Math.abs( tangents[ 0 ].y );
		tz = Math.abs( tangents[ 0 ].z );

		if ( tx <= smallest ) {
			smallest = tx;
			normal.set( 1, 0, 0 );
		}

		if ( ty <= smallest ) {
			smallest = ty;
			normal.set( 0, 1, 0 );
		}

		if ( tz <= smallest ) {
			normal.set( 0, 0, 1 );
		}

		vec.crossVectors( tangents[ 0 ], normal ).normalize();

		normals[ 0 ].crossVectors( tangents[ 0 ], vec );
		binormals[ 0 ].crossVectors( tangents[ 0 ], normals[ 0 ] );
	}


	// compute the slowly-varying normal and binormal vectors for each segment on the path
	// 为路径上的每条线段计算缓慢变换的法线和副法线.

	for ( i = 1; i < numpoints; i ++ ) {

		normals[ i ] = normals[ i-1 ].clone();

		binormals[ i ] = binormals[ i-1 ].clone();

		vec.crossVectors( tangents[ i-1 ], tangents[ i ] );

		if ( vec.length() > epsilon ) {

			vec.normalize();

			theta = Math.acos( THREE.Math.clamp( tangents[ i-1 ].dot( tangents[ i ] ), - 1, 1 ) ); // clamp for floating pt errors

			normals[ i ].applyMatrix4( mat.makeRotationAxis( vec, theta ) );

		}

		binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

	}


	// if the curve is closed, postprocess the vectors so the first and last normal vectors are the same
	// 如果曲线路经是闭合的,处理顶点数组的最后一个顶点为第一个顶点.

	if ( closed ) {

		theta = Math.acos( THREE.Math.clamp( normals[ 0 ].dot( normals[ numpoints-1 ] ), - 1, 1 ) );
		theta /= ( numpoints - 1 );

		if ( tangents[ 0 ].dot( vec.crossVectors( normals[ 0 ], normals[ numpoints-1 ] ) ) > 0 ) {

			theta = - theta;

		}

		for ( i = 1; i < numpoints; i ++ ) {

			// twist a little...
			normals[ i ].applyMatrix4( mat.makeRotationAxis( tangents[ i ], theta * i ) );
			binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

		}

	}
};
