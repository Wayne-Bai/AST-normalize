/*
 * Copyright (C) 2012-2013 CloudJee, Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

dojo.provide("wm.studio.app.StudioApplication");

dojo.declare("StudioApplication", wm.Application, {
    manageURL: false,
    main: "Main",
    theme: "wm_studio",
    widgets: {
        pagesListVar: ["wm.Variable",
        {
            type: "StringData",
            isList: true
        }],
        projectListVar: ["wm.Variable",
        {
            type: "StringData",
            isList: true
        }]
    },

    init: function() {
        dojo["require"]("common." + wm.version.replace(/[^a-zA-Z0-9]/g, "") + "_patches", true);
        this.connect(wm.PageLoader.prototype, "loadController", this, "applyPageFixes");
        this.inherited(arguments);
    },
    applyPageFixes: function(inName) {
        if (wm.componentFixList[inName]) {
            var fixes = wm.componentFixList[inName];
            for (var j = 0; j < fixes.length; j++) {
                fixes[j]();
            }
        }
    },
    confirm: function() {
        var result = this.inherited(arguments);
        dojo.addClass(this.confirmDialog.domNode, "studiodialog");
        this.confirmDialog.$.genericInfoPanel.setBorder("5");
        this.confirmDialog.$.genericInfoPanel.setBorderColor("#313743");
        this.confirmDialog.$.button1.addUserClass("StudioButton");
        this.confirmDialog.$.button2.addUserClass("StudioButton");
        this.confirmDialog.$.button1.parent.setHeight("32px");
        //this.confirmDialog.$.genericInfoPanel.setBorderColor("#424A5A");
        return result;
    },
    alert: function() {
        var hasAlert = this.alertDialog;
        this.inherited(arguments);
        if (!hasAlert) {
            dojo.addClass(this.alertDialog.domNode, "studiodialog");
            this.alertDialog.$.genericInfoPanel.setBorder("5");
            this.alertDialog.$.genericInfoPanel.setBorderColor("#313743");
            this.alertDialog.$.button1.addUserClass("StudioButton");
            this.alertDialog.$.button1.parent.setHeight("32px");
            //this.alertDialog.$.genericInfoPanel.setBorderColor("#424A5A");
        }
    },
    createToolTip: function(message, node, event, source) {
        this.inherited(arguments);
        this.toolTipDialog.setBorderColor("#ccc");
    }
});