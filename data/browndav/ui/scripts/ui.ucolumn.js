/*global window: false, jQuery: false*/
/**
 * uColumn:
 *  A multi-column resize/sort behaviour for jQuery
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
 * @namespace $.uColumn:
 */

$.uI.define('uColumn', function ($) {

    $.uColumn = {};
    $.uColumn.key = 'ucolumn';

    /**
     * @namespace impl:
     *  This namespace contains public methods, which can be
     *  invoked by calling code via the `$.fn.uColumn` dispatch
     *  function.
     */
    $.uColumn.impl = {

        /**
         */
        create: function (_options) {

            var priv = $.uColumn.priv;
            var options = (_options || {});

            this.each(function (_i, _elt) {

                var elt = $(_elt);
                var data = priv.create_instance_data(elt, options);

                priv.bind_resize_elements(elt, options);
                priv.bind_sort_elements(elt, options);
            });

            return this;
        },

        /**
         */
        destroy: function () {

            var key = $.uColumn.key;
            var priv = $.uColumn.priv;

            this.each(function (_i, _elt) {

                var elt = $(_elt);
                var data = priv.instance_data_for(elt);

                priv.unbind_sort_elements(_elt);
                priv.unbind_resize_elements(_elt);

                elt.unbind('.' + key, null);
                elt.data(key, null);
            });

            return this;
        }

    };

    /** @!namespace impl */

    /**
     * @namespace priv:
     *  This namespace contains non-public methods, each used
     *  privately as part of uColumn's underlying implementation.
     *  Please don't call these from outside of `$.uColumn.impl`.
     */
    $.uColumn.priv = {

        /**
         * Get the uColumn-specific private storage attached to `_elt`.
         */
        instance_data_for: function (_elt) {

            return $(_elt).data($.uColumn.key);
        },

        /**
         * Initialize private storage on the element `_elt`,
         * setting all private fields to their original default
         * values. This must be called before any resize controls
         * can be modified.
         */
        create_instance_data: function (_elt, _options) {

            var key = $.uColumn.key;

            _elt.data(key, {
                header_elts: null,
                options: _options,
                handle_elt_sets: [],
                units: (_options.units || '%'),
                collapse: !!(_options.collapse),
                collapse_in_reverse: !!(
                    (_options.collapse || '').toString().match(/^r/)
                ),
                is_vertical: !!(
                    (_options.orientation || '').match(/^v/)
                )
            });

            return _elt.data(key);
        },

        /**
         */
        bind_resize_elements: function (_elt, _options) {

            var priv = $.uColumn.priv;
            var data = priv.instance_data_for(_elt);
            var header_elts = priv.find_elements(_elt, _options.header);

            for (var i = 0, len = header_elts.length; i < len; ++i) {

                var header_elt = $(header_elts[i]);
                var after_elts = header_elts.slice(i + 1);
                var before_elts = header_elts.slice(0, i + 1);

                var handle_elts = $(
                    priv.find_elements(
                        header_elt, _options.handle, [], _elt
                    )
                ); 

                var in_rev = data.collapse_in_reverse;
                var fn = (in_rev ? $.uI.arrayFirst : $.uI.arrayLast);
                var after_key = (data.is_vertical ? 'below' : 'after');
                var before_key = (data.is_vertical ? 'above' : 'before');

                var items = {};
                var elt_lists = [];

                items[before_key] = fn.call(null, before_elts);
                items[after_key] = fn.call(null, after_elts);

                if (data.collapse) {

                    elt_lists = [
                        new $.uSize.ElementList(
                            in_rev ? after_elts : after_elts.reverse()
                        ),
                        new $.uSize.ElementList(
                            in_rev ? before_elts : before_elts.reverse()
                        )
                    ];
                }

                var iterator = new $.uSize.Iterator(elt_lists);

                data.handle_elt_sets.push(
                    handle_elts.uSize('create', iterator.extend(
                        $.extend({}, (_options.usize || {}), {
                            resize: items,
                            units: data.units
                        })
                    ))
                );
            }

            data.header_elts = header_elts;
            return this;
        },

        /**
         */
        unbind_resize_elements: function (_elt) {

            var priv = $.uColumn.priv;
            var data = priv.instance_data_for(_elt);
            var handle_elt_sets = data.handle_elt_sets;

            for (var i = 0, len = handle_elt_sets.length; i < len; ++i) {
                handle_elt_sets[i].uSize('destroy');
            }

            return this;
        },

        /**
         */
        recreate_resize_elements: function (_elt) {

            var priv = $.uColumn.priv;
            var data = priv.instance_data_for(_elt);

            priv.unbind_resize_elements(_elt);
            priv.bind_resize_elements(_elt, data.options);

            return this;
        },

        /**
         */
        bind_sort_elements: function (_elt, _options) {

            var priv = $.uColumn.priv;
            var data = priv.instance_data_for(_elt);

            _elt.uSort('create', $.extend({}, (_options.usort || {}), {
                animate: true,
                items: data.header_elts,
                orientation: 'horizontal',
                onDrop: priv._handle_sort_drop
            }));

            return this;
        },

        /**
         */
        unbind_sort_elements: function (_elt) {

            var priv = $.uColumn.priv;
            var data = priv.instance_data_for(_elt);

            _elt.uSort('destroy');
        },

        /**
         */
        find_elements: function (_elt, _selector, _fn_args, _fn_this) {

            var rv = [];
            var elt = $(_elt);

            if (!_fn_this) {
                _fn_this = elt;
            }

            if ($.isFunction(_selector)) {
                _selector = _selector.apply(_fn_this, (_fn_args || []));
            }

            if (typeof(_selector) === 'string') {
                _selector = elt.find(_selector);
            }

            $(_selector).each(function (_i, _sel_elt) {
                if ($.uI.isAncestor(_sel_elt, elt)) {
                    rv.push(_sel_elt);
                }
            });

            return rv;
        },

        /**
         */
        _handle_sort_drop: function (_drag_elt, _from, _to) {

            var priv = $.uColumn.priv;
            var data = priv.instance_data_for(this);

            priv.recreate_resize_elements(this);

            return $.uI.triggerEvent(
                'drop', $.uColumn.key, true, this,
                    data.options, [ _drag_elt, _from, _to ]
            );
        }
    };

    /** @!namespace priv */


    /** @!namespace $.uColumn */
    /** @namespace $.fn */

    $.fn.uColumn = function (/* const */ _method /* , ... */) {

        /* Dispatch to appropriate method handler:
            Note that the `method` argument should always be a constant;
            never allow user-provided input to be used for the argument. */

        return $.uColumn.impl[_method].apply(
            this, Array.prototype.slice.call(arguments, 1)
        );
    };

    /** @!namespace $.fn */

    return $.uColumn;

}, jQuery);

/** @!namespace */


