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
	['lib/module', 'lib/channels', 'modules/xfWorkspace',
		'modules/xfRest', 'lib/constants', 'lib/ui/xfModalDialog'],
	function(modules, chan, xfWorkspace,
	         xfRest, constants, xfModalDialog) {

	var transactionsConstructor = function(sandbox) {

		var _transactionsState = {
			table: '',
			curEntity : '',
			focus : [],
			startDate : null,
			endDate : null,
			subscriberTokens : null,
			bFilterFocused : false,
            tableInitialized : false,
            tablePopulated : false
		};

		//--------------------------------------------------------------------------------------------------------------

		var processRowData = function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
			var srcId = aData[5];
			var dstId = aData[6];
			var focusIdArray = _transactionsState.focus;
			if (focusIdArray.indexOf(srcId) != -1 || focusIdArray.indexOf(dstId) != -1){
				$(nRow).addClass('transactionsHighlight-'+ (iDisplayIndex % 2));
			}
			_transactionsState.tablePopulated = false;
		};

		//--------------------------------------------------------------------------------------------------------------

		var onSearch = function(channel, data) {
			aperture.log.debug('onSearch transactions : clear transactions table');
			if (_transactionsState.tableInitialized) {
				$('#transactions-table tbody').empty();
                _transactionsState.tablePopulated = false;
			}
		};

		//--------------------------------------------------------------------------------------------------------------

		var onUpdate = function(channel, data) {
			if (data != null) {
				aperture.log.debug('onUpdate transactions : ' + data.dataId);

				var visualInfo = xfWorkspace.getUIObjectByXfId(data.xfId).getVisualInfo();
				var shouldPrompt = visualInfo.spec.promptForDetails;
				if (shouldPrompt)
					return;
			}

            _transactionsState.tablePopulated = false;
			_transactionsState.curEntity = data && data.dataId;

			if (!_transactionsState.tableInitialized) {
				if (_transactionsState.curEntity && _transactionsState.startDate && _transactionsState.endDate) {
					initializeTransactionsTable();
				} else {
					return;
				}
			}

			if(_transactionsState.table.is(':visible') || $('#chartTab').is(':visible')) {
				_transactionsState.table.fnDraw();
			}
		};

		//--------------------------------------------------------------------------------------------------------------

		var _drawHighlighting = function(focusList) {
			if (_transactionsState.table) {
				if(_transactionsState.bFilterFocused) {
					_transactionsState.table.fnDraw();
				}
				else {
					// avoid using fnDraw where possible, as it will reset the page/scroll location on the table view
					$('tr', _transactionsState.table).each(function(i, e){
						var rowData = _transactionsState.table.fnGetData( this );
						if(rowData != null && (focusList.indexOf(rowData[5]) != -1 || focusList.indexOf(rowData[6]) != -1)) {
							$(e).addClass('transactionsHighlight-'+ ((i+1) % 2));
						}
						else {
							$(e).removeClass('transactionsHighlight-'+ ((i+1) % 2));
						}
					});
				}
			}
		};

		//--------------------------------------------------------------------------------------------------------------

		var onFocusChange = function(channel, data) {

			_transactionsState.focus = [];

			if (data == null || data.focus == null) {
				_drawHighlighting(_transactionsState.focus);
			} else {
				// We need to get a list of entities that are focused if this is a file cluster.   Ask the server
				// so they are all treated as 'focused' according to the transaction table
				xfRest.request('/containedentities').inContext(data.focus.contextId).withData({

					sessionId: data.focus.sessionId,
					entitySets: [
						{
							contextId: data.focus.contextId,
							entities: [data.focus.dataId]
						}
					],
					details: false

				}).then(function (response) {

					// Parse response
					for (var i = 0; i < response.data.length; i++) {
						var entities = response.data[i].entities;
						for (var j = 0; j < entities.length; j++) {
							_transactionsState.focus.push(entities[j]);
						}
					}

					_drawHighlighting(_transactionsState.focus);
				});
			}
		};

		//--------------------------------------------------------------------------------------------------------------

		var _onFilter = function(channel, data) {
			_transactionsState.startDate = data.startDate.getUTCFullYear()+'-'+(data.startDate.getUTCMonth()+1)+'-'+data.startDate.getUTCDate();
			_transactionsState.endDate = data.endDate.getUTCFullYear()+'-'+(data.endDate.getUTCMonth()+1)+'-'+data.endDate.getUTCDate();
            _transactionsState.tablePopulated = false;

			aperture.log.debug('onFilter transactions : ' + _transactionsState.startDate + ' -> ' + _transactionsState.endDate);

			if (!_transactionsState.tableInitialized) {
				if (_transactionsState.curEntity && _transactionsState.startDate && _transactionsState.endDate) {
					initializeTransactionsTable();
				} else {
					return;
				}
			}

			_transactionsState.table.fnDraw();
		};

		//--------------------------------------------------------------------------------------------------------------

		var initializeTransactionsTable = function() {

			var ajaxSource = aperture.io.restUrl('/transactions');

			aperture.log.debug('initializeTransactionsTable called');
			_transactionsState.table = $('#transactions-table');
			_transactionsState.table.dataTable({
				'bProcessing':true,
				'bServerSide':true,
				'bDeferRender':true,
				'iDisplayLength':100,
				'bLengthChange':false,
				'sScrollY' : '151px',
				'bScrollCollapse' : true,
				'bFilter':false,
				'bDestroy':true,
				'sAjaxSource':ajaxSource,
				'fnServerParams':function(aoData) {
					aoData.push({'name':'entityId', 'value':_transactionsState.curEntity});
					aoData.push({'name':'startDate', 'value':_transactionsState.startDate});
					aoData.push({'name':'endDate', 'value':_transactionsState.endDate});
					if (_transactionsState.bFilterFocused &&
						_transactionsState.focus != null &&
						_transactionsState.focus.length > 0 &&
						_transactionsState.curEntity != null &&
						(_transactionsState.focus.length > 1 || _transactionsState.focus[0] !== _transactionsState.curEntity)
					) {
						aoData.push({'name':'focusIds', 'value':_transactionsState.focus});
					}
				},
				'aaSorting': [],				//No sorting initially - results are in order from server
				'aoColumnDefs': [
					// TODO: # column needs to be sortable but it doesn't actually exist yet.
					{'bSortable':false, 'aTargets':[0,1,2,3,4]},		//No sorting on # column or comment column
					{'sWidth': '40px', 'sName': '#', 'aTargets':[0]},				//Column name 0
					{'sWidth': '80px', 'sName': 'Date', 'aTargets':[1], 'asSorting': [ 'asc' ]},			//Column name 1
					{'sName': 'Comment', 'aTargets':[2]},		//Column name 2
					{'sClass': 'currency-table-column', 'sWidth': '100px', 'sName': 'Inflowing', 'aTargets':[3], 'asSorting': [ 'desc' ]},		//Column name 3
					{'sClass': 'currency-table-column', 'sWidth': '100px', 'sName': 'Outflowing', 'aTargets':[4], 'asSorting': [ 'desc' ]}		//Column name 4
					//Column 5: Reserved for source entity ID2
					//Column 6: Reserved for target entity ID
				],
				'fnServerData': function ( sSource, aoData, fnCallback, oSettings ) {
					var jsonData = {};
					for (var i = 0; i < aoData.length; i++) {
						var key = aoData[i].name;
						var value = aoData[i].value;
						jsonData[key] = value;
					}

					oSettings.jqXHR = $.ajax( {
						dataType: 'json',
						contentType: 'application/json',
						type: 'POST',
						url: sSource,
						data: JSON.stringify(jsonData),
						success: function ( data ) {
							if (data.aoColumnUnits) {
								if (data.aoColumnUnits[2].sUnits) {
									oSettings.aoColumns[3].sTitle = 'In (' + data.aoColumnUnits[2].sUnits + ')';
									oSettings.aoColumns[3].nTh.innerText = 'In (' + data.aoColumnUnits[2].sUnits + ')';
								}
								if (data.aoColumnUnits[3].sUnits) {
									oSettings.aoColumns[4].sTitle = 'Out (' + data.aoColumnUnits[3].sUnits + ')';
									oSettings.aoColumns[4].nTh.innerText = 'Out (' + data.aoColumnUnits[3].sUnits + ')';
								}
							}
							fnCallback(data);

							if (data.iTotalDisplayRecords > 0)
								_transactionsState.tablePopulated = true;
						}
					} );
				},
				'fnRowCallback' : processRowData
			});

            $('#transactions-table_wrapper').find('.dataTables_scrollBody').scroll( function(e) {
                if (_transactionsState.tablePopulated) {
                    aperture.pubsub.publish(chan.SCROLL_VIEW_EVENT, {
                        div : e.target
                    });
                }
            });

			$('#transactions-table_wrapper').find('[class^="paginate"][role="button"]').click( function(e) {
				if (e.target.className.indexOf('enabled') !== -1) {
					aperture.pubsub.publish(chan.TRANSACTIONS_PAGE_CHANGE_EVENT);
				}
			});

			$('#exportTransactions').click(
				function() {
					aperture.pubsub.publish(chan.EXPORT_TRANSACTIONS_REQUEST);
				}
			);

			$('#filterHighlighted').click(
				function() {
					_transactionsState.bFilterFocused = $('#filterHighlighted')[0].checked;
					_transactionsState.table.fnDraw();

                    aperture.pubsub.publish(chan.TRANSACTIONS_FILTER_EVENT, {
                        filterHighlighted : _transactionsState.bFilterFocused
                    });
				}
			);

            _transactionsState.tableInitialized = true;
		};

		//--------------------------------------------------------------------------------------------------------------

		/*global alert*/
		var _onExportTransactions = function () {
			var numRows = _transactionsState.table.length;
			if (numRows === 0) {
				alert('No transaction data to export!');
				return;
			}

			$.blockUI({
				theme: true,
				title: 'Export In Progress',
				message: '<img src="' + constants.AJAX_SPINNER_FILE + '" style="display:block;margin-left:auto;margin-right:auto"/>'
			});
			var beforeUnloadEvents = $._data($(window).get(0), 'events').beforeunload;
			var handlers = [];
			if (beforeUnloadEvents !== undefined) {
				beforeUnloadEvents.forEach(function (event) {
					handlers.push(event.handler);
				});
			}

			//TODO do we need this befreunload??
			$(window).unbind('beforeunload');

			xfRest.request('/exporttransactions').withData({
				entityId: _transactionsState.curEntity,
				contextId: _transactionsState.curContext,
				startDate: _transactionsState.startDate,
				endDate: _transactionsState.endDate
			}).then(function (response) {

				var a = document.createElement('a');
				a.href = aperture.store.url(response, 'pop', 'transactions_' + _transactionsState.curEntity + '.csv');

				document.body.appendChild(a);

				setTimeout(
					function() {
						$(window).unbind('beforeunload');
						a.click();
						document.body.removeChild(a);
						$.unblockUI();
						xfModalDialog.createInstance({
							title : 'Success',
							contents : 'Export successful!',
							buttons : {
								'Ok' : function() {}
							}
						});
						handlers.forEach(function (handler) {
							$(window).bind('beforeunload', handler);
						});
					},
					0
				);
			});
		};

		//--------------------------------------------------------------------------------------------------------------

		var _initializeModule = function() {
			aperture.log.debug('_initializeModule transactions');
			if (_transactionsState.curEntity && _transactionsState.startDate && _transactionsState.endDate) {
				initializeTransactionsTable();
			}
		};

		//--------------------------------------------------------------------------------------------------------------

		var start = function() {
			var subTokens = {};

			//TODO : use the div passed in to place the transactions, instead of hardcoding the div name above.
			subTokens[chan.SELECTION_CHANGE_EVENT] = aperture.pubsub.subscribe(chan.SELECTION_CHANGE_EVENT, onUpdate);
			subTokens[chan.FOCUS_CHANGE_EVENT] = aperture.pubsub.subscribe(chan.FOCUS_CHANGE_EVENT, onFocusChange);
			subTokens[chan.SEARCH_REQUEST] = aperture.pubsub.subscribe(chan.SEARCH_REQUEST, onSearch);
			subTokens[chan.FILTER_CHANGE_EVENT] = aperture.pubsub.subscribe(chan.FILTER_CHANGE_EVENT, _onFilter);
			subTokens[chan.ALL_MODULES_STARTED] = aperture.pubsub.subscribe(chan.ALL_MODULES_STARTED, _initializeModule);
			subTokens[chan.EXPORT_TRANSACTIONS_REQUEST] = aperture.pubsub.subscribe(chan.EXPORT_TRANSACTIONS_REQUEST, _onExportTransactions);

			_transactionsState.subscriberTokens = subTokens;
		};

		//--------------------------------------------------------------------------------------------------------------

		var end = function() {
			for (var token in _transactionsState.subscriberTokens) {
				if (_transactionsState.subscriberTokens.hasOwnProperty(token)) {
					aperture.pubsub.unsubscribe(_transactionsState.subscriberTokens[token]);
				}
			}
		};

		//--------------------------------------------------------------------------------------------------------------

		return {
			start : start,
			end : end
		};
	};

	modules.register('xfTransactionTable',transactionsConstructor);
});
