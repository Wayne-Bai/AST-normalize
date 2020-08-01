/**
 * Copyright (c) 2013-2014 Oculus Info Inc.
 * http://www.oculusinfo.com/
 *
 * Released under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
define(
	[
		'lib/interfaces/xfUIObject', 'lib/channels', 'lib/util/GUID', 'lib/util/xfUtil',
		'lib/models/xfCard', 'lib/models/xfSummaryCluster',
		'lib/models/xfClusterBase', 'lib/constants',
		'lib/extern/underscore'
	],
	function(
		xfUIObject, chan, guid, xfUtil,
		xfCard, xfSummaryCluster,
		xfClusterBase, constants
	) {

		//--------------------------------------------------------------------------------------------------------------
		// Private Variables
		//--------------------------------------------------------------------------------------------------------------

		var MODULE_NAME = 'xfImmutableCluster';

		//--------------------------------------------------------------------------------------------------------------
		// Public
		//--------------------------------------------------------------------------------------------------------------

		var xfImmutableCluster = {};

		//--------------------------------------------------------------------------------------------------------------

		xfImmutableCluster.createInstance = function(spec){

			//------------------
			// private variables
			//------------------

			var guidId = 'immutable_' + guid.generateGuid();

			var _UIObjectState = {
				xfId                : guidId,
				UIType              : MODULE_NAME,
				spec                : _.clone(spec),
				toolbarSpec         : xfClusterBase.getToolbarSpecTemplate(),
				children            : [],
				isExpanded          : false,
				isSelected          : false,
				isHighlighted       : false,
				isHovered			: false,
				isHidden			: false,
				showToolbar         : false,
				showDetails         : false,
				showSpinner         : false,
				links               : {}
			};
			_UIObjectState.spec.type = MODULE_NAME;

			//----------------
			// private methods
			//----------------

			var _createChildrenFromSpec = function(showSpinner, showToolbar) {

				for (var i = 0; i < _UIObjectState.children.length; i++) {
					_UIObjectState.children[i].dispose();
					_UIObjectState.children[i] = null;
				}
				_UIObjectState.children.length = 0;

				var length = _UIObjectState.spec.members ? _UIObjectState.spec.members.length : 0;
				for (i = 0; i < length; i++) {

					var childMemberSpec = _UIObjectState.spec.members[i];

					if (!childMemberSpec.accounttype) {
						childMemberSpec.accounttype = xfUtil.getAccountTypeFromDataId(childMemberSpec.dataId);
					}

					var uiObject = {};
					if (childMemberSpec.accounttype === constants.ACCOUNT_TYPES.ENTITY) {
						uiObject =  xfCard.createInstance(childMemberSpec);
					}
					else if (childMemberSpec.accounttype === constants.ACCOUNT_TYPES.CLUSTER_SUMMARY) {
						uiObject = xfSummaryCluster.createInstance(childMemberSpec);
					}
					else if (childMemberSpec.accounttype === constants.ACCOUNT_TYPES.ACCOUNT_OWNER ||
						childMemberSpec.accounttype === constants.ACCOUNT_TYPES.CLUSTER
					) {
						uiObject = xfImmutableCluster.createInstance(childMemberSpec);
					} else {
						aperture.log.error('Failed to determine UI object from account type');
					}

					uiObject.showDetails(_UIObjectState.showDetails);
					uiObject.showSpinner(showSpinner);

					uiObject.updateToolbar(
						_UIObjectState.toolbarSpec,
						true
					);

					uiObject.showToolbar(showToolbar);

					// Add the child to the cluster.
					uiObject.setParent(xfClusterInstance);
					_UIObjectState.children.push(uiObject);
				}
			};

			//----------------------------------------------------------------------------------------------------------

			var _updateChildrenFromSpec = function(showSpinner, showToolbar) {

				var newEntities = [];

				var i;
				var removeList = {};
				var addList = [];
				var dataId = null;

				for (i = 0; i < _UIObjectState.children.length; i++) {
					dataId = _UIObjectState.children[i].getDataId();
					if (removeList.hasOwnProperty(dataId)) {
						removeList[dataId].push(i);
					} else {
						removeList[dataId] = [i];
					}
				}

				for (i = 0; i < _UIObjectState.spec.members.length; i++) {
					var spec = _UIObjectState.spec.members[i];

					if (removeList.hasOwnProperty(spec.dataId)) {
						delete removeList[spec.dataId];
					} else {
						addList.push(spec);
					}
				}

				for (dataId in removeList) {
					if (removeList.hasOwnProperty(dataId)) {
						for (i = 0; i < removeList[dataId].length; i++) {
							var index = removeList[dataId][i];
							_UIObjectState.children[index].dispose();
							_UIObjectState.children.splice(index, 1);
						}
					}
				}

				for (i = 0; i < addList.length; i++) {

					var childMemberSpec = addList[i];

					if (!childMemberSpec.accounttype) {
						childMemberSpec.accounttype = xfUtil.getAccountTypeFromDataId(childMemberSpec.dataId);
					}

					var uiObject = {};
					if (childMemberSpec.accounttype === constants.ACCOUNT_TYPES.ENTITY) {
						uiObject =  xfCard.createInstance(childMemberSpec);
					}
					else if (childMemberSpec.accounttype === constants.ACCOUNT_TYPES.CLUSTER_SUMMARY) {
						uiObject = xfSummaryCluster.createInstance(childMemberSpec);
					}
					else if (childMemberSpec.accounttype === constants.ACCOUNT_TYPES.ACCOUNT_OWNER ||
						childMemberSpec.accounttype === constants.ACCOUNT_TYPES.CLUSTER
						) {
						uiObject = xfImmutableCluster.createInstance(childMemberSpec);
					} else {
						aperture.log.error('Failed to determine UI object from account type');
					}

					uiObject.showDetails(_UIObjectState.showDetails);
					uiObject.showSpinner(showSpinner);

					uiObject.updateToolbar(
						_UIObjectState.toolbarSpec,
						true
					);

					uiObject.showToolbar(showToolbar);

					// Add the child to the cluster.
					uiObject.setParent(xfClusterInstance);
					_UIObjectState.children.push(uiObject);

					newEntities.push(uiObject.getDataId());
				}

				return newEntities;
			};

			//---------------
			// public methods
			//---------------

			// create new object instance
			var xfClusterInstance = xfClusterBase.createInstance(_UIObjectState);

			// create child placeholder cards from spec
			_createChildrenFromSpec(true, false);

			//----------
			// Overrides
			//----------

			xfClusterInstance.clone = function() {

				// create cloned object
				var clonedObject = xfImmutableCluster.createInstance(_UIObjectState.spec);

				// add necessary UI state
				clonedObject.showDetails(_UIObjectState.showDetails);
				if (_UIObjectState.isExpanded) {
					clonedObject.expand();
				} else {
					clonedObject.collapse();
				}

				// make the cloned object an orphan
				clonedObject.setParent(null);

				// return cloned object
				return clonedObject;
			};

			//----------------------------------------------------------------------------------------------------------

			xfClusterInstance.removeChild = function(xfId, disposeObject, preserveLinks, removeIfEmpty) {
				var i, linkId=null, link;

				for (i = 0; i < _UIObjectState.children.length; i++) {
					if (_UIObjectState.children[i].getXfId() === xfId) {

						var links = [];
						if (preserveLinks) {
							links = _UIObjectState.children[i].getLinks();
						}

						// Update the in/out degree in the spec
						_UIObjectState.spec.inDegree -= _UIObjectState.children[i].getInDegree();
						_UIObjectState.spec.outDegree -= _UIObjectState.children[i].getOutDegree();

						_UIObjectState.spec.count -= _UIObjectState.children[i].getCount();

						_UIObjectState.children[i].setParent(null);

						if (disposeObject) {
							_UIObjectState.children[i].dispose();
							_UIObjectState.children[i] = null;

							for (linkId in links) {
								if (links.hasOwnProperty(linkId)) {
									link = links[linkId];
									if (link.getSource().getXfId() !== xfId) {
										link.getSource().addLink(link);
									} else if (link.getDestination().getXfId() !== xfId) {
										link.getDestination().addLink(link);
									}
								}
							}
						}

						_UIObjectState.children.splice(i, 1);
						_UIObjectState.spec.members.splice(i, 1);

						break;
					}
				}


				if (_UIObjectState.children.length === 0 &&
					removeIfEmpty
				) {
					aperture.pubsub.publish(
						chan.REMOVE_REQUEST,
						{
							xfIds : [_UIObjectState.xfId],
							dispose : true
						}
					);
				}
			};

			//----------------------------------------------------------------------------------------------------------

			xfClusterInstance.removeAllChildren = function() {
				if (_UIObjectState.children.length === 0) {
					return;
				}

				for (var i = 0; i < _UIObjectState.children.length; i++) {
					_UIObjectState.children[i].dispose();
					_UIObjectState.children[i] = null;
				}

				_UIObjectState.children.length = 0;
				_UIObjectState.spec.members.length = 0;
				_UIObjectState.spec.count = 0;

				// Update the in/out degree in the spec
				_UIObjectState.spec.inDegree = 0;
				_UIObjectState.spec.outDegree = 0;
			};

			//----------------------------------------------------------------------------------------------------------

			xfClusterInstance.insert = function(xfUIObj, beforeXfUIObj00) {
				var memberSpec = {};
				$.extend(true, memberSpec, xfUIObj.getVisualInfo().spec);
				memberSpec.parent = this;

				if (beforeXfUIObj00 == null) {
					_UIObjectState.children.push(xfUIObj);
					// Update the member spec list.
					_UIObjectState.spec.members.push(memberSpec);
				} else {
					var inserted = false;
					var childCount = _UIObjectState.children.length;
					for (var i = 0; i < childCount; i++) {
						if (_UIObjectState.children[i].getXfId() === beforeXfUIObj00.getXfId()) {
							_UIObjectState.children.splice(i, 0, xfUIObj);
							// Update the member spec list.
							_UIObjectState.spec.members.splice(i, 0, memberSpec);

							inserted = true;
							break;
						}
					}
					if (!inserted) {
						_UIObjectState.children.push(xfUIObj);
					}
				}

				// Update the in/out degree in the spec
				_UIObjectState.spec.inDegree += memberSpec.inDegree;
				_UIObjectState.spec.outDegree += memberSpec.outDegree;
				_UIObjectState.spec.count += (memberSpec.count) ? memberSpec.count : 1;

				xfUIObj.setParent(this);

				// we set the children's toolbar state base on our toolbar state.
				xfUIObj.updateToolbar(_UIObjectState.toolbarSpec);
			};

			//----------------------------------------------------------------------------------------------------------

			xfClusterInstance.update = function(spec) {

				for (var key in spec) {
					if (spec.hasOwnProperty(key)) {
						_UIObjectState.spec[key] = spec[key];
					}
				}

				return _updateChildrenFromSpec(false, true);
			};

			//----------------------------------------------------------------------------------------------------------

			xfClusterInstance.restoreVisualState = function(state) {

				this.cleanState();

				_UIObjectState.xfId = state.xfId;
				_UIObjectState.UIType = state.UIType;

				_UIObjectState.isExpanded = state.isExpanded;
				_UIObjectState.isSelected = state.isSelected;
				_UIObjectState.isHighlighted = state.isHighlighted;
				_UIObjectState.showToolbar = state.showToolbar;
				_UIObjectState.showDetails = state.showDetails;
				_UIObjectState.toolbarSpec = state.toolbarSpec;

				_UIObjectState.spec.dataId = state.spec.dataId;
				_UIObjectState.spec.type = state.spec.type;
				_UIObjectState.spec.accounttype = state.spec.accounttype;
				_UIObjectState.spec.count = state.spec.count;
				_UIObjectState.spec.icons = state.spec.icons;
				_UIObjectState.spec.graphUrl = state.spec.graphUrl;
				_UIObjectState.spec.duplicateCount = state.spec.duplicateCount;
				_UIObjectState.spec.label = state.spec.label;
				_UIObjectState.spec.confidenceInSrc = state.spec.confidenceInSrc;
				_UIObjectState.spec.confidenceInAge = state.spec.confidenceInAge;
				_UIObjectState.spec.flow = state.spec.flow;
				_UIObjectState.spec.inDegree = state.spec.inDegree;
				_UIObjectState.spec.outDegree = state.spec.outDegree;

				_UIObjectState.children = [];
				var childCount = state.children ? state.children.length : 0;
				var cardSpec, cardUIObj;
				var clusterSpec, clusterUIObj;
				for (var i = 0; i < childCount; i++) {
					if (state.children[i].UIType === constants.MODULE_NAMES.ENTITY) {
						cardSpec = xfCard.getSpecTemplate();
						cardUIObj = xfCard.createInstance(cardSpec);
						cardUIObj.cleanState();
						cardUIObj.restoreVisualState(state.children[i]);
						this._restoreObjectToCluster(cardUIObj);
					} else if (state.children[i].UIType === constants.MODULE_NAMES.IMMUTABLE_CLUSTER) {
						clusterSpec = xfImmutableCluster.getSpecTemplate();
						clusterUIObj = xfImmutableCluster.createInstance(clusterSpec);
						clusterUIObj.cleanState();
						clusterUIObj.restoreVisualState(state.children[i]);
						this._restoreObjectToCluster(clusterUIObj);
					} else if (state.children[i].UIType === constants.MODULE_NAMES.SUMMARY_CLUSTER) {
						clusterSpec = xfSummaryCluster.getSpecTemplate();
						clusterUIObj = xfSummaryCluster.createInstance(clusterSpec);
						clusterUIObj.cleanState();
						clusterUIObj.restoreVisualState(state.children[i]);
						this._restoreObjectToCluster(clusterUIObj);
					} else {
						aperture.log.error(
								'cluster children should only be of type ' +
								constants.MODULE_NAMES.ENTITY + ', ' +
								constants.MODULE_NAMES.SUMMARY_CLUSTER + ' or ' +
								constants.MODULE_NAMES.MUTABLE_CLUSTER + '.'
						);					}
				}
			};

			//----------------------------------------------------------------------------------------------------------

			xfClusterInstance._restoreObjectToCluster = function(object) {

				var memberSpec = _.clone(object.getVisualInfo().spec);
				memberSpec.parent = this;

				_UIObjectState.children.push(object);
				_UIObjectState.spec.members.push(memberSpec);

				object.setParent(this);
			};

			//----------------------------------------------------------------------------------------------------------

			return xfClusterInstance;
		};

		//--------------------------------------------------------------------------------------------------------------

		xfImmutableCluster.getSpecTemplate = function() {
			var spec = xfClusterBase.getSpecTemplate();
			spec.type = MODULE_NAME;
			return spec;
		};

		//--------------------------------------------------------------------------------------------------------------

		xfImmutableCluster.getModuleName = function() {
			return MODULE_NAME;
		};

		//--------------------------------------------------------------------------------------------------------------

		return xfImmutableCluster;
	}
);
