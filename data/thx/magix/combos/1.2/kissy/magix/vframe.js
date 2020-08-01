/**
 * @fileOverview Vframe类
 * @author 行列
 * @version 1.2
 */
KISSY.add('magix/vframe', function(S, Magix, Event, BaseView) {
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
    return typeof id == StrObject ? id : document.getElementById(id);
};
var GetByTagName = function(id, node, arr) {
    node = GetById(id);
    if (node) {
        arr = UseQSA ? document[QSA]('#' + IdIt(node) + Selector) : node.getElementsByTagName(TagName);
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
        UseQSA = TagNameChanged && document[QSA];
        Selector = ' ' + TagName + '[' + MxVframe + '=true]';
        ReadMxVframe = TagNameChanged && !UseQSA;

        var body = document.body;
        SupportContains = body.contains;

        RefLoc = refLoc;
        RefChged = refChged;
        RefVOM = owner;

        var rootId = MxConfig.rootId;
        var e = GetById(rootId);
        if (!e) {
            e = document.createElement(TagName);
            e.id = rootId;
            body.appendChild(e);
            e = null;
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
    if (vframe.viewInited && view && view.sign > 0) { //存在view时才进行广播，对于加载中的可在加载完成后通过调用view.location拿到对应的window.location.href对象，对于销毁的也不需要广播

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