/**
 * @author hughes
 */
/*
///CircleGeometry用来在三维空间内创建一个圆形对象,因为圆形对象是由参数segments指定的一个个三角形围绕圆心拼接而成,所以也可以是多边形对象.
/// NOTE: CircleGeometry对象的妙用,通过参数thetaStart和参数thetaLength可以绘制圆弧,扇形,调整参数segments可以绘制多边形.还可以绘制圆形.
///
///	用法: var radius = 5, segments = 32;
///		  var geometry = new THREE.CircleGeometry(radius,segments);	
/// 	  var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
/// 	  var circle = new THREE.Mesh(geometry,material);
/// 	  scene.add(circle);
*/
///<summary>CircleGeometry</summary>
///<param name ="radius" type="float">圆形(多边形)对象的半径,默认初始化为50</param>
///<param name ="segments" type="int">可选参数,圆形(多边形)的线段数(边数),默认初始化为8</param>
///<param name ="thetaStart" type="int">可选参数,圆(多边形)的起始点,默认初始化为0</param>
///<param name ="thetaLength" type="int">可选参数,圆(多边形)的结束点,默认初始化为Math.PI * 2</param>
THREE.CircleGeometry = function ( radius, segments, thetaStart, thetaLength ) {

	THREE.Geometry.call( this );	//调用Geometry对象的call方法,将原本属于Geometry的方法交给当前对象CircleGeometry来使用.

	this.parameters = {
		radius: radius,	//半径 
		segments: segments,	//线段数或边数
		thetaStart: thetaStart,	//圆弧起始点
		thetaLength: thetaLength	//圆弧结束点
	};

	radius = radius || 50;	//圆形(多边形)半径,默认初始化为50.
	segments = segments !== undefined ? Math.max( 3, segments ) : 8;	///圆形或者多边形的线段数,最小为3,如果没有设置segments属性,则初始化为8.

	thetaStart = thetaStart !== undefined ? thetaStart : 0;	//圆形或者多边形的起始点,默认初始化为0.
	thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;	//圆(多边形)的结束点,默认初始化为Math.PI * 2
	// 下面这段代码为圆形(多边形)生成uv坐标,点点信息.
	var i, uvs = [],
	center = new THREE.Vector3(), centerUV = new THREE.Vector2( 0.5, 0.5 );

	this.vertices.push(center);
	uvs.push( centerUV );

	for ( i = 0; i <= segments; i ++ ) { //遍历组成圆形(多边形)的线段数或边数

		var vertex = new THREE.Vector3();
		var segment = thetaStart + i / segments * thetaLength;	//获得组成圆形(多边形)边或线段的角度

		vertex.x = radius * Math.cos( segment );	//根据半径和角度值计算出x坐标
		vertex.y = radius * Math.sin( segment );	//根据半径和角度值计算出y坐标

		this.vertices.push( vertex );	//添加到顶点数组.
		uvs.push( new THREE.Vector2( ( vertex.x / radius + 1 ) / 2, ( vertex.y / radius + 1 ) / 2 ) );	//添加uvs坐标信息

	}

	var n = new THREE.Vector3( 0, 0, 1 );

	for ( i = 1; i <= segments; i ++ ) {	//遍历组成圆形(多边形)的线段数或边数

		this.faces.push( new THREE.Face3( i, i + 1, 0, [ n.clone(), n.clone(), n.clone() ] ) );	//生成三角面的顶点索引
		this.faceVertexUvs[ 0 ].push( [ uvs[ i ].clone(), uvs[ i + 1 ].clone(), centerUV.clone() ] );	//生成与三角面的顶点索引顺序相同的三角面的uvs坐标

	}

	this.computeFaceNormals();	//计算面法线

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );	//生成圆形(多边形)对象的球形边界.

};
/*************************************************
****下面是CircleGeometry对象的方法属性定义,继承自Geometry对象.
**************************************************/
THREE.CircleGeometry.prototype = Object.create( THREE.Geometry.prototype );
