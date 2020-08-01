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
define(['lib/module', 'lib/channels', 'lib/util/duration', 'lib/util/xfUtil'],
	function(modules, chan, duration, xfUtil) {

		//--------------------------------------------------------------------------------------------------------------
		// Private Variables
		//--------------------------------------------------------------------------------------------------------------

		var MODULE_NAME = 'xfHeader';
		var DEFAULT_MAX_LOCAL_DATE = xfUtil.dayAfter(new Date());
		
		var _dateMax = xfUtil.utcShiftedDate(DEFAULT_MAX_LOCAL_DATE).getTime();
		var _dateMin = xfUtil.utcShiftedDate(
				duration.subtractFromDate('P16Y', DEFAULT_MAX_LOCAL_DATE)).getTime();
		
		var _UIObjectState = {
			UIType : MODULE_NAME,
			sandbox : undefined,
			startDate : new Date(),
			endDate : new Date(2013,0,1),
			showDetails : true,
			duration : '',
			rangepx : 1,
			addLeft : 1,
			subscriberTokens : null,
			enablePatternSearch : false
		};

		var bucketsForDuration = (
			function() {
				var buckets = {
					'P14D': 14, // days
					'P30D': 15,
					'P60D': 15,
					'P112D': 16, // weeks
					'P224D': 16,
					'P1Y': 12, // months
					'P16M': 16, // months
					'P2Y': 12,
					'P32M': 16,
					'P4Y': 16, // quarters
					'P8Y': 16,
					'P16Y': 16 // years
				};

				return function(duration) {
					return buckets[duration];
				};
			}
		)();

		function _updateFromLocalShiftedDates(start, end) {
			_UIObjectState.startDate = xfUtil.utcShiftedDate(start);
			_UIObjectState.endDate = xfUtil.utcShiftedDate(end);
		}
		
		//--------------------------------------------------------------------------------------------------------------
		// Private Methods
		//--------------------------------------------------------------------------------------------------------------

		var _initializeDetails = function() {

			var headerDiv = $('#header');

			var displayDiv = $('<div></div>');
			displayDiv.attr('id', 'display');
			headerDiv.append(displayDiv);

			
			var displayButton = $('<button></button>');
			displayButton.attr('id', 'display-button');
			displayButton.addClass('nocapture influent-menu-button');
			displayButton.html('View');
			displayDiv.append(displayButton);

			var displayOptions = $('<ul></ul>');
			displayOptions.addClass('nocapture influent-menu-options');
			displayDiv.append(displayOptions);

			var entitiesOption = $('<li></li>');
			var entitiesHref = $('<a></a>');
			entitiesHref.attr('id', 'display-entities');
			entitiesHref.attr('href', '#');
			var entitiesIcon = $('<span></span>');
			entitiesIcon.addClass('ui-icon display-entity');
			entitiesHref.append(entitiesIcon);
			entitiesHref.append($(document.createTextNode('Account Holders')));
			entitiesOption.append(entitiesHref);
			xfUtil.makeTooltip(entitiesOption, 'view cards without activity charts');
			displayOptions.append(entitiesOption);

			var chartsOption = $('<li></li>');
			var chartsHref = $('<a></a>');
			chartsHref.attr('id', 'display-charts');
			chartsHref.attr('href', '#');
			var chartsIcon = $('<span></span>');
			chartsIcon.addClass('ui-icon display-chart');
			chartsHref.append(chartsIcon);
			chartsHref.append($(document.createTextNode('Account Activity')));
			chartsOption.append(chartsHref);
			xfUtil.makeTooltip(chartsOption, 'view cards with activity charts');
			displayOptions.append(chartsOption);


			
			if (aperture.config.get()['influent.config']['usePatternSearch']) {
				var searchCurrent = $('<li id="pattern-search-item"></li>')
					.append($('<a href="#"><span class="ui-icon pattern-search-icon"/>Find Patterns Like This</a>')
						.click(
							function (e) {
								if (_UIObjectState.enablePatternSearch) {
									aperture.pubsub.publish(chan.PATTERN_SEARCH_REQUEST);
								}
								e.preventDefault();
							}
						).mouseenter(
							function(e) {
								aperture.pubsub.publish(chan.HIGHLIGHT_SEARCH_ARGUMENTS, {
									xfId : null,
									isHighlighted : true
								});
                                aperture.pubsub.publish(chan.HOVER_START_EVENT, { element : e.target.title });
                                aperture.pubsub.publish(chan.TOOLTIP_START_EVENT, { element : e.target.title });
								return false;
							}
						).mouseleave(
							function(e) {
								aperture.pubsub.publish(chan.HIGHLIGHT_SEARCH_ARGUMENTS, {
									xfId : null,
									isHighlighted : false
								});
                                aperture.pubsub.publish(chan.HOVER_END_EVENT, { element : e.target.title });
                                aperture.pubsub.publish(chan.TOOLTIP_END_EVENT, { element : e.target.title });
								return false;
							}
						).attr('title', 'Search for similar patterns of activity')
                );
				
				var searchButton = $('<button></button>')
					.addClass('nocapture influent-menu-button')
					.html('Patterns')
					.appendTo(displayDiv);
				
				var searchOptions = $('<ul></ul>')
					.addClass('nocapture influent-menu-options')
					.appendTo(displayDiv)
					.append(searchCurrent);

				
				searchOptions.menu();
				searchButton.button({icons: {secondary: 'ui-icon-triangle-1-s'}}).click(
					function() {
						$('.influent-menu-options').hide();

						var menu = searchOptions.show().position(
							{
								my: 'right top',
								at: 'right bottom',
								of: this
							}
						);

						_updatePatternSearchUI();
						
						$(document).one(
							'click',
							function() {
								menu.hide();
							}
						);

						return false;
					}
				);				
			}
			
			
			var exportButton = $('<button></button>');
			exportButton.addClass('nocapture influent-menu-button');
			exportButton.html('Workspace');
			displayDiv.append(exportButton);

			var exportOptions = $('<ul></ul>');
			exportOptions.addClass('nocapture influent-menu-options');
			displayDiv.append(exportOptions);

			var newWorkspaceOption = $('<li></li>');
			var newWorkspaceHref = $('<a></a>');
			newWorkspaceHref.attr('id', 'new-workspace');
			newWorkspaceHref.attr('href', '#');
			var newWorkspaceIcon = $('<span></span>');
			newWorkspaceIcon.addClass('ui-icon new-chart-icon');
			newWorkspaceHref.append(newWorkspaceIcon);
			newWorkspaceHref.append($(document.createTextNode('New Workspace')));
			newWorkspaceOption.append(newWorkspaceHref);
			xfUtil.makeTooltip(newWorkspaceOption, 'open a blank workspace in a new tab');
			exportOptions.append(newWorkspaceOption);

			var importXMLOption = $('<li></li>');
			var importXMLHref = $('<a></a>');
			importXMLHref.attr('id', 'import-notebook');
			importXMLHref.attr('href', '#');
			var importXMLIcon = $('<span></span>');
			importXMLIcon.addClass('ui-icon import-xml-icon');
			importXMLHref.append(importXMLIcon);
			importXMLHref.append($(document.createTextNode('Import Chart...')));
			importXMLOption.append(importXMLHref);
			xfUtil.makeTooltip(importXMLOption, 'import chart of filed workspace');
			importXMLOption.addClass('last-menu-group-item');
			exportOptions.append(importXMLOption);


			var exportXMLOption = $('<li></li>');
			var exportXMLHref = $('<a></a>');
			exportXMLHref.attr('id', 'export-notebook');
			exportXMLHref.attr('href', '#');
			var exportXMLIcon = $('<span></span>');
			exportXMLIcon.addClass('ui-icon export-xml-icon');
			exportXMLHref.append(exportXMLIcon);
			exportXMLHref.append($(document.createTextNode('Export Chart')));
			exportXMLOption.append(exportXMLHref);
			xfUtil.makeTooltip(exportXMLOption, 'export chart of filed workspace');
			exportOptions.append(exportXMLOption);

			var exportCaptureHref = null;
			var INCLUDE_CAPTURE = aperture.config.get()['influent.config']['includeCaptureMenuItem'] !== false;
			if (INCLUDE_CAPTURE) {
				var exportCaptureOption = $('<li></li>');
				exportCaptureHref = $('<a></a>');
				exportCaptureHref.attr('id', 'export-capture');
				exportCaptureHref.attr('href', '#');
				var exportCaptureIcon = $('<span></span>');
				exportCaptureIcon.addClass('ui-icon export-capture-icon');
				exportCaptureHref.append(exportCaptureIcon);
				exportCaptureHref.append($(document.createTextNode('Export Image')));
				exportCaptureOption.append(exportCaptureHref);
				xfUtil.makeTooltip(exportCaptureOption, 'export an image of the workspace');
				exportCaptureOption.addClass('last-menu-group-item');
				exportOptions.append(exportCaptureOption);
			}

			var helplink = aperture.config.get()['influent.config']['help'];
			var USE_AUTH = aperture.config.get()['influent.config']['useAuth'] || false;
			
			if (helplink) {
				var helpOption = $('<li></li>');
				var helpHref = $('<a></a>');
				helpHref.attr('id', 'logout');
				helpHref.attr('href', helplink);
				helpHref.attr('target', '_blank');
				var helpIcon = $('<span></span>');
				helpIcon.addClass('ui-icon logout-icon');
				helpHref.append(helpIcon);
				helpHref.append($(document.createTextNode('Help')));
				helpOption.append(helpHref);
                xfUtil.makeTooltip(helpOption, 'open help documentation');
				exportOptions.append(helpOption);
				
				if (USE_AUTH) {
					helpOption.addClass('last-menu-group-item');
				}
				
				helpHref.click(
					function (e) {
                        aperture.pubsub.publish(chan.OPEN_EXTERNAL_LINK_REQUEST, {
                            link : helplink
                        });
                        e.preventDefault();
					}
				);
			}
			
			if (USE_AUTH) {
				var logoutOption = $('<li></li>');
				var logoutHref = $('<a></a>');
				logoutHref.attr('id', 'logout');
				logoutHref.attr('href', '#');
				var logoutIcon = $('<span></span>');
				logoutIcon.addClass('ui-icon logout-icon');
				logoutHref.append(logoutIcon);
				logoutHref.append($(document.createTextNode('Logout')));
				logoutOption.append(logoutHref);
				exportOptions.append(logoutOption);

				logoutHref.click(
					function (e) {
						aperture.pubsub.publish(chan.LOGOUT_REQUEST);
						e.preventDefault();
					}
				);
			}

			
			
			var filterContainerDiv = $('<div></div>');
			filterContainerDiv.attr('id', 'filter-container');
			headerDiv.append(filterContainerDiv);

			var filterDiv = $('<div></div>');
			filterDiv.attr('id', 'filter');
			filterContainerDiv.append(filterDiv);

			var titleSpan = $('<span></span>');
			titleSpan.addClass('title');
			titleSpan.html('Transaction Flow:');
			filterDiv.append(titleSpan);

			var intervalSelect = $('<select></select>');
			intervalSelect.attr('id', 'interval');
			filterDiv.append(intervalSelect);

			var datePickerFrom = $('<input/>');
			datePickerFrom.attr('type', 'text');
			datePickerFrom.attr('id', 'datepickerfrom');
			datePickerFrom.addClass('dateinput dateinputfrom');
			filterDiv.append(datePickerFrom);

			var datePickerLabel = $('<label></label>');
			datePickerLabel.attr('for', 'datepickerto');
			datePickerLabel.addClass('datelabel');
			datePickerLabel.html('to');
			filterDiv.append(datePickerLabel);

			var datePickerTo = $('<input/>');
			datePickerTo.attr('type', 'text');
			datePickerTo.attr('id', 'datepickerto');
			datePickerTo.addClass('dateinput dateinputto');
			filterDiv.append(datePickerTo);

			var flowImage = $('<img>');
			flowImage.attr('src', 'img/flow.png');
			flowImage.attr('id', 'flow-cue');
			flowImage.attr('alt', '');
			filterDiv.append(flowImage);

			var dateButton = $('<button></button>');
			dateButton.attr('id', 'applydates');
            xfUtil.makeTooltip(dateButton, 'apply date range to workspace');
			dateButton.css('display', 'none');
			dateButton.text('Apply');
			filterDiv.append(dateButton);

			// create the display menu
			displayOptions.menu();

			displayButton.button().click(
				function() {
					$('.influent-menu-options').hide();

					var menu = displayOptions.show().position(
						{
							my: 'right top',
							at: 'right bottom',
							of: this
						}
					);

					$(document).one(
						'click',
						function() {
							menu.hide();
						}
					);

					return false;
				}
			);

			chartsHref.click(
				function (e) {
					e.preventDefault();

					var showDetails = true;
					aperture.pubsub.publish(chan.DETAILS_CHANGE_REQUEST, {showDetails : showDetails});
				}
			);

			entitiesHref.click(
				function (e) {
					e.preventDefault();

					var showDetails = false;
					aperture.pubsub.publish(chan.DETAILS_CHANGE_REQUEST, {showDetails : showDetails});
				}
			);

			// create the display menu
			exportOptions.menu();

			exportButton.button({icons: {secondary: 'ui-icon-triangle-1-s'}}).click(
				function() {
					$('.influent-menu-options').hide();

					var menu = exportOptions.show().position(
						{
							my: 'right top',
							at: 'right bottom',
							of: this
						}
					);

					$(document).one(
						'click',
						function() {
							menu.hide();
						}
					);

					return false;
				}
			);

			if (INCLUDE_CAPTURE) {
				exportCaptureHref.click(
					function (e) {
						e.preventDefault();
						aperture.pubsub.publish(chan.EXPORT_CAPTURED_IMAGE_REQUEST);
					}
				);
			}

			exportXMLHref.click(
				function (e) {
					e.preventDefault();
					aperture.pubsub.publish(chan.EXPORT_GRAPH_REQUEST);
				}
			);

			importXMLHref.click(
					function (e) {
						e.preventDefault();
						aperture.pubsub.publish(chan.IMPORT_GRAPH_REQUEST);
					}
				);

			newWorkspaceHref.click(
				function (e) {
					aperture.pubsub.publish(chan.NEW_WORKSPACE_REQUEST);
					e.preventDefault();
				}
			);
			
			_updateDetails(null, {showDetails: _UIObjectState.showDetails});
		};

		//--------------------------------------------------------------------------------------------------------------

		var sendFilterChangeRequest = function() {
			aperture.pubsub.publish(
				chan.FILTER_CHANGE_REQUEST,
				{
					startDate: _UIObjectState.startDate,
					endDate: _UIObjectState.endDate,
					duration: _UIObjectState.duration,
					numBuckets: _UIObjectState.numBuckets
				}
			);
		};

		//--------------------------------------------------------------------------------------------------------------


		var _initializeFilter = function() {

			var intervalSelect = $('#interval');
			var dateRangeIntervals = aperture.config.get()['influent.config'].dateRangeIntervals;
			for (var dateRangeKey in dateRangeIntervals) {
				if (dateRangeIntervals.hasOwnProperty(dateRangeKey)) {
					intervalSelect.append('<option value="' + dateRangeKey + '">' + dateRangeIntervals[dateRangeKey] + '</option>');
				}
			}

			// Initialize the date dropdown from the config if it's present
			var initialDateKey = aperture.config.get()['influent.config']['startingDateRange'];
			if (initialDateKey) {
				_setIntervalSelector(initialDateKey);
			} else {
				intervalSelect.get(0).selectedIndex = 0;
			}



			$('#datepickerfrom').datepicker({
				changeMonth: true,
				changeYear: true,
				showAnim: 'fadeIn',
				duration: 'fast',
				onSelect: function() {
					var localStart = new Date($(this).val());
					var localEnd = duration.addToDate(_UIObjectState.duration, localStart);

					_updateFromLocalShiftedDates(localStart, localEnd);

					// unhide apply button
					$('#applydates').css('display', '');

                    aperture.pubsub.publish(
                        chan.FILTER_CHANGE_EVENT,
                        {
                            startDate: _UIObjectState.startDate,
                            endDate: _UIObjectState.endDate,
                            duration: _UIObjectState.duration,
                            numBuckets: _UIObjectState.numBuckets,
                            userRequested: true
                        }
                    );
				},
				beforeShowDay: function(date) {
					// validation fn for dates, return valid (bool), css classname
					return [!_UIObjectState.duration || duration.isDateValidForDuration(date, _UIObjectState.duration), ''];
				}
			});

			$('#datepickerto').datepicker({
				changeMonth: true,
				changeYear: true,
				showAnim: 'fadeIn',
				duration: 'fast',
				onSelect: function() {
					var localEnd = xfUtil.dayAfter(new Date($(this).val()));
					var localStart = duration.subtractFromDate(_UIObjectState.duration, localEnd);

					_updateFromLocalShiftedDates(localStart, localEnd);

					// unhide apply button
					$('#applydates').css('display', '');

                    aperture.pubsub.publish(
                        chan.FILTER_CHANGE_EVENT,
                        {
                            startDate: _UIObjectState.startDate,
                            endDate: _UIObjectState.endDate,
                            duration: _UIObjectState.duration,
                            numBuckets: _UIObjectState.numBuckets,
                            userRequested: true
                        }
                    );
				},
				beforeShowDay: function(date) {
					// validation fn for dates, return valid (bool), css classname
					return [!_UIObjectState.duration || duration.isDateValidForDuration(xfUtil.dayAfter(date), _UIObjectState.duration), ''];
				}
			});

			$('.dateinput').datepicker('option', 'dateFormat', 'M d, yy');

			var applyDates = $('#applydates');
			applyDates.button().click(function() {
				sendFilterChangeRequest();
				$('#applydates').css('display', 'none');
			});

			intervalSelect.change(function(e) {
				_UIObjectState.duration = $('#interval').val();

				var localEnd = xfUtil.localShiftedDate(_UIObjectState.endDate);
				localEnd = duration.roundDateByDuration(localEnd, _UIObjectState.duration);
				var localStart = duration.subtractFromDate(_UIObjectState.duration, localEnd);
				_updateFromLocalShiftedDates(localStart, localEnd);
				_UIObjectState.numBuckets = bucketsForDuration(_UIObjectState.duration);

				// unhide apply button
				$('#applydates').css('display', '');

                aperture.pubsub.publish(
                    chan.FILTER_CHANGE_EVENT,
                    {
                        startDate: _UIObjectState.startDate,
                        endDate: _UIObjectState.endDate,
                        duration: _UIObjectState.duration,
                        numBuckets: _UIObjectState.numBuckets,
                        userRequested: true
                    }
                );
			});

			applyDates.css('display', 'none');
		};

		//--------------------------------------------------------------------------------------------------------------

		var _adjustRangeBar = function () {
			var filterDiv = $('#filter');

			// need lazy initialization of the date range bar to prevent layout race conditions

			if(filterDiv.find('#daterangeback').length === 0) {
				var backDiv = $('<div></div>');
				backDiv.attr('id', 'daterangeback');
				backDiv.addClass('dateRangeBackground');
				filterDiv.append(backDiv);

				_UIObjectState.rangepx = $('#daterangeback').width();
			}

			if(filterDiv.find('#daterangefront').length === 0) {
				var frontDiv = $('<div></div>');
				frontDiv.attr('id', 'daterangefront');
				frontDiv.addClass('dateRangeForeground');
				filterDiv.append(frontDiv);

				_UIObjectState.addLeft = $('#daterangefront').position().left;
			}

			/*
			 * We map X in [A,B] --> Y in [C,D] then subtract to get width
			 * Y = (X-A)/(B-A)*(D-C), (B-A) != 0
			 * Then add div offset
			 */

			if (_dateMax - _dateMin > 0) {
				var offsetLeft = (_UIObjectState.startDate.getTime()-_dateMin)/(_dateMax-_dateMin)*_UIObjectState.rangepx;
				var offsetRight = (_UIObjectState.endDate.getTime()-_dateMin)/(_dateMax-_dateMin)*_UIObjectState.rangepx;
				var barWidth = offsetRight-offsetLeft;

				offsetLeft += _UIObjectState.addLeft;
				$('#daterangefront').animate({left: offsetLeft, width: barWidth}, 300);
			}
		};

		//--------------------------------------------------------------------------------------------------------------

		var _setIntervalSelector = function(dateKey) {
			var intervalSelect = $('#interval');

			var options = intervalSelect.children();
			for (var i = 0; i < options.length; i++) {
				if (options[i].value === dateKey) {
					intervalSelect.get(0).selectedIndex = i;
					break;
				}
			}
			if (i === options.length) {
				intervalSelect.get(0).selectedIndex = 0;
			}
		};

		//--------------------------------------------------------------------------------------------------------------

		var _updateDetails = function(chan, data) {
			_UIObjectState.showDetails = data.showDetails;

			$('#display-button').button(
				'option',
				'icons',
				{
					primary: data.showDetails ? 'display-chart' : 'display-entity',
					secondary: 'ui-icon-triangle-1-s'
				}
			);
		};

		//--------------------------------------------------------------------------------------------------------------
		function _updatePatternSearchUI() {
			var menuItem = $('#pattern-search-item');
			
			if (menuItem.length !== 0) {
				var hasClass = menuItem.hasClass('ui-state-disabled');
				
				if (_UIObjectState.enablePatternSearch) {
					if (hasClass) {
						menuItem.removeClass('ui-state-disabled');
					}
				} else if (!hasClass) {
					menuItem.addClass('ui-state-disabled');
				}
			}
		}
		//--------------------------------------------------------------------------------------------------------------
		function _updatePatternSearch(chan, data) {
			_UIObjectState.enablePatternSearch = data.graphSearchActive;

			_updatePatternSearchUI();
		}
		
		//--------------------------------------------------------------------------------------------------------------

		var _updateFilter = function (chan, data) {

			_UIObjectState.startDate = data.startDate;
			_UIObjectState.endDate = data.endDate;
			_UIObjectState.duration = data.duration;
			_UIObjectState.numBuckets = bucketsForDuration(data.duration);

			var localStart = xfUtil.localShiftedDate(data.startDate);
			var localEnd = xfUtil.localShiftedDate(data.endDate);
			
			$('#datepickerfrom').datepicker('setDate', localStart);
			$('#datepickerto').datepicker('setDate', xfUtil.dayBefore(localEnd));
			_setIntervalSelector(_UIObjectState.duration);
			_adjustRangeBar();
		};

		//--------------------------------------------------------------------------------------------------------------

		var _initializeModule = function(chan, data) {
			_initializeDetails();
			_initializeFilter();
		};

		//--------------------------------------------------------------------------------------------------------------
		// Public
		//--------------------------------------------------------------------------------------------------------------

		var xfHeaderModule = {};

		//--------------------------------------------------------------------------------------------------------------

		xfHeaderModule.start = function(sandbox) {

			_UIObjectState.sandbox = sandbox;

			var subTokens = {};
			subTokens[chan.DETAILS_CHANGE_EVENT] = aperture.pubsub.subscribe(chan.DETAILS_CHANGE_EVENT, _updateDetails);
			subTokens[chan.FILTER_CHANGE_EVENT] = aperture.pubsub.subscribe(chan.FILTER_CHANGE_EVENT, _updateFilter);
			subTokens[chan.GRAPH_SEARCH_STATE_CHANGE] = aperture.pubsub.subscribe(chan.GRAPH_SEARCH_STATE_CHANGE, _updatePatternSearch);
			subTokens[chan.ALL_MODULES_STARTED] = aperture.pubsub.subscribe(chan.ALL_MODULES_STARTED, _initializeModule);
			_UIObjectState.subscriberTokens = subTokens;
		};

		//--------------------------------------------------------------------------------------------------------------

		xfHeaderModule.end = function(){
			for (var token in _UIObjectState.subscriberTokens) {
				if (_UIObjectState.subscriberTokens.hasOwnProperty(token)) {
					aperture.pubsub.unsubscribe(_UIObjectState.subscriberTokens[token]);
				}
			}
		};

		//--------------------------------------------------------------------------------------------------------------

		var headerConstructor = function(sandbox){
			return {
				start : function(sandbox){
					xfHeaderModule.start(sandbox);
				},
				end : function(){
					xfHeaderModule.end();
				}
			};
		};

		// Register the module with the system
		modules.register(MODULE_NAME, headerConstructor);

		return xfHeaderModule;
	}
);
