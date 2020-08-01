Ext.define("Compass.ErpApp.Shared.ConfigurationPanel", {
    extend: "Ext.panel.Panel",
    alias: "widget.sharedconfigurationpanel",
    autoScroll: true,

    /**
     * @cfg {String} setupUrl
     * Url to setup configuration panel.
     */
    setupConfigurationUrl: '/erp_app/shared/configuration/setup_categories',

    constructor: function (config) {
        var me = this;

        var setupConfigurationUrl = config['setupConfigurationUrl'] || me.setupConfigurationUrl;

        var categoriesTreePanel = {
            xtype: 'treepanel',
            store: {
                proxy: {
                    type: 'ajax',
                    url: setupConfigurationUrl + '/' + config.configurationId
                },
                autoLoad: true,
                root: {
                    text: 'Categories',
                    expanded: true
                },
                fields: [
                    {
                        name: 'categoryId'
                    },
                    {
                        name: 'text'
                    },
                    {
                        name: 'iconCls'
                    },
                    {
                        name: 'leaf'
                    }
                ]
            },
            animate: false,
            autoScroll: true,
            region: 'west',
            containerScroll: true,
            frame: false,
            border: true,
            width: 200,
            height: 400,
            listeners: {
                'itemclick': function (view, record, item, index, e) {
                    e.stopEvent();
                    if (!record.isRoot()) {
                        var sharedConfigurationPanel = view.up('sharedconfigurationpanel');
                        var tabPanel = sharedConfigurationPanel.down('#configurationFormsTabPanel');
                        var itemId = 'configurationForm-' + record.get('categoryId');
                        var configurationForm = tabPanel.down('#' + itemId);

                        if (Ext.isEmpty(configurationForm)) {
                            configurationForm = {
                                fieldDefaults: me.initialConfig.fieldDefaults,
                                closable: true,
                                xtype: 'sharedconfigurationform',
                                itemId: itemId,
                                title: record.get('text'),
                                configurationId: sharedConfigurationPanel.initialConfig.configurationId,
                                categoryId: record.get('categoryId'),
                                listeners: {
                                    afterrender: function (form) {
                                        form.setup();
                                    }
                                }
                            };
                            tabPanel.add(configurationForm);
                            configurationForm = tabPanel.down('#' + itemId);
                        }
                        else {
                            configurationForm.setup();
                        }

                        tabPanel.setActiveTab(itemId);
                    }
                }
            }
        };

        config.fieldDefaults = config.fieldDefaults || {labelAlign: 'top'};

        var configurationFormsTabPanel = {
            xtype: 'tabpanel',
            itemId: 'configurationFormsTabPanel',
            region: 'center',
            plugins: Ext.create('Ext.ux.TabCloseMenu', {
                extraItemsTail: [
                    '-',
                    {
                        text: 'Closable',
                        checked: true,
                        hideOnClick: true,
                        handler: function (item) {
                            currentItem.tab.setClosable(item.checked);
                        }
                    }
                ],
                listeners: {
                    aftermenu: function () {
                        currentItem = null;
                    },
                    beforemenu: function (menu, item) {
                        var menuitem = menu.child('*[text="Closable"]');
                        currentItem = item;
                        menuitem.setChecked(item.closable);
                    }
                }
            })
        };

        config = Ext.apply({
            layout: 'border',
            border: false,
            items: [categoriesTreePanel, configurationFormsTabPanel]
        }, config);

        this.callParent([config]);
    }
});
