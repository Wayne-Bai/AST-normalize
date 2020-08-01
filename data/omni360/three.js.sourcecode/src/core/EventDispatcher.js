/**
 * https://github.com/mrdoob/eventdispatcher.js/
 */
/*
///EventDispatcher可调度事件的所有运行时类的基类.用来管理侦听函数,被嵌入Object3D对象之上.当Object3D发生事件时,这个方法就会自动被触发.
///可以通过调用调度该事件的对象的 addEventListener() 方法来注册函数以处理运行时事件。
*/
///<summary>EventDispatcher</summary>
THREE.EventDispatcher = function () {}

/****************************************
****下面是Vector4对象提供的功能函数.
****************************************/

THREE.EventDispatcher.prototype = {

	constructor: THREE.EventDispatcher,	//构造器,返回对创建此对象EventDispatcher函数的引用.

	/*
	///apply方法将当前基类绑定到参数Object对象之上,将基类的方法添加到object对象内.
	*/
	///<summary>apply</summary>
	///<param name ="object" type="Object">绑定事件分发功能的对象</param>
	apply: function ( object ) {

		object.addEventListener = THREE.EventDispatcher.prototype.addEventListener;		//为object添加addEventListener()方法.
		object.hasEventListener = THREE.EventDispatcher.prototype.hasEventListener;		//为object添加hasEventListener()方法.
		object.removeEventListener = THREE.EventDispatcher.prototype.removeEventListener;		//为object添加removeEventListener()方法.
		object.dispatchEvent = THREE.EventDispatcher.prototype.dispatchEvent;		//为object添加dispatchEvent()方法.

	},

	/*
	///addEventListener方法使用 EventDispatcher 对象注册事件侦听器对象，以使侦听器能够接收事件通知
	///AIR 运行时中的 JavaScript 代码使用此方法注册 AIR API 定义的事件的事件侦听器。对于其它 JavaScript 事件（如 DOM body 对象的 onload 事件），
	///您可以像对浏览器中运行的内容一样使用标准事件处理技术。成功注册一个事件侦听器后，无法通过额外调用 addEventListener() 来更改其优先级。 
	///要更改侦听器的优先级，必须首先调用 removeListener()。然后，可以使用新的优先级再次注册该侦听器。 
	/// NOTE:如果不再需要某个事件侦听器，可调用 removeEventListener() 删除它，否则会产生内存问题。由于垃圾回收器不会删除仍包含引用的对象，因此不会从内存中自动删除使用已注册事件侦听器的对象。
	/// NOTE:复制 EventDispatcher 实例时并不复制其中附加的事件侦听器。（如果新近创建的节点需要一个事件侦听器，必须在创建该节点后附加该侦听器。） 但是，如果移动 EventDispatcher 实例，则其中附加的事件侦听器也会随之移动。
	*/
	///<summary>addEventListener</summary>
	///<param name ="type" type="String">事件的类型</param>
	///<param name ="listener" type="Function">处理事件的侦听器函数。 此函数必须接受 Event 对象作为其唯一的参数并且不能返回任何结果,函数可以有任何名称</param>
	addEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		var listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );	

		}

	},

	/*
	///addEventListener方法	检查 EventDispatcher 对象是否为特定事件类型注册了任何侦听器。这样，您就可以确定 EventDispatcher 对象在事件流层次结构中的哪个位置改变了对事件类型的处理。
	*/
	///<summary>addEventListener</summary>
	///<param name ="type" type="String">事件的类型</param>
	///<param name ="listener" type="Function">要检查的侦听器对象</param>
	///<returns type="bool">返回true or false</returns>
	hasEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return false;

		var listeners = this._listeners;

		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

			return true;	//如果指定类型的侦听器已注册，则值为 true；

		}

		return false;	//否则，值为 false。 

	},

	/*
	///removeEventListener方法从 EventDispatcher 对象中删除侦听器。如果没有向 EventDispatcher 对象注册任何匹配的侦听器，则对此方法的调用没有任何效果。 
	*/
	///<summary>removeEventListener</summary>
	///<param name ="type" type="String">事件的类型</param>
	///<param name ="listener" type="Function">要删除的侦听器对象</param>
	removeEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			var index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );	//删除的侦听器对象

			}

		}

	},

	/*
	///dispatchEvent方法将事件调度到事件流中。事件目标是对其调用 dispatchEvent() 方法的 EventDispatcher 对象。 
	*/
	///<summary>dispatchEvent</summary>
	///<param name ="event" type="Event">调度到事件流中的 Event 对象。如果正在重新调度事件，则会自动创建此事件的一个克隆。  在调度了事件后，其 target 属性将无法更改，因此您必须创建此事件的一个新副本以能够重新调度。 </param>
	dispatchEvent: function ( event ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			var array = [];
			var length = listenerArray.length;

			for ( var i = 0; i < length; i ++ ) {

				array[ i ] = listenerArray[ i ];

			}

			for ( var i = 0; i < length; i ++ ) {

				array[ i ].call( this, event );

			}

		}

	}

};
