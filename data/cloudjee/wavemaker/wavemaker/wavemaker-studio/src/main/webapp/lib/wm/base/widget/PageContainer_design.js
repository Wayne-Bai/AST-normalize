/*
 *  Copyright (C) 2012-2013 CloudJee, Inc. All rights reserved.
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

dojo.provide("wm.base.widget.PageContainer_design");
dojo.require("wm.base.widget.PageContainer");
dojo.require("wm.base.components.Property_design");

// design only
wm.PageContainer.extend({
    themeable: false,
    scrim: true,
    _isBindSource: true,
    createOpenPageButton: function() {
        if (this.openPageButton) {
            dojo.destroy(this.openPageButton);
            dojo.disconnect(this.openPageButtonConnect);
        }
        var openPageButton = this.openPageButton = document.createElement("div");

        openPageButton.className = "openPageContainerDesignWrapperButton" + ((this.pageName) ? " hasPageName" : "");
        openPageButton.innerHTML = (this.pageName) ? studio.getDictionaryItem("wm.PageContainer.OPEN_PAGE") : studio.getDictionaryItem("wm.PageContainer.NEW_PAGE");
        this.designWrapper.domNode.appendChild(openPageButton);
        this._designerOpenPageButton = openPageButton;
        this.openPageButtonConnect = dojo.connect(openPageButton, "onclick", this, function() {
            if (this.pageName) {
                var warnPage = studio.getDictionaryItem("CONFIRM_OPEN_PAGE", {
                    newPage: this.pageName,
                    oldPage: studio.project.pageName
                });
                studio.confirmPageChange(warnPage, this.pageName, /* onSave */
                dojo.hitch(this, function(noChanges) {
                    studio.project.saveProject(false, dojo.hitch(this, function() {
                        studio.project.openPage(this.pageName);
                    }));
                }), /* onDontSave */
                dojo.hitch(this, function() {
                    studio.project.openPage(this.pageName);
                }), null, /* onCance */ !studio.isPageDirty() /* skip save */ );

                /*

            app.confirm(studio.getDictionaryItem("wm.PageContainer.CONFIRM_SAVE_CHANGES"), false,
                dojo.hitch(this,function() {
                    this.connect(studio, "saveProjectComplete", this, function() {
                    studio.project.openPage(this.pageName);
                    });
                    studio.saveAll(studio.project);
                }),
                dojo.hitch(this, function() {
                    studio.project.openPage(this.pageName);
                }));
                */
            } else {
                this.createNewPage();
            }
        });

    },

    createNewPage: function(optionalInPageType) {
        var pages = studio.project.getPageList();
        var l = {};
        dojo.forEach(pages, function(p) {
            l[p] = true;
        });
        studio.promptForName("page", wm.findUniqueName("Page", [l]), pages, dojo.hitch(this, function(n) {
            n = wm.capitalize(n);
            if (this.owner instanceof wm.PageDialog) this.owner[optionalInPageType || "pageName"] = n;
            else this[optionalInPageType || "pageName"] = n;

            var onSuccess = function() {
                    switch (optionalInPageType) {
                        case "phonePageName":
                            studio.phoneToggleButton.click();
                            break;
                        case "tabletPageName":
                            studio.tabletToggleButton.click();
                            break;
                        default:
                            studio.desktopToggleButton.click();
                            break;
                    }
                };
            studio.confirmSaveDialog.page.setup(
            studio.getDictionaryItem("CONFIRM_OPEN_PAGE", {
                oldPage: studio.project.pageName,
                newPage: this[optionalInPageType || "pageName"]
            }), /* onSave */
            dojo.hitch(this, function() {
                studio.project.saveProject(false, dojo.hitch(this, function() {
                    studio.project.newPage(n);
                    onSuccess();
                }));
            }), /* onDontSave */
            dojo.hitch(this, function() {
                studio.project.newPage(n);
                onSuccess();
            }), null, /* onCancel */ !studio.isPageDirty()); /* skip save */
        }));
    },
    designCreate: function() {
        this.inherited(arguments);
        if (this.designWrapper) dojo.addClass(this.designWrapper.domNode, "wmchrome-wrapper");
    },
    set_pageName: function(inName) {
        if (inName == studio.getDictionaryItem("wm.PageContainer.NEW_PAGE_OPTION")) {
            this.createNewPage("");
        } else {
            this.setPageName(inName);
            studio.reinspect(true); // update the pagecontainer properties
        }
    },
    set_tabletPageName: function(inName) {
        if (inName == studio.getDictionaryItem("wm.PageContainer.NEW_PAGE_OPTION")) {
            this.createNewPage("tabletPageName");
        } else {
            this.setPageName(inName, "tabletPageName");
            studio.reinspect(true); // update the pagecontainer properties
        }
    },
    set_phonePageName: function(inName) {
        if (inName == studio.getDictionaryItem("wm.PageContainer.NEW_PAGE_OPTION")) {
            this.createNewPage("phonePageName");
        } else {
            this.setPageName(inName, "phonePageName");
            studio.reinspect(true); // update the pagecontainer properties
        }
    },
    writeChildren: function() {
        return [];
    },
    // write only binding.
    writeComponents: function(inIndent) { /* Remove invalid bindings; typically caused by a wm.Property having been renamed or deleted */
        var props = this.listProperties();
        for (var propName in this.components.binding.wires) {
            var componentName = propName.replace(/\..*$/, "");
            if (!props[propName] && !props[componentName] && !this.subpageProplist[componentName]) {
                this.components.binding.removeWire(propName);
            }
        }


        var
        s = [];
        c = this.components.binding.write(inIndent);
        if (c) s.push(c);
        return s;
    },

    makePropEdit: function(inName, inValue, inEditorProps) {
        if (this.page && this.subpageProplist[inName]) {
            try {
                var pid = this.page[inName].property;
                var componentName = pid.replace(/\..*?$/, "");
                var c = this.page.getValueById(componentName);
                var editor = c.makePropEdit(pid.replace(/^.*\./, ""), inValue, inEditorProps);
                return editor;
                /* TODO: PROPINSPECTOR CHANGE: Need to fix this
            if (typeof editor == "string")
            return editor.replace(/studio_propinspect_.*?"/, "studio_propinspect_" + inName + '"');
            else {
            / * Use the prop editor that was geneated but update the property name and component to point to this * /
            editor.name = inName;
            editor.component = this;
            return editor;
        }*/
            } catch (e) {}
        }
        return this.inherited(arguments);
    },

    /* TODO: PROPINSPECTOR CHANGE: Need to fix this */
    editProp: function(inName, inValue) {
        if (this.page && this.subpageProplist[inName]) {
            try {
                var pid = this.page[inName].property;
                var componentName = pid.replace(/\..*?$/, "");
                var c = this.page.getValueById(componentName);
                c.editProp(pid.replace(/^.*\./, ""), inValue);
            } catch (e) {
                return;
            }
        } else {
            return this.inherited(arguments);
        }
    },
    afterPaletteDrop: function() {
        // change default so deferLoad is false
        // this.inherited(arguments);
        this.deferLoad = true;
    },
    createDesignContextMenu: function(children) {
        var pagelist = wm.getPageList(this.currentPageOK);
        if (pagelist.length) {
            var data = {
                label: "Set PageName",
                iconClass: "Studio_silkIconImageList_30",
                children: []
            };

            for (var i = 0; i < pagelist.length; i++) {
                data.children.push(this.addPageToContextMenu(pagelist[i]));
            }
            children.push(data);
        }
    },
    addPageToContextMenu: function(pagename) {
        return {
            label: pagename,
            onClick: dojo.hitch(this, function() {
                this.setPageName(pagename);
            })
        };
    },
    updateDesignTimePageName: function() {
        wm.job(this.getRuntimeId() + ".updateDesignTimePageName", 50, dojo.hitch(this, "updatePageName"));
    },
    isEventProp: function(n) {
        if (this.subpageEventlist != null && n in this.subpageEventlist) return true;
        return this.inherited(arguments);
    },
    listProperties: function() {
        var props = this.inherited(arguments);
        if (!this.page) return props;
        var newprops = wm.listMatchingComponents([this.page], function(c) {
            return c instanceof wm.Property;
        });
        this.subpageProplist = {};
        this.subpageEventlist = {};
        this.subpageMethodlist = {};
        dojo.forEach(newprops, function(p, i) { /* Don't clobber any existing properties */
            var propDef;
            if (props[p.name] === undefined || !props[p.name].group) {
                if (p.isEvent) {
                    this.subpageEventlist[p.name] = p.property; //this.eventBindings[p.name];
                    /*
            if (this[p.name] === undefined) {
            this[p.name] = function(){};
            }
            */

                } else {
                    this.subpageProplist[p.name] = p.property;
                }
                props[p.name] = {
                    group: p.group || "subpageprops",
                    order: p.order || 0,
                    name: p.name,
                    type: p.type || "string",
                    bindTarget: p.bindTarget,
                    bindSource: p.bindSource,
                    isEvent: p.isEvent,
                    readonly: p.readonly,
                    hidden: p.hidden,
                    ignore: p.ignore,
                    operation: p.operation,
                    _operation: p._operation,
                    operationTarget: p.operationTarget,
                    editor: p.editor,
                    propertyId: p.property
                };
                var propertyPath = p.property;
                if (propertyPath.indexOf(".") != -1) {
                    var componentId = propertyPath.substring(0, propertyPath.lastIndexOf("."));
                    var propertyName = propertyPath.substring(propertyPath.lastIndexOf(".") + 1);
                    var component = p.owner.getValueById(componentId);
                    if (component && component instanceof wm.Component && propertyName) {
                         propDef = dojo.clone(component.listProperties()[propertyName]);

                        if (!propDef) {
                            return;
                        }

                        if (propDef.method) {
                            this.subpageMethodlist[p.name] = p.property;
                            delete this.subpageProplist[p.name];
                        }
                        dojo.mixin(props[p.name], {
                            editor: propDef.editor,
                            options: propDef.options,
                            operation: propDef.operation,
                            _operation: propDef._operation,
                            operationTarget: propDef.operationTarget,
                            editor: propDef.editor,
                            editorProps: propDef.editorProps,
                            ignore: propDef.ignore,
                            // these three used for bind-only properties
                            hidden: propDef.hidden,
                            writeonly: propDef.writeonly,
                            method: propDef.method,
                            editorProps: propDef.editorProps
                        });
                    }
                    if (!propDef) {
                        return;
                    }

                    if (props[p.name].operation) {
                        if (typeof props[p.name].operation == "function") {
                            // do nothing
                            ;
                        } else if (typeof props[p.name].operation == "string") {
                            props[p.name]._operation = dojo.hitch(component, propDef.operation);
                        } else {
                            props[p.name]._operation = dojo.hitch(component, propertyName);
                        }
                    }
                }

            }
        }, this);

        return props;
    }
});

wm.Object.extendSchema(wm.PageContainer, {
    manageURL: {ignore:0},
    manageHistory: {ignore:0},
/*
    pageName: {group: "display", subgroup: "misc", requiredGroup:1,bindable: 1, type: "string", order: 50, pageProperty: "page", editor: "wm.prop.PagesSelect"},
    deferLoad: {group: "display", subgroup: "misc", order: 100, type: "boolean"},
    loadParentFirst: {group: "display", subgroup: "misc", order: 101, type: "boolean", advanced:1},
    */
    pageName: {group: "widgetName", subgroup: "data", requiredGroup:1,bindable: 1, type: "string", order: 50, pageProperty: "page", editor: "wm.prop.PagesSelect"},
    phonePageName: {group: "mobile", subgroup: "data", type: "string",pageProperty: "page", editor: "wm.prop.PagesSelect"},
    tabletPageName: {group: "mobile", subgroup: "data", type: "string",pageProperty: "page", editor: "wm.prop.PagesSelect"},
    deferLoad: {group: "widgetName", subgroup: "behavior", order: 100, type: "boolean"},
    loadParentFirst: {group: "widgetName", subgroup: "behavior", order: 101, type: "boolean", advanced:1},

    /* Hidden group */
    subpageProplist: {writeonly: 1},
    subpageEventlist: {writeonly: 1},
    subpageMethodlist: {writeonly: 1},

    /* Ignored group */
    pageLoadedDeferred: {ignore: 1},
    box: {ignore: 1},
    disabled: {ignore: 1},
    page: {ignore: 1},
    hint: {ignore: 1},

    /* Method group */
    setPageName: {method:1},
    forceReloadPage: {method:1}

});
