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

dojo.provide("wm.base.components.LiveVariable");
dojo.require("wm.base.components.ServiceVariable");
dojo.require("wm.base.components.LiveView");

/**
	Component that marshalls a LiveView and can perform all data operations: read, insert, update, delete.
	@name wm.LiveVariable
	@class
	@extends wm.ServiceVariable
*/
dojo.declare("wm.LiveVariable", wm.ServiceVariable, {
	/**
		@lends wm.LiveVariable.prototype
	*/
	autoUpdate: true,
	startUpdate: true,
	operation: "read",
	/** First row of results */
	firstRow: 0,
	/** Optional starting source data */
	sourceData: null,
	/** Method by which data is filtered */
	matchMode: "start",
	/** Toggle for data sorting to ignore alphabetical case or not. */
	ignoreCase: false,
	/** Optional order by clause, example "asc: cityId, desc: city" */
	orderBy: "",

	/** LiveView or LiveTable from which this LiveVariable gets its field information; can use a liveView or liveTable */
	liveSource: null,  /* LiveSource is now deprecated; TODO: Hide liveSource unless its an old LIveVar already pointing to an app.liveview */

    refireOnDbChange: false,

	/** Maximum number of results to return */
	maxResults: 500,
	//designMaxResults: 50,
	/** Field in view to use as our root object / type */
	_rootField: "",
	destroy: function() {
		this._unsubscribeLiveView();
		this.inherited(arguments);
	},
	init: function() {
		this.inherited(arguments);
		this.filter = new wm.Variable({name: "filter", owner: this, type: this.type || "any" });
		this.sourceData = new wm.Variable({name: "sourceData", owner: this, type: this.type || "any" });
	    this.setupSubscriptions();
	    // default assumption is that its a list until we have some actual
	    // data to tell us otherwise
	    if (this.isList === undefined && this.operation == "read")
		this.isList = true;
	},
    setupSubscriptions: function() {
		this.subscribe(this.filter.getRuntimeId() + "-changed", this, "filterChanged");
		this.subscribe(this.sourceData.getRuntimeId() + "-changed", this, "sourceDataChanged");
    },
	postInit: function() {
	    this._inLVPostInit = true;
		this.inherited(arguments);
		// initialize via liveSource or optionally directly with a liveView)

	    /* if there is an existing liveView subcomponent, use it*/
	    if (this.$.liveView) {
		this.setLiveView(this.$.liveView);
	    }

	    /* DEPRECATED; if its old style and points to an app.liveView, use that liveview */
	    else if (this.liveSource && this.liveSource != "app") {
		this.setLiveSource(this.liveSource);
	    }

	    /* Else create a new LiveView */
	    else {
		this.setLiveView(this.liveView || this.createLiveView(this.type));
	    }
	    this._inPostInit = true;
	    this.doAutoUpdate();
	    this._inPostInit = false;
	    this._inLVPostInit = false;
	},
	_subscribeLiveView: function() {
		this._unsubscribeLiveView();
		if (this.liveView)
			this._liveViewSubscription = dojo.subscribe(this.liveView.getRuntimeId() + "-viewChanged", dojo.hitch(this, "_liveViewChanged"));
	},
	_unsubscribeLiveView: function() {
		dojo.unsubscribe(this._liveViewSubscription);
		this._liveViewSubscription = null;
	},
        /* Basically, is this a valid type for a LiveVariable; unless type is unset, should return true */
	isLiveType: function() {
		return wm.typeManager.getLiveService(this.type);
	},
	doAutoUpdate: function() {
		if (this.isLiveType())
			this.inherited(arguments);
	},
	filterChanged: function() {
	    if (this.autoUpdate) {
		if (djConfig.isDebug) this.log("autoUpdate");
		this.doAutoUpdate();
		if (djConfig.isDebug) this.endLog("autoUpdate");
	    }
	},
	sourceDataChanged: function() {
	    if (this.autoUpdate) {
		if (djConfig.isDebug) this.log("autoUpdate");
		this.doAutoUpdate();
		if (djConfig.isDebug) this.endLog("autoUpdate");
	    }
	},

	/** Set the filter used for read operations */
	setFilter: function(inFilter) {
		if ((inFilter || 0).type == this.type) {
			this.filter.setDataSet(inFilter);
		}
	},
	/** Set the orderBy property used for read operations */
	setOrderBy: function(inOrderBy) {
		this.orderBy = inOrderBy;
		this.doAutoUpdate();
	},
	/** Set the source data which is used for operations. */
	setSourceData: function(inSourceData) {
		var liveType = this.isLiveType();
	    // if no livetype, accept anything...
	    // if passing in a hash (no declaredClass) thats fine if we already have a type
	    // else if passing in a variable, its type should match our current type
	    if (!liveType || (this.type && inSourceData && !inSourceData.declaredClass) || (inSourceData || 0).type == this.type) {
			this.sourceData.setDataSet(inSourceData);
			if (!liveType) {
			    this._updating++;
			    /* Deprecated if clause */
			    if (inSourceData.liveView && inSourceData.liveView.getId().match(/^app\./)) {
				this.setLiveSource(this.sourceData.type);
			    } else {
				if (!this.liveView)
				    this.liveView = this.createLiveView();
				this.liveView.setDataType(inSourceData.liveView.dataType);
				this.liveView.related = dojo.clone(inSourceData.liveView.related);
				this.liveView.service = inSourceData.liveView.service;
				this.liveView.view = dojo.clone(inSourceData.liveView.view);
				this.setLiveView(this.liveView);
			    }
			    this._updating--;
			}
	    } else if (!inSourceData) {
		this.sourceData.setDataSet(null);
	    }
	},
	// ==========================================================
	// LiveView integration
	// ==========================================================
	/** Set the LiveView or LiveTable from which we will get data information */
	/* valid input: LiveView full id or LiveTable full name */
	    /* DEPRECATED */
	setLiveSource: function(inLiveSource) {
	    var s = this.liveSource = inLiveSource;
	    var v;
	    try {
            if (this._isDesignLoaded) {
                v = studio.application.getValueById(s);
            } else {
                v = app.getValueById(s);
            }
	    } catch(e) {}
	    if (!v)
		v = this.createLiveView(s);
	    if (v)
		this.setLiveView(v);
	    if (!this._inLVPostInit) {
		this.doAutoUpdate();
	    }
	},
		     /*
	setLiveSource: function(inLiveSource) {
	    studio.testThis = this;
	    var s =this.liveSource = inLiveSource;
	    var v;
	    if (this.getRoot().app)
		v = this.getRoot().app.getValueById(s);
	    if (!v)
		v = this.createLiveView(s);
	    if (v)
		this.setLiveView(v);
	    this.doAutoUpdate();
	},*/
	setLiveView: function(inLiveView) {
		this.clearData();
		this.liveView = inLiveView;
	    if (this._isDesignLoaded) {
		this._subscribeLiveView();
	    }
	    this.setType(this.getViewType());
	},
	createLiveView: function(inType) {
		return new wm.LiveView({
			name: "liveView",
			owner: this,
			dataType: inType,
			_defaultView: true
		});
	},
	setType: function(inType) {

	    var oldSourceType = this.sourceData.type + "|" + dojo.toJson(this.sourceData._dataSchema);
	    var oldFilterType = this.filter.type + "|" + dojo.toJson(this.filter._dataSchema);

	    this.inherited(arguments);
	    var hasChanged = this._hasChanged;

	    // until we have data, assume any read livevar is a list.
	    if (this.operation == "read" && wm.isEmpty(this.getData()))
		this.isList = true;

	    this.filter.setType(this.type);
	    this.sourceData.setType(this.type);

        if (this.liveView && this.liveView.owner == this && (this.liveView.dataType != this.type || hasChanged)) {
            this.liveView.setDataType(this.type);
            this.liveView.createDefaultView();
        }

	    // I've been seeing these bindings fire way too often, so
	    // some extra tests to insure its needed
	    var newSourceType = this.sourceData.type + "|" + dojo.toJson(this.sourceData._dataSchema);
	    var newFilterType = this.filter.type + "|" + dojo.toJson(this.filter._dataSchema);
	    if (!this._updating && !this._inLVPostInit && this.$.binding && (hasChanged || oldSourceType != newSourceType || oldFilterType != newFilterType)) {
    		this.$.binding.refresh();
        }
      	if (this.refireOnDbChange) {
    		if (this._updateOnDbSubscribe) {
    		    dojo.unsubscribe(this._updateOnDbSubscribe);
    		}
    		if (this.type) {
    		    this._updateOnDbSubscribe = this.subscribe(this.type + "-server-changed", this, "updateOnDbChange");
    		}
	    }
	},
	_liveViewChanged: function() {
		this.setType(this.liveView.dataType);
		if (this.isDesignLoaded())
			this.doAutoUpdate();
	},

	// ==========================================================
	// Server I/O
	// ==========================================================
/* Commented out in 6.4; sourceData no longer available when doing a read
	_getCanUpdate: function() {
		return this.inherited(arguments) &&
			!(this.operation == "read" && this._isSourceDataBound() && wm.isEmpty(this.sourceData.getData()) );
	},
	*/
	// FIXME: need to zot this
	operationChanged: function() {
	},
    updateOnDbChange: function(inComponent) {
	// If the component that changed is this component, we don't need to update
	if (inComponent === this) return;
	if (djConfig.isDebug) this.log("autoUpdate", "updateOnDbChange");
	this.update();
    },
	_update: function() {

		// note: runtime service only available when application is deployed
		// so must wait until here to set it.
		//The following lines for checking designTime flag are not being used now.  They may be used in the future to differenciate requests from
		//Studio from requests deployed application.
		if (this._designTime)
			this._service = wm.getRuntimeServiceDesignTime(this);
		else
			this._service = wm.getRuntimeService(this);
		//console.log(this.name, "update");
		return this.inherited(arguments);
	},
	getArgs: function() {
	    wm.getDataConvertDates = true;
		var
			d = this.sourceData.getData(true),
			t = this.sourceData.type || this.type,
			s = wm.typeManager.getService(this.type),
			args = [s, t, wm.isEmpty(d) ? null : d];
		if (this.operation == "read") {
			args = args.concat(this._getReadArguments());
		}
	    delete wm.getDataConvertDates;
		return args;
	},
    getDebugArgs: function() {
	if (this.operation == "read") {
	    return this.filter.getData();
	} else {
	    return this.sourceData.getData();
	}
    },
	_getReadArguments: function() {
		var
			props = {properties: this._getEagerProps(this), filters: this._getFilters(), matchMode: this.matchMode, ignoreCase: this.ignoreCase},
			paging = this.orderBy ? {orderBy: (this.orderBy || "").split(",")} : {},
			max = this.isDesignLoaded() ? this.designMaxResults : this.maxResults,
			results = max ? { maxResults: max, firstResult: this.firstRow } : {};
		dojo.mixin(paging, results);
		return [props, paging];
	},
	_getFilters: function() {
		return this._getFilterValues(this.filter.getData());
	},
	_getFilterValues: function(inData, inPrefix) {
		var f = [], d, p;
		for (var i in inData) {
			d = inData[i];
			p = (inPrefix ? (inPrefix ||"") + "." : "") + i;
			if (dojo.isObject(d) && d !== null)
				f = f.concat(this._getFilterValues(d, p));
			else if (p !== undefined && d !== undefined && d !== null)
				f.push(p + "=" + d);
		}
		return f;
	},
	_isSourceDataBound: function() {
		var wires = this.$.binding.wires, w;
		for (var i in wires) {
			w = wires[i];
			if ((w.targetProperty || "").indexOf("sourceData") == 0)
				return true;
		}
	},
	processResult: function(inResult) {
	    this.dataSetCount = this._service.fullResult ? this._service.fullResult.dataSetSize : 0;
	    if (this._appendData) {
    		inResult = this.data._list.concat(inResult);
    		delete this._appendData;
	    }
		this.inherited(arguments);
	        if (this.operation != "read") {
		    dojo.publish(this.type + "-server-changed", [this]);
		}
	},
	//===========================================================================
	// Paging
	//===========================================================================
	/** Return the current data page; only relevant when maxResults is set. */
	getPage: function() {
		return Math.floor(this.firstRow / (this.maxResults || 1));
	},
	/** Return the total number of data pages. */
	getTotalPages: function() {
		return Math.ceil((this.dataSetCount || 1) / (this.maxResults || 1));
	},
	/** Set and retrieve the current data page.
		@param {Number} inPageIndex the page number to set
	 */
	setPage: function(inPageIndex) {
		inPageIndex = Math.max(0, Math.min(this.getTotalPages()-1, inPageIndex));
		this.firstRow = inPageIndex * (this.maxResults || 0);
		this.update();
	},
	/** Set and retrieve the next page of data. */
	setNextPage: function() {
		this.setPage(this.getPage()+1);
	},
	/** Set and retrieve the previous page of data. */
	setPreviousPage: function() {
		this.setPage(this.getPage()-1);
	},
	/** Set and retrieve the first page of data. */
	setFirstPage: function() {
		this.setPage(0);
	},
	/** Set and retrieve the last page of data. */
	setLastPage: function() {
		this.setPage(this.getTotalPages()-1);
	}
});

