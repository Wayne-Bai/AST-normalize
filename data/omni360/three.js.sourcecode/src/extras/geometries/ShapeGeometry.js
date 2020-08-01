/**
 * @author jonobr1 / http://jonobr1.com
 *
 * Creates a one-sided polygonal geometry from a path shape. Similar to
 * ExtrudeGeometry.
 *
 * parameters = {
 *
 *	curveSegments: <int>, // number of points on the curves. NOT USED AT THE MOMENT. 曲线上的顶点数量
 *
 *	material: <int> // material index for front and back faces 正面和背面材质索引
 *	uvGenerator: <Object> // object that provides UV generator functions UV坐标生成函数
 *
 * }
 **/

/*
///ShapeGeometry用来通过截面(参数shape)和参数选项(options)生成形状几何体.
*/
///<summary>ShapeGeometry</summary>
///<param name ="shapes" type="THREE.Shape">形状几何体截面</param>
///<param name ="options" type="Object">拉伸几何体参数选项</param>
THREE.ShapeGeometry = function ( shapes, options ) {

	THREE.Geometry.call( this );	//调用Geometry()方法创建几何体,并将Geometry对象的方法供ShapeGeometry对象使用.

	if ( shapes instanceof Array === false ) shapes = [ shapes ];

	this.addShapeList( shapes, options );	//将截面(参数shape)和参数选项,添加到shapes数组.

	this.computeFaceNormals();	//计算三角面法线

};
/*************************************************
****下面是ShapeGeometry对象的方法属性定义,继承自Geometry对象.
**************************************************/
THREE.ShapeGeometry.prototype = Object.create( THREE.Geometry.prototype );
/*
///addShapeList方法将截面(参数shape)和参数选项,添加到shapes数组.
*/
///<summary>addShapeList</summary>
///<param name ="shapes" type="THREE.ShapeArray">形状几何体截面</param>
///<param name ="options" type="Object">形状几何体参数选项</param>
/**
 * Add an array of shapes to THREE.ShapeGeometry. 为ShapeGeometry添加shapes数组.
 */
THREE.ShapeGeometry.prototype.addShapeList = function ( shapes, options ) {

	for ( var i = 0, l = shapes.length; i < l; i ++ ) {

		this.addShape( shapes[ i ], options );

	}

	return this;

};
/*
///addShape方法将截面(参数shape)和参数选项,获得构造几何体的截面.
*/
///<summary>addShape</summary>
///<param name ="shapes" type="THREE.ShapeArray">拉伸几何体截面</param>
///<param name ="options" type="Object">拉伸几何体参数选项</param>
///<returns type="Vector3Array">返回构造几何体的截面.</returns>
/**
 * Adds a shape to THREE.ShapeGeometry, based on THREE.ExtrudeGeometry.
 * 添加形状到当前对象,基于THREE.ExtrudeGeometry.
 */
THREE.ShapeGeometry.prototype.addShape = function ( shape, options ) {

	if ( options === undefined ) options = {};
	var curveSegments = options.curveSegments !== undefined ? options.curveSegments : 12;	//曲线上的顶点数量,默认为12

	var material = options.material;	//正面和背面材质属性
	var uvgen = options.UVGenerator === undefined ? THREE.ExtrudeGeometry.WorldUVGenerator : options.UVGenerator;	// 如果没有指定uv生成器,使用默认的全局uv生成器.

	//

	var i, l, hole, s;

	var shapesOffset = this.vertices.length;
	var shapePoints = shape.extractPoints( curveSegments );

	var vertices = shapePoints.shape;
	var holes = shapePoints.holes;

	var reverse = ! THREE.Shape.Utils.isClockWise( vertices );

	if ( reverse ) {

		vertices = vertices.reverse();

		// Maybe we should also check if holes are in the opposite direction, just to be safe...
		//检查镂空(孔洞)顶点的顺序.

		for ( i = 0, l = holes.length; i < l; i ++ ) {

			hole = holes[ i ];

			if ( THREE.Shape.Utils.isClockWise( hole ) ) {

				holes[ i ] = hole.reverse();

			}

		}

		reverse = false;

	}

	var faces = THREE.Shape.Utils.triangulateShape( vertices, holes );

	// Vertices

	var contour = vertices;

	for ( i = 0, l = holes.length; i < l; i ++ ) {

		hole = holes[ i ];
		vertices = vertices.concat( hole );

	}

	//

	var vert, vlen = vertices.length;
	var face, flen = faces.length;
	var cont, clen = contour.length;

	for ( i = 0; i < vlen; i ++ ) {	//遍历所有的顶点

		vert = vertices[ i ];

		this.vertices.push( new THREE.Vector3( vert.x, vert.y, 0 ) );

	}

	for ( i = 0; i < flen; i ++ ) {	//遍历三角面数组.

		face = faces[ i ];

		var a = face[ 0 ] + shapesOffset;
		var b = face[ 1 ] + shapesOffset;
		var c = face[ 2 ] + shapesOffset;

		this.faces.push( new THREE.Face3( a, b, c, null, null, material ) );
		this.faceVertexUvs[ 0 ].push( uvgen.generateBottomUV( this, shape, options, a, b, c ) );	//生成贴图uv坐标.

	}

};
