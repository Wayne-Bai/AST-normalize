/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */
/*
///FogExp2对象的构造函数.用来在场景内创建指数雾效,指数雾效是雾效浓度递增根据指数(参数density)设定,Fog对象的功能函数采用
///定义构造的函数原型对象来实现.
///
///	用法: var fog = new THREE.FogExp2(THREE.colorKeywords.cyan,0.3);
///	在场景中添加指数雾效,雾效递增的质素是0.3,雾效的颜色是cyan,
*/
///<summary>FogExp2</summary>
///<param name ="color" type="THREE.Color">雾效的颜色属性,如果雾效颜色设置成黑色,远处的对象将被渲染成黑色</param>
///<param name ="density" type="number">雾效强度递增指数属性,可选参数,默认是0.00025</param>
///<returns type="FogExp2">返回新的雾效对象</returns>
THREE.FogExp2 = function ( color, density ) {

	this.name = '';	//雾效对象属性名,可有可无

	this.color = new THREE.Color( color );	//雾效的颜色属性
	this.density = ( density !== undefined ) ? density : 0.00025;	//雾效强度递增指数属性,可选参数,默认是0.00025

};

/****************************************
****下面是FogExp2对象提供的功能函数.
****************************************/

/*clone方法
///clone方法克隆一个雾效对象.
*/
///<summary>clone</summary>
///<returns type="FogExp2">返回克隆的指数雾效对象.</returns>
THREE.FogExp2.prototype.clone = function () {

	// return new THREE.FogExp2( this.color.getHex(), this.density );	/返回克隆的指数雾效对象

};
