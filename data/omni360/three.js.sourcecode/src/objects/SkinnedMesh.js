/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */
/*
///SkinnedMesh对象,蒙皮网格对象,蒙皮网格用于渲染人物。人物动画使用的骨骼，而且每个骨骼影响网格的一部分.
*/
///<summary>SkinnedMesh</summary>
///<param name ="geometry" type="THREE.Geometry">Geometry对象(灯笼的框架)</param>
///<param name ="material" type="THREE.Material">Material对象(材质对象)</param>
///<param name ="useVertexTexture" type="boolean">true 或者 false,是否使用顶点纹理,对象构建后,该属性不能修改.</param>
///<returns type="SkinnedMesh">返回SkinnedMesh对象</returns>
THREE.SkinnedMesh = function ( geometry, material, useVertexTexture ) {

	THREE.Mesh.call( this, geometry, material );	//调用Mesh对象的call方法,将原本属于Mesh的方法交给当前对象SkinnedMesh来使用.

	this.bindMode = "attached";		//绑定模式
	this.bindMatrix = new THREE.Matrix4();		//绑定矩阵
	this.bindMatrixInverse = new THREE.Matrix4();	//绑定矩阵的逆矩阵

	// init bones 初始化骨骼

	// TODO: remove bone creation as there is no reason (other than
	// convenience) for THREE.SkinnedMesh to do this.

	var bones = [];	//存储骨骼的数组,这个属性在构造函数中设置.

	if ( this.geometry && this.geometry.bones !== undefined ) {	

		var bone, gbone, p, q, s;

		for ( var b = 0, bl = this.geometry.bones.length; b < bl; ++b ) {

			gbone = this.geometry.bones[ b ];

			p = gbone.pos;
			q = gbone.rotq;
			s = gbone.scl;

			bone = new THREE.Bone( this );
			bones.push( bone );

			bone.name = gbone.name;
			bone.position.set( p[ 0 ], p[ 1 ], p[ 2 ] );	//位置属性
			bone.quaternion.set( q[ 0 ], q[ 1 ], q[ 2 ], q[ 3 ] );	//四元数属性

			if ( s !== undefined ) {

				bone.scale.set( s[ 0 ], s[ 1 ], s[ 2 ] );	//缩放属性

			} else {

				bone.scale.set( 1, 1, 1 );	

			}

		}

		for ( var b = 0, bl = this.geometry.bones.length; b < bl; ++b ) {

			gbone = this.geometry.bones[ b ];

			if ( gbone.parent !== - 1 ) {

				bones[ gbone.parent ].add( bones[ b ] );

			} else {

				this.add( bones[ b ] );

			}

		}

	}

	this.normalizeSkinWeights();	//构造SkinnedMesh对象时调用normalizeSkinWeights方法,确保skinWeights的各元素是归一化的.

	this.updateMatrixWorld( true );		//对当前对象及其子对象的matrix属性应用全局位移,旋转,缩放变换.
	this.bind( new THREE.Skeleton( bones, undefined, useVertexTexture ) );	//调用bind方法,绑定骨骼对象.

};

/*************************************************
****下面是SkinnedMesh对象的方法属性定义,继承自Mesh
**************************************************/
THREE.SkinnedMesh.prototype = Object.create( THREE.Mesh.prototype );
/*
///bind方法将蒙皮网格对象根据绑定矩阵绑定骨架.
*/
///<summary>bind</summary>
///<param name ="skeleton" type="SkinnedMesh">骨骼数组</param>
///<param name ="bindMatrix" type="Matrix4">可选参数,绑定矩阵</param>
///<returns type="SkinnedMesh">蒙皮网格对象</returns>
THREE.SkinnedMesh.prototype.bind = function( skeleton, bindMatrix ) {

	this.skeleton = skeleton;

	if ( bindMatrix === undefined ) {	//如果没有指定绑定矩阵

		this.updateMatrixWorld( true );

		bindMatrix = this.matrixWorld;	//使用蒙皮网格对象的世界坐标矩阵.

	}

	this.bindMatrix.copy( bindMatrix );
	this.bindMatrixInverse.getInverse( bindMatrix );

};

/*pose方法
///pose方法重新计算蒙皮网格对象的骨架的计算本地矩阵,位置,旋转缩放属性
*/
///<summary>pose</summary>
///<returns type="Skeleton">返回包含新属性的蒙皮网格对象.</returns>	
THREE.SkinnedMesh.prototype.pose = function () {

	this.skeleton.pose();	//调用骨架对象的pose方法.

};

/*normalizeSkinWeights方法
///normalizeSkinWeights方法归一化蒙皮网格对象的蒙皮权重.
*/
///<summary>calculateInverses</summary>
///<returns type="Skeleton">返回新权重的蒙皮网格对象.</returns>	
THREE.SkinnedMesh.prototype.normalizeSkinWeights = function () {

	if ( this.geometry instanceof THREE.Geometry ) {

		for ( var i = 0; i < this.geometry.skinIndices.length; i ++ ) {		//遍历蒙皮指数数组.

			var sw = this.geometry.skinWeights[ i ];		//蒙皮权重数组

			var scale = 1.0 / sw.lengthManhattan();		//求和sw的x,y,z分量

			if ( scale !== Infinity ) {		//scale不等于正无穷大

				sw.multiplyScalar( scale );		//sw的每个分量乘以scale

			} else {

				sw.set( 1 ); // this will be normalized by the shader anyway	//sw将被着色器归一化??????搞不明白.

			}

		}

	} else {

		// skinning weights assumed to be normalized for THREE.BufferGeometry
		// 蒙皮权重确保是归一化的 ,供THREE.BufferGeometry使用.

	}

};

/*
///updateMatrixWorld方法对当前对象及其子对象的matrix属性应用全局位移,旋转,缩放变换.
///NOTE: 在updateMatrixWorld方法中如果参数force为true,将对其子对象应用同样的全局变换.
*/
///<summary>updateMatrixWorld</summary>
///<param name ="force" type="Boolean">true或者false</param>
///<returns type="Object3D">返回新的SkinnedMesh对象</returns>		
THREE.SkinnedMesh.prototype.updateMatrixWorld = function( force ) {

	THREE.Mesh.prototype.updateMatrixWorld.call( this, true );

	if ( this.bindMode === "attached" ) {	//当bindmode为attached

		this.bindMatrixInverse.getInverse( this.matrixWorld );

	} else if ( this.bindMode === "detached" ) {

		this.bindMatrixInverse.getInverse( this.bindMatrix );

	} else {

		console.warn( 'THREE.SkinnedMesh unreckognized bindMode: ' + this.bindMode );

	}

};

/*clone方法
///clone方法克隆一个SkinnedMesh蒙皮网格对象.
*/
///<summary>clone</summary>
///<param name ="object" type="SkinnedMesh">接收克隆的SkinnedMesh对象</param>
///<param name ="recursive" type="boolean">是否对子对象一一进行克隆</param>
///<returns type="Ray">返回SkinnedMesh蒙皮网格网格对象.</returns>	
THREE.SkinnedMesh.prototype.clone = function( object ) {

	if ( object === undefined ) {

		object = new THREE.SkinnedMesh( this.geometry, this.material, this.useVertexTexture );

	}

	THREE.Mesh.prototype.clone.call( this, object );	//继承Mesh的clone方法

	return object;	//返回SkinnedMesh蒙皮网格网格对象

};

