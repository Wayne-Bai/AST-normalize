Ext.define('PVE.form.SnapshotSelector', {
    extend: 'PVE.form.ComboGrid',
    alias: ['widget.PVE.form.SnapshotSelector'],

    loadStore: function(nodename, vmid) {
	var me = this;

	if (!nodename) {
	    return;
	}

	me.nodename = nodename;

        if (!vmid) {
	    return;
        }

	me.vmid = vmid;

	me.store.setProxy({
	    type: 'pve',
	    url: '/api2/json/nodes/' + me.nodename + '/qemu/' + me.vmid +'/snapshot'
	});

	me.store.load();
    },

    initComponent: function() {
	var me = this;

        if (!me.nodename) {
            throw "no node name specified";
        }

        if (!me.vmid) {
            throw "no VM ID specified";
        }

	var store = Ext.create('Ext.data.Store', {
	    fields: [ 'name'],
	    filterOnLoad: true
	});

	Ext.apply(me, {
	    store: store,
	    valueField: 'name',
	    displayField: 'name',
            listConfig: {
		columns: [
		    {
			header: gettext('Snapshot'),
			dataIndex: 'name',
			hideable: false,
			flex: 1
		    }
		]
	    }
	});

        me.callParent();

	me.loadStore(me.nodename, me.vmid);
    }
});
