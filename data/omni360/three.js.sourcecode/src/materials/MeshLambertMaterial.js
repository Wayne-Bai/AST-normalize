/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  ambient: <hex>,
 *  emissive: <hex>,
 *  opacity: <float>,
 *
 *  map: new THREE.Texture( <Image> ),
 *
 *  lightMap: new THREE.Texture( <Image> ),
 *
 *  specularMap: new THREE.Texture( <Image> ),
 *
 *  alphaMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
 *  refractionRatio: <float>,
 *
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  vertexColors: THREE.NoColors / THREE.VertexColors / THREE.FaceColors,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>,
 *
 *	fog: <bool>
 * }
 */

/*
///MeshPhongMaterial方法根据参数parameters创建mesh(网格)的Lambert(兰伯特)材质类型,表面有光泽的材质类型,计算每个像素,
///parameters参数的格式看上面.MeshPhongMaterial对象的功能函数采用,定义构造的函数原型对象来实现.大部分属性方法继承自材质的基类Material.
*/
///<summary>MeshLambertMaterial</summary>
///<param name ="parameters" type="String">string类型的JSON格式材质属性参数</param>
///<returns type="MeshLambertMaterial">返回MeshLambertMaterial,网格兰伯特材质.</returns>
THREE.MeshLambertMaterial = function ( parameters ) {

	THREE.Material.call( this );	//调用Material对象的call方法,将原本属于Material的方法交给当前对象MeshLambertMaterial来使用

	this.color = new THREE.Color( 0xffffff ); // diffuse 漫射颜色,默认初始化为0xffffff,白色
	this.ambient = new THREE.Color( 0xffffff );	//环境色 ,默认初始化为0xffffff, 白色, 乘以环境光对象的颜色
	this.emissive = new THREE.Color( 0x000000 );	//自发光(荧光)颜色, 默认初始化为0x000000,黑色, 实体颜色,不受其他灯光的影响.
	
	/*
		this.wrapAround和this.wrapRGB所关联的着色器语言
							// diffuse散射

			"				#ifdef WRAP_AROUND",

			"					float spotDiffuseWeightFull = max( dot( normal, spotVector ), 0.0 );",
			"					float spotDiffuseWeightHalf = max( 0.5 * dot( normal, spotVector ) + 0.5, 0.0 );",

			"					vec3 spotDiffuseWeight = mix( vec3( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );",
								genType mix (genType x, genType y, genType a)、genType mix (genType x, genType y, float a)
								返回线性混合的x和y，如：x*(1−a)+y*a
			"				#else",

			"					float spotDiffuseWeight = max( dot( normal, spotVector ), 0.0 );",

			"				#endif",
	*/
	this.wrapAround = false;	//是否遮罩??
								//TODO: this.wrapAround和this.wrapRGB属性有点含糊,还需要测试.
	this.wrapRGB = new THREE.Vector3( 1, 1, 1 );	//通过设置wrapRGB的数值,根据上面注释中的公式,对材质颜色进行线性混合.

	this.map = null;	//普通贴图贴图,默认为null

	/*********************************为什么要用Lightmapping**************************************************************************
	参考:http://blog.sina.com.cn/s/blog_5b6cb9500101cplo.html
	1.为什么要用Lightmapping?

	简单来说就是实时灯光计算十分耗时，随着光源越多会倍增计算耗时。使用Lightmap模拟灯光带来的效果，便不用去计算灯光，会带来性能上
	的大大提升。当然你不用灯光效果也是没问题的，具体还是看项目需求。最简单的直接在3dmas或maya里面烘培完贴图顶点色也行。
	***************************************************************************************************************************/
	this.lightMap = null	//光照贴图,默认为null;

	this.specularMap = null;	//高光贴图,默认为null

	this.alphaMap = null;	//透明通道贴图,默认为null

	this.envMap = null;		//环境贴图,默认为null

	// TEXTURE CONSTANTS
	//纹理常量,用来设置材质混合模式,有
	//THREE.MultiplyOperation,  相乘,photoshop中的图层混合翻译成正片叠底
	//THREE.MixOperation,   //混合模式
	//THREE.AddOperation,   //增加模式
	//参考: http://avnpc.com/pages/photoshop-layer-blending-algorithm
	//参考:
	//TODO: 是不是还可以实现更多的模式?
	// Normal正常模式 
	// Dissolve溶解模式 
	// Dancing Dissolve动态溶解模式 
	// Darken变暗模式 
	// Multiply正片叠底模式 
	// Linear Burn线性加深模式 
	// Color Burn颜色加深模式 
	// Classic Color Burn为兼容早版本的Color Burn模式 
	// Add增加模式 
	// Lighten变亮模式 
	// Screen屏幕模式 
	// Linear Dodge线性减淡模式 
	// Overlay叠加模式 
	// Soft Light柔光模式 
	// Hard Light强光模式 
	// Liner Light线性加光模式 
	// Vivid Light清晰加光模式 
	// Din Light阻光模式 
	// Hard Mix强光混合模式 
	// Difference差别模式 
	// Classic Difference兼容老版本的差别模式 
	// Exclusion排除模式 
	// Hue色相模式 
	// Saturation饱和度模式 
	// Color颜色模式 
	// Luminosity高度模式。 
	// 上面所列的层模式，是通上下层的颜色通道混合产生影响变化，而下层的层模式则是通过层的Alpha通道影响混合变化。 
	// Stencil Alpha：Alpha通道模式 
	// Stencil Luma：亮度模式 
	// Slihouette Alpha：Alpha通道轮廓 
	// Slihouette Luma：亮度轮廓 
	// Alpha Add：Alpha添加 
	// Luminescent Premul：冷光模式。
	/****************混合模式公式***************************************************************************************************************

	Photoshop图层混合模式计算公式大全 


	关于photoshop的图层混合模式，大家一定都非常熟悉了，我在这里把各种混合模式的计算公式都详细的描述一便，希望能够对大家理解图层的混合模式
	有所帮助，编写仓促，不足之处请多批评指正。


	混合模式可以将两个图层的色彩值紧密结合在一起，从而创造出大量的效果。在这些效果的背后实际是一些简单的数学公式在起作用。下面我将介绍photoshop cs2
	中所有混合模式的数学计算公式。另外还介绍了不透明度。下面所介绍的公式仅适用于RGB图像。对于Lab颜色图像而言，这些公式将不再适用。



	Opacity 不透明度

	C=d*A+(1-d)*B

	相对于不透明度而言，其反义就是透明度。这两个术语之间的关系就类似于正负之间的关系：100%的不透明度就是0%的透明度。该混合模式相对来说比较简单，在该混合模式下，
	如果两个图层的叠放顺序不一样，其结果也是不一样的（当然50%透明除外）。

	该公式中，A代表了上面图层像素的色彩值（A=像素值/255），d表示该层的透明度，B代表下面图层像素的色彩值（B=像素值/255），C代表了混合像素的色彩
	值（真实的结果像素值应该为255*C）。该公式也应用于层蒙板，在这种情况下，d代表了蒙板图层中给定位置像素的亮度，下同，不再叙述。



	Darken 变暗

	B<=A: C=B

	B>=A: C=A

	该模式通过比较上下层像素后取相对较暗的像素作为输出，注意，每个不同的颜色通道的像素都是独立的进行比较，色彩值相对较小的作为输出结果，
	下层表示叠放次序位于下面的那个图层，上层表示叠放次序位于上面的那个图层，下同，不再叙述。



	Lighten 变亮

	B<=A: C=A

	B>A: C=B

	该模式和前面的模式是相似，不同的是取色彩值较大的（也就是较亮的）作为输出结果。 



	Multiply 正片叠底

	C=A*B

	该效果将两层像素的标准色彩值（基于0..1之间）相乘后输出，其效果可以形容成：两个幻灯片叠加在一起然后放映，透射光需要分别通过这两个幻灯片，
	从而被削弱了两次。



	Screen 滤色

	C=1-(1-A)*(1-B)也可以写成 1-C=(1-A)*(1-B)

	该模式和上一个模式刚好相反，上下层像素的标准色彩值反相后相乘后输出，输出结果比两者的像素值都将要亮（就好像两台投影机分别对其中一个图层进行
	投影后，然后投射到同一个屏幕上）。从第二个公式中我们可以看出，如果两个图层反相后，采用Multiply模式混合，则将和对这两个图层采用Screen模式混合后反相的结果完全一样。



	Color Dodge 颜色减淡

	C=B/(1-A)

	该模式下，上层的亮度决定了下层的暴露程度。如果上层越亮，下层获取的光越多，也就是越亮。如果上层是纯黑色，也就是没有亮度，则根本不会影响下层。
	如果上层是纯白色，则下层除了像素为255的地方暴露外，其他地方全部为白色（也就是255，不暴露）。结果最黑的地方不会低于下层的像素值。



	Color Burn 颜色加深

	C=1-(1-B)/A

	该模式和上一个模式刚好相反。如果上层越暗，则下层获取的光越少，如果上层为全黑色，则下层越黑，如果上层为全白色，则根本不会影响下层。
	结果最亮的地方不会高于下层的像素值。



	Linear Dodge 线形减淡

	C=A+B

	将上下层的色彩值相加。结果将更亮。



	Linear Burn 线形加深

	C=A+B-1

	如果上下层的像素值之和小于255，输出结果将会是纯黑色。如果将上层反相，结果将是纯粹的数学减。



	Overlay 叠加

	B<=0.5: C=2*A*B

	B>0.5: C=1-2*(1-A)*(1-B)

	依据下层色彩值的不同，该模式可能是Multiply，也可能是Screen模式。

	上层决定了下层中间色调偏移的强度。如果上层为50%灰，则结果将完全为下层像素的值。如果上层比50%灰暗，则下层的中间色调的将向暗地方偏移，
	如果上层比50%灰亮，则下层的中间色调的将向亮地方偏移。对于上层比50%灰暗，下层中间色调以下的色带变窄（原来为0~2*0.4*0.5，现在为0~2*0.3*0.5），
	中间色调以上的色带变宽（原来为2*0.4*0.5~1，现在为2*0.3*0.5~1）。反之亦然。



	Hard Light 强光

	A<=0.5: C=2*A*B

	A>0.5: C=1-2*(1-A)*(1-B)

	该模式完全相对应于Overlay模式下，两个图层进行次序交换的情况。如过上层的颜色高于50%灰，则下层越亮，反之越暗。



	Soft Light 柔光

	A<=0.5: C=(2*A-1)*(B-B*B)+B

	A>0.5: C=(2*A-1)*(sqrt(B)-B)+B

	该模式类似上层以Gamma值范围为2.0到0.5的方式来调制下层的色彩值。结果将是一个非常柔和的组合。



	Vivid Light 亮光

	A<=0.5: C=1-(1-B)/2*A

	A>0.5: C=B/(2*(1-A))

	该模式非常强烈的增加了对比度，特别是在高亮和阴暗处。可以认为是阴暗处应用Color Burn和高亮处应用Color Dodge。



	Linear Light 线形光

	C=B+2*A-1

	相对于前一种模式而言，该模式增加的对比度要弱些。其类似于Linear Burn,只不过是加深了上层的影响力。



	Pin Light 点光

	B<2*A-1: C=2*A-1

	2*A-1<B<2*A: C=B

	B>2*A: C=2*A

	该模式结果就是导致中间调几乎是不变的下层，但是两边是Darken和Lighte年模式的组合。



	Hard Mix 实色混合

	A<1-B: C=0

	A>1-B: C=1

	该模式导致了最终结果仅包含6种基本颜色，每个通道要么就是0，要么就是255。



	Difference 差值

	C=|A-B|

	上下层色调的绝对值。该模式主要用于比较两个不同版本的图片。如果两者完全一样，则结果为全黑。



	Exclusion 排除

	C=A+B-2*A*B

	亮的图片区域将导致另一层的反相，很暗的区域则将导致另一层完全没有改变。


	Hue 色相

	HcScYc =HASBYB

	输出图像的色调为上层，饱和度和亮度保持为下层。对于灰色上层，结果为去色的下层。



	Saturation 饱和度

	HcScYc =HBSAYB

	输出图像的饱和度为上层，色调和亮度保持为下层。



	Color 颜色

	HcScYc =HASAYB

	输出图像的亮度为下层，色调和饱和度保持为上层。



	Luminosity 亮度

	HcScYc =HBSBYA

	输出图像的亮度为上层，色调和饱和度保持为下层。



	Dissolve 溶解

	该模式根本不是真正的溶解，因此并不是适合Dissolve这个称谓，其表现仅仅和Normal类似。其从上层中随机抽取一些像素作为透明，
	使其可以看到下层，随着上层透明度越低，可看到的下层区域越多。如果上层完全不透明，则效果和Normal不会有任何不同。
	******************************混合模式公式**************************************************************************************************/
	this.combine = THREE.MultiplyOperation;	//混合模式
	this.reflectivity = 1;	//反射率,默认为1
	this.refractionRatio = 0.98;	//折射率,默认为0.98

	this.fog = true;	//雾效,默认开启

	this.shading = THREE.SmoothShading;

	this.wireframe = false;			//以线框方式渲染几何体.默认为false
	this.wireframeLinewidth = 1;	//线框的宽度,默认初始化为1.

	/*******************************************linecap和linejoin属性详解****************************************
	lineCap 属性指定线段如何结束。只有绘制较宽线段时，它才有效。这个属性的合法值如下表所示。默认值是："round"。
		值				含义
	"butt"		这个默认值指定了线段应该没有线帽。线条的末点是平直的而且和线条的方向正交，这条线段在其端点之外没有扩展。
	"round"		这个值指定了线段应该带有一个半圆形的线帽，半圆的直径等于线段的宽度，并且线段在端点之外扩展了线段宽度的一半。
	"square"	这个值表示线段应该带有一个矩形线帽。这个值和 "butt" 一样，但是线段扩展了自己的宽度的一半。

	lineJoin 属性设置或返回所创建边角的类型，当两条线交汇时。
	注释：值 "miter" 受 miterLimit 属性的影响。
	默认值：	round
	值		描述
	bevel	创建斜角。
	round	创建圆角。
	miter	默认。创建尖角。
	********************************************linecap和linejoin属性详解****************************************/
	this.wireframeLinecap = 'round';	//线框的线段端点的样式,默认为round,和html的canvas里的属性一样也有"butt", "round", "square"
	this.wireframeLinejoin = 'round';	//线框的线段边角的类型，当两条线交汇时,默认为round,和html的canvas里的属性一样也有"round", "bevel", "miter"
										//TODO: 要给线框设置线型怎么办?

	this.vertexColors = THREE.NoColors;	//顶点颜色,默认初始化为THREE.NoColors.当然还可以有 THREE.VertexColors / THREE.FaceColors等选项,这里显示出了javascript的灵活性了.;

	this.skinning = false;		//定义材质是否使用蒙皮,默认初始化为false
	this.morphTargets = false;	//定义材质是否设定目标变形动画,默认为false
	this.morphNormals = false;	//定义是否反转(变换)法线,默认为false

	this.setValues( parameters );	//调用Material类的setValues方法,将参数parameters赋值给当前MeshLambertMaterial材质的属性.

};

/*************************************************************
****下面是MeshLambertMaterial对象的方法属性定义,继承自Material
*************************************************************/
THREE.MeshLambertMaterial.prototype = Object.create( THREE.Material.prototype );

/*clone方法
///clone方法克隆MeshLambertMaterial对象,
*/
///<summary>clone</summary>
///<param name ="material" type="MeshLambertMaterial">MeshLambertMaterial对象,可有可无.</param>
///<returns type="MeshLambertMaterial">返回克隆的MeshLambertMaterial对象</returns>	
THREE.MeshLambertMaterial.prototype.clone = function () {
	//以下是将材质的属性一一进行复制
	var material = new THREE.MeshLambertMaterial();

	THREE.Material.prototype.clone.call( this, material );

	material.color.copy( this.color );
	material.ambient.copy( this.ambient );
	material.emissive.copy( this.emissive );

	material.wrapAround = this.wrapAround;
	material.wrapRGB.copy( this.wrapRGB );

	material.map = this.map;

	material.lightMap = this.lightMap;

	material.specularMap = this.specularMap;

	material.alphaMap = this.alphaMap;

	material.envMap = this.envMap;
	material.combine = this.combine;
	material.reflectivity = this.reflectivity;
	material.refractionRatio = this.refractionRatio;

	material.fog = this.fog;

	material.shading = this.shading;

	material.wireframe = this.wireframe;
	material.wireframeLinewidth = this.wireframeLinewidth;
	material.wireframeLinecap = this.wireframeLinecap;
	material.wireframeLinejoin = this.wireframeLinejoin;

	material.vertexColors = this.vertexColors;

	material.skinning = this.skinning;
	material.morphTargets = this.morphTargets;
	material.morphNormals = this.morphNormals;

	return material; 	//返回克隆的MeshLambertMaterial对象

};
