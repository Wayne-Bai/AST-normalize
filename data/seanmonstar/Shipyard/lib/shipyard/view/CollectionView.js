var Class = require('../class/Class'),
	ObservableArray = require('../class/ObservableArray'),
	object = require('../utils/object'),
	View = require('./View'),
	Container = require('./Container'),
	property = Container.computed;

var SLICE = Array.prototype.slice;
// Always attach an observer for content.array when content changes
var contentObsKey = '__collectionViewContentArrObs';


var CollectionView = module.exports = new Class({

	Extends: Container,

	classNames: ['shipyard-collection'],

	// An ObservableArray of content
	content: null,

	emptyView: View,

	itemView: View,

	itemViewOptions: {
		tag: 'span'
	},

	initialize: function CollectionView(options) {
		this.parent(options);
		if (!this.get('content')) {
			this._silent(function setArray() {
                this.set('content', []);
            });
		}
        // since construction is silent, we should bind to content
        // manually this time
        this.__onContentChange(this.get('content'));
	},

	isEmpty: property(function isEmpty() {
		var content = this.get('content');
		return !(content && content.length);
	}, 'content'),

	addItem: function addItem(item) {
		this.get('content').push(item);
		return this;
	},

	// Called by content.array observer
	_addItem: function _addItem(item, index) {
		var view = this.createChildView(item);
		this.addView(view, index);
		return this;
	},

	removeItem: function removeItem(item) {
		var content = this.get('content');
		var index = content.indexOf(item);
		if (index !== -1) {
			content.splice(index, 1);
		}
		return this;
	},

    onContentChange: function onContentChange() {
        this.__onContentChange.apply(this, arguments);
    },

	__onContentChange: function __onContentChange(newVal, oldVal) {
		var view = this;
		var observeArrayDeeply = false;

		if (this[contentObsKey]) {
			this[contentObsKey].detach();
		}

		if (newVal) {
			this[contentObsKey] = newVal.observe('array', function() {
				view.__onContentArrayChange.apply(view, [this].concat(SLICE.call(arguments)));
			}, observeArrayDeeply);
		} else {
			delete this[contentObsKey];
		}

		this.__onContentArrayChange(newVal, 0, oldVal || [], newVal || []);
	},

	__onContentArrayChange: function __onContentArrayChange(array, index, removed, added) {
		// 3 paths
		// add, remove, and replace
		var removedViews = [];
		var addedViews = [];

		if (added.length) {
			for (var a = 0; a < added.length; a++) {
				var v = this.createChildView(added[a]);
				addedViews.push(v);
			}
		}

		var args = [index, removed.length].concat(addedViews);
		this.childViews.splice.apply(this.childViews, args);
	},

	createChildView: function createChildView(item) {
		var ViewClass = this.get('itemView');
		var options = this.get('itemViewOptions');
		options.content = item;
		var view = new ViewClass(options);
		delete options.content;
		return view;
	},

	getRenderOptions: function getRenderOptions() {
		var opts = this.parent(),
			view = this;
		opts.isEmpty = function isEmpty() { return view.isEmpty(); };
		return opts;
	},

	_setupContentBinding: function noop() {
		//override from View, we don't want to invalidate when content
		//changes
	}

});




CollectionView.defineSetter('content', function(content) {
	if (content && !(content instanceof ObservableArray)) {
		content = new ObservableArray(content);
	}
	this.content = content;
});

CollectionView.defineSetter('itemViewOptions', function(options) {
	object.merge(this.itemViewOptions, options);
});
