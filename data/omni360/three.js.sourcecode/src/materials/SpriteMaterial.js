/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *	uvOffset: new THREE.Vector2(),
 *	uvScale: new THREE.Vector2(),
 *
 *  fog: <bool>
 * }
 */

/*
///SpriteMaterial方法根据参数parameters创建Sprite(点精灵)的材质类型,
///parameters参数的格式看上面.SpriteMaterial对象的功能函数采用,定义构造的函数原型对象来实现.大部分属性方法继承自材质的基类Material.
*/
///<summary>SpriteMaterial</summary>
///<param name ="parameters" type="String">string类型的JSON格式材质属性参数</param>
///<returns type="SpriteMaterial">返回SpriteMaterial,点精灵材质.</returns>
THREE.SpriteMaterial = function ( parameters ) {

	THREE.Material.call( this );	//调用Material对象的call方法,将原本属于Material的方法交给当前对象SpriteMaterial来使用

	// defaults 默认

	this.color = new THREE.Color( 0xffffff ); // 颜色,默认初始化为0xffffff,白色
	this.map = null;	//普通贴图贴图,默认为null

	this.rotation = 0;	//旋转角度,粒子系统的贴图的旋转角度吧.想想应该是.

	this.fog = false;	//雾效,默认初始化为true.
						//TODO:SpriteMaterial为啥有雾效属性,而且为啥默认初始化为true?????????

	// set parameters 设置参数

	this.setValues( parameters );	//调用Material类的setValues方法,将参数parameters赋值给当前SpriteMaterial材质的属性.

};

/*************************************************************
****下面是SpriteMaterial对象的方法属性定义,继承自Material
*************************************************************/
THREE.SpriteMaterial.prototype = Object.create( THREE.Material.prototype );

/*clone方法
///clone方法克隆SpriteMaterial对象,
*/
///<summary>clone</summary>
///<param name ="material" type="SpriteMaterial">SpriteMaterial对象,可有可无.</param>
///<returns type="SpriteMaterial">返回克隆的SpriteMaterial对象</returns>	
THREE.SpriteMaterial.prototype.clone = function () {
	//以下是将材质的属性一一进行复制.
	var material = new THREE.SpriteMaterial();

	THREE.Material.prototype.clone.call( this, material );

	material.color.copy( this.color );
	material.map = this.map;

	material.rotation = this.rotation;

	material.fog = this.fog;

	return material;	//返回克隆的SpriteMaterial对象

};
