/*
    author:xinglie.lkf@taobao.com
 */
KISSY.add('exts/fx', function(S, Magix) {
    var Timer = function(interval) {
        interval = interval | 0 || 13;
        var me = this;
        if (!Timer[interval]) {
            me.list = [];
            me.interval = interval;
            me.task = function() {
                for (var i = 0; i < me.list.length; i++) {
                    Magix.tryCall(me.list[i], [], me);
                }
            };
            Timer[interval] = me;
        }
        return Timer[interval];
    };
    Timer.prototype = {
        constructor: Timer,
        on: function(callback) {
            var me = this;
            me.list.push(callback);
            if (!me.$timer) {
                console.log(me.task, me.interval);
                me.$timer = setInterval(me.task, me.interval);
            }
        },
        off: function(callback) {
            var me = this;
            if (callback) {
                for (var j = me.list.length - 1; j > -1; j--) {
                    if (me.list[j] === callback) {
                        me.list.splice(j, 1);
                        break;
                    }
                }
            } else {
                me.list.length = 0;
            }
            if (!me.list.length) {
                console.log('stop');
                clearInterval(me.$timer);
                delete me.$timer;
            }
        }
    };
    var Alg = function(x) {
        return x;
    };
    var FX = function(alg, interval) {
        var me = this;
        me.init(alg, interval);
    };
    FX.prototype = {
        constructor: FX,
        init: function(interval, alg) {
            var me = this;
            if (!me.alg || alg) {
                alg = S.isFunction(alg) ? alg : Alg;
                me.alg = function(from, to) {
                    return (from + (to - from) * alg(me.etime / me.duration)).toFixed(3);
                };
            }
            if (!me.timer) {
                me.timer = new Timer(interval);
            }
        },
        run: function(duration, callback, callbackParams, alg) {
            var me = this;
            if (!me.list) me.list = [];
            me.list.push([duration, callback, alg, callbackParams]);
            if (!me.$task) {
                me.task();
            }
        },
        task: function() {
            var me = this;
            var temp;
            me.$temp = temp = me.list && me.list.shift();
            if (temp) {
                console.log(temp);
                me.init(temp[2]); //只改变算法
                me.cb = temp[1]; //callback
                me.duration = temp[0] || 1000;
                me.stime = S.now();
                if (!me.$task) {
                    me.timer.on(me.$task = function(flag) {
                        me.etime = S.now() - me.stime;
                        if (me.etime > me.duration) {
                            flag = me.etime = me.duration;
                        }
                        try {
                            me.cb(me.alg, temp[3]);
                        } catch (e) {
                            flag = e;
                        }
                        if (flag) {
                            me.task();
                        }
                    });
                }
            } else {
                me.stop();
            }
        },
        stop: function() {
            var me = this;
            if (me.$task && me.timer) {
                me.timer.off(me.$task);
                delete me.$task;
            }
        },
        destroy: function() {
            this.stop();
        }
    };
    return FX;
}, {
    requires: ['magix/magix']
});