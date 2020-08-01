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
define(['lib/module', 'lib/channels', 'lib/render/cardRenderer',
	'lib/render/clusterRenderer', 'lib/render/fileRenderer', 'lib/render/matchRenderer','lib/render/columnRenderer',
	'lib/render/workspaceRenderer', 'lib/render/toolbarRenderer', 'lib/layout/xfLayoutProvider', 'modules/xfWorkspace', 'lib/util/GUID'],
	function(modules, chan, cardRenderer, clusterRenderer, fileRenderer, matchRenderer, columnRenderer,
			workspaceRenderer, toolbarRenderer, xfLayoutProvider, xfWorkspace, GUID) {

		var DROP_TOLERANCE = 25;        // Must be < DROP_TOLERANCE pixels away to activate drop target

		var _renderState = {
			subscriberTokens : null,
			canvas : null,
			workspaceHeight : 0,
			workspaceWidth : 0,
			verticalDropTargets : [],
			activeDropTarget : null
		};

		var _dropFunction = function(event, ui) {
			var ibreak = 0;
			ibreak++;
		};

		var render = function(eventChannel, data) {

			// Select the closest drop target (if any)
			var mouseOffset = data.mouseOffset;
			var closestDropTarget = null;
			var minDistance = Number.POSITIVE_INFINITY;
			for (var i = 0; i < _renderState.verticalDropTargets.length; i++) {
				var dropTarget = _renderState.verticalDropTargets[i];
				var offset = dropTarget.element.offset();
				var horizDist = Math.abs(offset.left - mouseOffset.left);
				if (horizDist < minDistance && horizDist < DROP_TOLERANCE) {
					minDistance = horizDist;
					closestDropTarget = dropTarget;
				}
			}
			// If it's the same target, just return
			if (closestDropTarget == _renderState.activeDropTarget) {
				return;
			}

			// Fade it in
			if ( closestDropTarget ) {
				closestDropTarget.element.animate({
					opacity:1
				},150);
				closestDropTarget.element.droppable('enable');
			} else {
				if (_renderState.activeDropTarget) {
					_renderState.activeDropTarget.element.animate({
						opacity:0
					},150);
					_renderState.activeDropTarget.element.droppable('disable');
				}
			}
			_renderState.activeDropTarget = closestDropTarget;
		};

		var _createDropTargetObject = function(element, columnUIObject, insertDirection) {
			return {
				element : element,
				columnUIObject : columnUIObject,
				insertDirection : insertDirection
			};
		};

		var _addAllDropTargets = function() {
			// get the min/max column
			var minColumnObject = null;
			var maxColumnObject = null;
			var minIdx = Number.MAX_VALUE;
			var maxIdx = -Number.MAX_VALUE;
			var workspaceColumns = xfWorkspace.getChildren();
			for (var i = 0; i < workspaceColumns.length; i++) {
				var colIdx = xfWorkspace.getColumnIndex(workspaceColumns[i]);
				if (colIdx > maxIdx) {
					maxIdx = colIdx;
					maxColumnObject = workspaceColumns[i];
				}
				if (colIdx < minIdx) {
					minIdx = colIdx;
					minColumnObject = workspaceColumns[i];
				}
			}

			var positionMap = xfLayoutProvider.getPositionMap();

			// Add a drop target to left of min and right of max column
			var leftDropTargetElement = $('<div></div>');
			var leftDropTargetLeft = positionMap[minColumnObject.getXfId()].left - 5;
			var leftDropTargetTop = positionMap[minColumnObject.getXfId()].top;
			leftDropTargetElement.addClass('verticalFileDropTarget');
			leftDropTargetElement.css('left',leftDropTargetLeft);
			leftDropTargetElement.css('top',leftDropTargetTop);
			leftDropTargetElement.css('height', _renderState.workspaceHeight - 20);
			leftDropTargetElement.css('opacity',0);
			leftDropTargetElement.droppable({
				drop: _dropFunction,
				tolerance: 'touch'
			});
			leftDropTargetElement.droppable('disable');

			var rightDropTargetElement = $('<div></div>');
			var rightDropTargetLeft = positionMap[maxColumnObject.getXfId()].left + 5 + matchRenderer.getRenderDefaults().MATCHCARD_WIDTH;
			var rightDropTargetTop = positionMap[maxColumnObject.getXfId()].top;
			rightDropTargetElement.addClass('verticalFileDropTarget');
			rightDropTargetElement.css('left', rightDropTargetLeft);
			rightDropTargetElement.css('top', rightDropTargetTop);
			rightDropTargetElement.css('height', _renderState.workspaceHeight - 20);
			rightDropTargetElement.css('opacity',0);
			rightDropTargetElement.droppable({
				drop: _dropFunction,
				tolerance: 'touch'
			});
			rightDropTargetElement.droppable('disable');

			_renderState.canvas.append(leftDropTargetElement);
			_renderState.canvas.append(rightDropTargetElement);

			// Create drop target objects
			_renderState.verticalDropTargets.push(_createDropTargetObject(leftDropTargetElement, minColumnObject, 'left'));
			_renderState.verticalDropTargets.push(_createDropTargetObject(rightDropTargetElement, maxColumnObject, 'right'));

		};

		//--------------------------------------------------------------------------------------------------------------
		var _onAddDropTargets = function(eventChannel, data) {

			// create a canvas to overlay the original workspace
			_renderState.workspaceWidth = $('.workspace').width();
			_renderState.workspaceHeight = $('.workspace').height();

			_renderState.canvas.width( _renderState.workspaceWidth);
			_renderState.canvas.height(_renderState.workspaceHeight);
			_renderState.canvas.css('opacity',0);

			// Add all the drop targets and hide them
			_addAllDropTargets();

			_renderState.canvas.animate({
				opacity:1
			},150);
		};

		//--------------------------------------------------------------------------------------------------------------
		var _onRemoveDropTargets = function(eventChannel, data) {
			_renderState.canvas.animate({
				opacity:0
			},150, function(){
				_renderState.canvas.empty();
			});
		};

		var _initializeModule = function(eventChannel, data) {
			_renderState.canvas = $('#drop-target-canvas');
		};


		var rendererConstructor = function(sandbox){
			return {
				render : render,
				start : function(){
					var subTokens = {};
					// Subscribe to the appropriate calls.
					subTokens[chan.ADD_DROP_TARGETS] = aperture.pubsub.subscribe(chan.ADD_DROP_TARGETS, _onAddDropTargets);
					subTokens[chan.REMOVE_DROP_TARGETS] = aperture.pubsub.subscribe(chan.REMOVE_DROP_TARGETS, _onRemoveDropTargets);
					subTokens[chan.UPDATE_DROP_TARGETS] = aperture.pubsub.subscribe(chan.UPDATE_DROP_TARGETS, render);
					subTokens[chan.ALL_MODULES_STARTED] = aperture.pubsub.subscribe(chan.ALL_MODULES_STARTED, _initializeModule);
					_renderState.subscriberTokens = subTokens;
				},
				end : function(){
					for (var token in _renderState.subscriberTokens) {
						if (_renderState.subscriberTokens.hasOwnProperty(token)) {
							aperture.pubsub.unsubscribe(_renderState.subscriberTokens[token]);
						}
					}
				}
			};
		};

		// Register the module with the system
		modules.register('xfDropTargetRenderer', rendererConstructor);
		return {
		};
	}
);
