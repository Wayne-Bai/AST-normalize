
// File:src/math/Frustum.js

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author bhouston / http://exocortex.com
 */
/*
///Frustum对象的构造函数.用来在三维空间内创建一个平截头体对象.Frustum对象的功能函数采用
///定义构造的函数原型对象来实现,平截头体由6个平面对象构成.
*/
///<summary>Frustum</summary>
///<param name ="p0" type="THREE.Plane">组成平截头体的面p0</param>
///<param name ="p1" type="THREE.Plane">组成平截头体的面p1</param>
///<param name ="p2" type="THREE.Plane">组成平截头体的面p2</param>
///<param name ="p3" type="THREE.Plane">组成平截头体的面p3</param>
///<param name ="p4" type="THREE.Plane">组成平截头体的面p4</param>
///<param name ="p5" type="THREE.Plane">组成平截头体的面p5</param>
THREE.Frustum = function ( p0, p1, p2, p3, p4, p5 ) {

	this.planes = [

		( p0 !== undefined ) ? p0 : new THREE.Plane(),
		( p1 !== undefined ) ? p1 : new THREE.Plane(),
		( p2 !== undefined ) ? p2 : new THREE.Plane(),
		( p3 !== undefined ) ? p3 : new THREE.Plane(),
		( p4 !== undefined ) ? p4 : new THREE.Plane(),
		( p5 !== undefined ) ? p5 : new THREE.Plane()

	];

};

/****************************************
****下面是Frustum对象提供的功能函数.
****************************************/
THREE.Frustum.prototype = {

	constructor: THREE.Frustum,	//构造器,返回对创建此对象的Frustum函数的引用

	/*
	///set方法用来重新设置平截头体的起始点,结束点,p0, p1, p2, p3, p4, p5.并返回新的坐标值的平截头体.
	*/
	///<summary>set</summary>
	///<param name ="p0" type="THREE.Plane">组成平截头体的面p0</param>
	///<param name ="p1" type="THREE.Plane">组成平截头体的面p1</param>
	///<param name ="p2" type="THREE.Plane">组成平截头体的面p2</param>
	///<param name ="p3" type="THREE.Plane">组成平截头体的面p3</param>
	///<param name ="p4" type="THREE.Plane">组成平截头体的面p4</param>
	///<param name ="p5" type="THREE.Plane">组成平截头体的面p5</param>
	///<returns type="Frustum">返回新的平截头体</returns>
	set: function ( p0, p1, p2, p3, p4, p5 ) {

		var planes = this.planes;

		planes[ 0 ].copy( p0 );
		planes[ 1 ].copy( p1 );
		planes[ 2 ].copy( p2 );
		planes[ 3 ].copy( p3 );
		planes[ 4 ].copy( p4 );
		planes[ 5 ].copy( p5 );

		return this;		//返回新的平截头体

	},

	/*
	///copy方法用来复制组成平截头体的六个面,p0, p1, p2, p3, p4, p5.并返回新的平截头体.
	*/
	///<summary>copy</summary>
	///<param name ="frustum" type="Frustum">平截头体</param>
	///<returns type="Frustum">返回新的平截头体</returns>
	copy: function ( frustum ) {

		var planes = this.planes;

		for ( var i = 0; i < 6; i ++ ) {

			planes[ i ].copy( frustum.planes[ i ] );

		}

		return this;	//返回新的平截头体

	},

	/*
	///setFromMatrix方法通过对当前平截头体应用变换,返回新的平截头体.
	*/
	///<summary>setFromMatrix</summary>
	///<param name ="m" type="Matrix4">4x4矩阵</param>
	///<returns type="Frustum">返回新的平截头体</returns>
	setFromMatrix: function ( m ) {

		var planes = this.planes;
		var me = m.elements;
		var me0 = me[ 0 ], me1 = me[ 1 ], me2 = me[ 2 ], me3 = me[ 3 ];
		var me4 = me[ 4 ], me5 = me[ 5 ], me6 = me[ 6 ], me7 = me[ 7 ];
		var me8 = me[ 8 ], me9 = me[ 9 ], me10 = me[ 10 ], me11 = me[ 11 ];
		var me12 = me[ 12 ], me13 = me[ 13 ], me14 = me[ 14 ], me15 = me[ 15 ];

		planes[ 0 ].setComponents( me3 - me0, me7 - me4, me11 - me8, me15 - me12 ).normalize();
		planes[ 1 ].setComponents( me3 + me0, me7 + me4, me11 + me8, me15 + me12 ).normalize();
		planes[ 2 ].setComponents( me3 + me1, me7 + me5, me11 + me9, me15 + me13 ).normalize();
		planes[ 3 ].setComponents( me3 - me1, me7 - me5, me11 - me9, me15 - me13 ).normalize();
		planes[ 4 ].setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 ).normalize();
		planes[ 5 ].setComponents( me3 + me2, me7 + me6, me11 + me10, me15 + me14 ).normalize();

		return this;	//返回新的平截头体

	},

	/*
	///intersectsObject方法获取当前平截头体是否与参数object对象相交,返回true 或者 false
	*/
	///<summary>intersectsObject</summary>
	///<param name ="object" type="Object3d">3d立体对象</param>
	///<returns type="Boolean">返回true 或者 false</returns>
	intersectsObject: function () {

		var sphere = new THREE.Sphere();

		return function ( object ) {

			var geometry = object.geometry;

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			sphere.copy( geometry.boundingSphere );
			sphere.applyMatrix4( object.matrixWorld );

			return this.intersectsSphere( sphere );	//返回true 或者 false

		};

	}(),

	/*
	///intersectsSphere方法获取当前平截头体是否与参数sphere球体对象相交,返回true 或者 false
	*/
	///<summary>intersectsSphere</summary>
	///<param name ="sphere" type="Sphere">一个Sphere的球体</param>
	///<returns type="Boolean">返回true 或者 false</returns>
	intersectsSphere: function ( sphere ) {

		var planes = this.planes;
		var center = sphere.center;
		var negRadius = - sphere.radius;

		for ( var i = 0; i < 6; i ++ ) {

			var distance = planes[ i ].distanceToPoint( center );

			if ( distance < negRadius ) {

				return false;	//不相交返回false

			}

		}

		return true;	//相交返回true

	},

	/*
	///intersectsBox方法获取当前平截头体是否与参数box立方体对象相交,返回true 或者 false
	*/
	///<summary>intersectsBox</summary>
	///<param name ="box" type="Box3">立方体对象</param>
	///<returns type="Boolean">返回true 或者 false</returns>
	intersectsBox: function () {

		var p1 = new THREE.Vector3(),
			p2 = new THREE.Vector3();

		return function ( box ) {

			var planes = this.planes;

			for ( var i = 0; i < 6 ; i ++ ) {

				var plane = planes[ i ];

				p1.x = plane.normal.x > 0 ? box.min.x : box.max.x;
				p2.x = plane.normal.x > 0 ? box.max.x : box.min.x;
				p1.y = plane.normal.y > 0 ? box.min.y : box.max.y;
				p2.y = plane.normal.y > 0 ? box.max.y : box.min.y;
				p1.z = plane.normal.z > 0 ? box.min.z : box.max.z;
				p2.z = plane.normal.z > 0 ? box.max.z : box.min.z;

				var d1 = plane.distanceToPoint( p1 );
				var d2 = plane.distanceToPoint( p2 );

				// if both outside plane, no intersection
				// 如果立方体的p1,p2都与平面不想交,表示立方体和平截头体不相交.

				if ( d1 < 0 && d2 < 0 ) {

					return false;		//不相交返回false

				}
			}

			return true;	//相交返回true.
		};

	}(),


	/*
	///containsPoint方法用来获得参数point(一个Vector3的三维点坐标)是否在当前平截头体内.
	*/
	///<summary>containsPoint</summary>
	///<param name ="point" type="THREE.Vector3">一个Vector3的三维点坐标</param>
	///<returns type="Boolean">返回true 或者 false</returns>
	containsPoint: function ( point ) {

		var planes = this.planes;

		for ( var i = 0; i < 6; i ++ ) {

			if ( planes[ i ].distanceToPoint( point ) < 0 ) {

				return false;	//不在边界内,返回false

			}

		}

		return true;		//在边界内,返回true

	},

	/*clone方法
	///clone方法克隆一个平截头体对象.
	*/
	///<summary>clone</summary>
	///<returns type="Frustum">返回平截头体对象</returns>	
	clone: function () {

		return new THREE.Frustum().copy( this );	//返回平截头体对象

	}

};
