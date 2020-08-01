(function(window) {
    var vendor = window.vendor,
        slice = Array.prototype.slice,
        userAgent = window.navigator.userAgent,
        isAndroid = /Android/i.test(userAgent),
        isXiaoMi = /MI\s\d/i.test(userAgent);

    var adapter = {
        createOrientationChangeProxy: function(fn, scope) {
            if (typeof scope === 'undefined') {
                scope = fn;
            }
            return function() {
                clearTimeout(scope.orientationChangedTimer);
                var args = slice.call(arguments, 0),

                    // 对Android横竖屏抓换时使用延迟，在横竖屏转换时，屏幕高宽并不能立即生效
                    // 有的Android少于400ms高宽就能生效，有的就会超过400ms
                    // 小米自带浏览器延迟尤其厉害，原因未知
                    delay = isAndroid ? (isXiaoMi ? 1000 : 400) : 50;

                scope.orientationChangedTimer = setTimeout(function() {
                    var ori = window.orientation;
                    if (ori != scope.lastOrientation) {
                        fn.apply(scope, args);
                    }
                    scope.lastOrientation = ori;
                }, delay);
            };
        },

        listenTransition: function(target, duration, callbackFn) {
            var me = this,
                clear = function() {
                    if (target.transitionTimer) clearTimeout(target.transitionTimer);
                    target.transitionTimer = null;
                    target.removeEventListener(vendor.transitionEndEvent, handler, false);
                },
                handler = function() {
                    clear();
                    if (callbackFn) callbackFn.call(me);
                };
            clear();
            target.addEventListener(vendor.transitionEndEvent, handler, false);
            target.transitionTimer = setTimeout(handler, duration + 100);
        },

        slideAnimation: function(activeEl, toEl, rightward, width, duration, callbackFn) {
            if (activeEl) {
                activeEl.style[vendor.transition] = vendor.cssPrefix + 'transform ' + duration + 'ms';
            }
            toEl.style[vendor.transition] = vendor.cssPrefix + 'transform ' + duration + 'ms';
            setTimeout(function() {
                adapter.listenTransition(toEl, duration, callbackFn);
                if (activeEl) {
                    activeEl.style[vendor.transform] = 'translate3d(' + (rightward ? width : -width) + 'px,0,0)';
                }
                toEl.style[vendor.transform] = 'translate3d(0,0,0)';
            }, isAndroid ? 50 : 0);
        }
    };

    window.adapter = adapter;

})(window);