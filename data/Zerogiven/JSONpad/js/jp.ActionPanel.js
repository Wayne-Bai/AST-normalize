Ext.ns('jp');

jp.ActionPanel = Ext.extend(Ext.Panel, {
    title: 'JSONpad',
    region: 'north',
    initComponent: function() {
	this.tbar = {
	    xtype: 'container',
	    layout: 'anchor',
	    cls: 'parentToolbar',
	    items: [
	    this.getMainBar(),
	    this.getIconBar()
	    ]
	};

	jp.ActionPanel.superclass.initComponent.call(this);
    },

    getMainBar: function () {
	return {
	    xtype: 'jp.ActionPanel.MainBar'
	};
    },

    getIconBar: function () {
	return {
	    xtype: 'jp.ActionPanel.IconBar'
	};
    }
});

Ext.reg('jp.ActionPanel', jp.ActionPanel);