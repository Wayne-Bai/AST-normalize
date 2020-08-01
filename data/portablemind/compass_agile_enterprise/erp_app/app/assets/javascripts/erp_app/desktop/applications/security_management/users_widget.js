Ext.define("Compass.ErpApp.Desktop.Applications.SecurityManagement.UsersWidget", {
    extend: "Ext.panel.Panel",
    alias: 'widget.security_management_userswidget',

    updateTitle: function () {
        if (this.assign_to_description) {
            this.down('#assignment').setTitle('Assign Users to ' + this.assign_to + ' ' + this.assign_to_description);
        }
    },

    refreshWidget: function (tab) {
        if (tab === undefined) tab = this;

        //need a delay to allow for rendering of shared_dynamiceditablegrid
        setTimeout(function () {
            var available_grid = tab.down('#available').down('shared_dynamiceditablegrid');
            var selected_grid = tab.down('#selected').down('shared_dynamiceditablegrid');
            if (tab.assign_to_id) {
                var extraParams = {
                    assign_to: tab.assign_to,
                    id: tab.assign_to_id
                };

                available_grid.getStore().getProxy().extraParams = extraParams;
                available_grid.getStore().load();

                selected_grid.getStore().getProxy().extraParams = extraParams;
                selected_grid.getStore().load();
            } else {
                available_grid.getStore().getProxy().extraParams = {};
                selected_grid.getStore().getProxy().extraParams = {};
            }
        }, 900);
    },

    constructor: function (config) {
        var self = this,
            commonWidgetProperties = Compass.ErpApp.Desktop.Applications.SecurityManagement.CommonWidget.properties;

        var available_grid = Ext.apply(commonWidgetProperties.available_grid, {
            xtype: 'security_management_user_grid',
            title: 'Available Users',
            setupUrl: '/erp_app/desktop/security_management/users/available_setup',
            dataUrl: '/erp_app/desktop/security_management/users/available',
            autoLoad: false
        });

        var selected_grid = Ext.apply(commonWidgetProperties.selected_grid, {
            xtype: 'security_management_user_grid',
            title: 'Selected Users',
            setupUrl: '/erp_app/desktop/security_management/users/selected_setup',
            dataUrl: '/erp_app/desktop/security_management/users/selected',
            autoLoad: false
        });

        var assignment = Ext.apply(commonWidgetProperties.assignment, {
            xtype: 'panel',
            title: 'Manage Users',
            items: [
                available_grid,
                {
                    xtype: 'container',
                    width: 22,
                    bodyPadding: 5,
                    items: [
                        {xtype: 'SecurityManagement-AddUserButton'},
                        {xtype: 'SecurityManagement-RemoveUserButton'}
                    ]
                },
                selected_grid
            ]
        });

        config = Ext.apply({
            title: 'Users',
            assign_to: (config.assign_to || 'Group'),
            items: [
                assignment
            ],
            listeners: {
                activate: function (tab) {
                    self.refreshWidget(tab);
                    self.updateTitle();
                }
            }

        }, config);

        this.callParent([config]);
    }
});

Ext.define("Compass.ErpApp.Desktop.Applications.SecurityManagement.UserGrid", {
    extend: "Ext.grid.Panel",
    alias: 'widget.security_management_user_grid',

    initComponent: function () {
        this.store = Ext.create('Ext.data.Store', {
            proxy: {
                type: 'ajax',
                url: '/api/v1/users/',
                reader: {
                    totalProperty: 'totalCount',
                    type: 'json',
                    root: 'users'
                },
                extraParams: {
                    username: null
                }
            },
            pageSize: 10,
            remoteSort: true,
            fields: [
                {
                    name: 'server_id',
                    type: 'int'
                },
                {
                    name: 'party_id',
                    mapping: 'party.server_id',
                    type: 'int'
                },
                {
                    name: 'party_description',
                    mapping: 'party.description',
                    type: 'string'
                },
                {
                    name: 'username',
                    type: 'string'
                },
                {
                    name: 'email',
                    type: 'string'
                }
            ]
        });

        this.columns = [
            {
                header: 'Party Description',
                dataIndex: 'party_description',
                flex: 1
            },
            {
                header: 'Username',
                dataIndex: 'username',
                flex: 1
            },
            {
                header: 'Email',
                dataIndex: 'email',
                flex: 1
            }
        ];

        this.dockedItems = [
            {
                xtype: 'toolbar',
                dock: 'top',
                items: [
                    {
                        fieldLabel: '<span data-qtitle="Search" data-qwidth="200" data-qtip="">Search</span>',
                        itemId: 'searchValue',
                        xtype: 'textfield',
                        width: 400,
                        value: '',
                        listeners: {
                            specialkey: function (field, e) {
                                if (e.getKey() == e.ENTER) {
                                    var grid = field.findParentByType('security_management_user_grid');
                                    var button = grid.query('#searchButton').first();
                                    button.fireEvent('click', button);
                                }
                            }
                        }
                    },
                    {xtype: 'tbspacer', width: 1},
                    {
                        xtype: 'button',
                        itemId: 'searchButton',
                        iconCls: 'x-btn-icon icon-search',
                        listeners: {
                            click: function (button) {
                                if (button.findParentByType('security_management_userswidget') && !button.findParentByType('security_management_userswidget').assign_to_id) return;
                                var grid = button.findParentByType('security_management_user_grid');
                                var value = grid.query('#searchValue').first().getValue();
                                grid.query('shared_dynamiceditablegrid').first().getStore().load({
                                    params: {query_filter: value}
                                });
                            }
                        }
                    }
                ]
            },
            {
                dock: 'bottom',
                store: this.store,
                xtype: 'pagingtoolbar',
                displayInfo: true
            }
        ];

        this.callParent(arguments);
    }
});

Ext.define('Compass.ErpApp.Desktop.Applications.SecurityManagement.AddUserButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.SecurityManagement-AddUserButton',
    itemId: 'AddUserButton',
    cls: 'clean-image-icon',
    style: 'margin-top: 100px !important;',
    iconCls: 'icon-arrow-right-blue',
    formBind: false,
    tooltip: 'Add to Selected',
    listeners: {
        click: function (button) {
            var security_management_userswidget = button.findParentByType('security_management_userswidget');
            var available_grid = security_management_userswidget.query('#available').first().down('shared_dynamiceditablegrid');
            var selected_grid = security_management_userswidget.query('#selected').first().down('shared_dynamiceditablegrid');
            var selection = available_grid.getSelectionModel().getSelection();
            if (security_management_userswidget.assign_to_id && selection.length > 0) {
                var selected = [];
                Ext.each(selection, function (s) {
                    selected.push(s.data.id);
                });

                Ext.Ajax.request({
                    url: '/erp_app/desktop/security_management/users/add',
                    method: 'POST',
                    params: {
                        assign_to: security_management_userswidget.assign_to,
                        id: security_management_userswidget.assign_to_id,
                        selection: Ext.encode(selected)
                    },
                    success: function (response) {
                        var json_response = Ext.decode(response.responseText);
                        if (json_response.success) {
                            available_grid.getStore().load();
                            selected_grid.getStore().load();
                        } else {
                            Ext.Msg.alert('Error', Ext.decode(response.responseText).message);
                        }
                    },
                    failure: function (response) {
                        Ext.Msg.alert('Error', 'Error Adding User');
                    }
                });
            } else {
                Ext.Msg.alert('Error', 'Please make a selection.');
            }
        }
    }
});

Ext.define('Compass.ErpApp.Desktop.Applications.SecurityManagement.RemoveUserButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.SecurityManagement-RemoveUserButton',
    itemId: 'RemoveUserButton',
    cls: 'clean-image-icon',
    iconCls: 'icon-arrow-left-blue',
    formBind: false,
    tooltip: 'Remove from Selected',
    listeners: {
        click: function (button) {
            var security_management_userswidget = button.findParentByType('security_management_userswidget');
            var available_grid = security_management_userswidget.query('#available').first().down('shared_dynamiceditablegrid');
            var selected_grid = security_management_userswidget.query('#selected').first().down('shared_dynamiceditablegrid');
            var selection = selected_grid.getSelectionModel().getSelection();
            if (security_management_userswidget.assign_to_id && selection.length > 0) {
                var selected = [];
                Ext.each(selection, function (s) {
                    selected.push(s.data.id);
                });

                Ext.Ajax.request({
                    url: '/erp_app/desktop/security_management/users/remove',
                    method: 'POST',
                    params: {
                        assign_to: security_management_userswidget.assign_to,
                        id: security_management_userswidget.assign_to_id,
                        selection: Ext.encode(selected)
                    },
                    success: function (response) {
                        var json_response = Ext.decode(response.responseText);
                        if (json_response.success) {
                            available_grid.getStore().load();
                            selected_grid.getStore().load();
                        } else {
                            Ext.Msg.alert('Error', Ext.decode(response.responseText).message);
                        }
                    },
                    failure: function (response) {
                        Ext.Msg.alert('Error', 'Error Removing User');
                    }
                });
            } else {
                Ext.Msg.alert('Error', 'Please make a selection.');
            }
        }
    }
});
