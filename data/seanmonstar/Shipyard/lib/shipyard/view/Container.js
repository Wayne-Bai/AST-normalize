var Class = require('../class/Class'),
	ObservableArray = require('../class/ObservableArray'),
	View = require('./View'),
	assert = require('../error/assert'),
	object = require('../utils/object');

var SLICE = Array.prototype.slice;

var Container = module.exports = new Class({

	Extends: View,

	tag: 'div',

	classNames: ['shipyard-container'],

	template: require('./templates/container.ejs'),

	childViews: [],
	
	initialize: function Container(params) {
		var container = this;
		var childViews = new ObservableArray();
		childViews.observe('array', function onArrayChange() {
			container.__onChildViewsChange.apply(container, arguments);
		});
		this.childViews = childViews;
		this.set('childViews', childViews);
		this.parent(params);
	},

	addView: function addView(child, index) {
		assert(child !== this, 'Cannot add view to itself!');
		assert(child instanceof View,
			'Container.addView requires a View instance argument.');
		
		if (typeof index === 'undefined') {
			index = this.childViews.length;
		}
		this.childViews.splice(index, 0, child);
		return this;
	},

	removeView: function removeView(child) {
		var index = this.childViews.indexOf(child);
		if (index >= 0) {
			this.childViews.splice(index, 1);
		}
		return this;
	},

	getRenderHelpers: function getRenderHelpers() {
		var views = this.childViews;
		return object.merge(this.parent(), {
			//views: this.childViews,
			children: function children() {
				return views.map(function children_map_render(child) {
					return child.render();
				}, this).join('');
			}
		});
	},

	onElementCreated: function _emitToChildViews() {
		this.childViews.forEach(function(child) {
			child.emit('elementCreated');
		});
	},

	__onChildViewsChange: function __onChildViewsChange(index, removed, added) {
		var child;
		if (removed.length) {
			for (var r = 0; r < removed.length; r++) {
				child = removed[r];
				child.set('parentView', undefined);
				this.emit('childRemoved', child);
			}
		}

		if (added.length) {
			for (var a = 0; a < added.length; a++) {
				child = added[a];
				if (child.parentView) {
					child.parentView.removeView(child);
				}
				child.set('parentView', this);
				this.emit('childAdded', child);
			}
		}
		
		if (this.rendered) {
			this.invalidate();
		}
	},

	_setupContentBinding: function _noop() {
	
	}

});

Container.defineSetter('childViews', function(arr) {
	var childViews = this.get('childViews');
	var args = [0, childViews.length].concat(SLICE.call(arr));
	childViews.splice.apply(childViews, args);
});
