/**
 * @author mrdoob / http://mrdoob.com/
 * @author greggman / http://games.greggman.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */
/*
///PerspectiveCamera方法根据 fov, aspect, near, far 生成透视投影相机.PerspectiveCamera对象的功能函数采用
/// 定义构造的函数原型对象来实现.
*/
///<summary>PerspectiveCamera</summary>
///<param name ="fov" type="Number">指明相机的可视角度,可选参数,如果未指定,初始化为50</param>
///<param name ="aspect" type="Number">指明相机可视范围的长宽比,可选参数,如果未指定,初始化为1</param>
///<param name ="near" type="Number">指明相对于深度剪切面的近的距离，必须为正数,可选参数,如果未指定,初始化为0.1</param>
///<param name ="far" type="Number">指明相对于深度剪切面的远的距离，必须为正数,可选参数,如果未指定,初始化为2000</param>
///<returns type="Matrix4">返回PerspectiveCamera,透视投影相机.</returns>
THREE.PerspectiveCamera = function ( fov, aspect, near, far ) {

	THREE.Camera.call( this );	//调用Camera对象的call方法,将原本属于Camera的方法交给当前对象PerspectiveCamera来使用.

	this.fov = fov !== undefined ? fov : 50;	//指明相机的可视角度,可选参数,如果未指定,初始化为50
	this.aspect = aspect !== undefined ? aspect : 1;	//指明相机可视范围的长宽比,可选参数,如果未指定,初始化为1
	this.near = near !== undefined ? near : 0.1;	//指明相对于深度剪切面的近的距离，必须为正数,可选参数,如果未指定,初始化为0.1
	this.far = far !== undefined ? far : 2000;	//指明相对于深度剪切面的近的距离，必须为正数,可选参数,如果未指定,初始化为2000

	this.updateProjectionMatrix();	//调用updateProjectionMatrix方法,更新相机的投影矩阵.

};
/**************************************************************************************
****下面是PerspectiveCamera对象提供的功能函数定义,一部分通过prototype继承自Camera方法
***************************************************************************************/
THREE.PerspectiveCamera.prototype = Object.create( THREE.Camera.prototype );



/*
///setLens方法根据 焦距 focalLength, 画幅大小 frameHeight 更新透视投影相机的视野.
*/
///<summary>setLens</summary>
///<param name ="focalLength" type="Number">焦距</param>
///<param name ="frameHeight" type="Number">画幅大小</param>
///<returns type="Matrix4">返回更新视野的透视投影相机.</returns>
/**
 * Uses Focal Length (in mm) to estimate and set FOV
 * 35mm (fullframe) camera is used if frame size is not specified;
  * 使用焦距(单位毫米)设置相机时,如果画幅大小没有指定,默认使用FOV(视野)35mm(全画幅)相机,
* Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
 */
THREE.PerspectiveCamera.prototype.setLens = function ( focalLength, frameHeight ) {

	if ( frameHeight === undefined ) frameHeight = 24;	//如果画幅大小没有指定,初始化为24,全画幅相机

	this.fov = 2 * THREE.Math.radToDeg( Math.atan( frameHeight / ( focalLength * 2 ) ) );	//更新透视投影相机的视野
	this.updateProjectionMatrix();		//更新投影矩阵

}

/*
///setViewOffset方法为一个大的平截头体设置视口偏移,这个方法在多显示器,多台机器,显示器矩阵上应用非常有效
*/
///<summary>setViewOffset</summary>
///<param name ="fullWidth" type="Number">一个超大的摄像机场景的总宽度</param>
///<param name ="fullHeight" type="Number">一个超大的摄像机场景的总高度</param>
///<param name ="x" type="Number">当前摄像机左上角点的x坐标在网格内的起始点</param>
///<param name ="y" type="Number">当前摄像机左上角点的y坐标在网格内的起始点</param>
///<param name ="width" type="Number">当前摄像机的宽度</param>
///<param name ="height" type="Number">当前摄像机的高度</param>
///<returns type="Matrix4">返回更新透视投影矩阵的透视投影相机.</returns>
/**
 * Sets an offset in a larger frustum. This is useful for multi-window or
 * multi-monitor/multi-machine setups.
 * 为一个大的平截头体设置视口偏移,这个方法在多显示器,多台机器,显示器矩阵上应用非常有效.
 *
 * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
 * the monitors are in grid like this
 * 比如,你有3x2 个显示器,每个显示器的分辨率是1920x1080,组成的显示器矩阵向下面的网格
 *
 *   +---+---+---+
 *   | A | B | C |
 *   +---+---+---+
 *   | D | E | F |
 *   +---+---+---+
 *
 * then for each monitor you would call it like this
 * 然后,你可以向下面这样为每台显示器调用setOffset()方法,让每个显示器显示画布的一部分.
 *
 *   var w = 1920;
 *   var h = 1080;
 *   var fullWidth = w * 3;
 *   var fullHeight = h * 2;
 *
 *   --A--
 *   camera.setOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
 *   --B--
 *   camera.setOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
 *   --C--
 *   camera.setOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
 *   --D--
 *   camera.setOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
 *   --E--
 *   camera.setOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
 *   --F--
 *   camera.setOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
 *
 *   Note there is no reason monitors have to be the same size or in a grid.
 *   注意,有可能,这些显示器不是同样的尺寸.所以你可以根据需要设置你想要的各种方式.
 */

THREE.PerspectiveCamera.prototype.setViewOffset = function ( fullWidth, fullHeight, x, y, width, height ) {

	this.fullWidth = fullWidth;			//一个超大的摄像机场景的总宽度
	this.fullHeight = fullHeight;		//一个超大的摄像机场景的总高度
	this.x = x;							//当前摄像机左上角点的x坐标在网格内的起始点
	this.y = y;						//当前摄像机左上角点的y坐标在网格内的起始点
	this.width = width;		//当前摄像机的宽度
	this.height = height;	//当前摄像机的高度

	this.updateProjectionMatrix();	//返回更新透视投影矩阵的透视投影相机

};


/*
///updateProjectionMatrix方法返回透视投影相机的可视边界的矩阵.当相机的参数被更改后,必须调用此参数.
*/
///<summary>updateProjectionMatrix</summary>
///<returns type="OrthographicCamera">返回新的OrthographicCamera对象</returns>
THREE.PerspectiveCamera.prototype.updateProjectionMatrix = function () {

	if ( this.fullWidth ) {

		var aspect = this.fullWidth / this.fullHeight;
		var top = Math.tan( THREE.Math.degToRad( this.fov * 0.5 ) ) * this.near;
		var bottom = - top;
		var left = aspect * bottom;
		var right = aspect * top;
		var width = Math.abs( right - left );
		var height = Math.abs( top - bottom );

		this.projectionMatrix.makeFrustum(
			left + this.x * width / this.fullWidth,
			left + ( this.x + this.width ) * width / this.fullWidth,
			top - ( this.y + this.height ) * height / this.fullHeight,
			top - this.y * height / this.fullHeight,
			this.near,
			this.far
		);

	} else {

		this.projectionMatrix.makePerspective( this.fov, this.aspect, this.near, this.far );

	}

};

/*clone方法
///clone方法克隆PerspectiveCamera对象
*/
///<summary>clone</summary>
///<returns type="PerspectiveCamera">返回克隆的PerspectiveCamera对象</returns>	
THREE.PerspectiveCamera.prototype.clone = function () {

	var camera = new THREE.PerspectiveCamera();

	THREE.Camera.prototype.clone.call( this, camera );	//调用THREE.Camera.Clone(camera)方法,克隆透视投影相机对象

	camera.fov = this.fov;			//将透视投影相机的 fov 属性值复制
	camera.aspect = this.aspect;			//将透视投影相机的 aspect 属性值复制
	camera.near = this.near;			//将透视投影相机的 near 属性值复制
	camera.far = this.far;			//将透视投影相机的 far 属性值复制

	return camera;	//返回克隆的PerspectiveCamera对象
};
