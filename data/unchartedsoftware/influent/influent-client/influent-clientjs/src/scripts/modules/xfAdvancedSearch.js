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
define(['lib/module', 'lib/channels', 'lib/ui/criteria', 'modules/xfWorkspace', 'modules/xfRest'],
	function(modules, chan, criteriaUI, xfWorkspace, xfRest) {

		//--------------------------------------------------------------------------------------------------------------
		// Private Variables
		//--------------------------------------------------------------------------------------------------------------

		var _UIObjectState = {
			UIType : 'xfAdvancedSearch',
			fileId : '',
			contextId : '',
			subscriberTokens : null
		};

		var _enableAdvancedSearchMatchType =
			aperture.config.get()['influent.config']['enableAdvancedSearchMatchType'];
		var _patternsToo =
			aperture.config.get()['influent.config']['usePatternSearch'];
		var _weighted =
			aperture.config.get()['influent.config']['enableAdvancedSearchWeightedTerms'];
		var _advancedSearchFuzzyLevels =
			aperture.config.get()['influent.config']['advancedSearchFuzzyLevels'];

		if (_enableAdvancedSearchMatchType == null) {
			_enableAdvancedSearchMatchType = true;
		}
		if (_weighted == null) {
			_weighted = true;
		}

		criteriaUI.weighted(_weighted);


		// Find the defined fuzzy match level closest to 50%
		var _fuzzyMatchPreference = 0.5;
		var _fuzzyMatchWeight = null;

		aperture.util.forEach(_advancedSearchFuzzyLevels, function (value) {
			if (_fuzzyMatchWeight == null ||
				Math.abs(value - _fuzzyMatchPreference) < Math.abs(_fuzzyMatchWeight - _fuzzyMatchPreference)) {

				_fuzzyMatchWeight = value;
			}
		});

		var _propertyMap = {};
		var _typeList = [];

		//--------------------------------------------------------------------------------------------------------------

		//--------------------------------------------------------------------------------------------------------------
		// Private Methods
		//--------------------------------------------------------------------------------------------------------------
		function onInit() {
			xfRest.request('/searchparams')
				.inContext( _UIObjectState.contextId )
				.then(function(response) {

					// store the search parameter list
					aperture.util.forEach(response.properties, function(property, idx) {

						property.order = idx;
						_propertyMap[property.key] = property;
					});

					aperture.util.forEach(response.types, function(type) {
						_typeList.push(type);
					});

					// build the static part of the UI
					buildDialog();

				});
		}

		//--------------------------------------------------------------------------------------------------------------
		function buildDialog() {

			var buttons = [];
			buttons.push({
				text: 'Search', 'class': 'searchButton',
				click: function () {
					$(this).dialog('close');
					onSearchAction(true);
				}});


			var advancedTabs = $('#advancedTabs');
			var tabList = $('<ul></ul>')
				.appendTo(advancedTabs);


			// attribute match tab.
			advancedTabs.append(buildAttributeTab(tabList, buttons));

			// activity match tab.
			if (_patternsToo) {
				advancedTabs.append(buildActivityTab(tabList, buttons));
			}

			// cancel button last.
			buttons.push({
				text: 'Cancel',
				click: function() {
					$(this).dialog('close');
                    aperture.pubsub.publish(chan.ADVANCE_SEARCH_DIALOG_CLOSE_EVENT);
				}});

			// tab construction
			advancedTabs.tabs({
				heightStyle: 'content'
			});

			var dialog = $('#advancedDialog');
			dialog.dialog({
				height: 730,
				autoOpen: false,
				modal: true,
				buttons: buttons,
				show: {
					effect: 'clip',
					duration: 100
				},
				hide: {
					effect: 'clip',
					duration: 100
				},
				width:650,
                open: function(event, ui) {

                    // publish a closing event when the X close button is pressed
                    $(this).parent().children().children('.ui-dialog-titlebar-close').click( function() {
                        aperture.pubsub.publish(chan.ADVANCE_SEARCH_DIALOG_CLOSE_EVENT);
                    });
                }
			});

			// ?
			dialog.css('display', '');
			dialog.addClass('bootstrap-wrapper');
		}

		//--------------------------------------------------------------------------------------------------------------
		function onAnyAll() {
			var matchType = $('input[name=advancedSearchbooleanOperation]:checked').val();

			criteriaUI.multival(matchType === 'any');

            aperture.log.log({
                type: aperture.log.draperType.USER,
                workflow: aperture.log.draperWorkflow.WF_GETDATA,
                activity: 'select_filter_menu_option',
                description: 'Changed advanced search boolean operation',
                data : {
                    matchType : matchType
                }
            });
		}

		//--------------------------------------------------------------------------------------------------------------
		function buildAttributeTab(tabList, buttons) {
			var tabListItem = $('<li></li>')
				.appendTo(tabList);

			$('<a></a>')
				.attr('href', '#match-tab-attrs')
				.html('Match on Account Attributes')
				.appendTo(tabListItem);

			var attributes = $('<div></div>')
				.attr('id', 'match-tab-attrs')
				.addClass('match-tab')
				.css('white-space', 'nowrap')
				.append('<br>');

			var typeLine = $('<div></div>')
				.addClass('advancedsearch-type-line')
				.appendTo(attributes);

			$('<label></label>')
				.attr('for', 'advancedsearch-entity-type')
				.html('Find: ')
				.appendTo(typeLine);

			var typeOptions = $('<select class="selectpicker" title="Please select a type" multiple></select>')
				.attr('id', 'advancedsearch-entity-type')
				.appendTo(typeLine)
				.change(function() {
					var selectPickerButton = $(typeOptions.next().children()[0]);
					if (typeOptions.val() === null) {
						selectPickerButton.removeClass('btn-default').addClass('btn-danger');
					} else {
						selectPickerButton.removeClass('btn-danger').addClass('btn-default');
					}



					var text = assembleSearchString();
					setFieldsFromString(text);

                    aperture.log.log({
                        type: aperture.log.draperType.USER,
                        workflow: aperture.log.draperWorkflow.WF_GETDATA,
                        activity: 'select_filter_menu_option',
                        description: 'Changed advanced search entity type',
                        data: {
                            type : $(this).val()
                        }
                    });
				});


			// build type options.
			var firstVal = null;
			var ungroupedTypes = [];
			var hasUngroupedTypes = false;
			var hasGroupedTypes = false;
			var groupKeyMap = {};
			aperture.util.forEach(_typeList, function(type) {
				if (!firstVal) {
					firstVal = type.key;
				}

				var optGroup = null;
				if (type.group) {
					optGroup = typeOptions.find('optgroup[label="' + type.group + '"]');
					if (!optGroup || optGroup.length === 0) {
						optGroup = $('<optgroup/>').attr('label',type.group);
						if (type.exclusive) {
							optGroup.attr('data-max-options','1');
						}
						optGroup.appendTo(typeOptions);
					}
					$('<option></option>')
						.attr('value', type.key)
						.html(type.friendlyText ? type.friendlyText : type.key)
						.appendTo(optGroup);
					hasGroupedTypes = true;

					var groupKeys = groupKeyMap[type.group];
					if (!groupKeys) {
						groupKeys = [];
					}
					groupKeys.push(type.key);
					groupKeyMap[type.group] = groupKeys;
				} else {
					ungroupedTypes.push(type);
					hasUngroupedTypes = true;
				}
			});

			if (hasUngroupedTypes) {
				if (hasGroupedTypes) {
					typeOptions.append('<option data-divider="true"></option>');
				}
				aperture.util.forEach(ungroupedTypes, function(type) {
					$('<option></option>')
						.attr('value', type.key)
						.html(type.friendlyText ? type.friendlyText : type.key)
						.appendTo(typeOptions);
				});
			}


			typeOptions.selectpicker({
				actionsBox : true,
				headerCallback : function(groupName) {
					var i;
					var currentValues = typeOptions.selectpicker('val') || [];
					var groupKeys = groupKeyMap[groupName];


					// If all group keys are currently selected, we want to deselect them
					var bRemoveGroupKeys = true;
					for (i = 0; i < groupKeys.length && bRemoveGroupKeys; i++) {
						bRemoveGroupKeys &= (currentValues.indexOf(groupKeys[i]) != -1);
					}

					// Remove group keys from the current selection, otherwise, add them avoiding duplicates
					if (bRemoveGroupKeys) {
						for (i = 0; i < groupKeys.length; i++) {
							currentValues.splice(currentValues.indexOf(groupKeys[i]),1);
						}
					} else {
						for (i = 0; i < groupKeys.length; i++) {
							if (currentValues.indexOf(groupKeys[i]) == -1) {
								currentValues.push(groupKeys[i]);
							}
						}
					}
					typeOptions.selectpicker('val',currentValues);
					typeOptions.change();
				}
			});
			typeOptions.selectpicker('val', firstVal);



			// ANY / ALL option, is optional
			if (_enableAdvancedSearchMatchType) {
				var anyAllLine = $('<div></div>')
					.addClass('advancedsearch-any-all-line')
					.appendTo(attributes);


				anyAllLine.append($('<span/>').html('where '));

				var andRadio = $('<input/>').attr({
					type:'radio',
					name:'advancedSearchbooleanOperation',
					value:'all'
				}).prop('checked',true).change(onAnyAll);

				anyAllLine.append(andRadio).append('<span class="advancedsearch-any-all-span">'
						+ andRadio.attr('value') + '</span>');

				var orRadio = $('<input/>').attr({
					type:'radio',
					name:'advancedSearchbooleanOperation',
					value:'any'
				}).change(onAnyAll);

				anyAllLine.append(orRadio).append('<span class="advancedsearch-any-all-span">'
						+ orRadio.attr('value') + '</span>');
				anyAllLine.append($('<span/>').html(' of the following match:'));
			}

			$('<div></div>')
				.attr('id', 'advancedsearch-criteria-container')
				.appendTo(attributes);

			$('<div></div>')
				.attr('id', 'advancedsearch-criteria-add')
				.text('add more criteria')
				.appendTo(attributes)
				.click(function() {
					addCriteriaRow($('#advancedsearch-entity-type').val(), undefined, $('#advancedsearch-criteria-container'));

                    aperture.log.log({
                        type: aperture.log.draperType.USER,
                        workflow: aperture.log.draperWorkflow.WF_GETDATA,
                        activity: 'select_filter_menu_option',
                        description: 'Adding new search criteria'
                    });
				});

			return attributes;
		}

		//--------------------------------------------------------------------------------------------------------------
		function buildActivityTab(tabList, buttons) {
			var activityTab = $('<li></li>');
			var activityHref = $('<a></a>');
			activityHref.attr('href', '#match-tab-activity');
			activityHref.html('Match on Account Activity');
			activityTab.append(activityHref);
			tabList.append(activityTab);

			var activity = $('<div></div>');
			activity.attr('id', 'match-tab-activity');
			activity.addClass('match-tab');

			activity.append('<br>Like Account(s):<br><br><br>');

			var idfield = $('<label></label>');
			idfield.attr('for', 'likeIdProperty');
			idfield.css('width', '30%');
			idfield.css('float', 'left');
			idfield.css('text-align', 'right');
			idfield.html('uid(s):&nbsp;&nbsp;');

			var idline= $('<div></div>').appendTo(activity);
			idline.append(idfield);

			idfield = $('<input/>');
			idfield.attr('id', 'likeIdProperty');
			idfield.addClass('textPropertyClass');
			idfield.css('width', 140);
            idfield.bind('input', function() {
                aperture.log.log({
                    type: aperture.log.draperType.USER,
                    workflow: aperture.log.draperWorkflow.WF_GETDATA,
                    activity: 'enter_filter_text',
                    description: 'User entering text in pattern search criteria'
                });
            });
			idline.append(idfield);

			var patternEngineDescription =
				aperture.config.get()['influent.config'].patternQueryDescriptionHTML ||
					'SORRY, this data set does not appear to be indexed for behavioral query by example!';

			$('<div id="patternEngineDescription"></div>').appendTo(activity).html(patternEngineDescription);

			// only if multi-role/graph search is possible should we bother providing an option of applying
			// without executing the search immediately.
			buttons.push({
				text: 'Apply',
				click: function () {
					$(this).dialog('close');
					onSearchAction(false);
			}});

			return activity;
		}

		//--------------------------------------------------------------------------------------------------------------
		function hasAllProperties(object, stringArray) {
			var bHasAllProperties = true;
			if (stringArray && stringArray.length > 0) {
				for (var i = 0; i < stringArray.length && bHasAllProperties; i++) {
					bHasAllProperties &= object.hasOwnProperty(stringArray[i]);
				}
			}
			return bHasAllProperties;
		}

		//--------------------------------------------------------------------------------------------------------------
		function getIntersectingProperties(typeArray) {
			var props = [];
			for (var key in _propertyMap) {
				if (_propertyMap.hasOwnProperty(key)) {
					if (hasAllProperties(_propertyMap[key].typeMappings, typeArray)) {
						props.push(_propertyMap[key]);
					}
				}
			}
			return props;
		}

		//--------------------------------------------------------------------------------------------------------------
		function getIntersectingPropertiesMap(typeArray) {
			var props = {};
			for (var key in _propertyMap) {
				if (_propertyMap.hasOwnProperty(key)) {
					if (hasAllProperties(_propertyMap[key].typeMappings, typeArray)) {
						props[key] = _propertyMap[key];
					}
				}
			}
			return props;
		}

		//--------------------------------------------------------------------------------------------------------------
		function getTypesFromEntityList(entities) {
			var types = {};

			for (var i = 0; i < entities.length; i++) {
				var tokens = entities[i].uid.split('.');
				types[tokens[1]] = true;
			}

			var typeArray = [];
			for (var typeKey in types) {
				if (types.hasOwnProperty(typeKey)) {
					typeArray.push(typeKey);
				}
			}

			return typeArray;
		}

		//--------------------------------------------------------------------------------------------------------------
		function addDefaultRows(typeArr, parent) {
			if (!aperture.util.isArray(typeArr)) {
				typeArr = [typeArr];
			}
			var intersectingProps = getIntersectingProperties(typeArr);

			// Create an array of default criteria
			var defaultCriteria = [];
			intersectingProps.forEach(function(prop) {
				if (prop.defaultTerm) {
					defaultCriteria.push({
						key: prop.key,
						text: prop.key+':'+'""'
					});
				}
			});

			// If no default criteria are specified, pick the first property we find, otherwise add each criteria row
			if (defaultCriteria.length === 0) {
				if (intersectingProps.length > 0) {
					addCriteriaRow(typeArr,undefined,parent);
				}
			} else {
				defaultCriteria.forEach(function(c){
					addCriteriaRow(typeArr,c,parent);
				});
			}
		}

		//--------------------------------------------------------------------------------------------------------------
		function addCriteriaRow(typeArr, criteria, parent) {
			if (!aperture.util.isArray(typeArr)) {
				typeArr = [typeArr];
			}

			if (criteria === null) {
				addDefaultRows(typeArr, parent);
				return;
			}

			var property;
			var intersectingProps = getIntersectingProperties(typeArr);
			if (criteria === undefined) {
				var usedProps = criteriaUI.list();
				intersectingProps.forEach(function(prop) {
					if (!property) {
						var used = false;
						usedProps.forEach(function (usedProp) {
							if (prop.key === usedProp.key()) {
								used = true;
							}
						});
						if (!used) {
							property = prop;
						}
					}
				});
			} else {
				for (var i = 0; i < intersectingProps.length; i++) {
					if (intersectingProps[i].key === criteria.key) {
						property = intersectingProps[i];
						break;
					}
				}
			}

			if (property) {
				var row = criteriaUI.add(intersectingProps,property,parent);
				if (criteria) {
					row.value(criteria.text);
				}
			}
		}
		//--------------------------------------------------------------------------------------------------------------
		function addBlankCriteriaRow() {
			addCriteriaRow($('#advancedsearch-entity-type').val(), null, $('#advancedsearch-criteria-container'));
		}

		//--------------------------------------------------------------------------------------------------------------
		function clear() {
			criteriaUI.list().forEach(function(ui) {
				ui.remove();
			});
		}

		//--------------------------------------------------------------------------------------------------------------
		function onAdvancedSearchDialogRequest(eventChannel, data) {
			_UIObjectState.fileId = data.fileId;
			_UIObjectState.contextId = data.contextId;

			if (data.dataIds != null && !_.isEmpty(data.dataIds)) {
				setFieldsFromDataIds(data.dataIds);
				$('#advancedTabs').tabs('option', 'active', 0);
			} else {
				setFieldsFromString(data.terms);
			}

			$('#advancedDialog').dialog('open');
		}

		//--------------------------------------------------------------------------------------------------------------
		function parseQuery(searchString) {
			var nameValuePattern = /([^:\s]+)\s*:\s*(.+?)\s*(([^:\s]+):|$)/;
			var match = nameValuePattern.exec(searchString);
			var criteria = {list:[], map:{}};
			var key;
			var matchlen;

			while (match != null) {
				key = match[1];

				if (key.charAt(0) === '-') {
					key = key.substr(1);
				}

				if (!criteria.map[key] || key === 'datatype') {
					criteria.list.push({
						key : key,
						text : match[1] + ':' + match[2]
					});
				}

				if (key === 'datatype') {
					if (!criteria.map[key]) {
						criteria.map[key] = [match[2]];
					} else {
						criteria.map[key].push(match[2]);
					}
				} else {
					criteria.map[key] = match[2];
				}


				matchlen = match[0].length - match[3].length;
				if (matchlen >= searchString.length) {
					break;
				}

				searchString = searchString.substr(matchlen);
				match = nameValuePattern.exec(searchString);
			}



			return criteria;
		}

		//--------------------------------------------------------------------------------------------------------------
		function seedFromEntities(entities) {
			var map = {matchtype : 'any'};
			var list = [{key: 'uid', text: ''}];
			var entitiesString = '';

			if (!entities || entities.length === 0) {
				aperture.log.warn('no entities found for population request');
				return;
			}

			entities = entities[0].entities;

			map.datatype = getTypesFromEntityList(entities);

			var intersectingPropertiesMap = getIntersectingPropertiesMap(map.datatype);

			aperture.util.forEach(entities, function (entity) {
				entitiesString += entity.uid + ', ';

				var type = getTypesFromEntityList([entity]);
				aperture.util.forEach(intersectingPropertiesMap, function (p) {

					var typedKey = p.typeMappings[type];
					var property = entity.properties[typedKey];

					if (property && property.value && property.value !== '') {
						var useIt = true;

						if (property.tags) {
							for (var j = 0; j < property.tags.length; j++) {

								// Dont process anything with an ID or GEO tag for seeding
								if (property.tags[j] === 'ID' ||
									property.tags[j] === 'GEO') {
									useIt = false;
									break;
								}
							}
						}


						if (useIt) {
							if (map.hasOwnProperty(p.key)) {
								if (map[p.key].indexOf(property.value) === -1) {
									map[p.key] += ', ' + property.value;
								}
							} else {
								map[p.key] = String(property.value);
								list.push({
									key: p.key,
									text: '',
									ordinal: intersectingPropertiesMap[p.key].order
								});
							}
						}
					}
				});
			});

			map.uid = entitiesString.substring(0, entitiesString.length - 2);

			// copy final values into list as text
			list.forEach(function(p) {
				p.text = p.key + ':' + map[p.key] + (_fuzzyMatchWeight ? '~' + _fuzzyMatchWeight : '');
			});

			list.sort(function(a,b) {
				return a.ordinal - b.ordinal;
			});

			setFieldsFromProperties({
				map: map,
				list: list
			});
		}

		//--------------------------------------------------------------------------------------------------------------
		function setFieldsFromString(searchString) {
			clear();

			if (searchString == null || searchString.length === 0) {
				addBlankCriteriaRow();
				return;
			}

			var criteria = parseQuery(searchString);

			if (criteria.map.like) {
				setFieldsFromDataIds(criteria.map.like.split(','));
				$('#advancedTabs').tabs('option', 'active', 1);
			} else {
				setFieldsFromProperties(criteria);
				$('#advancedTabs').tabs('option', 'active', 0);
			}
		}

		//--------------------------------------------------------------------------------------------------------------
		function setFieldsFromProperties(criteria) {
			var typeOpt = $('#advancedsearch-entity-type');

			if (criteria.map.datatype) {
				typeOpt.selectpicker('val',criteria.map.datatype);
			}
			var matchtype = criteria.map.matchtype;

			if (matchtype) {
				var matchtypeSel = '[value='+ matchtype + ']';

				var pair = $('input[name=advancedSearchbooleanOperation]');
				pair.not(matchtypeSel).prop('checked',false);
				pair.filter(matchtypeSel).prop('checked',true);
			}

			if (criteria.map.uid) {
				$('#likeIdProperty').val(criteria.map.uid? criteria.map.uid: '');
			} else {
				$('#likeIdProperty').val('');
			}

			var parent = $('#advancedsearch-criteria-container');
			var intersectingProperties = getIntersectingPropertiesMap(criteria.map.datatype);
			criteria.list.forEach(function(c) {
				if (intersectingProperties[c.key]) {
					addCriteriaRow(criteria.map.datatype, c, parent);
				}
			});

			if (criteriaUI.list().length === 0) {
				addBlankCriteriaRow();
			}
		}

		//--------------------------------------------------------------------------------------------------------------
		function setFieldsFromDataIds(dataIds) {
			clear();

			xfRest.request( '/containedentities' ).inContext( _UIObjectState.contextId ).withData({

				sessionId : xfWorkspace.getSessionId(),
				entitySets : [{
					contextId : _UIObjectState.contextId,
					entities : dataIds
				}],
				details : true

			}).then(function (response) {

				seedFromEntities(response.data);

				if (criteriaUI.list().length === 0) {
					addBlankCriteriaRow();
				}
			});
		}

		//--------------------------------------------------------------------------------------------------------------
		function onSearchAction(execute) {
			var searchTerm = assembleSearchString();

			aperture.pubsub.publish(chan.SEARCH_REQUEST, {
				xfId : _UIObjectState.fileId,
				searchTerm : searchTerm,
				executeSearch : execute,
				noRender: true
			});
		}

		//--------------------------------------------------------------------------------------------------------------
		function assembleSearchString() {
			var isPattern = $('#advancedTabs').tabs( 'option', 'active' );

			if (isPattern) {
				var id = $('#likeIdProperty').val();
				return id? 'like:'+ id : '';
			}
			
			var searchString = '';
			var selectedTypes = $('#advancedsearch-entity-type').val();
			criteriaUI.list().forEach(function(ui) {
				var val = ui.value();
				if (val && val.length !== 0) {
					searchString += val + ' ';
				}
			});

			// Remove trailing space
			searchString = searchString.substring(0, searchString.length - 1);

			if(searchString.length > 0) {
				if (selectedTypes) {
					for (var valIdx = 0; valIdx < selectedTypes.length; valIdx++) {
						searchString += ' datatype:' + selectedTypes[valIdx];
					}
				}

				if (_enableAdvancedSearchMatchType) {
					searchString += ' matchtype:"' + $('input[name=advancedSearchbooleanOperation]:checked').val() + '" ';
				}
			}

			return searchString;
		}
		
		//--------------------------------------------------------------------------------------------------------------
		// Public
		//--------------------------------------------------------------------------------------------------------------

		var xfAdvancedSearchModule = {};

		//--------------------------------------------------------------------------------------------------------------

		// Register the module with the system
		modules.register('xfAdvancedSearch', function() {
			return {
				start : function() {
					var subTokens = {};
					subTokens[chan.ADVANCE_SEARCH_DIALOG_REQUEST] = aperture.pubsub.subscribe(chan.ADVANCE_SEARCH_DIALOG_REQUEST, onAdvancedSearchDialogRequest);
					subTokens[chan.ALL_MODULES_STARTED] = aperture.pubsub.subscribe(chan.ALL_MODULES_STARTED, onInit);
					_UIObjectState.subscriberTokens = subTokens;
				},
				end : function(){
					for (var token in _UIObjectState.subscriberTokens) {
						if (_UIObjectState.subscriberTokens.hasOwnProperty(token)) {
							aperture.pubsub.unsubscribe(_UIObjectState.subscriberTokens[token]);
						}
					}
				}
			};
		});

		return xfAdvancedSearchModule;
	}
);
