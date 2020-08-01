/*global window: false, jQuery: false*/
/**
 * uMenu:
 *  A reorderable hierarchical menu for jQuery
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
 * @namespace $.uMenu:
 *  uMenu creates an object under `$.uMenu`, which contains the
 *  full menu mplementation -- all public and private functions.
 */

$.uI.define('uMenu', function ($) {

    $.uMenu = {};
    $.uMenu.key = 'umenu';

    /**
     * @namespace global:
     *  A namespace containing event handlers and dispatch functions
     *  used by all instances of uMenu. These help to reduce the
     *  number of event handlers attached to the `window` and `document`
     *  elements, when many uMenu instances are used simultaneously.
     */
    $.uMenu.global = {

        /**
         * True if uMenu's global handlers have been bound to the proper
         * elements. This is performed once upon instantiation of the first
         * uMenu element, and then not performed subsequently ever again.
         */
        initialized: false,

        /**
         * A data structure containing every element that currently
         * has a uMenu instance attached to it.
         */
        instances: new $.uI.ElementIndex(),

        /**
         * Dispatch a single `mousedown` event -- occurring on the
         * `document` element -- to all currently-instansiated uMenu
         * instances.
         */
        dispatch_document_mousedown: function (_ev) {

            var priv = $.uMenu.priv;

            $.uMenu.global.instances.each(function (_i, _elt, _data) {
                if (!_data.parentMenu) {
                    priv._handle_document_mousedown.call(_elt, _ev);
                }
            });
        },

        /**
         * Dispatch a single `mouseover` event -- occurring on the
         * `document` element -- to all currently-instansiated uMenu
         * instances.
         */
        dispatch_document_mouseover: function (_ev) {

            var priv = $.uMenu.priv;

            $.uMenu.global.instances.each(function (_i, _elt, _data) {
                priv._handle_document_mouseover.call(_elt, _ev);
            });
        }
    };

    /** @!namespace global */

    /**
     * @namespace impl:
     *  This namespace contains public methods, which can be
     *  invoked by calling code via the `$.fn.uMenu` dispatch
     *  function.
     */
    $.uMenu.impl = {

        /**
         * Initializes one or more new menu elements, providing
         * a hierarchical pop-up menu (with optional drag/drop).
         */
        create: function (_target_elt, _options) {

            var default_options = {
                cache: true,
                autoDestroy: true,
                delay: 100 /* ms */,
                duration: 150 /* ms */
            };

            var key = $.uMenu.key;
            var priv = $.uMenu.priv;
            var options = $.extend(default_options, _options || {});

            this.each(function (_i, _menu_elt) {

                var menu_elt = $(_menu_elt);
                var data = priv.create_instance_data(menu_elt, options);

                /* Initialize menu items:
                    Bind event handlers to items on the current level. */

                priv.bind_menu_items(
                    menu_elt, priv.parse_items_option(menu_elt, options)
                );

                /* Generator function for directional bias:
                    If a direction option isn't provided, have all menu
                    popups and submenu popups point the same way as
                    this initial root menu, if it's possible to do so. */

                var bias_fn = function () {
                    return priv.determine_popup_bias.call(this, menu_elt);
                };

                data.bias = (options.direction || bias_fn);

                /* Event handlers:
                    Single-click handler on document for menu dismissal. */

                priv.bind_global_dispatch(menu_elt, options);

                menu_elt.bind(
                    'mousedown.' + key, priv._handle_menu_mousedown
                );

                /* Contained classes:
                    Instansiate the popup window surrounding this menu,
                    and, if requested, a uSort instance for reordering. */

                var popup_event = function (_this, _args) {

                    return $.uI.triggerEvent(
                        this, $.uPopup.key, true,
                            _this, (options.upopup || {}), _args
                    );
                };

                var popup_defaults = {
                    center: true,
                    hidden: true,
                    useMutation: false,
                    direction: data.bias,
                    style: options.style,
                    vertical: options.vertical
                };

                var popup_options = (
                    $.extend({}, popup_defaults, (options.upopup || {}), {

                        onReorient: function (_wrapper_elt) {

                            var args = [ this, _wrapper_elt ];
                            popup_event.call('reorient', this, args);

                            return priv._handle_popup_reorient.call(
                                this, args
                            );
                        }
                    })
                );

                menu_elt.uPopup('create', _target_elt, popup_options);

                if (!options.hidden) {
                    priv.toggle(menu_elt, { is_show: true });
                }

                /* Sorting support:
                    If desired, menus can include reorderable elements.
                    Use a single instance of uSort on the menu's root, 
                    and add/remove items if a submenu is opened/closed. */

                if (options.usort) {

                    var sort_event = function (_this, _args) {
                        return $.uI.triggerEvent(
                            this, $.uSort.key, true,
                                _this, (options.usort || {}), _args
                        );
                    };

                    var sort_options = $.extend({}, (options.usort || {}), {

                        items: data.items.$(),

                        onDrag: function (_drag, _from, _offsets) {

                            var args = [ _drag, _from, _offsets ];
                            sort_event.call('drag', this, args);

                            return priv._handle_sort_drag.apply(this, args);
                        },

                        onDrop: function (_drag, _from, _to) {

                            var args = [ _drag, _from, _to ];
                            sort_event.call('drop', this, args);

                            return priv._handle_sort_drop.apply(this, args);
                        },

                        onMigrate: function (_drag, _from, _to) {

                            var args = [ _drag, _from, _to ];
                            sort_event.call('migrate', this, args, options);

                            return priv._handle_sort_migrate.apply(this, args);
                        }
                    });

                    if (options.parentMenu) {
                        menu_elt.uMenu('root').uSort(
                            'add', menu_elt, sort_options
                        );
                    } else {
                        menu_elt.uSort('create', sort_options);
                    }
                }
            });

            return this;
        },

        /**
         * Show the hierarchical pop-up menu rooted at `this`.
         */
        show: function (_callback) {

            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(this);
            var submenus = data.active_submenus;

            return priv.toggle(this, { is_show: true }, _callback);
        },

        /**
         * Hide the hierarchical pop-up menu rooted at `this`. If
         * `_is_automatic` is true, then `hide` will be invoked as
         * if it is being called by the uMenu implementation itself
         * (e.g. in response to a mouse event on the `document`).
         * This is almost certainly not what you want -- typically
         * callers should pass a false-like value for `_is_automatic`.
         */
        hide: function (_options, _callback) {

            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(this);

            /* No uMenu object here?
                Nothing to hide; ignore silently and return. */

            if (!data) {
                return false;
            }

            return priv.toggle(this, _options, _callback);
        },

        /**
         * Stops any in-progress show/hide animations running on
         * behalf of `this`, or any descendent uMenu elements.
         */
        stop: function () {

            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(this);

            /* No uMenu object here?
                Nothing to stop; ignore silently and return. */

            if (!data) {
                return false;
            }

            data.is_animating = false;

            /* Otherwise:
                Recursively stop any active submenu animations. */

            var submenus = data.active_submenus;

            this.uPopup('wrapper').stop(false, true);

            for (var k in submenus) {
                submenus[k].uMenu('stop');
            }

            return this;
        },

        /**
         * Removes the uMenu-managed event handlers from each element
         * in `this`, restoring it to its pre-instansiation state.
         */
        destroy: function (_options, _callback) {

            var key = $.uMenu.key;
            var priv = $.uMenu.priv;
            var destroy = 'destroy';

            this.each(function (_i, _menu_elt) {

                var menu_elt = $(_menu_elt);
                var data = priv.instance_data_for(menu_elt);

                /* Already destroyed?
                    Tolerate double-free cases by just returning. */

                if (!data) {
                    return this;
                }

                var options = data.options;
                var submenus = data.active_submenus;

                for (var k in submenus) {
                    var submenu_elt = submenus[k];
                    var sub_data = priv.instance_data_for(submenu_elt);

                    submenu_elt.uMenu(destroy, _options);
                }

                if (options.usort) {

                    if (options.parentMenu) {
                        priv.remove_submenu_sorting(menu_elt);
                    } else {
                        menu_elt.uSort(destroy);
                    }
                }

                menu_elt.uPopup(destroy, function () {

                    priv.unbind_menu_items(menu_elt);

                    if (options.parentMenu) {
                        menu_elt.hide();
                    }

                    if (_callback) {
                        _callback.call(menu_elt)
                    }

                    data.items.untrackAll();
                    priv.unbind_global_dispatch(menu_elt);

                    menu_elt.data(key, null);
                    menu_elt.unbind('.' + key);
                });

            });

            return this;
        },

        /**
         * Removes the uMenu-managed event handlers from the entire
         * menu hierarchy containing an element in the selection `this`.
         * Elements and objects are restored to their original state.
         */
        destroyAll: function (_options, _callback) {

            this.uMenu('root').uMenu('destroy', _options, _callback);
        },

        /**
         * If `this` is a submenu, follow the sequence of `parentMenu`
         * options options all of the way up to the root menu, then return
         * the root menu. This option is set automatically by uMenu
         * when creating a sub-menu, and is usually not set directly.
         */
        root: function () {

            var parent_elts = this.uMenu('parents');

            if (parent_elts.length) {
                return parent_elts.last();
            }

            return this;
        },

        /**
         * Return true if a uMenu instance is attached to every
         * element in the `this` selection, otherwise return false.
         */
        exists: function () {

            var priv = $.uMenu.priv;
        
            for (var i = 0, len = this.length; i < len; ++i) {

                if (!priv.instance_data_for(this[i])) {
                    return false;
                }
            }

            return true;
        },

        /**
         * If `this` is a submenu, follow the sequence of `parentMenu`
         * options options all of the way up to the root menu, and return
         * every uMenu instance encountered along the way. This option is
         * set automatically by uMenu when creating a sub-menu, and is
         * usually not set directly.
         */
        parents: function () {

            var priv = $.uMenu.priv;

            return $(this.map(function () {

                var rv = [ ];
                var elt = $(this);

                for (;;) {
                    var data = priv.instance_data_for(elt);

                    if (!data) {
                        break;
                    }

                    var parent_elt = (data.options || {}).parentMenu;

                    if (!parent_elt) {
                        break;
                    }

                    elt = parent_elt;
                    rv = rv.concat(parent_elt[0]);
                }

                return rv;
            }));
        }
    };
    
    /** @!namespace impl */

    /**
     * @namespace priv:
     *  This namespace contains non-public methods, each used
     *  privately as part of uMenu's underlying implementation.
     *  Please don't call these from outside of `$.uMenu.impl`.
     */
    $.uMenu.priv = {

        /**
         * Get the uMenu-specific private storage attached to `_elt`.
         */
        instance_data_for: function (_elt) {

            return $(_elt).data($.uMenu.key);
        },

        /**
         * Initialize private storage on the element _elt, setting
         * all private fields to their original default values. This
         * must be called before any sortables can be modified.
         */
        create_instance_data: function (_menu_elt, _options) {

            var key = $.uMenu.key;

            _menu_elt.data(
                key, {
                    is_cached: false,
                    is_visible: false,
                    is_delaying: false,
                    is_dragging: false,
                    is_animating: false,
                    selected_item_elt: null,
                    options: _options,
                    active_submenus: {},
                    items: new $.uI.ElementIndex()
                }
            );

            return _menu_elt.data(key);
        },

        /**
         * Attach the current newly-created uMenu instance to
         * the shared global event handlers on the `document`
         * element.
         */
        bind_global_dispatch: function (_elt, _options) {

            if (!$.uMenu.global.initialized) {

                var d = $(document);
                var key = $.uPopup.key;

                d.bind('mousedown.' + key,
                       $.uMenu.global.dispatch_document_mousedown);

                d.bind('mouseover.' + key,
                       $.uMenu.global.dispatch_document_mouseover);

                $.uMenu.global.initialized = true;
            }

            $.uMenu.global.instances.track(_elt, {
                parentMenu: _options.parentMenu
            });
        },

        /**
         * Detach the current uMenu instance from the shared
         * global event handlers on the `document` element.
         */
        unbind_global_dispatch: function (_elt) {

            $.uMenu.global.instances.untrack(_elt);
        },

        /**
         * Given the uMenu root element `_menu_elt`, and a set of
         * uMenu constructor options in `_options`, find all of the
         * menu items that should be controlled by a uMenu instance.
         */
        parse_items_option: function (_menu_elt, _options) {

            var rv = (
                _options.items || ('.' + $.uMenu.key + '-item')
            );

            /* Item handling:
                Search for menu items, using one of two strategies. */

            switch (typeof(rv)) {
                case 'function':
                    rv = $(rv.apply(_menu_elt));
                    break;
                default:
                case 'string':
                    rv = _menu_elt.children(rv);
                    break;
            }

            return rv;
        },

       /**
        * Bind event handlers, and otherwise initialize, all
        * menu items in `_item_elts` rooted at `_menu_elt`.
        */
        bind_menu_items: function (_menu_elt, _item_elts) {

            var key = $.uMenu.key;
            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(_menu_elt);

            /* Hide submenus for all items:
                These will be shown on mouse-over, by instansiating
                another instance of uMenu on the sub-menu element. */

            $('.' + key, _item_elts).each(function (_i, _item_elt) {
                $(_item_elt).hide();
            });

            _menu_elt.bind('mouseover.' + key, function (_ev) {
                if (!data.options.usort || !_menu_elt.uSort('isDragging')) {
                    _ev.stopPropagation();
                }
            });

            /* Bind each item:
                For every item selected via the `items` option,
                bind the appropriate mouse-based event handlers. */

            $(_item_elts).each(function (_i, _item_elt) {

                var sel = ('.' + key);
                var item_elt = $(_item_elt);

                var submenu_elt = item_elt.closestChild(sel);
                var arrow_elt = item_elt.closestChild(sel + '-arrow');
                var handle_elt = item_elt.closestChild(sel + '-handle');

                /* Manage arrow element:
                    If we don't have any sub-menus, hide the arrow symbol,
                    and add a CSS class to easily locate empty subtrees. */

                var empty_class = (key + '-empty');

                if (submenu_elt[0]) {
                    arrow_elt.show();
                    item_elt.removeClass(empty_class);
                } else {
                    arrow_elt.hide();
                    item_elt.addClass(empty_class);
                }

                /* Prepare the "handle" element:
                    If we're sortable, then we need to ensure that hover
                    events on the drag handle doesn't propagate up to the
                    menu item itself. This allows sorting without selection. */

                handle_elt.bind('mouseover.' + key, function (_ev) {
                    _ev.stopPropagation();
                });

                /* Add event listeners:
                    These handle the highlighting and selection of items. */

                item_elt.bind('mouseover.' + key, function (_ev) {
                    return priv._handle_item_mouseover.call(
                        this, _ev, _menu_elt
                    );
                });

                item_elt.bind('click.' + key, function (_ev) {
                    return priv._handle_item_click.call(
                        this, _ev, _menu_elt
                    );
                });

                data.items.track(item_elt, { is_delaying: false });
            });
        },

        /**
         * If `_item_elts` is specified, unbind all event handlers and
         * other resources related to the items in `_item_elts` that
         * are children of the uMenu root `_menu_elt`. If `_item_elts`
         * argument evaluates to a false value, `unbind_menu_items` will
         * unbind every item managed by `_menu_elt`'s uMenu instance.
         */
        unbind_menu_items: function (_menu_elt, _item_elts /* optional */) {

            var key = $.uMenu.key;
            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(_menu_elt);

            var item_elts = (
                _item_elts ? $($.uI.listify(_item_elts)) : data.items
            );

            item_elts.each(function (_i, _item_elt) {

                var item_elt = $(_item_elt);
                priv.toggle_item(_menu_elt, item_elt);

                item_elt.unbind('.' + key);
                data.items.untrack(item_elt);
            });
        },
        
        /**
         * Show or hide the hierarchical pop-up menu(s) rooted at
         * `_menu_elt`. If `_is_show` is true, then the popup
         * menu will be shown; otherwise it will be hidden.
         */
        toggle: function (_menu_elt, _flags, _callback) {

            var priv = $.uMenu.priv;
            var flags = (_flags || {});

            $(_menu_elt).each(function (_i, _menu_elt) {

                var menu_elt = $(_menu_elt);

                var op = (flags.is_show ? 'show' : 'hide');
                var data = priv.instance_data_for(menu_elt);

                /* Hiding a menu?
                    If so, unselect all of its immediate child items. */

                if (!flags.is_show) {
                    priv.unselect_all_items(menu_elt);
                }

                /* Show/hide popup:
                    Once it's visible, finish up and fire events. */

                menu_elt.uPopup(
                    op, function (_popup_elt) {

                        data.is_visible = flags.is_show;

                        $.uI.triggerEvent(
                            op, $.uMenu.key, null, _menu_elt,
                                data.options, [ _popup_elt, flags ]
                        );

                        if (_callback) {
                            _callback.call(menu_elt, _popup_elt, flags);
                        }
                    }
                );
            });
        },

        /**
         * This function is called whenever the mouse pointer moves
         * inside or outside of a menu item. If `_is_select` is true,
         * this function triggers the 'select' event, which in turn
         * provides visual feedback to the user. If `_is_select` is
         * false, this function triggers the 'unselect' event, and
         * removes the original visual feedback.
         */
        toggle_item: function (_menu_elt, _item_elt,
                               _is_select, _option_overrides) {

            var key = $.uMenu.key;
            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(_menu_elt);

            var item_elt = $(_item_elt);
            var item_data = data.items.toData(_item_elt);

            var default_callback = (
                _is_select ?
                    priv._default_select_item : priv._default_unselect_item
            );

            /* Submenu toggling:
                The creation of submenus is optionally delayed by a small
                span of time; creation of any submenu will be stopped if
                another item is selected before the delay timeout occurs.
                Submenu destruction is immediate, with no delay setting. */

            var select_fn = function () {
                if (item_data.is_delaying) {
                    priv.toggle_item_submenu(
                        _menu_elt, _item_elt, _is_select, _option_overrides
                    );
                }
            };

            if (item_data) {
                if (_is_select) {
                    item_data.is_delaying = true;
                    setTimeout(select_fn, data.options.delay);
                } else {
                    item_data.is_delaying = false;
                    priv.toggle_item_submenu(
                        _menu_elt, _item_elt, _is_select, _option_overrides
                    );
                }

                $.uI.triggerEvent(
                    (_is_select ? 'select' : 'unselect'),
                        key, default_callback, _menu_elt,
                        data.options, [ _item_elt ]
                );
            }
        },

        /**
         * This function is used by `toggle_item` to open or close a
         * submenu rooted at `_item_elt`. This function is fully
         * asynchronous, and can manage multiple overlapping `select`
         * and `unselect` operations.
         */
        toggle_item_submenu: function (_menu_elt, _item_elt,
                                       _is_select, _option_overrides) {
            var key = $.uMenu.key;
            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(_menu_elt);
            var options = $.extend(data.options, _option_overrides);

            var item_index = data.items.toIndex(_item_elt);
            var submenu_elt = data.active_submenus[item_index];

            if (!$.uI.hasValue(item_index)) {
                return false;
            }

            if (submenu_elt) {

                /* Stop currently-running animations:
                    If the submenu is already opening or closing, stop
                    its transition animation in order to take control. */

                submenu_elt.uMenu('stop');

                /* Fast path:
                    If the submenu is already constructed, but has been
                    hidden (e.g. by having `options.cache` set to false,
                    and then moving off of an item-with-submenu), all we
                    need to do is call the `show` method on the submenu. */

                var submenu_data = priv.instance_data_for(submenu_elt);

                if ((submenu_data || {}).is_cached && _is_select) {

                    submenu_elt.uMenu('show', function () {
                        submenu_data.is_cached = false;
                    });
                
                    return true;
                }
            }

            if (_is_select) {

                /* Selection case:
                    Show the submenu rooted at `item_elt`. */

                var submenu_elt = _item_elt.closestChild('.' + key);
                var arrow_elt = _item_elt.closestChild('.' + key + '-arrow');

                if (submenu_elt[0]) {
                    data.active_submenus[item_index] = submenu_elt.uMenu(
                        'create', arrow_elt, $.extend({}, options, {
                            hidden: true,
                            vertical: false,
                            direction: data.bias,
                            parentMenu: _menu_elt
                        })
                    );
                    submenu_elt.show();
                    priv.toggle(submenu_elt, { is_show: true });
                }

            } else {

                /* De-selection case:
                    Hide the submenu rooted at `item_elt`. */

                if (submenu_elt) {

                    var flags = { is_automatic: true };
                    var submenu_data = priv.instance_data_for(submenu_elt);

                    submenu_elt.uMenu('stop');
                    data.active_submenus[item_index] = submenu_elt;

                    if (submenu_data) {
                        submenu_data.is_animating = true;
                    }

                    submenu_elt.uMenu('hide', flags, function () {
                        if (options.cache) {
                            submenu_data.is_cached = true;
                        } else {
                            submenu_elt.uMenu('destroy', flags, function () {
                                submenu_data.is_cached = false;
                                submenu_data.is_animating = false;
                                delete data.active_submenus[item_index];
                            });
                        }
                    });
                }
            }

            return true;
        },

        /**
         * Modify the CSS classes of `_elt` to conform to the
         * directional bias data provided in `_bias`. For more
         * information on the bias value and its function, see
         * the uPopup documentation. The element `_elt` can be
         * either a menu or a menu item -- both have valid uses.
         */
        set_direction: function (_elt, _bias) {

            var key = $.uMenu.key;
            var r = '-right', l = '-left'

            _elt.removeClass(key + r + ' ' + key + l);

            if (_bias.x) {
                _elt.addClass(key + r);
            } else {
                _elt.addClass(key + l);
            }
        },

        /**
         * Find the uMenu instance at the root of `_submenu_elt`, by
         * following the menu's `parentMenu` option up to the root.
         * Once there, remove all of `_submenu_elt`'s immediate
         * children from the root's uSort instance. Note that this
         * function does *not* recur on `_submenu_elt`'s submenus --
         * it's intended for use inside of such traversals.
         */
        remove_submenu_sorting: function (_submenu_elt) {

            var key = $.uMenu.key;
            var submenu_elt = $(_submenu_elt);

            submenu_elt.uMenu('root').uSort(
                'remove', submenu_elt, {
                    items: submenu_elt.children('.' + key + '-item')
                }
            );
        },

        /**
         * Ensure that every item in `_menu_elt` is unselected.
         * Note that this function acts upon immediate child items
         * only; if you want to unselect all elements in a tree,
         * you must call this at each level.
         */
        unselect_all_items: function (_menu_elt) {

            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(_menu_elt);

            data.selected_item_elt = null;
            
            data.items.each(function (_i, _item_elt) {
                priv.toggle_item(_menu_elt, _item_elt, false);
            });

            return this;
        },

        /**
         * Query a uPopup instance provided in `_menu_elt` for its
         * current directional bias data. Use that instance's preferred
         * expansion direction to change the apparence of the arrow
         * symbols in the uMenu instance rooted at `this`. Return a
         * set of directional bias data to be used by the uPopup instance
         * rooted at `this`.
         */
        determine_popup_bias: function (_menu_elt)
        {
            var priv = $.uMenu.priv;
            var info = _menu_elt.uPopup('info')[0];

            if (info.direction) {
                priv.set_direction(this, info.direction);
            }

            /* Return bias data:
                uPopup uses this value to determine a preferred
                direction when expanding popups representing submenus. */

            return {
                x: (info.direction ? info.direction.x : 1)
            };
        },

        /**
         */
        is_leaf_item: function (_menu_elt, _item_elt) {

            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(_menu_elt);
            var item_index = data.items.toIndex(data.selected_item_elt);

            if (!item_index) {
                return undefined;
            }

            return !data.active_submenus[item_index];
        },

        /**
         * Default handler for item selection; uses a CSS class.
         * Override this by handling the 'select' event, or by
         * providing the onSelect callback.
         */
        _default_select_item: function (_item_elt) {

            $(_item_elt).addClass($.uMenu.key + '-selected');
        },

        /**
         * Default handler for unselecting items; uses a CSS class.
         */
        _default_unselect_item: function (_item_elt) {

            $(_item_elt).removeClass($.uMenu.key + '-selected');
        },

        /**
         * Event handler for uSort's `drag` event. This is called by uSort
         * when a sortable menu item is first picked up by the user.
         */
        _handle_sort_drag: function (_item_elt, _from_sortable_elt) {

            var priv = $.uMenu.priv;
            var menu_elt = _from_sortable_elt;

            var info = menu_elt.uPopup('info');
            var overlay_elt = _item_elt.uDrag('overlay');

            var data = priv.instance_data_for(menu_elt);
            var item_index = data.items.toIndex(_item_elt);

            /* Close subtree rooted at `_item_elt`:
                This prevents an item from being inserted in to its own
                subtree (which would be nonsense for a tree). Make sure
                we make all items unsortable first, to avoid a race. */

            var submenu_elt = data.active_submenus[item_index];

            if (submenu_elt) {
                priv.toggle_item(menu_elt, _item_elt, false, {
                    cache: false /* Force destruction */
                });
            }

            /* Set direction on draggable item:
                This keeps `_item_elt` pointing in the correct
                direction, even after uPopup reparents the element. */

            if (info && info[0]) {
                priv.set_direction(overlay_elt, info[0].direction);
            }

            return true;
        },

        /**
         * Event handler for uSort's `drop` event. This is called by
         * uSort when a sortable menu item is dropped anywhere.
         */
        _handle_sort_drop: function (_item_elt, _menu_elt, _to_menu_elt) {

            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(_menu_elt);

            _menu_elt.add(_to_menu_elt).uPopup('recalculate');

            return true;
        },

        /**
         * Event handler for uSort's `migrate` event, which is emitted
         * whenever a sortable item is dropped in a new containing element.
         * In this case, a menu item has been moved; we unbind it in one
         * menu instance and bind it in another, effectively transferring
         * it to another uMenu instance.
         */
        _handle_sort_migrate: function (_drop_elt, _from_elt, _to_elt) {

            var priv = $.uMenu.priv;

            priv.unbind_menu_items(_from_elt, _drop_elt);
            priv.bind_menu_items(this, _drop_elt);
        },

        /**
         * Event handler for uPopup's `reorient` event. This is called
         * by uPopup when the popup window changes position, in response
         * to a change in the available space on any side.
         */
        _handle_popup_reorient: function (_wrapper_elt) {

            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(this);

            if (data.options.usort) {
                this.uSort('recalculate');
            }
        },

        /**
         * Event handler for the uMenu container element, which holds
         * the entire set of uMenu items. This stops event propagation,
         * so that `_handle_document_mousedown` is not invoked later.
         */
        _handle_menu_mousedown: function (_ev) {

            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(this);

            _ev.stopPropagation();
            return false;
        },

        /**
         * Event handler for the document's mousedown event. This is
         * invoked whenever the user clicks anywhere outside of
         * a uMenu instance, and responds by closing the menu.
         */
        _handle_document_mousedown: function (_ev) {

            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(this);
            var method = (data.options.autoDestroy ? 'destroy' : 'hide');

            var hide_flags = { is_automatic: true };

            if (data.is_visible) {
                this.uMenu(method, hide_flags, function () {
                    this.css('display', null);
                });
            }

            return false;
        },

        /**
         * Event handler for the document's mouseover event. This
         * is invoked whenever the user moves anywhere outside of
         * a uMenu instance, and responds by unselecting leaf nodes.
         */
        _handle_document_mouseover: function (_ev) {

            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(this);
            var selected_item_elt = data.selected_item_elt;

            if (!selected_item_elt) {
                return false;
            }

            if (priv.is_leaf_item(this, selected_item_elt)) {
                priv.toggle_item(this, selected_item_elt, false);
                data.selected_item_elt = null;
            }

            return false;
        },

        /**
         * Handler for mouse click events occurring inside of
         * a uMenu item. This forwards the click event to callbacks
         * and/or event listeners, and then closes the menu.
         */
        _handle_item_click: function (_ev, _menu_elt) {

            var menu_elt = $(_menu_elt);

            var item_elt = this;
            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(_menu_elt);

            var is_finished = $.uI.triggerEvent(
                'click', $.uMenu.key, priv._handle_default_item_click,
                    menu_elt, data.options, [ item_elt ]
            );

            if (is_finished) {

                var f = { is_automatic: true };

                if (data.options.autoDestroy) {
                    menu_elt.uMenu('destroyAll', f);
                } else {
                    menu_elt.uMenu('root').uMenu('hide', f);
                }
            }

            return false;
        },

        /**
         * Default handler for mouse click events occuring inside
         * of a uMenu item. This handler closes the menu if and
         * only if it is a leaf node (i.e. has no submenus).
         */
        _handle_default_item_click: function (_item_elt) {

            var key = $.uMenu.key;
            var priv = $.uMenu.priv;
            var item_elt = $(_item_elt);
            var data = priv.instance_data_for(this);

            return (
                item_elt.hasClass(key + '-empty') &&
                    !item_elt.hasClass(key + '-disabled')
            );
        },

        /**
         * Handler for mouse-over events occurring inside of
         * a uMenu item. This changes the active menu item, if
         * the item under the mouse is not currently active.
         */
        _handle_item_mouseover: function (_ev, _menu_elt) {

            var priv = $.uMenu.priv;
            var data = priv.instance_data_for(_menu_elt);

            var item_elt = $(this);
            var menu_elt = $(_menu_elt);

            var should_skip_event = (
                data.is_animating ||
                  item_elt.hasClass($.uMenu.key + '-disabled') ||
                    (data.options.usort && menu_elt.uSort('isDragging'))
            );

            if (should_skip_event) {
                return false;
            }

            var current_elt = (
                data.selected_item_elt ?
                    data.selected_item_elt[0] : null
            );

            if (item_elt[0] !== current_elt) {

                if (data.selected_item_elt) {
                    priv.toggle_item(
                        _menu_elt, data.selected_item_elt, false
                    );
                }

                priv.toggle_item(_menu_elt, item_elt, true);
                data.selected_item_elt = item_elt;
            }

            return false;
        }
    };
 
    /** @!namespace priv */
    /** @!namespace $.uMenu */

    /** @namespace $.fn */

    $.fn.uMenu = function (/* const */_method /* , ... */) {

        /* Dispatch to appropriate method handler:
            Note that the `method` argument should always be a constant;
            never allow user-provided input to be used for the argument. */

        return $.uMenu.impl[_method].apply(
            this, Array.prototype.slice.call(arguments, 1)
        );
    };

    return $.uMenu;

}, jQuery);

/** @!namespace */


/**
 * @namespace $.uMenuBar:
 *  uMenuBar provides a set of clickable buttons, each of
 *  which is backed by its own pre-instansiated uMenu instance.
 *  When a button is clicked (or if a menu is already visible,
 *  hovered over), uMenuBar shows the appropriate uMenu instance
 *  and hides any others that may have been visible. This is useful
 *  for creating banks of pull-down style menus.
 */

$.uI.define('uMenuBar', function ($) {

    /** @namespace uMenuBar: */

    $.uMenuBar = {};
    $.uMenuBar.key = 'umenubar';

    /**
     * @namespace impl:
     *  This namespace contains public methods, which can be
     *  invoked by calling code via the `$.fn.uMenuBar` dispatch
     *  function.
     */
    $.uMenuBar.impl = {

        /**
         * Initializes one or more new lists of pull-down menus.
         * This class implements the show/hide logic necessary to
         * provide a set of pull-down menus; each menu item spawns
         * a hierarchical pop-up menu (with optional drag/drop).
         */
        create: function (_options) {

            var priv = $.uMenuBar.priv;

            var default_options = {};
            var options = $.extend(default_options, _options || {});

            this.each(function (_i, _list_elt) {

                var list_elt = $(_list_elt);
                var item_elts = options.items;
                var data = priv.create_instance_data(list_elt, options);

                switch (typeof(item_elts)) {
                    case 'function':
                        item_elts = item_elts.call(this, list_elt);
                        break;
                    case 'object':
                        item_elts = $(item_elts);
                        break;
                    default:
                    case 'string':
                        item_elts = list_elt.find(item_elts);
                        break;
                }

                priv.bind_menu_instances(list_elt, item_elts);
            });
        },

        /**
         * Destroy an instance of `uMenuBar`, and clean up any resources
         * that were allocated to it -- event handlers, instances of
         * other objects, and references to any DOM elements.
         */
        destroy: function () {

            var key = $.uMenuBar.key;
            var priv = $.uMenuBar.priv;
            var data = priv.instance_data_for(this);

            if (data) {
                data.items.untrackAll();
            }

            this.data(key, null);
            this.unbind('.' + key);
        }
    };

    /**
     * @namespace priv:
     *  This namespace contains non-public methods, each used
     *  privately as part of uMenuBar's underlying implementation.
     *  Please don't call these from outside of `$.uMenuBar.impl`.
     */
    $.uMenuBar.priv = {

        /**
         * Get the uMenu-specific private storage attached to `_elt`.
         */
        instance_data_for: function (_elt) {

            return $(_elt).data($.uMenuBar.key);
        },

        /**
         * Initialize private storage on the element _elt, setting
         * all private fields to their original default values. This
         * must be called before any sortables can be modified.
         */
        create_instance_data: function (_list_elt, _options) {

            var key = $.uMenuBar.key;
            var list_elt = $(_list_elt);

            list_elt.data(
                key, {
                    options: _options,
                    items: new $.uI.ElementIndex()
                }
            );

            return list_elt.data(key);
        },

        /**
         * Given a uMenuBar container element `_list_elt` -- and a list
         * of drop-down menu button elements in `_item_elts` -- construct
         * and cache a uMenu instance for each, and bind any needed events.
         */
        bind_menu_instances: function (_list_elt, _item_elts) {

            var key = $.uMenuBar.key;
            var priv = $.uMenuBar.priv;
            var data = priv.instance_data_for(_list_elt);

            $(_item_elts).each(function (_i, _item_elt) {

                var item_elt = $(_item_elt);
                var menu_elt = item_elt.find('.' + $.uMenu.key).first();
                var arrow_elt = item_elt.find('.' + key + '-arrow').first();

                item_elt.bind('mousedown.' + key, function (_ev) {
                    priv._handle_item_mousedown.call(
                        _list_elt, _ev, item_elt
                    );
                });

                item_elt.bind('mouseover.' + key, function (_ev) {
                    priv._handle_item_hover.call(_list_elt, _ev, item_elt);
                });

                menu_elt.uMenu('create', arrow_elt, {
                    hidden: true,
                    vertical: true,
                    autoDestroy: false,
                    classes: data.options.classes,
                    onHide: $.proxy(priv._handle_menu_hide, _list_elt),
                    sort: {
                        animate: true,
                        handle: data.options.handle,
                        classes: data.options.classes
                    }
                });

                data.items.track(_item_elt, {
                    item_elt: item_elt,
                    menu_elt: menu_elt,
                    arrow_elt: arrow_elt
                });
            });
        },

        /**
         */
        _handle_item_mousedown: function (_ev, _item_elt) {

            var priv = $.uMenuBar.priv;
            var hover = $.uMenuBar.key + '-hover';
            var data = priv.instance_data_for(this);
            var sel_item_elt = $(data._selected_item_elt);

            var item_elt = $(_item_elt);
            var item_data = data.items.toData(item_elt);

            if (sel_item_elt[0] && sel_item_elt[0] == item_elt[0]) {

                var sel_item_data = data.items.toData(sel_item_elt);

                sel_item_data.menu_elt.uMenu('hide')
                data._selected_item_elt.removeClass(hover);
                data._selected_item_elt = null;
                
            } else {

                item_data.menu_elt.uMenu('show');
                item_elt.addClass(hover);
                data._selected_item_elt = item_elt;
            }

            _ev.stopPropagation();
        },

        /**
         */
        _handle_item_hover: function (_ev, _item_elt) {

            var priv = $.uMenuBar.priv;
            var data = priv.instance_data_for(this);

            var item_elt = $(_item_elt);
            var sel_item_elt = $(data._selected_item_elt);

            if (sel_item_elt[0] && sel_item_elt[0] != item_elt[0]) {

                var hover = $.uMenuBar.key + '-hover';
                var item_data = data.items.toData(item_elt);
                var sel_item_data = data.items.toData(sel_item_elt);
             
                /* Check drag state of currently-selected uMenu:
                    If the user is dragging an element from inside 
                    the currently-active uMenu that we're hosting, then 
                    ignore hover events to avoid undesired menu closure. */

                if (sel_item_data.menu_elt.uSort('isDragging')) {
                    return;
                }

                sel_item_data.menu_elt.uMenu('hide')
                data._selected_item_elt.removeClass(hover);

                item_elt.addClass(hover);
                item_data.menu_elt.uMenu('show');
                data._selected_item_elt = item_elt;
            }
        },

        /**
         */
        _handle_menu_hide: function (_hide_elt, _flags) {

            var priv = $.uMenuBar.priv;
            var data = priv.instance_data_for(this);

            /* Determine source:
                If hide was invoked by uMenu -- and not us --
                then `_flags.is_automatic` will be true. If not,
                the flag is false, indicating we called it. */

            if (_flags.is_automatic) {

                data._selected_item_elt.removeClass(
                    $.uMenuBar.key + '-hover'
                );

                data._selected_item_elt = null;
            }
        }

    };
 
    /** @!namespace priv */
    /** @!namespace $.uMenuBar */

    /** @namespace $.fn */

    $.fn.uMenuBar = function (/* const */_method /* , ... */) {

        /* Dispatch to appropriate method handler:
            Note that the `method` argument should always be a constant;
            never allow user-provided input to be used for the argument. */

        return $.uMenuBar.impl[_method].apply(
            this, Array.prototype.slice.call(arguments, 1)
        );
    };

    return $.uMenuBar;

}, jQuery);

