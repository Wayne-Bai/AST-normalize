/**
 * @author mrdoob / http://mrdoob.com/
 *
 * parameters = {
 *  opacity: <float>,
 *
 *  shading: THREE.FlatShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * }
 */

/*
///MeshNormalMaterial方法根据参数parameters创建mesh(网格)的标准材质类型,到这里真的不知道怎么翻译才好,还不如叫NormalMaterial呢,
///parameters参数的格式看上面.MeshNormalMaterial对象的功能函数采用,定义构造的函数原型对象来实现.大部分属性方法继承自材质的基类Material.
*/
///<summary>MeshNormalMaterial</summary>
///<param name ="parameters" type="String">string类型的JSON格式材质属性参数</param>
///<returns type="MeshNormalMaterial">返回MeshNormalMaterial,网格标准材质.</returns>
THREE.MeshNormalMaterial = function ( parameters ) {

	THREE.Material.call( this, parameters );	//调用Material对象的call方法,将原本属于Material的方法交给当前对象MeshNormalMaterial来使用.

	this.shading = THREE.FlatShading;	//着色方式,THREE.FlatShading //GL_FLAT恒定着色：对点，直线或多边形采用一种颜色进行绘制，整个图元的颜色就是它的任何一点的颜色。
										//还有以下几种THREE.NoShading = 0;    //不着色???? 
										//THREE.SmoothShading = 1; 平滑着色：用多种颜色进行绘制，每个顶点都是单独进行处理的，各顶点和各图元之间采用均匀插值。

	this.wireframe = false;			//以线框方式渲染几何体.默认为false
	this.wireframeLinewidth = 1;		//线框的宽度,默认初始化为1.

	this.morphTargets = false;	//定义材质是否设定目标变形动画,默认为false

	this.setValues( parameters );	//调用Material类的setValues方法,将参数parameters赋值给当前MeshNormalMaterial材质的属性.

};

/*************************************************************
****下面是MeshNormalMaterial对象的方法属性定义,继承自Material
*************************************************************/
THREE.MeshNormalMaterial.prototype = Object.create( THREE.Material.prototype );

/*clone方法
///clone方法克隆MeshNormalMaterial对象,
*/
///<summary>clone</summary>
///<param name ="material" type="MeshNormalMaterial">MeshNormalMaterial对象,可有可无.</param>
///<returns type="MeshNormalMaterial">返回克隆的MeshNormalMaterial对象</returns>	
THREE.MeshNormalMaterial.prototype.clone = function () {
	//以下是将材质的属性一一进行复制
	var material = new THREE.MeshNormalMaterial();

	THREE.Material.prototype.clone.call( this, material );

	material.shading = this.shading;

	material.wireframe = this.wireframe;
	material.wireframeLinewidth = this.wireframeLinewidth;

	return material;	//返回克隆的MeshNormalMaterial对象

};
