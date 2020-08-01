
define(function(require, exports, module) {
    'use strict';
    var Surface          = require('famous/core/Surface');
    var RenderNode       = require('famous/core/RenderNode');
    var StateModifier    = require('famous/modifiers/StateModifier');
    var InputSurface     = require('famous/surfaces/InputSurface');
    var FlexibleLayout   = require('famous/views/FlexibleLayout');
    var GridLayout       = require('famous/views/GridLayout');
    var ScrollContainer  = require('famous/views/ScrollContainer');
    var RenderController = require('famous/views/RenderController');

    var Transform = require('famous/core/Transform');

    var LocationEntry     = require('widgets/LocationEntry');
    var RecentSearchEntry = require('widgets/RecentSearchEntry');

    var View         = require('prototypes/View');

    function Search() {
        View.apply(this, arguments);

        _createLayout.call(this);

        _createFavouritesButton.call(this);
        _createInstructionalText.call(this);
        _createSearchInput.call(this);
        _createSearchButtons.call(this);
        _createMessageArea.call(this);
        _createList.call(this);

        _setupBindings.call(this);
    }

    Search.prototype = Object.create(View.prototype);
    Search.prototype.constructor = Search;

    Search.DEFAULT_OPTIONS = {
        contentPadding: 10,
        contollerOpts: {
            inTransition: { duration: 500, curve: 'easeOut' },
            outTransition: { duration: 500, curve: 'easeOut' },
            overlap: true
        }
    };

    function _createLayout() {
        var layout = new FlexibleLayout({
            direction: 1,
            ratios: [true, true, true, true, true, 1]
        });

        this.surfaces = [];

        layout.sequenceFrom(this.surfaces);

        this.add(layout);
    }

    function _createFavouritesButton() {
        this.favouritesButton = new Surface({
            content: '\u2605',
            size: [60, 40],
            properties: {
                fontSize: '25px',
                color: 'white',
                lineHeight: '40px',
                textAlign: 'center'
            }
        });

        this.favouritesButton.on('click', function() {
            self._model.goToFavourites();
        }.bind(this));

        var layoutNode = new RenderNode();

        var positionModifier = new StateModifier({
            origin: [1,0],
            align: [1, -1],
            transform: Transform.translate(0, -40, 0)
        });
        var parentSizeModifier = new StateModifier({
            size: [undefined, 0]
        });

        layoutNode.add(parentSizeModifier).add(positionModifier).add(this.favouritesButton);

        this.surfaces.push(layoutNode);
    }

    function _createInstructionalText() {

        var surface = new Surface({
            size: [undefined, 100],
            content: 'Use the form below to search for houses to buy. '
                + 'You can search by place-name, postcode, or click \'My location\', '
                + 'to search in your current location!',
            properties: {
                padding: this.options.contentPadding + 'px'
            }
        });

        this.surfaces.push(surface);
    }

    function _createSearchInput() {
        this.searchInput = new InputSurface({
            size: [undefined, 40],
            placeholder: 'Search',
            type: 'search',
            properties: {
                border: '1px solid #C8C8C8',
                borderWidth: '1px 0',
                padding: this.options.contentPadding + 'px'
            }
        });

        this.surfaces.push(this.searchInput);
    }

    function _createSearchButtons() {
        var layout = new GridLayout({
            dimensions: [2,1]
        });

        var buttons = [];

        layout.sequenceFrom(buttons);

        this.searchButton = new Surface({
            content: 'Go',
            properties: {
                backgroundColor: '#4EE',
                lineHeight: '40px',
                textAlign: 'center'
            }
        });
        this.searchButton.on('click', function() {
            var searchText = this.searchInput.getValue();
            this._model.performTextSearch(searchText);
        }.bind(this));

        buttons.push(this.searchButton);

        this.geoSearchButton = new Surface({
            content: 'My Location',
            properties: {
                backgroundColor: '#b8f',
                lineHeight: '40px',
                textAlign: 'center'
            }
        });
        this.geoSearchButton.on('click', function() {
            this._model.performGeoSearch();
        }.bind(this));

        buttons.push(this.geoSearchButton);

        var layoutNode = new RenderNode();

        var modifier = new StateModifier({
            size: [undefined, 40]
        });

        layoutNode.add(modifier).add(layout);

        this.surfaces.push(layoutNode);
    }

    function _createMessageArea() {

        this._messageArea = new RenderController(this.options.contollerOpts);

        var modifier = new StateModifier({
            size: [undefined, 50]
        });

        var node = new RenderNode();
        node.add(modifier).add(this._messageArea);

        this.surfaces.push(node);
    }

    function _createList() {
        var scrollContainer = new ScrollContainer({
            scrollview: {direction: 1}
        });

        this._items = [];

        scrollContainer.sequenceFrom(this._items);

        this.surfaces.push(scrollContainer);
    }

    function _setupBindings() {
        this._modelEvents.on('bound-model', _modelBound.bind(this));
        this._modelEvents.on('show-locations', _showLocations.bind(this));
        this._modelEvents.on('show-message', _showMessage.bind(this));
        this._modelEvents.on('show-recentsearch', _showRecentSearches.bind(this));
        this._modelEvents.on('update-recentsearches', _updateListing.bind(this));
    }

    function _modelBound() {
        _showRecentSearches.call(this);
    }

    function _showRecentSearches() {
        var model = this._model;

        var label = new Surface({
            content: 'Recent searches:',
            properties: {
                color: '#888',
                fontSize: '16px',
                lineHeight: '25px',
                padding: this.options.contentPadding + 'px'
            }
        });

        var modifier = new StateModifier({
            size: [undefined, 45],
            origin: [0.5, 1]
        });

        var node = new RenderNode();
        node.add(modifier).add(label);

        this._messageArea.show(node);

        _updateListing.call(this, model.recentSearches());
    }

    function _showMessage(options) {
        var label = new Surface({
            content: options.message,
            properties: {
                color: '#e51c23',
                fontSize: '12px',
                lineHeight: '16px',
                padding: this.options.contentPadding + 'px',
                textAlign: 'center'
            }
        });

        var modifier = new StateModifier({
            size: [undefined, 45],
            origin: [0.5, 1]
        });

        var node = new RenderNode();
        node.add(modifier).add(label);

        this._messageArea.show(node);

        //Clear all items
        this._items.splice(0,this._items.length);
    }

    function _showLocations(locations) {
        var label = new Surface({
            content: 'Please select a location below:',
            properties: {
                color: '#888',
                fontSize: '16px',
                lineHeight: '25px',
                padding: this.options.contentPadding + 'px'
            }
        });

        var modifier = new StateModifier({
            size: [undefined, 45],
            origin: [0.5, 1]
        });

        var node = new RenderNode();
        node.add(modifier).add(label);

        this._messageArea.show(node);

        //Clear all items
        this._items.splice(0,this._items.length);
        locations.forEach(function(item) {
            var entry = new LocationEntry({
                query: item.place_name,
                size: [undefined, 40],
                title: item.title
            });

            entry.on('select-location', function(options) {
                this._model.performLocationSearch(options.query);
            }.bind(this));

            this._items.push(entry);

        }, this);
    }

    function _updateListing(recentSearches) {
        //Clear all items
        this._items.splice(0,this._items.length);

        var itemsToDisplayLimit = Math.min(recentSearches.length, 5);

        function recentSearchSelected(options) {
            this._model.performRecentSearch(options.query);
        }

        for (var i = 0; i < itemsToDisplayLimit; i++) {
            var item = recentSearches[i];
            var button = new RecentSearchEntry({
                count: item.total,
                query: item.query,
                size: [undefined, 40],
                title: item.title
            });

            button.on('select-recentsearch', recentSearchSelected.bind(this));

            this._items.push(button);
        }
    }

    module.exports = Search;
});
