/**
 * @fileOverview Magix全局对象
 * @author 行列<xinglie.lkf@taobao.com>
 * @version 1.2
 **/
define('magix/magix', function(require) {
    var $ = require('jquery');
    var Include = function(path, mxext) {
        var mPath = seajs.data.paths[mxext ? 'mxext' : 'magix'];
        var url = mPath + path + ".js?r=" + Math.random() + '.js';
        var xhr = window.ActiveXObject || window.XMLHttpRequest;
        var r = new xhr('Microsoft.XMLHTTP');
        r.open('GET', url, false);
        r.send(null);
        return r.responseText;
    };
    eval(Include('../tmpl/magix'));
    var T = function() {};
    return Mix(Magix, {
        include: Include,
        use: function(name, fn) {
            if (name) {
                seajs.use(name, fn);
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
        /* isRegExp: function(r) {
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