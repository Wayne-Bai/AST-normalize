/*!
 * jquery.fancytree.gridnav.js
 *
 * Support keyboard navigation for trees with embedded input controls.
 * (Extension module for jquery.fancytree.js: https://github.com/mar10/fancytree/)
 *
 * Copyright (c) 2013, Martin Wendt (http://wwWendt.de)
 *
 * Released under the MIT license
 * https://github.com/mar10/fancytree/wiki/LicenseInfo
 *
 * @version DEVELOPMENT
 * @date DEVELOPMENT
 */

;(function($, window, document, undefined) {

"use strict";


/*******************************************************************************
 * Private functions and variables
 */

// Allow these navigation keys even when input controls are focused

var	KC = $.ui.keyCode,
	// which keys are *not* handled by embedded control, but passed to tree
	// navigation handler:
	NAV_KEYS = {
		"text": [KC.UP, KC.DOWN],
		"checkbox": [KC.UP, KC.DOWN, KC.LEFT, KC.RIGHT],
		"radiobutton": [KC.UP, KC.DOWN, KC.LEFT, KC.RIGHT],
		"select-one": [KC.LEFT, KC.RIGHT],
		"select-multiple": [KC.LEFT, KC.RIGHT]
	};


function findNeighbourTd($target, keyCode){
	var $td = $target.closest("td");
	switch( keyCode ){
		case KC.LEFT:
			return $td.prev();
		case KC.RIGHT:
			return $td.next();
		case KC.UP:
			return $td.parent().prevAll(":visible").first().find("td").eq($td.index());
		case KC.DOWN:
			return $td.parent().nextAll(":visible").first().find("td").eq($td.index());
	}
	return null;
}

/*******************************************************************************
 * Extension code
 */
$.ui.fancytree.registerExtension({
	name: "gridnav",
	version: "0.0.1",
	// Default options for this extension.
	options: {
		autofocusInput:   false,  // Focus first embedded input if node gets activated
		handleCursorKeys: true,   // Allow UP/DOWN in inputs to move to prev/next node
		titlesTabbable:   true    // Add node title to TAB chain
	},

	treeInit: function(ctx){
		// gridnav requires the table extension to be loaded before itself
		this._requireExtension("table", true, true);
		this._super(ctx);

		this.$container.addClass("fancytree-ext-gridnav");

		// Activate node if embedded input gets focus (due to a click)
//		this.$container.on("focusin", "input", function(event){
		this.$container.on("focusin", function(event){
			var ctx2,
				node = $.ui.fancytree.getNode(event.target);

			// node.debug("INPUT focusin", event.target, event);
			if( node && !node.isActive() ){
				// Call node.setActive(), but also pass the event
				ctx2 = ctx.tree._makeHookContext(node, event);
				ctx.tree._callHook("nodeSetActive", ctx2, true);
			}
		});
	},
	nodeRender: function(ctx) {
		this._super(ctx);
		// Add every node title to the tab sequence
		if( ctx.options.gridnav.titlesTabbable === true ){
			$(ctx.node.span).find("span.fancytree-title").attr("tabindex", "0");
		}
	},
	// nodeRenderStatus: function(ctx) {
	// 	var opts = ctx.options.gridnav,
	// 		node = ctx.node;

	// 	this._super(ctx);

	//	// Note: Setting 'tabbable' only to the active node wouldn't help,
	//  // because the first row contains a tabbable input element anyway.
	// 	if( opts.titlesTabbable === "active" ){
	// 		if( node.isActive() ){
	// 			$(node.span) .find("span.fancytree-title") .attr("tabindex", "0");
	// 		}else{
	// 			$(node.span) .find("span.fancytree-title") .removeAttr("tabindex");
	// 		}
	// 	}
	// },
	nodeSetActive: function(ctx, flag) {
		var $outer,
			opts = ctx.options.gridnav,
			node = ctx.node,
			event = ctx.originalEvent || {},
			triggeredByInput = $(event.target).is(":input");

		flag = (flag !== false);

		this._super(ctx, flag);

		if( flag ){
			if( opts.titlesTabbable ){
				if( !triggeredByInput ) {
					$(node.span).find("span.fancytree-title").focus();
					node.setFocus();
				}
				// If one node is tabbable, the container no longer needs to be
				ctx.tree.$container.attr("tabindex", "-1");
				// ctx.tree.$container.removeAttr("tabindex");
			} else if( opts.autofocusInput && !triggeredByInput ){
				// Set focus to input sub input (if node was clicked, but not
				// when TAB was pressed )
				$outer = $(node.tr || node.span);
				$outer.find(":input:enabled:first").focus();
			}
		}
	},
	nodeKeydown: function(ctx) {
		var inputType, handleKeys, $td,
			opts = ctx.options.gridnav,
			event = ctx.originalEvent,
			$target = $(event.target);

		// jQuery
		inputType = $target.is(":input:enabled") ? $target.prop("type") : null;
		ctx.tree.debug("ext-gridnav nodeKeydown", event, inputType);

		if( inputType && opts.handleCursorKeys ){
			handleKeys = NAV_KEYS[inputType];
			if( handleKeys && $.inArray(event.which, handleKeys) >= 0 ){
				$td = findNeighbourTd($target, event.which);
				// ctx.node.debug("ignore keydown in input", event.which, handleKeys);
				if( $td && $td.length ) {
					$td.find(":input:enabled").focus();
					// Prevent Fancytree default navigation
					return false;
				}
			}
			return true;
		}
		ctx.tree.debug("ext-gridnav NOT HANDLED", event, inputType);
		return this._super(ctx);
	}
});
}(jQuery, window, document));
