/*!
 * VisualEditor UserInterface DesktopSurface class.
 *
 * @copyright 2011-2014 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * A surface is a top-level object which contains both a surface model and a surface view.
 * This is the mobile version of the surface.
 *
 * @class
 * @extends ve.ui.Surface
 *
 * @constructor
 * @param {HTMLDocument|Array|ve.dm.LinearData|ve.dm.Document} dataOrDoc Document data to edit
 * @param {Object} [config] Configuration options
 */
ve.ui.DesktopSurface = function VeUiDesktopSurface() {
	// Parent constructor
	ve.ui.Surface.apply( this, arguments );

	// Properties
	this.$menus = this.$( '<div>' );

	// Initialization
	this.localOverlay.$element.append( this.$menus );
	this.$menus.append( this.context.$element );
};

/* Inheritance */

OO.inheritClass( ve.ui.DesktopSurface, ve.ui.Surface );

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.DesktopSurface.prototype.createContext = function () {
	return new ve.ui.DesktopContext( this, { $: this.$ } );
};

/**
 * @inheritdoc
 */
ve.ui.DesktopSurface.prototype.createDialogWindowManager = function () {
	return new OO.ui.WindowManager( { factory: ve.ui.windowFactory } );
};
