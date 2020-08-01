// fixme: howto avoid jslint type confusion?
/*jslint confusion: true */
Ext.define('PVE.qemu.HardwareView', {
    extend: 'PVE.grid.PendingObjectGrid',
    alias: ['widget.PVE.qemu.HardwareView'],

    renderKey: function(key, metaData, rec, rowIndex, colIndex, store) {
	var me = this;
	var rows = me.rows;
	var rowdef = rows[key] || {};

	metaData.tdAttr = "valign=middle";

	if (rowdef.tdCls) {
	    metaData.tdCls = rowdef.tdCls;
	    if (rowdef.tdCls == 'pve-itype-icon-storage') { 
		var value = me.getObjectValue(key, '', true);
		if (value.match(/media=cdrom/)) {
		    metaData.tdCls = 'pve-itype-icon-cdrom';
		    return rowdef.cdheader;
		}
	    }
	}
	return rowdef.header || key;
    },

    initComponent : function() {
	var me = this;
	var i, confid;

	var nodename = me.pveSelNode.data.node;
	if (!nodename) { 
	    throw "no node name specified";
	}

	var vmid = me.pveSelNode.data.vmid;
	if (!vmid) {
	    throw "no VM ID specified";
	}

	var caps = Ext.state.Manager.get('GuiCap');

	var rows = {
	    memory: {
		header: gettext('Memory'),
		editor: caps.vms['VM.Config.Memory'] ? 'PVE.qemu.MemoryEdit' : undefined,
		never_delete: true,
		defaultValue: 512,
		tdCls: 'pve-itype-icon-memory',
		renderer: function(value, metaData, record) {
		    var balloon =  me.getObjectValue('balloon');
		    if (balloon) {
			return PVE.Utils.format_size(balloon*1024*1024) + "/" + 
			    PVE.Utils.format_size(value*1024*1024);

		    } 
		    return PVE.Utils.format_size(value*1024*1024);
		}
	    },
	    sockets: {
		header: gettext('Processors'),
		never_delete: true,
		editor: (caps.vms['VM.Config.CPU'] || caps.vms['VM.Config.HWType']) ? 
		    'PVE.qemu.ProcessorEdit' : undefined,
		tdCls: 'pve-itype-icon-processor',
		defaultValue: 1,
		multiKey: ['sockets', 'cpu', 'cores', 'numa'],
		renderer: function(value, metaData, record, rowIndex, colIndex, store, pending) {

		    var sockets = me.getObjectValue('sockets', 1, pending);
		    var model = me.getObjectValue('cpu', undefined, pending);
		    var cores = me.getObjectValue('cores', 1, pending);
		    var numa = me.getObjectValue('numa', undefined, pending);

		    var res = (sockets*cores) + ' (' + sockets + ' sockets, ' + cores + ' cores)';
		    
		    if (model) {
			res += ' [' + model + ']';
		    }

		    if (numa) {
			res += ' [numa=' + numa +']';
		    }

		    return res;
		}
	    },
	    keyboard: {
		header: gettext('Keyboard Layout'),
		never_delete: true,
		editor: caps.vms['VM.Config.Options'] ? 'PVE.qemu.KeyboardEdit' : undefined,
		tdCls: 'pve-itype-icon-keyboard',
		defaultValue: '',
		renderer: PVE.Utils.render_kvm_language
	    },
	    vga: {
		header: gettext('Display'),
		editor: caps.vms['VM.Config.HWType'] ? 'PVE.qemu.DisplayEdit' : undefined,
		never_delete: true,
		tdCls: 'pve-itype-icon-display',
		defaultValue: '',
		renderer: PVE.Utils.render_kvm_vga_driver		
	    },
	    cores: {
		visible: false
	    },
	    cpu: {
		visible: false
	    },
	    numa: {
		visible: false
	    },
	    balloon: {
		visible: false
	    },
	    hotplug: {
		visible: false
	    }
	};

	for (i = 0; i < 4; i++) {
	    confid = "ide" + i;
	    rows[confid] = {
		group: 1,
		tdCls: 'pve-itype-icon-storage',
		editor: 'PVE.qemu.HDEdit',
		never_delete: caps.vms['VM.Config.Disk'] ? false : true,
		header: gettext('Hard Disk') + ' (' + confid +')',
		cdheader: gettext('CD/DVD Drive') + ' (' + confid +')'
	    };
	}
	for (i = 0; i < 6; i++) {
	    confid = "sata" + i;
	    rows[confid] = {
		group: 1,
		tdCls: 'pve-itype-icon-storage',
		editor: 'PVE.qemu.HDEdit',
		never_delete: caps.vms['VM.Config.Disk'] ? false : true,
		header: gettext('Hard Disk') + ' (' + confid +')',
		cdheader: gettext('CD/DVD Drive') + ' (' + confid +')'
	    };
	}
	for (i = 0; i < 16; i++) {
	    confid = "scsi" + i;
	    rows[confid] = {
		group: 1,
		tdCls: 'pve-itype-icon-storage',
		editor: 'PVE.qemu.HDEdit',
		never_delete: caps.vms['VM.Config.Disk'] ? false : true,
		header: gettext('Hard Disk') + ' (' + confid +')',
		cdheader: gettext('CD/DVD Drive') + ' (' + confid +')'
	    };
	}
	for (i = 0; i < 16; i++) {
	    confid = "virtio" + i;
	    rows[confid] = {
		group: 1,
		tdCls: 'pve-itype-icon-storage',
		editor: 'PVE.qemu.HDEdit',
		never_delete: caps.vms['VM.Config.Disk'] ? false : true,
		header: gettext('Hard Disk') + ' (' + confid +')',
		cdheader: gettext('CD/DVD Drive') + ' (' + confid +')'
	    };
	}
	for (i = 0; i < 32; i++) {
	    confid = "net" + i;
	    rows[confid] = {
		group: 2,
		tdCls: 'pve-itype-icon-network',
		editor: caps.vms['VM.Config.Network'] ? 'PVE.qemu.NetworkEdit' : undefined,
		never_delete: caps.vms['VM.Config.Network'] ? false : true,
		header: gettext('Network Device') + ' (' + confid +')'
	    };
	}
	for (i = 0; i < 8; i++) {
	    rows["unused" + i] = {
		group: 3,
		tdCls: 'pve-itype-icon-storage',
		editor: caps.vms['VM.Config.Disk'] ? 'PVE.qemu.HDEdit' : undefined,
		header: gettext('Unused Disk') + ' ' + i
	    };
	}

	var sorterFn = function(rec1, rec2) {
	    var v1 = rec1.data.key;
	    var v2 = rec2.data.key;
	    var g1 = rows[v1].group || 0;
	    var g2 = rows[v2].group || 0;
	    
	    return (g1 !== g2) ? 
		(g1 > g2 ? 1 : -1) : (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0));
	};

	var reload = function() {
	    me.rstore.load();
	};

	var baseurl = 'nodes/' + nodename + '/qemu/' + vmid + '/config';

	var sm = Ext.create('Ext.selection.RowModel', {});

	var run_editor = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var rowdef = rows[rec.data.key];
	    if (!rowdef.editor) {
		return;
	    }

	    var editor = rowdef.editor;
	    if (rowdef.tdCls == 'pve-itype-icon-storage') {
		var value = me.getObjectValue(rec.data.key, '', true); 
		if (value.match(/media=cdrom/)) {
		    editor = 'PVE.qemu.CDEdit';
		}
	    }

	    var win = Ext.create(editor, {
		pveSelNode: me.pveSelNode,
		confid: rec.data.key,
		hotplug: me.getObjectValue('hotplug'),
		url: '/api2/extjs/' + baseurl
	    });

	    win.show();
	    win.on('destroy', reload);
	};

	var run_diskthrottle = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

            var win = Ext.create('PVE.qemu.HDThrottle', {
		pveSelNode: me.pveSelNode,
		confid: rec.data.key,
		url: '/api2/extjs/' + baseurl
	    });

	    win.show();
	    win.on('destroy', reload);
	};

	var run_resize = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var win = Ext.create('PVE.window.HDResize', {
		disk: rec.data.key,
		nodename: nodename,
		vmid: vmid
	    });

	    win.show();

	    win.on('destroy', reload);
	};

	var run_move = function() {
	    var rec = sm.getSelection()[0];
	    if (!rec) {
		return;
	    }

	    var win = Ext.create('PVE.window.HDMove', {
		disk: rec.data.key,
		nodename: nodename,
		vmid: vmid
	    });

	    win.show();

	    win.on('destroy', reload);
	};

	var edit_btn = new PVE.button.Button({
	    text: gettext('Edit'),
	    selModel: sm,
	    disabled: true,
	    handler: run_editor
        });

	var resize_btn = new PVE.button.Button({
	    text: gettext('Resize disk'),
	    selModel: sm,
	    disabled: true,
	    handler: run_resize
	});

	var move_btn = new PVE.button.Button({
	    text: gettext('Move disk'),
	    selModel: sm,
	    disabled: true,
	    handler: run_move
	});

	var diskthrottle_btn = new PVE.button.Button({
	    text: gettext('Disk Throttle'),
	    selModel: sm,
	    disabled: true,
	    handler: run_diskthrottle
	});

	var remove_btn = new PVE.button.Button({
	    text: gettext('Remove'),
	    selModel: sm,
	    disabled: true,
	    dangerous: true,
	    confirmMsg: function(rec) {
		var msg = Ext.String.format(gettext('Are you sure you want to remove entry {0}'),
					    "'" + me.renderKey(rec.data.key, {}, rec) + "'");
		if (rec.data.key.match(/^unused\d+$/)) {
		    msg += " " + gettext('This will permanently erase all image data.');
		}

		return msg;
	    },
	    handler: function(b, e, rec) {
		PVE.Utils.API2Request({
		    url: '/api2/extjs/' + baseurl,
		    waitMsgTarget: me,
		    method: 'PUT',
		    params: {
			'delete': rec.data.key
		    },
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert('Error', response.htmlStatus);
		    }
		});
	    }
	});

	var revert_btn = new PVE.button.Button({
	    text: gettext('Revert'),
	    selModel: sm,
	    disabled: true,
	    handler: function(b, e, rec) {
		var rowdef = me.rows[rec.data.key] || {};
		var keys = rowdef.multiKey ||  [ rec.data.key ];
		var revert = keys.join(',');
		PVE.Utils.API2Request({
		    url: '/api2/extjs/' + baseurl,
		    waitMsgTarget: me,
		    method: 'PUT',
		    params: {
			'revert': revert
		    },
		    callback: function() {
			reload();
		    },
		    failure: function (response, opts) {
			Ext.Msg.alert('Error',response.htmlStatus);
		    }
		});
	    }
	});

	var set_button_status = function() {
	    var sm = me.getSelectionModel();
	    var rec = sm.getSelection()[0];

	    if (!rec) {
		remove_btn.disable();
		edit_btn.disable();
		resize_btn.disable();
		move_btn.disable();
		diskthrottle_btn.disable();
		revert_btn.disable();
		return;
	    }
	    var key = rec.data.key;
	    var value = rec.data.value;
	    var rowdef = rows[key];

	    var pending = rec.data['delete'] || me.hasPendingChanges(key);
	    var isDisk = !key.match(/^unused\d+/) && 
		(rowdef.tdCls == 'pve-itype-icon-storage' && !value.match(/media=cdrom/));

	    remove_btn.setDisabled(rec.data['delete'] || (rowdef.never_delete === true));

	    edit_btn.setDisabled(rec.data['delete'] || !rowdef.editor);

	    resize_btn.setDisabled(pending || !isDisk);

	    move_btn.setDisabled(pending || !isDisk);

	    diskthrottle_btn.setDisabled(pending || !isDisk);

	    revert_btn.setDisabled(!pending);
	};

	Ext.applyIf(me, {
	    url: '/api2/json/' + 'nodes/' + nodename + '/qemu/' + vmid + '/pending',
	    interval: 5000,
	    selModel: sm,
	    cwidth1: 170,
	    tbar: [ 
		{
		    text: gettext('Add'),
		    menu: new Ext.menu.Menu({
			items: [
			    {
				text: gettext('Hard Disk'),
				iconCls: 'pve-itype-icon-storage',
				disabled: !caps.vms['VM.Config.Disk'],
				handler: function() {
				    var win = Ext.create('PVE.qemu.HDEdit', {
					url: '/api2/extjs/' + baseurl,
					pveSelNode: me.pveSelNode
				    });
				    win.on('destroy', reload);
				    win.show();
				}
			    },
			    {
				text: gettext('CD/DVD Drive'),
				iconCls: 'pve-itype-icon-cdrom',
				disabled: !caps.vms['VM.Config.Disk'],
				handler: function() {
				    var win = Ext.create('PVE.qemu.CDEdit', {
					url: '/api2/extjs/' + baseurl,
					pveSelNode: me.pveSelNode
				    });
				    win.on('destroy', reload);
				    win.show();
				}
			    },
			    {
				text: gettext('Network Device'),
				iconCls: 'pve-itype-icon-network',
				disabled: !caps.vms['VM.Config.Network'],
				handler: function() {
				    var win = Ext.create('PVE.qemu.NetworkEdit', {
					url: '/api2/extjs/' + baseurl,
					pveSelNode: me.pveSelNode
				    });
				    win.on('destroy', reload);
				    win.show();
				}
			    }
			]
		    })
		}, 
		remove_btn,
		edit_btn,
		resize_btn,
		move_btn,
		diskthrottle_btn,
		revert_btn
	    ],
	    rows: rows,
	    sorterFn: sorterFn,
	    listeners: {
		itemdblclick: run_editor,
		selectionchange: set_button_status
	    }
	});

	me.callParent();

	me.on('show', me.rstore.startUpdate);
	me.on('hide', me.rstore.stopUpdate);
	me.on('destroy', me.rstore.stopUpdate);	

	me.rstore.on('datachanged', function() {
	    set_button_status();
	});
    }
});
