Ext.define("Compass.ErpApp.Desktop.Applications.Knitkit.FileAssetsPanel", {
    extend: "Ext.tab.Panel",
    alias: 'widget.knitkit_FileAssetsPanel',
    cls: 'file-assets-panel',

    constructor: function (config) {
        this.websiteId = null;
        var self = this;
        self.module = config.module;

        this.changeSecurityOnFile = function (node, secure, model, websiteId) {
            var updateUrl = '/knitkit/erp_app/desktop/file_assets/' + model + '/update_security';
            Ext.Ajax.request({
                url: '/knitkit/erp_app/desktop/available_roles',
                method: 'POST',
                success: function (response) {
                    var obj = Ext.decode(response.responseText);
                    if (obj.success) {
                        Ext.create('widget.knikit_selectroleswindow', {
                            baseParams: {
                                path: node.get('id'),
                                website_id: websiteId
                            },
                            url: updateUrl,
                            currentRoles: node.get('roles'),
                            availableRoles: obj.availableRoles,
                            listeners: {
                                success: function (window, response) {
                                    if (response.success) {
                                        node.set('roles', response.roles);
                                        if (response.secured) {
                                            node.set('iconCls', 'icon-document_lock');
                                        }
                                        else {
                                            node.set('iconCls', 'icon-document');
                                        }
                                        node.set('isSecured', response.secured);
                                        node.commit();
                                    }
                                    else {
                                        Ext.Msg.alert('Error', 'Error securing file.');
                                    }
                                },
                                failure: function () {
                                    Ext.Msg.alert('Error', 'Could not update security');
                                }
                            }
                        }).show();
                    }
                    else {
                        Ext.Msg.alert('Error', 'Could not load available roles');
                    }
                },
                failure: function (response) {
                    Ext.Msg.alert('Error', 'Could not load available roles');
                }
            });
        };

        this.sharedFileAssetsTreePanel = Ext.create("Compass.ErpApp.Shared.FileManagerTree", {
            loadMask: true,
            collapsible: false,
            title: 'Shared',
            rootText: 'Shared Files',
            allowDownload: false,
            addViewContentsToContextMenu: false,
            showNewFileMenuItem: false,
            rootVisible: true,
            multiSelect: true,
            controllerPath: '/knitkit/erp_app/desktop/file_assets/shared',
            standardUploadUrl: '/knitkit/erp_app/desktop/file_assets/shared/upload_file',
            url: '/knitkit/erp_app/desktop/file_assets/shared/expand_directory',
            containerScroll: true,
            additionalContextMenuItems: [
                {
                    nodeType: 'leaf',
                    text: 'Insert link at cursor',
                    iconCls: 'icon-add',
                    listeners: {
                        scope: self,
                        'click': function () {
                            var node = this.sharedFileAssetsTreePanel.selectedNode;
                            Ext.MessageBox.prompt('Display Name', 'Please enter display name:', function (btn, text) {
                                if (btn == 'ok') {
                                    self.module.centerRegion.insertHtmlIntoActiveCkEditorOrCodemirror('<a href="/download/' + node.data.text + '?path=' + node.data.downloadPath + '">' + text + '</a>');
                                }
                            });
                        }
                    }
                },
                {
                    nodeType: 'leaf',
                    text: 'Insert link at cursor (inline)',
                    iconCls: 'icon-add',
                    listeners: {
                        scope: self,
                        'click': function () {
                            var node = this.sharedFileAssetsTreePanel.selectedNode;
                            Ext.MessageBox.prompt('Display Name', 'Please enter display name:', function (btn, text) {
                                if (btn == 'ok') {
                                    self.module.centerRegion.insertHtmlIntoActiveCkEditorOrCodemirror('<a href="/download/' + node.data.text + '?path=' + node.data.downloadPath + '&disposition=inline">' + text + '</a>');
                                }
                            });
                        }
                    }
                },
                {
                    nodeType: 'leaf',
                    text: 'Insert link at cursor (prompt)',
                    iconCls: 'icon-add',
                    listeners: {
                        scope: self,
                        'click': function () {
                            var node = this.sharedFileAssetsTreePanel.selectedNode;
                            Ext.MessageBox.prompt('Display Name', 'Please enter display name:', function (btn, text) {
                                if (btn == 'ok') {
                                    self.module.centerRegion.insertHtmlIntoActiveCkEditorOrCodemirror('<a href="/download/' + node.data.text + '?path=' + node.data.downloadPath + '&disposition=attachment">' + text + '</a>');
                                }
                            });
                        }
                    }
                },
                {
                    nodeType: 'leaf',
                    text: 'Security',
                    iconCls: 'icon-document_lock',
                    listeners: {
                        scope: self,
                        'click': function () {
                            var node = this.sharedFileAssetsTreePanel.selectedNode;
                            self.changeSecurityOnFile(node, !node.get('isSecured'), 'shared');
                        }
                    }
                }
            ],
            listeners: {
                'allowdelete': function () {
                    return currentUser.hasCapability('delete', 'GlobalFileAsset');
                },
                'allowupload': function () {
                    return currentUser.hasCapability('upload', 'GlobalFileAsset');
                },
                'itemclick': function (view, record, item, index, e) {
                    e.stopEvent();
                    return false;
                },
                'fileDeleted': function (fileTreePanel, node) {
                },
                'fileUploaded': function (fileTreePanel, node) {
                },
                'downloadfile': function (fileTreePanel, node) {
                    window.open("/download/" + node.data.text + "?path=" + node.data.downloadPath + '&disposition=attachment', 'mywindow', 'width=400,height=200');
                    return false;
                }
            }
        });

        this.websiteFileAssetsTreePanel = Ext.create("Compass.ErpApp.Shared.FileManagerTree", {
            itemId: 'websiteFileAssetsTreePanel',
            autoRender: true,
            loadMask: true,
            collapsible: false,
            autoLoadRoot: false,
            title: 'Website',
            allowDownload: false,
            addViewContentsToContextMenu: false,
            showNewFileMenuItem: false,
            rootVisible: true,
            multiSelect: true,
            controllerPath: '/knitkit/erp_app/desktop/file_assets/website',
            standardUploadUrl: '/knitkit/erp_app/desktop/file_assets/website/upload_file',
            url: '/knitkit/erp_app/desktop/file_assets/website/expand_directory',
            containerScroll: true,
            additionalContextMenuItems: [
                {
                    nodeType: 'leaf',
                    text: 'Insert link at cursor',
                    iconCls: 'icon-add',
                    listeners: {
                        scope: self,
                        'click': function () {
                            var node = this.websiteFileAssetsTreePanel.selectedNode;
                            Ext.MessageBox.prompt('Display Name', 'Please enter display name:', function (btn, text) {
                                if (btn == 'ok') {
                                    self.module.centerRegion.insertHtmlIntoActiveCkEditorOrCodemirror('<a href="/download/' + node.data.text + '?path=' + node.data.downloadPath + '">' + text + '</a>');
                                }
                            });
                        }
                    }
                },
                {
                    nodeType: 'leaf',
                    text: 'Insert link at cursor (inline)',
                    iconCls: 'icon-add',
                    listeners: {
                        scope: self,
                        'click': function () {
                            var node = this.websiteFileAssetsTreePanel.selectedNode;
                            Ext.MessageBox.prompt('Display Name', 'Please enter display name:', function (btn, text) {
                                if (btn == 'ok') {
                                    self.module.centerRegion.insertHtmlIntoActiveCkEditorOrCodemirror('<a href="/download/' + node.data.text + '?path=' + node.data.downloadPath + '&disposition=inline">' + text + '</a>');
                                }
                            });
                        }
                    }
                },
                {
                    nodeType: 'leaf',
                    text: 'Insert link at cursor (prompt)',
                    iconCls: 'icon-add',
                    listeners: {
                        scope: self,
                        'click': function () {
                            var node = this.websiteFileAssetsTreePanel.selectedNode;
                            Ext.MessageBox.prompt('Display Name', 'Please enter display name:', function (btn, text) {
                                if (btn == 'ok') {
                                    self.module.centerRegion.insertHtmlIntoActiveCkEditorOrCodemirror('<a href="/download/' + node.data.text + '?path=' + node.data.downloadPath + '&disposition=attachment">' + text + '</a>');
                                }
                            });
                        }
                    }
                },
                {
                    nodeType: 'leaf',
                    text: 'Security',
                    iconCls: 'icon-document_lock',
                    listeners: {
                        scope: self,
                        'click': function () {
                            var node = this.websiteFileAssetsTreePanel.selectedNode;
                            self.changeSecurityOnFile(node, !node.get('isSecured'), 'website', this.websiteId);
                        }
                    }
                }
            ],
            listeners: {
                scope: self,
                'load': function (store, node, records) {
                    store.getRootNode().data.text = self.websiteName;
                    self.websiteFileAssetsTreePanel.view.refresh();
                },
                'show': function (panel) {
                    // workaround for extJS rendering bug. tree tries to load faster than extjs can render, wait X ms
                    setTimeout(function () {
                        self.reloadWebsiteFileAssetsTreePanel(self.websiteId);
                    }, 100);
                },
                'itemclick': function (view, record, item, index, e) {
                    e.stopEvent();
                    return false;
                },
                'fileDeleted': function (fileTreePanel, node) {
                },
                'fileUploaded': function (fileTreePanel, node) {
                },
                'downloadfile': function (fileTreePanel, node) {
                    window.open("/download/" + node.data.text + "?path=" + node.data.downloadPath + '&disposition=attachment', 'mywindow', 'width=400,height=200');
                    return false;
                }
            }
        });

        this.selectWebsite = function (website) {
            this.websiteId = website.id;
            this.websiteName = website.name;
            this.reloadWebsiteFileAssetsTreePanel(website.id);
        };

        this.clearWebsite = function () {
            this.websiteId = null;
            this.websiteName = null;

            this.websiteFileAssetsTreePanel.extraPostData = {
                website_id: null
            };
            this.websiteFileAssetsTreePanel.getStore().setProxy({
                type: 'ajax',
                url: '/knitkit/erp_app/desktop/file_assets/website/expand_directory',
                extraParams: {
                    website_id: null
                }
            });

            this.websiteFileAssetsTreePanel.getRootNode().removeAll(true);
        };

        this.reloadWebsiteFileAssetsTreePanel = function (websiteId) {
            this.websiteFileAssetsTreePanel.extraPostData = {
                website_id: websiteId
            };
            this.websiteFileAssetsTreePanel.getStore().setProxy({
                type: 'ajax',
                url: '/knitkit/erp_app/desktop/file_assets/website/expand_directory',
                extraParams: {
                    website_id: websiteId
                }
            });

            if (websiteId) {
                while (delNode = this.websiteFileAssetsTreePanel.getRootNode().childNodes[0]) {
                    this.websiteFileAssetsTreePanel.getRootNode().removeChild(delNode);
                }
                this.websiteFileAssetsTreePanel.getRootNode().expand();

                if (!this.websiteFileAssetsTreePanel.getStore().isLoading()) {
                    this.websiteFileAssetsTreePanel.getStore().load();
                }
            }
        };

        var items = [];

        if (currentUser.hasCapability('view', 'GlobalFileAsset')) {
            items.push(this.sharedFileAssetsTreePanel);
        }

        if (currentUser.hasCapability('view', 'SiteFileAsset')) {
            items.push(this.websiteFileAssetsTreePanel);
        }

        config = Ext.apply({
            deferredRender: false,
            layout: 'fit',
            title: 'Files',
            items: items,
            activeTab: 0
        }, config);

        this.callParent([config]);

    }
});
