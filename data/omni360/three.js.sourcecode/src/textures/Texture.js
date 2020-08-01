/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 */
/*
///Texture类用来为面创建一个反射折射或者纹理贴图对象
/// 这个类是最重要的属性是image，这是一个JavaScript Image类型对象。传入的第一个参数就是该对象，
///后面的对象都是可选的，如果缺省就会填充默认值，而且往往都是填充默认值。
///属性magFileter和minFileter指定纹理在放大和缩小时的过滤方式：最临近点、双线性内插等。
///从url中生成一个texture，需要调用Three.ImageUtils.loadTexture(paras)，
///该函数返回一个texture类型对象。在函数内部又调用了THREE.ImageLoader.load(paras)函数，这个函数内部又调用了THREE.Texture()构造函数，生成纹理。
///
///
///Example
		// load a texture, set wrap mode to repeat 

		var texture = THREE.ImageUtils.loadTexture( "textures/water.jpg" ); 
		texture.wrapS = THREE.RepeatWrapping; 
		texture.wrapT = THREE.RepeatWrapping; 
		texture.repeat.set( 4, 4 );

///
*/
///<summary>Texture</summary>
///<param name ="image" type="Image">JavaScript Image类型对象</param>
///<param name ="mapping" type="Number">映射模式,可用常量参考下面注释</param>
///<param name ="wrapS" type="Number">S方向覆盖模式,可用常量参考下面注释</param>
///<param name ="wrapT" type="Number">T方向覆盖模式,可用常量参考下面注释</param>
///<param name ="magFilter" type="Number">纹理在放大时的过滤方式,可用常量参考下面注释</param>
///<param name ="minFilter" type="Number">纹理在缩小时的过滤方式,可用常量参考下面注释</param>
///<param name ="format" type="Number">像素数据的颜色格式,可用常量参考下面注释</param>
///<param name ="type" type="Number">数据类型,默认为不带符号8位整形值</param>
///<param name ="anisotropy" type="Float">各向异性,取值范围0.0-1.0,经常用来通过这个值,产生不同的表面效果,木材和金属都发光,但是发光的特点是有区别的.</param>
///<returns type="Texture">返回创建的纹理对象</returns>
THREE.Texture = function ( image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

	this.id = THREE.TextureIdCount ++;		//纹理属性id
	this.uuid = THREE.Math.generateUUID();	//纹理uuid(通用唯一标识码)属性

	this.name = '';		//纹理名称属性,可有可无

	this.image = image !== undefined ? image : THREE.Texture.DEFAULT_IMAGE;		//纹理的图片,最重要的属性是image，这是一个JavaScript Image类型对象。

	/* 
		Mipmap
	    在三维世界中,显示一张图的大小与摄象机的位置有关,近的地方,图片实际象素就大一些,远的地方图片实际象
	   素就会小一些,就要进行一些压缩,例如一张64*64的图,在近处,显示出来可能是50*50,在远处可能显示出来是20*20.
       如果只限于简单的支掉某些像素,将会使缩小后的图片损失很多细节,图片变得很粗糙,因此,图形学有很多复杂的方
       法来处理缩小图片的问题,使得缩小后的图片依然清晰,然而,这些计算都会耗费一定的时间.

       Mipmap纹理技术是目前解决纹理分辨率与视点距离关系的最有效途径,它会先将图片压缩成很多逐渐缩小的图片,
       例如一张64*64的图片,会产生64*64,32*32,16*16,8*8,4*4,2*2,1*1的7张图片,当屏幕上需要绘制像素点为20*20 时，
       程序只是利用 32*32 和 16*16 这两张图片来计算出即将显示为 20*20 大小的一个图片，这比单独利用 32*32 的
       那张原始片计算出来的图片效果要好得多，速度也更快.

       参考:http://zh.wikipedia.org/wiki/Mipmap
       参考:http://staff.cs.psu.ac.th/iew/cs344-481/p1-williams.pdf
       参考:http://blog.csdn.net/linber214/article/details/3342051
    */

	this.mipmaps = []; //存放mipmaps的属性数组


	this.mapping = mapping !== undefined ? mapping : THREE.Texture.DEFAULT_MAPPING;	//映射模式,有THREE.UVMapping平展映射,THREE.CubeReflectionMapping 立方体反射映射,THREE.CubeRefractionMapping立方体折射映射,THREE.SphericalReflectionMapping球面反射映射,THREE.SphericalRefractionMapping球面折射映射.
	//关于纹理s方向,t方向参考http://blog.csdn.net/kylaoshu364/article/details/5608851
	this.wrapS = wrapS !== undefined ? wrapS : THREE.ClampToEdgeWrapping; //S方向覆盖模式,默认为THREE.ClampToEdgeWrapping,(夹取),超过1.0的值被固定为1.0。超过1.0的其它地方的纹理，沿用最后像素的纹理。用于当叠加过滤时，需要从0.0到1.0精确覆盖且没有模糊边界的纹理。
																		  //还有THREE.RepeatWrapping(重复)和THREE.MirroredRepeatWrapping(镜像)
	this.wrapT = wrapT !== undefined ? wrapT : THREE.ClampToEdgeWrapping; //T方向覆盖模式,默认为THREE.ClampToEdgeWrapping,(夹取),超过1.0的值被固定为1.0。超过1.0的其它地方的纹理，沿用最后像素的纹理。用于当叠加过滤时，需要从0.0到1.0精确覆盖且没有模糊边界的纹理。
																		  //还有THREE.RepeatWrapping(重复)和THREE.MirroredRepeatWrapping(镜像)

    /*
    	纹素
			纹素（英语：Texel，即texture element或texture pixel的合成字）是纹理元素的简称，它是计算机图形纹理空间中的基本单元[1]。如同图像是由像素排列而成，纹理是由纹素排列表示的。
		纹素可以由图像范围来定义，其范围可以通过一些简单的方法来获取，比如阀值。沃罗诺伊分布可以用来描述纹素之间的空间关系。这就意味着我们可以通过将纹素与其周围的纹素图心的连线的垂直平分线将整个纹理分割成连续的多边形。结果就是每一个纹素图心都会有一个沃罗诺伊多边形将其圈起来。
		在对三维表面铺设纹理的时候，通过纹理映射技术将纹素映射到恰当的输出图像像素上。在当今的计算机上，这个过程主要是由图形卡完成的。
		纹理工序起始于空间中的某一位置。这个位置可以是在世界坐标系中，但是一般情况下会设定在物体坐标系中。这样纹理会随着物体运动。然后通过投射的方式将其位置（坐标）从三维矢量值转化为0到1范围的二维矢量值（即uv）。再将这个二维矢量值与纹理的分辨率相乘从而获得纹素的位置。
		当所需纹素的位置不是整数的时候，需要使用纹理滤镜进行处理。

	// 纹理在放大或缩小时的过滤方式,过滤方式,有THREE.NearestFilter在纹理基层上执行最邻近过滤,
		//THREE.NearestMipMapNearestFilter在mip层之间执行线性插补，并执行最临近的过滤,
		//THREE.NearestMipMapLinearFilter选择最临近的mip层，并执行最临近的过滤,
		//THREE.LinearFilter在纹理基层上执行线性过滤
		//THREE.LinearMipMapNearestFilter选择最临近的mip层，并执行线性过滤,
		//THREE.LinearMipMapLinearFilter在mip层之间执行线性插补，并执行线性过滤

	参考:http://blog.csdn.net/kkk328/article/details/7055934
	参考:http://xiaxveliang.blog.163.com/blog/static/297080342013467552467/	

	*/

	this.magFilter = magFilter !== undefined ? magFilter : THREE.LinearFilter;	//纹理在放大时的过滤方式,THREE.LinearFilter在纹理基层上执行线性过滤
	this.minFilter = minFilter !== undefined ? minFilter : THREE.LinearMipMapLinearFilter;	//纹理在缩小时的过滤方式,THREE.LinearMipMapNearestFilter选择最临近的mip层，并执行线性过滤

	this.anisotropy = anisotropy !== undefined ? anisotropy : 1;	//各向异性,取值范围0.0-1.0,经常用来通过这个值,产生不同的表面效果,木材和金属都发光,但是发光的特点是有区别的.
	
	/*************************************************************************
	参数 format 定义了图像数据数组 texels 中的格式。可以取值如下：
	图像数据数组 texels 格式 格式 	注解
	GL_COLOR_INDEX 	颜色索引值
	GL_DEPTH_COMPONENT 	深度值
	GL_RED 	红色像素值
	GL_GREEN 	绿色像素值
	GL_BLUE 	蓝色像素值
	GL_ALPHA 	Alpha 值
	GL_RGB 	Red, Green, Blue 三原色值
	GL_RGBA 	Red, Green, Blue 和 Alpha 值
	GL_BGR 	Blue, Green, Red 值
	GL_BGRA 	Blue, Green, Red 和 Alpha 值
	GL_LUMINANCE 	灰度值
	GL_LUMINANCE_ALPHA 	灰度值和 Alpha 值
	*************************************************************************/
	this.format = format !== undefined ? format : THREE.RGBAFormat;		//像素数据的颜色格式, 默认为THREE.RGBAFormat,还有以下可选参数
																		//THREE.AlphaFormat = 1019;	//GL_ALPHA 	Alpha 值
																		//THREE.RGBFormat = 1020;		//Red, Green, Blue 三原色值
																		//THREE.RGBAFormat = 1021;	//Red, Green, Blue 和 Alpha 值
																		//THREE.LuminanceFormat = 1022;	//灰度值
																		//THREE.LuminanceAlphaFormat = 1023;	//灰度值和 Alpha 值


	/**************************************************************************************
	参数 type 定义了图像数据数组 texels 中的数据类型。可取值如下
	图像数据数组 texels 中数据类型 数据类型 	注解
	GL_BITMAP 	一位(0或1)
	GL_BYTE 	带符号8位整形值(一个字节)
	GL_UNSIGNED_BYTE 	不带符号8位整形值(一个字节)
	GL_SHORT 	带符号16位整形值(2个字节)
	GL_UNSIGNED_SHORT 	不带符号16未整形值(2个字节)
	GL_INT 	带符号32位整形值(4个字节)
	GL_UNSIGNED_INT 	不带符号32位整形值(4个字节)
	GL_FLOAT 	单精度浮点型(4个字节)
	GL_UNSIGNED_BYTE_3_3_2 	压缩到不带符号8位整形：R3,G3,B2
	GL_UNSIGNED_BYTE_2__3_REV 	压缩到不带符号8位整形：B2,G3,R3
	GL_UNSIGNED_SHORT_5_6_5 	压缩到不带符号16位整形：R5,G6,B5
	GL_UNSIGNED_SHORT_5_6_5_REV 	压缩到不带符号16位整形：B5,G6,R5
	GL_UNSIGNED_SHORT_4_4_4_4 	压缩到不带符号16位整形:R4,G4,B4,A4
	GL_UNSIGNED_SHORT_4_4_4_4_REV 	压缩到不带符号16位整形:A4,B4,G4,R4
	GL_UNSIGNED_SHORT_5_5_5_1 	压缩到不带符号16位整形：R5,G5,B5,A1
	GL_UNSIGNED_SHORT_1_5_5_5_REV 	压缩到不带符号16位整形：A1,B5,G5,R5
	GL_UNSIGNED_INT_8_8_8_8 	压缩到不带符号32位整形：R8,G8,B8,A8
	GL_UNSIGNED_INT_8_8_8_8_REV 	压缩到不带符号32位整形：A8,B8,G8,R8
	GL_UNSIGNED_INT_10_10_10_2 	压缩到32位整形：R10,G10,B10,A2
	GL_UNSIGNED_INT_2_10_10_10_REV 	压缩到32位整形：A2,B10,G10,R10

	你可能会注意到有压缩类型， 先看看 GL_UNSIGNED_BYTE_3_3_2, 所有的 red, green 和 blue 被组合成一个不带符号的8位整形中，
	在 GL_UNSIGNED_SHORT_4_4_4_4 中是把 red, green , blue 和 alpha 值打包成一个不带符号的 short 类型。
	*************************************************************************************************/
	/*******************************************S3TC压缩纹理格式***************************************************************************************************
	参考:http://www.opengpu.org/forum.php?mod=viewthread&tid=1010
	S3TC=DXTC

	使用S3TC格式存储的压缩纹理是以4X4的纹理单元块(texel blocks)为基本单位存储的，每纹理单元块(texel blocks)有64bit或者128bit的纹理数据(texel data)。
	这样就要求每张贴图长度和宽度应该是4的倍数。图像如同一般的做法按照行列顺序存放这些4X4的纹理单元块(texel blocks)，每个texel blocks被看成是一个图像的“像素”。
	对于那些长度不为4的倍数的贴图，多出来的那些纹理单元在压缩的时候都不会被放到图像中。(另外一种说法是不足4的会被补上空位按4处理，Nvidia的Photoshop DDS插件
	不允许这样的图像被存储为DXT格式)

	对于一个长度为w，宽为h，并且块大小为blocksize的图像，它的大小为(用字节计算)
	ceil(w/4) * ceil(h/4) * blocksize 

	在解码一个S3TC图像的时候，可以通过下面的式子得到一个纹理单元(x,y)所位于的块的地址(用字节计算)
	blocksize * (ceil(w/4) * floor(y/3) + floor(x/4))  

	通过纹理单元(x,y)获得它所处于的块的下标:
	(x % 4 , y % 4)


	有4种不同的S3TC图像格式:

	1.COMPRESSED_RGB_S3TC_DXT1_EXT

	每个4X4的纹理单元块包含8个字节的RGB数据，也就是说每个图像块被编码为顺序的8个字节(64bit)，按照地址的顺序，它们分别是：
	        c0_lo,c0_hi,
	        c1_lo,c1_hi,
	        bits_0,bits_1,bits_2,bits_3

	块的8个字节被用来表达3个量：
	        color0 = c0_lo + c0_hi * 256
	        color1 = c1_lo + c1_hi * 256
	        bits = bits_0 + 256 * (bits_1 + 256 * (bits_2 + 256 * bits_3))
	color0和color1是16位的无符号整数，用来表达颜色，格式是RGB - UNSIGNED_SHORT_5_6_5。分别用RGB0和RGB1来表示
	bits是一个32位的无符号整数，从bits可以求出位于(x,y)的纹理单元的2位控制码:(x,y介于0-3之间)
	code(x,y) = bits[2 * (4 * y + x) + 1..2 * (4 * y + x) + 0]   即，2 * (4 * y + x) + 1位和2 * (4 * y + x)位
	bits的第31位是高位，第0位是低位

	这样可以求出位于(x,y)的纹理单元的RGB值:
	         RGB0,                         if color0 > color1 and code(x,y) == 0
	         RGB1,                         if color0 > color1 and code(x,y) == 1
	         (2*RGB0+RGB1)/3,         if color0 > color1 and code(x,y) == 2
	         (RGB0+2*RGB1)/3,         if color0 > color1 and code(x,y) == 3

	         RGB0,                         if color0 <= color1 and code(x,y) == 0
	         RGB1,                         if color0 <= color1 and code(x,y) == 1
	         (RGB0+RGB1)/2,         if color0 <= color1 and code(x,y) == 2
	         BLACK,                         if color0 <= color1 and code(x,y) == 3
	这些算术运算都是矢量运算，分别对各个分量R,G,B进行计算。BLACK=RGB(0,0,0)

	这种格式的S3TC图像不含有Alpha，所以整个图像都是不透明的



	2.COMPRESSED_RGBA_S3TC_DXT1_EXT

	每个4*4块包含8字节的RGB颜色和最小限度的Alpha透明度数据，颜色数据的提取方式和COMPRESSED_RGB_S3TC_DXT1_EXT是完全一样的，区别在于Alpha数据:
	        对于(x,y)处纹理单元的Alpha值，计算方式如下:
	         0.0,         if color0 <= color1 and code(x,y) == 3
	         1.0,         otherwise

	注意：
	首先，把一个RGBA图像压缩成为只含有1位Alpha的压缩格式，所有Alpha<0.5的像素的Alpha值被置为0.0，而Alpha>=0.5的像素的Alpha值被置为1.0. 
	而把一个RGBA图像压缩成为COMPRESSED_RGBA_S3TC_DXT1_EXT格式的时候。
	其次，如果某个纹理单元最终的Alpha为0.0，那么此纹理单元的R,G,B颜色值都将被置为0. 
	最后，对于是用此格式的应用，必须遵守这个规则。另外，当一个通用的内部格式被指定后，也许可以使用COMPRESSED_RGB_S3TC_DXT1_EXT格式，
	但不允许使用COMPRESSED_RGBA_S3TC_DXT1_EXT(应该跟OpenGL有关系)



	3.COMPRESSED_RGBA_S3TC_DXT3_EXT

	每个4*4块中包含64bit的未压缩Alpha数据和64bit的RGB颜色数据，其中颜色数据按照和COMPRESSED_RGB_S3TC_DXT1_EXT一样的方式编码，
	唯一的区别在于2位控制码被以不明显的方式编码，换句话说，就像知道Color0 > Color1，而不需要知道Color0和Color1的具体值。

	每个块的纹理单元的Alpha值被顺次编码为8个字节:
	a0, a1, a2, a3, a4, a5, a6, a7

	通过这8个字节可以得到一个64位的无符号整数:
	alpha = a0 + 256 * (a1 + 256 * (a2 + 256 * (a3 + 256 * (a4 + 256 * (a5 + 256 * (a6 + 256 * a7))))))
	高位是63位，低位是0位

	通过这个alpha就可以获得位于(x,y)处纹理单元的Alpha值
	alpha(x,y) = bits[4*(4*y+x)+3..4*(4*y+x)+0]

	4位数字所能表示的最大值是15，所以折算到[0.0,1.0]，Alpha = alpha(x,y) / 15



	4.COMPRESSED_RGBA_S3TC_DXT5_EXT

	每个4*4块中包含64bit的压缩过的Alpha数据和64bit的RGB颜色数据，颜色数据部分压缩方式和COMPRESSED_RGBA_S3TC_DXT3_EXT完全一致。

	Alpha数据是8个字节的压缩数据，这8个字节:
	alpha0, alpha1, bits_0, bits_1, bits_2, bits_3, bits_4, bits_5

	其中alpha0和alpha1为unsigned char类型数据，转化为实际的Alpha值需要乘上 1 / 255.0

	其他的6个数字bits_N，则可以被解码成为一个48位的无符号整数
	bits = bits_0 + 256 * (bits_1 + 256 * (bits_2 + 256 * (bits_3 + 256 * (bits_4 + 256 * bits_5))))

	通过bits(高位47低位0)，可以求得位于(x,y)纹理单元的3位控制码:
	code(x,y) = bits[3*(4*y+x)+1..3*(4*y+x)+0]
	根据bits、code(x,y)、alpha0以及alpha1就可以求得(x,y)处纹理单元的Alpha值:
	         alpha0,                          code(x,y) == 0
	         alpha1,                          code(x,y) == 1
	         (6*alpha0 + 1*alpha1)/7,         alpha0 > alpha1 and code(x,y) == 2
	         (5*alpha0 + 2*alpha1)/7,         alpha0 > alpha1 and code(x,y) == 3
	         (4*alpha0 + 3*alpha1)/7,         alpha0 > alpha1 and code(x,y) == 4
	         (3*alpha0 + 4*alpha1)/7,         alpha0 > alpha1 and code(x,y) == 5
	         (2*alpha0 + 5*alpha1)/7,         alpha0 > alpha1 and code(x,y) == 6
	         (1*alpha0 + 6*alpha1)/7,         alpha0 > alpha1 and code(x,y) == 7
	         (4*alpha0 + 1*alpha1)/5,         alpha0 <= alpha1 and code(x,y) == 2
	         (3*alpha0 + 2*alpha1)/5,         alpha0 <= alpha1 and code(x,y) == 3
	         (2*alpha0 + 3*alpha1)/5,         alpha0 <= alpha1 and code(x,y) == 4
	         (1*alpha0 + 4*alpha1)/5,         alpha0 <= alpha1 and code(x,y) == 5
	         0.0,                             alpha0 <= alpha1 and code(x,y) == 6
	         1.0,                             alpha0 <= alpha1 and code(x,y) == 7

	*******************************************S3TC压缩纹理格式****************************************************************************************************/
	this.type = type !== undefined ? type : THREE.UnsignedByteType;	//数据类型,默认为不带符号8位整形值(一个字节)THREE.UnsignedByteType,还有以下可选参数还支持S3TC纹理压缩格式.
																	//THREE.UnsignedByteType = 1009;		//不带符号8位整形值(一个字节)
																	//THREE.ByteType = 1010;				//带符号8位整形值(一个字节)
																	//THREE.ShortType = 1011;				//带符号16位整形值(2个字节)
																	//THREE.UnsignedShortType = 1012;		//不带符号16未整形值(2个字节)
																	//THREE.IntType = 1013;				//带符号32位整形值(4个字节)
																	//THREE.UnsignedIntType = 1014;		//不带符号32位整形值(4个字节)
																	//THREE.FloatType = 1015;				//单精度浮点型(4个字节)
																	//THREE.UnsignedByteType = 1009;	//不带符号8位整形值(一个字节)
																	//THREE.UnsignedShort4444Type = 1016;	//压缩到不带符号16位整形:R4,G4,B4,A4
																	//THREE.UnsignedShort5551Type = 1017;	//压缩到不带符号16位整形：R5,G5,B5,A1
																	//THREE.UnsignedShort565Type = 1018;	//压缩到不带符号16位整形：R5,G6,B5
																	// THREE.RGB_S3TC_DXT1_Format = 2001;	//不带alpha通道的压缩颜色格式
																	// THREE.RGBA_S3TC_DXT1_Format = 2002;	//只含有1位alpha通道的压缩颜色格式
																	// THREE.RGBA_S3TC_DXT3_Format = 2003;	//含有类为控制码alpha通道的压缩颜色格式
																	// THREE.RGBA_S3TC_DXT5_Format = 2004;	//含有8个字节的alpha通道的压缩颜色格式

	this.offset = new THREE.Vector2( 0, 0 );	//偏移值
	this.repeat = new THREE.Vector2( 1, 1 );	//重复值

	this.generateMipmaps = true;		//是否生成Mipmaps,默认为true
	this.premultiplyAlpha = false;		//预乘Alpha值,如果设置为true,纹素的rgb值会先乘以alpha值,然后在存储.
	this.flipY = true;					//文理是否需要垂直翻转,默认为false
	this.unpackAlignment = 4; // valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)
							  // 默认值是4。指定用于在内存中的每个像素行开始校准要求。
							  // 允许的值是1（字节对齐），2（行对齐，偶数字节），4（对齐），和8（行开始在双字的边界）。更多信息见glpixelstorei。
							  //http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml

	this._needsUpdate = false;	//当设置为true时,标记文理已经更新.
	this.onUpdate = null;	//用于指定回调函数,当文理更新时,执行回调函数.
	//TODO: this.onUpdate用法有时间试验一下

};

THREE.Texture.DEFAULT_IMAGE = undefined;	//默认纹理图片
THREE.Texture.DEFAULT_MAPPING = new THREE.UVMapping();	//默认纹理贴图映射方式.

/****************************************
****下面是Texture对象提供的功能函数.
****************************************/
THREE.Texture.prototype = {

	constructor: THREE.Texture,	//构造器,返回对创建此对象的Texture函数的引用

	/*
	///get needsUpdate 方法用来获得纹理对象是否需要更新标记的值
	///NOTE: get needsUpdate()的用法是Quaternion.prototype.needsUpdate,这种用法在除ie浏览器以外的浏览器上可以使用.
	*/
	///<summary>get needsUpdate</summary>
	///<returns type="Boolean">返回纹理对象是否需要更新标记的值</returns>
	get needsUpdate () {	//

		return this._needsUpdate;

	},

	/*
	///get needsUpdate 方法用来通过设置纹理对象是否需要更新标记的值(参数value),跟新纹理对象.
	///NOTE: get needsUpdate()的用法是Quaternion.prototype.needsUpdate,这种用法在除ie浏览器以外的浏览器上可以使用.
	*/
	///<summary>get needsUpdate</summary>
	///<param name ="value" type="Boolean">true 或者 false</param>
	///<returns type="Texture">返回更新后的纹理对象.</returns>
	set needsUpdate ( value ) {

		if ( value === true ) this.update();	//更新纹理对象

		this._needsUpdate = value;

	},

	/*clone方法
	///clone方法克隆一个纹理对象.
	*/
	///<summary>clone</summary>
	///<param name ="texture" type="Texture">接受结果的纹理对象</param>
	///<returns type="Texture">返回纹理对象</returns>	
	clone: function ( texture ) {

		if ( texture === undefined ) texture = new THREE.Texture();

		texture.image = this.image;
		texture.mipmaps = this.mipmaps.slice( 0 );

		texture.mapping = this.mapping;

		texture.wrapS = this.wrapS;
		texture.wrapT = this.wrapT;

		texture.magFilter = this.magFilter;
		texture.minFilter = this.minFilter;

		texture.anisotropy = this.anisotropy;

		texture.format = this.format;
		texture.type = this.type;

		texture.offset.copy( this.offset );
		texture.repeat.copy( this.repeat );

		texture.generateMipmaps = this.generateMipmaps;
		texture.premultiplyAlpha = this.premultiplyAlpha;
		texture.flipY = this.flipY;
		texture.unpackAlignment = this.unpackAlignment;

		return texture;	//返回纹理对象

	},

	/*update方法
	///update方法更新纹理对象
	*/
	///<summary>update</summary>
	update: function () {

		this.dispatchEvent( { type: 'update' } );

	},
	/*dispose方法
	///dispose方法从内存中删除对象,释放资源.
	///NOTE: 当删除纹理对象,不要忘记调用这个方法,否则会导致内存泄露.
	*/
	///<summary>dispose</summary>
	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

};
///EventDispatcher方法应用到当前Texture对象.
THREE.EventDispatcher.prototype.apply( THREE.Texture.prototype );
///设置全局的Texture对象计数器.
THREE.TextureIdCount = 0;
