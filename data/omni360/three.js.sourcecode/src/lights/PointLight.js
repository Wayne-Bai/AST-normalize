/**
 * @author mrdoob / http://mrdoob.com/
 */
 /*
///PointLight方法根据设置灯光的颜属性color, 强度属性intensity,距离属性 distance 创建点光源.PointLight对象的功能函数采用
/// 定义构造的函数原型对象来实现.
/// TODO: PointLight类型灯光在这个版本内还没有实现阴影.???
/// Example:
/// 		var light = new THREE.PointLight(0xff0000,1,100);	//创建灯光对象
/// 		light.position.set(50,50,30);	//设置位置
///			scene.add(lignt);	//加入场景
*/
///<summary>PointLight</summary>
///<param name ="color" type="THREE.Color">灯光的颜色属性</param>
///<param name ="intensity" type="Number">灯光的强度,默认是1</param>
///<param name ="distance" type="Number">灯光的长度属性,从灯光的position位置,开始衰减,衰减到distance的长度,默认是0</param>
///<returns type="PointLight">返回PointLight,点光源.</returns>
THREE.PointLight = function ( color, intensity, distance ) {

	THREE.Light.call( this, color );		//调用Light对象的call方法,将原本属于Light的方法交给当前对象PointLight来使用.

	this.intensity = ( intensity !== undefined ) ? intensity : 1;	//灯光的颜色属性,如果不指定,初始化为1.
	this.distance = ( distance !== undefined ) ? distance : 0;		//灯光的强度,如果不指定,初始化为0.

};
/**************************************************************************************
****下面是PointLight对象提供的功能函数定义,一部分通过prototype继承自Light方法
***************************************************************************************/
THREE.PointLight.prototype = Object.create( THREE.Light.prototype );	//PointLight对象从THREE.Light的原型继承所有属性方法

/*clone方法
///clone方法克隆PointLight对象
*/
///<summary>clone</summary>
///<returns type="PointLight">返回克隆的PointLight对象</returns>	
THREE.PointLight.prototype.clone = function () {

	var light = new THREE.PointLight();	

	THREE.Light.prototype.clone.call( this, light );	//调用THREE.Light.clone方法,克隆扥光对象

	light.intensity = this.intensity;	//复制灯光的强度属性
	light.distance = this.distance;		//复制灯光的距离属性.

	return light;	//返回克隆的点光源的对象.
};
