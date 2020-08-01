﻿/*
 * (c) Copyright Ascensio System SIA 2010-2014
 *
 * This program is a free software product. You can redistribute it and/or 
 * modify it under the terms of the GNU Affero General Public License (AGPL) 
 * version 3 as published by the Free Software Foundation. In accordance with 
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect 
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied 
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For 
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under 
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */
 Ext.define("DE.controller.CreateFile", {
    extend: "Ext.app.Controller",
    views: ["CreateFile"],
    stores: ["FileTemplates"],
    refs: [{
        ref: "filePanel",
        selector: "defile"
    }],
    init: function () {
        Common.Gateway.on("init", Ext.bind(this.loadConfig, this));
        this.control({
            "decreatenew": {
                afterrender: Ext.bind(this.onRenderView, this, {
                    single: true
                })
            },
            "decreatenew dataview": {
                itemclick: this.onTemplateClick
            }
        });
    },
    applyConfig: function (config) {
        if (config) {
            this.createUrl = config.createUrl;
            this.nativeApp = config.nativeApp;
            var templates = this.getFileTemplatesStore();
            if (templates && config.templates) {
                templates.removeAll();
                templates.add(config.templates);
            }
        }
    },
    loadConfig: function (data) {
        if (data && data.config) {
            this.createUrl = data.config.createUrl;
            this.nativeApp = data.config.nativeApp;
            var templates = this.getFileTemplatesStore();
            if (templates && data.config.templates) {
                templates.removeAll();
                templates.add(data.config.templates);
            }
        }
    },
    onRenderView: function () {
        var btnBlankDocument = Ext.fly("id-create-blank-document");
        if (btnBlankDocument) {
            btnBlankDocument.addClsOnOver("over");
            btnBlankDocument.on("click", this.onBlankDocClick, this);
        }
    },
    setApi: function (o) {
        this.api = o;
        return this;
    },
    onBlankDocClick: function (event, el) {
        var filePanel = this.getFilePanel();
        if (filePanel) {
            filePanel.closeMenu();
        }
        if (this.nativeApp === true) {
            if (this.api) {
                this.api.OpenNewDocument();
            }
        } else {
            if (Ext.isEmpty(this.createUrl)) {
                Ext.MessageBox.show({
                    title: this.textError,
                    msg: this.textCanNotCreateNewDoc,
                    buttons: Ext.Msg.OK,
                    icon: Ext.Msg.ERROR,
                    width: 300
                });
            } else {
                var newDocumentPage = window.open(Ext.String.format("{0}?title={1}&action=create&doctype=text", this.createUrl, this.newDocumentTitle));
                if (newDocumentPage) {
                    newDocumentPage.focus();
                }
                Common.component.Analytics.trackEvent("Create New", "Blank");
            }
        }
    },
    onTemplateClick: function (view, record, item, index, e) {
        var filePanel = this.getFilePanel();
        if (filePanel) {
            filePanel.closeMenu();
        }
        if (this.nativeApp === true) {
            if (this.api) {
                this.api.OpenNewDocument(record.data.name);
            }
        } else {
            var newDocumentPage = window.open(Ext.String.format("{0}?title={1}&template={2}&action=create&doctype=text", this.createUrl, this.newDocumentTitle, record.data.name));
            if (newDocumentPage) {
                newDocumentPage.focus();
            }
        }
        Common.component.Analytics.trackEvent("Create New");
    },
    newDocumentTitle: "Unnamed document",
    textError: "Error",
    textCanNotCreateNewDoc: "Can not create a new document. Address to create a document is not configured."
});