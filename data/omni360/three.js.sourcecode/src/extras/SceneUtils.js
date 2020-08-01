/**
 * @author alteredq / http://alteredqualia.com/
 */

/**************************************************************
 *	SceneUtils scene对象的工具集
 **************************************************************/
THREE.SceneUtils = {
	/*
	///createMultiMaterialObject方法创建一种新的Objec3D对象,每个网格对象对应一种材质.
	///这里和一个网格的每个面使用Meshfacematerial 材质不同.这种方式适用于网格对象在线框和着色几种材质之间变换频繁.
	*/
	///<summary>createMultiMaterialObject</summary>
	///<param name ="geometry" type="Geometry">几何体对象.</param>
	///<param name ="materials" type="THREE.Material Array">材质对象的数组.</param>
	///<returns type="Object3d">返回Object3D对象</returns>	
	createMultiMaterialObject: function ( geometry, materials ) {

		var group = new THREE.Object3D();

		for ( var i = 0, l = materials.length; i < l; i ++ ) {

			group.add( new THREE.Mesh( geometry, materials[ i ] ) );

		}

		return group;	//返回Object3D对象

	},
	/*
	///detach方法将将子对象(参数child)从父对象中删除(参数parent),并重新将子对象添加到场景中.
	*/
	///<summary>detach</summary>
	///<param name ="child" type="Geometry">将要被附着到parent对象的子对象.</param>
	///<param name ="parent" type="Objec3d">父对象</param>
	///<param name ="scene" type="THREE.Scene">THREE.Scene场景.</param>
	///<returns type="Geometry">返回合并后的几何体对象</returns>	
	detach: function ( child, parent, scene ) {

		child.applyMatrix( parent.matrixWorld );  //子对象应用坐标变换
		parent.remove( child ); 	//将子对象(参数child)从父对象中删除(参数parent).
		scene.add( child ); //将子对象添加到场景中.其实是作为场景的子对象.

	},
	/*
	///attach方法将子对象(参数child)附着到场景(scene)内的父对象(参数parent)之内.
	*/
	///<summary>attach</summary>
	///<param name ="child" type="Geometry">将要被附着到parent对象的子对象.</param>
	///<param name ="scene" type="THREE.Scene">THREE.Scene场景.</param>
	///<param name ="parent" type="Objec3d">父对象</param>
	///<returns type="Geometry">返回合并后的几何体对象</returns>	
	attach: function ( child, scene, parent ) {

		var matrixWorldInverse = new THREE.Matrix4();
		matrixWorldInverse.getInverse( parent.matrixWorld ); //获得父对象的世界坐标的逆坐标
		child.applyMatrix( matrixWorldInverse ); 	//子对象应用坐标变换

		scene.remove( child );	//从场景内删除child对象.
		parent.add( child );	//调用add方法用来将对象(参数child),设置为父对象的子对象

	}

};
