/**
 * @author mrdoob / http://mrdoob.com/
 */
 /*
///AmbientLight方法根据设置灯光的颜属性color创建环境光.AmbientLight对象的功能函数采用
/// 定义构造的函数原型对象来实现.
/// TODO: AmbientLight类型灯光在这个版本内还没有实现阴影.???
/// Example:
/// 		var light = new THREE.AmbientLight(0x404040);
/// 		scene.add(light);
*/
///<summary>AmbientLight</summary>
///<param name ="color" type="THREE.Color">环境光灯光的颜色属性</param>
///<returns type="AmbientLight">返回PointLight,点光源.</returns>
THREE.AmbientLight = function ( color ) {

	THREE.Light.call( this, color );		//调用Light对象的call方法,将原本属于Light的方法交给当前对象AmbientLight来使用.

};
/**************************************************************************************
****下面是AmbientLight对象提供的功能函数定义,一部分通过prototype继承自Light方法
***************************************************************************************/
THREE.AmbientLight.prototype = Object.create( THREE.Light.prototype );	//AmbientLight对象从THREE.Light的原型继承所有属性方法

/*clone方法
///clone方法克隆AmbientLight对象
*/
///<summary>clone</summary>
///<returns type="AmbientLight">返回克隆的AmbientLight对象</returns>	
THREE.AmbientLight.prototype.clone = function () {

	var light = new THREE.AmbientLight();

	THREE.Light.prototype.clone.call( this, light );	//调用THREE.Light方法,克隆灯光对象

	return light;	//返回克隆的环境光对象

};
