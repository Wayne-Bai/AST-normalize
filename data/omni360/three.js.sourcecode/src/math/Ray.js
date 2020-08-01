
// File:src/math/Ray.js

/**
 * @author bhouston / http://exocortex.com
 */
/*
///Ray对象的构造函数.用来创建一个三维空间里的射线对象.Ray对象的功能函数采用
///定义构造的函数原型对象来实现,ray主要是用来进行碰撞检测,在选择场景中的对象时经常会用到,判断当前鼠标是否与对象重合用来选择对象.
///
///	用法: var origin = new Vector3(1,1,1),direction = new Vector3(9,9,9); var ray = new Ray(origin,direction);
///	创建一个原点为origin,方向为direction的射线.
*/
///<summary>Ray</summary>
///<param name ="origin" type="Vector3">射线的端点,Vector3对象</param>
///<param name ="direction" type="Vector3">射线的方向,Vector3对象</param>
THREE.Ray = function ( origin, direction ) {

	this.origin = ( origin !== undefined ) ? origin : new THREE.Vector3();
	this.direction = ( direction !== undefined ) ? direction : new THREE.Vector3();

};

/****************************************
****下面是Vector3对象提供的功能函数.
****************************************/
THREE.Ray.prototype = {

	constructor: THREE.Ray,		//构造器,返回对创建此对象的Ray函数的引用

	/*
	///set方法用来重新设置射线的端点和方向(origin,direction).并返回新的射线.
	*/
	///<summary>set</summary>
	///<param name ="origin" type="Vector3">x坐标</param>
	///<param name ="direction" type="Vector3">y坐标</param>
	///<returns type="Ray">返回新的射线</returns>
	set: function ( origin, direction ) {

		this.origin.copy( origin );
		this.direction.copy( direction );

		return this;	//返回新的射线

	},

	/*
	///copy方法用来复制射线的端点,方向,origin,direction坐标值.并返回新的坐标值的射线.
	*/
	///<summary>copy</summary>
	///<param name ="ray" type="Ray">射线</param>
	///<returns type="Ray">返回新坐标值的射线</returns>
	copy: function ( ray ) {

		this.origin.copy( ray.origin );
		this.direction.copy( ray.direction );

		return this;	//返回新坐标值的射线

	},

	/*
	///at方法将返回沿当前射线方向的从端点起长度为t的点.如果传入了optionalTarget参数,将结果保存到optionalTarget中.
	/// NOTE:optionalTarget是可选参数,如果没有设置,系统自动创建一个临时Vector3对象
	*/
	///<summary>at</summary>
	///<param name ="t" type="Number">数值,到端点的长度</param>
	///<param name ="optionalTarget" type="Vector3">optionalTarget是可选参数,如果没有设置,系统自动创建一个临时Vector3对象</param>
	///<returns type="Ray">返回沿当前射线方向的从端点起长度为t的点/returns>
	at: function ( t, optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();

		return result.copy( this.direction ).multiplyScalar( t ).add( this.origin );	//将返回沿当前射线方向的从端点起长度为t的点

	},

	/*
	///recast方法将调用at(t)方法返回沿当前射线方向的从端点起长度为t的点,并将范围的点设为端点.
	*/
	///<summary>recast</summary>
	///<param name ="t" type="Number">数值,到端点的长度</param>
	///<returns type="Ray">返回新端点的射线/returns>
	recast: function () {

		var v1 = new THREE.Vector3();

		return function ( t ) {

			this.origin.copy( this.at( t, v1 ) );	//调用at(t)方法返回沿当前射线方向的从端点起长度为t的点,并将范围的点设为端点.

			return this;	//返回新端点的射线

		};

	}(),

	/*
	///closestPointToPoint方法将返回任意点point到射线上的垂足.如果传入了optionalTarget参数,将结果保存到optionalTarget中.
	/// NOTE:optionalTarget是可选参数,如果没有设置,系统自动创建一个临时Vector3对象
	/// NOTE:注意closestPointToPoint()方法定义如果垂足不在射线上,返回原点.
	*/
	///<summary>closestPointToPoint</summary>
	///<param name ="point" type="Vector3">任意点Vector3对象</param>
	///<param name ="optionalTarget" type="Vector3">optionalTarget是可选参数,如果没有设置,系统自动创建一个临时Vector3对象</param>
	///<returns type="Ray">返回任意点point到射线上的垂足/returns>
	closestPointToPoint: function ( point, optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		result.subVectors( point, this.origin );
		var directionDistance = result.dot( this.direction );	//调用dot方法返回两个向量的点积,并赋值给directionDistance.

		if ( directionDistance < 0 ) {	//如果directionDistance小于0,表示垂足不在射线上,

			return result.copy( this.origin );	//返回原点

		}

		return result.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );	//返回任意点point到射线上的垂足

	},

	/*
	///distanceToPoint方法将返回任意点到该射线的距离.
	/// NOTE:注意distanceToPoint()方法定义如果传入的参数point在端点后面,返回端点到该点的距离.
	*/
	///<summary>distanceToPoint</summary>
	///<param name ="point" type="Vector3">任意点Vector3对象</param>
	///<returns type="Number">返回任意点point到射线的距离或到射线端点的距离./returns>
	distanceToPoint: function () {

		var v1 = new THREE.Vector3();

		return function ( point ) {

			var directionDistance = v1.subVectors( point, this.origin ).dot( this.direction );	//调用dot方法返回两个向量的点积,并赋值给directionDistance.

			// point behind the ray
			// 判断端点是否在端点后面

			if ( directionDistance < 0 ) {	//如果directionDistance小于0,表示参数point在射线端点后面

				return this.origin.distanceTo( point );	//返回端点到该点的距离

			}

			v1.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );	//如果参数point在射线端点前面,

			return v1.distanceTo( point );	//返回该点到射线的距离,即到垂足的距离.

		};

	}(),

	/*
	///distanceSqToSegment方法将返回有参数v0,v1组成的线段到当前射线的最小距离.可选参数optionalPointOnRay, optionalPointOnSegment,分别用来存储在射线上和在线段上的垂足.
	*/
	///<summary>distanceToPoint</summary>
	///<param name ="v0" type="Vector3">任意点Vector3对象</param>
	///<param name ="v1" type="Vector3">任意点Vector3对象</param>
	///<param name ="optionalPointOnRay" type="Vector3">optionalPointOnRay是可选参数,如果没有设置,系统自动创建一个临时Vector3对象,用来存储在射线上的垂足</param>
	///<param name ="optionalPointOnSegment" type="Vector3">optionalPointOnSegment是可选参数,如果没有设置,系统自动创建一个临时Vector3对象,用来存储在线段上的垂足</param>
	///<returns type="Number">返回任意点point到射线的距离或到射线端点的距离./returns>
	distanceSqToSegment: function ( v0, v1, optionalPointOnRay, optionalPointOnSegment ) {

		// from http://www.geometrictools.com/LibMathematics/Distance/Wm5DistRay3Segment3.cpp
		// It returns the min distance between the ray and the segment
		// distanceSqToSegment()方法返回线段到当前射线的最小距离
		// defined by v0 and v1
		// 线段由v0,v1构成
		// It can also set two optional targets :
		// 可一传递两个可选参数optionalPointOnRay, optionalPointOnSegment
		// - The closest point on the ray
		// 参数optionalPointOnRay用来存储在射线上的垂足
		// - The closest point on the segment
		// 参数optionalPointOnSegment用来存储在线段上的垂足

		var segCenter = v0.clone().add( v1 ).multiplyScalar( 0.5 );	//获得线段的中点
		var segDir = v1.clone().sub( v0 ).normalize();	//获得线段的单位向量,
		var segExtent = v0.distanceTo( v1 ) * 0.5;	//线段的长度的一半?
		var diff = this.origin.clone().sub( segCenter );	//
		var a01 = - this.direction.dot( segDir );
		var b0 = diff.dot( this.direction );
		var b1 = - diff.dot( segDir );
		var c = diff.lengthSq();
		var det = Math.abs( 1 - a01 * a01 );
		var s0, s1, sqrDist, extDet;

		if ( det >= 0 ) {

			// The ray and segment are not parallel.
			// 线段和射线不平行

			s0 = a01 * b1 - b0;
			s1 = a01 * b0 - b1;
			extDet = segExtent * det;

			if ( s0 >= 0 ) {

				if ( s1 >= - extDet ) {

					if ( s1 <= extDet ) {

						// region 0
						// Minimum at interior points of ray and segment.

						var invDet = 1 / det;
						s0 *= invDet;
						s1 *= invDet;
						sqrDist = s0 * ( s0 + a01 * s1 + 2 * b0 ) + s1 * ( a01 * s0 + s1 + 2 * b1 ) + c;

					} else {

						// region 1

						s1 = segExtent;
						s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
						sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

					}

				} else {

					// region 5

					s1 = - segExtent;
					s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				}

			} else {

				if ( s1 <= - extDet ) {

					// region 4

					s0 = Math.max( 0, - ( - a01 * segExtent + b0 ) );
					s1 = ( s0 > 0 ) ? - segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				} else if ( s1 <= extDet ) {

					// region 3

					s0 = 0;
					s1 = Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = s1 * ( s1 + 2 * b1 ) + c;

				} else {

					// region 2

					s0 = Math.max( 0, - ( a01 * segExtent + b0 ) );
					s1 = ( s0 > 0 ) ? segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				}

			}

		} else {

			// Ray and segment are parallel.
			// 线段和射线平行

			s1 = ( a01 > 0 ) ? - segExtent : segExtent;
			s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
			sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

		}

		if ( optionalPointOnRay ) {

			optionalPointOnRay.copy( this.direction.clone().multiplyScalar( s0 ).add( this.origin ) );

		}

		if ( optionalPointOnSegment ) {

			optionalPointOnSegment.copy( segDir.clone().multiplyScalar( s1 ).add( segCenter ) );

		}

		return sqrDist;	//返回最小长度.

	},

	/*
	///isIntersectionSphere方法用来判断当前射线是否与参数sphere球体相交相交.
	/// NOTE:isIntersectionSphere方法要求Sphere球体对象,必须有radius和center属性,sphereGeometry无效
	*/
	///<summary>isIntersectionSphere</summary>
	///<param name ="sphere" type="Sphere">Sphere球体对象,必须有radius和center属性,sphereGeometry无效</param>
	///<returns type="Boolean">返回true 或者 false</returns>
	isIntersectionSphere: function ( sphere ) {

		return this.distanceToPoint( sphere.center ) <= sphere.radius;	//返回true 或者 false

	},

	/*
	///intersectSphere方法用来判断当前射线是否与参数sphere球体相交,如果相交返回交点.如果不想交返回null
	/// NOTE:intersectSphere方法要求Sphere球体对象,必须有radius和center属性,sphereGeometry无效
	/// NOTE:intersectSphere方法经常用在鼠标拾取球体
	*/
	///<summary>intersectSphere</summary>
	///<param name ="sphere" type="Sphere">Sphere球体对象,必须有radius和center属性,sphereGeometry无效</param>
	///<param name ="optionalTarget" type="Vector3">optionalTarget是可选参数,如果没有设置,系统自动创建一个临时Vector3对象,用来存储射线与球体的交点</param>
	///<returns type="Boolean">如果相交返回交点.如果不想交返回null</returns>
	intersectSphere: function () {

		// from http://www.scratchapixel.com/lessons/3d-basic-lessons/lesson-7-intersecting-simple-shapes/ray-sphere-intersection/

		var v1 = new THREE.Vector3();	

		return function ( sphere, optionalTarget ) {

			v1.subVectors( sphere.center, this.origin );

			var tca = v1.dot( this.direction );

			var d2 = v1.dot( v1 ) - tca * tca;

			var radius2 = sphere.radius * sphere.radius;

			if ( d2 > radius2 ) return null;	//如果不相交返回null

			var thc = Math.sqrt( radius2 - d2 );

			// t0 = first intersect point - entrance on front of sphere 
			// t0射线与球体的第一个交点,从球体的前面进入
			var t0 = tca - thc;

			// t1 = second intersect point - exit point on back of sphere
			// t1射线与球体的第二个交点,从球体的背面射出
			var t1 = tca + thc;

			// test to see if both t0 and t1 are behind the ray - if so, return null
			// 如果t0,t1都小于0,说明球体在射线端点的后面,返回null.
			if ( t0 < 0 && t1 < 0 ) return null;

			// test to see if t0 is behind the ray:
			// 如果t0射线与球体的第一个交点在射线端点的后面,
			// if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
			// 说明射线端点在球体的内部,所以返回射线与球体表面的交点是t1,从球体的背面射出的交点.
			// in order to always return an intersect point that is in front of the ray.
			// 一般情况下总是返回一个交点,这里返回的是从球体的背面射出的交点.
			if ( t0 < 0 ) return this.at( t1, optionalTarget );

			// else t0 is in front of the ray, so return the first collision point scaled by t0 
			// 另一种情况,球体在射线的前面,返回t0,射线从球体体正面射入的交点.
			return this.at( t0, optionalTarget );

		}

	}(),

	/*
	///isIntersectionPlane方法用来判断当前射线是否与参数Plane平面相交,经常用来判断用户是否选中了场景中的平面.
	/// NOTE:isIntersectionPlane方法要求Plane平面对象,必须有normal属性
	*/
	///<summary>isIntersectionPlane</summary>
	///<param name ="plane" type="Plane">Plane平面对象,必须有normal属性</param>
	///<returns type="Boolean">返回true 或者 false</returns>
	isIntersectionPlane: function ( plane ) {

		// check if the ray lies on the plane first
		// 检查射线原点是否在Plane平面上,

		var distToPoint = plane.distanceToPoint( this.origin );	//获得平面到射线原点(就是鼠标所在位置)的距离

		if ( distToPoint === 0 ) {	//如果在平面上

			return true;	//返回true

		}

		var denominator = plane.normal.dot( this.direction );	//调用normal.dot方法获得射线到平面法线的单位向量,并赋值给denominator

		if ( denominator * distToPoint < 0 ) {	//原点到平面的距离乘以单位向量小于0,说明平面在射线的前面.

			return true;	//返回true

		}

		// ray origin is behind the plane (and is pointing behind it)
		// 射线原点在Plane平面的后面,

		return false;	//返回false

	},

	/*
	///distanceToPlane方法将返回参数plane平面到当前射线的最小距离.
	/// NOTE:distanceToPlane方法要求Plane平面对象,必须有normal属性
	*/
	///<summary>distanceToPlane</summary>
	///<param name ="plane" type="Plane">Plane平面对象,必须有normal属性</param>
	///<returns type="Number">返回任意点point到射线的距离或到射线端点的距离t,如果射线在当前平面上返回0.射线与平面永不相交或其他未知定义返回null</returns>
	distanceToPlane: function ( plane ) {

		var denominator = plane.normal.dot( this.direction );
		if ( denominator == 0 ) {

			// line is coplanar, return origin
			// 射线和平面共面,返回原点0.
			if ( plane.distanceToPoint( this.origin ) == 0 ) {

				return 0;	//如果射线在当前平面上返回0

			}

			// Null is preferable to undefined since undefined means.... it is undefined
			// 其他未知定义返回null

			return null;	//其他未知定义返回null

		}

		var t = - ( this.origin.dot( plane.normal ) + plane.constant ) / denominator;

		// Return if the ray never intersects the plane
		// 射线与平面永不相交返回null

		return t >= 0 ? t :  null;	//射线与平面永不相交返回null,或者返回距离t

	},

	/*
	///intersectPlane方法用来判断当前射线是否与参数plane平面相交,如果相交返回交点.如果不想交返回null
	/// NOTE:intersectSphere方法要求plane平面对象,必须有normal属性
	/// NOTE:intersectSphere方法经常用在鼠标拾取plane平面
	*/
	///<summary>intersectPlane</summary>
	///<param name ="plane" type="Plane">Plane平面对象,必须有normal属性</param>
	///<param name ="optionalTarget" type="Vector3">optionalTarget是可选参数,如果没有设置,系统自动创建一个临时Vector3对象,用来存储射线与平面的交点</param>
	///<returns type="Boolean">如果相交返回交点.如果射线与平面永不相交或其他未知定义返回null</returns>
	intersectPlane: function ( plane, optionalTarget ) {

		var t = this.distanceToPlane( plane );	//调用distanceToPlane方法将返回参数plane平面到当前射线的最小距离

		if ( t === null ) {	//如果射线与平面永不相交或其他未知定义返回null

			return null;	//返回null
		}

		return this.at( t, optionalTarget );	//如果相交返回交点

	},

	/*
	///isIntersectionBox方法用来判断当前射线是否与参数Box立方体相交,经常用来判断用户是否选中了场景中的Box立方体对象.
	/// NOTE:isIntersectionPlane方法要求Box立方体对象,必须有min,max属性
	*/
	///<summary>isIntersectionBox</summary>
	///<param name ="box" type="Box3">Box立方体对象,必须有min,max属性</param>
	///<returns type="Boolean">返回true 或者 false</returns>
	isIntersectionBox: function () {

		var v = new THREE.Vector3();

		return function ( box ) {

			return this.intersectBox( box, v ) !== null; 	//调用intersectBox()方法,判断是否不等于null,返回true 或者 false

		};

	}(),

	/*
	///intersectBox方法用来判断当前射线是否与参数Box立方体相交,如果相交返回交点.如果不想交返回null
	/// NOTE:intersectBox方法要求Box立方体对象,必须有min,max属性
	/// NOTE:intersectBox方法经常用在鼠标拾取Box立方体
	*/
	///<summary>intersectBox</summary>
	///<param name ="box" type="Box3">Box立方体对象,必须有min,max属性</param>
	///<param name ="optionalTarget" type="Vector3">optionalTarget是可选参数,如果没有设置,系统自动创建一个临时Vector3对象,用来存储射线与立方体的交点</param>
	///<returns type="Boolean">如果相交返回交点.如果射线与Box立方体永不相交或其他未知定义返回null</returns>
	intersectBox: function ( box , optionalTarget ) {

		// http://www.scratchapixel.com/lessons/3d-basic-lessons/lesson-7-intersecting-simple-shapes/ray-box-intersection/

		var tmin,tmax,tymin,tymax,tzmin,tzmax;

		var invdirx = 1 / this.direction.x,
			invdiry = 1 / this.direction.y,
			invdirz = 1 / this.direction.z;

		var origin = this.origin;
		//下面的这些是判断射线的原点在立方体的前后左右,还是立方体内,还是永不相交.如果射线原点在立方体后面或者不相交,返回null
		if ( invdirx >= 0 ) {

			tmin = ( box.min.x - origin.x ) * invdirx;
			tmax = ( box.max.x - origin.x ) * invdirx;

		} else {

			tmin = ( box.max.x - origin.x ) * invdirx;
			tmax = ( box.min.x - origin.x ) * invdirx;
		}

		if ( invdiry >= 0 ) {

			tymin = ( box.min.y - origin.y ) * invdiry;
			tymax = ( box.max.y - origin.y ) * invdiry;

		} else {

			tymin = ( box.max.y - origin.y ) * invdiry;
			tymax = ( box.min.y - origin.y ) * invdiry;
		}

		if ( ( tmin > tymax ) || ( tymin > tmax ) ) return null;

		// These lines also handle the case where tmin or tmax is NaN
		// (result of 0 * Infinity). x !== x returns true if x is NaN

		if ( tymin > tmin || tmin !== tmin ) tmin = tymin;

		if ( tymax < tmax || tmax !== tmax ) tmax = tymax;

		if ( invdirz >= 0 ) {

			tzmin = ( box.min.z - origin.z ) * invdirz;
			tzmax = ( box.max.z - origin.z ) * invdirz;

		} else {

			tzmin = ( box.max.z - origin.z ) * invdirz;
			tzmax = ( box.min.z - origin.z ) * invdirz;
		}

		if ( ( tmin > tzmax ) || ( tzmin > tmax ) ) return null;

		if ( tzmin > tmin || tmin !== tmin ) tmin = tzmin;

		if ( tzmax < tmax || tmax !== tmax ) tmax = tzmax;

		//return point closest to the ray (positive side)
		//返回射线到立方体的垂足(正面的).

		if ( tmax < 0 ) return null;

		return this.at( tmin >= 0 ? tmin : tmax, optionalTarget );	//返回交点并设置给可选参数optionalTarget

	},

	/*
	///intersectTriangle方法用来判断当前射线是否与参数a,b,c组成的Triangle三角形对象相交,如果相交返回交点.如果不想交返回null
	/// NOTE:intersectTriangle方法要求Box立方体对象,必须有min,max属性
	/// NOTE:intersectTriangle方法经常用在鼠标拾取Triangle三角形
	/// NOTE:可以参考博客http://www.cnblogs.com/graphics/archive/2010/08/09/1795348.html
	*/
	///<summary>intersectTriangle</summary>
	///<param name ="a" type="Vector3">Triangle三角形的角点a</param>
	///<param name ="b" type="Vector3">Triangle三角形的角点b</param>
	///<param name ="c" type="Vector3">Triangle三角形的角点c</param>
	///<param name ="backfaceCulling" type="Boolean">true 或者 false,用来表示是否选择背面</param>
	///<param name ="optionalTarget" type="Vector3">optionalTarget是可选参数,如果没有设置,系统自动创建一个临时Vector3对象,用来存储射线与立方体的交点</param>
	///<returns type="Boolean">如果相交返回交点.如果射线与Triangle三角形永不相交或其他未知定义返回null</returns>
	intersectTriangle: function () {

		// Compute the offset origin, edges, and normal.
		var diff = new THREE.Vector3();
		var edge1 = new THREE.Vector3();
		var edge2 = new THREE.Vector3();
		var normal = new THREE.Vector3();

		return function ( a, b, c, backfaceCulling, optionalTarget ) {

			// from http://www.geometrictools.com/LibMathematics/Intersection/Wm5IntrRay3Triangle3.cpp

			edge1.subVectors( b, a );
			edge2.subVectors( c, a );
			normal.crossVectors( edge1, edge2 );

			// Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
			// E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
			//   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
			//   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
			//   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
			var DdN = this.direction.dot( normal );
			var sign;

			//下面的这些是判断射线的原点在Triangle三角形的前后左右,还是立方体内,还是永不相交.如果射线原点在立方体后面或者不相交,返回null
			if ( DdN > 0 ) {

				if ( backfaceCulling ) return null;
				sign = 1;

			} else if ( DdN < 0 ) {

				sign = - 1;
				DdN = - DdN;

			} else {

				return null;

			}

			diff.subVectors( this.origin, a );
			var DdQxE2 = sign * this.direction.dot( edge2.crossVectors( diff, edge2 ) );

			// b1 < 0, no intersection
			// b1 <0 ,不相交
			if ( DdQxE2 < 0 ) {

				return null;

			}

			var DdE1xQ = sign * this.direction.dot( edge1.cross( diff ) );

			// b2 < 0, no intersection
			// b2 <0 ,不相交
			if ( DdE1xQ < 0 ) {

				return null;

			}

			// b1+b2 > 1, no intersection
			// b1+b2 > 1 ,不相交
			if ( DdQxE2 + DdE1xQ > DdN ) {

				return null;

			}

			// Line intersects triangle, check if ray does.
			// 射线与三角形相交
			var QdN = - sign * diff.dot( normal );

			// t < 0, no intersection
			// t < 0, 不相交
			if ( QdN < 0 ) {

				return null;

			}

			// Ray intersects triangle.
			// 射线与三角形相交.
			return this.at( QdN / DdN, optionalTarget );	//返回交点.

		};

	}(),

	/*
	///applyMatrix4方法通过传递参数matrix4(旋转,缩放,移动等变换矩阵)对当前射线对象的原点及方向矢量,应用变换.
	*/
	///<summary>applyMatrix4</summary>
	///<param name ="matrix4" type="Matrix4">(旋转,缩放,移动等变换矩阵</param>
	///<returns type="Boolean">返回变换后的射线对象.</returns>
	applyMatrix4: function ( matrix4 ) {

		this.direction.add( this.origin ).applyMatrix4( matrix4 );	//对射线的方向矢量应用变换
		this.origin.applyMatrix4( matrix4 );	//对射线的原点应用变换
		this.direction.sub( this.origin );
		this.direction.normalize();

		return this;	//返回变换后的射线对象
	},

	/*equals方法
	///equals方法相当于比较运算符===,将当前射线和参数ray中的(origin,direction)值进行对比,返回bool型值.
	*/
	///<summary>equals</summary>
	///<param name ="ray" type="Ray">射线(origin,direction)</param>
	///<returns type="bool">返回true or false</returns>
	equals: function ( ray ) {

		return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );	//返回true or false

	},

	/*clone方法
	///clone方法克隆一个射线对象.
	*/
	///<summary>clone</summary>
	///<returns type="Ray">返回射线对象</returns>	
	clone: function () {

		return new THREE.Ray().copy( this );	//返回射线对象

	}

};
