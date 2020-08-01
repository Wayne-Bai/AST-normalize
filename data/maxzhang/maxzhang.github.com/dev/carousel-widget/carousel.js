/**
 * 自动切换组件
 *
 * 例子参见：http://maxzhang.github.io/carousel-widget/dev/examples/carousel.html
 *
 */
(function(window) {
    var navigator = window.navigator,
        isAndroid = /Android/i.test(navigator.userAgent),
        msPointerEnabled = navigator.msPointerEnabled,
        TOUCH_EVENTS = {
            start: msPointerEnabled ? 'MSPointerDown' : 'touchstart',
            move: msPointerEnabled ? 'MSPointerMove' : 'touchmove',
            end: msPointerEnabled ? 'MSPointerUp' : 'touchend'
        },
        slice = Array.prototype.slice,
        dummyStyle = document.createElement('div').style,
        vendor = (function() {
            var vendors = 't,webkitT,MozT,msT,OT'.split(','),
                t,
                i = 0,
                l = vendors.length;

            for (; i < l; i++) {
                t = vendors[i] + 'ransform';
                if (t in dummyStyle) {
                    return vendors[i].substr(0, vendors[i].length - 1);
                }
            }

            return false;
        })(),
        cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',
        prefixStyle = function(style) {
            if (vendor === '') return style;
            style = style.charAt(0).toUpperCase() + style.substr(1);
            return vendor + style;
        },
        transform = prefixStyle('transform'),
        transitionDuration = prefixStyle('transitionDuration'),
        transitionEndEvent = (function() {
            if (vendor == 'webkit' || vendor === 'O') {
                return vendor.toLowerCase() + 'TransitionEnd';
            }
            return 'transitionend';
        })(),
        noop = function() {},
        addClass = function(elem, value) {
            var classes, cur, clazz, i;
            classes = (value || '').match(/\S+/g) || [];
            cur = elem.nodeType === 1 && ( elem.className ? (' ' + elem.className + ' ').replace(/[\t\r\n]/g, ' ') : ' ');
            if (cur) {
                i = 0;
                while ((clazz = classes[i++])) {
                    if (cur.indexOf(' ' + clazz + ' ') < 0) {
                        cur += clazz + ' ';
                    }
                }
                elem.className = cur.trim();
            }
        },
        removeClass = function(elem, value) {
            var classes, cur, clazz, i;
            classes = (value || '').match(/\S+/g) || [];
            cur = elem.nodeType === 1 && ( elem.className ? (' ' + elem.className + ' ').replace(/[\t\r\n]/g, ' ') : ' ');
            if (cur) {
                i = 0;
                while ((clazz = classes[i++])) {
                    while (cur.indexOf(' ' + clazz + ' ') >= 0) {
                        cur = cur.replace(' ' + clazz + ' ', ' ');
                    }
                }
                elem.className = cur.trim();
            }
        },
        listenTransition = function(target, duration, callbackFn) {
            var me = this,
                clear = function() {
                    if (target.transitionTimer) clearTimeout(target.transitionTimer);
                    target.transitionTimer = null;
                    target.removeEventListener(transitionEndEvent, handler, false);
                },
                handler = function() {
                    clear();
                    if (callbackFn) callbackFn.call(me);
                };
            clear();
            target.addEventListener(transitionEndEvent, handler, false);
            target.transitionTimer = setTimeout(handler, duration + 100);
        };

    var Carousel = function(config) {
        config = config || {};
        for (var o in config) {
            this[o] = config[o];
        }

        this.el = typeof this.targetSelector === 'string' ? document.querySelector(this.targetSelector) : this.targetSelector;
        if (msPointerEnabled) this.el.style.msTouchAction = 'pan-y';
        this.el.style.position = 'relative';

        this.items = this.itemSelector ? this.el.querySelectorAll(this.itemSelector): this.el.children;
        this.items = slice.call(this.items, 0);

        var width = this.width === 'auto' ? this.el.offsetWidth : this.width;
        var active = this.activeIndex;
        this.items.forEach(function(item, i) {
            item.style.cssText = 'display' + (active == i ? 'block' : 'none') + ';position:relative;top:0px;' + cssVendor + 'transform:translate3d(' + (active == i ? 0 : -width) + 'px,0px,0px);' + cssVendor + 'transition:' + cssVendor + 'transform 0ms;';
        });
        this.setWidth(width);

        if (this.prevSelector) {
            this.prevEl = typeof this.prevSelector === 'string' ? document.querySelector(this.prevSelector) : this.prevSelector;
            this.prevEl.addEventListener('click', this, false);
        }
        if (this.nextSelector) {
            this.nextEl = typeof this.nextSelector === 'string' ? document.querySelector(this.nextSelector) : this.nextSelector;
            this.nextEl.addEventListener('click', this, false);
        }
        if (this.indicatorSelector) {
            this.indicators = typeof this.indicatorSelector === 'string' ? document.querySelectorAll(this.indicatorSelector) : this.indicatorSelector;
            this.indicators = slice.call(this.indicators, 0);
        }

        this.el.addEventListener(TOUCH_EVENTS.start, this, false);

        var activeEl = this.items[this.activeIndex];
        activeEl.style.display = 'block';
        this.to(this.activeIndex, true);

        this.running = false;
        if (this.autoPlay) {
            this.start();
        }
    };

    Carousel.prototype = {
        /**
         * @cfg {String} targetSelector 目标元素选取器，items 默认为 targetSelector 的子元素，可以设置itemSelector，查找指定items子元素
         */

        /**
         * @cfg {String} itemSelector 子元素选取器
         */

        /**
         * @cfg {String} prevSelector 向前按钮选取器
         */

        /**
         * @cfg {String} nextSelector 向后按钮选取器
         */

        /**
         * @cfg {String} indicatorSelector 指示器选取器
         */

        /**
         * @cfg {String} indicatorCls 当前activeIndex指示器样式
         */

        /**
         * @cfg {Number/String} width 组件宽度，默认'auto'
         */
        width: 'auto',

        /**
         * @cfg {Number} activeIndex 初始显示的元素index，默认0
         */
        activeIndex: 0,

        /**
         * @cfg {Boolean} autoPlay true自动切换，默认true
         */
        autoPlay: true,

        /**
         * @cfg {Number} interval 循环滚动间隔时间，单位ms，默认3000
         */
        interval: 3000,

        /**
         * @cfg {Number} duration 动画持续时间，单位ms，默认400
         */
        duration: 400,

        /**
         * @cfg {iScroll} iscroll 关联一个iscroll对象
         * Carousel Widget 为水平方向滚动，如果被嵌套在一个垂直滚动的 iScroll 组件中，会导致触摸滚动 Carousel的水平滚动 与 iScroll的垂直滚动相冲突，
         * 为了解决这个问题，在水平滑动时，禁用iScroll的垂直滚动，水平滑动结束之后，再启用iScroll。
         */

        /**
         * 开始切换之前回调函数，返回值为false时，终止本次slide操作
         */
        beforeSlide: noop,

        /**
         * 切换完成回调函数
         */
        onSlide: noop,

        /**
         * 设置宽度
         * @param width
         */
        setWidth: function(width) {
            this.el.style.width = width + 'px';
            this.items.forEach(function(item) {
                item.style.width = width + 'px';
            });
        },

        // private
        getLastIndex: function() {
            return this.items.length - 1;
        },

        // private
        getContext: function(index) {
            var last = this.getLastIndex(),
                prev,
                next;
            if (typeof index === 'undefined') {
                index = this.activeIndex;
            }
            prev = index - 1;
            next = index + 1;
            if (prev < 0) {
                prev = last;
            }
            if (next > last) {
                next = 0;
            }
            return {
                prev : prev,
                next: next,
                active: index
            };
        },

        /**
         * 开始自动切换
         */
        start: function() {
            if (!this.running) {
                this.running = true;
                this.clear();
                this.run();
            }
        },

        /**
         * 停止自动切换
         */
        stop: function() {
            this.running = false;
            this.clear();
        },

        // private
        clear: function() {
            clearTimeout(this.slideTimer);
            this.slideTimer = null;
        },

        // private
        run: function() {
            var me = this;
            if (!me.slideTimer) {
                me.slideTimer = setInterval(function() {
                    me.to(me.getContext().next);
                }, me.interval);
            }
        },

        /**
         * 切换到上一个
         */
        prev: function() {
            this.to(this.getContext().prev);
        },

        /**
         * 切换到下一个
         */
        next: function() {
            this.to(this.getContext().next);
        },

        /**
         * 切换到index
         * @param {Number} toIndex
         * @param {Boolean} silent 无动画效果
         */
        to: function(toIndex, silent, /* private */ isTouch) {
            var active = this.activeIndex,
                last = this.getLastIndex(),
                slideRight = (toIndex < active && active < last) || (toIndex == last - 1 && active == last) || (toIndex == last && active === 0),
                activeEl, toEl;
            if (!this.sliding) {
                if (toIndex >= 0 && toIndex <= last && toIndex != active && this.beforeSlide(toIndex) !== false) {
                    if (!isTouch) {
                        activeEl = this.items[active];
                        activeEl.style[transform] = 'translate3d(0px,0px,0px)';
                        toEl = this.items[toIndex];
                        toEl.style[transform] = 'translate3d(' + (slideRight ? -activeEl.offsetWidth : activeEl.offsetWidth) + 'px,0px,0px)';
                    }
                    this.slide(toIndex, slideRight, silent);
                } else {
                    this.slide(active, false, silent);
                }
            }
        },

        // private
        slide: function(toIndex, slideRight, silent) {
            var me = this,
                active = me.activeIndex,
                lastActive = active,
                activeEl = me.items[active],
                toEl = me.items[toIndex],
                translateX = (function() {
                    var v = window.getComputedStyle(activeEl)[transform],
                        is3d;
                    if (v) {
                        is3d = /matrix3d/.test(v);
                        v = v.match(is3d ? /matrix3d(.*)/ : /matrix(.*)/);
                        v = v[1].replace(/ /g, '').split(',')[is3d ? 12 : 4];
                        return parseInt(v, 10);
                    }
                    return 0;
                })(),
                offsetWidth = activeEl.offsetWidth,
                baseDuration = me.duration,
                duration, oms = '0ms',
                context,
                activeSlideHandler,
                toSlideHandler,
                clearHandler = function(el, fn) {
                    el.removeEventListener(transitionEndEvent, fn, false);
                };

            me.sliding = true;

            if (active == toIndex) {
                context = me.getContext();
                slideRight = translateX < 0;
                toEl = me.items[slideRight ? context.next : context.prev];
                duration = silent ? 0 : Math.round((Math.abs(translateX) / offsetWidth) * baseDuration);
                activeSlideHandler = function() {
                    clearHandler(activeEl, activeSlideHandler);
                    activeEl.style.position = 'relative';
                    activeEl.style[transitionDuration] = oms;
                };
                toSlideHandler = function() {
                    clearTimeout(me.resetSlideTimeout);
                    delete me.resetSlideTimeout;
                    clearHandler(toEl, toSlideHandler);
                    toEl.style.display = 'none';
                    toEl.style.position = 'relative';
                    toEl.style[transitionDuration] = oms;
                    if (me.indicators && me.indicatorCls) {
                        if (me.indicators[lastActive]) removeClass(me.indicators[lastActive], me.indicatorCls);
                        if (me.indicators[me.activeIndex]) addClass(me.indicators[me.activeIndex], me.indicatorCls);
                    }
                    me.sliding = false;
                    me.onSlide(me.activeIndex);
                };
            } else {
                me.activeIndex = toIndex;
                activeSlideHandler = function() {
                    clearHandler(activeEl, activeSlideHandler);
                    activeEl.style.display = 'none';
                    activeEl.style.position = 'relative';
                    activeEl.style[transitionDuration] = oms;
                };
                toSlideHandler = function() {
                    clearTimeout(me.resetSlideTimeout);
                    delete me.resetSlideTimeout;
                    clearHandler(toEl, toSlideHandler);
                    toEl.style.position = 'relative';
                    toEl.style[transitionDuration] = oms;
                    if (me.indicators && me.indicatorCls) {
                        removeClass(me.indicators[lastActive], me.indicatorCls);
                        addClass(me.indicators[me.activeIndex], me.indicatorCls);
                    }
                    me.sliding = false;
                    me.onSlide(me.activeIndex);
                };
                duration = silent ? 0 : Math.round((offsetWidth - (Math.abs(translateX))) / offsetWidth * baseDuration);
            }

            clearHandler(activeEl, activeSlideHandler);
            clearHandler(toEl, toSlideHandler);
            activeEl.style[transitionDuration] = duration + 'ms';
            activeEl.style.display = 'block';
            toEl.style.position = 'absolute';
            toEl.style[transitionDuration] = duration + 'ms';
            toEl.style.display = 'block';

            setTimeout(function() {
                var startTranslate3d = 'translate3d(0px,0px,0px)', endTranslate3d = 'translate3d(' + (slideRight ? offsetWidth : -offsetWidth) + 'px,0px,0px)';
                if (!silent) {
                    listenTransition(activeEl, duration, activeSlideHandler);
                    listenTransition(toEl, duration, toSlideHandler);
                }
                activeEl.style[transform] = active == toIndex ? startTranslate3d : endTranslate3d;
                toEl.style[transform] = active == toIndex ? endTranslate3d : startTranslate3d;
                if (silent) {
                    activeSlideHandler();
                    toSlideHandler();
                } else {
                    // 防止touch事件与click事件触发的slide动作冲突，导致sliding状态无法被重置
                    me.resetSlideTimeout = setTimeout(function() {
                        activeSlideHandler();
                        toSlideHandler();
                    }, 2000);
                }
            }, isAndroid ? 50 : 0);
        },

        // private
        onPrevClick: function(e) {
            if (e) e.preventDefault();
            this.clear();
            this.prev();
            if (this.autoPlay) this.run();
        },

        // private
        onNextClick: function(e) {
            if (e) e.preventDefault();
            this.clear();
            this.next();
            if (this.autoPlay) this.run();
        },

        // private
        onTouchStart: function(e) {
            var me = this;
            if (me.sliding ||
                me.prevEl && me.prevEl.contains && me.prevEl.contains(e.target) ||
                me.nextEl && me.nextEl.contains && me.nextEl.contains(e.target)) {
                return;
            }

            clearTimeout(me.androidTouchMoveTimeout);
            me.clear();
            if (isAndroid) {
                // 部分andriod机型下，无法触发trouchend事件，导致touch之后轮循播放失败
                me.androidTouchMoveTimeout = setTimeout(function() {
                    me.resetStatus();
                }, 3000);
            }

            me.el.removeEventListener(TOUCH_EVENTS.move, me, false);
            me.el.removeEventListener(TOUCH_EVENTS.end, me, false);
            me.el.addEventListener(TOUCH_EVENTS.move, me, false);
            me.el.addEventListener(TOUCH_EVENTS.end, me, false);
            delete me.horizontal;

            var clientX = msPointerEnabled ? e.clientX : e.touches[0].clientX,
                clientY = msPointerEnabled ? e.clientY : e.touches[0].clientY,
                context = me.getContext(),
                activeEl = me.items[context.active],
                width = activeEl.offsetWidth,
                setShow = function(el, left, isActive) {
                    el.style.position = isActive ? 'relative' : 'absolute';
                    el.style[transform] = 'translate3d(' + left + 'px,0px,0px)';
                    el.style.display = 'block';
                    el.style[transitionDuration] = '0ms';
                };

            setShow(me.items[context.prev], -width);
            setShow(me.items[context.next], width);
            setShow(activeEl, 0, true);

            me.touchCoords = {};
            me.touchCoords.startX = clientX;
            me.touchCoords.startY = clientY;
            me.touchCoords.timeStamp = e.timeStamp;
        },

        // private
        onTouchMove: function(e) {
            var me = this;

            clearTimeout(me.touchMoveTimeout);
            if (msPointerEnabled) {
                // IE10 for Windows Phone 8 的 pointerevent， 触发 MSPointerDown 之后，
                // 如果触控移动轨迹不符合 -ms-touch-action 规则，则不会触发 MSPointerUp 事件。
                me.touchMoveTimeout = setTimeout(function() {
                    me.resetStatus();
                }, 3000);
            }

            if (!me.touchCoords || me.sliding) {
                return;
            }

            me.touchCoords.stopX = msPointerEnabled ? e.clientX : e.touches[0].clientX;
            me.touchCoords.stopY = msPointerEnabled ? e.clientY : e.touches[0].clientY;

            var offsetX = me.touchCoords.startX - me.touchCoords.stopX,
                absX = Math.abs(offsetX),
                absY = Math.abs(me.touchCoords.startY - me.touchCoords.stopY);

            if (typeof me.horizontal !== 'undefined') {
                if (offsetX !== 0) {
                    e.preventDefault();
                }
            } else {
                if (absX > absY) {
                    me.horizontal = true;
                    if (offsetX !== 0) {
                        e.preventDefault();
                    }
                    if (me.iscroll && me.iscroll.enabled) {
                        me.iscroll.disable();
                    }
                    clearTimeout(me.androidTouchMoveTimeout);
                } else {
                    delete me.touchCoords;
                    me.horizontal = false;
                    return;
                }
            }

            var context = me.getContext(),
                activeEl = me.items[context.active],
                prevEl = me.items[context.prev],
                nextEl = me.items[context.next],
                width = activeEl.offsetWidth;

            if (absX < width) {
                prevEl.style[transform] = 'translate3d(' + (-width - offsetX) + 'px,0px,0px)';
                activeEl.style[transform] = 'translate3d(' + -offsetX + 'px,0px,0px)';
                nextEl.style[transform] = 'translate3d(' + (width - offsetX) + 'px,0px,0px)';
            }
        },

        // private
        onTouchEnd: function(e) {
            clearTimeout(this.androidTouchMoveTimeout);
            clearTimeout(this.touchMoveTimeout);
            this.el.removeEventListener(TOUCH_EVENTS.move, this, false);
            this.el.removeEventListener(TOUCH_EVENTS.end, this, false);

            if (this.touchCoords && !this.sliding) {
                var context = this.getContext(),
                    activeEl = this.items[context.active],
                    prevEl = this.items[context.prev],
                    nextEl = this.items[context.next],
                    width = activeEl.offsetWidth,
                    absX = Math.abs(this.touchCoords.startX - this.touchCoords.stopX),
                    transIndex,
                    setHide = function(el) {
                        el.style.display = 'none';
                        el.style.position = 'relative';
                        el.style[transform] = 'translate3d(' + -width + 'px,0px,0px)';
                        el.style[transitionDuration] = '0ms';
                    };

                if (!isNaN(absX) && absX !== 0) {
                    if (absX > width) {
                        absX = width;
                    }
                    if (absX >= 80 || (e.timeStamp - this.touchCoords.timeStamp < 200)) {
                        if (this.touchCoords.startX > this.touchCoords.stopX) {
                            transIndex = context.next;
                        } else {
                            transIndex = context.prev;
                        }
                    } else {
                        transIndex = context.active;
                    }

                    setHide(this.touchCoords.startX > this.touchCoords.stopX ? prevEl : nextEl);
                    this.to(transIndex, false, true);
                    delete this.touchCoords;
                }
            }

            this.resetStatus();
        },

        resetStatus: function() {
            if (this.iscroll) this.iscroll.enable();
            if (this.autoPlay) this.run();
        },

        handleEvent: function(e) {
            switch (e.type) {
                case TOUCH_EVENTS.start:
                    this.onTouchStart(e);
                    break;
                case TOUCH_EVENTS.move:
                    this.onTouchMove(e);
                    break;
                case TOUCH_EVENTS.end:
                    this.onTouchEnd(e);
                    break;
                case 'click':
                    if (e.currentTarget == this.prevEl) {
                        this.onPrevClick(e);
                    } else if (e.currentTarget == this.nextEl) {
                        this.onNextClick(e);
                    }
                    break;
            }
        },

        /**
         * 销毁
         */
        destroy: function() {
            this.destroyed = true;
            this.stop();
            if (this.prevEl) {
                this.prevEl.removeEventListener('click', this, false);
                this.prevEl = null;
            }
            if (this.nextEl) {
                this.nextEl.removeEventListener('click', this, false);
                this.nextEl = null;
            }
            this.indicators = null;
            this.el.removeEventListener(TOUCH_EVENTS.start, this, false);
            this.el.removeEventListener(TOUCH_EVENTS.move, this, false);
            this.el.removeEventListener(TOUCH_EVENTS.end, this, false);
            this.el = this.items = null;
            this.iscroll = null;
        }
    };

    dummyStyle = null;

    if (typeof define === "function" && (define.amd || seajs)) {
        define('carouselwidget', [], function() {
            return Carousel;
        });
    }

    window.Carousel = Carousel;

})(window);