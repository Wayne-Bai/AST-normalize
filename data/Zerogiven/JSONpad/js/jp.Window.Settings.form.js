jp.Window.Settings.form = Ext.extend(Ext.FormPanel, {
    autoHeight: true,
    bodyStyle: 'padding: 10px 10px 0 10px;',
    labelWidth: 250,
    frame: true,
    defaults: {
	anchor: '100%'
    },

    parent: null,

    initComponent: function() {
	this.items = this.getSettingsFormItems();

	this.buttons = this.getFormButtons();

	/*this.listeners = {
	    'afterrender': this.afterRender,
	    scope: this
	};*/

	this.parent = this.findParentByType("jp.Window.Settings");

	jp.Window.Settings.form.superclass.initComponent.call(this);
    },

    getSettingsFormItems: function () {
	debug.trace(jp.App.config);
	return [{
	    xtype: 'checkbox',
	    fieldLabel: 'Register *.json files for JSONpad',
	    name: 'registerJsonFiles',
	    checked: jp.App.config.registerJsonFiles,
	    hidden: (!Ext.isAir)
	},{
	    xtype: 'checkbox',
	    fieldLabel: 'Activate syntax highlighting on startup',
	    name: 'syntaxHighlightOnLoad',
	    checked: jp.App.config.syntaxHighlightOnLoad
	},{
	    xtype: 'checkbox',
	    fieldLabel: 'Check for updates on startup',
	    name: 'checkForUpdatesOnLoad',
	    checked: jp.App.config.checkForUpdatesOnLoad,
	    hidden: (!Ext.isAir)
	},{
	    xtype:          'combo',
	    mode:           'local',
	    value:          jp.App.config.jsonValidateLevel,
	    forceSelection: true,
	    typeAhead:      true,
	    triggerAction:  'all',
	    //editable:       false,
	    fieldLabel:     'JSON Validate Level',
	    name:           'jsonValidateLevel_combo',
	    hiddenName:     'jsonValidateLevel',
	    displayField:   'caption',
	    valueField:     'type',
	    tpl: new Ext.XTemplate(
		'<tpl for="."><div class="x-combo-list-item" style="padding: 2px;">', //@todo Make a css class
		'<b>{caption}</b><br />',
		'{description}',
		'</div></tpl>'
		),
	    store: new Ext.data.ArrayStore({
		fields: ['caption', 'description', 'type'],
		data : [
		['Strict', 'Validate all JSON errors strict like JSlint', 1],
		['Easy', 'Ignore scripts inside JSON data', 0]
		]
	    })
	}];
    },

    getFormButtons: function () {
	var me = this;
	return [{
	    text: 'Save',
	    handler: function(){
		var form = me.getForm();
		debug.trace(form.isValid());
		if (form.isValid()) {
		    if (Ext.isAir) {
		    //@todo AIR | Import JSON data form submit
		    } else {
			var config = me.getForm().getFieldValues();

			jp.App.setJsonPadConfig(config);

			me.parent.close();
		    }
		}
	    }
	}];
    }
});

Ext.reg('jp.Window.Settings.form', jp.Window.Settings.form);