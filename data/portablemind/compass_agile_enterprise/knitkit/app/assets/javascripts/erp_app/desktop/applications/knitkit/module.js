Ext.define("Compass.ErpApp.Desktop.Applications.Knitkit", {
    extend: "Ext.ux.desktop.Module",
    id: 'knitkit-win',
    alias: 'widget.knitkit_mainui',

    /**
     * @cfg {Object} currentWebsite
     * The currently selected website with params {id, name, configurationId}
     */
    currentWebsite: null,

    init: function () {

        this.launcher = {
            text: 'Website Builder',
            iconCls: 'icon-knitkit',
            handler: this.createWindow,
            scope: this
        }
    },

    initComponent: function () {
        var me = this;

        me.addEvents(
            /*
             * @event websiteselected
             * Fires when a website is selected
             * @param {Compass.ErpApp.Desktop.Applications.Knitkit} this
             * @param {Object} currentWebsite
             */
            'websiteselected'
        );
    },

    clearWebsite: function(){
        var self = this,
            desktop = self.app.getDesktop(),
            win = desktop.getWindow('knitkit'),
            menuBar = win.down('toolbar');

        this.currentWebsite = null;

        var eastRegion = Ext.ComponentQuery.query('#knitkitEastRegion').first();
        eastRegion.fileAssetsPanel.clearWebsite();
        eastRegion.imageAssetsPanel.clearWebsite();

        var westRegion = Ext.ComponentQuery.query('#knitkitWestRegion').first();
        westRegion.clearWebsite();

        menuBar.down('#themeMenuItem').disable();
        menuBar.down('#navigationMenuItem').disable();
        menuBar.down('#hostsMenuItem').disable();
        menuBar.down('#sectionsPagesMenuItem').disable();
        menuBar.down('#deleteWebsiteMenuItem').disable();
        menuBar.down('#configureWebsiteMenuItem').disable();
        menuBar.down('#websitePublicationsMenuItem').disable();
        menuBar.down('#exportWebsiteMenuItem').disable();
        menuBar.down('#websiteInquiresMenuItem').disable();
        menuBar.down('#publishWebsiteMenuItem').disable();
        menuBar.down('#editWebsiteMenuItem').disable();
        menuBar.down('#exportTemplateMenuItem').disable();

    },

    selectWebsite: function (website) {
        // get only the data for the website
        website = website.data;


        var self = this,
            desktop = self.app.getDesktop(),
            win = desktop.getWindow('knitkit'),
            menuBar = win.down('toolbar');

        self.fireEvent('websiteselected', self, website);

        this.currentWebsite = website;

        var eastRegion = Ext.getCmp('knitkitEastRegion');
        eastRegion.fileAssetsPanel.selectWebsite(website);
        eastRegion.imageAssetsPanel.selectWebsite(website);

        var westRegion = Ext.getCmp('knitkitWestRegion');
        westRegion.selectWebsite(website);

        Compass.ErpApp.Shared.FileManagerTree.extraPostData = {
            website_id: website.id
        };

        Ext.Ajax.request({
            url: '/knitkit/erp_app/desktop/site/has_active_theme',
            params: {
                website_id: website.id
            },
            success: function(response){
                var text = response.responseText;
                var obj = Ext.decode(text);
                if (obj.message == 'true') {
                    menuBar.down('#exportTemplateMenuItem').enable();
                }
            }
        });

        menuBar.down('#themeMenuItem').enable();
        menuBar.down('#navigationMenuItem').enable();
        menuBar.down('#hostsMenuItem').enable();
        menuBar.down('#sectionsPagesMenuItem').enable();
        menuBar.down('#deleteWebsiteMenuItem').enable();
        menuBar.down('#configureWebsiteMenuItem').enable();
        menuBar.down('#websitePublicationsMenuItem').enable();
        menuBar.down('#exportWebsiteMenuItem').enable();
        menuBar.down('#websiteInquiresMenuItem').enable();
        menuBar.down('#publishWebsiteMenuItem').enable();
        menuBar.down('#editWebsiteMenuItem').enable();

    },

    createWindow: function () {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('knitkit');

        if (!win) {
            var centerRegion = Ext.create('Compass.ErpApp.Desktop.Applications.Knitkit.CenterRegion');
            this.centerRegion = centerRegion;

            var tbarItems = [];

            if (currentUser.hasCapability('create', 'Website')) {
                tbarItems.push(
                    {
                        text: 'Main Menu',
                        menu: {
                            xtype: 'menu',
                            items: [
                                Compass.ErpApp.Desktop.Applications.Knitkit.websiteMenu(),
                                Compass.ErpApp.Desktop.Applications.Knitkit.ArticlesMenu(),
                                Compass.ErpApp.Desktop.Applications.Knitkit.SectionsMenu(),
                                Compass.ErpApp.Desktop.Applications.Knitkit.ThemeMenu(),
                                Compass.ErpApp.Desktop.Applications.Knitkit.NavigationMenu(),
                                Compass.ErpApp.Desktop.Applications.Knitkit.HostsMenu(),
                                Compass.ErpApp.Desktop.Applications.Knitkit.TemplateMenu()
                            ]
                        }
                    }
                );
            }

            tbarItems.push(
                {
                    iconCls: 'btn-save-light',
                    text: 'Save',
                    handler: function (btn) {
                        centerRegion.saveCurrent();
                    }
                },
                {
                    iconCls: 'btn-save-all-light',
                    text: 'Save All',
                    handler: function (btn) {
                        centerRegion.saveAll();
                    }
                });

            tbarItems.push('->',
                {
                    iconCls: 'btn-left-panel',
                    handler: function (btn) {
                        var panel = btn.up('window').down('knitkit_westregion');
                        if (panel.collapsed) {
                            panel.expand();
                        }
                        else {
                            panel.collapse(Ext.Component.DIRECTION_LEFT);
                        }
                    }
                },
                {
                    iconCls: 'btn-right-panel',
                    handler: function (btn) {
                        var panel = btn.up('window').down('knitkit_eastregion');
                        if (panel.collapsed) {
                            panel.expand();
                        }
                        else {
                            panel.collapse(Ext.Component.DIRECTION_RIGHT);
                        }
                    }
                },
                {
                    iconCls: 'btn-left-right-panel',
                    handler: function (btn) {
                        var east = btn.up('window').down('knitkit_eastregion');
                        var west = btn.up('window').down('knitkit_westregion');
                        if (west.collapsed || east.collapsed) {
                            west.expand();
                            east.expand();
                        }
                        else if (!west.collapsed && !east.collapsed) {
                            var task = new Ext.util.DelayedTask(function () {
                                west.collapse(Ext.Component.DIRECTION_LEFT);
                            });
                            east.collapse(Ext.Component.DIRECTION_RIGHT);
                            task.delay(400);

                        }
                    }
                });

            win = desktop.createWindow({
                id: 'knitkit',
                title: 'Website Builder',
                width: 1200,
                height: 550,
                maximized: true,
                iconCls: 'icon-knitkit-light',
                shim: false,
                animCollapse: false,
                constrainHeader: true,
                layout: 'border',
                dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'top',
                    ui: 'ide-main',
                    items: tbarItems
                }],
                items: [
                    this.centerRegion,
                    {
                        xtype: 'knitkit_eastregion',
                        header: false,
                        module: this
                    },
                    {
                        xtype: 'knitkit_westregion',
                        header: false,
                        centerRegion: this.centerRegion,
                        module: this
                    }
                ]
            });
        }

        win.show();
    }
});
