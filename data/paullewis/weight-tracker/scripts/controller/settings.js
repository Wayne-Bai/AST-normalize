/**
 * Controller for the settings view.
 * @license see /LICENSE
 */
WT.Controller.Settings = function() {

  var elementId = 'settings-view';
  var viewElement = document.getElementById(elementId);
  var view = new WT.View.Settings(elementId);

  this.init = function () {};

  this.show = function() {
    view.show();
  };

  this.hide = function() {
    view.hide();
  };
};

WT.Controller.Settings.prototype = new WT.Controller.Base();
