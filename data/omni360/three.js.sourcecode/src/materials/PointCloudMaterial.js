/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  size: <float>,
 *
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  vertexColors: <bool>,
 *
 *  fog: <bool>
 * }
 */

/*
///PointCloudMaterial方法根据参数parameters创建用于点云(粒子系统)的材质类型,
///parameters参数的格式看上面.PointCloudMaterial对象的功能函数采用,定义构造的函数原型对象来实现.大部分属性方法继承自材质的基类Material.
*/
///<summary>PointCloudMaterial</summary>
///<param name ="parameters" type="String">string类型的JSON格式材质属性参数</param>
///<returns type="PointCloudMaterial">返回PointCloudMaterial,点云材质.</returns>
THREE.PointCloudMaterial = function ( parameters ) {

	THREE.Material.call( this );	//调用Material对象的call方法,将原本属于Material的方法交给当前对象SpriteMaterial来使用

	this.color = new THREE.Color( 0xffffff ); // 颜色,默认初始化为0xffffff,白色

	this.map = null;	//普通贴图贴图,默认为null

	this.size = 1;		//点云(粒子)点的大小,默认初始化为1.
	this.sizeAttenuation = true;	//粒子衰减,默认初始化为true.

	this.vertexColors = THREE.NoColors;	//顶点颜色,默认初始化为THREE.NoColors.当然还可以有 THREE.VertexColors / THREE.FaceColors等选项,这里显示出了javascript的灵活性了.

	this.fog = true;	//雾效,默认初始化为true.
						//TODO: PointCloudMaterial为啥有雾效属性,而且为啥默认初始化为true?????????

	this.setValues( parameters );	//调用Material类的setValues方法,将参数parameters赋值给当前PointCloudMaterial材质的属性.


};

/*************************************************************
****下面是PointCloudMaterial对象的方法属性定义,继承自Material
*************************************************************/
THREE.PointCloudMaterial.prototype = Object.create( THREE.Material.prototype );

/*clone方法
///clone方法克隆PointCloudMaterial对象,
*/
///<summary>clone</summary>
///<param name ="material" type="PointCloudMaterial">PointCloudMaterial对象,可有可无.</param>
///<returns type="PointCloudMaterial">返回克隆的PointCloudMaterial对象</returns>	
THREE.PointCloudMaterial.prototype.clone = function () {
	//以下是将材质的属性一一进行复制
	var material = new THREE.PointCloudMaterial();

	THREE.Material.prototype.clone.call( this, material );

	material.color.copy( this.color );

	material.map = this.map;

	material.size = this.size;
	material.sizeAttenuation = this.sizeAttenuation;

	material.vertexColors = this.vertexColors;

	material.fog = this.fog;

	return material;	//返回克隆的PointCloudMaterial对象

};

// backwards compatibility 向后兼容
/*
///ParticleBasicMaterial方法被THREE.PointCloudMaterial方法替换.
*/
THREE.ParticleBasicMaterial = function ( parameters ) {

	console.warn( 'THREE.ParticleBasicMaterial has been renamed to THREE.PointCloudMaterial.' );
	return new THREE.PointCloudMaterial( parameters );

};
/*
///ParticleSystemMaterial方法被THREE.PointCloudMaterial方法替换.
*/
THREE.ParticleSystemMaterial = function ( parameters ) {

	console.warn( 'THREE.ParticleSystemMaterial has been renamed to THREE.PointCloudMaterial.' );
	return new THREE.PointCloudMaterial( parameters );

};
