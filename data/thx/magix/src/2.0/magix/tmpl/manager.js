var IsArray = G_IsArray;
var IsFunction = G_IsFunction;

var FetchFlags_ONE = 1;
var FetchFlags_ORDER = 2;
var FetchFlags_ALL = 4;
var FormParams = 'formParams';
var UrlParams = 'urlParams';
var SerKeys = [FormParams, UrlParams];
var Now = Date.now || function() {
        return +new Date();
    };
var WJSON = window.JSON;
var DefaultCacheTime = 20 * 60 * 1000;

//使用JSON.stringify生成唯一的缓存key，当浏览器不支持JSON时，不再缓存
var Ser = function(o, f, refArr, a) {
    if (f) { //一定要先判断
        if (IsFunction(o)) refArr.push(Ser(ToTry(o)));
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
    return arr.join('\u001a');
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
    me.$mCache = Magix.Cache(cacheMax, cacheBuffer);
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
    //console.log('CacheDone', arguments);
    var cacheKey = ops.b;
    var modelsCacheKeys = ops.a;
    var cached = modelsCacheKeys[cacheKey];
    if (cached) {
        var fns = cached.q;
        delete modelsCacheKeys[cacheKey];
        console.log(fns, err);
        ToTry(fns, err, cached.e);
    }
};
var DoneFn = function(idx, ops, err, ost) {
    //console.log(this, arguments);
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
    //console.log('doneFn', arguments);

    ops.b++; //exec count
    //console.log(model.id, reqs[model.id]);
    delete reqs[model.id];
    //console.log(reqs[model.id]);
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
                ToTry(after, model);
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
                doneArgs[idx + 1] = ToTry(m, [currentError ? errorArgs : null, model, errorArgs], request);
            }
        } else if (flag == FetchFlags_ORDER) {
            //var m=doneIsArray?done[idx]:done;
            orderlyArr[idx] = {
                m: model,
                e: currentError,
                s: err
            };
            //console.log(S.clone(orderlyArr),idx);
            for (var i = orderlyArr.i || 0, t, d; t = orderlyArr[i]; i++) {
                d = doneIsArray ? done[i] : done;
                if (t.e) {
                    errorArgs.msg = t.s;
                    errorArgs[i] = t.s;
                }
                doneArgs[i + 1] = ToTry(d, [t.e ? errorArgs : null, t.m, errorArgs].concat(doneArgs), request);
            }
            orderlyArr.i = i;
        }
        if (ops.b == ops.h) { //ops.h total count
            if (!ops.e) {
                errorArgs = null;
            }
            doneArgs[0] = errorArgs;
            if (flag == FetchFlags_ALL) {
                doneArr[0] = errorArgs;
                doneArgs[1] = ToTry(done, doneArr, request);
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
        #mm_fetchall_1#
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
        #mm_fetchall_2#
        //使用
        #mm_fetchall_3#
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
     *     console.log(e,m);
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
                    result = ToTry(one, preArgs, me);
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
        console.log(me.id, 'stop');
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
            ToTry(before, entity);
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

Magix.Manager = Manager;