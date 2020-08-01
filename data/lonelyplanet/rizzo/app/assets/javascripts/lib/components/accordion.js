// Params: @args {
//   parent: parent element
//   multiplePanels: can you have multiple panels open
//   callback: optional function
//   animateHeights: boolean
//   openHeight: optional open height - assumed to outer height of panel if not specified
//   closedHeight: optional closed height - assumed to outer height of panel if not specified
// }

define([ "jquery" ], function($) {

  "use strict";

  var defaults = {
    multiplePanels: false,
    animateHeights: false,
    openPadding: 0
  };

  function Accordion(args) {
    this.config = $.extend({}, defaults, args);
    this.$parent = $(this.config.parent);
    this.refresh();

    if (!this.state) {
      this._init();
    }
  }

  Accordion.prototype._init = function() {
    var _this = this;

    this.$parent.on("click", ".js-accordion-trigger", function(e) {
      e.preventDefault();

      if (_this.state !== "blocked") {
        var $target = $(e.target).closest(".js-accordion-item");
        _this.togglePanel($target.index());
      }
    });

    this.state = "active";

    this.config.callback && this.config.callback(this.$parent);
  };

  Accordion.prototype._prepare = function() {
    var i, len, $panel, open, closed;

    for (i = 0, len = this.$panels.length; i < len; i++) {
      $panel = this.$panels.eq(i);

      closed = this.config.closedHeight || $panel.find(".js-accordion-trigger").outerHeight();
      open = this.config.openHeight || closed + $panel.find(".js-accordion-panel").outerHeight() + this.config.openPadding;

      $panel.data({
        open: open,
        closed: closed
      });
    }
  };

  Accordion.prototype._sanitizePanel = function(panel) {
    if (typeof panel === "number") {
      return this.$panels.eq(panel);
    } else if (typeof panel === "string") {
      return this.$parent.find(panel);
    } else if (panel.jquery) {
      return panel;
    }
  };

  Accordion.prototype.refresh = function() {
    this.$panels = this.$parent.find(".js-accordion-item");

    if (this.config.animateHeights) {
      this._prepare();
    }

    this.closeAllPanels();
  };

  Accordion.prototype.block = function() {
    this.state = "blocked";
  };

  Accordion.prototype.unblock = function() {
    this.state = "active";
  };

  Accordion.prototype.togglePanel = function(panel) {
    var $panel = this._sanitizePanel(panel);

    if ($panel.hasClass("is-open")) {
      this.closePanel($panel);
    } else {
      this.openPanel($panel);
    }
  };

  Accordion.prototype.openPanel = function(panel) {
    var $panel = this._sanitizePanel(panel);

    if (!this.config.multiplePanels) {
      this.closeAllPanels();
    }

    $panel.removeClass("is-closed").addClass("is-open");

    if (this.config.animateHeights) {
      $panel.height($panel.attr("data-open"));
    }
  };

  Accordion.prototype.closePanel = function(panel) {
    var $panel = this._sanitizePanel(panel);

    $panel.removeClass("is-open").addClass("is-closed");

    if (this.config.animateHeights) {
      $panel.height($panel.attr("data-closed"));
    }
  };

  Accordion.prototype.closeAllPanels = function() {
    var i, len;

    for (i = 0, len = this.$panels.length; i < len; i++) {
      this.closePanel(this.$panels.eq(i), true);
    }
  };

  return Accordion;

});
