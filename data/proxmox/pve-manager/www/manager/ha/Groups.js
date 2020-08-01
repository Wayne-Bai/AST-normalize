Ext.define('PVE.ha.GroupsView', {
    extend: 'Ext.grid.GridPanel',
    alias: ['widget.pveHAGroupsView'],

    initComponent : function() {
	var me = this;

	var store = new Ext.data.Store({
	    model: 'pve-ha-groups',
	    sorters: { 
		property: 'group', 
		order: 'DESC' 
	    }
	});
	
	var reload = function() {
	    store.load();
	};

	var sm = Ext.create('Ext.selection.RowModel', {});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];

            var win = Ext.create('PVE.ha.GroupEdit',{
                groupId: rec.data.group
            });
            win.on('destroy', reload);
            win.show();
	};

	var remove_btn = new PVE.button.Button({
	    text: gettext('Remove'),
	    disabled: true,
	    selModel: sm,
	    handler: function(btn, event, rec) {
		var group = rec.data.group;

		PVE.Utils.API2Request({
		    url: '/cluster/ha/groups/' + group,
		    method: 'DELETE',
		    waitMsgTarget: me,
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert(gettext('Error'), response.htmlStatus);
		    }
		});
	    }
	});
	
	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    disabled: true,
	    selModel: sm,
	    handler: run_editor
	});

	Ext.apply(me, {
	    store: store,
	    selModel: sm,
	    stateful: false,
	    viewConfig: {
		trackOver: false
	    },
	    tbar: [
		{
		    text: gettext('Create'),
		    handler: function() {
			var win = Ext.create('PVE.ha.GroupEdit',{});
			win.on('destroy', reload);
			win.show();
		    }
		},
		edit_btn, remove_btn
	    ],
	    columns: [
		{
		    header: gettext('Group'),
		    width: 150,
		    sortable: true,
		    dataIndex: 'group'
		},
		{
		    header: gettext('restricted'),
		    width: 100,
		    sortable: true,
		    renderer: PVE.Utils.format_boolean,
		    dataIndex: 'restricted'
		},
		{
		    header: gettext('nofailback'),
		    width: 100,
		    sortable: true,
		    renderer: PVE.Utils.format_boolean,
		    dataIndex: 'nofailback'
		},
		{
		    header: gettext('Nodes'),
		    flex: 1,
		    sortable: false,
		    dataIndex: 'nodes'
		},
		{
		    header: gettext('Comment'),
		    flex: 1,
		    dataIndex: 'comment'
		}
	    ],
	    listeners: {
		show: reload,
		itemdblclick: run_editor
	    }
	});

	me.callParent();
    }
});
