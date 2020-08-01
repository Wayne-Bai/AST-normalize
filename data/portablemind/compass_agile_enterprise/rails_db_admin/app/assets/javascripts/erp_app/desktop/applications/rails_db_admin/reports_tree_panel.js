Ext.define("Compass.ErpApp.Desktop.Applications.RailsDbAdmin.ReportsTreePanel", {
    extend:"Ext.tree.TreePanel",
    alias:'widget.railsdbadmin_reportstreepanel',

    newReport:function () {
        var me = this;

        Ext.create("Ext.window.Window", {
            title:'New Report',
            plain:true,
            buttonAlign:'center',
            items:Ext.create('Ext.FormPanel', {
                labelWidth:110,
                frame:false,
                bodyStyle:'padding:5px 5px 0',
                url:'/rails_db_admin/erp_app/desktop/reports/create',
                defaults:{
                    width:225
                },
                items:[
                    {
                        xtype:'textfield',
                        fieldLabel:'Title',
                        allowBlank:false,
                        name:'name'
                    },
                    {
                        xtype:'textfield',
                        fieldLabel:'Unique Name',
                        allowBlank:false,
                        name:'internal_identifier'
                    }
                ]
            }),
            buttons:[
                {
                    text:'Submit',
                    listeners:{
                        'click':function (button) {
                            var window = button.up('window');
                            var formPanel = window.down('form');
                            formPanel.getForm().submit({
                                waitMsg:'Creating Report...',
                                success:function (form, action) {
                                    var obj = Ext.decode(action.response.responseText);
                                    if (obj.success) {
                                        button.up('window').close();
                                        me.getStore().load();
                                    }
                                    else {
                                        Ext.Msg.alert("Error", obj.msg);
                                    }
                                },
                                failure:function (form, action) {
                                    var obj = Ext.decode(action.response.responseText);
                                    if (obj.msg) {
                                        Ext.Msg.alert("Error", obj.msg);
                                    }
                                    else {
                                        Ext.Msg.alert("Error", "Error creating report.");
                                    }
                                }
                            });
                        }
                    }
                },
                {
                    text:'Close',
                    handler:function (btn) {
                        btn.up('window').close();
                    }
                }
            ]
        }).show();
    },

    deleteReport:function (id) {
        var me = this;

        Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete this report?', function (btn) {
            if (btn === 'no') {
                return false;
            }
            else if (btn === 'yes') {
                Ext.Ajax.request({
                    url:'/rails_db_admin/erp_app/desktop/reports/delete',
                    params:{
                        id:id
                    },
                    success:function (responseObject) {
                        var obj = Ext.decode(responseObject.responseText);
                        if (obj.success) {
                            me.getStore().load();
                        }
                        else {
                            Ext.Msg.alert('Status', 'Error deleting report');
                        }
                    },
                    failure:function () {
                        Ext.Msg.alert('Status', 'Error deleting report');
                    }
                });
            }
        });
    },

    editReport:function (id) {
        var me = this;

        var waitMsg = Ext.Msg.wait("Loading report...", "Status");
        Ext.Ajax.request({
            url:'/rails_db_admin/erp_app/desktop/reports/edit',
            params:{
                id:id
            },
            success:function (responseObject) {
                waitMsg.close();
                var obj = Ext.decode(responseObject.responseText);
                if (obj.success) {
                    me.initialConfig.module.editReport(obj.report);
                }
                else {
                    Ext.Msg.alert('Status', 'Error deleting report');
                }
            },
            failure:function () {
                waitMsg.close();
                Ext.Msg.alert('Status', 'Error deleting report');
            }
        });
    },

    constructor:function (config) {
        var me = this;

        config = Ext.apply({
            title:'Reports',
            autoScroll:true,
            store:Ext.create('Ext.data.TreeStore', {
                proxy:{
                    type:'ajax',
                    url:'/rails_db_admin/erp_app/desktop/reports'
                },
                root:{
                    text:'Reports',
                    expanded:true,
                    draggable:false,
                    iconCls:'icon-reports'
                },
                fields:[
                    {
                        name:'text'
                    }, {
                        name:'iconCls'
                    }, {
                        name:'leaf'
                    }, {
                        name:'id'
                    }, {
                        name:'uniqueName'
                    }

                ]
            }),
            animate:false,
            listeners:{
                'itemclick':function (view, record, item, index, e) {
                    e.stopEvent();
                    if (record.data.leaf) {
                        me.editReport(record.data.id);
                    }
                },
                'itemcontextmenu':function (view, record, item, index, e) {
                    e.stopEvent();
                    var contextMenu = null;
                    if (record.data.leaf) {
                        contextMenu = Ext.create('Ext.menu.Menu',{
                            items:[
                                {
                                    text:"Edit Report",
                                    iconCls:'icon-settings',
                                    listeners:{
                                        scope:record,
                                        'click':function () {
                                            me.editReport(record.data.id);
                                        }
                                    }
                                },
                                {
                                    text:"Delete",
                                    iconCls:'icon-delete',
                                    listeners:{
                                        scope:record,
                                        'click':function () {
                                            me.deleteReport(record.data.id);
                                        }
                                    }
                                },
                                {
                                    text:"Info",
                                    iconCls:'icon-info',
                                    listeners:{
                                        scope:record,
                                        'click':function () {
                                            Ext.Msg.alert('Details', 'Title: '+record.data.text +
                                                '<br /> Unique Name: '+record.data.uniqueName
                                            );
                                        }
                                    }
                                }
                            ]
                        });
                    }
                    else {
                        contextMenu = Ext.create('Ext.menu.Menu',{
                            items:[
                                {
                                    text:"New Report",
                                    iconCls:'icon-document',
                                    listeners:{
                                        'click':function () {
                                            me.newReport();
                                        }
                                    }
                                }
                            ]
                        });
                    }
                    contextMenu.showAt(e.xy);
                }
            }
        }, config);

        this.callParent([config]);
    }
});

