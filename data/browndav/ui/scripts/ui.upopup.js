/*global window: false, jQuery: false*/
/**
 * uPopup:
 *  An automatic-repositioning pop-up dialog for jQuery
 *
 * Copyright (c) 2011-2012, David Brown <dave@scri.pt>
 * All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL DAVID BROWN BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @namespace $.uPopup:
 */

$.uI.define('uPopup', function ($) {

    /**
     * uPopup - External API Overview
     *
     *  + `$.uPopup(_method, ...)`:
     *      This function is the primary entry point for all uPopup
     *      methods. To call a uPopup method, invoke this function on
     *      any jQuery object. Supply the method name in the first
     *      argument, followed by the arguments to the method. This
     *      function will dispatch your call to the appropriate API
     *      function.
     *
     *  + `create(this, _target_elts, _options)`:
     *      Create one or more popup windows out of the selected elements.
     *      The `this` object should be a jQuery selection, containing the
     *      element(s) that you'd like to have displayed inside of popup
     *      window. If the selection contains multiple elements, multiple
     *      popups will be created -- one for each. If you need to add
     *      multiple elements to a single popup dialog, wrap the elements
     *      in a single <div> (e.g. using jQuery's `wrap` function) before
     *      calling uPopup's `create` method.
     *
     *      + `this`:
     *          A jQuery selection. These are referred to as 'source
     *          elements'; each element in the list will be wrapped inside
     *          of a separate popup dialog and displayed.
     *
     *      + `_target_elts`:
     *          This argument is either (i) an array of elements,
     *          (ii) an array of javascript functions, or (iii) a jQuery
     *          selection. For each source element `s[i]` in `this`, the
     *          positioning algorithm will place `s[i]`'s popup relative
     *          to the target element `t[i]` in `_target_elts`. If `t[i]` is
     *          not defined, the positioning algorithm will use the closest
     *          previous element `t[k]` `(k = max(j) | j < i)` to determine an
     *          optimal position. If `t[i]` is a function, it will be invoked
     *          before positioning occurs, and must return a jQuery selection.
     *
     *      + `_options`:
     *          A javascript object, containing options that influence the
     *          behaviour of uPopup. A summary of the available options
     *          appears below:
     *          ``
     *          + `style`:
     *              Selects one of several available styles for the
     *              popup dialog. The default is $.uPopup.style.default;
     *              this uses the CSS that ships with uPopup. This is a
     *              customization hook, and allows uPopup to take on the
     *              native appearance and positioning behavior of other
     *              pop-up libraries / designs.
     *
     *          + `direction`:
     *              An object, containing an `x` and/or `y` attribute,
     *              containing preferred placement directions for the
     *              uPopup window. If `x` or `y` is positive, uPopup
     *              will attempt to place the popup window to the right
     *              or bottom of the target element, respectively. If
     *              `x` or `y` is zero or negative, uPopup will attempt
     *              to place the popup window to the left or top of the
     *              target element, respectively. If there is not enough
     *              room to accommodate the requested `direction`, then
     *              uPopup will fall back to the usual auto-placement.
     *              If `direction` is a function, it should return a
     *              value in the format described above.
     *
     *          + `fx`:
     *              A boolean value. True (default) if uPopup should be
     *              permitted to use jQuery effects when showing/hiding
     *              a popup dialog; false otherwise. Note that jQuery
     *              itself has a similar global option.
     *
     *          + `eventData`:
     *              A jQuery event object, obtained from a mouse click
     *              or mouse move handler. Each source element in `this`
     *              will be placed directly underneath the coordinates
     *              specified by this object's pageX and pageY values.
     *
     *          + `centerX`, `centerY`, `center`:
     *              A boolean value. Centres each source element in
     *              `this` on its respective target element from
     *              `_target_elts` -- either on the x-axis, y-axis,
     *              or on both axes, respectively.
     *
     *          + `useCorners`:
     *              A boolean value, defaults to true. When set, this
     *              causes the pointer/arrow to appear in a corner of
     *              the popup. When false, the arrow appears centered
     *              along one axis, on the top/bottom/left/right of the
     *              popup wrapper.
     *
     *          + `invertPlacement`:
     *              A boolean value, defaults to false. When set, this
     *              option causes uPopup to seek out the minimal space
     *              along each positioning axis in use, rather than
     *              the maximal amount of space. This option is useful
     *              when your popup is over something that shouldn't
     *              be obscured.
     *
     *          + `vertical`:
     *              A boolean value. If true, place each popup dialog's
     *              pointer (i.e. triangular arrow) on the top or bottom
     *              of the dialog, rather than on the left or right
     *              side. This is useful if a popup dialog appears close
     *              to the top or bottom edge of a window. This option will
     *              be used automatically by the positioning code if it
     *              isn't explicitly disabled here.
     *
     *          + `reposition`:
     *              A boolean value. True (the default) if uPopup should
     *              attempt to reposition the popup dialog(s) when the
     *              browser window is resized; false otherwise.
     *
     *          + `useViewport`:
     *              When set to true, the uPopup auto-positioning code
     *              only considers visible space -- that is, space
     *              appearing inside of the window element -- to be
     *              available for placement. This constrains the dialog's
     *              placement to visible locations only, and is the
     *              default. Set this to false if you're okay with the
     *              popup dialog occasionally being placed outside of
     *              the viewport (but still within the document).
     *
     *          + `classes`:
     *              A string containing CSS classes that should be added
     *              to the popup's `inner_elt` prior to positioning. This
     *              should be used for classes that influence the size or
     *              shape of the popup (e.g. smallest, smaller, small,
     *              large, larger, largest).
     *
     *          + `onShow`:
     *              A callback function. This function will be triggered
     *              by uPopup after a popup window has appeared. When
     *              this function is called, the popup window is
     *              guaranteed to be visible, and all effects will have
     *              completed.
     *
     *          + `onHide`:
     *              A callback function. This function will be triggered
     *              by uPopup after a popup window has disappeared. When
     *              this function is called, the popup window is
     *              guaranteed to be invisible, and all effects will have
     *              completed.
     *
     *          + `onReposition`:
     *              A callback function. This is invoked whenever the
     *              contents of the popup changes position relative
     *              to the page. This can be either translation (i.e.
     *              caused always by a scroll or resize operation), or
     *              reorientation (i.e. a change in the popup's
     *              direction, caused sometimes by scroll/resize).
     *
     *          + `onReorient`:
     *              A callback function. Like onReposition, but only
     *              fires if caused by a reorientation of the popup
     *              (i.e. a change in the popup's direction).
     *
     *  + `wrapper()`:
     *      Returns the set of wrapper elements being maintained by the
     *      uPopup library. This function returns an array whose size is
     *      equal to the number of elements supplied to `create` in the
     *      `this` parameter. Each element in the return value "wraps"
     *      (i.e. contains) exactly one source element supplied to `create`.
     *
     *  + `show()`:
     *      Show a set of popup dialogs created using the `create` method.
     *      The value of `this` should contain only elements that have
     *      already been supplied to the `create` method. To fire an action
     *      when the popup dialogs are fully visible, use the `onShow`
     *      callback function.
     *
     *  + `hide()`:
     *      Hide a set of popup dialogs shown using the `show` method.
     *      The value of `this` should contain only elements that have
     *      already been supplied to the `create` method. To fire an action
     *      when the popup dialogs are fully visible, use the `onHide`
     *      callback function.
     *
     *  + `destroy()`:
     *      Irreversibly destroy the popup dialog "wrapper", along with
     *      the source elements you supplied in the `this` argument when
     *      calling `create`. Elements supplied in other arguments,
     *      including `_target_elts` and `_options`, are not affected.
     */

    /**
     * uPopup - Markup and CSS Overview
     *
     *  The uPopup plugin uses CSS for all layout and appearance,
     *  including rounded corners, arrow/pointer placement, and
     *  drop shadows. Markup must follow a fixed structure; by
     *  default, the necessary markup is generated at runtime and
     *  used to wrap the element you provide. The markup format is
     *  (pipe characters denote mutually-exclusive alternatives):
     *      
     *        <div class="upopup">
     *          <div class="format {n|s|e|w|nw|...|wnw|wsw|ene|ese}">
     *            <div class="arrow first-arrow" />
     *            <div class="border">
     *              <div class="inner">
     *                  { html | element | function }
     *              </div>
     *            </div>
     *            <div class="arrow last-arrow" />
     *            <div class="clear" />
     *          </div>
     *      </div>
     *
     *  The popup dialog uses a triangular <div> (made using a thick
     *  border, with three transparent sides) to point at the target
     *  element that you provide. Only one arrow may be visible at a
     *  time; the visible arrow can be controlled by using one of the
     *  css classes from the diagram below (pipes again denote "or";
     *  asterisks indicate centered-arrow styles, which may have
     *  suboptimal placement due to the position of the arrow).
     *
     *                (n | nw)   (above)*   (ne)
     *                   ^          ^        ^
     *           (wnw) < +--------------------+ > (ene)
     *                   |                    |
     *         *(left) < |                    | > (right)*
     *                   |                    |
     *           (wsw) < +--------------------+ > (ese)
     *                   v          v        v
     *                (s | sw)   (below)*   (se)
     *
     *  To modify the appearance of any uPopup-managed element, use a
     *  custom stylesheet to override properties found in the default
     *  uPopup CSS file.
     */

    $.uPopup = {};
    $.uPopup.key = 'upopup';

    /**
     * @namespace global:
     *  A namespace containing event handlers and dispatch functions
     *  used by all instances of uPopup. These help to reduce the
     *  number of event handlers attached to the `window` and `document`
     *  elements, when many uPopup instances are used simultaneously.
     */
    $.uPopup.global = {

        /**
         * True if uPopup's global handlers have been bound to the proper
         * elements. This is performed once upon instantiation of the first
         * uPopup element, and then not performed subsequently.
         */
        initialized: false,

        /**
         * A data structure containing every element that has a
         * uPopup instance currently attached to it. This structure
         * makes it easy to map between a list item and its corresponding
         * element, in both directions.
         */
        instances: new $.uI.ElementIndex(),

        /**
         * Dispatch a single resize event -- occurring on the `window`
         * element -- to all currently-instansiated uPopup instances.
         */
        dispatch_window_resize: function (_ev) {

            var priv = $.uPopup.priv;

            $.uPopup.global.instances.each(function (_i, _elt) {
                priv._handle_reposition.call(_elt, _ev);
            });
        },

        /**
         * Dispatch a single scroll event -- occurring on the `window`
         * element -- to all currently-instansiated uPopup instances.
         */
        dispatch_window_scroll: function (_ev) {

            var priv = $.uPopup.priv;

            $.uPopup.global.instances.each(function (_i, _elt) {
                priv._handle_reposition.call(_elt, _ev);
            });
        }
    };

    /** @!namespace global */

    /**
     * @namespace impl:
     *  This namespace contains public methods that act on uPopup
     *  instances, and forms the entirety of uPopup's public API.
     */
    $.uPopup.impl = {

        /**
         * Initializes one or more new popup dialogs, and inserts each
         * in to the DOM as an immediate successor of a selected element.
         */
        create: function (_target_elts, _options) {

            var key = $.uPopup.key;
            var priv = $.uPopup.priv;
            var options = (_options || {});
            var target_elts = $(_target_elts);

            /* Process options:
                Add defaults for unspecified options. */

            options.style = (
                typeof(options.style) === 'object' ?
                    options.style : $.uPopup.style.regular
            );

            var default_options = {
                direction: {},
                useCorners: true,
                useMutation: true,
                invertPlacement: false,
                duration: 250 /* ms */
            }

            /* Apply defaults */
            options = $.extend(default_options, options);

            this.each(function (_i, _popup_elt) {

                /* Target element:
                    Use the final element repeatedly if there
                    are not enough target elements provided. */

                var popup_elt = $(_popup_elt);
                var target_elt, len = target_elts.length;

                if (_i >= len && len > 0) {
                    target_elt = target_elts[len - 1];
                } else {
                    target_elt = target_elts[_i];
                }

                /* Target element factory support:
                    Provide a function instead of a target element,
                    and it will be called to create targets at runtime. */

                if ($.isFunction(target_elt)) {
                    target_elt = target_elt.call(target_elt, popup_elt);
                }

                /* Save instance state data */
                var data = priv.create_instance_data(popup_elt, options);
                
                target_elt = $(target_elt);
                data.target_elt = target_elt;

                /* Wrap `popup_elt` inside of `wrapper_elt` */
                var wrapper_elt = priv.wrap(popup_elt, options);
                data.wrapper_elt = wrapper_elt;

                /* Additional CSS classes for popup:
                    Add classes that affect size/shape before reposition. */

                if (options.classes) {
                    wrapper_elt.closestChild('.' + key + '-format').addClass(
                        options.classes
                    );
                }

                /* Insert popup */
                priv.insert(
                    wrapper_elt, popup_elt, target_elt, options
                );

                /* Show popup */
                if (!options.hidden) {
                    $(this).uPopup('show');
                }

                /* Support for automatic repositioning */
                if (options.reposition !== false) {

                    /* Browser window resize/reflow */
                    priv.bind_global_dispatch(popup_elt);

                    /* AJAX update affecting popup's content */
                    popup_elt.bind(
                        'ajaxComplete.' + $.uPopup.key, priv._handle_reposition
                    );
                    /* DOM element mutation, when requested */
                    if (options.useMutation) {
                        popup_elt.bind(
                            'DOMSubtreeModified.' +
                                $.uPopup.key, priv._handle_reposition
                        );
                    }
                }

            });

            return this;
        },

        /**
         * Show the popup currently wrapping the selected element.
         * You can disable animations by setting _options.fx = false
         * in the `create` method, or by disabling jQuery's effects.
         */
        show: function (_callback) {

            var priv = $.uPopup.priv;

            this.each(function (i, popup_elt) {
                var data = priv.instance_data_for(popup_elt);

                if (data) {
                    priv.toggle(popup_elt, true, _callback);
                    priv.autoposition(
                        data.wrapper_elt, popup_elt, data.target_elt
                    );
                }
            });
        },

        /**
         * Hide the popup currently wrapping the selected element(s).
         * You can disable animations by setting _options.fx = false
         * in the `create` method, or by disabling jQuery's effects.
         */
        hide: function (_callback) {

            var priv = $.uPopup.priv;

            this.each(function (i, popup_elt) {
                var data = priv.instance_data_for(popup_elt);

                if (data) {
                    priv.toggle(popup_elt, false, _callback);
                    data.ratio = null;
                }
            });
        },

        /**
         * Destroys the popup that is currently wrapping the
         * selected element(s), hiding the popup first if necessary.
         */
        destroy: function (_callback) {

            var key = $.uPopup.key;
            var priv = $.uPopup.priv;

            var teardown_fn = function (_wrapper_elt) {

                var popup_elt = $(this);
                var data = priv.instance_data_for(popup_elt);

                priv.unwrap(popup_elt);
                priv.unbind_global_dispatch(popup_elt);

                popup_elt.unbind('.' + key);
                popup_elt.data($.uPopup.key, null);

                _wrapper_elt.remove();

                if (_callback) {
                    _callback(popup_elt, _wrapper_elt);
                }
            };

            this.each(function (i, popup_elt) {
                var data = priv.instance_data_for(popup_elt);

                if (data) {
                    priv.toggle(popup_elt, false, teardown_fn, {
                        /* Avoid infinite recursion */
                        is_destroying: true
                    });
                }
            });
        },

        /**
         * Given a list of originally-provided elements, this method
         * returns a list of the 'wrapper' elements currently in use.
         */
        wrapper: function () {

            /* Use flattening map function */
            return $($.map(this, function (popup_elt) {

                var data = $.uPopup.priv.instance_data_for(popup_elt);
                return (data ? data.wrapper_elt[0] : []);
            }));
        },

        /**
         * Given a list of elements on which `create` has been called,
         * this function returns a list of associative arrays, with each
         * item containing information about the corresponding element's
         * uPopup instance. This information includes:
         *
         *  direction: The direction the popup is pointing. This is
         *      returned in the format `{ x: i, y: j }`, where `i` and
         *      `j` are zero if pointing left and up, respectively, or one
         *      if pointing right and down, respectively (or a combination).
         *
         *  style: Returns the type of `$.uPopup.Style` object currently in
         *      use by the  uPopup instance. This is useful for passing
         *      style information to components that can make use of it.
         */
        info: function () {

            var rv = [];
            
            this.each(function (i, popup_elt) {
                var data = $.uPopup.priv.instance_data_for(popup_elt);

                if (!data) {
                    return false;
                }
                rv.push({
                    direction: data.bias,
                    style: data.options.style.name.call()
                });
            });

            return rv;
        },

        /**
         * This function causes uPopup to recalculate positioning
         * information for all elements in `this`, updating the stored
         * options for each if `_options` is a non-empty object. To
         * move the popup to a new position relative to the target
         * element, set the `eventData` option to a jQuery event object,
         * or other structure that contains `x`/`y` or `pageX`/`pageY`.
         */
        recalculate: function (_options) {

            var priv = $.uPopup.priv;
            var options = (_options || {});

            this.each(function (i, popup_elt) {

                var data = $.uPopup.priv.instance_data_for(popup_elt);

                if (!data) {
                    return;
                }

                /* Merge in new options, if provided */
                data.options = $.extend({}, data.options, options);

                /* Change of position?
                    If so, discard cached position data, so as to force
                    it to be recalculated inside of `priv.reposition`. */

                if (options.eventData) {
                    data.ratio = null;
                }

                /* Reposition */
                priv.autoposition(
                    data.wrapper_elt, popup_elt, data.target_elt
                );
            });
        }
    };

    /** @!namespace impl */

    /**
     * @namespace priv:
     *  A namespace that contains private functions, each
     *  used internally as part of uPopup's implementation.
     *  Please don't call these from outside of `$.uPopup.impl`.
     */
    $.uPopup.priv = {

        /**
         * Local variables:
         *  We provide a monotonically-increasing z-index for the
         *  popups we create, so as to ensure that newer popups
         *  always appear above older popups. This method imposes an
         *  artificial limit on the number of popups per page load,
         *  but it's far higher than any real-world use case.
         */
        _zindex_base: 16384,

        /**
         * Bind global event handlers, each of which dispatches events
         * originating on the `window` or `document` object to all of
         * the currently-instansiated `uPopup` instances. This avoids
         * a blow-up in the number of attached event handlers when
         * many `uDrag` instances are active.
         */
        bind_global_dispatch: function (_elt) {

            if (!$.uPopup.global.initialized) {

                var w = $(window);
                var key = $.uPopup.key;

                w.bind('resize.' + key,
                        $.uPopup.global.dispatch_window_resize);

                w.bind('scroll.' + key,
                        $.uPopup.global.dispatch_window_scroll);

                $.uPopup.global.initialized = true;
            }

            $.uPopup.global.instances.track(_elt);
        },

        /**
         * Removes the argument {_elt} from the global dispatch list,
         * created by `bind_global_dispatch`. Note that this doesn't
         * destroy the actual dispatch queues; they remain for the
         * lifetime of the interpreter instance.
         */
        unbind_global_dispatch: function (_elt) {

            $.uPopup.global.instances.untrack(_elt);
        },

        /**
         * Get the uPopup-specific private storage attached to `_elt`.
         */
        instance_data_for: function (_elt) {

            return $(_elt).data($.uPopup.key);
        },

        /**
         * Returns a new DOM element, consisting of `_popup_elt`,
         * wrapped inside of uPopup-specific elements. Values in
         * `_options` control the appearance and layout of the wrapper.
         */
        wrap: function (_popup_elt, _options) {

            var priv = $.uPopup.priv;
            var data = priv.instance_data_for(_popup_elt);

            var wrap_selector = '.' + $.uPopup.key + '-inner';
            var wrap_elt = $(_options.style.create_wrapper());

            data.original_parent = _popup_elt.parent();
            data.original_sibling = _popup_elt.next();

            wrap_elt.closestChild(wrap_selector).append(_popup_elt);

            return wrap_elt;
        },

        /**
         * Unwrap the wrapped `popup_elt`, and insert it back
         * underneath the parent element from whence it came originally.
         * This function tries to use the popup's original right-sibling
         * to move; if there was no right sibling (e.g. it was the
         * last element, or only element), the popup is appended to
         * its original parent.
         */
        unwrap: function (_popup_elt) {
            
            var priv = $.uPopup.priv;
            var data = priv.instance_data_for(_popup_elt);

            if (data) {
                if (data.original_sibling[0]) {
                    _popup_elt.insertBefore(data.original_sibling);
                } else if (data.original_parent[0]) {
                    data.original_parent.append(_popup_elt);
                }
            }
        },

        /**
         * Places a wrapped uPopup element inside of the DOM.
         * Values inside of the `_options` object are used to
         * control position and placement.
         */
        insert: function (_wrapper_elt, _popup_elt, _target_elt, _options) {

            var priv = $.uPopup.priv;
            var options = (_options || {});

            _wrapper_elt.css({
                display: 'none',
                zIndex: priv._zindex_base + $.uI.serial(priv.key)
            });

            _wrapper_elt.prependTo(document.body);
        },

        /**
         * Shows or hides a currently-visible popup instance. To remove
         * an instance altogether, and discard the element, see the
         * destroy function. To create a new instance, use `create`.
         * This is the backend for `impl.show` and `impl.hide`.
         */
        toggle: function (_popup_elt, _is_show, _callback, _toggle_flags) {

            var toggle_flags = (_toggle_flags || {});

            /* Multiple elements are allowed */
            $(_popup_elt).each(function (_i, _popup_elt) {

                var popup_elt = $(_popup_elt);

                /* Retrieve instance state data */
                var data = $.uPopup.priv.instance_data_for(popup_elt);
                var options = (data.options || {});
                var wrapper_elt = data.wrapper_elt;

                /* Build callback */
                var callback = function () {
                    if (_callback) {
                        _callback.call(popup_elt, wrapper_elt);
                    }
                };

                /* Invoke action */
                if (options.fx !== false) {

                    var f = function () {
                        $.uI.triggerEvent(
                            (_is_show ? 'show' : 'hide'),
                            $.uPopup.key, null, popup_elt, options,
                            [ wrapper_elt ]
                        );
                        callback();
                    };

                    /* Concurrency issue:
                        If `show` or `hide` is called before an earlier 
                        `show`/`hide` is completed, we need to force the
                        initial animation to finish before continuing on. */

                    if (!toggle_flags.is_destroying) {
                        wrapper_elt.stop(false, true);
                    }

                    if (_is_show) {
                        wrapper_elt.fadeIn(options.duration, f);
                    } else {
                        wrapper_elt.fadeOut(options.duration, f);
                    }
                } else {
                    if (_is_show) {
                        wrapper_elt.show();
                    } else {
                        wrapper_elt.hide();
                    }
                    callback();
                }
            });

            return this;
        },

        /**
         * Wrapper function for the popup dialog automatic-repositioning
         * algorithm. This wrapper implements browser-specific workarounds
         * for the actual autoposition code, found in `_autoposition`.
         */
        autoposition: function (_wrapper_elt, _popup_elt, _target_elt) {

            var priv = $.uPopup.priv;

            /* Workaround for Webkit reflow bug:
                The first call to autoposition triggers a reflow
                problem in Webkit, but subsequent calls work without
                incident. Get the problem out of the way immediately. */

            if ($.browser.webkit) {
                priv._autoposition(_wrapper_elt, _popup_elt, _target_elt);
            }
            
            return priv._autoposition(_wrapper_elt, _popup_elt, _target_elt);
        },

        /**
         * Implementation of the popup dialog automatic-repositioning
         * algorithm. Places `wrapper_elt` on the side of `target_elt` that
         * has the most available screen space, in each of two dimensions.
         */
        _autoposition: function (_wrapper_elt, _popup_elt, _target_elt) {

            var avail = {};
            var priv = $.uPopup.priv;
            var data = priv.instance_data_for(_popup_elt);

            var options = data.options;
            var ev = options.eventData;
            var container_elt = $(document);

            /* Precompute sizes, offsets:
                These figures are used in the placement algorithm. */
                
            var target_size = priv.compute_target_size(_target_elt)
            var target_offset = priv.compute_target_offset(_target_elt);

            var container_size = {
                x: container_elt.width(),
                y: container_elt.height()
            };

            var wrapper_size = {
                x: _wrapper_elt.outerWidth(),
                y: _wrapper_elt.outerHeight()
            };

            /* Compute available space on each side:
                `{ x: [ left, right ], y: [ top, bottom ] }` */

            if (ev) {

                /* Event object provided:
                    This tells us where the mouse pointer currently is.
                    We can use this instead of the target's corners. */

                var pt = priv.event_to_point(
                    ev, data, target_offset, target_size
                );

                avail = {
                    x: [ pt.x, container_size.x - pt.x ],
                    y: [ pt.y, container_size.y - pt.y ]
                };

            } else {

                /* No event object:
                    Compute space relative to `target_elt`'s corners. */

                avail = {
                    x: [
                        target_offset.x,
                        container_size.x -
                            target_offset.x - target_size.x
                    ],
                    y: [
                        target_offset.y,
                        container_size.y -
                            target_offset.y - target_size.y
                    ]
                };
            }

            /* Placement relative to viewport:
                If the viewport option has been set, then
                only count space that's immediately visible. */

            if (data.options.useViewport !== false) {

                var window_elt = $(window);

                var window_offset = {
                    y: window_elt.scrollTop(),
                    x: window_elt.scrollLeft()
                };

                avail.x[0] -= window_offset.x;
                avail.x[1] -= (
                    container_size.x -
                        (window_offset.x + window_elt.width())
                );
                avail.y[0] -= window_offset.y;
                avail.y[1] -= (
                    container_size.y -
                        (window_offset.y + window_elt.height())
                );

            }

            /* Stash for later use:
                Some styles might move the wrapper element around,
                and may need access to the available space calculations. */

            data.avail = avail;

            /* Bias values:
                Each value is an index for `avail` and `offsets`;
                zero is the minimal side of an axis, one the maximal. */

            data.bias = {
                x: $.uI.indexOfMax(avail.x),
                y: $.uI.indexOfMax(avail.y)
            };

            /* Handle strategy inversion:
                If requested, flip each axis' bias value, so as to
                cause uPopup to seek the minimum space along each axis. */

            if (options.invertPlacement) {
                data.bias.x = (data.bias.x ? 0 : 1);
                data.bias.y = (data.bias.y ? 0 : 1);
            }

            /* Direction preference:
                If the caller noted a preferred direction along either
                axis, try to accommodate the request. If there is not
                enough space for `_wrapper_elt` to fit along a particular
                axis, ignore the preference and use the automatic value. */

            var dir = options.direction;

            if ($.isFunction(dir)) {
                dir = dir.call($(_popup_elt), $(_wrapper_elt));
            }

            for (var k in { x: 0, y: 1 }) {
                if ($.uI.hasValue(dir[k])) {
                    var i = (dir[k] > 0 ? 1 : 0);
                    if (avail[k][i] >= wrapper_size[k]) {
                        data.forced_bias[k] = data.bias[k] = i;
                    }
                }
            }

            return priv.reposition(
                _wrapper_elt, wrapper_size,
                    _popup_elt, _target_elt, data.bias
            );
        },

        /**
         * This is the core repositioning function. This is used as the
         * back-end of `autoposition`, and may be called directly to
         * force a popup to appear facing a certain direction. The
         * `_target_elt` is the element that the popup should point
         * to; `_wrapper_elt` is the return value obtained from calling
         * `wrapper`; _x and _y are boolean values denoting left/right
         * and top/bottom (each zero/one or false/true, respectively).
         */
        reposition: function (_wrapper_elt, _wrapper_size,
                              _popup_elt, _target_elt, _bias) {
            var offsets;
            var key = $.uPopup.key;
            var priv = $.uPopup.priv;
            var data = priv.instance_data_for(_popup_elt);

            var options = data.options;
            var ev = options.eventData;
            var inner_elt = _wrapper_elt.closestChild('.' + key + '-format');
            var arrow_elt = inner_elt.closestChild('.' + key + '-arrow');

            /* Precompute sizes:
                These figures are used in the placement algorithm. */
                    
            var target_size = priv.compute_target_size(_target_elt)
            var target_offset = priv.compute_target_offset(_target_elt);

            var padding_size = {
                x: (_wrapper_size.x - inner_elt.width()) / 2,
                y: (_wrapper_size.y - inner_elt.height()) / 2
            };

            /* Delta value:
                Distance between popup's edge and arrow's edge. */

            var elts = {
                arrow: arrow_elt,
                inner: inner_elt,
                wrapper: _wrapper_elt
            };

            var d = data.options.style.calculate_delta(
                elts, data, _bias
            );

            if (ev) {

                /* Event object provided:
                    This tells us where the mouse pointer currently is.
                    We can use this instead of the target's corners
                    to determine the list of possible placements. */

                var pt = priv.event_to_point(
                    ev, data, target_offset, target_size
                );

                offsets = {
                    x: [
                        pt.x - _wrapper_size.x  + d.x,
                        pt.x - d.x
                    ],
                    y: [
                        pt.y - _wrapper_size.y + d.y,
                        pt.y - d.y
                    ]
                };

            } else {

                /* No event object:
                    Possible offsets are the target's four corners. */

                offsets = {
                    x: [
                        target_offset.x - _wrapper_size.x +
                            d.x + padding_size.x,
                        target_offset.x + target_size.x -
                            d.x - padding_size.x
                    ],
                    y: [
                        target_offset.y - _wrapper_size.y +
                            d.y + padding_size.y,
                        target_offset.y + target_size.y -
                            d.y - padding_size.y
                    ]
                };
            }

            /* Use center of target, instead of its corner:
                The center of `target_elt` is always toward zero (i.e.
                pointed away from the maximal edge of the available
                space). Due to this fact, the following steps never
                yield less room for dialog placement -- always more. */

            if (!ev) {
                if (options.center || options.centerX) {
                    var dx = target_size.x / 2;
                    offsets.x[0] += dx;
                    offsets.x[1] -= dx;
                }
                if (options.center || options.centerY) {
                    var dy = target_size.y / 2;
                    offsets.y[0] += dy;
                    offsets.y[1] -= dy;
                }
            }

            /* Stash for later use:
                Some styles might move the wrapper element,
                and may need access to our offset calculations. */

            data.offsets = offsets;
            data.size = _wrapper_size;

            /* Finally, reposition:
                Write the actual style change to the DOM element. */

            _wrapper_elt.offset({
                top: offsets.y[_bias.y],
                left: offsets.x[_bias.x]
            });

            /* Defer to style-specific code:
                Allow the style to make modifications to the position
                of the wrapper element, or otherwise make changes to it. */

            var events = { reposition: true };
            var bias_key = (_bias.x * 2) + _bias.y;

            data.options.style.apply_style(elts, data, _bias);

            if (bias_key !== data.recent_bias_key) {
                events.reorient = true;
                data.recent_bias_key = bias_key;
            }

            for (var k in events) {
                $.uI.triggerEvent(
                    k, $.uPopup.key, null, _popup_elt,
                        data.options, [ _wrapper_elt ]
                );
            }

            return true;
        },

        /**
         * Compute the page offset of the element `_target_elt`, in
         * pixels. For special elements (e.g. SVG-related) that don't
         * respond correctly to jQuery's `offset` function, we employ
         * a different strategy to find the correct value.
         */
        compute_target_offset: function (_target_elt) {

            var target_elt = $(_target_elt);

            if (target_elt.parents('svg').length > 0) {

                /* Scalable vector graphics:
                    SVG elements don't generally support querying position
                    or size information via the usual jQuery functions. */

                var r = target_elt[0].getBoundingClientRect();

                return {
                    y: Math.round(r.top),
                    x: Math.round(r.left)
                }
            }

            /* Normal case */
            var rv = target_elt.offset();
            return { x: rv.left, y: rv.top };
        },

        /**
         * Compute the width and height of the element `_target_elt`,
         * in pixels. For special elements (e.g. SVG-related) that
         * don't respond correctly to jQuery's `offset` function, we
         * employ a different strategy to find the correct value.
         */
        compute_target_size: function (_target_elt) {

            var target_elt = $(_target_elt);

            if (target_elt.parents('svg').length > 0) {

                /* Scalable vector graphics:
                    See compute_target_offset for an explanation. */

                var r = target_elt[0].getBoundingClientRect();

                return {
                    x: Math.round(r.width),
                    y: Math.round(r.height)
                }
            }

            /* Normal case */
            return {
                x: target_elt.outerWidth(),
                y: target_elt.outerHeight()
            };
        },

        /**
         * Given a jQuery event object (containing both pageX and
         * pageY coordinates), extract the coordinates and apply any
         * necessary transformations.
         */
        event_to_point: function (ev, data, offset, size) {

            /* Save offset-to-size ratio:
                If the target element is resized, then we'll use this
                ratio to adjust the coordinates originally provided. */

            if (!data.ratio) {
                data.ratio = {
                    x: (ev.pageX - offset.x) / size.x,
                    y: (ev.pageY - offset.y) / size.y
                };
            }

            return {
                x: offset.x + data.ratio.x * size.x,
                y: offset.y + data.ratio.y * size.y
            };
        },

        /**
         * Initialize private storage on the element _elt, setting
         * all private fields to their original and default values.
         * This must be called before any popup can be modified.
         */
        create_instance_data: function (_popup_elt, _options) {

            _popup_elt.data($.uPopup.key, {
             /* size: null,
                avail: null,
                ratio: null,
                offsets: null,
                wrapper_elt: null,
                reposition_fn: null,
                original_parent: null, */
                forced_bias: {},
                popup_elt: _popup_elt,
                options: (_options || {})
            });

            return _popup_elt.data($.uPopup.key);
        },

        /**
         * Event handler shared between the window resize and
         * scroll events; repositions the popup window to correct
         * for a change in the size or offset of the page.
         */
        _handle_reposition: function (_ev) {

            var priv = $.uPopup.priv;
            var data = priv.instance_data_for(this);

            if (data.wrapper_elt.css('display') === 'none') {
                return;
            }

            priv._autoposition(
                data.wrapper_elt, this, data.target_elt
            );
        }
    };

    /** @!namespace priv */

    /**
     * @namespace style:
     */
    $.uPopup.style = {

        /**
         * @class helper
         *  Commonly used placement and style functions, to be reused
         *  inside of style implementations. This is not a complete
         *  style itself; don't reference this as a `style` option.
         */
        helper: {

            /**
             * Move `_wrapper_elt` so that the point of `_arrow_elt`
             * is over the intended target, rather than the corner
             * of `_arrow_elt`'s bounding box.
             */
            adjust_for_arrow: function (_wrapper_elt,
                                        _arrow_elt, _bias, _coefficients) {

                var wrapper_offset = _wrapper_elt.offset();

                var arrow_size = {
                    x: _arrow_elt.outerWidth(),
                    y: _arrow_elt.outerHeight()
                };
                
                _wrapper_elt.offset({
                    top: wrapper_offset.top -
                        (_coefficients.y[_bias.y] * arrow_size.y / 2),
                    left: wrapper_offset.left +
                        (_coefficients.x[_bias.x] * arrow_size.x / 2)
                });
            },

            /**
             * Repositions `_wrapper_elt` to account for the 
             * triangular arrow/pointer being centered along
             * one axis, rather than in a corner of `_wrapper_elt`.
             */
            adjust_for_centered_pointer: function (_wrapper_elt,
                                                   _inner_elt, _data, _bias) {
                var size = _data.size;
                var avail = _data.avail;
                var offsets = _data.offsets;

                /* Select preferred axis:
                    Together with `_bias`, this determines placement. */

                var axis = (
                    _data.options.vertical ? 'y' :
                        ((avail.x[_bias.x] > avail.y[_bias.y]) ? 'x' : 'y')
                );

                /* Adjustment factor:
                    This transforms the popup placement, by centering
                    it along the placement axis that we did not select. */

                var coeff = {
                    x: (axis === 'y' ? (_bias.x ? -1 : 1) : 0),
                    y: (axis === 'x' ? (_bias.y ? -1 : 1) : 0)
                };


                _wrapper_elt.offset({
                    top: offsets.y[_bias.y] + ((size.y / 2) * coeff.y),
                    left: offsets.x[_bias.x] + ((size.x / 2) * coeff.x)
                });

                return { axis: axis, bias: _bias[axis] };
            },

        },

        /** @!class helper */

        /**
         * @class regular:
         *  The default look and feel for uPopup.
         */
        regular: {

            /**
             * Introspection function: Return this name of this class.
             */
            name: function () {
                return 'regular';
            },

            /**
             * Create an element that will surround the user-provided
             * element. Content will be inserted under the element
             * that has a CSS class of `.inner`.
             */
            create_wrapper: function () {

                var key = $.uPopup.key;

                return $(
                    '<div class="' + key + '">' +
                        '<div class="' + key + '-format">' +
                            '<div class="' + key +
                                '-arrow ' + key + '-first-arrow" />' +
                            '<div class="' + key + '-border">' +
                                '<div class="' + key + '-inner" />' +
                            '</div>' +
                            '<div class="' + key +
                                '-arrow ' + key + '-last-arrow" />' +
                            '<div class="' + key + '-clear" />' +
                        '</div>' +
                    '</div>'
                );
            },

            /**
             * Apply any style-specific modifications to the uPopup-managed
             * elements. In the default case, positioning is performed for
             * us; we just set the appropriate CSS class and return.
             */
            apply_style: function (_elts, _data, _bias) {

                var key = $.uPopup.key
                var classes, coefficients;
                var helper = $.uPopup.style.helper;

                /* Position arrow:
                    We place the arrow on a corner of the popup.
                    Specifically, we use the corner that's closest
                    to the near corner of the target element. */

                if (_data.options.useCorners) {

                    var is_vertical = _data.options.vertical;

                    classes = (
                        is_vertical ?
                            [ [ key + '-se', key + '-ne' ],
                                [ key + '-s', key + '-n' ] ] :
                            [ [ key + '-ese', key + '-e' ],
                                [ key + '-wsw', key + '-w' ] ]
                    );

                    coefficients = (
                        is_vertical ?
                            { x: [ 1, -1 ], y: [ 1, -1 ] }
                            : { x: [ -1, 1 ], y: [ -1, 1 ] }
                    );

                    _elts.inner.removeClass(
                        classes[0].concat(classes[1]).join(' ')
                    );

                    _elts.inner.addClass(classes[_bias.x][_bias.y]);

                } else {
               
                    classes = {
                        x: [ key + '-right', key + '-left' ],
                        y: [ key + '-below', key + '-above' ]
                    };

                    var pos = helper.adjust_for_centered_pointer(
                        _elts.wrapper, _elts.inner, _data, _bias
                    );

                    coefficients = (
                        (pos.axis !== 'x') ?
                            { x: [ 0, 0 ], y: [ 1, -1 ] }
                            : { x: [ -1, 1 ], y: [ 0, 0 ] }
                    );

                    var e = _elts.inner;
                    e.removeClass(classes.x.concat(classes.y).join(' '));
                    e.addClass(classes[pos.axis][pos.bias]);
                }

                helper.adjust_for_arrow(
                    _elts.wrapper, _elts.arrow, _bias, coefficients
                );
            },

            /**
             * Use an invisible <div> to determine the number of additional
             * pixels needed to shift to the arrow element's exact point.
             * This is required due to the use of absolute positioning --
             * we don't have a solid way to determine the offset-from-edge
             * in pixels using element positioning data alone.
             */
            calculate_delta: function (_elts, _data, _bias)
            {
                var key = $.uPopup.key;
                var rv = { x: 0, y: 0 };

                if (_data.options.useCorners) {

                    var adjust_div = $('<div />').addClass(key + '-adjust');
                    _elts.inner.append(adjust_div);

                    /* Coefficients:
                        Adjust width/x, adjust height/y */

                    var c = (_data.options.vertical ? [ 1, 0 ] : [ 0, 1 ]);

                    rv.x = c[0] * adjust_div.width();
                    rv.y = c[1] * adjust_div.height();

                    adjust_div.remove();
                }

                return rv;
            }
        }
        
        /** @!class regular */
    };

    /** @!namespace style */
    /** @!namespace uPopup */

    /** @namespace $.fn */

    $.fn.uPopup = function (/* const */_method /* , ... */) {

        /* Dispatch to appropriate method handler:
            Note that the `method` argument should always be a constant.
            Never allow user-provided input to be used for the argument. */

        return $.uPopup.impl[_method].apply(
            this, Array.prototype.slice.call(arguments, 1)
        );
    };

    return $.uPopup;

}, jQuery);

/** @!namespace */

