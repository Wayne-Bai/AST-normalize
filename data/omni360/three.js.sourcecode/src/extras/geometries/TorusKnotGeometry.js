/**
 * @author oosmoxiecode
 * based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3D/src/away3d/primitives/TorusKnot.as?spec=svn2473&r=2473
 */
/*
///TorusKnotGeometryy用来在三维空间内创建一个圆环结或者环形结对象.是由圆环体通过打结构成的扩展三维几何体，常用于制作管状,缠绕.带囊肿类的造型.
/// 关于环形结的几何特征,参考:http://en.wikipedia.org/wiki/Torus_knot
/// 各种漂亮的demo:http://katlas.math.toronto.edu/wiki/36_Torus_Knots
///
///	用法: var geometry = new THREE.TorusKnotGeometry(5,32,32);	
/// 	  var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
/// 	  var sphere = new THREE.Mesh(geometry,material);
/// 	  scene.add(sphere);
*/
///<summary>TorusKnotGeometry</summary>
///<param name ="radius" type="float">环形结半径</param>
///<param name ="tube" type="float">环形结弯管半径</param>
///<param name ="radialSegments" type="int">环形结圆周上细分线段数</param>
///<param name ="tubularSegments" type="int">环形结弯管圆周上的细分线段数</param>
///<param name ="p" type="float">p\Q:对knot(节)状方式有效,控制曲线路径缠绕的圈数,P决定垂直方向的参数.</param>
///<param name ="q" type="float">p\Q:对knot(节)状方式有效,控制曲线路径缠绕的圈数,Q决定水平方向的参数.</param>
///<param name ="heightScale" type="float">环形结高方向上的缩放.默认值是1</param>
THREE.TorusKnotGeometry = function ( radius, tube, radialSegments, tubularSegments, p, q, heightScale ) {

	THREE.Geometry.call( this );	//调用Geometry对象的call方法,将原本属于Geometry的方法交给当前对象TorusKnotGeometry来使用.

	this.parameters = {
		radius: radius,	//环形结半径
		tube: tube,	//环形结弯管半径
		radialSegments: radialSegments,	//环形结圆周上细分线段数
		tubularSegments: tubularSegments,	//环形结弯管圆周上的细分线段数
		p: p,	//p\Q:对knot(节)状方式有效,控制曲线路径缠绕的圈数,P决定垂直方向的参数.
		q: q,	//p\Q:对knot(节)状方式有效,控制曲线路径缠绕的圈数,Q决定水平方向的参数.
		heightScale: heightScale	//环形结高方向上的缩放.默认值是1
	};

	radius = radius || 100;	//环形结半径,默认初始化为100
	tube = tube || 40;	//环形结弯管半径,默认初始化为40
	radialSegments = radialSegments || 64;	//环形结圆周上细分线段数,默认初始化为64
	tubularSegments = tubularSegments || 8;	//环形结弯管圆周上的细分线段数,默认初始化为8
	p = p || 2;	//p\Q:对knot(节)状方式有效,控制曲线路径缠绕的圈数,P决定垂直方向的参数.默认初始化为2
	q = q || 3;	//p\Q:对knot(节)状方式有效,控制曲线路径缠绕的圈数,Q决定水平方向的参数.默认初始化为3
	heightScale = heightScale || 1;	//环形结高方向上的缩放.默认值是1
	
	var grid = new Array( radialSegments );
	var tang = new THREE.Vector3();
	var n = new THREE.Vector3();
	var bitan = new THREE.Vector3();
	//计算顶点数据,压入vertices数组
	for ( var i = 0; i < radialSegments; ++ i ) {

		grid[ i ] = new Array( tubularSegments );
		var u = i / radialSegments * 2 * p * Math.PI;
		var p1 = getPos( u, q, p, radius, heightScale );
		var p2 = getPos( u + 0.01, q, p, radius, heightScale );
		tang.subVectors( p2, p1 );
		n.addVectors( p2, p1 );

		bitan.crossVectors( tang, n );
		n.crossVectors( bitan, tang );
		bitan.normalize();
		n.normalize();

		for ( var j = 0; j < tubularSegments; ++ j ) {

			var v = j / tubularSegments * 2 * Math.PI;
			var cx = - tube * Math.cos( v ); // TODO: Hack: Negating it so it faces outside.
			var cy = tube * Math.sin( v );

			var pos = new THREE.Vector3();
			pos.x = p1.x + cx * n.x + cy * bitan.x;
			pos.y = p1.y + cx * n.y + cy * bitan.y;
			pos.z = p1.z + cx * n.z + cy * bitan.z;

			grid[ i ][ j ] = this.vertices.push( pos ) - 1;

		}

	}
	//计算三角面,以及贴图uv
	for ( var i = 0; i < radialSegments; ++ i ) {

		for ( var j = 0; j < tubularSegments; ++ j ) {

			var ip = ( i + 1 ) % radialSegments;
			var jp = ( j + 1 ) % tubularSegments;

			var a = grid[ i ][ j ];
			var b = grid[ ip ][ j ];
			var c = grid[ ip ][ jp ];
			var d = grid[ i ][ jp ];

			var uva = new THREE.Vector2( i / radialSegments, j / tubularSegments );
			var uvb = new THREE.Vector2( ( i + 1 ) / radialSegments, j / tubularSegments );
			var uvc = new THREE.Vector2( ( i + 1 ) / radialSegments, ( j + 1 ) / tubularSegments );
			var uvd = new THREE.Vector2( i / radialSegments, ( j + 1 ) / tubularSegments );

			this.faces.push( new THREE.Face3( a, b, d ) );
			this.faceVertexUvs[ 0 ].push( [ uva, uvb, uvd ] );

			this.faces.push( new THREE.Face3( b, c, d ) );
			this.faceVertexUvs[ 0 ].push( [ uvb.clone(), uvc, uvd.clone() ] );

		}
	}

	this.computeFaceNormals();	//计算面的法线
	this.computeVertexNormals();	//计算顶点法线
	/*
	///getPos方法,已知u,in_q,in_p,radius,heightScale,获得顶点坐标的具体实现.
	*/
	///<summary>getPos</summary>
	///<param name ="u" type="float">圆周上细分线段,当前分段占等分总长度到起点的距离.</param>
	///<param name ="in_p" type="float">p\Q:对knot(节)状方式有效,控制曲线路径缠绕的圈数,P决定垂直方向的参数.</param>
	///<param name ="in_q" type="float">p\Q:对knot(节)状方式有效,控制曲线路径缠绕的圈数,Q决定水平方向的参数.</param>
	///<param name ="radius" type="float">环形结半径</param>
	///<param name ="heightScale" type="float">环形结高方向上的缩放.</param>
	function getPos( u, in_q, in_p, radius, heightScale ) {

		var cu = Math.cos( u );
		var su = Math.sin( u );
		var quOverP = in_q / in_p * u;
		var cs = Math.cos( quOverP );

		var tx = radius * ( 2 + cs ) * 0.5 * cu;
		var ty = radius * ( 2 + cs ) * su * 0.5;
		var tz = heightScale * radius * Math.sin( quOverP ) * 0.5;

		return new THREE.Vector3( tx, ty, tz );

	}

};
/*************************************************
****下面是TorusKnotGeometry对象的方法属性定义,继承自Geometry对象.
**************************************************/
THREE.TorusKnotGeometry.prototype = Object.create( THREE.Geometry.prototype );
