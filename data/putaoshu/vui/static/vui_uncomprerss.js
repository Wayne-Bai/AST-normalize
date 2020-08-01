/**
 * vui base
 * @function
 * @author putaoshu@126.com
 * @date 2012-02-08
 */
if (vui == undefined){
	var vui = {};
}
/**
 * 数字转成数组
 * @constructor
 * @name vui.numberToArray
 * @author putaoshu@126.com
 * @date 2012-02-08
 * @param {Number} o number主体
 * @return {Array} 数组
 * @requires vui.isString() ; vui.isNumber()
 */
vui.numberToArray=function(o){
	if (vui.isString(o)){
		o = parseInt(o);
	}
	if(vui.isNumber(o)) o = [o];
	return o;
}

/**
 * 返回数组中某个元素的位置
 * @constructor
 * @name vui.indexOf
 * @author putaoshu@126.com
 * @date 2012-07-03
 * @param {Array} o Array主体
 * @param {All} value 待检测的元素
 * @return 若存在此元素返回该元素的位置,若不存在则返回-1
 * @requires vui.isArray()
 */
vui.indexOf = function (o,value){
	 if (vui.isArray(o)){
		var result;
		for (var i=0;i<o.length;i++){
			if (o[i]==value){
				result = i;
				break
			}else{
				result = -1;
			}
		}
		return result;
	 }
}/**
 * 自动页面滚动至某元素
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-03-12
 * @param {Object} obj 主对象
 * @param {Number} time 页面滚动至某元素所需时间
 * @example vui.autoscroll($('#goTop'),100)
 */

vui.autoscroll= function(obj,time){
	var $this = $(obj);
	if(!time) time = 500;
	var $top = $this.offset().top;
	$('html,body').animate({
		scrollTop:$top
	},time);
}

/**
 * fileoverview浏览器检测
 * @constructor
 * @name vui.browser
 * @author putaoshu@126.com
 * @date 2012-02-08
 * @example 
vui.browser.ie
vui.browser.firefox
 * @note
 * ff3.6.20 mozilla/5.0 (windows; u; windows nt 6.1; zh-cn; rv:1.9.2.20) gecko/20110803 firefox/3.6.20 
	chrome16.0 mozilla/5.0 (windows nt 6.1) applewebkit/535.7 (khtml, like gecko) chrome/16.0.912.63 safari/535.7 
	safari5.04 mozilla/5.0 (windows nt 6.1) applewebkit/534.51.22 (khtml, like gecko) version/5.0.4 safari/533.20.27 
	opear11.6 opera/9.80 (windows nt 6.1; u; zh-cn) presto/2.10.229 version/11.61 
 */

/** @lends vui.browser */
vui.browser ={
	/**
	 * 浏览器UA 
	 * @name vui.browser.ua
	 * @return {String} 浏览器UA
	 */
	ua:navigator.userAgent.toLowerCase(),

	/**
	 * ie 
	 * @name vui.browser.ie
	 * @return {Boolean} true/false
	 */
	ie: /msie/.test(navigator.userAgent.toLowerCase()),
	/**
	 * ie6 
	 * @name vui.browser.ie6
	 * @return {Boolean} true/false
	 */
	ie6: /msie 6/.test(navigator.userAgent.toLowerCase()),
	/**
	 * ie7
	 * @name vui.browser.ie7
	 * @return {Boolean} true/false
	 */
	ie7: /msie 7/.test(navigator.userAgent.toLowerCase()),
	/**
	 * ie8 
	 * @name vui.browser.ie8
	 * @return {Boolean} true/false
	 */
	ie8: /msie 8/.test(navigator.userAgent.toLowerCase()),
	/**
	 * ie9 
	 * @name vui.browser.ie9
	 * @return {Boolean} true/false
	 */
	ie9: /msie 9/.test(navigator.userAgent.toLowerCase()),
	/**
	 * firefox 
	 * @name vui.browser.firefox
	 * @return {Boolean} true/false
	 */
	firefox: /firefox\/(\d+\.\d+)/i.test(navigator.userAgent.toLowerCase()),
	/**
	 * chrome 
	 * @name vui.browser.chrome
	 * @return {Boolean} true/false
	 */
	chrome: /chrome\/(\d+\.\d+)/i.test(navigator.userAgent.toLowerCase()),
	/**
	 * opera 
	 * @name vui.browser.opera
	 * @return {Boolean} true/false
	 */	
	opera: /opera/.test(navigator.userAgent.toLowerCase()),
	//safari: /safari/.test(navigator.userAgent.toLowerCase()),
	/**
	 * webkit 
	 * @name vui.browser.webkit
	 * @return {Boolean} true/false
	 */
	webkit: /webkit/.test(navigator.userAgent.toLowerCase())
}

/**
 * 点击隐藏(失去焦点后,点击元素以外区域后,元素隐藏)
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-02-08
 * @param {Object} obj 主对象
 * @example 
vui.clickhide($('#test'))
vui.clickHide($('#test'))
 */

vui.clickhide = vui.clickHide = function(obj){
	var $this = $(obj);
	var mouseInsideTag = false;
	
	$this.show();

	$this.hover(function(){ 
        mouseInsideTag=true; 
    }, function(){ 
        mouseInsideTag=false; 
    });

    $("html,body").mouseup(function(){ 
        if(!mouseInsideTag) $this.hide();
    });
}

/**
 * 深度copy
 * @param {Function} obj 要copy的函数
 */
vui.clone = function(obj) {
	if(typeof(obj) != 'object' || obj == null){
		return obj;
	}
	var new_obj = new Object();
	for(var i in obj){
		new_obj[i] = kui.clone(obj[i]);
	}
	return new_obj;
}/**
 * 右键菜单
 * @constructor
 * @author putaoshu@126.com
 * @date 2012
 * @param {Object} obj 主对象
 * @param {Object} options 组件配置
 * @param {Object} options.menu null 菜单主体
 * @param {Nummber} options.zIndex 2 菜单z-index
 * @param {Boolean} options.autoShow true 自适应:即在主体元素有被遮挡时,把主体转移到上面
 * @param {Boolean} options.preventContextmenu true 阻止系统默认右键菜单
 * @param {Number} options.diff 2 当前位置与菜单展示位置的差值
 * @param {Function} options.callback 回调函数
 * @example 
vui.contextmenu($('#test'),{
	menu:$('#contextmenu')
})
 */
vui.contextmenu = function(obj,options){
	 options = $.extend({
		menu : null, //菜单主体
		zIndex : 2, //菜单z-index
		autoShow : true ,//自适应:即在主体元素有被遮挡时,把主体转移到上面
		preventContextmenu : true, //阻止右键菜单
		diff:2, //当前位置与菜单展示位置的差值
		callback:null
	 },options);
	var contextmenu = {
		el:obj,
		menu:options.menu,
		init:function(){
			if (options.preventContextmenu){
				this.preventContextmenu(options.preventContextmenu);
			}
			if (options.menu == null){
				alert('options error');
			}
			
			var o = this;
			this.hide();
			this.preventContextmenu(this.menu);
			this.setStyle();
			this.el.bind('contextmenu',function(event){
				event.preventDefault();
				var x = event.pageX+options.diff;
				var y = event.pageY+options.diff;
				if (options.autoShow){
					var docHeight = $(window).height()+$(document).scrollTop();
					var coreTop = y - options.diff + options.menu.outerHeight();
					if (coreTop>docHeight){
						y = y - options.menu.outerHeight();
					}
				}
				options.menu.css({
					left:x,
					top:y
				})
				o.show();
				o.clickBodyHide();
			})
		},
		clickBodyHide:function(){
			var  o = this;
			 $('html').one('click',function(){
				 o.hide();
			 })
		},
		preventContextmenu:function(o){
			o.bind('contextmenu',function(event){
				 return false;
			}) 
		},
		setStyle:function(){
			 this.menu.css({
				zIndex:options.zIndex,
				position:'absolute'
			 });
			 this.menu.appendTo('body');
		},
		show:function(){
			 this.menu.show();
		},
		hide:function(){
			 this.menu.hide();
		}
	}
	
	contextmenu.init();
}

/**
 * cookie
 * @constructor
 * @param {String} key 键
 * @param {String} value 值
 * @example vui.cookie('the_cookie');
 */
vui.cookie = function (key, value, options) {
    // key and value given, set cookie...
    if (arguments.length > 1 && (value === null || typeof value !== "object")) {
        options = jQuery.extend({}, options);

        if (value === null) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? String(value) : encodeURIComponent(String(value)),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};

/**
 * 简单计数
 * @constructor
 * @name vui.counter
 * @author dong<dongdong4@staff.sina.com.cn>
 */
vui.counter={
	 /** @lends vui.counter*/
	k:[],
	v:[],

	/**
	 * 获取 
	 * @name vui.counter.get
	 * @param {String} name
	 * @return {String} 获取该键对应的值
	 */
	get:function(name){
		var i=this.k.indexOf(name);
		if(i<0){
			return 0;
		}
		return this.v[i];
	},

	/**
	 * 增加 
	 * @name vui.counter.inc
	 * @param {String} name
	 * @return {Void} 键加1
	 */
	inc:function(name){
		var i=this.k.indexOf(name);
		if(i<0){
			this.k.push(name);
			this.v.push(1);
			return 1;
		}
		else{
			this.v[i]++;
			return this.v[i];
		}
	},

	/**
	 * 减少 
	 * @name vui.counter.dec
	 * @param {String} name
	 * @return {Void} 键减1
	 */
	dec:function(name){
		var i=this.k.indexOf(name);
		if(i<0){
			return 0;
		}
		else{
			if(this.v[i]>0){
				this.v[i]--;
			}
			return this.v[i];
		}
	}
};

/**
 * 检测URL中是否含有'debug'
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-04-17
 * @return {Boolean} true/false
 */

vui.debug=function(){
	return /debug/.test(location.search);
}

/**
 * 表单中的默认字符,点击后隐藏这些字符
 * @constructor
 * @author putaoshu@126.com
 * @param {Object} obj 主对象
 * @date 2012-02-08
 * @example &lt;input type="text" defaultchars="搜索大家共享的文件"&gt;
 */

vui.defaultchars = function(obj){
	var $this = $(obj);
	if($this.val()) return;
	var $defaultchars = $this.attr('defaultchars');
	$this.val($defaultchars);
	$this.focusin(function(){
		if ($this.val() == $defaultchars) $this.val('');
	}).focusout(function(){
		if ($this.val() == '') $this.val($defaultchars);
	});
}/**
 * 对话框
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-03-13
 * @param {Object} options 组件配置

 * @param {Object} options.message  主对象
 * @param {Boolean} options.mask  true 是否有遮罩层
 * @param {Number} options.opacity   0.15 遮罩层透明度
 * @todo {Boolean} options.drag   false 
 * @param {String} options.maskClass vuiDialogMask 遮罩层样式
 * @param {String} options.dialogClass vuiDialog 对话框主体样式
 * @param {Object} options.close  true 是否采用vui.undialog关闭浮层
 * @param {Boolean} options.maskIframe false 遮罩层用iframe做底
 * @param {Boolean} options.appendType true true 直接先append到body
 * @param {Object} options.stick null  需要粘在某个元素上
 * @param {Boolean} options.autoClientX false 浮层宽度为当前窗口宽度
 * @param {Boolean} options.autoClientY false 浮层高度为当前窗口高度
 * @param {Boolean} options.fixed true 浮层是否fixed

 * @param {Object} options.css  主体样式配置
 * @param {Number} options.css.width   null 主体宽度
 * @param {Number} options.css.height  null 主体高度
 * @param {Number} options.css.top   null 主体top
 * @param {Number} options.css.left   null 主体left
 * @param {Number} options.css.zIndex 9998 主体zIndex

 * @param {Function}  callback 回调函数
 * @example 
vui.dialog({message:$('#dialog')});

vui.dialog({
	message:"&lt;h2 &gt;标题 &lt;/h2&gt;",
	css:{
		top:'10px',
		left:'20px',
		width:'300px',
		zIndex:'10000'
	}
});

vui.dialog({
	message:$('#userGuide'),
	opacity:0.5,
	stick: $('#picModeOpt'), //粘到某个元素上
	css:{
		top : -17,
		left : -365,
		zIndex:10
	}
});

 * @2012-05-28 浮层宽度为当前窗口宽度 autoClientX:true
 * @todo 拖动;
 */
vui.dialog  =  function(options,callback){
	var $this = '';
	options = $.extend({
		message : null,
		mask : true,
		opacity : 0.15,
		drag : false,
		maskClass:'vuiDialogMask',
		dialogClass:'vuiDialog',
		close:true,//是否采用vui.undialog关闭浮层
		maskIframe:false,
		appendType:true,//true:直接先append到body
		stick:null,//需要粘在某个元素上
		autoClientX:false,//浮层宽度为当前窗口宽度
		autoClientY:false,//浮层高度为当前窗口高度
		fixed:true, //浮层fixed与否
		css : {
			width : null,
			height :null,
			top : null,
			left : null,
			zIndex:9998
		}
	},options);

	//插入模式
	var insideTag = vui.isObject(options.message);
	var stickDom = options.stick;

	//加遮照层
	var maskObj;
	
	if (options.mask){
		maskObj = $(document.createElement("div"));
		maskObj.attr('class',options.maskClass);
		maskObj.addClass('vuiMaskLayer');
		maskObj.css({
			position:"absolute",zIndex:options.css.zIndex,left:0,top:0,opacity:options.opacity,backgroundColor:"#000",
			width:vui.pageSize().docWidth,
			height:vui.pageSize().docHeight
		});
		if (!$('.'+options.maskClass)[0]) maskObj.appendTo('body');
		
		//ie6 select bug 
		if (vui.browser.ie6 || options.maskIframe){
			maskObj.append('<iframe src="javascript:;" class="vuiSelectBug" frameBorder="0" style="width:100%;height:100%;position:absolute;z-index:'+(options.css.zIndex+1)+';opacity:0;filter:alpha(opacity=0);top:0;left:0;">');
		}
		
		//自适应窗口
		$(window).resize(function(){
			var currentCSS = {
				width:vui.pageSize().docWidth,
				height:vui.pageSize().docHeight
			}
			$('.'+options.maskClass).css(currentCSS);
		});
	}
	
	//开始始 appendTo body
	if(insideTag){
		if (options.appendType){
			options.message.appendTo('body');
		}
		options.message.css({top:0,left:0})
	}
	
	//垂直距中
	var dialogObj = $(document.createElement("div"));

	if (vui.isString(options.message)){
		dialogObj.append(options.message);
		$this = dialogObj.children().first();
	}else if(insideTag){
		$this = options.message;
	}else{
		dialogObj.append($this);
	}

	//兼容IE6
	$this.css({'float':'left',position:'',top:'',bottom:'',left:'',right:''});

	autoClient();
	dialogObj.attr('class',options.dialogClass);
	if(!insideTag) dialogObj.appendTo('body');
	
	if (insideTag) dialogObj =	options.message;

	var dialogObjCss = {
		position:  'absolute' ,
		zIndex:options.css.zIndex+2,
		display:"block"
	}
	
	//setStyle
	function setStyle(){
		autoClient();
		var tag = vui.browser.ie6 ;
		var currentCSS = {
			position: tag ? 'absolute' : "fixed" ,
			top:(options.css.top == null) ? ($(window).height() - $this.height() ) / 2 + (tag ? $(window).scrollTop() :0 ) : options.css.top,
			left:(options.css.left == null) ?  ($(window).width() - $this.width() ) / 2 + (tag ? $(window).scrollLeft() :0 )  : options.css.left
		}
		
		if (!options.fixed){
			currentCSS.position = 'absolute' ;
		}
		dialogObj.css(currentCSS);
	}

	//窗口自适应的dom
	if (stickDom){
		dialogObjCss.left = stickDom.offset().left+options.css.left;
		dialogObjCss.top = stickDom.offset().top+options.css.top;
	}

	//浮层宽和高为当前窗口宽和高
	function autoClient(){
		if (options.autoClientX){
			$this.css({width:$(window).width()});
		}
		if (options.autoClientY){
			$this.css({height:$(window).height()});
		}
	}

	//样式最终设定
	dialogObj.css(dialogObjCss);
	if (!stickDom) setStyle();

	
	//fixed (IE6模拟)
	if (vui.browser.ie6 && !stickDom){
		if (options.fixed){
			$(window).bind('scroll',function(){
				setStyle();
			});
		}
	}

	//窗口自适应
	$(window).resize(function(){
		if (stickDom){
			dialogObj.css({
				left : stickDom.offset().left+options.css.left,
				top : stickDom.offset().top+options.css.top
			});
		}else{
			setStyle();
		}
	});

	//默认.dialogclose可以移除浮层
	$('.dialogclose',dialogObj).click(function(){
		dialogObj.remove();
		maskObj.remove();
	});

	$(window).data('dialog.options.close',options.close);
	$(window).data('dialog.maskObj',maskObj);
	$(window).data('dialog.dialogObj',dialogObj);	

	if (callback){
		callback(); 
	}
	
	if (options.close){
		vui.preventScroll.init();
	}
}

//兼容unblockUI
vui.undialog = function(){
	if ($(window).data('dialog.maskObj') && ( $(window).data('dialog.options.close')==true ) ){
		$(window).data('dialog.maskObj').remove();
		$(window).data('dialog.dialogObj').remove();
		var maskLayer = $('.vuiMaskLayer:last');
		if (!maskLayer.is(':visible') || maskLayer.css('visibility')=='hidden'){
			vui.preventScroll.destroy();
		}
	}
};

/**
 * vui 拖拽
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-07-19
 * @param {Object} obj 主对象
 * @param {Object} options 组件配置
 * @param {Boolean} options.lockX   false 锁定X
 * @param {Boolean} options.lockY   false 锁定Y
 * @param {Function} options.start   null 开始拖动回调
 * @param {Function} options.drag   null 拖动中回调
 * @param {Function} options.end   null 结束拖动回调
 * @param {Number} options.maxLeft null max left
 * @param {Number} options.maxRight null max right
 * @param {Number} options.maxTop null max top
 * @param {Number} options.maxBottom null max bottom
 * @example vui.drag($('.content'),{
	 lockX:true,
	 maxTop:0,
	 maxBottom:200
});
 */
 
vui.drag = function(obj,options){
	options = $.extend({
		lockX : false,//锁定X
		lockY : false,//锁定Y
		start : null,//开始拖动回调
		drag : null,//拖动中回调
		end : null,//结束拖动回调
		maxLeft:null,
		maxRight:null,
		maxTop:null,
		maxBottom:null
	},options);

	 var o = {
		dragging:null,
		init:function(){
			 this.bind();
		},
		diffX:0,
		diffY:0,
		unbind:function(){
			 $(document).unbind('mousedown').unbind('mousemove').unbind('mouseup');
		},
		bind:function(){
			 var self = this;
			$(document).bind('mousedown',function(event){
				  if (event.target.className == obj.attr('class') ){
					self.dragging = true;
					self.diffX = event.clientX - obj.offset().left;
					self.diffY = event.clientY - obj.offset().top;
					if(options.start != null){
						options.start.call();
					}
				 }
			})
			.bind('mousemove',function(event){
				if (self.dragging){
					var top,left;
					if (!options.lockY){
						top  = event.clientY - self.diffY;
						if (options.maxTop!=null && top < options.maxTop){
							top = options.maxTop;
						}
						if (options.maxBottom!=null && top > options.maxBottom){
							top = options.maxBottom;
						}
						obj.css({top:top})
					}
					if (!options.lockX){
						left  = event.clientX - self.diffX;
						if (options.maxLeft!=null && top < options.maxLeft){
							top = options.maxLeft;
						}
						if (options.maxRight!=null && top > options.maxRight){
							top = options.maxRight;
						}
						obj.css({left:left})
					}
					var arg = [top,left];
					if (top==undefined){
						arg = left;
					}
					if (left==undefined){
						arg = top;
					}
					if(options.drag != null){
						options.drag.call(null,arg);
					}
				}
			})
			.bind('mouseup',function(event){
				 if(options.end != null){
					options.end.call();
				}
				 self.dragging = false;
			});
		}
	 }
	 o.init();
}

/**
 *  position fixed (兼容IE6)
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-07-03 
 * @param {Object} obj 主对象
 * @param {Object} options 组件配置
 * @param {Number} options.top null top
 * @param {Number} options.bottom null bottom
 * @param {Number} options.left null left
 * @param {Number} options.right null right
 * @param {Number} options.zIndex null right
 * @param {Number} options.place null 方位选择:topLeft,topRight,topCenter,bottomLeft,bottomRight,bottomCenter
 * @see  top,bottom,left,right需要指定两项并且和place参数不能同时设置
 * @example 
vui.fixed($('#test'),{place:'bottomRight'})
vui.fixed($('#test'),{
	top:1,
	left:1
})
 */

vui.fixed=function(obj,options){
	 options = $.extend({
		top : null,
		bottom :null,
		left : null,
		right : null,
		place : null,//topLeft,topRight,topCenter,bottomLeft,bottomRight,bottomCenter
		zIndex : 2
	},options);
	
	var o = {
		isIe6 : vui.browser.ie6,
		init:function (){
			//check place
			var placeArray = ['topLeft','topRight','topCenter','bottomLeft','bottomRight','bottomCenter'];
			if(options.place && vui.indexOf(placeArray,options.place) == -1){
				alert('place param error');
				return;
			}
			
			//style init
			var positionValue = 'fixed';
			if (this.isIe6){
				positionValue = 'absolute';
			}
			obj.css({position:positionValue,zIndex:options.zIndex,top:'',bottom:'',left:'',right:''});
			
			this.set();
			this.bindResize();
			this.bindScroll();
		},
		set:function (){
			//do
			if (options.place){
				this.place();
			}else{
				this.normal();
			} 
		},
		//精确定位
		normal:function (){
			var css = {};
			 if (options.top != null){
				css.top = this.isIe6 ? (options.top + this.css.scrollTop()) : options.top
			 }
			if (options.left != null){
				css.left = this.isIe6 ? (options.left + this.css.scrollLeft()) : options.left
			 }
			if (options.bottom != null){
				if (this.isIe6){
					css.top = this.css.top() - options.bottom;
				}else{
					css.bottom = options.bottom;
				}
			 }
			if (options.right != null){
				if (this.isIe6){
					css.left = this.css.left() - options.right;
				}else{
					css.right = options.right;
				}
			 }
			 obj.css(css);
		},
		//方位定位
		place:function (){
			var place = options.place;
			this[place]();
		},
		bindScroll:function (){
			var $this = this;
			$(window).bind('scroll',function(){
				 $this.set();
			})
		},
		bindResize:function (){
			var $this = this;
			$(window).resize(function(){
					$this.set();
			});
		},
		css:{
			center:function (){
				 return ( $(window).width() ) /2 + this.scrollLeft() - ( obj.outerWidth() /2);
			},
			top:function (){
				 return $(window).height()+this.scrollTop() - obj.outerHeight();
			},
			left:function (){
				 return $(window).width() + this.scrollLeft() - obj.outerWidth();
			},
			scrollTop:function (){
				 return $(document).scrollTop();
			},
			scrollLeft:function (){
				 return $(document).scrollLeft();
			}
		},
		bottomLeft:function (){
			 if (this.isIe6){
				var left  = this.css.scrollLeft();
				var top = this.css.top();
				obj.css({left:left,top:top});
			}else{
				obj.css({left:0,bottom:0});
			}
		},
		bottomCenter:function (){
			 if (this.isIe6){
				var left  = this.css.center();
				var top = this.css.top();
				obj.css({left:left,top:top});
			}else{
				obj.css({left:'50%',bottom:0,marginLeft:-obj.outerWidth()/2});
			}
		},
		bottomRight:function (){
			if (this.isIe6){
				var left  = this.css.left();
				var top = this.css.top();
				obj.css({left:left,top:top});
			}else{
				obj.css({right:0,bottom:0});
			}
		},
		topLeft:function (){
			 if (this.isIe6){
				var left  = this.css.scrollLeft();
				var top = this.css.scrollTop();
				obj.css({left:left,top:top});
			}else{
				obj.css({left:0,top:0});
			}
		},
		topCenter:function (){
			 if (this.isIe6){
				var left  = this.css.center();
				var top = this.css.scrollTop();
				obj.css({left:left,top:top});
			}else{
				obj.css({left:'50%',top:0,marginLeft:-obj.outerWidth()/2});
			}
		},
		topRight:function (){
			 if (this.isIe6){
				var left  = this.css.left();
				var top = $(document).scrollTop();
				obj.css({left:left,top:top});
			}else{
				obj.css({right:0,top:0});
			}
		}
	}

	o.init();
}

/**
 * focusClass
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-03-12
 * @param {Object} obj 主对象
 * @param {String} styleclass 样式名称
 */

vui.focusclass = vui.focusClass = function(obj,styleclass){
	var $this = $(obj);
	$this.focus(function(){
		$this.toggleClass(styleclass); 
	}).blur(function(){
		$this.toggleClass(styleclass);
	});
}

/**
 * 对目标字符串进行格式化
 * @constructor
 * @name vui.format
 * @author putaoshu@126.com
 * @date 2013-4-4
 * @param {String} source 目标字符串
 * @param {Object} opts 组件配置
 * @returns {String} 格式化后的字符串
 * @example 
vui.format('<div class="#{myClassName}"></div>',{myClassName:'menu'})
 */

vui.format = function (source, opts) {
    source = String(source);
    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
    if(data.length){
	    data = data.length == 1 ? 
	    	/* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
	    	(opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
	    	: data;
    	return source.replace(/#\{(.+?)\}/g, function (match, key){
	    	var replacer = data[key];
	    	// chrome 下 typeof /a/ == 'function'
	    	if('[object Function]' == toString.call(replacer)){
	    		replacer = replacer(key);
	    	}
	    	return ('undefined' == typeof replacer ? '' : replacer);
    	});
    }
    return source;
}

/**
 * 返回一个当前页面的唯一标识字符串
 * @constructor
 * @name vui.guid
 * @author putaoshu@126.com
 * @date 2013-4-4
 * @returns {String} 当前页面的唯一标识字符串
 * @example vui.guid(); //返回vui_2
 */

window.guid = 1;
vui.guid = function () {
	window.guid++;
	return 'vui_' + window.guid;
}

/**
 * 快捷键设置
 * @name vui.hotkey
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-04-18
 * @param {String} event keydown 其它为keypress|keyup
 * @param {String} key 键值esc,enter...
 * @param {String} name 快捷键对应回调时会用的名称
 * @param {Function} callback 回调函数
 * @example
vui.hotkey({event:'keydown',key:'enter',name:'hotkeyName'},function(){
	 alert('todo');
});
 */
//所有回调函数集
vui.hotkeyArray = {};

vui.hotkey = function(opt,callback){
	opt.event = opt.event.toLowerCase();
	opt.key = opt.key.toLowerCase();
	var typeReg=/^keypress|keydown|keyup$/;
	if(!typeReg.test(opt.event)){
		return;
	};

	//特殊键的对照
	var keyMap = { 
		27: 'esc', 9: 'tab', 32:'space', 13: 'enter', 8:'backspace', 145: 'scrollclock', 
		20: 'capslock', 144: 'numlock', 19:'pause', 45:'insert', 36:'home', 46:'delete',
		35:'end', 33: 'pageup', 34:'pagedown', 37:'left', 38:'up', 39:'right',40:'down', 
		112:'f1',113:'f2', 114:'f3', 115:'f4', 116:'f5', 117:'f6', 118:'f7', 119:'f8', 
		120:'f9', 121:'f10', 122:'f11', 123:'f12', 191: '/', 17:'ctrl', 16:'shift',
		109:'-',107:'=',219:'[',221:']',220:'\\',222:'\'',187:'=',188:',',189:'-',190:'.',191:'/',
		96: '0', 97:'1', 98: '2', 99: '3', 100: '4', 101: '5', 102: '6', 103: '7',
		104: '8', 105: '9', 106: '*', 110: '.', 111 : '/',
		65:'a',66:'b',67:'c',68:'d',69:'e',70:'f',71:'g',72:'h',73:'i',74:'j',75:'k',76:'l',
		77:'m',78:'n',79:'o',80:'p',81:'q',82:'r',83:'s',84:'t',85:'u',86:'v',87:'w',88:'x',89:'y',90:'z'
	};

	//绑定的函数入库
	vui.hotkeyArray[opt.name] = callback;

	$(document).bind(opt.event,function(event){
		var whichNum=0;
		$.each(keyMap,function(i){
			if (keyMap[i]==opt.key){
				whichNum = i;
				//vui.hotkeyArray[i]();
				return false;
			}
		})

		if(event.which == whichNum){
			vui.hotkeyArray[opt.name]();
			//$.each(vui.hotkeyArray,function(i){
			//	//vui.hotkeyArray[i]();
			//	this.apply();
			//})
		};

	});
}

//移除hotkey
vui.unhotkey = function(hotkeyName){
	//从回调函数集移除
	delete vui.hotkeyArray[hotkeyName];
}

/**
 * html转义
 * @param {String} content
 * @param {Mixed} type 引号转义方式
 *  过滤掉全部html标签(默认)
 * 	1: 转义单引号&html标签
 *  2: 转义双引号&html标签
 *  3: 转义单双引号&html标签
 */
vui.HTMLFilter=function(content,type){
	if (typeof type == 'undefined'){
		content = content.replace(/<\/?[^>]*>/g,''); //去除HTML tag
		content.value = content.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
		//content = content.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
	}

	if(type == 1 || type == 3){
		//单引号
		content = content.replace(/'/g, '&#039;');
	}
	if(type == 2 || type == 3){
		//多引号
		content = content.replace(/&/g, "&amp;").replace(/</g, '&lt;').replace(/>/g, '&gt;');
		content = content.replace(/"/g, '&quot');
	}
	return content;
}/**
 * 输入框光标位置相关处理
 * @constructor
 * @name vui.inputCursor
 * @author dong
 */
vui.inputCursor = {
	/** @lends vui.inputCursor */
	/**
	 * getSelection 
	 * @name vui.inputCursor.getSelection
	 * @param {Object} el 主对象
	 * @see <a href="http://stackoverflow.com/questions/235411/is-there-an-internet-explorer-approved-substitute-for-selectionstart-and-selecti">stackoverflow</a>
	 */
	getSelection: function(el){
		var start = 0, end = 0, normalizedValue, range,
			textInputRange, len, endRange;

		if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
			start = el.selectionStart;
			end = el.selectionEnd;
		} else {
			range = document.selection.createRange();

			if (range && range.parentElement() == el) {
				len = el.value.length;
				normalizedValue = el.value.replace(/\r\n/g, "\n");

				// Create a working TextRange that lives only in the input
				textInputRange = el.createTextRange();
				textInputRange.moveToBookmark(range.getBookmark());

				// Check if the start and end of the selection are at the very end
				// of the input, since moveStart/moveEnd doesn't return what we want
				// in those cases
				endRange = el.createTextRange();
				endRange.collapse(false);

				if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
					start = end = len;
				} else {
					start = -textInputRange.moveStart("character", -len);
					start += normalizedValue.slice(0, start).split("\n").length - 1;

					if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
						end = len;
					} else {
						end = -textInputRange.moveEnd("character", -len);
						end += normalizedValue.slice(0, end).split("\n").length - 1;
					}
				}
			}
		}

		return {
			start: start,
			end: end
		};
	},
	/**
	 * 获取光标的起始位置
	 * @name vui.inputCursor.getStartPos
	 * @param {Object} obj 主对象
	 */
	getStartPos: function(obj){
		return this.getSelection(obj).start;
	},
	/**
	 * 获取光标的结束位置
	 * @name vui.inputCursor.getEndPos
	 * @param {Object} obj 主对象
	 */
	getEndPos: function(obj){
		return this.getSelection(obj).end;
	},
	/**
	 * 光标处插入字符
	 * @name vui.inputCursor.insert
	 * @param {Object} obj 主对象
	 * @param {String} str 插入的字符
	 */
	insert: function(obj, str){
		if (document.selection) {
			//IE support
			obj.focus();
			sel = document.selection.createRange();
			sel.text = str;
			obj.focus();
		}else if (obj.selectionStart || obj.selectionStart == '0') {
			//MOZILLA/NETSCAPE support
			startPos = obj.selectionStart;
			endPos = obj.selectionEnd;
			scrollTop = obj.scrollTop;
			obj.value = obj.value.substring(0, startPos) + str + obj.value.substring(endPos,obj.value.length);
			obj.focus();
			obj.selectionStart = startPos + str.length;
			obj.selectionEnd = startPos + str.length;
			obj.scrollTop = scrollTop;
		} else {
			obj.value += str;
			obj.focus();
		}
	},
	/**
	 * 选中指定区间
	 * @name vui.inputCursor.select
	 * @param {Object} obj 主对象
	 * @param {Number} start 开始位置
	 * @param {Number} end 结束位置
	 */
	select: function(obj, start, end){
		if(typeof end == 'undefined' || end < start) end = start;
		obj.focus();
		if(document.selection){
			var range = obj.createTextRange();
			range.move('character', start);
			range.moveEnd('character', end);
			range.select();
		}
		else{
			obj.selectionStart = start;
			obj.selectionEnd = end;
		}
	},
	/**
	 * 替换指定区域的文字
	 * @name vui.inputCursor.replace
	 * @param {Object} obj 主对象
	 * @param {Number} start 开始位置
	 * @param {Number} end 结束位置
	 * @param {String} text 替换指定区域的文字
	 * @param {Boolean} focus true 替换指定区域的文字
	 */
	replace: function(obj, start, end, text, focus){
		obj.value = obj.value.substr(0, start) + text + obj.value.substr(end, obj.value.length);
		if(focus){
			this.select(obj, start + text.length);
		}
	}
};

/**
 * 模拟滚动条
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-07-13
 * @param {Object} obj 主对象
 * @param {Object} options 组件配置
 * @param {Number} options.top null top

 * @param {Number} options.wrapWidth 500 主体宽度
 * @param {Number} options.wrapHeight 200 主体高度
 * @param {Number} options.wrapClass  isScrollWrap 主体class
 * @param {Number} options.scrollWidth 20 滚动条宽度
 * @param {Number} options.scrollMinHeight 50 滚动条最小高度
 * @param {Number} options.scrollClass isScroll 滚动条class
 * @param {Number} options.step 5 滚动条步进值
 * @param {Number} options.setScrollOnce false 重新设置滚动条高度Tag

 * @example 
vui.isScroll($('#content'));
vui.isScroll($('#content'),{setScrollOnce:true});//重置滚动条
 */
vui.isScroll = function(obj,options){
	 options = $.extend({
	 	wrapWidth : 500,//主体宽度
		wrapHeight : 200,//主体高度
		wrapClass : 'isScrollWrap',//主体class

		scrollWidth : 20,//滚动条宽度
		scrollMinHeight : 50,//滚动条最小高度
		scrollClass : 'isScroll',//滚动条class
		step :5, //滚动条步进值

		setScrollOnce:false //重新设置滚动条高度Tag
	 },options);

	 var o={
		init:function(){
			//配置信息绑定到obj上
			obj.data('data',options);
			
			if (options.setScrollOnce){
				options = obj.data('data');
				this.setScrollHeight();
				this.dragInit();
			}else{
				this.setInit();
			}
		},
		setInit:function(){
			this.styleInit();
			this.createWrap();
			this.createScroll();
			this.setScrollHeight();
			this.bind();
			this.dragInit();
		},
		bind:function(){
			var self = this;
			var mousewheelEvent = 'mousewheel';
			if (vui.browser.firefox){
				mousewheelEvent = 'DOMMouseScroll';
			}
			$('.'+options.wrapClass).bind(mousewheelEvent,function(event){
				var stepValue;
				var wheelValue = event.wheelDelta;
				//to down wheelValue<0 ; to up wheelValue>0
				if (vui.browser.firefox){
					wheelValue = - event.detail;
				}
			
				self.step(wheelValue);
				 event.preventDefault();
			});
		},
		//滚动条top --. 主体top
		setContentTop:function(scrollTopValue){
			 var H = obj.outerHeight();//主体高度
			var h1 = options.wrapHeight;//可视区域高度
			var h2 = this.getElementHeight($('.'+options.scrollClass));//滚动条高度
			var top = [( H - h1) / (h1-h2)] * scrollTopValue;
			obj.css({top:-top});
		},
		//拖拽init
		dragInit:function(){
			var self = this;
			vui.drag($('.'+options.scrollClass),{
				lockX:true,
				maxTop:0,
				maxBottom:options.wrapHeight-this.getElementHeight($('.'+options.scrollClass)),
				drag:self.drag
			});
		},
		//拖拽回调
		drag:function(top){
			o.setContentTop(top);
		},
		scrollTopValue:0,
		//鼠标滑轮滑动
		step:function(wheelValue){
			var H = obj.outerHeight();//主体高度
			var h1 = options.wrapHeight;//可视区域高度
			var h2 = this.getElementHeight($('.'+options.scrollClass));//滚动条高度

			var stepNumber = options.step * parseInt( (H-h1) / h1);//整除数
			var scrollStepValue = ( 1 / stepNumber ) * (h1-h2);

			if (wheelValue<0){
				this.scrollTopValue += scrollStepValue;
			}else{
				this.scrollTopValue -= scrollStepValue;
			}
			
			if (this.scrollTopValue>(h1-h2) && wheelValue<0){
				this.scrollTopValue=(h1-h2);
			}

			if (this.scrollTopValue<0 && wheelValue>0){
				this.scrollTopValue=0;
			}
			
			$('.'+options.scrollClass).css({top:this.scrollTopValue});
			this.setContentTop(this.scrollTopValue);
		},
				
		setScrollHeight:function(){
			var heightTemp =  obj.outerHeight() - options.wrapHeight;
			if (heightTemp<0){
				this.hide();
			}else{
				
				var H = obj.outerHeight();//主体所有高度
				var h1 = options.wrapHeight;//可视区域高度
				var h2 = parseInt ( ( h1 * h1 ) / H ); //滚动条高度
				if (h2<options.scrollMinHeight){
					h2 = options.scrollMinHeight;
				}
				$('.'+options.scrollClass).css({height:h2});
				this.show();
			}
		},

		getElementHeight:function(element){
			 var currentHeight = element.css('height');
			 var height = parseFloat(currentHeight.slice(0,currentHeight.length-2));
			 return height;
		},
		
		createWrap:function(){
			 var div = $(document.createElement('div'));
			 div.addClass(options.wrapClass);
			 obj.after(div);
			 div.append(obj);
			var $this = this;
			 var isScrollWrapCss = {
				position:'relative',
				overflow:'hidden',
				width:options.wrapWidth,
				height:options.wrapHeight,
				border:'2px solid blue'
			 };
			 div.css(isScrollWrapCss);
		},
		createScroll:function(){
			 var div = $(document.createElement('div'));
			 div.addClass(options.scrollClass);
			 obj.after(div);

			 var isScrollCss = {
				position:'absolute',
				right:0,
				top:0,
				width:options.scrollWidth,
				backgroundColor:'#333'
			 };
			 div.css(isScrollCss);
		},
		styleInit:function(){
			 obj.css({position:'absolute',left:0,top:0}) 
		},

		show:function(){
			 $('.'+options.scrollClass).show();
		},
		hide:function(){
			 $('.'+options.scrollClass).hide();
		}
	 }
	 
	 o.init();
}

/**
 * lang
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-03-14
 * @example vui.isEmpty('abc')
 */

/**
 * @name vui.isArray
 * @param {All} obj 主体
 * @return {Boolean} true/false
 */
vui.isArray = function(obj){
	return Object.prototype.toString.apply(obj) === '[object Array]';
}

/**
 * @name vui.isEmpty
 * @param {All} obj 主体
 * @return {Boolean} true/false
 */
vui.isEmpty = function (obj) {
    return obj === null || typeof obj === 'undefined' || 
			 obj === 0 || obj === false || obj === '' || 
			(typeof obj.length === 'number' && obj.length === 0);
  };

/**
 * @name vui.isNumber
 * @param {All} obj 主体
 * @return {Boolean} true/false
 */
vui.isNumber = function(obj){
	 return typeof(obj) === 'number';
}

/**
 * @name vui.isString
 * @param {All} obj 主体
 * @return {Boolean} true/false
 */
vui.isString = function(obj){
	 return typeof(obj) === 'string';
}

/**
 * @name vui.isBoolean
 * @param {All} obj 主体
 * @return {Boolean} true/false
 */
vui.isBoolean = function(obj){
	 return typeof(obj) === 'boolean';
}

/**
 * @name vui.isObject
 * @param {All} obj 主体
 * @return {Boolean} true/false
 */
vui.isObject = function(obj){
	 return typeof(obj) === 'object';
}

/**
 * @name vui.isFunction
 * @param {All} obj 主体
 * @return {Boolean} true/false
 */
vui.isFunction = function(obj){
	 return typeof(obj) === 'function';
}

/**
 * @name vui.isUndefined
 * @param {All} obj 主体
 * @return {Boolean} true/false
 */
vui.isUndefined = function(obj){
	 return o === undefined;
}

/**
 * @name vui.isNull
 * @param {All} obj 主体
 * @return {Boolean} true/false
 */
vui.isNull = function(obj){
	 return o === null;
}

/**
 * console.log方法(兼容IE)
 * @constructor
 * @author putaoshu@126.com
 * @param {All} text
 * @example vui.log('a')
 * @date 2012-02-08
 */

vui.log = function(text) {
	window.console && console.log(text);
}

/**
 * 字符限制(默认140字)
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-03-13
 * @param {Object} options 组件配置
 * @param {Number} options.max 140 字符数
 * @param {String} options.numClass 数字显示class
 * @param {String} options.btnClass 提交按钮class
 * @param {String} options.errorClass 提示错误的class
 * @example 
$("#nickname").maxLength({
	max:140,
	numClass : 'num',
	btnClass : 'btn',
	errorClass : 'error'
});

 */
vui.maxlength = vui.maxLength = function(options){
	var $this = $(this);

	options = $.extend({
		maxCharacters : 140,
		numClass : 'num',
		btnClass : 'btn',
		errorClass : 'W_error'
	},options)

	var $num = $('.'+options.numClass);
	var $btn = $('.'+options.btnClass);

	/**
	 * 字符串长度处理(长度1:2字母=1汉字)
	 * @param {String} str 需要进行处理的字符串
	 * @return {Number} 返回长度
	 * @example
		var nStrLength = getLength("中");	//return 1
		var nStrLength = getLength("aa");	//return 1
	 */
	function getLength(str){		
		var regexp = new RegExp('(http://)+(([-A-Za-z0-9]+(\.[-A-Za-z0-9]+)*(\.[-A-Za-z]{2,5}))|([0-9]{1,3}(\.[0-9]{1,3}){3}))(:[0-9]*)?(/[-A-Za-z0-9_\$\.\+\!\*\(\),;:@&=\?/~\#\%]*)*', 'gi')
		var len = str.length;
		if (len > 0){
			var min=41,max=140,tmp=str;
			var urls = str.match(regexp) || [];
			var urlCount = 0;
			for(var i=0,len=urls.length;i<len;i++){
				var count = byteLength(urls[i]);
				if(count>min){
					urlCount += count<=max?21:(21+ (count-max)/2);
					tmp = tmp.replace(urls[i],'');
				}
			};
			return Math.ceil(urlCount + byteLength(tmp) / 2)
		}else{
			return 0;
		}
	};

	/**
	 * 将unicode字符计算为2个
	 * @param {String} str 需要进行处理的字符串
	 * @return {Number} 返回长度
	 * @for byteLength
	 * @example
		var nStrLength = Core.String.byteLength("中");	//return 2
	 */
	function byteLength(str){
		if(typeof str == "undefined"){
			return 0;
		}
		var aMatch = str.match(/[^\x00-\x80]/g);
		return (str.length + (!aMatch ? 0 : aMatch.length));
	};
	
	
	function maxlength(){
		 var $thisLength = getLength($this.val());
		
		if($thisLength > options.maxCharacters){
			$num.html('<em>已超过</em><span class="errorNum">' + ($thisLength-options.maxCharacters) +'</span><em>字</em>' );
			$('span',$num).addClass(options.errorClass);
			$btn.attr('disabled','disabled');
		}else{
			$num.html('<em>还可以输入</em>' + (options.maxCharacters - $thisLength)  +'<em>字</em>');
			$('span',$num).removeClass(options.errorClass);
			$btn.attr('disabled','');
		}

		if($thisLength == 0){
			$btn.attr('disabled','disabled');
		}
	}

	//初始化
	maxlength();

	$this.keyup(function(){
		maxlength();
	});

};

/**
 * 下拉菜单
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-03-14
 * @param {Object} options 组件配置
 * @param {Object} options.menuTop $('#menuTop') 点击元素
 * @param {Object} options.menu $('#menu') 菜单主体
 * @param {Boolean} options.autoShow false 主体元素有被遮挡时,把主体转移到上面
 * @param {Object} options.css 
 * @param {Number} options.css.left 菜单left值
 * @param {Number} options.css.top 菜单top值
 * @requires vui.stick()
 */

vui.menu = function(options) {
	options = $.extend({
		menuTop : $('#menuTop'),//点击元素ID
		menu : $('#menu'),//菜单主体ID
		type : 'click', //click || hover
		autoShow : false,//自适应:即在主体元素有被遮挡时,把主体转移到上面
		css : {
			left:null,
			top:null
		}
	},options); 

	var o = {		
		init:function(){
			options.menu.appendTo('body');
			if(options.type == 'click'){
				o.clickhide();
				options.menuTop.mouseup(function(){
					if (o.showTag){
						o.close();
					}else{
						o.show();
					}
					return false;
					
				})
			}else if(options.type == 'hover'){
				options.menuTop.click(function(){
					o.show();
				})
				options.menuTop.bind('mouseover',function(){
					o.show();
				})
			}
		},
		showTag:false,
		show:function(){
			
			var $left,$top;
			if (options.css.left != null || options.css.top != null){
				vui.stick({stick:options.menuTop,stickTo:options.menu,autoShow:options.autoShow,css:{type:1,top:options.css.top,left:options.css.left}});
			}else{
				vui.stick({stick:options.menuTop,autoShow:options.autoShow,stickTo:options.menu});
			}
			o.showTag=true;
		},
		close:function(){
			  options.menu.hide();
			  o.showTag=false;
		},
		mouseInsideTag : false,
		clickhide:function(){
			
			options.menu.click(function(){
				o.close();
			})
			
			options.menu.hover(function(){ 
				o.mouseInsideTag=true; 
			}, function(){ 
				o.mouseInsideTag=false; 
			});

			$("html,body").mouseup(function(){ 
				if(o.mouseInsideTag){
					o.show();
				}else{
					o.close();
				}
			});
		}
	}

	o.init();
}

/**
 * vui client width,height
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-07-12
 * @return {Object} o o.clientWidth 窗口宽, o.clientHeight 窗口高, o.docWidth 整个页面宽, o.docHeight 整个页面高
 * @example vui.pageSize().clientWidth,vui.pageSize().clientHeight,vui.pageSize().docWidth,vui.pageSize().docHeight
 */
vui.pageSize = function (){
	var clientWidth,clientHeight,docWidth,docHeight;	
	
	var doc;
	doc = document.compatMode == "BackCompat" ? document.body : document.documentElement;
	
	clientWidth = doc.clientWidth;
	clientHeight = doc.clientHeight;
	docWidth = Math.max(clientWidth,doc.scrollWidth);
	docHeight = Math.max(clientHeight,doc.scrollHeight);

	var o = {};
	o.clientWidth = clientWidth;
	o.clientHeight = clientHeight;
	o.docWidth = docWidth;
	o.docHeight = docHeight;
	return o;
}

/**
 * 阻止鼠标滑轮滑动
 * @constructor
 * @name vui.preventScroll
 * @author putaoshu@126.com
 * @date 2012-05-14
 * @example vui.preventScroll.init();
 */

vui.preventScroll={
	 /** @lends vui.preventScroll*/
	//mousewheel事件:兼容FF
	mousewheelEvent : (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel",
	isIE: document.attachEvent ? true : false,
	/**
	 * 初始化
	 * @name vui.preventScroll.init
	 */
	init:function(){
		if(this.isIE){ 
			document.attachEvent("on" + this.mousewheelEvent,this.handler,false);
		}else{ 
			document.addEventListener(this.mousewheelEvent,this.handler,false);
		}
	},
	/**
	 * 移除阻止事件
	 * @name vui.preventScroll.destroy
	 */
	destroy:function(){
		if(this.isIE){ 
			document.detachEvent("on" + this.mousewheelEvent,this.handler,false);
		}else{
			document.removeEventListener(this.mousewheelEvent,this.handler,false);
		}
	},
	handler:function(event){
		if(vui.preventScroll.isIE){
			event.returnValue = false;
		}else{
			event.preventDefault();
		}
	}
}

/**
 * 转义引号
 * @param {String} content
 * @param {Mixed} quota_style 引号转义方式
 * 	1: SINGLE <a href='qq'>q</a> --> <a href=\'qq\'>q</a>
 *  2: DOUBLE(默认) <a href="qq">q</a> --> <a href=\"qq\">q</a>
 */
vui.quote = function(content, quote_style){
	if(typeof quote_style == 'undefined'){
		quote_style = 2;
	}
	//单引号
	if(quote_style == 1){
		content = content.replace(/'/g, '\\\'');
	}
	else if(quote_style == 2){
		content = content.replace(/"/g, '\\"');
	}
	return content;
}/**
 * 选中文字
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-06-14
 * @param {Object} obj 主对象
 * @param {Number} start 开始位置
 * @param {Number} last 结束位置
 * @see 应用对象input,textarea dom
 * @example  vui.selectCode($('#rename'),0,3);
 */

 vui.selectCode = function(obj,start,last){
	var objLength = obj.value.length;
	if (start<0 || last<0){
		return;
	}

	if (start>objLength){
		start=objLength;
	}

	if (last>objLength){
		last=objLength;
	}

	 if (obj.createTextRange){
		//IE
		var range = obj.createTextRange();
		range.moveStart("character",-objLength);              
		range.moveEnd("character",-objLength);
		range.moveStart('character',start);
		range.moveEnd('character',last);
		range.select();
 	 }else{
		//other
		obj.setSelectionRange(start,last);
		obj.focus();
	 }
}

/**
 * 选中文件名中非扩展名部分
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-06-14
 * @param {Object} obj 主对象
 * @param {String} 'all' 全部选中
 * @require  vui.selectCode
 * @example  vui.selectFileName($('#rename'));
 */

 vui.selectFileName = function(obj,all){
	var filename = obj.value;
	 var lastDotPlace = filename.lastIndexOf('.');
	 if (lastDotPlace==-1 || all == 'all'){
		lastDotPlace = filename.length;
	 }

	 //to select code
	 vui.selectCode(obj,0,lastDotPlace);
}

/**
 * stick
 * @constructor
 * @author putaoshu@126.com
 * @date 2012-03-20
 * @param {Object} options 组件配置
 * @param {Object} options.obj null 粘到那个元素上
 * @param {Object} options.stickTo null 被粘的对象
 * @param {Boolean} options.resize true 窗口有变更自动更新
 * @param {Boolean} options.autoShow false 主体元素有被遮挡时,把主体转移到上面
 * @param {Object} options.css
 * @param {Number} options.css.type 0 输入偏移量,1为默认输入
 * @param {String} options.css.position 'absolute' position
 * @param {Number}  options.css.top 0 向上的偏移量
 * @param {Number}  options.css.left 0 向左的偏移量
 * @param {Number}  options.css.zIndex 2 zIndex
 * @example 
vui.stick({
	stick:$('#more'),
	stickTo:$('#moreOperateLayer'),
	autoShow:true,
	css:{
		top:3,
		left:0,
		zIndex:20
	}
});
 */

vui.stick = function(options) {

	options = $.extend({
		stick :null,
		stickTo : null,
		resize : true,//窗口有变更自动更新
		autoShow : false,//自适应:即在主体元素有被遮挡时,把主体转移到上面
		css:{
			type:0,
			position:'absolute',
			top : 0,
			left : 0,
			zIndex : 2
		}
	},options);

	function getStyle(){
		var offsetResult = {};
		if (options.css.type){
			offsetResult = {
				top: options.css.top,
				left: options.css.left
			}

			//自适应:即在主体元素有被遮挡时,把主体转移到上面
			if (options.autoShow){
				var docHeight = $(window).height()+$(document).scrollTop();
				var coreTop = offsetResult.top+options.stickTo.outerHeight();
				if (coreTop>docHeight){
					offsetResult.top = offsetResult.top - options.stickTo.outerHeight();
				}
			}

		}else{
			offsetResult = {
				top: options.stick.offset().top + options.css.top + options.stick.outerHeight(),
				left: options.stick.offset().left + options.css.left
			}

			//自适应:即在主体元素有被遮挡时,把主体转移到上面
			if (options.autoShow){
				var docHeight = $(window).height()+$(document).scrollTop();
				var coreTop = offsetResult.top+options.stickTo.outerHeight();
				if (coreTop>docHeight){
					offsetResult.top = options.stick.offset().top - options.stickTo.outerHeight();
				}
			}
		}
		
		return offsetResult;
	}

	options.stickTo.css({position:'absolute',zIndex:options.css.zIndex,top:getStyle().top,left:getStyle().left}).show();

	if (options.resize){
		$(window).resize(function(){
			options.stickTo.css(getStyle());
		});
	}
}

/**
 * 截取字符串(默认为10个字符)
 * @param string str 传入的字符
 * @param int len 截取长度(单位为汉字，即2个字符)
 * @param boolean hasDot 是否加上...
 * @return string
 */

vui.substr=function(str, len, hasDot){ 
	if (str==null) return;
	if(typeof len=='undefined') len=10;
	len*=2;
	if(typeof hasDot=='undefined') hasDot=true;
	var newLength = 0; 
	var newStr = ""; 
	var chineseRegex = /[^\x00-\xff]/g;
	var singleChar = ""; 
	var strLength = str.replace(chineseRegex,"**").length; 
	for(var i = 0;i < strLength;i++) { 
		singleChar = str.charAt(i).toString(); 
		if(singleChar.match(chineseRegex) != null){ 
			newLength += 2; 
		}else{ 
			newLength++; 
		} 
		if(newLength > len){ 
			break; 
		}
		newStr += singleChar; 
	} 
	 
	if(hasDot && strLength > len){ 
		newStr += "..."; 
	} 
	return newStr; 
}/**
 * 节流函数
 * @form https://github.com/documentcloud/underscore/blob/master/underscore.js
 * @param {Function} func 要节流的函数
 * @param {Number} wait 延时时间
 * @example 
	var main= function(){
		//todo
	};
	var throttled = throttle(main,200);
	$(window).on('scroll',throttled);
 */

vui.throttle = function(func, wait) {
	var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
}
