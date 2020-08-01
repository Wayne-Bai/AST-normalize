/**
 * @package   	JCE
 * @copyright 	Copyright (c) 2009-2015 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */

// String functions
(function ($) {
    // set standalone flag
    var standalone = true;

    // check for tinyMCEPopup
    if (window.tinyMCEPopup) {
        var TinyMCE_Utils = {};

        TinyMCE_Utils.fillClassList = function (id) {
            var ed = tinyMCEPopup.editor, lst = document.getElementById(id), v, cl;

            if (v = tinyMCEPopup.getParam('theme_advanced_styles')) {
                cl = [];

                tinymce.each(v.split(';'), function (v) {
                    var p = v.split('=');

                    cl.push({'title': p[0], 'class': p[1]});
                });

            } else {
                cl = ed.dom.getClasses();
            }

            tinymce.each(['jcepopup', 'jcetooltip'], function (o) {
                lst.options[lst.options.length] = new Option(o, o);
            });

            if (cl.length > 0) {
                tinymce.each(cl, function (o) {
                    lst.options[lst.options.length] = new Option(o.title || o['class'], o['class']);
                });

            }
        };

        TinyMCE_Utils.updateColor = function (parent) {
            if (typeof parent == 'string') {
                parent = document.getElementById(parent);
            }
            document.getElementById(parent.id + '_pick').style.backgroundColor = parent.value;
        };

        TinyMCE_Utils.addClassesToList = function (list_id, specific_option) {
            // Setup class droplist
            var styleSelectElm = document.getElementById(list_id);
            var styles = tinyMCEPopup.getParam('theme_advanced_styles', false);
            styles = tinyMCEPopup.getParam(specific_option, styles);

            if (styles) {
                var stylesAr = styles.split(';');

                for (var i = 0; i < stylesAr.length; i++) {
                    if (stylesAr != "") {
                        var key, value;

                        key = stylesAr[i].split('=')[0];
                        value = stylesAr[i].split('=')[1];

                        styleSelectElm.options[styleSelectElm.length] = new Option(key, value);
                    }
                }
            } else {
                tinymce.each(tinyMCEPopup.editor.dom.getClasses(), function (o) {
                    styleSelectElm.options[styleSelectElm.length] = new Option(o.title || o['class'], o['class']);
                });
            }
        };

        this.TinyMCE_Utils = TinyMCE_Utils;

        standalone = false;
    }

    var $tmp = document.createElement('div');

    // check for canvas
    $.support.canvas = !!document.createElement('canvas').getContext;
    // check for background size
    $.support.backgroundSize = (function () {
        var s = false;
        $.each(['backgroundSize', 'MozBackgroundSize', 'WebkitBackgroundSize', 'OBackgroundSize'], function () {
            if (typeof $tmp.style[this] !== 'undefined') {
                s = true;
            }
        });

        return s;
    })();

    /* http://downloads.beninzambia.com/blog/acrobat_detection.js.txt
     * Modified for our purposes
     */
    $.support.pdf = (function () {
        try {
            // IE
            if (!$.support.cssFloat) {
                var control = null;

                //
                // load the activeX control
                //                
                try {
                    // AcroPDF.PDF is used by version 7 and later
                    control = new ActiveXObject('AcroPDF.PDF');
                }
                catch (e) {
                }

                if (!control) {
                    try {
                        // PDF.PdfCtrl is used by version 6 and earlier
                        control = new ActiveXObject('PDF.PdfCtrl');
                    }
                    catch (e) {
                    }
                }

                return control ? true : false;

            } else if (navigator.plugins) {
                for (var n in navigator.plugins) {
                    if (n == 'Adobe Acrobat') {
                        return true;
                    }

                    if (navigator.plugins[n].name && (navigator.plugins[n].name == 'Adobe Acrobat' || navigator.plugins[n].name == 'Chrome PDF Viewer')) {
                        return true;
                    }
                }
            } else if (navigator.mimeTypes) {
                // from PDFObject - https://github.com/pipwerks/PDFObject
                var mime = navigator.mimeTypes["application/pdf"];

                if (mime && mime.enabledPlugin) {
                    return true;
                }
            }
        }
        catch (e) {
        }

        return false;
    })();

    /*
     * From Modernizr v2.0.6
     * http://www.modernizr.com
     * Copyright (c) 2009-2011 Faruk Ates, Paul Irish, Alex Sexton
     */
    $.support.video = (function () {
        var el = document.createElement('video'), bool = false;
        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if (bool = !!el.canPlayType) {
                bool = new Boolean(bool);
                bool.ogg = el.canPlayType('video/ogg; codecs="theora"');

                // Workaround required for IE9, which doesn't report video support without audio codec specified.
                //   bug 599718 @ msft connect
                var h264 = 'video/mp4; codecs="avc1.42E01E';
                bool.mp4 = el.canPlayType(h264 + '"') || el.canPlayType(h264 + ', mp4a.40.2"');

                bool.webm = el.canPlayType('video/webm; codecs="vp8, vorbis"');
            }

        } catch (e) {
        }

        return bool;
    })();

    /*
     * From Modernizr v2.0.6
     * http://www.modernizr.com
     * Copyright (c) 2009-2011 Faruk Ates, Paul Irish, Alex Sexton
     */
    $.support.audio = (function () {
        var el = document.createElement('audio'), bool = false;

        try {
            if (bool = !!el.canPlayType) {
                bool = new Boolean(bool);
                bool.ogg = el.canPlayType('audio/ogg; codecs="vorbis"');
                bool.mp3 = el.canPlayType('audio/mpeg;');

                // Mimetypes accepted:
                //   https://developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   http://bit.ly/iphoneoscodecs
                bool.wav = el.canPlayType('audio/wav; codecs="1"');
                bool.m4a = el.canPlayType('audio/x-m4a;') || el.canPlayType('audio/aac;');
                bool.webm = el.canPlayType('audio/webm; codecs="vp8, vorbis"');
            }
        } catch (e) {
        }

        return bool;
    })();

    $.Plugin = {
        i18n: {},
        language: '',
        options: {
            selectChange: $.noop,
            site: '',
            root: '',
            help: $.noop,
            alerts: ''
        },
        getURI: function (absolute) {
            if (!standalone) {
                return tinyMCEPopup.editor.documentBaseURI.getURI(absolute);
            }

            return (absolute) ? this.options.root : this.options.site;
        },
        init: function (options) {
            var self = this;

            $.extend(this.options, options);

            // add browser flags
            /*if ($.browser.webkit) {
             $('#jce').addClass('webkit');
             }
             
             if ($.browser.opera) {
             $('#jce').addClass('opera');
             }
             
             if ($.browser.msie) {
             $('#jce').addClass('ie');
             }
             
             if ($.browser.gecko) {
             $('#jce').addClass('gecko');
             }*/

            // ie8 flag
            if (!$.support.cssFloat && document.querySelector) {
                $('#jce').addClass('ie8');
            }

            // create buttons
            $('button#insert, input#insert, button#update, input#update').button({
                icons: {
                    primary: 'ui-icon-check'
                }
            });

            $('button#refresh, input#refresh').button({
                icons: {
                    primary: 'ui-icon-refresh'
                }
            });

            // add button actions
            $('button#cancel, input#cancel').button({
                icons: {
                    primary: 'ui-icon-close'
                }
            });

            // go no further if standalone
            if (standalone) {
                return;
            }

            $('button#apply, input#apply').button({
                icons: {
                    primary: 'ui-icon-plus'
                }
            });

            $('button#help, input#help').button({
                icons: {
                    primary: 'ui-icon-help'
                }
            });

            // add button actions
            $('button#cancel, input#cancel').click(function (e) {
                tinyMCEPopup.close();
                e.preventDefault();
            });

            // show body
            $('#jce').addClass('ui-widget-content');

            // activate tabs - add activate function to fix bc issue with new JQuery UI
            $('#tabs').tabs({
                activate: function (e, ui) {
                    $(ui.newPanel).removeClass('ui-tabs-hide').siblings('.ui-tabs-panel').addClass('ui-tabs-hide');
                }
            });

            // create colout picker widgets
            this.createColourPickers();
            // create browser widgets
            this.createBrowsers();

            // activate editable select lists
            $('select.editable, select.mceEditableSelect').combobox({
                label: self.translate('select_label', 'Add Value'),
                change: this.options.change
            });

            // activate tooltips
            $('.hastip, .tip, .tooltip').tips();

            this._formWidgets();
        },
        /**
         * HTML5 form widgets
         */
        _formWidgets: function () {
            var self = this;

            $('input[placeholder], textarea[placeholder]').placeholder();

            $(':input[pattern]').pattern();

            $(':input[max]').max();

            $(':input[min]').min();
        },
        getName: function () {
            return $('body').data('plugin');
        },
        getPath: function (plugin) {
            if (!standalone) {
                return tinyMCEPopup.getParam('site_url') + 'components/com_jce/editor/tiny_mce/plugins/' + this.getName();
            }

            return this.options.site + 'components/com_jce/editor/tiny_mce/plugins/' + this.getName();
        },
        loadLanguage: function () {
            if (!standalone) {
                var ed = tinyMCEPopup.editor, u = ed.getParam('document_base_url') + 'components/com_jce/editor/tiny_mce';

                if (u && ed.settings.language && ed.settings.language_load !== false) {
                    u += '/langs/' + ed.settings.language + '_dlg.js';

                    if (!tinymce.ScriptLoader.isDone(u)) {
                        document.write('<script type="text/javascript" src="' + tinymce._addVer(u) + '"></script>');
                        tinymce.ScriptLoader.markDone(u);
                    }
                }
            }
        },
        help: function () {
            if (!standalone) {
                var ed = tinyMCEPopup.editor;

                ed.windowManager.open({
                    url: tinyMCEPopup.getParam('site_url') + 'index.php?option=com_jce&view=help&tmpl=component&lang=' + ed.settings.language + '&section=editor&category=' + this.getName(),
                    width: 768,
                    height: 560,
                    resizable: 1,
                    inline: 1,
                    close_previous: 0
                });
            } else {
                this.options.help.call(this, this.getName());
            }
        },
        setDimensions: function (wo, ho, prefix) {
            prefix = prefix || '';

            var w = $('#' + prefix + wo).val();
            var h = $('#' + prefix + ho).val();

            if (!w || !h)
                return;

            // Get tmp values
            var th = $('#' + prefix + 'tmp_' + ho).val();
            var tw = $('#' + prefix + 'tmp_' + wo).val();

            // tmp values must be set
            if (th && tw) {
                if ($('#' + prefix + 'constrain').is(':checked')) {
                    var temp = (w / $('#' + prefix + 'tmp_' + wo).val()) * $('#' + prefix + 'tmp_' + ho).val();
                    h = temp.toFixed(0);
                    $('#' + prefix + ho).val(h);
                }
            }
            // set tmp values
            $('#' + prefix + 'tmp_' + ho).val(h);
            $('#' + prefix + 'tmp_' + wo).val(w);
        },
        setDefaults: function (s) {
            var n, v;

            for (n in s) {
                v = s[n];

                if (v == 'default') {
                    v = '';
                }

                if ($('#' + n).is(':checkbox')) {
                    $('#' + n).prop('checked', parseFloat(v));//.change();
                } else {
                    $('#' + n).val(v);//.change();
                }
            }
        },
        setClasses: function (v, n) {
            n = n || 'classes';

            var $tmp = $('<span/>').addClass($('#' + n).val()).addClass(v);

            $('#' + n).val($tmp.attr('class'));
        },
        createColourPickers: function () {
            var self = this, ed = tinyMCEPopup.editor, doc = ed.getDoc();

            $('input.color').each(function () {
                var id = $(this).attr('id');
                var ev = $(this).get(0).onchange;

                var $picker = $('<span role="button" class="pickcolor_icon" title="' + self.translate('browse') + '" id="' + id + '_pick"></span>').insertAfter(this).toggleClass('disabled', $(this).is(':disabled')).attr('aria-disabled', function () {
                    return $(this).hasClass('disabled');
                });

                $(this).bind('pick', function () {
                    $(this).next('span.pickcolor_icon').css('background-color', $(this).val());
                });

                $(this).change(function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    $(this).trigger('pick');

                    if ($.isFunction(ev)) {
                        ev.call(this);
                    }
                });

                // get stylesheets form editor
                var stylesheets = [];

                if (doc.styleSheets.length) {
                    $.each(doc.styleSheets, function (i, s) {
                        // only load template stylesheets, not from tinymce plugins
                        if (s.href && s.href.indexOf('tiny_mce') == -1) {
                            stylesheets.push(s);
                        }
                    });
                }

                var settings = $.extend(ColorPicker.settings, {
                    widget: $picker,
                    labels: {
                        picker_tab: 'Picker',
                        title: 'Color Picker',
                        palette_tab: 'Palette',
                        palette: 'Web Colors',
                        named_tab: 'Named',
                        named: 'Named Colors',
                        template_tab: 'Template',
                        template: 'Template Colors',
                        //custom: 'Custom Colors',
                        color: 'Color',
                        apply: 'Apply',
                        name: 'Name'
                    },
                    stylesheets: stylesheets,
                    custom_colors: ed.getParam('colorpicker_custom_colors', '')
                });

                $(this).colorpicker(settings);
            });
        },
        createBrowsers: function () {
            var self = this;
            $('input.browser').each(function () {
                var input = this, type = $(this).hasClass('image') ? 'image' : 'file';

                var ev = $(this).get(0).onchange;

                $('<span role="button" class="browser_icon" title="' + self.translate('browse') + '"></span>').click(function () {
                    return tinyMCEPopup.openBrowser($(input).attr('id'), type, 'file_browser_callback');
                }).insertAfter(this);

                $(this).get(0).onchange = function () {
                    if ($.isFunction(ev)) {
                        ev.call(this);
                    }
                };

            });

        },
        getLanguage: function () {
            if (!this.language) {
                var s = $('body').attr('lang') || 'en';

                if (s.length > 2) {
                    s = s.substr(0, 2);
                }

                this.language = s;
            }

            return this.language;
        },
        /**
         * Resize o to fit into container c
         * @param {Object} o Width / Height Object pair
         * @param {Object} c Width / Height Object pair
         */
        sizeToFit: function (o, c) {
            var x = c.width;
            var y = c.height;
            var w = o.width;
            var h = o.height;

            var ratio = x / w;

            if (w / h > ratio) {
                h = h * (x / w);
                w = x;
                if (h > y) {
                    w = w * (y / h);
                    h = y;
                }
            } else {
                w = w * (y / h);
                h = y;
                if (w > x) {
                    h = h * (x / w);
                    w = x;
                }
            }

            return {
                width: Math.round(w),
                height: Math.round(h)
            };
        },
        /**
         * Adds a language pack, this gets called by the loaded language files like en.js.
         *
         * @method addI18n
         * @param {String} p Prefix for the language items. For example en.myplugin
         * @param {Object} o Name/Value collection with items to add to the language group.
         * @source TinyMCE EditorManager.js
         * @copyright Copyright 2009, Moxiecode Systems AB
         * @licence GNU / LGPL 2 - http://www.gnu.org/copyleft/lesser.html
         *
         * Modified for JQuery
         */
        addI18n: function (p, o) {
            var i18n = this.i18n;

            if ($.type(p) == 'string') {
                $.each(o, function (k, o) {
                    i18n[p + '.' + k] = o;
                });
            } else {
                $.each(p, function (lc, o) {
                    $.each(o, function (g, o) {
                        $.each(o, function (k, o) {
                            if (g === 'common')
                                i18n[lc + '.' + k] = o;
                            else
                                i18n[lc + '.' + g + '.' + k] = o;
                        });

                    });

                });
            }
        },
        translate: function (s, ds) {
            if (!standalone) {
                return tinyMCEPopup.getLang('dlg.' + s, ds);
            }

            if (!$.isPlainObject(this.i18n))
                this.i18n = {};

            return this.i18n[this.getLanguage() + '.dlg.' + s] || ds;
        }

    };

    /**
     * Cookie Functions
     */
    $.Cookie = {
        /**
         * Gets the raw data of a cookie by name.
         *
         * @method get
         * @param {String} n Name of cookie to retrive.
         * @return {String} Cookie data string.
         * @copyright Copyright 2009, Moxiecode Systems AB
         * @licence GNU / LGPL - http://www.gnu.org/copyleft/lesser.html
         */
        get: function (n, s) {
            var c = document.cookie, e, p = n + "=", b, v;

            // Strict mode
            if (!c) {
                return s;
            }

            b = c.indexOf("; " + p);

            if (b == -1) {
                b = c.indexOf(p);

                if (b != 0) {
                    return s;
                }
            } else {
                b += 2;
            }
            e = c.indexOf(";", b);

            if (e == -1) {
                e = c.length;
            }

            v = unescape(c.substring(b + p.length, e));

            if (typeof v == 'undefined') {
                return s;
            }

            return v;
        },
        /**
         * Sets a raw cookie string.
         *
         * @method set
         * @param {String} n Name of the cookie.
         * @param {String} v Raw cookie data.
         * @param {Date} e Optional date object for the expiration of the cookie.
         * @param {String} p Optional path to restrict the cookie to.
         * @param {String} d Optional domain to restrict the cookie to.
         * @param {String} s Is the cookie secure or not.
         * @copyright Copyright 2009, Moxiecode Systems AB
         * @licence GNU / LGPL - http://www.gnu.org/copyleft/lesser.html
         */
        set: function (n, v, e, p, d, s) {
            document.cookie = n + "=" + escape(v) +
                    ((e) ? "; expires=" + e.toGMTString() : "") +
                    ((p) ? "; path=" + escape(p) : "") +
                    ((d) ? "; domain=" + d : "") +
                    ((s) ? "; secure" : "");
        }

    };

    /**
     * JSON XHR
     */
    $.JSON = {
        queue: function (o) {
            var _old = o.complete;

            o.complete = function () {
                if (_old)
                    _old.apply(this, arguments);
            };

            $([$.JSON.queue]).queue("ajax", function () {
                window.setTimeout(function () {
                    $.ajax(o);
                }, 500);

            });

            $.dequeue($.JSON.queue, "ajax");
        },
        /**
         * Send JSON request
         *
         * @param func
         *            Function name to execute by the server
         * @param args
         *            String, Array or Object containing arguments to
         *            send
         * @param callback
         *            Callback function to execute
         * @param scope
         *            Scope to execute callback in
         */
        request: function (func, data, callback, scope) {
            var json = {
                'fn': func
            };

            callback = callback || $.noop;

            // additional POST data to add (will not be parsed by PHP json parser)
            var args = {
                'format': 'raw'
            };

            // get form input data (including token)
            var fields = $(':input', 'form').serializeArray();

            $.each(fields, function (i, field) {
                args[field.name] = field.value;
            });

            // if data is a string or array
            if ($.type(data) === 'string' || $.type(data) === 'array') {
                $.extend(json, {
                    'args': $.type(data) === 'string' ? $.String.encodeURI(data) : $.map(data, function (s) {
                        if (s && $.type(s) === 'string') {
                            return $.String.encodeURI(s);
                        }

                        return s;
                    })

                });
            } else {
                // if data is an object
                if ($.type(data) === 'object' && data.json) {
                    $.extend(json, {
                        'args': data.json
                    });

                    delete data.json;
                }

                $.extend(args, data);
            }

            var url = document.location.href;

            // strip token
            url = url.replace(/&wf([a-z0-9]+)=1/, '');

            function showError(e) {
                var txt = $.type(e) === 'array' ? e.join('\n') : e;
                // remove linebreaks
                txt = txt.replace(/<br([^>]+?)>/, '');
                // show error
                $.Dialog.alert(txt);
            }
            /**
             * Test if valid JSON string
             * https://github.com/douglascrockford/JSON-js/blob/master/json2.js
             * @param {string} s
             * @return {boolean}
             */
            function isJSON(s) {
                return /^[\],:{}\s]*$/
                        .test(s.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                                .replace(/(?:^|:|,)(?:\s*\[)+/g, ''));
            }

            $.JSON.queue({
                context: scope || this,
                type: 'POST',
                url: url,
                data: 'json=' + $.JSON.serialize(json) + '&' + $.param(args),
                dataType: 'text',
                success: function (o) {
                    var r;

                    if (o) {
                        // check result - should be object, parse as JSON if string
                        if ($.type(o) === 'string' && isJSON(o)) {
                            // parse string as JSON object
                            var s = $.parseJSON(o);
                            // pass if successful
                            if (s) {
                                o = s;
                            }
                        }

                        // process object result
                        if ($.isPlainObject(o)) {
                            if (o.error) {
                                showError(o.text || o.error || '');
                            }

                            r = o.result || null;

                            if (r && r.error && r.error.length) {
                                showError(r.error);
                            }
                            // show error
                        } else {
                            showError(o);
                        }
                    } else {
                        o = {'error': ''};
                    }

                    if ($.isFunction(callback)) {
                        callback.call(scope || this, r);
                    } else {
                        return r;
                    }
                },
                error: function (e, txt, status) {
                    $.Dialog.alert(status || ('SERVER ERROR - ' + txt.toUpperCase()));
                }

            });
        },
        serialize: function (o) {
            return JSON.stringify(o);
        }

    },
    $.URL = {
        toAbsolute: function (url) {
            if (!standalone) {
                return tinyMCEPopup.editor.documentBaseURI.toAbsolute(url);
            }

            if (/http(s)?:\/\//.test(url)) {
                return url;
            }
            return $.Plugin.getURI(true) + url.substr(0, url.indexOf('/'));
        },
        toRelative: function (url) {
            if (!standalone) {
                return tinyMCEPopup.editor.documentBaseURI.toRelative(url);
            }

            if (/http(s)?:\/\//.test(url)) {
                return url.substr(url.indexOf('/'));
            }

            return url;
        }

    },
    /**
     * Dialog Functions
     */
    $.Dialog = {
        counter: 0,
        _uid: function (p) {
            return (!p ? 'wf_' : p) + (this.counter++);
        },
        /**
         * Basic Dialog
         */
        dialog: function (title, data, options) {
            var div = document.createElement('div');

            options = $.extend(options, {
                minWidth: options.minWidth || options.width || 300,
                minHeight: options.minHeight || options.height || 150,
                modal: (typeof options.modal === 'undefined') ? true : options.modal,
                open: function () {
                    // adjust modal
                    $(div).dialog('widget').next('div.ui-widget-overlay').css({
                        width: '100%',
                        height: '100%'
                    });

                    // fix buttons
                    $('div.ui-dialog-buttonset button[icons]', $(div).dialog('widget')).each(function () {
                        var icon = $(this).attr('icons');

                        $(this).prepend('<span class="ui-button-icon-primary ui-icon ' + icon + '"/>');
                    }).addClass('ui-button-text-icon-primary').removeClass('ui-button-text-only');

                    if ($.isFunction(options.onOpen)) {
                        options.onOpen.call();
                    }
                },
                close: function () {
                    $(this).dialog('destroy').remove();
                }

            });

            $(div).attr({
                'title': title,
                id: options.id || 'dialog' + this._uid()
            }).append(data).dialog(options);

            return div;
        },
        /**
         * Confirm Dialog
         */
        confirm: function (s, cb, options) {
            var html = '<div class="confirm"><span class="icon"></span>' + s + '</div>';

            options = $.extend({
                resizable: false,
                buttons: [{
                        text: $.Plugin.translate('yes', 'Yes'),
                        icons: {
                            primary: 'ui-icon-check'
                        },
                        click: function () {
                            cb.call(this, true);
                            $(this).dialog("close");
                        }

                    }, {
                        text: $.Plugin.translate('no', 'No'),
                        icons: {
                            primary: 'ui-icon-close'
                        },
                        click: function () {
                            cb.call(this, false);
                            $(this).dialog("close");
                        }

                    }]
            }, options);

            return $.Dialog.dialog($.Plugin.translate('confirm', 'Confirm'), html, options);
        },
        /**
         * Alert Dialog
         */
        alert: function (s) {
            var html = '<div class="alert"><span class="icon"></span>' + s + '</div>';

            var options = {
                resizable: false,
                buttons: [{
                        text: $.Plugin.translate('ok', 'OK'),
                        click: function () {
                            $(this).dialog("close");
                        }
                    }]
            };

            return $.Dialog.dialog($.Plugin.translate('alert', 'Alert'), html, options);
        },
        /**
         * Prompt Dialog
         */
        prompt: function (title, options) {
            var html = '<p>';

            var id = options.id || 'dialog-prompt', name = options.name || 'prompt', v = options.value || '';

            if (options.text) {
                html += '<label for="' + id + '">' + options.text + '</label>';
            }
            if (options.multiline) {
                html += '<textarea id="' + id + '" style="width:200px;height:75px;">' + v + '</textarea>';
            } else {
                html += '<input id="' + id + '" name="' + name + '" type="text" value="' + v + '" style="width:200px;" />';
            }

            html += '</p>';

            if (options.elements) {
                html += options.elements;
            }

            options = $.extend({
                resizable: false,
                width: 320,
                buttons: [{
                        text: $.Plugin.translate('ok', 'Ok'),
                        icons: {
                            primary: 'ui-icon-check'
                        },
                        click: function () {
                            if ($.isFunction(options.confirm)) {
                                options.confirm.call(this, $('#' + id).val());
                            } else {
                                $(this).dialog("close");
                            }
                        }

                    }],
                onOpen: function () {
                    $('#' + options.id).focus();
                }

            }, options);

            return $.Dialog.dialog(title, html, options);
        },
        /**
         * Upload Dialog
         */
        upload: function (options) {
            var div = document.createElement('div');

            $(div).attr('id', 'upload-body').append(
                    '<div id="upload-queue-block">' +
                    '		<ul id="upload-queue"><li style="display:none;"></li></ul>' +
                    '	<input type="hidden" id="upload-dir" name="upload-dir" />' +
                    '	<input type="file" name="file" size="40" style="position:relative;" />' +
                    '</div>' +
                    '<div id="upload-options"></div>'
                    );

            $(div).find('#upload-options').append(options.elements);

            options = $.extend({
                minWidth: 460,
                minHeight: 350,
                resizable: false,
                buttons: [{
                        text: $.Plugin.translate('browse', 'Browse'),
                        id: 'upload-browse',
                        icons: {
                            primary: 'ui-icon-search'
                        }
                    }, {
                        text: $.Plugin.translate('upload', 'Upload'),
                        click: function () {
                            if ($.isFunction(options.upload)) {
                                options.upload.call();
                            }
                        },
                        icons: {
                            primary: 'ui-icon-arrowthick-1-n'
                        }

                    }, {
                        text: $.Plugin.translate('close', 'Close'),
                        click: function () {
                            $(this).dialog("close");
                        },
                        icons: {
                            primary: 'ui-icon-close'
                        }

                    }]
            }, options);

            return $.Dialog.dialog($.Plugin.translate('upload', 'Upload'), div, options);
        },
        /**
         * IFrame Dialog
         */
        iframe: function (name, url, options) {
            var div = document.createElement('div');

            options = $.extend({
                width: $(window).width() - 100,
                height: $(window).height() - 50,
                onOpen: function () {
                    var iframe = document.createElement('iframe');

                    $(div).addClass('loading');

                    $(iframe).attr({
                        'src': url,
                        'scrolling': 'auto',
                        'frameborder': 0
                    }).css({
                        width: '100%',
                        height: '99%'
                    }).load(function () {
                        var win = this.contentWindow, d = win.document, b = d.body;
                        var w = win.innerWidth || b.clientWidth;
                        var h = win.innerHeight || b.clientHeight;

                        $(this).css({
                            width: w,
                            height: h
                        });

                        if ($.isFunction(options.onFrameLoad)) {
                            options.onFrameLoad.call(this);
                        }

                        $(div).removeClass('loading');
                    });

                    $(div).addClass('iframe-preview').append(iframe);

                    $(div.parentNode).dialog("option", "position", 'center');
                }

            }, options);

            var name = name || $.Plugin.translate('preview', 'Preview');

            return $.Dialog.dialog(name, div, options);
        },
        /**
         * Media Dialog
         */
        media: function (name, url, options) {
            var self = this;
            options = options || {};

            var div = document.createElement('div');

            var ww = $(window).width(), wh = $(window).height();

            $.extend(options, {
                width: ww - Math.round(ww / 100 * 10),
                height: wh - Math.round(wh / 100 * 10),
                resizable: false,
                close: function () {
                    $(div).empty();
                    $(this).dialog('destroy').remove();
                },
                dialogClass: 'ui-preview',
                onOpen: function () {
                    var parent = div.parentNode;
                    // image
                    if (/\.(jpg|jpeg|gif|png)/i.test(url)) {
                        $(div).addClass('image-preview big-loader');
                        var img = new Image(), loaded = false;

                        var dw = $(parent).width(), dh = $(parent).height();

                        img.onload = function () {
                            if (loaded)
                                return false;

                            if ($.support.backgroundSize) {
                                $('div.image-preview').removeClass('loader').addClass('background').css({
                                    'background-image': 'url("' + img.src + '")'
                                });

                                if (img.width > dw || img.height > dh) {
                                    $('div.image-preview').addClass('resize');
                                }

                            } else {
                                if (img.width > dw || img.height > dh) {
                                    var dim = $.Plugin.sizeToFit(img, {
                                        width: Math.round($(window).width()) - 160,
                                        height: Math.round($(window).height()) - 190
                                    });

                                    $('div.image-preview').removeClass('loader').append('<img src="' + url + '" width="' + dim.width + '" height="' + dim.height + '" alt="' + $.Plugin.translate('preview', 'Preview') + '" />');
                                    $('div.image-preview').css('margin-top', ($(parent).height() - dim.height) / 2);
                                } else {
                                    $('div.image-preview').removeClass('loader').addClass('background').css({
                                        'background-image': 'url(' + url + ')'
                                    });
                                }
                            }

                            $(parent).click(function () {
                                $(div.parentNode).dialog('close');
                            });

                            $(parent).dialog("option", "position", 'center');

                            loaded = true;

                            $(div).removeClass('big-loader');
                        };

                        img.src = url + (/\?/.test(url) ? '&' : '?') + new Date().getTime();
                        // pdf (only for Firefox really)
                    } else if (/\.pdf$/i.test(url)) {
                        $(div).addClass('media-preview big-loader').height($(parent).height() - 20);

                        if ($.support.pdf) {
                            $(div).html('<object data="' + url + '" type="application/pdf" width="' + $(div).innerWidth() + '" height="' + $(div).innerHeight() + '"></object>').removeClass('big-loader');
                        } else {
                            $(div).html('<iframe src="' + url + '" width="' + $(div).innerWidth() + '" height="' + $(div).innerHeight() + '" frameborder="0"></iframe>').removeClass('big-loader');
                        }
                    } else {
                        $(div).addClass('media-preview big-loader').height($(parent).height() - 20);

                        var mediaTypes = {
                            // Type, clsid, mime types,
                            // codebase
                            "flash": {
                                classid: "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000",
                                type: "application/x-shockwave-flash",
                                codebase: "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0"
                            },
                            "shockwave": {
                                classid: "clsid:166b1bca-3f9c-11cf-8075-444553540000",
                                type: "application/x-director",
                                codebase: "http://download.macromedia.com/pub/shockwave/cabs/director/sw.cab#version=8,5,1,0"
                            },
                            "windowsmedia": {
                                classid: "clsid:6bf52a52-394a-11d3-b153-00c04f79faa6",
                                type: "application/x-mplayer2",
                                codebase: "http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701"
                            },
                            "quicktime": {
                                classid: "clsid:02bf25d5-8c17-4b23-bc80-d3488abddc6b",
                                type: "video/quicktime",
                                codebase: "http://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0"
                            },
                            "divx": {
                                classid: "clsid:67dabfbf-d0ab-41fa-9c46-cc0f21721616",
                                type: "video/divx",
                                codebase: "http://go.divx.com/plugin/DivXBrowserPlugin.cab"
                            },
                            "realmedia": {
                                classid: "clsid:cfcdaa03-8be4-11cf-b84b-0020afbbccfa",
                                type: "audio/x-pn-realaudio-plugin"
                            },
                            "java": {
                                classid: "clsid:8ad9c840-044e-11d1-b3e9-00805f499d93",
                                type: "application/x-java-applet",
                                codebase: "http://java.sun.com/products/plugin/autodl/jinstall-1_5_0-windows-i586.cab#Version=1,5,0,0"
                            },
                            "silverlight": {
                                classid: "clsid:dfeaf541-f3e1-4c24-acac-99c30715084a",
                                type: "application/x-silverlight-2"
                            },
                            "video": {
                                type: 'video/mp4'
                            },
                            "audio": {
                                type: 'audio/mp3'
                            }
                        };

                        var mimes = {};

                        // Parses the default mime types
                        // string into a mimes lookup
                        // map
                        (function (data) {
                            var items = data.split(/,/),
                                    i, y, ext;

                            for (i = 0; i < items.length; i += 2) {
                                ext = items[i + 1].split(/ /);

                                for (y = 0; y < ext.length; y++)
                                    mimes[ext[y]] = items[i];
                            }
                        })("application/x-director,dcr," + "application/x-mplayer2,wmv wma avi," + "video/divx,divx," + "application/x-shockwave-flash,swf swfl," + "audio/mpeg,mpga mpega mp2 mp3," + "audio/ogg,ogg spx oga," + "audio/x-wav,wav," + "video/mpeg,mpeg mpg mpe," + "video/mp4,mp4 m4v," + "video/ogg,ogg ogv," + "video/webm,webm," + "video/quicktime,qt mov," + "video/x-flv,flv," + "video/vnd.rn-realvideo,rv," + "video/3gpp,3gp," + "video/x-matroska,mkv");

                        var ext = $.String.getExt(url);
                        var mt = mimes[ext];
                        var type, props;

                        $.each(
                                mediaTypes, function (k, v) {
                                    if (v.type && v.type == mt) {
                                        type = k;
                                        props = v;
                                    }
                                });

                        // video types
                        if (/^(mp4|m4v|og(g|v)|webm)$/i.test(ext)) {
                            type = 'video';
                            props = {
                                type: mt
                            };
                        }

                        // audio types
                        if (/^(mp3|og(g|a)|webm)$/i.test(ext)) {
                            type = 'audio';
                            props = {
                                type: mt
                            };
                        }

                        // flv
                        if (/^(flv|f4v)$/i.test(ext)) {
                            type = 'flv';
                            props = {};
                        }

                        var swf = $.Plugin.getURI(true) + 'components/com_jce/editor/libraries/mediaplayer/mediaplayer.swf';

                        if (type && props) {
                            switch (type) {
                                case 'audio':
                                case 'video':
                                    var fb, ns = '<p style="margin-left:auto;">' + $.Plugin.translate('media_not_supported', 'Media type not supported by this browser') + '</p>';

                                    var support = {
                                        video: {
                                            'mp4': ['mp4', 'm4v'],
                                            'webm': ['webm'],
                                            'ogg': ['ogv', 'ogg']
                                        },
                                        audio: {
                                            'mp3': ['mp3'],
                                            'ogg': ['oga', 'ogg']
                                        }
                                    }

                                    var hasSupport = false;

                                    for (var n in support[type]) {
                                        if (support[type][n].indexOf(ext) != -1) {
                                            hasSupport = $.support[type][n];
                                        }

                                        if (hasSupport === true) {
                                            break;
                                        }
                                    }

                                    // HTML5 video
                                    if (hasSupport) {
                                        if (type == 'video') {
                                            $(div).append('<video autoplay="autoplay" controls="controls" preload="none" type="' + props.type + '" style="width:100%;height:100%;" src="' + url + '"></video>');
                                        } else {
                                            $(div).append('<audio autoplay="autoplay" controls="controls" preload="none" type="' + props.type + '" src="' + url + '"></audio>');
                                        }
                                    } else if (/^m(p3|p4|4v)$/i.test(ext)) {
                                        url = $.URL.toAbsolute(url);

                                        $(div).html('<object type="application/x-shockwave-flash" data="' + swf + '"><param name="movie" value="' + swf + '" /><param name="flashvars" value="src=' + url + '&autoPlay=true&controlBarAutoHide=false&playButtonOverlay=false" /></object>');

                                        if (ext == 'mp3') {
                                            $('object', div).addClass('audio');
                                        }
                                    } else {
                                        $(div).html(ns).removeClass('loader');
                                    }

                                    break;
                                case 'flv':
                                    url = $.URL.toAbsolute(url);

                                    $(div).append('<object type="application/x-shockwave-flash" data="' + swf + '"><param name="movie" value="' + swf + '" /><param name="flashvars" value="src=' + url + '&autoPlay=true&controlBarAutoHide=false" /></object>');
                                    break;
                                case 'flash':
                                    $(div).append('<object type="' + props.type + '" data="' + url + '" style="width:100%;height:100%;"><param name="movie" value="' + url + '" /></object>');
                                    break;
                                default:
                                    $(div).append('<object classid="' + props.classid + '" style="width:100%;height:100%;"><param name="src" value="' + url + '" /><embed src="' + url + '" style="width:100%;height:100%;" type="' + props.type + '"></embed></object>');
                                    break;
                            }
                            $(div).removeClass('big-loader');
                        }
                    }
                }

            });

            return $.Dialog.dialog($.Plugin.translate('preview', 'Preview') + ' - ' + name, div, options);
        }

    };

    /**
     * String functions
     */
    $.String = {
        /**
         * From php.js
         * More info at: http://phpjs.org
         * php.js is copyright 2011 Kevin van Zonneveld.
         */
        basename: function (s) {
            return s.replace(/^.*[\/\\]/g, '');
        },
        /**
         * From php.js
         * More info at: http://phpjs.org
         * php.js is copyright 2011 Kevin van Zonneveld.
         */
        dirname: function (s) {
            if (/[\\\/]+/.test(s)) {
                return s.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
            }

            return '';
        },
        filename: function (s) {
            return this.stripExt(this.basename(s));
        },
        getExt: function (s) {
            return s.substring(s.length, s.lastIndexOf('.') + 1).toLowerCase();
        },
        stripExt: function (s) {
            return s.replace(/\.[^.]+$/i, '');
        },
        pathinfo: function (s) {
            var info = {
                'basename': this.basename(s),
                'dirname': this.dirname(s),
                'extension': this.getExt(s),
                'filename': this.filename(s)
            };
            return info;
        },
        path: function (a, b) {
            a = this.clean(a);
            b = this.clean(b);

            if (a.substring(a.length - 1) != '/')
                a += '/';

            if (b.charAt(0) == '/')
                b = b.substring(1);

            return a + b;
        },
        clean: function (s) {
            if (!/:\/\//.test(s)) {
                return s.replace(/\/+/g, '/');
            }
            return s;
        },
        /*
         * Replace diacritic with nearest ascii equivalent.
         * Based on cleanName function in plupload.js - https://github.com/moxiecode/plupload/blob/master/src/plupload.js
         * Copyright 2013, Moxiecode Systems AB
         */
        replaceDiacritic: function (s) {
            var i, lookup;

            // Replace diacritics
            lookup = [
                /[\300-\306]/g, 'A', /[\340-\346]/g, 'a',
                /\307/g, 'C', /\347/g, 'c',
                /[\310-\313]/g, 'E', /[\350-\353]/g, 'e',
                /[\314-\317]/g, 'I', /[\354-\357]/g, 'i',
                /\321/g, 'N', /\361/g, 'n',
                /[\322-\330]/g, 'O', /[\362-\370]/g, 'o',
                /[\331-\334]/g, 'U', /[\371-\374]/g, 'u'
            ];

            for (i = 0; i < lookup.length; i += 2) {
                s = s.replace(lookup[i], lookup[i + 1]);
            }

            return s;
        },
        _toUnicode: function (s) {
            var c = s.toString(16).toUpperCase();

            while (c.length < 4) {
                c = '0' + c;
            }

            return'\\u' + c;
        },
        safe: function (s, mode, spaces, textcase) {
            mode = mode || 'utf-8';

            // replace spaces with underscore
            if (!spaces) {
                s = s.replace(/[\s ]/g, '_');
            }

            if (mode == 'ascii') {
                s = this.replaceDiacritic(s);
                s = s.replace(/[^\w\.\-~\s ]/gi, '');
            } else {
                // remove some common characters
                s = s.replace(/[\+\\\/\?\#%&<>"\'=\[\]\{\},;@\^\(\)£€$]/g, '');
                var r = '';

                for (var i = 0, ln = s.length; i < ln; i++) {
                    var ch = s[i];
                    // only process on possible restricted characters or utf-8 letters/numbers
                    if (/[^\w\.\-~\s ]/.test(ch)) {
                        // skip any character less than 127, eg: &?@* etc.
                        if (this._toUnicode(ch.charCodeAt(0)) < '\\u007F') {
                            continue;
                        }
                    }

                    r += ch;
                }

                s = r;
            }

            // remove multiple period characters
            s = s.replace(/(\.){2,}/g, '');

            // remove leading period
            s = s.replace(/^\./, '');

            // remove trailing period
            s = s.replace(/\.$/, '');

            // cleanup path
            s = this.basename(s);

            // change case
            if (textcase) {
                switch (textcase) {
                    case 'lowercase':
                        s = s.toLowerCase();
                        break;
                    case 'uppercase':
                        s = s.toUpperCase();
                        break;
                }
            }

            return s;
        },
        query: function (s) {
            var p = {};

            s = this.decode(s);

            // nothing to create query from
            if (s.indexOf('=') === -1) {
                return p;
            }

            if (/\?/.test(s)) {
                s = s.substring(s.indexOf('?') + 1);
            }

            if (/#/.test(s)) {
                s = s.substr(0, s.indexOf('#'));
            }

            var pairs = s.replace(/&amp;/g, '&').split('&');

            $.each(pairs, function () {
                var pair = this.split('=');
                p[pair[0]] = pair[1];
            });

            return p;
        },
        /**
         * Encode basic entities
         *
         * Copyright 2010, Moxiecode Systems AB
         */
        encode: function (s) {
            var baseEntities = {
                '"': '&quot;',
                "'": '&#39;',
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;'
            };
            return ('' + s).replace(/[<>&\"\']/g, function (chr) {
                return baseEntities[chr] || chr;
            });

        },
        /**
         * Decode basic entities
         *
         * Copyright 2010, Moxiecode Systems AB
         */
        decode: function (s) {
            var reverseEntities = {
                '&lt;': '<',
                '&gt;': '>',
                '&amp;': '&',
                '&quot;': '"',
                '&apos;': "'"
            };
            return s.replace(/&(#)?([\w]+);/g, function (all, numeric, value) {
                if (numeric)
                    return String.fromCharCode(value);

                return reverseEntities[all];
            });

        },
        escape: function (s) {
            return encodeURI(s);
        },
        unescape: function (s) {
            return decodeURI(s);
        },
        encodeURI: function (s, preserve_urls) {
            // don't encode local file links
            if (s && s.indexOf('file://') === 0) {
                return s;
            }

            s = encodeURIComponent(decodeURIComponent(s)).replace(/%2F/g, '/');

            if (preserve_urls) {
                s = s.replace(/%(21|2A|27|28|29|3B|3A|40|26|3D|2B|24|2C|3F|25|23|5B|5D)/g, function (a, b) {
                    return String.fromCharCode(parseInt(b, 16));
                });
            }

            return s;
        },
        buildURI: function (s) {
            // add http if necessary
            if (/^\s*www\./.test(s)) {
                s = 'http://' + s;
            }
            return s.replace(/ /g, '%20');
            //return  $.String.encodeURI(s, true);
        },
        /**
         * From TinyMCE form_utils.js function, slightly modified.
         * @author Moxiecode
         * @copyright Copyright 2004-2008, Moxiecode Systems AB, All rights reserved.
         */
        toHex: function (color) {
            var re = new RegExp("rgb\\s*\\(\\s*([0-9]+).*,\\s*([0-9]+).*,\\s*([0-9]+).*\\)", "gi");

            var rgb = color.replace(re, "$1,$2,$3").split(',');
            if (rgb.length == 3) {
                r = parseInt(rgb[0]).toString(16);
                g = parseInt(rgb[1]).toString(16);
                b = parseInt(rgb[2]).toString(16);

                r = r.length == 1 ? 0 + r : r;
                g = g.length == 1 ? 0 + g : g;
                b = b.length == 1 ? 0 + b : b;

                return "#" + r + g + b;
            }
            return color;
        },
        /**
         * From TinyMCE form_utils.js function, slightly modified.
         * @author Moxiecode
         * @copyright Copyright  2004-2008, Moxiecode Systems AB, All rights reserved.
         */
        toRGB: function (color) {
            if (color.indexOf('#') != -1) {
                color = color.replace(new RegExp('[^0-9A-F]', 'gi'), '');

                r = parseInt(color.substring(0, 2), 16);
                g = parseInt(color.substring(2, 4), 16);
                b = parseInt(color.substring(4, 6), 16);

                return "rgb(" + r + "," + g + "," + b + ")";
            }
            return color;
        },
        ucfirst: function (s) {
            return s.charAt(0).toUpperCase() + s.substring(1);
        },
        formatSize: function (s) {
            // MB
            if (s > 1048576) {
                return Math.round((s / 1048576) * 100) /
                        100 + " " + $.Plugin.translate('size_mb', 'MB');
            }

            // KB
            if (s > 1024) {
                return Math.round((s / 1024) * 100) /
                        100 + " " + $.Plugin.translate('size_kb', 'KB');
            }

            return s + " " + $.Plugin.translate('size_bytes', 'Bytes');
        },
        /**
         * Format a UNIX date string
         * @param time UNIX Time in seconds
         * @param fmt Date / Time Format eg: '%d/%m/%Y, %H:%M'
         * @return Formatted Date / Time
         * @copyright Copyright 2009, Moxiecode Systems AB
         */
        formatDate: function (time, fmt) {
            var date = new Date(time * 1000);

            fmt = fmt || '%d/%m/%Y, %H:%M';

            function addZeros(value, len) {
                var i;

                value = "" + value;

                if (value.length < len) {
                    for (i = 0; i < (len - value.length); i++)
                        value = "0" + value;
                }

                return value;
            }

            fmt = fmt.replace("%D", "%m/%d/%y");
            fmt = fmt.replace("%r", "%I:%M:%S %p");
            fmt = fmt.replace("%Y", "" + date.getFullYear());
            fmt = fmt.replace("%y", "" + date.getYear());
            fmt = fmt.replace("%m", addZeros(date.getMonth() + 1, 2));
            fmt = fmt.replace("%d", addZeros(date.getDate(), 2));
            fmt = fmt.replace("%H", "" + addZeros(date.getHours(), 2));
            fmt = fmt.replace("%M", "" + addZeros(date.getMinutes(), 2));
            fmt = fmt.replace("%S", "" + addZeros(date.getSeconds(), 2));
            fmt = fmt.replace("%I", "" + ((date.getHours() + 11) % 12 + 1));
            fmt = fmt.replace("%p", "" + (date.getHours() < 12 ? "AM" : "PM"));
            fmt = fmt.replace("%%", "%");

            return fmt;
        }

    };
    // load Language
    $.Plugin.loadLanguage();
})(jQuery);

if (typeof ColorPicker === 'undefined') {
    var ColorPicker = {
        settings: {}
    };
}

// UI Tabs backwards compat
(function ($, prototype) {
    var _trigger = prototype._trigger;
    prototype._trigger = function (type, event, data) {
        var ret = _trigger.apply(this, arguments);
        if (!ret) {
            return false;
        }

        if (type === "beforeActivate") {
            ret = _trigger.call(this, "select", event, data);
        } else if (type === "activate") {
            ret = _trigger.call(this, "selected", event, data);
        }
        return ret;
    }
}(jQuery, jQuery.ui.tabs.prototype));

// UI Accordian backwards compat
(function ($, prototype) {
    prototype.activate = prototype._activate;
}(jQuery, jQuery.ui.accordion.prototype));

// change events
(function ($, prototype) {
    var _trigger = prototype._trigger;
    prototype._trigger = function (type, event, data) {
        var ret = _trigger.apply(this, arguments);
        if (!ret) {
            return false;
        }

        if (type === "beforeActivate") {
            ret = _trigger.call(this, "changestart", event, data);
        } else if (type === "activate") {
            ret = _trigger.call(this, "change", event, data);
        }
        return ret;
    }
}(jQuery, jQuery.ui.accordion.prototype));

// height options
(function ($, prototype) {
    prototype.options.heightStyle = "content";
}(jQuery, jQuery.ui.accordion.prototype));

// namespace backwards compat
(function ($, ui) {
    $(document).ready(function () {
        $.each(['resize', 'crop', 'rotate', 'sortable'], function (i, k) {
            if (ui[k]) {
                var proto = ui[k].prototype;
                var _init = proto._init;

                proto._init = function () {
                    _init.apply(this, arguments);
                    // store name
                    $(this.element).data(k, true);
                };
            }
        });
    });
}(jQuery, jQuery.ui));