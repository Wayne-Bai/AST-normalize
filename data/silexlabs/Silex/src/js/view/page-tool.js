/**
 * Silex, live web creation
 * http://projects.silexlabs.org/?/silex/
 *
 * Copyright (c) 2012 Silex Labs
 * http://www.silexlabs.org/
 *
 * Silex is available under the GPL license
 * http://www.silexlabs.org/silex/silex-licensing/
 */

/**
 * @fileoverview The Silex PageTool class displays the list of pages
 *     and let the user interact with them.
 * @see silex.model.Page
 *
 */

goog.provide('silex.view.PageTool');

goog.require('goog.dom');

goog.require('silex.model.PageData');



/**
 * @constructor
 *
 * @param {Element} element   container to render the UI
 * @param  {silex.types.Controller} controller  structure which holds
 *                                  the controller instances
 */
silex.view.PageTool = function(element, controller) {
  // store references
  this.element = element;
  this.controller = controller;
};


/**
 * page list based on what is passed to redraw
 * @type {Array.<silex.model.PageData>} array of pages for the opened website
 * @see silex.model.PageData
 */
silex.view.PageTool.prototype.pages = [];


/**
 * add listeners on the tool container
 * called by the app constructor
 */
silex.view.PageTool.prototype.buildUi = function() {
  // listen for the click on a page
  goog.events.listen(this.element, goog.events.EventType.CLICK, function(e) {
    if (goog.dom.classlist.contains(e.target, 'delete')) {
      // remove the page
      this.removePageAtIndex(this.getCellIndex(e.target.parentNode.parentNode));
    }
    else if (goog.dom.classlist.contains(e.target, 'label')) {
      // rename the page
      this.renamePageAtIndex(this.getCellIndex(e.target.parentNode.parentNode));
    }
    else {
      // select page
      var cellIndex = this.getCellIndex(e.target.parentNode);
      if (cellIndex >= 0) {
        this.setSelectedIndex(cellIndex, true);
      }
    }
    e.preventDefault();
  }, false, this);
};


/**
 * refresh the pages
 * find all pages in the dom
 * @param   {Array.<Element>} selectedElements the elements currently selected
 * @param   {Document} contentDocument  the document to use
 * @param   {Array.<string>} pageNames   the names of the pages which appear in the current HTML file
 * @param   {string}  currentPageName   the name of the current page
 */
silex.view.PageTool.prototype.redraw = function(selectedElements, contentDocument, pageNames, currentPageName) {
  // prepare the data for the template
  // make an array with name, displayName, linkName and className
  var idx = 0;
  this.pages = pageNames.map(goog.bind(function(pageName) {
    var res = {
      'name': pageName,
      'displayName': contentDocument.getElementById(pageName).innerHTML,
      'linkName': '#!' + pageName,
      'idx': idx++
    };
    if (currentPageName === pageName) {
      res.className = 'ui-selected';
    }
    else {
      res.className = '';
    }
    return res;
  }, this));

  // refresh the list with new pages
  var container = goog.dom.getElementByClass('page-tool-container', this.element);
  var templateHtml = goog.dom.getElementByClass('page-tool-template', this.element).innerHTML;
  container.innerHTML = silex.utils.Dom.renderList(templateHtml, this.pages);
};


/**
 * user wants to remove a page
 * @param    {number} idx index of the page
 */
silex.view.PageTool.prototype.removePageAtIndex = function(idx) {
  this.controller.pageToolController.removePage(this.pages[idx].name);
};


/**
 * user wants to rename a page
 * @param    {number} idx index of the page
 */
silex.view.PageTool.prototype.renamePageAtIndex = function(idx) {
  this.controller.pageToolController.renamePage(this.pages[idx].name);
};


/**
 * set the selection of pages
 * @param    {number} idx
 * @param    {?boolean=} opt_notify    if true, then notify by calling the onChanged callback
 */
silex.view.PageTool.prototype.setSelectedIndex = function(idx, opt_notify) {
  // notify the controller
  if (opt_notify) this.controller.pageToolController.openPage(this.pages[idx].name);
};


/**
 * get the index of the given cell
 * @private
 * @param    {Element} element which represents the cell in the dom
 */
silex.view.PageTool.prototype.getCellIndex = function(element) {
  var pageIdx = element.getAttribute('data-page-idx');
  if (pageIdx) {
    return parseInt(pageIdx, 10);
  }
  else {
    return -1;
  }
};
