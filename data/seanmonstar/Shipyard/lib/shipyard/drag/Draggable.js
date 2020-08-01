// Parts copied or inspired by MooTools (http://mootools.net)
// - MIT Licence
var Class = require('../class/Class'),
	Events = require('../class/Events'),
	Options = require('../class/Options'),
	dom = require('../dom'),
	_dim = require('../dom/element/dimensions'),
	env = require('../env'),
	typeOf = require('../utils/type').typeOf;



var ondragstartFixed = false;

module.exports = new Class({

	Implements: [Events, Options],

	options: {/*
		onBeforeStart: function(thisElement) {},
		onStart: function(thisElement, event) {},
		onSnap: function(thisElement) {},
		onDrag: function(thisElement, event) {},
		onCancel: function(thisElement) {},
		onEnter: function(thisElement, overed) {},
		onLeave: function(thisElement, overed) {},
		onDrop: function(thisElement, overed, event) {},
		onComplete: function(thisElement, event) {},*/
		snap: 6,
		unit: 'px',
		grid: false,
		style: true,
		limit: false,
		handle: false,
		invert: false,
		preventDefault: false,
		stopPropagation: false,
		modifiers: {
			x: 'left',
			y: 'top'
		},
		droppables: [],
		container: false,
		checkDroppables: true
	},

	overed: null,

	initialize: function(element, options) {
		this.element = element = dom.$(element);
		this.setOptions(options);
		var htype = typeOf(this.options.handle);
		this.handles = ((htype === 'array') ? dom.$$(this.options.handle) : dom.$(this.options.handle)) || this.element;
		this.droppables = dom.$$(this.options.droppables);
		this.container = dom.$(this.options.container);
		this.mouse = {'now': {}, 'pos': {}};
		this.value = {'start': {}, 'now': {}};

		this.selection = (env.browser.ie) ? 'selectstart' : 'mousedown';

		var movementsDirs = ['left', 'top', 'bottom', 'right'],
			x = this.options.modifiers.x,
			y = this.options.modifiers.y,
			isDirectional = (movementsDirs.indexOf(x) >= 0) || (movementsDirs.indexOf(y) >= 0);

		if (isDirectional && this.element.getStyle('position') === 'static') {

			var parent = element.getOffsetParent(),
				styles = element.getStyles('left', 'top');
			if (parent && (styles.left === 'auto' || styles.top === 'auto')) {
				element.setPosition(element.getPosition(parent));
			}

			this.element.setStyle('position', 'absolute');
		}

		if (env.browser.ie && !ondragstartFixed) {
			dom.document.getNode().ondragstart = function() { return false; };
			ondragstartFixed = true;
		}

		this.bound = {
			start: this.start.bind(this),
			check: this.check.bind(this),
			drag: this.drag.bind(this),
			stop: this.stop.bind(this),
			cancel: this.cancel.bind(this),
			eventStop: function() { return false; }
		};
		this.attach();
	},

	attach: function() {
		this.handles.addListener('mousedown', this.bound.start);
		return this;
	},

	detach: function() {
		this.handles.removeListener('mousedown', this.bound.start);
		return this;
	},

	start: function(event) {
		var options = this.options;
		if (event.rightClick) {
			return;
		}

		if (options.preventDefault) {
			event.preventDefault();
		}
		if (options.stopPropagation) {
			event.stopPropagation();
		}

		if (this.container) {
			this.options.limit = this.calculateLimit();
		}

		this.mouse.start = event.page;

		this.emit('beforeStart', this.element);

		var limit = options.limit;
		this.limit = {x: [], y: []};

		var z, coordinates;
		for (z in options.modifiers) {
			if (!options.modifiers[z]) {
				continue;
			}

			var style = this.element.getStyle(options.modifiers[z]);

			// Some browsers (IE and Opera) don't always return pixels.
			if (style && !style.match(/px$/)) {
				if (!coordinates) {
					coordinates = this.element.getCoordinates(this.element.getOffsetParent());
				}
				style = coordinates[options.modifiers[z]];
			}

			if (options.style) {
				this.value.now[z] = parseInt(style || 0, 10);
			} else {
				this.value.now[z] = this.element[options.modifiers[z]];
			}

			if (options.invert) {
				this.value.now[z] *= -1;
			}

			this.mouse.pos[z] = event.page[z] - this.value.now[z];

			if (limit && limit[z]) {
				var i = 2;
				while (i--) {
					var limitZI = limit[z][i];
					if (limitZI || limitZI === 0) {
						this.limit[z][i] = (typeof limitZI === 'function') ? limitZI() : limitZI;
					}
				}
			}
		}

		if (typeOf(this.options.grid) === 'number') {
			this.options.grid = {
				x: this.options.grid,
				y: this.options.grid
			};
		}

		var events = {
			mousemove: this.bound.check,
			mouseup: this.bound.cancel
		};
		events[this.selection] = this.bound.eventStop;
		dom.document.addListeners(events);
	},

	check: function(event) {
		if (this.options.preventDefault) {
			event.preventDefault();
		}
		var distance = Math.round(Math.sqrt(Math.pow(event.page.x - this.mouse.start.x, 2) + Math.pow(event.page.y - this.mouse.start.y, 2)));
		if (distance > this.options.snap) {
			this.cancel();
			dom.document.addListeners({
				mousemove: this.bound.drag,
				mouseup: this.bound.stop
			});
			this.checkDroppables();
			this.emit('start', this.element, event);
			this.emit('snap', this.element);
		}
	},

	drag: function(event) {
		var options = this.options;

		if (options.preventDefault) {
			event.preventDefault();
		}
		this.mouse.now = event.page;

		for (var z in options.modifiers) {
			if (!options.modifiers[z]) {
				continue;
			}
			this.value.now[z] = this.mouse.now[z] - this.mouse.pos[z];

			if (options.invert) {
				this.value.now[z] *= -1;
			}

			if (options.limit && this.limit[z]) {
				if ((this.limit[z][1] || this.limit[z][1] === 0) && (this.value.now[z] > this.limit[z][1])) {
					this.value.now[z] = this.limit[z][1];
				} else if ((this.limit[z][0] || this.limit[z][0] === 0) && (this.value.now[z] < this.limit[z][0])) {
					this.value.now[z] = this.limit[z][0];
				}
			}

			if (options.grid[z]) {
				this.value.now[z] -= ((this.value.now[z] - (this.limit[z][0]||0)) % options.grid[z]);
			}

			if (options.style) {
				this.element.setStyle(options.modifiers[z], this.value.now[z] + options.unit);
			} else {
				this.element.set(options.modifiers[z], this.value.now[z]);
			}
		}

		this.emit('drag', this.element, event);

		if (options.checkDroppables && this.droppables.length) {
			this.checkDroppables();
		}
	},

	cancel: function(event) {
		dom.document.removeListeners({
			mousemove: this.bound.check,
			mouseup: this.bound.cancel
		});
		if (event) {
			dom.document.removeListener(this.selection, this.bound.eventStop);
			this.emit('cancel', this.element);
		}
	},

	stop: function(event) {
		this.checkDroppables();
		this.emit('drop', this.element, this.overed, event);
		this.overed = null;

		var events = {
			mousemove: this.bound.drag,
			mouseup: this.bound.stop
		};
		events[this.selection] = this.bound.eventStop;
		dom.document.removeListeners(events);
		if (event) {
			this.emit('complete', this.element, event);
		}
	},

	calculateLimit: function(){
		var element = this.element,
			container = this.container,

			offsetParent = dom.$(element.getOffsetParent()) || dom.document.body,
			containerCoordinates = container.getCoordinates(offsetParent),
			elementMargin = {},
			elementBorder = {},
			containerMargin = {},
			containerBorder = {},
			offsetParentPadding = {};

		['top', 'right', 'bottom', 'left'].forEach(function(pad){
			elementMargin[pad] = parseInt(element.getStyle('margin-' + pad), 10);
			elementBorder[pad] = parseInt(element.getStyle('border-' + pad), 10);
			containerMargin[pad] = parseInt(container.getStyle('margin-' + pad), 10);
			containerBorder[pad] = parseInt(container.getStyle('border-' + pad), 10);
			offsetParentPadding[pad] = parseInt(offsetParent.getStyle('padding-' + pad), 10);
		}, this);

		var width = element.offsetWidth + elementMargin.left + elementMargin.right,
			height = element.offsetHeight + elementMargin.top + elementMargin.bottom,
			left = 0,
			top = 0,
			right = containerCoordinates.right - containerBorder.right - width,
			bottom = containerCoordinates.bottom - containerBorder.bottom - height;

		if (this.options.includeMargins){
			left += elementMargin.left;
			top += elementMargin.top;
		} else {
			right += elementMargin.right;
			bottom += elementMargin.bottom;
		}

		if (element.getStyle('position') === 'relative'){
			var coords = element.getCoordinates(offsetParent);
			coords.left -= parseInt(element.getStyle('left'), 10);
			coords.top -= parseInt(element.getStyle('top'), 10);

			left -= coords.left;
			top -= coords.top;
			if (container.getStyle('position') !== 'relative'){
				left += containerBorder.left;
				top += containerBorder.top;
			}
			right += elementMargin.left - coords.left;
			bottom += elementMargin.top - coords.top;

			if (container !== offsetParent){
				left += containerMargin.left + offsetParentPadding.left;
				top += containerMargin.top + offsetParentPadding.top;
			}
		} else {
			left -= elementMargin.left;
			top -= elementMargin.top;
			if (container !== offsetParent){
				left += containerCoordinates.left + containerBorder.left;
				top += containerCoordinates.top + containerBorder.top;
			}
		}

		return {
			x: [left, right],
			y: [top, bottom]
		};
	},

	getDroppableCoordinates: function(element){
		var position = element.getCoordinates();
		if (element.getStyle('position') === 'fixed'){
			var scroll = dom.window.getScroll();
			position.left += scroll.x;
			position.right += scroll.x;
			position.top += scroll.y;
			position.bottom += scroll.y;
		}
		return position;
	},

	checkDroppables: function(){
		var overed = this.droppables.filter(function(el, i){
			el = this.positions ? this.positions[i] : this.getDroppableCoordinates(el);
			var now = this.mouse.now;
			return (now.x > el.left && now.x < el.right && now.y < el.bottom && now.y > el.top);
		}, this).pop();

		if (this.overed !== overed){
			if (this.overed) {
				this.emit('leave', this.element, this.overed);
			}
			if (overed) {
				this.emit('enter', this.element, overed);
			}
			this.overed = overed;
		}
	}

});
