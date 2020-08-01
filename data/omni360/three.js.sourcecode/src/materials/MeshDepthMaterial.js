/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  opacity: <float>,
 *
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * }
 */

/*
///MeshDepthMaterial方法根据参数parameters创建基于相机远近裁切面自动变换亮度(明暗度)的mesh(网格)的材质类型,离相机越近,材质越亮(白),离相机越远,材质越暗(黑).
///parameters参数的格式看上面.MeshDepthMaterial对象的功能函数采用,定义构造的函数原型对象来实现.大部分属性方法继承自材质的基类Material.
*/
///<summary>MeshDepthMaterial</summary>
///<param name ="parameters" type="String">string类型的JSON格式材质属性参数</param>
///<returns type="MeshDepthMaterial">返回MeshDepthMaterial,网格深度材质.</returns>
THREE.MeshDepthMaterial = function ( parameters ) {

	THREE.Material.call( this );	//调用Material对象的call方法,将原本属于Material的方法交给当前对象MeshDepthMaterial来使用.

	this.morphTargets = false;		//定义材质是否设定目标变形动画,默认为false
	this.wireframe = false;;			//以线框方式渲染几何体.默认为false
	this.wireframeLinewidth = 1;		//线框的宽度,默认初始化为1.

	this.setValues( parameters );		//调用Material类的setValues方法,将参数parameters赋值给当前MeshDepthMaterial材质的属性.

};

/*************************************************************
****下面是MeshDepthMaterial对象的方法属性定义,继承自Material
*************************************************************/
THREE.MeshDepthMaterial.prototype = Object.create( THREE.Material.prototype );

/*clone方法
///clone方法克隆MeshDepthMaterial对象,
*/
///<summary>clone</summary>
///<param name ="material" type="MeshDepthMaterial">MeshDepthMaterial对象,可有可无.</param>
///<returns type="MeshDepthMaterial">返回克隆的MeshDepthMaterial对象</returns>	
THREE.MeshDepthMaterial.prototype.clone = function () {
	//以下是将材质的属性一一进行复制
	var material = new THREE.MeshDepthMaterial();

	THREE.Material.prototype.clone.call( this, material );

	material.wireframe = this.wireframe;
	material.wireframeLinewidth = this.wireframeLinewidth;

	return material;	//返回克隆的MeshDepthMaterial对象

};
