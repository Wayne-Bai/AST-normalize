Ext.define('PVE.form.RoleSelector', {
    extend: 'PVE.form.ComboGrid',
    alias: ['widget.pveRoleSelector'],

    initComponent: function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pve-roles'
	});

	Ext.apply(me, {
	    store: store,
	    allowBlank: false,
	    autoSelect: false,
	    valueField: 'roleid',
	    displayField: 'roleid',
            listConfig: {
		columns: [
		    {
			header: gettext('Role'),
			sortable: true,
			dataIndex: 'roleid',
			flex: 1
		    }
		]
	    }
	});

        me.callParent();

	store.load();
    }

}, function() {

    Ext.define('pve-roles', {
	extend: 'Ext.data.Model',
	fields: [ 'roleid', 'privs' ],
	proxy: {
            type: 'pve',
	    url: "/api2/json/access/roles"
	},
	idProperty: 'roleid'
    });

});
