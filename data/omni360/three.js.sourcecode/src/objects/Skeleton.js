/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author michael guerrero / http://realitymeltdown.com
 * @author ikerr / http://verold.com
 */
/*
///Skeleton是骨架对象,是骨骼对象的几何,是蒙皮对象的一部分,用来制作支持骨骼动画,当前有两种模型动画的方式：顶点动画和骨骼动画。顶点动画中，每帧动画其实就是模型特定姿态的一个“快照”。通过在帧之间插值的方法，
/// 引擎可以得到平滑的动画效果。在骨骼动画中，模型具有互相连接的“骨骼”组成的骨架结构，通过改变骨骼的朝向和位置来为模型生成动画。
/// 骨骼动画比顶点动画要求更高的处理器性能，但同时它也具有更多的优点，骨骼动画可以更容易、更快捷地创建。不同的骨骼动画可以被结合到一起——比如，
/// 模型可以转动头部、射击并且同时也在走路。一些引擎可以实时操纵单个骨骼，这样就可以和环境更加准确地进行交互——模型可以俯身并向某个方向观察或射击，
/// 或者从地上的某个地方捡起一个东西。多数引擎支持顶点动画，但不是所有的引擎都支持骨骼动画。
/// 一些引擎包含面部动画系统，这种系统使用通过音位（phoneme）和情绪修改面部骨骼集合来表达面部表情和嘴部动作。
*/
///<summary>Skeleton</summary>
///<param name ="bones" type="SkinnedMesh">骨骼数组</param>
///<param name ="boneInverses" type="SkinnedMesh">骨架位置逆矩阵</param>
///<param name ="useVertexTexture" type="boolean">true 或者 false,是否使用顶点纹理,对象构建后,该属性不能修改.</param>
///<returns type="Skeleton">骨骼对象</returns>
THREE.Skeleton = function ( bones, boneInverses, useVertexTexture ) {

	this.useVertexTexture = useVertexTexture !== undefined ? useVertexTexture : true;	//如果不设置useVertexTexture参数,默认初始化为true

	this.identityMatrix = new THREE.Matrix4();

	// copy the bone array
	// 复制骨骼数组

	bones = bones || [];

	this.bones = bones.slice( 0 );

	// create a bone texture or an array of floats
	// 创建骨架纹理或者骨架纹理数组

	if ( this.useVertexTexture ) {		//使用定点纹理

		// layout (1 matrix = 4 pixels)
		//      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
		//  with  8x8  pixel texture max   16 bones  (8 * 8  / 4)
		//       16x16 pixel texture max   64 bones (16 * 16 / 4)
		//       32x32 pixel texture max  256 bones (32 * 32 / 4)
		//       64x64 pixel texture max 1024 bones (64 * 64 / 4)

		var size;

		if ( this.bones.length > 256 )
			size = 64;
		else if ( this.bones.length > 64 )
			size = 32;
		else if ( this.bones.length > 16 )
			size = 16;
		else
			size = 8;

		this.boneTextureWidth = size;	//骨骼纹理宽度
		this.boneTextureHeight = size;	//骨骼纹理高度

		this.boneMatrices = new Float32Array( this.boneTextureWidth * this.boneTextureHeight * 4 ); // 4 floats per RGBA pixel	//每像素4个浮点型数值
		this.boneTexture = new THREE.DataTexture( this.boneMatrices, this.boneTextureWidth, this.boneTextureHeight, THREE.RGBAFormat, THREE.FloatType );	/////DataTexture类用来为面创建一个基于图像数据的反射折射或者纹理贴图对象,和THREE.Texture方法不同的是这里的图像使用的数据格式
																																							/// 这个类是最重要的属性是data，这是一个JavaScript Image类型对象的数据格式。传入的第一个参数就是该对象，
																																							///后面的对象都是可选的，如果缺省就会填充默认值，而且往往都是填充默认值。
		this.boneTexture.minFilter = THREE.NearestFilter;		///属性magFileter和minFileter指定纹理在放大和缩小时的过滤方式设置为最临近点
		this.boneTexture.magFilter = THREE.NearestFilter;
		this.boneTexture.generateMipmaps = false;		//不生成mipmap贴图,金字塔贴图
		this.boneTexture.flipY = false;					//不翻转图像

	} else {

		this.boneMatrices = new Float32Array( 16 * this.bones.length );		//不适用顶点纹理

	}

	// use the supplied bone inverses or calculate the inverses
	// 使用提供的骨架位置逆矩阵或计算骨架位置逆矩阵

	if ( boneInverses === undefined ) {		//如果没有提供骨架位置逆矩阵

		this.calculateInverses();	//计算骨架位置逆矩阵

	} else {

		if ( this.bones.length === boneInverses.length ) {		//如果提供了逆矩阵,并和骨骼数量相等

			this.boneInverses = boneInverses.slice( 0 );	//复制骨架的逆矩阵

		} else {		//如果提供的骨骼逆矩阵和骨骼数量不一致

			console.warn( 'THREE.Skeleton bonInverses is the wrong length.' );		//提示用户骨骼的逆矩阵和骨骼数量不一致

			this.boneInverses = [];	//清空骨骼逆矩阵

			for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

				this.boneInverses.push( new THREE.Matrix4() );	//并将骨骼逆矩阵和骨骼数量保持不一致

			}

		}

	}

};

/*calculateInverses方法
///calculateInverses方法重新计算骨骼的逆矩阵
*/
///<summary>calculateInverses</summary>
///<returns type="Skeleton">返回包含骨骼逆矩阵的Skeleton骨架对象.</returns>	
THREE.Skeleton.prototype.calculateInverses = function () {

	this.boneInverses = [];

	for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

		var inverse = new THREE.Matrix4();

		if ( this.bones[ b ] ) {

			inverse.getInverse( this.bones[ b ].matrixWorld );		//获得当前骨骼的位置属性的逆矩阵

		}

		this.boneInverses.push( inverse );		//返回包含骨骼逆矩阵的Skeleton骨架对象

	}

};

/*pose方法
///pose方法重新计算骨骼的计算本地矩阵,位置,旋转缩放属性
*/
///<summary>pose</summary>
///<returns type="Skeleton">返回包含新属性的骨架对象.</returns>	
THREE.Skeleton.prototype.pose = function () {

	var bone;

	// recover the bind-time world matrices
	// 恢复在绑定时的世界坐标矩阵.

	for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

		bone = this.bones[ b ];

		if ( bone ) {

			bone.matrixWorld.getInverse( this.boneInverses[ b ] );	//恢复在绑定时的世界坐标矩阵

		}

	}

	// compute the local matrices, positions, rotations and scales
	//计算本地矩阵,位置,旋转缩放属性

	for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

		bone = this.bones[ b ];

		if ( bone ) {

			if ( bone.parent ) {	//如果骨骼有父级对象

				bone.matrix.getInverse( bone.parent.matrixWorld );	//求逆父级对象的世界坐标矩阵
				bone.matrix.multiply( bone.matrixWorld );	//将当前骨骼的矩阵与父级对象的世界坐标矩阵相乘

			}
			else {

				bone.matrix.copy( bone.matrixWorld );	//复制自身的世界坐标矩阵

			}

			bone.matrix.decompose( bone.position, bone.quaternion, bone.scale );	//调用decompose()方法,重新设置骨骼对象的位置,旋转缩放属性.

		}

	}

};

/*update方法
///update方法更新当前骨架的缓冲区数据,并更新纹理标识设置为true.
*/
///<summary>pose</summary>
///<returns type="Skeleton">返回包含新的骨架对象.</returns>	
THREE.Skeleton.prototype.update = function () {

	var offsetMatrix = new THREE.Matrix4();

	// flatten bone matrices to array
	// 展开骨骼矩阵到数组.

	for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {

		// compute the offset between the current and the original transform
		//计算当前位置到原始位置的偏移距离

		var matrix = this.bones[ b ] ? this.bones[ b ].matrixWorld : this.identityMatrix;

		offsetMatrix.multiplyMatrices( matrix, this.boneInverses[ b ] );
		offsetMatrix.flattenToArrayOffset( this.boneMatrices, b * 16 );		//调用flattenToArrayOffset方法,通过参数offset(b * 16)指定偏移量,将矩阵展开到数组(参数array)中,返回新的数组.

	}

	if ( this.useVertexTexture ) {		//如果使用顶点纹理

		this.boneTexture.needsUpdate = true;	//将更新标识设置为true.

	}

};

