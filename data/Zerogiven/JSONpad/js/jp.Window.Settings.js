jp.Window.Settings = Ext.extend(Ext.Window, {
    layout: 'form',
    width: 500,
    //height: 300,
    closeAction: 'hide',
    plain: true,
    modal: true,
    resizable: false,
    draggable: false,
    title: 'JSONpad settings',

    initComponent: function() {
	this.items = [{
		xtype: 'jp.Window.Settings.form'
	}];

	jp.Window.Settings.superclass.initComponent.call(this);
    }
});

Ext.reg('jp.Window.Settings', jp.Window.Settings);