/*!Magix 1.2 Licensed MIT*/(function(NULL,WINDOW,DOCUMENT,NOOP,SPLITER,EMPTY,COMMA,LIB,IdIt,COUNTER){COUNTER=1;IdIt=function(n){return n.id||(n.id='mx_n_'+COUNTER++)};/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.2
 **/
LIB.add('magix/magix', function(S) {
    var Slice = [].slice;
    var Include = function(path) {
        var magixPackages = S.Config.packages.magix;
        var mPath = magixPackages.base || magixPackages.path || magixPackages.uri;

        var url = mPath + path + ".js?r=" + Math.random() + '.js';
        var xhr = WINDOW.ActiveXObject || WINDOW.XMLHttpRequest;
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
var Console = WINDOW.console;
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
                    r = Has(o, k) ? o[k] :NULL;
                }
                break;
            case 2:
                if (v ===NULL) {
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
        key = SPLITER + key;
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

        var key = SPLITER + okey;
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
        k = SPLITER + k;
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
        return Has(this.c, SPLITER + k);
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
        
        e = fns[i];
        r = e && e.apply(context, args);
        
             
        
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
    //
    /**
     * 判断o是否为对象
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    //
    /**
     * 判断o是否为函数
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    //
    /**
     * 判断o是否为正则
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    //
    /**
     * 判断o是否为字符串
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    //
    /**
     * 判断o是否为数字
     * @function
     * @param {Object} o 待检测的对象
     * @return {Boolean}
     */
    //
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
    
    /**
     * 通过xhr同步获取文件的内容，仅开发magix自身时使用
     * @function
     * @param {String} path 文件路径
     * @return {String} 文件内容
     * @private
     */
    
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
        var key = url + SPLITER + part;
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
    return Mix(Magix, {
        
        use: function(name, fn) {
            S.use(name && (name + EMPTY), function(S) {
                if (fn) {
                    fn.apply(S, Slice.call(arguments, 1));
                }
            });
        },
        _s: S.isString,
        _a: S.isArray,
        _f: S.isFunction,
        _o: S.isObject
    });
});
/**
 * @fileOverview 多播事件对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.2
 **/
LIB.add("magix/event", function(S, Magix) {
    var SafeExec = Magix.tryCall;
/**
 * 多播事件对象
 * @name Event
 * @namespace
 */
var Event = {
    /**
     * @lends Event
     */
    /**
     * 触发事件
     * @param {String} name 事件名称
     * @param {Object} data 事件对象
     * @param {Boolean} remove 事件触发完成后是否移除这个事件的所有监听
     * @param {Boolean} lastToFirst 是否从后向前触发事件的监听列表
     */
    fire: function(name, data, remove, lastToFirst) {
        var key = SPLITER + name,
            me = this,
            list = me[key];
        if (list) {
            if (!data) data = {};
            if (!data.type) data.type = name;
            var end = list.length,
                len = end - 1,
                idx, t;
            while (end--) {
                idx = lastToFirst ? end : len - end;
                t = list[idx];
                if (t.d || t.r) {
                    list.splice(idx, 1);
                    len--;
                }
                if (!t.d) SafeExec(t.f, data, me);
            }
            //
            remove = remove || len < 0; //如果list中没有回调函数，则删除
        }
        if (remove) {
            delete me[key];
        }
    },
    /**
     * 绑定事件
     * @param {String} name 事件名称
     * @param {Function} fn 事件回调
     * @param {Interger|Object} insert 事件监听插入的位置或依赖的对象
     * @param {String} [relyName] 依赖对象的事件名称
     * @example
     * var T=Magix.mix({},Event);
        T.on('done',function(e){
            alert(1);
        });
        T.on('done',function(e){
            alert(2);
            T.off('done',arguments.callee);
        });
        T.on('done',function(e){
            alert(3);
        },0);//监听插入到开始位置

        T.once('done',function(e){
            alert('once');
        });

        T.fire('done',{data:'test'});
        T.fire('done',{data:'test2'});

        var a=Magix.mix({},Event);
        var b=Magix.mix({},Event);
        a.on('test',function(e){

        },b,'destroy');

        a.fire('test');//正常
        b.fire('destroy');
        a.fire('test');//不再打印console.log
     */
    on: function(name, fn, insertOrRely, relyName) {
        var me = this;
        var key = SPLITER + name;
        var list = me[key] || (me[key] = []);
        var wrap = {
            f: fn
        }, p = insertOrRely | 0;

        if (p !== insertOrRely) {
            if (insertOrRely && insertOrRely.on && relyName) {
                insertOrRely.on(relyName, function() {
                    wrap.d = 1;
                }, SafeExec);
                insertOrRely = 0;
            }
            wrap.r = insertOrRely;
            list.push(wrap);
        } else {
            list.splice(p, 0, wrap);
        }
    },
    /**
     * 解除事件绑定
     * @param {String} name 事件名称
     * @param {Function} fn 事件回调
     */
    off: function(name, fn) {
        var key = SPLITER + name,
            list = this[key];
        if (list) {
            if (fn) {
                for (var i = list.length - 1, t; i >= 0; i--) {
                    t = list[i];
                    if (t.f == fn && !t.d) {
                        t.d = 1;
                        break;
                    }
                }
            } else {
                delete this[key];
            }
        }
    },
    /**
     * 绑定事件，触发一次后即解绑
     * @param {String} name 事件名称
     * @param {Function} fn 事件回调
     */
    once: function(name, fn) {
        this.on(name, fn, SafeExec);
    }
};
Magix.mix(Magix.local, Event);
    return Event;
}, {
    requires: ["magix/magix"]
});
/**
 * @fileOverview 路由
 * @author 行列
 * @version 1.2
 */
LIB.add('magix/router', function(S, Magix, Event, SE) {
    var EMPTY = '';
var PATH = 'path';
var VIEW = 'view';

var Has = Magix.has;
var Mix = Magix.mix;

var OKeys = Magix.keys;
var ToUrl = Magix.toUrl;
var ToObject = Magix.toObject;
var MxConfig = Magix.config();
var HrefCache = Magix.cache();
var ChgdCache = Magix.cache();
var WinLoc = WINDOW.location;
var WinHistory = WINDOW.history;
var TLoc, LLoc = {
    params: {},
    href: EMPTY
}, Pnr;
var TrimHashReg = /(?:^https?:\/\/[^\/]+|#.*$)/gi,
    TrimQueryReg = /^[^#]*#?!?/;
var PARAMS = 'params';
var UseEdgeHistory;
var SupportAndUseState, HashAsNativeHistory, ReadLocSrc;

var IsParam = function(params, r, ps) {
    if (params) {
        ps = this[PARAMS];
        params = (params + EMPTY).split(COMMA);
        for (var i = 0; i < params.length; i++) {
            r = Has(ps, params[i]);
            if (r) break;
        }
    }
    return r;
};
var IsPath = function() {
    return this[PATH];
};
var IsView = function() {
    return this[VIEW];
};


var GetSetParam = function(key, value, me, params) {
    me = this;
    params = me[PARAMS];
    return arguments.length > 1 ? params[key] = value : params[key] || EMPTY;
};

/**
 * 根据地址栏中的path获取对应的前端view
 * @param  {String} path 形如/list/index这样的path
 * @param {Object} loc 内部临时使用的对象
 * @return {Object} 返回形如{view:'app/views/default',path:'/home'}这样的对象
 * @private
 */
var GetViewInfo = function(path, loc) {
    var r, result, defaultView, defaultPath;
    if (!Pnr) {
        Pnr = {
            rs: MxConfig.routes || {},
            nf: MxConfig.unfoundView
        };
        //var home=pathCfg.defaultView;//处理默认加载的view
        //var dPathname=pathCfg.defaultPath||EMPTY;
        defaultView = MxConfig.defaultView;
        /*if (!defaultView) {
                throw new Error('unset defaultView');
            }*/
        Pnr.dv = defaultView;
        defaultPath = MxConfig.defaultPath;
        //if(!Magix.isFunction(temp.rs)){
        r = Pnr.rs;
        Pnr.f = Magix._f(r);
        if (!Pnr.f && !r[defaultPath] && defaultView) {
            r[defaultPath] = defaultView;
        }
        Pnr[PATH] = defaultPath;
    }

    if (!path) path = Pnr[PATH];

    r = Pnr.rs;
    if (Pnr.f) {
        result = r.call(MxConfig, path, loc);
    } else {
        result = r[path]; //简单的在映射表中找
    }
    return {
        view: result || Pnr.nf || Pnr.dv,
        path: path
    };
};

/**
 * 获取2个location对象之间的差异部分
 * @param  {Object} oldLocation 原始的location对象
 * @param  {Object} newLocation 当前的location对象
 * @return {Object} 返回包含差异信息的对象
 * @private
 */
var GetChged = function(oldLocation, newLocation) {
    var oKey = oldLocation.href;
    var nKey = newLocation.href;
    var tKey = oKey + SPLITER + nKey;
    var result = ChgdCache.get(tKey);
    if (!result) {
        var hasChanged, from, to, rps;
        result = {
            isParam: IsParam,
            isPath: IsPath,
            isView: IsView,
            location: newLocation,
            force: !oldLocation.get //是否强制触发的changed，对于首次加载会强制触发一次
        };
        result[VIEW] = to;
        result[PATH] = to;
        result[PARAMS] = rps = {};

        var oldParams = oldLocation[PARAMS],
            newParams = newLocation[PARAMS];
        var tArr = [PATH, VIEW].concat(OKeys(oldParams), OKeys(newParams)),
            idx, key;
        for (idx = tArr.length - 1; idx >= 0; idx--) {
            key = tArr[idx];
            if (idx == 1) {
                oldParams = oldLocation;
                newParams = newLocation;
                rps = result;
            }
            from = oldParams[key];
            to = newParams[key];
            if (from != to) {
                rps[key] = {
                    from: from,
                    to: to
                };
                hasChanged = 1;
            }
        }
        ChgdCache.set(tKey, result = [hasChanged, result]);
    }
    return result;
};
//var PathTrimFileParamsReg=/(\/)?[^\/]*[=#]$/;//).replace(,'$1').replace(,EMPTY);
//var PathTrimSearch=/\?.*$/;
/**
 * 路由对象，操作URL
 * @name Router
 * @namespace
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @borrows Event.once as once
 */
var Router = Mix({
    /**
     * @lends Router
     */
    /**
     * 绑定事件
     * @function
     * @private
     */
    
    /**
     * 开始路由工作
     * @private
     */
    start: function() {
        /*
        尽可能的延迟配置，防止被依赖时，配置信息不正确
         */
        UseEdgeHistory = MxConfig.edge;

        SupportAndUseState = UseEdgeHistory && WinHistory.pushState;
        HashAsNativeHistory = UseEdgeHistory && !SupportAndUseState;

        ReadLocSrc = SupportAndUseState ? 'srcQuery' : 'srcHash';

        Router.bind(SupportAndUseState);
        Router.route(); //页面首次加载，初始化整个页面
    },

    /**
     * 解析href的query和hash，默认href为WINDOW.location.href
     * @param {String} [href] href
     * @return {Object} 解析的对象
     */
    parse: function(href, inner) {
        href = href || WinLoc.href;
        /*var cfg=Magix.config();
        if(!cfg.originalHREF){
            try{
                href=DECODE(href);//解码有问题 http://fashion.s.etao.com/search?q=%CF%CA%BB%A8&initiative_id=setao_20120529&tbpm=t => error:URIError: malformed URI sequence
            }catch(ignore){

            }
        }*/
        var result = HrefCache.get(href),
            view, tempPathname, query, hash, queryObj, hashObj;
        if (!result) {
            query = href.replace(TrimHashReg, EMPTY);
            //
            //var query=tPathname+params.replace(/^([^#]+).*$/g,'$1');
            hash = href.replace(TrimQueryReg, EMPTY); //原始hash
            //
            queryObj = ToObject(query);
            //
            hashObj = ToObject(hash); //去掉可能的！开始符号
            if (HashAsNativeHistory) {
                hashObj[PATH] = Magix.path(WinLoc.pathname, hashObj[PATH]);
            }
            result = {
                get: GetSetParam,
                set: GetSetParam,
                href: href,
                refHref: LLoc.href,
                srcQuery: query,
                srcHash: hash,
                query: queryObj,
                hash: hashObj,
                params: Mix(Mix({}, queryObj[PARAMS]), hashObj[PARAMS])
            };
            HrefCache.set(href, result);
        }
        if (inner && !result[VIEW]) {
            /*
                1.在选择path时，不能简单的把hash中的覆盖query中的。有可能是从不支持history state浏览器上拷贝链接到支持的浏览器上，分情况而定：
                如果hash中存在path则使用hash中的，否则用query中的

                2.如果指定不用history state则直接使用hash中的path

                以下是对第1条带hash的讨论
                // http://etao.com/list/?a=b#!/home?page=2&rows=20
                //  /list/index
                //  /home
                //   http://etao.com/list?page=3#!/home?page=2;
                // 情形A. path不变 http://etao.com/list?page=3#!/list?page=2 到支持history state的浏览器上 参数合并;
                // 情形B .path有变化 http://etao.com/list?page=3#!/home?page=2 到支持history state的浏览器上 参数合并,path以hash中的为准;
            */
            //if (UseEdgeHistory) { //指定使用history state
            /*
                if(Router.supportState()){//当前浏览器也支持
                    if(hashObj[PATH]){//优先使用hash中的，理由见上1
                        tempPathname=hashObj[PATH];
                    }else{
                        tempPathname=queryObj[PATH];
                    }
                }else{//指定使用history 但浏览器不支持 说明服务器支持这个路径，规则同上
                    if(hashObj[PATH]){//优先使用hash中的，理由见上1
                        tempPathname=hashObj[PATH];
                    }else{
                        tempPathname=queryObj[PATH];
                    }
                }
                合并后如下：
                */
            //
            // tempPathname = result.hash[PATH] || result.query[PATH];
            //} else { //指定不用history state ，那咱还能说什么呢，直接用hash
            //tempPathname = result.hash[PATH];
            //}
            //上述if else简写成以下形式，方便压缩
            tempPathname = result.hash[PATH] || (UseEdgeHistory && result.query[PATH]);
            view = GetViewInfo(tempPathname, result);
            Mix(result, view);
        }
        return result;
    },
    /**
     * 根据WINDOW.location.href路由并派发相应的事件
     */
    route: function() {
        var location = Router.parse(0, 1);
        var changed = GetChged(LLoc, location);
        LLoc = location;
        if (changed[0]) {
            TLoc = location;
            Router.fire('changed', changed[1]);
        }
    },
    /**
     * 导航到新的地址
     * @param  {Object|String} pn path或参数字符串或参数对象
     * @param {String|Object} [params] 参数对象
     * @param {Boolean} [replace] 是否替换当前历史记录
     * @example
     * Magix.use('magix/router',function(S,R){
     *      R.navigate('/list?page=2&rows=20');//改变path和相关的参数，地址栏上的其它参数会进行丢弃，不会保留
     *      R.navigate('page=2&rows=20');//只修改参数，地址栏上的其它参数会保留
     *      R.navigate({//通过对象修改参数，地址栏上的其它参数会保留
     *          page:2,
     *          rows:20
     *      });
     *      R.navigate('/list',{//改变path和相关参数，丢弃地址栏上原有的其它参数
     *          page:2,
     *          rows:20
     *      });
     *
     *      //凡是带path的修改地址栏，都会把原来地址栏中的参数丢弃
     *
     * });
     */
    navigate: function(pn, params, replace) {
        //pn toObject
        //mix params to pn
        //if pn.path
        //  mix querys to params
        //else
        //  mix TLoc.params

        if (TLoc) {
            if (!params && Magix._o(pn)) {
                params = pn;
                pn = EMPTY;
            }
            var temp = ToObject(pn);
            var querys = TLoc.query[PARAMS];
            var tParams = temp[PARAMS];
            var tPath = temp[PATH];
            var lPath = TLoc[PATH];
            Mix(tParams, params);

            if (tPath) { //设置路径带参数的形式，如:/abc?q=b&c=e
                tPath = Magix.path(lPath, tPath);
                if (HashAsNativeHistory) { //指定使用history state但浏览器不支持，需要把query中的存在的参数以空格替换掉
                    for (var p in querys) {
                        if (Has(querys, p) && !Has(tParams, p)) {
                            tParams[p] = EMPTY;
                        }
                    }
                }
            } else { //只有参数，如:a=b&c=d
                tPath = lPath;
                tParams = Mix(Mix({}, TLoc[PARAMS]), tParams); //复制原来的参数
            }
            tPath = ToUrl(temp[PATH] = tPath, tParams, UseEdgeHistory ? PATH : querys); //hash需要保留query中的空白值参数

            if (tPath != TLoc[ReadLocSrc]) {
                if (SupportAndUseState) { //如果使用pushState
                    WinHistory[replace ? 'replaceState' : 'pushState'](EMPTY, EMPTY, tPath);
                    Router.route();
                } else {
                    Mix(temp, TLoc, temp);
                    temp.srcHash = tPath;
                    /*temp.hash = {
                        params: temp[PARAMS],
                        path: temp[PATH]
                    };*/
                    /*
                        WINDOW.onhashchange=function(e){
                        };
                        (function(){
                            location.hash='a';
                            location.hash='b';
                            location.hash='c';
                        }());


                     */
                    Router.fire('!ul', {
                        loc: TLoc = temp
                    }); //hack 更新view的location属性
                    tPath = '#!' + tPath;
                    if (replace) {
                        WinLoc.replace(tPath);
                    } else {
                        WinLoc.hash = tPath;
                    }
                }

                Router.did = 1;
            }
        }
    }

    /**
     * 当WINDOW.location.href有改变化后触发
     * @name Router.changed
     * @event
     * @param {Object} e 事件对象
     * @param {Function} e.isPath 检测是否是path发生的改变
     * @param {Function} e.isView 检测是否是view发生的改变
     * @param {Function} e.isParam 检测是否是某个参数发生的改变
     * @param {Object} e.path  如果path发生改变时，记录从(from)什么值变成(to)什么值的对象
     * @param {Object} e.view 如果view发生改变时，记录从(from)什么值变成(to)什么值的对象
     * @param {Object} e.params 如果参数发生改变时，记录从(from)什么值变成(to)什么值的对象
     * @param {Object} e.location 地址解析出来的对象，包括query hash 以及 query和hash合并出来的params等
     * @param {Boolean} e.force 标识是否是第一次强制触发的changed，对于首次加载完Magix，会强制触发一次changed
     */

}, Event);
    Router.bind = function(useState) {
        if (useState) {
            var initialURL = location.href;
            SE.on(WINDOW, 'popstate', function(e) {
                var equal = location.href == initialURL;
                if (!Router.did && equal) return;
                Router.did = 1;
                Router.route();
            });
        } else {
            SE.on(WINDOW, 'hashchange', Router.route);
        }
    };
    return Router;
}, {
    requires: ["magix/magix", "magix/event", "event"]
});
/**
 * @fileOverview VOM
 * @author 行列
 * @version 1.2
 */
LIB.add("magix/vom", function(S, Vframe, Magix, Event) {
    var Has = Magix.has;
var Mix = Magix.mix;

var Vframes = {};
var Loc = {};
var Chged = {};
/**
 * VOM对象
 * @name VOM
 * @namespace
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @borrows Event.once as once
 */
var VOM = Magix.mix({
    /**
     * @lends VOM
     */
    /**
     * 获取所有的vframe对象
     * @return {Object}
     */
    all: function() {
        return Vframes;
    },
    /**
     * 注册vframe对象
     * @param {Vframe} vf Vframe对象
     */
    add: function(id, vf) {
        if (!Has(Vframes, id)) {
            Vframes[id] = vf;
            VOM.fire('add', {
                vframe: vf
            });
        }
    },
    /**
     * 根据vframe的id获取vframe对象
     * @param {String} id vframe的id
     * @return {Vframe|Null} vframe对象
     */
    get: function(id) {
        return Vframes[id];
    },
    /**
     * 删除已注册的vframe对象
     * @param {String} id vframe对象的id
     * @param {Boolean} fcc 内部使用
     */
    remove: function(id, fcc) {
        var vf = Vframes[id];
        if (vf) {
            delete Vframes[id];
            VOM.fire('remove', {
                vframe: vf,
                fcc: fcc
            });
        }
    },
    /**
     * 向vframe通知地址栏发生变化
     * @param {Object} e 事件对象
     * @param {Object} e.location WINDOW.location.href解析出来的对象
     * @private
     */
    loc: function(e) {
        var loc = e.loc;
        var hack;
        if (loc) {
            hack = 1;
        } else {
            loc = e.location;
        }
        Mix(Loc, loc);
        if (!hack) {
            Mix(Chged, e);
            var vf = Vframe.root(VOM, Loc, Chged);
            if (Chged.view) {
                vf.mountView(loc.view);
            } else {
                Vframe.update(vf);
            }
        }
    }
    /**
     * 注册vframe对象时触发
     * @name VOM.add
     * @event
     * @param {Object} e
     * @param {Vframe} e.vframe
     */
    /**
     * 删除vframe对象时触发
     * @name VOM.remove
     * @event
     * @param {Object} e
     * @param {Vframe} e.vframe
     * @param {Boolean} e.fcc 是否派发过created事件
     */
}, Event);
    return VOM;
}, {
    requires: ["magix/vframe", "magix/magix", "magix/event"]
});
/**
 * @fileOverview Vframe类
 * @author 行列
 * @version 1.2
 */
LIB.add('magix/vframe', function(S, Magix, Event, BaseView) {
    var SafeExec = Magix.tryCall;
var EmptyArr = [];


var Mix = Magix.mix;

var MxConfig = Magix.config();

var TagName;
var TagNameChanged;
var UseQSA;
var ReadMxVframe;
var Selector;
var MxVframe = 'mx-vframe';

var Has = Magix.has;
var SupportContains;
var QSA = 'querySelectorAll';


var Alter = 'alter';
var Created = 'created';
var RootVframe;
var GlobalAlter;
var StrObject = 'object';
var GetById = function(id) {
    return typeof id == StrObject ? id : DOCUMENT.getElementById(id);
};
var GetByTagName = function(id, node, arr) {
    node = GetById(id);
    if (node) {
        arr = UseQSA ? DOCUMENT[QSA]('#' + IdIt(node) + Selector) : node.getElementsByTagName(TagName);
    }
    return arr || EmptyArr;
};


var NodeIn = function(a, b, r) {
    a = GetById(a);
    b = GetById(b);
    if (a && b) {
        if (a !== b) {
            try {
                r = SupportContains ? b.contains(a) : b.compareDocumentPosition(a) & 16;
            } catch (e) {
                r = 0;
            }
        } else {
            r = 1;
        }
    }
    return r;
};

var NotifyCreated = function(vframe) {
    if (vframe.cC == vframe.rC) {
        var view = vframe.view;
        if (view && !vframe.fcc) {
            vframe.fcc = 1;
            vframe.fca = 0;
            view.fire(Created);
            vframe.fire(Created);
        }
        var mId = vframe.id;
        var p = RefVOM.get(vframe.pId);
        if (p && !Has(p.rM, mId)) {
            p.rM[mId] = p.cM[mId];
            p.rC++;
            NotifyCreated(p);
        }
    }
};
var NotifyAlter = function(vframe, e) {
    if (!e) e = {};
    if (!vframe.fca && vframe.fcc) { //当前vframe触发过created才可以触发alter事件
        vframe.fcc = 0;
        var view = vframe.view;
        var mId = vframe.id;
        if (view) {
            vframe.fca = 1;
            view.fire(Alter, e);
            vframe.fire(Alter, e);
        }
        //var vom = vframe.owner;
        var p = RefVOM.get(vframe.pId);
        if (p && Has(p.rM, mId)) {
            p.rC--;
            delete p.rM[mId];
            if (!vframe._p) {
                NotifyAlter(p, e);
            }
        }
    }
};
//var ScriptsReg = /<script[^>]*>[\s\S]*?<\/script>/ig;
var RefLoc, RefChged, RefVOM;
/**
 * Vframe类
 * @name Vframe
 * @class
 * @constructor
 * @borrows Event.on as #on
 * @borrows Event.fire as #fire
 * @borrows Event.off as #off
 * @borrows Event.once as #once
 * @param {String} id vframe id
 * @property {String} id vframe id
 * @property {View} view view对象。注意：view加载是异步过程，当需要使用view对象时，请先判断viewInited或viewPrimed属性
 * @property {String} path 当前view的路径名，包括参数
 * @property {Boolean} viewInited view是否完成初始化，即view的inited事件有没有派发
 * @property {String} pId 父vframe的id，如果是根节点则为undefined
 */
var Vframe = function(id, pId) {
    var me = this;
    me.id = id;
    //me.vId=id+'_v';
    me.cM = {};
    me.cC = 0;
    me.rC = 0;
    me.sign = 1;
    me.rM = {};
    me.pId = pId;
    RefVOM.add(id, me);
};
/**
 * 获取根vframe
 * @param {VOM} vom vom对象
 * @param {Object} refLoc 引用的Router解析出来的location对象
 * @param {Object} refChged 引用的URL变化对象
 * @return {Vframe}
 * @private
 */
Vframe.root = function(owner, refLoc, refChged) {
    if (!RootVframe) {
        /*
            尽可能的延迟配置，防止被依赖时，配置信息不正确
        */
        TagName = MxConfig.tagName;
        TagNameChanged = MxConfig['!tnc'];
        UseQSA = TagNameChanged && DOCUMENT[QSA];
        Selector = ' ' + TagName + '[' + MxVframe + '=true]';
        ReadMxVframe = TagNameChanged && !UseQSA;

        var body = DOCUMENT.body;
        SupportContains = body.contains;

        RefLoc = refLoc;
        RefChged = refChged;
        RefVOM = owner;

        var rootId = MxConfig.rootId;
        var e = GetById(rootId);
        if (!e) {
            e = DOCUMENT.createElement(TagName);
            e.id = rootId;
            body.appendChild(e);
            e =NULL;
        }
        RootVframe = new Vframe(rootId);
    }
    return RootVframe;
};
/**
 * 通知当前vframe，地址栏发生变化
 * @param {Vframe} vframe vframe对象
 * @private
 */
Vframe.update = function(vframe) {
    var view = vframe.view;
    if (vframe.viewInited && view && view.sign > 0) { //存在view时才进行广播，对于加载中的可在加载完成后通过调用view.location拿到对应的WINDOW.location.href对象，对于销毁的也不需要广播

        var isChanged = view.olChg(RefChged);
        /**
         * 事件对象
         * @type {Object}
         * @ignore
         */
        /*var args = {
                location: RefLoc,
                changed: RefChged,*/
        /**
         * 阻止向所有的子view传递
         * @ignore
         */
        /* prevent: function() {
                    args.cs = EmptyArr;
                },*/
        /**
         * 向特定的子view传递
         * @param  {Array} c 子view数组
         * @ignore
         */
        /*to: function(c) {
                    c = (c + EMPTY).split(COMMA);
                    args.cs = c;
                }
            };*/
        if (isChanged) { //检测view所关注的相应的参数是否发生了变化
            view.render(RefChged);
        }
        var cs = vframe.children();
        //
        for (var i = 0, j = cs.length, vf; i < j; i++) {
            vf = RefVOM.get(cs[i]);
            if (vf) {
                Vframe.update(vf);
            }
        }
    }
};

Mix(Mix(Vframe.prototype, Event), {
    /**
     * @lends Vframe#
     */
    /**
     * 加载对应的view
     * @param {String} viewPath 形如:app/views/home?type=1&page=2 这样的view路径
     * @param {Object|Null} viewInitParams 调用view的init方法时传递的参数
     * @param {Boolean} [keepPreHTML] 在当前view渲染完成前是否保留前view渲染的HTML，默认false
     */
    mountView: function(viewPath, viewInitParams, keepPreHTML) {
        var me = this;
        var node = GetById(me.id);
        if (!me._a && node) {
            me._a = 1;
            me._t = node.innerHTML; //.replace(ScriptsReg, '');
        }
        //var useTurnaround=me.viewInited&&me.useAnimUpdate();
        me.unmountView(keepPreHTML);
        me._d = 0;
        if (viewPath) {
            me.path = viewPath;
            var po = Magix.toObject(viewPath);
            var vn = po.path;
            var sign = ++me.sign;
            Magix.use(vn, function(View) {
                if (sign == me.sign) { //有可能在view载入后，vframe已经卸载了

                    BaseView.prepare(View, RefVOM);

                    var view = new View({
                        owner: me,
                        id: me.id,
                        $: GetById,
                        $i: NodeIn,
                        path: vn,
                        vom: RefVOM,
                        location: RefLoc
                    });
                    me.view = view;
                    var mountZoneVframes = function(e) {
                        me.mountZoneVframes(e.id);
                    };
                    view.on('interact', function() { //view准备好后触发
                        if (!view.hasTmpl) {
                            if (node) {
                                node.innerHTML = me._t;
                            }
                            mountZoneVframes(GetById);
                        }
                        /*view.on('primed', function() {
                            me.viewPrimed = 1;
                            me.fire('viewMounted');
                        });*/
                        view.on('rendered', mountZoneVframes);
                        view.on('prerender', function(e) {
                            if (!me.unmountZoneVframes(e.id, 0, 1)) {
                                NotifyAlter(me);
                            }
                        });
                    }, 0);
                    view.load(Mix(po.params, viewInitParams), RefChged);
                }
            });
        }
    },
    /**
     * 销毁对应的view
     * @param {Boolean} [keepPreHTML] 在当前view渲染完成前是否保留前view渲染的HTML，默认false
     */
    unmountView: function(keepPreHTML) {
        var me = this;
        var view = me.view;
        if (view) {
            if (!GlobalAlter) {
                GlobalAlter = {};
            }
            me._d = 1; //用于标记当前vframe处于view销毁状态，在当前vframe上再调用unmountZoneVframes时不派发created事件
            me.unmountZoneVframes(0, keepPreHTML, 1);
            NotifyAlter(me, GlobalAlter);

            me.view = 0; //unmountView时，尽可能早的删除vframe上的view对象，防止view销毁时，再调用该 vfrmae的类似unmountZoneVframes方法引起的多次created
            view.oust();

            var node = GetById(me.id);
            if (node && me._a && !keepPreHTML) {
                node.innerHTML = me._t;
            }

            me.viewInited = 0;
            /*if (me.viewPrimed) { //viewMounted与viewUnmounted成对出现
                me.viewPrimed = 0;
                me.fire('viewUnmounted');
            }*/
            GlobalAlter = 0;
        }
        me.sign++;
    },
    /**
     * 加载vframe
     * @param  {String} id             节点id
     * @param  {String} viewPath       view路径
     * @param  {Object} viewInitParams 传递给view init方法的参数
     * @param {Boolean} [cancelTriggerEvent] 是否取消触发alter与created事件，默认false
     * @param  {Boolean} [keepPreHTML] 在当前view渲染完成前是否保留前view渲染的HTML，默认false
     * @return {Vframe} vframe对象
     * @example
     * //html
     * &lt;div id="magix_vf_defer"&gt;&lt;/div&gt;
     *
     *
     * //js
     * view.owner.mountVframe('magix_vf_defer','app/views/list',{page:2})
     * //注意：动态向某个节点渲染view时，该节点无须是vframe标签
     */
    mountVframe: function(id, viewPath, viewInitParams, cancelTriggerEvent, keepPreHTML) {
        var me = this;
        //me._p = cancelTriggerEvent;
        if (me.fcc && !cancelTriggerEvent) NotifyAlter(me); //如果在就绪的vframe上渲染新的vframe，则通知有变化
        //var vom = me.owner;
        var vf = RefVOM.get(id);
        if (!vf) {
            if (!Has(me.cM, id)) {
                me.cC++;
            }
            me.cM[id] = 1;
            vf = new Vframe(id, me.id);
        }
        vf._p = cancelTriggerEvent;
        vf.mountView(viewPath, viewInitParams, keepPreHTML);
        return vf;
    },
    /**
     * 加载当前view下面的子view，因为view的持有对象是vframe，所以是加载vframes
     * @param {HTMLElement|String} zoneId 节点对象或id
     * @param {Object} viewInitParams 传递给view init方法的参数
     * @param {Boolean} [cancelTriggerEvent] 是否取消触发alter与created事件，默认false
     * @param {Boolean} [keepPreHTML] 在当前view渲染完成前是否保留前view渲染的HTML，默认false
     */
    mountZoneVframes: function(zoneId, viewInitParams, cancelTriggerEvent, keepPreHTML) {
        var me = this;
        zoneId = zoneId || me.id;
        me.unmountZoneVframes(zoneId, keepPreHTML, 1);

        var vframes = GetByTagName(zoneId);
        var count = vframes.length;
        var subs = {};

        if (count) {
            for (var i = 0, vframe, key, mxView, mxBuild; i < count; i++) {
                vframe = vframes[i];

                key = IdIt(vframe);
                if (!Has(subs, key)) {
                    mxView = vframe.getAttribute('mx-view');
                    mxBuild = ReadMxVframe ? vframe.getAttribute(MxVframe) : 1;

                    if (mxBuild || mxView) {
                        me.mountVframe(key, mxView, viewInitParams, cancelTriggerEvent, keepPreHTML);
                        var svs = GetByTagName(vframe);
                        for (var j = 0, c = svs.length, temp; j < c; j++) {
                            temp = svs[j];
                            subs[IdIt(temp)] = 1;
                        }
                    }
                }
            }
        }
        //if (me.cC == me.rC) { //有可能在渲染某个vframe时，里面有n个vframes，但立即调用了mountZoneVframes，这个下面没有vframes，所以要等待
        NotifyCreated(me);
        //}
    },
    /**
     * 销毁vframe
     * @param  {String} [id]      节点id
     * @param {Boolean} [keepPreHTML] 在当前view渲染完成前是否保留前view渲染的HTML，默认false
     * @param {Boolean} [inner] 内部调用时传递
     */
    unmountVframe: function(id, keepPreHTML, inner) { //inner 标识是否是由内部调用，外部不应该传递该参数
        var me = this;
        id = id || me.id;
        //var vom = me.owner;
        var vf = RefVOM.get(id);
        if (vf) {
            var fcc = vf.fcc;
            vf.unmountView(keepPreHTML);
            RefVOM.remove(id, fcc);
            var p = RefVOM.get(vf.pId);
            if (p && Has(p.cM, id)) {
                delete p.cM[id];
                p.cC--;
                if (!inner) {
                    NotifyCreated(p);
                }
            }
        }
    },
    /**
     * 销毁某个区域下面的所有子vframes
     * @param {HTMLElement|String} [zoneId]节点对象或id
     * @param {Boolean} [keepPreHTML] 在当前view渲染完成前是否保留前view渲染的HTML，默认false
     * @param {Boolean} [inner] 内部调用时传递，用于判断在这个区域内稍后是否还有vframes渲染，如果有，则为true，否则为false
     */
    unmountZoneVframes: function(zoneId, keepPreHTML, inner) {
        var me = this;
        var hasVframe;
        var p;
        var cm = me.cM;
        for (p in cm) {
            if (!zoneId || NodeIn(p, zoneId)) {
                me.unmountVframe(p, keepPreHTML, hasVframe = 1);
            }
        }
        if (!inner && !me._d) {
            NotifyCreated(me);
        }
        return hasVframe;
    },
    /**
     * 获取父vframe
     * @param  {Integer} level 层级，默认1,取当前vframe的父级
     * @return {Vframe}
     */
    parent: function(level) {
        var me = this,
            vf = me;
        level = (level >>> 0) || 1;
        while (vf && level--) {
            vf = RefVOM.get(vf.pId);
        }
        return vf;
    },
    /**
     * 获取当前vframe的所有子vframe的id。返回数组中，id在数组中的位置并不固定
     * @return {Array}
     */
    children: function() {
        return Magix.keys(this.cM);
    },
    /**
     * 调用view的方法
     * @param  {String} name 方法名
     * @param  {Array} args 参数
     * @return {Object}
     */
    invokeView: function(name, args) {
        var result;
        var vf = this;
        if (vf.viewInited) {
            var view = vf.view;
            var fn = view && view[name];
            if (fn) {
                result = SafeExec(fn, args || EmptyArr, view);
            }
        }
        return result;
    }

    /**
     * 子孙view修改时触发
     * @name Vframe#alter
     * @event
     * @param {Object} e
     */

    /**
     * 子孙view创建完成时触发
     * @name Vframe#created
     * @event
     * @param {Object} e
     */
});

/**
 * Vframe 中的2条线
 * 一：
 *     渲染
 *     每个Vframe有cC(childrenCount)属性和cM(childrenItems)属性
 *
 * 二：
 *     修改与创建完成
 *     每个Vframe有rC(readyCount)属性和rM(readyMap)属性
 *
 *      fca firstChildrenAlter  fcc firstChildrenCreated
 */
    return Vframe;
}, {
    requires: ["magix/magix", "magix/event", "magix/view"]
});
/**
 * @fileOverview view类
 * @author 行列
 * @version 1.2
 */
LIB.add('magix/view', function(S, Magix, Event, Router, IO) {
    var Delegates = {
        mouseenter: 2,
        mouseleave: 2
    };
    var DOMEventLibBind = function(node, type, cb, remove, scope, direct) {
        S.use('event', function(S, SE) {
            var flag = Delegates[type];
            if (!direct && flag == 2) {
                flag = (remove ? 'un' : EMPTY) + 'delegate';
                SE[flag](node, type, '[mx-' + type + ']', cb);
            } else {
                flag = remove ? 'detach' : ON;
                SE[flag](node, type, cb, scope);
            }
        });
    };
    var SafeExec = Magix.tryCall;
var Has = Magix.has;
var EMPTY_ARRAY = [];
var Mix = Magix.mix;
var ResCounter = 0;
var DestroyStr = 'destroy';

var EvtInfoCache = Magix.cache(40);


var EvtInfoReg = /(\w+)(?:<(\w+)>)?(?:\(({[\s\S]*})\))?/;
var EvtMethodReg = /([$\w]+)<([\w,]+)>/;

var RootEvents = {};
var RootNode = DOCUMENT.body;
var ParentNode = 'parentNode';
var MxEvt = /\smx-(?!view|vframe)[a-z]+\s*=\s*"/g;
var ON = 'on';

var VOM;
var Group = '\u0005';

var WrapFn = function(fn, me) {
    return function() {
        me = this;
        if (me.sign > 0) {
            me.sign++;
            me.fire('rendercall');
            DestroyAllManaged(me);
            SafeExec(fn, arguments, me);
        }
    };
};

var DestroyAllManaged = function(me, lastly) {
    var cache = me.$res,
        p, c;
    for (p in cache) {
        c = cache[p];
        if (lastly || c.x) {
            DestroyIt(cache, p, 1);
        }
    }
};

var DestroyIt = function(cache, key, lastly) {
    var o = cache[key],
        res, fn;
    if (o) {
        //var processed=false;
        res = o.e;
        fn = res && res[DestroyStr];
        if (fn) {
            SafeExec(fn, EMPTY_ARRAY, res);
        }
        if (!o.k || lastly) { //如果托管时没有给key值，则表示这是一个不会在其它方法内共享托管的资源，view刷新时可以删除掉
            delete cache[key];
        }
    }
};

/**
 * 处理代理事件
 * @param {Boolean} dispose 是否销毁
 * @private
 */
var DelegateEvents = function(me, destroy) {
    var events = me.$evts;
    var p, e;
    for (p in events) {
        DOMEventBind(p, destroy);
    }
    events = me.$sevts;
    p = events.length;
    while (p-- > 0) {
        e = events[p];
        DOMEventLibBind(e.h, e.t, e.f, destroy, me, 1);
    }
};


var DOMEventProcessor = function(e) {
    if (e && !e[ON]) {
        var target = e.target;
        e[ON] = 1;
        var current = target;
        var eventType = e.type;
        var type = 'mx-' + eventType;
        var info;
        var ignore;
        var arr = [];
        var node;

        while (current && current.nodeType == 1) { //找事件附近有mx-[a-z]+事件的DOM节点
            ignore = current.ei;
            if ((ignore && ignore[eventType]) || (info = current.getAttribute(type))) {
                break;
            } else {
                arr.push(current);
                current = current[ParentNode];
            }
        }
        if (info) { //有事件
            //找处理事件的vframe
            var infos = info.split(Group),
                firstProcessed,
                oinfo, ts, vframe, view, vId, begin, vfs, tempId;
            while (infos.length) {
                oinfo = infos.shift();
                if (oinfo) {
                    ts = oinfo.split(SPLITER);
                    oinfo = ts.pop();
                    vId = ts[0];
                    if (!vId && !firstProcessed) { //如果没有则找最近的vframe
                        begin = current;
                        vfs = VOM.all();
                        while (begin) {
                            if (Has(vfs, tempId = begin.id)) {
                                current.setAttribute(type, (vId = tempId) + SPLITER + info);
                                break;
                            }
                            begin = begin[ParentNode];
                        }
                    }
                    firstProcessed = 1;
                    if (vId) { //有处理的vframe,派发事件，让对应的vframe进行处理
                        vframe = VOM.get(vId);
                        view = vframe && vframe.view;
                        if (view && view.sign > 0) {

                            e.currentId = IdIt(current);
                            e.targetId = IdIt(target);
                            e.prevent = e.preventDefault;
                            e.stop = e.stopPropagation;

                            var m = EvtInfoCache.get(oinfo);
                            if (!m) {
                                m = oinfo.match(EvtInfoReg);
                                m = {
                                    n: m[1],
                                    f: m[2],
                                    i: m[3]
                                };
                                m.p = m.i && SafeExec(Function('return ' + m.i)) || {};
                                EvtInfoCache.set(oinfo, m);
                            }
                            var name = m.n + SPLITER + eventType;
                            var fn = view[name];
                            if (fn) {
                                if (e[m.f]) e[m.f]();
                                e.params = m.p;
                                SafeExec(fn, e, view);
                            }
                        }
                    } else {
                        throw Error('bad:' + oinfo);
                    }
                }
            }
        } else {
            while (arr.length) {
                node = arr.pop();
                ignore = node.ei || (node.ei = {});
                ignore[eventType] = 1;
            }
            node =NULL;
        }
        current = target =NULL;
    }
    //}
};
var DOMEventBind = function(type, remove) {
    var counter = RootEvents[type] | 0;
    var step = counter > 0 ? 1 : 0;
    counter += remove ? -step : step;
    if (!counter) {
        DOMEventLibBind(RootNode, type, DOMEventProcessor, remove);
        if (!remove) {
            counter = 1;
        }
    }
    RootEvents[type] = counter;
};
/**
 * View类
 * @name View
 * @class
 * @constructor
 * @borrows Event.on as #on
 * @borrows Event.fire as #fire
 * @borrows Event.off as #off
 * @borrows Event.once as #once
 * @param {Object} ops 创建view时，需要附加到view对象上的其它属性
 * @property {String} id 当前view与页面vframe节点对应的id
 * @property {Vframe} owner 拥有当前view的vframe对象
 * @property {Object} vom vom对象
 * @property {Integer} sign view的签名，用于刷新，销毁等的异步标识判断，当view销毁时，该属性是小于等于零的数
 * @property {String} tmpl 当前view对应的模板字符串(当hasTmpl为true时)，该属性在interact事件触发后才存在
 * @property {Boolean} rendered 标识当前view有没有渲染过，即primed事件有没有触发过
 * @property {Object} location WINDOW.locaiton.href解析出来的对象
 * @property {String} path 当前view的包路径名
 * @example
 * 关于事件:
 * 示例：
 *   html写法：
 *
 *   &lt;input type="button" mx-click="test({id:100,name:'xinglie'})" value="test" /&gt;
 *   &lt;a href="http://etao.com" mx-click="test&lt;prevent&gt;({com:'etao.com'})"&gt;http://etao.com&lt;/a&gt;
 *
 *   view写法：
 *
 *     'test&lt;click&gt;':function(e){
 *          //e.currentId 处理事件的dom节点id(即带有mx-click属性的节点)
 *          //e.targetId 触发事件的dom节点id(即鼠标点中的节点，在currentId里包含其它节点时，currentId与targetId有可能不一样)
 *          //e.params  传递的参数
 *          //e.params.com,e.params.id,e.params.name
 *      },
 *      'test&lt;mousedown&gt;':function(e){
 *
 *       }
 *
 *  //上述示例对test方法标注了click与mousedown事件，也可以合写成：
 *  'test&lt;click,mousedown&gt;':function(e){
 *      alert(e.type);//可通过type识别是哪种事件类型
 *  }
 */


var View = function(ops) {
    var me = this;
    Mix(me, ops);
    me.$ol = {
        ks: []
    };
    me.$res = {};
    me.sign = 1; //标识view是否刷新过，对于托管的函数资源，在回调这个函数时，不但要确保view没有销毁，而且要确保view没有刷新过，如果刷新过则不回调
    SafeExec(View.$, ops, me);
};
var VProto = View.prototype;
var Globals = {
    $win: WINDOW,
    $doc: DOCUMENT
};
View.$ = [];
View.prepare = function(oView, vom) {
    if (!oView[SPLITER]) { //只处理一次
        oView[SPLITER] = 1;
        VOM = vom;
        //oView.extend = me.extend;
        var prop = oView.prototype;
        var old, temp, name, evts, idx, revts = {}, rsevts = [],
            node;
        for (var p in prop) {
            old = prop[p];
            temp = p.match(EvtMethodReg);
            if (temp) {
                name = temp[1];
                evts = temp[2];
                evts = evts.split(COMMA);
                for (idx = evts.length - 1; idx > -1; idx--) {
                    temp = evts[idx];
                    node = Globals[name];
                    if (node) {
                        rsevts.push({
                            n: name,
                            t: temp,
                            h: node,
                            f: old
                        });
                    } else if (!prop[node = name + SPLITER + temp]) {
                        revts[temp] = 1;
                        prop[node] = old;
                    }
                }
            } else if (p == 'render') {
                prop[p] = WrapFn(old);
            }
        }
        prop.$evts = revts;
        prop.$sevts = rsevts;
    }
};

/**
 * 扩展View
 * @param  {Object} props 扩展到原型上的方法
 * @param  {Function} ctor  在初始化view时进行调用的方法
 * @example
 * LIB.add('app/tview',function(S,View){
 *     return View.mixin({
 *         test:function(){
 *             alert(this.$attr);
 *         }
 *     },function(){
 *          this.$attr='test';
 *     });
 * },{
 *     requires:['magix/view']
 * });
 * //加入Magix.start的extensions中
 *
 *  Magix.start({
 *      //...
 *      extensions:['app/tview']
 *
 *  });
 *
 * //这样完成后，所有的view对象都会有一个$attr属性和test方法
 * //当前上述功能也可以用继承实现，但继承层次太多时，可以考虑使用扩展来消除多层次的继承
 *
 */
View.mixin = function(props, ctor) {
    if (ctor) View.$.push(ctor);
    Mix(VProto, props);
};

Mix(Mix(VProto, Event), {
    /**
     * @lends View#
     */
    /**
     获取当前view对应的模板内容，开发app阶段使用xhr获取，打包上线后html作为view的template属性与js打包在一起，可以重写该方法，以实现模板的继承或共享基类的模板
     * @function
     * @param {String} path 路径
     * @param {Function} fn 获取完成后的回调
     */
    
    /**
     * 渲染view，供最终view开发者覆盖
     * @function
     */
    render: NOOP,
    /**
     * 调用magix/router的navigate方法
     * @function
     */
    navigate: Router.navigate,
    /**
     * 当WINDOW.location.href有变化时调用该方法（如果您通过observeLocation指定了相关参数，则这些相关参数有变化时才调用locationChange，否则不会调用），供最终的view开发人员进行覆盖
     * @function
     * @param {Object} e 事件对象
     * @param {Object} e.location WINDOW.location.href解析出来的对象
     * @param {Object} e.changed 包含有哪些变化的对象
     * @param {Function} e.prevent 阻止向所有子view传递locationChange的消息
     * @param {Function} e.toChildren 向特定的子view传递locationChange的消息
     * @example
     * //example1
     * locationChange:function(e){
     *     if(e.changed.isPath()){//path的改变
     *         //...
     *         e.prevent();//阻止向所有子view传递改变的消息
     *     }
     * }
     *
     * //example2
     * locationChange:function(e){
     *     if(e.changed.isParam('menu')){//menu参数发生改变
     *         e.toChildren('magix_vf_menus');//只向id为 magix_vf_menus的view传递这个消息
     *     }
     * }
     *
     * //example3
     * //当不调用e.prevent或e.toChildren，则向所有子view传递消息
     * locationChange:function(e){
     *     //...
     * }
     */
    //locationChange: NOOP,
    /**
     * 初始化方法，供最终的view开发人员进行覆盖
     * @param {Object} extra 初始化时，外部传递的参数
     * @param {Object} locChanged 地址栏变化的相关信息，比如从某个path过来的
     * @function
     */
    init: NOOP,
    /**
     * 标识当前view是否有模板文件
     * @default true
     */
    hasTmpl: true,
    /**
     * 是否启用DOM事件(test<click,mousedown>事件是否生效)
     * @default true
     * @example
     * 该属性在做浏览器兼容时有用：支持pushState的浏览器阻止a标签的默认行为，转用pushState，不支持时直接a标签跳转，view不启用事件
     * Q:为什么不支持history state的浏览器上还要使用view？
     * A:考虑 http://etao.com/list?page=2#!/list?page=3; 在IE6上，实际的页码是3，但后台生成时候生成的页码是2，<br />所以需要magix/view载入后对相应的a标签链接进行处理成实际的3。用户点击链接时，由于view没启用事件，不会阻止a标签的默认行为，后续才是正确的结果
     */
    //enableEvent: true,
    /**
     * view刷新时是否采用动画
     * @type {Boolean}
     */
    //enableAnim:false,
    /**
     * 包装mx-event事件，比如把mx-click="test<prevent>({key:'field'})" 包装成 mx-click="magix_vf_root^test<prevent>({key:'field})"，以方便识别交由哪个view处理
     * @function
     * @param {String} html 处理的代码片断
     * @param {Boolean} [onlyAddPrefix] 是否只添加前缀
     * @return {String} 处理后的字符串
     * @example
     * View.extend({
     *     'del&lt;click&gt;':function(e){
     *         S.one('#'+e.currentId).remove();
     *     },
     *     'addNode&lt;click&gt;':function(e){
     *         var tmpl='&lt;div mx-click="del"&gt;delete&lt;/div&gt;';
     *         //因为tmpl中有mx-click，因此需要下面这行代码进行处理一次
     *         tmpl=this.wrapEvent(tmpl);
     *         S.one('#'+e.currentId).append(tmpl);
     *     }
     * });
     *
     * //或者：
     * View.extend({
     *     'del&lt;click&gt;':function(e){
     *         S.one('#'+e.currentId).remove();
     *     },
     *     'addNode&lt;click&gt;':function(e){
     *         var tmpl='&lt;div mx-click="'+this.wrapEvent('del',true)+'"&gt;delete&lt;/div&gt;';
     *         S.one('#'+e.currentId).append(tmpl);
     *     }
     * });
     * //注意，只有动态添加的节点才需要处理
     */
    wrapEvent: function(html, onlyPrefix) {
        html += EMPTY;
        var prefix = this.id + SPLITER;
        if (onlyPrefix) {
            html = [EMPTY].concat(html).join(Group + prefix);
        } else {
            html = html.replace(MxEvt, '$&' + prefix);
        }
        return html;
    },
    /**
     * 加载view内容
     * @private
     */
    load: function() {
        var me = this;
        var hasTmpl = me.hasTmpl;
        var args = arguments;
        // var tmplReady = Has(me, 'tmpl');
        var ready = function(tmpl) {
            if (hasTmpl) {
                me.tmpl = me.wrapEvent(tmpl);
            }
            DelegateEvents(me);
            /*
                    关于interact事件的设计 ：
                    首先这个事件是对内的，当然外部也可以用，API文档上就不再体现了

                    interact : view准备好，让外部尽早介入，进行其它事件的监听 ，当这个事件触发时，view有可能已经有html了(无模板的情况)，所以此时外部可以去加载相应的子view了，同时要考虑在调用render方法后，有可能在该方法内通过setHTML更新html，所以在使用setHTML更新界面前，一定要先监听prerender rendered事件，因此设计了该  interact事件

                 */
            me.fire('interact', 0, 1); //可交互
            SafeExec(me.init, args, me);
            me.fire('inited', 0, 1);
            me.owner.viewInited = 1;
            me.render();
            //
            var noTemplateAndNoRendered = !hasTmpl && !me.rendered; //没模板，调用render后，render里面也没调用setHTML

            if (noTemplateAndNoRendered) { //监视有没有在调用render方法内更新view，对于没有模板的view，需要派发一次事件
                me.rendered = 1;
                me.fire('primed', 0, 1); //primed事件只触发一次
            }
        };
        if (hasTmpl) {
            me.fetchTmpl(me.path, me.wrapAsync(ready));
        } else {
            ready();
        }
    },
    /**
     * 通知当前view即将开始进行html的更新
     * @param {String} [id] 哪块区域需要更新，默认整个view
     */
    beginUpdate: function(id) {
        var me = this;
        if (me.sign > 0 && me.rendered) {
            me.fire('prerender', {
                id: id || me.id
            });
        }
    },
    /**
     * 通知当前view结束html的更新
     * @param {String} [id] 哪块区域结束更新，默认整个view
     */
    endUpdate: function(id) {
        var me = this;
        if (me.sign > 0) {
            if (!me.rendered) { //触发一次primed事件
                me.fire('primed', 0, 1);
                me.rendered = 1;
            }
            me.fire('rendered', {
                id: id || me.id
            }); //可以在rendered事件中访问view.rendered属性
        }
    },
    /**
     * 通知当前view进行更新，与beginUpdate不同的是：begin是开始更新html，notify是开始调用更新的方法，通常render已经自动做了处理，对于用户自定义的获取数据并更新界面时，在开始更新前，需要调用一下该方法
     * @return {Integer} 当前view的签名
     */
    /* notifyUpdate: function() {
        var me = this;
        if (me.sign > 0) {
            me.sign++;
            me.fire('rendercall');
            DestroyAllManaged(me, 1, 1);
        }
        return me.sign;
    },*/
    /**
     * 包装异步回调
     * @param  {Function} fn 异步回调的function
     * @return {Function}
     * @example
     * render:function(){
     *     setTimeout(this.wrapAsync(function(){
     *         //codes
     *     }),50000);
     * }
     * //为什么要包装一次？
     * //Magix是单页应用，有可能异步回调执行时，当前view已经被销毁。比如上例中的setTimeout，50s后执行回调，如果你的回调中去操作了DOM，则会出错，为了避免这种情况的出现，可以调用view的wrapAsync包装一次。(该示例中最好的做法是在view销毁时清除setTimeout，但有时候你很难控制回调的执行，所以最好包装一次)
     * //
     * //
     */
    wrapAsync: function(fn) {
        var me = this;
        var sign = me.sign;
        return function() {
            if (sign > 0 && sign == me.sign) {
                if (fn) fn.apply(this, arguments);
            }
        };
    },
    /**
     * 设置view的html内容
     * @param {String} id 更新节点的id
     * @param {Strig} html html字符串
     * @example
     * render:function(){
     *     this.setHTML(this.id,this.tmpl);//渲染界面，当界面复杂时，请考虑用其它方案进行更新
     * }
     */
    setHTML: function(id, html) {
        var me = this,
            n;
        me.beginUpdate(id);
        if (me.sign > 0) {
            n = me.$(id);
            if (n) n.innerHTML = html;
        }
        me.endUpdate(id);
    },
    /**
     * 监视地址栏中的参数或path，有变动时，才调用当前view的render方法。通常情况下location有变化不会引起当前view的render被调用，所以你需要指定地址栏中哪些参数有变化时才引起render调用，使得view只关注与自已需要刷新有关的参数
     * @param {Array|String|Object} args  数组字符串或对象
     * @example
     * return View.extend({
     *      init:function(){
     *          this.observeLocation('page,rows');//关注地址栏中的page rows2个参数的变化，当其中的任意一个改变时，才引起当前view的locationChange被调用
     *          this.observeLocation({
     *              path:true//关注path的变化
     *          });
     *          //也可以写成下面的形式
     *          //this.observeLocation({
     *          //    params:['page','rows'],
     *          //    path:true
     *          //})
     *      },
     *      render:function(e){
     *          if(e.changed.isParam('page')){};//检测是否是page发生的改变
     *          if(e.changed.isParam('rows')){};//检测是否是rows发生的改变
     *      }
     * });
     */
    observeLocation: function(args) {
        var me = this,
            loc;
        loc = me.$ol;
        loc.f = 1;
        var keys = loc.ks;
        if (Magix._o(args)) {
            loc.pn = args.path;
            args = args.params;
        }
        if (args) {
            loc.ks = keys.concat((args + EMPTY).split(COMMA));
        }
    },
    /**
     * 指定监控地址栏中path的改变
     * @example
     * return View.extend({
     *      init:function(){
     *          this.observePathname();//关注地址栏中path的改变，path改变才引起当前view的locationChange被调用
     *      },
     *      locationChange:function(e){
     *          if(e.changed.isPath()){};//是否是path发生的改变
     *      }
     * });
     */
    /*observePathname:function(){
        var me=this;
        if(!me.$loc)me.$loc={};
        me.$loc.pn=true;
    },*/
    /**
     * 指定要监视地址栏中的哪些值有变化时，当前view的locationChange才会被调用。通常情况下location有变化就会引起当前view的locationChange被调用，但这会带来一些不必要的麻烦，所以你可以指定地址栏中哪些值有变化时才引起locationChange调用，使得view只关注与自已需要刷新有关的参数
     * @param {Array|String} keys            key数组或字符串
     * @param {Boolean} observePathname 是否监视path
     * @example
     * return View.extend({
     *      init:function(){
     *          this.observeParams('page,rows');//关注地址栏中的page rows2个参数的变化，当其中的任意一个改变时，才引起当前view的locationChange被调用
     *      },
     *      locationChange:function(e){
     *          if(e.changed.isParam('page')){};//检测是否是page发生的改变
     *          if(e.changed.isParam('rows')){};//检测是否是rows发生的改变
     *      }
     * });
     */
    /*observeParams:function(keys){
        var me=this;
        if(!me.$loc)me.$loc={};
        me.$loc.keys=Magix.isArray(keys)?keys:String(keys).split(COMMA);
    },*/
    /**
     * 检测通过observeLocation方法指定的key对应的值有没有发生变化
     * @param {Object} changed 对象
     * @return {Boolean} 是否发生改变
     * @private
     */
    olChg: function(changed) {
        var me = this;
        var loc = me.$ol;
        var res;
        if (loc.f) {
            if (loc.pn) {
                res = changed.path;
            }
            if (!res) {
                res = changed.isParam(loc.ks);
            }
        }
        return res;
    },

    /**
     * 销毁当前view
     * @private
     */
    oust: function() {
        var me = this;
        if (me.sign > 0) {
            me.sign = 0;
            me.fire(DestroyStr, 0, 1, 1);
            DestroyAllManaged(me, 1);
            DelegateEvents(me, 1);
        }
        me.sign--;
    },
    /**
     * 判断节点是否在某些节点里面
     * @param  {String} id 节点id
     * @param {Array} nodes dom节点或对象的数组
     * @return {Boolean}
     */
    inside: function(id, nodes) {
        var me = this,
            contained, t;
        nodes = (nodes + EMPTY).split(COMMA);
        for (t = nodes.length - 1; t >= 0; t--) {
            contained = me.$i(id, nodes[t]);
            if (contained) break;
        }
        return contained;
    },
    /**
     * 让view帮你管理资源，强烈建议对组件等进行托管
     * @param {String} [key] 资源标识key
     * @param {Object} res 要托管的资源
     * @param {Boolean} [destroyWhenCallRender] 当view的render方法调用时，是否销毁资源
     * @return {Object} 返回传入的资源
     * @example
     * init:function(){
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
     *          },
     *          error:function(msg){
     *              //TODO
     *          }
     *      });
     *
     *      _self.manage(m);
     * }
     */
    manage: function(key, res, destroyWhenCallRender) {
        var me = this;
        var k = 1;
        var cache = me.$res;
        if (key && !Magix._s(key)) {
            destroyWhenCallRender = res;
            res = key;
            key = EMPTY;
        }
        if (key) {
            DestroyIt(cache, key);
        } else {
            k = 0;
            key = 'res_' + (ResCounter++);
        }
        var wrapObj = {
            k: k,
            e: res,
            x: destroyWhenCallRender
        };
        cache[key] = wrapObj;
        return res;
    },
    /**
     * 获取托管的资源
     * @param {String} [key] 托管资源时传入的标识key
     * @param {Boolean} [remove] 获取后是否从缓存中移除
     * @return {Object}
     */
    getManaged: function(key, remove) {
        var me = this;
        var cache = me.$res;
        var res = key ?NULL : cache;
        if (key && Has(cache, key)) {
            res = cache[key].e;
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
     * @param {String} key 托管资源时传入的标识key
     * @return {Object}
     */
    destroyManaged: function(key) {
        DestroyIt(this.$res, key, 1);
    }
    /**
     * 当您采用setHTML方法异步更新html时，通知view做好异步更新的准备，<b>注意:该方法最好和manage，setHTML一起使用。当您采用其它方式异步更新整个view的html时，仍需调用该方法</b>，建议对所有的异步更新回调使用manage方法托管，对更新整个view html前，调用beginAsyncUpdate进行更新通知
     * @example
     * // 什么是异步更新html？
     * render:function(){
     *      var _self=this;
     *      var m=new Model({uri:'user:list'});
     *      m.load({
     *          success:_self.manage(function(data){
     *              var html=Mu.to_html(_self.tmpl,data);
     *              _self.setHTML(html);
     *          }),
     *          error:_self.manage(function(msg){
     *              _self.setHTML(msg);
     *          })
     *      })
     * }
     *
     * //如上所示，当调用render方法时，render方法内部使用model异步获取数据后才完成html的更新则这个render就是采用异步更新html的
     *
     * //异步更新带来的问题：
     * //view对象监听地址栏中的某个参数，当这个参数发生变化时，view调用render方法进行刷新，因为是异步的，所以并不能立即更新界面，
     * //当监控的这个参数连续变化时，view会多次调用render方法进行刷新，由于异步，你并不能保证最后刷新时发出的异步请求最后返回，
     * //有可能先发出的请求后返回，这样就会出现界面与url并不符合的情况，比如tabs的切换和tabPanel的更新，连续点击tab1 tab2 tab3
     * //会引起tabPanel这个view刷新，但是异步返回有可能3先回来2最后回来，会导致明明选中的是tab3，却显示着tab2的内容
     * //所以要么你自已在回调中做判断，要么把上面的示例改写成下面这样的：
     *  render:function(){
     *      var _self=this;
     *      _self.beginAsyncUpdate();//开始异步更新
     *      var m=new Model({uri:'user:list'});
     *      m.load({
     *          success:_self.manage(function(data){
     *              var html=Mu.to_html(_self.tmpl,data);
     *              _self.setHTML(html);
     *          }),
     *          error:_self.manage(function(msg){
     *              _self.setHTML(msg);
     *          })
     *      });
     *      _self.endAsyncUpdate();//结束异步更新
     * }
     * //其中endAsyncUpdate是备用的，把你的异步更新的代码放begin end之间即可
     * //当然如果在每个异步更新的都需要这样写的话来带来差劲的编码体验，所以View会对render,renderUI,updateUI三个方法自动进行异步更新包装
     * //您在使用这三个方法异步更新html时无须调用beginAsyncUpdate和endAsyncUpdate方法
     * //如果除了这三个方法外你还要添加其它的异步更新方法，可调用View静态方法View.registerAsyncUpdateName来注册自已的方法
     * //请优先考虑使用render renderUI updateUI 这三个方法来实现view的html更新，其中render方法magix会自动调用，您就考虑后2个方法吧
     * //比如这样：
     *
     * renderUI:function(){//当方法名为 render renderUI updateUI时您不需要考虑异步更新带来的问题
     *      var _self=this;
     *      setTimeout(this.manage(function(){
     *          _self.setHTML(_self.tmpl);
     *      }),5000);
     * },
     *
     * receiveMessage:function(e){
     *      if(e.action=='render'){
     *          this.renderUI();
     *      }
     * }
     *
     * //当您需要自定义异步更新方法时，可以这样：
     * LIB.add("app/views/list",function(S,MxView){
     *      var ListView=MxView.extend({
     *          updateHTMLByXHR:function(){
     *              var _self=this;
     *              S.io({
     *                  success:_self.manage(function(html){
     *                      //TODO
     *                      _self.setHTML(html);
     *                  })
     *              });
     *          },
     *          receiveMessage:function(e){
     *              if(e.action=='update'){
     *                  this.updateHTMLByXHR();
     *              }
     *          }
     *      });
     *      ListView.registerAsyncUpdateName('updateHTMLByXHR');//注册异步更新html的方法名
     *      return ListView;
     * },{
     *      requires:["magix/view"]
     * })
     * //当您不想托管回调方法，又想消除异步更新带来的隐患时，可以这样：
     *
     * updateHTML:function(){
     *      var _self=this;
     *      var begin=_self.beginAsyncUpdate();//记录异步更新标识
     *      S.io({
     *          success:function(html){
     *              //if(_self.sign){//不托管方法时，您需要自已判断view有没有销毁(使用异步更新标识时，不需要判断exist)
     *                  var end=_self.endAsyncUpdate();//结束异步更新
     *                  if(begin==end){//开始和结束时的标识一样，表示view没有更新过
     *                      _self.setHTML(html);
     *                  }
     *              //}
     *          }
     *      });
     * }
     *
     * //顺带说一下signature
     * //并不是所有的异步更新都需要托管，考虑这样的情况：
     *
     * render:function(){
     *      ModelFactory.fetchAll({
     *          type:'User_List',
     *          cacheKey:'User_List'
     *      },function(m){
     *          //render
     *      });
     * },
     * //...
     * click:{
     *      addUser:function(e){
     *          var m=ModelFactory.getIf('User_List');
     *          var userList=m.get("userList");
     *          m.beginTransaction();
     *          userList.push({
     *              id:'xinglie',
     *              name:'xl'
     *          });
     *
     *          m.save({
     *              success:function(){//该回调不太适合托管
     *                  m.endTransaction();
     *                  Helper.tipMsg('添加成功')
     *              },
     *              error:function(msg){//该方法同样不适合托管，当数据保存失败时，需要回滚数据，而如果此时view有刷新或销毁，会导致该方法不被调用，无法达到数据的回滚
     *                  m.rollbackTransaction();
     *                  Helper.tipMsg('添加失败')
     *              }
     *          })
     *
     *      }
     * }
     *
     * //以上click中的方法这样写较合适：
     *
     * click:{
     *      addUser:function(e){
     *          var m=ModelFactory.getIf('User_List');
     *          var userList=m.get("userList");
     *          m.beginTransaction();
     *          userList.push({
     *              id:'xinglie',
     *              name:'xl'
     *          });
     *
     *          var sign=e.view.signature();//获取签名
     *
     *          m.save({
     *              success:function(){//该回调不太适合托管
     *                  m.endTransaction();
     *                  if(sign==e.view.signature()){//相等时表示view即没刷新也没销毁，此时才提示
     *                      Helper.tipMsg('添加成功')
     *                  }
     *              },
     *              error:function(msg){//该方法同样不适合托管，当数据保存失败时，需要回滚数据，而如果此时view有刷新或销毁，会导致该方法不被调用，无法达到数据的回滚
     *                  m.rollbackTransaction();
     *                  if(sign==e.view.signature()){//view即没刷新也没销毁
     *                      Helper.tipMsg('添加失败')
     *                  }
     *              }
     *          })
     *
     *      }
     * }
     *
     * //如果您无法识别哪些需要托管，哪些需要签名，统一使用托管方法就好了
     */
    /*beginAsyncUpdate:function(){
        return this.sign++;//更新sign
    },*/
    /**
     * 获取view在当前状态下的签名，view在刷新或销毁时，均会更新签名。(通过签名可识别view有没有搞过什么动作)
     */
    /*    signature:function(){
        return this.sign;
    },*/
    /**
     * 通知view结束异步更新html
     * @see View#beginAsyncUpdate
     */
    /*endAsyncUpdate:function(){
        return this.sign;
    },*/
    /**
     * 当view调用setHTML刷新前触发
     * @name View#prerender
     * @event
     * @param {Object} e
     * @param {String} e.id 指示哪块区域要进行更新
     * @param {Boolean} e.keep 指示是否保留前view渲染的html
     */

    /**
     * 当view首次完成界面的html设置后触发，view有没有模板均会触发该事件，对于有模板的view，会等到模板取回，第一次调用setHTML更新界面后才触发，总之该事件触发后，您就可以访问view的HTML DOM节点对象（该事件仅代表自身的html创建完成，如果需要对整个子view也要监控，请使用created事件）
     * @name View#primed
     * @event
     * @param {Object} e view首次调用render完成界面的创建后触发
     */

    /**
     * 每次调用setHTML更新view内容完成后触发
     * @name View#rendered
     * @event
     * @param {Object} e view每次调用setHTML完成后触发，当hasTmpl属性为false时，并不会触发该事 件，但会触发primed首次完成创建界面的事件
     * @param {String} e.id 指示哪块区域完成的渲染
     */

    /**
     * view销毁时触发
     * @name View#destroy
     * @event
     * @param {Object} e
     */

    /**
     * view调用init方法后触发
     * @name View#inited
     * @event
     * @param {Object} e
     */

    /**
     * view自身和所有子孙view创建完成后触发，常用于要在某个view中统一绑定事件或统一做字段校验，而这个view是由许多子孙view组成的，通过监听该事件可知道子孙view什么时间创建完成（注意：当view中有子view，且该子view是通过程序动态mountView而不是通过mx-view指定时，该事件会也会等待到view创建完成触发，而对于您在某个view中有如下代码：<div><vframe></vframe></div>，有一个空的vframe且未指定mx-view属性，同时您在这个view中没有动态渲染vframe对应的view，则该事件不会触发，magix无法识别出您留空vframe的意图，到底是需要动态mount还是手误，不过在具体应用中，出现空vframe且没有动态mount几乎是不存在的^_^）
     * @name View#created
     * @event
     * @param {Object} e
     * @example
     * init:function(){
     *      this.on('created',function(){
     *          //
     *      })
     * }
     */

    /**
     * view自身和所有子孙view有改动时触发，改动包括刷新和重新mountView，与created一起使用，当view自身和所有子孙view创建完成会触发created，当其中的一个view刷新或重新mountView，会触发childrenAlter，当是刷新时，刷新完成会再次触发created事件，因此这2个事件不只触发一次！！但这2个事件会成对触发，比如触发几次childrenAlter就会触发几次created
     * @name View#alter
     * @event
     * @param {Object} e
     */

    /**
     * 异步更新ui的方法(render)被调用前触发
     * @name View#rendercall
     * @event
     * @param {Object} e
     */

    /**
     * 当view准备好模板(模板有可能是异步获取的)，调用init和render之前触发。可在该事件内对template进行一次处理
     * @name View#interact
     * @event
     * @param {Object} e
     */
});
    var Suffix = '?t=' + S.now();
    var Mods = S.Env.mods;

    /*var ProcessObject = function(props, proto, enterObject) {
        for (var p in proto) {
            if (S.isObject(proto[p])) {
                if (!Has(props, p)) props[p] = {};
                ProcessObject(props[p], proto[p], 1);
            } else if (enterObject) {
                props[p] = proto[p];
            }
        }
    };*/

    var Tmpls = {}, Locker = {};
    VProto.fetchTmpl = function(path, fn) {
        var me = this;
        var hasTemplate = 'tmpl' in me;
        if (!hasTemplate) {
            if (Has(Tmpls, path)) {
                fn(Tmpls[path]);
            } else {
                var info = Mods[path];
                var url;
                if (info) {
                    url = info.uri || info.fullpath;
                    url = url.slice(0, url.indexOf(path) + path.length);
                }
                var file = url + '.html';
                var l = Locker[file];
                var onload = function(tmpl) {
                    fn(Tmpls[path] = tmpl);
                };
                if (l) {
                    l.push(onload);
                } else {
                    l = Locker[file] = [onload];
                    IO({
                        url: file + Suffix,
                        complete: function(data, status) {
                            SafeExec(l, data || status);
                            delete Locker[file];
                        }
                    });
                }
            }
        } else {
            fn(me.tmpl);
        }
    };
    View.extend = function(props, statics, ctor) {
        var me = this;
        if (Magix._f(statics)) {
            ctor = statics;
            statics =NULL;
        }
        var BaseView = function(a) {
            me.call(this, a);
            if (ctor) {
                ctor.call(this, a);
            }
        };
        BaseView.extend = me.extend;
        return S.extend(BaseView, me, props, statics);
    };

    return View;
}, {
    requires: ['magix/magix', 'magix/event', 'magix/router', 'io']
});
/**
 * @fileOverview Model
 * @version 1.2
 * @author 行列
 */
LIB.add('magix/model', function(S, Magix) {
    /**
 * Model类
 * @name Model
 * @namespace
 * @class
 * @constructor
 * @property {String} id model唯一标识
 */

var Has = Magix.has;
var IsObject = Magix._o;
var ToString = Magix.toString;
var URL = 'URL',
    FORM = 'FORM';

var Model = function() {
    this.id = 'm' + COUNTER++;
};
var SetParams = function(type) {
    return function(obj1, obj2, ignoreIfExist) {
        var me = this,
            k = SPLITER + type,
            t, p, obj;
        if (!me[k]) me[k] = {};
        obj = me[k];
        if (Magix._f(obj1)) {
            obj1 = Magix.tryCall(obj1);
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
            return this[SPLITER+type]||null;
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
        return this[SPLITER + FORM];
    },
    /**
     * 获取通过setUrlParams放入的参数
     * @return {Object}
     */
    getUrlParams: function() {
        return this[SPLITER + URL];
    },
    /**
     * 获取参数
     * @param {String} [type] 参数分组的key[URL,FORM]，默认为URL
     * @return {String}
     */

    /*var k = SPLITER + type;
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
            /*if (!Magix._a(v)) {
                v = [v];
            }
            for (var i = 0; i < v.length; i++) {
                arr.push(p + '=' + Encode(v[i]));
            }*/
    /*}
        return arr.join(SPLITER);*/
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
            delete this[SPLITER+type];
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
                delete me[SPLITER + p];
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
     *
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
    Model.extend = function(props, statics, ctor) {
        var me = this;
        var BaseModel = function() {
            me.call(this);
            if (ctor) {
                ctor.call(this);
            }
        };
        return S.extend(BaseModel, me, props, statics);
    };
    return Model;
}, {
    requires: ['magix/magix']
});
/**
 * @fileOverview model管理工厂，可方便的对Model进行缓存和更新
 * @author 行列
 * @version 1.2
 **/
LIB.add("magix/manager", function(S, Magix, Event) {
    /*
        #begin mm_fetchall_1#
        LIB.add('testMM',function(S,MM,Model){
        #end#

        #begin mm_fetchall_2#
        },{
            requires:["magix/manager","magix/model"]
        });
        #end#

        #begin mm_fetchall_3#
        LIB.use('testMM',function(S,TM){
        #end#
     */
    var Has = Magix.has;
var SafeExec = Magix.tryCall;
var IsArray = Magix._a;
var IsFunction = Magix._f;

var FetchFlags_ONE = 1;
var FetchFlags_ORDER = 2;
var FetchFlags_ALL = 4;
var FormParams = 'formParams';
var UrlParams = 'urlParams';
var SerKeys = [FormParams, UrlParams];
var Now = Date.now || function() {
        return +new Date();
    };
var WJSON = WINDOW.JSON;
var Mix = Magix.mix;
var DefaultCacheTime = 20 * 60 * 1000;

//使用JSON.stringify生成唯一的缓存key，当浏览器不支持JSON时，不再缓存
var Ser = function(o, f, refArr, a) {
    if (f) { //一定要先判断
        if (IsFunction(o)) refArr.push(Ser(SafeExec(o)));
    } else if (WJSON) {
        a = WJSON.stringify(o);
    } else {
        a = Now(); //不缓存
    }
    return a;
};
/*
    a=['1','2,']
    b=['1','2','']
 */
var DefaultCacheKey = function(meta, attrs) {
    var arr = [Ser(attrs), Ser(meta)];
    for (var i = SerKeys.length - 1, key; i > -1; i--) {
        key = SerKeys[i];
        Ser(meta[key], 1, arr);
        Ser(attrs[key], 1, arr);
    }
    Ser(meta.key, 1, arr);
    return arr.join(SPLITER);
};
var ProcessCache = function(attrs) {
    var cache = attrs.cache;
    if (cache) {
        cache = cache === true ? DefaultCacheTime : cache | 0;
    }
    return cache;
};


var TError = function(e) {
    throw Error(e);
};
/**
 * Model管理对象，可方便的对Model进行缓存和更新
 * @name Manager
 * @class
 * @namespace
 * @borrows Event.on as #on
 * @borrows Event.fire as #fire
 * @borrows Event.off as #off
 * @borrows Event.once as #once
 * @param {Model} modelClass Model类
 * @param {Integer} [cacheMax] 缓存最大值
 * @param {Integer} [cacheBuffer] 缓存缓存区大小
 */
var Manager = function(modelClass, cacheMax, cacheBuffer) {
    var me = this;
    me.$mClz = modelClass;
    me.$mCache = Magix.cache(cacheMax, cacheBuffer);
    me.$mReqs = {};
    me.$mMetas = {};
    me.id = 'mm' + COUNTER++;
};

/**
 * 辅助Manager
 * @name Request
 * @class
 * @namespace
 * @param {Manager} host
 */
var Request = function(host) {
    var me = this;
    me.$host = host;
    me.$reqs = {};
    me.sign = 1;
    me.id = 'mr' + COUNTER++;
    me.$queue = [];
};

var Slice = [].slice;


var WrapDone = function(fn, model, idx, ops) {
    var t = function(err) {
        return fn.apply(model, [idx, ops, err, t.ost]);
    };
    return t;
};
var CacheDone = function(err, ops) {
    //
    var cacheKey = ops.b;
    var modelsCacheKeys = ops.a;
    var cached = modelsCacheKeys[cacheKey];
    if (cached) {
        var fns = cached.q;
        delete modelsCacheKeys[cacheKey];
        SafeExec(fns, err, cached.e);
    }
};
var DoneFn = function(idx, ops, err, ost) {
    //
    var model = this;
    var request = ops.a;
    var reqs = ops.c;
    var doneArr = ops.d;
    var errorArgs = ops.g;
    var modelsCache = ops.i;
    var host = ops.j;
    var flag = ops.k;
    var doneIsArray = ops.l;
    var done = ops.m;
    var doneArgs = ops.n;
    var orderlyArr = ops.o;

    var currentError;
    var newModel;
    //

    ops.b++; //exec count
    //
    delete reqs[model.id];
    //
    var mm = model.$mm;
    var cacheKey = mm.key;
    doneArr[idx + 1] = model;
    if (err) {
        ops.e = 1;
        currentError = 1;
        ops.f = err;
        errorArgs.msg = err;
        errorArgs[idx] = err;
        host.fire('fail', {
            model: model,
            msg: err
        });
        newModel = 1;
    } else {
        if (!modelsCache.has(cacheKey)) {
            if (cacheKey) {
                modelsCache.set(cacheKey, model);
            }
            mm.time = Now();
            var after = mm.after;

            if (after) { //有after
                SafeExec(after, model);
            }
            if (mm.cls) {
                host.clearCache(mm.cls);
            }
            host.fire('done', {
                model: model
            });
            newModel = 1;
        }
    }
    if (!request.$ost && !ost) { //销毁，啥也不做
        if (flag == FetchFlags_ONE) { //如果是其中一个成功，则每次成功回调一次
            var m = doneIsArray ? done[idx] : done;
            if (m) {
                doneArgs[idx + 1] = SafeExec(m, [currentError ? errorArgs :NULL, model, errorArgs], request);
            }
        } else if (flag == FetchFlags_ORDER) {
            //var m=doneIsArray?done[idx]:done;
            orderlyArr[idx] = {
                m: model,
                e: currentError,
                s: err
            };
            //
            for (var i = orderlyArr.i || 0, t, d; t = orderlyArr[i]; i++) {
                d = doneIsArray ? done[i] : done;
                if (t.e) {
                    errorArgs.msg = t.s;
                    errorArgs[i] = t.s;
                }
                doneArgs[i + 1] = SafeExec(d, [t.e ? errorArgs :NULL, t.m, errorArgs].concat(doneArgs), request);
            }
            orderlyArr.i = i;
        }
        if (ops.b == ops.h) { //ops.h total count
            if (!ops.e) {
                errorArgs =NULL;
            }
            doneArgs[0] = errorArgs;
            if (flag == FetchFlags_ALL) {
                doneArr[0] = errorArgs;
                doneArgs[1] = SafeExec(done, doneArr, request);
            }
            request.$busy = 0;
            request.doNext(doneArgs);
        }

    }
    if (newModel) {
        host.fire('finish', {
            msg: err,
            model: model
        });
    }
};
/**
 * 获取models，该用缓存的用缓存，该发起请求的请求
 * @private
 * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',urlParams:{a:'12'},formParams:{b:2}}
 * @param {Function} done   完成时的回调
 * @param {Integer} flag   获取哪种类型的models
 * @param {Boolean} save 是否是保存的动作
 * @return {Request}
 */
var Send = function(me, models, done, flag, save) {
    if (me.$ost) return me;
    if (me.$busy) {
        return me.next(function() {
            Send(this, models, done, flag, save);
        });
    }
    me.$busy = 1;
    me.sign++;
    var host = me.$host;
    var modelsCache = host.$mCache;
    var modelsCacheKeys = host.$mReqs;
    var reqs = me.$reqs;

    if (!IsArray(models)) {
        models = [models];
    }
    var total = models.length;
    var doneArgs = [];

    var doneIsArray = IsArray(done);
    if (doneIsArray) {
        doneArgs = new Array(done.length);
    }

    var options = {
        a: me,
        b: 0, //current done
        c: me.$reqs,
        d: new Array(total),
        //e hasError,
        //f lastMsg
        g: {},
        h: total,
        i: modelsCache,
        j: host,
        k: flag,
        l: doneIsArray,
        m: done,
        n: doneArgs,
        o: []
    };

    for (var i = 0, model; i < models.length; i++) {
        model = models[i];
        if (model) {
            var modelInfo = host.getModel(model, save);

            var modelEntity = modelInfo.entity;
            var cacheKey = modelEntity.$mm.key;

            var wrapDoneFn = WrapDone(DoneFn, modelEntity, i, options);
            wrapDoneFn.id = me.id;

            if (cacheKey && Has(modelsCacheKeys, cacheKey)) {
                modelsCacheKeys[cacheKey].q.push(wrapDoneFn);
            } else {
                if (modelInfo.update) {
                    reqs[modelEntity.id] = modelEntity;
                    if (cacheKey) {
                        modelsCacheKeys[cacheKey] = {
                            q: [wrapDoneFn],
                            e: modelEntity
                        };
                        wrapDoneFn = CacheDone;
                    }
                    modelEntity.request(wrapDoneFn, {
                        a: modelsCacheKeys,
                        b: cacheKey
                    });
                } else {
                    wrapDoneFn();
                }
            }
        } else {
            TError('empty model');
        }
    }
    return me;
};
var GenRequestMethod = function(flag, save) {
    return function(models, done) {
        var cbs = Slice.call(arguments, 1);
        return Send(this, models, cbs.length > 1 ? cbs : done, flag, save);
    };
};
Mix(Manager, {
    /**
     * @lends Manager
     */
    /**
     * 创建Model类管理对象
     * @param {Model} modelClass Model类
     * @param {Integer} [cacheMax] 缓存最大值
     * @param {Integer} [cacheBuffer] 缓存缓存区大小
     */
    create: function(modelClass, cacheMax, cacheBuffer) {
        return new Manager(modelClass, cacheMax, cacheBuffer);
    }
});


Mix(Request.prototype, {
    /**
     * @lends Request#
     */
    /**
     * 获取models，所有请求完成回调done
     * @function
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},formParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {Request}
     * @example
        //定义
        
        LIB.add('testMM',function(S,MM,Model){
        
            var TestMM=MM.create(Model);
            TestMM.registerModels([{
                name:'Test1',
                url:'/api/test1.json'
            },{
                name:'Test2',
                url:'/api/test2.json',
                urlParams:{
                    type:'2'
                }
            }]);
            return TestMM;
        
        },{
            requires:["magix/manager","magix/model"]
        });
        
        //使用
        
        LIB.use('testMM',function(S,TM){
        
            TM.fetchAll([{
                name:'Test1'
            },{
                name:'Test2'
            }],function(err,m1,m2){

            });
        });
     */
    fetchAll: function(models, done) {
        return Send(this, models, done, FetchFlags_ALL);
    },
    /**
     * 保存models，所有请求完成回调done
     * @function
     * @param {Object|Array} models 保存models时的描述信息，如:{name:'Home',urlParams:{a:'12'},formParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {Request}
     */
    save: function(models, done) {
        return Send(this, models, done, FetchFlags_ALL, 1);
    },
    /**
     * 获取models，按顺序执行回调done
     * @function
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},formParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {Request}
     * @example
        //代码片断：
        //1：获取多个model，回调只有一个时
        var r=MM.fetchOrder([
            {name:'M1'},
            {name:'M2'},
            {name:'M3'}
        ],function(err,model){//按m1,m2,m3顺序回调，即使m2的请求先于m1的返回，也是m1调用后才调用m2，只提供一个回调时，回调会被调用三次
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        });

        //2:获取多个model，回调多于一个时
        var r=MM.fetchOrder([
            {name:'M1'},
            {name:'M2'},
            {name:'M3'}
        ],function(err,model){//调用m1
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        },function(err,model){//m1调用完成后调用m2
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        });
        //注意，回调多于一个时，当提供的回调多于或少于model个数时，多或少的会被忽略掉
     */
    fetchOrder: GenRequestMethod(FetchFlags_ORDER),
    /**
     * 获取models，其中任意一个成功均立即回调，回调会被调用多次
     * @function
     * @param {Object|Array} models 获取models时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},formParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @return {Request}
     * @example
        //代码片断：
        //1：获取多个model，回调只有一个时
        var r=MM.fetchOrder([
            {name:'M1'},
            {name:'M2'},
            {name:'M3'}
        ],function(err,model){//m1,m2,m3，谁快先调用谁，且被调用三次
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        });

        //2:获取多个model，回调多于一个时
        var r=MM.fetchOrder([
            {name:'M1'},
            {name:'M2'},
            {name:'M3'}
        ],function(err,model){//m1返回即调用
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        },function(err,model){//m2返回即调用
            if(err){
                alert(err.msg);
            }else{
                alert(model.get('name'));
            }
        });
     */
    fetchOne: GenRequestMethod(FetchFlags_ONE),
    /**
     * 前一个fetchX或save任务做完后的下一个任务
     * @param  {Function} callback 当前面的任务完成后调用该回调
     * @return {Request}
     * @example
        var r=MM.fetchAll([
            {name:'M1'},
            {name:'M2'}
        ],function(err,m1,m2){

            return 'fetchAllReturned';
        });

        r.next(function(err,fetchAllReturned){
            alert(fetchAllReturned);
        });
     */
    next: function(callback) {
        var me = this;
        if (!me.$ost) {
            me.$queue.push(callback);
            me.doNext(me.$args);
        }
        return me;
    },
    /**
     * 做下一个任务
     * @param {Array} preArgs 上次请求任务回调的返回值，成功时：[null,Returned]，失败时：[{msg:'message'},null]
     * @example
     * var r=Manager.createRequest(view);
     * r.fetchAll('Name',function(e,m){
     *
     *     return m;
     * });
     * r.next(function(e,result){//result为m
     *     return r.fetchAll('NextName',function(e,m){
     *         return m;
     *     });
     * });
     *
     * r.next(function(e,m){//m===next m;
     *     return 'ok';
     * });
     *
     * r.next(function(e,m){
     *     //m==='ok';
     * });
     *
     * //当出错时，e为出错的信息
     */
    doNext: function(preArgs) {
        var me = this;
        if (!me.$busy && !me.$ost) {
            me.$busy = 1;
            var sign = ++me.sign;
            me.$ntId = setTimeout(function() { //前面的任务可能从缓存中来，执行很快
                me.$busy = 0;
                me.$args = preArgs;
                var queue = me.$queue,
                    one = queue.shift(),
                    result;
                if (one) {
                    result = SafeExec(one, preArgs, me);
                    if (sign == me.sign) { // 未调用任何的发送或获取数据的方法
                        me.doNext(result === queue.$ ? preArgs : [null, result]);
                    }
                }
            }, 0);
        }
    },
    /**
     * 销毁当前请求，不可以继续发起新请求，而且不再调用相应的回调
     */
    destroy: function() {
        var me = this;
        me.$ost = 1;
        clearTimeout(me.$ntId);
        var host = me.$host;
        var reqs = me.$reqs;
        var modelsCacheKeys = host.$mReqs;
        for (var p in reqs) {
            var m = reqs[p];
            var cacheKey = m.$mm.key,
                cache, fns;
            if (cacheKey && Has(modelsCacheKeys, cacheKey)) {
                cache = modelsCacheKeys[cacheKey];
                fns = cache.q;
                for (var i = 0, fn; i < fns.length; i++) {
                    fn = fns[i];
                    if (fn.id == me.id) { //记录销毁
                        fn.ost = 1;
                    }
                }
            }
        }
        me.$reqs = {};
        me.$queue = [];
        me.$busy = 0;
    }
});
var MP = Manager.prototype;
Mix(Mix(MP, Event), {
    /**
     * @lends Manager#
     */
    /**
     * 注册APP中用到的model
     * @param {Object|Array} models 模块描述信息
     * @param {String} models.name app中model的唯一标识
     * @param {Object} models.urlParams 发起请求时，默认的url参数对象
     * @param {Object} models.formParams 发起请求时，默认的form参数对象
     * @param {Boolean|Integer} models.cache 指定当前请求缓存多长时间,为true默认20分钟，可传入整数表示缓存多少毫秒
     * @param {Array} models.cleans 请求成功后，清除其它缓存的name数组
     * @param {Function|Object} models.key 指定cache后，如果根据name,formParams,urlParams无法生成唯一的缓存key时，可额外指定的key
     * @param {Function} models.before model在开始请求前的回调
     * @param {Function} models.after model在结束请求，并且成功后回调
     */
    registerModels: function(models) {
        /*
                name:'',
                urlParams:{},
                formParams:{},
                after:function(m){

                }
             */
        var me = this;
        var metas = me.$mMetas;
        if (!IsArray(models)) {
            models = [models];
        }
        for (var i = 0, model, name, cache; i < models.length; i++) {
            model = models[i];
            if (model) {
                name = model.name;
                if (!name) {
                    TError('miss name');
                } else if (metas[name]) {
                    TError('already exist:' + name);
                }
                cache = ProcessCache(model);
                if (cache) {
                    model.cache = cache;
                }
                metas[name] = model;
            }
        }
    },
    /**
     * 注册常用方法，或以把经常几个同时请求的model封装成一个方法以便快捷调用
     * @param {Object} methods 方法对象
     */
    registerMethods: function(methods) {
        Mix(this, methods);
    },
    /**
     * 调用当前Manager注册的多个方法
     * @param {Array} args 要调用的方法列表，形如：[{name:'x',params:['o']},{name:'y',params:['z']}]
     * @param {Function} done 成功时的回调，传入参数跟args数组中对应的成功方法的值
     * @param {Function} error 失败回调，参数同上
     * @return {Object} 返回一个带abort方法的对象，用于取消这些方法的调用
     * @example
     * var MM=Manager.create(Model);
     * MM.registerMethods({
     *     methodA:function(args,done,error){
     *
     *     },
     *     methodB:function(args,done,error){
     *
     *     }
     * });
     *
     * //...
     * //使用时：
     *
     * MM.callMethods([
     *     {name:'methodA',params:['a']},
     *     {name:'methodB',params:['b']}
     * ],function(f1Result,f2Result){
     *
     * },function(msg){
     *     alert(msg)
     * })
     */
    /*callMethods:function(args,done,error){
            var me=this,
                doneArgs=[],
                errorMsg='',
                total=args.length,
                exec= 0,
                aborted,
                doneCheck=function(args,idx,isFail){
                    if(aborted)return;
                    exec++;
                    if(isFail){
                        errorMsg=args;
                    }else{
                         doneArgs[idx]=args;
                    }
                    if(total<=exec){
                        if(!errorMsg){
                            if(S.isFunction(done)){
                                done.apply(done,doneArgs);
                            }
                        }else{
                            if(S.isFunction(error)){
                                error(errorMsg);
                            }
                        }
                    }
                },
                check=function(idx,isSucc){
                    return function(args){
                        doneCheck(args,idx,!isSucc);
                    };
                };
            for(var i=0,one;i<args.length;i++){
                one=args[i];
                var fn;
                if(S.isFunction(one.name)){
                    fn=one.name;
                }else{
                    fn=me[one.name];
                }
                if(fn){
                    if(!one.params)one.params=[];
                    if(!S.isArray(one.params))one.params=[one.params];

                    one.params.push(check(i,1),check(i));
                    fn.apply(me,one.params);
                }else{
                    doneCheck('unfound:'+one.name,i,1);
                }
            }
            return {
                abort:function(){
                    aborted=1;
                }
            }
        },*/
    /**
     * 创建model对象
     * @param {Object} modelAttrs           model描述信息对象
     * @return {Model}
     */
    create: function(modelAttrs) {
        var me = this;
        //modelAttrs = ProcessModelAttrs(modelAttrs);

        var meta = me.getMeta(modelAttrs);
        var cache = ProcessCache(modelAttrs) || meta.cache;
        var entity = new me.$mClz();
        entity.set(meta);
        entity.$mm = {
            name: meta.name,
            after: meta.after,
            cls: meta.cleans,
            key: cache && DefaultCacheKey(meta, modelAttrs)
        };

        if (modelAttrs.name) {
            entity.set(modelAttrs);
        }

        //默认设置的
        entity.setUrlParams(meta[UrlParams]);
        entity.setFormParams(meta[FormParams]);

        //临时传递的
        entity.setUrlParams(modelAttrs[UrlParams]);
        entity.setFormParams(modelAttrs[FormParams]);
        var before = meta.before;
        if (before) {
            SafeExec(before, entity);
        }
        me.fire('start', {
            model: entity
        });
        return entity;
    },
    /**
     * 获取model注册时的元信息
     * @param  {String|Object} modelAttrs 名称
     * @return {Object}
     * @throws {Error} If unfound:name
     */
    getMeta: function(modelAttrs) {
        var me = this;
        var metas = me.$mMetas;
        var name = modelAttrs.name || modelAttrs;
        var meta = metas[name];
        if (!meta) {
            TError('Unfound:' + name);
        }
        return meta;
    },
    /**
     * 获取model对象，优先从缓存中获取
     * @param {Object} modelAttrs           model描述信息对象
     * @param {Boolean} createNew 是否是创建新的Model对象，如果否，则尝试从缓存中获取
     * @return {Object}
     */
    getModel: function(modelAttrs, createNew) {
        var me = this;
        var entity;
        var needUpdate;
        if (!createNew) {
            entity = me.getCached(modelAttrs);
        }

        if (!entity) {
            needUpdate = 1;
            entity = me.create(modelAttrs);
        }
        return {
            entity: entity,
            update: needUpdate
        };
    },
    /**
     * 创建Request对象
     * @param {View} view 传递View对象，托管Request
     * @param {String} [key] 托管到view时的资源key，同名key会自动销毁前一个
     * @param {Boolean} [destroyWhenViewCallRender] view的render方法被调用时，是否销毁这个request，默认true
     * @return {Request} 返回Request对象
     */
    createRequest: function(view, key, destroyWhenViewCallRender) {
        return view.manage(key, new Request(this), arguments.length < 3 || destroyWhenViewCallRender);
    },
    /**
     * 根据name清除缓存的models
     * @param  {String|Array} names 字符串或数组
     */
    clearCache: function(names) {
        var me = this;
        var modelsCache = me.$mCache;
        var list = modelsCache.list();
        names = Magix.toMap((names + EMPTY).split(COMMA));
        for (var i = 0; i < list.length; i++) {
            var one = list[i];
            var m = one.v;
            var mm = m && m.$mm;
            if (mm) {
                if (Has(names, mm.name)) {
                    modelsCache.del(mm.key);
                }
            }
        }
    },
    /**
     * 从缓存中获取model对象
     * @param  {Object} modelAttrs
     * @return {Model}
     */
    getCached: function(modelAttrs) {
        var me = this;
        var modelsCache = me.$mCache;
        var entity;
        var cacheKey;
        var meta = me.getMeta(modelAttrs);
        var cache = ProcessCache(modelAttrs) || meta.cache;

        if (cache) {
            cacheKey = DefaultCacheKey(meta, modelAttrs);
        }

        if (cacheKey) {
            var requestCacheKeys = me.$mReqs;
            var info = requestCacheKeys[cacheKey];
            if (info) { //处于请求队列中的
                entity = info.e;
            } else { //缓存
                entity = modelsCache.get(cacheKey);
                if (entity && cache > 0 && Now() - entity.$mm.time > cache) {
                    modelsCache.del(cacheKey);
                    entity = 0;
                }
            }
        }
        return entity;
    }
});

/**
 * 创建完成Model对象后触发
 * @name Manager#start
 * @event
 * @param {Object} e
 * @param {Model} e.model model对象
 */

/**
 * Model对象请求成功后触发
 * @name Manager#done
 * @event
 * @param {Object} e
 * @param {Model} e.model model对象
 */

/**
 * Model对象完成请求并调用完相关的回调才触发
 * @name Manager#finish
 * @event
 * @param {Object} e
 * @param {String} e.msg 如果请求失败，则为错误描述信息
 * @param {Model} e.model model对象
 */

/**
 * Model对象请求失败后触发
 * @name Manager#fail
 * @event
 * @param {Object} e
 * @param {Model} e.msg 错误描述信息
 * @param {Model} e.model model对象
 */
    return Manager;
}, {
    requires: ["magix/magix", "magix/event"]
});;DOCUMENT.createElement("vframe");})(null,window,document,function(){},"\u001f","",",",KISSY);