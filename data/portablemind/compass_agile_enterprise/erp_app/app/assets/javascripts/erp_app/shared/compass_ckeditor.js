// This configuration was taken from http://docs.cksource.com/CKEditor_3.x/Howto/FCKeditor_HTML_Output
// It changes the source formatting (indentation) back to FCKeditor formatting
// indentationChars is set to 2 spaces
Ext.onReady(function () {
    try {
        CKEDITOR.on('instanceReady', function (ev) {
            var writer = ev.editor.dataProcessor.writer;
            // The character sequence to use for every indentation step.
            writer.indentationChars = '  ';

            var dtd = CKEDITOR.dtd;
            // Elements taken as an example are: block-level elements (div or p), list items (li, dd), and table elements (td, tbody).
            for (var e in CKEDITOR.tools.extend({}, dtd.$block, dtd.$listItem, dtd.$tableContent)) {
                ev.editor.dataProcessor.writer.setRules(e, {
                    // Indicates that an element creates indentation on line breaks that it contains.
                    indent: false,
                    // Inserts a line break before a tag.
                    breakBeforeOpen: true,
                    // Inserts a line break after a tag.
                    breakAfterOpen: false,
                    // Inserts a line break before the closing tag.
                    breakBeforeClose: false,
                    // Inserts a line break after the closing tag.
                    breakAfterClose: true
                });
            }

            for (var e in CKEDITOR.tools.extend({}, dtd.$list, dtd.$listItem, dtd.$tableContent)) {
                ev.editor.dataProcessor.writer.setRules(e, {
                    indent: true
                });
            }

            // You can also apply the rules to a single element.
            ev.editor.dataProcessor.writer.setRules('table',
                {
                    indent: true
                });

            ev.editor.dataProcessor.writer.setRules('form',
                {
                    indent: true
                });
        });
    }
    catch (e) {
    }
});

/**
 * @class Compass.ErpApp.Shared.CKeditor
 * @extends Ext.form.field.TextArea
 * Converts a textarea into a CkEditor Instance
 *
 * @author Russell Holmes - russellfholmes@gmail.com / http://www.portablemind.com
 *
 * @additional config options
 * ckEditorConfig - configuration for CkEditor Instance
 */
Ext.define("Compass.ErpApp.Shared.CKeditor", {
    extend: "Ext.form.field.TextArea",
    alias: 'widget.ckeditor',
    ckEditorInstance: null,

    initComponent: function () {
        this.callParent(arguments);

        this.addEvents(
            /**
             * @event save
             * Fired when saving contents.
             * @param {Compass.ErpApp.Shared.CKeditor} cKeditor This object
             * @param (contents) contents needing to be saved
             */
            'save',
            /**
             * @event ckeditordrop
             * Fired when item is dropped into ckeditor.
             * @param {Compass.ErpApp.Shared.CKeditor} cKeditor This object
             * @param {Event} drop event
             */
            'ckeditordrop'
        );
    },

    constructor: function (config) {
        config = Ext.apply({
            grow: true,
            hideLabel: true
        }, config);

        this.callParent([config]);
    },

    onRender: function (ct, position) {
        this.callParent(arguments);

        this.setupCkEditor();
        this.on('resize', this.textAreaResized, this);
    },

    setupCkEditor: function () {
        var me = this;

        Ext.applyIf(this.initialConfig.ckEditorConfig, {
            resize_enabled: false,
            keystrokes: [
                [CKEDITOR.CTRL + 83 /* S */, 'saveCommand']
            ],
            allowedContent : true,
            base_path: '/javascripts/ckeditor/',
            toolbarStartupExpanded: true,
            enterMode: CKEDITOR.ENTER_BR,
            shiftEnterMode: CKEDITOR.ENTER_P,
            baseFloatZIndex: 20000
        });
        var editor = CKEDITOR.replace(this.inputEl.id, this.initialConfig.ckEditorConfig);

        editor.addCommand('saveCommand', {
            exec: function (editor, data) {
                me.fireEvent('save', me, me.getValue());
                //event handler
                return function (e) {
                    e = e || window.event;
                    e.e_stopPropagation();
                }
            }
        });

        editor.on('contentDom', function () {
            // Check if browser supports HTML5 FileReader
            if (window.FileReader) {
                var head = editor.document.getHead(),
                    hoverClass = "cke-image-dd",
                    hoverClassRegex = new RegExp(" " + hoverClass, "g");

                style = CKEDITOR.dom.element.createFromHtml('<style>.cke-image-dd {box-shadow: 0 0 10px 1px #999 inset !important;}</style>');
                head.append(style);

                var body = editor.document.getBody();

                Compass.ErpApp.Utility.addEventHandler(body.$, 'dragover', function (e) {
                    e.preventDefault();

                    // add drag over css
                    currentClassName = body.$.getAttribute('class');
                    if (currentClassName && currentClassName.indexOf(hoverClass) === -1) {
                        body.$.setAttribute('class', currentClassName + " " + hoverClass);
                    }

                    return false;
                });

                Compass.ErpApp.Utility.addEventHandler(body.$, 'dragenter', function (e) {
                    e.preventDefault();

                    // add drag over css
                    currentClassName = body.$.getAttribute('class');
                    if (currentClassName && currentClassName.indexOf(hoverClass) === -1) {
                        body.$.setAttribute('class', currentClassName + " " + hoverClass);
                    }

                    return false;
                });

                Compass.ErpApp.Utility.addEventHandler(body.$, 'dragleave', function (e) {
                    e.preventDefault();

                    // remove drag over css
                    currentClassName = body.$.getAttribute('class');
                    if (currentClassName.indexOf(hoverClass) != -1) {
                        body.$.setAttribute('class', currentClassName.replace(hoverClassRegex, ''));
                    }

                    return false;
                });

                Compass.ErpApp.Utility.addEventHandler(body.$, 'drop', function (e) {
                    e.preventDefault();

                    me.fireEvent('ckeditordrop', me, e);

                    // remove drag over css
                    currentClassName = body.$.getAttribute('class');
                    if (currentClassName.indexOf(hoverClass) != -1) {
                        body.$.setAttribute('class', currentClassName.replace(hoverClassRegex, ''));
                    }

                    return false;
                });
            }
        });

        editor.extjsPanel = this;
        this.ckEditorInstance = editor;
        this.setValue(this.defaultValue);
    },

    textAreaResized: function (textarea, adjWidth, adjHeight) {

        if (!Compass.ErpApp.Utility.isBlank(this.ckEditorInstance)) {
            if (!Compass.ErpApp.Utility.isBlank(adjWidth) && !Compass.ErpApp.Utility.isBlank(adjHeight)) {
                var el = document.getElementById('cke_contents_' + this.inputEl.id);

                if (!Compass.ErpApp.Utility.isBlank(el)) {
                    var toolBoxDiv = document.getElementById('cke_top_' + this.inputEl.id).getElementsByTagName('div')[0];
                    var toolBoxEl = Ext.get(toolBoxDiv);
                    var displayValue = toolBoxEl.getStyle('display');
                    if (displayValue != 'none') {
                        //this.ckEditorInstance.execCommand( 'toolbarCollapse' );
                        el.style.height = adjHeight - 140 + 'px';
                        el.style.width = adjWidth + 'px';
                        //this.ckEditorInstance.execCommand( 'toolbarCollapse' );
                    }
                    else {
                        el.style.height = adjHeight - 70 + 'px';
                        el.style.width = adjWidth + 'px';
                    }

                }
                else {
                    this.ckEditorInstance.config.height = adjHeight - 140;
                }
            }
        }
    },

    setValue: function (value) {

        if (this.ckEditorInstance) {
            this.ckEditorInstance.setData(value);
        }
        else {
            this.defaultValue = value;
        }

    },

    getValue: function () {
        if (this.ckEditorInstance)
            var value = this.ckEditorInstance.getData();
        return value;
    },

    getRawValue: function () {
        if (this.ckEditorInstance)
            var value = this.ckEditorInstance.getData();
        return value;
    },

    insertHtml: function (html) {
        if (this.ckEditorInstance) {
            this.ckEditorInstance.focus();
            this.ckEditorInstance.insertHtml(html, 'unfiltered_html');
        }
    },

    insertElement: function (element) {
        if (this.ckEditorInstance) {
            this.ckEditorInstance.focus();
            this.ckEditorInstance.insertElement(element);
        }
    }
});