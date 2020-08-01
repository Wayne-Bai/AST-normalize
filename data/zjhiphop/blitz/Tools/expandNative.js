(function($) {'use strict'
    var f = Function.prototype;
    var oo = Object.prototype;
    /*
     *used to creat a new object
     */
    oo.create = Object.create ||
    function(o) {
        var f = function() {
        };
        f.prototype = (o.prototype || o || {});
        return new f();
    };


    oo.isArray = Array.isArray ||
    function() {
        return ~Object.constructor.toString().indexOf("Array");
    }

    /**
     *add compare for object
     */
    oo.compare = Object.compare ||
    function(o) {
        switch(typeof o) {
            case 'string':
                return this === o;
            case 'number':
                if(o === o)
                    return this === o;
                break;
            case 'boolean':
                return this & o;
            case 'object':
                if(this === o) {
                    return true;
                }
                if(this === null || o === null) {
                    return false;
                }
                var _l1 = 0;
                var _l2 = 0;
                for(var i in this) {
                    _l1++;
                }
                for(var i in o) {
                    _l2++;
                }
                if(_l1 !== _l2) {
                    return false;
                }
                if(this.constructor === o.constructor) {
                    for(var i in this) {
                        if( typeof (this[i]) === "object") {
                            if(!arguments.callee(this[i], o[i]))
                                return false;
                        }
                        else
                        if(this[i] !== o[i]) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            default:
                return;
        }
    }

    /*
     *decration mode
     *eg: f1.prototype.opa=fn2.prototype.add
     *    f1.opa(1) is equivalent to fns.add(1)
     */
    f.partial = function() {
        var fn = this, args = $ ? $.makeArray(arguments) : [].slice.call(arguments);
        //if jquery is used,then will use jquery lib at first
        return function() {
            return fn.apply(this, args.concat(arguments));
        };
    };
    /*
     *function chained
     *eg: function a(){}
     *
     */
    f.method = function(name, func) {
        this[name] = func;
        return this;
    }
    Math.guid = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    };
})(jQuery)