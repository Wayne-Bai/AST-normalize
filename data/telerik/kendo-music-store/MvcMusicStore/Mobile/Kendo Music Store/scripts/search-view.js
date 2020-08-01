define(["jQuery", "kendo", "config", "utils", "data", "cart", "albums"], function ($, kendo, config, utils, data, cart, albums) {
    var _viewElement,
        
        _buildSearchFilter = function (term) {
            return {
                logic: "or",
                filters: [
                    {field: "Title", operator: "contains", value: term},
                    {field: "Artist.Name", operator: "contains", value: term}
                ]
            };
        },

        submitSearch = function () {
            var filter;
            var listViewElement = $("#search-listview");
            var existingListView = listViewElement.data().kendoMobileListView;
            var viewModel = kendo.observable($.extend({
                results: data.searchList
            }, albums.baseAlbumViewModel));

            if(existingListView) {
                existingListView.destroy();
            }

            utils.scrollViewToTop(_viewElement);

            filter = _buildSearchFilter(_viewElement.find(".search-text").val());
            data.searchList.filter(filter);

            kendo.bind(listViewElement, viewModel, kendo.mobile.ui);
        },
        
        show = function (showEvent) {
            var resultsListView = showEvent.view.element.find(".km-listview").data("kendoMobileListView");
            if(resultsListView) {
                resultsListView.refresh();
            }
        };

    return {
        init: function (initEvent) {
            _viewElement = initEvent.sender.element;
            _viewElement.find(".search-text").change(submitSearch);
        },

        show: show,
        submitSearch: submitSearch
    }
});