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

dojo.provide("wm.base.debug.ServicePanel");

dojo.declare("wm.debug.ServicePanel", wm.Container, {
    layoutKind: "left-to-right",

/* This hack (providing getRoot and getRuntimeId) is needeed to be able to write event handlers such as onShow: "serviceGridPanel.activate"; without it, we'd need something like
 * app.debugDialog.serviceGridPanel.activate
 */
    getRoot: function() {
	return this;
    },
	getRuntimeId: function(inId) {
		inId = this.name + (inId ? "." + inId : "");
		return this.owner != app.pageContainer ? this.owner.getRuntimeId(inId) : inId;
	},
	getId: function(inName) {
		return inName;
	},

    postInit: function() {
	this.inherited(arguments);

	wm.conditionalRequire("lib.github.beautify", true);

	this.connect(wm.inflight, "add", this, "newJsonEventStart");
	this.connect(wm.inflight, "remove", this, "newJsonEventEnd");


	var typeDef = this.createComponents({debugServicesType: ["wm.TypeDefinition", {internal: true}, {}, {
	    field0: ["wm.TypeDefinitionField", {"fieldName":"page","fieldType":"string","name":"field0"}, {}],
	    field1: ["wm.TypeDefinitionField", {"fieldName":"name","fieldType":"string","name":"field1"}, {}],
	    field2: ["wm.TypeDefinitionField", {"fieldName":"lastUpdate","fieldType":"date","name":"field2"}, {}],
	    field2b: ["wm.TypeDefinitionField", {"fieldName":"duration","fieldType":"number","name":"field2"}, {}],
	    field3: ["wm.TypeDefinitionField", {"fieldName":"firedBy","fieldType":"string","name":"field3"}, {}],
	    field4: ["wm.TypeDefinitionField", {"fieldName":"data","fieldType":"string","name":"field4"}, {}],
	    field5: ["wm.TypeDefinitionField", {"fieldName":"request","fieldType":"string","name":"field5"}, {}],
	    field6: ["wm.TypeDefinitionField", {"fieldName":"id","fieldType":"string","name":"field6"}, {}],
	    field7: ["wm.TypeDefinitionField", {"fieldName":"status","fieldType":"string","name":"field7"}, {}],
	    field8: ["wm.TypeDefinitionField", {"fieldName":"eventId","fieldType":"number","name":"field8"}, {}]
	}]}, this)[0];
	//typeDef.setOwner(this);
	wm.typeManager.types.debugServicesType.fields.id.include = ["update"];
	var components = this.createComponents({
	    serviceListVar: ["wm.Variable", {type: "debugServicesType", isList: true}],
	    serviceGrid: ["wm.DojoGrid", {width: "100%", height: "100%","columns":[
		{"show":true,"field":"status","title":"-",width:"22px","formatFunc":"wm_image_formatter","formatProps":{"width":18,"height":16}},
		{"show":true,"field":"page","title":"Page","width":"80px","align":"left","formatFunc":""},
		{"show":true,"field":"name","title":"Name","width":"100%","align":"left","formatFunc":""},
		{"show":true,"field":"lastUpdate","title":"Time","width":"80px","align":"left","formatFunc": "wm_date_formatter",
		 "formatProps": {
                     "dateType": "time",
		     formatLength: "medium"
		 }},
		{"show":true,"field":"duration","title":"Length (ms)","width":"80px","align":"left","formatFunc": "wm_number_formatter"},
		{"show":true,"field":"firedBy","title":"FiredBy","width":"120px","align":"left","formatFunc":""},
		{"show":true,"field":"data","title":"Data","width":"80px","align":"left","formatFunc":"showDataCell", expression: ""}
	    ],
					  "margin":"4",
					  "name":"serviceGrid"}, {onSelect: "showDataTabs"}, {
					      binding: ["wm.Binding", {"name":"binding"}, {}, {
						  wire: ["wm.Wire", {"expression":undefined,"name":"wire","source":"serviceListVar","targetProperty":"dataSet"}, {}]
					      }]
					  }],
	    splitter: ["wm.Splitter",{showing:false, bevelSize: "4"}],
	    inspector: ["wm.debug.Inspector", {}, {onXClick: "XClick"}]
	},this);
    },
    XClick: function() {
        this.serviceGrid.deselectAll();
        dojo.disconnect(this._requestConnect);
        dojo.disconnect(this._resultConnect );
        delete this._requestConnect;
        delete this._resultConnect;

        this.showDataTabs(this.serviceGrid);
    },
    showDataCell: function(inValue, rowId, cellId, cellField, cellObj, rowObj) {
        var data = rowObj.data;
        if (data instanceof Error) {
            return data.toString();
        } else if (dojo.isArray(data)) {
            return data.length + ' items';
        } else if (wm.isEmpty(data)) {
            return 'Empty';
        } else {
            return 'Has Data';
        }
    },
    showDataTabs: function(inSender) {
        var hasSelection = this.serviceGrid.hasSelection();
        this.serviceGrid.setColumnShowing("page", !hasSelection, true);
        this.serviceGrid.setColumnShowing("lastUpdate", !hasSelection, true);
        this.serviceGrid.setColumnShowing("firedBy", !hasSelection, true);
        this.serviceGrid.setColumnShowing("data", !hasSelection, true);
        this.serviceGrid.setColumnShowing("duration", !hasSelection, false);

        this.serviceGrid.setWidth(hasSelection ? "150px" : "100%");
        if (hasSelection) {
            this.inspect(inSender);
        } else {
            this.inspector.hide();
            this.splitter.hide();
        }

    },
    inspect: function(inSender) {
            this.selectedGridItem = inSender.selectedItem;
            var eventId = inSender.selectedItem.getValue("eventId");
            if (eventId) {
                var eventObj = wm.debug.EventsPanel.prototype.findEventById(eventId);
            }
            this.selectedItem = app.getValueById(inSender.selectedItem.getValue("id"));
            this.inspector.show();
            this.inspector.inspect(this.selectedItem, this.selectedGridItem, eventObj);
            this.splitter.show();
            this.splitter.findLayout();

            if (this._requestConnect) {
                dojo.disconnect(this._requestConnect);
            }
            if (this._resultConnect) {
                dojo.disconnect(this._resultConnect);
            }

            this._requestConnect = dojo.connect(this.selectedItem, "request", this, function() {
                this.serviceGrid.selectByQuery({id: this.selectedItem.getRuntimeId()});
                this.inspect(this.serviceGrid);
            });
            this._resultConnect = dojo.connect(this.selectedItem, "onResult", this, function() {
                this.serviceGrid.selectByQuery({id: this.selectedItem.getRuntimeId()});
                this.inspect(this.serviceGrid);
            });

        },
/*
    updateGridButtonClick: function(inSender, fieldName, rowData, rowIndex) {
      try {
	  / * Causes this click to show as "debugger" in the grid * /
	  (function wmdebugger() {
              var c = app.getValueById(rowData.id);
              c.update();
	  })();
      } catch(e) {
      }
  },
    */
    getLoadingIcon: function() {
        return dojo.moduleUrl("wm.base.widget.themes.default.images") + "loadingThrobber.gif";
    },
    getErrorIcon: function() {
        return dojo.moduleUrl("lib.images.boolean.Signage") + "Denied.png";
    },
    getSuccessIcon: function() {
        return dojo.moduleUrl("lib.images.boolean.Signage") + "OK.png";
    },
    newJsonEventStart: function(inDeferred, inService, optName, inArgs, inMethod, invoker) {
        if (!this.isAncestorHidden()) {
            this.generateServicesLayer();
        }
        var count = this.serviceListVar.getCount();
        var id = invoker ? invoker.getRuntimeId() : "";
        for (var i = 0; i < count; i++) {
            var item = this.serviceListVar.getItem(i);
            if (id === item.getValue("id")) {
                item.setValue("status", this.getLoadingIcon());
                var self = this;
                inDeferred.addCallback(function() {
                    item.setValue("status", self.getSuccessIcon());
                });
                inDeferred.addErrback(function(inError) {
                    item.setValue("status", self.getErrorIcon());
                    item.setValue("data", inError);
                });
                break;
            }
        }
    },
    newJsonEventEnd: function(inDeferred, inService, optName, inArgs, inMethod, invoker) {;
    },

    activate: function() {
        this.generateServicesLayer();
    },
    deactivate: function() {},
    generateServicesLayer: function() {
        this.serviceListVar.beginUpdate();
        for (var id in wm.Component.byId) {
            var c = wm.Component.byId[id];

            /* Only include servicevars */
            if (c instanceof wm.ServiceVariable == false) {
                continue;
            }
            var page = c.getParentPage();
            var pageName = page ? page.declaredClass : "app";
            var componentName = id.indexOf(wm.decapitalize(pageName)) == 0 ? id.substring(pageName.length + 1) : id;
            var firedBy = "";
            if (c._debug) {
                if (c._debug.trigger) {
                    firedBy = c._debug.trigger;
                }
                else if (c._debug.eventName) {
                    firedBy = c._debug.eventName;
                }
            } else {
                firedBy = "";
            }

            var status = "";
            if (c instanceof wm.ServiceVariable) {
                if (c._requester) {
                    status = this.getLoadingIcon();
                } else if (c._lastError) {
                    status = this.getErrorIcon();
                } else if (firedBy) {
                    status = this.getSuccessIcon();
                }
            }
            var itemData = {
                page: pageName,
                name: componentName,
                id: c.getRuntimeId(),
                status: status,
                lastUpdate: c._debug && c._debug.lastUpdate ? c._debug.lastUpdate : undefined,
                duration: c._debug && c._debug.duration ? c._debug.duration : undefined,
                firedBy: firedBy || (c instanceof wm.ServiceVariable ? "<i>Never Fired</i>" : ""),
                data: c._lastError ? c._lastError : c.getData(),
                eventId: c._debug ? c._debug.eventId : null,
                request: c._debug ? c._debug.request : {}
            };

            // See if the item exists and update it if it does
            var found = false;
            var count = this.serviceListVar.getCount();
            for (var i = 0; i < count; i++) {
                var item = this.serviceListVar.getItem(i);
                if (item.getValue("page") == pageName && item.getValue("name") == componentName) {
                    found = true;
                    item.beginUpdate();
                    item.setData(itemData);
                    item.endUpdate();
                    break;
                }
            }
            if (!found) {
                if (!itemData.lastUpdate) itemData.lastUpdate = new Date();
                this.serviceListVar.addItem(itemData);
            }
        }

        this.serviceListVar.endUpdate();
        this.serviceListVar.notify();
    },
    newJsonEvent: function(inDeferred, inService, optName, inArgs, inMethod, invoker) {

    }
});

