/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.2
 **/
define('magix', ['jquery', 'brix/event'], function($, BXEvent) {
    var G_IsArray = $.isArray;
    var G_IsFunction = $.isFunction;
    var G_IsString = function(o) {
        return $.type(o) == 'string';
    };
    var G_IsObject = function(o) {
        return $.type(o) == 'object';
    };
    Inc('../tmpl/magix');
    var G_T = function() {};
    var G_Extend = function(ctor, base, props, statics) {
        var bProto = base.prototype;
        bProto.constructor = base;
        G_T.prototype = bProto;
        var cProto = new G_T();
        Mix(cProto, props);
        Mix(ctor, statics);
        cProto.constructor = ctor;
        ctor.prototype = cProto;
        return ctor;
    };
    var G_Require = function(name, fn) {
        if (name) {
            if (!G_IsArray(name)) {
                name = [name];
            }
            require(name, fn);
        } else if (fn) {
            fn();
        }
    };
    Inc('../tmpl/event');
    Inc('../tmpl/router');
    Router.bind = function(useState) {
        var initialURL = location.href;
        if (useState) {
            $(window).on('popstate', function(e) {
                var equal = location.href == initialURL;
                if (!Router.did && equal) return;
                Router.did = 1;
                console.log('push?', e.type, e.state);
                Router.route();
            });
        } else {
            $(window).on('hashchange', Router.route);
        }
    };
    Inc('../tmpl/vom');
    Inc('../tmpl/vframe');
    Inc('../tmpl/view');
    var Paths = {};
    var Suffix = '?t=' + Math.random();

    var bxEvent = BXEvent('mx-');
    var Tmpls = {}, Locker = {};
    VProto.delegateEvents = function(node) {
        bxEvent.delegate($(node), this);
    };
    VProto.undelegateEvents = function(node) {
        bxEvent.undelegate($(node), this);
    };
    VProto.fetchTmpl = function(path, fn) {
        var me = this;
        var hasTemplate = 'tmpl' in me;
        if (!hasTemplate) {
            if (Has(Tmpls, path)) {
                fn(Tmpls[path]);
            } else {
                var idx = path.indexOf('/');
                var name = path.substring(0, idx);
                if (!Paths[name]) {
                    Paths[name] = require.s.contexts._.config.paths[name];
                }
                var file = Paths[name] + path.substring(idx + 1) + '.html';
                var l = Locker[file];
                var onload = function(tmpl) {
                    fn(Tmpls[path] = tmpl);
                };
                if (l) {
                    l.push(onload);
                } else {
                    l = Locker[file] = [onload];
                    $.ajax({
                        url: file + Suffix,
                        success: function(x) {
                            ToTry(l, x);
                            delete Locker[file];
                        },
                        error: function(e, m) {
                            ToTry(l, m);
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
        if (G_IsFunction(statics)) {
            ctor = statics;
            statics = null;
        }
        var BaseView = function(a) {
            me.call(this, a);
            if (ctor) {
                ctor.call(this, a);
            }
        };
        BaseView.extend = me.extend;
        return G_Extend(BaseView, me, props, statics);
    };

    Inc('../tmpl/model');

    Model.extend = function(props, statics, ctor) {
        var me = this;
        var BaseModel = function() {
            me.call(this);
            if (ctor) {
                ctor.call(this);
            }
        };
        return G_Extend(BaseModel, me, props, statics);
    };

    Inc('../tmpl/manager');
    return Magix;
});