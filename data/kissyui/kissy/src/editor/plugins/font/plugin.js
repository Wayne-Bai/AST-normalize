
KISSY.Editor.add("plugins~font", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event,
        UA = YAHOO.env.ua,
        TYPE = E.PLUGIN_TYPE,

        OPTION_ITEM_HOVER_CLS = "ks-editor-option-hover",
        SELECT_TMPL = '<ul class="ks-editor-select-list">{LI}</ul>',
        OPTION_TMPL = '<li class="ks-editor-option" data-value="{VALUE}">' +
                          '<span class="ks-editor-option-checkbox"></span>' +
                          '<span style="{STYLE}">{KEY}</span>' +
                      '</li>',
        OPTION_SELECTED = "ks-editor-option-selected",
        WEBKIT_FONT_SIZE = {
            "10px" : 1,
            "13px" : 2,
            "16px" : 3,
            "18px" : 4,
            "24px" : 5,
            "32px" : 6,
            "48px" : 7
        };

    E.addPlugin(["fontName", "fontSize"], {
        /**
         * ���ࣺ�˵���ť
         */
        type: TYPE.TOOLBAR_SELECT,

        /**
         * ��ǰѡ��ֵ
         */
        selectedValue: "",

        /**
         * ѡ���ͷ��
         */
        selectHead: null,

        /**
         * ����������ѡ���б�
         */
        selectList: null,

        /**
         * �������������ѡ��ֵ
         */
        options: [],

        /**
         * �����б���
         */
        items: null,

        /**
         * ѡ�е���
         */
        selectedItem: null,

        /**
         * ѡ���������
         */
        range: null,

        /**
         * ��ʼ��
         */
        init: function() {
            this.options = this.lang.options;
            this.selectHead = this.domEl.getElementsByTagName("span")[0];

            this._renderUI();
            this._bindUI();
        },

        _renderUI: function() {
            // ��ʼ�������� DOM
            this.selectList = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]);
            this._renderSelectList();
            this.items = this.selectList.getElementsByTagName("li");
        },

        _bindUI: function() {
            // ע��ѡȡ�¼�
            this._bindPickEvent();

            Event.on(this.domEl, "click", function() {
                // ���� range, �Ա㻹ԭ
                this.range = this.editor.getSelectionRange();

                // �ۼ�����ť�ϣ����ع�꣬���� ie �¹�����ʾ�ڲ�����
                // ע��ͨ�� blur / focus �ȷ�ʽ�� ie7- ����Ч
                UA.ie && this.editor.contentDoc.selection.empty();

                // �����������е�ѡ����
                if(this.selectedValue) {
                    this._updateSelectedOption(this.selectedValue);
                } else if(this.selectedItem) {
                    Dom.removeClass(this.selectedItem, OPTION_SELECTED);
                    this.selectedItem = null;
                }
                
            }, this, true);
        },

        /**
         * ��ʼ�������� DOM
         */
        _renderSelectList: function() {
            var htmlCode = "", options = this.options,
                key, val;

            for(key in options) {
                val = options[key];

                htmlCode += OPTION_TMPL
                        .replace("{VALUE}", val)
                        .replace("{STYLE}", this._getOptionStyle(key, val))
                        .replace("{KEY}", key);
            }

            // ��ӵ� DOM ��
            this.selectList.innerHTML = SELECT_TMPL.replace("{LI}", htmlCode);

            // ��Ӹ��Ի� class
            Dom.addClass(this.selectList, "ks-editor-drop-menu-" + this.name);
        },

        /**
         * ��ȡɫ�¼�
         */
        _bindPickEvent: function() {
            var self = this;

            Event.on(this.selectList, "click", function(ev) {
                var target = Event.getTarget(ev);

                if(target.nodeName != "LI") {
                    target = Dom.getAncestorByTagName(target, "li");
                }
                if(!target) return;

                self._doAction(target.getAttribute("data-value"));

                // �ر�������
                Event.stopPropagation(ev);
                E.Menu.hideActiveDropMenu(self.editor);
                // ע����������ֹ���¼�ð�ݣ��Լ�����Ի���Ĺرգ�����Ϊ
                // �� Firefox �£���ִ�� doAction ��doc ��ȡ�� click
                // ���� updateState ʱ������ȡ������ǰ����ɫֵ��
                // ��������������Ҳ�кô�����������²���Ҫ���� updateState
            });

            // ie6 �£�ģ�� hover
            if(UA.ie === 6) {
                Event.on(this.items, "mouseenter", function() {
                    Dom.addClass(this, OPTION_ITEM_HOVER_CLS);
                });
                Event.on(this.items, "mouseleave", function() {
                    Dom.removeClass(this, OPTION_ITEM_HOVER_CLS);
                });
            }
        },

        /**
         * ִ�в���
         */
        _doAction: function(val) {
            if(!val) return;

            this.selectedValue = val;

            // ���µ�ǰֵ
            this._setOption(val);

            // ��ԭѡ��
            var range = this.range;
            if(UA.ie && range.select) range.select();

            // ִ������
            this.editor.execCommand(this.name, this.selectedValue);
        },

        /**
         * ѡ��ĳһ��
         */
        _setOption: function(val) {
            // ����ͷ��
            this._updateHeadText(this._getOptionKey(val));

            // �����б�ѡ����
            this._updateSelectedOption(val);
        },

        _getOptionStyle: function(key, val) {
          if(this.name == "fontName") {
              return "font-family:" + val;
          } else { // font size
              return "font-size:" + key + "px";
          }
        },

        _getOptionKey: function(val) {
            var options = this.options, key;
            
            for(key in options) {
                if(options[key] == val) {
                    return key;
                }
            }
            return null;
        },

        _updateHeadText: function(val) {
            this.selectHead.innerHTML = val;
        },

        /**
         * �����������ѡ����
         */
        _updateSelectedOption: function(val) {
            var items = this.items,
                i, len = items.length, item;

            for(i = 0; i < len; ++i) {
                item = items[i];

                if(item.getAttribute("data-value") == val) {
                    Dom.addClass(item, OPTION_SELECTED);
                    this.selectedItem = item;
                } else {
                    Dom.removeClass(item, OPTION_SELECTED);
                }
            }
        },

        /**
         * ���°�ť״̬
         */
        updateState: function() {
            var doc = this.editor.contentDoc,
                options = this.options,
                name = this.name, key, val;

            try {
                if (doc.queryCommandEnabled(name)) {
                    val = doc.queryCommandValue(name);

                    if(UA.webkit && name == "fontSize") {
                        val = this._getWebkitFontSize(val);
                    }
                    
                    val && (key = this._getOptionKey(val));
                    //console.log(key + " : " + val);

                    if (key in options) {
                        if(val != this.selectedValue) {
                            this.selectedValue = val;
                            this._updateHeadText(key);
                        }
                    } else {
                        this.selectedValue = "";
                        this._updateHeadText(this.lang.text);
                    }
                }

            } catch(ex) {
            }
        },

        _getWebkitFontSize: function(val) {
            if(val in WEBKIT_FONT_SIZE) return WEBKIT_FONT_SIZE[val];
            return null;
        }
    });

});

// TODO
//  1. �� google, �Լ����¼���֧��
//  3. ie �½ӹܣ������괦��ĳ��ǩ�ڣ��ı�����ʱ���ı�������α�ǩ������
