/**
 * Model类
 * @name Model
 * @namespace
 * @class
 * @constructor
 * @property {String} id model唯一标识
 */
var IsObject = G_IsObject;
var ToString = Magix.toString;
var URL = 'URL',
    FORM = 'FORM';

var Model = function() {
    this.id = 'm' + COUNTER++;
};
var SetParams = function(type) {
    return function(obj1, obj2, ignoreIfExist) {
        var me = this,
            k = '\u001a' + type,
            t, p, obj;
        if (!me[k]) me[k] = {};
        obj = me[k];
        if (G_IsFunction(obj1)) {
            obj1 = Magix.toTry(obj1);
        }
        if (obj1 && !IsObject(obj1)) {
            t = {};
            t[obj1] = obj2; //like a=b&c=d => {'a=b&c=d':''}
            obj1 = t;
        }
        for (p in obj1) {
            if (!ignoreIfExist || !Has(obj, p)) {
                obj[p] = obj1[p];
            }
        }
    };
};

Magix.mix(Model.prototype, {
    /**
     * @lends Model#
     */
    /**
     * url映射对象
     * @type {Object}
     */
    /*urlMap: {

    },*/
    /**
     * Model调用request方法后，与服务器同步的方法，供应用开发人员覆盖
     * @function
     * @param {Function} callback 请求完成后的回调，回调时第1个参数是错误对象，第2个是数据
     * @return {XHR} 最好返回异步请求的对象
     */
    sync: NOOP,
    /**
     * 处理Model.sync成功后返回的数据
     * @function
     * @param {Object|String} resp 返回的数据
     * @return {Object}
     */
    /* parse: function(r) {
        return r;
    },*/
    /**
     * 获取参数对象
     * @param  {String} [type] 参数分组的key[URL,FORM]，默认为URL
     * @return {Object}
     */
    /*getParamsObject:function(type){
            if(!type)type=URL;
            return this['\u001a'+type]||null;
        },*/
    /**
     * 获取参数对象
     * @return {Object}
     */
    /* getUrlParamsObject:function(){
            return this.getParamsObject(URL);
        },*/
    /**
     * 获取Post参数对象
     * @return {Object}
     */
    /*getPostParamsObject:function(){
            return this.getParamsObject(FORM);
        },*/
    /**
     * 获取通过setFormParams放入的参数
     * @return {Object}
     */
    getFormParams: function() {
        return this['\u001a' + FORM];
    },
    /**
     * 获取通过setUrlParams放入的参数
     * @return {Object}
     */
    getUrlParams: function() {
        return this['\u001a' + URL];
    },
    /**
     * 获取参数
     * @param {String} [type] 参数分组的key[URL,FORM]，默认为URL
     * @return {String}
     */

    /*var k = '\u001a' + type;
        var params = me[k];
        var arr = [];
        var v;
        for (var p in params) {
            v = params[p];
            if (v == Model.X && p.indexOf('=') > -1) { //undefined and key like a=b&c=d
                arr.push(p);
            } else {
                arr.push(p + '=' + Encode(v));
            }
            /*if (!G_IsArray(v)) {
                v = [v];
            }
            for (var i = 0; i < v.length; i++) {
                arr.push(p + '=' + Encode(v[i]));
            }*/
    /*}
        return arr.join('\u001a');*/
    /**
     * 设置FORM参数
     * @function
     * @param {Object|String} obj1 参数对象或者参数key
     * @param {String} [obj2] 参数内容
     * @param {Boolean} [ignoreIfExist] 如果存在，则忽略本次的设置
     */
    setFormParams: SetParams(FORM),
    /**
     * 设置url参数
     * @function
     * @param {Object|String} obj1 参数对象或者参数key
     * @param {String} [obj2] 参数内容
     * @param {Boolean} [ignoreIfExist] 如果存在，则忽略本次的设置
     */
    setUrlParams: SetParams(URL),
    /**
     * @private
     */
    /*removeParamsObject:function(type){
            if(!type)type=URL;
            delete this['\u001a'+type];
        },*/
    /**
     * @private
     */
    /*removePostParamsObject:function(){
            this.removeParamsObject(FORM);
        },*/
    /**
     * @private
     */
    /*removeUrlParamsObject:function(){
            this.removeParamsObject(URL);
        },*/
    /**
     * 重置缓存的参数对象，对于同一个model反复使用前，最好能reset一下，防止把上次请求的参数也带上
     */
    /*reset: function() {
        var me = this;
        var keysCache = me.$types;
        if (keysCache) {
            for (var p in keysCache) {
                delete me['\u001a' + p];
            }
            delete me.$types;
        }
        var keys = me.$keys;
        var attrs = me.$attrs;
        if (keys) {
            for (var i = 0; i < keys.length; i++) {
                delete attrs[keys[i]];
            }
            delete me.$keys;
        }
    },*/
    /**
     * 获取属性
     * @param {String} [key] 要获取数据的key
     * @param {Object} [dValue] 当根据key取到的值为falsy时，使用默认值替代，防止代码出错
     * @return {Object}
     * @example
     * MM.fetchAll({
     *     name:'Test'
     * },function(e,m){
     *     var obj=m.get();//获取所有数据
     *
     *     var list=m.get('list',[]);//获取list数据，如果不存在list则使用空数组
     *
     *     var count=m.get('data.info.count',0);//获取data下面info下count的值，您无须关心data下是否有info属性
     *     console.log(list);
     * });
     */
    get: function(key, dValue, udfd) {
        var me = this;
        var alen = arguments.length;

        var hasDValue = alen == 2;
        var attrs = me.$attrs;
        if (alen) {
            var tks = (key + EMPTY).split('.');
            while (attrs && tks[0]) {
                attrs = attrs[tks.shift()];
            }
            if (tks[0]) {
                attrs = udfd;
            }
        }
        if (hasDValue && ToString.call(dValue) != ToString.call(attrs)) {
            attrs = dValue;
        }
        return attrs;
    },
    /**
     * 设置属性
     * @param {String|Object} key 属性对象或属性key
     * @param {Object} [val] 属性值
     */
    set: function(key, val) {
        var me = this;
        if (!me.$attrs) me.$attrs = {};
        /* if (saveKeyList && !me.$keys) {
            me.$keys = [];
        }*/
        if (key) {
            if (!IsObject(key)) {
                var t = {};
                t[key] = val;
                key = t;
            }
            for (var p in key) {
                //if (!Has(val, p)) {
                me.$attrs[p] = key[p];
                //}
            }
        }
    },
    /**
     * 向服务器请求，加载或保存数据
     * @param {Function} callback 请求成功或失败的回调
     */
    request: function(callback, options) {
        var me = this;
        me.sync(function(err, data) {
            if (!IsObject(data)) {
                data = {
                    data: data
                };
            }
            me.set(data);
            callback(err, options);
        });
    }
});

Magix.Model = Model;