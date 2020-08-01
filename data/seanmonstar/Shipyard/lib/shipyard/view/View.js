var Class = require('../class/Class'),
	Observable = require('../class/Observable'),
	computed = Observable.computed,
	Binding = require('../class/Binding'),
	ViewMediator = require('./ViewMediator'),
	dom = require('../dom'),
	assert = require('../error/assert'),
	logging = require('../logging'),
	overloadSetter = require('../utils/function').overloadSetter,
	array = require('../utils/array'),
	object = require('../utils/object'),
	type = require('../utils/type'),
	isString = type.isString,
	isFunction = type.isFunction,
	string = require('../utils/string');

// ViewMediator translates DOM Events into events that fire on the
// Views, and bubble up parentViews.
var mediator = null;

var log = logging.getLogger('shipyard.view.View');

/**
 *	View
 *
 *	View is a base class that handles rendering data from Models into
 *	HTML, and then emits events that make sense for each view. Views use
 *	a templating system to render themselves, allowing developers to
 *	override and completely customize the HTML of a View. However, the
 *	goal of the Shipyard View system is that most developers will no
 *	longer need to think about HTML at all.
 *
 *	## Use
 *
 *		var View = require('shipyard/view/View');
 *
 *		var v = new View({
 *			content: 'Hello'
 *		});
 *
 */
var View = module.exports = new Class({

	Extends: Observable,
	
	parentView: null,

	tag: 'span',

	id: null,

	template: require('./templates/base.ejs'),

	content: null,

	initialize: function View(options) {
		// Always set content after having set everything else
		// See https://github.com/seanmonstar/Shipyard/issues/52
		var content = options && options.content;
		if (content) {
			delete options.content;
		}
		
		this.parent(options);
        if (content) {
            this._silent(function setContent() {
                this.set('content', content);
            });
        }

		this._setupVisibilityBinding();
		this._setupClassNamesBindings();
		this._setupAttributeBindings();
		this._setupContentBinding();
		if (!this.get('id')) {
			this._silent(function setID() {
                this.set('id', string.uniqueID());
            });
		}
		if (!mediator) {
			mediator = new ViewMediator(null, this.constructor.__classNames[0]);
		}
		mediator.registerView(this);
	},

	render: function render() {
		assert(type.isFunction(this.template),
			'View requires a template function to render.');
		this.emit('preRender');
		this.rendered = this.template(this, this.getRenderHelpers());
		delete this._element;
		this.emit('render');
		return this.rendered;
	},

	getRenderHelpers: function getRenderHelpers() {
		var attrs = this._getAttributesMap();
		return {
			escape: function(text) {
				return String(text)
					.replace(/&(?!\w+;)/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/"/g, '&quot;');
			},
			attrs: function() {
				var buffer = [],
					escape = this.escape;
				for (var attr in attrs) {
					var val = attrs[attr];
					if (val) {
						if (typeof val === 'boolean') {
							buffer.push(' '+attr+'="'+attr+'"');
						} else {
							buffer.push(' '+attr+'="'+escape(val)+'"');
						}
					}
				}
				return buffer.join('');
			}
		};
	},

	invalidate: function() {
		if (this.rendered) {
			var oldEl = this.get('element');
			if (oldEl && oldEl.getParent()) {
				this.render();
				this._createElement().replace(oldEl);
				oldEl.destroy();
			} else {
				log.debug('Invalidate called, by element not in DOM.', this.get('id'));
			}
		}
		return this;
	},

	attach: function attach(where) {
		if (this.parentView) {
			throw new Error('Cannot attach Views that have parentViews.');
		}
		
		where = where || dom.document.body;
		dom.$(where).appendChild(this);

		return this;
	},

	detach: function detach() {
		if (this._element) {
			this._element.destroy();
		}
		return this;
	},

	show: function show() {
		this.set('isVisible', true);
	},

	hide: function hide() {
		this.set('isVisible', false);
	},

	isVisible: true,

	_setupVisibilityBinding: function() {
		this.observe('isVisible', function(isVisible) {
			var el = this.get('element');
			if (el) {
				el.setStyle('display', isVisible ? '' : 'none');
			}
		});
	},

	// Override _get and _set to NOT use the template function as a
	// getter/setter. It should simply override the property.
	// See https://github.com/seanmonstar/Shipyard/issues/39
	_set: function View_set(key, value) {
		if (key === 'template') {
			this.template = value;
		} else {
			this.parent(key, value);
		}
	},

	_get: function View_get(key) {
		if (key === 'template') {
			return this.template;
		} else {
			return this.parent(key);
		}
	},
	
	_createElement: function _createElement() {
		if (!this.rendered) {
			this.render();
		}
		var temp = new dom.Element('div');
		temp.set('html', this.rendered);
		var el = temp.getFirst();
		this.set('element', el);
		this.emit('elementCreated', el);
		return el;
	},

	toElement: function toElement() {
		return this.get('element') || this._createElement();
	},

	element: computed(function element(value) {
		if (arguments.length === 0) {
			//getter
			if (this.parentView && this.parentView.get('element')) {
				return this.parentView.get('element').find('#' + this.get('id'));
			}
			return this._element;
		} else {
			//setter
			this._element = dom.$(value);
		}
	}).canCache(false),

	toString: function toString() {
		return this.rendered || this.render();
		//return '[object View]';
	},

	__classNames: [],

	classNames: function(arr) {
		if (arguments.length) {
			this.__classNames = array.from(arr);
		} else {
			return this.constructor.__classNames.concat(this.__classNames);
		}
	},

	'class': function(cls) {
		if (arguments.length === 0) {
			// getter
			return this.get('classNames').join(' ');
		} else {
			// setter
			this.set('classNames', this.__classNames.concat(String(cls).split(' ')));
		}
	},

	_getAttributes: function _getAttributes() {
		return this.constructor.__attributes;
	},

	_getAttributesMap: function _getAttributesMap() {
		var attrMap = {};
		var attrs = this._getAttributes();
		attrs.forEach(function(attr) {
			attrMap[attr] = this.get(attr);
		}, this);
		if (this.get('isVisible') === false) {
			attrMap.style = 'display:none;';
		}
		return attrMap;
	},

	_setupAttributeBindings: function _setupAttributeBindings() {
		var attrs = this._getAttributes();
		attrs.forEach(function observeAttr(attr) {
			this.observe(attr, function(value) {
				var el = this.get('element');
				if (el) {
					el.set(attr, value);
				}
			});
		}, this);
	},

	_setupClassNamesBindings: function _setupClassNamesBindings() {
		var view = this;
		var classNames = this.get('classNames');

		classNames.forEach(function(name) {
			function classNameString(val) {
				return val === true ? name._keys[0] : val;
			}

			function computedClass(newVal, oldVal) {
				var el = this.get('element');
				if (!el) {
					return;
				}
				if (oldVal) {
					el.removeClass(classNameString(oldVal));
				}
				if (newVal) {
					el.addClass(classNameString(newVal));
				}
			}
			if (type.isFunction(name) && name.isProperty) {
				// a computed classname
				assert(name._keys.length === 1, 'Computed classNames can only depend on one property');

				view.observe(name._keys[0], computedClass);
				name.toString = function() {
					var currVal = name.call(view);
					if (currVal) {
						return classNameString(currVal);
					} else {
						return '';
					}
				};
			}
		});
	},

	_setupContentBinding: function _setupContentBinding() {
		this.observe('content', function() {
			// it would be easy to do element.set('text', content), but
			// with templates we don't know if the content should
			// actually go a couple elements deep.
			if (this.rendered) {
				this.invalidate();
			}
		});
	}

});


// Mutators
View.__attributes = ['id', 'class'];
View.defineMutator('attributes', function(attrs) {
	assert(isString(attrs) || (attrs.every && attrs.every(isString)),
		'View.attributes must a string or Array of strings.');
	this.__attributes = this.__attributes.concat(attrs);
});

function isValidClassNames(classes) {
	return isString(classes) || (classes.every && classes.every(function(c) {
		return isString(c) || (isFunction(c) && c.isProperty);
	}));
}

View.__classNames = ['shipyard-view'];
View.defineMutator('classNames', function(classes) {
	assert(isValidClassNames(classes),
		'View.classNames must a string or Array of strings.');
	this.__classNames = this.__classNames.concat(classes);
});
