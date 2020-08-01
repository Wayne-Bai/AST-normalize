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
 Ext.define("SSE.view.MainSettingsGeneral", {
    extend: "Ext.container.Container",
    alias: "widget.ssemainsettingsgeneral",
    cls: "sse-documentsettings-body",
    requires: ["Ext.button.Button", "Ext.container.Container", "Ext.form.Label", "Ext.form.field.Checkbox", "Ext.util.Cookies"],
    constructor: function (config) {
        this.initConfig(config);
        this.callParent(arguments);
        return this;
    },
    initComponent: function () {
        this._changedProps = {
            zoomIdx: 5,
            showchangesIdx: 1,
            fontrenderIdx: 0,
            unitIdx: 0,
            saveVal: 600
        };
        this._oldUnit = undefined;
        this.chLiveComment = Ext.create("Ext.form.field.Checkbox", {
            id: "docsettings-live-comment",
            checked: true,
            boxLabel: this.strLiveComment,
            width: 500
        });
        this._arrZoom = [[50, "50%"], [60, "60%"], [70, "70%"], [80, "80%"], [90, "90%"], [100, "100%"], [110, "110%"], [120, "120%"], [150, "150%"], [175, "175%"], [200, "200%"]];
        this.cmbZoom = Ext.create("Ext.form.field.ComboBox", {
            width: 90,
            editable: false,
            store: this._arrZoom,
            mode: "local",
            triggerAction: "all",
            value: this._arrZoom[5][1],
            listeners: {
                select: Ext.bind(function (combo, records, eOpts) {
                    this._changedProps.zoomIdx = records[0].index;
                    combo.blur();
                },
                this)
            }
        });
        this._arrFontRender = [[c_oAscFontRenderingModeType.hintingAndSubpixeling, this.txtWin], [c_oAscFontRenderingModeType.noHinting, this.txtMac], [c_oAscFontRenderingModeType.hinting, this.txtNative]];
        this.cmbFontRender = Ext.create("Ext.form.field.ComboBox", {
            id: "docsettings-font-render",
            width: 150,
            editable: false,
            store: this._arrFontRender,
            mode: "local",
            triggerAction: "all",
            value: this._arrFontRender[0][1],
            listeners: {
                select: Ext.bind(function (combo, records, eOpts) {
                    this._changedProps.fontrenderIdx = records[0].index;
                    combo.blur();
                },
                this)
            }
        });
        this._arrUnit = [[Common.MetricSettings.c_MetricUnits.cm, this.txtCm], [Common.MetricSettings.c_MetricUnits.pt, this.txtPt]];
        this.cmbUnit = Ext.create("Ext.form.field.ComboBox", {
            id: "docsettings-combo-unit",
            width: 150,
            editable: false,
            store: this._arrUnit,
            mode: "local",
            triggerAction: "all",
            value: this._arrUnit[0][1],
            listeners: {
                select: Ext.bind(function (combo, records, eOpts) {
                    this._changedProps.unitIdx = records[0].index;
                    combo.blur();
                },
                this)
            }
        });
        this._arrAutoSave = [[0, this.textDisabled], [60, this.textMinute], [300, this.text5Minutes], [600, this.text10Minutes], [1800, this.text30Minutes], [3600, this.text60Minutes]];
        this.cmbAutoSave = Ext.create("Ext.form.field.ComboBox", {
            id: "docsettings-combo-save",
            width: 150,
            editable: false,
            store: this._arrAutoSave,
            mode: "local",
            triggerAction: "all",
            value: this._arrAutoSave[3][1],
            listeners: {
                select: Ext.bind(function (combo, records, eOpts) {
                    this._changedProps.saveVal = records[0].data.field1;
                    combo.blur();
                },
                this)
            }
        });
        this.btnOk = Ext.widget("button", {
            cls: "asc-blue-button",
            width: 90,
            height: 22,
            text: this.okButtonText,
            listeners: {
                click: function (btn) {
                    this.applySettings();
                },
                scope: this
            }
        });
        this.items = [{
            xtype: "container",
            layout: {
                type: "table",
                columns: 2,
                tableAttrs: {
                    style: "width: 100%;"
                },
                tdAttrs: {
                    style: "padding: 5px 10px;"
                }
            },
            height: "100%",
            items: [{
                xtype: "label",
                cellCls: "doc-info-label-cell",
                text: this.txtLiveComment,
                style: "display: block;text-align: right; margin-bottom: 1px;",
                width: "100%",
                hideId: "element-coauthoring"
            },
            this.chLiveComment, {
                xtype: "tbspacer",
                hideId: "element-coauthoring"
            },
            {
                xtype: "tbspacer"
            },
            {
                xtype: "label",
                cellCls: "doc-info-label-cell",
                text: this.strZoom,
                style: "display: block;text-align: right; margin-bottom: 5px;",
                width: "100%"
            },
            this.cmbZoom, {
                xtype: "tbspacer"
            },
            {
                xtype: "tbspacer"
            },
            {
                xtype: "label",
                cellCls: "doc-info-label-cell",
                text: this.strFontRender,
                style: "display: block;text-align: right; margin-bottom: 5px;",
                width: "100%"
            },
            this.cmbFontRender, {
                xtype: "tbspacer",
                hideId: "element-edit-mode"
            },
            {
                xtype: "tbspacer"
            },
            {
                xtype: "label",
                cellCls: "doc-info-label-cell",
                text: this.textAutoSave,
                style: "display: block;text-align: right; margin-bottom: 5px;",
                width: "100%",
                hideId: "element-autosave"
            },
            this.cmbAutoSave, {
                xtype: "tbspacer",
                hideId: "element-autosave"
            },
            {
                xtype: "tbspacer"
            },
            {
                xtype: "label",
                cellCls: "doc-info-label-cell",
                text: this.strUnit,
                style: "display: block;text-align: right; margin-bottom: 5px;",
                width: "100%",
                hideId: "element-edit-mode"
            },
            this.cmbUnit, {
                xtype: "tbspacer",
                height: 10
            },
            {
                xtype: "tbspacer",
                height: 10
            },
            {
                xtype: "tbspacer"
            },
            this.btnOk]
        }];
        this.addEvents("savedocsettings");
        this.addEvents("changemeasureunit");
        this.callParent(arguments);
    },
    setApi: function (o) {
        this.api = o;
    },
    applySettings: function () {
        window.localStorage.setItem("sse-settings-livecomment", this.chLiveComment.getValue() ? 1 : 0);
        window.localStorage.setItem("sse-settings-zoom", this._arrZoom[this._changedProps.zoomIdx][0]);
        window.localStorage.setItem("sse-settings-fontrender", this._arrFontRender[this._changedProps.fontrenderIdx][0]);
        window.localStorage.setItem("sse-settings-unit", this._arrUnit[this._changedProps.unitIdx][0]);
        window.localStorage.setItem("sse-settings-autosave", this._changedProps.saveVal);
        Common.component.Analytics.trackEvent("File Menu", "SaveSettings");
        this.fireEvent("savedocsettings", this);
        if (this._oldUnit !== this._arrUnit[this._changedProps.unitIdx][0]) {
            this.fireEvent("changemeasureunit", this);
        }
    },
    updateSettings: function () {
        value = window.localStorage.getItem("sse-settings-livecomment");
        this.chLiveComment.setValue(!(value !== null && parseInt(value) == 0));
        var value = window.localStorage.getItem("sse-settings-zoom");
        this._changedProps.zoomIdx = 5;
        if (value !== null) {
            for (var i = 0; i < this._arrZoom.length; i++) {
                if (this._arrZoom[i][0] == parseInt(value)) {
                    this._changedProps.zoomIdx = i;
                    break;
                }
            }
        }
        this.cmbZoom.setValue(this._arrZoom[this._changedProps.zoomIdx][1]);
        value = window.localStorage.getItem("sse-settings-fontrender");
        if (value !== null) {
            value = parseInt(value);
        } else {
            value = window.devicePixelRatio > 1 ? c_oAscFontRenderingModeType.noHinting : c_oAscFontRenderingModeType.hintingAndSubpixeling;
        }
        for (i = 0; i < this._arrFontRender.length; i++) {
            if (this._arrFontRender[i][0] == value) {
                this._changedProps.fontrenderIdx = i;
                break;
            }
        }
        this.cmbFontRender.setValue(this._arrFontRender[this._changedProps.fontrenderIdx][1]);
        value = window.localStorage.getItem("sse-settings-unit");
        this._changedProps.unitIdx = 0;
        if (value !== null) {
            for (i = 0; i < this._arrUnit.length; i++) {
                if (this._arrUnit[i][0] == parseInt(value)) {
                    this._changedProps.unitIdx = i;
                    break;
                }
            }
        }
        this.cmbUnit.setValue(this._arrUnit[this._changedProps.unitIdx][1]);
        this._oldUnit = this._arrUnit[this._changedProps.unitIdx][0];
        value = window.localStorage.getItem("sse-settings-autosave");
        value = (value !== null) ? parseInt(value) : 600;
        this._changedProps.saveVal = 600;
        var idx = 3;
        for (i = 0; i < this._arrAutoSave.length; i++) {
            if (this._arrAutoSave[i][0] == value) {
                this._changedProps.saveVal = value;
                idx = i;
                break;
            }
        }
        this.cmbAutoSave.setValue(this._arrAutoSave[idx][1]);
        this._ShowHideDocSettings("element-autosave", this.mode.isEdit && (this.mode.canAutosave > -1));
    },
    _ShowHideSettingsItem: function (cmp, visible) {
        var tr = cmp.getEl().up("tr");
        if (tr) {
            tr.setDisplayed(visible);
        }
    },
    _ShowHideDocSettings: function (id, visible) {
        if (!this.rendered) {
            return;
        }
        var components = Ext.ComponentQuery.query('[hideId="' + id + '"]', this);
        for (var i = 0; i < components.length; i++) {
            this._ShowHideSettingsItem(components[i], visible);
        }
    },
    setMode: function (mode) {
        this.mode = mode;
        if (this.mode.canAutosave > -1) {
            var idx = 0;
            for (idx = 1; idx < this._arrAutoSave.length; idx++) {
                if (this.mode.canAutosave < this._arrAutoSave[idx][0]) {
                    break;
                }
            }
        }
        var arr = [];
        arr = this._arrAutoSave.slice(idx, this._arrAutoSave.length);
        arr.unshift(this._arrAutoSave[0]);
        if (arr.length > 0) {
            this.cmbAutoSave.getStore().loadData(arr);
        }
    },
    strLiveComment: "Turn on live commenting option",
    txtLiveComment: "Live Commenting",
    strInputMode: "Turn on hieroglyphs",
    strZoom: "Default Zoom Value",
    strShowChanges: "Realtime Collaboration Changes",
    txtAll: "View All",
    txtLast: "View Last",
    okButtonText: "Apply",
    txtWin: "as Windows",
    txtMac: "as OS X",
    txtNative: "Native",
    strFontRender: "Font Hinting",
    strUnit: "Unit of Measurement",
    txtCm: "Centimeter",
    txtPt: "Point",
    textDisabled: "Disabled",
    textMinute: "Every Minute",
    text5Minutes: "Every 5 Minutes",
    text10Minutes: "Every 10 Minutes",
    text30Minutes: "Every 30 Minutes",
    text60Minutes: "Every Hour",
    textAutoSave: "Autosave"
});