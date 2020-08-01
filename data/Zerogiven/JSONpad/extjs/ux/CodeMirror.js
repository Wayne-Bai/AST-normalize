/*global Ext,  JSLINT, CodeMirror  */

/**
 * @class Ext.ux.panel.CodeMirror
 * @extends Ext.Panel
 * Converts a panel into a code mirror editor with toolbar
 * @constructor
 *
 * @author Dan Ungureanu - ungureanu.web@gmail.com / http://www.devweb.ro
 * @version 0.1
 */

// Define a set of code type configurations
Ext.ns('Ext.ux.panel.CodeMirrorConfig');
Ext.apply(Ext.ux.panel.CodeMirrorConfig, {
    cssPath: "lib/CodeMirror/web/css/",
    jsPath: "lib/CodeMirror/web/js/"
});
Ext.apply(Ext.ux.panel.CodeMirrorConfig, {
    parser: {
	defo: { // js code
	    parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
	    stylesheet: Ext.ux.panel.CodeMirrorConfig.cssPath + "jscolors.css"
	},
	css: {
	    parserfile: ["parsecss.js"],
	    stylesheet: Ext.ux.panel.CodeMirrorConfig.cssPath + "csscolors.css"
	},
	js: {
	    parserfile: ["tokenizejavascript.js", "parsejavascript.js"],
	    stylesheet: Ext.ux.panel.CodeMirrorConfig.cssPath + "jscolors.css"
	},
	xml: {
	    parserfile: ["parsexml.js"],
	    stylesheet: [Ext.ux.panel.CodeMirrorConfig.cssPath + "xmlcolors.css"]
	},
	php: {
	    parserfile: ["tokenizephp.js", "parsephp.js"],
	    stylesheet: Ext.ux.panel.CodeMirrorConfig.cssPath + "phpcolors.css"
	},
	html: {
	    parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "tokenizephp.js", "parsephp.js", "parsephphtmlmixed.js"],
	    stylesheet: [Ext.ux.panel.CodeMirrorConfig.cssPath + "xmlcolors.css", Ext.ux.panel.CodeMirrorConfig.cssPath + "jscolors.css", Ext.ux.panel.CodeMirrorConfig.cssPath + "csscolors.css", Ext.ux.panel.CodeMirrorConfig.cssPath + "phpcolors.css"]

	},
	mixed: {
	    parserfile: ["parsexml.js", "parsecss.js", "tokenizejavascript.js", "parsejavascript.js", "tokenizephp.js", "parsephp.js", "parsephphtmlmixed.js"],
	    stylesheet: [Ext.ux.panel.CodeMirrorConfig.cssPath + "xmlcolors.css", Ext.ux.panel.CodeMirrorConfig.cssPath + "jscolors.css", Ext.ux.panel.CodeMirrorConfig.cssPath + "csscolors.css", Ext.ux.panel.CodeMirrorConfig.cssPath + "phpcolors.css"]

	}
    }
});

Ext.ns('Ext.ux.panel.CodeMirror');
Ext.ux.panel.CodeMirror = Ext.extend(Ext.Panel, {

    codeMirrorHidden: false,
    sourceCode: '/* Default code */',
    codeMirrorInitCallback: null,
    initComponent: function() {
	// this property is used to determine if the source content changes
	this.contentChanged = false;
	var oThis = this;
	/*this.debugWindow = new Ext.Window({
	    title: 'Debug',
	    width: 500,
	    layout: 'border',
	    closeAction: 'hide',
	    height: 160,
	    items: [new Ext.grid.GridPanel({
		layout: 'fit',
		region: 'center',
		border: false,
		listeners: {
		    rowclick: function(grid) {
			var oData = grid.getSelectionModel().getSelected().data;
			oThis.codeMirrorEditor.jumpToLine(oData.line);
		    }
		},
		store: new Ext.data.ArrayStore({
		    fields: [{
			name: 'line'
		    }, {
			name: 'character'
		    }, {
			name: 'reason'
		    }]
		}),
		columns: [{
		    id: 'line',
		    header: 'Line',
		    width: 60,
		    sortable: true,
		    dataIndex: 'line'
		}, {
		    id: 'character',
		    header: 'Character',
		    width: 60,
		    sortable: true,
		    dataIndex: 'character'
		}, {
		    header: 'Description',
		    width: 240,
		    sortable: true,
		    dataIndex: 'reason'
		}],
		stripeRows: true
	    })]
	});*/

	Ext.apply(this, {
	    items: [{
		xtype: 'textarea',
		readOnly: false,
		hidden: true,
		value: this.sourceCode,
	    //grow: 'true'
	    }]
	/*tbar: [{
		text: 'Undo',
		handler: function() {
		    this.codeMirrorEditor.undo();
		},
		scope: this
	    }, {
		text: 'Redo',
		handler: function() {
		    this.codeMirrorEditor.redo();
		},
		scope: this
	    }, '-', {
		text: 'Indent',
		handler: function() {
		    this.codeMirrorEditor.reindent();
		},
		scope: this
	    }, {
		itemId: 'spellChecker',
		disabled: true,
		text: 'JS Lint',
		handler: function() {
		    try {
			var bValidates = JSLINT(this.findByType('textarea')[0].getValue());

			var oStore = this.debugWindow.findByType('grid')[0].getStore();
			if (!bValidates) {
			    var aErrorData = [];

			    for (var err in JSLINT.errors) {
				if (JSLINT.errors.hasOwnProperty(err) && (JSLINT.errors[err] !== null)) {
				    aErrorData.push([JSLINT.errors[err].line, JSLINT.errors[err].character, JSLINT.errors[err].reason]);
				}
			    }

			    oStore.loadData(aErrorData, false);
			    this.debugWindow.show();

			}
			else {

			    oStore.loadData([[1, 1, 'Congratulation! No errors found.']], false);
			    this.debugWindow.show();
			}
		    }catch(e){}

		},
		scope: this
	    }]*/
	});

	Ext.ux.panel.CodeMirror.superclass.initComponent.apply(this, arguments);
    },

    /*triggerOnSave: function(){
	this.setTitleClass(true);
	var sNewCode = this.codeMirrorEditor.getCode();

	Ext.state.Manager.set("edcmr_"+this.itemId+'_lnmbr', this.codeMirrorEditor.currentLine());

	this.oldSourceCode = sNewCode;
	this.onSave(arguments[0] || false);
    },*/

    onRender: function() {
	this.oldSourceCode = this.sourceCode;
	Ext.ux.panel.CodeMirror.superclass.onRender.apply(this, arguments);
	// trigger editor on afterlayout
	this.on('afterlayout', this.triggerCodeEditor, this, {
	    single: true
	});

    },

    /** @private */
    triggerCodeEditor: function() {
	//this.codeMirrorEditor;
	var oThis = this;
	var oCmp = this.findByType('textarea')[0];
	var editorConfig = Ext.applyIf(this.codeMirror || {}, {
	    /*height: "100%",
	    width: "100%",*/
	    lineNumbers: false,
	    textWrapping: false,
	    content: oCmp.getValue(),
	    indentUnit: 4,
	    tabMode: 'shift',
	    readOnly: oCmp.readOnly,
	    path: Ext.ux.panel.CodeMirrorConfig.jsPath,
	    autoMatchParens: true,
	    iframeClass: 'codemirror-iframe',
	    initCallback: function(editor) {
		editor.win.document.body.lastChild.scrollIntoView();
		try {
		    var iLineNmbr = ((Ext.state.Manager.get("edcmr_" + oThis.itemId + '_lnmbr') !== undefined) ? Ext.state.Manager.get("edcmr_" + oThis.itemId + '_lnmbr') : 1);
		    //console.log(iLineNmbr);
		    editor.jumpToLine(iLineNmbr);

		    if (oThis.codeMirrorInitCallback != null) oThis.codeMirrorInitCallback(oThis);
		}catch(e){
		//console.error(e);
		}
	    },
	    onChange: function() {
		var sCode = oThis.codeMirrorEditor.getCode();
		oCmp.setValue(sCode);

		if(oThis.oldSourceCode == sCode){
		    oThis.setTitleClass(true);
		}else{
		    oThis.setTitleClass();
		}

	    }
	});

	var sParserType = oThis.parser || 'defo';
	editorConfig = Ext.applyIf(editorConfig, Ext.ux.panel.CodeMirrorConfig.parser[sParserType]);

	this.codeMirrorEditor = new CodeMirror.fromTextArea( Ext.getDom(oCmp.id).id, editorConfig);

	var iframeEl = Ext.select('div#'+this.id + ' > div > div > .CodeMirror-wrapping', true);
	var textareaEl = Ext.select('div#'+this.id + ' > div > div > textarea', true);

	textareaEl.setVisibilityMode(Ext.Element.DISPLAY);
	iframeEl.setVisibilityMode(Ext.Element.DISPLAY);

	if (this.codeMirrorHidden) this.hideCodeMirror();
    },

    setTitleClass: function(){
	//var tabEl = Ext.get(this.ownerCt.getTabEl( this ));
	if(arguments[0] === true){// remove class
	    //tabEl.removeClass( "tab-changes" );
	    this.contentChanged = false;
	}else{//add class
	    //tabEl.addClass( "tab-changes" );
	    this.contentChanged = true;
	}
    },

    hideCodeMirror: function () {
	var iframeEl = Ext.select('div#'+this.id + ' > div > div > .CodeMirror-wrapping', true);
	var textareaEl = Ext.select('div#'+this.id + ' > div > div > textarea', true);

	this.items.itemAt(0).setValue( this.getValue() );

	iframeEl.setVisible(false);
	textareaEl.setVisible(true);
	textareaEl.removeClass('x-hide-display');

	this.items.itemAt(0).setWidth("100%");
	this.items.itemAt(0).setHeight("100%");

	this.codeMirrorHidden = true;
    },
    showCodeMirror: function () {
	var iframeEl = Ext.select('div#'+this.id + ' > div > div > .CodeMirror-wrapping', true);
	var textareaEl = Ext.select('div#'+this.id + ' > div > div >textarea', true);

	this.setValue( this.items.itemAt(0).getValue() );

	textareaEl.addClass('x-hide-display');
	textareaEl.setVisible(false);
	iframeEl.setVisible(true);

	this.codeMirrorHidden = false;
    },

    getValue: function() {
	return this.codeMirrorEditor.getCode();
    },

    setValue: function(text) {
	this.codeMirrorEditor.setCode(text);
    },

    setValueAtCursor: function(text) {
	var cursorPosition = this.codeMirrorEditor.cursorPosition();
	var handleForCursorLine = this.codeMirrorEditor.cursorLine();
	this.codeMirrorEditor.insertIntoLine(handleForCursorLine, cursorPosition.character, text);
    }
});


Ext.reg('uxCodeMirrorPanel', Ext.ux.panel.CodeMirror);