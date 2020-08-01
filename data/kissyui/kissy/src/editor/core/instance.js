
KISSY.Editor.add("core~instance", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        UA = YAHOO.env.ua,
        ie = UA.ie,
        EDITOR_CLASSNAME = "ks-editor",

        EDITOR_TMPL  =  '<div class="ks-editor-toolbar"></div>' +
                        '<div class="ks-editor-content"><iframe frameborder="0" allowtransparency="1"></iframe></div>' +
                        '<div class="ks-editor-statusbar"></div>',

        CONTENT_TMPL =  '<!doctype html>' +
                        '<html>' +
                        '<head>' +
                        '<title>Rich Text Area</title>' +
                        '<meta charset="charset=gbk" />' +
                        '<link href="{CONTENT_CSS}" rel="stylesheet" />' +
                        '</head>' +
                        '<body spellcheck="false" class="ks-editor-post">{CONTENT}</body>' +
                        '</html>',

        THEMES_DIR = "themes";

    /**
     * �༭����ʵ����
     */
    E.Instance = function(textarea, config) {
        /**
         * ������� textarea Ԫ��
         */
        this.textarea = Dom.get(textarea);

        /**
         * ������
         */
        this.config = Lang.merge(E.config, config || {});

        /**
         * ������ renderUI �и�ֵ
         * @property container
         * @property contentWin
         * @property contentDoc
         * @property statusbar
         */

        /**
         * ���ʵ����صĲ��
         */
        //this.plugins = [];

        /**
         * �Ƿ���Դ��༭״̬
         */
        this.sourceMode = false;

        /**
         * ������
         */
        this.toolbar = new E.Toolbar(this);

        /**
         * ״̬��
         */
        this.statusbar = new E.Statusbar(this);

        // init
        this._init();
    };

    Lang.augmentObject(E.Instance.prototype, {
        /**
         * ��ʼ������
         */
        _init: function() {
            this._renderUI();
            this._initPlugins();
            this._initAutoFocus();
        },

        _renderUI: function() {
            this._renderContainer();
            this._setupContentPanel();
        },

        /**
         * ��ʼ�����в��
         */
        _initPlugins: function() {
            var key, p,
                staticPlugins = E.plugins,
                plugins = [];

            // ÿ��ʵ����ӵ��һ���Լ��� plugins �б�
            for(key in staticPlugins) {
                plugins[key] = Lang.merge(staticPlugins[key]);
            }
            this.plugins = plugins;

            // �������ϵĲ��
            this.toolbar.init();

            // ״̬���ϵĲ��
            this.statusbar.init();
            
            // ���������Բ��
            for (key in plugins) {
                p = plugins[key];
                if (p.inited) continue;

                if (p.type === E.PLUGIN_TYPE.FUNC) {
                    p.editor = this; // �� p ���� editor ����
                    if (p.init) {
                        p.init();
                    }
                    p.inited = true;
                }
            }
        },

        /**
         * ���� DOM �ṹ
         */
        _renderContainer: function() {
            var textarea = this.textarea,
                region = Dom.getRegion(textarea),
                width = (region.right - region.left - 2) + "px", // YUI �� getRegion �� 2px ƫ��
                height = (region.bottom - region.top - 2) + "px",
                container = document.createElement("div"),
                content, iframe;

            container.className = EDITOR_CLASSNAME;
            container.style.width = width;
            container.innerHTML = EDITOR_TMPL;

            content = container.childNodes[1];
            content.style.width = "100%";
            content.style.height = height;

            iframe = content.childNodes[0];
            iframe.style.width = "100%";
            iframe.style.height = "100%"; // ʹ�� resize �������������
            iframe.setAttribute("frameBorder", 0);

            textarea.style.display = "none";
            Dom.insertBefore(container, textarea);

            this.container = container;
            this.toolbar.domEl = container.childNodes[0];
            this.contentWin = iframe.contentWindow;
            this.contentDoc = iframe.contentWindow.document;

            this.statusbar.domEl = container.childNodes[2];

            // TODO Ŀǰ�Ǹ��� textatea �Ŀ�����趨 editor �Ŀ�ȡ����Կ��� config ��ָ�����
        },

        _setupContentPanel: function() {
            var doc = this.contentDoc,
                config = this.config,
                contentCSS = "content" + (config.debug ? "" : "-min") + ".css",
                contentCSSUrl = config.base + THEMES_DIR + "/" + config.theme + "/" + contentCSS,
                self = this;

            // ��ʼ�� iframe ������
            doc.open();
            doc.write(CONTENT_TMPL
                    .replace("{CONTENT_CSS}", contentCSSUrl)
                    .replace("{CONTENT}", this.textarea.value));
            doc.close();

            if (ie) {
                // �� contentEditable ���������� ie ��ѡ��Ϊ�ڵװ���
                doc.body.contentEditable = "true";
            } else {
                // firefox �� designMode ��֧�ָ���
                doc.designMode = "on";
            }

            // ע1���� tinymce �designMode = "on" ���� try catch �
            //     ԭ������ firefox �£���iframe �� display: none ��������ᵼ�´���
            //     �������Ҳ��ԣ�firefox 3+ �������޴�����
            // ע2�� ie �� contentEditable = true.
            //     ԭ������ ie �£�IE needs to use contentEditable or it will display non secure items for HTTPS
            // Ref:
            //   - Differences between designMode and contentEditable
            //     http://74.125.153.132/search?q=cache:5LveNs1yHyMJ:nagoon97.wordpress.com/2008/04/20/differences-between-designmode-and-contenteditable/+ie+contentEditable+designMode+different&cd=6&hl=en&ct=clnk

            // TODO: �ó�ʼ��������ʼ���� p ��ǩ��
            // ����Ĵ���취���׵�
//            if (Lang.trim(doc.body.innerHTML).length === 0) {
//                if(UA.gecko) {
//                    doc.body.innerHTML = '<p><br _moz_editor_bogus_node="TRUE" _moz_dirty=""/></p>';
//                } else {
//                    doc.body.innerHTML = '<p></p>';
//                }
//            }

            if(ie) {
                // ����� iframe doc �� body ����ʱ����ԭ����λ��
                Event.on(doc, "click", function() {
                    if (doc.activeElement.parentNode.nodeType === 9) { // ����� doc ��
                        self._focusToEnd();
                    }
                });
            }
        },

        _initAutoFocus: function() {
            if (this.config.autoFocus) {
                this._focusToEnd();
            }
        },

        /**
         * ����궨λ�����һ��Ԫ��
         */
        _focusToEnd: function() {
            this.contentWin.focus();

            var lastChild = this.contentDoc.body.lastChild,
                range = E.Range.getSelectionRange(this.contentWin);

            if (UA.ie) {
                try { // ��ʱ�ᱨ���༭�� ie �£��л�Դ���룬���л���ȥ������༭�����ڣ�����Чָ���JS����
                    range.moveToElementText(lastChild);
                } catch(ex) { }
                range.collapse(false);
                range.select();

            } else {
                try {
                    range.setEnd(lastChild, lastChild.childNodes.length);
                } catch(ex) { }
                range.collapse(false);
            }
        },

        /**
         * ��ȡ����
         */
        focus: function() {
          this._focusToEnd();
        },

        /**
         * ִ�� execCommand
         */
        execCommand: function(commandName, val, styleWithCSS) {
            this.contentWin.focus(); // ��ԭ����
            E.Command.exec(this.contentDoc, commandName, val, styleWithCSS);
        },

        /**
         * ��ȡ����
         */
        getData: function() {
            if(this.sourceMode) {
                return this.textarea.value;
            }
            return this.getContentDocData();
        },

        /**
         * ��ȡ contentDoc �е�����
         */
        getContentDocData: function() {
            var bd = this.contentDoc.body,
                data = "", p = E.plugins["save"];

            // Firefox �£�_moz_editor_bogus_node, _moz_dirty ����������
            // ��Щ�������ԣ����� innerHTML ��ȡʱ���Զ�������

            data = bd.innerHTML;
            if(data == "<br>") data = ""; // firefox �»��Զ�����һ�� br

            if(p && p.filterData) {
                data = p.filterData(data);
            }

            return data;
        },

        /**
         * ��ȡѡ������� Range ����
         */
        getSelectionRange: function() {
            return E.Range.getSelectionRange(this.contentWin);
        }
    });

});

// TODO:
//  - Ŀǰͨ�� html, body { height: 100% } ʹ�� ie ������ iframe ������Ҽ�����ȷ��ʾ�༭�˵���
//    ȱ���Ǳ༭����� padding �������ã�������ֹ�������������Ҫ�Ӳ����Ͻ��иĽ������ź����հס�
