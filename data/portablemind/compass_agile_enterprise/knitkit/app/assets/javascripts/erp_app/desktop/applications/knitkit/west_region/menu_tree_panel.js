var store = Ext.create('Ext.data.TreeStore', {
    proxy: {
        type: 'ajax',
        url: '/knitkit/erp_app/desktop/website_nav',
        timeout: 90000
    },
    root: {
        text: 'Menus and Navigation',
        expanded: true
    },
    fields: [
        'text',
        'iconCls',
        'leaf',
        'canAddMenuItems',
        'isWebsiteNavItem',
        'isSecured',
        'websiteId',
        'isSectionRoot',
        'isWebsiteNav',
        'websiteNavItemId',
        'websiteNavId',
        'roles',
        'url',
        'linkedToId',
        'linkToType'
    ],
    listeners: {
        'load': function (store, node, records) {
            store.getRootNode().expandChildren();
        }
    }
});

var pluginItems = [];

pluginItems.push({
    ptype: 'treeviewdragdrop'
});

var viewConfigItems = {
    markDirty: false,
    plugins: pluginItems,
    listeners: {
        'beforedrop': function (node, data, overModel, dropPosition, dropFunction, options) {
            return overModel.data['isWebsiteNavItem'];
        },
        'drop': function (node, data, overModel, dropPosition, options) {
            var positionArray = [];
            var counter = 0;
            var dropNode = data.records[0];

            if (dropNode.data['isWebsiteNavItem']) {
                overModel.parentNode.eachChild(function (node) {
                    positionArray.push({
                        id: node.data.websiteNavItemId,
                        position: counter,
                        klass: 'WebsiteNavItem'
                    });
                    counter++;
                });
            }

            Ext.Ajax.request({
                url: '/knitkit/erp_app/desktop/position/update_menu_item_position',
                method: 'PUT',
                jsonData: {
                    position_array: positionArray
                },
                success: function (response) {
                    var obj = Ext.decode(response.responseText);
                    if (obj.success) {

                    }
                    else {
                        Ext.Msg.alert("Error", obj.message);
                    }
                },
                failure: function (response) {
                    Ext.Msg.alert('Error', 'Error saving positions.');
                }
            });
        }
    }
};

Ext.define("Compass.ErpApp.Desktop.Applications.Knitkit.MenuTreePanel", {
    extend: "Ext.tree.Panel",
    id: 'knitkitMenuTreePanel',
    itemId: 'knitkitMenuTreePanel',
    alias: 'widget.knitkit_menutreepanel',
    header: false,
    viewConfig: viewConfigItems,
    root: {
        text: 'Menus',
        iconCls: 'icon-content',
        expanded: true
    },

    store: store,

    clearWebsite: function(){
        var store = this.getStore();
        store.getProxy().extraParams = {};
        store.load();
    },

    selectWebsite: function (website) {
        var store = this.getStore();
        store.getProxy().extraParams = {
            website_id: website.id
        };
        store.load();
    },

    listeners: {
        'itemcontextmenu': function (view, record, htmlItem, index, e) {
            e.stopEvent();
            var items = [];

            items = Compass.ErpApp.Desktop.Applications.Knitkit.addMenuOptions(self, items, record);

            if(record.isRoot()){
                items.push(Compass.ErpApp.Desktop.Applications.Knitkit.newNavigationMenuItem);
            }
            else if (record.data['isWebsiteNav']) {
                if (currentUser.hasCapability('edit', 'WebsiteNav')) {
                    items.push({
                        text: 'Update',
                        iconCls: 'icon-edit',
                        handler: function (btn) {
                            Ext.create("Ext.window.Window", {
                                layout: 'fit',
                                modal: true,
                                width: 375,
                                title: 'Update Menu',
                                height: 120,
                                plain: true,
                                buttonAlign: 'center',
                                items: Ext.create('widget.form', {
                                    labelWidth: 50,
                                    frame: false,
                                    bodyStyle: 'padding:5px 5px 0',
                                    url: '/knitkit/erp_app/desktop/website_nav/' + record.data.websiteNavId,
                                    defaults: {
                                        width: 375
                                    },
                                    items: [
                                        {
                                            xtype: 'textfield',
                                            fieldLabel: 'Name',
                                            width: 320,
                                            value: record.data.text,
                                            id: 'knitkit_website_nav_update_name',
                                            allowBlank: false,
                                            name: 'name'
                                        }
                                    ]
                                }),
                                buttons: [
                                    {
                                        text: 'Submit',
                                        listeners: {
                                            'click': function (button) {
                                                var window = button.findParentByType('window');
                                                var formPanel = window.query('form')[0];

                                                formPanel.getForm().submit({
                                                    method: 'PUT',
                                                    waitMsg: 'Please Wait...',
                                                    success: function (form, action) {
                                                        var obj = Ext.decode(action.response.responseText);
                                                        if (obj.success) {
                                                            var newText = Ext.getCmp('knitkit_website_nav_update_name').getValue();
                                                            record.set('text', newText);
                                                            window.close();
                                                        }
                                                        else {
                                                            Ext.Msg.alert("Error", obj.msg);
                                                        }
                                                    },
                                                    failure: function (form, action) {
                                                        var obj = Ext.decode(action.response.responseText);
                                                        Ext.Msg.alert("Error", obj.msg);
                                                    }
                                                });
                                            }
                                        }
                                    },
                                    {
                                        text: 'Close',
                                        handler: function (btn) {
                                            btn.up('window').close();
                                        }
                                    }
                                ]
                            }).show();
                        }
                    });
                }

                if (currentUser.hasCapability('delete', 'WebsiteNav')) {
                    items.push({
                        text: 'Delete',
                        iconCls: 'icon-delete',
                        handler: function (btn) {
                            Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete this menu?', function (btn) {
                                if (btn == 'no') {
                                    return false;
                                }
                                else if (btn == 'yes') {
                                    Ext.Ajax.request({
                                        url: '/knitkit/erp_app/desktop/website_nav/' + record.data.websiteNavId,
                                        method: 'DELETE',
                                        success: function (response) {
                                            var obj = Ext.decode(response.responseText);
                                            if (obj.success) {
                                                record.remove();
                                            }
                                            else {
                                                Ext.Msg.alert('Error', 'Error deleting menu');
                                            }
                                        },
                                        failure: function (response) {
                                            Ext.Msg.alert('Error', 'Error deleting menu');
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
            else if (record.data['isWebsiteNavItem']) {
                items = Compass.ErpApp.Desktop.Applications.Knitkit.addWebsiteNavItemOptions(self, items, record);
            }
            if (items.length != 0) {
                var contextMenu = Ext.create("Ext.menu.Menu", {
                    items: items
                });
                contextMenu.showAt(e.xy);
            }
        }
    }
});