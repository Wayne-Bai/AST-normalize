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

dojo.provide("wm.base.components.DataModel");
dojo.require("wm.base.components.ServerComponent");

/**
    Component that provides information about Data Model.
    @name wm.DataModel
    @class
    @extends wm.ServerComponent
*/
dojo.declare("wm.DataModel", wm.ServerComponent, {
    noInspector: true,
    dataModelName: "",
    userName: "",
    password: "",
    dbType: "",
    host: "",
    port: "",
    dbName: "",
    noPrompt: false,
    _type: "import",
    afterPaletteDrop: function() {
        this.newDataModelDialog();
        return true;
    },
    newDataModelDialog: function(inSender) {
        if (this._type == "import") {
            var d = studio.isCloud() ? this.getCloudFoundryDatabasesDialog() : this.getCreateDataModelDialog();
            if (d.page) d.page.update(this);
            d.show();
        } else {
            app.prompt(studio.getDictionaryItem("wm.DataModel.ENTER_NAME"), "MyTestDatabase", dojo.hitch(this, "createDataModel"));
        }
        /*
        if (this._type == "import") {
        d.page.tabs.setLayerIndex(0);
        d.setHeight("300px");
        } else {
        d.page.tabs.setLayerIndex(1);
        d.setHeight("150px");
        }
        */
    },
    createDataModel: function(inValue) {
        if (wm.services.byName[inValue]) {
            var newValue = inValue;
            while (wm.services.byName[newValue]) newValue += "1";
                app.prompt(studio.getDictionaryItem("wm.DataModel.ENTER_NAME_TAKEN", {name: inValue}), newValue, dojo.hitch(this, "createDataModel"));
                return;
        }
        this._dataModelName = inValue;
        studio.beginWait(studio.getDictionaryItem("wm.DataModel.WAIT_ADDING", {dataModel: inValue}));
        studio.dataService.requestAsync(NEW_DATA_MODEL_OP,
            [inValue],
            dojo.hitch(this, "newDataModelResult"),
            dojo.hitch(this, "newDataModelError"));
    },
    newDataModelError: function(inError) {
        studio.endWait();
        app.alert(inError);
    },
    newDataModelResult: function() {
        this.completeNewDataModel();
        studio.endWait(studio.getDictionaryItem("wm.DataModel.WAIT_ADDING", {dataModel: this._dataModelName}));
    },

    getCloudFoundryDatabasesDialog: function() {
    if (!studio.importCFDBDialog) {
        var props = {
        _classes: {domNode: ["studiodialog"]},
        owner: app,
        pageName: "ImportCloudFoundryDatabase",
        hideControls: true,
        width: "550px",
        height: "290px",
        title: studio.getDictionaryItem("wm.DataModel.IMPORT_DATABASE_TITLE")
        };
        var d = studio.importCFDBDialog = new wm.PageDialog(props);
    } else {
        var d = studio.importCFDBDialog;
    }
    d.onClose = dojo.hitch(this, function(inWhy) {
        if (inWhy == "Import" || inWhy == "New")
        this.completeNewDataModel();
    });

    return d;
    },
    getCreateDataModelDialog: function() {
        if (!studio.importDBDialog) {
        var props = {
            _classes: {domNode: ["studiodialog"]},
            owner: app,
            pageName: "ImportDatabase",
            hideControls: true,
            width: 750,
            height: 290,
            title: studio.getDictionaryItem("wm.DataModel.IMPORT_DATABASE_TITLE")
        };
        var d = studio.importDBDialog = new wm.PageDialog(props);
        } else {
        var d = studio.importDBDialog;
        }

        d.onPageReady = dojo.hitch(d, function() {
            d.onShow = dojo.hitch(d.page, "update", this);
        });
        d.onClose = dojo.hitch(this, function(inWhy) {
            if (inWhy == "Import" || inWhy == "New")
                this.completeNewDataModel();
        });
        return d;
    },
    completeNewDataModel: function() {
        var p = studio.isCloud() ? studio.importCFDBDialog : studio.importDBDialog;
        if (p) p = p.page;
        if (this._dataModelName || p && p.dataModelName) {
            var n = this._dataModelName || p.dataModelName;
            var c = wm.registerNewDatabaseService(n);

            // If designing a data model
            if (this._dataModelName) {
                //studio.select(c);
                studio.navGotoComponentsTreeClick();
                studio.tree.select(c._studioTreeNode);
            }

            // else we're importing a datamodel
            else {
                app.toastSuccess(studio.getDictionaryItem("wm.DataModel.TOAST_IMPORT_SUCCESS", {dataModel: n}));
            }
        }

    },
    editView: function() {
        var c = studio.navGotoEditor("DataObjectsEditor", studio.databaseTab, this.getLayerName(), this.getLayerCaption());
        if (this.dataModelName) {
            c.pageLoadedDeferred.addCallback(dojo.hitch(this, function() {
                c.page.setDataModel(this);
                return true;
            }));
        }
    },
    preNewComponentNode: function(inNode, inProps) {
        inProps.closed = true;
        inProps._data = {children: ["faux"]};
        inProps.initNodeChildren = dojo.hitch(this, "initNodeChildren");
    },
    initNodeChildren: function(inNode) {
        studio.dataService.requestSync("getTypeRefTree", null, dojo.hitch(this, function(inData) {
            var dbs = inData.dataObjectsTree;
            if (dbs) {
                dbs = dbs[0].children;
                for (var i=0, d; d=dbs[i]; i++) {
                    if (d.content == this.dataModelName) {
                        d.children = d.children[0].children;
                        for (var ii=0, di; di=d.children[ii]; ii++) {
                            var c = new wm.DataModelEntity({
                                dataModelName: this.dataModelName,
                                entityName: di.content
                            });
                            var en = studio.newComponentNode(inNode, c, c.entityName, "images/wm/cubes.png");
                            en.closed = true;
                            inNode.tree.renderDataNode(en, di.children);
                        }
                        if (!this._studioTreeNode)
                            inNode.closed = true;
                        return;
                    }
                }
            }
        }));
        studio.addQryAndViewToTree(inNode);
    },
    designSelect: function() {
        if (studio.tree.selected && (studio.tree.selected.component instanceof wm.DataModelEntity)) return;
        var c = studio.navGotoEditor("DataObjectsEditor", studio.databaseTab, this.getLayerName(), this.getLayerCaption());
        studio.selected[0]._studioTreeNode.setOpen(true);
        c.page.setDataModel(this);
        c.page._selectNode();
/*
        if (studio.selected._studioTreeNode.kids.length) {
        var entityName = studio.selected._studioTreeNode.kids[0].content;
        c.page.objectPages.setLayer(c.page.OBJECT_PAGE);
        } else {
        c.page.objectPages.setLayer(c.page.DEFAULT_PAGE);
        }
*/
    },
    getLayerName: function() {
    return this.name + "DataModelLayer";
    },
    getLayerCaption: function() {
    return this.name + " (" + studio.getDictionaryItem("wm.DataModel.TAB_CAPTION") + ")";
    },

    showOracleJarDialog: function() {
    studio.handleMissingJar("ojdbc14.jar",
                studio.getDictionaryItem("wm.DataModel.ORACLE_JAR_INSTRUCTIONS"));

    },
    showDB2JarDialog: function() {
    studio.handleMissingJar("db2jcc.jar",
                studio.getDictionaryItem("wm.DataModel.DB2_JAR_INSTRUCTIONS"));

    },

    hasServiceTreeDrop: function() {return true;},
    onServiceTreeDrop: function(inParent, inOwner) {
    return new wm.LiveVariable({owner: inOwner,
                    name: inOwner.getUniqueName("liveVariable")});
    }

});

dojo.declare("wm.DataModelEntity", wm.Component, {
    noInspector: true,
    dataModelName: "",
    entityName: "",
    init: function() {
        this.inherited(arguments);
        this.publishClass = this.publishClass || this.declaredClass;
    },
    write: function() {
        return "";
    },
    designSelect: function() {
        var c = studio.navGotoEditor("DataObjectsEditor", studio.databaseTab, this.getLayerName(), this.getLayerCaption());
        c.page.objectPages.setLayer(c.page.OBJECT_PAGE);
        if (this.entityName) {
        	if (c.pageLoadedDeferred) {
	            c.pageLoadedDeferred.addCallback(dojo.hitch(this, function() {
	                c.page.selectEntity(this.dataModelName, this.entityName);
	                return true;
	            }));
	        } else {
	               c.page.selectEntity(this.dataModelName, this.entityName);
	        }
        }
    },
    getLayerName: function() {
    return this.dataModelName + "DataModelLayer";
    },
    getLayerCaption: function() {
    return this.dataModelName + " (" + studio.getDictionaryItem("wm.DataModel.TAB_CAPTION") + ")";
    },
    hasServiceTreeDrop: function() {return true;},
    onServiceTreeDrop: function(inParent, inOwner) {
    var types = wm.dataSources.sources[this.dataModelName];
    var type;
    for (var i = 0; i < types.length; i++) {
        if (types[i].caption == this.entityName) {
        type = types[i].type;
        break;
        }
    }
    wm.require("wm.LivePanel");
    var panel = new wm.LivePanel({owner: inOwner,
                      parent: inParent,
                      liveDataName: this.entityName.toLowerCase(),
                      liveSource: type,
                      name: inOwner.getUniqueName(this.dataModelName + "LivePanel")});
    panel.afterPaletteDrop();
    return panel;
    }
});

dojo.declare("wm.DataModelLoader", null, {
    getComponents: function() {
        var cs = [];
        studio.dataService.requestSync("getDataModelNames", null, function(inData) {
            for (var i in inData) {
                if (typeof(inData[i]) != "function") { /* Fixes bug introduced by changes to JS objects by the ACE editor; affects IE 8 only */
                var n = inData[i];
                    studio.dataService.requestSync(LOAD_CONNECTION_PROPS_OP, [n], function(inResponse) {
                    if (inResponse.driverClassName == "oracle.jdbc.driver.OracleDriver" && studio.isJarMissing("ojdbc.jar")) {
                    wm.DataModel.prototype.showOracleJarDialog();
                    } else if (inResponse.driverClassName == "com.ibm.db2.jcc.DB2Driver" && studio.isJarMissing("db2jcc.jar")) {
                    wm.DataModel.prototype.showDB2JarDialog();
                    }
                });
                var c = new wm.DataModel({name: n, dataModelName: n});
                cs.push(c);
                }
            }
        });
        return cs;
    }
});

wm.registerComponentLoader("wm.DataModel", new wm.DataModelLoader());

/*
sakilalight_dataModel = {
    dataModelName: "sakilalight",
    userName: "root",
    password: "",
    dbType: "MySQL",
    host: "localhost",
    port: "3306",
    dbName: "sakilalight"
};

wm.registerPackage(["Components", "Sakilalight Data Model", "wm.DataModel", "wm.base.components.DataModel", "images/wm/data_blue.png", "", sakilalight_dataModel]);
*/
