/**
 * @fileOverview 对magix/view的扩展
 * @version 1.1
 * @author 行列
 */
KISSY.add('mxext/view', function(S, Magix, View, Router) {
    var WIN = window;
var ResCounter = 0;
var SafeExec = Magix.safeExec;
var Has = Magix.has;
var EMPTYARR = [];

var RenderCallStr = 'rendercall';
var DestroyStr = 'destroy';

var DestroyTimer = function(id) {
    WIN.clearTimeout(id);
    WIN.clearInterval(id);
};

var Destroy = function(res) {
    var fn = res && res[DestroyStr];
    if (fn) {
        SafeExec(fn, EMPTYARR, res);
    }
};

var DestroyAllManaged = function(e) {
    var me = this;
    var cache = me.$res;
    var onlyMR = e.type == RenderCallStr;
    var keepIt = e.type != DestroyStr;

    for (var p in cache) {
        var c = cache[p];
        if (!onlyMR || c.mr) {
            me.destroyManaged(p, keepIt);
        }
    }
};

/**
 * 内置的view扩展，提供资源管理等
 * @name MxView
 * @namespace
 * @constructor
 * @augments View
 */
var MxView = View.extend({
    /**
     * @lends MxView#
     */
    /**
     * 调用magix/router的navigate方法
     * @function
     */
    navigate: Router.navigate,
    /**
     * 让view帮你管理资源，强烈建议对组件等进行托管
     * @param {String|Object} key 托管的资源或要共享的资源标识key
     * @param {Object} res 要托管的资源
     * @param {Boolean} [lastly] 是否在最终view销毁时才去销毁这个托管的资源，如果该参数为true时，可以调用destroyManaged来销毁这个资源
     * @return {Object} 返回传入的资源
     * @example
     * init:function(){
     *      this.manage('user_list',[//管理对象资源
     *          {id:1,name:'a'},
     *          {id:2,name:'b'}
     *      ],true);//仅在view销毁时才销毁这个托管的资源
     * },
     * render:function(){
     *      var _self=this;
     *      var m=new Model();
     *      m.load({
     *          success:function(resp){
     *              //TODO
     *              var brix=new BrixDropdownList();
     *
     *              _self.manage(brix);//管理组件
     *
     *              var pagination=_self.manage(new BrixPagination());//也可以这样
     *
     *              var timer=_self.manage(setTimeout(function(){
     *                  S.log('timer');
     *              },2000));//也可以管理定时器
     *
     *
     *              var userList=_self.getManaged('user_list');//通过key取托管的资源
     *
     *              S.log(userList);
     *          },
     *          error:function(msg){
     *              //TODO
     *          }
     *      });
     *
     *      _self.manage(m);
     * }
     */
    manage: function(key, res, lastly) {
        var me = this;
        var args = arguments;
        var hk = 1;

        var cache = me.$res;
        if (args.length == 1) {
            res = key;
            key = 'res_' + (ResCounter++);
            hk = 0;
        } else {
            //var old = cache[key];
            //if (old && old.res != res) { //销毁同key不同资源的旧资源
            me.destroyManaged(key); //
            //}
        }
        var oust;
        if (Magix._n(res)) {
            oust = DestroyTimer;
        } else {
            oust = Destroy;
        }
        var wrapObj = {
            hk: hk,
            res: res,
            ol: lastly,
            mr: res && res.$reqs,
            oust: oust
        };
        cache[key] = wrapObj;
        return res;
    },
    /**
     * 获取托管的资源
     * @param {String} key 托管资源时传入的标识key
     * @param {Boolean} [remove] 获取后是否从缓存中移除
     * @return {Object}
     */
    getManaged: function(key, remove) {
        var me = this;
        var cache = me.$res;
        var res = null;
        if (Has(cache, key)) {
            var wrapObj = cache[key];
            res = wrapObj.res;
            if (remove) {
                delete cache[key];
            }
        }
        return res;
    },
    /**
     * 移除托管的资源
     * @param {String|Object} key 托管时标识key或托管的对象
     * @return {Object} 返回移除的资源
     */
    removeManaged: function(key) {
        return this.getManaged(key, 1);
    },
    /**
     * 销毁托管的资源
     * @function
     * @param {String} key manage时提供的资源的key
     * @param {Boolean} [keepIt] 销毁后是否依然在缓存中保留该资源的引用
     * @return {Object} 返回销毁的托管资源
     */
    destroyManaged: function(key, keepIt) {
        var me = this;
        var cache = me.$res;
        var o = cache[key];
        var res;
        if (o && (!keepIt || !o.ol) /*&& (!o.mr || o.sign != view.sign)*/ ) { //暂不考虑render中多次setViewHTML的情况
            //var processed=false;
            res = o.res;
            o.oust(res);
            if (!o.hk || !keepIt) { //如果托管时没有给key值，则表示这是一个不会在其它方法内共享托管的资源，view刷新时可以删除掉
                delete cache[key];
            }
            /*me.fire('destroyManaged', {
                resource: res,
                processed: processed
            });*/
        }
        return res;
    }
}, function() {
    var me = this;
    me.$res = {};
    me.on('interact', function() {
        me.on(RenderCallStr, DestroyAllManaged);
        me.on('prerender', DestroyAllManaged);
        me.on(DestroyStr, DestroyAllManaged);
    });
    SafeExec(MxView.ms, arguments, me);
}, {
    ms: [],
    mixin: function(props, ctor) {
        if (ctor) MxView.ms.push(ctor);
        Magix.mix(MxView.prototype, props);
    }
});
    return MxView;
}, {
    requires: ["magix/magix", "magix/view", "magix/router"]
});