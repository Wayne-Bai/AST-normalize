/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  linewidth: <float>,
 *
 *  scale: <float>,
 *  dashSize: <float>,
 *  gapSize: <float>,
 *
 *  vertexColors: <bool>
 *
 *  fog: <bool>
 * }
 */

/*
///LineDashedMaterial方法根据参数parameters创建线段的虚线线型材质,parameters参数的格式看上面.LineDashedMaterial对象的功能函数采用
/// 定义构造的函数原型对象来实现.大部分属性方法继承自材质的基类Material.用材质来定义线性,第一次见,真的很有想象力.简直就是对绘图软件的终结.
*/
///<summary>LineDashedMaterial</summary>
///<param name ="parameters" type="String">string类型的JSON格式材质属性参数</param>
///<returns type="LineDashedMaterial">返回LineDashedMaterial,虚线线段材质.</returns>
THREE.LineDashedMaterial = function ( parameters ) {

	THREE.Material.call( this );	//调用Material对象的call方法,将原本属于Material的方法交给当前对象LineDashedMaterial来使用.

	this.color = new THREE.Color( 0xffffff );	//材质的颜色属性.

	this.linewidth = 1;		//虚线的线宽属性

	this.scale = 1;			//虚线的线型比例属性,用过AutoCAD,Microstation类绘图软件的应该比较熟悉.
	this.dashSize = 3;		//虚线(点化线),线段的长度.
	this.gapSize = 1;		//虚线(点化线)的线段间距长度.

	this.vertexColors = false;	//顶点颜色,默认初始化为false.当然还可以有THREE.NoColors / THREE.VertexColors / THREE.FaceColors等选项,这里显示出了javascript的灵活性了.

	this.fog = true;	//雾效,默认初始化为true.
						//TODO: LineDashedMaterial为啥有雾效属性,而且为啥默认初始化为true?????????

	this.setValues( parameters );	//调用Material类的setValues方法,将参数parameters赋值给当前LienDashedMaterial材质的属性.

};

/*************************************************************
****下面是LineDashedMaterial对象的方法属性定义,继承自Material
*************************************************************/
THREE.LineDashedMaterial.prototype = Object.create( THREE.Material.prototype );

/*clone方法
///clone方法克隆LineDashedMaterial对象,
*/
///<summary>clone</summary>
///<param name ="material" type="LineDashedMaterial">LineDashedMaterial对象,可有可无.</param>
///<returns type="LineDashedMaterial">返回克隆的LineDashedMaterial对象</returns>	
THREE.LineDashedMaterial.prototype.clone = function () {
	//以下是将材质的属性一一进行复制.
	var material = new THREE.LineDashedMaterial();

	THREE.Material.prototype.clone.call( this, material );

	material.color.copy( this.color );

	material.linewidth = this.linewidth;

	material.scale = this.scale;
	material.dashSize = this.dashSize;
	material.gapSize = this.gapSize;

	material.vertexColors = this.vertexColors;

	material.fog = this.fog;

	return material;	//返回克隆的LineDashedMaterial对象

};
