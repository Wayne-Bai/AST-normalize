/** 
 * Sponsored by Storify.com
 *
 * Find more about the scrolling function at
 * http://cubiq.org/iscroll
 *
 * Copyright (c) 2010 Storify
 *
 * @author Matteo Spinelli, http://cubiq.org/
 *
 * Released under MIT license
 * http://cubiq.org/dropbox/mit-license.txt
 * 
 * Based on iScroll v3.6
 * 
 */

(function(){

function dnd (options) {
	var that = this, i, l, el;

	// Default options
	that.options = {
		onDragEnd: null,
		onActiveContainerChange: null,
		onThrowAway: null
	};
	
	// User defined options
	if (typeof options == 'object') {
		for (i in options) {
			that.options[i] = options[i];
		}
	}

	that.draggables = [];

	that.draghelp = document.getElementById('draghelp');
	that.draghelp.style.webkitTransitionProperty = '-webkit-transform';
	that.draghelp.style.webkitTransitionDuration = '0';
	that.draghelp.style.webkitTransform = translateOpen + '0,0' + translateClose;

	that.containers = document.querySelectorAll('.draggable');
	for (i=0, l=that.containers.length; i<l; i++) {
		that.containers[i]._x1 = 0;
		that.containers[i]._y1 = 0;

		el = that.containers[i];
		do {
			that.containers[i]._x1 += el.offsetLeft;
			that.containers[i]._y1 += el.offsetTop;
		} while (el = el.offsetParent);

		that.containers[i]._x2 = that.containers[i]._x1 + that.containers[i].parentNode.offsetWidth;
		that.containers[i]._y2 = that.containers[i]._y1 + that.containers[i].parentNode.offsetHeight;
	}

	document.addEventListener('touchmove', that, false);
	document.addEventListener('touchend', that, false);

	that.refresh(true);
}

dnd.prototype = {
	refresh: function (initOrder) {
		var that = this, i, l, j, k, el, count;

		for (i=0, l=that.containers.length; i<l; i++) {
			count = 0;
			el = that.containers[i].childNodes;
			that.draggables[i] = [];
			if (initOrder) {
				that.containers[i]._order = '';
			}
			
			for (j=0, k=el.length; j<k; j++) {
				if (el[j].nodeType == 1) {
					that.draggables[i][count] = el[j];

					// Used to check element order changes
					if (initOrder) {
						that.containers[i]._order += count + ',';
						that.draggables[i][count]._order = count;
					}

					that.draggables[i][count]._pos = {
						x1: that.containers[i]._x1 + el[j].offsetLeft,
						x2: that.containers[i]._x1 + el[j].offsetLeft + el[j].offsetWidth,
						y1: that.containers[i]._y1 + el[j].offsetTop,
						y2: that.containers[i]._y1 + el[j].offsetTop + el[j].offsetHeight
					};

					count++;
				}
			}
		}
	},
		
	handleEvent: function (e) {
		var that = this;

		switch (e.type) {
			case 'touchmove':
				that.dragMove(e);
				break;
			case 'touchend':
				that.dragEnd(e);
				break;
		}
	},
	
	initDrag: function (e) {
		var that = this,
			target = e.changedTouches[0].target,
			helperX = e.changedTouches[0].pageX,
			helperY = e.changedTouches[0].pageY,
			i, l;

		// Find draggable object
		do {
			if (target.tagName == 'LI' ) {
				break;
			}
		} while (target = target.parentNode);

		if (!target) {
			return;
		}

		for (i=0, l=that.containers.length; i<l; i++) {
			if (helperX > that.containers[i]._x1 && helperX < that.containers[i]._x2 && helperY > that.containers[i]._y1 && helperY < that.containers[i]._y2) {
				that.activeContainer = i;
				break;
			}
		}

		that.startContainer = that.activeContainer;
		that.activeDraggable = target;

		// Prepare the drag helper object
		that.draghelp.innerHTML = target.outerHTML;

		// Hide the original object
		that.activeDraggable.className += 'activeDraggable';

		that.draghelp.className = that.containers[that.activeContainer].className.replace(/(^|\s)draggable(\s|$)/gi, '');

		// Center the object under your finger
		helperX-= (that.draghelp.offsetWidth/2);
		helperY-= (that.draghelp.offsetHeight/2);

		that.draghelp.style.webkitTransform = translateOpen + helperX + 'px,' + helperY + 'px' + translateClose;

		// Show the object and start dragging
		that.draghelp.style.visibility = 'visible';

		that.dragging = true;
	},

	dragMove: function (e) {
		var that = this,
			pageX = e.changedTouches[0].pageX,
			pageY = e.changedTouches[0].pageY,
			helperX = pageX - (that.draghelp.offsetWidth/2),
			helperY = pageY - (that.draghelp.offsetHeight/2),
			offsetX = pageX,
			offsetY = pageY,
			i,l;

//		e.preventDefault();
//		e.stopPropagation();

		if (!that.activeDraggable) {
			that.initDrag(e);
		}

		if (!that.dragging) {
			return;
		}

		for (i=0, l=that.containers.length; i<l; i++) {
			if (pageX > that.containers[i]._x1 && pageX < that.containers[i]._x2 && pageY > that.containers[i]._y1 && pageY < that.containers[i]._y2) {
				that.activeContainer = i;
				break;
			}
		}

/*
		if (that.options.onActiveContainerChange && that.activeContainer !== that.oldActiveContainer) {
			that.options.onActiveContainerChange.call(that, that.containers[that.activeContainer], that.containers[that.oldActiveContainer]);
			that.oldActiveContainer = that.activeContainer;
		}
*/
		
		if (that.activeContainer === undefined || !that.dragging) {
			return;
		}

		that.draghelp.style.webkitTransform = translateOpen + helperX + 'px,' + helperY + 'px' + translateClose;

		offsetX -= that.containers[that.activeContainer].parentNode._scrollerX;
		offsetY -= that.containers[that.activeContainer].parentNode._scrollerY;

		if (pageX < that.containers[that.activeContainer]._x1 ||
				pageX > that.containers[that.activeContainer]._x2 ||
				pageY < that.containers[that.activeContainer]._y1 ||
				pageY > that.containers[that.activeContainer]._y2) {
			
			that.throwAway = true;
			return;
		}
		that.throwAway = false;

		// Find the underling object
		for (i=0,l=that.draggables[that.activeContainer].length; i<l; i++) {
			if (that.activeDraggable != that.draggables[that.activeContainer][i] &&
					offsetX > that.draggables[that.activeContainer][i]._pos.x1 &&
					offsetX < that.draggables[that.activeContainer][i]._pos.x2 &&
					offsetY > that.draggables[that.activeContainer][i]._pos.y1 &&
					offsetY < that.draggables[that.activeContainer][i]._pos.y2) {

				if (that.draggables[that.activeContainer][i]._pos.y1 >= that.activeDraggable._pos.y1) {
					if (that.draggables[that.activeContainer][i].nextSibling) {
						that.draggables[that.activeContainer][i].parentNode.insertBefore(that.activeDraggable, that.draggables[that.activeContainer][i].nextSibling);
					} else {
						that.draggables[that.activeContainer][i].parentNode.appendChild(that.activeDraggable);
					}
				} else {
					that.draggables[that.activeContainer][i].parentNode.insertBefore(that.activeDraggable, that.draggables[that.activeContainer][i]);
				}

				that.refresh();
				return;
			}
		}

		for (i=0,l=that.draggables[that.activeContainer].length; i<l; i++) {
			if (that.activeDraggable == that.draggables[that.activeContainer][i]) {
				return;
			}
		}

		that.activeDraggable = that.containers[that.activeContainer].appendChild(that.activeDraggable);
		that.refresh();
	},
	
	removeElement: function(el) {
		var that = this,
			i, l;

		el.parentNode.removeChild(el);
		that.refresh();
	},
	
	dragEnd: function (e) {
		var that = this, i, l, j, k, order = '';

		if (!that.dragging) {
			delete that.activeContainer;
			delete that.startContainer;
			delete that.oldActiveContainer;
			delete that.activeDraggable;
			return;
		}

		that.draghelp.style.visibility = 'hidden';
		that.draghelp.style.webkitTransform = translateOpen + '0,0' + translateClose;
		that.draghelp.innerHTML = '';
		that.activeDraggable.className = that.activeDraggable.className.replace(/(^|\s)activeDraggable(\s|$)/gi, '');

		// Throw Away
		if (that.options.onThrowAway && that.throwAway && that.activeDraggable && that.startContainer==that.activeContainer) {
			that.options.onThrowAway.call(that, that.activeDraggable);
		}

		var draggedItem;
		// On container change
		if (that.options.onChange) {
			for (i=0, l=that.containers.length; i<l; i++) {
				order = '';
			
				for (j=0, k=that.draggables[i].length; j<k; j++) {
					order+= that.draggables[i][j]._order + ',';
				}
			
				if (order != that.containers[i]._order) {
					draggedItem = that.containers[i];
					that.options.onChange.call(that, that.containers[i]);
				}
			}
		}

		that.dragging = false;

		// On drag end
		if (that.options.onDragEnd) {
			that.options.onDragEnd.call(that,that.activeDraggable);
		}

		that.refresh(true);

		that.activeContainer = null;
		that.startContainer = null;
		that.oldActiveContainer = null;
		that.activeDraggable = null;

		delete that.activeContainer;
		delete that.startContainer;
		delete that.oldActiveContainer;
		delete that.activeDraggable;
	}
}

// Is translate3d compatible?
var has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()),
	// Translate3d helper
	translateOpen = 'translate' + (has3d ? '3d(' : '('),
	translateClose = has3d ? ',0)' : ')';

window.dnd = dnd;
})();