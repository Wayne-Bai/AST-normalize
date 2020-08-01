
KISSY.Editor.add("core~toolbar", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,
        isIE6 = isIE === 6,
        TYPE = E.PLUGIN_TYPE,
        TOOLBAR_SEPARATOR_TMPL = '<div class="ks-editor-stripbar-sep ks-inline-block"></div>',

        TOOLBAR_BUTTON_TMPL = '' +
'<div class="ks-editor-toolbar-button ks-inline-block" title="{TITLE}">' +
    '<div class="ks-editor-toolbar-button-outer-box">' +
        '<div class="ks-editor-toolbar-button-inner-box">' +
            '<span class="ks-editor-toolbar-item ks-editor-toolbar-{NAME}">{TEXT}</span>' +
        '</div>' +
    '</div>' +
'</div>',

        TOOLBAR_MENU_BUTTON_TMPL = '' +
'<div class="ks-editor-toolbar-menu-button-caption ks-inline-block">' +
    '<span class="ks-editor-toolbar-item ks-editor-toolbar-{NAME}">{TEXT}</span>' +
'</div>' +
'<div class="ks-editor-toolbar-menu-button-dropdown ks-inline-block"></div>',

        TOOLBAR_MENU_BUTTON = "ks-editor-toolbar-menu-button",
        TOOLBAR_SELECT = "ks-editor-toolbar-select",
        TOOLBAR_BUTTON_ACTIVE = "ks-editor-toolbar-button-active",
        TOOLBAR_BUTTON_HOVER = "ks-editor-toolbar-button-hover",
        TOOLBAR_BUTTON_SELECTED = "ks-editor-toolbar-button-selected",
    
        STATE_CMDS = "fontName,fontSize,bold,italic,underline,strikeThrough"
                     + "insertOrderedList,insertUnorderedList"
                     + "justifyLeft,justifyCenter,justifyRight",

        div = document.createElement("div"); // ͨ�� el ����


    E.Toolbar = function(editor) {

        /**
         * ������ı༭��ʵ��
         */
        this.editor = editor;

        /**
         * �����������
         */
        this.config = editor.config;

        /**
         * ��ǰ����
         */
        this.lang = E.lang[this.config.language];

        /**
         * ���м��صĹ��������
         */
        this.items = [];

        /**
         * ������Ҫ��̬����״̬�Ĺ����������
         */
        this.stateItems = [];
    };
    
    Lang.augmentObject(E.Toolbar.prototype, {

        /**
         * ��ʼ��������
         */
        init: function() {
            var items = this.config.toolbar,
                plugins = this.editor.plugins,
                key, p;

            // ����������ҵ���ز�������ӵ���������
            for (var i = 0, len = items.length; i < len; ++i) {
                key = items[i];
                if (key) {
                    if (!(key in plugins)) continue; // ���������У������صĲ�����ޣ�ֱ�Ӻ���

                    // ��Ӳ����
                    p = plugins[key];
                    this._addItem(p);

                    this.items.push(p);
                    if(STATE_CMDS.indexOf(p.name) !== -1) {
                        this.stateItems.push(p);
                    }

                } else { // ��ӷָ���
                    this._addSeparator();
                }
            }

            // ״̬����
            this._initUpdateState();
        },

        /**
         * ��ӹ�������
         */
        _addItem: function(p) {
            var el, type = p.type, lang = this.lang, html;

            // �� plugin û������ lang ʱ������Ĭ����������
            // TODO: �����ع��� instance ģ�����Ϊ lang ����ʵ�����
            if (!p.lang) p.lang = Lang.merge(lang["common"], this.lang[p.name] || {});

            // ����ģ�幹�� DOM
            html = TOOLBAR_BUTTON_TMPL
                    .replace("{TITLE}", p.lang.title || "")
                    .replace("{NAME}", p.name)
                    .replace("{TEXT}", p.lang.text || "");
            if (isIE6) {
                html = html
                        .replace("outer-box", "outer-box ks-inline-block")
                        .replace("inner-box", "inner-box ks-inline-block");
            }
            div.innerHTML = html;

            // �õ� domEl
            p.domEl = el = div.firstChild;

            // ���ݲ�����ͣ����� DOM �ṹ
            if (type == TYPE.TOOLBAR_MENU_BUTTON || type == TYPE.TOOLBAR_SELECT) {
                // ע��select ��һ������� menu button
                this._renderMenuButton(p);

                if(type == TYPE.TOOLBAR_SELECT) {
                    this._renderSelect(p);
                }
            }

            // ���¼�
            this._bindItemUI(p);

            // ��ӵ�������
            this._addToToolbar(el);

            // ���ò���Լ��ĳ�ʼ�����������ǲ���ĸ��Ի��ӿ�
            // init ������ӵ����������棬���Ա�֤ DOM ��������ȡ region �Ȳ�������ȷ��
            p.editor = this.editor; // �� p ���� editor ����
            if (p.init) {
                p.init();
            }

            // ���Ϊ�ѳ�ʼ�����
            p.inited = true;
        },

        /**
         * ��ʼ��������ť�� DOM
         */
        _renderMenuButton: function(p) {
            var el = p.domEl,
                innerBox = el.getElementsByTagName("span")[0].parentNode;

            Dom.addClass(el, TOOLBAR_MENU_BUTTON);
            innerBox.innerHTML = TOOLBAR_MENU_BUTTON_TMPL
                    .replace("{NAME}", p.name)
                    .replace("{TEXT}", p.lang.text || "");
        },

        /**
         * ��ʼ�� selectBox �� DOM
         */
        _renderSelect: function(p) {
            Dom.addClass(p.domEl, TOOLBAR_SELECT);
        },

        /**
         * ������������¼�
         */
        _bindItemUI: function(p) {
            var el = p.domEl;

            // 1. ע����ʱ����Ӧ����
            if (p.exec) {
                Event.on(el, "click", function() {
                    p.exec();
                });
            }

            // 2. ��������ʱ����ť���µ�Ч��
            Event.on(el, "mousedown", function() {
                Dom.addClass(el, TOOLBAR_BUTTON_ACTIVE);
            });
            Event.on(el, "mouseup", function() {
                Dom.removeClass(el, TOOLBAR_BUTTON_ACTIVE);
            });
            // TODO ����Ч����������������״̬��������Ƴ������밴ťʱ����ť״̬���л�
            // ע��firefox �£���ס�����������Ƴ������밴ťʱ�����ᴥ�� mouseout. ��Ҫ�о��� google �����ʵ�ֵ�
            Event.on(el, "mouseout", function(e) {
                var toElement = Event.getRelatedTarget(e), isChild;

                try {
                    if (el.contains) {
                        isChild = el.contains(toElement);
                    } else if (el.compareDocumentPosition) {
                        isChild = el.compareDocumentPosition(toElement) & 8;
                    }
                } catch(e) {
                    isChild = false; // �Ѿ��ƶ��� iframe ��
                }
                if (isChild) return;

                Dom.removeClass(el, TOOLBAR_BUTTON_ACTIVE);
            });

            // 3. ie6 �£�ģ�� hover
            if(isIE6) {
                Event.on(el, "mouseenter", function() {
                    Dom.addClass(el, TOOLBAR_BUTTON_HOVER);
                });
                Event.on(el, "mouseleave", function() {
                    Dom.removeClass(el, TOOLBAR_BUTTON_HOVER);
                });
            }
        },

        /**
         * ��ӷָ���
         */
        _addSeparator: function() {
            div.innerHTML = TOOLBAR_SEPARATOR_TMPL;
            this._addToToolbar(div.firstChild);
        },

        /**
         * �� item �� �ָ��� ��ӵ�������
         */
        _addToToolbar: function(el) {
            if(isIE) el = E.Dom.setItemUnselectable(el);
            this.domEl.appendChild(el);
        },

        /**
         * ��ʼ����ť״̬�Ķ�̬����
         */
        _initUpdateState: function() {
            var doc = this.editor.contentDoc,
                self = this;

            Event.on(doc, "click", function() { self.updateState(); });
            Event.on(doc, "keyup", function(ev) {
                var keyCode = ev.keyCode;

                // PGUP,PGDN,END,HOME: 33 - 36
                // LEFT,UP,RIGHT,DOWN��37 - 40
                // BACKSPACE: 8
                // ENTER: 13
                // DEL: 46
                if((keyCode >= 33 && keyCode <= 40)
                    || keyCode === 8
                    || keyCode === 13
                    || keyCode === 46) {
                    self.updateState();
                }
            });

            // TODO: ���ճ��ʱ���¼���ճ������Ҫ���°�ť״̬
        },

        /**
         * ��ť״̬�Ķ�̬���£�������ťѡ��״̬�ĸ��¡������ֺŵĸ��¡���ɫ�Ķ�̬���µȣ�
         * ���� Google Docs ��ԭ�������а�ťʼ�տɵ����ֻ����״̬�������ð�ť
         */
        updateState: function(filterNames) {
            var items = this.stateItems, p;
            filterNames = filterNames ? filterNames.join("|") : "";

            for(var i = 0, len = items.length; i < len; i++) {
                p = items[i];
                
                if(filterNames && filterNames.indexOf(p.name) === -1)
                    continue;

                // ���ò���Լ���״̬���º���
                if(p.updateState) {
                    p.updateState();
                    continue;
                }

                // Ĭ�ϵ�״̬���º���
                this.updateItemState(p);
            }

            // TODO: webkit �£������״̬û��ȡ��
        },

        updateItemState: function(p) {
            var doc = this.editor.contentDoc;

            // Ĭ�ϵ�״̬���º���
            try {
                if (doc.queryCommandEnabled(p.name)) {
                    if (doc.queryCommandState(p.name)) {
                        Dom.addClass(p.domEl, TOOLBAR_BUTTON_SELECTED);
                    } else {
                        Dom.removeClass(p.domEl, TOOLBAR_BUTTON_SELECTED);
                    }
                }
            } catch(ex) {
            }
        }
    });

});
