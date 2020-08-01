/*
    author: xinglie.lkf@taobao.com
 */
KISSY.add('exts/xcom', function() {
    var XCOMS = {};
    //window.$XCOMS = XCOMS;
    return {
        /**
         * 获取所有组件
         * @return {[type]}
         */
        all: function() {
            return XCOMS;
        },
        /**
         * 根据id获取组件
         * @param  {String} id 组件id
         * @return {XCOM}
         */
        get: function(id) {
            return XCOMS[id];
        },
        /**
         * 添加组件
         * @param {XCOM} xcom 组件对象
         */
        add: function(xcom) {
            var id = xcom.id;
            if (XCOMS[id]) {
                throw new Error('already exist:' + id);
            }
            XCOMS[id] = xcom;
            return xcom;
        },
        /**
         * 删除组件
         * @param  {String} id 组件id
         */
        remove: function(id) {
            delete XCOMS[id];
        }
    };
});

KISSY.add('exts/xevent', function(S, XCOM, Event) {
    var RootEvents = {};
    var XEvtSplit = String.fromCharCode(26);

    var AddEvent = 'addEventListener';
    var RemoveEvent = 'removeEventListener';
    var RootNode = document;
    var W3C = RootNode[AddEvent];

    var DependLibEvents = {
        $root: document,
        $host: window
    };
    var ParentNode = 'parentNode';
    var XIgnore = 'x-ei';
    var XOwner = 'x-owner';
    var TypesRegCache = {};
    var IdCounter = 1 << 16;
    var On = 'on';
    var Comma = ',';
    var IdIt = function(dom) {
        return dom.id || (dom.id = 'x-e-' + (IdCounter--));
    };
    var GetSetAttribute = function(dom, attrKey, attrVal) {
        if (attrVal) {
            dom.setAttribute(attrKey, attrVal);
        } else {
            attrVal = dom.getAttribute(attrKey);
        }
        return attrVal;
    };
    var PreventDefault = function() {
        this.returnValue = false;
    };
    var StopPropagation = function() {
        this.cancelBubble = true;
    };
    var Unbubbles = {
        change: 1,
        submit: 1,
        focusin: 1,
        focusout: 1,
        mouseenter: 2,
        mouseleave: 2,
        mousewheel: 1
    };
    return {
        /**
         * 处理事件
         * @param  {Event} e 事件对象
         */
        process: function(e) {
            e = e || window.event;
            if (e && !e[On]) {
                var target = e.target || e.srcElement || RootNode; //原生事件对象Cordova没有target对象
                e[On] = 1;
                //var cTarget = e.currentTarget; //只处理类库(比如KISSY)处理后的currentTarget
                //if (cTarget && cTarget != RootNode) target = cTarget; //类库处理后代理事件的currentTarget并不是根节点
                while (target && target.nodeType != 1) {
                    target = target[ParentNode];
                }
                var current = target;
                var eventType = e.type;
                var eventReg = TypesRegCache[eventType] || (TypesRegCache[eventType] = new RegExp(Comma + eventType + '(?:,|$)'));
                //console.log(current);
                //if (!eventReg.test(GetSetAttribute(target, XIgnore))) {
                var type = 'x-' + eventType;
                var info;
                var ignore;
                var arr = [];

                while (current && current.nodeType == 1) { //找事件附近有mx-[a-z]+事件的DOM节点
                    info = GetSetAttribute(current, type);
                    ignore = GetSetAttribute(current, XIgnore); //current.getAttribute(XIgnore);
                    if (info || eventReg.test(ignore)) {
                        break;
                    } else {
                        arr.push(current);
                        current = current[ParentNode];
                    }
                }
                if (info) { //有事件
                    //找处理事件的vframe
                    var vId;
                    var ts = info.split(XEvtSplit);
                    if (ts.length > 1) {
                        vId = ts[0];
                        info = ts.pop();
                    }
                    vId = vId || GetSetAttribute(current, XOwner);
                    if (!vId) { //如果没有则找最近的vframe
                        var begin = current;
                        var vfs = XCOM.all();
                        while (begin) {
                            if (vfs[begin.id]) {
                                GetSetAttribute(current, XOwner, vId = begin.id);
                                break;
                            }
                            begin = begin[ParentNode];
                        }
                    }
                    if (vId) { //有处理的vframe,派发事件，让对应的vframe进行处理
                        var xcom = XCOM.get(vId);
                        if (xcom) {
                            if (!W3C) {
                                e.preventDefault = PreventDefault;
                                e.stopPropagation = StopPropagation;
                            }
                            xcom.pEvt({
                                info: info,
                                se: e,
                                st: eventType,
                                tId: IdIt(target),
                                cId: IdIt(current)
                            });
                        }
                    } else {
                        throw Error('bad:' + info);
                    }
                } else {
                    var node;
                    while (arr.length) {
                        node = arr.shift();
                        ignore = GetSetAttribute(node, XIgnore) || On;
                        if (!eventReg.test(ignore)) {
                            ignore = ignore + Comma + eventType;
                            GetSetAttribute(node, XIgnore, ignore);
                        }
                    }
                    node = null;
                }
                current = target = null;
            }
        },
        /**
         * 激活或注销事件
         * @param  {String} type 事件类型
         * @param  {Boolean} remove 是否移除
         */
        act: function(type, remove) {
            var me = this;
            var counter = RootEvents[type] || 0;
            var step = counter > 0 ? 1 : 0;
            var fn = me.process;
            counter += remove ? -step : step;
            if (!counter) {
                var lib = Unbubbles[type];
                if (lib) {
                    if (lib == 1) {
                        lib = remove ? 'detach' : 'on';
                        Event[lib](RootNode, type, fn);
                    } else {
                        lib = (remove ? 'un' : '') + 'delegate';
                        Event[lib](RootNode, type, '[x-' + type + ']', fn);
                    }
                } else if (W3C) { //chrome 模拟touch事件时，需要使用addEventListener方式添加，不能使用node.onx的形式
                    RootNode[remove ? RemoveEvent : AddEvent](type, fn, false);
                } else {
                    RootNode[On + type] = remove ? null : fn;
                }
                if (!remove) {
                    counter = 1;
                }
            }
            RootEvents[type] = counter;
        },
        /**
         * 特殊事件
         * @param  {Object} info 事件信息
         * @param  {Boolean} remove 是否移除
         * @param  {Object} scope 处理函数内的this指向
         */
        special: function(info, remove, scope) {
            var lib = DependLibEvents[info.name];
            if (lib) {
                Event[remove ? 'detach' : 'on'](lib, info.type, info.fn, scope);
            }
        }
    };
}, {
    requires: ['exts/xcom', 'event']
});

KISSY.add('exts/xbase', function(S, XCOM, XEvent, Magix, MxEvent) {
    var IdItCounter = 0;
    var QSA = 'querySelectorAll';
    var D = document;
    var SupportQSA = D[QSA];
    var SupportContains = D.body.contains;
    var WrapKey = '~';
    var EvtInfoReg = /(\w+)(?:<(\w+)>)?(?:\(?{([\s\S]*)}\)?)?/;
    var EvtParamsReg = /(\w+):([^,]+)/g;
    var EvtMethodReg = /([$\w]+)<([\w,]+)>/;
    var Left = '<';
    var Right = '>';
    var XEvt = /\sx-(?!com|owner)[a-z]+\s*=\s*"/g;
    var XEvtSplit = String.fromCharCode(26);
    var EvtInfoCache = Magix.cache(40);
    /**
     * 获取dom节点
     * @param  {String|HTMLElement} id 节点对象或节点id
     * @return {HTMLElement|Null}
     */
    var $ = function(id) {
        return typeof id == 'object' ? id : document.getElementById(id);
    };
    /**
     * 获取节点id，如果无则添加一个
     * @param {HTMLElement} dom dom节点
     */
    var IdIt = function(dom) {
        return dom.id || (dom.id = 'x_com_' + (IdItCounter++));
    };
    /**
     * 获取组件dom列表
     * @param  {String|HTMLElement} zoneId dom节点或domid
     * @return {HTMLCollection}
     */
    var $$ = function(zoneId) {
        var node = $(zoneId);
        var arr;
        if (node) {
            arr = SupportQSA ? D[QSA]('#' + IdIt(node) + ' *[x-com]') : node.getElementsByTagName('*');
        }
        return arr || [];
    };
    /**
     * 节点a是否在节点b里面
     * @param {String|HTMLElement} a a节点
     * @param {String|HTMLElement} b b节点
     * @return {Boolean} r
     */
    var NodeIn = function(a, b, r) {
        a = $(a);
        b = $(b);
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
    /**
     * 把字符串转成JSON
     * @param {String} str 字符串
     * @return {Object} JSON
     */
    var ToJSON = function(str) {
        var o;
        try {
            o = Function('return ' + str)();
        } catch (e) {
            console.log(e);
            o = {};
        }
        return o;
    };
    /**
     * 事件帮助对象
     * @type {Object}
     */
    var WEvent = {
        prevent: function(e) {
            e = e || this.event;
            e.preventDefault();
        },
        stop: function(e) {
            e = e || this.event;
            e.stopPropagation();
        },
        halt: function(e) {
            this.prevent(e);
            this.stop(e);
        }
    };
    /**
     * 预处理组件原型链上的方法
     * @param {XCOM} T 组件类
     */
    var Prepare = function(T) {
        if (!T[WrapKey]) { //只处理一次
            T[WrapKey] = 1;
            var prop = T.prototype;
            var old, temp, name, evts, idx, revts = {}, rsevts = [];
            for (var p in prop) {
                old = prop[p];
                temp = p.match(EvtMethodReg);
                if (temp) {
                    name = temp[1];
                    evts = temp[2];
                    evts = evts.split(',');
                    for (idx = evts.length - 1; idx > -1; idx--) {
                        temp = evts[idx];
                        if (name.charAt(0) == '$') {
                            rsevts.push({
                                name: name,
                                type: temp,
                                fn: old
                            });
                        } else {
                            revts[temp] = 1;
                            prop[name + Left + temp + Right] = old;
                        }
                    }
                }
            }
            prop.evts = revts;
            prop.sevts = rsevts;
        }
    };
    /**
     * 组件类
     * @param {String} id 组件所在的DOM id
     */
    var XBase = function(id) {
        var me = this;
        me.id = id;
        me.children = {};
        me.attrs = {
            useTmpl: 1
        };
        me.signs = {};
        me.nodes = {};
        me.addNode(id);
        XCOM.add(me);
    };
    /**
     * 继承
     * @param  {Object} props 方法
     * @param  {Function} ctor 构造器
     * @param  {Object} statics 静态属性或方法
     * @return {Function}
     */
    XBase.extend = function(props, ctor, statics) {
        var me = this;
        var XTempBase = function() {
            var me = this;
            XTempBase.superclass.constructor.apply(me, arguments);
            if (ctor) {
                ctor.apply(me, arguments);
            }
        };
        XTempBase.extend = me.extend;
        return S.extend(XTempBase, me, props, statics);
    };
    Magix.mix(Magix.mix(XBase.prototype, MxEvent), {
        /**
         * 组件模板
         * @type {String}
         */
        tmpl: '',
        /**
         * 渲染组件
         * @function
         */
        render: Magix.noop,
        /**
         * 设置属性
         * @param {String|Object} key 字符串或对象
         * @param {Object} val 任意值
         */
        set: function(key, val) {
            var me = this;
            var attrs = me.attrs;
            if (S.isObject(key)) {
                for (var p in key) {
                    attrs[p] = key[p];
                }
            } else if (key) {
                attrs[key] = val;
            }
        },
        /**
         * 获取属性
         * @param  {String} key 属性key
         * @param  {Object} defaultValue 当取不到时默认值
         * @return {Object}
         */
        get: function(key, defaultValue) {
            var me = this;
            var attrs = me.attrs;
            var len = arguments.length;
            var value;
            if (len) {
                value = attrs[key];
                if (len == 2 && S.type(value) != S.type(defaultValue)) {
                    value = defaultValue;
                }
            } else {
                value = attrs;
            }
            return value;
        },
        /**
         * 判断节点是否在组件内
         * @param  {String|HTMLElement} node 节点
         * @return {Boolean}
         */
        inside: function(node) {
            var me = this;
            var contained;
            for (var t in me.nodes) {
                contained = NodeIn(node, t);
                if (contained) break;
            }
            if (!contained) {
                var children = me.children;
                for (var p in children) {
                    var xcom = XCOM.get(p);
                    contained = xcom.inside(node);
                    if (contained) break;
                }
            }
            return contained;
        },
        /**
         * 添加节点，用于inside的判断
         * @param {String} id dom节点id
         */
        addNode: function(id) {
            this.nodes[id] = 1;
        },
        /**
         * 移除节点
         * @param  {String} id dom节点id
         */
        removeNode: function(id) {
            delete this.nodes[id];
        },
        /**
         * 添加子组件
         * @param  {String} id 组件id
         */
        addChild: function(id) {
            this.children[id] = 1;
        },
        /**
         * 移除子组件
         * @param  {String} id 组件id
         */
        removeChild: function(id) {
            delete this.children[id];
        },
        /**
         * 创建组件对象
         * @param  {String} id 组件id
         * @param  {String} path 组件路径
         * @param  {Object} attrs 组件属性
         * @param  {Integer} flag 是否做了其它渲染的标识
         * @param  {String} zoneId 渲染在哪个区域下
         */
        create: function(id, path, attrs, flag, zoneId) {
            var me = this,
                entity;
            S.use(path, function(S, T) {
                if (flag == me.signs[zoneId]) {
                    Prepare(T);
                    entity = new T(id);
                    entity.set(attrs);
                    entity.tmpl = entity.wrapXEvt(entity.tmpl);
                    entity.dEvts();
                    entity.render();
                    if (!entity.get('hasTmpl')) {
                        entity.mountZone();
                    }
                    me.addChild(id);
                }
            });
        },
        /**
         * 渲染某个区域
         * @param  {String} [id] 区域id
         */
        mountZone: function(id) {
            var me = this;
            if (!id) id = me.id;
            var xcoms = $$(id);
            var subs = {};
            if (!me.signs[id]) {
                me.signs[id] = 1 << 16;
            }
            me.signs[id]--;
            for (var i = 0, j = xcoms.length; i < j; i++) {
                var xcom = xcoms[i];
                var key = IdIt(xcom);
                if (!subs[key]) {
                    var path = xcom.getAttribute('x-com');
                    var config = xcom.getAttribute('x-config');
                    if (path) {
                        me.create(key, path, ToJSON(config), me.signs[id], id);
                        var subXComs = $$(xcom);
                        for (var u = subXComs.length - 1; u >= 0; u--) {
                            subs[IdIt(subXComs[u])] = 1;
                        }
                    }
                }
            }
        },
        /**
         * 销毁某个区域
         * @param  {String} [id] 区域id
         */
        unmountZone: function(id) {
            var me = this;
            var children = me.children;
            var oustAll;
            if (!id) {
                id = me.id;
                oustAll = 1;
            }
            me.signs[id]--;
            for (var p in children) {
                if (oustAll || NodeIn(p, id)) {
                    var child = XCOM.get(p);
                    child.unmountZone();
                    child.dEvts(1);
                    child.fire('destroy');
                    XCOM.remove(child.id);
                    delete children[p];
                }
            }
        },
        /**
         * 渲染html
         * @param {String} id 区域id
         * @param {String} html html片断
         */
        setHTML: function(id, html) {
            var me = this;
            if (arguments.length == 1) {
                html = id;
                id = me.id;
            }
            me.unmountZone(id);
            $(id).innerHTML = html;
            me.mountZone(id);
        },
        /**
         * 包装x-event事件
         * @param  {String} template 模板片断
         * @return {String}
         */
        wrapXEvt: function(template) {
            return (template + '').replace(XEvt, '$&' + this.id + XEvtSplit);
        },
        /**
         * 代理事件
         * @param  {Boolean} dispose 是否是销毁代理
         */
        dEvts: function(dispose) {
            var me = this;
            for (var p in me.evts) {
                XEvent.act(p, dispose);
            }
            for (var i = 0, j = me.sevts.length; i < j; i++) {
                XEvent.special(me.sevts[i], dispose, me);
            }
        },
        /**
         * 处理事件
         * @param  {XEvent} e 事件对外
         */
        pEvt: function(e) {
            var me = this;
            var info = e.info;
            var domEvent = e.se;

            var m = EvtInfoCache.get(info);
            if (!m) {
                m = info.match(EvtInfoReg);
                m = {
                    n: m[1],
                    f: m[2],
                    i: m[3],
                    p: {}
                };
                if (m.i) {
                    m.i.replace(EvtParamsReg, function(x, a, b) {
                        m.p[a] = b;
                    });
                }
                EvtInfoCache.set(info, m);
            }
            var name = m.n + Left + e.st + Right;
            var fn = me[name];
            if (fn) {
                var tfn = WEvent[m.f];
                if (tfn) {
                    tfn.call(WEvent, domEvent);
                }
                Magix.safeExec(fn, {
                    currentId: e.cId,
                    targetId: e.tId,
                    type: e.st,
                    event: domEvent,
                    halt: WEvent.halt,
                    prevent: WEvent.prevent,
                    stop: WEvent.stop,
                    params: m.p
                }, me);
            }
        }
    });
    return XBase;
}, {
    requires: ['exts/xcom', 'exts/xevent', 'magix/magix', 'magix/event']
});
/*
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="format-detection" content="telephone=no">
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="HandheldFriendly" content="true" />
    <meta http-equiv="x-rim-auto-match" content="none" />
    <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
    <title>Anim Rules</title>
    <link rel="stylesheet" type="text/css" href="http://a.tbcdn.cn/apps/e/brix/1.0/brix-min.css" />
    <link rel="stylesheet" type="text/css" href="apiapp/assets/global.css" />
</head>
<body>
    <div id="magix_vf_root">
        <div x-com="test/dropdown" x-config="{list:[{text:'1'},{text:'2'}]}"></div>
        <div x-com="test/calendar" id="abc"></div>
        <div x-com="test/dialog" x-config="{hasTmpl:false}">
            adfadsfasdf
            <div x-com="test/tip"></div>
        </div>
        <button id="def">show panel</button>
        <div x-com="test/dropanel" x-config="{refNode:'def'}" style="display:none"></div>
    </div>
    <script src="http://g.tbcdn.cn/??kissy/k/1.4.2/seed.js" data-config="{combine:true}"></script>
    <script type="text/javascript" src="../src/exts/xcom.js"></script>
    <script type="text/javascript" src="../dist/1.1/kissy-magix.js"></script>
    <script type="text/javascript">
    KISSY.add('test/dropanel',function(S,XBase){
        return XBase.extend({
            tmpl:'<div style="width:auto;height:300px;position:absolute;background-color:#ccc"><span x-com="test/calendar"></span></div>',
            render:function(){
                this.setHTML(this.tmpl);
                S.one('#'+this.get('refNode')).attr('x-click','toggle').attr('x-owner',this.id);
                this.addNode(this.get('refNode'))
            },
            'toggle<click>':function(){
                console.log(S.guid());
                S.one('#'+this.id).toggle();
            },
            '$root<click>':function(e){
                if(!this.inside(e.target)){
                    S.one('#'+this.id).hide();
                }
            }
        });
    },{
        requires:['exts/xbase','node']
    });
    KISSY.add('test/tip',function(S,XBase,XTemplate){
        return XBase.extend({
            tmpl:'<span x-click="toggle" style="position:relative;">?</span><span class="c" style="display:none;position:absolute;left:0;top:0">some tip</span>',
            'toggle<click>':function(e){
                this.shown=!this.shown;
                S.one('#'+this.id).one('span.c').toggle();
            },
            shown:false,
            '$root<click>':function(e){
                //console.log(this,e.target,this.id);
                if(this.shown){
                    console.log(this,this.inside(e.target));
                    if(!this.inside(e.target)){
                        console.log(this.id);
                        this.shown=false;
                        S.one('#'+this.id).one('span.c').hide();
                    }
                }
            },
            render:function(){
                this.setHTML(this.tmpl);
            }
        });
    },{
        requires:['exts/xbase','xtemplate']
    });
    KISSY.add('test/tip1',function(S,Tip){
        return Tip.extend({
            tmpl:'<span x-click="toggle" style="position:relative;display:inline-block">?</span><span class="c" style="display:none;position:absolute;left:500px;top:0;width:100px;background-color:#aaa">some tip2222222222</span>'
        });
    },{
        requires:['test/tip']
    });
    KISSY.add('test/calendar',function(S,XBase,XTemplate){
        return XBase.extend({
            template2:'<table style="width:400px;"><thead><tr><td x-click="test">1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6<span x-com="test/tip1"></span></td><td>7</td></tr></thead><tbody><tr><td x-click="test">1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6<span x-com="test/tip1"></span></td><td>7</td></tr><tr><td x-click="test">1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6<span x-com="test/tip1"></span></td><td>7</td></tr></tbody></table>',
            render:function(){
                console.log('xxxx');
                this.setHTML(this.template2);
            },
            'test<click>':function(e){
                console.log(e);
            }
        });
    },{
        requires:['exts/xbase']
    });
    KISSY.add('test/dialog',function(S,XBase,XTemplate){
        return XBase.extend({
            hasTmpl:false,
            render:function(){
                //this.setHTML('aaaaaaaaaaaaaa');
            }
        });
    },{
        requires:['exts/xbase']
    });
    KISSY.add('test/dropdown',function(S,XBase,XTemplate){
        return XBase.extend({
            tmpl:'<span x-click="toggle" style="display:inline-block;width:200px;">{{title}}</span><ul style="display:none">{{#each list}}<li x-mouseenter="enter" x-mouseleave="leave" style="width:200px;height:25px;line-height:25px;" x-click="done{key:{{xindex}}}}">{{text}}<span x-com="test/tip">?</span></li>{{/each}}</ul>',
            'toggle<click>':function(e){
                var node=S.one('#'+this.id+' ul');
                node.toggle();
            },
            '$host<resize>':function(e){
                console.log(e);
            },
            '$root<click>':function(e){
                console.log(e);
                var me=this;
                if(!me.inside(e.target)){
                    S.one('#'+this.id+' ul').hide();
                }
            },
            'done<click>':function(e){
                console.log(e);
            },
            'enter<mouseenter>':function(e){
                S.one('#'+e.currentId).css({
                    backgroundColor:'#ccc'
                });
            },
            'leave<mouseleave>':function(e){
                S.one('#'+e.currentId).css({
                    backgroundColor:'#fff'
                });
            },
            render:function(){
                var me=this;
                var list=me.get('list');
                me.setHTML(new XTemplate(me.tmpl).render({
                    list:list,
                    title:'test'
                }))
            }
        },function(){
            var me=this;
            me.on('destroy',function(){
                console.log('destroy');
            });
        });
    },{
        requires:['exts/xbase','xtemplate','node']
    });
    KISSY.use('exts/xbase',function(S,XBase){
        var xbase=new XBase('magix_vf_root');
        xbase.mountZone();
        setTimeout(function(){
            xbase.unmountZone();
            setTimeout(function(){
                xbase.mountZone();
            },3000);
        },3000);
    });
    KISSY.use('test/dialog',function(S,D){
        var div=document.createElement('div');
        div.id=S.guid('dialog');
        document.body.appendChild(div);
        new D(div.id).render();
    });
    </script>
</body>
</html>
 */