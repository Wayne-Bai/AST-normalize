/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
/*
///Light是场景中由灯光对象的抽象基类,通过原型的方式继承自Object3D,在WebGL的三维空间中,存在点光源PointLight和聚光灯SpotLight两种类型,还有作为点光源的一种特例,
///平行光DirectionLight,和环境光AmbientLight.在3D场景中,基本上是这几种光源的组合,创建各种各样的效果.
*/
///<summary>Light</summary>
///<param name ="color" type="THREE.Color">颜色值</param>
///<returns type="Light">返回灯光对象</returns>
THREE.Light = function ( color ) {

	THREE.Object3D.call( this );	//调用Object3D对象的call方法,将原本属于Object3D的方法交给当前对象Light来使用.

	this.color = new THREE.Color( color );	//设置灯光的颜色属性

};
/*************************************************
****下面是Light对象的方法属性定义,继承自Object3D
**************************************************/
THREE.Light.prototype = Object.create( THREE.Object3D.prototype );	//Light对象从THREE.Objec3D的原型继承所有属性方法

/*clone方法
///clone方法克隆Camera对象,
*/
///<summary>clone</summary>
///<param name ="light" type="Light">Light对象</param>
///<returns type="Light">返回克隆的Light对象</returns>
THREE.Light.prototype.clone = function ( light ) {

	if ( light === undefined ) light = new THREE.Light();

	THREE.Object3D.prototype.clone.call( this, light );	//调用THREE.Object3D.Clone(light)方法,克隆灯光对象

	light.color.copy( this.color );	//复制灯光的颜色属性

	return light;	//返回灯光的克隆对象

};