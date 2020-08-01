YUI.add('query-executor', function(Y) {
    YUI.namespace('com.imaginea.mongoV');
    var MV = YUI.com.imaginea.mongoV;
    var sm = MV.StateManager;

    MV.loadQueryBox = function(config, sHandler) {

        var cachedQueryParams = {};
        var successHandler = sHandler;
        var keysUrl = config.keysUrl;
        var dataUrl = config.dataUrl;

        var _queryTextTemplate = [
            "<div id='queryBoxDiv'>",
            "<div class='queryBoxlabels'>",
            "<label>Define Query</label>",
            "</div>",
            "<div>",
            "<textarea id='queryBox' name='queryBox' class='queryBox navigable' data-search_name='query'>",
            "[0]",
            "</textarea>",
            "</div>",
            "</div>"

        ].join('\n');

        var _docKeysCheckListTemplate = [
            "<div id='checkListDiv'>",
            "<div class='queryBoxlabels'><label for='fields' >Attributes</label>",
            "<a id='selectAll' class='navigationRight navigable' data-search_name='Select All Attributes' href='javascript:void(0)'>Select All</a>",
            "<label> / </label>",
            "<a id='unselectAll' href='javascript:void(0)' class='navigable' data-search_name='UnSelect All Attributes' >Unselect All</a>",
            "</div>",
            "<div><ul id='fields' class='checklist'></ul></div>",
            "</div>"
        ].join('\n');

        var _docKeysListItemTemplate = "<li><label for='[0]'><input id='[1]' name='[2]' type='checkbox' checked=true />[3]</label></li>";

        var _queryFiltersTemplate = [
            "<div id='parametersDiv'>",
            "<label for='skip'> Skip(No. of records) </label><br/><input id='skip' type='text' name='skip' value='0' class='navigable' data-search_name='skip'/><br/>",
            "<label for='limit'> Max page size: </label><br/><span><select id='limit' name='limit' class='navigable' data-search_name='max limit'><option value='10'>10</option><option value='25'>25</option><option value='50'>50</option></select></span><br/>  ",
            "<label for='sort'> Sort by fields </label><br/><input id='sort' type='text' name='sort' value='_id:-1' class='navigable' data-search_name='sort'/><br/><br/>",
            "<button id='execQueryButton' class='bttn navigable' data-search_name='Execute Query'>Execute Query</button>",
            "</div>"
        ].join('\n');

        var _paginatorTemplate = [
            "<div id='paginator'>",
            "<a id='first' href='javascript:void(0)' data-search_name='First'>&laquo; First</a>",
            "<a id='prev'  href='javascript:void(0)' data-search_name='Previous'>&lsaquo; Previous</a>",
            "<label>Showing</label>", "<label id='startLabel'></label>", "<label> - </label>",
            "<label id='endLabel'></label>", "<label> of </label>", "<label id='countLabel'></label>",
            "<a id='next' href='javascript:void(0)' data-search_name='Next'>Next &rsaquo;</a>",
            "<a id='last' href='javascript:void(0)' data-search_name='Last'>Last &raquo;</a>",
            "</div>"
        ].join('\n');

        var getForm = function(showKeys) {
            if (showKeys) {
                return _queryTextTemplate.format(config.query) + _docKeysCheckListTemplate + _queryFiltersTemplate;
            } else {
                return _queryTextTemplate.format(config.query) + _queryFiltersTemplate;
            }
        };

        function _getKeys() {
            return cachedQueryParams.checkedFields;
        }

        showQueryBox();
        var areKeysLoaded = false;
        _executeQuery();

        function showQueryBox() {
            MV.clearHeader();
            document.getElementById('queryExecutor').style.display = 'block';
            var queryForm = Y.one('#queryForm');
            queryForm.addClass('form-cont');
            queryForm.set("innerHTML", getForm(config.showKeys));
            MV.mainBody.set("innerHTML", _paginatorTemplate);
            initListeners();
        }

        /**
         *The function is an event handler for the execute query button. It gets the query parameters from UI components
         *and sends a request to get the documents
         */
        function _executeQuery() {
            var queryParams = _getQueryParameters(false);
            _execute(queryParams);
        }

        /**
         *The function is an event handler for the execute query button. It gets the query parameters from cache
         *and sends a request to get the documents
         */
        function _executeCachedQuery() {
            var queryParams = _getQueryParameters(true);
            _execute(queryParams);
        }

        function _execute(queryParams) {
            sm.publish(sm.events.actionTriggered);
            var queryStr = "&query=[0]&limit=[1]&skip=[2]&fields=[3]&sortBy=[4]".format(
                encodeURIComponent(queryParams.query), queryParams.limit, queryParams.skip, queryParams.checkedFields, queryParams.sortBy);
            if (config.showKeys && !areKeysLoaded) {
                queryStr = queryStr + "&allKeys=true";
            }
            if (queryStr !== undefined) {
                MV.showLoadingPanel("Loading Documents...");
                Y.io(dataUrl, {
                    method: "GET",
                    data: queryStr,
                    on: {
                        success: function(request, responseObject) {
                            var jsonObject = MV.toJSON(responseObject);
                            var responseResult = MV.getResponseResult(jsonObject);
                            if (responseResult) {
                                //TotalCount may vary from request to request. so update the same in cache.
                                queryParams.totalCount = responseResult.count;
                                postExecuteQueryProcess(queryParams);
                                if (config.showKeys && !areKeysLoaded) {
                                    populateAllKeys();
                                }
                                //Update the pagination anchors accordingly
                                updateAnchors(responseResult.count, responseResult.editable);
                                successHandler(responseResult);
                                sm.publish(sm.events.queryExecuted);
                            } else {
                                MV.hideLoadingPanel();
                                var msg = "Could not execute query: " + MV.getErrorMessage(jsonObject);
                                MV.showAlertMessage(msg, MV.warnIcon, MV.getErrorCode(jsonObject));
                                Y.log(msg, "error");
                            }
                        },
                        failure: function(request, responseObject) {
                            MV.hideLoadingPanel();
                            MV.showServerErrorMessage(responseObject);
                        }
                    }
                });
            }
        }

        function populateAllKeys() {
            Y.io(keysUrl, {
                method: "GET",
                data: 'allKeys=true',
                on: {
                    success: function(ioId, responseObject) {
                        var jsonObject = MV.toJSON(responseObject);
                        var responseResult = MV.getResponseResult(jsonObject);
                        if(responseResult) {
                            var keys = responseResult.keys;
                            areKeysLoaded = true;
                            if (keys) {
                                _addKeys(keys);
                                cachedQueryParams.checkedFields = keys;
                            }
                        } else {
                            var msg = "Could not get the keys : " + MV.getErrorMessage(jsonObject);
                            MV.showAlertMessage(msg, MV.warnIcon, MV.getErrorCode(jsonObject));
                            Y.log(msg, "error");
                        }
                    },
                    failure: function(ioId, responseObject) {
                        MV.hideLoadingPanel();
                        MV.showServerErrorMessage(responseObject);
                    }
                }
            });
        }

        function _addKeys(keys) {
            var checkList = Y.one("#fields");
            for (var index = 0; index < keys.length; index++) {
                var listItem = _docKeysListItemTemplate.format(keys[index], keys[index], keys[index], keys[index]);
                checkList.appendChild(listItem);
            }
            return checkList;
        }

        function initListeners() {
            Y.on("click", _executeQuery, "#execQueryButton");
            Y.on("click", handleSelect, "#selectAll");
            Y.on("click", handleSelect, "#unselectAll");
            Y.on("click", handlePagination, "#first");
            Y.on("click", handlePagination, "#prev");
            Y.on("click", handlePagination, "#next");
            Y.on("click", handlePagination, "#last");
            Y.on("keyup", function(eventObject) {
                // insert a ctrl + enter listener for query evaluation
                if (eventObject.ctrlKey && eventObject.keyCode === 13) {
                    _executeQuery();
                }
            }, "#queryBox");
            Y.on("keyup", function(eventObject) {
                // insert a ctrl + enter listener for query evaluation on skip field
                if (eventObject.ctrlKey && eventObject.keyCode === 13) {
                    _executeQuery();
                }
            }, "#skip");
            Y.on("keyup", function(eventObject) {
                // insert a ctrl + enter listener for query evaluation on limit field
                if (eventObject.ctrlKey && eventObject.keyCode === 13) {
                    _executeQuery();
                }
            }, "#limit");
        }

        function handleSelect(event) {
            var id = event.currentTarget.get("id");
            var elements = Y.Selector.query('ul[id=fields] input');
            if (id === "selectAll") {
                Y.Array.each(elements, function(element) {
                    element.checked = true;
                });
            } else {
                Y.Array.each(elements, function(element) {
                    element.checked = false;
                });
            }
        }

        function handlePagination(event) {
            var href = event.currentTarget.get("href");
            if (href == null || href == undefined || href == "")
                return;
            var queryParameters = _getQueryParameters(true);
            var skipValue = queryParameters.skip, limitValue = queryParameters.limit, countValue = queryParameters.totalCount;
            var id = event.currentTarget.get("id");
            if (id === "first") {
                skipValue = 0;
            } else if (id === "prev") {
                skipValue = (skipValue - limitValue) < 0 ? 0 : (skipValue - limitValue);
            } else if (id === "next") {
                skipValue = skipValue + limitValue;
            } else if (id === "last") {
                var docCountInLastPage = (countValue % limitValue == 0) ? limitValue : (countValue % limitValue);
                skipValue = countValue - docCountInLastPage;
            }
            //update skip value in the cache query parameters
            queryParameters.skip = skipValue;
            _executeCachedQuery();
        }

        function updateAnchors(count, showPaginated) {
            var first = Y.one('#first'), prev = Y.one('#prev'), next = Y.one('#next'), last = Y.one('#last');
            var start = Y.one('#startLabel'), end = Y.one('#endLabel'), countLabel = Y.one('#countLabel');
            // Get the cached query parameter values
            var queryParameters = _getQueryParameters(true);
            var skipValue = queryParameters.skip, limitValue = queryParameters.limit;
            if (skipValue == 0 || skipValue >= count || !showPaginated)
                disableAnchor(first);
            else
                enableAnchor(first);
            if (skipValue >= count || skipValue + limitValue <= limitValue || !showPaginated)
                disableAnchor(prev);
            else
                enableAnchor(prev);
            if (skipValue >= count - limitValue || !showPaginated)
                disableAnchor(next);
            else
                enableAnchor(next);
            if (skipValue + limitValue >= count || !showPaginated)
                disableAnchor(last);
            else
                enableAnchor(last);
            //Check if the skip value is greater than the totalCount of resultSet for the executedQuery
            if (skipValue < count) {
                var size = showPaginated ? skipValue + limitValue : count;
                start.set('text', count != 0 ? skipValue + 1 : 0);
                end.set('text', count <= size ? count : skipValue + limitValue);
                countLabel.set('text', count);
            } else {
                start.set('text', 0);
                end.set('text', 0);
                countLabel.set('text', 0);
            }
        }

        function enableAnchor(obj) {
            obj.setAttribute('href', 'javascript:void(0)');
            obj.removeClass('disabledAnchor');
            obj.addClass('navigable');
            obj.addClass('enabledAnchor');
        }

        function disableAnchor(obj) {
            obj.removeAttribute('href');
            obj.removeClass('enabledAnchor');
            obj.addClass('disabledAnchor');
            obj.removeClass('navigable');
        }

        function getCommand(queryParams) {
            var commandStr = queryParams.query.substr(0, queryParams.query.indexOf("("));
            return commandStr.substr(commandStr.lastIndexOf(".") + 1);
        }

        /**
         * Stores the query parameters in the cache.
         * @param queryParams
         */
        function postExecuteQueryProcess(queryParams) {
            var command = getCommand(queryParams);
            if (command && (command === "find" || command === "findOne" || command === "runCommand")) {
                cachedQueryParams = queryParams;
            } else if (command === "drop") {
                Y.one("#" + MV.getDatabaseElementId(MV.appInfo.currentDB)).simulate("click");
            }
        }

        function _populateCheckedFields(queryParameters) {
            var fields = Y.all('#fields input'), item;
            for (var index = 0; index < fields.size(); index++) {
                item = fields.item(index);
                if (item.get("checked")) {
                    queryParameters.checkedFields.push(item.get("name"));
                }
            }
        }

        /**
         * This function gets the query parameters from the query box or cache.
         * @param fromCache fetches values from cache when true else from the query box
         * @returns {String} Query parameters
         *
         */
        function _getQueryParameters(fromCache) {
            if (fromCache) {
                return cachedQueryParams;
            } else {
                var queryParameters = { query: "", limit: 0, skip: 0, checkedFields: [], sortBy: "", totalCount: 0};
                queryParameters.query = Y.one('#queryBox').get("value").trim();
                queryParameters.limit = parseInt(Y.one('#limit').get("value"));
                queryParameters.skip = parseInt(Y.one('#skip').get("value").trim());
                queryParameters.sortBy = "{" + Y.one('#sort').get("value") + "}";
                //populate checked keys of a collection from UI
                _populateCheckedFields(queryParameters);
                if (queryParameters.query === "") {
                    queryParameters.query = "{}";
                }
                return queryParameters;
            }
        }

        return {
            executeQuery: function() {
                _executeQuery();
            },

            executeCachedQuery: function(selectAllFields) {
                if (selectAllFields) {
                    Y.one('#selectAll').simulate('click');
                    var queryParameters = _getQueryParameters(true);
                    _populateCheckedFields(queryParameters);
                }
                _executeCachedQuery();
            },

            adjustQueryParamsOnDelete: function(numberOfDocs) {
                var queryParams = _getQueryParameters(true);
                queryParams.totalCount = queryParams.totalCount - numberOfDocs;
                if (queryParams.totalCount != 0 && queryParams.skip == queryParams.totalCount) {
                    queryParams.skip = queryParams.skip - queryParams.limit;
                }
            },

            getKeys: function() {
                return _getKeys();
            },

            updateKeysList: function(keys) {
                return _addKeys(keys)
            }
        }
    };

    MV.hideQueryForm = function() {
        var queryForm = Y.one('#queryForm');
        queryForm.removeClass('form-cont');
        queryForm.set("innerHTML", "");
        document.getElementById('queryExecutor').style.display = 'none';
    };

}, '3.3.0', {
    requires: ["node-event-simulate"]
});
