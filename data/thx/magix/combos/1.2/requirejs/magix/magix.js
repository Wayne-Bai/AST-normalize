/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.2
 **/
define('magix/magix', ['jquery'], function($) {

    var Include = function(path, mxext) {
        var mPath = require.s.contexts._.config.paths[mxext ? 'mxext' : 'magix'];
        var url = mPath + path + ".js?r=" + Math.random() + '.js';
        var xhr = window.ActiveXObject || window.XMLHttpRequest;
        var r = new xhr('Microsoft.XMLHTTP');
        r.open('GET', url, false);
        r.send(null);
        return r.responseText;
    };
    var PathRelativeReg = /\/\.(?:\/|$)|\/[^\/]+?\/\.{2}(?:\/|$)|\/\/+|\.{2}\//; // ./|/x/../|(b)///
var PathTrimFileReg = /\/[^\/]*$/;
var PathTrimParamsReg = /[#?].*$/;
var ParamsReg = /([^=&?\/#]+)=?([^&#?]*)/g;
var QueryParamsReg = /\?|(?!^)=/;
var ProtocalReg = /^https?:\/\//i;
var SLASH = '/';
var DefaultTagName = 'vframe';
var Console = window.console;
var SupportError = Console && Console.error;
/**
待重写的方法
@method imimpl
**/
var Unimpl = function() {
    throw new Error('unimplement method');
};

var Cfg = {
    tagName: DefaultTagName,
    rootId: 'magix_vf_root',
    coded: 1,
    error: SupportError ? function(e) {
        Console.error(e);
    } : NOOP
};
var HasProp = Cfg.hasOwnProperty;
/**
 * 检测某个对象是否拥有某个属性
 * @param  {Object}  owner 检测对象
 * @param  {String}  prop  属性
 * @return {Boolean} 是否拥有prop属性
 */
var Has = function(owner, prop) {
    return owner && HasProp.call(owner, prop); //false 0 null '' undefined
};
var GSObj = function(o) {
    return function(k, v, r) {
        switch (arguments.length) {
            case 0:
                r = o;
                break;
            case 1:
                if (Magix._o(k)) {
                    r = Mix(o, k);
                } else {
                    r = Has(o, k) ? o[k] : null;
                }
                break;
            case 2:
                if (v === null) {
                    delete o[k];
                    r = v;
                } else {
                    o[k] = r = v;
                }
                break;
        }
        return r;
    };
};
var CacheSort = function(a, b) {
    return b.f - a.f || b.t - a.t;
};
var Cache = function(max, buffer) {
    var me = this;
    if (me.get) {
        me.c = [];
        me.b = buffer | 0 || 5; //buffer先取整，如果为0则再默认5
        me.x = me.b + (max || 20);
    } else {
        me = new Cache(max, buffer);
    }
    return me;
};

/**
 * 混合对象的属性
 * @param  {Object} aim    要mix的目标对象
 * @param  {Object} src    mix的来源对象
 * @param  {Object} ignore 在复制时，忽略的值
 * @return {Object}
 */
var Mix = function(aim, src, ignore, p) {
    for (p in src) {
        if (!ignore || !Has(ignore, p)) {
            aim[p] = src[p];
        }
    }
    return aim;
};

Mix(Cache.prototype, {
    get: function(key) {
        var me = this;
        var c = me.c;
        var r;
        key = '\u001a' + key;
        if (Has(c, key)) {
            r = c[key];
            if (r.f >= 1) {
                r.f++;
                r.t = COUNTER++;
                //
                r = r.v;
                //
            }
        }
        return r;
    },
    list: function() {
        return this.c;
    },
    set: function(okey, value, onRemove) {
        var me = this;
        var c = me.c;

        var key = '\u001a' + okey;
        var r = c[key];

        if (!Has(c, key)) {
            if (c.length >= me.x) {
                c.sort(CacheSort);
                var t = me.b;
                while (t--) {
                    r = c.pop();
                    /*
                        排序删除时，只有未删除过的才进行删除操作

                        case:
                            set('a',data);先设置一个a
                            del('a');//删除它，c上面没有了，但列表里还有

                            set('a',data1);//设置一个新的
                            //...
                            sort()//排序，此时删除的第一个data在最后

                     */
                    if (r.f > 0) me.del(r.o);
                }
            }
            r = {
                o: okey
            };
            c.push(r);
            c[key] = r;
        }
        r.v = value;
        r.f = 1;
        r.t = COUNTER++;
        r.m = onRemove;
        return value;
    },
    del: function(k) {
        k = '\u001a' + k;
        var c = this.c;
        var r = c[k];
        if (r) {
            r.f = -1;
            r.v = EMPTY;
            delete c[k];
            if (r.m) {
                SafeExec(r.m, r.o, r);
                r.m = EMPTY;
            }
        }
    },
    has: function(k) {
        return Has(this.c, '\u001a' + k);
    }
});

var PathToObjCache = Cache(40);
var PathCache = Cache();

/**
 * 以try cache方式执行方法，忽略掉任何异常
 * @param  {Array} fns     函数数组
 * @param  {Array} args    参数数组
 * @param  {Object} context 在待执行的方法内部，this的指向
 * @return {Object} 返回执行的最后一个方法的返回值
 */
var SafeExec = function(fns, args, context, i, r, e) {
    if (!Magix._a(fns)) {
        fns = [fns];
    }
    if (!args || (!Magix._a(args) && !args.callee)) {
        args = [args];
    }
    for (i = 0; i < fns.length; i++) {
        /*_*/try{/*_*/
        e = fns[i];
        r = e && e.apply(context, args);
        /*_*/}catch(x){/*_*/
             Cfg.error(x);/*_*/
        /*_*/}/*_*/
    }
    return r;
};

var ParamsFn = function(match, name, value) {
    if (Cfg.coded) {
        try {
            value = decodeURIComponent(value);
        } catch (e) {

        }
    }
    ParamsFn.p[name] = value;
};

/**
 * Magix对象，提供常用方法
 * @name Magix
 * @namespace
 */
var Magix = {
    /**
     * @lends Magix
     */
    /**
     * 判断o是否为数组
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    //_a: Unimpl,
    /**
     * 判断o是否为对象
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    //isObject: Unimpl,
    /**
     * 判断o是否为函数
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    //isFunction: Unimpl,
    /**
     * 判断o是否为正则
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    //isRegExp: Unimpl,
    /**
     * 判断o是否为字符串
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    //isString: Unimpl,
    /**
     * 判断o是否为数字
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    //isNumber: Unimpl,
    /**
     * 判断是否可转为数字
     * @param  {Object}  o 待检测的对象
     * @return {Boolean}
     */
    /*  isNumeric: function(o) {
        return !isNaN(parseFloat(o)) && isFinite(o);
    },*/
    /**
     * 利用底层类库的包机制加载js文件，仅Magix内部使用，不推荐在app中使用
     * @function
     * @param {String} name 形如app/views/home这样的字符串
     * @param {Function} fn 加载完成后的回调方法
     * @private
     */
    use: Unimpl,
    /**
     * 通过xhr同步获取文件的内容，仅开发magix自身时使用
     * @function
     * @param {String} path 文件路径
     * @return {String} 文件内容
     * @private
     */
    include: Unimpl,
    /**
     * 把src对象的值混入到aim对象上
     * @function
     * @param  {Object} aim    要mix的目标对象
     * @param  {Object} src    mix的来源对象
     * @param  {Object} [ignore] 在复制时，需要忽略的key
     * @example
     *   var o1={
     *       a:10
     *   };
     *   var o2={
     *       b:20,
     *       c:30
     *   };
     *
     *   Magix.mix(o1,o2);//{a:10,b:20,c:30}
     *
     *   Magix.mix(o1,o2,{c:true});//{a:10,b:20}
     *
     *
     * @return {Object}
     */
    mix: Mix,
    /**
     * 未实现的方法
     * @function
     * @type {Function}
     * @private
     */
    unimpl: Unimpl,
    /**
     * 检测某个对象是否拥有某个属性
     * @function
     * @param  {Object}  owner 检测对象
     * @param  {String}  prop  属性
     * @example
     *   var obj={
     *       key1:undefined,
     *       key2:0
     *   }
     *
     *   Magix.has(obj,'key1');//true
     *   Magix.has(obj,'key2');//true
     *   Magix.has(obj,'key3');//false
     *
     *
     * @return {Boolean} 是否拥有prop属性
     */
    has: Has,
    /**
     * 以try catch的方式执行方法，忽略掉任何异常
     * @function
     * @param  {Array} fns     函数数组
     * @param  {Array} args    参数数组
     * @param  {Object} context 在待执行的方法内部，this的指向
     * @return {Object} 返回执行的最后一个方法的返回值
     * @example
     * var f1=function(){
     *      throw new Error('msg');
     * };
     *
     * var f2=function(msg){
     *      return 'new_'+msg;
     * };
     *
     * var result=Magix.tryCall([f1,f2],new Date().getTime());
     *
     * S.log(result);//得到f2的返回值
     */
    tryCall: SafeExec,
    /**
     * 配置信息对象
     */
    /**
     * 设置或获取配置信息
     * @function
     * @param {Object} [cfg] 配置信息对象
     * @return {Object} 配置信息对象
     * @example
     * Magix.config({
     *      naviveHistory:true,
     *      rootId:'J_app_main'
     * });
     *
     * var config=Magix.config();
     *
     * S.log(config.rootId);
     */
    config: GSObj(Cfg),
    /**
     * 应用初始化入口
     * @param  {Object} cfg 初始化配置参数对象
     * @param {Boolean} cfg.edge 是否使用浏览器最新的行为处理history，如html5时，浏览器支持的情况下会用history.pushState修改url，您应该确保服务器能给予支持。如果edge为false将使用hash修改url
     * @param {String} cfg.defaultView 默认加载的view
     * @param {String} cfg.defaultPath 当无法从地址栏取到path时的默认值。比如使用hash保存路由信息，而初始进入时并没有hash,此时defaultPath会起作用
     * @param {String} cfg.unfoundView 404时加载的view
     * @param {Object} cfg.routes pathname与view映射关系表
     * @param {String} cfg.iniFile ini文件位置
     * @param {String} cfg.rootId 根view的id
     * @param {Array} cfg.extensions 需要加载的扩展
     * @param {Boolean} cfg.coded 是否对地址栏中的参数进行编码或解码，默认true
     * @param {Function} cfg.error 发布版以try catch执行一些用户重写的核心流程，当出错时，允许开发者通过该配置项进行捕获。注意：您不应该在该方法内再次抛出任何错误！
     * @example
     * Magix.start({
     *      edge:true,
     *      rootId:'J_app_main',
     *      iniFile:'',//是否有ini配置文件
     *      defaultView:'app/views/layouts/default',//默认加载的view
     *      defaultPath:'/home',
     *      routes:{
     *          "/home":"app/views/layouts/default"
     *      }
     * });
     */
    start: function(cfg) {
        var me = this;
        Mix(Cfg, cfg);
        me.use(['magix/router', 'magix/vom', cfg.iniFile], function(R, V, I) {
            Cfg = Mix(Cfg, I, cfg);
            Cfg['!tnc'] = Cfg.tagName != DefaultTagName;

            R.on('!ul', V.loc);
            R.on('changed', V.loc);

            me.use(Cfg.extensions || Cfg.exts, R.start);
        });
    },
    /**
     * 获取对象的keys
     * @function
     * @param  {Object} obj 要获取key的对象
     * @example
     *    var obj={
     *        key1:20,
     *        key2:60,
     *        a:3
     *    };
     *
     *    Magix.keys(obj);//['key1','key2','a']
     *
     * @return {Array}
     */
    keys: Object.keys || function(obj) {
        var keys = [],
            p;
        for (p in obj) {
            if (Has(obj, p)) {
                keys.push(p);
            }
        }
        return keys;
    },
    /**
     * 获取或设置本地数据，您可以把整个app需要共享的数据，通过该方法进行全局存储，方便您在任意view中访问这份数据
     * @function
     * @param {String|Object} key 获取或设置数据的key
     * @param {[type]} [val] 设置的对象
     * @return {Object|Undefined}
     * @example
     * Magix.local({//以对象的形式存值
     *      userId:'58782'
     * });
     *
     * Magix.local('userName','xinglie.lkf');
     *
     * var userId=Magix.local('userId');//获取userId
     *
     * var locals=Magix.local();//获取所有的值
     *
     * S.log(locals);
     */
    local: GSObj({}),
    /**
     * 路径
     * @param  {String} url  参考地址
     * @param  {String} part 相对参考地址的片断
     * @return {String}
     * @example
     * http://www.a.com/a/b.html?a=b#!/home?e=f   /   => http://www.a.com/
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ./     =>http://www.a.com/a/
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ../../    => http://www.a.com/
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ./../  => http://www.a.com/
     */
    path: function(url, part) {
        var key = url + '\u001a' + part;
        var result = PathCache.get(key),
            domain = EMPTY,
            idx;
        if (!PathCache.has(key)) { //有可能结果为空，url='' path='';
            if (ProtocalReg.test(url)) {
                idx = url.indexOf(SLASH, 8);
                if (idx < 0) idx = url.length;
                domain = url.slice(0, idx);
                url = url.slice(idx);
            }
            url = url.replace(PathTrimParamsReg, EMPTY).replace(PathTrimFileReg, SLASH);

            if (ProtocalReg.test(part) || part.charAt(0) == SLASH) {
                url = EMPTY;
            }
            result = url + part;
            while (PathRelativeReg.test(result)) {
                result = result.replace(PathRelativeReg, SLASH);
            }
            PathCache.set(key, result = domain + result);
        }
        return result;
    },
    /**
     * 把路径字符串转换成对象
     * @param  {String} path 路径字符串
     * @return {Object} 解析后的对象
     * @example
     * var obj=Magix.toObject('/xxx/?a=b&c=d');
     * //obj={path:'/xxx/',params:{a:'b',c:'d'}}
     */
    toObject: function(path) {
        //把形如 /xxx/?a=b&c=d 转换成对象 {path:'/xxx/',params:{a:'b',c:'d'}}
        //1. /xxx/a.b.c.html?a=b&c=d  path /xxx/a.b.c.html
        //2. /xxx/?a=b&c=d  path /xxx/
        //3. /xxx/#?a=b => path /xxx/
        //4. /xxx/index.html# => path /xxx/index.html
        //5. /xxx/index.html  => path /xxx/index.html
        //6. /xxx/#           => path /xxx/
        //7. a=b&c=d          => path ''
        //8. /s?src=b#        => path /s params:{src:'b'}
        var r = PathToObjCache.get(path),
            params, pathname;
        if (!r) {
            ParamsFn.p = params = {};
            pathname = path.replace(PathTrimParamsReg, EMPTY);
            if (QueryParamsReg.test(pathname)) { //考虑 YT3O0sPH1No= base64后的pathname
                pathname = EMPTY;
            }
            path.replace(pathname, EMPTY).replace(ParamsReg, ParamsFn);
            PathToObjCache.set(path, r = [pathname, params]);
        }
        return {
            path: r[0],
            params: Mix({}, r[1])
        };
    },
    /**
     * 转换成字符串路径
     * @param  {String} path 路径
     * @param {Object} params 参数对象
     * @param {Object} [keo] 保留空白值的对象
     * @return {String} 字符串路径
     * @example
     * var str=Magix.toUrl('/xxx/',{a:'b',c:'d'});
     * //str==/xxx/?a=b&c=d
     *
     * var str=Magix.toUrl('/xxx/',{a:'',c:2});
     *
     * //str==/xxx/?a=&c=2
     *
     * var str=Magix.toUrl('/xxx/',{a:'',c:2},{c:1});
     *
     * //str==/xxx/?c=2
     * var str=Magix.toUrl('/xxx/',{a:'',c:2},{a:1,c:1});
     *
     * //str==/xxx/?a=&c=2
     */
    toUrl: function(path, params, keo) { //上个方法的逆向
        var arr = [];
        var v, p, f;
        for (p in params) {
            v = params[p];
            if (!keo || v || Has(keo, p)) {
                if (Cfg.coded) {
                    v = encodeURIComponent(v);
                }
                f = 1;
                arr.push(p + '=' + v);
            }
        }
        if (f) {
            path = (path && path + (QueryParamsReg.test(path) ? '&' : '?')) + arr.join('&');
        }
        return path;
    },
    /**
     * 读取或设置view的模板
     * @param  {String} key   形如~seed/app/common/footer的字符串
     * @param  {String} [value] 模板字符串
     * @return {String}
     */
    /*tmpl: function(key, value) {
        if (arguments.length == 1) {
            return {
                v: Templates[key],
                h: has(Templates, key)
            };
        }
        Templates[key] = value;
        return value;
    },*/
    /**
     * 把列表转化成hash对象
     * @param  {Array} list 源数组
     * @param  {String} key  以数组中对象的哪个key的value做为hahs的key
     * @return {Object}
     * @example
     * var map=Magix.toMap([1,2,3,5,6]);
     * //=> {1:1,2:1,3:1,4:1,5:1,6:1}
     *
     * var map=Magix.toMap([{id:20},{id:30},{id:40}],'id');
     * //=>{20:{id:20},30:{id:30},40:{id:40}}
     */
    toMap: function(list, key) {
        var i, e, map = {}, l, hasKey = arguments.length > 1;
        if (list && (l = list.length)) {
            for (i = 0; i < l; i++) {
                e = list[i];
                map[hasKey ? e[key] : e] = hasKey ? e : (map[e] | 0) + 1; //对于简单数组，采用累加的方式，以方便知道有多少个相同的元素
            }
        }
        return map;
    },
    /**
     * 创建缓存对象
     * @function
     * @param {Integer} max 最大缓存数
     * @param {Integer} buffer 缓冲区大小
     * @example
     * var c=Magix.cache(5,2);//创建一个可缓存5个，且缓存区为2个的缓存对象
     * c.set('key1',{});//缓存
     * c.get('key1');//获取
     * c.del('key1');//删除
     * c.has('key1');//判断
     * //注意：缓存通常配合其它方法使用，不建议单独使用。在Magix中，对路径的解释等使用了缓存。在使用缓存优化性能时，可以达到节省CPU和内存的双赢效果
     */
    cache: Cache
};
    var T = function() {};
    return Mix(Magix, {
        include: Include,
        use: function(name, fn) {
            if (name) {
                if (!$.isArray(name)) {
                    name = [name];
                }
                require(name, fn);
            } else if (fn) {
                fn();
            }
        },
        _a: $.isArray,
        _f: $.isFunction,
        _s: function(o) {
            return $.type(o) == 'string';
        },
        _o: function(o) {
            return $.type(o) == 'object';
        },
        /*isRegExp: function(r) {
            return ToString.call(r) == '[object RegExp]';
        },*/
        extend: function(ctor, base, props, statics) {
            var bProto = base.prototype;
            bProto.constructor = base;
            T.prototype = bProto;
            var cProto = new T();
            Mix(cProto, props);
            Mix(ctor, statics);
            cProto.constructor = ctor;
            ctor.prototype = cProto;
            return ctor;
        }
    });
});