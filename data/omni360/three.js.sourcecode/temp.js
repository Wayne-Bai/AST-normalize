

// File:src/math/Plane.js

/**
 * @author bhouston / http://exocortex.com
 */

/*
///Plane对象的构造函数.用来在三维空间内创建一个法线向量为normal,从原点到平面的距离为constant的无限延展的二维平面对象.Plane对象的功能函数采用
///定义构造的函数原型对象来实现.
///
///	用法: var normal = new Vector3(0,0,0),constant = 5.5; var Plane = new Plane(normal,constant);
///创建一个法线向量是0,0,0原点到平面的距离是5.5的二维平面.
*/
///<summary>Plane</summary>
///<param name ="normal" type="Vector3">平面法线向量</param>
///<param name ="constant" type="Number">Number二维平面离原点的距离</param>
THREE.Plane = function ( normal, constant ) {

	this.normal = ( normal !== undefined ) ? normal : new THREE.Vector3( 1, 0, 0 );	//赋值或者初始化normal
	this.constant = ( constant !== undefined ) ? constant : 0;	//赋值或者初始化constant

};

/****************************************
****下面是Plane对象提供的功能函数.
****************************************/
THREE.Plane.prototype = {

	constructor: THREE.Plane,	//构造器,返回对创建此对象的Plane函数的引用

	/*
	///set方法用来重新设置二维平面的法线向量normal,原点到平面的距离constant,并返回新的二维平面.
	*/
	///<summary>set</summary>
	///<param name ="normal" type="Vector3">平面法线向量</param>
	///<param name ="constant" type="Number">Number二维平面离原点的距离</param>
	///<returns type="Plane">返回新的二维平面</returns>
	set: function ( normal, constant ) {

		this.normal.copy( normal );
		this.constant = constant;

		return this;		//返回新的二维平面

	},

	/*
	///setComponents方法用来通过x,y,z,w分量重新设置二维平面的法线向量normal,原点到平面的距离constant,并返回新的二维平面.
	*/
	///<summary>setComponents</summary>
	///<param name ="normal" type="Vector3">平面法线向量</param>
	///<param name ="x" type="Number">平面法线向量x坐标</param>
	///<param name ="y" type="Number">平面法线向量y坐标</param>
	///<param name ="z" type="Number">平面法线向量z坐标</param>
	///<param name ="w" type="Number">Number二维平面离原点的距离w</param>
	///<returns type="Plane">返回新的二维平面</returns>
	setComponents: function ( x, y, z, w ) {

		this.normal.set( x, y, z );
		this.constant = w;

		return this;		//返回新的二维平面

	},

	/*
	///setFromNormalAndCoplanarPoint方法用来通过参数normal(平面法线向量)和参数point(共面的点)重新设置二维平面的法线向量normal,原点到平面的距离constant,并返回新的二维平面.
	*/
	///<summary>setFromNormalAndCoplanarPoint</summary>
	///<param name ="normal" type="Vector3">平面法线向量</param>
	///<param name ="point" type="Vector3">共面的点</param>
	///<returns type="Plane">返回新的二维平面</returns>
	setFromNormalAndCoplanarPoint: function ( normal, point ) {

		this.normal.copy( normal );
													//下面point.dot()方法只接收this.normal,不接收normal,this.normal是被规范化的,是单位向量
		this.constant = - point.dot( this.normal );	// must be this.normal, not normal, as this.normal is normalized

		return this;	//并返回新的二维平面

	},

	/*
	///setFromCoplanarPoints方法用来通过共面的点a,b,c重新设置二维平面的法线向量normal,原点到平面的距离constant,并返回新的二维平面.
	/// NOTE:setFromCoplanarPoints方法接受的3个点a,b,c,需要按照逆时针方向的顺序传入,来确定发现的方向.
	*/
	///<summary>setFromCoplanarPoints</summary>
	///<param name ="a" type="Vector3">共面的点a</param>
	///<param name ="b" type="Vector3">共面的点b</param>
	///<param name ="c" type="Vector3">共面的点c</param>
	///<returns type="Plane">返回新的二维平面</returns>
	setFromCoplanarPoints: function () {

		var v1 = new THREE.Vector3();
		var v2 = new THREE.Vector3();

		return function ( a, b, c ) {

			var normal = v1.subVectors( c, b ).cross( v2.subVectors( a, b ) ).normalize();	//先得到向量c,b的差,通过cross方法获得向量a,b差的交叉乘积(交叉乘积垂直于向量a,b所在的平面),然后在调用normalize()方法获得单位向量.

			// Q: should an error be thrown if normal is zero (e.g. degenerate plane)?
			//NOTE: 如果法向量normal是0,会产生一个无效的平面对象.

			this.setFromNormalAndCoplanarPoint( normal, a ); 	//setFromNormalAndCoplanarPoint方法用来通过参数normal(平面法线向量)和参数point(共面的点)重新设置二维平面的法线向量normal,原点到平面的距离constant,并返回新的二维平面.


			return this;	//返回新的二维平面

		};

	}(),


	/*
	///copy方法用来复制二维平面的法线向量normal,原点到平面的距离constant值.返回新的二维平面
	///TODO: copy方法和clone方法有什么不同?
	*/
	///<summary>copy</summary>
	///<param name ="Plane" type="Plane">二维平面</param>
	///<returns type="Plane">返回新的二维平面</returns>
	copy: function ( plane ) {

		this.normal.copy( plane.normal );
		this.constant = plane.constant;

		return this;	//返回新的二维平面

	},

	/*
	///normalize方法用来规范化法线向量,并调整constant常量的值(获得单位平面).
	*/
	///<summary>normalize</summary>
	///<returns type="Plane">返回规范化后的二维平面(获得单位平面)</returns>
	normalize: function () {

		// Note: will lead to a divide by zero if the plane is invalid.
		// NOTE: 注意如果平面无效将产生除数是0的错误.

		var inverseNormalLength = 1.0 / this.normal.length();
		this.normal.multiplyScalar( inverseNormalLength );
		this.constant *= inverseNormalLength;

		return this;	//返回规范化的二维平面(获得单位平面)

	},

	/*
	///negate方法用来翻转法线,获得当前平面的背面,
	*/
	///<summary>negate</summary>
	///<returns type="Plane">返回当前平面的背面</returns>
	negate: function () {

		this.constant *= - 1;
		this.normal.negate();	//翻转法线,Vector3.negate方法将当前三维向量的(x,y,z)坐标值若为负数时,返回正数. 而当前三维向量的(x,y,z)坐标值若为正数时,返回负数. 

		return this;	//返回当前平面的背面

	},

	/*
	///distanceToPoint方法用来获得三维空间内一点到Plane二维平面对象表面的最小长度.
	*/
	///<summary>distanceToPoint</summary>
	///<param name ="point" type="Vector3">一个三维空间内的Vector3的三维点坐标</param>
	///<returns type="Number">返回三维空间内一点到Plane二维平面对象表面的最小长度.</returns>
	distanceToPoint: function ( point ) {

		return this.normal.dot( point ) + this.constant;	//返回三维空间内一点到Plane二维平面对象表面的最小长度

	},

	/*
	///distanceToPoint方法用来获得Plane二维平面对象到三维空间内一个球体表面的最小长度.()
	*/
	///<summary>distanceToPoint</summary>
	///<param name ="sphere" type="Sphere">一个三维空间内的Sphere的球体对象</param>
	///<returns type="Number">返回三维空间内Plane二维平面对象到三维空间内一个球体表面的最小长度.</returns>
	distanceToSphere: function ( sphere ) {

		return this.distanceToPoint( sphere.center ) - sphere.radius;	//返回三维空间内Plane二维平面对象到三维空间内一个球体表面的最小长度

	},

	/*
	///projectPoint方法返回三维空间中一点到当前平面的投影.点到面上的投影等于从参数point到平面上的垂足,所以从垂足画条线到点垂直于平面.
	*/
	///<summary>projectPoint</summary>
	///<param name ="point" type="Vector3">Vector3三维向量</param>
	///<param name ="optionalTarget" type="Vector3">可选参数,接收返回结果</param>
	///<returns type="Number">返回点到平面的投影</returns>
	projectPoint: function ( point, optionalTarget ) {

		return this.orthoPoint( point, optionalTarget ).sub( point ).negate();	//调用orthoPoint()方法,减去point,返回取反的结果

	},

	/*
	///orthoPoint方法返回一个与当前二维平面对象法线向量方向相同,与参数point到平面距离相等大小的向量(垂足).如果设置了optionalTarget参数,将结果保存在optionalTarget里.
	*/
	///<summary>orthoPoint</summary>
	///<param name ="point" type="Vector3">Vector3三维向量</param>
	///<param name ="optionalTarget" type="Vector3">可选参数,接收返回结果</param>
	///<returns type="Vector3">返回一个与当前二维平面对象法线向量方向相同,与参数point到平面距离相等大小的向量(垂足).</returns>
	orthoPoint: function ( point, optionalTarget ) {

		var perpendicularMagnitude = this.distanceToPoint( point );	//获得平面到参数point的距离,赋值给prependicularMagnitude

		var result = optionalTarget || new THREE.Vector3();	//生命变量resault,用来存放结果
		return result.copy( this.normal ).multiplyScalar( perpendicularMagnitude );	//调用multiplyScalar(perpendicularMagnitude)方法,将当前二维平面的法向量的分量x,y,z分别乘以获得平面到参数point的距离.最后返回计算结果.

	},

	/*
	///isIntersectionLine方法获取当前二维平面是否与参数line相交,返回true 或者 false
	*/
	///<summary>isIntersectionLine</summary>
	///<param name ="line" type="Line3">三维空间中的线Line3</param>
	///<returns type="Boolean">返回true 或者 false</returns>
	isIntersectionLine: function ( line ) {

		// Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.
		// NOTE:isIntersectionLine()是测试线和面是否相交,不是误以为线和面是否共面

		var startSign = this.distanceToPoint( line.start );
		var endSign = this.distanceToPoint( line.end );

		return ( startSign < 0 && endSign > 0 ) || ( endSign < 0 && startSign > 0 );	//返回true 或者 false

	},

	/*
	///intersectLine方法获取当前二维平面与参数line相交的交点,如果和参数Line不相交返回undefined,如果线和当前二维平面共面返回线的起点.
	*/
	///<summary>isIntersectionLine</summary>
	///<param name ="line" type="Line3">三维空间中的线Line3</param>
	///<param name ="optionalTarget" type="Vector3">可选参数,接收返回结果</param>
	///<returns type="Boolean">返回当前二维平面与参数line相交的交点,如果和参数Line不相交或其它未知返回undefined,如果线和当前二维平面共面返回线的起点.</returns>
	intersectLine: function () {

		var v1 = new THREE.Vector3();

		return function ( line, optionalTarget ) {

			var result = optionalTarget || new THREE.Vector3();

			var direction = line.delta( v1 );

			var denominator = this.normal.dot( direction );

			if ( denominator == 0 ) {

				// line is coplanar, return origin
				// 如果线和当前二维平面共面返回线的起点
				if ( this.distanceToPoint( line.start ) == 0 ) {

					return result.copy( line.start );

				}

				// Unsure if this is the correct method to handle this case.
				// 如果其它未知返回undefined
				return undefined;

			}

			var t = - ( line.start.dot( this.normal ) + this.constant ) / denominator;

			if ( t < 0 || t > 1 ) {

				return undefined;	//如果和参数Line不相交返回undefined

			}

			return result.copy( direction ).multiplyScalar( t ).add( line.start );	//返回当前二维平面与参数line相交的交点

		};

	}(),


	/*
	///coplanarPoint方法获取当前二维平面的法线向量到当前二维平面投影(垂足,与当前平面的共面的点).
	///TODO:这里没有弄明白,有时间在弄清楚,高中几何都快忘光了,钻牛角尖了.不过知道在下面应用变换时调用了.
	*/
	///<summary>coplanarPoint</summary>
	///<param name ="optionalTarget" type="Vector3">可选参数,接收返回结果</param>
	///<returns type="Boolean">返回共面的点.</returns>
	coplanarPoint: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		return result.copy( this.normal ).multiplyScalar( - this.constant );	//返回共面的点

	},

	/*
	///applyMatrix4方法通过传递matrix(旋转,缩放,移动等变换矩阵)对当前Plane二维平面对象的法线向量normal和,应用变换.
	*/
	///<summary>applyMatrix4</summary>
	///<param name ="matrix" type="Matrix4">(旋转,缩放,移动等变换矩阵</param>
	///<param name ="optionalNormalMatrix" type="Matrix3">可选参数,如果设置了就会对法线应用(旋转,缩放,移动等变换矩阵</param>
	///<returns type="Boolean">返回变换后的二维平面.</returns>
	applyMatrix4: function () {

		var v1 = new THREE.Vector3();
		var v2 = new THREE.Vector3();
		var m1 = new THREE.Matrix3();

		return function ( matrix, optionalNormalMatrix ) {

			// compute new normal based on theory here:
			// http://www.songho.ca/opengl/gl_normaltransform.html
			var normalMatrix = optionalNormalMatrix || m1.getNormalMatrix( matrix );
			var newNormal = v1.copy( this.normal ).applyMatrix3( normalMatrix );

			var newCoplanarPoint = this.coplanarPoint( v2 );	//获得共面的点
			newCoplanarPoint.applyMatrix4( matrix );

			this.setFromNormalAndCoplanarPoint( newNormal, newCoplanarPoint );	//setFromNormalAndCoplanarPoint方法用来通过参数normal(平面法线向量)和参数point(共面的点)重新设置二维平面的法线向量normal,原点到平面的距离constant,并返回新的二维平面.

			return this;		//返回变换后的二维平面

		};

	}(),

	/*
	///translate方法用来通过参数offset,移动当前二维平面的位置.
	*/
	///<summary>translate</summary>
	///<param name ="offset" type="Vector3">偏移量</param>
	///<returns type="Boolean">返回新的二维平面</returns>
	translate: function ( offset ) {

		this.constant = this.constant - offset.dot( this.normal );

		return this;	//返回新的二维平面

	},

	/*
	///equals方法用来获得参数Plane(一个Plane的二维平面)是否与当前二维平面完全相等,即法线向量normal和半径相等.
	*/
	///<summary>equals</summary>
	///<param name ="Plane" type="Plane">一个Plane的二维平面</param>
	///<returns type="Boolean">返回true 或者 false</returns>
	equals: function ( plane ) {

		return plane.normal.equals( this.normal ) && ( plane.constant == this.constant );	//返回true 或者 false

	},

	/*clone方法
	///clone方法克隆一个二维平面对象.
	*/
	///<summary>clone</summary>
	///<returns type="Plane">返回二维平面对象</returns>	
	clone: function () {

		return new THREE.Plane().copy( this );	//返回二维平面对象

	}

};
