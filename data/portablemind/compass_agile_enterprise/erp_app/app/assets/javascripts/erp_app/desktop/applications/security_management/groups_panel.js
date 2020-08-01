Ext.define("Compass.ErpApp.Desktop.Applications.SecurityManagement.GroupsPanel", {
    extend: "Ext.panel.Panel",
    alias: 'widget.security_management_groupspanel',

    setGroup: function (record) {
        var assign_to_id = record.get('id');
        var assign_to_description = record.get('description');

        var security_management_groupspanel = this;
        var southPanel = Ext.ComponentQuery.query('security_management_southpanel').first();

        var security_management_userswidget = southPanel.down('security_management_userswidget');
        security_management_userswidget.assign_to_id = assign_to_id;
        security_management_userswidget.assign_to_description = assign_to_description;

        var security_management_roleswidget = southPanel.down('security_management_roleswidget');
        security_management_roleswidget.assign_to_id = assign_to_id;
        security_management_roleswidget.assign_to_description = assign_to_description;

        var security_management_capabilitieswidget = southPanel.down('security_management_capabilitieswidget');
        security_management_capabilitieswidget.assign_to_id = assign_to_id;
        security_management_capabilitieswidget.assign_to_description = assign_to_description;

        var security_management_groupseffectivesecurity = southPanel.down('security_management_groupseffectivesecurity');
        security_management_groupseffectivesecurity.assign_to_id = assign_to_id;
        security_management_groupseffectivesecurity.assign_to_description = assign_to_description;
    },

    unsetGroup: function () {
        var security_management_rolespanel = this;
        var southPanel = Ext.ComponentQuery.query('security_management_southpanel').first();

        var security_management_userswidget = southPanel.down('security_management_userswidget');
        delete security_management_userswidget.assign_to_id;
        delete security_management_userswidget.assign_to_description;

        var security_management_roleswidget = southPanel.down('security_management_roleswidget');
        delete security_management_roleswidget.assign_to_id;
        delete security_management_roleswidget.assign_to_description;

        var security_management_capabilitieswidget = southPanel.down('security_management_capabilitieswidget');
        delete security_management_capabilitieswidget.assign_to_id;
        delete security_management_capabilitieswidget.assign_to_description;

        var security_management_groupseffectivesecurity = southPanel.down('security_management_groupseffectivesecurity');
        delete security_management_groupseffectivesecurity.assign_to_id;
        delete security_management_groupseffectivesecurity.assign_to_description;
    },

    constructor: function (config) {
        var self = this;

        config = Ext.apply({
            width: 460,
            title: 'Groups',
            autoScroll: true,
            tbar: [
                {
                    text: 'New Group',
                    iconCls: 'icon-add',
                    handler: function (btn) {
                        var newWindow = Ext.create("Ext.window.Window", {
                            title: 'New Group',
                            plain: true,
                            buttonAlign: 'center',
                            items: Ext.create('Ext.form.Panel', {
                                labelWidth: 110,
                                frame: false,
                                bodyStyle: 'padding:5px 5px 0',
                                url: '/erp_app/desktop/security_management/groups/create',
                                defaults: {
                                    width: 225
                                },
                                items: [
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Group Name',
                                        allowBlank: false,
                                        name: 'description',
                                        listeners: {
                                            afterrender: function (field) {
                                                field.focus(false, 200);
                                            },
                                            specialkey: function (field, e) {
                                                if (e.getKey() == e.ENTER) {
                                                    var button = field.findParentByType('window').down('#submitButton');
                                                    button.fireEvent('click', button);
                                                }
                                            }
                                        }
                                    }
                                ]
                            }),
                            buttons: [
                                {
                                    text: 'Submit',
                                    itemId: 'submitButton',
                                    listeners: {
                                        'click': function (button) {
                                            var formPanel = button.findParentByType('window').down('form');
                                            formPanel.getForm().submit({
                                                success: function (form, action) {
                                                    var obj = Ext.decode(action.response.responseText);
                                                    if (obj.success) {
                                                        var all_groups = self.down('#all_groups').down('shared_dynamiceditablegrid');
                                                        all_groups.getStore().load();
                                                        newWindow.close();
                                                    }
                                                    else {
                                                        Ext.Msg.alert("Error", obj.message);
                                                    }
                                                },
                                                failure: function (form, action) {
                                                    var obj = Ext.decode(action.response.responseText);
                                                    if (obj !== null) {
                                                        Ext.Msg.alert("Error", obj.message);
                                                    }
                                                    else {
                                                        Ext.Msg.alert("Error", "Error importing website");
                                                    }
                                                }
                                            });
                                        }
                                    }
                                },
                                {
                                    text: 'Close',
                                    handler: function () {
                                        newWindow.close();
                                    }
                                }
                            ]
                        });
                        newWindow.show();
                    }
                },
                {
                    text: 'Edit Group',
                    iconCls: 'icon-edit',
                    handler: function (btn) {
                        var all_groups = self.down('#all_groups').down('shared_dynamiceditablegrid');
                        var selection = all_groups.getSelectionModel().getSelection().first();
                        if (Ext.isEmpty(selection)) {
                            Ext.Msg.alert('Error', 'Please make a selection.');
                            return false;
                        }
                        var newWindow = Ext.create("Ext.window.Window", {
                            title: 'Edit Group',
                            plain: true,
                            buttonAlign: 'center',
                            items: Ext.create('Ext.form.Panel', {
                                labelWidth: 110,
                                frame: false,
                                bodyStyle: 'padding:5px 5px 0',
                                url: '/erp_app/desktop/security_management/groups/update',
                                defaults: {
                                    width: 225
                                },
                                items: [
                                    {
                                        xtype: 'textfield',
                                        fieldLabel: 'Group Name',
                                        allowBlank: false,
                                        name: 'description',
                                        value: selection.get('description'),
                                        listeners: {
                                            afterrender: function (field) {
                                                field.focus(true, 200);
                                            },
                                            specialkey: function (field, e) {
                                                if (e.getKey() == e.ENTER) {
                                                    var button = field.findParentByType('window').down('#submitButton');
                                                    button.fireEvent('click', button);
                                                }
                                            }
                                        }
                                    }
                                ]
                            }),
                            buttons: [
                                {
                                    text: 'Submit',
                                    itemId: 'submitButton',
                                    listeners: {
                                        'click': function (button) {
                                            var formPanel = button.findParentByType('window').down('form');
                                            formPanel.getForm().submit({
                                                params: {
                                                    id: selection.get('id'),
                                                    description: selection.get('description')
                                                },
                                                success: function (form, action) {
                                                    var obj = Ext.decode(action.response.responseText);
                                                    if (obj.success) {
                                                        var all_groups = self.down('#all_groups').down('shared_dynamiceditablegrid');
                                                        all_groups.getStore().load();
                                                        newWindow.close();
                                                    }
                                                    else {
                                                        Ext.Msg.alert("Error", obj.message);
                                                    }
                                                },
                                                failure: function (form, action) {
                                                    var obj = Ext.decode(action.response.responseText);
                                                    if (obj !== null) {
                                                        Ext.Msg.alert("Error", obj.message);
                                                    }
                                                    else {
                                                        Ext.Msg.alert("Error", "Error importing website");
                                                    }
                                                }
                                            });
                                        }
                                    }
                                },
                                {
                                    text: 'Close',
                                    handler: function () {
                                        newWindow.close();
                                    }
                                }
                            ]
                        });
                        newWindow.show();
                    }
                },
                {
                    text: 'Delete Group',
                    iconCls: 'icon-delete',
                    handler: function (btn) {
                        var all_groups = self.down('#all_groups').down('shared_dynamiceditablegrid');
                        var selection = all_groups.getSelectionModel().getSelection().first();
                        if (Ext.isEmpty(selection)) {
                            Ext.Msg.alert('Error', 'Please make a selection.');
                            return false;
                        }
                        Ext.MessageBox.confirm('Confirm', 'Are you sure?', function (btn) {
                            if (btn == 'no') {
                                return false;
                            }
                            else if (btn == 'yes') {
                                Ext.Ajax.request({
                                    url: '/erp_app/desktop/security_management/groups/delete',
                                    method: 'POST',
                                    params: {
                                        id: selection.get('id')
                                    },
                                    success: function (response) {
                                        var json_response = Ext.decode(response.responseText);
                                        if (json_response.success) {
                                            self.unsetGroup();
                                            self.down('tabpanel').getActiveTab().refreshWidget();
                                            all_groups.getStore().load();
                                        } else {
                                            Ext.Msg.alert('Error', Ext.decode(response.responseText).message);
                                        }
                                    },
                                    failure: function (response) {
                                        Ext.Msg.alert('Error', 'Error Retrieving Effective Security');
                                    }
                                });
                            }
                        });
                    }
                }
            ],
            items: [
                {
                    xtype: 'security_management_group_grid',
                    itemId: 'all_groups',
                    height: 275,
                    setupUrl: '/erp_app/desktop/security_management/groups/available_setup',
                    dataUrl: '/erp_app/desktop/security_management/groups/available',
                    multiSelect: false,
                    grid_listeners: {
                        afterrender: function (grid) {
                            // autoLoad was causing erroneous calls to /erp_app/desktop/true so we manually load here
                            grid.getStore().load();
                        },
                        itemclick: function (grid, record, index, eOpts) {
                            self.setGroup(record);

                            // get active tabpanel
                            var southPanel = Ext.ComponentQuery.query('security_management_southpanel').first();
                            var activeTabPanel = southPanel.down('tabpanel').getActiveTab();
                            activeTabPanel.refreshWidget();
                            activeTabPanel.updateTitle();
                        }
                    }
                }
            ]

        }, config);

        this.callParent([config]);
    }

});
