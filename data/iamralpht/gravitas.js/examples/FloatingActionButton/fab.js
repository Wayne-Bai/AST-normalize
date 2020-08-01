'use strict';
// JavaScript implementation of a more physical Floating Action Button
/*
Copyright 2014 Ralph Thomas

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

(function() {

var overdamp = window.location.href.indexOf('overdamp') != -1;
/*
 * Now the interesting bit, a FAB menu item. The menu item has a spring which moves it from its natural layout
 * position to being against the current cursor position. The menu has a separate spring which moves menu items
 * from the origin to thier natural layout position.
 *
 * The menu item doesn't actually position itself, the menu does this with transforms derived from the spring
 * positions.
 */
function MenuItem(title, image) {
    // Build the DOM.
    this._container = document.createElement('div');
    this._container.className = 'fab-menu-item';
    this._launch = document.createElement('div');
    this._launch.className = 'fab-launch';
    this._container.appendChild(this._launch);
    this._label = document.createElement('div');
    this._label.className = 'fab-label';
    this._label.innerText = title;
    this._container.appendChild(this._label);
    this._icon = document.createElement('div');
    this._icon.className = 'fab-icon';
    if (image) {
        this._icon.style.backgroundImage = 'url(' + image + ')';
        this._icon.style.backgroundColor = 'transparent';
    }
    this._container.appendChild(this._icon);
    // We need a spring to tell us how far away we should be from the cursor.
    this._spring = new Gravitas.Spring(1, 400, overdamp ? 45 : 30); // 400 / 30 is slightly underdamped, so there will be a slight overbounce.
}
MenuItem.prototype.element = function() { return this._container; }
MenuItem.prototype.icon = function() { return this._icon; }
MenuItem.prototype.label = function() { return this._label; }
MenuItem.prototype.launch = function() { return this._launch; }
MenuItem.prototype.setCursorIsClose = function(isCursorClose) { this._spring.setEnd(isCursorClose ? 1 : 0); }
MenuItem.prototype.cursorAttraction = function() { return this._spring.x(); }
MenuItem.prototype.done = function() { return this._spring.done(); }

/*
 * Magic numbers for the FloatingActionButton.
 */
var ITEM_SIZE = 80; // The height of an item, including padding.
var STICKINESS = 20; // How "sticky" an item is as you start to track left.

/*
 * This is the menu itself. It creates an item for the cursor, and then a bunch of items for each option.
 * It lays them out in a vertical stack. It listens for touch events to open the stack and to move the
 * cursor item around. The cursor is the main button.
 */
function FloatingActionButton(title, image, items) {
    // The spring that opens the menu.
    this._openSpring = new Gravitas.Spring(1, 400, overdamp ? 40 : 25);
    this._cursorSpring = new Gravitas.Spring(1, 300, overdamp ? 30 : 20);
    this._maskSpring = new Gravitas.Spring(1, 800, 80);
    this._container = document.createElement('div');
    this._container.className = 'fab-menu';
    this._mask = document.createElement('div');
    this._mask.className = 'fab-mask';
    this._container.appendChild(this._mask);


    this._items = [];
    for (var i = 0; i < items.length; i++) {
        var mi = new MenuItem(items[i].title, items[i].image);
        mi.element().style.pointerEvents = 'none';
        this._items.push(mi);
        this._container.appendChild(mi.element());
    }

    this._cursor = new MenuItem(title, image);
    this._container.appendChild(this._cursor.element());
    this._cursor.icon().textContent = '+';

    var isOpen = false;
    var self = this;
    var touchInfo = { trackingID: -1, maxDy: 0 };

    function touchStart(e) {
        if (touchInfo.trackingID != -1) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.type == 'touchstart') {
            touchInfo.trackingID = e.changedTouches[0].identifier;
            touchInfo.x = e.changedTouches[0].pageX;
            touchInfo.y = e.changedTouches[0].pageY;
        } else {
            if (e.target != self._cursor.icon()) return;
            touchInfo.trackingID = 'mouse';
            touchInfo.x = e.screenX;
            touchInfo.y = e.screenY;
        }
        touchInfo.maxDy = 0;
        touchInfo.wasOpen = isOpen;
        isOpen = true;
        self._openSpring.setEnd(1);
        self._maskSpring.setEnd(2);
        self._layout();
    }

    function findDelta(e) {
        if (e.type == 'touchmove' || e.type == 'touchend') {
            for (var i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier == touchInfo.trackingID) {
                    return {x: e.changedTouches[i].pageX - touchInfo.x, y: e.changedTouches[i].pageY - touchInfo.y};
                }
            }
        } else {
            return {x: e.screenX - touchInfo.x, y: e.screenY - touchInfo.y};
        }
        return null;
    }

    function touchMove(e) {
        if (touchInfo.trackingID == -1) return;
        e.preventDefault();
        e.stopPropagation();
        var delta = findDelta(e);
        if (!delta) return;
        self._updateCursor(delta.y, delta.x, true);
        touchInfo.maxDy = Math.max(touchInfo.maxDy, Math.abs(delta.y));
    }
    function touchEnd(e) {
        if (touchInfo.trackingID == -1) return;
        e.preventDefault();
        e.stopPropagation();
        var delta = findDelta(e);
        if (!delta) return;

        touchInfo.trackingID = -1;
        if (touchInfo.maxDy == 0 && !touchInfo.wasOpen) return;
        self._updateCursor(0, 0, false);
        isOpen = false;
        self._openSpring.setEnd(0);
        self._maskSpring.setEnd(0);
        self._layout();
    }

    this._cursor.element().addEventListener('touchstart', touchStart, true);
    this._cursor.element().addEventListener('touchmove', touchMove, true);
    this._cursor.element().addEventListener('touchend', touchEnd, true);
    
    document.body.addEventListener('mousedown', touchStart, false);
    document.body.addEventListener('mousemove', touchMove, false);
    document.body.addEventListener('mouseup', touchEnd, false);

    this._cursorPosition = 0;
    this._selected = 0;

    this._layout();
}
var id = window.WebKitCSSMatrix ? new WebKitCSSMatrix() : -1;

function round(amount, quanta) {
    return (Math.round(amount / quanta) * quanta);
}

function setCircleClipPath(element, size) {
    // Chrome supports the new syntax, iOS 7 only manages the old syntax.
    var oldSyntax = 'circle(50%, 50%, ' + round(size, 1) + 'px)';
    var newSyntax = 'circle(' + round(size, 1) + 'px)';
    element.style.webkitClipPath = newSyntax;
    if (element.style.webkitClipPath != newSyntax)
        element.style.webkitClipPath = oldSyntax;
}

FloatingActionButton.prototype.element = function() { return this._container; }
FloatingActionButton.prototype._layout = function() {
    function clamp(x, min, max) { return (x < min ? min : (x > max ? max : x)); }

    var done = true;

    var openAmount = this._openSpring.x();
    var cursorPosition = this._cursorPosition * this._cursorSpring.x();

    done &= this._openSpring.done();
    done &= this._cursorSpring.done();
    
    var y = 0;
    for (var i = 0; i < this._items.length; i++) {
        var item = this._items[i];

        done &= item.done();

        y -= ITEM_SIZE;
        var naturalPosition = y * openAmount;
        var cursorAttraction = item.cursorAttraction();
        // The actual position is somewhere between the natural position (which is the layout
        var computedPosition = naturalPosition * (1 - cursorAttraction) + cursorPosition * cursorAttraction;
        var x = this._cursorX * cursorAttraction;

        x = round(x, 0.1);
        computedPosition = round(computedPosition, 0.1);
        cursorAttraction = round(cursorAttraction, 0.01);

        //if (almostZero(x, 0.1)) x = 0;
        //if (almostZero(computedPosition, 0.1)) computedPosition = 0;
        //if (almostZero(cursorAttraction, 0.01)) cursorAttraction = 0;

        item.element().style.webkitTransform = 'translate3D(0, ' + computedPosition + 'px, 0)';
        item.element().style.opacity = clamp(openAmount * 1.3 - 0.1, 0, 1);
        item.icon().style.webkitTransform = id.translate(x, 0).scale(0.8 + cursorAttraction * 0.4) + ' translateZ(0)';
        item.label().style.opacity = clamp(1 + x / 50, 0, 1);

        var maskSize = Math.abs(x);
        var launchOffset = 0;

        if (maskSize > 160) {
            launchOffset = round(-(maskSize - 160), 1);
            // Don't clamp the mask size here, it doesn't look good.
        }

        item.launch().style.webkitTransform = id.translate(launchOffset, 0);
        setCircleClipPath(item.launch(), maskSize);
    }
    this._cursor.icon().style.webkitTransform = id.translate(round(this._cursorX * this._cursorSpring.x(), 1), cursorPosition).scale(1 - openAmount * 0.2).rotate(135 * round(openAmount, 0.01)) + ' translateZ(0)';
    this._cursor.label().style.opacity = round(openAmount, 0.001);
    this._cursor.label().style.webkitTransform = 'translate3D(' + round(30 + openAmount * -30, 1) + 'px, 0, 0)';
    this._mask.style.webkitTransform = 'scale(' + round(this._maskSpring.x(), 0.001) + ')';
    this._mask.style.opacity = round(clamp(this._maskSpring.x() * 0.5, 0, 1), 0.001);

    done &= this._maskSpring.done();

    var self = this;
    if (!done) {
        if (this._requestedFrame) return;
        this._requestedFrame = requestAnimationFrame(function() {
            self._requestedFrame = 0;
            self._layout();
        });
    }
}
var zIndex = 1;
FloatingActionButton.prototype._updateCursor = function(position, x, isActive) {
    if (!isActive) {
        this._cursorSpring.setEnd(0);
        this._selected = 0;
        for (var i = 0; i < this._items.length; i++) {
            this._items[i].setCursorIsClose(false);
        }
        this._layout();
        return;
    }
    if (x > 0) x /= 4;
    this._cursorX = x;
    this._cursorSpring.snap(1);

    // Manipulate the position so that when you track to the left, you get more stuck on that item.
    var stickiness = Math.max(Math.abs(x / STICKINESS), 1);
    var snap = -this._selected * ITEM_SIZE;
    position = (position - snap) / stickiness + snap;

    this._cursorPosition = position;

    // Figure out which item should be selected.
    var selected = ~~Math.round(-position / ITEM_SIZE);
    for (var i = 0; i < this._items.length; i++) {
        var item = this._items[i];
        var selectionIndex = i + 1;
        item.setCursorIsClose(selectionIndex == selected);
        if (selected != this._selected && selectionIndex == selected)
            item.element().style.zIndex = (++zIndex);
    }
    this._selected = selected;

    this._layout();
}

/*
 * Actually create the menu.
 */
if (id != -1) {
    var fabExample = document.getElementById('fabExample');
    if (!fabExample) return;

    var testMenu = new FloatingActionButton(
        'Cancel', null,//'img/compose.png', 
        [
            { title: 'Paul Krugman', image: 'img/krugman.png' },
            { title: 'Sophocles', image: 'img/greek.jpg' },
            { title: 'Ralph Thomas', image: 'img/ralpht.jpg' },
        ]);

    fabExample.appendChild(testMenu.element());
}
})();
