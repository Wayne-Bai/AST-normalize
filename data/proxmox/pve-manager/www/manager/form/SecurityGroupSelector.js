Ext.define('PVE.form.SecurityGroupsSelector', {
    extend: 'PVE.form.ComboGrid',
    alias: ['widget.pveSecurityGroupsSelector'],

    initComponent: function() {
	var me = this;

	var store = Ext.create('Ext.data.Store', {
	    autoLoad: true,
	    fields: [ 'group', 'comment' ],
	    idProperty: 'group',
	    proxy: {
		type: 'pve',
		url: "/api2/json/cluster/firewall/groups"
	    },
	    sorters: {
		property: 'group',
		order: 'DESC'
	    }
	});

	Ext.apply(me, {
	    store: store,
	    valueField: 'group',
	    displayField: 'group',
            listConfig: {
		columns: [
		    {
			header: gettext('Security Group'),
			dataIndex: 'group',
			hideable: false,
			width: 100
		    },
		    {
			header: gettext('Comment'),  
			dataIndex: 'comment', 
			flex: 1
		    }
		]
	    }
	});

        me.callParent();
    }
});

