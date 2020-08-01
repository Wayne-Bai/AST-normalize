/**
 * @author:leo
 * @email:cwq0312@163.com
 * @version:1.00.000
 */
(function(Q) { /* event */
	var win = Q.global,
		doc = win.document,
		fn = Q.fn,
		_in = Q._in;
	var SE = _in.isSE,
		readyRE = /complete|loaded|interactive|loading/i, // /complete|loaded|interactive/
		ek = "QEvents",
		liveFuns = {};
	var isNull = Q.isNull,
		isFun = Q.isFun,
		each = Q.each,
		isPlainObject = Q.isPlainObject,
		_delete = _in._delete;
	/** 设置节点的加载成功方法 */
	function setLoad(node, fun) {
		node.onreadystatechange = node.onload = node.onDOMContentLoaded = fun
	}
	
	Q.ready = fn.ready = function(fun, context) {
		var node = context || this[0] || doc,
			state;

		function ready(e) {
			state = node.readyState;
			if (state != "loading" && !isNull(node.$$handls) && (readyRE.test(state) || (isNull(state) && "load" == e.type))) {
				setLoad(node, null);
				each(node.$$handls, function(i, val) {
					//val(Q);
                    Q.delay(function() {
                        val.call(node, Q)
                    }, 1);
				});
				_delete(node, "$$handls");
				//delete node.$$handls
			}
		}
		if (readyRE.test(node.readyState)) {
			Q.delay(function() {
				fun.call(node, Q)
			}, 10);
		} else {
			var hs = node.$$handls = node.$$handls || [];
			hs.push(fun);
			/*Q(node).on({
				"DOMContentLoaded" : ready,
				"readystatechange" : ready,
				"load" : ready
			});*/
			setLoad(node, ready)
		}
		return this
	}

	function Eadd(dom, name, fun, paramArray) {
		var t = Q(dom),
			d = t.data(ek) || {},
			h = d[name];
		t.data(ek, d);
		if (!h) {
			d[name] = h = [];
			//isFun(dom['on' + name]) ? (h[0] = dom['on' + name]) : SE() ? dom.addEventListener(name, handle, !1) : dom["on" + name] = handle
			if (isFun(dom['on' + name])) {
				h.push({
					fun: dom['on' + name],
					param: []
				});
				_delete(dom, 'on'+name)
				//delete dom['on' + name];
			}
			SE() ? dom.addEventListener(name, handle, !1) : dom["on" + name] = handle
		}
		isFun(fun) && h.push({
			fun: fun,
			param: paramArray || []
		})
	}

	function Erm(dom, name, fun) {
		var s = Q(dom).data(ek) || {},
			h = s[name] || [],
			i = h.length - 1;
		if (fun) {
			for (; i >= 0; i--)
				h[i].fun == fun && h.splice(i, 1)
		} else {
			//SE() ? dom.removeEventListener(name, handle, !1) : delete dom["on" + name];
			//delete s[name]
			SE() ? dom.removeEventListener(name, handle, !1) : _delete(dom, "on" + name);
			_delete(s, name)
		}
	}

	function Etrig(dom, name) {
		var e;
		if (SE()) {
			e = _in.createEvent("MouseEvents");
			e.initEvent(name, !0, !0);
			dom.dispatchEvent(e)
		} else dom.fireEvent('on' + name)
	}

	function handle(e) {
		e = fixEvent(e || win.event);
		var retVal, m = this,
			fun, param, events = Q(m).data(ek) || {};
		each(events[e.type], function(i, v) {
			Q.execCatch(function() {
				fun = v.fun;
				param = v.param || [];
				if (isFun(fun)) {
					retVal = fun.apply(m, [
						e
					].concat(param));
					//if (!isNull(retVal)) e.returnValue = retVal
					//兼容ie处理
					if (!isNull(retVal)) {
						e.returnValue = retVal;
						if (win.event) win.event.returnValue = retVal;
					}
				}
			});
		})
	}

	function fixEvent(e) {
		e.preventDefault || (e.preventDefault = function() {
			this.returnValue = !1;
			if (win.event) win.event.returnValue = !1;
		});
		e.stopPropagation || (e.stopPropagation = function() {
			this.cancelBubble = !0
		});
		e.target || (e.target = e.srcElement);
		return e
	}

	function getLiveName(type, callback) {
		return type  + (callback || "").toString()
	}

	function mapEvent(name, fun, dealFun) {
		var ents = {};
		if(isPlainObject(name))
			ents = name;
		else
			ents[name] = fun;
		dealFun && each(ents, dealFun);
		return ents;
	}
	/** 是否是父或祖父节点 */
	/*function contains(grandfather, child) {
		return Q.isDom(child) && (grandfather === child || grandfather === child.parentNode ? !0 : contains(grandfather, child.parentNode))
	}*/
	fn.extend({
		on: function(name, callback) {
			each(this, function(k, v) {
				mapEvent(name, callback, function(key, fun){
					Eadd(v, key, fun)
				})
			});
			return this
		},
		off: function(name, callback) {
			each(this, function(k, v) {
				Erm(v, name, callback)
			});
			return this
		},
		once: function(name, callback) { // 只执行一次触发事件,执行后删除
			var me = this, ents={};
			mapEvent(name, callback, function(key, fun){
				ents[key] = function(e){
					me.off(key, ents[key]);
					fun(e);
				}
			});
			return me.on(ents);
		},
		emit: function(name) {//手动触发事件
			each(this, function(k, v) {
				Etrig(v, name)
			});
			return this
		},
		live: function(name, callback) {
			var me = this;
			mapEvent(name, callback, function(key, callback) {
				var fun = me.__lives[getLiveName(key, callback)] = function(e) {
					var target = e.target,
						qtar = Q(target),
						sel = Q.isString(me.selector) ? Q(me.selector, me.context) : me;
					each(sel, function(i, dom) {
                        Q.contains(dom, target) && callback.call(target, e)
					});
				}
				Q("body").on(key, fun)
			});
			return me
		},
		die: function(name, callback) {
			var me = this,
				fun = me.__lives[getLiveName(name, callback)];
			(arguments.length < 2 || fun) && Erm(doc.body, name, fun);
			return me
		}
	});
	fn.extend({
		bind: fn.on,
		unbind: fn.off,
		trigger: fn.emit
	});
	/**
	 * event orientationchange:重力感应,0：与页面首次加载时的方向一致 -90：相对原始方向顺时针转了90° 180：转了180°
	 * 90：逆时针转了 Android2.1尚未支持重力感应 click blur focus scroll resize
	 */
	each("click blur focus scroll resize".split(" "), function(i, v) {
		fn[v] = function(f) {
            var me = this, dom;
            if(f){
                me.on(v, f)
            }else{
                if(["focus", "blur"].indexOf(v)>=0){
                    dom = me.last()[0];
                    dom && isFun(dom[v]) && dom[v]();
                }
                me.emit(v);
            }
			//return f ? this.on(v, f) : this.emit(v)
		}
	})
})(Qmik);