/*
 * 
 * Yodel - an unofficial Yik Yak client for Windows Phone
 * (c) 2014-2015 soren121 and contributors.
 *
 * js/pulltorefresh.js
 *
 * Forked from David Washington's PTR implementation:
 * http://github.com/dwcares/pulltorefresh
 * 
 * Licensed under the terms of the MIT license.
 * See LICENSE.txt for more information.
 * 
 * http://github.com/soren121/yodel
 * 
 */


(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var lang = WinJS.Resources;

    var _pullBoxHeight = 80;
    var MS_MANIPULATION_STATE_ACTIVE = 1; // A contact is touching the surface and interacting with content
    var MS_MANIPULATION_STATE_INERTIA = 2; // The content is still moving, but contact with the surface has ended 
    
    WinJS.Namespace.define("Yodel.UI", {
        PTR: WinJS.Class.define(function () {
            // Setup variables
            this._outerScroller = document.querySelector(".outer_scroller");
            this._innerScroller = document.querySelector(".inner_scroller");
            this._pullLabel = document.querySelector(".pull_label");
            this._pullArrow = document.querySelector(".pull_arrow");
        }, {
            init: function () {
                // Set the initial scroll past the pull box
                if (this._outerScroller) {
                    document.querySelector(".pull_box").style.visibility = "visible";
                    this._outerScroller.scrollTop = _pullBoxHeight;

                    // Update the arrow rotation based on scroll postion
                    this._outerScroller.addEventListener("scroll", this.onScroll.bind({ context: this }));

                    // Listen for panning events (different than scroll) and detect when we're in the over pan state
                    this._outerScroller.addEventListener("MSManipulationStateChanged", this.onManipualationStateChanged.bind({ context: this }));
                }
            },

            onScroll: function (e) {
                // Change the label once you pull to the top
                if (e.target.scrollTop === 0) {
                    this.context._pullLabel.innerText = lang.getString("ptr_label-active").value;
                    WinJS.Utilities.addClass(this.context._pullArrow, "up");
                }
                else {
                    this.context._pullLabel.innerText = lang.getString("ptr_label-default").value;
                    WinJS.Utilities.removeClass(this.context._pullArrow, "up");
                }
            },

            onManipualationStateChanged: function (e) {
                var context = this.context;

                // Check to see if they lifted while pulled to the top
                if (e.currentState === MS_MANIPULATION_STATE_INERTIA &&
                    e.lastState === MS_MANIPULATION_STATE_ACTIVE &&
                    e.target.scrollTop === 0) {

                    // Scroll back to the top of the list
                    e.target.msZoomTo({
                        contentX: 0,
                        contentY: _pullBoxHeight,
                        viewportX: 0,
                        viewportY: 0
                    });

                    // Change the loading state and prevent panning
                    WinJS.Utilities.addClass(e.target, "loading");
                    e.target.disabled = true;

                    context.refreshItemsAsync().then(function () {
                        // After the refresh, return to the default state
                        WinJS.Utilities.removeClass(e.target, "loading");
                        e.target.disabled = false;
                        WinJS.Utilities.removeClass(context._pullArrow, "up");
                    });
                }
            },

            refreshItemsAsync: function () {
                var feed = new Yodel.feed();
                Yodel.data[nav.state.method] = null;
                var promise = feed.load(nav.state.method, this._innerScroller.id, { refresh: true });
                return promise;
            }
        })
    });
})();
